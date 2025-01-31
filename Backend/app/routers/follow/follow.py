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

@follow_router.post(
    "/{user_id}",
    summary="Follow User",
    description="""
Allows the authenticated user to follow another user.

### Description:
- Retrieves the target user using the provided `user_id`.
- If the target user exists, adds the `user_id` to the current user's "following" list.
- Returns a success message upon completion.
- If the target user is not found, returns a 404 error.
- If the update operation fails, returns a 400 error.

### Parameters:
- **user_id (path parameter)**: The unique identifier of the user to follow.

### Responses:
- **200 OK**: Successfully followed the user.
- **404 Not Found**: Target user not found.
- **400 Bad Request**: Failed to follow user.
    """
)
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

@follow_router.delete(
    "/{user_id}",
    summary="Unfollow User",
    description="""
Allows the authenticated user to unfollow another user.

### Description:
- Retrieves the target user using the provided `user_id`.
- If the target user exists, removes the `user_id` from the current user's "following" list.
- Returns a success message upon successful update.
- If the target user is not found, returns a 404 error.
- If the update operation fails, returns a 400 error.

### Parameters:
- **user_id (path parameter)**: The unique identifier of the user to unfollow.

### Responses:
- **200 OK**: Successfully unfollowed the user.
- **404 Not Found**: Target user not found.
- **400 Bad Request**: Failed to unfollow user.
    """
)
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

@follow_router.get(
    "/{user_id}",
    summary="Get Followers",
    description="""
Retrieves the list of followers for a specific user.

### Description:
- Retrieves the target user using the provided `user_id`.
- If the user exists, queries for all users whose `_id` is in the target user's `followers` list.
- Returns the list of follower user objects.
- If the target user is not found, returns a 404 error.

### Parameters:
- **user_id (path parameter)**: The unique identifier of the user whose followers are being retrieved.

### Responses:
- **200 OK**: Returns a list of follower user objects.
- **404 Not Found**: Target user not found.
    """
)
async def get_followers(user_id: str):
    user = await user_repo.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    followers = await user_repo.find_many({"_id": {"$in": user.followers}})
    return followers

@follow_router.get(
    "/{user_id}/following",
    summary="Get Following",
    description="""
Retrieves the list of users that a specific user is following.

### Description:
- Retrieves the target user using the provided `user_id`.
- If the user exists, queries for all users whose `_id` is in the target user's `following` list.
- Returns the list of following user objects.
- If the target user is not found, returns a 404 error.

### Parameters:
- **user_id (path parameter)**: The unique identifier of the user whose following list is being retrieved.

### Responses:
- **200 OK**: Returns a list of user objects that the target user is following.
- **404 Not Found**: Target user not found.
    """
)
async def get_following(user_id: str):
    user = await user_repo.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    following = await user_repo.find_many({"_id": {"$in": user.following}})
    return following