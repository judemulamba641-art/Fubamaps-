from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class ProfileTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="jude@example.com",
            password="StrongPassword123!",
            first_name="Jude",
            last_name="Mulamba",
            phone_number="+243812345678",
        )

        login_response = self.client.post(
            reverse("users:login"),
            {
                "email": "jude@example.com",
                "password": "StrongPassword123!",
            },
            format="json",
        )

        self.access_token = login_response.data["access"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.access_token}"
        )

    def test_get_profile(self):
        """
        Vérifie qu'un utilisateur connecté
        peut consulter son profil.
        """

        response = self.client.get(
            reverse("users:me")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK