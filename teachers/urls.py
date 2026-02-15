# teachers/urls.py - FIXED VERSION (URL Pattern Corrected)
"""
Teacher Module URL Configuration
EduVibe Platform - 2026
✅ Fixed URL pattern to match frontend expectations
"""

from django.urls import path
from . import views
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
    #  DOUBTS
    # ═══════════════════════════════════════════════════════════
    path('doubts/', DoubtListView.as_view(), name='doubt-list'),
    path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
    path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
]


















# # teachers/urls.py - FIXED VERSION
# """
# Teacher Module URL Configuration
# EduVibe Platform - 2026
# ✅ Fixed import error - removed TeacherClassStudentsView
# ✅ All endpoints working
# """

# from django.urls import path
# from . import views
# from .views import (
#     # Core & Utility
#     TeacherHomeView,
#     TeacherClassesListView,
#     TeacherSubjectsListView,
#     TeacherClassSubjectsView,
#     TeacherSubjectClassesView,
#     TeacherSearchView,
#     ClassStudentsView,  # ✅ FIXED - was TeacherClassStudentsView
    
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
#     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),
#     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
#     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
    
#     # Students - ✅ FIXED - using ClassStudentsView
#     path('classes/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
#     path('assigned-classes/', views.get_assigned_classes, name='assigned-classes'),
    
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
    
#     # NEW: Function-based views for tests
#     path('tests/all/', views.get_all_teacher_tests, name='get-all-teacher-tests'),
#     path('tests/<int:test_id>/results-detailed/', views.get_test_results, name='get-test-results-detailed'),
    
#     # Questions
#     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
#     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
#     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
#     # NEW: Function-based views for questions and tests
#     path('create-test/', views.create_test, name='create-test'),
#     path('create-question/', views.create_question, name='create-question'),
    
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
# ]

















# # # teachers/urls.py
# # """
# # Teacher Module URL Configuration - CLEANED & CONSOLIDATED
# # EduVibe Platform - 2026
# # ✅ Removed duplicates
# # ✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
# # ✅ Added new test-related endpoints
# # """
# # from . import views
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
# #     TeacherClassStudentsView,
# #     AttendanceMarkView,  
    
# #     # Curriculum
# #     TeacherChaptersView,
# #     MarkChapterCompleteView,
    
# #     # Test Management

# #     TestListView,
# #     TestCreateView,
# #     TestDetailView,
# #     TestResultsView,
# #     get_all_teacher_tests,  # ✅ NEW - Function-based view for all tests
# #     get_test_results,  # ✅ NEW - Function-based view for test results
    
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
# #     # Students
# #      path('assigned-classes/', views.get_assigned_classes, name='assigned_classes'),
# #     # ═══════════════════════════════════════════════════════════
# #     #  CHAPTERS & CURRICULUM
# #     # ═══════════════════════════════════════════════════════════
# #     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
# #     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
# #     path('class/<int:class_id>/subject/<int:subject_id>/chapters/',TeacherChaptersView.as_view(),name='class-subject-chapters'),
# #     # ═══════════════════════════════════════════════════════════
# #     #  TEST & QUESTION MANAGEMENT
# #     # ═══════════════════════════════════════════════════════════
# #     path('tests/', TestListView.as_view(), name='test-list'),
# #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# #     # ✅ NEW: Get all tests created by teacher (for TeacherAllTests.jsx)
# #     path('tests/all/', get_all_teacher_tests, name='get_all_teacher_tests'),
    
# #     # ✅ NEW: Get results for specific test (for TestResults.jsx)
# #     path('tests/<int:test_id>/results-detail/', get_test_results, name='get_test_results'),
# #     path('questions/create/', QuestionCreateView.as_view(), name='question-create-simple'),
# #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
# #     path('questions/create/', views.create_question, name='create_question'),
# #     # ═══════════════════════════════════════════════════════════
# #     #  ATTENDANCE
# #     # ═══════════════════════════════════════════════════════════
# #      path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='teacher-class-subjects'),
# #     path('class/<int:class_id>/students/', TeacherClassStudentsView.as_view(), name='teacher-class-students'),
    
