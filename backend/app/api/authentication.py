from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.utils.timezone import datetime, make_aware


class CustomJWTAuthentication(JWTAuthentication):
    """
    Autenticação JWT customizada que invalida tokens após logout.
    Verifica se o token foi emitido antes de um possível logout do utilizador.
    """
    
    def authenticate(self, request):
        # Obtém o resultado da autenticação JWT padrão
        result = super().authenticate(request)
        
        if result is None:
            return None
        
        user, validated_token = result
        
        # Verifica se o utilizador fez logout
        if user.last_logout_at:
            # Obtém o timestamp 'iat' (issued at) do token JWT
            token_issued_at = make_aware(datetime.fromtimestamp(validated_token['iat']))
            
            # Se o token foi emitido antes do logout, é inválido
            if token_issued_at < user.last_logout_at:
                raise AuthenticationFailed('Token expirado após logout.')
        
        return user, validated_token
