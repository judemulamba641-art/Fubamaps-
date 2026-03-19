from django.db import models
from apps.core.models import BaseModel


# =========================================================
# 🏷️ CATÉGORIES (ex: Restaurant, Boutique, Pharmacie)
# =========================================================

class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=100, blank=True, null=True)  # pour frontend (icône map)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"

    def __str__(self):
        return self.name


# =========================================================
# 🧩 TYPES (ex: Fast-food, Supermarché, Clinique)
# =========================================================

class CommerceType(BaseModel):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="types")

    class Meta:
        verbose_name = "Type de commerce"
        verbose_name_plural = "Types de commerce"
        unique_together = ("name", "category")

    def __str__(self):
        return f"{self.name} ({self.category.name})"


# =========================================================
# 📍 COMMERCE PRINCIPAL
# =========================================================

class Commerce(BaseModel):
    name = models.CharField(max_length=255)

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="commerces"
    )

    type = models.ForeignKey(
        CommerceType,
        on_delete=models.SET_NULL,
        null=True,
        related_name="commerces"
    )

    description = models.TextField(blank=True, null=True)

    # 📍 GEOLOCALISATION
    latitude = models.FloatField()
    longitude = models.FloatField()

    address = models.CharField(max_length=255, blank=True, null=True)

    # ⭐ NOTE MOYENNE (optimisation)
    average_rating = models.FloatField(default=0)

    # 📞 Infos utiles
    phone = models.CharField(max_length=20, blank=True, null=True)

    # 🕒 Horaires simples
    opening_hours = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name = "Commerce"
        verbose_name_plural = "Commerces"
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
        ]

    def __str__(self):
        return self.name