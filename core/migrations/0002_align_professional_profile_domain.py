from django.db import migrations, models


def copy_profile_owner_to_users(apps, schema_editor):
    ProfessionalProfile = apps.get_model('core', 'ProfessionalProfile')
    for profile in ProfessionalProfile.objects.exclude(user_id=None):
        profile.users.add(profile.user_id)


def restore_profile_owner_from_users(apps, schema_editor):
    ProfessionalProfile = apps.get_model('core', 'ProfessionalProfile')
    for profile in ProfessionalProfile.objects.all():
        first_user = profile.users.first()
        if first_user:
            profile.user_id = first_user.pk
            profile.save(update_fields=['user'])


def update_old_media_types(apps, schema_editor):
    Media = apps.get_model('core', 'Media')
    Media.objects.filter(media_type='3d').update(media_type='model_3d')


def restore_old_media_types(apps, schema_editor):
    Media = apps.get_model('core', 'Media')
    Media.objects.filter(media_type='model_3d').update(media_type='3d')


def update_old_project_categories(apps, schema_editor):
    Project = apps.get_model('core', 'Project')
    Project.objects.filter(category='web').update(category='design')
    Project.objects.filter(category='mobile').update(category='other')


def restore_old_project_categories(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Portfolio',
            new_name='ProfessionalProfile',
        ),
        migrations.RenameField(
            model_name='contact',
            old_name='portfolio',
            new_name='profile',
        ),
        migrations.RenameField(
            model_name='project',
            old_name='portfolio',
            new_name='profile',
        ),
        migrations.AddField(
            model_name='professionalprofile',
            name='contact_email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='professionalprofile',
            name='specialty',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='professionalprofile',
            name='users',
            field=models.ManyToManyField(
                related_name='professional_profiles',
                to='core.user',
            ),
        ),
        migrations.RunPython(
            copy_profile_owner_to_users,
            restore_profile_owner_from_users,
        ),
        migrations.RemoveField(
            model_name='professionalprofile',
            name='user',
        ),
        migrations.RemoveField(
            model_name='user',
            name='role',
        ),
        migrations.RemoveField(
            model_name='contact',
            name='user',
        ),
        migrations.AlterField(
            model_name='contact',
            name='email',
            field=models.EmailField(max_length=254),
        ),
        migrations.RunPython(
            update_old_project_categories,
            restore_old_project_categories,
        ),
        migrations.AlterField(
            model_name='project',
            name='category',
            field=models.CharField(
                choices=[
                    ('architecture', 'Architecture'),
                    ('design', 'Design'),
                    ('photography', 'Photography'),
                    ('interior_design', 'Interior Design'),
                    ('render', 'Render'),
                    ('other', 'Other'),
                ],
                max_length=20,
            ),
        ),
        migrations.RunPython(
            update_old_media_types,
            restore_old_media_types,
        ),
        migrations.AlterField(
            model_name='media',
            name='media_type',
            field=models.CharField(
                choices=[
                    ('image', 'Image'),
                    ('video', 'Video'),
                    ('render', 'Render'),
                    ('virtual_tour', 'Virtual Tour'),
                    ('model_3d', '3D Model'),
                    ('interactive', 'Interactive Content'),
                ],
                max_length=20,
            ),
        ),
    ]
