# teachers/views_doubts.py
"""
Doubt Management Views for Teachers
EduVibe Platform - 2026
Uses academics.TeacherAssignment with class_subject FK (confirmed from shell)
TeacherAssignment fields: id, teacher, class_subject, created_at
ClassSubject fields: id, subject, academic_class, created_at
Doubt fields: id, student, class_subject, doubt_text, doubt_image, status, created_at
DoubtReply fields: id, doubt, replied_by, reply_text, reply_image, created_at
"""

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from academics.models import ClassSubject, TeacherAssignment, Doubt, DoubtReply


def is_teacher(user):
    return user.is_authenticated and user.role == 'teacher'


# ═══════════════════════════════════════════════════════════
#  FUNCTION-BASED VIEWS (used by urls.py)
# ═══════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_assigned_classes(request):
    """
    GET /api/teachers/teacher-assigned-classes/
    Returns all classes+subjects the teacher is assigned to teach.
    Groups by class for easy display.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        # TeacherAssignment → class_subject → subject + academic_class
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user
        ).select_related(
            'class_subject__subject',
            'class_subject__academic_class',
        )

        # Group by class
        classes_map = {}
        for a in assignments:
            cls = a.class_subject.academic_class
            subj = a.class_subject.subject

            if cls.id not in classes_map:
                classes_map[cls.id] = {
                    'id':       cls.id,
                    'name':     cls.name,
                    'subjects': []
                }

            classes_map[cls.id]['subjects'].append({
                'id':                 subj.id,
                'name':               subj.name,
                'class_subject_id':   a.class_subject.id,
                'assignment_id':      a.id,
            })

        return Response({
            'success': True,
            'classes': list(classes_map.values())
        }, status=200)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_assigned_subjects(request):
    """
    GET /api/teachers/teacher-assigned-subjects/
    Returns flat list of all subject+class combos assigned to teacher.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user
        ).select_related(
            'class_subject__subject',
            'class_subject__academic_class',
        )

        subjects_data = [{
            'assignment_id':    a.id,
            'class_subject_id': a.class_subject.id,
            'subject_id':       a.class_subject.subject.id,
            'subject_name':     a.class_subject.subject.name,
            'class_id':         a.class_subject.academic_class.id,
            'class_name':       a.class_subject.academic_class.name,
        } for a in assignments]

        return Response({'success': True, 'subjects': subjects_data}, status=200)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_doubts(request):
    """
    GET /api/teachers/teacher-doubts/?class_id=X&subject_id=Y
    Returns doubts for teacher's assigned class-subject.
    Teacher can only see doubts for subjects they teach.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        class_id   = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')

        # Get all class_subjects assigned to this teacher
        assigned_cs_ids = TeacherAssignment.objects.filter(
            teacher=request.user
        ).values_list('class_subject_id', flat=True)

        # Base queryset — only doubts in teacher's assigned class-subjects
        doubts = Doubt.objects.filter(
            class_subject__id__in=assigned_cs_ids
        ).select_related(
            'student',
            'class_subject__subject',
            'class_subject__academic_class',
        ).prefetch_related('replies__replied_by').order_by('-created_at')

        # Optional filters
        if class_id:
            doubts = doubts.filter(class_subject__academic_class__id=class_id)
        if subject_id:
            doubts = doubts.filter(class_subject__subject__id=subject_id)

        doubts_data = []
        for doubt in doubts:
            replies_data = [{
                'id':              reply.id,
                'reply_text':      reply.reply_text,
                'reply_image':     request.build_absolute_uri(reply.reply_image.url)
                                   if reply.reply_image else None,
                'replied_by_name': reply.replied_by.get_full_name() or reply.replied_by.username,
                'replied_by_role': reply.replied_by.role,
                'created_at':      reply.created_at.strftime('%Y-%m-%d %H:%M'),
            } for reply in doubt.replies.all()]

            doubts_data.append({
                'id':           doubt.id,
                'doubt_text':   doubt.doubt_text,
                'doubt_image':  request.build_absolute_uri(doubt.doubt_image.url)
                                if doubt.doubt_image else None,
                'subject': {
                    'id':   doubt.class_subject.subject.id,
                    'name': doubt.class_subject.subject.name,
                },
                'class': {
                    'id':   doubt.class_subject.academic_class.id,
                    'name': doubt.class_subject.academic_class.name,
                },
                'student': {
                    'id':        doubt.student.id,
                    'name':      doubt.student.get_full_name() or doubt.student.username,
                    'unique_id': doubt.student.unique_id,
                },
                'status':      doubt.status,
                'reply_count': len(replies_data),
                'replies':     replies_data,
                'created_at':  doubt.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        return Response({'success': True, 'doubts': doubts_data}, status=200)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_to_doubt(request, doubt_id):
    """
    POST /api/teachers/teacher-doubts/<doubt_id>/reply/
    Teacher replies to a doubt.
    Security: teacher must be assigned to that class-subject.
    Auto-marks doubt as 'answered'.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        doubt = Doubt.objects.select_related(
            'class_subject__subject',
            'class_subject__academic_class',
        ).get(id=doubt_id)

        # Security check — teacher must be assigned to this class-subject
        is_assigned = TeacherAssignment.objects.filter(
            teacher=request.user,
            class_subject=doubt.class_subject
        ).exists()

        if not is_assigned:
            return Response({
                'error': 'You are not assigned to teach this subject in this class'
            }, status=403)

        reply_text  = request.data.get('reply_text', '').strip()
        reply_image = request.FILES.get('reply_image')

        if not reply_text and not reply_image:
            return Response({'error': 'reply_text or reply_image is required'}, status=400)

        reply = DoubtReply.objects.create(
            doubt=doubt,
            replied_by=request.user,
            reply_text=reply_text,
            reply_image=reply_image or None,
        )

        # Mark as answered
        doubt.status = 'answered'
        doubt.save()

        return Response({
            'success': True,
            'message': 'Reply posted successfully!',
            'reply': {
                'id':          reply.id,
                'reply_text':  reply.reply_text,
                'replied_by':  request.user.get_full_name() or request.user.username,
                'created_at':  reply.created_at.strftime('%Y-%m-%d %H:%M'),
            }
        }, status=201)

    except Doubt.DoesNotExist:
        return Response({'error': 'Doubt not found'}, status=404)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


