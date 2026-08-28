# BesTal

Multi-tenant recruiting SaaS platform — Toptal-inspired UI with vetted talent marketplace experience.

**Architecture & data flow:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Frontend (React + Vite)

Single web app at `apps/web` — marketing site plus admin, recruiter, and client portals.

| App | Port | Command | Description |
|-----|------|---------|-------------|
| **web** | 5173 | `npm run dev:web` | Unified app (public + all portals) |

```bash
# Install all workspaces
npm install

# Run the web app
npm run dev:web

# Production build
npm run build:web
```

### Public website

| Route | Screen |
|-------|--------|
| `/` | Home — hero, stats, testimonials, logos |
| `/how-it-works` | 3-step hiring process |
| `/talent` | Published talent grid |
| `/jobs` | Open roles listing |
| `/jobs/:slug` | Job detail + apply CTA |
| `/communities` | Skill communities |
| `/enterprise` | Enterprise offering |
| `/about` | About BesTal |
| `/contact` | Contact form |
| `/login` | Portal selector |

### Admin portal (`/admin/*`)

| Route | Screen |
|-------|--------|
| `/admin/login` | Admin login |
| `/admin` | Dashboard — 8 KPI widgets + charts |
| `/admin/candidates` | Candidate list (TanStack Table) |
| `/admin/candidates/:id` | Candidate detail with activity tabs |
| `/admin/clients` | Client accounts |
| `/admin/deployments` | Placements |
| `/admin/trials` | Trial engagements |
| `/admin/evaluations` | Technical evaluations |
| `/admin/background-checks` | Background verification |
| `/admin/settings` | Platform settings |

### Recruiter portal (`/recruiter/*`)

| Route | Screen |
|-------|--------|
| `/recruiter/login` | Recruiter login |
| `/recruiter` | Pipeline dashboard |
| `/recruiter/candidates` | Talent search grid |
| `/recruiter/candidates/:id` | Candidate profile detail |
| `/recruiter/evaluations` | Technical evaluations |
| `/recruiter/shortlists` | Client shortlists |
| `/recruiter/interviews` | Interview schedule |
| `/recruiter/background-checks` | Compliance checks |
| `/recruiter/clients` | Client accounts |
| `/recruiter/deployments` | Active deployments |

### Client portal (`/client/*`)

| Route | Screen |
|-------|--------|
| `/client/login` | Client login |
| `/client` | Dashboard — KPIs, shortlists, interviews, trials |
| `/client/search` | Candidate search with filters |
| `/client/candidates/:id` | Candidate detail + actions |
| `/client/shortlisted` | Shortlisted candidates |
| `/client/interviews` | Interview requests |
| `/client/trials` | Trial requests |

### Shared packages

| Package | Purpose |
|---------|---------|
| `@bestal/ui` | Toptal-inspired components + layouts |
| `@bestal/mock-data` | Dummy JSON for all screens |
| `@bestal/shared-utils` | `cn()`, formatters |

---

## Backend API

Located in `apps/api`.

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL)

### Quick Start

```bash
docker compose up -d
cd apps/api
npm install
npm run prisma:migrate
npm run db:seed
npm run dev
```

### Demo Credentials (after seed)

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Super Admin | superadmin@bestal.co | Password123! | `/login` |
| Admin | admin@bestal.co | Password123! | `/admin/login` |
| Recruiter | recruiter@bestal.co | Password123! | `/recruiter/login` |
| Sales | sales@bestal.co | Password123! | — |
| Client | client@bestal.co | Password123! | `/client/login` |

API docs (Swagger UI): `http://localhost:3000/docs`

### REST API (`/api/v1`)

| Tag | Prefix | Description |
|-----|--------|-------------|
| Auth | `/auth` | Login, refresh, logout, me, password flows |
| Candidates | `/candidates` | CRUD, publish/hide/approve/reject, file uploads |
| Clients | `/clients` | Client account CRUD |
| Evaluations | `/evaluations` | Technical assessments + complete workflow |
| Background Checks | `/background-checks` | Compliance verification |
| Deployments | `/deployments` | Placements + activate/terminate |
| Trials | `/trials` | Trial requests + approve/reject |
| Search | `/search` | Cross-entity search |
| Notifications | `/notifications` | In-app notifications |

**Conventions:** JSON bodies, `{ data }` success envelope, RFC 7807 `application/problem+json` errors, JWT Bearer auth, Zod validation, org-scoped multi-tenancy.
