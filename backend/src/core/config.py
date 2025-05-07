"""
Модуль конфигурации приложения.
Содержит переменные окружения и параметры для подключения к Telegram API.
"""
import os

from telethon import TelegramClient

API_ID = os.getenv("TELEGRAM_API_ID")
API_HASH = os.getenv("TELEGRAM_API_HASH")
PHONE_NUMBER = os.getenv("TELEGRAM_PHONE_NUMBER")
SESSION_NAME = "telegram_session"


async def main():
    client = TelegramClient(SESSION_NAME, int(API_ID), API_HASH)
    await client.start(phone=PHONE_NUMBER)
    print("Authorization complete.")
    await client.disconnect()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())