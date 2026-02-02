# users/views.py
"""
Complete Authentication & User Management Views
EduVibe Platform - 2026
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
import random

from .models import CustomUser
from admin_tasks.models import Class, Subject


# ═══════════════════════════════════════════════════════════
#  REGISTRATION & OTP VERIFICATION
# ═══════════════════════════════════════════════════════════

class RegisterView(APIView):
    """User Registration with OTP verification"""
    
    def post(self, request):
        try:
            # Extract data
            role = request.data.get('role', '').lower()
            email = request.data.get('email', '').strip()
            phone = request.data.get('phone', '').strip()
            password = request.data.get('password')
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            dob = request.data.get('dob')
            
            # Validate role
            if role not in ['student', 'teacher']:
                return Response({
                    'error': 'Invalid role. Choose student or teacher.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate phone
            if not phone.isdigit() or len(phone) != 10:
                return Response({
                    'error': 'Phone must be exactly 10 digits.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check duplicates
            if CustomUser.objects.filter(email=email).exists():
                return Response({
                    'error': 'Email already registered.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if CustomUser.objects.filter(phone=phone).exists():
                return Response({
                    'error': 'Phone already registered.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user
            user = CustomUser(
                username=email,
                email=email,
                phone=phone,
                first_name=first_name,
                last_name=last_name,
                dob=dob,
                role=role,
                is_approved=False
            )
            user.set_password(password)
            
            # Role-specific fields
            if role == 'student':
                class_id = request.data.get('class_id')
                if not class_id:
                    return Response({
                        'error': 'Class is required for students.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    class_obj = Class.objects.get(id=class_id)
                    user.class_assigned = class_obj
                except Class.DoesNotExist:
                    return Response({
                        'error': 'Invalid class selected.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            elif role == 'teacher':
                subject_ids = request.data.get('subject_ids', [])
                
                if not subject_ids or len(subject_ids) < 1 or len(subject_ids) > 3:
                    return Response({
                        'error': 'Select 1 to 3 subjects.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                subjects = Subject.objects.filter(id__in=subject_ids)
                if subjects.count() != len(subject_ids):
                    return Response({
                        'error': 'Invalid subjects selected.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save user
            user.save()
            
            # Assign subjects to teacher
            if role == 'teacher':
                user.subjects.set(subject_ids)
            
            # Generate and send OTP
            otp = random.randint(100000, 999999)
            user.otp = otp
            user.otp_created = timezone.now()
            user.save()
            
            try:
                send_mail(
                    subject='EduVibe - Verify Your Email',
                    message=f'Hello {first_name},\n\nYour OTP: {otp}\n\nValid for 5 minutes.\n\nEduVibe Team',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                user.delete()
                return Response({
                    'error': f'Failed to send OTP: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                'message': 'Registration successful! Check your email for OTP.',
                'email': email
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({
                'error': f'Registration failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyRegistrationOTPView(APIView):
    """Verify OTP sent during registration"""
    
    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = request.data.get('otp')
        
        try:
            user = CustomUser.objects.get(email=email)
            
            if user.otp != int(otp):
                return Response({
                    'error': 'Invalid OTP.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check expiry (5 minutes)
            if user.otp_created:
                time_diff = (timezone.now() - user.otp_created).total_seconds()
                if time_diff > 300:
                    return Response({
                        'error': 'OTP expired. Request a new one.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Clear OTP
            user.otp = None
            user.otp_created = None
            user.save()
            
            return Response({
                'message': 'Email verified! Wait for admin approval.'
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({
                'error': 'Invalid OTP format.'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    """Resend OTP"""
    
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        try:
            user = CustomUser.objects.get(email=email)
            
            if user.otp is None:
                return Response({
                    'error': 'Email already verified.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new OTP
            otp = random.randint(100000, 999999)
            user.otp = otp
            user.otp_created = timezone.now()
            user.save()
            
            send_mail(
                subject='EduVibe - OTP Resent',
                message=f'Hello {user.first_name},\n\nNew OTP: {otp}\n\nValid for 5 minutes.\n\nEduVibe Team',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'OTP resent successfully!'
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  LOGIN & LOGOUT
# ═══════════════════════════════════════════════════════════

class LoginView(APIView):
    """User Login with email/unique_id"""
    
    def post(self, request):
        identifier = request.data.get('identifier', '').strip()
        password = request.data.get('password')
        
        if not identifier or not password:
            return Response({
                'error': 'Provide identifier and password.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find user
        user = CustomUser.objects.filter(
            Q(email=identifier) | Q(unique_id=identifier)
        ).first()
        
        if not user or not user.check_password(password):
            return Response({
                'error': 'Invalid credentials.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check email verified
        if user.otp is not None:
            return Response({
                'error': 'Verify your email first.',
                'action': 'verify_otp'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check admin approval
        if not user.is_approved:
            return Response({
                'error': 'Account pending admin approval.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': 'Login successful!',
            'token': token.key,
            'user': {
                'id': user.id,
                'unique_id': user.unique_id,
                'email': user.email,
                'name': f'{user.first_name} {user.last_name}'.strip() or user.username,
                'role': user.role,
                'phone': user.phone
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logout user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({
                'message': 'Logged out successfully!'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'error': 'Logout failed.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ═══════════════════════════════════════════════════════════
#  PASSWORD RESET
# ═══════════════════════════════════════════════════════════

class ForgotPasswordView(APIView):
    """Send OTP for password reset"""
    
    def post(self, request):
        email = request.data.get('email', '').strip()
        
        try:
            user = CustomUser.objects.get(email=email)
            
            otp = random.randint(100000, 999999)
            user.otp = otp
            user.otp_created = timezone.now()
            user.save()
            
            send_mail(
                subject='EduVibe - Password Reset',
                message=f'Hello {user.first_name},\n\nOTP: {otp}\n\nValid for 5 minutes.\n\nEduVibe Team',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'OTP sent to your email.'
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Email not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class VerifyOTPAndResetPasswordView(APIView):
    """Verify OTP and reset password"""
    
    def post(self, request):
        email = request.data.get('email', '').strip()
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        if not new_password or len(new_password) < 6:
            return Response({
                'error': 'Password must be at least 6 characters.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            
            if user.otp != int(otp):
                return Response({
                    'error': 'Invalid OTP.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if user.otp_created:
                time_diff = (timezone.now() - user.otp_created).total_seconds()
                if time_diff > 300:
                    return Response({
                        'error': 'OTP expired.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.otp = None
            user.otp_created = None
            user.save()
            
            return Response({
                'message': 'Password reset successful!'
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except ValueError:
            return Response({
                'error': 'Invalid OTP format.'
            }, status=status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════════════════════
#  PROFILE
# ═══════════════════════════════════════════════════════════

class ProfileView(APIView):
    """Get user profile"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        profile = {
            'id': user.id,
            'unique_id': user.unique_id,
            'email': user.email,
            'phone': user.phone,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'dob': user.dob,
            'role': user.role,
            'is_approved': user.is_approved,
            'created_at': user.date_joined
        }
        
        if user.role == 'student' and user.class_assigned:
            profile['class'] = {
                'id': user.class_assigned.id,
                'name': user.class_assigned.name
            }
        elif user.role == 'teacher':
            profile['subjects'] = [
                {'id': s.id, 'name': s.name}
                for s in user.subjects.all()
            ]
        
        return Response(profile)


