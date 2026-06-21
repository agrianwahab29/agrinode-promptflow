# AGENTS.md — PromptFlow V3 Build Guide
## Operational Guide for LLM/Agent Executor

**Versi:** 3.0
**Tanggal:** 2026-06-22
**Project Root:** C:\laragon\www\PromptFlow
**Docs Dir:** C:\laragon\www\PromptFlow\product-docs

---

## 1. Identitas & Tujuan

Kamu adalah agent eksekutor yang bertugas membangun **PromptFlow V3 Update** — menutup critical data gaps antara LLM output dan database persistence, memperkuat prompt builder, memperbarui UI, landing page, dan menambah E2E tests. Seluruh kode existing sudah jalan; tugasmu adalah **incremental gap closure**, bukan rewrite.

---

## 2. Konteks Proyek

**PromptFlow** adalah web app Next.js 15 App Router yang berfungsi sebagai **AI Animation Brief Engine** — menghasilkan paket prompt animasi terstruktur (scene, transisi, voice, audio, image prompt 8-lapis) untuk AI video generator (Runway, Pika, Kling, Sora).

**Stack:** Next.js 15, React 19, TypeScript 5.7 strict, Tailwind v4, shadcn/ui, Drizzle ORM 0.38, Turso/libSQL, NextAuth v5, Zod 3.24, next-intl, next-themes, framer-motion, Vitest, Playwright, pnpm 11.7.

**Status saat ini:** ~80+ source files, 10 DB tables, 20+ API endpoints, 7 unit test files, 1 E2E spec. Semua 5 fitur V3 sudah diimplementasi pada level kode dan skema DB V3 (migration 0001). Namun ada **critical data gaps** yang harus ditutup.

---

## 3. Lokasi & Peran Dokumen

| Dokumen | Peran | Path |
|---------|-------|------|
| **BRD.md** | WHY — justifikasi bisnis, tujuan, KPI, stakeholder, risiko | `C:\laragon\www\PromptFlow\product-docs\BRD.md` |
| **MRD.md** | WHO — pasar, persona, pesaing, positioning, strategi peluncuran | `C:\laragon\www\PromptFlow\product-docs\MRD.md` |
| **PRD.md** | WHAT — fitur, user stories, MoSCoW, acceptance criteria, deliverable | `C:\laragon\www\PromptFlow\product-docs\PRD.md` |
| **SRS.md** | HOW — arsitektur, spesifikasi teknis, data model, API, tahapan implementasi | `C:\laragon\www\PromptFlow\product-docs\SRS.md` |
| **DATABASE_SCHEMA.md** | DB — 10 tabel, ERD, indexes, constraints, migration plan | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` |
| **PROJECT_ARCHITECTURE.md** | ARCH — layers, folder structure, data flows, integrasi, deployment | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` |
| **UIUX_SPEC.md** | UI — design tokens, komponen, layout, wireframes, user flows | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` |
| **API_CONTRACT.md** | API — endpoint specs, request/response schemas, SSE events | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` |
| **CODING_RULES.md** | RULES — naming, code style, Drizzle patterns, error handling, testing | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` |
| **TEST_PLAN.md** | TEST — unit, integration, E2E test matrix, coverage targets | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` |
| **RAG-CONTEXT.md** | EVIDENCE — codebase scan, file-level citations, gap analysis | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |

---

## 4. 5 Fitur V3 — Status & Gap

| # | Fitur | Status Kode | Gap yang Harus Ditutup |
|---|-------|-------------|----------------------|
| F1 | **Light Theme** (dark/light/system) | DONE | Root layout mungkin belum wrap Providers untuk landing page. Verifikasi CSS variables dipakai di semua landing components. |
| F2 | **Scene Transitions** (6 jenis + flow patterns) | DONE | Flow patterns kurang optimal — perlu aturan tambahan: mood change, action fast, same mood, durasi minimum. |
| F3 | **Complex Image Prompts** (8-layer) | DONE (prompt+schema partial) | `color_palette` + `technical` TIDAK ada di DB `image_prompts` table. Generate route hanya simpan 4 dari 8 layer. |
| F4 | **Voice Type Mapping** (7 tipe) | DONE | `voiceover_speaker` TIDAK ada di DB `scenes` table. Mapping rules perlu diperkuat (mood->emotion, pacing->speed, pitch per age). |
| F5 | **Audio Specs** (5 jenis/scene) | DONE (table+repo+api) | Generate route **TIDAK menyimpan** `audio_specs` ke `scene_audio` table. Data loss antara generate dan revisi. |