# ═══════════════════════════════════════════════════════════
#  CLASS-BASED VIEWS (kept for compatibility with urls.py)
# ═══════════════════════════════════════════════════════════

class DoubtListView(APIView):
    """
    GET /api/teachers/doubts/
    Lists all doubts for teacher's assigned subjects.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_teacher(request.user):
            return Response({'error': 'Teacher access required'}, status=403)

        assigned_cs_ids = TeacherAssignment.objects.filter(
            teacher=request.user
        ).values_list('class_subject_id', flat=True)

        if not assigned_cs_ids:
            return Response({
                'message': 'You are not assigned to any subjects yet.',
                'doubts': [], 'total_count': 0
            }, status=200)

        doubts = Doubt.objects.filter(
            class_subject__id__in=assigned_cs_ids
        ).select_related(
            'student',
            'class_subject__subject',
            'class_subject__academic_class',
        ).prefetch_related('replies__replied_by').order_by('-created_at')

        doubts_data = []
        for doubt in doubts:
            replies_data = [{
                'id':              r.id,
                'replied_by_name': r.replied_by.get_full_name() or r.replied_by.username,
                'replied_by_role': r.replied_by.role,
                'reply_text':      r.reply_text,
                'reply_image':     request.build_absolute_uri(r.reply_image.url) if r.reply_image else None,
                'created_at':      r.created_at.strftime('%Y-%m-%d %H:%M'),
            } for r in doubt.replies.all()]

            doubts_data.append({
                'id':          doubt.id,
                'student_name': doubt.student.get_full_name() or doubt.student.username,
                'subject_name': doubt.class_subject.subject.name,
                'class_name':   doubt.class_subject.academic_class.name,
                'doubt_text':   doubt.doubt_text,
                'doubt_image':  request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
                'status':       doubt.status,
                'created_at':   doubt.created_at.strftime('%Y-%m-%d %H:%M'),
                'replies':      replies_data,
            })

        return Response({'doubts': doubts_data, 'total_count': len(doubts_data)}, status=200)


class DoubtDetailView(APIView):
    """GET /api/teachers/doubts/<doubt_id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, doubt_id):
        if not is_teacher(request.user):
            return Response({'error': 'Teacher access required'}, status=403)
        try:
            doubt = Doubt.objects.select_related(
                'student', 'class_subject__subject', 'class_subject__academic_class'
            ).get(id=doubt_id)

            replies_data = [{
                'id':              r.id,
                'replied_by_name': r.replied_by.get_full_name() or r.replied_by.username,
                'replied_by_role': r.replied_by.role,
                'reply_text':      r.reply_text,
                'reply_image':     request.build_absolute_uri(r.reply_image.url) if r.reply_image else None,
                'created_at':      r.created_at.strftime('%Y-%m-%d %H:%M'),
            } for r in doubt.replies.all()]

            return Response({
                'id':           doubt.id,
                'student_name': doubt.student.get_full_name() or doubt.student.username,
                'subject_name': doubt.class_subject.subject.name,
                'class_name':   doubt.class_subject.academic_class.name,
                'doubt_text':   doubt.doubt_text,
                'doubt_image':  request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
                'status':       doubt.status,
                'created_at':   doubt.created_at.strftime('%Y-%m-%d %H:%M'),
                'replies':      replies_data,
            }, status=200)

        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found'}, status=404)


