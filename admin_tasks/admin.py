# admin_tasks/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from .models import Class, Subject, Chapter, Notification, FeePayment


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject_count', 'get_subjects_list')
    search_fields = ('name',)
    ordering = ('name',)

    fieldsets = (
        (None, {
            'fields': ('name',)
        }),
    )

    @admin.display(description='Number of Subjects', ordering='subjects__count')
    def subject_count(self, obj):
        return obj.subject_set.count()

    @admin.display(description='Subjects')
    def get_subjects_list(self, obj):
        subjects = obj.subject_set.all()
        if not subjects:
            return "—"
        return ", ".join([s.name for s in subjects[:5]]) + ("..." if subjects.count() > 5 else "")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('subject_set')


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'class_count', 'get_classes_list')
    search_fields = ('name',)
    filter_horizontal = ('classes',)
    ordering = ('name',)

    fieldsets = (
        (None, {
            'fields': ('name', 'classes')
        }),
    )

    @admin.display(description='Number of Classes', ordering='classes__count')
    def class_count(self, obj):
        return obj.classes.count()

    @admin.display(description='Assigned to Classes')
    def get_classes_list(self, obj):
        classes = obj.classes.all()
        if not classes:
            return "—"
        return ", ".join([c.name for c in classes[:5]]) + ("..." if classes.count() > 5 else "")


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'subject_link',
        'class_link',
        'completion_status',
        'is_completed',
    )
    list_filter = ('is_completed', 'subject', 'class_assigned')
    search_fields = ('name', 'subject__name', 'class_assigned__name')
    # list_editable = ('is_completed',)
    autocomplete_fields = ['subject', 'class_assigned']
    ordering = ('name',)

    fieldsets = (
        (None, {
            'fields': ('name', 'subject', 'class_assigned', 'is_completed')
        }),
    )

    @admin.display(description='Subject', ordering='subject__name')
    def subject_link(self, obj):
        url = reverse("admin:admin_tasks_subject_change", args=[obj.subject.pk])
        return format_html('<a href="{}">{}</a>', url, obj.subject)

    @admin.display(description='Class', ordering='class_assigned__name')
    def class_link(self, obj):
        url = reverse("admin:admin_tasks_class_change", args=[obj.class_assigned.pk])
        return format_html('<a href="{}">{}</a>', url, obj.class_assigned)

    @admin.display(description='Status', boolean=True, ordering='is_completed')
    def completion_status(self, obj):
        return obj.is_completed


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('short_message', 'user_link')
    search_fields = ('message', 'user__username', 'user__email')
    raw_id_fields = ['user']

    fieldsets = (
        (None, {
            'fields': ('user', 'message')
        }),
    )

    @admin.display(description='Message')
    def short_message(self, obj):
        return obj.message[:70] + "..." if len(obj.message) > 67 else obj.message

    @admin.display(description='Recipient')
    def user_link(self, obj):
        if not obj.user:
            return format_html('<em>Group / All</em>')
        url = reverse("admin:users_customuser_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username)


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = (
        'student_link',
        'amount_display',
        'paid_at',
        'has_receipt',
        'receipt_link',

    )
    list_filter = ('paid_at',)
    search_fields = (
        'student__username',
        'student__email',
        'student__unique_id'
    )
    readonly_fields = ('paid_at',)
    raw_id_fields = ['student']

    fieldsets = (
        (None, {
            'fields': ('student', 'amount', 'paid_at', 'receipt')
        }),
    )

    @admin.display(description='Student', ordering='student__username')
    def student_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.student.pk])
        return format_html('<a href="{}">{}</a>', url, obj.student.get_full_name() or obj.student.username)

    @admin.display(description='Amount', ordering='amount')
    def amount_display(self, obj):
        return f"₹ {obj.amount:,.2f}"

    @admin.display(description='Receipt?', boolean=True)
    def has_receipt(self, obj):
        return bool(obj.receipt)

    @admin.display(description='Receipt File')
    def receipt_link(self, obj):
        if not obj.receipt:
            return "—"
        return format_html(
            '<a href="{}" target="_blank">View</a>',
            obj.receipt.url
        )















# # admin_tasks/admin.py
# from django.contrib import admin
# from django.utils.html import format_html
# from django.urls import reverse
# from django.utils.translation import gettext_lazy as _

# from .models import Class, Subject, Chapter, Notification, FeePayment


# @admin.register(Class)
# class ClassAdmin(admin.ModelAdmin):
#     list_display = ('name', 'subject_count', 'get_subjects_list', 'created_at')
#     search_fields = ('name',)
#     list_filter = ('created_at',)
#     ordering = ('name',)
#     readonly_fields = ('created_at',)
#     date_hierarchy = 'created_at'

#     fieldsets = (
#         (None, {
#             'fields': ('name',)
#         }),
#         (_('Statistics'), {
#             'fields': ('subject_count',),
#             'classes': ('collapse',),
#         }),
#     )

