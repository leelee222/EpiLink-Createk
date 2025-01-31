from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    full_name: Optional[str | None] = None

class User(BaseModel):
    id: str = Field(alias="_id")
    full_name: str = Field(..., example="johndoe")
    email: Optional[EmailStr] = Field(None, example="johndoe@gmail.com")
    disabled: Optional[bool] = False
    provider: Optional[str] = "createk"
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    following: Optional[list[str]] = []
    followers: Optional[list[str]] = []
    social_links: Optional[dict[str, str]] = {}

class UserInDB(User):
    hashed_password: Optional[str] = None

class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class PostCreate(BaseModel):
    title: str
    content: str

class Post(PostCreate):
    id: str
    author_id: str
    likes: List[str] = []
    comments: List['Comment'] = []
    created_at: datetime
    updated_at: datetime

class CommentCreate(BaseModel):
    content: str

class Comment(CommentCreate):
    id: str
    author_id: str
    likes: List[str] = []
    replies: List['Reply'] = []
    created_at: datetime
    updated_at: datetime

class ReplyCreate(BaseModel):
    content: str

class Reply(ReplyCreate):
    id: str
    author_id: str
    likes: List[str] = []
    created_at: datetime
    updated_at: datetime


class NotificationType(str, Enum):
    FOLLOW = "follow"
    LIKE = "like"
    COMMENT = "comment"
    REPLY = "reply"

class Notification(BaseModel):
    id: str
    recipient_id: str
    sender_id: str
    type: NotificationType
    content: str
    post_id: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Add new models

class Message(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(BaseModel):
    content: str
    recipient_id: str

class Conversation(BaseModel):
    id: str
    participants: List[str]
    last_message: Optional[Message] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

Post.model_rebuild()
Comment.model_rebuild()