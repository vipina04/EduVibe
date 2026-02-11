# teachers/urls.py
"""
Teacher Module URL Configuration - CLEANED & CONSOLIDATED
EduVibe Platform - 2026
✅ Removed duplicates
✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
✅ Added new test-related endpoints
"""
from . import views
from django.urls import path
from .views import (
    # Core & Utility
    TeacherHomeView,
    TeacherClassesListView,
    TeacherSubjectsListView,
    TeacherClassSubjectsView,  # NEW - Get subjects for a specific class
    TeacherSubjectClassesView,
    TeacherSearchView,
    ClassStudentsView,
    TeacherClassStudentsView,
    AttendanceMarkView,  
    
    # Curriculum
    TeacherChaptersView,
    MarkChapterCompleteView,
    
    # Test Management

    TestListView,
    TestCreateView,
    TestDetailView,
    TestResultsView,
    get_all_teacher_tests,  # ✅ NEW - Function-based view for all tests
    get_test_results,  # ✅ NEW - Function-based view for test results
    
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
)

app_name = 'teachers'

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  CORE & NAVIGATION
    # ═══════════════════════════════════════════════════════════
    path('home/', TeacherHomeView.as_view(), name='home'),
    path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
    path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
    path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),  # NEW
    path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
    path('search/', TeacherSearchView.as_view(), name='teacher-search'),
    path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
    # Students
     path('assigned-classes/', views.get_assigned_classes, name='assigned_classes'),
    # ═══════════════════════════════════════════════════════════
    #  CHAPTERS & CURRICULUM
    # ═══════════════════════════════════════════════════════════
    path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
    path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    path('class/<int:class_id>/subject/<int:subject_id>/chapters/',TeacherChaptersView.as_view(),name='class-subject-chapters'),
    # ═══════════════════════════════════════════════════════════
    #  TEST & QUESTION MANAGEMENT
    # ═══════════════════════════════════════════════════════════
    path('tests/', TestListView.as_view(), name='test-list'),
    path('tests/create/', TestCreateView.as_view(), name='test-create'),
    path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
    path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
    # ✅ NEW: Get all tests created by teacher (for TeacherAllTests.jsx)
    path('tests/all/', get_all_teacher_tests, name='get_all_teacher_tests'),
    
    # ✅ NEW: Get results for specific test (for TestResults.jsx)
    path('tests/<int:test_id>/results-detail/', get_test_results, name='get_test_results'),
    path('questions/create/', QuestionCreateView.as_view(), name='question-create-simple'),
    path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
    path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
    path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    path('questions/create/', views.create_question, name='create_question'),
    # ═══════════════════════════════════════════════════════════
    #  ATTENDANCE
    # ═══════════════════════════════════════════════════════════
     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
    path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='teacher-class-subjects'),
    path('class/<int:class_id>/students/', TeacherClassStudentsView.as_view(), name='teacher-class-students'),
    
    # Attendance marking
    path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),

    path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
    path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
    path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),

    # ═══════════════════════════════════════════════════════════
    #  ASSIGNMENTS
    # ═══════════════════════════════════════════════════════════
    path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
    path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
    path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),

    # ═══════════════════════════════════════════════════════════
    #  DOUBTS
    # ═══════════════════════════════════════════════════════════
    path('doubts/', DoubtListView.as_view(), name='doubt-list'),
    path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
    path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
]























# # teachers/urls.py
# """
# Teacher Module URL Configuration - CLEANED & CONSOLIDATED
# EduVibe Platform - 2026
# ✅ Removed duplicates
# ✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
# """

# from django.urls import path
# from .views import (
#     # Core & Utility
#     TeacherHomeView,
#     TeacherClassesListView,
#     TeacherSubjectsListView,
#     TeacherClassSubjectsView,  # NEW - Get subjects for a specific class
#     TeacherSubjectClassesView,
#     TeacherSearchView,
#     ClassStudentsView,
    
#     # Curriculum
#     TeacherChaptersView,
#     MarkChapterCompleteView,
    
#     # Test Management
#     TestListView,
#     TestCreateView,
#     TestDetailView,
#     TestResultsView,
    
#     # Question Management
#     QuestionCreateView,
#     QuestionUpdateView,
#     QuestionDeleteView,
    
