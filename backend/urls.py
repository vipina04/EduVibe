"""
Main URL Configuration for EduVibe Backend
Complete Professional Structure - 2026

API Structure:
- /api/users/          → Authentication & User Management
- /api/admin/          → Admin Operations
- /api/teachers/       → Teacher Module
- /api/students/       → Student Module
- /api/academics/      → Academic Content (classes, subjects, chapters)
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect # Added for root redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view


@api_view(['GET'])
def api_root(request):
    """API Root - Health Check"""
    return Response({
        'message': 'Welcome to EduVibe API',
        'version': '1.0',
        'status': 'active',
        'endpoints': {
            'users': request.build_absolute_uri('/api/users/'),
            'admin': request.build_absolute_uri('/api/admin/'),
            'teachers': request.build_absolute_uri('/api/teachers/'),
            'students': request.build_absolute_uri('/api/students/'),
            'academics': request.build_absolute_uri('/api/academics/'),
        }
    })

# Function to handle root URL
def root_redirect(request):
    return redirect('api-root')

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  ROOT REDIRECT (Fixes the 404 at /)
    # ═══════════════════════════════════════════════════════════
    path('', root_redirect),

    # ═══════════════════════════════════════════════════════════
    #  DJANGO ADMIN PANEL
    # ═══════════════════════════════════════════════════════════
    path('admin/', admin.site.urls),

    # ═══════════════════════════════════════════════════════════
    #  API ROOT
    # ═══════════════════════════════════════════════════════════
    path('api/', api_root, name='api-root'),

    # ═══════════════════════════════════════════════════════════
    #  API ENDPOINTS - MODULAR STRUCTURE
    # ═══════════════════════════════════════════════════════════
    path('api/users/', include('users.urls', namespace='users')),
    path('api/admin/', include('admin_tasks.urls', namespace='admin_tasks')),
    path('api/teachers/', include('teachers.urls', namespace='teachers')),
    path('api/students/', include('students.urls', namespace='students')),
    path('api/academics/', include('academics.urls', namespace='academics')),
]

# ═══════════════════════════════════════════════════════════
#  STATIC & MEDIA FILES (Development Only)
# ═══════════════════════════════════════════════════════════
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)






















