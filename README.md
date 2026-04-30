# operantkit-frontend

:jp: [日本語版 README](README.ja.md)

## Overview

Web frontend for OperantKit. Provides an experimenter dashboard and an
educational simulator UI. Includes session-data visualisation, experiment
configuration editing, and user management pages.

**Status**: Initial port from `apps-v0/operantkit-frontend`; Next.js 16,
React 19, Tailwind v4.

## Main screens

- `/` — Dashboard (recent sessions, summary statistics)
- `/login`, `/register` — Authentication
- `/profile` — User profile
- `/settings` — Experiment parameter configuration (FR / VR / FI / VI
  schedule selection, etc.)
- `/data` — Session-data visualisation (cumulative records and response-rate
  charts via Recharts)

## API routes

- `GET/POST /api/data` — Session data
- `GET/POST /api/settings` — Experiment configuration

Currently returns mock endpoints hosted inside Next.js. Wiring to the
Python backends (behavior-scope etc.) is future work.

## Setup

The runtime is pinned via [mise](https://mise.jdx.dev). The Node.js
version is declared in `.mise.toml` (Node 24 LTS).

```bash
# 1. Install Node
mise install

# 2. Install dependencies (reproducible from package-lock.json)
mise exec -- npm ci
```

## Development

```bash
# Dev server (http://localhost:3000)
mise exec -- npm run dev

# Production build
mise exec -- npm run build

# Lint
mise exec -- npm run lint

# Type-check
mise exec -- npx tsc --noEmit

# E2E tests (requires Playwright browsers: mise exec -- npx playwright install chromium)
mise exec -- npm test
```

## Dependencies

Key dependencies (see `package.json`):

- `next` ^16.2 — React framework (App Router)
- `react`, `react-dom` ^19 — UI library
- `recharts` ^3 — Charts
- `swr` ^2 — Client-side data fetching / caching
- `tailwindcss` ^4, `@tailwindcss/postcss` ^4 — Styling
- `typescript` ^5 — Type-checking
- `@playwright/test` ^1 — E2E tests

## Notes

- Runtime is managed by `mise`. Do not use `nvm` / `nodenv` / `asdf`.
- `npm` is the only supported package manager (commit `package-lock.json`
  for reproducibility). `pnpm` / `yarn` / `bun` must not be used.
- Do not use direnv layouts such as `layout node` (keep `.envrc`
  defensive and minimal).
- `node_modules/` / `.next/` / `playwright-report/` / `test-results/`
  are gitignored.
