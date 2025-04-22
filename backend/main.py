from flask import Flask, request, jsonify
from flask_restx import Api, Resource, fields
from model import ASTtest, User
from exts import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from newTest import newtest_ns
from auth import auth_ns
from flask_cors import CORS
from flask import send_from_directory
import os
from flask import logging, make_response, request, jsonify, send_file
from config import DevConfig

def create_app():
    # app = Flask(__name__)
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    build_path = os.path.join(root_dir, "frontend", "build")
    app = Flask(__name__, static_folder=build_path, static_url_path="")
    
    app.config.from_object(DevConfig)
    
    CORS(app)

    db.init_app(app)

    migrate = Migrate(app,db)
    JWTManager(app)
    
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def connect_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, "index.html")

    api = Api(app, doc='/docs')
    
    api.add_namespace(newtest_ns, path='/ASTtest')
    api.add_namespace(auth_ns, path='/auth')
    
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.getcwd(), '/data/uploads')
        return send_from_directory(uploads_dir, filename)

    # @app.route('/uploads/<filename>')
    # def uploaded_file(filename):
    #     uploads_dir = os.path.join(os.getcwd(), 'uploads')
    #     return send_from_directory(uploads_dir, filename)

    @app.shell_context_processor
    def make_shell_context():
        return {
            "db" : db,
            "ASTtest" : ASTtest,
            "user" : User
        }
        
    return app