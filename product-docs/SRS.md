# Software Requirement Specification (SRS)
## PromptFlow V3 — Animation Brief Engine Update

**Versi:** 3.0
**Tanggal:** 2026-06-22
**Status:** Draft
**Penanggung Jawab:** PromptFlow Product Team

---

## 1. Arsitektur Sistem & Pendekatan Teknis

### 1.1 Arsitektur Keseluruhan

PromptFlow V3 menggunakan arsitektur **Next.js 15 App Router** monolitik dengan pattern berikut:

```
Browser (React 19 + Tailwind v4 + shadcn/ui)
  ├── Landing Page (SSR)
  ├── Auth Pages (SSR)
  ├── Generate Page (SSE streaming)
  ├── Projects / Dashboard (SSR + CSR)
  └── Settings (CSR)
       │ HTTP/SSE
Next.js API Routes (Edge + Node Runtime)
  ├── /api/auth/[...nextauth]  (Edge)
  ├── /api/v1/generate         (Node, maxDuration=300)
  ├── /api/v1/projects/*       (Node)
  ├── /api/v1/settings/*       (Node)
  └── /api/v1/dashboard/*      (Node)
  Middleware: auth guard + rate limit + i18n
       │
Business Logic Layer (src/lib/)
  ├── ai/        prompt-builder, llm-client, response-parser, consistency-check
  ├── db/        schema (Drizzle), repositories, client (Turso/libSQL)
  ├── validation/ schemas (Zod)
  ├── crypto/    aes (AES-256-GCM)
  ├── auth/      NextAuth v5 config
  ├── i18n/      next-intl config
  ├── templates/  presets (5 V3 templates)
  ├── export/    markdown template
  └── landing/   features, sections
       │
Data Layer
  ├── Turso (libSQL) — 10 tables
  ├── Vercel Blob — file storage
  └── In-memory Map — rate limiting
       │
External Services
  ├── LLM Providers (Ollama, OpenRouter, 9router)
  │   └── OpenAI-compatible API (/chat/completions)
  └── Vercel Platform (deploy, analytics, blob)
```

### 1.2 Data Flow Generate (SSE Streaming)

```
User -> GenerateForm -> POST /api/v1/generate
  -> middleware (auth + rate limit)
  -> createProject (status=generating)
  -> buildSystemPrompt + buildUserMessage (prompt-builder.ts)
  -> llmClient.chat (OpenAI-compatible, 240s timeout, 2 retries)
  -> SSE stream events: stage -> log -> progress
  -> response-parser (JSON extraction + Zod validation)
  -> consistency-checker (character identity cross-scene)
  -> bulkCreateScenes / bulkCreateImagePrompts / etc.
  -> [GAP: audio_specs, color_palette, technical, voiceover_speaker NOT saved]
  -> createGenerationLog
  -> SSE: done event with result + warnings
```

### 1.3 Pendekatan V3 Update

Update V3 bersifat **incremental gap closure** — bukan rewrite. Strategi:

1. **Database migration** — 3 ALTER TABLE (non-breaking, nullable columns)
2. **Generate route patch** — tambah INSERT logic untuk 4 gap fields
3. **Prompt builder refinement** — perkuat instruksi transisi/voice/image/audio
4. **UI verification** — pastikan komponen existing render data baru
5. **E2E test expansion** — 10 critical path tests
6. **Landing page update** — tambah V3 features section

---

## 2. Tech Stack + Justifikasi

| Component | Versi | Justifikasi |
|-----------|-------|-------------|
| Next.js | ^15.1.0 | App Router, Server Components, SSE streaming, middleware |
| React | ^19.0.0 | Concurrent features, use() hook, Server Components |
| TypeScript | ^5.7.0 | Strict mode, type safety, noImplicitAny |
| Tailwind CSS | ^4.0.0 | Utility-first, CSS variables for theming, v4 @theme tokens |
| shadcn/ui | latest | Accessible primitives, customizable, Tailwind-native |
| Drizzle ORM | ^0.38.0 | Type-safe SQL, SQLite support, migration tooling |
| Turso/libSQL | ^0.14.0 | Edge-compatible SQLite, low latency, free tier |
| NextAuth | 5.0.0-beta.25 | Credentials provider, JWT sessions, Edge-safe |
| next-intl | ^3.26.0 | i18n id/en, App Router native, namespace support |
| next-themes | ^0.4.6 | Dark/light/system toggle, class attribute, no FOWT |
| Zod | ^3.24.0 | Runtime validation, TypeScript inference, LLM output parsing |
| Vercel AI SDK | ^4.0.0 | SSE helpers, OpenAI-compatible provider |
| framer-motion | ^12.40.0 | Theme transitions, UI animations |
| lucide-react | ^0.468.0 | Icon library, tree-shakeable |
| sonner | ^1.7.0 | Toast notifications |
| bcryptjs | ^2.4.3 | Password hashing |
| Vitest | ^2.1.0 | Unit testing, v8 coverage, 80% threshold |
| Playwright | ^1.49.0 | E2E testing, Chromium, 120s timeout |
| pnpm | 11.7.0 | Fast package manager, frozen lockfile |
| Node.js | >=20.0.0 | Runtime requirement |

---

## 3. Spesifikasi Fungsional Detail

### 3.1 Mapping PRD Feature -> Realisasi Teknis

