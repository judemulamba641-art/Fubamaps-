from django.db import models
from django.utils import timezone
import uuid


class UUIDModel(models.Model):
    """
    Utilise un UUID comme identifiant public (sécurité + API propre)
    """

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    """
    Ajoute automatiquement les timestamps
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class ActiveModel(models.Model):
    """
    Permet de désactiver un objet sans le supprimer
    """

    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True


class SoftDeleteModel(models.Model):
    """
    Suppression logique (soft delete)
    """

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    class Meta:
        abstract = True


class BaseModel(
    UUIDModel,
    TimeStampedModel,
    ActiveModel,
    SoftDeleteModel
):
    """
    Modèle de base global du projet
    """

    id = models.BigAutoField(primary_key=True)

    class Meta:
        abstract = True