#     # Attendance
#     AttendanceMarkView,
#     AttendanceListView,
#     StudentAttendanceHistoryView,
    
#     # Assignments
#     AssignmentCreateView,
#     AssignmentListView,
#     AssignmentDetailView,
    
#     # Doubts
#     DoubtListView,
#     DoubtDetailView,
#     DoubtReplyCreateView,
# )

# app_name = 'teachers'

# urlpatterns = [
#     # ═══════════════════════════════════════════════════════════
#     #  CORE & NAVIGATION
#     # ═══════════════════════════════════════════════════════════
#     path('home/', TeacherHomeView.as_view(), name='home'),
#     path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
#     path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
#     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),  # NEW
#     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
#     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
#     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),

#     # ═══════════════════════════════════════════════════════════
#     #  CHAPTERS & CURRICULUM
#     # ═══════════════════════════════════════════════════════════
#     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
#     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),

#     # ═══════════════════════════════════════════════════════════
#     #  TEST & QUESTION MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('tests/', TestListView.as_view(), name='test-list'),
#     path('tests/create/', TestCreateView.as_view(), name='test-create'),
#     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
#     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
#     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
#     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
#     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),

#     # ═══════════════════════════════════════════════════════════
#     #  ATTENDANCE
#     # ═══════════════════════════════════════════════════════════
#     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
#     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
#     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),

#     # ═══════════════════════════════════════════════════════════
#     #  ASSIGNMENTS
#     # ═══════════════════════════════════════════════════════════
#     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
#     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
#     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),

#     # ═══════════════════════════════════════════════════════════
#     #  DOUBTS
#     # ═══════════════════════════════════════════════════════════
#     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
#     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
#     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),

#      path('some/path/', views.some_view),
#     path('tests/all/', views.get_all_teacher_tests, name='get_all_teacher_tests'),




#     path('tests/all/', views.get_all_teacher_tests, name='get_all_teacher_tests'),
# ]





















# # # teachers/urls.py - COMPLETE WITH ALL ENDPOINTS
# # """
# # Teacher Module URL Configuration - ALL ENDPOINTS INCLUDED
# # EduVibe Platform - 2026
# # ✅ Includes /classes/ and /subjects/ for dropdowns
# # ✅ All existing endpoints preserved
# # """

# # from django.urls import path
# # from .views import (
# #     # 🆕 NEW: Utility endpoints for dropdowns
# #     TeacherClassesListView,
# #     TeacherSubjectsListView,
    
# #     # Home & Navigation
# #     TeacherHomeView,
# #     TeacherSubjectClassesView,
# #     TeacherChaptersView,
# #     MarkChapterCompleteView,
    
# #     # Test Management
# #     TestListView,
# #     TestCreateView,
# #     TestDetailView,
# #     TestResultsView,
    
# #     # Question Management
# #     QuestionCreateView,
# #     QuestionUpdateView,
# #     QuestionDeleteView,
    
# #     # Attendance
# #     AttendanceMarkView,
# #     AttendanceListView,
# #     StudentAttendanceHistoryView,
    
# #     # Assignments
# #     AssignmentCreateView,
# #     AssignmentListView,
# #     AssignmentDetailView,
    
# #     # Doubts
# #     DoubtListView,
# #     DoubtDetailView,
# #     DoubtReplyCreateView,
    
# #     # Utility
# #     TeacherSearchView,
# #     ClassStudentsView,
# # )

# # app_name = 'teachers'






# # from .views import TeacherClassesListView, TeacherSubjectsListView



# # urlpatterns = [


# #     # ============================================
# # # ADD THESE ROUTES TO: teachers/urls.py
# # # ============================================

# # # Import the new views at the top:
# # from .views import (
# #     # ... existing imports ...
# #     TeacherClassesListView,      # 🆕 NEW
# #     TeacherSubjectsListView,     # 🆕 NEW
# #     DoubtListView,               # Should already exist, enhanced
# #     DoubtReplyCreateView,        # Should already exist
# # )

# # # Add these URL patterns to your urlpatterns list:
# # urlpatterns = [
# #     # ... existing routes ...
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  🆕 NEW ROUTES FOR TEACHER DOUBTS FEATURE
# #     # ═══════════════════════════════════════════════════════════
    
# #     # Get teacher's assigned classes (for dropdown)
# #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
    
