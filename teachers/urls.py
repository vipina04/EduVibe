# teachers/urls.py
"""
Teacher Module URL Configuration
EduVibe Platform - 2026
"""

from django.urls import path
from .views import (
    # Home & Navigation
    TeacherHomeView,
    TeacherSubjectClassesView,
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
    
    # Utility
    TeacherSearchView,
    ClassStudentsView,
)

app_name = 'teachers'

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  HOME & NAVIGATION
    # ═══════════════════════════════════════════════════════════
    path('home/', TeacherHomeView.as_view(), name='teacher-home'),
    path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
    path('class/<int:class_id>/subject/<int:subject_id>/chapters/', TeacherChaptersView.as_view(), name='chapters'),
    path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
    # ═══════════════════════════════════════════════════════════
    #  TEST MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('chapter/<int:chapter_id>/tests/', TestListView.as_view(), name='test-list'),
    path('chapter/<int:chapter_id>/tests/create/', TestCreateView.as_view(), name='test-create'),
    path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
    path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
    # ═══════════════════════════════════════════════════════════
    #  QUESTION MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
    path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
    # ═══════════════════════════════════════════════════════════
    #  ATTENDANCE MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('class/<int:class_id>/subject/<int:subject_id>/attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
    path('class/<int:class_id>/subject/<int:subject_id>/attendance/', AttendanceListView.as_view(), name='attendance-list'),
    path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
    # ═══════════════════════════════════════════════════════════
    #  ASSIGNMENT MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('class/<int:class_id>/subject/<int:subject_id>/assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
    path('class/<int:class_id>/subject/<int:subject_id>/assignments/', AssignmentListView.as_view(), name='assignment-list'),
    path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
    # ═══════════════════════════════════════════════════════════
    #  DOUBT MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('class/<int:class_id>/subject/<int:subject_id>/doubts/', DoubtListView.as_view(), name='doubt-list'),
    path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
    path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
    # ═══════════════════════════════════════════════════════════
    #  UTILITY & SEARCH
    # ═══════════════════════════════════════════════════════════
    path('search/', TeacherSearchView.as_view(), name='search'),
    path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
]