"""
FastAPI endpoints для Telegram API.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from ..core.dependencies import get_telegram_client
from ..services.telegram import TelegramService
from ..schemas.telegram import Chat, ChatType, Message, ChatStats
from typing import List, Optional, Dict

router = APIRouter()

@router.get("/chats", response_model=Dict[str, object])
async def get_chats(
    filter_type: Optional[ChatType] = Query(ChatType.ALL, description="Filter chats by type"),
    limit: int = Query(20, ge=1, le=100, description="Number of chats to retrieve"),
    tg_client = Depends(get_telegram_client)
):
    """
    Получить список чатов Telegram с фильтрацией по типу и статистику непрочитанных.
    """
    chats = await TelegramService.get_chats(tg_client, filter_type, limit)
    stats = await TelegramService.get_chats_stats(tg_client)
    return {"stats": stats, "chats": chats}

@router.get("/chats/{chat_id}/messages", response_model=List[Message])
async def get_chat_messages(
    chat_id: int,
    limit: int = Query(20, ge=1, le=100, description="Number of messages to retrieve"),
    offset_id: Optional[int] = Query(0, description="Offset message ID to fetch older messages"),
    tg_client = Depends(get_telegram_client)
):
    """
    Получить последние N сообщений из чата.
    """
    return await TelegramService.get_chat_messages(tg_client, chat_id, limit, offset_id)

@router.post("/chats/{chat_id}/send_message")
async def send_message(
    chat_id: int,
    text: str = Body(..., embed=True, description="Text to send"),
    tg_client = Depends(get_telegram_client)
):
    """
    Отправить сообщение в чат или личные сообщения.
    """
    success = await TelegramService.send_message(tg_client, chat_id, text)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send message")
    return {"status": "ok"}
