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
from django.http import JsonResponse
from django.db import connection
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import random
import os

from .models import CustomUser
from academics.models import AcademicClass as Class, Subject as AcademicSubject, ClassSubject

import requests as http_requests


def send_otp_email(to_email, subject, body):
    """Send email via Brevo HTTP API — works on Render free tier"""
    # FIX: Read BREVO_API_KEY from environment (must be set in Render environment variables)
    api_key = os.getenv('BREVO_API_KEY')
    # FIX: Use a fixed sender email — must be the email you registered with on Brevo
    sender_email = os.getenv('BREVO_SENDER_EMAIL') or os.getenv('EMAIL_HOST_USER')

    if not api_key:
        raise Exception("BREVO_API_KEY environment variable is not set")

    response = http_requests.post(
        'https://api.brevo.com/v3/smtp/email',
        headers={
            'api-key': api_key,
            'Content-Type': 'application/json'
        },
        json={
            'sender': {'email': sender_email, 'name': 'EduVibe'},
            'to': [{'email': to_email}],
            'subject': subject,
            'textContent': body
        }
    )

    if response.status_code not in [200, 201]:
        raise Exception(f"Brevo API error: {response.text}")

    return True


# ═══════════════════════════════════════════════════════════
#  REGISTRATION & OTP VERIFICATION
# ═══════════════════════════════════════════════════════════
class RegisterView(APIView):
    """User Registration with OTP verification"""

    def post(self, request):
        try:
            role = request.data.get('role', '').lower()
            email = request.data.get('email', '').strip()
            phone = request.data.get('phone', '').strip()
            password = request.data.get('password')
            first_name = request.data.get('first_name', '').strip()
            last_name = request.data.get('last_name', '').strip()
            dob = request.data.get('dob')

            if role not in ['student', 'teacher']:
                return Response({'error': 'Invalid role.'}, status=400)

            if not phone.isdigit() or len(phone) != 10:
                return Response({'error': 'Phone must be 10 digits.'}, status=400)
            
            # If email exists but unverified — delete and allow fresh registration
            existing_unverified = CustomUser.objects.filter(email=email, is_active=False).first()
            if existing_unverified:
                existing_unverified.delete()

            if CustomUser.objects.filter(email=email, is_active=True).exists():
                return Response({'error': 'Email already exists.'}, status=400)

            # Same for phone
            existing_unverified_phone = CustomUser.objects.filter(phone=phone, is_active=False).first()
            if existing_unverified_phone:
                existing_unverified_phone.delete()

            if CustomUser.objects.filter(phone=phone, is_active=True).exists():
                return Response({'error': 'Phone already exists.'}, status=400)
            
          

            user = CustomUser(
                username=email,
                email=email,
                phone=phone,
                first_name=first_name,
                last_name=last_name,
                dob=dob,
                role=role,
                is_approved=False,
                is_active=False, 
            )
            user.set_password(password)

            if role == 'student':
                class_id = request.data.get('class_id')
                if not class_id:
                    return Response({'error': 'Class required.'}, status=400)
                try:
                    user.class_assigned = Class.objects.get(id=class_id)
                except Class.DoesNotExist:
                    return Response({'error': 'Invalid class.'}, status=400)

            elif role == 'teacher':
                subject_ids = request.data.get('subject_ids', [])
                if not subject_ids or len(subject_ids) > 3:
                    return Response({'error': 'Select 1–3 subjects.'}, status=400)
                subjects = AcademicSubject.objects.filter(id__in=subject_ids)
                if subjects.count() != len(subject_ids):
                    return Response({'error': 'Invalid subjects.'}, status=400)

            # Generate OTP BEFORE saving
            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.otp_created = timezone.now()
            user.otp_purpose = 'registration'

            user.save()  # Save only once after all fields set
            
            
            if role == 'teacher':
                user.subjects.set(subject_ids)

            # Send OTP email — works for BOTH student and teacher
            try:
                send_otp_email(
                    email,
                    'EduVibe - Verify Email',
                    f'Hello {first_name},\n\nYour OTP to verify your email is: {otp}\n\nValid for 5 minutes.\n\nDo not share this OTP with anyone.\n\nEduVibe Team'
                )
            except Exception as email_error:
                user.delete()
                return Response({'error': 'Could not send OTP email. Please check your email address and try again.'}, status=500)

            return Response({'message': 'OTP sent to your email. Please verify to complete registration.'}, status=201)

            # if role == 'teacher':
            #     user.subjects.set(subject_ids)
                
                
            #     # try:
            #     #     send_otp_email(
            #     #     email,
            #     #     'EduVibe - Verify Email',
            #     #     f'Hello {first_name},\n\nYour OTP to verify your email is: {otp}\n\nValid for 5 minutes.\n\nDo not share this OTP with anyone.\n\nEduVibe Team'
            #     # )
            #     # except Exception as email_error:
            #     #        user.delete()
            #     # return Response({'error': 'Could not send OTP email. Please check your email address and try again.'}, status=500)
            #     try:
            #         send_otp_email(
            #         email,
            #         'EduVibe - Verify Email',
            #         f'Hello {first_name},\n\nYour OTP to verify your email is: {otp}\n\nValid for 5 minutes.\n\nDo not share this OTP with anyone.\n\nEduVibe Team'
            #     )
            #     except Exception as email_error:
            #            user.delete()
            #     return Response({'error': 'Could not send OTP email. Please check your email address and try again.'}, status=500)

            # return Response({'message': 'OTP sent to your email. Please verify to complete registration.'}, status=201)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
        