# #     # Attendance marking
# #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),

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
# # #     TeacherClassSubjectsView,  # NEW - Get subjects for a specific class
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
# # #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),  # NEW
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

# # #      path('some/path/', views.some_view),
# # #     path('tests/all/', views.get_all_teacher_tests, name='get_all_teacher_tests'),




























# # teachers/urls.py - FIXED VERSION
# """
# Teacher Module URL Configuration
# EduVibe Platform - 2026
# ✅ Fixed: Removed duplicate create-question path
# ✅ Fixed: Removed undefined CreateQuestionView
# """

# from django.urls import path
# from . import views
# from .views import (
#     # Core & Utility
#     TeacherHomeView,
#     TeacherClassesListView,
#     TeacherSubjectsListView,
#     TeacherClassSubjectsView,
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
#     TeacherAttendanceHistoryView,
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
#     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),
#     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
#     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
    
#     # Students
#     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
#     path('assigned-classes/', views.get_assigned_classes, name='assigned-classes'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  CHAPTERS & CURRICULUM
#     # ═══════════════════════════════════════════════════════════
#     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
#     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
#     path('class/<int:class_id>/subject/<int:subject_id>/chapters/', TeacherChaptersView.as_view(), name='teacher-chapters'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  TEST & QUESTION MANAGEMENT
#     # ═══════════════════════════════════════════════════════════
#     path('tests/', TestListView.as_view(), name='test-list'),
#     path('tests/create/', TestCreateView.as_view(), name='test-create'),
#     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
#     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
#     # Function-based views for tests
#     path('tests/all/', views.get_all_teacher_tests, name='get-all-teacher-tests'),
#     path('tests/<int:test_id>/results-detailed/', views.get_test_results, name='get-test-results-detailed'),
#     path('create-test/', views.create_test, name='create-test'),
    
#     # Questions - Class-based views
#     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
#     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
#     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
#     # Questions - Function-based view (for frontend)
#     path('create-question/', views.create_question, name='create-question'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  ATTENDANCE
#     # ═══════════════════════════════════════════════════════════
#     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
#     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
#     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
#     path('attendance/history/', TeacherAttendanceHistoryView.as_view(), name='attendance-history'),

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
# ]


























# # # teachers/urls.py - FIXED VERSION (URL Pattern Corrected)
# # """
# # Teacher Module URL Configuration
# # EduVibe Platform - 2026
# # ✅ Fixed URL pattern to match frontend expectations
# # """

# # from django.urls import path
# # from . import views
# # from .views import (
# #     # Core & Utility
# #     TeacherHomeView,
# #     TeacherClassesListView,
# #     TeacherSubjectsListView,
# #     TeacherClassSubjectsView,
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
# #     TeacherAttendanceHistoryView,
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
# #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),
# #     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# #     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
    
# #     # Students - ✅ FIXED - changed "classes" to "class" to match frontend
# #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# #     path('assigned-classes/', views.get_assigned_classes, name='assigned-classes'),
    
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
    
# #     # NEW: Function-based views for tests
# #     path('tests/all/', views.get_all_teacher_tests, name='get-all-teacher-tests'),
# #     path('tests/<int:test_id>/results-detailed/', views.get_test_results, name='get-test-results-detailed'),
    
# #     # Questions
# #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# #     # NEW: Function-based views for questions and tests
# #     path('class/<int:class_id>/subject/<int:subject_id>/chapters/', views.TeacherChaptersView.as_view(), name='teacher-chapters'),
# #     path('create-test/', views.create_test, name='create-test'),
# #     path('create-question/', views.create_question, name='create-question'),
# #     path('create-question/', CreateQuestionView.as_view(), name='create-question'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  ATTENDANCE
# #     # ═══════════════════════════════════════════════════════════
# #     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
# #     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
# #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),
# #     path('attendance/history/', TeacherAttendanceHistoryView.as_view(), name='attendance-history'),

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


















# # # # teachers/urls.py - FIXED VERSION
# # # """
# # # Teacher Module URL Configuration
# # # EduVibe Platform - 2026
# # # ✅ Fixed import error - removed TeacherClassStudentsView
# # # ✅ All endpoints working
# # # """

