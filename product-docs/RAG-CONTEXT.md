# RAG-CONTEXT.md — PromptFlow V3 Codebase Evidence Pack

> Generated: 2026-06-22 | Source: Live codebase scan at `C:\laragon\www\PromptFlow`
> Purpose: Ground-truth facts for docgen subagents (BRD/MRD/PRD/SRS/ARCHITECTURE/etc.)

---

## 1. Temuan Ringkas (Findings Summary)

PromptFlow adalah **Next.js 15 App Router** web app — workflow engine untuk generate paket prompt animasi AI terstruktur. Project sudah **bukan greenfield** — ada ~80+ source files, 9 DB tables, 20+ API endpoints, 7 unit test files, 1 E2E spec.

**V3 features yang SUDAH diimplementasi:**
- ✅ Light/Dark/System theme toggle (`next-themes` + `ThemeToggle` component + CSS variables + `.dark` class)
- ✅ Scene transitions (6 types: cut, dissolve, fade_to_black, fade_to_white, wipe, match_cut) — DB columns + Zod schema + prompt-builder instructions + UI components
- ✅ Voice type specificity (7 types: child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator) — DB columns + Zod + prompt-builder + UI
- ✅ Audio specs per scene (5 types: background_music, sfx, ambient, music_cue, transition_audio) — `scene_audio` table + repository + API + Zod + UI
- ✅ 8-layer image prompt structure in prompt-builder (prompt_text, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical)
- ✅ V2→V3 migration script with rollback
- ✅ Template presets (5 presets: tutorial, cinematic, kids, documentary, action)

**V3 goals status vs code evidence:**

| Goal | Status | Evidence |
|------|--------|----------|
| 1. Light Theme Support | ✅ DONE | providers.tsx, theme-toggle.tsx, globals.css `.dark` block, projects.themePreference DB column, theme API route |
| 2. Fix Scene Transitions | ✅ DONE (schema+prompt) | scenes table 4 transition columns, prompt-builder.ts lines 246-278 (6 types + flow patterns), scene-transition-card.tsx |
| 3. Complex Image Prompts | ✅ DONE (prompt+schema partial) | prompt-builder.ts lines 313-335 (8 layers), ImagePromptItemSchema has composition/lighting/camera/mood/style_refs/color_palette/technical |
| 4. Voice Type Specificity | ✅ DONE | scenes table 4 voice columns, CharacterProfileSchema.voice_type, prompt-builder.ts lines 281-310, voice-type-selector.tsx |
| 5. Supporting Audio Specs | ✅ DONE | scene_audio table (18 columns), scene-audio.repository.ts, audio API routes, audio-panel.tsx, prompt-builder.ts lines 338-384 |

---

## 2. Tech Stack + Versi

| Component | Version | Source |
|-----------|---------|--------|
| Next.js | ^15.1.0 | SITASI: package.json:50 |
| React | ^19.0.0 | SITASI: package.json:54 |
| TypeScript | ^5.7.0 | SITASI: package.json:83 |
| Tailwind CSS | ^4.0.0 | SITASI: package.json:82 |
| shadcn/ui (default style) | latest | SITASI: components.json:3 |
| Drizzle ORM | ^0.38.0 | SITASI: package.json:47 |
| Drizzle Kit | ^0.30.0 | SITASI: package.json:46 |
| Turso/libSQL (@libsql/client) | ^0.14.0 | SITASI: package.json:25 |
| NextAuth | 5.0.0-beta.25 | SITASI: package.json:51 |
| next-intl | ^3.26.0 | SITASI: package.json:52 |
| next-themes | ^0.4.6 | SITASI: package.json:53 |
| Zod | ^3.24.0 | SITASI: package.json:61 |
| Vercel AI SDK (ai) | ^4.0.0 | SITASI: package.json:42 |
| @ai-sdk/openai-compatible | ^1.0.0 | SITASI: package.json:22 |
| framer-motion | ^12.40.0 | SITASI: package.json:48 |
| lucide-react | ^0.468.0 | SITASI: package.json:49 |
| react-hook-form | ^7.54.0 | SITASI: package.json:56 |
| recharts | ^3.8.1 | SITASI: package.json:57 |
| sonner (toasts) | ^1.7.0 | SITASI: package.json:59 |
| bcryptjs | ^2.4.3 | SITASI: package.json:43 |
| Vitest | ^2.1.0 | SITASI: package.json:84 |
| Playwright | ^1.49.0 | SITASI: package.json:64 |
| pnpm | 11.7.0 (packageManager) | SITASI: package.json:90 |
| Node.js | >=20.0.0 | SITASI: package.json:87 |

