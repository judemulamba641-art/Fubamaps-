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
# 📍 COMMERCE (READ)
# =========================================================

class CommerceSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    type = CommerceTypeSerializer(read_only=True)

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
        return getattr(obj, "distance", None)


# =========================================================
# ✍️ CREATE / UPDATE
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

    def validate_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude invalide")
        return value

    def validate_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude invalide")
        return value

    def validate(self, data):
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        instance = getattr(self, "instance", None)

        queryset = Commerce.objects.filter(
            latitude__range=(latitude - 0.0001, latitude + 0.0001),
            longitude__range=(longitude - 0.0001, longitude + 0.0001),
            is_deleted=False
        )

        if instance:
            queryset = queryset.exclude(id=instance.id)

        if queryset.exists():
            raise serializers.ValidationError({
                "error": "Un commerce existe déjà à cet emplacement"
            })

        return data


# =========================================================
# 🗺️ MAP
# =========================================================

class CommerceMapSerializer(serializers.ModelSerializer):
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
# 📊 BY CATEGORY
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
