# Nexus Coworking Platform

Plataforma de gestión de espacios de coworking construida sobre una **arquitectura
de microservicios**. Permite registrar usuarios, publicar y administrar
espacios, gestionar reservas con cola de prioridad y disponibilidad horaria, y
emitir facturas con reportes de ingresos.

Cada dominio del negocio es un servicio independiente —escrito en el lenguaje más
adecuado para su tarea (Python, Go, Rust y Node.js)— con su propia base de datos
PostgreSQL. Todo el tráfico entra por un único **API Gateway (Nginx)** y los
servicios se comunican de forma asíncrona mediante **RabbitMQ**. El frontend es
una aplicación **Next.js 16 + React 19**.

---

## Inicio rápido

### Requisitos

- Docker y Docker Compose
- Node.js 20+ (solo para desarrollo del frontend fuera de Docker)

### 1. Levantar el backend (gateway + servicios + colas + DBs)

Desde la raíz del repositorio:

```bash
# Copia las variables de entorno de ejemplo y ajústalas si es necesario
cp .env.example .env

# Construye y levanta toda la plataforma
docker compose up --build
```

Esto deja disponible:

| Servicio              | URL                              |
| --------------------- | -------------------------------- |
| API Gateway (Nginx)   | http://localhost:8080            |
| RabbitMQ (management) | http://localhost:15672           |

Todas las APIs se consumen a través del gateway con el prefijo `/api/...`
(p. ej. `http://localhost:8080/api/auth/login`).

### 2. Levantar el frontend

```bash
cd apps/frontend
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Arquitectura

La plataforma sigue un patrón de **microservicios con API Gateway** y
**base de datos por servicio** (database-per-service). Ningún servicio accede a la
base de datos de otro: la coordinación se hace por HTTP (vía gateway) y por
eventos asíncronos a través de RabbitMQ.

### Componentes

#### API Gateway (Nginx)
Punto de entrada único de la plataforma, expuesto en el puerto `8080`. Recibe todas
las peticiones del frontend, las enruta al microservicio correspondiente según el
prefijo de la URL y **reescribe el path** eliminando dicho prefijo (p. ej.
`/api/auth/login` → `/login` en el AuthService). Centraliza el acceso y desacopla
al cliente de la topología interna de los servicios.

#### AuthService — Python / FastAPI
Gestión de usuarios y autenticación. Emite y valida tokens **JWT (HS256)**, maneja
registro, login, perfil del usuario y administración de cuentas (incluyendo roles
`User` / `Admin`). Es la fuente de identidad que el resto de servicios usa para
validar los tokens.

#### SpaceService — Go / Gin + GORM
Administración del catálogo de espacios de coworking: creación, edición, listado
con paginación/filtros y cambio de estado. Soporta **carga de imágenes**
(`multipart/form-data`) y **publica eventos en RabbitMQ** al crear o actualizar
espacios para mantener informados a otros servicios.

#### ReservationService — Rust / Axum + SQLx
Gestión de reservas, disponibilidad, horarios de negocio y una **cola de prioridad**
para reservas que requieren verificación. **Consume eventos de RabbitMQ** publicados
por SpaceService para conocer el estado de los espacios.

#### Billing_Service — Node.js / Express
Facturación y reportes. Genera facturas a partir de los datos de una reserva
(calcula horas, subtotal, impuesto y total), gestiona el pago y produce reportes
agregados de ingresos (por espacio, por usuario, mensuales y top de espacios).

#### RabbitMQ (Message Broker)
Bus de mensajería que permite la **comunicación asíncrona** entre servicios mediante
eventos. SpaceService actúa como productor y ReservationService como consumidor, de
modo que los cambios en los espacios se propagan sin acoplamiento directo entre
servicios. Incluye consola de administración en el puerto `15672`.

#### Bases de datos PostgreSQL
Cada servicio de negocio tiene su **propia instancia PostgreSQL 15** aislada
(`auth-db`, `space-db`, `reservation-db`, `billing-db`), garantizando independencia
de datos y despliegue. Los datos persisten en volúmenes de Docker dedicados.

#### Frontend — Next.js 16 / React 19
Aplicación web (App Router, Server Actions, validación con Zod, gráficos con
Recharts) que consume la API exclusivamente a través del gateway.

### Diagrama de la arquitectura

```
                          ┌──────────────────────────┐
                          │   Frontend (Next.js 16)   │
                          │     http://localhost:3000  │
                          └─────────────┬─────────────┘
                                        │ HTTP /api/...
                                        ▼
                        ┌───────────────────────────────┐
                        │      API Gateway (Nginx)        │
                        │      http://localhost:8080      │
                        └───┬─────────┬─────────┬────────┘
            /api/auth/      │/api/spaces/  │/api/reservations/  │/api/billing/
                ▼           ▼              ▼                    ▼
        ┌────────────┐ ┌────────────┐ ┌──────────────────┐ ┌───────────────┐
        │AuthService │ │SpaceService│ │ReservationService│ │Billing_Service│
        │  Python    │ │    Go      │ │      Rust        │ │   Node.js     │
        │  FastAPI   │ │ Gin+GORM   │ │  Axum + SQLx     │ │   Express     │
        └─────┬──────┘ └─────┬──────┘ └────────┬─────────┘ └──────┬────────┘
              │              │  │               │ ▲                │
              ▼              ▼  │ publica        ▼ │ consume        ▼
        ┌──────────┐ ┌──────────┐ │ eventos  ┌──────────┐ │   ┌──────────┐
        │ auth-db  │ │ space-db │ │          │reservat. │ │   │billing-db│
        │ Postgres │ │ Postgres │ │          │ -db PG   │ │   │ Postgres │
        └──────────┘ └──────────┘ │          └──────────┘ │   └──────────┘
                                   │   ┌──────────────┐    │
                                   └──▶│   RabbitMQ   │────┘
                                       │ Message Broker│
                                       └──────────────┘
