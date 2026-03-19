from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics

from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count

from apps.commerces.models import Commerce
from .models import Avis, AvisReport
from .serializers import (
    AvisSerializer,
    AvisCreateSerializer,
    AvisUpdateSerializer,
    AvisReactionSerializer,
    AvisReportSerializer,
    AvisStatsSerializer,
)
from .services import create_review, get_filtered_reviews


# =========================================================
# ✍️ CREATE AVIS
# =========================================================

class AvisCreateView(APIView):
    """
    POST /api/avis/
    """

    def post(self, request):
        serializer = AvisCreateSerializer(data=request.data)

        if serializer.is_valid():
            review = create_review(serializer.validated_data)

            return Response(
                AvisSerializer(review).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================================================
# ✏️ UPDATE AVIS
# =========================================================

class AvisUpdateView(generics.UpdateAPIView):
    """
    PUT /api/avis/{id}/update/
    """
    queryset = Avis.objects.filter(is_active=True)
    serializer_class = AvisUpdateSerializer
    lookup_field = "id"


# =========================================================
# 🗑️ DELETE (SOFT)
# =========================================================

class AvisDeleteView(APIView):
    """
    DELETE /api/avis/{id}/delete/
    """

    def delete(self, request, id):
        avis = get_object_or_404(Avis, id=id, is_active=True)

        avis.is_active = False
        avis.save(update_fields=["is_active"])

        return Response(
            {"message": "Avis supprimé"},
            status=status.HTTP_204_NO_CONTENT
        )


# =========================================================
# 📊 LISTE AVIS PAR COMMERCE (FILTRABLE)
# =========================================================

class CommerceAvisListView(APIView):
    """
    GET /api/avis/commerce/{id}/
    """

    def get(self, request, commerce_id):
        commerce = get_object_or_404(Commerce, id=commerce_id)

        min_note = request.GET.get("min_note")
        price_rating = request.GET.get("price_rating")

        avis = get_filtered_reviews(commerce, min_note)

        # filtre prix
        if price_rating:
            avis = avis.filter(price_rating=price_rating)

        serializer = AvisSerializer(avis, many=True)

        return Response(serializer.data)


# =========================================================
# 📈 STATS (ULTRA IMPORTANT POUR IA)
# =========================================================

class AvisStatsView(APIView):
    """
    GET /api/avis/commerce/{id}/stats/
    """

    def get(self, request, commerce_id):
        commerce = get_object_or_404(Commerce, id=commerce_id)

        avis = commerce.avis.filter(is_active=True)

        # moyennes
        stats = avis.aggregate(
            average_rating=Avg("note"),
            average_price_rating=Avg("price_rating"),
            total_reviews=Count("id"),
        )

        # distribution des notes
        distribution = {
            i: avis.filter(note=i).count() for i in range(1, 6)
        }

        data = {
            "average_rating": round(stats["average_rating"] or 0, 2),
            "average_price_rating": round(stats["average_price_rating"] or 0, 2),
            "total_reviews": stats["total_reviews"],
            "rating_distribution": distribution,
        }

        serializer = AvisStatsSerializer(data)

        return Response(serializer.data)


# =========================================================
# 👍 LIKE / DISLIKE
# =========================================================

class AvisReactionView(APIView):
    """
    POST /api/avis/{id}/react/
    """

    def post(self, request, id):
        avis = get_object_or_404(Avis, id=id, is_active=True)

        serializer = AvisReactionSerializer(avis, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Réaction enregistrée"})

        return Response(serializer.errors, status=400)


# =========================================================
# 🚨 REPORT AVIS
# =========================================================

class AvisReportView(APIView):
    """
    POST /api/avis/{id}/report/
    """

    def post(self, request, id):
        avis = get_object_or_404(Avis, id=id)

        data = request.data.copy()
        data["avis"] = avis.id

        serializer = AvisReportSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Avis signalé"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=400)