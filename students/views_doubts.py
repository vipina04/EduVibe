# students/views_doubts.py
"""
Student Doubt Management Views
EduVibe Platform - 2026
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from teachers.models import Doubt, DoubtReply
from admin_tasks.models import Subject


class IsStudentRole(IsAuthenticated):
    """Only allow students"""
    
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'student'
        )


class StudentDoubtListView(APIView):
    """List all doubts for the student's class"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get subject filter if provided
        subject_id = request.GET.get('subject_id')
        
        # Get all doubts from students in the same class
        doubts = Doubt.objects.filter(
            student__class_assigned=student.class_assigned
        ).select_related('student', 'subject').prefetch_related('doubtreply_set').order_by('-created_at')
        
        # Filter by subject if provided
        if subject_id:
            doubts = doubts.filter(subject_id=subject_id)
        
        # Build response data
        doubts_data = []
        for doubt in doubts:
            # Get replies
            replies = doubt.doubtreply_set.all().order_by('created_at')
            replies_data = []
            
            for reply in replies:
                replier_name = "Unknown"
                replier_role = "unknown"
                
                if reply.teacher:
                    replier_name = f"{reply.teacher.first_name} {reply.teacher.last_name}".strip() or reply.teacher.username
                    replier_role = "teacher"
                elif reply.student:
                    replier_name = f"{reply.student.first_name} {reply.student.last_name}".strip() or reply.student.username
                    replier_role = "student"
                
                replies_data.append({
                    'id': reply.id,
                    'text': reply.text,
                    'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
                    'replier_name': replier_name,
                    'replier_role': replier_role,
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
                })
            
            doubts_data.append({
                'id': doubt.id,
                'text': doubt.text,
                'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
                'subject': {
                    'id': doubt.subject.id,
                    'name': doubt.subject.name
                },
                'student': {
                    'name': f"{doubt.student.first_name} {doubt.student.last_name}".strip() or doubt.student.username,
                    'is_me': doubt.student.id == student.id
                },
                'created_at': doubt.created_at.strftime('%Y-%m-%d %H:%M'),
                'replies_count': len(replies_data),
                'replies': replies_data
            })
        
        return Response(doubts_data, status=status.HTTP_200_OK)


class StudentDoubtReplyView(APIView):
    """Reply to a doubt"""
    permission_classes = [IsStudentRole]
    
    def post(self, request, doubt_id):
        student = request.user
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doubt = Doubt.objects.get(id=doubt_id)
            
            # Check if doubt is from same class
            if doubt.student.class_assigned != student.class_assigned:
                return Response({
                    'error': 'You can only reply to doubts from your class.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get reply data
            text = request.data.get('text', '').strip()
            image = request.FILES.get('image')
            
            if not text and not image:
                return Response({
                    'error': 'Provide text or image for reply.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create reply
            reply = DoubtReply.objects.create(
                doubt=doubt,
                student=student,
                text=text,
                image=image
            )
            
            return Response({
                'message': 'Reply posted successfully!',
                'reply': {
                    'id': reply.id,
                    'text': reply.text,
                    'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
                    'replier_name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
                }
            }, status=status.HTTP_201_CREATED)
        
        except Doubt.DoesNotExist:
            return Response({
                'error': 'Doubt not found.'
            }, status=status.HTTP_404_NOT_FOUND)






















# # students/views_doubts.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from teachers.models import Doubt, DoubtReply
# from admin_tasks.models import Subject
# from django.db.models import Q

# class StudentDoubtListView(APIView):
#     """Get all doubts in student's class"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         student = request.user
        
#         if not student.class_assigned:
#             return Response({'error': 'No class assigned'}, status=400)
        
#         # Get doubts from same class
#         doubts = Doubt.objects.filter(
#             student__class_assigned=student.class_assigned
#         ).select_related('student', 'subject').prefetch_related('doubtreply_set')
        
#         # Filter by subject if provided
#         subject_id = request.GET.get('subject_id')
#         if subject_id:
#             doubts = doubts.filter(subject_id=subject_id)
        
#         doubts_data = []
#         for doubt in doubts.order_by('-created_at'):
#             replies = doubt.doubtreply_set.all().order_by('created_at')
            
#             doubts_data.append({
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
#                 'reply_count': replies.count(),
#                 'replies': [
#                     {
#                         'id': r.id,
#                         'user': {
#                             'name': f'{r.user.first_name} {r.user.last_name}'.strip(),
#                             'role': r.user.role,
#                             'unique_id': r.user.unique_id
#                         },
#                         'text': r.text,
#                         'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
#                         'created_at': r.created_at
#                     }
#                     for r in replies
#                 ]
#             })
        
#         return Response(doubts_data)


# class StudentDoubtReplyView(APIView):
#     """Reply to a doubt"""
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request, doubt_id):
#         text = request.data.get('text', '').strip()
#         image = request.FILES.get('image')
        
#         if not text and not image:
#             return Response({
#                 'error': 'Provide text or image'
#             }, status=400)
        
#         try:
#             doubt = Doubt.objects.get(id=doubt_id)
            
#             # Check if student is in same class
#             if request.user.role == 'student':
#                 if request.user.class_assigned != doubt.student.class_assigned:
#                     return Response({'error': 'Not authorized'}, status=403)
            
#             reply = DoubtReply.objects.create(
#                 doubt=doubt,
#                 user=request.user,
#                 text=text,
#                 image=image
#             )
            
#             return Response({
#                 'message': 'Reply posted!',
#                 'reply': {
#                     'id': reply.id,
#                     'text': text,
#                     'created_at': reply.created_at
#                 }
#             }, status=201)
        
#         except Doubt.DoesNotExist:
#             return Response({'error': 'Doubt not found'}, status=404)