from rest_framework import serializers
from .models import Avis, AvisReport
from apps.commerces.models import Commerce


# =========================================================
# 🏷️ COMMERCE LIGHT (pour affichage dans avis)
# =========================================================

class CommerceLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commerce
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
        ]


# =========================================================
# ⭐ AVIS (READ)
# =========================================================

class AvisSerializer(serializers.ModelSerializer):
    commerce = CommerceLightSerializer(read_only=True)

    # affichage texte du prix
    price_label = serializers.CharField(
        source="get_price_rating_display",
        read_only=True
    )

    class Meta:
        model = Avis
        fields = [
            "id",
            "uuid",

            "commerce",

            "note",
            "price_rating",
            "price_label",

            "commentaire",
            "user_name",

            "likes",
            "dislikes",

            "is_reported",

            "created_at",
        ]


# =========================================================
# ✍️ CREATE / WRITE
# =========================================================

class AvisCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avis
        fields = [
            "commerce",
            "note",
            "price_rating",
            "commentaire",
            "user_name",
        ]

    # ⭐ Validation note
    def validate_note(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Note doit être entre 1 et 5")
        return value

    # 💰 Validation prix
    def validate_price_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rapport prix invalide")
        return value

    # 🔐 Validation commerce
    def validate_commerce(self, value):
        if not value.is_active or value.is_deleted:
            raise serializers.ValidationError("Commerce indisponible")
        return value


# =========================================================
# ✏️ UPDATE (optionnel V1)
# =========================================================

class AvisUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avis
        fields = [
            "note",
            "price_rating",
            "commentaire",
        ]


# =========================================================
# 👍 LIKE / DISLIKE
# =========================================================

class AvisReactionSerializer(serializers.ModelSerializer):
    action = serializers.ChoiceField(choices=["like", "dislike"])

    class Meta:
        model = Avis
        fields = ["action"]

    def update(self, instance, validated_data):
        action = validated_data.get("action")

        if action == "like":
            instance.likes += 1
        elif action == "dislike":
            instance.dislikes += 1

        instance.save(update_fields=["likes", "dislikes"])
        return instance


# =========================================================
# 🚨 REPORT
# =========================================================

class AvisReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvisReport
        fields = [
            "avis",
            "reason",
            "description",
        ]

    def create(self, validated_data):
        report = super().create(validated_data)

        # marquer l’avis comme signalé
        avis = validated_data["avis"]
        avis.is_reported = True
        avis.save(update_fields=["is_reported"])

        return report


# =========================================================
# 📊 STATS (pour IA ou frontend)
# =========================================================

class AvisStatsSerializer(serializers.Serializer):
    """
    Serializer non lié à un modèle (data calculée)
    """

    average_rating = serializers.FloatField()
    average_price_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()

    rating_distribution = serializers.DictField()