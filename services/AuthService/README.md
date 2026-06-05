# AuthService

Microservicio de **autenticación y gestión de usuarios** de la Nexus Coworking
Platform. Se encarga del registro, inicio de sesión, gestión de perfiles y
administración de cuentas/roles. Emite y valida tokens **JWT (HS256)** que el resto
de microservicios usa para autenticar y autorizar peticiones de forma autónoma.

- **Lenguaje:** Python 3.11+
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Seguridad:** JWT (PyJWT) + hash de contraseñas (pwdlib)
- **Base de datos:** PostgreSQL (psycopg2)

---

## Arquitectura interna

El servicio sigue una **arquitectura en capas (Clean Architecture)** con inyección
de dependencias nativa de FastAPI (`Depends`). Cada petición fluye de afuera hacia
adentro, y la capa de dominio depende de *protocolos* (interfaces) en vez de
implementaciones concretas, lo que desacopla la lógica de negocio de la persistencia.

```
HTTP → routers → controllers → services → repositories → models (DB)
                                   │
                                   └── protocols (interfaces)
```

| Capa | Carpeta | Responsabilidad |
| ---- | ------- | --------------- |
| **Routers** | `routers/` | Definen rutas y dependencias; resuelven el controlador a inyectar. |
| **Controllers** | `controllers/` | Adaptan la petición/respuesta HTTP e invocan los servicios. |
| **Services** | `services/` | Lógica de negocio: registro, login, hashing, emisión de JWT. |
| **Repositories** | `repositories/` | Implementación de acceso a datos con SQLAlchemy. |
| **Protocols** | `protocols/` | Interfaces que abstraen el repositorio del dominio. |
| **Models** | `models/` | Entidades SQLAlchemy (tabla `users`). |
| **Schemas** | `schemas/` | Validación y serialización con Pydantic. |
| **Middlewares** | `middlewares/` | Autenticación JWT (`get_current_user_id`, `require_admin`) y manejo global de errores. |
| **Errors** | `errors/` | Errores de negocio y de servidor tipados. |
| **Database** | `database/` | Configuración del engine, sesión y `Base`. |

`main.py` arranca la app FastAPI, crea las tablas (`Base.metadata.create_all`),
registra el manejador global de excepciones e incluye los routers de `health`,
`users` y `auth`.

> Token = requiere token JWT válido · Admin = requiere rol `Admin`

---

## Tabla de endpoints

> Rutas tal como las recibe el servicio (el gateway las expone bajo `/api/auth/`).

| Método | Ruta | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| `GET` | `/health` | — | Estado del servicio y de la base de datos |
| `POST` | `/register` | — | Registra un usuario y devuelve un token |
| `POST` | `/login` | — | Autentica con email y contraseña |
| `GET` | `/users/me` | Token | Perfil del usuario autenticado |
| `PUT` | `/users/me` | Token | Actualiza el propio perfil |
| `DELETE` | `/users/me` | Token | Elimina la propia cuenta |
| `GET` | `/users` | Admin | Lista todos los usuarios |
| `GET` | `/users/admins` | Admin | Lista los administradores |
| `POST` | `/users/admin` | Admin | Crea un nuevo administrador |
| `DELETE` | `/users/{user_id}` | Admin | Elimina cualquier usuario por ID |

---

## Verificación de tokens en otros servicios

Al ser una arquitectura políglota, cualquier microservicio (Go, Rust, Node.js)
valida el JWT por su cuenta sin llamar al AuthService:

1. Extrae el token de la cabecera `Authorization: Bearer <token>`.
2. Verifica la firma con la `SECRET_KEY` y el `ALGORITHM` (`HS256`) compartidos.
3. Comprueba la expiración (`exp`).
4. Autoriza según el claim `role` (`User` / `Admin`); si la ruta requiere `Admin`
   y el rol no lo es, responde `403 Forbidden`.

---

## Seeder del administrador inicial

Para crear el primer administrador (necesario para acceder a las rutas Admin):

```bash
# Interactivo
python3 seed.py

# No interactivo (pipelines / Docker)
python3 seed.py --name "Admin General" --email "admin@example.com" \
  --phone "+57 300-1234567" --password "admin123"
```
