# Product Requirement Document (PRD)
## PromptFlow V3 — Animation Brief Engine Update

**Versi:** 3.0
**Tanggal:** 2026-06-22
**Status:** Draft
**Penanggung Jawab:** PromptFlow Product Team

---

## 1. Ringkasan Produk & Visi

### 1.1 Apa Itu PromptFlow

PromptFlow adalah web application Next.js 15 yang berfungsi sebagai **AI Animation Brief Engine** — menghasilkan paket prompt animasi terstruktur (scene, transisi, voice, audio, image prompt berlapis) yang siap dikonsumsi oleh AI video generator (Runway, Pika, Kling, Sora). Mendukung multi-LLM provider (Ollama, OpenRouter, 9router, custom) dan di-deploy di Vercel.

### 1.2 Visi V3

> Mengubah PromptFlow dari "text prompt generator" menjadi **production-grade animation brief engine** yang menghasilkan paket produksi lengkap — scene, transisi, voice, audio, dan image prompt 8-lapis — dalam satu workflow.

### 1.3 Apa yang Baru di V3

V3 memperkenalkan 5 kapabilitas inti + menutup 6 critical data gaps antara LLM output dan database persistence:

| # | Fitur V3 | Status Implementasi | Gap yang Harus Ditutup |
|---|----------|--------------------|-----------------------|
| F1 | Light Theme (dark/light/system) | Kode selesai | Root layout belum wrap Providers untuk landing page |
| F2 | Scene Transition Flow Engine (6 jenis) | Kode selesai | Flow patterns perlu perbaikan agar tidak "jarring cuts" |
| F3 | Complex Image Prompts (8-layer) | Kode selesai | `color_palette` + `technical` tidak ada di DB schema |
| F4 | Voice Type Specification (7 tipe) | Kode selesai | `voiceover_speaker` tidak ada di `scenes` table |
| F5 | Audio Specification (5 jenis/scene) | Kode selesai | Generate route TIDAK simpan `audio_specs` ke DB |

---

## 2. Persona & User Story

### 2.1 Persona Utama

| Persona | Profil | Job-to-be-Done |
|---------|--------|----------------|
| **Andi — Solo YouTuber** | 25 th, konten edukasi, 10K subs, budget Rp 0-100rb/bln | "Saya ingin menghasilkan animation brief lengkap (scene + suara + audio + visual) dalam <5 menit supaya bisa langsung pakai di Runway tanpa bolak-balik ChatGPT." |
| **Sari — Freelance Animator** | 30 th, terima brief dari klien di Upwork, 50+ proyek | "Saya ingin brief terstruktur dengan spesifikasi suara dan audio yang bisa langsung jadi production spec, supaya klien approve tanpa revisi." |
| **Budi — Studio Owner** | 35 th, studio 5 orang, klien UMKM & startup | "Saya ingin template preset yang bisa dipakai seluruh tim supaya output konsisten antar animator." |
| **Dewi — Content Agency PM** | 28 th, 10+ klien, 50+ brief/bulan | "Saya ingin generate animation brief dalam volume tinggi dengan konsistensi terjamin, tanpa tambah headcount." |
| **Riko — Edukator Animasi** | 40 th, dosen, buat tutorial animasi AI | "Saya ingin contoh brief terstruktur yang bisa didemokan ke mahasiswa dan dibagikan sebagai template." |

### 2.2 User Stories (MoSCoW-categorized)

#### Must Have

| ID | Sebagai... | Saya ingin... | Supaya... |
|----|-----------|---------------|-----------|
| US-M01 | Solo YouTuber | Generate animation brief dengan 8-layer image prompt per scene | Output visual saya konsisten dan granular saat dipakai di Runway/Pika |
| US-M02 | Freelance Animator | Mendapat spesifikasi voice type per karakter (7 tipe + emosi + speed) | Saya tidak perlu menentukan suara secara manual |
| US-M03 | Studio Owner | Setiap scene memiliki audio spec (BGM, SFX, ambient, music cue, transition audio) | Tim animator punya audio plan lengkap tanpa tool tambahan |
| US-M04 | Semua user | Scene transition terdefinisi (6 jenis + durasi + easing + direction) | Video output tidak "jarring cuts" |
| US-M05 | Semua user | Semua output LLM tersimpan ke database (audio_specs, color_palette, technical, voiceover_speaker) | Tidak ada data loss antara generate dan revisi |
| US-M06 | Semua user | Beralih antara dark/light/system theme | Nyaman bekerja di lingkungan terang maupun gelap |
| US-M07 | Semua user | Export brief sebagai JSON atau Markdown | Bisa dibagikan ke klien atau diimpor ke tool lain |

