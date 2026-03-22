from api.models import Meeting, SignedToMeeting, Tag, UserProfile
from rest_framework import serializers
from rest_framework.serializers import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken


def validate_image_size(image):
    if image and image.size > 5 * 1024 * 1024:
        raise ValidationError(detail="The image size should be no more than 5 MB")


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "color"]


class MeetingSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.IntegerField(source="author.id", read_only=True)
    attendees_count = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False, source="tags"
    )
    image = serializers.ImageField(validators=[validate_image_size], required=False, allow_null=True)

    class Meta:
        model = Meeting
        fields = [
            "id",
            "title",
            "author",
            "author_id",
            "datetime_beg",
            "duration",
            "link",
            "location",
            "description",
            "image",
            "attendees_count",
            "tags",
            "tag_ids",
        ]

    def get_attendees_count(self, obj):
        """
        Метод для вычисления количества участников встречи.
        """
        return obj.attendees.count()

    def create(self, validated_data):
        tag_ids = validated_data.pop("tags", [])
        meeting = super().create(validated_data)
        meeting.tags.set(tag_ids)
        return meeting

    def update(self, instance, validated_data):
        tag_ids = validated_data.pop("tags", None)
        meeting = super().update(instance, validated_data)
        if tag_ids is not None:
            meeting.tags.set(tag_ids)
        return meeting


class UserSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField(validators=[validate_image_size], required=False)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "photo",
            "user_description",
        ]


class SignedToMeetingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = SignedToMeeting
        fields = ["id", "user", "meeting", "signed_at"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserProfile
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = UserProfile.objects.create_user(**validated_data)
        return user


class UserTokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()

    @staticmethod
    def get_tokens(user):
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    def to_representation(self, user):
        tokens = self.get_tokens(user)
        return tokens


class ObtainTokenSerializer(TokenObtainPairSerializer):
    def retrieve_role(self):
        if self.user.is_staff:
            return "admin"
        return "user"

    def validate(self, attrs):
        data = super().validate(attrs)
        data["username"] = self.user.username
        data["user_id"] = self.user.id
        data["role"] = self.retrieve_role()
        refresh = self.get_token(self.user)
        refresh["username"] = self.user.username
        refresh["user_id"] = self.user.id
        refresh["role"] = self.retrieve_role()
        data["access"] = str(refresh.access_token)
        data["refresh"] = str(refresh)
        user = self.user
        if user and user.id is None:
            raise serializers.ValidationError("Invalid user ID.")
        return data
