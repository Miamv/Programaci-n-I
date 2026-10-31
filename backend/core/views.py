from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Brand, ProfessionalProfile, Project, Media, Contact, StudioAbout, TeamMember
from .serializers import (
    BrandSerializer,
    ProfessionalProfileSerializer,
    ProjectSerializer,
    MediaSerializer,
    ContactSerializer,
    StudioAboutSerializer,
    TeamMemberSerializer,
)
from users.permissions import (
    CanManageProject,
    CanUploadMedia,
    CanManageProfile,
    CanManageContact,
    CanManageBrand,
    CanManageStudioContent,
)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageBrand()]


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    """
    Gestiona y expone los estudios de arquitectura registrados.
    Permite búsqueda y consulta por ID o por identificador público (slug).
    """
    queryset = ProfessionalProfile.objects.all().prefetch_related('users')
    serializer_class = ProfessionalProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'by_slug']:
            return [AllowAny()]
        return [CanManageProfile()]

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs.get(lookup_url_kwarg)
        if lookup_val:
            if str(lookup_val).isdigit():
                return get_object_or_404(self.get_queryset(), pk=lookup_val)
            return get_object_or_404(self.get_queryset(), slug=lookup_val)
        return super().get_object()

    def get_queryset(self):
        qs = super().get_queryset()
        slug = self.request.query_params.get('slug')
        if slug:
            qs = qs.filter(slug=slug)
        return qs


class ProjectViewSet(viewsets.ModelViewSet):
    """
    Gestiona los proyectos del portfolio.
    Permite aislar y filtrar por estudio utilizando ?profile=<id_or_slug> o ?studio=<slug>.
    """
    queryset = Project.objects.all().prefetch_related('brands', 'media', 'profile')
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProject()]

    def get_queryset(self):
        qs = super().get_queryset()
        profile_param = (
            self.request.query_params.get('profile') or
            self.request.query_params.get('studio') or
            self.request.query_params.get('profile_slug')
        )
        if profile_param:
            if str(profile_param).isdigit():
                qs = qs.filter(profile_id=profile_param)
            else:
                qs = qs.filter(profile__slug=profile_param)
        return qs


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


class StudioAboutViewSet(viewsets.ModelViewSet):
    queryset = StudioAbout.objects.all()
    serializer_class = StudioAboutSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageStudioContent()]

    def get_queryset(self):
        qs = super().get_queryset()
        profile_param = self.request.query_params.get('profile') or self.request.query_params.get('studio')
        if profile_param:
            if str(profile_param).isdigit():
                qs = qs.filter(profile_id=profile_param)
            else:
                qs = qs.filter(profile__slug=profile_param)
        return qs


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageStudioContent()]

    def get_queryset(self):
        qs = super().get_queryset()
        profile_param = self.request.query_params.get('profile') or self.request.query_params.get('studio')
        if profile_param:
            if str(profile_param).isdigit():
                qs = qs.filter(profile_id=profile_param)
            else:
                qs = qs.filter(profile__slug=profile_param)
        return qs
