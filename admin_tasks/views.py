# admin_tasks/views.py - COMPLETE ADMIN CONTROL CENTER
"""
Complete Admin Management Views - ALL POWERS IN ONE PLACE
Admin can manage: Users, Classes, Subjects, Chapters, Teachers, Notifications, Fees
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
from academics.models import AcademicClass  # ✅ Import from academics too


# ═══════════════════════════════════════════════════════════════════
#  HELPER: Check if user is admin
# ═══════════════════════════════════════════════════════════════════

def is_admin(user):
    """Check if user has admin role"""
    return user.is_authenticated and user.role == 'admin'


# ═══════════════════════════════════════════════════════════════════
#  SECTION 1: USER MANAGEMENT (Approvals, View All Users)
# ═══════════════════════════════════════════════════════════════════

class PendingUsersView(APIView):
    """GET: List all users pending approval"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        pending_users = CustomUser.objects.filter(
            is_approved=False
        ).values(
            'id', 'username', 'email', 'first_name', 
            'last_name', 'role', 'phone', 'dob', 'date_joined'
        )
        
        return Response(list(pending_users), status=200)


class ApproveUserView(APIView):
    """POST: Approve a pending user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        user_id = request.data.get('user_id')
        
        try:
            user = CustomUser.objects.get(id=user_id, is_approved=False)
            user.is_approved = True
            
            # Generate unique ID
            user.unique_id = f"{user.role.upper()}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            user.save()
            
            # Send approval email
            try:
                send_mail(
                    subject='Account Approved - EduVibe',
                    message=f'Your account has been approved!\n\nYour Unique ID: {user.unique_id}\nEmail: {user.email}\n\nYou can now login.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Email send failed: {e}")
            
            return Response({
                'message': 'User approved successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'unique_id': user.unique_id,
                    'role': user.role
                }
            }, status=200)
            
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class RejectUserView(APIView):
    """POST: Reject a pending user"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        user_id = request.data.get('user_id')
        
        try:
            user = CustomUser.objects.get(id=user_id, is_approved=False)
            user.delete()
            
            return Response({'message': 'User rejected and deleted'}, status=200)
            
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class AllUsersView(APIView):
    """GET: List all approved users (students and teachers)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        role_filter = request.GET.get('role')  # ?role=student or ?role=teacher
        
        query = CustomUser.objects.filter(is_approved=True)
        
        if role_filter:
            query = query.filter(role=role_filter)
        
        users = query.values(
            'id', 'unique_id', 'username', 'email', 
            'first_name', 'last_name', 'role', 'phone', 
            'dob', 'date_joined', 'class_assigned__name'
        )
        
        return Response(list(users), status=200)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 2: CLASS MANAGEMENT (CRUD for Classes)
# ═══════════════════════════════════════════════════════════════════

class ClassListView(APIView):
    """
    GET: List all classes
    POST: Create new class
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        classes = Class.objects.all()
        classes_data = [{
            'id': cls.id,
            'name': cls.name,
            'student_count': CustomUser.objects.filter(
                class_assigned=cls, role='student', is_approved=True
            ).count(),
            'subject_count': cls.subjects.count()
        } for cls in classes]
        
        return Response(classes_data, status=200)
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        name = request.data.get('name')
        
        if not name:
            return Response({'error': 'Class name is required'}, status=400)
        
        if Class.objects.filter(name=name).exists():
            return Response({'error': 'Class already exists'}, status=400)
        
        new_class = Class.objects.create(name=name)
        
        return Response({
            'message': 'Class created successfully',
            'class': {
                'id': new_class.id,
                'name': new_class.name
            }
        }, status=201)


class ClassDetailView(APIView):
    """
    GET: Get class details
    PUT: Update class
    DELETE: Delete class
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            cls = Class.objects.get(id=class_id)
            
            return Response({
                'id': cls.id,
                'name': cls.name,
                'subjects': [{
                    'id': s.id,
                    'name': s.name
                } for s in cls.subjects.all()],
                'students': CustomUser.objects.filter(
                    class_assigned=cls, role='student', is_approved=True
                ).count()
            }, status=200)
            
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)
    
    def put(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            cls = Class.objects.get(id=class_id)
            name = request.data.get('name')
            
            if name:
                cls.name = name
                cls.save()
            
            return Response({'message': 'Class updated successfully'}, status=200)
            
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)
    
    def delete(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            cls = Class.objects.get(id=class_id)
            cls.delete()
            
            return Response({'message': 'Class deleted successfully'}, status=200)
            
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)


class ClassCreateView(APIView):
    """POST: Create a new class (alternative endpoint)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return ClassListView().post(request)


class ClassDeleteView(APIView):
    """DELETE: Delete a class"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, class_id):
        return ClassDetailView().delete(request, class_id)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 3: SUBJECT MANAGEMENT (CRUD for Subjects)
# ═══════════════════════════════════════════════════════════════════

class SubjectListView(APIView):
    """
    GET: List all subjects (optionally filter by class)
    POST: Create new subject
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        class_id = request.GET.get('class_id')
        
        if class_id:
            subjects = Subject.objects.filter(classes__id=class_id)
        else:
            subjects = Subject.objects.all()
        
        subjects_data = [{
            'id': s.id,
            'name': s.name,
            'classes': [{
                'id': c.id,
                'name': c.name
            } for c in s.classes.all()],
            'chapter_count': s.chapter_set.count()
        } for s in subjects]
        
        return Response(subjects_data, status=200)
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        name = request.data.get('name')
        class_ids = request.data.get('class_ids', [])  # List of class IDs
        
        if not name:
            return Response({'error': 'Subject name is required'}, status=400)
        
        if not class_ids:
            return Response({'error': 'At least one class must be selected'}, status=400)
        
        # Create subject
        new_subject = Subject.objects.create(name=name)
        
        # Add classes
        classes = Class.objects.filter(id__in=class_ids)
        new_subject.classes.set(classes)
        
        return Response({
            'message': 'Subject created successfully',
            'subject': {
                'id': new_subject.id,
                'name': new_subject.name,
                'classes': [{
                    'id': c.id,
                    'name': c.name
                } for c in classes]
            }
        }, status=201)


class SubjectCreateView(APIView):
    """POST: Create a new subject"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return SubjectListView().post(request)


class SubjectDetailView(APIView):
    """
    GET: Get subject details
    PUT: Update subject
    DELETE: Delete subject
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            
            return Response({
                'id': subject.id,
                'name': subject.name,
                'classes': [{
                    'id': c.id,
                    'name': c.name
                } for c in subject.classes.all()],
                'chapters': [{
                    'id': ch.id,
                    'name': ch.name,
                    'class': ch.class_assigned.name
                } for ch in subject.chapter_set.all()]
            }, status=200)
            
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)
    
    def put(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            
            name = request.data.get('name')
            class_ids = request.data.get('class_ids')
            
            if name:
                subject.name = name
                subject.save()
            
            if class_ids is not None:
                classes = Class.objects.filter(id__in=class_ids)
                subject.classes.set(classes)
            
            return Response({'message': 'Subject updated successfully'}, status=200)
            
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)
    
    def delete(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            subject.delete()
            
            return Response({'message': 'Subject deleted successfully'}, status=200)
            
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)