# #     # Get teacher's subjects (optionally filtered by class_id)
# #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
    
# #     # Get doubts (with optional class_id and subject_id filters)
# #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
    
# #     # Reply to a doubt
# #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
# # ]


# # # ============================================
# # # COMPLETE EXAMPLE OF teachers/urls.py
# # # ============================================

# # """
# # teachers/urls.py - Complete example showing where to place new routes
# # """

# # from django.urls import path
# # from .views import (
# #     # Home & Navigation
# #     TeacherHomeView,
    
# #     # 🆕 NEW: Classes & Subjects for dropdowns
# #     TeacherClassesListView,
# #     TeacherSubjectsListView,
    
# #     # Chapters
# #     TeacherChaptersView,
# #     MarkChapterCompleteView,
    
# #     # Tests
# #     TestListView,
# #     TestCreateView,
# #     TestDetailView,
# #     TestResultsView,
    
# #     # Questions
# #     QuestionCreateView,
# #     QuestionUpdateView,
# #     QuestionDeleteView,
    
# #     # Attendance
# #     AttendanceMarkView,
# #     AttendanceListView,
# #     StudentAttendanceHistoryView,
    
# #     # Assignments
# #     AssignmentCreateView,
# #     AssignmentListView,
# #     AssignmentDetailView,
    
# #     # 🆕 ENHANCED: Doubts with filtering
# #     DoubtListView,
# #     DoubtDetailView,
# #     DoubtReplyCreateView,
    
# #     # Utility
# #     TeacherSearchView,
# #     ClassStudentsView,
# # )

# # app_name = 'teachers'

# # urlpatterns = [
# #     # Home
# #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
    
# #     # 🆕 NEW: Classes & Subjects
# #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
    
# #     # Chapters
# #     path('chapters/', TeacherChaptersView.as_view(), name='chapters'),
# #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# #     # Tests
# #     path('tests/', TestListView.as_view(), name='test-list'),
# #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# #     # Questions
# #     path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
# #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# #     # Attendance
# #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# #     path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
# #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# #     # Assignments
# #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# #     # 🆕 ENHANCED: Doubts with class/subject filtering
# #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
# #     # Utility
# #     path('search/', TeacherSearchView.as_view(), name='search'),
# #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # ]


# #      path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
# #     # ═══════════════════════════════════════════════════════════
# #     #  🆕 NEW: UTILITY ENDPOINTS FOR DROPDOWNS
# #     # ═══════════════════════════════════════════════════════════
# #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes-list'),
# #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects-list'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  HOME & NAVIGATION
# #     # ═══════════════════════════════════════════════════════════
# #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
# #     path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# #     path('chapters/', TeacherChaptersView.as_view(), name='chapters'),
# #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  TEST MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('tests/', TestListView.as_view(), name='test-list'),
# #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  QUESTION MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
# #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  ATTENDANCE MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# #     path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
# #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  ASSIGNMENT MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  DOUBT MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  UTILITY & SEARCH
# #     # ═══════════════════════════════════════════════════════════
# #     path('search/', TeacherSearchView.as_view(), name='search'),
# #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # ]





























# # # # teachers/urls.py
# # # """
# # # Teacher Module URL Configuration
# # # EduVibe Platform - 2026
# # # """

# # # from django.urls import path
# # # from .views import (
# # #     # Home & Navigation
# # #     TeacherHomeView,
# # #     TeacherSubjectClassesView,
# # #     TeacherChaptersView,
# # #     MarkChapterCompleteView,
    
# # #     # Test Management
# # #     TestListView,
# # #     TestCreateView,
# # #     TestDetailView,
# # #     TestResultsView,
    
# # #     # Question Management
# # #     QuestionCreateView,
# # #     QuestionUpdateView,
# # #     QuestionDeleteView,
    
# # #     # Attendance
# # #     AttendanceMarkView,
# # #     AttendanceListView,
# # #     StudentAttendanceHistoryView,
    
# # #     # Assignments
# # #     AssignmentCreateView,
# # #     AssignmentListView,
# # #     AssignmentDetailView,
    
# # #     # Doubts
# # #     DoubtListView,
# # #     DoubtDetailView,
# # #     DoubtReplyCreateView,
    
# # #     # Utility
# # #     TeacherSearchView,
# # #     ClassStudentsView,
# # # )

