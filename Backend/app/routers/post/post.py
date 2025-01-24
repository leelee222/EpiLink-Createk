from fastapi import APIRouter, Depends, HTTPException, status
from app.db.post_repo import PostRepository
from app.routers.models import PostCreate, Post, CommentCreate, Comment
from app.utils.auth_utils import get_current_active_user
from bson import ObjectId
from datetime import datetime
from app.routers.models import User
from app.utils.auth_utils import get_current_active_user, has_access

post_router = APIRouter(prefix="/posts", tags=["Posts"], dependencies=[Depends(has_access)])
post_repo = PostRepository("createk")

@post_router.post("/", response_model=Post)
async def create_post(post: PostCreate, current_user: User = Depends(get_current_active_user)):
    post_data = post.dict()
    post_data.update({
        "author_id": current_user.full_name,
        "likes": [],
        "comments": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    post_id = await post_repo.insert_one(post_data)
    return {**post_data, "id": post_id}

@post_router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    post = await post_repo.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@post_router.post("/{post_id}/comments", response_model=Comment)
async def create_comment(post_id: str, comment: CommentCreate, current_user: User = Depends(get_current_active_user)):
    post = await post_repo.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    new_comment = {
        "id": str(ObjectId()),
        "author_id": current_user.full_name,
        **comment.dict(),
        "likes": [],
        "replies": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    updated = await post_repo.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": new_comment}}
    )
    if not updated:
        raise HTTPException(status_code=400, detail="Failed to add comment")
    return new_comment