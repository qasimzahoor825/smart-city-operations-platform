# 🏙️ Enterprise Smart City Operating System (SmartCity OS)

An enterprise-grade, event-driven **Smart City Operations & Digital Governance Platform** unifying citizen portals, municipal department operations, spatial GIS analytics, real-time IoT sensor telemetry, and automated emergency command centres — built with **Clean Architecture**, **SOLID** principles, **TypeScript**, and **production-ready** practices.

---

## 📌 Modules Delivered

| # | Module | Highlights |
| :-- | :-- | :-- |
| 1 | **Authentication** | Register, Login, Refresh Tokens, Forgot/Reset Password, Email Verification (mock), Remember Me, Secure Logout, Session Management |
| 2 | **RBAC** | Roles (Citizen, Officer, Department Head, Super Admin), role/permission guards, protected routes, route protection (Next.js middleware), dynamic navigation |
| 3 | **Citizen Dashboard** | Overview, complaint summary, bills, appointments, unread alerts, quick actions |
| 4 | **Officer Dashboard** | Assigned complaints, workspace, emergency, assets, notifications |
| 5 | **Department Dashboard** | Statistics, officers, complaint overview, asset status, analytics |
| 6 | **Super Admin** | City overview, users, officers, departments, assets, complaints, emergency, analytics, reports |
| 7 | **Complaint Management** | CRUD, details, timeline, status, priority, category, department assignment, SLA tracking, comments, history |
| 8 | **Department Module** | CRUD, officer assignment, performance/statistics |
| 9 | **Public Asset Management** | CRUD, categories, maintenance status, inspections |
| 10 | **GIS Dashboard** | Layers, markers (complaints/assets/hospitals/police/emergency), filter, search |
| 11 | **Emergency Module** | Fire / Medical / Flood / Accident, dispatch status, timeline, live map markers |
| 12 | **Analytics** | KPI cards, bar & donut charts (status/category), resolution rate |
| 13 | **Reports** | Complaint, asset, department, emergency report cards; export/print |
| 14 | **Notifications** | In-app/email/push mock channels, history, preferences, read/unread |
| 15–16 | **Settings & Profile** | Profile, avatar-ready fields, notification preferences, password change flows |
| 17 | **REST APIs** | Validation, pagination, filtering, sorting, auth, RBAC (see Swagger) |
| 18 | **MongoDB → PostgreSQL** | Fully relational Prisma schema: users, roles, departments, complaints, assets, appointments, notifications, emergencies, feedback, audit logs |
| 19 | **Docker** | Dockerfiles + Docker Compose for the full microservice stack |
| 20 | **API Documentation** | OpenAPI/Swagger spec (`docs/openapi.yaml`) with request/response + error codes |
| 21 | **README** | This document |

---

## 🧱 Tech Stack

| Layer | Technology |
| :-- | :-- |
| Frontend | **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS**, **Redux Toolkit**, **React Query**, **React Hook Form**, **Zod**, **Framer Motion**, **Leaflet** |
| Backend | **Node.js**, **Express**, **TypeScript** — modular microservices |
| Data | **PostgreSQL + PostGIS** (Prisma ORM) |
| Middleware | **Redis** (cache / rate-limit), **Apache Kafka** (event bus) |
| Security | **JWT** (access + refresh), bcrypt, Helmet, CORS, rate limiting, role guards |
| Infra | Docker, Docker Compose |

---

## 📁 Folder Structure

```
enterprise-smart-city-platform/
├── frontend/                    # Next.js 15 web application (citizen/department/admin portals)
│   └── src/
│       ├── app/                 # Routes: /citizen, /department, /admin, /login, /register, /auth
│       ├── components/          # ui/ primitives, layout (Navbar, PortalShell), charts, providers, shared
│       ├── constants/           # Role-aware navigation registry
│       ├── hooks/               # useAuth, useRequireRole, dashboard data hooks
│       ├── lib/                 # React Query client
│       ├── middleware.ts        # Edge route protection (cookie session flag)
│       ├── schemas/             # Zod validation schemas
│       ├── services/            # axios client + domain API modules
│       ├── store/               # Redux configureStore + auth/ui slices
│       ├── types/               # Domain TypeScript models
│       └── utils/               # helpers (errors, formatting)
│
├── backend/
│   ├── services/
│   │   ├── api-gateway/         # 4000 — JWT enforcement, rate-limit, proxy
│   │   ├── auth-service/        # 4001 — full auth + RBAC + sessions
│   │   ├── complaint-service/   # 4002 — complaints, SLA, workflow, comments
│   │   ├── payment-service/     # 4003 — bills & transactions
│   │   ├── gis-service/         # 4004 — layers, markers, search
│   │   ├── iot-telemetry-service# 4005 — live sensor readings
│   │   ├── notification-service # 4006 — multi-channel dispatch + preferences
│   │   └── department-service/  # 4007 — departments, officers, assets, emergencies, appointments
│   └── .env.example
│
├── packages/
│   ├── common/                  # @smartcity/common — enums, ApiResponse, errors, helpers
│   ├── shared/                  # @smartcity/shared — aggregated DTO contracts
│   └── database/                # @smartcity/database — Prisma schema + client
│
├── docs/openapi.yaml            # OpenAPI/Swagger specification
├── infrastructure/docker/       # Dockerfiles
├── docker-compose.yml
└── package.json                 # Workspace + orchestration scripts
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js **>= 20**
- Docker Desktop & Docker Compose (optional for infra)

### 1. Install
```bash
git clone <repo-url>
cd enterprise-smart-city-platform
npm install
```

### 2. Seed the database (Prisma)
```bash
cp backend/.env.example backend/.env   # set DATABASE_URL
npm run db:generate
npm run db:push
```

### 3. Run the full stack manually
```bash
npm run dev:all
```
- Web App (Next.js): http://localhost:3000
- API Gateway: http://localhost:4000
- Swagger/OpenAPI: http://localhost:4000/swagger.json · spec at `docs/openapi.yaml`

> Backend services ship with seeded, in-memory data and **graceful degradation** — they run
> even without Postgres so the whole demo works instantly. Swap the in-memory stores for
> the Prisma-backed repositories for production persistence.

### 4. Docker Compose (full stack)
```bash
docker-compose up --build
```

---

## 🚀 Deploy to Production

Two pieces: the **frontend** (Next.js) on Vercel and the **backend monolith**
(Express + Socket.io) on a long-running host — serverless Vercel functions kill
WebSockets and background jobs, so the API can't run as a serverless function.

**1. Backend on Render** (free tier) — one click from the blueprint:
- Render → **New → Blueprint** → connect `qasimzahoor825/smart-city-operations-platform` → apply `render.yaml`.
- You get a URL like `https://smartcity-backend.onrender.com`. `JWT_SECRET`/`REFRESH_SECRET` are auto-generated.
- Optional: add a `MONGODB_URL` (Atlas) for persistence, else it runs on seeded in-memory repos (resets on restart).
- Container alternative: `docker run -p 4100:4100 -e PORT=4100 ...` built via `infrastructure/docker/Dockerfile.backend`.

