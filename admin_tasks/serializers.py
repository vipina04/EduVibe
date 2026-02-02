# admin_tasks/serializers.py
"""
Professional DRF Serializers for Admin Task Management
Built for EduVibe - Educational Platform
Version: 2.0 (2026)
"""

from rest_framework import serializers
from django.db.models import Count, Q
from django.utils import timezone
from .models import Class, Subject, Chapter, Notification, FeePayment


# ═══════════════════════════════════════════════════════════
#  Class Management Serializers
# ═══════════════════════════════════════════════════════════

class ClassListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing classes.
    Includes student and subject counts.
    """
    student_count = serializers.SerializerMethodField()
    subject_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'student_count', 'subject_count']
    
    def get_student_count(self, obj):
        """Count students assigned to this class"""
        return obj.customuser_set.filter(role='student', is_approved=True).count()
    
    def get_subject_count(self, obj):
        """Count subjects available for this class"""
        return obj.subject_set.count()


class ClassDetailSerializer(serializers.ModelSerializer):
    """
    Detailed class information with related data.
    Includes subjects, students, and chapter completion.
    """
    subjects = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    total_chapters = serializers.SerializerMethodField()
    completed_chapters = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = [
            'id', 'name', 'subjects', 'student_count',
            'total_chapters', 'completed_chapters', 'completion_percentage'
        ]
    
    def get_subjects(self, obj):
        """List all subjects for this class"""
        return [
            {
                'id': subject.id,
                'name': subject.name,
                'chapter_count': subject.chapter_set.filter(class_assigned=obj).count()
            }
            for subject in obj.subject_set.all()
        ]
    
    def get_student_count(self, obj):
        return obj.customuser_set.filter(role='student', is_approved=True).count()
    
    def get_total_chapters(self, obj):
        """Total chapters across all subjects for this class"""
        return Chapter.objects.filter(class_assigned=obj).count()
    
    def get_completed_chapters(self, obj):
        """Count completed chapters"""
        return Chapter.objects.filter(class_assigned=obj, is_completed=True).count()
    
    def get_completion_percentage(self, obj):
        """Calculate overall completion percentage"""
        total = self.get_total_chapters(obj)
        if total == 0:
            return 0
        completed = self.get_completed_chapters(obj)
        return round((completed / total) * 100, 2)


class ClassCreateSerializer(serializers.ModelSerializer):
    """
    Create new class with validation.
    """
    class Meta:
        model = Class
        fields = ['name']
    
    def validate_name(self, value):
        """Ensure class name is unique (case-insensitive)"""
        if Class.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                f"Class '{value}' already exists."
            )
        return value.strip().title()


# ═══════════════════════════════════════════════════════════
#  Subject Management Serializers
# ═══════════════════════════════════════════════════════════

class SubjectListSerializer(serializers.ModelSerializer):
    """
    List subjects with class information.
    """
    classes = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    chapter_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'classes', 'teacher_count', 'chapter_count']
    
    def get_classes(self, obj):
        """List all classes where this subject is taught"""
        return [
            {'id': cls.id, 'name': cls.name}
            for cls in obj.classes.all()
        ]
    
    def get_teacher_count(self, obj):
        """Count teachers assigned to this subject"""
        return obj.customuser_set.filter(role='teacher', is_approved=True).count()
    
    def get_chapter_count(self, obj):
        """Total chapters across all classes for this subject"""
        return obj.chapter_set.count()


class SubjectDetailSerializer(serializers.ModelSerializer):
    """
    Detailed subject information with chapters per class.
    """
    classes_info = serializers.SerializerMethodField()
    teachers = serializers.SerializerMethodField()
    total_chapters = serializers.IntegerField(
        source='chapter_set.count',
        read_only=True
    )
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'classes_info', 'teachers', 'total_chapters']
    
    def get_classes_info(self, obj):
        """Detailed info for each class teaching this subject"""
        return [
            {
                'id': cls.id,
                'name': cls.name,
                'chapters': obj.chapter_set.filter(class_assigned=cls).count(),
                'completed_chapters': obj.chapter_set.filter(
                    class_assigned=cls, 
                    is_completed=True
                ).count()
            }
            for cls in obj.classes.all()
        ]
    
    def get_teachers(self, obj):
        """List teachers teaching this subject"""
        teachers = obj.customuser_set.filter(role='teacher', is_approved=True)
        return [
            {
                'id': teacher.id,
                'name': teacher.get_full_name() or teacher.username,
                'email': teacher.email,
                'unique_id': teacher.unique_id
            }
            for teacher in teachers
        ]


class SubjectCreateSerializer(serializers.ModelSerializer):
    """
    Create subject with multiple class assignments.
    """
    class_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True,
        allow_empty=False,
        help_text="List of class IDs to assign this subject"
    )
    
    class Meta:
        model = Subject
        fields = ['name', 'class_ids']
    
    def validate_name(self, value):
        """Ensure subject name is unique"""
        if Subject.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(
                f"Subject '{value}' already exists."
            )
        return value.strip().title()
    
    def validate_class_ids(self, value):
        """Validate all class IDs exist"""
        existing_classes = Class.objects.filter(id__in=value)
        if existing_classes.count() != len(value):
            invalid_ids = set(value) - set(existing_classes.values_list('id', flat=True))
            raise serializers.ValidationError(
                f"Invalid class IDs: {', '.join(map(str, invalid_ids))}"
            )
        return value
    
    def create(self, validated_data):
        """Create subject and assign to classes"""
        class_ids = validated_data.pop('class_ids')
        subject = Subject.objects.create(**validated_data)
        subject.classes.set(class_ids)
        return subject


class SubjectUpdateSerializer(serializers.ModelSerializer):
    """
    Update subject with optional class reassignment.
    """
    class_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=False
    )
    
    class Meta:
        model = Subject
        fields = ['name', 'class_ids']
    
    def validate_class_ids(self, value):
        """Validate all class IDs exist"""
        if value:
            existing_classes = Class.objects.filter(id__in=value)
            if existing_classes.count() != len(value):
                raise serializers.ValidationError("One or more invalid class IDs provided.")
        return value
    
    def update(self, instance, validated_data):
        """Update subject and reassign classes if provided"""
        class_ids = validated_data.pop('class_ids', None)
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update class assignments if provided
        if class_ids is not None:
            instance.classes.set(class_ids)
        
        return instance


# ═══════════════════════════════════════════════════════════
#  Chapter Management Serializers
# ═══════════════════════════════════════════════════════════

class ChapterListSerializer(serializers.ModelSerializer):
    """
    List chapters with subject and class info.
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Chapter
        fields = [
            'id', 'name', 'subject_name', 'class_name',
            'is_completed', 'status'
        ]
    
    def get_status(self, obj):
        """Human-readable status"""
        return "Completed" if obj.is_completed else "In Progress"


