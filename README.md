# BRÄVE Studio

Content-planning platform for beauty salons (Instagram reels, carousels, stories,
hook bank, AI assistant). Organized as a **monorepo** with a clean client/server split.

```
.
├── client/   → Next.js 16 frontend (UI). Calls the backend via /api/* (proxied).
└── server/   → Express + TypeScript + Prisma backend (AI, ASR, persistence, REST API).
```

## Architecture

- **client/** — React/Next.js app (Tailwind + shadcn/ui, Zustand state). It does not
  contain any backend logic; all `/api/*` requests are proxied to the server via
  Next.js rewrites (`client/next.config.ts`, `API_PROXY_URL`).
- **server/** — Modular Express API:
  - `src/modules/ai` — LLM content generation (`POST /api/ai`)
  - `src/modules/asr` — speech-to-text (`POST /api/asr`)
  - `src/modules/workspace` — server-backed persistence of the client state
    (`GET/PUT/DELETE /api/workspace`), stored in SQLite via Prisma
  - `src/modules/{brand-profile,content-item,content-plan}` — REST CRUD resources
  - `src/lib`, `src/middlewares`, `src/config`, `src/routes` — shared infrastructure

Application data lives in the server's SQLite database (`server/prisma/custom.db`)
through Prisma — the client no longer persists to browser localStorage.

## Getting started

`client/` and `server/` are independent npm projects — each has its own
`node_modules`. There is no root package — run commands inside each folder,
in two terminals.

### 1. Backend (terminal 1)

```bash
cd server
npm install          # first time only
npm run db:generate  # first time only — generate Prisma client
npm run db:push      # first time only — create the SQLite schema
npm run dev          # starts the API on http://localhost:4000
```

### 2. Frontend (terminal 2)

```bash
cd client
npm install          # first time only
npm run dev          # starts the app on http://localhost:3000
```

Open http://localhost:3000 (the frontend proxies `/api/*` to the backend).

### Scripts

**server/**

| Script               | Description                               |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Express dev server (tsx watch, :4000)     |
| `npm run build`      | Prisma generate + compile TypeScript      |
| `npm run start`      | Run compiled server (`dist/`)             |
| `npm run db:push`    | Sync Prisma schema to SQLite              |
| `npm run db:studio`  | Open Prisma Studio                        |

**client/**

| Script          | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Next.js dev server (:3000)        |
| `npm run build` | Production build                  |
| `npm run start` | Run production build (:3000)      |

## Environment

`server/.env`:

```
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
DATABASE_URL="file:./custom.db"
```

The client reads `API_PROXY_URL` (defaults to `http://localhost:4000`) to know
where to proxy `/api/*` requests.
