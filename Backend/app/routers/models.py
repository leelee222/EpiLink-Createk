from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    full_name: Optional[str | None] = None

class User(BaseModel):
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

Post.model_rebuild()
Comment.model_rebuild()