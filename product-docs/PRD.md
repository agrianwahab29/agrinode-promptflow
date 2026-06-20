# PRD — Product Requirement Document
## PromptFlow V3 — Core Feature Expansion

> **Versi:** 2.0 (V3 Update)
> **Tanggal:** 2026-06-21
> **Pemilik:** Product Owner PromptFlow
> **Deliverable:** 5 fitur inti V3 — Light Theme, Scene Transition Flow Engine, Complex Image Prompts, Voiceover Voice Type Spec, Supporting Audio Spec
> **Builds on:** V1 (workflow engine, deployed) + V2 (landing page, in production)
> **Selaras dengan:** BRD.md v2.0 (why) + MRD.md v2.0 (who)
> **Rujukan:** RAG-CONTEXT.md (fakta, refresh 2026-06-21) + AGENTS.md v1.0 (build V2)

---

## 1. Ringkasan Produk + Visi

### 1.1 Produk Saat Ini (V1/V2)

**PromptFlow** = web app fullstack otomasi susun paket prompt animasi AI terstruktur (JSON + Markdown) dari input minimal (judul + durasi + gaya). Multi-provider LLM. Konsistensi karakter lintas adegan via character master. V1 deployed (9 tabel DB, 23 endpoint, NextAuth, SSE streaming). V2 landing page konversi-tinggi.

**Tech stack:** Next.js 15 + React 19 + Tailwind CSS v4 + shadcn/ui + Drizzle ORM + Turso/libSQL + Vercel AI SDK v4 + next-intl + Framer Motion. (`RAG-CONTEXT S2.1`)

### 1.2 Visi V3

> PromptFlow bergeser dari "AI prompt tool" generik ke **"Production-grade animation prompt engine"** — output siap-pakai untuk downstream AI video tools (Runway, Pika, Kling, Sora), no re-edit needed. (`BRD S3.2`, `MRD S5.2`)

**5 gap yang dijawab V3:**

| # | Gap | Bukti Kode | Solusi V3 |
|---|---|---|---|
| 1 | App force dark — user siang tidak nyaman | `layout.tsx:66` hardcoded `className="dark"` | Light Theme Support |
| 2 | Scene transition tanpa metadata — video "jarring" | `schema.ts:89-99` tanpa transition fields | Scene Transition Flow Engine |
| 3 | Image prompt basic 1-baris — output generic | `prompt-builder.ts:35-36` contoh 1 baris | Complex Image Prompts (8 layer) |
| 4 | Voiceover tanpa voice type — monoton | `schema.ts:94` plain string | Voiceover Voice Type Spec |
| 5 | Audio ZERO di seluruh codebase | Tidak ada field audio | Supporting Audio Spec |

(`RAG-CONTEXT S1, S11.1`)

### 1.3 Value Proposition V3

> "Satu judul → paket prompt animasi production-ready. Karakter konsisten, transisi halus, voice variety, audio lengkap, image prompts 8-layer. Multi-provider LLM. Export JSON / Markdown ke Runway, Pika, Kling, Sora." (`MRD S5.2`)

### 1.4 Prinsip Produk

| ID | Prinsip | Manifestasi V3 |
|---|---|---|
| P-01 | Minimal input, maximum output | Input = judul + durasi + gaya → output = 12+ field metadata per scene |
| P-02 | Production-ready output | Transition + voice + audio + image layers = no re-edit |
| P-03 | Universal UX | Light + dark + system preference = comfortable di mana saja |
| P-04 | Character consistency | Voice preset per character, transition library, audio template |
| P-05 | Portable export | JSON + Markdown = universal ke Runway, Pika, Kling, Sora |
| P-06 | Multi-provider flexibility | Pilih LLM sesuai budget/kualitas |
| P-07 | Additive migration | V2 project → V3 = auto-migrate, tidak kehilangan data |
| P-08 | Dwibahasa sinkron | ID + EN paralel untuk semua fitur baru |

---

## 2. Persona + User Story / Job-to-be-Done

### 2.1 Persona (Selaras MRD S3.1)

| ID | Persona | Segmen | Pain V2 (Dijawab V3) | Sitasi |
|---|---|---|---|---|
| PERS-01 | Rian (Solo Creator) | Kreator konten pendek AI | Video "kaget", audio diam, voice monoton, dark mode silau | MRD S3.2, BRD S5 |
| PERS-02 | Bumi Animasi (Indie Studio) | Studio animasi 2-10 orang | Transition tidak konsisten, voice tidak konsisten, tidak ada audio reusable | MRD S3.2, BRD S5 |
| PERS-03 | Bu Sinta (Edukator) | Tutorial maker | Dark mode silau, suara monoton, tidak ada musik edukatif | MRD S3.2, BRD S5 |

### 2.2 User Story per Persona

**Rian (Solo Creator)**

| ID | User Story | Acceptance |
|---|---|---|
| US-R01 | Generate paket prompt dengan transisi scene otomatis | Setiap scene: 4 field transition |
| US-R02 | Image prompt terstruktur 8-layer | Prompt: subject + composition + camera + lighting + color + mood + style + technical |
| US-R03 | Variasi voice type per scene | Setiap scene: voiceType + emotion + speed + pitch |
| US-R04 | Audio spec per scene | Setiap scene: minimal 1 audio cue |
| US-R05 | Pakai app di siang hari tanpa silau | Theme toggle light/dark/system, persist localStorage |
| US-R06 | Export JSON/MD termasuk metadata V3 | Export menyertakan section transition, voice, audio, image layers |

**Bumi Animasi (Indie Studio)**

| ID | User Story | Acceptance |
|---|---|---|
| US-B01 | Voice preset per character save & reuse | Voice type spec tersimpan per character |
| US-B02 | Transition library konsisten antar episode | Transition type default per project |
| US-B03 | Audio spec reusable sebagai template | Audio template per scene type |
| US-B04 | Team lihat preview transisi di UI | Visual flow indicator antar scene cards |

