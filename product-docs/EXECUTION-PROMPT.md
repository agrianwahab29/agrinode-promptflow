# EXECUTION PROMPT - PromptFlow V2

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Tipe:** Prompt eksekusi final siap-tempel untuk agent eksekutor (Claude Code / Aider / Codex / OpenCode / dll).
> **Target:** Upgrade PromptFlow V1 ke V2 — 8 fitur baru, autonomous sampai selesai.
> **Status kode:** V1 SUDAH built & berjalan. V2 = upgrade iteratif, BUKAN greenfield.

---

## 1. Identitas & Tujuan

Kamu adalah agent eksekutor otonom. Tugas: **upgrade PromptFlow V1 ke V2** — web app fullstack Next.js App Router yang mengotomasi susunan paket prompt animasi AI terstruktur (JSON + markdown) dari input minimal. V1 sudah jalan: 9 tabel DB, auth NextAuth, upload Vercel Blob, generate SSE streaming, export JSON/markdown, i18n dwibahasa, 21 endpoint API.

**CRITICAL:** Ini proyek UPGRADE, bukan greenfield. JANGAN overwrite V1 codebase. V2 = additive changes saja.

- **Root proyek:** `C:\laragon\www\PromptFlow`
- **Repo GitHub:** `https://github.com/agrianwahab29/promptflow.git`
- **Deploy target:** Vercel (serverless) + Turso DB + Vercel Blob
- **Output deliverable:** Teks prompt JSON terstruktur (`PromptPackageSchema`) + export markdown. **BUKAN** file media.
- **Bahasa instruksi:** Bahasa Indonesia. Identifier teknis apa adanya.

---

## 2. Sumber Kebenaran (WAJIB BACA SEBELUM CODING)

**Aturan mutlak:** BACA SEMUA dokumen ini sebelum tulis satu baris kode. Mulai `AGENTS.md`, lalu rujukan lain. Pakai fakta bersitasi. Klaim tanpa bukti = `ASUMSI`.

| # | Dokumen | Path absolut | Peran |
|---|---|---|---|
| 0 | AGENTS.md | `C:\laragon\www\PromptFlow\product-docs\AGENTS.md` | **Panduan utama** — baca pertama. Stack, prinsip, struktur folder, tahapan Fase A-D, schema DB, endpoint, keamanan, testing, env, DoD, asumsi. |
| 1 | RAG-CONTEXT.md | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` | Sumber kebenaran faktual (gap list, kode V1 analysis, V2 requirements). |
| 2 | BRD.md | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | Why — nilai bisnis, KPI, stakeholder, V2 scope. |
| 3 | MRD.md | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | Who — pasar, persona, positioning. |
| 4 | PRD.md | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | What — FR-01..FR-19 + FR-V2-01..FR-V2-10, MoSCoW, JSON schema, acceptance criteria. |
| 5 | SRS.md | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | How — arsitektur, tech stack, spec fungsional, data model, interface, constraint, keamanan, tahapan V2. |
| 6 | DATABASE_SCHEMA.md | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` | 9 entitas + 3 kolom V2 nullable, Drizzle schema, migration plan. |
| 7 | PROJECT_ARCHITECTURE.md | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | Folder V2, container/component C4, data flow, deployment, security boundary. |
| 8 | UIUX_SPEC.md | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | Design tokens, komponen UI V2, user flows, wireframe, a11y. |
| 9 | API_CONTRACT.md | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` | 23 endpoint, SSE protocol V2, Zod schemas, error envelope, rate limit. |
| 10 | CODING_RULES.md | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | Standar koding, **38 larangan (L01-L38)**, security rules, test standards. |
| 11 | TEST_PLAN.md | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` | 168 test case, coverage target, CI gate. |
| 12 | REVIEW_REPORT.md | `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` | Validasi lintas dokumen — 6 CRITICAL (4 sudah fix di AGENTS.md V2). |

---

## 3. Stack Final (GROUND TRUTH dari package.json)

**PENTING:** AI SDK = **v4** (BUKAN v6). Kode = ground truth. Jangan install AI SDK v6.

