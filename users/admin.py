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
    """
    Custom admin interface for CustomUser model.
    Extends Django's built-in UserAdmin with role-based features.
    """
    list_display = (
        'username',
        'email',
        'role_colored',
        'approval_status',
        'unique_id',
        'class_assigned_link',
        'date_joined',
        'last_login',
    )
    list_display_links = ('username', 'email')
    list_filter = (
        'role',
        'is_approved',
        'is_staff',
        'is_superuser',
        'date_joined',
        'last_login',
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
    
    # ────────────────────────────────────────────────
    #   ADMIN ACTIONS - Approve/Reject Users
    # ────────────────────────────────────────────────
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
            'classes': ('collapse',),
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
                'is_approved', 'is_staff', 'is_superuser',
            ),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions', 'subjects')
    readonly_fields = ('last_login', 'date_joined', 'otp_created', 'unique_id')

    # ────────────────────────────────────────────────
    #   Custom display methods
    # ────────────────────────────────────────────────


    @admin.display(description='Role', ordering='role')
    def role_colored(self, obj):
        colors = {
            'student': '#4CAF50',  # green
            'teacher': '#2196F3',  # blue
            'admin':   '#F44336',  # red
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
    
    # ────────────────────────────────────────────────
    #   ADMIN ACTIONS
    # ────────────────────────────────────────────────
    
    @admin.action(description='✓ Approve selected users')
    def approve_users(self, request, queryset):
        """Approve selected users and send email notification"""
        updated = 0
        for user in queryset:
            if not user.is_approved:
                user.is_approved = True
                user.save()
                updated += 1
                
                # Send approval email
                try:
                    send_mail(
                        subject='EduVibe - Account Approved! 🎉',
                        message=f'''Hello {user.first_name or user.username},

Congratulations! Your EduVibe account has been approved by the admin.

You can now login and access all features.

Login Details:
- Email/Unique ID: {user.email} or {user.unique_id}
- Role: {user.get_role_display()}

Welcome to EduVibe!

Best regards,
EduVibe Team''',
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user.email],
                        fail_silently=True,
                    )
                except:
                    pass  # Continue even if email fails
        
        self.message_user(request, f'{updated} user(s) successfully approved!')
    
    @admin.action(description='✗ Reject selected users')
    def reject_users(self, request, queryset):
        """Reject and delete selected users"""
        count = queryset.count()
        
        # Send rejection emails before deleting
        for user in queryset:
            if not user.is_approved:
                try:
                    send_mail(
                        subject='EduVibe - Registration Not Approved',
                        message=f'''Hello {user.first_name or user.username},

Unfortunately, your registration request for EduVibe has not been approved.

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
        """Send a custom notification to selected users"""
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
        qs = super().get_queryset(request)
        # Optional: can add .select_related('class_assigned') if needed
        return qs

    def get_search_results(self, request, queryset, search_term):
        # Optional: enhance search if needed
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        return queryset, use_distinct


# If you later add more models to users/models.py, register them here like:
# @admin.register(AnotherModel)
# class AnotherModelAdmin(admin.ModelAdmin):
#     ...


















# # users/admin.py
# from django.contrib import admin
# from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# from django.utils.translation import gettext_lazy as _
# from django.utils.html import format_html

# from .models import CustomUser


# @admin.register(CustomUser)
# class CustomUserAdmin(BaseUserAdmin):
#     """
#     Custom admin interface for CustomUser model.
#     Extends Django's built-in UserAdmin with role-based features.
#     """
#     list_display = (
#         'username',
#         'email',
#         'role_colored',
#         'is_approved',
#         'unique_id',
#         'class_assigned_link',
#         'date_joined',
#         'last_login',
#     )
#     list_display_links = ('username', 'email')
#     list_filter = (
#         'role',
#         'is_approved',
#         'is_staff',
#         'is_superuser',
#         'date_joined',
#         'last_login',
#     )
#     search_fields = (
#         'username',
#         'email',
#         'first_name',
#         'last_name',
#         'phone',
#         'unique_id',
#     )
#     ordering = ('-date_joined',)
#     date_hierarchy = 'date_joined'

#     fieldsets = (
#         (None, {
#             'fields': ('username', 'password')
#         }),
#         (_('Personal info'), {
#             'fields': (
#                 'first_name', 'last_name', 'email', 'phone', 'dob',
#                 'role', 'unique_id', 'is_approved',
#             )
#         }),
#         (_('School assignment'), {
#             'fields': ('class_assigned', 'subjects'),
#             'classes': ('collapse',),
#         }),
#         (_('OTP & Security'), {
#             'fields': ('otp', 'otp_created'),
#             'classes': ('collapse',),
#         }),
#         (_('Permissions'), {
#             'fields': (
#                 'is_active', 'is_staff', 'is_superuser',
#                 'groups', 'user_permissions'
#             ),
#             'classes': ('collapse',),
#         }),
#         (_('Important dates'), {
#             'fields': ('last_login', 'date_joined'),
#             'classes': ('collapse',),
#         }),
#     )

#     add_fieldsets = (
#         (None, {
#             'classes': ('wide',),
#             'fields': (
#                 'username', 'email', 'password1', 'password2',
#                 'role', 'first_name', 'last_name', 'phone', 'dob',
#                 'is_approved', 'is_staff', 'is_superuser',
#             ),
#         }),
#     )

#     filter_horizontal = ('groups', 'user_permissions', 'subjects')
#     readonly_fields = ('last_login', 'date_joined', 'otp_created', 'unique_id')

#     # ────────────────────────────────────────────────
#     #   Custom display methods
#     # ────────────────────────────────────────────────

#     @admin.display(description='Role', ordering='role')
#     def role_colored(self, obj):
#         colors = {
#             'student': '#4CAF50',  # green
#             'teacher': '#2196F3',  # blue
#             'admin':   '#F44336',  # red
#         }
#         color = colors.get(obj.role, '#757575')
#         return format_html(
#             '<span style="color: {}; font-weight: bold;">{}</span>',
#             color, obj.get_role_display()
#         )

#     @admin.display(description='Class')
#     def class_assigned_link(self, obj):
#         if not obj.class_assigned:
#             return "—"
#         url = f"/admin/admin_tasks/class/{obj.class_assigned.id}/change/"
#         return format_html('<a href="{}">{}</a>', url, obj.class_assigned)

#     def get_queryset(self, request):
#         qs = super().get_queryset(request)
#         # Optional: can add .select_related('class_assigned') if needed
#         return qs

#     def get_search_results(self, request, queryset, search_term):
#         # Optional: enhance search if needed
#         queryset, use_distinct = super().get_search_results(request, queryset, search_term)
#         return queryset, use_distinct


# # If you later add more models to users/models.py, register them here like:
# # @admin.register(AnotherModel)
# # class AnotherModelAdmin(admin.ModelAdmin):
# #     ...