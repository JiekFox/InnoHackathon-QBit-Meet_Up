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
AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMyNzk2ODYzLCJpYXQiOjE3MzI3MTA0NjMsImp0aSI6IjYwYTFlMTU5Y2UxNTRhNzhhZDk5ZTdiNjE3YjE4MDZlIiwidXNlcl9pZCI6MSwidXNlcm5hbWUiOiJhZG1pbjEifQ.dhqSgFh8SZMERHzVuwjbgoqlshr8XsKzFEAjMjqI9DE"

if not BOT_TOKEN:
    raise ValueError("Не указан токен бота в переменных окружения!")
if not BACKEND_URL:
    raise ValueError("Не указан BACKEND_URL в переменных окружения!")
bot = Bot(token=BOT_TOKEN)

# Заголовки для авторизации
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}


@app.post(f"/webhook/{BOT_TOKEN}")
async def webhook(request: Request):
    try:
        data = await request.json()
        update = Update.de_json(data, bot)
        logging.info(f"Обновление: {update}")

        if update.message:
            text = update.message.text
            user_id = update.message.from_user.id
            username = update.message.from_user.username or "Unknown"

            # Команда "Все митапы"
            if text == "Все митапы" or text == "/meetups":
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/", headers=HEADERS)
                    response.raise_for_status()
                    meetings = response.json()
                    message = "*Список митапов:*\n" + "\n".join(
                        [
                            f'• ({meeting["id"]}) *{meeting["title"]}* '
                            f'(Дата: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")})'
                            for meeting in meetings[:5]
                        ]
                    )
                    keyboard = InlineKeyboardMarkup(
                        [
                            [InlineKeyboardButton("Выбрать", callback_data="choose_meetup")]
                        ]
                    )
                    await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown", reply_markup=keyboard)
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Мои митапы (созданные)"
            elif text == "Мои митапы (созданные)" or text == "/my_meetups_owner":
                try:
                    response = requests.get(f"{BACKEND_URL}/my_meetups_owner/tg/{user_id}", headers=HEADERS)
                    response.raise_for_status()
                    meetups = response.json()
                    if not meetups:
                        await bot.send_message(chat_id=update.message.chat.id, text="🎯 У вас нет созданных митапов.")
                    else:
                        message = "*Ваши созданные митапы:*\n" + "\n".join(
                            [
                                f'• ({meetup["id"]}) *{meetup["title"]}* '
                                f'(Дата: {datetime.fromisoformat(meetup["datetime_beg"]).strftime("%d.%m.%Y %H:%M")})'
                                for meetup in meetups
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Мои митапы (подписки)"
            elif text == "Мои митапы (подписки)" or text == "/my_meetups_subscriber":
                try:
                    response = requests.get(f"{BACKEND_URL}/my_meetups_subscriber/tg/{user_id}", headers=HEADERS)
                    response.raise_for_status()
                    meetups = response.json()
                    if not meetups:
                        await bot.send_message(chat_id=update.message.chat.id, text="📌 Вы пока не подписаны на митапы.")
                    else:
                        message = "*Ваши подписки на митапы:*\n" + "\n".join(
                            [
                                f'• ({meetup["id"]}) *{meetup["title"]}* '
                                f'(Дата: {datetime.fromisoformat(meetup["datetime_beg"]).strftime("%d.%m.%Y %H:%M")})'
                                for meetup in meetups
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Поиск"
            elif text.startswith("/search "):
                query = text.split(" ", 1)[1].strip()
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/", headers=HEADERS)
                    response.raise_for_status()
                    meetings = response.json()
                    meeting = next(
                        (m for m in meetings if str(m["id"]) == query or m["title"].lower() == query.lower()),
                        None
                    )
                    if not meeting:
                        await bot.send_message(chat_id=update.message.chat.id, text="❌ Митап не найден.")
                        return

                    formatted_date = datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")
                    caption = (
                        f"Информация о митапе:\n"
                        f"Название: *{meeting['title']}*\n"
                        f"Описание: _{meeting['description']}_\n"
                        f"Дата: {formatted_date}"
                    )
                    website_link = f"https://qbit-meetup.web.app/meetup-details/{meeting['id']}"
                    keyboard = InlineKeyboardMarkup(
                        [[InlineKeyboardButton("Перейти на сайт", url=website_link)]]
                    )

                    if "image" in meeting and meeting["image"]:
                        await bot.send_photo(
                            chat_id=update.message.chat.id,
                            photo=meeting["image"],
                            caption=caption,
                            reply_markup=keyboard,
                            parse_mode="Markdown"
                        )
                    else:
                        await bot.send_message(
                            chat_id=update.message.chat.id,
                            text=caption,
                            reply_markup=keyboard,
                            parse_mode="Markdown"
                        )
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при поиске митапа: {e}")

        # Обработка CallbackQuery
        elif update.callback_query:
            callback_data = update.callback_query.data
            if callback_data == "choose_meetup":
                await bot.send_message(
                    chat_id=update.callback_query.message.chat.id,
                    text="Введите ID или название митапа, который хотите выбрать."
                )

        return {"ok": True}
    except Exception as e:
        logging.error(f"❌ Ошибка обработки: {e}")
        return {"ok": False, "error": str(e)}
