# users/serializers.py
"""
Professional DRF Serializers for User Management
Built for EduVibe - Educational Platform
Version: 2.0 (2026)
"""

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser


# ═══════════════════════════════════════════════════════════
#  Base User Serializers
# ═══════════════════════════════════════════════════════════

class UserBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer with common user fields.
    Use this as a parent for other user serializers.
    """
    full_name = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'full_name', 
            'role', 'role_display', 'unique_id', 
            'is_approved', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'unique_id', 'date_joined']
    
    def get_full_name(self, obj):
        """Return formatted full name or username"""
        return obj.get_full_name() or obj.username


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing users.
    Optimized for performance with minimal fields.
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True, allow_null=True)
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'unique_id', 
            'is_approved', 'class_name'
        ]


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed user information with related data.
    Use for profile views and admin detail pages.
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class_details = serializers.SerializerMethodField()
    subjects_list = serializers.SerializerMethodField()
    account_age_days = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'dob', 'role', 'role_display', 'unique_id',
            'is_approved', 'class_details', 'subjects_list',
            'date_joined', 'last_login', 'account_age_days'
        ]
        read_only_fields = ['id', 'username', 'unique_id', 'date_joined', 'last_login']
    
    def get_class_details(self, obj):
        """Return class information if assigned"""
        if obj.class_assigned:
            return {
                'id': obj.class_assigned.id,
                'name': obj.class_assigned.name
            }
        return None
    
    def get_subjects_list(self, obj):
        """Return list of assigned subjects"""
        return [
            {'id': subject.id, 'name': subject.name}
            for subject in obj.subjects.all()
        ]
    
    def get_account_age_days(self, obj):
        """Calculate account age in days"""
        return (timezone.now() - obj.date_joined).days


# ═══════════════════════════════════════════════════════════
#  Authentication Serializers
# ═══════════════════════════════════════════════════════════

class RegisterSerializer(serializers.ModelSerializer):
    """
    User registration with role-based validation.
    Handles student and teacher registration differently.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    phone = serializers.CharField(
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='Phone number must be exactly 10 digits'
            )
        ]
    )
    
    # Role-specific fields
    class_id = serializers.IntegerField(write_only=True, required=False)
    subject_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        allow_empty=False
    )
    
    class Meta:
        model = CustomUser
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 
            'last_name', 'phone', 'dob', 'role', 'class_id', 'subject_ids'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'dob': {'required': True},
        }
    
    def validate(self, attrs):
        """Custom validation for passwords and role-specific fields"""
        # Password matching
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Student must have class_id
        if attrs.get('role') == 'student' and not attrs.get('class_id'):
            raise serializers.ValidationError({
                "class_id": "Students must select a class."
            })
        
        # Teacher must have 1-3 subjects
        if attrs.get('role') == 'teacher':
            subject_ids = attrs.get('subject_ids', [])
            if not subject_ids or len(subject_ids) < 1 or len(subject_ids) > 3:
                raise serializers.ValidationError({
                    "subject_ids": "Teachers must select 1-3 subjects."
                })
        
        return attrs
    
    def validate_email(self, value):
        """Ensure email is unique and lowercase"""
        if CustomUser.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value.lower()
    
    def validate_dob(self, value):
        """Validate date of birth (must be at least 5 years old)"""
        age = (timezone.now().date() - value).days / 365.25
        if age < 5:
            raise serializers.ValidationError("User must be at least 5 years old.")
        if age > 100:
            raise serializers.ValidationError("Invalid date of birth.")
        return value
    
    def create(self, validated_data):
        """Create user with hashed password"""
        # Remove extra fields
        validated_data.pop('password_confirm')
        class_id = validated_data.pop('class_id', None)
        subject_ids = validated_data.pop('subject_ids', None)
        password = validated_data.pop('password')
        
        # Set username as email
        validated_data['username'] = validated_data['email']
        
        # Create user
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        
        # Assign class for students
        if class_id and user.role == 'student':
            from admin_tasks.models import Class
            user.class_assigned = Class.objects.get(id=class_id)
        
        # Assign subjects for teachers
        if subject_ids and user.role == 'teacher':
            from admin_tasks.models import Subject
            user.subjects.set(Subject.objects.filter(id__in=subject_ids))
        
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Login with email or unique_id + password.
    Returns user info and auth token.
    """
    identifier = serializers.CharField(
        help_text="Email or Unique ID",
        required=True
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Authenticate user and check approval status"""
        identifier = attrs.get('identifier')
        password = attrs.get('password')
        
        # Find user by email or unique_id
        user = (
            CustomUser.objects.filter(email=identifier).first() or 
            CustomUser.objects.filter(unique_id=identifier).first()
        )
        
        if not user:
            raise serializers.ValidationError({
                "identifier": "No user found with this email/ID."
            })
        
        if not user.check_password(password):
            raise serializers.ValidationError({
                "password": "Incorrect password."
            })
        
        if not user.is_approved:
            raise serializers.ValidationError({
                "non_field_errors": "Your account is pending admin approval."
            })
        
        if not user.is_active:
            raise serializers.ValidationError({
                "non_field_errors": "Your account has been deactivated."
            })
        
        attrs['user'] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """
    Request OTP for password reset.
    Sends 6-digit OTP to registered email.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check if email exists in system"""
        if not CustomUser.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("No account found with this email.")
        return value.lower()


