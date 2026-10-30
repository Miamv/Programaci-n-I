from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.html import format_html
from .models import User, Brand, ProfessionalProfile, Project, Media, Contact, StudioAbout, TeamMember


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


class MediaInline(admin.TabularInline):
    model = Media
    extra = 1
    fields = ('file', 'preview', 'media_type', 'zone', 'plan_type')
    readonly_fields = ('preview',)

    def preview(self, instance):
        if instance.pk and instance.file:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 90px; object-fit: cover; border-radius: 4px;" alt="preview" />',
                instance.file.url
            )
        return "-"
    preview.short_description = "Vista previa"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'profile', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title',)
    filter_horizontal = ('brands',)
    inlines = [MediaInline]


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('project', 'preview', 'media_type', 'zone', 'plan_type')
    list_filter = ('media_type', 'zone', 'plan_type')
    readonly_fields = ('preview',)

    def preview(self, instance):
        if instance.pk and instance.file:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 90px; object-fit: cover; border-radius: 4px;" alt="preview" />',
                instance.file.url
            )
        return "-"
    preview.short_description = "Vista previa"


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'profile', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email')


@admin.register(StudioAbout)
class StudioAboutAdmin(admin.ModelAdmin):
    list_display = ('title', 'updated_at')
    search_fields = ('title', 'description')


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role', 'order', 'preview')
    list_editable = ('order',)
    search_fields = ('full_name', 'role')
    readonly_fields = ('preview',)

    def preview(self, instance):
        if instance.pk and instance.avatar:
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 40px; border-radius: 50%; object-fit: cover;" alt="preview" />',
                instance.avatar.url
            )
        return "-"
    preview.short_description = "Avatar"
