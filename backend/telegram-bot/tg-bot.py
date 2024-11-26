from flask import Flask, request
import telegram
import os

from dotenv import load_dotenv  # Импортируем load_dotenv

# Загружаем переменные из .env
load_dotenv()

# Инициализация Flask приложения
app = Flask(__name__)

# Получаем токен бота из переменных окружения
BOT_TOKEN = os.getenv("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("Не указан токен бота в переменных окружения!")

bot = telegram.Bot(token=BOT_TOKEN)

import logging

logging.basicConfig(level=logging.INFO)

@app.route(f"/webhook/{BOT_TOKEN}", methods=["POST"])
def webhook():
    try:
        update = telegram.Update.de_json(request.get_json(force=True), bot)
        logging.info(f"Обновление: {update}")

        if update.message and update.message.text == "/start":
            # Используем bot.send_message для синхронной обработки
            bot.send_message(chat_id=update.message.chat.id, text="Привет! Бот работает.")

        return "OK", 200
    except Exception as e:
        logging.error(f"Ошибка обработки: {e}")
        return "Internal Server Error", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
