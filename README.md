# Plataforma para exhibir proyectos profesionales

**Descripción:**  
Plataforma orientada a la publicación y visualización de proyectos profesionales mediante contenido multimedia y recorridos virtuales interactivos.

El sistema está pensado principalmente para profesionales, empresas y estudios que necesiten presentar proyectos de manera más visual, moderna y comercial, facilitando la promoción de trabajos, servicios y desarrollos ante potenciales clientes.

La plataforma está diseñada para adaptarse a distintos tipos de profesionales y proyectos, como arquitectura, diseño, fotografía, interiorismo y otros rubros creativos o técnicos.

Su enfoque principal es ofrecer una herramienta profesional de exhibición visual y presentación comercial de proyectos, permitiendo compartir contenido mediante enlaces accesibles para clientes o interesados.

---

## Objetivo del proyecto:

El objetivo es permitir que profesionales o equipos de trabajo puedan:
 - Publicar y administrar proyectos profesionales 
 - Ofrecer recorridos virtuales interactivos
 - Mejorar la presentación visual y comercial de sus trabajos
 - Facilitar el contacto con potenciales clientes o interesados

---

## Características Principales

- Registro y autenticación de usuarios
- Administración de perfiles profesionales o estudios
- Gestión de proyectos profesionales 
- Asociación de imágenes, videos y contenido multimedia
- Visualización de proyectos
- Integración de recorridos virtuales o modelos interactivos
- Contacto entre visitantes y perfiles profesionales
  
## Entidades 

1. **Usuario**  
   - Representa a un miembro autorizado dentro de la plataforma.
   - Los usuarios forman parte de un perfil profesional o estudio y poseen permisos para administrar contenido y proyectos.
   - Funciones: Iniciar sesión, administrar perfiles profesionales, gestionar proyectos, cargar contenido multimedia, editar información pública, compartir proyectos con clientes o interesados.

2. **Perfil Profesional/ Estudio**  
   - Representa la identidad pública y comercial visible dentro de la plataforma.
   - Agrupa la información institucional o profesional y centraliza los proyectos publicados por un equipo de trabajo.
   - Contiene información como: Nombre profesional o comercial, descripción, especialidad o rubro, servicios ofrecidos, información de contacto, imagen institucional, proyectos asociados.
   - Un perfil profesional puede estar administrado por múltiples usuarios.
     
3. **Proyecto**  
   - Representa cada proyecto publicado por un perfil profesional o estudio.
   - Los proyectos constituyen el contenido principal de la plataforma y están orientados a la presentación visual e interactiva de trabajos profesionales.
   - Puede incluir: Título, descripción, categoría, ubicación, estado del proyecto, fecha de publicación, referencias al contenido multimedia asociado.
   - Los proyectos pueden compartirse mediante enlaces para su visualización por clientes o visitantes.
     
4. **Media**  
   - Representa los recursos multimedia asociados a un proyecto.
   - Su objetivo es enriquecer la presentación visual del contenido publicado.
   - Puede incluir: Imágenes, videos, renders, modelos 3D, recorridos virtuales o contenido interactivo.
   - Cara recurso multimedia pertenece a un proyecto específico.

5. **Contacto**  
   - Representa las consultas o solicitudes realizadas por visitantes o potenciales clientes hacia un perfil profesional.
   - Permite establecer comunicación comercial relacionada con proyectos publicados dentro de la plataforma.
   - Puede utilizarse para: realizar consultas, pedir información adicional, manifestar interés sobre un proyecto publicado.

---

## Relaciones principales

| Relación | Tipo | Descripción |
|----------|------|------------|
| Perfil Profesional → posee → Usuarios | 1:N | Un perfil profesional puede tener múltiples usuarios colaboradores. |
| Perfil Profesional → publica → Proyecto | 1:N | Cada perfil puede publicar múltiples proyectos. |
| Proyecto → contiene → Media | 1:N | Cada proyecto puede contener múltiples recursos multimedia asociados. |
| Proyecto → puede compartirse → Visitantes | 1:N | Los proyectos pueden visualizarse mediante enlaces compartidos. |
| Visitante → contacta → Perfil Profesional| 1:N | Los visitantes pueden enviar consultas comerciales a perfiles profesionales. |

---

## Notas

- El sistema está orientado principalmente a la exhibición profesional y comercial de proyectos.
- La plataforma no busca funcionar como una red social tradicional, sino como una herramienta de presentación visual y difusión profesional.
- El modelo es adaptable a distintos rubros profesionales.
- La estructura del sistema permite futuras ampliaciones como: Filtros avanzados, métricas de visualización, portfolios personalizados, integración con herramientas externas, o distintos niveles de permisos para colaboradores.

---

## Tecnologías Utilizadas

- Python
- Django
- Django REST Framework
- SQLite 

## Requisitos Previos

Antes de ejecutar el proyecto, asegurar de tener instalado:

- Python 3
- pip (gestor de paquetes de Python)
- Git
- Visual Studio Code

Opcional:
- Postman (para probar la API)
- DBeaver (para gestionar la base de datos)

**Verificar instalación:**
python --version
pip --version

## Instalación

1. Clonar el repositorio:
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>

2. Crear entorno virtual:
python -m venv venv

3. Activar el entorno virtual:
venv\Scripts\Activate.ps1

4. Instalar dependencias:
pip install -r requirements.txt

## Ejecución

1. Aplicar migraciones:
python manage.py migrate

2. Crear superusuario:
python manage.py createsuperuser

3. Ejecutar servidor:
python manage.py runserver

4. Acceder al sistema:
- Backend: http://127.0.0.1:8000/
- Admin: http://127.0.0.1:8000/admin/
