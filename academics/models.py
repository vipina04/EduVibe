# academics/models.py - FIXED VERSION

from django.db import models
from django.conf import settings  # ✅ FIXED: Use settings instead of direct import

class AcademicClass(models.Model):
    """Academic Class/Grade model - e.g., Grade 10, Grade 11, Class 12"""
    name = models.CharField(max_length=100)  # e.g., "Grade 10", "Class 12"
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Academic Class"
        verbose_name_plural = "Academic Classes"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Subject(models.Model):
    """Subject model - e.g., Mathematics, Physics"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    academic_class = models.ForeignKey(
        AcademicClass, 
        on_delete=models.CASCADE, 
        related_name='subjects'
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ FIXED: Use settings.AUTH_USER_MODEL
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='teaching_subjects'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.academic_class.name}"


class Chapter(models.Model):
    """Chapter model - chapters within a subject"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='chapters')
    order = models.IntegerField(default=0)  # For ordering chapters
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['subject', 'order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.subject.name})"



















# # academics/models.py - FIXED VERSION

# from django.db import models
# from django.conf import settings  # ✅ FIXED: Use settings instead of direct import

# class AcademicClass(models.Model):
#     """Academic Class/Grade model - e.g., Grade 10, Grade 11, Class 12"""
#     name = models.CharField(max_length=100)  # e.g., "Grade 10", "Class 12"
#     description = models.TextField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         verbose_name = "Academic Class"
#         verbose_name_plural = "Academic Classes"
#         ordering = ['name']
    
#     def __str__(self):
#         return self.name


# class Subject(models.Model):
#     """Subject model - e.g., Mathematics, Physics"""
#     name = models.CharField(max_length=100)
#     description = models.TextField(blank=True, null=True)
#     academic_class = models.ForeignKey(
#         AcademicClass, 
#         on_delete=models.CASCADE, 
#         related_name='subjects'
#     )
#     teacher = models.ForeignKey(
#         settings.AUTH_USER_MODEL,  # ✅ FIXED: Use settings.AUTH_USER_MODEL
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True, 
#         related_name='teaching_subjects'
#     )
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         ordering = ['name']
    
#     def __str__(self):
#         return f"{self.name} - {self.academic_class.name}"


# class Chapter(models.Model):
#     """Chapter model - chapters within a subject"""
#     name = models.CharField(max_length=200)
#     description = models.TextField(blank=True, null=True)
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='chapters')
#     order = models.IntegerField(default=0)  # For ordering chapters
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
    
#     class Meta:
#         ordering = ['subject', 'order', 'name']
    
#     def __str__(self):
#         return f"{self.name} ({self.subject.name})"
















# # # academics/models.py

# # from django.db import models
# # from users.models import User

# # class AcademicClass(models.Model):
# #     """Academic Class/Grade model - e.g., Grade 10, Grade 11, Class 12"""
# #     name = models.CharField(max_length=100)  # e.g., "Grade 10", "Class 12"
# #     description = models.TextField(blank=True, null=True)
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     updated_at = models.DateTimeField(auto_now=True)
    
# #     class Meta:
# #         verbose_name = "Academic Class"
# #         verbose_name_plural = "Academic Classes"
# #         ordering = ['name']
    
# #     def __str__(self):
# #         return self.name


# # class Subject(models.Model):
# #     """Subject model - e.g., Mathematics, Physics"""
# #     name = models.CharField(max_length=100)
# #     description = models.TextField(blank=True, null=True)
# #     academic_class = models.ForeignKey(
# #         AcademicClass, 
# #         on_delete=models.CASCADE, 
# #         related_name='subjects'
# #     )
# #     teacher = models.ForeignKey(
# #         User, 
# #         on_delete=models.SET_NULL, 
# #         null=True, 
# #         blank=True, 
# #         related_name='teaching_subjects',
# #         limit_choices_to={'role': 'teacher'}
# #     )
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     updated_at = models.DateTimeField(auto_now=True)
    
# #     class Meta:
# #         ordering = ['name']
    
# #     def __str__(self):
# #         return f"{self.name} - {self.academic_class.name}"


# # class Chapter(models.Model):
# #     """Chapter model - chapters within a subject"""
# #     name = models.CharField(max_length=200)
# #     description = models.TextField(blank=True, null=True)
# #     subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='chapters')
# #     order = models.IntegerField(default=0)  # For ordering chapters
# #     created_at = models.DateTimeField(auto_now_add=True)
# #     updated_at = models.DateTimeField(auto_now=True)
    
# #     class Meta:
# #         ordering = ['subject', 'order', 'name']
    
# #     def __str__(self):
# #         return f"{self.name} ({self.subject.name})"



















# # # from django.db import models

# # # # Create your models here.
# # # from django.db import models




# # # class AcademicClass(models.Model):
# # #     name = models.CharField(max_length=20, unique=True)

# # #     def __str__(self):
# # #         return self.name


# # # class Subject(models.Model):
# # #     name = models.CharField(max_length=50)
# # #     academic_class = models.ForeignKey(
# # #         AcademicClass,
# # #         on_delete=models.CASCADE,
# # #         related_name='subjects'
# # #     )

# # #     def __str__(self):
# # #         return f"{self.name} ({self.academic_class.name})"


# # # class Chapter(models.Model):
# # #     name = models.CharField(max_length=100)
# # #     subject = models.ForeignKey(
# # #         Subject,
# # #         on_delete=models.CASCADE,
# # #         related_name='chapters'
# # #     )
# # #     is_completed = models.BooleanField(default=False)

# # #     def __str__(self):
# # #         return self.name
