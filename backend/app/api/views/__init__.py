"""
Views para autenticação, OAuth, gestão de password e utilizadores.
"""
from .auth import register, login, logout, profile
from .oauth42 import oauth_42_login, oauth_42_callback
from .oauth_github import oauth_github_login, oauth_github_callback
from .password import change_password
from .user import (
    user_profile,
    edit_profile,
    update_avatar,
    user_detail,
    list_friends,
    add_friend,
    remove_friend,
    block_user,
    unblock_user,
    search_users,
)

__all__ = [
    # Autenticação
    'register',
    'login',
    'logout',
    'profile',
    # OAuth 42
    'oauth_42_login',
    'oauth_42_callback',
    # OAuth GitHub
    'oauth_github_login',
    'oauth_github_callback',
    # Password
    'change_password',
    # Utilizadores
    'user_profile',
    'edit_profile',
    'update_avatar',
    'user_detail',
    'list_friends',
    'add_friend',
    'remove_friend',
    'block_user',
    'unblock_user',
    'search_users',
]
