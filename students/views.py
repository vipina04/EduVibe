# students/views.py
"""
Complete Student Module Views
EduVibe Platform - 2026
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone

from users.models import CustomUser
from admin_tasks.models import Class, Subject, Chapter, FeePayment, Notification
from teachers.models import (
    Test, Question, Attendance, Assignment, Doubt, DoubtReply
)
from .models import TestAttempt, StudentAnswer


# ═══════════════════════════════════════════════════════════
#  CUSTOM PERMISSION
# ═══════════════════════════════════════════════════════════

class IsStudentRole(IsAuthenticated):
    """Only allow students"""
    
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'student'
        )


# ═══════════════════════════════════════════════════════════
#  STUDENT HOME & DASHBOARD
# ═══════════════════════════════════════════════════════════

class StudentHomeView(APIView):
    """Student dashboard/home with comprehensive real data"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        from django.db.models import Avg, Sum
        
        student = request.user
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get subjects for student's class
        subjects = student.class_assigned.subjects.all()
        
        subjects_data = []
        for subject in subjects:
            # Get chapters for this subject and class
            chapters = Chapter.objects.filter(
                subject=subject,
                class_assigned=student.class_assigned
            )
            
            # Get tests count
            tests_count = Test.objects.filter(
                chapter__in=chapters
            ).count()
            
            # Get attempted tests count
            attempted_count = TestAttempt.objects.filter(
                student=student,
                test__chapter__in=chapters
            ).count()
            
            # Get teacher name
            teacher_assignment = subject.teacherassignment_set.filter(
                class_assigned=student.class_assigned
            ).first()
            teacher_name = "Not Assigned"
            if teacher_assignment:
                teacher = teacher_assignment.teacher
                teacher_name = f"{teacher.first_name} {teacher.last_name}".strip()
            
            subjects_data.append({
                'id': subject.id,
                'name': subject.name,
                'chapters_count': chapters.count(),
                'completed_chapters': chapters.filter(is_completed=True).count(),
                'total_tests': tests_count,
                'attempted_tests': attempted_count,
                'teacher_name': teacher_name,
                'next_class': None  # Can be expanded with schedule
            })
        
        # Calculate comprehensive stats
        
        # 1. Total tests taken
        all_test_attempts = TestAttempt.objects.filter(student=student)
        tests_taken = all_test_attempts.count()
        
        # 2. Average score
        avg_score = all_test_attempts.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        
        # 3. Attendance calculation
        attendance_records = Attendance.objects.filter(student=student)
        total_attendance = attendance_records.count()
        present_count = attendance_records.filter(is_present=True).count()
        attendance_percentage = round((present_count / total_attendance * 100), 2) if total_attendance > 0 else 0
        
        # 4. Pending assignments
        all_chapters = Chapter.objects.filter(
            subject__in=subjects,
            class_assigned=student.class_assigned
        )
        all_assignments = Assignment.objects.filter(chapter__in=all_chapters)
        
        # Count assignments without submission from this student
        from students.models import AssignmentSubmission
        submitted_assignment_ids = AssignmentSubmission.objects.filter(
            student=student
        ).values_list('assignment_id', flat=True)
        
        pending_assignments = all_assignments.exclude(id__in=submitted_assignment_ids).count()
        
        # 5. Unread notifications
        unread_notifications = Notification.objects.filter(
            user=student,
            created_at__gte=timezone.now() - timezone.timedelta(days=30)  # Last 30 days
        ).count()
        
        # 6. Pending doubts
        pending_doubts = Doubt.objects.filter(
            student=student
        ).annotate(
            reply_count=Count('doubtreply')
        ).filter(reply_count=0).count()
        
        # 7. Fee statistics
        fee_payments = FeePayment.objects.filter(student=student)
        total_fees_paid = fee_payments.aggregate(total=Sum('amount'))['total'] or 0
        
        # Assuming there's a total fee amount expected (you can adjust this logic)
        # For now, let's assume a fixed amount or you can add a Fee model
        expected_total_fees = 50000  # This should come from a Fee model
        pending_fees_count = 1 if total_fees_paid < expected_total_fees else 0
        
        # 8. Recent test results
        recent_tests = all_test_attempts.select_related('test', 'test__chapter').order_by('-created_at')[:5]
        recent_tests_data = []
        
        for attempt in recent_tests:
            test = attempt.test
            percentage = round((attempt.score / test.marks * 100), 2) if test.marks > 0 else 0
            
            recent_tests_data.append({
                'id': attempt.id,
                'test_name': f"{test.chapter.name} Test" if test.chapter else "Test",
                'score': float(attempt.score) if hasattr(attempt, 'score') else 0,
                'total_marks': test.marks,
                'percentage': percentage,
                'date': attempt.created_at.strftime('%Y-%m-%d') if hasattr(attempt, 'created_at') else '',
            })
        
        # Comprehensive stats object
        stats = {
            'total_subjects': subjects.count(),
            'tests_taken': tests_taken,
            'attendance_percentage': attendance_percentage,
            'pending_assignments': pending_assignments,
            'unread_notifications': unread_notifications,
            'pending_doubts': pending_doubts,
            'average_score': round(avg_score, 2),
            'pending_fees': pending_fees_count,
            'total_fees': float(expected_total_fees),
            'paid_fees': float(total_fees_paid),
        }
        
        return Response({
            'student': {
                'name': f'{student.first_name} {student.last_name}'.strip(),
                'unique_id': student.unique_id,
                'class': {
                    'id': student.class_assigned.id,
                    'name': student.class_assigned.name
                }
            },
            'subjects': subjects_data,
            'stats': stats,
            'recent_tests': recent_tests_data
        })