| Lapisan | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 |
| UI Library | React + ReactDOM | ^19.0.0 |
| **AI SDK** | **ai (Vercel AI SDK)** | **^4.0.0** |
| AI Provider | @ai-sdk/openai-compatible | ^1.0.0 |
| Validasi | Zod | ^3.24.0 |
| Auth | next-auth | 5.0.0-beta.25 |
| Password Hash | bcryptjs | ^2.4.3 |
| DB Client | @libsql/client | ^0.14.0 |
| ORM | drizzle-orm | ^0.38.0 |
| ORM Kit | drizzle-kit | ^0.30.0 |
| Storage | @vercel/blob | ^0.27.0 |
| i18n | next-intl | ^3.26.0 |
| Icons | lucide-react | ^0.468.0 |
| Form | react-hook-form | ^7.54.0 |
| Toast | sonner | ^1.7.0 |
| UI Primitives | Radix UI (14 paket) | ^1.1.0–^1.2.0 |
| UI Helpers | clsx + tailwind-merge + cva | ^2.1.1 / ^2.5.0 / ^0.7.1 |
| TypeScript | typescript | ^5.7.0 |
| Tailwind CSS | tailwindcss | ^4.0.0 |
| Test Unit | vitest | ^2.1.0 |
| Test E2E | @playwright/test | ^1.49.0 |
| Lint | eslint + eslint-config-next | ^9.17.0 / ^15.1.0 |
| Format | prettier + prettier-plugin-tailwindcss | ^3.4.0 / ^0.6.0 |
| Package Manager | pnpm | 11.7.0 |
| DB Engine | Turso (libSQL via HTTP) | latest |
| **V2 Baru** | Recharts atau Tremor | latest stabil |

---

## 4. V2 Features Ringkas (8 Fitur Baru)

| # | Fitur | Prioritas | Lokasi |
|---|---|---|---|
| 1 | Image reference dipindah ke generate page (upload multi-file + 6-tipe role classification) | MUST | `/generate` |
| 2 | AI image classification (Vision LLM — GPT-4o/Gemini Vision) | MUST | `lib/ai/image-classifier.ts` + `/api/v1/upload/classify` |
| 3 | Field deskripsi cerita (opsional, max 500 char) | MUST | Generate form + `projects.story_description` |
| 4 | Real-time processing logs (SSE log event + Collapsible toggle) | SHOULD | SSE + `LogViewer` component |
| 5 | Dashboard enrichment (6-8 cards + charts + tables) | SHOULD | `/dashboard` + `dashboard.repo.ts` |
| 6 | Konsistensi UI (loading.tsx + error.tsx + design tokens) | SHOULD | Per page group |
| 7 | Navigation optimization (pagination + Suspense + prefetch) | SHOULD | Projects list + pages |
| 8 | Push ke GitHub | SHOULD | `git init` + `.gitignore` + push |

---

## 5. Instruksi Eksekusi (Fase A → B → C → D)

**Dependency Graph:**
```
Fase A (Core) -> Fase B (Intelligence) -> Fase D (Quality)
                     |
                     +-> Fase C (Dashboard) -> Fase D (Quality)
```

Fase A WAJIB selesai dulu. Fase B dan C bisa paralel. Fase D = final validation.

### Fase A: Core V2 (MUST — 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VA-01 | Git init + .gitignore | `git init`, `.gitignore` lengkap (node_modules, .env.local, .next, public/references, *.tsbuildinfo, drizzle/meta), README updated | Repo ter-push ke GitHub |
| VA-02 | Schema migration V2 | Tambah 3 kolom nullable di `schema.ts`: `projects.storyDescription` (TEXT), `assetReferences.aiClassification` (TEXT), `generationLogs.logsJson` (TEXT). `pnpm db:generate` + `pnpm db:push`. | Migration sukses, existing data intact |
| VA-03 | Upload di generate page | Pindahkan DropzoneUploader dari project detail ke generate form. Upload tanpa projectId (buat project saat submit). Backward compat: project detail tetap view refs read-only. | E2E upload di generate page jalan |
| VA-04 | Extended role classification | Update `GenerateReferenceSchema.type` ke 6 opsi: `tokoh, background, prop, accessory, environment, other`. Update DropzoneUploader select. Update upload route validation. Update prompt-builder injection. | 6 opsi tipe muncul di UI + validasi jalan |
| VA-05 | Field deskripsi cerita | Tambah `storyDescription: z.string().max(500).optional()` di `GenerateInputSchema`. Tambah Textarea di form (bawah judul, char counter). Inject ke `buildUserMessage()`. Simpan di `projects.storyDescription`. | E2E: isi deskripsi -> prompt lebih kontekstual |
| VA-06 | Push ke GitHub | Commit conventional + push ke `https://github.com/agrianwahab29/promptflow.git` | Repo accessible |

