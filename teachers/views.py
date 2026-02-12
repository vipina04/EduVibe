# teachers/views.py - COMPLETE WITH ALL ENDPOINTS
"""
Complete Teacher Module Views - ALL ENDPOINTS INCLUDED
EduVibe Platform - 2026
✅ Resolved IsTeacherRole NameError
✅ Removed Duplicate Code & Imports
✅ All functionality preserved
✅ Added new function-based views for tests
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Test, Question, Option




# ═══════════════════════════════════════════════════════════
#  IMPORTS
# ═══════════════════════════════════════════════════════════

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes  # ✅ ADDED FOR FUNCTION-BASED VIEWS
from django.db.models import Count, Q, Avg, Max, Min  # ✅ ADDED Max, Min
from django.utils import timezone
from datetime import date
from django.db import transaction
import traceback

from users.models import CustomUser
from admin_tasks.models import Class, Subject, Chapter
from .models import (
TeacherAssignment, Test, Question, Attendance,Assignment, Doubt, DoubtReply,Test, Question, Option)
from students.models import TestAttempt, StudentAnswer

# ═══════════════════════════════════════════════════════════
#  CUSTOM PERMISSION
# ═══════════════════════════════════════════════════════════

class IsTeacherRole(IsAuthenticated):
    """Only allow authenticated users with the 'teacher' role"""
    
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'teacher'
        )

# ═══════════════════════════════════════════════════════════
#  NEW FUNCTION-BASED VIEWS FOR TESTS
# ═══════════════════════════════════════════════════════════

# 



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_teacher_tests(request):
    """Get all tests created by the logged-in teacher, grouped by subject"""
    try:
        teacher = request.user
        print(f"\n=== Fetching tests for teacher: {teacher.email} ===")
        
        # Get all tests created by this teacher
        all_tests = Test.objects.filter(
            created_by=teacher
        ).select_related('chapter__subject', 'chapter__class_assigned')
        
        print(f"Total tests found: {all_tests.count()}")
        
        # Group tests by subject
        tests_by_subject = {}
        
        for test in all_tests:
            subject_id = test.chapter.subject.id
            
            # Initialize subject group if not exists
            if subject_id not in tests_by_subject:
                tests_by_subject[subject_id] = {
                    'subject_id': subject_id,
                    'subject_name': test.chapter.subject.name,
                    'class_id': test.chapter.class_assigned.id if hasattr(test.chapter, 'class_assigned') else None,
                    'class_name': test.chapter.class_assigned.name if hasattr(test.chapter, 'class_assigned') else 'Unknown',
                    'tests': []
                }
            
            # Count questions manually
            questions_count = Question.objects.filter(test=test).count()
            
            # Count attempts manually
            from students.models import TestAttempt
            attempts_count = TestAttempt.objects.filter(test=test).count()
            
            # Add test to subject group
            tests_by_subject[subject_id]['tests'].append({
                'id': test.id,
                'name': test.name,
                'description': test.description,
                'type': test.type,
                'marks': test.marks,
                'duration_minutes': test.duration_minutes,
                'chapter_name': test.chapter.name,
                'chapter_id': test.chapter.id,
                'questions_count': questions_count,
                'attempts_count': attempts_count,
                'created_at': test.created_at
            })
        
        # Convert dict to list
        tests_by_subject_list = list(tests_by_subject.values())
        
        print(f"Returning {len(tests_by_subject_list)} subject groups")
        print(f"Tests by subject: {tests_by_subject_list}")
        
        return Response({
            'tests_by_subject': tests_by_subject_list
        })
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print("=" * 80)
        print("ERROR in get_all_teacher_tests:")
        print(error_trace)
        print("=" * 80)
        return Response(
            {'error': str(e), 'details': error_trace},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )













# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_all_teacher_tests(request):
#     """Get all tests created by the logged-in teacher, grouped by subject"""
#     try:
#         teacher = request.user
        
#         # Get all assignments for this teacher
#         assignments = TeacherAssignment.objects.filter(
#             teacher=teacher
#         ).select_related('class_assigned', 'subject')
        
#         tests_by_subject = []
        
#         for assignment in assignments:
#             # Get all tests for this subject-class combination
#             tests = Test.objects.filter(
#                 chapter__subject=assignment.subject,
#                 chapter__class_for=assignment.class_assigned,
#                 created_by=teacher
#             ).select_related('chapter').annotate(
#                 questions_count=Count('questions'),
#                 attempts_count=Count('testattempt')
#             ).order_by('-created_at')
            
#             if tests.exists():
#                 tests_data = []
#                 for test in tests:
#                     tests_data.append({
#                         'id': test.id,
#                         'name': test.name,
#                         'description': test.description,
#                         'type': test.type,
#                         'marks': test.marks,
#                         'duration_minutes': test.duration_minutes,
#                         'chapter_name': test.chapter.name,
#                         'chapter_id': test.chapter.id,
#                         'questions_count': test.questions_count,
#                         'attempts_count': test.attempts_count,
#                         'created_at': test.created_at
#                     })
                
#                 tests_by_subject.append({
#                     'subject_id': assignment.subject.id,
#                     'subject_name': assignment.subject.name,
#                     'class_id': assignment.class_assigned.id,
#                     'class_name': assignment.class_assigned.name,
#                     'tests': tests_data
#                 })
        
#         return Response({
#             'tests_by_subject': tests_by_subject
#         })
        
#     except Exception as e:
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_test_results(request, test_id):
    """Get all student attempts and scores for a specific test"""
    try:
        teacher = request.user
        
        # Get the test and verify it belongs to this teacher
        try:
            test = Test.objects.select_related(
                'chapter__subject',
                'chapter__class_for'
            ).get(id=test_id, created_by=teacher)
        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found or you do not have permission to view it'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all test attempts with student info
        attempts = TestAttempt.objects.filter(
            test=test,
            is_submitted=True
        ).select_related('student').order_by('-score', 'submitted_at')
        
        # Calculate statistics
        stats = attempts.aggregate(
            total_attempts=Count('id'),
            average_score=Avg('percentage'),
            highest_score=Max('percentage'),
            lowest_score=Min('percentage')
        )
        
        # Format results
        results = []
        for attempt in attempts:
            results.append({
                'id': attempt.id,
                'student_name': f'{attempt.student.first_name} {attempt.student.last_name}'.strip(),
                'student_unique_id': attempt.student.unique_id,
                'score': attempt.score,
                'percentage': attempt.percentage,
                'submitted_at': attempt.submitted_at,
                'time_taken_minutes': attempt.time_taken_minutes
            })
        
        return Response({
            'test_info': {
                'id': test.id,
                'name': test.name,
                'description': test.description,
                'type': test.type,
                'marks': test.marks,
                'duration_minutes': test.duration_minutes,
                'subject_name': test.chapter.subject.name,
                'class_name': test.chapter.class_for.name,
                'chapter_name': test.chapter.name
            },
            'results': results,
            'stats': stats
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ═══════════════════════════════════════════════════════════
#  TEACHER DASHBOARD & CORE LISTS
# ═══════════════════════════════════════════════════════════

class TeacherHomeView(APIView):
    """Teacher dashboard/home"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        teacher = request.user
        
        # Get teacher's assignments
        assignments = TeacherAssignment.objects.filter(
            teacher=teacher
        ).select_related('class_assigned', 'subject')
        
        assignments_data = []
        for assignment in assignments:
            # Get chapters for this class-subject
            chapters = Chapter.objects.filter(
                subject=assignment.subject,
                class_assigned=assignment.class_assigned
            )
            
            assignments_data.append({
                'id': assignment.id,
                'class': {
                    'id': assignment.class_assigned.id,
                    'name': assignment.class_assigned.name
                },
                'subject': {
                    'id': assignment.subject.id,
                    'name': assignment.subject.name
                },
                'total_chapters': chapters.count(),
                'completed_chapters': chapters.filter(is_completed=True).count()
            })
        
        # Get stats
        stats = {
            'total_tests': Test.objects.filter(created_by=teacher).count(),
            'total_assignments': Assignment.objects.filter(teacher=teacher).count(),
            'classes_teaching': TeacherAssignment.objects.filter(teacher=teacher).values('class_assigned').distinct().count()
        }
        
        return Response({
            'teacher': {
                'name': f'{teacher.first_name} {teacher.last_name}'.strip(),
                'unique_id': teacher.unique_id,
                'subjects': [
                    {'id': s.id, 'name': s.name}
                    for s in teacher.subjects.all()
                ]
            },
            'assignments': assignments_data,
            'stats': stats
        })

class TeacherClassesListView(APIView):
    """Get all classes assigned to teacher with statistics"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        # Get unique classes assigned to this teacher
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user
        ).select_related('class_assigned').values(
            'class_assigned__id', 
            'class_assigned__name'
        ).distinct()
        
        classes_data = []
        for assignment in assignments:
            class_id = assignment['class_assigned__id']
            class_name = assignment['class_assigned__name']
            
            # Count subjects assigned to this teacher for this class
            subjects_count = TeacherAssignment.objects.filter(
                teacher=request.user,
                class_assigned_id=class_id
            ).values('subject').distinct().count()
            
            # Count students in this class
            students_count = CustomUser.objects.filter(
                role='student',
                class_assigned_id=class_id,
                is_approved=True
            ).count()
            
            # Count tests created by this teacher for this class
            tests_count = Test.objects.filter(
                created_by=request.user,
                chapter__class_assigned_id=class_id
            ).count()
            
            classes_data.append({
                'id': class_id,
                'name': class_name,
                'subjects_count': subjects_count,
                'students_count': students_count,
                'tests_count': tests_count
            })
        
        return Response(classes_data)

class TeacherSubjectsListView(APIView):
    """Get subjects assigned to teacher, optionally filtered by class"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        class_id = request.GET.get('class_id')
        assignments = TeacherAssignment.objects.filter(teacher=request.user)
        
        if class_id:
            assignments = assignments.filter(class_assigned_id=class_id)
        
        subjects = assignments.values('subject__id', 'subject__name').distinct()
        return Response([{'id': s['subject__id'], 'name': s['subject__name']} for s in subjects])

