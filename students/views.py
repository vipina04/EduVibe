# students/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
import traceback

from users.models import CustomUser
from admin_tasks.models import FeePayment, Notification
from academics.models import AcademicClass as Class, Subject, ClassSubject, Chapter
from teachers.models import (
    Test, Question, Attendance, Assignment, Doubt, DoubtReply, TeacherAssignment
)
from .models import TestAttempt, StudentAnswer, AssignmentSubmission

# ===========================================================
#  CUSTOM PERMISSION
# ===========================================================

class IsStudentRole(IsAuthenticated):
    """Only allow students"""

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'student'
        )

# ===========================================================
#  STUDENT HOME / DASHBOARD
# ===========================================================

class StudentDashboardView(APIView):
    """
    Student Dashboard/Home - Returns overview data
    GET /api/students/home/ or /api/students/dashboard/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user

            if student.role != 'student':
                return Response(
                    {'error': 'Only students can access this endpoint'},
                    status=403
                )

            student_class = student.class_assigned

            if not student_class:
                return Response({
                    'message': 'No class assigned yet. Please contact admin.',
                    'stats': {
                        'total_subjects': 0,
                        'tests_taken': 0,
                        'average_score': 0,
                        'attendance_percentage': 0,
                    },
                    'subjects': [],
                    'recent_tests': [],
                    'upcoming_tests': [],
                }, status=200)

            # Get subjects via ClassSubject bridge
            class_subjects = ClassSubject.objects.filter(
                academic_class=student_class
            ).select_related('subject')

            # Test statistics
            test_attempts = TestAttempt.objects.filter(student=student)
            total_tests_taken = test_attempts.count()

            avg_score = 0
            if total_tests_taken > 0:
                total_score = sum(attempt.score for attempt in test_attempts)
                total_max = sum(attempt.test.marks for attempt in test_attempts)
                if total_max > 0:
                    avg_score = round((total_score / total_max) * 100, 2)

            # Attendance statistics
            attendance_records = Attendance.objects.filter(
                student=student,
                class_subject__academic_class=student_class
            )
            total_attendance = attendance_records.count()
            present_count = attendance_records.filter(is_present=True).count()
            attendance_percentage = round(
                (present_count / total_attendance * 100), 2
            ) if total_attendance > 0 else 0

            # Build subjects data
            subjects_data = []
            for cs in class_subjects:
                test_count = Test.objects.filter(chapter__class_subject=cs).count()
                attempts = TestAttempt.objects.filter(
                    student=student,
                    test__chapter__class_subject=cs
                ).count()
                chapters_count = Chapter.objects.filter(class_subject=cs).count()
                completed_chapters = Chapter.objects.filter(
                    class_subject=cs, is_completed=True
                ).count()

                subjects_data.append({
                    'id': cs.subject.id,
                    'name': cs.subject.name,
                    'description': cs.subject.description or '',
                    'test_count': test_count,
                    'attempts': attempts,
                    'chapters_count': chapters_count,
                    'completed_chapters': completed_chapters,
                    'class_subject_id': cs.id,
                })

            # Recent test attempts (last 5)
            recent_attempts = TestAttempt.objects.filter(
                student=student
            ).select_related(
                'test__chapter__class_subject__subject'
            ).order_by('-attempted_at')[:5]

            recent_tests_data = []
            for attempt in recent_attempts:
                cs = attempt.test.chapter.class_subject if attempt.test.chapter else None
                recent_tests_data.append({
                    'test_id': attempt.test.id,
                    'test_name': attempt.test.name,
                    'subject': cs.subject.name if cs else '',
                    'chapter': attempt.test.chapter.name if attempt.test.chapter else '',
                    'score': attempt.score,
                    'total_marks': attempt.test.marks,
                    'percentage': round(
                        (attempt.score / attempt.test.marks) * 100, 2
                    ) if attempt.test.marks > 0 else 0,
                    'attempted_at': attempt.attempted_at
                })

            # Upcoming tests (not yet attempted)
            attempted_test_ids = test_attempts.values_list('test_id', flat=True)
            upcoming_tests = Test.objects.filter(
                chapter__class_subject__academic_class=student_class
            ).exclude(id__in=attempted_test_ids).select_related(
                'chapter__class_subject__subject'
            )[:5]

            upcoming_tests_data = []
            for test in upcoming_tests:
                cs = test.chapter.class_subject if test.chapter else None
                upcoming_tests_data.append({
                    'id': test.id,
                    'name': test.name,
                    'subject': cs.subject.name if cs else '',
                    'chapter': test.chapter.name if test.chapter else '',
                    'marks': test.marks,
                    'duration_minutes': test.duration_minutes,
                    'type': test.type,
                })

            return Response({
                'user': {
                    'name': student.get_full_name() or student.username,
                    'email': student.email,
                    'unique_id': student.unique_id,
                    'class': student_class.name,
                },
                'stats': {
                    'total_subjects': class_subjects.count(),
                    'tests_taken': total_tests_taken,
                    'average_score': avg_score,
                    'attendance_percentage': attendance_percentage,
                    'total_classes': total_attendance,
                    'present_days': present_count,
                },
                'subjects': subjects_data,
                'recent_tests': recent_tests_data,
                'upcoming_tests': upcoming_tests_data,
            }, status=200)

        except Exception as e:
            print(f"Error in StudentDashboardView: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'Failed to load dashboard',
                'detail': str(e)
            }, status=500)


# Alias for backward compatibility
StudentHomeView = StudentDashboardView

# ===========================================================
#  SUBJECTS
# ===========================================================

class EnrolledSubjectsView(APIView):
    """Get subjects enrolled for student's class"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        try:
            student = request.user
            print(f"\n{'='*60}")
            print(f"[EnrolledSubjectsView] User: {student.username}")
            print(f"[EnrolledSubjectsView] Class: {student.class_assigned}")

            if not student.class_assigned:
                print("[EnrolledSubjectsView] No class assigned")
                return Response([], status=status.HTTP_200_OK)

            class_subjects = ClassSubject.objects.filter(
                academic_class=student.class_assigned
            ).select_related('subject')

            print(f"[EnrolledSubjectsView] Found {class_subjects.count()} subjects")

            if not class_subjects.exists():
                return Response([], status=status.HTTP_200_OK)

            subjects_data = []
            for cs in class_subjects:
                chapters = Chapter.objects.filter(class_subject=cs)
                chapters_count = chapters.count()

                tests = Test.objects.filter(chapter__class_subject=cs)
                total_tests = tests.count()

                attempts = TestAttempt.objects.filter(
                    student=student,
                    test__chapter__class_subject=cs
                )
                attempted_tests = attempts.count()

                avg_score = 0.0
                if attempts.exists():
                    total_score = sum(a.score for a in attempts)
                    total_marks = sum(a.test.marks for a in attempts)
                    if total_marks > 0:
                        avg_score = round((total_score / total_marks * 100), 2)

                subjects_data.append({
                    'id': cs.subject.id,
                    'name': cs.subject.name,
                    'class_subject_id': cs.id,
                    'total_tests': total_tests,
                    'attempted_tests': attempted_tests,
                    'pending_tests': total_tests - attempted_tests,
                    'average_score': avg_score,
                    'chapters_count': chapters_count
                })

            print(f"[EnrolledSubjectsView] Returning {len(subjects_data)} subjects")
            return Response(subjects_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"[EnrolledSubjectsView] EXCEPTION: {str(e)}")
            print(traceback.format_exc())
            return Response([], status=status.HTTP_200_OK)