**Bu Sinta (Edukator)**

| ID | User Story | Acceptance |
|---|---|---|
| US-S01 | Light mode saat bikin konten di kelas | Theme toggle light mode tersedia |
| US-S02 | Suara karakter anak dan lansia | Voice type child + elderly tersedia |
| US-S03 | Ambient music edukatif per scene | Audio spec mendukung ambient type |

### 2.3 Job-to-be-Done

> When saya (kreator animasi AI) want to generate paket prompt production-ready dengan transisi halus, variasi suara, audio lengkap, image prompt detail dari input minimal, so I can langsung pakai output untuk downstream AI video tools tanpa re-edit.

---

## 3. Daftar Fitur Prioritas MoSCoW

### 3.1 V3 Features

| Prioritas | ID | Fitur | Deskripsi | Sumber |
|---|---|---|---|---|
| **MUST** | F-V3-01 | Light Theme Support | Theme toggle (dark default). next-themes. All components both themes | BRD F-V3-01 |
| **MUST** | F-V3-02 | Scene Transition Flow Engine | 6 types x 4 fields. LLM generates. UI flow preview | BRD F-V3-02 |
| **MUST** | F-V3-03 | Complex Image Prompts | 8-layer structured prompt | BRD F-V3-03 |
| **MUST** | F-V3-04 | Voiceover Voice Type Spec | 7 voice types + emotion + speed + pitch | BRD F-V3-04 |
| **MUST** | F-V3-05 | Supporting Audio Spec | 5 audio categories per scene. Metadata only | BRD F-V3-05 |
| **SHOULD** | F-V3-06 | Schema Migration | Additive: +11 fields scenes + new table scene_audio | BRD SCOPE-03..07 |
| **SHOULD** | F-V3-07 | Prompt Builder Enhancement | 5 metadata instructions | BRD SCOPE-08,09 |
| **SHOULD** | F-V3-08 | Zod Schema Extension | Extend + new schemas | BRD SCOPE-10 |
| **SHOULD** | F-V3-09 | Export Extension | JSON + MD termasuk V3 metadata | BRD SCOPE-15 |
| **SHOULD** | F-V3-10 | i18n V3 Keys | Keys untuk theme/transition/voice/audio/image (ID+EN) | BRD SCOPE-16 |
| **SHOULD** | F-V3-11 | V2 to V3 Migration Script | Backfill defaults, reversible | BRD SCOPE-17 |
| **SHOULD** | F-V3-12 | Analytics V3 Events | 5 event baru | BRD SCOPE-18 |
| **COULD** | F-V3-13 | In-app Changelog Banner | "5 fitur baru, project aman" | BRD SCOPE-20 |
| **COULD** | F-V3-14 | Landing Page Copy Update | Highlight 5 fitur baru | BRD SCOPE-19 |
| **COULD** | F-V3-15 | UI Transition Preview | Visual flow indicator | BRD SCOPE-11 |
| **COULD** | F-V3-16 | UI Voice Selector | Dropdown per scene | BRD SCOPE-12 |
| **COULD** | F-V3-17 | UI Audio Panel | CRUD audio entries per scene | BRD SCOPE-13 |
| **COULD** | F-V3-18 | UI Image Prompt Labels | Section labels + copy per-section | BRD SCOPE-14 |
| **WON'T** | F-V3-19..28 | Audio gen, TTS, Image gen, Video assembly, Voice cloning, Waveform, Negative prompt, Multi-lang voice, Mobile app, Pricing | V4/V5 | BRD OOS-V3-01..12 |

**Ringkasan:** MUST: 5 | SHOULD: 7 | COULD: 6 | WON'T: 10

---

## 4. Functional Requirement Detail per Fitur

Format: ID | Input | Proses | Output | Acceptance

### F-V3-01: Light Theme Support (FR-V3-01)

| Field | Detail |
|---|---|
| Input | User klik theme toggle (light/dark/system) / page load |
| Proses | (a) Install `next-themes`. (b) Add ThemeProvider ke `providers.tsx`. (c) Remove hardcoded `className="dark"` dari `layout.tsx:66`. (d) Remove `<div className="dark">` dari `page.tsx:24`. (e) Add ThemeToggle component ke `app-header.tsx`. (f) Persist di localStorage via next-themes. (g) Detect system preference |
| Output | App toggle light/dark/system. Persist localStorage. No FOUC |
| Acceptance | Toggle visible. Persist. System preference detected. shadcn/ui render sempurna di light mode. WCAG AA kontras |
| Schema | N/A (client-side only) |
| Prompt | N/A |
| i18n keys | `common.theme`, `common.themeToggle`, `common.lightMode`, `common.darkMode`, `common.systemMode` |
| Files | `providers.tsx`, `layout.tsx:66`, `page.tsx:24`, `app-header.tsx`, `provider-card.tsx:88`, `globals.css` |
| Sitasi | `RAG-CONTEXT S9.1-9.3`, `BRD S6.1` |

### F-V3-02: Scene Transition Flow Engine (FR-V3-02)

| Field | Detail |
|---|---|
| Input | LLM generate output JSON per scene |
| Proses | (a) Extend `scenes` table: +transitionType (text), +transitionDurationMs (integer), +transitionEasing (text), +transitionDirection (text). (b) Extend Zod SceneSchema. (c) Enhance prompt-builder.ts — instruksi AI pilih transition sesuai narasi. (d) Update save handler route.ts:156-164. (e) UI: visual flow indicator antar scene |
| Output | Setiap scene punya 4 field transition + scene_pacing + scene_mood |
| Acceptance | LLM generate transition dari enum: cut/dissolve/fade_to_black/fade_to_white/wipe/match_cut. Default = cut, 0ms. scene_pacing: fast/medium/slow (EXTENDED ASUMSI). scene_mood: tense/relaxed/dramatic/neutral (EXTENDED ASUMSI). UI flow indicator |
| Schema | `scenes` table: +6 fields (4 transition + 2 EXTENDED ASUMSI: scene_pacing, scene_mood) |
| Prompt | Instruksi: action=cut, time passage=dissolve, chapter end=fade_to_black, dream=fade_to_white, location change=wipe, visual continuity=match_cut |
| Transition types | cut (0ms), dissolve (500-2000ms), fade_to_black (1000-3000ms), fade_to_white (1000-3000ms), wipe (500-1000ms), match_cut (0ms) |
| Sitasi | `RAG-CONTEXT S5.3-5.4`, `BRD S6.2` |