class TeacherClassSubjectsView(APIView):
    """Get all subjects for a specific class assigned to this teacher"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, class_id):
        # Verify teacher is assigned to this class
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_assigned_id=class_id
        ).exists():
            return Response({
                'error': 'You are not assigned to this class.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all subjects this teacher teaches in this class
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user,
            class_assigned_id=class_id
        ).select_related('subject', 'class_assigned')
        
        subjects_data = []
        for assignment in assignments:
            # Count chapters for this subject in this class
            chapters_count = Chapter.objects.filter(
                subject=assignment.subject,
                class_assigned_id=class_id
            ).count()
            
            completed_chapters = Chapter.objects.filter(
                subject=assignment.subject,
                class_assigned_id=class_id,
                is_completed=True
            ).count()
            
            # Count tests for this subject in this class
            tests_count = Test.objects.filter(
                created_by=request.user,
                chapter__subject=assignment.subject,
                chapter__class_assigned_id=class_id
            ).count()
            
            subjects_data.append({
                'id': assignment.subject.id,
                'name': assignment.subject.name,
                'class_id': class_id,
                'class_name': assignment.class_assigned.name,
                'chapters_count': chapters_count,
                'completed_chapters': completed_chapters,
                'tests_count': tests_count
            })
        
        return Response({
            'class_id': class_id,
            'class_name': assignments.first().class_assigned.name if assignments.exists() else None,
            'subjects': subjects_data
        })

# ═══════════════════════════════════════════════════════════
#  OTHER CORE VIEWS
# ═══════════════════════════════════════════════════════════

class TeacherSubjectClassesView(APIView):
    """Returns classes filtered by subject for the teacher"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        subject_id = request.GET.get('subject_id')
        assignments = TeacherAssignment.objects.filter(teacher=request.user)
        if subject_id:
            assignments = assignments.filter(subject_id=subject_id)
        classes = assignments.values('class_assigned__id', 'class_assigned__name').distinct()
        return Response([{'id': c['class_assigned__id'], 'name': c['class_assigned__name']} for c in classes])

class TeacherSearchView(APIView):
    """Search for students or resources"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        query = request.GET.get('q', '')
        students = CustomUser.objects.filter(
            Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(unique_id__icontains=query),
            role='student'
        )[:10]
        return Response([{'id': s.id, 'name': f"{s.first_name} {s.last_name}", 'uid': s.unique_id} for s in students])

class ClassStudentsView(APIView):
    """Get all students in a specific class assigned to the teacher"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, class_id):
        students = CustomUser.objects.filter(class_assigned_id=class_id, role='student', is_approved=True)
        return Response([{'id': s.id, 'name': f"{s.first_name} {s.last_name}", 'unique_id': s.unique_id} for s in students])

# ═══════════════════════════════════════════════════════════
#  CHAPTER & TEST MANAGEMENT
# ═══════════════════════════════════════════════════════════

