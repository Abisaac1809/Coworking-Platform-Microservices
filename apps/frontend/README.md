# Nexus Coworking — Frontend

Aplicación web de la **Nexus Coworking Platform**. Es el panel desde el que usuarios
y administradores gestionan espacios, reservas, facturación, reportes, horarios y
cuentas. Consume la API de los microservicios exclusivamente a través del **API
Gateway** (`http://localhost:8080`).

- **Framework:** Next.js 16 (App Router) + React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 + tokens de diseño NEXUS (fuente DM Sans)
- **Validación:** Zod
- **Gráficos:** Recharts
- **Optimización:** React Compiler activado (`reactCompiler: true`)

---

## Inicio rápido

### Requisitos

- Node.js 20+
- El backend de la plataforma en ejecución (gateway en `http://localhost:8080`).
  Ver el `docker-compose.yml` en la raíz del repositorio.

### Pasos

```bash
npm install

# Variables de entorno (apunta al API Gateway)
# .env.local
#   API_URL=http://localhost:8080
#   NEXT_PUBLIC_API_URL=http://localhost:8080

npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Descripción |
| ------ | ----------- |
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la build de producción |
| `npm run lint` | Linter (ESLint) |

### Variables de entorno

| Variable | Uso |
| -------- | --- |
| `API_URL` | URL del API Gateway usada en el **servidor** (Server Actions / `lib/api.ts`). |
| `NEXT_PUBLIC_API_URL` | URL del gateway expuesta al **cliente** (p. ej. imágenes de espacios). |

---

## Arquitectura interna

La app usa el **App Router** de Next.js con un fuerte enfoque en **Server
Components y Server Actions**: las páginas obtienen datos en el servidor y las
mutaciones se ejecutan mediante Server Actions, que son las únicas que hablan con el
gateway. El token JWT se guarda en una **cookie `token`** y se adjunta como
`Authorization: Bearer` en cada petición.

```
Browser ──▶ proxy (guard de auth) ──▶ Server Components / Server Actions
                                              │  lib/api.ts (Bearer token)
                                              ▼
                                       API Gateway (:8080) ──▶ microservicios
```

### Estructura del proyecto

```
src/
├── app/
│   ├── actions/            Server Actions por dominio (auth, spaces, reservations,
│   │                       billing, users, configuracion)
│   ├── (app)/              Rutas protegidas (layout con sidebar):
│   │   ├── dashboard/      KPIs y gráficos
│   │   ├── spaces/         Catálogo y gestión de espacios
│   │   ├── reservations/   Reservas (vista por espacio / tabla, calendario)
│   │   ├── ordenes/        Cola de prioridad de reservas pendientes
│   │   ├── billing/invoices/  Facturas y pago
│   │   ├── caja/           Cobro / caja
│   │   ├── configuracion/  Horarios de negocio
│   │   ├── profile/        Perfil del usuario
│   │   └── users/          Administración de usuarios/admins
│   ├── login/  register/   Rutas públicas (autenticación)
│   ├── layout.tsx          Layout raíz (fuente, tokens globales)
│   └── globals.css         Estilos y tokens de diseño NEXUS
├── components/             UI reutilizable (Sidebar, Modal, KpiCard, charts, etc.)
├── lib/
│   ├── api.ts              Wrapper de fetch al gateway (GET/POST/PUT/PATCH/DELETE + multipart)
│   ├── validations/        Esquemas Zod (auth, ...)
│   └── lookups, spaces, user   Helpers de dominio
├── hooks/                  Hooks de cliente (p. ej. usePhoneInput)
├── types/                  Tipos TypeScript por dominio
└── proxy.ts               Guard de rutas: redirige a /login sin token y a /dashboard si ya hay sesión
```

| Pieza | Responsabilidad |
| ----- | --------------- |
| **`proxy.ts`** | Protege las rutas: sin cookie `token` redirige a `/login`; con sesión activa evita `/login` y `/register`. |
| **`app/actions/`** | Server Actions que validan entrada (Zod), llaman al gateway vía `lib/api.ts` y revalidan datos. |
| **`lib/api.ts`** | Centraliza el `fetch` al gateway, inyecta el `Bearer token` desde la cookie y maneja JSON y `multipart/form-data`. |
| **`(app)/layout.tsx`** | Layout de la zona autenticada con la navegación lateral (`Sidebar`). |
| **`components/`** | Componentes de presentación: tablas, modales, tarjetas KPI y gráficos (Recharts). |

### Autenticación

El login/registro obtienen un JWT del AuthService (vía gateway) y lo almacenan en la
cookie `token`. A partir de ahí, `proxy.ts` controla el acceso a las rutas y
`lib/api.ts` envía el token en cada llamada. Los roles (`User` / `Admin`) del payload
del token determinan qué vistas y acciones se muestran.

---

## Backend y endpoints

El frontend no define endpoints propios; consume los de los microservicios a través
del gateway bajo los prefijos `/api/auth`, `/api/spaces`, `/api/reservations` y
`/api/billing`. Para el detalle de cada endpoint, consulta el `README.md` de cada
servicio en `services/` y el documento `API_ENDPOINTS.md` en la raíz del repositorio.
