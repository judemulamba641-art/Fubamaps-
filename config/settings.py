import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 🔐 Sécurité
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me-in-production")

# 🔥 DEV forcé (évite tous les bugs actuels)
DEBUG = True

# 🔥 Autorise tout en dev
ALLOWED_HOSTS = ["*"]

# 📦 Applications
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",

    # Apps projet
    "apps.core",
    "apps.users",
    "apps.commerces",
    "apps.avis",
]

# 🧱 Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",  # ON GARDE
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

# 🧩 Templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# 🗄️ Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# 🔑 Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
]

# 🌍 Internationalisation
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Kinshasa"

USE_I18N = True
USE_TZ = True

# 📂 Static
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# 🔌 DRF
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

# 🔐 JWT
from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# Custom user model
AUTH_USER_MODEL = "users.User"

# 🌐 CORS
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# 🔐 CSRF FIX (🔥 le cœur du problème)
CSRF_TRUSTED_ORIGINS = [
    "https://ideal-journey-jj6jxg9pwqqw3q6xj-8000.app.github.dev/",
    "https://*.github.dev",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "https://localhost:8000"
]

# 🔥 IMPORTANT (corrige Codespaces)
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE =True

CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_DOMAIN = None

# 🔑 Default field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