### F-V3-03: Complex Image Prompts (FR-V3-03)

| Field | Detail |
|---|---|
| Input | LLM generate output JSON per image prompt |
| Proses | (a) promptText tetap single string. (b) Enhance prompt-builder.ts — 8-layer formula. (c) Extend image_prompts: +composition (EXTENDED ASUMSI), +lighting (EXTENDED ASUMSI), +camera (EXTENDED ASUMSI), +moodAtmosphere, +styleReferences. (d) UI: section labels collapsible |
| Output | Setiap prompt mengandung 8 layer terstruktur + 5 metadata fields |
| Acceptance | Minimal 6 dari 8 layer: subject, composition, camera, lighting, color, mood, style, technical. Metadata: composition (deskripsi komposisi visual), lighting (deskripsi pencahayaan), camera (tipe shot/kamera), moodAtmosphere, styleReferences |
| Schema | `image_prompts.promptText` tetap. +5 fields (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera) + moodAtmosphere + styleReferences |
| Prompt | Formula: [Subject]+[Composition]+[Camera]+[Lighting]+[Color]+[Mood]+[Style]+[Technical] |
| Sitasi | `RAG-CONTEXT S6.1-6.4`, `BRD S6.3` |

### F-V3-04: Voiceover Voice Type Spec (FR-V3-04)

| Field | Detail |
|---|---|
| Input | LLM generate output JSON per scene |
| Proses | (a) Extend `scenes`: +voiceType, +voiceEmotion, +voiceSpeed, +voicePitch. (b) Extend Zod SceneSchema. (c) Enhance prompt-builder.ts. (d) UI: voice type selector per scene |
| Output | Setiap scene punya 4 field voice |
| Acceptance | VoiceType: child/teen/adult_male/adult_female/elderly_male/elderly_female/narrator. Emotion: neutral/happy/sad/excited/calm/dramatic. Speed: 0.5-2.0 (default 1.0). Pitch: low/medium/high/auto |
| Schema | `scenes` table: +4 fields (additive) |
| Prompt | Instruksi: pilih voiceType berdasarkan karakter. Emotion sesuai konteks adegan |
| Sitasi | `RAG-CONTEXT S7.1-7.3`, `BRD S6.4` |

### F-V3-05: Supporting Audio Spec (FR-V3-05)

| Field | Detail |
|---|---|
| Input | LLM generate output JSON per scene |
| Proses | (a) New table scene_audio (19 fields: 7 core + 12 EXTENDED ASUMSI). (b) New Zod SceneAudioSchema. (c) +durationSeconds di scenes. (d) Enhance prompt-builder.ts. (e) API route scene_audio CRUD. (f) UI: audio panel per scene |
| Output | Setiap scene punya minimal 1 audio cue dengan metadata lengkap |
| Acceptance | AudioType: background_music/sfx/ambient/music_cue/transition_audio. Timing: start/throughout/end/specific_moment. Volume 0.0-1.0. EXTENDED ASUMSI fields: music_genre (text), music_mood (text), music_tempo_bpm (integer), music_instruments (text), music_volume (real), sfx_list (text), ambient_type (text), ambient_volume (real), music_key (text), rhythm_pattern (text), spatial_audio (boolean), audio_tags (text) |
| Schema | New table scene_audio (19 fields) + scenes: +durationSeconds |
| Prompt | Instruksi: generate minimal 1 audio cue per scene (background_music atau ambient atau sfx) |
| Sitasi | `RAG-CONTEXT S8.1-8.3`, `BRD S6.5` |

### F-V3-06: Schema Migration (FR-V3-06)

| Field | Detail |
|---|---|
| Proses | (a) drizzle-kit generate. (b) drizzle-kit push ke Turso. (c) Backfill script V2→V3 defaults. (d) Rollback tested |
| Acceptance | Migration success di staging. Dry-run 100% data retained. Rollback tested. Tidak drop kolom V2 |
| Sitasi | `RAG-CONTEXT S3.3`, `BRD SCOPE-03..07` |

### F-V3-07: Prompt Builder Enhancement (FR-V3-07)

| Field | Detail |
|---|---|
| Proses | Extend buildSystemPrompt() + buildUserMessage() dengan instruksi 5 metadata |
| Acceptance | LLM generate 5 metadata konsisten (>= 90%/field). Zod validation pass. Fallback defaults |
| Files | `src/lib/ai/prompt-builder.ts:71-97,100-126` |
| Sitasi | `RAG-CONTEXT S4.1-4.3`, `BRD SCOPE-08,09` |

### F-V3-08: Zod Schema Extension (FR-V3-08)

| Field | Detail |
|---|---|
| Proses | Extend SceneSchema (+10 field: 8 core + 2 EXTENDED ASUMSI), ImagePromptItemSchema (+5 field), new SceneAudioSchema (19 field), update ProjectResultSchema |
| Acceptance | `pnpm typecheck` 0 error. Semua field V3 tervalidasi |
| Files | `src/lib/validation/schemas.ts:16-32` |
| Sitasi | `RAG-CONTEXT S4.1` |

### F-V3-09: Export Extension (FR-V3-09)