class ChapterDetailSerializer(serializers.ModelSerializer):
    """
    Detailed chapter information with related data.
    """
    subject = serializers.SerializerMethodField()
    class_info = serializers.SerializerMethodField()
    test_count = serializers.SerializerMethodField()
    assignment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chapter
        fields = [
            'id', 'name', 'subject', 'class_info',
            'is_completed', 'test_count', 'assignment_count'
        ]
    
    def get_subject(self, obj):
        return {
            'id': obj.subject.id,
            'name': obj.subject.name
        }
    
    def get_class_info(self, obj):
        return {
            'id': obj.class_assigned.id,
            'name': obj.class_assigned.name
        }
    
    def get_test_count(self, obj):
        """Count tests for this chapter"""
        return obj.test_set.count()
    
    def get_assignment_count(self, obj):
        """Count assignments for this chapter"""
        return obj.assignment_set.count()


class ChapterCreateSerializer(serializers.ModelSerializer):
    """
    Create chapter with subject and class validation.
    """
    class Meta:
        model = Chapter
        fields = ['name', 'subject', 'class_assigned', 'is_completed']
        extra_kwargs = {
            'is_completed': {'default': False}
        }
    
    def validate(self, attrs):
        """Validate subject is taught in the selected class"""
        subject = attrs.get('subject')
        class_assigned = attrs.get('class_assigned')
        
        if class_assigned not in subject.classes.all():
            raise serializers.ValidationError({
                'class_assigned': f"Subject '{subject.name}' is not taught in '{class_assigned.name}'"
            })
        
        # Check for duplicate chapter
        if Chapter.objects.filter(
            name__iexact=attrs['name'],
            subject=subject,
            class_assigned=class_assigned
        ).exists():
            raise serializers.ValidationError({
                'name': f"Chapter '{attrs['name']}' already exists for this subject and class."
            })
        
        return attrs


class ChapterUpdateSerializer(serializers.ModelSerializer):
    """
    Update chapter information and completion status.
    """
    class Meta:
        model = Chapter
        fields = ['name', 'is_completed']
    
    def validate_name(self, value):
        """Ensure name is not duplicate within subject-class combination"""
        instance = self.instance
        if Chapter.objects.filter(
            name__iexact=value,
            subject=instance.subject,
            class_assigned=instance.class_assigned
        ).exclude(id=instance.id).exists():
            raise serializers.ValidationError(
                f"Chapter '{value}' already exists for this subject and class."
            )
        return value


# ═══════════════════════════════════════════════════════════
#  Notification Management Serializers
# ═══════════════════════════════════════════════════════════

