from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterS(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "As passwords não coincidem."}
            )
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password
        )
        return user


class UserS(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'avatar', 'bio', 'is_online']
        read_only_fields = ['id', 'is_online']

    def get_avatar(self, obj):
        avatar = obj.avatar.url if obj.avatar else obj.avatar_url_42
        if not avatar:
            return None
        request = self.context.get('request')
        if request and avatar.startswith('/'):
            return request.build_absolute_uri(avatar)
        return avatar


class EditProfileS(serializers.ModelSerializer):
    """Serializer para editar perfil (suporta username, nome, apellidos, bio e email)."""
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'bio']
        extra_kwargs = {
            'username': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'bio': {'required': False},
        }

    def validate_username(self, value):
        # Verifica se o username já está em uso por outro utilizador
        user = self.instance
        if User.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError('Este username já está em uso.')
        return value


class AvatarS(serializers.ModelSerializer):
    """Serializer apenas para o avatar."""
    class Meta:
        model = User
        fields = ['avatar']
