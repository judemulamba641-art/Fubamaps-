from django.urls import path
from . import views

urlpatterns = [

    # =========================================================
    # 📍 COMMERCE (CRUD)
    # =========================================================

    # Liste + recherche + filtres (distance, catégorie, type)
    path('', views.CommerceListView.as_view(), name='commerce-list'),

    # Création d’un commerce
    path('create/', views.CommerceCreateView.as_view(), name='commerce-create'),

    # Détail d’un commerce
    path('<int:id>/', views.CommerceDetailView.as_view(), name='commerce-detail'),

    # Mise à jour
    path('<int:id>/update/', views.CommerceUpdateView.as_view(), name='commerce-update'),

    # Suppression (soft delete)
    path('<int:id>/delete/', views.CommerceDeleteView.as_view(), name='commerce-delete'),


    # =========================================================
    # 🗺️ MAP / GEO
    # =========================================================

    # Commerces proches (géolocalisation)
    path('nearby/', views.NearbyCommerceView.as_view(), name='commerce-nearby'),

    # Version optimisée pour Google Maps (light)
    path('map/', views.CommerceMapView.as_view(), name='commerce-map'),

    # Commerces groupés par catégorie (pour cercles map)
    path('by-category/', views.CommerceByCategoryView.as_view(), name='commerce-by-category'),


    # =========================================================
    # 🏷️ CATÉGORIES
    # =========================================================

    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:id>/', views.CategoryDetailView.as_view(), name='category-detail'),


    # =========================================================
    # 🧩 TYPES
    # =========================================================

    path('types/', views.CommerceTypeListView.as_view(), name='type-list'),
    path('types/<int:id>/', views.CommerceTypeDetailView.as_view(), name='type-detail'),
]