class StudentSubjectsView(APIView):
    """
    Get all subjects for student's class with statistics
    GET /api/students/subjects/
    """
    permission_classes = [IsStudentRole]

    def get(self, request):
        try:
            student = request.user

            if not student.class_assigned:
                return Response({
                    'message': 'No class assigned. Please contact administrator.',
                    'class': None,
                    'subjects': []
                }, status=status.HTTP_200_OK)

            student_class = student.class_assigned
            class_subjects = ClassSubject.objects.filter(
                academic_class=student_class
            ).select_related('subject')

            if not class_subjects.exists():
                return Response({
                    'message': 'No subjects available for your class yet.',
                    'class': student_class.name,
                    'subjects': []
                }, status=status.HTTP_200_OK)

            subjects_data = []
            for cs in class_subjects:
                chapter_count = Chapter.objects.filter(class_subject=cs).count()
                completed_chapters = Chapter.objects.filter(
                    class_subject=cs, is_completed=True
                ).count()
                test_count = Test.objects.filter(chapter__class_subject=cs).count()
                attempt_count = TestAttempt.objects.filter(
                    student=student,
                    test__chapter__class_subject=cs
                ).count()

                attempts = TestAttempt.objects.filter(
                    student=student,
                    test__chapter__class_subject=cs
                )
                avg_score = 0
                if attempts.exists():
                    total_score = sum(a.score for a in attempts)
                    total_marks_sum = sum(a.test.marks for a in attempts)
                    if total_marks_sum > 0:
                        avg_score = round((total_score / total_marks_sum) * 100, 2)

                subjects_data.append({
                    'id': cs.subject.id,
                    'name': cs.subject.name,
                    'description': cs.subject.description or '',
                    'class_subject_id': cs.id,
                    'chapter_count': chapter_count,
                    'completed_chapters': completed_chapters,
                    'test_count': test_count,
                    'attempt_count': attempt_count,
                    'average_score': avg_score
                })

            return Response({
                'class': {
                    'id': student_class.id,
                    'name': student_class.name
                },
                'subjects': subjects_data,
                'total_subjects': len(subjects_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to fetch subjects',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SubjectDetailView(APIView):
    """Get subject details with chapters"""
    permission_classes = [IsStudentRole]

    def get(self, request, subject_id):
        student = request.user

        if not student.class_assigned:
            return Response(
                {'error': 'No class assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cs = ClassSubject.objects.select_related('subject', 'academic_class').get(
                subject_id=subject_id,
                academic_class=student.class_assigned
            )
        except ClassSubject.DoesNotExist:
            return Response(
                {'error': 'Subject not in your class.'},
                status=status.HTTP_403_FORBIDDEN
            )

        chapters = Chapter.objects.filter(class_subject=cs)

        chapters_data = []
        for chapter in chapters:
            tests = Test.objects.filter(chapter=chapter)
            attempted_tests = TestAttempt.objects.filter(
                student=student,
                test__chapter=chapter
            ).values_list('test_id', flat=True)

            chapters_data.append({
                'id': chapter.id,
                'name': chapter.name,
                'is_completed': chapter.is_completed,
                'total_tests': tests.count(),
                'attempted_tests': len(attempted_tests),
                'pending_tests': tests.exclude(id__in=attempted_tests).count()
            })

        return Response({
            'subject': {
                'id': cs.subject.id,
                'name': cs.subject.name
            },
            'class': {
                'id': student.class_assigned.id,
                'name': student.class_assigned.name
            },
            'chapters': chapters_data
        })


class StudentSubjectChaptersView(APIView):
    """
    Get all chapters for a specific subject in student's class
    GET /api/students/subjects/<subject_id>/chapters/
    """
    permission_classes = [IsStudentRole]

    def get(self, request, subject_id):
        try:
            student = request.user

            if not student.class_assigned:
                return Response(
                    {'error': 'No class assigned to you'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                cs = ClassSubject.objects.select_related(
                    'subject', 'academic_class'
                ).get(
                    subject_id=subject_id,
                    academic_class=student.class_assigned
                )
            except ClassSubject.DoesNotExist:
                return Response(
                    {'error': 'This subject is not assigned to your class'},
                    status=status.HTTP_403_FORBIDDEN
                )

            chapters = Chapter.objects.filter(class_subject=cs).order_by('name')

            if not chapters.exists():
                return Response({
                    'message': 'No chapters available for this subject yet.',
                    'subject': {'id': cs.subject.id, 'name': cs.subject.name},
                    'chapters': []
                }, status=status.HTTP_200_OK)

            chapters_data = []
            for chapter in chapters:
                tests = Test.objects.filter(chapter=chapter)
                attempts = TestAttempt.objects.filter(
                    student=student,
                    test__chapter=chapter
                )

                test_list = []
                for test in tests:
                    student_attempt = attempts.filter(test=test).first()
                    test_list.append({
                        'id': test.id,
                        'name': test.name,
                        'marks': test.marks,
                        'duration_minutes': test.duration_minutes,
                        'type': test.type,
                        'attempted': student_attempt is not None,
                        'score': student_attempt.score if student_attempt else None,
                        'percentage': round(
                            (student_attempt.score / test.marks) * 100, 2
                        ) if student_attempt and test.marks > 0 else None
                    })

                chapters_data.append({
                    'id': chapter.id,
                    'name': chapter.name,
                    'is_completed': chapter.is_completed,
                    'test_count': tests.count(),
                    'tests': test_list,
                    'attempts_count': attempts.count()
                })

            return Response({
                'subject': {
                    'id': cs.subject.id,
                    'name': cs.subject.name,
                    'description': cs.subject.description or ''
                },
                'class': {
                    'id': student.class_assigned.id,
                    'name': student.class_assigned.name
                },
                'chapters': chapters_data,
                'total_chapters': len(chapters_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to fetch chapters',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChapterTestsView(APIView):
    """Get all tests for a chapter"""
    permission_classes = [IsStudentRole]

    def get(self, request, chapter_id):
        student = request.user

        try:
            chapter = Chapter.objects.select_related(
                'class_subject__subject',
                'class_subject__academic_class'
            ).get(id=chapter_id)

            if chapter.class_subject.academic_class != student.class_assigned:
                return Response(
                    {'error': 'Not authorized.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            tests = Test.objects.filter(chapter=chapter)

            tests_data = []
            for test in tests:
                attempt = TestAttempt.objects.filter(
                    student=student, test=test
                ).first()

                test_data = {
                    'id': test.id,
                    'name': test.name,
                    'type': test.type,
                    'type_display': test.get_type_display(),
                    'marks': test.marks,
                    'duration_minutes': test.duration_minutes,
                    'questions_count': Question.objects.filter(test=test).count(),
                    'attempted': bool(attempt)
                }

                if attempt:
                    test_data['score'] = attempt.score
                    test_data['percentage'] = round(
                        (attempt.score / test.marks) * 100, 2
                    ) if test.marks > 0 else 0
                    test_data['attempted_at'] = attempt.attempted_at

                tests_data.append(test_data)

            return Response({
                'chapter': {
                    'id': chapter.id,
                    'name': chapter.name,
                    'subject': chapter.class_subject.subject.name
                },
                'tests': tests_data
            })

        except Chapter.DoesNotExist:
            return Response(
                {'error': 'Chapter not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SubjectTestsView(APIView):
    """Get all tests for a specific subject"""
    permission_classes = [IsStudentRole]

    def get(self, request, subject_id):
        try:
            student = request.user
            student_class = student.class_assigned

            if not student_class:
                return Response(
                    {'error': 'You are not enrolled in any class.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            try:
                cs = ClassSubject.objects.get(
                    subject_id=subject_id,
                    academic_class=student_class
                )
            except ClassSubject.DoesNotExist:
                return Response(
                    {'error': 'Subject not found for your class.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            tests = Test.objects.filter(
                chapter__class_subject=cs
            ).select_related('chapter').order_by('-created_at')

            tests_data = []
            for test in tests:
                attempt = TestAttempt.objects.filter(
                    student=student, test=test
                ).first()

                tests_data.append({
                    'id': test.id,
                    'name': test.name,
                    'type': test.type,
                    'type_code': test.type,
                    'marks': test.marks,
                    'duration_minutes': test.duration_minutes,
                    'chapter_name': test.chapter.name,
                    'created_at': test.created_at,
                    'attempted': attempt is not None,
                    'score': attempt.score if attempt else None,
                    'percentage': round(
                        (attempt.score / test.marks) * 100, 2
                    ) if attempt and test.marks > 0 else None,
                    'attempt_id': attempt.id if attempt else None
                })

            return Response({
                'subject_name': cs.subject.name,
                'total_tests': len(tests_data),
                'tests': tests_data
            })

        except Exception as e:
            print(f"ERROR in SubjectTestsView: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentSubjectTestsView(APIView):
    """
    Get all available tests for a subject
    GET /api/students/subjects/<subject_id>/tests/
    """
    permission_classes = [IsStudentRole]

    def get(self, request, subject_id):
        try:
            student = request.user

            if not student.class_assigned:
                return Response(
                    {'error': 'No class assigned'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                cs = ClassSubject.objects.get(
                    subject_id=subject_id,
                    academic_class=student.class_assigned
                )
            except ClassSubject.DoesNotExist:
                return Response(
                    {'error': 'Subject not found for your class'},
                    status=status.HTTP_404_NOT_FOUND
                )

            tests = Test.objects.filter(
                chapter__class_subject=cs
            ).select_related('chapter').order_by('-created_at')

            tests_data = []
            for test in tests:
                attempt = TestAttempt.objects.filter(
                    student=student, test=test
                ).first()

                tests_data.append({
                    'id': test.id,
                    'name': test.name,
                    'chapter': {
                        'id': test.chapter.id,
                        'name': test.chapter.name
                    },
                    'marks': test.marks,
                    'duration_minutes': test.duration_minutes,
                    'question_count': Question.objects.filter(test=test).count(),
                    'attempted': attempt is not None,
                    'score': attempt.score if attempt else None,
                    'attempted_at': attempt.attempted_at if attempt else None
                })

            return Response({
                'tests': tests_data,
                'total_tests': len(tests_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'Failed to fetch tests',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===========================================================
#  TEST TAKING
# ===========================================================

class TestStartView(APIView):
    """Start a test (get questions)"""
    permission_classes = [IsStudentRole]

    def get(self, request, test_id):
        student = request.user

        try:
            test = Test.objects.select_related(
                'chapter__class_subject__subject',
                'chapter__class_subject__academic_class'
            ).get(id=test_id)

            if test.chapter.class_subject.academic_class != student.class_assigned:
                return Response(
                    {'error': 'Not authorized.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if TestAttempt.objects.filter(student=student, test=test).exists():
                return Response(
                    {'error': 'You have already attempted this test.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            questions = Question.objects.filter(test=test)

            questions_data = []
            for q in questions:
                q_data = {
                    'id': q.id,
                    'question_text': q.question_text,
                    'question_image': request.build_absolute_uri(
                        q.question_image.url
                    ) if q.question_image else None
                }
                if test.type == 'mcq':
                    q_data.update({
                        'option1': q.option1,
                        'option2': q.option2,
                        'option3': q.option3,
                        'option4': q.option4
                    })
                questions_data.append(q_data)

            return Response({
                'test': {
                    'id': test.id,
                    'name': test.name,
                    'type': test.type,
                    'type_display': test.get_type_display(),
                    'marks': test.marks,
                    'duration_minutes': test.duration_minutes,
                    'chapter': test.chapter.name,
                    'subject': test.chapter.class_subject.subject.name
                },
                'questions': questions_data,
                'total_questions': len(questions_data)
            })

        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class TestSubmitView(APIView):
    """Submit test answers"""
    permission_classes = [IsStudentRole]

    def post(self, request, test_id):
        student = request.user
        answers = request.data.get('answers', [])

        try:
            test = Test.objects.select_related(
                'chapter__class_subject__academic_class'
            ).get(id=test_id)

            if test.chapter.class_subject.academic_class != student.class_assigned:
                return Response(
                    {'error': 'Not authorized.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if TestAttempt.objects.filter(student=student, test=test).exists():
                return Response(
                    {'error': 'Already attempted.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            test_attempt = TestAttempt.objects.create(
                student=student,
                test=test,
                score=0
            )

            score = 0
            for answer_data in answers:
                question_id = answer_data.get('question_id')
                selected_option = answer_data.get('selected_option')
                answer_text = answer_data.get('answer_text', '')

                try:
                    question = Question.objects.get(id=question_id, test=test)
                    is_correct = False

                    if test.type == 'mcq' and selected_option:
                        if int(selected_option) == question.correct_option:
                            is_correct = True
                            score += 1

                    StudentAnswer.objects.create(
                        student=student,
                        question=question,
                        attempt=test_attempt,
                        selected_option=selected_option if test.type == 'mcq' else None,
                        descriptive_answer=answer_text if test.type == 'descriptive' else ''
                    )

                except Question.DoesNotExist:
                    continue

            test_attempt.score = score
            test_attempt.save()

            return Response({
                'message': 'Test submitted successfully!',
                'score': score,
                'max_marks': test.marks,
                'percentage': round((score / test.marks) * 100, 2) if test.marks > 0 else 0,
                'attempt_id': test_attempt.id
            }, status=status.HTTP_201_CREATED)

        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class TestResultView(APIView):
    """View test result with solutions"""
    permission_classes = [IsStudentRole]

    def get(self, request, attempt_id):
        student = request.user

        try:
            attempt = TestAttempt.objects.select_related(
                'test__chapter__class_subject__subject'
            ).get(id=attempt_id, student=student)

            answers = StudentAnswer.objects.filter(
                student=student,
                question__test=attempt.test
            ).select_related('question')

            results_data = []
            for answer in answers:
                question = answer.question
                result = {
                    'question_id': question.id,
                    'question_text': question.question_text,
                    'question_image': request.build_absolute_uri(
                        question.question_image.url
                    ) if question.question_image else None
                }

                if attempt.test.type == 'mcq':
                    result.update({
                        'option1': question.option1,
                        'option2': question.option2,
                        'option3': question.option3,
                        'option4': question.option4,
                        'selected_option': answer.selected_option,
                        'correct_option': question.correct_option,
                        'is_correct': answer.selected_option == question.correct_option if answer.selected_option else False,
                        'explanation': question.explanation
                    })
                else:
                    result.update({
                        'your_answer': answer.descriptive_answer,
                        'explanation': question.explanation
                    })

                results_data.append(result)

            return Response({
                'test': {
                    'id': attempt.test.id,
                    'name': attempt.test.name,
                    'type': attempt.test.get_type_display(),
                    'marks': attempt.test.marks,
                    'chapter': attempt.test.chapter.name,
                    'subject': attempt.test.chapter.class_subject.subject.name
                },
                'score': attempt.score,
                'max_marks': attempt.test.marks,
                'percentage': round(
                    (attempt.score / attempt.test.marks) * 100, 2
                ) if attempt.test.marks > 0 else 0,
                'attempted_at': attempt.attempted_at,
                'results': results_data
            })

        except TestAttempt.DoesNotExist:
            return Response(
                {'error': 'Test attempt not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class MyTestAttemptsView(APIView):
    """Get all test attempts by student"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        student = request.user

        attempts = TestAttempt.objects.filter(
            student=student
        ).select_related(
            'test__chapter__class_subject__subject',
            'test__chapter__class_subject__academic_class'
        ).order_by('-attempted_at')

        attempts_data = []
        for a in attempts:
            cs = a.test.chapter.class_subject if a.test.chapter else None
            attempts_data.append({
                'id': a.id,
                'test': {
                    'id': a.test.id,
                    'name': a.test.name,
                    'type': a.test.get_type_display(),
                    'marks': a.test.marks,
                    'chapter': a.test.chapter.name if a.test.chapter else '',
                    'subject': cs.subject.name if cs else ''
                },
                'score': a.score,
                'percentage': round(
                    (a.score / a.test.marks) * 100, 2
                ) if a.test.marks > 0 else 0,
                'attempted_at': a.attempted_at
            })

        return Response(attempts_data)

# ===========================================================
#  ATTENDANCE
# ===========================================================

class MyAttendanceView(APIView):
    """Get student's attendance records"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        student = request.user
        subject_id = request.GET.get('subject_id')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        attendance_records = Attendance.objects.filter(
            student=student
        ).select_related(
            'teacher',
            'class_subject__academic_class',
            'class_subject__subject'
        ).order_by('-date', '-from_time')

        if subject_id:
            attendance_records = attendance_records.filter(
                class_subject__subject_id=subject_id
            )
        if start_date:
            attendance_records = attendance_records.filter(date__gte=start_date)
        if end_date:
            attendance_records = attendance_records.filter(date__lte=end_date)

        # Per-subject breakdown
        subjects_data = []
        if student.class_assigned:
            class_subjects = ClassSubject.objects.filter(
                academic_class=student.class_assigned
            ).select_related('subject')

            for cs in class_subjects:
                subject_attendance = Attendance.objects.filter(
                    student=student, class_subject=cs
                )
                if start_date:
                    subject_attendance = subject_attendance.filter(date__gte=start_date)
                if end_date:
                    subject_attendance = subject_attendance.filter(date__lte=end_date)

                total_classes = subject_attendance.count()
                present_count = subject_attendance.filter(is_present=True).count()
                absent_count = total_classes - present_count
                percentage = (present_count / total_classes * 100) if total_classes > 0 else 0

                subjects_data.append({
                    'id': cs.subject.id,
                    'name': cs.subject.name,
                    'total_classes': total_classes,
                    'present': present_count,
                    'absent': absent_count,
                    'percentage': round(percentage, 2)
                })

        records_data = []
        for record in attendance_records:
            records_data.append({
                'id': record.id,
                'date': str(record.date),
                'from_time': str(record.from_time) if record.from_time else None,
                'to_time': str(record.to_time) if record.to_time else None,
                'duration_minutes': record.duration_minutes,
                'is_present': record.is_present,
                'status': 'Present' if record.is_present else 'Absent',
                'subject': record.class_subject.subject.name if record.class_subject else 'Unknown',
                'teacher_name': record.teacher.get_full_name() or record.teacher.username,
                'class_name': record.class_subject.academic_class.name if record.class_subject else ''
            })

        total_records = len(records_data)
        present_total = sum(1 for r in records_data if r['is_present'])
        absent_total = total_records - present_total
        overall_percentage = (present_total / total_records * 100) if total_records > 0 else 0

        return Response({
            'overall_stats': {
                'total_classes': total_records,
                'present': present_total,
                'absent': absent_total,
                'percentage': round(overall_percentage, 2)
            },
            'subjects': subjects_data,
            'records': records_data
        })


class StudentAttendanceView(APIView):
    """
    Student Attendance View - full stats
    GET /api/students/attendance/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = request.user

            if student.role != 'student':
                return Response(
                    {'error': 'Only students can access this endpoint'},
                    status=403
                )

            subject_id = request.GET.get('subject_id')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')

            attendance_query = Attendance.objects.filter(
                student=student
            ).select_related(
                'class_subject__subject',
                'class_subject__academic_class',
                'teacher'
            )

            if subject_id and subject_id != 'all':
                attendance_query = attendance_query.filter(
                    class_subject__subject_id=subject_id
                )
            if start_date:
                attendance_query = attendance_query.filter(date__gte=start_date)
            if end_date:
                attendance_query = attendance_query.filter(date__lte=end_date)

            # Per-subject stats
            subjects_list = []
            if student.class_assigned:
                class_subjects = ClassSubject.objects.filter(
                    academic_class=student.class_assigned
                ).select_related('subject')

                for cs in class_subjects:
                    subject_attendance = Attendance.objects.filter(
                        student=student, class_subject=cs
                    )
                    if start_date:
                        subject_attendance = subject_attendance.filter(date__gte=start_date)
                    if end_date:
                        subject_attendance = subject_attendance.filter(date__lte=end_date)

                    total_classes = subject_attendance.count()
                    present_count = subject_attendance.filter(is_present=True).count()
                    absent_count = total_classes - present_count
                    percentage = (
                        present_count / total_classes * 100
                    ) if total_classes > 0 else 0

                    subjects_list.append({
                        'id': cs.subject.id,
                        'name': cs.subject.name,
                        'total_classes': total_classes,
                        'present': present_count,
                        'absent': absent_count,
                        'percentage': round(percentage, 2)
                    })

            total_records = attendance_query.count()
            present_records = attendance_query.filter(is_present=True).count()
            absent_records = total_records - present_records
            overall_percentage = (
                present_records / total_records * 100
            ) if total_records > 0 else 0

            records = []
            for record in attendance_query.order_by('-date')[:50]:
                records.append({
                    'id': record.id,
                    'date': record.date.isoformat(),
                    'subject': record.class_subject.subject.name if record.class_subject else 'N/A',
                    'teacher_name': record.teacher.get_full_name() or record.teacher.username,
                    'from_time': str(record.from_time) if record.from_time else None,
                    'to_time': str(record.to_time) if record.to_time else None,
                    'duration_minutes': record.duration_minutes,
                    'is_present': record.is_present,
                })

            return Response({
                'overall_stats': {
                    'total_classes': total_records,
                    'present': present_records,
                    'absent': absent_records,
                    'percentage': round(overall_percentage, 2)
                },
                'subjects': subjects_list,
                'records': records
            }, status=200)

        except Exception as e:
            print(f"Error in StudentAttendanceView: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'Failed to fetch attendance data',
                'details': str(e)
            }, status=500)

# ===========================================================
#  FEE PAYMENTS
# ===========================================================

class MyFeePaymentsView(APIView):
    """Get student's fee payments"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        student = request.user
        payments = FeePayment.objects.filter(student=student).order_by('-paid_at')

        payments_data = [{
            'id': p.id,
            'amount': str(p.amount),
            'paid_at': p.paid_at,
            'receipt_url': request.build_absolute_uri(p.receipt.url) if p.receipt else None
        } for p in payments]

        total_paid = sum(float(p.amount) for p in payments)

        return Response({
            'total_paid': total_paid,
            'payments_count': len(payments_data),
            'payments': payments_data
        })

# ===========================================================
#  ASSIGNMENTS
# ===========================================================

class MyAssignmentsView(APIView):
    """Get assignments for student's class"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        student = request.user
        subject_id = request.GET.get('subject_id')

        if not student.class_assigned:
            return Response([])

        assignments = Assignment.objects.filter(
            chapter__class_subject__academic_class=student.class_assigned
        ).select_related('chapter__class_subject__subject', 'teacher')

        if subject_id:
            assignments = assignments.filter(
                chapter__class_subject__subject_id=subject_id
            )

        assignments_data = [{
            'id': a.id,
            'description': a.description,
            'chapter': a.chapter.name,
            'subject': a.chapter.class_subject.subject.name,
            'teacher': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
            'file_url': request.build_absolute_uri(a.file.url) if a.file else None
        } for a in assignments]

        return Response(assignments_data)

# ===========================================================
#  DOUBTS
# ===========================================================

class DoubtCreateView(APIView):
    """Post a doubt"""
    permission_classes = [IsStudentRole]

    def post(self, request):
        student = request.user
        subject_id = request.data.get('subject_id')
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')

        if not text and not image:
            return Response(
                {'error': 'Provide text or image.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not student.class_assigned:
            return Response(
                {'error': 'No class assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            cs = ClassSubject.objects.get(
                subject_id=subject_id,
                academic_class=student.class_assigned
            )
        except ClassSubject.DoesNotExist:
            return Response(
                {'error': 'Subject not in your class.'},
                status=status.HTTP_403_FORBIDDEN
            )

        doubt = Doubt.objects.create(
            student=student,
            class_subject=cs,
            doubt_text=text,
            doubt_image=image
        )

        return Response({
            'message': 'Doubt posted successfully!',
            'doubt': {
                'id': doubt.id,
                'subject': cs.subject.name,
                'text': text,
                'created_at': doubt.created_at
            }
        }, status=status.HTTP_201_CREATED)

# ===========================================================
#  NOTIFICATIONS
# ===========================================================

class MyNotificationsView(APIView):
    """Get student's notifications"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')

        return Response([{
            'id': n.id,
            'message': n.message,
            'created_at': n.created_at
        } for n in notifications])

# ===========================================================
#  SEARCH
# ===========================================================

class StudentSearchView(APIView):
    """Enhanced search for student content"""
    permission_classes = [IsStudentRole]

    def get(self, request):
        student = request.user
        query = request.GET.get('q', '').strip()

        if not query or len(query) < 2:
            return Response(
                {'error': 'Search query must be at least 2 characters.'},
                status=400
            )

        if not student.class_assigned:
            return Response({
                'subjects': [], 'chapters': [],
                'tests': [], 'assignments': [], 'doubts': []
            })

        results = {
            'subjects': [], 'chapters': [],
            'tests': [], 'assignments': [], 'doubts': []
        }

        # Search subjects
        class_subjects = ClassSubject.objects.filter(
            academic_class=student.class_assigned,
            subject__name__icontains=query
        ).select_related('subject')[:5]

        for cs in class_subjects:
            results['subjects'].append({
                'id': cs.subject.id,
                'name': cs.subject.name,
                'type': 'subject'
            })

        # Search chapters
        chapters = Chapter.objects.filter(
            class_subject__academic_class=student.class_assigned,
            name__icontains=query
        ).select_related('class_subject__subject')[:5]

        for c in chapters:
            results['chapters'].append({
                'id': c.id,
                'name': c.name,
                'subject': c.class_subject.subject.name,
                'type': 'chapter'
            })

        # Search tests
        tests = Test.objects.filter(
            chapter__class_subject__academic_class=student.class_assigned,
            chapter__name__icontains=query
        ).select_related('chapter__class_subject__subject')[:5]

        for t in tests:
            results['tests'].append({
                'id': t.id,
                'chapter': t.chapter.name,
                'subject': t.chapter.class_subject.subject.name,
                'marks': t.marks,
                'type': 'test'
            })

        # Search assignments
        assignments = Assignment.objects.filter(
            chapter__class_subject__academic_class=student.class_assigned,
            description__icontains=query
        ).select_related('chapter__class_subject__subject', 'teacher')[:5]

        for a in assignments:
            results['assignments'].append({
                'id': a.id,
                'description': a.description[:100],
                'subject': a.chapter.class_subject.subject.name,
                'teacher': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
                'type': 'assignment'
            })

        # Search doubts
        doubts = Doubt.objects.filter(
            class_subject__academic_class=student.class_assigned,
            doubt_text__icontains=query
        ).select_related('class_subject__subject', 'student')[:5]

        for d in doubts:
            results['doubts'].append({
                'id': d.id,
                'text': d.doubt_text[:100],
                'subject': d.class_subject.subject.name,
                'student': f'{d.student.first_name} {d.student.last_name}'.strip(),
                'type': 'doubt'
            })

        return Response(results)

# ===========================================================
#  DIAGNOSTIC VIEW (debugging only)
# ===========================================================

class DiagnosticView(APIView):
    """Diagnostic view to check what's working"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            info = {
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'has_class': user.class_assigned is not None,
                    'class_id': user.class_assigned.id if user.class_assigned else None,
                    'class_name': user.class_assigned.name if user.class_assigned else None,
                }
            }

            if user.class_assigned:
                class_subjects = ClassSubject.objects.filter(
                    academic_class=user.class_assigned
                ).select_related('subject')

                info['class_subjects'] = [{
                    'id': cs.id,
                    'subject_id': cs.subject.id,
                    'subject_name': cs.subject.name
                } for cs in class_subjects]

                all_classes = Class.objects.all()
                info['all_classes'] = [{'id': c.id, 'name': c.name} for c in all_classes]

                all_subjects = Subject.objects.all()
                info['all_subjects'] = [
                    {'id': s.id, 'name': s.name} for s in all_subjects[:10]
                ]

            return Response(info, status=200)

        except Exception as e:
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=200)



# ── Student Notification Views ────────────────────────────────────────────────

class StudentNotificationsView(APIView):
    """GET /api/students/notifications/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({'error': 'Student access required'}, status=403)
        from admin_tasks.models import Notification
        notifs = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]

        data = [{
            'id':         n.id,
            'title':      n.title,
            'message':    n.message,
            'is_read':    n.is_read,
            'created_at': n.created_at.strftime('%d %b %Y, %I:%M %p'),
        } for n in notifs]

        return Response({
            'notifications': data,
            'unread_count':  sum(1 for n in data if not n['is_read']),
        }, status=200)


class StudentMarkNotificationReadView(APIView):
    """POST /api/students/notifications/<id>/mark-read/"""
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        from admin_tasks.models import Notification
        try:
            n = Notification.objects.get(id=notification_id, user=request.user)
            n.is_read = True
            n.save()
            return Response({'message': 'Marked as read'}, status=200)
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class StudentMarkAllReadView(APIView):
    """POST /api/students/notifications/mark-all-read/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from admin_tasks.models import Notification
        Notification.objects.filter(
            user=request.user, is_read=False
        ).update(is_read=True)
        return Response({'message': 'All marked as read'}, status=200)




























