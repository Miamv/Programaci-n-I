from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Brand, ProfessionalProfile, Project, Media, Contact


class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        help_text='Requerido. Dirección de correo electrónico única para el usuario.',
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('username', 'email', 'role')


class CustomUserChangeForm(UserChangeForm):
    email = forms.EmailField(
        required=True,
        help_text='Requerido. Dirección de correo electrónico única para el usuario.',
    )

    class Meta(UserChangeForm.Meta):
        model = User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rol', {'fields': ('role',)}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': ('username', 'email', 'role', 'password1', 'password2'),
            },
        ),
    )


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialty', 'contact_email', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'users__username', 'users__email')
    filter_horizontal = ('users',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'profile', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title',)
    filter_horizontal = ('brands',)


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('project', 'media_type', 'zone')
    list_filter = ('media_type', 'zone')


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'profile', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email')
