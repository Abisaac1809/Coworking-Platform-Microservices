# ReservationService

Microservicio de **reservas** de la Nexus Coworking Platform. Gestiona la creación y
cancelación de reservas, la consulta de disponibilidad, los horarios de negocio por
día de la semana y una **cola de prioridad** para las reservas que requieren
verificación. **Consume eventos de RabbitMQ** publicados por el SpaceService para
conocer qué espacios necesitan verificación.

- **Lenguaje:** Rust
- **Framework:** Axum (Tokio)
- **Acceso a datos:** SQLx
- **Mensajería:** RabbitMQ (consumidor)
- **Base de datos:** PostgreSQL

---

## Arquitectura interna

`main.rs` arranca el runtime async (Tokio): conecta el `PgPool`, ejecuta las
migraciones, **carga las reservas pendientes en una cola de prioridad en memoria**,
lanza el consumidor de RabbitMQ en una tarea aparte y construye el router de Axum con
un `AppState` compartido (pool + cola + repositorios).

```
HTTP → Axum router → middleware (JWT) → controllers → services → repositories → SQLx → PostgreSQL
                                                          │
                            storage::ColaPrioridad (cola en memoria) ◄── messaging (RabbitMQ consumer)
```

| Componente | Carpeta | Responsabilidad |
| ---------- | ------- | --------------- |
| **Routers** | `src/routers/` | Definen rutas y el `AppState` compartido entre handlers. |
| **Controllers** | `src/controllers/` | Adaptan HTTP por dominio: reservas, disponibilidad, cola, horarios, health. |
| **Services** | `src/services/` | Lógica de negocio de reservas y de la cola de prioridad. |
| **Repositories** | `src/repositories/` | Acceso a datos con SQLx (reservas, horarios, espacios con verificación). |
| **Entities** | `src/entities/` | Estructuras de dominio (reserva, horario, elemento de cola, etc.). |
| **Schemas** | `src/schemas/` | DTOs de entrada/salida (camelCase) y paginación. |
| **Storage** | `src/storage/` | `ColaPrioridad`: cola de prioridad en memoria para reservas pendientes. |
| **Messaging** | `src/messaging/` | Consumidor de RabbitMQ que sincroniza espacios que requieren verificación. |
| **Middleware** | `src/middleware/` | Autenticación y autorización por JWT. |
| **DB / Traits / Errors** | `src/db`, `src/traits`, `src/errors` | Migraciones, abstracciones de repositorio y errores tipados. |

> Cuando un espacio requiere verificación, la reserva entra como `PENDIENTE` a la
> cola de prioridad; en caso contrario se confirma directamente.

> Token = requiere token JWT válido · Admin = requiere rol `Admin`

---

## Tabla de endpoints

> Rutas tal como las recibe el servicio (el gateway las expone bajo `/api/reservations/`).
> Los campos JSON usan **camelCase**.

| Método | Ruta | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| `GET` | `/health` | — | Estado del servicio y de la base de datos |
| `POST` | `/reservas` | Token | Crea una reserva para el usuario autenticado |
| `GET` | `/reservas/mis-reservas` | Token | Lista las reservas del usuario (paginación/orden) |
| `GET` | `/reservas/disponibilidad` | Token | Horario del negocio y slots ocupados de un espacio/fecha |
| `DELETE` | `/reservas/{id}` | Token | Cancela una reserva (propia, o cualquiera si es Admin) |
| `GET` | `/reservas` | Admin | Lista todas las reservas (paginación) |
| `GET` | `/cola` | Admin | Estado de la cola de prioridad de pendientes |
| `POST` | `/cola/confirmar` | Admin | Confirma la siguiente reserva en la cola |
| `GET` | `/horarios` | Token | Lista los horarios de negocio por día |
| `PUT` | `/horarios/{dia_semana}` | Admin | Actualiza el horario de un día (0=Dom … 6=Sáb) |
