# users/views_enhanced.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from admin_tasks.models import Class, Subject

class GetRegistrationDataView(APIView):
    """Get classes and subjects for registration forms"""
    
    def get(self, request):
        # Get all classes for student registration
        classes = Class.objects.all().values('id', 'name')
        
        # Get all subjects for teacher registration
        subjects = Subject.objects.all().values('id', 'name')
        
        return Response({
            'classes': list(classes),
            'subjects': list(subjects)
        })