#### F-M01: Data Persistence — Audio Specs

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M01, AC-M01 |
| **Problem** | generate/route.ts:176-182 — audio_specs dari LLM output TIDAK disimpan ke scene_audio table. Audio hanya bisa disimpan via manual POST |
| **Root Cause** | Generate route tidak memiliki logic INSERT ke scene_audio setelah scene dibuat. sceneId tidak di-map dari bulkCreateScenes result |
| **Solution** | 1. Modifikasi bulkCreateScenes agar RETURNING id. 2. Map validated.scenes[i].audio_specs ke scene_audio INSERT dengan scene_id dari step 1. 3. Gunakan createSceneAudio dari scene-audio.repository.ts |
| **Implementation** | File: src/app/api/v1/generate/route.ts, lines 156-174. Tambah blok SETELAH bulkCreateScenes |
| **Zod Schema** | SceneAudioSpecSchema (schemas.ts:39-55) — sudah lengkap, tidak perlu ubah |
| **DB Schema** | sceneAudio table (schema.ts:172-196) — 18 kolom, sudah lengkap |
| **Error Handling** | Graceful skip jika audio_specs kosong/null. Log warning via emitLog |

#### F-M02: Data Persistence — Color Palette + Technical

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M02, AC-M02 |
| **Problem** | image_prompts table (schema.ts:118-139) TIDAK memiliki kolom color_palette dan technical. Zod ImagePromptItemSchema (schemas.ts:29-30) sudah punya field-nya |
| **Root Cause** | V3 migration 0001_v3_core_features.sql menambah 5 kolom tapi melewatkan color_palette dan technical |
| **Solution** | 1. Buat migration 0002_v3_gap_closure.sql dengan 2 ALTER TABLE. 2. Update Drizzle schema imagePrompts table. 3. Update generate route INSERT |
| **Migration SQL** | ALTER TABLE image_prompts ADD color_palette TEXT; + ALTER TABLE image_prompts ADD technical TEXT; |
| **Drizzle Schema** | Tambah colorPalette: text(color_palette) dan technical: text(technical) di imagePrompts table |
| **Generate Route** | Tambah colorPalette: p.color_palette ?? null, technical: p.technical ?? null di bulkCreateImagePrompts mapping |

#### F-M03: Data Persistence — Voiceover Speaker

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M03, AC-M03 |
| **Problem** | scenes table (schema.ts:90-115) TIDAK memiliki kolom voiceover_speaker. Zod SceneSchema.voiceover_speaker (schemas.ts:61) sudah ada |
| **Root Cause** | V3 migration melewatkan kolom ini saat ALTER TABLE scenes |
| **Solution** | 1. Tambah ALTER TABLE di migration 0002. 2. Update Drizzle schema. 3. Update generate route bulkCreateScenes mapping |
| **Migration SQL** | ALTER TABLE scenes ADD voiceover_speaker TEXT DEFAULT narrator; |
| **Drizzle Schema** | Tambah voiceoverSpeaker: text(voiceover_speaker).default(narrator) di scenes table |
| **Generate Route** | Tambah voiceoverSpeaker: s.voiceover_speaker ?? narrator di bulkCreateScenes mapping |

#### F-M04: Scene Transition Flow Patterns

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M04, AC-M04 |
| **Problem** | Flow patterns di prompt-builder.ts:246-278 sudah ada 5 pola (A-E), tapi beberapa edge case kurang terdefinisi |
| **Current State** | 6 transition types. 5 flow patterns (A-E). Rules: scene 1 = fade_in/fade_to_white, scene terakhir = fade_to_black. Durasi dissolve/wipe/fade: 800-3000ms |
| **Enhancement** | 1. Tambah rule: mood_signifikan_change -> dissolve/fade, BUKAN cut. 2. Tambah rule: aksi_cepat + fast_pacing -> match_cut (0-200ms). 3. Tambah rule: scene_berurutan_mood_sama -> cut atau dissolve. 4. Tambah durasi minimum per transisi type |
| **File** | src/lib/ai/prompt-builder.ts, lines 246-278 |

#### F-M05: 8-Layer Image Prompt Completeness

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M05, AC-M05 |
| **Problem** | 1) color_palette dan technical tidak tersimpan ke DB (solved by F-M02). 2) Generate route tidak menyimpan 6 layer lainnya — HANYA promptText, tipe, target, referenceFilename |
| **Root Cause** | bulkCreateImagePrompts mapping (route.ts:179-182) hanya mengirim 4 field ke DB |
| **Solution** | Update mapping untuk sertakan SEMUA 8 layer fields: composition, lighting, camera, moodAtmosphere, styleReferences, colorPalette, technical |
| **Current DB Columns** | prompt_text OK, composition OK, lighting OK, camera OK, mood_atmosphere OK, style_references OK, color_palette MISSING (F-M02), technical MISSING (F-M02) |
| **Prompt Builder** | Instruksi 8-layer sudah ada di prompt-builder.ts:313-335 |

#### F-M06: Voice Type Mapping Specificity

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M06, AC-M06 |
| **Problem** | Voice mapping rules di prompt-builder.ts:281-310 sudah cukup lengkap, tapi perlu penambahan |
| **Current State** | 7 voice types defined. Age->voice mapping ada. Emotion/speed/pitch rules ada tapi kurang detail |
| **Enhancement** | 1. mood->emotion table: cheerful->happy, dramatic->dramatic, tense->serious, peaceful->calm, mysterious->dramatic. 2. pacing->speed: fast->1.1-1.2, normal->0.95-1.05, slow->0.8-0.95. 3. pitch rules: child->high, teen->medium/high, adult_male->low/medium, adult_female->medium, elderly->low |
| **File** | src/lib/ai/prompt-builder.ts, lines 281-310 |

#### F-M07: Light Theme Landing Page

| Aspek | Realisasi Teknis |
|-------|------------------|
| **PRD Ref** | FR-M07, AC-M07 |
| **Problem** | [ASUMSI] Root layout mungkin belum wrap dengan Providers untuk landing page |
| **Current State** | providers.tsx sudah include ThemeProvider + SessionProvider. globals.css sudah punya .dark block. ThemeToggle di app-header.tsx |
| **Verification Needed** | 1. Cek apakah [locale]/layout.tsx wrap children dengan Providers. 2. Cek landing page components pakai CSS variables. 3. Test theme toggle di landing page tanpa login |
| **File** | src/app/[locale]/layout.tsx, src/components/providers.tsx, src/components/landing/ |

### 3.2 Should-Have Features

#### F-S01: Landing Page V3 Features Section

| Aspek | Realisasi Teknis |
|-------|------------------|
| **Problem** | features.ts hanya punya 6 V1/V2 features. Tidak ada V3 features |
| **Solution** | Tambah 5 feature entries: Scene Transitions (6 jenis), Voice Type (7 tipe), Audio Specs (5 jenis), Image Prompts (8-layer), Theme Toggle (3 mode) |
| **File** | src/lib/landing/features.ts |
| **i18n** | Tambah keys di messages/id.json dan messages/en.json |

#### F-S02: E2E Test Expansion

| Aspek | Realisasi Teknis |
|-------|------------------|
| **Problem** | Hanya 1 E2E test: e2e/login.spec.ts. Coverage minimal |
| **Solution** | Tambah 9 E2E test files (total 10). Gunakan Playwright Chromium |
| **Test Matrix** | Lihat Section 8.3 |

#### F-S03: Image Prompt Display Enhancement

| Aspek | Realisasi Teknis |
|-------|------------------|
| **Problem** | image-prompt-display.tsx hanya render 6 layer. color_palette dan technical tidak dirender |
| **Solution** | Tambah 2 section di component: color_palette (color chips atau text) dan technical (text block) |
| **File** | src/components/generate/image-prompt-display.tsx |

---

## 4. Data Model / Struktur Data / Skema

### 4.1 Database Tables (10 Total)

#### 4.1.1 Perubahan V3 — Migration 0002_v3_gap_closure.sql

**3 ALTER TABLE statements:**

```sql
-- 1. scenes: tambah voiceover_speaker
ALTER TABLE scenes ADD voiceover_speaker TEXT DEFAULT 'narrator';

-- 2. image_prompts: tambah color_palette
ALTER TABLE image_prompts ADD color_palette TEXT;

-- 3. image_prompts: tambah technical
ALTER TABLE image_prompts ADD technical TEXT;
```

**Rollback:**
```sql
ALTER TABLE scenes DROP COLUMN voiceover_speaker;
ALTER TABLE image_prompts DROP COLUMN color_palette;
ALTER TABLE image_prompts DROP COLUMN technical;
```

#### 4.1.2 Drizzle Schema Update (src/lib/db/schema.ts)

**scenes table — tambah:**
```typescript
voiceoverSpeaker: text('voiceover_speaker').default('narrator'),
```

**imagePrompts table — tambah:**
```typescript
colorPalette: text('color_palette'),
technical: text('technical'),
```

#### 4.1.3 Tabel scenes (Setelah V3 Update)

| Kolom | Tipe | Default | Status |
|-------|------|---------|--------|
| id | integer PK | autoincrement | Existing |
| project_id | integer FK | — | Existing |
| order_no | integer | — | Existing |
| description | text | — | Existing |
| voiceover_script | text | — | Existing |
| transition_type | text | cut | V3 (0001) |
| transition_duration_ms | integer | 0 | V3 (0001) |
| transition_easing | text | linear | V3 (0001) |
| transition_direction | text | forward | V3 (0001) |
| voice_type | text | narrator | V3 (0001) |
| voice_emotion | text | neutral | V3 (0001) |
| voice_speed | real | 1.0 | V3 (0001) |
| voice_pitch | text | auto | V3 (0001) |
| duration_seconds | integer | null | V3 (0001) |
| scene_pacing | text | normal | V3 (0001) |
| scene_mood | text | null | V3 (0001) |
| **voiceover_speaker** | **text** | **narrator** | **V3 (0002) — BARU** |
| created_at | integer | unixepoch() | Existing |

#### 4.1.4 Tabel image_prompts (Setelah V3 Update)

| Kolom | Tipe | Default | Status |
|-------|------|---------|--------|
| id | integer PK | autoincrement | Existing |
| project_id | integer FK | — | Existing |
| scene_id | integer FK | null | Existing |
| tipe | text | — | Existing |
| target | text | — | Existing |
| prompt_text | text | — | Existing |
| reference_filename | text | null | Existing |
| composition | text | null | V3 (0001) |
| lighting | text | null | V3 (0001) |
| camera | text | null | V3 (0001) |
| mood_atmosphere | text | null | V3 (0001) |
| style_references | text | null | V3 (0001) |
| **color_palette** | **text** | **null** | **V3 (0002) — BARU** |
| **technical** | **text** | **null** | **V3 (0002) — BARU** |
| created_at | integer | unixepoch() | Existing |

#### 4.1.5 Tabel scene_audio (Existing — Tidak Berubah)

18 kolom, sudah lengkap. Referensi: schema.ts:172-196.

| Kolom | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| id | integer PK | autoincrement | |
| project_id | integer FK | — | CASCADE |
| scene_id | integer FK | — | CASCADE |
| audio_type | text | — | 5 enum values |
| description | text | — | |
| timing | text | throughout | 4 enum values |
| duration_seconds | integer | null | |
| volume | real | 0.7 | 0.0-1.0 |
| fade_in_ms | integer | 0 | |
| fade_out_ms | integer | 0 | |
| music_genre | text | null | 8 genre options |
| music_mood | text | null | 8 mood options |
| music_tempo_bpm | integer | null | 60-200 |
| music_instruments | text | null | comma-separated |
| music_volume | real | 0.7 | |
| sfx_list | text | null | JSON array |
| ambient_type | text | null | 9 type options |
| ambient_volume | real | 0.5 | |
| created_at | integer | unixepoch() | |

