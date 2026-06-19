# PromptFlow

Workflow engine otomasi prompt animasi AI — Next.js 15 App Router + TypeScript strict.

## Source of truth

Seluruh keputusan produk, arsitektur, dan aturan coding ada di `product-docs/`:

- `AGENTS.md` — panduan operasional buat LLM/agent eksekutor
- `PRD.md` — product requirements
- `SRS.md` — software requirements
- `DATABASE_SCHEMA.md` — Drizzle schema source
- `PROJECT_ARCHITECTURE.md` — arsitektur sistem
- `UIUX_SPEC.md` — design system (tokens, components, flows)
- `API_CONTRACT.md` — kontrak `/api/v1/*`
- `CODING_RULES.md` — standar code (TS strict, lint, naming)
- `TEST_PLAN.md` — strategi pengujian
- `REVIEW_REPORT.md` — review lintas dokumen

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui · Drizzle ORM · Turso/libSQL · NextAuth v5 · Vercel AI SDK v6 · Zod · next-intl · Vitest · Playwright.

## Setup (Fase 0)

```bash
pnpm install
cp .env.example .env.local
# isi TURSO_*, ENCRYPTION_KEY, NEXTAUTH_SECRET
pnpm db:generate
pnpm dev
```

## Scripts

| Script | Fungsi |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm test:e2e` | Playwright |
| `pnpm db:generate` | Drizzle schema → SQL migration |
| `pnpm db:push` | Push schema ke Turso |

## Struktur

```
src/
  app/          # App Router routes
    [locale]/   # i18n segment (id | en)
  components/   # shadcn/ui + app components
  lib/          # db, ai, crypto, storage, i18n, utils
messages/       # id.json, en.json
product-docs/   # SOURCE OF TRUTH (jangan disentuh dari app code)
```
