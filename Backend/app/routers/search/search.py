from fastapi import APIRouter, Depends, Query
from app.db.user_repo import UserRepository
from app.db.post_repo import PostRepository
from app.utils.auth_utils import has_access
from typing import List

search_router = APIRouter(prefix="/search", tags=["Search"], dependencies=[Depends(has_access)])
user_repo = UserRepository("createk")
post_repo = PostRepository("createk")

@search_router.get("/users")
async def search_users(q: str = Query(..., min_length=1)):
    users = await user_repo.find_many({
        "$or": [
            {"full_name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    })
    return users

@search_router.get("/posts")
async def search_posts(q: str = Query(..., min_length=1)):
    posts = await post_repo.find_many({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"hashtags": q}
        ]
    })
    return posts