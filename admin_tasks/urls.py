# admin_tasks/urls.py
from django.urls import path
from .views import (
    PendingUsersView, ApproveUserView, RejectUserView, AllUsersView,
    ClassListView, ClassCreateView, ClassDetailView, ClassDeleteView,
    ManageAcademicClassesView, AcademicClassDetailView,
    AcademicSubjectManageView, AcademicSubjectDetailView,
    SubjectListView, SubjectCreateView, SubjectDetailView, ManageSubjectsView,
    ChapterCreateView, ManageChaptersView, ChapterDetailView,
    TeacherAssignmentListView, TeacherAssignmentCreateView,
    TeacherAssignmentDeleteView, GetTeacherAssignmentsView,
    NotificationCreateView, NotificationListView,
    FeePaymentCreateView, FeePaymentListView, FeePaymentDetailView,
    AdminDashboardStatsView, GetTeachersView, DeleteUserView, UpdateUserView,
    assign_teacher_to_subject,
)

app_name = 'admin_tasks'

urlpatterns = [

    # ── User Management ──────────────────────────────────────────
    path('users/pending/',              PendingUsersView.as_view(),             name='pending-users'),
    path('users/approve/',              ApproveUserView.as_view(),              name='approve-user'),
    path('users/reject/',               RejectUserView.as_view(),               name='reject-user'),
    path('users/all/',                  AllUsersView.as_view(),                 name='all-users'),
    path('users/<int:user_id>/delete/', DeleteUserView.as_view(),               name='delete-user'),
    path('users/<int:user_id>/update/', UpdateUserView.as_view(),               name='update-user'),

    # ── Class Management ─────────────────────────────────────────
    path('classes/',                    ManageAcademicClassesView.as_view(),    name='manage-academic-classes'),
    path('classes/<int:class_id>/',     AcademicClassDetailView.as_view(),      name='academic-class-detail'),
    path('classes/old/',                ClassListView.as_view(),                name='class-list'),
    path('classes/old/create/',         ClassCreateView.as_view(),              name='class-create'),

    # ── Subject Management ───────────────────────────────────────
    path('subjects/',                           ManageSubjectsView.as_view(),           name='manage-subjects'),
    path('subjects/create/',                    SubjectCreateView.as_view(),            name='subject-create'),
    path('subjects/<int:subject_id>/',          SubjectDetailView.as_view(),            name='subject-detail'),
    path('subjects/<int:subject_id>/update/',   SubjectDetailView.as_view(),            name='subject-update'),
    path('academic-subjects/',                  AcademicSubjectManageView.as_view(),    name='academic-subject-manage'),
    path('academic-subjects/<int:subject_id>/', AcademicSubjectDetailView.as_view(),    name='academic-subject-detail'),

    # ── Chapter Management ───────────────────────────────────────
    path('chapters/',                       ManageChaptersView.as_view(),       name='manage-chapters'),
    path('chapters/create/',                ChapterCreateView.as_view(),        name='chapter-create'),
    path('chapters/<int:chapter_id>/',      ChapterDetailView.as_view(),        name='chapter-detail'),

    # ── Teacher Assignments ──────────────────────────────────────
    path('assign-teacher/',                                     assign_teacher_to_subject,                    name='assign-teacher'),
    path('teacher-assignments/',                                GetTeacherAssignmentsView.as_view(),          name='teacher-assignment-list'),
    path('teacher-assignments/create/',                         TeacherAssignmentCreateView.as_view(),        name='teacher-assignment-create'),
    path('teacher-assignments/delete/<int:assignment_id>/',     TeacherAssignmentDeleteView.as_view(),        name='teacher-assignment-delete'),

    # ── Notifications ────────────────────────────────────────────
    path('notifications/create/',       NotificationCreateView.as_view(),       name='notification-create'),
    path('notifications/',              NotificationListView.as_view(),         name='notification-list'),

    # ── Fee Management ───────────────────────────────────────────
    path('fees/create/',                FeePaymentCreateView.as_view(),         name='fee-payment-create'),
    path('fees/',                       FeePaymentListView.as_view(),           name='fee-payment-list'),
    path('fees/<int:payment_id>/',      FeePaymentDetailView.as_view(),         name='fee-payment-detail'),

    # ── Dashboard & Helpers ──────────────────────────────────────
    path('dashboard/stats/',            AdminDashboardStatsView.as_view(),      name='dashboard-stats'),
    path('teachers/',                   GetTeachersView.as_view(),              name='get-teachers'),
]

























































































































