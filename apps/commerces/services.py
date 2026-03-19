from django.db.models import Avg
from .models import Commerce
from apps.core.utils import haversine_distance


# =========================================================
# 📍 CALCUL DISTANCE + ENRICHISSEMENT
# =========================================================

def add_distance_to_commerces(commerces, user_lat, user_lon):
    """
    Ajoute la distance à chaque commerce (attribut dynamique)
    """

    for commerce in commerces:
        distance = haversine_distance(
            user_lat,
            user_lon,
            commerce.latitude,
            commerce.longitude
        )
        commerce.distance = round(distance, 2)

    return commerces


# =========================================================
# 📍 FILTRER PAR RAYON
# =========================================================

def filter_commerces_by_radius(commerces, radius_km):
    """
    Garde uniquement les commerces dans le rayon
    """

    return [c for c in commerces if getattr(c, "distance", 999) <= radius_km]


# =========================================================
# 🏷️ FILTRER PAR CATÉGORIE
# =========================================================

def filter_by_category(commerces, category_id):
    if not category_id:
        return commerces

    return [c for c in commerces if c.category_id == int(category_id)]


# =========================================================
# 🧩 FILTRER PAR TYPE
# =========================================================

def filter_by_type(commerces, type_id):
    if not type_id:
        return commerces

    return [c for c in commerces if c.type_id == int(type_id)]


# =========================================================
# ⭐ TRI INTELLIGENT
# =========================================================

def sort_commerces(commerces, sort_by="distance"):
    """
    Tri intelligent :
    - distance
    - note
    - mix des deux
    """

    if sort_by == "rating":
        return sorted(commerces, key=lambda c: -c.average_rating)

    if sort_by == "smart":
        return sorted(
            commerces,
            key=lambda c: (
                getattr(c, "distance", 999),
                -c.average_rating
            )
        )

    # défaut = distance
    return sorted(commerces, key=lambda c: getattr(c, "distance", 999))


# =========================================================
# 📦 LIMITER POUR MOBILE
# =========================================================

def limit_results(commerces, limit=50):
    """
    Limite les résultats pour performance mobile
    """
    return commerces[:limit]


# =========================================================
# 📊 CALCUL MOYENNE DES NOTES
# =========================================================

def update_commerce_rating(commerce):
    """
    Met à jour la note moyenne depuis les avis
    """

    avg = commerce.avis.aggregate(avg=Avg("note"))["avg"]

    commerce.average_rating = round(avg or 0, 2)
    commerce.save(update_fields=["average_rating"])

    return commerce


# =========================================================
# 🚀 FONCTION PRINCIPALE (ULTRA IMPORTANTE)
# =========================================================

def get_nearby_commerces(
    user_lat,
    user_lon,
    radius_km=5,
    category_id=None,
    type_id=None,
    sort_by="smart",
    limit=50
):
    """
    Pipeline complet :
    1. récupérer
    2. ajouter distance
    3. filtrer
    4. trier
    5. limiter
    """

    # 1️⃣ récupérer (optimisé)
    commerces = list(
        Commerce.objects.filter(is_active=True, is_deleted=False)
        .select_related("category", "type")
    )

    # 2️⃣ distance
    commerces = add_distance_to_commerces(commerces, user_lat, user_lon)

    # 3️⃣ filtrage
    commerces = filter_commerces_by_radius(commerces, radius_km)
    commerces = filter_by_category(commerces, category_id)
    commerces = filter_by_type(commerces, type_id)

    # 4️⃣ tri
    commerces = sort_commerces(commerces, sort_by)

    # 5️⃣ limiter
    commerces = limit_results(commerces, limit)

    return commerces