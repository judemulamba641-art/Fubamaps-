from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """
    Manager personnalisé pour FubaMaps.

    Authentification basée sur l'email.
    Compatible avec les futurs rôles :
    - user
    - agent_collector
    - agent_validator
    - agent_sales
    - admin
    """

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Méthode interne utilisée par
        create_user() et create_superuser()
        """

        if not email:
            raise ValueError(_("L'adresse email est obligatoire."))

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_user(self, email, password=None, **extra_fields):
        """
        Création d'un utilisateur standard.
        """

        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(
            email=email,
            password=password,
            **extra_fields
        )

    def create_superuser(self, email, password, **extra_fields):
        """
        Création d'un super utilisateur.
        """

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        # Pour FubaMaps
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("is_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(
                _("Le superuser doit avoir is_staff=True.")
            )

        if extra_fields.get("is_superuser") is not True:
            raise ValueError(
                _("Le superuser doit avoir is_superuser=True.")
            )

        return self._create_user(
            email=email,
            password=password,
            **extra_fields
        )