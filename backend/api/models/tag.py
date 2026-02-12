from colorfield.fields import ColorField
from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Tag")
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    color = ColorField(
        default="#FF0000",
        format="hex",
        verbose_name="Tag color",
        samples=[
            ("#FF0000", "Red"),
            ("#0000FF", "Blue"),
            ("#00FF00", "Green"),
            ("#FFFF00", "Yellow"),
            ("#FFA500", "Orange"),
            ("#800080", "Purple"),
            ("#FFC0CB", "Pink"),
            ("#00FFFF", "Cyan"),
            ("#8B4513", "Brown"),
            ("#808080", "Gray"),
            ("#00008B", "Dark Blue"),
            ("#006400", "Dark Green"),
            ("#800000", "Maroon"),
            ("#808000", "Olive"),
            ("#40E0D0", "Turquoise"),
        ],
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]
