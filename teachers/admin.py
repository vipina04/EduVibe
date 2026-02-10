# teachers/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import TeacherAssignment, Test, Question, Attendance, Assignment, Doubt, DoubtReply


# Inline for Questions
class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1
    fields = ('question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option')


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    """Teacher Assignment admin - Assign teachers to teach subjects in specific classes"""
    list_display = ('teacher_name', 'class_name', 'subject_name', 'student_count')
    list_filter = ('class_assigned', 'subject')
    search_fields = ('teacher__email', 'teacher__first_name', 'class_assigned__name', 'subject__name')
    
    # ✅ FIXED: Use ONLY fieldsets (removed 'fields' line)
    raw_id_fields = ('teacher',)  # Shows a search popup for teachers
    
    # Organize the form nicely
    fieldsets = (
        ('Assign Teacher to Class & Subject', {
            'fields': ('teacher', 'class_assigned', 'subject'),
            'description': 'Select a teacher and assign them to teach a specific subject in a specific class.'
        }),
    )
    
    @admin.display(description='Teacher')
    def teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.email
    
    @admin.display(description='Class')
    def class_name(self, obj):
        return obj.class_assigned.name
    
    @admin.display(description='Subject')
    def subject_name(self, obj):
        return obj.subject.name
    
    @admin.display(description='Students')
    def student_count(self, obj):
        from users.models import CustomUser
        count = CustomUser.objects.filter(
            class_assigned=obj.class_assigned,
            role='student',
            is_approved=True
        ).count()
        return count


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    """Test admin with inline questions"""
    list_display = ('test_info', 'type_badge', 'marks', 'created_by_name', 'question_count', 'attempt_count')
    list_filter = ('type', 'chapter__subject', 'chapter__class_assigned')
    search_fields = ('chapter__name', 'created_by__email')
    inlines = [QuestionInline]
    
    @admin.display(description='Test')
    def test_info(self, obj):
        if obj.chapter:
            return f"{obj.chapter.subject.name} - {obj.chapter.name}"
        return "General Test"
    
    @admin.display(description='Type')
    def type_badge(self, obj):
        colors = {'mcq': '#2196F3', 'descriptive': '#FF9800'}
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.type, '#757575'),
            obj.get_type_display()
        )
    
    @admin.display(description='Created By')
    def created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email
    
    @admin.display(description='Questions')
    def question_count(self, obj):
        return obj.question_set.count()
    
    @admin.display(description='Attempts')
    def attempt_count(self, obj):
        return obj.testattempt_set.count()


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Question admin"""
    list_display = ('question_preview', 'test_info', 'has_image', 'correct_answer')
    list_filter = ('test__type',)
    search_fields = ('question_text', 'test__chapter__name')
    
    @admin.display(description='Question')
    def question_preview(self, obj):
        return obj.question_text[:60] + '...' if len(obj.question_text) > 60 else obj.question_text
    
    @admin.display(description='Test')
    def test_info(self, obj):
        if obj.test.chapter:
            return f"{obj.test.chapter.name} ({obj.test.get_type_display()})"
        return f"Test #{obj.test.id}"
    
    @admin.display(description='Image', boolean=True)
    def has_image(self, obj):
        return bool(obj.question_image)
    
    @admin.display(description='Answer')
    def correct_answer(self, obj):
        if obj.correct_option:
            return format_html(
                '<strong style="color: #4CAF50;">Option {}</strong>',
                obj.correct_option
            )
        return "—"


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Attendance admin"""
    list_display = ('student_name', 'class_name', 'date', 'time', 'status', 'marked_by')
    list_filter = ('is_present', 'date', 'class_assigned')
    search_fields = ('student__email', 'student__first_name', 'class_assigned__name')
    date_hierarchy = 'date'
    
    @admin.display(description='Student')
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    
    @admin.display(description='Class')
    def class_name(self, obj):
        return obj.class_assigned.name
    
    @admin.display(description='Status')
    def status(self, obj):
        if obj.is_present:
            return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Present</span>')
        return format_html('<span style="color: #F44336; font-weight: bold;">✗ Absent</span>')
    
    @admin.display(description='Marked By')
    def marked_by(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.email


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    """Assignment admin"""
    list_display = ('assignment_info', 'teacher_name', 'has_file')
    list_filter = ('chapter__subject', 'chapter__class_assigned')
    search_fields = ('description', 'teacher__email', 'chapter__name')
    
    @admin.display(description='Assignment')
    def assignment_info(self, obj):
        if obj.chapter:
            return f"{obj.chapter.subject.name} - {obj.chapter.name}"
        return "General Assignment"
    
    @admin.display(description='Teacher')
    def teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.email
    
    @admin.display(description='File', boolean=True)
    def has_file(self, obj):
        return bool(obj.file)


@admin.register(Doubt)
class DoubtAdmin(admin.ModelAdmin):
    """Doubt admin"""
    list_display = ('doubt_preview', 'student_name', 'subject_name', 'status', 'created_at')
    list_filter = ('subject', 'created_at')
    search_fields = ('text', 'student__email', 'subject__name')
    date_hierarchy = 'created_at'
    
    @admin.display(description='Doubt')
    def doubt_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    
    @admin.display(description='Student')
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    
    @admin.display(description='Subject')
    def subject_name(self, obj):
        return obj.subject.name
    
    @admin.display(description='Status')
    def status(self, obj):
        if obj.doubtreply_set.exists():
            return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Answered</span>')
        return format_html('<span style="color: #FF9800; font-weight: bold;">⏳ Pending</span>')


@admin.register(DoubtReply)
class DoubtReplyAdmin(admin.ModelAdmin):
    """Doubt Reply admin"""
    list_display = ('reply_preview', 'doubt_preview', 'replied_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('text', 'user__email', 'doubt__text')
    date_hierarchy = 'created_at'
    
    @admin.display(description='Reply')
    def reply_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    
    @admin.display(description='Original Doubt')
    def doubt_preview(self, obj):
        return obj.doubt.text[:40] + '...' if len(obj.doubt.text) > 40 else obj.doubt.text
    
    @admin.display(description='Replied By')
    def replied_by(self, obj):
        return obj.user.get_full_name() or obj.user.email






























# # teachers/admin.py
# from django.contrib import admin
# from django.utils.html import format_html
# from .models import TeacherAssignment, Test, Question, Attendance, Assignment, Doubt, DoubtReply


# # Inline for Questions
# class QuestionInline(admin.TabularInline):
#     model = Question
#     extra = 1
#     fields = ('question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option')


# @admin.register(TeacherAssignment)
# class TeacherAssignmentAdmin(admin.ModelAdmin):
#     """Teacher Assignment admin - Assign teachers to teach subjects in specific classes"""
#     list_display = ('teacher_name', 'class_name', 'subject_name', 'student_count')
#     list_filter = ('class_assigned', 'subject')
#     search_fields = ('teacher__email', 'teacher__first_name', 'class_assigned__name', 'subject__name')
    
#     # ✅ ADDED: These fields make the dropdowns appear in the add/edit form
#     fields = ('teacher', 'class_assigned', 'subject')
#     raw_id_fields = ('teacher',)  # Shows a search popup for teachers
    
#     # ✅ ADDED: Organize the form nicely
#     fieldsets = (
#         ('Assign Teacher to Class & Subject', {
#             'fields': ('teacher', 'class_assigned', 'subject'),
#             'description': 'Select a teacher and assign them to teach a specific subject in a specific class.'
#         }),
#     )
    
#     @admin.display(description='Teacher')
#     def teacher_name(self, obj):
#         return obj.teacher.get_full_name() or obj.teacher.email
    
#     @admin.display(description='Class')
#     def class_name(self, obj):
#         return obj.class_assigned.name
    
#     @admin.display(description='Subject')
#     def subject_name(self, obj):
#         return obj.subject.name
    
#     @admin.display(description='Students')
#     def student_count(self, obj):
#         from users.models import CustomUser
#         count = CustomUser.objects.filter(
#             class_assigned=obj.class_assigned,
#             role='student',
#             is_approved=True
#         ).count()
#         return count


# @admin.register(Test)
# class TestAdmin(admin.ModelAdmin):
#     """Test admin with inline questions"""
#     list_display = ('test_info', 'type_badge', 'marks', 'created_by_name', 'question_count', 'attempt_count')
#     list_filter = ('type', 'chapter__subject', 'chapter__class_assigned')
#     search_fields = ('chapter__name', 'created_by__email')
#     inlines = [QuestionInline]
    
#     @admin.display(description='Test')
#     def test_info(self, obj):
#         if obj.chapter:
#             return f"{obj.chapter.subject.name} - {obj.chapter.name}"
#         return "General Test"
    
#     @admin.display(description='Type')
#     def type_badge(self, obj):
#         colors = {'mcq': '#2196F3', 'descriptive': '#FF9800'}
#         return format_html(
#             '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">{}</span>',
#             colors.get(obj.type, '#757575'),
#             obj.get_type_display()
#         )
    
#     @admin.display(description='Created By')
#     def created_by_name(self, obj):
#         return obj.created_by.get_full_name() or obj.created_by.email
    
#     @admin.display(description='Questions')
#     def question_count(self, obj):
#         return obj.question_set.count()
    
#     @admin.display(description='Attempts')
#     def attempt_count(self, obj):
#         return obj.testattempt_set.count()


# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     """Question admin"""
#     list_display = ('question_preview', 'test_info', 'has_image', 'correct_answer')
#     list_filter = ('test__type',)
#     search_fields = ('question_text', 'test__chapter__name')
    
#     @admin.display(description='Question')
#     def question_preview(self, obj):
#         return obj.question_text[:60] + '...' if len(obj.question_text) > 60 else obj.question_text
    
#     @admin.display(description='Test')
#     def test_info(self, obj):
#         if obj.test.chapter:
#             return f"{obj.test.chapter.name} ({obj.test.get_type_display()})"
#         return f"Test #{obj.test.id}"
    
#     @admin.display(description='Image', boolean=True)
#     def has_image(self, obj):
#         return bool(obj.question_image)
    
#     @admin.display(description='Answer')
#     def correct_answer(self, obj):
#         if obj.correct_option:
#             return format_html(
#                 '<strong style="color: #4CAF50;">Option {}</strong>',
#                 obj.correct_option
#             )
#         return "—"


# @admin.register(Attendance)
# class AttendanceAdmin(admin.ModelAdmin):
#     """Attendance admin"""
#     list_display = ('student_name', 'class_name', 'date', 'time', 'status', 'marked_by')
#     list_filter = ('is_present', 'date', 'class_assigned')
#     search_fields = ('student__email', 'student__first_name', 'class_assigned__name')
#     date_hierarchy = 'date'
    
#     @admin.display(description='Student')
#     def student_name(self, obj):
#         return obj.student.get_full_name() or obj.student.email
    
#     @admin.display(description='Class')
#     def class_name(self, obj):
#         return obj.class_assigned.name
    
#     @admin.display(description='Status')
#     def status(self, obj):
#         if obj.is_present:
#             return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Present</span>')
#         return format_html('<span style="color: #F44336; font-weight: bold;">✗ Absent</span>')
    
#     @admin.display(description='Marked By')
#     def marked_by(self, obj):
#         return obj.teacher.get_full_name() or obj.teacher.email


# @admin.register(Assignment)
# class AssignmentAdmin(admin.ModelAdmin):
#     """Assignment admin"""
#     list_display = ('assignment_info', 'teacher_name', 'has_file')
#     list_filter = ('chapter__subject', 'chapter__class_assigned')
#     search_fields = ('description', 'teacher__email', 'chapter__name')
    
#     @admin.display(description='Assignment')
#     def assignment_info(self, obj):
#         if obj.chapter:
#             return f"{obj.chapter.subject.name} - {obj.chapter.name}"
#         return "General Assignment"
    
#     @admin.display(description='Teacher')
#     def teacher_name(self, obj):
#         return obj.teacher.get_full_name() or obj.teacher.email
    
#     @admin.display(description='File', boolean=True)
#     def has_file(self, obj):
#         return bool(obj.file)


# @admin.register(Doubt)
# class DoubtAdmin(admin.ModelAdmin):
#     """Doubt admin"""
#     list_display = ('doubt_preview', 'student_name', 'subject_name', 'status', 'created_at')
#     list_filter = ('subject', 'created_at')
#     search_fields = ('text', 'student__email', 'subject__name')
#     date_hierarchy = 'created_at'
    
#     @admin.display(description='Doubt')
#     def doubt_preview(self, obj):
#         return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    
#     @admin.display(description='Student')
#     def student_name(self, obj):
#         return obj.student.get_full_name() or obj.student.email
    
#     @admin.display(description='Subject')
#     def subject_name(self, obj):
#         return obj.subject.name
    
#     @admin.display(description='Status')
#     def status(self, obj):
#         if obj.doubtreply_set.exists():
#             return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Answered</span>')
#         return format_html('<span style="color: #FF9800; font-weight: bold;">⏳ Pending</span>')


# @admin.register(DoubtReply)
# class DoubtReplyAdmin(admin.ModelAdmin):
#     """Doubt Reply admin"""
#     list_display = ('reply_preview', 'doubt_preview', 'replied_by', 'created_at')
#     list_filter = ('created_at',)
#     search_fields = ('text', 'user__email', 'doubt__text')
#     date_hierarchy = 'created_at'
    
#     @admin.display(description='Reply')
#     def reply_preview(self, obj):
#         return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    
#     @admin.display(description='Original Doubt')
#     def doubt_preview(self, obj):
#         return obj.doubt.text[:40] + '...' if len(obj.doubt.text) > 40 else obj.doubt.text
    
#     @admin.display(description='Replied By')
#     def replied_by(self, obj):
#         return obj.user.get_full_name() or obj.user.email



































# # # teachers/admin.py
# # from django.contrib import admin
# # from django.utils.html import format_html
# # from .models import TeacherAssignment, Test, Question, Attendance, Assignment, Doubt, DoubtReply


# # # Inline for Questions
# # class QuestionInline(admin.TabularInline):
# #     model = Question
# #     extra = 1
# #     fields = ('question_text', 'option1', 'option2', 'option3', 'option4', 'correct_option')


# # @admin.register(TeacherAssignment)
# # class TeacherAssignmentAdmin(admin.ModelAdmin):
# #     """Teacher Assignment admin"""
# #     list_display = ('teacher_name', 'class_name', 'subject_name', 'student_count')
# #     list_filter = ('class_assigned', 'subject')
# #     search_fields = ('teacher__email', 'teacher__first_name', 'class_assigned__name', 'subject__name')
    
# #     @admin.display(description='Teacher')
# #     def teacher_name(self, obj):
# #         return obj.teacher.get_full_name() or obj.teacher.email
    
# #     @admin.display(description='Class')
# #     def class_name(self, obj):
# #         return obj.class_assigned.name
    
# #     @admin.display(description='Subject')
# #     def subject_name(self, obj):
# #         return obj.subject.name
    
# #     @admin.display(description='Students')
# #     def student_count(self, obj):
# #         from users.models import CustomUser
# #         count = CustomUser.objects.filter(
# #             class_assigned=obj.class_assigned,
# #             role='student',
# #             is_approved=True
# #         ).count()
# #         return count


# # @admin.register(Test)
# # class TestAdmin(admin.ModelAdmin):
# #     """Test admin with inline questions"""
# #     list_display = ('test_info', 'type_badge', 'marks', 'created_by_name', 'question_count', 'attempt_count')
# #     list_filter = ('type', 'chapter__subject', 'chapter__class_assigned')
# #     search_fields = ('chapter__name', 'created_by__email')
# #     inlines = [QuestionInline]
    
# #     @admin.display(description='Test')
# #     def test_info(self, obj):
# #         if obj.chapter:
# #             return f"{obj.chapter.subject.name} - {obj.chapter.name}"
# #         return "General Test"
    
# #     @admin.display(description='Type')
# #     def type_badge(self, obj):
# #         colors = {'mcq': '#2196F3', 'descriptive': '#FF9800'}
# #         return format_html(
# #             '<span style="background: {}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px;">{}</span>',
# #             colors.get(obj.type, '#757575'),
# #             obj.get_type_display()
# #         )
    
# #     @admin.display(description='Created By')
# #     def created_by_name(self, obj):
# #         return obj.created_by.get_full_name() or obj.created_by.email
    
# #     @admin.display(description='Questions')
# #     def question_count(self, obj):
# #         return obj.question_set.count()
    
# #     @admin.display(description='Attempts')
# #     def attempt_count(self, obj):
# #         return obj.testattempt_set.count()


# # @admin.register(Question)
# # class QuestionAdmin(admin.ModelAdmin):
# #     """Question admin"""
# #     list_display = ('question_preview', 'test_info', 'has_image', 'correct_answer')
# #     list_filter = ('test__type',)
# #     search_fields = ('question_text', 'test__chapter__name')
    
# #     @admin.display(description='Question')
# #     def question_preview(self, obj):
# #         return obj.question_text[:60] + '...' if len(obj.question_text) > 60 else obj.question_text
    
# #     @admin.display(description='Test')
# #     def test_info(self, obj):
# #         if obj.test.chapter:
# #             return f"{obj.test.chapter.name} ({obj.test.get_type_display()})"
# #         return f"Test #{obj.test.id}"
    
# #     @admin.display(description='Image', boolean=True)
# #     def has_image(self, obj):
# #         return bool(obj.question_image)
    
# #     @admin.display(description='Answer')
# #     def correct_answer(self, obj):
# #         if obj.correct_option:
# #             return format_html(
# #                 '<strong style="color: #4CAF50;">Option {}</strong>',
# #                 obj.correct_option
# #             )
# #         return "—"


# # @admin.register(Attendance)
# # class AttendanceAdmin(admin.ModelAdmin):
# #     """Attendance admin"""
# #     list_display = ('student_name', 'class_name', 'date', 'time', 'status', 'marked_by')
# #     list_filter = ('is_present', 'date', 'class_assigned')
# #     search_fields = ('student__email', 'student__first_name', 'class_assigned__name')
# #     date_hierarchy = 'date'
    
# #     @admin.display(description='Student')
# #     def student_name(self, obj):
# #         return obj.student.get_full_name() or obj.student.email
    
# #     @admin.display(description='Class')
# #     def class_name(self, obj):
# #         return obj.class_assigned.name
    
# #     @admin.display(description='Status')
# #     def status(self, obj):
# #         if obj.is_present:
# #             return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Present</span>')
# #         return format_html('<span style="color: #F44336; font-weight: bold;">✗ Absent</span>')
    
# #     @admin.display(description='Marked By')
# #     def marked_by(self, obj):
# #         return obj.teacher.get_full_name() or obj.teacher.email


# # @admin.register(Assignment)
# # class AssignmentAdmin(admin.ModelAdmin):
# #     """Assignment admin"""
# #     list_display = ('assignment_info', 'teacher_name', 'has_file')
# #     list_filter = ('chapter__subject', 'chapter__class_assigned')
# #     search_fields = ('description', 'teacher__email', 'chapter__name')
    
# #     @admin.display(description='Assignment')
# #     def assignment_info(self, obj):
# #         if obj.chapter:
# #             return f"{obj.chapter.subject.name} - {obj.chapter.name}"
# #         return "General Assignment"
    
# #     @admin.display(description='Teacher')
# #     def teacher_name(self, obj):
# #         return obj.teacher.get_full_name() or obj.teacher.email
    
# #     @admin.display(description='File', boolean=True)
# #     def has_file(self, obj):
# #         return bool(obj.file)


# # @admin.register(Doubt)
# # class DoubtAdmin(admin.ModelAdmin):
# #     """Doubt admin"""
# #     list_display = ('doubt_preview', 'student_name', 'subject_name', 'status', 'created_at')
# #     list_filter = ('subject', 'created_at')
# #     search_fields = ('text', 'student__email', 'subject__name')
# #     date_hierarchy = 'created_at'
    
# #     @admin.display(description='Doubt')
# #     def doubt_preview(self, obj):
# #         return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    
# #     @admin.display(description='Student')
# #     def student_name(self, obj):
# #         return obj.student.get_full_name() or obj.student.email
    
# #     @admin.display(description='Subject')
# #     def subject_name(self, obj):
# #         return obj.subject.name
    
# #     @admin.display(description='Status')
# #     def status(self, obj):
# #         if obj.doubtreply_set.exists():
# #             return format_html('<span style="color: #4CAF50; font-weight: bold;">✓ Answered</span>')
# #         return format_html('<span style="color: #FF9800; font-weight: bold;">⏳ Pending</span>')


# # @admin.register(DoubtReply)
# # class DoubtReplyAdmin(admin.ModelAdmin):
# #     """Doubt Reply admin"""
# #     list_display = ('reply_preview', 'doubt_preview', 'replied_by', 'created_at')
# #     list_filter = ('created_at',)
# #     search_fields = ('text', 'user__email', 'doubt__text')
# #     date_hierarchy = 'created_at'
    
# #     @admin.display(description='Reply')
# #     def reply_preview(self, obj):
# #         return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    
# #     @admin.display(description='Original Doubt')
# #     def doubt_preview(self, obj):
# #         return obj.doubt.text[:40] + '...' if len(obj.doubt.text) > 40 else obj.doubt.text
    
# #     @admin.display(description='Replied By')
# #     def replied_by(self, obj):
# #         return obj.user.get_full_name() or obj.user.email



























































