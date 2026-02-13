# students/urls.py
"""
Student Module URL Configuration
EduVibe Platform - 2026
COMPLETE WORKING VERSION
"""

from django.urls import path
from .views import (
    # Home & Navigation
    StudentHomeView,
    SubjectDetailView,
    ChapterTestsView,
    
    # Test Taking
    TestStartView,
    TestSubmitView,
    TestResultView,
    MyTestAttemptsView,
    
    # Attendance & Fees
    MyAttendanceView,
    MyFeePaymentsView,
    
    # Assignments
    MyAssignmentsView,
    
    # Doubts
    DoubtCreateView,
    EnrolledSubjectsView,
    
    # Notifications
    MyNotificationsView,
    
    # Search
    StudentSearchView,
    DiagnosticView,
)

# Import doubt views from separate file
from .views_doubts import StudentDoubtListView, StudentDoubtReplyView

app_name = 'students'

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  HOME & NAVIGATION
    # ═══════════════════════════════════════════════════════════
    path('home/', StudentHomeView.as_view(), name='student-home'),
    path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
    path('chapters/<int:chapter_id>/tests/', ChapterTestsView.as_view(), name='chapter-tests'),
    
    # ═══════════════════════════════════════════════════════════
    #  TEST TAKING
    # ═══════════════════════════════════════════════════════════
    path('tests/<int:test_id>/start/', TestStartView.as_view(), name='test-start'),
    path('test-attempts/<int:attempt_id>/submit/', TestSubmitView.as_view(), name='test-submit'),
    path('test-attempts/<int:attempt_id>/result/', TestResultView.as_view(), name='test-result'),
    path('my-test-attempts/', MyTestAttemptsView.as_view(), name='my-test-attempts'),
    
    # ═══════════════════════════════════════════════════════════
    #  ATTENDANCE & FEES
    # ═══════════════════════════════════════════════════════════
    path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
    path('my-fee-payments/', MyFeePaymentsView.as_view(), name='my-fee-payments'),
    
    # ═══════════════════════════════════════════════════════════
    #  ASSIGNMENTS
    # ═══════════════════════════════════════════════════════════
    path('my-assignments/', MyAssignmentsView.as_view(), name='my-assignments'),
    
    # ═══════════════════════════════════════════════════════════
    #  DOUBTS
    # ═══════════════════════════════════════════════════════════
    path('subjects/', EnrolledSubjectsView.as_view(), name='enrolled-subjects'),
    path('doubts/create/', DoubtCreateView.as_view(), name='doubt-create'),
    path('doubts/', StudentDoubtListView.as_view(), name='doubt-list'),
    path('doubts/<int:doubt_id>/reply/', StudentDoubtReplyView.as_view(), name='doubt-reply'),
    
    # ═══════════════════════════════════════════════════════════
    #  NOTIFICATIONS
    # ═══════════════════════════════════════════════════════════
    path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    
    # ═══════════════════════════════════════════════════════════
    #  SEARCH
    # ═══════════════════════════════════════════════════════════
    path('search/', StudentSearchView.as_view(), name='search'),
    path('diagnostic/', DiagnosticView.as_view(), name='diagnostic'),
]


































# # students/urls.py
# """
# Student Module URL Configuration
# EduVibe Platform - 2026
# *** FIXED - Removed non-existent views_doubts import ***
# """

# from django.urls import path
# from .views import (
#     # Home & Navigation
#     StudentHomeView,
#     SubjectDetailView,
#     ChapterTestsView,
    
#     # Test Taking
#     TestStartView,
#     TestSubmitView,
#     TestResultView,
#     MyTestAttemptsView,
    
#     # Attendance & Fees
#     MyAttendanceView,
#     MyFeePaymentsView,
    
#     # Assignments
#     MyAssignmentsView,
    
#     # Doubts
#     DoubtCreateView,
#     EnrolledSubjectsView,
    
#     # Notifications
#     MyNotificationsView,
    
#     # Search
#     StudentSearchView,
# )

# app_name = 'students'

# urlpatterns = [
#     # ═══════════════════════════════════════════════════════════
#     #  HOME & NAVIGATION
#     # ═══════════════════════════════════════════════════════════
#     path('home/', StudentHomeView.as_view(), name='student-home'),
#     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
#     path('chapters/<int:chapter_id>/tests/', ChapterTestsView.as_view(), name='chapter-tests'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  TEST TAKING
#     # ═══════════════════════════════════════════════════════════
#     path('tests/<int:test_id>/start/', TestStartView.as_view(), name='test-start'),
#     path('test-attempts/<int:attempt_id>/submit/', TestSubmitView.as_view(), name='test-submit'),
#     path('test-attempts/<int:attempt_id>/result/', TestResultView.as_view(), name='test-result'),
#     path('my-test-attempts/', MyTestAttemptsView.as_view(), name='my-test-attempts'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  ATTENDANCE & FEES
#     # ═══════════════════════════════════════════════════════════
#     path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
#     path('my-fee-payments/', MyFeePaymentsView.as_view(), name='my-fee-payments'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  ASSIGNMENTS
#     # ═══════════════════════════════════════════════════════════
#     path('my-assignments/', MyAssignmentsView.as_view(), name='my-assignments'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  DOUBTS
#     # ═══════════════════════════════════════════════════════════
#     path('subjects/', EnrolledSubjectsView.as_view(), name='enrolled-subjects'),
#     path('doubts/create/', DoubtCreateView.as_view(), name='doubt-create'),
#     # NOTE: Doubt list and reply views removed temporarily - will add back when views_doubts.py is created
    
