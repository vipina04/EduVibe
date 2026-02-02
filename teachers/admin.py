# teachers/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse

from .models import (
    TeacherAssignment,
    Test,
    Question,
    Attendance,
    Assignment,
    Doubt,
    DoubtReply,
)


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        'teacher_link',
        'class_assigned_link',
        'subject_link',
    )
    list_filter = ('class_assigned', 'subject')
    search_fields = (
        'teacher__username',
        'teacher__email',
        'class_assigned__name',
        'subject__name',
    )
    autocomplete_fields = ['teacher', 'class_assigned', 'subject']

    fieldsets = (
        (None, {
            'fields': ('teacher', 'class_assigned', 'subject')
        }),
    )

    @admin.display(description='Teacher', ordering='teacher__username')
    def teacher_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.teacher.pk])
        return format_html('<a href="{}">{}</a>', url, obj.teacher.get_full_name() or obj.teacher.username)

    @admin.display(description='Class', ordering='class_assigned__name')
    def class_assigned_link(self, obj):
        url = reverse("admin:admin_tasks_class_change", args=[obj.class_assigned.pk])
        return format_html('<a href="{}">{}</a>', url, str(obj.class_assigned))

    @admin.display(description='Subject', ordering='subject__name')
    def subject_link(self, obj):
        url = reverse("admin:admin_tasks_subject_change", args=[obj.subject.pk])
        return format_html('<a href="{}">{}</a>', url, obj.subject.name)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('teacher', 'class_assigned', 'subject')


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('type', 'chapter_link', 'marks', 'created_by_link')
    list_filter = ('type', 'marks')
    search_fields = ('chapter__name', 'created_by__username', 'created_by__email')
    autocomplete_fields = ['chapter', 'created_by']

    fieldsets = (
        (None, {'fields': ('type', 'chapter', 'marks', 'created_by')}),
    )

    @admin.display(description='Chapter')
    def chapter_link(self, obj):
        if not obj.chapter:
            return "—"
        url = reverse("admin:admin_tasks_chapter_change", args=[obj.chapter.pk])
        return format_html('<a href="{}">{}</a>', url, obj.chapter)

    @admin.display(description='Created by')
    def created_by_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.created_by.pk])
        return format_html('<a href="{}">{}</a>', url, obj.created_by.get_full_name() or obj.created_by.username)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('short_question', 'test_link', 'has_image', 'correct_option_display')
    list_filter = ('test__type',)
    search_fields = ('question_text', 'test__chapter__name')
    list_per_page = 20

    fieldsets = (
        (None, {
            'fields': ('test', 'question_text', 'question_image')
        }),
        ('MCQ Options', {
            'fields': ('option1', 'option2', 'option3', 'option4', 'correct_option'),
            'classes': ('wide',),
        }),
        ('Explanation', {
            'fields': ('explanation',),
            'classes': ('collapse',),
        }),
    )

    @admin.display(description='Question')
    def short_question(self, obj):
        text = obj.question_text[:60]
        return text + "..." if len(text) > 57 else text

    @admin.display(description='Test', ordering='test__id')
    def test_link(self, obj):
        url = reverse("admin:teachers_test_change", args=[obj.test.pk])
        return format_html('<a href="{}">Test #{} ({})</a>', url, obj.test.pk, obj.test.type)

    @admin.display(description='Image?', boolean=True)
    def has_image(self, obj):
        return bool(obj.question_image)

    @admin.display(description='Correct')
    def correct_option_display(self, obj):
        if obj.correct_option is None:
            return "—"
        return f"Option {obj.correct_option}"


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'teacher_link', 'student_link', 'class_link', 'status')
    list_filter = ('date', 'is_present', 'class_assigned')
    search_fields = (
        'teacher__username', 'student__username',
        'student__email', 'class_assigned__name'
    )

    fieldsets = (
        (None, {'fields': ('teacher', 'student', 'class_assigned', 'date', 'time', 'is_present')}),
    )

    @admin.display(description='Status', boolean=True, ordering='is_present')
    def status(self, obj):
        return obj.is_present

    @admin.display(description='Teacher')
    def teacher_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.teacher.pk])
        return format_html('<a href="{}">{}</a>', url, obj.teacher)

    @admin.display(description='Student')
    def student_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.student.pk])
        return format_html('<a href="{}">{}</a>', url, obj.student)

    @admin.display(description='Class')
    def class_link(self, obj):
        url = reverse("admin:admin_tasks_class_change", args=[obj.class_assigned.pk])
        return format_html('<a href="{}">{}</a>', url, obj.class_assigned)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('short_description', 'chapter_link', 'teacher_link', 'has_file')
    search_fields = ('description', 'teacher__username', 'chapter__name')

    fieldsets = (
        (None, {'fields': ('teacher', 'chapter', 'description', 'file')}),
    )

    @admin.display(description='Description')
    def short_description(self, obj):
        return obj.description[:50] + "..." if len(obj.description) > 47 else obj.description

    @admin.display(description='Chapter')
    def chapter_link(self, obj):
        if not obj.chapter:
            return "—"
        url = reverse("admin:admin_tasks_chapter_change", args=[obj.chapter.pk])
        return format_html('<a href="{}">{}</a>', url, obj.chapter)

    @admin.display(description='Teacher')
    def teacher_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.teacher.pk])
        return format_html('<a href="{}">{}</a>', url, obj.teacher)

    @admin.display(description='File?', boolean=True)
    def has_file(self, obj):
        return bool(obj.file)


