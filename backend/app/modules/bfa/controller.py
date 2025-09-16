from flask import jsonify, request, Response
from .models import LisProject, LisMeasurePerson, LisProjectOrder, BsBasicCenterHr
from app.db.db import db
from sqlalchemy import cast, func, String

class BfaController:
    def get_tasks(self):
        brand_map = {
            '1': 'WEY', '2': '坦克', '3': '沙龙', '4': '哈弗', '5': '欧拉',
            '6': '皮卡', '7': 'HEM', '8': '重卡', '9': '赛车', '10': '光束', '11': '平台项目'
        }
        sml_map = {'0': 'SS', '1': 'S', '2': 'M', '3': 'L'}
        
        try:
            person_id = request.args.get('person_id')

            # Base query starts from LisMeasurePerson
            query = db.session.query(
                LisMeasurePerson,
                LisProject,
                BsBasicCenterHr.department_name
            ).join(
                LisProject,
                cast(LisProject.id, String(32)).collate('utf8mb4_general_ci') == LisMeasurePerson.project_id
            ).outerjoin(
                BsBasicCenterHr,
                LisMeasurePerson.person_department == BsBasicCenterHr.department_id
            )

            # Always filter by project status
            query = query.filter(
                LisProject.measure_tag == '0',
                LisProject.measure_status == '1'
            )
            
            # If a person_id is provided, filter tasks specifically for that person.
            if person_id:
                query = query.filter(LisMeasurePerson.measure_person_id == person_id)

            user_tasks = query.all()

            task_list = [
                {
                    'id': project.id,
                    'name': project.measures_project,
                    'department': department_name if department_name else person.person_department,
                    'calculator': person.person,
                    'brand': brand_map.get(project.brand, project.brand),
                    'spec': sml_map.get(project.sml, project.sml),
                    'task_person_id': person.id
                }
                for person, project, department_name in user_tasks
            ]

            return jsonify(data=task_list)
        except Exception as e:
            print(f"Error fetching tasks: {e}")
            return jsonify(error="Failed to fetch tasks", message=str(e)), 500

    def get_task_details(self, task_id):
        try:
            project = db.session.query(LisProject).filter(LisProject.id == int(task_id)).one_or_none()
            if not project:
                return jsonify(error="Task not found"), 404
            # Fetch associated orders to compile power configurations
            orders = db.session.query(LisProjectOrder).filter(LisProjectOrder.project_id == str(task_id)).all()
            power_configs = ",".join([order.power_conf for order in orders if order.power_conf])
            order_info = ",".join([order.order_name for order in orders if order.order_name])

            # Fetch the primary person for the project
            person = db.session.query(LisMeasurePerson).filter(LisMeasurePerson.project_id == str(task_id)).order_by(LisMeasurePerson.id.asc()).first()

            # Mappings for human-readable text
            status_map = {'0': '编制中', '1': '测算中', '2': '财务汇总中', '3': '财务审批中', '4': '测算完成', '10': '已作废'}
            brand_map = {
                '1': 'WEY', '2': '坦克', '3': '沙龙', '4': '哈弗', '5': '欧拉',
                '6': '皮卡', '7': 'HEM', '8': '重卡', '9': '赛车', '10': '光束', '11': '平台项目'
            }
            sml_map = {'0': 'SS', '1': 'S', '2': 'M', '3': 'L'}

            task_details = {
                'projectId': project.id,
                'projectName': project.measures_project,
                'department': person.person_department if person else '',
                'brand': brand_map.get(project.brand, project.brand),
                'scale': sml_map.get(project.sml, project.sml),
                'status': status_map.get(project.measure_status, project.measure_status),
                'calculator': person.person if person else '',
                'createdAt': project.create_time.strftime('%Y-%m-%d %H:%M:%S') if project.create_time else '',
                'updatedAt': project.update_time.strftime('%Y-%m-%d %H:%M:%S') if project.update_time else '',
                'orderInfo': order_info,
                'powerConfig': power_configs
            }
            return jsonify(data=task_details)
        except Exception as e:
            print(f"Error fetching task details: {e}")
            return jsonify(error="Failed to fetch task details", message=str(e)), 500

    def get_historical_projects(self):
        try:
            # Fetch projects that are marked as completed (measure_tag = '1')
            historical_projects = db.session.query(LisProject).filter(LisProject.measure_tag == '1').all()
            
            history_list = []
            for project in historical_projects:
                # For each historical project, find the primary person associated with it
                person = db.session.query(LisMeasurePerson).filter(
                    LisMeasurePerson.project_id == str(project.id)
                ).order_by(LisMeasurePerson.id.asc()).first()

                history_list.append({
                    'id': project.id,
                    'name': project.measures_project,
                    'department': person.person_department if person else '',
                    'calculator': person.person if person else 'N/A',
                    'brand': project.brand, # Note: brand is an ID here, mapping can be done on frontend or backend
                    'spec': project.sml,    # Note: spec is an ID here
                })
            
            return jsonify(data=history_list)
        except Exception as e:
            print(f"Error fetching historical projects: {e}")
            return jsonify(error="Failed to fetch historical projects", message=str(e)), 500

    def get_all_persons(self):
        try:
            # Use GROUP_CONCAT to aggregate department names at the database level
            persons_query = db.session.query(
                LisMeasurePerson.measure_person_id,
                LisMeasurePerson.person,
                func.group_concat(BsBasicCenterHr.department_name.distinct()).label('departments')
            ).outerjoin(
                BsBasicCenterHr,
                LisMeasurePerson.person_department == BsBasicCenterHr.department_id
            ).filter(
                LisMeasurePerson.measure_person_id.isnot(None)
            ).group_by(
                LisMeasurePerson.measure_person_id,
                LisMeasurePerson.person
            ).all()

            person_list = [
                {
                    "id": p.measure_person_id,
                    "name": p.person,
                    "department": p.departments if p.departments else 'N/A'
                }
                for p in persons_query
            ]
            
            return jsonify(data=person_list)
        except Exception as e:
            print(f"Error fetching persons: {e}")
            return jsonify(error="Failed to fetch persons", message=str(e)), 500

    def handle_chat(self, data):
        from app.app import ai_service
        user_message = data.get('message')
        if not user_message:
            return jsonify(error="No message provided"), 400
        
        system_prompt = "你是一个测算专家，请根据用户的问题给出解答。保证回答尽量简洁"
        
        def generate():
            for chunk in ai_service.get_streaming_chat_completion(user_message, system_prompt=system_prompt):
                yield chunk
        
        return Response(generate(), mimetype='text/plain')

    def generate_calculation(self, data):
        # TODO: Implement calculation generation logic
        task_id = data.get('task_id')
        reference_project_id = data.get('reference_project_id')
        mock_timesheet = [
            {"person": "Dev 1", "hours": 40},
            {"person": "Dev 2", "hours": 32},
        ]
        return jsonify(data={"calculation_id": "calc-123", "timesheet": mock_timesheet})

    def modify_calculation(self, data):
        # TODO: Implement calculation modification logic based on natural language command
        command = data.get('command')
        current_timesheet = data.get('current_timesheet')
        # Simulate modification
        if "add" in command:
            current_timesheet.append({"person": "New Dev", "hours": 20})
        
        return jsonify(data={"updated_timesheet": current_timesheet})

    def validate_calculation(self, data):
        # TODO: Implement validation logic
        timesheet = data.get('timesheet')
        is_valid = all(isinstance(entry.get('hours', 0), int) and entry.get('hours', 0) > 0 for entry in timesheet)
        errors = [] if is_valid else ["Invalid hours found."]
        return jsonify(data={"is_valid": is_valid, "errors": errors})

    def submit_task(self, task_id, data):
        # TODO: Implement submission logic
        timesheet = data.get('timesheet')
        print(f"Submitting timesheet for task {task_id}: {timesheet}")
        return jsonify(data={"status": "success"})
