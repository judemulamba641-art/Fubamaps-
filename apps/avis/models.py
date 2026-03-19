from django.db import models
from apps.commerces.models import Commerce
from apps.core.models import TimeStampedModel
import uuid


# =========================================================
# 💰 CHOIX RAPPORT QUALITÉ / PRIX
# =========================================================

class PriceRating(models.IntegerChoices):
    VERY_EXPENSIVE = 1, "Très cher"
    EXPENSIVE = 2, "Cher"
    NORMAL = 3, "Normal"
    CHEAP = 4, "Bon marché"
    VERY_CHEAP = 5, "Très bon marché"


# =========================================================
# ⭐ AVIS
# =========================================================

class Avis(TimeStampedModel):
    """
    Avis utilisateur sur un commerce
    """

    id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # 🔗 Relation
    commerce = models.ForeignKey(
        Commerce,
        on_delete=models.CASCADE,
        related_name="avis"
    )

    # ⭐ Note globale
    note = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)]
    )

    # 💰 Rapport prix
    price_rating = models.PositiveSmallIntegerField(
        choices=PriceRating.choices,
        default=PriceRating.NORMAL
    )

    # 📝 Commentaire
    commentaire = models.TextField(blank=True)

    # 👤 Infos utilisateur (simple V1)
    user_name = models.CharField(max_length=100, blank=True)

    # 👍 Engagement (préparer futur)
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)

    # 🔐 Modération
    is_active = models.BooleanField(default=True)
    is_reported = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["commerce"]),
            models.Index(fields=["note"]),
            models.Index(fields=["price_rating"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.commerce.name} - {self.note}⭐"


# =========================================================
# 🚨 SIGNALEMENT (MODÉRATION)
# =========================================================

class AvisReport(TimeStampedModel):
    """
    Signalement d’un avis (spam, abus, faux avis)
    """

    REASON_CHOICES = [
        ("spam", "Spam"),
        ("fake", "Faux avis"),
        ("abuse", "Contenu abusif"),
        ("other", "Autre"),
    ]

    avis = models.ForeignKey(
        Avis,
        on_delete=models.CASCADE,
        related_name="reports"
    )

    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True)

    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Report {self.avis_id} - {self.reason}"