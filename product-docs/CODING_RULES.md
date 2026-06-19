# Coding Rules & Standards — PromptFlow

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `product-docs/RAG-CONTEXT.md` + `product-docs/SRS.md` + `product-docs/DATABASE_SCHEMA.md` + `product-docs/PROJECT_ARCHITECTURE.md` + `product-docs/API_CONTRACT.md` + `product-docs/UIUX_SPEC.md` (bersitasi per klaim penting)
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** Dokumen ini menurunkan SRS §4 (tech stack), §9 (keamanan), §11 (verifikasi) + PROJECT_ARCHITECTURE §5 (folder) + DATABASE_SCHEMA §8 (Drizzle) + API_CONTRACT §3/§7/§8/§9 (envelope, SSE, Zod) + UIUX_SPEC §2/§3 (tokens, komponen) menjadi aturan koding konkret & spesifik per stack. Item tanpa bukti eksplisit ditandai "ASUMSI". Identifier teknis apa adanya.

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
10. PR Review Checklist
11. CI/CD
12. Standar Frontend (Design Tokens & A11y)
13. Larangan Umum
14. Asumsi Coding + Referensi

---

## 1. Pendahuluan & Prinsip Dasar

### 1.1 Tujuan

Aturan koding konkret & spesifik untuk stack PromptFlow supaya agent
eksekutor menulis kode konsisten, type-safe, aman, dan mudah dirawat. Bukan
generik — tiap aturan tertelusur ke stack proyek. Sitasi: `SRS.md 1.1`.

### 1.2 Stack Berlaku

| Lapisan | Teknologi | Versi | Bukti |
|---|---|---|---|
| Frontend + Backend | Next.js (App Router, fullstack satu repo) | stabil terkini (15+/16+) | `SRS.md 4.1` ; `RAG-CONTEXT.md 2.1` |
| Bahasa | TypeScript (strict) | stabil terkini | `SRS.md 4.1` |
| Styling | Tailwind CSS v4 | v4 | `SRS.md 4.1` ; `UIUX_SPEC.md 2.10` |
| Komponen UI | shadcn/ui (copy-paste) | latest stabil | `SRS.md 4.1` ; `UIUX_SPEC.md 3.1` |
| AI orchestration | Vercel AI SDK v6 + `@ai-sdk/openai-compatible` | v6 | `SRS.md 4.1` ; `RAG-CONTEXT.md 5.1` |
| Validasi | Zod | stabil terkini | `SRS.md 4.1, 8.7` |
| DB | Turso (libSQL, SQLite-compatible via HTTP) | latest | `SRS.md 4.1` ; `DATABASE_SCHEMA.md 1.1` |
| ORM | Drizzle ORM | stabil terkini (ASUMSI) | `SRS.md 4.2 #4` ; ASUMSI SRS-A3 |
| DB client | `@libsql/client` (di bawah Drizzle) | latest | `DATABASE_SCHEMA.md 8.3` |
| Storage gambar | Vercel Blob | latest (ASUMSI) | ASUMSI SRS-A5 `RAG-CONTEXT.md 6` |
| Auth | NextAuth.js (Auth.js v5+) | stabil terkini (ASUMSI) | ASUMSI SRS-A1 `RAG-CONTEXT.md 9 G2` |
| Enkripsi | Node `crypto` (AES-256-GCM) | native (ASUMSI) | ASUMSI SRS-A4 `RAG-CONTEXT.md 11 #4` |
| i18n | next-intl | stabil terkini (ASUMSI) | ASUMSI SRS-A2 `RAG-CONTEXT.md 9 G5` |
| Test unit | Vitest | stabil terkini | `SRS.md 4.1, 11.1` (ASUMSI) |
| Test e2e | Playwright | stabil terkini | `SRS.md 4.1, 11.1` (ASUMSI) |
| Lint | ESLint + `next lint` | stabil terkini | `SRS.md 4.1, 11.1` (ASUMSI) |
| Format | Biome (opsional) / Prettier (opsional) | stabil terkini | ASUMSI (paket konteks) |
| Deploy | Vercel (serverless) | n/a | `RAG-CONTEXT.md 2.1` |

### 1.3 Prinsip Inti

1. **Type-safe by default** — TypeScript strict, no `any`, validasi input via
   Zod di boundary (route handler, server action, LLM output). Sitasi:
   `SRS.md 8.7`.
2. **Secure by default** — server-only boundary di `lib/*`, API key encrypt
   at rest (AES-256-GCM), no secret di client bundle, ownership RBAC.
   Sitasi: `PROJECT_ARCHITECTURE.md 1.3, 9` ; `SRS.md 9.1`.
3. **Clean code** — DRY, KISS, SOLID seperlunya, file kecil fokus, fungsi
   pendek (<60 baris), immutability default, naming jelas.
4. **Structured output first** — `generateObject` + Zod `PromptPackageSchema`
   sebagai default LLM call. Fallback `streamText` + parse manual bila provider
   tidak dukung. Sitasi: `SRS.md 4.2 #2, 8.7`.
5. **Streaming anti-timeout** — generasi panjang via SSE. Token mulai mengalir
   < 10s (NFR-P3). Sitasi: `SRS.md 8.1` ; `PROJECT_ARCHITECTURE.md 1.3 #3`.
6. **Repository pattern** — akses DB lewat `lib/db/repositories/*.repo.ts`,
   bukan query Drizzle mentah di route handler. Sitasi:
   `PROJECT_ARCHITECTURE.md 4.2, 5`.
7. **Design tokens WAJIB** — frontend pakai token dari `UIUX_SPEC.md 2`,
   tidak hardcode warna/spacing/radius. Sitasi: `UIUX_SPEC.md 2.10`.
8. **Aksesibilitas WAJIB** — WCAG 2.1 AA, keyboard nav, focus visible, ARIA.
   Sitasi: `UIUX_SPEC.md 9` ; `PRD.md 6.6`.

---

## 2. Konvensi Penamaan

### 2.1 Tabel Penamaan

| Tipe | Konvensi | Contoh | Bukti |
|---|---|---|---|
| File route handler | `route.ts` (wajib nama) | `src/app/api/v1/projects/route.ts` | `PROJECT_ARCHITECTURE.md 5` |
| Folder route (segment) | kebab-case atau `[param]` | `api/v1/projects/[id]/route.ts` | `PROJECT_ARCHITECTURE.md 5` |
| Folder komponen domain | kebab-case | `components/generate/`, `components/settings/` | `UIUX_SPEC.md 3.3` |
| File komponen React (custom) | kebab-case | `prompt-card.tsx`, `provider-config-form.tsx` | `UIUX_SPEC.md 3.2` |
| File komponen shadcn/ui | lowercase | `button.tsx`, `input.tsx`, `card.tsx` | `UIUX_SPEC.md 3.1` |
| File lib (modul) | kebab-case | `provider-registry.ts`, `llm-client.ts`, `consistency-checker.ts` | `PROJECT_ARCHITECTURE.md 4.1, 5` |
| File repo DB | kebab-case + `.repo.ts` | `project.repo.ts`, `provider-config.repo.ts` | `PROJECT_ARCHITECTURE.md 4.2` |
| File prompt template | `<komponen>.system.ts` | `scenes.system.ts`, `voiceover.system.ts` | `PROJECT_ARCHITECTURE.md 5 (lib/ai/prompts)` |
| File schema Drizzle | `schema.ts` (single source) | `src/lib/db/schema.ts` | `DATABASE_SCHEMA.md 8.1, 8.3` |
| File Zod schema | `schemas.ts` (single source) | `src/lib/validation/schemas.ts` | `SRS.md 3.4, 8.7` |
| File i18n messages | `<locale>.json` | `messages/id.json`, `messages/en.json` | `PROJECT_ARCHITECTURE.md 5` ; `SRS.md 5 (FR-19)` |
| Class komponen React | PascalCase | `Button`, `PromptCard`, `SceneCard`, `ProviderConfigForm` | `UIUX_SPEC.md 3.1, 3.2` |
| Function | camelCase | `buildProvider()`, `encrypt()`, `decrypt()`, `mask()` | `PROJECT_ARCHITECTURE.md 7.1` ; `DATABASE_SCHEMA.md 11.2` |
| Variabel | camelCase | `providerConfig`, `apiKeyEncrypted`, `durationTargetSeconds` | `API_CONTRACT.md 3.1` |
| Konstanta | UPPER_SNAKE_CASE | `PROVIDER_PRESETS`, `MAX_CHARACTERS_PER_PROJECT` | ASUMSI (best practice) |
| Enum value (DB) | lowercase string | `shorts`, `tutorial`, `3D`, `2D`, `tokoh`, `background`, `utama` | `DATABASE_SCHEMA.md 4` ; `API_CONTRACT.md 8` |
| Tabel DB | snake_case jamak | `users`, `provider_configs`, `projects`, `asset_references`, `image_prompts`, `generation_logs`, `supporting_characters` | `DATABASE_SCHEMA.md 4` |
| Kolom DB | snake_case | `user_id`, `created_at`, `duration_target_seconds`, `api_key_encrypted`, `result_json` | `DATABASE_SCHEMA.md 4` |
| Properti Drizzle (TS) | camelCase (mapping kolom snake) | `userId`, `projectId`, `createdAt`, `apiKeyEncrypted`, `resultJson` | `DATABASE_SCHEMA.md 8.3` |
| Field JSON API (request/response) | camelCase | `userId`, `durationType`, `durationTargetSeconds`, `styleType`, `apiKeyMasked` | `API_CONTRACT.md 3.1` |
| Field `PromptPackageSchema` (LLM output) | snake_case native (match PRD §8.2) | `character_profiles`, `voiceover_script`, `moral_message`, `gayarambut`, `wajah_asal`, `pakaian_atas`, `pakaian_bawah`, `alas_kaki`, `deskripsi_latar` | `API_CONTRACT.md 3.1` ; `PRD.md 8.2` ; `SRS.md 8.7` |
| Env var | UPPER_SNAKE_CASE | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL` | `DATABASE_SCHEMA.md 11.4` ; `SRS.md 8.2, 8.4` |
| i18n message key | namespaced dotted | `common.save`, `generate.wizard.step1Title`, `settings.provider.apiKey`, `error.validation.titleMin` | `UIUX_SPEC.md 1.4` ; ASUMSI next-intl convention |
| Branch git | `feature/<scope>`, `fix/<scope>`, `chore/<scope>` | `feature/provider-config`, `fix/sse-stream` | ASUMSI (best practice) |
| Commit message | conventional commit | `feat(generate): add SSE streaming`, `fix(crypto): mask api key on update` | §8 dokumen ini |
| Custom hook React | `use<Thing>` | `useGenerateStream`, `useTheme`, `useProjects` | `UIUX_SPEC.md 3` (implied) |
| Test file | co-located `*.test.ts` / `*.test.tsx` | `aes.test.ts`, `prompt-builder.test.ts`, `prompt-card.test.tsx` | `SRS.md 11.1` |
| E2E test file | `e2e/<flow>.spec.ts` | `e2e/generate-shorts.spec.ts`, `e2e/export-markdown.spec.ts` | `SRS.md 11.1` (ASUMSI Playwright convention) |

### 2.2 Catatan

- **DB vs TS vs JSON mapping wajib eksplisit.** Drizzle schema mendefinisikan
  kolom snake_case + properti TS camelCase via builder `integer('user_id')`
  → `userId`. Repository layer mapping ke DTO JSON camelCase. `PromptPackageSchema`
  field snake_case native (tidak dipetakan) karena match PRD §8.2 + dipakai
  langsung oleh LLM. Sitasi: `DATABASE_SCHEMA.md 8.3` ; `API_CONTRACT.md 3.1, 8.4`.
- **TIDAK ada singkatan ambigu.** `usr` → `user`, `cfg` → `config`, `tmp` →
  `temporary`. Pengecualian: `id`, `url`, `api`, `db`, `ui` (sudah jelas).
- **Nama file = nama default export (komponen).** `prompt-card.tsx` →
  `PromptCard`. `provider-config-form.tsx` → `ProviderConfigForm`.

---

## 3. Struktur Kode per Layer

### 3.1 Struktur Folder Inti

Ikut `PROJECT_ARCHITECTURE.md §5`:

```text
PromptFlow/
  product-docs/                      # dokumen (tidak diubah agent eksekutor)
  drizzle/                           # output migration SQL
  messages/                          # i18n (id.json, en.json)
  public/
    references/                       # dev-only upload (ASUMSI)
  src/
    app/
      api/v1/                         # Route Handlers (REST + SSE)
        auth/[...nextauth]/route.ts
        projects/route.ts
        projects/[id]/route.ts
        generate/route.ts
        settings/providers/route.ts
        settings/providers/[id]/route.ts
        settings/providers/[id]/test/route.ts
        upload/route.ts
        projects/[id]/export/route.ts
        projects/[id]/characters/route.ts
        projects/[id]/scenes/route.ts
        projects/[id]/image-prompts/route.ts
        projects/[id]/logs/route.ts
        health/route.ts
      (dashboard)/                     # UI pages (Server Components default)
        layout.tsx
        generate/page.tsx
        projects/page.tsx
        projects/[id]/page.tsx
        settings/page.tsx
      (auth)/
        login/page.tsx
      layout.tsx                       # root + i18n provider
      page.tsx                          # redirect /generate atau /login
      globals.css                       # Tailwind v4 + design tokens
    components/
      ui/                               # shadcn/ui (copy-paste, jangan edit sembarangan)
      common/                           # AppHeader, CopyButton, EmptyState, dll
      generate/                         # WizardStep, SceneCard, ResultTabs, dll
      projects/                         # PromptCard, list/detail
      settings/                         # ProviderConfigForm
    lib/
      ai/
        provider-registry.ts            # createOpenAICompatible factory
        prompt-builder.ts               # assemble system prompt
        llm-client.ts                   # generateObject / streamObject + retry
        response-parser.ts              # Zod validate + fallback parse
        consistency-checker.ts          # FR-12 post-check
        prompts/                        # *.system.ts templates
      db/
        client.ts                       # Drizzle + libSQL init
        schema.ts                       # 9 tabel (single source)
        repositories/                   # *.repo.ts per entitas
      storage/blob.ts                   # Vercel Blob helper
      auth/
        config.ts                       # NextAuth providers, callbacks
        middleware.ts                   # protected routes
      crypto/aes.ts                     # AES-256-GCM encrypt/decrypt/mask
      i18n/
        config.ts
        request.ts
      validation/schemas.ts             # Zod (input + PromptPackageSchema)
      export/markdown.template.ts
    middleware.ts                       # NextAuth + i18n + rate limit
  drizzle.config.ts
  next.config.ts
  tailwind.config.ts
  components.json                       # shadcn/ui config
  package.json
  tsconfig.json
  .env.local                           # dev (TIDAK commit)
  .env.example                         # dokumentasi env
  .gitignore
  README.md
