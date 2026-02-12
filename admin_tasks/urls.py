# admin_tasks/urls.py
"""
Admin Management URL Configuration
EduVibe Platform - 2026
"""

from django.urls import path
from .views import (
    # User Approval & Management
    PendingUsersView,
    ApproveUserView,
    RejectUserView,
    AllUsersView,
    
    # Class Management
    ClassListView,
    ClassCreateView,
    ClassDetailView,
    ClassDeleteView,
    
    # Subject Management
    SubjectListView,
    SubjectCreateView,
    SubjectDetailView,
    SubjectUpdateView,
    SubjectDeleteView,
    
    # Chapter Management
    ChapterListView,
    ChapterCreateView,
    
    # Teacher Assignments
    TeacherAssignmentListView,
    TeacherAssignmentCreateView,
    
    # Notifications
    NotificationCreateView,
    NotificationListView,
    
    # Fee Management
    FeePaymentCreateView,
    FeePaymentListView,
    FeePaymentDetailView,
    
    # Dashboard
    AdminDashboardStatsView,
)

app_name = 'admin_tasks'

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  USER APPROVAL & MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
    path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
    path('users/reject/', RejectUserView.as_view(), name='reject-user'),
    path('users/all/', AllUsersView.as_view(), name='all-users'),
    
    # ═══════════════════════════════════════════════════════════
    #  CLASS MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('classes/', ClassListView.as_view(), name='class-list'),
    path('classes/create/', ClassCreateView.as_view(), name='class-create'),
    path('classes/<int:class_id>/', ClassDetailView.as_view(), name='class-detail'),
    path('classes/<int:class_id>/delete/', ClassDeleteView.as_view(), name='class-delete'),
    
    # ═══════════════════════════════════════════════════════════
    #  SUBJECT MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('subjects/', SubjectListView.as_view(), name='subject-list'),
    path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
    path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
    path('subjects/<int:subject_id>/update/', SubjectUpdateView.as_view(), name='subject-update'),
    path('subjects/<int:subject_id>/delete/', SubjectDeleteView.as_view(), name='subject-delete'),
    
    # ═══════════════════════════════════════════════════════════
    #  CHAPTER MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('chapters/', ChapterListView.as_view(), name='chapter-list'),
    path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
    
    # ═══════════════════════════════════════════════════════════
    #  TEACHER ASSIGNMENTS
    # ═══════════════════════════════════════════════════════════
    path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
    path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
    
    # ═══════════════════════════════════════════════════════════
    #  NOTIFICATIONS
    # ═══════════════════════════════════════════════════════════
    path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
    # ═══════════════════════════════════════════════════════════
    #  FEE MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
    path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
    path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
    # ═══════════════════════════════════════════════════════════
    #  DASHBOARD
    # ═══════════════════════════════════════════════════════════
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
]




































# # admin_tasks/urls.py
# """
# Admin Management URL Configuration
# EduVibe Platform - 2026
# """

# from django.urls import path
# from .views import (
#     # User Approval & Management
#     PendingUsersView,
#     ApproveUserView,
#     RejectUserView,
#     AllUsersView,
    
#     # Class Management
#     ClassListView,
#     ClassCreateView,
#     ClassDetailView,
#     ClassDeleteView,
    
#     # Subject Management
#     SubjectListView,
#     SubjectCreateView,
#     SubjectDetailView,
#     SubjectTeachersView,
    
#     # Chapter Management
#     ChapterListView,
#     ChapterCreateView,
    
#     # Teacher Assignments
#     TeacherAssignmentListView,
#     TeacherAssignmentCreateView,
#     TeacherAssignmentDeleteView,
#     AvailableTeachersView,
    
#     # Notifications
#     NotificationCreateView,
#     NotificationListView,
    
#     # Fee Management
#     FeePaymentCreateView,
#     FeePaymentListView,
#     FeePaymentDetailView,
    
#     # Dashboard
#     AdminDashboardStatsView,
# )

# app_name = 'admin_tasks'

# urlpatterns = [
#     # ═══════════════════════════════════════════════════════════
#     #  USER APPROVAL & MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('users/pending/', PendingUsersView.as_view(), name='pending-users'),
#     path('users/approve/', ApproveUserView.as_view(), name='approve-user'),
#     path('users/reject/', RejectUserView.as_view(), name='reject-user'),
#     path('users/all/', AllUsersView.as_view(), name='all-users'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  CLASS MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('classes/', ClassListView.as_view(), name='class-list'),
#     path('classes/create/', ClassCreateView.as_view(), name='class-create'),
#     path('classes/<int:class_id>/', ClassDetailView.as_view(), name='class-detail'),
#     path('classes/<int:class_id>/delete/', ClassDeleteView.as_view(), name='class-delete'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  SUBJECT MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('subjects/', SubjectListView.as_view(), name='subject-list'),
#     path('subjects/create/', SubjectCreateView.as_view(), name='subject-create'),
#     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
#     path('subjects/<int:subject_id>/teachers/', SubjectTeachersView.as_view(), name='subject-teachers'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  CHAPTER MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('chapters/', ChapterListView.as_view(), name='chapter-list'),
#     path('chapters/create/', ChapterCreateView.as_view(), name='chapter-create'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  TEACHER ASSIGNMENTS
#     # ═══════════════════════════════════════════════════════════
#     path('teachers/available/', AvailableTeachersView.as_view(), name='available-teachers'),
#     path('teacher-assignments/', TeacherAssignmentListView.as_view(), name='teacher-assignment-list'),
#     path('teacher-assignments/create/', TeacherAssignmentCreateView.as_view(), name='teacher-assignment-create'),
#     path('teacher-assignments/<int:assignment_id>/delete/', TeacherAssignmentDeleteView.as_view(), name='teacher-assignment-delete'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  NOTIFICATIONS
#     # ═══════════════════════════════════════════════════════════
#     path('notifications/create/', NotificationCreateView.as_view(), name='notification-create'),
#     path('notifications/', NotificationListView.as_view(), name='notification-list'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  FEE MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('fees/create/', FeePaymentCreateView.as_view(), name='fee-payment-create'),
#     path('fees/', FeePaymentListView.as_view(), name='fee-payment-list'),
#     path('fees/<int:payment_id>/', FeePaymentDetailView.as_view(), name='fee-payment-detail'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  DASHBOARD
#     # ═══════════════════════════════════════════════════════════
#     path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='dashboard-stats'),
# ]
































