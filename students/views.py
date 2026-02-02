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
    """Student dashboard/home"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get subjects for student's class
        subjects = student.class_assigned.subject_set.all()
        
        subjects_data = []
        for subject in subjects:
            # Get chapters
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
            
            subjects_data.append({
                'id': subject.id,
                'name': subject.name,
                'total_chapters': chapters.count(),
                'completed_chapters': chapters.filter(is_completed=True).count(),
                'total_tests': tests_count,
                'attempted_tests': attempted_count
            })
        
        # Get stats
        stats = {
            'total_tests_attempted': TestAttempt.objects.filter(student=student).count(),
            'total_fees_paid': str(
                FeePayment.objects.filter(student=student).aggregate(
                    total=Count('id')
                )['total'] or 0
            ),
            'unread_notifications': Notification.objects.filter(user=student).count()
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
            'stats': stats
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

class StudentSearchView(APIView):
    """Search for student's content"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        query = request.GET.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response({
                'error': 'Search query must be at least 2 characters.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
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
        subjects = student.class_assigned.subject_set.filter(name__icontains=query)[:5]
        results['subjects'] = [
            {'id': s.id, 'name': s.name}
            for s in subjects
        ]
        
        # Search chapters
        chapters = Chapter.objects.filter(
            class_assigned=student.class_assigned,
            name__icontains=query
        )[:5]
        results['chapters'] = [
            {'id': c.id, 'name': c.name, 'subject': c.subject.name}
            for c in chapters
        ]
        
        # Search tests
        tests = Test.objects.filter(
            chapter__class_assigned=student.class_assigned,
            chapter__name__icontains=query
        ).select_related('chapter__subject')[:5]
        results['tests'] = [
            {
                'id': t.id,
                'chapter': t.chapter.name,
                'subject': t.chapter.subject.name,
                'marks': t.marks
            }
            for t in tests
        ]
        
        # Search assignments
        assignments = Assignment.objects.filter(
            chapter__class_assigned=student.class_assigned,
            description__icontains=query
        ).select_related('chapter__subject')[:5]
        results['assignments'] = [
            {
                'id': a.id,
                'description': a.description[:100],
                'subject': a.chapter.subject.name
            }
            for a in assignments
        ]
        
        # Search doubts
        doubts = Doubt.objects.filter(
            student__class_assigned=student.class_assigned,
            text__icontains=query
        ).select_related('subject')[:5]
        results['doubts'] = [
            {
                'id': d.id,
                'text': d.text[:100],
                'subject': d.subject.name
            }
            for d in doubts
        ]
        
        return Response(results)




















# # teachers/views.py - Part 2
# # Add this to the end of teachers/views.py Part 1

# # ═══════════════════════════════════════════════════════════
# #  ATTENDANCE MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class AttendanceMarkView(APIView):
#     """Mark attendance for students"""
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         class_id = request.data.get('class_id')
#         subject_id = request.data.get('subject_id')
#         date_str = request.data.get('date')  # YYYY-MM-DD
#         student_ids = request.data.get('student_ids', [])  # List of present student IDs
        
#         try:
#             # Verify teacher assignment
#             assignment = TeacherAssignment.objects.get(
#                 teacher=request.user,
#                 class_assigned_id=class_id,
#                 subject_id=subject_id
#             )
            
#             # Parse date
#             attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            
#             # Get all students in class
#             all_students = CustomUser.objects.filter(
#                 role='student',
#                 class_assigned_id=class_id,
#                 is_approved=True
#             )
            
#             marked_count = 0
#             for student in all_students:
#                 # Check if already marked
#                 attendance, created = Attendance.objects.get_or_create(
#                     teacher=request.user,
#                     student=student,
#                     class_assigned_id=class_id,
#                     subject_id=subject_id,
#                     date=attendance_date,
#                     defaults={
#                         'is_present': student.id in student_ids
#                     }
#                 )
                
#                 if not created:
#                     # Update if already exists
#                     attendance.is_present = student.id in student_ids
#                     attendance.save()
                
#                 marked_count += 1
            
#             return Response({
#                 'message': f'Attendance marked for {marked_count} students!',
#                 'date': date_str,
#                 'present_count': len(student_ids),
#                 'absent_count': marked_count - len(student_ids)
#             })
        
#         except TeacherAssignment.DoesNotExist:
#             return Response({
#                 'error': 'Not assigned to this class-subject.'
#             }, status=status.HTTP_403_FORBIDDEN)
#         except ValueError:
#             return Response({
#                 'error': 'Invalid date format. Use YYYY-MM-DD.'
#             }, status=status.HTTP_400_BAD_REQUEST)


# class AttendanceListView(APIView):
#     """Get attendance records"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         class_id = request.GET.get('class_id')
#         subject_id = request.GET.get('subject_id')
#         date_str = request.GET.get('date')
        
#         if not all([class_id, subject_id, date_str]):
#             return Response({
#                 'error': 'class_id, subject_id, and date required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             # Verify teacher assignment
#             TeacherAssignment.objects.get(
#                 teacher=request.user,
#                 class_assigned_id=class_id,
#                 subject_id=subject_id
#             )
            
#             attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            
#             # Get attendance records
#             records = Attendance.objects.filter(
#                 teacher=request.user,
#                 class_assigned_id=class_id,
#                 subject_id=subject_id,
#                 date=attendance_date
#             ).select_related('student')
            
#             attendance_data = [
#                 {
#                     'student': {
#                         'id': r.student.id,
#                         'name': f'{r.student.first_name} {r.student.last_name}'.strip(),
#                         'unique_id': r.student.unique_id
#                     },
#                     'is_present': r.is_present
#                 }
#                 for r in records
#             ]
            
#             return Response({
#                 'date': date_str,
#                 'class': class_id,
#                 'subject': subject_id,
#                 'attendance': attendance_data,
#                 'total_students': len(attendance_data),
#                 'present': sum(1 for a in attendance_data if a['is_present']),
#                 'absent': sum(1 for a in attendance_data if not a['is_present'])
#             })
        
