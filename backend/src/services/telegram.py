"""
Сервис бизнес-логики для Telegram.
"""
import datetime
from ..repositories.telegram import TelegramRepository
from ..schemas.telegram import Chat, Message, ChatType, Sender, AuthStatus, PhoneCodeHash
from telethon.tl.types import User as TelethonUser, Chat as TelethonChat, Channel as TelethonChannel
from telethon.errors.rpcerrorlist import SessionPasswordNeededError, PhoneCodeInvalidError
from typing import List, Optional, Dict
from fastapi import Request, HTTPException

class TelegramService:
    """Business logic for Telegram operations."""
    @staticmethod
    async def get_chats(client, filter_type: ChatType, limit: int, offset_id: int = None, offset_date: int = None, offset_peer_type: str = None, offset_peer_id: int = None):
        """Get a list of chats filtered by type (with avatar_url) with pagination support."""
        from telethon.tl.types import PeerUser, PeerChat, PeerChannel
        import logging
        
        # Логирование параметров для отладки
        print(f"Params: limit={limit}, offset_id={offset_id}, offset_date={offset_date}, offset_peer_type={offset_peer_type}, offset_peer_id={offset_peer_id}")
        
        dialogs_kwargs = {
            "limit": limit + 1
        }
        
        # Формируем только необходимые параметры, чтобы не передавать None
        if offset_id is not None:
            dialogs_kwargs["offset_id"] = offset_id
        if offset_date is not None:
            dialogs_kwargs["offset_date"] = datetime.datetime.fromtimestamp(offset_date, tz=datetime.timezone.utc)
        if offset_peer_type and offset_peer_id:
            if offset_peer_type == "user":
                dialogs_kwargs["offset_peer"] = PeerUser(offset_peer_id)
            elif offset_peer_type == "chat":
                dialogs_kwargs["offset_peer"] = PeerChat(offset_peer_id)
            elif offset_peer_type == "channel":
                dialogs_kwargs["offset_peer"] = PeerChannel(offset_peer_id)
        
        # Отладочный вывод
        print(f"Telethon params: {dialogs_kwargs}")
        
        dialogs = await client.get_dialogs(**dialogs_kwargs)
        
        print(f"Retrieved {len(dialogs)} dialogs from Telethon")
        
        # Обработка результатов
        result_chats: List[Chat] = []
        count = 0
        
        for dialog in dialogs[:limit]:
            chat_type_actual: ChatType = ChatType.PERSONAL
            if dialog.is_user:
                chat_type_actual = ChatType.PERSONAL
            elif dialog.is_group:
                chat_type_actual = ChatType.GROUP
            elif dialog.is_channel:
                chat_type_actual = ChatType.CHANNEL
            
            # Фильтруем только если задан конкретный тип (не ALL)
            if filter_type != ChatType.ALL and chat_type_actual != filter_type:
                continue
                
            print(f"Processing dialog: id={dialog.id}, name={dialog.name}, type={chat_type_actual}")
            
            last_msg_pydantic = None
            if dialog.message:
                last_msg_pydantic = await TelegramService._convert_telethon_message(dialog.message, client, dialog.id)
            
            avatar_url = f"/telegram/chat_avatar/{dialog.id}" if getattr(getattr(dialog, 'entity', None), 'photo', None) else None
            
            chat_model = Chat(
                id=dialog.id,
                type=chat_type_actual,
                name=dialog.name,
                unread_count=dialog.unread_count,
                last_message=last_msg_pydantic,
                avatar_url=avatar_url
            )
            
            result_chats.append(chat_model)
            count += 1
            if count >= limit:
                break
        
        # Формирование next_offset для следующей страницы
        next_offset = None
        if len(dialogs) > limit:
            next_dialog = dialogs[limit]
            print(f"Next dialog for pagination: id={next_dialog.id}, name={next_dialog.name}")
            
            peer_type = None
            peer_id = None
            
            if next_dialog.is_user:
                peer_type = "user"
                peer_id = next_dialog.entity.id
            elif next_dialog.is_group:
                peer_type = "chat"
                peer_id = next_dialog.entity.id
            elif next_dialog.is_channel:
                peer_type = "channel"
                peer_id = next_dialog.entity.id
            
            # Получаем ID сообщения и дату из диалога
            offset_id = None
            offset_date = None
            if hasattr(next_dialog, "message") and next_dialog.message:
                offset_id = next_dialog.message.id
                offset_date = int(next_dialog.message.date.timestamp())
                print(f"Next dialog message: id={offset_id}, date={offset_date}")
            
            next_offset = {
                "offset_id": offset_id,
                "offset_date": offset_date,
                "offset_peer_type": peer_type,
                "offset_peer_id": peer_id
            }
            print(f"Prepared next_offset: {next_offset}")
        
        return result_chats, next_offset

    @staticmethod
    async def get_chats_stats(client) -> Dict[str, object]:
        """Get unread messages statistics by chat type."""
        dialogs = await TelegramRepository.get_dialogs(client, limit=1000)  # Получаем до 1000 чатов для статистики
        stats = {"personal_unread": 0, "group_unread": 0, "channel_unread": 0}
        for dialog in dialogs:
            if dialog.is_user:
                stats["personal_unread"] += dialog.unread_count or 0
            elif dialog.is_group:
                stats["group_unread"] += dialog.unread_count or 0
            elif dialog.is_channel:
                stats["channel_unread"] += dialog.unread_count or 0
        return stats

    @staticmethod
    async def send_message(client, chat_id: int, text: str) -> bool:
        """Send a message to a chat."""
        try:
            await client.send_message(chat_id, text)
            return True
        except Exception:
            return False

    @staticmethod
    async def get_chat_messages(client, chat_id: int, limit: int, offset_id: int = 0) -> List[Message]:
        """Get messages from a chat (parallel conversion)."""
        messages = await TelegramRepository.get_messages(client, chat_id, limit, offset_id)
        import asyncio
        tasks = [TelegramService._convert_telethon_message(m, client, chat_id) for m in messages]
        result_messages = [m for m in await asyncio.gather(*tasks) if m]
        return result_messages

    @staticmethod
    async def _convert_telethon_message(msg, client, chat_id: int) -> Optional[Message]:
        """Convert Telethon Message to Pydantic Message with media and read status support (optimized sender)."""
        if not msg:
            return None
        sender_entity = None
        sender_id = None
        sender_name = "Unknown"
        sender_username = None
        # Оптимизация: используем msg.sender если есть
        if hasattr(msg, 'sender') and msg.sender:
            sender_entity = msg.sender
            sender_id = getattr(sender_entity, 'id', None)
            if hasattr(sender_entity, 'first_name') or hasattr(sender_entity, 'title'):
                sender_name = TelegramService._get_sender_name(sender_entity)
            sender_username = getattr(sender_entity, 'username', None)
        elif msg.sender_id:
            sender_id = msg.sender_id
        # Add sender avatar URL if available
        sender_avatar_url = None
        if sender_entity and getattr(sender_entity, 'photo', None):
            sender_avatar_url = f"/telegram/chat_avatar/{sender_id}"
        media_type = None
        media_url = None
        duration = None
        if msg.sticker:
            media_type = "sticker"
            media_url = f"/media/{chat_id}/{msg.id}"
        elif msg.photo:
            media_type = "photo"
            media_url = f"/media/{chat_id}/{msg.id}"
        elif msg.voice:
            media_type = "voice"
            duration = getattr(msg.voice, 'duration', None)
            media_url = f"/media/{chat_id}/{msg.id}"
        elif msg.document:
            media_type = "document"
            media_url = f"/media/{chat_id}/{msg.id}"
        is_read = getattr(msg, 'read', None)
        if is_read is None:
            is_read = not getattr(msg, 'unread', False)
        # Определяем, от автора ли сообщение
        me = await client.get_me()
        from_author = (sender_id == me.id) if sender_id and me else False
        return Message(
            id=msg.id,
            text=getattr(msg, 'text', None) or getattr(msg, 'message', None),
            date=int(msg.date.timestamp()),
            sender=Sender(id=sender_id or 0, name=sender_name, username=sender_username),
            media_type=media_type,
            media_url=media_url,
            duration=duration,
            is_read=is_read,
            sender_avatar_url=sender_avatar_url,
            from_author=from_author
        )

    @staticmethod
    def _get_sender_name(entity):
        if hasattr(entity, 'first_name') and entity.first_name:
            name = entity.first_name
            if hasattr(entity, 'last_name') and entity.last_name:
                name += f" {entity.last_name}"
            return name.strip()
        if hasattr(entity, 'title'):
            return entity.title
        return "N/A"

    @staticmethod
    async def request_login_code(client, phone_number: str) -> PhoneCodeHash:
        """Request a login code from Telegram."""
        if not client.is_connected():
            await client.connect()
        try:
            result = await client.send_code_request(phone_number)
            return PhoneCodeHash(phone_code_hash=result.phone_code_hash)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to request code: {str(e)}")

    @staticmethod
    async def submit_login_code(client, phone_number: str, phone_code_hash: str, code: str, password: Optional[str] = None) -> AuthStatus:
        """Submit the login code (and password if 2FA is enabled)."""
        if not client.is_connected():
            await client.connect()
        try:
            await client.sign_in(phone=phone_number, code=code, phone_code_hash=phone_code_hash)
            me = await client.get_me()
            return AuthStatus(is_authorized=True, user_id=me.id, phone=me.phone)
        except SessionPasswordNeededError:
            if not password:
                raise HTTPException(status_code=400, detail="Password is required for 2FA.")
            try:
                await client.sign_in(password=password)
                me = await client.get_me()
                return AuthStatus(is_authorized=True, user_id=me.id, phone=me.phone)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to sign in with password: {str(e)}")
        except PhoneCodeInvalidError:
            raise HTTPException(status_code=400, detail="Invalid phone code.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to submit code: {str(e)}")

    @staticmethod
    async def get_auth_status(client) -> AuthStatus:
        """Check the current authentication status."""
        if not client.is_connected():
            await client.connect() # Ensure client is connected before checking authorization
        
        is_authorized = await client.is_user_authorized()
        if is_authorized:
            me = await client.get_me()
            return AuthStatus(is_authorized=True, user_id=me.id, phone=me.phone)
        return AuthStatus(is_authorized=False)

    @staticmethod
    async def logout(client) -> AuthStatus:
        """Log out the current session."""
        if not client.is_connected():
             await client.connect()

        if await client.is_user_authorized():
            await client.log_out()
            return AuthStatus(is_authorized=False, detail="Successfully logged out.")
        return AuthStatus(is_authorized=False, detail="User was not logged in.")
