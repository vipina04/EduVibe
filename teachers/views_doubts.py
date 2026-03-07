# teachers/views_doubts.py
"""
Doubt Management Views for Teachers
EduVibe Platform - 2026
Uses academics.TeacherAssignment with class_subject FK (confirmed from shell)
TeacherAssignment fields: id, teacher, class_subject, created_at
ClassSubject fields: id, subject, academic_class, created_at
Doubt fields: id, student, class_subject, doubt_text, doubt_image, status, created_at
DoubtReply fields: id, doubt, replied_by, reply_text, reply_image, created_at
"""

from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from academics.models import ClassSubject, TeacherAssignment, Doubt, DoubtReply


def is_teacher(user):
    return user.is_authenticated and user.role == 'teacher'


# ═══════════════════════════════════════════════════════════
#  FUNCTION-BASED VIEWS (used by urls.py)
# ═══════════════════════════════════════════════════════════

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_assigned_classes(request):
    """
    GET /api/teachers/teacher-assigned-classes/
    Returns all classes+subjects the teacher is assigned to teach.
    Groups by class for easy display.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        # TeacherAssignment → class_subject → subject + academic_class
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user
        ).select_related(
            'class_subject__subject',
            'class_subject__academic_class',
        )

        # Group by class
        classes_map = {}
        for a in assignments:
            cls = a.class_subject.academic_class
            subj = a.class_subject.subject

            if cls.id not in classes_map:
                classes_map[cls.id] = {
                    'id':       cls.id,
                    'name':     cls.name,
                    'subjects': []
                }

            classes_map[cls.id]['subjects'].append({
                'id':                 subj.id,
                'name':               subj.name,
                'class_subject_id':   a.class_subject.id,
                'assignment_id':      a.id,
            })

        return Response({
            'success': True,
            'classes': list(classes_map.values())
        }, status=200)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_assigned_subjects(request):
    """
    GET /api/teachers/teacher-assigned-subjects/
    Returns flat list of all subject+class combos assigned to teacher.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        assignments = TeacherAssignment.objects.filter(
            teacher=request.user
        ).select_related(
            'class_subject__subject',
            'class_subject__academic_class',
        )

        subjects_data = [{
            'assignment_id':    a.id,
            'class_subject_id': a.class_subject.id,
            'subject_id':       a.class_subject.subject.id,
            'subject_name':     a.class_subject.subject.name,
            'class_id':         a.class_subject.academic_class.id,
            'class_name':       a.class_subject.academic_class.name,
        } for a in assignments]

        return Response({'success': True, 'subjects': subjects_data}, status=200)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_doubts(request):
    """
    GET /api/teachers/teacher-doubts/?class_id=X&subject_id=Y
    Returns doubts for teacher's assigned class-subject.
    Teacher can only see doubts for subjects they teach.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        class_id   = request.GET.get('class_id')
        subject_id = request.GET.get('subject_id')

        # Get all class_subjects assigned to this teacher
        assigned_cs_ids = TeacherAssignment.objects.filter(
            teacher=request.user
        ).values_list('class_subject_id', flat=True)

        # Base queryset — only doubts in teacher's assigned class-subjects
        doubts = Doubt.objects.filter(
            class_subject__id__in=assigned_cs_ids
        ).select_related(
            'student',
            'class_subject__subject',
            'class_subject__academic_class',
        ).prefetch_related('replies__replied_by').order_by('-created_at')

        # Optional filters
        if class_id:
            doubts = doubts.filter(class_subject__academic_class__id=class_id)
        if subject_id:
            doubts = doubts.filter(class_subject__subject__id=subject_id)

        doubts_data = []
        for doubt in doubts:
            replies_data = [{
                'id':              reply.id,
                'reply_text':      reply.reply_text,
                'reply_image':     request.build_absolute_uri(reply.reply_image.url)
                                   if reply.reply_image else None,
                'replied_by_name': reply.replied_by.get_full_name() or reply.replied_by.username,
                'replied_by_role': reply.replied_by.role,
                'created_at':      reply.created_at.strftime('%Y-%m-%d %H:%M'),
            } for reply in doubt.replies.all()]

            doubts_data.append({
                'id':           doubt.id,
                'doubt_text':   doubt.doubt_text,
                'doubt_image':  request.build_absolute_uri(doubt.doubt_image.url)
                                if doubt.doubt_image else None,
                'subject': {
                    'id':   doubt.class_subject.subject.id,
                    'name': doubt.class_subject.subject.name,
                },
                'class': {
                    'id':   doubt.class_subject.academic_class.id,
                    'name': doubt.class_subject.academic_class.name,
                },
                'student': {
                    'id':        doubt.student.id,
                    'name':      doubt.student.get_full_name() or doubt.student.username,
                    'unique_id': doubt.student.unique_id,
                },
                'status':      doubt.status,
                'reply_count': len(replies_data),
                'replies':     replies_data,
                'created_at':  doubt.created_at.strftime('%Y-%m-%d %H:%M'),
            })

        return Response({'success': True, 'doubts': doubts_data}, status=200)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_to_doubt(request, doubt_id):
    """
    POST /api/teachers/teacher-doubts/<doubt_id>/reply/
    Teacher replies to a doubt.
    Security: teacher must be assigned to that class-subject.
    Auto-marks doubt as 'answered'.
    """
    if not is_teacher(request.user):
        return Response({'error': 'Teacher access required'}, status=403)

    try:
        doubt = Doubt.objects.select_related(
            'class_subject__subject',
            'class_subject__academic_class',
        ).get(id=doubt_id)

        # Security check — teacher must be assigned to this class-subject
        is_assigned = TeacherAssignment.objects.filter(
            teacher=request.user,
            class_subject=doubt.class_subject
        ).exists()

        if not is_assigned:
            return Response({
                'error': 'You are not assigned to teach this subject in this class'
            }, status=403)

        reply_text  = request.data.get('reply_text', '').strip()
        reply_image = request.FILES.get('reply_image')

        if not reply_text and not reply_image:
            return Response({'error': 'reply_text or reply_image is required'}, status=400)

        reply = DoubtReply.objects.create(
            doubt=doubt,
            replied_by=request.user,
            reply_text=reply_text,
            reply_image=reply_image or None,
        )

        # Mark as answered
        # doubt.status = 'answered'
        # doubt.save()
        
        doubt.status = 'answered'
        doubt.save()

        # ── Notify student ────────────────────────────────────────
        # try:
        #     from admin_tasks.models import send_notification
        #     send_notification(
        #         recipient_user=doubt.student,
        #         title='✅ Teacher Replied to Your Doubt',
        #         message=(
        #             f"Teacher {request.user.get_full_name() or request.user.username} "
        #             f"answered your doubt in "
        #             f"{doubt.class_subject.subject.name} "
        #             f"({doubt.class_subject.academic_class.name}): "
        #             f'"{reply_text[:100]}{"..." if len(reply_text) > 100 else ""}"'
        #         ),
        #         created_by=request.user,
        #     )
        # except Exception:
        # ── DB Notification + Real-time WebSocket Push ────────────────
        try:
            from admin_tasks.models import send_notification
            from notifications.utils import push_notification_to_user

            notif_message = (
                f"Teacher {request.user.get_full_name() or request.user.username} "
                f"answered your doubt in "
                f"{doubt.class_subject.subject.name} "
                f"({doubt.class_subject.academic_class.name})"
            )

            # Save to DB
            send_notification(
                recipient_user=doubt.student,
                title='✅ Teacher Replied to Your Doubt',
                message=notif_message,
                created_by=request.user,
            )

            # Push real-time to student's browser instantly
            push_notification_to_user(
                user_id=doubt.student.id,
                title='✅ Teacher Replied to Your Doubt',
                message=notif_message,
            )
        except Exception as ws_err:
            print(f"[WS Push] Doubt reply push failed (non-critical): {ws_err}")
        # ─────────────────────────────────────────────────────────────
            pass
        # ─────────────────────────────────────────────────────────
        

        return Response({
            'success': True,
            'message': 'Reply posted successfully!',
            'reply': {
                'id':          reply.id,
                'reply_text':  reply.reply_text,
                'replied_by':  request.user.get_full_name() or request.user.username,
                'created_at':  reply.created_at.strftime('%Y-%m-%d %H:%M'),
            }
        }, status=201)

    except Doubt.DoesNotExist:
        return Response({'error': 'Doubt not found'}, status=404)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


# ═══════════════════════════════════════════════════════════
#  CLASS-BASED VIEWS (kept for compatibility with urls.py)
# ═══════════════════════════════════════════════════════════

class DoubtListView(APIView):
    """
    GET /api/teachers/doubts/
    Lists all doubts for teacher's assigned subjects.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_teacher(request.user):
            return Response({'error': 'Teacher access required'}, status=403)

        assigned_cs_ids = TeacherAssignment.objects.filter(
            teacher=request.user
        ).values_list('class_subject_id', flat=True)

        if not assigned_cs_ids:
            return Response({
                'message': 'You are not assigned to any subjects yet.',
                'doubts': [], 'total_count': 0
            }, status=200)

        doubts = Doubt.objects.filter(
            class_subject__id__in=assigned_cs_ids
        ).select_related(
            'student',
            'class_subject__subject',
            'class_subject__academic_class',
        ).prefetch_related('replies__replied_by').order_by('-created_at')

        doubts_data = []
        for doubt in doubts:
            replies_data = [{
                'id':              r.id,
                'replied_by_name': r.replied_by.get_full_name() or r.replied_by.username,
                'replied_by_role': r.replied_by.role,
                'reply_text':      r.reply_text,
                'reply_image':     request.build_absolute_uri(r.reply_image.url) if r.reply_image else None,
                'created_at':      r.created_at.strftime('%Y-%m-%d %H:%M'),
            } for r in doubt.replies.all()]

            doubts_data.append({
                'id':          doubt.id,
                'student_name': doubt.student.get_full_name() or doubt.student.username,
                'subject_name': doubt.class_subject.subject.name,
                'class_name':   doubt.class_subject.academic_class.name,
                'doubt_text':   doubt.doubt_text,
                'doubt_image':  request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
                'status':       doubt.status,
                'created_at':   doubt.created_at.strftime('%Y-%m-%d %H:%M'),
                'replies':      replies_data,
            })

        return Response({'doubts': doubts_data, 'total_count': len(doubts_data)}, status=200)


