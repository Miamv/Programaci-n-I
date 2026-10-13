# TP7 — Notas de pruebas: flujos de navegación y control de acceso en memoria

Rama: `feat/TP7auth-system`
Alcance: auth en memoria (sin backend, sin persistencia, sin JWT) + portfolio público (Opción A).

Verificación: `npm run build` ✅ · `npx eslint src` ✅ · smoke test de rutas con dev server (`/`, `/login`, `/registro`, `/register`, `/proyecto/1` → 200). Flujos de UI verificados por inspección de código (no hay framework de tests de UI en el proyecto y no se agregan dependencias).

## Matriz de pruebas

| ID | Flujo | Condición | Resultado esperado | Verificación | Estado |
|----|-------|-----------|--------------------|--------------|--------|
| TP7-01 | Entrada directa a `/` sin sesión | Anónimo | Home accesible directamente (portfolio público, sin redirect a `/login`); el círculo de usuario muestra el menú anónimo | `App.jsx:16` ruta `index` sin `ProtectedRoute`; smoke test 200 | PASÓ |
| TP7-02 | Login con credenciales erróneas | `admin` / incorrecta | Alert visual de error en el formulario, sin navegación | `AuthContext.jsx` retorna `{success:false, error:'Credenciales incorrectas'}` → `Login.jsx:31-33` renderiza `alert alert-danger` | PASÓ |
| TP7-03 | Login exitoso con credencial mock | `admin` / `password123` | Redirección a `/` y visualización de Home; Navbar muestra rol `admin` + pill `CERRAR SESIÓN` | `Login.jsx:29` `navigate(from)` con `from` default `/`; `AuthContext.jsx:37` `role:'admin'`; `Navbar.jsx:111-141` | PASÓ |
| TP7-04 | Registro de usuario nuevo en memoria | Formulario `/registro` con datos nuevos | Cuenta creada con rol `Viewer`; permite iniciar sesión con la nueva cuenta | `AuthContext.jsx:63-71` agrega usuario con `role:'viewer'`; `login()` lo encuentra en `users`; `Register.jsx:87-90` enlaza a `/login` | PASÓ |
| TP7-05 | Navbar muestra rol en el costado | Sesión activa | Etiqueta de rol visible junto al círculo (ej. `Admin` / `Viewer`) | `Navbar.jsx:13` `roleLabel = user?.role ?? user?.username` | PASÓ |
| TP7-06 | Menú desde el círculo de usuario | Con y sin sesión | Al hacer clic nace un mini recuadro: sin sesión → `Iniciar sesión` / `Crear cuenta`; con sesión → datos de usuario + `Cerrar sesión` | `Navbar.jsx:114-130` y `159-180` (`vertice-userbox__menu`); cierra con click afuera (`Navbar.jsx:18-23`) y `Escape` | PASÓ |
| TP7-07 | Logout en el Navbar | Sesión activa | Sesión destruida en memoria (`user = null`) y Navbar vuelve al estado anónimo; permanece en la página (Home es público) | `AuthContext.jsx:74-76`; `Navbar.jsx:43-46` solo llama `logout()`, sin `navigate` | PASÓ |
| TP7-08 | Recarga de página (F5) | Cualquier estado | El estado se reinicia a `user = null` y el array de usuarios vuelve a `INITIAL_USERS` (las cuentas registradas en la sesión anterior desaparecen); el sitio sigue siendo navegable sin login | `AuthContext.jsx:16-17` `useState(null)` / `useState(INITIAL_USERS)`, sin persistencia | PASÓ |

## Observaciones

1. **TP7-01 adaptado respecto al plan original.** El plan decía "entrada a `/` sin sesión → redirect a `/login`". Con la Opción A (portfolio público) Home dejó de estar protegida: ahora `/` responde 200 sin sesión. `ProtectedRoute.jsx` queda en el repo sin uso, reservado para futuras rutas privadas del estudio.
2. **TP7-07 adaptado respecto al plan original.** El plan decía "logout → redirección forzada a `/login`". Actualmente el logout **no redirige**: `Navbar.jsx:43-46` destruye la sesión y restaura el menú anónimo, permaneciendo en la página (coherente con un portfolio público). Si se desea redirección, es un `navigate('/login')` en `handleLogout`.
3. **TP7-08 adaptado respecto al plan original.** El plan decía "exige inicio de sesión" tras F5. Con Home pública, F5 solo se manifiesta en el Navbar (vuelve al estado anónimo); ninguna ruta exige login.
4. **Registro no inicia sesión automáticamente.** Tras registrarse, hay que navegar a `/login` y entrar con la cuenta nueva (flujo cubierto en TP7-04).
5. **Roles sin efecto funcional todavía.** `viewer` vs `admin` solo cambia la etiqueta del Navbar: no hay rutas protegidas que diferencien permisos. Se resuelve cuando se integre `ProtectedRoute` con chequeo de rol.
6. **Sin conexión con Django.** `services/api.js` aún exporta `login()` y `register()` de axios (sin uso por las vistas de auth); los datos de auth viven solo en el estado de React.
7. **Contraseñas en texto plano en memoria.** Es un mock del TP7; no debe replicarse al conectar el backend.
