from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework.routers import DefaultRouter
from .views import MeetingViewSet, WelcomeEmailView

router = DefaultRouter()
router.register(r'meetings', MeetingViewSet, basename='meeting')

urlpatterns = [
    path('send-email/', WelcomeEmailView.as_view(), name='send-email'), 
] + router.urls


if settings.DEBUG:  # Только для режима разработки
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)