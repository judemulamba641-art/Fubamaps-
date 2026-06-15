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


def parse_geo_params(request):
    """Extract common geo/filter query params from a request."""
    return {
        "lat": request.GET.get("lat"),
        "lng": request.GET.get("lng"),
        "radius": float(request.GET.get("radius", 5)),
        "category": request.GET.get("category"),
        "type_id": request.GET.get("type"),
    }


# =========================================================
# 📍 COMMERCE LIST + FILTER
# =========================================================


class CommerceListView(APIView):
    """
    GET /api/commerces/
    POST /api/commerces/
    """

    def get(self, request):
        geo = parse_geo_params(request)
        sort_by = request.GET.get("sort", "smart")

        if geo["lat"] and geo["lng"]:
            commerces = get_nearby_commerces(
                user_lat=float(geo["lat"]),
                user_lon=float(geo["lng"]),
                radius_km=geo["radius"],
                category_id=geo["category"],
                type_id=geo["type_id"],
                sort_by=sort_by,
            )
        else:
            commerces = Commerce.objects.active_with_relations()

        serializer = CommerceSerializer(
            commerces,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):
        serializer = CommerceCreateUpdateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        commerce = serializer.save()

        result = CommerceSerializer(commerce).data

        return Response(
            result,
            status=status.HTTP_201_CREATED
        )


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
# 🗑️ DELETE (SOFT DELETE)
# =========================================================


class CommerceDeleteView(APIView):
    """
    DELETE /api/commerces/{id}/delete/
    """

    def delete(self, request, id):
        commerce = get_object_or_404(
            Commerce,
            id=id,
            is_deleted=False
        )

        # 🔥 soft delete propre
        commerce.soft_delete()

        return Response(
            {"message": "Commerce supprimé"},
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# 🗺️ NEARBY
# =========================================================


class NearbyCommerceView(APIView):
    """
    GET /api/commerces/nearby/
    """

    def get(self, request):
        geo = parse_geo_params(request)

        if not geo["lat"] or not geo["lng"]:
            return Response(
                {"error": "lat et lng requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        commerces = get_nearby_commerces(
            user_lat=float(geo["lat"]),
            user_lon=float(geo["lng"]),
            radius_km=geo["radius"],
            category_id=geo["category"],
            type_id=geo["type_id"],
        )

        serializer = CommerceSerializer(
            commerces,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# 🗺️ MAP
# =========================================================


class CommerceMapView(APIView):
    """
    GET /api/commerces/map/
    """

    def get(self, request):
        commerces = Commerce.objects.active_with_relations()

        serializer = CommerceMapSerializer(
            commerces,
            many=True
        )

        return Response(serializer.data)


# =========================================================
# 📊 BY CATEGORY
# =========================================================


class CommerceByCategoryView(APIView):
    """
    GET /api/commerces/by-category/
    """

    def get(self, request):
        commerces = Commerce.objects.active_with_relations()

        serializer = CommerceByCategorySerializer(
            commerces,
            many=True
        )

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
    serializer_class = CommerceTypeSerializer

    def get_queryset(self):
        queryset = (
            CommerceType.objects
            .select_related("category")
            .filter(is_active=True, is_deleted=False)
        )

        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        return queryset


class CommerceTypeDetailView(generics.RetrieveAPIView):
    serializer_class = CommerceTypeSerializer

    lookup_field = "id"

    def get_queryset(self):
        return (
            CommerceType.objects
            .select_related("category")
            .filter(is_active=True, is_deleted=False)
        )