# 
class TeacherChaptersView(APIView):
    """Get chapters for class-subject"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, class_id=None, subject_id=None):
        # Accept both URL params and query params
        class_id = class_id or request.GET.get('class_id')
        subject_id = subject_id or request.GET.get('subject_id')
        
        if not class_id or not subject_id:
            return Response(
                {'error': 'class_id and subject_id required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_assigned_id=class_id,
            subject_id=subject_id
        ).exists():
            return Response(
                {'error': 'Not assigned to this class-subject.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        chapters = Chapter.objects.filter(
            class_assigned_id=class_id,
            subject_id=subject_id
        )
        
        chapters_data = [{
            'id': c.id,
            'name': c.name,
            'is_completed': c.is_completed,
            'tests_count': Test.objects.filter(chapter=c).count()
        } for c in chapters]
        
        return Response(chapters_data)


class MarkChapterCompleteView(APIView):
    permission_classes = [IsTeacherRole]
    
    def post(self, request, chapter_id):
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            if not TeacherAssignment.objects.filter(teacher=request.user, class_assigned=chapter.class_assigned, subject=chapter.subject).exists():
                return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
            chapter.is_completed = True
            chapter.save()
            return Response({'message': 'Chapter marked as completed!'})
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

class TestListView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        tests = Test.objects.filter(created_by=request.user).select_related('chapter')
        return Response([{'id': t.id, 'chapter': t.chapter.name, 'type': t.type, 'marks': t.marks} for t in tests])

# class TestCreateView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         test_type = request.data.get('type')
#         chapter_id = request.data.get('chapter_id')
#         marks = request.data.get('marks')
        
#         if test_type not in ['mcq', 'descriptive'] or not marks or int(marks) not in [10, 20, 50]:
#             return Response({'error': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             chapter = Chapter.objects.get(id=chapter_id)
#             test = Test.objects.create(type=test_type, chapter=chapter, marks=int(marks), created_by=request.user)
#             return Response({'message': 'Test created!', 'test': {'id': test.id, 'type': test.type}}, status=status.HTTP_201_CREATED)
#         except Chapter.DoesNotExist:
#             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

class TestCreateView(APIView):
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        """
        Create a new test
        Expected payload:
        {
            "name": "Test Name",
            "description": "Test Description",
            "type": "mcq" or "descriptive",
            "marks": 10,
            "duration_minutes": 30,
            "chapter": chapter_id
        }
        """
        # Get data from request
        name = request.data.get('name')
        description = request.data.get('description', '')
        test_type = request.data.get('type')
        marks = request.data.get('marks')
        duration_minutes = request.data.get('duration_minutes')
        chapter_id = request.data.get('chapter') or request.data.get('chapter_id')  # Support both field names
        
        # Validate required fields
        if not name:
            return Response({
                'error': 'Test name is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if test_type not in ['mcq', 'descriptive']:
            return Response({
                'error': 'Invalid test type. Must be "mcq" or "descriptive".'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not marks or int(marks) <= 0:
            return Response({
                'error': 'Valid marks required (must be greater than 0).'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not duration_minutes or int(duration_minutes) <= 0:
            return Response({
                'error': 'Valid duration required (must be greater than 0).'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not chapter_id:
            return Response({
                'error': 'Chapter is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify chapter exists
            chapter = Chapter.objects.get(id=chapter_id)
            
            # Verify teacher is assigned to this subject and class
            assignment_exists = TeacherAssignment.objects.filter(
                teacher=request.user,
                subject=chapter.subject,
                class_assigned=chapter.class_assigned
            ).exists()
            
            if not assignment_exists:
                return Response({
                    'error': 'You are not assigned to teach this subject in this class.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Create test
            test = Test.objects.create(
                name=name,
                description=description,
                type=test_type,
                chapter=chapter,
                marks=int(marks),
                duration_minutes=int(duration_minutes),
                created_by=request.user
            )
            
            return Response({
                'message': 'Test created successfully!',
                'test': {
                    'id': test.id,
                    'name': test.name,
                    'type': test.type,
                    'marks': test.marks,
                    'duration_minutes': test.duration_minutes,
                    'chapter_id': test.chapter.id,
                    'chapter_name': test.chapter.name
                }
            }, status=status.HTTP_201_CREATED)
            
        except Chapter.DoesNotExist:
            return Response({
                'error': 'Chapter not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the error for debugging
            import traceback
            print(f"Error creating test: {str(e)}")
            print(traceback.format_exc())
            
            return Response({
                'error': f'Failed to create test: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)












class TestDetailView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request, test_id):
        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
            questions = Question.objects.filter(test=test)
            return Response({
                'id': test.id,
                'type': test.type,
                'questions': [{'id': q.id, 'text': q.text} for q in questions]
            })
        except Test.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

class TestResultsView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request, test_id):
        attempts = TestAttempt.objects.filter(test_id=test_id).select_related('student')
        return Response([{'student': a.student.first_name, 'score': a.score, 'completed': a.completed_at} for a in attempts])

# ═══════════════════════════════════════════════════════════
#  QUESTION MANAGEMENT
# ═══════════════════════════════════════════════════════════

# class QuestionCreateView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request, test_id):
#         return Response({'message': 'Question endpoint placeholder'}, status=201)

class QuestionCreateView(APIView):
    permission_classes = [IsTeacherRole]
    
    def post(self, request, test_id=None):
        """
        Create a new question for a test
        Expected payload (FormData):
        {
            "test": test_id,
            "question_text": "Question text here",
            "question_image": <file> (optional),
            "option1": "Option 1" (for MCQ),
            "option2": "Option 2" (for MCQ),
            "option3": "Option 3" (for MCQ),
            "option4": "Option 4" (for MCQ),
            "correct_option": 1-4 (for MCQ),
            "explanation": "Explanation text" (optional)
        }
        """
        # Get test_id from URL param or from request body
        test_id = test_id or request.data.get('test')
        
        if not test_id:
            return Response({
                'error': 'Test ID is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify test exists and belongs to this teacher
            test = Test.objects.get(id=test_id, created_by=request.user)
            
            # Get question data
            question_text = request.data.get('question_text', '')
            
            if not question_text:
                return Response({
                    'error': 'Question text is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create question
            question = Question.objects.create(
                test=test,
                question_text=question_text,
                explanation=request.data.get('explanation', '')
            )
            
            # For MCQ tests, add options
            if test.type == 'mcq':
                option1 = request.data.get('option1', '')
                option2 = request.data.get('option2', '')
                option3 = request.data.get('option3', '')
                option4 = request.data.get('option4', '')
                correct_option = request.data.get('correct_option')
                
                if not all([option1, option2, option3, option4, correct_option]):
                    question.delete()  # Delete the question if options are incomplete
                    return Response({
                        'error': 'All options and correct option are required for MCQ.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    correct_option = int(correct_option)
                    if correct_option not in [1, 2, 3, 4]:
                        question.delete()
                        return Response({
                            'error': 'Correct option must be between 1 and 4.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                except (ValueError, TypeError):
                    question.delete()
                    return Response({
                        'error': 'Invalid correct option value.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                question.option1 = option1
                question.option2 = option2
                question.option3 = option3
                question.option4 = option4
                question.correct_option = correct_option
                question.save()
            
            # Handle image upload if present
            if request.FILES.get('question_image'):
                question.question_image = request.FILES['question_image']
                question.save()
            
            return Response({
                'message': 'Question created successfully!',
                'question': {
                    'id': question.id,
                    'question_text': question.question_text,
                    'has_image': bool(question.question_image)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Test.DoesNotExist:
            return Response({
                'error': 'Test not found or you do not have permission to add questions to this test.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log the error for debugging
            import traceback
            print(f"Error creating question: {str(e)}")
            print(traceback.format_exc())
            
            return Response({
                'error': f'Failed to create question: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









class QuestionUpdateView(APIView):
    permission_classes = [IsTeacherRole]
    
    def put(self, request, question_id):
        return Response({'message': 'Update placeholder'})

class QuestionDeleteView(APIView):
    permission_classes = [IsTeacherRole]
    
    def delete(self, request, question_id):
        return Response(status=204)

# ═══════════════════════════════════════════════════════════
#  ATTENDANCE
# ═══════════════════════════════════════════════════════════

class AttendanceMarkView(APIView):
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        class_id = request.data.get('class_id')
        date_str = request.data.get('date')
        student_ids = request.data.get('student_ids', [])
        
        try:
            attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            all_students = CustomUser.objects.filter(role='student', class_assigned_id=class_id, is_approved=True)
            
            for student in all_students:
                Attendance.objects.update_or_create(
                    teacher=request.user, student=student, class_assigned_id=class_id, date=attendance_date,
                    defaults={'is_present': student.id in student_ids, 'time': timezone.now().time()}
                )
            return Response({'message': 'Attendance marked successfully!'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AttendanceListView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        return Response([])

class StudentAttendanceHistoryView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request, student_id):
        return Response([])

# ═══════════════════════════════════════════════════════════
#  ASSIGNMENTS
# ═══════════════════════════════════════════════════════════

class AssignmentCreateView(APIView):
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        chapter_id = request.data.get('chapter_id')
        description = request.data.get('description', '').strip()
        file = request.FILES.get('file')
        
        if not description:
            return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            assignment = Assignment.objects.create(teacher=request.user, chapter=chapter, description=description, file=file)
            return Response({'message': 'Assignment created!', 'id': assignment.id}, status=status.HTTP_201_CREATED)
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

class AssignmentListView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        assignments = Assignment.objects.filter(teacher=request.user)
        return Response([{'id': a.id, 'desc': a.description} for a in assignments])

class AssignmentDetailView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request, assignment_id):
        return Response({'id': assignment_id})

# ═══════════════════════════════════════════════════════════
#  DOUBTS
# ═══════════════════════════════════════════════════════════

class DoubtListView(APIView):
    """Get doubts filtered by class and/or subject"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        class_id = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')
        
        if request.user.role == 'teacher':
            teacher_subjects = request.user.subjects.all()
            doubts = Doubt.objects.filter(subject__in=teacher_subjects)
            if class_id:
                doubts = doubts.filter(student__class_assigned_id=class_id)
            if subject_id:
                doubts = doubts.filter(subject_id=subject_id)
        
        elif request.user.role == 'student':
            if not request.user.class_assigned:
                return Response([], status=status.HTTP_200_OK)
            doubts = Doubt.objects.filter(student__class_assigned=request.user.class_assigned)
            if subject_id:
                doubts = doubts.filter(subject_id=subject_id)
        else:
            return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)
        
        doubts = doubts.select_related('student', 'subject').prefetch_related('doubtreply_set__user').order_by('-created_at')
        
        doubts_data = []
        for doubt in doubts:
            replies = doubt.doubtreply_set.all()
            replies_data = [{
                'id': r.id,
                'user': {'id': r.user.id, 'name': f'{r.user.first_name} {r.user.last_name}'.strip() or r.user.username, 'role': r.user.role},
                'text': r.text,
                'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
                'created_at': r.created_at
            } for r in replies]
            
            doubts_data.append({
                'id': doubt.id,
                'student': {'id': doubt.student.id, 'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(), 'unique_id': doubt.student.unique_id},
                'subject': {'id': doubt.subject.id, 'name': doubt.subject.name},
                'text': doubt.text,
                'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
                'created_at': doubt.created_at,
                'reply_count': len(replies_data),
                'replies': replies_data
            })
        return Response(doubts_data)

class DoubtDetailView(APIView):
    permission_classes = [IsTeacherRole]
    
    def get(self, request, doubt_id):
        return Response({'id': doubt_id})

class DoubtReplyCreateView(APIView):
    """Teachers can reply to doubts in their subjects"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, doubt_id):
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')
        
        if not text and not image:
            return Response({'error': 'Provide text or image.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doubt = Doubt.objects.get(id=doubt_id)
            if request.user.role == 'teacher':
                if doubt.subject not in request.user.subjects.all():
                    return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            elif request.user.role == 'student':
                if request.user.class_assigned != doubt.student.class_assigned:
                    return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
            reply = DoubtReply.objects.create(doubt=doubt, user=request.user, text=text, image=image)
            return Response({
                'message': 'Reply posted successfully!',
                'reply': {'id': reply.id, 'text': text, 'created_at': reply.created_at}
            }, status=status.HTTP_201_CREATED)
        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_question(request):
    """Create a new question for a test"""
    try:
        # Get data from FormData
        test_id = request.data.get('test')
        question_text = request.data.get('question_text', '')
        question_image = request.FILES.get('question_image', None)
        option1 = request.data.get('option1', '')
        option2 = request.data.get('option2', '')
        option3 = request.data.get('option3', '')
        option4 = request.data.get('option4', '')
        correct_option = request.data.get('correct_option', None)
        explanation = request.data.get('explanation', '')
        
        # Validate test exists
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response(
                {'error': f'Test with id {test_id} does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is the creator of the test
        if test.created_by != request.user:
            return Response(
                {'error': 'You are not authorized to add questions to this test'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create question
        question = Question.objects.create(
            test=test,
            question_text=question_text,
            question_image=question_image,
            option1=option1,
            option2=option2,
            option3=option3,
            option4=option4,
            correct_option=int(correct_option) if correct_option else None,
            explanation=explanation
        )
        
        return Response({
            'message': 'Question created successfully',
            'question_id': question.id,
            'question': {
                'id': question.id,
                'question_text': question.question_text,
                'option1': question.option1,
                'option2': question.option2,
                'option3': question.option3,
                'option4': question.option4,
                'correct_option': question.correct_option,
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("Error creating question:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return Response({
            'error': 'Failed to create question',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_test(request):
    """Create a new test"""
    try:
        data = request.data
        print("Received data for test creation:", data)  # Debug
        
        # Validate required fields
        required_fields = ['chapter', 'name', 'type', 'marks', 'duration_minutes']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Create the test
        test = Test.objects.create(
            chapter_id=data['chapter'],
            name=data['name'],
            description=data.get('description', ''),
            type=data['type'],
            marks=data['marks'],
            duration_minutes=data['duration_minutes'],
            created_by=request.user
        )
        
        print(f"Test created successfully with ID: {test.id}")  # Debug
        
        # Return response with ID
        return Response({
            'id': test.id,  # THIS IS THE IMPORTANT PART!
            'message': 'Test created successfully',
            'test': {
                'id': test.id,
                'name': test.name,
                'description': test.description,
                'type': test.type,
                'marks': test.marks,
                'duration_minutes': test.duration_minutes,
                'chapter': test.chapter_id
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("Error creating test:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return Response({
            'error': 'Failed to create test',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_assigned_classes(request):
#     """Get all classes assigned to the teacher"""
#     try:
#         # Get teacher's assigned class-subjects
#         from admin_tasks.models import ClassSubject
        
#         teacher = request.user
        
#         # Get all class-subjects assigned to this teacher
#         assigned_class_subjects = ClassSubject.objects.filter(
#             teacher=teacher
#         ).select_related('class_name', 'subject')
        
#         # Group by class
#         classes_dict = {}
#         for cs in assigned_class_subjects:
#             class_id = cs.class_name.id
#             if class_id not in classes_dict:
#                 classes_dict[class_id] = {
#                     'id': cs.class_name.id,
#                     'name': cs.class_name.name,
#                     'subjects': [],
#                     'student_count': cs.class_name.students.count() if hasattr(cs.class_name, 'students') else 0
#                 }
            
#             classes_dict[class_id]['subjects'].append({
#                 'id': cs.subject.id,
#                 'name': cs.subject.name,
#             })
        
#         classes = list(classes_dict.values())
        
#         return Response({
#             'classes': classes,
#             'total_classes': len(classes)
#         }, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         print("Error fetching assigned classes:", str(e))
#         import traceback
#         print("Traceback:", traceback.format_exc())
#         return Response({
#             'error': 'Failed to fetch assigned classes',
#             'details': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assigned_classes(request):
    """Get all classes assigned to the teacher"""
    try:
        from admin_tasks.models import Class
        
        # For now, return all classes
        # We'll make this filter by teacher once we know your database structure
        classes = Class.objects.all()
        
        classes_data = []
        for cls in classes:
            classes_data.append({
                'id': cls.id,
                'name': cls.name,
                'subjects': [],  # We'll add subjects later
                'student_count': 0  # We'll add student count later
            })
        
        return Response({
            'classes': classes_data,
            'total_classes': len(classes_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error fetching assigned classes:", str(e))
        import traceback
        print("Traceback:", traceback.format_exc())
        return Response({
            'error': 'Failed to fetch assigned classes',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ═══════════════════════════════════════════════════════════
#  ATTENDANCE MANAGEMENT VIEWS
# ═══════════════════════════════════════════════════════════

class TeacherClassStudentsView(APIView):
    """Get all students in a specific class"""
    permission_classes = [IsTeacherRole]
    
    def get(self, request, class_id):
        # Verify teacher is assigned to this class
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_assigned_id=class_id
        ).exists():
            return Response({
                'error': 'You are not assigned to this class.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all students in the class
        students = CustomUser.objects.filter(
            role='student',
            class_assigned_id=class_id,
            is_approved=True
        ).order_by('first_name', 'last_name')
        
        students_data = [{
            'id': student.id,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'email': student.email,
            'unique_id': student.unique_id
        } for student in students]
        
        return Response(students_data)


class AttendanceMarkView(APIView):
    """Mark attendance for students"""
    permission_classes = [IsTeacherRole]
    
    def post(self, request):
        class_id = request.data.get('class_id')
        subject_id = request.data.get('subject_id')
        date_str = request.data.get('date')
        student_ids = request.data.get('student_ids', [])
        
        if not all([class_id, subject_id, date_str]):
            return Response({
                'error': 'class_id, subject_id, and date are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify teacher assignment
            TeacherAssignment.objects.get(
                teacher=request.user,
                class_assigned_id=class_id,
                subject_id=subject_id
            )
            
            # Parse date
            attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            
            # Validate date is not in the future
            if attendance_date > timezone.now().date():
                return Response({
                    'error': 'Cannot mark attendance for future dates.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get all students in class
            all_students = CustomUser.objects.filter(
                role='student',
                class_assigned_id=class_id,
                is_approved=True
            )
            
            if not all_students.exists():
                return Response({
                    'error': 'No students found in this class.'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Mark attendance for each student
            marked_count = 0
            for student in all_students:
                # Check if already marked for this date
                attendance, created = Attendance.objects.update_or_create(
                    teacher=request.user,
                    student=student,
                    class_assigned_id=class_id,
                    date=attendance_date,
                    defaults={
                        'is_present': student.id in student_ids,
                        'time': timezone.now().time()
                    }
                )
                marked_count += 1
            
            present_count = len(student_ids)
            absent_count = marked_count - present_count
            
            return Response({
                'message': f'Attendance marked successfully for {marked_count} students!',
                'date': date_str,
                'total_students': marked_count,
                'present_count': present_count,
                'absent_count': absent_count
            }, status=status.HTTP_201_CREATED)
        
        except TeacherAssignment.DoesNotExist:
            return Response({
                'error': 'You are not assigned to this class-subject combination.'
            }, status=status.HTTP_403_FORBIDDEN)
        except ValueError:
            return Response({
                'error': 'Invalid date format. Use YYYY-MM-DD.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

































# # teachers/views.py - COMPLETE WITH ALL ENDPOINTS
# """
# Complete Teacher Module Views - ALL ENDPOINTS INCLUDED
# EduVibe Platform - 2026
# ✅ Resolved IsTeacherRole NameError
# ✅ Removed Duplicate Code & Imports
# ✅ All functionality preserved
# ✅ Added new function-based views for tests
# """
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response
# from rest_framework import status
# from .models import Test, Question, Option



# # ═══════════════════════════════════════════════════════════
# #  IMPORTS
# # ═══════════════════════════════════════════════════════════

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import api_view, permission_classes  # ✅ ADDED FOR FUNCTION-BASED VIEWS
# from django.db.models import Count, Q, Avg, Max, Min  # ✅ ADDED Max, Min
# from django.utils import timezone
# from datetime import date
# from django.db import transaction
# import traceback

# from users.models import CustomUser
# from admin_tasks.models import Class, Subject, Chapter
# from .models import (
# TeacherAssignment, Test, Question, Attendance,Assignment, Doubt, DoubtReply,Test, Question, Option)
# from students.models import TestAttempt, StudentAnswer

# # ═══════════════════════════════════════════════════════════
# #  CUSTOM PERMISSION
# # ═══════════════════════════════════════════════════════════

# class IsTeacherRole(IsAuthenticated):
#     """Only allow authenticated users with the 'teacher' role"""
    
#     def has_permission(self, request, view):
#         return (
#             super().has_permission(request, view) and
#             request.user.role == 'teacher'
#         )

# # ═══════════════════════════════════════════════════════════
# #  NEW FUNCTION-BASED VIEWS FOR TESTS
# # ═══════════════════════════════════════════════════════════

# # 



# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_all_teacher_tests(request):
#     """Get all tests created by the logged-in teacher, grouped by subject"""
#     try:
#         teacher = request.user
        
#         # Get all assignments for this teacher
#         assignments = TeacherAssignment.objects.filter(
#             teacher=teacher
#         ).select_related('class_assigned', 'subject')
        
#         tests_by_subject = []
        
#         for assignment in assignments:
#             # Get all tests for this subject-class combination
#             tests = Test.objects.filter(
#                 chapter__subject=assignment.subject,
#                 chapter__class_assigned=assignment.class_assigned,
#                 created_by=teacher
#             ).select_related('chapter').annotate(
#                 questions_count=Count('question'),  # ✅ FIXED: 'question' not 'questions'
#                 attempts_count=Count('attempts')     # ✅ FIXED: 'attempts' not 'testattempt'
#             ).order_by('-created_at')
            
#             if tests.exists():
#                 tests_data = []
#                 for test in tests:
#                     tests_data.append({
#                         'id': test.id,
#                         'name': test.name,
#                         'description': test.description,
#                         'type': test.type,
#                         'marks': test.marks,
#                         'duration_minutes': test.duration_minutes,
#                         'chapter_name': test.chapter.name,
#                         'chapter_id': test.chapter.id,
#                         'questions_count': test.questions_count,
#                         'attempts_count': test.attempts_count,
#                         'created_at': test.created_at
#                     })
                
#                 tests_by_subject.append({
#                     'subject_id': assignment.subject.id,
#                     'subject_name': assignment.subject.name,
#                     'class_id': assignment.class_assigned.id,
#                     'class_name': assignment.class_assigned.name,
#                     'tests': tests_data
#                 })
        
#         return Response({
#             'tests_by_subject': tests_by_subject
#         })
        
#     except Exception as e:
#         import traceback
#         print("ERROR in get_all_teacher_tests:")
#         print(traceback.format_exc())
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )













# # @api_view(['GET'])
# # @permission_classes([IsAuthenticated])
# # def get_all_teacher_tests(request):
# #     """Get all tests created by the logged-in teacher, grouped by subject"""
# #     try:
# #         teacher = request.user
        
# #         # Get all assignments for this teacher
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         tests_by_subject = []
        
# #         for assignment in assignments:
# #             # Get all tests for this subject-class combination
# #             tests = Test.objects.filter(
# #                 chapter__subject=assignment.subject,
# #                 chapter__class_for=assignment.class_assigned,
# #                 created_by=teacher
# #             ).select_related('chapter').annotate(
# #                 questions_count=Count('questions'),
# #                 attempts_count=Count('testattempt')
# #             ).order_by('-created_at')
            
# #             if tests.exists():
# #                 tests_data = []
# #                 for test in tests:
# #                     tests_data.append({
# #                         'id': test.id,
# #                         'name': test.name,
# #                         'description': test.description,
# #                         'type': test.type,
# #                         'marks': test.marks,
# #                         'duration_minutes': test.duration_minutes,
# #                         'chapter_name': test.chapter.name,
# #                         'chapter_id': test.chapter.id,
# #                         'questions_count': test.questions_count,
# #                         'attempts_count': test.attempts_count,
# #                         'created_at': test.created_at
# #                     })
                
# #                 tests_by_subject.append({
# #                     'subject_id': assignment.subject.id,
# #                     'subject_name': assignment.subject.name,
# #                     'class_id': assignment.class_assigned.id,
# #                     'class_name': assignment.class_assigned.name,
# #                     'tests': tests_data
# #                 })
        
# #         return Response({
# #             'tests_by_subject': tests_by_subject
# #         })
        
# #     except Exception as e:
# #         return Response(
# #             {'error': str(e)},
# #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #         )


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_test_results(request, test_id):
#     """Get all student attempts and scores for a specific test"""
#     try:
#         teacher = request.user
        
#         # Get the test and verify it belongs to this teacher
#         try:
#             test = Test.objects.select_related(
#                 'chapter__subject',
#                 'chapter__class_for'
#             ).get(id=test_id, created_by=teacher)
#         except Test.DoesNotExist:
#             return Response(
#                 {'error': 'Test not found or you do not have permission to view it'},
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         # Get all test attempts with student info
#         attempts = TestAttempt.objects.filter(
#             test=test,
#             is_submitted=True
#         ).select_related('student').order_by('-score', 'submitted_at')
        
#         # Calculate statistics
#         stats = attempts.aggregate(
#             total_attempts=Count('id'),
#             average_score=Avg('percentage'),
#             highest_score=Max('percentage'),
#             lowest_score=Min('percentage')
#         )
        
#         # Format results
#         results = []
#         for attempt in attempts:
#             results.append({
#                 'id': attempt.id,
#                 'student_name': f'{attempt.student.first_name} {attempt.student.last_name}'.strip(),
#                 'student_unique_id': attempt.student.unique_id,
#                 'score': attempt.score,
#                 'percentage': attempt.percentage,
#                 'submitted_at': attempt.submitted_at,
#                 'time_taken_minutes': attempt.time_taken_minutes
#             })
        
#         return Response({
#             'test_info': {
#                 'id': test.id,
#                 'name': test.name,
#                 'description': test.description,
#                 'type': test.type,
#                 'marks': test.marks,
#                 'duration_minutes': test.duration_minutes,
#                 'subject_name': test.chapter.subject.name,
#                 'class_name': test.chapter.class_for.name,
#                 'chapter_name': test.chapter.name
#             },
#             'results': results,
#             'stats': stats
#         })
        
#     except Exception as e:
#         return Response(
#             {'error': str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )

# # ═══════════════════════════════════════════════════════════
# #  TEACHER DASHBOARD & CORE LISTS
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

# class TeacherClassesListView(APIView):
#     """Get all classes assigned to teacher with statistics"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         # Get unique classes assigned to this teacher
#         assignments = TeacherAssignment.objects.filter(
#             teacher=request.user
#         ).select_related('class_assigned').values(
#             'class_assigned__id', 
#             'class_assigned__name'
#         ).distinct()
        
#         classes_data = []
#         for assignment in assignments:
#             class_id = assignment['class_assigned__id']
#             class_name = assignment['class_assigned__name']
            
#             # Count subjects assigned to this teacher for this class
#             subjects_count = TeacherAssignment.objects.filter(
#                 teacher=request.user,
#                 class_assigned_id=class_id
#             ).values('subject').distinct().count()
            
#             # Count students in this class
#             students_count = CustomUser.objects.filter(
#                 role='student',
#                 class_assigned_id=class_id,
#                 is_approved=True
#             ).count()
            
#             # Count tests created by this teacher for this class
#             tests_count = Test.objects.filter(
#                 created_by=request.user,
#                 chapter__class_assigned_id=class_id
#             ).count()
            
#             classes_data.append({
#                 'id': class_id,
#                 'name': class_name,
#                 'subjects_count': subjects_count,
#                 'students_count': students_count,
#                 'tests_count': tests_count
#             })
        
#         return Response(classes_data)

# class TeacherSubjectsListView(APIView):
#     """Get subjects assigned to teacher, optionally filtered by class"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         class_id = request.GET.get('class_id')
#         assignments = TeacherAssignment.objects.filter(teacher=request.user)
        
#         if class_id:
#             assignments = assignments.filter(class_assigned_id=class_id)
        
#         subjects = assignments.values('subject__id', 'subject__name').distinct()
#         return Response([{'id': s['subject__id'], 'name': s['subject__name']} for s in subjects])

# class TeacherClassSubjectsView(APIView):
#     """Get all subjects for a specific class assigned to this teacher"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, class_id):
#         # Verify teacher is assigned to this class
#         if not TeacherAssignment.objects.filter(
#             teacher=request.user,
#             class_assigned_id=class_id
#         ).exists():
#             return Response({
#                 'error': 'You are not assigned to this class.'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         # Get all subjects this teacher teaches in this class
#         assignments = TeacherAssignment.objects.filter(
#             teacher=request.user,
#             class_assigned_id=class_id
#         ).select_related('subject', 'class_assigned')
        
