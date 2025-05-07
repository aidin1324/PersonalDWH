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

class Chat(BaseModel):
    """Represents a Telegram chat/dialog."""
    id: int
    type: ChatType
    name: str
    unread_count: Optional[int] = 0
    last_message: Optional[Message] = None

class ChatStats(BaseModel):
    """Unread messages statistics by chat type."""
    personal_unread: int = 0
    group_unread: int = 0
    channel_unread: int = 0