| Field | Detail |
|---|---|
| Proses | Extend JSON export + Markdown template untuk V3 metadata sections |
| Acceptance | JSON: scenes[].transitionType, scenes[].voiceType, scenes[].audio[], image_prompts[].promptText (structured). Markdown: section headers |
| Files | `src/lib/export/markdown.template.ts`, export route |
| Sitasi | `BRD SCOPE-15` |

### F-V3-10: i18n V3 Keys (FR-V3-10)

| Field | Detail |
|---|---|
| Proses | Tambah keys di messages/id.json + en.json untuk theme, transition (6 types), voice (7 types + 6 emotions + 3 pitch), audio (5 categories + timing), image layers (8 labels) |
| Acceptance | ID+EN sinkron. Semua V3 UI text via useTranslations(). Tidak hardcoded |
| Sitasi | `RAG-CONTEXT S4.5`, `BRD SCOPE-16` |

### F-V3-11: V2→V3 Migration Script (FR-V3-11)

| Field | Detail |
|---|---|
| Proses | Backfill: transitionType=cut, voiceType=narrator, no audio. durationSeconds estimated. Dry-run mode. Rollback |
| Acceptance | Success rate >= 95%. 100% data retained. Rollback tested |
| Sitasi | `BRD SCOPE-17`, KPI-V3-08 |

### F-V3-12: Analytics V3 Events (FR-V3-12)

| Field | Detail |
|---|---|
| Proses | Track: theme_change, scene_transition_generated, voice_type_assigned, audio_spec_generated, image_prompt_layers_count |
| Acceptance | Events fired. No PII. KPI V3 measurable |
| Sitasi | `BRD SCOPE-18`, KPI-V3-01..10 |

---

## 5. Non-Functional Requirement (V3 Update)

### 5.1 Performa

| ID | Kriteria | Target | Sumber |
|---|---|---|---|
| NFR-V3-P01 | Lighthouse Performance mobile | >= 85 | BRD LIM-V3-06 |
| NFR-V3-P02 | LCP | <= 2.5s | BRD KPI-09 |
| NFR-V3-P03 | CLS | <= 0.1 | BRD KPI-10 |
| NFR-V3-P04 | Bundle tambahan V3 | <= +20KB gzipped | BRD RISK-15 |
| NFR-V3-P05 | next-themes size | ~2KB gzipped | ASM-1 |
| NFR-V3-P06 | LLM response time | <= 30s (sama V2) | ASUMSI |
| NFR-V3-P07 | Migration execution time | <= 5s per project | ASUMSI |

### 5.2 Keamanan

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-V3-S01 | Schema migration additive only | Tidak drop kolom V2 | BRD LIM-V3-01 |
| NFR-V3-S02 | LLM provider multi | Tidak lock 1 provider | BRD LIM-V3-02 |
| NFR-V3-S03 | V2 codebase tidak break | V3 = additive | BRD LIM-V3-03 |
| NFR-V3-S04 | No heavy library tambahan | Bundle impact minimal | BRD LIM-V3-07 |
| NFR-V3-S05 | Audio spec free-to-use | Tidak referensi konten berlisensi | BRD LIM-V3-10 |
| NFR-V3-S06 | Voice prompt tidak bias | Ethics review | BRD LIM-V3-11 |

### 5.3 Aksesibilitas

| ID | Kriteria | Target | Sumber |
|---|---|---|---|
| NFR-V3-A01 | WCAG compliance | 2.1 AA light + dark mode | BRD DoD V3 |
| NFR-V3-A02 | Kontras light mode | >= 4.5:1 body | BRD RISK-V3-06 |
| NFR-V3-A03 | Theme toggle keyboard | Focus ring visible | Best practice |
| NFR-V3-A04 | Screen reader | ARIA labels untuk transition/voice/audio | ASUMSI |

### 5.4 UX/Desain

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-V3-U01 | Design tokens semantic | Pakai primary/background, bukan hardcoded hex | BRD LIM-V3-05 |
| NFR-V3-U02 | Light theme bukan inverted dark | Design ulang palette | BRD LIM-V3-12 |
| NFR-V3-U03 | Undo/redo edit metadata | Semua 5 fitur | BRD LIM-V3-08 |
| NFR-V3-U04 | Export JSON + MD | Tambah format baru | BRD LIM-V3-09 |
| NFR-V3-U05 | No FOUC theme switch | next-themes blocking script | BRD RISK-V3-01 |

### 5.5 i18n

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-V3-I01 | Dwibahasa | ID + EN paralel | BRD LIM-V3-04 |
| NFR-V3-I02 | Semua V3 UI text via i18n | Tidak hardcoded | Best practice |
| NFR-V3-I03 | Voice type bilingual | child/anak, narrator/narator | ASUMSI |

### 5.6 Maintainability

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-V3-M01 | TypeScript strict | No any | AGENTS.md L06 |
| NFR-V3-M02 | Lint + Typecheck | 0 error | AGENTS.md |
| NFR-V3-M03 | Conventional commit | feat(v3): ... atomic | BRD DoD V3 |
| NFR-V3-M04 | No direct push main | Via PR + review | AGENTS.md L20 |
| NFR-V3-M05 | Rollback plan | Migration reversible | BRD LIM-V3-13 |

---

## 6. Acceptance Criteria per Fitur

### AC-V3-01: Light Theme Support
- [ ] next-themes terinstall
- [ ] ThemeProvider di providers.tsx dengan attribute class
- [ ] Hardcoded className="dark" removed dari layout.tsx:66
- [ ] <div className="dark"> removed dari page.tsx:24
- [ ] ThemeToggle component di app-header.tsx (3 mode: light/dark/system)
- [ ] Default = dark
- [ ] Persist di localStorage
- [ ] System preference detected via prefers-color-scheme
- [ ] No FOUC saat first load
- [ ] shadcn/ui render sempurna di light mode
- [ ] provider-card.tsx:88 hardcoded dark: variants removed
- [ ] WCAG 2.1 AA kontras light + dark
- [ ] i18n keys lengkap ID+EN
- [ ] Analytics event theme_change fired

