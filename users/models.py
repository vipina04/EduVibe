from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)  # Validate in forms
    dob = models.DateField(null=True, blank=True)
    unique_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    class_assigned = models.ForeignKey('admin_tasks.Class', on_delete=models.SET_NULL, null=True, blank=True)  # For students
    subjects = models.ManyToManyField('admin_tasks.Subject', blank=True) 
    otp = models.IntegerField(null=True)
    otp_created = models.DateTimeField(null=True)

    def save(self, *args, **kwargs):
        if not self.unique_id and self.is_approved:
            self.unique_id = f"{self.role.upper()}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        super().save(*args, **kwargs)