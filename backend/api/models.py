from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator

class UserProfile(AbstractUser):
    
    user_description = models.CharField(max_length=255, null=True, blank=True)
    photo = models.ImageField(upload_to='user_photos/', null=True, blank=True)
    telegram_tag = models.CharField(
        max_length=30, 
        null=True,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^@\w{5,}$',
                message="Enter a valid registration number in the format @ExampleTag.",
                code="invalid_registration",
            )
        ]
    )

    def __str__(self):
        return self.username


class Meeting(models.Model):
    title = models.CharField(max_length=50)
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="meetings")
    datetime_beg = models.DateTimeField()
    link = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    image = models.ImageField(upload_to='meeting_images/', null=True, blank=True)

    def str(self):
        return self.title 


class SignedToMeeting(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="subscriptions")
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendees")
    signed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'meeting')

    def __str__(self):
        return f"{self.user.username} -> {self.meeting.title}"
