from django.contrib.auth import password_validation
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Inscription d'un utilisateur.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True,
    )

    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User

        fields = (
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone_number",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )

        password_validation.validate_password(attrs["password"])

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Consultation / modification du profil.
    """

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User

        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "avatar",
            "city",
            "role",
            "is_verified",
            "is_commerce_owner",
            "date_joined",
        )

        read_only_fields = (
            "id",
            "email",
            "role",
            "is_verified",
            "date_joined",
        )


class LogoutSerializer(serializers.Serializer):
    """
    Blacklist du refresh token.
    """

    refresh = serializers.CharField()

    def save(self, **kwargs):
        try:
            token = RefreshToken(
                self.validated_data["refresh"]
            )

            token.blacklist()

        except Exception:
            raise serializers.ValidationError(
                {"refresh": "Token invalide."}
            )


class ChangePasswordSerializer(serializers.Serializer):
    """
    Changement du mot de passe.
    """

    old_password = serializers.CharField(
        required=True,
        write_only=True,
    )

    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
    )

    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
    )

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError(
                "Mot de passe actuel incorrect."
            )

        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {
                    "new_password_confirm":
                    "Les mots de passe ne correspondent pas."
                }
            )

        password_validation.validate_password(
            attrs["new_password"]
        )

        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user

        user.set_password(
            self.validated_data["new_password"]
        )

        user.save(update_fields=["password"])

        return user