from fastapi import FastAPI, Request
from telegram import Bot, Update, ReplyKeyboardMarkup, InputMediaPhoto
from dotenv import load_dotenv
import os
import logging
import requests
from datetime import datetime

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
                    [["Все митапы", "Выбор митапа"]],
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text=(
                        "Добро пожаловать! Вы можете:\n"
                        "- Посмотреть список митапов.\n"
                        "- Выбрать митап по ID.\n"
                        "Если у вас есть вопросы, используйте команду /help."
                    ),
                    reply_markup=keyboard
                )

            # Обработка команды /help
            elif text == "/help":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text=(
                        "Вот что я могу сделать:\n"
                        "- Команда 'Все митапы': отображает список доступных митапов.\n"
                        "- Команда 'Выбор митапа': позволяет ввести ID митапа и получить его описание.\n"
                        "- Команда /search [ID]: позволяет найти митап по его ID.\n"
                        "Выберите действие из меню или введите команду вручную."
                    )
                )

            # Обработка выбора "Все митапы"
            elif text == "Все митапы":
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()
                    message = "Список митапов:\n" + "\n".join(
                        [
                            f'- "{meeting["title"]}" '
                            f'(Дата: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")}, '
                            f'Ссылка: {meeting["link"]})'
                            for meeting in meetings[:5]
                        ]
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
                    formatted_date = datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")
                    caption = (
                        f"Информация о митапе:\n"
                        f"Название: *\"{meeting['title']}\"*\n"
                        f"Описание: _{meeting['description']}_\n"
                        f"Дата: {formatted_date}\n"
                        f"Ссылка: {meeting['link']}"
                    )
                    if meeting.get("image"):
                        await bot.send_photo(
                            chat_id=update.message.chat.id,
                            photo=meeting["image"],
                            caption=caption,
                            parse_mode="Markdown"
                        )
                    else:
                        await bot.send_message(chat_id=update.message.chat.id, text=caption, parse_mode="Markdown")
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
                    formatted_date = datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")
                    caption = (
                        f"Информация о митапе:\n"
                        f"Название: *\"{meeting['title']}\"*\n"
                        f"Описание: _{meeting['description']}_\n"
                        f"Дата: {formatted_date}\n"
                        f"Ссылка: {meeting['link']}"
                    )
                    if meeting.get("image"):
                        await bot.send_photo(
                            chat_id=update.message.chat.id,
                            photo=meeting["image"],
                            caption=caption,
                            parse_mode="Markdown"
                        )
                    else:
                        await bot.send_message(chat_id=update.message.chat.id, text=caption, parse_mode="Markdown")
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
