# teachers/urls.py - FIXED VERSION (URL Pattern Corrected)
"""
Teacher Module URL Configuration
EduVibe Platform - 2026
✅ Fixed URL pattern to match frontend expectations
✅ Fixed views_doubts import
"""

from django.urls import path
from . import views
from . import views_doubts  # ← ADD THIS IMPORT!

from .views import (
    # Core & Utility
    TeacherHomeView,
    TeacherClassesListView,
    TeacherSubjectsListView,
    TeacherClassSubjectsView,
    TeacherSubjectClassesView,
    TeacherSearchView,
    ClassStudentsView,
    
    # Curriculum
    TeacherChaptersView,
    MarkChapterCompleteView,
    
    # Test Management
    TestListView,
    TestCreateView,
    TestDetailView,
    TestResultsView,
    
    # Question Management
    QuestionCreateView,
    QuestionUpdateView,
    QuestionDeleteView,
    
    # Attendance
    TeacherAttendanceHistoryView,
    AttendanceMarkView,
    AttendanceListView,
    StudentAttendanceHistoryView,
    
    # Assignments
    AssignmentCreateView,
    AssignmentListView,
    AssignmentDetailView,
    
    # Doubts
    DoubtListView,
    DoubtDetailView,
    DoubtReplyCreateView,
    
    # notifications
    TeacherNotificationsView,
    TeacherMarkNotificationReadView,
    TeacherMarkAllReadView,
)

app_name = 'teachers'

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  CORE & NAVIGATION
    # ═══════════════════════════════════════════════════════════
    path('home/', TeacherHomeView.as_view(), name='home'),
    path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
    path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
    path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),
    path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
    path('search/', TeacherSearchView.as_view(), name='teacher-search'),
    
    # Students - ✅ FIXED - changed "classes" to "class" to match frontend
    path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
    path('assigned-classes/', views.get_assigned_classes, name='assigned-classes'),
    
    # ═══════════════════════════════════════════════════════════
    #  CHAPTERS & CURRICULUM
    # ═══════════════════════════════════════════════════════════
    path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
    path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
    # ═══════════════════════════════════════════════════════════
    #  TEST & QUESTION MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('tests/', TestListView.as_view(), name='test-list'),
    path('tests/create/', TestCreateView.as_view(), name='test-create'),
    path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
    path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
    path('tests/<int:test_id>/edit/',   views.edit_test,   name='test-edit'),
    path('tests/<int:test_id>/delete/', views.delete_test, name='test-delete'),
    
    # NEW: Function-based views for tests
    path('tests/all/', views.get_all_teacher_tests, name='get-all-teacher-tests'),
    path('tests/<int:test_id>/results-detailed/', views.get_test_results, name='get-test-results-detailed'),
    
    # Questions
    path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
    path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
    # NEW: Function-based views for questions and tests
    path('class/<int:class_id>/subject/<int:subject_id>/chapters/', views.TeacherChaptersView.as_view(), name='teacher-chapters'),
    path('create-test/', views.create_test, name='create-test'),
    path('create-question/', views.create_question, name='create-question'),
    
    # ═══════════════════════════════════════════════════════════
    #  ATTENDANCE
    # ═══════════════════════════════════════════════════════════
    path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
    path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
    path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    path('attendance/history/', TeacherAttendanceHistoryView.as_view(), name='attendance-history'),

    # ═══════════════════════════════════════════════════════════
    #  ASSIGNMENTS
    # ═══════════════════════════════════════════════════════════
    path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
    path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
    path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
    # ═══════════════════════════════════════════════════════════
    #  DOUBTS - CLASS BASED VIEWS
    # ═══════════════════════════════════════════════════════════
    path('doubts/', DoubtListView.as_view(), name='doubt-list'),
    path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
    path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
    # ═══════════════════════════════════════════════════════════
    #  DOUBTS - FUNCTION BASED VIEWS (NEW)
    # ═══════════════════════════════════════════════════════════
    path('teacher-assigned-classes/', views_doubts.get_teacher_assigned_classes, name='teacher-assigned-classes'),
    path('teacher-assigned-subjects/', views_doubts.get_teacher_assigned_subjects, name='teacher-assigned-subjects'),
    path('teacher-doubts/', views_doubts.get_teacher_doubts, name='teacher-doubts-list'),
    path('teacher-doubts/<int:doubt_id>/reply/', views_doubts.reply_to_doubt, name='reply-to-doubt'),
    
    
    # Notifications
    path('notifications/', TeacherNotificationsView.as_view(), name='teacher-notifications'),
    path('notifications/mark-all-read/', TeacherMarkAllReadView.as_view(), name='teacher-mark-all-read'),
    path('notifications/<int:notification_id>/mark-read/', TeacherMarkNotificationReadView.as_view(), name='teacher-mark-read'),
]