---

## 5. Critical Data Gaps — Detail Teknis

### 5.1 Generate Route Gaps (src/app/api/v1/generate/route.ts)

**GAP-1: voiceover_speaker tidak tersimpan**
- Lines 158-174: `bulkCreateScenes` mapping TIDAK include `voiceoverSpeaker`
- Fix: tambah `voiceoverSpeaker: s.voiceover_speaker ?? 'narrator'`

**GAP-2: color_palette + technical tidak tersimpan**
- Lines 179-182: `bulkCreateImagePrompts` mapping hanya 4 field (projectId, sceneId, tipe, target, promptText, referenceFilename)
- Fix: tambah 7 fields: `composition`, `lighting`, `camera`, `moodAtmosphere`, `styleReferences`, `colorPalette` (handle array->string), `technical`

**GAP-3: audio_specs tidak tersimpan ke scene_audio**
- Setelah `bulkCreateScenes`, TIDAK ada loop INSERT ke `scene_audio`
- Fix: tambah blok loop: for each scene, for each audio_spec, INSERT ke scene_audio
- PREREQUISITE: `bulkCreateScenes` harus RETURN rows (`.returning()`)

**GAP-4: image_prompts.scene_id tidak ter-link**
- `bulkCreateImagePrompts` tidak map `sceneId` dari created scenes
- Fix: map `sceneId` dari `createdScenes[i].id`

### 5.2 Database Schema Gaps

**Kolom hilang di DB:**
- `scenes` table: TIDAK punya `voiceover_speaker` (Zod schema sudah ada)
- `image_prompts` table: TIDAK punya `color_palette` dan `technical` (Zod schema sudah ada)

**Migration diperlukan:** 3 ALTER TABLE statements

---

## 6. Deliverable Target

| # | Deliverable | Format | Lokasi Output |
|---|------------|--------|---------------|
| 1 | Migration SQL | `.sql` | `drizzle/0002_v3_gap_closure.sql` |
| 2 | Rollback SQL | `.sql` | `drizzle/0002_v3_gap_closure_rollback.sql` |
| 3 | Drizzle schema update | `.ts` | `src/lib/db/schema.ts` |
| 4 | Generate route patch | `.ts` | `src/app/api/v1/generate/route.ts` |
| 5 | Prompt builder refinement | `.ts` | `src/lib/ai/prompt-builder.ts` |
| 6 | Image prompt display enhancement | `.tsx` | `src/components/generate/image-prompt-display.tsx` |
| 7 | Landing page features update | `.ts` | `src/lib/landing/features.ts` |
| 8 | i18n keys (id + en) | `.json` | `messages/id.json`, `messages/en.json` |
| 9 | E2E tests (9 new) | `.spec.ts` | `e2e/*.spec.ts` |
| 10 | Unit test updates | `.test.ts` | `tests/**/*.test.ts` |

---

## 7. Constraint Teknis WAJIB

### 7.1 TypeScript
- Strict mode: `noImplicitAny`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Target: ES2022, module resolution: bundler
- Path alias: `@/*` -> `./src/*`
- Exported functions: explicit return types
- Enum-like values: snake_case string literals (`'fade_to_black'`, `'adult_female'`)

### 7.2 Database (Drizzle + Turso)
- Schema: `src/lib/db/schema.ts` — 10 tables, camelCase TS properties -> snake_case SQL columns
- Migration: `drizzle/` directory, SQL files
- Repository pattern: `src/lib/db/repositories/*.repo.ts`
- Soft delete: only `projects` table (`deleted_at`), queries MUST filter `WHERE deleted_at IS NULL`
- `updated_at` does NOT auto-update — MUST set explicitly in UPDATE queries

