# students/views_doubts.py
"""
Student Doubt Management Views - DIAGNOSTIC VERSION
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
    """List all doubts for the student's class - WITH DEBUGGING"""
    permission_classes = [IsStudentRole]
    
    def get(self, request):
        student = request.user
        
        # DIAGNOSTIC: Print student info
        print(f"\n{'='*60}")
        print(f"[DOUBT LIST] Student ID: {student.id}")
        print(f"[DOUBT LIST] Student Name: {student.first_name} {student.last_name}")
        print(f"[DOUBT LIST] Student Class: {student.class_assigned}")
        print(f"[DOUBT LIST] Student Class ID: {student.class_assigned.id if student.class_assigned else 'None'}")
        print(f"{'='*60}\n")
        
        if not student.class_assigned:
            return Response({
                'error': 'No class assigned.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get subject filter if provided
        subject_id = request.GET.get('subject_id')
        
        # ONLY get doubts from students in THE SAME CLASS
        doubts = Doubt.objects.filter(
            student__class_assigned_id=student.class_assigned.id  # Using ID for clarity
        ).select_related('student', 'student__class_assigned', 'subject').prefetch_related(
            'doubtreply_set__user'
        ).order_by('-created_at')
        
        # DIAGNOSTIC: Print query results
        print(f"[DOUBT LIST] Total doubts found for class {student.class_assigned.name}: {doubts.count()}")
        for d in doubts:
            print(f"  - Doubt ID: {d.id}, Student: {d.student.first_name}, Class: {d.student.class_assigned.name}")
        
        # Filter by subject if provided
        if subject_id:
            doubts = doubts.filter(subject_id=subject_id)
            print(f"[DOUBT LIST] After subject filter: {doubts.count()} doubts")
        
        # Build response data
        doubts_data = []
        for doubt in doubts:
            # Get replies with author information
            replies = doubt.doubtreply_set.all().order_by('created_at')
            replies_data = []
            
            for reply in replies:
                replier = reply.user
                replier_name = f"{replier.first_name} {replier.last_name}".strip() or replier.username
                replier_role = replier.role
                
                replies_data.append({
                    'id': reply.id,
                    'text': reply.text,
                    'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
                    'replier_name': replier_name,
                    'replier_role': replier_role,
                    'replier_id': replier.id,
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
                    'id': doubt.student.id,
                    'name': f"{doubt.student.first_name} {doubt.student.last_name}".strip() or doubt.student.username,
                    'class_name': doubt.student.class_assigned.name,  # ADDED for debugging
                    'class_id': doubt.student.class_assigned.id,  # ADDED for debugging
                    'is_me': doubt.student.id == student.id
                },
                'created_at': doubt.created_at.strftime('%Y-%m-%d %H:%M'),
                'replies_count': len(replies_data),
                'replies': replies_data
            })
        
        print(f"[DOUBT LIST] Returning {len(doubts_data)} doubts to frontend\n")
        
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
            doubt = Doubt.objects.select_related('student', 'student__class_assigned').get(id=doubt_id)
            
            # DIAGNOSTIC
            print(f"\n[DOUBT REPLY] Student {student.id} (Class: {student.class_assigned.name}) trying to reply")
            print(f"[DOUBT REPLY] Doubt by Student {doubt.student.id} (Class: {doubt.student.class_assigned.name})")
            
            # Check if doubt is from same class (SECURITY CHECK)
            if doubt.student.class_assigned.id != student.class_assigned.id:
                print(f"[DOUBT REPLY] BLOCKED - Different classes!")
                return Response({
                    'error': 'You can only reply to doubts from your class.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            print(f"[DOUBT REPLY] ALLOWED - Same class\n")
            
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
                user=student,
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
                    'replier_role': 'student',
                    'replier_id': student.id,
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
                }
            }, status=status.HTTP_201_CREATED)
        
        except Doubt.DoesNotExist:
            return Response({
                'error': 'Doubt not found.'
            }, status=status.HTTP_404_NOT_FOUND)












# # students/views_doubts.py
# """
# Student Doubt Management Views
# EduVibe Platform - 2026
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated

# from teachers.models import Doubt, DoubtReply
# from admin_tasks.models import Subject


# class IsStudentRole(IsAuthenticated):
#     """Only allow students"""
    
#     def has_permission(self, request, view):
#         return (
#             super().has_permission(request, view) and
#             request.user.role == 'student'
#         )


