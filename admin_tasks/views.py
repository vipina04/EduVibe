# admin_tasks/views.py
"""
Complete Admin Management Views
EduVibe Platform - 2026
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum, Count, Q
from django.utils import timezone

from users.models import CustomUser
from .models import Class, Subject, Chapter, Notification, FeePayment
from teachers.models import TeacherAssignment


# ═══════════════════════════════════════════════════════════
#  CUSTOM PERMISSION
# ═══════════════════════════════════════════════════════════

class IsAdminRole(IsAuthenticated):
    """Only allow admins"""
    
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == 'admin'
        )


# ═══════════════════════════════════════════════════════════
#  USER APPROVAL & MANAGEMENT
# ═══════════════════════════════════════════════════════════

class PendingUsersView(APIView):
    """Get all pending users"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        pending_users = CustomUser.objects.filter(
            is_approved=False,
            otp__isnull=True  # Email verified
        ).select_related('class_assigned').prefetch_related('subjects')
        
        users_data = []
        for user in pending_users:
            user_info = {
                'id': user.id,
                'email': user.email,
                'phone': user.phone,
                'name': f'{user.first_name} {user.last_name}'.strip() or user.username,
                'role': user.role,
                'dob': user.dob,
                'created_at': user.date_joined,
            }
            
            if user.role == 'student' and user.class_assigned:
                user_info['class'] = {
                    'id': user.class_assigned.id,
                    'name': user.class_assigned.name
                }
            elif user.role == 'teacher':
                user_info['subjects'] = [
                    {'id': s.id, 'name': s.name}
                    for s in user.subjects.all()
                ]
            
            users_data.append(user_info)
        
        return Response({
            'count': len(users_data),
            'users': users_data
        })


