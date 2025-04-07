from flask import Flask, request, jsonify
from flask_restx import Api, Resource, fields
from model import ASTtest, User
from exts import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required
from newTest import newtest_ns
from auth import auth_ns
from flask_cors import CORS
from io import BytesIO
from flask import send_from_directory
import os

from flask import logging, make_response, request, jsonify, send_file

import cv2
import numpy as np
from PIL import Image
import io

from config import DevConfig

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevConfig)
    
    CORS(app)

    db.init_app(app)

    migrate = Migrate(app,db)
    JWTManager(app)

    api = Api(app, doc='/docs')
    
    #api.add_namespace(newtest_ns)
    #api.add_namespace(auth_ns)
    api.add_namespace(newtest_ns, path='/ASTtest')
    api.add_namespace(auth_ns, path='/auth')
    
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        uploads_dir = os.path.join(os.getcwd(), 'uploads')
        return send_from_directory(uploads_dir, filename)

    @app.shell_context_processor
    def make_shell_context():
        return {
            "db" : db,
            "ASTtest" : ASTtest,
            "user" : User
        }
        
    return app