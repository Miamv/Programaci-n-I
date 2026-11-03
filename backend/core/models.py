import os
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models


class Brand(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='brands/', blank=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    class RoleChoices(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        OWNER = 'OWNER', 'Propietario'
        COLLABORATOR = 'COLLABORATOR', 'Colaborador'
        VIEWER = 'VIEWER', 'Visor'

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.VIEWER
    )

    def __str__(self):
        return f'{self.username} - {self.get_role_display()}'


class ProfessionalProfile(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='professional_profiles')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    specialty = models.CharField(max_length=100, blank=True)
    services = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    avatar = models.ImageField(upload_to='profiles/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Project(models.Model):
    CATEGORY_CHOICES = [
        ('architecture', 'Architecture'),
        ('design', 'Design'),
        ('photography', 'Photography'),
        ('interior_design', 'Interior Design'),
        ('render', 'Render'),
        ('other', 'Other'),
    ]
    profile = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=150)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    brands = models.ManyToManyField(Brand, blank=True, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Media(models.Model):
    IMAGE_AND_PLAN_EXTENSIONS = ('jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg', 'bmp', 'pdf')
    VIDEO_EXTENSIONS = ('mp4', 'webm', 'mov', 'ogg')
    MODEL_3D_EXTENSIONS = ('obj', 'fbx', 'gltf', 'glb', 'stl')
    ALLOWED_MEDIA_EXTENSIONS = IMAGE_AND_PLAN_EXTENSIONS + VIDEO_EXTENSIONS + MODEL_3D_EXTENSIONS

    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('render', 'Render'),
        ('virtual_tour', 'Virtual Tour'),
        ('model_3d', '3D Model'),
        ('interactive', 'Interactive Content'),
    ]

    ZONE_CHOICES = [
        ('interior', 'Interior'),
        ('exterior', 'Exterior'),
    ]

    PLAN_TYPES = [
        ('planimetria', 'Planimetría'),
        ('planta', 'Planta'),
        ('cortes', 'Cortes'),
        ('vistas', 'Vistas'),
        ('detalle', 'Detalle'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='media'
    )
    file = models.FileField(
        upload_to='projects/%Y/%m/',
        validators=[FileExtensionValidator(allowed_extensions=ALLOWED_MEDIA_EXTENSIONS)],
    )
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)
    zone = models.CharField(max_length=10, choices=ZONE_CHOICES, blank=True)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPES, blank=True, null=True)

    @classmethod
    def validate_media_coherence(cls, media_type, plan_type, file_obj=None):
        errors = {}
        if plan_type and media_type not in ('image', 'render'):
            errors['plan_type'] = (
                'Solo los archivos de tipo imagen o render pueden clasificarse como plano técnico.'
            )

        file_name = getattr(file_obj, 'name', None) or (file_obj if isinstance(file_obj, str) else None)
        if file_name:
            ext = os.path.splitext(file_name)[1].lstrip('.').lower()
            if ext:
                if ext not in cls.ALLOWED_MEDIA_EXTENSIONS:
                    errors['file'] = f'La extensión ".{ext}" no está permitida.'
                elif (plan_type or media_type in ('image', 'render')) and ext not in cls.IMAGE_AND_PLAN_EXTENSIONS:
                    errors['file'] = (
                        'Los renders, imágenes y planos deben tener una extensión de imagen o PDF válida.'
                    )
                elif media_type == 'video' and ext not in cls.VIDEO_EXTENSIONS:
                    errors['file'] = (
                        'Los archivos de video deben tener una extensión de video válida (.mp4, .webm, .mov, .ogg).'
                    )
                elif media_type == 'model_3d' and ext not in cls.MODEL_3D_EXTENSIONS:
                    errors['file'] = (
                        'Los modelos 3D deben tener una extensión 3D válida (.obj, .fbx, .gltf, .glb, .stl).'
                    )

        if errors:
            raise ValidationError(errors)

    def clean(self):
        super().clean()
        self.validate_media_coherence(self.media_type, self.plan_type, self.file)

    def __str__(self):
        return f'{self.media_type} - {self.project.title}'


class Contact(models.Model):
    profile = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='contacts'
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Message to {self.profile} from {self.name}'

    class Meta:
        ordering = ['-created_at']


class StudioAbout(models.Model):
    profile = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='about_sections',
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=200, default='Sobre el Estudio')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='about/', blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Sección Nosotros'
        verbose_name_plural = 'Sección Nosotros'


class TeamMember(models.Model):
    profile = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='team_members',
        blank=True,
        null=True,
    )
    full_name = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    avatar = models.ImageField(upload_to='team/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Miembro del Equipo'
        verbose_name_plural = 'Miembros del Equipo'

    def __str__(self):
        return f'{self.full_name} ({self.role})'