class SubjectDeleteView(APIView):
    """DELETE: Delete a subject"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, subject_id):
        return SubjectDetailView().delete(request, subject_id)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 4: CHAPTER MANAGEMENT (CRUD for Chapters)
# ═══════════════════════════════════════════════════════════════════

class ChapterListView(APIView):
    """
    GET: List all chapters (filter by class and/or subject)
    POST: Create new chapter
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        class_id = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')
        
        chapters = Chapter.objects.all()
        
        if class_id:
            chapters = chapters.filter(class_assigned__id=class_id)
        
        if subject_id:
            chapters = chapters.filter(subject__id=subject_id)
        
        chapters_data = [{
            'id': ch.id,
            'name': ch.name,
            'subject': {
                'id': ch.subject.id,
                'name': ch.subject.name
            },
            'class': {
                'id': ch.class_assigned.id,
                'name': ch.class_assigned.name
            },
            'is_completed': ch.is_completed
        } for ch in chapters]
        
        return Response(chapters_data, status=200)
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        name = request.data.get('name')
        subject_id = request.data.get('subject_id')
        class_id = request.data.get('class_id')
        
        if not name:
            return Response({'error': 'Chapter name is required'}, status=400)
        
        if not subject_id:
            return Response({'error': 'Subject is required'}, status=400)
        
        if not class_id:
            return Response({'error': 'Class is required'}, status=400)
        
        try:
            subject = Subject.objects.get(id=subject_id)
            cls = Class.objects.get(id=class_id)
            
            # Check if chapter already exists for this subject in this class
            if Chapter.objects.filter(
                name=name, subject=subject, class_assigned=cls
            ).exists():
                return Response({
                    'error': f'Chapter "{name}" already exists for {subject.name} in {cls.name}'
                }, status=400)
            
            # Create chapter
            new_chapter = Chapter.objects.create(
                name=name,
                subject=subject,
                class_assigned=cls
            )
            
            return Response({
                'message': 'Chapter created successfully',
                'chapter': {
                    'id': new_chapter.id,
                    'name': new_chapter.name,
                    'subject': subject.name,
                    'class': cls.name
                }
            }, status=201)
            
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)


class ChapterCreateView(APIView):
    """POST: Create a new chapter"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        return ChapterListView().post(request)


class ChapterDetailView(APIView):
    """
    GET: Get chapter details
    PUT: Update chapter
    DELETE: Delete chapter
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, chapter_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            
            return Response({
                'id': chapter.id,
                'name': chapter.name,
                'subject': {
                    'id': chapter.subject.id,
                    'name': chapter.subject.name
                },
                'class': {
                    'id': chapter.class_assigned.id,
                    'name': chapter.class_assigned.name
                },
                'is_completed': chapter.is_completed
            }, status=200)
            
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=404)
    
    def put(self, request, chapter_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            
            name = request.data.get('name')
            is_completed = request.data.get('is_completed')
            
            if name:
                chapter.name = name
            
            if is_completed is not None:
                chapter.is_completed = is_completed
            
            chapter.save()
            
            return Response({'message': 'Chapter updated successfully'}, status=200)
            
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=404)
    
    def delete(self, request, chapter_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            chapter = Chapter.objects.get(id=chapter_id)
            chapter.delete()
            
            return Response({'message': 'Chapter deleted successfully'}, status=200)
            
        except Chapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=404)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 5: TEACHER ASSIGNMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════════════

class TeacherAssignmentListView(APIView):
    """GET: List all teacher assignments"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        assignments = TeacherAssignment.objects.select_related(
            'teacher', 'class_assigned', 'subject'
        ).all()
        
        assignments_data = [{
            'id': a.id,
            'teacher': {
                'id': a.teacher.id,
                'name': a.teacher.get_full_name() or a.teacher.username
            },
            'class': {
                'id': a.class_assigned.id,
                'name': a.class_assigned.name
            },
            'subject': {
                'id': a.subject.id,
                'name': a.subject.name
            }
        } for a in assignments]
        
        return Response(assignments_data, status=200)


class TeacherAssignmentCreateView(APIView):
    """POST: Assign teacher to class-subject"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        teacher_id = request.data.get('teacher_id')
        class_id = request.data.get('class_id')
        subject_id = request.data.get('subject_id')
        
        if not all([teacher_id, class_id, subject_id]):
            return Response({'error': 'Teacher, class, and subject are required'}, status=400)
        
        try:
            teacher = CustomUser.objects.get(id=teacher_id, role='teacher', is_approved=True)
            cls = Class.objects.get(id=class_id)
            subject = Subject.objects.get(id=subject_id)
            
            # Check if assignment already exists
            if TeacherAssignment.objects.filter(
                teacher=teacher, class_assigned=cls, subject=subject
            ).exists():
                return Response({'error': 'This assignment already exists'}, status=400)
            
            assignment = TeacherAssignment.objects.create(
                teacher=teacher,
                class_assigned=cls,
                subject=subject
            )
            
            return Response({
                'message': 'Teacher assigned successfully',
                'assignment': {
                    'id': assignment.id,
                    'teacher': teacher.get_full_name() or teacher.username,
                    'class': cls.name,
                    'subject': subject.name
                }
            }, status=201)
            
        except CustomUser.DoesNotExist:
            return Response({'error': 'Teacher not found'}, status=404)
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)
        except Subject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 6: NOTIFICATION MANAGEMENT
# ═══════════════════════════════════════════════════════════════════

class NotificationCreateView(APIView):
    """POST: Send notification to user(s)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        message = request.data.get('message')
        user_id = request.data.get('user_id')  # Specific user
        role = request.data.get('role')  # All students or all teachers
        
        if not message:
            return Response({'error': 'Message is required'}, status=400)
        
        if user_id:
            # Send to specific user
            try:
                user = CustomUser.objects.get(id=user_id)
                Notification.objects.create(user=user, message=message)
                return Response({'message': 'Notification sent successfully'}, status=201)
            except CustomUser.DoesNotExist:
                return Response({'error': 'User not found'}, status=404)
        
        elif role:
            # Send to all users of a role
            users = CustomUser.objects.filter(role=role, is_approved=True)
            for user in users:
                Notification.objects.create(user=user, message=message)
            
            return Response({
                'message': f'Notification sent to {users.count()} {role}s'
            }, status=201)
        
        else:
            # Send to all users
            users = CustomUser.objects.filter(is_approved=True)
            for user in users:
                Notification.objects.create(user=user, message=message)
            
            return Response({
                'message': f'Notification sent to {users.count()} users'
            }, status=201)


class NotificationListView(APIView):
    """GET: List all notifications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        notifications = Notification.objects.select_related('user').order_by('-created_at')[:100]
        
        notifications_data = [{
            'id': n.id,
            'message': n.message,
            'user': {
                'id': n.user.id if n.user else None,
                'name': n.user.get_full_name() if n.user else 'All Users'
            },
            'created_at': n.created_at.isoformat()
        } for n in notifications]
        
        return Response(notifications_data, status=200)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 7: FEE PAYMENT MANAGEMENT
# ═══════════════════════════════════════════════════════════════════

