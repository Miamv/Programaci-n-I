ID,Endpoint,Método,Condición / Rol,Resultado Esperado,Resultado Obtenido,Estado
AUTH-05,/api/auth/profile/,GET,Anónimo,401 Unauthorized,401 Unauthorized,PASÓ
AUTH-06,/api/auth/profile/,GET,Token Válido,200 OK,401 → 200 OK,CORREGIDO
AUTH-07,/api/auth/refresh/,POST,Token Válido,200 OK + Access,405 → 200 OK,CORREGIDO
AUTH-08,/api/auth/refresh/,POST,Token Inválido,401 Unauthorized,401 Unauthorized,PASÓ

2. Registro de Errores y Evidencia de Pull Requests

BUG-01 (AUTH-06): Rechazo de cabecera JWT

Descripción: Retornaba 401 Unauthorized por estrictez en el formato del header enviado.

Solución: Configuración de compatibilidad de encabezados en settings.py.

BUG-02 (AUTH-07): Error 405 Method Not Allowed en Refresh

Descripción: La redirección automática por falta de barra final convertía la petición POST en GET.

Solución: Reordenamiento de rutas explícitas en urls.py.

Pull Request AUTH-06 y AUTH-07: https://github.com/Miamv/Programaci-n-I/pull/9

