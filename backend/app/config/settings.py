
# DJANGO SETTINGS - ft_transcendense
# Carrega variáveis de ambiente do .env

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent.parent
load_dotenv(ROOT_DIR / '.env')

# === CONFIGURAÇÕES BÁSICAS ===
# Chave secreta (única e privada em produção)
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-ydk)t82c_$^(@4m6s_w4w1695msd$g5x*uiyz5d_@wj8g)zur1'
)

# DEBUG mode (True = desenvolvimento, False = produção)
DEBUG = os.environ.get('DJANGO_DEBUG', 'False').lower() == 'true'

# Hosts permitidos (carregados de .env)
raw_hosts = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,backend')
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "backend",
    "frontend"
]

# === APLICAÇÕES INSTALADAS ===

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.authentication.CustomJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        # Defaults (can be overridden per-scope)
        'anon': '100/hour',
        'user': '1000/hour',
        # custom scopes used in views
        'register': '5/hour',
        'login': '10/minute',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

INSTALLED_APPS = [

    'daphne',
    'channels',      
    # JWT (segurança de tokens)
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    
    # Django padrão
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Terceiros
    'rest_framework',  # API REST
    'corsheaders',     # CORS (frontend)
    
    # Projeto
    'api',
    'chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# === BASE DE DADOS ===

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB'),
        'USER': os.environ.get('POSTGRES_USER'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
        'HOST': os.environ.get('POSTGRES_HOST', 'db'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# === VALIDAÇÃO DE PASSWORDS ===
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# === INTERNACIONALIZAÇÃO ===
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# === FICHEIROS ESTÁTICOS E MEDIA ===
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# === CORS (Frontend pode fazer requests) ===
CORS_ALLOWED_ORIGINS = [
    "https://localhost:8443",
    "https://localhost",
    "https://127.0.0.1:8443",
    "https://127.0.0.1",
    "https://frontend:5173",
]
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# === CSRF (Cross-Site Request Forgery Protection) ===
CSRF_TRUSTED_ORIGINS = [
    "https://localhost:8443",
    "https://localhost",
    "https://127.0.0.1:8443",
    "https://127.0.0.1",
]

# === MODELO DE UTILIZADOR PERSONALIZADO ===
AUTH_USER_MODEL = 'api.User'

# === FRONTEND URL (para links em emails) ===
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://localhost:5173')


# === WEBSOCKETS ===
ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.environ.get('REDIS_URL', 'redis://redis:6379')],
        },
    },
}