### 4.2 Zod Schemas (src/lib/validation/schemas.ts)

**Status: SUDAH LENGKAP untuk V3.** Tidak perlu ubah schema.

| Schema | V3 Fields | Status |
|--------|-----------|--------|
| CharacterProfileSchema | voice_type (7 enum), age_range | Complete |
| ImagePromptItemSchema | composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical | Complete |
| SceneAudioSpecSchema | audio_type (5 enum), timing, volume, fade, music_*, sfx_list, ambient_* | Complete |
| SceneSchema | transition_* (4), voice_* (4), duration_seconds, scene_pacing, scene_mood, audio_specs[], voiceover_speaker | Complete |
| ThemePreferenceSchema | dark/light/system | Complete |
| PromptPackageSchema | Full V3 root structure | Complete |

**Catatan:** color_palette di ImagePromptItemSchema (schemas.ts:29) menggunakan z.union([z.string(), z.array(z.string())]) — flexible untuk string atau array. Generate route perlu handle kedua format saat INSERT ke DB (join array ke string jika array).

### 4.3 Entity Relationship (Simplified)

```
users (1) -> (N) provider_configs
users (1) -> (N) projects
projects (1) -> (N) scenes
projects (1) -> (N) characters
projects (1) -> (N) image_prompts
projects (1) -> (N) supporting_characters
projects (1) -> (N) generation_logs
projects (1) -> (N) asset_references
scenes (1) -> (N) scene_audio
scenes (1) -> (N) image_prompts (via scene_id, nullable FK)
scenes (1) -> (N) supporting_characters (via scene_id, nullable FK)
```

---

## 5. Interface / API / Integrasi

### 5.1 API Endpoints Terdampak V3

| Method | Path | Perubahan V3 | Keterangan |
|--------|------|-------------|------------|
| POST | /api/v1/generate | MODIFY | Tambah INSERT audio_specs, color_palette, technical, voiceover_speaker |
| GET | /api/v1/projects/[id]/scenes | VERIFY | Pastikan voiceover_speaker ter-return |
| GET | /api/v1/projects/[id]/image-prompts | VERIFY | Pastikan color_palette, technical ter-return |
| GET | /api/v1/projects/[id]/scenes/[sceneId]/audio | NO CHANGE | Sudah berfungsi |
| POST | /api/v1/projects/[id]/scenes/[sceneId]/audio | NO CHANGE | Sudah berfungsi |
| GET | /api/v1/projects/[id]/export | VERIFY | Pastikan export JSON/Markdown include field baru |

### 5.2 Generate Route — Detail Perubahan

**File:** src/app/api/v1/generate/route.ts

**Current mapping (lines 158-174) — bulkCreateScenes:**
```typescript
await bulkCreateScenes(validated.scenes.map((s) => ({
  projectId: finalProjectId,
  orderNo: s.order,
  description: s.description,
  voiceoverScript: s.voiceover_script,
  transitionType: s.transition_type,
  transitionDurationMs: s.transition_duration_ms,
  transitionEasing: s.transition_easing,
  transitionDirection: s.transition_direction,
  voiceType: s.voice_type,
  voiceEmotion: s.voice_emotion,
  voiceSpeed: s.voice_speed,
  voicePitch: s.voice_pitch,
  durationSeconds: s.duration_seconds ?? null,
  scenePacing: s.scene_pacing,
  sceneMood: s.scene_mood ?? null,
  // MISSING: voiceoverSpeaker
})));
```

**Required change — tambah:**
```typescript
voiceoverSpeaker: s.voiceover_speaker ?? 'narrator',
```

**Current mapping (lines 179-182) — bulkCreateImagePrompts:**
```typescript
// Only 4 fields: projectId, sceneId, tipe, target, promptText, referenceFilename
// MISSING: composition, lighting, camera, moodAtmosphere, styleReferences, colorPalette, technical
```

**Required change — tambah 7 fields:**
```typescript
composition: p.composition ?? null,
lighting: p.lighting ?? null,
camera: p.camera ?? null,
moodAtmosphere: p.mood_atmosphere ?? null,
styleReferences: p.style_references ?? null,
colorPalette: Array.isArray(p.color_palette) ? p.color_palette.join(', ') : (p.color_palette ?? null),
technical: p.technical ?? null,
```

**New block — audio_specs INSERT (setelah bulkCreateScenes):**
```typescript
// V3: Save audio specs per scene
for (let i = 0; i < validated.scenes.length; i++) {
  const scene = validated.scenes[i];
  if (scene.audio_specs && scene.audio_specs.length > 0) {
    const sceneRow = createdScenes[i]; // requires bulkCreateScenes to return rows
    for (const audioSpec of scene.audio_specs) {
      await createSceneAudio({
        projectId: finalProjectId,
        sceneId: sceneRow.id,
        audioType: audioSpec.audio_type,
        description: audioSpec.description,
        timing: audioSpec.timing ?? 'throughout',
        durationSeconds: audioSpec.duration_seconds ?? null,
        volume: audioSpec.volume ?? 0.7,
        fadeInMs: audioSpec.fade_in_ms ?? 0,
        fadeOutMs: audioSpec.fade_out_ms ?? 0,
        musicGenre: audioSpec.music_genre ?? null,
        musicMood: audioSpec.music_mood ?? null,
        musicTempoBpm: audioSpec.music_tempo_bpm ?? null,
        musicInstruments: audioSpec.music_instruments ?? null,
        musicVolume: audioSpec.music_volume ?? 0.7,
        sfxList: audioSpec.sfx_list ?? null,
        ambientType: audioSpec.ambient_type ?? null,
        ambientVolume: audioSpec.ambient_volume ?? 0.5,
      });
    }
  }
}
```

