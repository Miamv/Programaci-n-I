# Plataforma para Exhibición de Proyectos de Diseño y Arquitectura
 
Plataforma orientada a la exhibición, presentación y difusión de proyectos profesionales, con foco en arquitectura, diseño y disciplinas creativas relacionadas.

Permite a profesionales, estudios y equipos de trabajo transformar un conjunto de trabajos en una presentación digital organizada, visual e interactiva, utilizable tanto como portfolio como herramienta de presentación comercial frente a clientes.

Cada proyecto cuenta con su propia página, contenido multimedia propio y un enlace público de acceso directo, sin que el receptor necesite conocer previamente la plataforma.

---

## Objetivo:

Desarrollar una plataforma que permita crear, administrar y presentar proyectos de manera visual e interactiva, facilitando tanto la exposición de trabajos como el contacto con potenciales clientes.

Debe permitir:
 - Crear y administrar un perfiles profesionales o estudios
 - Gestionar uno o varios proyectos
 - Presentar cada proyecto mediante contenido visual y multimedia
 - Incorporar recorridos virtuales, y contenido interactivo
 - Compartir proyectos mediante enlaces públicos
 - Facilitar el contacto entre visitantes y profesionales

---

## Modelo de operación

El proyecto funciona bajo un modelo de Gestión de Contenido: un operador (Usuario/Administrador) prepara y mantiene la presentación, mientras que el Estudio/Perfil es dueño de su identidad y de su negocio. Esta separación es la que ordena todos los roles y permisos del sistema.

| Actor | Rol | Controla |
|---|---|---|
| **Administrador** | Cuenta autenticada que administra la plataforma y prepara el contenido para su publicación. | Estructura visual, calidad de presentación, orden de publicación, funcionamiento de recorridos y multimedia. |
| **Propietario** | Usuario responsable de un perfil profesional o estudio y de la gestión de su información y actividad comercial. | Su propio negocio: información de contacto, servicios, consultas recibidas y estado comercial. |
| **Colaborador** | Asiste al Administrador en proyectos grandes. | Edición de proyectos puntuales, carga de contenido, información permitida — según permiso asignado. |
| **Visitante** | Accede sin cuenta al contenido público. | Nada — solo explora, recorre y consulta. |

Un mismo Administrador puede administrar uno o varios perfiles de Propietario, según el alcance del servicio.

---

### Estados del proyecto

Cada proyecto maneja **dos dimensiones de estado independientes**:

- **Estado de publicación** (controlado por el Administrador): Borrador · En revisión · Publicado · Oculto · Archivado.
- **Estado comercial** (controlado por el Propietario): Disponible · En negociación · Reservado · Vendido · No disponible.

---

## Entidades 

1. **Usuario**  
   - Representa a un miembro autorizado dentro de la plataforma.
   - Los usuarios pueden estar asociados a uno o varios perfiles profesionales y poseen permisos según el rol asignado.
   - Funciones: Iniciar sesión, administrar perfiles profesionales, gestionar proyectos, cargar contenido multimedia, editar información pública, compartir proyectos con clientes o interesados.

2. **Perfil Profesional**  
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
   - Representa las consultas o solicitudes realizadas por visitantes hacia un perfil profesional.
   - Permite establecer comunicación comercial relacionada con proyectos publicados dentro de la plataforma.
   - Puede utilizarse para: realizar consultas, pedir información adicional, manifestar interés sobre un proyecto publicado.

---

## Relaciones principales

| Relación | Tipo |
|---|:---:|
| Usuario → administra → Perfil Profesional | N:M |
| Perfil Profesional → publica → Proyecto | 1:N |
| Proyecto → contiene → Media | 1:N |
| Visitante → visualiza → Proyecto | N:M |
| Visitante → contacta → Perfil Profesional | N:M |

---

## Funcionalidades principales

- Gestión de usuarios (registro, autenticación, recuperación de acceso, permisos por rol).
- Perfiles profesionales públicos y colaborativos.
- Gestión de proyectos con página propia y enlace directo compartible.
- Contenido multimedia: imágenes, renders, videos, planos, modelos 3D.
- Recorridos virtuales y contenido interactivo (360°, visores 3D, presentaciones interactivas).
- Sistema de contacto entre visitantes y profesionales.

---

## Alcance inicial

1. Autenticación de usuarios.
2. Creación y administración de perfiles profesionales.
3. Gestión de proyectos.
4. Carga y administración de imágenes y otros recursos multimedia.
5. Visualización pública de perfiles y proyectos.
6. Compartición mediante enlaces.
7. Sistema básico de contacto.
8. Roles y permisos para trabajo colaborativo.

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
pip install -r backend/requirements.txt

## Ejecución

1. Aplicar migraciones:
cd backend
python manage.py migrate

2. Crear superusuario:
python manage.py createsuperuser

3. Ejecutar servidor:
python manage.py runserver

4. Acceder al sistema:
- Backend: http://127.0.0.1:8000/
- Admin: http://127.0.0.1:8000/admin/