# # admin_tasks/urls.py
# from django.urls import path
# # from .views import (
# #     PendingUsersView, ApproveUserView, RejectUserView, AllUsersView,
# #     ClassListView, ClassCreateView, ClassDetailView, ClassDeleteView,
# #     ManageAcademicClassesView, AcademicClassDetailView,
# #     AcademicSubjectManageView, AcademicSubjectDetailView,
# #     SubjectListView, SubjectCreateView, SubjectDetailView, ManageSubjectsView,
# #     ChapterCreateView, ManageChaptersView, ChapterDetailView,
# #     TeacherAssignmentListView, TeacherAssignmentCreateView,
# #     NotificationCreateView, NotificationListView,
# #     FeePaymentCreateView, FeePaymentListView, FeePaymentDetailView,
# #     AdminDashboardStatsView, GetTeachersView,DeleteUserView, UpdateUserView,assign_teacher_to_subject,assign_teacher_to_subject,
# # )
# from .views import (
#     PendingUsersView, ApproveUserView, RejectUserView, AllUsersView,
#     ClassListView, ClassCreateView, ClassDetailView, ClassDeleteView,
#     ManageAcademicClassesView, AcademicClassDetailView,
#     SubjectListView, SubjectCreateView, SubjectDetailView, ManageSubjectsView,
#     ChapterCreateView, ManageChaptersView, ChapterDetailView,
#     TeacherAssignmentListView, TeacherAssignmentCreateView,
#     TeacherAssignmentDeleteView, GetTeacherAssignmentsView,
#     NotificationCreateView, NotificationListView,
#     FeePaymentCreateView, FeePaymentListView, FeePaymentDetailView,
#     AdminDashboardStatsView, GetTeachersView, DeleteUserView, UpdateUserView,
#     assign_teacher_to_subject,
# )


# app_name = 'admin_tasks'

# urlpatterns = [
#     # User Management
#     path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
#     path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
#     path('users/reject/', RejectUserView.as_view(), name='reject-user'),
#     path('users/all/', AllUsersView.as_view(), name='all-users'),
#     path('users/<int:user_id>/delete/',    DeleteUserView.as_view(),    name='delete-user'), 
#     path('users/<int:user_id>/update/',    UpdateUserView.as_view(),    name='update-user'),  
    
#     # teacher assign
#     path('assign-teacher/', assign_teacher_to_subject, name='assign-teacher'),
#     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
#     path('teacher-assignments/delete/<int:assignment_id>/', TeacherAssignmentDeleteView.as_view(), name='teacher-assignment-delete'),
    
#     # Class Management
#     path('classes/', ManageAcademicClassesView.as_view(), name='manage-academic-classes'),
#     path('classes/<int:class_id>/', AcademicClassDetailView.as_view(), name='academic-class-detail'),
#     path('classes/old/', ClassListView.as_view(), name='class-list'),
#     path('classes/old/create/', ClassCreateView.as_view(), name='class-create'),


#     path('academic-subjects/',              AcademicSubjectManageView.as_view(),    name='academic-subject-manage'),
#     path('academic-subjects/<int:subject_id>/', AcademicSubjectDetailView.as_view(), name='academic-subject-detail'),






    
#     # Subject Management
#     path('subjects/', ManageSubjectsView.as_view(), name='manage-subjects'),
#     path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
#     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
#     path('subjects/<int:subject_id>/update/', SubjectDetailView.as_view(), name='subject-update'),
    
#     # Chapter Management
#     path('chapters/', ManageChaptersView.as_view(), name='manage-chapters'),
#     path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
#     path('chapters/<int:chapter_id>/', ChapterDetailView.as_view(), name='chapter-detail'),
    
#     # Teacher Assignments
#     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
#     path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
    
