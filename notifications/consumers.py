# notifications/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Each logged-in user gets their own private WebSocket channel.
    Group name: user_<user_id>
    """

    async def connect(self):
        self.user = self.scope.get('user')

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Each user has their own group: "user_5", "user_12", etc.
        self.group_name = f'user_{self.user.id}'

        # Join the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Send unread notification count immediately on connect
        count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': count
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle messages from frontend (e.g., mark as read)"""
        data = json.loads(text_data)

        if data.get('action') == 'mark_read':
            await self.mark_notifications_read()
            await self.send(text_data=json.dumps({
                'type': 'unread_count',
                'count': 0
            }))

    # ── Called by Django views to PUSH to this user ──────────────────
    async def send_notification(self, event):
        """Receives from channel layer, sends to WebSocket client"""
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'title': event['title'],
            'message': event['message'],
            'notification_id': event.get('notification_id'),
            'created_at': event.get('created_at'),
        }))

    async def unread_count_update(self, event):
        """Push updated unread count"""
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': event['count']
        }))

    @database_sync_to_async
    def get_unread_count(self):
        from admin_tasks.models import Notification
        return Notification.objects.filter(
            user=self.user,
            is_read=False
        ).count()

    @database_sync_to_async
    def mark_notifications_read(self):
        from admin_tasks.models import Notification
        Notification.objects.filter(
            user=self.user,
            is_read=False
        ).update(is_read=True)