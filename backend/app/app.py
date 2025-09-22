from flask import Flask
from app.config.config import get_config_by_name
from app.services.ai_service import AIService
from app.db.db import db

ai_service = None

def create_app(config=None) -> Flask:
    """
    Create a Flask application using the app factory pattern.
    """
    global ai_service
    app = Flask(__name__)
    app_config = get_config_by_name(config)
    app.config.from_object(app_config)

    # Initialize extensions
    db.init_app(app)
    
    # Initialize AI Service
    ai_service = AIService(
        api_base_url=app_config.OLLAMA_API_BASE_URL,
        model_name=app_config.OLLAMA_MODEL
    )

    # Import and register blueprints inside the factory
    from app.initialize_functions import initialize_route, initialize_swagger
    initialize_route(app)
    initialize_swagger(app)
    
    with app.app_context():
        db.create_all()

    return app
