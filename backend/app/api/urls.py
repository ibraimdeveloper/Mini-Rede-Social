from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    # Autenticação
    register, login, logout, profile,
    # OAuth 42
    oauth_42_login, oauth_42_callback,
    # OAuth GitHub
    oauth_github_login, oauth_github_callback,
    # Password
    change_password,
    # Utilizadores
    user_profile, edit_profile, update_avatar,
    user_detail, list_friends, search_users,
    add_friend, remove_friend, block_user, unblock_user,
)

urlpatterns = [
    # Autenticação
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Gestão de Password
    path('password/change/', change_password, name='change_password'),
    
    # OAuth 42
    path('42/', oauth_42_login, name='oauth_42_login'),
    path('42/callback/', oauth_42_callback, name='oauth_42_callback'),

    # OAuth GitHub
    path('github/', oauth_github_login, name='oauth_github_login'),
    path('github/callback/', oauth_github_callback, name='oauth_github_callback'),
    
    #-------------------------------------------------------------------------------------------

    # Perfil
    path('profile/me/', user_profile, name='user_profile'),
    path('profile/edit/', edit_profile, name='edit_profile'),
    path('profile/avatar/', update_avatar, name='update_avatar'),

    # Utilizadores
    path('users/search/', search_users, name='search_users'),
    path('users/<int:user_id>/', user_detail, name='user_detail'),
    path('users/friends/', list_friends, name='list_friends'),
    path('users/<int:user_id>/add-friend/', add_friend, name='add_friend'),
    path('users/<int:user_id>/remove-friend/', remove_friend, name='remove_friend'),
    path('users/<int:user_id>/block/', block_user, name='block_user'),
    path('users/<int:user_id>/unblock/', unblock_user, name='unblock_user'),
]
