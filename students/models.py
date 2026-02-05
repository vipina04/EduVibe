from django.db import models
from users.models import CustomUser
from teachers.models import Test, Question

class StudentAnswer(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    question = models.ForeignKey('teachers.Question', on_delete=models.CASCADE)
    selected_option = models.IntegerField(null=True)  # For MCQ
    descriptive_answer = models.TextField(blank=True)
    attempt = models.ForeignKey(
    'students.TestAttempt',
    on_delete=models.CASCADE,
    related_name='answers',
    null=True,
    blank=True
)





class TestAttempt(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    test = models.ForeignKey('teachers.Test', on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    attempted_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('student', 'test')



from academics.models import AcademicClass

class StudentAcademicInfo(models.Model):
    student = models.OneToOneField(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='student_academic_info'
    )
    academic_class = models.ForeignKey(
        AcademicClass,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.student} - {self.academic_class}"
