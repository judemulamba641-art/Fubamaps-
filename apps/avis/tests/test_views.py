from django.test import TestCase
from rest_framework.test import APIClient

from apps.avis.models import Avis, AvisReport
from apps.commerces.models import Category, Commerce, CommerceType


def _setup_commerce():
    cat = Category.objects.create(name="Restauration")
    ctype = CommerceType.objects.create(name="Restaurant", category=cat)
    commerce = Commerce.objects.create(
        name="Resto Central", category=cat, type=ctype,
        latitude=-4.3, longitude=15.3,
    )
    return commerce


class AvisCreateViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()

    def test_create_avis(self):
        payload = {
            "commerce": self.commerce.id,
            "note": 4,
            "price_rating": 3,
            "commentaire": "Bon resto",
            "user_name": "Jude",
        }
        resp = self.client.post("/api/avis/create", payload, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Avis.objects.count(), 1)
        self.assertEqual(resp.data["note"], 4)

    def test_create_avis_invalid_note(self):
        payload = {
            "commerce": self.commerce.id,
            "note": 0,
        }
        resp = self.client.post("/api/avis/create", payload, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_create_avis_missing_commerce(self):
        payload = {"note": 3}
        resp = self.client.post("/api/avis/create", payload, format="json")
        self.assertEqual(resp.status_code, 400)


class AvisDeleteViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()
        self.avis = Avis.objects.create(
            commerce=self.commerce, note=4
        )

    def test_soft_delete(self):
        resp = self.client.delete(f"/api/avis/{self.avis.id}/delete/")
        self.assertEqual(resp.status_code, 204)
        self.avis.refresh_from_db()
        self.assertFalse(self.avis.is_active)

    def test_delete_nonexistent(self):
        resp = self.client.delete("/api/avis/9999/delete/")
        self.assertEqual(resp.status_code, 404)


class CommerceAvisListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()
        Avis.objects.create(commerce=self.commerce, note=3)
        Avis.objects.create(commerce=self.commerce, note=5)
        Avis.objects.create(
            commerce=self.commerce, note=1, is_active=False
        )

    def test_list_avis_for_commerce(self):
        resp = self.client.get(f"/api/avis/commerce/{self.commerce.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)

    def test_filter_by_min_note(self):
        resp = self.client.get(
            f"/api/avis/commerce/{self.commerce.id}/?min_note=4"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)

    def test_nonexistent_commerce(self):
        resp = self.client.get("/api/avis/commerce/9999/")
        self.assertEqual(resp.status_code, 404)


class AvisStatsViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()
        Avis.objects.create(commerce=self.commerce, note=3)
        Avis.objects.create(commerce=self.commerce, note=5)

    def test_stats(self):
        resp = self.client.get(
            f"/api/avis/commerce/{self.commerce.id}/stats/"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["total_reviews"], 2)
        self.assertEqual(resp.data["average_rating"], 4.0)
        self.assertIn("rating_distribution", resp.data)

    def test_stats_empty_commerce(self):
        cat = Category.objects.create(name="Vide")
        ctype = CommerceType.objects.create(name="TypeVide", category=cat)
        empty = Commerce.objects.create(
            name="Vide", category=cat, type=ctype,
            latitude=-4.4, longitude=15.4,
        )
        resp = self.client.get(f"/api/avis/commerce/{empty.id}/stats/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["total_reviews"], 0)
        self.assertEqual(resp.data["average_rating"], 0)


class AvisReactionViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()
        self.avis = Avis.objects.create(
            commerce=self.commerce, note=4
        )

    def test_like(self):
        resp = self.client.post(
            f"/api/avis/{self.avis.id}/react/",
            {"action": "like"}, format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.avis.refresh_from_db()
        self.assertEqual(self.avis.likes, 1)

    def test_dislike(self):
        resp = self.client.post(
            f"/api/avis/{self.avis.id}/react/",
            {"action": "dislike"}, format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.avis.refresh_from_db()
        self.assertEqual(self.avis.dislikes, 1)

    def test_invalid_action(self):
        resp = self.client.post(
            f"/api/avis/{self.avis.id}/react/",
            {"action": "love"}, format="json",
        )
        self.assertEqual(resp.status_code, 400)


class AvisReportViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()
        self.avis = Avis.objects.create(
            commerce=self.commerce, note=3
        )

    def test_report_avis(self):
        resp = self.client.post(
            f"/api/avis/{self.avis.id}/report/",
            {"reason": "spam", "description": "Looks like spam"},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(AvisReport.objects.count(), 1)
        self.avis.refresh_from_db()
        self.assertTrue(self.avis.is_reported)

    def test_report_invalid_reason(self):
        resp = self.client.post(
            f"/api/avis/{self.avis.id}/report/",
            {"reason": "invalid_reason"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)


class GetAvisViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.commerce = _setup_commerce()
        Avis.objects.create(commerce=self.commerce, note=3)
        Avis.objects.create(commerce=self.commerce, note=5)

    def test_get_all_avis(self):
        resp = self.client.get("/api/avis/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 2)
