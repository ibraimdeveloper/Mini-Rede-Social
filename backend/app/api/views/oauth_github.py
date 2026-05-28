from django.db import IntegrityError
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

import requests as http_requests
import os
from urllib.parse import quote

from ..models import User


def _get_github_email(access_token):
    email_response = http_requests.get(
        'https://api.github.com/user/emails',
        headers={
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/vnd.github+json',
        },
    )
    if email_response.status_code != 200:
        return None

    emails = email_response.json()
    primary = next((item for item in emails if item.get('primary') and item.get('verified')), None)
    if primary:
        return primary.get('email')

    first_verified = next((item for item in emails if item.get('verified')), None)
    return first_verified.get('email') if first_verified else None


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_github_login(request):
    client_id = os.getenv('GITHUB_CLIENT_ID')
    redirect_uri = os.getenv('GITHUB_REDIRECT_URI')
    url = (
        'https://github.com/login/oauth/authorize'
        f'?client_id={client_id}'
        f'&redirect_uri={redirect_uri}'
        '&scope=user:email'
        '&allow_signup=true'
    )
    return Response({'url': url})


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_github_callback(request):
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'Código não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)

    client_id = os.getenv('GITHUB_CLIENT_ID')
    client_secret = os.getenv('GITHUB_CLIENT_SECRET')
    redirect_uri = os.getenv('GITHUB_REDIRECT_URI')

    if not all([client_id, client_secret, redirect_uri]):
        return Response(
            {'error': 'Variáveis de ambiente GitHub OAuth não configuradas.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    token_response = http_requests.post(
        'https://github.com/login/oauth/access_token',
        data={
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
        },
        headers={'Accept': 'application/json'},
    )

    if token_response.status_code != 200:
        return Response(
            {'error': 'Erro ao obter token do GitHub.', 'details': token_response.text},
            status=status.HTTP_400_BAD_REQUEST,
        )

    access_token = token_response.json().get('access_token')
    if not access_token:
        return Response(
            {'error': 'Token de acesso não retornado pelo GitHub.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user_response = http_requests.get(
        'https://api.github.com/user',
        headers={
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/vnd.github+json',
        },
    )

    if user_response.status_code != 200:
        return Response({'error': 'Erro ao obter dados do utilizador no GitHub.'}, status=status.HTTP_400_BAD_REQUEST)

    data = user_response.json()
    email = data.get('email') or _get_github_email(access_token)
    username = data.get('login')
    avatar_url = data.get('avatar_url')

    if not email:
        return Response(
            {'error': 'Email não disponível do GitHub.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email=email).first()
    created = False

    if not user:
        try:
            user = User.objects.create(
                email=email,
                username=username or email.split('@')[0],
            )
            user.set_unusable_password()
            created = True
        except IntegrityError:
            frontend_url = os.getenv('FRONTEND_URL', 'https://localhost:8443').rstrip('/')
            redirect_url = (
                f"{frontend_url}/auth/github/callback?error={quote('Já existe uma conta com esse email ou nome de usuário.')}"
            )
            return redirect(redirect_url)

    if avatar_url and not user.avatar_url_42:
        user.avatar_url_42 = avatar_url

    user.is_online = True
    user.save()

    refresh = RefreshToken.for_user(user)
    access_token_jwt = str(refresh.access_token)
    refresh_token_jwt = str(refresh)

    frontend_url = os.getenv('FRONTEND_URL', 'https://localhost:8443').rstrip('/')
    redirect_url = (
        f"{frontend_url}/auth/github/callback#access={access_token_jwt}&refresh={refresh_token_jwt}"
    )
    return redirect(redirect_url)