# ═══════════════════════════════════════════════════════════
#  SUBJECT & CHAPTER VIEWS
# ═══════════════════════════════════════════════════════════

class SubjectDetailView(APIView):
    """Get subject details with chapters"""
    permission_classes = [IsStudentRole]
    
    def get(self, request, subject_id):
        student = request.user
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            
            # Check if subject taught in student's class
            if student.class_assigned not in subject.classes.all():
                return Response({
                    'error': 'Subject not in your class.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get chapters
            chapters = Chapter.objects.filter(
                subject=subject,
                class_assigned=student.class_assigned
            )
            
            chapters_data = []
            for chapter in chapters:
                # Get tests for chapter
                tests = Test.objects.filter(chapter=chapter)
                
                # Get attempted tests
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
                    'id': subject.id,
                    'name': subject.name
                },
                'class': {
                    'id': student.class_assigned.id,
                    'name': student.class_assigned.name
                },
                'chapters': chapters_data
            })
        
        except Subject.DoesNotExist:
            return Response({
                'error': 'Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class ChapterTestsView(APIView):
    """Get all tests for a chapter"""
    permission_classes = [IsStudentRole]
    
    def get(self, request, chapter_id):
        student = request.user
        
        try:
            chapter = Chapter.objects.select_related(
                'subject',
                'class_assigned'
            ).get(id=chapter_id)
            
            # Check if chapter belongs to student's class
            if chapter.class_assigned != student.class_assigned:
                return Response({
                    'error': 'Not authorized.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get tests
            tests = Test.objects.filter(chapter=chapter)
            
            tests_data = []
            for test in tests:
                # Check if already attempted
                attempt = TestAttempt.objects.filter(
                    student=student,
                    test=test
                ).first()
                
                test_data = {
                    'id': test.id,
                    'type': test.type,
                    'type_display': test.get_type_display(),
                    'marks': test.marks,
                    'questions_count': Question.objects.filter(test=test).count(),
                    'attempted': bool(attempt)
                }
                
                if attempt:
                    test_data['score'] = attempt.score
                    test_data['percentage'] = round((attempt.score / test.marks) * 100, 2)
                    test_data['attempted_at'] = attempt.attempted_at
                
                tests_data.append(test_data)
            
            return Response({
                'chapter': {
                    'id': chapter.id,
                    'name': chapter.name,
                    'subject': chapter.subject.name
                },
                'tests': tests_data
            })
        
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  TEST TAKING
# ═══════════════════════════════════════════════════════════

class TestStartView(APIView):
    """Start a test (get questions)"""
    permission_classes = [IsStudentRole]
    
    def get(self, request, test_id):
        student = request.user
        
        try:
            test = Test.objects.select_related(
                'chapter__subject',
                'chapter__class_assigned'
            ).get(id=test_id)
            
            # Check if test belongs to student's class
            if test.chapter.class_assigned != student.class_assigned:
                return Response({
                    'error': 'Not authorized.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if already attempted
            if TestAttempt.objects.filter(student=student, test=test).exists():
                return Response({
                    'error': 'You have already attempted this test.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get questions
            questions = Question.objects.filter(test=test)
            
            questions_data = []
            for q in questions:
                q_data = {
                    'id': q.id,
                    'question_text': q.question_text,
                    'question_image': request.build_absolute_uri(q.question_image.url) if q.question_image else None
                }
                
                # For MCQ, show options (but not correct answer)
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
                    'type': test.type,
                    'type_display': test.get_type_display(),
                    'marks': test.marks,
                    'chapter': test.chapter.name,
                    'subject': test.chapter.subject.name
                },
                'questions': questions_data,
                'total_questions': len(questions_data)
            })
        
        except Test.DoesNotExist:
            return Response({
                'error': 'Test not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class TestSubmitView(APIView):
    """Submit test answers"""
    permission_classes = [IsStudentRole]
    
    def post(self, request, test_id):
        student = request.user
        answers = request.data.get('answers', [])  # List of {question_id, selected_option/answer_text}
        
        try:
            test = Test.objects.get(id=test_id)
            
            # Check if test belongs to student's class
            if test.chapter.class_assigned != student.class_assigned:
                return Response({
                    'error': 'Not authorized.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check if already attempted
            if TestAttempt.objects.filter(student=student, test=test).exists():
                return Response({
                    'error': 'Already attempted.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create test attempt
            test_attempt = TestAttempt.objects.create(
                student=student,
                test=test,
                score=0
            )
            
            # Calculate score (for MCQ)
            score = 0
            
            for answer_data in answers:
                question_id = answer_data.get('question_id')
                selected_option = answer_data.get('selected_option')
                answer_text = answer_data.get('answer_text', '')
                
                try:
                    question = Question.objects.get(id=question_id, test=test)
                    
                    is_correct = False
                    
                    # For MCQ, check if answer is correct
                    if test.type == 'mcq' and selected_option:
                        if int(selected_option) == question.correct_option:
                            is_correct = True
                            score += 1
                    
                    # Save answer
                    StudentAnswer.objects.create(
                        student=student,
                        question=question,
                        selected_option=selected_option if test.type == 'mcq' else None,
                        descriptive_answer=answer_text if test.type == 'descriptive' else ''
                    )
                
                except Question.DoesNotExist:
                    continue
            
            # Update score
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
            return Response({
                'error': 'Test not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class TestResultView(APIView):
    """View test result with solutions"""
    permission_classes = [IsStudentRole]
    
    def get(self, request, attempt_id):
        student = request.user
        
        try:
            attempt = TestAttempt.objects.select_related(
                'test__chapter__subject'
            ).get(id=attempt_id, student=student)
            
            # Get all answers
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
                    'question_image': request.build_absolute_uri(question.question_image.url) if question.question_image else None
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
                    'type': attempt.test.get_type_display(),
                    'marks': attempt.test.marks,
                    'chapter': attempt.test.chapter.name,
                    'subject': attempt.test.chapter.subject.name
                },
                'score': attempt.score,
                'max_marks': attempt.test.marks,
                'percentage': round((attempt.score / attempt.test.marks) * 100, 2) if attempt.test.marks > 0 else 0,
                'attempted_at': attempt.attempted_at,
                'results': results_data
            })
        
        except TestAttempt.DoesNotExist:
            return Response({
                'error': 'Test attempt not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class MyTestAttemptsView(APIView):
    """Get all test attempts by student"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        
        attempts = TestAttempt.objects.filter(
            student=student
        ).select_related(
            'test__chapter__subject',
            'test__chapter__class_assigned'
        ).order_by('-attempted_at')
        
        attempts_data = [
            {
                'id': a.id,
                'test': {
                    'id': a.test.id,
                    'type': a.test.get_type_display(),
                    'marks': a.test.marks,
                    'chapter': a.test.chapter.name,
                    'subject': a.test.chapter.subject.name
                },
                'score': a.score,
                'percentage': round((a.score / a.test.marks) * 100, 2),
                'attempted_at': a.attempted_at
            }
            for a in attempts
        ]
        
        return Response(attempts_data)


# ═══════════════════════════════════════════════════════════
#  ATTENDANCE
# ═══════════════════════════════════════════════════════════

class MyAttendanceView(APIView):
    """Get student's attendance"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        subject_id = request.GET.get('subject_id')
        
        attendance_records = Attendance.objects.filter(student=student)
        
        if subject_id:
            attendance_records = attendance_records.filter(subject_id=subject_id)
        
        attendance_records = attendance_records.select_related('subject').order_by('-date')
        
        records_data = [
            {
                'date': a.date,
                'subject': a.subject.name,
                'is_present': a.is_present
            }
            for a in attendance_records
        ]
        
        # Calculate statistics
        total = len(records_data)
        present = sum(1 for a in records_data if a['is_present'])
        
        return Response({
            'statistics': {
                'total_classes': total,
                'present': present,
                'absent': total - present,
                'attendance_percentage': round((present / total * 100), 2) if total > 0 else 0
            },
            'records': records_data
        })


# ═══════════════════════════════════════════════════════════
#  FEE PAYMENTS
# ═══════════════════════════════════════════════════════════

class MyFeePaymentsView(APIView):
    """Get student's fee payments"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        
        payments = FeePayment.objects.filter(student=student).order_by('-paid_at')
        
        payments_data = [
            {
                'id': p.id,
                'amount': str(p.amount),
                'paid_at': p.paid_at,
                'receipt_url': request.build_absolute_uri(p.receipt.url) if p.receipt else None
            }
            for p in payments
        ]
        
        # Calculate total
        total_paid = sum(float(p.amount) for p in payments)
        
        return Response({
            'total_paid': total_paid,
            'payments_count': len(payments_data),
            'payments': payments_data
        })


# ═══════════════════════════════════════════════════════════
#  ASSIGNMENTS
# ═══════════════════════════════════════════════════════════

class MyAssignmentsView(APIView):
    """Get assignments for student's class"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        subject_id = request.GET.get('subject_id')
        
        if not student.class_assigned:
            return Response([])
        
        assignments = Assignment.objects.filter(
            chapter__class_assigned=student.class_assigned
        ).select_related('chapter__subject', 'teacher')
        
        if subject_id:
            assignments = assignments.filter(chapter__subject_id=subject_id)
        
        assignments_data = [
            {
                'id': a.id,
                'description': a.description,
                'chapter': a.chapter.name,
                'subject': a.chapter.subject.name,
                'teacher': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
                'file_url': request.build_absolute_uri(a.file.url) if a.file else None
            }
            for a in assignments
        ]
        
        return Response(assignments_data)


# ═══════════════════════════════════════════════════════════
#  DOUBTS
# ═══════════════════════════════════════════════════════════

class DoubtCreateView(APIView):
    """Post a doubt"""
    permission_classes = [IsStudentRole]
    
    def post(self, request):
        student = request.user
        subject_id = request.data.get('subject_id')
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')
        
        if not text and not image:
            return Response({
                'error': 'Provide text or image.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            
            # Check if subject is in student's class
            if student.class_assigned not in subject.classes.all():
                return Response({
                    'error': 'Subject not in your class.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            doubt = Doubt.objects.create(
                student=student,
                subject=subject,
                text=text,
                image=image
            )
            
            return Response({
                'message': 'Doubt posted successfully!',
                'doubt': {
                    'id': doubt.id,
                    'subject': subject.name,
                    'text': text,
                    'created_at': doubt.created_at
                }
            }, status=status.HTTP_201_CREATED)
        
        except Subject.DoesNotExist:
            return Response({
                'error': 'Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  NOTIFICATIONS
# ═══════════════════════════════════════════════════════════

class MyNotificationsView(APIView):
    """Get student's notifications"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        notifications_data = [
            {
                'id': n.id,
                'message': n.message,
                'created_at': n.created_at
            }
            for n in notifications
        ]
        
        return Response(notifications_data)


# ═══════════════════════════════════════════════════════════
#  SEARCH
# ═══════════════════════════════════════════════════════════

# class StudentSearchView(APIView):
#     """Search for student's content"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
#         query = request.GET.get('q', '').strip()
        
#         if not query or len(query) < 2:
#             return Response({
#                 'error': 'Search query must be at least 2 characters.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not student.class_assigned:
#             return Response({
#                 'subjects': [],
#                 'chapters': [],
#                 'tests': [],
#                 'assignments': [],
#                 'doubts': []
#             })
        
#         results = {
#             'subjects': [],
#             'chapters': [],
#             'tests': [],
#             'assignments': [],
#             'doubts': []
#         }
        
#         # Search subjects
#         subjects = student.class_assigned.subject_set.filter(name__icontains=query)[:5]
#         results['subjects'] = [
#             {'id': s.id, 'name': s.name}
#             for s in subjects
#         ]
        
#         # Search chapters
#         chapters = Chapter.objects.filter(
#             class_assigned=student.class_assigned,
#             name__icontains=query
#         )[:5]
#         results['chapters'] = [
#             {'id': c.id, 'name': c.name, 'subject': c.subject.name}
#             for c in chapters
#         ]
        
#         # Search tests
#         tests = Test.objects.filter(
#             chapter__class_assigned=student.class_assigned,
#             chapter__name__icontains=query
#         ).select_related('chapter__subject')[:5]
#         results['tests'] = [
#             {
#                 'id': t.id,
#                 'chapter': t.chapter.name,
#                 'subject': t.chapter.subject.name,
#                 'marks': t.marks
#             }
#             for t in tests
#         ]
        
#         # Search assignments
#         assignments = Assignment.objects.filter(
#             chapter__class_assigned=student.class_assigned,
#             description__icontains=query
#         ).select_related('chapter__subject')[:5]
#         results['assignments'] = [
#             {
#                 'id': a.id,
#                 'description': a.description[:100],
#                 'subject': a.chapter.subject.name
#             }
#             for a in assignments
#         ]
        
#         # Search doubts
#         doubts = Doubt.objects.filter(
#             student__class_assigned=student.class_assigned,
#             text__icontains=query
#         ).select_related('subject')[:5]
#         results['doubts'] = [
#             {
#                 'id': d.id,
#                 'text': d.text[:100],
#                 'subject': d.subject.name
#             }
#             for d in doubts
#         ]
        
#         return Response(results)




# Find StudentSearchView in students/views.py and REPLACE it with this:

class StudentSearchView(APIView):
    """Enhanced search for student content"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        query = request.GET.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response({
                'error': 'Search query must be at least 2 characters.'
            }, status=400)
        
        if not student.class_assigned:
            return Response({
                'subjects': [],
                'chapters': [],
                'tests': [],
                'assignments': [],
                'doubts': []
            })
        
        results = {
            'subjects': [],
            'chapters': [],
            'tests': [],
            'assignments': [],
            'doubts': []
        }
        
        # Search subjects
        subjects = student.class_assigned.subject_set.filter(
            name__icontains=query
        )[:5]
        
        for s in subjects:
            results['subjects'].append({
                'id': s.id,
                'name': s.name,
                'type': 'subject'
            })
        
        # Search chapters
        from admin_tasks.models import Chapter
        chapters = Chapter.objects.filter(
            class_assigned=student.class_assigned,
            name__icontains=query
        ).select_related('subject')[:5]
        
        for c in chapters:
            results['chapters'].append({
                'id': c.id,
                'name': c.name,
                'subject': c.subject.name,
                'type': 'chapter'
            })
        
        # Search tests
        from teachers.models import Test
        tests = Test.objects.filter(
            chapter__class_assigned=student.class_assigned,
            chapter__name__icontains=query
        ).select_related('chapter__subject')[:5]
        
        for t in tests:
            results['tests'].append({
                'id': t.id,
                'chapter': t.chapter.name,
                'subject': t.chapter.subject.name,
                'marks': t.marks,
                'type': 'test'
            })
        
        # Search assignments
        from teachers.models import Assignment
        assignments = Assignment.objects.filter(
            chapter__class_assigned=student.class_assigned,
            description__icontains=query
        ).select_related('chapter__subject', 'teacher')[:5]
        
        for a in assignments:
            results['assignments'].append({
                'id': a.id,
                'description': a.description[:100],
                'subject': a.chapter.subject.name,
                'teacher': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
                'type': 'assignment'
            })
        
        # Search doubts
        doubts = Doubt.objects.filter(
            student__class_assigned=student.class_assigned,
            text__icontains=query
        ).select_related('subject', 'student')[:5]
        
        for d in doubts:
            results['doubts'].append({
                'id': d.id,
                'text': d.text[:100],
                'subject': d.subject.name,
                'student': f'{d.student.first_name} {d.student.last_name}'.strip(),
                'type': 'doubt'
            })
        
        return Response(results)














# # students/views.py
# """
# Complete Student Module Views
# EduVibe Platform - 2026
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.db.models import Q, Count
# from django.utils import timezone

# from users.models import CustomUser
# from admin_tasks.models import Class, Subject, Chapter, FeePayment, Notification
# from teachers.models import (
#     Test, Question, Attendance, Assignment, Doubt, DoubtReply
# )
# from .models import TestAttempt, StudentAnswer


# # ═══════════════════════════════════════════════════════════
# #  CUSTOM PERMISSION
# # ═══════════════════════════════════════════════════════════

# class IsStudentRole(IsAuthenticated):
#     """Only allow students"""
    
#     def has_permission(self, request, view):
#         return (
#             super().has_permission(request, view) and
#             request.user.role == 'student'
#         )


# # ═══════════════════════════════════════════════════════════
# #  STUDENT HOME & DASHBOARD
# # ═══════════════════════════════════════════════════════════

# class StudentHomeView(APIView):
#     """Student dashboard/home"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
        
#         if not student.class_assigned:
#             return Response({
#                 'error': 'No class assigned.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Get subjects for student's class
#         subjects = student.class_assigned.subject_set.all()
        
#         subjects_data = []
#         for subject in subjects:
#             # Get chapters
#             chapters = Chapter.objects.filter(
#                 subject=subject,
#                 class_assigned=student.class_assigned
#             )
            
#             # Get tests count
#             tests_count = Test.objects.filter(
#                 chapter__in=chapters
#             ).count()
            
#             # Get attempted tests count
#             attempted_count = TestAttempt.objects.filter(
#                 student=student,
#                 test__chapter__in=chapters
#             ).count()
            
#             subjects_data.append({
#                 'id': subject.id,
#                 'name': subject.name,
#                 'total_chapters': chapters.count(),
#                 'completed_chapters': chapters.filter(is_completed=True).count(),
#                 'total_tests': tests_count,
#                 'attempted_tests': attempted_count
#             })
        
#         # Get stats
#         stats = {
#             'total_tests_attempted': TestAttempt.objects.filter(student=student).count(),
#             'total_fees_paid': str(
#                 FeePayment.objects.filter(student=student).aggregate(
#                     total=Count('id')
#                 )['total'] or 0
#             ),
#             'unread_notifications': Notification.objects.filter(user=student).count()
#         }
        
#         return Response({
#             'student': {
#                 'name': f'{student.first_name} {student.last_name}'.strip(),
#                 'unique_id': student.unique_id,
#                 'class': {
#                     'id': student.class_assigned.id,
#                     'name': student.class_assigned.name
#                 }
#             },
#             'subjects': subjects_data,
#             'stats': stats
#         })


# # ═══════════════════════════════════════════════════════════
# #  SUBJECT & CHAPTER VIEWS
# # ═══════════════════════════════════════════════════════════

# class SubjectDetailView(APIView):
#     """Get subject details with chapters"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request, subject_id):
#         student = request.user
        
#         if not student.class_assigned:
#             return Response({
#                 'error': 'No class assigned.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             subject = Subject.objects.get(id=subject_id)
            
#             # Check if subject taught in student's class
#             if student.class_assigned not in subject.classes.all():
#                 return Response({
#                     'error': 'Subject not in your class.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Get chapters
#             chapters = Chapter.objects.filter(
#                 subject=subject,
#                 class_assigned=student.class_assigned
#             )
            
#             chapters_data = []
#             for chapter in chapters:
#                 # Get tests for chapter
#                 tests = Test.objects.filter(chapter=chapter)
                
#                 # Get attempted tests
#                 attempted_tests = TestAttempt.objects.filter(
#                     student=student,
#                     test__chapter=chapter
#                 ).values_list('test_id', flat=True)
                
#                 chapters_data.append({
#                     'id': chapter.id,
#                     'name': chapter.name,
#                     'is_completed': chapter.is_completed,
#                     'total_tests': tests.count(),
#                     'attempted_tests': len(attempted_tests),
#                     'pending_tests': tests.exclude(id__in=attempted_tests).count()
#                 })
            
#             return Response({
#                 'subject': {
#                     'id': subject.id,
#                     'name': subject.name
#                 },
#                 'class': {
#                     'id': student.class_assigned.id,
#                     'name': student.class_assigned.name
#                 },
#                 'chapters': chapters_data
#             })
        
#         except Subject.DoesNotExist:
#             return Response({
#                 'error': 'Subject not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class ChapterTestsView(APIView):
#     """Get all tests for a chapter"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request, chapter_id):
#         student = request.user
        
#         try:
#             chapter = Chapter.objects.select_related(
#                 'subject',
#                 'class_assigned'
#             ).get(id=chapter_id)
            
#             # Check if chapter belongs to student's class
#             if chapter.class_assigned != student.class_assigned:
#                 return Response({
#                     'error': 'Not authorized.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Get tests
#             tests = Test.objects.filter(chapter=chapter)
            
#             tests_data = []
#             for test in tests:
#                 # Check if already attempted
#                 attempt = TestAttempt.objects.filter(
#                     student=student,
#                     test=test
#                 ).first()
                
#                 test_data = {
#                     'id': test.id,
#                     'type': test.type,
#                     'type_display': test.get_type_display(),
#                     'marks': test.marks,
#                     'questions_count': Question.objects.filter(test=test).count(),
#                     'attempted': bool(attempt)
#                 }
                
#                 if attempt:
#                     test_data['score'] = attempt.score
#                     test_data['percentage'] = round((attempt.score / test.marks) * 100, 2)
#                     test_data['attempted_at'] = attempt.attempted_at
                
#                 tests_data.append(test_data)
            
#             return Response({
#                 'chapter': {
#                     'id': chapter.id,
#                     'name': chapter.name,
#                     'subject': chapter.subject.name
#                 },
#                 'tests': tests_data
#             })
        
#         except Chapter.DoesNotExist:
#             return Response({
#                 'error': 'Chapter not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  TEST TAKING
# # ═══════════════════════════════════════════════════════════

# class TestStartView(APIView):
#     """Start a test (get questions)"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request, test_id):
#         student = request.user
        
#         try:
#             test = Test.objects.select_related(
#                 'chapter__subject',
#                 'chapter__class_assigned'
#             ).get(id=test_id)
            
#             # Check if test belongs to student's class
#             if test.chapter.class_assigned != student.class_assigned:
#                 return Response({
#                     'error': 'Not authorized.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Check if already attempted
#             if TestAttempt.objects.filter(student=student, test=test).exists():
#                 return Response({
#                     'error': 'You have already attempted this test.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Get questions
#             questions = Question.objects.filter(test=test)
            
#             questions_data = []
#             for q in questions:
#                 q_data = {
#                     'id': q.id,
#                     'question_text': q.question_text,
#                     'question_image': request.build_absolute_uri(q.question_image.url) if q.question_image else None
#                 }
                
#                 # For MCQ, show options (but not correct answer)
#                 if test.type == 'mcq':
#                     q_data.update({
#                         'option1': q.option1,
#                         'option2': q.option2,
#                         'option3': q.option3,
#                         'option4': q.option4
#                     })
                
#                 questions_data.append(q_data)
            
#             return Response({
#                 'test': {
#                     'id': test.id,
#                     'type': test.type,
#                     'type_display': test.get_type_display(),
#                     'marks': test.marks,
#                     'chapter': test.chapter.name,
#                     'subject': test.chapter.subject.name
#                 },
#                 'questions': questions_data,
#                 'total_questions': len(questions_data)
#             })
        
#         except Test.DoesNotExist:
#             return Response({
#                 'error': 'Test not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class TestSubmitView(APIView):
#     """Submit test answers"""
#     permission_classes = [IsStudentRole]
    
#     def post(self, request, test_id):
#         student = request.user
#         answers = request.data.get('answers', [])  # List of {question_id, selected_option/answer_text}
        
#         try:
#             test = Test.objects.get(id=test_id)
            
#             # Check if test belongs to student's class
#             if test.chapter.class_assigned != student.class_assigned:
#                 return Response({
#                     'error': 'Not authorized.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Check if already attempted
#             if TestAttempt.objects.filter(student=student, test=test).exists():
#                 return Response({
#                     'error': 'Already attempted.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create test attempt
#             test_attempt = TestAttempt.objects.create(
#                 student=student,
#                 test=test,
#                 score=0
#             )
            
#             # Calculate score (for MCQ)
#             score = 0
            
#             for answer_data in answers:
#                 question_id = answer_data.get('question_id')
#                 selected_option = answer_data.get('selected_option')
#                 answer_text = answer_data.get('answer_text', '')
                
#                 try:
#                     question = Question.objects.get(id=question_id, test=test)
                    
#                     is_correct = False
                    
#                     # For MCQ, check if answer is correct
#                     if test.type == 'mcq' and selected_option:
#                         if int(selected_option) == question.correct_option:
#                             is_correct = True
#                             score += 1
                    
#                     # Save answer
#                     StudentAnswer.objects.create(
#                         student=student,
#                         question=question,
#                         selected_option=selected_option if test.type == 'mcq' else None,
#                         descriptive_answer=answer_text if test.type == 'descriptive' else ''
#                     )
                
#                 except Question.DoesNotExist:
#                     continue
            
#             # Update score
#             test_attempt.score = score
#             test_attempt.save()
            
#             return Response({
#                 'message': 'Test submitted successfully!',
#                 'score': score,
#                 'max_marks': test.marks,
#                 'percentage': round((score / test.marks) * 100, 2) if test.marks > 0 else 0,
#                 'attempt_id': test_attempt.id
#             }, status=status.HTTP_201_CREATED)
        
#         except Test.DoesNotExist:
#             return Response({
#                 'error': 'Test not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class TestResultView(APIView):
#     """View test result with solutions"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request, attempt_id):
#         student = request.user
        
#         try:
#             attempt = TestAttempt.objects.select_related(
#                 'test__chapter__subject'
#             ).get(id=attempt_id, student=student)
            
#             # Get all answers
#             answers = StudentAnswer.objects.filter(
#                 student=student,
#                 question__test=attempt.test
#             ).select_related('question')
            
#             results_data = []
#             for answer in answers:
#                 question = answer.question
                
#                 result = {
#                     'question_id': question.id,
#                     'question_text': question.question_text,
#                     'question_image': request.build_absolute_uri(question.question_image.url) if question.question_image else None
#                 }
                
#                 if attempt.test.type == 'mcq':
#                     result.update({
#                         'option1': question.option1,
#                         'option2': question.option2,
#                         'option3': question.option3,
#                         'option4': question.option4,
#                         'selected_option': answer.selected_option,
#                         'correct_option': question.correct_option,
#                         'is_correct': answer.selected_option == question.correct_option if answer.selected_option else False,
#                         'explanation': question.explanation
#                     })
#                 else:
#                     result.update({
#                         'your_answer': answer.descriptive_answer,
#                         'explanation': question.explanation
#                     })
                
#                 results_data.append(result)
            
#             return Response({
#                 'test': {
#                     'id': attempt.test.id,
#                     'type': attempt.test.get_type_display(),
#                     'marks': attempt.test.marks,
#                     'chapter': attempt.test.chapter.name,
#                     'subject': attempt.test.chapter.subject.name
#                 },
#                 'score': attempt.score,
#                 'max_marks': attempt.test.marks,
#                 'percentage': round((attempt.score / attempt.test.marks) * 100, 2) if attempt.test.marks > 0 else 0,
#                 'attempted_at': attempt.attempted_at,
#                 'results': results_data
#             })
        
#         except TestAttempt.DoesNotExist:
#             return Response({
#                 'error': 'Test attempt not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class MyTestAttemptsView(APIView):
#     """Get all test attempts by student"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
        
#         attempts = TestAttempt.objects.filter(
#             student=student
#         ).select_related(
#             'test__chapter__subject',
#             'test__chapter__class_assigned'
#         ).order_by('-attempted_at')
        
#         attempts_data = [
#             {
#                 'id': a.id,
#                 'test': {
#                     'id': a.test.id,
#                     'type': a.test.get_type_display(),
#                     'marks': a.test.marks,
#                     'chapter': a.test.chapter.name,
#                     'subject': a.test.chapter.subject.name
#                 },
#                 'score': a.score,
#                 'percentage': round((a.score / a.test.marks) * 100, 2),
#                 'attempted_at': a.attempted_at
#             }
#             for a in attempts
#         ]
        
#         return Response(attempts_data)


# # ═══════════════════════════════════════════════════════════
# #  ATTENDANCE
# # ═══════════════════════════════════════════════════════════

# class MyAttendanceView(APIView):
#     """Get student's attendance"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
#         subject_id = request.GET.get('subject_id')
        
#         attendance_records = Attendance.objects.filter(student=student)
        
#         if subject_id:
#             attendance_records = attendance_records.filter(subject_id=subject_id)
        
#         attendance_records = attendance_records.select_related('subject').order_by('-date')
        
#         records_data = [
#             {
#                 'date': a.date,
#                 'subject': a.subject.name,
#                 'is_present': a.is_present
#             }
#             for a in attendance_records
#         ]
        
#         # Calculate statistics
#         total = len(records_data)
#         present = sum(1 for a in records_data if a['is_present'])
        
#         return Response({
#             'statistics': {
#                 'total_classes': total,
#                 'present': present,
#                 'absent': total - present,
#                 'attendance_percentage': round((present / total * 100), 2) if total > 0 else 0
#             },
#             'records': records_data
#         })


# # ═══════════════════════════════════════════════════════════
# #  FEE PAYMENTS
# # ═══════════════════════════════════════════════════════════

# class MyFeePaymentsView(APIView):
#     """Get student's fee payments"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
        
#         payments = FeePayment.objects.filter(student=student).order_by('-paid_at')
        
#         payments_data = [
#             {
#                 'id': p.id,
#                 'amount': str(p.amount),
#                 'paid_at': p.paid_at,
#                 'receipt_url': request.build_absolute_uri(p.receipt.url) if p.receipt else None
#             }
#             for p in payments
#         ]
        
#         # Calculate total
#         total_paid = sum(float(p.amount) for p in payments)
        
#         return Response({
#             'total_paid': total_paid,
#             'payments_count': len(payments_data),
#             'payments': payments_data
#         })


# # ═══════════════════════════════════════════════════════════
# #  ASSIGNMENTS
# # ═══════════════════════════════════════════════════════════

# class MyAssignmentsView(APIView):
#     """Get assignments for student's class"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
#         subject_id = request.GET.get('subject_id')
        
#         if not student.class_assigned:
#             return Response([])
        
#         assignments = Assignment.objects.filter(
#             chapter__class_assigned=student.class_assigned
#         ).select_related('chapter__subject', 'teacher')
        
#         if subject_id:
#             assignments = assignments.filter(chapter__subject_id=subject_id)
        
#         assignments_data = [
#             {
#                 'id': a.id,
#                 'description': a.description,
#                 'chapter': a.chapter.name,
#                 'subject': a.chapter.subject.name,
#                 'teacher': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
#                 'file_url': request.build_absolute_uri(a.file.url) if a.file else None
#             }
#             for a in assignments
#         ]
        
#         return Response(assignments_data)


# # ═══════════════════════════════════════════════════════════
# #  DOUBTS
# # ═══════════════════════════════════════════════════════════

# class DoubtCreateView(APIView):
#     """Post a doubt"""
#     permission_classes = [IsStudentRole]
    
#     def post(self, request):
#         student = request.user
#         subject_id = request.data.get('subject_id')
#         text = request.data.get('text', '').strip()
#         image = request.FILES.get('image')
        
#         if not text and not image:
#             return Response({
#                 'error': 'Provide text or image.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not student.class_assigned:
#             return Response({
#                 'error': 'No class assigned.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             subject = Subject.objects.get(id=subject_id)
            
#             # Check if subject is in student's class
#             if student.class_assigned not in subject.classes.all():
#                 return Response({
#                     'error': 'Subject not in your class.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             doubt = Doubt.objects.create(
#                 student=student,
#                 subject=subject,
#                 text=text,
#                 image=image
#             )
            
#             return Response({
#                 'message': 'Doubt posted successfully!',
#                 'doubt': {
#                     'id': doubt.id,
#                     'subject': subject.name,
#                     'text': text,
#                     'created_at': doubt.created_at
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except Subject.DoesNotExist:
#             return Response({
#                 'error': 'Subject not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  NOTIFICATIONS
# # ═══════════════════════════════════════════════════════════

# class MyNotificationsView(APIView):
#     """Get student's notifications"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         notifications = Notification.objects.filter(
#             user=request.user
#         ).order_by('-created_at')
        
#         notifications_data = [
#             {
#                 'id': n.id,
#                 'message': n.message,
#                 'created_at': n.created_at
#             }
#             for n in notifications
#         ]
        
#         return Response(notifications_data)


# # ═══════════════════════════════════════════════════════════
# #  SEARCH
# # ═══════════════════════════════════════════════════════════

# # class StudentSearchView(APIView):
# #     """Search for student's content"""
# #     permission_classes = [IsStudentRole]
    
# #     def get(self, request):
# #         student = request.user
# #         query = request.GET.get('q', '').strip()
        
# #         if not query or len(query) < 2:
# #             return Response({
# #                 'error': 'Search query must be at least 2 characters.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         if not student.class_assigned:
# #             return Response({
# #                 'subjects': [],
# #                 'chapters': [],
# #                 'tests': [],
# #                 'assignments': [],
# #                 'doubts': []
# #             })
        
# #         results = {
# #             'subjects': [],
# #             'chapters': [],
# #             'tests': [],
# #             'assignments': [],
# #             'doubts': []
# #         }
        
# #         # Search subjects
# #         subjects = student.class_assigned.subject_set.filter(name__icontains=query)[:5]
# #         results['subjects'] = [
# #             {'id': s.id, 'name': s.name}
# #             for s in subjects
# #         ]
        
# #         # Search chapters
# #         chapters = Chapter.objects.filter(
# #             class_assigned=student.class_assigned,
# #             name__icontains=query
# #         )[:5]
# #         results['chapters'] = [
# #             {'id': c.id, 'name': c.name, 'subject': c.subject.name}
# #             for c in chapters
# #         ]
        
# #         # Search tests
# #         tests = Test.objects.filter(
# #             chapter__class_assigned=student.class_assigned,
# #             chapter__name__icontains=query
# #         ).select_related('chapter__subject')[:5]
# #         results['tests'] = [
# #             {
# #                 'id': t.id,
# #                 'chapter': t.chapter.name,
# #                 'subject': t.chapter.subject.name,
# #                 'marks': t.marks
# #             }
# #             for t in tests
# #         ]
        
# #         # Search assignments
# #         assignments = Assignment.objects.filter(
# #             chapter__class_assigned=student.class_assigned,
# #             description__icontains=query
# #         ).select_related('chapter__subject')[:5]
# #         results['assignments'] = [
# #             {
# #                 'id': a.id,
# #                 'description': a.description[:100],
# #                 'subject': a.chapter.subject.name
# #             }
# #             for a in assignments
# #         ]
        
# #         # Search doubts
# #         doubts = Doubt.objects.filter(
# #             student__class_assigned=student.class_assigned,
# #             text__icontains=query
# #         ).select_related('subject')[:5]
# #         results['doubts'] = [
# #             {
# #                 'id': d.id,
# #                 'text': d.text[:100],
# #                 'subject': d.subject.name
# #             }
# #             for d in doubts
# #         ]
        
# #         return Response(results)




# # Find StudentSearchView in students/views.py and REPLACE it with this:

# class StudentSearchView(APIView):
#     """Enhanced search for student content"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
#         query = request.GET.get('q', '').strip()
        
#         if not query or len(query) < 2:
#             return Response({
#                 'error': 'Search query must be at least 2 characters.'
#             }, status=400)
        
#         if not student.class_assigned:
#             return Response({
#                 'subjects': [],
#                 'chapters': [],
#                 'tests': [],
#                 'assignments': [],
#                 'doubts': []
#             })
        
#         results = {
#             'subjects': [],
#             'chapters': [],
#             'tests': [],
#             'assignments': [],
#             'doubts': []
#         }
        
#         # Search subjects
#         subjects = student.class_assigned.subject_set.filter(
#             name__icontains=query
#         )[:5]
        
#         for s in subjects:
#             results['subjects'].append({
#                 'id': s.id,
#                 'name': s.name,
#                 'type': 'subject'
#             })
        
#         # Search chapters
#         from admin_tasks.models import Chapter
#         chapters = Chapter.objects.filter(
#             class_assigned=student.class_assigned,
#             name__icontains=query
#         ).select_related('subject')[:5]
        
#         for c in chapters:
#             results['chapters'].append({
#                 'id': c.id,
#                 'name': c.name,
#                 'subject': c.subject.name,
#                 'type': 'chapter'
#             })
        
#         # Search tests
#         from teachers.models import Test
#         tests = Test.objects.filter(
#             chapter__class_assigned=student.class_assigned,
#             chapter__name__icontains=query
#         ).select_related('chapter__subject')[:5]
        
#         for t in tests:
#             results['tests'].append({
#                 'id': t.id,
#                 'chapter': t.chapter.name,
#                 'subject': t.chapter.subject.name,
#                 'marks': t.marks,
#                 'type': 'test'
#             })
        
#         # Search assignments
#         from teachers.models import Assignment
#         assignments = Assignment.objects.filter(
#             chapter__class_assigned=student.class_assigned,
#             description__icontains=query
#         ).select_related('chapter__subject', 'teacher')[:5]
        
#         for a in assignments:
#             results['assignments'].append({
#                 'id': a.id,
#                 'description': a.description[:100],
#                 'subject': a.chapter.subject.name,
#                 'teacher': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
#                 'type': 'assignment'
#             })
        
#         # Search doubts
#         doubts = Doubt.objects.filter(
#             student__class_assigned=student.class_assigned,
#             text__icontains=query
#         ).select_related('subject', 'student')[:5]
        
#         for d in doubts:
#             results['doubts'].append({
#                 'id': d.id,
#                 'text': d.text[:100],
#                 'subject': d.subject.name,
#                 'student': f'{d.student.first_name} {d.student.last_name}'.strip(),
#                 'type': 'doubt'
#             })
        
#         return Response(results)















