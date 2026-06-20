# AGENTS.md — Panduan Build PromptFlow V2

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Peran dokumen:** Panduan operasional tegas untuk LLM/agent eksekutor membangun deliverable PromptFlow V2 upgrade. Berdiri sendiri — baca dokumen ini + rujukan product-docs/ sebelum coding.
> **Status dokumen:** V2 Upgrade — V1 sudah built & berjalan. Semua CRITICAL findings dari REVIEW_REPORT.md V2 sudah di-fix.
> **Review:** PASS WITH WARNINGS (REVIEW_REPORT.md V2). 0 CRITICAL open.

---

## Daftar Isi

1. Identitas Proyek
2. Sumber Kebenaran (WAJIB BACA)
3. Stack & Versi Final (GROUND TRUTH)
4. Prinsip Kerja
5. Struktur Folder
6. Tahapan Build (Fase A-D)
7. Endpoint API Ringkas (23 endpoint)
8. Schema DB Ringkas
9. PromptPackageSchema (Source of Truth LLM Output)
10. Keamanan Wajib
11. Testing Wajib
12. Environment Variables
13. Command Build
14. Catatan Reviewer
15. Definition of Done
16. Asumsi yang Harus Dikonfirmasi User

---

## 1. Identitas Proyek

| Aspek | Nilai |
|---|---|
| Nama | **PromptFlow** |
| Deskripsi | Web app fullstack otomasi susun paket prompt animasi AI terstruktur (JSON + markdown) dari input minimal (judul + durasi + gaya), multi-provider LLM, konsistensi karakter lintas adegan. |
| Tipe | Web app fullstack (frontend + backend satu repo) |
| Repo GitHub | `https://github.com/agrianwahab29/promptflow.git` |
| **Status kode** | **V1 sudah built & berjalan. V2 = upgrade iteratif.** 9 tabel DB, auth NextAuth, upload Vercel Blob, generate SSE streaming, export JSON/markdown, i18n dwibahasa, 21 endpoint API. Kode berjalan di Laragon localhost. |
| Root proyek | `C:\laragon\www\PromptFlow` |
| Deploy target | Vercel (serverless) + Turso DB + Vercel Blob |
| Output deliverable | Teks prompt JSON terstruktur (`PromptPackageSchema`) + export markdown. **BUKAN** file media. |
| Stack ringkas | Next.js App Router + AI SDK **v4** + `@ai-sdk/openai-compatible` + Turso/libSQL + Drizzle ORM + Tailwind v4 + shadcn/ui + Vercel Blob + NextAuth.js + Zod + next-intl + Vitest + Playwright + ESLint |

**CATATAN CRIT-001:** V1 sudah built. Agent eksekutor WAJIB memahami ini proyek upgrade, bukan greenfield. Jangan overwrite V1 codebase. V2 = additive changes: upload flow, AI classification, story description, real-time logs, dashboard enrichment, UI consistency, pagination, GitHub push.

---

## 2. Sumber Kebenaran (WAJIB BACA)

BACA SEMUA dokumen ini sebelum tulis satu baris kode pun. Pakai fakta bersitasi. Tandai `ASUMSI` bila tidak ada bukti eksplisit di dokumen. Jangan halusinasi field/endpoint/rule yang tidak ada.

| # | Dokumen | Path absolut | Peran |
|---|---|---|---|
| 1 | RAG-CONTEXT | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` | Sumber kebenaran faktual asli (gap list, kode V1 analysis, V2 requirements) |
| 2 | BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | **Why** — nilai bisnis, KPI, stakeholder, V2 scope |
| 3 | MRD | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | **Who** — pasar, persona, positioning |
| 4 | PRD | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | **What** — FR-01..FR-19 + FR-V2-01..FR-V2-10, MoSCoW, JSON schema, acceptance criteria |
| 5 | SRS | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | **How** — arsitektur, tech stack, spec fungsional, data model, interface, constraint, keamanan, tahapan V2 |
| 6 | DATABASE_SCHEMA | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` | 9 entitas + 3 kolom V2 nullable, Drizzle schema, migration plan |
| 7 | PROJECT_ARCHITECTURE | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | Folder V2, container/component C4, data flow, deployment, security boundary, ADR |
| 8 | UIUX_SPEC | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | Design tokens (warna/tipografi/spacing), komponen UI V2, user flows, wireframe, a11y |
| 9 | API_CONTRACT | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` | 23 endpoint (21 V1 + 2 V2), SSE protocol, Zod schemas, error envelope, rate limit |
| 10 | CODING_RULES | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | Standar koding, 38 larangan (L01-L38), security rules, test standards |
| 11 | TEST_PLAN | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` | 134 test case (86 V1 + 48 V2), coverage target, CI gate |
| 12 | REVIEW_REPORT | `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` | Validasi lintas dokumen — 6 CRITICAL (4 di AGENTS.md, sudah di-fix di V2 ini) |

