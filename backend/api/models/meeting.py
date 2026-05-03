import logging

from api.models.tag import Tag
from api.models.user import UserProfile
from api.utils import check_file_exists, convert_to_webp
from django.db import models

logger = logging.getLogger(__name__)


class Meeting(models.Model):
    title = models.CharField(max_length=100)
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="meetings")
    datetime_beg = models.DateTimeField()
    duration = models.PositiveIntegerField(default=0)
    link = models.CharField(max_length=500, null=True, blank=True)
    location = models.CharField(max_length=500, null=True, blank=True)
    is_online = models.BooleanField(default=True)
    description = models.CharField(max_length=3000)
    image = models.ImageField(upload_to="meeting_images/", null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name="meetings")

    def str(self):
        return self.title

    def save(self, *args, **kwargs):
        self.image = check_file_exists(self.image, "image", f"meetup {self.id}")
        if self.image and hasattr(self.image, "file") and not self.image.name.endswith(".webp"):
            try:
                new_image = convert_to_webp(self.image)
                self.image.save(new_image.name, new_image, save=False)
            except Exception as e:
                logger.warning("Error occurred while saving meetup image: %s", str(e))
                raise e
        super().save(*args, **kwargs)


class SignedToMeeting(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="subscriptions")
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="attendees")
    signed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "meeting")

    def __str__(self):
        return f"{self.user.username} -> {self.meeting.title}"