### 7.3 CSS & UI
- **SEMUA warna dari CSS variables** `globals.css` — JANGAN hardcoded colors
- Dark mode: `.dark` class override via `next-themes` `attribute="class"`
- Icons: `lucide-react` only, JANGAN custom SVG
- Component library: `shadcn/ui` primitives di `src/components/ui/`
- Responsive: mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- Animations: `framer-motion` untuk theme transitions
- Font: Inter (sans), JetBrains Mono (mono)
- Spacing: Tailwind default scale (space-1=4px, space-2=8px, dst)

### 7.4 Validation
- Zod schemas di `src/lib/validation/schemas.ts` — single source of truth
- `color_palette` di Zod: `z.union([z.string(), z.array(z.string())])` — handle BOTH format di generate route
- API input dan LLM output: SEMPAI divalidasi via Zod

### 7.5 i18n
- Locales: `['id', 'en']`, default `'id'`
- Files: `messages/id.json`, `messages/en.json` — HARUS punya key yang sama
- V3 keys: `landing.features.transitions.*`, `landing.features.voice.*`, `landing.features.audio.*`, `landing.features.imagePrompts.*`, `landing.features.theme.*`

### 7.6 Testing
- Unit: Vitest ^2.1.0, coverage 80% (lines, branches, functions, statements)
- E2E: Playwright ^1.49.0, Chromium only, 120s timeout, base URL `http://localhost:3000`
- Coverage include: `src/lib/**`, `src/app/api/**`
- Coverage exclude: `**/*.test.ts`, `src/components/ui/**`

### 7.7 Deployment
- Platform: Vercel, pnpm 11.7.0, `pnpm install --frozen-lockfile`
- Generate endpoint: `maxDuration = 300s` (Vercel Hobby)
- External packages: `@libsql/client` (serverExternalPackages)

---

## 8. Tahapan Implementasi (7 Phase)

### Phase 1: Database Migration (30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 1.1 | Buat migration | `drizzle/0002_v3_gap_closure.sql` | `ALTER TABLE scenes ADD voiceover_speaker TEXT DEFAULT 'narrator';` + `ALTER TABLE image_prompts ADD color_palette TEXT;` + `ALTER TABLE image_prompts ADD technical TEXT;` |
| 1.2 | Buat rollback | `drizzle/0002_v3_gap_closure_rollback.sql` | 3 `DROP COLUMN` statements |
| 1.3 | Update Drizzle schema | `src/lib/db/schema.ts` | Tambah: `voiceoverSpeaker: text('voiceover_speaker').default('narrator')` di scenes; `colorPalette: text('color_palette')` + `technical: text('technical')` di imagePrompts |
| 1.4 | Generate types | Run `pnpm drizzle-kit generate` | Pastikan typesync |
| 1.5 | Jalankan migration | Run `pnpm drizzle-kit migrate` atau manual | Verify: `PRAGMA table_info(scenes)` -> voiceover_speaker ada; `PRAGMA table_info(image_prompts)` -> color_palette, technical ada |

**VERIFIKASI:**
```sql
PRAGMA table_info(scenes);        -- voiceover_speaker ada
PRAGMA table_info(image_prompts); -- color_palette, technical ada
```

---

### Phase 2: Generate Route Update (1 jam)

| # | Task | File | Detail |
|---|------|------|--------|
| 2.1 | Update bulkCreateScenes | `route.ts:158-174` | Tambah: `voiceoverSpeaker: s.voiceover_speaker ?? 'narrator'` |
| 2.2 | Update bulkCreateImagePrompts | `route.ts:179-182` | Tambah 7 fields: `composition`, `lighting`, `camera`, `moodAtmosphere`, `styleReferences`, `colorPalette` (Array.isArray ? join : null), `technical` |
| 2.3 | Modifikasi bulkCreateScenes repo | `*.repo.ts` | Pastikan `.returning()` — harus RETURN rows untuk dapat scene_id |
| 2.4 | Tambah audio_specs INSERT block | `route.ts` (new block after bulkCreateScenes) | Loop scenes -> loop audio_specs -> `createSceneAudio(...)` dengan mapping lengkap (18 kolom scene_audio) |
| 2.5 | Tambah import | `route.ts` | `import { createSceneAudio } from '@/lib/db/repositories/scene-audio.repository'` |
| 2.6 | Handle color_palette array->string | `route.ts` | `Array.isArray(p.color_palette) ? p.color_palette.join(', ') : (p.color_palette ?? null)` |

