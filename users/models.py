# users/models.py - FIXED VERSION
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class CustomUser(AbstractUser):
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )

    OTP_PURPOSE_CHOICES = (
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student'
    )

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    dob = models.DateField(null=True, blank=True)

    unique_id = models.CharField(
        max_length=30,
        unique=True,
        blank=True,
        null=True
    )

    is_approved = models.BooleanField(default=False)

    # ✅ FIXED: Use string reference instead of importing
    # class_assigned = models.ForeignKey(
    #     'admin_tasks.Class',  # ✅ String reference - no import needed
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='students'
    # )
    class_assigned = models.ForeignKey(
    'academics.AcademicClass',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='students'
    )

    # ✅ FIXED: Use string reference instead of importing
    # subjects = models.ManyToManyField(
    #     'admin_tasks.Subject',  # ✅ String reference - no import needed
    #     blank=True,
    #     related_name='teachers'
    # )
    subjects = models.ManyToManyField(
    'academics.Subject',
    blank=True,
    related_name='teachers'
    )

    # OTP fields
    otp = models.IntegerField(null=True, blank=True)
    otp_created = models.DateTimeField(null=True, blank=True)
    otp_purpose = models.CharField(
        max_length=20,
        choices=OTP_PURPOSE_CHOICES,
        null=True,
        blank=True
    )

    def save(self, *args, **kwargs):
        if not self.unique_id and self.is_approved:
            self.unique_id = f"{self.role.upper()}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"











