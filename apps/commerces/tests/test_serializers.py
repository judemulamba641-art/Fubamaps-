from django.test import TestCase
from rest_framework.exceptions import ValidationError

from apps.commerces.serializers import normalize_phone_number


class NormalizePhoneNumberTests(TestCase):
    def test_none_returns_none(self):
        self.assertIsNone(normalize_phone_number(None))

    def test_empty_returns_none(self):
        self.assertIsNone(normalize_phone_number(""))

    def test_plus243_format(self):
        self.assertEqual(normalize_phone_number("+243812345678"), "+243812345678")

    def test_243_format(self):
        self.assertEqual(normalize_phone_number("243812345678"), "+243812345678")

    def test_local_format(self):
        self.assertEqual(normalize_phone_number("0812345678"), "+243812345678")

    def test_strips_whitespace(self):
        self.assertEqual(normalize_phone_number("  +243812345678  "), "+243812345678")

    def test_invalid_phone_raises(self):
        with self.assertRaises(ValidationError):
            normalize_phone_number("12345")

    def test_letters_raise(self):
        with self.assertRaises(ValidationError):
            normalize_phone_number("abcdefghij")
