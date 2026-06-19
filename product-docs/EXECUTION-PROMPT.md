# EXECUTION PROMPT - PromptFlow

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Tipe:** Prompt eksekusi final siap-tempel untuk agent eksekutor (Claude Code / Aider / Codex / OpenCode / dll).
> **Target:** Bangun web app fullstack PromptFlow end-to-end sampai deploy Vercel + Turso, Fase 1 → 2 → 3, capai Definition of Done.

---

## 1. Identitas & Tujuan

Kamu adalah agent eksekutor otonom. Tugas tunggal: **bangun PromptFlow** — web app fullstack Next.js App Router yang mengotomasi susunan paket prompt animasi AI terstruktur (JSON + markdown) dari input minimal (judul + durasi + gaya + opsi referensi), multi-provider LLM, dengan konsistensi karakter lintas adegan.

- **Root proyek:** `C:\laragon\www\PromptFlow`
- **Repo GitHub:** `https://github.com/agrianwahab29/promptflow.git`
- **Status kode:** Greenfield — belum ada kode/schema/aset. Init dari nol.
- **Deploy target:** Vercel (serverless) + Turso DB + Vercel Blob.
- **Output deliverable:** Teks prompt JSON terstruktur (`PromptPackageSchema`) + export markdown. **BUKAN** file media.
- **Bahasa instruksi:** Bahasa Indonesia. Identifier teknis apa adanya (camelCase JS, snake_case DB, snake_case-ish PromptPackage field).

Eksekusi penuh otonom dari Fase 1 → 2 → 3 sampai DoD final tercapai. Tidak nanya user kecuali asumsi kritis (§9) ragu. Laporkan di akhir.

---

## 2. Sumber Kebenaran (WAJIB BACA SEBELUM CODING)

**Aturan mutlak:** BACA SEMUA dokumen di `C:\laragon\www\PromptFlow\product-docs\` sebelum tulis satu baris kode pun. Mulai dari `AGENTS.md` (panduan utama ringkas tegas), lalu rujukan lain. Pakai fakta bersitasi (path + section). Klaim tanpa bukti = tandai `ASUMSI` + konfirmasi user (§9). Jangan halusinasi field/endpoint/rule yang tidak ada di dokumen.

| # | Dokumen | Path absolut | Peran |
|---|---|---|---|
| 0 | AGENTS.md | `C:\laragon\www\PromptFlow\product-docs\AGENTS.md` | **Panduan utama** — baca pertama. 16 section ringkas tegas. Stack, prinsip, struktur folder, tahapan Fase 1-3, schema DB ringkas, PromptPackageSchema, keamanan, testing, env, command, reviewer notes, DoD, asumsi. |
| 1 | RAG-CONTEXT.md | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` | Sumber kebenaran faktual asli (gap list G1-G12, sitasi eksternal). |
| 2 | BRD.md | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | Why — nilai bisnis, KPI K1-K7, stakeholder, batasan, OOS. |
| 3 | MRD.md | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | Who — pasar, persona (Kreator Solo / Indie Studio / Edukator), positioning. |
| 4 | PRD.md | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | What — FR-01..FR-19, MoSCoW §4, JSON schema §8.2, acceptance §7. |
| 5 | SRS.md | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | How — arsitektur §3, tech stack §4, spec fungsional §5, data model §6, interface §7, constraint §8, keamanan §9, tahapan §10, verifikasi §11, asumsi §12. |
| 6 | DATABASE_SCHEMA.md | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` | 9 entitas + Drizzle schema §8.3 (copy exact), migration plan §8, AES §11, env §11.4, soft delete §10. |
| 7 | PROJECT_ARCHITECTURE.md | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | Folder §5 (bikin persis), C4 diagram, data flow §6, external §7, deployment §8, security boundary §9. |
| 8 | UIUX_SPEC.md | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | Design tokens §2 (warna `--primary #7c3aed`, Inter + JetBrains Mono, spacing 4px, radius 6px), komponen §3, flows §6, wireframe §7, a11y §9 WCAG AA. |
| 9 | API_CONTRACT.md | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` | 21 endpoint §5, SSE protocol §7, PromptPackageSchema Zod §8.4, error envelope §9, rate limit §10. |
| 10 | CODING_RULES.md | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | Standar per framework, git, lint, CI, **30 larangan §13 (L01-L30)** — baca sebelum coding. |
| 11 | TEST_PLAN.md | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` | 86 test case, coverage target 80%, environment, CI gate. |
| 12 | REVIEW_REPORT.md | `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` | Validasi lintas dokumen (PASS WITH WARNINGS) — catat WARN-001 & WARN-002. |

