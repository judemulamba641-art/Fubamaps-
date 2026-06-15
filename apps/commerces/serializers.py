from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import Commerce, Category, CommerceType
from apps.core.validators import normalize_phone_number, validate_latitude, validate_longitude


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
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    type = serializers.PrimaryKeyRelatedField(
        queryset=CommerceType.objects.select_related("category").all()
    )

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
        if not validate_latitude(value):
            raise serializers.ValidationError("Latitude invalide")
        return value

    def validate_longitude(self, value):
        if not validate_longitude(value):
            raise serializers.ValidationError("Longitude invalide")
        return value

    def validate_phone(self, value):
        return normalize_phone_number(value)

    def validate(self, data):
        instance = getattr(self, "instance", None)
        category = data.get("category") or getattr(instance, "category", None)
        commerce_type = data.get("type") or getattr(instance, "type", None)

        if category is None:
            raise serializers.ValidationError({
                "category": "Une catégorie valide est requise."
            })

        if commerce_type is None:
            raise serializers.ValidationError({
                "type": "Un type de commerce valide est requis."
            })

        if commerce_type.category_id != category.id:
            raise serializers.ValidationError({
                "type": "Le type sélectionné ne correspond pas à la catégorie."
            })

        latitude = data.get("latitude", getattr(instance, "latitude", None))
        longitude = data.get("longitude", getattr(instance, "longitude", None))

        if latitude is None or longitude is None:
            raise serializers.ValidationError({
                "latitude": "Latitude requise.",
                "longitude": "Longitude requise.",
            })

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

    def create(self, validated_data):
        commerce = Commerce(**validated_data)

        try:
            commerce.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        commerce.save()
        return commerce

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        instance.save()
        return instance


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
