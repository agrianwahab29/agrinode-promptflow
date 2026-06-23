# CODING_RULES.md - PromptFlow Coding Rules & Standards

> Disusun oleh docgen-coding-rules. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `SRS.md` + `PROJECT_ARCHITECTURE.md` + `DATABASE_SCHEMA.md` + `UIUX_SPEC.md` + `API_CONTRACT.md`.
> Klaim faktual bertumpu pada RAG (cite file:line). Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis + cuplikan kode apa adanya.
> Aturan SPESIFIK ke stack proyek (Next.js 15 App Router + TypeScript strict + Drizzle sqlite-core/Turso + NextAuth v5 + Zod + shadcn/ui + next-intl + pnpm + vitest + playwright). Bukan generik.
> **Tujuan inti**: Mencegah bug kelas Bug A (schema-prompt mismatch) dan Bug B (JSON repair lemah) terulang. Setiap aturan LLM pipeline dikodifikasi dari pelajaran bug.

---

## 1. Ringkasan + Bahasa / Framework Berlaku

PromptFlow = monolith Next.js 15 App Router (TypeScript strict) di Vercel (Node runtime, `maxDuration=300s` generate) + DB Turso/libSQL (SQLite-compatible, **BUKAN Postgres**) + Drizzle ORM sqlite-core + NextAuth v5 Credentials + Zod + shadcn/ui + Tailwind 4 + next-intl id/en (`RAG S2, S3.2`, `package.json:50,47,25,51,61,52`).

| Layer | Tech | Versi | Citation |
|---|---|---|---|
| Framework | next (App Router) | ^15.1.0 | `package.json:50` |
| Bahasa | typescript (strict) | ^5.7.0 | `package.json:83`, `tsconfig.json:7` |
| ORM | drizzle-orm (sqlite-core) | ^0.38.0 | `package.json:47`, `schema.ts:2` |
| DB driver | @libsql/client (Turso) | ^0.14.0 | `package.json:25`, `client.ts:2` |
| Validasi | zod | ^3.24.0 | `package.json:61` |
| Auth | next-auth (v5 beta) | 5.0.0-beta.25 | `package.json:51`, `config.ts:2-11` |
| i18n | next-intl | ^3.26.0 | `package.json:52`, `next.config.ts:2` |
| UI kit | shadcn/ui (radix) | berbagai ^1.x/^2.x | `package.json:26-39`, `components.json` |
| Test unit | vitest + @vitest/coverage-v8 | ^2.1.0 | `package.json:84,73` |
| Test E2E | @playwright/test | ^1.49.0 | `package.json:64` |
| Lint | eslint ^9.17 + eslint-config-next ^15.1 + @typescript-eslint ^8.18 | - | `package.json:76-78,70-71` |
| Format | prettier ^3.4 + prettier-plugin-tailwindcss ^0.6 | - | `package.json:80,81` |
| Package manager | pnpm | >=9 (locked 11.7.0) | `package.json:88-90` |
| Node | >=20.0.0 | - | `package.json:86-88` |

**Package manager WAJIB**: pnpm. Jangan `npm`/`yarn`. Lockfile `pnpm-lock.yaml` wajib di-commit (`package.json:88-90`).

---

## 2. Konvensi Penamaan

