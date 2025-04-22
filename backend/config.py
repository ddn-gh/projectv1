from decouple import config
import os

BASE_DIR = os.path.dirname(os.path.realpath(__file__))

class Config:
    SECRET_KEY = config('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = config('SQLALCHEMY_TRACK_MODIFICATIONS', cast=bool)
    
class DevConfig(Config):
    # SQLALCHEMY_DATABASE_URI = config('DATABASE_URL', default='postgresql://postgres:6116@localhost:5432/ast-test')
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    DEBUG = True
    SQLALCHEMY_ECHO = True