# # # app_name = 'teachers'

# # # urlpatterns = [
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  HOME & NAVIGATION
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
# # #     path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # #     path('class/<int:class_id>/subject/<int:subject_id>/chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  TEST MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('chapter/<int:chapter_id>/tests/', TestListView.as_view(), name='test-list'),
# # #     path('chapter/<int:chapter_id>/tests/create/', TestCreateView.as_view(), name='test-create'),
# # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  QUESTION MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ATTENDANCE MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('class/<int:class_id>/subject/<int:subject_id>/attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # #     path('class/<int:class_id>/subject/<int:subject_id>/attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ASSIGNMENT MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('class/<int:class_id>/subject/<int:subject_id>/assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # #     path('class/<int:class_id>/subject/<int:subject_id>/assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  DOUBT MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     # path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),


    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  UTILITY & SEARCH
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # ]































# # # teachers/urls.py
# # """
# # Teacher Module URL Configuration - CLEANED & CONSOLIDATED
# # EduVibe Platform - 2026
# # ✅ Removed duplicates
# # ✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
# # """

# # from django.urls import path
# # from .views import (
# #     # Core & Utility
# #     TeacherHomeView,
# #     TeacherClassesListView,
# #     TeacherSubjectsListView,
# #     TeacherClassSubjectsView,  # NEW - Get subjects for a specific class
# #     TeacherSubjectClassesView,
# #     TeacherSearchView,
# #     ClassStudentsView,
    
# #     # Curriculum
# #     TeacherChaptersView,
# #     MarkChapterCompleteView,
    
# #     # Test Management
# #     TestListView,
# #     TestCreateView,
# #     TestDetailView,
# #     TestResultsView,
    
# #     # Question Management
# #     QuestionCreateView,
# #     QuestionUpdateView,
# #     QuestionDeleteView,
    
# #     # Attendance
# #     AttendanceMarkView,
# #     AttendanceListView,
# #     StudentAttendanceHistoryView,
    
# #     # Assignments
# #     AssignmentCreateView,
# #     AssignmentListView,
# #     AssignmentDetailView,
    
# #     # Doubts
# #     DoubtListView,
# #     DoubtDetailView,
# #     DoubtReplyCreateView,
# # )

# # app_name = 'teachers'

# # urlpatterns = [
# #     # ═══════════════════════════════════════════════════════════
# #     #  CORE & NAVIGATION
# #     # ═══════════════════════════════════════════════════════════
# #     path('home/', TeacherHomeView.as_view(), name='home'),
# #     path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
# #     path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
# #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),  # NEW
# #     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# #     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
# #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),

# #     # ═══════════════════════════════════════════════════════════
# #     #  CHAPTERS & CURRICULUM
# #     # ═══════════════════════════════════════════════════════════
# #     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
# #     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),

# #     # ═══════════════════════════════════════════════════════════
# #     #  TEST & QUESTION MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('tests/', TestListView.as_view(), name='test-list'),
# #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),

# #     # ═══════════════════════════════════════════════════════════
# #     #  ATTENDANCE
# #     # ═══════════════════════════════════════════════════════════
# #     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
# #     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
# #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),

# #     # ═══════════════════════════════════════════════════════════
# #     #  ASSIGNMENTS
# #     # ═══════════════════════════════════════════════════════════
# #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),

# #     # ═══════════════════════════════════════════════════════════
# #     #  DOUBTS
# #     # ═══════════════════════════════════════════════════════════
# #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
# # ]















# # # # teachers/urls.py - COMPLETE WITH ALL ENDPOINTS
# # # """
# # # Teacher Module URL Configuration - ALL ENDPOINTS INCLUDED
# # # EduVibe Platform - 2026
# # # ✅ Includes /classes/ and /subjects/ for dropdowns
# # # ✅ All existing endpoints preserved
# # # """

# # # from django.urls import path
# # # from .views import (
# # #     # 🆕 NEW: Utility endpoints for dropdowns
# # #     TeacherClassesListView,
# # #     TeacherSubjectsListView,
    
# # #     # Home & Navigation
# # #     TeacherHomeView,
# # #     TeacherSubjectClassesView,
# # #     TeacherChaptersView,
# # #     MarkChapterCompleteView,
    
# # #     # Test Management
# # #     TestListView,
# # #     TestCreateView,
# # #     TestDetailView,
# # #     TestResultsView,
    
