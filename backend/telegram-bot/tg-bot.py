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

# Вспомогательный словарь для хранения состояния пользователей
user_states = {}


@app.post(f"/webhook/{BOT_TOKEN}")
async def webhook(request: Request):
    try:
        data = await request.json()
        update = Update.de_json(data, bot)
        logging.info(f"Обновление: {update}")

        if update.message:
            text = update.message.text
            user_id = update.message.from_user.id

            # Команда "Все митапы" с постраничным выводом
            if text == "Все митапы" or text == "/meetups":
                page = 1
                page_size = 20
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/?page={page}&page_size={page_size}")
                    response.raise_for_status()
                    data = response.json()
                    meetings = data.get("results", [])

                    if not meetings:
                        message = "❌ Нет доступных митапов на этой странице."
                    else:
                        message = f"*Страница {page}:*\n" + "\n".join(
                            [
                                f'• {meeting.get("title")} (Дата: {datetime.fromisoformat(meeting.get("datetime_beg")).strftime("%d.%m.%Y")}, время: {datetime.fromisoformat(meeting.get("datetime_beg")).strftime("%H:%M")}) id:{meeting.get("id")}'
                                for meeting in meetings
                            ]
                        )

                    keyboard_buttons = []
                    if data.get("previous"):
                        keyboard_buttons.append(InlineKeyboardButton("⬅️", callback_data=f"prev_page:{page - 1}:{page_size}"))
                    if data.get("next"):
                        keyboard_buttons.append(InlineKeyboardButton("➡️", callback_data=f"next_page:{page + 1}:{page_size}"))

                    # Если есть кнопки для навигации, добавляем их
                    if keyboard_buttons:
                        keyboard = InlineKeyboardMarkup([keyboard_buttons])
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown", reply_markup=keyboard)
                    else:
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")

                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            elif text == "🔍 Поиск" or text.startswith("/search"):
                if text == "🔍 Поиск":
                    await bot.send_message(
                        chat_id=update.message.chat.id,
                        text="Введите ID или название митапа, который хотите найти."
                    )
                    user_states[user_id] = "waiting_for_search"
                else:
                    query = text.split(" ", 1)[1].strip()
                    try:
                        page = 1
                        page_size = 50
                        found = False
                        while not found:
                            response = requests.get(f"{BACKEND_URL}/meetings/?page={page}&page_size={page_size}")
                            response.raise_for_status()
                            data = response.json()
                            meetings = data.get("results", [])

                            meeting = next(
                                (m for m in meetings if
                                 str(m.get("id")) == query or m.get("title", "").lower() == query.lower()),
                                None
                            )

                            if meeting:
                                found = True
                                formatted_date = datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y")
                                formatted_time = datetime.fromisoformat(meeting["datetime_beg"]).strftime("%H:%M")
                                caption = (
                                    f"Информация о митапе:\n"
                                    f"Название: *{meeting['title']}*\n"
                                    f"Описание: _{meeting['description']}_\n"
                                    f"Дата: {formatted_date}, время: {formatted_time}\n"
                                    f"ID: {meeting['id']}"
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
                                break

                            if not data.get("next"):
                                break
                            page += 1

                        if not found:
                            await bot.send_message(chat_id=update.message.chat.id, text="❌ Митап не найден.")
                    except Exception as e:
                        await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при поиске митапа: {e}")


        # Обработка CallbackQuery для переключения страниц
        elif update.callback_query:
            callback_data = update.callback_query.data
            if callback_data.startswith("prev_page") or callback_data.startswith("next_page"):
                try:
                    _, page_str, page_size_str = callback_data.split(":")
                    page = int(page_str)
                    page_size = int(page_size_str)

                    if page < 1:
                        await bot.answer_callback_query(update.callback_query.id, text="Это первая страница.", show_alert=True)
                        return

                    response = requests.get(f"{BACKEND_URL}/meetings/?page={page}&page_size={page_size}")
                    response.raise_for_status()
                    data = response.json()
                    meetings = data.get("results", [])

                    if not meetings:
                        await bot.answer_callback_query(update.callback_query.id, text="Больше митапов нет.", show_alert=True)
                        return

                    message = f"*Страница {page}:*\n" + "\n".join(
                        [
                            f'• ({meeting.get("id")}) *{meeting.get("title")}* '
                            f'(Дата: {datetime.fromisoformat(meeting.get("datetime_beg")).strftime("%d.%m.%Y %H:%M")})'
                            for meeting in meetings
                        ]
                    )

                    keyboard_buttons = []
                    if data.get("previous"):
                        keyboard_buttons.append(InlineKeyboardButton("⬅️", callback_data=f"prev_page:{page - 1}:{page_size}"))
                    if data.get("next"):
                        keyboard_buttons.append(InlineKeyboardButton("➡️", callback_data=f"next_page:{page + 1}:{page_size}"))

                    # Если есть кнопки для навигации, добавляем их
                    if keyboard_buttons:
                        keyboard = InlineKeyboardMarkup([keyboard_buttons])
                        await bot.edit_message_text(chat_id=update.callback_query.message.chat.id,
                                                    message_id=update.callback_query.message.message_id,
                                                    text=message,
                                                    parse_mode="Markdown",
                                                    reply_markup=keyboard)
                    else:
                        await bot.edit_message_text(chat_id=update.callback_query.message.chat.id,
                                                    message_id=update.callback_query.message.message_id,
                                                    text=message,
                                                    parse_mode="Markdown")

                except Exception as e:
                    await bot.send_message(chat_id=update.callback_query.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

    except Exception as e:
        logging.error(f"❌ Ошибка обработки: {e}")
        await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка обработки: {e}")