#         subjects_data = []
#         for assignment in assignments:
#             # Count chapters for this subject in this class
#             chapters_count = Chapter.objects.filter(
#                 subject=assignment.subject,
#                 class_assigned_id=class_id
#             ).count()
            
#             completed_chapters = Chapter.objects.filter(
#                 subject=assignment.subject,
#                 class_assigned_id=class_id,
#                 is_completed=True
#             ).count()
            
#             # Count tests for this subject in this class
#             tests_count = Test.objects.filter(
#                 created_by=request.user,
#                 chapter__subject=assignment.subject,
#                 chapter__class_assigned_id=class_id
#             ).count()
            
#             subjects_data.append({
#                 'id': assignment.subject.id,
#                 'name': assignment.subject.name,
#                 'class_id': class_id,
#                 'class_name': assignment.class_assigned.name,
#                 'chapters_count': chapters_count,
#                 'completed_chapters': completed_chapters,
#                 'tests_count': tests_count
#             })
        
#         return Response({
#             'class_id': class_id,
#             'class_name': assignments.first().class_assigned.name if assignments.exists() else None,
#             'subjects': subjects_data
#         })

# # ═══════════════════════════════════════════════════════════
# #  OTHER CORE VIEWS
# # ═══════════════════════════════════════════════════════════

# class TeacherSubjectClassesView(APIView):
#     """Returns classes filtered by subject for the teacher"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         subject_id = request.GET.get('subject_id')
#         assignments = TeacherAssignment.objects.filter(teacher=request.user)
#         if subject_id:
#             assignments = assignments.filter(subject_id=subject_id)
#         classes = assignments.values('class_assigned__id', 'class_assigned__name').distinct()
#         return Response([{'id': c['class_assigned__id'], 'name': c['class_assigned__name']} for c in classes])

# class TeacherSearchView(APIView):
#     """Search for students or resources"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         query = request.GET.get('q', '')
#         students = CustomUser.objects.filter(
#             Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(unique_id__icontains=query),
#             role='student'
#         )[:10]
#         return Response([{'id': s.id, 'name': f"{s.first_name} {s.last_name}", 'uid': s.unique_id} for s in students])

# class ClassStudentsView(APIView):
#     """Get all students in a specific class assigned to the teacher"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, class_id):
#         students = CustomUser.objects.filter(class_assigned_id=class_id, role='student', is_approved=True)
#         return Response([{'id': s.id, 'name': f"{s.first_name} {s.last_name}", 'unique_id': s.unique_id} for s in students])

# # ═══════════════════════════════════════════════════════════
# #  CHAPTER & TEST MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# # 
# class TeacherChaptersView(APIView):
#     """Get chapters for class-subject"""
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, class_id=None, subject_id=None):
#         # Accept both URL params and query params
#         class_id = class_id or request.GET.get('class_id')
#         subject_id = subject_id or request.GET.get('subject_id')
        
#         if not class_id or not subject_id:
#             return Response(
#                 {'error': 'class_id and subject_id required.'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         if not TeacherAssignment.objects.filter(
#             teacher=request.user,
#             class_assigned_id=class_id,
#             subject_id=subject_id
#         ).exists():
#             return Response(
#                 {'error': 'Not assigned to this class-subject.'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         chapters = Chapter.objects.filter(
#             class_assigned_id=class_id,
#             subject_id=subject_id
#         )
        
#         chapters_data = [{
#             'id': c.id,
#             'name': c.name,
#             'is_completed': c.is_completed,
#             'tests_count': Test.objects.filter(chapter=c).count()
#         } for c in chapters]
        
#         return Response(chapters_data)


# class MarkChapterCompleteView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request, chapter_id):
#         try:
#             chapter = Chapter.objects.get(id=chapter_id)
#             if not TeacherAssignment.objects.filter(teacher=request.user, class_assigned=chapter.class_assigned, subject=chapter.subject).exists():
#                 return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
#             chapter.is_completed = True
#             chapter.save()
#             return Response({'message': 'Chapter marked as completed!'})
#         except Chapter.DoesNotExist:
#             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

# class TestListView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         tests = Test.objects.filter(created_by=request.user).select_related('chapter')
#         return Response([{'id': t.id, 'chapter': t.chapter.name, 'type': t.type, 'marks': t.marks} for t in tests])

# # class TestCreateView(APIView):
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request):
# #         test_type = request.data.get('type')
# #         chapter_id = request.data.get('chapter_id')
# #         marks = request.data.get('marks')
        
# #         if test_type not in ['mcq', 'descriptive'] or not marks or int(marks) not in [10, 20, 50]:
# #             return Response({'error': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             chapter = Chapter.objects.get(id=chapter_id)
# #             test = Test.objects.create(type=test_type, chapter=chapter, marks=int(marks), created_by=request.user)
# #             return Response({'message': 'Test created!', 'test': {'id': test.id, 'type': test.type}}, status=status.HTTP_201_CREATED)
# #         except Chapter.DoesNotExist:
# #             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

# class TestCreateView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         """
#         Create a new test
#         Expected payload:
#         {
#             "name": "Test Name",
#             "description": "Test Description",
#             "type": "mcq" or "descriptive",
#             "marks": 10,
#             "duration_minutes": 30,
#             "chapter": chapter_id
#         }
#         """
#         # Get data from request
#         name = request.data.get('name')
#         description = request.data.get('description', '')
#         test_type = request.data.get('type')
#         marks = request.data.get('marks')
#         duration_minutes = request.data.get('duration_minutes')
#         chapter_id = request.data.get('chapter') or request.data.get('chapter_id')  # Support both field names
        
#         # Validate required fields
#         if not name:
#             return Response({
#                 'error': 'Test name is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if test_type not in ['mcq', 'descriptive']:
#             return Response({
#                 'error': 'Invalid test type. Must be "mcq" or "descriptive".'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not marks or int(marks) <= 0:
#             return Response({
#                 'error': 'Valid marks required (must be greater than 0).'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not duration_minutes or int(duration_minutes) <= 0:
#             return Response({
#                 'error': 'Valid duration required (must be greater than 0).'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not chapter_id:
#             return Response({
#                 'error': 'Chapter is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             # Verify chapter exists
#             chapter = Chapter.objects.get(id=chapter_id)
            
#             # Verify teacher is assigned to this subject and class
#             assignment_exists = TeacherAssignment.objects.filter(
#                 teacher=request.user,
#                 subject=chapter.subject,
#                 class_assigned=chapter.class_assigned
#             ).exists()
            
#             if not assignment_exists:
#                 return Response({
#                     'error': 'You are not assigned to teach this subject in this class.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Create test
#             test = Test.objects.create(
#                 name=name,
#                 description=description,
#                 type=test_type,
#                 chapter=chapter,
#                 marks=int(marks),
#                 duration_minutes=int(duration_minutes),
#                 created_by=request.user
#             )
            
#             return Response({
#                 'message': 'Test created successfully!',
#                 'test': {
#                     'id': test.id,
#                     'name': test.name,
#                     'type': test.type,
#                     'marks': test.marks,
#                     'duration_minutes': test.duration_minutes,
#                     'chapter_id': test.chapter.id,
#                     'chapter_name': test.chapter.name
#                 }
#             }, status=status.HTTP_201_CREATED)
            
#         except Chapter.DoesNotExist:
#             return Response({
#                 'error': 'Chapter not found.'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             # Log the error for debugging
#             import traceback
#             print(f"Error creating test: {str(e)}")
#             print(traceback.format_exc())
            
#             return Response({
#                 'error': f'Failed to create test: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)












# class TestDetailView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, test_id):
#         try:
#             test = Test.objects.get(id=test_id, created_by=request.user)
#             questions = Question.objects.filter(test=test)
#             return Response({
#                 'id': test.id,
#                 'type': test.type,
#                 'questions': [{'id': q.id, 'text': q.text} for q in questions]
#             })
#         except Test.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

# class TestResultsView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, test_id):
#         attempts = TestAttempt.objects.filter(test_id=test_id).select_related('student')
#         return Response([{'student': a.student.first_name, 'score': a.score, 'completed': a.completed_at} for a in attempts])

# # ═══════════════════════════════════════════════════════════
# #  QUESTION MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# # class QuestionCreateView(APIView):
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request, test_id):
# #         return Response({'message': 'Question endpoint placeholder'}, status=201)

# class QuestionCreateView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request, test_id=None):
#         """
#         Create a new question for a test
#         Expected payload (FormData):
#         {
#             "test": test_id,
#             "question_text": "Question text here",
#             "question_image": <file> (optional),
#             "option1": "Option 1" (for MCQ),
#             "option2": "Option 2" (for MCQ),
#             "option3": "Option 3" (for MCQ),
#             "option4": "Option 4" (for MCQ),
#             "correct_option": 1-4 (for MCQ),
#             "explanation": "Explanation text" (optional)
#         }
#         """
#         # Get test_id from URL param or from request body
#         test_id = test_id or request.data.get('test')
        
#         if not test_id:
#             return Response({
#                 'error': 'Test ID is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             # Verify test exists and belongs to this teacher
#             test = Test.objects.get(id=test_id, created_by=request.user)
            
#             # Get question data
#             question_text = request.data.get('question_text', '')
            
#             if not question_text:
#                 return Response({
#                     'error': 'Question text is required.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create question
#             question = Question.objects.create(
#                 test=test,
#                 question_text=question_text,
#                 explanation=request.data.get('explanation', '')
#             )
            
#             # For MCQ tests, add options
#             if test.type == 'mcq':
#                 option1 = request.data.get('option1', '')
#                 option2 = request.data.get('option2', '')
#                 option3 = request.data.get('option3', '')
#                 option4 = request.data.get('option4', '')
#                 correct_option = request.data.get('correct_option')
                
#                 if not all([option1, option2, option3, option4, correct_option]):
#                     question.delete()  # Delete the question if options are incomplete
#                     return Response({
#                         'error': 'All options and correct option are required for MCQ.'
#                     }, status=status.HTTP_400_BAD_REQUEST)
                
#                 try:
#                     correct_option = int(correct_option)
#                     if correct_option not in [1, 2, 3, 4]:
#                         question.delete()
#                         return Response({
#                             'error': 'Correct option must be between 1 and 4.'
#                         }, status=status.HTTP_400_BAD_REQUEST)
#                 except (ValueError, TypeError):
#                     question.delete()
#                     return Response({
#                         'error': 'Invalid correct option value.'
#                     }, status=status.HTTP_400_BAD_REQUEST)
                
