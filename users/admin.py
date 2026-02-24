# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.core.mail import send_mail
from django.conf import settings

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    """Enhanced Custom admin interface for CustomUser model"""
    
    list_display = (
        'username',
        'email',
        'role_colored',
        'approval_status',
        'unique_id',
        'class_assigned_link',
        'subjects_display',
        'date_joined',
    )
    list_display_links = ('username', 'email')
    list_filter = (
        'role',
        'is_approved',
        'is_staff',
        'is_superuser',
        'class_assigned',
        'date_joined',
    )
    search_fields = (
        'username',
        'email',
        'first_name',
        'last_name',
        'phone',
        'unique_id',
    )
    ordering = ('-date_joined',)
    date_hierarchy = 'date_joined'
    model = CustomUser
    list_per_page = 25

    # Actions
    actions = ['approve_users', 'reject_users', 'send_notification_email']

    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        (_('Personal info'), {
            'fields': (
                'first_name', 'last_name', 'email', 'phone', 'dob',
                'role', 'unique_id', 'is_approved',
            )
        }),
        (_('School assignment'), {
            'fields': ('class_assigned', 'subjects'),
            'description': 'Assign class (for students) and subjects (for teachers)'
        }),
        (_('OTP & Security'), {
            'fields': ('otp', 'otp_created'),
            'classes': ('collapse',),
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser',
                'groups', 'user_permissions'
            ),
            'classes': ('collapse',),
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'role', 'first_name', 'last_name', 'phone', 'dob',
                'is_approved', 'class_assigned', 'subjects',
            ),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions', 'subjects')
    readonly_fields = ('last_login', 'date_joined', 'otp_created', 'unique_id')

    @admin.display(description='Role', ordering='role')
    def role_colored(self, obj):
        colors = {
            'student': '#4CAF50',
            'teacher': '#2196F3',
            'admin': '#F44336',
        }
        color = colors.get(obj.role, '#757575')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_role_display()
        )
    
    @admin.display(description='Approval Status', ordering='is_approved')
    def approval_status(self, obj):
        if obj.is_approved:
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                '#4CAF50', '✓ Approved'
            )
        else:
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}</span>',
                '#F44336', '✗ Pending'
            )

    @admin.display(description='Class')
    def class_assigned_link(self, obj):
        if not obj.class_assigned:
            return "—"
        url = f"/admin/admin_tasks/class/{obj.class_assigned.id}/change/"
        return format_html('<a href="{}">{}</a>', url, obj.class_assigned)
    
    @admin.display(description='Subjects')
    def subjects_display(self, obj):
        """Display assigned subjects"""
        subjects = obj.subjects.all()
        if not subjects:
            return "—"
        subject_names = ', '.join([s.name for s in subjects[:3]])
        if subjects.count() > 3:
            subject_names += f' (+{subjects.count() - 3} more)'
        return subject_names

    @admin.action(description='✓ Approve selected users')
    def approve_users(self, request, queryset):
        """Approve selected users and send email notification with login details"""
        updated = 0
        failed_emails = []
        
        for user in queryset:
            # if not user.is_approved:
            if not user.is_approved and user.is_active:
                user.is_approved = True
                user.save()  # This auto-generates unique_id
                updated += 1
                
                # Send approval email with login link
                try:
                    # Use your actual frontend URL (change for production)
                    login_url = 'http://localhost:5173/login'
                    
                    email_body = f'''Hello {user.first_name or user.username},

🎉 Congratulations! Your EduVibe account has been approved!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 Email:      {user.email}
🆔 Unique ID:  {user.unique_id}
👤 Role:       {user.get_role_display()}
{f"📚 Class:      {user.class_assigned.name}" if user.class_assigned else ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 LOGIN NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click here to login: {login_url}

You can use either your email or unique ID to login.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to EduVibe! We're excited to have you join our learning community.

If you have any questions, feel free to reach out.

Best regards,
EduVibe Team
eduvibe.world@gmail.com
'''
                    
                    send_mail(
                        subject='🎉 EduVibe - Account Approved!',
                        message=email_body,
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    
                    # Log success in terminal
                    print(f"✅ Approval email sent to {user.email} (ID: {user.unique_id})")
                    
                except Exception as e:
                    failed_emails.append(user.email)
                    print(f"❌ Failed to send email to {user.email}: {str(e)}")
        
        # Show success message with email status
        if failed_emails:
            self.message_user(
                request, 
                f'⚠️ {updated} user(s) approved, but {len(failed_emails)} email(s) failed to send.',
                level='WARNING'
            )
        else:
            self.message_user(
                request, 
                f'✅ {updated} user(s) successfully approved! Approval emails sent.'
            )    

    @admin.action(description='✗ Reject selected users')
    def reject_users(self, request, queryset):
        """Reject and delete selected users"""
        count = queryset.count()
        
        for user in queryset:
            if not user.is_approved:
                try:
                    send_mail(
                        subject='EduVibe - Registration Not Approved',
                        message=f'''Hello {user.first_name or user.username},

                       Unfortunately, your registration request has not been approved.

                      If you believe this is an error, please contact the administrator.

                       Best regards,
                       EduVibe Team''',
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user.email],
                        fail_silently=True,
                    )
                except:
                    pass
        
        queryset.delete()
        self.message_user(request, f'{count} user(s) rejected and deleted!')
    
    @admin.action(description='📧 Send notification email')
    def send_notification_email(self, request, queryset):
        """Send notification to selected users"""
        count = 0
        for user in queryset:
            try:
                send_mail(
                    subject='EduVibe - Important Notification',
                    message=f'''Hello {user.first_name or user.username},

This is an important notification from EduVibe.

[Admin can customize this message]

Best regards,
EduVibe Team''',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                count += 1
            except:
                pass
        
        self.message_user(request, f'Notification sent to {count} user(s)!')

    def get_queryset(self, request):
        """Optimize queries"""
        qs = super().get_queryset(request)
        return qs.select_related('class_assigned').prefetch_related('subjects')

























