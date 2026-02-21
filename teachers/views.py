# teachers/views.py - FIXED VERSION
"""
Complete Teacher Module Views - ALL ENDPOINTS INCLUDED
EduVibe Platform - 2026
✅ Fixed IndentationError
✅ Removed Duplicate AttendanceMarkView
✅ All functionality preserved
✅ Updated to use ClassSubject model
"""

# ═══════════════════════════════════════════════════════════
#  IMPORTS
# ═══════════════════════════════════════════════════════════

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Count, Q, Avg, Max, Min
from django.utils import timezone
from datetime import date
from django.db import transaction
import traceback

# from academics.models import AcademicClass as Class, Subject, ClassSubject, Chapter

# from .models import (
#     TeacherAssignment, Test, Question, Attendance, Assignment, Doubt, DoubtReply, Option
# )

from users.models import CustomUser
from academics.models import (
    AcademicClass as Class,
    Subject,
    ClassSubject,
    Chapter,
    TeacherAssignment,   # ✅ Real assignments saved by admin
)
from .models import (
    Test, Question, Attendance, Assignment, Doubt, DoubtReply, Option
)
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
#  FUNCTION-BASED VIEWS FOR TESTS
# ═══════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_teacher_tests(request):
    """Get all tests created by the logged-in teacher, grouped by subject"""
    try:
        teacher = request.user
        print(f"\n=== Fetching tests for teacher: {teacher.email} ===")

        all_tests = Test.objects.filter(
            created_by=teacher
        ).select_related('chapter__class_subject__subject', 'chapter__class_subject__academic_class')

        print(f"Total tests found: {all_tests.count()}")

        tests_by_subject = {}

        for test in all_tests:
            cs = test.chapter.class_subject if test.chapter else None
            subject_id = cs.subject.id if cs else 0

            if subject_id not in tests_by_subject:
                tests_by_subject[subject_id] = {
                    'subject_id': subject_id,
                    'subject_name': cs.subject.name if cs else 'Unknown',
                    'class_id': cs.academic_class.id if cs else None,
                    'class_name': cs.academic_class.name if cs else 'Unknown',
                    'tests': []
                }

            questions_count = Question.objects.filter(test=test).count()
            attempts_count = TestAttempt.objects.filter(test=test).count()

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

        tests_by_subject_list = list(tests_by_subject.values())
        print(f"Returning {len(tests_by_subject_list)} subject groups")

        return Response({'tests_by_subject': tests_by_subject_list})

    except Exception as e:
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
# def get_test_results(request, test_id):
#     """Get all student attempts and scores for a specific test"""
#     try:
#         teacher = request.user

#         try:
#             test = Test.objects.select_related(
#                 'chapter__class_subject__subject',
#                 'chapter__class_subject__academic_class'
#             ).get(id=test_id, created_by=teacher)
#         except Test.DoesNotExist:
#             return Response(
#                 {'error': 'Test not found or you do not have permission to view it'},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         attempts = TestAttempt.objects.filter(
#             test=test,
#             is_submitted=True
#         ).select_related('student').order_by('-score', 'submitted_at')

#         stats = attempts.aggregate(
#             total_attempts=Count('id'),
#             average_score=Avg('percentage'),
#             highest_score=Max('percentage'),
#             lowest_score=Min('percentage')
#         )

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
#                 'subject_name': test.chapter.class_subject.subject.name if test.chapter and test.chapter.class_subject else '',
#                 'class_name': test.chapter.class_subject.academic_class.name if test.chapter and test.chapter.class_subject else '',
#                 'chapter_name': test.chapter.name if test.chapter else ''
#             },
#             'results': results,
#             'stats': stats
#         })

