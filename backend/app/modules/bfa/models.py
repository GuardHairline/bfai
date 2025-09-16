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