# # # from django.urls import path
# # # from . import views
# # # from .views import (
# # #     # Core & Utility
# # #     TeacherHomeView,
# # #     TeacherClassesListView,
# # #     TeacherSubjectsListView,
# # #     TeacherClassSubjectsView,
# # #     TeacherSubjectClassesView,
# # #     TeacherSearchView,
# # #     ClassStudentsView,  # ✅ FIXED - was TeacherClassStudentsView
    
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
# # #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),
# # #     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # #     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
    
# # #     # Students - ✅ FIXED - using ClassStudentsView
# # #     path('classes/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # #     path('assigned-classes/', views.get_assigned_classes, name='assigned-classes'),
    
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
    
# # #     # NEW: Function-based views for tests
# # #     path('tests/all/', views.get_all_teacher_tests, name='get-all-teacher-tests'),
# # #     path('tests/<int:test_id>/results-detailed/', views.get_test_results, name='get-test-results-detailed'),
    
# # #     # Questions
# # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
    
# # #     # NEW: Function-based views for questions and tests
# # #     path('create-test/', views.create_test, name='create-test'),
# # #     path('create-question/', views.create_question, name='create-question'),
    
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

















# # # # # teachers/urls.py
# # # # """
# # # # Teacher Module URL Configuration - CLEANED & CONSOLIDATED
# # # # EduVibe Platform - 2026
# # # # ✅ Removed duplicates
# # # # ✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
# # # # ✅ Added new test-related endpoints
# # # # """
# # # # from . import views
# # # # from django.urls import path
# # # # from .views import (
# # # #     # Core & Utility
# # # #     TeacherHomeView,
# # # #     TeacherClassesListView,
# # # #     TeacherSubjectsListView,
# # # #     TeacherClassSubjectsView,  # NEW - Get subjects for a specific class
# # # #     TeacherSubjectClassesView,
# # # #     TeacherSearchView,
# # # #     ClassStudentsView,
# # # #     TeacherClassStudentsView,
# # # #     AttendanceMarkView,  
    
# # # #     # Curriculum
# # # #     TeacherChaptersView,
# # # #     MarkChapterCompleteView,
    
# # # #     # Test Management

# # # #     TestListView,
# # # #     TestCreateView,
# # # #     TestDetailView,
# # # #     TestResultsView,
# # # #     get_all_teacher_tests,  # ✅ NEW - Function-based view for all tests
# # # #     get_test_results,  # ✅ NEW - Function-based view for test results
    
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
# # # # )

# # # # app_name = 'teachers'

# # # # urlpatterns = [
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  CORE & NAVIGATION
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('home/', TeacherHomeView.as_view(), name='home'),
# # # #     path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
# # # #     path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
# # # #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),  # NEW
# # # #     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # # #     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
# # # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),
# # # #     # Students
# # # #      path('assigned-classes/', views.get_assigned_classes, name='assigned_classes'),
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  CHAPTERS & CURRICULUM
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
# # # #     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),
# # # #     path('class/<int:class_id>/subject/<int:subject_id>/chapters/',TeacherChaptersView.as_view(),name='class-subject-chapters'),
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  TEST & QUESTION MANAGEMENT
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('tests/', TestListView.as_view(), name='test-list'),
# # # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # # #     # ✅ NEW: Get all tests created by teacher (for TeacherAllTests.jsx)
# # # #     path('tests/all/', get_all_teacher_tests, name='get_all_teacher_tests'),
    
# # # #     # ✅ NEW: Get results for specific test (for TestResults.jsx)
# # # #     path('tests/<int:test_id>/results-detail/', get_test_results, name='get_test_results'),
# # # #     path('questions/create/', QuestionCreateView.as_view(), name='question-create-simple'),
# # # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),
# # # #     path('questions/create/', views.create_question, name='create_question'),
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ATTENDANCE
# # # #     # ═══════════════════════════════════════════════════════════
# # # #      path('classes/', TeacherClassesListView.as_view(), name='teacher-classes'),
# # # #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='teacher-class-subjects'),
# # # #     path('class/<int:class_id>/students/', TeacherClassStudentsView.as_view(), name='teacher-class-students'),
    
