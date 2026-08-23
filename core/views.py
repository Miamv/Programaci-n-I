from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ProfessionalProfile, Project, Media, Contact
from .serializers import (
    ProfessionalProfileSerializer,
    ProjectSerializer,
    MediaSerializer,
    ContactSerializer,
)
from users.permissions import CanManageProject, CanUploadMedia, CanManageProfile

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
    permission_classes = [IsAuthenticated]