**Aturan baca:** tiap keputusan teknis WAJIB bisitasi (path + section). Klaim tanpa bukti = `ASUMSI` + konfirmasi user (lihat §16).

---

## 3. Stack & Versi Final (GROUND TRUTH dari package.json)

> **Penting:** Semua versi di bawah dari `package.json` (ground truth). **AI SDK = v4, BUKAN v6.** Kode = ground truth.

| Lapisan | Teknologi | Versi (package.json) | Sitasi |
|---|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 | `package.json:22` |
| UI Library | React + ReactDOM | ^19.0.0 | `package.json:23-24` |
| **AI SDK** | **ai (Vercel AI SDK)** | **^4.0.0** | `package.json:25` |
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
| TypeScript | typescript | ^5.7.0 | `package.json:60` |
| Tailwind CSS | tailwindcss | ^4.0.0 | `package.json:70` |
| Test Unit | vitest | ^2.1.0 | `package.json:74` |
| Test Coverage | @vitest/coverage-v8 | ^2.2.0 | `package.json:75` |
| Test E2E | @playwright/test | ^1.49.0 | `package.json:77` |
| Lint | eslint + eslint-config-next | ^9.17.0 / ^15.1.0 | `package.json:65-66` |
| Format | prettier + prettier-plugin-tailwindcss | ^3.4.0 / ^0.6.0 | `package.json:78-79` |
| Package Manager | pnpm | 11.7.0 | `package.json:81` |
| DB Engine | Turso (libSQL via HTTP) | latest | `drizzle.config.ts:12` |

**CATATAN CRIT-002:** Docs V1 menyebut "AI SDK v6" tapi `package.json` = `"ai": "^4.0.0"`. **Kode = ground truth.** Jangan install AI SDK v6. Tidak upgrade ke v6 = out of scope V2.

---

## 4. Prinsip Kerja

Aturan tegas, wajib patuh sepanjang build:

1. **Type-safe strict.** `tsconfig.json` `strict: true`. `no any` (L06). `unknown` + Zod narrow.
2. **Secure by default.** API key = AES-256-GCM at rest, mask `****` di response, decrypt server-only.
3. **Repository pattern.** DB akses lewat `lib/db/repositories/*.repo.ts`. Tidak ada query Drizzle langsung di route handler/component.
4. **Server Component default.** Client Component hanya bila butuh interaksi (form, streaming, toggle). `'use client'` minimal.
5. **Validation Zod di boundary.** Input request → Zod parse sebelum proses. LLM output → Zod `PromptPackageSchema` parse.
6. **Direct HTTP + retry 2x backoff.** V1 pakai direct HTTP POST ke `/chat/completions` (bukan `generateObject`). Retry 2x default + exponential backoff max 8000ms. Post-check `consistency-checker.ts` + Zod validate. **CATATAN: docs V1 sebut "generateObject + 3x backoff" — KODE pakai direct HTTP + 2x backoff. Kode = ground truth.** Sitasi: `RAG-CONTEXT.md §5.2, §8.7` ; `llm-client.ts:14,131`
7. **Streaming SSE.** `POST /api/v1/generate` = `text/event-stream`. V2 tambah event type `log`.
8. **i18n key.** Teks UI via `useTranslations`/`getTranslations` next-intl. No hardcoded teks (L09). Dwibahasa ID + EN.
9. **a11y WCAG 2.1 AA.** Focus visible, keyboard nav, label, kontras.
10. **Test 80% coverage** unit/integration (Vitest co-located). E2E critical path (Playwright). CI gate.
11. **Conventional commit.** `feat(scope): ...`, `fix(scope): ...`. Atomic commit.
12. **No direct push `main`.** Lewat PR + review. Branch `feat/<scope>`, `fix/<scope>`, `chore/<scope>`.
13. **No secret client-side.** API key LLM, ENCRYPTION_KEY, NEXTAUTH_SECRET = server-only.
14. **No LLM call client-side.** `lib/ai/*` wajib `import 'server-only'`.
15. **Hormati 38 Larangan** CODING_RULES §13 (L01-L38) — baca sebelum coding.