### AC-V3-02: Scene Transition Flow Engine
- [ ] scenes table: +6 fields (4 transition + 2 EXTENDED ASUMSI: scene_pacing, scene_mood)
- [ ] Zod SceneSchema extended dengan 4 field enum validated + scene_pacing + scene_mood
- [ ] prompt-builder.ts generate transition dari enum
- [ ] Default = cut, 0ms, linear, forward
- [ ] scene_pacing: fast/medium/slow (EXTENDED ASUMSI, default medium)
- [ ] scene_mood: tense/relaxed/dramatic/neutral (EXTENDED ASUMSI, default neutral)
- [ ] Save handler route.ts:156-164 persist 6 field baru
- [ ] UI: visual flow indicator antar scene cards
- [ ] Export JSON: scenes[].transitionType/DurationMs/Easing/Direction/scene_pacing/scene_mood
- [ ] Export Markdown: section Scene Transitions dengan table
- [ ] i18n keys untuk 6 transition types + pacing + mood (ID+EN)
- [ ] Analytics event scene_transition_generated fired

### AC-V3-03: Complex Image Prompts
- [ ] prompt-builder.ts generate 8-layer formula
- [ ] Minimal 6 dari 8 layer terisi per prompt
- [ ] Layer: subject, composition, camera, lighting, color, mood, style, technical
- [ ] image_prompts: +5 fields (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera)
- [ ] composition: deskripsi komposisi visual (EXTENDED ASUMSI)
- [ ] lighting: deskripsi pencahayaan (EXTENDED ASUMSI)
- [ ] camera: tipe shot/kamera (EXTENDED ASUMSI)
- [ ] UI: display dengan section labels (collapsible)
- [ ] Copy per-section tersedia
- [ ] Export JSON: image_prompts[].promptText structured + composition/lighting/camera
- [ ] Export Markdown: section Image Prompt Layers
- [ ] i18n keys untuk 8 layer labels + composition/lighting/camera (ID+EN)
- [ ] Analytics event image_prompt_layers_count fired

### AC-V3-04: Voiceover Voice Type Spec
- [ ] scenes table: +4 fields (additive)
- [ ] Zod SceneSchema extended
- [ ] prompt-builder.ts generate voice type dari 7 enum
- [ ] Default = narrator, neutral, 1.0, auto
- [ ] Save handler persist 4 field
- [ ] UI: voice type selector per scene (dropdown)
- [ ] Export JSON: scenes[].voiceType/Emotion/Speed/Pitch
- [ ] Export Markdown: section Voice Specifications
- [ ] i18n keys untuk 7 voice types + 6 emotions + 3 pitch (ID+EN)
- [ ] Analytics event voice_type_assigned fired

### AC-V3-05: Supporting Audio Spec
- [ ] New table scene_audio (19 fields: 7 core + 12 EXTENDED ASUMSI) — additive migration
- [ ] New Zod SceneAudioSchema validated (19 fields)
- [ ] scenes: +durationSeconds (integer)
- [ ] prompt-builder.ts generate minimal 1 audio cue per scene
- [ ] AudioType: 5 enum
- [ ] Core fields: audioType, description, timing, durationSeconds, volume, fadeInMs, fadeOutMs
- [ ] EXTENDED ASUMSI fields: music_genre, music_mood, music_tempo_bpm, music_instruments, music_volume, sfx_list, ambient_type, ambient_volume, music_key, rhythm_pattern, spatial_audio, audio_tags
- [ ] UI: audio panel per scene (CRUD)
- [ ] API route: CRUD scene_audio
- [ ] Export JSON: scenes[].audio[] array (19 fields)
- [ ] Export Markdown: section Audio Specifications
- [ ] i18n keys untuk 5 audio categories + timing + extended fields (ID+EN)
- [ ] Analytics event audio_spec_generated fired

### AC-V3-06: Schema Migration
- [ ] 1 migration file generated via drizzle-kit generate
- [ ] Migration push ke Turso sukses
- [ ] Dry-run: 100% V2 data retained
- [ ] Backfill script: V2 scenes → V3 defaults
- [ ] Rollback plan tested
- [ ] Tidak drop kolom V2

### AC-V3-07: Prompt Builder Enhancement
- [ ] buildSystemPrompt() extended 5 instruksi metadata
- [ ] LLM generate 5 metadata konsisten (>= 90%/field)
- [ ] Zod validation pass
- [ ] Fallback default values
- [ ] Token usage monitor (biaya naik <= 50%)

### AC-V3-08: Zod Schema Extension
- [ ] SceneSchema +10 field (8 core + 2 EXTENDED ASUMSI)
- [ ] ImagePromptItemSchema extended (opsional)
- [ ] SceneAudioSchema created
- [ ] ProjectResultSchema updated
- [ ] pnpm typecheck 0 error

### AC-V3-09: Export Extension
- [ ] JSON export: transition, voice, audio, image layers per scene
- [ ] Markdown: section headers
- [ ] Backward compatible V2 format

### AC-V3-10: i18n V3 Keys
- [ ] messages/id.json: V3 keys
- [ ] messages/en.json: V3 keys paralel
- [ ] ID+EN sinkron
- [ ] Semua V3 UI text via useTranslations()

### AC-V3-11: V2→V3 Migration
- [ ] Backfill V3 defaults
- [ ] Dry-run mode
- [ ] Rollback
- [ ] Success rate >= 95%

### AC-V3-12: Analytics V3
- [ ] 5 event fired: theme_change, scene_transition_generated, voice_type_assigned, audio_spec_generated, image_prompt_layers_count
- [ ] No PII