#### Should Have

| ID | Sebagai... | Saya ingin... | Supaya... |
|----|-----------|---------------|-----------|
| US-S01 | Semua user | Memilih template preset (Tutorial, Sinematik, Anak-anak, Dokumenter, Aksi) | Tidak perlu konfigurasi manual setiap kali generate |
| US-S02 | Content Agency PM | Landing page menampilkan fitur V3 | Calon pengguna tahu capability baru sebelum signup |
| US-S03 | Studio Owner | E2E test coverage memadai (≥10 critical path) | Yakin tidak ada regresi saat deploy update |
| US-S04 | Semua user | UI dan konten dalam Bahasa Indonesia dan English | Bisa dipakai sesuai preferensi bahasa |

#### Could Have

| ID | Sebagai... | Saya ingin... | Supaya... |
|----|-----------|---------------|-----------|
| US-C01 | Content Agency PM | API access untuk batch generation | Generate 50+ brief/bulan secara terprogram |
| US-C02 | Studio Owner | Custom template — buat preset sendiri | Tim punya preset sesuai standar internal |
| US-C03 | Freelance Animator | Direct integration ke Runway/Pika API | Brief langsung terkirim tanpa copy-paste |

#### Won't Have (V3)

| ID | Item | Alasan |
|----|------|--------|
| US-W01 | Multi-tenant / team collaboration | Fitur masa depan |
| US-W02 | Payment / billing integration | Belum ada model monetisasi aktif |
| US-W03 | Redis rate limiting | Dibutuhkan di production, bukan bagian scope V3 fitur |
| US-W04 | Mobile app / PWA | Web-first, mobile responsive cukup |
| US-W05 | Real-time collaboration | Fitur masa depan |
| US-W06 | Video rendering / preview | PromptFlow menghasilkan brief, bukan video |
| US-W07 | LLM fine-tuning / custom training | Menggunakan provider existing |

---

## 3. Daftar Fitur Prioritas MoSCoW

### Must Have (Wajib)

| # | Fitur | Deskripsi | Terkait Gap |
|----|-------|-----------|-------------|
| F-M01 | **Data Persistence — Audio Specs** | Generate route menyimpan `audio_specs` dari LLM output ke `scene_audio` table | GAP: generate/route.ts tidak simpan audio_specs ke DB |
| F-M02 | **Data Persistence — Color Palette + Technical** | Tambah kolom `color_palette` dan `technical` ke `image_prompts` table, simpan saat generate | GAP: kolom tidak ada di DB |
| F-M03 | **Data Persistence — Voiceover Speaker** | Tambah kolom `voiceover_speaker` ke `scenes` table, simpan saat generate | GAP: kolom tidak ada di DB |
| F-M04 | **Scene Transition Flow Patterns** | Perbaiki flow patterns di prompt-builder agar transisi lebih halus, tidak "jarring cuts" | GAP: flow patterns kurang optimal |
| F-M05 | **8-Layer Image Prompt Completeness** | Pastikan generate menghasilkan dan menyimpan semua 8 lapis: prompt_text, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical | GAP: color_palette & technical tidak tersimpan |
| F-M06 | **Voice Type Mapping Specificity** | Perbaiki pemetaan voice type agar lebih spesifik (age → voice_type → emotion → speed → pitch) | GAP: mapping kurang detail |
| F-M07 | **Light Theme Landing Page** | Pastikan root layout.tsx wrap dengan Providers untuk landing page agar theme toggle berfungsi di landing | GAP: providers belum wrap root layout |

### Should Have (Penting)

| # | Fitur | Deskripsi |
|----|-------|-----------|
| F-S01 | **Landing Page V3 Features Section** | Update `features.ts` dengan 4-5 fitur V3 (transitions, voice, audio, image layers, theme) |
| F-S02 | **E2E Test Expansion** | Tambah minimal 10 E2E tests untuk critical paths (generate, project CRUD, settings, dashboard, export) |
| F-S03 | **Image Prompt Display Enhancement** | Update `image-prompt-display.tsx` untuk render color_palette dan technical layer |

### Could Have (Nice-to-Have)

