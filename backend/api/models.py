from django.db import models
from django.contrib.auth.models import AbstractUser


class Meeting(models.Model):
    title = models.CharField(max_length=50)
    author = models.CharField(max_length=50)
    datetime_beg = models.DateTimeField()
    link = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    image = models.ImageField(upload_to='meeting_images/', null=True, blank=True)
    author_photo = models.ImageField(upload_to='author_photos/', null=True, blank=True)


    def __str__(self):
        return self.title
    

class User(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions_set',
        blank=True
    )
    supabase_id = models.CharField(max_length=100, unique=True, null=True, blank=True)  
    photo = models.ImageField(upload_to='user_photos/', null=True, blank=True)

    def __str__(self):
        return self.username


class SignedToMeeting(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendees")
    signed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'meeting')

    def __str__(self):
        return f"{self.user.username} -> {self.meeting.title}"
