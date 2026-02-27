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
from academics.models import AcademicClass, Subject as AcademicSubject, ClassSubject, Chapter as AcademicChapter, TeacherAssignment as AcademicTeacherAssignment
# from academics.models import AcademicClass, Subject as AcademicSubject, Chapter as AcademicChapter
# from academics.models import AcademicClass  # ✅ Import from academics too


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
            is_approved=False,
            is_active=True
        ).values(
            'id', 'username', 'email', 'first_name',
            'last_name', 'role', 'phone', 'dob', 'date_joined'
        )

        return Response(list(pending_users), status=200)


# class ApproveUserView(APIView):
#     """POST: Approve a pending user"""
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         if not is_admin(request.user):
#             return Response({'error': 'Admin access required'}, status=403)

#         user_id = request.data.get('user_id')

#         try:
#             user = CustomUser.objects.get(id=user_id, is_approved=False)
#             user.is_approved = True

#             # Generate unique ID
#             user.unique_id = f"{user.role.upper()}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
#             user.save()

#             # Send approval email
#             try:
#                 send_mail(
#                     subject='Account Approved - EduVibe',
#                     message=f'Your account has been approved!\n\nYour Unique ID: {user.unique_id}\nEmail: {user.email}\n\nYou can now login.',
#                     from_email=settings.DEFAULT_FROM_EMAIL,
#                     recipient_list=[user.email],
#                     fail_silently=True,
#                 )
#             except Exception as e:
#                 print(f"Email send failed: {e}")

#             return Response({
#                 'message': 'User approved successfully',
#                 'user': {
#                     'id': user.id,
#                     'username': user.username,
#                     'unique_id': user.unique_id,
#                     'role': user.role
#                 }
#             }, status=200)

#         except CustomUser.DoesNotExist:
#             return Response({'error': 'User not found'}, status=404)

class ApproveUserView(APIView):
    """POST: Approve a pending user"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        user_id = request.data.get('user_id')

        try:
            # Use filter().first() to avoid crashes
            user = CustomUser.objects.filter(id=user_id, is_approved=False).first()
            
            if not user:
                return Response({'error': 'User not found or already approved'}, status=404)

            user.is_approved = True
            user.unique_id = f"{user.role.upper()}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            user.save()

            # Send approval email using Brevo (not send_mail)
            try:
                from users.views import send_otp_email
                send_otp_email(
                    user.email,
                    '🎉 EduVibe - Account Approved!',
                    f'''Hello {user.first_name or user.username},

Congratulations! Your EduVibe account has been approved!

YOUR LOGIN CREDENTIALS:
Email:     {user.email}
Unique ID: {user.unique_id}
Role:      {user.role.title()}

You can login using your email and password at:
https://edu-vibe-ten.vercel.app/login

Welcome to EduVibe!
EduVibe Team'''
                )
            except Exception as e:
                print(f"Approval email failed: {e}")
                # Don't fail the approval if email fails

            return Response({
                'message': 'User approved successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'unique_id': user.unique_id,
                    'role': user.role
                }
            }, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)



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
    """GET: List all approved users WITH is_approved, class, and subjects"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        role_filter = request.GET.get('role')

        query = CustomUser.objects.filter(
            is_approved=True
        ).select_related('class_assigned').prefetch_related('subjects')

        if role_filter:
            query = query.filter(role=role_filter)

        users_data = []
        for user in query:
            users_data.append({
                'id':           user.id,
                'unique_id':    user.unique_id,
                'username':     user.username,
                'email':        user.email,
                'first_name':   user.first_name,
                'last_name':    user.last_name,
                'role':         user.role,
                'phone':        user.phone,
                'dob':          str(user.dob) if user.dob else None,
                'date_joined':  user.date_joined.isoformat(),
                'is_approved':  user.is_approved,
                'class_assigned_id':   user.class_assigned.id   if user.class_assigned else None,
                'class_assigned_name': user.class_assigned.name if user.class_assigned else None,
                'subjects': [
                    {'id': s.id, 'name': s.name}
                    for s in user.subjects.all()
                ],
            })

        return Response(users_data, status=200)


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
            # 'chapter_count': s.chapter_set.count()
            'chapter_count': Chapter.objects.filter(subject=s).count()
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
    PATCH: Rename a subject
    DELETE: Delete a subject and all its class links
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        from academics.models import Subject as AcSubject

        try:
            subject = AcSubject.objects.get(id=subject_id)
            name = request.data.get('name', '').strip()

            if not name:
                return Response({'error': 'Subject name is required'}, status=400)

            if AcSubject.objects.filter(name__iexact=name).exclude(id=subject_id).exists():
                return Response({'error': 'A subject with this name already exists'}, status=400)

            subject.name = name.upper()
            subject.save()

            return Response({
                'message': 'Subject updated successfully',
                'subject': {'id': subject.id, 'name': subject.name}
            }, status=200)

        except AcSubject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)

    def delete(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        from academics.models import Subject as AcSubject

        try:
            subject = AcSubject.objects.get(id=subject_id)
            subject.delete()
            return Response({'message': 'Subject deleted successfully'}, status=200)

        except AcSubject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)


