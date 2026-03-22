from api.models import Meeting, SignedToMeeting, Tag, UserProfile
from api.security.permissions import IsAuthorOrStaff, IsSelfOrStaff, IsStaff
from api.views.filters.filters import MeetingFilter
from api.views.mixins.mixins import MeetingPagination, SubscriptionMixin, UserMeetingQueryMixin
from api.views.serializers.serializers import (
    MeetingSerializer,
    ObtainTokenSerializer,
    TagSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView


class MeetingViewSet(ModelViewSet, SubscriptionMixin):
    """
    ViewSet для управления встречами.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = MeetingSerializer
    pagination_class = MeetingPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MeetingFilter
    search_fields = ["title", "description"]
    ordering_fields = ["datetime_beg", "location"]
    ordering = ["datetime_beg"]

    def get_queryset(self):
        return Meeting.objects.all().prefetch_related("tags").select_related("author")

    def get_permissions(self):
        """
        Возвращает разрешения для текущего действия.
        """
        if self.action in ["list", "retrieve", "attendees"]:
            return [AllowAny()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [AllowAny()]  # TODO: Only for test reasons
            return [IsAuthorOrStaff()]
        return super().get_permissions()

    # @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        """
        Получение списка мероприятий с кэшированием.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        else:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

    # @method_decorator(cache_page(60 * 5))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = request.FILES.get("image")
        if image and image.size > 5 * 1024 * 1024:
            return Response({"error": "Размер файла не должен превышать 5 MB"}, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        # clear_all_cache()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        meeting = self.get_object()
        meeting.delete()
        # clear_all_cache()
        return Response({"message": "Встреча успешно удалена"}, status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        # clear_all_cache()
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"])
    def subscribe(self, request, pk=None):
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response

        response_data, status_code = self.manage_subscription(request.user, meeting, action="subscribe")
        # if status_code == status.HTTP_201_CREATED:
        #     EmailService.send_signed_email(
        #         request.user.email,
        #         request.user.username,
        #         meeting.title,
        #         meeting.datetime_beg.strftime("%Y-%m-%d %H:%M:%S %z"),
        #         meeting.link
        #     )
        #     EmailService.process_queue()
        return Response(response_data, status=status_code)

    @action(detail=True, methods=["delete"])
    def unsubscribe(self, request, pk=None):
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response
        response_data, status_code = self.manage_subscription(request.user, meeting, action="unsubscribe")
        return Response(response_data, status=status_code)

    @action(detail=True, methods=["get"])
    def is_subscribed(self, request, pk=None):
        """
        Проверяет, подписан ли текущий пользователь на мероприятие.
        """
        meeting, error_response = self.get_meeting(pk)
        if error_response:
            return error_response

        try:
            SignedToMeeting.objects.get(user=request.user, meeting=meeting)
            return Response({"message": True}, status=status.HTTP_200_OK)
        except SignedToMeeting.DoesNotExist:
            return Response({"message": False}, status=status.HTTP_200_OK)

    @action(detail=True)
    def attendees(self, request, pk=None):
        """
        Возвращает список пользователей, подписанных на данный митап.
        Доступно всем (как и просмотр деталей митапа).
        Поддерживает пагинацию.
        """
        meeting = self.get_object()
        users = UserProfile.objects.filter(subscriptions__meeting=meeting).order_by("id")

        page = self.paginate_queryset(users)
        if page is not None:
            serializer = UserSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)

        serializer = UserSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)


class UserViewSet(ModelViewSet, UserMeetingQueryMixin):
    """
    ViewSet для управления пользователями и регистрации.
    """

    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["title", "description"]

    def get_filter_backends(self):
        if self.action in ["meetings_owned", "meetings_signed", "meetings_signed_active", "meetings_authored_active"]:
            return [SearchFilter]
        return [DjangoFilterBackend]

    def get_permissions(self):
        """
        Переопределение прав доступа для конкретных действий.
        """
        if self.action in ["register", "list", "retrieve"]:
            return [AllowAny()]  # TODO: Temporary
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsSelfOrStaff()]
        if self.action in ["meetings_owned", "meetings_signed"]:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        """
        Возвращает правильный сериализатор для текущего действия.
        """
        if self.action == "register":
            return UserRegistrationSerializer
        elif self.action in ["meetings_signed_active", "meetings_signed", "meetings_owned", "meetings_authored_active"]:
            return MeetingSerializer
        return super().get_serializer_class()

    # @method_decorator(cache_page(60 * 5))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    # @method_decorator(cache_page(60 * 5))
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        # clear_all_cache()
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        # clear_all_cache()
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        # clear_all_cache()
        return response

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # EmailService.send_welcome_email(user.email, user.username)
            # EmailService.process_queue()

            token_serializer = ObtainTokenSerializer(
                data={"username": user.username, "password": request.data.get("password")}
            )

            if token_serializer.is_valid():
                tokens = token_serializer.validated_data
                return Response(
                    {
                        "message": "User registered successfully",
                        "role": "user",
                        "user_id": user.id,
                        "username": user.username,
                        "access": tokens.get("access"),
                        "refresh": tokens.get("refresh"),
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    {"error": "Token generation failed", "details": token_serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def meetings_owned(self, request, pk=None):
        user, error = self.get_user_by_id(pk)
        if error:
            return error
        return self.get_filtered_paginated_meetings(self.get_authored_meetings(user), request)

    @action(detail=True, methods=["get"])
    def meetings_signed(self, request, pk=None):
        user, error = self.get_user_by_id(pk)
        if error:
            return error

        qs = self.get_signed_meetings(user).order_by("-datetime_beg")
        return self.get_filtered_paginated_meetings(qs, request)


class ObtainTokenView(TokenObtainPairView):
    serializer_class = ObtainTokenSerializer


class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [IsStaff]  # TODO: CHANGE IN FUTURE
    search_fields = ["name", "slug"]