**2. Frontend on Vercel:**
- Import the repo, root directory `frontend`, framework **Next.js**.
- Environment Variables:
  ```
  NEXT_PUBLIC_API_URL=https://smartcity-backend.onrender.com/api/v1
  NEXT_PUBLIC_SOCKET_URL=https://smartcity-backend.onrender.com
  ```
- Redeploy — login now hits the live API. Demo accounts are seeded on boot (see below).

---

## 🧪 Testing

**Backend** (unit tests, Jest):

```bash
cd backend && npm test
```

**Frontend** (Playwright E2E against the running stack):

```bash
cd frontend

# Start the full stack once (see Quickstart) …
npm run dev:all        # from repo root: Web on :3000, API on :4000

# … then run the E2E suite
npm run e2e
```

The E2E suite covers the landing page reference (hero, live metric ticker, navigation,
zero horizontal overflow across breakpoints), the public pages, RBAC-protected route
redirects, auth failure handling, and the Super Admin login → GIS portal flow.

---

## 🔐 Demo Accounts

| Role | Email | Password |
| :-- | :-- | :-- |
| Citizen | `citizen@smartcity.gov` | `Citizen@1234` |
| Officer | `officer@publicworks.gov` | `Officer@1234` |
| Department Head | `head@publicworks.gov` | `Officer@1234` |
| Super Admin | `superadmin@smartcity.gov` | `Admin@1234` |

---

## 🔌 API Overview

All requests (except `/auth/register` & `/auth/login`) require `Authorization: Bearer <accessToken>`.

| Method | Endpoint | Service |
| :-- | :-- | :-- |
| POST | `/api/v1/auth/register` `/login` `/refresh` `/logout` `/forgot-password` `/reset-password` `/verify-email` | Auth |
| GET | `/api/v1/auth/me`, `/auth/sessions` | Auth |
| GET/POST/PATCH/DELETE | `/api/v1/complaints…` | Complaints |
| GET/POST | `/api/v1/departments…`, `/users…` | Department |
| GET/POST/PATCH | `/api/v1/assets…` | Assets |
| GET/POST/PATCH | `/api/v1/emergencies…` | Emergencies |
| GET | `/api/v1/appointments…` | Appointments |
| GET/POST/PATCH | `/api/v1/notifications…` | Notifications |
| GET/POST | `/api/v1/bills`, `/api/v1/pay` | Payments |
| GET | `/api/v1/gis/layers`, `/api/v1/gis/markers` | GIS |
| GET | `/api/v1/iot/readings/live` | IoT |

Response envelope:
```json
{
  "success": true,
  "message": "Authentication successful",
  "timestamp": "2026-08-07T10:00:00.000Z",
  "data": { "...": "..." }
}
```

Error codes: `401` Unauthorized · `403` Forbidden · `404` Not found · `409` Conflict · `422` Validation · `429` Too many requests · `500` Internal.

---

## 🧭 Route Protection (RBAC)

- **Next.js edge middleware** (`frontend/src/middleware.ts`) redirects authenticated users away from `/login`, `/register`, `/auth/*`, and protects `/citizen`, `/department`, `/admin` when no session cookie is present.
- **PortalShell** (role-aware client shell) enforces per-role navigation & redirects unauthenticated / wrong-role users to `/login`.
- Tokens live in `localStorage` (API client) and are mirrored to a session cookie for edge checks.

---

## 🛡️ Security Measures
- bcrypt password hashing (12 rounds)
- Short-lived access JWTs + rotating refresh tokens with bounded sessions
- Rate limiting on auth + global gateway endpoints
- Helmet security headers, CORS allow-list, payload size limits
- Centralized error handling with no sensitive-leakage

---

## 📄 License
Distributed under the **MIT License**. This is a reference / portfolio platform for educational and municipal demonstration purposes; adapt for your jurisdiction's compliance requirements.