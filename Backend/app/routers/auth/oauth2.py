from datetime import datetime
from urllib.parse import urlencode
from pymongo.errors import DuplicateKeyError
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
import httpx
from fastapi.responses import RedirectResponse
from app.routers.models import UserInDB
from app.utils.mail import send_email
from app.utils.auth_utils import create_access_token
from app.db.user_repo import UserRepository
from fastapi import BackgroundTasks
from app.credentials.config import (
    GMAIL_EMAIL_PASSWORD, CLIENT_IDS, 
    CLIENT_SECRETS, REDIRECT_URIS,
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
        409: {"description": "full_name already exists"},
    }
)

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

@oauth2_router.get(
    '/{provider}/login',
    summary="OAuth2 login endpoint",
    description="""
Initiates the OAuth2 authentication process.

### Description:
- Constructs the authorization URL for the specified OAuth provider.
- Adds the necessary query parameters such as `client_id`, `redirect_uri`, `scope`, and `response_type`.
- For providers like Google, additional parameters (`access_type` and `prompt`) are included.
- If an unsupported provider is provided, returns a 404 error.

### Parameters:
- **provider (path parameter)**: The OAuth provider's identifier (e.g., "google", "github").

### Responses:
- **302 Redirect**: Redirects the user to the OAuth provider's authentication URL.
- **404 Not Found**: If the provider is not supported.
    """
)
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

@oauth2_router.get(
    '/{provider}/callback',
    summary="OAuth2 callback endpoint",
    description="""
Handles the callback from the OAuth provider after user authentication.

### Description:
1. **Exchange Authorization Code:**  
   Exchanges the provided `code` for an access token.
2. **Retrieve User Information:**  
   Fetches user profile data using the access token.
   - For GitHub: Uses the `login` field as a fallback if `name` is absent.
3. **User Processing:**  
   Either creates a new user or updates an existing user, and if a new user is created, a welcome email is sent via background tasks.
4. **Token Generation and Redirection:**  
   Generates a JWT token for the user and redirects to the frontend with the token as a query parameter.
5. **Error Handling:**  
   - Returns a 502 error for OAuth provider communication issues.
   - Returns a 500 error for other unexpected errors.

### Parameters:
- **provider (path parameter)**: The OAuth provider's identifier (e.g., "google", "github").
- **code (query parameter)**: The authorization code returned by the OAuth provider.
- **background_tasks**: An instance to schedule background tasks (e.g., sending emails).

### Responses:
- **302 Redirect**: Redirects the user to the frontend URL with a JWT token in the query parameter.
- **502 Bad Gateway**: If there is an error communicating with the OAuth provider.
- **500 Internal Server Error**: For any other error during the authentication process.
    """
)
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
            
            full_name = (
                user_data.get("name") 
                if (provider == "github" and user_data.get("name"))
                else user_data.get("login") if provider == "github"
                else user_data.get("name")
            )

            user = await handle_user_creation(
                full_name=full_name,
                email=email or user_data.get("email"),
                provider=provider,
                profile_picture=user_data.get("avatar_url") if provider == "github" else user_data.get("picture"),
                background_tasks=background_tasks
            )
            jwt_token = create_access_token({"sub": user.full_name})
            redirect_url = f"{frontend_url}?token={jwt_token}"
            return RedirectResponse(redirect_url)

    except httpx.RequestError as e:
        logger.error(f"OAuth communication error: {str(e)}")
        raise HTTPException(502, detail="OAuth provider communication failed")
        
    except Exception as e:
        logger.error(f"OAuth error: {str(e)}")
        raise HTTPException(500, detail="Authentication process failed")

async def handle_user_creation(
    full_name: str,
    email: str,
    provider: str,
    profile_picture: str,
    background_tasks: BackgroundTasks
) -> UserInDB:
    try:
        existing_user = await user_repo.get_user(full_name)
        
        if existing_user:
            if existing_user.profile_picture != profile_picture:
                await user_repo.update_user(
                    full_name,
                    {"profile_picture": profile_picture}
                )
                existing_user.profile_picture = profile_picture
            return existing_user

        user_data = {
            "full_name": full_name,
            "email": email,
            "provider": provider,
            "profile_picture": profile_picture,
            "disabled": False,
            "created_at": datetime.utcnow()
        }
        
        new_user = await user_repo.create_user(user_data)

        if email:
            background_tasks.add_task(
                send_email,
                "Welcome to Createk",
                "dossehdosseh14@gmail.com",
                email,
                GMAIL_EMAIL_PASSWORD,
                "app/template/welcome.html",
                {"full_name": full_name}
            )

        return new_user

    except DuplicateKeyError as e:
        logger.warning(f"Duplicate user creation attempt: {full_name}")
        existing_user = await user_repo.get_user(full_name)
        return existing_user

    except Exception as e:
        logger.error(f"User creation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to complete user registration"
        )