from fastapi import APIRouter, Depends
from app.db.post_repo import PostRepository
from app.utils.auth_utils import get_current_active_user, has_access
from app.routers.models import User, Post
from typing import List

feed_router = APIRouter(prefix="/feed", tags=["Feed"], dependencies=[Depends(has_access)])
post_repo = PostRepository("createk")

@feed_router.get("/", response_model=List[Post])
async def get_user_feed(current_user: User = Depends(get_current_active_user)):
    following_posts = await post_repo.find({
        "author_id": {"$in": current_user.following}
    })
    return following_posts