# class StudentDoubtListView(APIView):
#     """List all doubts for the student's class"""
#     permission_classes = [IsStudentRole]
    
#     def get(self, request):
#         student = request.user
        
#         if not student.class_assigned:
#             return Response({
#                 'error': 'No class assigned.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Get subject filter if provided
#         subject_id = request.GET.get('subject_id')
        
#         # Get all doubts from students in the same class
#         doubts = Doubt.objects.filter(
#             student__class_assigned=student.class_assigned
#         ).select_related('student', 'subject').prefetch_related('doubtreply_set').order_by('-created_at')
        
#         # Filter by subject if provided
#         if subject_id:
#             doubts = doubts.filter(subject_id=subject_id)
        
#         # Build response data
#         doubts_data = []
#         for doubt in doubts:
#             # Get replies
#             replies = doubt.doubtreply_set.all().order_by('created_at')
#             replies_data = []
            
#             for reply in replies:
#                 # Use reply.user (matches model definition)
#                 replier = reply.user
#                 replier_name = f"{replier.first_name} {replier.last_name}".strip() or replier.username
#                 replier_role = replier.role
                
#                 replies_data.append({
#                     'id': reply.id,
#                     'text': reply.text,
#                     'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
#                     'replier_name': replier_name,
#                     'replier_role': replier_role,
#                     'replier_id': replier.id,
#                     'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
#                 })
            
#             doubts_data.append({
#                 'id': doubt.id,
#                 'text': doubt.text,
#                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
#                 'subject': {
#                     'id': doubt.subject.id,
#                     'name': doubt.subject.name
#                 },
#                 'student': {
#                     'id': doubt.student.id,
#                     'name': f"{doubt.student.first_name} {doubt.student.last_name}".strip() or doubt.student.username,
#                     'is_me': doubt.student.id == student.id
#                 },
#                 'created_at': doubt.created_at.strftime('%Y-%m-%d %H:%M'),
#                 'replies_count': len(replies_data),
#                 'replies': replies_data
#             })
        
#         return Response(doubts_data, status=status.HTTP_200_OK)


# class StudentDoubtReplyView(APIView):
#     """Reply to a doubt"""
#     permission_classes = [IsStudentRole]
    
#     def post(self, request, doubt_id):
#         student = request.user
        
#         if not student.class_assigned:
#             return Response({
#                 'error': 'No class assigned.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             doubt = Doubt.objects.get(id=doubt_id)
            
#             # Check if doubt is from same class
#             if doubt.student.class_assigned != student.class_assigned:
#                 return Response({
#                     'error': 'You can only reply to doubts from your class.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             # Get reply data
#             text = request.data.get('text', '').strip()
#             image = request.FILES.get('image')
            
#             if not text and not image:
#                 return Response({
#                     'error': 'Provide text or image for reply.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Create reply with 'user' field (matches model)
#             reply = DoubtReply.objects.create(
#                 doubt=doubt,
#                 user=student,
#                 text=text,
#                 image=image
#             )
            
#             return Response({
#                 'message': 'Reply posted successfully!',
#                 'reply': {
#                     'id': reply.id,
#                     'text': reply.text,
#                     'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
#                     'replier_name': f"{student.first_name} {student.last_name}".strip() or student.username,
#                     'replier_role': 'student',
#                     'replier_id': student.id,
#                     'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except Doubt.DoesNotExist:
#             return Response({
#                 'error': 'Doubt not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


























# # # students/views_doubts.py
# # """
# # Complete Doubt Management Views for Students
# # EduVibe Platform - 2026
# # Handles doubt creation, listing, and replies
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.permissions import IsAuthenticated
# # from django.db.models import Q, Count
# # from django.utils import timezone

# # from users.models import CustomUser
# # from admin_tasks.models import Subject
# # from teachers.models import Doubt, DoubtReply
# # from teachers.notifications import notify_teachers_about_doubt, notify_about_doubt_reply


# # class IsStudentRole(IsAuthenticated):
# #     """Only allow students"""
    
# #     def has_permission(self, request, view):
# #         return (
# #             super().has_permission(request, view) and
# #             request.user.role == 'student'
# #         )


# # # ═══════════════════════════════════════════════════════════
# # #  DOUBT MANAGEMENT FOR STUDENTS
# # # ═══════════════════════════════════════════════════════════

# # class StudentDoubtCreateView(APIView):
# #     """
# #     Create a new doubt - Student selects subject from their class subjects
# #     POST /api/students/doubts/create/
# #     """
# #     permission_classes = [IsStudentRole]
    
