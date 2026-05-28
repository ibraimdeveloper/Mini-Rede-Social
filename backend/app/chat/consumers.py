import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Conversation, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope['user']

        if isinstance(self.user, AnonymousUser):
            print('[WS] Ligação rejeitada — utilizador não autenticado')
            await self.close()
            return

        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f'chat_{self.chat_id}'

        belongs = await self.user_belongs_to_conversation()
        if not belongs:
            print(f'[WS] {self.user.username} não pertence à conversa {self.chat_id}')
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Ao conectar, marca as mensagens não lidas como lidas e notifica o emissor
        read_ids = await self.mark_messages_as_read()
        if read_ids:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type'       : 'messages_read',
                    'reader_id'  : self.user.id,
                    'message_ids': read_ids,
                }
            )

        print(f'[WS] {self.user.username} conectado à sala {self.chat_id}')

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f'[WS] {self.user.username} desconectado da sala {self.chat_id}')

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get('message', '').strip()

        if not message_content:
            return

        message = await self.save_message(message_content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type'      : 'chat_message',
                'message'   : message_content,
                'sender'    : self.user.username,
                'sender_id' : self.user.id,
                'timestamp' : message.timestamp.isoformat(),
                'message_id': message.id,
                'is_read'   : False,
            }
        )

        payload = await self.build_direct_message_payload(message)
        recipient_ids = await self.get_other_participant_ids()
        for recipient_id in recipient_ids:
            await self.channel_layer.group_send(
                f'user_{recipient_id}',
                {
                    'type'   : 'direct_message',
                    'payload': payload,
                }
            )

        # Notifica na sala de chat que o remetente está online
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type'           : 'sender_online',
                'sender_id'      : self.user.id,
                'sender_name'    : self.user.first_name or self.user.username,
                'sender_username': self.user.username,
                'sender_avatar'  : self.user.avatar.url if self.user.avatar else self.user.avatar_url_42 or '',
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message'   : event['message'],
            'sender'    : event['sender'],
            'sender_id' : event['sender_id'],
            'timestamp' : event['timestamp'],
            'message_id': event['message_id'],
            'is_read'   : event.get('is_read', False),
            'file_url'  : event.get('file_url', ''),
            'file_name' : event.get('file_name', ''),
        }))

    async def messages_read(self, event):
        """Notifica todos na sala que certas mensagens foram lidas."""
        await self.send(text_data=json.dumps({
            'type'       : 'messages_read',
            'reader_id'  : event['reader_id'],
            'message_ids': event['message_ids'],
        }))

    async def sender_online(self, event):
        """Notifica que o remetente está online."""
        await self.send(text_data=json.dumps({
            'type'           : 'sender_online',
            'sender_id'      : event['sender_id'],
            'sender_name'    : event['sender_name'],
            'sender_username': event['sender_username'],
            'sender_avatar'  : event['sender_avatar'],
        }))

    async def message_deleted(self, event):
        """Notifica que uma mensagem foi apagada para todos."""
        await self.send(text_data=json.dumps({
            'type'      : 'message_deleted',
            'message_id': event['message_id'],
        }))

    # ─── Métodos auxiliares ───────────────────────────────────────────────────

    @database_sync_to_async
    def user_belongs_to_conversation(self):
        try:
            conversation = Conversation.objects.get(id=self.chat_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        conversation = Conversation.objects.get(id=self.chat_id)
        return Message.objects.create(
            conversation=conversation,
            sender=self.user,
            content=content
        )

    @database_sync_to_async
    def mark_messages_as_read(self):
        messages = Message.objects.filter(
            conversation_id=self.chat_id,
            is_read=False,
        ).exclude(sender=self.user)
        ids = list(messages.values_list('id', flat=True))
        if ids:
            messages.update(is_read=True)
        return ids

    @database_sync_to_async
    def get_other_participant_ids(self):
        return list(
            Conversation.objects.get(id=self.chat_id)
            .participants.exclude(id=self.user.id)
            .values_list('id', flat=True)
        )

    @database_sync_to_async
    def build_direct_message_payload(self, message):
        avatar_url = self.user.avatar.url if self.user.avatar else ''
        return {
            'type'           : 'direct_message',
            'conversation_id': message.conversation_id,
            'message_id'     : message.id,
            'message'        : message.content or '',
            'file_name'      : message.file_name or '',
            'timestamp'      : message.timestamp.isoformat(),
            'sender_id'      : self.user.id,
            'sender_username': self.user.username,
            'sender_name'    : self.user.first_name or self.user.username,
            'sender_avatar'  : avatar_url,
        }


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        self.user_group_name = f'user_{self.user.id}'
        await self.channel_layer.group_add(self.user_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data or '{}')
        if data.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))

    async def direct_message(self, event):
        await self.send(text_data=json.dumps(event['payload']))

    async def message_deleted(self, event):
        """Recebe delete via canal pessoal (user_<id>) quando fora da conversa."""
        await self.send(text_data=json.dumps({
            'type'      : 'message_deleted',
            'message_id': event['message_id'],
        }))


class PresenceConsumer(AsyncWebsocketConsumer):
    presence_group_name = 'presence'

    async def connect(self):
        self.user = self.scope['user']

        if isinstance(self.user, AnonymousUser):
            print('[WS] Presença rejeitada — utilizador não autenticado')
            await self.close()
            return

        await self.channel_layer.group_add(
            self.presence_group_name,
            self.channel_name
        )
        await self.accept()

        became_online = await self.increment_presence_connections()
        if became_online:
            await self.broadcast_presence(True)

        print(f'[WS] Presença conectada para {self.user.username}')

    async def disconnect(self, close_code):
        if hasattr(self, 'channel_name'):
            await self.channel_layer.group_discard(
                self.presence_group_name,
                self.channel_name
            )

        if hasattr(self, 'user') and not isinstance(self.user, AnonymousUser):
            became_offline = await self.decrement_presence_connections()
            if became_offline:
                await self.broadcast_presence(False)
            print(f'[WS] Presença desconectada para {self.user.username}')

    async def receive(self, text_data):
        data = json.loads(text_data or '{}')
        if data.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            'type'     : 'presence_update',
            'user_id'  : event['user_id'],
            'is_online': event['is_online'],
        }))

    async def broadcast_presence(self, is_online: bool):
        await self.channel_layer.group_send(
            self.presence_group_name,
            {
                'type'     : 'presence_update',
                'user_id'  : self.user.id,
                'is_online': is_online,
            }
        )

    @database_sync_to_async
    def increment_presence_connections(self):
        with transaction.atomic():
            user = User.objects.select_for_update().get(id=self.user.id)
            user.presence_connections += 1
            user.is_online = True
            user.save(update_fields=['presence_connections', 'is_online'])
        self.user.refresh_from_db(fields=['presence_connections', 'is_online'])
        return self.user.presence_connections == 1

    @database_sync_to_async
    def decrement_presence_connections(self):
        with transaction.atomic():
            user = User.objects.select_for_update().get(id=self.user.id)
            user.presence_connections = max(user.presence_connections - 1, 0)
            user.is_online = user.presence_connections > 0
            user.save(update_fields=['presence_connections', 'is_online'])
            new_count = user.presence_connections
        self.user.refresh_from_db(fields=['presence_connections', 'is_online'])
        return new_count == 0