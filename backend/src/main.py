"""
Главная точка входа FastAPI-приложения.
Подключает роутеры и настраивает события запуска/остановки.
"""
from fastapi import FastAPI
from .api import telegram
from .core.dependencies import client
from .core.config import PHONE_NUMBER, SESSION_NAME, API_ID, API_HASH

app = FastAPI(title="Telegram Personal DWH API")
app.include_router(telegram.router)

@app.on_event("startup")
async def startup_event():
    if all([API_ID, API_HASH, PHONE_NUMBER]):
        try:
            await client.connect()
            if not await client.is_user_authorized():
                print(f"User {PHONE_NUMBER} is not authorized. Please run a separate script to authorize the session '{SESSION_NAME}.session'.")
            else:
                print(f"Successfully connected and authorized as {PHONE_NUMBER}.")
        except Exception as e:
            print(f"Error connecting to Telegram during startup: {e}")
    else:
        print("Telegram client not started due to missing API credentials.")

@app.on_event("shutdown")
async def shutdown_event():
    if client.is_connected():
        await client.disconnect()
        print("Disconnected from Telegram.")