**Fase A DoD:**
- [ ] Git repo ter-push ke GitHub
- [ ] Schema migration V2 sukses (3 kolom nullable)
- [ ] Upload di generate page jalan (multi-file, 6-tipe)
- [ ] Field deskripsi cerita jalan
- [ ] `pnpm build` pass + `pnpm lint` 0 error + `pnpm typecheck` 0 error

### Fase B: Intelligence (SHOULD — 3-4 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VB-01 | AI image classifier | `lib/ai/image-classifier.ts` — `import 'server-only'`. Vision LLM HTTP call (direct, BUKAN AI SDK). Prompt classify. Parse JSON response. Zod validate `ClassificationResultSchema`. Update `asset_references.tipe` + `label` + `ai_classification`. Confidence threshold 0.7. Batch max 5. | Unit test classify round-trip |
| VB-02 | Classification endpoint | `POST /api/v1/upload/classify` — input `{assetReferenceId}`. Auto-trigger saat upload. Rate limit 30 req/min. | E2E: upload -> auto-classify -> result visible |
| VB-03 | Classification UI | `ClassificationResult` component: thumbnail + role badge + confidence bar + override dropdown. `AssetPreviewList`: grid thumb + filename + role badge. Fallback ke manual select jika Vision LLM gagal. | E2E: classify result visible, override jalan |
| VB-04 | Real-time logs | Extend SSE events: tambah event type `log` dengan `{level, message, timestamp}`. Backend: `log-buffer.ts` in-memory array. Drain ke SSE. Persist ke `generation_logs.logsJson` saat done. | E2E: log events muncul di SSE stream |
| VB-05 | LogViewer component | Collapsible panel (Radix UI) + Switch toggle. Default OFF. Log per stage + timestamp + level badge (info=blue, warn=yellow, error=red). Max 500 entries. Log lines escape HTML (SEC-C24). | E2E: toggle show/hide jalan |

**Fase B DoD:**
- [ ] AI image classification jalan (Vision LLM)
- [ ] Classification UI visible + manual override
- [ ] Real-time log events di SSE
- [ ] LogViewer Collapsible jalan

### Fase C: Dashboard & Polish (SHOULD — 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VC-01 | Dashboard queries | `dashboard.repo.ts` — queries: totalProjects, successfulGenerations, avgDuration, perProviderBreakdown, recentProjects(5), weeklyTrend, storageUsage. Refactor dari direct Drizzle ke repository pattern. | Dashboard data lengkap |
| VC-02 | Dashboard charts | Install Recharts. Line chart: projects per minggu. Bar chart: success vs fail ratio. | Charts render correctly |
| VC-03 | Dashboard UI | 6-8 MetricCard + WeeklyTrendChart + SuccessFailBarChart + PerProviderBreakdownTable + RecentActivityTable + StorageUsageCard. Load <= 1.5s. | E2E: dashboard load cepat |
| VC-04 | loading.tsx | Tambah per page group: `/generate`, `/projects`, `/projects/[id]`, `/dashboard`, `/settings`. Pakai `PageLoadingSkeleton` component. | Skeleton muncul saat loading |
| VC-05 | error.tsx | Tambah per page group: `PageErrorBoundary` — error message + retry button + link home. | Error boundary jalan |
| VC-06 | Design tokens | Primary violet `#7c3aed`, font Inter, spacing 4px base, radius 6px. Badge variants: success, secondary, destructive, info. Disabled states. Empty states. | Visual konsisten |

**Fase C DoD:**
- [ ] Dashboard enrichment: 6-8 cards + charts + tables
- [ ] Dashboard load <= 1.5s
- [ ] loading.tsx + error.tsx per page group
- [ ] Design tokens konsisten