# ═══════════════════════════════════════════════════════════
#  UTILITY VIEWS
# ═══════════════════════════════════════════════════════════

class GetClassListView(APIView):
    """Get all classes for registration"""
    
    def get(self, request):
        classes = Class.objects.all().values('id', 'name')
        return Response(list(classes))


class GetSubjectListView(APIView):
    """Get all subjects for teacher registration"""
    
    def get(self, request):
        subjects = Subject.objects.all().values('id', 'name')
        return Response(list(subjects))






















# from rest_framework.views import APIView # from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.contrib.auth import authenticate
# from rest_framework.authtoken.models import Token
# from .models import CustomUser
# from django.core.mail import send_mail
# from django.conf import settings
# import random
# from django.utils import timezone

# class LoginView(APIView):
#     def post(self, request):
#         identifier = request.data.get('identifier')  # email or unique_id
#         password = request.data.get('password')
#         user = CustomUser.objects.filter(email=identifier).first() or CustomUser.objects.filter(unique_id=identifier).first()
#         if user and user.check_password(password) and user.is_approved:
#             token, _ = Token.objects.get_or_create(user=user)
#             return Response({'token': token.key, 'role': user.role})
#         return Response({'error': 'Invalid credentials or not approved'}, status=status.HTTP_400_BAD_REQUEST)

