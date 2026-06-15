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
    path("api/users/", include("apps.users.urls")),
    path("api/commerces/", include("apps.commerces.urls")),
    path("api/avis/", include("apps.avis.urls")),
]
