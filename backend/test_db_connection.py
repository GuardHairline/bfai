from app.app import create_app
from app.db.db import db
from sqlalchemy.exc import OperationalError

def test_db_connection():
    """Tests the database connection."""
    print("Attempting to connect to the database...")
    config_name = 'development'
    app = create_app(config_name)
    with app.app_context():
        try:
            db.engine.connect()
            print("Database connection successful!")
        except OperationalError as e:
            print(f"Database connection failed: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

if __name__ == '__main__':
    test_db_connection()