# class ForgotPasswordView(APIView):
#     def post(self, request):
#         email = request.data.get('email')
#         user = CustomUser.objects.filter(email=email).first()
#         if user:
#             otp = random.randint(100000, 999999)
#             user.otp = otp  # Add otp field to model later
#             user.otp_created = timezone.now()
#             user.save()
#             send_mail('OTP for Password Reset', f'Your OTP is {otp}', settings.EMAIL_HOST_USER, [email])
#             return Response({'message': 'OTP sent'})
#         return Response({'error': 'Email not found'}, status=status.HTTP_400_BAD_REQUEST)

# class VerifyOTPView(APIView):
#     def post(self, request):
#         email = request.data.get('email')
#         otp = request.data.get('otp')
#         password = request.data.get('password')
#         user = CustomUser.objects.filter(email=email).first()
#         if user and user.otp == int(otp) and (timezone.now() - user.otp_created).seconds < 300:  # 5 min
#             user.set_password(password)
#             user.otp = None
#             user.save()
#             return Response({'message': 'Password reset'})
#         return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

# class RegisterView(APIView):
#     def post(self, request):
#         role = request.data.get('role')
#         name = request.data.get('name')
#         email = request.data.get('email')
#         phone = request.data.get('phone')
#         dob = request.data.get('dob')
#         password = request.data.get('password')
#         # Validate phone: only numbers, 10 digits
#         if not phone.isdigit() or len(phone) != 10:
#             return Response({'error': 'Invalid phone'}, status=status.HTTP_400_BAD_REQUEST)
#         if CustomUser.objects.filter(email=email).exists():
#             return Response({'error': 'Email exists'}, status=status.HTTP_400_BAD_REQUEST)

#         user = CustomUser(username=email, email=email, phone=phone, dob=dob, role=role)
#         user.set_password(password)
#         if role == 'student':
#             class_id = request.data.get('class_id')
#             user.class_assigned = Class.objects.get(id=class_id)
#         elif role == 'teacher':
#             subject_ids = request.data.get('subject_ids', []).split(',')
#             if len(subject_ids) < 1 or len(subject_ids) > 3:
#                 return Response({'error': 'Select 1-3 subjects'}, status=status.HTTP_400_BAD_REQUEST)
#             user.save()
#             user.subjects.set(Subject.objects.filter(id__in=subject_ids))
#         user.save()
#         # Send OTP for email verification
#         otp = random.randint(100000, 999999)
#         user.otp = otp
#         user.save()
#         send_mail('Verify Email', f'Your OTP is {otp}', settings.EMAIL_HOST_USER, [email])
#         return Response({'message': 'Registered, verify OTP'})

# class VerifyRegistrationOTPView(APIView):
#     def post(self, request):
#         email = request.data.get('email')
#         otp = request.data.get('otp')
#         user = CustomUser.objects.filter(email=email).first()
#         if user and user.otp == int(otp):
#             user.otp = None
#             user.save()
#             return Response({'message': 'Verified, await admin approval'})
#         return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)