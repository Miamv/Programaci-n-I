# Plataforma para mostrar y descubrir proyectos profesionales

**Descripción:**  
Plataforma donde profesionales publican sus proyectos y otros pueden explorarlos y contactarlos.

---

## Entidades principales

1. **Usuario**  
   - Representa a cualquier persona que puede crear perfiles, interactuar con proyectos o enviar mensajes de contacto.

2. **Perfil**  
   - Representa al profesional o estudio. Contiene información sobre el profesional, sus servicios y proyectos publicados.

3. **Proyecto**  
   - Cada proyecto publicado por un perfil profesional. Puede incluir imágenes o modelos 3D.

4. **Media**  
   - Archivos asociados a un proyecto (imágenes, videos, modelos 3D).

5. **Contacto**  
   - Permite que un usuario contacte directamente a un perfil profesional.

---

## Relaciones principales

| Relación | Tipo | Descripción |
|----------|------|------------|
| Usuario → crea → Perfil | 1:N | Un usuario puede crear uno o más perfiles profesionales. |
| Perfil → publica → Proyecto | 1:N | Cada perfil puede publicar varios proyectos. |
| Proyecto → contiene → Media | 1:N | Cada proyecto puede tener varias imágenes, videos o modelos 3D. |
| Usuario → interactúa → Proyecto | N:M | Usuarios pueden ver, comentar o dar like a proyectos. |
| Usuario → contacta → Perfil | 1:N | Usuarios pueden enviar mensajes a perfiles profesionales. |

---

## Notas

- Este modelo es generalizable a cualquier tipo de profesional (arquitectos, diseñadores, abogados, fotógrafos, etc.).  
- La plataforma permite tanto **mostrar proyectos** como **descubrir y contactar profesionales**.  
- La interacción puede ampliarse en el futuro con comentarios, likes, favoritos, filtros por categoría, etc.