---

## 5. Struktur Folder

Struktur folder V2 = V1 + file/komponen baru. Ikut `PROJECT_ARCHITECTURE.md §5`.

```text
PromptFlow/
  product-docs/                      # dokumen (read-only rujukan)
  drizzle/                           # output migration SQL
  messages/                          # i18n messages (next-intl)
    id.json
    en.json
  public/
    references/                      # dev-only upload FS
  src/
    app/
      api/
        v1/                          # prefix v1
          auth/[...nextauth]/route.ts
          auth/session/route.ts      # GET session
          health/route.ts
          projects/route.ts          # GET list (+pagination), POST create
          projects/[id]/route.ts     # GET, PATCH, DELETE
          projects/[id]/export/route.ts
          projects/[id]/characters/route.ts
          projects/[id]/scenes/route.ts
          projects/[id]/image-prompts/route.ts
          projects/[id]/logs/route.ts
          generate/route.ts          # POST SSE (+ log events V2)
          upload/route.ts            # POST multipart (+6-tipe V2, +aiClassification)
          upload/classify/route.ts   # V2 BARU: trigger AI classification
          dashboard/route.ts         # V2 BARU: enrichment data
          settings/providers/route.ts
          settings/providers/[id]/route.ts
          settings/providers/[id]/test/route.ts
      [locale]/
        layout.tsx
        generate/
          loading.tsx                # V2 BARU
          page.tsx                   # V2: upload di sini (bukan project detail)
        projects/
          loading.tsx                # V2 BARU
          page.tsx                   # V2: +pagination
          [id]/
            loading.tsx              # V2 BARU
            page.tsx                 # V2: view refs only (read-only)
        dashboard/
          loading.tsx                # V2 BARU
          page.tsx                   # V2: charts + activity + per-provider
        settings/
          loading.tsx                # V2 BARU
          page.tsx
        login/page.tsx
      layout.tsx                     # root + i18n provider
      page.tsx                        # redirect
      globals.css                     # Tailwind v4 + design tokens UIUX_SPEC §2
    components/
      ui/                             # shadcn/ui (18 komponen V2)
      generate/                       # generate-form, dropzone-uploader (6-tipe V2),
                                      # asset-preview-list V2, classification-result V2,
                                      # log-viewer V2, result-tabs, template-picker
      projects/                       # project-card, projects-pagination V2
      dashboard/                      # metric-card V2, weekly-trend-chart V2,
                                      # success-fail-bar-chart V2, per-provider-breakdown-table V2,
                                      # recent-activity-table V2, storage-usage-card V2
      settings/                       # provider-config-form, provider-card
      common/                         # app-header, language-toggle, copy-button,
                                      # pagination V2, page-loading-skeleton V2, page-error-boundary V2
      providers.tsx
    lib/
      ai/
        provider-registry.ts          # createOpenAICompatible (server-only)
        image-classifier.ts           # V2 BARU: Vision LLM direct HTTP
        prompt-builder.ts             # assemble system prompt (+V2: storyDescription + 6-tipe refs)
        llm-client.ts                 # direct HTTP + retry 2x backoff (+V2: log buffer)
        response-parser.ts            # Zod validate, fallback JSON parse
        consistency-checker.ts        # post-check FR-12
        log-buffer.ts                 # V2 BARU: in-memory log buffer
        prompts/
          scenes.system.ts            # V2: +storyDescription context
          voiceover.system.ts
          character.system.ts
          image-prompts.system.ts     # V2: 6-tipe enum reference format
          moral.system.ts
      db/
        client.ts
        schema.ts                     # 9 tabel + 3 kolom nullable V2
        repositories/
          user.repo.ts
          provider-config.repo.ts
          project.repo.ts             # V2: +paginate()
          asset-reference.repo.ts     # V2: +updateClassification()
          character.repo.ts
          scene.repo.ts
          image-prompt.repo.ts
          generation-log.repo.ts      # V2: +logsJson
          supporting-character.repo.ts
          dashboard.repo.ts           # V2 BARU
      storage/blob.ts                 # Vercel Blob helper
      auth/
        config.ts
        middleware.ts
      crypto/aes.ts                   # AES-256-GCM encrypt/decrypt/mask
      i18n/
        config.ts
        request.ts
      validation/schemas.ts           # V2: 6-tipe enum + storyDescription
      export/markdown.template.ts
    middleware.ts                     # NextAuth + i18n + rate limit
  drizzle.config.ts
  next.config.ts
  components.json                     # shadcn/ui config
  package.json
  tsconfig.json
  .env.local
  .env.example
  .gitignore                          # V2 BARU
  README.md
```

