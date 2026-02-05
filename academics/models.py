from django.db import models

# Create your models here.
from django.db import models

class AcademicClass(models.Model):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=50)
    academic_class = models.ForeignKey(
        AcademicClass,
        on_delete=models.CASCADE,
        related_name='subjects'
    )

    def __str__(self):
        return f"{self.name} ({self.academic_class.name})"


class Chapter(models.Model):
    name = models.CharField(max_length=100)
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='chapters'
    )
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.name
