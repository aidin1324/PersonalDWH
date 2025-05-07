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
    async def get_dialogs(client: TelegramClient) -> List[Dialog]:
        """
        Получает список диалогов пользователя.
        """
        dialogs = []
        async for dialog in client.iter_dialogs():
            dialogs.append(dialog)
        return dialogs

    @staticmethod
    async def get_messages(client: TelegramClient, chat_id: int, limit: int, offset_id: int = 0) -> List[TelethonMessage]:
        """
        Получает сообщения из чата.
        """
        entity = await client.get_entity(chat_id)
        messages = []
        async for msg in client.iter_messages(entity, limit=limit, offset_id=offset_id):
            messages.append(msg)
        return messages