---

## 6. Tahapan Build (Fase A-D)

Urut dari `SRS.md §12`. V2 = UPGRADE, bukan init dari nol.

### Fase A: Core V2 (MUST — 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VA-01 | Git init + .gitignore | `git init`, `.gitignore` lengkap, README updated | Repo ter-push ke GitHub |
| VA-02 | Schema migration V2 | Tambah 3 kolom nullable: `projects.story_description`, `asset_references.ai_classification`, `generation_logs.logs_json`. `drizzle-kit generate` + `push`. | Migration sukses, existing data intact |
| VA-03 | Upload di generate page | Pindahkan DropzoneUploader dari project detail ke generate form. Upload tanpa projectId. Backward compat. | E2E upload di generate page jalan |
| VA-04 | Extended role classification | Update `GenerateReferenceSchema.type` ke 6 opsi. Update DropzoneUploader select. Update upload route validation. | 6 opsi tipe muncul di UI + validasi jalan |
| VA-05 | Field deskripsi cerita | Tambah `storyDescription` di `GenerateInputSchema`. Tambah Textarea di form. Inject ke `buildUserMessage()`. Simpan di `projects.story_description`. | E2E: isi deskripsi -> prompt lebih kontekstual |
| VA-06 | Push ke GitHub | Commit + push ke repo | Repo accessible |

### Fase B: Intelligence (SHOULD — 3-4 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VB-01 | AI image classifier | `lib/ai/image-classifier.ts`. Vision LLM HTTP call. Prompt classify. Parse response. Update `asset_references`. | Unit test classify round-trip |
| VB-02 | Classification endpoint | `POST /api/v1/upload/classify` atau auto-trigger saat upload. | E2E: upload -> auto-classify -> result visible |
| VB-03 | Classification UI | ClassificationResult component. Thumbnail + role badge + confidence + override dropdown. Fallback. | E2E: classify result visible, override jalan |
| VB-04 | Real-time logs | Extend SSE events: tambah `log` event type. Backend: buffer logs, kirim via SSE. | E2E: log events muncul di SSE stream |
| VB-05 | LogViewer component | Collapsible panel + show/hide toggle. Default OFF. | E2E: toggle show/hide jalan |

### Fase C: Dashboard & Polish (SHOULD — 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VC-01 | Dashboard queries | Extend queries via `dashboard.repo.ts`. Refactor dari direct Drizzle ke repository pattern. | Dashboard data lengkap |
| VC-02 | Dashboard charts | Install Recharts/Tremor. Line chart + Bar chart. | Charts render correctly |
| VC-03 | Dashboard UI | 6-8 metric cards + tables + charts. Load <= 1.5s. | E2E: dashboard load cepat |
| VC-04 | loading.tsx | Tambah per page group: `/generate`, `/projects`, `/projects/[id]`, `/dashboard`, `/settings` | Skeleton muncul saat loading |
| VC-05 | error.tsx | Tambah per page group: error message + retry + home link | Error boundary jalan |
| VC-06 | Design tokens | Primary violet #7c3aed, font Inter, spacing 4px, radius 6px. | Visual konsisten |

### Fase D: Quality & Deploy (SHOULD — 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VD-01 | Pagination | Projects list: `?page=1&limit=20`. UI: page numbers + prev/next. | E2E: pagination jalan |
| VD-02 | Suspense boundaries | Tambah Suspense di projects list, dashboard, generate page | Streaming SSR jalan |
| VD-03 | SQA unit test | Jalankan semua test. Coverage >= 80%. Fix failing tests. | `pnpm test --coverage` >= 80% |
| VD-04 | SQA E2E test | Critical path: login -> set provider -> upload + classify -> generate -> save -> export | `pnpm test:e2e` green |
| VD-05 | Lint + typecheck | `pnpm lint` 0 error. `pnpm typecheck` 0 error. | CI gate pass |
| VD-06 | Performance test | Latency: Shorts <= 60s, Dashboard <= 1.5s, Page transition <= 200ms | Metrics sesuai target |
| VD-07 | Deploy Vercel | Deploy preview. Set env vars. E2E test di preview URL. | Preview URL jalan |

