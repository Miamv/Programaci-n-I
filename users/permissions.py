from rest_framework import permissions
from users.models import User

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
    Validación: El usuario debe pertenecer al perfil del proyecto.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        role = request.user.role
        
        if view.action == 'create':
            return role in [User.RoleChoices.ADMIN, User.RoleChoices.OWNER]
        
        if view.action == 'destroy':
            return role in [User.RoleChoices.ADMIN, User.RoleChoices.OWNER]
        
        if view.action in ['update', 'partial_update']:
            return role in [User.RoleChoices.ADMIN, User.RoleChoices.OWNER, User.RoleChoices.COLLABORATOR]
            
        return True

    def has_object_permission(self, request, view, obj):
        # ADMIN tiene acceso total
        if request.user.role == User.RoleChoices.ADMIN:
            return True
        
        # OWNER y COLLABORATOR deben pertenecer al perfil del proyecto
        return obj.profile.users.filter(id=request.user.id).exists()

class CanUploadMedia(permissions.BasePermission):
    """ADMIN, OWNER y COLLABORATOR pueden subir contenido multimedia."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [User.RoleChoices.ADMIN, User.RoleChoices.OWNER, User.RoleChoices.COLLABORATOR]

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True
        # El usuario debe pertenecer al perfil del proyecto asociado al media
        return obj.project.profile.users.filter(id=request.user.id).exists()

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

class CanManageUser(permissions.BasePermission):
    """
    ADMIN puede administrar cualquier usuario.
    OWNER puede administrar usuarios asociados a sus perfiles profesionales.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [User.RoleChoices.ADMIN, User.RoleChoices.OWNER]

    def has_object_permission(self, request, view, obj):
        if request.user.role == User.RoleChoices.ADMIN:
            return True
        
        if request.user.role == User.RoleChoices.OWNER:
            # Verifica si el usuario a gestionar comparte al menos un perfil con el OWNER
            # Esto implica que el usuario es un colaborador o co-owner de su estudio
            return obj.professional_profiles.filter(
                users__id=request.user.id
            ).exists()
            
        return False
