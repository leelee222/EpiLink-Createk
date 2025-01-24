import json
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query, Request
import httpx
from fastapi.responses import RedirectResponse
from app.utils.mail import send_email
from app.utils.auth_utils import mongodb, create_access_token
from fastapi import BackgroundTasks
from app.credentials.config import (
    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GMAIL_EMAIL_PASSWORD,
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
    GOOGLE_AUTH_URL, GOOGLE_TOKEN_URL,
    GOOGLE_USERINFO_URL, GOOGLE_REDIRECT_URI,
    FRONTEND_HOST, FRONTEND_PORT
)

frontend_url = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}/success"

oauth2_router = APIRouter(
    prefix="/api/oauth2",
    tags=["OAuth2"],
    responses={
        404: {"description": "Endpoint not found"},
        403: {"description": "Forbidden access"},
        200: {"description": "Success response"},
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized access"}
    }
)

def generate_username(email: str, provider) -> str:
    return email.split("@")[0] + f"_{provider}"

@oauth2_router.get(
    '/google/login',
    summary="Google OAuth Login",
    description="Initiates the Google OAuth2 authentication flow by redirecting to Google's authorization page.",
    response_description="Redirects user to Google's authorization page."
)
def google_login(request: Request) -> RedirectResponse:
    if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth configuration is missing. Please check environment variables."
        )
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_URL}?{'&'.join(f'{k}={v}' for k, v in params.items())}"
    return url

@oauth2_router.get(
    '/google/callback',
    summary="Google OAuth Callback",
    description="Callback URL for Google OAuth2 authentication flow.",
    response_description="Redirects user to the appropriate client with a JWT token."
)
async def google_callback(
    request: Request, 
    code: str, 
    background_tasks: BackgroundTasks,
):
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    GOOGLE_WEB_CLIENT_ID = "602820007952-h3d5hq8ne7dl5p90mkj0cjjvu1vm84vp.apps.googleusercontent.com"
    GOOGLE_WEB_REDIRECT_URI = "http://127.0.0.1:8080/api/oauth2/google/callback"

    token_data = {
        "client_id": GOOGLE_WEB_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_WEB_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        
        if token_response.status_code != 200:
            error_detail = token_response.json()
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to obtain access token: {error_detail.get('error_description', 'Unknown error')}"
            )

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(status_code=400, detail="Access token not found in response")

        user_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")
        
        user_info = user_response.json()
        email = user_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required but not found in user info")
        
        username = generate_username(email, "google")
        existing_user = await mongodb.get_user_by_username(username)
        if not existing_user:
            new_user_data = {
                "username": username,
                "email": email,
                "hashed_password": None,
                "provider": "google",
                "disabled": False,
            }
            await mongodb.create_user(new_user_data)
            if email:
                background_tasks.add_task(
                    send_email,
                    "Welcome to the Area",
                    "dossehdosseh14@gmail.com",
                    email,
                    GMAIL_EMAIL_PASSWORD,
                    "app/template/welcome.html"
                )
            user = new_user_data
        else:
            user = existing_user
        
        token_data = {"sub": user["username"]}
        jwt_token = create_access_token(token_data)

        redirect_url = f"{frontend_url}?token={jwt_token}"
        return RedirectResponse(url=redirect_url)

@oauth2_router.get('/github/login')
async def github_login(request: Request) -> RedirectResponse:
    if not GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GitHub OAuth configuration is missing. Please check environment variables."
        )
    scope = "user:email"
    auth_url = f'https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope={scope}'
    return auth_url

@oauth2_router.get(
    '/github/callback'
)
async def github_code(
    request: Request,
    code: str,
    background_tasks: BackgroundTasks,
) -> RedirectResponse:

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Missing authorization code"
        )
    token_params = {
        'client_id': GITHUB_CLIENT_ID,
        'client_secret': GITHUB_CLIENT_SECRET,
        'code': code
    }
    headers = {'Accept': 'application/json'}

    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                url='https://github.com/login/oauth/access_token',
                params=token_params,
                headers=headers
            )
            if token_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to fetch access token: {token_response.text}"
                )
            
            token_data = token_response.json()
            access_token = token_data.get('access_token')
            if not access_token:
                raise HTTPException(
                    status_code=400,
                    detail="Access token not found in GitHub response"
                )

            auth_headers = {
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json'
            }

            user_response = await client.get(
                'https://api.github.com/user',
                headers=auth_headers
            )
            if user_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to fetch user info: {user_response.text}"
                )

            emails_response = await client.get(
                'https://api.github.com/user/emails',
                headers=auth_headers
            )

            github_user_data = user_response.json()
            username = github_user_data.get("login")
            if not username:
                raise HTTPException(
                    status_code=400,
                    detail="GitHub username missing"
                )

            github_email = None
            if emails_response.status_code == 200:
                emails = emails_response.json()
                for email in emails:
                    if email.get('primary') and email.get('verified'):
                        github_email = email.get('email')
                        break

            existing_user = await mongodb.get_user_by_username(username)
            
            if not existing_user:
                new_user_data = {
                    "username": username,
                    "email": github_email,
                    "provider": "github",
                    "disabled": False,
                }
                try:
                    await mongodb.create_user(new_user_data)
                    if github_email:
                        background_tasks.add_task(
                            send_email,
                            "Welcome to the Area",
                            "dossehdosseh14@gmail.com",
                            github_email,
                            GMAIL_EMAIL_PASSWORD,
                            "app/template/welcome.html"
                        )
                except Exception as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to create user: {str(e)}"
                    )
            else:
                new_user_data = existing_user

            jwt_token = create_access_token({"sub": new_user_data["username"]})

            redirect_url = f"{frontend_url}?token={jwt_token}"

            return RedirectResponse(url=redirect_url)

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to communicate with GitHub: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )