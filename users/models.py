from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class RoleChoices(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        OWNER = 'OWNER', 'Propietario'
        COLLABORATOR = 'COLLABORATOR', 'Colaborador'
        VIEWER = 'VIEWER', 'Visor'

    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.VIEWER
    )

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
