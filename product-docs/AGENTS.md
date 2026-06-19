# AGENTS.md — Panduan Build PromptFlow

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Peran dokumen:** Panduan operasional tegas untuk LLM/agent eksekutor (Claude Code, Aider, Codex, dll) membangun deliverable PromptFlow end-to-end. Berdiri sendiri — baca dokumen ini + rujukan product-docs/ sebelum coding.
> **Status dokumen:** Build-ready. Paket dokumen = PASS WITH WARNINGS (REVIEW_REPORT.md). 0 CRITICAL open.

---

## Daftar Isi

1. Identitas Proyek
2. Sumber Kebenaran (WAJIB BACA)
3. Stack & Versi Final
4. Prinsip Kerja
5. Struktur Folder
6. Tahapan Build (Fase 1-3)
7. Endpoint API Ringkas
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
| Deskripsi 1 kalimat | Web app fullstack otomasi susun paket prompt animasi AI terstruktur (JSON + markdown) dari input minimal (judul + durasi + gaya), multi-provider LLM, konsistensi karakter lintas adegan. |
| Tipe | Web app fullstack (frontend + backend satu repo) |
| Repo GitHub | `https://github.com/agrianwahab29/promptflow.git` |
| Status kode | **Greenfield** — belum ada kode/schema/aset. Init dari nol. |
| Root proyek | `C:\laragon\www\PromptFlow` |
| Deploy target | Vercel (serverless) + Turso DB + Vercel Blob |
| Output deliverable | Teks prompt JSON terstruktur (`PromptPackageSchema`) + export markdown. **BUKAN** file media. |
| Stack ringkas | Next.js App Router + Vercel AI SDK v6 + `@ai-sdk/openai-compatible` + Turso/libSQL + Drizzle ORM + Tailwind v4 + shadcn/ui + Vercel Blob + NextAuth.js + Zod + next-intl + Vitest + Playwright + ESLint |

Sitasi: `PRD.md §1.2` ; `SRS.md §1.2, §2.1` ; `PROJECT_ARCHITECTURE.md §1.2` ; `RAG-CONTEXT.md §2.1`.

---

## 2. Sumber Kebenaran (WAJIB BACA)

BACA SEMUA dokumen ini sebelum tulis satu baris kode pun. Pakai fakta bersitasi. Tandai `ASUMSI` bila tidak ada bukti eksplisit di dokumen. Jangan halusinasi field/endpoint/rule yang tidak ada.

| # | Dokumen | Path absolut | Peran |
|---|---|---|---|
| 1 | RAG-CONTEXT | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` | Sumber kebenaran faktual asli (gap list G1-G12, sitasi eksternal) |
| 2 | BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | **Why** — nilai bisnis, KPI, stakeholder, batasan, OOS |
| 3 | MRD | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | **Who** — pasar, persona (Kreator Solo / Indie Studio / Edukator), positioning |
| 4 | PRD | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | **What** — FR-01..FR-19, MoSCoW §4, JSON schema §8.2, acceptance §7 |
| 5 | SRS | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | **How** — arsitektur §3, tech stack §4, spec fungsional §5, data model §6, interface §7, constraint §8, keamanan §9, tahapan §10, verifikasi §11, asumsi §12 |
| 6 | DATABASE_SCHEMA | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` | 9 entitas, Drizzle schema, migration plan, AES detail, env, soft delete |
| 7 | PROJECT_ARCHITECTURE | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | Folder §5, container/component C4, deployment, security boundary §9 |
| 8 | UIUX_SPEC | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | Design tokens (warna/tipografi/spacing/radius/motion), komponen UI, flows, wireframe, a11y |
| 9 | API_CONTRACT | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` | 21 endpoint, SSE protocol, PromptPackageSchema Zod, error envelope, rate limit |
| 10 | CODING_RULES | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | Standar per framework, git, lint, CI, **30 larangan §13** |
| 11 | TEST_PLAN | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` | 86 test case, coverage target, environment, CI gate |
| 12 | REVIEW_REPORT | `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` | Validasi lintas dokumen (PASS WITH WARNINGS) — catat WARN-001 & WARN-002 |

**Aturan baca:** tiap keputusan teknis WAJIB bisitasi (path + section). Klaim tanpa bukti = `ASUMSI` + konfirmasi user (lihat §16).

---

## 3. Stack & Versi Final

| Lapisan | Teknologi | Versi target | Sitasi |
|---|---|---|---|
| Frontend + Backend | Next.js (App Router) | stabil terkini per 2025 (15+/16+) | `SRS.md §4.1` |
| Runtime | Node.js | versi didukung Vercel stabil (Node 20+) | `SRS.md §4.1, §12 SRS-A20` |
| Styling | Tailwind CSS | **v4** (CSS-first) | `SRS.md §4.1` |
| Komponen UI | shadcn/ui | latest stabil | `SRS.md §4.1` |
| AI orchestration | Vercel AI SDK + `@ai-sdk/openai-compatible` | **AI SDK v6** (latest stabil) | `SRS.md §4.1, §4.2 #2` |
| Validasi | Zod | stabil terkini per 2025 | `SRS.md §4.1` |
| DB | Turso (libSQL, SQLite-compatible via HTTP) | latest stabil | `SRS.md §4.1, §8.2` |
| ORM | Drizzle ORM + `@libsql/client` + `drizzle-kit` | stabil terkini per 2025 | `SRS.md §4.1, §12 SRS-A3` (ASUMSI) |
| Storage gambar | Vercel Blob (`@vercel/blob`) | latest stabil | `SRS.md §4.1, §8.5` (ASUMSI SRS-A5) |
| Auth | NextAuth.js (Auth.js v5+) | stabil terkini per 2025 | `SRS.md §4.1, §12 SRS-A1` (ASUMSI credentials) |
| Enkripsi | Node `crypto` (AES-256-GCM) | native Node | `SRS.md §4.1, §12 SRS-A4` (ASUMSI) |
| i18n | next-intl | stabil terkini per 2025 | `SRS.md §4.1, §12 SRS-A2` (ASUMSI) |
| Deploy | Vercel | n/a | `SRS.md §4.1` |
| Test unit/integration | Vitest | stabil terkini per 2025 | `SRS.md §4.1, §11.1` |
| Test e2e | Playwright | stabil terkini per 2025 | `SRS.md §4.1, §11.1` |
| Lint | ESLint + `next lint` | stabil terkini per 2025 | `SRS.md §4.1, §11.1` |
| Format (opsional) | Prettier atau Biome (pilih satu, jangan campur) | stabil | `CODING_RULES.md §9.2-9.3` (ASUMSI CR-A11) |
| Package manager | **pnpm** (rekomendasi) | latest stabil | task spec ; `CODING_RULES.md §9` |

> **Catatan WARN-001:** SRS §1.2 baris ringkas stack kurang sebut Drizzle + next-intl eksplisit. Keduanya hadir di SRS §4.1 sebagai ASUMSI (SRS-A3, SRS-A2) dan konsisten lintas dokumen downstream. Pakai Drizzle + next-intl, jangan tukar Prisma/native-i18n tanpa konfirmasi user.

Lock versi di `package.json` saat init. Jangan upgrade mayor mid-fase tanpa review.

---