# #     def post(self, request):
# #         student = request.user
        
# #         # Check if student has a class assigned
# #         if not student.class_assigned:
# #             return Response({
# #                 'error': 'You are not assigned to any class yet.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Get data from request
# #         subject_id = request.data.get('subject_id')
# #         text = request.data.get('text', '').strip()
# #         image = request.FILES.get('image')
        
# #         # Validation
# #         if not subject_id:
# #             return Response({
# #                 'error': 'Please select a subject.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         if not text and not image:
# #             return Response({
# #                 'error': 'Please provide either text or image for your doubt.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Validate subject exists and belongs to student's class
# #         try:
# #             subject = Subject.objects.get(id=subject_id, class_assigned=student.class_assigned)
# #         except Subject.DoesNotExist:
# #             return Response({
# #                 'error': 'Invalid subject. Please select a subject from your class.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Create the doubt
# #         doubt = Doubt.objects.create(
# #             student=student,
# #             subject=subject,
# #             text=text,
# #             image=image
# #         )
        
# #         # Send notifications to teachers teaching this subject in this class
# #         teachers_notified = notify_teachers_about_doubt(doubt)
        
# #         # Prepare response
# #         doubt_data = {
# #             'id': doubt.id,
# #             'subject': {
# #                 'id': subject.id,
# #                 'name': subject.name
# #             },
# #             'text': doubt.text,
# #             'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #             'created_at': doubt.created_at,
# #             'teachers_notified': teachers_notified
# #         }
        
# #         return Response({
# #             'message': 'Doubt posted successfully! Your teachers have been notified.',
# #             'doubt': doubt_data
# #         }, status=status.HTTP_201_CREATED)


# # class StudentDoubtListView(APIView):
# #     """
# #     List all doubts from student's class
# #     GET /api/students/doubts/
# #     Can be filtered by subject: /api/students/doubts/?subject_id=5
# #     """
# #     permission_classes = [IsStudentRole]
    
# #     def get(self, request):
# #         student = request.user
        
# #         if not student.class_assigned:
# #             return Response({
# #                 'error': 'You are not assigned to any class yet.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Get all doubts from students in the same class
# #         doubts_query = Doubt.objects.filter(
# #             student__class_assigned=student.class_assigned
# #         )
        
# #         # Filter by subject if provided
# #         subject_id = request.query_params.get('subject_id')
# #         if subject_id:
# #             try:
# #                 doubts_query = doubts_query.filter(subject_id=subject_id)
# #             except ValueError:
# #                 pass
        
# #         # Get doubts with related data
# #         doubts = doubts_query.select_related(
# #             'student', 'subject'
# #         ).prefetch_related(
# #             'doubtreply_set__user'
# #         ).order_by('-created_at')
        
# #         # Prepare response data
# #         doubts_data = []
# #         for doubt in doubts:
# #             replies = doubt.doubtreply_set.all()
            
# #             # Prepare replies data
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
# #                     'created_at': reply.created_at
# #                 })
            
# #             doubts_data.append({
# #                 'id': doubt.id,
# #                 'student': {
# #                     'id': doubt.student.id,
# #                     'name': doubt.student.get_full_name() or doubt.student.username,
# #                     'unique_id': doubt.student.unique_id if hasattr(doubt.student, 'unique_id') else None
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
# #                 'is_my_doubt': doubt.student.id == student.id
# #             })
        
# #         return Response({
# #             'doubts': doubts_data,
# #             'total_count': len(doubts_data)
# #         }, status=status.HTTP_200_OK)


# # class StudentDoubtDetailView(APIView):
# #     """
# #     Get detailed view of a specific doubt with all replies
# #     GET /api/students/doubts/<doubt_id>/
# #     """
# #     permission_classes = [IsStudentRole]
    
# #     def get(self, request, doubt_id):
# #         student = request.user
        
# #         if not student.class_assigned:
# #             return Response({
# #                 'error': 'You are not assigned to any class.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             # Get doubt - ensure it's from same class
# #             doubt = Doubt.objects.select_related(
# #                 'student', 'subject'
# #             ).prefetch_related(
# #                 'doubtreply_set__user'
# #             ).get(
# #                 id=doubt_id,
# #                 student__class_assigned=student.class_assigned
# #             )
# #         except Doubt.DoesNotExist:
# #             return Response({
# #                 'error': 'Doubt not found or you do not have access to it.'
# #             }, status=status.HTTP_404_NOT_FOUND)
        
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
# #                 'created_at': reply.created_at
# #             })
        
