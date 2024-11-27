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
            username = update.message.from_user.username or "Unknown"

            # Проверка состояния пользователя на ожидание ввода для поиска
            if user_id in user_states and user_states[user_id] == "waiting_for_search":
                query = text.strip()
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()

                    if isinstance(meetings, dict):
                        meetings = meetings.get("meetings", [])  # Предполагается, что данные могут быть в поле 'meetings'

                    meeting = next(
                        (m for m in meetings if str(m.get("id")) == query or m.get("title", "").lower() == query.lower()),
                        None
                    )
                    if not meeting:
                        await bot.send_message(chat_id=update.message.chat.id, text="❌ Митап не найден.")
                    else:
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

                # Сброс состояния пользователя после выполнения поиска
                user_states.pop(user_id, None)

            # Команда /start
            elif text == "/start":
                keyboard = ReplyKeyboardMarkup(
                    [["\U0001F50D Поиск", "Все митапы"], ["Мои митапы (созданные)", "Мои митапы (подписки)"]],
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="\U0001F44B Добро пожаловать! Вы можете:\n- \U0001F4DC Посмотреть список митапов.\n- \U0001F3AF Управлять своими митапами.\n- \U0001F50D Использовать поиск.",
                    reply_markup=keyboard
                )

            # Команда /help
            elif text == "/help":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text=(
                        "Вот что я могу сделать:\n"
                        "- Команда 'Все митапы': отображает список доступных митапов.\n"
                        "- Команда 'Мои митапы (созданные)': показывает митапы, которые вы создали.\n"
                        "- Команда 'Мои митапы (подписки)': показывает митапы, на которые вы подписаны.\n"
                        "- Команда 'Поиск': позволяет найти митап по ID или названию.\n"
                        "- Команды /subscribe [ID] и /unsubscribe [ID]: подписка/отписка от митапа."
                    )
                )

            # Команда "Все митапы"
            elif text == "Все митапы" or text == "/meetups":
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()

                    if isinstance(meetings, dict):
                        meetings = meetings.get("meetings", [])  # Предполагается, что данные могут быть в поле 'meetings'

                    if isinstance(meetings, list):
                        message = "*Список митапов:*\n" + "\n".join(
                            [
                                f'• ({meeting.get("id")}) *{meeting.get("title")}* '
                                f'(Дата: {datetime.fromisoformat(meeting.get("datetime_beg")).strftime("%d.%m.%Y %H:%M")})'
                                for meeting in meetings[:5]
                            ]
                        )
                    else:
                        message = "❌ Ошибка: не удалось получить список митапов."

                    await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Мои митапы (созданные)"
            elif text == "Мои митапы (созданные)" or text == "/my_meetups_owner":
                try:
                    response = requests.get(f"{BACKEND_URL}/my_meetups_owner/tg/{user_id}")
                    response.raise_for_status()
                    meetups = response.json()
                    if not isinstance(meetups, list) or not meetups:
                        await bot.send_message(chat_id=update.message.chat.id,
                                               text="\U0001F3AF У вас нет созданных митапов.")
                    else:
                        message = "*Ваши созданные митапы:*\n" + "\n".join(
                            [
                                f'• ({meetup.get("id")}) *{meetup.get("title")}* '
                                f'(Дата: {datetime.fromisoformat(meetup.get("datetime_beg")).strftime("%d.%m.%Y %H:%M")})'
                                for meetup in meetups
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Мои митапы (подписки)"
            elif text == "Мои митапы (подписки)" or text == "/my_meetups_subscriber":
                try:
                    response = requests.get(f"{BACKEND_URL}/my_meetups_subscriber/tg/{user_id}")
                    response.raise_for_status()
                    meetups = response.json()
                    if not isinstance(meetups, list) or not meetups:
                        await bot.send_message(chat_id=update.message.chat.id,
                                               text="\U0001F4CC Вы пока не подписаны на митапы.")
                    else:
                        message = "*Ваши подписки на митапы:*\n" + "\n".join(
                            [
                                f'• ({meetup.get("id")}) *{meetup.get("title")}* '
                                f'(Дата: {datetime.fromisoformat(meetup.get("datetime_beg")).strftime("%d.%m.%Y %H:%M")})'
                                for meetup in meetups
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Поиск"
            elif text == "\U0001F50D Поиск":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Введите ID или название митапа, который хотите найти."
                )
                user_states[user_id] = "waiting_for_search"

            # Команда /search
            elif text.startswith("/search "):
                query = text.split(" ", 1)[1].strip()
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()

                    if isinstance(meetings, dict):
                        meetings = meetings.get("meetings", [])  # Предполагается, что данные могут быть в поле 'meetings'

                    meeting = next(
                        (m for m in meetings if str(m.get("id")) == query or m.get("title", "").lower() == query.lower()),
                        None
                    )
                    if not meeting:
                        await bot.send_message(chat_id=update.message.chat.id, text="❌ Митап не найден.")
                    else:
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
            # Если потребуется обработка callback_query, добавьте соответствующую логику здесь.
            pass

    except Exception as e:
        logging.error(f"❌ Ошибка обработки: {e}")
        await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка обработки: {e}")
