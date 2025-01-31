import re
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

@post_router.get(
    "/all",
    response_model=list[Post],
    summary="Get All Posts",
    description="""
Retrieves all posts in the system.

### Description:
- Queries the post repository to retrieve all posts.
- For each post, converts the internal `_id` to a string and includes it as `id` in the response.

### Responses:
- **200 OK**: Returns a list of posts.
    """
)
async def get_all_posts():
    posts = await post_repo.find({})
    return [{"id": str(post["_id"]), **post} for post in posts]

@post_router.get(
    "/{post_id}",
    response_model=Post,
    summary="Get Single Post",
    description="""
Retrieves a specific post by its unique identifier.

### Description:
- Looks up a post by converting the provided `post_id` into an ObjectId.
- If the post is found, returns the post data with `_id` converted to `id`.
- If the post is not found, returns a 404 error.

### Parameters:
- **post_id (path parameter)**: The unique identifier of the post.

### Responses:
- **200 OK**: Returns the post data.
- **404 Not Found**: If no post is found with the given identifier.
    """
)
async def get_post(post_id: str):
    post = await post_repo.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {**post, "id": str(post["_id"])}

@post_router.post(
    "/{post_id}/comments",
    response_model=Comment,
    summary="Create Comment on Post",
    description="""
Adds a new comment to a specific post.

### Description:
- Retrieves the post using the provided `post_id`.
- If the post exists, creates a new comment with the data provided in the request.
- The new comment includes:
  - A generated unique `id`
  - The `author_id` set to the current user's full name.
  - The comment content and additional metadata (likes, replies, timestamps).
- The new comment is added to the post's `comments` array.
- If the post is not found or the update fails, appropriate error responses are returned.

### Parameters:
- **post_id (path parameter)**: The unique identifier of the post to comment on.
- **comment (body parameter)**: The comment data, following the `CommentCreate` schema.

### Responses:
- **200 OK**: Returns the created comment.
- **404 Not Found**: If the target post is not found.
- **400 Bad Request**: If adding the comment fails.
    """
)
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

@post_router.post(
    "/create",
    response_model=Post,
    summary="Create New Post",
    description="""
Creates a new post authored by the currently authenticated user.

### Description:
- Extracts hashtags from the post content using a regex pattern.
- Sets additional post fields such as `author_id`, `hashtags`, `likes`, `comments`, and timestamps.
- Inserts the new post data into the post repository.
- Returns the new post data, including the generated post `id`.

### Parameters:
- **post (body parameter)**: The post data following the `PostCreate` schema.

### Responses:
- **200 OK**: Returns the created post.
    """
)
async def create_post(post: PostCreate, current_user: User = Depends(get_current_active_user)):
    hashtags = re.findall(r'#(\w+)', post.content)
    post_data = post.model_dump()
    post_data.update({
        "author_id": current_user.full_name,
        "hashtags": hashtags,
        "likes": [],
        "comments": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    post_id = await post_repo.insert_one(post_data)
    return {**post_data, "id": post_id}