| # | Fitur | Deskripsi |
|----|-------|-----------|
| F-C01 | **Template Custom** | User bisa buat, simpan, dan pakai custom template preset |
| F-C02 | **API Rate Limit Tiers** | Tiered rate limiting (free: 10/min, pro: 100/min) |
| F-C03 | **Batch Generation** | Generate multiple briefs via API |

### Won't Have (Diluar Scope V3)

| # | Item | Alasan |
|----|------|--------|
| F-W01 | Multi-tenant / team collaboration | Fitur masa depan, butuh arsitektur berbeda |
| F-W02 | Payment / billing integration | Belum ada model monetisasi aktif |
| F-W03 | Redis rate limiting production | Dibutuhkan, tapi bukan scope V3 |
| F-W04 | Mobile app / PWA | Web-first cukup |
| F-W05 | Real-time collaboration | Fitur masa depan |
| F-W06 | Video rendering / preview | PromptFlow = brief generator, bukan video editor |
| F-W07 | LLM fine-tuning | Menggunakan provider existing |

---

## 4. Functional Requirement Detail Per Fitur

### FR-M01: Data Persistence — Audio Specs

| Aspek | Detail |
|-------|--------|
| **Input** | LLM output `audio_specs` array per scene (5 tipe: background_music, sfx, ambient, music_cue, transition_audio) |
| **Proses** | 1. Generate route parse LLM response → `SceneAudioSpecSchema` (Zod). 2. Loop setiap scene. 3. Untuk setiap audio_spec, INSERT ke `scene_audio` table dengan mapping: `project_id`, `scene_id`, `audio_type`, `description`, `timing`, `duration_seconds`, `volume`, `fade_in_ms`, `fade_out_ms`, `music_genre`, `music_mood`, `music_tempo_bpm`, `music_instruments`, `music_volume`, `sfx_list`, `ambient_type`, `ambient_volume` |
| **Output** | Setiap scene memiliki 0-5 record di `scene_audio` table |
| **Files terkait** | `src/app/api/v1/generate/route.ts`, `src/lib/db/repositories/scene-audio.repository.ts`, `src/lib/validation/schemas.ts` |

### FR-M02: Data Persistence — Color Palette + Technical

| Aspek | Detail |
|-------|--------|
| **Input** | LLM output `image_prompts[].color_palette` (string) dan `image_prompts[].technical` (string) |
| **Proses** | 1. ALTER TABLE `image_prompts` — tambah kolom `color_palette TEXT` dan `technical TEXT`. 2. Update Drizzle schema (`schema.ts`). 3. Update generate route INSERT untuk sertakan kedua kolom. 4. Jalankan migration |
| **Output** | `image_prompts` table memiliki kolom `color_palette` dan `technical`, terisi saat generate |
| **Files terkait** | `src/lib/db/schema.ts`, `drizzle/0001_v3_core_features.sql` (atau migration baru), `src/app/api/v1/generate/route.ts` |

### FR-M03: Data Persistence — Voiceover Speaker

| Aspek | Detail |
|-------|--------|
| **Input** | LLM output `scenes[].voiceover_speaker` (string — nama karakter atau "narrator") |
| **Proses** | 1. ALTER TABLE `scenes` — tambah kolom `voiceover_speaker TEXT`. 2. Update Drizzle schema. 3. Update generate route INSERT untuk sertakan kolom. 4. Jalankan migration |
| **Output** | `scenes` table memiliki kolom `voiceover_speaker`, terisi saat generate |
| **Files terkait** | `src/lib/db/schema.ts`, migration baru, `src/app/api/v1/generate/route.ts` |

### FR-M04: Scene Transition Flow Patterns

| Aspek | Detail |
|-------|--------|
| **Input** | Scene descriptions, scene_mood, scene_pacing dari LLM output |
| **Proses** | 1. Perbaiki instruksi di `prompt-builder.ts` (lines 246-278) agar LLM memilih transisi berdasarkan mood dan pacing. 2. Tambah rule: scene pembuka → fade_from_black, scene penutup → fade_to_black. 3. Tambah rule: perubahan mood signifikan → dissolve/fade, adegan aksi cepat → match_cut. 4. Tambah rule: scene berurutan dengan mood sama → cut atau dissolve, bukan wipe/match_cut. 5. Tambah durasi minimum per transisi (cut=0ms, dissolve≥800ms, fade≥1200ms, wipe≥400ms, match_cut≥200ms) |
| **Output** | Setiap scene memiliki `transition_type`, `transition_duration_ms`, `transition_easing`, `transition_direction` yang selaras dengan mood/pacing |
| **Files terkait** | `src/lib/ai/prompt-builder.ts` (lines 246-278) |