**PENTING:** `color_palette` bisa berupa string ATAU array dari LLM. Zod schema pakai `z.union([z.string(), z.array(z.string())])`. Generate route HARUS normalisasi ke string sebelum INSERT.

**VERIFIKASI:** Generate test project, cek DB:
```sql
SELECT voiceover_speaker FROM scenes WHERE project_id = ?;
SELECT color_palette, technical FROM image_prompts WHERE project_id = ?;
SELECT * FROM scene_audio WHERE project_id = ?;
```

---

### Phase 3: Prompt Builder Refinement (45 menit)

| # | Task | File | Lines | Detail |
|---|------|------|-------|--------|
| 3.1 | Transition rules | `prompt-builder.ts` | 267-273 | Tambah: mood_signifikan_change -> dissolve/fade BUKAN cut; aksi_cepat + fast_pacing -> match_cut (0-200ms); scene_berurutan_mood_sama -> cut/dissolve BUKAN wipe/match_cut; durasi minimum: cut=0ms, dissolve>=800ms, fade>=1200ms, wipe>=400ms, match_cut>=200ms |
| 3.2 | Voice mapping table | `prompt-builder.ts` | 300-305 | Tambah: mood->emotion (cheerful->happy, dramatic->dramatic, tense->serious, peaceful->calm); pacing->speed (fast->1.1-1.2, normal->0.95-1.05, slow->0.8-0.95); pitch per age (child->high, teen->medium/high, adult_male->low/medium, adult_female->medium, elderly->low) |
| 3.3 | 8-layer format | `prompt-builder.ts` | 327-335 | Perkuat: WAJIB semua 8 layer, contoh format eksplisit per layer (color_palette: "deep blue #1a365d, gold #d4a017, white #f5f5f5"; technical: "4K, cinematic depth of field, film grain") |
| 3.4 | Audio spec examples | `prompt-builder.ts` | 377-384 | Tambah contoh per scene type (opening: orchestral + nature ambient; action: electronic + tense SFX; closing: fade-out music) |

**VERIFIKASI:** Generate test project:
- Scene 1: transition = fade_from_black/fade_to_white (BUKAN cut)
- Scene terakhir: transition = fade_to_black
- 70%+ scenes: transition != cut
- Setiap scene: audio_specs.length >= 1
- Setiap image_prompt: 8 layer terisi

---

### Phase 4: Schema & UI Verification (30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 4.1 | Verify Zod schemas | `schemas.ts` | Pastikan `color_palette` dan `technical` sudah ada di `ImagePromptItemSchema`, `voiceover_speaker` di `SceneSchema`. TIDAK perlu ubah. |
| 4.2 | Verify/fix image-prompt-display | `image-prompt-display.tsx` | Cek apakah color_palette + technical dirender. Jika tidak: tambah `ColorPaletteDisplay` (color chips 12x12px + hex) + `LayerRow` untuk technical |
| 4.3 | Verify audio-panel | `audio-panel.tsx` | Sudah ada — verifikasi render data dari DB |
| 4.4 | Verify voice-type-selector | `voice-type-selector.tsx` | Sudah ada — verifikasi voiceover_speaker tampil |
| 4.5 | Verify theme landing page | `[locale]/layout.tsx` | Cek Providers wrap children. Pastikan landing components pakai CSS variables BUKAN hardcoded colors |
| 4.6 | Verify scene-transition-card | `scene-transition-card.tsx` | Sudah ada — verifikasi flow patterns tampil |