#         except TeacherAssignment.DoesNotExist:
#             return Response({
#                 'error': 'Not assigned to this class-subject.'
#             }, status=status.HTTP_403_FORBIDDEN)
#         except ValueError:
#             return Response({
#                 'error': 'Invalid date format.'
#             }, status=status.HTTP_400_BAD_REQUEST)


# class StudentAttendanceHistoryView(APIView):
#     """Get attendance history for a student"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, student_id):
#         subject_id = request.GET.get('subject_id')
        
#         try:
#             student = CustomUser.objects.get(id=student_id, role='student')
            
#             # Get attendance records
#             records = Attendance.objects.filter(
#                 teacher=request.user,
#                 student=student
#             )
            
#             if subject_id:
#                 records = records.filter(subject_id=subject_id)
            
#             records = records.select_related('subject').order_by('-date')
            
#             attendance_data = [
#                 {
#                     'date': r.date,
#                     'subject': r.subject.name,
#                     'is_present': r.is_present
#                 }
#                 for r in records
#             ]
            
#             # Calculate statistics
#             total = len(attendance_data)
#             present = sum(1 for a in attendance_data if a['is_present'])
            
#             return Response({
#                 'student': {
#                     'id': student.id,
#                     'name': f'{student.first_name} {student.last_name}'.strip(),
#                     'unique_id': student.unique_id
#                 },
#                 'statistics': {
#                     'total_classes': total,
#                     'present': present,
#                     'absent': total - present,
#                     'attendance_percentage': round((present / total * 100), 2) if total > 0 else 0
#                 },
#                 'records': attendance_data
#             })
        
#         except CustomUser.DoesNotExist:
#             return Response({
#                 'error': 'Student not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  ASSIGNMENT MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class AssignmentCreateView(APIView):
#     """Create homework/assignment"""
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         chapter_id = request.data.get('chapter_id')
#         description = request.data.get('description', '').strip()
#         file = request.FILES.get('file')
        
#         if not description:
#             return Response({
#                 'error': 'Description is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             chapter = Chapter.objects.get(id=chapter_id)
            
#             # Verify teacher assignment
#             if not TeacherAssignment.objects.filter(
#                 teacher=request.user,
#                 class_assigned=chapter.class_assigned,
#                 subject=chapter.subject
#             ).exists():
#                 return Response({
#                     'error': 'Not authorized for this chapter.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             assignment = Assignment.objects.create(
#                 teacher=request.user,
#                 chapter=chapter,
#                 description=description,
#                 file=file
#             )
            
#             return Response({
#                 'message': 'Assignment created successfully!',
#                 'assignment': {
#                     'id': assignment.id,
#                     'chapter': chapter.name,
#                     'description': description,
#                     'has_file': bool(file)
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except Chapter.DoesNotExist:
#             return Response({
#                 'error': 'Chapter not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class AssignmentListView(APIView):
#     """Get all assignments created by teacher"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         chapter_id = request.GET.get('chapter_id')
        
#         assignments = Assignment.objects.filter(teacher=request.user)
        
#         if chapter_id:
#             assignments = assignments.filter(chapter_id=chapter_id)
        
#         assignments = assignments.select_related(
#             'chapter__subject',
#             'chapter__class_assigned'
#         )
        
#         assignments_data = [
#             {
#                 'id': a.id,
#                 'description': a.description,
#                 'chapter': {
#                     'id': a.chapter.id,
#                     'name': a.chapter.name,
#                     'subject': a.chapter.subject.name,
#                     'class': a.chapter.class_assigned.name
#                 },
#                 'file_url': request.build_absolute_uri(a.file.url) if a.file else None
#             }
#             for a in assignments
#         ]
        
#         return Response(assignments_data)


# class AssignmentDetailView(APIView):
#     """Get assignment details"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, assignment_id):
#         try:
#             assignment = Assignment.objects.select_related(
#                 'teacher',
#                 'chapter__subject',
#                 'chapter__class_assigned'
#             ).get(id=assignment_id)
            
#             # Check permission (teacher who created or student in that class)
#             if request.user.role == 'teacher':
#                 if assignment.teacher != request.user:
#                     return Response({
#                         'error': 'Not authorized.'
#                     }, status=status.HTTP_403_FORBIDDEN)
#             elif request.user.role == 'student':
#                 if request.user.class_assigned != assignment.chapter.class_assigned:
#                     return Response({
#                         'error': 'Not authorized.'
#                     }, status=status.HTTP_403_FORBIDDEN)
            
#             return Response({
#                 'id': assignment.id,
#                 'description': assignment.description,
#                 'chapter': {
#                     'id': assignment.chapter.id,
#                     'name': assignment.chapter.name,
#                     'subject': assignment.chapter.subject.name,
#                     'class': assignment.chapter.class_assigned.name
#                 },
#                 'teacher': f'{assignment.teacher.first_name} {assignment.teacher.last_name}'.strip(),
#                 'file_url': request.build_absolute_uri(assignment.file.url) if assignment.file else None
#             })
        
#         except Assignment.DoesNotExist:
#             return Response({
#                 'error': 'Assignment not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  DOUBT MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class DoubtListView(APIView):
#     """Get doubts (teacher sees all for their subjects, student sees all in their class)"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         subject_id = request.GET.get('subject_id')
        
#         if request.user.role == 'teacher':
#             # Get doubts for teacher's subjects
#             if subject_id:
#                 doubts = Doubt.objects.filter(subject_id=subject_id)
#             else:
#                 doubts = Doubt.objects.filter(subject__in=request.user.subjects.all())
        
#         elif request.user.role == 'student':
#             # Get doubts from student's class
#             if not request.user.class_assigned:
#                 return Response([])
            
