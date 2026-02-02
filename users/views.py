from rest_framework.views import APIView # from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import CustomUser
from django.core.mail import send_mail
from django.conf import settings
import random
from django.utils import timezone

class LoginView(APIView):
    def post(self, request):
        identifier = request.data.get('identifier')  # email or unique_id
        password = request.data.get('password')
        user = CustomUser.objects.filter(email=identifier).first() or CustomUser.objects.filter(unique_id=identifier).first()
        if user and user.check_password(password) and user.is_approved:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'role': user.role})
        return Response({'error': 'Invalid credentials or not approved'}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        user = CustomUser.objects.filter(email=email).first()
        if user:
            otp = random.randint(100000, 999999)
            user.otp = otp  # Add otp field to model later
            user.otp_created = timezone.now()
            user.save()
            send_mail('OTP for Password Reset', f'Your OTP is {otp}', settings.EMAIL_HOST_USER, [email])
            return Response({'message': 'OTP sent'})
        return Response({'error': 'Email not found'}, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        password = request.data.get('password')
        user = CustomUser.objects.filter(email=email).first()
        if user and user.otp == int(otp) and (timezone.now() - user.otp_created).seconds < 300:  # 5 min
            user.set_password(password)
            user.otp = None
            user.save()
            return Response({'message': 'Password reset'})
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    def post(self, request):
        role = request.data.get('role')
        name = request.data.get('name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        dob = request.data.get('dob')
        password = request.data.get('password')
        # Validate phone: only numbers, 10 digits
        if not phone.isdigit() or len(phone) != 10:
            return Response({'error': 'Invalid phone'}, status=status.HTTP_400_BAD_REQUEST)
        if CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Email exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = CustomUser(username=email, email=email, phone=phone, dob=dob, role=role)
        user.set_password(password)
        if role == 'student':
            class_id = request.data.get('class_id')
            user.class_assigned = Class.objects.get(id=class_id)
        elif role == 'teacher':
            subject_ids = request.data.get('subject_ids', []).split(',')
            if len(subject_ids) < 1 or len(subject_ids) > 3:
                return Response({'error': 'Select 1-3 subjects'}, status=status.HTTP_400_BAD_REQUEST)
            user.save()
            user.subjects.set(Subject.objects.filter(id__in=subject_ids))
        user.save()
        # Send OTP for email verification
        otp = random.randint(100000, 999999)
        user.otp = otp
        user.save()
        send_mail('Verify Email', f'Your OTP is {otp}', settings.EMAIL_HOST_USER, [email])
        return Response({'message': 'Registered, verify OTP'})

class VerifyRegistrationOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        user = CustomUser.objects.filter(email=email).first()
        if user and user.otp == int(otp):
            user.otp = None
            user.save()
            return Response({'message': 'Verified, await admin approval'})
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)