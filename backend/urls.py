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
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)





























# # backend/urls.py
# """
# Main URL Configuration for EduVibe Backend
# Complete Professional Structure - 2026

# API Structure:
# - /api/users/          → Authentication & User Management
# - /api/admin/          → Admin Operations
# - /api/teachers/       → Teacher Module
# - /api/students/       → Student Module
# - /api/academics/      → Academic Content (classes, subjects, chapters)
# """

# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from rest_framework.response import Response
# from rest_framework.decorators import api_view


# @api_view(['GET'])
# def api_root(request):
#     """API Root - Health Check"""
#     return Response({
#         'message': 'Welcome to EduVibe API',
#         'version': '1.0',
#         'status': 'active',
#         'endpoints': {
#             'users': '/api/users/',
#             'admin': '/api/admin/',
#             'teachers': '/api/teachers/',
#             'students': '/api/students/',
#             'academics': '/api/academics/',
#         }
#     })


# urlpatterns = [
#     # ═══════════════════════════════════════════════════════════
#     #  DJANGO ADMIN PANEL
#     # ═══════════════════════════════════════════════════════════
#     path('admin/', admin.site.urls),

#     # ═══════════════════════════════════════════════════════════
#     #  API ROOT
#     # ═══════════════════════════════════════════════════════════
#     path('api/', api_root, name='api-root'),

#     # ═══════════════════════════════════════════════════════════
#     #  API ENDPOINTS - MODULAR STRUCTURE
#     # ═══════════════════════════════════════════════════════════
#     path('api/users/', include('users.urls', namespace='users')),
#     path('api/admin/', include('admin_tasks.urls', namespace='admin_tasks')),
#     path('api/teachers/', include('teachers.urls', namespace='teachers')),
#     path('api/students/', include('students.urls', namespace='students')),
#     path('api/academics/', include('academics.urls', namespace='academics')),
# ]

# # ═══════════════════════════════════════════════════════════
# #  STATIC & MEDIA FILES (Development Only)
# # ═══════════════════════════════════════════════════════════
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
























# # # backend/urls.py
# # """
# # Main URL Configuration for EduVibe Backend
# # Complete Professional Structure - 2026

# # API Structure:
# # - /api/users/          → Authentication & User Management
# # - /api/admin/          → Admin Operations
# # - /api/teachers/       → Teacher Module
# # - /api/students/       → Student Module
# # """

# # from django.contrib import admin
# # from django.urls import path, include
# # from django.conf import settings
# # from django.conf.urls.static import static
# # from rest_framework.response import Response
# # from rest_framework.decorators import api_view


# # @api_view(['GET'])
# # def api_root(request):
# #     """API Root - Health Check"""
# #     return Response({
# #         'message': 'Welcome to EduVibe API',
# #         'version': '1.0',
# #         'status': 'active',
# #         'endpoints': {
# #             'users': '/api/users/',
# #             'admin': '/api/admin/',
# #             'teachers': '/api/teachers/',
# #             'students': '/api/students/',
# #         }
# #     })


# # urlpatterns = [
# #     # ═══════════════════════════════════════════════════════════
# #     #  DJANGO ADMIN PANEL
# #     # ═══════════════════════════════════════════════════════════
# #     path('admin/', admin.site.urls),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  API ROOT
# #     # ═══════════════════════════════════════════════════════════
# #     path('api/', api_root, name='api-root'),
    
# #     # ═══════════════════════════════════════════════════════════
# #     #  API ENDPOINTS - MODULAR STRUCTURE
# #     # ═══════════════════════════════════════════════════════════
# #     path('api/users/', include('users.urls', namespace='users')),
# #     path('api/admin/', include('admin_tasks.urls', namespace='admin_tasks')),
# #     path('api/teachers/', include('teachers.urls', namespace='teachers')),
# #     path('api/students/', include('students.urls', namespace='students')),
# # ]

# # # ═══════════════════════════════════════════════════════════
# # #  STATIC & MEDIA FILES (Development Only)
# # # ═══════════════════════════════════════════════════════════
# # if settings.DEBUG:
# #     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# #     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)












# # # from django.contrib import admin
# # # from django.urls import path
# # # from users.views import LoginView, ForgotPasswordView, VerifyOTPView, RegisterView, VerifyRegistrationOTPView
# # # from admin_tasks.views import ApproveUserView, ClassCreateView, SubjectCreateView, ChapterCreateView
# # # from django.conf.urls.static import static
# # # from django.conf import settings

