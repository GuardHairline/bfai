from app.db.db import db


class LisProject(db.Model):
    __tablename__ = 'lis_project'
    
    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    sml = db.Column(db.String(100))
    measures_project = db.Column(db.String(200))
    measure_tag = db.Column(db.String(32), default='0')
    measure_status = db.Column(db.String(32), default='0')
    brand = db.Column(db.String(32))
    financial_issuer = db.Column(db.String(100))
    files = db.Column(db.String(32))

class LisProjectOrder(db.Model):
    __tablename__ = 'lis_project_order'
    
    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    power_conf = db.Column(db.String(100))
    order_name = db.Column(db.String(32))
    market = db.Column(db.String(2000))
    project_id = db.Column(db.String(32))

class LisOrderNode(db.Model):
    __tablename__ = 'lis_order_node'

    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    schedule_time = db.Column(db.Integer)
    schedule_stage = db.Column(db.String(100))
    order_id = db.Column(db.String(32))
    schedule_end_time = db.Column(db.Integer)

class LisMeasurePerson(db.Model):
    __tablename__ = 'lis_measure_person'

    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    person = db.Column(db.String(32))
    project_id = db.Column(db.String(32))
    measure_status = db.Column(db.String(32))
    type = db.Column(db.String(32))
    relation_tag = db.Column(db.String(32))
    person_department = db.Column(db.String(100))
    measure_person_id = db.Column(db.String(32))

class BsBasicCenterHr(db.Model):
    __tablename__ = 'bs_basic_center_hr'

    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    department_id = db.Column(db.String(100), nullable=False)
    department_name = db.Column(db.String(100))
    center_number = db.Column(db.String(50))
    center_department_id = db.Column(db.String(100))
    center_department_name = db.Column(db.String(100))
    is_need_set_center = db.Column(db.String(100))

class PmSheetControl(db.Model):
    __tablename__ = 'pm_sheet_control'

    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    pm_department = db.Column(db.String(100))
    see_sheet = db.Column(db.String(32))

class PmWorkHours(db.Model):
    __tablename__ = 'pm_work_hours'

    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    base_hours = db.Column(db.Numeric(32))
    select_hours_base = db.Column(db.BigInteger)
    budget_sum = db.Column(db.Numeric(32))
    diff_hour = db.Column(db.Numeric(32))
    diff_reason = db.Column(db.String(2000))
    select_order = db.Column(db.BigInteger)
    department = db.Column(db.String(32))
    select_project_id = db.Column(db.String(32))
    select_tag = db.Column(db.Boolean)
    power_conf = db.Column(db.String(200))
    order_name = db.Column(db.String(32))
    market = db.Column(db.String(2000))
    business_detail = db.Column(db.String(5000))
    delete_tag = db.Column(db.Boolean)
    approval_tag = db.Column(db.Integer)
    measure_method = db.Column(db.String(5000))
    serial_number = db.Column(db.String(32))

class PmMonthHoursDetail(db.Model):
    __tablename__ = 'pm_month_hours_detail'

    id = db.Column(db.BigInteger, primary_key=True)
    create_by = db.Column(db.BigInteger)
    create_time = db.Column(db.DateTime)
    update_by = db.Column(db.BigInteger)
    update_time = db.Column(db.DateTime)
    mm = db.Column(db.Integer)
    base_id = db.Column(db.String(32))
    order_id = db.Column(db.String(32))
    measure_id = db.Column(db.String(32))
    month_input = db.Column(db.String(32))
    select_project_id = db.Column(db.String(32))
    department = db.Column(db.String(32))