class FeePaymentCreateView(APIView):
    """POST: Record fee payment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        student_id = request.data.get('student_id')
        amount = request.data.get('amount')
        
        if not student_id or not amount:
            return Response({'error': 'Student ID and amount are required'}, status=400)
        
        try:
            student = CustomUser.objects.get(id=student_id, role='student', is_approved=True)
            
            payment = FeePayment.objects.create(
                student=student,
                amount=amount
            )
            
            return Response({
                'message': 'Fee payment recorded successfully',
                'payment': {
                    'id': payment.id,
                    'student': student.get_full_name() or student.username,
                    'amount': str(payment.amount),
                    'paid_at': payment.paid_at.isoformat()
                }
            }, status=201)
            
        except CustomUser.DoesNotExist:
            return Response({'error': 'Student not found'}, status=404)


class FeePaymentListView(APIView):
    """GET: List all fee payments"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        payments = FeePayment.objects.select_related('student').order_by('-paid_at')
        
        payments_data = [{
            'id': p.id,
            'student': {
                'id': p.student.id,
                'name': p.student.get_full_name() or p.student.username,
                'unique_id': p.student.unique_id
            },
            'amount': str(p.amount),
            'paid_at': p.paid_at.isoformat()
        } for p in payments]
        
        return Response(payments_data, status=200)


class FeePaymentDetailView(APIView):
    """GET: Get fee payment details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, payment_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            payment = FeePayment.objects.select_related('student').get(id=payment_id)
            
            return Response({
                'id': payment.id,
                'student': {
                    'id': payment.student.id,
                    'name': payment.student.get_full_name() or payment.student.username,
                    'unique_id': payment.student.unique_id,
                    'email': payment.student.email
                },
                'amount': str(payment.amount),
                'paid_at': payment.paid_at.isoformat(),
                'receipt': payment.receipt.url if payment.receipt else None
            }, status=200)
            
        except FeePayment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=404)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 8: DASHBOARD & STATISTICS
# ═══════════════════════════════════════════════════════════════════

class AdminDashboardStatsView(APIView):
    """GET: Get dashboard statistics for admin"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        stats = {
            'users': {
                'total': CustomUser.objects.filter(is_approved=True).count(),
                'students': CustomUser.objects.filter(role='student', is_approved=True).count(),
                'teachers': CustomUser.objects.filter(role='teacher', is_approved=True).count(),
                'pending': CustomUser.objects.filter(is_approved=False).count()
            },
            'academics': {
                'classes': Class.objects.count(),
                'subjects': Subject.objects.count(),
                'chapters': Chapter.objects.count()
            },
            'fees': {
                'total_collected': FeePayment.objects.aggregate(
                    total=Sum('amount')
                )['total'] or 0,
                'payments_count': FeePayment.objects.count()
            }
        }
        
        return Response(stats, status=200)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 9: HELPER ENDPOINTS
# ═══════════════════════════════════════════════════════════════════

class GetTeachersView(APIView):
    """GET: Get list of all approved teachers"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        teachers = CustomUser.objects.filter(
            role='teacher', is_approved=True
        ).values('id', 'username', 'first_name', 'last_name', 'email', 'unique_id')
        
        return Response(list(teachers), status=200)


# ═══════════════════════════════════════════════════════════════════
#  SECTION 10: MANAGE ACADEMIC CLASSES (from academics app)
# ═══════════════════════════════════════════════════════════════════

class ManageAcademicClassesView(APIView):
    """
    GET: List all academic classes
    POST: Create a new academic class
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        classes = AcademicClass.objects.all()
        classes_data = [{
            'id': cls.id,
            'name': cls.name,
            'description': cls.description or '',
            'subjects_count': cls.subjects.count(),
            'created_at': cls.created_at.isoformat(),
        } for cls in classes]
        
        return Response(classes_data, status=200)
    
    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        name = request.data.get('name')
        description = request.data.get('description', '')
        
        if not name:
            return Response({'error': 'Class name is required'}, status=400)
        
        if AcademicClass.objects.filter(name=name).exists():
            return Response({'error': 'Class with this name already exists'}, status=400)
        
        new_class = AcademicClass.objects.create(
            name=name,
            description=description
        )
        
        return Response({
            'message': 'Academic class created successfully',
            'class': {
                'id': new_class.id,
                'name': new_class.name,
                'description': new_class.description,
            }
        }, status=201)


class AcademicClassDetailView(APIView):
    """GET, PUT, DELETE academic class details"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        try:
            cls = AcademicClass.objects.get(id=class_id)
            
            return Response({
                'id': cls.id,
                'name': cls.name,
                'description': cls.description,
                'subjects': [{
                    'id': s.id,
                    'name': s.name
                } for s in cls.subjects.all()],
                'created_at': cls.created_at.isoformat()
            }, status=200)
            
        except AcademicClass.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)


# ═══════════════════════════════════════════════════════════════════
#  HELPER: Get Subjects By Class (for cascading dropdowns)
# ═══════════════════════════════════════════════════════════════════

class GetSubjectsByClassView(APIView):
    """GET: Get subjects for a specific class (for cascading dropdowns)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        
        class_id = request.GET.get('class_id')
        
        if not class_id:
            return Response({'error': 'class_id parameter is required'}, status=400)
        
        subjects = Subject.objects.filter(classes__id=class_id).distinct()
        
        subjects_data = [{
            'id': s.id,
            'name': s.name
        } for s in subjects]
        
        return Response({
            'class_id': class_id,
            'subjects': subjects_data
        }, status=200)


# ═══════════════════════════════════════════════════════════════════
#  MANAGE SUBJECTS & CHAPTERS (for academics app compatibility)
# ═══════════════════════════════════════════════════════════════════

class ManageSubjectsView(APIView):
    """GET, POST for subjects management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return SubjectListView().get(request)
    
    def post(self, request):
        return SubjectListView().post(request)


class ManageChaptersView(APIView):
    """GET, POST for chapters management"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return ChapterListView().get(request)
    
    def post(self, request):
        return ChapterListView().post(request)




