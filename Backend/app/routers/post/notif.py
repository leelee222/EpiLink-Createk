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

@notification_router.get("/", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_active_user)):
    notifications = await notification_repo.find_many(
        {"author_id": current_user.full_name},
        sort=[("created_at", -1)]
    )
    return notifications

@notification_router.put("/{notification_id}/read")
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