class DoubtReplyCreateView(APIView):
    """POST /api/teachers/doubts/<doubt_id>/reply/"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, doubt_id):
        if not is_teacher(request.user):
            return Response({'error': 'Teacher access required'}, status=403)
        try:
            doubt = Doubt.objects.get(id=doubt_id)

            # Security: teacher must be assigned to this class-subject
            if not TeacherAssignment.objects.filter(
                teacher=request.user,
                class_subject=doubt.class_subject
            ).exists():
                return Response({'error': 'Not assigned to this subject'}, status=403)

            reply_text  = request.data.get('reply_text', '').strip()
            reply_image = request.FILES.get('reply_image')

            if not reply_text and not reply_image:
                return Response({'error': 'reply_text or reply_image required'}, status=400)

            reply = DoubtReply.objects.create(
                doubt=doubt,
                replied_by=request.user,
                reply_text=reply_text,
                reply_image=reply_image or None,
            )

            doubt.status = 'answered'
            doubt.save()

            return Response({
                'message': 'Reply added successfully!',
                'reply': {
                    'id':         reply.id,
                    'reply_text': reply.reply_text,
                    'replied_by': request.user.get_full_name() or request.user.username,
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
                }
            }, status=201)

        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found'}, status=404)




























# # teachers/views_doubts.py
# """
# Doubt Management Views for Teachers
# EduVibe Platform - 2026
# Teachers can view doubts in their assigned subjects and reply to them
# """

# from rest_framework.views import APIView
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.db.models import Q, Count

# # ✅ FIXED IMPORTS - Using correct model names
# from users.models import CustomUser
# # from academics.models import AcademicClass, Subject, Chapter, TeacherSubjectAssignment, Doubt, DoubtReply
# from academics.models import AcademicClass, Subject, Chapter, TeacherAssignment, Doubt, DoubtReply
# from students.models import StudentAcademicInfo


# class IsTeacherRole(IsAuthenticated):
#     """Only allow teachers"""
    
#     def has_permission(self, request, view):
#         return (
#             super().has_permission(request, view) and
#             request.user.role == 'teacher'
#         )


# # ═══════════════════════════════════════════════════════════
# #  FUNCTION-BASED VIEWS FOR DOUBTS (NEW - FOR FRONTEND)
# # ═══════════════════════════════════════════════════════════

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_teacher_assigned_classes(request):
#     """
#     Get all classes and subjects assigned to the logged-in teacher
#     """
#     try:
#         teacher = request.user
        
#         # Get all subject assignments for this teacher
#         assignments = TeacherSubjectAssignment.objects.filter(
#             teacher=teacher
#         ).select_related('class_assigned', 'subject')
        
#         # Organize data by class
#         classes_data = {}
#         for assignment in assignments:
#             class_id = assignment.class_assigned.id
#             class_name = assignment.class_assigned.name
            
#             if class_id not in classes_data:
#                 classes_data[class_id] = {
#                     'id': class_id,
#                     'name': class_name,
#                     'subjects': []
#                 }
            
#             classes_data[class_id]['subjects'].append({
#                 'id': assignment.subject.id,
#                 'name': assignment.subject.name,
#                 'assignment_id': assignment.id
#             })
        
#         # Convert to list
#         result = list(classes_data.values())
        
#         return Response({
#             'success': True,
#             'classes': result
#         }, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         return Response({
#             'success': False,
#             'error': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_teacher_assigned_subjects(request):
#     """
#     Get all subjects assigned to the logged-in teacher with class info
#     """
#     try:
#         teacher = request.user
        
#         assignments = TeacherSubjectAssignment.objects.filter(
#             teacher=teacher
#         ).select_related('class_assigned', 'subject')
        
#         subjects_data = []
#         for assignment in assignments:
#             subjects_data.append({
#                 'id': assignment.id,
#                 'subject_id': assignment.subject.id,
#                 'subject_name': assignment.subject.name,
#                 'class_id': assignment.class_assigned.id,
#                 'class_name': assignment.class_assigned.name,
#             })
        
