"""
WSGI config for Fubamaps project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

# 🔐 Définir le settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 🚀 Application WSGI
application = get_wsgi_application()