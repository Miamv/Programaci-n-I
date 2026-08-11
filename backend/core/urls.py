from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    ProfessionalProfileViewSet,
    ProjectViewSet,
    MediaViewSet,
    ContactViewSet
)

router = DefaultRouter()

router.register(r'users', UserViewSet)
router.register(r'profiles', ProfessionalProfileViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'media', MediaViewSet)
router.register(r'contacts', ContactViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