#                 question.option1 = option1
#                 question.option2 = option2
#                 question.option3 = option3
#                 question.option4 = option4
#                 question.correct_option = correct_option
#                 question.save()
            
#             # Handle image upload if present
#             if request.FILES.get('question_image'):
#                 question.question_image = request.FILES['question_image']
#                 question.save()
            
#             return Response({
#                 'message': 'Question created successfully!',
#                 'question': {
#                     'id': question.id,
#                     'question_text': question.question_text,
#                     'has_image': bool(question.question_image)
#                 }
#             }, status=status.HTTP_201_CREATED)
            
#         except Test.DoesNotExist:
#             return Response({
#                 'error': 'Test not found or you do not have permission to add questions to this test.'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             # Log the error for debugging
#             import traceback
#             print(f"Error creating question: {str(e)}")
#             print(traceback.format_exc())
            
#             return Response({
#                 'error': f'Failed to create question: {str(e)}'
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)









# class QuestionUpdateView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def put(self, request, question_id):
#         return Response({'message': 'Update placeholder'})

# class QuestionDeleteView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def delete(self, request, question_id):
#         return Response(status=204)

# # ═══════════════════════════════════════════════════════════
# #  ATTENDANCE
# # ═══════════════════════════════════════════════════════════

# class AttendanceMarkView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         class_id = request.data.get('class_id')
#         date_str = request.data.get('date')
#         student_ids = request.data.get('student_ids', [])
        
#         try:
#             attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
#             all_students = CustomUser.objects.filter(role='student', class_assigned_id=class_id, is_approved=True)
            
#             for student in all_students:
#                 Attendance.objects.update_or_create(
#                     teacher=request.user, student=student, class_assigned_id=class_id, date=attendance_date,
#                     defaults={'is_present': student.id in student_ids, 'time': timezone.now().time()}
#                 )
#             return Response({'message': 'Attendance marked successfully!'})
#         except Exception as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# class AttendanceListView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         return Response([])

# class StudentAttendanceHistoryView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, student_id):
#         return Response([])

# # ═══════════════════════════════════════════════════════════
# #  ASSIGNMENTS
# # ═══════════════════════════════════════════════════════════

# class AssignmentCreateView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request):
#         chapter_id = request.data.get('chapter_id')
#         description = request.data.get('description', '').strip()
#         file = request.FILES.get('file')
        
#         if not description:
#             return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             chapter = Chapter.objects.get(id=chapter_id)
#             assignment = Assignment.objects.create(teacher=request.user, chapter=chapter, description=description, file=file)
#             return Response({'message': 'Assignment created!', 'id': assignment.id}, status=status.HTTP_201_CREATED)
#         except Chapter.DoesNotExist:
#             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

# class AssignmentListView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         assignments = Assignment.objects.filter(teacher=request.user)
#         return Response([{'id': a.id, 'desc': a.description} for a in assignments])

# class AssignmentDetailView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, assignment_id):
#         return Response({'id': assignment_id})

# # ═══════════════════════════════════════════════════════════
# #  DOUBTS
# # ═══════════════════════════════════════════════════════════

# class DoubtListView(APIView):
#     """Get doubts filtered by class and/or subject"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         class_id = request.GET.get('class_id')
#         subject_id = request.GET.get('subject_id')
        
#         if request.user.role == 'teacher':
#             teacher_subjects = request.user.subjects.all()
#             doubts = Doubt.objects.filter(subject__in=teacher_subjects)
#             if class_id:
#                 doubts = doubts.filter(student__class_assigned_id=class_id)
#             if subject_id:
#                 doubts = doubts.filter(subject_id=subject_id)
        
#         elif request.user.role == 'student':
#             if not request.user.class_assigned:
#                 return Response([], status=status.HTTP_200_OK)
#             doubts = Doubt.objects.filter(student__class_assigned=request.user.class_assigned)
#             if subject_id:
#                 doubts = doubts.filter(subject_id=subject_id)
#         else:
#             return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)
        
#         doubts = doubts.select_related('student', 'subject').prefetch_related('doubtreply_set__user').order_by('-created_at')
        
#         doubts_data = []
#         for doubt in doubts:
#             replies = doubt.doubtreply_set.all()
#             replies_data = [{
#                 'id': r.id,
#                 'user': {'id': r.user.id, 'name': f'{r.user.first_name} {r.user.last_name}'.strip() or r.user.username, 'role': r.user.role},
#                 'text': r.text,
#                 'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
#                 'created_at': r.created_at
#             } for r in replies]
            
#             doubts_data.append({
#                 'id': doubt.id,
#                 'student': {'id': doubt.student.id, 'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(), 'unique_id': doubt.student.unique_id},
#                 'subject': {'id': doubt.subject.id, 'name': doubt.subject.name},
#                 'text': doubt.text,
#                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
#                 'created_at': doubt.created_at,
#                 'reply_count': len(replies_data),
#                 'replies': replies_data
#             })
#         return Response(doubts_data)

# class DoubtDetailView(APIView):
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, doubt_id):
#         return Response({'id': doubt_id})

# class DoubtReplyCreateView(APIView):
#     """Teachers can reply to doubts in their subjects"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, doubt_id):
#         text = request.data.get('text', '').strip()
#         image = request.FILES.get('image')
        
#         if not text and not image:
#             return Response({'error': 'Provide text or image.'}, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             doubt = Doubt.objects.get(id=doubt_id)
#             if request.user.role == 'teacher':
#                 if doubt.subject not in request.user.subjects.all():
#                     return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
#             elif request.user.role == 'student':
#                 if request.user.class_assigned != doubt.student.class_assigned:
#                     return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
#             reply = DoubtReply.objects.create(doubt=doubt, user=request.user, text=text, image=image)
#             return Response({
#                 'message': 'Reply posted successfully!',
#                 'reply': {'id': reply.id, 'text': text, 'created_at': reply.created_at}
#             }, status=status.HTTP_201_CREATED)
#         except Doubt.DoesNotExist:
#             return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)




# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_question(request):
#     """Create a new question for a test"""
#     try:
#         # Get data from FormData
#         test_id = request.data.get('test')
#         question_text = request.data.get('question_text', '')
#         question_image = request.FILES.get('question_image', None)
#         option1 = request.data.get('option1', '')
#         option2 = request.data.get('option2', '')
#         option3 = request.data.get('option3', '')
#         option4 = request.data.get('option4', '')
#         correct_option = request.data.get('correct_option', None)
#         explanation = request.data.get('explanation', '')
        
#         # Validate test exists
#         try:
#             test = Test.objects.get(id=test_id)
#         except Test.DoesNotExist:
#             return Response(
#                 {'error': f'Test with id {test_id} does not exist'},
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         # Check if user is the creator of the test
#         if test.created_by != request.user:
#             return Response(
#                 {'error': 'You are not authorized to add questions to this test'},
#                 status=status.HTTP_403_FORBIDDEN
#             )
        
#         # Create question
#         question = Question.objects.create(
#             test=test,
#             question_text=question_text,
#             question_image=question_image,
#             option1=option1,
#             option2=option2,
#             option3=option3,
#             option4=option4,
#             correct_option=int(correct_option) if correct_option else None,
#             explanation=explanation
#         )
        
#         return Response({
#             'message': 'Question created successfully',
#             'question_id': question.id,
#             'question': {
#                 'id': question.id,
#                 'question_text': question.question_text,
#                 'option1': question.option1,
#                 'option2': question.option2,
#                 'option3': question.option3,
#                 'option4': question.option4,
#                 'correct_option': question.correct_option,
#             }
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         print("Error creating question:", str(e))
#         import traceback
#         print("Traceback:", traceback.format_exc())
#         return Response({
#             'error': 'Failed to create question',
#             'details': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_test(request):
#     """Create a new test"""
#     try:
#         data = request.data
#         print("Received data for test creation:", data)  # Debug
        
#         # Validate required fields
#         required_fields = ['chapter', 'name', 'type', 'marks', 'duration_minutes']
#         for field in required_fields:
#             if field not in data:
#                 return Response(
#                     {'error': f'Missing required field: {field}'}, 
#                     status=status.HTTP_400_BAD_REQUEST
#                 )
        
#         # Create the test
#         test = Test.objects.create(
#             chapter_id=data['chapter'],
#             name=data['name'],
#             description=data.get('description', ''),
#             type=data['type'],
#             marks=data['marks'],
#             duration_minutes=data['duration_minutes'],
#             created_by=request.user
#         )
        
#         print(f"Test created successfully with ID: {test.id}")  # Debug
        
#         # Return response with ID
#         return Response({
#             'id': test.id,  # THIS IS THE IMPORTANT PART!
#             'message': 'Test created successfully',
#             'test': {
#                 'id': test.id,
#                 'name': test.name,
#                 'description': test.description,
#                 'type': test.type,
#                 'marks': test.marks,
#                 'duration_minutes': test.duration_minutes,
#                 'chapter': test.chapter_id
#             }
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         print("Error creating test:", str(e))
#         import traceback
#         print("Traceback:", traceback.format_exc())
#         return Response({
#             'error': 'Failed to create test',
#             'details': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        







































# # # teachers/views.py - COMPLETE WITH ALL ENDPOINTS
# # """
# # Complete Teacher Module Views - ALL ENDPOINTS INCLUDED
# # EduVibe Platform - 2026
# # ✅ Resolved IsTeacherRole NameError
# # ✅ Removed Duplicate Code & Imports
# # ✅ All functionality preserved
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.permissions import IsAuthenticated
# # from django.db.models import Count, Q, Avg
# # from django.utils import timezone
# # from datetime import date

# # from users.models import CustomUser
# # from admin_tasks.models import Class, Subject, Chapter
# # from .models import (
# #     TeacherAssignment, Test, Question, Attendance,
# #     Assignment, Doubt, DoubtReply
# # )
# # from students.models import TestAttempt, StudentAnswer



# # # teachers/views.py
# # """
# # Updated Teacher Module Views
# # EduVibe Platform - 2026
# # ✅ Fixed ImportError for TeacherSubjectClassesView, TeacherSearchView, etc.
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.permissions import IsAuthenticated
# # from django.db.models import Count, Q, Avg
# # from django.utils import timezone
# # from datetime import date

# # from users.models import CustomUser
# # from admin_tasks.models import Class, Subject, Chapter
# # from .models import (
# #     TeacherAssignment, Test, Question, Attendance,
# #     Assignment, Doubt, DoubtReply
# # )
# # from students.models import TestAttempt, StudentAnswer

