# Coding Rules & Standards — PromptFlow V2

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `product-docs/RAG-CONTEXT.md` + `product-docs/SRS.md V2.0` + `product-docs/DATABASE_SCHEMA.md V2.0` + `product-docs/PROJECT_ARCHITECTURE.md V2.0` + `product-docs/API_CONTRACT.md V2.0` + `product-docs/UIUX_SPEC.md V2.0`
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **GitHub:** `https://github.com/agrianwahab29/promptflow.git`
> **Catatan:** V2 OVERWRITE V1. Pertahankan SEMUA rules V1 (L01-L30 + semua section). Update stack: AI SDK v4 (ground truth `package.json:25`). Tambah rules V2: upload flow, AI classification, story description, real-time logs, dashboard, navigation, loading/error states, GitHub, extended role classification (6 opsi), V2 security, V2 prohibitions (L31-L38).

---

## Daftar Isi

1. Pendahuluan & Prinsip Dasar
2. Konvensi Penamaan
3. Struktur Kode per Layer
4. Standar per Bahasa/Framework
5. Error Handling & Logging
6. Keamanan Koding
7. Testing
8. Git Workflow & Commit
9. Linting & Formatting
10. PR Review Checklist (Definition of Done Koding)
11. CI/CD
12. Standar Frontend (Design Tokens & A11y)
13. Larangan Umum
14. Asumsi Coding + Referensi

---

## 1. Pendahuluan & Prinsip Dasar

### 1.1 Tujuan

Aturan koding konkret & spesifik untuk stack PromptFlow supaya agent
eksekutor menulis kode konsisten, type-safe, aman, dan mudah dirawat. Bukan
generik — tiap aturan tertelusur ke stack proyek. Sitasi: `SRS.md V2.0 1.1`.

### 1.2 Stack Berlaku (V2 — GROUND TRUTH dari package.json)