```

---

## Tabla de Endpoints (vía API Gateway)

Todas las rutas se consumen a través del gateway en `http://localhost:8080`. El
gateway reescribe el prefijo antes de redirigir al servicio interno.

> 🔒 = requiere token JWT válido · 👑 = requiere rol `Admin`

| Servicio | Prefijo del gateway | Tecnología | Método | Endpoint (vía gateway) | Auth | Descripción |
| -------- | ------------------- | ---------- | ------ | ---------------------- | ---- | ----------- |
| **Auth** | `/api/auth/` | Python / FastAPI | `GET` | `/api/auth/health` | — | Estado del servicio |
| | | | `POST` | `/api/auth/register` | — | Registrar usuario y obtener token |
| | | | `POST` | `/api/auth/login` | — | Iniciar sesión |
| | | | `GET` | `/api/auth/users/me` | 🔒 | Perfil del usuario autenticado |
| | | | `PUT` | `/api/auth/users/me` | 🔒 | Actualizar perfil |
| | | | `DELETE` | `/api/auth/users/me` | 🔒 | Eliminar la propia cuenta |
| | | | `GET` | `/api/auth/users` | 👑 | Listar todos los usuarios |
| | | | `GET` | `/api/auth/users/admins` | 👑 | Listar administradores |
| | | | `POST` | `/api/auth/users/admin` | 👑 | Crear administrador |
| | | | `DELETE` | `/api/auth/users/{user_id}` | 👑 | Eliminar usuario por ID |
| **Spaces** | `/api/spaces/` | Go / Gin + GORM | `GET` | `/api/spaces/health` | — | Estado del servicio |
| | | | `GET` | `/api/spaces/espacios` | 🔒 | Listar espacios (paginación/filtros) |
| | | | `GET` | `/api/spaces/espacios/{id}` | 🔒 | Obtener espacio por ID |
| | | | `POST` | `/api/spaces/espacios` | 👑 | Crear espacio (multipart) |
| | | | `PUT` | `/api/spaces/espacios/{id}` | 👑 | Actualizar espacio (multipart) |
| | | | `PATCH` | `/api/spaces/espacios/{id}/estado` | 👑 | Cambiar estado del espacio |
| **Reservations** | `/api/reservations/` | Rust / Axum + SQLx | `GET` | `/api/reservations/health` | — | Estado del servicio |
| | | | `POST` | `/api/reservations/reservas` | 🔒 | Crear reserva |
| | | | `GET` | `/api/reservations/reservas/mis-reservas` | 🔒 | Listar mis reservas |
| | | | `GET` | `/api/reservations/reservas/disponibilidad` | 🔒 | Consultar disponibilidad |
| | | | `DELETE` | `/api/reservations/reservas/{id}` | 🔒 | Cancelar reserva |
| | | | `GET` | `/api/reservations/reservas` | 👑 | Listar todas las reservas |
| | | | `GET` | `/api/reservations/cola` | 👑 | Estado de la cola de prioridad |
| | | | `POST` | `/api/reservations/cola/confirmar` | 👑 | Confirmar siguiente en cola |
| | | | `GET` | `/api/reservations/horarios` | 🔒 | Listar horarios de negocio |
| | | | `PUT` | `/api/reservations/horarios/{dia_semana}` | 👑 | Actualizar horario de un día |
| **Billing** | `/api/billing/` | Node.js / Express | `GET` | `/api/billing/health` | — | Estado del servicio |
| | | | `POST` | `/api/billing/facturas` | 👑 | Crear factura desde una reserva |
| | | | `GET` | `/api/billing/facturas/mis-facturas` | 🔒 | Listar mis facturas |
| | | | `GET` | `/api/billing/facturas/{id}` | 🔒 | Obtener factura por ID |
| | | | `GET` | `/api/billing/facturas` | 👑 | Listar todas las facturas |
| | | | `PATCH` | `/api/billing/facturas/{id}/pagar` | 👑 | Marcar factura como pagada |
| | | | `GET` | `/api/billing/reportes/resumen` | 👑 | Resumen general de facturación |
| | | | `GET` | `/api/billing/reportes/por-espacio` | 👑 | Ingresos por espacio |
| | | | `GET` | `/api/billing/reportes/por-usuario` | 👑 | Ingresos por usuario |
| | | | `GET` | `/api/billing/reportes/ingresos-mensuales` | 👑 | Ingresos mensuales |
| | | | `GET` | `/api/billing/reportes/top-espacios` | 👑 | Espacios con mayores ingresos |