#             if subject_id:
#                 doubts = Doubt.objects.filter(
#                     subject_id=subject_id,
#                     student__class_assigned=request.user.class_assigned
#                 )
#             else:
#                 doubts = Doubt.objects.filter(
#                     student__class_assigned=request.user.class_assigned
#                 )
        
#         else:
#             return Response({
#                 'error': 'Invalid user role.'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         doubts = doubts.select_related('student', 'subject').prefetch_related('doubtreply_set')
        
#         doubts_data = [
#             {
#                 'id': d.id,
#                 'student': {
#                     'id': d.student.id,
#                     'name': f'{d.student.first_name} {d.student.last_name}'.strip(),
#                     'unique_id': d.student.unique_id
#                 },
#                 'subject': {
#                     'id': d.subject.id,
#                     'name': d.subject.name
#                 },
#                 'text': d.text,
#                 'image_url': request.build_absolute_uri(d.image.url) if d.image else None,
#                 'created_at': d.created_at,
#                 'replies_count': d.doubtreply_set.count()
#             }
#             for d in doubts.order_by('-created_at')
#         ]
        
#         return Response(doubts_data)


# class DoubtDetailView(APIView):
#     """Get doubt with all replies"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, doubt_id):
#         try:
#             doubt = Doubt.objects.select_related('student', 'subject').get(id=doubt_id)
            
#             # Get replies
#             replies = DoubtReply.objects.filter(doubt=doubt).select_related('user')
            
#             replies_data = [
#                 {
#                     'id': r.id,
#                     'user': {
#                         'id': r.user.id,
#                         'name': f'{r.user.first_name} {r.user.last_name}'.strip(),
#                         'role': r.user.role,
#                         'unique_id': r.user.unique_id
#                     },
#                     'text': r.text,
#                     'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
#                     'created_at': r.created_at
#                 }
#                 for r in replies.order_by('created_at')
#             ]
            
#             return Response({
#                 'id': doubt.id,
#                 'student': {
#                     'id': doubt.student.id,
#                     'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(),
#                     'unique_id': doubt.student.unique_id
#                 },
#                 'subject': {
#                     'id': doubt.subject.id,
#                     'name': doubt.subject.name
#                 },
#                 'text': doubt.text,
#                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
#                 'created_at': doubt.created_at,
#                 'replies': replies_data
#             })
        
#         except Doubt.DoesNotExist:
#             return Response({
#                 'error': 'Doubt not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class DoubtReplyCreateView(APIView):
#     """Reply to a doubt"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, doubt_id):
#         text = request.data.get('text', '').strip()
#         image = request.FILES.get('image')
        
#         if not text and not image:
#             return Response({
#                 'error': 'Provide text or image.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             doubt = Doubt.objects.get(id=doubt_id)
            
#             # Check permission (same class for students, or teacher of subject)
#             if request.user.role == 'student':
#                 if request.user.class_assigned != doubt.student.class_assigned:
#                     return Response({
#                         'error': 'Not authorized.'
#                     }, status=status.HTTP_403_FORBIDDEN)
#             elif request.user.role == 'teacher':
#                 if doubt.subject not in request.user.subjects.all():
#                     return Response({
#                         'error': 'Not authorized.'
#                     }, status=status.HTTP_403_FORBIDDEN)
            
#             reply = DoubtReply.objects.create(
#                 doubt=doubt,
#                 user=request.user,
#                 text=text,
#                 image=image
#             )
            
#             return Response({
#                 'message': 'Reply posted successfully!',
#                 'reply': {
#                     'id': reply.id,
#                     'text': text,
#                     'created_at': reply.created_at
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except Doubt.DoesNotExist:
#             return Response({
#                 'error': 'Doubt not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  SEARCH FUNCTIONALITY
# # ═══════════════════════════════════════════════════════════

# class TeacherSearchView(APIView):
#     """Search for teacher's content"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         query = request.GET.get('q', '').strip()
        
#         if not query or len(query) < 2:
#             return Response({
#                 'error': 'Search query must be at least 2 characters.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         results = {
#             'tests': [],
#             'assignments': [],
#             'chapters': [],
#             'students': []
#         }
        
#         # Search tests
#         tests = Test.objects.filter(
#             created_by=request.user,
#             chapter__name__icontains=query
#         ).select_related('chapter__subject', 'chapter__class_assigned')[:5]
        
#         for test in tests:
#             results['tests'].append({
#                 'id': test.id,
#                 'type': test.get_type_display(),
#                 'marks': test.marks,
#                 'chapter': test.chapter.name,
#                 'subject': test.chapter.subject.name
#             })
        
#         # Search assignments
#         assignments = Assignment.objects.filter(
#             teacher=request.user,
#             description__icontains=query
#         ).select_related('chapter')[:5]
        
#         for assignment in assignments:
#             results['assignments'].append({
#                 'id': assignment.id,
#                 'description': assignment.description[:100],
#                 'chapter': assignment.chapter.name
#             })
        
#         # Search chapters
#         teacher_assignments = TeacherAssignment.objects.filter(
#             teacher=request.user
#         ).values_list('subject', 'class_assigned')
        
#         for subject_id, class_id in teacher_assignments:
#             chapters = Chapter.objects.filter(
#                 subject_id=subject_id,
#                 class_assigned_id=class_id,
#                 name__icontains=query
#             )[:3]
            
#             for chapter in chapters:
#                 results['chapters'].append({
#                     'id': chapter.id,
#                     'name': chapter.name,
#                     'subject': chapter.subject.name
#                 })
        
#         # Search students
#         class_ids = TeacherAssignment.objects.filter(
#             teacher=request.user
#         ).values_list('class_assigned_id', flat=True)
        
#         students = CustomUser.objects.filter(
#             role='student',
#             class_assigned_id__in=class_ids,
#             is_approved=True
#         ).filter(
#             Q(first_name__icontains=query) |
#             Q(last_name__icontains=query) |
#             Q(unique_id__icontains=query)
#         )[:5]
        