@admin.register(Doubt)
class DoubtAdmin(admin.ModelAdmin):
    list_display = ('short_text', 'student_link', 'subject_link', 'has_image')
    list_filter = ('subject',)
    search_fields = ('text', 'student__username', 'student__email', 'subject__name')

    fieldsets = (
        (None, {'fields': ('student', 'subject', 'text', 'image')}),
    )

    @admin.display(description='Doubt')
    def short_text(self, obj):
        return obj.text[:60] + "..." if len(obj.text) > 57 else obj.text

    @admin.display(description='Student')
    def student_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.student.pk])
        return format_html('<a href="{}">{}</a>', url, obj.student)

    @admin.display(description='Subject')
    def subject_link(self, obj):
        url = reverse("admin:admin_tasks_subject_change", args=[obj.subject.pk])
        return format_html('<a href="{}">{}</a>', url, obj.subject)

    @admin.display(description='Image?', boolean=True)
    def has_image(self, obj):
        return bool(obj.image)


@admin.register(DoubtReply)
class DoubtReplyAdmin(admin.ModelAdmin):
    list_display = ('short_text', 'doubt_link', 'user_link', 'has_image')
    search_fields = ('text', 'user__username', 'doubt__text')

    fieldsets = (
        (None, {'fields': ('doubt', 'user', 'text', 'image')}),
    )

    @admin.display(description='Reply')
    def short_text(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 47 else obj.text

    @admin.display(description='Doubt')
    def doubt_link(self, obj):
        url = reverse("admin:teachers_doubt_change", args=[obj.doubt.pk])
        return format_html('<a href="{}">Doubt #{} ({})</a>', url, obj.doubt.pk, obj.doubt.short_text[:30])

    @admin.display(description='Replied by')
    def user_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.user.pk])
        return format_html('<a href="{}">{}</a>', url, obj.user)

    @admin.display(description='Image?', boolean=True)
    def has_image(self, obj):
        return bool(obj.image)
























# # teachers/admin.py
# from django.contrib import admin
# from django.utils.html import format_html
# from django.utils.translation import gettext_lazy as _
# from django.urls import reverse
# from django.utils.safestring import mark_safe

# from .models import (
#     TeacherAssignment,
#     Test,
#     Question,
#     Attendance,
#     Assignment,
#     Doubt,
#     DoubtReply,
# )


