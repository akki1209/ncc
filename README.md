# NCC OTA Gwalior — Officers’ Training Academy

Rails JSON API + React/TypeScript portal for a single institution. Includes admin and student workspaces, secure invitations, program state transitions, capacity-controlled enrollment, explicit progress/completion approval, reports, audit history, and private PDF completion certificates. Fictional samples are not official NCC-approved programs. Issued documents are institutional completion certificates, not official NCC A/B/C certificates.

## Quick start (Docker)

1. Copy `.env.example` to `.env`. Choose a unique local database password and admin password (12+ characters). Generate SECRET_KEY_BASE with `cd backend && bundle exec rails secret` or `openssl rand -hex 64`.
2. Run `docker compose up --build`.
3. Run `docker compose exec api bundle exec rails db:seed` to load fictional local records. Seeding is explicitly disabled in production.
4. Open http://localhost:5173. Admin email is `SEED_ADMIN_EMAIL`; password is your configured `SEED_ADMIN_PASSWORD`. Fictional cadets `cadet1@ncc.local` through `cadet10@ncc.local` use that same local password.
5. Mailpit at http://localhost:8025 captures setup/recovery emails. Registered students are inactive until they use their six-hour password setup link.

PostgreSQL and Redis are internal services. API port 3000 and development frontend 5173 are published for local use. The frontend proxies `/api` to Rails, maintaining one browser origin. Database, Redis jobs, and private attachments use persistent named volumes. Start the API migration before running workers on a new production database.

## Native development

Requires Ruby 3.2+, Node 22.12+, PostgreSQL 16+, and Redis 7. Use separate terminals:

```sh
cd backend
bundle install
export DATABASE_URL=postgresql://localhost/ncc_development
export REDIS_URL=redis://localhost:6379/0
export SEED_ADMIN_PASSWORD='your-local-password'
bundle exec rails db:prepare
SEED_ADMIN_PASSWORD='your-local-password' bundle exec rails db:seed
bundle exec rails server
```

```sh
cd backend
bundle exec sidekiq
```

```sh
cd frontend
npm ci
npm run dev
```

Export SMTP settings from `.env.example` for invitation delivery. Without SMTP_HOST, native development writes invitation emails to `backend/tmp/mail`. Native Rails does not automatically load the root `.env`; export values in your shell. Docker Compose loads it automatically. API_TARGET optionally changes Vite’s server-side proxy target.

## Verification

```sh
cd backend
RAILS_ENV=test TEST_DATABASE_URL=postgresql://localhost/ncc_test bundle exec rails db:prepare
TEST_DATABASE_URL=postgresql://localhost/ncc_test bundle exec rspec
bundle exec rails zeitwerk:check
bundle exec rubocop
```

```sh
cd frontend
npm run build
npm test
npm run lint
```

Backend specs cover authentication, CSRF, authorization/isolation, validation, enrollment constraints, immutable issuance snapshots, real PDF generation and retry idempotency, revoked download denial, and the admin-to-student workflow. Frontend tests cover form validation and private download links. CI runs PostgreSQL-backed request/model specs and frontend checks. Browser tests are separate from request tests. With the development services running, run `cd frontend && E2E_PASSWORD=your-local-password npm run test:e2e`. Set CHROME_PATH to a Chrome/Chromium executable on non-macOS hosts. Browser checks cover real admin/student sign-in, student search, program creation, authorized PDF download, role protection, and mobile profile editing. To test invitation activation using native development email output, also set `E2E_MAIL_DIR` to the absolute `backend/tmp/mail` directory.

## Production operations

Build the frontend with `npm ci && npm run build`; serve `frontend/dist` via an HTTPS reverse proxy with SPA fallback, routing `/api/` to Puma. Run Sidekiq separately with a persistent Redis service, PostgreSQL, and shared persistent private Active Storage volume. Sidekiq is the production job adapter; do not use the in-process async adapter. Do not expose Redis, PostgreSQL, or development servers to the internet.

Set a strong SECRET_KEY_BASE, DATABASE_URL, REDIS_URL, FRONTEND_URL, APP_HOST, real SMTP credentials and MAILER_FROM. Set ORGANIZATION_NAME and CERTIFICATE_SIGNATORY for institutional PDF text. Configure Rails allowed hosts and trusted reverse proxies for your deployment. HTTPS and secure HttpOnly SameSite=Lax session cookies are enforced in production. All instances must share SECRET_KEY_BASE and private storage. For multiple hosts, configure a private object storage service instead of disk. Back up both database and attachments; monitor Sidekiq retries/dead jobs, mail delivery, and certificate failures. Requeue certificate jobs through a completed program’s generation action.

Provision production administrators via a secure Rails console process with an operator-chosen password; never use development seeds. There is no public registration. Login and recovery are rate limited per IP; configure a shared Rack::Attack cache for multi-process production and trusted proxies. An institutional retention schedule, operational privacy review, accessibility/browser acceptance testing, and deployment-specific penetration testing are prerequisites to production signoff. This source has not been independently certified production-ready.

See [API](docs/API.md) and [architecture](docs/ARCHITECTURE.md).
