# Software Requirement Specification (SRS) V2.0
## PromptFlow -- Upgrade V2: Workflow Engine Otomasi Prompt Animasi AI

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** product-docs/RAG-CONTEXT.md + PRD V2.0 + BRD V2.0 + MRD V2.0
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Root proyek:** C:\laragon\www\PromptFlow
> **Catatan:** V1 sudah built & berjalan. SRS V2 ini OVERWRITE SRS V1. Fokus pada upgrade teknis V2.

---

## Daftar Isi

1. Pendahuluan
2. Gambaran Umum Produk
3. Kebutuhan Spesifik
4. Arsitektur Sistem
5. Tech Stack & Versi (LOCKED)
6. Spesifikasi Fungsional Detail V2
7. Data Model & Perubahan Schema
8. Interface / API / Integrasi
9. Constraint Teknis
10. Keamanan
11. Performa
12. Tahapan Implementasi V2
13. Verifikasi & Pengujian
14. Asumsi

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

SRS V2 ini menjabarkan spesifikasi teknis eksekutabel untuk **upgrade V2** PromptFlow. V1 sudah terbangun: 9 tabel DB, auth NextAuth, upload Vercel Blob, generate SSE streaming, export JSON/markdown, i18n dwibahasa, 21 endpoint API. Kode berjalan di Laragon localhost.

V2 menambah 10 fitur:
1. Image reference dipindah ke generate page (multi-file + role classification)
2. AI image classification via Vision LLM
3. Field deskripsi singkat cerita
4. Real-time processing logs (SSE + show/hide toggle)
5. Dashboard enrichment (stats, charts, activity)
6. Konsistensi UI (loading.tsx, error.tsx, design tokens)
7. SQA testing menyeluruh (>=80% coverage)
8. Navigation optimization (pagination, Suspense, prefetch)
9. Push ke GitHub
10. Extended role classification (6 opsi)

Situs: PRD V2.0 S1.1, BRD V2.0 S1, RAG-CONTEXT.md S9

### 1.2 Lingkup Dokumen

| Aspek | V1 (pertahankan) | V2 (baru) |
|---|---|---|
| Upload gambar | Di project detail page | Di generate page (multi-file + AI classify) |
| Deskripsi cerita | TIDAK ADA | Textarea opsional di generate form |
| Role classification | 2 opsi (tokoh/background) | 6 opsi (tokoh/background/prop/accessory/environment/other) |
| AI image analysis | TIDAK ADA | Vision LLM auto-classify |
| Real-time logs | TIDAK ADA | SSE log events + Collapsible panel |
| Dashboard | 3 kartu KPI | 6-8 kartu + charts + breakdown |
| Loading states | TIDAK ADA | loading.tsx + error.tsx + Suspense |
| Pagination | TIDAK ADA | Projects list pagination |
| Test coverage | Partial | >=80% unit, 100% critical E2E |
| Version control | TIDAK ADA | GitHub repo |

### 1.3 Definisi & Akronim

| Istilah | Definisi |
|---|---|
| PromptPackage | Output JSON terstruktur hasil generate |
| SSE | Server-Sent Events |
| Vision LLM | Model LLM yang memproses gambar (GPT-4o, Gemini Vision) |
| AI Classification | Vision LLM menganalisis gambar dan mengklasifikasi role |
| Asset Reference | Metadata upload gambar referensi |
| Character Master | Deskripsi karakter konsisten lintas adegan |
| Drizzle ORM | TypeScript ORM untuk Turso/libSQL |
| Turso | Database libSQL (SQLite-compatible) via HTTP |

---

## 2. Gambaran Umum Produk

### 2.1 Perspektif Produk

PromptFlow = web app fullstack Next.js App Router. Frontend + backend satu repo. Deploy Vercel serverless + Turso DB + Vercel Blob. Multi-provider LLM via @ai-sdk/openai-compatible.

Situs: PRD V2.0 S1.2, RAG-CONTEXT.md S2.1

### 2.2 Karakteristik Pengguna

| Karakteristik | Nilai |
|---|---|
| Tipe user | Kreator solo, indie studio, edukator |
| Level teknis | Rendah-sedang |
| Device | Desktop + mobile (responsive) |
| Bahasa | Indonesia + English |
| Auth | NextAuth credentials |
| Role | User (default) -- tidak ada admin/RBAC |

Situs: MRD V2.0 S3.1, RAG-CONTEXT.md S6

### 2.3 Ketergantungan Eksternal

| ID | Dependency | Pemilik | Status |
|---|---|---|---|
| TD-1 | Vision LLM API (GPT-4o / Gemini Vision) | User | Perlu API key |
| TD-2 | Akun GitHub + repo access | Bos Agrian | Perlu push access |
| TD-3 | Vercel project setup | Bos Agrian | Perlu connect repo |
| TD-4 | Turso DB production | Bos Agrian | Sudah ada V1 |
| TD-5 | API key Ollama/OpenRouter | User | User sediakan via UI |
| TD-6 | Chart library (Recharts / Tremor) | Developer | Install via pnpm |

---

## 3. Kebutuhan Spesifik

### 3.1 Kebutuhan Fungsional (V2 BARU)

| ID | Requirement | MoSCoW | Mapping PRD |
|---|---|---|---|
| FR-V2-01 | Image reference di generate page (multi-file + role classification) | MUST | F-V2-01, US-V2-01, US-V2-02 |
| FR-V2-02 | AI image classification via Vision LLM | MUST | F-V2-02, US-V2-03, US-V2-04 |
| FR-V2-03 | Extended role classification (6 opsi) | MUST | F-V2-03, US-V2-03 |
| FR-V2-04 | Field deskripsi singkat cerita | MUST | F-V2-04, US-V2-05 |
| FR-V2-05 | Real-time processing logs (SSE + Collapsible) | SHOULD | F-V2-05, US-V2-06, US-V2-07 |
| FR-V2-06 | Dashboard enrichment (charts, breakdown, activity) | SHOULD | F-V2-06, US-V2-08, US-V2-09 |
| FR-V2-07 | Konsistensi UI (loading.tsx, error.tsx, tokens) | SHOULD | F-V2-07, US-V2-10 |
| FR-V2-08 | SQA testing menyeluruh (>=80% coverage) | SHOULD | F-V2-08, US-V2-12 |
| FR-V2-09 | Navigation optimization (pagination, Suspense) | SHOULD | F-V2-09, US-V2-11 |
| FR-V2-10 | Push ke GitHub | SHOULD | F-V2-10, US-V2-12 |