#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_test_results(request, test_id):
    """Get all student attempts and scores for a specific test"""
    try:
        teacher = request.user

        try:
            test = Test.objects.select_related(
                'chapter__class_subject__subject',
                'chapter__class_subject__academic_class'
            ).get(id=test_id, created_by=teacher)
        except Test.DoesNotExist:
            return Response(
                {'error': 'Test not found or you do not have permission to view it'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ✅ FIXED: only use fields that actually exist on TestAttempt model
        attempts = TestAttempt.objects.filter(
            test=test
        ).select_related('student').order_by('-score', 'attempted_at')

        # ✅ Calculate percentage manually (not a model field)
        results = []
        for attempt in attempts:
            percentage = round((attempt.score / test.marks) * 100, 2) if test.marks > 0 else 0
            results.append({
                'id':                attempt.id,
                'student_name':      f'{attempt.student.first_name} {attempt.student.last_name}'.strip(),
                'student_unique_id': attempt.student.unique_id,
                'score':             attempt.score,
                'percentage':        percentage,
                'attempted_at':      attempt.attempted_at,
            })

        # ✅ Calculate stats manually (no Avg/Max/Min on non-existent fields)
        total = len(results)
        percentages = [r['percentage'] for r in results]
        stats = {
            'total_attempts': total,
            'average_score':  round(sum(percentages) / total, 2) if total > 0 else None,
            'highest_score':  max(percentages) if total > 0 else None,
            'lowest_score':   min(percentages) if total > 0 else None,
        }

        return Response({
            'test_info': {
                'id':               test.id,
                'name':             test.name,
                'description':      test.description,
                'type':             test.type,
                'marks':            test.marks,
                'duration_minutes': test.duration_minutes,
                'subject_name':     test.chapter.class_subject.subject.name if test.chapter and test.chapter.class_subject else '',
                'class_name':       test.chapter.class_subject.academic_class.name if test.chapter and test.chapter.class_subject else '',
                'chapter_name':     test.chapter.name if test.chapter else ''
            },
            'results': results,
            'stats':   stats
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# ─────────────────────────────────────────────────────────────────────────────
# ADD THESE TWO VIEWS to teachers/views.py
# Place them right after the existing get_test_results function (around line 173)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_test(request, test_id):
    """Edit test details — name, description, duration_minutes"""
    try:
        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found or not authorized'}, status=404)

        # Only allow editing safe fields
        if 'name' in request.data:
            test.name = request.data['name'].strip()
        if 'description' in request.data:
            test.description = request.data['description'].strip()
        if 'duration_minutes' in request.data:
            dur = int(request.data['duration_minutes'])
            if dur < 1:
                return Response({'error': 'Duration must be at least 1 minute'}, status=400)
            test.duration_minutes = dur

        test.save()

        return Response({
            'message': 'Test updated successfully',
            'test': {
                'id': test.id,
                'name': test.name,
                'description': test.description,
                'duration_minutes': test.duration_minutes,
            }
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_test(request, test_id):
    """Delete a test and all its questions"""
    try:
        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found or not authorized'}, status=404)

        test_name = test.name
        # Deleting the test cascades to questions and attempts (set in models)
        test.delete()

        return Response({'message': f'Test "{test_name}" deleted successfully'})

    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ─────────────────────────────────────────────────────────────────────────────
# ALSO REPLACE the placeholder QuestionUpdateView with this real implementation:
# ─────────────────────────────────────────────────────────────────────────────

class QuestionUpdateView(APIView):
    permission_classes = [IsTeacherRole]

    def put(self, request, question_id):
        try:
            question = Question.objects.select_related('test').get(
                id=question_id,
                test__created_by=request.user
            )
        except Question.DoesNotExist:
            return Response({'error': 'Question not found or not authorized'}, status=404)

        if 'question_text' in request.data:
            question.question_text = request.data['question_text'].strip()
        if 'explanation' in request.data:
            question.explanation = request.data['explanation'].strip()
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

        question.save()
        return Response({'message': 'Question updated successfully'})


class QuestionDeleteView(APIView):
    permission_classes = [IsTeacherRole]

    def delete(self, request, question_id):
        try:
            question = Question.objects.select_related('test').get(
                id=question_id,
                test__created_by=request.user
            )
        except Question.DoesNotExist:
            return Response({'error': 'Question not found or not authorized'}, status=404)

        question.delete()
        return Response(status=204)


# ─────────────────────────────────────────────────────────────────────────────
# ADD THESE 2 URL PATTERNS to teachers/urls.py urlpatterns list:
# ─────────────────────────────────────────────────────────────────────────────

# path('tests/<int:test_id>/edit/',   views.edit_test,   name='test-edit'),
# path('tests/<int:test_id>/delete/', views.delete_test, name='test-delete'),





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_question(request):
    """Create a new question for a test"""
    try:
        test_id = request.POST.get('test')
        question_text = request.POST.get('question_text', '')
        option1 = request.POST.get('option1', '')
        option2 = request.POST.get('option2', '')
        option3 = request.POST.get('option3', '')
        option4 = request.POST.get('option4', '')
        correct_option = request.POST.get('correct_option', None)
        explanation = request.POST.get('explanation', '')
        question_image = request.FILES.get('question_image', None)

        if not test_id:
            return Response({'error': 'Test ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response(
                {'error': f'Test with id {test_id} does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )

        if test.created_by != request.user:
            return Response(
                {'error': 'You are not authorized to add questions to this test'},
                status=status.HTTP_403_FORBIDDEN
            )

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
        print("Received data for test creation:", data)

        required_fields = ['chapter', 'name', 'type', 'marks', 'duration_minutes']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        test = Test.objects.create(
            chapter_id=data['chapter'],
            name=data['name'],
            description=data.get('description', ''),
            type=data['type'],
            marks=data['marks'],
            duration_minutes=data['duration_minutes'],
            created_by=request.user
        )

        print(f"Test created successfully with ID: {test.id}")

        return Response({
            'id': test.id,
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
#         classes = Class.objects.all()

#         classes_data = []
#         for cls in classes:
#             classes_data.append({
#                 'id': cls.id,
#                 'name': cls.name,
#                 'subjects': [],
#                 'student_count': 0
#             })

#         return Response({
#             'classes': classes_data,
#             'total_classes': len(classes_data)
#         }, status=status.HTTP_200_OK)

#     except Exception as e:
#         print("Error fetching assigned classes:", str(e))
#         print("Traceback:", traceback.format_exc())
#         return Response({
#             'error': 'Failed to fetch assigned classes',
#             'details': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assigned_classes(request):
    """
    Get all classes+subjects+chapters assigned to this teacher
    via academics.TeacherAssignment → ClassSubject
    """
    try:
        from academics.models import TeacherAssignment as AcTA, Chapter as AcChapter

        assignments = AcTA.objects.filter(
            teacher=request.user
        ).select_related(
            'class_subject__academic_class',
            'class_subject__subject',
        )

        # Group by class
        classes_map = {}
        for a in assignments:
            cls   = a.class_subject.academic_class
            subj  = a.class_subject.subject
            cs    = a.class_subject

            if cls.id not in classes_map:
                classes_map[cls.id] = {
                    'id':       cls.id,
                    'name':     cls.name,
                    'subjects': []
                }

            # Get chapters for this class_subject
            chapters = AcChapter.objects.filter(
                class_subject=cs
            ).order_by('order', 'name')

            chapters_data = [{
                'id':           ch.id,
                'name':         ch.name,
                'order':        ch.order,
                'is_completed': getattr(ch, 'is_completed', False),
            } for ch in chapters]

            classes_map[cls.id]['subjects'].append({
                'id':               subj.id,
                'name':             subj.name,
                'class_subject_id': cs.id,
                'assignment_id':    a.id,
                'chapters':         chapters_data,
            })

        return Response({
            'classes': list(classes_map.values()),
            'total_classes': len(classes_map)
        }, status=200)

    except Exception as e:
        import traceback
        return Response({
            'error': str(e),
            'details': traceback.format_exc()
        }, status=500)

# ═══════════════════════════════════════════════════════════
#  TEACHER DASHBOARD & CORE LISTS
# ═══════════════════════════════════════════════════════════

class TeacherHomeView(APIView):
    """Teacher dashboard/home - Returns dashboard statistics for frontend"""
    permission_classes = [IsTeacherRole]

    def get(self, request):
        teacher = request.user

        # Get teacher's assignments
        assignments = TeacherAssignment.objects.filter(
            teacher=teacher
        ).select_related('class_subject__academic_class', 'class_subject__subject')

        assignments_data = []
        for assignment in assignments:
            chapters = Chapter.objects.filter(class_subject=assignment.class_subject)
            assignments_data.append({
                'id': assignment.id,
                'class': {
                    'id': assignment.class_subject.academic_class.id,
                    'name': assignment.class_subject.academic_class.name
                },
                'subject': {
                    'id': assignment.class_subject.subject.id,
                    'name': assignment.class_subject.subject.name
                },
                'total_chapters': chapters.count(),
                'completed_chapters': chapters.filter(is_completed=True).count()
            })

        # Count unique classes assigned to this teacher
        assigned_classes_count = TeacherAssignment.objects.filter(
            teacher=teacher
        ).values('class_subject__academic_class').distinct().count()

        # Count unique subjects assigned to this teacher
        total_subjects_count = TeacherAssignment.objects.filter(
            teacher=teacher
        ).values('class_subject__subject').distinct().count()

        # Count total tests created by this teacher
        total_tests_count = Test.objects.filter(created_by=teacher).count()

        # Get recent tests (last 5)
        recent_tests = Test.objects.filter(
            created_by=teacher
        ).select_related(
            'chapter__class_subject__subject',
            'chapter__class_subject__academic_class'
        ).order_by('-created_at')[:5]

        recent_tests_data = []
        for test in recent_tests:
            recent_tests_data.append({
                'id': test.id,
                'name': test.name,
                'type': test.type,
                'marks': test.marks,
                'subject_name': test.chapter.class_subject.subject.name if test.chapter and test.chapter.class_subject else '',
                'class_name': test.chapter.class_subject.academic_class.name if test.chapter and test.chapter.class_subject else '',
                'chapter_name': test.chapter.name if test.chapter else '',
                'created_at': test.created_at.isoformat()
            })

        stats = {
            'total_tests': total_tests_count,
            'total_assignments': Assignment.objects.filter(teacher=teacher).count(),
            'classes_teaching': assigned_classes_count
        }

        return Response({
            'assigned_classes': assigned_classes_count,
            'total_subjects': total_subjects_count,
            'total_tests': total_tests_count,
            'recent_tests': recent_tests_data,
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


# class TeacherClassesListView(APIView):
#     """Get all classes assigned to teacher with statistics"""
#     permission_classes = [IsTeacherRole]

#     # def get(self, request):
#     #     assignments = TeacherAssignment.objects.filter(
#     #         teacher=request.user
#     #     ).select_related('class_subject__academic_class').values(
#     #         'class_subject__academic_class__id',
#     #         'class_subject__academic_class__name'
#     #     ).distinct()

#     #     classes_data = []
#     #     for assignment in assignments:
#     #         class_id = assignment['class_subject__academic_class__id']
#     #         class_name = assignment['class_subject__academic_class__name']
#     def get(self, request):
#     # Get unique class IDs only — prevents duplicate cards
#         unique_class_ids = TeacherAssignment.objects.filter(
#             teacher=request.user
#         ).values_list(
#             'class_subject__academic_class__id', flat=True
#         ).distinct()

#         classes_data = []
#         for class_id in unique_class_ids:
#             cls = Class.objects.get(id=class_id)
#             class_name = cls.name

#             subjects_count = TeacherAssignment.objects.filter(
#                 teacher=request.user,
#                 class_subject__academic_class_id=class_id
#             ).values('class_subject__subject').distinct().count()

#             students_count = CustomUser.objects.filter(
#                 role='student',
#                 class_assigned_id=class_id,
#                 is_approved=True
#             ).count()

#             tests_count = Test.objects.filter(
#                 created_by=request.user,
#                 chapter__class_subject__academic_class_id=class_id
#             ).count()

#             classes_data.append({
#                 'id': class_id,
#                 'name': class_name,
#                 'subjects_count': subjects_count,
#                 'students_count': students_count,
#                 'tests_count': tests_count
#             })

#         return Response(classes_data)
class TeacherClassesListView(APIView):
    """Get all classes assigned to teacher with statistics"""
    permission_classes = [IsTeacherRole]

    def get(self, request):
        # Get unique class IDs — prevents duplicate cards
        # unique_class_ids = list(
        #     TeacherAssignment.objects.filter(
        #         teacher=request.user
        #     ).values_list(
        #         'class_subject__academic_class__id', flat=True
        #     ).distinct()
        # )
        unique_class_ids = list(set(
            TeacherAssignment.objects.filter(
                teacher=request.user
            ).values_list(
                'class_subject__academic_class__id', flat=True
            )
        ))

        classes_data = []
        for class_id in unique_class_ids:
            cls = Class.objects.get(id=class_id)

            subjects_count = TeacherAssignment.objects.filter(
                teacher=request.user,
                class_subject__academic_class_id=class_id
            ).values('class_subject__subject').distinct().count()

            students_count = CustomUser.objects.filter(
                role='student',
                class_assigned_id=class_id,
                is_approved=True
            ).count()

            tests_count = Test.objects.filter(
                created_by=request.user,
                chapter__class_subject__academic_class_id=class_id
            ).count()

            classes_data.append({
                'id': class_id,
                'name': cls.name,
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
            assignments = assignments.filter(class_subject__academic_class_id=class_id)

        # subjects = assignments.values(
        #     'class_subject__subject__id',
        #     'class_subject__subject__name'
        # ).distinct()

        # return Response([{
        #     'id': s['class_subject__subject__id'],
        #     'name': s['class_subject__subject__name']
        # } for s in subjects])
        subjects = assignments.values(
            'class_subject__subject__id',
            'class_subject__subject__name'
        ).distinct()

        # ✅ Deduplicate by subject id using dict
        seen = {}
        for s in subjects:
            sid = s['class_subject__subject__id']
            if sid not in seen:
                seen[sid] = s['class_subject__subject__name']

        return Response([{
            'id': sid,
            'name': sname
        } for sid, sname in seen.items()])


class TeacherClassSubjectsView(APIView):
    """Get all subjects for a specific class assigned to this teacher"""
    permission_classes = [IsTeacherRole]

    def get(self, request, class_id):
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_subject__academic_class_id=class_id
        ).exists():
            return Response(
                {'error': 'You are not assigned to this class.'},
                status=status.HTTP_403_FORBIDDEN
            )

        assignments = TeacherAssignment.objects.filter(
            teacher=request.user,
            class_subject__academic_class_id=class_id
        ).select_related('class_subject__subject', 'class_subject__academic_class')

        subjects_data = []
        for assignment in assignments:
            cs = assignment.class_subject
            chapters_count = Chapter.objects.filter(class_subject=cs).count()
            completed_chapters = Chapter.objects.filter(class_subject=cs, is_completed=True).count()
            tests_count = Test.objects.filter(
                created_by=request.user,
                chapter__class_subject=cs
            ).count()

            subjects_data.append({
                'id': cs.subject.id,
                'name': cs.subject.name,
                'class_subject_id': cs.id,
                'class_id': class_id,
                'class_name': cs.academic_class.name,
                'chapters_count': chapters_count,
                'completed_chapters': completed_chapters,
                'tests_count': tests_count
            })

        return Response({
            'class_id': class_id,
            'class_name': assignments.first().class_subject.academic_class.name if assignments.exists() else None,
            'subjects': subjects_data
        })


class TeacherSubjectClassesView(APIView):
    """Returns classes filtered by subject for the teacher"""
    permission_classes = [IsTeacherRole]

    def get(self, request):
        subject_id = request.GET.get('subject_id')
        assignments = TeacherAssignment.objects.filter(teacher=request.user)

        if subject_id:
            assignments = assignments.filter(class_subject__subject_id=subject_id)

        classes = assignments.values(
            'class_subject__academic_class__id',
            'class_subject__academic_class__name'
        ).distinct()

        return Response([{
            'id': c['class_subject__academic_class__id'],
            'name': c['class_subject__academic_class__name']
        } for c in classes])


class TeacherSearchView(APIView):
    """Search for students or resources"""
    permission_classes = [IsTeacherRole]

    def get(self, request):
        query = request.GET.get('q', '')
        students = CustomUser.objects.filter(
            Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(unique_id__icontains=query),
            role='student'
        )[:10]
        return Response([{
            'id': s.id,
            'name': f"{s.first_name} {s.last_name}",
            'uid': s.unique_id
        } for s in students])

# ═══════════════════════════════════════════════════════════
#  CHAPTER & TEST MANAGEMENT
# ═══════════════════════════════════════════════════════════

class TeacherChaptersView(APIView):
    """Get chapters for class-subject"""
    permission_classes = [IsTeacherRole]

    def get(self, request, class_id=None, subject_id=None):
        class_id = class_id or request.GET.get('class_id')
        subject_id = subject_id or request.GET.get('subject_id')

        if not class_id or not subject_id:
            return Response(
                {'error': 'class_id and subject_id required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_subject__academic_class_id=class_id,
            class_subject__subject_id=subject_id
        ).exists():
            return Response(
                {'error': 'Not assigned to this class-subject.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            cs = ClassSubject.objects.get(academic_class_id=class_id, subject_id=subject_id)
        except ClassSubject.DoesNotExist:
            return Response(
                {'error': 'Class-subject combination not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        chapters = Chapter.objects.filter(class_subject=cs)

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
            if not TeacherAssignment.objects.filter(
                teacher=request.user,
                class_subject=chapter.class_subject
            ).exists():
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
        return Response([{
            'id': t.id,
            'chapter': t.chapter.name,
            'type': t.type,
            'marks': t.marks
        } for t in tests])


class TestCreateView(APIView):
    permission_classes = [IsTeacherRole]

    def post(self, request):
        """Create a new test"""
        name = request.data.get('name')
        description = request.data.get('description', '')
        test_type = request.data.get('type')
        marks = request.data.get('marks')
        duration_minutes = request.data.get('duration_minutes')
        chapter_id = request.data.get('chapter') or request.data.get('chapter_id')

        if not name:
            return Response({'error': 'Test name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if test_type not in ['mcq', 'descriptive']:
            return Response(
                {'error': 'Invalid test type. Must be "mcq" or "descriptive".'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not marks or int(marks) <= 0:
            return Response(
                {'error': 'Valid marks required (must be greater than 0).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not duration_minutes or int(duration_minutes) <= 0:
            return Response(
                {'error': 'Valid duration required (must be greater than 0).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not chapter_id:
            return Response({'error': 'Chapter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            chapter = Chapter.objects.get(id=chapter_id)

            assignment_exists = TeacherAssignment.objects.filter(
                teacher=request.user,
                class_subject=chapter.class_subject
            ).exists()

            if not assignment_exists:
                return Response(
                    {'error': 'You are not assigned to teach this subject in this class.'},
                    status=status.HTTP_403_FORBIDDEN
                )

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
            return Response({'error': 'Chapter not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error creating test: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to create test: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TestDetailView(APIView):
    permission_classes = [IsTeacherRole]

    def get(self, request, test_id):
        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
            questions = Question.objects.filter(test=test)
            return Response({
                'id': test.id,
                'type': test.type,
                'questions': [{'id': q.id, 'text': q.question_text} for q in questions]
            })
        except Test.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class TestResultsView(APIView):
    permission_classes = [IsTeacherRole]

    def get(self, request, test_id):
        attempts = TestAttempt.objects.filter(test_id=test_id).select_related('student')
        return Response([{
            'student': a.student.first_name,
            'score': a.score
        } for a in attempts])

# ═══════════════════════════════════════════════════════════
#  QUESTION MANAGEMENT
# ═══════════════════════════════════════════════════════════

class QuestionCreateView(APIView):
    permission_classes = [IsTeacherRole]

    def post(self, request, test_id=None):
        """Create a new question for a test"""
        test_id = test_id or request.data.get('test')

        if not test_id:
            return Response({'error': 'Test ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            test = Test.objects.get(id=test_id, created_by=request.user)
            question_text = request.data.get('question_text', '')

            if not question_text:
                return Response({'error': 'Question text is required.'}, status=status.HTTP_400_BAD_REQUEST)

            question = Question.objects.create(
                test=test,
                question_text=question_text,
                explanation=request.data.get('explanation', '')
            )

            if test.type == 'mcq':
                option1 = request.data.get('option1', '')
                option2 = request.data.get('option2', '')
                option3 = request.data.get('option3', '')
                option4 = request.data.get('option4', '')
                correct_option = request.data.get('correct_option')

                if not all([option1, option2, option3, option4, correct_option]):
                    question.delete()
                    return Response(
                        {'error': 'All options and correct option are required for MCQ.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                try:
                    correct_option = int(correct_option)
                    if correct_option not in [1, 2, 3, 4]:
                        question.delete()
                        return Response(
                            {'error': 'Correct option must be between 1 and 4.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except (ValueError, TypeError):
                    question.delete()
                    return Response(
                        {'error': 'Invalid correct option value.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                question.option1 = option1
                question.option2 = option2
                question.option3 = option3
                question.option4 = option4
                question.correct_option = correct_option
                question.save()

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
            return Response(
                {'error': 'Test not found or you do not have permission to add questions to this test.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error creating question: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to create question: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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

class ClassStudentsView(APIView):
    """Get all students in a class"""
    permission_classes = [IsTeacherRole]

    def get(self, request, class_id):
        if not TeacherAssignment.objects.filter(
            teacher=request.user,
            class_subject__academic_class_id=class_id
        ).exists():
            return Response(
                {'error': 'You are not assigned to this class.'},
                status=status.HTTP_403_FORBIDDEN
            )

        students = CustomUser.objects.filter(
            role='student',
            class_assigned_id=class_id,
            is_approved=True
        ).order_by('first_name', 'last_name')

        students_data = [{
            'id': student.id,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'full_name': student.get_full_name() or student.username,
            'roll_number': student.unique_id,
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
        from_time_str = request.data.get('from_time')
        to_time_str = request.data.get('to_time')

        if not all([class_id, subject_id, date_str]):
            return Response(
                {'error': 'class_id, subject_id, and date are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get ClassSubject
            try:
                cs = ClassSubject.objects.get(academic_class_id=class_id, subject_id=subject_id)
            except ClassSubject.DoesNotExist:
                return Response(
                    {'error': 'Class-subject not found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify teacher assignment
            assignment = TeacherAssignment.objects.get(
                teacher=request.user,
                class_subject=cs
            )

            # Parse date
            attendance_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()

            if attendance_date > timezone.now().date():
                return Response(
                    {'error': 'Cannot mark attendance for future dates.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            from_time = None
            to_time = None
            duration_minutes = None

            if from_time_str and to_time_str:
                try:
                    from_time = timezone.datetime.strptime(from_time_str, '%H:%M').time()
                    to_time = timezone.datetime.strptime(to_time_str, '%H:%M').time()
                    from_datetime = timezone.datetime.combine(attendance_date, from_time)
                    to_datetime = timezone.datetime.combine(attendance_date, to_time)
                    duration_minutes = int((to_datetime - from_datetime).total_seconds() / 60)
                    if duration_minutes < 0:
                        return Response(
                            {'error': 'End time must be after start time.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except ValueError:
                    return Response(
                        {'error': 'Invalid time format. Use HH:MM (24-hour format).'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            all_students = CustomUser.objects.filter(
                role='student',
                class_assigned_id=class_id,
                is_approved=True
            )

            if not all_students.exists():
                return Response(
                    {'error': 'No students found in this class.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            marked_count = 0
            for student in all_students:
                Attendance.objects.update_or_create(
                    teacher=request.user,
                    student=student,
                    class_subject=cs,
                    date=attendance_date,
                    defaults={
                        'is_present': student.id in student_ids,
                        'time': timezone.now().time(),
                        'from_time': from_time,
                        'to_time': to_time,
                        'duration_minutes': duration_minutes
                    }
                )
                marked_count += 1

            present_count = len(student_ids)
            absent_count = marked_count - present_count

            response_data = {
                'message': f'Attendance marked successfully for {marked_count} students!',
                'date': date_str,
                'subject': cs.subject.name,
                'total_students': marked_count,
                'present_count': present_count,
                'absent_count': absent_count
            }

            if from_time and to_time:
                response_data.update({
                    'from_time': from_time_str,
                    'to_time': to_time_str,
                    'duration_minutes': duration_minutes
                })

            return Response(response_data, status=status.HTTP_201_CREATED)

        except TeacherAssignment.DoesNotExist:
            return Response(
                {'error': 'You are not assigned to this class-subject combination.'},
                status=status.HTTP_403_FORBIDDEN
            )
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            import traceback
            print("Error in attendance marking:")
            print(traceback.format_exc())
            return Response(
                {'error': f'An error occurred: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AttendanceListView(APIView):
    permission_classes = [IsTeacherRole]

    def get(self, request):
        return Response([])


class StudentAttendanceHistoryView(APIView):
    permission_classes = [IsTeacherRole]

    def get(self, request, student_id):
        return Response([])


class TeacherAttendanceHistoryView(APIView):
    """Get teacher's attendance history with time tracking"""
    permission_classes = [IsTeacherRole]

    def get(self, request):
        try:
            teacher = request.user

            class_id = request.GET.get('class_id')
            subject_id = request.GET.get('subject_id')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')

            attendance_records = Attendance.objects.filter(
                teacher=teacher
            ).select_related(
                'class_subject__academic_class',
                'class_subject__subject',
                'student'
            ).order_by('-date', '-from_time')

            if class_id:
                attendance_records = attendance_records.filter(
                    class_subject__academic_class_id=int(class_id)
                )
            if subject_id:
                attendance_records = attendance_records.filter(
                    class_subject__subject_id=int(subject_id)
                )
            if start_date:
                attendance_records = attendance_records.filter(date__gte=start_date)
            if end_date:
                attendance_records = attendance_records.filter(date__lte=end_date)

            from collections import defaultdict
            sessions_dict = defaultdict(lambda: {
                'students': [],
                'present_count': 0,
                'absent_count': 0
            })

            for record in attendance_records:
                session_key = (str(record.date), record.class_subject_id)

                session = sessions_dict[session_key]
                session['date'] = str(record.date)
                session['class_id'] = record.class_subject.academic_class_id
                session['class_name'] = record.class_subject.academic_class.name
                session['subject_id'] = record.class_subject.subject_id
                session['subject_name'] = record.class_subject.subject.name
                session['from_time'] = record.from_time
                session['to_time'] = record.to_time
                session['duration_minutes'] = record.duration_minutes

                session['students'].append(record.student_id)
                if record.is_present:
                    session['present_count'] += 1
                else:
                    session['absent_count'] += 1

            sessions_list = []
            for session_key, session_data in sessions_dict.items():
                sessions_list.append({
                    'date': session_data['date'],
                    'class_id': session_data['class_id'],
                    'class_name': session_data['class_name'],
                    'subject_id': session_data['subject_id'],
                    'subject_name': session_data['subject_name'],
                    'from_time': str(session_data['from_time']) if session_data['from_time'] else None,
                    'to_time': str(session_data['to_time']) if session_data['to_time'] else None,
                    'duration_minutes': session_data['duration_minutes'] or 0,
                    'total_students': len(session_data['students']),
                    'present': session_data['present_count'],
                    'absent': session_data['absent_count']
                })

            sessions_list.sort(key=lambda x: x['date'], reverse=True)

            total_sessions = len(sessions_list)
            total_duration = sum(s['duration_minutes'] or 0 for s in sessions_list)

            return Response({
                'overall_stats': {
                    'total_sessions': total_sessions,
                    'total_duration_minutes': total_duration,
                    'total_duration_hours': round(total_duration / 60, 2) if total_duration > 0 else 0
                },
                'sessions': sessions_list
            })

        except Exception as e:
            import traceback
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            return Response(
                {'error': 'Description is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            chapter = Chapter.objects.get(id=chapter_id)
            assignment = Assignment.objects.create(
                teacher=request.user,
                chapter=chapter,
                description=description,
                file=file
            )
            return Response(
                {'message': 'Assignment created!', 'id': assignment.id},
                status=status.HTTP_201_CREATED
            )
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
            teacher_assignments = TeacherAssignment.objects.filter(teacher=request.user)
            doubts = Doubt.objects.filter(
                class_subject__in=teacher_assignments.values('class_subject')
            )
            if class_id:
                doubts = doubts.filter(class_subject__academic_class_id=class_id)
            if subject_id:
                doubts = doubts.filter(class_subject__subject_id=subject_id)

        elif request.user.role == 'student':
            if not request.user.class_assigned:
                return Response([], status=status.HTTP_200_OK)
            doubts = Doubt.objects.filter(
                class_subject__academic_class=request.user.class_assigned
            )
            if subject_id:
                doubts = doubts.filter(class_subject__subject_id=subject_id)
        else:
            return Response({'error': 'Invalid role.'}, status=status.HTTP_403_FORBIDDEN)

        doubts = doubts.select_related(
            'student',
            'class_subject__subject'
        ).prefetch_related('replies__replied_by').order_by('-created_at')

        doubts_data = []
        for doubt in doubts:
            replies = doubt.replies.all()
            replies_data = [{
                'id': r.id,
                'user': {
                    'id': r.replied_by.id,
                    'name': f'{r.replied_by.first_name} {r.replied_by.last_name}'.strip() or r.replied_by.username,
                    'role': r.replied_by.role
                },
                'text': r.reply_text,
                'image_url': request.build_absolute_uri(r.reply_image.url) if r.reply_image else None,
                'created_at': r.created_at
            } for r in replies]

            doubts_data.append({
                'id': doubt.id,
                'student': {
                    'id': doubt.student.id,
                    'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(),
                    'unique_id': doubt.student.unique_id
                },
                'subject': {
                    'id': doubt.class_subject.subject.id,
                    'name': doubt.class_subject.subject.name
                },
                'text': doubt.doubt_text,
                'image_url': request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
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
    """Teachers and students can reply to doubts"""
    permission_classes = [IsAuthenticated]

    def post(self, request, doubt_id):
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')

        if not text and not image:
            return Response(
                {'error': 'Provide text or image.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            doubt = Doubt.objects.get(id=doubt_id)

            if request.user.role == 'teacher':
                if not TeacherAssignment.objects.filter(
                    teacher=request.user,
                    class_subject=doubt.class_subject
                ).exists():
                    return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

            elif request.user.role == 'student':
                if request.user.class_assigned != doubt.student.class_assigned:
                    return Response({'error': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

            reply = DoubtReply.objects.create(
                doubt=doubt,
                replied_by=request.user,
                reply_text=text,
                reply_image=image
            )

            return Response({
                'message': 'Reply posted successfully!',
                'reply': {'id': reply.id, 'text': text, 'created_at': reply.created_at}
            }, status=status.HTTP_201_CREATED)

        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found.'}, status=status.HTTP_404_NOT_FOUND)



# ── Teacher Notification Views ────────────────────────────────────────────────

class TeacherNotificationsView(APIView):
    """GET /api/teachers/notifications/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'teacher':
            return Response({'error': 'Teacher access required'}, status=403)
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


class TeacherMarkNotificationReadView(APIView):
    """POST /api/teachers/notifications/<id>/mark-read/"""
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


class TeacherMarkAllReadView(APIView):
    """POST /api/teachers/notifications/mark-all-read/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from admin_tasks.models import Notification
        Notification.objects.filter(
            user=request.user, is_read=False
        ).update(is_read=True)
        return Response({'message': 'All marked as read'}, status=200)