# # # ═══════════════════════════════════════════════════════════
# # #  CUSTOM PERMISSION
# # # ═══════════════════════════════════════════════════════════

# # @api_view(['GET'])
# # @permission_classes([IsAuthenticated])
# # def get_all_teacher_tests(request):
# #     """Get all tests created by the logged-in teacher, grouped by subject"""
# #     try:
# #         teacher = request.user
        
# #         # Get all assignments for this teacher
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         tests_by_subject = []
        
# #         for assignment in assignments:
# #             # Get all tests for this subject-class combination
# #             tests = Test.objects.filter(
# #                 chapter__subject=assignment.subject,
# #                 chapter__class_for=assignment.class_assigned,
# #                 created_by=teacher
# #             ).select_related('chapter').annotate(
# #                 questions_count=Count('questions'),
# #                 attempts_count=Count('testattempt')
# #             ).order_by('-created_at')
            
# #             if tests.exists():
# #                 tests_data = []
# #                 for test in tests:
# #                     tests_data.append({
# #                         'id': test.id,
# #                         'name': test.name,
# #                         'description': test.description,
# #                         'type': test.type,
# #                         'marks': test.marks,
# #                         'duration_minutes': test.duration_minutes,
# #                         'chapter_name': test.chapter.name,
# #                         'chapter_id': test.chapter.id,
# #                         'questions_count': test.questions_count,
# #                         'attempts_count': test.attempts_count,
# #                         'created_at': test.created_at
# #                     })
                
# #                 tests_by_subject.append({
# #                     'subject_id': assignment.subject.id,
# #                     'subject_name': assignment.subject.name,
# #                     'class_id': assignment.class_assigned.id,
# #                     'class_name': assignment.class_assigned.name,
# #                     'tests': tests_data
# #                 })
        
# #         return Response({
# #             'tests_by_subject': tests_by_subject
# #         })
        
# #     except Exception as e:
# #         return Response(
# #             {'error': str(e)},
# #             status=status.HTTP_500_INTERNAL_SERVER_ERROR
# #         )


















# # class IsTeacherRole(IsAuthenticated):
# #     def has_permission(self, request, view):
# #         return (
# #             super().has_permission(request, view) and
# #             request.user.role == 'teacher'
# #         )

# # # ... (Keep TeacherHomeView, TeacherClassesListView, TeacherSubjectsListView as provided before) ...

# # class TeacherHomeView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request):
# #         teacher = request.user
# #         assignments = TeacherAssignment.objects.filter(teacher=teacher).select_related('class_assigned', 'subject')
# #         assignments_data = []
# #         for assignment in assignments:
# #             chapters = Chapter.objects.filter(subject=assignment.subject, class_assigned=assignment.class_assigned)
# #             assignments_data.append({
# #                 'id': assignment.id,
# #                 'class': {'id': assignment.class_assigned.id, 'name': assignment.class_assigned.name},
# #                 'subject': {'id': assignment.subject.id, 'name': assignment.subject.name},
# #                 'total_chapters': chapters.count(),
# #                 'completed_chapters': chapters.filter(is_completed=True).count()
# #             })
# #         stats = {
# #             'total_tests': Test.objects.filter(created_by=teacher).count(),
# #             'total_assignments': Assignment.objects.filter(teacher=teacher).count(),
# #             'classes_teaching': TeacherAssignment.objects.filter(teacher=teacher).values('class_assigned').distinct().count()
# #         }
# #         return Response({'teacher': {'name': f'{teacher.first_name} {teacher.last_name}'.strip(), 'unique_id': teacher.unique_id}, 'assignments': assignments_data, 'stats': stats})

# # class TeacherClassesListView(APIView):
# #     """Get all classes assigned to teacher with statistics"""
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         # Get unique classes assigned to this teacher
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=request.user
# #         ).select_related('class_assigned').values(
# #             'class_assigned__id', 
# #             'class_assigned__name'
# #         ).distinct()
        
# #         classes_data = []
# #         for assignment in assignments:
# #             class_id = assignment['class_assigned__id']
# #             class_name = assignment['class_assigned__name']
            
# #             # Count subjects assigned to this teacher for this class
# #             subjects_count = TeacherAssignment.objects.filter(
# #                 teacher=request.user,
# #                 class_assigned_id=class_id
# #             ).values('subject').distinct().count()
            
# #             # Count students in this class
# #             students_count = CustomUser.objects.filter(
# #                 role='student',
# #                 class_assigned_id=class_id,
# #                 is_approved=True
# #             ).count()
            
# #             # Count tests created by this teacher for this class
# #             tests_count = Test.objects.filter(
# #                 created_by=request.user,
# #                 chapter__class_assigned_id=class_id
# #             ).count()
            
# #             classes_data.append({
# #                 'id': class_id,
# #                 'name': class_name,
# #                 'subjects_count': subjects_count,
# #                 'students_count': students_count,
# #                 'tests_count': tests_count
# #             })
        
# #         return Response(classes_data)

# # class TeacherSubjectsListView(APIView):
# #     """Get subjects assigned to teacher, optionally filtered by class"""
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         class_id = request.GET.get('class_id')
# #         assignments = TeacherAssignment.objects.filter(teacher=request.user)
        
# #         if class_id:
# #             assignments = assignments.filter(class_assigned_id=class_id)
        
# #         subjects = assignments.values('subject__id', 'subject__name').distinct()
# #         return Response([{'id': s['subject__id'], 'name': s['subject__name']} for s in subjects])


# # class TeacherClassSubjectsView(APIView):
# #     """Get all subjects for a specific class assigned to this teacher"""
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request, class_id):
# #         # Verify teacher is assigned to this class
# #         if not TeacherAssignment.objects.filter(
# #             teacher=request.user,
# #             class_assigned_id=class_id
# #         ).exists():
# #             return Response({
# #                 'error': 'You are not assigned to this class.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         # Get all subjects this teacher teaches in this class
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=request.user,
# #             class_assigned_id=class_id
# #         ).select_related('subject', 'class_assigned')
        
# #         subjects_data = []
# #         for assignment in assignments:
# #             # Count chapters for this subject in this class
# #             chapters_count = Chapter.objects.filter(
# #                 subject=assignment.subject,
# #                 class_assigned_id=class_id
# #             ).count()
            
# #             completed_chapters = Chapter.objects.filter(
# #                 subject=assignment.subject,
# #                 class_assigned_id=class_id,
# #                 is_completed=True
# #             ).count()
            
# #             # Count tests for this subject in this class
# #             tests_count = Test.objects.filter(
# #                 created_by=request.user,
# #                 chapter__subject=assignment.subject,
# #                 chapter__class_assigned_id=class_id
# #             ).count()
            
# #             subjects_data.append({
# #                 'id': assignment.subject.id,
# #                 'name': assignment.subject.name,
# #                 'class_id': class_id,
# #                 'class_name': assignment.class_assigned.name,
# #                 'chapters_count': chapters_count,
# #                 'completed_chapters': completed_chapters,
# #                 'tests_count': tests_count
# #             })
        
# #         return Response({
# #             'class_id': class_id,
# #             'class_name': assignments.first().class_assigned.name if assignments.exists() else None,
# #             'subjects': subjects_data
# #         })

# # # ═══════════════════════════════════════════════════════════
# # #  MISSING VIEWS ADDED BELOW
# # # ═══════════════════════════════════════════════════════════

# # class TeacherSubjectClassesView(APIView):
# #     """Returns classes filtered by subject for the teacher"""
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request):
# #         subject_id = request.GET.get('subject_id')
# #         assignments = TeacherAssignment.objects.filter(teacher=request.user)
# #         if subject_id:
# #             assignments = assignments.filter(subject_id=subject_id)
# #         classes = assignments.values('class_assigned__id', 'class_assigned__name').distinct()
# #         return Response([{'id': c['class_assigned__id'], 'name': c['class_assigned__name']} for c in classes])

# # class TeacherSearchView(APIView):
# #     """Search for students or resources"""
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request):
# #         query = request.GET.get('q', '')
# #         students = CustomUser.objects.filter(
# #             Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(unique_id__icontains=query),
# #             role='student'
# #         )[:10]
# #         return Response([{'id': s.id, 'name': f"{s.first_name} {s.last_name}", 'uid': s.unique_id} for s in students])

# # class ClassStudentsView(APIView):
# #     """Get all students in a specific class assigned to the teacher"""
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request, class_id):
# #         students = CustomUser.objects.filter(class_assigned_id=class_id, role='student', is_approved=True)
# #         return Response([{'id': s.id, 'name': f"{s.first_name} {s.last_name}", 'unique_id': s.unique_id} for s in students])

# # class TestListView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request):
# #         tests = Test.objects.filter(created_by=request.user).select_related('chapter')
# #         return Response([{'id': t.id, 'chapter': t.chapter.name, 'type': t.type, 'marks': t.marks} for t in tests])

# # class TestDetailView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request, test_id):
# #         try:
# #             test = Test.objects.get(id=test_id, created_by=request.user)
# #             questions = Question.objects.filter(test=test)
# #             return Response({
# #                 'id': test.id,
# #                 'type': test.type,
# #                 'questions': [{'id': q.id, 'text': q.text} for q in questions]
# #             })
# #         except Test.DoesNotExist:
# #             return Response(status=status.HTTP_404_NOT_FOUND)

# # class TestResultsView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request, test_id):
# #         attempts = TestAttempt.objects.filter(test_id=test_id).select_related('student')
# #         return Response([{'student': a.student.first_name, 'score': a.score, 'completed': a.completed_at} for a in attempts])

# # class QuestionCreateView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def post(self, request, test_id):
# #         return Response({'message': 'Question endpoint placeholder'}, status=201)

# # class QuestionUpdateView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def put(self, request, question_id):
# #         return Response({'message': 'Update placeholder'})

# # class QuestionDeleteView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def delete(self, request, question_id):
# #         return Response(status=204)

# # class AttendanceListView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request):
# #         return Response([])

# # class StudentAttendanceHistoryView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request, student_id):
# #         return Response([])

# # class AssignmentListView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request):
# #         assignments = Assignment.objects.filter(teacher=request.user)
# #         return Response([{'id': a.id, 'desc': a.description} for a in assignments])

# # class AssignmentDetailView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request, assignment_id):
# #         return Response({'id': assignment_id})

# # class DoubtDetailView(APIView):
# #     permission_classes = [IsTeacherRole]
# #     def get(self, request, doubt_id):
# #         return Response({'id': doubt_id})