#         return Response({
#             'success': True,
#             'subjects': subjects_data
#         }, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         return Response({
#             'success': False,
#             'error': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_teacher_doubts(request):
#     """
#     Get doubts for teacher's assigned subjects in specific class
#     """
#     try:
#         teacher = request.user
#         class_id = request.GET.get('class_id')
#         subject_id = request.GET.get('subject_id')
        
#         if not class_id or not subject_id:
#             return Response({
#                 'success': False,
#                 'error': 'class_id and subject_id are required'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Verify teacher is assigned to this subject in this class
#         assignment_exists = TeacherSubjectAssignment.objects.filter(
#             teacher=teacher,
#             subject_id=subject_id,
#             class_assigned_id=class_id
#         ).exists()
        
#         if not assignment_exists:
#             return Response({
#                 'success': False,
#                 'error': 'You are not assigned to this subject in this class'
#             }, status=status.HTTP_403_FORBIDDEN)
        
#         # Get students in this class
#         students_in_class = StudentAcademicInfo.objects.filter(
#             academic_class_id=class_id
#         ).values_list('student_id', flat=True)
        
#         # Get doubts from these students for this subject
#         doubts = Doubt.objects.filter(
#             student_id__in=students_in_class,
#             subject_id=subject_id
#         ).select_related('student', 'subject')
        
#         doubts_data = []
#         for doubt in doubts:
#             # Get replies
#             replies = DoubtReply.objects.filter(doubt=doubt).select_related('replied_by')
#             replies_data = [{
#                 'id': reply.id,
#                 'reply_text': reply.reply_text,
#                 'reply_image': request.build_absolute_uri(reply.reply_image.url) if reply.reply_image else None,
#                 'replied_by_name': reply.replied_by.get_full_name(),
#                 'replied_by_role': reply.replied_by.role,
#                 'created_at': reply.created_at.isoformat(),
#             } for reply in replies]
            
#             doubts_data.append({
#                 'id': doubt.id,
#                 'student_name': doubt.student.get_full_name(),
#                 'subject_name': doubt.subject.name,
#                 'doubt_text': doubt.doubt_text,
#                 'doubt_image': request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
#                 'status': doubt.status,
#                 'created_at': doubt.created_at.isoformat(),
#                 'replies': replies_data,
#             })
        
#         return Response({
#             'success': True,
#             'doubts': doubts_data
#         }, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         return Response({
#             'success': False,
#             'error': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def reply_to_doubt(request, doubt_id):
#     """
#     Teacher replies to a doubt
#     """
#     try:
#         doubt = Doubt.objects.get(id=doubt_id)
        
#         reply_text = request.data.get('reply_text', '')
#         reply_image = request.FILES.get('reply_image')
        
#         if not reply_text and not reply_image:
#             return Response({
#                 'success': False,
#                 'error': 'Either reply_text or reply_image is required'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Create reply
#         reply = DoubtReply.objects.create(
#             doubt=doubt,
#             replied_by=request.user,
#             reply_text=reply_text,
#             reply_image=reply_image
#         )
        
#         # Update doubt status
#         doubt.status = 'answered'
#         doubt.save()
        
#         return Response({
#             'success': True,
#             'message': 'Reply submitted successfully',
#             'reply': {
#                 'id': reply.id,
#                 'reply_text': reply.reply_text,
#                 'replied_by': request.user.get_full_name(),
#                 'created_at': reply.created_at.isoformat(),
#             }
#         }, status=status.HTTP_201_CREATED)
        
#     except Doubt.DoesNotExist:
#         return Response({
#             'success': False,
#             'error': 'Doubt not found'
#         }, status=status.HTTP_404_NOT_FOUND)
#     except Exception as e:
#         return Response({
#             'success': False,
#             'error': str(e)
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ═══════════════════════════════════════════════════════════
# #  CLASS-BASED VIEWS FOR DOUBTS (EXISTING - KEEP FOR COMPATIBILITY)
# # ═══════════════════════════════════════════════════════════

# class DoubtListView(APIView):
#     """
#     List all doubts (existing view - keeping for compatibility)
#     """
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request):
#         teacher = request.user
        
#         # Get all teacher assignments
#         assignments = TeacherSubjectAssignment.objects.filter(
#             teacher=teacher
#         ).select_related('class_assigned', 'subject')
        
#         if not assignments.exists():
#             return Response({
#                 'message': 'You are not assigned to teach any subjects yet.',
#                 'doubts': [],
#                 'total_count': 0
#             }, status=status.HTTP_200_OK)
        
