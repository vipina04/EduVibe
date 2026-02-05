# users/urls.py
"""
User Authentication & Profile URL Configuration
EduVibe Platform - 2026
"""

from django.urls import path
from .views import (
    # Registration & OTP
    RegisterView,
    VerifyRegistrationOTPView,
    ResendOTPView,
    
    # Login
    LoginView,
    LogoutView,
    
    # Password Reset
    ForgotPasswordView,
    VerifyOTPAndResetPasswordView,
    
    # Profile
    ProfileView,
    
    # Utility
    GetClassListView,
    GetSubjectListView,
)

app_name = 'users'

urlpatterns = [
    # ═══════════════════════════════════════════════════════════
    #  REGISTRATION & OTP VERIFICATION
    # ═══════════════════════════════════════════════════════════
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-registration-otp/', VerifyRegistrationOTPView.as_view(), name='verify-registration-otp'),
    path(
    'resend-registration-otp/',
    ResendOTPView.as_view(),
    name='resend-registration-otp'
),

    
    # ═══════════════════════════════════════════════════════════
    #  LOGIN & LOGOUT
    # ═══════════════════════════════════════════════════════════
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # ═══════════════════════════════════════════════════════════
    #  PASSWORD RESET
    # ═══════════════════════════════════════════════════════════
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp-reset-password/', VerifyOTPAndResetPasswordView.as_view(), name='verify-otp-reset-password'),
    
    # ═══════════════════════════════════════════════════════════
    #  PROFILE
    # ═══════════════════════════════════════════════════════════
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # ═══════════════════════════════════════════════════════════
    #  UTILITY ENDPOINTS
    # ═══════════════════════════════════════════════════════════
    path('classes/', GetClassListView.as_view(), name='class-list'),
    path('subjects/', GetSubjectListView.as_view(), name='subject-list'),
]