**ColorPaletteDisplay spec (jika perlu buat):**
- Parse comma-separated color entries
- Each: inline chip (12x12px rounded-full, bg=hex) + name + hex
- Horizontal flex-wrap, fallback plain text
- `aria-label="Color palette: [full text]"`

---

### Phase 5: Landing Page Update (30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 5.1 | Update features.ts | `src/lib/landing/features.ts` | Tambah 5 fitur V3: (1) Scene Transitions — 6 jenis transisi, (2) Voice Type — 7 tipe suara + emosi, (3) Audio Specs — 5 jenis audio per scene, (4) Image Prompts — 8 lapis granular, (5) Theme Toggle — dark/light/system |
| 5.2 | Tambah i18n keys (id) | `messages/id.json` | Keys untuk 5 features: `landing.features.transitions.title/desc`, `landing.features.voice.*`, `landing.features.audio.*`, `landing.features.imagePrompts.*`, `landing.features.theme.*` |
| 5.3 | Tambah i18n keys (en) | `messages/en.json` | Sama dengan id — key HARUS sync |
| 5.4 | Verify render | Browser test | Features section muncul di landing page |

---

### Phase 6: E2E Test Expansion (2 jam)

| # | Test | File | Priority |
|---|------|------|----------|
| 1 | Login | `e2e/login.spec.ts` | Must (sudah ada) |
| 2 | Register | `e2e/register.spec.ts` | Must |
| 3 | Create project | `e2e/project-create.spec.ts` | Must |
| 4 | Generate brief | `e2e/generate.spec.ts` | Must |
| 5 | Project detail | `e2e/project-detail.spec.ts` | Must |
| 6 | Scene transitions | `e2e/scene-transitions.spec.ts` | Should |
| 7 | Audio specs | `e2e/audio-specs.spec.ts` | Should |
| 8 | Export brief | `e2e/export.spec.ts` | Should |
| 9 | Theme toggle | `e2e/theme-toggle.spec.ts` | Should |
| 10 | Settings | `e2e/settings.spec.ts` | Should |

**PENTING:** Generate test HARUS mock LLM response (hardcoded JSON) agar tidak flaky.

---

### Phase 7: Unit Test Updates (30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 7.1 | Schema test | `schemas.test.ts` | Test color_palette array/string handling, voiceover_speaker, audio_specs |
| 7.2 | Generate route test | `generate.route.test.ts` | Mock LLM, verify DB inserts (audio, color_palette, technical, voiceover_speaker) |
| 7.3 | Coverage check | Run `pnpm test:coverage` | Pastikan >= 80% |

---

## 9. File Change Manifest

| # | File | Action | Phase |
|---|------|--------|-------|
| 1 | `drizzle/0002_v3_gap_closure.sql` | CREATE | 1 |
| 2 | `drizzle/0002_v3_gap_closure_rollback.sql` | CREATE | 1 |
| 3 | `src/lib/db/schema.ts` | MODIFY (+3 kolom) | 1 |
| 4 | `src/app/api/v1/generate/route.ts` | MODIFY (+INSERT logic) | 2 |
| 5 | `src/lib/db/repositories/*.repo.ts` | MODIFY (.returning()) | 2 |
| 6 | `src/lib/ai/prompt-builder.ts` | MODIFY (perkuat rules) | 3 |
| 7 | `src/components/generate/image-prompt-display.tsx` | MODIFY (+2 layers) | 4 |
| 8 | `src/lib/landing/features.ts` | MODIFY (+5 features) | 5 |
| 9 | `messages/id.json` | MODIFY (+V3 keys) | 5 |
| 10 | `messages/en.json` | MODIFY (+V3 keys) | 5 |
| 11 | `e2e/register.spec.ts` | CREATE | 6 |
| 12 | `e2e/project-create.spec.ts` | CREATE | 6 |
| 13 | `e2e/generate.spec.ts` | CREATE | 6 |
| 14 | `e2e/project-detail.spec.ts` | CREATE | 6 |
| 15 | `e2e/scene-transitions.spec.ts` | CREATE | 6 |
| 16 | `e2e/audio-specs.spec.ts` | CREATE | 6 |
| 17 | `e2e/export.spec.ts` | CREATE | 6 |
| 18 | `e2e/theme-toggle.spec.ts` | CREATE | 6 |
| 19 | `e2e/settings.spec.ts` | CREATE | 6 |

