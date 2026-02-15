# teachers/views_doubts.py
"""
Doubt Management Views for Teachers
EduVibe Platform - 2026
Teachers can view doubts in their assigned subjects and reply to them
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count

from users.models import CustomUser
from admin_tasks.models import Subject
from .models import Doubt, DoubtReply, TeacherAssignment
from .notifications import notify_about_doubt_reply


class IsTeacherRole(IsAuthenticated):
    """Only allow teachers"""
    
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'teacher'
        )


# ═══════════════════════════════════════════════════════════
#  DOUBT MANAGEMENT FOR TEACHERS
# ═══════════════════════════════════════════════════════════

class TeacherDoubtListView(APIView):
    """
    List all doubts from classes where teacher teaches
    GET /api/teachers/doubts/
    Can filter by: ?subject_id=5 or ?class_id=3
    """
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        teacher = request.user
        
        # Get all teacher assignments
        assignments = TeacherAssignment.objects.filter(
            teacher=teacher
        ).select_related('class_assigned', 'subject')
        
        if not assignments.exists():
            return Response({
                'message': 'You are not assigned to teach any subjects yet.',
                'doubts': [],
                'total_count': 0
            }, status=status.HTTP_200_OK)
        
        # Build query for doubts
        doubt_queries = []
        for assignment in assignments:
            doubt_queries.append(
                Q(student__class_assigned=assignment.class_assigned) &
                Q(subject=assignment.subject)
            )
        
        # Combine all queries with OR
        if doubt_queries:
            combined_query = doubt_queries[0]
            for query in doubt_queries[1:]:
                combined_query |= query
            
            doubts_query = Doubt.objects.filter(combined_query)
        else:
            doubts_query = Doubt.objects.none()
        
        # Apply filters
        subject_id = request.query_params.get('subject_id')
        class_id = request.query_params.get('class_id')
        
        if subject_id:
            try:
                doubts_query = doubts_query.filter(subject_id=subject_id)
            except ValueError:
                pass
        
        if class_id:
            try:
                doubts_query = doubts_query.filter(student__class_assigned_id=class_id)
            except ValueError:
                pass
        
        # Get doubts with related data
        doubts = doubts_query.select_related(
            'student', 'subject', 'student__class_assigned'
        ).prefetch_related(
            'doubtreply_set__user'
        ).order_by('-created_at')
        
        # Prepare response
        doubts_data = []
        for doubt in doubts:
            replies = doubt.doubtreply_set.all()
            
            # Prepare replies
            replies_data = []
            for reply in replies:
                replies_data.append({
                    'id': reply.id,
                    'user': {
                        'id': reply.user.id,
                        'name': reply.user.get_full_name() or reply.user.username,
                        'role': reply.user.role,
                        'unique_id': reply.user.unique_id if hasattr(reply.user, 'unique_id') else None
                    },
                    'text': reply.text,
                    'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
                    'created_at': reply.created_at,
                    'is_my_reply': reply.user.id == teacher.id
                })
            
            # Check if teacher has replied
            has_my_reply = any(r.user.id == teacher.id for r in replies)
            has_teacher_reply = any(r.user.role == 'teacher' for r in replies)
            
            doubts_data.append({
                'id': doubt.id,
                'student': {
                    'id': doubt.student.id,
                    'name': doubt.student.get_full_name() or doubt.student.username,
                    'unique_id': doubt.student.unique_id if hasattr(doubt.student, 'unique_id') else None,
                    'class': doubt.student.class_assigned.name if doubt.student.class_assigned else None
                },
                'subject': {
                    'id': doubt.subject.id,
                    'name': doubt.subject.name
                },
                'text': doubt.text,
                'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
                'created_at': doubt.created_at,
                'reply_count': len(replies_data),
                'replies': replies_data,
                'has_my_reply': has_my_reply,
                'status': 'answered' if has_teacher_reply else 'pending'
            })
        
        return Response({
            'doubts': doubts_data,
            'total_count': len(doubts_data),
            'pending_count': sum(1 for d in doubts_data if d['status'] == 'pending')
        }, status=status.HTTP_200_OK)


class TeacherDoubtDetailView(APIView):
    """
    Get detailed view of a specific doubt
    GET /api/teachers/doubts/<doubt_id>/
    """
    permission_classes = [IsTeacherRole]
    
    def get(self, request, doubt_id):
        teacher = request.user
        
        try:
            doubt = Doubt.objects.select_related(
                'student', 'subject', 'student__class_assigned'
            ).prefetch_related(
                'doubtreply_set__user'
            ).get(id=doubt_id)
        except Doubt.DoesNotExist:
            return Response({
                'error': 'Doubt not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if teacher is authorized to view this doubt
        is_authorized = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=doubt.student.class_assigned,
            subject=doubt.subject
        ).exists()
        
        if not is_authorized:
            return Response({
                'error': 'You are not authorized to view this doubt.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Prepare replies
        replies = doubt.doubtreply_set.all().order_by('created_at')
        replies_data = []
        for reply in replies:
            replies_data.append({
                'id': reply.id,
                'user': {
                    'id': reply.user.id,
                    'name': reply.user.get_full_name() or reply.user.username,
                    'role': reply.user.role,
                    'unique_id': reply.user.unique_id if hasattr(reply.user, 'unique_id') else None
                },
                'text': reply.text,
                'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
                'created_at': reply.created_at,
                'is_my_reply': reply.user.id == teacher.id
            })
        
        doubt_data = {
            'id': doubt.id,
            'student': {
                'id': doubt.student.id,
                'name': doubt.student.get_full_name() or doubt.student.username,
                'unique_id': doubt.student.unique_id if hasattr(doubt.student, 'unique_id') else None,
                'class': doubt.student.class_assigned.name if doubt.student.class_assigned else None
            },
            'subject': {
                'id': doubt.subject.id,
                'name': doubt.subject.name
            },
            'text': doubt.text,
            'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
            'created_at': doubt.created_at,
            'reply_count': len(replies_data),
            'replies': replies_data
        }
        
        return Response(doubt_data, status=status.HTTP_200_OK)


class TeacherDoubtReplyView(APIView):
    """
    Teacher replies to a doubt
    POST /api/teachers/doubts/<doubt_id>/reply/
    """
    permission_classes = [IsTeacherRole]
    
    def post(self, request, doubt_id):
        teacher = request.user
        
        # Get reply data
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')
        
        if not text and not image:
            return Response({
                'error': 'Please provide either text or image for your reply.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doubt = Doubt.objects.select_related(
                'student', 'subject', 'student__class_assigned'
            ).get(id=doubt_id)
        except Doubt.DoesNotExist:
            return Response({
                'error': 'Doubt not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if teacher is authorized to reply to this doubt
        is_authorized = TeacherAssignment.objects.filter(
            teacher=teacher,
            class_assigned=doubt.student.class_assigned,
            subject=doubt.subject
        ).exists()
        
        if not is_authorized:
            return Response({
                'error': 'You are not authorized to reply to this doubt. You can only reply to doubts in subjects you teach.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Create reply
        reply = DoubtReply.objects.create(
            doubt=doubt,
            user=teacher,
            text=text,
            image=image
        )
        
        # Send notification to the student
        notify_about_doubt_reply(reply)
        
        # Prepare response
        reply_data = {
            'id': reply.id,
            'user': {
                'id': teacher.id,
                'name': teacher.get_full_name() or teacher.username,
                'role': 'teacher'
            },
            'text': reply.text,
            'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
            'created_at': reply.created_at
        }
        
        return Response({
            'message': 'Reply added successfully! The student has been notified.',
            'reply': reply_data
        }, status=status.HTTP_201_CREATED)


class TeacherDoubtStatsView(APIView):
    """
    Get doubt statistics for teacher's dashboard
    GET /api/teachers/doubts/stats/
    """
    permission_classes = [IsTeacherRole]
    
    def get(self, request):
        teacher = request.user
        
        # Get teacher assignments
        assignments = TeacherAssignment.objects.filter(
            teacher=teacher
        ).select_related('class_assigned', 'subject')
        
        if not assignments.exists():
            return Response({
                'total_doubts': 0,
                'pending_doubts': 0,
                'answered_doubts': 0,
                'my_replies': 0
            }, status=status.HTTP_200_OK)
        
        # Build query
        doubt_queries = []
        for assignment in assignments:
            doubt_queries.append(
                Q(student__class_assigned=assignment.class_assigned) &
                Q(subject=assignment.subject)
            )
        
        if doubt_queries:
            combined_query = doubt_queries[0]
            for query in doubt_queries[1:]:
                combined_query |= query
            
            doubts = Doubt.objects.filter(combined_query)
        else:
            doubts = Doubt.objects.none()
        
        total_doubts = doubts.count()
        
        # Count pending (no teacher reply)
        pending_doubts = 0
        answered_doubts = 0
        
        for doubt in doubts:
            has_teacher_reply = doubt.doubtreply_set.filter(user__role='teacher').exists()
            if has_teacher_reply:
                answered_doubts += 1
            else:
                pending_doubts += 1
        
        # Count teacher's own replies
        my_replies = DoubtReply.objects.filter(
            user=teacher,
            doubt__in=doubts
        ).count()
        
        return Response({
            'total_doubts': total_doubts,
            'pending_doubts': pending_doubts,
            'answered_doubts': answered_doubts,
            'my_replies': my_replies
        }, status=status.HTTP_200_OK)