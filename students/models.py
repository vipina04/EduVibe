# students/models.py - FIXED VERSION
"""
Student Models with Assignment Submission Support
EduVibe Platform - 2026
"""

from django.db import models
from django.conf import settings  # ✅ FIXED: Use this instead of importing CustomUser


class StudentAnswer(models.Model):
    """Student's answer to a test question"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ FIXED
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    question = models.ForeignKey(
        'teachers.Question', 
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    selected_option = models.IntegerField(null=True, blank=True)  # For MCQ
    descriptive_answer = models.TextField(blank=True)
    attempt = models.ForeignKey(
        'students.TestAttempt',
        on_delete=models.CASCADE,
        related_name='answers',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.student.username} - Q{self.question.id}"


class TestAttempt(models.Model):
    """Student's attempt at a test"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ FIXED
        on_delete=models.CASCADE, 
        related_name='test_attempts'
    )
    test = models.ForeignKey(
        'teachers.Test', 
        on_delete=models.CASCADE, 
        related_name='attempts'
    )
    score = models.IntegerField(default=0)
    attempted_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)  # For sorting in recent tests
    
    class Meta:
        unique_together = ('student', 'test')
    
    def __str__(self):
        return f"{self.student.username} - {self.test.name} - Score: {self.score}"


class AssignmentSubmission(models.Model):
    """
    Student assignment submissions
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # ✅ FIXED
        on_delete=models.CASCADE, 
        related_name='assignment_submissions'
    )
    assignment = models.ForeignKey(
        'teachers.Assignment', 
        on_delete=models.CASCADE, 
        related_name='submissions'
    )
    submitted_file = models.FileField(upload_to='assignment_submissions/', blank=True, null=True)
    submitted_text = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('student', 'assignment')
    
    def __str__(self):
        return f"{self.student.username} - Assignment {self.assignment.id}"


# ✅ Import at the bottom to avoid circular dependency
from academics.models import AcademicClass

class StudentAcademicInfo(models.Model):
    """Student's academic information"""
    student = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_academic_info'
    )
    academic_class = models.ForeignKey(
        AcademicClass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='academic_students'
    )

    def __str__(self):
        return f"{self.student} - {self.academic_class}"













