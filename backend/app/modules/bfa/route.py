from flask import Blueprint, request
from .controller import BfaController

bfa_bp = Blueprint('bfa', __name__)
bfa_controller = BfaController()

@bfa_bp.route('/tasks', methods=['GET'])
def get_tasks():
    return bfa_controller.get_tasks()

@bfa_bp.route('/tasks/<string:task_id>', methods=['GET'])
def get_task_details(task_id):
    return bfa_controller.get_task_details(task_id)

@bfa_bp.route('/history', methods=['GET'])
def get_history():
    return bfa_controller.get_historical_projects()

@bfa_bp.route('/persons', methods=['GET'])
def get_persons():
    return bfa_controller.get_all_persons()

@bfa_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    return bfa_controller.handle_chat(data)

@bfa_bp.route('/tasks/<int:task_id>/historical-projects', methods=['GET'])
def get_historical_projects_for_task(task_id):
    return bfa_controller.get_historical_projects_for_task(task_id)

@bfa_bp.route('/tasks/<int:task_id>/calculate', methods=['POST'])
def generate_calculation(task_id):
    data = request.get_json()
    return bfa_controller.generate_calculation(data)

@bfa_bp.route('/calculations/modify', methods=['POST'])
def modify_calculation():
    data = request.get_json()
    return bfa_controller.modify_calculation(data)

@bfa_bp.route('/calculations/validate', methods=['POST'])
def validate_calculation():
    data = request.get_json()
    return bfa_controller.validate_calculation(data)

@bfa_bp.route('/tasks/<int:task_id>/submit', methods=['POST'])
def submit_task(task_id):
    data = request.get_json()
    return bfa_controller.submit_task(task_id, data)

@bfa_bp.route('/tasks/<string:task_id>/reference-projects', methods=['GET'])
def get_reference_projects(task_id):
    department_id = request.args.get('department_id')
    return bfa_controller.get_reference_projects(task_id, department_id)

@bfa_bp.route('/history/<string:project_id>/details', methods=['GET'])
def get_historical_project_details(project_id):
    return bfa_controller.get_historical_project_details(project_id)