## 4. Prinsip Kerja

Aturan tegas, wajib patuh sepanjang build:

1. **Type-safe strict.** `tsconfig.json` `strict: true`. `no any` (L06, CODING_RULES §13). `unknown` + Zod narrow bila terpaksa.
2. **Secure by default.** API key user = AES-256-GCM at rest, mask `****` di response, decrypt server-only (`SRS.md §9.1 SEC-01/02/03`).
3. **Repository pattern.** DB akses lewat `lib/db/repositories/*.repo.ts`. Tidak ada query Drizzle langsung di route handler/component.
4. **Server Component default.** Client Component hanya bila butuh interaksi (form, streaming display). `'use client'` minimal.
5. **Validation Zod di boundary.** Input request → Zod parse sebelum proses. LLM structured output → Zod `PromptPackageSchema` parse.
6. **Structured output LLM.** `generateObject({ schema: PromptPackageSchema })` bila provider `supportsStructuredOutputs: true`. Fallback `streamText` + parse JSON + Zod validate.
7. **Streaming SSE.** `POST /api/generate` = `text/event-stream`. Token mulai mengalir < 10s (NFR-P3).
8. **i18n key.** Teks UI via `useTranslations`/`getTranslations` next-intl. No hardcoded teks (L09). Dwibahasa ID + EN.
9. **a11y WCAG 2.1 AA.** Focus visible, keyboard nav, label, kontras (UIUX_SPEC §9).
10. **Test 80% coverage** unit/integration (Vitest co-located). E2E critical path (Playwright). CI gate.
11. **Conventional commit.** `feat(scope): ...`, `fix(scope): ...`. Atomic commit (CODING_RULES §8).
12. **No direct push `main`.** Lewat PR + review. Branch `feat/<scope>`, `fix/<scope>`, `chore/<scope>` (L20).
13. **No secret client-side.** Env `NEXT_PUBLIC_*` hanya untuk nilai non-sensitif. API key LLM, ENCRYPTION_KEY, NEXTAUTH_SECRET = server-only.
14. **No LLM call client-side.** `lib/ai/*` wajib `import 'server-only'` (L24).
15. **Hormati 30 Larangan** CODING_RULES §13 (L01-L30) — baca sebelum coding.

Sitasi: `SRS.md §9.1` ; `CODING_RULES.md §1.3, §13` ; `PROJECT_ARCHITECTURE.md §1.3, §9`.

---

## 5. Struktur Folder

Struktur folder final sesuai `PROJECT_ARCHITECTURE.md §5`. Bikin persis.

```text
PromptFlow/
  product-docs/                      # dokumen (read-only rujukan)
  drizzle/                           # output migration SQL (drizzle-kit generate)
  messages/                          # i18n messages (next-intl)
    id.json
    en.json
  public/
    references/                      # dev-only upload FS (ASUMSI, tidak persisten Vercel)
  src/
    app/
      api/
        v1/                          # prefix v1 (ASUMSI API-A1, WARN-002)
          auth/[...nextauth]/route.ts
          health/route.ts
          projects/route.ts          # GET list, POST create
          projects/[id]/route.ts     # GET, PATCH, DELETE
          projects/[id]/export/route.ts
          projects/[id]/characters/route.ts
          projects/[id]/scenes/route.ts
          projects/[id]/image-prompts/route.ts
          projects/[id]/logs/route.ts
          generate/route.ts          # POST SSE
          settings/providers/route.ts
          settings/providers/[id]/route.ts
          settings/providers/[id]/test/route.ts
          upload/route.ts            # POST multipart, DELETE
      (dashboard)/
        layout.tsx
        generate/page.tsx
        projects/page.tsx
        projects/[id]/page.tsx
        settings/page.tsx
      (auth)/
        login/page.tsx
      layout.tsx                     # root + i18n provider
      page.tsx                        # redirect /generate atau /login
      globals.css                     # Tailwind v4 + design tokens UIUX_SPEC §2
    components/
      ui/                             # shadcn/ui copy-paste (jangan edit sembarangan)
      generate/                       # WizardStep, GenerateProgress, ResultTabs, SceneCard, CharacterCard, ImagePromptList
      projects/                       # list, detail
      settings/                       # ProviderConfigForm
      common/                         # header, footer, error boundary, LanguageToggle
    lib/
      ai/
        provider-registry.ts          # createOpenAICompatible (server-only)
        prompt-builder.ts             # assemble system prompt
        llm-client.ts                 # generateObject/streamObject + retry 3x
        response-parser.ts            # Zod validate, fallback JSON parse
        consistency-checker.ts        # FR-12 post-check
        prompts/
          scenes.system.ts
          voiceover.system.ts
          character.system.ts
          image-prompts.system.ts
          moral.system.ts
      db/
        client.ts                     # Drizzle + libSQL client
        schema.ts                     # single source Drizzle table definitions
        repositories/
          user.repo.ts
          provider-config.repo.ts
          project.repo.ts
          asset-reference.repo.ts
          character.repo.ts
          scene.repo.ts
          image-prompt.repo.ts
          generation-log.repo.ts
          supporting-character.repo.ts
      storage/blob.ts                 # Vercel Blob helper
      auth/
        config.ts                     # NextAuth providers, session, callbacks
        middleware.ts                 # protected routes
      crypto/aes.ts                   # AES-256-GCM encrypt/decrypt/mask (server-only)
      i18n/
        config.ts
        request.ts                    # locale resolver
      validation/schemas.ts           # Zod input + PromptPackageSchema
      export/markdown.template.ts     # JSON -> markdown transform
    middleware.ts                     # NextAuth + i18n + rate limit
  drizzle.config.ts
  next.config.ts
  tailwind.config.ts                  # atau CSS-first v4
  components.json                     # shadcn/ui config
  package.json
  tsconfig.json
  .env.local                          # dev (TIDAK commit)
  .env.example                        # dokumentasi env tanpa value asli
  .gitignore
  README.md
```

> **Catatan WARN-002 (penting):** API_CONTRACT §1.3 pakai prefix `/api/v1/*`. SRS §7.1 + PROJECT_ARCHITECTURE §5 contoh + CODING_RULES §3.1 contoh pakai `/api/*` tanpa v1. **PILIH SATU.** Rekomendasi reviewer: **pakai `/api/v1/*`** (paling eksplisit, cache-friendly, mudah migrate). Struktur folder di atas sudah pakai `app/api/v1/`. Konsisten seluruh route handler + middleware + API_CONTRACT.

Sitasi: `PROJECT_ARCHITECTURE.md §5` ; `API_CONTRACT.md §1.3, §5` ; `REVIEW_REPORT.md §10 WARN-002`.

---

## 6. Tahapan Build (Fase 1-3)

Urut dari `SRS.md §10`. Tiap fase = shipable increment. Selesaikan satu fase sebelum lanjut. Verifikasi per task sebelum DoD fase.