from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from academics.models import TeacherSubjectAssignment
from users.models import CustomUser

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_teacher_to_subject(request):
    """Admin assigns a teacher to teach a subject in a class"""
    
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only admins can assign teachers'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    teacher_id = request.data.get('teacher_id')
    subject_id = request.data.get('subject_id')
    class_id = request.data.get('class_id')
    
    # Validate teacher
    try:
        teacher = CustomUser.objects.get(id=teacher_id, role='teacher', is_approved=True)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Teacher not found or not approved'}, status=400)
    
    # Create assignment (unique_together prevents duplicates)
    try:
        assignment = TeacherSubjectAssignment.objects.create(
            teacher_id=teacher_id,
            subject_id=subject_id,
            class_assigned_id=class_id
        )
        return Response({
            'message': 'Teacher assigned successfully',
            'assignment_id': assignment.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

















































# # admin_tasks/views.py
# """
# Complete Admin Management Views
# EduVibe Platform - 2026
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.core.mail import send_mail
# from django.conf import settings
# from django.db.models import Sum, Count, Q
# from django.utils import timezone

# from users.models import CustomUser
# from .models import Class, Subject, Chapter, Notification, FeePayment
# from teachers.models import TeacherAssignment
# from academics.models import AcademicClass




# # admin_tasks/views.py




# # ==================== ACADEMIC CLASS MANAGEMENT ====================

# class ManageAcademicClassesView(APIView):
#     """
#     GET: List all academic classes
#     POST: Create a new academic class
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             classes = AcademicClass.objects.all()  # ✅ Changed here
#             classes_data = []
            
#             for cls in classes:
#                 classes_data.append({
#                     'id': cls.id,
#                     'name': cls.name,
#                     'description': cls.description or '',
#                     'subjects_count': cls.subjects.count(),
#                     'created_at': cls.created_at.isoformat(),
#                 })
            
#             return Response(classes_data, status=200)
            
#         except Exception as e:
#             print(f"❌ Error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)
    
#     def post(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             name = request.data.get('name')
#             description = request.data.get('description', '')
            
#             if not name:
#                 return Response({'error': 'Class name is required'}, status=400)
            
#             # Check if class already exists
#             if AcademicClass.objects.filter(name=name).exists():  # ✅ Changed here
#                 return Response({'error': 'Class with this name already exists'}, status=400)
            
#             new_class = AcademicClass.objects.create(  # ✅ Changed here
#                 name=name,
#                 description=description
#             )
            
#             return Response({
#                 'message': 'Academic class created successfully',
#                 'class': {
#                     'id': new_class.id,
#                     'name': new_class.name,
#                     'description': new_class.description,
#                 }
#             }, status=201)
            
#         except Exception as e:
#             print(f"❌ Error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)


# class AcademicClassDetailView(APIView):
#     """
#     GET: Get academic class details
#     PUT: Update academic class
#     DELETE: Delete academic class
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, class_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             cls = AcademicClass.objects.get(id=class_id)  # ✅ Changed here
            
#             return Response({
#                 'id': cls.id,
#                 'name': cls.name,
#                 'description': cls.description,
#                 'subjects_count': cls.subjects.count(),
#                 'created_at': cls.created_at.isoformat(),
#             }, status=200)
            
#         except AcademicClass.DoesNotExist:  # ✅ Changed here
#             return Response({'error': 'Academic class not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
#     def put(self, request, class_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             cls = AcademicClass.objects.get(id=class_id)  # ✅ Changed here
            
#             cls.name = request.data.get('name', cls.name)
#             cls.description = request.data.get('description', cls.description)
#             cls.save()
            
#             return Response({
#                 'message': 'Academic class updated successfully',
#                 'class': {
#                     'id': cls.id,
#                     'name': cls.name,
#                     'description': cls.description,
#                 }
#             }, status=200)
            
#         except AcademicClass.DoesNotExist:  # ✅ Changed here
#             return Response({'error': 'Academic class not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
#     def delete(self, request, class_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             cls = AcademicClass.objects.get(id=class_id)  # ✅ Changed here
#             cls.delete()
            
#             return Response({'message': 'Academic class deleted successfully'}, status=200)
            
#         except AcademicClass.DoesNotExist:  # ✅ Changed here
#             return Response({'error': 'Academic class not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)


# # ==================== SUBJECT MANAGEMENT ====================

# class ManageSubjectsView(APIView):
#     """
#     GET: List all subjects (or filter by class)
#     POST: Create a new subject
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             class_id = request.GET.get('class_id')
            
#             if class_id:
#                 subjects = Subject.objects.filter(academic_class_id=class_id).select_related('academic_class', 'teacher')  # ✅ Changed here
#             else:
#                 subjects = Subject.objects.all().select_related('academic_class', 'teacher')  # ✅ Changed here
            
#             subjects_data = []
#             for subject in subjects:
#                 subjects_data.append({
#                     'id': subject.id,
#                     'name': subject.name,
#                     'description': subject.description or '',
#                     'class': {
#                         'id': subject.academic_class.id,  # ✅ Changed here
#                         'name': subject.academic_class.name,  # ✅ Changed here
#                     },
#                     'teacher': {
#                         'id': subject.teacher.id if subject.teacher else None,
#                         'name': f'{subject.teacher.first_name} {subject.teacher.last_name}' if subject.teacher else 'Not assigned',
#                     } if subject.teacher else None,
#                     'chapters_count': subject.chapters.count(),
#                     'created_at': subject.created_at.isoformat(),
#                 })
            
#             return Response(subjects_data, status=200)
            
#         except Exception as e:
#             print(f"❌ Error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)
    
#     def post(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             name = request.data.get('name')
#             description = request.data.get('description', '')
#             class_id = request.data.get('class_id')
#             teacher_id = request.data.get('teacher_id')
            
#             if not name:
#                 return Response({'error': 'Subject name is required'}, status=400)
            
#             if not class_id:
#                 return Response({'error': 'Academic class is required'}, status=400)
            
#             # Verify class exists
#             try:
#                 class_obj = AcademicClass.objects.get(id=class_id)  # ✅ Changed here
#             except AcademicClass.DoesNotExist:  # ✅ Changed here
#                 return Response({'error': 'Academic class not found'}, status=404)
            
#             # Verify teacher exists (if provided)
#             teacher_obj = None
#             if teacher_id:
#                 try:
#                     teacher_obj = User.objects.get(id=teacher_id, role='teacher')
#                 except User.DoesNotExist:
#                     return Response({'error': 'Teacher not found'}, status=404)
            
#             # Create subject
#             new_subject = Subject.objects.create(
#                 name=name,
#                 description=description,
#                 academic_class=class_obj,  # ✅ Changed here
#                 teacher=teacher_obj
#             )
            
#             return Response({
#                 'message': 'Subject created successfully',
#                 'subject': {
#                     'id': new_subject.id,
#                     'name': new_subject.name,
#                     'description': new_subject.description,
#                     'class': {
#                         'id': class_obj.id,
#                         'name': class_obj.name,
#                     },
#                     'teacher': {
#                         'id': teacher_obj.id if teacher_obj else None,
#                         'name': f'{teacher_obj.first_name} {teacher_obj.last_name}' if teacher_obj else None,
#                     } if teacher_obj else None,
#                 }
#             }, status=201)
            
#         except Exception as e:
#             print(f"❌ Error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)


# class SubjectDetailView(APIView):
#     """
#     GET: Get subject details
#     PUT: Update subject
#     DELETE: Delete subject
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, subject_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             subject = Subject.objects.select_related('academic_class', 'teacher').get(id=subject_id)  # ✅ Changed here
            
#             return Response({
#                 'id': subject.id,
#                 'name': subject.name,
#                 'description': subject.description,
#                 'class': {
#                     'id': subject.academic_class.id,  # ✅ Changed here
#                     'name': subject.academic_class.name,  # ✅ Changed here
#                 },
#                 'teacher': {
#                     'id': subject.teacher.id if subject.teacher else None,
#                     'name': f'{subject.teacher.first_name} {subject.teacher.last_name}' if subject.teacher else 'Not assigned',
#                 } if subject.teacher else None,
#                 'chapters_count': subject.chapters.count(),
#                 'created_at': subject.created_at.isoformat(),
#             }, status=200)
            
#         except Subject.DoesNotExist:
#             return Response({'error': 'Subject not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
#     def put(self, request, subject_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             subject = Subject.objects.get(id=subject_id)
            
#             subject.name = request.data.get('name', subject.name)
#             subject.description = request.data.get('description', subject.description)
            
#             # Update class if provided
#             class_id = request.data.get('class_id')
#             if class_id:
#                 try:
#                     class_obj = AcademicClass.objects.get(id=class_id)  # ✅ Changed here
#                     subject.academic_class = class_obj  # ✅ Changed here
#                 except AcademicClass.DoesNotExist:  # ✅ Changed here
#                     return Response({'error': 'Academic class not found'}, status=404)
            
#             # Update teacher if provided
#             teacher_id = request.data.get('teacher_id')
#             if teacher_id:
#                 try:
#                     teacher_obj = User.objects.get(id=teacher_id, role='teacher')
#                     subject.teacher = teacher_obj
#                 except User.DoesNotExist:
#                     return Response({'error': 'Teacher not found'}, status=404)
            
#             subject.save()
            
#             return Response({
#                 'message': 'Subject updated successfully',
#                 'subject': {
#                     'id': subject.id,
#                     'name': subject.name,
#                     'description': subject.description,
#                 }
#             }, status=200)
            
#         except Subject.DoesNotExist:
#             return Response({'error': 'Subject not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
#     def delete(self, request, subject_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             subject = Subject.objects.get(id=subject_id)
#             subject.delete()
            
#             return Response({'message': 'Subject deleted successfully'}, status=200)
            
#         except Subject.DoesNotExist:
#             return Response({'error': 'Subject not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)


# # ==================== CHAPTER MANAGEMENT ====================
# # (Chapters remain the same - no changes needed)

# class ManageChaptersView(APIView):
#     """
#     GET: List all chapters (or filter by subject)
#     POST: Create a new chapter
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             subject_id = request.GET.get('subject_id')
            
#             if subject_id:
#                 chapters = Chapter.objects.filter(subject_id=subject_id).select_related('subject')
#             else:
#                 chapters = Chapter.objects.all().select_related('subject')
            
#             chapters_data = []
#             for chapter in chapters:
#                 chapters_data.append({
#                     'id': chapter.id,
#                     'name': chapter.name,
#                     'description': chapter.description or '',
#                     'order': chapter.order,
#                     'subject': {
#                         'id': chapter.subject.id,
#                         'name': chapter.subject.name,
#                     },
#                     'created_at': chapter.created_at.isoformat(),
#                 })
            
#             return Response(chapters_data, status=200)
            
#         except Exception as e:
#             print(f"❌ Error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)
    
#     def post(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             name = request.data.get('name')
#             description = request.data.get('description', '')
#             subject_id = request.data.get('subject_id')
#             order = request.data.get('order', 0)
            
#             if not name:
#                 return Response({'error': 'Chapter name is required'}, status=400)
            
#             if not subject_id:
#                 return Response({'error': 'Subject is required'}, status=400)
            
#             # Verify subject exists
#             try:
#                 subject_obj = Subject.objects.get(id=subject_id)
#             except Subject.DoesNotExist:
#                 return Response({'error': 'Subject not found'}, status=404)
            
#             # Create chapter
#             new_chapter = Chapter.objects.create(
#                 name=name,
#                 description=description,
#                 subject=subject_obj,
#                 order=order
#             )
            
#             return Response({
#                 'message': 'Chapter created successfully',
#                 'chapter': {
#                     'id': new_chapter.id,
#                     'name': new_chapter.name,
#                     'description': new_chapter.description,
#                     'order': new_chapter.order,
#                     'subject': {
#                         'id': subject_obj.id,
#                         'name': subject_obj.name,
#                     }
#                 }
#             }, status=201)
            
#         except Exception as e:
#             print(f"❌ Error: {str(e)}")
#             import traceback
#             traceback.print_exc()
#             return Response({'error': str(e)}, status=500)


# class ChapterDetailView(APIView):
#     """
#     GET: Get chapter details
#     PUT: Update chapter
#     DELETE: Delete chapter
#     """
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, chapter_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             chapter = Chapter.objects.select_related('subject').get(id=chapter_id)
            
#             return Response({
#                 'id': chapter.id,
#                 'name': chapter.name,
#                 'description': chapter.description,
#                 'order': chapter.order,
#                 'subject': {
#                     'id': chapter.subject.id,
#                     'name': chapter.subject.name,
#                 },
#                 'created_at': chapter.created_at.isoformat(),
#             }, status=200)
            
#         except Chapter.DoesNotExist:
#             return Response({'error': 'Chapter not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
#     def put(self, request, chapter_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             chapter = Chapter.objects.get(id=chapter_id)
            
#             chapter.name = request.data.get('name', chapter.name)
#             chapter.description = request.data.get('description', chapter.description)
#             chapter.order = request.data.get('order', chapter.order)
            
#             # Update subject if provided
#             subject_id = request.data.get('subject_id')
#             if subject_id:
#                 try:
#                     subject_obj = Subject.objects.get(id=subject_id)
#                     chapter.subject = subject_obj
#                 except Subject.DoesNotExist:
#                     return Response({'error': 'Subject not found'}, status=404)
            
#             chapter.save()
            
#             return Response({
#                 'message': 'Chapter updated successfully',
#                 'chapter': {
#                     'id': chapter.id,
#                     'name': chapter.name,
#                     'description': chapter.description,
#                 }
#             }, status=200)
            
#         except Chapter.DoesNotExist:
#             return Response({'error': 'Chapter not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
    
#     def delete(self, request, chapter_id):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             chapter = Chapter.objects.get(id=chapter_id)
#             chapter.delete()
            
#             return Response({'message': 'Chapter deleted successfully'}, status=200)
            
#         except Chapter.DoesNotExist:
#             return Response({'error': 'Chapter not found'}, status=404)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)


# # ==================== HELPER VIEWS ====================

# class GetTeachersView(APIView):
#     """Get list of all teachers (for dropdown in subject creation)"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         try:
#             if request.user.role != 'admin':
#                 return Response({'error': 'Only admins can access this'}, status=403)
            
#             teachers = User.objects.filter(role='teacher', is_approved=True)
            
#             teachers_data = []
#             for teacher in teachers:
#                 teachers_data.append({
#                     'id': teacher.id,
#                     'name': f'{teacher.first_name} {teacher.last_name}',
#                     'email': teacher.email,
#                 })
            
#             return Response(teachers_data, status=200)
            
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)

# # ═══════════════════════════════════════════════════════════
# #  CUSTOM PERMISSION
# # ═══════════════════════════════════════════════════════════

# class IsAdminRole(IsAuthenticated):
#     """Only allow admins"""
    
#     def has_permission(self, request, view):
#         return (
#             super().has_permission(request, view) and
#             request.user.role == 'admin'
#         )


# # ═══════════════════════════════════════════════════════════
# #  USER APPROVAL & MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class PendingUsersView(APIView):
#     """Get all pending users"""
#     permission_classes = [IsAdminRole]
    
#     def get(self, request):
#         pending_users = CustomUser.objects.filter(
#             is_approved=False,
#             otp__isnull=True  # Email verified
#         ).select_related('class_assigned').prefetch_related('subjects')
        
#         users_data = []
#         for user in pending_users:
#             user_info = {
#                 'id': user.id,
#                 'email': user.email,
#                 'phone': user.phone,
#                 'name': f'{user.first_name} {user.last_name}'.strip() or user.username,
#                 'role': user.role,
#                 'dob': user.dob,
#                 'created_at': user.date_joined,
#             }
            
#             if user.role == 'student' and user.class_assigned:
#                 user_info['class'] = {
#                     'id': user.class_assigned.id,
#                     'name': user.class_assigned.name
#                 }
#             elif user.role == 'teacher':
#                 user_info['subjects'] = [
#                     {'id': s.id, 'name': s.name}
#                     for s in user.subjects.all()
#                 ]
            
#             users_data.append(user_info)
        
#         return Response({
#             'count': len(users_data),
#             'users': users_data
#         })


# class ApproveUserView(APIView):
#     """Approve a user"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         user_id = request.data.get('user_id')
        
#         try:
#             user = CustomUser.objects.get(id=user_id)
            
#             if user.is_approved:
#                 return Response({
#                     'error': 'User already approved.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             user.is_approved = True
#             user.save()
            
#             # Send approval email
#             send_mail(
#                 subject='EduVibe - Account Approved!',
#                 message=f'Hello {user.first_name},\n\nYour account has been approved!\n\nUnique ID: {user.unique_id}\nEmail: {user.email}\n\nYou can now login.\n\nEduVibe Team',
#                 from_email=settings.EMAIL_HOST_USER,
#                 recipient_list=[user.email],
#                 fail_silently=True,
#             )
            
#             return Response({
#                 'message': 'User approved successfully!',
#                 'user_id': user.id,
#                 'unique_id': user.unique_id
#             })
        
#         except CustomUser.DoesNotExist:
#             return Response({
#                 'error': 'User not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class RejectUserView(APIView):
#     """Reject/Delete a user"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         user_id = request.data.get('user_id')
        
#         try:
#             user = CustomUser.objects.get(id=user_id)
            
#             if user.is_approved:
#                 return Response({
#                     'error': 'Cannot reject approved user.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             email = user.email
#             name = user.first_name
#             user.delete()
            
#             # Send rejection email
#             send_mail(
#                 subject='EduVibe - Registration Status',
#                 message=f'Hello {name},\n\nYour registration has been reviewed. Please contact admin for more information.\n\nEduVibe Team',
#                 from_email=settings.EMAIL_HOST_USER,
#                 recipient_list=[email],
#                 fail_silently=True,
#             )
            
#             return Response({
#                 'message': 'User rejected and removed.'
#             })
        
#         except CustomUser.DoesNotExist:
#             return Response({
#                 'error': 'User not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class AllUsersView(APIView):
#     """Get all approved users"""
#     permission_classes = [IsAdminRole]
    
#     def get(self, request):
#         role_filter = request.GET.get('role')  # student, teacher, or all
        
#         query = CustomUser.objects.filter(is_approved=True)
        
#         if role_filter and role_filter in ['student', 'teacher', 'admin']:
#             query = query.filter(role=role_filter)
        
#         query = query.select_related('class_assigned').prefetch_related('subjects')
        
#         users_data = []
#         for user in query:
#             user_info = {
#                 'id': user.id,
#                 'unique_id': user.unique_id,
#                 'email': user.email,
#                 'phone': user.phone,
#                 'name': f'{user.first_name} {user.last_name}'.strip() or user.username,
#                 'role': user.role,
#                 'dob': user.dob,
#             }
            
#             if user.role == 'student' and user.class_assigned:
#                 user_info['class'] = {
#                     'id': user.class_assigned.id,
#                     'name': user.class_assigned.name
#                 }
#             elif user.role == 'teacher':
#                 user_info['subjects'] = [
#                     {'id': s.id, 'name': s.name}
#                     for s in user.subjects.all()
#                 ]
            
#             users_data.append(user_info)
        
#         return Response({
#             'count': len(users_data),
#             'users': users_data
#         })


# # ═══════════════════════════════════════════════════════════
# #  CLASS MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class ClassListView(APIView):
#     """Get all classes"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         classes = Class.objects.all().values('id', 'name')
#         return Response(list(classes))


# class ClassCreateView(APIView):
#     """Create a new class"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         name = request.data.get('name', '').strip()
        
#         if not name:
#             return Response({
#                 'error': 'Class name is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if Class.objects.filter(name__iexact=name).exists():
#             return Response({
#                 'error': 'Class already exists.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         class_obj = Class.objects.create(name=name)
        
#         return Response({
#             'message': 'Class created successfully!',
#             'class': {
#                 'id': class_obj.id,
#                 'name': class_obj.name
#             }
#         }, status=status.HTTP_201_CREATED)


# class ClassDetailView(APIView):
#     """Get class details"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, class_id):
#         try:
#             class_obj = Class.objects.get(id=class_id)
            
#             # Get students count
#             student_count = CustomUser.objects.filter(
#                 role='student',
#                 class_assigned=class_obj,
#                 is_approved=True
#             ).count()
            
#             # Get subjects
#             subjects = class_obj.subject_set.all()
            
#             return Response({
#                 'id': class_obj.id,
#                 'name': class_obj.name,
#                 'student_count': student_count,
#                 'subjects': [
#                     {'id': s.id, 'name': s.name}
#                     for s in subjects
#                 ]
#             })
        
#         except Class.DoesNotExist:
#             return Response({
#                 'error': 'Class not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class ClassDeleteView(APIView):
#     """Delete a class"""
#     permission_classes = [IsAdminRole]
    
#     def delete(self, request, class_id):
#         try:
#             class_obj = Class.objects.get(id=class_id)
            
#             # Check if students are assigned
#             if CustomUser.objects.filter(class_assigned=class_obj).exists():
#                 return Response({
#                     'error': 'Cannot delete class with assigned students.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             class_obj.delete()
            
#             return Response({
#                 'message': 'Class deleted successfully!'
#             })
        
#         except Class.DoesNotExist:
#             return Response({
#                 'error': 'Class not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  SUBJECT MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class SubjectListView(APIView):
#     """Get all subjects"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         class_id = request.GET.get('class_id')
        
#         if class_id:
#             # Get subjects for specific class
#             try:
#                 class_obj = Class.objects.get(id=class_id)
#                 subjects = class_obj.subject_set.all()
#             except Class.DoesNotExist:
#                 return Response({
#                     'error': 'Class not found.'
#                 }, status=status.HTTP_404_NOT_FOUND)
#         else:
#             subjects = Subject.objects.all()
        
#         subjects_data = []
#         for subject in subjects:
#             subjects_data.append({
#                 'id': subject.id,
#                 'name': subject.name,
#                 'classes': [
#                     {'id': c.id, 'name': c.name}
#                     for c in subject.classes.all()
#                 ]
#             })
        
#         return Response(subjects_data)


# class SubjectCreateView(APIView):
#     """Create a new subject"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         name = request.data.get('name', '').strip()
#         class_ids = request.data.get('class_ids', [])
        
#         if not name:
#             return Response({
#                 'error': 'Subject name is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if not class_ids:
#             return Response({
#                 'error': 'At least one class is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if Subject.objects.filter(name__iexact=name).exists():
#             return Response({
#                 'error': 'Subject already exists.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         # Validate classes exist
#         classes = Class.objects.filter(id__in=class_ids)
#         if classes.count() != len(class_ids):
#             return Response({
#                 'error': 'Invalid class IDs.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         subject = Subject.objects.create(name=name)
#         subject.classes.set(class_ids)
        
#         return Response({
#             'message': 'Subject created successfully!',
#             'subject': {
#                 'id': subject.id,
#                 'name': subject.name,
#                 'classes': [
#                     {'id': c.id, 'name': c.name}
#                     for c in subject.classes.all()
#                 ]
#             }
#         }, status=status.HTTP_201_CREATED)


# # class SubjectDetailView(APIView):
# #     """Get subject details"""
# #     permission_classes = [IsAuthenticated]
    
# #     def get(self, request, subject_id):
# #         try:
# #             subject = Subject.objects.get(id=subject_id)
            
# #             # Get teachers
# #             teachers = CustomUser.objects.filter(
# #                 role='teacher',
# #                 subjects=subject,
# #                 is_approved=True
# #             )
            
# #             return Response({
# #                 'id': subject.id,
# #                 'name': subject.name,
# #                 'classes': [
# #                     {'id': c.id, 'name': c.name}
# #                     for c in subject.classes.all()
# #                 ],
# #                 'teachers': [
# #                     {
# #                         'id': t.id,
# #                         'name': f'{t.first_name} {t.last_name}'.strip(),
# #                         'unique_id': t.unique_id
# #                     }
# #                     for t in teachers
# #                 ]
# #             })
        
# #         except Subject.DoesNotExist:
# #             return Response({
# #                 'error': 'Subject not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)


# # class SubjectUpdateView(APIView):
# #     """Update a subject"""
# #     permission_classes = [IsAdminRole]
    
# #     def put(self, request, subject_id):
# #         try:
# #             subject = Subject.objects.get(id=subject_id)
            
# #             name = request.data.get('name', '').strip()
# #             class_ids = request.data.get('class_ids', [])
            
# #             if not name:
# #                 return Response({
# #                     'error': 'Subject name is required.'
# #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# #             if not class_ids:
# #                 return Response({
# #                     'error': 'At least one class is required.'
# #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# #             # Check if name conflicts with another subject
# #             if Subject.objects.filter(name__iexact=name).exclude(id=subject_id).exists():
# #                 return Response({
# #                     'error': 'Subject with this name already exists.'
# #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# #             # Validate classes exist
# #             classes = Class.objects.filter(id__in=class_ids)
# #             if classes.count() != len(class_ids):
# #                 return Response({
# #                     'error': 'Invalid class IDs.'
# #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# #             # Update subject
# #             subject.name = name
# #             subject.save()
# #             subject.classes.set(class_ids)
            
# #             return Response({
# #                 'message': 'Subject updated successfully!',
# #                 'subject': {
# #                     'id': subject.id,
# #                     'name': subject.name,
# #                     'classes': [
# #                         {'id': c.id, 'name': c.name}
# #                         for c in subject.classes.all()
# #                     ]
# #                 }
# #             })
        
# #         except Subject.DoesNotExist:
# #             return Response({
# #                 'error': 'Subject not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)


# # class SubjectDeleteView(APIView):
# #     """Delete a subject"""
# #     permission_classes = [IsAdminRole]
    
# #     def delete(self, request, subject_id):
# #         try:
# #             subject = Subject.objects.get(id=subject_id)
            
# #             # Check if teachers are assigned
# #             if CustomUser.objects.filter(subjects=subject).exists():
# #                 return Response({
# #                     'error': 'Cannot delete subject with assigned teachers.'
# #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# #             # Check if chapters exist
# #             if Chapter.objects.filter(subject=subject).exists():
# #                 return Response({
# #                     'error': 'Cannot delete subject with existing chapters.'
# #                 }, status=status.HTTP_400_BAD_REQUEST)
            
# #             subject_name = subject.name
# #             subject.delete()
            
# #             return Response({
# #                 'message': f'Subject "{subject_name}" deleted successfully!'
# #             })
        
# #         except Subject.DoesNotExist:
# #             return Response({
# #                 'error': 'Subject not found.'
# #             }, status=status.HTTP_404_NOT_FOUND)


# # # ═══════════════════════════════════════════════════════════
# # #  CHAPTER MANAGEMENT
# # # ═══════════════════════════════════════════════════════════

# # class ChapterListView(APIView):
# #     """Get chapters for subject and class"""
# #     permission_classes = [IsAuthenticated]
    
# #     def get(self, request):
# #         subject_id = request.GET.get('subject_id')
# #         class_id = request.GET.get('class_id')
        
# #         if not subject_id or not class_id:
# #             return Response({
# #                 'error': 'Subject ID and Class ID required.'
# #             }, status=status.HTTP_400_BAD_REQUEST)
        
# #         chapters = Chapter.objects.filter(
# #             subject_id=subject_id,
# #             class_assigned_id=class_id
# #         )
        
# #         chapters_data = [
# #             {
# #                 'id': c.id,
# #                 'name': c.name,
# #                 'is_completed': c.is_completed,
# #                 'subject': c.subject.name,
# #                 'class': c.class_assigned.name
# #             }
# #             for c in chapters
# #         ]
        
# #         return Response(chapters_data)


# class ChapterCreateView(APIView):
#     """Create a new chapter"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         name = request.data.get('name', '').strip()
#         subject_id = request.data.get('subject_id')
#         class_id = request.data.get('class_id')
        
#         if not name or not subject_id or not class_id:
#             return Response({
#                 'error': 'Name, subject, and class are required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             subject = Subject.objects.get(id=subject_id)
#             class_obj = Class.objects.get(id=class_id)
            
#             # Check if subject is taught in class
#             if class_obj not in subject.classes.all():
#                 return Response({
#                     'error': 'This subject is not taught in this class.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Check duplicate
#             if Chapter.objects.filter(
#                 name__iexact=name,
#                 subject=subject,
#                 class_assigned=class_obj
#             ).exists():
#                 return Response({
#                     'error': 'Chapter already exists for this subject and class.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             chapter = Chapter.objects.create(
#                 name=name,
#                 subject=subject,
#                 class_assigned=class_obj
#             )
            
#             return Response({
#                 'message': 'Chapter created successfully!',
#                 'chapter': {
#                     'id': chapter.id,
#                     'name': chapter.name,
#                     'subject': subject.name,
#                     'class': class_obj.name
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except Subject.DoesNotExist:
#             return Response({
#                 'error': 'Subject not found.'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Class.DoesNotExist:
#             return Response({
#                 'error': 'Class not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  TEACHER ASSIGNMENT
# # ═══════════════════════════════════════════════════════════

# class TeacherAssignmentListView(APIView):
#     """Get all teacher assignments"""
#     permission_classes = [IsAdminRole]
    
#     def get(self, request):
#         assignments = TeacherAssignment.objects.select_related(
#             'teacher', 'class_assigned', 'subject'
#         ).all()
        
#         assignments_data = [
#             {
#                 'id': a.id,
#                 'teacher': {
#                     'id': a.teacher.id,
#                     'name': f'{a.teacher.first_name} {a.teacher.last_name}'.strip(),
#                     'unique_id': a.teacher.unique_id
#                 },
#                 'class': {
#                     'id': a.class_assigned.id,
#                     'name': a.class_assigned.name
#                 },
#                 'subject': {
#                     'id': a.subject.id,
#                     'name': a.subject.name
#                 }
#             }
#             for a in assignments
#         ]
        
#         return Response(assignments_data)


# class TeacherAssignmentCreateView(APIView):
#     """Assign teacher to class-subject"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         teacher_id = request.data.get('teacher_id')
#         class_id = request.data.get('class_id')
#         subject_id = request.data.get('subject_id')
        
#         try:
#             teacher = CustomUser.objects.get(
#                 id=teacher_id,
#                 role='teacher',
#                 is_approved=True
#             )
#             class_obj = Class.objects.get(id=class_id)
#             subject = Subject.objects.get(id=subject_id)
            
#             # Check subject in class
#             if class_obj not in subject.classes.all():
#                 return Response({
#                     'error': 'Subject not taught in this class.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Check teacher has this subject
#             if subject not in teacher.subjects.all():
#                 return Response({
#                     'error': 'Teacher not registered for this subject.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             # Check duplicate
#             if TeacherAssignment.objects.filter(
#                 teacher=teacher,
#                 class_assigned=class_obj,
#                 subject=subject
#             ).exists():
#                 return Response({
#                     'error': 'Teacher already assigned to this class-subject.'
#                 }, status=status.HTTP_400_BAD_REQUEST)
            
#             assignment = TeacherAssignment.objects.create(
#                 teacher=teacher,
#                 class_assigned=class_obj,
#                 subject=subject
#             )
            
#             return Response({
#                 'message': 'Teacher assigned successfully!',
#                 'assignment': {
#                     'id': assignment.id,
#                     'teacher': teacher.unique_id,
#                     'class': class_obj.name,
#                     'subject': subject.name
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except CustomUser.DoesNotExist:
#             return Response({
#                 'error': 'Teacher not found or not approved.'
#             }, status=status.HTTP_404_NOT_FOUND)
#         except (Class.DoesNotExist, Subject.DoesNotExist):
#             return Response({
#                 'error': 'Class or Subject not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  NOTIFICATION MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class NotificationCreateView(APIView):
#     """Send notification"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         message = request.data.get('message', '').strip()
#         recipient_type = request.data.get('recipient_type')  # all_students, all_teachers, specific_user
#         recipient_id = request.data.get('recipient_id')  # For specific user
        
#         if not message:
#             return Response({
#                 'error': 'Message is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         if recipient_type == 'specific_user':
#             try:
#                 recipient = CustomUser.objects.get(id=recipient_id, is_approved=True)
#                 notification = Notification.objects.create(
#                     user=recipient,
#                     message=message
#                 )
                
#                 # Send email
#                 send_mail(
#                     subject='EduVibe - New Notification',
#                     message=f'Hello {recipient.first_name},\n\n{message}\n\nEduVibe Team',
#                     from_email=settings.EMAIL_HOST_USER,
#                     recipient_list=[recipient.email],
#                     fail_silently=True,
#                 )
                
#                 return Response({
#                     'message': 'Notification sent!',
#                     'count': 1
#                 })
#             except CustomUser.DoesNotExist:
#                 return Response({
#                     'error': 'User not found.'
#                 }, status=status.HTTP_404_NOT_FOUND)
        
#         elif recipient_type in ['all_students', 'all_teachers']:
#             role = 'student' if recipient_type == 'all_students' else 'teacher'
#             recipients = CustomUser.objects.filter(role=role, is_approved=True)
            
#             count = 0
#             for recipient in recipients:
#                 Notification.objects.create(
#                     user=recipient,
#                     message=message
#                 )
                
#                 # Send email
#                 try:
#                     send_mail(
#                         subject='EduVibe - New Notification',
#                         message=f'Hello {recipient.first_name},\n\n{message}\n\nEduVibe Team',
#                         from_email=settings.EMAIL_HOST_USER,
#                         recipient_list=[recipient.email],
#                         fail_silently=True,
#                     )
#                     count += 1
#                 except:
#                     pass
            
#             return Response({
#                 'message': f'Notification sent to all {role}s!',
#                 'count': count
#             })
        
#         else:
#             return Response({
#                 'error': 'Invalid recipient type.'
#             }, status=status.HTTP_400_BAD_REQUEST)


# class NotificationListView(APIView):
#     """Get user's notifications"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         notifications = Notification.objects.filter(
#             user=request.user
#         ).order_by('-created_at')
        
#         notifications_data = [
#             {
#                 'id': n.id,
#                 'message': n.message,
#                 'created_at': n.created_at
#             }
#             for n in notifications
#         ]
        
#         return Response(notifications_data)


# # ═══════════════════════════════════════════════════════════
# #  FEE PAYMENT MANAGEMENT
# # ═══════════════════════════════════════════════════════════

# class FeePaymentCreateView(APIView):
#     """Record fee payment"""
#     permission_classes = [IsAdminRole]
    
#     def post(self, request):
#         student_id = request.data.get('student_id')
#         amount = request.data.get('amount')
#         receipt = request.FILES.get('receipt')
        
#         if not amount or float(amount) <= 0:
#             return Response({
#                 'error': 'Valid amount is required.'
#             }, status=status.HTTP_400_BAD_REQUEST)
        
#         try:
#             student = CustomUser.objects.get(
#                 id=student_id,
#                 role='student',
#                 is_approved=True
#             )
            
#             fee_payment = FeePayment.objects.create(
#                 student=student,
#                 amount=amount,
#                 receipt=receipt
#             )
            
#             # Send email
#             send_mail(
#                 subject='EduVibe - Fee Payment Received',
#                 message=f'Hello {student.first_name},\n\nYour fee payment of ₹{amount} has been received.\n\nThank you!\nEduVibe Team',
#                 from_email=settings.EMAIL_HOST_USER,
#                 recipient_list=[student.email],
#                 fail_silently=True,
#             )
            
#             return Response({
#                 'message': 'Fee payment recorded!',
#                 'payment': {
#                     'id': fee_payment.id,
#                     'student': student.unique_id,
#                     'amount': str(fee_payment.amount),
#                     'paid_at': fee_payment.paid_at
#                 }
#             }, status=status.HTTP_201_CREATED)
        
#         except CustomUser.DoesNotExist:
#             return Response({
#                 'error': 'Student not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# class FeePaymentListView(APIView):
#     """Get all fee payments"""
#     permission_classes = [IsAdminRole]
    
#     def get(self, request):
#         payments = FeePayment.objects.select_related('student').order_by('-paid_at')
        
#         payments_data = [
#             {
#                 'id': p.id,
#                 'student': {
#                     'id': p.student.id,
#                     'name': f'{p.student.first_name} {p.student.last_name}'.strip(),
#                     'unique_id': p.student.unique_id,
#                     'class': p.student.class_assigned.name if p.student.class_assigned else None
#                 },
#                 'amount': str(p.amount),
#                 'paid_at': p.paid_at,
#                 'has_receipt': bool(p.receipt)
#             }
#             for p in payments
#         ]
        
#         return Response(payments_data)


# class FeePaymentDetailView(APIView):
#     """Get fee payment detail with receipt"""
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request, payment_id):
#         try:
#             payment = FeePayment.objects.select_related('student').get(id=payment_id)
            
