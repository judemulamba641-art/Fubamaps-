from django.test import TestCase

from apps.avis.models import Avis
from apps.avis.services import (
    calculate_average_rating,
    create_review,
    delete_review,
    get_filtered_reviews,
    update_review,
)
from apps.commerces.models import Category, Commerce, CommerceType


def _make_commerce():
    cat = Category.objects.create(name="Restauration")
    ctype = CommerceType.objects.create(name="Restaurant", category=cat)
    return Commerce.objects.create(
        name="Resto", category=cat, type=ctype,
        latitude=-4.3, longitude=15.3,
    )


class CreateReviewTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()

    def test_creates_review_with_required_fields(self):
        review = create_review({"commerce": self.commerce, "note": 4})
        self.assertEqual(review.commerce, self.commerce)
        self.assertEqual(review.note, 4)
        self.assertTrue(review.is_active)

    def test_creates_review_with_optional_fields(self):
        review = create_review({
            "commerce": self.commerce,
            "note": 5,
            "price_rating": 2,
            "commentaire": "Excellent",
            "user_name": "Jude",
        })
        self.assertEqual(review.price_rating, 2)
        self.assertEqual(review.commentaire, "Excellent")
        self.assertEqual(review.user_name, "Jude")

    def test_defaults_price_rating_to_3(self):
        review = create_review({"commerce": self.commerce, "note": 3})
        self.assertEqual(review.price_rating, 3)


class UpdateReviewTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()
        self.review = Avis.objects.create(
            commerce=self.commerce, note=3, commentaire="OK"
        )

    def test_updates_note(self):
        updated = update_review(self.review, note=5)
        self.assertEqual(updated.note, 5)

    def test_updates_commentaire(self):
        updated = update_review(self.review, commentaire="Super")
        self.assertEqual(updated.commentaire, "Super")

    def test_none_values_are_skipped(self):
        update_review(self.review, note=None, commentaire=None)
        self.review.refresh_from_db()
        self.assertEqual(self.review.note, 3)
        self.assertEqual(self.review.commentaire, "OK")


class DeleteReviewTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()
        self.review = Avis.objects.create(
            commerce=self.commerce, note=4
        )

    def test_soft_deletes_review(self):
        result = delete_review(self.review)
        self.assertFalse(result.is_active)
        self.review.refresh_from_db()
        self.assertFalse(self.review.is_active)


class GetFilteredReviewsTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()
        self.r1 = Avis.objects.create(commerce=self.commerce, note=2)
        self.r2 = Avis.objects.create(commerce=self.commerce, note=5)
        self.r3 = Avis.objects.create(
            commerce=self.commerce, note=4, is_active=False
        )

    def test_returns_only_active(self):
        reviews = get_filtered_reviews()
        self.assertEqual(reviews.count(), 2)

    def test_filters_by_commerce(self):
        reviews = get_filtered_reviews(commerce=self.commerce)
        self.assertEqual(reviews.count(), 2)

    def test_filters_by_min_note(self):
        reviews = get_filtered_reviews(min_note=4)
        self.assertEqual(reviews.count(), 1)
        self.assertEqual(reviews.first().note, 5)

    def test_filters_combined(self):
        reviews = get_filtered_reviews(commerce=self.commerce, min_note=3)
        self.assertEqual(reviews.count(), 1)


class CalculateAverageRatingTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()

    def test_no_reviews_returns_zero(self):
        self.assertEqual(calculate_average_rating(self.commerce), 0)

    def test_calculates_average(self):
        Avis.objects.create(commerce=self.commerce, note=3)
        Avis.objects.create(commerce=self.commerce, note=5)
        avg = calculate_average_rating(self.commerce)
        self.assertEqual(avg, 4.0)

    def test_ignores_inactive_reviews(self):
        Avis.objects.create(commerce=self.commerce, note=5)
        Avis.objects.create(
            commerce=self.commerce, note=1, is_active=False
        )
        avg = calculate_average_rating(self.commerce)
        self.assertEqual(avg, 5.0)