**TypeScript config:** strict mode, noImplicitAny, noImplicitReturns, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, target ES2022. SITASI: tsconfig.json:8-14

---

## 3. Struktur Proyek (Core Project Structure)

```
src/
  app/
    layout.tsx              — root layout (metadata, Analytics, bg/foreground)
    globals.css             — Tailwind v4 @theme tokens + .dark overrides
    middleware.ts           — auth guard, rate limit, i18n locale redirect
    [locale]/
      layout.tsx            — NextIntlClientProvider + Providers + AppHeader
      page.tsx              — landing page
      login/page.tsx        — login
      register/page.tsx     — register
      generate/page.tsx     — generate prompt
      projects/page.tsx     — project list
      projects/[id]/page.tsx — project detail
      projects/[id]/history/page.tsx — generation history
      settings/page.tsx     — provider settings
      dashboard/page.tsx    — analytics dashboard
    api/
      auth/[...nextauth]/route.ts
      v1/health/route.ts
      v1/register/route.ts
      v1/generate/route.ts          — SSE streaming generate
      v1/upload/route.ts            — blob upload
      v1/upload/classify/route.ts   — AI image classification
      v1/projects/route.ts          — CRUD list/create
      v1/projects/[id]/route.ts     — get/update/delete
      v1/projects/[id]/delete/route.ts
      v1/projects/[id]/theme/route.ts    — PATCH theme preference
      v1/projects/[id]/scenes/route.ts
      v1/projects/[id]/scenes/[sceneId]/audio/route.ts      — GET/POST
      v1/projects/[id]/scenes/[sceneId]/audio/[audioId]/route.ts — PATCH/DELETE
      v1/projects/[id]/characters/route.ts
      v1/projects/[id]/image-prompts/route.ts
      v1/projects/[id]/logs/route.ts
      v1/projects/[id]/export/route.ts
      v1/settings/providers/route.ts
      v1/settings/providers/[id]/route.ts
      v1/settings/providers/[id]/test/route.ts
      v1/settings/providers/[id]/delete/route.ts
      v1/dashboard/stats/route.ts
  components/
    providers.tsx           — ThemeProvider (next-themes) + SessionProvider
    common/
      app-header.tsx        — nav bar with ThemeToggle + LanguageToggle
      theme-toggle.tsx      — 3-mode dropdown (light/dark/system)
      language-toggle.tsx   — id/en switcher
      copy-button.tsx
      changelog-banner.tsx
      pagination.tsx
      page-loading-skeleton.tsx
      page-error-boundary.tsx
    generate/
      generate-form.tsx         — main form + SSE streaming + stage progress
      result-tabs.tsx           — tabbed result display
      scene-transition-card.tsx — transition visualization
      voice-type-selector.tsx   — voice type badge display
      audio-panel.tsx           — audio specs list
      image-prompt-display.tsx  — expandable 8-layer display
      template-picker.tsx       — preset templates
      dropzone-uploader.tsx     — file upload
      log-viewer.tsx            — real-time log viewer
    settings/
      provider-config-form.tsx
      provider-card.tsx
    dashboard/
      metric-card.tsx
      weekly-trend-chart.tsx
      success-fail-bar-chart.tsx
      per-provider-breakdown-table.tsx
      recent-activity-table.tsx
    projects/
      project-card.tsx
      delete-project-button.tsx
    landing/              — 14 landing page components (hero, features, FAQ, etc.)
    ui/                   — shadcn/ui primitives (button, card, dialog, etc.)
  lib/
    db/
      schema.ts           — 10 Drizzle tables
      client.ts           — Turso connection
      cache.ts
      repositories/       — 10 repo files (project, scene, character, etc.)
    ai/
      prompt-builder.ts   — V3 system prompt + user message builder
      llm-client.ts       — OpenAI-compatible fetch with retry
      provider-registry.ts — provider presets (ollama, openrouter, 9router)
      response-parser.ts  — JSON extraction + Zod validation
      consistency-checker.ts — character identity cross-scene check
      image-classifier.ts
      log-buffer.ts
      prompts/            — 5 system prompt re-exports (voiceover, scenes, etc.)
    validation/
      schemas.ts          — 272 lines of Zod schemas (all V3 fields)
    crypto/
      aes.ts              — AES-256-GCM encrypt/decrypt for API keys
    auth/
      config.ts           — NextAuth v5 Credentials provider
      edge.ts             — Edge-safe auth config
      middleware.ts
    i18n/
      config.ts           — locales: ['id', 'en'], default: 'id'
      request.ts
    migration/
      v2-to-v3.ts         — migrateV2ToV3 + rollbackV2ToV3
    templates/
      presets.ts          — 5 V3 template presets
      titles.ts           — template title suggestions
    export/
      markdown.template.ts — Markdown export with V3 sections
    landing/
      features.ts         — 6 feature definitions
      sections.ts
    storage/
      blob.ts             — Vercel Blob integration
    api/
      error.ts            — errorResponse/successResponse helpers
    analytics/
      events.ts           — V3 analytics events (theme_change, etc.)
messages/
  id.json                 — Indonesian i18n (291 lines)
  en.json                 — English i18n (291 lines)
drizzle/
  0000_gigantic_genesis.sql    — initial schema
  0001_v3_core_features.sql    — V3 ALTER TABLEs + scene_audio CREATE
e2e/
  login.spec.ts                — single E2E test
tests/
  stubs/server-only.ts         — Vitest stub
```

