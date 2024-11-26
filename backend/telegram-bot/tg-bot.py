from fastapi import FastAPI, Request
from telegram import Bot, Update
from dotenv import load_dotenv
import os
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Загрузка переменных окружения
load_dotenv()

# Создание FastAPI приложения
app = FastAPI()

# Инициализация Telegram Bot
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("Не указан токен бота в переменных окружения!")
bot = Bot(token=BOT_TOKEN)

@app.post(f"/webhook/{BOT_TOKEN}")
async def webhook(request: Request):
    try:
        # Получение обновления от Telegram
        data = await request.json()
        update = Update.de_json(data, bot)
        logging.info(f"Обновление: {update}")

        if update.message and update.message.text == "/start":
            # Асинхронная отправка сообщения
            await bot.send_message(chat_id=update.message.chat.id, text="Привет! Бот работает.")

        return {"ok": True}
    except Exception as e:
        logging.error(f"Ошибка обработки: {e}")
        return {"ok": False, "error": str(e)}