# @admin.register(TeacherAssignment)
# class TeacherAssignmentAdmin(admin.ModelAdmin):
#     list_display = (
#         'teacher_link',
#         'class_assigned_link',
#         'subject_link',
#         'created_at',
#     )
#     list_filter = ('class_assigned', 'subject')
#     search_fields = (
#         'teacher__username',
#         'teacher__email',
#         'class_assigned__name',
#         'subject__name',
#     )
#     autocomplete_fields = ['teacher', 'class_assigned', 'subject']
#     raw_id_fields = ['teacher', 'class_assigned', 'subject']  # better for large datasets

#     fieldsets = (
#         (None, {
#             'fields': ('teacher', 'class_assigned', 'subject')
#         }),
#     )

#     @admin.display(description='Teacher', ordering='teacher__username')
#     def teacher_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.teacher.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.teacher.get_full_name() or obj.teacher.username)

#     @admin.display(description='Class', ordering='class_assigned__name')
#     def class_assigned_link(self, obj):
#         url = reverse("admin:admin_tasks_class_change", args=[obj.class_assigned.pk])
#         return format_html('<a href="{}">{}</a>', url, str(obj.class_assigned))

#     @admin.display(description='Subject', ordering='subject__name')
#     def subject_link(self, obj):
#         url = reverse("admin:admin_tasks_subject_change", args=[obj.subject.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.subject.name)

#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related('teacher', 'class_assigned', 'subject')


# @admin.register(Test)
# class TestAdmin(admin.ModelAdmin):
#     list_display = ('type', 'chapter_link', 'marks', 'created_by_link', 'created_at')
#     list_filter = ('type', 'marks', 'created_at')
#     search_fields = ('chapter__name', 'created_by__username', 'created_by__email')
#     date_hierarchy = 'created_at'
#     autocomplete_fields = ['chapter', 'created_by']

#     fieldsets = (
#         (None, {'fields': ('type', 'chapter', 'marks', 'created_by')}),
#     )

#     @admin.display(description='Chapter')
#     def chapter_link(self, obj):
#         if not obj.chapter:
#             return "—"
#         url = reverse("admin:admin_tasks_chapter_change", args=[obj.chapter.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.chapter)

#     @admin.display(description='Created by')
#     def created_by_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.created_by.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.created_by.get_full_name() or obj.created_by.username)


# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     list_display = ('short_question', 'test_link', 'has_image', 'correct_option_display', 'created_at')
#     list_filter = ('test__type', 'test__created_at')
#     search_fields = ('question_text', 'test__chapter__name')
#     readonly_fields = ('created_at',)
#     list_per_page = 20

#     fieldsets = (
#         (None, {
#             'fields': ('test', 'question_text', 'question_image')
#         }),
#         ('MCQ Options', {
#             'fields': ('option1', 'option2', 'option3', 'option4', 'correct_option'),
#             'classes': ('wide',),
#         }),
#         ('Explanation', {
#             'fields': ('explanation',),
#             'classes': ('collapse',),
#         }),
#     )

#     @admin.display(description='Question')
#     def short_question(self, obj):
#         text = obj.question_text[:60]
#         return text + "..." if len(text) > 57 else text

#     @admin.display(description='Test', ordering='test__created_at')
#     def test_link(self, obj):
#         url = reverse("admin:teachers_test_change", args=[obj.test.pk])
#         return format_html('<a href="{}">Test #{} ({})</a>', url, obj.test.pk, obj.test.type)

#     @admin.display(description='Image?', boolean=True)
#     def has_image(self, obj):
#         return bool(obj.question_image)

#     @admin.display(description='Correct')
#     def correct_option_display(self, obj):
#         if obj.correct_option is None:
#             return "—"
#         return f"Option {obj.correct_option}"


# @admin.register(Attendance)
# class AttendanceAdmin(admin.ModelAdmin):
#     list_display = ('date', 'time', 'teacher_link', 'student_link', 'class_link', 'status')
#     list_filter = ('date', 'is_present', 'class_assigned')
#     search_fields = (
#         'teacher__username', 'student__username',
#         'student__email', 'class_assigned__name'
#     )
#     date_hierarchy = 'date'
#     list_per_page = 25

