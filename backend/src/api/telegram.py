"""
FastAPI endpoints для Telegram API.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from fastapi.responses import StreamingResponse
import io
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

@router.get("/media/{chat_id}/{message_id}")
async def download_media(chat_id: int, message_id: int, tg_client = Depends(get_telegram_client)):
    """
    Download media (photo, sticker, voice, document) from a message.
    """
    from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument
    entity = await tg_client.get_entity(chat_id)
    msg = await tg_client.get_messages(entity, ids=message_id)
    if not msg or not (msg.photo or msg.document or msg.sticker or msg.voice):
        raise HTTPException(status_code=404, detail="Media not found")
    file_bytes = await tg_client.download_media(msg, file=bytes)
    if not file_bytes:
        raise HTTPException(status_code=404, detail="Failed to download media")
    filename = f"media_{chat_id}_{message_id}"
    if msg.photo:
        filename += ".jpg"
        content_type = "image/jpeg"
    elif msg.sticker:
        filename += ".webp"
        content_type = "image/webp"
    elif msg.voice:
        filename += ".ogg"
        content_type = "audio/ogg"
    elif msg.document:
        filename += ".bin"
        content_type = "application/octet-stream"
    else:
        content_type = "application/octet-stream"
    return StreamingResponse(io.BytesIO(file_bytes), media_type=content_type, headers={"Content-Disposition": f"inline; filename={filename}"})