class SubjectDeleteView(APIView):
    """DELETE: Delete a subject"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, subject_id):
        return SubjectDetailView().delete(request, subject_id)



# ═══════════════════════════════════════════════════════════════════
#  SECTION 4: CHAPTER MANAGEMENT — uses academics.Chapter via ClassSubject
# ═══════════════════════════════════════════════════════════════════

class ChapterListView(APIView):
    """
    GET: List chapters filtered by class_id and/or subject_id
    POST: Create a new chapter
    Both use academics.Chapter which has class_subject FK → ClassSubject
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        from academics.models import Chapter as AcChapter

        class_id   = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')

        # Chapter → class_subject → ClassSubject → academic_class & subject
        chapters = AcChapter.objects.select_related(
            'class_subject__subject',
            'class_subject__academic_class'
        ).all()

        if class_id:
            chapters = chapters.filter(class_subject__academic_class__id=class_id)
        if subject_id:
            chapters = chapters.filter(class_subject__subject__id=subject_id)

        chapters_data = [{
            'id':    ch.id,
            'name':  ch.name,
            'order': ch.order,
            'subject': {
                'id':   ch.class_subject.subject.id,
                'name': ch.class_subject.subject.name,
            },
            'class': {
                'id':   ch.class_subject.academic_class.id,
                'name': ch.class_subject.academic_class.name,
            },
        } for ch in chapters]

        return Response(chapters_data, status=200)

    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        from academics.models import Chapter as AcChapter, ClassSubject

        name       = request.data.get('name', '').strip()
        subject_id = request.data.get('subject_id')   # AcSubject.id
        class_id   = request.data.get('class_id')     # AcademicClass.id
        order      = request.data.get('order', 0)

        if not name:
            return Response({'error': 'Chapter name is required'}, status=400)
        if not subject_id:
            return Response({'error': 'subject_id is required'}, status=400)
        if not class_id:
            return Response({'error': 'class_id is required'}, status=400)

        # Find the ClassSubject that links this subject to this class
        try:
            class_subject = ClassSubject.objects.select_related(
                'subject', 'academic_class'
            ).get(subject__id=subject_id, academic_class__id=class_id)
        except ClassSubject.DoesNotExist:
            return Response({
                'error': 'This subject is not linked to this class. Link it from Manage Subjects first.'
            }, status=404)

        # Check duplicate
        if AcChapter.objects.filter(name__iexact=name, class_subject=class_subject).exists():
            return Response({'error': f'Chapter "{name}" already exists for this subject in this class'}, status=400)

        chapter = AcChapter.objects.create(
            name=name,
            class_subject=class_subject,
            order=int(order) if order else 0,
        )

        return Response({
            'message': 'Chapter created successfully',
            'chapter': {
                'id':    chapter.id,
                'name':  chapter.name,
                'order': chapter.order,
                'subject': {
                    'id':   class_subject.subject.id,
                    'name': class_subject.subject.name,
                },
                'class': {
                    'id':   class_subject.academic_class.id,
                    'name': class_subject.academic_class.name,
                },
            }
        }, status=201)