#     fieldsets = (
#         (None, {'fields': ('teacher', 'student', 'class_assigned', 'date', 'time', 'is_present')}),
#     )

#     @admin.display(description='Status', boolean=True, ordering='is_present')
#     def status(self, obj):
#         return obj.is_present

#     @admin.display(description='Teacher')
#     def teacher_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.teacher.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.teacher)

#     @admin.display(description='Student')
#     def student_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.student.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.student)

#     @admin.display(description='Class')
#     def class_link(self, obj):
#         url = reverse("admin:admin_tasks_class_change", args=[obj.class_assigned.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.class_assigned)


# @admin.register(Assignment)
# class AssignmentAdmin(admin.ModelAdmin):
#     list_display = ('short_description', 'chapter_link', 'teacher_link', 'has_file', 'created_at')
#     list_filter = ('created_at',)
#     search_fields = ('description', 'teacher__username', 'chapter__name')
#     date_hierarchy = 'created_at'

#     fieldsets = (
#         (None, {'fields': ('teacher', 'chapter', 'description', 'file')}),
#     )

#     @admin.display(description='Description')
#     def short_description(self, obj):
#         return obj.description[:50] + "..." if len(obj.description) > 47 else obj.description

#     @admin.display(description='Chapter')
#     def chapter_link(self, obj):
#         if not obj.chapter:
#             return "—"
#         url = reverse("admin:admin_tasks_chapter_change", args=[obj.chapter.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.chapter)

#     @admin.display(description='Teacher')
#     def teacher_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.teacher.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.teacher)

#     @admin.display(description='File?', boolean=True)
#     def has_file(self, obj):
#         return bool(obj.file)


# @admin.register(Doubt)
# class DoubtAdmin(admin.ModelAdmin):
#     list_display = ('short_text', 'student_link', 'subject_link', 'has_image', 'created_at')
#     list_filter = ('subject', 'created_at')
#     search_fields = ('text', 'student__username', 'student__email', 'subject__name')
#     date_hierarchy = 'created_at'
#     readonly_fields = ('created_at',)

#     fieldsets = (
#         (None, {'fields': ('student', 'subject', 'text', 'image', 'created_at')}),
#     )

#     @admin.display(description='Doubt')
#     def short_text(self, obj):
#         return obj.text[:60] + "..." if len(obj.text) > 57 else obj.text

#     @admin.display(description='Student')
#     def student_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.student.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.student)

#     @admin.display(description='Subject')
#     def subject_link(self, obj):
#         url = reverse("admin:admin_tasks_subject_change", args=[obj.subject.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.subject)

#     @admin.display(description='Image?', boolean=True)
#     def has_image(self, obj):
#         return bool(obj.image)


# @admin.register(DoubtReply)
# class DoubtReplyAdmin(admin.ModelAdmin):
#     list_display = ('short_text', 'doubt_link', 'user_link', 'has_image', 'created_at')
#     list_filter = ('created_at',)
#     search_fields = ('text', 'user__username', 'doubt__text')
#     date_hierarchy = 'created_at'
#     readonly_fields = ('created_at',)

#     fieldsets = (
#         (None, {'fields': ('doubt', 'user', 'text', 'image', 'created_at')}),
#     )

#     @admin.display(description='Reply')
#     def short_text(self, obj):
#         return obj.text[:50] + "..." if len(obj.text) > 47 else obj.text

#     @admin.display(description='Doubt')
#     def doubt_link(self, obj):
#         url = reverse("admin:teachers_doubt_change", args=[obj.doubt.pk])
#         return format_html('<a href="{}">Doubt #{} ({})</a>', url, obj.doubt.pk, obj.doubt.short_text[:30])

#     @admin.display(description='Replied by')
#     def user_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.user.pk])
#         return format_html('<a href="{}">{}</a>', url, obj.user)

#     @admin.display(description='Image?', boolean=True)
#     def has_image(self, obj):
#         return bool(obj.image)