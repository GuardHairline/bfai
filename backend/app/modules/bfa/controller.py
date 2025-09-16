from flask import jsonify, request, Response
from sqlalchemy import func, String, cast, text

from app.db.db import db
from .models import LisProject, LisMeasurePerson, LisProjectOrder, BsBasicCenterHr


class BfaController:
    """
    BFA模块的控制器，负责处理业务逻辑。
    """
    def get_tasks(self):
        """
        获取待办任务列表。
        如果提供了 person_id，则只返回该人员的任务。
        任务是 measure_tag = '0' (未完成) 和 measure_status = '1' (已下发) 的项目。
        """
        person_id = request.args.get('person_id')

        # 品牌ID到名称的映射
        brand_map = {
            '1001': '本项目', '1002': '区域', '1003': '其他', '1004': '城市公司',
            '1005': '战区', '1006': '集团'
        }
        # 开发规模ID到名称的映射
        sml_map = {
            '1': 'S', '2': 'M', '3': 'L'
        }

        try:
            # 基础查询，从测算人员表开始
            query = db.session.query(
                LisMeasurePerson.id.label('task_person_id'),
                LisProject.id,
                LisProject.name,
                LisProject.financial_issuer,
                LisProject.sml,
                LisProject.brand,
                BsBasicCenterHr.dept_name.label('department'),
                LisMeasurePerson.measure_person.label('person_name'),
                LisMeasurePerson.measure_person_id.label('person_id')
            ).join(
                LisProject, LisMeasurePerson.project_id == LisProject.id
            ).join(
                BsBasicCenterHr, LisMeasurePerson.measure_dept_id == BsBasicCenterHr.id
            ).filter(
                LisProject.measure_tag == '0',
                LisProject.measure_status == '1'
            )

            # 如果提供了person_id，则按人员过滤
            if person_id:
                query = query.filter(LisMeasurePerson.measure_person_id == person_id)

            tasks_from_db = query.all()

            tasks = []
            # 用于跟踪已添加的任务，避免因同一任务分配给同一人的不同部门而产生重复
            added_tasks = set()

            for task in tasks_from_db:
                task_unique_key = (task.id, task.person_id)
                if task_unique_key not in added_tasks:
                    tasks.append({
                        'task_person_id': task.task_person_id,
                        'id': task.id,
                        'name': task.name,
                        'issuer': task.financial_issuer,
                        'scale': sml_map.get(str(task.sml), task.sml),
                        'brand': brand_map.get(str(task.brand), task.brand),
                        'department': task.department,
                        'person': task.person_name
                    })
                    added_tasks.add(task_unique_key)

            return jsonify({"status": "success", "data": tasks})
        except Exception as e:
            # 记录异常对于调试非常重要
            print(f"Error in get_tasks: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500

    def get_task_details(self, task_id):
        """
        根据任务ID获取项目的详细信息。
        包括项目基础信息、关联的订单信息以及主要负责人信息。
        """
        # 品牌和规模的映射关系
        brand_map = {
            '1001': '本项目', '1002': '区域', '1003': '其他', '1004': '城市公司',
            '1005': '战区', '1006': '集团'
        }
        sml_map = {
            '1': 'S', '2': 'M', '3': 'L'
        }
        try:
            # 查询项目详情
            project = db.session.query(LisProject).filter(cast(LisProject.id, String(32)).collate('utf8mb4_general_ci') == task_id).first()

            if not project:
                return jsonify({"status": "error", "message": "Task not found"}), 404

            # 查询关联的订单
            orders = db.session.query(LisProjectOrder).filter(LisProjectOrder.project_id == project.id).all()
            order_list = [{
                'id': order.id,
                'name': order.order_name,
                'code': order.order_code
            } for order in orders]

            # 查询主要负责人
            primary_person = db.session.query(LisMeasurePerson).filter(
                LisMeasurePerson.project_id == project.id,
                LisMeasurePerson.is_primary == '1'  # 假设 '1' 代表主要负责人
            ).first()
            person_name = primary_person.measure_person if primary_person else "N/A"

            # 组装返回数据
            project_details = {
                'id': project.id,
                'name': project.name,
                'brand': brand_map.get(str(project.brand), project.brand),
                'scale': sml_map.get(str(project.sml), project.sml),
                'orders': order_list,
                'person': person_name
            }

            return jsonify({"status": "success", "data": project_details})
        except Exception as e:
            print(f"Error in get_task_details: {e}")
            return jsonify({"status": "error", "message": "Internal server error"}), 500

    def get_historical_projects(self):
        """
        获取历史测算项目列表 (measure_tag = '1')
        """
        try:
            # 查询历史项目及其主要负责人
            historical_projects = db.session.query(
                LisProject.id,
                LisProject.name,
                LisMeasurePerson.measure_person.label('person')
            ).join(
                LisMeasurePerson,
                (LisProject.id == LisMeasurePerson.project_id) & (LisMeasurePerson.is_primary == '1')
            ).filter(LisProject.measure_tag == '1').all()

            projects = [{
                'id': p.id,
                'name': p.name,
                'person': p.person,
            } for p in historical_projects]

            return jsonify({"status": "success", "data": projects})
        except Exception as e:
            print(f"Error in get_historical_projects: {e}")
            return jsonify({"status": "error", "message": str(e)}), 500

    def get_all_persons(self):
        """
        获取所有唯一的接口人及其所属部门列表。
        如果一个接口人属于多个部门，部门名称会用逗号拼接。
        """
        try:
            # 使用 GROUP_CONCAT 来聚合部门名称
            persons_from_db = db.session.query(
                LisMeasurePerson.measure_person_id,
                LisMeasurePerson.measure_person,
                func.group_concat(BsBasicCenterHr.dept_name.distinct()).label('departments')
            ).join(
                BsBasicCenterHr, LisMeasurePerson.measure_dept_id == BsBasicCenterHr.id
            ).group_by(
                LisMeasurePerson.measure_person_id,
                LisMeasurePerson.measure_person
            ).all()

            persons = [{
                'id': p.measure_person_id,
                'name': p.measure_person,
                'department': p.departments
            } for p in persons_from_db]

            return jsonify({"status": "success", "data": persons})
        except Exception as e:
            print(f"Error in get_all_persons: {e}")
            return jsonify({"status": "error", "message": "Internal server error"}), 500

    def handle_chat(self, data):
        """
        处理聊天请求，调用AI服务并以流式响应返回结果。
        """
        # 动态导入以避免循环依赖
        from app.app import ai_service
        user_message = data.get('message')
        if not user_message:
            return jsonify({"status": "error", "message": "Message is required"}), 400

        # AI服务的系统提示
        system_prompt = "你是一个测算专家，请根据用户的问题给出解答。保证回答尽量简洁"

        def generate():
            """生成器函数，用于流式传输AI的响应"""
            try:
                for chunk in ai_service.get_streaming_chat_completion(user_message, system_prompt=system_prompt):
                    yield chunk
            except Exception as e:
                print(f"Error during streaming chat completion: {e}")
                yield "AI服务出错，请稍后重试。"

        # 返回一个流式响应
        return Response(generate(), mimetype='text/plain')
