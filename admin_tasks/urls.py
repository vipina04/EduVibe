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











