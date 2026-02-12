from django.contrib.auth.models import AbstractUser
from django.db import models


class UserProfile(AbstractUser):
    email = models.EmailField(unique=True, null=False, blank=False)
    user_description = models.CharField(max_length=255, blank=True)
    photo = models.ImageField(upload_to="user_photos/", blank=True, null=True)

    def __str__(self):
        return self.username
