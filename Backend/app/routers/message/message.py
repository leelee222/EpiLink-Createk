from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.db.message_repo import MessageRepository
from app.utils.auth_utils import get_current_active_user, has_access
from app.routers.models import Message, MessageCreate, User
from bson import ObjectId

message_router = APIRouter(prefix="/messages", tags=["Messages"], dependencies=[Depends(has_access)])
message_repo = MessageRepository("createk")

@message_router.post("/", response_model=Message)
async def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_active_user)
):
    message_data = {
        "sender_id": current_user.id,
        **message.model_dump(),
        "created_at": datetime.utcnow()
    }
    message_id = await message_repo.insert_one(message_data)
    return {**message_data, "id": message_id}

@message_router.get("/conversations/{user_id}")
async def get_conversation(
    user_id: str,
    current_user: User = Depends(get_current_active_user)
):
    messages = await message_repo.find_many({
        "$or": [
            {"sender_id": current_user.id, "recipient_id": user_id},
            {"sender_id": user_id, "recipient_id": current_user.id}
        ]
    }, sort=[("created_at", 1)])
    return messages