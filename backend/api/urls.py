from django.urls import path
from .views import send_welcome_email

urlpatterns = [
    path('send-email/', send_welcome_email, name='send_email'),
]