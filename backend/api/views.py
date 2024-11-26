from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .models import Meeting, SignedToMeeting, UserProfile
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.decorators import action
from .serializers import MeetingSerializer, UserRegistrationSerializer, ObtainTokenSerializer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils import send_email


class MeetingViewSet(ModelViewSet):
    """
    ViewSet для управления встречами.
    """
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    #permission_classes = [IsAuthenticated]

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
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def subscribe(self, request, pk=None):

        user = request.user 
        if not isinstance(user, UserProfile):
            return Response({"error": "User is not of type UserProfile"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            meeting = self.get_object() 
            subscription, created = SignedToMeeting.objects.get_or_create(user=user, meeting=meeting)
            if created:
                return Response({"message": "Subscribed successfully"}, status=status.HTTP_201_CREATED)
            return Response({"message": "Already subscribed"}, status=status.HTTP_200_OK)
        except Meeting.DoesNotExist:
            return Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unsubscribe(self, request, pk=None):
        user = request.user
        try:
            subscription = SignedToMeeting.objects.get(user=user, meeting_id=pk)
            subscription.delete()
            return Response({"message": "Unsubscribed successfully"}, status=status.HTTP_204_NO_CONTENT)
        except SignedToMeeting.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=status.HTTP_404_NOT_FOUND)

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

class WelcomeEmailView(APIView):
    def get(self, request):
        email = request.query_params.get('email', 'example@example.com')
        message = EmailService.send_welcome_email(email)
        return Response({"message": message}, status=status.HTTP_200_OK)

class UserRegistrationViewSet(ModelViewSet):
    """
    ViewSet для регистрации пользователей
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserRegistrationSerializer

    @action(detail=False, methods=['post'], name="Register User")
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User created successfully", "user_id": user.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ObtainTokenView(TokenObtainPairView):
    serializer_class = ObtainTokenSerializer