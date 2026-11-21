from fastapi import APIRouter, Depends, status, Request, File, Form, UploadFile
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from configuration.database import get_database_connection
from dotenv import load_dotenv

from services.gempa_terkini_service import get_gempa_terkini_service


import os

# exception and validation
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
if not SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is not set (see .env.example)")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


origins = ["*"]

load_dotenv("./.env")
SSH_HOST = os.getenv("ssh_host")
SSH_PORT = int(os.getenv("ssh_port"))
SSH_USERNAME = os.getenv("ssh_username")
SSH_PASSWORD = os.getenv("ssh_password")
MONGO_HOST = os.getenv("database_host")
MONGO_DB = os.getenv("database_name")
LOCAL_BIND_PORT = int(os.getenv("database_port"))
REMOTE_BIND_PORT = int(os.getenv("database_port"))

db = get_database_connection(
    SSH_HOST,
    SSH_PORT,
    SSH_USERNAME,
    SSH_PASSWORD,
    MONGO_HOST,
    MONGO_DB,
    LOCAL_BIND_PORT,
    REMOTE_BIND_PORT,
)
router = APIRouter(prefix="")

@router.get("/gempaterkini")
async def arrival_get_by_detail(
    request: Request,
):
    req_info = request.query_params

    format = req_info["format"]

    response = get_gempa_terkini_service(db, format)

    return response