#         for student in students:
#             results['students'].append({
#                 'id': student.id,
#                 'name': f'{student.first_name} {student.last_name}'.strip(),
#                 'unique_id': student.unique_id,
#                 'class': student.class_assigned.name if student.class_assigned else None
#             })
        
#         return Response(results)


# # ═══════════════════════════════════════════════════════════
# #  STUDENTS IN CLASS
# # ═══════════════════════════════════════════════════════════

# class ClassStudentsView(APIView):
#     """Get students in a class"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, class_id):
#         # Verify teacher teaches this class
#         if not TeacherAssignment.objects.filter(
#             teacher=request.user,
#             class_assigned_id=class_id
#         ).exists():
#             return Response({
#                 'error': 'Not assigned to this class.'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         students = CustomUser.objects.filter(
#             role='student',
#             class_assigned_id=class_id,
#             is_approved=True
#         )
        
#         students_data = [
#             {
#                 'id': s.id,
#                 'name': f'{s.first_name} {s.last_name}'.strip(),
#                 'unique_id': s.unique_id,
#                 'email': s.email,
#                 'phone': s.phone
#             }
#             for s in students
#         ]
        
#         return Response({
#             'class_id': class_id,
#             'total_students': len(students_data),
#             'students': students_data
#         })





















# # from django.shortcuts import render

# # # Create your views here.
# # # students/views.py
# # """
# # Professional DRF Views for Student Functionality
# # Built for EduVibe - Educational Platform
# # Version: 2.0 (2026)
# # Features: Test Taking, Results, Doubt Posting, Attendance Viewing
# # """

# # from rest_framework import generics, status, viewsets
# # from rest_framework.decorators import action, api_view, permission_classes
# # from rest_framework.response import Response
# # from rest_framework.permissions import IsAuthenticated
# # from rest_framework.views import APIView
# # from rest_framework.pagination import PageNumberPagination
# # from rest_framework.filters import SearchFilter, OrderingFilter
# # from django_filters.rest_framework import DjangoFilterBackend
# # from django.db.models import Q, Count, Avg, F, Sum, Max
# # from django.utils import timezone
# # from datetime import timedelta

# # from .models import StudentAnswer, TestAttempt
# # from teachers.models import Test, Question, Attendance, Assignment, Doubt, DoubtReply
# # from admin_tasks.models import Subject, Chapter
# # from users.models import CustomUser


# # # ═══════════════════════════════════════════════════════════
# # #  Custom Pagination
# # # ═══════════════════════════════════════════════════════════

# # class StandardPagination(PageNumberPagination):
# #     """Standard pagination with 20 items per page"""
# #     page_size = 20
# #     page_size_query_param = 'page_size'
# #     max_page_size = 100


# # # ═══════════════════════════════════════════════════════════
# # #  Custom Permissions
# # # ═══════════════════════════════════════════════════════════

# # class IsStudentOrAdmin(IsAuthenticated):
# #     """Permission for students and admins"""
# #     def has_permission(self, request, view):
# #         return (
# #             super().has_permission(request, view) and
# #             request.user.role in ['student', 'admin']
# #         )


# # class IsStudentOwner(IsAuthenticated):
# #     """Permission for student who owns the resource"""
# #     def has_object_permission(self, request, view, obj):
# #         if request.user.role == 'admin':
# #             return True
        
# #         # Check if student owns the resource
# #         if hasattr(obj, 'student'):
# #             return obj.student == request.user
        
# #         return False


# # # ═══════════════════════════════════════════════════════════
# # #  Serializers (Basic inline versions - ideally import from serializers.py)
# # # ═══════════════════════════════════════════════════════════

# # from rest_framework import serializers

# # class TestAttemptListSerializer(serializers.ModelSerializer):
# #     """List view of test attempts"""
# #     test_type = serializers.CharField(source='test.type', read_only=True)
# #     test_marks = serializers.IntegerField(source='test.marks', read_only=True)
# #     chapter_name = serializers.CharField(source='test.chapter.name', read_only=True)
# #     subject_name = serializers.CharField(source='test.chapter.subject.name', read_only=True)
# #     percentage = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = TestAttempt
# #         fields = [
# #             'id', 'test', 'test_type', 'test_marks', 'chapter_name',
# #             'subject_name', 'score', 'percentage', 'attempted_at'
# #         ]
    
# #     def get_percentage(self, obj):
# #         if obj.test.marks > 0:
# #             return round((obj.score / obj.test.marks) * 100, 2)
# #         return 0


# # class StudentAnswerSerializer(serializers.ModelSerializer):
# #     """Student answer serializer"""
# #     question_text = serializers.CharField(source='question.question_text', read_only=True)
# #     correct_option = serializers.IntegerField(source='question.correct_option', read_only=True)
# #     is_correct = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = StudentAnswer
# #         fields = [
# #             'id', 'question', 'question_text', 'selected_option',
# #             'descriptive_answer', 'correct_option', 'is_correct'
# #         ]
    
# #     def get_is_correct(self, obj):
# #         if obj.selected_option and obj.question.correct_option:
# #             return obj.selected_option == obj.question.correct_option
# #         return None


# # class TestAttemptDetailSerializer(serializers.ModelSerializer):
# #     """Detailed test attempt with answers"""
# #     test_info = serializers.SerializerMethodField()
# #     answers = serializers.SerializerMethodField()
# #     percentage = serializers.SerializerMethodField()
# #     grade = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = TestAttempt
# #         fields = [
# #             'id', 'test_info', 'score', 'percentage', 'grade',
# #             'attempted_at', 'answers'
# #         ]
    
# #     def get_test_info(self, obj):
# #         return {
# #             'id': obj.test.id,
# #             'type': obj.test.type,
# #             'marks': obj.test.marks,
# #             'chapter': obj.test.chapter.name if obj.test.chapter else None,
# #             'subject': obj.test.chapter.subject.name if obj.test.chapter else None
# #         }
    
