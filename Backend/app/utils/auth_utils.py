from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from jose.exceptions import JOSEError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.routers.models import UserInDB
from app.credentials.config import (
    SECRET_KEY, ALGORITHM, 
    ACCESS_TOKEN_EXPIRE_MINUTES,
    MONGO_DB_NAME, MONGO_COLLECTION_NAME_USER
)
from app.db.mongo import MongoRepository
import bcrypt

if not hasattr(bcrypt, '__about__'):
    bcrypt.__about__ = type('about', (object,), {'__version__': bcrypt.__version__})

mongodb = MongoRepository(MONGO_DB_NAME, MONGO_COLLECTION_NAME_USER)

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

async def has_access(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JOSEError as e:
        raise HTTPException(status_code=401, detail="Invalid token: " + str(e))
    return token

def verify_password(plain_password, hashed_password):
    return password_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return password_context.hash(password)

async def authenticate_user(username: str, password: str):
    user = await mongodb.get_user(username)
    if not user or not user.hashed_password:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithm=[ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(token: str = Depends(has_access)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token missing 'sub'")
        return await mongodb.get_user(username=username)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="You are disabled. Please contact the administrator.")
    if current_user.hashed_password is None and current_user.provider == "area":
        raise HTTPException(status_code=400, detail="Password is required for this user")
    return current_user

async def get_current_admin_user(current_user: UserInDB = Depends(get_current_active_user)):
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )
    return current_user

def is_password_strong_enough(password: str) -> bool:
    import re
    
    if len(password) < 8:
        return False
        
    patterns = [
        r"[A-Z]",
        r"[a-z]",
        r"\d",
        r"[!@#$%^&*(),.?\":{}|<>]"
    ]
    
    return all(bool(re.search(pattern, password)) for pattern in patterns)
