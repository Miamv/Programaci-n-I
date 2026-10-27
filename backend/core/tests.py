from django.contrib.admin.sites import AdminSite
from django.contrib.auth import get_user_model
from django.test import TestCase

from .admin import CustomUserCreationForm, UserAdmin

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