| Entitas | Konvensi | Contoh | Citation |
|---|---|---|---|
| File route handler (lib-style) | `kebab-case.ts` | `route.ts`, `error.ts` | `RAG S3.1` (`src/lib/api/error.ts`) |
| File React component | `PascalCase.tsx` (export) / `kebab-case.tsx` (file) | `GenerateForm`, `LogViewer`, `ProviderCard` | `RAG S3.1` (`src/components/generate/log-viewer.tsx`) - ASUMSI: file kebab di repo, nama export PascalCase. Konsistenkan: nama export PascalCase, file boleh `kebab-case.tsx` selaras shadcn convention. |
| File lib/service | `kebab-case.ts` | `llm-client.ts`, `prompt-builder.ts`, `response-parser.ts`, `consistency-checker.ts`, `log-buffer.ts` | `RAG S3.1` (`src/lib/ai/`) |
| File repository | `kebab-case.repo.ts` | `project.repo.ts`, `scene-audio.repo.ts` | `RAG S3.3` - ASUMSI: inkonsisten `.repo.ts` vs `.repository.ts`. **Aturan**: gunakan `.repo.ts` seragam. |
| Folder | `kebab-case` | `generate/`, `image-prompts/`, `supporting-characters/` | `RAG S3.1` |
| Variable / function | `camelCase` | `buildSystemPrompt`, `extractJsonFromContent`, `safeDbOp` | `RAG S8.2.1, S5` |
| Class / Interface / Type | `PascalCase` | `PromptPackage`, `SceneAudioSpec`, `GenerateInput` | `schemas.ts:106` |
| Zod schema export | `XxxSchema` (PascalCase + `Schema` suffix) | `PromptPackageSchema`, `SceneAudioSpecSchema`, `GenerateInputSchema` | `schemas.ts:106,39,181` |
| Zod type infer | `Xxx` (z.infer) | `type PromptPackage = z.infer<typeof PromptPackageSchema>` | `schemas.ts` |
| Konstanta modul | `UPPER_SNAKE_CASE` | `MAX_RETRIES = 2`, `STAGE_LABELS`, `HEARTBEAT_MS` | `RAG S8.2.3` (`llm-client.ts:238`), `generate-form.tsx:31` |
| Enum value (string) | `snake_case` untuk domain LLM/DB, `camelCase` untuk DTO HTTP | `audio_type: 'background_music'`, `status: 'draft'`; DTO `durationTarget`, `aspectRatio` | `API_CONTRACT S4.2`, `schemas.ts:181-200` |
| Tabel DB | `snake_case` (Drizzle casing config) | `users`, `provider_configs`, `scene_audio`, `generation_logs` | `client.ts:2-13`, `schema.ts:5-201` |
| Kolom DB | `snake_case` di SQL, `camelCase` di Drizzle def | DB `user_id`, Drizzle `userId`; DB `sfx_list`, Drizzle `sfxList` | `DATABASE_SCHEMA S3.10`, `schema.ts:193` |
| Env var | `UPPER_SNAKE_CASE`, server-only tanpa prefix `NEXT_PUBLIC_` | `TURSO_DATABASE_URL`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL` | `.env.example:1-17`, `RAG S10.5` |
| Branch git | `kebab-case`, prefix tipe | `feat/sfx-list-union`, `fix/json-repair-hardening`, `docs/coding-rules` | ASUMSI |
| Commit message | conventional commits (lihat S13) | `fix(ai): union sfx_list schema + normalizer (FR-GEN-02)` | ASUMSI |

**Aturan tambahan**:
- Nama file test: `<nama-modul>.test.ts` (unit, `*.test.ts` di `src/lib/`), `e2e/<flow>.spec.ts` (playwright). Contoh: `schemas.test.ts`, `project.repo.test.ts`, `llm-client.test.ts` (`RAG S3.3`, `RAG S12 G10`).
- Nama route handler: wajib `route.ts` di folder `app/api/v1/<resource>/`, export `GET`/`POST`/`PATCH`/`DELETE` (`RAG S3.2`).
- Nama komponen composite: `<Domain><Purpose>.tsx` (mis. `GenerateForm`, `LogViewer`, `ResultTabs`, `ProviderCard`). Hindari nama generik `Card.tsx` tanpa konteks (`UIUX_SPEC S3.2`).
- **Field LLM JSON contract** (`PromptPackage`): `snake_case` (`audio_specs`, `sfx_list`, `image_prompts`, `voiceover_script`) (`API_CONTRACT S4.2`, `schemas.ts:106-124`). **JANGAN** campur aduk dengan DTO camelCase di boundary HTTP.

---

## 3. Standar Struktur & Gaya Kode

### 3.1 Layering (cite `PROJECT_ARCHITECTURE S5`)

Dependency direction WAJIB: **Presentation -> API -> Domain/Service -> Data Access -> Infrastructure**. Domain tidak boleh bergantung Presentation/API (pure function). Data Access tidak bergantung Domain (hanya schema + client).

| Layer | Lokasi | Aturan |
|---|---|---|
| Presentation | `src/app/[locale]/**` pages + `src/components/{generate,landing,dashboard,projects,settings,common,ui}/*.tsx` | Server Components default. `"use client"` HANYA untuk interaktivitas (form, SSE consumer, state). Tidak import `db`/`auth config`/`crypto` langsung. |
| API | `src/app/api/v1/**/route.ts` (24 file) | Boundary validation (Zod `safeParse`), `auth()` gate, ownership check, orchestrate service. Tidak import UI. Tidak tulis logika domain (delegasi ke `lib/ai`, `lib/validation`). |
| Domain/Service | `src/lib/ai/**`, `src/lib/validation/**`, `src/lib/export/**`, `src/lib/templates/**`, `src/lib/migration/**` | Pure function. Tidak tahu transport (HTTP/SSE). Tidak import `db`/`route.ts`. Boleh import `lib/crypto`, `lib/api/error` (infra cross-cutting). |
| Data Access | `src/lib/db/{client,schema}.ts` + `src/lib/db/repositories/*.ts` (12 file) | Repository pattern per-entitas. Tidak import `lib/ai`/`lib/validation`/`route.ts`. Hanya schema + client. |
| Infrastructure | `src/lib/{crypto/aes,auth,storage,analytics,i18n,api/error}.ts` | Cross-cutting. Dipakai semua layer. |

**Larangan**:
- **TIDAK BOLEH** import `db` / `auth config` / `crypto` di Presentation layer (`components/`).
- **TIDAK BOLEH** import `route.ts` atau `NextRequest`/`NextResponse` di Domain/Service layer (`lib/ai`, `lib/validation`).
- **TIDAK BOLEH** tulis logika domain (build prompt, call LLM, validate PromptPackage) langsung di route handler. Delegasi ke service. Route handler = orchestrator.
- Modul server (`lib/db`, `lib/auth`, `lib/crypto`, `lib/ai/llm-client`) WAJIB pakai `import "server-only"` di baris pertama (`package.json:58`, `RAG S3.1`).

### 3.2 Colocated error/loading boundary (Next.js App Router)

Setiap route segment `[locale]/<page>/` WAJIB punya:
- `page.tsx` (Server Component default)
- `loading.tsx` -> render `PageLoadingSkeleton` (`UIUX_SPEC S3.7`, `common/page-loading-skeleton.tsx`). Set `aria-busy="true"` di wrapper.
- `error.tsx` -> render `PageErrorBoundary` (`UIUX_SPEC S3.7`, `common/page-error-boundary.tsx`). `role="alert"`, Alert destructive + Button retry. WAJIB `"use client"`.

Contoh struktur:
```
src/app/[locale]/generate/
  page.tsx          # Server Component, import GenerateForm (client)
  loading.tsx       # "use client" -> PageLoadingSkeleton
  error.tsx         # "use client" -> PageErrorBoundary
```

### 3.3 Server Component vs Client Component

- **Default Server Component** (tidak ada `"use client"`). Pakai untuk: page layout, data fetch server-side, static content, SEO-critical.
- `"use client"` WAJIB HANYA bila komponen butuh: `useState`/`useReducer`, `useEffect`, event handler (`onClick`), `useTranslations` (next-intl client), `useTheme` (next-themes), `useRouter`, browser API (`fetch` stream SSE, `EventSource`).
- **JANGAN** `fetch` di Client Component bila Server Component bisa lakukan (SSR/Server Action). Exception: SSE consumer `POST /api/v1/generate` (wajib client, stream real-time).
- Client Component yang butuh data server: pass via props dari Server Component parent, atau Server Action (`UIUX_SPEC S3.2` `GenerateForm` menerima props).

### 3.4 File kecil fokus

- 1 file = 1 tanggung jawab (single responsibility). Target <400 baris per file.
- Route handler generate (`route.ts:53-564`) = 564 baris (over limit, **ASUMSI**: terjadi karena orchestrator SSE). Aturan: bila route handler >400 baris, ekstrak orchestrator logic ke `lib/ai/generate-orchestrator.ts` (service). Route handler hanya wiring SSE + validasi + delegasi.
- Fungsi: target <50 baris. Bila >50, pecah. Exception: `buildSystemPrompt` (string literal panjang, `prompt-builder.ts:137-168`) - boleh panjang karena template literal.
- Hindari nesting >4 level. Early return / guard clause wajib.

---

## 4. TypeScript Standards

### 4.1 Strict mode (WAJIB)

`tsconfig.json:7` `strict: true`. **TIDAK BOLEH** disable per-file tanpa justifikasi + komentar `// eslint-disable-next-line @typescript-eslint/no-explicit-any` dengan alasan.

```typescript
// DON'T
function parseLlm(raw: any): any { ... }

// DO
function parseLlm(raw: unknown): PromptPackage {
  const parsed = PromptPackageSchema.parse(raw);  // Zod narrows type
  return parsed;
}
```

### 4.2 Zod parse di boundary, infer type

- **WAJIB** `z.infer<typeof XxxSchema>` untuk type domain. **JANGAN** re-declare interface manual yang duplikat schema (`API_CONTRACT S4.2`, `schemas.ts:106-124`).
- Parse di boundary (API request body, LLM output) dengan `XxxSchema.parse()` (throw) atau `XxxSchema.safeParse()` (return `{success, data, error}`).
- **JANGAN** trust LLM output tanpa `PromptPackageSchema.parse` (`RAG S11 Bug A` root cause: schema `z.string()` vs LLM array). Lihat S7.

```typescript
// DON'T (Bug A pattern - manual typing, no parse)
const pkg = JSON.parse(jsonStr) as PromptPackage;  // UNSAFE, bypass validation

// DO
const parsedJson: unknown = JSON.parse(sanitized);
const pkg: PromptPackage = PromptPackageSchema.parse(parsedJson);  // throws ZodError if mismatch
```

### 4.3 Discriminated union untuk error categories

Kategori error LLM pipeline (`RAG S8.2.3`, `llm-client.ts:18-44`) WAJIB discriminated union, `switch` exhaustive:

```typescript
type LlmErrorCategory =
  | { category: 'VALIDATION'; issues: z.ZodIssue[] }
  | { category: 'JSON_PARSE'; position: number; raw: string }
  | { category: 'TIMEOUT'; elapsedMs: number }
  | { category: 'NETWORK'; cause: string }
  | { category: 'HTTP'; status: number }
  | { category: 'DB_ERROR'; table: string }
  | { category: 'UNKNOWN'; raw: unknown };

function formatError(e: LlmErrorCategory): string {
  switch (e.category) {
    case 'VALIDATION': return e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    case 'JSON_PARSE': return `JSON invalid at pos ${e.position}`;
    case 'TIMEOUT': return `Timeout after ${e.elapsedMs}ms`;
    case 'NETWORK': return `Network: ${e.cause}`;
    case 'HTTP': return `Provider HTTP ${e.status}`;
    case 'DB_ERROR': return `DB error at ${e.table}`;
    case 'UNKNOWN': return 'Unknown error';
  }
}
```

`switch` WAJIB exhaustive (no `default` bila union tertutup). ESLint `@typescript-eslint/switch-exhaustiveness-check` direkomendasikan ON.

### 4.4 Tipe eksplisit di signature, `unknown` di boundary

- Function signature: eksplisit tipe return. Hindari implicit `any`.
- Boundary (input dari network/LLM/DB raw): `unknown`, lalu Zod parse untuk narrow.
- Hindari type assertion `as` kecuali setelah Zod parse atau verifikasi runtime.

### 4.5 `readonly` untuk immutable

Array/object yang tidak boleh dimutasi: `readonly`. Contoh: `readonly scenes: Scene[]` di PromptPackage (immutable setelah validate).

---

## 5. Next.js / React Standards

### 5.1 App Router conventions

- Route segment: `src/app/[locale]/<path>/page.tsx` (i18n segment `id|en`, `middleware.ts:38-42`).
- Route handler: `src/app/api/v1/<resource>/route.ts`, export `GET`/`POST`/`PATCH`/`DELETE` named function (`RAG S3.2`).
- Dynamic route params: typed via `NextRequest` + `params: { id: string; sceneId: string }`. Parse ke number dengan `Number.parseInt`, validasi `!Number.isNaN`. JANGAN trust `params.id` langsung sebagai number.
- `runtime = 'nodejs'` untuk route yang butuh `fetch` stream + drizzle + `crypto` (generate). `runtime = 'edge'` untuk middleware (`RAG S3.2`, `route.ts:19`, `middleware.ts`).
- `maxDuration = 300` untuk generate (`route.ts:20`). `force-dynamic` untuk route yang tidak cacheable (`route.ts:21`).

### 5.2 Server Components default

- Page `page.tsx` = Server Component default. Fetch data server-side (DB via repository, tidak `fetch` ke API sendiri).
- `"use client"` HANYA bila perlu interaktivitas (lihat S3.3).
- Server Component boleh import `lib/db/repositories`, `lib/ai`, `lib/validation`. Client Component **TIDAK BOLEH**.

### 5.3 Server Actions (mutations)

- `serverActions` experiment enabled (Next.js 15). Pakai Server Action untuk mutation form (login, register, provider config create/update, project create/update, theme set) BILA tidak butuh streaming.
- Untuk generate (butuh SSE stream): **TIDAK** pakai Server Action, pakai route handler `POST /api/v1/generate` (`ADR-03`, `PROJECT_ARCHITECTURE S14`).
- Server Action file: `src/app/[locale]/<page>/actions.ts`, tandai `"use server"` di baris pertama.

### 5.4 SSE consumer (client)

- `GenerateForm` (`generate-form.tsx`) = Client Component, konsumsi `POST /api/v1/generate` via `fetch` stream + `ReadableStream` reader + `TextDecoder` + parse `event: <name>\ndata: <json>\n\n` (`route.ts:28-30`).
- JANGAN pakai `EventSource` (tidak support POST body). Pakai `fetch` dengan `body: JSON.stringify(input)` + header `Accept: text/event-stream`.
- Handle event types: `stage`, `heartbeat`, `stream_chunk`, `log`, `done`, `error` (`API_CONTRACT S9.1.3`).

### 5.5 i18n (next-intl)

- Server Component: `import { getTranslations } from 'next-intl/server'` -> `const t = await getTranslations('namespace')`.
- Client Component: `import { useTranslations } from 'next-intl'` -> `const t = useTranslations('namespace')`.
- Namespace rekomendasi (`UIUX_SPEC S9.3`): `common`, `landing`, `auth`, `generate`, `projects`, `settings`, `dashboard`, `errors`.
- **WAJIB** semua label UI via `t('key')`. **JANGAN hardcode** string UI. Pengecualian: kode teknis (provider enum, status enum, kategori error kode) apa adanya (`UIUX_SPEC S12.5`).
- Stage labels (`generate-form.tsx:31-41`) saat ini hardcode ID - **rekomendasi**: pindah ke `messages/{id,en}.json` namespace `generate.stages` (`UIUX_SPEC S9.3`).
- Locale: `id` (default), `en` (`middleware.ts:40`). Routing segment `[locale]`.

### 5.6 No client-side fetch bila server bisa

- **JANGAN** `fetch('/api/v1/projects')` di Client Component bila Server Component bisa `getProjectsByUserId` langsung via repository.
- Exception: data yang berubah real-time (SSE), atau aksi user-triggered (form submit, delete) yang pakai Server Action/fetch mutation.

---

## 6. Drizzle / DB Standards

### 6.1 sqlite-core types (Turso/libSQL)

- DB = Turso/libSQL (SQLite-compatible), **BUKAN Postgres** (`RAG S2`). Tipe terbatas: `integer`, `text`, `real`. Tidak ada `jsonb`, `timestamptz`, `uuid`, `serial` (`DATABASE_SCHEMA S1.1`).
- Timestamp = `integer` unixepoch (detik UTC): `integer().default(sql\`(unixepoch())\`).notNull()` (`schema.ts:12`).
- Boolean = `integer` 0/1 (mis. `isActive: integer().notNull().default(1)`, `schema.ts:25`).
- JSON kompleks (8-layer image prompt, logsJson) = `text` JSON string. Coercion di app layer (`DATABASE_SCHEMA S7.2`).
- Casing: Drizzle def `camelCase`, DB `snake_case` (config `casing: 'snake_case'` di `client.ts:2-13`).

### 6.2 Repository pattern (WAJIB)

- 1 repository per entitas di `src/lib/db/repositories/<entitas>.repo.ts` (`RAG S3.3`, 12 file).
- Repository meng-encapsulasi query Drizzle. Tidak expose `db` instance langsung ke service layer.
- Function naming: `getXxxById`, `createXxx`, `updateXxx`, `deleteXxx`, `bulkCreateXxx`. Return typed (bukan `any`).
- Ownership filter WAJIB di parameter: `getProjectById(id: number, userId: number)` filter `WHERE userId = ?` (`route.ts:137-139`).

```typescript
// DON'T
export async function getProject(id: number) {
  return db.select().from(projects).where(eq(projects.id, id));  // no ownership
}

// DO
export async function getProjectById(id: number, userId: number) {
  return db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);
}
```

### 6.3 safeDbOp wrapper (resilience, partial persist)

- `safeDbOp<T>(op: () => Promise<T>): Promise<T | null>` (`route.ts:35-51`) wrap DB op, swallow error, log, return null, continue.
- **DIPAKAI** di persist block generate (`route.ts:310-493`) untuk partial success acceptable (`ADR-04`, `DATABASE_SCHEMA S10.4`).
- **WAJIB** track `partialSceneIds: number[]` bila `safeDbOp` return null di scene-level op (FR-GEN-06, `SRS S3.1.6`). Set `projects.status = 'partial'` bila non-empty.
- **JANGAN** pakai `safeDbOp` untuk operasi kritis (auth, payment) di mana failure harus abort. Hanya untuk persist non-kritis generate.

### 6.4 Transactions

- `db.transaction(async (tx) => { ... })` untuk multi-tabel atomic (mis. `setActive` provider: set semua provider user `isActive=0` lalu target `isActive=1`, `SRS S3.6.1`).
- Persist block generate (`route.ts:310-493`) = **TIDAK** pakai transaction (by design `safeDbOp` continue-on-error, `ADR-04`). Alasan: SQLite single-writer concurrency + cascade kompleks.
- Bila transaction dipakai: semua op dalam tx, throw -> rollback otomatis.

### 6.5 No raw SQL kecuali perlu

- Pakai Drizzle query builder (`db.select().from(table).where(...)`) untuk semua query.
- Raw SQL (`sql\`...\``) HANYA bila Drizzle tidak support (mis. `unixepoch()` default, `json_extract` untuk query sub-field JSON string).
- Raw SQL WAJIB parameterized (`sql\`... ${value} ...\``, Drizzle auto-escape). **JANGAN** string concat SQL.

### 6.6 Migrations (drizzle-kit)

- Tool: `drizzle-kit ^0.30.0`, dialect `turso` (`drizzle.config.ts:18`).
- Workflow (`DATABASE_SCHEMA S8.2`):
  1. Ubah `src/lib/db/schema.ts`.
  2. `pnpm db:generate` -> review `drizzle/000X_*.sql`.
  3. `pnpm db:migrate` apply (prod-safe).
- **JANGAN `pnpm db:push` di prod** (skip migration history, `DATABASE_SCHEMA S8.2`).
- Migration SQL di-commit ke `drizzle/` folder. Journal `meta/_journal.json` wajib sync (`DATABASE_SCHEMA S8.3` anomali: `0002_*.sql` orphan).
- FK action eksplisit: `references(() => users.id, { onDelete: 'cascade' })` atau `set null` (`DATABASE_SCHEMA S6.2`). Default `cascade` untuk parent-child, `set null` untuk optional (mis. `supporting_characters.sceneId`).

---

## 7. Zod / Validation Standards

### 7.1 Schema location

- Semua Zod schema di `src/lib/validation/schemas.ts` (single source, `RAG S6`).
- Sub-schema: `SceneAudioSpecSchema`, `SceneSchema`, `ImagePromptItemSchema`, `PromptPackageSchema`, `GenerateInputSchema`, `CreateProjectInputSchema`, `ProviderConfigSchema`, `RegisterSchema`, `ClassificationResultSchema` (`schemas.ts:1-268`).
- **JANGAN** buat schema Zod tersebar di route handler / component. Semua terpusat.

### 7.2 Parse di API boundary

- API route handler: `const result = XxxSchema.safeParse(body)` -> bila `!result.success` return 400/422 + `errorResponse('VALIDATION_ERROR', 400, msg, { issues: result.error.issues })` (`route.ts:70-88`, `API_CONTRACT S4.4`).
- LLM output: `PromptPackageSchema.parse(parsedJson)` (throw ZodError, catch + categorize, `llm-client.ts:379`).

### 7.3 Infer type via z.infer

```typescript
export const PromptPackageSchema = z.object({ ... });
export type PromptPackage = z.infer<typeof PromptPackageSchema>;
```
**JANGAN** re-declare `interface PromptPackage {...}` manual yang duplikat schema.

### 7.4 NEVER trust LLM output tanpa parse

- **WAJIB** `PromptPackageSchema.parse(parsedJson)` sebelum konsumsi (`llm-client.ts:379`).
- `parsedJson` dari `JSON.parse(repaired)` bertipe `unknown`, TIDAK `PromptPackage`. Parse Zod yang narrow type.
- Bug A (`RAG S11`): LLM kirim `sfx_list: ["footstep","door"]` (array), schema `z.string()` reject. Fix: union (`SRS FR-GEN-02`).

### 7.5 ATURAN KRITIS - Schema<->Prompt WAJIB agree on types (codifikasi Bug A)

> **Setiap field di JSON contract LLM WAJIB punya tipe eksplisit di system prompt DAN match Zod schema.** Field bernama `*_list` menyiratkan array dan WAJIB di-schema sebagai array, ATAU prompt eksplisit bilang "comma-separated string". Tidak boleh ambigu.

Checklist sebelum ubah prompt atau schema (`prompt-builder.ts:137-168` + `schemas.ts:106-124`):

| Field | Prompt declare tipe? | Zod schema tipe? | Match? | Contoh JSON tunjukkan field? |
|---|---|---|---|---|
| `sfx_list` | WAJIB "array of string" atau "string comma-separated" | union `z.string() \| z.array(z.string())` (FR-GEN-02) | YA | WAJIB ada audio_spec `sfx` dengan `sfx_list` terisi |
| `color_palette` | "array hex" | `z.union([z.string(), z.array(z.string())])` (`schemas.ts:29`) | YA | - |
| `audio_type` | enum 5 nilai | `z.string()` longgar (generate) / `z.enum(...)` strict (CRUD) | YA (longgar generate) | - |
| `composition`, `lighting`, `camera`, `technical` | "JSON string {...}" | `z.string().nullable()` | YA | - |
| `prompt_text` | "80-200 kata" | `z.string().min(1)` (tanpa count word, ASUMSI) | longgar | - |

**Aturan**:
1. Bila prompt bilang "array of X", schema WAJIB `z.array(z.X())` atau `z.union([z.string(), z.array(z.X())])` (longgar di LLM, normalize di app).
2. Bila prompt bilang "string comma-separated", schema WAJIB `z.string()` + prompt tunjukkan contoh `"a,b,c"`.
3. **JANGAN** nama field `*_list` bila schema `z.string()`. Konflik linguistik -> LLM kirim array (`RAG S11 Bug A` root cause).
4. Contoh JSON di prompt (`JSON_SCHEMA_EXAMPLE`, `prompt-builder.ts:75-97`) WAJIB mendemokan SEMUA `audio_type` enum termasuk `sfx` dengan `sfx_list` terisi.
5. Reviewer: bila tambah field baru ke schema, WAJIB tambah deklarasi tipe + contoh di prompt. Bila tambah instruksi prompt, WAJIB tambah/adjust schema match.

### 7.6 Union + normalizer (pola robust)

- Untuk field yang LLM mungkin kirim array atau string (mis. `sfx_list`, `color_palette`): schema `z.union([z.string(), z.array(z.string())])` (`schemas.ts:29` precedent `color_palette`).
- Normalizer di route handler sebelum DB insert:
```typescript
const normalizedSfxList = Array.isArray(audio.sfx_list)
  ? audio.sfx_list.join(', ')
  : (audio.sfx_list ?? null);
// insert scene_audio sfxList: normalizedSfxList (text)
```
- DB column tetap `text` (`schema.ts:193`). Coercion di app layer, bukan DB. **Tidak ada migration** untuk Bug A fix (`DATABASE_SCHEMA S4.2, S8.5`).
- `SceneAudioSpecSchema` (generate, longgar) vs `SceneAudioSchema` (CRUD endpoint, strict enum) - **konsolidasi default volume ke 0.5** (Bug F, `SRS FR-GEN-09`).

---

## 8. LLM Pipeline Standards (codifikasi Bug A + Bug B)

### 8.1 Retry WAJIB vary request body (FR-GEN-03)

> **Retry TIDAK boleh kirim request body identik.** Bug B (`RAG S11`): `requestJson` di-build sekali (`llm-client.ts:274`), fetch pakai `body: requestJson` sama. Bila bug deterministik (mis. LLM selalu salah escape di posisi tertentu), retry gagal identik.

Aturan retry loop (`llm-client.ts:237-424`):

| Attempt | `messages` | `temperature` | `stream` | `max_tokens` | Backoff |
|---|---|---|---|---|---|
| 1 | original | 0.7 | true | 32768 | - |
| 2 | original + corrective user message (FR-GEN-05) | 0.5 | true | 32768 | 2s |
| 3 (ASUMSI maxRetries naik 2->3) | attempt-2 + corrective baru | 0.3 | false | 65536 | 4s + jitter 0-1000ms |

```typescript
// DON'T (Bug B pattern - body sama dikirim ulang)
const requestJson = JSON.stringify({ model, messages, max_tokens: 32768, temperature: 0.7, stream: true });
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const res = await fetch(endpoint, { body: requestJson, ... });  // body sama persis
}

// DO (FR-GEN-03 - rebuild per attempt)
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const attemptMessages = attempt === 1
    ? messages
    : [...messages, { role: 'user', content: correctivePromptFromPrevError }];
  const temp = attempt === 1 ? 0.7 : attempt === 2 ? 0.5 : 0.3;
  const stream = attempt < 3;
  const maxTokens = attempt < 3 ? 32768 : 65536;
  const requestJson = JSON.stringify({ model, messages: attemptMessages, max_tokens: maxTokens, temperature: temp, stream });
  const res = await fetch(endpoint, { method: 'POST', headers, body: requestJson, signal: AbortSignal.timeout(600_000) });
  // ... extract, parse, validate
}
```

### 8.2 JSON repair WAJIB handle edge cases (FR-GEN-04)

`repairTruncatedJson` (`llm-client.ts:50-100`) + **pre-parse sanitizer** WAJIB handle:

| Edge case | Strategi |
|---|---|
| Truncated string (`"key":"unterminated`) | Count unescaped quote, tutup dengan `"` sebelum bracket close |
| Newline mentah (`U+000A`) di string value | Escape -> `\\n` (JSON standar larang newline mentah dalam string) |
| Tab mentah (`U+0009`), CR (`U+000D`) | Escape -> `\\t`, `\\r` |
| Control char lain (`U+0000..U+001F`) | Escape -> `\\uXXXX` (hex 4 digit) |
| Trailing data setelah JSON valid | Deteksi brace/bracket balance + outside-string, strip trailing non-whitespace |
| Trailing `"key":` tanpa value | Hapus trailing key |
| Trailing comma | Hapus |
| BOM (`\uFEFF`) di awal | Strip |
| Line ending `\r\n` / `\r` | Normalize ke `\n` |
| Escape rusak (`\\"` terpotong) | Deteksi count quote ganjil di string terakhir, tambah closing |

Urutan pemanggilan (`llm-client.ts:353-375` extend):
```typescript
const jsonStr = extractJsonFromContent(content);
const sanitized = sanitizeJsonString(jsonStr);  // BARU: BOM, line-ending, control char, trailing data
let parsedJson: unknown;
try {
  parsedJson = JSON.parse(sanitized);
} catch {
  const repaired = repairTruncatedJson(sanitized);
  try {
    parsedJson = JSON.parse(repaired);
  } catch (repairErr) {
    throw new Error(`Response bukan JSON valid: ${repairErr.message}`);
  }
}
```

### 8.3 Validation failures WAJIB categorized + fed back ke LLM (FR-GEN-05)

- Catch `ZodError` dari `PromptPackageSchema.parse` (`llm-client.ts:379`).
- `categorizeError` (`llm-client.ts:18-44`) -> kategori `VALIDATION`.
- Extract `ZodError.issues` -> format **corrective message** sebagai `role: 'user'` (bukan 'system', hindari conflict role ordering OpenAI-compatible):
```
Validasi gagal pada attempt sebelumnya. Perbaiki output JSON agar sesuai schema.

Detail error:
- Field: scenes.2.audio_specs.2.sfx_list | Error: Expected string, received array | Expected: string | Received: array

Aturan:
- sfx_list: array of string (contoh: ["footstep","door creak"]).
- Jangan gunakan newline mentah dalam string value, gunakan \n escape.

Output HANYA JSON object valid, TANPA code block, TANPA teks tambahan.
```
- Append ke `messages` array attempt berikutnya (FR-GEN-03).
- Log ke `generation_logs.logsJson` shape `{ stage: 'retry_correction', attempt, prevErrorCategory, prevErrorIssues, correctivePrompt, timestamp }` (`SRS S3.1.5`).

### 8.4 Partial success WAJIB persisted + failure category logged (FR-GEN-06)

- `safeDbOp` return null di scene-level op -> push `scene.orderNo` ke `partialSceneIds: number[]`.
- `projects.status`: `'partial'` bila `partialSceneIds.length > 0`, `'complete'` bila 0 (`SRS S3.1.6`).
- `generation_logs.status`: `'success'` (warnings + partialSceneIds empty), `'partial'` (warnings OR partial non-empty), `'fail'` (LLM throw / unhandled).
- `errorMessage` format `[CATEGORY] message` (`llm-client.ts:422-423`).
- Unhandled catch (`route.ts:520-548`) WAJIB pakai `categorizeError` spesifik (TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE/UNKNOWN/DB_ERROR), **JANGAN** generic `PROVIDER_ERROR` (`SRS FR-GEN-06`).

### 8.5 SSE events WAJIB include retryCount + failureCategory

- `log` event (`API_CONTRACT S9.1.3`): `{ level, message, timestamp, retryCount?, failureCategory?, correctivePrompt? }`.
- `error` event (`route.ts:262,296,548`): `{ code, message, retryCount, failureCategory }`.
- `done` event (`route.ts:518`): `{ result, warnings, generationLogId, partialSceneIds? }`.
- `stage` events: tetap (`starting` -> `character_profiles` -> `llm_calling` -> ... -> `saving` -> `done`).

---

## 9. Error Handling

### 9.1 Error envelope (`lib/api/error.ts`)

Helper `errorResponse(code, status, message?, details?)` (`route.ts:4`, `error.ts:10-20`). Shape TERBUKTI (`API_CONTRACT S4.4`):
```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { "issues": [...] } },
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```
- `code`: enum `ErrorCodeEnum` (`schemas.ts:237-249`): `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `PROVIDER_ERROR`, `TIMEOUT`, `INTERNAL`, `BAD_GATEWAY`, `SERVICE_UNAVAILABLE`.
- `traceId`: UUID v4 per request (`error.ts:4,17`).
- **WAJIB** pakai `errorResponse` di semua route handler. **JANGAN** `NextResponse.json({ error: '...' })` ad-hoc.
- Sukses: `successResponse<T>(data)` -> `{ data }` atau `{ data, pagination }`. Delete: `noContentResponse()` -> 204 (`error.ts:39-45`).

### 9.2 Categorize LLM errors

`categorizeError(msg: string)` (`llm-client.ts:18-44`):
- `TIMEOUT`: AbortError / "timeout".
- `NETWORK`: ECONNREFUSED/ENOTFOUND/fetch failed.
- `VALIDATION`: ZodError / `.issues`.
- `HTTP`: msg startsWith "Provider HTTP".
- `JSON_PARSE`: msg includes "JSON"/"parse".
- `UNKNOWN`: fallback.
- `DB_ERROR` (extend SRS FR-GEN-06): DB failure persist.

### 9.3 safeDbOp wrap DB errors

`safeDbOp<T>(op): Promise<T | null>` (`route.ts:35-51`) catch DB error, log prefix `[generate]`, return null. **JANGAN** rethrow di persist block (partial acceptable). TAPI track `partialSceneIds` + log kategori.

### 9.4 error.tsx boundary

- `error.tsx` per route segment = Client Component, render `PageErrorBoundary` (`UIUX_SPEC S3.7`).
- `role="alert"`, Alert destructive + Button "Retry" (reload page).
- **JANGAN** expose stack trace ke user. Log ke server console, tampilkan `traceId` untuk support.

### 9.5 No data leak di error message

- Error message ke client: generic + actionable (`UIUX_SPEC S12.3`). **JANGAN** include API key, DB connection string, internal path file.
- Detail Zod issues boleh tampilkan (path + message) untuk debugging generate (`UIUX_SPEC S12.3` VALIDATION).
- `traceId` untuk korelasi server log.

---

## 10. Aturan Keamanan Koding

### 10.1 AES-256-GCM untuk API key at rest (`lib/crypto/aes.ts`)

- Algo `aes-256-gcm` (`aes.ts:4`). Key dari `ENCRYPTION_KEY` env (32 byte base64, `aes.ts:6-12`).
- `encryptToString`/`decryptFromString` JSON serialized (`aes.ts:37-43`). IV 12 byte + auth tag.
- API key provider WAJIB encrypt sebelum persist `provider_configs.apiKeyEncrypted` (`schema.ts:24`).
- `maskApiKey`: `****` + last 4 char untuk display (`aes.ts:45-49`). **JANGAN** return plaintext API key di response. DTO `ProviderConfigDTO.apiKeyMasked` (`API_CONTRACT S9.22`).

### 10.2 bcrypt untuk password

- `bcryptjs ^2.4.3` (`package.json:43`). `bcrypt.compare` di authorize (`config.ts:31`). `bcrypt.hash` di register (`RAG G4` ASUMSI).
- Hash cost: minimal 10 (bcrypt default). **JANGAN** simpan password plaintext.

### 10.3 NextAuth session

- NextAuth v5 Credentials (`config.ts:11-38`). Session JWT edge-safe jose (`middleware.ts:83-87`).
- `NEXTAUTH_SECRET` env wajib (`config.ts:8-9`).
- Session augmentation `user.id: number` (`config.ts:42-50`).
- **JANGAN** simpan sensitive di JWT payload (JWT decode client-side bila base64). Hanya `user.id`, `user.email`, `user.role`.

### 10.4 Rate limit

- In-memory Map single-instance, 10 req/min per user/IP untuk `POST /api/v1/generate` (`middleware.ts:18-36,109-127`).
- **ASUMSI** prod needs Redis (out-of-scope v0.1.0, `middleware.ts:18` comment).
- 429 response: `RATE_LIMITED` + `Retry-After: 60` header (`API_CONTRACT S6.2`).

### 10.5 Middleware auth gate

- `src/middleware.ts` edge runtime: `getToken` jose decode JWT (`middleware.ts:83-87`). Null + non-public path -> 401 redirect `/login`.
- Public paths (`middleware.ts:6-16`): `/`, `/login`, `/register`, `/api/auth`, `/api/v1/auth`, `/api/v1/health`, `/_next`, favicon.
- Ownership check di route handler (Node runtime): `project.userId === session.user.id` (`route.ts:137-139`). Bila mismatch -> 404 (jangan bocorkan existence) atau 409 (`route.ts:138`).

### 10.6 No secrets in repo

- `.env.local` tidak di-commit (`.gitignore`). `.env.example` hanya nama key, tidak nilai (`RAG S10.5`).
- Server-only env: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `BLOB_READ_WRITE_TOKEN` - **TIDAK** prefix `NEXT_PUBLIC_` (`RAG S10.5`).
- Public env: `NEXT_PUBLIC_APP_URL` (OpenRouter referer, `provider-registry.ts:36`).
- `server-only` package guard (`package.json:58`) cegah modul server di-import client.

### 10.7 Input validation di setiap API boundary

- Setiap route handler WAJIB `XxxSchema.safeParse(body)` sebelum konsumsi (`route.ts:70-88`).
- Path param `id` WAJIB parse + validate `Number.isNaN`.
- Query param `page`/`limit` WAJIB parse int + clamp (limit max 100).
- Upload `multipart/form-data`: validasi `tipe` enum (`schemas.ts:173`), `mimeType` image/*, `sizeBytes` max (ASUMSI 10MB).

### 10.8 No eval / Function on LLM output

- **JANGAN** `eval()` atau `new Function()` pada string dari LLM / user input. Selalu `JSON.parse` (safe parser) + Zod validate.
- LLM output = data, bukan kode. Tidak ada code execution dari LLM response.

### 10.9 Sanitasi output (XSS prevention)

- React auto-escape JSX. **JANGAN** `dangerouslySetInnerHTML` kecuali string dari sumber trusted + sanitize (DOMPurify).
- Markdown export (`markdown.template.ts:4-173`): escape karakter markdown special bila dari user input (`title`, `storyDescription`).
- Log viewer: render log `message` sebagai text, bukan HTML (`UIUX_SPEC S6.7`).

---

## 11. Standar Testing

### 11.1 Framework + coverage target

| Jenis | Tool | Lokasi | Target coverage | Citation |
|---|---|---|---|---|
| Unit | vitest + @vitest/coverage-v8 | `src/lib/**/*.test.ts` | `lib/ai` + `lib/validation` >=80%, lainnya >=60% | `package.json:84,73`, `RAG S12 G10` |
| Integration | vitest (mock DB) | `src/lib/**/*.test.ts` | repo function dengan mock drizzle | `RAG S12 G10` |
| E2E | @playwright/test | `e2e/*.spec.ts` | flow: login, generate (mock LLM), export, settings CRUD | `package.json:64` |

Coverage report: `pnpm test --coverage` (`package.json:73` `@vitest/coverage-v8`). Threshold di `vitest.config.ts` (ASUMSI ada, `RAG S12 G15`).

### 11.2 Struktur test

```typescript
// src/lib/ai/llm-client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePromptPackage } from './llm-client';

describe('generatePromptPackage', () => {
  describe('retry loop (FR-GEN-03)', () => {
    it('attempt 2 appends corrective message (FR-GEN-05)', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ sfx_list: ['footstep','door'] }) })  // attempt 1: array (Bug A shape)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ sfx_list: 'footstep,door' }) });      // attempt 2: string (fixed)
      // ... assert messages[attempt2].length > messages[attempt1].length
      // ... assert messages[attempt2][last].content includes 'sfx_list' + 'array'
    });
    it('attempt 3 uses stream:false + max_tokens:65536', async () => { ... });
  });
  describe('JSON repair (FR-GEN-04)', () => {
    it('parses newline mentah in string value', () => { ... });
    it('strips trailing data after valid JSON', () => { ... });
    it('repairs unterminated string', () => { ... });
  });
});
```

### 11.3 Penamaan test

- File: `<nama-modul>.test.ts` (vitest), `e2e/<flow>.spec.ts` (playwright).
- `describe('<function name> (<FR ref>)')`, `it('<behavior yang diuji> (<AC ref>)')`. Contoh: `it('parses sfx_list array from LLM (AC-GEN-02)', ...)`.

### 11.4 WAJIB: test generation pipeline end-to-end dengan mock LLM yang return bug shapes

> **Wajib** ada test yang prove fix Bug A + Bug B. Mock LLM fetch return:
> 1. `sfx_list` sebagai array (Bug A shape) -> assert `PromptPackageSchema.parse` sukses (union) + normalizer coerce -> string comma-separated.
> 2. JSON dengan newline mentah di `prompt_text` (Bug B shape) -> assert `sanitizeJsonString` escape -> `JSON.parse` sukses.
> 3. JSON truncated + unterminated string -> assert `repairTruncatedJson` tutup -> parse sukses.

Test ini **BLOCKER**. Tanpa lulus, PR tidak merge (`PRD AC-GEN-02, AC-GEN-04`).

### 11.5 Test ownership check

- Setiap endpoint yang punya `[id]` path param WAJIB test ownership: mock `getProjectById(id, otherUserId)` return null -> assert 404/409.

---

## 12. Linting / Formatting

### 12.1 ESLint

- Config `.eslintrc.json` (eslint ^9.17 + eslint-config-next ^15.1 + @typescript-eslint ^8.18, `package.json:76-78,70-71`).
- `pnpm lint` WAJIB lulus sebelum commit.
- Aturan ON: `@typescript-eslint/no-explicit-any` (error), `@typescript-eslint/switch-exhaustiveness-check` (warn -> error), `react/no-unescaped-entities`, `next/no-html-link-for-pages`.

### 12.2 Prettier

- `prettier ^3.4` + `prettier-plugin-tailwindcss ^0.6` (`package.json:80,81`).
- **ASUMSI** config ada (`.prettierrc`/`prettier.config.js` - tidak diverifikasi). Rekomendasi:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```
- `pnpm format` (ASUMSI script ada). WAJIB run sebelum commit.

### 12.3 Type-check

- `pnpm tsc --noEmit` atau `pnpm build` (Next.js build run tsc) (`package.json`).
- **WAJIB** lulus tanpa error. Warning boleh tapi harus di-track.

### 12.4 Pre-commit hook (rekomendasi)

- `husky` + `lint-staged`: jalankan `eslint --fix` + `prettier --write` + `tsc --noEmit` pada staged file.
- **ASUMSI** belum ada (tidak diverifikasi). Rekomendasi setup.

---

## 13. Git / Commit / PR

### 13.1 Conventional commits

Format: `<type>(<scope>): <subject>`. Scope = modul (`ai`, `db`, `validation`, `auth`, `ui`, `generate`, `api`).

| Type | Kapan | Contoh |
|---|---|---|
| `feat` | fitur baru | `feat(ai): union sfx_list schema + normalizer (FR-GEN-02)` |
| `fix` | bug fix | `fix(ai): retry vary request body + corrective prompt (FR-GEN-03/05)` |
| `docs` | dokumentasi | `docs: tambah CODING_RULES.md` |
| `test` | tambah/ubah test | `test(ai): mock LLM bug shapes untuk Bug A+B fix` |
| `refactor` | refactor tanpa behavior change | `refactor(db): konsolidasi scene-audio repo naming` |
| `chore` | tooling, dep | `chore: upgrade drizzle-kit 0.30 -> 0.31` |
| `style` | formatting only | `style: prettier format lib/ai` |
| `ci` | CI/CD | `ci: tambah db:migrate di deploy hook` |
| `perf` | performance | `perf: add index (user_id, deleted_at) projects` |

### 13.2 Branch

- `kebab-case`, prefix tipe: `feat/<short>`, `fix/<short>`, `docs/<short>`, `test/<short>`, `refactor/<short>`.
- Branch dari `main` (default). PR kembali ke `main`.

### 13.3 PR kecil + atomic commit

- 1 PR = 1 fitur/fix focus. Hindari PR >500 baris diff (review sulit).
- 1 commit = 1 perubahan logis. Hindari commit "wip" / "fix typo" bercampur fitur.
- Atomic commit: `feat(ai): union schema` + `fix(ai): normalizer sfx_list` = 2 commit terpisah bila logika beda.

### 13.4 No secrets in commits

- `.env.local` di `.gitignore`. **JANGAN** `git add .env.local`.
- Pre-commit: `git-secrets` / `trufflehog` scan (rekomendasi).
- API key, password, token: **JANGAN** hardcode di kode. Pakai env.

### 13.5 Run tests sebelum push

- `pnpm lint && pnpm format --check && pnpm test --coverage && pnpm build` WAJIB lulus sebelum `git push` (`PROJECT_ARCHITECTURE S12` CI workflow).
- Branch protection: require status check (CI) pass sebelum merge.

---

## 14. Review Checklist (Definition of Done koding)

Sebelum PR dianggap selesai, reviewer WAJIB cek:

### 14.1 Schema<->Prompt alignment (Bug A prevention)
- [ ] Setiap field baru di `PromptPackageSchema` punya deklarasi tipe eksplisit di `buildSystemPrompt`?
- [ ] Field `*_list` di-schema sebagai array atau prompt eksplisit "comma-separated string"?
- [ ] Contoh JSON (`JSON_SCHEMA_EXAMPLE`) mendemokan SEMUA enum value (mis. `audio_type: 'sfx'` + `sfx_list` terisi)?
- [ ] Tidak ada field prompt ambigu ("Untuk sfx: sfx_list" tanpa tipe)?

### 14.2 Retry + repair (Bug B prevention)
- [ ] Retry loop rebuild `requestJson` per attempt (messages + temperature + stream + max_tokens berbeda)?
- [ ] Corrective message dari `ZodError.issues` di-append sebagai `role: 'user'`?
- [ ] `sanitizeJsonString` handle BOM, line-ending, newline mentah, control char, trailing data?
- [ ] `repairTruncatedJson` handle truncated string, trailing key/comma, unmatched bracket?

### 14.3 TypeScript quality
- [ ] Tidak ada `any` tanpa `eslint-disable` + justifikasi?
- [ ] Type domain via `z.infer`, bukan re-declare interface manual?
- [ ] Discriminated union untuk error category, `switch` exhaustive?
- [ ] `readonly` untuk array/object immutable?

### 14.4 Boundary validation
- [ ] Setiap API route `safeParse` body input?
- [ ] LLM output `PromptPackageSchema.parse` sebelum konsumsi?
- [ ] Path param `id` parse + `Number.isNaN` check?

### 14.5 Error handling
- [ ] Pakai `errorResponse` helper (envelope `{error, traceId}`)?
- [ ] `categorizeError` spesifik (bukan generic `PROVIDER_ERROR`) di unhandled catch?
- [ ] `safeDbOp` track `partialSceneIds` + set status `partial`?
- [ ] `error.tsx` boundary per route segment?
- [ ] Tidak ada data leak (API key, stack trace) di error message client?

### 14.6 Security
- [ ] API key AES-256-GCM encrypt sebelum persist? `maskApiKey` di response?
- [ ] Password bcrypt hash (min cost 10)?
- [ ] Ownership check `project.userId === session.user.id` di endpoint `[id]`?
- [ ] Tidak ada `eval`/`new Function` di LLM output?
- [ ] Tidak ada secret hardcoded (env only)?
- [ ] `server-only` import di modul server?

### 14.7 i18n + a11y (frontend)
- [ ] Semua label UI via `t('key')` (next-intl), tidak hardcode?
- [ ] Namespace `messages/{id,en}.json` lengkap untuk key baru?
- [ ] `:focus-visible` outline tidak hilang (`globals.css:42-45`)?
- [ ] `aria-label` di Button icon tanpa text?
- [ ] `role="log"` + `aria-live` di `LogViewer`?
- [ ] `prefers-reduced-motion` dihormati (framer-motion + auto-scroll)?
- [ ] Kontras warna WCAG 2.1 AA (4.5:1 text, 3:1 large text)?

### 14.8 Design tokens (frontend)
- [ ] Pakai CSS variable dari `globals.css` (`--color-primary`, `--radius`, dll), tidak hardcode hex?
- [ ] Pakai komponen `shadcn/ui` dari `src/components/ui/`, tidak re-implement primitive?
- [ ] Pakai `cn()` util (`clsx` + `tailwind-merge`) untuk className merge?

### 14.9 Testing
- [ ] Unit test `*.test.ts` untuk modul `lib/ai` + `lib/validation` baru?
- [ ] Coverage `lib/ai` + `lib/validation` >=80%?
- [ ] Mock LLM test return bug shapes (array `sfx_list`, JSON newline mentah)?
- [ ] E2E playwright untuk flow utama (generate, export)?
- [ ] Ownership check test (mock `getProjectById(id, otherUserId)` -> 404)?

### 14.10 Git hygiene
- [ ] Conventional commit message?
- [ ] Branch `kebab-case` + prefix tipe?
- [ ] `pnpm lint && pnpm test --coverage && pnpm build` lulus?
- [ ] Tidak ada secret di commit?
- [ ] PR <500 baris diff, atomic commit?

---

## 15. Larangan Umum

| # | Larangan | Alasan |
|---|---|---|
| L1 | Mutasi langsung state React tanpa `setState`/`useReducer` | Bug state inconsistent |
| L2 | Magic number literal tanpa konstanta | Mis. `32768` -> `MAX_TOKENS_DEFAULT`, `600_000` -> `FETCH_TIMEOUT_MS` |
| L3 | Nesting >4 level (if/for/switch) | Baca sulit, pecah ke fungsi |
| L4 | `console.log` tertinggal di kode produksi | Hanya `console.error`/`console.warn` dengan prefix `[generate]`/`[llm]` (`PROJECT_ARCHITECTURE S11.4`) |
| L5 | Dependency tidak di-pin di `package.json` | Pakai exact version atau `^` dengan lockfile deterministik |
| L6 | `any` tanpa `eslint-disable` + justifikasi | Type safety hilang |
| L7 | `as` type assertion tanpa verifikasi runtime | Bypass type check, runtime bug |
| L8 | String concat SQL | SQL injection. Pakai Drizzle query builder atau `sql\`... ${value} ...\`` |
| L9 | `eval`/`new Function` di LLM output / user input | RCE risk |
| L10 | `dangerouslySetInnerHTML` tanpa sanitize (DOMPurify) | XSS |
| L11 | Hardcode warna/spacing di komponen (bukan design token) | Inkonsisten theme. Pakai `--color-*` / Tailwind utility |
| L12 | Hardcode label UI string (bukan `t('key')`) | i18n break |
| L13 | `fetch` di Client Component bila Server Component bisa | Over-fetch, hydration issue |
| L14 | Import `db`/`auth config`/`crypto` di `components/` | Layer violation, server secret bocor ke client |
| L15 | Route handler >400 baris tanpa ekstrak service | Baca sulit, test sulit |
| L16 | Fungsi >50 baris tanpa pecah | Single responsibility, testable |
| L17 | Zod schema tersebar di route/component (bukan `lib/validation/schemas.ts`) | Single source of truth hilang |
| L18 | Re-declare interface manual duplikat Zod schema | Drift type, bug |
| L19 | Retry kirim request body identik (Bug B pattern) | Deterministic bug retry gagal identik |
| L20 | Trust LLM output tanpa `PromptPackageSchema.parse` (Bug A pattern) | Type unsafe, runtime bug |
| L21 | `sfx_list` field name dengan `z.string()` schema | Linguistik "list" = array, LLM kirim array, reject. Pakai union atau rename |
| L22 | Generic `PROVIDER_ERROR` di unhandled catch (tanpa `categorizeError`) | User tidak actionable |
| L23 | `safeDbOp` tanpa track `partialSceneIds` | Silent partial (Bug D), user lihat complete padahal scene hilang |
| L24 | `pnpm db:push` di prod | Skip migration history |
| L25 | Secret (API key, password, token) di commit / hardcoded | Security breach |

---

## 16. Standar Frontend (bila ada UI)

### 16.1 Design tokens WAJIB (cite `UIUX_SPEC S2`)

- Warna: CSS variable `--color-*` dari `src/app/globals.css:5-82`. **JANGAN** hardcode hex (`#7c3aed`) di komponen. Pakai Tailwind utility (`bg-primary`, `text-destructive`, `border-border`) atau `var(--color-primary)`.
- Font: `--font-sans` (Inter), `--font-mono` (JetBrains Mono) dari `globals.css:33-34`.
- Radius: `--radius: 6px` (`globals.css:35`). Pakai `rounded-md` (= `--radius`).
- Spacing: Tailwind 4 default (base 4px). `space-1`..`space-16`.
- Shadow: Tailwind default (`shadow-sm`/`md`/`lg`/`xl`).
- Motion: durasi 150ms default, 300ms dialog. `prefers-reduced-motion` WAJIB hormati (`globals.css:74-82`).

### 16.2 Komponen WAJIB pakai shadcn/ui primitives

- Primitive di `src/components/ui/*.tsx` (15 file: Alert, Badge, Button, Card, Dialog, DropdownMenu, Input, Label, ScrollArea, Select, Skeleton, Switch, Table, Tabs, Textarea, `UIUX_SPEC S3.1`).
- Composite di `src/components/{generate,landing,dashboard,projects,settings,common}/*.tsx` (`UIUX_SPEC S3.2-S3.7`).
- **JANGAN** re-implement Dialog/Select/Tabs native. Pakai radix primitive dari shadcn.
- `cn()` util (`clsx` + `tailwind-merge`) untuk className merge. Tidak string concat.

### 16.3 Aksesibilitas WCAG 2.1 AA WAJIB (cite `UIUX_SPEC S7`)

- Kontras: 4.5:1 text normal, 3:1 large text (18px+ / 14px bold). Verifikasi token (`UIUX_SPEC S7.1`): `warning` `#d97706` di bg putih = 3.4:1 FAIL untuk text normal -> WAJIB bold >=14px atau bg `#d97706` + text putih.
- Keyboard nav: semua interaktif reachable via Tab. radix handle focus trap. `:focus-visible` outline `2px solid --color-ring` offset 2px (`globals.css:42-45`) - **WAJIB tidak hilang**.
- ARIA: shadcn set `role`/`aria-expanded`/`aria-controls` otomatis. Form: `<Input>` wajib `<Label htmlFor>`. Error: `aria-invalid="true"` + `aria-describedby`. LogViewer: `role="log"` + `aria-live="polite"` (streaming) / `"assertive"` (error) - **ASUMSI belum di-set, rekomendasi tambah** (`UIUX_SPEC S7.3`).
- Alt text: image asset `alt` dari filename/label. Logo `alt="PromptFlow"`. Icon dekoratif `aria-hidden="true"`, aksi `aria-label`.
- Reduced motion: `prefers-reduced-motion: reduce` -> durasi 0.01ms (`globals.css:74-82`). framer-motion landing WAJIB cek `useReducedMotion()` (`UIUX_SPEC A6`).

### 16.4 Struktur komponen ikut `PROJECT_ARCHITECTURE S6`

- `src/components/ui/` - shadcn primitive (15 file).
- `src/components/generate/` - 9 composite generate (`GenerateForm`, `LogViewer`, `ResultTabs`, `AudioPanel`, `SceneTransitionCard`, `VoiceTypeSelector`, `TemplatePicker`, `ImagePromptDisplay`, `DropzoneUploader`).
- `src/components/landing/` - 18 composite landing.
- `src/components/dashboard/` - 5 composite dashboard.
- `src/components/projects/` - 3 composite projects.
- `src/components/settings/` - 2 composite settings.
- `src/components/common/` - 7 composite common (`AppHeader`, `LanguageToggle`, `ThemeToggle`, `Pagination`, `PageLoadingSkeleton`, `PageErrorBoundary`, `CopyButton`, `ChangelogBanner`).
- **JANGAN** buat komponen di luar struktur folder ini tanpa justifikasi.

### 16.5 SSE consumer UI observability (Bug A/B fix UX)

- `LogViewer` (`log-viewer.tsx`) WAJIB:
  - Auto-open saat streaming (`:44-46`).
  - Auto-scroll bottom (`:51`, `scrollIntoView({behavior:'smooth'})`).
  - Level badge: `info` (blue), `warn` (yellow), `error` (red). **ASUMSI** saat ini hardcoded `bg-{blue,yellow,red}-100` (`:14-19`) - rekomendasi pakai token `--color-info`/`--color-warning`/`--color-destructive`.
  - Tampilkan kategori error sebagai prefix `[CATEGORY]` di message.
  - Tampilkan `retryCount` + `correctivePrompt` sebagai log entry terpisah.
- `ResultTabs` (`result-tabs.tsx`) WAJIB:
  - Warning alert "Scene {partialSceneIds.join(', ')} gagal persist - regenerate perlu" bila `partialSceneIds` non-empty (`SRS FR-GEN-06`).
  - Loading skeleton per tab content.
- `GenerateForm` (`generate-form.tsx`) WAJIB:
  - `ElapsedTimer` (`:43-50`) update via `heartbeat` event.
  - Stage label live via `stage` event.
  - Submit Button `disabled` + spinner + `aria-busy="true"` saat streaming.

---

## 17. Citations Index

| Citation | Klaim |
|---|---|
| `RAG S2` | DB = Turso/libSQL BUKAN Postgres |
| `RAG S3.1` | Struktur folder `src/{app,components,lib}/` |
| `RAG S3.2` | 24 route files API v1, runtime nodejs generate |
| `RAG S3.3` | Repository pattern 12 file |
| `RAG S3.5` | next-intl id/en, `[locale]` segment |
| `RAG S5` | Generation pipeline end-to-end |
| `RAG S6` | PromptPackageSchema struktur |
| `RAG S6.1, S6.3` | SceneAudioSpecSchema vs SceneAudioSchema duplikat (Bug F) |
| `RAG S7.1, S7.3` | Prompt instruction ambigu `sfx_list` (Bug A root) |
| `RAG S8.2.1` | extractJsonFromContent pick largest |
| `RAG S8.2.2` | repairTruncatedJson limitation (Bug B) |
| `RAG S8.2.3` | Retry loop body sama (Bug B), categorizeError |
| `RAG S10.1, S10.4` | NextAuth v5 + middleware gate |
| `RAG S10.3` | AES-256-GCM |
| `RAG S10.5` | Env vars server-only |
| `RAG S11 Bug A` | sfx_list VALIDATION root cause |
| `RAG S11 Bug B` | JSON_PARSE repair fail |
| `RAG S11 Bug D` | safeDbOp partial silent |
| `RAG S11 Bug E` | double validation redundant |
| `RAG S11 Bug F` | schema duplikat inkonsisten |
| `RAG S12 G4` | register bcrypt.hash ASUMSI |
| `RAG S12 G10` | test coverage ASUMSI |
| `package.json:25,46,47` | @libsql/client, drizzle-kit, drizzle-orm |
| `package.json:50,51,52,61` | next, next-auth, next-intl, zod |
| `package.json:58` | server-only guard |
| `package.json:64,73,84` | playwright, coverage-v8, vitest |
| `package.json:76-78,80,81` | eslint, prettier |
| `package.json:88-90` | pnpm, node engines |
| `tsconfig.json:7` | strict mode |
| `client.ts:2-13` | drizzle libsql snake_case casing |
| `schema.ts:193` | scene_audio.sfxList text (Bug A DB side) |
| `schemas.ts:29` | color_palette union (precedent normalizer) |
| `schemas.ts:39-55` | SceneAudioSpecSchema (sfx_list string, Bug A) |
| `schemas.ts:52` | sfx_list z.string() ROOT Bug A |
| `schemas.ts:106-124` | PromptPackageSchema |
| `schemas.ts:181-200` | GenerateInputSchema camelCase DTO |
| `schemas.ts:237-249` | ErrorCodeEnum |
| `prompt-builder.ts:75-97` | JSON_SCHEMA_EXAMPLE (no sfx) |
| `prompt-builder.ts:137-168` | buildSystemPrompt return |
| `prompt-builder.ts:152` | AUDIO_SPECS ambigu "Untuk sfx: sfx_list" |
| `llm-client.ts:18-44` | categorizeError |
| `llm-client.ts:50-100` | repairTruncatedJson limitation |
| `llm-client.ts:237-424` | generatePromptPackage retry loop |
| `llm-client.ts:274,287` | retry body sama (Bug B) |
| `llm-client.ts:379` | PromptPackageSchema.parse (Bug A site) |
| `route.ts:19-21` | runtime nodejs maxDuration 300 force-dynamic |
| `route.ts:35-51` | safeDbOp swallow error (Bug D) |
| `route.ts:70-88` | safeParse input boundary |
| `route.ts:137-139` | ownership check getProjectById(id, userId) |
| `route.ts:262,296,548` | SSE error event generic PROVIDER_ERROR |
| `route.ts:518` | done event |
| `route.ts:558-563` | SSE headers |
| `aes.ts:4-43` | AES-256-GCM encrypt/decrypt |
| `aes.ts:45-49` | maskApiKey |
| `config.ts:11-38` | NextAuth v5 Credentials + bcrypt.compare |
| `middleware.ts:6-16` | public paths |
| `middleware.ts:18-36,109-127` | rate limit 10/min |
| `middleware.ts:38-54` | locale strip + localize |
| `middleware.ts:83-87` | getToken jose edge-safe |
| `error.ts:10-20` | errorResponse envelope |
| `error.ts:39-45` | successResponse, noContentResponse |
| `DATABASE_SCHEMA S3.10` | scene_audio sfxList text |
| `DATABASE_SCHEMA S4.2` | normalizer sfx_list array->string |
| `DATABASE_SCHEMA S8.2` | migration workflow drizzle-kit |
| `API_CONTRACT S4.4` | error envelope shape |
| `API_CONTRACT S9.1.3` | SSE event types |
| `UIUX_SPEC S2` | design tokens warna/font/radius |
| `UIUX_SPEC S3.1, S3.2` | shadcn primitive + composite |
| `UIUX_SPEC S7` | WCAG 2.1 AA aksesibilitas |
| `UIUX_SPEC S9.3` | i18n namespace |
| `UIUX_SPEC S12.3` | error kategori message actionable |
| `SRS S3.1.1..S3.1.8` | FR-GEN-01..08 spec |
| `SRS S3.1.6` | FR-GEN-06 partial persist + partialSceneIds |
| `PROJECT_ARCHITECTURE S5` | layering dependency direction |
| `PROJECT_ARCHITECTURE S6` | struktur folder |
| `PROJECT_ARCHITECTURE S14` | ADR-04 safeDbOp vs transaction |

---

## 18. ASUMSI Tracker

| # | Item | Status | Catatan |
|---|---|---|---|
| A1 | `.prettierrc` config eksak | ASUMSI | Tidak diverifikasi, rekomendasi nilai diberikan |
| A2 | `husky` + `lint-staged` pre-commit hook | ASUMSI | Belum diverifikasi ada |
| A3 | `vitest.config.ts` coverage threshold | ASUMSI | `RAG S12 G15` file ada, isi tidak dibaca |
| A4 | Register route `bcrypt.hash` cost | ASUMSI | `RAG G4` route ada, isi tidak dibaca |
| A5 | `authConfig` edge config (`src/lib/auth/edge`) | ASUMSI | Diimpor `config.ts:6`, isi tidak dibaca |
| A6 | `serverActions` experiment enabled di `next.config.ts` | ASUMSI | Next.js 15 default, tidak diverifikasi eksplisit |
| A7 | File naming composite `kebab-case.tsx` vs `PascalCase.tsx` | ASUMSI | Repo pakai kebab (`log-viewer.tsx`), export PascalCase. Aturan: export PascalCase, file bebas konsisten. |
| A8 | Repository naming `.repo.ts` vs `.repository.ts` | ASUMSI inkonsisten | Aturan: seragam `.repo.ts` |
| A9 | `messages/{id,en}.json` isi lengkap | ASUMSI | `RAG G12` file ada, isi tidak dibaca |
| A10 | `LogViewer` `aria-live` belum di-set | ASUMSI | `UIUX_SPEC A5` rekomendasi tambah |

---

> Dokumen ini = panduan operasional koding untuk agent eksekutor. Setiap aturan SPESIFIK ke stack PromptFlow, bukan generik. Aturan LLM pipeline (S7.5, S8) dikodifikasi dari pelajaran Bug A + Bug B agar tidak terulang. Reviewer WAJIB pakai checklist S14 sebelum approve PR. Selaras `PRD` (why) + `SRS` (how) + `PROJECT_ARCHITECTURE` (struktur) + `DATABASE_SCHEMA` (data) + `UIUX_SPEC` (frontend) + `API_CONTRACT` (API). Dokumen turunan: `TEST_PLAN.md`, `AGENTS.md`.