class VerifyOTPSerializer(serializers.Serializer):
    """
    Verify OTP and reset password.
    OTP valid for 5 minutes.
    """
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(
        required=True,
        max_length=6,
        min_length=6,
        validators=[
            RegexValidator(
                regex=r'^\d{6}$',
                message='OTP must be exactly 6 digits'
            )
        ]
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Verify OTP is valid and not expired"""
        email = attrs.get('email')
        otp = attrs.get('otp')
        
        user = CustomUser.objects.filter(email=email.lower()).first()
        
        if not user:
            raise serializers.ValidationError({
                "email": "No user found with this email."
            })
        
        if not user.otp:
            raise serializers.ValidationError({
                "otp": "No OTP request found. Please request a new OTP."
            })
        
        if user.otp != int(otp):
            raise serializers.ValidationError({
                "otp": "Invalid OTP. Please check and try again."
            })
        
        # Check OTP expiry (5 minutes)
        if user.otp_created:
            time_diff = timezone.now() - user.otp_created
            if time_diff > timedelta(minutes=5):
                raise serializers.ValidationError({
                    "otp": "OTP has expired. Please request a new one."
                })
        
        attrs['user'] = user
        return attrs


class VerifyRegistrationOTPSerializer(serializers.Serializer):
    """
    Verify email during registration.
    Marks email as verified after OTP check.
    """
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(
        required=True,
        max_length=6,
        min_length=6,
        validators=[
            RegexValidator(
                regex=r'^\d{6}$',
                message='OTP must be exactly 6 digits'
            )
        ]
    )
    
    def validate(self, attrs):
        """Verify registration OTP"""
        email = attrs.get('email')
        otp = attrs.get('otp')
        
        user = CustomUser.objects.filter(email=email.lower()).first()
        
        if not user:
            raise serializers.ValidationError({
                "email": "No registration found with this email."
            })
        
        if not user.otp or user.otp != int(otp):
            raise serializers.ValidationError({
                "otp": "Invalid OTP. Please try again."
            })
        
        attrs['user'] = user
        return attrs


# ═══════════════════════════════════════════════════════════
#  Admin User Management Serializers
# ═══════════════════════════════════════════════════════════

class PendingUserSerializer(serializers.ModelSerializer):
    """
    List pending users awaiting admin approval.
    Optimized for admin approval workflow.
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True, allow_null=True)
    subjects_count = serializers.SerializerMethodField()
    days_pending = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone',
            'role', 'role_display', 'class_name', 'subjects_count',
            'date_joined', 'days_pending'
        ]
    
    def get_subjects_count(self, obj):
        """Count assigned subjects for teachers"""
        return obj.subjects.count() if obj.role == 'teacher' else 0
    
    def get_days_pending(self, obj):
        """Calculate days since registration"""
        return (timezone.now() - obj.date_joined).days


