# students/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

from .models import StudentAnswer, TestAttempt


@admin.register(TestAttempt)
class TestAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'student_link',
        'test_link',
        'score_display',
        'attempted_at',
        'percentage',
    )
    list_filter = ('test__type',)
    search_fields = (
        'student__username',
        'student__email',
        'student__unique_id',
        'test__chapter__name',
        'test__created_by__username',
    )
    date_hierarchy = 'attempted_at'
    ordering = ('-attempted_at',)
    readonly_fields = ('attempted_at', 'score')
    raw_id_fields = ['student', 'test']

    fieldsets = (
        (None, {
            'fields': ('student', 'test', 'score', 'attempted_at')
        }),
        (_('Performance'), {
            'fields': ('percentage',),
            'classes': ('collapse',),
        }),
    )

    @admin.display(description='Student', ordering='student__username')
    def student_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.student.pk])
        name = obj.student.get_full_name() or obj.student.username
        return format_html('<a href="{}">{}</a>', url, name)

    @admin.display(description='Test', ordering='test__id')
    def test_link(self, obj):
        url = reverse("admin:teachers_test_change", args=[obj.test.pk])
        chapter = obj.test.chapter.name if obj.test.chapter else "—"
        return format_html(
            '<a href="{}">{} #{} ({})</a>',
            url, obj.test.type.upper(), obj.test.pk, chapter
        )

    @admin.display(description='Score', ordering='score')
    def score_display(self, obj):
        max_marks = obj.test.marks if obj.test else "?"
        return f"{obj.score} / {max_marks}"

    @admin.display(description='Percentage')
    def percentage(self, obj):
        if obj.test and obj.test.marks > 0:
            pct = (obj.score / obj.test.marks) * 100
            color = "#4CAF50" if pct >= 60 else "#F44336" if pct < 40 else "#FF9800"
            return format_html(
                '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
                color, pct
            )
        return "—"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'test', 'test__chapter', 'test__created_by'
        )


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = (
        'student_link',
        'question_short',
        'test_type',
        'answer_summary',
        'is_correct',
    )
    list_filter = ('question__test__type',)
    search_fields = (
        'student__username',
        'student__email',
        'question__question_text',
        'descriptive_answer',
    )
    raw_id_fields = ['student', 'question']
    list_per_page = 20

    fieldsets = (
        (None, {
            'fields': ('student', 'question')
        }),
        (_('MCQ Answer'), {
            'fields': ('selected_option',),
            'classes': ('wide',),
        }),
        (_('Descriptive Answer'), {
            'fields': ('descriptive_answer',),
            'classes': ('collapse',),
        }),
        (_('Evaluation'), {
            'fields': ('is_correct',),
            'classes': ('collapse',),
        }),
    )

    @admin.display(description='Student')
    def student_link(self, obj):
        url = reverse("admin:users_customuser_change", args=[obj.student.pk])
        name = obj.student.get_full_name() or obj.student.username
        return format_html('<a href="{}">{}</a>', url, name)

    @admin.display(description='Question', ordering='question__question_text')
    def question_short(self, obj):
        text = obj.question.question_text[:60]
        return text + "..." if len(text) > 57 else text

    @admin.display(description='Test Type')
    def test_type(self, obj):
        return obj.question.test.get_type_display() if obj.question.test else "—"

    @admin.display(description='Answer')
    def answer_summary(self, obj):
        if obj.question.test and obj.question.test.type == 'mcq':
            if obj.selected_option is None:
                return format_html('<em style="color: #757575;">Not answered</em>')
            return f"Option {obj.selected_option}"
        else:
            if not obj.descriptive_answer.strip():
                return format_html('<em style="color: #757575;">No answer</em>')
            return obj.descriptive_answer[:80] + "..." if len(obj.descriptive_answer) > 77 else obj.descriptive_answer

    @admin.display(description='Correct?', boolean=True)
    def is_correct(self, obj):
        if obj.question.test and obj.question.test.type != 'mcq':
            return None  # descriptive → no auto correct
        if obj.selected_option is None:
            return None
        return obj.selected_option == obj.question.correct_option

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'question', 'question__test'
        )























# # students/admin.py
# from django.contrib import admin
# from django.utils.html import format_html
# from django.urls import reverse
# from django.utils.translation import gettext_lazy as _

# from .models import StudentAnswer, TestAttempt


