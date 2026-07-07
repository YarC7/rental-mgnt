# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — start dev server (localhost:3000)
- `pnpm build` / `pnpm start` — production build and serve
- `pnpm lint` — ESLint (next/core-web-vitals + typescript)
- `pnpm db:generate` — generate Drizzle migration files
- `pnpm db:push` — push schema changes directly to DB
- `pnpm db:studio` — open Drizzle Studio
- `pnpm db:seed` — seed database

No test framework is configured.

## Architecture

**ZenBoard** — Vietnamese-language hostel/boarding-house management system. Multi-hostel: the first URL segment (`/A/rooms`, `/B/rooms`) selects the active hostel.

### Next.js 16 (App Router) — READ `node_modules/next/dist/docs/` FIRST

This version has breaking APIs. Always check the docs in `node_modules/next/dist/docs/` before writing Next.js code. Notably, route handler params is now async: `const { id } = await params` (not `params.id`).

### Data Flow

```
Browser → HostelContext (React Query) → /api/* routes → Drizzle ORM → PostgreSQL
```

- **Database**: PostgreSQL via `postgres` driver + Drizzle ORM. Schema at `db/schema.ts`, connection at `db/index.ts` (singleton pattern for dev hot-reload).
- **API routes**: REST under `app/api/`. Pattern: `route.ts` for collection, `[id]/route.ts` for individual resource. All use `db` from `@/db`.
- **State management**: Single React Context (`context/HostelContext.tsx`) wraps the entire app. Provides CRUD methods for all entities. Uses TanStack React Query for fetching + cache invalidation after mutations.
- **Room status** is enriched client-side: `HostelContext` joins rooms + tenants to derive `status` ("empty"/"rented"/"maintenance") and `tenantName`.

### Domain Model

Five tables, all scoped to a hostel (`hostel_id` foreign key):
- `hostels` — multi-tenancy root
- `rooms` — with status enum, indexed by hostel
- `tenants` — linked to room via `room_id`, includes Vietnamese ID card fields (CCCD)
- `services` — utility pricing (electricity, water, etc.), toggled active/inactive
- `invoices` — monthly billing with room cost + utility costs, stores snapshot of room number + tenant name

### UI Stack

- **shadcn/ui** (radix-vega style) — components in `components/ui/`. Config: `components.json`.
- **Tailwind CSS 4** — `@tailwindcss/postcss`.
- **Lucide icons**.
- **Layout**: collapsible sidebar (`components/Sidebar.tsx`) wraps all pages via `(main)/` route group. Root `/` redirects to `/A/rooms`.

### Key Files

- `context/HostelContext.tsx` — single source of truth for all data access + mutations
- `db/schema.ts` — all Drizzle table definitions
- `app/api/*/route.ts` — REST endpoints (GET collection, POST create, PATCH update, DELETE)
- `components/Sidebar.tsx` — navigation + hostel switcher
