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

            # Обработка команды /start
            if text == "/start":
                keyboard = ReplyKeyboardMarkup(
                    [["Все митапы", "Мои митапы (созданные)", "Мои митапы (подписки)"]],
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text=(
                        "Добро пожаловать! Вы можете:\n"
                        "- Посмотреть список митапов.\n"
                        "- Управлять своими митапами (созданными или подписанными).\n"
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
                        "- Команда 'Мои митапы (созданные)': показывает митапы, которые вы создали.\n"
                        "- Команда 'Мои митапы (подписки)': показывает митапы, на которые вы подписаны.\n"
                        "- Команды для записи/отписки: /subscribe [ID] и /unsubscribe [ID].\n"
                        "Выберите действие из меню или введите команду вручную."
                    )
                )

            # Обработка команды "Все митапы"
            elif text == "Все митапы":
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()
                    message = "Список митапов:\n" + "\n".join(
                        [
                            f'• ({meeting["id"]}) *{meeting["title"]}* '
                            f'(Дата: {datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")}) '
                            f'[🛈](tg://msg?text=/search+{meeting["id"]})'
                            for meeting in meetings[:5]
                        ]
                    )
                except Exception as e:
                    message = f"Ошибка при получении митапов: {e}"
                await bot.send_message(chat_id=update.message.chat.id, text=message, parse_mode="Markdown")

            # Заготовка: "Мои митапы (созданные)"
            elif text == "Мои митапы (созданные)":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Эта функция пока в разработке. Скоро вы сможете увидеть все митапы, которые вы создали."
                )

            # Заготовка: "Мои митапы (подписки)"
            elif text == "Мои митапы (подписки)":
                await bot.send_message(
                    chat_id=update.message.chat.id,
                    text="Эта функция пока в разработке. Скоро вы сможете увидеть все митапы, на которые вы подписаны."
                )

            # Обработка команды /search [id]
            elif text.startswith("/search "):
                query = text.split(" ", 1)[1]
                try:
                    response = requests.get(f"{BACKEND_URL}/meetings/")
                    response.raise_for_status()
                    meetings = response.json()

                    # Поиск митапа по ID
                    meeting = next((m for m in meetings if str(m["id"]) == query), None)
                    if not meeting:
                        raise ValueError("Митап не найден.")

                    formatted_date = datetime.fromisoformat(meeting["datetime_beg"]).strftime("%d.%m.%Y %H:%M")
                    caption = (
                        f"Информация о митапе:\n"
                        f"Название: *{meeting['title']}*\n"
                        f"Описание: _{meeting['description']}_\n"
                        f"Дата: {formatted_date}\n"
                        f"Ссылка: {meeting['link']}"
                    )
                    buttons = InlineKeyboardMarkup([
                        [
                            InlineKeyboardButton(
                                "Записаться",
                                callback_data=f"subscribe {meeting['id']}"
                            ),
                            InlineKeyboardButton(
                                "Отписаться",
                                callback_data=f"unsubscribe {meeting['id']}"
                            )
                        ],
                        [
                            InlineKeyboardButton(
                                "Перейти к митапу",
                                url=f"https://qbit-meetup.web.app/meetup-details/{meeting['id']}"
                            )
                        ]
                    ])
                    if meeting.get("image"):
                        await bot.send_photo(
                            chat_id=update.message.chat.id,
                            photo=meeting["image"],
                            caption=caption,
                            parse_mode="Markdown",
                            reply_markup=buttons
                        )
                    else:
                        await bot.send_message(
                            chat_id=update.message.chat.id,
                            text=caption,
                            parse_mode="Markdown",
                            reply_markup=buttons
                        )
                except Exception as e:
                    message = f"Ошибка при поиске митапа: {e}"
                    await bot.send_message(chat_id=update.message.chat.id, text=message)

            # Обработка callback_data для записки/отписки
            elif update.callback_query:
                callback_data = update.callback_query.data
                if callback_data.startswith("subscribe "):
                    meetup_id = callback_data.split(" ")[1]
                    await bot.send_message(
                        chat_id=update.callback_query.message.chat.id,
                        text=f"Вы успешно записаны на митап {meetup_id}."
                    )
                elif callback_data.startswith("unsubscribe "):
                    meetup_id = callback_data.split(" ")[1]
                    await bot.send_message(
                        chat_id=update.callback_query.message.chat.id,
                        text=f"Вы успешно отписались от митапа {meetup_id}."

                    )

        return {"ok": True}
    except Exception as e:
        logging.error(f"Ошибка обработки: {e}")
        return {"ok": False, "error": str(e)}
