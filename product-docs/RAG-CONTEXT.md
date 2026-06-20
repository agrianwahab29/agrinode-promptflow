# RAG-CONTEXT.md — PromptFlow V2 Upgrade
> **Sumber kebenaran faktual** untuk pipeline docgen V2
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Docs dir:** `C:\laragon\www\PromptFlow\product-docs`
> **Diperbarui:** 2026-06-20
> **Catatan:** Dokumen ini berisi fakta dari kode existing (V1) + analisis kebutuhan V2. Tiap klaim bersitasi path file + line range atau section.

---

## Daftar Isi

1. [Ringkasan Temuan](#1-ringkasan-temuan)
2. [Tech Stack Terdeteksi](#2-tech-stack-terdeteksi)
3. [Struktur Proyek Inti](#3-struktur-proyek-inti)
4. [Entitas/Data Model](#4-entitasdata-model)
5. [Constraint Nyata](#5-constraint-nyata)
6. [Aktor/Role](#6-aktorrole)
7. [Aset Terdeteksi](#7-aset-terdeteksi)
8. [Analisis Kode V1 (Bukti per File)](#8-analisis-kode-v1)
9. [Analisis Kebutuhan V2](#9-analisis-kebutuhan-v2)
10. [Best Practices & Pengetahuan Umum](#10-best-practices)
11. [Gap Analysis](#11-gap-analysis)
12. [Asumsi V2](#12-asumsi-v2)
13. [Daftar Sitasi Lengkap](#13-daftar-sitasi-lengkap)

---

## 1. Ringkasan Temuan

### FAKTA (berbasis bukti kode)
- **Proyek sudah bukan greenfield.** Kode V1 sudah terbangun lengkap dengan 9 tabel DB, auth NextAuth, upload Vercel Blob, generate SSE streaming, export JSON/markdown, i18n dwibahasa, 21 endpoint API.
- **Stack verified:** Next.js 15 App Router + React 19 + AI SDK v4 (tercatat di package.json sebagai `ai: ^4.0.0`, bukan v6) + Turso/libSQL + Drizzle ORM + Tailwind v4 + shadcn/ui + NextAuth v5 beta + Vitest + Playwright + pnpm.
- **Deploy belum ke Vercel prod** — kode berjalan di Laragon localhost (path `C:\laragon\www\PromptFlow`).
- **product-docs lengkap:** 14 dokumen (BRD, MRD, PRD, SRS, DATABASE_SCHEMA, PROJECT_ARCHITECTURE, UIUX_SPEC, API_CONTRACT, CODING_RULES, TEST_PLAN, REVIEW_REPORT, AGENTS.md, EXECUTION-PROMPT.md, RAG-CONTEXT.md).
- **V2 upgrade diminta user** dengan 10 item spesifik (lihat §9).

### ASUMSI
- Semua asumsi yang tertulis di product-docs/ masih berlaku kecuali user perbarui.

---

## 2. Tech Stack Terdeteksi

| Lapisan | Teknologi | Versi (dari package.json) | Sitasi |
|---|---|---|---|
| Framework | Next.js | ^15.1.0 | `package.json:22` |
| UI Library | React + ReactDOM | ^19.0.0 | `package.json:23-24` |
| AI SDK | `ai` (Vercel AI SDK) | ^4.0.0 (**CATATAN: docs sebut v6, kodenya v4**) | `package.json:25` |
| AI Provider | `@ai-sdk/openai-compatible` | ^1.0.0 | `package.json:26` |
| Validasi | Zod | ^3.24.0 | `package.json:27` |
| Auth | next-auth | 5.0.0-beta.25 | `package.json:28` |
| Auth Core | `@auth/core` | ^0.37.0 | `package.json:29` |
| Password Hash | bcryptjs | ^2.4.3 | `package.json:30` |
| DB Client | `@libsql/client` | ^0.14.0 | `package.json:31` |
| ORM | drizzle-orm | ^0.38.0 | `package.json:32` |
| ORM Kit | drizzle-kit | ^0.30.0 | `package.json:33` |
| Storage | `@vercel/blob` | ^0.27.0 | `package.json:34` |
| i18n | next-intl | ^3.26.0 | `package.json:35` |
| Icons | lucide-react | ^0.468.0 | `package.json:36` |
| Form | react-hook-form | ^7.54.0 | `package.json:37` |
| Form Resolvers | `@hookform/resolvers` | ^3.10.0 | `package.json:38` |
| Toast | sonner | ^1.7.0 | `package.json:39` |
| UI Primitives | Radix UI (14 paket: slot, dialog, dropdown-menu, label, select, tabs, tooltip, avatar, checkbox, progress, separator, switch, collapsible, scroll-area) | ^1.1.0–^1.2.0 | `package.json:44-57` |
| UI Helpers | clsx + tailwind-merge + class-variance-authority | ^2.1.1 / ^2.5.0 / ^0.7.1 | `package.json:41-43` |
| TypeScript | typescript | ^5.7.0 | `package.json:60` |
| Tailwind CSS | tailwindcss | ^4.0.0 | `package.json:70` |
| PostCSS | `@tailwindcss/postcss` + postcss + autoprefixer | ^4.0.0 / ^8.4.0 / ^10.4.0 | `package.json:71-73` |
| Test Unit | vitest | ^2.1.0 | `package.json:74` |
| Test Coverage | `@vitest/coverage-v8` | ^2.1.0 | `package.json:75` |
| Test E2E | `@playwright/test` | ^1.49.0 | `package.json:77` |
| Lint | eslint + eslint-config-next | ^9.17.0 / ^15.1.0 | `package.json:65-66` |
| TS ESLint | `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` | ^8.18.0 | `package.json:67-68` |
| Format | prettier + prettier-plugin-tailwindcss | ^3.4.0 / ^0.6.0 | `package.json:78-79` |
| Package Manager | pnpm | 11.7.0 | `package.json:81` |
| Runtime | Node.js (server-only imports) | N/A | `package.json:14` (`server-only`) |
| DB Engine | Turso (libSQL via HTTP) | latest | `drizzle.config.ts:12` |

### KETIDAKSESUAIAN VERSI
- **Product docs (AGENTS.md §3, SRS §4.1, BRD §1) menyebut "AI SDK v6"** tapi `package.json` mencatat `"ai": "^4.0.0"`. Ini ketidakkonsistenan docs vs kode. Kode = ground truth.
  - Sitasi: `package.json:25` vs `AGENTS.md §3 (baris AI SDK v6)` vs `SRS.md §4.1`

---

## 3. Struktur Proyek Inti

### Folder Utama
```
PromptFlow/
├── product-docs/          (14 dokumen product)
├── drizzle/               (migration SQL output)
├── messages/              (i18n: id.json, en.json)
├── public/references/     (dev upload local FS)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   (NextAuth handler)
│   │   │   └── v1/
│   │   │       ├── generate/route.ts         (POST SSE streaming)
│   │   │       ├── upload/route.ts           (POST/DELETE multipart)
│   │   │       ├── register/route.ts         (POST register)
│   │   │       ├── health/route.ts           (GET health)
│   │   │       ├── projects/route.ts         (GET list, POST create)
│   │   │       ├── projects/[id]/route.ts    (GET, PATCH)
│   │   │       ├── projects/[id]/delete/route.ts (POST soft delete)
│   │   │       ├── projects/[id]/export/route.ts (GET JSON/markdown)
│   │   │       ├── projects/[id]/characters/route.ts
│   │   │       ├── projects/[id]/scenes/route.ts
│   │   │       ├── projects/[id]/image-prompts/route.ts
│   │   │       ├── projects/[id]/logs/route.ts
│   │   │       └── settings/providers/       (CRUD + test)
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                    (root + i18n provider)
│   │   │   ├── page.tsx                      (redirect)
│   │   │   ├── generate/page.tsx             (server → GenerateForm)
│   │   │   ├── projects/page.tsx             (server list)
│   │   │   ├── projects/[id]/page.tsx        (server detail + refs)
│   │   │   ├── projects/[id]/history/page.tsx
│   │   │   ├── dashboard/page.tsx            (server KPI)
│   │   │   ├── settings/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── layout.tsx                        (root HTML)
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              (13 shadcn components: alert, badge, button, card, dialog, input, label, select, skeleton, table, tabs, textarea)
│   │   ├── generate/        (generate-form, dropzone-uploader, result-tabs, template-picker)
│   │   ├── projects/        (project-card, delete-project-button)
│   │   ├── settings/        (provider-config-form, provider-card)
│   │   ├── common/          (app-header, language-toggle, copy-button)
│   │   └── providers.tsx    (SessionProvider wrapper)
│   └── lib/
│       ├── ai/              (prompt-builder, llm-client, provider-registry, consistency-checker, response-parser, prompts/*.system.ts)
│       ├── db/              (client, schema, cache, repositories/*.repo.ts — 9 repos)
│       ├── storage/blob.ts  (Vercel Blob + local FS fallback)
│       ├── auth/            (config.ts NextAuth, middleware.ts protected route helper)
│       ├── crypto/aes.ts   (AES-256-GCM encrypt/decrypt/mask)
│       ├── i18n/            (config.ts, request.ts)
│       ├── validation/schemas.ts (Zod input + PromptPackageSchema)
│       ├── export/markdown.template.ts
│       ├── api/error.ts     (errorResponse, successResponse, noContentResponse)
│       ├── templates/titles.ts (TemplatePicker data)
│       └── utils.ts         (cn helper)
├── middleware.ts            (NextAuth + i18n + rate limit)
├── drizzle.config.ts        (Turso dialect)
├── next.config.ts           (next-intl plugin + Vercel Blob images)
├── package.json
└── tsconfig.json
```
- Sitasi: struktur folder berdasarkan glob `src/**/*.ts` + `src/**/*.tsx` pada 2026-06-20.

### File Count
- **57 file TypeScript** (*.ts)
- **35 file TSX** (*.tsx)
- **14 product docs** (*.md di product-docs/)
- Sitasi: glob results

---

## 4. Entitas/Data Model

9 tabel teridentifikasi dari `src/lib/db/schema.ts`:

| # | Tabel | PK | Kolom Kunci | Index | Sitasi |
|---|---|---|---|---|---|
| 1 | `users` | `id` (auto-increment) | email (unique), name, password_hash, image, role (default 'user'), created_at, updated_at | — | `schema.ts:5-14` |
| 2 | `provider_configs` | `id` | user_id (FK→users CASCADE), provider, name, base_url, model, api_key_encrypted, is_active (default 1) | idx_provider_configs_user_name (unique: user_id+name) | `schema.ts:17-30` |
| 3 | `projects` | `id` | user_id (FK→users CASCADE), title, duration_type, duration_target_seconds, style_type, aspect_ratio, result_json (TEXT), status (default 'draft'), deleted_at (soft delete) | idx_projects_user_id, idx_projects_user_created | `schema.ts:33-49` |
| 4 | `asset_references` | `id` | project_id (FK→projects CASCADE), tipe, filename, blob_url, label, mime_type, size_bytes | idx_asset_refs_project_id, idx_asset_refs_project_tipe | `schema.ts:52-65` |
| 5 | `characters` | `id` | project_id (FK→projects CASCADE), nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran | idx_characters_project_id, idx_characters_project_nama (unique) | `schema.ts:68-84` |
| 6 | `scenes` | `id` | project_id (FK→projects CASCADE), order_no, description, voiceover_script | idx_scenes_project_id, idx_scenes_project_order (unique) | `schema.ts:87-97` |
| 7 | `image_prompts` | `id` | project_id (FK→projects), scene_id (FK→scenes, nullable), tipe, target, prompt_text, reference_filename | 4 indexes | `schema.ts:100-114` |
| 8 | `generation_logs` | `id` | project_id (FK→projects CASCADE), provider, model, duration_ms, status, error_message | idx_gen_logs_project_id, idx_gen_logs_project_created | `schema.ts:117-129` |
| 9 | `supporting_characters` | `id` | project_id (FK→projects CASCADE), scene_id (FK→scenes, nullable), nama, tipe, aksi | idx_supporting_chars_project_id, idx_supporting_chars_scene_id | `schema.ts:132-143` |

### Relasi (dari schema FK)
- `users` 1:N → `provider_configs`, `projects`
- `projects` 1:N → `asset_references`, `characters`, `scenes`, `image_prompts`, `generation_logs`, `supporting_characters`
- `scenes` 1:N → `image_prompts` (scene_id nullable), `supporting_characters` (scene_id nullable)
- Sitasi: `schema.ts:1-163`

### Inferred Types
- Tersedia di `schema.ts:146-163`: User, NewUser, ProviderConfig, NewProviderConfig, Project, NewProject, AssetReference, NewAssetReference, Character, NewCharacter, Scene, NewScene, ImagePrompt, NewImagePrompt, GenerationLog, NewGenerationLog, SupportingCharacter, NewSupportingCharacter.
- Sitasi: `schema.ts:145-163`

### CATATAN V2: Field Tabel asset_references untuk Image Reference
- Kolom `tipe` = `'tokoh' | 'background'` (hanya 2 opsi saat ini).
- **V2 perlu** menambah opsi seperti `'prop'`, `'props'`, atau klasifikasi lebih granular.
- Sitasi: `schema.ts:55` — `tipe: text('tipe').notNull()` (tanpa enum constraint di DB; di-enforce di route handler `upload/route.ts:32-33`)

---

## 5. Constraint Nyata

### A. Upload Constraint
- **Max file size:** 10 MB (`upload/route.ts:11`)
- **Allowed MIME:** `image/(png|jpe?g|gif|webp|svg+xml)` (`upload/route.ts:12`)
- **Tipe validation:** hanya `'tokoh'` atau `'background'` (`upload/route.ts:32-33`)
- **Storage:** dual-mode — Vercel Blob (`USE_VERCEL_BLOB=true`) atau local FS `public/references/` (`blob.ts:6,21-28`)
- **Filename:** sanitized + random UUID suffix, max 60 char base (`blob.ts:33`)
- Sitasi: `upload/route.ts:11-36`, `blob.ts:30-37`

### B. Generate Constraint
- **Runtime:** `nodejs`, maxDuration 600s, force-dynamic (`generate/route.ts:16-18`)
- **Rate limit:** 10 req/min per user (`middleware.ts:82-83`)
- **LLM timeout:** AbortSignal 240,000ms (4 menit) per call (`llm-client.ts:48`)
- **Max retries:** 2 (default) dengan exponential backoff max 8000ms (`llm-client.ts:14,131`)
- **LLM max_tokens:** 32768 (`llm-client.ts:44`)
- **LLM temperature:** 0.7 (`llm-client.ts:45`)
- **Stream mode:** non-streaming `stream: false` di LLM call, tapi SSE streaming dari route handler ke client (`llm-client.ts:46`, `generate/route.ts:72-165`)
- Sitasi: `generate/route.ts:16-18`, `llm-client.ts:14,37-48,131`, `middleware.ts:79-97`

### C. Auth Constraint
- **NextAuth credentials only** (email + password) (`config.ts:16-38`)
- **JWT session strategy** (`config.ts:13`)
- **bcryptjs** password comparison (`config.ts:33`)
- **Protected routes** via `requireSession()` — semua page + API v1 kecuali auth/health/register
- **Public paths:** login, register, api/auth, api/v1/auth, api/v1/health, _next, favicon, robots (`middleware.ts:6-15`)
- Sitasi: `config.ts:1-76`, `middleware.ts:1-131`

### D. Validation Constraint
- **TitleSchema:** min 3, max 200, trim (`schemas.ts:63`)
- **Duration:** shorts max 180s; tutorial 420-900s (`schemas.ts:84-89`)
- **Style:** enum '3D' | '2D' (`schemas.ts:70-73`)
- **ProviderEnum:** 'ollama' | 'openrouter' | '9router' | 'custom' (`schemas.ts:93`)
- **GenerateReferenceSchema:** name (string min 1), type ('tokoh' | 'background') (`schemas.ts:106-109`)
- **PromptPackageSchema:** LLM output validation (`schemas.ts:40-58`)
- Sitasi: `schemas.ts:1-178`

### E. Project Constraint
- **Status enum:** 'draft' | 'generating' | 'complete' | 'failed' (`schemas.ts:147`)
- **Soft delete:** `deleted_at` nullable
- **Ownership:** semua query filter `userId`
- Sitasi: `schema.ts:42`, `schemas.ts:146-151`

### F. DB Constraint
- **Dialect:** Turso (`drizzle.config.ts:12`)
- **Env:** `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (wajib, throw jika kosong) (`drizzle.config.ts:3-7`)
- Sitasi: `drizzle.config.ts:1-14`

---

## 6. Actor/Role

### Dari Code
| Role | Bukti | Sitasi |
|---|---|---|
| `user` (default) | `schema.ts:11`: `role: text('role').notNull().default('user')` | `schema.ts:11` |
| Authenticated user | Semua route + page require session | `generate/route.ts:30-32`, `middleware.ts:101` |
| Anonymous/guest | Hanya public paths (login, register, health) | `middleware.ts:6-15,64-76` |

### Navigation Roles
- **Logged in:** navbar (projects, new project, settings, dashboard) + semua API v1
- **Logged out:** hanya login + register + health
- Sitasi: `app-header.tsx:24-49,55-71`

### CATATAN V2
- Tidak ada role admin/pengelola. Hanya 'user' default.
- Tidak ada RBAC multi-level.
- Sitasi: `schema.ts:11`

---

## 7. Aset Terdeteksi

### UI Components (shadcn/ui)
- **13 komponen UI:** alert, badge, button, card, dialog, input, label, select, skeleton, table, tabs, textarea
- Path: `src/components/ui/*.tsx`

### Custom Components
| Komponen | Fungsi | Sitasi |
|---|---|---|
| GenerateForm | Form generate + SSE streaming display + stage tracker | `generate-form.tsx:1-276` |
| DropzoneUploader | Drag-drop upload multi-file + tipe select + label | `dropzone-uploader.tsx:1-97` |
| ResultTabs | Tabbed display (scenes/characters/imagePrompts/voiceover/moral) + warnings | `result-tabs.tsx:1-222` |
| TemplatePicker | Template judul rekomendasi | `template-picker.tsx` |
| ProjectCard | Card project list + delete dialog | `project-card.tsx:1-104` |
| AppHeader | Header navbar + auth + language toggle | `app-header.tsx:1-79` |
| LanguageToggle | Toggle bahasa ID/EN | `language-toggle.tsx` |
| CopyButton | Copy-to-clipboard | `copy-button.tsx` |

### Static Assets
- **Logo/branding:** tidak ada aset gambar logo — hanya teks "PromptFlow" di header (`app-header.tsx:22`)
- **Upload path dev:** `public/references/` (filesystem lokal)
- Sitasi: `app-header.tsx:22`, `blob.ts:22`

### Env Keys
| Key | Wajib | Sitasi |
|---|---|---|
| `TURSO_DATABASE_URL` | YA | `drizzle.config.ts:3` |
| `TURSO_AUTH_TOKEN` | YA | `drizzle.config.ts:4` |
| `NEXTAUTH_SECRET` | YA | `config.ts:7-8` |
| `ENCRYPTION_KEY` | YA (AES) | `aes.ts` |
| `BLOB_READ_WRITE_TOKEN` | YA (Blob) | `blob.ts:7` |
| `USE_VERCEL_BLOB` | Opsional (flag) | `blob.ts:6` |

---

## 8. Analisis Kode V1 (Bukti per File)

### 8.1 generate/route.ts (POST SSE Generate)
- **SSE streaming** dengan event type: `stage`, `progress`, `done`, `error` (`route.ts:20-27`)
- **Stage labels:** starting → character_profiles → scenes → image_prompts → supporting_characters → moral_message (`route.ts:80-94`)
- **Flow:** auth → validate → resolve provider → create/get project → call LLM → Zod validate → save DB → consistency check → log → send done
- **Bug pattern:** LLM call non-streaming (`stream: false` di `llm-client.ts:46`) tapi SSE di route handler — tidak ada streaming token partial, hanya stage-based progress
- Sitasi: `generate/route.ts:1-175`

### 8.2 generate-form.tsx (Frontend Generate)
- **Form fields:** title, durationType, durationTargetSeconds, styleType, aspectRatio + textarea refs (manual text input)
- **Stage tracker:** visual progress bar ✓/●/○ per stage + elapsed timer
- **No image upload di generate form** — hanya textarea manual nama file referensi
- **No "deskripsi cerita" field** — hanya judul
- Sitasi: `generate-form.tsx:1-276`

### 8.3 dropzone-uploader.tsx (Upload Component)
- **Drag-drop** + click to select, multi-file (`multiple` attribute) (`dropzone-uploader.tsx:72`)
- **Tipe select:** tokoh atau background (hanya 2 opsi) (`dropzone-uploader.tsx:79-82`)
- **Currently placed at:** project detail page `[id]/page.tsx:78`, BUKAN di generate page
- **Props:** `{ projectId, onUploaded? }` — butuh projectId
- Sitasi: `dropzone-uploader.tsx:1-97`

### 8.4 projects/[id]/page.tsx (Project Detail)
- **Show refs:** grid image preview dari `asset_references` (`page.tsx:65-77`)
- **DropzoneUploader** embedded di project detail (`page.tsx:78`)
- **Result display:** ResultTabs jika sudah generate (`page.tsx:82-83`)
- Sitasi: `projects/[id]/page.tsx:1-96`

### 8.5 dashboard/page.tsx
- **3 KPI cards:** total projects, successful generations, average duration
- **Direct Drizzle queries** — deviasi dari repository pattern
- **No enrichment** — hanya basic count + avg
- Sitasi: `dashboard/page.tsx:1-72`

### 8.6 prompt-builder.ts
- **buildSystemPrompt():** hardcoded JSON schema example + field rules (`prompt-builder.ts:71-97`)
- **buildUserMessage():** inject title, duration, style + references info (`prompt-builder.ts:100-119`)
- **Reference format:** `- ${name} (${type})` — teks saja, tidak ada URL/blob (`prompt-builder.ts:101-103`)
- **TIDAK ada** field "deskripsi cerita" di user message
- Sitasi: `prompt-builder.ts:1-120`

### 8.7 llm-client.ts
- **generatePromptPackage():** decrypt API key → fetch `/chat/completions` → parse JSON → extract from choices[0].message.content → multi-strategy JSON extraction → Zod validate
- **Retry:** 2 attempts default, exponential backoff 2s→4s→8s
- **No AI SDK generateObject usage** — direct HTTP call
- Sitasi: `llm-client.ts:1-139`

### 8.8 consistency-checker.ts
- **Hanya cek** apakah character referenced in scenes exists in character_profiles
- **TIDAK cek** identity field stability
- Sitasi: `consistency-checker.ts:1-40`

### 8.9 middleware.ts
- **NextAuth + i18n + rate limit** dalam satu middleware
- **Rate limit:** in-memory Map (single instance only)
- Sitasi: `middleware.ts:1-131`

### 8.10 validation/schemas.ts
- **GenerateReferenceSchema:** `type: z.enum(['tokoh', 'background'])` — hanya 2 opsi (`schemas.ts:106-109`)
- Sitasi: `schemas.ts:1-178`

---

## 9. Analisis Kebutuhan V2

### V2-1: Hapus image reference dari projects page → pindah ke generate page dengan upload multi-file

**Status V1:**
- Upload saat ini ada di project detail page (`projects/[id]/page.tsx:78`)
- Generate page hanya punya textarea manual nama file referensi (`generate-form.tsx:228-238`)
- Upload butuh `projectId` — generate page belum punya projectId saat user mulai

**Yang perlu diubah:**
1. Pindahkan DropzoneUploader dari project detail ke generate page
2. Generate page upload tanpa projectId (buat project saat generate submit)
3. atau: generate page bikin project dulu (draft), upload ke project tersebut
4. Multi-file upload sudah didukung (`dropzone-uploader.tsx:72`)
5. Flow baru: upload → list refs → include di generate input → submit

**Dampak schema:** TIDAK perlu — `asset_references` sudah multi-file per project.

**Sitasi:**
- Upload: `projects/[id]/page.tsx:78`
- Textarea refs: `generate-form.tsx:228-238`
- Generate submit refs: `generate-form.tsx:77-81`
- GenerateInputSchema refs: `schemas.ts:106-109,127`
- Upload API: `upload/route.ts:1-80`

---

### V2-2: Role classification per gambar (tokoh, background, prop, dll)

**Status V1:**
- `asset_references.tipe` = text, enforce `tokoh|background` di route handler (`upload/route.ts:32-33`)
- `DropzoneUploader` select = tokoh atau background (`dropzone-uploader.tsx:79-82`)
- `GenerateReferenceSchema` type = enum ['tokoh', 'background'] (`schemas.ts:108`)
- `ImagePrompt` tipe = tokoh|background (`schema.ts:104`)

**Yang perlu diubah:**
1. Tambah opsi tipe di `GenerateReferenceSchema`: tokoh, background, prop, props, accessory, environment, dll
2. Update `asset_references.tipe` validation di upload route
3. Update DropzoneUploader select options
4. Update prompt-builder untuk inject tipe ke LLM context
5. Update ImagePrompt tipe handling

**Dampak schema:** TIDAK perlu migration — kolom `tipe` = text tanpa CHECK constraint.

**Sitasi:**
- Upload validation: `upload/route.ts:32-33`
- Uploader select: `dropzone-uploader.tsx:79-82`
- GenerateReferenceSchema: `schemas.ts:106-109`
- ImagePrompt tipe: `schema.ts:104`

---

### V2-3: Sistem analisis gambar referensi — output menyebut "gambar pertama nama wahab.jpg sebagai tokoh utama"

**Status V1:**
- TIDAK ADA image analysis — upload hanya simpan metadata, reference_filename di-inject sebagai teks
- LLM tidak terima URL gambar, hanya nama file teks
- `buildUserMessage()` hanya inject `"- ${name} (${type})"` — teks saja (`prompt-builder.ts:101-103`)

**Yang perlu dibangun:**
1. **Image understanding integration** — kirim gambar ke LLM vision model (GPT-4o, Gemini Vision) untuk auto-classify role
2. **Output reference:** "Gambar pertama (wahab.jpg) adalah tokoh utama bernama Wahab — [deskripsi auto-detect]"
3. **Pipeline:** upload → classify via vision LLM → update `asset_references.tipe` + `label` → inject ke prompt builder
4. **Backend:** endpoint baru atau extended upload endpoint untuk trigger classification
5. **Frontend:** tampilkan hasil klasifikasi di generate form sebelum submit

**Dampak schema:** Mungkin tambah kolom `ai_classification` atau `description` di `asset_references` untuk simpan hasil analisis.

**Sitasi:** TIDAK ADA image analysis code exists anywhere in codebase.

---

### V2-4: Field baru "deskripsi singkat cerita" di generate form

**Status V1:**
- Form hanya: title, durationType, durationTargetSeconds, styleType, aspectRatio + refs textarea
- TIDAK ada field deskripsi cerita
- `GenerateInputSchema` tidak ada field deskripsi (`schemas.ts:111-129`)
- `buildUserMessage()` hanya inject title, duration, style (`prompt-builder.ts:104-119`)

**Yang perlu diubah:**
1. Tambah field `storyDescription` (opsional) di GenerateInputSchema
2. Tambah Textarea di generate form (bawah field judul)
3. Inject ke `buildUserMessage()` — misal: `Deskripsi cerita: ${input.storyDescription}`
4. Tambah ke `CreateProjectInputSchema` jika ingin disimpan di project
5. Opsional: tambah kolom di `projects` table untuk story description

**Dampak schema:** Bisa tambah kolom `story_description` di `projects` (nullable text) ATAU simpan di result_json.

**Sitasi:**
- Form fields: `generate-form.tsx:178-238`
- GenerateInputSchema: `schemas.ts:111-129`
- Prompt builder: `prompt-builder.ts:100-119`
- Projects schema: `schema.ts:33-49`

---

### V2-5: Real-time processing logs (show/hide toggle)

**Status V1:**
- Generate route sudah console.log: `[generate]`, `[llm]` prefixes (`generate/route.ts:51,82,88,96`, `llm-client.ts:37,51,55,63,70,73,119,124,129,137`)
- SSE events: `stage`, `progress`, `done`, `error` — TIDAK ada detailed log messages
- Stage tracker UI ada di generate form tapi TIDAK menampilkan log teks
- `generation_logs` tabel simpan provider, model, duration, status, error_message — TIDAK log per-stage detail

**Yang perlu dibangun:**
1. **Extend SSE events** — tambah event type `log` dengan message text, level, timestamp
2. **Frontend:** LogViewer dengan show/hide toggle (Collapsible atau Switch)
3. **Backend:** collect console.log ke buffer, kirim via SSE setiap ada log baru
4. **Atau:** server-side log collection, kirim di SSE `done` sebagai logs[] array
5. **Toggle UI:** collapsible panel di bawah stage tracker

**Dampak schema:** Bisa tambah kolom `logs_json` di `generation_logs` ATAU log in-memory saja (tidak persist).

**Sitasi:**
- Console logs: `generate/route.ts:51,82,88,96`, `llm-client.ts:37,51,55,63,70,73,119,124,129,137`
- SSE events: `generate/route.ts:20-27`
- Stage UI: `generate-form.tsx:240-267`
- generation_logs schema: `schema.ts:117-129`

---

### V2-6: Dashboard enrichment

**Status V1:**
- Dashboard hanya 3 kartu: total projects, successful generations, average duration
- Direct Drizzle queries (deviasi CODING_RULES)
- Tidak ada chart/visual, tidak ada time series, tidak ada per-provider breakdown

**Rekomendasi enrichment:**
1. **Charts:** line chart projects per minggu, bar chart success vs fail ratio
2. **Per-provider breakdown:** average duration per provider/model
3. **Recent activity:** 5 project terbaru + status
4. **Storage usage:** total file upload, total size
5. **Cost estimation:** total API calls × estimated cost per provider
6. **Consistency score:** % project tanpa warning konsistensi
7. **Popular styles:** distribusi 3D vs 2D, shorts vs tutorial
8. **Performance trend:** latency per waktu

**Dampak schema:** Tidak perlu — semua data sudah ada di generation_logs + projects.

**Sitasi:** `dashboard/page.tsx:1-72`

---

### V2-7: Konsistensi UI

**Status V1:**
- shadcn/ui components sudah konsisten
- Warna: primary violet (`text-primary` di header), accent, muted, destructive
- Layout: max-w-[1280px] center, px-4 py-8
- Spacing: space-y-4 di page, space-y-2/3 di component

**Yang perlu diperhatikan:**
1. **Tidak ada design tokens CSS** — Tailwind v4 CSS-first belum define custom properties
2. **Tidak ada dark mode toggle** — shadcn supports tapi belum diaktifkan
3. **Font:** belum load Inter/Geist — pakai system font stack bawaan Tailwind
4. **Generate form** vs **Project detail** vs **Settings** — komponen serupa tapi pattern beda
5. **Badge variants:** 'success', 'secondary', 'destructive', 'info' — pastikan semua tersedia

**Sitasi:**
- Layout: `layout.tsx:30`
- Header: `app-header.tsx:18-19`
- Badge: `result-tabs.tsx:66,110,154`, `project-card.tsx:28-29`

---

### V2-8: SQA testing menyeluruh

**Status V1:**
- Vitest config ada (`package.json:11-13`)
- Test files ada: `schemas.test.ts`, `aes.test.ts`, `config.test.ts`, `consistency-checker.test.ts`, `markdown.template.test.ts`, `project.repo.test.ts`
- Playwright config ada (`package.json:14`)
- Scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`
- TEST_PLAN.md tersedia

**Yang perlu:**
1. Jalankan semua test, pastikan pass
2. Coverage check — target >= 80% unit
3. E2E test critical path: login → set provider → generate → save → export
4. Manual testing semua V2 features
5. Performance testing (latency, page load)

**Sitasi:**
- Test files: `src/**/*.test.ts` (6 files)
- Scripts: `package.json:11-14`

---

### V2-9: Perbaiki page navigation lambat

**Status V1:**
- `force-dynamic` di generate route (`generate/route.ts:18`) dan dashboard (`dashboard/page.tsx:8`)
- Projects page = Server Component (SSR)
- Middleware melakukan `auth()` + rate limit + locale redirect di setiap request
- `projects/page.tsx:14`: query `listActiveProjects({ userId, page: 1, limit: 20 })` — always page 1, limit 20

**Penyebab potensial:**
1. **Middleware overhead:** auth() di setiap request
2. **No pagination** — always load 20 projects
3. **No caching** — `force-dynamic` artinya fresh fetch
4. **Server Component** harus complete sebelum hydrate
5. **i18n routing** — locale redirect add extra hop

**Solusi:**
1. Client-side navigation → Next.js Link + soft navigation
2. Pagination — tambah pagination di projects list
3. SWR/React Query — cache client-side
4. Streaming — Suspense boundaries
5. Static generation untuk halaman publik
6. Middleware optimization
7. Next.js Image component

**Sitasi:**
- Force dynamic: `generate/route.ts:18`, `dashboard/page.tsx:8`
- Middleware: `middleware.ts:1-131`
- Project list: `projects/page.tsx:14`

---

### V2-10: Push ke GitHub

**Status V1:**
- `BRD.md:9`: GitHub repo = `https://github.com/agrianwahab29/promptflow.git`
- Git info: `env.IsDirectoryAGitRepo: no` — repo belum di-init

**Yang perlu:**
1. `git init` di root proyek
2. `.gitignore` (node_modules, .env.local, .next, public/references)
3. `git add . && git commit`
4. `git remote add origin ...`
5. `git push -u origin main`

**Sitasi:**
- GitHub URL: `BRD.md:9`
- Git status: env info (no git repo)

---

## 10. Best Practices & Pengetahuan Umum

### A. Multi-File Upload UX
- Drag-drop zone harus support multi-file dengan visual feedback per file
- Sequential upload dengan concurrency limit (max 3 parallel)
- Rollback — error per file tanpa membatalkan yang lain
- File preview — thumbnail/preview sebelum upload
- React state untuk track upload queue, status per file, result URLs

### B. Image Classification (Vision AI)
- Vision LLM (GPT-4o, Gemini Vision, Claude Vision) bisa classify image role
- Prompt pattern: "Analyze this image and classify its role: character, background, prop, or other. Return JSON {role, name, description}"
- Batch classification — classify multiple images in one call
- Confidence threshold — tampilkan score, allow manual override
- Cache classification result di `asset_references` agar tidak reclassify

### C. Real-time Logs
- Pattern 1: SSE `log` events — server push log lines via SSE
- Pattern 2: Client poll — periodically fetch logs dari API
- Pattern 3: WebSocket — bidirectional, lebih complex
- Untuk V2: SSE `log` events paling konsisten dengan architecture saat ini
- Toggle: gunakan Radix UI Collapsible atau Switch yang sudah ada

### D. Dashboard Enrichment
- Minimal viable charts: simple HTML/CSS bar charts atau sparklines
- Charts library: Recharts (React-native), Tremor (Tailwind-friendly), Chart.js
- Rekomendasi: 3-5 kartu metric baru + simple table recent activity
- Hindari over-engineering — cukup useful metrics

### E. Navigation Performance
- Next.js App Router: Server Components = SSR, client navigation = soft
- Slow first paint → Suspense boundaries, loading.tsx, streaming
- Middleware overhead: minimal — Edge runtime, cepat
- Pagination = cara paling impact untuk list pages
- Image optimization: pakai Next.js `<Image>` component

### F. UI Consistency
- shadcn/ui sudah excellent foundation
- Tambahkan loading.tsx di setiap page group
- Tambahkan error.tsx boundary per page group
- Pastikan disabled state saat loading
- Dark mode: bisa diaktifkan via CSS variables + next-themes

---

## 11. Gap Analysis

### Gap Kritis (menghalangi V2)

| # | Gap | Dampak | Solusi |
|---|---|---|---|
| GAP-1 | **Tidak ada image analysis/classification** | V2-3 tidak bisa jalan | Implement Vision API call + update asset_references |
| GAP-2 | **Generate page tidak punya upload** | V2-1 upload di project detail, bukan generate | Pindahkan atau tambah upload section di generate page |
| GAP-3 | **Git repo belum di-init** | V2-10 push ke GitHub tidak bisa | `git init` + `.gitignore` + commit |

### Gap Penting (perlu perhatian)

| # | Gap | Dampak | Solusi |
|---|---|---|---|
| GAP-4 | **AI SDK version mismatch** — docs v6, code v4 | Update docs atau upgrade SDK | Cek compatibility |
| GAP-5 | **No "deskripsi cerita" field** | V2-4 | Tambah field + schema + prompt injection |
| GAP-6 | **No real-time log events** di SSE | V2-5 | Extend SSE protocol + frontend LogViewer |
| GAP-7 | **Dashboard minimal** | V2-6 | Extend queries + add simple charts |
| GAP-8 | **Generate reference schema** hanya tokoh/background | V2-2 | Extend ke tokoh/background/prop/dll |
| GAP-9 | **Console.log di production** | Performance, security | Convert ke structured logging |
| GAP-10 | **Dashboard queries langsung di page** | Deviasi repository pattern | Refactor ke repository |

### Gap Informasional

| # | Gap | Catatan |
|---|---|---|
| GAP-11 | **Tidak ada `.env.example`** di root | Tidak ada env template file |
| GAP-12 | **Tidak ada loading.tsx** files | Next.js App Router belum pakai streaming Suspense |
| GAP-13 | **Tidak ada error.tsx** boundary | Error handling = try/catch + toast |
| GAP-14 | **History page** ada tapi tidak dieksplor | Mungkin sudah implement F-21 |

---

## 12. Asumsi V2

| # | Asumsi | Status | Dampak |
|---|---|---|---|
| V2-A1 | Vision LLM tersedia untuk image classification | Perlu konfirmasi user — provider mana? | Pipeline V2-3 |
| V2-A2 | "Deskripsi cerita" field = optional textarea | Perlu konfirmasi — required atau optional? | Schema + form |
| V2-A3 | Real-time logs = collapsible panel | Perlu konfirmasi — panel atau drawer atau tab? | Frontend design |
| V2-A4 | Dashboard enrichment = simple cards + tables | Perlu konfirmasi — perlu chart library? | Dependencies |
| V2-A5 | Upload di generate page = pre-submit | Perlu konfirmasi flow | UX flow |
| V2-A6 | Role classification: tokoh, background, prop, accessory, environment, other | Perlu konfirmasi — opsi apa saja? | Schema + UI |
| V2-A7 | Push ke GitHub = public repo | Perlu konfirmasi — public atau private? | .gitignore |
| V2-A8 | Vercel deploy target | Perlu konfirmasi — masih Laragon atau deploy ke Vercel? | Env vars |

---

## 13. Daftar Sitasi Lengkap

### Kode Source
| Path | Baris | Klaim |
|---|---|---|
| `package.json` | 1-82 | Semua dependencies + versi + scripts |
| `src/lib/db/schema.ts` | 1-163 | 9 tabel + types + indexes + relations |
| `src/lib/validation/schemas.ts` | 1-178 | Semua Zod schemas + DTO types + enums |
| `src/app/api/v1/generate/route.ts` | 1-175 | SSE generate flow + events + DB save |
| `src/app/api/v1/upload/route.ts` | 1-80 | Upload/delete + validation + Blob |
| `src/components/generate/generate-form.tsx` | 1-276 | Form fields + SSE parsing + stage UI |
| `src/components/generate/dropzone-uploader.tsx` | 1-97 | Drag-drop + multi-file + tipe select |
| `src/components/projects/project-card.tsx` | 1-104 | Card + delete dialog |
| `src/app/[locale]/generate/page.tsx` | 1-10 | Server wrapper → GenerateForm |
| `src/app/[locale]/projects/page.tsx` | 1-38 | Project list + grid |
| `src/app/[locale]/projects/[id]/page.tsx` | 1-96 | Detail + refs + DropzoneUploader |
| `src/app/[locale]/dashboard/page.tsx` | 1-72 | 3 KPI cards + direct queries |
| `src/lib/ai/prompt-builder.ts` | 1-120 | System prompt + user message |
| `src/lib/ai/llm-client.ts` | 1-139 | LLM HTTP call + retry + JSON extraction |
| `src/lib/ai/consistency-checker.ts` | 1-40 | Consistency check |
| `src/lib/storage/blob.ts` | 1-56 | Vercel Blob + local FS |
| `src/middleware.ts` | 1-131 | Auth + i18n + rate limit |
| `src/lib/auth/config.ts` | 1-76 | NextAuth credentials + JWT |
| `next.config.ts` | 1-17 | next-intl plugin + images |
| `drizzle.config.ts` | 1-14 | Turso dialect + schema |
| `src/app/[locale]/layout.tsx` | 1-37 | Root layout + i18n |
| `src/components/common/app-header.tsx` | 1-79 | Header nav + auth |
| `src/components/generate/result-tabs.tsx` | 1-222 | Tabbed result display |

### Product Docs
| Path | Section | Klaim |
|---|---|---|
| `product-docs/BRD.md` | §1, §7.1, §8.2 | Stack, asumsi, out of scope |
| `product-docs/PRD.md` | §1.2, §4, §5, §8.2 | Ringkasan, MoSCoW, FR, JSON schema |
| `product-docs/SRS.md` | §1.2, §4.1, §5, §8.7, §9.1, §10 | Stack, FR teknis, Zod schema, security |
| `product-docs/REVIEW_REPORT.md` | §3, §10, §13 | Traceability, warnings, status |
| `product-docs/AGENTS.md` | §3, §5, §9 | Stack, folder structure, PromptPackageSchema |

### External References
| URL | Klaim |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider |
| https://openrouter.ai/docs/api/reference/authentication | OpenRouter base URL |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js |
| https://turso.tech/blog/serverless | Vercel FS tidak persisten |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi |

---

> **Dokumen ini = source of truth untuk pipeline docgen V2. Semua klaim punya sitasi.
> Klaim tanpa sitasi = ASUMSI (ditandai eksplisit). Tidak ada halusinasi.**
