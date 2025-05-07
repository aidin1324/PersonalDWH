"""
Сервис бизнес-логики для Telegram.
"""
from ..repositories.telegram import TelegramRepository
from ..schemas.telegram import Chat, Message, ChatType, Sender
from telethon.tl.types import User as TelethonUser, Chat as TelethonChat, Channel as TelethonChannel
from typing import List, Optional

class TelegramService:
    """
    Сервис для бизнес-логики Telegram.
    """
    @staticmethod
    async def get_chats(client, filter_type: ChatType, limit: int) -> List[Chat]:
        """
        Получает список чатов с фильтрацией по типу.
        """
        dialogs = await TelegramRepository.get_dialogs(client)
        result_chats: List[Chat] = []
        for dialog in dialogs:
            chat_type_actual: ChatType = ChatType.PERSONAL
            if dialog.is_user:
                chat_type_actual = ChatType.PERSONAL
            elif dialog.is_group:
                chat_type_actual = ChatType.GROUP
            elif dialog.is_channel:
                chat_type_actual = ChatType.CHANNEL
            if filter_type != ChatType.ALL and chat_type_actual != filter_type:
                continue
            last_msg_pydantic = None
            if dialog.message:
                last_msg_pydantic = await TelegramService._convert_telethon_message(dialog.message, client)
            chat_model = Chat(
                id=dialog.id,
                type=chat_type_actual,
                name=dialog.name,
                unread_count=dialog.unread_count,
                last_message=last_msg_pydantic
            )
            result_chats.append(chat_model)
            if len(result_chats) >= limit:
                break
        return result_chats

    @staticmethod
    async def get_chats_stats(client) -> dict:
        """
        Возвращает статистику непрочитанных сообщений по типам чатов.
        """
        dialogs = await TelegramRepository.get_dialogs(client)
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
        """
        Отправляет сообщение в чат.
        """
        try:
            await client.send_message(chat_id, text)
            return True
        except Exception:
            return False

    @staticmethod
    async def get_chat_messages(client, chat_id: int, limit: int, offset_id: int = 0) -> List[Message]:
        """
        Получает сообщения из чата.
        """
        messages = await TelegramRepository.get_messages(client, chat_id, limit, offset_id)
        result_messages: List[Message] = []
        for msg in messages:
            pydantic_msg = await TelegramService._convert_telethon_message(msg, client)
            if pydantic_msg:
                result_messages.append(pydantic_msg)
        return result_messages

    @staticmethod
    async def _convert_telethon_message(msg, client) -> Optional[Message]:
        """
        Преобразует Telethon Message в Pydantic Message с поддержкой медиа и статуса прочтения.
        """
        if not msg:
            return None
        sender_entity = None
        sender_id = None
        sender_name = "Unknown"
        sender_username = None
        if msg.sender_id:
            sender_id = msg.sender_id
            try:
                sender_entity = await client.get_entity(msg.sender_id)
                if isinstance(sender_entity, TelethonUser):
                    sender_name = TelegramService._get_sender_name(sender_entity)
                    sender_username = sender_entity.username
                elif isinstance(sender_entity, (TelethonChat, TelethonChannel)):
                    sender_name = sender_entity.title
            except Exception:
                pass
        # Определение медиа
        media_type = None
        media_url = None
        duration = None
        if msg.sticker:
            media_type = "sticker"
        elif msg.photo:
            media_type = "photo"
        elif msg.voice:
            media_type = "voice"
            duration = getattr(msg.voice, 'duration', None)
        elif msg.document:
            media_type = "document"
        # Для простоты media_url не реализован (можно добавить скачивание и отдачу файлов)
        # Статус прочтения
        is_read = getattr(msg, 'read', None)
        if is_read is None:
            # Для входящих сообщений: если не прочитано, msg.unread = True
            is_read = not getattr(msg, 'unread', False)
        return Message(
            id=msg.id,
            text=getattr(msg, 'text', None) or getattr(msg, 'message', None),
            date=int(msg.date.timestamp()),
            sender=Sender(id=sender_id or 0, name=sender_name, username=sender_username),
            media_type=media_type,
            media_url=media_url,
            duration=duration,
            is_read=is_read
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
