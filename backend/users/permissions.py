from django.contrib.auth import get_user_model
from rest_framework import permissions

from core.models import ProfessionalProfile, Project

User = get_user_model()


def _user_owns_profile(user, profile_id):
    try:
        return ProfessionalProfile.objects.filter(pk=int(profile_id), users=user).exists()
    except (ValueError, TypeError):
        return False


def _user_owns_project(user, project_id):
    try:
        return Project.objects.filter(pk=int(project_id), profile__users=user).exists()
    except (ValueError, TypeError):
        return False


class IsAdminRole(permissions.BasePermission):
    """Permiso para usuarios con rol ADMIN."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.RoleChoices.ADMIN


class IsOwnerRole(permissions.BasePermission):
    """Permiso para usuarios con rol OWNER."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.RoleChoices.OWNER


class IsCollaboratorRole(permissions.BasePermission):
    """Permiso para usuarios con rol COLLABORATOR."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.RoleChoices.COLLABORATOR


class CanManageProject(permissions.BasePermission):
    """
    ADMIN y OWNER pueden crear y eliminar proyectos.
    ADMIN, OWNER y COLLABORATOR pueden editar.
    Validación: El usuario (no ADMIN) debe pertenecer al perfil del proyecto tanto en creación como en edición/borrado.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = request.user.role
        if role == User.RoleChoices.ADMIN:
            return True

        if view.action == 'create':
            if role != User.RoleChoices.OWNER:
                return False
            profile_id = request.data.get('profile')
            if profile_id is not None and profile_id != '':
                return _user_owns_profile(request.user, profile_id)
            return ProfessionalProfile.objects.filter(users=request.user).exists()

        if view.action == 'destroy':
            return role == User.RoleChoices.OWNER

        if view.action in ['update', 'partial_update']:
            return role in [User.RoleChoices.OWNER, User.RoleChoices.COLLABORATOR]

        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True

        if not obj.profile.users.filter(id=request.user.id).exists():
            return False

        # Si en un update/partial_update se intenta reasignar el proyecto a otro perfil,
        # verificar que el perfil destino también pertenezca al usuario.
        if view.action in ['update', 'partial_update'] and 'profile' in request.data:
            new_profile_id = request.data.get('profile')
            if new_profile_id is not None and new_profile_id != '':
                return _user_owns_profile(request.user, new_profile_id)

        return True


class CanUploadMedia(permissions.BasePermission):
    """
    ADMIN, OWNER y COLLABORATOR pueden subir y gestionar contenido multimedia,
    únicamente sobre proyectos pertenecientes a sus perfiles autorizados.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = request.user.role
        if role == User.RoleChoices.ADMIN:
            return True

        if role not in [User.RoleChoices.OWNER, User.RoleChoices.COLLABORATOR]:
            return False

        if view.action == 'create':
            project_id = request.data.get('project')
            if project_id is not None and project_id != '':
                return _user_owns_project(request.user, project_id)
            return Project.objects.filter(profile__users=request.user).exists()

        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True

        if not obj.project.profile.users.filter(id=request.user.id).exists():
            return False

        if view.action in ['update', 'partial_update'] and 'project' in request.data:
            new_project_id = request.data.get('project')
            if new_project_id is not None and new_project_id != '':
                return _user_owns_project(request.user, new_project_id)

        return True


class CanManageProfile(permissions.BasePermission):
    """
    ADMIN puede administrar cualquier perfil.
    OWNER puede administrar su propio perfil.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [User.RoleChoices.ADMIN, User.RoleChoices.OWNER]

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True
        return obj.users.filter(id=request.user.id).exists()


class CanManageContact(permissions.BasePermission):
    """
    ADMIN puede gestionar cualquier contacto.
    OWNER puede gestionar los contactos de sus propios perfiles.
    Cualquier usuario puede crear un contacto.
    """
    def has_permission(self, request, view):
        if view.action == 'create':
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        if view.action in ['list', 'retrieve']:
            return True

        return request.user.role in [
            User.RoleChoices.ADMIN,
            User.RoleChoices.OWNER,
        ]

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True

        if request.user.role == User.RoleChoices.OWNER:
            return obj.profile.users.filter(id=request.user.id).exists()

        return bool(request.user.email and obj.email.lower() == request.user.email.lower())


class CanManageBrand(permissions.BasePermission):
    """
    ADMIN y OWNER pueden gestionar marcas.
    Cualquiera puede listar/consultar.
    """
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve']:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            User.RoleChoices.ADMIN,
            User.RoleChoices.OWNER,
        ]


class CanManageStudioContent(permissions.BasePermission):
    """
    ADMIN y OWNER pueden gestionar contenido institucional del estudio (Nosotros, Equipo).
    Cualquiera puede listar o consultar públicamente.
    """
    def has_permission(self, request, view):
        if view.action in ['list', 'retrieve']:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == User.RoleChoices.ADMIN:
            return True
        if request.user.role != User.RoleChoices.OWNER:
            return False

        if view.action == 'create' and 'profile' in request.data:
            profile_id = request.data.get('profile')
            if profile_id is not None and profile_id != '':
                return _user_owns_profile(request.user, profile_id)

        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True
        if request.user.role != User.RoleChoices.OWNER:
            return False
        if getattr(obj, 'profile_id', None) is not None:
            if not obj.profile.users.filter(id=request.user.id).exists():
                return False
        if view.action in ['update', 'partial_update'] and 'profile' in request.data:
            new_profile_id = request.data.get('profile')
            if new_profile_id is not None and new_profile_id != '':
                return _user_owns_profile(request.user, new_profile_id)
        return True