# #     def get_answers(self, obj):
# #         answers = StudentAnswer.objects.filter(
# #             student=obj.student,
# #             question__test=obj.test
# #         ).select_related('question')
# #         return StudentAnswerSerializer(answers, many=True).data
    
# #     def get_percentage(self, obj):
# #         if obj.test.marks > 0:
# #             return round((obj.score / obj.test.marks) * 100, 2)
# #         return 0
    
# #     def get_grade(self, obj):
# #         percentage = self.get_percentage(obj)
# #         if percentage >= 90:
# #             return 'A+'
# #         elif percentage >= 80:
# #             return 'A'
# #         elif percentage >= 70:
# #             return 'B+'
# #         elif percentage >= 60:
# #             return 'B'
# #         elif percentage >= 50:
# #             return 'C'
# #         elif percentage >= 40:
# #             return 'D'
# #         else:
# #             return 'F'


# # class AvailableTestSerializer(serializers.ModelSerializer):
# #     """Serializer for available tests"""
# #     chapter_name = serializers.CharField(source='chapter.name', read_only=True)
# #     subject_name = serializers.CharField(source='chapter.subject.name', read_only=True)
# #     class_name = serializers.CharField(source='chapter.class_assigned.name', read_only=True)
# #     question_count = serializers.SerializerMethodField()
# #     is_attempted = serializers.SerializerMethodField()
    
# #     class Meta:
# #         model = Test
# #         fields = [
# #             'id', 'type', 'chapter_name', 'subject_name', 'class_name',
# #             'marks', 'question_count', 'is_attempted'
# #         ]
    
# #     def get_question_count(self, obj):
# #         return obj.question_set.count()
    
# #     def get_is_attempted(self, obj):
# #         request = self.context.get('request')
# #         if request and request.user.is_authenticated:
# #             return TestAttempt.objects.filter(
# #                 student=request.user,
# #                 test=obj
# #             ).exists()
# #         return False


# # # ═══════════════════════════════════════════════════════════
# # #  Test Attempt Views
# # # ═══════════════════════════════════════════════════════════

# # class AvailableTestsView(APIView):
# #     """
# #     Get available tests for student based on their class.
    
# #     GET /api/students/available-tests/
# #     """
# #     permission_classes = [IsStudentOrAdmin]
    
# #     def get(self, request):
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can access this endpoint.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         if not request.user.class_assigned:
# #             return Response({
# #                 'success': False,
# #                 'message': 'You are not assigned to any class.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Get tests for student's class
# #         tests = Test.objects.filter(
# #             chapter__class_assigned=request.user.class_assigned
# #         ).select_related(
# #             'chapter', 'chapter__subject', 'chapter__class_assigned'
# #         ).prefetch_related('question_set')
        
# #         # Filter by subject if provided
# #         subject_id = request.query_params.get('subject')
# #         if subject_id:
# #             tests = tests.filter(chapter__subject_id=subject_id)
        
# #         # Filter by test type
# #         test_type = request.query_params.get('type')
# #         if test_type:
# #             tests = tests.filter(type=test_type)
        
# #         # Filter by attempted status
# #         attempted = request.query_params.get('attempted')
# #         if attempted == 'true':
# #             attempted_test_ids = TestAttempt.objects.filter(
# #                 student=request.user
# #             ).values_list('test_id', flat=True)
# #             tests = tests.filter(id__in=attempted_test_ids)
# #         elif attempted == 'false':
# #             attempted_test_ids = TestAttempt.objects.filter(
# #                 student=request.user
# #             ).values_list('test_id', flat=True)
# #             tests = tests.exclude(id__in=attempted_test_ids)
        
# #         serializer = AvailableTestSerializer(
# #             tests,
# #             many=True,
# #             context={'request': request}
# #         )
        
# #         return Response({
# #             'success': True,
# #             'count': tests.count(),
# #             'tests': serializer.data
# #         })


# # class StartTestView(APIView):
# #     """
# #     Get test questions to start attempting.
    
# #     GET /api/students/start-test/{test_id}/
# #     """
# #     permission_classes = [IsStudentOrAdmin]
    
# #     def get(self, request, test_id):
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can attempt tests.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         try:
# #             test = Test.objects.get(id=test_id)
# #         except Test.DoesNotExist:
# #             return Response({
# #                 'success': False,
# #                 'message': 'Test not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)
        
# #         # Verify student is in correct class
# #         if test.chapter and test.chapter.class_assigned != request.user.class_assigned:
# #             return Response({
# #                 'success': False,
# #                 'message': 'This test is not for your class.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         # Get questions (without answers for MCQ)
# #         questions = test.question_set.all()
        
# #         questions_data = []
# #         for question in questions:
# #             q_data = {
# #                 'id': question.id,
# #                 'question_text': question.question_text,
# #                 'question_image': request.build_absolute_uri(
# #                     question.question_image.url
# #                 ) if question.question_image else None,
# #             }
            
# #             if test.type == 'mcq':
# #                 q_data.update({
# #                     'option1': question.option1,
# #                     'option2': question.option2,
# #                     'option3': question.option3,
# #                     'option4': question.option4,
# #                 })
            
# #             questions_data.append(q_data)
        
# #         return Response({
# #             'success': True,
# #             'test': {
# #                 'id': test.id,
# #                 'type': test.type,
# #                 'marks': test.marks,
# #                 'chapter': test.chapter.name if test.chapter else None,
# #                 'subject': test.chapter.subject.name if test.chapter else None,
# #                 'total_questions': len(questions_data)
# #             },
# #             'questions': questions_data
# #         })


# # class SubmitTestView(APIView):
# #     """
# #     Submit test answers and calculate score.
    
