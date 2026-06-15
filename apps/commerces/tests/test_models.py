from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.commerces.models import (
    Category,
    Commerce,
    CommerceType,
    validate_phone_number,
)


class ValidatePhoneNumberTests(TestCase):
    def test_valid_plus243(self):
        validate_phone_number("+243812345678")

    def test_valid_243(self):
        validate_phone_number("243812345678")

    def test_valid_local_format(self):
        validate_phone_number("0812345678")

    def test_none_is_accepted(self):
        validate_phone_number(None)

    def test_empty_string_is_accepted(self):
        validate_phone_number("")

    def test_short_number_raises(self):
        with self.assertRaises(ValidationError):
            validate_phone_number("12345")

    def test_letters_raise(self):
        with self.assertRaises(ValidationError):
            validate_phone_number("abc123")

    def test_too_long_raises(self):
        with self.assertRaises(ValidationError):
            validate_phone_number("+243812345678999")


class CategoryModelTests(TestCase):
    def test_str(self):
        cat = Category.objects.create(name="Restauration")
        self.assertEqual(str(cat), "Restauration")


class CommerceTypeModelTests(TestCase):
    def test_str(self):
        cat = Category.objects.create(name="Restauration")
        ctype = CommerceType.objects.create(name="Restaurant", category=cat)
        self.assertEqual(str(ctype), "Restaurant (Restauration)")


class CommerceCleanTests(TestCase):
    def setUp(self):
        self.cat = Category.objects.create(name="Restauration")
        self.cat2 = Category.objects.create(name="Santé")
        self.ctype = CommerceType.objects.create(
            name="Restaurant", category=self.cat
        )
        self.ctype2 = CommerceType.objects.create(
            name="Pharmacie", category=self.cat2
        )

    def test_clean_passes_when_category_matches_type(self):
        c = Commerce(
            name="Test",
            category=self.cat,
            type=self.ctype,
            latitude=-4.3,
            longitude=15.3,
        )
        c.clean()

    def test_clean_raises_when_category_mismatch(self):
        c = Commerce(
            name="Test",
            category=self.cat,
            type=self.ctype2,
            latitude=-4.3,
            longitude=15.3,
        )
        with self.assertRaises(ValidationError) as ctx:
            c.clean()
        self.assertIn("type", ctx.exception.message_dict)

    def test_clean_raises_when_no_category(self):
        c = Commerce(
            name="Test",
            category=None,
            type=self.ctype,
            latitude=-4.3,
            longitude=15.3,
        )
        with self.assertRaises(ValidationError) as ctx:
            c.clean()
        self.assertIn("category", ctx.exception.message_dict)

    def test_clean_raises_when_no_type(self):
        c = Commerce(
            name="Test",
            category=self.cat,
            type=None,
            latitude=-4.3,
            longitude=15.3,
        )
        with self.assertRaises(ValidationError) as ctx:
            c.clean()
        self.assertIn("type", ctx.exception.message_dict)

    def test_str(self):
        c = Commerce(name="Mon Commerce")
        self.assertEqual(str(c), "Mon Commerce")


class SoftDeleteTests(TestCase):
    def test_soft_delete_sets_flags(self):
        cat = Category.objects.create(name="Restauration")
        ctype = CommerceType.objects.create(name="Restaurant", category=cat)
        c = Commerce.objects.create(
            name="A", category=cat, type=ctype,
            latitude=-4.3, longitude=15.3,
        )
        c.soft_delete()
        c.refresh_from_db()
        self.assertTrue(c.is_deleted)
        self.assertIsNotNone(c.deleted_at)
