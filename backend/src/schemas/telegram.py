"""
Pydantic-модели для Telegram API.
"""
from pydantic import BaseModel
from typing import Optional, List
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
    id: int
    text: Optional[str] = None
    date: int
    sender: Sender
    media_type: Optional[str] = None  # Тип медиа: sticker, photo, voice, document и т.д.
    media_url: Optional[str] = None   # Ссылка на файл, если реализовано скачивание
    duration: Optional[int] = None    # Длительность (для voice)
    is_read: Optional[bool] = None    # Прочитано ли сообщение

class Chat(BaseModel):
    id: int
    type: ChatType
    name: str
    unread_count: Optional[int] = 0
    last_message: Optional[Message] = None

class ChatStats(BaseModel):
    personal_unread: int = 0
    group_unread: int = 0
    channel_unread: int = 0