# #     POST /api/students/submit-test/{test_id}/
# #     Body: {
# #         answers: [
# #             {question_id: int, selected_option: int OR descriptive_answer: str},
# #             ...
# #         ]
# #     }
# #     """
# #     permission_classes = [IsStudentOrAdmin]
    
# #     def post(self, request, test_id):
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can submit tests.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         try:
# #             test = Test.objects.get(id=test_id)
# #         except Test.DoesNotExist:
# #             return Response({
# #                 'success': False,
# #                 'message': 'Test not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)
        
# #         # Check if already attempted
# #         if TestAttempt.objects.filter(student=request.user, test=test).exists():
# #             return Response({
# #                 'success': False,
# #                 'message': 'You have already attempted this test.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         answers_data = request.data.get('answers', [])
        
# #         if not answers_data:
# #             return Response({
# #                 'success': False,
# #                 'message': 'No answers provided.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Save answers and calculate score (only for MCQ)
# #         score = 0
# #         total_questions = test.question_set.count()
# #         marks_per_question = test.marks / total_questions if total_questions > 0 else 0
        
# #         for answer_data in answers_data:
# #             question_id = answer_data.get('question_id')
            
# #             try:
# #                 question = Question.objects.get(id=question_id, test=test)
# #             except Question.DoesNotExist:
# #                 continue
            
# #             # Create student answer
# #             student_answer = StudentAnswer.objects.create(
# #                 student=request.user,
# #                 question=question,
# #                 selected_option=answer_data.get('selected_option'),
# #                 descriptive_answer=answer_data.get('descriptive_answer', '')
# #             )
            
# #             # Calculate score for MCQ
# #             if test.type == 'mcq' and question.correct_option:
# #                 if student_answer.selected_option == question.correct_option:
# #                     score += marks_per_question
        
# #         # Round score
# #         score = round(score, 2)
        
# #         # Create test attempt
# #         test_attempt = TestAttempt.objects.create(
# #             student=request.user,
# #             test=test,
# #             score=score if test.type == 'mcq' else 0  # Descriptive needs manual grading
# #         )
        
# #         # Get detailed result
# #         result_serializer = TestAttemptDetailSerializer(test_attempt)
        
# #         return Response({
# #             'success': True,
# #             'message': 'Test submitted successfully.',
# #             'result': result_serializer.data,
# #             'requires_manual_grading': test.type == 'descriptive'
# #         }, status=status.HTTP_201_CREATED)


# # class TestAttemptViewSet(viewsets.ReadOnlyModelViewSet):
# #     """
# #     View test attempts and results.
    
# #     GET /api/students/test-attempts/           - List all attempts
# #     GET /api/students/test-attempts/{id}/      - Get attempt detail
    
# #     Custom Actions:
# #     - /api/students/test-attempts/my-results/  - Student's results
# #     - /api/students/test-attempts/statistics/  - Performance statistics
# #     """
# #     queryset = TestAttempt.objects.all()
# #     permission_classes = [IsAuthenticated]
# #     pagination_class = StandardPagination
# #     filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
# #     filterset_fields = ['test', 'test__type', 'test__chapter__subject']
# #     search_fields = ['test__chapter__name']
# #     ordering = ['-attempted_at']
    
# #     def get_serializer_class(self):
# #         """Return appropriate serializer"""
# #         if self.action == 'retrieve':
# #             return TestAttemptDetailSerializer
# #         return TestAttemptListSerializer
    
# #     def get_queryset(self):
# #         """Filter based on user role"""
# #         user = self.request.user
        
# #         if user.role == 'admin':
# #             return TestAttempt.objects.all().select_related(
# #                 'student', 'test', 'test__chapter', 'test__chapter__subject'
# #             )
# #         elif user.role == 'teacher':
# #             # Teachers see attempts for their tests
# #             return TestAttempt.objects.filter(
# #                 test__created_by=user
# #             ).select_related('student', 'test', 'test__chapter')
# #         else:
# #             # Students see only their attempts
# #             return TestAttempt.objects.filter(
# #                 student=user
# #             ).select_related('test', 'test__chapter', 'test__chapter__subject')
    
# #     @action(detail=False, methods=['get'])
# #     def my_results(self, request):
# #         """
# #         Get current student's test results.
        
