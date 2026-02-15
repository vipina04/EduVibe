# teachers/notifications.py
"""
Teacher Notification System for Doubts
EduVibe Platform - 2026
Sends notifications to teachers when students ask doubts in their subjects
"""

from admin_tasks.models import Notification
from users.models import CustomUser
from .models import TeacherAssignment


def notify_teachers_about_doubt(doubt):
    """
    Send notifications to all teachers who teach this subject in this class.
    
    Args:
        doubt: Doubt object that was just created
    
    Returns:
        int: Number of teachers notified
    """
    # Get student's class
    student_class = doubt.student.class_assigned
    
    if not student_class:
        return 0
    
    # Find all teachers assigned to teach this subject in this class
    teacher_assignments = TeacherAssignment.objects.filter(
        class_assigned=student_class,
        subject=doubt.subject
    ).select_related('teacher')
    
    notifications_created = 0
    
    for assignment in teacher_assignments:
        teacher = assignment.teacher
        
        # Create notification for this teacher
        message = (
            f"New doubt in {doubt.subject.name} from "
            f"{doubt.student.get_full_name() or doubt.student.username} "
            f"(Class {student_class.name})"
        )
        
        Notification.objects.create(
            user=teacher,
            message=message,
            notification_type='doubt'
        )
        
        notifications_created += 1
    
    return notifications_created


def notify_about_doubt_reply(doubt_reply):
    """
    Notify the original student when someone replies to their doubt.
    Also notify other participants in the doubt thread.
    
    Args:
        doubt_reply: DoubtReply object that was just created
    
    Returns:
        int: Number of users notified
    """
    doubt = doubt_reply.doubt
    notifications_created = 0
    
    # Notify the original student (doubt asker)
    if doubt.student != doubt_reply.user:
        replier_name = doubt_reply.user.get_full_name() or doubt_reply.user.username
        replier_role = "Teacher" if doubt_reply.user.role == 'teacher' else "Student"
        
        message = (
            f"{replier_role} {replier_name} replied to your doubt "
            f"in {doubt.subject.name}"
        )
        
        Notification.objects.create(
            user=doubt.student,
            message=message,
            notification_type='doubt_reply'
        )
        
        notifications_created += 1
    
    return notifications_created