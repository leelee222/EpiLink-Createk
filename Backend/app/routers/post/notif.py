from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from app.db.notif_repo import NotificationRepository
from app.utils.auth_utils import get_current_active_user, has_access
from app.routers.models import User, Notification
from typing import List

notification_router = APIRouter(
    prefix="/notifications", 
    tags=["Notifications"], 
    dependencies=[Depends(has_access)]
)
notification_repo = NotificationRepository("createk")

@notification_router.get(
    "/",
    response_model=List[Notification],
    summary="Get Notifications",
    description="""
Retrieves a list of notifications for the currently authenticated user.

### Description:
- Queries the notification repository for notifications where the `author_id` matches the current user's full name.
- The notifications are sorted in descending order by the `created_at` timestamp.
- The current user's details are provided by the `get_current_active_user` dependency.

### Responses:
- **200 OK**: Returns a list of `Notification` objects.
    """
)
async def get_notifications(current_user: User = Depends(get_current_active_user)):
    notifications = await notification_repo.find_many(
        {"author_id": current_user.full_name},
        sort=[("created_at", -1)]
    )
    return notifications

@notification_router.put(
    "/{notification_id}/read",
    summary="Mark Notification as Read",
    description="""
Marks a specific notification as read.

### Description:
- Updates the notification identified by `notification_id` for the current user.
- Sets the `read` field of the notification to `True`.
- If the notification is not found or does not belong to the current user, returns a 404 error.

### Parameters:
- **notification_id (path parameter)**: The unique identifier of the notification to mark as read.

### Responses:
- **200 OK**: Returns a message indicating that the notification has been marked as read.
- **404 Not Found**: If no notification is found matching the provided `notification_id` and current user's identifier.
    """
)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user)
):
    updated = await notification_repo.update_one(
        {"_id": ObjectId(notification_id), "author_id": current_user.full_name},
        {"$set": {"read": True}}
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}