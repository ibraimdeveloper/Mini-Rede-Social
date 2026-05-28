# VIEWS DE GESTÃO DE PASSWORD
# - change_password: Altera password autenticado

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


# ============= CHANGE PASSWORD =============
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    # POST /api/auth/password/change/ (autenticado)
    # Campos: old_password, new_password, confirm_password
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    # Validações
    if not old_password or not new_password or not confirm_password:
        return Response(
            {'error': 'Todos os campos são obrigatórios.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verifica a password antiga
    if not user.check_password(old_password):
        return Response(
            {'error': 'Password antiga incorreta.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Verifica se as novas passwords coincidem
    if new_password != confirm_password:
        return Response(
            {'error': 'As novas passwords não coincidem.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Valida a nova password
    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return Response(
            {'error': list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Atualiza a password
    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password alterada com sucesso.'})