### 3.2 Kebutuhan Non-Fungsional (V2 tambahan)

| ID | Requirement | Target | MoSCoW |
|---|---|---|---|
| NFR-V2-P1 | Page transition | <= 200ms | SHOULD |
| NFR-V2-P2 | Dashboard load | <= 1.5s | SHOULD |
| NFR-V2-P3 | AI classification latency | <= 5s per gambar | MUST |
| NFR-V2-P4 | Real-time log latency | <= 100ms server ke UI | SHOULD |
| NFR-V2-U1 | loading.tsx per page group | Skeleton/spinner | SHOULD |
| NFR-V2-U2 | error.tsx boundary per page group | Error + retry + home link | SHOULD |
| NFR-V2-U3 | Disabled state saat loading | Semua form field disabled | SHOULD |
| NFR-V2-U4 | Pagination di projects list | Page numbers + prev/next | SHOULD |
| NFR-V2-T1 | Unit test coverage | >= 80% | SHOULD |
| NFR-V2-T2 | E2E critical path | 100% pass | SHOULD |

### 3.3 Out of Scope V2

| # | Item | Alasan |
|---|---|---|
| OOS-V2-1 | Dark mode toggle | Bisa V3 |
| OOS-V2-2 | Multi-language output prompt | Ikut judul input |
| OOS-V2-3 | AI SDK upgrade v4 ke v6 | Breaking changes |
| OOS-V2-4 | Schema migration besar-besaran | Additive columns only |
| OOS-V2-5 | Auto-fallback provider otomatis | Manual switch fase awal |
| OOS-V2-6 | Marketplace template prompt | Fase akhir |
| OOS-V2-7 | Kolaborasi real-time multi-user | Fase awal solo per project |

---

## 4. Arsitektur Sistem

### 4.1 Pendekatan Arsitektur

V2 mempertahankan arsitektur V1 (monolith Next.js App Router) dan menambah layer baru:

`
+------------------------------------------------------------------+
|  Layer 1: Presentation (App Router pages + components)           |
|  - Generate page: DropzoneUploader + AI classify + LogViewer     |
|  - Dashboard: Charts + metric cards + activity table             |
|  - Projects: Pagination + Suspense boundaries                    |
|  - loading.tsx + error.tsx per page group                        |
+------------------------------------------------------------------+
         |  Server Actions + fetch /api/v1/*
         v
+------------------------------------------------------------------+
|  Layer 2: API / Route Handlers (backend)                         |
|  - POST /api/v1/generate (SSE + log events)                      |
|  - POST /api/v1/upload (multi-file + auto-classify)              |
|  - POST /api/v1/upload/classify (trigger AI classify)            |
|  - GET /api/v1/projects (pagination)                             |
|  - GET /api/v1/dashboard/stats (enrichment data)               |
|  - 21 endpoint V1 tetap backward-compatible                      |
+------------------------------------------------------------------+
         |  panggil lib/*
         v
+------------------------------------------------------------------+
|  Layer 3: lib/ (core logic, server-only)                          |
|  - lib/ai/provider-registry.ts  createOpenAICompatible           |
|  - lib/ai/prompt-builder.ts     system + user message            |
|  - lib/ai/llm-client.ts         generatePromptPackage + retry    |
|  - lib/ai/image-classifier.ts   NEW: Vision LLM classify         |
|  - lib/ai/consistency-checker.ts                                |
|  - lib/db/repositories/*.ts     9 repos + V2 queries             |
|  - lib/storage/blob.ts          Vercel Blob + local FS           |
|  - lib/auth/config.ts           NextAuth credentials + JWT       |
|  - lib/crypto/aes.ts            AES-256-GCM                     |
|  - lib/validation/schemas.ts    Zod + PromptPackageSchema        |
|  - lib/export/markdown.template.ts                              |
+------------------------------------------------------------------+
         |  external call
         v
+------------------------------------------------------------------+
|  Layer 4: External Services                                       |
|  - LLM provider (Ollama / OpenRouter / 9router / custom)         |
|  - Vision LLM (GPT-4o / Gemini Vision) untuk classification      |
|  - Turso DB (libSQL via HTTP)                                     |
|  - Vercel Blob (gambar referensi)                                 |
+------------------------------------------------------------------+
`

### 4.2 Flow V2: Upload + AI Classification

`
[User drag-drop gambar di generate page]
    |
    v
[POST /api/v1/upload -- multipart]
    |-- validasi: mime image/*, max 10MB
    |-- upload ke Vercel Blob / local FS
    |-- simpan AssetReference (tanpa projectId dulu)
    |
    v
[Auto-trigger POST /api/v1/upload/classify]
    |-- kirim gambar ke Vision LLM (GPT-4o / Gemini)
    |-- prompt: Classify role: character/background/prop/accessory/environment/other
    |-- parse response -> update AssetReference
    |
    v
[Frontend: tampilkan hasil klasifikasi]
    |-- thumbnail + role badge + nama + confidence
    |-- manual override: user bisa ubah role
    |-- fallback ke manual select jika Vision LLM gagal
`

Situs: RAG-CONTEXT.md S9 V2-3, PRD V2.0 S5 (FR-V2-02)

### 4.3 Flow V2: Generate dengan Story Description + Logs

`
[User submit generate form]
    |-- title + storyDescription (opsional) + duration + style + refs
    |
    v
[POST /api/v1/generate -- SSE]
    |-- validasi Zod (termasuk storyDescription field baru)
    |-- resolve provider + decrypt API key
    |-- buildUserMessage() -> inject storyDescription
    |
    |-- SSE events:
    |   data: {"type":"stage","stage":"starting","message":"..."}
    |   data: {"type":"log","level":"info","message":"[generate] Resolving provider..."}
    |   data: {"type":"stage","stage":"character_profiles","message":"..."}
    |   ...
    |   data: {"type":"done","result":<full JSON>,"logs":[...]}
    |
    v
[Frontend: stage tracker + LogViewer Collapsible]
    |-- toggle show/hide logs
    |-- log per stage + timestamp + level badge
`

