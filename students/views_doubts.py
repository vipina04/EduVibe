# students/views_doubts.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from teachers.models import Doubt, DoubtReply
from admin_tasks.models import Subject
from django.db.models import Q

class StudentDoubtListView(APIView):
    """Get all doubts in student's class"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        student = request.user
        
        if not student.class_assigned:
            return Response({'error': 'No class assigned'}, status=400)
        
        # Get doubts from same class
        doubts = Doubt.objects.filter(
            student__class_assigned=student.class_assigned
        ).select_related('student', 'subject').prefetch_related('doubtreply_set')
        
        # Filter by subject if provided
        subject_id = request.GET.get('subject_id')
        if subject_id:
            doubts = doubts.filter(subject_id=subject_id)
        
        doubts_data = []
        for doubt in doubts.order_by('-created_at'):
            replies = doubt.doubtreply_set.all().order_by('created_at')
            
            doubts_data.append({
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
                'reply_count': replies.count(),
                'replies': [
                    {
                        'id': r.id,
                        'user': {
                            'name': f'{r.user.first_name} {r.user.last_name}'.strip(),
                            'role': r.user.role,
                            'unique_id': r.user.unique_id
                        },
                        'text': r.text,
                        'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
                        'created_at': r.created_at
                    }
                    for r in replies
                ]
            })
        
        return Response(doubts_data)


class StudentDoubtReplyView(APIView):
    """Reply to a doubt"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, doubt_id):
        text = request.data.get('text', '').strip()
        image = request.FILES.get('image')
        
        if not text and not image:
            return Response({
                'error': 'Provide text or image'
            }, status=400)
        
        try:
            doubt = Doubt.objects.get(id=doubt_id)
            
            # Check if student is in same class
            if request.user.role == 'student':
                if request.user.class_assigned != doubt.student.class_assigned:
                    return Response({'error': 'Not authorized'}, status=403)
            
            reply = DoubtReply.objects.create(
                doubt=doubt,
                user=request.user,
                text=text,
                image=image
            )
            
            return Response({
                'message': 'Reply posted!',
                'reply': {
                    'id': reply.id,
                    'text': text,
                    'created_at': reply.created_at
                }
            }, status=201)
        
        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found'}, status=404)