# # # urlpatterns = [
# # #     path('admin/', admin.site.urls),
# # #     path('api/login/', LoginView.as_view()),
# # #     path('api/forgot-password/', ForgotPasswordView.as_view()),
# # #     path('api/verify-otp/', VerifyOTPView.as_view()),
# # #     path('api/register/', RegisterView.as_view()),
# # #     path('api/verify-reg-otp/', VerifyRegistrationOTPView.as_view()),
# # #     path('api/approve-user/', ApproveUserView.as_view()),
# # #     path('api/add-class/', ClassCreateView.as_view()),
# # #     path('api/add-subject/', SubjectCreateView.as_view()),
# # #     path('api/add-chapter/', ChapterCreateView.as_view()),
# # #     # Add more URLs for other views
# # # ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
















# # # # """
# # # # URL configuration for backend project.

# # # # The `urlpatterns` list routes URLs to views. For more information please see:
# # # #     https://docs.djangoproject.com/en/6.0/topics/http/urls/
# # # # Examples:
# # # # Function views
# # # #     1. Add an import:  from my_app import views
# # # #     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# # # # Class-based views
# # # #     1. Add an import:  from other_app.views import Home
# # # #     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# # # # Including another URLconf
# # # #     1. Import the include() function: from django.urls import include, path
# # # #     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# # # # """
# # # # from django.contrib import admin
# # # # from django.urls import path

# # # # urlpatterns = [
# # # #     path('admin/', admin.site.urls),
# # # # ]




















# # # # backend/urls.py
# # # """
# # # Main URL Configuration for EduVibe Backend
# # # """

# # # from django.contrib import admin
# # # from django.urls import path, include
# # # from django.conf import settings
# # # from django.conf.urls.static import static

# # # urlpatterns = [
# # #     # Django Admin
# # #     path('admin/', admin.site.urls),
    
# # #     # API Endpoints
# # #     # path('api/users/', include('users.urls')),
# # #     # path('api/admin/', include('admin_tasks.urls')),
# # #     # path('api/teachers/', include('teachers.urls')),
# # #     # path('api/students/', include('students.urls')),
# # # ]

# # # # Serve media files in development
# # # if settings.DEBUG:
# # #     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# # #     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)












# # # # from django.contrib import admin
# # # # from django.urls import path
# # # # from users.views import LoginView, ForgotPasswordView, VerifyOTPView, RegisterView, VerifyRegistrationOTPView
# # # # from admin_tasks.views import ApproveUserView, ClassCreateView, SubjectCreateView, ChapterCreateView
# # # # from django.conf.urls.static import static
# # # # from django.conf import settings

# # # # urlpatterns = [
# # # #     path('admin/', admin.site.urls),
# # # #     path('api/login/', LoginView.as_view()),
# # # #     path('api/forgot-password/', ForgotPasswordView.as_view()),
# # # #     path('api/verify-otp/', VerifyOTPView.as_view()),
# # # #     path('api/register/', RegisterView.as_view()),
# # # #     path('api/verify-reg-otp/', VerifyRegistrationOTPView.as_view()),
# # # #     path('api/approve-user/', ApproveUserView.as_view()),
# # # #     path('api/add-class/', ClassCreateView.as_view()),
# # # #     path('api/add-subject/', SubjectCreateView.as_view()),
# # # #     path('api/add-chapter/', ChapterCreateView.as_view()),
# # # #     # Add more URLs for other views
# # # # ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
















# # # # # """
# # # # # URL configuration for backend project.

# # # # # The `urlpatterns` list routes URLs to views. For more information please see:
# # # # #     https://docs.djangoproject.com/en/6.0/topics/http/urls/
# # # # # Examples:
# # # # # Function views
# # # # #     1. Add an import:  from my_app import views
# # # # #     2. Add a URL to urlpatterns:  path('', views.home, name='home')
# # # # # Class-based views
# # # # #     1. Add an import:  from other_app.views import Home
# # # # #     2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
# # # # # Including another URLconf
# # # # #     1. Import the include() function: from django.urls import include, path
# # # # #     2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
# # # # # """
# # # # # from django.contrib import admin
# # # # # from django.urls import path

# # # # # urlpatterns = [
# # # # #     path('admin/', admin.site.urls),
# # # # # ]
