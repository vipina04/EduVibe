from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from users.models import CustomUser
from .models import Class, Subject, Chapter, Notification, FeePayment
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class ApproveUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def post(self, request):
        user_id = request.data.get('user_id')
        user = CustomUser.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        send_mail('Approval', f'Approved! Your ID: {user.unique_id}', settings.EMAIL_HOST_USER, [user.email])
        return Response({'message': 'Approved'})

# Similar for adding classes, subjects, chapters, notifications, fees
# For brevity, add ClassCreateView, etc. similarly.
class ClassCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def post(self, request):
        name = request.data.get('name')
        Class.objects.create(name=name)
        return Response({'message': 'Class added'})

class SubjectCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def post(self, request):
        name = request.data.get('name')
        class_ids = request.data.get('class_ids', []).split(',')
        subject = Subject.objects.create(name=name)
        subject.classes.set(Class.objects.filter(id__in=class_ids))
        return Response({'message': 'Subject added'})

class ChapterCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def post(self, request):
        name = request.data.get('name')
        subject_id = request.data.get('subject_id')
        class_id = request.data.get('class_id')
        Chapter.objects.create(name=name, subject_id=subject_id, class_assigned_id=class_id)
        return Response({'message': 'Chapter added'})

# Add list views, e.g., ClassListView with get method returning queryset.values()