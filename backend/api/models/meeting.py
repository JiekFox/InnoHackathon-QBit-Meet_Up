from api.models.tag import Tag
from api.models.user import UserProfile
from django.db import models


class Meeting(models.Model):
    title = models.CharField(max_length=50)
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="meetings")
    datetime_beg = models.DateTimeField()
    link = models.CharField(max_length=200, null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    is_online = models.BooleanField(default=True)
    description = models.CharField(max_length=1000)
    image = models.ImageField(upload_to="meeting_images/", null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name="meetings")

    def str(self):
        return self.title


class SignedToMeeting(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="subscriptions")
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendees")
    signed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "meeting")

    def __str__(self):
        return f"{self.user.username} -> {self.meeting.title}"
