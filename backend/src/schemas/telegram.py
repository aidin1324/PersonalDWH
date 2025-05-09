"""
Pydantic models for Telegram API.
"""
from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ChatType(str, Enum):
    PERSONAL = "personal"
    GROUP = "group"
    CHANNEL = "channel"
    ALL = "all"

class Sender(BaseModel):
    id: int
    name: str
    username: Optional[str] = None

class Message(BaseModel):
    """Represents a Telegram message."""
    id: int
    text: Optional[str] = None
    date: int
    sender: Sender
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    duration: Optional[int] = None
    is_read: Optional[bool] = None
    sender_avatar_url: Optional[str] = None
    from_author: bool  # True если сообщение от текущего пользователя

class Chat(BaseModel):
    """Represents a Telegram chat/dialog."""
    id: int
    type: ChatType
    name: str
    unread_count: Optional[int] = 0
    last_message: Optional[Message] = None
    avatar_url: Optional[str] = None  # URL для аватарки

class ChatStats(BaseModel):
    """Unread messages statistics by chat type."""
    personal_unread: int = 0
    group_unread: int = 0
    channel_unread: int = 0

class AuthRequestCode(BaseModel):
    phone_number: str

class AuthSubmitCode(BaseModel):
    phone_number: str
    phone_code_hash: str
    code: str
    password: Optional[str] = None

class AuthStatus(BaseModel):
    is_authorized: bool
    user_id: Optional[int] = None
    phone: Optional[str] = None

class PhoneCodeHash(BaseModel):
    phone_code_hash: str
