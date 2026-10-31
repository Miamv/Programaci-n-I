# De un portfolio único a una plataforma de portfolios

## Propósito

Este documento describe una evolución posible para el proyecto. La meta no es crear un sitio diferente desde cero para cada estudio, sino convertir el portfolio actual en una **plantilla reutilizable**: una misma aplicación debe poder mostrar portfolios distintos según el estudio seleccionado.

La propuesta está pensada como objetivo de aprendizaje. Antes de empezar a programar, el alumno debe entender qué información administra Django, qué muestra React y cómo se comunican mediante la API.

## Qué hace actualmente el proyecto

El repositorio contiene dos aplicaciones:

- **Frontend (`frontend/`)**: una aplicación React con Vite que presenta el portfolio.
- **Backend (`backend/`)**: una aplicación Django y Django REST Framework que expone una API y ofrece el Admin de Django.

El frontend se comunica con el backend mediante peticiones HTTP. La URL de la API se configura con `VITE_API_URL`; si no se define, se usa `http://localhost:8000/api`.

La conexión actual es parcial:

- La página principal intenta cargar proyectos, perfiles, marcas e imágenes desde la API.
- El formulario de contacto intenta enviar información al backend.
- Parte de la presentación —por ejemplo, secciones institucionales— está definida directamente en el frontend.
- El detalle de los proyectos usa datos de ejemplo locales (`frontend/src/content/mockProjects.js`) en lugar de solicitar el proyecto al backend.
- Django Admin permite administrar los registros que existen en el backend, pero no modifica el contenido que está escrito directamente en React.

Por eso el sitio puede conservar parte de su apariencia aunque el backend esté apagado. Eso no significa que toda la aplicación funcione desconectada: las secciones que necesitan datos de la API o que envían información sí dependen del backend.

## El problema a resolver

En su estado actual, el proyecto se comporta principalmente como **un portfolio de un estudio**, no como una plataforma donde varios estudios puedan tener su propio sitio.

Para alcanzar esa segunda idea hay que resolver, como mínimo, estas preguntas:

1. ¿Cómo se representa un estudio en la base de datos?
2. ¿Qué contenido configura cada estudio para su página de inicio?
3. ¿Cómo se relacionan los proyectos y sus archivos multimedia con un estudio?
4. ¿Cómo identifica el frontend qué portfolio debe mostrar?
5. ¿Qué usuarios pueden administrar cada estudio y sus proyectos?
6. ¿Qué datos son públicos y cuáles requieren autenticación?

La decisión fundamental es que cada proyecto pertenezca a un estudio. Así se evita que un portfolio muestre por error proyectos de otro.

## Objetivo propuesto

Convertir el proyecto en una plataforma que permita administrar varios estudios y mostrar un **home independiente para cada uno**, reutilizando la misma plantilla visual, el mismo frontend y el mismo backend.

Cada estudio tendrá, como mínimo:

- nombre e identificador público;
- contenido e identidad visual para su página de inicio;
- usuarios autorizados para administrarlo;
- uno o más proyectos;
- imágenes u otros medios asociados a sus proyectos.

Al visitar el portfolio de un estudio, el frontend deberá identificar cuál es y consultar al backend para obtener sus datos y proyectos. El contenido específico no debería depender de valores de muestra escritos directamente en los componentes.

## Recomendación para la primera versión

Para empezar, identificar cada portfolio mediante una ruta con un *slug*:

```text
plataforma.com/estudios/estudio-a/
plataforma.com/estudios/estudio-b/
```

Un *slug* es un identificador legible para una URL, por ejemplo `estudio-a`. Esta alternativa permite implementar y probar la selección del portfolio sin necesitar configuración de DNS, certificados ni subdominios.

Más adelante se puede ofrecer una dirección por subdominio:

```text
estudio-a.plataforma.com
estudio-b.plataforma.com
```

La aplicación podría seguir siendo la misma: cambiaría la forma de identificar el estudio, no sería necesario crear un proyecto React separado para cada cliente. Los dominios personalizados podrían evaluarse en una etapa posterior.

## Administración del contenido

En una primera etapa se puede usar Django Admin para cargar y editar estudios y proyectos. Es una forma práctica de probar el modelo de datos y el flujo completo sin construir al mismo tiempo un panel de gestión propio.

