from flask import jsonify
from .models import LisProject, LisMeasurePerson
from app.db.db import db
from sqlalchemy import cast

class BfaController:
    def get_tasks(self):
        try:
            # Subquery to find the primary person (by min id) for each project
            person_sq = db.session.query(
                LisMeasurePerson.project_id,
                db.func.min(LisMeasurePerson.id).label('min_person_id')
            ).group_by(LisMeasurePerson.project_id).subquery()

            # Join LisProject with the subquery to filter projects and then with LisMeasurePerson to get person details
            tasks_query = db.session.query(
                LisProject,
                LisMeasurePerson
            ).join(
                person_sq,
                cast(LisProject.id, db.String(32)) == person_sq.c.project_id
            ).join(
                LisMeasurePerson,
                LisMeasurePerson.id == person_sq.c.min_person_id
            ).filter(LisProject.measure_tag == '0')

            tasks = tasks_query.all()

            task_list = []
            for project, person in tasks:
                task_list.append({
                    'id': project.id,
                    'name': project.measures_project,
                    'department': person.person_department,
                    'calculator': person.person,
                    'brand': project.brand,
                    'spec': project.sml,
                })

            return jsonify(data=task_list)
        except Exception as e:
            # Log the error properly in a real application
            print(f"Error fetching tasks: {e}")
            return jsonify(error="Failed to fetch tasks", message=str(e)), 500

    def get_task_details(self, task_id):
        # TODO: Replace with actual data fetching logic
        mock_task = {"id": task_id, "name": f"Task {task_id}", "description": f"Details for task {task_id}"}
        return jsonify(data=mock_task)

    def get_historical_projects(self):
        # TODO: Replace with actual data fetching logic
        mock_projects = [
            {"id": 1, "name": "Historical Project A"},
            {"id": 2, "name": "Historical Project B"},
        ]
        return jsonify(data=mock_projects)

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