class ChapterCreateView(APIView):
    """POST: Create a new chapter (alias endpoint)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return ChapterListView().post(request)


class ChapterDetailView(APIView):
    """
    GET: Get chapter details
    PUT/PATCH: Update chapter name or order
    DELETE: Delete chapter
    """
    permission_classes = [IsAuthenticated]

    def _get_chapter(self, chapter_id):
        from academics.models import Chapter as AcChapter
        return AcChapter.objects.select_related(
            'class_subject__subject',
            'class_subject__academic_class'
        ).get(id=chapter_id)

    def get(self, request, chapter_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        from academics.models import Chapter as AcChapter
        try:
            ch = self._get_chapter(chapter_id)
            return Response({
                'id':    ch.id,
                'name':  ch.name,
                'order': ch.order,
                'subject': {'id': ch.class_subject.subject.id,   'name': ch.class_subject.subject.name},
                'class':   {'id': ch.class_subject.academic_class.id, 'name': ch.class_subject.academic_class.name},
            }, status=200)
        except AcChapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=404)

    def put(self, request, chapter_id):
        return self.patch(request, chapter_id)

    def patch(self, request, chapter_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        from academics.models import Chapter as AcChapter
        try:
            ch = AcChapter.objects.get(id=chapter_id)
            name  = request.data.get('name', '').strip()
            order = request.data.get('order')
            if name:
                ch.name = name
            if order is not None:
                ch.order = int(order)
            ch.save()
            return Response({'message': 'Chapter updated successfully'}, status=200)
        except AcChapter.DoesNotExist:
            return Response({'error': 'Chapter not found'}, status=404)

    def delete(self, request, chapter_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        from academics.models import Chapter as AcChapter
        try:
            AcChapter.objects.get(id=chapter_id).delete()
            return Response({'message': 'Chapter deleted successfully'}, status=200)
        except AcChapter.DoesNotExist:
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

class TeacherAssignmentDeleteView(APIView):
    """DELETE: Remove a teacher assignment"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, assignment_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        try:
            from academics.models import TeacherAssignment as AcTeacherAssignment
            assignment = AcTeacherAssignment.objects.select_related(
                'teacher', 'class_subject__subject', 'class_subject__academic_class'
            ).get(id=assignment_id)
            assignment.delete()
            return Response({'message': 'Assignment removed successfully'}, status=200)
        except AcTeacherAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=404)


