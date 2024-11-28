from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timezone
from .models import Meeting, SignedToMeeting, UserProfile
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.decorators import action
from .serializers import MeetingSerializer, UserRegistrationSerializer, ObtainTokenSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils import send_email, get_user_by_param
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.pagination import PageNumberPagination
from .filters import MeetingFilter
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from .cache_control import clear_meetings_cache
from .permissions import IsAuthor, IsStaff


class MeetingPagination(PageNumberPagination):
    """
    Класс для настройки пагинации.
    """
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50

class SubscriptionMixin:
    @staticmethod
    def get_meeting(pk):
        try:
            return Meeting.objects.get(pk=pk), None
        except Meeting.DoesNotExist:
            return None, Response({"error": "Meeting not found"}, status=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def manage_subscription(user, meeting, action="subscribe"):
        if action == "subscribe":
            subscription, created = SignedToMeeting.objects.get_or_create(user=user, meeting=meeting)
            return (
                {"message": "Subscribed successfully"} if created else {"message": "Already subscribed"},
                status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        if action == "unsubscribe":
            try:
                subscription = SignedToMeeting.objects.get(user=user, meeting=meeting)
                subscription.delete()
                return {"message": "Unsubscribed successfully"}, status.HTTP_204_NO_CONTENT
            except SignedToMeeting.DoesNotExist:
                return {"error": "Subscription not found"}, status.HTTP_404_NOT_FOUND

class MeetingViewSet(ModelViewSet, SubscriptionMixin):
    """
    ViewSet для управления встречами.
    """
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MeetingPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]  
    filterset_class = MeetingFilter
    search_fields = ["title", "description"]
    ordering_fields = ["datetime_beg", "location"]
    ordering = ["-datetime_beg"]


    def get_permissions(self):
        """
        Возвращает разрешения для текущего действия.
        """
        if self.action in ["list", "retrieve"]:  
            return [AllowAny()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsAuthor(), IsStaff()]
        return super().get_permissions()


    def list(self, request, *args, **kwargs):
            """
            Получение списка мероприятий с кэшированием.
            """

            cache_key = 'meetings_list'
            cached_data = cache.get(cache_key)
            
            if cached_data:
                return Response(cached_data)

            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:

                serializer = self.get_serializer(page, many=True)
                response_data = self.get_paginated_response(serializer.data)
            else:
                serializer = self.get_serializer(queryset, many=True)
                response_data = Response(serializer.data)
            
            cache.set(cache_key, response_data.data, timeout=60 * 5)
            return response_data


    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        image = request.FILES.get("image")
        if image and image.size > 5 * 1024 * 1024:  
            return Response({"error": "Размер файла не должен превышать 5 MB"}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        clear_meetings_cache()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    def destroy(self, request, *args, **kwargs):
        meeting = self.get_object()
        meeting.delete()
        clear_meetings_cache()
        return Response({"message": "Встреча успешно удалена"}, status=status.HTTP_204_NO_CONTENT)


    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        clear_meetings_cache()
        return Response(serializer.data)
    

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


    @action(detail=True, methods=["post"])
    def subscribe(self, request, pk=None):
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response
        response_data, status_code = self.manage_subscription(request.user, meeting, action="subscribe")
        return Response(response_data, status=status_code)

    @action(detail=True, methods=["delete"])
    def unsubscribe(self, request, pk=None):
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response
        response_data, status_code = self.manage_subscription(request.user, meeting, action="unsubscribe")
        return Response(response_data, status=status_code)

    @action(detail=True, methods=["post"])
    def subscribe_by_id(self, request, pk=None):
        user, error_response = self.get_user_from_query_params(request)
        if error_response:
            return error_response
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response
        response_data, status_code = self.manage_subscription(user, meeting, action="subscribe")
        return Response(response_data, status=status_code)

    @action(detail=True, methods=["delete"])
    def unsubscribe_by_id(self, request, pk=None):
        user, error_response = self.get_user_from_query_params(request)
        if error_response:
            return error_response
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response
        response_data, status_code = self.manage_subscription(user, meeting, action="unsubscribe")
        return Response(response_data, status=status_code)

    @staticmethod
    def get_user_from_query_params(request):
        tg_id = request.query_params.get('tg_id')
        teams_id = request.query_params.get('teams_id')
        if not tg_id and not teams_id:
            return None, Response({"error": "tg_id or teams_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        user, error = get_user_by_param(request, 'tg_id' if tg_id else 'teams_id')
        return (user, None) if user else (None, Response({"error": error}, status=status.HTTP_404_NOT_FOUND))
     
       
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
        email = request.query_params.get("email", "example@example.com")
        message = EmailService.send_welcome_email(email)
        return Response({"message": message}, status=status.HTTP_200_OK)


class UserViewSet(ModelViewSet):
    """
    ViewSet для управления пользователями и регистрации.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        """
        Ограничивает доступ к данным только для авторизованных пользователей,
        предоставляя им только те данные, которые они имеют право видеть. (должно работать, но пока что-то кисло)
        """
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        return super().get_queryset().filter(author=user)

    def get_permissions(self):
        """
        Переопределение прав доступа для конкретных действий.
        """
        if self.action in ["register", "list", "retrieve"]:
            return [AllowAny()]
        if self.action in [
                "update",             
                "partial_update", 
                "destroy", 
                "meetings_owned"
            ]:
            return [IsAuthenticated(), IsAuthor(), IsStaff()]
        return super().get_permissions()


    def get_serializer_class(self):
        """
        Возвращает правильный сериализатор для текущего действия.
        """
        if self.action == "register":
            return UserRegistrationSerializer
        elif self.action in [
            "meetings_signed_active", 
            "meetings_signed", 
            "meetings_owned", 
            "meetings_authored_active"
        ]:
            return MeetingSerializer
        return super().get_serializer_class()


    @action(detail=False, methods=["post"])
    def register(self, request):
        """
        Регистрация нового пользователя.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            token_serializer = ObtainTokenSerializer(data={
                "username": user.username,
                "password": request.data.get("password")
            })

            if token_serializer.is_valid():
                tokens = token_serializer.validated_data
                return Response(
                    {
                        "message": "User registered successfully",
                        "user_id": user.id,
                        "username": user.username,
                        "access": tokens.get("access"),
                        "refresh": tokens.get("refresh"),
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"error": "Token generation failed", "details": token_serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=["get"])
    def meetings_owned(self, request, pk=None):
        """
        Возвращает список встреч, созданных пользователем с заданным id.
        """
        try:
            user = UserProfile.objects.get(id=pk)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        meetings = Meeting.objects.filter(author=user)
        serializer = self.get_serializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=["get"])
    def meetings_signed(self, request, pk=None):
        """
        Возвращает список встреч, подписанных пользователем с заданным id.
        """
        try:
            user = UserProfile.objects.get(id=pk)
        except UserProfile.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        meetings = Meeting.objects.filter(attendees__user=user).exclude(author=user)
        serializer = self.get_serializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=False, methods=["get"])
    def meetings_signed_active(self, request):
        """
        Возвращает список актуальных встреч, на которые подписан пользователь по его tg_id или teams_id.
        """
        tg_id = request.query_params.get('tg_id', None)
        teams_id = request.query_params.get('teams_id', None)

        user = None
        if tg_id:
            user, error = get_user_by_param(request, 'tg_id')
        elif teams_id:
            user, error = get_user_by_param(request, 'teams_id')
        else:
            return Response({"error": "tg_id or teams_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if user is None:
            return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)

        now = datetime.now(timezone.utc)

        meetings = Meeting.objects.filter(
            attendees__user=user,
            datetime_beg__gt=now,
        ).exclude(
            author=user
        )

        serializer = self.get_serializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["get"])
    def meetings_authored_active(self, request):
        """
        Возвращает список актуальных встреч, на которые подписан пользователь по его tg_id или teams_id.
        """
        tg_id = request.query_params.get('tg_id', None)
        teams_id = request.query_params.get('teams_id', None)

        user = None
        if tg_id:
            user, error = get_user_by_param(request, 'tg_id')
        elif teams_id:
            user, error = get_user_by_param(request, 'teams_id')
        else:
            return Response({"error": "tg_id or teams_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if user is None:
            return Response({"error": error}, status=status.HTTP_404_NOT_FOUND)

        now = datetime.now(timezone.utc)

        meetings = Meeting.objects.filter(
            author=user,
            datetime_beg__gt=now
        )

        serializer = self.get_serializer(meetings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ObtainTokenView(TokenObtainPairView):
    serializer_class = ObtainTokenSerializer