#     # ═══════════════════════════════════════════════════════════
#     #  NOTIFICATIONS
#     # ═══════════════════════════════════════════════════════════
#     path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    
#     # ═══════════════════════════════════════════════════════════
#     #  SEARCH
#     # ═══════════════════════════════════════════════════════════
#     path('search/', StudentSearchView.as_view(), name='search'),
# ]





















# # # students/urls.py
# # """
# # Student Module URL Configuration
# # EduVibe Platform - 2026
# # *** FIXED VERSION - ALL IMPORTS CORRECTED ***
# # """

# # from django.urls import path
# # from .views import (
# #     # Home & Navigation
# #     StudentHomeView,
# #     SubjectDetailView,
# #     ChapterTestsView,
    
# #     # Test Taking
# #     TestStartView,
# #     TestSubmitView,
# #     TestResultView,
# #     MyTestAttemptsView,
    
# #     # Attendance & Fees
# #     MyAttendanceView,
# #     MyFeePaymentsView,
    
# #     # Assignments
# #     MyAssignmentsView,
    
# #     # Doubts
# #     DoubtCreateView,
# #     EnrolledSubjectsView,
    
# #     # Notifications
# #     MyNotificationsView,
    
# #     # Search
# #     StudentSearchView,
# # )

# # app_name = 'students'

# # urlpatterns = [
# #     # ═══════════════════════════════════════════════════════════
# #     #  HOME & NAVIGATION
# #     # ═══════════════════════════════════════════════════════════
# #     path('home/', StudentHomeView.as_view(), name='student-home'),
# #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
# #     path('chapters/<int:chapter_id>/tests/', ChapterTestsView.as_view(), name='chapter-tests'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  TEST TAKING
# #     # ═══════════════════════════════════════════════════════════
# #     path('tests/<int:test_id>/start/', TestStartView.as_view(), name='test-start'),
# #     path('test-attempts/<int:attempt_id>/submit/', TestSubmitView.as_view(), name='test-submit'),
# #     path('test-attempts/<int:attempt_id>/result/', TestResultView.as_view(), name='test-result'),
# #     path('my-test-attempts/', MyTestAttemptsView.as_view(), name='my-test-attempts'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  ATTENDANCE & FEES
# #     # ═══════════════════════════════════════════════════════════
# #     path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
# #     path('my-fee-payments/', MyFeePaymentsView.as_view(), name='my-fee-payments'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  ASSIGNMENTS
# #     # ═══════════════════════════════════════════════════════════
# #     path('my-assignments/', MyAssignmentsView.as_view(), name='my-assignments'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  DOUBTS
# #     # ═══════════════════════════════════════════════════════════
# #     path('subjects/', EnrolledSubjectsView.as_view(), name='enrolled-subjects'),
# #     path('doubts/create/', DoubtCreateView.as_view(), name='doubt-create'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  NOTIFICATIONS
# #     # ═══════════════════════════════════════════════════════════
# #     path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  SEARCH
# #     # ═══════════════════════════════════════════════════════════
# #     path('search/', StudentSearchView.as_view(), name='search'),
# # ]













# # # # students/urls.py
# # # """
# # # Student Module URL Configuration
# # # EduVibe Platform - 2026

# # # """


# # # from .views_doubts import StudentDoubtListView, StudentDoubtReplyView
# # # from django.urls import path
# # # from .views import (
# # #     # Home & Navigation
# # #     StudentHomeView,
# # #     SubjectDetailView,
# # #     ChapterTestsView,
    
# # #     # Test Taking
# # #     TestStartView,
# # #     TestSubmitView,
# # #     TestResultView,
# # #     MyTestAttemptsView,
    
# # #     # Attendance & Fees
# # #     MyAttendanceView,
# # #     MyFeePaymentsView,
    
# # #     # Assignments
# # #     MyAssignmentsView,
    
# # #     # Doubts
# # #     DoubtCreateView,
# # #     EnrolledSubjectsView,
    
# # #     # Notifications
# # #     MyNotificationsView,
    
