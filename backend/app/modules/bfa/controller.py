from flask import jsonify, request, Response
from .models import LisProject, LisMeasurePerson, LisProjectOrder, BsBasicCenterHr, PmSheetControl
from app.db.db import db
from sqlalchemy import cast, func, String


class BfaController:
    def get_tasks(self):
        """
        获取待办任务列表。
        如果提供了 person_id，则只返回该人员的任务。
        任务过滤条件为 measure_tag = '0' (未完成) 和 measure_status = '1' (已下发)。
        """
        # 品牌和开发规模的映射关系
        brand_map = {
            '1': 'WEY', '2': '坦克', '3': '沙龙', '4': '哈弗', '5': '欧拉',
            '6': '皮卡', '7': 'HEM', '8': '重卡', '9': '赛车', '10': '光束', '11': '平台项目'
        }
        sml_map = {'0': 'SS', '1': 'S', '2': 'M', '3': 'L'}
        
        try:
            # 从请求参数中获取人员ID
            person_id = request.args.get('person_id')

            # 基础查询，从测算人员表开始，关联项目表和部门表
            query = db.session.query(
                LisMeasurePerson,
                LisProject,
                BsBasicCenterHr.department_name
            ).join(
                LisProject,
                cast(LisProject.id, String(32)).collate('utf8mb4_general_ci') == LisMeasurePerson.project_id
            ).join( # 使用 join 以防人员没有对应的部门信息
                BsBasicCenterHr,
                LisMeasurePerson.person_department == BsBasicCenterHr.department_id
            )

            # 固定过滤条件：未完成且已下发的项目
            query = query.filter(
                LisProject.measure_tag == '0',
                LisProject.measure_status == '1'
            )
            
            # 如果提供了人员ID，则按人员进行过滤
            if person_id:
                query = query.filter(LisMeasurePerson.person == person_id)

            user_tasks = query.all()

            # 格式化查询结果
            task_list = [
                {
                    'id': str(project.id),
                    'name': project.measures_project,
                    'department': department_name if department_name else person.person_department,
                    'department_id': person.person_department,
                    'calculator': person.person,
                    'brand': brand_map.get(project.brand, project.brand),
                    'spec': sml_map.get(project.sml, project.sml),
                    'task_person_id': str(person.id)
                }
                for person, project, department_name in user_tasks
            ]

            return jsonify(data=task_list)
        except Exception as e:
            print(f"获取任务列表时出错: {e}")
            return jsonify(error="获取任务列表失败", message=str(e)), 500

    def get_task_details(self, task_id):
        """
        根据任务ID、人员ID和部门ID获取唯一的项目详细信息，并附加部门权限。
        """
        try:
            person_id = request.args.get('person_id')
            department_id = request.args.get('department_id')

            if not all([person_id, department_id]):
                return jsonify(error="必须提供 person_id 和 department_id"), 400

            # 映射关系
            status_map = {'0': '编制中', '1': '测算中', '2': '财务汇总中', '3': '财务审批中', '4': '测算完成', '10': '已作废'}
            brand_map = {'1': 'WEY', '2': '坦克', '3': '沙龙', '4': '哈弗', '5': '欧拉', '6': '皮卡', '7': 'HEM', '8': '重卡', '9': '赛车', '10': '光束', '11': '平台项目'}
            sml_map = {'0': 'SS', '1': 'S', '2': 'M', '3': 'L'}

            # 基于三个唯一标识符进行精确查询
            query_result = db.session.query(
                LisProject,
                LisMeasurePerson,
                BsBasicCenterHr.department_name
            ).join(
                LisProject,
                cast(LisProject.id, String(32)).collate('utf8mb4_general_ci') == LisMeasurePerson.project_id
            ).outerjoin(
                BsBasicCenterHr,
                LisMeasurePerson.person_department == BsBasicCenterHr.department_id
            ).filter(
                LisMeasurePerson.project_id == str(task_id),
                LisMeasurePerson.person == person_id,
                LisMeasurePerson.person_department == department_id
            ).one_or_none()

            if not query_result:
                return jsonify(error="指定的任务未找到"), 404

            project, person, department_name = query_result
            
            # 查询关联的订单，以聚合动力配置和订单信息
            orders = db.session.query(LisProjectOrder).filter(LisProjectOrder.project_id == str(task_id)).all()
            power_configs = ",".join(list(set([order.power_conf for order in orders if order.power_conf])))
            order_info = ",".join(list(set([order.order_name for order in orders if order.order_name])))

            # 根据部门ID查询可见表权限
            visible_sheets = []
            if person and person.person_department:
                sheets = db.session.query(PmSheetControl.see_sheet).filter(
                    PmSheetControl.pm_department == person.person_department
                ).all()
                visible_sheets = [sheet[0] for sheet in sheets]

            # 组装返回的任务详情数据
            task_details = {
                'projectId': str(project.id),
                'projectName': project.measures_project,
                'department': department_name or person.person_department,
                'brand': brand_map.get(project.brand, project.brand),
                'scale': sml_map.get(project.sml, project.sml),
                'status': status_map.get(project.measure_status, project.measure_status),
                'calculator': person.person,
                'createdAt': project.create_time.strftime('%Y-%m-%d %H:%M:%S') if project.create_time else '',
                'updatedAt': project.update_time.strftime('%Y-%m-%d %H:%M:%S') if project.update_time else '',
                'orderInfo': order_info,
                'powerConfig': power_configs,
                'permissions': {
                    'departmentId': person.person_department,
                    'visible_sheets': visible_sheets
                }
            }
            return jsonify(data=task_details)
        except Exception as e:
            print(f"获取任务详情时出错: {e}")
            return jsonify(error="获取任务详情失败", message=str(e)), 500

    def get_historical_projects(self):
        """
        获取历史测算项目列表 (measure_tag = '1')。
        """
        # 品牌和开发规模的映射关系
        brand_map = {
            '1': 'WEY', '2': '坦克', '3': '沙龙', '4': '哈弗', '5': '欧拉',
            '6': '皮卡', '7': 'HEM', '8': '重卡', '9': '赛车', '10': '光束', '11': '平台项目'
        }
        sml_map = {'0': 'SS', '1': 'S', '2': 'M', '3': 'L'}
        try:
            # 查询已完成的项目
            historical_projects = db.session.query(LisProject).filter(LisProject.measure_status == '4').all()
            history_list = []
            for project in historical_projects:
                # 为每个历史项目找到其主要负责人
                person = db.session.query(LisMeasurePerson).filter(
                    LisMeasurePerson.project_id == str(project.id)
                ).order_by(LisMeasurePerson.id.asc()).first()
 
                department_name = person.person_department if person else ''
                if person and person.person_department:
                    # 查询部门名称，使用 .first() 避免因重复ID导致 .scalar() 报错
                    department_result = db.session.query(BsBasicCenterHr.department_name).filter(
                        BsBasicCenterHr.department_id == person.person_department
                    ).first()
                    if department_result:
                        department_name = department_result[0]
 
                history_list.append({
                    'id': str(project.id),
                    'name': project.measures_project,
                    'department': department_name,
                    'calculator': person.person if person else 'N/A',
                    'brand': brand_map.get(project.brand, project.brand), # 直接返回映射后的文本
                    'spec': sml_map.get(project.sml, project.sml),      # 直接返回映射后的文本
                })
            return jsonify(data=history_list)
        except Exception as e:
            print(f"获取历史项目时出错: {e}")
            return jsonify(error="获取历史项目失败", message=str(e)), 500

    def get_all_persons(self):
        """
        获取所有唯一的接口人及其所属部门列表。
        使用人员姓名(`person`)作为唯一标识，并聚合其所属的所有部门。
        """
        try:
            # 在数据库层面使用 GROUP_CONCAT 聚合部门名称，并按人员姓名分组
            persons_query = db.session.query(
                LisMeasurePerson.person,
                func.group_concat(BsBasicCenterHr.department_name.distinct()).label('departments')
            ).outerjoin(  # 使用 outerjoin 确保没有部门信息的人员也能被查询到
                BsBasicCenterHr,
                LisMeasurePerson.person_department == BsBasicCenterHr.department_id
            ).filter(
                LisMeasurePerson.person.isnot(None),  # 过滤掉姓名为空的记录
                LisMeasurePerson.person != ''
            ).group_by(
                LisMeasurePerson.person
            ).all()

            person_list = [
                {
                    "id": p.person,  # 使用 person 姓名作为唯一ID
                    "name": p.person,
                    "department": p.departments if p.departments else 'N/A'  # 如果没有部门信息，则显示'N/A'
                }
                for p in persons_query
            ]
            
            return jsonify(data=person_list)
        except Exception as e:
            print(f"获取人员列表时出错: {e}")
            return jsonify(error="获取人员列表失败", message=str(e)), 500

    def handle_chat(self, data):
        """
        处理聊天请求，调用AI服务并以流式响应返回结果。
        """
        from app.app import ai_service
        user_message = data.get('message')
        if not user_message:
            return jsonify(error="未提供消息"), 400
        
        # 为AI服务设置系统提示
        system_prompt = "你是一个测算专家，请根据用户的问题给出解答。保证回答尽量简洁"
        
        # 使用生成器函数进行流式响应
        def generate():
            for chunk in ai_service.get_streaming_chat_completion(user_message, system_prompt=system_prompt):
                yield chunk
        
        return Response(generate(), mimetype='text/plain')

    def generate_calculation(self, data):
        """
        生成测算表的函数（待实现）。
        """
        # TODO: 实现测算生成逻辑
        task_id = data.get('task_id')
        reference_project_id = data.get('reference_project_id')
        mock_timesheet = [
            {"person": "Dev 1", "hours": 40},
            {"person": "Dev 2", "hours": 32},
        ]
        return jsonify(data={"calculation_id": "calc-123", "timesheet": mock_timesheet})

    def modify_calculation(self, data):
        """
        根据自然语言指令修改测算表的函数（待实现）。
        """
        # TODO: 实现基于自然语言指令的测算修改逻辑
        command = data.get('command')
        current_timesheet = data.get('current_timesheet')
        # 模拟修改操作
        if "add" in command:
            current_timesheet.append({"person": "New Dev", "hours": 20})
        
        return jsonify(data={"updated_timesheet": current_timesheet})

    def validate_calculation(self, data):
        """
        验证测算表的函数（待实现）。
        """
        # TODO: 实现验证逻辑
        timesheet = data.get('timesheet')
        is_valid = all(isinstance(entry.get('hours', 0), int) and entry.get('hours', 0) > 0 for entry in timesheet)
        errors = [] if is_valid else ["发现无效的工时。"]
        return jsonify(data={"is_valid": is_valid, "errors": errors})

    def submit_task(self, task_id, data):
        """
        提交任务的函数（待实现）。
        """
        # TODO: 实现提交逻辑
        timesheet = data.get('timesheet')
        print(f"正在为任务 {task_id} 提交工时表: {timesheet}")
        return jsonify(data={"status": "success"})

    def get_reference_projects(self, task_id, department_id):
        """
        获取指定部门的历史参考项目列表, 每个项目只返回一个主要的测算人。
        """
        if not department_id:
            return jsonify(error="必须提供 department_id"), 400

        brand_map = {
            '1': 'WEY', '2': '坦克', '3': '沙龙', '4': '哈弗', '5': '欧拉',
            '6': '皮卡', '7': 'HEM', '8': '重卡', '9': '赛车', '10': '光束', '11': '平台项目'
        }
        sml_map = {'0': 'SS', '1': 'S', '2': 'M', '3': 'L'}

        try:
            # 创建一个子查询，为每个项目找到ID最小的测算人记录，以确保唯一性
            # 这样可以避免同一个项目因为有多个测算人而出现重复
            first_person_subq = db.session.query(
                LisMeasurePerson.project_id,
                func.min(LisMeasurePerson.id).label('min_person_id')
            ).group_by(LisMeasurePerson.project_id).subquery()

            # 主查询，获取项目信息
            query = db.session.query(
                LisProject,
                LisMeasurePerson,
                BsBasicCenterHr.department_name
            ).join(
                first_person_subq,
                cast(LisProject.id, String(32)).collate('utf8mb4_general_ci') == first_person_subq.c.project_id
            ).join(
                LisMeasurePerson,
                db.and_(
                    LisMeasurePerson.project_id == first_person_subq.c.project_id,
                    LisMeasurePerson.id == first_person_subq.c.min_person_id
                )
            ).join(
                BsBasicCenterHr,
                LisMeasurePerson.person_department == BsBasicCenterHr.department_id
            ).filter(
                LisProject.measure_status == '4',
                LisMeasurePerson.person_department == department_id,
                cast(LisProject.id, String(32)) != task_id
            )

            results = query.all()

            project_list = [
                {
                    'id': str(project.id),
                    'projectName': project.measures_project,
                    'department': department_name,
                    'calculator': person.person,
                    'brand': brand_map.get(project.brand, project.brand),
                    'spec': sml_map.get(project.sml, project.sml),
                }
                for project, person, department_name in results
            ]

            return jsonify(data=project_list)
        except Exception as e:
            print(f"获取参考项目列表时出错: {e}")
            return jsonify(error="获取参考项目列表失败", message=str(e)), 500