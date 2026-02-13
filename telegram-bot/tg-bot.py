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

            # Проверка состояния пользователя на ожидание ввода для поиска
            if user_id in user_states and user_states[user_id] == "waiting_for_search":
                query = text.strip()
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
                            (
                                m
                                for m in meetings
                                if str(m.get("id")) == query or m.get("title", "").lower() == query.lower()
                            ),
                            None,
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
                                    parse_mode="Markdown",
                                )
                            else:
                                await bot.send_message(
                                    chat_id=update.message.chat.id,
                                    text=caption,
                                    reply_markup=keyboard,
                                    parse_mode="Markdown",
                                )
                            break

                        if not data.get("next"):
                            break
                        page += 1

                    if not found:
                        await bot.send_message(chat_id=update.message.chat.id, text="❌ Митап не найден.")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при поиске митапа: {e}")

            # Сброс состояния пользователя после выполнения поиска
            user_states.pop(user_id, None)

            # Обработка команды /start
            if text == "/start":
                keyboard = ReplyKeyboardMarkup(
                    [["🔍 Поиск", "📜 Все митапы"], ["🎯 Мои митапы (созданные)", "📌 Мои митапы (подписки)"]],
                    resize_keyboard=True,
                    one_time_keyboard=True,
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
                    reply_markup=keyboard,
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
                    ),
                )

            # Команда "Все митапы" с постраничным выводом
            elif text == "Все митапы" or text == "📜 Все митапы" or text == "/meetups":
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
                        keyboard_buttons.append(
                            InlineKeyboardButton("⬅️", callback_data=f"prev_page:{page - 1}:{page_size}")
                        )
                    if data.get("next"):
                        keyboard_buttons.append(
                            InlineKeyboardButton("➡️", callback_data=f"next_page:{page + 1}:{page_size}")
                        )

                    # Если есть кнопки для навигации, добавляем их
                    if keyboard_buttons:
                        keyboard = InlineKeyboardMarkup([keyboard_buttons])
                        await bot.send_message(
                            chat_id=update.message.chat.id, text=message, parse_mode="Markdown", reply_markup=keyboard
                        )
                    else:
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")

                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            elif text == "🔍 Поиск" or text == "Поиск" or text.startswith("/search"):
                if text == "🔍 Поиск":
                    await bot.send_message(
                        chat_id=update.message.chat.id, text="Введите ID или название митапа, который хотите найти."
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
                                (
                                    m
                                    for m in meetings
                                    if str(m.get("id")) == query or m.get("title", "").lower() == query.lower()
                                ),
                                None,
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
                                        parse_mode="Markdown",
                                    )
                                else:
                                    await bot.send_message(
                                        chat_id=update.message.chat.id,
                                        text=caption,
                                        reply_markup=keyboard,
                                        parse_mode="Markdown",
                                    )
                                break

                            if not data.get("next"):
                                break
                            page += 1

                        if not found:
                            await bot.send_message(chat_id=update.message.chat.id, text="❌ Митап не найден.")
                    except Exception as e:
                        await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при поиске митапа: {e}")

            # Команда "Мои митапы (созданные)"
            elif text == "Мои митапы (созданные)":
                try:
                    response = requests.get(f"{BACKEND_URL}/users/meetings_authored_active/?tg_id={user_id}")
                    response.raise_for_status()
                    meetings = response.json()

                    if not meetings:
                        await bot.send_message(chat_id=update.message.chat.id, text="❌ У вас нет созданных митапов.")
                    else:
                        message = "*Ваши созданные митапы:*\n" + "\n".join(
                            [
                                f'• {meeting["title"]} (Дата: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y")}, время: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%H:%M")}) id:{meeting["id"]}'
                                for meeting in meetings
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Команда "Мои митапы (подписки)"
            elif text == "Мои митапы (подписки)":
                try:
                    response = requests.get(f"{BACKEND_URL}/users/meetings_signed_active/?tg_id={user_id}")
                    response.raise_for_status()
                    meetings = response.json()

                    if not meetings:
                        await bot.send_message(chat_id=update.message.chat.id, text="❌ Вы не подписаны на митапы.")
                    else:
                        message = "*Ваши подписки на митапы:*\n" + "\n".join(
                            [
                                f'• {meeting["title"]} (Дата: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y")}, время: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%H:%M")}) id:{meeting["id"]}'
                                for meeting in meetings
                            ]
                        )
                        await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")
                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}")

            # Добавление кнопок "Записаться" и "Отписаться" при просмотре митапа
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
                keyboard_buttons = [[InlineKeyboardButton("Перейти на сайт", url=website_link)]]

                # Проверка подписки
                try:
                    response = requests.get(f"{BACKEND_URL}/users/meetings_signed_active/?tg_id={user_id}")
                    response.raise_for_status()
                    signed_meetings = response.json()
                    is_signed = any(m["id"] == meeting["id"] for m in signed_meetings)

                    if is_signed:
                        keyboard_buttons.append(
                            [InlineKeyboardButton("Отписаться", callback_data=f"unsubscribe:{meeting['id']}")]
                        )
                    else:
                        keyboard_buttons.append(
                            [InlineKeyboardButton("Записаться", callback_data=f"subscribe:{meeting['id']}")]
                        )

                except Exception as e:
                    await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка при проверке подписки: {e}")

                keyboard = InlineKeyboardMarkup(keyboard_buttons)

                if "image" in meeting and meeting["image"]:
                    await bot.send_photo(
                        chat_id=update.message.chat.id,
                        photo=meeting["image"],
                        caption=caption,
                        reply_markup=keyboard,
                        parse_mode="Markdown",
                    )
                else:
                    await bot.send_message(
                        chat_id=update.message.chat.id, text=caption, reply_markup=keyboard, parse_mode="Markdown"
                    )

        # Обработка CallbackQuery для переключения страниц
        elif update.callback_query:
            callback_data = update.callback_query.data
            if callback_data.startswith("prev_page") or callback_data.startswith("next_page"):
                try:
                    _, page_str, page_size_str = callback_data.split(":")
                    page = int(page_str)
                    page_size = int(page_size_str)

                    if page < 1:
                        await bot.answer_callback_query(
                            update.callback_query.id, text="Это первая страница.", show_alert=True
                        )
                        return

                    response = requests.get(f"{BACKEND_URL}/meetings/?page={page}&page_size={page_size}")
                    response.raise_for_status()
                    data = response.json()
                    meetings = data.get("results", [])

                    if not meetings:
                        await bot.answer_callback_query(
                            update.callback_query.id, text="Больше митапов нет.", show_alert=True
                        )
                        return

                    message = f"*Страница {page}:*\n" + "\n".join(
                        [
                            f'• *{meeting.get("title")}* (Дата: {datetime.fromisoformat(meeting.get("datetime_beg")).strftime("%d.%m.%Y")}, время: {datetime.fromisoformat(meeting.get("datetime_beg")).strftime("%H:%M")}) id:{meeting.get("id")}'
                            for meeting in meetings
                        ]
                    )

                    keyboard_buttons = []
                    if data.get("previous"):
                        keyboard_buttons.append(
                            InlineKeyboardButton("⬅️", callback_data=f"prev_page:{page - 1}:{page_size}")
                        )
                    if data.get("next"):
                        keyboard_buttons.append(
                            InlineKeyboardButton("➡️", callback_data=f"next_page:{page + 1}:{page_size}")
                        )

                    # Если есть кнопки для навигации, добавляем их
                    if keyboard_buttons:
                        keyboard = InlineKeyboardMarkup([keyboard_buttons])
                        await bot.edit_message_text(
                            chat_id=update.callback_query.message.chat.id,
                            message_id=update.callback_query.message.message_id,
                            text=message,
                            parse_mode="Markdown",
                            reply_markup=keyboard,
                        )
                    else:
                        await bot.edit_message_text(
                            chat_id=update.callback_query.message.chat.id,
                            message_id=update.callback_query.message.message_id,
                            text=message,
                            parse_mode="Markdown",
                        )

                except Exception as e:
                    await bot.send_message(
                        chat_id=update.callback_query.message.chat.id, text=f"❌ Ошибка при получении митапов: {e}"
                    )

            if callback_data.startswith("subscribe") or callback_data.startswith("unsubscribe"):
                try:
                    _, meeting_id = callback_data.split(":")
                    if callback_data.startswith("subscribe"):
                        response = requests.post(
                            f"{BACKEND_URL}/meetings/{meeting_id}/subscribe_by_id/?tg_id={user_id}"
                        )
                    elif callback_data.startswith("unsubscribe"):
                        response = requests.delete(
                            f"{BACKEND_URL}/meetings/{meeting_id}/unsubscribe_by_id/?tg_id={user_id}"
                        )

                    response.raise_for_status()
                    if response.status_code in [200, 201]:
                        await bot.answer_callback_query(
                            update.callback_query.id, text="Операция выполнена успешно.", show_alert=True
                        )
                    elif response.status_code == 204:
                        await bot.answer_callback_query(
                            update.callback_query.id, text="Вы успешно отписались.", show_alert=True
                        )
                    else:
                        await bot.answer_callback_query(
                            update.callback_query.id, text="Не удалось выполнить операцию.", show_alert=True
                        )
                except Exception as e:
                    await bot.send_message(
                        chat_id=update.callback_query.message.chat.id, text=f"❌ Ошибка при выполнении операции: {e}"
                    )

    except Exception as e:
        logging.error(f"❌ Ошибка обработки: {e}")
        await bot.send_message(chat_id=update.message.chat.id, text=f"❌ Ошибка обработки: {e}")