```

Sitasi: `PROJECT_ARCHITECTURE.md 5`.

### 3.2 Aturan Import

**Urutan import (wajib konsisten):**

```ts
// 1. Node/external built-in
import 'server-only';
import crypto from 'node:crypto';

// 2. External packages (npm)
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/libsql';

// 3. Internal alias (@/ = src/)
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { encrypt, mask } from '@/lib/crypto/aes';

// 4. Relative (hanya bila perlu, hindari)
import { PromptCard } from './prompt-card';

// 5. Type-only import (terpisah)
import type { ProjectDTO } from '@/lib/validation/schemas';
```

**Aturan:**

| Aturan | Detail | Bukti |
|---|---|---|
| Alias `@/` wajib | `@/lib/...`, `@/components/...` = `src/`. Konfigurasi `tsconfig.json` `paths`. | ASUMSI (Next.js convention) |
| Absolute import utama | Hindari relative `../` lebih dari 1 level. Pakai `@/`. | ASUMSI |
| `import 'server-only'` di lib server | `lib/ai/*`, `lib/crypto/*`, `lib/db/*`, `lib/storage/*` wajib baris pertama. Mencegah import ke Client Component. | `SRS.md 9.1 SEC-03` ; `PROJECT_ARCHITECTURE.md 9 SB-01/02` |
| `import 'client-only'` opsional | Di file client-only (mis `useTranslations` wrapper) bila perlu. | ASUMSI |
| Type-only import | `import type { ... }` untuk tipe murni, hilangkan dari runtime bundle. | ASUMSI (TS best practice) |
| Barrel export selektif | `index.ts` per folder opsional. Hindari barrel besar yang mask origin. Prefer named export eksplisit. | ASUMSI |

### 3.3 Export: Default vs Named

| Tipe file | Pola export | Contoh |
|---|---|---|
| Page (RSC) | `default export function Page()` wajib | `export default function GeneratePage() { ... }` |
| Route handler | named `GET`, `POST`, `PATCH`, `DELETE`, `PUT` | `export async function POST(req: Request) { ... }` |
| Komponen UI shadcn | default export + named sub-komponen | `export { Button }` + `export { buttonVariants }` |
| Komponen custom | default export (komponen utama) + named (sub) | `export default PromptCard` + `export function PromptCardSkeleton()` |
| Lib function | named export | `export function encrypt(...)`, `export function buildProvider(...)` |
| Schema Drizzle | named export (tabel) | `export const projects = sqliteTable(...)` |
| Zod schema | named export | `export const PromptPackageSchema = z.object(...)` |
| Type | named export (`export type`) | `export type ProjectDTO = z.infer<typeof ProjectDTOSchema>` |

Sitasi: ASUMSI (Next.js + TypeScript convention).

### 3.4 Layer Tanggung Jawab

| Layer | Tanggung jawab | Bukan tanggung jawab |
|---|---|---|
| `app/(dashboard)/page.tsx` (RSC) | Data fetch via repo, render, metadata | Panggil LLM, decrypt, query raw Drizzle |
| `app/api/v1/*/route.ts` | Parse request, validasi Zod, auth check, delegasi ke lib, format response envelope | Business logic kompleks, query DB mentah |
| Server Action (di file `actions.ts` atau co-located) | Mutation dari Client Component, validasi, revalidatePath | Panggilan LLM langsung (delegasi ke lib/ai) |
| `lib/ai/*` | Provider init, prompt build, LLM call, parse, consistency check | Render UI, akses DB mentah (delegasi ke repo) |
| `lib/db/repositories/*` | CRUD + ownership filter `user_id` + paginate + komposit index query | Business logic LLM, render |
| `lib/db/schema.ts` | Definisi tabel Drizzle (single source) | Query |
| `lib/crypto/*` | Encrypt/decrypt/mask (server-only) | Akses DB, LLM |
| `lib/validation/schemas.ts` | Zod schema (input + LLM output) | Parse LLM response (di `lib/ai/response-parser`) |
| `lib/storage/*` | Vercel Blob put/get/del | Validasi mime (di route handler) |
| `lib/auth/*` | NextAuth config, middleware | Business logic generate |
| `lib/export/*` | Transform JSON → markdown | Fetch data (data sudah ada) |
| `components/ui/*` | shadcn/ui copy-paste, jangan edit sembarangan (cuma className tuning) | Business logic |
| `components/{generate,projects,settings,common}/*` | Presentasi + interaksi client | Data fetch langsung (via Server Action / fetch) |

Sitasi: `PROJECT_ARCHITECTURE.md 3.2, 4` ; `SRS.md 3.2`.

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
| `strict: true` wajib | Semua strict check aktif. | ASUMSI (TS best practice) |
| `noImplicitAny: true` | TIDAK boleh `any` implicit. | ASUMSI |
| `no any` | Hindari `any`. Bila terpaksa pakai `unknown` + narrow, atau `Record<string, unknown>`. Pengecualian: third-party API tanpa type (komentar `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + alasan). | ASUMSI |
| Explicit return type public function | Function/method publik (`export`) wajib return type eksplisit. Private/helper boleh infer. | ASUMSI |
| `interface` vs `type` | `interface` untuk object shape yang bisa di-extend/merge. `type` untuk union, mapped, conditional. Prefer `interface` bila bisa. | ASUMSI |
| `as const` | Literal yang harus narrow (const array, object enum-like) pakai `as const`. | ASUMSI |
| `satisfies` | Validasi tipe tanpa widen: `const x = { ... } satisfies Schema`. | ASUMSI |
| Discriminated union | Untuk state/action bercabang: `type Result = { ok: true; data } \| { ok: false; error }`. | ASUMSI |
| `z.infer` untuk DTO | Tipe DTO diderivasi dari Zod schema: `type ProjectDTO = z.infer<typeof ProjectDTOSchema>`. Hindari duplikasi. | `API_CONTRACT.md 8` |
| Type dari Drizzle | `type Project = typeof projects.$inferSelect`. `type NewProject = typeof projects.$inferInsert`. | `DATABASE_SCHEMA.md 8.3` (ASUMSI Drizzle) |
| `readonly` untuk immutable | Props komponen React `readonly`, konstanta `readonly`. | ASUMSI |
| Non-null assertion `!` hindari | Hanya bila sudah validated (mis `process.env.X!` setelah check). Prefer guard `if (!env) throw`. | ASUMSI |
| `unknown` bukan `any` untuk parse eksternal | Hasil `JSON.parse`, `req.json()`, response LLM = `unknown` → Zod parse. | ASUMSI |

**DO:**

```ts
// DTO dari Zod
export type ProjectDTO = z.infer<typeof ProjectDTOSchema>;

// Drizzle infer
type Project = typeof projects.$inferSelect;
type NewProject = typeof projects.$inferInsert;

// Discriminated union
type GenerateEvent =
  | { type: 'progress'; stage: string; delta: string }
  | { type: 'done'; result: PromptPackage; warnings: Warning[] }
  | { type: 'error'; code: string; message: string };

// as const + satisfies
const PROVIDER_PRESETS = {
  ollama: 'https://ollama.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  '9router': 'http://localhost:20128/v1',
} as const satisfies Record<string, string>;

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
type ProjectDTO = { id: number; title: string; ... }; // duplikat ProjectDTOSchema

// ❌ non-null tanpa guard
const key = process.env.ENCRYPTION_KEY!;
```

### 4.2 Next.js App Router

| Aturan | Detail | Bukti |
|---|---|---|
| Server Component default | Page/layout default RSC (tidak pakai `'use client'`). Hanya bila butuh interaksi (`useState`, `useEffect`, event handler) tambah `'use client'` di atas file. | `SRS.md 3.2 Layer 1` ; `PROJECT_ARCHITECTURE.md 1.3 #1` |
| `'use client'` minimal | Hanya komponen interaktif (form, streaming display, toggle). Data fetch tetap RSC. Jangan bubuh `'use client'` di root layout bila tidak perlu. | `SRS.md 3.2` ; `UIUX_SPEC.md 3.2` |
| Server Actions untuk mutation | Form submit / save / delete dari Client Component pakai Server Action (`'use server'` function). Bukan `fetch('/api/...')` manual bila internal. | `SRS.md 3.2 Layer 2` ; `API_CONTRACT.md 1.1` |
| Route Handler untuk SSE/external | `/api/v1/generate` SSE, `/api/v1/upload` multipart, `/api/v1/export` file download, webhooks. Pakai `route.ts` + named `GET/POST/...`. | `SRS.md 7.1` ; `API_CONTRACT.md 1.1, 6` |
| Dynamic params | `[id]` → `params: { id: string }`. Convert ke number di handler: `const id = Number(params.id); if (Number.isNaN(id)) return 400`. | `PROJECT_ARCHITECTURE.md 5` |
| `metadata` export | Setiap page wajib `export const metadata: Metadata = { title, description }`. i18n title via `generateMetadata` + `getTranslations`. | ASUMSI (Next.js convention) |
| `error.tsx` | Wajib di route group `(dashboard)` + root. Client Component (`'use client'`), terima `error` + `reset`. | ASUMSI (Next.js convention) |
| `loading.tsx` | Wajib di route group + page berat (project list, detail). Skeleton UIUX_SPEC. | ASUMSI (Next.js convention) |
| `not-found.tsx` | Wajib root + `(dashboard)`. | ASUMSI |
| `middleware.ts` | `src/middleware.ts` gabungan NextAuth + i18n + rate limit. Export `middleware` default + `config.matcher`. | `SRS.md 9.1 SEC-11` ; `PROJECT_ARCHITECTURE.md 5, 9` |
| `revalidatePath` / `revalidateTag` | Setelah mutation via Server Action, panggil `revalidatePath('/projects')` supaya RSC re-fetch. | ASUMSI (Next.js best practice) |
| `cookies()` / `headers()` server-only | Baca session NextAuth di RSC/route handler via `auth()` helper. | ASUMSI NextAuth |
| Suspense boundary | Streaming display (`ResultTabs` partial) bungkus `<Suspense fallback={<Skeleton/>}>`. | `SRS.md 7.2` ; `UIUX_SPEC.md 7.5` |
| Edge vs Node runtime | Default Node (DB + crypto butuh Node). `export const runtime = 'nodejs'` bila eksplisit. Edge hanya untuk middleware ringan. | ASUMSI (Vercel + Turso) |
| `export const dynamic = 'force-dynamic'` | Halaman yang baca session/cookie (dashboard list) agar tidak di-cache static. | ASUMSI |

**DO:**

```tsx
// src/app/(dashboard)/projects/page.tsx (RSC)
import { listProjects } from '@/lib/db/repositories/project.repo';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { ProjectList } from '@/components/projects/project-list';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const projects = await listProjects({ userId: session.user.id });
  return <ProjectList projects={projects} />;
}

export const metadata: Metadata = { title: 'Proyek Saya | PromptFlow' };
```

```ts
// src/app/api/v1/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { createProject } from '@/lib/db/repositories/project.repo';
import { CreateProjectInputSchema, errorResponse } from '@/lib/validation/schemas';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse('UNAUTHORIZED', 401);
  const raw: unknown = await req.json();
  const parsed = CreateProjectInputSchema.safeParse(raw);
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 400, parsed.error);
  const project = await createProject({ ...parsed.data, userId: session.user.id });
  return NextResponse.json({ data: project }, { status: 201 });
}
```

**DON'T:**

```tsx
// ❌ 'use client' di page data-fetch
'use client';
export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  useEffect(() => { fetch('/api/projects').then(...) }, []);
  return <ul>{projects.map(...)}</ul>;
}

// ❌ fetch manual untuk internal mutation (harus Server Action)
'use client';
<form onSubmit={async () => { await fetch('/api/projects', { method: 'POST', body: ... }) }}>
```

---

### 4.3 React

| Aturan | Detail | Bukti |
|---|---|---|
| Function component | Hanya function component (bukan class). `function Foo() {}` atau `const Foo = () => {}`. | ASUMSI (React 19) |
| Hooks rules | Hook hanya di top-level component/hook custom. Tidak di loop/condition/nested function. | ASUMSI (React rules) |
| Custom hook prefix `use` | `useGenerateStream`, `useTheme`, `useProjects`. Wajib return object/array/value. | ASUMSI |
| `useMemo` untuk expensive | Memoize derive expensive (filter sort besar). Tidak memo primitive. | ASUMSI |
| `useCallback` untuk handler stabil | Handler yang pass ke child memoized. | ASUMSI |
| `key` stabil & unik | List render wajib `key` stabil (id, bukan index). `key={item.id}`. | ASUMSI |
| Effect cleanup | `useEffect` yang subscribe/timer wajib cleanup return. Hindari memory leak. | ASUMSI |
| `useEffect` minimal | Prefer derived state / event handler. Effect = sync dengan eksternal (SSE, DOM API). | ASUMSI |
| Props readonly | Props komponen `readonly` (via TS). | ASUMSI |
| Composability | Komponen kecil + compose, bukan god komponen. Maks ~200 baris per komponen. | ASUMSI |
| Server vs Client component split | Komponen berat statis = RSC. Interaktif = Client. Pisah file. | `SRS.md 3.2` |
| `React.memo` selektif | Hanya bila profil menunjukkan re-render mahal. Default tidak memo. | ASUMSI |

**DO:**

```tsx
// Komponen kecil + compose
function SceneCard({ scene, streaming }: { scene: SceneDTO; streaming?: boolean }) {
  return (
    <Collapsible>
      <CollapsibleTrigger>
        <Badge>{scene.orderNo}</Badge>
        <span>{scene.description}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <VoiceoverBlock text={scene.voiceoverScript} />
        <ImagePromptList items={scene.imagePrompts.characters} tipe="tokoh" />
      </CollapsibleContent>
    </Collapsible>
  );
}
```

### 4.4 Tailwind CSS v4

| Aturan | Detail | Bukti |
|---|---|---|
| Utility-first | Susun style via class utility. Hindari CSS custom kecuali token. | `UIUX_SPEC.md 2.10` |
| `@theme` tokens dari UIUX_SPEC | `globals.css` pakai `@theme { --color-primary: #7c3aed; ... }` sesuai UIUX_SPEC §2.10. TIDAK hardcode `bg-[#7c3aed]`. | `UIUX_SPEC.md 2.1, 2.10` |
| Responsive prefix mobile-first | Default mobile, `sm:` `md:` `lg:` `xl:` untuk breakpoint naik. Tidak pakai `max-md:`. | `UIUX_SPEC.md 2.7, 4.1` |
| Dark mode class | `.dark` class toggle (bukan `@media prefers-color-scheme` saja, agar user bisa override). | `UIUX_SPEC.md 2.1, 2.10` |
| No inline style kecuali dynamic | Hindari `style={{ color: '...' }}`. Pengecualian: nilai dynamic (mis `style={{ '--progress': '${pct}%' }}`). | ASUMSI |
| `cn()` utility | Merge class conditional pakai `cn()` (shadcn `lib/utils.ts`, `clsx` + `tailwind-merge`). | `UIUX_SPEC.md 3.1` (shadcn default) |
| Spacing scale konsisten | `space-1` (4px) ... `space-24` (96px). Hindari arbitrary `p-[13px]`. | `UIUX_SPEC.md 2.5` |
| Container responsif | `max-w-[1280px]` dashboard, `max-w-[768px]` wizard, `max-w-[640px]` auth, `max-w-[1536px]` landing. | `UIUX_SPEC.md 4.4` |
| Variants via `cva` (shadcn) | Komponen shadcn pakai `cva` untuk variant (`buttonVariants`, `badgeVariants`). | `UIUX_SPEC.md 3.1` |
| Z-index token | Pakai `z-dropdown` (1000), `z-toast` (1200), `z-modal` (1300), `z-tooltip` (1400). Hindari `z-[9999]`. | `UIUX_SPEC.md 2.9` |
| Motion token | Durasi via `--motion-fast` (120ms), `--motion-base` (200ms), `--motion-slow` (320ms). | `UIUX_SPEC.md 2.8` |
| `prefers-reduced-motion` | Nonaktifkan animasi non-esensial via `motion-reduce:` Tailwind variant. | `UIUX_SPEC.md 2.8, 9.5` |
| Radius token | `rounded-sm` (4px), `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), `rounded-full`. | `UIUX_SPEC.md 2.6` |

**DO:**

```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-primary: #7c3aed;
  --color-primary-foreground: #ffffff;
  /* ... dari UIUX_SPEC 2.10 ... */
  --radius: 6px;
  --font-sans: Inter, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

