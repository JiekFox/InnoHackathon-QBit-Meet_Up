import logging

from api.utils import convert_to_webp
from django.contrib.auth.models import AbstractUser
from django.db import models

logger = logging.getLogger(__name__)


class UserProfile(AbstractUser):
    email = models.EmailField(unique=True, null=False, blank=False)
    user_description = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to="user_photos/", blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.photo and hasattr(self.photo, "file") and not self.photo.name.endswith(".webp"):
            try:
                new_photo = convert_to_webp(self.photo)
                self.photo.save(new_photo.name, new_photo, save=False)
            except Exception as e:
                logger.warning("Error occurred while saving meetup image: %s", str(e))
                raise e
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
