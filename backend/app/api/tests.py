from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from io import BytesIO
from PIL import Image

User = get_user_model()


class AvatarUpdateTestCase(TestCase):
    def setUp(self):
        """Preparar o ambiente de teste."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def create_test_image(self, filename='test_avatar.png'):
        """Criar uma imagem de teste."""
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        return SimpleUploadedFile(filename, img_io.read(), content_type='image/png')

    def test_update_avatar_success(self):
        """Teste de atualizar avatar com sucesso."""
        image = self.create_test_image()
        response = self.client.patch(
            '/api/auth/profile/avatar/',
            {'avatar': image},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('avatar', response.data)

    def test_update_avatar_no_file(self):
        """Teste de atualizar avatar sem enviar ficheiro."""
        response = self.client.patch(
            '/api/auth/profile/avatar/',
            {}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_update_avatar_unauthenticated(self):
        """Teste sem autenticação."""
        self.client.force_authenticate(user=None)
        image = self.create_test_image()
        response = self.client.patch(
            '/api/auth/profile/avatar/',
            {'avatar': image},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
