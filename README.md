# PATRI-TECH

A full-stack **asset and inventory management** system for organizations that still track
equipment in spreadsheets. It records what an organization owns, where each item is, who
is responsible for it, and every transfer between locations.

Built for property/inventory teams in public agencies, schools, and small and mid-sized
companies. The product is **white-label**: branding is replaceable per customer without
touching the business logic.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Permissions model](#permissions-model)
- [Tests](#tests)
- [Deployment](#deployment)
- [Security notes](#security-notes)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)
- [Independence](#independence)

## Features

### Authentication

- JWT login (`access` + `refresh`) issued by `djangorestframework-simplejwt`.
- Frontend routes are protected by the presence of a token, and the shared fetch helper
  (`src/auth.js`) renews an expired access token before retrying the request. Two screens
  (`Salas`, `BensPorSala`) use that helper; the dashboard also installs a 401 interceptor.
  The remaining screens read the token from `localStorage` and ask the user to log in
  again when it expires.
- Administrators use a Django user; each manager gets a Django user created on save
  (username = CPF, `is_staff = True`).

### Dashboard

- Total number of assets, units, and categories.
- Estimated value of **active** assets (written-off items excluded).
- Pie chart of active assets grouped by category.
- Table of the five most recently registered assets, with status badge (active/written
  off).
- A "scan barcode" button is present in the UI as a placeholder for a planned feature; it
  currently only displays a notice.

### Assets

- Full CRUD with unique asset tag (`tombo`), optional serial number and value,
  description, situation, conservation state, origin (owned / donated / leased), category,
  unit, and room.
- Written-off assets carry a write-off date and reason, are shown with a visual flag, and
  are excluded from the dashboard's asset value.
- Free-text filter by asset name or tag on the unit detail page.
- Per-asset movement history, opened in a modal from the asset list.

### Locations and catalog

- **Units** with address, plus a detail page listing every asset of that unit.
- **Rooms** linked to a unit, with a dedicated page listing the assets of that room.
- **Categories** used to classify assets.
- Relational integrity: units and categories still referenced by an asset cannot be
  deleted (`PROTECT`), and a unit with rooms cannot be deleted. Deleting a room detaches
  its assets (`SET NULL`) instead of deleting them.

### Managers and permissions

- Full CRUD for managers (name, CPF, phone, address, unit) integrated with Django users.
- Ten permission flags, editable per manager in the UI, covering assets and each catalog
  entity (see [Permissions model](#permissions-model)).
- Sensitive actions are authorized by the backend, not only hidden in the interface.

### Audit history

- Every transfer of an asset between units or between rooms creates a history entry with
  the author and timestamp.
- History is read-only and available both per asset (`/api/bens/{id}/historico/`) and
  globally (`/api/historicos/`, filterable by asset).

### API documentation

- OpenAPI 3 schema at `/schema/` and interactive Swagger UI at `/docs/`.

> **Language note:** the interface and codebase are in Brazilian Portuguese. This document
> is in English to make the project accessible to an international audience.

## Tech stack

**Backend**

| Concern | Choice |
| --- | --- |
| Language / framework | Python 3.12+ · Django 5.2 |
| API | Django REST Framework 3.16 |
| Authentication | SimpleJWT (JWT access/refresh) |
| Schema / docs | drf-spectacular (OpenAPI 3 + Swagger UI) |
| CORS | django-cors-headers |
| Database | SQLite (development) · PostgreSQL via `DATABASE_URL` (production) |
| Configuration | python-dotenv + environment variables |

**Frontend**

| Concern | Choice |
| --- | --- |
| Library | React 19 (Create React App) |
| Routing | React Router 7 |
| HTTP client | Axios (Bearer token attached per request) |
| Charts | Recharts |
| Icons | FontAwesome / React Icons |
| Styling | Plain CSS (no UI framework) |

## Architecture

```
patri-tech/
├── core/                        # Django app: models, serializers, views, permissions, tests
│   ├── management/commands/     # seed_demo: fictional demo dataset
│   ├── migrations/
│   ├── models.py                # Unidade, Sala, Categoria, Bem, Gestor, Historico
│   ├── permissions.py           # per-flag permissions + AND/OR combinators
│   ├── serializers.py
│   ├── views.py                 # ViewSets and dashboard endpoint
│   └── tests.py                 # 22 API/model tests
├── projeto/                     # Django project (settings, urls, wsgi, asgi)
├── frontend/
│   ├── public/
│   └── src/
│       ├── api.js               # single source of truth for the API base URL
│       ├── App.js               # routes + PrivateRoute
│       └── *.js                 # screens and shared components
├── .env.example                 # backend configuration template
├── requirements.txt
├── render.yaml                  # Render blueprint (API + PostgreSQL)
├── DEPLOY.md                    # deployment guide (Render + Vercel)
├── ROADMAP.md
└── manage.py
```

The React app talks to the REST API. The JWT is kept in `localStorage` and sent as a
`Bearer` header; the helper in `src/auth.js` refreshes an expired token through
`/api/token/refresh/` before retrying the request.

## Getting started

**Requirements:** Python 3.12+, Node.js 18+ and npm.

### 1. Backend

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux / macOS

pip install -r requirements.txt

copy .env.example .env         # Windows
# cp .env.example .env         # Linux / macOS

python manage.py migrate
python manage.py createsuperuser

# optional: fictional dataset to explore the UI
python manage.py seed_demo

python manage.py runserver
```

| URL | Purpose |
| --- | --- |
| <http://127.0.0.1:8000/api/> | REST API |
| <http://127.0.0.1:8000/docs/> | Swagger UI |
| <http://127.0.0.1:8000/admin/> | Django admin |

### 2. Frontend

```bash
cd frontend
npm install

copy .env.example .env         # Windows
# cp .env.example .env         # Linux / macOS

npm start
```

The app runs at <http://localhost:3000>.

### 3. Demo data

`seed_demo` creates units, categories, rooms, assets, and users with **fictional** data
(e.g. CPF `000.000.001-00`, invented asset tags). The password is generated randomly and
printed to the terminal; pass `--password` to choose one:

```bash
python manage.py seed_demo --password my-password
```

## Environment variables

Backend (`.env`, copied from `.env.example`):

| Variable | Default | Description |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | development key | **Required in production.** Generate one with `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"` |
| `DJANGO_DEBUG` | `True` | Set to `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Frontend origins allowed to call the API |
| `DEFAULT_GESTOR_PASSWORD` | empty | Initial password for managers created without one; when empty, the field becomes required |
| `JWT_ACCESS_MINUTES` | `60` | Access token lifetime |
| `JWT_REFRESH_DAYS` | `7` | Refresh token lifetime |
| `DATABASE_URL` | — | Optional; PostgreSQL in production |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME` | — | Optional; S3 media storage (all four required together) |

Frontend (`frontend/.env`):

| Variable | Default | Description |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://127.0.0.1:8000` | Base URL of the Django API |

No `.env` file is versioned; the `.env.example` files contain placeholders only.

## API reference

All endpoints require `Authorization: Bearer <access token>` unless marked public.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/token/` | Obtain access and refresh tokens (public) |
| `POST` | `/api/token/refresh/` | Refresh an access token (public) |
| `GET` | `/api/dashboard-stats/` | Aggregated totals (assets, units, categories, value) |
| `GET/POST/PUT/PATCH/DELETE` | `/api/bens/` | Assets · filter with `?sala=<id>` |
| `GET` | `/api/bens/{id}/historico/` | Movement history of one asset |
| `GET/POST/PUT/PATCH/DELETE` | `/api/unidades/` | Units |
| `GET/POST/PUT/PATCH/DELETE` | `/api/salas/` | Rooms · filter with `?unidade=<id>` |
| `GET/POST/PUT/PATCH/DELETE` | `/api/categorias/` | Categories |
| `GET/POST/PUT/PATCH/DELETE` | `/api/gestores/` | Managers and their permission flags |
| `GET` | `/api/historicos/` | Read-only history · filter with `?bem=<id>` |
| `GET` | `/schema/` · `/docs/` | OpenAPI schema and Swagger UI (public) |

## Permissions model

Administrators (`is_staff` or superuser) can perform every operation. Managers are
authorized per action through flags stored on their profile:

| Operation | Manager flag |
| --- | --- |
| Create assets | `pode_cadastrar` |
| Edit / delete assets (including recording a write-off) | `pode_editar` |
| Create units | `pode_cadastrar_unidade` |
| Edit / delete units | `pode_editar_unidade` |
| Create categories | `pode_cadastrar_categoria` |
| Edit / delete categories | `pode_editar_categoria` |
| Create rooms | `pode_cadastrar_sala` |
| Edit / delete rooms | `pode_editar_sala` |
| Manage managers | `pode_cadastrar_gestor` |

`pode_dar_baixa` also exists as a flag but is not yet enforced by a dedicated endpoint —
write-offs are currently applied through the asset edit form, under `pode_editar`. See
[Known limitations](#known-limitations).

## Tests

**Backend** — 22 tests covering JWT authentication, asset CRUD, unique asset tags,
transfer history, the permission flags of the API, and manager/user creation:

```bash
python manage.py test
```

**Frontend** — 2 tests for the API configuration module:

```bash
cd frontend
npm test -- --watchAll=false
```

## Deployment

The repository ships with deployment configuration:

- `render.yaml` — Render blueprint that provisions PostgreSQL and runs the Django API
  with Gunicorn, `collectstatic` and migrations on every deploy.
- `frontend/vercel.json` — Vercel configuration with rewrites for client-side routes.

Step-by-step instructions for the free tiers (~15 minutes): **[DEPLOY.md](DEPLOY.md)**.

## Security notes

- No credentials in the repository: all configuration comes from environment variables,
  `.env` is ignored, and `.env.example` holds placeholders only.
- Manager passwords are set through `DEFAULT_GESTOR_PASSWORD` or required at creation
  time; there is no default password hardcoded in the code.
- Passwords are stored with Django's password hasher; JWTs expire and can be refreshed.
- Authorization is enforced server-side for every write operation.
- The demo dataset is fictional. **Never use real personal data in development.**

## Known limitations

Tracked in [ROADMAP.md](ROADMAP.md):

- List endpoints are not paginated; the whole collection is returned.
- The UI lists assets per unit and per room, but global search and server-side sorting are
  not implemented.
- The CPF is used as the Django `username` for managers (inherited from the initial model).
- `pode_dar_baixa` is not enforced by a dedicated write-off endpoint yet.
- History records unit/room transfers only; changes made through the Django admin are not
  logged.
- The barcode button on the dashboard is a placeholder.
- No CI pipeline and no Docker setup yet.
- No public demo environment is live yet; `DEPLOY.md` documents how to publish one in
  about 15 minutes.

## Roadmap

The next ~73 hours of planned work are organized by theme in [ROADMAP.md](ROADMAP.md).

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE).

## Independence

This is a personal, independent project with no affiliation to public agencies,
companies, or institutions. Third-party logos and coats of arms used in early prototypes
have been removed; the product is white-label and any visual identity is configured by
whoever deploys it.
