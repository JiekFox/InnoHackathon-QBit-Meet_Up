from rest_framework import serializers
from .models import Meeting, UserProfile, SignedToMeeting
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MeetingSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Meeting
        fields = ["id", "title", "author", "datetime_beg", "is_online", "link", "location", "description", "image"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "username", "first_name","last_name","email", "photo", "user_description", "tg_id", "teams_id"]

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
    def validate(self, attrs):
        data = super().validate(attrs)
        data["username"] = self.user.username
        data["user_id"] = self.user.id
        refresh = self.get_token(self.user)
        refresh["username"] = self.user.username
        refresh["user_id"] = self.user.id
        data["access"] = str(refresh.access_token)
        data["refresh"] = str(refresh)
        user = self.user
        if user and user.id is None:
            raise serializers.ValidationError("Invalid user ID.")
        return data