| Lapisan | Teknologi | Versi (package.json) | Bukti |
|---|---|---|---|
| Frontend + Backend | Next.js (App Router) | ^15.1.0 | `package.json:22` |
| Bahasa | TypeScript (strict) | ^5.7.0 | `package.json:60` |
| Styling | Tailwind CSS v4 | ^4.0.0 | `package.json:70` |
| Komponen UI | shadcn/ui | latest stabil | `RAG-CONTEXT.md 2.1` |
| AI SDK | ai (Vercel AI SDK) | **^4.0.0** (CATATAN: docs sebut v6, kode = v4) | `package.json:25` |
| AI Provider | @ai-sdk/openai-compatible | ^1.0.0 | `package.json:26` |
| Validasi | Zod | ^3.24.0 | `package.json:27` |
| Auth | next-auth | 5.0.0-beta.25 | `package.json:28` |
| Auth Core | @auth/core | ^0.37.0 | `package.json:29` |
| Password Hash | bcryptjs | ^2.4.3 | `package.json:30` |
| DB Client | @libsql/client | ^0.14.0 | `package.json:31` |
| ORM | drizzle-orm | ^0.38.0 | `package.json:32` |
| ORM Kit | drizzle-kit | ^0.30.0 | `package.json:33` |
| Storage | @vercel/blob | ^0.27.0 | `package.json:34` |
| i18n | next-intl | ^3.26.0 | `package.json:35` |
| Icons | lucide-react | ^0.468.0 | `package.json:36` |
| Form | react-hook-form | ^7.54.0 | `package.json:37` |
| Form Resolvers | @hookform/resolvers | ^3.10.0 | `package.json:38` |
| Toast | sonner | ^1.7.0 | `package.json:39` |
| UI Primitives | Radix UI (14 paket) | ^1.1.0–^1.2.0 | `package.json:44-57` |
| UI Helpers | clsx + tailwind-merge + cva | ^2.1.1 / ^2.5.0 / ^0.7.1 | `package.json:41-43` |
| DB Engine | Turso (libSQL via HTTP) | latest | `drizzle.config.ts:12` |
| Test Unit | vitest | ^2.1.0 | `package.json:74` |
| Test Coverage | @vitest/coverage-v8 | ^2.1.0 | `package.json:75` |
| Test E2E | @playwright/test | ^1.49.0 | `package.json:77` |
| Lint | eslint + eslint-config-next | ^9.17.0 / ^15.1.0 | `package.json:65-66` |
| TS ESLint | @typescript-eslint/* | ^8.18.0 | `package.json:67-68` |
| Format | prettier + prettier-plugin-tailwindcss | ^3.4.0 / ^0.6.0 | `package.json:78-79` |
| Package Manager | pnpm | 11.7.0 | `package.json:81` |
| Runtime | Node.js (server-only) | N/A | `package.json:14` |
| V2 Baru | Recharts atau Tremor | latest stabil | Dashboard charts |

> **KETIDAKSESUAIAN VERSI:** Product docs V1 menyebut AI SDK v6 tapi package.json catatan `ai: ^4.0.0`. **Kode = ground truth.** V2 pakai v4. Tidak upgrade ke v6 = out of scope V2 (`SRS.md V2.0 3.3 OOS-V2-3`).

### 1.3 Prinsip Inti

1. **Type-safe by default** — TypeScript strict, no `any`, validasi input via Zod di boundary. Sitasi: `SRS.md V2.0 8.7`.
2. **Secure by default** — server-only boundary, API key encrypt at rest, no secret di client, ownership RBAC. Sitasi: `PROJECT_ARCHITECTURE.md V2.0 1.3, 10`.
3. **Clean code** — DRY, KISS, SOLID seperlunya, file kecil fokus, fungsi pendek (<60 baris), immutability default.
4. **Structured output first** — `generateObject` + Zod `PromptPackageSchema`. Fallback `streamText` + parse manual. Sitasi: `SRS.md V2.0 4.2 #2, 8.7`.
5. **Streaming anti-timeout** — SSE token < 10s. V2 extend `log` event type. Sitasi: `SRS.md V2.0 6.5 FR-V2-05`.
6. **Repository pattern** — akses DB lewat `lib/db/repositories/*.repo.ts`. Sitasi: `PROJECT_ARCHITECTURE.md V2.0 4.2, 5`.
7. **Design tokens WAJIB** — frontend pakai token dari `UIUX_SPEC.md V2.0 2`. Sitasi: `UIUX_SPEC.md V2.0 2.10`.
8. **Aksesibilitas WAJIB** — WCAG 2.1 AA. Sitasi: `UIUX_SPEC.md V2.0 9`.
9. **V2: Vision is separate concern** — Vision LLM call di `lib/ai/image-classifier.ts`. Direct HTTP + Zod parse. BUKAN AI SDK structured output. Server-only. Sitasi: `SRS.md V2.0 6.2 FR-V2-02`.
10. **V2: Pagination as first-class** — list endpoint WAJIB support `?page=&limit=`. Response `{data[], pagination{page, limit, total, totalPages}}`. Sitasi: `SRS.md V2.0 6.9 FR-V2-09`.
11. **V2: Log buffer in-memory** — real-time logs buffer di memory selama SSE. Persist ke `generation_logs.logs_json` saat `done`. Sitasi: `SRS.md V2.0 6.5 FR-V2-05`.

---

## 2. Konvensi Penamaan

### 2.1 Tabel Penamaan

| Tipe | Konvensi | Contoh | Bukti |
|---|---|---|---|
| File route handler | `route.ts` (wajib nama) | `src/app/api/v1/projects/route.ts` | `PROJECT_ARCHITECTURE.md V2.0 5` |
| Folder route (segment) | kebab-case atau `[param]` | `api/v1/projects/[id]/route.ts` | `PROJECT_ARCHITECTURE.md V2.0 5` |
| V2: Folder route baru | `api/v1/upload/classify/route.ts` | Classification endpoint | `SRS.md V2.0 8.3` |
| V2: Folder route baru | `api/v1/dashboard/route.ts` | Dashboard enrichment | `SRS.md V2.0 8.2` |
| Folder komponen domain | kebab-case | `components/generate/`, `components/dashboard/` | `UIUX_SPEC.md V2.0 3.3` |
| File komponen React (custom) | kebab-case | `prompt-card.tsx`, `log-viewer.tsx` | `UIUX_SPEC.md V2.0 3.2` |
| File komponen shadcn/ui | lowercase | `button.tsx`, `switch.tsx`, `collapsible.tsx` | `UIUX_SPEC.md V2.0 3.1` |
| File lib (modul) | kebab-case | `provider-registry.ts`, `image-classifier.ts` | `PROJECT_ARCHITECTURE.md V2.0 5` |
| File repo DB | kebab-case + `.repo.ts` | `project.repo.ts`, `dashboard.repo.ts` | `PROJECT_ARCHITECTURE.md V2.0 5` |
| V2: File repo baru | `dashboard.repo.ts` | Enrichment queries | `SRS.md V2.0 6.6 FR-V2-06` |
| File prompt template | `<komponen>.system.ts` | `scenes.system.ts` | `PROJECT_ARCHITECTURE.md V2.0 5` |
| File schema Drizzle | `schema.ts` (single source) | `src/lib/db/schema.ts` | `DATABASE_SCHEMA.md V2.0 8.1` |
| File Zod schema | `schemas.ts` (single source) | `src/lib/validation/schemas.ts` | `SRS.md V2.0 3.4, 8.7` |
| File i18n messages | `<locale>.json` | `messages/id.json`, `messages/en.json` | `PROJECT_ARCHITECTURE.md V2.0 5` |
| Class komponen React | PascalCase | `LogViewer`, `ClassificationResult`, `MetricCard` | `UIUX_SPEC.md V2.0 3.1, 3.2` |
| Function | camelCase | `classifyImage()`, `buildProvider()` | `PROJECT_ARCHITECTURE.md V2.0 7.1` |
| Variabel | camelCase | `providerConfig`, `aiClassification` | `API_CONTRACT.md V2.0 3.1` |
| Konstanta | UPPER_SNAKE_CASE | `PROVIDER_PRESETS`, `MAX_CHARACTERS_PER_PROJECT` | ASUMSI (best practice) |
| Enum value (DB) | lowercase string | `tokoh`, `background`, `prop`, `accessory`, `environment`, `other` | `DATABASE_SCHEMA.md V2.0 4` |
| V2: Tipe enum extended | 6 opsi | `tokoh`, `background`, `prop`, `accessory`, `environment`, `other` | `SRS.md V2.0 6.3 FR-V2-03` |
| Tabel DB | snake_case jamak | `users`, `provider_configs`, `projects` | `DATABASE_SCHEMA.md V2.0 4` |
| Kolom DB | snake_case | `user_id`, `ai_classification`, `story_description`, `logs_json` | `DATABASE_SCHEMA.md V2.0 4` |
| V2: Kolom baru DB | snake_case nullable | `story_description` (projects), `ai_classification` (asset_references), `logs_json` (generation_logs) | `DATABASE_SCHEMA.md V2.0 7.2` |
| Properti Drizzle (TS) | camelCase (mapping kolom snake) | `userId`, `aiClassification`, `storyDescription`, `logsJson` | `DATABASE_SCHEMA.md V2.0 8.3` |
| Field JSON API (req/res) | camelCase | `aiClassification`, `storyDescription`, `logsJson` | `API_CONTRACT.md V2.0 3.1` |
| Field PromptPackageSchema | snake_case native | `character_profiles`, `voiceover_script`, `moral_message` | `API_CONTRACT.md V2.0 3.1` ; `PRD.md V2.0 8.2` |
| Env var | UPPER_SNAKE_CASE | `TURSO_DATABASE_URL`, `VISION_LLM_API_KEY` | `DATABASE_SCHEMA.md V2.0 12.3` |
| V2: Env var baru | UPPER_SNAKE_CASE | `VISION_LLM_PROVIDER`, `VISION_LLM_API_KEY`, `VISION_LLM_MODEL`, `VISION_LLM_BASE_URL` | `PROJECT_ARCHITECTURE.md V2.0 9.1` |
| i18n message key | namespaced dotted | `generate.role.tokoh`, `dashboard.metric.totalProjects` | `UIUX_SPEC.md V2.0 1.4` |
| Branch git | `feature/<scope>`, `fix/<scope>` | `feature/v2-upload`, `feat/v2-classification` | `SRS.md V2.0 6.10` |
| Commit message | conventional commit | `feat(generate): add story description field` | §8 dokumen ini |
| Custom hook React | `use<Thing>` | `useGenerateStream`, `useClassification` | ASUMSI |
| Test file | co-located `*.test.ts` | `image-classifier.test.ts`, `log-buffer.test.ts` | `SRS.md V2.0 11.1` |
| E2E test file | `e2e/<flow>.spec.ts` | `e2e/upload-classify-generate.spec.ts` | ASUMSI |

### 2.2 Catatan

- **DB vs TS vs JSON mapping wajib eksplisit.** Drizzle schema: kolom snake_case + properti TS camelCase. Repository layer mapping ke DTO JSON camelCase. `PromptPackageSchema` field snake_case native. Sitasi: `DATABASE_SCHEMA.md V2.0 8.3` ; `API_CONTRACT.md V2.0 3.1`.
- **TIDAK ada singkatan ambigu.** `usr` → `user`, `cfg` → `config`. Pengecualian: `id`, `url`, `api`, `db`, `ui`.
- **Nama file = nama default export.** `log-viewer.tsx` → `LogViewer`. `classification-result.tsx` → `ClassificationResult`.

---

## 3. Struktur Kode per Layer

### 3.1 Struktur Folder Inti (V2)

Ikut `PROJECT_ARCHITECTURE.md V2.0 5`:

```text
PromptFlow/
  product-docs/
  drizzle/
  messages/ (id.json, en.json)
  public/references/ (dev-only)
  src/
    app/
      api/v1/
        auth/[...nextauth]/route.ts
        projects/route.ts              # V2: +pagination
        projects/[id]/route.ts
        generate/route.ts              # V2: +log SSE + storyDescription
        upload/route.ts                # V2: 6-tipe + aiClassification
        upload/classify/route.ts       # V2 BARU
        dashboard/stats/route.ts         # V2 BARU: /api/v1/dashboard/stats
        settings/providers/route.ts
        settings/providers/[id]/route.ts
        settings/providers/[id]/test/route.ts
        projects/[id]/export/route.ts
        projects/[id]/characters/route.ts
        projects/[id]/scenes/route.ts
        projects/[id]/image-prompts/route.ts
        projects/[id]/logs/route.ts
        health/route.ts
      [locale]/
        layout.tsx
        (dashboard)/
          loading.tsx, error.tsx
          generate/loading.tsx, page.tsx
          projects/loading.tsx, page.tsx
          projects/[id]/loading.tsx, page.tsx
          dashboard/loading.tsx, page.tsx
          settings/loading.tsx, page.tsx
        (auth)/login/page.tsx, register/page.tsx
      layout.tsx, page.tsx, globals.css
    components/
      ui/ (18 shadcn components V2)
      common/ (Pagination V2, PageLoadingSkeleton V2, PageErrorBoundary V2)
      generate/ (LogViewer V2, ClassificationResult V2, AssetPreviewList V2, RoleBadge V2, ConfidenceBar V2, StoryDescriptionTextarea V2)
      dashboard/ (MetricCard, WeeklyTrendChart, SuccessFailBarChart, PerProviderBreakdownTable, RecentActivityTable, StorageUsageCard)
      projects/ (ProjectsPagination V2)
      settings/
    lib/
      ai/ (image-classifier.ts V2, log-buffer.ts V2, + V1 files)
      db/ (schema.ts +3 cols, repositories/ +dashboard.repo.ts V2)
      storage/blob.ts
      auth/ (config.ts, middleware.ts)
      crypto/aes.ts
      i18n/ (config.ts, request.ts)
      validation/schemas.ts (V2: 6-tipe + storyDescription)
      export/markdown.template.ts
    middleware.ts
  .env.local, .env.example, .gitignore (V2), README.md
```

Sitasi: `PROJECT_ARCHITECTURE.md V2.0 5`.

### 3.2 Aturan Import

**Urutan import (wajib konsisten):**

```ts
// 1. Server-only guard
import 'server-only';

// 2. External packages (npm)
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/libsql';

// 3. Internal alias (@/ = src/)
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';

// 4. Relative (hindari bila bisa)

// 5. Type-only import (terpisah)
import type { ProjectDTO } from '@/lib/validation/schemas';
```

**Aturan:**

| Aturan | Detail | Bukti |
|---|---|---|
| Alias `@/` wajib | `@/lib/...`, `@/components/...` = `src/`. | ASUMSI |
| `import 'server-only'` di lib server | `lib/ai/*`, `lib/crypto/*`, `lib/db/*`, `lib/storage/*`. **V2: termasuk `image-classifier.ts` dan `log-buffer.ts`.** | `SRS.md V2.0 10.1 SEC-03` |
| Type-only import | `import type { ... }` untuk tipe murni. | ASUMSI |

### 3.3 Export: Default vs Named

| Tipe file | Pola export | Contoh |
|---|---|---|
| Page (RSC) | `default export` wajib | `export default function GeneratePage()` |
| Route handler | named `GET`, `POST`, etc. | `export async function POST(req)` |
| Komponen custom | default export + named sub | `export default LogViewer` |
| Lib function | named export | `export function classifyImage()` |
| Schema Drizzle | named export | `export const projects = sqliteTable(...)` |
| Zod schema | named export | `export const PromptPackageSchema = z.object(...)` |
| Type | named export | `export type ProjectDTO = z.infer<...>` |

### 3.4 Layer Tanggung Jawab

| Layer | Tanggung jawab | Bukan tanggung jawab |
|---|---|---|
| `app/(dashboard)/page.tsx` (RSC) | Data fetch via repo, render, metadata | Panggil LLM, decrypt, query raw Drizzle |
| `app/api/v1/*/route.ts` | Parse request, Zod, auth, delegasi ke lib | Business logic kompleks |
| Server Action | Mutation dari Client Component | Panggilan LLM langsung |
| `lib/ai/*` | Provider init, prompt build, LLM call, parse, consistency check, **V2: Vision classification, log buffer** | Render UI, query DB mentah |
| `lib/db/repositories/*` | CRUD + ownership filter + paginate + **V2: dashboard enrichment, classification update** | Business logic LLM |
| `lib/db/schema.ts` | Definisi tabel (single source) | Query |
| `lib/crypto/*` | Encrypt/decrypt/mask (server-only) | Akses DB, LLM |
| `lib/validation/schemas.ts` | Zod schema (input + LLM output) | Parse LLM response |
| `components/ui/*` | shadcn/ui copy-paste | Business logic |
| `components/{generate,dashboard,projects,settings,common}/*` | Presentasi + interaksi client | Data fetch langsung |

Sitasi: `PROJECT_ARCHITECTURE.md V2.0 3.2, 4` ; `SRS.md V2.0 3.2`.

---

## 4. Standar per Bahasa/Framework

### 4.1 TypeScript (strict)

**`tsconfig.json` wajib:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

| Aturan | Detail | Bukti |
|---|---|---|
| `strict: true` wajib | Semua strict check aktif. | ASUMSI |
| `no any` | Hindari `any`. Pakai `unknown` + Zod narrow. Pengecualian: third-party tanpa type (komentar `// eslint-disable` + alasan). | ASUMSI |
| Explicit return type | Function publik wajib return type eksplisit. | ASUMSI |
| `interface` vs `type` | `interface` untuk object extendable. `type` untuk union/mapped. | ASUMSI |
| `as const` | Literal yang harus narrow pakai `as const`. | ASUMSI |
| Discriminated union | Untuk state/action bercabang. | ASUMSI |
| `z.infer` untuk DTO | Tipe DTO diderivasi dari Zod schema. | `API_CONTRACT.md V2.0 8` |
| Type dari Drizzle | `type Project = typeof projects.$inferSelect`. | `DATABASE_SCHEMA.md V2.0 8.3` |
| `readonly` untuk immutable | Props komponen `readonly`. | ASUMSI |
| `unknown` bukan `any` untuk parse | `JSON.parse`, `req.json()`, response LLM = `unknown` → Zod parse. | ASUMSI |

**DO:**

```ts
// DTO dari Zod
export type ProjectDTO = z.infer<typeof ProjectDTOSchema>;

// V2: ClassificationResult type dari Zod
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

// Discriminated union untuk SSE events
type GenerateEvent =
  | { type: 'stage'; stage: string; message: string }
  | { type: 'log'; level: 'info'|'warn'|'error'; message: string; timestamp: string }
  | { type: 'done'; result: PromptPackage; warnings: Warning[]; logs: LogEntry[] }
  | { type: 'error'; code: string; message: string };

// Parse eksternal via unknown + Zod
const raw: unknown = await req.json();
const parsed = GenerateInputSchema.parse(raw);
```

**DON'T:**

```ts
// ❌ any
function build(x: any): any { ... }

// ❌ implicit any
function handler(req) { ... }

// ❌ type duplikasi (harus infer dari Zod)
type ProjectDTO = { id: number; title: string; ... };
```

### 4.2 Next.js App Router

| Aturan | Detail | Bukti |
|---|---|---|
| Server Component default | Page/layout default RSC. Hanya `'use client'` bila butuh interaksi. | `SRS.md V2.0 3.2` |
| `'use client'` minimal | Hanya komponen interaktif (form, streaming, toggle). | `SRS.md V2.0 3.2` |
| Server Actions untuk mutation | Form submit dari Client Component pakai Server Action. | `SRS.md V2.0 3.2` |
| Route Handler untuk SSE/external | `/api/v1/generate` SSE, `/api/v1/upload` multipart, `/api/v1/upload/classify` (V2). | `API_CONTRACT.md V2.0 1.1, 6` |
| Dynamic params | `[id]` → `params: { id: string }`. Convert ke number. | `PROJECT_ARCHITECTURE.md V2.0 5` |
| `metadata` export | Setiap page wajib `export const metadata`. | ASUMSI |
| `error.tsx` | **V2: Wajib di route group `(dashboard)` + root.** Client Component, terima `error` + `reset`. | `SRS.md V2.0 6.7 FR-V2-07` |
| `loading.tsx` | **V2: Wajib di setiap page group: `/generate`, `/projects`, `/projects/[id]`, `/dashboard`, `/settings`.** | `SRS.md V2.0 6.7 FR-V2-07` |
| Suspense boundary | **V2: wajib di projects list, dashboard, generate.** | `SRS.md V2.0 6.9 FR-V2-09` |
| `export const dynamic = 'force-dynamic'` | Halaman yang baca session/cookie. | ASUMSI |

**DO:**

```tsx
// V2: loading.tsx
export default function DashboardLoading() {
  return <PageLoadingSkeleton variant="dashboard" />;
}

// V2: error.tsx
'use client';
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorBoundary error={error} onRetry={reset} />;
}
```

### 4.3 React

| Aturan | Detail | Bukti |
|---|---|---|
| Function component | Hanya function component. | ASUMSI |
| Hooks rules | Hook hanya di top-level. | ASUMSI |
| Custom hook prefix `use` | `useGenerateStream`, `useClassification`. | ASUMSI |
| `useMemo`/`useCallback` selektif | Hanya expensive. | ASUMSI |
| `key` stabil & unik | `key={item.id}`. | ASUMSI |
| Effect cleanup | `useEffect` subscribe/timer wajib cleanup. | ASUMSI |
| Composability | Komponen kecil + compose. Maks ~200 baris. | ASUMSI |

### 4.4 Tailwind CSS v4

| Aturan | Detail | Bukti |
|---|---|---|
| Utility-first | Susun style via class utility. | `UIUX_SPEC.md V2.0 2.10` |
| `@theme` tokens dari UIUX_SPEC | TIDAK hardcode hex. **V2: tambah token log + confidence.** | `UIUX_SPEC.md V2.0 2.1, 2.10` |
| Responsive mobile-first | Default mobile, `sm:` `md:` `lg:` `xl:`. | `UIUX_SPEC.md V2.0 2.7` |
| `cn()` utility | Merge class pakai `cn()`. | `UIUX_SPEC.md V2.0 3.1` |
| Spacing scale konsisten | `space-1` (4px)...`space-24` (96px). | `UIUX_SPEC.md V2.0 2.5` |
| Z-index/motion/radius token | Pakai token dari UIUX_SPEC. | `UIUX_SPEC.md V2.0 2.6, 2.8, 2.9` |

**DON'T:**

```tsx
// ❌ hardcode hex
<div className="bg-[#7c3aed] text-white">
// ❌ inline style statis
<div style={{ backgroundColor: '#7c3aed' }}>
// ❌ arbitrary spacing
<div className="p-[13px]">
```

### 4.5 shadcn/ui

| Aturan | Detail | Bukti |
|---|---|---|
| Copy-paste component | Edit hanya className tuning. | `RAG-CONTEXT.md V2.0 2.1` |
| Variants via `cva` | Definisikan di `cva`. | `UIUX_SPEC.md V2.0 3.1` |
| Form: react-hook-form + Zod resolver | `react-hook-form` + `@hookform/resolvers/zod`. | `UIUX_SPEC.md V2.0 3.1` |
| Toast: sonner | `sonner` wrapper. | `UIUX_SPEC.md V2.0 3.1` |
| Icon: Lucide React | Konsisten Lucide. | `UIUX_SPEC.md V2.0 8.1` |
| V2: Komponen baru | `Switch`, `Collapsible`, `ScrollArea`, `Progress`. | `UIUX_SPEC.md V2.0 3.1` |

### 4.6 Drizzle ORM

| Aturan | Detail | Bukti |
|---|---|---|
| `schema.ts` single source | **V2: 9 tabel + 3 kolom nullable baru.** | `DATABASE_SCHEMA.md V2.0 8.1` |
| Repository pattern | Akses DB lewat `lib/db/repositories/*.repo.ts`. | `PROJECT_ARCHITECTURE.md V2.0 4.2` |
| Transaction | Multi-tabel pakai `db.transaction()`. | ASUMSI |
| Migration via `drizzle-kit` | `drizzle-kit generate` → `drizzle/`. | `DATABASE_SCHEMA.md V2.0 8.4` |
| Type inference | `typeof projects.$inferSelect`. Jangan duplikasi. | `DATABASE_SCHEMA.md V2.0 8.3` |
| Ownership filter wajib | WAJIB filter `user_id`. | `SRS.md V2.0 10.1 SEC-07` |
| Soft delete filter | WAJIB `WHERE deleted_at IS NULL`. | `DATABASE_SCHEMA.md V2.0 10.1` |
| Tipe SQLite | `integer`, `text`, `real`, `blob`. Timestamp = `integer` unix epoch. | `DATABASE_SCHEMA.md V2.0 1.3` |
| Kolom snake_case + properti TS camelCase | Mapping eksplisit. | `DATABASE_SCHEMA.md V2.0 8.3` |
| Index eksplisit | 17 indexes dari DATABASE_SCHEMA §6. | `DATABASE_SCHEMA.md V2.0 6` |
| FK + cascade | `references(() => users.id, { onDelete: 'cascade' })`. | `DATABASE_SCHEMA.md V2.0 3.1` |
| V2: Kolom nullable additive | `story_description`, `ai_classification`, `logs_json`. | `DATABASE_SCHEMA.md V2.0 7.2` |
| V2: Pagination helper | `paginate({userId, page, limit})` di project.repo.ts. | `SRS.md V2.0 6.9 FR-V2-09` |

### 4.7 Vercel AI SDK v4 (GROUND TRUTH)

| Aturan | Detail | Bukti |
|---|---|---|
| `createOpenAICompatible` | Init via `createOpenAICompatible({ name, apiKey, baseURL, headers })`. | `RAG-CONTEXT.md V2.0 5.1` |
| `generateObject` + Zod default | `generateObject({ model, schema, system, messages })`. | `SRS.md V2.0 4.2 #2, 8.7` |
| Fallback `streamText` + parse | Provider tidak dukung structured output → parse manual. | `SRS.md V2.0 4.2 #2` |
| V2: Inject storyDescription | `buildUserMessage()` inject `storyDescription`. | `SRS.md V2.0 6.4 FR-V2-04` |
| V2: Inject 6-tipe refs | Format: `hero-ref.png (tokoh), meja.jpg (prop)`. | `SRS.md V2.0 6.3 FR-V2-03` |
| Server-only | `lib/ai/*` wajib `import 'server-only'`. | `SRS.md V2.0 10.1 SEC-03` |
| Decrypt key server-side | Plaintext in-memory only. | `SRS.md V2.0 10.1 SEC-03` |
| Retry 2x backoff (dari kode) | `llm-client.ts:14` | `RAG-CONTEXT.md 5.2` |
| V2: Vision LLM = direct HTTP | `lib/ai/image-classifier.ts`. BUKAN AI SDK. Zod parse. | `SRS.md V2.0 6.2 FR-V2-02` |

### 4.8 Zod

| Aturan | Detail | Bukti |
|---|---|---|
| Zod sebagai source of truth | Schema di `lib/validation/schemas.ts`. Tipe via `z.infer`. | `SRS.md V2.0 8.7` |
| Parse input di boundary | `req.json()` → `unknown` → `Schema.safeParse(raw)`. | `SRS.md V2.0 5` |
| V2: ClassificationResultSchema | `{role: enum[6], name, description, confidence}`. | `SRS.md V2.0 6.2` |
| V2: GenerateInputSchema extended | +`storyDescription`, +`references[].aiClassification`. | `API_CONTRACT.md V2.0 8.2` |
| V2: 6-tipe enum | `z.enum(['tokoh','background','prop','accessory','environment','other'])`. | `SRS.md V2.0 6.3 FR-V2-03` |

### 4.9 NextAuth.js

| Aturan | Detail | Bukti |
|---|---|---|
| Config di `lib/auth/config.ts` | Providers, callbacks, session strategy. | `PROJECT_ARCHITECTURE.md V2.0 5` |
| Credentials provider | Fase awal credentials. | ASUMSI SRS-A1 |
| Session JWT cookie | `session: { strategy: 'jwt' }`. | ASUMSI |
| `NEXTAUTH_SECRET` env wajib | Secret untuk JWT. | `SRS.md V2.0 10.1 SEC-12` |
| Middleware protected routes | Protected: `/projects`, `/settings`, `/generate`, `/dashboard`, `/api/v1/*` (kecuali auth/health). | `SRS.md V2.0 10.1 SEC-11` |
| Password hash | `bcryptjs` hash sebelum save. | `DATABASE_SCHEMA.md V2.0 9.3` |

### 4.10 next-intl

| Aturan | Detail | Bukti |
|---|---|---|
| Message key namespaced | `common.*`, `generate.*`, `dashboard.*`, `error.*`. | `UIUX_SPEC.md V2.0 1.4` |
| `messages/id.json`, `messages/en.json` | Bundel per locale. | `PROJECT_ARCHITECTURE.md V2.0 5` |
| `getTranslations` server | RSC + route handler. | ASUMSI |
| `useTranslations` client | Client Component. | ASUMSI |
| Default locale | `id` default, `en` toggle. | `UIUX_SPEC.md V2.0 1.3` |

---

## 5. Error Handling & Logging

### 5.1 Error Envelope (API)

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} },
  "traceId": "req_abc123"
}
```

Sitasi: `API_CONTRACT.md V2.0 3.3, 9.1`.

| Code | HTTP | Kapan | V1/V2 | Bukti |
|---|---|---|---|---|
| `VALIDATION_ERROR` | 400/422 | Zod fail / business validation | V1 | `API_CONTRACT.md V2.0 9.2` |
| `UNAUTHORIZED` | 401 | No session | V1 | `API_CONTRACT.md V2.0 9.2` |
| `FORBIDDEN` | 403 | Ownership fail | V1 | `SRS.md V2.0 10.1 SEC-07` |
| `NOT_FOUND` | 404 | Resource tidak ada | V1 | `API_CONTRACT.md V2.0 9.2` |
| `CONFLICT` | 409 | Unique constraint | V1 | `DATABASE_SCHEMA.md V2.0 4.2` |
| `RATE_LIMITED` | 429 | Rate limit terlampaui | V1 | `SRS.md V2.0 12` |
| `PROVIDER_ERROR` | 502 | LLM gagal | V1 | `API_CONTRACT.md V2.0 9.2` |
| `TIMEOUT` | 504 | LLM timeout | V1 | `API_CONTRACT.md V2.0 9.2` |
| **`CLASSIFICATION_ERROR`** | **502** | **Vision LLM gagal** | **V2** | `PRD.md V2.0 9.3` |
| `INTERNAL` | 500 | Error tak terduga | V1 | `API_CONTRACT.md V2.0 9.2` |

### 5.2 Pola try/catch

| Layer | Pola |
|---|---|
| Route handler | `try { ... } catch (e) { return errorResponse(...) }` |
| Server Action | `try { return { ok: true, data } } catch { return { ok: false, error } }` |
| Lib | Throw typed `AppError`. |
| Client Component | Catch → toast error (`sonner`). |

### 5.3 Tidak Boleh Swallow

- ❌ `catch (e) {}` kosong.
- ❌ `catch (e) { console.log(e) }` tanpa rethrow.
- ✅ `catch (e) { console.error('[scope]', e); throw new AppError('INTERNAL', 500, '...') }`.

### 5.4 Logging

| Konteks | Pola | Bukti |
|---|---|---|
| Structured log | `console.error('[scope]', { ...context })`. | ASUMSI |
| `generation_logs` DB | **V2: +`logs_json` array.** | `DATABASE_SCHEMA.md V2.0 4.8` |
| Tidak bocor data sensitif | ❌ `console.log(apiKey)`. | `SRS.md V2.0 10.1 SEC-01` |
| **V2: Log buffer** | In-memory array per request. Drain ke SSE `log` event. Persist saat `done`. | `SRS.md V2.0 6.5 FR-V2-05` |
| **V2: Log sanitization** | Log lines di-escape HTML sebelum render di LogViewer. | `PROJECT_ARCHITECTURE.md V2.0 10 SB-16` |

---

## 6. Keamanan Koding

### 6.1 Tabel Keamanan Koding (V1 + V2)

| ID | Aturan | V1/V2 | Bukti |
|---|---|---|---|
| SEC-C01 | API key encrypt at rest (AES-256-GCM) | V1 | `SRS.md V2.0 10.1 SEC-01` |
| SEC-C02 | API key TIDAK expose ke client (`****` + 4 char) | V1 | `SRS.md V2.0 10.1 SEC-02` |
| SEC-C03 | Server-only provider call (`import 'server-only'`). **V2: +`image-classifier.ts`** | V1+V2 | `SRS.md V2.0 10.1 SEC-03` |
| SEC-C04 | Server-only crypto | V1 | `SRS.md V2.0 10.1 SEC-03` |
| SEC-C05 | No hardcoded secret (env only) | V1 | `SRS.md V2.0 10.1 SEC-08` |
| SEC-C06 | Env wajib ada + check di init | V1 | ASUMSI |
| SEC-C07 | Parameterized query (Drizzle) | V1 | `DATABASE_SCHEMA.md V2.0 8.3` |
| SEC-C08 | Input validation Zod di boundary | V1 | `SRS.md V2.0 10.1 SEC-06` |
| SEC-C09 | Output sanitization (XSS). **V2: +`storyDescription`** | V1+V2 | `SRS.md V2.0 10.1 SEC-06` |
| SEC-C10 | RBAC ownership check (`user_id`). **V2: +asset_references** | V1+V2 | `SRS.md V2.0 10.1 SEC-07` |
| SEC-C11 | Protected routes middleware | V1 | `SRS.md V2.0 10.1 SEC-11` |
| SEC-C12 | CSRF protection | V1 | `SRS.md V2.0 10.1 SEC-05` |
| SEC-C13 | HTTPS only | V1 | `SRS.md V2.0 10.1 SEC-09` |
| SEC-C14 | 9router localhost only (dev) | V1 | ASUMSI SRS-A7 |
| SEC-C15 | No secret in client bundle | V1 | ASUMSI |
| SEC-C16 | Rate limit generate (10 req/min) | V1 | `SRS.md V2.0 12` |
| SEC-C17 | File upload validation (mime + size) | V1 | `SRS.md V2.0 9.1` |
| SEC-C18 | Dependency audit | V1 | ASUMSI |
| SEC-C19 | Password hash (bcryptjs) | V1 | `DATABASE_SCHEMA.md V2.0 9.3` |
| SEC-C20 | Session expiry | V1 | ASUMSI |
| SEC-C21 | CORS same-origin | V1 | `API_CONTRACT.md V2.0 11.3` |
| **SEC-C22** | **Vision LLM key env-only (bukan user input)** | **V2** | `PROJECT_ARCHITECTURE.md V2.0 10 SB-14` |
| **SEC-C23** | **Story description max 500 char validated** | **V2** | `SRS.md V2.0 6.4 FR-V2-04` |
| **SEC-C24** | **Log buffer sanitization (escape HTML)** | **V2** | `PROJECT_ARCHITECTURE.md V2.0 10 SB-16` |
| **SEC-C25** | **Orphan asset cleanup** | **V2** | `API_CONTRACT.md V2.0 6.6` |

### 6.2 Checklist Keamanan per PR

- [ ] Tidak ada `any` leak input ke LLM/DB
- [ ] Semua input via Zod parse
- [ ] Semua query filter `user_id`
- [ ] API key encrypt sebelum save, mask di response
- [ ] Tidak ada `console.log` secret
- [ ] `import 'server-only'` di lib server
- [ ] Tidak ada hardcoded secret
- [ ] File upload validasi mime + size
- [ ] Error envelope konsisten
- [ ] CSRF aktif
- [ ] **V2: Vision LLM key dari env, bukan user input**
- [ ] **V2: `storyDescription` max 500 char validated**
- [ ] **V2: Log lines escaped sebelum render**

---

## 7. Testing

### 7.1 Strategi Test (V2)

| Level | Tool | Scope | Target | Bukti |
|---|---|---|---|---|
| Unit | Vitest | `lib/ai`, `lib/db`, `lib/crypto`, `lib/validation`, `lib/storage`, `lib/export` | >= 80% | `SRS.md V2.0 11.1` |
| Integration | Vitest + Turso test DB | API route handlers + Server Actions | >= 70% | `SRS.md V2.0 11.1` |
| E2E | Playwright | login → set provider → upload + classify → generate → save → export | 100% critical | `SRS.md V2.0 11.1` |
| Lint | ESLint + tsc | `src/` | 0 error, 0 warning | `SRS.md V2.0 11.1` |
| a11y | axe (Playwright) | WCAG 2.1 AA | 0 violation | `UIUX_SPEC.md V2.0 9` |

### 7.2 Aturan Test

| Aturan | Detail | Bukti |
|---|---|---|
| Co-located | `*.test.ts` di samping file. | ASUMSI |
| E2E folder `e2e/` | `e2e/<flow>.spec.ts`. | ASUMSI |
| Mocking | Mock Drizzle + AI SDK di unit. Turso test DB di integration. **V2: mock Vision LLM.** | ASUMSI |
| AAA pattern | Arrange-Act-Assert. | ASUMSI |
| Coverage gate | CI gagal bila < 80%. | `SRS.md V2.0 11.1` |
| No skip test | `it.skip` wajib alasan + issue link. | ASUMSI |
| Stream test | Mock `streamObject`. Assert SSE event sequence. **V2: assert `log` event.** | ASUMSI |
| **V2: Classification test** | Unit `classifyImage()` round-trip. Mock Vision LLM. | `SRS.md V2.0 13.2 AC-V2-02` |
| **V2: Log buffer test** | Unit push/drain/persist. | `SRS.md V2.0 13.2 AC-V2-05` |
| **V2: Pagination test** | Unit paginate. E2E page navigation. | `SRS.md V2.0 13.2 AC-V2-09` |
| **V2: Dashboard test** | Unit `dashboard.repo.ts`. E2E load <= 1.5s. | `SRS.md V2.0 13.2 AC-V2-06` |

### 7.3 Contoh Test

```ts
// V2: image-classifier.test.ts
import { describe, it, expect } from 'vitest';
import { classifyImage } from './image-classifier';

describe('classifyImage', () => {
  it('should classify character image', async () => {
    const result = await classifyImage('https://blob.example/hero.png');
    expect(result.role).toBe('tokoh');
    expect(result.confidence).toBeGreaterThan(0.7);
  });
});
```

```ts
// V2: log-buffer.test.ts
import { describe, it, expect } from 'vitest';
import { LogBuffer } from './log-buffer';

describe('LogBuffer', () => {
  it('should push and drain logs', () => {
    const buf = new LogBuffer();
    buf.push('info', '[generate] Starting...');
    const logs = buf.drain();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
  });
});
```

---

## 8. Git Workflow & Commit

### 8.1 Branch Strategy

| Branch | Tujuan | Bukti |
|---|---|---|
| `main` | Production-ready. Hanya via PR. | ASUMSI |
| `feature/<scope>` | Fitur baru. **V2: `feat/v2-upload`, `feat/v2-classification`, `feat/v2-logs`, `feat/v2-dashboard`, `feat/v2-navigation`, `feat/v2-github`.** | `SRS.md V2.0 6.10` |
| `fix/<scope>` | Bug fix. | ASUMSI |
| `chore/<scope>` | Non-feature. | ASUMSI |

### 8.2 Conventional Commits

Format: `type(scope): subject`

- `scope` opsional tapi disarankan.
- `subject` imperative mood, lowercase, ≤72 char, no period.
- `body` opsional, jelaskan why.

**Contoh:**

```
feat(generate): add story description field to generate form

Tambah field storyDescription (opsional, max 500 char) di
GenerateInputSchema dan generate form. Inject ke buildUserMessage().
Closes #42
```

### 8.3 Atomic Commit

- Satu commit = satu perubahan logis.
- Stage hanya file relevan (`git add <file>`).

### 8.4 PR Template

```markdown
## Deskripsi
[apa yang diubah + why]

## Checklist
- [ ] Type-safe (tsc --noEmit pass)
- [ ] No `any`
- [ ] Input validation (Zod)
- [ ] Ownership check (user_id)
- [ ] No hardcoded secret
- [ ] Test added (coverage >= 80%)
- [ ] A11y (WCAG AA)
- [ ] i18n key (id + en)
- [ ] Lint pass

## Issue
Closes #...
```

---

## 9. Linting & Formatting

### 9.1 ESLint

| Aturan | Detail | Bukti |
|---|---|---|
| `next lint` | Next.js default ESLint. | `SRS.md V2.0 4.1` |
| TypeScript rules | `no-explicit-any` (error), `no-unused-vars` (error, `_` prefix), `consistent-type-imports` (warn). | ASUMSI |
| Accessibility | `eslint-plugin-jsx-a11y`. 0 violation. | `UIUX_SPEC.md V2.0 9` |
| Strict | 0 error, 0 warning. CI fail bila ada. | `SRS.md V2.0 11.1` |

### 9.2 Prettier

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Pilih Prettier ATAU Biome, jangan campur.

### 9.3 Type Check

- `tsc --noEmit` wajib pass sebelum commit/PR. 0 error.

---

## 10. PR Review Checklist (Definition of Done Koding)

### 10.1 Type & Lint

- [ ] `tsc --noEmit` pass (0 error)
- [ ] `next lint` pass (0 error, 0 warning)
- [ ] Tidak ada `any`
- [ ] Import order sesuai §3.2
- [ ] Format konsisten (Prettier)

### 10.2 Validasi & Security

- [ ] Semua input via Zod parse
- [ ] Semua query filter `user_id`
- [ ] Tidak ada hardcoded secret
- [ ] `import 'server-only'` di lib server
- [ ] API key encrypt + mask
- [ ] Tidak ada `console.log` secret
- [ ] Error envelope konsisten
- [ ] File upload validasi mime + size
- [ ] **V2: Vision LLM key dari env**
- [ ] **V2: `storyDescription` max 500 char**
- [ ] **V2: Log lines escaped**

### 10.3 Test

- [ ] Unit test added
- [ ] Coverage >= 80%
- [ ] E2E test critical flow
- [ ] Test pass
- [ ] No `it.skip` tanpa alasan

### 10.4 Dokumen & i18n

- [ ] JSDoc function publik
- [ ] i18n key kedua locale
- [ ] Tidak ada teks hardcode di UI

### 10.5 Aksesibilitas

- [ ] WCAG 2.1 AA
- [ ] `aria-label` icon-only button
- [ ] `aria-live` streaming/toast
- [ ] `lang` attribute ikut locale
- [ ] **V2: LogViewer `role="log"`, `aria-live="polite"`**
- [ ] **V2: Pagination `aria-current="page"`**
- [ ] **V2: MetricCard `aria-label`**

### 10.6 Design Tokens

- [ ] Pakai token dari UIUX_SPEC §2
- [ ] Tidak hardcode hex/px
- [ ] `cn()` utility

### 10.7 Performance

- [ ] Tidak ada N+1 query
- [ ] RSC untuk data fetch
- [ ] Streaming SSE untuk generate
- [ ] Index DB sesuai DATABASE_SCHEMA §6
- [ ] **V2: Pagination di list endpoint**
- [ ] **V2: Dashboard load <= 1.5s**
- [ ] **V2: Page transition <= 200ms**

---

## 11. CI/CD

### 11.1 GitHub Actions

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test --coverage
      - run: pnpm build

  e2e:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
```

### 11.2 Deploy Vercel

| Event | Target | Env |
|---|---|---|
| PR | Vercel preview | preview env |
| Push `main` | Vercel production | prod env |

### 11.3 Migration Prod

- Dev: `drizzle-kit push`.
- Prod: SQL manual via `turso db shell`.
- **V2: 3 ALTER TABLE additive nullable.** `DATABASE_SCHEMA.md V2.0 9.3`.

---

## 12. Standar Frontend (Design Tokens & A11y)

### 12.1 Design Tokens WAJIB dari UIUX_SPEC

| Kategori | Token | Sumber |
|---|---|---|
| Warna | `--color-primary` (`#7c3aed`), success, warning, info, dll | `UIUX_SPEC.md V2.0 2.1, 2.10` |
| V2: Warna log | `--color-log-info-bg`, `--color-log-warn-bg`, `--color-log-error-bg` | `UIUX_SPEC.md V2.0 2.1` |
| V2: Confidence | `--color-confidence-low`, `--color-confidence-mid`, `--color-confidence-high` | `UIUX_SPEC.md V2.0 2.2` |
| V2: Role badge | tokoh=primary, background=info, prop=warning, accessory=accent-foreground, environment=success, other=muted-foreground | `UIUX_SPEC.md V2.0 2.2` |
| Tipografi | `--font-sans` (Inter), `--font-mono` (JetBrains Mono) | `UIUX_SPEC.md V2.0 2.3` |
| Spacing | `space-1` (4px)...`space-24` (96px) | `UIUX_SPEC.md V2.0 2.5` |
| Radius | `--radius-sm` (4px)...`--radius-full` | `UIUX_SPEC.md V2.0 2.6` |
| Motion | `--motion-fast` (120ms)...`--motion-slow` (320ms) | `UIUX_SPEC.md V2.0 2.8` |
| V2: Motion log | `--motion-log-entry` (200ms) | `UIUX_SPEC.md V2.0 2.8` |
| Z-index | `--z-dropdown` (1000)...`--z-tooltip` (1400) | `UIUX_SPEC.md V2.0 2.9` |

### 12.2 Komponen WAJIB

**shadcn/ui (V2: 18):** Button, Input, Textarea, Select, Card, Dialog, Tabs, Sonner, Table, Badge, Skeleton, Alert, Label, Tooltip, Switch, Collapsible, ScrollArea, Progress. Sitasi: `UIUX_SPEC.md V2.0 3.1`.

**Custom V2 baru:** LogViewer, LogEntry, ClassificationResult, ConfidenceBar, RoleBadge, AssetPreviewList, StoryDescriptionTextarea, MetricCard, WeeklyTrendChart, SuccessFailBarChart, PerProviderBreakdownTable, RecentActivityTable, StorageUsageCard, Pagination, PageLoadingSkeleton, PageErrorBoundary. Sitasi: `UIUX_SPEC.md V2.0 3.3`.

### 12.3 Struktur Komponen

- `src/components/ui/` = shadcn/ui
- `src/components/common/` = shared + **Pagination V2, PageLoadingSkeleton V2, PageErrorBoundary V2**
- `src/components/generate/` = V1 + **LogViewer, ClassificationResult, AssetPreviewList, RoleBadge, ConfidenceBar, StoryDescriptionTextarea**
- `src/components/dashboard/` = **V2 BARU: MetricCard, charts, tables**
- `src/components/projects/` = list + **ProjectsPagination V2**

Sitasi: `PROJECT_ARCHITECTURE.md V2.0 5` ; `UIUX_SPEC.md V2.0 3.3`.

### 12.4 Aksesibilitas (WCAG 2.1 AA)

- Kontras >= 4.5:1 body, >= 3:1 large/UI border.
- Keyboard nav: semua interaktif reachable Tab. Skip link.
- Focus visible: outline `--ring` 2px solid.
- Modal: focus trap, Esc tutup.
- ARIA: `aria-label`, `aria-expanded`, `aria-selected`, `aria-live`, `role="alert"`.
- **V2: LogViewer `role="log"`, `aria-live="polite"`**
- **V2: Pagination `aria-current="page"`**
- **V2: MetricCard `aria-label`**
- **V2: Chart `aria-label`**
- **V2: error.tsx `role="alert"`, `aria-live="assertive"`**
- `lang` attribute ikut locale.
- `prefers-reduced-motion` nonaktifkan animasi.

### 12.5 i18n Key WAJIB

- Semua teks UI via i18n key. TIDAK hardcode teks ID/EN di JSX.
- Key namespaced: `common.*`, `generate.*`, `dashboard.*`, `projects.*`, `settings.*`, `error.*`.
- **V2: Tambah key:** `generate.role.tokoh/background/prop/accessory/environment/other`, `generate.log.title/toggle`, `dashboard.metric.*`, dll.
- Bundel kedua locale sinkron.

---

## 13. Larangan Umum (V1 L01-L30 + V2 L31-L38)

### V1 Larangan (dipertahankan)

| # | Larangan | Alasan |
|---|---|---|
| L01 | Mutasi langsung state React (`state.x = y`) | `setState` / immutable update |
| L02 | Magic number tanpa konstanta | Ekstrak ke konstanta named |
| L03 | Nesting > 3 level | Pecah ke function/helper |
| L04 | `console.log` tertinggal di prod | Hapus atau structured logger |
| L05 | Dependency tidak dipin (dead code) | Hapus import/variabel |
| L06 | `any` tanpa alasan | `unknown` + Zod narrow |
| L07 | Hardcoded secret | Env only |
| L08 | Hardcode hex/px di className | Pakai token UIUX_SPEC §2 |
| L09 | Hardcode teks UI (bukan i18n key) | `useTranslations` / `getTranslations` |
| L10 | `useEffect` untuk derived state | Compute saat render / `useMemo` |
| L11 | `index` sebagai `key` list | Id stabil |
| L12 | Query DB tanpa filter `user_id` | Ownership wajib |
| L13 | `select()` semua kolom | Explicit column select |
| L14 | String concat SQL | Drizzle parameterized |
| L15 | `dangerouslySetInnerHTML` tanpa sanitasi | Hindari atau sanitasi |
| L16 | `eval` / `new Function` | Tidak pernah |
| L17 | `process.env.X!` tanpa guard | Guard di init |
| L18 | `outline: none` tanpa pengganti | Focus visible wajib |
| L19 | `git add .` tanpa cek status | Stage file relevan |
| L20 | Commit langsung ke `main` | Lewat PR + review |
| L21 | `it.skip` tanpa alasan | Hapus atau selesaikan |
| L22 | Snapshot komponen UI | Snapshot hanya output stabil |
| L23 | `any` di Zod schema output LLM | Schema WAJIB explicit |
| L24 | Panggilan LLM dari Client Component | Server-only `lib/ai/*` |
| L25 | Decrypt API key di Client Component | Server-only `lib/crypto/*` |
| L26 | `fetch('/api/...')` manual internal mutation | Server Action |
| L27 | `'use client'` di root layout bila tidak perlu | Hanya komponen interaktif |
| L28 | `useState` + `useEffect` untuk data fetch SSR | RSC + fetch server-side |
| L29 | File > 300 baris | Pecah ke modul |
| L30 | Function > 60 baris | Pecah ke helper |

### V2 Larangan (baru)

| # | Larangan | Alasan |
|---|---|---|
| L31 | Panggilan Vision LLM dari Client Component | Server-only `lib/ai/image-classifier.ts`. Direct HTTP, bukan AI SDK. |
| L32 | Query Drizzle langsung di route handler/dashboard page | Repository pattern. Dashboard via `dashboard.repo.ts`. |
| L33 | Upload tanpa validasi mime + size di server | Zod + magic bytes. Max 10MB. |
| L34 | Log buffer persist ke DB per log line | Buffer in-memory, persist saat `done` saja. |
| L35 | Hardcode role classification (tokoh/background only) | 6 opsi: tokoh/background/prop/accessory/environment/other. |
| L36 | `console.log` di production code | Convert ke structured logging atau hapus. |
| L37 | Direct Drizzle query di dashboard page | Refactor ke `dashboard.repo.ts`. |
| L38 | Tambah dark mode toggle di V2 | Out of scope V2 (deferred V3). |

---

## 14. Asumsi Coding + Referensi

### 14.1 Asumsi Coding (V1 + V2)

| ID | Asumsi | Status | Sitasi |
|---|---|---|---|
| CR-A1 | ORM = Drizzle | Ground truth `package.json:32` | `package.json:32` |
| CR-A2 | Enkripsi AES-256-GCM | ASUMSI | `RAG-CONTEXT.md 11 #4` |
| CR-A3 | Storage prod = Vercel Blob | ASUMSI | `RAG-CONTEXT.md 9 G3` |
| CR-A4 | Auth = NextAuth credentials | ASUMSI | `RAG-CONTEXT.md 9 G2` |
| CR-A5 | i18n = next-intl | ASUMSI | `RAG-CONTEXT.md 9 G5` |
| CR-A6 | Streaming SSE anti-timeout | ASUMSI | `RAG-CONTEXT.md 5.4` |
| CR-A7 | Retry LLM 2x backoff (dari kode) | Ground truth | `RAG-CONTEXT.md 5.2` |
| CR-A8 | Rate limit 10 req/min/user | ASUMSI | `SRS.md V2.0 12` |
| CR-A9 | Timestamp = integer unix epoch | Ground truth | `DATABASE_SCHEMA.md V2.0 1.3` |
| CR-A10 | Coverage target 80% | ASUMSI | `SRS.md V2.0 11.1` |
| CR-A11 | Prettier (bukan Biome) | ASUMSI | `package.json:78-79` |
| CR-A12 | Conventional commits | ASUMSI | Best practice |
| CR-A13 | Versioning `/api/v1` prefix | ASUMSI | `API_CONTRACT.md V2.0 1.3` |
| CR-A14 | Password hash bcryptjs | ASUMSI | `DATABASE_SCHEMA.md V2.0 9.3` |
| CR-A15 | Session JWT cookie | ASUMSI | ASUMSI |
| CR-A16 | File upload max 10MB | ASUMSI | `SRS.md V2.0 9.1` |
| CR-A17 | Batas tokoh 10 per project | ASUMSI | ASUMSI SRS-A10 |
| **CR-V2-1** | Vision LLM = GPT-4o atau Gemini Vision | Perlu konfirmasi | `SRS.md V2.0 6.2` |
| **CR-V2-2** | Deskripsi cerita = optional, max 500 char | Perlu konfirmasi | `SRS.md V2.0 6.4` |
| **CR-V2-3** | Real-time logs = Collapsible, default OFF | Perlu konfirmasi | `SRS.md V2.0 6.5` |
| **CR-V2-4** | Dashboard = cards + tables + charts | Perlu konfirmasi | `SRS.md V2.0 6.6` |
| **CR-V2-5** | Upload di generate page = pre-submit | Perlu konfirmasi | `SRS.md V2.0 6.1` |
| **CR-V2-6** | Role = 6 opsi | Perlu konfirmasi | `SRS.md V2.0 6.3` |
| **CR-V2-7** | Push GitHub = public repo | Perlu konfirmasi | `SRS.md V2.0 6.10` |
| **CR-V2-8** | AI SDK tetap v4 | Ground truth `package.json:25` | `SRS.md V2.0 5` |
| **CR-V2-9** | Recharts atau Tremor untuk charts | Perlu konfirmasi | `SRS.md V2.0 6.6` |
| **CR-V2-10** | Classification auto-trigger saat upload | Perlu konfirmasi | `SRS.md V2.0 6.2` |

### 14.2 Referensi Internal

| Dokumen | Path |
|---|---|
| RAG-CONTEXT | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| SRS V2.0 | `C:\laragon\www\PromptFlow\product-docs\SRS.md` |
| DATABASE_SCHEMA V2.0 | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` |
| PROJECT_ARCHITECTURE V2.0 | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` |
| API_CONTRACT V2.0 | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` |
| UIUX_SPEC V2.0 | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` |
| GitHub | `https://github.com/agrianwahab29/promptflow.git` |

### 14.3 Sitasi Eksternal Kunci

| Sitasi | Klaim | Bagian |
|---|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | `createOpenAICompatible` | 4.7 |
| https://openrouter.ai/docs/api/reference/authentication | OpenRouter base URL | 4.7 |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat | 4.7 |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js | 4.6 |
| https://turso.tech/blog/serverless | Vercel FS tidak persisten | 4.6 |
| https://ui.shadcn.com/docs/installation/next | shadcn/ui Next.js | 4.5 |
| https://nextjs.org/docs | Next.js App Router, RSC | 4.2 |
| https://orm.drizzle.team | Drizzle ORM | 4.6 |

---

**Dokumen ini fokus pada ATURAN KODING konkret siap eksekusi. V2 = V1 rules dipertahankan + V2 rules ditambahkan. Semua 38 larangan (L01-L38) wajib dipatuhi.**

> **Dibuat oleh:** docgen-coding-rules subagent
> **Tanggal:** 2026-06-20
> **Versi:** 2.0
