from rest_framework import serializers
from .models import Meeting, UserProfile, SignedToMeeting
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MeetingSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.all(), source="author", write_only=True
    )

    class Meta:
        model = Meeting
        fields = ['id', 'title', 'author', 'author_id', 'datetime_beg', 'link', 'description', 'image']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user  # Автор назначается текущим пользователем
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'photo', 'user_description']

class SignedToMeetingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  

    class Meta:
        model = SignedToMeeting
        fields = ['id', 'user', 'meeting', 'signed_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = UserProfile.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class UserTokenSerializer(serializers.ModelSerializer):
    access_token = serializers.CharField(source='access')
    refresh_token = serializers.CharField(source='refresh')

    class Meta:
        model = UserProfile
        fields = ['access_token', 'refresh_token']

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        return {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh)
        }
    

class ObtainTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user and user.id is None:
            raise serializers.ValidationError("Invalid user ID.")
        return data