### 4.4 Flow V2: Dashboard Enrichment

`
[GET /api/v1/dashboard/stats]
    |-- query: total projects, successful generations, avg duration
    |-- query: per-provider breakdown (avg duration, success rate)
    |-- query: recent 5 projects
    |-- query: weekly trend (projects per minggu)
    |-- query: storage usage (total files, total size)
    |
    v
[Frontend: 6-8 metric cards + charts + tables]
    |-- Line chart: projects per minggu (Recharts)
    |-- Bar chart: success vs fail ratio
    |-- Table: per-provider breakdown
    |-- Table: recent 5 projects + status
    |-- Card: storage usage
`

---

## 5. Tech Stack & Versi (LOCKED)

> **Penting:** Semua versi di bawah dari package.json (ground truth). AI SDK = v4, BUKAN v6.

| Lapisan | Teknologi | Versi (package.json) | Justifikasi |
|---|---|---|---|
| Framework | Next.js | ^15.1.0 | App Router, RSC, Server Actions, Vercel native |
| UI Library | React + ReactDOM | ^19.0.0 | Latest stable |
| AI SDK | ai (Vercel AI SDK) | ^4.0.0 | Multi-provider, structured output. CATATAN: docs sebut v6, kode = v4 |
| AI Provider | @ai-sdk/openai-compatible | ^1.0.0 | Multi-provider OpenAI-compat |
| Validasi | Zod | ^3.24.0 | Schema input + LLM structured output |
| Auth | next-auth | 5.0.0-beta.25 | Credentials provider, JWT session |
| Auth Core | @auth/core | ^0.37.0 | NextAuth core |
| Password Hash | bcryptjs | ^2.4.3 | User password hashing |
| DB Client | @libsql/client | ^0.14.0 | Turso/libSQL driver |
| ORM | drizzle-orm | ^0.38.0 | Type-safe, lightweight, Turso support |
| ORM Kit | drizzle-kit | ^0.30.0 | Migration generate + push |
| Storage | @vercel/blob | ^0.27.0 | Vercel Blob upload |
| i18n | next-intl | ^3.26.0 | Dwibahasa ID + EN |
| Icons | lucide-react | ^0.468.0 | Icon library |
| Form | react-hook-form | ^7.54.0 | Form management |
| Form Resolvers | @hookform/resolvers | ^3.10.0 | Zod integration |
| Toast | sonner | ^1.7.0 | Toast notification |
| UI Primitives | Radix UI (14 paket) | ^1.1.0--^1.2.0 | shadcn/ui foundation |
| UI Helpers | clsx + tailwind-merge + cva | ^2.1.1 / ^2.5.0 / ^0.7.1 | Class utilities |
| TypeScript | typescript | ^5.7.0 | Type safety |
| Tailwind CSS | tailwindcss | ^4.0.0 | CSS-first styling |
| PostCSS | @tailwindcss/postcss + postcss + autoprefixer | ^4.0.0 / ^8.4.0 / ^10.4.0 | Build pipeline |
| Test Unit | vitest | ^2.1.0 | Unit + integration test |
| Test Coverage | @vitest/coverage-v8 | ^2.1.0 | Coverage reporting |
| Test E2E | @playwright/test | ^1.49.0 | E2E browser test |
| Lint | eslint + eslint-config-next | ^9.17.0 / ^15.1.0 | Code quality |
| TS ESLint | @typescript-eslint/eslint-plugin + @typescript-eslint/parser | ^8.18.0 | TS lint rules |
| Format | prettier + prettier-plugin-tailwindcss | ^3.4.0 / ^0.6.0 | Code formatting |
| Package Manager | pnpm | 11.7.0 | Fast, disk-efficient |
| Runtime | Node.js (server-only) | N/A | Server-side only |
| DB Engine | Turso (libSQL via HTTP) | latest | Vercel serverless DB |
| V2 Baru | Recharts atau Tremor | latest stabil | Dashboard charts |

**KETIDAKSESUAIAN VERSI:** Product docs V1 menyebut AI SDK v6 tapi package.json mencatat ai: ^4.0.0. **Kode = ground truth.** SRS V2 pakai v4. Tidak upgrade ke v6 = out of scope.

Situs: RAG-CONTEXT.md S2 (Tech Stack Tabel), package.json:22-81

---

## 6. Spesifikasi Fungsional Detail V2

### 6.1 FR-V2-01: Image Reference di Generate Page

| Aspek | Realisasi Teknis |
|---|---|
| Lokasi | Generate page (/generate) -- bukan project detail |
| Komponen | DropzoneUploader dipindah dari projects/[id]/page.tsx:78 ke generate-form.tsx |
| Upload flow | 1) User drag-drop multi-file di generate form. 2) Upload ke storage. 3) Metadata simpan di asset_references (tanpa projectId). 4) List refs muncul di form sebelum submit. |
| Multi-file | Sudah didukung dropzone-uploader.tsx:72 (multiple attribute). Max 10MB per file, mime image/(png|jpe?g|gif|webp|svg+xml) |
| Backward compat | Project detail page tetap view refs (read-only). Upload di project detail DIHAPUS dari UI. |
| Submit flow | Generate submit -> buat project (draft) -> attach refs ke project -> generate prompt |
| Dampak schema | TIDAK perlu migration |
| Komponen baru | AssetPreviewList -- menampilkan daftar gambar yang sudah di-upload dengan thumbnail + role badge + nama |

Situs: RAG-CONTEXT.md S9 V2-1, PRD V2.0 S5 (FR-V2-01), dropzone-uploader.tsx:1-97

