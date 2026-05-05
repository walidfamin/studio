# Independent Web + Mobile Rebuild Implementation Plan

> For Hermes: Use subagent-driven-development skill to implement this plan task-by-task.

Goal: Rebuild the current Firebase Studio finance dashboard as an independently controlled production system with a web app, mobile app, backend API, database, authentication, imports/exports, and full source-level access.

Architecture: Use a monorepo with shared TypeScript types and business logic. Keep the current UI/feature concepts from the Firebase Studio Next.js app, but replace in-memory data with a real backend and database. Web and mobile clients call the same API so features stay consistent.

Recommended Tech Stack:
- Monorepo: pnpm workspaces + Turborepo
- Web: Next.js 15, React, Tailwind, shadcn/ui
- Mobile: Expo React Native, Expo Router, NativeWind, React Query
- Backend: NestJS or Fastify API, TypeScript, Prisma ORM
- Database: PostgreSQL
- Auth: Better Auth, Auth.js, Clerk, or custom JWT/session auth; recommendation is Better Auth or Auth.js for full control
- Storage: S3-compatible storage for bank statements/import files and receipts
- Jobs: BullMQ + Redis for recurring imports, reminders, scheduled reports
- Deployment: Docker Compose for development; production on VPS/Render/Railway/Fly.io + managed Postgres

---

## 1. Current Project Inventory

Existing repo: `walidfamin/studio`

Current app type:
- Firebase Studio generated Next.js app
- Next.js 15.3.3
- React 18
- Tailwind/shadcn-style UI
- Firebase package installed, but no `firebase.json` found
- Data is currently stored in `src/lib/data.ts`, not a real backend/database

Existing routes:
- `/` Dashboard
- `/transactions` All transactions
- `/reports` Reports
- `/budgets` Budgets
- `/accounts` Accounts summary
- `/accounts/new` Create account
- `/accounts/[accountId]` Account details, transaction import/editing
- `/investments` Investments list
- `/investments/new` Add investment
- `/investments/[investmentId]` Investment details
- `/login` Login UI only
- `/signup` Signup UI only

Existing domain entities from `src/lib/types.ts`:
- Transaction
- Account
- Investment
- UpcomingPayment
- Contributor
- Installment

Existing functions from `src/lib/data.ts`:
- `addTransaction`
- `deleteTransactions`
- `addInvestment`
- `updateUpcomingPaymentStatus`
- `deleteUpcomingPayment`

Existing implemented feature areas:
- Dashboard charts and finance summary
- Transactions table
- Transaction add sheet
- Account grouping by bank
- Account detail pages
- Excel/CSV import logic in account details
- Export selected transactions to XLSX
- Spending reports
- Budgets page
- Investments pages
- Upcoming payments widget
- Login/signup screens as UI only

---

## 2. Confirmed Current Problems

Build/typecheck issues found during audit:

1. `npm run typecheck` fails.
   - `src/app/accounts/[accountId]/page.tsx`: incorrect `use(params)` usage and category typing issues
   - Recharts formatter callbacks are typed as `number` but receive `ValueType`
   - `src/components/reports/spending-by-category.tsx`: `Interval` is not defined

2. `npm run build` fails.
   - `/accounts/new` uses `useSearchParams()` without a Suspense boundary
   - Next.js error: `useSearchParams() should be wrapped in a suspense boundary at page "/accounts/new"`

3. Data is not persistent.
   - `transactions`, `accounts`, `investments`, and `upcomingPayments` are in-memory arrays
   - Refresh/deploy/server restart can lose runtime changes

4. Auth is not implemented.
   - `/login` and `/signup` are visual screens only
   - No real user/session backend

5. Backend is missing.
   - No API routes for finance data
   - No database schema
   - No permissions/RBAC
   - No audit log

6. Mobile app is missing.
   - Current app is web-only
   - No Expo/React Native project
   - No offline sync strategy

7. Security and ownership gaps.
   - No access control per user/organization
   - No encrypted secrets management documented
   - No backup/export strategy

---

## 3. Product Requirements for the Rebuild

### Must Have: Web

- Dashboard with income, expenses, savings, credit-card usage, investments, recurring expenses, upcoming payments, and spending breakdown
- Transaction CRUD
- Bulk transaction delete
- Transaction import from XLSX/CSV
- Transaction export to XLSX/CSV
- Duplicate detection during import
- Account CRUD
- Bank grouping
- Account balances from imported statement balance and manual transactions
- Credit card balance/limit handling
- Budgets by category and period
- Reports by month, category, account, assigned person, investment
- Investments CRUD
- Link income/expense transactions to investments
- Upcoming payments/reminders CRUD
- Login/signup/session management
- User settings/profile

### Must Have: Mobile

- Login/signup
- Dashboard summary
- Transactions list/search/filter
- Add/edit/delete transaction
- Accounts list and account detail
- Investments list and details
- Upload/import statements from phone file picker
- Push notifications for upcoming payments/reminders
- Offline read cache; optional offline writes queued for sync

