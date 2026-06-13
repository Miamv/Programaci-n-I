from django.db import models
from django.conf import settings


class ProfessionalProfile(models.Model):
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='professional_profiles')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    specialty = models.CharField(max_length=100, blank=True)
    services = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Media(models.Model):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('render', 'Render'),
        ('virtual_tour', 'Virtual Tour'),
        ('model_3d', '3D Model'),
        ('interactive', 'Interactive Content'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='media'
    )
    file = models.FileField(upload_to='projects/%Y/%m/')
    media_type = models.CharField(max_length=20, choices=MEDIA_TYPES)

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