### 6.2 FR-V2-02: AI Image Classification via Vision LLM

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | POST /api/v1/upload/classify (baru) atau auto-trigger saat upload |
| Input | assetReferenceId (atau auto-trigger setelah upload) |
| Vision LLM | GPT-4o Vision ATAU Gemini Vision (tergantung provider aktif) |
| Prompt | Analyze this image and classify its role in an animation project. Return JSON: {role, name, description, confidence} |
| Output | {role, name, description, confidence} |
| Update DB | asset_references.tipe = role, asset_references.label = name, asset_references.ai_classification = JSON string |
| Confidence threshold | 0.7 -- di bawah threshold = warning, suggest manual override |
| Manual override | User bisa ubah role via dropdown di UI sebelum submit |
| Fallback | Vision LLM gagal -> manual select (V1 behavior: tokoh/background) |
| Cache | Simpan hasil di asset_references.ai_classification agar tidak reclassify |
| Rate limit | Batch classify max 5 gambar per call |
| Dampak schema | Tambah kolom ai_classification (TEXT nullable) di asset_references |
| Komponen baru | ClassificationResult -- thumbnail + role badge + nama + deskripsi + confidence bar + override dropdown |

Situs: RAG-CONTEXT.md S9 V2-3, PRD V2.0 S5 (FR-V2-02), RAG-CONTEXT.md S10 B

### 6.3 FR-V2-03: Extended Role Classification (6 Opsi)

| Aspek | Realisasi Teknis |
|---|---|
| Opsi tipe | tokoh, background, prop, accessory, environment, other |
| Zod update | GenerateReferenceSchema.type: z.enum(['tokoh','background','prop','accessory','environment','other']) |
| Upload validation | upload/route.ts:32-33 -- extend dari 2 opsi ke 6 opsi |
| DropzoneUploader | Select options: 6 opsi (dari hanya tokoh/background) |
| Prompt builder | Inject tipe ke LLM context: Referensi: wahab.jpg (tokoh), meja.jpg (prop) |
| ImagePrompt tipe | schema.ts:104 -- tetap text tanpa CHECK constraint |
| Dampak schema | TIDAK perlu migration |

Situs: RAG-CONTEXT.md S9 V2-2, PRD V2.0 S5 (FR-V2-03), schemas.ts:106-109

### 6.4 FR-V2-04: Field Deskripsi Singkat Cerita

| Aspek | Realisasi Teknis |
|---|---|
| UI | Textarea opsional di generate form, di bawah field judul |
| Validasi | Optional. Max 500 char. Trim whitespace. |
| Zod | GenerateInputSchema: tambah storyDescription: z.string().max(500).optional() |
| Prompt injection | buildUserMessage(): tambah Deskripsi cerita:  bila terisi |
| DB opsional | Tambah kolom story_description (TEXT nullable) di projects table |
| Save flow | Simpan di projects.story_description saat create project |
| Dampak schema | Tambah kolom story_description (TEXT nullable) di projects |

Situs: RAG-CONTEXT.md S9 V2-4, PRD V2.0 S5 (FR-V2-04), generate-form.tsx:178-238

### 6.5 FR-V2-05: Real-time Processing Logs

| Aspek | Realisasi Teknis |
|---|---|
| SSE events | Extend protocol: tambah event type log |
| Log event format | data: {"type":"log","level":"info","message":"[generate] Starting...","timestamp":"..."} |
| Level | info, warn, error |
| Backend | Collect console.log ke buffer array. Kirim via SSE setiap ada log baru. |
| Frontend | LogViewer component -- Collapsible panel di bawah stage tracker |
| Toggle | Switch show/hide. Default OFF. Toggle ON = terima log events. |
| UI | Log per stage + timestamp + level badge (info=blue, warn=yellow, error=red) |
| Persistence | Opsional: tambah kolom logs_json (TEXT nullable) di generation_logs |
| Dampak schema | Opsional: tambah logs_json (TEXT nullable) di generation_logs |

Situs: RAG-CONTEXT.md S9 V2-5, PRD V2.0 S5 (FR-V2-05), generate/route.ts:20-27

### 6.6 FR-V2-06: Dashboard Enrichment

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Extend GET /api/v1/dashboard/stats response |
| Metrics baru | Total projects, successful generations, avg duration, total uploads, success rate, active providers |
| Charts | Line chart: projects per minggu. Bar chart: success vs fail ratio. Library: Recharts atau Tremor. |
| Per-provider | Table: provider name, avg duration, success rate, total calls |
| Recent activity | Table: 5 project terbaru + status + tanggal |
| Storage usage | Card: total files, total size |
| Refactor | Dashboard queries pindah dari direct Drizzle ke repository pattern |
| Dampak schema | TIDAK perlu |
| Performance | Dashboard load <= 1.5s |

Situs: RAG-CONTEXT.md S9 V2-6, PRD V2.0 S5 (FR-V2-06), dashboard/page.tsx:1-72

### 6.7 FR-V2-07: Konsistensi UI

| Aspek | Realisasi Teknis |
|---|---|
| loading.tsx | Tambah loading.tsx di: /generate, /projects, /projects/[id], /dashboard, /settings |
| error.tsx | Tambah error.tsx boundary per page group: error message + retry button + link home |
| Disabled state | Semua form field disabled saat generating/loading |
| Empty state | Ilustrasi + pesan + CTA untuk empty projects, empty results |
| Design tokens | Primary violet #7c3aed, font Inter, spacing 4px base, radius 6px |
| Badge variants | Pastikan: success, secondary, destructive, info tersedia |
| Loading skeleton | Skeleton cards di projects list via Suspense |

Situs: RAG-CONTEXT.md S9 V2-7, PRD V2.0 S5 (FR-V2-07)

### 6.8 FR-V2-08: SQA Testing Menyeluruh

| Aspek | Realisasi Teknis |
|---|---|
| Unit test | Vitest -- target >= 80% coverage unit/integration |
| E2E test | Playwright -- critical path: login -> set provider -> upload + classify -> generate -> save -> export |
| Lint | ESLint (next lint) -- 0 error, 0 warning |
| Type check | tsc --noEmit -- 0 error |
| Build | next build -- sukses tanpa error |
| Manual test | Semua V2 features |
| Performance test | Latency: Shorts <= 60s, Tutorial <= 180s, Dashboard <= 1.5s, Page transition <= 200ms |
| CI gate | PR tidak merge bila lint/typecheck/test/e2e/build fail |

Situs: RAG-CONTEXT.md S9 V2-8, PRD V2.0 S5 (FR-V2-08)

### 6.9 FR-V2-09: Navigation Optimization