# # #     # Question Management
# # #     QuestionCreateView,
# # #     QuestionUpdateView,
# # #     QuestionDeleteView,
    
# # #     # Attendance
# # #     AttendanceMarkView,
# # #     AttendanceListView,
# # #     StudentAttendanceHistoryView,
    
# # #     # Assignments
# # #     AssignmentCreateView,
# # #     AssignmentListView,
# # #     AssignmentDetailView,
    
# # #     # Doubts
# # #     DoubtListView,
# # #     DoubtDetailView,
# # #     DoubtReplyCreateView,
    
# # #     # Utility
# # #     TeacherSearchView,
# # #     ClassStudentsView,
# # # )

# # # app_name = 'teachers'






# # # from .views import TeacherClassesListView, TeacherSubjectsListView



# # # urlpatterns = [


# # #     # ============================================
# # # # ADD THESE ROUTES TO: teachers/urls.py
# # # # ============================================

# # # # Import the new views at the top:
# # # from .views import (
# # #     # ... existing imports ...
# # #     TeacherClassesListView,      # 🆕 NEW
# # #     TeacherSubjectsListView,     # 🆕 NEW
# # #     DoubtListView,               # Should already exist, enhanced
# # #     DoubtReplyCreateView,        # Should already exist
# # # )

# # # # Add these URL patterns to your urlpatterns list:
# # # urlpatterns = [
# # #     # ... existing routes ...
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  🆕 NEW ROUTES FOR TEACHER DOUBTS FEATURE
# # #     # ═══════════════════════════════════════════════════════════
    
# # #     # Get teacher's assigned classes (for dropdown)
# # #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
    
# # #     # Get teacher's subjects (optionally filtered by class_id)
# # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
    
# # #     # Get doubts (with optional class_id and subject_id filters)
# # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
    
# # #     # Reply to a doubt
# # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
# # # ]


# # # # ============================================
# # # # COMPLETE EXAMPLE OF teachers/urls.py
# # # # ============================================

# # # """
# # # teachers/urls.py - Complete example showing where to place new routes
# # # """

# # # from django.urls import path
# # # from .views import (
# # #     # Home & Navigation
# # #     TeacherHomeView,
    
# # #     # 🆕 NEW: Classes & Subjects for dropdowns
# # #     TeacherClassesListView,
# # #     TeacherSubjectsListView,
    
# # #     # Chapters
# # #     TeacherChaptersView,
# # #     MarkChapterCompleteView,
    
# # #     # Tests
# # #     TestListView,
# # #     TestCreateView,
# # #     TestDetailView,
# # #     TestResultsView,
    
# # #     # Questions
# # #     QuestionCreateView,
# # #     QuestionUpdateView,
# # #     QuestionDeleteView,
    
# # #     # Attendance
# # #     AttendanceMarkView,
# # #     AttendanceListView,
# # #     StudentAttendanceHistoryView,
    
# # #     # Assignments
# # #     AssignmentCreateView,
# # #     AssignmentListView,
# # #     AssignmentDetailView,
    
# # #     # 🆕 ENHANCED: Doubts with filtering
# # #     DoubtListView,
# # #     DoubtDetailView,
# # #     DoubtReplyCreateView,
    
# # #     # Utility
# # #     TeacherSearchView,
# # #     ClassStudentsView,
# # # )

# # # app_name = 'teachers'

# # # urlpatterns = [
# # #     # Home
# # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
    
# # #     # 🆕 NEW: Classes & Subjects
# # #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
    
# # #     # Chapters
# # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # #     # Tests
# # #     path('tests/', TestListView.as_view(), name='test-list'),
# # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # #     # Questions
# # #     path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # #     # Attendance
# # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # #     path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # #     # Assignments
# # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # #     # 🆕 ENHANCED: Doubts with class/subject filtering
# # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
# # #     # Utility
# # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # ]


# # #      path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  🆕 NEW: UTILITY ENDPOINTS FOR DROPDOWNS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes-list'),
# # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects-list'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  HOME & NAVIGATION
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
# # #     path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  TEST MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('tests/', TestListView.as_view(), name='test-list'),
# # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  QUESTION MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ATTENDANCE MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # #     path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ASSIGNMENT MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  DOUBT MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  UTILITY & SEARCH
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # ]





























