from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

User = get_user_model()


def notify_direct_message(channel_layer, conversation, message, sender):
    avatar_url = sender.avatar.url if sender.avatar else sender.avatar_url_42 or ''
    payload = {
        'type'           : 'direct_message',
        'conversation_id': conversation.id,
        'message_id'     : message.id,
        'message'        : message.content or '',
        'file_name'      : message.file_name or '',
        'timestamp'      : message.timestamp.isoformat(),
        'sender_id'      : sender.id,
        'sender_username': sender.username,
        'sender_name'    : sender.first_name or sender.username,
        'sender_avatar'  : avatar_url,
    }
    recipient_ids = conversation.participants.exclude(id=sender.id).values_list('id', flat=True)
    for recipient_id in recipient_ids:
        async_to_sync(channel_layer.group_send)(
            f'user_{recipient_id}',
            {
                'type'   : 'direct_message',
                'payload': payload,
            }
        )


class ConversationListView(APIView):
    """
    GET  → lista todas as conversas do utilizador autenticado
    POST → cria uma nova conversa com outro utilizador
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            participants=request.user
        ).prefetch_related('participants', 'messages')

        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request):
        other_user_id = request.data.get('user_id')

        if not other_user_id:
            return Response(
                {'error': 'user_id é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilizador não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        if other_user == request.user:
            return Response(
                {'error': 'Não podes criar uma conversa contigo próprio'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        ).first()

        if existing:
            serializer = ConversationSerializer(existing, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageListView(APIView):
    """
    GET → busca o histórico de mensagens de uma conversa.
    Filtra automaticamente as mensagens apagadas pelo utilizador atual.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversa não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Marca como lidas
        conversation.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        ).update(is_read=True)

        # Exclui mensagens que o utilizador apagou só para si
        messages = conversation.messages.select_related('sender').exclude(
            deleted_by=request.user
        )

        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)


class FileUploadView(APIView):
    """
    POST → envia um ficheiro (e opcionalmente texto) numa conversa.
    Aceita: multipart/form-data com campos 'file' e 'content' (opcional)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=request.user
            )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversa não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MessageSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        message = serializer.save(
            sender=request.user,
            conversation=conversation,
            file_name=request.FILES['file'].name if 'file' in request.FILES else ''
        )

        message_data = MessageSerializer(message, context={'request': request}).data

        channel_layer = get_channel_layer()

        # Notifica a sala do chat (receptor dentro da conversa)
        async_to_sync(channel_layer.group_send)(
            f'chat_{conversation_id}',
            {
                'type'      : 'chat_message',
                'message'   : message_data.get('content') or '',
                'sender'    : request.user.username,
                'sender_id' : request.user.id,
                'timestamp' : message.timestamp.isoformat(),
                'message_id': message.id,
                'file_url'  : message_data.get('file_url') or '',
                'file_name' : message_data.get('file_name') or '',
            }
        )

        # Notifica via canal pessoal (receptor fora da conversa)
        notify_direct_message(channel_layer, conversation, message, request.user)

        return Response(message_data, status=status.HTTP_201_CREATED)


class MessageDeleteView(APIView):
    """
    DELETE /messages/<message_id>/?for_everyone=true|false

    for_everyone=true  → apaga para todos (só o remetente pode fazê-lo)
    for_everyone=false → apaga só para mim (qualquer participante da conversa)
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return Response(
                {'error': 'Mensagem não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Garante que o utilizador é participante da conversa
        if not message.conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'Sem permissão'},
                status=status.HTTP_403_FORBIDDEN
            )

        for_everyone = request.query_params.get('for_everyone', 'false').lower() == 'true'

        if for_everyone:
            # Só o remetente pode apagar para todos
            if message.sender != request.user:
                return Response(
                    {'error': 'Só o remetente pode apagar para todos'},
                    status=status.HTTP_403_FORBIDDEN
                )

            conversation = message.conversation
            conversation_id = conversation.id

            # Remove o ficheiro do disco se existir
            if message.file:
                message.file.delete(save=False)

            message.delete()

            channel_layer = get_channel_layer()

            # 1) Notifica quem está DENTRO da conversa (sala chat_<id>)
            async_to_sync(channel_layer.group_send)(
                f'chat_{conversation_id}',
                {
                    'type'      : 'message_deleted',
                    'message_id': message_id,
                }
            )

            # 2) Notifica quem está FORA da conversa (canal pessoal user_<id>)
            other_ids = conversation.participants.exclude(
                id=request.user.id
            ).values_list('id', flat=True)

            for uid in other_ids:
                async_to_sync(channel_layer.group_send)(
                    f'user_{uid}',
                    {
                        'type'      : 'message_deleted',
                        'message_id': message_id,
                    }
                )

            return Response({'deleted': 'for_everyone'}, status=status.HTTP_200_OK)

        else:
            # Apaga só para mim — regista no campo deleted_by
            message.deleted_by.add(request.user)
            return Response({'deleted': 'for_me'}, status=status.HTTP_200_OK)