### Dependency Graph

```
Fase A (Core) -> Fase B (Intelligence) -> Fase D (Quality)
                     |
                     +-> Fase C (Dashboard) -> Fase D (Quality)
```

Fase A harus selesai dulu. Fase B dan C bisa paralel. Fase D = final validation.

---

## 7. Endpoint API Ringkas (23 endpoint)

Total **23 endpoint** (`API_CONTRACT.md §5`). Prefix `/api/v1/*`.

| # | Method | Path | Auth | Ringkasan | V1/V2 |
|---|---|---|---|---|---|
| 1 | GET/POST | `/api/v1/auth/[...nextauth]` | Public | NextAuth handler (login/logout/session/callback) | V1 |
| 2 | **GET** | **`/api/v1/auth/session`** | **Session** | **Ambil session aktif** | **V1** |
| 3 | GET | `/api/v1/health` | Public | Health check (app + DB) | V1 |
| 4 | GET | `/api/v1/projects` | wajib | List project **paginate** per user | V1+V2 |
| 5 | POST | `/api/v1/projects` | wajib | Create + simpan result generate (**+storyDescription**) | V1+V2 |
| 6 | GET | `/api/v1/projects/[id]` | wajib | Detail + ownership check | V1 |
| 7 | PATCH | `/api/v1/projects/[id]` | wajib | Update metadata | V1 |
| 8 | DELETE | `/api/v1/projects/[id]` | wajib | Soft delete (`deleted_at`) | V1 |
| 9 | POST | `/api/v1/generate` | wajib | Streaming SSE → PromptPackage (**+log events, +storyDescription**) | V1+V2 |
| 10 | GET | `/api/v1/settings/providers` | wajib | List provider per user (key mask) | V1 |
| 11 | POST | `/api/v1/settings/providers` | wajib | Save provider (encrypt key) | V1 |
| 12 | PATCH | `/api/v1/settings/providers/[id]` | wajib | Update provider | V1 |
| 13 | DELETE | `/api/v1/settings/providers/[id]` | wajib | Hapus provider | V1 |
| 14 | POST | `/api/v1/settings/providers/[id]/test` | wajib | Test reachability provider + model | V1 |
| 15 | POST | `/api/v1/upload` | wajib | Multipart → Blob → AssetReference (**projectId opsional, 6-tipe, auto-classify**) | V1+V2 |
| 16 | **POST** | **`/api/v1/upload/classify`** | **wajib** | **Trigger Vision LLM classification** | **V2 BARU** |
| 17 | DELETE | `/api/v1/upload` | wajib | Hapus Blob + AssetReference | V1 |
| 18 | GET | `/api/v1/projects/[id]/export` | wajib | `?format=json|markdown` download | V1 |
| 19 | GET | `/api/v1/projects/[id]/characters` | wajib | List karakter master per project | V1 |
| 20 | GET | `/api/v1/projects/[id]/scenes` | wajib | List adegan berurut | V1 |
| 21 | GET | `/api/v1/projects/[id]/image-prompts` | wajib | List image prompt (+**6-tipe filter V2**) | V1+V2 |
| 22 | GET | `/api/v1/projects/[id]/logs` | wajib | History generate per project (**+logsJson V2**) | V1+V2 |
| 23 | **GET** | **`/api/v1/dashboard/stats`** | **wajib** | **Enriched dashboard data (charts, breakdown, activity)** | **V2 BARU** |

**CATATAN CRIT-006:** Endpoint `/api/v1/auth/session` wajib ada. Frontend butuh session check. TEST_PLAN TC-053 test endpoint ini.

---

## 8. Schema DB Ringkas

9 entitas + 3 kolom nullable V2 (`DATABASE_SCHEMA.md §4, §9.3`). Single source = `src/lib/db/schema.ts`.

