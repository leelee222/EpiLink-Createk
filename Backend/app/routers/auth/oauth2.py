from urllib.parse import urlencode
from configobj import DuplicateError
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
import httpx
from fastapi.responses import RedirectResponse
from app.routers.models import UserInDB
from app.utils.mail import send_email
from app.utils.auth_utils import create_access_token
from app.db.user_repo import UserRepository
from fastapi import BackgroundTasks
from app.credentials.config import (
    GMAIL_EMAIL_PASSWORD,
    CLIENT_IDS, CLIENT_SECRETS, REDIRECT_URIS,
    OAUTH_CONFIG,
    FRONTEND_HOST, FRONTEND_PORT
)
import logging
logger = logging.getLogger(__name__)

frontend_url = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}/success"
user_repo = UserRepository("createk")

oauth2_router = APIRouter(
    prefix="/api/oauth2",
    tags=["OAuth2"],
    responses={
        404: {"description": "Endpoint not found"},
        403: {"description": "Forbidden access"},
        200: {"description": "Success response"},
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized access"},
        409: {"description": "Username already exists"},
    }
)

def generate_username(email: str, provider) -> str:
    return email.split("@")[0] + f"_{provider}"

async def exchange_code(provider: str, code: str, client: httpx.AsyncClient) -> dict:
    config = OAUTH_CONFIG[provider]
    data = {
        "client_id": CLIENT_IDS[provider],
        "client_secret": CLIENT_SECRETS[provider],
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URIS[provider]
    }
    
    response = await client.post(
        config["token_url"],
        data=data,
        headers={"Accept": "application/json"}
    )
    
    if response.status_code != 200:
        error = response.json().get("error_description", "Unknown error")
        raise HTTPException(400, detail=f"{provider.title()} token exchange failed: {error}")
    
    return response.json()

async def get_user_info(provider: str, token: str, client: httpx.AsyncClient) -> tuple:
    config = OAUTH_CONFIG[provider]
    headers = {"Authorization": f"Bearer {token}"}

    user_response = await client.get(config["userinfo_url"], headers=headers)
    if user_response.status_code != 200:
        raise HTTPException(400, detail=f"Failed to fetch {provider.title()} user info")
    
    user_data = user_response.json()

    email = None
    if provider == "github":
        email_response = await client.get(config["emails_url"], headers=headers)
        if email_response.status_code == 200:
            for email_data in email_response.json():
                if email_data.get("primary") and email_data.get("verified"):
                    email = email_data.get("email")
                    break
    
    return user_data, email

@oauth2_router.get('/{provider}/login')
async def oauth_login(request: Request, provider: str) -> RedirectResponse:
    if provider not in OAUTH_CONFIG:
        raise HTTPException(404, detail="Provider not supported")
    
    params = {
        "client_id": CLIENT_IDS[provider],
        "redirect_uri": REDIRECT_URIS[provider],
        "scope": OAUTH_CONFIG[provider]["scopes"],
        "response_type": "code"
    }
    
    if provider == "google":
        params.update({"access_type": "offline", "prompt": "consent"})
    
    return f"{OAUTH_CONFIG[provider]['auth_url']}?{urlencode(params)}"

@oauth2_router.get('/{provider}/callback')
async def oauth_callback(
    request: Request,
    provider: str,
    code: str,
    background_tasks: BackgroundTasks
) -> RedirectResponse:
    try:
        async with httpx.AsyncClient() as client:
            token_data = await exchange_code(provider, code, client)
            user_data, email = await get_user_info(provider, token_data["access_token"], client)
            username = generate_username(
                user_data.get("login") or user_data.get("email"),
                provider
            )
            user = await handle_user_creation(
                username=username,
                email=email or user_data.get("email"),
                provider=provider,
                background_tasks=background_tasks
            )
            jwt_token = create_access_token({"sub": user.username})
            redirect_url = f"{frontend_url}?token={jwt_token}"
            return RedirectResponse(redirect_url)

    except httpx.RequestError as e:
        logger.error(f"OAuth communication error: {str(e)}")
        raise HTTPException(502, detail="OAuth provider communication failed")
        
    except Exception as e:
        logger.error(f"OAuth error: {str(e)}")
        raise HTTPException(500, detail="Authentication process failed")

async def handle_user_creation(
    username: str,
    email: str,
    provider: str,
    background_tasks: BackgroundTasks
) -> UserInDB:
    try:
        user = await user_repo.get_user(username)
        
        if not user:
            user_data = {
                "username": username,
                "email": email,
                "provider": provider,
                "disabled": False
            }
            user = await user_repo.create_user(user_data)
            
            if email:
                background_tasks.add_task(
                    send_email,
                    "Welcome to Createk",
                    "dossehdosseh14@gmail.com",
                    email,
                    GMAIL_EMAIL_PASSWORD,
                    "app/template/welcome.html",
                )
                
        return user
        
    except DuplicateError:
        raise HTTPException(409, detail="Username already exists")