# # #     # Search
# # #     StudentSearchView,
# # # )

# # # app_name = 'students'

# # # urlpatterns = [
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  HOME & NAVIGATION
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('home/', StudentHomeView.as_view(), name='student-home'),
# # #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
# # #     path('chapters/<int:chapter_id>/tests/', ChapterTestsView.as_view(), name='chapter-tests'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  TEST TAKING
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('tests/<int:test_id>/start/', TestStartView.as_view(), name='test-start'),
# # #     path('test-attempts/<int:attempt_id>/submit/', TestSubmitView.as_view(), name='test-submit'),
# # #     path('test-attempts/<int:attempt_id>/result/', TestResultView.as_view(), name='test-result'),
# # #     path('my-test-attempts/', MyTestAttemptsView.as_view(), name='my-test-attempts'),
# # #     path('enrolled-subjects/', EnrolledSubjectsView.as_view(), name='enrolled-subjects'),
# # #     path('subjects/<int:subject_id>/tests/', SubjectTestsView.as_view(), name='subject-tests'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ATTENDANCE & FEES
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
# # #     path('my-fee-payments/', MyFeePaymentsView.as_view(), name='my-fee-payments'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  ASSIGNMENTS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('my-assignments/', MyAssignmentsView.as_view(), name='my-assignments'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  DOUBTS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('subjects/', EnrolledSubjectsView.as_view(), name='enrolled-subjects'),
# # #     path('doubts/create/', DoubtCreateView.as_view(), name='doubt-create'),
# # #     path('doubts/', StudentDoubtListView.as_view(), name='doubt-list'),
# # #     path('doubts/<int:doubt_id>/reply/', StudentDoubtReplyView.as_view(), name='doubt-reply'),
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  NOTIFICATIONS
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    
# # #     # ═══════════════════════════════════════════════════════════
# # #     #  SEARCH
# # #     # ═══════════════════════════════════════════════════════════
# # #     path('search/', StudentSearchView.as_view(), name='search'),
# # # ]
























# # # # # students/urls.py
# # # # """
# # # # Student Module URL Configuration
# # # # EduVibe Platform - 2026
# # # # """
# # # # from .views_doubts import StudentDoubtListView, StudentDoubtReplyView
# # # # from django.urls import path
# # # # from .views import (
# # # #     # Home & Navigation
# # # #     StudentHomeView,
# # # #     SubjectDetailView,
# # # #     ChapterTestsView,
    
# # # #     # Test Taking
# # # #     TestStartView,
# # # #     TestSubmitView,
# # # #     TestResultView,
# # # #     MyTestAttemptsView,
    
# # # #     # Attendance & Fees
# # # #     MyAttendanceView,
# # # #     MyFeePaymentsView,
    
# # # #     # Assignments
# # # #     MyAssignmentsView,
    
# # # #     # Doubts
# # # #     DoubtCreateView,
    
# # # #     # Notifications
# # # #     MyNotificationsView,
    
# # # #     # Search
# # # #     StudentSearchView,
# # # # )

# # # # app_name = 'students'

# # # # urlpatterns = [
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  HOME & NAVIGATION
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('home/', StudentHomeView.as_view(), name='student-home'),
# # # #     path('subjects/<int:subject_id>/', SubjectDetailView.as_view(), name='subject-detail'),
# # # #     path('chapters/<int:chapter_id>/tests/', ChapterTestsView.as_view(), name='chapter-tests'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  TEST TAKING
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('tests/<int:test_id>/start/', TestStartView.as_view(), name='test-start'),
# # # #     path('test-attempts/<int:attempt_id>/submit/', TestSubmitView.as_view(), name='test-submit'),
# # # #     path('test-attempts/<int:attempt_id>/result/', TestResultView.as_view(), name='test-result'),
# # # #     path('my-test-attempts/', MyTestAttemptsView.as_view(), name='my-test-attempts'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ATTENDANCE & FEES
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('my-attendance/', MyAttendanceView.as_view(), name='my-attendance'),
# # # #     path('my-fee-payments/', MyFeePaymentsView.as_view(), name='my-fee-payments'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  ASSIGNMENTS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('my-assignments/', MyAssignmentsView.as_view(), name='my-assignments'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  DOUBTS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('doubts/create/', DoubtCreateView.as_view(), name='doubt-create'),
# # # #     path('doubts/', StudentDoubtListView.as_view(), name='doubt-list'),
# # # #     path('doubts/<int:doubt_id>/reply/', StudentDoubtReplyView.as_view(), name='doubt-reply'),
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  NOTIFICATIONS
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('my-notifications/', MyNotificationsView.as_view(), name='my-notifications'),
    
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     #  SEARCH
# # # #     # ═══════════════════════════════════════════════════════════
# # # #     path('search/', StudentSearchView.as_view(), name='search'),
# # # # ]