# # # # # teachers/urls.py
# # # # """
# # # # Teacher Module URL Configuration
# # # # EduVibe Platform - 2026
# # # # """

# # # # from django.urls import path
# # # # from .views import (
# # # #     # Home & Navigation
# # # #     TeacherHomeView,
# # # #     TeacherSubjectClassesView,
# # # #     TeacherChaptersView,
# # # #     MarkChapterCompleteView,
    
# # # #     # Test Management
# # # #     TestListView,
# # # #     TestCreateView,
# # # #     TestDetailView,
# # # #     TestResultsView,
    
# # # #     # Question Management
# # # #     QuestionCreateView,
# # # #     QuestionUpdateView,
# # # #     QuestionDeleteView,
    
# # # #     # Attendance
# # # #     AttendanceMarkView,
# # # #     AttendanceListView,
# # # #     StudentAttendanceHistoryView,
    
# # # #     # Assignments
# # # #     AssignmentCreateView,
# # # #     AssignmentListView,
# # # #     AssignmentDetailView,
    
# # # #     # Doubts
# # # #     DoubtListView,
# # # #     DoubtDetailView,
# # # #     DoubtReplyCreateView,
    
# # # #     # Utility
# # # #     TeacherSearchView,
# # # #     ClassStudentsView,
# # # # )

# # # # app_name = 'teachers'

# # # # urlpatterns = [
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  HOME & NAVIGATION
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
# # # #     path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # # #     path('class/<int:class_id>/subject/<int:subject_id>/chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  TEST MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('chapter/<int:chapter_id>/tests/', TestListView.as_view(), name='test-list'),
# # # #     path('chapter/<int:chapter_id>/tests/create/', TestCreateView.as_view(), name='test-create'),
# # # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  QUESTION MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ATTENDANCE MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('class/<int:class_id>/subject/<int:subject_id>/attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # # #     path('class/<int:class_id>/subject/<int:subject_id>/attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ASSIGNMENT MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('class/<int:class_id>/subject/<int:subject_id>/assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # # #     path('class/<int:class_id>/subject/<int:subject_id>/assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  DOUBT MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     # path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # # path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # # path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),


    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  UTILITY & SEARCH
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # # ]













































# # # # teachers/urls.py
# # # """
# # # Teacher Module URL Configuration - CLEANED & CONSOLIDATED
# # # EduVibe Platform - 2026
# # # ✅ Removed duplicates
# # # ✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
# # # """

# # # from django.urls import path
# # # from .views import (
# # #     # Core & Utility
# # #     TeacherHomeView,
# # #     TeacherClassesListView,
# # #     TeacherSubjectsListView,
# # #     TeacherSubjectClassesView,
# # #     TeacherSearchView,
# # #     ClassStudentsView,
    
# # #     # Curriculum
# # #     TeacherChaptersView,
# # #     MarkChapterCompleteView,
    
# # #     # Test Management
# # #     TestListView,
# # #     TestCreateView,
# # #     TestDetailView,
# # #     TestResultsView,
    
# # #     # Question Management
# # #     QuestionCreateView,
# # #     QuestionUpdateView,
# # #     QuestionDeleteView,
    
# # #     # Attendance
# # #     AttendanceMarkView,
# # #     AttendanceListView,
# # #     StudentAttendanceHistoryView,
    
# # #     # Assignments
# # #     AssignmentCreateView,
# # #     AssignmentListView,
# # #     AssignmentDetailView,
    
# # #     # Doubts
# # #     DoubtListView,
# # #     DoubtDetailView,
# # #     DoubtReplyCreateView,
# # # )

# # # app_name = 'teachers'

# # # urlpatterns = [
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  CORE & NAVIGATION
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('home/', TeacherHomeView.as_view(), name='home'),
# # #     path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
# # #     path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
# # #     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # #     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
# # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),

# # #     # ═══════════════════════════════════════════════════════════
# # #     #  CHAPTERS & CURRICULUM
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
# # #     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),

# # #     # ═══════════════════════════════════════════════════════════
# # #     #  TEST & QUESTION MANAGEMENT
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('tests/', TestListView.as_view(), name='test-list'),
# # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),

# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ATTENDANCE
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
# # #     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
# # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),

# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ASSIGNMENTS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),

