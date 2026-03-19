import math
from datetime import datetime
from django.utils.text import slugify


# =========================================================
# 📍 GEOLOCATION (TRÈS IMPORTANT POUR FUBAMAPS)
# =========================================================

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calcule la distance en KM entre deux points GPS
    """

    R = 6371  # Rayon de la Terre en km

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def is_within_radius(user_lat, user_lon, target_lat, target_lon, radius_km=5):
    """
    Vérifie si un point est dans un rayon donné
    """
    distance = haversine_distance(user_lat, user_lon, target_lat, target_lon)
    return distance <= radius_km


# =========================================================
# ⭐ NOTES / AVIS
# =========================================================

def calculate_average_rating(reviews):
    """
    Calcule la moyenne des notes
    """
    if not reviews:
        return 0

    total = sum([r.note for r in reviews])
    return round(total / len(reviews), 2)


# =========================================================
# 🔤 STRING UTILS
# =========================================================

def generate_slug(text):
    """
    Génère un slug propre
    """
    return slugify(text)


# =========================================================
# 🧠 IA SIMPLE (V1)
# =========================================================

def generate_simple_recommendation(commerces):
    """
    Génère une recommandation simple sans IA externe
    """

    if not commerces:
        return "Aucun commerce disponible."

    # Trier par distance puis note
    commerces_sorted = sorted(
        commerces,
        key=lambda c: (c.get("distance", 999), -c.get("rating", 0))
    )

    best = commerces_sorted[0]

    return (
        f"{best.get('nom')} est recommandé. "
        f"Distance: {round(best.get('distance', 0), 2)} km, "
        f"Note: {best.get('rating', 0)}/5."
    )


# =========================================================
# 📅 DATE UTILS
# =========================================================

def format_datetime(dt: datetime):
    """
    Formate une date en string lisible
    """
    if not dt:
        return ""

    return dt.strftime("%d/%m/%Y %H:%M")


# =========================================================
# 📦 PERFORMANCE / CACHE SIMPLE
# =========================================================

def chunk_queryset(queryset, chunk_size=100):
    """
    Permet de traiter un queryset par morceaux (optimisation mémoire)
    """
    start = 0
    while True:
        chunk = queryset[start:start + chunk_size]
        if not chunk:
            break
        yield chunk
        start += chunk_size


# =========================================================
# 🔐 VALIDATION SIMPLE
# =========================================================

def validate_latitude(latitude):
    return -90 <= latitude <= 90


def validate_longitude(longitude):
    return -180 <= longitude <= 180


# =========================================================
# 📱 MOBILE OPTIMIZATION
# =========================================================

def compress_response(data, limit=50):
    """
    Limite les données envoyées pour mobile faible connexion
    """
    return data[:limit]