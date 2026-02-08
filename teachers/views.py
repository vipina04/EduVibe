# teachers/views.py
"""
Complete Teacher Module Views
EduVibe Platform - 2026
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import date

from users.models import CustomUser
from admin_tasks.models import Class, Subject, Chapter
from .models import (
    TeacherAssignment, Test, Question, Attendance,
    Assignment, Doubt, DoubtReply
)
from students.models import TestAttempt, StudentAnswer


# ═══════════════════════════════════════════════════════════
#  CUSTOM PERMISSION
# ═══════════════════════════════════════════════════════════

class IsTeacherRole(IsAuthenticated):
    """Only allow teachers"""
    
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'teacher'
        )


# ═══════════════════════════════════════════════════════════
#  TEACHER HOME & DASHBOARD
# ═══════════════════════════════════════════════════════════

class TeacherHomeView(APIView):
    """Teacher dashboard/home with comprehensive real data"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        from django.db.models import Sum
        from students.models import AssignmentSubmission
        
        teacher = request.user
        
        # Get teacher's assignments (classes and subjects they teach)
        teacher_assignments = TeacherAssignment.objects.filter(
            teacher=teacher
        ).select_related('class_assigned', 'subject')
        
        # Collect all subjects taught
        subjects_taught = set()
        classes_taught = set()
        
        subjects_data = []
        for assignment in teacher_assignments:
            subjects_taught.add(assignment.subject.id)
            classes_taught.add(assignment.class_assigned.id)
        
        # Get detailed subject information
        for subject_id in subjects_taught:
            subject = Subject.objects.get(id=subject_id)
            
            # Get classes where this subject is taught by this teacher
            class_assignments = teacher_assignments.filter(subject=subject)
            total_students = 0
            
            for class_assignment in class_assignments:
                # Count students in this class
                students_in_class = CustomUser.objects.filter(
                    role='student',
                    class_assigned=class_assignment.class_assigned
                ).count()
                total_students += students_in_class
            
            # Get chapters for this subject
            chapters = Chapter.objects.filter(subject=subject)
            
            subjects_data.append({
                'id': subject.id,
                'name': subject.name,
                'class_name': ', '.join([ca.class_assigned.name for ca in class_assignments]),
                'class_id': class_assignments.first().class_assigned.id if class_assignments.exists() else None,
                'total_students': total_students,
                'total_classes': class_assignments.count(),
                'next_class': None,  # Can be expanded with schedule
            })
        
        # Calculate comprehensive stats
        
        # 1. Total unique subjects
        total_subjects = len(subjects_taught)
        
        # 2. Total students across all classes
        total_students = 0
        for class_id in classes_taught:
            class_obj = Class.objects.get(id=class_id)
            student_count = CustomUser.objects.filter(
                role='student',
                class_assigned=class_obj
            ).count()
            total_students += student_count
        
        # 3. Total classes taught
        total_classes = len(classes_taught)
        
        # 4. Total chapters created
        all_subjects_queryset = Subject.objects.filter(id__in=subjects_taught)
        total_chapters = Chapter.objects.filter(subject__in=all_subjects_queryset).count()
        
        # 5. Total tests created
        total_tests = Test.objects.filter(created_by=teacher).count()
        
        # 6. Pending doubts (doubts without replies)
        all_doubts = Doubt.objects.filter(subject__in=all_subjects_queryset)
        pending_doubts = 0
        for doubt in all_doubts:
            if doubt.doubtreply_set.count() == 0:
                pending_doubts += 1
        
        # 7. Answered doubts
        answered_doubts = DoubtReply.objects.filter(user=teacher).values('doubt').distinct().count()
        
        # 8. Pending assignments to grade
        teacher_created_assignments = Assignment.objects.filter(teacher=teacher)
        pending_grading = 0
        
        for assignment in teacher_created_assignments:
            ungraded_count = AssignmentSubmission.objects.filter(
                assignment=assignment,
                grade__isnull=True
            ).count()
            pending_grading += ungraded_count
        
        # 9. Today's classes (placeholder - needs schedule model)
        classes_today = 0
        
        # 10. Recent test results summary
        recent_tests = Test.objects.filter(
            created_by=teacher
        ).select_related('chapter').order_by('-created_at')[:5]
        
        recent_tests_data = []
        for test in recent_tests:
            attempts = test.attempts.all()
            avg_score = attempts.aggregate(avg=Avg('score'))['avg'] or 0
            
            recent_tests_data.append({
                'id': test.id,
                'name': f"{test.chapter.name} Test" if test.chapter else "Test",
                'chapter_name': test.chapter.name if test.chapter else "General",
                'total_attempts': attempts.count(),
                'average_score': round(avg_score, 2),
                'created_at': test.created_at.strftime('%Y-%m-%d') if hasattr(test, 'created_at') else '',
            })
        
        # Comprehensive stats object
        stats = {
            'total_subjects': total_subjects,
            'total_students': total_students,
            'total_classes': total_classes,
            'total_chapters': total_chapters,
            'total_tests': total_tests,
            'pending_doubts': pending_doubts,
            'answered_doubts': answered_doubts,
            'pending_grading': pending_grading,
            'classes_today': classes_today,
        }
        
        return Response({
            'teacher': {
                'name': f'{teacher.first_name} {teacher.last_name}'.strip(),
                'unique_id': teacher.unique_id,
            },
            'subjects': subjects_data,
            'stats': stats,
            'recent_tests': recent_tests_data
        })