### AC-V3-13: Quality Gates
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] Bundle size <= +20KB gzipped
- [ ] axe-core: 0 critical (light+dark)
- [ ] WCAG 2.1 AA
- [ ] Conventional commit feat(v3): per fitur (5 atomic)
- [ ] PR reviewed + merged
- [ ] Preview deploy Vercel sukses
- [ ] V2 dry-run: 100% retained

---

## 7. Spesifikasi Deliverable Konkret

### 7.1 File Changes

| Path | Tipe | Deskripsi | Fitur |
|---|---|---|---|
| `src/lib/db/schema.ts` | MODIFY | +11 fields scenes + new table scene_audio | F-V3-02,04,05 |
| `src/lib/validation/schemas.ts` | MODIFY | Extend SceneSchema, ImagePromptItemSchema, new SceneAudioSchema | F-V3-08 |
| `src/lib/ai/prompt-builder.ts` | MODIFY | Enhance buildSystemPrompt() + buildUserMessage() | F-V3-07 |
| `src/app/api/v1/generate/route.ts` | MODIFY | Persist V3 fields saat save scene | F-V3-02,04,05 |
| `src/app/api/v1/projects/[id]/export/route.ts` | MODIFY | Extend export V3 metadata | F-V3-09 |
| `src/lib/export/markdown.template.ts` | MODIFY | Extend template V3 sections | F-V3-09 |
| `src/components/providers.tsx` | MODIFY | Add ThemeProvider | F-V3-01 |
| `src/app/layout.tsx` | MODIFY | Remove hardcoded className="dark" | F-V3-01 |
| `src/app/[locale]/page.tsx` | MODIFY | Remove <div className="dark"> | F-V3-01 |
| `src/components/common/app-header.tsx` | MODIFY | Add ThemeToggle | F-V3-01 |
| `src/components/settings/provider-card.tsx` | MODIFY | Remove hardcoded dark: variants | F-V3-01 |
| `src/components/common/theme-toggle.tsx` | NEW | Theme toggle component | F-V3-01 |
| `src/components/generate/scene-transition-card.tsx` | NEW | Scene card + transition flow | F-V3-02 |
| `src/components/generate/voice-type-selector.tsx` | NEW | Voice type dropdown | F-V3-04 |
| `src/components/generate/audio-panel.tsx` | NEW | Audio panel CRUD | F-V3-05 |
| `src/components/generate/image-prompt-display.tsx` | NEW | Image prompt section labels | F-V3-03 |
| `src/lib/db/repositories/scene-audio.repository.ts` | NEW | CRUD scene_audio | F-V3-05 |
| `src/app/api/v1/projects/[id]/scenes/[sceneId]/audio/route.ts` | NEW | API scene_audio CRUD | F-V3-05 |
| `src/lib/migration/v2-to-v3.ts` | NEW | Migration script | F-V3-11 |
| `messages/id.json` | MODIFY | V3 keys (theme, transition, voice, audio, image) | F-V3-10 |
| `messages/en.json` | MODIFY | V3 keys paralel | F-V3-10 |
| `drizzle/0001_v3_core_features.sql` | NEW | Migration file additive | F-V3-06 |
| `package.json` | MODIFY | +next-themes | F-V3-01 |

### 7.2 DB Schema Changes (Additive Only)

**scenes table — +11 fields (9 core + 2 EXTENDED ASUMSI):**

| Field | Type | Default | Fitur |
|---|---|---|---|
| `transitionType` | text | 'cut' | F-V3-02 |
| `transitionDurationMs` | integer | 0 | F-V3-02 |
| `transitionEasing` | text | 'linear' | F-V3-02 |
| `transitionDirection` | text | 'forward' | F-V3-02 |
| `voiceType` | text | 'narrator' | F-V3-04 |
| `voiceEmotion` | text | 'neutral' | F-V3-04 |
| `voiceSpeed` | real | 1.0 | F-V3-04 |
| `voicePitch` | text | 'auto' | F-V3-04 |
| `durationSeconds` | integer | NULL | F-V3-05 |
| `scene_pacing` | text | 'medium' | F-V3-02 (EXTENDED ASUMSI) |
| `scene_mood` | text | 'neutral' | F-V3-02 (EXTENDED ASUMSI) |

**New table scene_audio — 19 fields (7 core + 12 EXTENDED ASUMSI):**

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | text (UUID) | auto | PK |
| `projectId` | text | — | FK projects.id |
| `sceneId` | text | — | FK scenes.id |
| `audioType` | text | — | enum: 5 types (core) |
| `description` | text | — | deskripsi audio (core) |
| `timing` | text | 'throughout' | enum: 4 options (core) |
| `durationSeconds` | integer | NULL | durasi detik (core) |
| `volume` | real | 0.7 | 0.0-1.0 (core) |
| `fadeInMs` | integer | 0 | fade in ms (core) |
| `fadeOutMs` | integer | 0 | fade out ms (core) |
| `music_genre` | text | NULL | EXTENDED ASUMSI |
| `music_mood` | text | NULL | EXTENDED ASUMSI |
| `music_tempo_bpm` | integer | NULL | EXTENDED ASUMSI |
| `music_instruments` | text | NULL | EXTENDED ASUMSI |
| `music_volume` | real | NULL | EXTENDED ASUMSI |
| `sfx_list` | text | NULL | EXTENDED ASUMSI |
| `ambient_type` | text | NULL | EXTENDED ASUMSI |
| `ambient_volume` | real | NULL | EXTENDED ASUMSI |
| `created_at` | timestamp | now() | audit |

**image_prompts table — +5 fields (2 core + 3 EXTENDED ASUMSI):**

| Field | Type | Default | Fitur |
|---|---|---|---|
| `moodAtmosphere` | text | NULL | F-V3-03 |
| `styleReferences` | text | NULL | F-V3-03 |
| `composition` | text | NULL | F-V3-03 (EXTENDED ASUMSI) |
| `lighting` | text | NULL | F-V3-03 (EXTENDED ASUMSI) |
| `camera` | text | NULL | F-V3-03 (EXTENDED ASUMSI) |

