from django.contrib import admin
from .models import (
    AcademicClass,
    Subject,
    Chapter,
    TeacherSubjectAssignment,
    Doubt,
    DoubtReply,
)

@admin.register(AcademicClass)
class AcademicClassAdmin(admin.ModelAdmin):
    list_display  = ['name', 'created_at']
    search_fields = ['name']
    ordering      = ['name']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display  = ['name', 'academic_class', 'teacher', 'created_at']
    list_filter   = ['academic_class']
    search_fields = ['name', 'academic_class__name']
    ordering      = ['academic_class', 'name']

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display  = ['name', 'subject', 'order', 'created_at']
    list_filter   = ['subject__academic_class', 'subject']
    search_fields = ['name', 'subject__name']
    ordering      = ['subject', 'order', 'name']

@admin.register(TeacherSubjectAssignment)
class TeacherSubjectAssignmentAdmin(admin.ModelAdmin):
    list_display  = ['teacher', 'subject', 'class_assigned', 'created_at']
    list_filter   = ['class_assigned', 'subject']
    search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']

@admin.register(Doubt)
class DoubtAdmin(admin.ModelAdmin):
    list_display  = ['student', 'subject', 'status', 'created_at']
    list_filter   = ['status', 'subject__academic_class']
    search_fields = ['student__email', 'doubt_text']

@admin.register(DoubtReply)
class DoubtReplyAdmin(admin.ModelAdmin):
    list_display  = ['doubt', 'replied_by', 'created_at']
    search_fields = ['replied_by__email', 'reply_text']























# # academics/admin.py — FIXED VERSION
# # Copy this ENTIRE file and REPLACE your academics/admin.py with it

# from django.contrib import admin
# from .models import (
#     AcademicClass,
#     Subject,
#     Chapter,
#     TeacherSubjectAssignment,   # ← correct name (NOT TeacherAssignment)
#     Doubt,
#     DoubtReply,
#     # ClassSubject does NOT exist in your models — removed
# )


# @admin.register(AcademicClass)
# class AcademicClassAdmin(admin.ModelAdmin):
#     list_display  = ['name', 'created_at']
#     search_fields = ['name']
#     ordering      = ['name']


# @admin.register(Subject)
# class SubjectAdmin(admin.ModelAdmin):
#     list_display  = ['name', 'academic_class', 'teacher', 'created_at']
#     list_filter   = ['academic_class']
#     search_fields = ['name', 'academic_class__name']
#     ordering      = ['academic_class', 'name']


# @admin.register(Chapter)
# class ChapterAdmin(admin.ModelAdmin):
#     list_display  = ['name', 'subject', 'order', 'created_at']
#     list_filter   = ['subject__academic_class', 'subject']
#     search_fields = ['name', 'subject__name']
#     ordering      = ['subject', 'order', 'name']


# @admin.register(TeacherSubjectAssignment)
# class TeacherSubjectAssignmentAdmin(admin.ModelAdmin):
#     list_display  = ['teacher', 'subject', 'class_assigned', 'created_at']
#     list_filter   = ['class_assigned', 'subject']
#     search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']

#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related(
#             'teacher', 'subject', 'class_assigned'
#         )


# @admin.register(Doubt)
# class DoubtAdmin(admin.ModelAdmin):
#     list_display  = ['student', 'subject', 'status', 'created_at']
#     list_filter   = ['status', 'subject__academic_class']
#     search_fields = ['student__email', 'doubt_text']


# @admin.register(DoubtReply)
# class DoubtReplyAdmin(admin.ModelAdmin):
#     list_display  = ['doubt', 'replied_by', 'created_at']
#     search_fields = ['replied_by__email', 'reply_text']













# # from django.contrib import admin
# # from .models import AcademicClass, Subject, Chapter, TeacherAssignment, ClassSubject, Doubt, DoubtReply

# # admin.site.register(AcademicClass)
# # admin.site.register(Subject)
# # admin.site.register(Chapter)
# # admin.site.register(ClassSubject)
# # admin.site.register(Doubt)
# # admin.site.register(DoubtReply)


# # @admin.register(TeacherAssignment)
# # class TeacherAssignmentAdmin(admin.ModelAdmin):
# #     list_display = ['teacher', 'class_subject', 'created_at']
# #     list_filter = ['class_subject__academic_class', 'class_subject__subject']
# #     search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']

# #     def get_queryset(self, request):
# #         return super().get_queryset(request).select_related(
# #             'teacher', 'class_subject__subject', 'class_subject__academic_class'
# #         )





























# # # from django.contrib import admin
# # # # from .models import AcademicClass, Subject, Chapter, TeacherSubjectAssignment, Doubt, DoubtReply
# # # from .models import AcademicClass, Subject, Chapter, TeacherAssignment, ClassSubject, Doubt, DoubtReply

# # # admin.site.register(AcademicClass)
# # # admin.site.register(Subject)
# # # admin.site.register(Chapter)
# # # admin.site.register(Doubt)
# # # admin.site.register(DoubtReply)


# # # @admin.register(TeacherSubjectAssignment)
# # # class TeacherSubjectAssignmentAdmin(admin.ModelAdmin):
# # #     list_display = ['teacher', 'subject', 'class_assigned', 'created_at']
# # #     list_filter = ['class_assigned', 'subject']
# # #     search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']

# # #     def get_queryset(self, request):
# # #         return super().get_queryset(request).select_related(
# # #             'teacher', 'subject', 'class_assigned'
# # #         )



# # # # from django.contrib import admin
# # # # from .models import AcademicClass, Subject, Chapter, TeacherSubjectAssignment, Doubt, DoubtReply

# # # # admin.site.register(AcademicClass)
# # # # admin.site.register(Subject)
# # # # admin.site.register(Chapter)
# # # # admin.site.register(TeacherSubjectAssignment)
# # # # admin.site.register(Doubt)
# # # # admin.site.register(DoubtReply)



# # # # @admin.register(TeacherSubjectAssignment)
# # # # class TeacherSubjectAssignmentAdmin(admin.ModelAdmin):
# # # #     list_display = ['teacher', 'subject', 'class_assigned', 'created_at']
# # # #     list_filter = ['class_assigned', 'subject']
# # # #     search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']
# # # #     autocomplete_fields = ['teacher', 'subject', 'class_assigned']
    
# # # #     def get_queryset(self, request):
# # # #         return super().get_queryset(request).select_related(
# # # #             'teacher', 'subject', 'class_assigned'
# # # #         )