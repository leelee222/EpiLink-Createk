from fastapi import APIRouter, Depends, HTTPException, status
from app.db.user_repo import UserRepository
from app.routers.models import PostCreate, Post, CommentCreate, Comment
from app.utils.auth_utils import get_current_active_user
from bson import ObjectId
from datetime import datetime
from app.routers.models import User
from app.utils.auth_utils import get_current_active_user, has_access

follow_router = APIRouter(prefix="/follow", tags=["Follow"], dependencies=[Depends(has_access)])
user_repo = UserRepository("createk")

@follow_router.post("/{user_id}")
async def follow_user(user_id: str, current_user: User = Depends(get_current_active_user)):
    user = await user_repo.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated = await user_repo.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$addToSet": {"following": user_id}}
    )
    if not updated:
        raise HTTPException(status_code=400, detail="Failed to follow user")
    return {"message": "Successfully followed user"}

@follow_router.delete("/{user_id}")
async def unfollow_user(user_id: str, current_user: User = Depends(get_current_active_user)):
    user = await user_repo.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated = await user_repo.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$pull": {"following": user_id}}
    )
    if not updated:
        raise HTTPException(status_code=400, detail="Failed to unfollow user")
    return {"message": "Successfully unfollowed user"}

@follow_router.get("/{user_id}")
async def get_followers(user_id: str):
    user = await user_repo.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    followers = await user_repo.find_many({"_id": {"$in": user.followers}})
    return followers

@follow_router.get("/{user_id}/following")
async def get_following(user_id: str):
    user = await user_repo.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    following = await user_repo.find_many({"_id": {"$in": user.following}})
    return following