**Catatan reviewer (WAJIB ikut):**
- **WARN-001:** SRS §1.2 baris ringkas stack kurang sebut Drizzle + next-intl eksplisit. Keduanya hadir di SRS §4.1 sebagai ASUMSI (SRS-A3, SRS-A2) + konsisten lintas dokumen downstream. **Pakai Drizzle ORM + next-intl**, jangan tukar Prisma/native-i18n tanpa konfirmasi user.
- **WARN-002:** API_CONTRACT §1.3 pakai prefix `/api/v1/*`. SRS §7.1 + PROJECT_ARCHITECTURE §5 + CODING_RULES §3.1 pakai `/api/*` tanpa v1. **PILIH `/api/v1/*`** (rekomendasi reviewer — paling eksplisit, cache-friendly). Struktur folder `src/app/api/v1/...` sudah pakai v1. Konsisten di seluruh route handler + middleware + API_CONTRACT + test. Jangan campur.

---

## 3. Stack Final Ringkas

| Lapisan | Teknologi | Versi |
|---|---|---|
| Frontend+Backend | Next.js (App Router) | stabil terkini (15+/16+) |
| Runtime | Node.js | Node 20+ (Vercel didukung) |
| Bahasa | TypeScript strict | `tsconfig strict:true` |
| Styling | Tailwind CSS | **v4** (CSS-first) |
| Komponen UI | shadcn/ui | latest stabil (copy-paste) |
| AI orchestration | Vercel AI SDK + `@ai-sdk/openai-compatible` | **AI SDK v6** |
| Validasi | Zod | stabil terkini |
| DB | Turso (libSQL, SQLite-compatible via HTTP) | latest |
| ORM | Drizzle ORM + `@libsql/client` + `drizzle-kit` | stabil terkini |
| Storage gambar | Vercel Blob (`@vercel/blob`) | latest |
| Auth | NextAuth.js (Auth.js v5+) | stabil terkini |
| Enkripsi | Node `crypto` (AES-256-GCM) | native Node |
| i18n | next-intl | stabil terkini |
| Test unit/integration | Vitest (co-located) | stabil terkini |
| Test e2e | Playwright | stabil terkini |
| Lint | ESLint + `next lint` | stabil terkini |
| Format | Prettier ATAU Biome (pilih satu, jangan campur) | stabil |
| Package manager | **pnpm** | latest stabil |
| Deploy | Vercel | n/a |

Lock versi di `package.json` saat init. Jangan upgrade mayor mid-fase tanpa review.

---

## 4. Instruksi Eksekusi (Urut, Tegas)

Eksekusi urut. Selesaikan satu task sebelum lanjut. Verifikasi per task sebelum DoD fase.

### 4a. Setup Awal