#     # Notifications
#     path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
#     path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
#     # Fee Management
#     path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
#     path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
#     path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
#     # Dashboard & Helpers
#     path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
#     path('teachers/', GetTeachersView.as_view(), name='get-teachers'),
# ]














# # # admin_tasks/urls.py - FINAL CORRECTED VERSION
# # from django.urls import path
# # from .views import (
# #     PendingUsersView, ApproveUserView, RejectUserView, AllUsersView,
# #     ClassListView, ClassCreateView, ClassDetailView, ClassDeleteView,
# #     ManageAcademicClassesView, AcademicClassDetailView,
# #     SubjectListView, SubjectCreateView, SubjectDetailView, ManageSubjectsView,
# #     ChapterCreateView, ManageChaptersView, ChapterDetailView,
# #     TeacherAssignmentListView, TeacherAssignmentCreateView,
# #     NotificationCreateView, NotificationListView,
# #     FeePaymentCreateView, FeePaymentListView, FeePaymentDetailView,
# #     AdminDashboardStatsView, GetTeachersView,
# # )

# # app_name = 'admin_tasks'

# # urlpatterns = [
# #     path('assign-teacher/', assign_teacher_to_subject, name='assign_teacher'),
# #     # User Management
# #     path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
# #     path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
# #     path('users/reject/', RejectUserView.as_view(), name='reject-user'),
# #     path('users/all/', AllUsersView.as_view(), name='all-users'),
    
# #     # Class Management
# #     path('classes/', ManageAcademicClassesView.as_view(), name='manage-academic-classes'),
# #     path('classes/<int:class_id>/', AcademicClassDetailView.as_view(), name='academic-class-detail'),
# #     path('classes/old/', ClassListView.as_view(), name='class-list'),
# #     path('classes/old/create/', ClassCreateView.as_view(), name='class-create'),
    
# #     # Subject Management
# #     path('subjects/', ManageSubjectsView.as_view(), name='manage-subjects'),
# #     path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
# #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
    
# #     # Chapter Management
# #     path('chapters/', ManageChaptersView.as_view(), name='manage-chapters'),
# #     path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
# #     path('chapters/<int:chapter_id>/', ChapterDetailView.as_view(), name='chapter-detail'),
    
# #     # Teacher Assignments
# #     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
# #     path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
    
# #     # Notifications
# #     path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
# #     path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
# #     # Fee Management
# #     path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
# #     path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
# #     path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
# #     # Dashboard & Helpers
# #     path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
# #     path('teachers/', GetTeachersView.as_view(), name='get-teachers'),
# # ]






























# # # # admin_tasks/urls.py - FIXED VERSION
# # # """
# # # Admin Management URL Configuration
# # # EduVibe Platform - 2026
# # # """

# # # from django.urls import path
# # # from .views import (
# # #     # User Approval & Management
# # #     PendingUsersView,
# # #     ApproveUserView,
# # #     RejectUserView,
# # #     AllUsersView,
    
# # #     # Class Management
# # #     ClassListView,
# # #     ClassCreateView,
# # #     ClassDetailView,
# # #     ClassDeleteView,
# # #     ManageAcademicClassesView,
# # #     AcademicClassDetailView,
    
# # #     # Subject Management
# # #     SubjectListView,
# # #     SubjectCreateView,
# # #     SubjectDetailView,
# # #     # SubjectUpdateView,  # ❌ COMMENTED OUT - Not in views.py
# # #     # SubjectDeleteView,  # ❌ COMMENTED OUT - Not in views.py
# # #     ManageSubjectsView,
    
# # #     # Chapter Management
# # #     ChapterListView,
# # #     ChapterCreateView,
# # #     ManageChaptersView,
# # #     ChapterDetailView,
    
# # #     # Teacher Assignments
# # #     TeacherAssignmentListView,
# # #     TeacherAssignmentCreateView,
    
# # #     # Notifications
# # #     NotificationCreateView,
# # #     NotificationListView,
    
# # #     # Fee Management
# # #     FeePaymentCreateView,
# # #     FeePaymentListView,
# # #     FeePaymentDetailView,
    
# # #     # Dashboard
# # #     AdminDashboardStatsView,
    
# # #     # Helper endpoints
# # #     GetTeachersView,
# # # )

# # # app_name = 'admin_tasks'

