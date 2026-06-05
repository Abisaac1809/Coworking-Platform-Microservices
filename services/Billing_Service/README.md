# Billing_Service

Microservicio de **facturación y reportes** de la Nexus Coworking Platform. Genera
facturas a partir de los datos de una reserva (calcula horas, subtotal, impuesto y
total), gestiona el pago de facturas y produce reportes agregados de ingresos
(resumen general, por espacio, por usuario, mensuales y top de espacios).

- **Lenguaje:** Node.js
- **Framework:** Express
- **Base de datos:** PostgreSQL (driver `pg` + pool de conexiones)

---

## Arquitectura interna

`main.js` crea la app Express, expone `/health`, aplica el middleware de
autenticación JWT a todo el tráfico posterior y monta los routers de `/facturas` y
`/reportes`, cerrando con un manejador global de errores. La aplicación sigue una
**arquitectura en capas** clásica.

```
HTTP → routes → middlewares (JWT + rol) → controllers → services → repositories → pg pool → PostgreSQL
                                                            │
                                          validators · utils/calculos (horas, impuesto, total)
```

| Capa | Carpeta / archivo | Responsabilidad |
| ---- | ----------------- | --------------- |
| **Routes** | `routes/` | Definen rutas de facturas y reportes con su control de rol. |
| **Controllers** | `controllers/` | Adaptan la petición/respuesta HTTP e invocan los servicios. |
| **Services** | `services/` | Lógica de negocio de facturación y de reportes. |
| **Repositories** | `repositories/` | Consultas SQL contra PostgreSQL. |
| **Validators** | `validators/` | Validación de los datos de entrada de facturas. |
| **Utils** | `utils/calculos.js` | Cálculo de horas, subtotal, impuesto y total. |
| **Middlewares** | `middlewares/` | `authenticate` (valida JWT) y `requireRole` (autoriza por rol). |
| **DB** | `db/connection.js` | Pool de conexiones a PostgreSQL. |
| **SQL** | `sql/schema.sql` | Esquema de la base de datos de facturación. |

> Token = requiere token JWT válido · Admin = requiere rol `Admin`
> Todas las rutas (salvo `/health`) requieren token.

---

## Tabla de endpoints

> Rutas tal como las recibe el servicio (el gateway las expone bajo `/api/billing/`).

| Método | Ruta | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| `GET` | `/health` | — | Estado del servicio y de la base de datos |
| `POST` | `/facturas` | Admin | Crea una factura a partir de una reserva |
| `GET` | `/facturas/mis-facturas` | Token | Lista las facturas del usuario autenticado |
| `GET` | `/facturas/{id}` | Token | Obtiene una factura por ID (propia, o cualquiera si es Admin) |
| `GET` | `/facturas` | Admin | Lista todas las facturas (paginación) |
| `PATCH` | `/facturas/{id}/pagar` | Admin | Marca una factura como pagada |
| `GET` | `/reportes/resumen` | Admin | Resumen general de facturación |
| `GET` | `/reportes/por-espacio` | Admin | Ingresos agrupados por espacio |
| `GET` | `/reportes/por-usuario` | Admin | Ingresos agrupados por usuario |
| `GET` | `/reportes/ingresos-mensuales` | Admin | Ingresos por mes |
| `GET` | `/reportes/top-espacios` | Admin | Espacios con mayores ingresos |
