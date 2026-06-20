# AGENTS.md — Panduan Build PromptFlow V3 Core Features

> **Versi:** 2.0 (V3 Core Features)
> **Tanggal:** 2026-06-21
> **Deliverable:** 5 fitur inti V3 — Light Theme Support, Scene Transition Flow Engine, Complex Image Prompts (8 layer), Voiceover Voice Type Spec, Supporting Audio Spec
> **Menggantikan:** AGENTS.md v1.0 (Landing Page Focus)
> **Status:** PASS WITH WARNINGS (REVIEW_REPORT v2.0). 0 CRITICAL, 2 WARNING (WARN-005, WARN-006). Build boleh mulai, WARNING diperbaiki paralel.
> **Builds on:** V1 (workflow engine, deployed) + V2 (landing page, in production)

---

## 1. Project Overview

### 1.1 Apa Itu PromptFlow

**PromptFlow** = workflow engine otomasi prompt animasi AI. Web app fullstack (Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + Drizzle ORM + Turso/libSQL + Vercel AI SDK v4 + next-intl). Output = paket prompt terstruktur (JSON + Markdown) dari input minimal (judul + durasi + gaya). Multi-provider LLM. Character consistency lintas adegan.

### 1.2 V3 Scope — 5 Fitur Inti (MUST)

V1 = workflow engine (deployed). V2 = landing page (in production). **V3 = core feature expansion** menjawab 5 gap dari feedback user V2.

| # | Fitur | Masalah V2 yang Dijawab | Bukti Kode |
|---|---|---|---|
| **F-V3-01** | **Light Theme Support** | App force dark — user siang/office silau | `layout.tsx:66` hardcoded `className="dark"` |
| **F-V3-02** | **Scene Transition Flow Engine** | Video output "adegan kaget" (jarring cut) | `scenes` table tanpa transition fields |
| **F-V3-03** | **Complex Image Prompts (8 layer)** | Output AI image generic 1-baris | `prompt-builder.ts` prompt basic |
| **F-V3-04** | **Voiceover Voice Type Spec** | Voiceover monoton, semua scene satu suara | `voiceoverScript` plain string |
| **F-V3-05** | **Supporting Audio Spec** | ZERO audio — video diam tanpa musik/SFX/ambient | Tidak ada field audio |

### 1.3 V3 Positioning

> "Production-grade animation prompt engine — output siap-pakai untuk downstream AI video tools (Runway, Pika, Kling, Sora), no re-edit needed."

V3 = **spec only**, BUKAN actual generation. Generate metadata transition/voice/audio/image layer, BUKAN generate video/audio/image file asli.

### 1.4 V3 Stats

- **5 fitur MUST** + 7 SHOULD + 6 COULD
- **29 file touched** (13 baru + 16 modify)
- **1 dep baru** (next-themes ^0.4.4)
- **+11 fields scenes** (9 core + 2 EXTENDED ASUMSI: scenePacing, sceneMood)
- **+5 fields image_prompts** (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera)
- **+1 field projects** (theme_preference — ASUMSI)
- **1 new table scene_audio** (19 fields: 7 core + 12 EXTENDED ASUMSI)
- **+5 V3 analytics events** (no PII)
- **~60 i18n keys V3** (ID+EN paralel)
- **Bundle impact:** ~2KB gzipped (next-themes only, target <= +20KB)
- **205 test case V3** (288 total termasuk V1 landing)

### 1.5 Out-of-Scope V3 (JANGAN Dikerjakan)

| # | OOS | Alasan |
|---|---|---|
| OOS-01 | Audio file generation (royalty API) | V3 = spec only — V4 |
| OOS-02 | TTS engine actual (ElevenLabs) | V3 = voice metadata — V4 |
| OOS-03 | Image generation (Midjourney/DALL-E) | PromptFlow = prompt engine |
| OOS-04 | Video assembly (Runway/Pika) | PromptFlow = prompt engine |
| OOS-05 | Custom voice cloning | V5 |
| OOS-06 | Audio waveform preview | V4 |
| OOS-07 | A/B testing infrastructure | Cukup Vercel Analytics |
| OOS-08 | Negative prompt | V4 |
| OOS-09 | Multi-language voice | V5 |
| OOS-10 | Prompt builder refactor | V5 |
| OOS-11 | Mobile app | Web-only V3 |
| OOS-12 | Pricing changes | Tidak ada pricing V2 |

---

## 2. Tech Stack

### 2.1 Stack Retained (V1+V2)

| Lapisan | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 |
| UI Library | React + ReactDOM | ^19.0.0 |
| Styling | Tailwind CSS v4 | ^4.0.0 |
| UI Components | shadcn/ui (Radix UI) | ^1.1.0 |
| ORM | Drizzle ORM | ^0.38.0 |
| Database | Turso/libSQL | ^0.14.0 |
| Auth | NextAuth v5 (beta.25) | 5.0.0-beta.25 |
| AI SDK | Vercel AI SDK v4 (`ai`) | ^4.0.0 |
| AI Provider | `@ai-sdk/openai-compatible` | ^1.0.0 |
| Validation | Zod | ^3.24.0 |
| i18n | next-intl | ^3.26.0 |
| Animation | framer-motion | ^12.40.0 |
| Analytics | @vercel/analytics | latest |
| TypeScript | typescript | ^5.7.0 |
| Package Manager | pnpm | 11.7.0 |
| Node | Node.js | >=20.0.0 |

### 2.2 Dependency BARU (V3) — 1-satunya

| Package | Versi | Install |
|---|---|---|
| **next-themes** | ^0.4.4 | `pnpm add next-themes` |