# # # urlpatterns = [
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  USER APPROVAL & MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
# # #     path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
# # #     path('users/reject/', RejectUserView.as_view(), name='reject-user'),
# # #     path('users/all/', AllUsersView.as_view(), name='all-users'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  CLASS MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('classes/', ManageAcademicClassesView.as_view(), name='manage-academic-classes'),
# # #     path('classes/create/', ClassCreateView.as_view(), name='class-create'),
# # #     path('classes/<int:class_id>/', AcademicClassDetailView.as_view(), name='academic-class-detail'),
# # #     path('classes/<int:class_id>/delete/', ClassDeleteView.as_view(), name='class-delete'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  SUBJECT MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('subjects/', ManageSubjectsView.as_view(), name='manage-subjects'),
# # #     path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
# # #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
# # #     # path('subjects/<int:subject_id>/update/', SubjectUpdateView.as_view(), name='subject-update'),  # ❌ REMOVED
# # #     # path('subjects/<int:subject_id>/delete/', SubjectDeleteView.as_view(), name='subject-delete'),  # ❌ REMOVED
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  CHAPTER MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('chapters/', ManageChaptersView.as_view(), name='manage-chapters'),
# # #     path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
# # #     path('chapters/<int:chapter_id>/', ChapterDetailView.as_view(), name='chapter-detail'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  TEACHER ASSIGNMENTS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
# # #     path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  NOTIFICATIONS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
# # #     path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  FEE MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
# # #     path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
# # #     path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  DASHBOARD
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  HELPER ENDPOINTS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('teachers/', GetTeachersView.as_view(), name='get-teachers'),
# # # ]






























# # # # # admin_tasks/urls.py
# # # # """
# # # # Admin Management URL Configuration
# # # # EduVibe Platform - 2026
# # # # """

# # # # from django.urls import path
# # # # from .views import (
# # # #     # User Approval & Management
# # # #     PendingUsersView,
# # # #     ApproveUserView,
# # # #     RejectUserView,
# # # #     AllUsersView,
    
# # # #     # Class Management
# # # #     ClassListView,
# # # #     ClassCreateView,
# # # #     ClassDetailView,
# # # #     ClassDeleteView,
# # # #     ManageAcademicClassesView,  # ✅ Changed
# # # #     AcademicClassDetailView,
    
# # # #     # Subject Management
# # # #     SubjectListView,
# # # #     SubjectCreateView,
# # # #     SubjectDetailView,
# # # #     SubjectUpdateView,
# # # #     SubjectDeleteView,
     
    
# # # #     # Chapter Management
# # # #     ChapterListView,
# # # #     ChapterCreateView,
    
# # # #     # Teacher Assignments
# # # #     TeacherAssignmentListView,
# # # #     TeacherAssignmentCreateView,
    
# # # #     # Notifications
# # # #     NotificationCreateView,
# # # #     NotificationListView,
    
# # # #     # Fee Management
# # # #     FeePaymentCreateView,
# # # #     FeePaymentListView,
# # # #     FeePaymentDetailView,
    
# # # #     # Dashboard
# # # #     AdminDashboardStatsView,
# # # # )

# # # # app_name = 'admin_tasks'

# # # # urlpatterns = [
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  USER APPROVAL & MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
# # # #     path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
# # # #     path('users/reject/', RejectUserView.as_view(), name='reject-user'),
# # # #     path('users/all/', AllUsersView.as_view(), name='all-users'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  CLASS MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('classes/', ClassListView.as_view(), name='class-list'),
# # # #     path('classes/create/', ClassCreateView.as_view(), name='class-create'),
# # # #     path('classes/<int:class_id>/', ClassDetailView.as_view(), name='class-detail'),
# # # #     path('classes/<int:class_id>/delete/', ClassDeleteView.as_view(), name='class-delete'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  SUBJECT MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('subjects/', SubjectListView.as_view(), name='subject-list'),
# # # #     path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
# # # #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
# # # #     path('subjects/<int:subject_id>/update/', SubjectUpdateView.as_view(), name='subject-update'),
# # # #     path('subjects/<int:subject_id>/delete/', SubjectDeleteView.as_view(), name='subject-delete'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  CHAPTER MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('chapters/', ChapterListView.as_view(), name='chapter-list'),
# # # #     path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  TEACHER ASSIGNMENTS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
# # # #     path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  NOTIFICATIONS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
# # # #     path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  FEE MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
# # # #     path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
# # # #     path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  DASHBOARD
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
# # # #     path('classes/', ManageAcademicClassesView.as_view(), name='manage-academic-classes'),
# # # #     path('classes/<int:class_id>/', AcademicClassDetailView.as_view(), name='academic-class-detail'),
    
