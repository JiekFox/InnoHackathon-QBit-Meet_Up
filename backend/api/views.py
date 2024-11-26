from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from datetime import datetime
from .models import Meeting
from .serializer import MeetingSerializer
from .utils import send_email


class MeetingViewSet(ModelViewSet):
    """
    ViewSet для управления встречами.
    """
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = request.FILES.get('image')
        if image and image.size > 5 * 1024 * 1024:  
            return Response({"error": "Размер файла не должен превышать 5 MB"}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        meeting = self.get_object()
        meeting.delete()
        return Response({"message": "Встреча успешно удалена"}, status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class EmailService:
    @staticmethod
    def send_welcome_email(email):
        subject = "Добро пожаловать!"
        context = {
            "subject": subject,
            "message": "Спасибо за регистрацию на нашем сайте. Мы рады вас приветствовать!",
            "year": datetime.now().year
        }
        send_email(subject, email, "email/index.html", context)
        return "Письмо отправлено"

from rest_framework.views import APIView

class WelcomeEmailView(APIView):
    def get(self, request):
        email = request.query_params.get('email', 'example@example.com')
        message = EmailService.send_welcome_email(email)
        return Response({"message": message}, status=status.HTTP_200_OK)