#         # Build query for doubts
#         doubt_queries = []
#         for assignment in assignments:
#             # Get students in this class
#             students_in_class = StudentAcademicInfo.objects.filter(
#                 academic_class=assignment.class_assigned
#             ).values_list('student_id', flat=True)
            
#             doubt_queries.append(
#                 Q(student_id__in=students_in_class) &
#                 Q(subject=assignment.subject)
#             )
        
#         # Combine all queries with OR
#         if doubt_queries:
#             combined_query = doubt_queries[0]
#             for query in doubt_queries[1:]:
#                 combined_query |= query
            
#             doubts_query = Doubt.objects.filter(combined_query)
#         else:
#             doubts_query = Doubt.objects.none()
        
#         # Get doubts with related data
#         doubts = doubts_query.select_related('student', 'subject').order_by('-created_at')
        
#         # Prepare response
#         doubts_data = []
#         for doubt in doubts:
#             replies = DoubtReply.objects.filter(doubt=doubt).select_related('replied_by')
            
#             replies_data = [{
#                 'id': reply.id,
#                 'replied_by_name': reply.replied_by.get_full_name(),
#                 'replied_by_role': reply.replied_by.role,
#                 'reply_text': reply.reply_text,
#                 'reply_image': request.build_absolute_uri(reply.reply_image.url) if reply.reply_image else None,
#                 'created_at': reply.created_at.isoformat(),
#             } for reply in replies]
            
#             doubts_data.append({
#                 'id': doubt.id,
#                 'student_name': doubt.student.get_full_name(),
#                 'subject_name': doubt.subject.name,
#                 'doubt_text': doubt.doubt_text,
#                 'doubt_image': request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
#                 'status': doubt.status,
#                 'created_at': doubt.created_at.isoformat(),
#                 'replies': replies_data,
#             })
        
#         return Response({
#             'doubts': doubts_data,
#             'total_count': len(doubts_data)
#         }, status=status.HTTP_200_OK)


# class DoubtDetailView(APIView):
#     """
#     Get detailed view of a specific doubt
#     """
#     permission_classes = [IsTeacherRole]
    
#     def get(self, request, doubt_id):
#         try:
#             doubt = Doubt.objects.select_related('student', 'subject').get(id=doubt_id)
            
#             replies = DoubtReply.objects.filter(doubt=doubt).select_related('replied_by')
#             replies_data = [{
#                 'id': reply.id,
#                 'replied_by_name': reply.replied_by.get_full_name(),
#                 'replied_by_role': reply.replied_by.role,
#                 'reply_text': reply.reply_text,
#                 'reply_image': request.build_absolute_uri(reply.reply_image.url) if reply.reply_image else None,
#                 'created_at': reply.created_at.isoformat(),
#             } for reply in replies]
            
#             doubt_data = {
#                 'id': doubt.id,
#                 'student_name': doubt.student.get_full_name(),
#                 'subject_name': doubt.subject.name,
#                 'doubt_text': doubt.doubt_text,
#                 'doubt_image': request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
#                 'status': doubt.status,
#                 'created_at': doubt.created_at.isoformat(),
#                 'replies': replies_data,
#             }
            
#             return Response(doubt_data, status=status.HTTP_200_OK)
            
#         except Doubt.DoesNotExist:
#             return Response({
#                 'error': 'Doubt not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class DoubtReplyCreateView(APIView):
#     """
#     Teacher replies to a doubt (class-based version)
#     """
#     permission_classes = [IsTeacherRole]
    
#     def post(self, request, doubt_id):
#         try:
#             doubt = Doubt.objects.get(id=doubt_id)
            
#             reply_text = request.data.get('reply_text', '')
#             reply_image = request.FILES.get('reply_image')
            
#             if not reply_text and not reply_image:
#                 return Response({
#                     'error': 'Either reply_text or reply_image is required'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create reply
#             reply = DoubtReply.objects.create(
#                 doubt=doubt,
#                 replied_by=request.user,
#                 reply_text=reply_text,
#                 reply_image=reply_image
#             )
            
#             # Update doubt status
#             doubt.status = 'answered'
#             doubt.save()
            
#             return Response({
#                 'message': 'Reply added successfully!',
#                 'reply': {
#                     'id': reply.id,
#                     'reply_text': reply.reply_text,
#                     'replied_by': request.user.get_full_name(),
#                     'created_at': reply.created_at.isoformat(),
#                 }
#             }, status=status.HTTP_201_CREATED)
            
#         except Doubt.DoesNotExist:
#             return Response({
#                 'error': 'Doubt not found.'
#             }, status=status.HTTP_404_NOT_FOUND)