### 7.3 Prompt Builder Changes

**System prompt additions (`prompt-builder.ts:71-97`):**

JSON schema output tambah:
- scenes[].transitionType: enum (cut/dissolve/fade_to_black/fade_to_white/wipe/match_cut)
- scenes[].transitionDurationMs: integer
- scenes[].transitionEasing: enum (linear/ease_in/ease_out/ease_in_out)
- scenes[].transitionDirection: enum (forward/backward/loop)
- scenes[].scene_pacing: enum (fast/medium/slow) (EXTENDED ASUMSI)
- scenes[].scene_mood: enum (tense/relaxed/dramatic/neutral) (EXTENDED ASUMSI)
- scenes[].voiceType: enum (child/teen/adult_male/adult_female/elderly_male/elderly_female/narrator)
- scenes[].voiceEmotion: enum (neutral/happy/sad/excited/calm/dramatic)
- scenes[].voiceSpeed: float (0.5-2.0)
- scenes[].voicePitch: enum (low/medium/high/auto)
- scenes[].durationSeconds: integer
- scenes[].audio[]: array of {audioType, description, timing, durationSeconds, volume, fadeInMs, fadeOutMs, music_genre, music_mood, music_tempo_bpm, music_instruments, music_volume, sfx_list, ambient_type, ambient_volume}
- image_prompts[].promptText: structured 8-layer (bukan 1 baris)
- image_prompts[].composition: text (EXTENDED ASUMSI)
- image_prompts[].lighting: text (EXTENDED ASUMSI)
- image_prompts[].camera: text (EXTENDED ASUMSI)

Instruksi baru:
1. Transition: action=cut, time passage=dissolve, chapter end=fade_to_black, dream=fade_to_white, location change=wipe, visual continuity=match_cut
2. Voice: pilih berdasarkan karakter yang berbicara
3. Audio: minimal 1 audio cue per scene
4. Image prompt: formula 8-layer
5. Duration: estimate per-scene dari dialogue length

### 7.4 Zod Schema Changes

**SceneSchema extended:**
```
// Existing retained
order, description, voiceover_script, image_prompts

// V3 additions
transitionType: z.enum(['cut','dissolve','fade_to_black','fade_to_white','wipe','match_cut']).default('cut')
transitionDurationMs: z.number().default(0)
transitionEasing: z.enum(['linear','ease_in','ease_out','ease_in_out']).default('linear')
transitionDirection: z.enum(['forward','backward','loop']).default('forward')
scene_pacing: z.enum(['fast','medium','slow']).default('medium')  // EXTENDED ASUMSI
scene_mood: z.enum(['tense','relaxed','dramatic','neutral']).default('neutral')  // EXTENDED ASUMSI
voiceType: z.enum(['child','teen','adult_male','adult_female','elderly_male','elderly_female','narrator']).default('narrator')
voiceEmotion: z.enum(['neutral','happy','sad','excited','calm','dramatic']).default('neutral')
voiceSpeed: z.number().min(0.5).max(2.0).default(1.0)
voicePitch: z.enum(['low','medium','high','auto']).default('auto')
durationSeconds: z.number().optional()
audio: z.array(SceneAudioSchema).optional()
```

**SceneAudioSchema (new — 19 fields: 7 core + 12 EXTENDED ASUMSI):**
```
// Core fields
audioType: z.enum(['background_music','sfx','ambient','music_cue','transition_audio'])
description: z.string()
timing: z.enum(['start','throughout','end','specific_moment']).default('throughout')
durationSeconds: z.number().optional()
volume: z.number().min(0).max(1).default(0.7)
fadeInMs: z.number().default(0)
fadeOutMs: z.number().default(0)

// EXTENDED ASUMSI fields
music_genre: z.string().optional()
music_mood: z.string().optional()
music_tempo_bpm: z.number().optional()
music_instruments: z.string().optional()
music_volume: z.number().min(0).max(1).optional()
sfx_list: z.string().optional()
ambient_type: z.string().optional()
ambient_volume: z.number().min(0).max(1).optional()
music_key: z.string().optional()
rhythm_pattern: z.string().optional()
spatial_audio: z.boolean().optional()
audio_tags: z.string().optional()
```

---

## 8. Out of Scope Eksplisit (V3)

| ID | Item | Alasan | Sumber |
|---|---|---|---|
| OOS-V3-01 | Audio generation actual | Spec only, bukan file — V4 | BRD OOS-V3-01 |
| OOS-V3-02 | TTS engine actual | Spec only — V4 | BRD OOS-V3-02 |
| OOS-V3-03 | Image generation actual | PromptFlow = prompt engine | BRD OOS-V3-03 |
| OOS-V3-04 | Video assembly actual | PromptFlow = prompt engine | BRD OOS-V3-04 |
| OOS-V3-05 | Custom voice cloning | Butuh consent + legal — V5 | BRD OOS-V3-05 |
| OOS-V3-06 | Audio waveform preview | Butuh audio file — V4 | BRD OOS-V3-06 |
| OOS-V3-07 | A/B testing infrastructure | Cukup Vercel Analytics | BRD OOS-V3-07 |
| OOS-V3-08 | Negative prompt | V4 — user feedback dulu | BRD OOS-V3-08 |
| OOS-V3-09 | Multi-language voice | Fokus Indonesia — V5 | BRD OOS-V3-09 |
| OOS-V3-10 | Prompt builder refactor | Cukup V3 — refactor V5 | BRD OOS-V3-10 |
| OOS-V3-11 | Mobile app | Web-only V3 | BRD OOS-V3-11 |
| OOS-V3-12 | Pricing changes | Tidak ada pricing V2 — V4 | BRD OOS-V3-12 |
| OOS-V3-13 | Audio template presets | V4 — post user feedback | BRD RISK-V3-07 |
| OOS-V3-14 | Complexity toggle | V4 — post user feedback | BRD RISK-V3-09 |

