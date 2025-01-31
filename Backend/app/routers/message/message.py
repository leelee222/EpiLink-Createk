from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.db.message_repo import MessageRepository
from app.utils.auth_utils import get_current_active_user, has_access
from app.routers.models import Message, MessageCreate, User
from bson import ObjectId

message_router = APIRouter(prefix="/messages", tags=["Messages"], dependencies=[Depends(has_access)])
message_repo = MessageRepository("createk")

@message_router.post(
    "/",
    response_model=Message,
    summary="Send Message",
    description="""
Sends a new message from the currently authenticated user to a specified recipient.

### Description:
- Accepts a message payload as defined by the `MessageCreate` schema.
- Augments the message data with the sender's identifier and a creation timestamp.
- Inserts the new message into the message repository.
- Returns the newly created message data along with its generated unique identifier.

### Parameters:
- **message (body parameter)**: The message data following the `MessageCreate` schema.
- The current user's details are provided via the `get_current_active_user` dependency.

### Responses:
- **200 OK**: Returns the created message with its assigned `id`.
    """
)
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

@message_router.get(
    "/conversations/{user_id}",
    summary="Get Conversation",
    description="""
Retrieves the conversation messages between the currently authenticated user and another specified user.

### Description:
- Fetches all messages where the sender and recipient match the current user and the specified user.
- The conversation includes messages sent by either party.
- Messages are sorted in chronological order based on their creation time.

### Parameters:
- **user_id (path parameter)**: The unique identifier of the user with whom the conversation is held.
- The current user's details are provided via the `get_current_active_user` dependency.

### Responses:
- **200 OK**: Returns a list of messages representing the conversation.
    """
)
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