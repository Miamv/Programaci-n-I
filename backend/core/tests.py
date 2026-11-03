import shutil
import tempfile
from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, RequestFactory, override_settings

from .admin import CustomUserCreationForm, UserAdmin, ProjectAdmin, MediaInline
from .models import User, Brand, ProfessionalProfile, Project, Media, StudioAbout, TeamMember
from .serializers import (
    BrandSerializer,
    ProfessionalProfileSerializer,
    ProjectSerializer,
    MediaSerializer,
    StudioAboutSerializer,
    TeamMemberSerializer,
)

User = get_user_model()

VALID_GIF = (
    b'GIF89a\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff!'
    b'\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x01D\x00;'
)


class UserAdminFormsTestCase(TestCase):
    def test_custom_user_creation_form_requires_email(self):
        form = CustomUserCreationForm(data={
            'username': 'testuser',
            'email': '',
            'role': User.RoleChoices.VIEWER,
            'password1': 'StrongP@ss123!',
            'password2': 'StrongP@ss123!',
        })
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)

    def test_custom_user_creation_form_rejects_duplicate_email(self):
        User.objects.create_user(
            username='existing_user',
            email='dupe@example.com',
            password='password123',
        )
        form = CustomUserCreationForm(data={
            'username': 'new_user',
            'email': 'dupe@example.com',
            'role': User.RoleChoices.VIEWER,
            'password1': 'StrongP@ss123!',
            'password2': 'StrongP@ss123!',
        })
        self.assertFalse(form.is_valid())
        self.assertIn('email', form.errors)

    def test_custom_user_creation_form_saves_successfully(self):
        form = CustomUserCreationForm(data={
            'username': 'created_admin_user',
            'email': 'created_admin@example.com',
            'role': User.RoleChoices.COLLABORATOR,
            'password1': 'StrongP@ss123!',
            'password2': 'StrongP@ss123!',
        })
        self.assertTrue(form.is_valid(), form.errors)
        user = form.save()
        self.assertEqual(user.username, 'created_admin_user')
        self.assertEqual(user.email, 'created_admin@example.com')
        self.assertEqual(user.role, User.RoleChoices.COLLABORATOR)

    def test_user_admin_configuration(self):
        site = AdminSite()
        admin_instance = UserAdmin(User, site)
        self.assertEqual(admin_instance.check(), [])

        fields_in_add = []
        for _, field_dict in admin_instance.add_fieldsets:
            fields_in_add.extend(field_dict.get('fields', ()))
        self.assertIn('email', fields_in_add)
        self.assertIn('role', fields_in_add)


