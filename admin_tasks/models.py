from django.db import models

class Class(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100)
    classes = models.ManyToManyField(Class, related_name='subjects')


    def __str__(self):
        return self.name

class Chapter(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    is_completed = models.BooleanField(default=False)  # Teacher marks

    def __str__(self):
        return self.name

class Notification(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True)  # Individual or null for group
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class FeePayment(models.Model):
    student = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    receipt = models.FileField(upload_to='receipts/', blank=True)