### 2.3 Dependency DILARANG (V3)

AI SDK v6, GSAP, Anime.js, Tone.js, Howler.js, ElevenLabs SDK, Midjourney/DALL-E SDK, custom font berbayar.

---

## 3. File Structure

### 3.1 File BARU (13 files)

| # | Path | Tipe | Fitur |
|---|---|---|---|
| 1 | `src/components/common/theme-toggle.tsx` | Client | Dropdown light/dark/system. Sun/Moon/Monitor. `useTheme()` dari next-themes |
| 2 | `src/components/common/changelog-banner.tsx` | Client | V3 in-app changelog. Dismissable |
| 3 | `src/components/generate/scene-transition-card.tsx` | Client | Scene + transition icon Lucide + duration badge + flow arrow |
| 4 | `src/components/generate/voice-type-selector.tsx` | Client | Voice type + emotion + speed slider + pitch per scene |
| 5 | `src/components/generate/audio-panel.tsx` | Client | CRUD audio entries per scene. Dialog add/edit/delete |
| 6 | `src/components/generate/image-prompt-display.tsx` | Client | Collapsible 8 layer labels + copy per-section |
| 7 | `src/lib/db/repositories/scene-audio.repository.ts` | Module | CRUD scene_audio (getByScene, create, update, delete, list) |
| 8 | `src/app/api/v1/projects/[id]/scenes/[sceneId]/audio/route.ts` | API | Audio CRUD: GET list + POST create |
| 9 | `src/app/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]/route.ts` | API | Audio CRUD: PATCH update + DELETE |
| 10 | `src/app/api/v1/projects/[id]/theme/route.ts` | API | PATCH theme preference (server-side sync) |
| 11 | `src/lib/migration/v2-to-v3.ts` | Module | Backfill + dry-run + rollback |
| 12 | `drizzle/0001_v3_core_features.sql` | SQL | Additive migration (generated by drizzle-kit) |
| 13 | `src/lib/templates/presets.ts` | Module | Template presets (tutorial/cinematic/kids/documentary/action) |

### 3.2 File MODIFY (16 files)

| # | Path | Perubahan | Fitur |
|---|---|---|---|
| 1 | `package.json` | +next-themes | F-V3-01 |
| 2 | `src/components/providers.tsx` | +NextThemesProvider wrapper | F-V3-01 |
| 3 | `src/app/layout.tsx` | Remove `className="dark"` line 66 + `suppressHydrationWarning` | F-V3-01 |
| 4 | `src/app/[locale]/page.tsx` | Remove `<div className="dark">` line 24 | F-V3-01 |
| 5 | `src/components/common/app-header.tsx` | +ThemeToggle sebelum LanguageToggle | F-V3-01 |
| 6 | `src/components/settings/provider-card.tsx` | Replace `dark:bg-green-950` line 88 | F-V3-01 |
| 7 | `src/lib/db/schema.ts` | +11 scenes +5 image_prompts +1 projects + scene_audio table | F-V3-02..05 |
| 8 | `src/lib/validation/schemas.ts` | Extend SceneSchema +11 fields + new SceneAudioSchema + ThemePreferenceSchema | F-V3-08 |
| 9 | `src/lib/ai/prompt-builder.ts` | 5 metadata instructions | F-V3-07 |
| 10 | `src/app/api/v1/generate/route.ts` | Save handler persist 11 V3 fields + batch insert scene_audio | F-V3-02,04,05,06 |
| 11 | `src/app/api/v1/projects/[id]/export/route.ts` | Extend JSON serialize + Markdown 4 V3 sections | F-V3-09 |
| 12 | `src/lib/export/markdown.template.ts` | +V3 sections (Transitions/Voice/Audio/Image Layers) | F-V3-09 |
| 13 | `src/components/generate/result-tabs.tsx` | Integrate 4 new V3 components inline per scene | F-V3-02..05 |
| 14 | `src/lib/analytics/events.ts` | +5 V3 events | F-V3-12 |
| 15 | `messages/id.json` | +~60 V3 keys | F-V3-10 |
| 16 | `messages/en.json` | +~60 V3 keys paralel | F-V3-10 |

### 3.3 Total: 13 baru + 16 modify = 29 file touched

### 3.4 Folder Structure Update

```
src/
  app/
    layout.tsx                         (MODIFY - remove hardcoded className="dark")
    [locale]/
      layout.tsx                       (Server - wrap ThemeProvider + SessionProvider)
      page.tsx                         (MODIFY - remove div.dark wrap)
    api/v1/
      generate/route.ts                (MODIFY - persist V3 fields)
      projects/[id]/
        export/route.ts                (MODIFY - extend JSON/MD)
        theme/route.ts                 (NEW - PATCH theme)
        scenes/[sceneId]/
          audio/route.ts               (NEW - GET/POST audio)
          audio/[audioId]/route.ts     (NEW - PATCH/DELETE audio)
  components/
    providers.tsx                      (MODIFY - add NextThemesProvider)
    common/
      app-header.tsx                   (MODIFY - add ThemeToggle)
      theme-toggle.tsx                 (NEW - 3-state toggle)
      changelog-banner.tsx             (NEW - V3 announcement)
    generate/
      result-tabs.tsx                  (MODIFY - integrate 4 new)
      scene-transition-card.tsx        (NEW)
      voice-type-selector.tsx          (NEW)
      audio-panel.tsx                  (NEW)
      image-prompt-display.tsx         (NEW)
    settings/
      provider-card.tsx                (MODIFY - remove hardcoded dark:)
  lib/
    ai/prompt-builder.ts               (MODIFY - 5 metadata instructions)
    db/
      schema.ts                        (MODIFY - +17 fields + scene_audio table)
      repositories/
        scene-audio.repository.ts      (NEW - CRUD)
    validation/schemas.ts              (MODIFY - extend + new SceneAudioSchema)
    export/markdown.template.ts        (MODIFY - V3 sections)
    migration/v2-to-v3.ts              (NEW - backfill + dry-run + rollback)
    analytics/events.ts                (MODIFY - +5 V3 events)
    templates/presets.ts               (NEW - 5 presets)

drizzle/
  0000_gigantic_genesis.sql            (V1/V2 - retained)
  0001_v3_core_features.sql            (NEW - additive migration)

messages/
  id.json                              (MODIFY - +~60 V3 keys)
  en.json                              (MODIFY - +~60 V3 keys paralel)
```

