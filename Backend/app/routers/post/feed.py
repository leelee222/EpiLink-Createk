from fastapi import APIRouter, Depends
from app.db.post_repo import PostRepository
from app.utils.auth_utils import get_current_active_user, has_access
from app.routers.models import User, Post
from typing import List

feed_router = APIRouter(prefix="/feed", tags=["Feed"], dependencies=[Depends(has_access)])
post_repo = PostRepository("createk")

@feed_router.get(
    "/",
    response_model=List[Post],
    summary="Get User Feed",
    description="""
Retrieves the feed for the currently authenticated user.

### Description:
- Fetches posts authored by users that the current user is following.
- Queries the post repository for posts where the `author_id` is in the current user's `following` list.
- Returns a list of posts that constitute the user's feed.

### Parameters:
- No direct parameters are required.
- The current user's details are obtained via the `get_current_active_user` dependency.

### Responses:
- **200 OK**: Returns a list of `Post` objects representing the user's feed.
    """
)
async def get_user_feed(current_user: User = Depends(get_current_active_user)):
    following_posts = await post_repo.find({
        "author_id": {"$in": current_user.following}
    })
    return following_posts