# #         doubt_data = {
# #             'id': doubt.id,
# #             'student': {
# #                 'id': doubt.student.id,
# #                 'name': doubt.student.get_full_name() or doubt.student.username,
# #                 'unique_id': doubt.student.unique_id if hasattr(doubt.student, 'unique_id') else None
# #             },
# #             'subject': {
# #                 'id': doubt.subject.id,
# #                 'name': doubt.subject.name
# #             },
# #             'text': doubt.text,
# #             'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #             'created_at': doubt.created_at,
# #             'reply_count': len(replies_data),
# #             'replies': replies_data,
# #             'is_my_doubt': doubt.student.id == student.id
# #         }
        
# #         return Response(doubt_data, status=status.HTTP_200_OK)


# # class StudentDoubtReplyView(APIView):
# #     """
# #     Add reply to a doubt
# #     POST /api/students/doubts/<doubt_id>/reply/
# #     """
# #     permission_classes = [IsStudentRole]
    
# #     def post(self, request, doubt_id):
# #         student = request.user
        
# #         if not student.class_assigned:
# #             return Response({
# #                 'error': 'You are not assigned to any class.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Get reply data
# #         text = request.data.get('text', '').strip()
# #         image = request.FILES.get('image')
        
# #         if not text and not image:
# #             return Response({
# #                 'error': 'Please provide either text or image for your reply.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         try:
# #             # Get doubt - ensure it's from same class
# #             doubt = Doubt.objects.get(
# #                 id=doubt_id,
# #                 student__class_assigned=student.class_assigned
# #             )
# #         except Doubt.DoesNotExist:
# #             return Response({
# #                 'error': 'Doubt not found or you do not have access to it.'
# #             }, status=status.HTTP_404_NOT_FOUND)
        
# #         # Create reply
# #         reply = DoubtReply.objects.create(
# #             doubt=doubt,
# #             user=student,
# #             text=text,
# #             image=image
# #         )
        
# #         # Send notification to doubt creator
# #         notify_about_doubt_reply(reply)
        
# #         # Prepare response
# #         reply_data = {
# #             'id': reply.id,
# #             'user': {
# #                 'id': student.id,
# #                 'name': student.get_full_name() or student.username,
# #                 'role': 'student'
# #             },
# #             'text': reply.text,
# #             'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
# #             'created_at': reply.created_at
# #         }
        
# #         return Response({
# #             'message': 'Reply added successfully!',
# #             'reply': reply_data
# #         }, status=status.HTTP_201_CREATED)


# # class StudentMyDoubtsView(APIView):
# #     """
# #     Get only the doubts asked by the current student
# #     GET /api/students/doubts/my-doubts/
# #     """
# #     permission_classes = [IsStudentRole]
    
# #     def get(self, request):
# #         student = request.user
        
# #         if not student.class_assigned:
# #             return Response({
# #                 'error': 'You are not assigned to any class yet.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         # Get only this student's doubts
# #         doubts = Doubt.objects.filter(
# #             student=student
# #         ).select_related(
# #             'subject'
# #         ).prefetch_related(
# #             'doubtreply_set__user'
# #         ).order_by('-created_at')
        
# #         doubts_data = []
# #         for doubt in doubts:
# #             replies_count = doubt.doubtreply_set.count()
# #             has_teacher_reply = doubt.doubtreply_set.filter(user__role='teacher').exists()
            
# #             doubts_data.append({
# #                 'id': doubt.id,
# #                 'subject': {
# #                     'id': doubt.subject.id,
# #                     'name': doubt.subject.name
# #                 },
# #                 'text': doubt.text,
# #                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# #                 'created_at': doubt.created_at,
# #                 'reply_count': replies_count,
# #                 'has_teacher_reply': has_teacher_reply,
# #                 'status': 'answered' if has_teacher_reply else 'pending'
# #             })
        
# #         return Response({
# #             'my_doubts': doubts_data,
# #             'total_count': len(doubts_data)
# #         }, status=status.HTTP_200_OK)
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
# #         # # students/views_doubts.py
# # # """
# # # Student Doubt Management Views
# # # EduVibe Platform - 2026
# # # """

# # # from rest_framework.views import APIView
# # # from rest_framework.response import Response
# # # from rest_framework import status
# # # from rest_framework.permissions import IsAuthenticated