class MediaAndProjectSerializerTestCase(TestCase):
    def setUp(self):
        self.temp_media = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.temp_media)
        self.override.enable()

        self.rf = RequestFactory()
        self.profile = ProfessionalProfile.objects.create(name='Estudio Vértice')
        self.project = Project.objects.create(
            profile=self.profile,
            title='Casa Delta',
            description='Diseño arquitectónico',
            category='architecture',
        )

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.temp_media, ignore_errors=True)

    def test_project_cover_image_is_none_without_media(self):
        serializer = ProjectSerializer(self.project)
        self.assertIsNone(serializer.data['cover_image'])
        self.assertIsNone(serializer.data['coverImage'])
        self.assertEqual(serializer.data['media'], [])

    def test_project_cover_image_excludes_plan_types_when_general_render_exists(self):
        # 1. Crear primero un plano técnico
        Media.objects.create(
            project=self.project,
            file='projects/planta_primero.jpg',
            media_type='image',
            plan_type='planta',
        )
        # 2. Crear luego un render general (sin plan_type)
        Media.objects.create(
            project=self.project,
            file='projects/render_principal.jpg',
            media_type='render',
            zone='exterior',
        )

        request = self.rf.get('/api/projects/')
        serializer = ProjectSerializer(self.project, context={'request': request})
        data = serializer.data

        self.assertIsNotNone(data['cover_image'])
        self.assertIn('render_principal.jpg', data['cover_image'])
        self.assertEqual(data['cover_image'], data['coverImage'])

    def test_project_cover_image_falls_back_to_plan_if_only_plans_exist(self):
        Media.objects.create(
            project=self.project,
            file='projects/solo_planta.jpg',
            media_type='image',
            plan_type='planta',
        )
        request = self.rf.get('/api/projects/')
        serializer = ProjectSerializer(self.project, context={'request': request})
        self.assertIn('solo_planta.jpg', serializer.data['cover_image'])

    def test_brand_and_profile_serializers_allow_image_upload_and_return_absolute_url(self):
        request = self.rf.post('/api/brands/')
        logo_file = SimpleUploadedFile('brand_logo.gif', VALID_GIF, content_type='image/gif')
        brand_ser = BrandSerializer(
            data={'name': 'Knoll', 'logo': logo_file},
            context={'request': request},
        )
        self.assertTrue(brand_ser.is_valid(), brand_ser.errors)
        brand = brand_ser.save()
        self.assertTrue(bool(brand.logo))
        self.assertIn('http://testserver/media/brands/', brand_ser.data['logo'])

        avatar_file = SimpleUploadedFile('hero_studio.gif', VALID_GIF, content_type='image/gif')
        prof_ser = ProfessionalProfileSerializer(
            instance=self.profile,
            data={'avatar': avatar_file},
            partial=True,
            context={'request': request},
        )
        self.assertTrue(prof_ser.is_valid(), prof_ser.errors)
        prof = prof_ser.save()
        self.assertTrue(bool(prof.avatar))
        self.assertIn('http://testserver/media/profiles/', prof_ser.data['avatar'])

    def test_about_and_team_serializers_upload_and_associate_profile(self):
        request = self.rf.post('/api/about/')
        sketch = SimpleUploadedFile('sketch.gif', VALID_GIF, content_type='image/gif')
        about_ser = StudioAboutSerializer(
            data={
                'profile': self.profile.id,
                'title': 'Filosofía Vértice',
                'description': 'Rigor tectónico.',
                'image': sketch,
            },
            context={'request': request},
        )
        self.assertTrue(about_ser.is_valid(), about_ser.errors)
        about = about_ser.save()
        self.assertEqual(about.profile, self.profile)
        self.assertIn('http://testserver/media/about/', about_ser.data['image'])

        member_photo = SimpleUploadedFile('member.gif', VALID_GIF, content_type='image/gif')
        team_ser = TeamMemberSerializer(
            data={
                'profile': self.profile.id,
                'full_name': 'Arq. Sofía Bianchi',
                'role': 'Directora BIM',
                'avatar': member_photo,
                'order': 1,
            },
            context={'request': request},
        )
        self.assertTrue(team_ser.is_valid(), team_ser.errors)
        member = team_ser.save()
        self.assertEqual(member.profile, self.profile)
        self.assertIn('http://testserver/media/team/', team_ser.data['avatar'])

    def test_media_plan_types_normalized(self):
        expected = [
            ('planimetria', 'Planimetría'),
            ('planta', 'Planta'),
            ('cortes', 'Cortes'),
            ('vistas', 'Vistas'),
            ('detalle', 'Detalle'),
        ]
        self.assertEqual(Media.PLAN_TYPES, expected)

    def test_media_serializer_allows_file_upload_and_plan_type(self):
        uploaded = SimpleUploadedFile('corte_a.gif', VALID_GIF, content_type='image/gif')
        request = self.rf.post('/api/media/')
        serializer = MediaSerializer(
            data={
                'project': self.project.id,
                'file': uploaded,
                'media_type': 'image',
                'plan_type': 'cortes',
            },
            context={'request': request},
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        media_obj = serializer.save()
        self.assertEqual(media_obj.plan_type, 'cortes')
        self.assertTrue(bool(media_obj.file))
        self.assertIn('http://testserver', serializer.data['file'])

    def test_media_validation_rejects_incoherent_types_and_invalid_extensions(self):
        # 1. Rechazar plan_type en un archivo de tipo 'video'
        video_file = SimpleUploadedFile('recorrido.mp4', b'\x00\x00\x00\x18ftypmp42', content_type='video/mp4')
        ser_incoherent = MediaSerializer(data={
            'project': self.project.id,
            'file': video_file,
            'media_type': 'video',
            'plan_type': 'planta',
        })
        self.assertFalse(ser_incoherent.is_valid())
        self.assertIn('plan_type', ser_incoherent.errors)

        # 2. Rechazar extensión no permitida (.exe)
        bad_file = SimpleUploadedFile('script.exe', b'MZ\x90\x00', content_type='application/octet-stream')
        ser_bad_ext = MediaSerializer(data={
            'project': self.project.id,
            'file': bad_file,
            'media_type': 'image',
        })
        self.assertFalse(ser_bad_ext.is_valid())
        self.assertIn('file', ser_bad_ext.errors)

        # 3. Rechazar extensión de imagen cuando media_type es 'video'
        img_as_video = SimpleUploadedFile('foto.gif', VALID_GIF, content_type='image/gif')
        ser_wrong_type = MediaSerializer(data={
            'project': self.project.id,
            'file': img_as_video,
            'media_type': 'video',
        })
        self.assertFalse(ser_wrong_type.is_valid())
        self.assertIn('file', ser_wrong_type.errors)

    def test_file_cleanup_on_delete_and_replace_and_shared_reference_preservation(self):
        # 1. Crear un Media con archivo físico y verificar que al eliminarlo se borra del storage
        f1 = SimpleUploadedFile('render_temp.gif', VALID_GIF, content_type='image/gif')
        media_item = Media.objects.create(
            project=self.project,
            file=f1,
            media_type='render',
        )
        saved_path = media_item.file.name
        storage = media_item.file.storage
        self.assertTrue(storage.exists(saved_path))

        with self.captureOnCommitCallbacks(execute=True):
            media_item.delete()

        self.assertFalse(storage.exists(saved_path))

        # 2. Verificar reemplazo de archivo en actualización (borra el viejo y conserva el nuevo)
        f_old = SimpleUploadedFile('old_logo.gif', VALID_GIF, content_type='image/gif')
        brand = Brand.objects.create(name='Marca Test', logo=f_old)
        old_logo_path = brand.logo.name
        self.assertTrue(brand.logo.storage.exists(old_logo_path))

        f_new = SimpleUploadedFile('new_logo.gif', VALID_GIF, content_type='image/gif')
        with self.captureOnCommitCallbacks(execute=True):
            brand.logo = f_new
            brand.save()

        new_logo_path = brand.logo.name
        self.assertFalse(brand.logo.storage.exists(old_logo_path))
        self.assertTrue(brand.logo.storage.exists(new_logo_path))

        # 3. Verificar que si dos registros apuntan al mismo archivo, borrar uno NO borra el archivo físico
        brand_clon = Brand.objects.create(name='Marca Clon', logo=new_logo_path)
        with self.captureOnCommitCallbacks(execute=True):
            brand_clon.delete()

        self.assertTrue(brand.logo.storage.exists(new_logo_path))

    def test_project_admin_has_media_inline(self):
        site = AdminSite()
        project_admin = ProjectAdmin(Project, site)
        self.assertEqual(project_admin.check(), [])
        self.assertIn(MediaInline, project_admin.inlines)

    def test_professional_profile_serializer_avatar(self):
        request = self.rf.get('/api/profiles/')
        serializer_empty = ProfessionalProfileSerializer(self.profile, context={'request': request})
        self.assertIsNone(serializer_empty.data['avatar'])

        self.profile.avatar = 'team/avatar.jpg'
        self.profile.save()

        serializer_with_avatar = ProfessionalProfileSerializer(self.profile, context={'request': request})
        self.assertIsNotNone(serializer_with_avatar.data['avatar'])
        self.assertIn('team/avatar.jpg', serializer_with_avatar.data['avatar'])