---

## 10. Tooling yang Disarankan

| Kebutuhan | Tool | Command |
|-----------|------|---------|
| Install deps | pnpm | `pnpm install --frozen-lockfile` |
| Dev server | Next.js | `pnpm dev` |
| Build check | Next.js | `pnpm build` |
| DB migration generate | Drizzle Kit | `npx drizzle-kit generate` |
| DB migration apply | Drizzle Kit | `npx drizzle-kit migrate` |
| DB push (dev) | Drizzle Kit | `npx drizzle-kit push` |
| DB visual | Drizzle Kit | `npx drizzle-kit studio` |
| Unit tests | Vitest | `pnpm test` |
| Unit coverage | Vitest | `pnpm test:coverage` |
| E2E tests | Playwright | `pnpm test:e2e` |
| Lint check | ESLint/Next | `pnpm lint` |
| Type check | tsc | `pnpm tsc --noEmit` |

---

## 11. Aturan Kualitas

1. **Diagram/gambar:** Tidak ada diagram dalam kode. Diagram hanya di dokumen (Mermaid). Saat build, fokus pada kode.
2. **Kode hanya di source files:** Jangan generate kode di dokumen product-docs.
3. **CSS variables only:** SEMUA warna dari `globals.css` tokens. Hardcoded colors = REJECT.
4. **Zod validation:** SEMPAI input/output via Zod. Jangan skip validation.
5. **Error handling:** Graceful skip per field kosong, log warning, JANGAN crash entire generate.
6. **i18n sync:** `messages/id.json` dan `messages/en.json` HARUS punya key yang sama.
7. **TypeScript strict:** No `any`, explicit return types on exports, `as const` for literal arrays.
8. **Repository pattern:** SEMUA DB queries via repository layer, JANGAN raw SQL di API routes.
9. **Test coverage:** Unit >= 80%, E2E >= 10 critical path tests.

---

## 12. Definition of Done / Checklist Verifikasi

| # | Kriteria | Verifikasi |
|---|---------|------------|
| D1 | Migration 0002 berhasil | `PRAGMA table_info(scenes)` -> voiceover_speaker ada |
| D2 | Migration rollback berfungsi | Jalankan rollback, verify kolom hilang |
| D3 | Generate simpan voiceover_speaker | Generate -> query scenes -> field terisi |
| D4 | Generate simpan color_palette + technical | Generate -> query image_prompts -> kedua kolom terisi |
| D5 | Generate simpan audio_specs | Generate -> query scene_audio -> records ada per scene |
| D6 | image_prompts.scene_id ter-link | Generate -> query image_prompts -> scene_id BUKAN null |
| D7 | TypeScript build | `pnpm build` tanpa error |
| D8 | Unit tests passing | `pnpm test` — semua pass |
| D9 | Coverage >= 80% | `pnpm test:coverage` — thresholds met |
| D10 | E2E >= 10 passing | `pnpm test:e2e` — semua pass |
| D11 | Landing page V3 features | Browser: features section terlihat |
| D12 | Theme toggle landing page | Browser: toggle dark/light/system berfungsi |
| D13 | Image prompt 8 layer | Browser: generate result -> 8 layer sections terlihat |
| D14 | Export termasuk field baru | Export JSON -> color_palette, technical, audio_specs ada |

---

## 13. Larangan (JANGAN lakukan ini)

