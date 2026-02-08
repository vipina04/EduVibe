from django.db import models
from users.models import CustomUser
from admin_tasks.models import Class, Subject, Chapter

class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

class Test(models.Model):
    TYPE_CHOICES = (('mcq', 'MCQ'), ('descriptive', 'Descriptive'))
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, null=True, related_name='tests')  # Or full subject
    marks = models.IntegerField()  # 10,20,50
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Teacher
    duration_minutes = models.IntegerField(default=0)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255, default="Test")
    description = models.TextField(blank=True)



class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    question_text = models.TextField(blank=True)
    question_image = models.ImageField(upload_to='questions/', blank=True)
    option1 = models.CharField(max_length=255, blank=True)
    option2 = models.CharField(max_length=255, blank=True)
    option3 = models.CharField(max_length=255, blank=True)
    option4 = models.CharField(max_length=255, blank=True)
    correct_option = models.IntegerField(null=True)  # 1-4 for MCQ
    explanation = models.TextField(blank=True)

class Attendance(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teacher_attendances')
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='student_attendances')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    is_present = models.BooleanField(default=False)
    class Meta:
        unique_together = ('student', 'class_assigned', 'date')



class Assignment(models.Model):
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, null=True)
    description = models.TextField()
    file = models.FileField(upload_to='assignments/', blank=True)
    due_date = models.DateTimeField(null=True, blank=True)


class Doubt(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='asked_doubts')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to='doubts/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class DoubtReply(models.Model):
    doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to='replies/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

from academics.models import Subject

class TeacherAcademicInfo(models.Model):
    teacher = models.OneToOneField(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='teacher_academic_info'
    )
    subjects = models.ManyToManyField(
        Subject,
        blank=True
    )

    def __str__(self):
        return f"{self.teacher}"









































# from django.db import models
# from users.models import CustomUser
# from admin_tasks.models import Class, Subject, Chapter

# class TeacherAssignment(models.Model):
#     teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

# class Test(models.Model):
#     TYPE_CHOICES = (('mcq', 'MCQ'), ('descriptive', 'Descriptive'))
#     type = models.CharField(max_length=20, choices=TYPE_CHOICES)
#     chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, null=True)  # Or full subject
#     marks = models.IntegerField()  # 10,20,50
#     created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Teacher
#     duration_minutes = models.IntegerField(default=0)
#     start_time = models.DateTimeField(null=True, blank=True)
#     end_time = models.DateTimeField(null=True, blank=True)



# class Question(models.Model):
#     test = models.ForeignKey(Test, on_delete=models.CASCADE)
#     question_text = models.TextField(blank=True)
#     question_image = models.ImageField(upload_to='questions/', blank=True)
#     option1 = models.CharField(max_length=255, blank=True)
#     option2 = models.CharField(max_length=255, blank=True)
#     option3 = models.CharField(max_length=255, blank=True)
#     option4 = models.CharField(max_length=255, blank=True)
#     correct_option = models.IntegerField(null=True)  # 1-4 for MCQ
#     explanation = models.TextField(blank=True)

# class Attendance(models.Model):
#     teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teacher_attendances')
#     student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='student_attendances')
#     class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
#     date = models.DateField()
#     time = models.TimeField()
#     is_present = models.BooleanField(default=False)
#     class Meta:
#         unique_together = ('student', 'class_assigned', 'date')



# class Assignment(models.Model):
#     teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, null=True)
#     description = models.TextField()
#     file = models.FileField(upload_to='assignments/', blank=True)
#     due_date = models.DateTimeField(null=True, blank=True)


# class Doubt(models.Model):
#     student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='asked_doubts')
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
#     text = models.TextField(blank=True)
#     image = models.ImageField(upload_to='doubts/', blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

# class DoubtReply(models.Model):
#     doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE)
#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
#     text = models.TextField(blank=True)
#     image = models.ImageField(upload_to='replies/', blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)

# from academics.models import Subject

# class TeacherAcademicInfo(models.Model):
#     teacher = models.OneToOneField(
#         'users.CustomUser',
#         on_delete=models.CASCADE,
#         related_name='teacher_academic_info'
#     )
#     subjects = models.ManyToManyField(
#         Subject,
#         blank=True
#     )

#     def __str__(self):
#         return f"{self.teacher}"
