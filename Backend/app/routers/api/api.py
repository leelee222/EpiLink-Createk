from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from app.db.user_repo import UserRepository
from app.routers.models import User, UserInDB
from app.utils.auth_utils import get_current_active_user, get_password_hash

user_router = APIRouter(
    prefix="/api/users",
    tags=["User Management"]
)

user_repo = UserRepository("createk")

@user_router.get(
    "/me",
    response_model=User,
    summary="Get Current User",
    description="""
Retrieves the details of the currently authenticated user.

### Description:
- Returns the current user's information based on the authentication token provided.
- The user is extracted using the dependency `get_current_active_user`.

### Responses:
- **200 OK**: Returns the authenticated user's details as a `User` object.
    """
)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    return current_user

@user_router.get(
    "/me/id",
    response_model=str,
    summary="Get Current User ID",
    description="""
Retrieves the unique identifier of the currently authenticated user.

### Description:
- Fetches the user's unique ID by querying the user repository with the user's full name.
- Relies on `get_current_active_user` to obtain the current user.

### Responses:
- **200 OK**: Returns the user's unique identifier as a string.
- **404 Not Found**: If the user is not found in the repository.
    """
)
async def get_me_id(current_user: UserInDB = Depends(get_current_active_user)):
    user = await user_repo.find_one({"full_name": current_user.full_name})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user["_id"]

@user_router.put(
    "/me/email",
    response_model=User,
    summary="Update User Email",
    description="""
Updates the email address of the currently authenticated user.

### Description:
- Validates the provided email address (checks for a valid format with '@').
- Updates the user's email in the repository.
- Returns the updated user details if the update is successful.

### Parameters:
- **email (query/body parameter)**: The new email address to update.

### Responses:
- **200 OK**: Returns the updated `User` object with the new email.
- **400 Bad Request**: If the provided email format is invalid.
- **500 Internal Server Error**: If the email update fails.
    """
)
async def update_user_email(
    email: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    if await user_repo.update_user(current_user.full_name, {"email": email}):
        return User(**current_user.model_dump(), email=email)
    
    raise HTTPException(status_code=500, detail="Failed to update email")

@user_router.put(
    "/me/password",
    response_model=User,
    summary="Update User Password",
    description="""
Updates the password for the currently authenticated user.

### Description:
- Requires the user's current password (`old_password`) and a new password (`new_password`).
- Validates that the provided `old_password` matches the stored password.
- Ensures that the `new_password` meets a minimum length requirement.
- If successful, updates the stored password with the hashed value of the new password.

### Parameters:
- **old_password (query/body parameter)**: The current password of the user.
- **new_password (query/body parameter)**: The new password to be set.

### Responses:
- **200 OK**: Returns the updated `User` object.
- **401 Unauthorized**: If the current password is incorrect.
- **400 Bad Request**: If the new password is too short.
- **500 Internal Server Error**: If the password update fails.
    """
)
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

@user_router.delete(
    "/me",
    status_code=204,
    summary="Delete User",
    description="""
Deletes the account of the currently authenticated user.

### Description:
- Removes the user account from the system.
- The current user is obtained using the `get_current_active_user` dependency.

### Responses:
- **204 No Content**: If the user account is successfully deleted.
- **500 Internal Server Error**: If the deletion process fails.
    """
)
async def delete_user(current_user: UserInDB = Depends(get_current_active_user)):
    if not await user_repo.delete_user(current_user.full_name):
        raise HTTPException(status_code=500, detail="Failed to delete user")

@user_router.get(
    "/all-users",
    response_model=list[User],
    summary="Get All Users",
    description="""
Retrieves a list of all users in the system.

### Description:
- Queries the user repository to obtain all registered users.
- Intended for administrative or informational purposes.

### Responses:
- **200 OK**: Returns a list of all `User` objects.
    """
)
async def get_all_users():
    users = await user_repo.get_all_users()
    return users

@user_router.get(
    "/get/{_id}",
    response_model=dict,
    summary="Get User Profile and Posts",
    description="""
Retrieves complete user profile information and all associated posts.

### Description:
- Fetches user details and all posts created by the user
- Returns comprehensive profile data including user info and post history

### Parameters:
- **_id**: User's unique identifier

### Responses:
- **200 OK**: Returns user profile and posts
- **404 Not Found**: If user is not found
"""
)
async def get_user_by_id(_id: str):
    user = await user_repo.find_one({"_id": ObjectId(_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = UserInDB(**user).model_dump()
    del user_data["hashed_password"]

    posts = await user_repo.get_user_posts(ObjectId(_id))
    
    return {
        "user_profile": user_data,
        "posts": posts
    }