| # | Tabel | PK | FK | Soft delete | Inti | V2 Change |
|---|---|---|---|---|---|---|
| 1 | `users` | `id` | — | — | Akun NextAuth. `email` unique, `password_hash`, `role` default `'user'`. | — |
| 2 | `provider_configs` | `id` | `user_id` → `users.id` | — | Config LLM per user. `api_key_encrypted` AES-256-GCM. | — |
| 3 | `projects` | `id` | `user_id` → `users.id` | `deleted_at` | Project prompt. `status` (draft/generating/complete/failed). | **+`story_description` (TEXT nullable)** |
| 4 | `asset_references` | `id` | `project_id` → `projects.id` | — | Metadata upload. `tipe` (6 opsi V2). | **+`ai_classification` (TEXT nullable)** |
| 5 | `characters` | `id` | `project_id` → `projects.id` | — | Master karakter konsisten. Max 10/project (app-layer). | — |
| 6 | `scenes` | `id` | `project_id` → `projects.id` | — | Adegan urut `order_no`. | — |
| 7 | `image_prompts` | `id` | `scene_id` (nullable) + `project_id` | — | `tipe` 6 opsi V2. `reference_filename` nullable. | — |
| 8 | `generation_logs` | `id` | `project_id` → `projects.id` | — | Telemetri. `status` (success/fail/partial). | **+`logs_json` (TEXT nullable)** |
| 9 | `supporting_characters` | `id` | `project_id` + `scene_id` (nullable) | — | `tipe` (pendukung/hewan). | — |

---

## 9. PromptPackageSchema (Source of Truth LLM Output)

Copy ke `src/lib/validation/schemas.ts`. Match PRD §8.2 + SRS §7.5 + API_CONTRACT §8.6.

```ts
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
```

---

## 10. Keamanan Wajib

| ID | Requirement | Implementasi | Sitasi |
|---|---|---|---|
| SEC-01 | API key user dienkripsi | AES-256-GCM `lib/crypto/aes.ts` | `SRS.md §10.1 SEC-01` |
| SEC-02 | API key tidak expose ke client | Mask `****` + 4 char terakhir | `SRS.md §10.1 SEC-02` |
| SEC-03 | Provider call server-only | `lib/ai/*` + `lib/crypto/*` `import 'server-only'` | `SRS.md §10.1 SEC-03` |
| SEC-04 | 9router localhost hanya server-side | `http://localhost:20128/v1` tidak reachable dari client | ASUMSI |
| SEC-05 | CSRF protection | Next.js built-in + NextAuth | `SRS.md §10.1 SEC-05` |
| SEC-06 | Input sanitization (XSS) | Zod validasi + escape HTML | `SRS.md §10.1 SEC-06` |
| SEC-07 | Ownership check RBAC | `project.user_id === session.user.id` | `SRS.md §10.1 SEC-07` |
| SEC-08 | Env secret management | Guard `if (!env) throw` di init | `SRS.md §10.1 SEC-08` |
| SEC-09 | HTTPS only | Vercel default | `SRS.md §10.1 SEC-09` |
| SEC-10 | Rate limit generate | 10 req/min/user. Header `X-RateLimit-*`. | `SRS.md §10.1 SEC-10` |
| SEC-11 | Protected routes | Middleware: `/api/v1/*` kecuali auth/health | `SRS.md §10.1 SEC-11` |
| SEC-12 | NextAuth secret | `NEXTAUTH_SECRET` wajib | `SRS.md §10.1 SEC-12` |
| SEC-13 | No secret client-side | `NEXT_PUBLIC_*` hanya non-sensitif | CODING_RULES §6.1 |
| SEC-14 | Password hash | bcryptjs untuk `users.password_hash` | DATABASE_SCHEMA §9.3 |
| SEC-15 | **V2: Vision LLM key env-only** | `VISION_LLM_API_KEY` server-side only | PROJECT_ARCHITECTURE §10 SB-14 |
| SEC-16 | **V2: storyDescription max 500** | Zod validate sebelum prompt injection + DB save | SRS §6.4 FR-V2-04 |
| SEC-17 | **V2: Log buffer sanitization** | Log lines escape HTML sebelum render | PROJECT_ARCHITECTURE §10 SB-16 |

**Larangan kunci** (CODING_RULES §13, L01-L38): L06 no any, L07 no hardcoded secret, L12 no query tanpa `user_id`, L14 no string concat SQL, L24 no LLM call client, L25 no decrypt client, L31 no Vision LLM client, L32 no Drizzle direct di dashboard, L34 no log persist per line.