1. **JANGAN ubah scope** — hanya 5 fitur V3 + gap closure + tests. Bukan rewrite.
2. **JANGAN skip migration** — kolom baru HARUS ada di DB sebelum generate route update.
3. **JANGAN hardcode colors** — semua dari CSS variables `globals.css`.
4. **JANGAN skip `.returning()`** — `bulkCreateScenes` HARUS return rows untuk audio_specs INSERT.
5. **JANGAN skip color_palette array handling** — `Array.isArray()` check WAJIB.
6. **JANGAN skip graceful skip** — field kosong = skip + log warning, BUKAN crash.
7. **JANGAN ubah Zod schema yang sudah ada** — schemas.ts sudah lengkap untuk V3.
8. **JANGAN commit .env atau secrets** — API key, Turso token, encryption key di env only.
9. **JANGAN buat component test (.test.tsx)** — lib layer unit test + E2E cukup.
10. **JANGAN tambah fitur di luar scope V3** — no multi-tenant, no payment, no Redis, no PWA.

---

## 14. Gotchas & Anti-Patterns

### Critical Gotchas

| # | Gotcha | Detail | Solusi |
|---|--------|--------|--------|
| G1 | **bulkCreateScenes tidak return rows** | Repository mungkin pakai `db.insert().values()` tanpa `.returning()` | Modifikasi: `const rows = await db.insert(scenes).values(data).returning(); return rows;` |
| G2 | **color_palette bisa array atau string** | Zod: `z.union([z.string(), z.array(z.string())])` | Generate route: `Array.isArray(x) ? x.join(', ') : (x ?? null)` |
| G3 | **scene_audio INSERT butuh scene_id** | Tidak bisa INSERT audio tanpa scene_id dari created scene | Urutan: bulkCreateScenes (RETURNING) -> map scene_id -> INSERT audio |
| G4 | **SQLite ALTER TABLE tidak support IF NOT EXISTS** | `ALTER TABLE ... ADD COLUMN` gagal jika kolom sudah ada | Cek dulu: `PRAGMA table_info(...)` sebelum migration |
| G5 | **updated_at tidak auto-update** | SQLite/Drizzle tidak punya trigger auto-update | HARUS set `updatedAt: unixepoch()` secara eksplisit di UPDATE queries |
| G6 | **Landing page mungkin tidak wrap Providers** | Root layout vs locale layout | Verifikasi: `[locale]/layout.tsx` wrap children dengan `<Providers>` |
| G7 | **E2E generate test butuh mock LLM** | Real LLM call = flaky + slow | Gunakan hardcoded mock response JSON yang valid |

### Anti-Patterns

| Anti-Pattern | Correct Pattern |
|-------------|-----------------|
| Hardcoded colors: `className="bg-[#7C3AED]"` | CSS variable: `className="bg-primary"` |
| Raw SQL di API route | Repository pattern: `scenesRepo.bulkCreate(...)` |
| Skip Zod validation untuk LLM output | ALWAYS validate: `SceneSchema.parse(s)` |
| `db.insert().values()` tanpa `.returning()` | `db.insert().values(...).returning()` |
| INSERT audio tanpa check scene_id | Map scene_id dari bulkCreateScenes result |
| `color_palette` langsung ke DB tanpa type check | `Array.isArray(x) ? x.join(', ') : x` |
| Crash on null audio_specs | `if (scene.audio_specs?.length > 0) { ... }` else skip |
| `any` type | Explicit types, `as const`, inference from Zod |
| Test tanpa mock | Mock LLM response, hardcoded valid JSON |
| New feature tanpa i18n key | Tambah key di BOTH `id.json` dan `en.json` |

---

## 15. Template Presets V3 (Referensi)

| Preset | Transition | Voice | Audio |
|--------|-----------|-------|-------|
| Tutorial | dissolve 800ms | narrator/calm | lo-fi, classroom |
| Sinematik | fade_to_black 1500ms | adult_male/dramatic | orchestral, cinematic |
| Anak-anak | wipe 400ms | child/excited | children, playground |
| Dokumenter | cut 0ms | narrator/neutral | ambient, nature |
| Aksi | match_cut 200ms | adult_male/excited | electronic, tense |

---

*Dokumen ini berdiri sendiri. Eksekutor cukup baca AGENTS.md + 4 dokumen inti (BRD/MRD/PRD/SRS) + dokumen teknis terkait. Seluruh claim teknis bersumber dari RAG-CONTEXT.md (codebase evidence).*
