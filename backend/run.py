import os
from app.app import create_app

# Get the configuration name from the environment variable or use 'development' as a default
config_name = os.getenv('FLASK_CONFIG', 'development')

# Create the Flask app instance using the specified configuration
app = create_app(config_name)

if __name__ == '__main__':
    # Run the app
    # The host '0.0.0.0' makes the server accessible from any IP address.
    # This is useful for development and testing in a containerized or VM environment.
    app.run(host='0.0.0.0', port=5000, debug=True)
