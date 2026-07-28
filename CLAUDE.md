# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Hoppr is a remote-access credential manager: users store connection details and passwords for AnyDesk, RustDesk, and RDP endpoints, and launch them via protocol URIs (`anydesk://`, `rustdesk://`, RDP file/URI) instead of typing IDs/passwords by hand each time.

## Repo layout

Bun workspaces monorepo:

```
apps/
  web/     Vite + React 19 + Tailwind v4 + shadcn/ui + Phosphor icons (lucide is also present, pulled in by shadcn)
  server/  Bun + Hono API + Prisma 7 (Postgres, via @prisma/adapter-pg)
```

`apps/web` and `apps/server` are independent packages (each with its own `package.json`); there is no shared package yet. Root `package.json` only has convenience scripts that shell out with `bun --cwd`.

## Commands

Run from the repo root unless noted.

```bash
# Postgres (local dev)
docker compose up -d

# Web app
bun run dev:web              # vite dev server (localhost:5173, proxies /api -> :3001)
bun run build:web            # tsc -b && vite build

# Server
bun run dev:server           # bun --watch, localhost:3001
cd apps/server && bun run start   # no watch

# Database (run from apps/server, or via root db:* scripts)
bun run db:generate           # prisma generate
bun run db:migrate            # prisma migrate dev
bun run db:studio             # prisma studio

# Lint / format (Biome, whole repo, run from root)
bunx biome check .
bunx biome check --write .

# shadcn components (run from apps/web)
bunx shadcn@latest add <component>
```

There is no test runner configured yet.

## Architecture notes

**Prisma 7 driver adapters are mandatory.** `PrismaClient` no longer connects on its own — it throws `PrismaClientInitializationError` unless constructed with an adapter. The pattern is in `apps/server/src/lib/prisma.ts`:

```ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

Don't revert to bare `new PrismaClient()`.

**Prisma client output is generated, not in `node_modules`.** The `generator client` block in `apps/server/prisma/schema.prisma` outputs to `apps/server/generated/prisma` (gitignored). Import it via relative path (`../../generated/prisma/client.ts`), not `@prisma/client`. Run `bun run db:generate` after any schema change before the app will type-check/run.

**Config loading:** `apps/server/prisma.config.ts` (not `schema.prisma`) is where the Prisma CLI reads `DATABASE_URL` from, via `dotenv/config`. The Hono server itself relies on Bun's automatic `.env` loading — no dotenv import needed there.

**Data model** (`apps/server/prisma/schema.prisma`): `User` has many `Connection`s. A `Connection` is one saved remote-access target — `type` (`ANYDESK` | `RUSTDESK` | `RDP`), `host`, optional `port`/`username`/`password`/`domain`/`notes`, plus `lastLaunchedAt`. This is the shape to extend when adding per-protocol fields or launch-URI generation.

**API routes** live under `apps/server/src/routes/` and are mounted with `app.route(...)` in `apps/server/src/index.ts`, all under the `/api` base path. Follow the existing `connections.ts` pattern (plain Hono handlers calling `prisma` directly, no service layer yet) for new resources.

**Path alias:** `@/*` → `apps/web/src/*`, defined in `apps/web/tsconfig.app.json` (not the root `tsconfig.json`, which is reference-only) and mirrored in `apps/web/vite.config.ts`. Add aliases in both places if you change this.

**shadcn config:** `apps/web/components.json` uses style `base-nova`, `baseColor: neutral`, icon library `lucide`. Generated components land in `apps/web/src/components/ui/` — treat that directory as vendored (Biome lint is excluded there via `biome.json`'s `files.includes`); customize by wrapping/composing rather than hand-editing generated files where possible.

**Icons:** both `lucide-react` (shadcn's default, used internally by generated components) and `@phosphor-icons/react` are installed in `apps/web`. Use Phosphor for app-authored icons; leave lucide alone since shadcn-generated components depend on it.

**Linting/formatting:** Biome is configured once at the repo root (`biome.json`), covering both apps — there is no per-package Biome config. `apps/web/src/components/ui/**` and `apps/web/public/**` are excluded from linting (generated/vendored assets).

**Local Postgres:** `docker-compose.yml` at the root runs Postgres 17 with credentials `hoppr`/`hoppr`/`hoppr`, matching `apps/server/.env`'s `DATABASE_URL`. No migrations have been run against a live database yet in this environment — verify `bun run db:migrate` succeeds before assuming the schema is applied.
