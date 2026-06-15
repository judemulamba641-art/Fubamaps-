"""
Serializers de l'application Users - FubaMaps.
Gestion complète : inscription, connexion, profil, mot de passe, déconnexion.
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


# =========================================================
# UserSerializer - Lecture du profil utilisateur
# =========================================================


class UserSerializer(serializers.ModelSerializer):
    """Serializer principal pour la lecture/mise à jour du profil."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
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
            "last_login",
        ]
        read_only_fields = [
            "id",
            "email",
            "role",
            "is_verified",
            "is_commerce_owner",
            "date_joined",
            "last_login",
        ]


# =========================================================
# UserProfileSerializer - Profil public allégé
# =========================================================


class UserProfileSerializer(serializers.ModelSerializer):
    """Profil public (visible par les autres utilisateurs)."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "avatar",
            "city",
            "role",
            "date_joined",
        ]


# =========================================================
# RegisterSerializer - Inscription
# =========================================================


class RegisterSerializer(serializers.ModelSerializer):
    """Inscription d'un nouvel utilisateur avec validation robuste."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
    )
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone_number",
        ]

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "Un compte avec cet email existe déjà."
            )
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )
        return user


# =========================================================
# LoginSerializer - Connexion (compatible JWT TokenObtainPair)
# =========================================================


class LoginSerializer(serializers.Serializer):
    """Serializer de connexion retournant les tokens JWT."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Email ou mot de passe incorrect."
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                "Email ou mot de passe incorrect."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Ce compte est désactivé."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
        }


# =========================================================
# ChangePasswordSerializer - Changement de mot de passe
# =========================================================


class ChangePasswordSerializer(serializers.Serializer):
    """Changement de mot de passe pour un utilisateur connecté."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
    )
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                "L'ancien mot de passe est incorrect."
            )
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "Les mots de passe ne correspondent pas."}
            )
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


# =========================================================
# UpdateProfileSerializer - Modification du profil
# =========================================================


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Mise à jour partielle du profil utilisateur."""

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "city",
        ]

    def validate_phone_number(self, value):
        if value and not value.replace("+", "").isdigit():
            raise serializers.ValidationError(
                "Numéro de téléphone invalide."
            )
        return value


# =========================================================
# LogoutSerializer - Déconnexion JWT (blacklist refresh)
# =========================================================


class LogoutSerializer(serializers.Serializer):
    """Blacklist le refresh token pour déconnexion."""

    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            self.token = RefreshToken(value)
        except Exception:
            raise serializers.ValidationError(
                "Token invalide ou expiré."
            )
        return value

    def save(self, **kwargs):
        self.token.blacklist()
