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
from ..serializers import UserS


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_42_login(request):
    """Redireciona o utilizador para a página de login da 42."""
    client_id = os.getenv('OAUTH_42_CLIENT_ID')
    redirect_uri = os.getenv('OAUTH_42_REDIRECT_URI')
    url = (
        f"https://api.intra.42.fr/oauth/authorize"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
    )
    return Response({'url': url})


@api_view(['GET'])
@permission_classes([AllowAny])
def oauth_42_callback(request):
    """Recebe o código da 42 e devolve o JWT."""
    code = request.GET.get('code')
    if not code:
        return Response({'error': 'Código não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)

    client_id = os.getenv('OAUTH_42_CLIENT_ID')
    client_secret = os.getenv('OAUTH_42_CLIENT_SECRET')
    redirect_uri = os.getenv('OAUTH_42_REDIRECT_URI')

    if not all([client_id, client_secret, redirect_uri]):
        return Response(
            {'error': 'Variáveis de ambiente OAuth 42 não configuradas.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Troca o código por um token de acesso
    token_response = http_requests.post(
        'https://api.intra.42.fr/oauth/token',
        data={
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
        },
        headers={'Accept': 'application/json'},
    )

    if token_response.status_code != 200:
        error_detail = None
        try:
            error_detail = token_response.json()
        except ValueError:
            error_detail = token_response.text
        return Response(
            {
                'error': 'Erro ao obter token da 42.',
                'details': error_detail,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    access_token = token_response.json().get('access_token')
    if not access_token:
        return Response(
            {'error': 'Token de acesso não retornado pela 42.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Busca os dados do utilizador na API da 42
    user_response = http_requests.get(
        'https://api.intra.42.fr/v2/me',
        headers={'Authorization': f'Bearer {access_token}'}
    )

    if user_response.status_code != 200:
        return Response({'error': 'Erro ao obter dados do utilizador.'}, status=status.HTTP_400_BAD_REQUEST)

    data = user_response.json()
    email = data.get('email')
    username = data.get('login')
    avatar_url = data.get('image', {}).get('link', '')

    # Cria ou obtém o utilizador — só preenche na primeira vez
    user = User.objects.filter(email=email).first()
    created = False

    if not user:
        try:
            user = User.objects.create(
                email=email,
                username=username,
            )
            user.set_unusable_password()
            created = True
        except IntegrityError:
            frontend_url = os.getenv('FRONTEND_URL', 'https://localhost:8443').rstrip('/')
            redirect_url = (
                f"{frontend_url}/auth/42/callback?error={quote('Já existe uma conta com esse email ou nome de usuário.')}"
            )
            return redirect(redirect_url)

    if created:
        if avatar_url:
            # Guarda o URL do avatar da 42
            user.avatar_url_42 = avatar_url
    else:
        if avatar_url and not user.avatar_url_42:
            user.avatar_url_42 = avatar_url

    user.is_online = True
    user.save()

    # Devolve JWT e redireciona para o frontend com os tokens no hash
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    frontend_url = os.getenv('FRONTEND_URL', 'https://localhost:8443').rstrip('/')
    redirect_url = (
        f"{frontend_url}/auth/42/callback#access={access_token}&refresh={refresh_token}"
    )
    return redirect(redirect_url)
