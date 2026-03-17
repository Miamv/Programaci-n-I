# Plataforma para mostrar y descubrir proyectos profesionales

**Descripción:**  
Plataforma donde profesionales publican sus proyectos y otros usuarios pueden explorarlos y contactarlos.

---

## Características Principales

- Registro y login de usuarios
- Creación y edición de perfiles profesionales
- Publicación de proyectos con imágenes
- Visualización de proyectos
- Contacto directo con perfiles
  
## Entidades 

1. **Usuario**  
   - Representa a cualquier persona que usa la plataforma, ya sea profesional o visitante.
   - Funciones: crear perfiles, interactuar con proyectos, enviar mensajes.

2. **Perfil Profesional/ Estudio**  
   - Representa al profesional o estudio.
   - Contiene información sobre el profesional: nombre, descripción, servicios y proyectos asociados.
     

3. **Proyecto**  
   - Cada proyecto publicado por un perfil profesional.
   - Contiene título, descripción, categoría y referencias a su media.
     
4. **Media**  
   - Archivos asociados a un proyecto (imágenes, videos, modelos 3D).
   - Cada archivo pertenece a un proyecto.

5. **Contacto**  
   - Permite que un usuario contacte directamente a un perfil profesional.

---

## Relaciones principales

| Relación | Tipo | Descripción |
|----------|------|------------|
| Usuario → crea → Perfil Profesional | 1:N | Un usuario puede crear uno o más perfiles profesionales. |
| Perfil → publica → Proyecto | 1:N | Cada perfil puede publicar varios proyectos. |
| Proyecto → contiene → Media | 1:N | Cada proyecto puede tener varias imágenes, videos o modelos. |
| Usuario → interactúa → Proyecto | N:M | Usuarios pueden interactuar con proyectos. |
| Usuario → contacta → Perfil Profesional| 1:N | Usuarios pueden enviar mensajes a perfiles profesionales. |

---

## Notas

- Este modelo es generalizable a cualquier tipo de profesional (arquitectos, diseñadores, abogados, fotógrafos, etc.).  
- La plataforma permite tanto **mostrar proyectos** como **descubrir y contactar profesionales**.  
- La interacción puede ampliarse en el futuro con comentarios, likes, favoritos, filtros por categoría, etc.