---

## 4. Build Steps (T1-T8)

5 atomic commit `feat(v3): <scope>` per fitur.

### Fase 1: Design & Spec — SUDAH SELESAI

| # | Task | Status |
|---|---|---|
| 1.1 | Finalisasi SRS V3 | DONE |
| 1.2 | Finalisasi UIUX_SPEC V3 | DONE |
| 1.3 | Finalisasi DATABASE_SCHEMA V3 | DONE |
| 1.4 | Finalisasi API_CONTRACT V3 | DONE |
| 1.5 | Finalisasi CODING_RULES V3 | DONE |
| 1.6 | Finalisasi TEST_PLAN V3 | DONE |
| 1.7 | REVIEW_REPORT v2.0 PASS | DONE |

### Fase 2: Setup + Schema & Migration (Minggu 2) — MULAI DARI SINI

| # | Task | Verifikasi |
|---|---|---|
| 2.1 | `pnpm add next-themes` | package.json updated |
| 2.2 | Update `src/lib/db/schema.ts` +11 scenes +5 image_prompts +1 projects + scene_audio (19 fields) | `pnpm typecheck` 0 error |
| 2.3 | `pnpm drizzle-kit generate` | `drizzle/0001_v3_core_features.sql` created |
| 2.4 | `pnpm drizzle-kit push` (staging) | Push sukses |
| 2.5 | Grep `DROP COLUMN` di SQL = 0 | 0 DROP for V2 |
| 2.6 | Grep `DEFAULT` di ALTER V3 | All have DEFAULT |
| 2.7 | Grep `CASCADE` di scene_audio FK | Both CASCADE |
| 2.8 | Verify 3 indexes di scene_audio | Created |
| 2.9 | Update `src/lib/validation/schemas.ts` | `pnpm typecheck` 0 error |
| 2.10 | Implement `src/lib/migration/v2-to-v3.ts` | Unit test pass |
| 2.11 | Test rollback di staging | 100% reverted |
| 2.12 | Implement `src/lib/templates/presets.ts` | 5 presets |

**Commit:** `feat(v3): add V3 schema migration + zod extension + next-themes`

### Fase 3: Prompt Builder + API (Minggu 2-3)

| # | Task | Verifikasi |
|---|---|---|
| 3.1 | Extend `src/lib/ai/prompt-builder.ts` 5 instruksi metadata | Token monitor <= +50% |
| 3.2 | Test LLM 10 calls | >= 90% valid per field |
| 3.3 | Update `src/app/api/v1/generate/route.ts` save handler | Save + reload |
| 3.4 | Implement `src/lib/db/repositories/scene-audio.repository.ts` | Unit test pass |
| 3.5 | Create audio API route (GET/POST) | E2E jalan |
| 3.6 | Create audio ID API route (PATCH/DELETE) | E2E jalan |
| 3.7 | Create theme API route (PATCH) | E2E jalan |
| 3.8 | Update export route + markdown template | Export validate |
| 3.9 | Update `src/lib/analytics/events.ts` +5 events | Events fire |

**Commit:** `feat(v3): add V3 prompt builder + API routes + analytics events`

### Fase 4: UI Components (Minggu 3)

| # | Task | Verifikasi |
|---|---|---|
| 4.1 | `theme-toggle.tsx` (NEW) | Visual + keyboard |
| 4.2 | providers.tsx + layout.tsx + page.tsx remove hardcoded dark | Toggle end-to-end |
| 4.3 | provider-card.tsx remove hardcoded dark: | No hardcoded |
| 4.4 | app-header.tsx +ThemeToggle | Toggle visible |
| 4.5 | `scene-transition-card.tsx` (NEW) | Visual flow |
| 4.6 | `voice-type-selector.tsx` (NEW) | Inline edit |
| 4.7 | `audio-panel.tsx` (NEW) | CRUD jalan |
| 4.8 | `image-prompt-display.tsx` (NEW) | Copy per-section |
| 4.9 | `result-tabs.tsx` (MODIFY) integrate 4 new | Render lengkap |
| 4.10 | `changelog-banner.tsx` (NEW) | Banner tampil |
| 4.11 | Expand `messages/id.json` + `messages/en.json` ~60 keys | ID+EN sinkron |
| 4.12 | Add `prefers-reduced-motion` | Animasi disabled |

**Commit:** `feat(v3): add 6 V3 UI components + i18n keys + theme toggle`

### Fase 5: QA & Migration (Minggu 4)