| Aspek | Realisasi Teknis |
|---|---|
| Pagination | Projects list: ?page=1&limit=20. UI: page numbers + prev/next. Server-side. |
| Suspense | Tambah Suspense boundaries di projects list, dashboard, generate page |
| loading.tsx | Streaming SSR via Next.js App Router loading states |
| Client-side nav | Next.js Link component untuk soft navigation |
| Image optimization | Next.js Image component untuk thumbnails |
| Prefetch | Next.js Link prefetch=true untuk navigasi umum |

Situs: RAG-CONTEXT.md S9 V2-9, PRD V2.0 S5 (FR-V2-09)

### 6.10 FR-V2-10: Push ke GitHub

| Aspek | Realisasi Teknis |
|---|---|
| Repo | https://github.com/agrianwahab29/promptflow.git |
| Init | git init di root proyek |
| .gitignore | node_modules, .env.local, .next, public/references, *.tsbuildinfo, drizzle/meta |
| Commit | Conventional commits: feat(scope): ..., fix(scope): ... |
| Branch | main branch. Feature branches: feat/v2-upload, feat/v2-classification |
| Remote | git remote add origin https://github.com/agrianwahab29/promptflow.git |
| Push | git push -u origin main |

Situs: RAG-CONTEXT.md S9 V2-10, PRD V2.0 S5 (FR-V2-10), BRD V2.0 S5.1 S9

---

## 7. Data Model & Perubahan Schema

### 7.1 Schema Existing V1 (9 tabel -- pertahankan)

| # | Tabel | Status V2 |
|---|---|---|
| 1 | users | Tetap |
| 2 | provider_configs | Tetap |
| 3 | projects | Tambah kolom opsional |
| 4 | asset_references | Tambah kolom opsional |
| 5 | characters | Tetap |
| 6 | scenes | Tetap |
| 7 | image_prompts | Tetap |
| 8 | generation_logs | Tambah kolom opsional |
| 9 | supporting_characters | Tetap |

Situs: RAG-CONTEXT.md S4, schema.ts:1-163

### 7.2 Perubahan Schema V2 (ADDITIVE -- tidak breaking)

| Tabel | Kolom Baru | Tipe | Nullable | Alasan |
|---|---|---|---|---|
| projects | story_description | TEXT | YA | Simpan deskripsi cerita dari generate form |
| asset_references | ai_classification | TEXT | YA | Simpan hasil analisis Vision LLM (JSON string) |
| generation_logs | logs_json | TEXT | YA | Simpan real-time logs (JSON array) |

Catatan:
- Semua kolom baru = nullable -> tidak breaking existing data
- Kolom tipe di asset_references tetap TEXT tanpa CHECK constraint -> extended enum di app layer (Zod)
- Migration: drizzle-kit generate -> review SQL -> drizzle-kit push

Situs: PRD V2.0 S8.2, RAG-CONTEXT.md S9 V2-3, V2-4, V2-5

### 7.3 Validasi Enum V2 (App Layer -- Zod)

| Schema | V1 | V2 (baru) |
|---|---|---|
| GenerateReferenceSchema.type | z.enum(['tokoh', 'background']) | z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']) |
| GenerateInputSchema | title, durationType, durationTargetSeconds, styleType, aspectRatio, references | + storyDescription: z.string().max(500).optional() |

### 7.4 Relasi (tetap dari V1)

- users 1:N -> provider_configs, projects
- projects 1:N -> asset_references, characters, scenes, image_prompts, generation_logs, supporting_characters
- scenes 1:N -> image_prompts (scene_id nullable), supporting_characters (scene_id nullable)

### 7.5 PromptPackageSchema (Source of Truth LLM Output -- tetap)

`	s
const PromptPackageSchema = z.object({
  title: z.string(),
  duration_target: z.object({ type: z.enum(['shorts','tutorial']), seconds: z.number() }),
  style: z.object({ type: z.enum(['3D','2D']), aspect_ratio: z.string() }),
  character_profiles: z.array(CharacterProfileSchema),
  scenes: z.array(SceneSchema),
  image_prompts: z.object({
    characters: z.array(ImagePromptItemSchema),
    backgrounds: z.array(ImagePromptItemSchema),
  }),
  supporting_characters: z.array(SupportingCharacterSchema),
  moral_message: z.string(),
});
`

Situs: AGENTS.md S9, PRD V2.0 S8.2

---

## 8. Interface / API / Integrasi

### 8.1 Endpoint Existing V1 (21 endpoint -- tetap)

Semua 21 endpoint V1 tetap backward-compatible.

Situs: RAG-CONTEXT.md S3, API_CONTRACT.md S5

### 8.2 Perubahan Endpoint V2 (additive)

| Endpoint | Perubahan |
|---|---|
| POST /api/v1/generate | Extend SSE events: tambah log event type. Tambah field storyDescription di request. |
| POST /api/v1/upload | tipe field extended ke 6 opsi. Response tambah ai_classification. |
| POST /api/v1/projects | Tambah field opsional story_description di request body. |
| GET /api/v1/projects | Pagination via ?page=&limit=. Response: {data[], pagination{page, limit, total, totalPages}}. |
| GET /api/v1/dashboard/stats | Extend response: {totalProjects, successfulGenerations, avgDuration, perProviderBreakdown[], recentProjects[], storageUsage, weeklyTrend[]}. |

### 8.3 Endpoint Baru V2

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | /api/v1/upload/classify | wajib | Trigger AI classification. Input: {assetReferenceId}. Output: {role, name, description, confidence}. |

### 8.4 SSE Event Protocol V2

`
POST /api/v1/generate
Content-Type: application/json
Body: {
  title: string,
  storyDescription?: string,
  durationType: 'shorts' | 'tutorial',
  durationTargetSeconds?: number,
  styleType: '3D' | '2D',
  aspectRatio: string,
  references?: Array<{name: string, type: string, filename: string}>
}

Response: text/event-stream (SSE)
  data: {"type":"stage","stage":"starting","message":"Memulai generate..."}
  data: {"type":"log","level":"info","message":"[generate] Resolving provider..."}
  data: {"type":"progress","stage":"character_profiles","progress":20}
  data: {"type":"log","level":"info","message":"[llm] Calling GPT-4o..."}
  data: {"type":"stage","stage":"character_profiles","message":"Profile karakter selesai"}
  ... (stages: starting -> character_profiles -> scenes -> image_prompts -> supporting_characters -> moral_message)
  data: {"type":"done","result":<full structured JSON>,"warnings":[...],"logs":[...]}
  data: {"type":"error","message":"Provider timeout","provider":"openrouter"}
`

### 8.5 Error Envelope

`json
{
  "error": {
    "code": "VALIDATION_ERROR | PROVIDER_ERROR | AUTH_ERROR | TIMEOUT | INTERNAL | CLASSIFICATION_ERROR",
    "message": "string (bahasa aktif)",
    "details": {}
  }
}
`

HTTP status: 200/201 (ok), 204 (delete), 400 (validation), 401 (auth), 403 (ownership), 404 (not found), 429 (rate limit), 500 (internal), 502/504 (provider timeout).

---

## 9. Constraint Teknis

### 9.1 Upload Constraint

| Constraint | Nilai |
|---|---|
| Max file size | 10 MB per file |
| Allowed MIME | image/(png|jpe?g|gif|webp|svg+xml) |
| Tipe validation | tokoh, background, prop, accessory, environment, other (6 opsi V2) |
| Storage | Vercel Blob (prod) / local FS public/references/ (dev) |
| Filename | Sanitized + random UUID suffix, max 60 char base |
| Max files per upload | ASUMSI 10 files |

### 9.2 Generate Constraint

| Constraint | Nilai |
|---|---|
| Runtime | nodejs, maxDuration 600s, force-dynamic |
| Rate limit | 10 req/min per user |
| LLM timeout | AbortSignal 240,000ms (4 menit) per call |
| Max retries | 2 (default) + exponential backoff max 8000ms |
| LLM max_tokens | 32768 |
| LLM temperature | 0.7 |
| Stream mode | Non-streaming di LLM call, SSE streaming dari route ke client |

### 9.3 Auth Constraint

| Constraint | Nilai |
|---|---|
| Provider | NextAuth credentials only (email + password) |
| Session | JWT session strategy |
| Password | bcryptjs comparison |
| Protected routes | Semua page + API v1 kecuali auth/health/register |
| Public paths | login, register, api/auth, api/v1/auth, api/v1/health, _next, favicon, robots |

### 9.4 Validation Constraint

| Schema | Rule |
|---|---|
| TitleSchema | min 3, max 200, trim |
| Duration | shorts max 180s; tutorial 420-900s |
| Style | enum '3D' \| '2D' |
| ProviderEnum | 'ollama' \| 'openrouter' \| '9router' \| 'custom' |
| V2: GenerateReferenceSchema.type | 'tokoh'\|'background'\|'prop'\|'accessory'\|'environment'\|'other' |
| V2: GenerateInputSchema.storyDescription | z.string().max(500).optional() |

### 9.5 DB Constraint

| Constraint | Nilai |
|---|---|
| Dialect | Turso (libSQL via HTTP) |
| Env | TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (wajib) |
| Timestamp | Integer unix epoch |
| PK | Auto-increment id |

### 9.6 Output Format Constraint

| Constraint | Spesifikasi |
|---|---|
| Output utama | JSON structured (PromptPackageSchema) |
| Export markdown | .md download via /api/v1/projects/[id]/export?format=markdown |
| TIDAK generate media | Output = teks prompt saja |
| TIDAK TTS | Voiceover = naskah teks |

### 9.7 Vercel Serverless Constraint

| Constraint | Dampak | Mitigasi |
|---|---|---|
| Filesystem tidak persisten | SQLite file lokal hilang | WAJIB Turso remote HTTP |
| Function timeout | Generate panjang berisiko timeout | Streaming SSE (token < 10s) |
| Upload gambar di FS lokal | Hilang saat recycle | Vercel Blob untuk prod |

---

## 10. Keamanan

### 10.1 Tabel Keamanan

