from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Meeting
from .serializer import MeetingSerializer
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

@api_view(['GET'])
def get_meetings(request):
    meetings = Meeting.objects.all()
    serialized_data = MeetingSerializer(meetings, many=True).data
    return Response(serialized_data)

@api_view(['GET', 'POST'])
def create_meeting(request):
    data = request.data
    serializer = MeetingSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
def meeting_detail(request, pk):
    try: 
        meeting = Meeting.objects.get(pk=pk)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    elif request.method == 'PUT':
        data = request.data
        serializer = MeetingSerializer(meeting, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)