SITASI: glob scan of `src/**/*.{ts,tsx}`, `drizzle/**/*`, `messages/**/*`, `e2e/**/*`

---

## 4. Database Schema (10 Tables)

### 4.1 users
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK autoincrement |
| email | text | NOT NULL, UNIQUE |
| name | text | nullable |
| password_hash | text | NOT NULL |
| image | text | nullable |
| role | text | NOT NULL, default 'user' |
| created_at | integer | NOT NULL, default unixepoch() |
| updated_at | integer | NOT NULL, default unixepoch() |

SITASI: schema.ts:5-14

### 4.2 provider_configs
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK autoincrement |
| user_id | integer | NOT NULL, FK users.id CASCADE |
| provider | text | NOT NULL |
| name | text | NOT NULL |
| base_url | text | NOT NULL |
| model | text | NOT NULL |
| api_key_encrypted | text | nullable |
| is_active | integer | NOT NULL, default 1 |
| created_at/updated_at | integer | NOT NULL |

Unique index: `(user_id, name)`. SITASI: schema.ts:17-30

### 4.3 projects
| Column | Type | Constraints |
|--------|------|-------------|
| id | integer | PK autoincrement |
| user_id | integer | NOT NULL, FK users.id CASCADE |
| title | text | NOT NULL |
| duration_type | text | NOT NULL |
| duration_target_seconds | integer | NOT NULL |
| style_type | text | NOT NULL |
| aspect_ratio | text | NOT NULL |
| result_json | text | nullable |
| status | text | NOT NULL, default 'draft' |
| story_description | text | nullable (V2) |
| theme_preference | text | default 'dark' (V3) |
| created_at/updated_at | integer | NOT NULL |
| deleted_at | integer | nullable (soft delete) |

Indexes: `user_id`, `(user_id, created_at)`. SITASI: schema.ts:33-51

### 4.4 asset_references
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK projects CASCADE |
| tipe | text | NOT NULL |
| filename | text | NOT NULL |
| blob_url | text | NOT NULL |
| label | text | nullable |
| mime_type | text | nullable |
| size_bytes | integer | nullable |
| ai_classification | text | nullable (V2: JSON) |

SITASI: schema.ts:54-68

### 4.5 characters
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK CASCADE |
| nama | text | NOT NULL |
| gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki | text | NOT NULL |
| deskripsi_latar | text | NOT NULL |
| aksi | text | NOT NULL |
| peran | text | NOT NULL |

Unique index: `(project_id, nama)`. SITASI: schema.ts:71-87