# # #     # ═══════════════════════════════════════════════════════════
# # #     #  DOUBTS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
# # # ]















# # # # # teachers/urls.py - COMPLETE WITH ALL ENDPOINTS
# # # # """
# # # # Teacher Module URL Configuration - ALL ENDPOINTS INCLUDED
# # # # EduVibe Platform - 2026
# # # # ✅ Includes /classes/ and /subjects/ for dropdowns
# # # # ✅ All existing endpoints preserved
# # # # """

# # # # from django.urls import path
# # # # from .views import (
# # # #     # 🆕 NEW: Utility endpoints for dropdowns
# # # #     TeacherClassesListView,
# # # #     TeacherSubjectsListView,
    
# # # #     # Home & Navigation
# # # #     TeacherHomeView,
# # # #     TeacherSubjectClassesView,
# # # #     TeacherChaptersView,
# # # #     MarkChapterCompleteView,
    
# # # #     # Test Management
# # # #     TestListView,
# # # #     TestCreateView,
# # # #     TestDetailView,
# # # #     TestResultsView,
    
# # # #     # Question Management
# # # #     QuestionCreateView,
# # # #     QuestionUpdateView,
# # # #     QuestionDeleteView,
    
# # # #     # Attendance
# # # #     AttendanceMarkView,
# # # #     AttendanceListView,
# # # #     StudentAttendanceHistoryView,
    
# # # #     # Assignments
# # # #     AssignmentCreateView,
# # # #     AssignmentListView,
# # # #     AssignmentDetailView,
    
# # # #     # Doubts
# # # #     DoubtListView,
# # # #     DoubtDetailView,
# # # #     DoubtReplyCreateView,
    
# # # #     # Utility
# # # #     TeacherSearchView,
# # # #     ClassStudentsView,
# # # # )

# # # # app_name = 'teachers'






# # # # from .views import TeacherClassesListView, TeacherSubjectsListView



# # # # urlpatterns = [


# # # #     # ============================================
# # # # # ADD THESE ROUTES TO: teachers/urls.py
# # # # # ============================================

# # # # # Import the new views at the top:
# # # # from .views import (
# # # #     # ... existing imports ...
# # # #     TeacherClassesListView,      # 🆕 NEW
# # # #     TeacherSubjectsListView,     # 🆕 NEW
# # # #     DoubtListView,               # Should already exist, enhanced
# # # #     DoubtReplyCreateView,        # Should already exist
# # # # )

# # # # # Add these URL patterns to your urlpatterns list:
# # # # urlpatterns = [
# # # #     # ... existing routes ...
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  🆕 NEW ROUTES FOR TEACHER DOUBTS FEATURE
# # # #     # ═══════════════════════════════════════════════════════════
    
# # # #     # Get teacher's assigned classes (for dropdown)
# # # #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
    
# # # #     # Get teacher's subjects (optionally filtered by class_id)
# # # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
    
# # # #     # Get doubts (with optional class_id and subject_id filters)
# # # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
    
# # # #     # Reply to a doubt
# # # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
# # # # ]


# # # # # ============================================
# # # # # COMPLETE EXAMPLE OF teachers/urls.py
# # # # # ============================================

# # # # """
# # # # teachers/urls.py - Complete example showing where to place new routes
# # # # """

# # # # from django.urls import path
# # # # from .views import (
# # # #     # Home & Navigation
# # # #     TeacherHomeView,
    
# # # #     # 🆕 NEW: Classes & Subjects for dropdowns
# # # #     TeacherClassesListView,
# # # #     TeacherSubjectsListView,
    
# # # #     # Chapters
# # # #     TeacherChaptersView,
# # # #     MarkChapterCompleteView,
    
# # # #     # Tests
# # # #     TestListView,
# # # #     TestCreateView,
# # # #     TestDetailView,
# # # #     TestResultsView,
    
# # # #     # Questions
# # # #     QuestionCreateView,
# # # #     QuestionUpdateView,
# # # #     QuestionDeleteView,
    
# # # #     # Attendance
# # # #     AttendanceMarkView,
# # # #     AttendanceListView,
# # # #     StudentAttendanceHistoryView,
    
# # # #     # Assignments
# # # #     AssignmentCreateView,
# # # #     AssignmentListView,
# # # #     AssignmentDetailView,
    
