"""
Модуль зависимостей для FastAPI.
Содержит функцию для получения TelegramClient с проверкой соединения и авторизации.
"""
from fastapi import Depends, HTTPException
from telethon import TelegramClient
from .config import API_ID, API_HASH, SESSION_NAME

client = TelegramClient(SESSION_NAME, int(API_ID) if API_ID else 0, API_HASH if API_HASH else "")

async def get_telegram_client():
    """
    Возвращает асинхронный TelegramClient.
    Проверяет соединение и авторизацию.
    """
    if not client.is_connected():
        if not all([API_ID, API_HASH]):
            raise HTTPException(status_code=500, detail="Telegram API credentials not configured on the server.")
        try:
            await client.connect()
            if not await client.is_user_authorized():
                raise HTTPException(status_code=401, detail="Telegram client not authorized. Пожалуйста, авторизуйте сессию.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not connect to Telegram: {str(e)}")
    return client