class GetTeacherAssignmentsView(APIView):
    """GET: List all teacher assignments using academics model"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        from academics.models import TeacherAssignment as AcTeacherAssignment
        assignments = AcTeacherAssignment.objects.select_related(
            'teacher',
            'class_subject__subject',
            'class_subject__academic_class',
        ).all()

        data = [{
            'id': a.id,
            'teacher': {
                'id':   a.teacher.id,
                'name': a.teacher.get_full_name() or a.teacher.username,
            },
            'subject': {
                'id':   a.class_subject.subject.id,
                'name': a.class_subject.subject.name,
            },
            'class': {
                'id':   a.class_subject.academic_class.id,
                'name': a.class_subject.academic_class.name,
            },
            'class_subject_id': a.class_subject.id,
        } for a in assignments]

        return Response(data, status=200)
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
               
                'classes': AcademicClass.objects.count(),
                'subjects': AcademicSubject.objects.count(),
                'chapters': AcademicChapter.objects.count(),
                'class_subjects': ClassSubject.objects.count()
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
            'subjects_count': cls.class_subjects.count(),
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
    """GET, PATCH, DELETE academic class details"""
    permission_classes = [IsAuthenticated]

    def get(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        try:
            # from academics.models import Subject as AcSubject, TeacherSubjectAssignment
            # cls = AcademicClass.objects.get(id=class_id)
            from academics.models import Subject as AcSubject, ClassSubject, TeacherAssignment as AcTeacherAssignment
            cls = AcademicClass.objects.get(id=class_id)

            
            subjects_data = []
            for cs in cls.class_subjects.select_related('subject').all():
                assignment = AcTeacherAssignment.objects.filter(
                    class_subject=cs
                ).select_related('teacher').first()
                subjects_data.append({
                    'id': cs.id,
                    'subject_id': cs.subject.id,
                    'name': cs.subject.name,
                    'chapter_count': cs.chapters.count(),
                    'assigned_teacher': {
                        'id': assignment.teacher.id,
                        'name': assignment.teacher.get_full_name() or assignment.teacher.username,
                        'unique_id': assignment.teacher.unique_id,
                    } if assignment else None,
                })

            # Get students enrolled in this class
            students = CustomUser.objects.filter(
                class_assigned_id=class_id, role='student', is_approved=True
            )
            students_data = [{
                'id': st.id,
                'name': st.get_full_name() or st.username,
                'unique_id': st.unique_id,
                'email': st.email,
                'phone': st.phone if hasattr(st, 'phone') else '',
            } for st in students]

            return Response({
                'id': cls.id,
                'name': cls.name,
                'description': cls.description or '',
                'subjects': subjects_data,
                'students': students_data,
                'student_count': len(students_data),
                'subject_count': len(subjects_data),
                'created_at': cls.created_at.isoformat()
            }, status=200)

        except AcademicClass.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def patch(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        try:
            cls = AcademicClass.objects.get(id=class_id)
            name = request.data.get('name', '').strip()
            if not name:
                return Response({'error': 'Class name is required'}, status=400)
            if AcademicClass.objects.filter(name=name).exclude(id=class_id).exists():
                return Response({'error': 'A class with this name already exists'}, status=400)
            cls.name = name
            cls.save()
            return Response({
                'message': 'Class renamed successfully',
                'class': {'id': cls.id, 'name': cls.name}
            }, status=200)
        except AcademicClass.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)

    def delete(self, request, class_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        try:
            cls = AcademicClass.objects.get(id=class_id)
            student_count = CustomUser.objects.filter(
                class_assigned_id=class_id, role='student'
            ).count()
            if student_count > 0:
                return Response({
                    'error': f'Cannot delete. {student_count} student(s) are enrolled in this class. Reassign them first.'
                }, status=400)
            cls.delete()
            return Response({'message': 'Class deleted successfully'}, status=200)
        except AcademicClass.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)


class AcademicSubjectManageView(APIView):
    """
    POST: Add a new subject to a class
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        # from academics.models import Subject as AcSubject
        from academics.models import Subject as AcSubject, ClassSubject
        name = request.data.get('name', '').strip()
        class_id = request.data.get('class_id')
        if not name:
            return Response({'error': 'Subject name is required'}, status=400)
        if not class_id:
            return Response({'error': 'class_id is required'}, status=400)
        try:
            cls = AcademicClass.objects.get(id=class_id)
        except AcademicClass.DoesNotExist:
            return Response({'error': 'Class not found'}, status=404)

        # Get or create the unique subject name
        subject, created = AcSubject.objects.get_or_create(
            name__iexact=name,
            defaults={'name': name.strip().upper()}
        )

        # Check if this subject already linked to this class
        if ClassSubject.objects.filter(subject=subject, academic_class=cls).exists():
            return Response({'error': 'This subject already exists in this class'}, status=400)

        # Link subject to class
        class_subject = ClassSubject.objects.create(
            subject=subject,
            academic_class=cls
        )
        return Response({
            'message': 'Subject added successfully',
            'subject': {
                'id': class_subject.id,
                'subject_id': subject.id,
                'name': subject.name
            }
        }, status=201)
        