# # # #     # Attendance marking
# # # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='mark-attendance'),

# # # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
# # # #     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
# # # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),

# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ASSIGNMENTS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),

# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  DOUBTS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),
# # # # ]























# # # # # # teachers/urls.py
# # # # # """
# # # # # Teacher Module URL Configuration - CLEANED & CONSOLIDATED
# # # # # EduVibe Platform - 2026
# # # # # ✅ Removed duplicates
# # # # # ✅ All endpoints included (Home, Tests, Questions, Attendance, Assignments, Doubts)
# # # # # """

# # # # # from django.urls import path
# # # # # from .views import (
# # # # #     # Core & Utility
# # # # #     TeacherHomeView,
# # # # #     TeacherClassesListView,
# # # # #     TeacherSubjectsListView,
# # # # #     TeacherClassSubjectsView,  # NEW - Get subjects for a specific class
# # # # #     TeacherSubjectClassesView,
# # # # #     TeacherSearchView,
# # # # #     ClassStudentsView,
    
# # # # #     # Curriculum
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
# # # # # )

# # # # # app_name = 'teachers'

# # # # # urlpatterns = [
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  CORE & NAVIGATION
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('home/', TeacherHomeView.as_view(), name='home'),
# # # # #     path('classes/', TeacherClassesListView.as_view(), name='classes-list'),
# # # # #     path('subjects/', TeacherSubjectsListView.as_view(), name='subjects-list'),
# # # # #     path('class/<int:class_id>/subjects/', TeacherClassSubjectsView.as_view(), name='class-subjects'),  # NEW
# # # # #     path('subject-classes/', TeacherSubjectClassesView.as_view(), name='subject-classes'),
# # # # #     path('search/', TeacherSearchView.as_view(), name='teacher-search'),
# # # # #     path('class/<int:class_id>/students/', ClassStudentsView.as_view(), name='class-students'),

# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  CHAPTERS & CURRICULUM
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('chapters/', TeacherChaptersView.as_view(), name='chapters-list'),
# # # # #     path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark-chapter-complete'),

# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  TEST & QUESTION MANAGEMENT
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('tests/', TestListView.as_view(), name='test-list'),
# # # # #     path('tests/create/', TestCreateView.as_view(), name='test-create'),
# # # # #     path('tests/<int:test_id>/', TestDetailView.as_view(), name='test-detail'),
# # # # #     path('tests/<int:test_id>/results/', TestResultsView.as_view(), name='test-results'),
    
# # # # #     path('tests/<int:test_id>/questions/create/', QuestionCreateView.as_view(), name='question-create'),
# # # # #     path('questions/<int:question_id>/update/', QuestionUpdateView.as_view(), name='question-update'),
# # # # #     path('questions/<int:question_id>/delete/', QuestionDeleteView.as_view(), name='question-delete'),

# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  ATTENDANCE
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('attendance/mark/', AttendanceMarkView.as_view(), name='attendance-mark'),
# # # # #     path('attendance/list/', AttendanceListView.as_view(), name='attendance-list'),
# # # # #     path('students/<int:student_id>/attendance/', StudentAttendanceHistoryView.as_view(), name='student-attendance-history'),

# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  ASSIGNMENTS
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
# # # # #     path('assignments/create/', AssignmentCreateView.as_view(), name='assignment-create'),
# # # # #     path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),

# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     #  DOUBTS
# # # # #     # ═══════════════════════════════════════════════════════════
# # # # #     path('doubts/', DoubtListView.as_view(), name='doubt-list'),
# # # # #     path('doubts/<int:doubt_id>/', DoubtDetailView.as_view(), name='doubt-detail'),
# # # # #     path('doubts/<int:doubt_id>/reply/', DoubtReplyCreateView.as_view(), name='doubt-reply'),

# # # # #      path('some/path/', views.some_view),
# # # # #     path('tests/all/', views.get_all_teacher_tests, name='get_all_teacher_tests'),




# # # # #     path('tests/all/', views.get_all_teacher_tests, name='get_all_teacher_tests'),
# # # # # ]




















