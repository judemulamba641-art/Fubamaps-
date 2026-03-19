from rest_framework import serializers
from .models import Commerce, Category, CommerceType


# =========================================================
# 🏷️ CATEGORY
# =========================================================

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "uuid",
            "name",
            "icon",
        ]


# =========================================================
# 🧩 TYPE
# =========================================================

class CommerceTypeSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = CommerceType
        fields = [
            "id",
            "uuid",
            "name",
            "category",
        ]


# =========================================================
# 📍 COMMERCE (READ - pour frontend / carte)
# =========================================================

class CommerceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    type = CommerceTypeSerializer(read_only=True)

    # ⭐ Champs calculés
    distance = serializers.SerializerMethodField()
    rating = serializers.FloatField(source="average_rating", read_only=True)

    class Meta:
        model = Commerce
        fields = [
            "id",
            "uuid",
            "name",
            "description",

            "category",
            "type",

            "latitude",
            "longitude",
            "address",

            "rating",
            "distance",

            "phone",
            "opening_hours",

            "created_at",
        ]

    def get_distance(self, obj):
        """
        Récupère la distance calculée dans la vue
        """
        return getattr(obj, "distance", None)


# =========================================================
# ✍️ CREATE / UPDATE (WRITE)
# =========================================================

class CommerceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commerce
        fields = [
            "name",
            "description",
            "category",
            "type",
            "latitude",
            "longitude",
            "address",
            "phone",
            "opening_hours",
        ]

    # 🔐 Validation GPS
    def validate_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude invalide")
        return value

    def validate_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude invalide")
        return value


# =========================================================
# 🗺️ VERSION LÉGÈRE (mobile / map optimisation)
# =========================================================

class CommerceMapSerializer(serializers.ModelSerializer):
    """
    Version ultra légère pour Google Maps
    """

    class Meta:
        model = Commerce
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
            "average_rating",
        ]


# =========================================================
# 📊 LISTE PAR CATÉGORIE (pour cercles map)
# =========================================================

class CommerceByCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name")

    class Meta:
        model = Commerce
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
            "category_name",
        ]