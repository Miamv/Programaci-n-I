from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ProfessionalProfile, Project, Media, Contact


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Rol', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Rol', {'fields': ('role',)}),
    )


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


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('project', 'media_type')
    list_filter = ('media_type',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'profile', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email')