Sin embargo, Django Admin es una interfaz administrativa genérica. Si los propietarios o alumnos deben gestionar sus portfolios como usuarios finales, más adelante convendrá construir un panel propio en React. En cualquiera de las dos opciones, los permisos deben garantizar que cada usuario administre solamente los estudios que tiene autorizados.

## Flujo esperado

El flujo público propuesto es:

```text
Visitante abre /estudios/estudio-a/
        ↓
React obtiene el identificador "estudio-a"
        ↓
React solicita el portfolio y sus proyectos a la API
        ↓
Django consulta la base de datos y devuelve los datos públicos
        ↓
React muestra el home y los proyectos de ese estudio
```

El flujo de administración inicial puede ser:

```text
Usuario autorizado entra al Django Admin
        ↓
Crea o edita un estudio y sus proyectos
        ↓
Los datos quedan guardados en la base de datos
        ↓
El portfolio público los obtiene mediante la API
```

La API es el contrato entre ambos lados: React no debería acceder directamente a la base de datos ni depender de cómo Django almacena internamente la información.

## Trabajo sugerido

El alumno debería avanzar de manera incremental:

1. **Entender el recorrido actual:** localizar las llamadas del frontend a la API y distinguirlas de los datos locales de ejemplo.
2. **Definir el modelo de dominio:** representar estudios, proyectos, medios y usuarios, incluyendo sus relaciones.
3. **Asegurar el aislamiento:** comprobar que consultar un estudio devuelve solamente sus proyectos y contenido.
4. **Exponer la información pública:** crear o adaptar endpoints para obtener un estudio por slug y sus proyectos.
5. **Conectar el home:** reemplazar progresivamente contenido de ejemplo por datos recibidos de la API.
6. **Conectar el detalle:** cargar un proyecto real seleccionado por su identificador o slug, en vez de elegirlo desde `mockProjects.js`.
7. **Administrar datos:** crear y editar estudios y proyectos inicialmente desde Django Admin.
8. **Probar ambos estados:** verificar el funcionamiento con backend disponible y los mensajes que aparecen cuando la API no está disponible.

No es necesario implementar subdominios en la primera versión. Primero debe funcionar correctamente la selección de un portfolio mediante su ruta.

## Criterios para considerar logrado el objetivo inicial

- Se pueden crear al menos dos estudios con contenido diferente.
- Cada estudio tiene un identificador público único, por ejemplo su slug.
- Los proyectos y medios están asociados al estudio correcto.
- Las rutas de dos estudios muestran homes distintos usando la misma aplicación frontend.
- El frontend obtiene de la API los datos variables del estudio y sus proyectos.
- El detalle muestra el proyecto solicitado y no un proyecto de ejemplo fijo.
- Los datos administrados desde Django Admin se reflejan en el sitio público sin editar componentes React.
- La API no mezcla ni expone contenido de un estudio en el portfolio de otro.
- Cuando la API falla o no hay contenido, la interfaz muestra un estado comprensible y no se confunde con datos reales.

## Fuera del alcance inicial

Para mantener el objetivo acotado, se recomienda dejar para después:

- configurar subdominios y dominios personalizados;
- desarrollar un panel de gestión propio en React;
- implementar pagos, planes o publicación comercial;
- agregar funciones avanzadas de edición visual de plantillas.

Primero hay que demostrar el concepto principal: **un solo sistema, varios estudios, datos separados y un home propio para cada uno**.

## Archivos útiles para comenzar a investigar

- `frontend/src/services/api.js`: configuración de Axios y funciones para llamar a la API.
- `frontend/src/views/Home.jsx`: carga de proyectos, perfiles, marcas y medios.
- `frontend/src/views/ProjectDetail.jsx`: vista de detalle que actualmente usa datos simulados.
- `frontend/src/content/mockProjects.js`: contenido de ejemplo del detalle.
- `backend/studio/urls.py`: rutas principales del backend.
- `backend/core/urls.py`: endpoints REST de los recursos del portfolio.
- `backend/core/models.py`: modelos de dominio existentes.

Antes de modificar estos archivos, el alumno debería recorrerlos y dibujar el flujo actual de los datos. Entender qué información vive en React y cuál vive en la base de datos es parte central del trabajo.