class ApproveUserSerializer(serializers.Serializer):
    """
    Approve pending user.
    Generates unique_id and sends approval email.
    """
    user_id = serializers.IntegerField(required=True)
    
    def validate_user_id(self, value):
        """Check if user exists and is pending"""
        try:
            user = CustomUser.objects.get(id=value)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        
        if user.is_approved:
            raise serializers.ValidationError("User is already approved.")
        
        return value


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Update user profile information.
    Role-specific field validation.
    """
    class Meta:
        model = CustomUser
        fields = [
            'first_name', 'last_name', 'phone', 'dob',
            'class_assigned', 'subjects'
        ]
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        if value and len(value) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value
    
    def validate(self, attrs):
        """Validate role-specific constraints"""
        user = self.instance
        
        # Students can only have class_assigned
        if user.role == 'student' and 'subjects' in attrs:
            raise serializers.ValidationError({
                "subjects": "Students cannot have direct subject assignments."
            })
        
        # Teachers should have 1-3 subjects
        if user.role == 'teacher' and 'subjects' in attrs:
            subjects = attrs['subjects']
            if len(subjects) < 1 or len(subjects) > 3:
                raise serializers.ValidationError({
                    "subjects": "Teachers must have 1-3 subjects."
                })
        
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Change password for authenticated user.
    Requires old password verification.
    """
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Verify old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Check new passwords match"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "New passwords don't match."
            })
        return attrs


# ═══════════════════════════════════════════════════════════
#  Profile & Statistics Serializers
# ═══════════════════════════════════════════════════════════

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Complete user profile with statistics.
    Used for dashboard and profile pages.
    """
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.SerializerMethodField()
    class_info = serializers.SerializerMethodField()
    subjects_info = serializers.SerializerMethodField()
    statistics = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'full_name',
            'first_name', 'last_name', 'phone', 'dob',
            'role', 'role_display', 'unique_id',
            'is_approved', 'class_info', 'subjects_info',
            'date_joined', 'last_login', 'statistics'
        ]
        read_only_fields = ['id', 'username', 'unique_id', 'role', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_class_info(self, obj):
        """Detailed class information"""
        if obj.class_assigned:
            return {
                'id': obj.class_assigned.id,
                'name': obj.class_assigned.name,
                'total_subjects': obj.class_assigned.subject_set.count()
            }
        return None
    
    def get_subjects_info(self, obj):
        """Detailed subjects information"""
        return [
            {
                'id': subject.id,
                'name': subject.name,
                'total_chapters': subject.chapter_set.count()
            }
            for subject in obj.subjects.all()
        ]
    
    def get_statistics(self, obj):
        """Role-based statistics"""
        stats = {
            'account_age_days': (timezone.now() - obj.date_joined).days,
        }
        
        if obj.role == 'student':
            # Student-specific stats
            stats.update({
                'total_tests_attempted': obj.testattempt_set.count(),
                'total_doubts_asked': obj.asked_doubts.count(),
                'attendance_count': obj.student_attendances.filter(is_present=True).count()
            })
        
        elif obj.role == 'teacher':
            # Teacher-specific stats
            stats.update({
                'total_tests_created': obj.test_set.count(),
                'total_assignments': obj.assignment_set.count(),
                'total_classes_assigned': obj.teacherassignment_set.values('class_assigned').distinct().count()
            })
        
        return stats


# ═══════════════════════════════════════════════════════════
#  Export for easy import
# ═══════════════════════════════════════════════════════════

__all__ = [
    'UserBaseSerializer',
    'UserListSerializer',
    'UserDetailSerializer',
    'RegisterSerializer',
    'LoginSerializer',
    'ForgotPasswordSerializer',
    'VerifyOTPSerializer',
    'VerifyRegistrationOTPSerializer',
    'PendingUserSerializer',
    'ApproveUserSerializer',
    'UserUpdateSerializer',
    'ChangePasswordSerializer',
    'UserProfileSerializer',
]