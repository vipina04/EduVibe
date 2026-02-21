# students/views_doubts.py
"""
Student Doubt Management Views
EduVibe Platform - 2026

Real Doubt model fields (confirmed from shell):
  Doubt: id, student, class_subject(FK→ClassSubject), doubt_text, 
         doubt_image, status, created_at, updated_at, replies
  DoubtReply: id, doubt, replied_by, reply_text, reply_image, created_at

Chain:
  Student.class_assigned (AcademicClass)
    → ClassSubject.academic_class
      → ClassSubject.subject (Subject)
        → Doubt.class_subject
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from academics.models import ClassSubject, Doubt, DoubtReply


def is_student(user):
    return user.is_authenticated and user.role == 'student'


# ══════════════════════════════════════════════════════════════
#  GET all doubts for student's class
#  GET /api/students/doubts/
# ══════════════════════════════════════════════════════════════

class StudentDoubtListView(APIView):
    """
    Returns all doubts for ALL subjects in the student's class.
    Every student in the same class can see all doubts.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_student(request.user):
            return Response({'error': 'Student access required'}, status=403)

        student = request.user

        if not student.class_assigned:
            return Response(
                {'error': 'You are not assigned to any class yet'},
                status=400
            )

        # Get all ClassSubject records for student's class
        class_subjects = ClassSubject.objects.filter(
            academic_class=student.class_assigned
        ).select_related('subject')

        # Optional filter by subject
        subject_id_filter = request.GET.get('subject_id')
        if subject_id_filter:
            class_subjects = class_subjects.filter(subject__id=subject_id_filter)

        # Get all doubts for these class_subjects
        doubts = Doubt.objects.filter(
            class_subject__in=class_subjects          # ✅ correct field
        ).select_related(
            'student',
            'class_subject__subject',                 # ✅ correct chain
            'class_subject__academic_class',
        ).prefetch_related(
            'replies__replied_by'                     # ✅ correct related_name
        ).order_by('-created_at')

        doubts_data = []
        for doubt in doubts:
            # Build replies
            replies_data = []
            for reply in doubt.replies.all():         # ✅ correct related_name
                replies_data.append({
                    'id':        reply.id,
                    'text':      reply.reply_text,    # ✅ correct field
                    'image_url': request.build_absolute_uri(reply.reply_image.url)
                                 if reply.reply_image else None,  # ✅ correct field
                    'user': {
                        'name':      reply.replied_by.get_full_name() or
                                     reply.replied_by.username,   # ✅ correct field
                        'role':      reply.replied_by.role,
                        'unique_id': reply.replied_by.unique_id,
                    },
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
                })

            doubts_data.append({
                'id':        doubt.id,
                'text':      doubt.doubt_text,        # ✅ correct field
                'image_url': request.build_absolute_uri(doubt.doubt_image.url)
                             if doubt.doubt_image else None,  # ✅ correct field
                'subject': {
                    'id':   doubt.class_subject.subject.id,    # ✅ via class_subject
                    'name': doubt.class_subject.subject.name,
                },
                'student': {
                    'id':        doubt.student.id,
                    'name':      doubt.student.get_full_name() or
                                 doubt.student.username,
                    'unique_id': doubt.student.unique_id,
                    'is_me':     doubt.student.id == student.id,
                },
                'status':      doubt.status,
                'reply_count': len(replies_data),
                'replies':     replies_data,
                'created_at':  doubt.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        return Response(doubts_data, status=200)


# ══════════════════════════════════════════════════════════════
#  CREATE a new doubt
#  POST /api/students/doubts/create/
# ══════════════════════════════════════════════════════════════

class StudentCreateDoubtView(APIView):
    """
    Student posts a new doubt by selecting a subject from their class.
    Requires: subject_id (AcademicSubject.id), text or image
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        if not is_student(request.user):
            return Response({'error': 'Student access required'}, status=403)

        student = request.user

        if not student.class_assigned:
            return Response(
                {'error': 'You are not assigned to any class yet'},
                status=400
            )

        subject_id = request.data.get('subject_id')
        text       = request.data.get('text', '').strip()
        image      = request.FILES.get('image')

        if not subject_id:
            return Response({'error': 'Please select a subject'}, status=400)
        if not text and not image:
            return Response(
                {'error': 'Please enter your doubt or attach an image'},
                status=400
            )

        # Get ClassSubject — validates subject belongs to student's class
        try:
            class_subject = ClassSubject.objects.select_related(
                'subject', 'academic_class'
            ).get(
                subject__id=subject_id,
                academic_class=student.class_assigned   # ✅ student's class
            )
        except ClassSubject.DoesNotExist:
            return Response(
                {'error': 'This subject is not available for your class'},
                status=400
            )

        # Create the doubt using correct field names
        doubt = Doubt.objects.create(
            student=student,
            class_subject=class_subject,    # ✅ correct field (NOT subject=)
            doubt_text=text,                # ✅ correct field
            doubt_image=image or None,      # ✅ correct field
            status='pending',
        )

        # ── Notify assigned teacher ───────────────────────────────
        try:
            from academics.models import TeacherAssignment
            from admin_tasks.models import send_notification
            assignment = TeacherAssignment.objects.select_related(
                'teacher'
            ).filter(class_subject=class_subject).first()
            if assignment:
                send_notification(
                    recipient_user=assignment.teacher,
                    title='📚 New Doubt Posted',
                    message=(
                        f"{student.get_full_name() or student.username} posted a doubt "
                        f"in {class_subject.subject.name} "
                        f"({class_subject.academic_class.name}): "
                        f'"{text[:100]}{"..." if len(text) > 100 else ""}"'
                    ),
                    created_by=student,
                )
        except Exception:
            pass  # Never block doubt creation if notification fails
        # ─────────────────────────────────────────────────────────

        return Response({
            'message': 'Doubt posted successfully!',
            'doubt': {
                'id':      doubt.id,
                'text':    doubt.doubt_text,
                'subject': {
                    'id':   class_subject.subject.id,
                    'name': class_subject.subject.name,
                },
                'status':     doubt.status,
                'created_at': doubt.created_at.strftime('%Y-%m-%d %H:%M'),
            }
        }, status=201)


# ══════════════════════════════════════════════════════════════
#  REPLY to a doubt
#  POST /api/students/doubts/<doubt_id>/reply/
# ══════════════════════════════════════════════════════════════

class StudentDoubtReplyView(APIView):
    """
    Student or teacher replies to a doubt.
    Students can only reply to doubts in their own class.
    Teacher replies auto-mark doubt as 'answered'.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, doubt_id):
        user = request.user

        if user.role not in ['student', 'teacher']:
            return Response({'error': 'Access denied'}, status=403)

        text  = request.data.get('text', '').strip()
        image = request.FILES.get('image')

        if not text and not image:
            return Response(
                {'error': 'Please enter a reply or attach an image'},
                status=400
            )

        try:
            doubt = Doubt.objects.select_related(
                'class_subject__subject',
                'class_subject__academic_class',
                'student'
            ).get(id=doubt_id)
        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found'}, status=404)

        # Students can only reply to doubts in their own class
        if user.role == 'student':
            if not user.class_assigned:
                return Response(
                    {'error': 'You are not assigned to any class'},
                    status=400
                )
            if doubt.class_subject.academic_class != user.class_assigned:
                return Response(
                    {'error': 'You can only reply to doubts from your class'},
                    status=403
                )

        reply = DoubtReply.objects.create(
            doubt=doubt,
            replied_by=user,          # ✅ correct field
            reply_text=text,          # ✅ correct field
            reply_image=image or None,# ✅ correct field
        )

        # Auto-mark as answered when teacher replies
        if user.role == 'teacher':
            doubt.status = 'answered'
            doubt.save()

        # ── Notify the student who posted the doubt ───────────────
        try:
            from admin_tasks.models import send_notification
            if doubt.student != user:  # Don't notify yourself
                role_label = 'Teacher' if user.role == 'teacher' else 'Classmate'
                send_notification(
                    recipient_user=doubt.student,
                    title='💬 New Reply to Your Doubt',
                    message=(
                        f"{role_label} {user.get_full_name() or user.username} replied: "
                        f'"{text[:100]}{"..." if len(text) > 100 else ""}"'
                    ),
                    created_by=user,
                )
        except Exception:
            pass
        # ─────────────────────────────────────────────────────────

        return Response({
            'message': 'Reply posted successfully!',
            'reply': {
                'id':   reply.id,
                'text': reply.reply_text,
                'user': {
                    'name': user.get_full_name() or user.username,
                    'role': user.role,
                },
                'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
            }
        }, status=201)


