# @admin.register(TestAttempt)
# class TestAttemptAdmin(admin.ModelAdmin):
#     """
#     Admin interface for student test attempts / exam results.
#     """
#     list_display = (
#         'student_link',
#         'test_link',
#         'score_display',
#         'attempted_at',
#         'percentage',
#     )
#     list_filter = (
#         'test__type',
#         'test__created_at',
#         'attempted_at',
#     )
#     search_fields = (
#         'student__username',
#         'student__email',
#         'student__unique_id',
#         'test__chapter__name',
#         'test__created_by__username',
#     )
#     date_hierarchy = 'attempted_at'
#     ordering = ('-attempted_at',)
#     readonly_fields = ('attempted_at', 'score')
#     raw_id_fields = ['student', 'test']

#     fieldsets = (
#         (None, {
#             'fields': ('student', 'test', 'score', 'attempted_at')
#         }),
#         (_('Performance'), {
#             'fields': ('percentage',),
#             'classes': ('collapse',),
#         }),
#     )

#     @admin.display(description='Student', ordering='student__username')
#     def student_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.student.pk])
#         name = obj.student.get_full_name() or obj.student.username
#         return format_html('<a href="{}">{}</a>', url, name)

#     @admin.display(description='Test', ordering='test__created_at')
#     def test_link(self, obj):
#         url = reverse("admin:teachers_test_change", args=[obj.test.pk])
#         chapter = obj.test.chapter.name if obj.test.chapter else "—"
#         return format_html(
#             '<a href="{}">{} #{} ({})</a>',
#             url, obj.test.type.upper(), obj.test.pk, chapter
#         )

#     @admin.display(description='Score', ordering='score')
#     def score_display(self, obj):
#         max_marks = obj.test.marks if obj.test else "?"
#         return f"{obj.score} / {max_marks}"

#     @admin.display(description='Percentage')
#     def percentage(self, obj):
#         if obj.test and obj.test.marks > 0:
#             pct = (obj.score / obj.test.marks) * 100
#             color = "#4CAF50" if pct >= 60 else "#F44336" if pct < 40 else "#FF9800"
#             return format_html(
#                 '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
#                 color, pct
#             )
#         return "—"

#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related(
#             'student', 'test', 'test__chapter', 'test__created_by'
#         )


# @admin.register(StudentAnswer)
# class StudentAnswerAdmin(admin.ModelAdmin):
#     """
#     Admin interface for individual student answers (MCQ + descriptive).
#     """
#     list_display = (
#         'student_link',
#         'question_short',
#         'test_type',
#         'answer_summary',
#         'is_correct',
#         'question__test__created_at',
#     )
#     list_filter = (
#         'question__test__type',
#         'question__test__created_at',
#     )
#     search_fields = (
#         'student__username',
#         'student__email',
#         'question__question_text',
#         'descriptive_answer',
#     )
#     readonly_fields = ('selected_option', 'descriptive_answer')
#     raw_id_fields = ['student', 'question']
#     list_per_page = 20

#     fieldsets = (
#         (None, {
#             'fields': ('student', 'question')
#         }),
#         (_('MCQ Answer'), {
#             'fields': ('selected_option',),
#             'classes': ('wide',),
#         }),
#         (_('Descriptive Answer'), {
#             'fields': ('descriptive_answer',),
#             'classes': ('collapse',),
#         }),
#         (_('Evaluation'), {
#             'fields': ('is_correct',),
#             'classes': ('collapse',),
#         }),
#     )

#     @admin.display(description='Student')
#     def student_link(self, obj):
#         url = reverse("admin:users_customuser_change", args=[obj.student.pk])
#         name = obj.student.get_full_name() or obj.student.username
#         return format_html('<a href="{}">{}</a>', url, name)

#     @admin.display(description='Question', ordering='question__question_text')
#     def question_short(self, obj):
#         text = obj.question.question_text[:60]
#         return text + "..." if len(text) > 57 else text

#     @admin.display(description='Test Type')
#     def test_type(self, obj):
#         return obj.question.test.get_type_display() if obj.question.test else "—"

#     @admin.display(description='Answer')
#     def answer_summary(self, obj):
#         if obj.question.test and obj.question.test.type == 'mcq':
#             if obj.selected_option is None:
#                 return format_html('<em style="color: #757575;">Not answered</em>')
#             return f"Option {obj.selected_option}"
#         else:
#             if not obj.descriptive_answer.strip():
#                 return format_html('<em style="color: #757575;">No answer</em>')
#             return obj.descriptive_answer[:80] + "..." if len(obj.descriptive_answer) > 77 else obj.descriptive_answer

#     @admin.display(description='Correct?', boolean=True)
#     def is_correct(self, obj):
#         if obj.question.test and obj.question.test.type != 'mcq':
#             return None  # descriptive → no auto correct
#         if obj.selected_option is None:
#             return None
#         return obj.selected_option == obj.question.correct_option

#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related(
#             'student', 'question', 'question__test'
#         )