class AcademicSubjectDetailView(APIView):
    """
    PATCH: Rename a subject
    DELETE: Delete a subject
    """
    permission_classes = [IsAuthenticated]


    def patch(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        from academics.models import Subject as AcSubject, ClassSubject
        try:
            class_subject = ClassSubject.objects.select_related('subject').get(id=subject_id)
            name = request.data.get('name', '').strip()
            if not name:
                return Response({'error': 'Subject name is required'}, status=400)
            # Update the subject name
            class_subject.subject.name = name.strip().upper()
            class_subject.subject.save()
            return Response({
                'message': 'Subject renamed successfully',
                'subject': {'id': class_subject.id, 'name': class_subject.subject.name}
            }, status=200)
        except ClassSubject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)

    def delete(self, request, subject_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        from academics.models import ClassSubject
        try:
            class_subject = ClassSubject.objects.get(id=subject_id)
            class_subject.delete()
            return Response({'message': 'Subject deleted successfully'}, status=200)
        except ClassSubject.DoesNotExist:
            return Response({'error': 'Subject not found'}, status=404)


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
    """GET all subjects (from academics.Subject), POST to create"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        from academics.models import Subject as AcSubject, ClassSubject
        subjects = AcSubject.objects.prefetch_related('class_subjects__academic_class').all()

        subjects_data = [{
            'id': s.id,
            'name': s.name,
            'classes': [{
                'id': cs.academic_class.id,
                'name': cs.academic_class.name
            } for cs in s.class_subjects.all()],
            'chapter_count': sum(cs.chapters.count() for cs in s.class_subjects.all())
        } for s in subjects]

        return Response(subjects_data, status=200)

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
from academics.models import TeacherAssignment as AcademicTeacherAssignmentModel
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
        from academics.models import ClassSubject
        cs = ClassSubject.objects.get(subject_id=subject_id, academic_class_id=class_id)
        assignment = AcademicTeacherAssignmentModel.objects.create(
            teacher_id=teacher_id,
            class_subject=cs
        )
        return Response({
            'message': 'Teacher assigned successfully',
            'assignment_id': assignment.id
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


class DeleteUserView(APIView):
    """DELETE: Permanently delete a user"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)
        try:
            user = CustomUser.objects.get(id=user_id)
            if user.id == request.user.id:
                return Response({'error': 'Cannot delete your own account'}, status=400)
            name = user.get_full_name() or user.username
            user.delete()
            return Response({'message': f'{name} deleted successfully'}, status=200)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)



class UpdateUserView(APIView):
    """PATCH: Update user — basic fields + class (students) + subjects (teachers)"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if not is_admin(request.user):
            return Response({'error': 'Admin access required'}, status=403)

        try:
            user = CustomUser.objects.get(id=user_id)

            # Basic fields anyone can update
            for field in ['first_name', 'last_name', 'phone', 'email']:
                if field in request.data:
                    setattr(user, field, request.data[field])

            # Student: update class assignment
            if user.role == 'student' and 'class_assigned_id' in request.data:
                class_id = request.data['class_assigned_id']
                if class_id:
                    try:
                        from .models import Class as AdminClass
                        user.class_assigned = AdminClass.objects.get(id=class_id)
                    except Exception:
                        try:
                            from academics.models import AcademicClass
                            user.class_assigned = AcademicClass.objects.get(id=class_id)
                        except Exception:
                            return Response({'error': f'Class id {class_id} not found'}, status=404)
                else:
                    user.class_assigned = None

            user.save()

            # Teacher: update subjects (ManyToMany must be done after save)
            if user.role == 'teacher' and 'subject_ids' in request.data:
                from .models import Subject
                subjects = Subject.objects.filter(id__in=request.data['subject_ids'])
                user.subjects.set(subjects)

            return Response({
                'message': 'User updated successfully',
                'user': {
                    'id':                  user.id,
                    'first_name':          user.first_name,
                    'last_name':           user.last_name,
                    'email':               user.email,
                    'phone':               user.phone,
                    'class_assigned_id':   user.class_assigned.id   if user.class_assigned else None,
                    'class_assigned_name': user.class_assigned.name if user.class_assigned else None,
                    'subjects': [{'id': s.id, 'name': s.name} for s in user.subjects.all()],
                }
            }, status=200)

        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)




























