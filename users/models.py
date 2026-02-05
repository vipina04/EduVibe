from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class CustomUser(AbstractUser):

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
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    is_approved = models.BooleanField(default=False)

    # For students
    class_assigned = models.ForeignKey(
        'admin_tasks.Class',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # For teachers
    subjects = models.ManyToManyField(
        'admin_tasks.Subject',
        blank=True
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

















# from django.db import models
# from django.contrib.auth.models import AbstractUser
# from django.utils import timezone


# class CustomUser(AbstractUser):

#     ROLE_CHOICES = (
#         ('student', 'Student'),
#         ('teacher', 'Teacher'),
#         ('admin', 'Admin'),
#     )

#     role = models.CharField(
#         max_length=20,
#         choices=ROLE_CHOICES,
#         default='student'
#     )

#     email = models.EmailField(unique=True)
#     phone = models.CharField(
#     max_length=15,
#     unique=True,
#     blank=True,
#     null=True
# )

#     dob = models.DateField(null=True, blank=True)

#     unique_id = models.CharField(
#         max_length=20,
#         unique=True,
#         blank=True,
#         null=True
#     )

#     is_approved = models.BooleanField(default=False)

#     # For students
#     class_assigned = models.ForeignKey(
#         'admin_tasks.Class',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True
#     )

#     # For teachers
#     subjects = models.ManyToManyField(
#         'admin_tasks.Subject',
#         blank=True
#     )



    

#    OTP_PURPOSE_CHOICES = (
#     ('registration', 'Registration'),
#     ('password_reset', 'Password Reset'),
# )

#    otp_purpose = models.CharField(
#     max_length=20,
#     choices=OTP_PURPOSE_CHOICES,
#     null=True,
#     blank=True
# )




#     otp = models.IntegerField(null=True, blank=True)
#     otp_created = models.DateTimeField(null=True, blank=True)

#     def save(self, *args, **kwargs):
#     if not self.unique_id and self.is_approved:
#         timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
#         random_suffix = timezone.now().strftime('%f')[-4:]
#         self.unique_id = f"{self.role.upper()}-{timestamp}{random_suffix}"
#     super().save(*args, **kwargs)


#     def clean(self):
#     if self.role == 'student':
#         self.subjects.clear()
#     elif self.role == 'teacher':
#         self.class_assigned = None
#     elif self.role == 'admin':
#         self.class_assigned = None
#         self.subjects.clear()



#     def __str__(self):
#         return f"{self.username} ({self.role})"














# # from django.db import models
# # from django.contrib.auth.models import AbstractUser
# # from django.utils import timezone

# # class CustomUser(AbstractUser):
# #     ROLE_CHOICES = (
# #         ('student', 'Student'),
# #         ('teacher', 'Teacher'),
# #         ('admin', 'Admin'),



# #     )
# #     role = models.CharField(max_length=10, choices=ROLE_CHOICES)

# #     role = models.CharField(
# #     max_length=20,
# #     choices=ROLE_CHOICES,
# #     default='student'
# # )


# #     email = models.EmailField(unique=True)
# #     phone = models.CharField(max_length=15, blank=True)  # Validate in forms
# #     dob = models.DateField(null=True, blank=True)
# #     unique_id = models.CharField(max_length=20, unique=True, blank=True, null=True)
# #     is_approved = models.BooleanField(default=False)
# #     class_assigned = models.ForeignKey('admin_tasks.Class', on_delete=models.SET_NULL, null=True, blank=True)  # For students
# #     subjects = models.ManyToManyField('admin_tasks.Subject', blank=True) 
# #     otp = models.IntegerField(null=True)
# #     otp_created = models.DateTimeField(null=True)


   



# #     def save(self, *args, **kwargs):
# #         if not self.unique_id and self.is_approved:
# #             self.unique_id = f"{self.role.upper()}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
# #         super().save(*args, **kwargs)


        