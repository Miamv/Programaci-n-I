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


def _is_platform_admin(user):
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or getattr(user, 'role', None) == user.RoleChoices.ADMIN)
    )


def _filter_by_profile_params(qs, request, prefix='profile'):
    profile_slug = request.query_params.get('profile_slug')
    profile_id = request.query_params.get('profile')

    if profile_slug:
        qs = qs.filter(**{f'{prefix}__slug': profile_slug})

    if profile_id is not None and profile_id != '':
        if str(profile_id).isdigit():
            qs = qs.filter(**{f'{prefix}_id': int(profile_id)})
        else:
            return qs.none()

    return qs


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('id')
    serializer_class = BrandSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        profile_slug = self.request.query_params.get('profile_slug')
        profile_id = self.request.query_params.get('profile')

        if profile_slug or (profile_id is not None and profile_id != ''):
            if not _is_platform_admin(self.request.user):
                qs = qs.filter(projects__profile__is_active=True)
            qs = _filter_by_profile_params(qs, self.request, prefix='projects__profile').distinct()

        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageBrand()]


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all().order_by('id')
    serializer_class = ProfessionalProfileSerializer
    lookup_value_regex = r'[^/]+'

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_platform_admin(self.request.user):
            qs = qs.filter(is_active=True)

        slug_param = self.request.query_params.get('slug')
        if slug_param:
            qs = qs.filter(slug=slug_param)

        if self.request.query_params.get('mine') in ('1', 'true', 'True'):
            if not self.request.user.is_authenticated:
                return qs.none()
            if not _is_platform_admin(self.request.user):
                qs = qs.filter(users=self.request.user)

        return qs

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_value = self.kwargs.get(self.lookup_url_kwarg or self.lookup_field)
        if lookup_value is not None and str(lookup_value).isdigit():
            obj = get_object_or_404(queryset, pk=int(lookup_value))
        else:
            obj = get_object_or_404(queryset, slug=lookup_value)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProfile()]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().select_related('profile').prefetch_related('brands', 'media')
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_platform_admin(self.request.user):
            qs = qs.filter(profile__is_active=True)
        return _filter_by_profile_params(qs, self.request, prefix='profile')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageProject()]


class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all().select_related('project', 'project__profile')
    serializer_class = MediaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_platform_admin(self.request.user):
            qs = qs.filter(project__profile__is_active=True)

        project_id = self.request.query_params.get('project')
        if project_id is not None and project_id != '':
            if str(project_id).isdigit():
                qs = qs.filter(project_id=int(project_id))
            else:
                return qs.none()

        return _filter_by_profile_params(qs, self.request, prefix='project__profile')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanUploadMedia()]


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().select_related('profile')
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
        if _is_platform_admin(user):
            qs = Contact.objects.all().select_related('profile')
            return _filter_by_profile_params(qs, self.request, prefix='profile')

        # OWNER solo puede ver contactos de sus propios perfiles.
        if user.role == user.RoleChoices.OWNER:
            qs = Contact.objects.filter(profile__users=user).select_related('profile')
            return _filter_by_profile_params(qs, self.request, prefix='profile')

        # Para usuarios VIEWER o COLLABORATOR: consultar solicitudes enviadas con su email
        if user.email:
            qs = Contact.objects.filter(email__iexact=user.email).select_related('profile')
            return _filter_by_profile_params(qs, self.request, prefix='profile')
        return Contact.objects.none()


class StudioAboutViewSet(viewsets.ModelViewSet):
    queryset = StudioAbout.objects.all().select_related('profile')
    serializer_class = StudioAboutSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_platform_admin(self.request.user):
            qs = qs.filter(profile__is_active=True)
        return _filter_by_profile_params(qs, self.request, prefix='profile')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageStudioContent()]


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.all().select_related('profile')
    serializer_class = TeamMemberSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_platform_admin(self.request.user):
            qs = qs.filter(profile__is_active=True)
        return _filter_by_profile_params(qs, self.request, prefix='profile')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [CanManageStudioContent()]
