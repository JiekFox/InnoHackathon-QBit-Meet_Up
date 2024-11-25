from django.db import models


class Meeting(models.Model):
    title = models.CharField(max_length=50)
    author = models.CharField(max_length=50)
    datetime_beg = models.DateTimeField()
    link = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)

    def __str__(self):
        return self.title
