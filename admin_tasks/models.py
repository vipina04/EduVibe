# admin_tasks/models.py
"""
Admin Tasks Models - FINAL CORRECTED VERSION
EduVibe Platform - Complete Academic Management
"""

from django.db import models
from django.conf import settings


class Class(models.Model):
    """Academic Classes - Grade 1 to 12"""
    name = models.CharField(max_length=50, unique=True)
    # description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Class"
        verbose_name_plural = "Classes"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Subject(models.Model):
    """Subjects that can be taught in multiple classes"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    classes = models.ManyToManyField(Class, related_name='subjects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Chapter(models.Model):
    """Chapters belong to Subject AND Class combination"""
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        related_name='chapters'
    )
    class_assigned = models.ForeignKey(
        Class, 
        on_delete=models.CASCADE, 
        related_name='chapters'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0, help_text="Order of chapter in curriculum")
    is_completed = models.BooleanField(
        default=False, 
        help_text="Marked by teacher when completed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['subject', 'class_assigned', 'order', 'name']
        unique_together = ['subject', 'class_assigned', 'name']
        verbose_name = "Chapter"
        verbose_name_plural = "Chapters"
    
    def __str__(self):
        return f"{self.name} ({self.subject.name} - {self.class_assigned.name})"


class TeacherAssignment(models.Model):
    """
    Assigns teachers to teach specific subjects in specific classes.
    Example: Teacher John teaches Mathematics in Grade 10
    """
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='teaching_assignments',
        limit_choices_to={'role': 'teacher'}
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )
    class_assigned = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        related_name='teacher_assignments'
    )
    assigned_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['teacher', 'subject', 'class_assigned']
        ordering = ['teacher', 'subject', 'class_assigned']
        verbose_name = "Teacher Assignment"
        verbose_name_plural = "Teacher Assignments"
    
    def __str__(self):
        teacher_name = self.teacher.get_full_name() or self.teacher.username
        return f"{teacher_name} → {self.subject.name} in {self.class_assigned.name}"


class Notification(models.Model):
    """System notifications for users"""
    
    RECIPIENT_TYPE_CHOICES = [
        ('all_students', 'All Students'),
        ('all_teachers', 'All Teachers'),
        ('all_users', 'Everyone'),
        ('individual', 'Specific User'),
        ('class_students', 'Students of Specific Class'),
    ]
    
    recipient_type = models.CharField(
        max_length=20, 
        choices=RECIPIENT_TYPE_CHOICES,
        default='individual'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Leave empty for group notifications"
    )
    target_class = models.ForeignKey(
        Class,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="For class-specific notifications"
    )
    title = models.CharField(max_length=200, default="Notification")
    message = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_notifications'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
    
    def __str__(self):
        if self.user:
            return f"To {self.user.username}: {self.title}"
        return f"To {self.get_recipient_type_display()}: {self.title}"
    
    
    # ── Notification Helper ───────────────────────────────────────────────────────
def send_notification(recipient_user, title, message, created_by=None):
    """
    Auto-create a notification for any user.
    Call this from any view — doubt created, reply posted, etc.
    Always wrapped in try/except so it never breaks the main action.
    """
    Notification.objects.create(
        recipient_type='individual',
        user=recipient_user,
        title=title,
        message=message,
        created_by=created_by,
        is_read=False,
    )


class FeePayment(models.Model):
    """Student fee payment records"""
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('online', 'Online Payment'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fee_payments',
        limit_choices_to={'role': 'student'}
    )
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Fee amount in INR"
    )
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash'
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='completed'
    )
    transaction_id = models.CharField(
        max_length=100, 
        blank=True,
        help_text="Transaction/Reference ID"
    )
    receipt_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Auto-generated receipt number"
    )
    receipt = models.FileField(
        upload_to='fee_receipts/',
        blank=True,
        null=True,
        help_text="Generated PDF receipt"
    )
    remarks = models.TextField(blank=True)
    
    # Fee period
    month = models.CharField(max_length=20, blank=True)
    year = models.IntegerField(blank=True, null=True)
    
    # Admin who recorded payment
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_payments'
    )
    
    class Meta:
        ordering = ['-payment_date']
        verbose_name = "Fee Payment"
        verbose_name_plural = "Fee Payments"
    
    def __str__(self):
        student_name = self.student.get_full_name() or self.student.username
        return f"{student_name} - ₹{self.amount} on {self.payment_date.strftime('%d-%m-%Y')}"
    
    def save(self, *args, **kwargs):
        # Auto-generate receipt number if not set
        if not self.receipt_number:
            from django.utils import timezone
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            self.receipt_number = f"FEE-{timestamp}"
        super().save(*args, **kwargs)


















# from django.db import models

# class Class(models.Model):
#     name = models.CharField(max_length=50)

#     def __str__(self):
#         return self.name

# class Subject(models.Model):
#     name = models.CharField(max_length=100)
#     classes = models.ManyToManyField(Class, related_name='subjects')


#     def __str__(self):
#         return self.name

# class Chapter(models.Model):
#     subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
#     class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
#     name = models.CharField(max_length=100)
#     is_completed = models.BooleanField(default=False)  # Teacher marks

#     def __str__(self):
#         return self.name

# class Notification(models.Model):
#     user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, null=True)  # Individual or null for group
#     message = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)

# class FeePayment(models.Model):
#     student = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     paid_at = models.DateTimeField(auto_now_add=True)
#     receipt = models.FileField(upload_to='receipts/', blank=True)