| # | Task | Verifikasi |
|---|---|---|
| 5.1 | `pnpm test --coverage` | Coverage >= 80% unit, >= 60% integration |
| 5.2 | V2 dry-run migration | 100% V2 retained, >= 95% success |
| 5.3 | Real migration ke staging | All V2 projects migrated |
| 5.4 | Analytics events fire | Vercel Analytics dashboard |
| 5.5 | Lighthouse mobile | >= 85 |
| 5.6 | axe-core a11y light + dark | 0 critical |
| 5.7 | Bundle size | <= +20KB gzipped |
| 5.8 | E2E Playwright critical path | All green |
| 5.9 | Backward compat V2 | V2 data retained |
| 5.10 | Reduced motion test | No FM anims |

### Fase 6: Launch (Minggu 4)

| # | Task | Verifikasi |
|---|---|---|
| 6.1 | Deploy Vercel preview | URL accessible |
| 6.2 | PR review + merge | No direct push main |
| 6.3 | Deploy production | Live |
| 6.4 | In-app changelog | Visible |

### Fase 7: Monitor (Minggu 4-8)

| # | Task | Verifikasi |
|---|---|---|
| 7.1 | Track 10 KPI V3 | Analytics dashboard |
| 7.2 | In-app survey NPS | Feedback collected |
| 7.3 | Iteration bugfix | Patch release |

---

## 5. Key Decisions — ADR

Dari `PROJECT_ARCHITECTURE.md` S13.

| ADR | Keputusan | Alasan | Sitasi |
|---|---|---|---|
| **ADR-01** | **Additive-only schema migration** | V2 production ada data. Zero data loss | BRD LIM-V3-01 |
| **ADR-02** | **Transition + Voice sebagai fields di scenes** | 1:1 relationship, query simpler | RAG-CONTEXT ASM-2,4 |
| **ADR-03** | **scene_audio sebagai new table** | 1:N relationship, CRUD per-entry | RAG-CONTEXT ASM-5 |
| **ADR-04** | **next-themes untuk Light Theme** | Standard, zero-config shadcn/ui, ~2KB | RAG-CONTEXT ASM-1 |
| **ADR-05** | **8-Layer Image Prompt via prompt enhancement** | promptText tetap single string, backward compat | RAG-CONTEXT ASM-3 |
| **ADR-06** | **V3 = spec only, BUKAN actual generation** | Scope control. Actual gen = V4+ | BRD OOS-V3-01..04 |
| **ADR-07** | **Additive migration = zero downtime** | SQLite ALTER ADD COLUMN = instant | SRS S3.6 |
| **ADR-08** | **Template presets di application-level** | Convenience, no DB overhead | DATABASE_SCHEMA S10.3 |
| **ADR-09** | **AI SDK tetap v4** | Kode V1 pakai v4, upgrade = breaking | SRS TC-02 |
| **ADR-10** | **Theme preference = dual storage** | next-themes (primary) + DB optional sync | WARN-005 |

---

## 6. Warnings from Review

**REVIEW_REPORT v2.0: PASS WITH WARNINGS (0 CRITICAL, 2 WARNING, 3 INFO).**

### 6.1 WARN-005 (OPEN — Priority P2)

PRD F-V3-01 Schema field = "N/A (client-side only)". Tapi DATABASE_SCHEMA add `theme_preference` ke projects (ASUMSI), dan API_CONTRACT define PATCH `/theme` endpoint.

**Action:** Implement BOTH — client-side localStorage (primary) + server-side PATCH /theme (optional sync). ADR-10.

### 6.2 WARN-006 (OPEN — Priority P3)

RAG-CONTEXT S5.3 list 8 transition types (incl. morph, zoom_transition). V3 implement 6 only. morph + zoom = V4.

**Action:** Implement 6 types only. Jangan tambah morph/zoom.

### 6.3 INFO-003

Stale ASUMSI note di DATABASE_SCHEMA S5.1: "SRS S4.3 = TEXT(UUID)". Kenyataannya INTEGER. Cleanup paralel.

### 6.4 Build Permission

> "0 CRITICAL open, boleh lanjut ke build phase. WARNING tidak memblokir build — diperbaiki paralel." — REVIEW_REPORT v2.0 S7

---

## 7. Do Not — 35 Larangan

Wajib dipatuhi. Traced ke `CODING_RULES.md` S11.