### FR-M05: 8-Layer Image Prompt Completeness

| Aspek | Detail |
|-------|--------|
| **Input** | Scene description, characters, style_type dari project |
| **Proses** | 1. Perkuat instruksi di `prompt-builder.ts` (lines 313-335) agar LLM WAJIB mengisi semua 8 layer. 2. Tambah validasi Zod: `color_palette` dan `technical` required (bukan optional). 3. Update response-parser untuk handle jika layer kosong — isi default atau flag warning. 4. Pastikan generate route menyimpan semua 8 layer ke DB (termasuk color_palette + technical setelah FR-M02 selesai) |
| **Output** | Setiap image_prompt memiliki 8 kolom terisi: prompt_text, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical |
| **Files terkait** | `src/lib/ai/prompt-builder.ts`, `src/lib/validation/schemas.ts`, `src/lib/ai/response-parser.ts`, `src/app/api/v1/generate/route.ts` |

### FR-M06: Voice Type Mapping Specificity

| Aspek | Detail |
|-------|--------|
| **Input** | Karakter profile (nama, usia, peran) dari project |
| **Proses** | 1. Perkuat mapping rules di `prompt-builder.ts` (lines 281-310): usia 5-12 → child, 13-19 → teen, 20-45 → adult_male/female (berdasarkan gender), 46+ → elderly_male/female, narrator → narrator. 2. Tambah rule: emosi mengikuti scene_mood (happy scene → joyful emotion, sad scene → melancholy). 3. Tambah rule: speed mengikuti scene_pacing (fast pacing → 1.2x, slow → 0.8x). 4. Tambah rule: pitch "auto" untuk mayoritas, "high" untuk child, "low" untuk elderly_male |
| **Output** | Setiap scene memiliki `voice_type`, `voice_emotion`, `voice_speed`, `voice_pitch` yang spesifik dan konsisten |
| **Files terkait** | `src/lib/ai/prompt-builder.ts` (lines 281-310) |

### FR-M07: Light Theme Landing Page

| Aspek | Detail |
|-------|--------|
| **Input** | User mengakses landing page |
| **Proses** | 1. Pastikan root `layout.tsx` (di `src/app/[locale]/layout.tsx`) wrap konten dengan `Providers` component yang sudah include `ThemeProvider` + `SessionProvider`. 2. Pastikan landing page components (`src/components/landing/`) menggunakan CSS variables dari `globals.css` (bukan hardcoded warna). 3. Test theme toggle di landing page: dark → light → system |
| **Output** | Landing page mendukung dark/light/system theme dengan transisi halus |
| **Files terkait** | `src/app/[locale]/layout.tsx`, `src/components/providers.tsx`, `src/components/landing/` |

### FR-S01: Landing Page V3 Features Section

| Aspek | Detail |
|-------|--------|
| **Input** | Data fitur V3 |
| **Proses** | 1. Update `src/lib/landing/features.ts` — tambah 4-5 fitur V3: Scene Transition Engine, Voice Type Mapping, Audio Specification, Complex Image Prompts (8-layer), Theme Toggle. 2. Pastikan i18n keys tersedia di `messages/id.json` dan `messages/en.json` |
| **Output** | Landing page menampilkan section fitur V3 dengan ikon, judul, dan deskripsi |
| **Files terkait** | `src/lib/landing/features.ts`, `src/components/landing/`, `messages/id.json`, `messages/en.json` |

### FR-S02: E2E Test Expansion

| Aspek | Detail |
|-------|--------|
| **Input** | Critical paths aplikasi |
| **Proses** | 1. Buat E2E test files menggunakan Playwright. 2. Minimal 10 tests: (a) Login, (b) Register, (c) Create project, (d) Generate animation brief (mock LLM), (e) View project detail, (f) View scene transitions, (g) View voice type, (h) View audio specs, (i) Export brief, (j) Theme toggle |
| **Output** | ≥10 E2E tests passing, coverage report di CI |
| **Files terkait** | `e2e/`, `playwright.config.ts` |

### FR-S03: Image Prompt Display Enhancement

| Aspek | Detail |
|-------|--------|
| **Input** | `image_prompts` data dengan `color_palette` dan `technical` |
| **Proses** | Update `image-prompt-display.tsx` — tambah render section untuk color_palette (visual color chips atau text) dan technical (camera settings, resolution, format) |
| **Output** | UI menampilkan semua 8 layer image prompt |
| **Files terkait** | `src/components/generate/image-prompt-display.tsx` |

