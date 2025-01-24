import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get('SECRET_KEY') or None
if SECRET_KEY is None:
    raise ValueError('No SECRET_KEY set for FastAPI application')

ALGORITHM = os.environ.get('ALGORITHM')
if ALGORITHM is None:
    raise ValueError('No ALGORITHM set for FastAPI application')

ACCESS_TOKEN_EXPIRE_MINUTES = os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES')
if ACCESS_TOKEN_EXPIRE_MINUTES is None:
    raise ValueError('No ACCESS_TOKEN_EXPIRE_MINUTES set for FastAPI application')

MONGO_CONNECTION_STRING = os.environ.get('MONGO_CONNECTION_STRING')
if MONGO_CONNECTION_STRING is None:
    raise ValueError('No MONGO_CONNECTION_STRING set for FastAPI application')

MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME')
if MONGO_DB_NAME is None:
    raise ValueError('No MONGO_DB_NAME set for FastAPI application')

MONGO_COLLECTION_NAME_USER = os.environ.get('MONGO_COLLECTION_NAME_USER')
if MONGO_COLLECTION_NAME_USER is None:
    raise ValueError('No MONGO_DB_COLLECTION set for FastAPI application')

GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
if GITHUB_CLIENT_ID is None:
    raise ValueError('No GITHUB_CLIENT_ID set for FastAPI application')

GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')
if GITHUB_CLIENT_SECRET is None:
    raise ValueError('No GITHUB_CLIENT_SECRET set for FastAPI application')

REDIS_HOST = os.environ.get('REDIS_HOST')
if REDIS_HOST is None:
    raise ValueError('No REDIS_HOST set for FastAPI application')

REDIS_PORT = os.environ.get('REDIS_PORT')
if REDIS_PORT is None:
    raise ValueError('No REDIS_PORT set for FastAPI application')

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
if GOOGLE_CLIENT_ID is None:
    raise ValueError('No GOOGLE_CLIENT_ID set for FastAPI application')

GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
if GOOGLE_CLIENT_SECRET is None:
    raise ValueError('No GOOGLE_CLIENT_SECRET set for FastAPI application')

SERVER_HOST = os.environ.get('SERVER_HOST')
if SERVER_HOST is None:
    raise ValueError('No SERVER_HOST set for FastAPI application')

APP_PORT = os.environ.get('APP_PORT')
if APP_PORT is None:
    raise ValueError('No APP_PORT set for FastAPI application')

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"

EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')
if EMAIL_PASSWORD is None:
    raise ValueError('No EMAIL_PASSWORD set for FastAPI application')

EMAIL_ADDRESS = "dossehdosseh14@gmail.com"

FRONTEND_HOST = os.environ.get('FRONTEND_HOST')
if FRONTEND_HOST is None:
    raise ValueError('No FRONTEND_HOST set for FastAPI application')

FRONTEND_PORT = int(os.environ.get('FRONTEND_PORT'))
if FRONTEND_PORT is None:
    raise ValueError('No FRONTEND_PORT set for FastAPI application')

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
if GOOGLE_CLIENT_ID is None:
    raise ValueError('No GOOGLE_CLIENT_ID set for FastAPI application')

GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
if GOOGLE_CLIENT_SECRET is None:
    raise ValueError('No GOOGLE_CLIENT_SECRET set for FastAPI application')

GMAIL_EMAIL_PASSWORD = os.environ.get('GMAIL_EMAIL_PASSWORD')
if GMAIL_EMAIL_PASSWORD is None:
    raise ValueError('No GMAIL_EMAIL_PASSWORD set for FastAPI application')

OAUTH2 = "oauth2"
GOOGLE_REDIRECT_URI = f"http://{SERVER_HOST}:{int(APP_PORT)}/api/{OAUTH2}/google/callback"