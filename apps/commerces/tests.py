from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Commerce, CommerceType


class CommerceBusinessRulesTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.restauration = Category.objects.create(name="Restauration")
        self.sante = Category.objects.create(name="Santé")

        self.restaurant_type = CommerceType.objects.create(
            name="Restaurant",
            category=self.restauration,
        )
        self.pharmacy_type = CommerceType.objects.create(
            name="Pharmacie",
            category=self.sante,
        )

    def valid_phone(self):
        return "0812345678"

    def test_create_commerce_rejects_mismatched_category_and_type(self):
        payload = {
            "name": "Pharmacie du Centre",
            "description": "Test",
            "category": self.restauration.id,
            "type": self.pharmacy_type.id,
            "latitude": -4.3,
            "longitude": 15.3,
            "address": "Kinshasa",
            "phone": self.valid_phone(),
            "opening_hours": "08:00-18:00",
        }

        response = self.client.post("/api/commerces/", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("type", response.data)

    def test_create_commerce_accepts_matching_category_and_type(self):
        payload = {
            "name": "Restaurant Central",
            "description": "Test",
            "category": self.restauration.id,
            "type": self.restaurant_type.id,
            "latitude": -4.3,
            "longitude": 15.3,
            "address": "Kinshasa",
            "phone": self.valid_phone(),
            "opening_hours": "08:00-18:00",
        }

        response = self.client.post("/api/commerces/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["category"]["id"], self.restauration.id)
        self.assertEqual(response.data["type"]["id"], self.restaurant_type.id)
        self.assertEqual(response.data["phone"], "+243812345678")
        self.assertEqual(Commerce.objects.count(), 1)

    def test_create_commerce_rejects_invalid_phone(self):
        payload = {
            "name": "Commerce sans téléphone valide",
            "description": "Test",
            "category": self.restauration.id,
            "type": self.restaurant_type.id,
            "latitude": -4.3,
            "longitude": 15.3,
            "address": "Kinshasa",
            "phone": "12ab",
            "opening_hours": "08:00-18:00",
        }

        response = self.client.post("/api/commerces/", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("phone", response.data)

    def test_type_list_can_be_filtered_by_category(self):
        response = self.client.get(
            f"/api/commerces/types/?category={self.restauration.id}"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Restaurant")