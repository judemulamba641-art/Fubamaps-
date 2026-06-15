from django.test import TestCase

from apps.avis.models import Avis, AvisReport, PriceRating
from apps.commerces.models import Category, Commerce, CommerceType


def _make_commerce(name="Resto"):
    cat = Category.objects.create(name=f"Cat-{name}")
    ctype = CommerceType.objects.create(name=f"Type-{name}", category=cat)
    return Commerce.objects.create(
        name=name, category=cat, type=ctype,
        latitude=-4.3, longitude=15.3,
    )


class AvisModelTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()

    def test_str(self):
        avis = Avis.objects.create(commerce=self.commerce, note=4)
        self.assertIn("4", str(avis))
        self.assertIn(self.commerce.name, str(avis))

    def test_default_values(self):
        avis = Avis.objects.create(commerce=self.commerce, note=3)
        self.assertEqual(avis.price_rating, PriceRating.NORMAL)
        self.assertTrue(avis.is_active)
        self.assertFalse(avis.is_reported)
        self.assertEqual(avis.likes, 0)
        self.assertEqual(avis.dislikes, 0)

    def test_uuid_is_set(self):
        avis = Avis.objects.create(commerce=self.commerce, note=3)
        self.assertIsNotNone(avis.uuid)

    def test_ordering_by_created_at_desc(self):
        a1 = Avis.objects.create(commerce=self.commerce, note=1)
        a2 = Avis.objects.create(commerce=self.commerce, note=2)
        all_avis = list(Avis.objects.all())
        self.assertEqual(all_avis[0].pk, a2.pk)


class AvisReportModelTests(TestCase):
    def setUp(self):
        self.commerce = _make_commerce()
        self.avis = Avis.objects.create(commerce=self.commerce, note=3)

    def test_str(self):
        report = AvisReport.objects.create(
            avis=self.avis, reason="spam"
        )
        self.assertIn("spam", str(report))

    def test_default_is_resolved_false(self):
        report = AvisReport.objects.create(
            avis=self.avis, reason="fake"
        )
        self.assertFalse(report.is_resolved)


class PriceRatingTests(TestCase):
    def test_choices_count(self):
        self.assertEqual(len(PriceRating.choices), 5)

    def test_normal_value(self):
        self.assertEqual(PriceRating.NORMAL, 3)
