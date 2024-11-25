from django.urls import path
from .views import send_welcome_email, get_meetings, create_meeting, meeting_detail

urlpatterns = [
    path('send-email/', send_welcome_email, name='send_email'),
    path('meetings/', get_meetings, name='get_meetings'),
    path('meetings/create/', create_meeting, name='create_meeting'),
    path('meetings/<int:pk>', meeting_detail, name='meeting_detail')
]