---

## 5. Non-Functional Requirement

### 5.1 Performa

| # | Requirement | Target | Pengukuran |
|----|-------------|--------|------------|
| NFR-P01 | Generate response time (SSE streaming) | ≤ 240 detik (Vercel Hobby timeout) | Monitoring `generation_logs.duration_ms` |
| NFR-P02 | Landing page load time (LCP) | ≤ 2.5 detik | Lighthouse, Vercel Analytics |
| NFR-P03 | Theme switch latency | ≤ 100ms (no visible flash) | Manual test + framer-motion transition |
| NFR-P04 | DB write latency per scene (audio_specs) | ≤ 500ms untuk 5 audio records | Turso query log |
| NFR-P05 | API response time (non-generate) | ≤ 500ms (P95) | Vercel Function logs |

### 5.2 Keamanan

| # | Requirement | Detail |
|----|-------------|--------|
| NFR-S01 | Auth required untuk semua generate/project/settings endpoints | NextAuth v5 JWT, middleware guard |
| NFR-S02 | API key encryption | AES-256-GCM, key dari env `ENCRYPTION_KEY` |
| NFR-S03 | Rate limiting generate endpoint | 10 req/min/user (in-memory) |
| NFR-S04 | Input validation | Zod schema validation di semua API routes |
| NFR-S05 | SQL injection prevention | Drizzle ORM parameterized queries |
| NFR-S06 | Soft delete untuk projects | `deleted_at` column, tidak hard delete |

### 5.3 Aksesibilitas

| # | Requirement | Detail |
|----|-------------|--------|
| NFR-A01 | Theme toggle accessible via keyboard | ThemeToggle component: focusable, Enter/Space to select |
| NFR-A02 | Color contrast ratio ≥ 4.5:1 (WCAG AA) | Light dan dark theme CSS variables |
| NFR-A03 | Screen reader support untuk image prompt layers | aria-labels pada expandable sections |
| NFR-A04 | Responsive design | Mobile-first Tailwind breakpoints |

### 5.4 UX

| # | Requirement | Detail |
|----|-------------|--------|
| NFR-U01 | No flash of wrong theme (FOWT) | next-themes `attribute="class"` + inline script |
| NFR-U02 | Smooth theme transition | CSS `transition: background-color 0.2s, color 0.2s` |
| NFR-U03 | Visual feedback saat generate (SSE stages) | Stage progress bar di generate-form.tsx |
| NFR-U04 | Error handling yang informatif | Toast notifications (sonner) untuk semua error states |
| NFR-U05 | Loading skeleton untuk halaman berat | page-loading-skeleton.tsx |

### 5.5 Maintainability

| # | Requirement | Detail |
|----|-------------|--------|
| NFR-M01 | TypeScript strict mode | `noImplicitAny`, `noImplicitReturns`, `noFallthroughCasesInSwitch` |
| NFR-M02 | Unit test coverage ≥ 80% | Vitest coverage thresholds (lines, branches, functions, statements) |
| NFR-M03 | E2E test coverage ≥ 10 critical paths | Playwright |
| NFR-M04 | Database migration reversible | Rollback script tersedia (`rollbackV2ToV3`) |
| NFR-M05 | i18n coverage 100% untuk V3 keys | `messages/id.json` + `messages/en.json` sync |

### 5.6 Kompatibilitas

| # | Requirement | Detail |
|----|-------------|--------|
| NFR-C01 | Browser support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| NFR-C02 | Node.js ≥ 20 | package.json engines |
| NFR-C03 | Vercel Hobby plan compatible | maxDuration=300, serverless function size |
| NFR-C04 | Turso/libSQL compatible | Drizzle ORM with @libsql/client |

---

## 6. Acceptance Criteria Per Fitur

### AC-M01: Data Persistence — Audio Specs

- [ ] Generate route menyimpan setiap `audio_spec` dari LLM output ke `scene_audio` table
- [ ] Setiap scene memiliki 0-5 record audio (sesuai LLM output)
- [ ] Semua kolom terisi: `audio_type`, `description`, `timing`, `volume`, `fade_in_ms`, `fade_out_ms`
- [ ] Kolom optional terisi jika LLM menghasilkan: `music_genre`, `music_mood`, `music_tempo_bpm`, `music_instruments`, `sfx_list`, `ambient_type`
- [ ] Tidak ada error saat LLM tidak menghasilkan audio_spec (graceful skip)
- [ ] Audio specs muncul di UI (`audio-panel.tsx`) setelah generate
- [ ] Audio specs termasuk dalam export JSON dan Markdown