**Prerequisite:** bulkCreateScenes harus RETURN rows (RETURNING *). Cek apakah repository sudah support. Jika belum, tambah .returning().

### 5.3 Repository Changes

Jika bulkCreateScenes tidak return rows, modifikasi:
```typescript
// Before
await db.insert(scenes).values(data);
// After
const rows = await db.insert(scenes).values(data).returning();
return rows;
```

**New import di generate route:**
```typescript
import { createSceneAudio } from '@/lib/db/repositories/scene-audio.repository';
```

### 5.4 LLM Integration

| Parameter | Value | Source |
|-----------|-------|--------|
| Endpoint | ${baseUrl}/chat/completions | llm-client.ts:35 |
| max_tokens | 32768 | llm-client.ts |
| temperature | 0.7 | llm-client.ts |
| stream | false (LLM), true (SSE to client) | llm-client.ts |
| timeout | 240s (AbortSignal) | llm-client.ts |
| retries | 2, exponential backoff (2s, 4s, max 8s) | llm-client.ts |
| JSON extraction | strip antml tags -> code block -> raw brace matching | response-parser.ts |

---

## 6. Constraint Teknis Konkret

### 6.1 Database Constraints

| Constraint | Detail | Enforcement |
|-----------|--------|-------------|
| Migration file | drizzle/0002_v3_gap_closure.sql | File di drizzle/ directory |
| Rollback | drizzle/0002_v3_gap_closure_rollback.sql | DROP COLUMN statements |
| Nullable columns | Semua 3 kolom baru nullable | Non-breaking migration |
| Default values | voiceover_speaker DEFAULT narrator | Consistent dengan Zod schema |
| Drizzle schema | Update schema.ts + generate types | $inferSelect / $inferInsert auto-update |

### 6.2 Generate Route Constraints

| Constraint | Detail |
|-----------|--------|
| Timeout | max 240s per LLM call, max 300s total (Vercel Hobby) |
| Rate limit | 10 req/min/user (in-memory Map) |
| Error handling | Graceful skip per field kosong, log warning, jangan crash entire generate |
| Audio specs batch | Max 5 audio specs per scene (5 types), max 20 scenes = max 100 audio INSERT per generate |
| color_palette format | Handle both string dan string[] dari LLM — join array ke comma-separated string |

### 6.3 TypeScript Constraints

