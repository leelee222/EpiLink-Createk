from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.db.mongo import MongoRepository
from app.routers.models import User
from app.utils.auth_utils import get_current_active_user, get_password_hash, has_access
from fastapi_cache.decorator import cache

api_router = APIRouter(
    prefix="/api",
    tags=["User Management"],
    dependencies=[Depends(has_access)]
)

workflowdb = MongoRepository("area", "workflows")
servicedb = MongoRepository("area", "services")
mongodb = MongoRepository("area", "users")

@api_router.get(
    "/users/me"
)
@cache(expire=20)
async def read_users_me(
    request: Request,
    current_user: User = Depends(get_current_active_user)
) -> User:
    if not current_user or not isinstance(current_user, User):
        raise HTTPException(
            status_code=404,
            detail="User not found or not authenticated."
        )
    return current_user

@api_router.get(
    "/users/me/id"
)
@cache(expire=20)
async def get_me_id(
    request: Request,
    current_user: User = Depends(get_current_active_user)
):
    if not current_user or not current_user.username:
        raise HTTPException(
            status_code=404,
            detail="Authenticated user not found."
        )

    user_id = await mongodb.get_me_id(current_user.username)
    if not user_id:
        raise HTTPException(
            status_code=404,
            detail="User ID not found."
        )
    return user_id

@api_router.put(
    "/users/me/email",
    response_model=User
)
async def update_user_email(
    request: Request,
    email: str,
    current_user: User = Depends(get_current_active_user)
) -> User:
    if not email or "@" not in email or "." not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format."
        )

    if email == current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update email to the same value."
        )

    user_data = {"email": email, "disabled": False}
    update_success = await mongodb.update_user(current_user.username, user_data)

    if not update_success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user email."
        )

    return User(username=current_user.username, email=email, disabled=False)

@api_router.put(
    "/users/me/password"
)
async def update_user_password(
    request: Request,
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user)
) -> User:
    if get_password_hash(old_password) != current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect."
        )

    if not new_password or len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long."
        )

    if old_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password."
        )

    user_data = {
        "hashed_password": get_password_hash(new_password),
        "disabled": False
    }
    
    update_success = await mongodb.update_user(current_user.username, user_data)

    if not update_success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user password."
        )

    return User(username=current_user.username, email=current_user.email, disabled=False)

@api_router.delete(
    "/users/me",
)
async def delete_user(
    request: Request,
    current_user: User = Depends(get_current_active_user)
) -> dict:
    if not current_user or not current_user.username:
        raise HTTPException(
            status_code=404,
            detail="Authenticated user not found."
        )

    try:
        await mongodb.delete_user(current_user.username)
        await workflowdb.delete_all(current_user.username)
        await servicedb.delete_all(current_user.username)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user data: {str(e)}"
        )

    return {"message": "User deleted successfully."}
