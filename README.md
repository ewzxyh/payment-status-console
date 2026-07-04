# Payment Status Console

Payment Status Console is a focused operations dashboard for small groups that need a clear, shared source of truth for recurring manual payments. It gives administrators a fast monthly ledger, while public viewers get a clean read-only payment status page without access to private contact data.

The project is built as a modern Next.js application with signed admin sessions, persistent storage through Vercel Blob, optimistic UI updates, month-by-month payment tracking, and copy-ready exports for messaging groups.

## Why This Exists

Many teams, clubs, classrooms, communities, and subscription groups still collect payments manually. The hard part is rarely the payment itself. The hard part is keeping a readable list of who has paid, who has not, which month is being reviewed, and what can safely be shared with the group.

Payment Status Console turns that recurring manual workflow into a small, dependable control center:

- administrators manage members and monthly payment states;
- public viewers can check the current list without editing anything;
- exports can be copied as clean checklist-style messages;
- sensitive admin-only data stays behind authentication.

## Core Features

### Monthly Payment Ledger

- Create future months.
- Add previous months for historical tracking.
- Remove months when they are no longer needed.
- Select any month and manage each member independently.
- Track only the two operational states that matter: `Paid` and `Unpaid`.

### Member Management

- Add members.
- Edit member names and optional phone numbers.
- Remove members across the full ledger.
- Keep public views free of phone numbers while preserving them for admins.

### Public and Admin Experiences

- Public home page for read-only payment visibility.
- Dedicated admin area at `/admin`.
- Signed admin session cookie.
- Login rate limiting.
- Environment-based credentials.
- Automatic data refresh for public viewers.

### Copy-Ready Reporting

- Select one or more months.
- Generate a formatted checklist with check and X markers.
- Copy the result directly to the clipboard for chat apps, groups, or manual reports.

### Persistence

- Data is saved as JSON in Vercel Blob.
- The application seeds an initial roster when no saved data exists.
- Stored legacy statuses are normalized so the interface stays stable as the status model evolves.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Runtime | React 19 |
| Package manager | Bun |
| Styling | Tailwind CSS, shadcn-compatible tokens |
| Data fetching | SWR |
| Icons | Lucide React |
| Storage | Vercel Blob |
| Auth | Signed HTTP-only cookies |
| Analytics | Vercel Analytics |

## Architecture

```text
app/
  page.tsx                 Public read-only dashboard
  admin/page.tsx           Auth-gated admin dashboard
  api/login/route.ts       Credential check and session cookie creation
  api/logout/route.ts      Session cleanup
  api/statuses/route.ts    Read/write payment data API

components/
  subscription-dashboard   Main application shell
  member-row               Member status and actions
  month-bar                Month selection and month management
  copy-export              Multi-month checklist export
  member-editor            Member create/edit dialog
  status-summary           Payment totals

lib/
  auth.ts                  Auth facade for routes and pages
  auth-token.ts            HMAC signed session token helpers
  members.ts               Member and status domain model
  month.ts                 Month key utilities
  statuses.ts              Vercel Blob persistence
```

## Getting Started

### Prerequisites

- Bun 1.3 or newer
- Node-compatible environment for Next.js
- Vercel Blob token for persistent storage

### Install

```bash
bun install
```

### Configure Environment

Create `.env.local` from the example file:

```bash
cp .env.example .env.local
```

Fill in:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
SESSION_SECRET=replace-with-a-long-random-secret
BLOB_READ_WRITE_TOKEN=vercel-blob-token
```

`SESSION_SECRET` should be a long random value. It is used to sign admin session cookies.

### Run Locally

```bash
bun run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

## Scripts

```bash
bun run dev      # Start the development server
bun run build    # Create a production build
bun run start    # Start the production server
bun run lint     # Run the lint script when eslint is installed
```

Project-specific test:

```bash
bun test lib/auth-token.test.ts
```

Type check:

```bash
bunx tsc --noEmit
```

## API Overview

### `GET /api/statuses`

Returns payment data.

- Authenticated admins receive the full member list, including optional phone fields.
- Public users receive the same payment structure without phone numbers.

### `PUT /api/statuses`

Persists the complete payment dataset.

- Requires admin authentication.
- Sanitizes members.
- Sanitizes month keys.
- Allows only valid payment statuses.

### `POST /api/login`

Validates admin credentials and creates a signed session cookie.

### `POST /api/logout`

Clears the admin session cookie.

## Data Model

```ts
type PaymentStatus = "pago" | "nao-pago"

type Member = {
  id: string
  name: string
  phone?: string
}

type AppData = {
  members: Member[]
  months: Record<string, Record<string, PaymentStatus>>
}
```

Month keys use the `YYYY-MM` format.

## Security Notes

- Admin credentials are environment variables.
- Session cookies are HTTP-only.
- Sessions are signed with HMAC.
- Login attempts are rate limited in memory.
- Public data strips phone numbers.
- `.env`, `.env.local`, build artifacts, logs, and cache files are ignored by git.

## Deployment

The app is designed for Vercel:

1. Create a Vercel Blob store.
2. Add the required environment variables.
3. Deploy the Next.js application.
4. Visit `/admin` and sign in with the configured credentials.

Because data lives in Vercel Blob, the dashboard can be redeployed without losing the payment ledger.

## Operational Workflow

1. Admin creates or selects the month.
2. Admin adds members or updates the roster.
3. Admin marks each member as paid or unpaid.
4. Public users view the current state without editing rights.
5. Admin copies one or more months as a formatted checklist for external communication.

## Repository Hygiene

The repository intentionally excludes:

- local environment files;
- framework build output;
- dependency folders;
- logs;
- TypeScript incremental cache files;
- local tool caches.

This keeps the public repository clean and avoids leaking secrets.

## License

No license has been assigned yet. Add one before using this repository as a reusable open-source package.
