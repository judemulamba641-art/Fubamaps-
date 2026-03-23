from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from django.shortcuts import get_object_or_404

from .models import Commerce, Category, CommerceType
from .serializers import (
    CommerceSerializer,
    CommerceCreateUpdateSerializer,
    CommerceMapSerializer,
    CommerceByCategorySerializer,
    CategorySerializer,
    CommerceTypeSerializer,
)

from .services import (
    get_nearby_commerces,
)

# =========================================================
# 📍 COMMERCE LIST + FILTER
# =========================================================

class CommerceListView(APIView):
    """
    GET (liste) /api/commerces/
    POST (création) /api/commerces/
    """

    def get(self, request):
        lat = request.GET.get("lat")
        lng = request.GET.get("lng")
        radius = request.GET.get("radius", 5)
        category = request.GET.get("category")
        type_id = request.GET.get("type")
        sort_by = request.GET.get("sort", "smart")

        # Si géolocalisation fournie → service avancé
        if lat and lng:
            commerces = get_nearby_commerces(
                user_lat=float(lat),
                user_lon=float(lng),
                radius_km=float(radius),
                category_id=category,
                type_id=type_id,
                sort_by=sort_by,
            )
        else:
            # fallback simple
            commerces = Commerce.objects.all().select_related("category", "type")

        serializer = CommerceSerializer(commerces, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CommerceCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        commerce = serializer.save()
        result = CommerceSerializer(commerce).data
        return Response(result, status=status.HTTP_201_CREATED)


# =========================================================
# ✍️ CREATE
# =========================================================

class CommerceCreateView(generics.CreateAPIView):
    """
    POST /api/commerces/create/
    """
    queryset = Commerce.objects.all()
    serializer_class = CommerceCreateUpdateSerializer


# =========================================================
# 🔍 DETAIL
# =========================================================

class CommerceDetailView(APIView):
    """
    GET /api/commerces/{id}/
    """

    def get(self, request, id):
        commerce = get_object_or_404(
            Commerce.objects.select_related("category", "type"),
            id=id
        )
        serializer = CommerceSerializer(commerce)
        return Response(serializer.data)


# =========================================================
# ✏️ UPDATE
# =========================================================

class CommerceUpdateView(generics.UpdateAPIView):
    """
    PUT /api/commerces/{id}/update/
    """
    queryset = Commerce.objects.all()
    serializer_class = CommerceCreateUpdateSerializer
    lookup_field = "id"


# =========================================================
# 🗑️ DELETE (SOFT)
# =========================================================

class CommerceDeleteView(APIView):
    """
    DELETE /api/commerces/{id}/delete/
    """

    def delete(self, request, id):
        commerce = get_object_or_404(Commerce, id=id)

        commerce.is_deleted = True
        commerce.save(update_fields=["is_deleted"])

        return Response(
            {"message": "Commerce supprimé"},
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# 🗺️ NEARBY (IMPORTANT)
# =========================================================

class NearbyCommerceView(APIView):
    """
    GET /api/commerces/nearby/
    """

    def get(self, request):
        lat = request.GET.get("lat")
        lng = request.GET.get("lng")

        if not lat or not lng:
            return Response(
                {"error": "lat et lng requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        radius = float(request.GET.get("radius", 5))
        category = request.GET.get("category")
        type_id = request.GET.get("type")

        commerces = get_nearby_commerces(
            user_lat=float(lat),
            user_lon=float(lng),
            radius_km=radius,
            category_id=category,
            type_id=type_id,
        )

        serializer = CommerceSerializer(commerces, many=True)
        return Response(serializer.data)


# =========================================================
# 🗺️ MAP (ULTRA LIGHT)
# =========================================================

class CommerceMapView(APIView):
    """
    GET /api/commerces/map/
    """

    def get(self, request):
        commerces = Commerce.objects.filter(
            is_active=True,
            is_deleted=False
        )

        serializer = CommerceMapSerializer(commerces, many=True)
        return Response(serializer.data)


# =========================================================
# 📊 BY CATEGORY (MAP CIRCLES)
# =========================================================

class CommerceByCategoryView(APIView):
    """
    GET /api/commerces/by-category/
    """

    def get(self, request):
        commerces = Commerce.objects.filter(
            is_active=True,
            is_deleted=False
        ).select_related("category")

        serializer = CommerceByCategorySerializer(commerces, many=True)
        return Response(serializer.data)


# =========================================================
# 🏷️ CATEGORY
# =========================================================

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = "id"


# =========================================================
# 🧩 TYPE
# =========================================================

class CommerceTypeListView(generics.ListAPIView):
    queryset = CommerceType.objects.select_related("category").all()
    serializer_class = CommerceTypeSerializer


class CommerceTypeDetailView(generics.RetrieveAPIView):
    queryset = CommerceType.objects.select_related("category").all()
    serializer_class = CommerceTypeSerializer
    lookup_field = "id"
