from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
)
from django.core.validators import RegexValidator
from django.utils import timezone

from .managers import UserManager


phone_validator = RegexValidator(
    regex=r"^\+?[0-9]{9,15}$",
    message="Numéro de téléphone invalide. Exemple : +243812345678",
)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Modèle utilisateur personnalisé pour FubaMaps.

    Rôles :
    - user : utilisateur classique
    - merchant : commerçant
    - agent_collector : collecte GPS des commerces
    - agent_validator : complète les informations terrain
    - agent_sales : commercial (phase future)
    - admin : administrateur plateforme
    """

    ROLE_USER = "user"
    ROLE_MERCHANT = "merchant"
    ROLE_AGENT_COLLECTOR = "agent_collector"
    ROLE_AGENT_VALIDATOR = "agent_validator"
    ROLE_AGENT_SALES = "agent_sales"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = [
        (ROLE_USER, "Utilisateur"),
        (ROLE_MERCHANT, "Commerçant"),
        (ROLE_AGENT_COLLECTOR, "Agent Collecteur"),
        (ROLE_AGENT_VALIDATOR, "Agent Validateur"),
        (ROLE_AGENT_SALES, "Agent Commercial"),
        (ROLE_ADMIN, "Administrateur"),
    ]

    email = models.EmailField(
        unique=True,
        db_index=True,
        verbose_name="Adresse email",
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_validator],
        verbose_name="Numéro de téléphone",
    )

    first_name = models.CharField(
        max_length=100,
        verbose_name="Prénom",
    )

    last_name = models.CharField(
        max_length=100,
        verbose_name="Nom",
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        verbose_name="Avatar",
    )

    city = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Ville",
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES,
        default=ROLE_USER,
        db_index=True,
        verbose_name="Rôle",
    )

    is_verified = models.BooleanField(
        default=False,
        verbose_name="Compte vérifié",
    )

    is_commerce_owner = models.BooleanField(
        default=False,
        verbose_name="Propriétaire de commerce",
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Compte actif",
    )

    is_staff = models.BooleanField(
        default=False,
        verbose_name="Accès administration",
    )

    date_joined = models.DateTimeField(
        default=timezone.now,
        verbose_name="Date d'inscription",
    )

    last_login = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name="Dernière connexion",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_full_name(self):
        return self.full_name

    def get_short_name(self):
        return self.first_name

    @property
    def is_agent(self):
        return self.role in [
            self.ROLE_AGENT_COLLECTOR,
            self.ROLE_AGENT_VALIDATOR,
            self.ROLE_AGENT_SALES,
        ]

    @property
    def is_collector(self):
        return self.role == self.ROLE_AGENT_COLLECTOR

    @property
    def is_validator(self):
        return self.role == self.ROLE_AGENT_VALIDATOR

    @property
    def is_sales_agent(self):
        return self.role == self.ROLE_AGENT_SALES

    @property
    def is_merchant(self):
        return self.role == self.ROLE_MERCHANT

    @property
    def is_admin_role(self):
        return self.role == self.ROLE_ADMIN
