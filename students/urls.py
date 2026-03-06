# students/urls.py
"""
Student Module URL Configuration
EduVibe Platform - 2026
"""

from django.urls import path
from .views import (
    # Home & Navigation
    StudentHomeView,
    StudentDashboardView,
    StudentSubjectsView,
    SubjectDetailView,
    ChapterTestsView,
    StudentSubjectChaptersView,

    # Test Taking
    TestStartView,
    TestSubmitView,
    TestResultView,
    MyTestAttemptsView,
    SubjectTestsView,

    # Attendance & Fees
    MyAttendanceView,
    MyFeePaymentsView,
    StudentAttendanceView,

    # Assignments
    MyAssignmentsView,

    # Doubts
    DoubtCreateView,
    EnrolledSubjectsView,

    # Notifications
    MyNotificationsView,
    StudentNotificationsView,
    StudentMarkNotificationReadView,
    StudentMarkAllReadView,

    # Search
    StudentSearchView,
    DiagnosticView,
)

from .views_doubts import StudentDoubtListView, StudentDoubtReplyView, StudentCreateDoubtView

app_name = 'students'

urlpatterns = [

    # ═══════════════════════════════════════════════════════════
    #  HOME & DASHBOARD
    # ═══════════════════════════════════════════════════════════
    path('home/', StudentHomeView.as_view(), name='student-home'),
    path('dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),

    # ═══════════════════════════════════════════════════════════
    #  SUBJECTS & CHAPTERS
    #  ⚠️ ORDER MATTERS: specific paths before generic /<id>/
    # ═══════════════════════════════════════════════════════════
    path('subjects/', StudentSubjectsView.as_view(), name='student-subjects'),
    path('subjects/<int:subject_id>/chapters/', StudentSubjectChaptersView.as_view(), name='subject-chapters'),  # specific first ✅
    path('subjects/<int:subject_id>/tests/', SubjectTestsView.as_view(), name='subject-tests'),                  # specific first ✅
    path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),                      # generic last  ✅
    path('chapters/<int:chapter_id>/tests/', ChapterTestsView.as_view(), name='chapter-tests'),

    # ═══════════════════════════════════════════════════════════
    #  TEST TAKING
    # ═══════════════════════════════════════════════════════════
    path('tests/<int:test_id>/start/', TestStartView.as_view(), name='test-start'),
    path('test-attempts/<int:test_id>/submit/', TestSubmitView.as_view(), name='test-submit'),
    path('test-attempts/<int:attempt_id>/result/', TestResultView.as_view(), name='test-result'),
    path('my-test-attempts/', MyTestAttemptsView.as_view(), name='my-test-attempts'),

    # ═══════════════════════════════════════════════════════════
    #  ATTENDANCE & FEES
    # ═══════════════════════════════════════════════════════════
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('my-fee-payments/', MyFeePaymentsView.as_view(), name='my-fee-payments'),
    path('attendance/', StudentAttendanceView.as_view(), name='student-attendance'),

    # ═══════════════════════════════════════════════════════════
    #  ASSIGNMENTS
    # ═══════════════════════════════════════════════════════════
    path('my-assignments/', MyAssignmentsView.as_view(), name='my-assignments'),

    # ═══════════════════════════════════════════════════════════
    #  DOUBTS
    # ═══════════════════════════════════════════════════════════
    path('doubts/create/', StudentCreateDoubtView.as_view(), name='doubt-create'),
    path('doubts/', StudentDoubtListView.as_view(), name='doubt-list'),
    path('doubts/<int:doubt_id>/reply/', StudentDoubtReplyView.as_view(), name='doubt-reply'),

    # ═══════════════════════════════════════════════════════════
    #  NOTIFICATIONS
    # ═══════════════════════════════════════════════════════════
    path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    path('notifications/', StudentNotificationsView.as_view(), name='student-notifications'),
    path('notifications/mark-all-read/', StudentMarkAllReadView.as_view(), name='student-mark-all-read'),
    path('notifications/<int:notification_id>/mark-read/', StudentMarkNotificationReadView.as_view(), name='student-mark-read'),

    # ═══════════════════════════════════════════════════════════
    #  SEARCH & MISC
    # ═══════════════════════════════════════════════════════════
    path('search/', StudentSearchView.as_view(), name='search'),
    path('diagnostic/', DiagnosticView.as_view(), name='diagnostic'),
]




















































































