from flask import Flask
from flask_cors import CORS
from .config import Config
from .routes import routes_bp
from pymongo import MongoClient

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config.from_object(Config)

    # Connect MongoDB
    app.db = MongoClient(Config.MONGO_URI)[Config.DB_NAME]

    # Register routes
    app.register_blueprint(routes_bp)

    return app