### 4.6 scenes
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK CASCADE |
| order_no | integer | NOT NULL |
| description | text | NOT NULL |
| voiceover_script | text | NOT NULL |
| transition_type | text | NOT NULL, default 'cut' (V3) |
| transition_duration_ms | integer | NOT NULL, default 0 (V3) |
| transition_easing | text | NOT NULL, default 'linear' (V3) |
| transition_direction | text | NOT NULL, default 'forward' (V3) |
| voice_type | text | NOT NULL, default 'narrator' (V3) |
| voice_emotion | text | NOT NULL, default 'neutral' (V3) |
| voice_speed | real | NOT NULL, default 1.0 (V3) |
| voice_pitch | text | NOT NULL, default 'auto' (V3) |
| duration_seconds | integer | nullable (V3) |
| scene_pacing | text | NOT NULL, default 'normal' (V3) |
| scene_mood | text | nullable (V3) |

Unique index: `(project_id, order_no)`. SITASI: schema.ts:90-115

### 4.7 image_prompts
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK CASCADE |
| scene_id | integer | FK scenes CASCADE, nullable |
| tipe | text | NOT NULL |
| target | text | NOT NULL |
| prompt_text | text | NOT NULL |
| reference_filename | text | nullable |
| composition | text | nullable (V3) |
| lighting | text | nullable (V3) |
| camera | text | nullable (V3) |
| mood_atmosphere | text | nullable (V3) |
| style_references | text | nullable (V3) |

SITASI: schema.ts:118-139

### 4.8 generation_logs
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK CASCADE |
| provider | text | NOT NULL |
| model | text | NOT NULL |
| duration_ms | integer | nullable |
| status | text | NOT NULL |
| error_message | text | nullable |
| logs_json | text | nullable (V2: JSON array) |

SITASI: schema.ts:142-155

### 4.9 supporting_characters
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK CASCADE |
| scene_id | integer | FK scenes SET NULL, nullable |
| nama | text | NOT NULL |
| tipe | text | NOT NULL |
| aksi | text | NOT NULL |

SITASI: schema.ts:158-169

### 4.10 scene_audio (V3 NEW)
| Column | Type | Notes |
|--------|------|-------|
| id | integer | PK |
| project_id | integer | FK projects CASCADE |
| scene_id | integer | FK scenes CASCADE |
| audio_type | text | NOT NULL |
| description | text | NOT NULL |
| timing | text | NOT NULL, default 'throughout' |
| duration_seconds | integer | nullable |
| volume | real | NOT NULL, default 0.7 |
| fade_in_ms | integer | NOT NULL, default 0 |
| fade_out_ms | integer | NOT NULL, default 0 |
| music_genre | text | nullable |
| music_mood | text | nullable |
| music_tempo_bpm | integer | nullable |
| music_instruments | text | nullable |
| music_volume | real | default 0.7 |
| sfx_list | text | nullable |
| ambient_type | text | nullable |
| ambient_volume | real | default 0.5 |

SITASI: schema.ts:172-196

**Migration files:**
- `0000_gigantic_genesis.sql` — initial schema (users, provider_configs, projects, asset_references, characters, scenes, image_prompts, generation_logs, supporting_characters)
- `0001_v3_core_features.sql` — V3: 11 ALTER TABLE on scenes + image_prompts + projects, CREATE TABLE scene_audio

SITASI: drizzle/0001_v3_core_features.sql:1-43

---

## 5. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/v1/health | No | DB health check |
| POST | /api/auth/[...nextauth] | — | NextAuth handler |
| POST | /api/v1/register | No | User registration |
| POST | /api/v1/generate | Yes + Rate Limit (10/min) | SSE streaming generate |
| POST | /api/v1/upload | Yes | Vercel Blob upload |
| POST | /api/v1/upload/classify | Yes | AI image classification |
| GET | /api/v1/projects | Yes | List projects (paginated) |
| POST | /api/v1/projects | Yes | Create project |
| GET | /api/v1/projects/[id] | Yes | Get project detail |
| PATCH | /api/v1/projects/[id] | Yes | Update project |
| POST | /api/v1/projects/[id]/delete | Yes | Soft delete |
| PATCH | /api/v1/projects/[id]/theme | Yes | Update theme preference |
| GET | /api/v1/projects/[id]/scenes | Yes | List scenes |
| GET | /api/v1/projects/[id]/characters | Yes | List characters |
| GET | /api/v1/projects/[id]/image-prompts | Yes | List image prompts |
| GET | /api/v1/projects/[id]/logs | Yes | Generation history |
| GET | /api/v1/projects/[id]/export | Yes | Export JSON/Markdown |
| GET | /api/v1/projects/[id]/scenes/[sceneId]/audio | Yes | List audio for scene |
| POST | /api/v1/projects/[id]/scenes/[sceneId]/audio | Yes | Create audio spec |
| PATCH | /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId] | Yes | Update audio |
| DELETE | /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId] | Yes | Delete audio |
| GET | /api/v1/settings/providers | Yes | List provider configs |
| POST | /api/v1/settings/providers | Yes | Create provider config |
| GET | /api/v1/settings/providers/[id] | Yes | Get provider config |
| PATCH | /api/v1/settings/providers/[id] | Yes | Update provider config |
| POST | /api/v1/settings/providers/[id]/test | Yes | Test provider connection |
| POST | /api/v1/settings/providers/[id]/delete | Yes | Delete provider config |
| GET | /api/v1/dashboard/stats | Yes | Dashboard statistics |

