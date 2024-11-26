from rest_framework import serializers
from .models import Meeting, User, SignedToMeeting
from rest_framework_simplejwt.tokens import RefreshToken

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'photo']

class SignedToMeetingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  

    class Meta:
        model = SignedToMeeting
        fields = ['id', 'user', 'meeting', 'signed_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class UserTokenSerializer(serializers.ModelSerializer):
    access_token = serializers.CharField(source='access')
    refresh_token = serializers.CharField(source='refresh')

    class Meta:
        model = User
        fields = ['access_token', 'refresh_token']

    def to_representation(self, instance):
        # Получаем токены с использованием refresh
        refresh = RefreshToken.for_user(instance)
        return {
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh)
        }