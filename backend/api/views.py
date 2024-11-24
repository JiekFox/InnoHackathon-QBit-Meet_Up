from django.shortcuts import render
from django.http import HttpResponse

from datetime import datetime
from .utils import send_email

def send_welcome_email(request):
    subject = "Добро пожаловать!"
    to_email = "vlisichkin2004@gmail.com"
    context = {
        "subject": subject,
        "message": "Спасибо за регистрацию на нашем сайте. Мы рады вас приветствовать!",
        "year": datetime.now().year
    }
    send_email(subject, to_email, "email/index.html", context)
    return HttpResponse("Письмо отправлено")