---

## 11. Testing Wajib

| Level | Tool | Target | Sitasi |
|---|---|---|---|
| Unit | Vitest (co-located) | **>= 80% coverage** | SRS §13.1 |
| Integration | Vitest + Turso test DB | >= 70% | SRS §13.1 |
| E2E | Playwright | 100% critical path | SRS §13.1 |
| Lint | ESLint (`next lint`) + tsc | 0 error | CODING_RULES §9.1 |
| Build | `next build` | Pass | SRS §13.1 |
| a11y | axe (Playwright) | WCAG 2.1 AA | UIUX_SPEC §9 |

**CI gate:** PR tidak merge bila lint/typecheck/test/e2e/build fail.

---

## 12. Environment Variables

| Env key | Wajib | V1/V2 | Deskripsi | Sitasi |
|---|---|---|---|---|
| `TURSO_DATABASE_URL` | YA | V1 | URL Turso DB | DATABASE_SCHEMA §12.3 |
| `TURSO_AUTH_TOKEN` | YA | V1 | Token auth Turso | DATABASE_SCHEMA §12.3 |
| `ENCRYPTION_KEY` | YA | V1 | Key AES-256-GCM (32 byte base64) | DATABASE_SCHEMA §12.3 |
| `NEXTAUTH_SECRET` | YA | V1 | Secret NextAuth JWT | SRS §10.1 SEC-12 |
| `NEXTAUTH_URL` | YA (prod) | V1 | URL deploy | SRS §10.1 |
| `BLOB_READ_WRITE_TOKEN` | YA | V1 | Token Vercel Blob | DATABASE_SCHEMA §12.3 |
| `USE_VERCEL_BLOB` | Opsional | V1 | Flag dev Blob vs FS | ASUMSI |
| `NEXT_PUBLIC_APP_URL` | YA | V1 | URL publik client (non-sensitif) | CODING_RULES §2.1 |
| `VISION_LLM_PROVIDER` | YA | **V2** | `'openai' \| 'google'` — pilih Vision provider | PROJECT_ARCHITECTURE §9.1 |
| `VISION_LLM_API_KEY` | YA | **V2** | API key Vision LLM (server-only) | PROJECT_ARCHITECTURE §9.1 |
| `VISION_LLM_MODEL` | YA | **V2** | Model ID Vision (mis. `gpt-4o`, `gemini-1.5-flash`) | PROJECT_ARCHITECTURE §9.1 |
| `VISION_LLM_BASE_URL` | Opsional | **V2** | Custom base URL Vision | ASUMSI |

**Guard wajib:**
```ts
if (!process.env.ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY');
if (!process.env.TURSO_DATABASE_URL) throw new Error('Missing TURSO_DATABASE_URL');
if (!process.env.NEXTAUTH_SECRET) throw new Error('Missing NEXTAUTH_SECRET');
```

---

## 13. Command Build

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test --coverage
pnpm test:e2e
pnpm db:generate
pnpm db:push
```

---

## 14. Catatan Reviewer

Paket dokumen V2 = **PASS WITH WARNINGS** (`REVIEW_REPORT.md`). 6 CRITICAL (4 di AGENTS.md V1, sudah fix di V2 ini).

### CRITICAL yang SUDAH di-fix (di AGENTS.md V2 ini):

- **CRIT-001:** Status kode dari "Greenfield" → **"V1 sudah built. V2 = upgrade iteratif."**
- **CRIT-002:** AI SDK dari "v6" → **"^4.0.0" (ground truth package.json:25).**
- **CRIT-003:** Generate mechanism dari "generateObject + 3x backoff" → **"direct HTTP fetch + 2x backoff + Zod validate".**
- **CRIT-006:** Missing endpoint `/api/v1/auth/session` → **ditambahkan di §7 tabel endpoint.**

### CRITICAL yang perlu fix di dokumen lain:

- **CRIT-004:** Dashboard endpoint path inkonsisten (`/api/v1/dashboard` vs `/api/v1/dashboard/stats`). Perlu fix di SRS §8.2 + PRD §9.2.
- **CRIT-005:** Orphan ref attachment flow tidak ada test case eksplisit. Perlu tambah di TEST_PLAN.

### WARNING (boleh lanjut dengan catatan):

- **WARN-001:** PROJECT_ARCHITECTURE retry count vs CODING_RULES.
- **WARN-004:** Repo method naming (`listActiveProjects` vs `paginate()`).
- **WARN-005:** Vision LLM provider belum eksplisit (default: openai GPT-4o).

---

## 15. Definition of Done

**Fase A DoD:**
- [ ] Git repo ter-push ke GitHub
- [ ] Schema migration V2 sukses (3 kolom nullable tambah)
- [ ] Upload di generate page jalan (multi-file, 6-tipe)
- [ ] Field deskripsi cerita jalan
- [ ] pnpm build pass + lint 0 error + typecheck 0 error

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
- [ ] Semua 38 larangan CODING_RULES §13 (L01-L38) dipatuhi
- [ ] Tidak ada `any` (L06) tanpa `// eslint-disable` + alasan
- [ ] Tidak ada secret di client-side
- [ ] Tidak ada LLM call / decrypt di Client Component
- [ ] Conventional commit + PR review, no direct push `main`