### Fase 1: Skeleton + DB + Auth + Provider + Generate Shorts + Export JSON (MUST core)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| F1-01 | Init Next.js + Tailwind + shadcn | `pnpm create next-app` App Router + TS + Tailwind v4. Init shadcn/ui (`pnpm dlx shadcn@latest init`). Install ESLint. | `pnpm dev` jalan. `pnpm lint` 0 error. |
| F1-02 | Setup Turso + Drizzle + schema 9 entitas + migration awal | Buat DB Turso, dapat `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. Install `@libsql/client` + `drizzle-orm` + `drizzle-kit`. Tulis `lib/db/client.ts` + `lib/db/schema.ts` (9 entitas §8 dokumen ini). `drizzle.config.ts`. Jalankan `drizzle-kit generate` + `push`. | `pnpm db:generate` + `pnpm db:push` sukses. Tabel terbentuk di Turso. |
| F1-03 | Setup NextAuth credentials | Install NextAuth v5+. `lib/auth/config.ts` credentials provider. `lib/auth/middleware.ts` protected routes. `users` tabel + bcryptjs hash (ASUMSI CR-A15). Env `NEXTAUTH_SECRET` + `NEXTAUTH_URL`. | Login flow e2e jalan. Protected route redirect `/login` bila unauth. |
| F1-04 | Provider factory + crypto | `lib/ai/provider-registry.ts` `createOpenAICompatible({name, apiKey, baseURL, headers})`. `lib/crypto/aes.ts` AES-256-GCM (`encrypt`/`decrypt`/`mask`). Env `ENCRYPTION_KEY` 32 byte base64. `provider_configs` tabel. | Unit test crypto encrypt→decrypt round-trip. Mask 4 char terakhir. |
| F1-05 | Zod schema + prompt templates | `lib/validation/schemas.ts`: `TitleSchema`, `DurationSchema`, `StyleSchema`, `AspectRatioSchema`, `GenerateInputSchema`, `ProviderConfigSchema`, **`PromptPackageSchema`** (§9 dokumen ini, copy exact). `lib/ai/prompts/*.system.ts` (scenes, voiceover, character, image-prompts, moral). | Unit test Zod parse valid/invalid. Schema match PRD §8.2. |
| F1-06 | Generate endpoint SSE (Shorts 30-60s) | `POST /api/v1/generate` SSE. `lib/ai/llm-client.ts` `generateObject`/`streamObject` + retry 3x backoff (SRS-A14). Post-check `consistency-checker.ts` (FR-12). SSE event protocol per API_CONTRACT §7. Stage: `character_profiles` → `scenes` → `image_prompts` → `moral` → `done`. | E2E generate Shorts sukses. SSE partial mengalir. Zod validate result. Token < 10s (NFR-P3). |
| F1-07 | UI generate (Shorts) + streaming display | `/generate` Client Component form (title, duration_type=shorts, style, aspect_ratio). `GenerateProgress` + `ResultTabs` (SceneCard, CharacterCard, ImagePromptList, moral). Copy-to-clipboard per item (NFR-U4). | E2E form submit → streaming render real-time. Copy button jalan. |
| F1-08 | Project CRUD | `GET/POST /api/v1/projects`, `GET/PATCH/DELETE /api/v1/projects/[id]`. Server Actions. Ownership check (`user_id`). Soft delete (`deleted_at`). Paginate list. | Integration test CRUD. Ownership 403 bila user lain. |
| F1-09 | Export JSON | `GET /api/v1/projects/[id]/export?format=json`. `Content-Disposition: attachment`. Body = `result_json` (PromptPackage). | E2E download `.json` valid. |
| F1-10 | Settings provider UI | `/settings` form provider + base URL pre-fill (Ollama `https://ollama.com/v1`, OpenRouter `https://openrouter.ai/api/v1`, 9router `http://localhost:20128/v1`, custom) + model input + API key password. Save encrypt. List mask `****`. Test connection `POST /api/v1/settings/providers/[id]/test`. | E2E save + mask + test connection OK. |
| F1-11 | Vitest + Playwright + CI setup | Vitest config + co-located test. Playwright config + critical path spec. GitHub Actions CI: `lint` + `typecheck` + `test` + `test:e2e` + `build`. Coverage gate 80% unit. | `pnpm test --coverage` >= 80%. CI green. |
| F1-12 | Deploy Vercel preview | Connect repo. Set env (§12). `pnpm build` sukses. Deploy preview. | Preview URL jalan. Login + generate Shorts + export JSON e2e OK. |

**Fase 1 DoD:** user login → set provider → generate paket Shorts valid `PromptPackageSchema` → save project → export JSON. Semua MUST FR-01..FR-16 jalan. Build pass, lint 0, typecheck pass, coverage >= 80%, e2e critical green, deploy preview sukses.

### Fase 2: Upload Referensi + Tutorial + Markdown + Dwibahasa (SHOULD)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| F2-01 | Vercel Blob setup | Install `@vercel/blob`. `lib/storage/blob.ts` (`put`, `del`, `head`). Env `BLOB_READ_WRITE_TOKEN`. Dev flag `USE_VERCEL_BLOB`. | Upload test file → URL publik. |
| F2-02 | Upload endpoint + UI + metadata | `POST /api/v1/upload` multipart (tipe tokoh/background, label, image `image/*` max 10MB ASUMSI CR-A17). `DELETE /api/v1/upload?name=`. Simpan `asset_references` (filename, blob_url, tipe, project_id). `DropzoneUploader` component. | E2E upload multipart. Metadata tersimpan. |
| F2-03 | Inject reference_filename ke prompt | Generate pipeline rujuk `reference_filename` di `image_prompts.characters[].reference_filename` & `backgrounds[].reference_filename`. System prompt inject "Character 'X' — reference image: hero.png. Maintain visual consistency." | E2E generate dengan referensi → field terisi. Tanpa referensi → null, fitur tetap jalan (FR-05). |
| F2-04 | Generate Tutorial mode | Support `duration_type=tutorial` (420-900s, 8-20 adegan SRS-A11). Adjust prompt template + `estimated_scenes`. Warning bila di luar range (boleh proceed). | E2E Tutorial generate 8-20 scenes. |
| F2-05 | Export Markdown | `GET /api/v1/projects/[id]/export?format=markdown`. `lib/export/markdown.template.ts` render PRD §8.3 struktur (judul+metadata, profil karakter, pendukung, adegan urut, image prompt master list, pesan moral). | E2E download `.md` terbaca lengkap. |
| F2-06 | i18n dwibahasa ID + EN | Install `next-intl`. `messages/id.json` + `messages/en.json`. `lib/i18n/config.ts` + `request.ts`. Toggle `LanguageToggle` di header, persist cookie. Semua teks UI pakai i18n key (L09). | E2E toggle ID/EN ubah label + pesan error. |

**Fase 2 DoD:** upload referensi jalan, Tutorial mode jalan, export markdown jalan, UI dwibahasa. Fase 1 DoD tetap hold.

### Fase 3: Polish UI + Konsistensi + History + Template (COULD + polish)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| F3-01 | Konsistensi post-check UI | Tampilkan warning mismatch karakter dari `consistency-checker.ts` (FR-12) di `ResultTabs` (Alert). | E2E mismatch → warning visible. |
| F3-02 | History generasi | `generation_logs` entitas + UI history per project (`GET /api/v1/projects/[id]/logs`). Compare/rollback (ASUMSI F-21 COULD). | E2E history list. |
| F3-03 | Template library judul | Library judul animasi populer (ASUMSI F-20 COULD). | UI library + pilih judul. |
| F3-04 | Polish UI/UX design tokens | Implement design tokens UIUX_SPEC §2 (warna `--primary #7c3aed`, font Inter + JetBrains Mono, spacing 4px base, radius 6px). Loading/error/empty state, micro-motion UIUX_SPEC §10. WCAG AA audit axe. | Visual match spec. axe 0 violation. |
| F3-05 | Telemetri KPI | Log `generation_logs` untuk KPI K1-K7 BRD §3.2. Dashboard sederhana (ASUMSI). | Log terisi. |
| F3-06 | Rate limit | Middleware rate limit `POST /api/v1/generate` 10 req/min/user (SRS-A15). Header `X-RateLimit-*`. 429 bila exceed. | Test 11th req → 429. |

**Fase 3 DoD:** konsistensi check visible, history jalan, template library jalan, UI polish match UIUX_SPEC, WCAG AA, telemetri KPI.

Sitasi: `SRS.md §10` ; `PROJECT_ARCHITECTURE.md §6` (data flow) ; `UIUX_SPEC.md §3` (komponen).

---

## 7. Endpoint API Ringkas

Total **21 endpoint** (`API_CONTRACT.md §5`). Prefix konsisten `/api/v1/*` (ASUMSI API-A1, WARN-002 — pilih ini, jangan `/api/*`).

| # | Method | Path | Auth | Ringkasan | FR/SRS |
|---|---|---|---|---|---|
| 1 | GET/POST | `/api/v1/auth/[...nextauth]` | Public | NextAuth handler (login/logout/session/callback) | FR-18 ; `SRS.md §7.1` |
| 2 | GET | `/api/v1/auth/session` | Session | Ambil session aktif | ASUMSI |
| 3 | GET | `/api/v1/health` | Public | Health check (app + DB) | ASUMSI |
| 4 | GET | `/api/v1/projects` | wajib | List project paginate per user | FR-15 |
| 5 | POST | `/api/v1/projects` | wajib | Create + simpan result generate | FR-15 |
| 6 | GET | `/api/v1/projects/[id]` | wajib | Detail + ownership check | FR-15 |
| 7 | PATCH | `/api/v1/projects/[id]` | wajib | Update metadata + re-generate | FR-15 |
| 8 | DELETE | `/api/v1/projects/[id]` | wajib | Soft delete (`deleted_at`) + cascade child | FR-15 |
| 9 | POST | `/api/v1/generate` | wajib | Streaming SSE → PromptPackage | FR-03..FR-12 ; `SRS.md §7.2` |
| 10 | GET | `/api/v1/settings/providers` | wajib | List provider per user (key mask) | FR-13, FR-14 |
| 11 | POST | `/api/v1/settings/providers` | wajib | Save provider (encrypt key) | FR-13, FR-14 |
| 12 | PATCH | `/api/v1/settings/providers/[id]` | wajib | Update provider | FR-13 |
| 13 | DELETE | `/api/v1/settings/providers/[id]` | wajib | Hapus provider | FR-13 |
| 14 | POST | `/api/v1/settings/providers/[id]/test` | wajib | Test reachability provider + model | ASUMSI |
| 15 | POST | `/api/v1/upload` | wajib | Multipart → Vercel Blob → AssetReference | FR-17 |
| 16 | DELETE | `/api/v1/upload` | wajib | Hapus Blob + AssetReference `?name=` | FR-17 |
| 17 | GET | `/api/v1/projects/[id]/export` | wajib | `?format=json\|markdown` download | FR-16 |
| 18 | GET | `/api/v1/projects/[id]/characters` | wajib | List karakter master per project | FR-07, FR-12 |
| 19 | GET | `/api/v1/projects/[id]/scenes` | wajib | List adegan berurut | FR-03, FR-09 |
| 20 | GET | `/api/v1/projects/[id]/image-prompts` | wajib | List image prompt master + varian | FR-06 |
| 21 | GET | `/api/v1/projects/[id]/logs` | wajib | History generate per project | `DATABASE_SCHEMA.md §4.8` ; KPI K5 |

**Konvensi:**
- JSON request/response `camelCase`. Kolom DB `snake_case` (mapping di repository).
- `PromptPackageSchema` field `snake_case-ish native` (`character_profiles`, `voiceover_script`, `deskripsi_latar`, `alas_kaki`, dll) — sesuai PRD §8.2.
- Error envelope: `{ "error": { "code": "...", "message": "...", "details": {} } }` (`API_CONTRACT.md §9`).
- Status: 200/201 (ok), 204 (delete), 400 (validation), 401 (auth), 403 (ownership), 404 (not found / soft deleted), 429 (rate limit), 500 (internal), 502/504 (provider timeout).
- SSE event: `partial` / `stage` / `done` / `error` (`API_CONTRACT.md §7`). Stage list: `character_profiles`, `scenes`, `image_prompts`, `moral`.

Sitasi: `API_CONTRACT.md §5, §7, §9` ; `SRS.md §7.1, §7.2`.

---

## 8. Schema DB Ringkas

9 entitas (`DATABASE_SCHEMA.md §4`). Single source = `src/lib/db/schema.ts` (Drizzle). Migration via `drizzle-kit generate` → `drizzle/` → `pnpm db:push`. SQLite-compatible (Turso/libSQL). Timestamp = integer unix epoch (ASUMSI CR-A9). PK `id` auto-increment.

| # | Tabel | PK | FK | Soft delete | Inti | Sitasi |
|---|---|---|---|---|---|---|
| 1 | `users` | `id` | — | — | Akun NextAuth. `email` unique, `password_hash` (bcrypt ASUMSI CR-A15), `role` default `'user'`. | `DATABASE_SCHEMA.md §4.1` |
| 2 | `provider_configs` | `id` | `user_id` → `users.id` (CASCADE) | — | Config LLM per user. `provider` enum (`ollama`/`openrouter`/`9router`/`custom`), `base_url`, `model`, `api_key_encrypted` (JSON `{iv, ciphertext, tag}` AES-256-GCM, nullable), `is_active` 0/1. Unique (`user_id`, `name`). | `DATABASE_SCHEMA.md §4.2` |
| 3 | `projects` | `id` | `user_id` → `users.id` (CASCADE) | `deleted_at` INTEGER nullable | Project prompt animasi. `title`, `duration_type` (shorts/tutorial), `duration_target_seconds`, `style_type` (3D/2D), `aspect_ratio`, `result_json` (snapshot PromptPackage TEXT), `status` (draft/generating/complete/failed). Index `idx_projects_user_created`. | `DATABASE_SCHEMA.md §4.3` |
| 4 | `asset_references` | `id` | `project_id` → `projects.id` (CASCADE) | — | Metadata upload. `tipe` (tokoh/background), `filename`, `blob_url`, `label`, `mime_type`, `size_bytes`. | `DATABASE_SCHEMA.md §4.4` |
| 5 | `characters` | `id` | `project_id` → `projects.id` (CASCADE) | — | Master karakter konsisten (FR-07). `nama`, `gayarambut`, `wajah_asal`, `pakaian_atas`, `pakaian_bawah`, `alas_kaki`, `deskripsi_latar`, `aksi`, `peran` (utama/lain/pendamping). Unique (`project_id`, `nama`). Max 10 per project (app-layer Zod, SRS-A10). | `DATABASE_SCHEMA.md §4.5` |
| 6 | `scenes` | `id` | `project_id` → `projects.id` (CASCADE) | — | Adegan urut. `order_no` (1..N), `description`, `voiceover_script`. | `DATABASE_SCHEMA.md §4.6` |
| 7 | `image_prompts` | `id` | `scene_id` (nullable) + `project_id` | — | `tipe` (tokoh/background), `target`, `prompt_text`, `reference_filename` nullable. `scene_id` null = master list root, terisi = varian per scene. | `DATABASE_SCHEMA.md §4.7` |
| 8 | `generation_logs` | `id` | `project_id` → `projects.id` | — | Telemetri. `provider`, `model`, `duration_ms`, `status` (success/fail/partial), `error_message`. KPI K5. | `DATABASE_SCHEMA.md §4.8` |
| 9 | `supporting_characters` | `id` | `project_id` + `scene_id` (nullable) | — | `nama`, `tipe` (pendukung/hewan), `aksi`. FR-08. | `DATABASE_SCHEMA.md §4.9` |

**Aturan wajib:**
- `lib/db/schema.ts` = single source truth. Jangan duplikasi schema di tempat lain.
- Migration: `pnpm db:generate` (generate SQL) → review `drizzle/*.sql` → `pnpm db:push` (apply). Jangan edit migration SQL manual kecuali fix.
- Urutan buat tabel (dependency): `users` → `provider_configs` → `projects` → `asset_references` → `characters` → `scenes` → `image_prompts` → `generation_logs` → `supporting_characters` (`DATABASE_SCHEMA.md §8.2`).
- API key: encrypt `lib/crypto/aes.ts` sebelum save `provider_configs.api_key_encrypted`. Decrypt server-only di `provider-registry.ts`. Response mask `****`.
- Ownership: semua query `projects`/`provider_configs`/child WAJIB filter `user_id = session.user.id` (L12).
- Validasi enum/batas tokoh/max upload di **app layer (Zod)**, BUKAN DB CHECK (SQLite CHECK terbatas).

Sitasi: `DATABASE_SCHEMA.md §4, §8, §11` ; `SRS.md §6` ; `CODING_RULES.md §4.6, §6.1 SEC-C12`.

---

## 9. PromptPackageSchema (Source of Truth LLM Output)

`PromptPackageSchema` = Zod schema untuk LLM structured output. WAJIB match PRD §8.2 + SRS §8.7 + API_CONTRACT §8.4. Pakai dengan `generateObject({ model, schema: PromptPackageSchema, system, messages })`. Fallback `streamText` + parse JSON + `PromptPackageSchema.parse()` bila provider tidak dukung structured output.

Copy schema ini ke `src/lib/validation/schemas.ts`:

```ts
import { z } from 'zod';

export const CharacterProfileSchema = z.object({
  nama: z.string(),
  gayarambut: z.string(),
  wajah_asal: z.string(),
  pakaian_atas: z.string(),
  pakaian_bawah: z.string(),
  alas_kaki: z.string(),
  deskripsi_latar: z.string(),
  aksi: z.string(),
  peran: z.enum(['utama', 'lain', 'pendamping']),
});

export const ImagePromptItemSchema = z.object({
  target: z.string(),
  prompt_text: z.string(),
  reference_filename: z.string().nullable(),
});

export const SceneImagePromptsSchema = z.object({
  characters: z.array(ImagePromptItemSchema),
  backgrounds: z.array(ImagePromptItemSchema),
});

export const SceneSchema = z.object({
  order: z.number(),
  description: z.string(),
  voiceover_script: z.string(),
  image_prompts: SceneImagePromptsSchema,
});

export const SupportingCharacterSchema = z.object({
  nama: z.string(),
  tipe: z.enum(['pendukung', 'hewan']),
  aksi: z.string(),
});

export const PromptPackageSchema = z.object({
  title: z.string(),
  duration_target: z.object({
    type: z.enum(['shorts', 'tutorial']),
    seconds: z.number(),
  }),
  style: z.object({
    type: z.enum(['3D', '2D']),
    aspect_ratio: z.string(),
  }),
  character_profiles: z.array(CharacterProfileSchema),
  scenes: z.array(SceneSchema),
  image_prompts: z.object({
    characters: z.array(ImagePromptItemSchema),
    backgrounds: z.array(ImagePromptItemSchema),
  }),
  supporting_characters: z.array(SupportingCharacterSchema),
  moral_message: z.string(),
});

export type PromptPackage = z.infer<typeof PromptPackageSchema>;
```

**Catatan field:**
- `character_profiles` = master konsisten (FR-07). Dirujuk lintas `scenes` via `nama`, BUKAN duplikasi deskripsi per scene.
- `image_prompts.characters[]` & `backgrounds[]` root = master list lengkap per tokoh/tempat (FR-06). `scenes[].image_prompts` = varian per adegan (aksi/latar beda).
- `reference_filename` = nama file upload (FR-17) atau `null` bila tanpa referensi.
- `peran` enum `utama`/`lain`/`pendamping`. `tipe` supporting `pendukung`/`hewan`.
- Infer type pakai `z.infer` (CODING_RULES §4.8). Jangan duplikasi interface TS manual.
- Konsistensi post-check (FR-12): identitas (nama, gayarambut, wajah_asal, pakaian_atas/bawah, alas_kaki) WAJIB stabil lintas `scenes`. `aksi` & `deskripsi_latar` BOLEH beda. Mismatch → warning (return `warnings[]` ke client, tidak block save).

Sitasi: `PRD.md §8.2` ; `SRS.md §8.7` ; `API_CONTRACT.md §8.4` ; `RAG-CONTEXT.md §11 #1`.

---

## 10. Keamanan Wajib

| ID | Requirement | Implementasi | Sitasi |
|---|---|---|---|
| SEC-01 | API key user dienkripsi saat simpan | AES-256-GCM `lib/crypto/aes.ts`, env `ENCRYPTION_KEY` 32 byte base64. `encrypt` → JSON `{iv, ciphertext, tag}`. | `SRS.md §9.1` ; ASUMSI SRS-A4 |
| SEC-02 | API key TIDAK expose ke client | Response mask `****` + 4 char terakhir. Helper `mask()` di `lib/crypto/aes.ts`. | `SRS.md §9.1` ; `BRD.md §6 R6` |
| SEC-03 | Provider call server-only | `lib/ai/*` + `lib/crypto/*` wajib `import 'server-only'`. TIDAK ada panggilan LLM dari Client Component (L24). | `SRS.md §9.1` ; `PROJECT_ARCHITECTURE.md §9 SB-01` |
| SEC-04 | 9router localhost hanya server-side | `http://localhost:20128/v1` tidak reachable dari client. Validasi: hanya user dev lokal pakai. Prod: user pakai Ollama cloud/OpenRouter/custom. | ASUMSI SRS-A7 ; `RAG-CONTEXT.md §5.2, §9 G4` |
| SEC-05 | CSRF protection | Next.js built-in CSRF Server Actions + Route Handlers. NextAuth CSRF token. | `SRS.md §9.1` |
| SEC-06 | Input sanitization (XSS) | Zod validasi + escape HTML (`<>"'&`) pada `title` & field teks sebelum render/prompt. | `SRS.md §9.1` ; NFR-S3 |
| SEC-07 | Ownership check RBAC dasar | Middleware + server check `project.user_id === session.user.id`. User hanya akses resource miliknya (L12). | `SRS.md §9.1` ; `API_CONTRACT.md §2.3` |
| SEC-08 | Env secret management | `ENCRYPTION_KEY`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `NEXTAUTH_SECRET` di Vercel env. `.env.example` tanpa value asli. Guard `if (!env) throw` di init (L17). | `SRS.md §9.1` ; `DATABASE_SCHEMA.md §11.4` |
| SEC-09 | HTTPS only | Vercel default HTTPS. | `SRS.md §9.1` NFR-S5 |
| SEC-10 | Rate limit endpoint generate | ASUMSI 10 req/min/user (SRS-A15). Middleware. Header `X-RateLimit-Limit/Remaining/Reset`. 429 bila exceed. | `SRS.md §9.1` NFR-S4 ; `API_CONTRACT.md §10` |
| SEC-11 | Auth protected routes | `lib/auth/middleware.ts`. Protected: `/projects`, `/settings`, `/generate`, `/api/v1/*` (kecuali `/api/v1/auth/*` dan `/api/v1/health`). | `SRS.md §9.1` ; `API_CONTRACT.md §2.2` |
| SEC-12 | NextAuth secret | `NEXTAUTH_SECRET` env wajib. | `SRS.md §9.1` |
| SEC-13 | No secret client-side | Env `NEXT_PUBLIC_*` hanya nilai non-sensitif. API key LLM/ENCRYPTION_KEY/NEXTAUTH_SECRET = server-only. | CODING_RULES §6.1 |
| SEC-14 | Password hash | bcryptjs (ASUMSI CR-A15) untuk `users.password_hash`. Bisa argon2 bila user prefer. | `DATABASE_SCHEMA.md §9.3` |

**Larangan kunci** (CODING_RULES §13): L06 no any, L07 no hardcoded secret, L12 no query tanpa `user_id`, L14 no string concat SQL, L15 no `dangerouslySetInnerHTML` tanpa sanitasi, L16 no eval, L17 no `process.env.X!` tanpa guard, L24 no LLM call client, L25 no decrypt client.

Sitasi: `SRS.md §9` ; `PROJECT_ARCHITECTURE.md §9` ; `CODING_RULES.md §6, §13`.

---

## 11. Testing Wajib

| Level | Tool | Scope | Target | Sitasi |
|---|---|---|---|---|
| Unit | Vitest (co-located `*.test.ts`/`*.test.tsx`) | `lib/ai/*`, `lib/db/repositories/*`, `lib/crypto/*`, `lib/validation/*`, `lib/storage/*`, `lib/export/*` | **>= 80% coverage** (ASUMSI CR-A10) | `SRS.md §11.1` ; `TEST_PLAN.md` |
| Integration | Vitest + Turso test DB | API route handlers + Server Actions + repository query | >= 70% | `SRS.md §11.1` |
| E2E | Playwright | Critical path: login → set provider → generate Shorts → save → export JSON; upload → generate Tutorial → export markdown; toggle i18n | 100% critical path | `SRS.md §11.1` ; `TEST_PLAN.md` |
| Lint | ESLint (`next lint`) + tsc | `src/**` | 0 error, 0 warning strict | `SRS.md §11.1` ; `CODING_RULES.md §9.1` |
| Type check | `tsc --noEmit` | Type safety | 0 error | `SRS.md §11.1` |
| Build | `next build` | Production build | Sukses tanpa error | `SRS.md §11.1` |
| a11y | axe (Playwright) | WCAG 2.1 AA | 0 violation | `UIUX_SPEC.md §9` |

**Aturan test (CODING_RULES §7):**
- Co-located: `src/lib/crypto/aes.test.ts` di sebelah `aes.ts`.
- Mock LLM di integration (jangan panggil provider real di CI).
- Turso test DB terpisah dari dev/prod.
- No `it.skip` tanpa alasan + issue link (L21). No snapshot komponen UI (L22), snapshot hanya output stabil (markdown).
- CI gate: PR tidak merge bila `lint`/`typecheck`/`test`/`e2e`/`build` fail.

**Test case mapping** (TEST_PLAN.md, 86 case) → AC PRD §7. Bikin test per AC: AC-01 judul, AC-02 durasi, AC-03/09 adegan urut, AC-04 voiceover, AC-05 auto karakter, AC-06 image prompt list, AC-07 tokoh terstruktur, AC-08 pendukung, AC-10 gaya+rasio, AC-11 moral, AC-12 konsistensi, AC-13 provider, AC-14 enkripsi, AC-15 CRUD, AC-16 export, AC-17 upload, AC-18 login, AC-19 dwibahasa, NFR-P1/P2/P3 latency, NFR-S1/S2, NFR-A1.

Sitasi: `SRS.md §11` ; `TEST_PLAN.md` ; `CODING_RULES.md §7`.

---

## 12. Environment Variables

Buat `.env.example` (dokumentasi, tanpa value asli) + `.env.local` (dev, TIDAK commit) + set di Vercel project settings (prod/preview).

| Env key | Wajib | Deskripsi | Sitasi |
|---|---|---|---|
| `TURSO_DATABASE_URL` | YA | URL Turso DB (`libsql://...`) | `DATABASE_SCHEMA.md §11.4` ; `SRS.md §8.2` |
| `TURSO_AUTH_TOKEN` | YA | Token auth Turso | `DATABASE_SCHEMA.md §11.4` |
| `ENCRYPTION_KEY` | YA | Key AES-256-GCM, 32 byte base64 (`Buffer.alloc(32).toString('base64')`). Guard di init. | `DATABASE_SCHEMA.md §11.4` ; ASUMSI TD8 `SRS.md §2.3` |
| `NEXTAUTH_SECRET` | YA | Secret NextAuth JWT | `SRS.md §9.1 SEC-12` |
| `NEXTAUTH_URL` | YA (prod) | URL deploy (`https://promptflow.vercel.app`) | `SRS.md §9.1` |
| `BLOB_READ_WRITE_TOKEN` | Fase 2 | Token Vercel Blob (upload gambar) | `DATABASE_SCHEMA.md §11.4` ; ASUMSI SRS-A5 |
| `USE_VERCEL_BLOB` | Opsional | Flag dev (`true`/`false`). `false` → upload ke `public/references/`. | ASUMSI SRS-A17 |
| `NEXT_PUBLIC_APP_URL` | YA | URL publik untuk client (non-sensitif) | `CODING_RULES.md §2.1` |
| `OPENROUTER_API_KEY` | Opsional (dev seed) | Contoh API key OpenRouter untuk dev lokal. **TIDAK wajib di prod** (user input sendiri via UI, encrypt di DB). | `BRD.md §8.3 D2` |
| `OLLAMA_API_KEY` | Opsional (dev seed) | Contoh API key Ollama cloud untuk dev lokal. | `BRD.md §8.3 D1` |

> API key LLM user = input via UI settings, **disimpan terenkripsi di `provider_configs.api_key_encrypted`**, BUKAN env. Env di atas hanya untuk dev seed bila perlu.

**Guard wajib** (CODING_RULES §6.1 SEC-C06):
```ts
if (!process.env.ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY');
if (!process.env.TURSO_DATABASE_URL) throw new Error('Missing TURSO_DATABASE_URL');
if (!process.env.NEXTAUTH_SECRET) throw new Error('Missing NEXTAUTH_SECRET');
```

Sitasi: `DATABASE_SCHEMA.md §11.4` ; `SRS.md §8.2, §8.4, §8.5, §9.1` ; `CODING_RULES.md §6.1`.

---

## 13. Command Build

Package manager: **pnpm** (rekomendasi). Sesuaikan `package.json` scripts.

```bash
# Setup
pnpm install
pnpm dlx shadcn@latest init        # init shadcn/ui
pnpm dlx shadcn@latest add <comp>  # add komponen

# Dev
pnpm dev                           # next dev

# Build & run prod
pnpm build                         # next build
pnpm start                         # next start

# Test
pnpm test                          # vitest run
pnpm test:watch                    # vitest watch
pnpm test --coverage               # vitest coverage (gate 80%)
pnpm test:e2e                      # playwright test

# Quality
pnpm lint                          # next lint (0 error 0 warning)
pnpm typecheck                     # tsc --noEmit
pnpm format                        # prettier/biome (opsional, pilih satu)

# DB (Drizzle)
pnpm db:generate                   # drizzle-kit generate (SQL migration)
pnpm db:push                       # drizzle-kit push (apply ke Turso)
pnpm db:migrate                    # drizzle-kit migrate (production)
pnpm db:studio                     # drizzle-kit studio (GUI inspect)

# Deploy
pnpm deploy                        # vercel deploy (atau git push + Vercel auto-deploy)
```

CI (GitHub Actions) jalankan per PR: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test --coverage` → `pnpm test:e2e` → `pnpm build`. Block merge bila ada fail.

Sitasi: `SRS.md §11.4` ; `CODING_RULES.md §9, §11` ; `DATABASE_SCHEMA.md §8.4`.

---

## 14. Catatan Reviewer

Paket dokumen = **PASS WITH WARNINGS** (`REVIEW_REPORT.md`). 0 CRITICAL open, 2 WARNING, 1 INFO. Tidak blok build. Catat saat coding:

### WARN-001 — Stack ringkas SRS §1.2 kurang Drizzle + next-intl

- **Lokasi:** `SRS.md §1.2` baris ringkas stack.
- **Masalah:** Baris ringkas hanya sebut "Next.js + AI SDK v6 + Turso + Tailwind v4 + shadcn/ui + Vercel Blob + NextAuth + Zod", TIDAK sebut Drizzle ORM + next-intl eksplisit di baris itu. Keduanya ada di SRS §4.1 sebagai ASUMSI (SRS-A3, SRS-A2) + konsisten lintas dokumen downstream.
- **Aksi agent:** Pakai **Drizzle ORM** + **next-intl** (sesuai SRS §4.1 + DATABASE_SCHEMA + PROJECT_ARCHITECTURE + CODING_RULES + UIUX_SPEC). Jangan tukar Prisma/native-i18n tanpa konfirmasi user. Lock versi di `package.json` saat init.

### WARN-002 — Inkonsistensi prefix versioning API `/api/*` vs `/api/v1/*`

- **Lokasi:** `API_CONTRACT.md §1.3` pakai `/api/v1/*`. `SRS.md §7.1` + `PROJECT_ARCHITECTURE.md §5` contoh + `CODING_RULES.md §3.1` contoh pakai `/api/*` tanpa v1.
- **Masalah:** Kontrak API dokumen `/api/v1/*`, tapi contoh route folder di 3 dokumen lain pakai `/api/*`. Implementasi harus pilih satu.
- **Aksi agent:** **PILIH `/api/v1/*`** (rekomendasi reviewer — paling eksplisit, cache-friendly, mudah migrate). Struktur folder `src/app/api/v1/projects/route.ts` dst. Middleware proteksi `/api/v1/*` (kecuali `/api/v1/auth/*` + `/api/v1/health`). Konsisten di seluruh route handler + API_CONTRACT + test. Jangan campur.

### INFO-001 — BRD stack ringkas tidak sebut komponen teknis detail

- Scope BRD = nilai bisnis, bukan tech detail. Detail teknis di SRS §4.1. Tidak perlu aksi.

Sitasi: `REVIEW_REPORT.md §8, §10, §11`.

---

## 15. Definition of Done

**Fase 1 DoD (WAJIB semua):**
- [ ] Semua task F1-01..F1-12 selesai.
- [ ] `pnpm build` pass tanpa error.
- [ ] `pnpm lint` 0 error 0 warning.
- [ ] `pnpm typecheck` 0 error.
- [ ] `pnpm test --coverage` >= 80% unit/integration.
- [ ] `pnpm test:e2e` critical path green (login → set provider → generate Shorts → save → export JSON).
- [ ] Deploy Vercel preview sukses + URL jalan.
- [ ] Env vars lengkap di Vercel (TURSO_*, ENCRYPTION_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL).
- [ ] Schema DB 9 entitas ter-migrate ke Turso (`pnpm db:push` sukses).
- [ ] NextAuth login jalan. Protected routes redirect `/login` bila unauth.
- [ ] Provider test connection OK (`POST /api/v1/settings/providers/[id]/test`).
- [ ] Generate SSE hasil valid `PromptPackageSchema` (Zod parse pass).
- [ ] Export JSON download `.json` valid.
- [ ] API key user terenkripsi di DB + mask `****` di response.

**Fase 2 DoD:** Fase 1 DoD tetap hold + upload referensi jalan (multipart → Blob → AssetReference, `reference_filename` terisi), Tutorial mode jalan (8-20 adegan), export markdown jalan (PRD §8.3 struktur), i18n toggle ID/EN jalan (label + pesan error).

**Fase 3 DoD:** Fase 2 DoD tetap hold + konsistensi check UI visible (warning mismatch FR-12), history `generation_logs` jalan, template library judul jalan, UI polish match UIUX_SPEC §2 design tokens (`--primary #7c3aed`, Inter + JetBrains Mono, spacing 4px, radius 6px), WCAG 2.1 AA (axe 0 violation), telemetri KPI log, rate limit 10 req/min/user jalan.

**Cross-fase:**
- [ ] Semua 30 larangan CODING_RULES §13 (L01-L30) dipatuhi.
- [ ] Tidak ada `any` (L06) tanpa `// eslint-disable` + alasan.
- [ ] Tidak ada secret di client-side.
- [ ] Tidak ada LLM call / decrypt di Client Component (L24, L25).
- [ ] Server Component default, Client Component minimal.
- [ ] Conventional commit + PR review, no direct push `main` (L20).
- [ ] Repo GitHub `https://github.com/agrianwahab29/promptflow.git` ter-push.

Sitasi: `SRS.md §11.3` ; `PRD.md §7` (AC) ; `REVIEW_REPORT.md`.

---

## 16. Asumsi yang Harus Dikonfirmasi User

Daftar asumsi lintas dokumen yang **TIDAK ADA BUKTI eksplisit** di RAG-CONTEXT. Konfirmasi user bila ragu sebelum locking implementasi. Jangan halusinasi detail yang tidak ada bukti.

| ID | Asumsi | Status bukti | Dampak bila salah | Konfirmasi |
|---|---|---|---|---|
| SRS-A1 / CR-A4 | Auth = NextAuth **credentials** provider (email+password) | TIDAK ADA BUKTI preferensi (`RAG-CONTEXT.md §9 G2`) | Bila user prefer OAuth (Google/GitHub) → provider config beda | Confirm: credentials cukup fase awal? |
| SRS-A2 / CR-A5 | i18n = **next-intl** | TIDAK ADA BUKTI preferensi lib (`RAG-CONTEXT.md §9 G5`) | Bisa native App Router i18n | Confirm: next-intl OK? |
| SRS-A3 / CR-A1 | ORM = **Drizzle** (bukan Prisma/raw libsql) | TIDAK ADA BUKTI (`RAG-CONTEXT.md §9 G7`) | Prisma/raw libsql arsitektur beda | Confirm: Drizzle OK? |
| SRS-A4 / CR-A2 | Enkripsi = **AES-256-GCM via env `ENCRYPTION_KEY`** | TIDAK ADA BUKTI mekanisme (`RAG-CONTEXT.md §11 #4`) | Bisa secret manager (Vercel/KMS) | Confirm: env key OK, atau secret manager? |
| SRS-A5 / CR-A3 | Storage gambar prod = **Vercel Blob** | ASUMSI rekomendasi (`RAG-CONTEXT.md §6, §9 G3`) | Bisa S3/R2 alternatif | Confirm: Vercel Blob OK? |
| SRS-A7 / CR-A? | 9router `http://localhost:20128/v1` valid lokal, Bearer/none auth | TIDAK ADA BUKTI eksternal (`RAG-CONTEXT.md §5.2, §9 G4`) | Bila 9router tidak valid → hapus dari enum provider | Confirm: 9router masih dipakai? Auth header? |
| SRS-A8 | Default model LLM per provider = user input (no hardcode) | TIDAK ADA BUKTI (`RAG-CONTEXT.md §9 G8`) | Bila user mau default model list → add hint UI | Confirm: user input model saja, atau hint list? |
| SRS-A10 | Batas tokoh default **10 per project** | TIDAK ADA BUKTI (`BRD.md §7.1 A3`) | Bila beda → Zod schema + UI hint beda | Confirm: 10 OK? |
| SRS-A11 | Jumlah adegan: **shorts 3-6, tutorial 8-20** | ASUMSI (`PRD.md §10.2 P-A12`) | Bila beda → prompt template beda | Confirm: range OK? |
| SRS-A12 | Latency target: **Shorts <= 60s, Tutorial <= 180s** end-to-end streaming | ASUMSI (`PRD.md §10.2 P-A11`) | Bila beda → NFR-P1/P2 beda | Confirm: target OK? |
| SRS-A13 | Auto-fallback provider = **manual switch** (bukan otomatis) fase awal | ASUMSI (`PRD.md §10.2 P-A13`) | Bila user mau auto-fallback → logic beda | Confirm: manual switch OK? |
| SRS-A14 / CR-A7 | Retry LLM **3x backoff** | ASUMSI (`PRD.md §6.4 NFR-R3`) | Bila beda → `llm-client.ts` beda | Confirm: 3x backoff OK? |
| SRS-A15 / CR-A8 | Rate limit generate **10 req/min/user** | ASUMSI (`PRD.md §6.2 NFR-S4`) | Bila beda → middleware beda | Confirm: 10 req/min OK? |
| SRS-A16 | **Soft delete** project (`deleted_at`) | ASUMSI (best practice) | Bila hard delete → API_CONTRACT 204 beda | Confirm: soft delete OK? |
| SRS-A17 | Dev lokal upload FS `public/references/`, prod Vercel Blob | ASUMSI (`RAG-CONTEXT.md §6`) | Bila prod juga FS → tidak persisten Vercel | Confirm: Blob prod OK? |
| SRS-A19 | Vercel function timeout: Hobby 10s, Pro 60s/300s | ASUMSI plan-specific | Bila plan beda → pecah generate per komponen | Confirm: plan Vercel? |
| CR-A15 | Password hash = **bcryptjs** | ASUMSI (bisa argon2) | Bila argon2 → dep beda | Confirm: bcrypt OK? |
| CR-A16 | Session strategy = **JWT cookie** | ASUMSI (bisa Turso adapter DB session) | Bila DB session → tabel session tambahan | Confirm: JWT OK? |
| CR-A17 | File upload max **10MB** | ASUMSI | Bila beda → Zod + Blob config beda | Confirm: 10MB OK? |
| API-A1 | Prefix API = **`/api/v1/*`** | ASUMSI (`API_CONTRACT.md §1.3`) | Bila `/api/*` murni → update API_CONTRACT + struktur folder | Confirm: `/api/v1/*` OK? |
| NFR-I2 | Konten generate LLM bahasa ikut judul | ASUMSI | Bila user mau toggle bahasa output → prompt beda | Confirm: ikut judul OK? |
| UX-A1 | Brand accent = violet `#7c3aed` | ASUMSI greenfield (`RAG-CONTEXT.md §8`) | Bisa diubah user | Confirm: `#7c3aed` OK? |
| UX-A2 | Font = Inter + JetBrains Mono | ASUMSI (RAG sebut Inter/Geist) | Bisa Geist | Confirm: Inter OK, atau Geist? |

**Aturan:** bila user konfirmasi berbeda dari asumsi, update dokumen terkait (SRS/PRD/UIUX_SPEC/API_CONTRACT) + catat di commit + sesuaikan implementasi. Jangan ubah scope tanpa konfirmasi (lihat Larangan bawah).

Sitasi: `SRS.md §12` ; `PRD.md §10.2` ; `CODING_RULES.md §14` ; `REVIEW_REPORT.md §5` ; `RAG-CONTEXT.md §9`.

---

## Larangan Eksekusi

- **Jangan ubah scope** tanpa konfirmasi user. Out of scope PRD §9 + SRS §2.2 (OOS-T1..T10) tetap out.
- **Jangan skip aset wajib** (schema DB, NextAuth, provider config, generate SSE, export, i18n, test).
- **Jangan langgar CODING_RULES §13** (L01-L30). Baca sebelum coding.
- **Jangan halusinasi** field/endpoint/rule. Pakai fakta bersitasi, tandai ASUMSI bila tidak ada bukti.
- **Jangan tukar stack** (Drizzle → Prisma, next-intl → native, Vercel Blob → S3) tanpa konfirmasi user.
- **Jangan push `main` langsung** (L20). Lewat PR + review.
- **Jangan commit secret** ke repo. `.env.local` di `.gitignore`.
- **Jangan skip test**. CI gate wajib.

---

> **Dokumen ini = panduan kerja tegas. Eksekutor cukup baca AGENTS.md + rujukan product-docs/ untuk membangun PromptFlow end-to-end. Mulai Fase 1, verifikasi per task, cap DoD, lanjut Fase 2, Fase 3. Bila ragu pada asumsi, konfirmasi user.**

**Dibuat oleh:** docgen-agentsmd subagent
**Tanggal:** 2026-06-19
**Versi:** 1.0