| Constraint | Detail | Source |
|-----------|--------|--------|
| Strict mode | noImplicitAny, noImplicitReturns, noFallthroughCasesInSwitch | tsconfig.json:8-14 |
| Target | ES2022 | tsconfig.json |
| Module resolution | bundler | tsconfig.json |
| Path aliases | @/* -> ./src/* | tsconfig.json |

### 6.4 UI Constraints

| Constraint | Detail |
|-----------|--------|
| CSS variables | Gunakan globals.css @theme tokens, BUKAN hardcoded colors |
| Dark mode | .dark class override via next-themes attribute="class" |
| Icons | lucide-react only, BUKAN custom SVG |
| Component library | shadcn/ui primitives di src/components/ui/ |
| Responsive | Mobile-first Tailwind breakpoints (sm/md/lg/xl) |
| Animations | framer-motion untuk theme transitions |

### 6.5 Testing Constraints

| Constraint | Detail |
|-----------|--------|
| Unit test framework | Vitest ^2.1.0 |
| Coverage provider | v8 |
| Coverage thresholds | 80% lines, 80% branches, 80% functions, 80% statements |
| Coverage include | src/lib/**, src/app/api/** |
| Coverage exclude | **/*.test.ts, src/components/ui/** |
| E2E framework | Playwright ^1.49.0 |
| E2E browser | Chromium only |
| E2E timeout | 120s per test, 60s expect |
| E2E base URL | http://localhost:3000 |

### 6.6 Deployment Constraints

| Constraint | Detail |
|-----------|--------|
| Platform | Vercel |
| Build command | pnpm build |
| Install command | pnpm install --frozen-lockfile |
| Serverless timeout | 300s (Hobby plan) |
| Body size limit | 10mb (serverActions) |
| External packages | @libsql/client (serverExternalPackages) |
| Images domain | **.public.blob.vercel-storage.com |

### 6.7 I18n Constraints

| Constraint | Detail |
|-----------|--------|
| Locales | ['id', 'en'], default 'id' |
| Files | messages/id.json, messages/en.json |
| V3 keys needed | landing.features.transitions.*, landing.features.voice.*, landing.features.audio.*, landing.features.imagePrompts.*, landing.features.theme.* |
| Sync | id dan en HARUS punya key yang sama |

---

## 7. Tahapan Implementasi Teknis

### Phase 1: Database Migration (Estimasi: 30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 1.1 | Buat migration file | drizzle/0002_v3_gap_closure.sql | 3 ALTER TABLE statements |
| 1.2 | Buat rollback file | drizzle/0002_v3_gap_closure_rollback.sql | 3 DROP COLUMN statements |
| 1.3 | Update Drizzle schema | src/lib/db/schema.ts | Tambah 3 kolom baru |
| 1.4 | Generate Drizzle types | Run pnpm drizzle-kit generate | Pastikan typesync |
| 1.5 | Jalankan migration | Run pnpm drizzle-kit migrate atau manual | Verify kolom ada |

**Verifikasi:**
```sql
PRAGMA table_info(scenes);        -- voiceover_speaker ada
PRAGMA table_info(image_prompts); -- color_palette, technical ada
```

### Phase 2: Generate Route Update (Estimasi: 1 jam)

| # | Task | File | Detail |
|---|------|------|--------|
| 2.1 | Update bulkCreateScenes mapping | route.ts:158-174 | Tambah voiceoverSpeaker field |
| 2.2 | Update bulkCreateImagePrompts mapping | route.ts:179-182 | Tambah 7 layer fields |
| 2.3 | Tambah audio_specs INSERT block | route.ts (new block after line 174) | Loop scenes -> loop audio_specs -> createSceneAudio |
| 2.4 | Update bulkCreateScenes repository | Check project.repo.ts atau scene repo | Pastikan RETURNING rows |
| 2.5 | Tambah import | route.ts | Import createSceneAudio |
| 2.6 | Handle color_palette array->string | route.ts | Array.isArray(x) ? x.join(', ') : x |

**Verifikasi:** Generate test project, cek DB:
```sql
SELECT voiceover_speaker FROM scenes WHERE project_id = ?;
SELECT color_palette, technical FROM image_prompts WHERE project_id = ?;
SELECT * FROM scene_audio WHERE project_id = ?;
```

### Phase 3: Prompt Builder Refinement (Estimasi: 45 menit)

| # | Task | File | Lines | Detail |
|---|------|------|-------|--------|
| 3.1 | Tambah transition rules | prompt-builder.ts | 267-273 | 4 rules tambahan (mood change, action fast, same mood, durasi min) |
| 3.2 | Tambah voice mapping table | prompt-builder.ts | 300-305 | mood->emotion, pacing->speed, pitch per age |
| 3.3 | Perkuat 8-layer format | prompt-builder.ts | 327-335 | Contoh format lebih eksplisit per layer |
| 3.4 | Tambah audio spec examples | prompt-builder.ts | 377-384 | Contoh per scene type (opening, action, closing) |

**Verifikasi:** Generate test project dengan Ollama, cek output:
- Scene 1: transition = fade_in atau fade_to_white
- Scene terakhir: transition = fade_to_black
- 70%+ scenes: transition != cut
- Setiap scene: audio_specs.length >= 1
- Setiap image_prompt: 8 layer terisi

### Phase 4: Schema & UI Verification (Estimasi: 30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 4.1 | Verify Zod schemas | schemas.ts | Pastikan tidak ada perubahan needed |
| 4.2 | Verify image-prompt-display | image-prompt-display.tsx | Cek apakah color_palette + technical dirender |
| 4.3 | Fix image-prompt-display jika perlu | image-prompt-display.tsx | Tambah 2 section render |
| 4.4 | Verify audio-panel | audio-panel.tsx | Cek render data dari DB |
| 4.5 | Verify theme landing page | [locale]/layout.tsx | Cek Providers wrap |
| 4.6 | Verify features.ts | features.ts | Cek V3 features ada |

### Phase 5: Landing Page Update (Estimasi: 30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 5.1 | Update features.ts | src/lib/landing/features.ts | Tambah 5 V3 features |
| 5.2 | Tambah i18n keys (id) | messages/id.json | Keys untuk 5 features |
| 5.3 | Tambah i18n keys (en) | messages/en.json | Keys untuk 5 features |
| 5.4 | Verify landing page render | Browser test | Features section muncul |

### Phase 6: E2E Test Expansion (Estimasi: 2 jam)

| # | Task | File | Detail |
|---|------|------|--------|
| 6.1 | Register flow | e2e/register.spec.ts | Register -> redirect |
| 6.2 | Create project | e2e/project-create.spec.ts | Create form -> project list |
| 6.3 | Generate flow | e2e/generate.spec.ts | Mock LLM -> generate -> result |
| 6.4 | Project detail | e2e/project-detail.spec.ts | View scenes, transitions, voice |
| 6.5 | Scene transitions | e2e/scene-transitions.spec.ts | Verify transition card render |
| 6.6 | Audio specs | e2e/audio-specs.spec.ts | Verify audio panel render |
| 6.7 | Export | e2e/export.spec.ts | Export JSON/Markdown |
| 6.8 | Theme toggle | e2e/theme-toggle.spec.ts | Dark->light->system |
| 6.9 | Settings | e2e/settings.spec.ts | Provider config CRUD |

### Phase 7: Unit Test Updates (Estimasi: 30 menit)

| # | Task | File | Detail |
|---|------|------|--------|
| 7.1 | Update schema test | schemas.test.ts | Test color_palette array/string handling |
| 7.2 | Update generate route test | Buat generate.route.test.ts | Mock LLM, verify DB inserts |
| 7.3 | Verify coverage | Run pnpm test:coverage | Pastikan >=80% |

---

## 8. Verifikasi & Pengujian

### 8.1 Definition of Done (DoD) Teknis

| # | Kriteria | Verifikasi |
|---|---------|------------|
| D1 | Migration 0002 berhasil dijalankan | PRAGMA table_info(scenes) -> voiceover_speaker ada |
| D2 | Migration rollback berfungsi | Jalankan rollback, verify kolom hilang |
| D3 | Generate route menyimpan voiceover_speaker | Generate project -> query scenes -> voiceover_speaker terisi |
| D4 | Generate route menyimpan color_palette + technical | Generate project -> query image_prompts -> kedua kolom terisi |
| D5 | Generate route menyimpan audio_specs | Generate project -> query scene_audio -> records ada per scene |
| D6 | image_prompts.scene_id ter-link (BUKAN null) | Generate project -> query image_prompts -> scene_id bukan null |
| D7 | TypeScript build berhasil | pnpm build tanpa error |
| D8 | Unit tests passing | pnpm test — semua pass |
| D9 | Coverage >=80% | pnpm test:coverage — thresholds met |
| D10 | E2E tests >=10 passing | pnpm test:e2e — semua pass |
| D11 | Landing page V3 features muncul | Browser: landing page -> features section terlihat |
| D12 | Theme toggle di landing page berfungsi | Browser: landing page -> toggle dark/light/system |
| D13 | Image prompt display 8 layer | Browser: generate result -> 8 layer sections terlihat |
| D14 | Export termasuk field baru | Export JSON -> color_palette, technical, audio_specs ada |

### 8.2 Test Scenarios Per Feature

#### F-M01: Audio Specs Persistence

| # | Scenario | Type | Expected |
|---|---------|------|----------|
| 1 | Generate dengan 3 scenes, setiap scene punya 2 audio specs | Integration | 6 records di scene_audio |
| 2 | Generate dengan scene tanpa audio_specs | Integration | 0 records, no error |
| 3 | Audio specs muncul di UI audio-panel | E2E | Panel render audio types |
| 4 | Audio specs termasuk export JSON | Unit | JSON.parse(export) punya audio_specs |

#### F-M02: Color Palette + Technical

| # | Scenario | Type | Expected |
|---|---------|------|----------|
| 1 | Generate -> image_prompts punya color_palette | Integration | Kolom terisi, bukan null |
| 2 | Generate -> image_prompts punya technical | Integration | Kolom terisi, bukan null |
| 3 | color_palette format array -> join ke string | Unit | red, blue, green |
| 4 | color_palette format string -> langsung simpan | Unit | deep blue #1a365d |

#### F-M03: Voiceover Speaker

| # | Scenario | Type | Expected |
|---|---------|------|----------|
| 1 | Generate -> scenes punya voiceover_speaker | Integration | Nama karakter atau narrator |
| 2 | Default value narrator jika null | Unit | fallback ke narrator |

#### F-M04: Transition Flow

| # | Scenario | Type | Expected |
|---|---------|------|----------|
| 1 | Scene 1 = fade_in atau fade_to_white | Prompt test | Bukan cut |
| 2 | Scene terakhir = fade_to_black | Prompt test | Bukan cut |
| 3 | 70%+ scenes non-cut transition | Integration | Query DB |
| 4 | Durasi dissolve >=800ms | Prompt test | Validation |

#### F-M05: 8-Layer Image Prompt

| # | Scenario | Type | Expected |
|---|---------|------|----------|
| 1 | 90%+ image prompts punya 6/8+ layers | Integration | Query non-null count |
| 2 | color_palette terisi | Integration | Bukan null |
| 3 | technical terisi | Integration | Bukan null |

#### F-M06: Voice Type Mapping

| # | Scenario | Type | Expected |
|---|---------|------|----------|
| 1 | Karakter anak -> voice_type=child | Prompt test | Bukan narrator |
| 2 | Karakter lansia -> voice_type=elderly_* | Prompt test | Bukan adult_* |
| 3 | voice_emotion mengikuti scene_mood | Prompt test | Consistent mapping |

### 8.3 E2E Test Specifications

| # | Test File | Test Case | Priority | Steps |
|---|-----------|-----------|----------|-------|
| 1 | login.spec.ts | Login flow | Must | Sudah ada |
| 2 | register.spec.ts | Register -> redirect to login | Must | Fill form -> submit -> verify redirect |
| 3 | project-create.spec.ts | Create project | Must | Login -> new project -> fill form -> verify in list |
| 4 | generate.spec.ts | Generate animation brief | Must | Login -> create project -> generate (mock) -> verify result |
| 5 | project-detail.spec.ts | View project detail | Must | Login -> click project -> verify scenes, characters |
| 6 | scene-transitions.spec.ts | View scene transitions | Should | Login -> project detail -> verify transition card |
| 7 | audio-specs.spec.ts | View audio specs | Should | Login -> project detail -> verify audio panel |
| 8 | export.spec.ts | Export brief | Should | Login -> project -> export -> verify download |
| 9 | theme-toggle.spec.ts | Theme toggle | Should | Toggle dark->light->system -> verify CSS vars |
| 10 | settings.spec.ts | Provider config CRUD | Should | Add provider -> test -> edit -> delete |

### 8.4 BDD Scenarios (Contoh)

```gherkin
Feature: Audio Specs Persistence (F-M01)

  Scenario: Generate menyimpan audio specs ke database
    Given pengguna sudah login
    And pengguna memiliki project dengan 3 scenes
    When pengguna generate animation brief
    Then setiap scene memiliki minimal 1 audio spec di database
    And audio_type salah satu dari: background_music, sfx, ambient, music_cue, transition_audio
    And description tidak kosong

  Scenario: Generate tanpa audio specs tidak error
    Given pengguna sudah login
    When LLM tidak menghasilkan audio_specs untuk scene tertentu
    Then generate tetap berhasil tanpa error
    And scene_audio table tidak memiliki record untuk scene tersebut
```

---

## Lampiran

### L1. Mapping BRD -> SRS

| BRD Tujuan | SRS Section |
|-----------|-------------|
| G1 (Theme adoption >=30%) | 3.1 F-M07, 6.4 |
| G2 (Transition >=70% non-cut) | 3.1 F-M04, 8.2 F-M04 |
| G3 (Image prompt >=6/8 layers >=90%) | 3.1 F-M05, 8.2 F-M05 |
| G4 (Audio spec generation >=80%) | 3.1 F-M01, 8.2 F-M01 |
| G5 (Data persistence 100%) | 3.1 F-M01/M02/M03, 7 Phase 2 |
| G6 (E2E >=10 tests) | 7 Phase 6, 8.3 |
| G7 (Landing page V3) | 3.2 F-S01, 7 Phase 5 |

### L2. Mapping PRD -> SRS

| PRD Fitur | SRS Section |
|-----------|-------------|
| FR-M01 (Audio Persistence) | 3.1 F-M01, 5.2, 7 Phase 2 |
| FR-M02 (Color Palette + Technical) | 3.1 F-M02, 4.1.1, 7 Phase 1 |
| FR-M03 (Voiceover Speaker) | 3.1 F-M03, 4.1.1, 7 Phase 1 |
| FR-M04 (Transition Flow) | 3.1 F-M04, 7 Phase 3 |
| FR-M05 (8-Layer Completeness) | 3.1 F-M05, 5.2 |
| FR-M06 (Voice Mapping) | 3.1 F-M06, 7 Phase 3 |
| FR-M07 (Light Theme Landing) | 3.1 F-M07, 7 Phase 4 |
| FR-S01 (Landing V3 Features) | 3.2 F-S01, 7 Phase 5 |
| FR-S02 (E2E Expansion) | 3.2 F-S02, 7 Phase 6 |
| FR-S03 (Image Prompt Display) | 3.2 F-S03, 7 Phase 4 |

### L3. File Change Manifest

| # | File | Action | Phase |
|---|------|--------|-------|
| 1 | drizzle/0002_v3_gap_closure.sql | CREATE | 1 |
| 2 | drizzle/0002_v3_gap_closure_rollback.sql | CREATE | 1 |
| 3 | src/lib/db/schema.ts | MODIFY (tambah 3 kolom) | 1 |
| 4 | src/app/api/v1/generate/route.ts | MODIFY (tambah INSERT logic) | 2 |
| 5 | src/lib/db/repositories/*.repo.ts | MODIFY (RETURNING jika perlu) | 2 |
| 6 | src/lib/ai/prompt-builder.ts | MODIFY (perkuat rules) | 3 |
| 7 | src/components/generate/image-prompt-display.tsx | MODIFY (tambah 2 layers) | 4 |
| 8 | src/lib/landing/features.ts | MODIFY (tambah 5 features) | 5 |
| 9 | messages/id.json | MODIFY (tambah V3 keys) | 5 |
| 10 | messages/en.json | MODIFY (tambah V3 keys) | 5 |
| 11 | e2e/register.spec.ts | CREATE | 6 |
| 12 | e2e/project-create.spec.ts | CREATE | 6 |
| 13 | e2e/generate.spec.ts | CREATE | 6 |
| 14 | e2e/project-detail.spec.ts | CREATE | 6 |
| 15 | e2e/scene-transitions.spec.ts | CREATE | 6 |
| 16 | e2e/audio-specs.spec.ts | CREATE | 6 |
| 17 | e2e/export.spec.ts | CREATE | 6 |
| 18 | e2e/theme-toggle.spec.ts | CREATE | 6 |
| 19 | e2e/settings.spec.ts | CREATE | 6 |

### L4. Asumsi

| # | Asumsi | Basis | Dampak Jika Salah |
|---|--------|-------|-------------------|
| A1 | Vercel Hobby plan tetap digunakan (max 300s) | maxDuration=300 di generate route | Perlu upgrade plan atau chunked generation |
| A2 | Turso handle 3 ALTER TABLE tanpa breaking | SQLite ALTER TABLE ADD COLUMN non-breaking | Perlu manual migration |
| A3 | bulkCreateScenes bisa di-modifikasi untuk RETURNING | Drizzle ORM support .returning() | Perlu separate SELECT query |
| A4 | LLM konsisten menghasilkan audio_specs dalam format Zod-compatible | Prompt builder instruksi detail | Perlu fallback parser |
| A5 | color_palette dari LLM bisa berupa string ATAU array | Zod schema z.union([z.string(), z.array(z.string())]) | Perlu normalisasi di generate route |
| A6 | Komponen UI existing bisa render data baru tanpa major refactor | Komponen sudah designed untuk V3 data | Perlu UI work tambahan |
| A7 | Landing page features.ts struktur data fleksibel untuk 5+ features | Current: 6 features | Perlu refactor component |
| A8 | E2E tests bisa mock LLM response untuk generate flow | Playwright mock/stub pattern | Perlu MSW atau route handler mock |
| A9 | Output PromptFlow dipakai sebagai input ke Runway/Pika/Kling/Sora | Prompt builder target tools | Perlu adaptasi per platform |
| A10 | Indonesia-first dengan English support | Default locale id | — |

### L5. Risiko Teknis

| # | Risiko | Probabilitas | Mitigasi |
|---|--------|-------------|----------|
| R1 | bulkCreateScenes RETURNING gagal di Turso/libSQL | Rendah | Fallback: SELECT after INSERT |
| R2 | LLM menghasilkan color_palette dalam format tidak konsisten | Sedang | Zod union + normalize function |
| R3 | Audio specs INSERT lambat untuk project besar (20 scenes x 5 audio) | Sedang | Batch INSERT, transaction |
| R4 | E2E generate test flaky (LLM mock tidak konsisten) | Sedang | Hardcoded mock response |
| R5 | Theme toggle FOWT di landing page | Rendah | next-themes inline script |

---

*Dokumen ini disusun berdasarkan BRD.md, MRD.md, PRD.md, dan RAG-CONTEXT.md (codebase evidence) per 2026-06-22. Seluruh claim teknis memiliki sitasi ke file dan baris kode.*
