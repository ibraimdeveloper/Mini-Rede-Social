from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()

ALLOWED_EXTENSIONS = ['pdf', 'jpeg', 'jpg', 'png', 'pptx', 'docx', 'gif', 'mp4']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class UserBasicSerializer(serializers.ModelSerializer):
    """Informação básica do utilizador para mostrar no chat."""
    avatar = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'avatar', 'is_online']

    def get_avatar(self, obj):
        avatar = obj.avatar.url if obj.avatar else obj.avatar_url_42
        if not avatar:
            return None
        request = self.context.get('request')
        if request and avatar.startswith('/'):
            return request.build_absolute_uri(avatar)
        return avatar


class MessageSerializer(serializers.ModelSerializer):
    """Serializa uma mensagem completa (texto e/ou ficheiro)."""
    sender        = UserBasicSerializer(read_only=True)
    file_url      = serializers.SerializerMethodField()
    deleted_by_me = serializers.SerializerMethodField()

    class Meta:
        model  = Message
        fields = [
            'id', 'sender', 'content', 'file', 'file_url',
            'file_name', 'timestamp', 'is_read', 'deleted_by_me'
        ]
        extra_kwargs = {
            'file': {'write_only': True},
        }

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_deleted_by_me(self, obj):
        """True se o utilizador atual já apagou esta mensagem só para si."""
        request = self.context.get('request')
        if request:
            return obj.deleted_by.filter(id=request.user.id).exists()
        return False

    def validate_file(self, value):
        if value:
            ext = value.name.split('.')[-1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                raise serializers.ValidationError(
                    f'Extensão .{ext} não permitida. Permitidas: {", ".join(ALLOWED_EXTENSIONS)}'
                )
            if value.size > MAX_FILE_SIZE:
                raise serializers.ValidationError('Ficheiro demasiado grande (máx. 10MB).')
        return value

    def validate(self, data):
        has_text = bool(data.get('content', '').strip())
        has_file = data.get('file') is not None
        if not has_text and not has_file:
            raise serializers.ValidationError('A mensagem deve ter texto ou ficheiro.')
        return data


class ConversationSerializer(serializers.ModelSerializer):
    """Serializa uma conversa com participantes e última mensagem."""
    participants = UserBasicSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model  = Conversation
        fields = ['id', 'participants', 'created_at', 'last_message', 'unread_count']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {
                'content'  : last.content if last.content else f'📎 {last.file_name}',
                'sender'   : last.sender.username,
                'timestamp': last.timestamp,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request:
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        return 0