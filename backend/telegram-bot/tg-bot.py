from fastapi import FastAPI, Request
from telegram import Bot, Update, ReplyKeyboardMarkup, InlineKeyboardButton, InlineKeyboardMarkup
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
            user_id = update.message.from_user.id
            username = update.message.from_user.username or "Unknown"

            # Обработка команды /start
            if text == "/start":
                keyboard = ReplyKeyboardMarkup(
                    [["🔍 Поиск", "📜 Все митапы"], ["🎯 Мои митапы (созданные)", "📌 Мои митапы (подписки)"]],
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text=(
                        "👋 Добро пожаловать! Вы можете:\n"
                        "- 📜 Посмотреть список митапов.\n"
                        "- 🎯 Управлять своими митапами (созданные/подписки).\n"
                        "- 🔍 Использовать поиск митапов по ID или названию.\n\n"
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
                        "- 📜 Команда 'Все митапы': отображает список доступных митапов.\n"
                        "- 🎯 Команда 'Мои митапы (созданные)': показывает митапы, которые вы создали.\n"
                        "- 📌 Команда 'Мои митапы (подписки)': показывает митапы, на которые вы подписаны.\n"
                        "- 🔍 Команда 'Поиск': позволяет найти митап по его ID или названию.\n"
                        "- 📝 Запись/отписка: используйте команды /subscribe [ID] и /unsubscribe [ID].\n\n"
                        "Выберите действие из меню или введите команду вручную."
                    )
                )

            # Обработка команды "Все митапы"
            elif text == "📜 Все митапы":
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()
                    message = "📜 *Список митапов:*\n" + "\n".join(
                        [
                            f'• ({meeting["id"]}) *{meeting["title"]}* '
                            f'(📅 Дата: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")})\n'
                            f'  [🛈 Подробнее](tg://msg_url?url=/search%20{meeting["id"]})'
                            for meeting in meetings[:5]
                        ]
                    )
                except Exception as e:
                    message = f"❌ Ошибка при получении митапов: {e}"
                await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")

            # Обработка команды "Мои митапы (созданные)"
            elif text == "🎯 Мои митапы (созданные)":
                request_url = f"{BACKEND_URL}/my_meetups_owner/tg/{user_id}"
                logging.info(f"Пытаюсь отправить запрос: {request_url} с tgUserId={username}")
                try:
                    response = requests.get(request_url)
                    response.raise_for_status()
                    meetups = response.json()
                    if not meetups:
                        await bot.send_message(chat_id=update.message.chat.id, text="🎯 У вас нет созданных митапов.")
                    else:
                        message = "🎯 *Ваши созданные митапы:*\n" + "\n".join(
                            [
                                f'• ({meetup["id"]}) *{meetup["title"]}* '
                                f'(📅 {datetime.fromisoformat(meetup["datetime_beg"]).strftime("%d.%m.%Y %H:%M")})'
                                for meetup in meetups
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(
                        chat_id=update.message.chat.id,
                        text=f"❌ Ошибка при получении созданных митапов: {e}"
                    )

            # Обработка команды "Мои митапы (подписки)"
            elif text == "📌 Мои митапы (подписки)":
                request_url = f"{BACKEND_URL}/my_meetups_subscriber/tg/{user_id}"
                logging.info(f"Пытаюсь отправить запрос: {request_url} с tgUserId={username}")
                try:
                    response = requests.get(request_url)
                    response.raise_for_status()
                    meetups = response.json()
                    if not meetups:
                        await bot.send_message(chat_id=update.message.chat.id, text="📌 Вы пока не подписаны на митапы.")
                    else:
                        message = "📌 *Ваши подписки на митапы:*\n" + "\n".join(
                            [
                                f'• ({meetup["id"]}) *{meetup["title"]}* '
                                f'(📅 {datetime.fromisoformat(meetup["datetime_beg"]).strftime("%d.%m.%Y %H:%M")})'
                                for meetup in meetups
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(
                        chat_id=update.message.chat.id,
                        text=f"❌ Ошибка при получении подписок на митапы: {e}"
                    )

            # Обработка команды поиска
            elif text == "🔍 Поиск":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Введите ID или название митапа для поиска:"
                )

            # Если команда начинается с /search
            elif text.startswith("/search "):
                query = text.split(" ", 1)[1]
                await bot.send_message(chat_id=update.message.chat.id, text=f"🔎 Ищем митап: {query}")

        return {"ok": True}
    except Exception as e:
        logging.error(f"❌ Ошибка обработки: {e}")
        return {"ok": False, "error": str(e)}
