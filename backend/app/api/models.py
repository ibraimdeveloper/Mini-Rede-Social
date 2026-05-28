from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    avatar_url_42 = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, max_length=500)
    is_online = models.BooleanField(default=False)
    presence_connections = models.PositiveIntegerField(default=0)
    last_logout_at = models.DateTimeField(null=True, blank=True)  # Rastreia último logout
    friends = models.ManyToManyField(
        'self',
        symmetrical=True,
        related_name='friend_of',
        blank=True
    )
    blocked_users = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='blocked_by',
        blank=True
    )
    def __str__(self):
        return self.username
