"""
Репозиторий для работы с Telegram через Telethon.
"""
from telethon import TelegramClient
from telethon.tl.types import Dialog, Message as TelethonMessage
from typing import List

class TelegramRepository:
    """
    Репозиторий для работы с Telegram через Telethon.
    """
    @staticmethod
    async def get_dialogs(client: TelegramClient, limit: int) -> List[Dialog]:
        """
        Получает список диалогов пользователя (оптимизировано).
        """
        return await client.get_dialogs(limit=limit)

    @staticmethod
    async def get_messages(client: TelegramClient, chat_id: int, limit: int, offset_id: int = 0) -> List[TelethonMessage]:
        """
        Получает сообщения из чата (оптимизировано).
        """
        entity = await client.get_input_entity(chat_id)
        return await client.get_messages(entity, limit=limit, offset_id=offset_id)
