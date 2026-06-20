# SRS — Software Requirement Specification
## PromptFlow V3 — Core Feature Expansion

> **Versi:** 2.0 (V3 Update)
> **Tanggal:** 2026-06-21
> **Status:** Draft untuk review
> **Deliverable:** 5 fitur inti V3 — Light Theme Support, Scene Transition Flow Engine, Complex Image Prompts (8 layer), Voiceover Voice Type Spec, Supporting Audio Spec
> **Builds on:** V1 (workflow engine, deployed) + V2 (landing page, in production)
> **Selaras:** BRD.md v2.0 (why) + MRD.md v2.0 (who) + PRD.md v2.0 (what)
> **Rujukan kebenaran faktual:** `product-docs/RAG-CONTEXT.md` (refresh 2026-06-21)
> **Format reference:** `product-docs/SRS.md` v1.0 (landing page)

---

## Daftar Isi

1. [Tech Stack & Justifikasi](#1-tech-stack--justifikasi)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Spesifikasi Fungsional Detail](#3-spesifikasi-fungsional-detail)
4. [Data Model](#4-data-model)
5. [Interface / API / Integrasi](#5-interface--api--integrasi)
6. [File Format & Path](#6-file-format--path)
7. [Tahapan Implementasi](#7-tahapan-implementasi)
8. [Verifikasi & Pengujian](#8-verifikasi--pengujian)
9. [Constraint Teknis](#9-constraint-teknis)
10. [Lampiran](#lampiran)

---

## 1. Tech Stack & Justifikasi

### 1.1 Stack Existing (V1+V2, Retained)

| Lapisan | Teknologi | Versi | Justifikasi | Sitasi |
|---|---|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 | Retained V1+V2 | `package.json:50` |
| UI Library | React + ReactDOM | ^19.0.0 | Retained | `package.json:52-53` |
| Styling | Tailwind CSS v4 | ^4.0.0 | Retained, design token ada | `package.json:81` |
| UI Components | shadcn/ui (Radix UI) | ^1.1.0 | Retained 12 komponen | `package.json:26-39` |
| ORM | Drizzle ORM | ^0.38.0 | Retained, additive migration | `package.json:47` |
| Database | Turso/libSQL | ^0.14.0 | Retained, dialect turso | `package.json:25` |
| Auth | NextAuth v5 (beta.25) | 5.0.0-beta.25 | Retained | `package.json:51` |
| AI SDK | Vercel AI SDK v4 (`ai`) | ^4.0.0 | Retained — JANGAN upgrade v6 | `package.json:42` |
| AI Provider | `@ai-sdk/openai-compatible` | ^1.0.0 | Retained multi-provider | `package.json:22` |
| Validation | Zod | ^3.24.0 | Retained, extend schema | `package.json:60` |
| i18n | next-intl | ^3.26.0 | Retained ID+EN | `package.json:53` |
| Animation | framer-motion | ^12.40.0 | Retained V2 | `package.json:48` |
| Forms | react-hook-form + resolvers | ^7.54.0 | Retained | `package.json:55` |
| Analytics | @vercel/analytics | latest | Retained V2 | `package.json:41` |
| TypeScript | typescript | ^5.7.0 | Strict mode retained | `package.json` |
| Package Manager | pnpm | 11.7.0 | Retained | `package.json:89` |
| Node | Node.js | >=20.0.0 | Retained | `package.json:86` |

### 1.2 Dependency BARU (V3)

| Package | Versi Target | Size (gzipped) | Alasan Install | Sitasi |
|---|---|---|---|---|
| **next-themes** | ^0.4.4 | ~2KB | Standard theme toggle Next.js 15. Zero-config shadcn/ui. localStorage + system preference built-in. FOUC prevention | `RAG-CONTEXT S9.3, ASM-1`, `PRD FR-V3-01` |

Install: `pnpm add next-themes`

**Total bundle tambahan V3:** ~2KB gzipped. Jauh di bawah NFR-V3-P04 (<= +20KB gzipped). ASM-1.

### 1.3 Dependency YANG TIDAK BOLEH DITAMBAH

| Package | Alasan Dilarang | Sitasi |
|---|---|---|
| AI SDK v6 | Kode V1 pakai v4. Upgrade = breaking | AGENTS.md CRIT-002, BRD LIM-V3-02 |
| GSAP / Anime.js / Motion One | Overkill, framer-motion sudah cukup | BRD LIM-V3-07 |
| Tone.js / Howler.js | Audio SPEC only, BUKAN audio file gen | BRD OOS-V3-01 |
| ElevenLabs SDK | Voice SPEC only, BUKAN TTS gen | BRD OOS-V3-02 |
| Midjourney/DALL-E SDK | Prompt SPEC only, BUKAN image gen | BRD OOS-V3-03 |
| Custom font berbayar | Inter via system-ui cukup | BRD OOS-10 |

---

## 2. Arsitektur Sistem

### 2.1 Component Tree (V3 Update)

```
src/app/[locale]/
  layout.tsx (Server — wrap ThemeProvider + SessionProvider)
    html lang="id" suppressHydrationWarning (no hardcoded className)
  page.tsx (Server — landing, hardcoded dark WRAP REMOVED)
  (workspace)/
    generate/
      generate-form.tsx (Client)
      result-tabs.tsx (Client — display scene+voice+audio+image)
    projects/[id]/
      page.tsx (Server)

src/components/
  providers.tsx (MODIFY — add ThemeProvider + NextThemesProvider)
  common/
    app-header.tsx (MODIFY — add ThemeToggle)
    theme-toggle.tsx (NEW — light/dark/system 3-state)
    changelog-banner.tsx (NEW — V3 in-app changelog)
  settings/
    provider-card.tsx (MODIFY — remove hardcoded dark: :88)
  generate/
    scene-transition-card.tsx (NEW — scene card + transition flow)
    voice-type-selector.tsx (NEW — voice dropdown per scene)
    audio-panel.tsx (NEW — CRUD audio per scene)
    image-prompt-display.tsx (NEW — 8 layer collapsible)

src/lib/
  ai/prompt-builder.ts (MODIFY — extend 5 metadata instructions)
  db/schema.ts (MODIFY — +11 fields scenes + scene_audio 19 fields + +5 image_prompts)
  db/repositories/scene-audio.repository.ts (NEW — CRUD)
  validation/schemas.ts (MODIFY — extend SceneSchema + new SceneAudioSchema)
  export/markdown.template.ts (MODIFY — extend V3 sections)
  analytics/events.ts (MODIFY — add 5 V3 events)
  migration/v2-to-v3.ts (NEW — backfill + dry-run + rollback)

src/app/api/v1/
  generate/route.ts (MODIFY — persist V3 fields)
  projects/[id]/export/route.ts (MODIFY — extend export)
  projects/[id]/scenes/[sceneId]/audio/route.ts (NEW — CRUD)

drizzle/0001_v3_core_features.sql (NEW — additive migration)
messages/id.json, en.json (MODIFY — V3 keys)
```

### 2.2 Reusable Components V3

| Component | Path | Tipe | Fungsi |
|---|---|---|---|
| `ThemeToggle` | `src/components/common/theme-toggle.tsx` | Client | Dropdown 3 state (light/dark/system). Icon Sun/Moon/Monitor |
| `SceneTransitionCard` | `src/components/generate/scene-transition-card.tsx` | Client | Scene + transition flow arrow indicator |
| `VoiceTypeSelector` | `src/components/generate/voice-type-selector.tsx` | Client | Dropdown voice type + emotion + speed slider + pitch |
| `AudioPanel` | `src/components/generate/audio-panel.tsx` | Client | CRUD audio entries per scene |
| `ImagePromptDisplay` | `src/components/generate/image-prompt-display.tsx` | Client | Collapsible 8 layer labels + copy |

### 2.3 Data Flow V3

```
User input form (generate-form.tsx)
  POST /api/v1/generate (route.ts:31)
    buildSystemPrompt() + buildUserMessage() (prompt-builder.ts)
      V3 instructions: transition + voice + audio + 8-layer image
    LLM (multi-provider via @ai-sdk/openai-compatible)
      SSE streaming output JSON
    Zod validation (SceneSchema + SceneAudioSchema)
      Fallback defaults
    Save handler (route.ts:156-164)
      INSERT scenes (+11 V3 fields)
      INSERT scene_audio (batch per audio entry)
      INSERT image_prompts (+2 optional fields)
  result-tabs.tsx (Client — display)
    SceneTransitionCard[] (visual flow)
    VoiceTypeSelector inline
    AudioPanel collapse
    ImagePromptDisplay (8 layer)
  Theme toggle (theme-toggle.tsx)
    next-themes ThemeProvider (class strategy on html)
    localStorage persist via next-themes
    Respect prefers-color-scheme (system mode)
```

### 2.4 State Management V3

| State | Tipe | Lokasi | Keterangan |
|---|---|---|---|
| Theme | next-themes context | Global | ThemeProvider, localStorage |
| Scene transition/voice | Local + DB | result-tabs.tsx | Inline edit, save |
| Audio entries | Local + DB | audio-panel.tsx | CRUD, optimistic update |
| Image prompt sections | Local | image-prompt-display.tsx | Collapsible toggle |
| Locale | next-intl context | Global | ID/EN, retained V2 |

**Tidak ada global state store baru.**

### 2.5 Migration Architecture (V2 to V3)

```
V2 DB (scenes: orderNo, description, voiceoverScript)
  0001_v3_core_features.sql (additive ALTER + CREATE)
  Backfill script v2-to-v3.ts
    For each scene: SET V3 defaults (cut/narrator/etc)
    Dry-run mode: log only
    Rollback: DROP COLUMN + DROP TABLE
  V3 app code reads V3 schema with defaults
    Old projects = V3 defaults (no data loss)
    User can regenerate or edit
```

---

## 3. Spesifikasi Fungsional Detail

### 3.1 F-V3-01: Light Theme Support (FR-V3-01)

| Field | Detail |
|---|---|
| Input | User klik theme toggle di app header atau page load |
| Proses | (a) Install `next-themes`. (b) `providers.tsx`: wrap children dengan `<NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>`. (c) Remove hardcoded `className="dark"` dari `src/app/layout.tsx:66` (C01). (d) Remove `<div className="dark">` dari `src/app/[locale]/page.tsx:24` (C02). (e) `provider-card.tsx:88` — replace hardcoded `dark:bg-green-950` dengan semantic token. (f) Tambah `<ThemeToggle>` di `app-header.tsx` sebelah `LanguageToggle`. (g) `theme-toggle.tsx`: dropdown 3 state pakai `useTheme()` dari next-themes + lucide icons (Sun/Moon/Monitor). (h) `suppressHydrationWarning` di `<html>` |
| Output | App render light/dark/system. Persist localStorage. No FOUC |
| Acceptance | typecheck 0 error. Toggle visible. Persist. System detected. shadcn/ui light mode OK. WCAG AA. Bundle +2KB |
| Schema | N/A (client-side) |
| i18n keys | `common.theme`, `common.themeToggle`, `common.lightMode`, `common.darkMode`, `common.systemMode` |
| Files | `providers.tsx`, `layout.tsx:66`, `page.tsx:24`, `app-header.tsx`, `theme-toggle.tsx` (NEW), `provider-card.tsx:88` |
| Risiko | FOUC (next-themes blocking script). Hardcoded dark: variants (audit + replace) |
| Sitasi | `RAG-CONTEXT S9.1-9.3, ASM-1`, `BRD F-V3-01, RISK-V3-01..03`, `PRD FR-V3-01` |

### 3.2 F-V3-02: Scene Transition Flow Engine (FR-V3-02)

| Field | Detail |
|---|---|
| Input | LLM generate JSON per scene (extended 4 transition field) |
| Proses | (a) `schema.ts:89-99` — extend `scenes`: +transitionType (text, default 'cut'), +transitionDurationMs (integer, default 0), +transitionEasing (text, default 'linear'), +transitionDirection (text, default 'forward'). (b) `schemas.ts:27-32` — extend SceneSchema Zod. (c) `prompt-builder.ts:71-97` — tambah instruksi: action=cut, time passage=dissolve (500-2000ms), chapter end=fade_to_black (1000-3000ms), dream=fade_to_white (1000-3000ms), location=wipe (500-1000ms), visual continuity=match_cut (0ms). (d) `route.ts:156-164` — save handler persist 4 field. (e) `scene-transition-card.tsx` — display scene + transition icon Lucide (Zap/Crossfade/Moon/Sun/ArrowRight/Link) + duration badge. (f) `result-tabs.tsx` — visual flow arrow |
| Output | Setiap scene punya 4 field transition. UI flow indicator |
| Acceptance | Migration additive push sukses. LLM generate enum (>= 90% valid). Default fallback cut/0/linear/forward. UI flow. Export JSON+MD include transition |
| Schema | `scenes` table +4 fields (additive) |
| Types enum | cut, dissolve, fade_to_black, fade_to_white, wipe, match_cut |
| Easing enum | linear, ease_in, ease_out, ease_in_out |
| Direction enum | forward, backward, loop |
| i18n keys | `transition.types.*` (6 ID+EN), `transition.durationLabel`, `easingLabel`, `directionLabel` |
| Files | `schema.ts`, `schemas.ts`, `prompt-builder.ts`, `route.ts:156-164`, `scene-transition-card.tsx` (NEW), `result-tabs.tsx` |
| Risiko | LLM inkonsisten enum (Zod validation + retry). User overwhelmed (default cut + tooltip) |
| Sitasi | `RAG-CONTEXT S5.3-5.4, ASM-2, ASM-9`, `BRD F-V3-02`, `PRD FR-V3-02` |

### 3.3 F-V3-03: Complex Image Prompts (FR-V3-03)

| Field | Detail |
|---|---|
| Input | LLM generate JSON per image prompt (extended 8 layer) |
| Proses | (a) `prompt-builder.ts:9-69` — enhance buildSystemPrompt dengan formula `[Subject]+[Composition]+[Camera]+[Lighting]+[Color]+[Mood]+[Style]+[Technical]`. (b) `buildUserMessage()` extend style-specific modifiers (3D/2D/anime). (c) `schema.ts:102-116` — extend image_prompts: +moodAtmosphere (text, nullable), +styleReferences (text, nullable), +composition (text, nullable, JSON string), +lighting (text, nullable, JSON string), +camera (text, nullable, JSON string). (d) `schemas.ts:16-25` — extend ImagePromptItemSchema. (e) `image-prompt-display.tsx` — collapsible section labels (8 layer). Parse prompt string detect boundaries. Copy per-section |
| Output | Setiap promptText string mengandung 8 layer terstruktur. UI opsional section labels |
| Acceptance | LLM generate minimal 6 dari 8 layer. UI collapsible jalan. Copy per-section. Export JSON promptText backward compat. Markdown section Image Prompt Layers |
| Schema | image_prompts table +5 opsional fields (2 core + 3 extended ASUMSI: composition, lighting, camera). promptText tetap single string |
| 8 Layer | Subject, Composition, Camera, Lighting, Color, Mood, Style, Technical |
| i18n keys | `imagePrompt.layers.*` (8 ID+EN), `copyLayer`, `copyFull` |
| Files | `schema.ts`, `schemas.ts`, `prompt-builder.ts:9-69`, `image-prompt-display.tsx` (NEW), `result-tabs.tsx` |
| Risiko | Token naik (monitor). LLM inkonsisten (Zod + retry). User tidak perlu detail (complexity toggle V4) |
| Sitasi | `RAG-CONTEXT S6.1-6.4, ASM-3`, `BRD F-V3-03`, `PRD FR-V3-03` |

### 3.4 F-V3-04: Voiceover Voice Type Spec (FR-V3-04)

| Field | Detail |
|---|---|
| Input | LLM generate JSON per scene (extended 4 voice field) |
| Proses | (a) `schema.ts:89-99` — extend scenes: +voiceType (text, default narrator), +voiceEmotion (text, default neutral), +voiceSpeed (real, default 1.0), +voicePitch (text, default auto). (b) `schemas.ts:27-32` — extend SceneSchema Zod. (c) `prompt-builder.ts:71-97` — instruksi: pilih voiceType by character role (anak=child, remaja=teen, pria=adult_male, wanita=adult_female, lansia=elderly_male/female, narrator). Emotion by context. Speed 0.5-2.0 default 1.0. Pitch low/medium/high/auto. (d) `route.ts:156-164` — save handler persist 4 field. (e) `voice-type-selector.tsx` — dropdown + emotion + speed slider + pitch dropdown inline per scene |
| Output | Setiap scene 4 field voice. UI selector. Export JSON+MD voice spec |
| Acceptance | Migration push sukses. LLM generate 7 voice + 6 emotion + 4 pitch (>= 90%). Default narrator/neutral/1.0/auto. UI selector. Export |
| Schema | scenes table +4 fields (additive) |
| Voice types | child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator |
| Emotion | neutral, happy, sad, excited, calm, dramatic |
| Speed | float 0.5-2.0 |
| Pitch | low, medium, high, auto |
| i18n keys | `voice.types.*` (7), `voice.emotions.*` (6), `voice.pitch.*` (4), `voice.speedLabel` |
| Files | `schema.ts`, `schemas.ts`, `prompt-builder.ts`, `route.ts:156-164`, `voice-type-selector.tsx` (NEW), `result-tabs.tsx` |
| Risiko | TTS cost (spec only). Voice enum luas (prioritize 3 utama). LLM pilih salah (validation + hint) |
| Sitasi | `RAG-CONTEXT S7.1-7.3, ASM-4, ASM-8`, `BRD F-V3-04`, `PRD FR-V3-04` |

### 3.5 F-V3-05: Supporting Audio Spec (FR-V3-05)

| Field | Detail |
|---|---|
| Input | LLM generate JSON per scene (extended audio[] array) ATAU manual CRUD via audio-panel |
| Proses | (a) `schema.ts` — new table `scene_audio` (19 fields: 7 core + 12 extended ASUMSI, lihat S4.3). (b) `schema.ts:89-99` — extend scenes: +durationSeconds (integer, nullable). (c) `schemas.ts` — new SceneAudioSchema Zod. Extend SceneSchema dengan audio array. (d) `prompt-builder.ts:71-97` — instruksi: minimal 1 audio cue per scene (dramatic=bg_music orchestral, action=sfx, outdoor=ambient, peak=music_cue, transition=transition_audio). (e) `route.ts:156-164` — save handler batch insert ke scene_audio. (f) `scene-audio.repository.ts` CRUD. (g) `audio-panel.tsx` — list + add/edit/delete per scene. (h) `projects/[id]/scenes/[sceneId]/audio/route.ts` — API CRUD. (i) Migration additive CREATE TABLE |
| Output | Setiap scene 0..N audio entries. Minimal 1 cue (LLM). UI panel CRUD. Export JSON+MD audio |
| Acceptance | New table scene_audio created (additive). SceneAudioSchema validated. LLM minimal 1 cue (>= 80% coverage). API CRUD jalan. UI panel CRUD. Export |
| Schema | New scene_audio table (19 fields: 7 core + 12 extended ASUMSI). scenes +durationSeconds |
| Audio types | background_music, sfx, ambient, music_cue, transition_audio |
| Timing | start, throughout, end, specific_moment |
| Volume | float 0.0-1.0 default 0.7 |
| i18n keys | `audio.types.*` (5), `audio.timing.*` (4), `audio.fields.*` (description/volume/fadeIn/fadeOut/addAudio/editAudio/deleteAudio) |
| Files | `schema.ts`, `schemas.ts`, `prompt-builder.ts`, `route.ts:156-164`, `scene-audio.repository.ts` (NEW), `audio-panel.tsx` (NEW), `scenes/[sceneId]/audio/route.ts` (NEW), `result-tabs.tsx` |
| Risiko | User overwhelmed 7 field (template preset V4). Audio cost (spec only). JSON size naik (index sceneId). LLM inkonsisten (Zod + retry) |
| Sitasi | `RAG-CONTEXT S8.1-8.3, ASM-5, ASM-10`, `BRD F-V3-05`, `PRD FR-V3-05` |

### 3.6 F-V3-06: Schema Migration (FR-V3-06)

| Field | Detail |
|---|---|
| Input | V2 DB + V3 schema target |
| Proses | (a) `drizzle/0001_v3_core_features.sql` via `pnpm drizzle-kit generate`. SQL: ALTER scenes ADD COLUMN transition_type TEXT DEFAULT 'cut' NOT NULL (4x); ALTER scenes ADD COLUMN duration_seconds INTEGER; ALTER scenes ADD COLUMN voice_type TEXT DEFAULT 'narrator' NOT NULL (4x); ALTER scenes ADD COLUMN scene_pacing TEXT DEFAULT 'normal' NOT NULL; ALTER scenes ADD COLUMN scene_mood TEXT DEFAULT 'peaceful' NOT NULL; ALTER image_prompts ADD COLUMN mood_atmosphere TEXT; ALTER image_prompts ADD COLUMN style_references TEXT; ALTER image_prompts ADD COLUMN composition TEXT; ALTER image_prompts ADD COLUMN lighting TEXT; ALTER image_prompts ADD COLUMN camera TEXT; CREATE TABLE scene_audio (19 columns + FK + index). (b) `pnpm drizzle-kit push` ke Turso. (c) `v2-to-v3.ts` backfill: SELECT scenes, UPDATE V3 defaults (transitionType=cut, voiceType=narrator, etc). Dry-run mode. (d) Rollback: DROP new columns + DROP TABLE |
| Output | V3 schema applied. V2 data retained + V3 defaults |
| Acceptance | drizzle-kit generate sukses. push sukses staging. Dry-run 100% V2 retained. Idempotent. Rollback tested. Tidak drop kolom V2 |
| Files | `drizzle/0001_v3_core_features.sql` (NEW), `src/lib/migration/v2-to-v3.ts` (NEW) |
| Sitasi | `RAG-CONTEXT S3.3, ASM-6`, `BRD SCOPE-V3-03..07, LIM-V3-01,13`, `PRD FR-V3-06` |

### 3.7 F-V3-07: Prompt Builder Enhancement (FR-V3-07)

| Field | Detail |
|---|---|
| Input | buildSystemPrompt + buildUserMessage existing |
| Proses | Extend kedua function dengan 5 instruksi metadata: (1) Transition rules (action=cut, time=dissolve, dll). (2) 8-layer image formula. (3) Voice type rules (role=voiceType). (4) Audio cue rules (context=audioType). (5) Duration estimation (voiceover length / 15 chars per second). Update JSON schema example. Update consistency rules |
| Output | System prompt dengan 5 instruksi metadata konsisten |
| Acceptance | typecheck 0 error. LLM generate 5 metadata (>= 90%/field via analytics). Zod pass. Fallback defaults. Token monitor (target <= +50%) |
| Files | `src/lib/ai/prompt-builder.ts:71-97,100-126` (MODIFY) |
| Sitasi | `RAG-CONTEXT S4.1-4.3`, `BRD SCOPE-V3-08,09`, `PRD FR-V3-07` |

### 3.8 F-V3-08: Zod Schema Extension (FR-V3-08)

| Field | Detail |
|---|---|
| Input | SceneSchema, ImagePromptItemSchema, ProjectResultSchema existing |
| Proses | Extend SceneSchema dengan 10 field V3 (4 transition + 4 voice + 1 duration + 2 extended ASUMSI: scenePacing, sceneMood). Optional audio array. Extend ImagePromptItemSchema dengan 5 opsional (2 core + 3 extended ASUMSI). New SceneAudioSchema (19 field). Update ProjectResultSchema root |
| Output | Type-safe validation semua V3 field |
| Acceptance | typecheck 0 error. Semua field validated runtime |
| Files | `src/lib/validation/schemas.ts:16-32` (MODIFY) |
| Sitasi | `RAG-CONTEXT S4.1`, `BRD SCOPE-V3-10`, `PRD FR-V3-08` |

### 3.9 F-V3-09: Export Extension (FR-V3-09)

| Field | Detail |
|---|---|
| Input | Project result JSON existing |
| Proses | Extend `markdown.template.ts` dengan section: (1) Scene Transitions — table per scene. (2) Image Prompt Layers — per prompt 8 layer breakdown. (3) Voice Specifications — table per scene. (4) Audio Specifications — table per scene. Extend `export/route.ts` serialize audio entries ke JSON array |
| Output | JSON dengan V3 field. Markdown dengan section V3. Backward compatible V2 |
| Acceptance | JSON scenes[].transitionType/DurationMs/Easing/Direction/VoiceType/Emotion/Speed/Pitch/DurationSeconds/Audio[] muncul. Markdown section baru. V2 backward compat (parse no error) |
| Files | `src/lib/export/markdown.template.ts:41-65` (MODIFY), `src/app/api/v1/projects/[id]/export/route.ts` (MODIFY) |
| Sitasi | `BRD SCOPE-V3-15`, `PRD FR-V3-09` |

### 3.10 F-V3-10: i18n V3 Keys (FR-V3-10)

| Field | Detail |
|---|---|
| Input | Existing messages/id.json + messages/en.json |
| Proses | Tambah namespace V3: (a) common.theme/themeToggle/lightMode/darkMode/systemMode. (b) transition.types.* (6). (c) voice.types.* (7). voice.emotions.* (6). voice.pitch.* (4). (d) audio.types.* (5). audio.timing.* (4). (e) imagePrompt.layers.* (8). Total ~55 keys |
| Output | V3 UI text via useTranslations(), ID+EN paralel |
| Acceptance | ID+EN sinkron. Semua V3 UI via useTranslations(). Tidak hardcoded |
| Files | `messages/id.json` (MODIFY), `messages/en.json` (MODIFY) |
| Sitasi | `RAG-CONTEXT S4.5, C31, C32`, `BRD SCOPE-V3-16, LIM-V3-04`, `PRD FR-V3-10` |

### 3.11 F-V3-11: V2 to V3 Migration Script (FR-V3-11)

| Field | Detail |
|---|---|
| Input | V2 project records di Turso |
| Proses | Script `v2-to-v3.ts`: SELECT all scenes. For each: UPDATE transitionType='cut', transitionDurationMs=0, transitionEasing='linear', transitionDirection='forward', voiceType='narrator', voiceEmotion='neutral', voiceSpeed=1.0, voicePitch='auto'. durationSeconds estimate dari voiceover length / 15. Dry-run mode (log only). Rollback: revert ke NULL. Idempotent |
| Output | V2 projects retained + V3 defaults |
| Acceptance | Success >= 95%. 100% V2 retained. Dry-run tested. Rollback tested. Idempotent |
| Files | `src/lib/migration/v2-to-v3.ts` (NEW) |
| Sitasi | `BRD SCOPE-V3-17, LIM-V3-13, RISK-V3-01`, `PRD FR-V3-11`, `KPI-V3-08` |

### 3.12 F-V3-12: Analytics V3 Events (FR-V3-12)

| Field | Detail |
|---|---|
| Input | User interactions dengan 5 fitur V3 |
| Proses | Extend `src/lib/analytics/events.ts` dengan 5 type V3. Track via @vercel/analytics.track: (a) theme_change {theme, from}. (b) scene_transition_generated {transitionType, projectId, sceneCount}. (c) voice_type_assigned {voiceType, sceneCount}. (d) audio_spec_generated {audioType, count, sceneId}. (e) image_prompt_layers_count {layersCount, sceneId} |
| Output | Event tracked. KPI V3 measurable |
| Acceptance | 5 events fired. No PII. KPI V3-01..10 measurable |
| Files | `src/lib/analytics/events.ts` (MODIFY) |
| Sitasi | `BRD SCOPE-V3-18, KPI-V3-01..10`, `PRD FR-V3-12` |

---

## 4. Data Model

### 4.1 Schema Changes Overview

| Object | Tipe | Aksi | Fields Added | Fitur |
|---|---|---|---|---|
| `scenes` table | Existing | ALTER ADD COLUMN | +11 fields (9 core + 2 EXTENDED ASUMSI) | F-V3-02, F-V3-04, F-V3-05 |
| `image_prompts` table | Existing | ALTER ADD COLUMN | +5 fields (2 core + 3 EXTENDED ASUMSI) | F-V3-03 |
| `scene_audio` table | NEW | CREATE TABLE | 19 fields (7 core + 12 EXTENDED ASUMSI) | F-V3-05 |

### 4.2 `scenes` Table — 11 New Fields (9 Core + 2 EXTENDED ASUMSI)

```sql
ALTER TABLE scenes ADD COLUMN transition_type TEXT NOT NULL DEFAULT 'cut';
ALTER TABLE scenes ADD COLUMN transition_duration_ms INTEGER NOT NULL DEFAULT 0;
ALTER TABLE scenes ADD COLUMN transition_easing TEXT NOT NULL DEFAULT 'linear';
ALTER TABLE scenes ADD COLUMN transition_direction TEXT NOT NULL DEFAULT 'forward';
ALTER TABLE scenes ADD COLUMN voice_type TEXT NOT NULL DEFAULT 'narrator';
ALTER TABLE scenes ADD COLUMN voice_emotion TEXT NOT NULL DEFAULT 'neutral';
ALTER TABLE scenes ADD COLUMN voice_speed REAL NOT NULL DEFAULT 1.0;
ALTER TABLE scenes ADD COLUMN voice_pitch TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE scenes ADD COLUMN duration_seconds INTEGER;
ALTER TABLE scenes ADD COLUMN scene_pacing TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE scenes ADD COLUMN scene_mood TEXT NOT NULL DEFAULT 'peaceful';
```

| Field | Type (Drizzle) | Default | Nullable | Validation | Fitur | Keterangan |
|---|---|---|---|---|---|---|
| `transitionType` | `text()` | `'cut'` | NO | enum 6 values | F-V3-02 | Core |
| `transitionDurationMs` | `integer()` | `0` | NO | 0-5000 | F-V3-02 | Core |
| `transitionEasing` | `text()` | `'linear'` | NO | enum 4 values | F-V3-02 | Core |
| `transitionDirection` | `text()` | `'forward'` | NO | enum 3 values | F-V3-02 | Core |
| `voiceType` | `text()` | `'narrator'` | NO | enum 7 values | F-V3-04 | Core |
| `voiceEmotion` | `text()` | `'neutral'` | NO | enum 6 values | F-V3-04 | Core |
| `voiceSpeed` | `real()` | `1.0` | NO | float 0.5-2.0 | F-V3-04 | Core |
| `voicePitch` | `text()` | `'auto'` | NO | enum 4 values | F-V3-04 | Core |
| `durationSeconds` | `integer()` | NULL | YES | positive int | F-V3-05 | Core |
| `scenePacing` | `text()` | `'normal'` | NO | enum 3 values | F-V3-02 | **EXTENDED (ASUMSI, adopted by orchestrator decision)** — fast/normal/slow pacing control |
| `sceneMood` | `text()` | `'peaceful'` | NO | enum 5 values | F-V3-02 | **EXTENDED (ASUMSI, adopted by orchestrator decision)** — cheerful/dramatic/tense/peaceful/mysterious mood |

Sitasi: `RAG-CONTEXT S3.2, C05`, `PRD S7.2`.

### 4.3 New Table `scene_audio` (19 Fields — 7 Core + 12 Extended ASUMSI)

```sql
CREATE TABLE scene_audio (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  project_id TEXT NOT NULL,
  scene_id TEXT NOT NULL,
  audio_type TEXT NOT NULL,
  description TEXT NOT NULL,
  timing TEXT NOT NULL DEFAULT 'throughout',
  duration_seconds INTEGER,
  volume REAL NOT NULL DEFAULT 0.7,
  fade_in_ms INTEGER NOT NULL DEFAULT 0,
  fade_out_ms INTEGER NOT NULL DEFAULT 0,
  music_genre TEXT,
  music_mood TEXT,
  music_tempo_bpm INTEGER,
  music_instruments TEXT,
  music_volume REAL DEFAULT 0.7,
  sfx_list TEXT,
  ambient_type TEXT,
  ambient_volume REAL DEFAULT 0.5,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);
CREATE INDEX idx_scene_audio_scene_id ON scene_audio(scene_id);
CREATE INDEX idx_scene_audio_project_id ON scene_audio(project_id);
```

| Field | Type | Default | Nullable | Validation | Keterangan |
|---|---|---|---|---|---|
| `id` | integer | auto | NO | autoIncrement | PK (INTEGER AUTOINCREMENT — konsisten dengan tabel lain) |
| `projectId` | text | — | NO | FK projects.id | CASCADE delete |
| `sceneId` | text | — | NO | FK scenes.id | CASCADE delete |
| `audioType` | text | — | NO | enum 5 (Zod) | background_music/sfx/ambient/music_cue/transition_audio |
| `description` | text | — | NO | string | deskripsi audio |
| `timing` | text | `'throughout'` | NO | enum 4 (Zod) | start/throughout/end/specific_moment |
| `durationSeconds` | integer | NULL | YES | positive int | durasi detik |
| `volume` | real | `0.7` | NO | float 0.0-1.0 | volume mix |
| `fadeInMs` | integer | `0` | NO | >= 0 | fade in ms |
| `fadeOutMs` | integer | `0` | NO | >= 0 | fade out ms |
| `musicGenre` | text | NULL | YES | string | EXTENDED (ASUMSI, adopted) — genre musik latar |
| `musicMood` | text | NULL | YES | string | EXTENDED (ASUMSI, adopted) — mood/emotion musik |
| `musicTempoBpm` | integer | NULL | YES | 40-220 | EXTENDED (ASUMSI, adopted) — tempo BPM |
| `musicInstruments` | text | NULL | YES | string | EXTENDED (ASUMSI, adopted) — comma-separated instruments |
| `musicVolume` | real | `0.7` | NO | float 0.0-1.0 | EXTENDED (ASUMSI, adopted) — volume mix musik |
| `sfxList` | text | NULL | YES | JSON string | EXTENDED (ASUMSI, adopted) — list sfx [{name,time,durationMs}] |
| `ambientType` | text | NULL | YES | enum string | EXTENDED (ASUMSI, adopted) — tipe ambient (nature/urban/indoor/etc) |
| `ambientVolume` | real | `0.5` | NO | float 0.0-1.0 | EXTENDED (ASUMSI, adopted) — volume mix ambient |

Index: `idx_scene_audio_scene_id`, `idx_scene_audio_project_id`.

Sitasi: `RAG-CONTEXT S3.2 (greenfield)`, `PRD S7.2`.

### 4.4 `image_prompts` Table — 5 New Optional Fields (2 Core + 3 EXTENDED ASUMSI)

```sql
ALTER TABLE image_prompts ADD COLUMN mood_atmosphere TEXT;
ALTER TABLE image_prompts ADD COLUMN style_references TEXT;
ALTER TABLE image_prompts ADD COLUMN composition TEXT;
ALTER TABLE image_prompts ADD COLUMN lighting TEXT;
ALTER TABLE image_prompts ADD COLUMN camera TEXT;
```

| Field | Type | Default | Nullable | Keterangan |
|---|---|---|---|---|
| `moodAtmosphere` | text | NULL | YES | Core — emotional tone + atmosphere |
| `styleReferences` | text | NULL | YES | Core — comma-separated style refs |
| `composition` | text | NULL | YES | **EXTENDED (ASUMSI, adopted)** — JSON string composition: framing, foreground/background, layout |
| `lighting` | text | NULL | YES | **EXTENDED (ASUMSI, adopted)** — JSON string lighting: direction, quality, color temp, shadows |
| `camera` | text | NULL | YES | **EXTENDED (ASUMSI, adopted)** — JSON string camera: angle, lens, depth-of-field, focal length |

`promptText` tetap single string (backward compat V1+V2). 5 field opsional — 2 core + 3 extended ASUMSI.

Sitasi: `PRD S7.2`.

### 4.5 Zod Schema Changes

#### SceneSchema Extended

```typescript
export const SceneSchema = z.object({
  // V1+V2 retained
  order: z.number().int().positive(),
  description: z.string().min(1),
  voiceover_script: z.string(),
  image_prompts: z.array(ImagePromptItemSchema),
  
  // V3 additions
  transitionType: z.enum(['cut', 'dissolve', 'fade_to_black', 'fade_to_white', 'wipe', 'match_cut']).default('cut'),
  transitionDurationMs: z.number().int().min(0).max(5000).default(0),
  transitionEasing: z.enum(['linear', 'ease_in', 'ease_out', 'ease_in_out']).default('linear'),
  transitionDirection: z.enum(['forward', 'backward', 'loop']).default('forward'),
  voiceType: z.enum(['child', 'teen', 'adult_male', 'adult_female', 'elderly_male', 'elderly_female', 'narrator']).default('narrator'),
  voiceEmotion: z.enum(['neutral', 'happy', 'sad', 'excited', 'calm', 'dramatic']).default('neutral'),
  voiceSpeed: z.number().min(0.5).max(2.0).default(1.0),
  voicePitch: z.enum(['low', 'medium', 'high', 'auto']).default('auto'),
  durationSeconds: z.number().int().positive().optional(),
  scenePacing: z.enum(['fast', 'normal', 'slow']).default('normal'),
  sceneMood: z.enum(['cheerful', 'dramatic', 'tense', 'peaceful', 'mysterious']).default('peaceful'),
  audio: z.array(SceneAudioSchema).optional(),
});
```

#### SceneAudioSchema (New)

```typescript
export const SceneAudioSchema = z.object({
  audioType: z.enum(['background_music', 'sfx', 'ambient', 'music_cue', 'transition_audio']),
  description: z.string().min(1),
  timing: z.enum(['start', 'throughout', 'end', 'specific_moment']).default('throughout'),
  durationSeconds: z.number().int().positive().optional(),
  volume: z.number().min(0).max(1).default(0.7),
  fadeInMs: z.number().int().min(0).default(0),
  fadeOutMs: z.number().int().min(0).default(0),
  // EXTENDED fields (ASUMSI, adopted by orchestrator decision)
  musicGenre: z.string().nullable().optional(),
  musicMood: z.string().nullable().optional(),
  musicTempoBpm: z.number().int().min(40).max(220).nullable().optional(),
  musicInstruments: z.string().nullable().optional(),
  musicVolume: z.number().min(0).max(1).default(0.7),
  sfxList: z.string().nullable().optional(), // JSON string
  ambientType: z.string().nullable().optional(),
  ambientVolume: z.number().min(0).max(1).default(0.5),
});
```

#### ImagePromptItemSchema Extended

```typescript
export const ImagePromptItemSchema = z.object({
  // V1+V2 retained
  target: z.string(),
  prompt_text: z.string(),
  reference_filename: z.string().nullable().optional(),
  // V3 additions — 2 core (opsional)
  moodAtmosphere: z.string().nullable().optional(),
  styleReferences: z.string().nullable().optional(),
  // V3 additions — 3 EXTENDED (ASUMSI, adopted)
  composition: z.string().nullable().optional(),
  lighting: z.string().nullable().optional(),
  camera: z.string().nullable().optional(),
});
```

Sitasi: `RAG-CONTEXT S4.1, C07, C08`, `PRD S7.4`.

---

## 5. Interface / API / Integrasi

### 5.1 API Changes Overview

| Endpoint | Method | Perubahan | Fitur |
|---|---|---|---|
| `/api/v1/generate` | POST | Save handler persist 9 V3 fields + batch insert scene_audio | F-V3-02..06 |
| `/api/v1/projects/[id]/scenes/[sceneId]/audio` | POST | NEW — create audio entry | F-V3-05 |
| `/api/v1/projects/[id]/scenes/[sceneId]/audio` | GET | NEW — list audio per scene | F-V3-05 |
| `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]` | PATCH | NEW — update audio entry | F-V3-05 |
| `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]` | DELETE | NEW — delete audio entry | F-V3-05 |
| `/api/v1/projects/[id]/export` | GET | Extend JSON serialize (audio array) + Markdown V3 sections | F-V3-09 |
| `/api/v1/projects/[id]/scenes` | GET | Response include 9 V3 fields per scene | F-V3-02,04 |

### 5.2 Request/Response Schema Changes

#### Generate Response (Extended)

```typescript
interface GenerateResponseScene {
  // V1+V2 retained
  order: number;
  description: string;
  voiceover_script: string;
  image_prompts: Array<{
    target: string;
    prompt_text: string;
    reference_filename: string | null;
moodAtmosphere?: string | null;  // V3
    styleReferences?: string | null;  // V3
    composition?: string | null;  // V3 EXTENDED (ASUMSI, adopted)
    lighting?: string | null;  // V3 EXTENDED (ASUMSI, adopted)
    camera?: string | null;  // V3 EXTENDED (ASUMSI, adopted)
  }>;
  supporting_characters?: Array<unknown>;
  
  // V3 additions
  transitionType: 'cut' | 'dissolve' | 'fade_to_black' | 'fade_to_white' | 'wipe' | 'match_cut';
  transitionDurationMs: number;
  transitionEasing: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out';
  transitionDirection: 'forward' | 'backward' | 'loop';
  voiceType: 'child' | 'teen' | 'adult_male' | 'adult_female' | 'elderly_male' | 'elderly_female' | 'narrator';
  voiceEmotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'dramatic';
  voiceSpeed: number;
  voicePitch: 'low' | 'medium' | 'high' | 'auto';
  durationSeconds?: number;
  scenePacing: 'fast' | 'normal' | 'slow';
  sceneMood: 'cheerful' | 'dramatic' | 'tense' | 'peaceful' | 'mysterious';
  audio?: Array<{
    audioType: 'background_music' | 'sfx' | 'ambient' | 'music_cue' | 'transition_audio';
    description: string;
    timing: 'start' | 'throughout' | 'end' | 'specific_moment';
    durationSeconds?: number;
    volume: number;
    fadeInMs: number;
    fadeOutMs: number;
    musicGenre?: string | null;
    musicMood?: string | null;
    musicTempoBpm?: number | null;
    musicInstruments?: string | null;
    musicVolume?: number;
    sfxList?: string | null;
    ambientType?: string | null;
    ambientVolume?: number;
  }>;
}
```

#### Scene Audio CRUD

```typescript
// POST /api/v1/projects/[id]/scenes/[sceneId]/audio
// Request:
interface CreateAudioRequest {
  audioType: 'background_music' | 'sfx' | 'ambient' | 'music_cue' | 'transition_audio';
  description: string;
  timing?: 'start' | 'throughout' | 'end' | 'specific_moment';
  durationSeconds?: number;
  volume?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
}
// Response 201: scene audio object with id
// Error: 400 validation, 401 no session, 403 not owner, 404 scene not found, 500 DB error
```

### 5.3 Migration Script API

```typescript
export async function migrateV2ToV3(options?: {
  dryRun?: boolean;
  batchSize?: number;
  onProgress?: (p: { processed: number; total: number }) => void;
}): Promise<{
  processed: number;
  updated: number;
  errors: Array<{ sceneId: string; error: string }>;
  dryRun: boolean;
  durationMs: number;
}>;

export async function rollbackV2ToV3(options?: {
  dryRun?: boolean;
}): Promise<{
  reverted: number;
  errors: Array<{ sceneId: string; error: string }>;
  dryRun: boolean;
}>;
```

### 5.4 External Integrations

| Service | V3 Changes | Keterangan |
|---|---|---|
| next-themes | NEW install | Theme toggle, zero-config shadcn/ui |
| Vercel Analytics | Extend 5 event V3 | No new SDK |
| Turso/libSQL | Schema migration + new table | Existing SDK, additive |
| Drizzle ORM | Schema extension | drizzle-kit generate + push |

**Tidak ada external API baru** untuk audio/voice/image (OOS-V3-01..04). V3 = spec only.

Sitasi: `PRD S5.1-5.4`.

---

## 6. File Format & Path

### 6.1 File BARU (10 files)

| # | Path | Tipe | Deskripsi | Fitur |
|---|---|---|---|---|
| 1 | `src/components/common/theme-toggle.tsx` | Client | Dropdown light/dark/system. Sun/Moon/Monitor icons | F-V3-01 |
| 2 | `src/components/generate/scene-transition-card.tsx` | Client | Scene + transition icon + duration + flow arrow | F-V3-02 |
| 3 | `src/components/generate/voice-type-selector.tsx` | Client | Voice type + emotion + speed + pitch per scene | F-V3-04 |
| 4 | `src/components/generate/audio-panel.tsx` | Client | CRUD audio entries per scene | F-V3-05 |
| 5 | `src/components/generate/image-prompt-display.tsx` | Client | Collapsible 8 layer labels + copy | F-V3-03 |
| 6 | `src/lib/db/repositories/scene-audio.repository.ts` | Module | CRUD scene_audio | F-V3-05 |
| 7 | `src/app/api/v1/projects/[id]/scenes/[sceneId]/audio/route.ts` | API | CRUD scene_audio endpoint | F-V3-05 |
| 8 | `src/lib/migration/v2-to-v3.ts` | Module | Backfill + dry-run + rollback | F-V3-11 |
| 9 | `drizzle/0001_v3_core_features.sql` | SQL | Additive migration | F-V3-06 |
| 10 | `src/components/common/changelog-banner.tsx` | Client | V3 in-app changelog | MRD |

### 6.2 File MODIFY (16 files)

| # | Path | Perubahan | Fitur |
|---|---|---|---|
| 1 | `package.json` | +next-themes | F-V3-01 |
| 2 | `src/components/providers.tsx` | +NextThemesProvider | F-V3-01 |
| 3 | `src/app/layout.tsx` | Remove className="dark" line 66 | F-V3-01 |
| 4 | `src/app/[locale]/page.tsx` | Remove div.dark wrap line 24 | F-V3-01 |
| 5 | `src/components/common/app-header.tsx` | +ThemeToggle | F-V3-01 |
| 6 | `src/components/settings/provider-card.tsx` | Replace dark: line 88 | F-V3-01 |
| 7 | `src/lib/db/schema.ts` | +9 scenes +2 image_prompts + new scene_audio | F-V3-02..05 |
| 8 | `src/lib/validation/schemas.ts` | Extend SceneSchema + SceneAudioSchema | F-V3-08 |
| 9 | `src/lib/ai/prompt-builder.ts` | 5 metadata instructions | F-V3-07 |
| 10 | `src/app/api/v1/generate/route.ts` | Save V3 fields | F-V3-06 |
| 11 | `src/app/api/v1/projects/[id]/export/route.ts` | Extend JSON/MD | F-V3-09 |
| 12 | `src/lib/export/markdown.template.ts` | +V3 sections | F-V3-09 |
| 13 | `src/components/generate/result-tabs.tsx` | Integrate 4 new components | F-V3-02..05 |
| 14 | `src/lib/analytics/events.ts` | +5 V3 events | F-V3-12 |
| 15 | `messages/id.json` | +55 V3 keys | F-V3-10 |
| 16 | `messages/en.json` | +55 V3 keys paralel | F-V3-10 |

### 6.3 Total: 10 baru + 16 modify = 26 file touched

Sitasi: `PRD S7.1`.

---

## 7. Tahapan Implementasi

Mapping dari BRD S10.1 (T1-T8) ke technical execution.

### Fase 1: Design & Spec (Minggu 1)

| # | Task | Deliverable | Verifikasi |
|---|---|---|---|
| 1.1 | Finalisasi SRS V3 | Dokumen ini | doc reviewed |
| 1.2 | UIUX_SPEC V3 | Wireframe 4 UI baru | spec sign-off |
| 1.3 | DATABASE_SCHEMA V3 | ERD V3 + migration plan | schema reviewed |
| 1.4 | API_CONTRACT V3 | OpenAPI spec audio CRUD | contract reviewed |

### Fase 2: Schema & Migration (Minggu 2)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 2.1 | Install next-themes | `pnpm add next-themes` | package.json updated |
| 2.2 | Update schema.ts | +11 scenes +5 image_prompts + new scene_audio (19 fields) | typecheck 0 error |
| 2.3 | Generate migration | `pnpm drizzle-kit generate` | SQL file created |
| 2.4 | Push staging | `pnpm drizzle-kit push` Turso staging | push sukses |
| 2.5 | Backfill script | Implement v2-to-v3.ts | dry-run tested |
| 2.6 | Test rollback | Run rollback di staging | 100% reverted |
| 2.7 | Update Zod schemas | Extend SceneSchema + new SceneAudioSchema | typecheck 0 error |

### Fase 3: Prompt Builder + API (Minggu 2-3)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 3.1 | Extend prompt-builder.ts | 5 instruksi metadata | token monitor |
| 3.2 | Test LLM generate | 10 manual calls validate enum | >= 90% valid |
| 3.3 | Update generate route.ts | Persist 11 V3 fields | save + reload |
| 3.4 | scene-audio.repository | CRUD + batch insert | unit test pass |
| 3.5 | Create audio API route | POST/GET/PATCH/DELETE | E2E jalan |
| 3.6 | Update export route.ts | JSON audio array + MD V3 | export validate |

### Fase 4: UI Components (Minggu 3)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 4.1 | ThemeToggle component | Dropdown 3 state | visual + keyboard |
| 4.2 | providers.tsx + layout.tsx + page.tsx | Remove hardcoded dark | toggle berfungsi |
| 4.3 | provider-card.tsx audit | Replace dark: variants | no hardcoded |
| 4.4 | SceneTransitionCard | Transition icon + flow arrow | visual flow |
| 4.5 | VoiceTypeSelector | Dropdown + slider | inline edit jalan |
| 4.6 | AudioPanel | CRUD dialog | add/edit/delete |
| 4.7 | ImagePromptDisplay | Collapsible 8 layer | copy per-section |
| 4.8 | Integrate result-tabs.tsx | 4 new components | render lengkap |
| 4.9 | i18n keys | messages/id.json + en.json | ID+EN sinkron |
| 4.10 | ChangelogBanner | V3 announcement V2 user | dismissable |

### Fase 5: QA & Migration (Minggu 4)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 5.1 | Full regression test | pnpm test --coverage | coverage >= 80% |
| 5.2 | V2 dry-run migration | Apply ke V2 staging project | 100% retained |
| 5.3 | Analytics events | 5 event V3 wired | events fire |
| 5.4 | Lighthouse audit | Performance mobile >= 85 | score valid |
| 5.5 | axe-core a11y | 0 critical violation | pass |
| 5.6 | Bundle size | <= +20KB gzipped (target +2KB) | measured |

### Fase 6: Launch (Minggu 4)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 6.1 | Deploy Vercel preview | Preview deploy sukses | URL accessible |
| 6.2 | PR review + merge | 5 atomic commit feat(v3): | no direct push main |
| 6.3 | Deploy production | `vercel --prod` | live |
| 6.4 | In-app changelog | Banner tampil untuk V2 user | visible |

### Fase 7: Monitor (Minggu 4-8)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 7.1 | Track 10 KPI V3 | Analytics dashboard | KPI measurable |
| 7.2 | In-app survey | NPS V3 vs V2 | feedback collected |
| 7.3 | Iteration | Fix bug dari user feedback | patch release |

Sitasi: `BRD S10.1 T1-T8`, `PRD AC-V3-13`.

---

## 8. Verifikasi & Pengujian

### 8.1 Definition of Done Teknis (V3)

Per PRD Lampiran B + BRD S12:

- [ ] Light theme toggle berfungsi + persist + system preference (AC-V3-01)
- [ ] Hardcoded dark class removed dari layout.tsx + page.tsx (AC-V3-01)
- [ ] Schema migration additive: +11 fields scenes + new table scene_audio (19 fields) (AC-V3-02,04,05,06)
- [ ] Prompt builder enhanced 5 metadata (AC-V3-07)
- [ ] Zod schema extended + SceneAudioSchema validated (AC-V3-08)
- [ ] UI: transition flow, voice selector, audio panel, image prompt labels (AC-V3-02..05)
- [ ] Export JSON + Markdown termasuk V3 metadata (AC-V3-09)
- [ ] i18n ID+EN sinkron 55 V3 keys (AC-V3-10)
- [ ] V2 to V3 migration tested (dry-run + reversible) (AC-V3-11)
- [ ] In-app changelog banner V2 user (AC-V3-13)
- [ ] 5 analytics event V3 wired (AC-V3-12)
- [ ] Lighthouse Performance >= 85 (NFR-V3-P01)
- [ ] Bundle <= +20KB gzipped (actual +2KB next-themes) (NFR-V3-P04)
- [ ] pnpm lint 0 + typecheck 0 + build pass
- [ ] WCAG 2.1 AA light + dark (NFR-V3-A01)
- [ ] V2 dry-run: 100% retained
- [ ] Conventional commit feat(v3): per fitur (5 atomic)
- [ ] PR reviewed + merged
- [ ] Preview deploy Vercel sukses

### 8.2 Lighthouse Targets

| Metric | Target | Sitasi |
|---|---|---|
| Performance mobile | >= 85 | BRD NFR-V3-P01, LIM-V3-06 |
| LCP | <= 2.5s | BRD KPI-09 |
| CLS | <= 0.1 | BRD KPI-10 |
| TBT | <= 200ms | NFR-V3-P05 |
| FCP | <= 1.8s | NFR-V3-P07 |
| Bundle tambahan V3 | <= +20KB gzipped (actual ~2KB) | NFR-V3-P04 |

### 8.3 Accessibility (a11y)

| Kriteria | Target | Sitasi |
|---|---|---|
| WCAG | 2.1 AA light + dark | NFR-V3-A01 |
| Kontras body | >= 4.5:1 | NFR-V3-A02 |
| Theme toggle keyboard | Focus ring visible | NFR-V3-A03 |
| Screen reader | ARIA labels transition/voice/audio | NFR-V3-A04 |
| Reduced motion | Respect prefers-reduced-motion | NFR-V3-U05 |

### 8.4 Test Coverage Target

| Layer | Target | Tools |
|---|---|---|
| Unit | >= 80% | Vitest |
| Integration | >= 60% | Vitest + Supertest |
| E2E | Critical flows | Playwright |
| Migration dry-run | 100% V2 retained | Script test |
| LLM output | >= 90% enum valid per field | Analytics + manual |

### 8.5 Quality Gates (PR Merge)

- pnpm lint 0 error
- pnpm typecheck 0 error
- pnpm build pass
- Lighthouse Performance mobile >= 85
- axe-core: 0 critical a11y violation
- Migration dry-run 100% retained
- 5 atomic commit feat(v3): per fitur
- PR reviewed + merged (no direct push main)

Sitasi: `PRD AC-V3-13`, `BRD S12`.

---

## 9. Constraint Teknis

### 9.1 Stack Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-01 | Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + next-intl — tidak boleh ubah | BRD LIM-01 |
| TC-02 | AI SDK tetap v4 — tidak boleh upgrade v6 | AGENTS.md CRIT-002, BRD LIM-V3-02 |
| TC-03 | next-themes ^0.4.4 — satu-satunya dep baru V3 | RAG-CONTEXT ASM-1 |
| TC-04 | Bundle tambahan <= +20KB gzipped (actual ~2KB) | BRD LIM-V3-07, NFR-V3-P04 |

### 9.2 Schema Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-05 | Migration additive only — tidak boleh drop kolom V2 | BRD LIM-V3-01 |
| TC-06 | Default values wajib untuk semua field baru | BRD ASM-B-V3-07 |
| TC-07 | scene_audio CASCADE delete dari scenes + projects | BRD LIM-V3-13 |
| TC-08 | Index wajib di scene_audio.sceneId dan scene_audio.projectId | Performance |
| TC-09 | promptText tetap single string (backward compat V1+V2) | RAG-CONTEXT ASM-3 |

### 9.3 Prompt Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-10 | Enum values wajib valid (Zod validation + retry) | BRD RISK-V3-02 |
| TC-11 | Default fallback wajib untuk semua field (cut/narrator/neutral/etc) | BRD ASM-B-V3-04 |
| TC-12 | Token usage naik <= 50% dari baseline | BRD ASM-B-V3-08 |
| TC-13 | Multi-provider LLM — tidak boleh lock 1 provider | BRD LIM-V3-02 |

### 9.4 Code Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-14 | TypeScript strict, no any | AGENTS.md L06 |
| TC-15 | No hardcoded text — semua via useTranslations() | AGENTS.md L09, BRD LIM-V3-04 |
| TC-16 | No hardcoded warna/hex — pakai Tailwind design tokens | BRD LIM-V3-05 |
| TC-17 | No secret client-side | AGENTS.md L07 |
| TC-18 | Server Component default, Client hanya bila butuh interaksi | AGENTS.md L04 |
| TC-19 | Conventional commit feat(v3): ... atomic | BRD DoD V3 |
| TC-20 | No direct push main — via PR + review | AGENTS.md L20 |

### 9.5 Design Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-21 | Design tokens dari globals.css — tidak hardcode hex | RAG-CONTEXT S4.1 |
| TC-22 | Primary violet #7c3aed (light) / #a78bfa (dark) konsisten | globals.css:10,56 |
| TC-23 | Light theme bukan inverted dark — design ulang palette | BRD LIM-V3-12 |
| TC-24 | Font Inter via system-ui — tidak custom font | globals.css:27 |
| TC-25 | Respect prefers-reduced-motion | globals.css:74-80 |

### 9.6 Export Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-26 | Export tetap JSON + Markdown — tidak tambah format baru | BRD LIM-V3-09 |
| TC-27 | Backward compatible V2 format | BRD LIM-V3-03 |
| TC-28 | Audio spec free-to-use — tidak referensi konten berlisensi | BRD LIM-V3-10 |

### 9.7 Ethics Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-29 | Voice type prompt tidak boleh bias gender/stereotype | BRD LIM-V3-11 |
| TC-30 | Semua 5 fitur harus support undo/redo | BRD LIM-V3-08 |

### 9.8 Migration Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-31 | Migration reversible (rollback plan tested) | BRD LIM-V3-13 |
| TC-32 | Dry-run mode wajib sebelum production | BRD RISK-V3-01 |
| TC-33 | Success rate >= 95% | BRD KPI-V3-08 |

### 9.9 Performance Constraints

| ID | Constraint | Target | Sumber |
|---|---|---|---|
| TC-34 | Lighthouse Performance mobile | >= 85 | BRD NFR-V3-P01 |
| TC-35 | LCP | <= 2.5s | BRD KPI-09 |
| TC-36 | CLS | <= 0.1 | BRD KPI-10 |
| TC-37 | LLM response time | <= 30s (sama V2) | ASUMSI |
| TC-38 | Migration execution time | <= 5s per project | ASUMSI |

### 9.10 Asumsi Teknis (V3)

| ID | Asumsi | Dampak bila Salah | Sitasi |
|---|---|---|---|
| TC-A01 | next-themes zero-config dengan shadcn/ui | Custom solution complex | RAG-CONTEXT ASM-1 |
| TC-A02 | Transition = field di scenes (bukan new table) | Perlu new table | RAG-CONTEXT ASM-2 |
| TC-A03 | Image prompts = enhance prompt builder, promptText single string | Schema extension besar | RAG-CONTEXT ASM-3 |
| TC-A04 | Voice type = field di scenes | Perlu new table | RAG-CONTEXT ASM-4 |
| TC-A05 | Audio = new table scene_audio (multiple per scene) | Single field tidak cukup | RAG-CONTEXT ASM-5 |
| TC-A06 | 1 migration file untuk semua 5 fitur | Multiple migration | RAG-CONTEXT ASM-6 |
| TC-A07 | Export tetap JSON + MD | Perlu format baru | RAG-CONTEXT ASM-7 |
| TC-A08 | 7 voice types cukup MVP | V4 extend cepat | RAG-CONTEXT ASM-8 |
| TC-A09 | 6 transition types cukup MVP | V4 extend | RAG-CONTEXT ASM-9 |
| TC-A10 | 5 audio categories cukup MVP | V4 extend | RAG-CONTEXT ASM-10 |
| TC-A11 | LLM generate metadata konsisten (>= 90%) | Output random | BRD ASM-B-V3-04 |
| TC-A12 | V3 = spec only, bukan actual generation | User expect 1-click video | MRD S7.3 |
| TC-A13 | 5 fitur = 1 sprint (2-3 minggu) | Timeline molor | BRD ASM-B-V3-10 |

---

## Lampiran A — Mapping PRD Feature ke Realisasi Teknis

| PRD ID | Fitur | Section SRS | Komponen UI | File Utama | DB Change |
|---|---|---|---|---|---|
| F-V3-01 | Light Theme | 3.1 | ThemeToggle | providers.tsx, layout.tsx, page.tsx, app-header.tsx, theme-toggle.tsx | N/A |
| F-V3-02 | Scene Transition | 3.2 | SceneTransitionCard | schema.ts, schemas.ts, prompt-builder.ts, route.ts | scenes +4 fields |
| F-V3-03 | Complex Image Prompts | 3.3 | ImagePromptDisplay | schema.ts, schemas.ts, prompt-builder.ts | image_prompts +5 fields (2 core + 3 ASUMSI) |
| F-V3-04 | Voiceover Voice Type | 3.4 | VoiceTypeSelector | schema.ts, schemas.ts, prompt-builder.ts, route.ts | scenes +4 fields |
| F-V3-05 | Supporting Audio | 3.5 | AudioPanel | schema.ts, schemas.ts, prompt-builder.ts, route.ts, scene-audio.repository.ts | scene_audio new table, scenes +1 field |
| F-V3-06 | Schema Migration | 3.6 | N/A | drizzle/0001_v3_core_features.sql, v2-to-v3.ts | 0001_v3_core_features.sql |
| F-V3-07 | Prompt Builder | 3.7 | N/A | prompt-builder.ts | N/A |
| F-V3-08 | Zod Schema | 3.8 | N/A | schemas.ts | N/A |
| F-V3-09 | Export Extension | 3.9 | N/A | markdown.template.ts, export/route.ts | N/A |
| F-V3-10 | i18n Keys | 3.10 | N/A | messages/id.json, messages/en.json | N/A |
| F-V3-11 | Migration Script | 3.11 | N/A | v2-to-v3.ts | N/A |
| F-V3-12 | Analytics | 3.12 | N/A | events.ts | N/A |

---

## Lampiran B — Enum Reference

### B.1 Transition Types

| Enum Value | Label ID | Label EN | Duration Range | Use Case |
|---|---|---|---|---|
| `cut` | Potong | Cut | 0ms | Default, action scenes |
| `dissolve` | Larut | Dissolve | 500-2000ms | Time passage, location change |
| `fade_to_black` | Gelap total | Fade to Black | 1000-3000ms | Chapter end, dramatic pause |
| `fade_to_white` | Terang total | Fade to White | 1000-3000ms | Dream, flashback |
| `wipe` | Sapu | Wipe | 500-1000ms | Location/travel change |
| `match_cut` | Potong cocok | Match Cut | 0ms | Visual continuity |

### B.2 Voice Types

| Enum Value | Label ID | Label EN | Use Case |
|---|---|---|---|
| `child` | Anak | Child | Karakter anak-anak |
| `teen` | Remaja | Teen | Karakter remaja |
| `adult_male` | Pria dewasa | Adult Male | Narator pria, karakter dewasa |
| `adult_female` | Wanita dewasa | Adult Female | Narator wanita, karakter dewasa |
| `elderly_male` | Lansia pria | Elderly Male | Karakter lansia pria |
| `elderly_female` | Lansia wanita | Elderly Female | Karakter lansia wanita |
| `narrator` | Narator | Narrator |旁白, non-character |

### B.3 Voice Emotions

| Enum Value | Label ID | Label EN |
|---|---|---|
| `neutral` | Netral | Neutral |
| `happy` | Senang | Happy |
| `sad` | Sedih | Sad |
| `excited` | Antusias | Excited |
| `calm` | Tenang | Calm |
| `dramatic` | Dramatis | Dramatic |

### B.4 Audio Types

| Enum Value | Label ID | Label EN | Description |
|---|---|---|---|
| `background_music` | Musik latar | Background Music | Continuous music bed |
| `sfx` | Efek suara | Sound Effects | Discrete sounds tied to actions |
| `ambient` | Suara lingkungan | Ambient | Environmental atmosphere |
| `music_cue` | Isyarat musik | Music Cue | Specific music moment |
| `transition_audio` | Audio transisi | Transition Audio | Sound during transitions |

### B.5 Image Prompt Layers

| Layer | Label ID | Label EN | Example |
|---|---|---|---|
| Subject | Subjek | Subject | "Anak perempuan 10 tahun dengan rambut hitam panjang" |
| Composition | Komposisi | Composition | "wide-angle, foreground: character, background: forest" |
| Camera | Kamera | Camera | "low angle, 35mm lens, f/2.8 depth of field" |
| Lighting | Pencahayaan | Lighting | "golden hour rim lighting, volumetric god rays" |
| Color | Warna | Color | "warm earth-tone palette, emerald green accents" |
| Mood | Suasana | Mood | "mysterious, hopeful atmosphere" |
| Style | Gaya | Style | "3D Pixar-style rendering" |
| Technical | Teknis | Technical | "4K, ultra-detailed, cinematic quality" |

---

## Lampiran C — i18n Key Structure Complete

```json
{
  "common": {
    "theme": "Tema",
    "themeToggle": "Ganti tema",
    "lightMode": "Mode terang",
    "darkMode": "Mode gelap",
    "systemMode": "Ikuti sistem"
  },
  "transition": {
    "types": {
      "cut": "Potong",
      "dissolve": "Larut",
      "fade_to_black": "Gelap total",
      "fade_to_white": "Terang total",
      "wipe": "Sapu",
      "match_cut": "Potong cocok"
    },
    "durationLabel": "Durasi",
    "easingLabel": "Ease",
    "directionLabel": "Arah",
    "flowLabel": "Alur transisi"
  },
  "voice": {
    "types": {
      "child": "Anak",
      "teen": "Remaja",
      "adult_male": "Pria dewasa",
      "adult_female": "Wanita dewasa",
      "elderly_male": "Lansia pria",
      "elderly_female": "Lansia wanita",
      "narrator": "Narator"
    },
    "emotions": {
      "neutral": "Netral",
      "happy": "Senang",
      "sad": "Sedih",
      "excited": "Antusias",
      "calm": "Tenang",
      "dramatic": "Dramatis"
    },
    "pitch": {
      "low": "Rendah",
      "medium": "Sedang",
      "high": "Tinggi",
      "auto": "Otomatis"
    },
    "speedLabel": "Kecepatan",
    "selectLabel": "Pilih suara"
  },
  "audio": {
    "types": {
      "background_music": "Musik latar",
      "sfx": "Efek suara",
      "ambient": "Suara lingkungan",
      "music_cue": "Isyarat musik",
      "transition_audio": "Audio transisi"
    },
    "timing": {
      "start": "Awal",
      "throughout": "Sepanjang",
      "end": "Akhir",
      "specific_moment": "Momen tertentu"
    },
    "fields": {
      "volume": "Volume",
      "fadeIn": "Fade in",
      "fadeOut": "Fade out",
      "description": "Deskripsi",
      "duration": "Durasi"
    },
    "actions": {
      "addAudio": "Tambah audio",
      "editAudio": "Edit audio",
      "deleteAudio": "Hapus audio",
      "noAudio": "Belum ada audio"
    }
  },
  "imagePrompt": {
    "layers": {
      "subject": "Subjek",
      "composition": "Komposisi",
      "camera": "Kamera",
      "lighting": "Pencahayaan",
      "color": "Warna",
      "mood": "Suasana",
      "style": "Gaya",
      "technical": "Teknis"
    },
    "copyLayer": "Salin bagian ini",
    "copyFull": "Salin seluruh prompt",
    "showSections": "Tampilkan bagian",
    "hideSections": "Sembunyikan bagian"
  }
}
```

Total: ~55 keys ID+EN paralel.

---

## Lampiran D — Referensi Dokumen

| # | Dokumen | Path | Peran |
|---|---|---|---|
| 1 | BRD V3 | `product-docs/BRD.md` v2.0 | Why — nilai bisnis, KPI, scope |
| 2 | MRD V3 | `product-docs/MRD.md` v2.0 | Who — pasar, persona, positioning |
| 3 | PRD V3 | `product-docs/PRD.md` v2.0 | What — FR-V3-01..12, MoSCoW, AC |
| 4 | RAG-CONTEXT | `product-docs/RAG-CONTEXT.md` | Fakta — bukti kode, web research |
| 5 | SRS V1 | `product-docs/SRS.md` v1.0 | Format reference (landing page) |
| 6 | AGENTS.md | `product-docs/AGENTS.md` | Build guide V2 (reused) |

---

> **Dokumen ini = kontrak teknis V3 untuk 5 fitur inti PromptFlow. Eksekutor baca SRS ini + PRD V3 + BRD V3 + RAG-CONTEXT + AGENTS.md sebelum coding. Semua constraint langsung executable. Klaim tanpa bukti = ASUMSI (ditandai di TC-A01..A13).**

**Dibuat oleh:** docgen-srs subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Update)