# # # #     # Subjects
# # # #     path('subjects/', ManageSubjectsView.as_view(), name='manage-subjects'),
# # # #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
    
# # # #     # Chapters
# # # #     path('chapters/', ManageChaptersView.as_view(), name='manage-chapters'),
# # # #     path('chapters/<int:chapter_id>/', ChapterDetailView.as_view(), name='chapter-detail'),
    
# # # #     # Helper endpoints
# # # #     path('teachers/', GetTeachersView.as_view(), name='get-teachers'),
# # # # ]




































# # # # # # admin_tasks/urls.py
# # # # # """
# # # # # Admin Management URL Configuration
# # # # # EduVibe Platform - 2026
# # # # # """

# # # # # from django.urls import path
# # # # # from .views import (
# # # # #     # User Approval & Management
# # # # #     PendingUsersView,
# # # # #     ApproveUserView,
# # # # #     RejectUserView,
# # # # #     AllUsersView,
    
# # # # #     # Class Management
# # # # #     ClassListView,
# # # # #     ClassCreateView,
# # # # #     ClassDetailView,
# # # # #     ClassDeleteView,
    
# # # # #     # Subject Management
# # # # #     SubjectListView,
# # # # #     SubjectCreateView,
# # # # #     SubjectDetailView,
# # # # #     SubjectTeachersView,
    
# # # # #     # Chapter Management
# # # # #     ChapterListView,
# # # # #     ChapterCreateView,
    
# # # # #     # Teacher Assignments
# # # # #     TeacherAssignmentListView,
# # # # #     TeacherAssignmentCreateView,
# # # # #     TeacherAssignmentDeleteView,
# # # # #     AvailableTeachersView,
    
# # # # #     # Notifications
# # # # #     NotificationCreateView,
# # # # #     NotificationListView,
    
# # # # #     # Fee Management
# # # # #     FeePaymentCreateView,
# # # # #     FeePaymentListView,
# # # # #     FeePaymentDetailView,
    
# # # # #     # Dashboard
# # # # #     AdminDashboardStatsView,
# # # # # )

# # # # # app_name = 'admin_tasks'

# # # # # urlpatterns = [
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  USER APPROVAL & MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
# # # # #     path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
# # # # #     path('users/reject/', RejectUserView.as_view(), name='reject-user'),
# # # # #     path('users/all/', AllUsersView.as_view(), name='all-users'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  CLASS MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('classes/', ClassListView.as_view(), name='class-list'),
# # # # #     path('classes/create/', ClassCreateView.as_view(), name='class-create'),
# # # # #     path('classes/<int:class_id>/', ClassDetailView.as_view(), name='class-detail'),
# # # # #     path('classes/<int:class_id>/delete/', ClassDeleteView.as_view(), name='class-delete'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  SUBJECT MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('subjects/', SubjectListView.as_view(), name='subject-list'),
# # # # #     path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
# # # # #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
# # # # #     path('subjects/<int:subject_id>/teachers/', SubjectTeachersView.as_view(), name='subject-teachers'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  CHAPTER MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('chapters/', ChapterListView.as_view(), name='chapter-list'),
# # # # #     path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  TEACHER ASSIGNMENTS
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('teachers/available/', AvailableTeachersView.as_view(), name='available-teachers'),
# # # # #     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
# # # # #     path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
# # # # #     path('teacher-assignments/<int:assignment_id>/delete/', TeacherAssignmentDeleteView.as_view(), name='teacher-assignment-delete'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  NOTIFICATIONS
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
# # # # #     path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  FEE MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
# # # # #     path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
# # # # #     path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  DASHBOARD
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
# # # # # ]
