1. **Init repo + Next.js.** Di `C:\laragon\www\PromptFlow` (folder sudah ada `product-docs/`, JANGAN hapus): `git init` (atau clone dari GitHub lalu copy `product-docs/` bila perlu). Jalankan `pnpm create next-app .` App Router + TypeScript + Tailwind v4 + ESLint. Jangan overwrite `product-docs/`. Init shadcn/ui: `pnpm dlx shadcn@latest init`. Verifikasi: `pnpm dev` jalan, `pnpm lint` 0 error.
2. **Install dependency inti:** `pnpm add ai @ai-sdk/openai-compatible zod next-auth bcryptjs @libsql/client drizzle-orm drizzle-kit @vercel/blob next-intl lucide-react react-hook-form @hookform/resolvers sonner`. Install dev: `pnpm add -D vitest @vitest/coverage-v8 @playwright/test @types/bcryptjs`. Lock versi di `package.json`.
3. **Setup Tailwind v4 + shadcn/ui.** Konfigurasi `src/app/globals.css` CSS-first `@theme` + CSS vars shadcn. Tambah design tokens UIUX_SPEC §2 (warna `--primary #7c3aed`, `--success #16a34a`, `--warning #d97706`, `--info #2563eb`, font Inter + JetBrains Mono, radius 6px). Buat `components.json` shadcn.
4. **Setup Drizzle + Turso + schema 9 entitas.** Buat DB Turso, dapat `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. Tulis `drizzle.config.ts` (dialect turso). Tulis `src/lib/db/schema.ts` — **copy exact dari DATABASE_SCHEMA.md §8.3** (9 tabel: `users`, `provider_configs`, `projects`, `asset_references`, `characters`, `scenes`, `image_prompts`, `generation_logs`, `supporting_characters` + index komposit). Tulis `src/lib/db/client.ts` init Drizzle + libSQL + guard env. Jalankan `pnpm db:generate` + `pnpm db:push`. Verifikasi tabel terbentuk di Turso. Urutan dependency: users → provider_configs → projects → asset_references → characters → scenes → image_prompts → generation_logs → supporting_characters.
5. **Setup NextAuth credentials.** `src/lib/auth/config.ts` credentials provider (email+password, bcryptjs hash ASUMSI CR-A15). `src/lib/auth/middleware.ts` protected routes. Env `NEXTAUTH_SECRET` + `NEXTAUTH_URL`. Tabel `users` (sudah di schema). Verifikasi: login e2e jalan, protected route redirect `/login` bila unauth.
6. **Setup next-intl dwibahasa.** `src/lib/i18n/config.ts` + `request.ts`. `messages/id.json` + `messages/en.json` (kosong dulu, isi saat Fase 2). Root layout i18n provider. Toggle `LanguageToggle` di header.
7. **Setup env vars.** Buat `.env.example` (dokumentasi, tanpa value asli) + `.env.local` (dev, TIDAK commit, di `.gitignore`). Lihat §env AGENTS.md §12. Guard wajib di init: `if (!process.env.ENCRYPTION_KEY) throw`, `if (!process.env.TURSO_DATABASE_URL) throw`, `if (!process.env.NEXTAUTH_SECRET) throw`.
8. **Setup Vitest + Playwright + ESLint + CI.** `vitest.config.ts` (coverage v8). `playwright.config.ts`. GitHub Actions CI `.github/workflows/ci.yml`: `pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` → `pnpm test --coverage` → `pnpm test:e2e` → `pnpm build`. Block merge bila fail.

### 4b. Fase 1 — Skeleton + DB + Auth + Provider + Generate Shorts + Export JSON (MUST core)

Ikut AGENTS.md §6 Fase 1 (task F1-01..F1-12). Selesaikan satu per satu, verifikasi per task.

| # | Task | Detail singkat |
|---|---|---|
| F1-01 | Init Next.js + Tailwind + shadcn | (sudah di setup awal) |
| F1-02 | Setup Turso + Drizzle + schema 9 entitas + migration | (sudah di setup awal) |
| F1-03 | Setup NextAuth credentials | (sudah di setup awal) |
| F1-04 | Provider factory + crypto | `src/lib/ai/provider-registry.ts` `createOpenAICompatible({name, apiKey, baseURL, headers})`. `src/lib/crypto/aes.ts` AES-256-GCM (`encrypt`/`decrypt`/`mask`) — copy dari DATABASE_SCHEMA.md §11.2. Env `ENCRYPTION_KEY` 32 byte base64. Semua `import 'server-only'`. |
| F1-05 | Zod schema + prompt templates | `src/lib/validation/schemas.ts`: `TitleSchema`, `DurationSchema`, `StyleSchema`, `AspectRatioSchema`, `GenerateInputSchema`, `ProviderConfigSchema`, **`PromptPackageSchema`** — **copy exact dari AGENTS.md §9 / API_CONTRACT §8.4**. `src/lib/ai/prompts/*.system.ts` (scenes, voiceover, character, image-prompts, moral). |
| F1-06 | Generate endpoint SSE (Shorts 30-60s) | `POST /api/v1/generate` SSE. `src/lib/ai/llm-client.ts` `generateObject`/`streamObject` + retry 3x backoff. `src/lib/ai/response-parser.ts` Zod validate + fallback JSON parse. `src/lib/ai/consistency-checker.ts` FR-12 post-check (return warnings[], tidak block). SSE event protocol per API_CONTRACT §7. Stage: `character_profiles` → `scenes` → `image_prompts` → `moral` → `done`. Token < 10s (NFR-P3). |
| F1-07 | UI generate (Shorts) + streaming display | `/generate` Client Component form (title, duration_type=shorts, style, aspect_ratio). `GenerateProgress` + `ResultTabs` (SceneCard, CharacterCard, ImagePromptList, moral). Copy-to-clipboard per item (NFR-U4). E2E form submit → streaming render real-time. |
| F1-08 | Project CRUD | `GET/POST /api/v1/projects`, `GET/PATCH/DELETE /api/v1/projects/[id]`. Server Actions. Ownership check (`user_id === session.user.id`). Soft delete (`deleted_at`). Paginate list (index `idx_projects_user_created`). |
| F1-09 | Export JSON | `GET /api/v1/projects/[id]/export?format=json`. Header `Content-Disposition: attachment`. Body = `result_json` (PromptPackage). |
| F1-10 | Settings provider UI | `/settings` form provider + base URL pre-fill (Ollama `https://ollama.com/v1`, OpenRouter `https://openrouter.ai/api/v1`, 9router `http://localhost:20128/v1`, custom) + model input + API key password. Save encrypt. List mask `****`. Test connection `POST /api/v1/settings/providers/[id]/test`. |
| F1-11 | Vitest + Playwright + CI | (sudah di setup awal) Coverage >= 80% unit. CI green. |
| F1-12 | Deploy Vercel preview | Connect repo. Set env (AGENTS.md §12). `pnpm build` sukses. Deploy preview. Verifikasi: login + generate Shorts + export JSON e2e OK. |

**Fase 1 DoD (WAJIB semua, AGENTS.md §15):**
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
- [ ] Provider test connection OK.
- [ ] Generate SSE hasil valid `PromptPackageSchema` (Zod parse pass).
- [ ] Export JSON download `.json` valid.
- [ ] API key user terenkripsi di DB + mask `****` di response.

### 4c. Fase 2 — Upload Referensi + Tutorial + Markdown + Dwibahasa (SHOULD)

Ikut AGENTS.md §6 Fase 2 (task F2-01..F2-06). Fase 1 DoD tetap hold.

| # | Task | Detail singkat |
|---|---|---|
| F2-01 | Vercel Blob setup | Install `@vercel/blob`. `src/lib/storage/blob.ts` (`put`, `del`, `head`). Env `BLOB_READ_WRITE_TOKEN`. Dev flag `USE_VERCEL_BLOB` (false → upload ke `public/references/`). |
| F2-02 | Upload endpoint + UI + metadata | `POST /api/v1/upload` multipart (tipe tokoh/background, label, image `image/*` max 10MB). `DELETE /api/v1/upload?name=&projectId=`. Simpan `asset_references` (filename, blob_url, tipe, project_id, mime_type, size_bytes). `DropzoneUploader` component. |
| F2-03 | Inject reference_filename ke prompt | Generate pipeline rujuk `reference_filename` di `image_prompts.characters[].reference_filename` & `backgrounds[].reference_filename`. System prompt inject "Character 'X' — reference image: hero.png. Maintain visual consistency." Tanpa referensi → null, fitur tetap jalan (FR-05). |
| F2-04 | Generate Tutorial mode | Support `duration_type=tutorial` (420-900s, 8-20 adegan). Adjust prompt template + `estimated_scenes`. Warning bila di luar range (boleh proceed). |
| F2-05 | Export Markdown | `GET /api/v1/projects/[id]/export?format=markdown`. `src/lib/export/markdown.template.ts` render PRD §8.3 struktur (judul+metadata, profil karakter, pendukung, adegan urut, image prompt master list, pesan moral). |
| F2-06 | i18n dwibahasa ID + EN | Isi `messages/id.json` + `messages/en.json` lengkap. Semua teks UI pakai `useTranslations`/`getTranslations` (L09 no hardcoded teks). Toggle `LanguageToggle` persist cookie. |

**Fase 2 DoD:** upload referensi jalan, Tutorial mode jalan (8-20 adegan), export markdown jalan, UI dwibahasa. Fase 1 DoD tetap hold.

### 4d. Fase 3 — Polish UI + Konsistensi + History + Template (COULD + polish)

Ikut AGENTS.md §6 Fase 3 (task F3-01..F3-06). Fase 2 DoD tetap hold.

| # | Task | Detail singkat |
|---|---|---|
| F3-01 | Konsistensi post-check UI | Tampilkan warning mismatch karakter dari `consistency-checker.ts` (FR-12) di `ResultTabs` (Alert variant warning). |
| F3-02 | History generasi | `GET /api/v1/projects/[id]/logs`. UI history per project. Compare/rollback (COULD). |
| F3-03 | Template library judul | Library judul animasi populer (COULD). UI library + pilih judul. |
| F3-04 | Polish UI/UX design tokens | Implement full design tokens UIUX_SPEC §2 (warna `--primary #7c3aed`, font Inter + JetBrains Mono, spacing 4px base, radius 6px, shadow, motion). Loading/error/empty state UIUX_SPEC §13. Micro-motion UIUX_SPEC §10. WCAG AA audit axe (0 violation). |
| F3-05 | Telemetri KPI | Log `generation_logs` untuk KPI K1-K7 BRD §3.2. Dashboard sederhana (opsional). |
| F3-06 | Rate limit | Middleware rate limit `POST /api/v1/generate` 10 req/min/user (SRS-A15). Header `X-RateLimit-Limit/Remaining/Reset`. 429 bila exceed. |

**Fase 3 DoD:** konsistensi check visible, history jalan, template library jalan, UI polish match UIUX_SPEC, WCAG AA (axe 0 violation), telemetri KPI log, rate limit jalan. Fase 2 DoD tetap hold.

---

## 5. Aturan Kerja (WAJIB Patuh Sepanjang Build)

1. **Type-safe strict.** `tsconfig.json` `strict:true`. `no any` (L06). `unknown` + Zod narrow bila terpaksa.
2. **Secure by default.** API key user = AES-256-GCM at rest, mask `****` di response, decrypt server-only (`lib/crypto/aes.ts`).
3. **Repository pattern.** DB akses lewat `src/lib/db/repositories/*.repo.ts`. Tidak ada query Drizzle langsung di route handler/component.
4. **Server Component default.** Client Component hanya bila butuh interaksi (form, streaming display). `'use client'` minimal.
5. **Validation Zod di boundary.** Input request → Zod parse sebelum proses. LLM structured output → Zod `PromptPackageSchema` parse.
6. **Structured output LLM.** `generateObject({ schema: PromptPackageSchema })` bila provider `supportsStructuredOutputs: true`. Fallback `streamText` + parse JSON + Zod validate.
7. **Streaming SSE.** `POST /api/v1/generate` = `text/event-stream`. Token mulai mengalir < 10s (NFR-P3).
8. **i18n key.** Teks UI via `useTranslations`/`getTranslations` next-intl. No hardcoded teks (L09). Dwibahasa ID + EN.
9. **a11y WCAG 2.1 AA.** Focus visible, keyboard nav, label, kontras, ARIA (UIUX_SPEC §9).
10. **Test 80% coverage** unit/integration (Vitest co-located `*.test.ts`). E2E critical path (Playwright). CI gate.
11. **Conventional commit.** `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`. Atomic commit (CODING_RULES §8).
12. **No direct push `main`** (L20). Lewat PR + review. Branch `feat/<scope>`, `fix/<scope>`, `chore/<scope>`.
13. **No secret client-side.** Env `NEXT_PUBLIC_*` hanya nilai non-sensitif. API key LLM, ENCRYPTION_KEY, NEXTAUTH_SECRET = server-only.
14. **No LLM call client-side.** `lib/ai/*` wajib `import 'server-only'` (L24).
15. **No decrypt client-side** (L25).
16. **Hormati 30 Larangan** CODING_RULES §13 (L01-L30) — baca sebelum coding. Yang kunci: L06 no any, L07 no hardcoded secret, L12 no query tanpa `user_id`, L14 no string concat SQL, L15 no `dangerouslySetInnerHTML` tanpa sanitasi, L16 no eval, L17 no `process.env.X!` tanpa guard, L20 no push main, L21 no `it.skip` tanpa alasan, L22 no snapshot komponen UI, L24 no LLM client, L25 no decrypt client, L30 function max 60 baris.
17. **Catat WARN-001 & WARN-002** (AGENTS.md §14). Pakai Drizzle + next-intl (jangan tukar). Pakai prefix `/api/v1/*` (jangan `/api/*` murni). Konsisten seluruh route + middleware + test.

Sitasi: `SRS.md §9.1` ; `CODING_RULES.md §1.3, §13` ; `PROJECT_ARCHITECTURE.md §1.3, §9`.

---

## 6. Verifikasi Per Task (Jalankan Sebelum Lanjut)

Jalankan command ini setelah tiap task selesai. Bukti sebelum klaim sukses (verification-before-completion principle).

| Command | Fungsi | Sukses bila |
|---|---|---|
| `pnpm lint` | ESLint + next lint | 0 error, 0 warning |
| `pnpm typecheck` | `tsc --noEmit` | 0 error |
| `pnpm test` | Vitest run | pass |
| `pnpm test --coverage` | Vitest coverage | >= 80% unit/integration |
| `pnpm test:e2e` | Playwright | critical path green |
| `pnpm build` | next build | sukses tanpa error |
| `pnpm db:generate` | drizzle-kit generate | SQL migration terbuat di `drizzle/` |
| `pnpm db:push` | drizzle-kit push | tabel terbentuk di Turso |
| `Test-Path -LiteralPath "<file>"` | cek file output ada | True |

CI gate: PR tidak merge bila `lint`/`typecheck`/`test`/`e2e`/`build` fail.

---

## 7. Definition of Done Final (Semua Fase)

**Fase 1 DoD (WAJIB semua — AGENTS.md §15):**
- [ ] Semua task F1-01..F1-12 selesai.
- [ ] `pnpm build` pass tanpa error.
- [ ] `pnpm lint` 0 error 0 warning.
- [ ] `pnpm typecheck` 0 error.
- [ ] `pnpm test --coverage` >= 80% unit/integration.
- [ ] `pnpm test:e2e` critical path green (login → set provider → generate Shorts → save → export JSON).
- [ ] Deploy Vercel preview sukses + URL jalan.
- [ ] Env vars lengkap di Vercel (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, ENCRYPTION_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL).
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

---

## 8. Asumsi Konfirmasi User

Daftar asumsi lintas dokumen yang **TIDAK ADA BUKTI eksplisit** di RAG-CONTEXT (AGENTS.md §16). Konfirmasi user bila ragu sebelum locking implementasi. **Bila user tidak respons dalam batas wajar, pakai asumsi default yang sudah didokumenkan** (jangan blok eksekusi).

| ID | Asumsi default | Dampak bila salah |
|---|---|---|
| SRS-A1 / CR-A4 | Auth = NextAuth **credentials** provider (email+password) | Bila OAuth → provider config beda |
| SRS-A2 / CR-A5 | i18n = **next-intl** | Bisa native App Router i18n |
| SRS-A3 / CR-A1 | ORM = **Drizzle** (bukan Prisma/raw libsql) | Arsitektur beda |
| SRS-A4 / CR-A2 | Enkripsi = **AES-256-GCM via env `ENCRYPTION_KEY`** | Bisa secret manager |
| SRS-A5 / CR-A3 | Storage gambar prod = **Vercel Blob** | Bisa S3/R2 |
| SRS-A7 / CR-A? | 9router `http://localhost:20128/v1` valid lokal, Bearer/none auth | Bila tidak valid → hapus dari enum provider |
| SRS-A8 | Default model LLM per provider = user input (no hardcode) | Bila default list → add hint UI |
| SRS-A10 | Batas tokoh default **10 per project** | Zod schema + UI hint beda |
| SRS-A11 | Jumlah adegan: **shorts 3-6, tutorial 8-20** | Prompt template beda |
| SRS-A12 | Latency target: **Shorts <= 60s, Tutorial <= 180s** end-to-end streaming | NFR-P1/P2 beda |
| SRS-A13 | Auto-fallback provider = **manual switch** (bukan otomatis) fase awal | Logic beda |
| SRS-A14 / CR-A7 | Retry LLM **3x backoff** | `llm-client.ts` beda |
| SRS-A15 / CR-A8 | Rate limit generate **10 req/min/user** | Middleware beda |
| SRS-A16 | **Soft delete** project (`deleted_at`) | API_CONTRACT 204 beda |
| SRS-A17 | Dev lokal upload FS `public/references/`, prod Vercel Blob | Bila prod juga FS → tidak persisten Vercel |
| SRS-A19 | Vercel function timeout: Hobby 10s, Pro 60s/300s | Pecah generate per komponen |
| CR-A15 | Password hash = **bcryptjs** | Bisa argon2 |
| CR-A16 | Session strategy = **JWT cookie** | Bisa Turso adapter DB session |
| CR-A17 | File upload max **10MB** | Zod + Blob config beda |
| API-A1 | Prefix API = **`/api/v1/*`** | Bila `/api/*` → update kontrak + struktur |
| NFR-I2 | Konten generate LLM bahasa ikut judul | Bila toggle bahasa output → prompt beda |
| UX-A1 | Brand accent = violet `#7c3aed` | Bisa diubah user |
| UX-A2 | Font = Inter + JetBrains Mono | Bisa Geist |

**Aturan:** bila user konfirmasi berbeda dari asumsi, update dokumen terkait (SRS/PRD/UIUX_SPEC/API_CONTRACT) + catat di commit + sesuaikan implementasi. Jangan ubah scope tanpa konfirmasi (Larangan §10).

---

## 9. Penutup

Mulai eksekusi sekarang. Otonom sampai selesai. Baca AGENTS.md + rujukan product-docs/ dulu, lalu eksekusi Setup Awal → Fase 1 → Fase 2 → Fase 3. Verifikasi per task (§6). Capai DoD final (§7). Hormati aturan kerja (§5) + 30 larangan CODING_RULES §13 + WARN-001/WARN-002. Bila ragu pada asumsi (§8), konfirmasi user; bila user tidak respons, pakai asumsi default yang sudah didokumenkan, lanjut eksekusi.

**Larangan eksekusi:**
- Jangan ubah scope tanpa konfirmasi user. Out of scope PRD §9 + SRS §2.2 (OOS-T1..T10) tetap out.
- Jangan skip aset wajib (schema DB, NextAuth, provider config, generate SSE, export, i18n, test).
- Jangan langgar CODING_RULES §13 (L01-L30). Baca sebelum coding.
- Jangan halusinasi field/endpoint/rule. Pakai fakta bersitasi, tandai ASUMSI bila tidak ada bukti.
- Jangan tukar stack (Drizzle → Prisma, next-intl → native, Vercel Blob → S3) tanpa konfirmasi user.
- Jangan push `main` langsung (L20). Lewat PR + review.
- Jangan commit secret ke repo. `.env.local` di `.gitignore`.
- Jangan skip test. CI gate wajib.

**Lapor di akhir (format wajib):**

```
## Laporan Eksekusi PromptFlow

### Status DoD
- Fase 1 DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Fase 2 DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Fase 3 DoD: [PASS/PARTIAL/FAIL] — bukti per item
- Cross-fase: [PASS/PARTIAL/FAIL]

### Verifikasi
- pnpm lint: [output]
- pnpm typecheck: [output]
- pnpm test --coverage: [% coverage]
- pnpm test:e2e: [pass/fail count]
- pnpm build: [sukses/error]
- pnpm db:push: [sukses]
- Deploy Vercel preview URL: [URL]

### File Dibuat (path absolut)
- [daftar file kunci: src/lib/db/schema.ts, src/lib/ai/llm-client.ts, src/app/api/v1/generate/route.ts, dst.]

### Asumsi Konfirmasi User
- [daftar asumsi yang dipakai, status konfirmasi user bila ada]

### Blocker / Catatan
- [bila ada]
```

Mulai sekarang. Otonom. Laporkan saat selesai.

---

**Dibuat oleh:** docgen-exec-prompt subagent
**Tanggal:** 2026-06-19
**Versi:** 1.0