| # | Larangan | Sumber |
|---|---|---|
| L-01 | Jangan pakai `any` (TS strict). Pakai `unknown` + Zod narrow | TC-14 |
| L-02 | Jangan hardcoded teks UI. Semua via `useTranslations()` | TC-15 |
| L-03 | Jangan hardcoded warna/hex. Pakai Tailwind design tokens | TC-16 |
| L-04 | Jangan campur Server + Client Component di file sama | TC-18 |
| L-05 | Jangan pakai `dangerouslySetInnerHTML` | SEC-08 |
| L-06 | Jangan log sensitive data (API keys, tokens, PII) | SEC-01 |
| L-07 | Jangan push ke `main` langsung. Via PR + review | TC-20 |
| L-08 | Jangan commit `.env.local` | — |
| L-09 | Jangan pakai `width`/`height`/`top` di FM. GPU-only: `transform`, `opacity` | — |
| L-10 | Jangan skip `prefers-reduced-motion`. `useReducedMotion()` wajib | D-07 |
| L-11 | Jangan pakai GSAP / heavy lib | S1.3 |
| L-12 | Jangan hardcode `href` internal. Routing via next-intl | — |
| L-13 | Jangan pakai `window` / `document` di Server Component | TC-18 |
| L-14 | Jangan lupa `rel="noopener noreferrer"` untuk `target="_blank"` | — |
| L-15 | Jangan animasi tanpa `viewport={{ once: true }}` | — |
| L-16 | Jangan inline object/array di props re-render | — |
| L-17 | Jangan pakai `React.FC`. Function declaration | — |
| L-18 | Jangan Magic number. Extract ke constants | — |
| L-19 | Jangan nesting > 3 level. Extract ke child | — |
| L-20 | Jangan default export component. Named export saja | — |
| L-21 | **Jangan pakai AI SDK v6**. Kode V1 pakai v4. Upgrade = breaking | TC-02, ADR-09 |
| L-22 | **Jangan drop kolom V2**. Migration additive only | TC-05,06 |
| L-23 | Jangan tanpa Zod validation. Semua LLM output + request body | TC-10 |
| L-24 | Jangan bypass auth check. `getServerSession()` wajib | SEC-06 |
| L-25 | Jangan bypass ownership check | SEC-07 |
| L-26 | Jangan tambah dep baru tanpa approval. V3 = 1 dep baru (next-themes) | S1.3 |
| L-27 | Jangan upgrade AI SDK. Tetap v4 | TC-02, ADR-09 |
| L-28 | **Jangan hardcode `className="dark"`**. Pakai next-themes ThemeProvider | S3.1 |
| L-29 | **Jangan pakai `dark:` Tailwind variants**. Pakai CSS variables | D-08 |
| L-30 | Jangan tanpa default values di migration | TC-06 |
| L-31 | Jangan tanpa dry-run sebelum migration production | TC-32 |
| L-32 | Jangan generate prompt tanpa JSON schema compliance | TC-10 |
| L-33 | Jangan tanpa error envelope di API | S3.3 |
| L-34 | Jangan lupa i18n key ID+EN sinkron | S3.10 |
| L-35 | Jangan hardcode enum values di component. Pakai constant arrays | — |

---

## 8. Acceptance Criteria

### 8.1 Per-Fitur AC

#### AC-V3-01: Light Theme Support

- next-themes terinstall
- `<NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>` di providers.tsx
- Hardcoded `className="dark"` removed dari `layout.tsx:66`
- `<div className="dark">` removed dari `page.tsx:24`
- `ThemeToggle` component di app-header.tsx (3 mode: light/dark/system)
- Default = dark, persist localStorage, system preference detected
- No FOUC (`suppressHydrationWarning`)
- shadcn/ui render sempurna di light mode
- provider-card.tsx hardcoded dark: variants removed
- WCAG 2.1 AA kontras
- i18n keys ID+EN, analytics event `theme_change`

#### AC-V3-02: Scene Transition Flow Engine

- scenes table: +11 fields (9 core + 2 EXTENDED ASUMSI: scenePacing, sceneMood)
- Zod SceneSchema extended, prompt-builder generate transition (6 types)
- Default: cut, 0ms, linear, forward. scenePacing: normal. sceneMood: peaceful
- Save handler persist 11 V3 fields
- UI: SceneTransitionCard + visual flow arrow (dashed=cut, solid=duration>0)
- Export JSON + Markdown `## Scene Transitions`
- i18n `transition.types.*` (6), analytics `scene_transition_generated`

#### AC-V3-03: Complex Image Prompts (8 layer)

- prompt-builder generate 8-layer formula, min 6/8 layer per prompt
- image_prompts: +5 fields (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera)
- UI: ImagePromptDisplay collapsible 8 layer + copy per-section
- Export JSON + Markdown `## Image Prompt Layers`
- i18n `imagePrompt.layers.*` (8), analytics `image_prompt_layers_count`

#### AC-V3-04: Voiceover Voice Type Spec

- scenes: +4 fields (voiceType, voiceEmotion, voiceSpeed, voicePitch)
- prompt-builder generate voice type dari 7 enum
- Default: narrator, neutral, 1.0, auto
- UI: VoiceTypeSelector dropdown + emotion + speed slider + pitch
- Export JSON + Markdown `## Voice Specifications`
- i18n `voice.types.*` (7) + `voice.emotions.*` (6) + `voice.pitch.*` (4), analytics `voice_type_assigned`

#### AC-V3-05: Supporting Audio Spec

- New table scene_audio (19 fields: 7 core + 12 EXTENDED ASUMSI)
- 3 indexes + CASCADE delete, new Zod SceneAudioSchema
- scenes: +durationSeconds
- prompt-builder: min 1 audio cue per scene (>= 80%)
- UI: AudioPanel CRUD, 4 API endpoints (GET/POST/PATCH/DELETE)
- Repository: scene-audio.repository.ts
- Export JSON + Markdown `## Audio Specifications`
- i18n `audio.types.*` (5) + `audio.timing.*` (4) + `audio.fields.*`, analytics `audio_spec_generated`

#### AC-V3-06..13: Supporting Features

- **AC-V3-06:** 1 file migration, push sukses, dry-run 100% V2 retained, rollback tested
- **AC-V3-07:** buildSystemPrompt extended 5 instruksi, >= 90% valid/field, fallback defaults, token <= +50%
- **AC-V3-08:** SceneSchema +11, ImagePromptItemSchema +5, SceneAudioSchema 19, ThemePreferenceSchema, typecheck 0 error
- **AC-V3-09:** JSON + MD export V3, backward compat V2
- **AC-V3-10:** ~60 V3 keys ID+EN paralel, 100% sinkron
- **AC-V3-11:** Backfill defaults, dry-run, rollback, success >= 95%
- **AC-V3-12:** 5 events V3, no PII
- **AC-V3-13:** lint 0 + typecheck 0 + build pass, Lighthouse >= 85, bundle <= +20KB, axe-core 0 critical, WCAG 2.1 AA, 5 atomic commit feat(v3), PR + preview deploy

