# notifications/utils.py
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone


def push_notification_to_user(user_id, title, message, notification_id=None):
    """
    Call this from any Django view to instantly push a notification
    to a specific user's browser — no refresh needed!
    
    Usage:
        from notifications.utils import push_notification_to_user
        push_notification_to_user(user.id, "New Reply", "Someone replied to your doubt")
    """
    channel_layer = get_channel_layer()
    group_name = f'user_{user_id}'

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'send_notification',
            'title': title,
            'message': message,
            'notification_id': notification_id,
            'created_at': timezone.now().isoformat(),
        }
    )


def push_unread_count(user_id, count):
    """Push updated unread count badge to user"""
    channel_layer = get_channel_layer()
    group_name = f'user_{user_id}'

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'unread_count_update',
            'count': count,
        }
    )