### Fase D: Quality & Deploy (SHOULD — 2-3 hari)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| VD-01 | Pagination | Projects list: `?page=1&limit=20`. UI: `Pagination` component — page numbers + prev/next + first/last. Server-side. Max 100/page. | E2E: pagination jalan |
| VD-02 | Suspense boundaries | Tambah Suspense di projects list, dashboard, generate page | Streaming SSR jalan |
| VD-03 | SQA unit test | Jalankan semua test. Coverage >= 80%. Fix failing tests. | `pnpm test --coverage` >= 80% |
| VD-04 | SQA E2E test | Critical path: login -> set provider -> upload + classify -> generate -> save -> export | `pnpm test:e2e` green |
| VD-05 | Lint + typecheck | `pnpm lint` 0 error. `pnpm typecheck` 0 error. | CI gate pass |
| VD-06 | Performance test | Latency: Shorts <= 60s, Dashboard <= 1.5s, Page transition <= 200ms, AI classify <= 5s | Metrics sesuai target |
| VD-07 | Deploy Vercel | Deploy preview. Set env vars (12 keys total). E2E test di preview URL. | Preview URL jalan |

**Fase D DoD:**
- [ ] Pagination projects list jalan
- [ ] Coverage >= 80% unit/integration
- [ ] E2E critical path green
- [ ] Performance targets terpenuhi
- [ ] Deploy Vercel preview sukses

---

## 6. Aturan Kerja (WAJIB Patuh)

1. **Type-safe strict.** `tsconfig.json` `strict: true`. `no any` (L06). `unknown` + Zod narrow.
2. **Secure by default.** API key = AES-256-GCM at rest, mask `****` di response, decrypt server-only.
3. **Repository pattern.** DB akses lewat `lib/db/repositories/*.repo.ts`. Tidak ada query Drizzle langsung di route handler.
4. **Server Component default.** Client Component hanya bila butuh interaksi. `'use client'` minimal.
5. **Validation Zod di boundary.** Input -> Zod parse. LLM output -> Zod `PromptPackageSchema` parse.
6. **Direct HTTP + retry 2x backoff.** Kode pakai direct HTTP POST ke `/chat/completions` (BUKAN `generateObject`). Retry 2x + exponential backoff max 8000ms. Post-check `consistency-checker.ts` + Zod validate.
7. **Streaming SSE.** `POST /api/v1/generate` = `text/event-stream`. V2 tambah event type `log`.
8. **i18n key.** Teks UI via `useTranslations`/`getTranslations`. No hardcoded teks (L09). Dwibahasa ID + EN.
9. **a11y WCAG 2.1 AA.** Focus visible, keyboard nav, label, kontras.
10. **Test 80% coverage** unit/integration (Vitest). E2E critical path (Playwright). CI gate.
11. **Conventional commit.** `feat(scope): ...`, `fix(scope): ...`. Atomic commit.
12. **No direct push `main`.** Lewat PR + review. Branch `feat/<scope>`.
13. **No secret client-side.** API key, ENCRYPTION_KEY, NEXTAUTH_SECRET, VISION_LLM_API_KEY = server-only.
14. **No LLM call client-side.** `lib/ai/*` wajib `import 'server-only'`.
15. **Vision is separate concern.** Vision LLM call di `lib/ai/image-classifier.ts`. Direct HTTP + Zod parse. BUKAN AI SDK.
16. **Pagination as first-class.** List endpoint WAJIB support `?page=&limit=`. Response `{data[], pagination{}}`.
17. **Log buffer in-memory.** Real-time logs buffer di memory selama SSE. Persist ke `generation_logs.logsJson` saat done.
18. **Hormati 38 Larangan** CODING_RULES §13 (L01-L38) — baca sebelum coding.

---

## 7. Endpoint API (23 endpoint — 21 V1 + 2 V2 BARU)