.dark {
  --color-background: #0a0a0a;
  --color-foreground: #fafafa;
  /* ... */
}
```

```tsx
// cn() utility
import { cn } from '@/lib/utils';
<Button className={cn('w-full', isActive && 'bg-primary text-primary-foreground')} />
```

**DON'T:**

```tsx
// ❌ hardcode hex
<div className="bg-[#7c3aed] text-white">

// ❌ inline style statis
<div style={{ backgroundColor: '#7c3aed' }}>

// ❌ arbitrary spacing
<div className="p-[13px]">

// ❌ max- prefix (bukan mobile-first)
<div className="max-md:flex-col">
```

### 4.5 shadcn/ui

| Aturan | Detail | Bukti |
|---|---|---|
| Copy-paste component | shadcn/ui = copy-paste ke `components/ui/`. Edit hanya untuk className tuning, JANGAN rubah API fundamental. | `RAG-CONTEXT.md 2.1` ; `UIUX_SPEC.md 3.1` |
| Radix primitive | shadcn/ui dibangun di Radix UI. Pakai primitive (`@radix-ui/react-dialog`, dll) via wrapper shadcn. | ASUMSI (shadcn) |
| Variants via `cva` | Variant (size, color) definisikan di `cva`. Jangan if/else class berantai. | `UIUX_SPEC.md 3.1` |
| Form: react-hook-form + Zod resolver | Form pakai `react-hook-form` + `@hookform/resolvers/zod`. Schema dari `lib/validation/schemas.ts`. | `UIUX_SPEC.md 3.1 (Form)` |
| Toast: sonner | Toast pakai `sonner` (shadcn wrapper). Panggil `toast.success(...)`, `toast.error(...)` dengan variant. | `UIUX_SPEC.md 3.1 (Toast/Sonner)` |
| Accessibility built-in | shadcn/Radix sudah a11y (focus trap, ARIA). Jangan override `outline: none` tanpa pengganti. | `UIUX_SPEC.md 9` |
| Icon: Lucide React | Konsisten Lucide. TIDAK campur library icon. | `UIUX_SPEC.md 8.1, 8.4` |
| Jangan duplikasi shadcn | Bila shadcn sudah punya komponen, pakai. Jangan tulis custom Button/Input/Card baru. | ASUMSI |
| Komponen domain custom | Komponen PromptFlow (`PromptCard`, `SceneCard`) di `components/{domain}/`, bukan `ui/`. | `UIUX_SPEC.md 3.2, 3.3` |

**DO:**

```tsx
// Form dengan react-hook-form + Zod
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProjectInputSchema } from '@/lib/validation/schemas';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewProjectForm({ onSubmit }: { onSubmit: (data: CreateProjectInput) => void }) {
  const form = useForm<z.infer<typeof CreateProjectInputSchema>>({
    resolver: zodResolver(CreateProjectInputSchema),
    defaultValues: { title: '', durationType: 'shorts', durationTargetSeconds: 60, styleType: '3D', aspectRatio: '16:9' },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="title" render={({ field }) => (
          <FormItem>
            <FormControl><Input {...field} placeholder="Judul animasi" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Generate</Button>
      </form>
    </Form>
  );
}
```

---

### 4.6 Drizzle ORM

| Aturan | Detail | Bukti |
|---|---|---|
| `schema.ts` single source | Semua 9 tabel definisikan di `src/lib/db/schema.ts`. TIDAK ada definisi tabel tersebar. | `DATABASE_SCHEMA.md 8.1, 8.3` |
| Repository pattern | Akses DB lewat `lib/db/repositories/*.repo.ts`. Route handler/action panggil repo, BUKAN query Drizzle mentah. | `PROJECT_ARCHITECTURE.md 4.2, 5` |
| Transaction | Operasi multi-tabel (generate → save project + characters + scenes + image_prompts) pakai `db.transaction(async (tx) => { ... })`. | ASUMSI (Drizzle) |
| Select explicit column | Hindari `select()` semua bila tidak perlu. `db.select({ id, title }).from(projects)`. | `DATABASE_SCHEMA.md 7.2` (result_json denormalisasi sadar) |
| Prepared statement | Opsional untuk query panas. `db.select(...).prepare('list_projects')`. | ASUMSI |
| Migration via `drizzle-kit` | `drizzle-kit generate` buat SQL migration di `drizzle/`. `drizzle-kit push` dev. Prod: SQL manual via `turso db shell`. | `DATABASE_SCHEMA.md 8.4` |
| Type inference | `typeof projects.$inferSelect` / `$inferInsert`. Jangan duplikasi interface. | `DATABASE_SCHEMA.md 8.3` (ASUMSI) |
| Ownership filter wajib | Semua query project/provider WAJIB filter `user_id`. Helper scope di repo. | `SRS.md 9.1 SEC-07` ; `DATABASE_SCHEMA.md 11.3` |
| Soft delete filter | Query project WAJIB `WHERE deleted_at IS NULL`. Helper `listActiveProjects()`. | `DATABASE_SCHEMA.md 10.1` |
| Tipe SQLite | `integer`, `text`, `real`, `blob`. Hindari fitur PostgreSQL-specific. Timestamp = `integer` unix epoch second (ASUMSI). | `DATABASE_SCHEMA.md 1.3` |
| Kolom snake_case + properti TS camelCase | `integer('user_id')` → `userId`. Mapping eksplisit. | `DATABASE_SCHEMA.md 8.3` |
| Index eksplisit | Pakai index komposit dari DATABASE_SCHEMA §5 (`idx_projects_user_created`, `idx_characters_project_nama`, dll). | `DATABASE_SCHEMA.md 5` |
| FK + cascade | `references(() => users.id, { onDelete: 'cascade' })`. Sesuai DATABASE_SCHEMA §3.1. | `DATABASE_SCHEMA.md 3.1, 8.3` |
| `sql` template untuk default | `default(sql\`(unixepoch())\`)` untuk timestamp. | `DATABASE_SCHEMA.md 8.3` |

**DO:**

```ts
// src/lib/db/schema.ts (excerpt)
import { sql } from 'drizzle-orm';
import { integer, text, sqliteTable, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey().autoincrement(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  durationType: text('duration_type').notNull(),
  durationTargetSeconds: integer('duration_target_seconds').notNull(),
  styleType: text('style_type').notNull(),
  aspectRatio: text('aspect_ratio').notNull(),
  resultJson: text('result_json'),
  status: text('status').notNull().default('draft'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`).notNull(),
  deletedAt: integer('deleted_at'),
}, (t) => ({
  userIdx: index('idx_projects_user_id').on(t.userId),
  userCreatedIdx: index('idx_projects_user_created').on(t.userId, t.createdAt),
}));
```

```ts
// src/lib/db/repositories/project.repo.ts
import 'server-only';
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';

export async function listActiveProjects({ userId, page = 1, limit = 20 }: {
  userId: number; page?: number; limit?: number;
}) {
  const offset = (page - 1) * limit;
  const rows = await db.select({ id: projects.id, title: projects.title, status: projects.status, createdAt: projects.createdAt })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.createdAt))
    .limit(limit)
    .offset(offset);
  const total = await db.select({ count: sql<number>`count(*)` }).from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));
  return { data: rows, pagination: { page, limit, total: total[0]?.count ?? 0, totalPages: Math.ceil((total[0]?.count ?? 0) / limit) } };
}

export async function createProject(input: { userId: number; title: string; durationType: string; durationTargetSeconds: number; styleType: string; aspectRatio: string }) {
  const [row] = await db.insert(projects).values({ ...input, status: 'draft' }).returning();
  return row;
}
```

**DON'T:**

```ts
// ❌ query Drizzle mentah di route handler
export async function POST() {
  const rows = await db.select().from(projects).where(eq(projects.userId, 1));
  // harus pakai repo
}

// ❌ tidak filter ownership
const rows = await db.select().from(projects); // semua user!

// ❌ tidak filter soft delete
const rows = await db.select().from(projects).where(eq(projects.userId, userId));
// harus: and(isNull(projects.deletedAt))
```

### 4.7 Vercel AI SDK v6

| Aturan | Detail | Bukti |
|---|---|---|
| `createOpenAICompatible` untuk multi-provider | Init via `createOpenAICompatible({ name, apiKey, baseURL, headers })`. Semua provider (Ollama cloud/OpenRouter/9router/custom). | `RAG-CONTEXT.md 5.1` ; `SRS.md 5 (FR-13)` ; `PROJECT_ARCHITECTURE.md 7.1` |
| `generateObject` + Zod default | Structured output via `generateObject({ model, schema: PromptPackageSchema, system, messages })`. Bila provider dukung `supportsStructuredOutputs: true`. | `SRS.md 4.2 #2, 8.7` ; `API_CONTRACT.md 8.4` |
| Fallback `streamText` + parse manual | Bila provider tidak dukung structured output → `streamText` → kumpul full text → `JSON.parse` → Zod validate. | `SRS.md 4.2 #2, 8.3` ; `PROJECT_ARCHITECTURE.md 4.1 (response-parser)` |
| `streamObject` untuk SSE partial | Streaming partial ke client via `streamObject` → ReadableStream → SSE response. | `SRS.md 7.2` ; `API_CONTRACT.md 7` |
| System prompt terstruktur | Template di `lib/ai/prompts/*.system.ts` per komponen (scenes, voiceover, character, image_prompts, moral). Assemble di `prompt-builder.ts`. | `SRS.md 3.2 (lib/ai/prompts)` ; `PROJECT_ARCHITECTURE.md 4.1` |
| Inject parameter ke prompt | `reference_filename`, `style`, `aspect_ratio`, `duration_target` di-inject ke system prompt via template literal. | `SRS.md 5 (FR-06, FR-17)` ; `PROJECT_ARCHITECTURE.md 6` |
| Server-only | `lib/ai/*` wajib `import 'server-only'`. TIDAK ada panggilan LLM dari Client Component. | `SRS.md 9.1 SEC-03` |
| Decrypt key server-side | API key user di-decrypt di `provider-registry.ts` sebelum pass ke `createOpenAICompatible`. Plaintext hanya in-memory. | `SRS.md 5 (FR-14), 9.1 SEC-03` ; `PROJECT_ARCHITECTURE.md 7.1` |
| Retry 3x backoff (ASUMSI) | LLM call retry 3x exponential backoff bila error transient (network, rate limit provider). | ASUMSI SRS-A14 `SRS.md 12` ; `PROJECT_ARCHITECTURE.md 10` |
| Header provider khusus | OpenRouter: `HTTP-Referer`, `X-OpenRouter-Title` opsional via `headers` option. | `RAG-CONTEXT.md 5.3` ; `PROJECT_ARCHITECTURE.md 7.1` |
| 9router localhost only | `http://localhost:20128/v1` hanya dev lokal. TIDAK reachable Vercel prod. Server-side only. | ASUMSI SRS-A7 `RAG-CONTEXT.md 5.2, 9 G4` |
| Error handling provider | Catch error provider → map ke error envelope `PROVIDER_ERROR` (502) atau `TIMEOUT` (504). | `API_CONTRACT.md 9.2` |
| Timeout stream disimpan partial | Bila timeout mid-stream, partial disimpan + warning (ASUMSI NFR-R2). | `SRS.md 7.3, 8.1` ; ASUMSI NFR-R2 |

**DO:**

```ts
// src/lib/ai/provider-registry.ts
import 'server-only';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { decrypt } from '@/lib/crypto/aes';
import type { LanguageModel } from 'ai';

export function buildProvider(cfg: {
  provider: string; baseUrl: string; model: string;
  apiKeyEncrypted: { iv: string; ciphertext: string; tag: string } | null;
}): LanguageModel {
  const apiKey = cfg.apiKeyEncrypted ? decrypt(cfg.apiKeyEncrypted) : '';
  const headers: Record<string, string> = {};
  if (cfg.provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL ?? 'https://promptflow.app';
    headers['X-OpenRouter-Title'] = 'PromptFlow';
  }
  const provider = createOpenAICompatible({
    name: cfg.provider, apiKey, baseURL: cfg.baseUrl, headers,
  });
  return provider(cfg.model);
}
```

```ts
// src/lib/ai/llm-client.ts
import 'server-only';
import { generateObject, streamObject } from 'ai';
import { PromptPackageSchema } from '@/lib/validation/schemas';
import { buildProvider } from './provider-registry';

export async function generatePromptPackage(cfg, system, messages) {
  const model = buildProvider(cfg);
  return generateObject({
    model,
    schema: PromptPackageSchema,
    system,
    messages,
  });
}
```

### 4.8 Zod

| Aturan | Detail | Bukti |
|---|---|---|
| Zod sebagai source of truth | Schema input + DTO + LLM output di `lib/validation/schemas.ts`. Tipe diderivasi via `z.infer`. | `SRS.md 8.7` ; `API_CONTRACT.md 8` |
| Infer type, jangan duplikasi | `type ProjectDTO = z.infer<typeof ProjectDTOSchema>`. | `API_CONTRACT.md 8` |
| `.refine` untuk validasi custom | Business rule (shorts ≤180s) via `.refine` atau `.superRefine`. | `API_CONTRACT.md 9.2 (422)` |
| `.transform` untuk coerce | Trim whitespace, lowercase email, convert string→number. | ASUMSI |
| Parse input di boundary | `req.json()` → `unknown` → `Schema.safeParse(raw)`. Bila fail → 400 `VALIDATION_ERROR`. | `SRS.md 5 (FR-01)` ; `API_CONTRACT.md 9.2` |
| Parse LLM output | LLM response → `PromptPackageSchema.safeParse(raw)`. Bila fail → fallback parse manual atau error. | `SRS.md 8.3, 8.7` ; `PROJECT_ARCHITECTURE.md 4.1 (response-parser)` |
| Error message i18n (ASUMSI) | Pesan error bahasa aktif (ID/EN, FR-19). Map Zod error code → i18n key. | `PRD.md 5 (FR-19)` ; `UIUX_SPEC.md 1.4` |
| `.nullable()` vs `.optional()` | `nullable` = boleh null. `optional` = boleh undefined. Sesuai DB schema. | `DATABASE_SCHEMA.md 4` |
| `z.enum` untuk enum terbatas | `z.enum(['shorts','tutorial'])`, `z.enum(['tokoh','background'])`. | `API_CONTRACT.md 8` |
| `.or()` untuk union | `z.enum(['16:9','9:16','1:1']).or(z.string())` (custom allowed). | `SRS.md 5 (FR-10)` |
| Export schema + DTO | `export const FooSchema = z.object(...)` + `export type FooDTO = z.infer<typeof FooSchema>`. | ASUMSI |

**DO:**

```ts
// lib/validation/schemas.ts
import { z } from 'zod';

export const CreateProjectInputSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  durationType: z.enum(['shorts', 'tutorial']),
  durationTargetSeconds: z.number().int().positive(),
  styleType: z.enum(['3D', '2D']),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).or(z.string()),
}).refine(
  (d) => d.durationType !== 'shorts' || d.durationTargetSeconds <= 180,
  { message: 'shorts_max_180', path: ['durationTargetSeconds'] }
);

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
```

### 4.9 NextAuth.js

| Aturan | Detail | Bukti |
|---|---|---|
| Config di `lib/auth/config.ts` | Providers, callbacks, session strategy. Export `auth`, `handlers`, `signIn`, `signOut`. | `PROJECT_ARCHITECTURE.md 5, 7.4` ; ASUMSI SRS-A1 |
| Credentials provider (ASUMSI) | Fase awal credentials sederhana. Bisa ekstensi OAuth nanti. | ASUMSI SRS-A1 `RAG-CONTEXT.md 9 G2` |
| Session JWT cookie (ASUMSI) | `session: { strategy: 'jwt' }`. Bisa Turso adapter bila DB session. | ASUMSI ARCH-A13 `PROJECT_ARCHITECTURE.md 7.4` |
| Callbacks secure | `jwt` callback inject `user.id` ke token. `session` callback expose `user.id` ke client. | ASUMSI NextAuth |
| `NEXTAUTH_SECRET` env wajib | Secret untuk JWT. Vercel env. | `SRS.md 9.1 SEC-12` |
| Middleware protected routes | `lib/auth/middleware.ts` (atau gabung di `src/middleware.ts`). Protected: `/projects`, `/settings`, `/generate`, `/api/v1/*` (kecuali `/api/v1/auth/*`, `/api/v1/health`). Redirect `/login?callbackUrl=<asli>`. | `SRS.md 9.1 SEC-11` ; `API_CONTRACT.md 2.2` |
| `auth()` helper di server | RSC + route handler baca session via `await auth()`. | ASUMSI NextAuth |
| `useSession()` client | Client Component baca session via `useSession()` + `SessionProvider`. | ASUMSI NextAuth |
| Password hash | Pakai `bcryptjs` (ASUMSI) atau argon2. Hash sebelum save `users.password_hash`. | `DATABASE_SCHEMA.md 9.3` |
| Role field | `users.role` = `'user'` fase awal, ekstensi `'admin'` nanti. | `DATABASE_SCHEMA.md 4.1` |

### 4.10 next-intl (ASUMSI)

| Aturan | Detail | Bukti |
|---|---|---|
| Message key namespaced | `common.save`, `generate.wizard.step1Title`, `settings.provider.apiKey`, `error.validation.titleMin`. Hindari flat key. | `UIUX_SPEC.md 1.4` ; ASUMSI next-intl convention |
| `messages/id.json`, `messages/en.json` | Bundel per locale di root `messages/`. | `PROJECT_ARCHITECTURE.md 5` ; `SRS.md 5 (FR-19)` |
| `getTranslations` server | RSC + route handler pakai `getTranslations(namespace)`. | ASUMSI next-intl |
| `useTranslations` client | Client Component pakai `useTranslations(namespace)`. | ASUMSI next-intl |
| Locale routing | `/[locale]/...` atau cookie-based + middleware. ASUMSI: cookie-based (TIDAK ada prefix URL). | ASUMSI SRS-A2 |
| Locale persisten | Cookie `NEXT_LOCALE`. Toggle di header (`LanguageToggle`). | `UIUX_SPEC.md 1.3, 3.2 (LanguageToggle)` |
| `lang` attribute | `<html lang={locale}>` ikut locale aktif. | `UIUX_SPEC.md 9.6` |
| Konten LLM bahasa ikut judul | UI label i18n, tapi konten generate LLM bahasa sesuai input/judul (ASUMSI NFR-I2). | `SRS.md 5 (FR-19)` ; ASUMSI NFR-I2 |
| Default locale | `id` default, `en` toggle. | `UIUX_SPEC.md 1.3` |

---

## 5. Error Handling & Logging

### 5.1 Error Envelope (API)

Semua error response (REST) pakai envelope:

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { } },
  "traceId": "req_abc123"
}
```

Sitasi: `API_CONTRACT.md 3.3, 9.1`.

| Code | HTTP | Kapan | Bukti |
|---|---|---|---|
| `VALIDATION_ERROR` | 400/422 | Zod fail / business validation | `API_CONTRACT.md 9.2` |
| `UNAUTHORIZED` | 401 | No session | `API_CONTRACT.md 9.2` |
| `FORBIDDEN` | 403 | Ownership fail | `SRS.md 9.1 SEC-07` |
| `NOT_FOUND` | 404 | Resource tidak ada / soft deleted | `API_CONTRACT.md 9.2` |
| `CONFLICT` | 409 | Unique constraint | `DATABASE_SCHEMA.md 4.2` |
| `RATE_LIMITED` | 429 | Rate limit terlampaui | `SRS.md 12 SRS-A15` |
| `PROVIDER_ERROR` | 502 | LLM gagal | `API_CONTRACT.md 9.2` |
| `TIMEOUT` | 504 | LLM timeout | `API_CONTRACT.md 9.2` |
| `INTERNAL` | 500 | Error tak terduga | `API_CONTRACT.md 9.2` |
| `BAD_GATEWAY` | 502 | Blob/Turso gagal | `API_CONTRACT.md 9.2` |
| `SERVICE_UNAVAILABLE` | 503 | Health degraded | `API_CONTRACT.md 9.2` |

### 5.2 Pola try/catch per Boundary

| Layer | Pola | Bukti |
|---|---|---|
| Route handler | `try { ... } catch (e) { return errorResponse(...) }`. Jangan swallow. | ASUMSI |
| Server Action | `try { ... return { ok: true, data } } catch (e) { return { ok: false, error: '...' } }`. | ASUMSI |
| Lib (ai, db, crypto) | Throw typed error (`AppError`), jangan catch di sini kecuali retry. | ASUMSI |
| Client Component | Catch fetch/Server Action result → toast error (`sonner`). | `UIUX_SPEC.md 3.1 (Toast)` |

### 5.3 Custom Error Class (ASUMSI)

```ts
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: Record<string, unknown>,
  ) { super(message); this.name = 'AppError'; }
}

export function errorResponse(code: string, status: number, zodError?: unknown) {
  const message = mapCodeToMessage(code);
  const details = zodError ? { fields: zodError } : undefined;
  return NextResponse.json({ error: { code, message, details }, traceId: crypto.randomUUID() }, { status });
}
```

### 5.4 Tidak Boleh Swallow

- ❌ `catch (e) {}` kosong.
- ❌ `catch (e) { console.log(e) }` tanpa rethrow / return error.
- ✅ `catch (e) { console.error('[generate]', e); throw new AppError('INTERNAL', 500, '...') }`.

### 5.5 Logging

| Konteks | Pola | Bukti |
|---|---|---|
| Structured log | `console.error('[scope]', { ...context })` JSON-friendly. | ASUMSI |
| `generation_logs` DB | Log tiap generate: provider, model, duration_ms, status, error_message. KPI K5. | `DATABASE_SCHEMA.md 4.8` ; `BRD.md 3.2` |
| Tidak bocor data sensitif | ❌ `console.log(apiKey)`, `console.log(user.password_hash)`. ✅ `console.log('[auth] user id:', userId)`. | `SRS.md 9.1 SEC-01/02` |
| Trace ID | `crypto.randomUUID()` per request, pass ke `traceId` error envelope + log. | `API_CONTRACT.md 3.3` |
| `error.tsx` UI | Route group `(dashboard)` + root wajib `error.tsx` (Client Component). Tampilkan fallback + retry button. | ASUMSI Next.js |
| Toast client | Error client → `toast.error(t('error.generic'))` (sonner). | `UIUX_SPEC.md 3.1, 13` |
| `aria-live` error | Toast error `aria-live="assertive"`, status `role="alert"`. | `UIUX_SPEC.md 9.3` |

---

## 6. Keamanan Koding

### 6.1 Tabel Keamanan Koding

| ID | Aturan | Implementasi | Bukti |
|---|---|---|---|
| SEC-C01 | API key user encrypt at rest | AES-256-GCM `lib/crypto/aes.ts`. `encrypt()` sebelum save DB, `decrypt()` server-side only di `provider-registry.ts`. | `SRS.md 9.1 SEC-01` ; `DATABASE_SCHEMA.md 11.1` |
| SEC-C02 | API key TIDAK expose ke client | Response API `apiKeyMasked` = `****` + 4 char terakhir (`mask()` helper). TIDAK return ciphertext/plaintext. | `SRS.md 9.1 SEC-02` ; `API_CONTRACT.md 6.5` |
| SEC-C03 | Server-only provider call | `lib/ai/*` wajib `import 'server-only'`. TIDAK ada panggilan LLM dari Client Component. | `SRS.md 9.1 SEC-03` ; `PROJECT_ARCHITECTURE.md 9 SB-01` |
| SEC-C04 | Server-only crypto | `lib/crypto/aes.ts` `import 'server-only'`. Decrypt hanya di `provider-registry.ts`. | `SRS.md 9.1 SEC-03` ; `PROJECT_ARCHITECTURE.md 9 SB-02` |
| SEC-C05 | No hardcoded secret | API key, JWT secret, encryption key WAJIB dari env (`process.env.*`). TIDAK ada literal di kode. `.env.example` dokumentasi tanpa value. | `SRS.md 9.1 SEC-08` |
| SEC-C06 | Env wajib ada + check | `if (!process.env.ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY')` di init. | ASUMSI (fail fast) |
| SEC-C07 | Parameterized query | Drizzle ORM bawaan parameterized. TIDAK ada string concat SQL (`db.run(\`SELECT * WHERE id=${x}\`)`). | `DATABASE_SCHEMA.md 8.3` (ASUMSI) |
| SEC-C08 | Input validation Zod | Semua input dari client (`req.json()`, form, query) WAJIB Zod parse di boundary. Bila fail → 400. | `SRS.md 9.1 SEC-06` ; `API_CONTRACT.md 8` |
| SEC-C09 | Output sanitization (XSS) | `title` & field teks: escape HTML (`<>"'&`) sebelum inject ke prompt LLM atau render. React auto-escape JSX, tapi hati-hati `dangerouslySetInnerHTML` (hindari). | `SRS.md 9.1 SEC-06` |
| SEC-C10 | RBAC ownership check | Semua query project/provider WAJIB filter `user_id = session.user.id`. Server check di repo + route handler. | `SRS.md 9.1 SEC-07` ; `DATABASE_SCHEMA.md 11.3` |
| SEC-C11 | Protected routes middleware | `src/middleware.ts` proteksi `/projects`, `/settings`, `/generate`, `/api/v1/*` (kecuali auth/health). Redirect `/login`. | `SRS.md 9.1 SEC-11` ; `API_CONTRACT.md 2.2` |
| SEC-C12 | CSRF protection | Next.js built-in Server Actions CSRF + NextAuth CSRF token. Jangan disable. | `SRS.md 9.1 SEC-05` |
| SEC-C13 | HTTPS only | Vercel default. TIDAK ada `http://` di prod (kecuali 9router localhost dev). | `SRS.md 9.1 SEC-09` |
| SEC-C14 | 9router localhost only | `http://localhost:20128/v1` hanya dev. Server-side only. Validasi: bila prod, reject 9router config. | ASUMSI SRS-A7 `RAG-CONTEXT.md 5.2` |
| SEC-C15 | No secret in client bundle | `NEXT_PUBLIC_*` = boleh expose. Selain itu TIDAK boleh di Client Component. Periksa `next build` tidak leak. | ASUMSI (Next.js) |
| SEC-C16 | Rate limit generate | ASUMSI 10 req/min/user via middleware. Header `X-RateLimit-*`. | `SRS.md 12 SRS-A15` ; `API_CONTRACT.md 10` |
| SEC-C17 | File upload validation | `/api/v1/upload` validasi mime `image/*`, max size 10MB (ASUMSI). TIDAK trust `Content-Type` saja — cek magic bytes bila perlu. | `SRS.md 5 (FR-17)` ; ASUMSI |
| SEC-C18 | Dependency audit | `npm audit` / Dependabot. Fix vuln high+ sebelum release. | ASUMSI (best practice) |
| SEC-C19 | Password hash | `bcryptjs` hash (10 rounds) sebelum save `users.password_hash`. TIDAK plaintext. | `DATABASE_SCHEMA.md 9.3` |
| SEC-C20 | Session expiry | NextAuth JWT refresh. ASUMSI 30 hari idle. | ASUMSI `API_CONTRACT.md 2.1` |
| SEC-C21 | CORS same-origin | Fase awal same-origin (app fullstack). TIDAK enable cross-origin API. | `API_CONTRACT.md 11.3` |

### 6.2 Checklist Keamanan per PR

- [ ] Tidak ada `any` yang leak input mentah ke LLM/DB
- [ ] Semua input via Zod parse
- [ ] Semua query filter `user_id`
- [ ] API key di encrypt sebelum save, mask di response
- [ ] Tidak ada `console.log` secret
- [ ] `import 'server-only'` di `lib/ai/*`, `lib/crypto/*`, `lib/db/*`
- [ ] Tidak ada hardcoded secret
- [ ] File upload validasi mime + size
- [ ] Error envelope konsisten
- [ ] CSRF (Server Action / NextAuth) aktif

---

## 7. Testing

### 7.1 Strategi Test

| Level | Tool | Scope | Target coverage | Bukti |
|---|---|---|---|---|
| Unit | Vitest | `lib/ai`, `lib/db`, `lib/crypto`, `lib/validation`, `lib/storage`, `lib/export` | >= 80% (ASUMSI) | `SRS.md 11.1` |
| Integration | Vitest + Turso test DB | API route handlers + Server Actions + DB query | >= 70% (ASUMSI) | `SRS.md 11.1` |
| E2E | Playwright | Flow: login → set provider → generate Shorts → save → export JSON; upload referensi → generate Tutorial → export markdown | Critical path 100% | `SRS.md 11.1` |
| Lint | ESLint + tsc | Seluruh `src/` | 0 error, 0 warning (ASUMSI strict) | `SRS.md 11.1` |

### 7.2 Aturan Test

| Aturan | Detail | Bukti |
|---|---|---|
| Co-located unit test | `*.test.ts` / `*.test.tsx` di samping file (atau `__tests__/`). `aes.test.ts` di `lib/crypto/`. | ASUMSI (Vitest convention) |
| E2E folder `e2e/` | `e2e/<flow>.spec.ts` di root. Playwright config `playwright.config.ts`. | ASUMSI (Playwright convention) |
| Mocking | Mock Drizzle (`vi.mock('@/lib/db/client')`) + AI SDK (`vi.mock('ai')`) di unit. Pakai Turso test DB di integration. | ASUMSI |
| AAA pattern | Arrange-Act-Assert. Satu test satu perilaku. | ASUMSI |
| Test naming | `describe('encrypt')` + `it('should encrypt and decrypt roundtrip', ...)` atau `it('mengembalikan ciphertext berbeda dari plaintext', ...)`. | ASUMSI |
| Snapshot selektif | Snapshot hanya untuk output stabil (markdown template). Hindari snapshot komponen (mudah false positive). | ASUMSI |
| `beforeEach` reset | Reset mock + DB test state di `beforeEach`. | ASUMSI |
| Coverage gate | CI gagal bila coverage < 80% (ASUMSI). Lapor via `vitest --coverage`. | `SRS.md 11.1` |
| Test i18n | Unit test validasi i18n key ada di kedua locale (id/en). | ASUMSI |
| Test a11y | E2E Playwright + axe-playwright untuk critical flow. Target 0 violation AA. | `UIUX_SPEC.md 9.1, 9.7` |
| Test data | Factory functions (`factories.ts`) untuk User, Project, ProviderConfig. Hindari duplikasi setup. | ASUMSI |
| No skip test | `it.skip` wajib alasan + issue link. Jangan akumulasi. | ASUMSI |
| Stream test | Mock `streamObject` return ReadableStream fake. Assert SSE event sequence. | ASUMSI |

### 7.3 Contoh Test

```ts
// lib/crypto/aes.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, mask } from './aes';

describe('aes', () => {
  beforeAll(() => { process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64'); });

  it('roundtrips encrypt → decrypt', () => {
    const enc = encrypt('sk-or-v1-xxxxx');
    expect(enc.ciphertext).not.toBe('sk-or-v1-xxxxx');
    expect(decrypt(enc)).toBe('sk-or-v1-xxxxx');
  });

  it('mask returns **** + last 4', () => {
    expect(mask('sk-or-v1-abcde')).toBe('****bcde');
    expect(mask('ab')).toBe('****');
  });
});
```

```ts
// lib/validation/schemas.test.ts
import { describe, it, expect } from 'vitest';
import { CreateProjectInputSchema } from './schemas';

describe('CreateProjectInputSchema', () => {
  it('rejects title < 3', () => {
    const r = CreateProjectInputSchema.safeParse({ title: 'ab', durationType: 'shorts', durationTargetSeconds: 60, styleType: '3D', aspectRatio: '16:9' });
    expect(r.success).toBe(false);
  });

  it('rejects shorts > 180s', () => {
    const r = CreateProjectInputSchema.safeParse({ title: 'Valid Title', durationType: 'shorts', durationTargetSeconds: 250, styleType: '3D', aspectRatio: '16:9' });
    expect(r.success).toBe(false);
  });
});
```

```ts
// e2e/generate-shorts.spec.ts
import { test, expect } from '@playwright/test';

test('generate shorts flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'demo@promptflow.local');
  await page.fill('[name=password]', 'demo123');
  await page.click('button[type=submit]');
  await page.waitForURL('/generate');
  await page.fill('[name=title]', 'Petualangan Hutan');
  await page.click('text=Lanjut');
  // ... step wizard ...
  await page.click('text=Generate');
  await expect(page.locator('[data-testid=result-tabs]')).toBeVisible({ timeout: 60000 });
});
```

---

## 8. Git Workflow & Commit

### 8.1 Branch Strategy

| Branch | Tujuan | Bukti |
|---|---|---|
| `main` | Production-ready. Deploy Vercel prod. Hanya via PR merge. TIDAK push langsung. | ASUMSI (best practice) |
| `feature/<scope>` | Fitur baru (`feature/provider-config`, `feature/sse-generate`). | ASUMSI |
| `fix/<scope>` | Bug fix (`fix/sse-stream`, `fix/crypto-mask`). | ASUMSI |
| `chore/<scope>` | Non-feature (`chore/deps`, `chore/lint-config`). | ASUMSI |
| `docs/<scope>` | Dokumen (`docs/coding-rules`). | ASUMSI |
| `refactor/<scope>` | Refactor tanpa behavior change. | ASUMSI |
| `test/<scope>` | Test only. | ASUMSI |
| `ci/<scope>` | CI/CD config. | ASUMSI |
| `perf/<scope>` | Performance. | ASUMSI |
| `style/<scope>` | Formatting/style only. | ASUMSI |

### 8.2 Conventional Commits

Format: `type(scope): subject\n\nbody\n\nfooter`

| Type | Penggunaan | Bukti |
|---|---|---|
| `feat` | Fitur baru | ASUMSI (Conventional Commits) |
| `fix` | Bug fix | ASUMSI |
| `docs` | Dokumen | ASUMSI |
| `refactor` | Refactor tanpa behavior change | ASUMSI |
| `test` | Test only | ASUMSI |
| `chore` | Build, deps, config, tooling | ASUMSI |
| `perf` | Performance | ASUMSI |
| `style` | Formatting, whitespace, typo | ASUMSI |
| `ci` | CI/CD config | ASUMSI |
| `build` | Build system | ASUMSI |
| `revert` | Revert commit | ASUMSI |

- `scope` opsional tapi disarankan (`feat(generate):`, `fix(crypto):`).
- `subject` imperative mood, lowercase, ≤72 char, no period.
- `body` opsional, jelaskan why (bukan what).
- `footer` `BREAKING CHANGE:` untuk breaking, atau `Closes #123` issue link.

**Contoh:**

```
feat(generate): add SSE streaming for prompt package

Pakai streamObject untuk partial output ke client. Token mulai mengalir <10s
sesuai NFR-P3. Fallback streamText + parse JSON bila provider tidak dukung
structured output.

Closes #42
```

```
fix(crypto): mask api key on provider update

PATCH provider tanpa apiKey field tidak boleh overwrite. Tambah guard bila
apiKey kosong skip encrypt.

BREAKING CHANGE: response field apiKeyEncrypted diganti apiKeyMasked
```

### 8.3 Atomic Commit

- Satu commit = satu perubahan logis. Jangan campur fitur + formatting + deps.
- Bila perubahan besar, pecah jadi beberapa commit kecil.
- Stage hanya file relevan (`git add <file>`), hindari `git add .` kecuali clean.

### 8.4 PR Template (ASUMSI)

```markdown
## Deskripsi

[apa yang diubah + why]

## Tipe

- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] test
- [ ] chore

## Checklist

- [ ] Type-safe (tsc --noEmit pass)
- [ ] No `any`
- [ ] Input validation (Zod)
- [ ] Ownership check (`user_id`)
- [ ] No hardcoded secret
- [ ] Test added (coverage >= 80%)
- [ ] Doc updated
- [ ] A11y (WCAG AA)
- [ ] i18n key (id + en)
- [ ] Lint pass (ESLint 0 warning)

## Test

[cara test, hasil]

## Breaking Change

- [ ] Tidak ada
- [ ] Ada (sebut)

## Issue

Closes #...
```

### 8.5 Review

- Minimal 1 review approval sebelum merge `main` (ASUMSI).
- Reviewer cek §10 checklist.
- Squash merge (ASUMSI) ke `main`, conventional commit subject dipertahankan.

Sitasi: ASUMSI (Conventional Commits + best practice GitHub).

---

## 9. Linting & Formatting

### 9.1 ESLint

| Aturan | Detail | Bukti |
|---|---|---|
| `next lint` | Next.js default ESLint config (`@next/eslint-config-next`). | `SRS.md 4.1, 11.1` (ASUMSI) |
| TypeScript rules | `@typescript-eslint/no-explicit-any` (error), `@typescript-eslint/no-unused-vars` (error, except `_` prefix), `@typescript-eslint/consistent-type-imports` (warn). | ASUMSI |
| Import order | `eslint-plugin-import` sort: external → internal (`@/`) → relative → type. Sesuaikan §3.2. | ASUMSI |
| Accessibility | `eslint-plugin-jsx-a11y` (Next.js bundel). 0 violation. | `UIUX_SPEC.md 9` |
| React hooks | `eslint-plugin-react-hooks` (rules-of-hooks, exhaustive-deps). | ASUMSI (React) |
| Strict | 0 error, 0 warning (ASUMSI). CI fail bila ada. | `SRS.md 11.1` |

**`.eslintrc.json` rekomendasi (ASUMSI):**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript", "plugin:jsx-a11y/strict"],
  "plugins": ["import"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": "warn",
    "import/order": ["warn", { "groups": ["builtin", "external", "internal", "parent", "sibling", "type"], "pathGroups": [{ "pattern": "@/**", "group": "internal" }], "newlines-between": "always" }]
  }
}
```

### 9.2 Biome (opsional, ASUMSI)

Paket konteks sebut Biome opsional. Bila dipakai:

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true, "rules": { "recommended": true, "suspicious/noExplicitAny": "error" } },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 }
}
```

Hindari pakai Biome + ESLint bersamaan (konflik). Pilih satu. ASUMSI default: ESLint (Next.js native).

### 9.3 Prettier (opsional, ASUMSI)

Bila pakai Prettier (bukan Biome):

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 9.4 husky + lint-staged (ASUMSI)

Pre-commit hook:

```json
// package.json
{
  "scripts": { "lint": "next lint", "typecheck": "tsc --noEmit", "test": "vitest run" },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

### 9.5 Type Check

- `tsc --noEmit` wajib pass sebelum commit/PR.
- CI jalankan `tsc --noEmit` + `next lint` + `vitest run` + `playwright test`.
- 0 error. Sitasi: `SRS.md 11.1`.

### 9.6 Format Command

```bash
# Format semua
npx prettier --write .
# atau bila Biome
npx biome format --write .
```

---

## 10. PR Review Checklist (Definition of Done Koding)

Sebelum PR dianggap selesai, semua checklist WAJIB ✓:

### 10.1 Type & Lint

- [ ] `tsc --noEmit` pass (0 error)
- [ ] `next lint` pass (0 error, 0 warning)
- [ ] Tidak ada `any` (atau ada `// eslint-disable` + alasan kuat)
- [ ] Import order sesuai §3.2
- [ ] Format konsisten (Prettier/Biome)

### 10.2 Validasi & Security

- [ ] Semua input via Zod parse di boundary
- [ ] Tidak ada query DB tanpa filter `user_id` (ownership)
- [ ] Tidak ada hardcoded secret (env only)
- [ ] `import 'server-only'` di `lib/ai/*`, `lib/crypto/*`, `lib/db/*`, `lib/storage/*`
- [ ] API key di encrypt sebelum save, mask di response
- [ ] Tidak ada `console.log` secret
- [ ] Error envelope konsisten (§5.1)
- [ ] File upload validasi mime + size (bila touch upload)

### 10.3 Test

- [ ] Unit test added untuk logic baru
- [ ] Coverage >= 80% (ASUMSI)
- [ ] E2E test untuk critical flow baru
- [ ] Test pass (`vitest run` + `playwright test`)
- [ ] No `it.skip` tanpa alasan

### 10.4 Dokumen & i18n

- [ ] Doc update (README, AGENTS.md bila ada, JSDoc di function publik)
- [ ] i18n key di kedua locale (`messages/id.json` + `messages/en.json`) untuk label baru
- [ ] Tidak ada teks hardcode di UI (harus i18n key)

### 10.5 Aksesibilitas

- [ ] WCAG 2.1 AA (kontras, keyboard, ARIA, focus visible)
- [ ] `aria-label` di icon-only button
- [ ] `aria-live` di region streaming/toast
- [ ] `lang` attribute ikut locale

### 10.6 Design Tokens

- [ ] Pakai token dari `UIUX_SPEC.md 2` (warna, spacing, radius, motion, z-index)
- [ ] Tidak hardcode hex/px (kecuali dynamic via CSS var)
- [ ] `cn()` utility untuk merge class

### 10.7 Performance

- [ ] Tidak ada N+1 query (eager/`with` relation bila perlu)
- [ ] `useMemo`/`useCallback` selektif (hanya expensive)
- [ ] RSC untuk data fetch (hindari `useEffect` + `fetch`)
- [ ] Streaming SSE untuk generate (anti-timeout)
- [ ] Index DB sesuai `DATABASE_SCHEMA.md 5` untuk query baru

### 10.8 Konsistensi

- [ ] Penamaan sesuai §2
- [ ] Struktur folder sesuai §3.1
- [ ] Layer tanggung jawab sesuai §3.4
- [ ] Conventional commit message

---

## 11. CI/CD

### 11.1 GitHub Actions (ASUMSI)

Workflow `.github/workflows/ci.yml`:

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
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck   # tsc --noEmit
      - run: npm run lint        # next lint
      - run: npm run test:unit   # vitest run --coverage
      - run: npm run build       # next build
      - uses: actions/upload-artifact@v4
        if: always()
        with: { name: coverage, path: coverage/ }

  e2e:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e    # playwright test
```

### 11.2 Deploy Vercel (ASUMSI)

| Event | Target | Env | Bukti |
|---|---|---|---|
| PR dibuka/diupdate | Vercel preview deployment per PR | preview env (Turso test, mock LLM) | `RAG-CONTEXT.md 2.1` (ASUMSI) |
| Push/merge `main` | Vercel production | prod env (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL`) | `PROJECT_ARCHITECTURE.md 8` |

### 11.3 Migration Prod

- Dev: `drizzle-kit push`.
- Prod: SQL migration file manual via `turso db shell <db-name> < drizzle/000X_<name>.sql`. ASUMSI.
- Sitasi: `DATABASE_SCHEMA.md 8.4`.

### 11.4 Health Check

- `GET /api/v1/health` public. Return status + DB + env. ASUMSI.
- Sitasi: `API_CONTRACT.md 6.2`.

---

## 12. Standar Frontend (Design Tokens & A11y)

### 12.1 Design Tokens WAJIB dari UIUX_SPEC

Token di `src/app/globals.css` (`@theme` Tailwind v4 + CSS vars shadcn). Agent
eksekutor frontend WAJIB pakai token, TIDAK hardcode nilai yang sudah
didefinisikan token.

| Kategori | Token | Sumber |
|---|---|---|
| Warna | `--color-background`, `--color-foreground`, `--color-primary` (`#7c3aed`), `--color-primary-foreground`, `--color-secondary`, `--color-muted`, `--color-accent`, `--color-destructive`, `--color-success`, `--color-warning`, `--color-info`, `--color-border`, `--color-input`, `--color-ring` | `UIUX_SPEC.md 2.1, 2.10` |
| Tipografi | `--font-sans` (Inter), `--font-mono` (JetBrains Mono); size scale `text-xs`...`text-5xl` | `UIUX_SPEC.md 2.3, 2.4` |
| Spacing | `space-1` (4px)...`space-24` (96px) | `UIUX_SPEC.md 2.5` |
| Radius | `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), `--radius-xl` (12px), `--radius-full` | `UIUX_SPEC.md 2.6` |
| Shadow | `--shadow-xs`...`--shadow-xl` | `UIUX_SPEC.md 2.6` |
| Container | `--container-sm` (640px)...`--container-2xl` (1536px), `--container-gutter` | `UIUX_SPEC.md 2.7` |
| Motion | `--motion-fast` (120ms), `--motion-base` (200ms), `--motion-slow` (320ms), `--motion-skeleton` (1500ms), `--motion-progress` (800ms) | `UIUX_SPEC.md 2.8` |
| Z-index | `--z-base` (0), `--z-dropdown` (1000), `--z-sticky` (1100), `--z-toast` (1200), `--z-modal` (1300), `--z-tooltip` (1400) | `UIUX_SPEC.md 2.9` |

### 12.2 Komponen WAJIB dari UIUX_SPEC

- shadcn/ui (`components/ui/*`): Button, Input, Textarea, Select, Form, Card,
  Dialog, Tabs, Toast/Sonner, Table, Badge, Skeleton, Alert, Label, Tooltip,
  Avatar, DropdownMenu, Separator, ScrollArea, Progress, Checkbox, Switch,
  Collapsible, Breadcrumb. Jangan tulis ulang. Sitasi: `UIUX_SPEC.md 3.1`.
- Custom domain (`components/{generate,projects,settings,common}/*`):
  `PromptCard`, `SceneCard`, `CharacterCard`, `ImagePromptList`,
  `ProviderConfigForm`, `WizardStep`, `ResultTabs`, `DropzoneUploader`,
  `CopyButton`, `ExportMenu`, `GenerateProgress`, `EmptyState`,
  `ErrorBoundary`, `LanguageToggle`, `ThemeToggle`, `AppHeader`, `AppFooter`.
  Sitasi: `UIUX_SPEC.md 3.2, 3.3`.

### 12.3 Struktur Komponen Ikut PROJECT_ARCHITECTURE

- `src/components/ui/` = shadcn/ui (copy-paste, minim edit).
- `src/components/common/` = shared (header, footer, copy, empty, error,
  toggle).
- `src/components/generate/` = wizard + result.
- `src/components/projects/` = list + detail.
- `src/components/settings/` = provider form.
- Sitasi: `PROJECT_ARCHITECTURE.md 5` ; `UIUX_SPEC.md 3.3`.

### 12.4 Aksesibilitas (WCAG 2.1 AA)

- Kontras >= 4.5:1 body, >= 3:1 large/UI border. Verifikasi Axe/Lighthouse.
- Keyboard nav: semua interaktif reachable Tab. Skip link "Lewati ke konten".
- Focus visible: outline `--ring` 2px solid, offset 2px. TIDAK `outline: none`
  tanpa pengganti.
- Modal: focus trap, Tab sirkular, Esc tutup.
- `aria-label` icon-only button, `aria-expanded` Collapsible/Dropdown,
  `aria-selected` Tabs, `aria-live="polite"` streaming, `aria-live="assertive"`
  toast error, `role="alert"` Alert, `role="status"` toast success.
- Form: `<label htmlFor>` + `aria-invalid` + `aria-describedby` ke pesan error.
- `lang` attribute ikut locale.
- `prefers-reduced-motion: reduce` nonaktifkan animasi non-esensial.
- Sitasi: `UIUX_SPEC.md 9` ; `PRD.md 6.6`.

### 12.5 i18n Key WAJIB

- Semua teks UI (label, placeholder, tombol, pesan error, empty state) WAJIB
  via i18n key (`useTranslations` / `getTranslations`). TIDAK hardcode teks
  ID/EN di JSX.
- Key namespaced: `common.*`, `generate.*`, `projects.*`, `settings.*`,
  `error.*`.
- Bundel `messages/id.json` + `messages/en.json` sinkron (unit test verify).
- Sitasi: `SRS.md 5 (FR-19)` ; `UIUX_SPEC.md 1.4`.

---

## 13. Larangan Umum

| # | Larangan | Alasan |
|---|---|---|
| L01 | Mutasi langsung state React (`state.x = y`) | Gunakan `setState` / immutable update |
| L02 | Magic number tanpa konstanta | Ekstrak ke konstanta named (`MAX_CHARACTERS_PER_PROJECT = 10`) |
| L03 | Nesting > 3 level (if/for/switch) | Pecah ke function/helper |
| L04 | `console.log` tertinggal di prod | Pakai logger atau hapus sebelum commit (kecuali `console.error` structured) |
| L05 | Dependency tidak dipin (dead code) | Hapus import/variabel tidak terpakai (`@typescript-eslint/no-unused-vars`) |
| L06 | `any` tanpa alasan | Pakai `unknown` + Zod narrow |
| L07 | Hardcoded secret | Env only |
| L08 | Hardcode hex/px di className | Pakai token (UIUX_SPEC §2) |
| L09 | Hardcode teks UI (bukan i18n key) | Pakai `useTranslations` / `getTranslations` |
| L10 | `useEffect` untuk derived state | Pakai compute saat render / `useMemo` |
| L11 | `index` sebagai `key` list | Pakai id stabil |
| L12 | Query DB tanpa filter `user_id` | Ownership wajib |
| L13 | `select()` semua kolom tanpa perlu | Explicit column select |
| L14 | String concat SQL | Drizzle parameterized |
| L15 | `dangerouslySetInnerHTML` tanpa sanitasi | Hindari, atau sanitasi strict |
| L16 | `eval` / `new Function` | Tidak pernah |
| L17 | `process.env.X!` tanpa guard | Guard `if (!env) throw` di init |
| L18 | `outline: none` tanpa pengganti | Focus visible wajib |
| L19 | `git add .` tanpa cek status | Stage file relevan saja |
| L20 | Commit langsung ke `main` | Lewat PR + review |
| L21 | `it.skip` tanpa alasan + issue link | Hapus atau selesaikan |
| L22 | Snapshot komponen UI (false positive mudah) | Snapshot hanya output stabil (markdown) |
| L23 | `any` di Zod schema output LLM | Schema WAJIB explicit (`z.object`, `z.string`, dll) |
| L24 | Panggilan LLM dari Client Component | Server-only (`lib/ai/*`) |
| L25 | Decrypt API key di Client Component | Server-only (`lib/crypto/*`) |
| L26 | `fetch('/api/...')` manual untuk internal mutation | Pakai Server Action |
| L27 | `'use client'` di root layout bila tidak perlu | Hanya komponen interaktif |
| L28 | `useState` + `useEffect` untuk data fetch SSR | Pakai RSC + `fetch` server-side |
| L29 | File > 300 baris | Pecah ke modul |
| L30 | Function > 60 baris | Pecah ke helper |

---

## 14. Asumsi Coding + Referensi

### 14.1 Asumsi Coding

| ID | Asumsi | Status Bukti | Dampak | Sitasi |
|---|---|---|---|---|
| CR-A1 | ORM = Drizzle (bukan Prisma/raw libsql) | TIDAK ADA BUKTI preferensi user | RAG menyebut raw/Prisma alternatif | `RAG-CONTEXT.md 9 G7` ; ASUMSI SRS-A3 |
| CR-A2 | Enkripsi AES-256-GCM via env `ENCRYPTION_KEY` | TIDAK ADA BUKTI mekanisme spesifik | Bisa defer ke secret manager | `RAG-CONTEXT.md 11 #4` ; ASUMSI SRS-A4 |
| CR-A3 | Storage gambar prod = Vercel Blob | ASUMSI rekomendasi | Bisa S3/R2 | `RAG-CONTEXT.md 9 G3` ; ASUMSI SRS-A5 |
| CR-A4 | Auth = NextAuth credentials provider | TIDAK ADA BUKTI preferensi | Bisa OAuth nanti | `RAG-CONTEXT.md 9 G2` ; ASUMSI SRS-A1 |
| CR-A5 | i18n = next-intl | TIDAK ADA BUKTI preferensi lib | Bisa native App Router i18n | `RAG-CONTEXT.md 9 G5` ; ASUMSI SRS-A2 |
| CR-A6 | Streaming SSE untuk generasi panjang | ASUMSI | Hindari Vercel timeout | `RAG-CONTEXT.md 5.4, 9 G6` ; ASUMSI SRS-A6 |
| CR-A7 | Retry LLM 3x backoff | ASUMSI | Bisa beda | ASUMSI SRS-A14 |
| CR-A8 | Rate limit 10 req/min/user endpoint generate | ASUMSI | Middleware | ASUMSI SRS-A15 |
| CR-A9 | Timestamp = integer unix epoch second | ASUMSI | Bisa ISO-8601 TEXT | `DATABASE_SCHEMA.md 1.3` |
| CR-A10 | Coverage target 80% unit | ASUMSI | Bisa beda | `SRS.md 11.1` |
| CR-A11 | Biome/Prettier opsional | ASUMSI | Pilih satu, jangan campur | Paket konteks |
| CR-A12 | husky + lint-staged pre-commit | ASUMSI | Best practice | ASUMSI |
| CR-A13 | Conventional commits | ASUMSI | Best practice | ASUMSI |
| CR-A14 | Versioning `/api/v1` URI prefix | ASUMSI | Bisa `/api/*` murni | `API_CONTRACT.md 1.3` |
| CR-A15 | Password hash bcryptjs | ASUMSI | Bisa argon2 | `DATABASE_SCHEMA.md 9.3` |
| CR-A16 | Session strategy JWT cookie | ASUMSI | Bisa Turso adapter | ASUMSI ARCH-A13 |
| CR-A17 | File upload max 10MB | ASUMSI | Bisa beda | `SRS.md 5 (FR-17)` |
| CR-A18 | Soft delete window 30 hari, log 90 hari | ASUMSI | Bisa beda | `DATABASE_SCHEMA.md 10.2` |
| CR-A19 | Batas tokoh 10 per project | ASUMSI | Bisa beda | `DATABASE_SCHEMA.md 12.6` ; ASUMSI SRS-A10 |
| CR-A20 | ESLint default + plugin (bukan Biome) | ASUMSI | Next.js native | `SRS.md 4.1, 11.1` |

### 14.2 Referensi Internal

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| SRS | `C:\laragon\www\PromptFlow\product-docs\SRS.md` |
| DATABASE_SCHEMA | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` |
| PROJECT_ARCHITECTURE | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` |
| API_CONTRACT | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` |
| UIUX_SPEC | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### 14.3 Sitasi Eksternal Kunci

| Sitasi | Klaim didukung | Bagian |
|---|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | `createOpenAICompatible`, structured output, streaming | 4.7 |
| https://openrouter.ai/docs/api/reference/authentication | OpenRouter base URL, Bearer, header opsional | 4.7 |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat `https://ollama.com/v1` | 4.7 |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js setup | 4.6 |
| https://turso.tech/blog/serverless | Vercel FS tidak persisten | 4.6 |
| https://ui.shadcn.com/docs/installation/next | shadcn/ui Next.js | 4.5, 12.2 |
| https://ui.shadcn.com/docs/tailwind-v4 | shadcn/ui Tailwind v4 | 4.4, 12.1 |
| https://nextjs.org/docs | Next.js App Router, RSC, Server Actions | 4.2 |
| https://orm.drizzle.team | Drizzle ORM, repository, migration | 4.6 |

---

**Dokumen ini fokus pada ATURAN KODING konkret siap eksekusi. Tujuan bisnis
di BRD, pasar di MRD, produk di PRD, spesifikasi teknis di SRS, skema data di
DATABASE_SCHEMA, arsitektur di PROJECT_ARCHITECTURE, kontrak API di
API_CONTRACT, design system di UIUX_SPEC. CODING_RULES tidak membangun
deliverable akhir / menulis kode produk — hanya aturan.**

> **Dibuat oleh:** docgen-coding-rules subagent
> **Tanggal:** 2026-06-19
> **Versi:** 1.0