---

## 16. Asumsi yang Harus Dikonfirmasi User

| ID | Asumsi | Status | Dampak bila Salah |
|---|---|---|---|
| V2-A1 | Vision LLM tersedia (GPT-4o/Gemini Vision) | Perlu konfirmasi provider | Pipeline V2-3 tidak jalan |
| V2-A2 | Deskripsi cerita = optional, max 500 | ASUMSI | Schema + form beda |
| V2-A3 | Real-time logs = Collapsible, default OFF | ASUMSI | Frontend design beda |
| V2-A4 | Dashboard = cards + tables + charts | ASUMSI | Dev time beda |
| V2-A5 | Upload di generate = pre-submit | ASUMSI | UX flow beda |
| V2-A6 | Role = 6 opsi | Dikonfirmasi | — |
| V2-A7 | Push GitHub = public | ASUMSI | .gitignore beda |
| V2-A8 | AI SDK tetap v4 | Dikonfirmasi kode | — |
| V2-A9 | Schema additive only | Dikonfirmasi | — |
| V2-A10 | Vision LLM key dari env | Dikonfirmasi | — |
| V2-A11 | Auto-trigger classify saat upload | ASUMSI | UX flow beda |
| V2-A12 | Batch classify max 5 | ASUMSI | API cost beda |
| V2-A13 | Confidence threshold 0.7 | ASUMSI | UI behavior beda |
| V2-A14 | Recharts untuk chart | ASUMSI | Bundle beda |
| V2-A15 | Retry 2x + backoff 8000ms | Dikonfirmasi kode | — |
| V2-A16 | Password hash bcryptjs | ASUMSI | — |
| V2-A17 | Upload max 10MB | ASUMSI | — |
| V2-A18 | Pagination 20/page max 100 | ASUMSI | — |

---

## Larangan Eksekusi

- **Jangan ubah scope** tanpa konfirmasi user. OOS per PRD §11 + BRD §5.2 tetap out.
- **Jangan skip aset wajib** (schema DB, upload flow, AI classify, real-time logs, dashboard, pagination, test).
- **Jangan langgar CODING_RULES §13** (L01-L38). Baca sebelum coding.
- **Jangan halusinasi** field/endpoint/rule. Pakai fakta bersitasi.
- **Jangan tukar stack** (Drizzle → Prisma, next-intl → native, Vercel Blob → S3) tanpa konfirmasi.
- **Jangan pakai AI SDK v6.** Kode = v4. Upgrade v6 = OOS V2.
- **Jangan pakai `generateObject`** untuk generate. Kode pakai direct HTTP + retry 2x.
- **Jangan push `main` langsung** (L20). Lewat PR + review.
- **Jangan commit secret** ke repo. `.env.local` di `.gitignore`.
- **Jangan skip test**. CI gate wajib.

---

> **Dokumen ini = panduan kerja V2. Eksekutor cukup baca AGENTS.md + rujukan product-docs/ untuk membangun PromptFlow V2. Mulai Fase A, verifikasi per task, cap DoD, lanjut Fase B/C/D. Bila ragu pada asumsi, konfirmasi user.**

**Dibuat oleh:** docgen-agentsmd subagent
**Tanggal:** 2026-06-20
**Versi:** 2.0
