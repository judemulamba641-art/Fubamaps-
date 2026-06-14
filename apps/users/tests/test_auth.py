from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class RegisterTests(APITestCase):

    def test_user_can_register(self):
        """
        Vérifie qu'un utilisateur peut s'inscrire.
        """

        payload = {
            "email": "jude@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
            "first_name": "Jude",
            "last_name": "Mulamba",
            "phone_number": "+243812345678",
        }

        response = self.client.post(
            reverse("users:register"),
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            User.objects.count(),
            1
        )

        self.assertEqual(
            User.objects.first().email,
            payload["email"]
        )

    def test_email_must_be_unique(self):
        """
        Vérifie qu'un email ne peut être utilisé deux fois.
        """

        User.objects.create_user(
            email="jude@example.com",
            password="StrongPassword123!"
        )

        payload = {
            "email": "jude@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
            "first_name": "Jude",
            "last_name": "Mulamba",
        }

        response = self.client.post(
            reverse("users:register"),
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )


class LoginTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="jude@example.com",
            password="StrongPassword123!",
            first_name="Jude",
            last_name="Mulamba",
        )

    def test_user_can_login(self):
        """
        Vérifie la génération des tokens JWT.
        """

        payload = {
            "email": "jude@example.com",
            "password": "StrongPassword123!"
        }

        response = self.client.post(
            reverse("users:login"),
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_invalid_password(self):
        """
        Vérifie qu'un mauvais mot de passe échoue.
        """

        payload = {
            "email": "jude@example.com",
            "password": "wrongpassword"
        }

        response = self.client.post(
            reverse("users:login"),
            payload,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )


class LogoutTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="jude@example.com",
            password="StrongPassword123!"
        )

        login_response = self.client.post(
            reverse("users:login"),
            {
                "email": "jude@example.com",
                "password": "StrongPassword123!"
            },
            format="json"
        )

        self.access = login_response.data["access"]
        self.refresh = login_response.data["refresh"]

    def test_user_can_logout(self):
        """
        Vérifie le blacklistage du refresh token.
        """

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.access}"
        )

        response = self.client.post(
            reverse("users:logout"),
            {
                "refresh": self.refresh
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )