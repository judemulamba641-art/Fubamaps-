from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # 🔧 Admin Django
    path('admin/', admin.site.urls),

    # 📡 API Fubamaps
    path('api/commerces/', include('apps.commerces.urls')),
    path('api/avis/', include('apps.avis.urls')),

    # (optionnel plus tard)
    # path('api/ai/', include('apps.ai.urls')),
]