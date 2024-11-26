from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext, MessageHandler, Filters
import requests

# Базовый URL вашего API
API_URL = "https://innohackathon-qbit-meet-up.onrender.com"

# Функция для старта общения с ботом
def start(update: Update, context: CallbackContext) -> None:
    update.message.reply_text('Привет! Я бот для управления Meet Up! Чем могу помочь?')

# Функция для получения списка митапов
def get_meetups(update: Update, context: CallbackContext) -> None:
    response = requests.get(f"{API_URL}/meetings/")
    if response.status_code == 200:
        meetups = response.json()
        message = "Список митапов:\n"
        for meetup in meetups:
            message += f"{meetup['id']}: {meetup['title']} - {meetup['date']}\n"
        update.message.reply_text(message)
    else:
        update.message.reply_text("Не удалось получить список митапов.")

# Функция для получения информации о конкретном митапе
def get_meetup_info(update: Update, context: CallbackContext) -> None:
    try:
        meetup_id = context.args[0]
        response = requests.get(f"{API_URL}/meetings/{meetup_id}")
        if response.status_code == 200:
            meetup = response.json()
            message = f"Информация о митапе:\nНазвание: {meetup['title']}\nОписание: {meetup['description']}\nДата: {meetup['date']}"
            update.message.reply_text(message)
        else:
            update.message.reply_text("Не удалось получить информацию о митапе.")
    except IndexError:
        update.message.reply_text("Пожалуйста, укажите ID митапа после команды.")

# Функция для создания нового митапа
def create_meetup(update: Update, context: CallbackContext) -> None:
    # Ожидаем, что пользователь предоставит заголовок и описание
    try:
        title, description = context.args[0], ' '.join(context.args[1:])
        data = {
            "title": title,
            "description": description
        }
        response = requests.post(f"{API_URL}/meetings/create", json=data)
        if response.status_code == 201:
            update.message.reply_text("Митап успешно создан!")
        else:
            update.message.reply_text("Не удалось создать митап.")
    except ValueError:
        update.message.reply_text("Пожалуйста, укажите заголовок и описание митапа.")

# Основная функция для запуска бота
def main():
    # Замените 'YOUR_TELEGRAM_TOKEN' на токен вашего бота
    updater = Updater("8120867063:AAGavuuQDz2wsW72Q35Wg9hYuKvvVhmuj0E")

    dispatcher = updater.dispatcher

    # Регистрируем обработчики команд
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("meetups", get_meetups))
    dispatcher.add_handler(CommandHandler("meetup", get_meetup_info))
    dispatcher.add_handler(CommandHandler("create", create_meetup))

    # Запускаем бота
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
