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

class TeacherSubjectAssignment(models.Model):
    """
    Links teachers to specific subjects in specific classes
    Example: Teacher John teaches Math in Grade 10 and Physics in Grade 11
    """
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subject_assignments',
        limit_choices_to={'role': 'teacher'}
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )
    class_assigned = models.ForeignKey(
        AcademicClass,
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('teacher', 'subject', 'class_assigned')
        verbose_name = "Teacher Subject Assignment"
        verbose_name_plural = "Teacher Subject Assignments"
        ordering = ['teacher', 'class_assigned', 'subject']
    
    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.subject.name} - {self.class_assigned.name}"


# ✅ ADD DOUBT MODELS
class Doubt(models.Model):
    """Student doubts/questions"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('answered', 'Answered'),
    ]
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doubts',
        limit_choices_to={'role': 'student'}
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='doubts'
    )
    doubt_text = models.TextField(blank=True)
    doubt_image = models.ImageField(upload_to='doubts/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Doubt by {self.student.get_full_name()} - {self.subject.name}"


class DoubtReply(models.Model):
    """Replies to doubts"""
    doubt = models.ForeignKey(
        Doubt,
        on_delete=models.CASCADE,
        related_name='replies'
    )
    replied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doubt_replies'
    )
    reply_text = models.TextField(blank=True)
    reply_image = models.ImageField(upload_to='doubt_replies/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Doubt Reply"
        verbose_name_plural = "Doubt Replies"
    
    def __str__(self):
        return f"Reply by {self.replied_by.get_full_name()} to Doubt #{self.doubt.id}"

















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
