from django.db.models import Avg
from .models import Avis


def create_review(validated_data):
    """
    Créer un avis à partir des données validées
    """
    review = Avis.objects.create(
        commerce=validated_data["commerce"],
        note=validated_data["note"],
        price_rating=validated_data.get("price_rating", 3),
        commentaire=validated_data.get("commentaire", ""),
        user_name=validated_data.get("user_name", ""),
        is_active=True,
    )
    return review


def update_review(review, note=None, commentaire=None):
    """
    Mettre à jour un avis existant
    """
    if note is not None:
        review.note = note

    if commentaire is not None:
        review.commentaire = commentaire

    review.save()
    return review


def delete_review(review):
    """
    Désactiver un avis (soft delete)
    """
    review.is_active = False
    review.save()
    return review


def get_filtered_reviews(commerce=None, min_note=None):
    """
    Récupérer les avis filtrés
    """
    reviews = Avis.objects.filter(is_active=True)

    if commerce is not None:
        reviews = reviews.filter(commerce=commerce)

    if min_note is not None:
        reviews = reviews.filter(note__gte=min_note)

    return reviews


def calculate_average_rating(commerce):
    """
    Calculer la moyenne des notes
    """
    result = Avis.objects.filter(
        commerce=commerce,
        is_active=True
    ).aggregate(avg_note=Avg("note"))

    return result["avg_note"] or 0