class TeacherSubjectClassesView(APIView):
    """Get classes where teacher teaches a subject"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, subject_id):
        teacher = request.user
        
        # Get assignments for this subject
        assignments = TeacherAssignment.objects.filter(
            teacher=teacher,
            subject_id=subject_id
        ).select_related('class_assigned', 'subject')
        
        if not assignments.exists():
            return Response({
                'error': 'Not assigned to teach this subject.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        subject = assignments.first().subject
        
        classes_data = []
        for assignment in assignments:
            # Get chapters
            chapters = Chapter.objects.filter(
                subject=subject,
                class_assigned=assignment.class_assigned
            )
            
            classes_data.append({
                'assignment_id': assignment.id,
                'class': {
                    'id': assignment.class_assigned.id,
                    'name': assignment.class_assigned.name
                },
                'total_chapters': chapters.count(),
                'completed_chapters': chapters.filter(is_completed=True).count(),
                'student_count': CustomUser.objects.filter(
                    role='student',
                    class_assigned=assignment.class_assigned,
                    is_approved=True
                ).count()
            })
        
        return Response({
            'subject': {
                'id': subject.id,
                'name': subject.name
            },
            'classes': classes_data
        })


# ═══════════════════════════════════════════════════════════
#  CHAPTER MANAGEMENT
# ═══════════════════════════════════════════════════════════

class TeacherChaptersView(APIView):
    """Get chapters for class-subject"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        class_id = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')
        
        if not class_id or not subject_id:
            return Response({
                'error': 'class_id and subject_id required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify teacher assignment
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_assigned_id=class_id,
            subject_id=subject_id
        ).exists():
            return Response({
                'error': 'Not assigned to this class-subject.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        chapters = Chapter.objects.filter(
            class_assigned_id=class_id,
            subject_id=subject_id
        )
        
        chapters_data = []
        for chapter in chapters:
            # Get tests count
            tests_count = Test.objects.filter(chapter=chapter).count()
            
            chapters_data.append({
                'id': chapter.id,
                'name': chapter.name,
                'is_completed': chapter.is_completed,
                'tests_count': tests_count
            })
        
        return Response(chapters_data)


class MarkChapterCompleteView(APIView):
    """Mark chapter as completed"""
    permission_classes = [IsTeacherRole]
    
    def post(self, request, chapter_id):
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            
            # Verify teacher assignment
            if not TeacherAssignment.objects.filter(
                teacher=request.user,
                class_assigned=chapter.class_assigned,
                subject=chapter.subject
            ).exists():
                return Response({
                    'error': 'Not authorized.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            chapter.is_completed = True
            chapter.save()
            
            return Response({
                'message': 'Chapter marked as completed!'
            })
        
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  TEST MANAGEMENT
# ═══════════════════════════════════════════════════════════

class TestListView(APIView):
    """Get all tests created by teacher"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        chapter_id = request.GET.get('chapter_id')
        
        tests = Test.objects.filter(created_by=request.user)
        
        if chapter_id:
            tests = tests.filter(chapter_id=chapter_id)
        
        tests = tests.select_related('chapter__subject', 'chapter__class_assigned')
        
        tests_data = []
        for test in tests:
            # Get questions count
            questions_count = Question.objects.filter(test=test).count()
            
            # Get attempts count
            attempts_count = TestAttempt.objects.filter(test=test).count()
            
            tests_data.append({
                'id': test.id,
                'type': test.type,
                'type_display': test.get_type_display(),
                'marks': test.marks,
                'chapter': {
                    'id': test.chapter.id,
                    'name': test.chapter.name,
                    'subject': test.chapter.subject.name,
                    'class': test.chapter.class_assigned.name
                },
                'questions_count': questions_count,
                'attempts_count': attempts_count,
                'created_at': test.id  # Using id as proxy for created_at since model doesn't have it
            })
        
        return Response(tests_data)


class TestCreateView(APIView):
    """Create a new test"""
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        test_type = request.data.get('type')  # mcq or descriptive
        chapter_id = request.data.get('chapter_id')
        marks = request.data.get('marks')
        
        if test_type not in ['mcq', 'descriptive']:
            return Response({
                'error': 'Invalid test type.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not marks or int(marks) not in [10, 20, 50]:
            return Response({
                'error': 'Marks must be 10, 20, or 50.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            
            # Verify teacher assignment
            if not TeacherAssignment.objects.filter(
                teacher=request.user,
                class_assigned=chapter.class_assigned,
                subject=chapter.subject
            ).exists():
                return Response({
                    'error': 'Not authorized for this chapter.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            test = Test.objects.create(
                type=test_type,
                chapter=chapter,
                marks=int(marks),
                created_by=request.user
            )
            
            return Response({
                'message': 'Test created! Now add questions.',
                'test': {
                    'id': test.id,
                    'type': test.type,
                    'marks': test.marks,
                    'chapter': chapter.name
                }
            }, status=status.HTTP_201_CREATED)
        
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class TestDetailView(APIView):
    """Get test details with questions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, test_id):
        try:
            test = Test.objects.select_related(
                'chapter__subject',
                'chapter__class_assigned',
                'created_by'
            ).get(id=test_id)
            
            # Get questions
            questions = Question.objects.filter(test=test)
            
            questions_data = []
            for q in questions:
                q_data = {
                    'id': q.id,
                    'question_text': q.question_text,
                    'question_image': request.build_absolute_uri(q.question_image.url) if q.question_image else None,
                }
                
                # Only show options and correct answer to teacher
                if request.user.role == 'teacher' and test.created_by == request.user:
                    if test.type == 'mcq':
                        q_data.update({
                            'option1': q.option1,
                            'option2': q.option2,
                            'option3': q.option3,
                            'option4': q.option4,
                            'correct_option': q.correct_option,
                            'explanation': q.explanation
                        })
                # Students see options but not correct answer (during test)
                elif request.user.role == 'student' and test.type == 'mcq':
                    q_data.update({
                        'option1': q.option1,
                        'option2': q.option2,
                        'option3': q.option3,
                        'option4': q.option4,
                    })
                
                questions_data.append(q_data)
            
            return Response({
                'id': test.id,
                'type': test.type,
                'type_display': test.get_type_display(),
                'marks': test.marks,
                'chapter': {
                    'id': test.chapter.id,
                    'name': test.chapter.name,
                    'subject': test.chapter.subject.name,
                    'class': test.chapter.class_assigned.name
                },
                'created_by': f'{test.created_by.first_name} {test.created_by.last_name}'.strip(),
                'questions': questions_data,
                'total_questions': len(questions_data)
            })
        
        except Test.DoesNotExist:
            return Response({
                'error': 'Test not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  QUESTION MANAGEMENT
# ═══════════════════════════════════════════════════════════

class QuestionCreateView(APIView):
    """Add question to test"""
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        test_id = request.data.get('test_id')
        question_text = request.data.get('question_text', '').strip()
        question_image = request.FILES.get('question_image')
        
        # For MCQ
        option1 = request.data.get('option1', '').strip()
        option2 = request.data.get('option2', '').strip()
        option3 = request.data.get('option3', '').strip()
        option4 = request.data.get('option4', '').strip()
        correct_option = request.data.get('correct_option')
        explanation = request.data.get('explanation', '').strip()
        
        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
            
            # Validate at least text or image
            if not question_text and not question_image:
                return Response({
                    'error': 'Provide question text or image.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate based on test type
            if test.type == 'mcq':
                if not all([option1, option2, option3, option4, correct_option]):
                    return Response({
                        'error': 'All 4 options and correct answer required for MCQ.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if int(correct_option) not in [1, 2, 3, 4]:
                    return Response({
                        'error': 'Correct option must be 1, 2, 3, or 4.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                question = Question.objects.create(
                    test=test,
                    question_text=question_text,
                    question_image=question_image,
                    option1=option1,
                    option2=option2,
                    option3=option3,
                    option4=option4,
                    correct_option=int(correct_option),
                    explanation=explanation
                )
            
            else:  # descriptive
                question = Question.objects.create(
                    test=test,
                    question_text=question_text,
                    question_image=question_image,
                    explanation=explanation
                )
            
            return Response({
                'message': 'Question added successfully!',
                'question_id': question.id
            }, status=status.HTTP_201_CREATED)
        
        except Test.DoesNotExist:
            return Response({
                'error': 'Test not found or not yours.'
            }, status=status.HTTP_404_NOT_FOUND)


class QuestionUpdateView(APIView):
    """Update a question"""
    permission_classes = [IsTeacherRole]
    
    def put(self, request, question_id):
        try:
            question = Question.objects.select_related('test').get(id=question_id)
            
            if question.test.created_by != request.user:
                return Response({
                    'error': 'Not authorized.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Update fields
            if 'question_text' in request.data:
                question.question_text = request.data['question_text']
            
            if 'question_image' in request.FILES:
                question.question_image = request.FILES['question_image']
            
            if question.test.type == 'mcq':
                if 'option1' in request.data:
                    question.option1 = request.data['option1']
                if 'option2' in request.data:
                    question.option2 = request.data['option2']
                if 'option3' in request.data:
                    question.option3 = request.data['option3']
                if 'option4' in request.data:
                    question.option4 = request.data['option4']
                if 'correct_option' in request.data:
                    question.correct_option = int(request.data['correct_option'])
            
            if 'explanation' in request.data:
                question.explanation = request.data['explanation']
            
            question.save()
            
            return Response({
                'message': 'Question updated successfully!'
            })
        
        except Question.DoesNotExist:
            return Response({
                'error': 'Question not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class QuestionDeleteView(APIView):
    """Delete a question"""
    permission_classes = [IsTeacherRole]
    
    def delete(self, request, question_id):
        try:
            question = Question.objects.select_related('test').get(id=question_id)
            
            if question.test.created_by != request.user:
                return Response({
                    'error': 'Not authorized.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            question.delete()
            
            return Response({
                'message': 'Question deleted successfully!'
            })
        
        except Question.DoesNotExist:
            return Response({
                'error': 'Question not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  TEST RESULTS & ANALYTICS
# ═══════════════════════════════════════════════════════════

class TestResultsView(APIView):
    """View all student results for a test"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, test_id):
        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
            
            attempts = TestAttempt.objects.filter(test=test).select_related('student')
            
            results = []
            for attempt in attempts:
                results.append({
                    'student': {
                        'id': attempt.student.id,
                        'name': f'{attempt.student.first_name} {attempt.student.last_name}'.strip(),
                        'unique_id': attempt.student.unique_id
                    },
                    'score': attempt.score,
                    'max_marks': test.marks,
                    'percentage': round((attempt.score / test.marks) * 100, 2),
                    'attempted_at': attempt.attempted_at
                })
            
            # Calculate statistics
            if results:
                scores = [r['score'] for r in results]
                stats = {
                    'total_attempts': len(results),
                    'average_score': round(sum(scores) / len(scores), 2),
                    'highest_score': max(scores),
                    'lowest_score': min(scores)
                }
            else:
                stats = {
                    'total_attempts': 0,
                    'average_score': 0,
                    'highest_score': 0,
                    'lowest_score': 0
                }
            
            return Response({
                'test': {
                    'id': test.id,
                    'type': test.get_type_display(),
                    'marks': test.marks,
                    'chapter': test.chapter.name
                },
                'statistics': stats,
                'results': results
            })
        
        except Test.DoesNotExist:
            return Response({
                'error': 'Test not found.'
            }, status=status.HTTP_404_NOT_FOUND)



























# teachers/views.py - Part 2
# Add this to the end of teachers/views.py Part 1

# ═══════════════════════════════════════════════════════════
#  ATTENDANCE MANAGEMENT
# ═══════════════════════════════════════════════════════════

class AttendanceMarkView(APIView):
    """Mark attendance for students"""
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        class_id = request.data.get('class_id')
        subject_id = request.data.get('subject_id')
        date_str = request.data.get('date')  # YYYY-MM-DD
        student_ids = request.data.get('student_ids', [])  # List of present student IDs
        
        try:
            # Verify teacher assignment
            assignment = TeacherAssignment.objects.get(
                teacher=request.user,
                class_assigned_id=class_id,
                subject_id=subject_id
            )
            
            # Parse date
            attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Get all students in class
            all_students = CustomUser.objects.filter(
                role='student',
                class_assigned_id=class_id,
                is_approved=True
            )
            
            marked_count = 0
            for student in all_students:
                # Check if already marked
                attendance, created = Attendance.objects.get_or_create(
                    teacher=request.user,
                    student=student,
                    class_assigned_id=class_id,
                    subject_id=subject_id,
                    date=attendance_date,
                    defaults={
                        'is_present': student.id in student_ids
                    }
                )
                
                if not created:
                    # Update if already exists
                    attendance.is_present = student.id in student_ids
                    attendance.save()
                
                marked_count += 1
            
            return Response({
                'message': f'Attendance marked for {marked_count} students!',
                'date': date_str,
                'present_count': len(student_ids),
                'absent_count': marked_count - len(student_ids)
            })
        
        except TeacherAssignment.DoesNotExist:
            return Response({
                'error': 'Not assigned to this class-subject.'
            }, status=status.HTTP_403_FORBIDDEN)
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)


class AttendanceListView(APIView):
    """Get attendance records"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        class_id = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')
        date_str = request.GET.get('date')
        
        if not all([class_id, subject_id, date_str]):
            return Response({
                'error': 'class_id, subject_id, and date required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify teacher assignment
            TeacherAssignment.objects.get(
                teacher=request.user,
                class_assigned_id=class_id,
                subject_id=subject_id
            )
            
            attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Get attendance records
            records = Attendance.objects.filter(
                teacher=request.user,
                class_assigned_id=class_id,
                subject_id=subject_id,
                date=attendance_date
            ).select_related('student')
            
            attendance_data = [
                {
                    'student': {
                        'id': r.student.id,
                        'name': f'{r.student.first_name} {r.student.last_name}'.strip(),
                        'unique_id': r.student.unique_id
                    },
                    'is_present': r.is_present
                }
                for r in records
            ]
            
            return Response({
                'date': date_str,
                'class': class_id,
                'subject': subject_id,
                'attendance': attendance_data,
                'total_students': len(attendance_data),
                'present': sum(1 for a in attendance_data if a['is_present']),
                'absent': sum(1 for a in attendance_data if not a['is_present'])
            })
        
        except TeacherAssignment.DoesNotExist:
            return Response({
                'error': 'Not assigned to this class-subject.'
            }, status=status.HTTP_403_FORBIDDEN)
        except ValueError:
            return Response({
                'error': 'Invalid date format.'
            }, status=status.HTTP_400_BAD_REQUEST)


class StudentAttendanceHistoryView(APIView):
    """Get attendance history for a student"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, student_id):
        subject_id = request.GET.get('subject_id')
        
        try:
            student = CustomUser.objects.get(id=student_id, role='student')
            
            # Get attendance records
            records = Attendance.objects.filter(
                teacher=request.user,
                student=student
            )
            
            if subject_id:
                records = records.filter(subject_id=subject_id)
            
            records = records.select_related('subject').order_by('-date')
            
            attendance_data = [
                {
                    'date': r.date,
                    'subject': r.subject.name,
                    'is_present': r.is_present
                }
                for r in records
            ]
            
            # Calculate statistics
            total = len(attendance_data)
            present = sum(1 for a in attendance_data if a['is_present'])
            
            return Response({
                'student': {
                    'id': student.id,
                    'name': f'{student.first_name} {student.last_name}'.strip(),
                    'unique_id': student.unique_id
                },
                'statistics': {
                    'total_classes': total,
                    'present': present,
                    'absent': total - present,
                    'attendance_percentage': round((present / total * 100), 2) if total > 0 else 0
                },
                'records': attendance_data
            })
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Student not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  ASSIGNMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════

class AssignmentCreateView(APIView):
    """Create homework/assignment"""
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        chapter_id = request.data.get('chapter_id')
        description = request.data.get('description', '').strip()
        file = request.FILES.get('file')
        
        if not description:
            return Response({
                'error': 'Description is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            
            # Verify teacher assignment
            if not TeacherAssignment.objects.filter(
                teacher=request.user,
                class_assigned=chapter.class_assigned,
                subject=chapter.subject
            ).exists():
                return Response({
                    'error': 'Not authorized for this chapter.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            assignment = Assignment.objects.create(
                teacher=request.user,
                chapter=chapter,
                description=description,
                file=file
            )
            
            return Response({
                'message': 'Assignment created successfully!',
                'assignment': {
                    'id': assignment.id,
                    'chapter': chapter.name,
                    'description': description,
                    'has_file': bool(file)
                }
            }, status=status.HTTP_201_CREATED)
        
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class AssignmentListView(APIView):
    """Get all assignments created by teacher"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        chapter_id = request.GET.get('chapter_id')
        
        assignments = Assignment.objects.filter(teacher=request.user)
        
        if chapter_id:
            assignments = assignments.filter(chapter_id=chapter_id)
        
        assignments = assignments.select_related(
            'chapter__subject',
            'chapter__class_assigned'
        )
        
        assignments_data = [
            {
                'id': a.id,
                'description': a.description,
                'chapter': {
                    'id': a.chapter.id,
                    'name': a.chapter.name,
                    'subject': a.chapter.subject.name,
                    'class': a.chapter.class_assigned.name
                },
                'file_url': request.build_absolute_uri(a.file.url) if a.file else None
            }
            for a in assignments
        ]
        
        return Response(assignments_data)


class AssignmentDetailView(APIView):
    """Get assignment details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related(
                'teacher',
                'chapter__subject',
                'chapter__class_assigned'
            ).get(id=assignment_id)
            
            # Check permission (teacher who created or student in that class)
            if request.user.role == 'teacher':
                if assignment.teacher != request.user:
                    return Response({
                        'error': 'Not authorized.'
                    }, status=status.HTTP_403_FORBIDDEN)
            elif request.user.role == 'student':
                if request.user.class_assigned != assignment.chapter.class_assigned:
                    return Response({
                        'error': 'Not authorized.'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            return Response({
                'id': assignment.id,
                'description': assignment.description,
                'chapter': {
                    'id': assignment.chapter.id,
                    'name': assignment.chapter.name,
                    'subject': assignment.chapter.subject.name,
                    'class': assignment.chapter.class_assigned.name
                },
                'teacher': f'{assignment.teacher.first_name} {assignment.teacher.last_name}'.strip(),
                'file_url': request.build_absolute_uri(assignment.file.url) if assignment.file else None
            })
        
        except Assignment.DoesNotExist:
            return Response({
                'error': 'Assignment not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  DOUBT MANAGEMENT
# ═══════════════════════════════════════════════════════════

class DoubtListView(APIView):
    """Get doubts (teacher sees all for their subjects, student sees all in their class)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        subject_id = request.GET.get('subject_id')
        
        if request.user.role == 'teacher':
            # Get doubts for teacher's subjects
            if subject_id:
                doubts = Doubt.objects.filter(subject_id=subject_id)
            else:
                doubts = Doubt.objects.filter(subject__in=request.user.subjects.all())
        
        elif request.user.role == 'student':
            # Get doubts from student's class
            if not request.user.class_assigned:
                return Response([])
            
            if subject_id:
                doubts = Doubt.objects.filter(
                    subject_id=subject_id,
                    student__class_assigned=request.user.class_assigned
                )
            else:
                doubts = Doubt.objects.filter(
                    student__class_assigned=request.user.class_assigned
                )
        
        else:
            return Response({
                'error': 'Invalid user role.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        doubts = doubts.select_related('student', 'subject').prefetch_related('doubtreply_set')
        
        doubts_data = [
            {
                'id': d.id,
                'student': {
                    'id': d.student.id,
                    'name': f'{d.student.first_name} {d.student.last_name}'.strip(),
                    'unique_id': d.student.unique_id
                },
                'subject': {
                    'id': d.subject.id,
                    'name': d.subject.name
                },
                'text': d.text,
                'image_url': request.build_absolute_uri(d.image.url) if d.image else None,
                'created_at': d.created_at,
                'replies_count': d.doubtreply_set.count()
            }
            for d in doubts.order_by('-created_at')
        ]
        
        return Response(doubts_data)


class DoubtDetailView(APIView):
    """Get doubt with all replies"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, doubt_id):
        try:
            doubt = Doubt.objects.select_related('student', 'subject').get(id=doubt_id)
            
            # Get replies
            replies = DoubtReply.objects.filter(doubt=doubt).select_related('user')
            
            replies_data = [
                {
                    'id': r.id,
                    'user': {
                        'id': r.user.id,
                        'name': f'{r.user.first_name} {r.user.last_name}'.strip(),
                        'role': r.user.role,
                        'unique_id': r.user.unique_id
                    },
                    'text': r.text,
                    'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
                    'created_at': r.created_at
                }
                for r in replies.order_by('created_at')
            ]
            
            return Response({
                'id': doubt.id,
                'student': {
                    'id': doubt.student.id,
                    'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(),
                    'unique_id': doubt.student.unique_id
                },
                'subject': {
                    'id': doubt.subject.id,
                    'name': doubt.subject.name
                },
                'text': doubt.text,
                'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
                'created_at': doubt.created_at,
                'replies': replies_data
            })
        
        except Doubt.DoesNotExist:
            return Response({
                'error': 'Doubt not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class DoubtReplyCreateView(APIView):
    """Reply to a doubt"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, doubt_id):
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')
        
        if not text and not image:
            return Response({
                'error': 'Provide text or image.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doubt = Doubt.objects.get(id=doubt_id)
            
            # Check permission (same class for students, or teacher of subject)
            if request.user.role == 'student':
                if request.user.class_assigned != doubt.student.class_assigned:
                    return Response({
                        'error': 'Not authorized.'
                    }, status=status.HTTP_403_FORBIDDEN)
            elif request.user.role == 'teacher':
                if doubt.subject not in request.user.subjects.all():
                    return Response({
                        'error': 'Not authorized.'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            reply = DoubtReply.objects.create(
                doubt=doubt,
                user=request.user,
                text=text,
                image=image
            )
            
            return Response({
                'message': 'Reply posted successfully!',
                'reply': {
                    'id': reply.id,
                    'text': text,
                    'created_at': reply.created_at
                }
            }, status=status.HTTP_201_CREATED)
        
        except Doubt.DoesNotExist:
            return Response({
                'error': 'Doubt not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  SEARCH FUNCTIONALITY
# ═══════════════════════════════════════════════════════════

class TeacherSearchView(APIView):
    """Search for teacher's content"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response({
                'error': 'Search query must be at least 2 characters.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = {
            'tests': [],
            'assignments': [],
            'chapters': [],
            'students': []
        }
        
        # Search tests
        tests = Test.objects.filter(
            created_by=request.user,
            chapter__name__icontains=query
        ).select_related('chapter__subject', 'chapter__class_assigned')[:5]
        
        for test in tests:
            results['tests'].append({
                'id': test.id,
                'type': test.get_type_display(),
                'marks': test.marks,
                'chapter': test.chapter.name,
                'subject': test.chapter.subject.name
            })
        
        # Search assignments
        assignments = Assignment.objects.filter(
            teacher=request.user,
            description__icontains=query
        ).select_related('chapter')[:5]
        
        for assignment in assignments:
            results['assignments'].append({
                'id': assignment.id,
                'description': assignment.description[:100],
                'chapter': assignment.chapter.name
            })
        
        # Search chapters
        teacher_assignments = TeacherAssignment.objects.filter(
            teacher=request.user
        ).values_list('subject', 'class_assigned')
        
        for subject_id, class_id in teacher_assignments:
            chapters = Chapter.objects.filter(
                subject_id=subject_id,
                class_assigned_id=class_id,
                name__icontains=query
            )[:3]
            
            for chapter in chapters:
                results['chapters'].append({
                    'id': chapter.id,
                    'name': chapter.name,
                    'subject': chapter.subject.name
                })
        
        # Search students
        class_ids = TeacherAssignment.objects.filter(
            teacher=request.user
        ).values_list('class_assigned_id', flat=True)
        
        students = CustomUser.objects.filter(
            role='student',
            class_assigned_id__in=class_ids,
            is_approved=True
        ).filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(unique_id__icontains=query)
        )[:5]
        
        for student in students:
            results['students'].append({
                'id': student.id,
                'name': f'{student.first_name} {student.last_name}'.strip(),
                'unique_id': student.unique_id,
                'class': student.class_assigned.name if student.class_assigned else None
            })
        
        return Response(results)


# ═══════════════════════════════════════════════════════════
#  STUDENTS IN CLASS
# ═══════════════════════════════════════════════════════════

class ClassStudentsView(APIView):
    """Get students in a class"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, class_id):
        # Verify teacher teaches this class
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_assigned_id=class_id
        ).exists():
            return Response({
                'error': 'Not assigned to this class.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        students = CustomUser.objects.filter(
            role='student',
            class_assigned_id=class_id,
            is_approved=True
        )
        
        students_data = [
            {
                'id': s.id,
                'name': f'{s.first_name} {s.last_name}'.strip(),
                'unique_id': s.unique_id,
                'email': s.email,
                'phone': s.phone
            }
            for s in students
        ]
        
        return Response({
            'class_id': class_id,
            'total_students': len(students_data),
            'students': students_data
        })


# Continue in next part...




























# # teachers/views.py
# """
# Complete Teacher Module Views
# EduVibe Platform - 2026
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.db.models import Count, Q, Avg
# from django.utils import timezone
# from datetime import date

# from users.models import CustomUser
# from admin_tasks.models import Class, Subject, Chapter
# from .models import (
#     TeacherAssignment, Test, Question, Attendance,
#     Assignment, Doubt, DoubtReply
# )
# from students.models import TestAttempt, StudentAnswer


# # ═══════════════════════════════════════════════════════════
# #  CUSTOM PERMISSION
# # ═══════════════════════════════════════════════════════════

# class IsTeacherRole(IsAuthenticated):
#     """Only allow teachers"""
    
#     def has_permission(self, request, view):
#         return (
#             super().has_permission(request, view) and
#             request.user.role == 'teacher'
#         )


# # ═══════════════════════════════════════════════════════════
# #  TEACHER HOME & DASHBOARD
# # ═══════════════════════════════════════════════════════════

# class TeacherHomeView(APIView):
#     """Teacher dashboard/home"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         teacher = request.user
        
#         # Get teacher's assignments
#         assignments = TeacherAssignment.objects.filter(
#             teacher=teacher
#         ).select_related('class_assigned', 'subject')
        
#         assignments_data = []
#         for assignment in assignments:
#             # Get chapters for this class-subject
#             chapters = Chapter.objects.filter(
#                 subject=assignment.subject,
#                 class_assigned=assignment.class_assigned
#             )
            
#             assignments_data.append({
#                 'id': assignment.id,
#                 'class': {
#                     'id': assignment.class_assigned.id,
#                     'name': assignment.class_assigned.name
#                 },
#                 'subject': {
#                     'id': assignment.subject.id,
#                     'name': assignment.subject.name
#                 },
#                 'total_chapters': chapters.count(),
#                 'completed_chapters': chapters.filter(is_completed=True).count()
#             })
        
#         # Get stats
#         stats = {
#             'total_tests': Test.objects.filter(created_by=teacher).count(),
#             'total_assignments': Assignment.objects.filter(teacher=teacher).count(),
#             'classes_teaching': TeacherAssignment.objects.filter(teacher=teacher).values('class_assigned').distinct().count()
#         }
        
#         return Response({
#             'teacher': {
#                 'name': f'{teacher.first_name} {teacher.last_name}'.strip(),
#                 'unique_id': teacher.unique_id,
#                 'subjects': [
#                     {'id': s.id, 'name': s.name}
#                     for s in teacher.subjects.all()
#                 ]
#             },
#             'assignments': assignments_data,
#             'stats': stats
#         })


# class TeacherSubjectClassesView(APIView):
#     """Get classes where teacher teaches a subject"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, subject_id):
#         teacher = request.user
        
#         # Get assignments for this subject
#         assignments = TeacherAssignment.objects.filter(
#             teacher=teacher,
#             subject_id=subject_id
#         ).select_related('class_assigned', 'subject')
        
#         if not assignments.exists():
#             return Response({
#                 'error': 'Not assigned to teach this subject.'
#             }, status=status.HTTP_404_NOT_FOUND)
        
#         subject = assignments.first().subject
        
#         classes_data = []
#         for assignment in assignments:
#             # Get chapters
#             chapters = Chapter.objects.filter(
#                 subject=subject,
#                 class_assigned=assignment.class_assigned
#             )
            
#             classes_data.append({
#                 'assignment_id': assignment.id,
#                 'class': {
#                     'id': assignment.class_assigned.id,
#                     'name': assignment.class_assigned.name
#                 },
#                 'total_chapters': chapters.count(),
#                 'completed_chapters': chapters.filter(is_completed=True).count(),
#                 'student_count': CustomUser.objects.filter(
#                     role='student',
#                     class_assigned=assignment.class_assigned,
#                     is_approved=True
#                 ).count()
#             })
        
#         return Response({
#             'subject': {
#                 'id': subject.id,
#                 'name': subject.name
#             },
#             'classes': classes_data
#         })


# # ═══════════════════════════════════════════════════════════
# #  CHAPTER MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class TeacherChaptersView(APIView):
#     """Get chapters for class-subject"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         class_id = request.GET.get('class_id')
#         subject_id = request.GET.get('subject_id')
        
#         if not class_id or not subject_id:
#             return Response({
#                 'error': 'class_id and subject_id required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Verify teacher assignment
#         if not TeacherAssignment.objects.filter(
#             teacher=request.user,
#             class_assigned_id=class_id,
#             subject_id=subject_id
#         ).exists():
#             return Response({
#                 'error': 'Not assigned to this class-subject.'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         chapters = Chapter.objects.filter(
#             class_assigned_id=class_id,
#             subject_id=subject_id
#         )
        
#         chapters_data = []
#         for chapter in chapters:
#             # Get tests count
#             tests_count = Test.objects.filter(chapter=chapter).count()
            
#             chapters_data.append({
#                 'id': chapter.id,
#                 'name': chapter.name,
#                 'is_completed': chapter.is_completed,
#                 'tests_count': tests_count
#             })
        
#         return Response(chapters_data)


# class MarkChapterCompleteView(APIView):
#     """Mark chapter as completed"""
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request, chapter_id):
#         try:
#             chapter = Chapter.objects.get(id=chapter_id)
            
#             # Verify teacher assignment
#             if not TeacherAssignment.objects.filter(
#                 teacher=request.user,
#                 class_assigned=chapter.class_assigned,
#                 subject=chapter.subject
#             ).exists():
#                 return Response({
#                     'error': 'Not authorized.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             chapter.is_completed = True
#             chapter.save()
            
#             return Response({
#                 'message': 'Chapter marked as completed!'
#             })
        
#         except Chapter.DoesNotExist:
#             return Response({
#                 'error': 'Chapter not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  TEST MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class TestListView(APIView):
#     """Get all tests created by teacher"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         chapter_id = request.GET.get('chapter_id')
        
#         tests = Test.objects.filter(created_by=request.user)
        
#         if chapter_id:
#             tests = tests.filter(chapter_id=chapter_id)
        
#         tests = tests.select_related('chapter__subject', 'chapter__class_assigned')
        
#         tests_data = []
#         for test in tests:
#             # Get questions count
#             questions_count = Question.objects.filter(test=test).count()
            
#             # Get attempts count
#             attempts_count = TestAttempt.objects.filter(test=test).count()
            
#             tests_data.append({
#                 'id': test.id,
#                 'type': test.type,
#                 'type_display': test.get_type_display(),
#                 'marks': test.marks,
#                 'chapter': {
#                     'id': test.chapter.id,
#                     'name': test.chapter.name,
#                     'subject': test.chapter.subject.name,
#                     'class': test.chapter.class_assigned.name
#                 },
#                 'questions_count': questions_count,
#                 'attempts_count': attempts_count,
#                 'created_at': test.id  # Using id as proxy for created_at since model doesn't have it
#             })
        
#         return Response(tests_data)


# class TestCreateView(APIView):
#     """Create a new test"""
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         test_type = request.data.get('type')  # mcq or descriptive
#         chapter_id = request.data.get('chapter_id')
#         marks = request.data.get('marks')
        
#         if test_type not in ['mcq', 'descriptive']:
#             return Response({
#                 'error': 'Invalid test type.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not marks or int(marks) not in [10, 20, 50]:
#             return Response({
#                 'error': 'Marks must be 10, 20, or 50.'
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
            
#             test = Test.objects.create(
#                 type=test_type,
#                 chapter=chapter,
#                 marks=int(marks),
#                 created_by=request.user
#             )
            
#             return Response({
#                 'message': 'Test created! Now add questions.',
#                 'test': {
#                     'id': test.id,
#                     'type': test.type,
#                     'marks': test.marks,
#                     'chapter': chapter.name
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except Chapter.DoesNotExist:
#             return Response({
#                 'error': 'Chapter not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class TestDetailView(APIView):
#     """Get test details with questions"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, test_id):
#         try:
#             test = Test.objects.select_related(
#                 'chapter__subject',
#                 'chapter__class_assigned',
#                 'created_by'
#             ).get(id=test_id)
            
#             # Get questions
#             questions = Question.objects.filter(test=test)
            
#             questions_data = []
#             for q in questions:
#                 q_data = {
#                     'id': q.id,
#                     'question_text': q.question_text,
#                     'question_image': request.build_absolute_uri(q.question_image.url) if q.question_image else None,
#                 }
                
#                 # Only show options and correct answer to teacher
#                 if request.user.role == 'teacher' and test.created_by == request.user:
#                     if test.type == 'mcq':
#                         q_data.update({
#                             'option1': q.option1,
#                             'option2': q.option2,
#                             'option3': q.option3,
#                             'option4': q.option4,
#                             'correct_option': q.correct_option,
#                             'explanation': q.explanation
#                         })
#                 # Students see options but not correct answer (during test)
#                 elif request.user.role == 'student' and test.type == 'mcq':
#                     q_data.update({
#                         'option1': q.option1,
#                         'option2': q.option2,
#                         'option3': q.option3,
#                         'option4': q.option4,
#                     })
                
#                 questions_data.append(q_data)
            
#             return Response({
#                 'id': test.id,
#                 'type': test.type,
#                 'type_display': test.get_type_display(),
#                 'marks': test.marks,
#                 'chapter': {
#                     'id': test.chapter.id,
#                     'name': test.chapter.name,
#                     'subject': test.chapter.subject.name,
#                     'class': test.chapter.class_assigned.name
#                 },
#                 'created_by': f'{test.created_by.first_name} {test.created_by.last_name}'.strip(),
#                 'questions': questions_data,
#                 'total_questions': len(questions_data)
#             })
        
#         except Test.DoesNotExist:
#             return Response({
#                 'error': 'Test not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  QUESTION MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class QuestionCreateView(APIView):
#     """Add question to test"""
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         test_id = request.data.get('test_id')
#         question_text = request.data.get('question_text', '').strip()
#         question_image = request.FILES.get('question_image')
        
#         # For MCQ
#         option1 = request.data.get('option1', '').strip()
#         option2 = request.data.get('option2', '').strip()
#         option3 = request.data.get('option3', '').strip()
#         option4 = request.data.get('option4', '').strip()
#         correct_option = request.data.get('correct_option')
#         explanation = request.data.get('explanation', '').strip()
        
#         try:
#             test = Test.objects.get(id=test_id, created_by=request.user)
            
#             # Validate at least text or image
#             if not question_text and not question_image:
#                 return Response({
#                     'error': 'Provide question text or image.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Validate based on test type
#             if test.type == 'mcq':
#                 if not all([option1, option2, option3, option4, correct_option]):
#                     return Response({
#                         'error': 'All 4 options and correct answer required for MCQ.'
#                     }, status=status.HTTP_400_BAD_REQUEST)
                
#                 if int(correct_option) not in [1, 2, 3, 4]:
#                     return Response({
#                         'error': 'Correct option must be 1, 2, 3, or 4.'
#                     }, status=status.HTTP_400_BAD_REQUEST)
                
#                 question = Question.objects.create(
#                     test=test,
#                     question_text=question_text,
#                     question_image=question_image,
#                     option1=option1,
#                     option2=option2,
#                     option3=option3,
#                     option4=option4,
#                     correct_option=int(correct_option),
#                     explanation=explanation
#                 )
            
#             else:  # descriptive
#                 question = Question.objects.create(
#                     test=test,
#                     question_text=question_text,
#                     question_image=question_image,
#                     explanation=explanation
#                 )
            
#             return Response({
#                 'message': 'Question added successfully!',
#                 'question_id': question.id
#             }, status=status.HTTP_201_CREATED)
        
#         except Test.DoesNotExist:
#             return Response({
#                 'error': 'Test not found or not yours.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class QuestionUpdateView(APIView):
#     """Update a question"""
#     permission_classes = [IsTeacherRole]
    
#     def put(self, request, question_id):
#         try:
#             question = Question.objects.select_related('test').get(id=question_id)
            
#             if question.test.created_by != request.user:
#                 return Response({
#                     'error': 'Not authorized.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Update fields
#             if 'question_text' in request.data:
#                 question.question_text = request.data['question_text']
            
#             if 'question_image' in request.FILES:
#                 question.question_image = request.FILES['question_image']
            
#             if question.test.type == 'mcq':
#                 if 'option1' in request.data:
#                     question.option1 = request.data['option1']
#                 if 'option2' in request.data:
#                     question.option2 = request.data['option2']
#                 if 'option3' in request.data:
#                     question.option3 = request.data['option3']
#                 if 'option4' in request.data:
#                     question.option4 = request.data['option4']
#                 if 'correct_option' in request.data:
#                     question.correct_option = int(request.data['correct_option'])
            
#             if 'explanation' in request.data:
#                 question.explanation = request.data['explanation']
            
#             question.save()
            
#             return Response({
#                 'message': 'Question updated successfully!'
#             })
        
#         except Question.DoesNotExist:
#             return Response({
#                 'error': 'Question not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class QuestionDeleteView(APIView):
#     """Delete a question"""
#     permission_classes = [IsTeacherRole]
    
#     def delete(self, request, question_id):
#         try:
#             question = Question.objects.select_related('test').get(id=question_id)
            
#             if question.test.created_by != request.user:
#                 return Response({
#                     'error': 'Not authorized.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             question.delete()
            
#             return Response({
#                 'message': 'Question deleted successfully!'
#             })
        
#         except Question.DoesNotExist:
#             return Response({
#                 'error': 'Question not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  TEST RESULTS & ANALYTICS
# # ═══════════════════════════════════════════════════════════

# class TestResultsView(APIView):
#     """View all student results for a test"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, test_id):
#         try:
#             test = Test.objects.get(id=test_id, created_by=request.user)
            
#             attempts = TestAttempt.objects.filter(test=test).select_related('student')
            
#             results = []
#             for attempt in attempts:
#                 results.append({
#                     'student': {
#                         'id': attempt.student.id,
#                         'name': f'{attempt.student.first_name} {attempt.student.last_name}'.strip(),
#                         'unique_id': attempt.student.unique_id
#                     },
#                     'score': attempt.score,
#                     'max_marks': test.marks,
#                     'percentage': round((attempt.score / test.marks) * 100, 2),
#                     'attempted_at': attempt.attempted_at
#                 })
            
#             # Calculate statistics
#             if results:
#                 scores = [r['score'] for r in results]
#                 stats = {
#                     'total_attempts': len(results),
#                     'average_score': round(sum(scores) / len(scores), 2),
#                     'highest_score': max(scores),
#                     'lowest_score': min(scores)
#                 }
#             else:
#                 stats = {
#                     'total_attempts': 0,
#                     'average_score': 0,
#                     'highest_score': 0,
#                     'lowest_score': 0
#                 }
            
#             return Response({
#                 'test': {
#                     'id': test.id,
#                     'type': test.get_type_display(),
#                     'marks': test.marks,
#                     'chapter': test.chapter.name
#                 },
#                 'statistics': stats,
#                 'results': results
#             })
        
#         except Test.DoesNotExist:
#             return Response({
#                 'error': 'Test not found.'
#             }, status=status.HTTP_404_NOT_FOUND)



























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


# # Continue in next part...






















