from django.urls import path
from . import views

urlpatterns = [
    # GET all avis
    path("", views.get_avis),
    # CRUD
    path("create", views.AvisCreateView.as_view(), name="avis-create"),
    path("<int:id>/update/", views.AvisUpdateView.as_view(), name="avis-update"),
    path("<int:id>/delete/", views.AvisDeleteView.as_view(), name="avis-delete"),
    # Avis par commerce
    path(
        "commerce/<int:commerce_id>/",
        views.CommerceAvisListView.as_view(),
        name="commerce-avis",
    ),
    path(
        "commerce/<int:commerce_id>/stats/",
        views.AvisStatsView.as_view(),
        name="avis-stats",
    ),
    # Interactions
    path("<int:id>/react/", views.AvisReactionView.as_view(), name="avis-react"),
    # Modération
    path("<int:id>/report/", views.AvisReportView.as_view(), name="avis-report"),
    # Avis de l'utilisateur connecté
    path("me/", views.UserAvisListView.as_view(), name="avis-me"),
]