class NotificationListSerializer(serializers.ModelSerializer):
    """
    List notifications with recipient info.
    """
    recipient_name = serializers.SerializerMethodField()
    recipient_type = serializers.SerializerMethodField()
    message_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient_name', 'recipient_type',
            'message_preview', 'created_at'
        ]
    
    def get_recipient_name(self, obj):
        """Get recipient name or indicate group message"""
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "All Users"
    
    def get_recipient_type(self, obj):
        """Indicate if individual or group notification"""
        if obj.user:
            return f"Individual ({obj.user.get_role_display()})"
        return "Broadcast"
    
    def get_message_preview(self, obj):
        """Show first 100 characters of message"""
        return obj.message[:100] + "..." if len(obj.message) > 100 else obj.message


class NotificationDetailSerializer(serializers.ModelSerializer):
    """
    Full notification details.
    """
    recipient = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'message', 'created_at']
    
    def get_recipient(self, obj):
        """Detailed recipient information"""
        if obj.user:
            return {
                'type': 'individual',
                'id': obj.user.id,
                'name': obj.user.get_full_name() or obj.user.username,
                'email': obj.user.email,
                'role': obj.user.get_role_display()
            }
        return {
            'type': 'broadcast',
            'name': 'All Users'
        }


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Create notification for individual or broadcast.
    """
    send_to = serializers.ChoiceField(
        choices=['individual', 'all', 'students', 'teachers'],
        write_only=True,
        help_text="Target audience for notification"
    )
    user_id = serializers.IntegerField(
        write_only=True,
        required=False,
        help_text="Required if send_to is 'individual'"
    )
    
    class Meta:
        model = Notification
        fields = ['send_to', 'user_id', 'message']
    
    def validate(self, attrs):
        """Validate user_id is provided for individual notifications"""
        send_to = attrs.get('send_to')
        user_id = attrs.get('user_id')
        
        if send_to == 'individual':
            if not user_id:
                raise serializers.ValidationError({
                    'user_id': 'User ID is required for individual notifications.'
                })
            
            # Validate user exists
            from users.models import CustomUser
            try:
                user = CustomUser.objects.get(id=user_id, is_approved=True)
                attrs['user'] = user
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({
                    'user_id': 'User not found or not approved.'
                })
        else:
            attrs['user'] = None
        
        return attrs
    
    def create(self, validated_data):
        """Create notification(s) based on send_to value"""
        send_to = validated_data.pop('send_to')
        validated_data.pop('user_id', None)
        message = validated_data['message']
        
        if send_to == 'individual':
            # Single notification
            return Notification.objects.create(**validated_data)
        
        else:
            # Bulk notifications
            from users.models import CustomUser
            
            if send_to == 'all':
                users = CustomUser.objects.filter(is_approved=True)
            elif send_to == 'students':
                users = CustomUser.objects.filter(role='student', is_approved=True)
            elif send_to == 'teachers':
                users = CustomUser.objects.filter(role='teacher', is_approved=True)
            
            # Create notification for each user
            notifications = [
                Notification(user=user, message=message)
                for user in users
            ]
            Notification.objects.bulk_create(notifications)
            
            # Return a representative notification
            return Notification.objects.filter(message=message).first()


# ═══════════════════════════════════════════════════════════
#  Fee Payment Management Serializers
# ═══════════════════════════════════════════════════════════

class FeePaymentListSerializer(serializers.ModelSerializer):
    """
    List fee payments with student info.
    """
    student_name = serializers.CharField(
        source='student.get_full_name',
        read_only=True
    )
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_unique_id = serializers.CharField(source='student.unique_id', read_only=True)
    student_class = serializers.CharField(
        source='student.class_assigned.name',
        read_only=True,
        allow_null=True
    )
    has_receipt = serializers.SerializerMethodField()
    
    class Meta:
        model = FeePayment
        fields = [
            'id', 'student_name', 'student_email', 'student_unique_id',
            'student_class', 'amount', 'paid_at', 'has_receipt'
        ]
    
    def get_has_receipt(self, obj):
        """Check if receipt is uploaded"""
        return bool(obj.receipt)


class FeePaymentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed fee payment information.
    """
    student = serializers.SerializerMethodField()
    receipt_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FeePayment
        fields = ['id', 'student', 'amount', 'paid_at', 'receipt', 'receipt_url']
    
    def get_student(self, obj):
        """Detailed student information"""
        return {
            'id': obj.student.id,
            'name': obj.student.get_full_name() or obj.student.username,
            'email': obj.student.email,
            'unique_id': obj.student.unique_id,
            'class': obj.student.class_assigned.name if obj.student.class_assigned else None
        }
    
    def get_receipt_url(self, obj):
        """Get full URL for receipt file"""
        if obj.receipt:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt.url)
            return obj.receipt.url
        return None