# # # from teachers.models import Doubt, DoubtReply
# # # from admin_tasks.models import Subject


# # # class IsStudentRole(IsAuthenticated):
# # #     """Only allow students"""
    
# # #     def has_permission(self, request, view):
# # #         return (
# # #             super().has_permission(request, view) and
# # #             request.user.role == 'student'
# # #         )


# # # class StudentDoubtListView(APIView):
# # #     """List all doubts for the student's class"""
# # #     permission_classes = [IsStudentRole]
    
# # #     def get(self, request):
# # #         student = request.user
        
# # #         if not student.class_assigned:
# # #             return Response({
# # #                 'error': 'No class assigned.'
# # #             }, status=status.HTTP_400_BAD_REQUEST)
        
# # #         # Get subject filter if provided
# # #         subject_id = request.GET.get('subject_id')
        
# # #         # Get all doubts from students in the same class
# # #         doubts = Doubt.objects.filter(
# # #             student__class_assigned=student.class_assigned
# # #         ).select_related('student', 'subject').prefetch_related('doubtreply_set').order_by('-created_at')
        
# # #         # Filter by subject if provided
# # #         if subject_id:
# # #             doubts = doubts.filter(subject_id=subject_id)
        
# # #         # Build response data
# # #         doubts_data = []
# # #         for doubt in doubts:
# # #             # Get replies
# # #             replies = doubt.doubtreply_set.all().order_by('created_at')
# # #             replies_data = []
            
# # #             for reply in replies:
# # #                 replier_name = "Unknown"
# # #                 replier_role = "unknown"
                
# # #                 if reply.teacher:
# # #                     replier_name = f"{reply.teacher.first_name} {reply.teacher.last_name}".strip() or reply.teacher.username
# # #                     replier_role = "teacher"
# # #                 elif reply.student:
# # #                     replier_name = f"{reply.student.first_name} {reply.student.last_name}".strip() or reply.student.username
# # #                     replier_role = "student"
                
# # #                 replies_data.append({
# # #                     'id': reply.id,
# # #                     'text': reply.text,
# # #                     'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
# # #                     'replier_name': replier_name,
# # #                     'replier_role': replier_role,
# # #                     'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
# # #                 })
            
# # #             doubts_data.append({
# # #                 'id': doubt.id,
# # #                 'text': doubt.text,
# # #                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# # #                 'subject': {
# # #                     'id': doubt.subject.id,
# # #                     'name': doubt.subject.name
# # #                 },
# # #                 'student': {
# # #                     'name': f"{doubt.student.first_name} {doubt.student.last_name}".strip() or doubt.student.username,
# # #                     'is_me': doubt.student.id == student.id
# # #                 },
# # #                 'created_at': doubt.created_at.strftime('%Y-%m-%d %H:%M'),
# # #                 'replies_count': len(replies_data),
# # #                 'replies': replies_data
# # #             })
        
# # #         return Response(doubts_data, status=status.HTTP_200_OK)


# # # class StudentDoubtReplyView(APIView):
# # #     """Reply to a doubt"""
# # #     permission_classes = [IsStudentRole]
    
# # #     def post(self, request, doubt_id):
# # #         student = request.user
        
# # #         if not student.class_assigned:
# # #             return Response({
# # #                 'error': 'No class assigned.'
# # #             }, status=status.HTTP_400_BAD_REQUEST)
        
# # #         try:
# # #             doubt = Doubt.objects.get(id=doubt_id)
            
# # #             # Check if doubt is from same class
# # #             if doubt.student.class_assigned != student.class_assigned:
# # #                 return Response({
# # #                     'error': 'You can only reply to doubts from your class.'
# # #                 }, status=status.HTTP_403_FORBIDDEN)
            
# # #             # Get reply data
# # #             text = request.data.get('text', '').strip()
# # #             image = request.FILES.get('image')
            
# # #             if not text and not image:
# # #                 return Response({
# # #                     'error': 'Provide text or image for reply.'
# # #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# # #             # Create reply
# # #             reply = DoubtReply.objects.create(
# # #                 doubt=doubt,
# # #                 student=student,
# # #                 text=text,
# # #                 image=image
# # #             )
            
