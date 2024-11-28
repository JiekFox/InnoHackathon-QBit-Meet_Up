from .rabbitmq import publish_message, process_message
from django.core.mail import send_mail
from django.template.loader import render_to_string
from datetime import datetime

class EmailService:
    @staticmethod
    def send_welcome_email(email, username):
        """
        Публикует задачу отправки приветственного письма в RabbitMQ.
        """
        message = {
            "subject": "Добро пожаловать!",
            "recipient": email,
            "template": "email/welcome.html",
            "context": {
                "subject": "Добро пожаловать!",
                "message": f"Здравствуйте, {username}! Спасибо за регистрацию на нашем сайте. Мы рады вас приветствовать!",
                "year": datetime.now().year,
                "username": username,
            },
        }
        publish_message("emails", message)

    @staticmethod
    def send_signed_email(email, username, meeting_title, datetime_beg, meeting_link):
        """
        Публикует задачу отправки письма о подписке на митап в RabbitMQ.
        """
        message = {
            "subject": f"Вы подписались на митап: {meeting_title}!",
            "recipient": email,
            "template": "email/signed.html",
            "context": {
                "subject": f"Вы подписались на митап: {meeting_title}!",
                "message": f"Здравствуйте, {username}! Вы успешно подписались на митап '{meeting_title}'.",
                "datetime_beg": datetime_beg,
                "year": datetime.now().year,
                "username": username,
                "meeting_title": meeting_title,
                "meeting_link": meeting_link,
            },
        }
        publish_message("emails", message)

    @staticmethod
    def process_email(message):
        """
        Обрабатывает сообщение и отправляет email.
        """
        subject = message["subject"]
        recipient = message["recipient"]
        template = message["template"]
        context = message["context"]

        html_message = render_to_string(template, context)
        send_mail(
            subject,
            "",
            None,
            [recipient],
            html_message=html_message,
        )

    @staticmethod
    def process_queue():
        """
        Забирает и обрабатывает сообщения из очереди RabbitMQ.
        """
        process_message("emails", EmailService.process_email)