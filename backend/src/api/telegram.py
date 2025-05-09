"""
FastAPI endpoints для Telegram API.
"""
import re
from fastapi import APIRouter, Depends, Query, HTTPException, Body, Header
from fastapi.responses import StreamingResponse, FileResponse
import io
import os
from ..core.dependencies import get_telegram_client
from ..services.telegram import TelegramService
from ..schemas.telegram import Chat, ChatType, CognitiveApproach, CommunicationStyle, DominantStyle, ExpressionOfOpinions, InformationProcessingHint, Interest, LearningIndicator, LinguisticMarkers, Message, ChatStats, AuthRequestCode, AuthSubmitCode, AuthStatus, PersonaChange, PersonaMirror, PersonalExpression, PhoneCodeHash, ProblemSolvingTendencies, UserProfileInsights, ValueMotivator
from typing import List, Optional, Dict

router = APIRouter()

@router.get("/chats", response_model=Dict[str, object])
async def get_chats(
    filter_type: Optional[ChatType] = Query(ChatType.ALL, description="Filter chats by type"),
    limit: int = Query(20, ge=1, le=100, description="Number of chats to retrieve"),
    offset_id: Optional[int] = Query(None, description="Offset dialog ID for pagination"),
    offset_date: Optional[int] = Query(None, description="Offset date (unix timestamp) for pagination"),
    offset_peer_type: Optional[str] = Query(None, description="Offset peer type (user, chat, channel) for pagination"),
    offset_peer_id: Optional[int] = Query(None, description="Offset peer ID for pagination"),
    tg_client = Depends(get_telegram_client)
):
    """
    Получить список чатов Telegram с фильтрацией по типу, пагинацией и статистику непрочитанных.
    """
    chats, next_offset = await TelegramService.get_chats(
        tg_client, filter_type, limit, offset_id, offset_date, offset_peer_type, offset_peer_id
    )
    stats = await TelegramService.get_chats_stats(tg_client)
    return {"stats": stats, "chats": chats, "next_offset": next_offset}

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
async def download_media(
    chat_id: int,
    message_id: int,
    range_header: Optional[str] = Header(None, alias="Range"),
    tg_client = Depends(get_telegram_client)
):
    """
    Optimized download media endpoint with caching, range support, and faster Telethon parameters.
    """
    import tempfile
    tmp_dir = tempfile.gettempdir()
    entity = await tg_client.get_entity(chat_id)
    msg = await tg_client.get_messages(entity, ids=message_id)
    if not msg or not (msg.photo or msg.document or msg.sticker or msg.voice):
        raise HTTPException(status_code=404, detail="Media not found")
    # Remove part_size_kb and workers for compatibility
    file_path = await tg_client.download_media(
        msg,
        file=tmp_dir
    )
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Failed to download media")
    filename = os.path.basename(file_path)
    # Determine content type
    if msg.photo:
        content_type = "image/jpeg"
    elif msg.sticker:
        content_type = "image/webp"
    elif msg.voice:
        content_type = "audio/ogg"
    elif msg.document:
        content_type = "application/octet-stream"
    else:
        content_type = "application/octet-stream"
    # Headers for caching and range support
    etag = f'W/"{int(os.path.getmtime(file_path))}"'
    headers = {
        "Cache-Control": "public, max-age=86400",
        "ETag": etag,
        "Accept-Ranges": "bytes",
        "Content-Disposition": f'inline; filename="{filename}"'
    }
    status_code = 206 if range_header else 200
    return FileResponse(
        path=file_path,
        media_type=content_type,
        headers=headers,
        status_code=status_code
    )

@router.post("/auth/request_code", response_model=PhoneCodeHash)
async def auth_request_code(request_data: AuthRequestCode, tg_client = Depends(get_telegram_client)):
    """Request a login code from Telegram."""
    return await TelegramService.request_login_code(tg_client, request_data.phone_number)

@router.post("/auth/submit_code", response_model=AuthStatus)
async def auth_submit_code(request_data: AuthSubmitCode, tg_client = Depends(get_telegram_client)):
    """Submit the login code (and password if 2FA is enabled)."""
    return await TelegramService.submit_login_code(
        tg_client,
        request_data.phone_number,
        request_data.phone_code_hash,
        request_data.code,
        request_data.password
    )

@router.get("/auth/status", response_model=AuthStatus)
async def auth_status(tg_client = Depends(get_telegram_client)):
    """Check the current authentication status."""
    return await TelegramService.get_auth_status(tg_client)

@router.post("/auth/logout", response_model=AuthStatus)
async def auth_logout(tg_client = Depends(get_telegram_client)):
    """Log out the current session."""
    return await TelegramService.logout(tg_client)


@router.get("/chat_avatar/{chat_id}")
async def get_chat_avatar(chat_id: int, tg_client = Depends(get_telegram_client)):
    """Get chat/group/channel avatar thumbnail with caching headers."""
    entity = await tg_client.get_entity(chat_id)
    if not getattr(entity, 'photo', None):
        raise HTTPException(status_code=404, detail="No avatar")
    # Ensure avatar directory exists
    avatar_dir = "./avatar/"
    os.makedirs(avatar_dir, exist_ok=True)
    # Sanitize filename (remove forbidden characters)
    safe_title = re.sub(r'[\\/*?:"<>|]', "_", getattr(entity, "title", str(chat_id)))
    tmp_path = await tg_client.download_profile_photo(entity, file=os.path.join(avatar_dir, f"{safe_title}.jpg"))
    if not tmp_path or not os.path.exists(tmp_path):
        raise HTTPException(status_code=404, detail="Failed to download avatar")
    # Caching headers with ETag based on file_reference
    etag = None
    if getattr(entity.photo, 'file_reference', None):
        etag = f'W/"{entity.photo.file_reference.hex()}"'
    headers = {"Cache-Control": "public, max-age=86400"}
    if etag:
        headers["ETag"] = etag
    return FileResponse(tmp_path, media_type="image/jpeg", headers=headers)

@router.get("/chats/{chat_id}/persona_mirror", response_model=UserProfileInsights)
async def get_persona_mirror(
    chat_id: int,
    analyze_person: str = "self",
    tg_client = Depends(get_telegram_client)
):
    """
    Получить краткий AI-портрет собеседника (Persona Mirror) по последним сообщениям чата.
    :param chat_id: ID чата
    :param analyze_person: 'self' или имя/username собеседника
    :return: Словарь с результатами анализа (UserProfileInsights)
    """
    result = await TelegramService.analyze_persona_mirror(tg_client, chat_id, analyze_person)
    return result