# # # teachers/views_doubts.py
# # """
# # Doubt Management Views for Teachers
# # EduVibe Platform - 2026
# # Teachers can view doubts in their assigned subjects and reply to them
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.permissions import IsAuthenticated
# # from django.db.models import Q, Count

# # from users.models import CustomUser
# # from admin_tasks.models import Subject
# # from .models import Doubt, DoubtReply, TeacherAssignment
# # from .notifications import notify_about_doubt_reply


# # class IsTeacherRole(IsAuthenticated):
# #     """Only allow teachers"""
    
# #     def has_permission(self, request, view):
# #         return (
# #             super().has_permission(request, view) and
# #             request.user.role == 'teacher'
# #         )


# # # ═══════════════════════════════════════════════════════════
# # #  DOUBT MANAGEMENT FOR TEACHERS
# # # ═══════════════════════════════════════════════════════════

# # class TeacherDoubtListView(APIView):
# #     """
# #     List all doubts from classes where teacher teaches
# #     GET /api/teachers/doubts/
# #     Can filter by: ?subject_id=5 or ?class_id=3
# #     """
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         teacher = request.user
        
# #         # Get all teacher assignments
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         if not assignments.exists():
# #             return Response({
# #                 'message': 'You are not assigned to teach any subjects yet.',
# #                 'doubts': [],
# #                 'total_count': 0
# #             }, status=status.HTTP_200_OK)
        
# #         # Build query for doubts
# #         doubt_queries = []
# #         for assignment in assignments:
# #             doubt_queries.append(
# #                 Q(student__class_assigned=assignment.class_assigned) &
# #                 Q(subject=assignment.subject)
# #             )
        
# #         # Combine all queries with OR
# #         if doubt_queries:
# #             combined_query = doubt_queries[0]
# #             for query in doubt_queries[1:]:
# #                 combined_query |= query
            
# #             doubts_query = Doubt.objects.filter(combined_query)
# #         else:
# #             doubts_query = Doubt.objects.none()
        
# #         # Apply filters
# #         subject_id = request.query_params.get('subject_id')
# #         class_id = request.query_params.get('class_id')
        
# #         if subject_id:
# #             try:
# #                 doubts_query = doubts_query.filter(subject_id=subject_id)
# #             except ValueError:
# #                 pass
        
# #         if class_id:
# #             try:
# #                 doubts_query = doubts_query.filter(student__class_assigned_id=class_id)
# #             except ValueError:
# #                 pass
        
# #         # Get doubts with related data
# #         doubts = doubts_query.select_related(
# #             'student', 'subject', 'student__class_assigned'
# #         ).prefetch_related(
# #             'doubtreply_set__user'
# #         ).order_by('-created_at')
        
# #         # Prepare response
# #         doubts_data = []
# #         for doubt in doubts:
# #             replies = doubt.doubtreply_set.all()
            
# #             # Prepare replies
# #             replies_data = []
# #             for reply in replies:
# #                 replies_data.append({
# #                     'id': reply.id,
# #                     'user': {
# #                         'id': reply.user.id,
# #                         'name': reply.user.get_full_name() or reply.user.username,
# #                         'role': reply.user.role,
# #                         'unique_id': reply.user.unique_id if hasattr(reply.user, 'unique_id') else None
# #                     },
# #                     'text': reply.text,
# #                     'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
# #                     'created_at': reply.created_at,
# #                     'is_my_reply': reply.user.id == teacher.id
# #                 })
            
# #             # Check if teacher has replied
# #             has_my_reply = any(r.user.id == teacher.id for r in replies)
# #             has_teacher_reply = any(r.user.role == 'teacher' for r in replies)
            
# #             doubts_data.append({
# #                 'id': doubt.id,
# #                 'student': {
# #                     'id': doubt.student.id,
# #                     'name': doubt.student.get_full_name() or doubt.student.username,
# #                     'unique_id': doubt.student.unique_id if hasattr(doubt.student, 'unique_id') else None,
# #                     'class': doubt.student.class_assigned.name if doubt.student.class_assigned else None
# #                 },
# #                 'subject': {
# #                     'id': doubt.subject.id,
# #                     'name': doubt.subject.name
# #                 },
# #                 'text': doubt.text,
# #                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #                 'created_at': doubt.created_at,
# #                 'reply_count': len(replies_data),
# #                 'replies': replies_data,
# #                 'has_my_reply': has_my_reply,
# #                 'status': 'answered' if has_teacher_reply else 'pending'
# #             })
        
# #         return Response({
# #             'doubts': doubts_data,
# #             'total_count': len(doubts_data),
# #             'pending_count': sum(1 for d in doubts_data if d['status'] == 'pending')
# #         }, status=status.HTTP_200_OK)