# # # #     # 🆕 ENHANCED: Doubts with filtering
# # # #     DoubtListView,
# # # #     DoubtDetailView,
# # # #     DoubtReplyCreateView,
    
# # # #     # Utility
# # # #     TeacherSearchView,
# # # #     ClassStudentsView,
# # # # )

# # # # app_name = 'teachers'

# # # # urlpatterns = [
# # # #     # Home
# # # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
    
# # # #     # 🆕 NEW: Classes & Subjects
# # # #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# # # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
    
# # # #     # Chapters
# # # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # # #     # Tests
# # # #     path('tests/', TestListView.as_view(), name='test-list'),
# # # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # # #     # Questions
# # # #     path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # # #     # Attendance
# # # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # # #     path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # # #     # Assignments
# # # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # # #     # 🆕 ENHANCED: Doubts with class/subject filtering
# # # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
# # # #     # Utility
# # # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # # ]


# # # #      path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# # # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects'),
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  🆕 NEW: UTILITY ENDPOINTS FOR DROPDOWNS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('classes/', TeacherClassesListView.as_view(), name='teacher-classes-list'),
# # # #     path('subjects/', TeacherSubjectsListView.as_view(), name='teacher-subjects-list'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  HOME & NAVIGATION
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
# # # #     path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  TEST MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('tests/', TestListView.as_view(), name='test-list'),
# # # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  QUESTION MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ATTENDANCE MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # # #     path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ASSIGNMENT MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  DOUBT MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  UTILITY & SEARCH
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # # ]





























# # # # # # teachers/urls.py
# # # # # """
# # # # # Teacher Module URL Configuration
# # # # # EduVibe Platform - 2026
# # # # # """

# # # # # from django.urls import path
# # # # # from .views import (
# # # # #     # Home & Navigation
# # # # #     TeacherHomeView,
# # # # #     TeacherSubjectClassesView,
# # # # #     TeacherChaptersView,
# # # # #     MarkChapterCompleteView,
    
# # # # #     # Test Management
# # # # #     TestListView,
# # # # #     TestCreateView,
# # # # #     TestDetailView,
# # # # #     TestResultsView,
    
# # # # #     # Question Management
# # # # #     QuestionCreateView,
# # # # #     QuestionUpdateView,
# # # # #     QuestionDeleteView,
    
# # # # #     # Attendance
# # # # #     AttendanceMarkView,
# # # # #     AttendanceListView,
# # # # #     StudentAttendanceHistoryView,
    
# # # # #     # Assignments
# # # # #     AssignmentCreateView,
# # # # #     AssignmentListView,
# # # # #     AssignmentDetailView,
    
# # # # #     # Doubts
# # # # #     DoubtListView,
# # # # #     DoubtDetailView,
# # # # #     DoubtReplyCreateView,
    
# # # # #     # Utility
# # # # #     TeacherSearchView,
# # # # #     ClassStudentsView,
# # # # # )

# # # # # app_name = 'teachers'

# # # # # urlpatterns = [
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  HOME & NAVIGATION
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('home/', TeacherHomeView.as_view(), name='teacher-home'),
# # # # #     path('subject/<int:subject_id>/classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # # # #     path('class/<int:class_id>/subject/<int:subject_id>/chapters/', TeacherChaptersView.as_view(), name='chapters'),
# # # # #     path('chapters/<int:chapter_id>/mark-complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  TEST MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('chapter/<int:chapter_id>/tests/', TestListView.as_view(), name='test-list'),
# # # # #     path('chapter/<int:chapter_id>/tests/create/', TestCreateView.as_view(), name='test-create'),
# # # # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # # # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  QUESTION MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # # # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # # # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  ATTENDANCE MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('class/<int:class_id>/subject/<int:subject_id>/attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),
# # # # #     path('class/<int:class_id>/subject/<int:subject_id>/attendance/', AttendanceListView.as_view(), name='attendance-list'),
# # # # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  ASSIGNMENT MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('class/<int:class_id>/subject/<int:subject_id>/assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # # # #     path('class/<int:class_id>/subject/<int:subject_id>/assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # # # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  DOUBT MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     # path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # # # path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # # # path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),


    
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  UTILITY & SEARCH
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('search/', TeacherSearchView.as_view(), name='search'),
# # # # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # # # ]