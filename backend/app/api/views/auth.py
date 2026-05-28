from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone

from ..serializers import RegisterS, UserS
from ..models import User
from ..throttles import RegisterRateThrottle, LoginRateThrottle


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([RegisterRateThrottle])
def register(request):
    """Registro de novo utilizador."""
    serializer = RegisterS(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserS(user, context={'request': request}).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login(request):
    """Login de utilizador."""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Credenciais inválidas.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'user': UserS(user, context={'request': request}).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Obtém o perfil do utilizador autenticado."""
    return Response(UserS(request.user, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout de utilizador - invalida o token registando o timestamp."""
    try:
        # Registra o timestamp do logout para invalidar tokens antigos
        user = request.user
        user.last_logout_at = timezone.now()
        user.presence_connections = 0
        user.is_online = False
        user.save(update_fields=['last_logout_at', 'presence_connections', 'is_online'])
        
        return Response({'message': 'Logout efetuado com sucesso.'})
    except Exception as e:
        return Response(
            {'error': f'Erro ao fazer logout: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