# # class TeacherDoubtDetailView(APIView):
# #     """
# #     Get detailed view of a specific doubt
# #     GET /api/teachers/doubts/<doubt_id>/
# #     """
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request, doubt_id):
# #         teacher = request.user
        
# #         try:
# #             doubt = Doubt.objects.select_related(
# #                 'student', 'subject', 'student__class_assigned'
# #             ).prefetch_related(
# #                 'doubtreply_set__user'
# #             ).get(id=doubt_id)
# #         except Doubt.DoesNotExist:
# #             return Response({
# #                 'error': 'Doubt not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)
        
# #         # Check if teacher is authorized to view this doubt
# #         is_authorized = TeacherAssignment.objects.filter(
# #             teacher=teacher,
# #             class_assigned=doubt.student.class_assigned,
# #             subject=doubt.subject
# #         ).exists()
        
# #         if not is_authorized:
# #             return Response({
# #                 'error': 'You are not authorized to view this doubt.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         # Prepare replies
# #         replies = doubt.doubtreply_set.all().order_by('created_at')
# #         replies_data = []
# #         for reply in replies:
# #             replies_data.append({
# #                 'id': reply.id,
# #                 'user': {
# #                     'id': reply.user.id,
# #                     'name': reply.user.get_full_name() or reply.user.username,
# #                     'role': reply.user.role,
# #                     'unique_id': reply.user.unique_id if hasattr(reply.user, 'unique_id') else None
# #                 },
# #                 'text': reply.text,
# #                 'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
# #                 'created_at': reply.created_at,
# #                 'is_my_reply': reply.user.id == teacher.id
# #             })
        
# #         doubt_data = {
# #             'id': doubt.id,
# #             'student': {
# #                 'id': doubt.student.id,
# #                 'name': doubt.student.get_full_name() or doubt.student.username,
# #                 'unique_id': doubt.student.unique_id if hasattr(doubt.student, 'unique_id') else None,
# #                 'class': doubt.student.class_assigned.name if doubt.student.class_assigned else None
# #             },
# #             'subject': {
# #                 'id': doubt.subject.id,
# #                 'name': doubt.subject.name
# #             },
# #             'text': doubt.text,
# #             'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #             'created_at': doubt.created_at,
# #             'reply_count': len(replies_data),
# #             'replies': replies_data
# #         }
        
# #         return Response(doubt_data, status=status.HTTP_200_OK)


# # class TeacherDoubtReplyView(APIView):
# #     """
# #     Teacher replies to a doubt
# #     POST /api/teachers/doubts/<doubt_id>/reply/
# #     """
# #     permission_classes = [IsTeacherRole]
    
# #     def post(self, request, doubt_id):
# #         teacher = request.user
        
# #         # Get reply data
# #         text = request.data.get('text', '').strip()
# #         image = request.FILES.get('image')
        
# #         if not text and not image:
# #             return Response({
# #                 'error': 'Please provide either text or image for your reply.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             doubt = Doubt.objects.select_related(
# #                 'student', 'subject', 'student__class_assigned'
# #             ).get(id=doubt_id)
# #         except Doubt.DoesNotExist:
# #             return Response({
# #                 'error': 'Doubt not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)
        
# #         # Check if teacher is authorized to reply to this doubt
# #         is_authorized = TeacherAssignment.objects.filter(
# #             teacher=teacher,
# #             class_assigned=doubt.student.class_assigned,
# #             subject=doubt.subject
# #         ).exists()
        
# #         if not is_authorized:
# #             return Response({
# #                 'error': 'You are not authorized to reply to this doubt. You can only reply to doubts in subjects you teach.'
# #             }, status=status.HTTP_403_FORBIDDEN)
        
# #         # Create reply
# #         reply = DoubtReply.objects.create(
# #             doubt=doubt,
# #             user=teacher,
# #             text=text,
# #             image=image
# #         )
        
# #         # Send notification to the student
# #         notify_about_doubt_reply(reply)
        
# #         # Prepare response
# #         reply_data = {
# #             'id': reply.id,
# #             'user': {
# #                 'id': teacher.id,
# #                 'name': teacher.get_full_name() or teacher.username,
# #                 'role': 'teacher'
# #             },
# #             'text': reply.text,
# #             'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
# #             'created_at': reply.created_at
# #         }
        
# #         return Response({
# #             'message': 'Reply added successfully! The student has been notified.',
# #             'reply': reply_data
# #         }, status=status.HTTP_201_CREATED)


