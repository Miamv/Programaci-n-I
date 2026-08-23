from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import ProfessionalProfile, Project, Media, Contact
from .serializers import (
    ProfessionalProfileSerializer,
    ProjectSerializer,
    MediaSerializer,
    ContactSerializer,
)
from users.permissions import CanManageProject, CanUploadMedia, CanManageProfile, CanManageContact

class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all()
    serializer_class = ProfessionalProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProfile()]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProject()]


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer

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
        return Contact.objects.filter(profile__users=user)
    