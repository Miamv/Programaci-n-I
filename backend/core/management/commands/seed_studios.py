from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import ProfessionalProfile, Project, StudioAbout, TeamMember, Brand

User = get_user_model()


class Command(BaseCommand):
    help = 'Puebla la base de datos con al menos 2 estudios independientes para validar la plataforma multi-estudio.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Inicializando datos de prueba multi-estudio...'))

        # 1. Crear usuarios administradores / propietarios si no existen
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@plataforma.com',
                'role': User.RoleChoices.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if _:
            admin_user.set_password('Admin1234!')
            admin_user.save()

        owner_vertice, _ = User.objects.get_or_create(
            username='owner_vertice',
            defaults={
                'email': 'vertice@estudio.com',
                'role': User.RoleChoices.OWNER,
            }
        )
        if _:
            owner_vertice.set_password('Owner1234!')
            owner_vertice.save()

        owner_austral, _ = User.objects.get_or_create(
            username='owner_austral',
            defaults={
                'email': 'austral@estudio.com',
                'role': User.RoleChoices.OWNER,
            }
        )
        if _:
            owner_austral.set_password('Owner1234!')
            owner_austral.save()

        # 2. Estudio 1: Vértice Arquitectura (slug: 'vertice')
        studio_vertice, created_v = ProfessionalProfile.objects.update_or_create(
            slug='vertice',
            defaults={
                'name': 'VÉRTICE',
                'specialty': 'Arquitectura Contemporánea & BIM',
                'description': (
                    'Diseñamos el espacio que transforma tu vida. '
                    'Abordamos cada encargo con rigor conceptual, materialidad honesta y un diálogo '
                    'constante entre el paisaje y la geometría arquitectónica.'
                ),
                'services': 'Proyecto Ejecutivo, Dirección de Obra, Modelado BIM, Interiorismo',
                'contact_email': 'contacto@vertice.com',
            }
        )
        studio_vertice.users.add(admin_user, owner_vertice)
        self.stdout.write(self.style.SUCCESS(f'Estudio configurado: {studio_vertice.name} (/estudios/{studio_vertice.slug}/)'))

        # Proyectos Estudio 1
        p1, _ = Project.objects.update_or_create(
            profile=studio_vertice,
            title='Casa Terraza',
            defaults={
                'description': 'Vivienda unifamiliar escalonada en pendiente con vistas panorámicas a la cordillera.',
                'category': 'architecture',
            }
        )
        p2, _ = Project.objects.update_or_create(
            profile=studio_vertice,
            title='Pabellón Botánico',
            defaults={
                'description': 'Estructura liviana de acero y vidrio integrada en un jardín de especies autóctonas.',
                'category': 'design',
            }
        )
        p3, _ = Project.objects.update_or_create(
            profile=studio_vertice,
            title='Torre Prisma',
            defaults={
                'description': 'Edificio corporativo con certificación LEED y fachada ventilada de hormigón visto.',
                'category': 'architecture',
            }
        )

        # Miembros de equipo Estudio 1
        TeamMember.objects.update_or_create(
            profile=studio_vertice,
            full_name='Arq. Mateo Rossi',
            defaults={'role': 'Director de Proyecto & BIM', 'order': 1}
        )
        TeamMember.objects.update_or_create(
            profile=studio_vertice,
            full_name='Ing. Clara Benítez',
            defaults={'role': 'Cálculo Estructural & Sostenibilidad', 'order': 2}
        )

        # 3. Estudio 2: Estudio Austral (slug: 'estudio-austral')
        studio_austral, created_a = ProfessionalProfile.objects.update_or_create(
            slug='estudio-austral',
            defaults={
                'name': 'Estudio Austral',
                'specialty': 'Arquitectura Bioclimática & Madera Laminada',
                'description': (
                    'Taller de arquitectura patagónica enfocado en refugios de montaña, '
                    'eficiencia térmica pasiva y el uso responsable de maderas nativas y certificadas.'
                ),
                'services': 'Construcción en Madera, Asesoría Bioclimática, Prefabricación de Módulos',
                'contact_email': 'hola@estudioaustral.ar',
            }
        )
        studio_austral.users.add(admin_user, owner_austral)
        self.stdout.write(self.style.SUCCESS(f'Estudio configurado: {studio_austral.name} (/estudios/{studio_austral.slug}/)'))

        # Proyectos Estudio 2
        pa1, _ = Project.objects.update_or_create(
            profile=studio_austral,
            title='Refugio Cordillera',
            defaults={
                'description': 'Refugio de alta montaña construido con madera laminada y triple vidriado hermético.',
                'category': 'architecture',
            }
        )
        pa2, _ = Project.objects.update_or_create(
            profile=studio_austral,
            title='Cabaña Los Alerces',
            defaults={
                'description': 'Vivienda bioclimática en el bosque andino con colectores solares térmicos y piso radiante.',
                'category': 'interior_design',
            }
        )
        pa3, _ = Project.objects.update_or_create(
            profile=studio_austral,
            title='Mirador del Glaciar',
            defaults={
                'description': 'Pasarela y centro de interpretación mimetizado con la topografía de la estepa.',
                'category': 'design',
            }
        )

        # Miembros de equipo Estudio 2
        TeamMember.objects.update_or_create(
            profile=studio_austral,
            full_name='Arq. Lucas Bariloche',
            defaults={'role': 'Especialista en Madera & Prefabricados', 'order': 1}
        )
        TeamMember.objects.update_or_create(
            profile=studio_austral,
            full_name='Diseñadora Valentina Sur',
            defaults={'role': 'Diseño de Interiores & Paisaje', 'order': 2}
        )

        self.stdout.write(self.style.SUCCESS('\nSeeding completado con éxito:'))
        self.stdout.write(f'  - Portfolio 1: /estudios/{studio_vertice.slug}/ (Proyectos: {studio_vertice.projects.count()})')
        self.stdout.write(f'  - Portfolio 2: /estudios/{studio_austral.slug}/ (Proyectos: {studio_austral.projects.count()})')