#             # Check permission (admin or own student)
#             if request.user.role != 'admin' and request.user.id != payment.student.id:
#                 return Response({
#                     'error': 'Permission denied.'
#                 }, status=status.HTTP_403_FORBIDDEN)
            
#             receipt_url = None
#             if payment.receipt:
#                 receipt_url = request.build_absolute_uri(payment.receipt.url)
            
#             return Response({
#                 'id': payment.id,
#                 'student': {
#                     'id': payment.student.id,
#                     'name': f'{payment.student.first_name} {payment.student.last_name}'.strip(),
#                     'unique_id': payment.student.unique_id
#                 },
#                 'amount': str(payment.amount),
#                 'paid_at': payment.paid_at,
#                 'receipt_url': receipt_url
#             })
        
#         except FeePayment.DoesNotExist:
#             return Response({
#                 'error': 'Payment not found.'
#             }, status=status.HTTP_404_NOT_FOUND)


# # ═══════════════════════════════════════════════════════════
# #  DASHBOARD STATS
# # ═══════════════════════════════════════════════════════════

# class AdminDashboardStatsView(APIView):
#     """Get admin dashboard statistics"""
#     permission_classes = [IsAdminRole]
    
#     def get(self, request):
#         stats = {
#             'users': {
#                 'total': CustomUser.objects.count(),
#                 'students': CustomUser.objects.filter(role='student', is_approved=True).count(),
#                 'teachers': CustomUser.objects.filter(role='teacher', is_approved=True).count(),
#                 'pending': CustomUser.objects.filter(is_approved=False, otp__isnull=True).count()
#             },
#             'academic': {
#                 'classes': Class.objects.count(),
#                 'subjects': Subject.objects.count(),
#                 'chapters': Chapter.objects.count()
#             },
#             'financial': {
#                 'total_fees': str(
#                     FeePayment.objects.aggregate(
#                         total=Sum('amount')
#                     )['total'] or 0
#                 ),
#                 'payments_count': FeePayment.objects.count()
#             }
#         }
        
#         return Response(stats)