| # | Method | Path | V1/V2 | Ringkasan |
|---|---|---|---|---|
| 1 | GET/POST | `/api/v1/auth/[...nextauth]` | V1 | NextAuth handler |
| 2 | GET | `/api/v1/auth/session` | V1 | Ambil session aktif |
| 3 | GET | `/api/v1/health` | V1 | Health check |
| 4 | GET | `/api/v1/projects` | V1+V2 | List paginate + `storyDescription` |
| 5 | POST | `/api/v1/projects` | V1+V2 | Create + `storyDescription` |
| 6 | GET | `/api/v1/projects/[id]` | V1 | Detail + ownership |
| 7 | PATCH | `/api/v1/projects/[id]` | V1 | Update metadata |
| 8 | DELETE | `/api/v1/projects/[id]` | V1 | Soft delete |
| 9 | POST | `/api/v1/generate` | V1+V2 | SSE + `log` event + `storyDescription` |
| 10 | GET | `/api/v1/settings/providers` | V1 | List provider (key mask) |
| 11 | POST | `/api/v1/settings/providers` | V1 | Save provider (encrypt) |
| 12 | PATCH | `/api/v1/settings/providers/[id]` | V1 | Update provider |
| 13 | DELETE | `/api/v1/settings/providers/[id]` | V1 | Hapus provider |
| 14 | POST | `/api/v1/settings/providers/[id]/test` | V1 | Test connection |
| 15 | POST | `/api/v1/upload` | V1+V2 | Multi-file + 6-tipe + auto-classify |
| 16 | **POST** | **`/api/v1/upload/classify`** | **V2 BARU** | **Trigger Vision LLM classification** |
| 17 | DELETE | `/api/v1/upload` | V1 | Hapus Blob + ref |
| 18 | GET | `/api/v1/projects/[id]/export` | V1 | Export JSON/markdown |
| 19 | GET | `/api/v1/projects/[id]/characters` | V1 | List karakter |
| 20 | GET | `/api/v1/projects/[id]/scenes` | V1 | List adegan |
| 21 | GET | `/api/v1/projects/[id]/image-prompts` | V1+V2 | List + 6-tipe filter |
| 22 | GET | `/api/v1/projects/[id]/logs` | V1+V2 | History + `logsJson` |
| 23 | **GET** | **`/api/v1/dashboard/stats`** | **V2 BARU** | **Enriched dashboard data** |

---

## 8. Schema DB (9 tabel + 3 kolom V2 nullable)

3 kolom baru V2 (additive, nullable, backward-compatible):

| Tabel | Kolom Baru | Tipe | Alasan |
|---|---|---|---|
| `projects` | `story_description` | TEXT nullable | Deskripsi cerita dari generate form |
| `asset_references` | `ai_classification` | TEXT nullable | JSON hasil Vision LLM classification |
| `generation_logs` | `logs_json` | TEXT nullable | JSON array real-time logs |

Migration: tambah kolom di `schema.ts` -> `pnpm db:generate` -> `pnpm db:push`.

---

## 9. Environment Variables (12 keys total)

| Env key | V1/V2 | Wajib | Deskripsi |
|---|---|---|---|
| `TURSO_DATABASE_URL` | V1 | YA | URL Turso DB |
| `TURSO_AUTH_TOKEN` | V1 | YA | Token auth Turso |
| `ENCRYPTION_KEY` | V1 | YA | Key AES-256-GCM (32 byte base64) |
| `NEXTAUTH_SECRET` | V1 | YA | Secret NextAuth JWT |
| `NEXTAUTH_URL` | V1 | YA (prod) | URL deploy |
| `BLOB_READ_WRITE_TOKEN` | V1 | YA | Token Vercel Blob |
| `USE_VERCEL_BLOB` | V1 | Opsional | Flag dev Blob vs FS |
| `NEXT_PUBLIC_APP_URL` | V1 | YA | URL publik client |
| `VISION_LLM_PROVIDER` | **V2** | YA | `'openai'` atau `'google'` |
| `VISION_LLM_API_KEY` | **V2** | YA | API key Vision LLM (server-only) |
| `VISION_LLM_MODEL` | **V2** | YA | Model ID Vision (mis. `gpt-4o`) |
| `VISION_LLM_BASE_URL` | **V2** | Opsional | Custom base URL Vision |

Guard wajib di init:
```ts
if (!process.env.ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY');
if (!process.env.TURSO_DATABASE_URL) throw new Error('Missing TURSO_DATABASE_URL');
if (!process.env.NEXTAUTH_SECRET) throw new Error('Missing NEXTAUTH_SECRET');
```

---

## 10. Verifikasi Per Task

| Command | Fungsi | Sukses bila |
|---|---|---|
| `pnpm lint` | ESLint | 0 error |
| `pnpm typecheck` | tsc --noEmit | 0 error |
| `pnpm test --coverage` | Vitest coverage | >= 80% |
| `pnpm test:e2e` | Playwright | critical path green |
| `pnpm build` | next build | sukses |
| `pnpm db:generate` | drizzle-kit generate | SQL terbuat |
| `pnpm db:push` | drizzle-kit push | kolom terbentuk |

---

## 11. Definition of Done Final