class DoubtDetailView(APIView):
    """GET /api/teachers/doubts/<doubt_id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, doubt_id):
        if not is_teacher(request.user):
            return Response({'error': 'Teacher access required'}, status=403)
        try:
            doubt = Doubt.objects.select_related(
                'student', 'class_subject__subject', 'class_subject__academic_class'
            ).get(id=doubt_id)

            replies_data = [{
                'id':              r.id,
                'replied_by_name': r.replied_by.get_full_name() or r.replied_by.username,
                'replied_by_role': r.replied_by.role,
                'reply_text':      r.reply_text,
                'reply_image':     request.build_absolute_uri(r.reply_image.url) if r.reply_image else None,
                'created_at':      r.created_at.strftime('%Y-%m-%d %H:%M'),
            } for r in doubt.replies.all()]

            return Response({
                'id':           doubt.id,
                'student_name': doubt.student.get_full_name() or doubt.student.username,
                'subject_name': doubt.class_subject.subject.name,
                'class_name':   doubt.class_subject.academic_class.name,
                'doubt_text':   doubt.doubt_text,
                'doubt_image':  request.build_absolute_uri(doubt.doubt_image.url) if doubt.doubt_image else None,
                'status':       doubt.status,
                'created_at':   doubt.created_at.strftime('%Y-%m-%d %H:%M'),
                'replies':      replies_data,
            }, status=200)

        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found'}, status=404)


# class DoubtReplyCreateView(APIView):
#     """POST /api/teachers/doubts/<doubt_id>/reply/"""
#     permission_classes = [IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser, JSONParser]

#     def post(self, request, doubt_id):
#         if not is_teacher(request.user):
#             return Response({'error': 'Teacher access required'}, status=403)
#         try:
#             doubt = Doubt.objects.get(id=doubt_id)

#             # Security: teacher must be assigned to this class-subject
#             if not TeacherAssignment.objects.filter(
#                 teacher=request.user,
#                 class_subject=doubt.class_subject
#             ).exists():
#                 return Response({'error': 'Not assigned to this subject'}, status=403)

#             reply_text  = request.data.get('reply_text', '').strip()
#             reply_image = request.FILES.get('reply_image')

#             if not reply_text and not reply_image:
#                 return Response({'error': 'reply_text or reply_image required'}, status=400)

#             reply = DoubtReply.objects.create(
#                 doubt=doubt,
#                 replied_by=request.user,
#                 reply_text=reply_text,
#                 reply_image=reply_image or None,
#             )

#             doubt.status = 'answered'
#             doubt.save()
            
    

#         # ── Notify student ────────────────────────────────────────
#         try:
#             from admin_tasks.models import send_notification
#             send_notification(
#                 recipient_user=doubt.student,
#                 title='✅ Teacher Replied to Your Doubt',
#                 message=(
#                     f"Teacher {request.user.get_full_name() or request.user.username} "
#                     f"answered your doubt in "
#                     f"{doubt.class_subject.subject.name} "
#                     f"({doubt.class_subject.academic_class.name}): "
#                     f'"{reply_text[:100]}{"..." if len(reply_text) > 100 else ""}"'
#                 ),
#                 created_by=request.user,
#             )
#         except Exception:
#             pass
#         # ─────────────────────────────────────────────────────────

#             return Response({
#                 'message': 'Reply added successfully!',
#                 'reply': {
#                     'id':         reply.id,
#                     'reply_text': reply.reply_text,
#                     'replied_by': request.user.get_full_name() or request.user.username,
#                     'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
#                 }
#             }, status=201)

#         except Doubt.DoesNotExist:
#             return Response({'error': 'Doubt not found'}, status=404)
class DoubtReplyCreateView(APIView):
    """POST /api/teachers/doubts/<doubt_id>/reply/"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, doubt_id):
        if not is_teacher(request.user):
            return Response({'error': 'Teacher access required'}, status=403)
        try:
            doubt = Doubt.objects.get(id=doubt_id)

            # Security: teacher must be assigned to this class-subject
            if not TeacherAssignment.objects.filter(
                teacher=request.user,
                class_subject=doubt.class_subject
            ).exists():
                return Response({'error': 'Not assigned to this subject'}, status=403)

            reply_text  = request.data.get('reply_text', '').strip()
            reply_image = request.FILES.get('reply_image')
            
            if not reply_text and not reply_image:
                return Response({'error': 'reply_text or reply_image required'}, status=400)

            reply = DoubtReply.objects.create(
                doubt=doubt,
                replied_by=request.user,
                reply_text=reply_text,
                reply_image=reply_image or None,
            )

            doubt.status = 'answered'
            doubt.save()

            # Notify student
            try:
                from admin_tasks.models import send_notification
                send_notification(
                    recipient_user=doubt.student,
                    title='✅ Teacher Replied to Your Doubt',
                    message=(
                        f"Teacher {request.user.get_full_name() or request.user.username} "
                        f"answered your doubt in "
                        f"{doubt.class_subject.subject.name} "
                        f"({doubt.class_subject.academic_class.name}): "
                        f'"{reply_text[:100]}{"..." if len(reply_text) > 100 else ""}"'
                    ),
                    created_by=request.user,
                )
            except Exception:
                pass

            return Response({
                'message': 'Reply added successfully!',
                'reply': {
                    'id':         reply.id,
                    'reply_text': reply.reply_text,
                    'replied_by': request.user.get_full_name() or request.user.username,
                    'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
                }
            }, status=201)

        except Doubt.DoesNotExist:
            return Response({'error': 'Doubt not found'}, status=404)

        #     if not reply_text and not reply_image:
        #         return Response({'error': 'reply_text or reply_image required'}, status=400)

        # #     reply = DoubtReply.objects.create(
        # #         doubt=doubt,
        # #         replied_by=request.user,
        # #         reply_text=reply_text,
        # #         reply_image=reply_image or None,
        # #     )

        # #     doubt.status = 'answered'
        # #     doubt.save()

        # #     # ── Notify student ────────────────────────────────────────
        # #     try:
        # #         from admin_tasks.models import send_notification
        # #         send_notification(
        # #             recipient_user=doubt.student,
        # #             title='✅ Teacher Replied to Your Doubt',
        # #             message=(
        # #                 f"Teacher {request.user.get_full_name() or request.user.username} "
        # #                 f"answered your doubt in "
        # #                 f"{doubt.class_subject.subject.name} "
        # #                 f"({doubt.class_subject.academic_class.name}): "
        # #                 f'"{reply_text[:100]}{"..." if len(reply_text) > 100 else ""}"'
        # #             ),
        # #             created_by=request.user,
        # #         )
        # #     except Exception:
        # #         pass
        # #     # ─────────────────────────────────────────────────────────

        # #     return Response({
        # #         'message': 'Reply added successfully!',
        # #         'reply': {
        # #             'id':         reply.id,
        # #             'reply_text': reply.reply_text,
        # #             'replied_by': request.user.get_full_name() or request.user.username,
        # #             'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
        # #         }
        # #     }, status=201)

        # # except Doubt.DoesNotExist:
        # #     return Response({'error': 'Doubt not found'}, status=404)
        # reply = DoubtReply.objects.create(
        #         doubt=doubt,
        #         replied_by=request.user,
        #         reply_text=reply_text,
        #         reply_image=reply_image or None,
        #     )

        #     doubt.status = 'answered'
        #     doubt.save()

        #     # Notify student
        #     try:
        #         from admin_tasks.models import send_notification
        #         send_notification(
        #             recipient_user=doubt.student,
        #             title='✅ Teacher Replied to Your Doubt',
        #             message=(
        #                 f"Teacher {request.user.get_full_name() or request.user.username} "
        #                 f"answered your doubt in "
        #                 f"{doubt.class_subject.subject.name} "
        #                 f"({doubt.class_subject.academic_class.name}): "
        #                 f'"{reply_text[:100]}{"..." if len(reply_text) > 100 else ""}"'
        #             ),
        #             created_by=request.user,
        #         )
        #     except Exception:
        #         pass

        #     return Response({
        #         'message': 'Reply added successfully!',
        #         'reply': {
        #             'id':         reply.id,
        #             'reply_text': reply.reply_text,
        #             'replied_by': request.user.get_full_name() or request.user.username,
        #             'created_at': reply.created_at.strftime('%Y-%m-%d %H:%M'),
        #         }
        #     }, status=201)

        # except Doubt.DoesNotExist:
        #     return Response({'error': 'Doubt not found'}, status=404)
























