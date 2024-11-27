from fastapi import FastAPI, Request
from telegram import Bot, Update, ReplyKeyboardMarkup
from dotenv import load_dotenv
import os
import logging
import requests

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Загрузка переменных окружения
load_dotenv()

# Создание FastAPI приложения
app = FastAPI()

# Инициализация Telegram Bot
BOT_TOKEN = os.getenv("BOT_TOKEN")
BACKEND_URL = os.getenv("BACKEND_URL")
if not BOT_TOKEN:
    raise ValueError("Не указан токен бота в переменных окружения!")
if not BACKEND_URL:
    raise ValueError("Не указан BACKEND_URL в переменных окружения!")
bot = Bot(token=BOT_TOKEN)

@app.post(f"/webhook/{BOT_TOKEN}")
async def webhook(request: Request):
    try:
        # Получение обновления от Telegram
        data = await request.json()
        update = Update.de_json(data, bot)
        logging.info(f"Обновление: {update}")

        if update.message:
            text = update.message.text

            # Обработка команды /start
            if text == "/start":
                keyboard = ReplyKeyboardMarkup(
                    [["Все юзеры", "Все митапы"], ["Выбор митапа", "/help"]],
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Добро пожаловать! Выберите действие:",
                    reply_markup=keyboard
                )

            # Обработка команды /help
            elif text == "/help":
                keyboard = ReplyKeyboardMarkup(
                    [["Все юзеры", "Все митапы"], ["Выбор митапа"]],
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Выберите одно из действий:",
                    reply_markup=keyboard
                )

            # Обработка выбора "Все юзеры"
            elif text == "Все юзеры":
                try:
                    response = requests.get(f"{BACKEND_URL}/users/")
                    response.raise_for_status()
                    users = response.json()
                    message = "Список пользователей:\n" + "\n".join(
                        [f"- {user['name']}" for user in users[:5]]
                    )
                except Exception as e:
                    message = f"Ошибка при получении пользователей: {e}"
                await bot.send_message(chat_id=update.message.chat.id, text=message)

            # Обработка выбора "Все митапы"
            elif text == "Все митапы":
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()
                    message = "Список митапов:\n" + "\n".join(
                        [f"- {meeting['title']} (Дата: {meeting['datetime_beg']}, Ссылка: {meeting['link']})"
                         for meeting in meetings[:5]]
                    )
                except Exception as e:
                    message = f"Ошибка при получении митапов: {e}"
                await bot.send_message(chat_id=update.message.chat.id, text=message)

            # Обработка выбора "Выбор митапа"
            elif text == "Выбор митапа":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Введите ID митапа для получения информации:"
                )

            # Обработка команды /search [id]
            elif text.startswith("/search "):
                try:
                    meeting_id = text.split(" ")[1]
                    response = requests.get(f"{BACKEND_URL}/meetings/{meeting_id}")
                    response.raise_for_status()
                    meeting = response.json()
                    message = (
                        f"Информация о митапе:\n"
                        f"Название: {meeting['title']}\n"
                        f"Описание: {meeting['description']}\n"
                        f"Дата: {meeting['datetime_beg']}\n"
                        f"Ссылка: {meeting['link']}\n"
                    )
                    if meeting.get("image"):
                        await bot.send_photo(chat_id=update.message.chat.id, photo=meeting["image"])
                except Exception as e:
                    message = f"Ошибка при получении митапа с ID {meeting_id}: {e}"
                await bot.send_message(chat_id=update.message.chat.id, text=message)

            # Обработка ввода ID митапа
            elif text.isdigit():
                try:
                    meeting_id = text
                    response = requests.get(f"{BACKEND_URL}/meetings/{meeting_id}")
                    response.raise_for_status()
                    meeting = response.json()
                    message = (
                        f"Информация о митапе:\n"
                        f"Название: {meeting['title']}\n"
                        f"Описание: {meeting['description']}\n"
                        f"Дата: {meeting['datetime_beg']}\n"
                        f"Ссылка: {meeting['link']}\n"
                    )
                    if meeting.get("image"):
                        await bot.send_photo(chat_id=update.message.chat.id, photo=meeting["image"])
                except Exception as e:
                    message = f"Ошибка при получении митапа с ID {text}: {e}"
                await bot.send_message(chat_id=update.message.chat.id, text=message)

            # Обработка неизвестных сообщений
            else:
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Я не понимаю эту команду. Пожалуйста, выберите действие из меню."
                )

        return {"ok": True}
    except Exception as e:
        logging.error(f"Ошибка обработки: {e}")
        return {"ok": False, "error": str(e)}
