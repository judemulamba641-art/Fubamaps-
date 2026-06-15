import re

from django.core.exceptions import ValidationError
from rest_framework import serializers


PHONE_PATTERN = re.compile(r"^(\+243\d{9}|243\d{9}|0\d{9})$")


def validate_phone_number(value):
    """Model-level validator: raises django ValidationError."""
    if value in (None, ""):
        return

    if not PHONE_PATTERN.match(value):
        raise ValidationError(
            "Le numero doit etre au format +243XXXXXXXXX, 243XXXXXXXXX ou 0XXXXXXXXX."
        )


def normalize_phone_number(value):
    """Serializer-level helper: validates *and* normalises to +243 format."""
    if value in (None, ""):
        return None

    phone = str(value).strip()

    if not PHONE_PATTERN.match(phone):
        raise serializers.ValidationError(
            "Le numero doit etre au format +243XXXXXXXXX, 243XXXXXXXXX ou 0XXXXXXXXX."
        )

    digits = phone[1:] if phone.startswith("+") else phone
    if digits.startswith("0"):
        digits = digits[1:]
    elif digits.startswith("243"):
        digits = digits[3:]

    return f"+243{digits}"


def validate_latitude(value):
    """Return True when *value* is a valid latitude."""
    return -90 <= value <= 90


def validate_longitude(value):
    """Return True when *value* is a valid longitude."""
    return -180 <= value <= 180