# # #             return Response({
# # #                 'message': 'Reply posted successfully!',
# # #                 'reply': {
# # #                     'id': reply.id,
# # #                     'text': reply.text,
# # #                     'image_url': request.build_absolute_uri(reply.image.url) if reply.image else None,
# # #                     'replier_name': f"{student.first_name} {student.last_name}".strip() or student.username,
# # #                     'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M')
# # #                 }
# # #             }, status=status.HTTP_201_CREATED)
        
# # #         except Doubt.DoesNotExist:
# # #             return Response({
# # #                 'error': 'Doubt not found.'
# # #             }, status=status.HTTP_404_NOT_FOUND)






















# # # # # students/views_doubts.py
# # # # from rest_framework.views import APIView
# # # # from rest_framework.response import Response
# # # # from rest_framework import status
# # # # from rest_framework.permissions import IsAuthenticated
# # # # from teachers.models import Doubt, DoubtReply
# # # # from admin_tasks.models import Subject
# # # # from django.db.models import Q

# # # # class StudentDoubtListView(APIView):
# # # #     """Get all doubts in student's class"""
# # # #     permission_classes = [IsAuthenticated]
    
# # # #     def get(self, request):
# # # #         student = request.user
        
# # # #         if not student.class_assigned:
# # # #             return Response({'error': 'No class assigned'}, status=400)
        
# # # #         # Get doubts from same class
# # # #         doubts = Doubt.objects.filter(
# # # #             student__class_assigned=student.class_assigned
# # # #         ).select_related('student', 'subject').prefetch_related('doubtreply_set')
        
# # # #         # Filter by subject if provided
# # # #         subject_id = request.GET.get('subject_id')
# # # #         if subject_id:
# # # #             doubts = doubts.filter(subject_id=subject_id)
        
# # # #         doubts_data = []
# # # #         for doubt in doubts.order_by('-created_at'):
# # # #             replies = doubt.doubtreply_set.all().order_by('created_at')
            
# # # #             doubts_data.append({
# # # #                 'id': doubt.id,
# # # #                 'student': {
# # # #                     'id': doubt.student.id,
# # # #                     'name': f'{doubt.student.first_name} {doubt.student.last_name}'.strip(),
# # # #                     'unique_id': doubt.student.unique_id
# # # #                 },
# # # #                 'subject': {
# # # #                     'id': doubt.subject.id,
# # # #                     'name': doubt.subject.name
# # # #                 },
# # # #                 'text': doubt.text,
# # # #                 'image_url': request.build_absolute_uri(doubt.image.url) if doubt.image else None,
# # # #                 'created_at': doubt.created_at,
# # # #                 'reply_count': replies.count(),
# # # #                 'replies': [
# # # #                     {
# # # #                         'id': r.id,
# # # #                         'user': {
# # # #                             'name': f'{r.user.first_name} {r.user.last_name}'.strip(),
# # # #                             'role': r.user.role,
# # # #                             'unique_id': r.user.unique_id
# # # #                         },
# # # #                         'text': r.text,
# # # #                         'image_url': request.build_absolute_uri(r.image.url) if r.image else None,
# # # #                         'created_at': r.created_at
# # # #                     }
# # # #                     for r in replies
# # # #                 ]
# # # #             })
        
# # # #         return Response(doubts_data)


# # # # class StudentDoubtReplyView(APIView):
# # # #     """Reply to a doubt"""
# # # #     permission_classes = [IsAuthenticated]
    
# # # #     def post(self, request, doubt_id):
# # # #         text = request.data.get('text', '').strip()
# # # #         image = request.FILES.get('image')
        
# # # #         if not text and not image:
# # # #             return Response({
# # # #                 'error': 'Provide text or image'
# # # #             }, status=400)
        
# # # #         try:
# # # #             doubt = Doubt.objects.get(id=doubt_id)
            
# # # #             # Check if student is in same class
# # # #             if request.user.role == 'student':
# # # #                 if request.user.class_assigned != doubt.student.class_assigned:
# # # #                     return Response({'error': 'Not authorized'}, status=403)
            
# # # #             reply = DoubtReply.objects.create(
# # # #                 doubt=doubt,
# # # #                 user=request.user,
# # # #                 text=text,
# # # #                 image=image
# # # #             )
            
# # # #             return Response({
# # # #                 'message': 'Reply posted!',
# # # #                 'reply': {
# # # #                     'id': reply.id,
# # # #                     'text': text,
# # # #                     'created_at': reply.created_at
# # # #                 }
# # # #             }, status=201)
        
# # # #         except Doubt.DoesNotExist:
# # # #             return Response({'error': 'Doubt not found'}, status=404)