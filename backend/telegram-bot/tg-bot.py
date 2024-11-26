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

# Маршрут для Telegram Webhook
@app.route(f"/webhook/{BOT_TOKEN}", methods=["POST"])
def webhook():
    try:
        # Получаем обновление от Telegram
        update = telegram.Update.de_json(request.get_json(force=True), bot)

        # Логика обработки команд
        if update.message:
            if update.message.text == "/start":
                # Отправляем приветствие и клавиатуру
                keyboard = telegram.ReplyKeyboardMarkup(
                    [["Все юзеры", "Все митапы"], ["Выбор митапа"]],
                    resize_keyboard=True
                )
                update.message.reply_text("Добро пожаловать! [debug] Выберите действие:", reply_markup=keyboard)

            elif update.message.text == "Все юзеры":
                # Запрос к API пользователей
                api_url = os.getenv("BACKEND_URL", "") + "/users/"
                response = requests.get(api_url)
                if response.ok:
                    users = response.json()
                    message = "Пользователи:\n" + "\n".join([f"- {user['name']}" for user in users[:5]])
                else:
                    message = f"Ошибка API: {response.status_code}"
                update.message.reply_text(message)

            elif update.message.text == "Все митапы":
                # Запрос к API митапов
                api_url = os.getenv("BACKEND_URL", "") + "/meetings/"
                response = requests.get(api_url)
                if response.ok:
                    meetings = response.json()
                    message = "Митапы:\n" + "\n".join([f"- {m['title']}" for m in meetings[:5]])
                else:
                    message = f"Ошибка API: {response.status_code}"
                update.message.reply_text(message)

            elif update.message.text == "Выбор митапа":
                # Запрос на ввод ID митапа
                update.message.reply_text("Введите ID митапа для получения информации:")

            elif update.message.text.isdigit():
                # Запрос конкретного митапа по ID
                api_url = os.getenv("BACKEND_URL", "") + f"/meetings/{update.message.text}"
                response = requests.get(api_url)
                if response.ok:
                    meeting = response.json()
                    message = f"Митап:\nНазвание: {meeting['title']}\nОписание: {meeting['description']}"
                else:
                    message = f"Ошибка API: {response.status_code}"
                update.message.reply_text(message)

            else:
                # Обработка неизвестной команды
                update.message.reply_text("Я не понял команду. Пожалуйста, выберите действие из меню.")
        return "OK", 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return "Internal Server Error", 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
