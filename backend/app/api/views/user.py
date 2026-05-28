from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..serializers import UserS, EditProfileS, AvatarS
from ..models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Ver o próprio perfil."""
    return Response(UserS(request.user).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def edit_profile(request):
    """Editar username, first_name, last_name e bio (parcialmente)."""
    serializer = EditProfileS(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_avatar(request):
    """Atualizar o avatar do utilizador."""
    if 'avatar' not in request.FILES:
        return Response({'error': 'Nenhuma imagem enviada.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = AvatarS(request.user, data=request.FILES, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Avatar atualizado com sucesso.', 'avatar': serializer.data['avatar']})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Ver o perfil de outro utilizador."""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(UserS(user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_friends(request):
    """Listar os amigos do utilizador autenticado."""
    friends = request.user.friends.all()
    return Response(UserS(friends, many=True, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_friend(request, user_id):
    """Adicionar um utilizador como amigo."""
    if request.user.id == user_id:
        return Response({'error': 'Não podes adicionar-te a ti próprio.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    request.user.friends.add(target)
    return Response({'message': f'{target.username} adicionado aos amigos.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_friend(request, user_id):
    """Remover um amigo."""
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    request.user.friends.remove(target)
    return Response({'message': f'{target.username} removido dos amigos.'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):
    """Bloquear um utilizador."""
    if request.user.id == user_id:
        return Response({'error': 'Não podes bloquear-te a ti próprio.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    request.user.blocked_users.add(target)
    request.user.friends.remove(target)
    return Response({'message': f'{target.username} bloqueado.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unblock_user(request, user_id):
    """Desbloquear um utilizador."""
    try:
        target = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'Utilizador não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    request.user.blocked_users.remove(target)
    return Response({'message': f'{target.username} desbloqueado.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Pesquisar utilizadores pelo username."""
    query = request.query_params.get('search', '')
    if not query:
        return Response([])
    
    users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)
    return Response(UserS(users, many=True, context={'request': request}).data)