### 8.2 V3 Definition of Done (PRD Lampiran B — 22 Items)

- [ ] Light theme toggle berfungsi + persist + system preference
- [ ] Hardcoded dark class removed dari layout.tsx + page.tsx
- [ ] Schema migration additive: +11 fields scenes + new table scene_audio (19 fields)
- [ ] Prompt builder enhanced 5 metadata
- [ ] Zod schema extended + validated
- [ ] UI: transition flow, voice selector, audio panel, image prompt labels
- [ ] Export JSON + Markdown termasuk V3 metadata
- [ ] i18n ID+EN sinkron semua V3 (~60 keys)
- [ ] V2 to V3 migration tested (dry-run + reversible)
- [ ] In-app changelog banner V2 user
- [ ] Landing page copy updated (opsional)
- [ ] 5 analytics event V3 wired
- [ ] Lighthouse Performance >= 85
- [ ] Bundle <= +20KB gzipped (actual ~2KB)
- [ ] pnpm lint 0 + typecheck 0 + build pass
- [ ] WCAG 2.1 AA light + dark
- [ ] V2 dry-run: 100% retained
- [ ] Conventional commit feat(v3): per fitur (5 atomic)
- [ ] PR reviewed + merged
- [ ] Preview deploy Vercel sukses
- [ ] WARN-005 parallel fix: PATCH /theme endpoint
- [ ] WARN-006 parallel fix: Note RAG-CONTEXT morph/zoom = V4

---

## 9. Design Tokens

Sumber: `UIUX_SPEC.md` S2 + `globals.css`. Pakai CSS variables, JANGAN hardcode hex.

### 9.1 Light Mode

| Token | HEX | Kegunaan | Kontras |
|---|---|---|---|
| `--color-background` | #ffffff | Body bg | — |
| `--color-foreground` | #0a0a0a | Body text | 18.4:1 |
| `--color-card` | #ffffff | Card bg | — |
| `--color-card-foreground` | #0a0a0a | Card text | 18.4:1 |
| `--color-primary` | #7c3aed | CTA, brand | 5.1:1 AA |
| `--color-primary-foreground` | #ffffff | Teks di primary | 4.6:1 |
| `--color-secondary` | #f4f4f5 | Card bg subtle | — |
| `--color-secondary-foreground` | #18181b | Teks secondary | 15.4:1 |
| `--color-muted` | #f4f4f5 | Muted surface | — |
| `--color-muted-foreground` | #71717a | Helper text | 4.6:1 |
| `--color-accent` | #ede9fe | Highlight, hover | — |
| `--color-accent-foreground` | #4c1d95 | Teks di accent | 8.2:1 |
| `--color-destructive` | #dc2626 | Error | 5.6:1 |
| `--color-destructive-foreground` | #ffffff | Teks error | 4.6:1 |
| `--color-success` | #16a34a | Success | 4.5:1 |
| `--color-warning` | #d97706 | Warning | 4.6:1 |
| `--color-info` | #2563eb | Info | 5.3:1 |
| `--color-border` | #e4e4e7 | Border | — |
| `--color-input` | #e4e4e7 | Input border | — |
| `--color-ring` | #7c3aed | Focus ring | 5.1:1 |

### 9.2 Dark Mode (DEFAULT)

| Token | HEX | Kegunaan | Kontras |
|---|---|---|---|
| `--color-background` | #0a0a0a | Body bg | — |
| `--color-foreground` | #fafafa | Body text | 18.1:1 |
| `--color-card` | #0f0f0f | Card bg | — |
| `--color-card-foreground` | #fafafa | Card text | 17.4:1 |
| `--color-primary` | #a78bfa | CTA, brand | 8.5:1 |
| `--color-primary-foreground` | #0a0a0a | Teks di primary | 10.4:1 |
| `--color-secondary` | #27272a | Card bg dark | — |
| `--color-secondary-foreground` | #fafafa | Teks secondary | 14.5:1 |
| `--color-muted` | #27272a | Muted surface | — |
| `--color-muted-foreground` | #a1a1aa | Helper text | 6.2:1 |
| `--color-accent` | #3b0764 | Highlight dark | — |
| `--color-accent-foreground` | #ddd6fe | Teks di accent | 9.8:1 |
| `--color-destructive` | #ef4444 | Error | 4.7:1 |
| `--color-destructive-foreground` | #fafafa | Teks error | 16.8:1 |
| `--color-success` | #22c55e | Success | 5.9:1 |
| `--color-warning` | #f59e0b | Warning | 8.1:1 |
| `--color-info` | #3b82f6 | Info | 5.0:1 |
| `--color-border` | #27272a | Border | — |
| `--color-input` | #27272a | Input border | — |
| `--color-ring` | #a78bfa | Focus ring | 8.5:1 |

### 9.3 Tipografi

- `--font-sans`: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif
- `--font-mono`: "JetBrains Mono", "Fira Code", ui-monospace, monospace
- Type scale: text-xs(12) / text-sm(14) / text-base(16) / text-lg(18) / text-xl(20) / text-2xl(24)

### 9.4 Spacing + Radius

- `--radius`: 6px
- Spacing base: 4px (Tailwind p-1)
- Container max-width: 1280px

### 9.5 Breakpoint

- Mobile: < 640px | sm: 640px | md: 768px | lg: 1024px | xl: 1280px | 2xl: 1536px

### 9.6 V3 Badge Colors (UIUX_SPEC S2.4-S2.6)

