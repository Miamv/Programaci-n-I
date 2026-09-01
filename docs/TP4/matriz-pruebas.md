# Matriz de Pruebas — Trabajo Práctico N.º 4

## 1. Objetivo

Esta matriz define los casos de prueba manuales utilizados para
verificar el funcionamiento de la API REST, haciendo especial
énfasis en autenticación, autorización mediante roles, permisos
sobre recursos y validaciones.

Las pruebas serán ejecutadas manualmente utilizando Postman.

## 2. Criterios

- **PASS:** el resultado obtenido coincide con el resultado esperado.
- **FAIL:** el resultado obtenido no coincide con el resultado esperado.
- **PENDIENTE:** la prueba todavía no fue ejecutada.

Las pruebas se ejecutarán progresivamente, priorizando primero
los escenarios críticos de autenticación y autorización.

---

## 3. Pruebas prioritarias

### 3.1 Autenticación y seguridad

| ID | Prioridad | Endpoint | Método | Usuario/Rol | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|---|---|
| AUTH-01 | CRÍTICA | `/api/auth/register/` | POST | Anónimo | Registrar un usuario con datos válidos | `201 Created` | 201 Created | PASS |
| AUTH-02 | CRÍTICA | `/api/auth/login/` | POST | Usuario registrado | Iniciar sesión con credenciales válidas | `200 OK` + tokens JWT | 200 OK + tokens JWT | PASS |
| AUTH-03 | CRÍTICA | `/api/auth/login/` | POST | Anónimo | Iniciar sesión con contraseña incorrecta | `401 Unauthorized` | 401 Unauthorized | PASS |
| AUTH-04 | ALTA | `/api/auth/login/` | POST | Anónimo | Iniciar sesión con usuario inexistente | `401 Unauthorized` | 401 Unauthorized | PASS |
| AUTH-05 | CRÍTICA | `/api/auth/profile/` | GET | Anónimo | Acceder al perfil sin token | `401 Unauthorized` | 401 Unauthorized | PASS |
| AUTH-06 | CRÍTICA | `/api/auth/profile/` | GET | Usuario autenticado | Acceder al perfil utilizando un JWT válido | `200 OK` | 401 Unauthorized | FAIL |
| AUTH-07 | ALTA | `/api/auth/refresh/` | POST | Usuario autenticado | Obtener un nuevo access token utilizando un refresh válido | `200 OK` + nuevo access token | — | PENDIENTE |
| AUTH-08 | ALTA | `/api/auth/refresh/` | POST | Anónimo | Intentar utilizar un refresh token inválido | `401 Unauthorized` | — | PENDIENTE |

---

### 3.2 Autorización y roles

Estas pruebas verifican que los usuarios no puedan realizar
operaciones que no corresponden a su rol.

| ID | Prioridad | Endpoint | Método | Rol | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|---|---|
| ROLE-01 | CRÍTICA | `/api/profiles/` | POST | VIEWER | Intentar crear un perfil profesional | `403 Forbidden` | — | PENDIENTE |
| ROLE-02 | CRÍTICA | `/api/profiles/` | POST | COLLABORATOR | Intentar crear un perfil profesional | `403 Forbidden` | — | PENDIENTE |
| ROLE-03 | CRÍTICA | `/api/profiles/` | POST | OWNER | Crear un perfil profesional | `201 Created` | — | PENDIENTE |
| ROLE-04 | CRÍTICA | `/api/projects/` | POST | VIEWER | Intentar crear un proyecto | `403 Forbidden` | — | PENDIENTE |
| ROLE-05 | CRÍTICA | `/api/projects/` | POST | OWNER | Crear un proyecto | `201 Created` | — | PENDIENTE |
| ROLE-06 | CRÍTICA | `/api/projects/{id}/` | PATCH | VIEWER | Intentar modificar un proyecto | `403 Forbidden` | — | PENDIENTE |
| ROLE-07 | CRÍTICA | `/api/projects/{id}/` | PATCH | COLLABORATOR | Modificar un proyecto de un perfil del que forma parte | `200 OK` | — | PENDIENTE |
| ROLE-08 | CRÍTICA | `/api/projects/{id}/` | PATCH | COLLABORATOR | Intentar modificar un proyecto de un perfil ajeno | `403 Forbidden` | — | PENDIENTE |
| ROLE-09 | CRÍTICA | `/api/projects/{id}/` | DELETE | COLLABORATOR | Intentar eliminar un proyecto | `403 Forbidden` | — | PENDIENTE |
| ROLE-10 | CRÍTICA | `/api/projects/{id}/` | DELETE | OWNER | Eliminar un proyecto propio | `204 No Content` | — | PENDIENTE |

---

### 3.3 Permisos sobre recursos ajenos

Estas pruebas verifican específicamente los permisos a nivel de
objeto implementados en la API.

| ID | Prioridad | Endpoint | Método | Rol | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|---|---|
| OBJ-01 | CRÍTICA | `/api/profiles/{id}/` | PATCH | OWNER | Intentar modificar un perfil del que no es miembro | `403 Forbidden` | — | PENDIENTE |
| OBJ-02 | CRÍTICA | `/api/profiles/{id}/` | DELETE | OWNER | Intentar eliminar un perfil del que no es miembro | `403 Forbidden` | — | PENDIENTE |
| OBJ-03 | CRÍTICA | `/api/projects/{id}/` | PATCH | COLLABORATOR | Intentar modificar un proyecto perteneciente a un perfil ajeno | `403 Forbidden` | — | PENDIENTE |
| OBJ-04 | CRÍTICA | `/api/media/{id}/` | PATCH | COLLABORATOR | Intentar modificar multimedia de un proyecto ajeno | `403 Forbidden` | — | PENDIENTE |
| OBJ-05 | CRÍTICA | `/api/contacts/{id}/` | GET | OWNER | Intentar consultar un contacto perteneciente a un perfil ajeno | `403 Forbidden` | — | PENDIENTE |

---

### 3.4 Validaciones básicas

| ID | Prioridad | Endpoint | Método | Rol | Acción | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|---|---|
| VAL-01 | ALTA | `/api/auth/register/` | POST | Anónimo | Registrar usuario con email ya existente | `400 Bad Request` | — | PENDIENTE |
| VAL-02 | ALTA | `/api/projects/` | POST | OWNER | Crear proyecto sin título | `400 Bad Request` | — | PENDIENTE |
| VAL-03 | ALTA | `/api/projects/` | POST | OWNER | Crear proyecto con categoría inválida | `400 Bad Request` | — | PENDIENTE |
| VAL-04 | MEDIA | `/api/contacts/` | POST | Anónimo | Crear contacto con email inválido | `400 Bad Request` | — | PENDIENTE |
| VAL-05 | MEDIA | `/api/projects/{id}/` | GET | Anónimo | Consultar un proyecto inexistente | `404 Not Found` | — | PENDIENTE |