SITASI: glob scan of `src/app/api/**/route.ts`

---

## 6. Theme Implementation (Light/Dark/System)

### 6.1 ThemeProvider
- `next-themes` ThemeProvider with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`
- SITASI: providers.tsx:8

### 6.2 CSS Variables
- Light mode: `@theme` block defines CSS custom properties (background #ffffff, foreground #0a0a0a, primary #7c3aed, etc.)
- Dark mode: `.dark` class overrides all variables (background #0a0a0a, foreground #fafafa, primary #a78bfa, etc.)
- SITASI: globals.css:3-72

### 6.3 ThemeToggle Component
- 3-mode dropdown: light (Sun icon), dark (Moon icon), system (Monitor icon)
- Uses `useTheme()` from next-themes
- Tracks analytics event `theme_change`
- SITASI: theme-toggle.tsx:1-66

### 6.4 Per-Project Theme Preference
- DB column: `projects.theme_preference` (text, default 'dark')
- API: PATCH `/api/v1/projects/[id]/theme` — validates with `ThemePreferenceSchema` (dark|light|system)
- SITASI: schema.ts:44, theme/route.ts:1-29, schemas.ts:107-108

### 6.5 AppHeader Integration
- ThemeToggle rendered in AppHeader for all authenticated users
- SITASI: app-header.tsx:55

---

## 7. V3 Prompt Builder Details

### 7.1 System Prompt (prompt-builder.ts)
- Engine: "PromptFlow Engine v3"
- Target tools: Runway, Pika, Kling, Sora
- SITASI: prompt-builder.ts:222

**6 major V3 instruction blocks:**
1. **Transition Flow** (lines 246-278): 6 transition types, 5 flow patterns (A-E), rules for scene 1 opening + scene last closing
2. **Voice Type Assignment** (lines 281-310): 7 voice types with age→voice mapping, emotion/speed/pitch rules
3. **Image Prompt 8 Layers** (lines 313-335): prompt_text, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical
4. **Audio Specs** (lines 338-384): 5 audio types, field requirements per type, timing options, volume rules
5. **Scene Pacing & Mood** (lines 387-398): pacing→transition correlation
6. **Consistency Rules** (lines 400-409): identity stability, voice_type consistency, image_prompts per scene

### 7.2 JSON Schema Example
- Full 2-scene example with character_profiles, scenes with all V3 fields, audio_specs, image_prompts with 8 layers, supporting_characters, moral_message
- SITASI: prompt-builder.ts:9-219

### 7.3 User Message Builder
- Duration-aware scene count: shorts=3-6, tutorial=8-20
- V3 requirements checklist in prompt
- SITASI: prompt-builder.ts:415-448

---

## 8. Zod Validation Schemas (V3 Complete)

| Schema | V3 Fields | Source |
|--------|-----------|--------|
| CharacterProfileSchema | voice_type (7 enum), age_range | schemas.ts:4-17 |
| ImagePromptItemSchema | composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical | schemas.ts:19-31 |
| SceneAudioSpecSchema | audio_type (5 enum), timing, volume, fade, music_*, sfx_list, ambient_* | schemas.ts:39-55 |
| SceneSchema | transition_* (4), voice_* (4), duration_seconds, scene_pacing, scene_mood, audio_specs[], voiceover_speaker | schemas.ts:57-79 |
| ThemePreferenceSchema | dark\|light\|system | schemas.ts:107 |
| PromptPackageSchema | Full V3 root structure | schemas.ts:110-128 |
| GenerateInputSchema | storyDescription (V2) | schemas.ts:185-204 |

---

## 9. I18n Messages Structure

- Locales: `['id', 'en']`, default: `'id'`
- SITASI: i18n/config.ts:1-4
- Files: `messages/id.json`, `messages/en.json` (~291 lines each)
- Namespaces: common, landing, auth, generate, transition, voice, audio, imagePrompt, projects, history, dashboard, settings, errors
- V3-specific i18n keys: `transition.types.*`, `voice.types.*`, `voice.emotions.*`, `audio.types.*`, `audio.timing.*`, `imagePrompt.layers.*`
- SITASI: messages/en.json:1-291

---

## 10. Test Coverage

### Unit Tests (Vitest)
| File | Focus |
|------|-------|
| src/lib/validation/schemas.test.ts | Zod schema validation |
| src/lib/crypto/aes.test.ts | AES-256-GCM encrypt/decrypt |
| src/lib/auth/config.test.ts | Auth config |
| src/lib/export/markdown.template.test.ts | Markdown export |
| src/lib/ai/consistency-checker.test.ts | Character consistency check |
| src/lib/ai/log-buffer.test.ts | Log buffer |
| src/lib/db/repositories/project.repo.test.ts | Project repository |

SITASI: glob scan `src/**/*.test.ts`

### Coverage Config
- Provider: v8
- Reporter: text, json, html
- Include: `src/lib/**`, `src/app/api/**`
- Exclude: `**/*.test.ts`, `src/components/ui/**`
- Thresholds: **80% lines, 80% branches, 80% functions, 80% statements**
- SITASI: vitest.config.ts:21-27

### E2E Tests (Playwright)
- Single file: `e2e/login.spec.ts`
- Browser: Chromium only
- Base URL: http://localhost:3000
- Timeout: 120s per test, 60s expect
- SITASI: playwright.config.ts:1-21

---

## 11. Deployment Config

### Vercel
- Framework: nextjs
- Build: `pnpm build`
- Install: `pnpm install --frozen-lockfile`
- SITASI: vercel.json:1-5

### Next.js Config
- `reactStrictMode: true`
- `serverExternalPackages: ['@libsql/client']`
- `serverActions.bodySizeLimit: '10mb'`
- Images: allow `**.public.blob.vercel-storage.com`
- Wrapped with `next-intl` plugin
- SITASI: next.config.ts:1-17

### Rate Limiting
- In-memory Map (not Redis)
- Generate endpoint: 10 req/min per user
- SITASI: middleware.ts:19-36, 106-124

---

## 12. Auth Architecture

- NextAuth v5 (beta.25) with Credentials provider
- Password: bcryptjs
- Session: JWT (Edge-safe via jose)
- API key encryption: AES-256-GCM (32-byte key from env)
- Middleware: Edge runtime, getToken() for auth check
- SITASI: auth/config.ts:1-62, middleware.ts:78-103, crypto/aes.ts:1-49

---

## 13. Environment Variables

| Key | Purpose |
|-----|---------|
| TURSO_DATABASE_URL | Turso DB connection URL |
| TURSO_AUTH_TOKEN | Turso auth token |
| ENCRYPTION_KEY | 32-byte base64 for AES-256-GCM |
| NEXTAUTH_SECRET | NextAuth JWT secret |
| NEXTAUTH_URL | Base URL for NextAuth |
| BLOB_READ_WRITE_TOKEN | Vercel Blob storage |
| USE_VERCEL_BLOB | Enable/disable blob storage |
| NEXT_PUBLIC_APP_URL | Public app URL |
| NEXT_PUBLIC_SITE_URL | SEO metadata base URL |

SITASI: .env.example:1-17

---

## 14. Provider Presets

| Provider | Default Base URL |
|----------|-----------------|
| ollama | https://ollama.com/v1 |
| openrouter | https://openrouter.ai/api/v1 |
| 9router | http://localhost:20128/v1 |
| custom | user-defined |

SITASI: provider-registry.ts:12-16

Provider enum in Zod: `['ollama', 'openrouter', '9router', 'custom']`. SITASI: schemas.ts:163

---

## 15. Template Presets (V3)

| ID | Name | Transition | Voice | Audio |
|----|------|-----------|-------|-------|
| tutorial | Tutorial | dissolve 800ms | narrator/calm | lo-fi, classroom |
| cinematic | Sinematik | fade_to_black 1500ms | adult_male/dramatic | orchestral, cinematic |
| kids | Anak-anak | wipe 400ms | child/excited | children, playground |
| documentary | Dokumenter | cut 0ms | narrator/neutral | ambient, nature |
| action | Aksi | match_cut 200ms | adult_male/excited | electronic, tense |

SITASI: presets.ts:53-224

---

## 16. Analytics Events (V3)

| Event | Trigger |
|-------|---------|
| theme_change | User toggles theme |
| scene_transition_generated | Transition created |
| image_prompt_layers_count | Layers counted |
| voice_type_assigned | Voice type set |
| audio_spec_generated | Audio spec created |
| cta_hero_click | Landing CTA |
| cta_final_click | Final CTA |
| faq_expand | FAQ opened |
| scroll_75 | 75% scroll |
| language_toggle | Language switch |

SITASI: analytics/events.ts:3-15

---

## 17. LLM Client Details

- Endpoint: `${baseUrl}/chat/completions` (OpenAI-compatible)
- max_tokens: 32768
- temperature: 0.7
- stream: false (non-streaming from LLM, SSE to client)
- timeout: 240s (AbortSignal)
- retries: 2 (default), exponential backoff (2s, 4s, max 8s)
- JSON extraction: strip antml tags → code block → raw JSON brace matching
- SITASI: llm-client.ts:35-139

---

## 18. GAP & TIDAK ADA BUKTI

### GAP Items (not found in codebase)

| Item | Status | Notes |
|------|--------|-------|
| color_palette field in DB | GAP | Zod schema has it (schemas.ts:29) but image_prompts table has NO color_palette column. Only composition, lighting, camera, mood_atmosphere, style_references in DB. |
| technical field in DB | GAP | Zod schema has it (schemas.ts:30) but image_prompts table has NO technical column. |
| voiceover_speaker in scenes table | GAP | Zod SceneSchema has voiceover_speaker (schemas.ts:61) but scenes DB table has NO voiceover_speaker column. |
| scene-level image_prompts in DB | GAP | Scenes have no FK linking scene_id to image_prompts in generate route — image_prompts are saved with sceneId: null (generate/route.ts:180-181). |
| scene-level audio_specs in generate route | GAP | Generate route does NOT save audio_specs from LLM output to scene_audio table. Audio is only saved via separate API POST. |
| color_palette/technical in image-prompt-display.tsx | GAP | UI component only renders composition, lighting, camera, mood, style — no color_palette or technical layer display. |
| Redis/production rate limiting | GAP | Rate limit is in-memory Map (middleware.ts:20), comment says "prod needs Redis — fase akhir". |
| E2E test coverage | GAP | Only 1 E2E test (login.spec.ts). No generate, project, settings, or dashboard E2E tests. |
| Component test files | TIDAK ADA BUKTI | No .test.tsx files found — only .test.ts for lib code. |
| Landing page V3 features section | GAP | features.ts only has 6 V1/V2 features — no V3 features (transitions, voice, audio, image layers) in landing page. |

### ASUMSI (no direct code evidence)

| Assumption | Basis |
|-----------|-------|
| Vercel Hobby plan deployment | maxDuration=300 in generate route (SITASI: generate/route.ts:19) matches Vercel Hobby limit |
| Production target is Vercel | vercel.json exists, @vercel/analytics + @vercel/blob in deps |
| Indonesian-first product | defaultLocale='id', metadata in Indonesian, UI strings in Indonesian |

---

## 19. Full Citation List

| # | Citation | File Path:Line |
|---|----------|----------------|
| 1 | Next.js 15.1 | package.json:50 |
| 2 | React 19 | package.json:54 |
| 3 | TypeScript 5.7 | package.json:83 |
| 4 | Tailwind v4 | package.json:82 |
| 5 | Drizzle ORM 0.38 | package.json:47 |
| 6 | Turso/libSQL 0.14 | package.json:25 |
| 7 | NextAuth v5 beta.25 | package.json:51 |
| 8 | next-intl 3.26 | package.json:52 |
| 9 | next-themes 0.4.6 | package.json:53 |
| 10 | Zod 3.24 | package.json:61 |
| 11 | AI SDK 4.0 | package.json:42 |
| 12 | framer-motion 12.40 | package.json:48 |
| 13 | pnpm 11.7 | package.json:90 |
| 14 | Node >=20 | package.json:87 |
| 15 | TS strict mode | tsconfig.json:8 |
| 16 | Users table | schema.ts:5-14 |
| 17 | provider_configs table | schema.ts:17-30 |
| 18 | projects table | schema.ts:33-51 |
| 19 | asset_references table | schema.ts:54-68 |
| 20 | characters table | schema.ts:71-87 |
| 21 | scenes table (V3 cols) | schema.ts:90-115 |
| 22 | image_prompts table | schema.ts:118-139 |
| 23 | generation_logs table | schema.ts:142-155 |
| 24 | supporting_characters table | schema.ts:158-169 |
| 25 | scene_audio table (V3) | schema.ts:172-196 |
| 26 | V3 migration SQL | drizzle/0001_v3_core_features.sql:1-43 |
| 27 | ThemeProvider config | providers.tsx:8 |
| 28 | CSS light vars | globals.css:3-29 |
| 29 | CSS dark vars | globals.css:49-72 |
| 30 | ThemeToggle component | theme-toggle.tsx:1-66 |
| 31 | theme API route | theme/route.ts:1-29 |
| 32 | ThemePreferenceSchema | schemas.ts:107-108 |
| 33 | Prompt builder V3 | prompt-builder.ts:222-412 |
| 34 | Transition instructions | prompt-builder.ts:246-278 |
| 35 | Voice instructions | prompt-builder.ts:281-310 |
| 36 | 8-layer instructions | prompt-builder.ts:313-335 |
| 37 | Audio instructions | prompt-builder.ts:338-384 |
| 38 | User message builder | prompt-builder.ts:415-448 |
| 39 | SceneAudioSpecSchema | schemas.ts:39-55 |
| 40 | SceneSchema (V3) | schemas.ts:57-79 |
| 41 | ImagePromptItemSchema (V3) | schemas.ts:19-31 |
| 42 | CharacterProfileSchema (V3) | schemas.ts:4-17 |
| 43 | Generate endpoint | generate/route.ts:31-239 |
| 44 | SSE streaming | generate/route.ts:82-230 |
| 45 | Rate limit (10/min) | middleware.ts:106-124 |
| 46 | i18n config | i18n/config.ts:1-4 |
| 47 | EN messages | messages/en.json:1-291 |
| 48 | Vitest config | vitest.config.ts:1-35 |
| 49 | Coverage thresholds 80% | vitest.config.ts:26 |
| 50 | Playwright config | playwright.config.ts:1-21 |
| 51 | Vercel config | vercel.json:1-5 |
| 52 | Next.js config | next.config.ts:1-17 |
| 53 | Auth config | auth/config.ts:1-62 |
| 54 | AES-256-GCM | crypto/aes.ts:1-49 |
| 55 | Provider presets | provider-registry.ts:12-16 |
| 56 | Provider enum | schemas.ts:163 |
| 57 | Template presets (5) | presets.ts:53-224 |
| 58 | Analytics events | analytics/events.ts:3-15 |
| 59 | LLM client config | llm-client.ts:35-139 |
| 60 | Consistency checker | consistency-checker.ts:1-40 |
| 61 | Markdown export | markdown.template.ts:1-137 |
| 62 | V2→V3 migration | migration/v2-to-v3.ts:1-142 |
| 63 | .env.example | .env.example:1-17 |
| 64 | components.json | components.json:1-20 |
| 65 | README | README.md:1-57 |
| 66 | VoiceTypeSelector | voice-type-selector.tsx:1-42 |
| 67 | AudioPanel | audio-panel.tsx:1-58 |
| 68 | SceneTransitionCard | scene-transition-card.tsx:1-68 |
| 69 | ImagePromptDisplay | image-prompt-display.tsx:1-83 |
| 70 | GenerateForm | generate-form.tsx:1-332 |
| 71 | AppHeader | app-header.tsx:1-81 |
| 72 | scene-audio repository | scene-audio.repository.ts:1-47 |
| 73 | Audio API route | scenes/[sceneId]/audio/route.ts:1-64 |
| 74 | features.ts | features.ts:1-16 |
| 75 | DB client (Turso) | db/client.ts:1-15 |
| 76 | Error helpers | api/error.ts:1-45 |
| 77 | Landing metadata | layout.tsx:7-58 |
| 78 | Locale layout | [locale]/layout.tsx:1-47 |

---

*End of RAG-CONTEXT.md. All claims backed by code evidence. Gaps marked explicitly.*