class VerifyRegistrationOTPView(APIView):
    """Verify registration OTP"""

    def post(self, request):
        email = request.data.get('email')
        otp = str(request.data.get('otp')).strip()

        try:
            user = CustomUser.objects.get(email=email)

            if not user.otp:
                return Response({'error': 'No OTP found.'}, status=400)

            if user.otp_purpose != 'registration':
                return Response({'error': 'Invalid OTP purpose.'}, status=400)

            if str(user.otp) != otp:
                return Response({'error': 'Invalid OTP.'}, status=400)

            if (timezone.now() - user.otp_created).total_seconds() > 300:
                return Response({'error': 'OTP expired.'}, status=400)

           
            user.otp = None
            user.otp_created = None
            user.otp_purpose = None
            user.is_active = True 
            user.save()

            return Response({'message': 'Email verified. Await approval.'})

        
        
        
        

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


class ResendOTPView(APIView):
    """Resend registration OTP"""

    def post(self, request):
        email = request.data.get('email')

        try:
            user = CustomUser.objects.get(email=email)

            if user.otp_created and (timezone.now() - user.otp_created).total_seconds() < 60:
                return Response({'error': 'Please wait before requesting a new OTP.'}, status=429)

            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.otp_created = timezone.now()
            user.otp_purpose = 'registration'
            user.save()

            # FIX: Use user.first_name (from DB), not undefined 'first_name' variable
            try:
                send_otp_email(
                    email,
                    'EduVibe - OTP Resent',
                    f'Hello {user.first_name},\n\nYour new OTP is: {otp}\nValid for 5 minutes.'
                )
            except Exception as email_error:
                print(f"Resend OTP email failed: {email_error}")
                return Response(
                    {'error': 'Could not send OTP email. Please try again.'},
                    status=500
                )

            return Response({'message': 'OTP resent.'})

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


# ═══════════════════════════════════════════════════════════
#  LOGIN & LOGOUT
# ═══════════════════════════════════════════════════════════

class LoginView(APIView):
    """User login — accepts email, unique_id, or username field"""

    def post(self, request):
        # Support both 'identifier' and 'username' field names from frontend
        identifier = request.data.get('identifier') or request.data.get('username')
        password = request.data.get('password')

        if not identifier or not password:
            return Response({'error': 'Email/ID and password are required.'}, status=400)

        user = CustomUser.objects.filter(
            Q(email=identifier) | Q(unique_id=identifier)
        ).first()

        if not user or not user.check_password(password):
            return Response({'error': 'Invalid credentials.'}, status=401)

        if user.otp:
            return Response({'error': 'Verify email first.'}, status=403)

        if not user.is_approved:
            return Response({'error': 'Pending admin approval.'}, status=403)

        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)

        return Response({
            'token': token.key,
            'role': user.role,
            'unique_id': user.unique_id
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logged out.'})


# ═══════════════════════════════════════════════════════════
#  PASSWORD RESET
# ═══════════════════════════════════════════════════════════

class ForgotPasswordView(APIView):
    """Send OTP for password reset"""

    def post(self, request):
        email = request.data.get('email')

        try:
            user = CustomUser.objects.get(email=email)

            if user.otp_purpose == 'registration' and user.otp:
                return Response({'error': 'Please verify your email first.'}, status=403)

            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.otp_created = timezone.now()
            user.otp_purpose = 'password_reset'
            user.save()

            # FIX: Use user.first_name (from DB), not undefined 'first_name' variable
            try:
                send_otp_email(
                    email,
                    'EduVibe - Password Reset',
                    f'Hello {user.first_name},\n\nYour password reset OTP is: {otp}\nValid for 5 minutes.\n\nIf you did not request this, ignore this email.'
                )
            except Exception as email_error:
                print(f"Forgot password email failed: {email_error}")
                return Response(
                    {'error': 'Could not send OTP email. Please try again.'},
                    status=500
                )

            return Response({'message': 'OTP sent.'})

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


class VerifyOTPAndResetPasswordView(APIView):
    """Verify OTP and reset password"""

    def post(self, request):
        email = request.data.get('email')
        otp = str(request.data.get('otp')).strip()
        new_password = request.data.get('new_password')

        if not new_password or len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=400)

        try:
            user = CustomUser.objects.get(email=email)

            if not user.otp:
                return Response({'error': 'No OTP found.'}, status=400)

            if user.otp_purpose != 'password_reset':
                return Response({'error': 'Invalid OTP purpose.'}, status=400)

            if str(user.otp) != otp:
                return Response({'error': 'Invalid OTP.'}, status=400)

            if (timezone.now() - user.otp_created).total_seconds() > 300:
                return Response({'error': 'OTP expired.'}, status=400)

            user.set_password(new_password)
            user.otp = None
            user.otp_created = None
            user.otp_purpose = None
            user.save()

            return Response({'message': 'Password reset successful.'})

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)


# ═══════════════════════════════════════════════════════════
#  PROFILE & UTILITIES
# ═══════════════════════════════════════════════════════════

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'email': user.email,
            'role': user.role,
            'unique_id': user.unique_id
        })


class GetClassListView(APIView):
    def get(self, request):
        from academics.models import AcademicClass
        return Response(list(AcademicClass.objects.values('id', 'name')))


class GetSubjectListView(APIView):
    def get(self, request):
        from academics.models import Subject as AcademicSubject
        seen = set()
        result = []
        for s in AcademicSubject.objects.all():
            if s.name.lower() not in seen:
                seen.add(s.name.lower())
                result.append({'id': s.id, 'name': s.name})
        return Response(result)


# ═══════════════════════════════════════════════════════════
#  GOOGLE AUTH
# ═══════════════════════════════════════════════════════════

