from django.test import TestCase

from apps.commerces.models import Category, Commerce, CommerceType
from apps.commerces.services import (
    add_distance_to_commerces,
    filter_by_category,
    filter_by_type,
    filter_commerces_by_radius,
    limit_results,
    sort_commerces,
)


class _CommerceFactory:
    """Helper to build Commerce instances for service tests."""

    @staticmethod
    def setup():
        cat = Category.objects.create(name="Restauration")
        ctype = CommerceType.objects.create(name="Restaurant", category=cat)
        return cat, ctype

    @staticmethod
    def create(cat, ctype, name, lat, lon, rating=0):
        return Commerce.objects.create(
            name=name,
            category=cat,
            type=ctype,
            latitude=lat,
            longitude=lon,
            average_rating=rating,
            phone="+243812345678",
        )


class AddDistanceTests(TestCase):
    def setUp(self):
        self.cat, self.ctype = _CommerceFactory.setup()
        self.c = _CommerceFactory.create(
            self.cat, self.ctype, "A", -4.325, 15.322
        )

    def test_adds_distance_attribute(self):
        commerces = add_distance_to_commerces([self.c], -4.325, 15.322)
        self.assertTrue(hasattr(commerces[0], "distance"))
        self.assertAlmostEqual(commerces[0].distance, 0.0, places=1)

    def test_distance_non_zero_for_different_coords(self):
        commerces = add_distance_to_commerces([self.c], -4.0, 15.0)
        self.assertGreater(commerces[0].distance, 0)


class FilterByRadiusTests(TestCase):
    def setUp(self):
        self.cat, self.ctype = _CommerceFactory.setup()
        self.c1 = _CommerceFactory.create(
            self.cat, self.ctype, "Near", -4.325, 15.322
        )
        self.c1.distance = 1.0
        self.c2 = _CommerceFactory.create(
            self.cat, self.ctype, "Far", -11.664, 27.479
        )
        self.c2.distance = 1500.0

    def test_filters_out_far_commerces(self):
        result = filter_commerces_by_radius([self.c1, self.c2], 5)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].name, "Near")

    def test_keeps_all_within_radius(self):
        result = filter_commerces_by_radius([self.c1, self.c2], 2000)
        self.assertEqual(len(result), 2)

    def test_commerce_without_distance_attribute_uses_default(self):
        c = _CommerceFactory.create(
            self.cat, self.ctype, "No dist", -4.3, 15.3
        )
        result = filter_commerces_by_radius([c], 5)
        self.assertEqual(len(result), 0)


class FilterByCategoryTests(TestCase):
    def setUp(self):
        self.cat1, self.ctype1 = _CommerceFactory.setup()
        self.cat2 = Category.objects.create(name="Santé")
        self.ctype2 = CommerceType.objects.create(
            name="Pharmacie", category=self.cat2
        )
        self.c1 = _CommerceFactory.create(
            self.cat1, self.ctype1, "Resto", -4.3, 15.3
        )
        self.c2 = _CommerceFactory.create(
            self.cat2, self.ctype2, "Pharma", -4.3, 15.31
        )

    def test_filters_by_category_id(self):
        result = filter_by_category([self.c1, self.c2], self.cat1.id)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].name, "Resto")

    def test_none_category_returns_all(self):
        result = filter_by_category([self.c1, self.c2], None)
        self.assertEqual(len(result), 2)

    def test_empty_string_returns_all(self):
        result = filter_by_category([self.c1, self.c2], "")
        self.assertEqual(len(result), 2)


class FilterByTypeTests(TestCase):
    def setUp(self):
        self.cat, self.ctype1 = _CommerceFactory.setup()
        self.ctype2 = CommerceType.objects.create(
            name="Fast-food", category=self.cat
        )
        self.c1 = _CommerceFactory.create(
            self.cat, self.ctype1, "Resto", -4.3, 15.3
        )
        self.c2 = _CommerceFactory.create(
            self.cat, self.ctype2, "FastFood", -4.3, 15.31
        )

    def test_filters_by_type_id(self):
        result = filter_by_type([self.c1, self.c2], self.ctype1.id)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].name, "Resto")

    def test_none_type_returns_all(self):
        result = filter_by_type([self.c1, self.c2], None)
        self.assertEqual(len(result), 2)


class SortCommercesTests(TestCase):
    def setUp(self):
        self.cat, self.ctype = _CommerceFactory.setup()
        self.c1 = _CommerceFactory.create(
            self.cat, self.ctype, "Close Low", -4.325, 15.322, rating=2
        )
        self.c1.distance = 1.0
        self.c2 = _CommerceFactory.create(
            self.cat, self.ctype, "Far High", -4.34, 15.34, rating=5
        )
        self.c2.distance = 10.0

    def test_sort_by_distance(self):
        result = sort_commerces([self.c2, self.c1], sort_by="distance")
        self.assertEqual(result[0].name, "Close Low")

    def test_sort_by_rating(self):
        result = sort_commerces([self.c1, self.c2], sort_by="rating")
        self.assertEqual(result[0].name, "Far High")

    def test_sort_smart(self):
        result = sort_commerces([self.c2, self.c1], sort_by="smart")
        self.assertEqual(result[0].name, "Close Low")


class LimitResultsTests(TestCase):
    def test_limits_list(self):
        data = list(range(100))
        self.assertEqual(len(limit_results(data, limit=10)), 10)

    def test_default_limit_is_50(self):
        data = list(range(100))
        self.assertEqual(len(limit_results(data)), 50)

    def test_shorter_than_limit(self):
        data = [1, 2, 3]
        self.assertEqual(limit_results(data, limit=10), [1, 2, 3])
