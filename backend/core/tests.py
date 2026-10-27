from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, RequestFactory

from .admin import CustomUserCreationForm, UserAdmin, ProjectAdmin, MediaInline
from .models import User, ProfessionalProfile, Project, Media
from .serializers import ProjectSerializer, ProfessionalProfileSerializer

User = get_user_model()


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

        # Verify email is present in add_fieldsets
        fields_in_add = []
        for _, field_dict in admin_instance.add_fieldsets:
            fields_in_add.extend(field_dict.get('fields', ()))
        self.assertIn('email', fields_in_add)
        self.assertIn('role', fields_in_add)


class MediaAndProjectSerializerTestCase(TestCase):
    def setUp(self):
        self.rf = RequestFactory()
        self.profile = ProfessionalProfile.objects.create(name='Estudio Vértice')
        self.project = Project.objects.create(
            profile=self.profile,
            title='Casa Delta',
            description='Diseño arquitectónico',
            category='architecture',
        )

    def test_project_cover_image_is_none_without_media(self):
        serializer = ProjectSerializer(self.project)
        self.assertIsNone(serializer.data['cover_image'])
        self.assertIsNone(serializer.data['coverImage'])
        self.assertEqual(serializer.data['media'], [])

    def test_project_cover_image_returns_first_render_or_image(self):
        # Create non-image media first (e.g. video)
        Media.objects.create(
            project=self.project,
            file='projects/video.mp4',
            media_type='video',
        )
        # Create render media
        render = Media.objects.create(
            project=self.project,
            file='projects/render1.jpg',
            media_type='render',
            zone='exterior',
        )
        # Create blueprint image with plan_type
        Media.objects.create(
            project=self.project,
            file='projects/planta.jpg',
            media_type='image',
            plan_type='planta',
        )

        request = self.rf.get('/api/projects/')
        serializer = ProjectSerializer(self.project, context={'request': request})
        data = serializer.data

        self.assertIsNotNone(data['cover_image'])
        self.assertIn('render1.jpg', data['cover_image'])
        self.assertEqual(data['cover_image'], data['coverImage'])
        self.assertEqual(len(data['media']), 3)

    def test_project_admin_has_media_inline(self):
        site = AdminSite()
        project_admin = ProjectAdmin(Project, site)
        self.assertEqual(project_admin.check(), [])
        self.assertIn(MediaInline, project_admin.inlines)

    def test_professional_profile_serializer_avatar(self):
        request = self.rf.get('/api/profiles/')
        serializer_empty = ProfessionalProfileSerializer(self.profile, context={'request': request})
        self.assertIsNone(serializer_empty.data['avatar'])

        # Set avatar
        self.profile.avatar = 'team/avatar.jpg'
        self.profile.save()

        serializer_with_avatar = ProfessionalProfileSerializer(self.profile, context={'request': request})
        self.assertIsNotNone(serializer_with_avatar.data['avatar'])
        self.assertIn('team/avatar.jpg', serializer_with_avatar.data['avatar'])