**Cross-fase DoD:**
- [ ] Semua 38 larangan CODING_RULES §13 (L01-L38) dipatuhi
- [ ] Tidak ada `any` (L06) tanpa `// eslint-disable` + alasan
- [ ] Tidak ada secret di client-side
- [ ] Tidak ada LLM call / decrypt di Client Component
- [ ] Conventional commit + PR review, no direct push `main`
- [ ] Semua 23 endpoint berfungsi
- [ ] Schema V2: 3 kolom nullable ter-migrate
- [ ] Coverage >= 80% unit/integration
- [ ] E2E critical path green
- [ ] Deploy Vercel preview sukses

---

## 12. Asumsi yang Berlaku

| ID | Asumsi | Status |
|---|---|---|
| V2-A1 | Vision LLM tersedia (GPT-4o/Gemini Vision) | Perlu konfirmasi provider |
| V2-A2 | Deskripsi cerita = optional, max 500 char | ASUMSI |
| V2-A3 | Real-time logs = Collapsible, default OFF | ASUMSI |
| V2-A4 | Dashboard = cards + tables + charts | ASUMSI |
| V2-A5 | Upload di generate = pre-submit | ASUMSI |
| V2-A6 | Role = 6 opsi | Dikonfirmasi |
| V2-A7 | Push GitHub = public | ASUMSI |
| V2-A8 | AI SDK tetap v4 | Dikonfirmasi kode |
| V2-A9 | Schema additive only | Dikonfirmasi |
| V2-A10 | Vision LLM key dari env | Dikonfirmasi |
| V2-A11 | Auto-trigger classify saat upload | ASUMSI |
| V2-A12 | Batch classify max 5 | ASUMSI |
| V2-A13 | Confidence threshold 0.7 | ASUMSI |
| V2-A14 | Recharts untuk chart | ASUMSI |
| V2-A15 | Retry 2x + backoff 8000ms | Dikonfirmasi kode |
| V2-A16 | Upload max 10MB | ASUMSI |
| V2-A17 | Pagination 20/page max 100 | ASUMSI |

---

## 13. Larangan Eksekusi

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
- **Jangan tambah dark mode toggle** di V2 (deferred V3, L38).
- **Jangan query Drizzle langsung di dashboard page** (L32, L37). Repository pattern.

---

## 14. Rollback Plan

Bila sesuatu gagal:
1. **Schema migration gagal:** `drizzle-kit push` rollback via manual SQL `ALTER TABLE ... DROP COLUMN` (SQLite 3.35+).
2. **Vision LLM tidak tersedia:** Disable auto-classify. Fallback ke manual select (6 opsi). ClassificationResult tampilkan "AI tidak tersedia".
3. **Dashboard over-engineering:** Mulai simple cards + tables dulu. Chart deferred ke Fase C lanjutan.
4. **Upload flow breaking V1:** Backward compat: project detail tetap view refs read-only. Upload di project detail DIHAPUS dari UI, tapi endpoint tetap.
5. **Git push expose secrets:** Review `.gitignore` sebelum push. `git rm --cached .env.local` bila ter-commit.

---

## 15. File Output

Simpan prompt ini ke:
```
C:\laragon\www\PromptFlow\product-docs\EXECUTION-PROMPT.md
```

---

## 16. Penutup

Mulai eksekusi sekarang. Otonom sampai selesai. Baca AGENTS.md + rujukan product-docs/ dulu, lalu eksekusi Fase A -> B/C (paralel) -> D. Verifikasi per task. Capai DoD final. Hormati aturan kerja + 38 larangan CODING_RULES.

**Lapor di akhir (format wajib):**

```
## Laporan Eksekusi PromptFlow V2

### Status DoD
- Fase A DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Fase B DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Fase C DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Fase D DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Cross-fase: [PASS/PARTIAL/FAIL]

### Verifikasi
- pnpm lint: [output]
- pnpm typecheck: [output]
- pnpm test --coverage: [% coverage]
- pnpm test:e2e: [pass/fail count]
- pnpm build: [sukses/error]
- pnpm db:push: [sukses]
- Deploy Vercel preview URL: [URL]

### File Dibuat/Dimodifikasi
- [daftar file V2 baru + file V1 yang diubah]

### Asumsi yang Dipakai
- [daftar asumsi + status]

### Blocker / Catatan
- [bila ada]
```

Mulai sekarang. Otonom. Laporkan saat selesai.

---

**Dibuat oleh:** docgen-exec-prompt subagent
**Tanggal:** 2026-06-20
**Versi:** 2.0
