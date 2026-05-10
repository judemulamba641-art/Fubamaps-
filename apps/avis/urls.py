from django.urls import path
from . import views

urlpatterns = [
    # =========================================================
    # get
    path("", views.get_avis),
    # ✍️ AVIS (CRUD SIMPLE)
    # =========================================================
    # Ajouter un avis
    path("create", views.AvisCreateView.as_view(), name="avis-create"),
    # Modifier un avis
    path("<int:id>/update/", views.AvisUpdateView.as_view(), name="avis-update"),
    # Supprimer (soft delete)
    path("<int:id>/delete/", views.AvisDeleteView.as_view(), name="avis-delete"),
    # =========================================================
    # 📊 AVIS PAR COMMERCE
    # =========================================================
    # Liste des avis d’un commerce
    path(
        "commerce/<int:commerce_id>/",
        views.CommerceAvisListView.as_view(),
        name="commerce-avis",
    ),
    # Stats d’un commerce (IA + frontend)
    path(
        "commerce/<int:commerce_id>/stats/",
        views.AvisStatsView.as_view(),
        name="avis-stats",
    ),
    # =========================================================
    # 👍 INTERACTIONS
    # =========================================================
    # Like / Dislike
    path("<int:id>/react/", views.AvisReactionView.as_view(), name="avis-react"),
    # =========================================================
    # 🚨 MODÉRATION
    # =========================================================
    # Signaler un avis
    path("<int:id>/report/", views.AvisReportView.as_view(), name="avis-report"),
]