#     @admin.display(description='Number of Subjects', ordering='subjects__count')
#     def subject_count(self, obj):
#         return obj.subject_set.count()

#     @admin.display(description='Subjects')
#     def get_subjects_list(self, obj):
#         subjects = obj.subject_set.all()
#         if not subjects:
#             return "—"
#         return ", ".join([s.name for s in subjects[:5]]) + ("..." if subjects.count() > 5 else "")

#     def get_queryset(self, request):
#         return super().get_queryset(request).prefetch_related('subject_set')


# @admin.register(Subject)
# class SubjectAdmin(admin.ModelAdmin):
#     list_display = ('name', 'class_count', 'get_classes_list', 'created_at')
#     search_fields = ('name',)
#     list_filter = ('created_at',)
#     filter_horizontal = ('classes',)
#     ordering = ('name',)
#     date_hierarchy = 'created_at'

#     fieldsets = (
#         (None, {
#             'fields': ('name', 'classes')
#         }),
#     )

#     @admin.display(description='Number of Classes', ordering='classes__count')
#     def class_count(self, obj):
#         return obj.classes.count()

#     @admin.display(description='Assigned to Classes')
#     def get_classes_list(self, obj):
#         classes = obj.classes.all()
#         if not classes:
#             return "—"
#         return ", ".join([c.name for c in classes[:5]]) + ("..." if classes.count() > 5 else "")


# @admin.register(Chapter)
# class ChapterAdmin(admin.ModelAdmin):
#     list_display = (
#         'name',
#         'subject_link',
#         'class_link',
#         'completion_status',
#         'created_at'
#     )
#     list_filter = ('is_completed', 'subject', 'class_assigned', 'created_at')
#     search_fields = ('name', 'subject__name', 'class_assigned__name')
#     list_editable = ('is_completed',)
#     autocomplete_fields = ['subject', 'class_assigned']
#     date_hierarchy = 'created_at'
#     ordering = ('-created_at',)

#     fieldsets = (
#         (None, {
#             'fields': ('name', 'subject', 'class_assigned', 'is_completed')
#         }),
#     )

#     @admin.display(description='Subject', ordering='subject__name')
#     def subject_link(self, obj):
#         url = reverse("admin:admin_tasks_subject_change", args=[obj.subject.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.subject)

#     @admin.display(description='Class', ordering='class_assigned__name')
#     def class_link(self, obj):
#         url = reverse("admin:admin_tasks_class_change", args=[obj.class_assigned.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.class_assigned)

#     @admin.display(description='Status', boolean=True, ordering='is_completed')
#     def completion_status(self, obj):
#         return obj.is_completed


# @admin.register(Notification)
# class NotificationAdmin(admin.ModelAdmin):
#     list_display = ('short_message', 'user_link', 'created_at')
#     list_filter = ('created_at',)
#     search_fields = ('message', 'user__username', 'user__email')
#     date_hierarchy = 'created_at'
#     readonly_fields = ('created_at',)
#     raw_id_fields = ['user']

#     fieldsets = (
#         (None, {
#             'fields': ('user', 'message', 'created_at')
#         }),
#     )

#     @admin.display(description='Message')
#     def short_message(self, obj):
#         return obj.message[:70] + "..." if len(obj.message) > 67 else obj.message

#     @admin.display(description='Recipient')
#     def user_link(self, obj):
#         if not obj.user:
#             return format_html('<em>Group / All</em>')
#         url = reverse("admin:users_customuser_change", args=[obj.user.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.user.get_full_name() or obj.user.username)


# @admin.register(FeePayment)
# class FeePaymentAdmin(admin.ModelAdmin):
#     list_display = (
#         'student_link',
#         'amount_display',
#         'paid_at',
#         'has_receipt',
#         'receipt_link'
#     )
#     list_filter = ('paid_at',)
#     search_fields = (
#         'student__username',
#         'student__email',
#         'student__unique_id'
#     )
#     date_hierarchy = 'paid_at'
#     readonly_fields = ('paid_at',)
#     raw_id_fields = ['student']

#     fieldsets = (
#         (None, {
#             'fields': ('student', 'amount', 'paid_at', 'receipt')
#         }),
#     )

#     @admin.display(description='Student', ordering='student__username')
#     def student_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.student.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.student.get_full_name() or obj.student.username)

#     @admin.display(description='Amount', ordering='amount')
#     def amount_display(self, obj):
#         return f"₹ {obj.amount:,.2f}"

#     @admin.display(description='Receipt?', boolean=True)
#     def has_receipt(self, obj):
#         return bool(obj.receipt)

#     @admin.display(description='Receipt File')
#     def receipt_link(self, obj):
#         if not obj.receipt:
#             return "—"
#         return format_html(
#             '<a href="{}" target="_blank">View</a>',
#             obj.receipt.url
#         )