# # # ... (Keep existing DoubtListView, DoubtReplyCreateView, TeacherChaptersView, MarkChapterCompleteView, TestCreateView, AttendanceMarkView, AssignmentCreateView) ...


















# # # ═══════════════════════════════════════════════════════════
# # #  CUSTOM PERMISSION
# # # ═══════════════════════════════════════════════════════════

# # class IsTeacherRole(IsAuthenticated):
# #     """Only allow authenticated users with the 'teacher' role"""
    
# #     def has_permission(self, request, view):
# #         return (
# #             super().has_permission(request, view) and
# #             request.user.role == 'teacher'
# #         )

# # # ═══════════════════════════════════════════════════════════
# # #  TEACHER DASHBOARD & CORE LISTS
# # # ═══════════════════════════════════════════════════════════

# # class TeacherHomeView(APIView):
# #     """Teacher dashboard/home"""
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         teacher = request.user
        
# #         # Get teacher's assignments
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         assignments_data = []
# #         for assignment in assignments:
# #             # Get chapters for this class-subject
# #             chapters = Chapter.objects.filter(
# #                 subject=assignment.subject,
# #                 class_assigned=assignment.class_assigned
# #             )
            
# #             assignments_data.append({
# #                 'id': assignment.id,
# #                 'class': {
# #                     'id': assignment.class_assigned.id,
# #                     'name': assignment.class_assigned.name
# #                 },
# #                 'subject': {
# #                     'id': assignment.subject.id,
# #                     'name': assignment.subject.name
# #                 },
# #                 'total_chapters': chapters.count(),
# #                 'completed_chapters': chapters.filter(is_completed=True).count()
# #             })
        
# #         # Get stats
# #         stats = {
# #             'total_tests': Test.objects.filter(created_by=teacher).count(),
# #             'total_assignments': Assignment.objects.filter(teacher=teacher).count(),
# #             'classes_teaching': TeacherAssignment.objects.filter(teacher=teacher).values('class_assigned').distinct().count()
# #         }
        
# #         return Response({
# #             'teacher': {
# #                 'name': f'{teacher.first_name} {teacher.last_name}'.strip(),
# #                 'unique_id': teacher.unique_id,
# #                 'subjects': [
# #                     {'id': s.id, 'name': s.name}
# #                     for s in teacher.subjects.all()
# #                 ]
# #             },
# #             'assignments': assignments_data,
# #             'stats': stats
# #         })

# # class TeacherClassesListView(APIView):
# #     """
# #     Get all classes where teacher is assigned.
# #     Used for: Dropdowns in TeacherDoubts, TeacherAttendance, etc.
# #     """
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         teacher = request.user
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned').values(
# #             'class_assigned__id', 'class_assigned__name'
# #         ).distinct()
        
# #         classes = [
# #             {'id': a['class_assigned__id'], 'name': a['class_assigned__name']}
# #             for a in assignments
# #         ]
# #         return Response(classes)

# # class TeacherSubjectsListView(APIView):
# #     """
# #     Get all subjects teacher teaches (optionally filtered by class)
# #     """
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         teacher = request.user
# #         class_id = request.GET.get('class_id')
        
# #         assignments = TeacherAssignment.objects.filter(teacher=teacher)
# #         if class_id:
# #             assignments = assignments.filter(class_assigned_id=class_id)
        
# #         subjects = assignments.select_related('subject').values(
# #             'subject__id', 'subject__name'
# #         ).distinct()
        
# #         return Response([
# #             {'id': s['subject__id'], 'name': s['subject__name']}
# #             for s in subjects
# #         ])

# # # ═══════════════════════════════════════════════════════════
# # #  DOUBT MANAGEMENT
# # # ═══════════════════════════════════════════════════════════

# # class DoubtListView(APIView):
# #     """Get doubts filtered by class and/or subject"""
# #     permission_classes = [IsAuthenticated]
    
# #     def get(self, request):
# #         class_id = request.GET.get('class_id')
# #         subject_id = request.GET.get('subject_id')
        
# #         if request.user.role == 'teacher':
# #             teacher_subjects = request.user.subjects.all()
# #             doubts = Doubt.objects.filter(subject__in=teacher_subjects)
# #             if class_id:
# #                 doubts = doubts.filter(student__class_assigned_id=class_id)
# #             if subject_id:
# #                 doubts = doubts.filter(subject_id=subject_id)
        
# #         elif request.user.role == 'student':
# #             if not request.user.class_assigned:
# #                 return Response([], status=status.HTTP_200_OK)
# #             doubts = Doubt.objects.filter(student__class_assigned=request.user.class_assigned)
# #             if subject_id:
# #                 doubts = doubts.filter(subject_id=subject_id)
# #         else:
# #             return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)
        
# #         doubts = doubts.select_related('student', 'subject').prefetch_related('doubtreply_set__user').order_by('-created_at')
        
# #         doubts_data = []
# #         for doubt in doubts:
# #             replies = doubt.doubtreply_set.all()
# #             replies_data = [{
# #                 'id': r.id,
# #                 'user': {'id': r.user.id, 'name': f'{r.user.first_name} {r.user.last_name}'.strip() or r.user.username, 'role': r.user.role},
# #                 'text': r.text,
# #                 'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
# #                 'created_at': r.created_at
# #             } for r in replies]
            
# #             doubts_data.append({
# #                 'id': doubt.id,
# #                 'student': {'id': doubt.student.id, 'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(), 'unique_id': doubt.student.unique_id},
# #                 'subject': {'id': doubt.subject.id, 'name': doubt.subject.name},
# #                 'text': doubt.text,
# #                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #                 'created_at': doubt.created_at,
# #                 'reply_count': len(replies_data),
# #                 'replies': replies_data
# #             })
# #         return Response(doubts_data)

# # class DoubtReplyCreateView(APIView):
# #     """Teachers can reply to doubts in their subjects"""
# #     permission_classes = [IsAuthenticated]
    
# #     def post(self, request, doubt_id):
# #         text = request.data.get('text', '').strip()
# #         image = request.FILES.get('image')
        
# #         if not text and not image:
# #             return Response({'error': 'Provide text or image.'}, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             doubt = Doubt.objects.get(id=doubt_id)
# #             if request.user.role == 'teacher':
# #                 if doubt.subject not in request.user.subjects.all():
# #                     return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
# #             elif request.user.role == 'student':
# #                 if request.user.class_assigned != doubt.student.class_assigned:
# #                     return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
# #             reply = DoubtReply.objects.create(doubt=doubt, user=request.user, text=text, image=image)
# #             return Response({
# #                 'message': 'Reply posted successfully!',
# #                 'reply': {'id': reply.id, 'text': text, 'created_at': reply.created_at}
# #             }, status=status.HTTP_201_CREATED)
# #         except Doubt.DoesNotExist:
# #             return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)

# # # ═══════════════════════════════════════════════════════════
# # #  CHAPTER & TEST MANAGEMENT
# # # ═══════════════════════════════════════════════════════════

# # class TeacherChaptersView(APIView):
# #     """Get chapters for class-subject"""
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         class_id = request.GET.get('class_id')
# #         subject_id = request.GET.get('subject_id')
        
# #         if not class_id or not subject_id:
# #             return Response({'error': 'class_id and subject_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        
# #         if not TeacherAssignment.objects.filter(teacher=request.user, class_assigned_id=class_id, subject_id=subject_id).exists():
# #             return Response({'error': 'Not assigned to this class-subject.'}, status=status.HTTP_403_FORBIDDEN)
        
# #         chapters = Chapter.objects.filter(class_assigned_id=class_id, subject_id=subject_id)
# #         chapters_data = [{
# #             'id': c.id,
# #             'name': c.name,
# #             'is_completed': c.is_completed,
# #             'tests_count': Test.objects.filter(chapter=c).count()
# #         } for c in chapters]
# #         return Response(chapters_data)

# # class MarkChapterCompleteView(APIView):
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request, chapter_id):
# #         try:
# #             chapter = Chapter.objects.get(id=chapter_id)
# #             if not TeacherAssignment.objects.filter(teacher=request.user, class_assigned=chapter.class_assigned, subject=chapter.subject).exists():
# #                 return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
            
# #             chapter.is_completed = True
# #             chapter.save()
# #             return Response({'message': 'Chapter marked as completed!'})
# #         except Chapter.DoesNotExist:
# #             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

# # class TestCreateView(APIView):
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request):
# #         test_type = request.data.get('type')
# #         chapter_id = request.data.get('chapter_id')
# #         marks = request.data.get('marks')
        
# #         if test_type not in ['mcq', 'descriptive'] or not marks or int(marks) not in [10, 20, 50]:
# #             return Response({'error': 'Invalid data.'}, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             chapter = Chapter.objects.get(id=chapter_id)
# #             test = Test.objects.create(type=test_type, chapter=chapter, marks=int(marks), created_by=request.user)
# #             return Response({'message': 'Test created!', 'test': {'id': test.id, 'type': test.type}}, status=status.HTTP_201_CREATED)
# #         except Chapter.DoesNotExist:
# #             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)

# # # ═══════════════════════════════════════════════════════════
# # #  ATTENDANCE & ASSIGNMENTS
# # # ═══════════════════════════════════════════════════════════

# # class AttendanceMarkView(APIView):
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request):
# #         class_id = request.data.get('class_id')
# #         date_str = request.data.get('date')
# #         student_ids = request.data.get('student_ids', [])
        
# #         try:
# #             attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
# #             all_students = CustomUser.objects.filter(role='student', class_assigned_id=class_id, is_approved=True)
            
# #             for student in all_students:
# #                 Attendance.objects.update_or_create(
# #                     teacher=request.user, student=student, class_assigned_id=class_id, date=attendance_date,
# #                     defaults={'is_present': student.id in student_ids, 'time': timezone.now().time()}
# #                 )
# #             return Response({'message': 'Attendance marked successfully!'})
# #         except Exception as e:
# #             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# # class AssignmentCreateView(APIView):
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request):
# #         chapter_id = request.data.get('chapter_id')
# #         description = request.data.get('description', '').strip()
# #         file = request.FILES.get('file')
        
# #         if not description:
# #             return Response({'error': 'Description is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             chapter = Chapter.objects.get(id=chapter_id)
# #             assignment = Assignment.objects.create(teacher=request.user, chapter=chapter, description=description, file=file)
# #             return Response({'message': 'Assignment created!', 'id': assignment.id}, status=status.HTTP_201_CREATED)
# #         except Chapter.DoesNotExist:
# #             return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)



















