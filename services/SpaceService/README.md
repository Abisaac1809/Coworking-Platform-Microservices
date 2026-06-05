# SpaceService

Microservicio de **gestión del catálogo de espacios** de coworking de la Nexus
Coworking Platform. Permite crear, editar, listar (con paginación, filtros y
ordenamiento) y cambiar el estado de los espacios. Soporta **carga de imágenes**
(`multipart/form-data`) y **publica eventos en RabbitMQ** al crear o actualizar
espacios para que otros servicios reaccionen de forma desacoplada.

- **Lenguaje:** Go
- **Framework:** Gin
- **ORM:** GORM
- **Mensajería:** RabbitMQ (productor)
- **Base de datos:** PostgreSQL

---

## Arquitectura interna

`main.go` es el punto de arranque: conecta GORM a PostgreSQL, ejecuta la
**auto-migración** del modelo `Espacio`, crea la carpeta `uploads/` para las
imágenes (servida como estática en `/uploads`), abre el **productor de RabbitMQ** y
registra las rutas en Gin con sus middlewares de autenticación.

```
HTTP → Gin router → middlewares (JWT) → handlers → GORM → PostgreSQL
                                            │
                                            └── messaging (RabbitMQ producer)
```

| Componente | Carpeta | Responsabilidad |
| ---------- | ------- | --------------- |
| **Handlers** | `handlers/` | Lógica HTTP de los espacios: validan entrada, procesan multipart, persisten y publican eventos. |
| **Models** | `models/` | Entidad `Espacio` (GORM) y sus campos/estados. |
| **Middlewares** | `middlewares/` | `RequireUserId` (valida JWT) y `RequireAdminRole` (exige rol `Admin`). |
| **Messaging** | `messaging/` | Productor de RabbitMQ que publica eventos de creación/actualización de espacios. |
| **Uploads** | `uploads/` | Almacenamiento de imágenes servidas estáticamente en `/uploads`. |

Las rutas se agrupan bajo `/espacios` y todas exigen token. El subgrupo de
escritura aplica además `RequireAdminRole` (rol `Admin`).

> Token = requiere token JWT válido · Admin = requiere rol `Admin`

---

## Tabla de endpoints

> Rutas tal como las recibe el servicio (el gateway las expone bajo `/api/spaces/`).

| Método | Ruta | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| `GET` | `/health` | — | Estado del servicio y de la base de datos |
| `GET` | `/espacios` | Token | Lista espacios con paginación, filtros y orden |
| `GET` | `/espacios/{id}` | Token | Obtiene un espacio por ID |
| `POST` | `/espacios` | Admin | Crea un espacio (`multipart/form-data`, incluye imagen) |
| `PUT` | `/espacios/{id}` | Admin | Actualiza un espacio (`multipart/form-data`, campos parciales) |
| `PATCH` | `/espacios/{id}/estado` | Admin | Cambia el estado del espacio |
| `GET` | `/uploads/{archivo}` | — | Sirve las imágenes de los espacios (estático) |

Estados válidos: `disponible`, `reservada`, `ocupada`, `mantenimiento`.
