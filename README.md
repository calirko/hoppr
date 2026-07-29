# Hoppr

Hoppr is a remote-access credential manager. Store connection details and passwords for AnyDesk, RustDesk, and RDP endpoints, then launch them via protocol URIs instead of typing IDs/passwords by hand each time.

## Stack

Bun workspaces monorepo:

- `apps/web` — Vite + React 19 + Tailwind v4 + shadcn/ui
- `apps/server` — Bun + Hono API + Prisma 7 (Postgres)

## Getting started

```bash
docker compose up -d          # local Postgres
bun install

cd apps/server
cp .env.example .env          # fill in DATABASE_URL / JWT_SECRET
bun run db:migrate

cd ..
bun run dev:server            # http://localhost:3001
bun run dev:web               # http://localhost:5173
```

## Production

```bash
cp .env.example .env          # set POSTGRES_PASSWORD and JWT_SECRET
docker compose up -d --build
```

See `CLAUDE.md` for detailed architecture notes.
