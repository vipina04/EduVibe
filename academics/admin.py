from django.contrib import admin
from .models import AcademicClass, Subject, Chapter, TeacherAssignment, ClassSubject, Doubt, DoubtReply

admin.site.register(AcademicClass)
admin.site.register(Subject)
admin.site.register(Chapter)
admin.site.register(ClassSubject)
admin.site.register(Doubt)
admin.site.register(DoubtReply)


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'class_subject', 'created_at']
    list_filter = ['class_subject__academic_class', 'class_subject__subject']
    search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'teacher', 'class_subject__subject', 'class_subject__academic_class'
        )





























# from django.contrib import admin
# # from .models import AcademicClass, Subject, Chapter, TeacherSubjectAssignment, Doubt, DoubtReply
# from .models import AcademicClass, Subject, Chapter, TeacherAssignment, ClassSubject, Doubt, DoubtReply

# admin.site.register(AcademicClass)
# admin.site.register(Subject)
# admin.site.register(Chapter)
# admin.site.register(Doubt)
# admin.site.register(DoubtReply)


# @admin.register(TeacherSubjectAssignment)
# class TeacherSubjectAssignmentAdmin(admin.ModelAdmin):
#     list_display = ['teacher', 'subject', 'class_assigned', 'created_at']
#     list_filter = ['class_assigned', 'subject']
#     search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']

#     def get_queryset(self, request):
#         return super().get_queryset(request).select_related(
#             'teacher', 'subject', 'class_assigned'
#         )



# # from django.contrib import admin
# # from .models import AcademicClass, Subject, Chapter, TeacherSubjectAssignment, Doubt, DoubtReply

# # admin.site.register(AcademicClass)
# # admin.site.register(Subject)
# # admin.site.register(Chapter)
# # admin.site.register(TeacherSubjectAssignment)
# # admin.site.register(Doubt)
# # admin.site.register(DoubtReply)



# # @admin.register(TeacherSubjectAssignment)
# # class TeacherSubjectAssignmentAdmin(admin.ModelAdmin):
# #     list_display = ['teacher', 'subject', 'class_assigned', 'created_at']
# #     list_filter = ['class_assigned', 'subject']
# #     search_fields = ['teacher__username', 'teacher__first_name', 'teacher__last_name']
# #     autocomplete_fields = ['teacher', 'subject', 'class_assigned']
    
# #     def get_queryset(self, request):
# #         return super().get_queryset(request).select_related(
# #             'teacher', 'subject', 'class_assigned'
# #         )