from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import ProfessionalProfile

User = get_user_model()


class AuthTestCase(APITestCase):
    def test_register_creates_viewer_role(self):
        response = self.client.post(
            reverse('auth_register'),
            {
                'username': 'newuser',
                'email': 'newuser@example.com',
                'password': 'securepass123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='newuser')
        self.assertEqual(user.role, User.RoleChoices.VIEWER)

    def test_register_duplicate_email_rejected(self):
        User.objects.create_user(
            username='existing',
            email='dupe@example.com',
            password='securepass123',
        )
        response = self.client.post(
            reverse('auth_register'),
            {
                'username': 'newuser',
                'email': 'dupe@example.com',
                'password': 'securepass123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_refresh(self):
        User.objects.create_user(
            username='jdoe',
            email='jdoe@example.com',
            password='securepass123',
        )
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'jdoe', 'password': 'securepass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access = response.data['access']
        refresh = response.data['refresh']

        refresh_response = self.client.post(
            reverse('token_refresh'),
            {'refresh': refresh},
            format='json',
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        profile = self.client.get(reverse('user_profile'))
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data['username'], 'jdoe')

    def test_profile_requires_authentication(self):
        response = self.client.get(reverse('user_profile'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_refresh_token(self):
        user = User.objects.create_user(
            username='jdoe',
            email='jdoe@example.com',
            password='securepass123',
        )
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        logout = self.client.post(
            reverse('auth_logout'),
            {'refresh': str(refresh)},
            format='json',
        )
        self.assertEqual(logout.status_code, status.HTTP_205_RESET_CONTENT)

        refresh_response = self.client.post(
            reverse('token_refresh'),
            {'refresh': str(refresh)},
            format='json',
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_refresh_field(self):
        user = User.objects.create_user(
            username='jdoe',
            email='jdoe@example.com',
            password='securepass123',
        )
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

        response = self.client.post(reverse('auth_logout'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RolePermissionTestCase(APITestCase):
    def setUp(self):
        self.profile = ProfessionalProfile.objects.create(name='Estudio Uno')
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='securepass123',
            role=User.RoleChoices.ADMIN,
        )
        self.viewer = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='securepass123',
            role=User.RoleChoices.VIEWER,
        )

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}

    def _project_payload(self):
        return {
            'profile': self.profile.id,
            'title': 'Proyecto',
            'description': 'Descripción',
            'category': 'architecture',
        }

    def test_viewer_cannot_create_project(self):
        response = self.client.post(
            '/api/projects/',
            self._project_payload(),
            format='json',
            **self._auth(self.viewer),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_project(self):
        response = self.client.post(
            '/api/projects/',
            self._project_payload(),
            format='json',
            **self._auth(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_anonymous_can_list_projects(self):
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
