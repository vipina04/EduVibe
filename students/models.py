from django.db import models
from users.models import CustomUser
from teachers.models import Test, Question

class StudentAnswer(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    question = models.ForeignKey('teachers.Question', on_delete=models.CASCADE)
    selected_option = models.IntegerField(null=True)  # For MCQ
    descriptive_answer = models.TextField(blank=True)

class TestAttempt(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    test = models.ForeignKey('teachers.Test', on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    attempted_at = models.DateTimeField(auto_now_add=True)