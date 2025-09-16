from flask import Blueprint, request
from .controller import BfaController

bfa_bp = Blueprint('bfa', __name__)
bfa_controller = BfaController()

@bfa_bp.route('/tasks', methods=['GET'])
def get_tasks():
    return bfa_controller.get_tasks()

@bfa_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task_details(task_id):
    return bfa_controller.get_task_details(task_id)

@bfa_bp.route('/projects/historical', methods=['GET'])
def get_historical_projects():
    return bfa_controller.get_historical_projects()

@bfa_bp.route('/calculations/generate', methods=['POST'])
def generate_calculation():
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