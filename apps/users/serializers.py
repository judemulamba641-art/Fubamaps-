"""
Serializers pour l'application users de FubaMaps.
Gère inscription, connexion, profil, changement de mot de passe et déconnexion JWT.
"""

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password

from .models import User


# =========================================================
# 👤 USER SERIALIZER (lecture profil)
# =========================================================


class UserSerializer(serializers.ModelSerializer):
    """Serializer complet pour lecture/écriture du profil utilisateur."""

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
            "date_joined",
            "last_login",
        ]


# =========================================================
# 👤 USER PROFILE SERIALIZER (mise à jour profil)
# =========================================================


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer pour mise à jour du profil utilisateur."""

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "avatar",
            "city",
        ]

    def validate_phone_number(self, value):
        if value and len(value) < 9:
            raise serializers.ValidationError(
                "Numéro de téléphone trop court."
            )
        return value


# =========================================================
# 📝 REGISTER SERIALIZER
# =========================================================


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'un nouvel utilisateur."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
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
            email=validated_data["email"],
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


# =========================================================
# 🔑 LOGIN SERIALIZER (compatible JWT)
# =========================================================


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion (retourne tokens JWT)."""

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "Aucun compte trouvé avec cet email."}
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                {"password": "Mot de passe incorrect."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"email": "Ce compte est désactivé."}
            )

        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


# =========================================================
# 🔒 CHANGE PASSWORD SERIALIZER
# =========================================================


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour le changement de mot de passe."""

    old_password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

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
# 🚪 LOGOUT SERIALIZER (blacklist refresh token)
# =========================================================


class LogoutSerializer(serializers.Serializer):
    """Serializer pour la déconnexion (blacklist du refresh token)."""

    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            self.token = RefreshToken(value)
        except Exception:
            raise serializers.ValidationError(
                "Token de rafraîchissement invalide."
            )
        return value

    def save(self, **kwargs):
        try:
            self.token.blacklist()
        except AttributeError:
            # Si le blacklisting n'est pas configuré, on ignore
            pass


# =========================================================
# ✏️ UPDATE PROFILE SERIALIZER
# =========================================================


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer pour la mise à jour complète du profil."""

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "avatar",
            "city",
        ]

    def validate_phone_number(self, value):
        if value and len(value) < 9:
            raise serializers.ValidationError(
                "Numéro de téléphone trop court."
            )
        return value

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