### Must Have: Backend

- REST API or tRPC endpoints
- PostgreSQL database
- User and organization model
- Auth and session management
- Row-level ownership checks in every query
- Import parser service
- Duplicate detection service
- Report aggregation service
- Background job service for reminders/reports
- File storage for statement uploads
- Audit log for important changes
- Admin seed script and backup scripts

---

## 4. Proposed Monorepo Structure

Create this new structure:

```txt
finance-platform/
  apps/
    web/                  # Next.js web app
    mobile/               # Expo React Native app
    api/                  # NestJS/Fastify backend API
  packages/
    config/               # shared eslint/tsconfig/prettier
    db/                   # Prisma schema, migrations, db client
    shared/               # shared types, zod schemas, constants
    finance-core/         # calculations, import parsing, duplicate detection
    ui/                   # optional shared UI primitives for web/mobile adapters
  infra/
    docker-compose.yml
    nginx/
    scripts/
  docs/
    plans/
    api/
    deployment/
```

---

## 5. Database Model Draft

Use PostgreSQL + Prisma.

Core tables:
- `users`
- `organizations`
- `organization_members`
- `accounts`
- `transactions`
- `investments`
- `investment_contributors`
- `investment_installments`
- `budgets`
- `upcoming_payments`
- `imports`
- `import_rows`
- `files`
- `audit_logs`
- `notification_preferences`

Important fields:

`accounts`
- id
- organization_id
- name
- bank
- type
- currency
- opening_balance
- credit_limit
- created_at
- updated_at

`transactions`
- id
- organization_id
- account_id
- date
- description
- amount
- type: income | expense | transfer
- category
- assigned_to
- walid_share
- investment_id
- import_id
- balance
- hash_key for duplicate detection
- created_by
- created_at
- updated_at

`investments`
- id
- organization_id
- name
- type
- target_amount
- current_value
- notes
- created_at
- updated_at

`upcoming_payments`
- id
- organization_id
- account_id optional
- name
- amount optional
- date
- recurrence_rule optional
- status
- notify_at
- created_at
- updated_at

---

## 6. API Endpoint Draft

Auth:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Accounts:
- `GET /accounts`
- `POST /accounts`
- `GET /accounts/:id`
- `PATCH /accounts/:id`
- `DELETE /accounts/:id`
- `GET /accounts/:id/summary`

Transactions:
- `GET /transactions?accountId=&from=&to=&category=&type=&q=`
- `POST /transactions`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`
- `POST /transactions/bulk-delete`
- `POST /transactions/export`

Imports:
- `POST /imports/statement`
- `GET /imports/:id`
- `POST /imports/:id/confirm`
- `DELETE /imports/:id`

Investments:
- `GET /investments`
- `POST /investments`
- `GET /investments/:id`
- `PATCH /investments/:id`
- `DELETE /investments/:id`
- `GET /investments/:id/transactions`

Reports:
- `GET /reports/dashboard`
- `GET /reports/spending-by-category`
- `GET /reports/transactions-over-time`
- `GET /reports/budget-vs-actual`
- `GET /reports/net-worth`

Upcoming payments:
- `GET /upcoming-payments`
- `POST /upcoming-payments`
- `PATCH /upcoming-payments/:id`
- `DELETE /upcoming-payments/:id`

---

## 7. Implementation Phases

### Phase 0: Stabilize Current Repo

Objective: Make the current repo buildable so it can be used as a UI/reference source.

Tasks:
1. Fix `/accounts/new` Suspense build failure.
2. Fix `src/app/accounts/[accountId]/page.tsx` params typing.
3. Fix category empty-string typing.
4. Fix Recharts formatter typings.
5. Fix undefined `Interval` in spending report.
6. Run `npm run typecheck` until clean.
7. Run `npm run build` until clean.

Verification:
- `npm ci`
- `npm run typecheck`
- `npm run build`

### Phase 1: Create Monorepo Foundation

Objective: Create independent project structure outside Firebase Studio.

Tasks:
1. Create `finance-platform/` workspace.
2. Add `pnpm-workspace.yaml`.
3. Add root `package.json` scripts.
4. Add shared TypeScript config package.
5. Add Docker Compose with Postgres, Redis, API, and web.
6. Add `.env.example` files.
7. Add README with local setup steps.

Verification:
- `pnpm install`
- `docker compose up -d postgres redis`
- `pnpm lint`
- `pnpm typecheck`

### Phase 2: Backend and Database

Objective: Build real persistent backend.

Tasks:
1. Create `apps/api`.
2. Create `packages/db` with Prisma.
3. Define Prisma schema for users, organizations, accounts, transactions, investments, budgets, upcoming payments, imports, files, audit logs.
4. Add migrations.
5. Add seed script matching current sample banks/accounts.
6. Add auth middleware.
7. Add organization membership checks.
8. Add API modules one by one: accounts, transactions, imports, investments, reports, reminders.

Verification:
- `pnpm --filter db prisma migrate dev`
- `pnpm --filter api test`
- API health check returns OK
- Seed creates ADCB, FAB BANK, RAK BANK accounts

### Phase 3: Shared Finance Core

Objective: Extract finance logic from UI into reusable tested package.

Tasks:
1. Create `packages/finance-core`.
2. Move duplicate transaction ID/hash logic into finance-core.
3. Move account balance calculations into finance-core.
4. Move credit card calculations into finance-core.
5. Move statement date parsing into finance-core.
6. Move XLSX/CSV parsing into finance-core.
7. Add unit tests for all calculations.

Verification:
- `pnpm --filter finance-core test`
- Import duplicate detection handles same date/amount/type/description
- Account balance matches current app logic

### Phase 4: Web App

Objective: Rebuild web app on independent backend.

Tasks:
1. Create `apps/web` Next.js app.
2. Port current layout, sidebar, dashboard components.
3. Replace `src/lib/data.ts` with React Query API calls.
4. Implement auth-protected routes.
5. Implement accounts pages.
6. Implement transaction table and add/edit/delete modals.
7. Implement imports flow.
8. Implement investments pages.
9. Implement budgets/reports pages.
10. Add settings/profile page.

Verification:
- Web login works.
- Account create/edit persists in Postgres.
- Transaction import persists in Postgres.
- Refreshing browser does not lose data.
- `pnpm --filter web build` passes.

### Phase 5: Mobile App

Objective: Build mobile app with the same backend.

Tasks:
1. Create `apps/mobile` Expo app.
2. Add auth screens.
3. Add dashboard tab.
4. Add accounts tab.
5. Add transactions tab with filters/search.
6. Add add/edit transaction screens.
7. Add investments tab.
8. Add file picker import flow.
9. Add push notification registration.
10. Add offline cache with React Query persistence.

Verification:
- `pnpm --filter mobile start`
- Login works on device/simulator.
- Add transaction from mobile appears on web.
- Add transaction from web appears on mobile.

### Phase 6: Deployment and Operations

Objective: Own deployment without Firebase Studio.

Tasks:
1. Add production Dockerfiles.
2. Add production `docker-compose.yml`.
3. Add Nginx reverse proxy config.
4. Add GitHub Actions CI for lint/typecheck/test/build.
5. Add database backup script.
6. Add restore script.
7. Add deployment guide.
8. Add secrets guide.

Verification:
- Fresh server can deploy from README only.
- CI passes on PR.
- Backup and restore tested against staging database.

---

## 8. Missing Feature Checklist

Backend/data:
- [ ] Persistent database
- [ ] Real API
- [ ] Auth/session handling
- [ ] User profile
- [ ] Organization/team support
- [ ] Permissions/RBAC
- [ ] Audit log
- [ ] File upload/storage
- [ ] Background jobs
- [ ] Backups

Finance:
- [ ] Real account CRUD persistence
- [ ] Real transaction CRUD persistence
- [ ] Duplicate detection in backend
- [ ] Transfer double-entry handling
- [ ] Recurring transactions
- [ ] Recurring payment schedules
- [ ] Multi-currency handling
- [ ] Category management
- [ ] Custom categories
- [ ] Budget CRUD
- [ ] Investment contributors/installments
- [ ] Bank statement import mapping per bank
- [ ] Import preview/confirm/rollback

Web:
- [ ] Build/typecheck clean
- [ ] Protected routes
- [ ] Real login/signup
- [ ] Loading/error states
- [ ] Empty states
- [ ] Account edit/delete UI
- [ ] Transaction edit/delete UX polishing
- [ ] Settings page
- [ ] Export reports

Mobile:
- [ ] Expo app
- [ ] Auth screens
- [ ] Dashboard
- [ ] Transactions
- [ ] Accounts
- [ ] Investments
- [ ] File import
- [ ] Push notifications
- [ ] Offline cache

Quality:
- [ ] Unit tests
- [ ] API integration tests
- [ ] E2E web tests
- [ ] Mobile smoke tests
- [ ] CI/CD
- [ ] Error monitoring
- [ ] Analytics/logging

---

## 9. Immediate Next Actions

Recommended next action order:

1. Fix current repo build/typecheck so the UI reference is stable.
2. Create new independent monorepo.
3. Implement database schema and seed data.
4. Build backend API for accounts and transactions first.
5. Port web dashboard/accounts/transactions to API.
6. Add mobile app after backend API is stable.
7. Add imports/reports/investments/reminders.
8. Deploy staging.
9. Test with real data.
10. Deploy production.

---

## 10. Acceptance Criteria

The rebuild is complete when:

- Web app works without Firebase Studio.
- Mobile app works on iOS/Android through Expo.
- Backend and database are fully controlled by us.
- All data persists in PostgreSQL.
- User can sign up, log in, and manage private data.
- User can create accounts, import statements, add/edit/delete transactions, manage investments, view reports, and manage reminders.
- Web and mobile show the same data.
- Production deployment can be recreated from code and `.env` files.
- CI passes lint/typecheck/test/build.
- Backups are configured and restore has been tested.