# # class TeacherDoubtStatsView(APIView):
# #     """
# #     Get doubt statistics for teacher's dashboard
# #     GET /api/teachers/doubts/stats/
# #     """
# #     permission_classes = [IsTeacherRole]
    
# #     def get(self, request):
# #         teacher = request.user
        
# #         # Get teacher assignments
# #         assignments = TeacherAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         if not assignments.exists():
# #             return Response({
# #                 'total_doubts': 0,
# #                 'pending_doubts': 0,
# #                 'answered_doubts': 0,
# #                 'my_replies': 0
# #             }, status=status.HTTP_200_OK)
        
# #         # Build query
# #         doubt_queries = []
# #         for assignment in assignments:
# #             doubt_queries.append(
# #                 Q(student__class_assigned=assignment.class_assigned) &
# #                 Q(subject=assignment.subject)
# #             )
        
# #         if doubt_queries:
# #             combined_query = doubt_queries[0]
# #             for query in doubt_queries[1:]:
# #                 combined_query |= query
            
# #             doubts = Doubt.objects.filter(combined_query)
# #         else:
# #             doubts = Doubt.objects.none()
        
# #         total_doubts = doubts.count()
        
# #         # Count pending (no teacher reply)
# #         pending_doubts = 0
# #         answered_doubts = 0
        
# #         for doubt in doubts:
# #             has_teacher_reply = doubt.doubtreply_set.filter(user__role='teacher').exists()
# #             if has_teacher_reply:
# #                 answered_doubts += 1
# #             else:
# #                 pending_doubts += 1
        
# #         # Count teacher's own replies
# #         my_replies = DoubtReply.objects.filter(
# #             user=teacher,
# #             doubt__in=doubts
# #         ).count()
        
# #         return Response({
# #             'total_doubts': total_doubts,
# #             'pending_doubts': pending_doubts,
# #             'answered_doubts': answered_doubts,
# #             'my_replies': my_replies
# #         }, status=status.HTTP_200_OK)

# # # ADD these imports at the top if not already present
# # from rest_framework.decorators import api_view, permission_classes
# # from rest_framework.permissions import IsAuthenticated
# # from rest_framework.response import Response
# # from rest_framework import status
# # from academics.models import Class, Subject, Chapter, TeacherSubjectAssignment
# # from students.models import Student

# # # ADD these new views at the end of the file

# # @api_view(['GET'])
# # @permission_classes([IsAuthenticated])
# # def get_teacher_assigned_classes(request):
# #     """
# #     Get all classes and subjects assigned to the logged-in teacher
# #     """
# #     try:
# #         teacher = request.user
        
# #         # Get all subject assignments for this teacher
# #         assignments = TeacherSubjectAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         # Organize data by class
# #         classes_data = {}
# #         for assignment in assignments:
# #             class_id = assignment.class_assigned.id
# #             class_name = assignment.class_assigned.name
            
# #             if class_id not in classes_data:
# #                 classes_data[class_id] = {
# #                     'id': class_id,
# #                     'name': class_name,
# #                     'subjects': []
# #                 }
            
# #             classes_data[class_id]['subjects'].append({
# #                 'id': assignment.subject.id,
# #                 'name': assignment.subject.name,
# #                 'assignment_id': assignment.id
# #             })
        
# #         # Convert to list
# #         result = list(classes_data.values())
        
# #         return Response({
# #             'success': True,
# #             'classes': result
# #         }, status=status.HTTP_200_OK)
        
# #     except Exception as e:
# #         return Response({
# #             'success': False,
# #             'error': str(e)
# #         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # @api_view(['GET'])
# # @permission_classes([IsAuthenticated])
# # def get_teacher_assigned_subjects(request):
# #     """
# #     Get all subjects assigned to the logged-in teacher with class info
# #     """
# #     try:
# #         teacher = request.user
        
# #         assignments = TeacherSubjectAssignment.objects.filter(
# #             teacher=teacher
# #         ).select_related('class_assigned', 'subject')
        
# #         subjects_data = []
# #         for assignment in assignments:
# #             subjects_data.append({
# #                 'id': assignment.id,
# #                 'subject_id': assignment.subject.id,
# #                 'subject_name': assignment.subject.name,
# #                 'class_id': assignment.class_assigned.id,
# #                 'class_name': assignment.class_assigned.name,
# #             })
        
# #         return Response({
# #             'success': True,
# #             'subjects': subjects_data
# #         }, status=status.HTTP_200_OK)
        
# #     except Exception as e:
# #         return Response({
# #             'success': False,
# #             'error': str(e)
# #         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        