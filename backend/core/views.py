from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Brand, ProfessionalProfile, Project, Media, Contact
from .serializers import (
    BrandSerializer,
    ProfessionalProfileSerializer,
    ProjectSerializer,
    MediaSerializer,
    ContactSerializer,
)
from users.permissions import CanManageProject, CanUploadMedia, CanManageProfile, CanManageContact, CanManageBrand


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageBrand()]


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all()
    serializer_class = ProfessionalProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProfile()]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().prefetch_related('brands', 'media')
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProject()]


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanUploadMedia()]


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [CanManageContact()]

    def get_queryset(self):
        user = self.request.user

        # Usuarios no autenticados no pueden consultar contactos.
        if not user.is_authenticated:
            return Contact.objects.none()

        # ADMIN puede ver todos los contactos.
        if user.role == user.RoleChoices.ADMIN:
            return Contact.objects.all()

        # OWNER solo puede ver contactos de sus propios perfiles.
        if user.role == user.RoleChoices.OWNER:
            return Contact.objects.filter(profile__users=user)

        # Para usuarios VIEWER o COLLABORATOR: consultar solicitudes enviadas con su email
        if user.email:
            return Contact.objects.filter(email__iexact=user.email)
        return Contact.objects.none()