class FeePaymentCreateSerializer(serializers.ModelSerializer):
    """
    Record new fee payment.
    """
    student_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FeePayment
        fields = ['student_id', 'amount', 'receipt']
    
    def validate_student_id(self, value):
        """Validate student exists and is approved"""
        from users.models import CustomUser
        try:
            student = CustomUser.objects.get(
                id=value,
                role='student',
                is_approved=True
            )
            return student
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Student not found or not approved.")
    
    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
    
    def create(self, validated_data):
        """Create fee payment record"""
        student = validated_data.pop('student_id')
        validated_data['student'] = student
        return FeePayment.objects.create(**validated_data)


class FeePaymentStatsSerializer(serializers.Serializer):
    """
    Fee payment statistics for a student or overall.
    """
    student_id = serializers.IntegerField(required=False)
    
    def validate_student_id(self, value):
        """Validate student exists"""
        if value:
            from users.models import CustomUser
            if not CustomUser.objects.filter(id=value, role='student').exists():
                raise serializers.ValidationError("Student not found.")
        return value
    
    def get_stats(self):
        """Calculate fee payment statistics"""
        student_id = self.validated_data.get('student_id')
        
        if student_id:
            # Stats for specific student
            payments = FeePayment.objects.filter(student_id=student_id)
            total_paid = sum(p.amount for p in payments)
            
            return {
                'student_id': student_id,
                'total_payments': payments.count(),
                'total_amount': float(total_paid),
                'last_payment_date': payments.order_by('-paid_at').first().paid_at if payments.exists() else None,
                'payments': [
                    {
                        'amount': float(p.amount),
                        'date': p.paid_at,
                        'has_receipt': bool(p.receipt)
                    }
                    for p in payments.order_by('-paid_at')
                ]
            }
        else:
            # Overall stats
            from django.db.models import Sum, Count
            stats = FeePayment.objects.aggregate(
                total_payments=Count('id'),
                total_amount=Sum('amount')
            )
            
            return {
                'total_payments': stats['total_payments'] or 0,
                'total_amount': float(stats['total_amount'] or 0),
                'students_paid': FeePayment.objects.values('student').distinct().count()
            }


# ═══════════════════════════════════════════════════════════
#  Dashboard Statistics Serializers
# ═══════════════════════════════════════════════════════════

class AdminDashboardStatsSerializer(serializers.Serializer):
    """
    Overall system statistics for admin dashboard.
    """
    def get_stats(self):
        """Calculate comprehensive admin statistics"""
        from users.models import CustomUser
        
        return {
            'users': {
                'total': CustomUser.objects.count(),
                'students': CustomUser.objects.filter(role='student', is_approved=True).count(),
                'teachers': CustomUser.objects.filter(role='teacher', is_approved=True).count(),
                'admins': CustomUser.objects.filter(role='admin').count(),
                'pending_approval': CustomUser.objects.filter(is_approved=False).count()
            },
            'academic': {
                'total_classes': Class.objects.count(),
                'total_subjects': Subject.objects.count(),
                'total_chapters': Chapter.objects.count(),
                'completed_chapters': Chapter.objects.filter(is_completed=True).count()
            },
            'financial': {
                'total_fees_collected': float(
                    FeePayment.objects.aggregate(
                        total=Sum('amount')
                    )['total'] or 0
                ),
                'total_payments': FeePayment.objects.count(),
                'students_paid': FeePayment.objects.values('student').distinct().count()
            },
            'notifications': {
                'total_sent': Notification.objects.count(),
                'sent_today': Notification.objects.filter(
                    created_at__date=timezone.now().date()
                ).count()
            }
        }


# ═══════════════════════════════════════════════════════════
#  Export for easy import
# ═══════════════════════════════════════════════════════════

__all__ = [
    # Class
    'ClassListSerializer',
    'ClassDetailSerializer',
    'ClassCreateSerializer',
    
    # Subject
    'SubjectListSerializer',
    'SubjectDetailSerializer',
    'SubjectCreateSerializer',
    'SubjectUpdateSerializer',
    
    # Chapter
    'ChapterListSerializer',
    'ChapterDetailSerializer',
    'ChapterCreateSerializer',
    'ChapterUpdateSerializer',
    
    # Notification
    'NotificationListSerializer',
    'NotificationDetailSerializer',
    'NotificationCreateSerializer',
    
    # Fee Payment
    'FeePaymentListSerializer',
    'FeePaymentDetailSerializer',
    'FeePaymentCreateSerializer',
    'FeePaymentStatsSerializer',
    
    # Dashboard
    'AdminDashboardStatsSerializer',
]