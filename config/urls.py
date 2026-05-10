from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include


def index(request):
    return HttpResponse("Bonjour ! Le backend Django fonctionne correctement.")


urlpatterns = [
    # 🏠 racine
    path("", index, name="index"),
    # 🔧 Admin Django
    path("admin/", admin.site.urls),
    # 📡 API Fubamaps
    path("api/commerces/", include("apps.commerces.urls")),
    path("api/avis/", include("apps.avis.urls")),
    # (optionnel plus tard)
    # path('api/ai/', include('apps.ai.urls')),
]