**Transition (Light / Dark):**
- cut = #71717a / #a1a1aa (gray) — icon Zap
- dissolve = #2563eb / #60a5fa (blue) — icon Blend
- fade_to_black = #1f2937 / #6b7280 (dark gray) — icon Moon
- fade_to_white = #d97706 / #fbbf24 (amber) — icon Sun
- wipe = #16a34a / #4ade80 (green) — icon ArrowRight
- match_cut = #7c3aed / #a78bfa (violet) — icon Link

**Voice (Light / Dark):**
- child = pink #ec4899 / #f472b6 — icon Baby
- teen = orange #f97316 / #fb923c — icon User
- adult_male = blue #2563eb / #60a5fa — icon User
- adult_female = purple #9333ea / #c084fc — icon User
- elderly_male = gray #6b7280 / #9ca3af — icon User
- elderly_female = slate #475569 / #94a3b8 — icon User
- narrator = violet #7c3aed / #a78bfa — icon Mic

**Audio (Light / Dark):**
- background_music = indigo #4f46e5 / #818cf8 — icon Music
- sfx = amber #d97706 / #fbbf24 — icon Volume2
- ambient = teal #0d9488 / #2dd4bf — icon CloudRain
- music_cue = rose #e11d48 / #fb7185 — icon Music2
- transition_audio = cyan #0891b2 / #22d3ee — icon AudioLines

---

## 10. Section Order — Result Tabs

Untuk `src/components/generate/result-tabs.tsx` (MODIFY):

```
1. AppHeader (sticky, z-50)              — sudah ada
   [Logo] [Nav] [ThemeToggle] [LangToggle] [Auth]

2. Generate Form (max-w-2xl mx-auto)     — sudah ada
   Title / Duration / Style / [Generate]

3. Result Tabs (max-w-4xl mx-auto)        — MODIFY
   [Scenes] [Characters] [Export] tabs

4. Tab Scenes content:
   +-- SceneTransitionCard[1]            — NEW V3
   |   +-- Description + Voiceover
   |   +-- Transition Flow (badge + arrow)
   |   +-- Voice Spec (VoiceTypeSelector) — NEW V3
   |   +-- Image Prompts (ImagePromptDisplay, 8 layer) — NEW V3
   |   +-- Audio Specs (AudioPanel CRUD) — NEW V3
   +-- SceneTransitionCard[2]
   |   (flow arrow, dashed=cut, solid=duration>0)
   +-- SceneTransitionCard[3]
   +-- ...

5. ChangelogBanner                        — NEW V3 (dismissable)
```

---

## 11. i18n Keys V3

Total ~60 keys. Namespace: `common.*` + `transition.*` + `voice.*` + `audio.*` + `imagePrompt.*`. ID+EN paralel 100% sinkron.

| Namespace | Keys | Jumlah |
|---|---|---|
| common.* | theme, themeToggle, lightMode, darkMode, systemMode | 5 |
| transition.types.* | cut, dissolve, fade_to_black, fade_to_white, wipe, match_cut | 6 |
| transition.* | durationLabel, easingLabel, directionLabel, flowLabel | 4 |
| voice.types.* | child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator | 7 |
| voice.emotions.* | neutral, happy, sad, excited, calm, dramatic | 6 |
| voice.pitch.* | low, medium, high, auto | 4 |
| voice.* | speedLabel, selectLabel | 2 |
| audio.types.* | background_music, sfx, ambient, music_cue, transition_audio | 5 |
| audio.timing.* | start, throughout, end, specific_moment | 4 |
| audio.fields.* | volume, fadeIn, fadeOut, description, addAudio, editAudio, deleteAudio | 7 |
| imagePrompt.layers.* | subject, composition, camera, lighting, color, mood, style, technical | 8 |
| imagePrompt.* | copyLayer, copyFull | 2 |
| **Total** | | **~60** |

**Label contoh:**

| Key | ID | EN |
|---|---|---|
| common.theme | "Tema" | "Theme" |
| common.lightMode | "Mode terang" | "Light mode" |
| common.darkMode | "Mode gelap" | "Dark mode" |
| common.systemMode | "Ikuti sistem" | "System" |
| transition.types.cut | "Potong" | "Cut" |
| transition.types.dissolve | "Larut" | "Dissolve" |
| transition.types.fade_to_black | "Gelap total" | "Fade to black" |
| transition.types.fade_to_white | "Terang total" | "Fade to white" |
| transition.types.wipe | "Sapu" | "Wipe" |
| transition.types.match_cut | "Potong cocok" | "Match cut" |
| voice.types.child | "Anak" | "Child" |
| voice.types.narrator | "Narator" | "Narrator" |
| voice.types.adult_female | "Wanita dewasa" | "Adult female" |
| voice.emotions.neutral | "Netral" | "Neutral" |
| audio.types.background_music | "Musik latar" | "Background music" |
| audio.types.sfx | "Efek suara" | "SFX" |
| audio.types.ambient | "Suara lingkungan" | "Ambient" |
| audio.types.music_cue | "Isyarat musik" | "Music cue" |
| audio.types.transition_audio | "Audio transisi" | "Transition audio" |
| imagePrompt.layers.subject | "Subjek" | "Subject" |
| imagePrompt.layers.composition | "Komposisi" | "Composition" |
| imagePrompt.layers.camera | "Kamera" | "Camera" |
| imagePrompt.layers.lighting | "Pencahayaan" | "Lighting" |
| imagePrompt.layers.color | "Warna" | "Color" |
| imagePrompt.layers.mood | "Suasana" | "Mood" |
| imagePrompt.layers.style | "Gaya" | "Style" |
| imagePrompt.layers.teknis | "Teknis" | "Technical" |

---

## 12. Tooling

