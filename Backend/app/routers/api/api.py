from fastapi import APIRouter, Depends, HTTPException, status
from app.db.user_repo import UserRepository
from app.routers.models import User, UserInDB
from app.utils.auth_utils import get_current_active_user, get_password_hash

user_router = APIRouter(
    prefix="/api/users",
    tags=["User Management"]
)

user_repo = UserRepository("createk")

@user_router.get("/me", response_model=User)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    return current_user

@user_router.get("/me/id", response_model=str)
async def get_me_id(current_user: UserInDB = Depends(get_current_active_user)):
    user = await user_repo.find_one({"full_name": current_user.full_name})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user["id"]

@user_router.put("/me/email", response_model=User)
async def update_user_email(
    email: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if await user_repo.update_user(current_user.full_name, {"email": email}):
        return User(**current_user.model_dump(), email=email)
    
    raise HTTPException(status_code=500, detail="Failed to update email")

@user_router.put("/me/password", response_model=User)
async def update_user_password(
    old_password: str,
    new_password: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    if get_password_hash(old_password) != current_user.hashed_password:
        raise HTTPException(status_code=401, detail="Incorrect current password")
    
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password too short")
    
    hashed_password = get_password_hash(new_password)
    if await user_repo.update_user(current_user.full_name, {"hashed_password": hashed_password}):
        return User(**current_user.dict())
    
    raise HTTPException(status_code=500, detail="Password update failed")

@user_router.delete("/me", status_code=204)
async def delete_user(current_user: UserInDB = Depends(get_current_active_user)):
    if not await user_repo.delete_user(current_user.full_name):
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
@user_router.get('/all-users', response_model=list[User])
async def get_all_users():
    users = await user_repo.find({})
    return users