---

## 9. Asumsi Produk (V3)

| ID | Asumsi | Alasan | Dampak bila Salah | Sumber |
|---|---|---|---|---|
| PRD-V3-A01 | Theme toggle pakai next-themes | Standard, zero-config shadcn/ui | Custom solution complex | RAG-CONTEXT ASM-1 |
| PRD-V3-A02 | Transition = field di scenes table | Simple, cukup MVP | Perlu new table | RAG-CONTEXT ASM-2 |
| PRD-V3-A03 | Image prompts = enhance prompt builder | promptText tetap single string | Schema extension besar | RAG-CONTEXT ASM-3 |
| PRD-V3-A04 | Voice type = field di scenes table | Simple, cukup MVP | Perlu new table | RAG-CONTEXT ASM-4 |
| PRD-V3-A05 | Audio = new table scene_audio | Multiple audio per scene | Single field tidak cukup | RAG-CONTEXT ASM-5 |
| PRD-V3-A06 | 1 schema migration untuk semua | Drizzle additive | Multiple migration | RAG-CONTEXT ASM-6 |
| PRD-V3-A07 | Export tetap JSON + MD | Tidak ada requirement baru | Perlu format baru | RAG-CONTEXT ASM-7 |
| PRD-V3-A08 | 7 voice types cukup MVP | Cover 80% use case ID | V4 extend cepat | RAG-CONTEXT ASM-8 |
| PRD-V3-A09 | 6 transition types cukup MVP | Cover 95% use cases | V4 extend | RAG-CONTEXT ASM-9 |
| PRD-V3-A10 | 5 audio categories cukup MVP | Cover basic needs | V4 extend | RAG-CONTEXT ASM-10 |
| PRD-V3-A11 | LLM generate metadata konsisten | V1 sudah pakai LLM | Output random | BRD ASM-B-V3-04 |
| PRD-V3-A12 | User V2 mau update ke V3 | 5 fitur additive | Churn | BRD ASM-B-V3-05 |
| PRD-V3-A13 | Spec > actual audio file (MVP) | Spec portable, file lock-in | V4 tambah audio gen | BRD ASM-B-V3-06 |
| PRD-V3-A14 | Migration additive only | Drizzle additive | Data loss | BRD ASM-B-V3-07 |
| PRD-V3-A15 | Biaya LLM naik <= 50% | Prompt optimize | Margin turun | BRD ASM-B-V3-08 |
| PRD-V3-A16 | User Indonesia dominan | Persona Rian + Bu Sinta | Pasar EN kurang | BRD ASM-B-V3-09 |
| PRD-V3-A17 | 5 fitur = 1 sprint (2-3 minggu) | Effort manageable | Timeline molor | BRD ASM-B-V3-10 |
| PRD-V3-A18 | V3 = spec only, bukan actual generation | PromptFlow = prompt engine | User expect 1-click video | MRD S7.3 |

---

## Lampiran A — Cross-Reference

| Topik | Sumber Utama | Pendukung |
|---|---|---|
| Value Proposition | MRD S5.2 | BRD S3.2 |
| Personas | MRD S3.1-3.2 | BRD S5 |
| KPI | BRD S4.2 | MRD S8.1 |
| Schema Gaps | RAG-CONTEXT S3.2 | BRD S2.3 |
| Prompt Gaps | RAG-CONTEXT S4.3 | BRD S2.3 |
| Transition | RAG-CONTEXT S5.3, S10.1 | BRD S6.2 |
| Image Prompt | RAG-CONTEXT S6.3, S10.2 | BRD S6.3 |
| Voice Types | RAG-CONTEXT S7.2, S10.3 | BRD S6.4 |
| Audio | RAG-CONTEXT S8.2, S10.4 | BRD S6.5 |
| Theme | RAG-CONTEXT S9.1-9.3 | BRD S6.1 |
| Competitive | MRD S4.1-4.3 | BRD S3.1 |
| Risk | BRD S9 | RAG-CONTEXT S11 |
| Tech Constraint | BRD LIM-V3-01..13 | AGENTS.md |

---

## Lampiran B — Definition of Done (V3)

- [ ] Light theme toggle berfungsi + persist + system preference
- [ ] Hardcoded dark class removed dari layout.tsx + page.tsx
- [ ] Schema migration additive: +11 fields scenes + new table scene_audio
- [ ] Prompt builder enhanced 5 metadata
- [ ] Zod schema extended + validated
- [ ] UI: transition flow, voice selector, audio panel, image prompt labels
- [ ] Export JSON + Markdown termasuk V3 metadata
- [ ] i18n ID+EN sinkron semua V3
- [ ] V2→V3 migration tested (dry-run + reversible)
- [ ] In-app changelog banner V2 user
- [ ] Landing page copy updated
- [ ] 5 analytics event V3 wired
- [ ] Lighthouse Performance >= 85
- [ ] Bundle <= +20KB gzipped
- [ ] pnpm lint 0 + typecheck 0 + build pass
- [ ] WCAG 2.1 AA light + dark
- [ ] V2 dry-run: 100% retained
- [ ] Conventional commit feat(v3): per fitur (5 atomic)
- [ ] PR reviewed + merged
- [ ] Preview deploy Vercel sukses

---

> **Dokumen ini = kontrak produk V3 untuk 5 fitur inti PromptFlow. Eksekutor baca PRD + BRD V3 + MRD V3 + RAG-CONTEXT + AGENTS.md. Semua klaim bersitasi. Klaim tanpa bukti = ASUMSI (ditandai di S9). Acceptance criteria S6 = quality gate sebelum merge.**

**Dibuat oleh:** docgen-prd subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Update)