```bash
# Install
pnpm install
pnpm add next-themes

# Database
pnpm drizzle-kit generate
pnpm drizzle-kit push
pnpm drizzle-kit studio

# Migration V2 -> V3
node scripts/migrate-v2-v3.ts --dry-run
node scripts/migrate-v2-v3.ts

# Dev
pnpm dev

# Build
pnpm build
pnpm lint
pnpm lint --fix
pnpm typecheck
pnpm format

# Test
pnpm test
pnpm test --coverage
pnpm test:e2e
pnpm test:e2e --ui

# Deploy
vercel:preview
vercel:prod
```

---

## 13. Definition of Done

### 13.1 Functional DoD

- [ ] F-V3-01 Light Theme: toggle light/dark/system berfungsi + persist + system preference
- [ ] F-V3-01 Hardcoded className="dark" removed
- [ ] F-V3-02 Scene Transition: 4 transition fields + scenePacing + sceneMood per scene
- [ ] F-V3-03 Complex Image Prompts: 8-layer formula, min 6/8 layer per prompt
- [ ] F-V3-04 Voiceover Voice Type: 7 types + emotion + speed + pitch per scene
- [ ] F-V3-05 Supporting Audio: scene_audio table (19 fields), CRUD API, UI panel
- [ ] Schema migration additive: +11 scenes + scene_audio + 5 image_prompts + 1 projects
- [ ] Prompt builder enhanced 5 metadata instructions
- [ ] Zod schema extended + validated
- [ ] UI: 6 new components (ThemeToggle, SceneTransitionCard, VoiceTypeSelector, AudioPanel, ImagePromptDisplay, ChangelogBanner)
- [ ] Export JSON + Markdown 4 V3 sections
- [ ] i18n ID+EN ~60 keys 100% sinkron
- [ ] V2 to V3 migration tested (dry-run + reversible, >= 95%)
- [ ] In-app changelog banner
- [ ] 5 analytics events V3 wired (no PII)
- [ ] PATCH /theme endpoint (WARN-005 fix)

### 13.2 Quality Gates

- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] LCP <= 2.5s, CLS <= 0.1
- [ ] Bundle <= +20KB gzipped (actual ~2KB)
- [ ] axe-core 0 critical a11y (light + dark)
- [ ] WCAG 2.1 AA
- [ ] prefers-reduced-motion respected
- [ ] Unit test coverage >= 80%
- [ ] Integration test coverage >= 60%
- [ ] 205 test case V3 pass
- [ ] V2 dry-run 100% retained
- [ ] Token usage <= +50% baseline

### 13.3 Git & Deploy DoD

- [ ] 5 atomic commit feat(v3): per fitur
- [ ] Conventional commit format
- [ ] No direct push main via PR + review
- [ ] PR template filled
- [ ] Preview deploy Vercel sukses
- [ ] No .env.local committed
- [ ] No secret client-side

### 13.4 Warning Fixes (Parallel)

- [ ] WARN-005: PATCH /theme implemented
- [ ] WARN-006: Note RAG-CONTEXT S5.3 morph/zoom = V4
- [ ] INFO-003: Cleanup stale note DATABASE_SCHEMA S5.1

---

## 14. Document References

Semua di `C:\laragon\www\PromptFlow\product-docs\`.

| # | Dokumen | Path | Peran V3 |
|---|---|---|---|
| 1 | RAG-CONTEXT | product-docs/RAG-CONTEXT.md | Sumber fakta. Refresh 2026-06-21 |
| 2 | BRD | product-docs/BRD.md (v2.0) | Why — konteks bisnis, KPI, scope |
| 3 | MRD | product-docs/MRD.md (v2.0) | Who — pasar, persona, GTM |
| 4 | PRD | product-docs/PRD.md (v2.0) | What — FR-V3, MoSCoW, AC, DoD |
| 5 | SRS | product-docs/SRS.md (v2.0) | How — arsitektur, data model, 5 spec detail, T1-T8 |
| 6 | DATABASE_SCHEMA | product-docs/DATABASE_SCHEMA.md (v2.0) | Skema 10 tabel, ERD, migration SQL, backfill, rollback |
| 7 | PROJECT_ARCHITECTURE | product-docs/PROJECT_ARCHITECTURE.md (v2.0) | Arsitektur, container/component diagram, ADR-01..10 |
| 8 | UIUX_SPEC | product-docs/UIUX_SPEC.md (v2.0) | Design tokens light+dark, 5 komponen baru, wireframes |
| 9 | API_CONTRACT | product-docs/API_CONTRACT.md (v3.0) | API 5 baru + 4 extended, Zod schemas, error envelope |
| 10 | CODING_RULES | product-docs/CODING_RULES.md (v2.0) | 35 larangan, naming, formatting, git, review |
| 11 | TEST_PLAN | product-docs/TEST_PLAN.md (v2.0) | 205 test case V3 |
| 12 | REVIEW_REPORT | product-docs/REVIEW_REPORT.md (v2.0) | Quality gate — PASS WITH WARNINGS |
| 13 | AGENTS.md (this) | product-docs/AGENTS.md (v2.0) | Panduan build V3 (gantikan v1.0 landing) |

---

> **Dokumen ini = panduan operasional V3 untuk agent eksekutor. Baca + seluruh product-docs/ sebelum coding. Mulai Fase 2, commit per fase feat(v3): scope. Verifikasi per task. Capai DoD. Fix WARN-005 + WARN-006 paralel.**

**Dibuat oleh:** docgen-agentsmd subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Core Features)
**Menggantikan:** AGENTS.md v1.0 (Landing Page Focus)