### AC-M02: Data Persistence — Color Palette + Technical

- [ ] `image_prompts` table memiliki kolom `color_palette` (TEXT, nullable) dan `technical` (TEXT, nullable)
- [ ] Drizzle schema `schema.ts` mencerminkan kolom baru
- [ ] Migration script tersedia dan reversible
- [ ] Generate route menyimpan `color_palette` dan `technical` dari LLM output
- [ ] Data terbaca kembali via `GET /api/v1/projects/[id]/image-prompts`

### AC-M03: Data Persistence — Voiceover Speaker

- [ ] `scenes` table memiliki kolom `voiceover_speaker` (TEXT, nullable)
- [ ] Drizzle schema mencerminkan kolom baru
- [ ] Migration script tersedia dan reversible
- [ ] Generate route menyimpan `voiceover_speaker` dari LLM output
- [ ] Data terbaca kembali via `GET /api/v1/projects/[id]/scenes`

### AC-M04: Scene Transition Flow Patterns

- [ ] Scene pembuka selalu menggunakan `fade_from_black` atau `fade_to_black` (bukan `cut`)
- [ ] Scene penutup selalu menggunakan `fade_to_black`
- [ ] Scene dengan perubahan mood signifikan → `dissolve` atau `fade`
- [ ] Scene aksi cepat → `match_cut` dengan durasi pendek (≤300ms)
- [ ] Scene berurutan dengan mood sama → `cut` atau `dissolve` (bukan `wipe`/`match_cut`)
- [ ] Durasi minimum per transisi: cut=0ms, dissolve≥800ms, fade≥1200ms, wipe≥400ms, match_cut≥200ms
- [ ] ≥70% scene menggunakan transisi selain `cut` (KPI BRD G2)

### AC-M05: 8-Layer Image Prompt Completeness

- [ ] Setiap image_prompt memiliki ≥6 dari 8 layer terisi (target ≥90% — KPI BRD G3)
- [ ] `color_palette` terisi (format: palet warna dominan, misal "deep blue #1a365d, gold #d4a017, white #f5f5f5")
- [ ] `technical` terisi (format: spesifikasi teknis, misal "4K, cinematic depth of field, film grain")
- [ ] Zod schema memvalidasi kehadiran layer (minimal warning jika kosong)
- [ ] Response parser handle missing layers gracefully

### AC-M06: Voice Type Mapping Specificity

- [ ] Setiap scene memiliki `voice_type` yang sesuai dengan usia karakter (bukan default "narrator" untuk semua)
- [ ] `voice_emotion` mengikuti `scene_mood` (happy→joyful, sad→melancholy, tense→serious)
- [ ] `voice_speed` mengikuti `scene_pacing` (fast→1.2, normal→1.0, slow→0.8)
- [ ] `voice_pitch`: child→"high", elderly_male→"low", lainnya→"auto"
- [ ] `voiceover_speaker` terisi dengan nama karakter atau "narrator"

### AC-M07: Light Theme Landing Page

- [ ] Landing page mendukung dark/light/system theme
- [ ] Theme toggle berfungsi di landing page (tanpa harus login)
- [ ] Tidak ada flash of wrong theme (FOWT) saat pertama load
- [ ] Semua teks terbaca di kedua theme (contrast ratio ≥ 4.5:1)
- [ ] CSS variables `globals.css` bekerja di semua landing page components

### AC-S01: Landing Page V3 Features Section

- [ ] `features.ts` memiliki 4-5 fitur V3
- [ ] Setiap fitur: ikon, judul (id + en), deskripsi (id + en)
- [ ] Section muncul di landing page
- [ ] Responsive di mobile dan desktop

### AC-S02: E2E Test Expansion

- [ ] ≥10 E2E test files di `e2e/` directory
- [ ] Semua tests passing di Chromium
- [ ] Critical paths ter-cover: auth, generate, project CRUD, settings, export, theme
- [ ] CI pipeline menjalankan E2E tests

### AC-S03: Image Prompt Display Enhancement

- [ ] `image-prompt-display.tsx` menampilkan color_palette (visual color chips atau text block)
- [ ] `image-prompt-display.tsx` menampilkan technical (text block dengan spesifikasi)
- [ ] Expandable sections untuk setiap layer (8 total)
- [ ] Responsive di mobile

