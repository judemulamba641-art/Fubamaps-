from datetime import datetime
from unittest import TestCase

from apps.core.utils import (
    calculate_average_rating,
    compress_response,
    format_datetime,
    generate_simple_recommendation,
    generate_slug,
    haversine_distance,
    is_within_radius,
    validate_latitude,
    validate_longitude,
)


class HaversineDistanceTests(TestCase):
    def test_same_point_returns_zero(self):
        self.assertAlmostEqual(haversine_distance(0, 0, 0, 0), 0, places=5)

    def test_known_distance_kinshasa_to_lubumbashi(self):
        # Kinshasa (-4.325, 15.322) -> Lubumbashi (-11.664, 27.479)
        dist = haversine_distance(-4.325, 15.322, -11.664, 27.479)
        self.assertAlmostEqual(dist, 1530, delta=50)

    def test_short_distance(self):
        # Two nearby points in Kinshasa (~1 km apart)
        dist = haversine_distance(-4.325, 15.322, -4.334, 15.322)
        self.assertTrue(0 < dist < 5)

    def test_antipodal_points(self):
        dist = haversine_distance(0, 0, 0, 180)
        self.assertAlmostEqual(dist, 20015, delta=20)


class IsWithinRadiusTests(TestCase):
    def test_same_point_is_within_any_radius(self):
        self.assertTrue(is_within_radius(-4.3, 15.3, -4.3, 15.3, radius_km=0))

    def test_nearby_within_radius(self):
        self.assertTrue(is_within_radius(-4.325, 15.322, -4.330, 15.322, radius_km=5))

    def test_far_point_outside_radius(self):
        self.assertFalse(is_within_radius(-4.325, 15.322, -11.664, 27.479, radius_km=5))

    def test_default_radius_is_five(self):
        self.assertTrue(is_within_radius(-4.325, 15.322, -4.330, 15.322))


class CalculateAverageRatingTests(TestCase):
    def test_empty_list_returns_zero(self):
        self.assertEqual(calculate_average_rating([]), 0)

    def test_single_review(self):
        class FakeReview:
            note = 4
        self.assertEqual(calculate_average_rating([FakeReview()]), 4.0)

    def test_multiple_reviews(self):
        class R:
            def __init__(self, n):
                self.note = n
        reviews = [R(3), R(5), R(4)]
        self.assertEqual(calculate_average_rating(reviews), 4.0)

    def test_rounds_to_two_decimals(self):
        class R:
            def __init__(self, n):
                self.note = n
        reviews = [R(1), R(2), R(3)]
        self.assertEqual(calculate_average_rating(reviews), 2.0)


class GenerateSlugTests(TestCase):
    def test_simple_text(self):
        self.assertEqual(generate_slug("Hello World"), "hello-world")

    def test_accented_text(self):
        slug = generate_slug("Pharmacie du Centre")
        self.assertEqual(slug, "pharmacie-du-centre")


class GenerateSimpleRecommendationTests(TestCase):
    def test_empty_list(self):
        self.assertEqual(
            generate_simple_recommendation([]),
            "Aucun commerce disponible.",
        )

    def test_single_commerce(self):
        data = [{"nom": "Resto A", "distance": 1.5, "rating": 4}]
        result = generate_simple_recommendation(data)
        self.assertIn("Resto A", result)
        self.assertIn("1.5", result)

    def test_sorts_by_distance_then_rating(self):
        data = [
            {"nom": "Far Good", "distance": 10, "rating": 5},
            {"nom": "Near OK", "distance": 1, "rating": 3},
        ]
        result = generate_simple_recommendation(data)
        self.assertIn("Near OK", result)


class FormatDatetimeTests(TestCase):
    def test_formats_correctly(self):
        dt = datetime(2025, 6, 15, 14, 30)
        self.assertEqual(format_datetime(dt), "15/06/2025 14:30")

    def test_none_returns_empty_string(self):
        self.assertEqual(format_datetime(None), "")


class ValidateLatLonTests(TestCase):
    def test_valid_latitudes(self):
        self.assertTrue(validate_latitude(0))
        self.assertTrue(validate_latitude(-90))
        self.assertTrue(validate_latitude(90))

    def test_invalid_latitudes(self):
        self.assertFalse(validate_latitude(-91))
        self.assertFalse(validate_latitude(91))

    def test_valid_longitudes(self):
        self.assertTrue(validate_longitude(0))
        self.assertTrue(validate_longitude(-180))
        self.assertTrue(validate_longitude(180))

    def test_invalid_longitudes(self):
        self.assertFalse(validate_longitude(-181))
        self.assertFalse(validate_longitude(181))


class CompressResponseTests(TestCase):
    def test_limits_data(self):
        data = list(range(100))
        self.assertEqual(len(compress_response(data, limit=10)), 10)

    def test_default_limit(self):
        data = list(range(100))
        self.assertEqual(len(compress_response(data)), 50)

    def test_shorter_than_limit(self):
        data = [1, 2, 3]
        self.assertEqual(compress_response(data, limit=10), [1, 2, 3])
