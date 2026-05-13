from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True)
    ROLE_CHOICES = [
        ('user', 'User'),
        ('professional', 'Professional'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return self.username

class Portfolio(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='portfolios'
        )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    services = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    

# Verify usage CASCADE/PROTECT/SET_NULL
class Project(models.Model):
    CATEGORY_CHOICES = [
        ('web', 'Web Development'),
        ('design', 'Design'),
        ('mobile', 'Mobile Apps'),
        ('other','Other'),
    ]
    portfolio = models.ForeignKey(
        Portfolio,
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
        ('3d', '3D Model'),
    ]
        
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='media'
        )
    file = models.FileField(upload_to='projects/%Y/%m/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)

    def __str__(self):
        return f'{self.media_type} - {self.project.title}'

class Contact(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
        )
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='contacts')

    name = models.CharField(max_length=100)
    email= models.EmailField(blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Message to {self.portfolio} from {self.name}'
    
    class Meta:
        ordering = ['-created_at']