---

## 7. Spesifikasi Deliverable Konkret

### 7.1 Database Migration

| Item | Detail |
|------|--------|
| File | `drizzle/0002_v3_gap_closure.sql` (atau nama serupa) |
| Content | `ALTER TABLE image_prompts ADD COLUMN color_palette TEXT;`, `ALTER TABLE image_prompts ADD COLUMN technical TEXT;`, `ALTER TABLE scenes ADD COLUMN voiceover_speaker TEXT;` |
| Rollback | `ALTER TABLE ... DROP COLUMN ...` statements |
| Drizzle schema update | `schema.ts` — tambah 3 kolom baru |

### 7.2 Generate Route Update

| Item | Detail |
|------|--------|
| File | `src/app/api/v1/generate/route.ts` |
| Changes | 1. Setelah INSERT scenes, INSERT `voiceover_speaker`. 2. Setelah INSERT image_prompts, INSERT `color_palette` + `technical`. 3. Setelah INSERT scenes + scene_id didapat, LOOP INSERT audio_specs ke `scene_audio` |
| Error handling | Graceful skip jika field kosong, log warning |

### 7.3 Prompt Builder Update

| Item | Detail |
|------|--------|
| File | `src/lib/ai/prompt-builder.ts` |
| Changes | 1. Lines 246-278: perkuat transition flow rules (opening/closing, mood-based, pacing-based, durasi minimum). 2. Lines 281-310: perkuat voice mapping (age→type, mood→emotion, pacing→speed, age→pitch). 3. Lines 313-335: perkuat 8-layer requirements (WAJIB semua layer, format contoh) |

### 7.4 Zod Schema Update

| Item | Detail |
|------|--------|
| File | `src/lib/validation/schemas.ts` |
| Changes | 1. `ImagePromptItemSchema` — `color_palette` dan `technical` dari optional ke required (atau minimal non-empty string). 2. Pastikan `SceneSchema.voiceover_speaker` tetap optional (nullable) |

### 7.5 UI Component Updates

| Component | File | Changes |
|-----------|------|---------|
| Image Prompt Display | `src/components/generate/image-prompt-display.tsx` | Tambah section color_palette (color chips) + technical (text) |
| Audio Panel | `src/components/generate/audio-panel.tsx` | Sudah ada — verifikasi render data dari DB |
| Voice Type Selector | `src/components/generate/voice-type-selector.tsx` | Sudah ada — verifikasi voiceover_speaker tampil |
| Scene Transition Card | `src/components/generate/scene-transition-card.tsx` | Sudah ada — verifikasi flow patterns tampil |

### 7.6 Landing Page Update

| Item | Detail |
|------|--------|
| File | `src/lib/landing/features.ts` |
| Content | Tambah 5 fitur: Scene Transitions (6 jenis), Voice Type (7 tipe), Audio Specs (5 jenis), Image Prompts (8-layer), Theme Toggle (3 mode) |
| i18n | `messages/id.json` + `messages/en.json` — tambah keys untuk fitur V3 |

### 7.7 E2E Tests

| # | Test | File | Priority |
|---|------|------|----------|
| 1 | Login flow | `e2e/login.spec.ts` (sudah ada) | Must |
| 2 | Register flow | `e2e/register.spec.ts` | Must |
| 3 | Create project | `e2e/project-create.spec.ts` | Must |
| 4 | Generate animation brief | `e2e/generate.spec.ts` | Must |
| 5 | View project detail | `e2e/project-detail.spec.ts` | Must |
| 6 | View scene transitions | `e2e/scene-transitions.spec.ts` | Should |
| 7 | View audio specs | `e2e/audio-specs.spec.ts` | Should |
| 8 | Export brief | `e2e/export.spec.ts` | Should |
| 9 | Theme toggle | `e2e/theme-toggle.spec.ts` | Should |
| 10 | Settings — provider config | `e2e/settings.spec.ts` | Should |

### 7.8 Aset yang Dibutuhkan

| Aset | Lokasi | Status |
|------|--------|--------|
| Logo PromptFlow | Sudah ada di public/ | ✅ |
| Theme icons (Sun/Moon/Monitor) | lucide-react | ✅ |
| Feature icons untuk landing page | lucide-react | ✅ |
| Color palette visual (CSS chips) | Komponen baru di image-prompt-display.tsx | Perlu dibuat |
| Audio type icons | lucide-react (Music, Volume2, Waves, Radio, Zap) | ✅ |
| Transition type visual | scene-transition-card.tsx | ✅ Sudah ada |

