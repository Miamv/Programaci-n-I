import shutil
import tempfile
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Brand, Media, ProfessionalProfile, Project, StudioAbout, TeamMember

User = get_user_model()

VALID_GIF = (
    b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!'
    b'\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01D\x00;'
)


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
        self.temp_media = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.temp_media)
        self.override.enable()

        self.profile = ProfessionalProfile.objects.create(name='Estudio Uno')
        self.other_profile = ProfessionalProfile.objects.create(name='Estudio Dos')

        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='securepass123',
            role=User.RoleChoices.ADMIN,
        )
        self.owner_one = User.objects.create_user(
            username='owner_one',
            email='owner1@example.com',
            password='securepass123',
            role=User.RoleChoices.OWNER,
        )
        self.profile.users.add(self.owner_one)

        self.collab_one = User.objects.create_user(
            username='collab_one',
            email='collab1@example.com',
            password='securepass123',
            role=User.RoleChoices.COLLABORATOR,
        )
        self.profile.users.add(self.collab_one)

        self.viewer = User.objects.create_user(
            username='viewer',
            email='viewer@example.com',
            password='securepass123',
            role=User.RoleChoices.VIEWER,
        )

        self.project_one = Project.objects.create(
            profile=self.profile,
            title='Obra Estudio Uno',
            description='Memoria',
            category='architecture',
        )
        self.project_two = Project.objects.create(
            profile=self.other_profile,
            title='Obra Estudio Dos',
            description='Memoria',
            category='architecture',
        )

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.temp_media, ignore_errors=True)

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}

    def _project_payload(self, profile_id=None):
        return {
            'profile': profile_id or self.profile.id,
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

    def test_admin_can_create_project_in_any_profile(self):
        response = self.client.post(
            '/api/projects/',
            self._project_payload(profile_id=self.other_profile.id),
            format='json',
            **self._auth(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_owner_can_create_project_in_own_profile_but_not_foreign_profile(self):
        own_res = self.client.post(
            '/api/projects/',
            self._project_payload(profile_id=self.profile.id),
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(own_res.status_code, status.HTTP_201_CREATED)

        foreign_res = self.client.post(
            '/api/projects/',
            self._project_payload(profile_id=self.other_profile.id),
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(foreign_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_collaborator_cannot_create_project_but_can_upload_media_to_own_project(self):
        proj_res = self.client.post(
            '/api/projects/',
            self._project_payload(profile_id=self.profile.id),
            format='json',
            **self._auth(self.collab_one),
        )
        self.assertEqual(proj_res.status_code, status.HTTP_403_FORBIDDEN)

        own_media_res = self.client.post(
            '/api/media/',
            {
                'project': self.project_one.id,
                'file': SimpleUploadedFile('render.gif', VALID_GIF, content_type='image/gif'),
                'media_type': 'render',
            },
            format='multipart',
            **self._auth(self.collab_one),
        )
        self.assertEqual(own_media_res.status_code, status.HTTP_201_CREATED)

        foreign_media_res = self.client.post(
            '/api/media/',
            {
                'project': self.project_two.id,
                'file': SimpleUploadedFile('render2.gif', VALID_GIF, content_type='image/gif'),
                'media_type': 'render',
            },
            format='multipart',
            **self._auth(self.collab_one),
        )
        self.assertEqual(foreign_media_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_can_list_projects(self):
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_profile_lookup_by_slug_and_pk_and_inactive_filtering(self):
        # 1. Resolución por slug público
        res_slug = self.client.get(f'/api/profiles/{self.profile.slug}/')
        self.assertEqual(res_slug.status_code, status.HTTP_200_OK)
        self.assertEqual(res_slug.data['slug'], 'estudio-uno')
        self.assertEqual(res_slug.data['name'], 'Estudio Uno')
        # Verificar que `users` no se expone públicamente
        self.assertNotIn('users', res_slug.data)

        # 2. Resolución retrocompatible por ID numérico
        res_pk = self.client.get(f'/api/profiles/{self.profile.id}/')
        self.assertEqual(res_pk.status_code, status.HTTP_200_OK)
        self.assertEqual(res_pk.data['id'], self.profile.id)

        # 3. Slug inexistente devuelve 404
        res_404 = self.client.get('/api/profiles/estudio-inexistente/')
        self.assertEqual(res_404.status_code, status.HTTP_404_NOT_FOUND)

        # 4. Estudio inactivo devuelve 404 para público pero es accesible por ADMIN
        self.other_profile.is_active = False
        self.other_profile.save()

        res_inactive_anon = self.client.get(f'/api/profiles/{self.other_profile.slug}/')
        self.assertEqual(res_inactive_anon.status_code, status.HTTP_404_NOT_FOUND)

        res_inactive_admin = self.client.get(
            f'/api/profiles/{self.other_profile.slug}/',
            **self._auth(self.admin),
        )
        self.assertEqual(res_inactive_admin.status_code, status.HTTP_200_OK)

    def test_public_endpoints_isolate_data_by_profile_slug_and_reject_cross_studio_project_detail(self):
        brand_a = Brand.objects.create(name='Marca Estudio Uno')
        brand_b = Brand.objects.create(name='Marca Estudio Dos')
        self.project_one.brands.add(brand_a)
        self.project_two.brands.add(brand_b)

        about_a = StudioAbout.objects.create(profile=self.profile, title='Nosotros Uno')
        StudioAbout.objects.create(profile=self.other_profile, title='Nosotros Dos')

        member_a = TeamMember.objects.create(profile=self.profile, full_name='Arq. Uno', role='Socio')
        TeamMember.objects.create(profile=self.other_profile, full_name='Arq. Dos', role='Socio')

        media_a = Media.objects.create(
            project=self.project_one,
            file=SimpleUploadedFile('a.gif', VALID_GIF, content_type='image/gif'),
            media_type='render',
        )
        Media.objects.create(
            project=self.project_two,
            file=SimpleUploadedFile('b.gif', VALID_GIF, content_type='image/gif'),
            media_type='render',
        )

        # Proyectos filtrados por profile_slug=estudio-uno
        proj_res = self.client.get('/api/projects/?profile_slug=estudio-uno')
        self.assertEqual(proj_res.status_code, status.HTTP_200_OK)
        self.assertEqual([p['id'] for p in proj_res.data], [self.project_one.id])
        self.assertEqual(proj_res.data[0]['profile_slug'], 'estudio-uno')
        self.assertEqual(proj_res.data[0]['profile_name'], 'Estudio Uno')

        # Detalle de proyecto ajeno bajo profile_slug=estudio-uno devuelve 404
        cross_detail = self.client.get(
            f'/api/projects/{self.project_two.id}/?profile_slug=estudio-uno'
        )
        self.assertEqual(cross_detail.status_code, status.HTTP_404_NOT_FOUND)

        # Detalle de proyecto propio bajo profile_slug=estudio-uno devuelve 200
        own_detail = self.client.get(
            f'/api/projects/{self.project_one.id}/?profile_slug=estudio-uno'
        )
        self.assertEqual(own_detail.status_code, status.HTTP_200_OK)

        # About, Team, Media y Brands filtrados por profile_slug=estudio-uno
        about_res = self.client.get('/api/about/?profile_slug=estudio-uno')
        self.assertEqual([a['id'] for a in about_res.data], [about_a.id])

        team_res = self.client.get('/api/team/?profile_slug=estudio-uno')
        self.assertEqual([m['id'] for m in team_res.data], [member_a.id])

        media_res = self.client.get('/api/media/?profile_slug=estudio-uno')
        self.assertEqual([m['id'] for m in media_res.data], [media_a.id])

        brands_res = self.client.get('/api/brands/?profile_slug=estudio-uno')
        self.assertEqual([b['id'] for b in brands_res.data], [brand_a.id])

    def test_global_brand_write_restricted_to_admin_and_owner_can_associate_brand_ids_on_project(self):
        # 1. OWNER no puede crear, editar ni eliminar marcas globales
        owner_brand_create = self.client.post(
            '/api/brands/',
            {'name': 'Marca Intento Owner'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(owner_brand_create.status_code, status.HTTP_403_FORBIDDEN)

        # 2. ADMIN sí puede crear marcas globales
        admin_brand_create = self.client.post(
            '/api/brands/',
            {'name': 'Marca Global Admin'},
            format='json',
            **self._auth(self.admin),
        )
        self.assertEqual(admin_brand_create.status_code, status.HTTP_201_CREATED)
        brand_id = admin_brand_create.data['id']

        owner_brand_delete = self.client.delete(
            f'/api/brands/{brand_id}/',
            **self._auth(self.owner_one),
        )
        self.assertEqual(owner_brand_delete.status_code, status.HTTP_403_FORBIDDEN)

        # 3. OWNER puede asociar marcas existentes a su propio proyecto mediante `brand_ids`
        patch_proj = self.client.patch(
            f'/api/projects/{self.project_one.id}/',
            {'brand_ids': [brand_id]},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(patch_proj.status_code, status.HTTP_200_OK)
        self.assertEqual([b['id'] for b in patch_proj.data['brands']], [brand_id])

    def test_profile_and_studio_content_hardened_permissions(self):
        # 1. OWNER no puede crear ni eliminar un ProfessionalProfile
        create_prof_res = self.client.post(
            '/api/profiles/',
            {'name': 'Estudio Nuevo Ilegal'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(create_prof_res.status_code, status.HTTP_403_FORBIDDEN)

        delete_prof_res = self.client.delete(
            f'/api/profiles/{self.profile.slug}/',
            **self._auth(self.owner_one),
        )
        self.assertEqual(delete_prof_res.status_code, status.HTTP_403_FORBIDDEN)

        # 2. OWNER puede actualizar datos de su propio estudio pero no cambiar slug ni is_active
        update_own_res = self.client.patch(
            f'/api/profiles/{self.profile.slug}/',
            {'phone': '+5492615550000', 'specialty': 'Arquitectura Sustentable'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(update_own_res.status_code, status.HTTP_200_OK)
        self.assertEqual(update_own_res.data['phone'], '+5492615550000')

        change_slug_res = self.client.patch(
            f'/api/profiles/{self.profile.slug}/',
            {'slug': 'nuevo-slug-no-permitido'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(change_slug_res.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. OWNER no puede actualizar otro estudio ni crear StudioAbout/TeamMember en estudio ajeno
        update_foreign_res = self.client.patch(
            f'/api/profiles/{self.other_profile.slug}/',
            {'phone': '+5492619999999'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(update_foreign_res.status_code, status.HTTP_403_FORBIDDEN)

        foreign_about_res = self.client.post(
            '/api/about/',
            {'profile': self.other_profile.id, 'title': 'Intruso'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(foreign_about_res.status_code, status.HTTP_403_FORBIDDEN)

        own_team_res = self.client.post(
            '/api/team/',
            {'profile': self.profile.id, 'full_name': 'Arq. Propio', 'role': 'Director'},
            format='json',
            **self._auth(self.owner_one),
        )
        self.assertEqual(own_team_res.status_code, status.HTTP_201_CREATED)
