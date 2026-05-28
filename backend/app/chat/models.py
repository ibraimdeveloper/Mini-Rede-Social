from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Conversation(models.Model):
    """
    Representa uma conversa privada entre 2 utilizadores.
    """
    participants = models.ManyToManyField(
        User,
        related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        names = ', '.join([u.username for u in self.participants.all()])
        return f'Conversa entre: {names}'


def message_upload_path(instance, filename):
    return f'chat/user_{instance.sender.id}/{filename}'


class Message(models.Model):
    """
    Representa uma mensagem dentro de uma conversa.
    Pode ser texto, ficheiro, ou ambos.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    content   = models.TextField(blank=True)
    file      = models.FileField(upload_to=message_upload_path, null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read   = models.BooleanField(default=False)

    # Utilizadores que apagaram a mensagem só para si
    deleted_by = models.ManyToManyField(
        User,
        blank=True,
        related_name='deleted_messages'
    )

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:50]}'