# #         GET /api/students/test-attempts/my-results/
# #         """
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can access this endpoint.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         attempts = TestAttempt.objects.filter(
# #             student=request.user
# #         ).select_related('test', 'test__chapter', 'test__chapter__subject')
        
# #         # Filter by subject
# #         subject_id = request.query_params.get('subject')
# #         if subject_id:
# #             attempts = attempts.filter(test__chapter__subject_id=subject_id)
        
# #         serializer = TestAttemptListSerializer(attempts, many=True)
        
# #         return Response({
# #             'success': True,
# #             'count': attempts.count(),
# #             'results': serializer.data
# #         })
    
# #     @action(detail=False, methods=['get'])
# #     def statistics(self, request):
# #         """
# #         Get student's performance statistics.
        
# #         GET /api/students/test-attempts/statistics/
# #         """
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can access this endpoint.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         attempts = TestAttempt.objects.filter(student=request.user)
        
# #         if not attempts.exists():
# #             return Response({
# #                 'success': True,
# #                 'statistics': {
# #                     'total_tests': 0,
# #                     'average_score': 0,
# #                     'average_percentage': 0,
# #                     'highest_score': 0,
# #                     'lowest_score': 0,
# #                     'subject_wise_performance': []
# #                 }
# #             })
        
# #         # Overall statistics
# #         total_tests = attempts.count()
# #         scores = list(attempts.values_list('score', flat=True))
        
# #         # Calculate percentages
# #         percentages = []
# #         for attempt in attempts.select_related('test'):
# #             if attempt.test.marks > 0:
# #                 percentages.append((attempt.score / attempt.test.marks) * 100)
        
# #         avg_percentage = sum(percentages) / len(percentages) if percentages else 0
        
# #         # Subject-wise performance
# #         subject_performance = []
# #         subjects = Subject.objects.filter(
# #             chapter__test__testattempt__student=request.user
# #         ).distinct()
        
# #         for subject in subjects:
# #             subject_attempts = attempts.filter(
# #                 test__chapter__subject=subject
# #             ).select_related('test')
            
# #             if subject_attempts.exists():
# #                 subject_percentages = [
# #                     (att.score / att.test.marks) * 100
# #                     for att in subject_attempts
# #                     if att.test.marks > 0
# #                 ]
                
# #                 subject_performance.append({
# #                     'subject': subject.name,
# #                     'tests_attempted': subject_attempts.count(),
# #                     'average_percentage': round(
# #                         sum(subject_percentages) / len(subject_percentages), 2
# #                     ) if subject_percentages else 0
# #                 })
        
# #         stats = {
# #             'total_tests': total_tests,
# #             'average_score': round(sum(scores) / len(scores), 2),
# #             'average_percentage': round(avg_percentage, 2),
# #             'highest_score': max(scores),
# #             'lowest_score': min(scores),
# #             'subject_wise_performance': subject_performance
# #         }
        
# #         return Response({
# #             'success': True,
# #             'statistics': stats
# #         })


# # # ═══════════════════════════════════════════════════════════
# # #  Attendance Views
# # # ═══════════════════════════════════════════════════════════

# # class StudentAttendanceView(APIView):
# #     """
# #     Get student's attendance records.
    
# #     GET /api/students/attendance/
# #     """
# #     permission_classes = [IsStudentOrAdmin]
    
# #     def get(self, request):
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can access this endpoint.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         # Get attendance records
# #         attendance_records = Attendance.objects.filter(
# #             student=request.user
# #         ).select_related('teacher', 'class_assigned').order_by('-date', '-time')
        
# #         # Date range filter
# #         from_date = request.query_params.get('from')
# #         to_date = request.query_params.get('to')
        
# #         if from_date:
# #             attendance_records = attendance_records.filter(date__gte=from_date)
# #         if to_date:
# #             attendance_records = attendance_records.filter(date__lte=to_date)
        
# #         # Calculate statistics
# #         total = attendance_records.count()
# #         present = attendance_records.filter(is_present=True).count()
# #         absent = total - present
# #         percentage = (present / total * 100) if total > 0 else 0
        
# #         # Serialize records
# #         records_data = [{
# #             'id': record.id,
# #             'date': record.date,
# #             'time': record.time,
# #             'is_present': record.is_present,
# #             'marked_by': record.teacher.get_full_name(),
# #             'class': record.class_assigned.name
# #         } for record in attendance_records]
        
# #         return Response({
# #             'success': True,
# #             'summary': {
# #                 'total_days': total,
# #                 'present_days': present,
# #                 'absent_days': absent,
# #                 'attendance_percentage': round(percentage, 2)
# #             },
# #             'records': records_data
# #         })


# # # ═══════════════════════════════════════════════════════════
# # #  Assignment Views
# # # ═══════════════════════════════════════════════════════════

# # class StudentAssignmentsView(APIView):
# #     """
# #     Get assignments for student's class.
    
# #     GET /api/students/assignments/
# #     """
# #     permission_classes = [IsStudentOrAdmin]
    
# #     def get(self, request):
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can access this endpoint.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         if not request.user.class_assigned:
# #             return Response({
# #                 'success': False,
# #                 'message': 'You are not assigned to any class.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Get assignments for student's class
# #         assignments = Assignment.objects.filter(
# #             chapter__class_assigned=request.user.class_assigned
# #         ).select_related('teacher', 'chapter', 'chapter__subject')
        
# #         # Filter by subject
# #         subject_id = request.query_params.get('subject')
# #         if subject_id:
# #             assignments = assignments.filter(chapter__subject_id=subject_id)
        
# #         assignments_data = [{
# #             'id': assignment.id,
# #             'chapter': assignment.chapter.name,
# #             'subject': assignment.chapter.subject.name,
# #             'description': assignment.description,
# #             'file': request.build_absolute_uri(
# #                 assignment.file.url
# #             ) if assignment.file else None,
# #             'teacher': assignment.teacher.get_full_name()
# #         } for assignment in assignments]
        
# #         return Response({
# #             'success': True,
# #             'count': assignments.count(),
# #             'assignments': assignments_data
# #         })


# # # ═══════════════════════════════════════════════════════════
# # #  Doubt/Question Forum Views
# # # ═══════════════════════════════════════════════════════════

# # class StudentDoubtViewSet(viewsets.ModelViewSet):
# #     """
# #     Student doubt management.
    
# #     GET    /api/students/doubts/               - List my doubts
# #     POST   /api/students/doubts/               - Post new doubt
# #     GET    /api/students/doubts/{id}/          - Get doubt detail
# #     PUT    /api/students/doubts/{id}/          - Update doubt
# #     DELETE /api/students/doubts/{id}/          - Delete doubt
    
# #     Custom Actions:
# #     - /api/students/doubts/by-subject/         - Filter by subject
# #     """
# #     queryset = Doubt.objects.all()
# #     permission_classes = [IsStudentOrAdmin]
# #     pagination_class = StandardPagination
# #     filter_backends = [DjangoFilterBackend, OrderingFilter]
# #     filterset_fields = ['subject']
# #     ordering = ['-created_at']
    
# #     def get_queryset(self):
# #         """Students see only their doubts"""
# #         user = self.request.user
        
# #         if user.role == 'admin':
# #             return Doubt.objects.all().select_related(
# #                 'student', 'subject'
# #             ).prefetch_related('doubtreply_set__user')
# #         else:
# #             return Doubt.objects.filter(
# #                 student=user
# #             ).select_related('subject').prefetch_related('doubtreply_set__user')
    
# #     def perform_create(self, serializer):
# #         """Set student when creating doubt"""
# #         serializer.save(student=self.request.user)
    
# #     def create(self, request, *args, **kwargs):
# #         """Create a new doubt"""
# #         if request.user.role != 'student':
# #             return Response({
# #                 'success': False,
# #                 'message': 'Only students can post doubts.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         return super().create(request, *args, **kwargs)
    
# #     def list(self, request, *args, **kwargs):
# #         """List student's doubts"""
# #         queryset = self.filter_queryset(self.get_queryset())
# #         page = self.paginate_queryset(queryset)
        
# #         if page is not None:
# #             doubts_data = self._serialize_doubts(page, request)
# #             return self.get_paginated_response(doubts_data)
        
# #         doubts_data = self._serialize_doubts(queryset, request)
# #         return Response({
# #             'success': True,
# #             'count': queryset.count(),
# #             'doubts': doubts_data
# #         })
    
# #     def retrieve(self, request, *args, **kwargs):
# #         """Get doubt detail with replies"""
# #         doubt = self.get_object()
        
# #         # Get replies
# #         replies = doubt.doubtreply_set.all().select_related('user')
        
# #         doubt_data = {
# #             'id': doubt.id,
# #             'subject': doubt.subject.name,
# #             'text': doubt.text,
# #             'image': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #             'created_at': doubt.created_at,
# #             'student': doubt.student.get_full_name(),
# #             'replies': [{
# #                 'id': reply.id,
# #                 'text': reply.text,
# #                 'image': request.build_absolute_uri(reply.image.url) if reply.image else None,
# #                 'user': reply.user.get_full_name(),
# #                 'user_role': reply.user.role,
# #                 'created_at': reply.created_at
# #             } for reply in replies]
# #         }
        
# #         return Response({
# #             'success': True,
# #             'doubt': doubt_data
# #         })
    
# #     def _serialize_doubts(self, doubts, request):
# #         """Helper to serialize doubts"""
# #         return [{
# #             'id': doubt.id,
# #             'subject': doubt.subject.name,
# #             'text': doubt.text[:100] + '...' if len(doubt.text) > 100 else doubt.text,
# #             'has_image': bool(doubt.image),
# #             'created_at': doubt.created_at,
# #             'reply_count': doubt.doubtreply_set.count(),
# #             'is_answered': doubt.doubtreply_set.exists()
# #         } for doubt in doubts]


# # # ═══════════════════════════════════════════════════════════
# # #  Dashboard Views
# # # ═══════════════════════════════════════════════════════════

# # @api_view(['GET'])
# # @permission_classes([IsStudentOrAdmin])
# # def student_dashboard(request):
# #     """
# #     Get student dashboard with overview.
    
# #     GET /api/students/dashboard/
# #     """
# #     if request.user.role != 'student':
# #         return Response({
# #             'success': False,
# #             'message': 'Only students can access this endpoint.'
# #         }, status=status.HTTP_403_FORBIDDEN)
    
# #     student = request.user
    
# #     # Test statistics
# #     test_attempts = TestAttempt.objects.filter(student=student)
# #     total_tests = test_attempts.count()
    
# #     if total_tests > 0:
# #         avg_score = test_attempts.aggregate(avg=Avg('score'))['avg'] or 0
# #         percentages = [
# #             (att.score / att.test.marks) * 100
# #             for att in test_attempts.select_related('test')
# #             if att.test.marks > 0
# #         ]
# #         avg_percentage = sum(percentages) / len(percentages) if percentages else 0
# #     else:
# #         avg_score = 0
# #         avg_percentage = 0
    
# #     # Attendance statistics
# #     attendance = Attendance.objects.filter(student=student)
# #     total_days = attendance.count()
# #     present_days = attendance.filter(is_present=True).count()
# #     attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
    
# #     # Doubt statistics
# #     doubts = Doubt.objects.filter(student=student)
# #     answered_doubts = doubts.filter(doubtreply__isnull=False).distinct().count()
    
# #     # Recent activities
# #     recent_tests = test_attempts.select_related(
# #         'test', 'test__chapter'
# #     ).order_by('-attempted_at')[:5]
    
# #     recent_doubts = doubts.select_related('subject').order_by('-created_at')[:5]
    
# #     dashboard_data = {
# #         'student': {
# #             'id': student.id,
# #             'name': student.get_full_name(),
# #             'email': student.email,
# #             'class': student.class_assigned.name if student.class_assigned else None
# #         },
# #         'statistics': {
# #             'total_tests_attempted': total_tests,
# #             'average_score': round(avg_score, 2),
# #             'average_percentage': round(avg_percentage, 2),
# #             'attendance_percentage': round(attendance_percentage, 2),
# #             'total_doubts': doubts.count(),
# #             'answered_doubts': answered_doubts
# #         },
# #         'recent_tests': TestAttemptListSerializer(recent_tests, many=True).data,
# #         'recent_doubts': [{
# #             'id': doubt.id,
# #             'subject': doubt.subject.name,
# #             'text': doubt.text[:50] + '...' if len(doubt.text) > 50 else doubt.text,
# #             'created_at': doubt.created_at,
# #             'is_answered': doubt.doubtreply_set.exists()
# #         } for doubt in recent_doubts]
# #     }
    
# #     return Response({
# #         'success': True,
# #         'dashboard': dashboard_data
# #     })


# # # ═══════════════════════════════════════════════════════════
# # #  Utility Views
# # # ═══════════════════════════════════════════════════════════

# # @api_view(['GET'])
# # @permission_classes([IsAuthenticated])
# # def health_check(request):
# #     """
# #     Health check endpoint.
    
# #     GET /api/students/health/
# #     """
# #     return Response({
# #         'status': 'healthy',
# #         'service': 'EduVibe Student Service',
# #         'version': '2.0',
# #         'timestamp': timezone.now()
# #     })