| ID | Requirement | Implementasi |
|---|---|---|
| SEC-01 | API key user dienkripsi saat simpan | AES-256-GCM lib/crypto/aes.ts, env ENCRYPTION_KEY 32 byte base64 |
| SEC-02 | API key TIDAK expose ke client | Response mask **** + 4 char terakhir |
| SEC-03 | Provider call server-side only | lib/ai/* + lib/crypto/* wajib import server-only |
| SEC-04 | 9router localhost hanya server-side | http://localhost:20128/v1 tidak reachable dari client |
| SEC-05 | CSRF protection | Next.js built-in CSRF + NextAuth CSRF token |
| SEC-06 | Input sanitization (XSS) | Zod validasi + escape HTML <>"'& |
| SEC-07 | Ownership check | project.user_id === session.user.id semua operasi |
| SEC-08 | Env secret management | .env.example tanpa value. Guard if (!env) throw di init |
| SEC-09 | HTTPS only | Vercel default HTTPS |
| SEC-10 | Rate limit | 10 req/min/user. Header X-RateLimit-*. 429 bila exceed. |
| SEC-11 | Auth protected routes | Middleware: /projects, /settings, /generate, /api/v1/* (kecuali auth/health) |
| SEC-12 | No secret client-side | NEXT_PUBLIC_* hanya non-sensitif. API key = server-only |
| SEC-13 | No LLM call / decrypt client | lib/ai/* + lib/crypto/* server-only |
| SEC-14 | Password hash | bcryptjs untuk users.password_hash |

### 10.2 30 Larangan (CODING_RULES S13)

L01-L30 wajib dipatuhi. Kunci: L06 (no any), L07 (no hardcoded secret), L12 (no query tanpa user_id), L14 (no string concat SQL), L15 (no dangerouslySetInnerHTML), L16 (no eval), L17 (no process.env.X! tanpa guard), L24 (no LLM call client), L25 (no decrypt client).

---

## 11. Performa

| ID | Metrik | Target | V1/V2 |
|---|---|---|---|
| NFR-P1 | Latency Shorts | <= 60s end-to-end | V1 |
| NFR-P2 | Latency Tutorial | <= 180s end-to-end | V1 |
| NFR-P3 | Streaming partial SSE | Token < 10s | V1 |
| NFR-P4 | UI response time | < 2s page load | V1 |
| NFR-P5 | DB query | < 500ms | V1 |
| NFR-V2-P1 | Page transition | <= 200ms | V2 |
| NFR-V2-P2 | Dashboard load | <= 1.5s | V2 |
| NFR-V2-P3 | AI classification latency | <= 5s per gambar | V2 |
| NFR-V2-P4 | Real-time log latency | <= 100ms server ke UI | V2 |

---

## 12. Tahapan Implementasi V2

### Fase A: Core V2 (MUST -- 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VA-01 | Git init + .gitignore | git init, .gitignore lengkap, README updated | Repo ter-push ke GitHub |
| VA-02 | Schema migration V2 | Tambah 3 kolom nullable: projects.story_description, asset_references.ai_classification, generation_logs.logs_json. drizzle-kit generate + push. | Migration sukses, existing data intact |
| VA-03 | Upload di generate page | Pindahkan DropzoneUploader dari project detail ke generate form. Upload tanpa projectId. Backward compat: project detail view refs. | E2E upload di generate page jalan |
| VA-04 | Extended role classification | Update GenerateReferenceSchema.type ke 6 opsi. Update DropzoneUploader select. Update upload route validation. | 6 opsi tipe muncul di UI + validasi jalan |
| VA-05 | Field deskripsi cerita | Tambah storyDescription di GenerateInputSchema. Tambah Textarea di form. Inject ke buildUserMessage(). Simpan di projects.story_description. | E2E: isi deskripsi -> prompt lebih kontekstual |
| VA-06 | Push ke GitHub | Commit + push ke https://github.com/agrianwahab29/promptflow.git | Repo accessible |

### Fase B: Intelligence (SHOULD -- 3-4 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VB-01 | AI image classifier | lib/ai/image-classifier.ts. Vision LLM call. Prompt untuk classify role. Parse response. Update asset_references. | Unit test classify round-trip |
| VB-02 | Classification endpoint | POST /api/v1/upload/classify atau auto-trigger saat upload. | E2E: upload -> auto-classify -> result visible |
| VB-03 | Classification UI | ClassificationResult component. Thumbnail + role badge + nama + confidence + override dropdown. Fallback ke manual select. | E2E: classify result visible, override jalan |
| VB-04 | Real-time logs | Extend SSE events: tambah log event type. Backend: buffer logs, kirim via SSE. | E2E: log events muncul di SSE stream |
| VB-05 | LogViewer component | Collapsible panel + show/hide toggle. Log per stage + timestamp + level badge. Default OFF. | E2E: toggle show/hide jalan |

### Fase C: Dashboard & Polish (SHOULD -- 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VC-01 | Dashboard queries | Extend queries: per-provider breakdown, recent 5 projects, weekly trend, storage usage. Refactor ke repository pattern. | Dashboard data lengkap |
| VC-02 | Dashboard charts | Install Recharts/Tremor. Line chart projects/minggu. Bar chart success vs fail. | Charts render correctly |
| VC-03 | Dashboard UI | 6-8 metric cards + tables + charts. Load <= 1.5s. | E2E: dashboard load cepat + data benar |
| VC-04 | loading.tsx | Tambah loading.tsx di: /generate, /projects, /projects/[id], /dashboard, /settings | Skeleton muncul saat loading |
| VC-05 | error.tsx | Tambah error.tsx per page group: error message + retry + home link | Error boundary jalan |
| VC-06 | Design tokens | Primary violet #7c3aed, font Inter, spacing 4px, radius 6px. Disabled states. Empty states. | Visual konsisten |

### Fase D: Quality & Deploy (SHOULD -- 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VD-01 | Pagination | Projects list: ?page=1&limit=20. UI: page numbers + prev/next. | E2E: pagination jalan |
| VD-02 | Suspense boundaries | Tambah Suspense di projects list, dashboard, generate page | Streaming SSR jalan |
| VD-03 | SQA unit test | Jalankan semua test. Coverage >= 80%. Fix failing tests. | pnpm test --coverage >= 80% |
| VD-04 | SQA E2E test | Critical path: login -> set provider -> upload + classify -> generate -> save -> export | pnpm test:e2e green |
| VD-05 | Lint + typecheck | pnpm lint 0 error. pnpm typecheck 0 error. | CI gate pass |
| VD-06 | Performance test | Latency: Shorts <= 60s, Dashboard <= 1.5s, Page transition <= 200ms | Metrics sesuai target |
| VD-07 | Deploy Vercel | Deploy preview. Set env vars. E2E test di preview URL. | Preview URL jalan |

### Fase Dependency Graph

`
Fase A (Core) -> Fase B (Intelligence) -> Fase D (Quality)
                     |
                     +-> Fase C (Dashboard) -> Fase D (Quality)
`

Fase A harus selesai dulu (upload flow = foundation untuk classification). Fase B dan C bisa paralel. Fase D = final validation.

---

## 13. Verifikasi & Pengujian

### 13.1 Test Strategy

| Level | Tool | Scope | Target |
|---|---|---|---|
| Unit | Vitest (co-located) | lib/ai/*, lib/db/repositories/*, lib/crypto/*, lib/validation/*, lib/storage/*, lib/export/* | >= 80% coverage |
| Integration | Vitest + Turso test DB | API route handlers + repository queries | >= 70% coverage |
| E2E | Playwright | Critical path: login -> set provider -> upload + classify -> generate -> save -> export | 100% pass |
| Lint | ESLint (next lint) | src/** | 0 error, 0 warning |
| Type check | tsc --noEmit | Type safety | 0 error |
| Build | next build | Production build | Sukses |

### 13.2 Test Case V2 (mapping AC PRD V2)

| AC PRD V2 | Test case | Level |
|---|---|---|
| AC-V2-01 | DropzoneUploader di generate page. Multi-file upload. Backward compat project detail. | E2E |
| AC-V2-02 | Upload -> Vision LLM classify -> result visible. Manual override. Fallback ke manual. Cache result. | E2E + Unit |
| AC-V2-03 | 6 opsi tipe: tokoh/background/prop/accessory/environment/other. Zod enum valid. | Unit (Zod) + E2E |
| AC-V2-04 | Textarea deskripsi cerita. Max 500 char. Inject ke prompt. | Unit + E2E |
| AC-V2-05 | SSE log events. Collapsible panel. Toggle show/hide. Default OFF. | E2E |
| AC-V2-06 | Dashboard 6-8 cards + charts + recent + per-provider. Load <= 1.5s. | E2E + Performance |
| AC-V2-07 | loading.tsx + error.tsx per page group. Disabled states. Design tokens. | Manual + Visual |
| AC-V2-08 | Coverage >= 80%. E2E green. Lint 0. Typecheck 0. Build pass. | CI |
| AC-V2-09 | Pagination projects list. Page transition <= 200ms. Suspense. | E2E + Performance |
| AC-V2-10 | Repo ter-push. .gitignore lengkap. README updated. | Manual |

### 13.3 Command Verifikasi

`ash
# Setup
pnpm install

# Dev
pnpm dev

# Quality gates
pnpm lint                          # ESLint -- 0 error
pnpm typecheck                     # tsc --noEmit -- 0 error
pnpm test --coverage               # Vitest -- >= 80%
pnpm test:e2e                      # Playwright -- 100% critical
pnpm build                         # Next.js build -- sukses

# DB
pnpm db:generate                   # Generate migration SQL
pnpm db:push                       # Apply ke Turso

# Deploy
pnpm deploy                        # Vercel deploy
`

### 13.4 Definition of Done Teknis

**Fase A DoD:**
- [ ] Git repo ter-push ke GitHub
- [ ] Schema migration V2 sukses (3 kolom nullable tambah)
- [ ] Upload di generate page jalan (multi-file)
- [ ] 6 opsi role classification jalan
- [ ] Field deskripsi cerita jalan
- [ ] pnpm build pass
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error

**Fase B DoD:**
- [ ] AI image classification jalan (Vision LLM)
- [ ] Classification UI visible + manual override
- [ ] Real-time log events di SSE
- [ ] LogViewer Collapsible jalan

**Fase C DoD:**
- [ ] Dashboard enrichment: 6-8 cards + charts + tables
- [ ] Dashboard load <= 1.5s
- [ ] loading.tsx + error.tsx per page group
- [ ] Design tokens konsisten

**Fase D DoD:**
- [ ] Pagination projects list jalan
- [ ] Coverage >= 80% unit/integration
- [ ] E2E critical path green
- [ ] Performance targets terpenuhi
- [ ] Deploy Vercel preview sukses

**Cross-fase DoD:**
- [ ] Semua 30 larangan CODING_RULES S13 dipatuhi
- [ ] Tidak ada any tanpa // eslint-disable + alasan
- [ ] Tidak ada secret di client-side
- [ ] Tidak ada LLM call / decrypt di Client Component
- [ ] Server Component default, Client Component minimal
- [ ] Conventional commit + PR review

---

## 14. Asumsi

| ID | Asumsi | Status | Dampak bila Salah |
|---|---|---|---|
| SRS-V2-A1 | Vision LLM tersedia untuk classification (GPT-4o / Gemini Vision) | Perlu konfirmasi provider | Pipeline V2-3 tidak jalan |
| SRS-V2-A2 | Deskripsi cerita = optional textarea, max 500 char | Perlu konfirmasi | Schema + form beda |
| SRS-V2-A3 | Real-time logs = Collapsible panel, default OFF | Perlu konfirmasi UI pattern | Frontend design beda |
| SRS-V2-A4 | Dashboard = simple cards + tables + charts (Recharts/Tremor) | Perlu konfirmasi complexity | Dependencies + dev time beda |
| SRS-V2-A5 | Upload di generate page = pre-submit (upload dulu, baru generate) | Perlu konfirmasi flow | UX flow beda |
| SRS-V2-A6 | Role: tokoh/background/prop/accessory/environment/other (6 opsi) | Perlu konfirmasi opsi | Schema + UI beda |
| SRS-V2-A7 | Push GitHub = public repo | Perlu konfirmasi visibility | .gitignore beda |
| SRS-V2-A8 | Deploy target Vercel (masih bisa Laragon untuk dev) | Perlu konfirmasi | Env vars beda |
| SRS-V2-A9 | AI SDK tetap v4 (tidak upgrade ke v6) | ASUMSI: upgrade = OOS V2 | Bila upgrade, breaking changes |
| SRS-V2-A10 | Tidak ada schema migration besar (kolom additive only) | ASUMSI | Bila perlu migration, tambah task |
| SRS-V2-A11 | Classification auto-trigger saat upload (seamless UX) | Perlu konfirmasi | Bila manual trigger, flow beda |
| SRS-V2-A12 | Batch classify max 5 gambar per call | ASUMSI | Bila beda, API cost beda |
| SRS-V2-A13 | Confidence threshold 0.7 untuk auto-classify | ASUMSI | Bila beda, UI behavior beda |
| SRS-V2-A14 | Recharts atau Tremor untuk dashboard charts | Perlu konfirmasi library | Dependencies beda |
| SRS-V2-A15 | Retry policy LLM = 2 attempts + backoff (existing V1) | Dari kode existing | Bila 3x backoff, update llm-client.ts |

---

## 15. Referensi

### 15.1 Dokumen Internal

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md |
| BRD V2.0 | C:\laragon\www\PromptFlow\product-docs\BRD.md |
| MRD V2.0 | C:\laragon\www\PromptFlow\product-docs\MRD.md |
| PRD V2.0 | C:\laragon\www\PromptFlow\product-docs\PRD.md |
| AGENTS.md | C:\laragon\www\PromptFlow\product-docs\AGENTS.md |
| GitHub | https://github.com/agrianwahab29/promptflow.git |

### 15.2 Sitasi Eksternal

| Sitasi | Klaim |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider via @ai-sdk/openai-compatible |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js |
| https://turso.tech/blog/serverless | Vercel FS tidak persisten -> Turso |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter |

---

> **Dokumen ini = spesifikasi teknis eksekutabel untuk upgrade V2 PromptFlow.**
> **Tiap fitur PRD V2 punya realisasi teknis di sini. Detail penuh di**
> **DATABASE_SCHEMA.md, API_CONTRACT.md, PROJECT_ARCHITECTURE.md, CODING_RULES.md.**
> **SRS tidak membangun deliverable akhir -- hanya spesifikasi.**

> **Dibuat oleh:** docgen-srs subagent
> **Tanggal:** 2026-06-20
> **Versi:** 2.0