class ApproveUserView(APIView):
    """Approve a user"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        
        try:
            user = CustomUser.objects.get(id=user_id)
            
            if user.is_approved:
                return Response({
                    'error': 'User already approved.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.is_approved = True
            user.save()
            
            # Send approval email
            send_mail(
                subject='EduVibe - Account Approved!',
                message=f'Hello {user.first_name},\n\nYour account has been approved!\n\nUnique ID: {user.unique_id}\nEmail: {user.email}\n\nYou can now login.\n\nEduVibe Team',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True,
            )
            
            return Response({
                'message': 'User approved successfully!',
                'user_id': user.id,
                'unique_id': user.unique_id
            })
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class RejectUserView(APIView):
    """Reject/Delete a user"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        
        try:
            user = CustomUser.objects.get(id=user_id)
            
            if user.is_approved:
                return Response({
                    'error': 'Cannot reject approved user.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            email = user.email
            name = user.first_name
            user.delete()
            
            # Send rejection email
            send_mail(
                subject='EduVibe - Registration Status',
                message=f'Hello {name},\n\nYour registration has been reviewed. Please contact admin for more information.\n\nEduVibe Team',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=True,
            )
            
            return Response({
                'message': 'User rejected and removed.'
            })
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class AllUsersView(APIView):
    """Get all approved users"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        role_filter = request.GET.get('role')  # student, teacher, or all
        
        query = CustomUser.objects.filter(is_approved=True)
        
        if role_filter and role_filter in ['student', 'teacher', 'admin']:
            query = query.filter(role=role_filter)
        
        query = query.select_related('class_assigned').prefetch_related('subjects')
        
        users_data = []
        for user in query:
            user_info = {
                'id': user.id,
                'unique_id': user.unique_id,
                'email': user.email,
                'phone': user.phone,
                'name': f'{user.first_name} {user.last_name}'.strip() or user.username,
                'role': user.role,
                'dob': user.dob,
            }
            
            if user.role == 'student' and user.class_assigned:
                user_info['class'] = {
                    'id': user.class_assigned.id,
                    'name': user.class_assigned.name
                }
            elif user.role == 'teacher':
                user_info['subjects'] = [
                    {'id': s.id, 'name': s.name}
                    for s in user.subjects.all()
                ]
            
            users_data.append(user_info)
        
        return Response({
            'count': len(users_data),
            'users': users_data
        })


# ═══════════════════════════════════════════════════════════
#  CLASS MANAGEMENT
# ═══════════════════════════════════════════════════════════

class ClassListView(APIView):
    """Get all classes"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        classes = Class.objects.all().values('id', 'name')
        return Response(list(classes))


class ClassCreateView(APIView):
    """Create a new class"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        name = request.data.get('name', '').strip()
        
        if not name:
            return Response({
                'error': 'Class name is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if Class.objects.filter(name__iexact=name).exists():
            return Response({
                'error': 'Class already exists.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        class_obj = Class.objects.create(name=name)
        
        return Response({
            'message': 'Class created successfully!',
            'class': {
                'id': class_obj.id,
                'name': class_obj.name
            }
        }, status=status.HTTP_201_CREATED)


class ClassDetailView(APIView):
    """Get class details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, class_id):
        try:
            class_obj = Class.objects.get(id=class_id)
            
            # Get students count
            student_count = CustomUser.objects.filter(
                role='student',
                class_assigned=class_obj,
                is_approved=True
            ).count()
            
            # Get subjects
            subjects = class_obj.subject_set.all()
            
            return Response({
                'id': class_obj.id,
                'name': class_obj.name,
                'student_count': student_count,
                'subjects': [
                    {'id': s.id, 'name': s.name}
                    for s in subjects
                ]
            })
        
        except Class.DoesNotExist:
            return Response({
                'error': 'Class not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class ClassDeleteView(APIView):
    """Delete a class"""
    permission_classes = [IsAdminRole]
    
    def delete(self, request, class_id):
        try:
            class_obj = Class.objects.get(id=class_id)
            
            # Check if students are assigned
            if CustomUser.objects.filter(class_assigned=class_obj).exists():
                return Response({
                    'error': 'Cannot delete class with assigned students.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            class_obj.delete()
            
            return Response({
                'message': 'Class deleted successfully!'
            })
        
        except Class.DoesNotExist:
            return Response({
                'error': 'Class not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  SUBJECT MANAGEMENT
# ═══════════════════════════════════════════════════════════

class SubjectListView(APIView):
    """Get all subjects"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        class_id = request.GET.get('class_id')
        
        if class_id:
            # Get subjects for specific class
            try:
                class_obj = Class.objects.get(id=class_id)
                subjects = class_obj.subject_set.all()
            except Class.DoesNotExist:
                return Response({
                    'error': 'Class not found.'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            subjects = Subject.objects.all()
        
        subjects_data = []
        for subject in subjects:
            subjects_data.append({
                'id': subject.id,
                'name': subject.name,
                'classes': [
                    {'id': c.id, 'name': c.name}
                    for c in subject.classes.all()
                ]
            })
        
        return Response(subjects_data)


class SubjectCreateView(APIView):
    """Create a new subject"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        name = request.data.get('name', '').strip()
        class_ids = request.data.get('class_ids', [])
        
        if not name:
            return Response({
                'error': 'Subject name is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not class_ids:
            return Response({
                'error': 'At least one class is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if Subject.objects.filter(name__iexact=name).exists():
            return Response({
                'error': 'Subject already exists.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate classes exist
        classes = Class.objects.filter(id__in=class_ids)
        if classes.count() != len(class_ids):
            return Response({
                'error': 'Invalid class IDs.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        subject = Subject.objects.create(name=name)
        subject.classes.set(class_ids)
        
        return Response({
            'message': 'Subject created successfully!',
            'subject': {
                'id': subject.id,
                'name': subject.name,
                'classes': [
                    {'id': c.id, 'name': c.name}
                    for c in subject.classes.all()
                ]
            }
        }, status=status.HTTP_201_CREATED)


class SubjectDetailView(APIView):
    """Get subject details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, subject_id):
        try:
            subject = Subject.objects.get(id=subject_id)
            
            # Get teachers
            teachers = CustomUser.objects.filter(
                role='teacher',
                subjects=subject,
                is_approved=True
            )
            
            return Response({
                'id': subject.id,
                'name': subject.name,
                'classes': [
                    {'id': c.id, 'name': c.name}
                    for c in subject.classes.all()
                ],
                'teachers': [
                    {
                        'id': t.id,
                        'name': f'{t.first_name} {t.last_name}'.strip(),
                        'unique_id': t.unique_id
                    }
                    for t in teachers
                ]
            })
        
        except Subject.DoesNotExist:
            return Response({
                'error': 'Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class SubjectUpdateView(APIView):
    """Update a subject"""
    permission_classes = [IsAdminRole]
    
    def put(self, request, subject_id):
        try:
            subject = Subject.objects.get(id=subject_id)
            
            name = request.data.get('name', '').strip()
            class_ids = request.data.get('class_ids', [])
            
            if not name:
                return Response({
                    'error': 'Subject name is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not class_ids:
                return Response({
                    'error': 'At least one class is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if name conflicts with another subject
            if Subject.objects.filter(name__iexact=name).exclude(id=subject_id).exists():
                return Response({
                    'error': 'Subject with this name already exists.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate classes exist
            classes = Class.objects.filter(id__in=class_ids)
            if classes.count() != len(class_ids):
                return Response({
                    'error': 'Invalid class IDs.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update subject
            subject.name = name
            subject.save()
            subject.classes.set(class_ids)
            
            return Response({
                'message': 'Subject updated successfully!',
                'subject': {
                    'id': subject.id,
                    'name': subject.name,
                    'classes': [
                        {'id': c.id, 'name': c.name}
                        for c in subject.classes.all()
                    ]
                }
            })
        
        except Subject.DoesNotExist:
            return Response({
                'error': 'Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class SubjectDeleteView(APIView):
    """Delete a subject"""
    permission_classes = [IsAdminRole]
    
    def delete(self, request, subject_id):
        try:
            subject = Subject.objects.get(id=subject_id)
            
            # Check if teachers are assigned
            if CustomUser.objects.filter(subjects=subject).exists():
                return Response({
                    'error': 'Cannot delete subject with assigned teachers.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if chapters exist
            if Chapter.objects.filter(subject=subject).exists():
                return Response({
                    'error': 'Cannot delete subject with existing chapters.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            subject_name = subject.name
            subject.delete()
            
            return Response({
                'message': f'Subject "{subject_name}" deleted successfully!'
            })
        
        except Subject.DoesNotExist:
            return Response({
                'error': 'Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  CHAPTER MANAGEMENT
# ═══════════════════════════════════════════════════════════

class ChapterListView(APIView):
    """Get chapters for subject and class"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        subject_id = request.GET.get('subject_id')
        class_id = request.GET.get('class_id')
        
        if not subject_id or not class_id:
            return Response({
                'error': 'Subject ID and Class ID required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        chapters = Chapter.objects.filter(
            subject_id=subject_id,
            class_assigned_id=class_id
        )
        
        chapters_data = [
            {
                'id': c.id,
                'name': c.name,
                'is_completed': c.is_completed,
                'subject': c.subject.name,
                'class': c.class_assigned.name
            }
            for c in chapters
        ]
        
        return Response(chapters_data)


class ChapterCreateView(APIView):
    """Create a new chapter"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        name = request.data.get('name', '').strip()
        subject_id = request.data.get('subject_id')
        class_id = request.data.get('class_id')
        
        if not name or not subject_id or not class_id:
            return Response({
                'error': 'Name, subject, and class are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            class_obj = Class.objects.get(id=class_id)
            
            # Check if subject is taught in class
            if class_obj not in subject.classes.all():
                return Response({
                    'error': 'This subject is not taught in this class.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check duplicate
            if Chapter.objects.filter(
                name__iexact=name,
                subject=subject,
                class_assigned=class_obj
            ).exists():
                return Response({
                    'error': 'Chapter already exists for this subject and class.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            chapter = Chapter.objects.create(
                name=name,
                subject=subject,
                class_assigned=class_obj
            )
            
            return Response({
                'message': 'Chapter created successfully!',
                'chapter': {
                    'id': chapter.id,
                    'name': chapter.name,
                    'subject': subject.name,
                    'class': class_obj.name
                }
            }, status=status.HTTP_201_CREATED)
        
        except Subject.DoesNotExist:
            return Response({
                'error': 'Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Class.DoesNotExist:
            return Response({
                'error': 'Class not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  TEACHER ASSIGNMENT
# ═══════════════════════════════════════════════════════════

class TeacherAssignmentListView(APIView):
    """Get all teacher assignments"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        assignments = TeacherAssignment.objects.select_related(
            'teacher', 'class_assigned', 'subject'
        ).all()
        
        assignments_data = [
            {
                'id': a.id,
                'teacher': {
                    'id': a.teacher.id,
                    'name': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
                    'unique_id': a.teacher.unique_id
                },
                'class': {
                    'id': a.class_assigned.id,
                    'name': a.class_assigned.name
                },
                'subject': {
                    'id': a.subject.id,
                    'name': a.subject.name
                }
            }
            for a in assignments
        ]
        
        return Response(assignments_data)


class TeacherAssignmentCreateView(APIView):
    """Assign teacher to class-subject"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        teacher_id = request.data.get('teacher_id')
        class_id = request.data.get('class_id')
        subject_id = request.data.get('subject_id')
        
        try:
            teacher = CustomUser.objects.get(
                id=teacher_id,
                role='teacher',
                is_approved=True
            )
            class_obj = Class.objects.get(id=class_id)
            subject = Subject.objects.get(id=subject_id)
            
            # Check subject in class
            if class_obj not in subject.classes.all():
                return Response({
                    'error': 'Subject not taught in this class.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check teacher has this subject
            if subject not in teacher.subjects.all():
                return Response({
                    'error': 'Teacher not registered for this subject.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check duplicate
            if TeacherAssignment.objects.filter(
                teacher=teacher,
                class_assigned=class_obj,
                subject=subject
            ).exists():
                return Response({
                    'error': 'Teacher already assigned to this class-subject.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            assignment = TeacherAssignment.objects.create(
                teacher=teacher,
                class_assigned=class_obj,
                subject=subject
            )
            
            return Response({
                'message': 'Teacher assigned successfully!',
                'assignment': {
                    'id': assignment.id,
                    'teacher': teacher.unique_id,
                    'class': class_obj.name,
                    'subject': subject.name
                }
            }, status=status.HTTP_201_CREATED)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Teacher not found or not approved.'
            }, status=status.HTTP_404_NOT_FOUND)
        except (Class.DoesNotExist, Subject.DoesNotExist):
            return Response({
                'error': 'Class or Subject not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  NOTIFICATION MANAGEMENT
# ═══════════════════════════════════════════════════════════

class NotificationCreateView(APIView):
    """Send notification"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        message = request.data.get('message', '').strip()
        recipient_type = request.data.get('recipient_type')  # all_students, all_teachers, specific_user
        recipient_id = request.data.get('recipient_id')  # For specific user
        
        if not message:
            return Response({
                'error': 'Message is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if recipient_type == 'specific_user':
            try:
                recipient = CustomUser.objects.get(id=recipient_id, is_approved=True)
                notification = Notification.objects.create(
                    user=recipient,
                    message=message
                )
                
                # Send email
                send_mail(
                    subject='EduVibe - New Notification',
                    message=f'Hello {recipient.first_name},\n\n{message}\n\nEduVibe Team',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[recipient.email],
                    fail_silently=True,
                )
                
                return Response({
                    'message': 'Notification sent!',
                    'count': 1
                })
            except CustomUser.DoesNotExist:
                return Response({
                    'error': 'User not found.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        elif recipient_type in ['all_students', 'all_teachers']:
            role = 'student' if recipient_type == 'all_students' else 'teacher'
            recipients = CustomUser.objects.filter(role=role, is_approved=True)
            
            count = 0
            for recipient in recipients:
                Notification.objects.create(
                    user=recipient,
                    message=message
                )
                
                # Send email
                try:
                    send_mail(
                        subject='EduVibe - New Notification',
                        message=f'Hello {recipient.first_name},\n\n{message}\n\nEduVibe Team',
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[recipient.email],
                        fail_silently=True,
                    )
                    count += 1
                except:
                    pass
            
            return Response({
                'message': f'Notification sent to all {role}s!',
                'count': count
            })
        
        else:
            return Response({
                'error': 'Invalid recipient type.'
            }, status=status.HTTP_400_BAD_REQUEST)


class NotificationListView(APIView):
    """Get user's notifications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        notifications_data = [
            {
                'id': n.id,
                'message': n.message,
                'created_at': n.created_at
            }
            for n in notifications
        ]
        
        return Response(notifications_data)


# ═══════════════════════════════════════════════════════════
#  FEE PAYMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════

class FeePaymentCreateView(APIView):
    """Record fee payment"""
    permission_classes = [IsAdminRole]
    
    def post(self, request):
        student_id = request.data.get('student_id')
        amount = request.data.get('amount')
        receipt = request.FILES.get('receipt')
        
        if not amount or float(amount) <= 0:
            return Response({
                'error': 'Valid amount is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            student = CustomUser.objects.get(
                id=student_id,
                role='student',
                is_approved=True
            )
            
            fee_payment = FeePayment.objects.create(
                student=student,
                amount=amount,
                receipt=receipt
            )
            
            # Send email
            send_mail(
                subject='EduVibe - Fee Payment Received',
                message=f'Hello {student.first_name},\n\nYour fee payment of ₹{amount} has been received.\n\nThank you!\nEduVibe Team',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[student.email],
                fail_silently=True,
            )
            
            return Response({
                'message': 'Fee payment recorded!',
                'payment': {
                    'id': fee_payment.id,
                    'student': student.unique_id,
                    'amount': str(fee_payment.amount),
                    'paid_at': fee_payment.paid_at
                }
            }, status=status.HTTP_201_CREATED)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'Student not found.'
            }, status=status.HTTP_404_NOT_FOUND)


class FeePaymentListView(APIView):
    """Get all fee payments"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        payments = FeePayment.objects.select_related('student').order_by('-paid_at')
        
        payments_data = [
            {
                'id': p.id,
                'student': {
                    'id': p.student.id,
                    'name': f'{p.student.first_name} {p.student.last_name}'.strip(),
                    'unique_id': p.student.unique_id,
                    'class': p.student.class_assigned.name if p.student.class_assigned else None
                },
                'amount': str(p.amount),
                'paid_at': p.paid_at,
                'has_receipt': bool(p.receipt)
            }
            for p in payments
        ]
        
        return Response(payments_data)


class FeePaymentDetailView(APIView):
    """Get fee payment detail with receipt"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, payment_id):
        try:
            payment = FeePayment.objects.select_related('student').get(id=payment_id)
            
            # Check permission (admin or own student)
            if request.user.role != 'admin' and request.user.id != payment.student.id:
                return Response({
                    'error': 'Permission denied.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            receipt_url = None
            if payment.receipt:
                receipt_url = request.build_absolute_uri(payment.receipt.url)
            
            return Response({
                'id': payment.id,
                'student': {
                    'id': payment.student.id,
                    'name': f'{payment.student.first_name} {payment.student.last_name}'.strip(),
                    'unique_id': payment.student.unique_id
                },
                'amount': str(payment.amount),
                'paid_at': payment.paid_at,
                'receipt_url': receipt_url
            })
        
        except FeePayment.DoesNotExist:
            return Response({
                'error': 'Payment not found.'
            }, status=status.HTTP_404_NOT_FOUND)


# ═══════════════════════════════════════════════════════════
#  DASHBOARD STATS
# ═══════════════════════════════════════════════════════════

class AdminDashboardStatsView(APIView):
    """Get admin dashboard statistics"""
    permission_classes = [IsAdminRole]
    
    def get(self, request):
        stats = {
            'users': {
                'total': CustomUser.objects.count(),
                'students': CustomUser.objects.filter(role='student', is_approved=True).count(),
                'teachers': CustomUser.objects.filter(role='teacher', is_approved=True).count(),
                'pending': CustomUser.objects.filter(is_approved=False, otp__isnull=True).count()
            },
            'academic': {
                'classes': Class.objects.count(),
                'subjects': Subject.objects.count(),
                'chapters': Chapter.objects.count()
            },
            'financial': {
                'total_fees': str(
                    FeePayment.objects.aggregate(
                        total=Sum('amount')
                    )['total'] or 0
                ),
                'payments_count': FeePayment.objects.count()
            }
        }
        
        return Response(stats)