---

## 8. Out of Scope Eksplisit

Berikut item yang **TIDAK** termasuk dalam scope V3 update:

| # | Item | Alasan | Rencana Masa Depan |
|---|------|--------|-------------------|
| 1 | Multi-tenant / team collaboration | Butuh arsiteur multi-user, belum ada model bisnisnya | V4+ |
| 2 | Payment / billing integration | Belum ada model monetisasi aktif | Setelah product-market fit |
| 3 | Redis rate limiting | Dibutuhkan di production, tapi in-memory cukup untuk 1 instance | Saat multi-instance |
| 4 | Mobile app / PWA | Web-first, responsive cukup | Setelah web stabil |
| 5 | Real-time collaboration | Butuh WebSocket/CRDT, kompleks | V4+ |
| 6 | Video rendering / preview | PromptFlow = brief generator, bukan video editor | Partnership dengan Runway/Pika |
| 7 | LLM fine-tuning / custom training | Menggunakan provider existing | Saat ada data training cukup |
| 8 | Component test (.test.tsx) | Lib layer unit test + E2E cukup untuk sekarang | Saat team grow |
| 9 | Multi-language support (selain id/en) | id/en cukup untuk target pasar | Berdasarkan user demand |
| 10 | Direct integration ke Runway/Pika API | Partnership dependent, bukan core product | Saat partnership ready |

---

## Lampiran

### L1. Mapping BRD → PRD

| BRD Tujuan | PRD Fitur Terkait |
|-----------|-------------------|
| G1 (Theme adoption ≥30%) | FR-M07, AC-M07 |
| G2 (Transition usage ≥70% non-cut) | FR-M04, AC-M04 |
| G3 (Image prompt ≥6/8 layers ≥90%) | FR-M05, AC-M05 |
| G4 (Audio spec generation ≥80%) | FR-M01, AC-M01 |
| G5 (Data persistence 100%) | FR-M01, FR-M02, FR-M03, AC-M01, AC-M02, AC-M03 |
| G6 (E2E ≥10 tests) | FR-S02, AC-S02 |
| G7 (Landing page V3 section) | FR-S01, AC-S01 |

### L2. Mapping MRD → PRD

| MRD Kebutuhan | PRD Fitur Terkait |
|--------------|-------------------|
| K1 (Animation brief terstruktur) | FR-M01 s/d FR-M06 |
| K2 (Scene transition terdefinisi) | FR-M04 |
| K3 (Image prompt berlapis) | FR-M02, FR-M05 |
| K4 (Voice type mapping) | FR-M03, FR-M06 |
| K5 (Audio spec per scene) | FR-M01 |
| K6 (Data persistence) | FR-M01, FR-M02, FR-M03 |
| K12 (Landing page informatif) | FR-S01 |
| K13 (E2E test coverage) | FR-S02 |

### L3. Referensi Teknis

- Tech stack: lihat `RAG-CONTEXT.md` Section 2
- Database schema: lihat `RAG-CONTEXT.md` Section 4
- API endpoints: lihat `RAG-CONTEXT.md` Section 5
- Gap analysis: lihat `RAG-CONTEXT.md` Section 18
- Prompt builder V3 details: lihat `RAG-CONTEXT.md` Section 7
- Zod schemas: lihat `RAG-CONTEXT.md` Section 8

### L4. Asumsi

| # | Asumsi | Basis | Tandai |
|---|--------|-------|--------|
| 1 | Pengguna punya akses minimal satu LLM provider | Multi-provider design | ASUMSI |
| 2 | Output PromptFlow dipakai sebagai input ke Runway/Pika/Kling/Sora | Prompt builder target tools | ASUMSI |
| 3 | Vercel Hobby plan tetap digunakan (max 300s timeout) | `maxDuration=300` di generate route | ASUMSI |
| 4 | Turso/libSQL handle schema V3 tanpa breaking migration | Migration sudah dijalankan | ASUMSI |
| 5 | Kualitas output bergantung pada LLM model yang dipakai | PromptFlow kontrol struktur, bukan model | ASUMSI |
| 6 | Indonesia-first dengan English support | Default locale `id` | ASUMSI |

---

*Dokumen ini disusun berdasarkan BRD.md, MRD.md, dan RAG-CONTEXT.md (codebase evidence) per 2026-06-22. Seluruh claim teknis memiliki sitasi ke file dan baris kode di RAG-CONTEXT.md.*
