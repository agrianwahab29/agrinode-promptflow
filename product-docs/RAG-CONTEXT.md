# RAG-CONTEXT.md — PromptFlow (Refreshed for 5 New Requirements)
> **Sumber kebenaran faktual** untuk pipeline docgen PromptFlow
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Docs dir:** `C:\laragon\www\PromptFlow\product-docs`
> **Diperbarui:** 2026-06-21
> **Scope:** Refresh untuk 5 requirement baru: Light Theme, Scene Transition, Complex Image Prompts, Voiceover Voice Type, Supporting Audio

---

## Daftar Isi

1. [Ringkasan Temuan](#1-ringkasan-temuan)
2. [Current Codebase State](#2-current-codebase-state)
3. [Database Schema Analysis](#3-database-schema-analysis)
4. [Prompt System Analysis](#4-prompt-system-analysis)
5. [Scene Transition Analysis](#5-scene-transition-analysis)
6. [Image Prompt Analysis](#6-image-prompt-analysis)
7. [Voiceover Analysis](#7-voiceover-analysis)
8. [Audio/Music Analysis](#8-audiomusic-analysis)
9. [Theme System Analysis](#9-theme-system-analysis)
10. [Web Research Findings](#10-web-research-findings)
11. [Gap Analysis](#11-gap-analysis)
12. [Asumsi](#12-asumsi)
13. [Daftar Sitasi](#13-daftar-sitasi)

---

## 1. Ringkasan Temuan

### FAKTA (berbasis bukti kode)
- **PromptFlow** = workflow engine otomasi prompt animasi AI. Output = paket prompt terstruktur (JSON + Markdown) dari input minimal.
- **Dark mode only** — `layout.tsx:66` hardcodes `className="dark"`. CSS light tokens SUDAH ada di `globals.css:4-28` tapi tidak dipakai. Tidak ada theme toggle.
- **Scene = flat list** — `scenes` table punya `orderNo`, `description`, `voiceoverScript`. TIDAK ADA: transition type, duration, easing, audio cues, voice type.
- **Image prompts = single string** — `promptText` field berisi satu baris teks. TIDAK ADA: structured layers (composition, lighting, camera, style modifiers).
- **Voiceover = plain text** — `voiceover_script` string. TIDAK ADA: voice type, speaking rate, emotion, pauses.
- **Audio = zero** — Tidak ada field audio di schema, tidak ada audio generation, tidak ada music/SFX spec.
- **Prompt files = monolithic** — Semua 5 prompt system files hanya re-export `buildSystemPrompt()` dari `prompt-builder.ts`. Satu prompt builder untuk semua.
- **Zod schema = rigid** — `SceneSchema` hanya punya `order`, `description`, `voiceover_script`, `image_prompts`. Tidak ada extension point untuk transition/audio/voice.

### GAP KRITIS untuk 5 Requirement Baru
| # | Requirement | Status di Kode | Gap |
|---|---|---|---|
| 1 | Light Theme Toggle | CSS tokens light SUDAH ada (`globals.css:4-28`), tapi app force dark (`layout.tsx:66`). Landing page wrap `<div className="dark">` (`page.tsx:24`). | Perlu: theme toggle component, localStorage persist, remove hardcoded dark class |
| 2 | Scene Transition | Schema: `scenes` table hanya `orderNo`+`description`+`voiceoverScript`. Prompt: tidak ada instruksi transition. | Perlu: new schema fields, prompt instructions, UI display |
| 3 | Complex Image Prompts | Schema: `imagePrompts.promptText` = single string. Prompt: contoh prompt hanya 1 baris deskriptif. | Perlu: structured prompt layers, prompt builder enhancement |
| 4 | Voiceover Voice Type | Schema: `scenes.voiceoverScript` = plain string. Prompt: tidak ada voice type spec. | Perlu: new field per scene, voice type enum, prompt instructions |
| 5 | Supporting Audio | TIDAK ADA di schema, prompt, atau UI. | Perlu: new schema table/fields, prompt generation, UI display, export |

---

## 2. Current Codebase State

### 2.1 Tech Stack Verified

| Lapisan | Teknologi | Versi | Sitasi |
|---|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 | `package.json:50` |
| UI Library | React + ReactDOM | ^19.0.0 | `package.json:52-53` |
| Styling | Tailwind CSS v4 | ^4.0.0 | `package.json:81` |
| UI Components | shadcn/ui (Radix UI) | ^1.1.0 | `package.json:26-39` |
| ORM | Drizzle ORM | ^0.38.0 | `package.json:47` |
| Database | Turso/libSQL | ^0.14.0 | `package.json:25` |
| Auth | NextAuth v5 (beta.25) | 5.0.0-beta.25 | `package.json:51` |
| AI SDK | Vercel AI SDK v4 (`ai`) | ^4.0.0 | `package.json:42` |
| AI Provider | `@ai-sdk/openai-compatible` | ^1.0.0 | `package.json:22` |
| Validation | Zod | ^3.24.0 | `package.json:60` |
| i18n | next-intl | ^3.26.0 | `package.json:53` |
| Animation | framer-motion | ^12.40.0 | `package.json:48` |
| Charts | recharts | ^3.8.1 | `package.json:56` |
| Forms | react-hook-form + @hookform/resolvers | ^7.54.0 / ^3.10.0 | `package.json:55,24` |
| Storage | @vercel/blob | ^0.27.0 | `package.json:41` |
| Testing | Vitest + Playwright | ^2.1.0 / ^1.49.0 | `package.json:83,63` |
| Package Manager | pnpm | 11.7.0 | `package.json:89` |
| Node | Node.js | >=20.0.0 | `package.json:86` |

### 2.2 Project Structure

| Folder/File | Fungsi | Sitasi |
|---|---|---|
| `src/app/[locale]/` | App Router pages (locale-wrapped) | `src/app/[locale]/layout.tsx` |
| `src/app/api/v1/` | API routes (REST) | `src/app/api/v1/generate/route.ts` |
| `src/components/ui/` | shadcn/ui components (12 files) | `src/components/ui/*.tsx` |
| `src/components/generate/` | Generate form + result display (4 files) | `src/components/generate/*.tsx` |
| `src/components/landing/` | Landing page sections (16 files) | `src/components/landing/*.tsx` |
| `src/components/common/` | Shared components (5 files) | `src/components/common/*.tsx` |
| `src/components/settings/` | Settings page (2 files) | `src/components/settings/*.tsx` |
| `src/components/projects/` | Project management (2 files) | `src/components/projects/*.tsx` |
| `src/components/dashboard/` | Dashboard charts (5 files) | `src/components/dashboard/*.tsx` |
| `src/lib/ai/` | AI engine: prompt-builder, llm-client, consistency-checker | `src/lib/ai/*.ts` |
| `src/lib/ai/prompts/` | Prompt system files (5 files, all re-export prompt-builder) | `src/lib/ai/prompts/*.ts` |
| `src/lib/db/` | Database: schema, client, cache, repositories (10 repos) | `src/lib/db/*.ts` |
| `src/lib/validation/` | Zod schemas (input + output) | `src/lib/validation/schemas.ts` |
| `src/lib/auth/` | NextAuth config + middleware | `src/lib/auth/*.ts` |
| `src/lib/i18n/` | i18n config (id/en) | `src/lib/i18n/*.ts` |
| `src/lib/export/` | Markdown export template | `src/lib/export/markdown.template.ts` |
| `src/lib/templates/` | Title templates (8 presets) | `src/lib/templates/titles.ts` |
| `messages/` | i18n JSON (id.json, en.json) | `messages/*.json` |
| `drizzle/` | Migration files | `drizzle/0000_gigantic_genesis.sql` |
| `product-docs/` | All product documentation (14 files) | `product-docs/*.md` |

### 2.3 API Routes

| Endpoint | Method | Fungsi | Sitasi |
|---|---|---|---|
| `/api/v1/generate` | POST | Generate prompt package via LLM (SSE streaming) | `route.ts:31` |
| `/api/v1/projects` | GET | List user projects | `route.ts` |
| `/api/v1/projects/[id]` | GET | Get project detail | `route.ts` |
| `/api/v1/projects/[id]/scenes` | GET | List scenes for project | `route.ts:9` |
| `/api/v1/projects/[id]/image-prompts` | GET | List image prompts for project | `route.ts:9` |
| `/api/v1/projects/[id]/export` | GET | Export as JSON or Markdown | `route.ts:10` |
| `/api/v1/projects/[id]/characters` | GET | List characters | `route.ts` |
| `/api/v1/projects/[id]/delete` | POST | Soft-delete project | `route.ts` |
| `/api/v1/projects/[id]/logs` | GET | Generation logs | `route.ts` |
| `/api/v1/settings/providers` | GET/POST | Manage LLM providers | `route.ts` |
| `/api/v1/upload` | POST | Upload asset references | `route.ts` |
| `/api/v1/upload/classify` | POST | AI classify uploaded image | `route.ts` |
| `/api/v1/health` | GET | Health check | `route.ts` |
| `/api/v1/register` | POST | User registration | `route.ts` |

### 2.4 Key Files for Each Requirement

| Requirement | Primary Files | Secondary Files |
|---|---|---|
| Light Theme | `layout.tsx:66`, `globals.css:1-82`, `page.tsx:24` | `landing/*.tsx`, `ui/*.tsx` |
| Scene Transition | `schema.ts:89-99`, `schemas.ts:27-32`, `prompt-builder.ts:71-97` | `scenes/route.ts`, `result-tabs.tsx` |
| Complex Image Prompts | `prompt-builder.ts:9-69`, `schemas.ts:16-25`, `schema.ts:102-116` | `result-tabs.tsx:140-189` |
| Voiceover Voice Type | `schema.ts:89-99`, `schemas.ts:27-32`, `prompt-builder.ts:71-97` | `result-tabs.tsx:191-205` |
| Supporting Audio | TIDAK ADA (greenfield) | `schema.ts`, `schemas.ts` |

---

## 3. Database Schema Analysis

### 3.1 Tables yang Ada

| Table | Fields | Sitasi |
|---|---|---|
| `users` | id, email, name, passwordHash, image, role, createdAt, updatedAt | `schema.ts:5-14` |
| `provider_configs` | id, userId, provider, name, baseUrl, model, apiKeyEncrypted, isActive, createdAt, updatedAt | `schema.ts:17-30` |
| `projects` | id, userId, title, durationType, durationTargetSeconds, styleType, aspectRatio, resultJson, status, storyDescription, createdAt, updatedAt, deletedAt | `schema.ts:33-50` |
| `asset_references` | id, projectId, tipe, filename, blobUrl, label, mimeType, sizeBytes, aiClassification, createdAt | `schema.ts:53-67` |
| `characters` | id, projectId, nama, gayarambut, wajahAsal, pakaianAtas, pakaianBawah, alasKaki, deskripsiLatar, aksi, peran, createdAt | `schema.ts:70-86` |
| `scenes` | id, projectId, orderNo, description, voiceoverScript, createdAt | `schema.ts:89-99` |
| `image_prompts` | id, projectId, sceneId, tipe, target, promptText, referenceFilename, createdAt | `schema.ts:102-116` |
| `generation_logs` | id, projectId, provider, model, durationMs, status, errorMessage, logsJson, createdAt | `schema.ts:119-132` |
| `supporting_characters` | id, projectId, sceneId, nama, tipe, aksi, createdAt | `schema.ts:135-146` |

### 3.2 Schema Gaps untuk 5 Requirement Baru

| Gap | Table Affected | What is Missing | Impact |
|---|---|---|---|
| Scene transitions | `scenes` | `transitionType`, `transitionDuration`, `transitionEasing`, `transitionDirection` | Scene jarring, no transition metadata |
| Scene duration | `scenes` | `durationSeconds` | Cannot calculate per-scene timing |
| Voiceover voice type | `scenes` | `voiceType`, `voiceEmotion`, `voiceSpeed`, `voicePitch` | All voiceover same voice |
| Audio per scene | `scenes` | `musicCue`, `sfxCue`, `ambientCue`, `audioVolume` | No audio specification |
| Audio global | `projects` | `backgroundMusic`, `audioFormat` | No global audio config |
| Complex image prompts | `image_prompts` | `composition`, `lighting`, `cameraAngle`, `styleModifiers`, `mood` | Prompts lack detail |

### 3.3 Drizzle Migration

- One migration file: `drizzle/0000_gigantic_genesis.sql` — initial schema.
- Dialect: `turso` (libSQL) — `drizzle.config.ts:18`.
- For schema changes: run `drizzle-kit generate` + `drizzle-kit push`.

---

## 4. Prompt System Analysis

### 4.1 Current Architecture

**Single monolithic prompt builder** — all prompt files re-export from one:

| File | Isi | Sitasi |
|---|---|---|
| `prompt-builder.ts` | `buildSystemPrompt()` + `buildUserMessage()` — satu prompt untuk semua output | `prompt-builder.ts:71-126` |
| `scenes.system.ts` | `export { buildSystemPrompt as default } from '../prompt-builder'` | `scenes.system.ts:1` |
| `image-prompts.system.ts` | `export { buildSystemPrompt as default } from '../prompt-builder'` | `image-prompts.system.ts:1` |
| `voiceover.system.ts` | `export { buildSystemPrompt as default } from '../prompt-builder'` | `voiceover.system.ts:1` |
| `character.system.ts` | `export { buildSystemPrompt as default } from '../prompt-builder'` | `character.system.ts:1` |
| `moral.system.ts` | `export { buildSystemPrompt as default } from '../prompt-builder'` | `moral.system.ts:1` |

### 4.2 Current Prompt Structure

System prompt (`prompt-builder.ts:71-97`):
- Instruksi: output HANYA JSON valid
- JSON schema example: single hardcoded example
- Field rules: character_profiles, scenes, image_prompts, supporting_characters, moral_message
- Consistency rules: identity fields stable across scenes

User message (`prompt-builder.ts:100-126`):
- Input: title, duration, style, storyDescription (optional)
- References: image reference names
- Scene count guidance: shorts 3-6, tutorial 8-20

### 4.3 Prompt Gaps

| Gap | Current State | What is Needed |
|---|---|---|
| No transition instructions | Prompt does not mention transition | Generate transition type, duration, easing per scene |
| No voice type spec | Prompt does not mention voice type | Generate voiceType per scene (anak/pria/wanita/lansia/narrator) |
| No audio spec | Prompt does not mention audio | Generate musicCue, sfxCue, ambientCue per scene |
| Basic image prompts | Example prompt is 1 line | Structured layers: subject, composition, lighting, camera, style, mood |
| No scene duration | Prompt does not generate per-scene duration | Generate durationSeconds per scene |
| Single JSON output | One JSON object for all | Keep single JSON, expand schema |

---

## 5. Scene Transition Analysis

### 5.1 Current State

- Schema: `scenes` table only has `orderNo` (integer), `description` (text), `voiceoverScript` (text) — `schema.ts:89-99`
- Zod: `SceneSchema` = `{ order, description, voiceover_script, image_prompts }` — `schemas.ts:27-32`
- Prompt: No transition instruction — `prompt-builder.ts:71-97`
- UI: Scenes displayed as card list in `result-tabs.tsx:41-101` — no flow visualization

### 5.2 Why It is Jarring

1. No transition metadata — scenes change with no visual effect
2. No scene duration — timing not determined
3. No visual flow indicator — UI shows scenes as independent cards
4. No continuity cues — prompt does not instruct visual continuity between scenes

### 5.3 Transition Types (Best Practices)

From web research:

| Transition | Use Case | Duration |
|---|---|---|
| `cut` | Default, fast, action scenes | 0s (instant) |
| `dissolve` / `crossfade` | Time passage, location change | 0.5-2s |
| `fade_to_black` | Chapter end, dramatic pause | 1-3s |
| `fade_to_white` | Dream sequence, flashback | 1-3s |
| `wipe` | Location change, travel | 0.5-1s |
| `match_cut` | Visual continuity (shape/color match) | 0s |
| `morph` | Character transformation | 0.5-2s |
| `zoom_transition` | Focus shift, dramatic reveal | 0.5-1.5s |

Sources: studiobinder.com/blog/types-of-editing-transitions-in-film, boords.com/blog/video-transition-effects, adobe.com/ph_fil/creativecloud/video/discover/types-of-film-transitions.html

### 5.4 What Needs to Be Added

Schema fields per scene:
- `transitionType` (enum: cut, dissolve, fade_black, fade_white, wipe, match_cut, morph, zoom)
- `transitionDuration` (integer, milliseconds)
- `transitionEasing` (enum: linear, ease_in, ease_out, ease_in_out)
- `transitionDirection` (enum: forward, backward, loop — semantic direction)

Prompt instructions:
- Generate transition type based on narrative context
- Match transition to emotional beat
- Ensure visual continuity between scenes

UI:
- Visual flow diagram showing scene connections
- Transition indicators between scene cards
- Preview of transition effect

---

## 6. Image Prompt Analysis

### 6.1 Current State

- Schema: `imagePrompts.promptText` = single text field — `schema.ts:108`
- Zod: `ImagePromptItemSchema` = `{ target, prompt_text, reference_filename }` — `schemas.ts:16-20`
- Prompt example (from `prompt-builder.ts:35-36`):
  ```
  Seorang anak perempuan berusia 10 tahun dengan rambut hitam panjang bergelombang, kaos kuning lengan pendek, celana pendek biru, dan sandal gunung coklat, berdiri di tepi hutan dengan ekspresi penasaran, gaya 3D Pixar, pencahayaan sinematik
  ```

### 6.2 Quality Assessment

| Aspek | Current | Ideal |
|---|---|---|
| Subject | Ada (deskripsi karakter) | Good |
| Composition | TIDAK ADA | Perlu: close-up, wide shot, low angle, etc. |
| Lighting | pencahayaan sinematik (generic) | Perlu: golden hour, rim light, soft diffused, etc. |
| Camera | TIDAK ADA | Perlu: lens type, focal length, depth of field |
| Style | gaya 3D Pixar (basic) | Perlu: detailed style modifiers, art direction |
| Mood | ekspresi penasaran (basic) | Perlu: emotional tone, atmosphere |
| Color | TIDAK ADA | Perlu: color palette, grading, saturation |
| Detail level | Medium | Perlu: high detail, texture descriptions |

### 6.3 Structured Prompt Formula (Best Practices)

From web research (budgetpixel.com, promptsera.com, kling.ai/blog):

```
[Subject] + [Action/Pose] + [Composition/Framing] + [Camera Angle] + [Lighting] + [Color/Mood] + [Style/Art Direction] + [Technical Specs] + [Quality Modifiers]
```

Example enhanced prompt:
```
A 10-year-old Indonesian girl with long wavy black hair, wearing a yellow t-shirt and blue shorts, standing at the edge of a dense tropical forest with curious expression, wide-angle composition from low angle, golden hour rim lighting with volumetric god rays through canopy, warm earth-tone color palette with emerald green accents, 3D Pixar-style rendering, depth of field f/2.8, 4K ultra-detailed, cinematic quality
```

### 6.4 What Needs to Be Added

Schema: `promptText` can stay as single string, but prompt builder must generate structured content.

Prompt enhancement:
- Instruct to generate prompt with 7-8 layers
- Template structure for consistency
- Style-specific modifiers (3D vs 2D)

UI:
- Display prompt with labeled sections (optional)
- Copy per section or full prompt

---

## 7. Voiceover Analysis

### 7.1 Current State

- Schema: `scenes.voiceoverScript` = text field — `schema.ts:94`
- Zod: `SceneSchema.voiceover_script` = string — `schemas.ts:30`
- Prompt: No voice type spec — `prompt-builder.ts:71-97`
- UI: Voiceover displayed as plain text in `result-tabs.tsx:191-205`

### 7.2 Voice Types Needed

From ElevenLabs documentation (elevenlabs.io/docs/eleven-creative/voices/voice-design) + BRD/PRD/SRS keputusan resmi:

| Voice Type | Indonesian | Use Case |
|---|---|---|
| `child` | Anak | Karakter anak-anak (usia < 12 tahun) |
| `teen` | Remaja | Karakter remaja (usia 12-17 tahun) |
| `adult_male` | Pria Dewasa | Narator pria, karakter pria dewasa |
| `adult_female` | Wanita Dewasa | Narator wanita, karakter wanita dewasa |
| `elderly_male` | Lansia Pria | Karakter pria lansia, wisdom figure |
| `elderly_female` | Lansia Wanita | Karakter wanita lansia, wisdom figure |
| `narrator` | Narator | Narator non-character, voice-over umum |

> **Catatan:** 7 types ini = keputusan resmi (BRD S6.4 + PRD S7.4 + SRS Lampiran B.2). Tidak ada `male`, `female`, `elderly`, atau `custom` — semua sudah dipecah berdasarkan usia dan gender.

### 7.3 What Needs to Be Added

Schema fields per scene:
- `voiceType` (enum: child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator)
- `voiceEmotion` (enum: neutral, happy, sad, excited, calm, dramatic)
- `voiceSpeed` (float, 0.5-2.0, default 1.0)
- `voicePitch` (enum: low, medium, high, auto)

Prompt instructions:
- Generate voiceType based on character role
- Match emotion to scene narrative
- Consider pacing for duration

UI:
- Voice type selector per scene
- Emotion dropdown
- Speed/pitch controls

---

## 8. Audio/Music Analysis

### 8.1 Current State

**TIDAK ADA** — zero audio support in entire codebase.

### 8.2 Audio Categories Needed

From sound design best practices (animationexploration.org, theplot.io):

| Category | Description | Example |
|---|---|---|
| Background Music | Continuous music bed per scene | Orchestral, upbeat, mysterious |
| SFX (Sound Effects) | Discrete sounds tied to actions | Footsteps, door creak, whoosh |
| Ambient | Environmental atmosphere | Forest birds, city traffic, rain |
| Music Cue | Specific music moment | Tension build, emotional peak |
| Transition Audio | Sound during transitions | Whoosh, chime, rumble |

### 8.3 What Needs to Be Added

Option A: New table `scene_audio`:
- `id`, `projectId`, `sceneId`
- `audioType` (enum: background_music, sfx, ambient, music_cue, transition)
- `description` (text — what the audio should be)
- `timing` (enum: start, throughout, end, specific_moment)
- `duration` (integer, seconds)
- `volume` (float, 0.0-1.0)
- `fade_in` (integer, ms)
- `fade_out` (integer, ms)

Option B: Extend `scenes` table:
- `backgroundMusic` (text — description)
- `sfxCues` (text — JSON array of SFX)
- `ambientAudio` (text — description)

Prompt instructions:
- Generate audio specifications per scene
- Match audio mood to visual narrative
- Consider timing and transitions

UI:
- Audio specification panel per scene
- Music/SFX/ambient separate fields
- Volume and timing controls

---

## 9. Theme System Analysis

### 9.1 Current State

**CSS infrastructure already complete:**
- `globals.css:4-28` — Light theme tokens (default)
- `globals.css:49-72` — Dark theme tokens (`.dark` class override)
- All shadcn/ui components use CSS variables — automatically support light/dark

**App forces dark mode:**
- `layout.tsx:66` — `<html lang="id" className="dark">` — hardcoded
- `page.tsx:24` — Landing page wraps `<div className="dark">` — hardcoded
- `provider-card.tsx:88` — Hardcoded dark: variants (`dark:bg-green-950`)

**Missing:**
- Theme toggle component
- localStorage persistence
- `next-themes` package (not installed)
- System preference detection

### 9.2 Design Tokens Already Defined

| Token | Light (default) | Dark (`.dark` class) | Sitasi |
|---|---|---|---|
| `--color-background` | `#ffffff` | `#0a0a0a` | `globals.css:4,50` |
| `--color-foreground` | `#0a0a0a` | `#fafafa` | `globals.css:5,51` |
| `--color-card` | `#ffffff` | `#0f0f0f` | `globals.css:6,52` |
| `--color-primary` | `#7c3aed` | `#a78bfa` | `globals.css:10,56` |
| `--color-secondary` | `#f4f4f5` | `#27272a` | `globals.css:12,58` |
| `--color-muted` | `#f4f4f5` | `#27272a` | `globals.css:14,60` |
| `--color-accent` | `#ede9fe` | `#3b0764` | `globals.css:16,62` |
| `--color-border` | `#e4e4e7` | `#27272a` | `globals.css:23,69` |

### 9.3 What Needs to Be Added

**Recommended: `next-themes`**
- Install: `pnpm add next-themes`
- Add `<ThemeProvider>` to `providers.tsx`
- Remove hardcoded `className="dark"` from `layout.tsx:66`
- Remove `<div className="dark">` from `page.tsx:24`
- Add `<ThemeToggle>` component to `app-header.tsx`
- Persist in localStorage

Files to modify:
- `src/app/layout.tsx:66` — remove `className="dark"`
- `src/app/[locale]/page.tsx:24` — remove `<div className="dark">`
- `src/components/providers.tsx` — add ThemeProvider
- `src/components/common/app-header.tsx` — add ThemeToggle
- `src/components/settings/provider-card.tsx:88` — remove hardcoded dark: variants

i18n keys to add:
- `common.theme` / `common.themeToggle`
- `common.lightMode` / `common.darkMode` / `common.systemMode`

---

## 10. Web Research Findings

### 10.1 Scene Transitions

Sources: studiobinder.com, boords.com, adobe.com, wevideo.com

- 3 transitions cover 95%+ of use cases: cut, dissolve, fade to color
- Match cut = most creative, maintains visual continuity
- Dissolve = time passage, emotional connection between scenes
- Fade to black = chapter end, dramatic pause
- Wipe = location/travel change
- Key principle: transition should serve story, not distract

### 10.2 Complex Image Prompts

Sources: budgetpixel.com, promptsera.com, kling.ai, runway help

- Formula: Subject + Action + Composition + Camera + Lighting + Color + Style + Technical
- Camera terms: close-up, wide shot, low angle, bird's eye, dolly zoom
- Lighting terms: golden hour, rim light, volumetric, soft diffused, chiaroscuro
- Style modifiers: cinematic, photorealistic, painterly, flat design, isometric
- Quality boosters: 4K, ultra-detailed, sharp focus, depth of field

### 10.3 Voice Types

Sources: elevenlabs.io docs

- Voice Design v3: age (child/teen/adult/elderly), gender, accent, emotion
- SSML support: v3 does NOT support SSML break tags — use punctuation for pauses
- Voice categories: narrator, character, custom
- Emotion control: through text structure, punctuation, not explicit tags

### 10.4 Light/Dark Theme in Next.js 15 + Tailwind v4

- `next-themes` is the standard solution
- Works with Tailwind v4 CSS variable system
- Supports `class` strategy (toggle `.dark` class on `<html>`)
- localStorage persistence built-in
- System preference detection built-in
- Zero config with shadcn/ui

---

## 11. Gap Analysis

### 11.1 Per Requirement

| # | Requirement | Code Exists | Schema Ready | Prompt Ready | UI Ready | Export Ready | Overall |
|---|---|---|---|---|---|---|---|
| 1 | Light Theme | CSS tokens YES, toggle NO | N/A | N/A | NO | N/A | 30% |
| 2 | Scene Transition | NO | NO | NO | NO | NO | 0% |
| 3 | Complex Image Prompts | Partial (basic prompts) | Partial (promptText) | NO | Partial (display) | Partial (JSON) | 20% |
| 4 | Voiceover Voice Type | NO | NO | NO | NO | NO | 0% |
| 5 | Supporting Audio | NO | NO | NO | NO | NO | 0% |

### 11.2 TIDAK ADA BUKTI (no evidence found)

| # | Claim | Status |
|---|---|---|
| 1 | Ada theme toggle di codebase | TIDAK ADA BUKTI |
| 2 | Ada transition metadata di schema | TIDAK ADA BUKTI |
| 3 | Ada voice type specification | TIDAK ADA BUKTI |
| 4 | Ada audio/music support | TIDAK ADA BUKTI |
| 5 | Image prompts punya structured layers | TIDAK ADA BUKTI |
| 6 | `next-themes` terinstall | TIDAK ADA BUKTI |
| 7 | Scene duration ditentukan per scene | TIDAK ADA BUKTI |

### 11.3 What is Ready (can be leveraged)

| # | Asset | Status | How to Leverage |
|---|---|---|---|
| 1 | Light/dark CSS tokens | READY | Just toggle class, no need to create new tokens |
| 2 | shadcn/ui components | READY | All components use CSS variables, auto support both themes |
| 3 | Zod validation | READY | Extend schema with new fields |
| 4 | Prompt builder architecture | READY | Extend `buildSystemPrompt()` with new instructions |
| 5 | SSE streaming | READY | Add new stages for audio/transition generation |
| 6 | Export (JSON/Markdown) | READY | Extend template for transition/audio data |
| 7 | i18n infrastructure | READY | Add keys for new UI elements |
| 8 | Drizzle ORM | READY | `drizzle-kit generate` for new migrations |

---

## 12. Asumsi

| # | Asumsi | Alasan |
|---|---|---|
| ASM-1 | Light theme toggle pakai `next-themes` | Standard solution, zero-config with shadcn/ui, localStorage built-in |
| ASM-2 | Scene transition ditambah sebagai field di `scenes` table | Lebih simple dari new table, cukup untuk MVP |
| ASM-3 | Complex image prompts = enhance prompt builder, bukan new schema field | `promptText` tetap single string, tapi content-nya lebih structured |
| ASM-4 | Voice type = enum field di `scenes` table | Simple, cukup untuk MVP |
| ASM-5 | Supporting audio = new table `scene_audio` | Multiple audio per scene, lebih flexible dari single field |
| ASM-6 | Semua requirement bisa diimplementasi dalam 1 schema migration | Drizzle supports additive migrations |
| ASM-7 | Export format tetap JSON + Markdown | Tidak ada requirement untuk format baru |
| ASM-8 | Voice type enum: child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator (7 types) | Keputusan resmi BRD/PRD/SRS, lebih granular dari MVP |
| ASM-9 | Transition types: cut, dissolve, fade_black, fade_white, wipe, match_cut | 6 types cover 95% use cases |
| ASM-10 | Audio types: background_music, sfx, ambient, music_cue | 4 categories cover basic needs |

---

## 13. Daftar Sitasi

| # | Path:Baris | Klaim |
|---|---|---|
| C01 | `src/app/layout.tsx:66` | Hardcoded `className="dark"` — dark mode forced |
| C02 | `src/app/[locale]/page.tsx:24` | Landing page wrap `<div className="dark">` |
| C03 | `src/app/globals.css:4-28` | Light theme CSS tokens defined (unused) |
| C04 | `src/app/globals.css:49-72` | Dark theme CSS tokens defined (`.dark` class) |
| C05 | `src/lib/db/schema.ts:89-99` | `scenes` table: only orderNo, description, voiceoverScript |
| C06 | `src/lib/db/schema.ts:102-116` | `image_prompts` table: promptText = single string |
| C07 | `src/lib/validation/schemas.ts:27-32` | `SceneSchema`: order, description, voiceover_script, image_prompts |
| C08 | `src/lib/validation/schemas.ts:16-20` | `ImagePromptItemSchema`: target, prompt_text, reference_filename |
| C09 | `src/lib/ai/prompt-builder.ts:71-97` | System prompt: no transition, voice type, or audio instructions |
| C10 | `src/lib/ai/prompt-builder.ts:35-36` | Example image prompt: basic 1-line description |
| C11 | `src/lib/ai/prompts/scenes.system.ts:1` | Re-exports prompt-builder (no dedicated scene prompt) |
| C12 | `src/lib/ai/prompts/image-prompts.system.ts:1` | Re-exports prompt-builder (no dedicated image prompt) |
| C13 | `src/lib/ai/prompts/voiceover.system.ts:1` | Re-exports prompt-builder (no dedicated voiceover prompt) |
| C14 | `src/components/generate/result-tabs.tsx:41-101` | Scene display: no transition visualization |
| C15 | `src/components/generate/result-tabs.tsx:191-205` | Voiceover display: plain text only |
| C16 | `src/components/generate/generate-form.tsx:23-31` | Stage labels: no audio/transition stages |
| C17 | `src/app/api/v1/generate/route.ts:156-164` | Scene save: only orderNo, description, voiceoverScript |
| C18 | `src/app/api/v1/projects/[id]/export/route.ts:16-17` | Export: only JSON or Markdown |
| C19 | `src/lib/export/markdown.template.ts:41-65` | Markdown template: no transition/audio sections |
| C20 | `package.json:50` | Next.js ^15.1.0 |
| C21 | `package.json:81` | Tailwind CSS ^4.0.0 |
| C22 | `package.json:47` | Drizzle ORM ^0.38.0 |
| C23 | `package.json:25` | @libsql/client ^0.14.0 (Turso) |
| C24 | `package.json:42` | ai ^4.0.0 (Vercel AI SDK) |
| C25 | `package.json:51` | next-auth 5.0.0-beta.25 |
| C26 | `package.json:48` | framer-motion ^12.40.0 |
| C27 | `drizzle.config.ts:18` | Dialect: turso |
| C28 | `src/lib/db/schema.ts:33-50` | `projects` table: durationType, durationTargetSeconds, styleType, aspectRatio |
| C29 | `src/lib/db/schema.ts:70-86` | `characters` table: 9 identity fields |
| C30 | `src/lib/db/schema.ts:135-146` | `supporting_characters` table: nama, tipe, aksi |
| C31 | `messages/id.json:1-197` | i18n keys: no theme/audio/transition/voice type keys |
| C32 | `messages/en.json:1-197` | i18n keys: no theme/audio/transition/voice type keys |
| C33 | `src/components/providers.tsx:1-7` | Only SessionProvider, no ThemeProvider |
| C34 | `src/components/common/app-header.tsx:54` | LanguageToggle exists, no ThemeToggle |
| C35 | `src/lib/templates/titles.ts:1-18` | 8 title templates, no audio/transition presets |
| C36 | `product-docs/PRD.md:115` | F-17 Light Mode Toggle = COULD (now promoted to MUST) |
| C37 | `product-docs/PRD.md:671` | OOS-18 Dark/Light mode toggle = OOS V2 (now promoted to MUST) |
| C38 | Web: studiobinder.com | Transition types: cut, dissolve, fade, wipe cover 95% use cases |
| C39 | Web: budgetpixel.com | Image prompt structure: Subject + Composition + Camera + Lighting + Style |
| C40 | Web: elevenlabs.io | Voice types: child, teen, adult, elderly; no SSML in v3 |
| C41 | Web: kling.ai | Prompt formula: Subject + Movement + Scene + Cinematic |
| C42 | Web: animationexploration.org | Sound design layering: music + SFX + ambient + voice |

---

> **Catatan:** Dokumen ini = sumber kebenaran faktual untuk pipeline docgen. Semua subagent (BRD/MRD/PRD/SRS/ARCHITECTURE) WAJIB rujuk temuan di sini, bukan mengarang. Tanpa bukti = "TIDAK ADA BUKTI".