class GoogleAuthView(APIView):
    """Handle Google Sign-In for both login and registration"""

    def post(self, request):
        credential = request.data.get('credential')
        role = request.data.get('role', 'student')

        print(f"🔵 GoogleAuth: Received request for role: {role}")

        if not credential:
            print("❌ GoogleAuth: No credential provided")
            return Response({'error': 'Google credential required.'}, status=400)

        try:
            google_client_id = settings.GOOGLE_CLIENT_ID

            print(f"🔍 GoogleAuth: Using Client ID: {google_client_id[:30]}...")
            print(f"🔍 GoogleAuth: Token length: {len(credential)}")

            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                google_client_id,
                clock_skew_in_seconds=120
            )

            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            print(f"✅ GoogleAuth: Token verified for {email}")

            if not email:
                print("❌ GoogleAuth: No email in token")
                return Response({'error': 'Could not retrieve email from Google.'}, status=400)

            # Check if user already exists
            user = CustomUser.objects.filter(email=email).first()

            if user:
                # Existing user — log them in
                print(f"👤 GoogleAuth: Existing user login: {email}")
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': {
                        'email': user.email,
                        'role': user.role,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'unique_id': user.unique_id,
                        'is_approved': user.is_approved,
                    }
                })
            else:
                # New user — create account
                print(f"🆕 GoogleAuth: Creating new user: {email}")

                if role not in ['student', 'teacher']:
                    print(f"❌ GoogleAuth: Invalid role: {role}")
                    return Response({'error': 'Invalid role.'}, status=400)

                user = CustomUser(
                    username=email,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role=role,
                    is_approved=False,
                )
                user.set_unusable_password()
                user.save()

                token, _ = Token.objects.get_or_create(user=user)

                print(f"✅ GoogleAuth: New user created: {email}")

                return Response({
                    'token': token.key,
                    'is_new_user': True,
                    'user': {
                        'email': user.email,
                        'role': user.role,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_approved': user.is_approved,
                    }
                }, status=201)

        except ValueError as e:
            print(f"❌ GoogleAuth: Token verification failed: {str(e)}")
            return Response({'error': f'Invalid Google token: {str(e)}'}, status=400)
        except Exception as e:
            print(f"❌ GoogleAuth: Unexpected error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': 'Google authentication failed.'}, status=500)


# ═══════════════════════════════════════════════════════════
#  DEBUG (temporary — remove after confirming everything works)
# ═══════════════════════════════════════════════════════════

def debug_db(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'users_customuser'
            AND data_type = 'character varying'
            ORDER BY column_name
        """)
        cols = cursor.fetchall()

        cursor.execute("""
            SELECT name FROM django_migrations 
            WHERE app = 'users' 
            ORDER BY applied
        """)
        migrations = cursor.fetchall()

    return JsonResponse({
        'all_varchar_columns': [{'column': c[0], 'max_length': c[1]} for c in cols],
        'applied_migrations': [m[0] for m in migrations]
    })





























# # users/views.py
# """
# Complete Authentication & User Management Views
# EduVibe Platform - 2026
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.authtoken.models import Token
# from rest_framework.permissions import IsAuthenticated
# from django.contrib.auth import authenticate
# from django.core.mail import send_mail
# from django.conf import settings
# from django.utils import timezone
# from django.db.models import Q
# from django.http import JsonResponse
# from django.db import connection
# from google.oauth2 import id_token
# from google.auth.transport import requests as google_requests
# import random
# import os

# from .models import CustomUser
# from academics.models import AcademicClass as Class, Subject as AcademicSubject, ClassSubject

# import requests as http_requests

# def send_otp_email(to_email, subject, body):
#     """Send email via Brevo HTTP API — works on Render free tier"""
#     api_key = os.getenv('BREVO_API_KEY')
#     sender_email = os.getenv('EMAIL_HOST_USER')
    
#     response = http_requests.post(
#         'https://api.brevo.com/v3/smtp/email',
#         headers={
#             'api-key': api_key,
#             'Content-Type': 'application/json'
#         },
#         json={
#             'sender': {'email': sender_email, 'name': 'EduVibe'},
#             'to': [{'email': to_email}],
#             'subject': subject,
#             'textContent': body
#         }
#     )
    
#     if response.status_code not in [200, 201]:
#         raise Exception(f"Brevo API error: {response.text}")
    
#     return True
# # ═══════════════════════════════════════════════════════════
# #  REGISTRATION & OTP VERIFICATION
# # ═══════════════════════════════════════════════════════════

# class RegisterView(APIView):
#     """User Registration with OTP verification"""

#     def post(self, request):
#         try:
#             role = request.data.get('role', '').lower()
#             email = request.data.get('email', '').strip()
#             phone = request.data.get('phone', '').strip()
#             password = request.data.get('password')
#             first_name = request.data.get('first_name', '').strip()
#             last_name = request.data.get('last_name', '').strip()
#             dob = request.data.get('dob')

#             if role not in ['student', 'teacher']:
#                 return Response({'error': 'Invalid role.'}, status=400)

#             # Clean phone number - remove spaces, dashes, +91, + prefix
#             phone = phone.replace(' ', '').replace('-', '').replace('+91', '').replace('+', '')
#             if not phone.isdigit() or len(phone) != 10:
#                 return Response({'error': 'Phone must be 10 digits.'}, status=400)

#             if CustomUser.objects.filter(email=email).exists():
#                 return Response({'error': 'Email already exists.'}, status=400)

#             if CustomUser.objects.filter(phone=phone).exists():
#                 return Response({'error': 'Phone already exists.'}, status=400)

#             user = CustomUser(
#                 username=email,
#                 email=email,
#                 phone=phone,
#                 first_name=first_name,
#                 last_name=last_name,
#                 dob=dob,
#                 role=role,
#                 is_approved=False
#             )
#             user.set_password(password)

#             if role == 'student':
#                 class_id = request.data.get('class_id')
#                 if not class_id:
#                     return Response({'error': 'Class required.'}, status=400)
#                 try:
#                     user.class_assigned = Class.objects.get(id=class_id)
#                 except Class.DoesNotExist:
#                     return Response({'error': 'Invalid class.'}, status=400)

#             elif role == 'teacher':
#                 subject_ids = request.data.get('subject_ids', [])
#                 if not subject_ids or len(subject_ids) > 3:
#                     return Response({'error': 'Select 1–3 subjects.'}, status=400)
#                 subjects = AcademicSubject.objects.filter(id__in=subject_ids)
#                 if subjects.count() != len(subject_ids):
#                     return Response({'error': 'Invalid subjects.'}, status=400)

#             user.save()

#             if role == 'teacher':
#                 user.subjects.set(subject_ids)

#             # Generate OTP
#             otp = str(random.randint(100000, 999999))
#             user.otp = otp
#             user.otp_created = timezone.now()
#             user.otp_purpose = 'registration'
#             user.save()

#             # Send OTP email — if fails, delete user cleanly and return error
#             try:
#                 # send_mail(
#                 #     'EduVibe - Verify Email',
#                 #     f'Hello {first_name},\n\nYour OTP is: {otp}\nValid for 5 minutes.\n\nDo not share this OTP with anyone.',
#                 #     settings.EMAIL_HOST_USER,
#                 #     [email],
#                 #     fail_silently=False,
#                 # )
#                 send_otp_email(
#                  email,
#                 'EduVibe - Verify Email',
#                 f'Hello {first_name},\n\nYour OTP is: {otp}\nValid for 5 minutes.'
#                  )
#             except Exception as email_error:
#                 print(f"Email send failed: {email_error}")
#                 user.delete()  # Clean up — don't leave broken incomplete user
#                 return Response(
#                     {'error': 'Could not send OTP email. Please check your email address and try again.'},
#                     status=500
#                 )

#             return Response({'message': 'Registration successful. Verify OTP.'}, status=201)

#         except Exception as e:
#             return Response({'error': str(e)}, status=500)


# class VerifyRegistrationOTPView(APIView):
#     """Verify registration OTP"""

#     def post(self, request):
#         email = request.data.get('email')
#         otp = str(request.data.get('otp')).strip()

#         try:
#             user = CustomUser.objects.get(email=email)

#             if not user.otp:
#                 return Response({'error': 'No OTP found.'}, status=400)

#             if user.otp_purpose != 'registration':
#                 return Response({'error': 'Invalid OTP purpose.'}, status=400)

#             if str(user.otp) != otp:
#                 return Response({'error': 'Invalid OTP.'}, status=400)

#             if (timezone.now() - user.otp_created).total_seconds() > 300:
#                 return Response({'error': 'OTP expired.'}, status=400)

#             user.otp = None
#             user.otp_created = None
#             user.otp_purpose = None
#             user.save()

#             return Response({'message': 'Email verified. Await approval.'})

#         except CustomUser.DoesNotExist:
#             return Response({'error': 'User not found.'}, status=404)


# class ResendOTPView(APIView):
#     """Resend registration OTP"""

#     def post(self, request):
#         email = request.data.get('email')

#         try:
#             user = CustomUser.objects.get(email=email)

#             if user.otp_created and (timezone.now() - user.otp_created).total_seconds() < 60:
#                 return Response({'error': 'Please wait before requesting a new OTP.'}, status=429)

#             otp = str(random.randint(100000, 999999))
#             user.otp = otp
#             user.otp_created = timezone.now()
#             user.otp_purpose = 'registration'
#             user.save()

#             try:
#                 # send_mail(
#                 #     'EduVibe - OTP Resent',
#                 #     f'Your new OTP is: {otp}\nValid for 5 minutes.',
#                 #     settings.EMAIL_HOST_USER,
#                 #     [email],
#                 #     fail_silently=False,
#                 # )
#                 send_otp_email(
#                 email,
#                'EduVibe - Verify Email',
#                f'Hello {first_name},\n\nYour OTP is: {otp}\nValid for 5 minutes.'
#                )
#             except Exception as email_error:
#                 print(f"Resend OTP email failed: {email_error}")
#                 return Response(
#                     {'error': 'Could not send OTP email. Please try again.'},
#                     status=500
#                 )

#             return Response({'message': 'OTP resent.'})

#         except CustomUser.DoesNotExist:
#             return Response({'error': 'User not found.'}, status=404)


# # ═══════════════════════════════════════════════════════════
# #  LOGIN & LOGOUT
# # ═══════════════════════════════════════════════════════════

# class LoginView(APIView):
#     """User login — accepts email, unique_id, or username field"""

#     def post(self, request):
#         # Support both 'identifier' and 'username' field names from frontend
#         identifier = request.data.get('identifier') or request.data.get('username')
#         password = request.data.get('password')

#         if not identifier or not password:
#             return Response({'error': 'Email/ID and password are required.'}, status=400)

#         user = CustomUser.objects.filter(
#             Q(email=identifier) | Q(unique_id=identifier)
#         ).first()

#         if not user or not user.check_password(password):
#             return Response({'error': 'Invalid credentials.'}, status=401)

#         if user.otp:
#             return Response({'error': 'Verify email first.'}, status=403)

#         if not user.is_approved:
#             return Response({'error': 'Pending admin approval.'}, status=403)

#         Token.objects.filter(user=user).delete()
#         token = Token.objects.create(user=user)

#         return Response({
#             'token': token.key,
#             'role': user.role,
#             'unique_id': user.unique_id
#         })


# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         request.user.auth_token.delete()
#         return Response({'message': 'Logged out.'})


# # ═══════════════════════════════════════════════════════════
# #  PASSWORD RESET
# # ═══════════════════════════════════════════════════════════

# class ForgotPasswordView(APIView):
#     """Send OTP for password reset"""

#     def post(self, request):
#         email = request.data.get('email')

#         try:
#             user = CustomUser.objects.get(email=email)

#             if user.otp_purpose == 'registration' and user.otp:
#                 return Response({'error': 'Please verify your email first.'}, status=403)

#             otp = str(random.randint(100000, 999999))
#             user.otp = otp
#             user.otp_created = timezone.now()
#             user.otp_purpose = 'password_reset'
#             user.save()

#             try:
#                 # send_mail(
#                 #     'EduVibe - Password Reset',
#                 #     f'Your password reset OTP is: {otp}\nValid for 5 minutes.\n\nIf you did not request this, ignore this email.',
#                 #     settings.EMAIL_HOST_USER,
#                 #     [email],
#                 #     fail_silently=False,
#                 # )
#                 send_otp_email(
#                 email,
#                 'EduVibe - Verify Email',
#                 f'Hello {first_name},\n\nYour OTP is: {otp}\nValid for 5 minutes.'
#                 )
#             except Exception as email_error:
#                 print(f"Forgot password email failed: {email_error}")
#                 return Response(
#                     {'error': 'Could not send OTP email. Please try again.'},
#                     status=500
#                 )

#             return Response({'message': 'OTP sent.'})

#         except CustomUser.DoesNotExist:
#             return Response({'error': 'User not found.'}, status=404)


# class VerifyOTPAndResetPasswordView(APIView):
#     """Verify OTP and reset password"""

#     def post(self, request):
#         email = request.data.get('email')
#         otp = str(request.data.get('otp')).strip()
#         new_password = request.data.get('new_password')

#         if not new_password or len(new_password) < 8:
#             return Response({'error': 'Password must be at least 8 characters.'}, status=400)

#         try:
#             user = CustomUser.objects.get(email=email)

#             if not user.otp:
#                 return Response({'error': 'No OTP found.'}, status=400)

#             if user.otp_purpose != 'password_reset':
#                 return Response({'error': 'Invalid OTP purpose.'}, status=400)

#             if str(user.otp) != otp:
#                 return Response({'error': 'Invalid OTP.'}, status=400)

#             if (timezone.now() - user.otp_created).total_seconds() > 300:
#                 return Response({'error': 'OTP expired.'}, status=400)

#             user.set_password(new_password)
#             user.otp = None
#             user.otp_created = None
#             user.otp_purpose = None
#             user.save()

#             return Response({'message': 'Password reset successful.'})

#         except CustomUser.DoesNotExist:
#             return Response({'error': 'User not found.'}, status=404)


# # ═══════════════════════════════════════════════════════════
# #  PROFILE & UTILITIES
# # ═══════════════════════════════════════════════════════════

# class ProfileView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         user = request.user
#         return Response({
#             'email': user.email,
#             'role': user.role,
#             'unique_id': user.unique_id
#         })


# class GetClassListView(APIView):
#     def get(self, request):
#         from academics.models import AcademicClass
#         return Response(list(AcademicClass.objects.values('id', 'name')))


# class GetSubjectListView(APIView):
#     def get(self, request):
#         from academics.models import Subject as AcademicSubject
#         seen = set()
#         result = []
#         for s in AcademicSubject.objects.all():
#             if s.name.lower() not in seen:
#                 seen.add(s.name.lower())
#                 result.append({'id': s.id, 'name': s.name})
#         return Response(result)


# # ═══════════════════════════════════════════════════════════
# #  GOOGLE AUTH
# # ═══════════════════════════════════════════════════════════

# class GoogleAuthView(APIView):
#     """Handle Google Sign-In for both login and registration"""

#     def post(self, request):
#         credential = request.data.get('credential')
#         role = request.data.get('role', 'student')

#         print(f"🔵 GoogleAuth: Received request for role: {role}")

#         if not credential:
#             print("❌ GoogleAuth: No credential provided")
#             return Response({'error': 'Google credential required.'}, status=400)

#         try:
#             google_client_id = settings.GOOGLE_CLIENT_ID

#             print(f"🔍 GoogleAuth: Using Client ID: {google_client_id[:30]}...")
#             print(f"🔍 GoogleAuth: Token length: {len(credential)}")

#             idinfo = id_token.verify_oauth2_token(
#                 credential,
#                 google_requests.Request(),
#                 google_client_id,
#                 clock_skew_in_seconds=120
#             )

#             email = idinfo.get('email')
#             first_name = idinfo.get('given_name', '')
#             last_name = idinfo.get('family_name', '')

#             print(f"✅ GoogleAuth: Token verified for {email}")

#             if not email:
#                 print("❌ GoogleAuth: No email in token")
#                 return Response({'error': 'Could not retrieve email from Google.'}, status=400)

#             # Check if user already exists
#             user = CustomUser.objects.filter(email=email).first()

#             if user:
#                 # Existing user — log them in
#                 print(f"👤 GoogleAuth: Existing user login: {email}")
#                 token, _ = Token.objects.get_or_create(user=user)
#                 return Response({
#                     'token': token.key,
#                     'user': {
#                         'email': user.email,
#                         'role': user.role,
#                         'first_name': user.first_name,
#                         'last_name': user.last_name,
#                         'unique_id': user.unique_id,
#                         'is_approved': user.is_approved,
#                     }
#                 })
#             else:
#                 # New user — create account
#                 print(f"🆕 GoogleAuth: Creating new user: {email}")

#                 if role not in ['student', 'teacher']:
#                     print(f"❌ GoogleAuth: Invalid role: {role}")
#                     return Response({'error': 'Invalid role.'}, status=400)

#                 user = CustomUser(
#                     username=email,
#                     email=email,
#                     first_name=first_name,
#                     last_name=last_name,
#                     role=role,
#                     is_approved=False,
#                 )
#                 user.set_unusable_password()
#                 user.save()

#                 token, _ = Token.objects.get_or_create(user=user)

#                 print(f"✅ GoogleAuth: New user created: {email}")

#                 return Response({
#                     'token': token.key,
#                     'is_new_user': True,
#                     'user': {
#                         'email': user.email,
#                         'role': user.role,
#                         'first_name': user.first_name,
#                         'last_name': user.last_name,
#                         'is_approved': user.is_approved,
#                     }
#                 }, status=201)

#         except ValueError as e:
#             print(f"❌ GoogleAuth: Token verification failed: {str(e)}")
#             return Response({'error': f'Invalid Google token: {str(e)}'}, status=400)
#         except Exception as e:
#             print(f"❌ GoogleAuth: Unexpected error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': 'Google authentication failed.'}, status=500)


# # ═══════════════════════════════════════════════════════════
# #  DEBUG (temporary — remove after confirming everything works)
# # ═══════════════════════════════════════════════════════════

# def debug_db(request):
#     with connection.cursor() as cursor:
#         cursor.execute("""
#             SELECT column_name, character_maximum_length 
#             FROM information_schema.columns 
#             WHERE table_name = 'users_customuser'
#             AND data_type = 'character varying'
#             ORDER BY column_name
#         """)
#         cols = cursor.fetchall()

#         cursor.execute("""
#             SELECT name FROM django_migrations 
#             WHERE app = 'users' 
#             ORDER BY applied
#         """)
#         migrations = cursor.fetchall()

#     return JsonResponse({
#         'all_varchar_columns': [{'column': c[0], 'max_length': c[1]} for c in cols],
#         'applied_migrations': [m[0] for m in migrations]
#     })





























# # # users/views.py
# # """
# # Complete Authentication & User Management Views
# # EduVibe Platform - 2026
# # """

# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from rest_framework.authtoken.models import Token
# # from rest_framework.permissions import IsAuthenticated
# # from django.contrib.auth import authenticate
# # from django.core.mail import send_mail
# # from django.conf import settings
# # from django.utils import timezone
# # from django.db.models import Q
# # import random

# # from .models import CustomUser
# # # from admin_tasks.models import Class, Subject
# # # from academics.models import AcademicClass as Class, Subject
# # # from academics.models import AcademicClass as Class, Subject as AcademicSubject
# # from academics.models import AcademicClass as Class, Subject as AcademicSubject, ClassSubject
# # # ═══════════════════════════════════════════════════════════
# # #  REGISTRATION & OTP VERIFICATION
# # # ═══════════════════════════════════════════════════════════

# # class RegisterView(APIView):
# #     """User Registration with OTP verification"""

# #     def post(self, request):
# #         try:
# #             role = request.data.get('role', '').lower()
# #             email = request.data.get('email', '').strip()
# #             phone = request.data.get('phone', '').strip()
# #             password = request.data.get('password')
# #             first_name = request.data.get('first_name', '').strip()
# #             last_name = request.data.get('last_name', '').strip()
# #             dob = request.data.get('dob')

# #             if role not in ['student', 'teacher']:
# #                 return Response({'error': 'Invalid role.'}, status=400)

# #             # if not phone.isdigit() or len(phone) != 10:
# #             #     return Response({'error': 'Phone must be 10 digits.'}, status=400)
            
# #             phone = phone.replace(' ', '').replace('-', '').replace('+91', '').replace('+', '')
# #             if not phone.isdigit() or len(phone) != 10:
# #                return Response({'error': 'Phone must be 10 digits.'}, status=400)

# #             if CustomUser.objects.filter(email=email).exists():
# #                 return Response({'error': 'Email already exists.'}, status=400)

# #             if CustomUser.objects.filter(phone=phone).exists():
# #                 return Response({'error': 'Phone already exists.'}, status=400)

# #             user = CustomUser(
# #                 username=email,
# #                 email=email,
# #                 phone=phone,
# #                 first_name=first_name,
# #                 last_name=last_name,
# #                 dob=dob,
# #                 role=role,
# #                 is_approved=False
# #             )
# #             user.set_password(password)

# #             if role == 'student':
# #                 class_id = request.data.get('class_id')
# #                 if not class_id:
# #                     return Response({'error': 'Class required.'}, status=400)
# #                 try:
# #                     user.class_assigned = Class.objects.get(id=class_id)
# #                 except Class.DoesNotExist:
# #                     return Response({'error': 'Invalid class.'}, status=400)

# #             elif role == 'teacher':
# #                 subject_ids = request.data.get('subject_ids', [])
# #                 if not subject_ids or len(subject_ids) > 3:
# #                     return Response({'error': 'Select 1–3 subjects.'}, status=400)
# #                 # subjects = Subject.objects.filter(id__in=subject_ids)
# #                 # if subjects.count() != len(subject_ids):
# #                 subjects = AcademicSubject.objects.filter(id__in=subject_ids)
# #                 if subjects.count() != len(subject_ids):
# #                     return Response({'error': 'Invalid subjects.'}, status=400)

# #             user.save()

# #             if role == 'teacher':
# #                 user.subjects.set(subject_ids)

# #             # OTP for registration
# #             otp = str(random.randint(100000, 999999))
# #             user.otp = otp
# #             user.otp_created = timezone.now()
# #             user.otp_purpose = 'registration'
# #             user.save()

# #             # send_mail(
# #             #     'EduVibe - Verify Email',
# #             #     f'Hello {first_name},\n\nOTP: {otp}\nValid for 5 minutes.',
# #             #     settings.EMAIL_HOST_USER,
# #             #     [email],
# #             #     fail_silently=False,
# #             # )

# #             # return Response({'message': 'Registration successful. Verify OTP.'}, status=201)
            
            
# #     send_mail(
# #         'EduVibe - Verify Email',
# #         f'Hello {first_name},\n\nOTP: {otp}\nValid for 5 minutes.',
# #         settings.EMAIL_HOST_USER,
# #         [email],
# #         fail_silently=False,
# #          )
# #     except Exception as email_error:
# #     print(f"Email send failed: {email_error}")
# #     user.delete()  # Clean up - don't leave broken incomplete user
# #     return Response(
# #         {'error': 'Could not send OTP email. Please check your email address and try again.'},
# #         status=500
# #     )

# #     return Response({'message': 'Registration successful. Verify OTP.'}, status=201)
# #         except Exception as e:
# #             return Response({'error': str(e)}, status=500)


# # class VerifyRegistrationOTPView(APIView):
# #     """Verify registration OTP"""

# #     def post(self, request):
# #         email = request.data.get('email')
# #         otp = str(request.data.get('otp')).strip()

# #         try:
# #             user = CustomUser.objects.get(email=email)

# #             if not user.otp:
# #                 return Response({'error': 'No OTP found.'}, status=400)

# #             if user.otp_purpose != 'registration':
# #                 return Response({'error': 'Invalid OTP purpose.'}, status=400)

# #             if str(user.otp) != otp:
# #                 return Response({'error': 'Invalid OTP.'}, status=400)

# #             if (timezone.now() - user.otp_created).total_seconds() > 300:
# #                 return Response({'error': 'OTP expired.'}, status=400)

# #             user.otp = None
# #             user.otp_created = None
# #             user.otp_purpose = None
# #             user.save()

# #             return Response({'message': 'Email verified. Await approval.'})

# #         except CustomUser.DoesNotExist:
# #             return Response({'error': 'User not found.'}, status=404)


# # class ResendOTPView(APIView):
# #     """Resend registration OTP"""

# #     def post(self, request):
# #         email = request.data.get('email')

# #         try:
# #             user = CustomUser.objects.get(email=email)

# #             if user.otp_created and (timezone.now() - user.otp_created).total_seconds() < 60:
# #                 return Response({'error': 'Please wait before requesting a new OTP.'}, status=429)

# #             otp = str(random.randint(100000, 999999))
# #             user.otp = otp
# #             user.otp_created = timezone.now()
# #             user.otp_purpose = 'registration'
# #             user.save()

# #             send_mail(
# #                 'EduVibe - OTP Resent',
# #                 f'OTP: {otp}',
# #                 settings.EMAIL_HOST_USER,
# #                 [email],
# #                 fail_silently=False,
# #             )

# #             return Response({'message': 'OTP resent.'})

# #         except CustomUser.DoesNotExist:
# #             return Response({'error': 'User not found.'}, status=404)


# # # ═══════════════════════════════════════════════════════════
# # #  LOGIN & LOGOUT
# # # ═══════════════════════════════════════════════════════════

# # class LoginView(APIView):
# #     """User login"""

# #     def post(self, request):
        
# #         # identifier = request.data.get('identifier')
# #         identifier = request.data.get('identifier') or request.data.get('username')
# #         password = request.data.get('password')

# #         user = CustomUser.objects.filter(
# #             Q(email=identifier) | Q(unique_id=identifier)
# #         ).first()

# #         if not user or not user.check_password(password):
# #             return Response({'error': 'Invalid credentials.'}, status=401)

# #         if user.otp:
# #             return Response({'error': 'Verify email first.'}, status=403)

# #         if not user.is_approved:
# #             return Response({'error': 'Pending admin approval.'}, status=403)

# #         Token.objects.filter(user=user).delete()
# #         token = Token.objects.create(user=user)

# #         return Response({
# #             'token': token.key,
# #             'role': user.role,
# #             'unique_id': user.unique_id
# #         })


# # class LogoutView(APIView):
# #     permission_classes = [IsAuthenticated]

# #     def post(self, request):
# #         request.user.auth_token.delete()
# #         return Response({'message': 'Logged out.'})


# # # ═══════════════════════════════════════════════════════════
# # #  PASSWORD RESET
# # # ═══════════════════════════════════════════════════════════

# # class ForgotPasswordView(APIView):
# #     """Send OTP for password reset"""

# #     def post(self, request):
# #         email = request.data.get('email')

# #         try:
# #             user = CustomUser.objects.get(email=email)

# #             if user.otp_purpose == 'registration' and user.otp:
# #                 return Response({'error': 'Please verify your email first.'}, status=403)

# #             otp = str(random.randint(100000, 999999))
# #             user.otp = otp
# #             user.otp_created = timezone.now()
# #             user.otp_purpose = 'password_reset'
# #             user.save()

# #             send_mail(
# #                 'EduVibe - Password Reset',
# #                 f'OTP: {otp}',
# #                 settings.EMAIL_HOST_USER,
# #                 [email],
# #                 fail_silently=False,
# #             )

# #             return Response({'message': 'OTP sent.'})

# #         except CustomUser.DoesNotExist:
# #             return Response({'error': 'User not found.'}, status=404)


# # class VerifyOTPAndResetPasswordView(APIView):
# #     """Verify OTP and reset password"""

# #     def post(self, request):
# #         email = request.data.get('email')
# #         otp = str(request.data.get('otp')).strip()
# #         new_password = request.data.get('new_password')

# #         if len(new_password) < 8:
# #             return Response({'error': 'Password must be at least 8 characters.'}, status=400)

# #         try:
# #             user = CustomUser.objects.get(email=email)

# #             if not user.otp:
# #                 return Response({'error': 'No OTP found.'}, status=400)

# #             if user.otp_purpose != 'password_reset':
# #                 return Response({'error': 'Invalid OTP purpose.'}, status=400)

# #             if str(user.otp) != otp:
# #                 return Response({'error': 'Invalid OTP.'}, status=400)

# #             if (timezone.now() - user.otp_created).total_seconds() > 300:
# #                 return Response({'error': 'OTP expired.'}, status=400)

# #             user.set_password(new_password)
# #             user.otp = None
# #             user.otp_created = None
# #             user.otp_purpose = None
# #             user.save()

# #             return Response({'message': 'Password reset successful.'})

# #         except CustomUser.DoesNotExist:
# #             return Response({'error': 'User not found.'}, status=404)


# # # ═══════════════════════════════════════════════════════════
# # #  PROFILE & UTILITIES
# # # ═══════════════════════════════════════════════════════════

# # class ProfileView(APIView):
# #     permission_classes = [IsAuthenticated]

# #     def get(self, request):
# #         user = request.user
# #         return Response({
# #             'email': user.email,
# #             'role': user.role,
# #             'unique_id': user.unique_id
# #         })


# # # class GetClassListView(APIView):
# # #     def get(self, request):
# # #         return Response(list(Class.objects.values('id', 'name')))
# # class GetClassListView(APIView):
# #     def get(self, request):
# #         from academics.models import AcademicClass
# #         return Response(list(AcademicClass.objects.values('id', 'name')))

# # # class GetSubjectListView(APIView):
# # #     def get(self, request):
# # #         return Response(list(Subject.objects.values('id', 'name')))
# # # class GetSubjectListView(APIView):
# # #     def get(self, request):
# # #         from academics.models import Subject as AcademicSubject
# # #         return Response(list(AcademicSubject.objects.values('id', 'name')))
# # class GetSubjectListView(APIView):
# #     def get(self, request):
# #         from academics.models import Subject as AcademicSubject
# #         seen = set()
# #         result = []
# #         for s in AcademicSubject.objects.all():
# #             if s.name.lower() not in seen:
# #                 seen.add(s.name.lower())
# #                 result.append({'id': s.id, 'name': s.name})
# #         return Response(result)

# # # Add to top imports
# # from google.oauth2 import id_token
# # from google.auth.transport import requests as google_requests
# # import os

# # class GoogleAuthView(APIView):
# #     """Handle Google Sign-In for both login and registration"""

# #     def post(self, request):
# #         credential = request.data.get('credential')
# #         role = request.data.get('role', 'student')

# #         print(f"🔵 GoogleAuth: Received request for role: {role}")

# #         if not credential:
# #             print("❌ GoogleAuth: No credential provided")
# #             return Response({'error': 'Google credential required.'}, status=400)

# #         try:
# #             # Get Client ID from Django settings (NOT os.environ)
# #             google_client_id = settings.GOOGLE_CLIENT_ID
            
# #             print(f"🔍 GoogleAuth: Using Client ID: {google_client_id[:30]}...")
# #             print(f"🔍 GoogleAuth: Token length: {len(credential)}")
            
# #             # Verify the Google token
# #             # idinfo = id_token.verify_oauth2_token(
# #             #     credential,
# #             #     google_requests.Request(),
# #             #     google_client_id
# #             # )
# #             idinfo = id_token.verify_oauth2_token(
# #                  credential,
# #                  google_requests.Request(),
# #                  google_client_id,
# #                  clock_skew_in_seconds=120  # ✅ ADD THIS LINE
# #               )

# #             email = idinfo.get('email')
# #             first_name = idinfo.get('given_name', '')
# #             last_name = idinfo.get('family_name', '')

# #             print(f"✅ GoogleAuth: Token verified for {email}")

# #             if not email:
# #                 print("❌ GoogleAuth: No email in token")
# #                 return Response({'error': 'Could not retrieve email from Google.'}, status=400)

# #             # Check if user already exists
# #             user = CustomUser.objects.filter(email=email).first()

# #             if user:
# #                 # Existing user — log them in
# #                 print(f"👤 GoogleAuth: Existing user login: {email}")
# #                 token, _ = Token.objects.get_or_create(user=user)
# #                 return Response({
# #                     'token': token.key,
# #                     'user': {
# #                         'email': user.email,
# #                         'role': user.role,
# #                         'first_name': user.first_name,
# #                         'last_name': user.last_name,
# #                         'unique_id': user.unique_id,
# #                         'is_approved': user.is_approved,
# #                     }
# #                 })
# #             else:
# #                 # New user — create account
# #                 print(f"🆕 GoogleAuth: Creating new user: {email}")
                
# #                 if role not in ['student', 'teacher']:
# #                     print(f"❌ GoogleAuth: Invalid role: {role}")
# #                     return Response({'error': 'Invalid role.'}, status=400)

# #                 user = CustomUser(
# #                     username=email,
# #                     email=email,
# #                     first_name=first_name,
# #                     last_name=last_name,
# #                     role=role,
# #                     is_approved=False,
# #                 )
# #                 user.set_unusable_password()
# #                 user.save()

# #                 token, _ = Token.objects.get_or_create(user=user)
                
# #                 print(f"✅ GoogleAuth: New user created: {email}")
                
# #                 return Response({
# #                     'token': token.key,
# #                     'is_new_user': True,
# #                     'user': {
# #                         'email': user.email,
# #                         'role': user.role,
# #                         'first_name': user.first_name,
# #                         'last_name': user.last_name,
# #                         'is_approved': user.is_approved,
# #                     }
# #                 }, status=201)

# #         except ValueError as e:
# #             print(f"❌ GoogleAuth: Token verification failed: {str(e)}")
# #             return Response({'error': f'Invalid Google token: {str(e)}'}, status=400)
# #         except Exception as e:
# #             print(f"❌ GoogleAuth: Unexpected error: {str(e)}")
# #             import traceback
# #             traceback.print_exc()
# #             return Response({'error': 'Google authentication failed.'}, status=500)



































# # from django.http import JsonResponse
# # from django.db import connection

# # def debug_db(request):
# #     with connection.cursor() as cursor:
# #         cursor.execute("""
# #             SELECT column_name, character_maximum_length 
# #             FROM information_schema.columns 
# #             WHERE table_name = 'users_customuser'
# #             AND data_type = 'character varying'
# #             ORDER BY column_name
# #         """)
# #         cols = cursor.fetchall()
        
# #         cursor.execute("""
# #             SELECT name FROM django_migrations 
# #             WHERE app = 'users' 
# #             ORDER BY applied
# #         """)
# #         migrations = cursor.fetchall()
        
# #     return JsonResponse({
# #         'all_varchar_columns': [{'column': c[0], 'max_length': c[1]} for c in cols],
# #         'applied_migrations': [m[0] for m in migrations]
# #     })