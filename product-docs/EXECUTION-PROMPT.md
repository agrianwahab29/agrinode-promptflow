# EXECUTION PROMPT — PromptFlow V3 Build

**Project:** PromptFlow V3 Animation Brief Engine Update  
**Version:** 3.0  
**Date:** 2026-06-22  
**Executor Role:** Autonomous LLM/Agent Builder  

---

## MANDATORY PRE-READ (Do This First)

Before writing ANY code, read these documents IN ORDER:

1. **AGENTS.md** (PRIMARY OPERATIONAL GUIDE)  
   `C:\laragon\www\PromptFlow\product-docs\AGENTS.md`  
   → Contains: build phases, file manifest, constraints, gotchas, Definition of Done

2. **BRD.md** (Business Requirements)  
   `C:\laragon\www\PromptFlow\product-docs\BRD.md`  
   → Contains: business goals, KPIs, stakeholders, risks

3. **MRD.md** (Market Requirements)  
   `C:\laragon\www\PromptFlow\product-docs\MRD.md`  
   → Contains: market opportunity, personas, positioning, launch strategy

4. **PRD.md** (Product Requirements)  
   `C:\laragon\www\PromptFlow\product-docs\PRD.md`  
   → Contains: feature specs, user stories, acceptance criteria, deliverables

5. **SRS.md** (Software Requirements)  
   `C:\laragon\www\PromptFlow\product-docs\SRS.md`  
   → Contains: architecture, tech stack, data model, API, implementation phases

6. **DATABASE_SCHEMA.md**  
   `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md`  
   → Contains: 10 tables, ERD, indexes, constraints, migration plan

7. **PROJECT_ARCHITECTURE.md**  
   `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md`  
   → Contains: layers, folder structure, data flows, integrations, deployment

8. **UIUX_SPEC.md**  
   `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md`  
   → Contains: design tokens, components, layout, wireframes, user flows

9. **API_CONTRACT.md**  
   `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md`  
   → Contains: endpoint specs, request/response schemas, SSE events

10. **CODING_RULES.md**  
    `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md`  
    → Contains: naming, code style, Drizzle patterns, error handling, testing

11. **TEST_PLAN.md**  
    `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md`  
    → Contains: unit, integration, E2E test matrix, coverage targets

---

## YOUR MISSION

You are the executor agent for **PromptFlow V3 Update**. Your task is to close critical data gaps between LLM output and database persistence, strengthen the prompt builder, update the UI and landing page, and add comprehensive E2E tests.

**Current state:** ~80+ source files, 10 DB tables, 20+ API endpoints, 7 unit test files, 1 E2E spec. All 5 V3 features are implemented at code level, but there are **critical data persistence gaps** that must be closed.

**Your approach:** INCREMENTAL GAP CLOSURE, not rewrite. All existing code works; you are fixing data loss and expanding test coverage.

---

## 7 IMPLEMENTATION PHASES (Execute in Order)

### PHASE 1: Database Migration (30 min)

**Goal:** Add 3 missing columns to close V3 data gaps.

**Tasks:**

1. **Create migration file**  
   Path: `drizzle/0002_v3_gap_closure.sql`  
   Content:
   ```sql
   ALTER TABLE scenes ADD voiceover_speaker TEXT DEFAULT 'narrator';
   ALTER TABLE image_prompts ADD color_palette TEXT;
   ALTER TABLE image_prompts ADD technical TEXT;
   ```

2. **Create rollback file**  
   Path: `drizzle/0002_v3_gap_closure_rollback.sql`  
   Content:
   ```sql
   ALTER TABLE scenes DROP COLUMN voiceover_speaker;
   ALTER TABLE image_prompts DROP COLUMN color_palette;
   ALTER TABLE image_prompts DROP COLUMN technical;
   ```

3. **Update Drizzle schema**  
   Path: `src/lib/db/schema.ts`  
   - Add to `scenes` table: `voiceoverSpeaker: text('voiceover_speaker').default('narrator')`
   - Add to `imagePrompts` table: `colorPalette: text('color_palette')` and `technical: text('technical')`

4. **Run migration**  
   Command: `npx drizzle-kit migrate`  
   Verify: `PRAGMA table_info(scenes);` → voiceover_speaker exists  
   Verify: `PRAGMA table_info(image_prompts);` → color_palette, technical exist

**Deliverables:**
- ✅ `drizzle/0002_v3_gap_closure.sql`
- ✅ `drizzle/0002_v3_gap_closure_rollback.sql`
- ✅ `src/lib/db/schema.ts` (3 new columns)
- ✅ Migration applied successfully

---

### PHASE 2: Generate Route Update (1 hour)

**Goal:** Fix 4 data persistence gaps in `/api/v1/generate` route.

**Tasks:**

1. **Update bulkCreateScenes mapping** (lines 158-174 of route.ts)  
   Add: `voiceoverSpeaker: s.voiceover_speaker ?? 'narrator'`

2. **Update bulkCreateImagePrompts mapping** (lines 179-182 of route.ts)  
   Add 7 fields:
   ```typescript
   composition: p.composition ?? null,
   lighting: p.lighting ?? null,
   camera: p.camera ?? null,
   moodAtmosphere: p.mood_atmosphere ?? null,
   styleReferences: p.style_references ?? null,
   colorPalette: Array.isArray(p.color_palette) 
     ? p.color_palette.join(', ') 
     : (p.color_palette ?? null),
   technical: p.technical ?? null,
   ```

3. **Modify bulkCreateScenes repository**  
   Ensure `.returning()` is used to return created rows (need scene_id for audio INSERT)

4. **Add audio_specs INSERT block** (new block after bulkCreateScenes)  
   Loop through scenes → loop through `scene.audio_specs` → INSERT to `scene_audio` table  
   Map all 18 columns: `project_id`, `scene_id`, `audio_type`, `description`, `timing`, `duration_seconds`, `volume`, `fade_in_ms`, `fade_out_ms`, `music_genre`, `music_mood`, `music_tempo_bpm`, `music_instruments`, `music_volume`, `sfx_list`, `ambient_type`, `ambient_volume`

5. **Add import**  
   `import { createSceneAudio } from '@/lib/db/repositories/scene-audio.repository'`

6. **Handle color_palette array normalization**  
   Zod schema: `z.union([z.string(), z.array(z.string())])`  
   Generate route MUST normalize to string before INSERT (use `Array.isArray()` check)

**CRITICAL:** `color_palette` can be string OR array from LLM. You MUST check `Array.isArray()` and normalize.

**Deliverables:**
- ✅ `src/app/api/v1/generate/route.ts` (voiceover_speaker, color_palette, technical, audio_specs saved)
- ✅ `src/lib/db/repositories/*.repo.ts` (bulkCreateScenes returns rows)
- ✅ All 4 gaps closed: voiceover_speaker, color_palette, technical, audio_specs

**Verify:**
```sql
SELECT voiceover_speaker FROM scenes WHERE project_id = ?;
SELECT color_palette, technical FROM image_prompts WHERE project_id = ?;
SELECT * FROM scene_audio WHERE project_id = ?;
```

---

### PHASE 3: Prompt Builder Refinement (45 min)

**Goal:** Strengthen prompt instructions for better LLM output quality.

**Tasks:**

1. **Enhance transition rules** (prompt-builder.ts, lines 267-273)  
   Add rules:
   - Significant mood change → dissolve/fade (NOT cut)
   - Fast action + fast pacing → match_cut (0-200ms)
   - Consecutive scenes with same mood → cut or dissolve (NOT wipe/match_cut)
   - Minimum durations: cut=0ms, dissolve≥800ms, fade≥1200ms, wipe≥400ms, match_cut≥200ms

2. **Strengthen voice mapping table** (prompt-builder.ts, lines 300-305)  
   Add explicit mappings:
   - mood→emotion: cheerful→happy, dramatic→dramatic, tense→serious, peaceful→calm
   - pacing→speed: fast→1.1-1.2, normal→0.95-1.05, slow→0.8-0.95
   - age→pitch: child→high, teen→medium/high, adult_male→low/medium, adult_female→medium, elderly→low

3. **Reinforce 8-layer format** (prompt-builder.ts, lines 327-335)  
   Make ALL 8 layers MANDATORY. Add explicit examples:
   - color_palette: `"deep blue #1a365d, gold #d4a017, white #f5f5f5"`
   - technical: `"4K, cinematic depth of field, film grain"`

4. **Add audio spec examples** (prompt-builder.ts, lines 377-384)  
   Per scene type:
   - Opening: orchestral + nature ambient
   - Action: electronic + tense SFX
   - Closing: fade-out music

**Deliverables:**
- ✅ `src/lib/ai/prompt-builder.ts` (transition rules, voice mapping, 8-layer format, audio examples)

**Verify:** Generate test project:
- Scene 1: transition = fade_from_black/fade_to_white (NOT cut)
- Last scene: transition = fade_to_black
- 70%+ scenes: transition != cut
- Every scene: audio_specs.length ≥ 1
- Every image_prompt: all 8 layers populated

---

### PHASE 4: Schema & UI Verification (30 min)

**Goal:** Verify existing components render new data correctly.

**Tasks:**

1. **Verify Zod schemas** (`src/lib/validation/schemas.ts`)  
   Confirm `color_palette`, `technical` exist in `ImagePromptItemSchema`  
   Confirm `voiceover_speaker` exists in `SceneSchema`  
   **DO NOT MODIFY** — schemas are already complete for V3.

2. **Verify/fix image-prompt-display** (`src/components/generate/image-prompt-display.tsx`)  
   Check if color_palette + technical are rendered.  
   If NOT: add `ColorPaletteDisplay` component:
   - Parse comma-separated color entries
   - Each entry: inline chip (12x12px rounded-full, bg=hex) + name + hex
   - Horizontal flex-wrap layout
   - Fallback: plain text if no hex found
   - Accessibility: `aria-label="Color palette: [full text]"`
   - Add `LayerRow` for technical layer

3. **Verify audio-panel** (`src/components/generate/audio-panel.tsx`)  
   Already exists — verify it renders data from DB.

4. **Verify voice-type-selector** (`src/components/generate/voice-type-selector.tsx`)  
   Already exists — verify voiceover_speaker displays.

5. **Verify theme on landing page** (`src/app/[locale]/layout.tsx`)  
   Check that Providers wraps children.  
   Verify landing components use CSS variables (NOT hardcoded colors).

6. **Verify scene-transition-card** (`src/components/generate/scene-transition-card.tsx`)  
   Already exists — verify flow patterns display.

**Deliverables:**
- ✅ `src/components/generate/image-prompt-display.tsx` (color_palette + technical rendered)
- ✅ All V3 components verified to render new data

---

### PHASE 5: Landing Page Update (30 min)

**Goal:** Showcase V3 features on landing page.

**Tasks:**

1. **Update features.ts** (`src/lib/landing/features.ts`)  
   Add 5 V3 features:
   - Scene Transitions: 6 transition types
   - Voice Type: 7 voice types + emotion mapping
   - Audio Specs: 5 audio types per scene
   - Image Prompts: 8-layer granular structure
   - Theme Toggle: dark/light/system modes

2. **Add i18n keys (Indonesian)** (`messages/id.json`)  
   Keys for 5 features:
   - `landing.features.transitions.title` / `landing.features.transitions.desc`
   - `landing.features.voice.title` / `landing.features.voice.desc`
   - `landing.features.audio.title` / `landing.features.audio.desc`
   - `landing.features.imagePrompts.title` / `landing.features.imagePrompts.desc`
   - `landing.features.theme.title` / `landing.features.theme.desc`

3. **Add i18n keys (English)** (`messages/en.json`)  
   Same keys as Indonesian — MUST be synchronized.

4. **Verify render**  
   Browser test: features section appears on landing page.

**Deliverables:**
- ✅ `src/lib/landing/features.ts` (5 V3 features added)
- ✅ `messages/id.json` (V3 keys added)
- ✅ `messages/en.json` (V3 keys added, synchronized with id.json)

---

### PHASE 6: E2E Test Expansion (2 hours)

**Goal:** Add 9 new E2E tests (total 10 critical path tests).

**Tasks:**

1. **Login** (already exists)  
   Path: `e2e/login.spec.ts`

2. **Register**  
   Path: `e2e/register.spec.ts`  
   Priority: Must

3. **Create project**  
   Path: `e2e/project-create.spec.ts`  
   Priority: Must

4. **Generate brief**  
   Path: `e2e/generate.spec.ts`  
   Priority: Must  
   **CRITICAL:** MUST mock LLM response (use hardcoded JSON) to avoid flakiness.

5. **Project detail**  
   Path: `e2e/project-detail.spec.ts`  
   Priority: Must

6. **Scene transitions**  
   Path: `e2e/scene-transitions.spec.ts`  
   Priority: Should

7. **Audio specs**  
   Path: `e2e/audio-specs.spec.ts`  
   Priority: Should

8. **Export brief**  
   Path: `e2e/export.spec.ts`  
   Priority: Should

9. **Theme toggle**  
   Path: `e2e/theme-toggle.spec.ts`  
   Priority: Should

10. **Settings**  
    Path: `e2e/settings.spec.ts`  
    Priority: Should

**Playwright config:**
- Browser: Chromium only
- Timeout: 120s
- Base URL: `http://localhost:3000`

**Deliverables:**
- ✅ 9 new E2E test files in `e2e/*.spec.ts`
- ✅ All tests pass: `npx playwright test`

---

### PHASE 7: Unit Test Updates (30 min)

**Goal:** Update unit tests for V3 changes, achieve 80% coverage.

**Tasks:**

1. **Schema test** (`tests/schemas.test.ts`)  
   Test:
   - color_palette array/string handling
   - voiceover_speaker field
   - audio_specs validation

2. **Generate route test** (`tests/generate.route.test.ts`)  
   Mock LLM response, verify DB inserts:
   - audio_specs saved
   - color_palette saved
   - technical saved
   - voiceover_speaker saved

3. **Coverage check**  
   Run: `npx vitest run --coverage`  
   Ensure: ≥ 80% lines/branches/functions/statements

**Vitest config:**
- Coverage: v8 provider
- Threshold: 80%
- Include: `src/lib/**`, `src/app/api/**`
- Exclude: `**/*.test.ts`, `src/components/ui/**`

**Deliverables:**
- ✅ `tests/schemas.test.ts` (V3 schema tests)
- ✅ `tests/generate.route.test.ts` (V3 generate route tests)
- ✅ Coverage ≥ 80%

---

## CRITICAL CONSTRAINTS (Non-Negotiable)

### TypeScript
- **Strict mode:** `noImplicitAny`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Target:** ES2022, module resolution: bundler
- **Path alias:** `@/*` → `./src/*`
- **Exported functions:** EXPLICIT return types
- **Enum values:** snake_case string literals (`'fade_to_black'`, `'adult_female'`)

### Database (Drizzle + Turso)
- **Schema:** `src/lib/db/schema.ts` — 10 tables
- **Naming:** camelCase TS properties → snake_case SQL columns
- **Repository pattern:** `src/lib/db/repositories/*.repo.ts`
- **Soft delete:** Only `projects` table has `deleted_at` — ALL queries MUST filter `WHERE deleted_at IS NULL`
- **updated_at:** Does NOT auto-update — MUST set explicitly in UPDATE queries

### CSS & UI
- **ALL colors from CSS variables** in `globals.css` — NEVER hardcode colors
- **Dark mode:** `.dark` class override via `next-themes` `attribute="class"`
- **Icons:** `lucide-react` only — NEVER custom SVG
- **Component library:** `shadcn/ui` primitives in `src/components/ui/`
- **Responsive:** Mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- **Animations:** `framer-motion` for theme transitions
- **Font:** Inter (sans), JetBrains Mono (mono)
- **Spacing:** Tailwind default scale (space-1=4px, space-2=8px, etc.)

### Validation
- **Zod schemas:** `src/lib/validation/schemas.ts` — single source of truth
- **color_palette handling:** `z.union([z.string(), z.array(z.string())])` — handle BOTH formats in generate route
- **API input and LLM output:** ALWAYS validate via Zod

### i18n
- **Locales:** `['id', 'en']`, default `'id'`
- **Files:** `messages/id.json`, `messages/en.json` — MUST have identical keys
- **V3 keys:** `landing.features.transitions.*`, `landing.features.voice.*`, `landing.features.audio.*`, `landing.features.imagePrompts.*`, `landing.features.theme.*`

### Testing
- **Unit:** Vitest ^2.1.0, coverage 80% (lines, branches, functions, statements)
- **E2E:** Playwright ^1.49.0, Chromium only, 120s timeout, base URL `http://localhost:3000`
- **Coverage include:** `src/lib/**`, `src/app/api/**`
- **Coverage exclude:** `**/*.test.ts`, `src/components/ui/**`

### Deployment
- **Platform:** Vercel, pnpm 11.7.0, `pnpm install --frozen-lockfile`
- **Generate endpoint:** `maxDuration = 300s` (Vercel Hobby plan)
- **External packages:** `@libsql/client` (serverExternalPackages)

---

## PROHIBITIONS (Do NOT Do These)

1. **DO NOT change scope** — only 5 V3 features + gap closure + tests. Not a rewrite.
2. **DO NOT skip migration** — new columns MUST exist in DB before generate route update.
3. **DO NOT hardcode colors** — all from CSS variables in `globals.css`.
4. **DO NOT skip `.returning()`** — `bulkCreateScenes` MUST return rows for audio_specs INSERT.
5. **DO NOT skip color_palette array handling** — `Array.isArray()` check is MANDATORY.
6. **DO NOT skip graceful skip** — empty field = skip + log warning, NOT crash entire generate.
7. **DO NOT modify existing Zod schemas** — schemas.ts is already complete for V3.
8. **DO NOT commit .env or secrets** — API keys, Turso token, encryption key in env only.
9. **DO NOT create component tests (.test.tsx)** — lib layer unit tests + E2E are sufficient.
10. **DO NOT add features outside V3 scope** — no multi-tenant, no payment, no Redis, no PWA.

---

## DEFINITION OF DONE (Verification Checklist)

Before declaring completion, verify ALL:

- [ ] **D1:** Migration 0002 successful — `PRAGMA table_info(scenes)` → voiceover_speaker exists
- [ ] **D2:** Migration rollback works — run rollback, verify columns removed
- [ ] **D3:** Generate saves voiceover_speaker — generate → query scenes → field populated
- [ ] **D4:** Generate saves color_palette + technical — generate → query image_prompts → both columns populated
- [ ] **D5:** Generate saves audio_specs — generate → query scene_audio → records exist per scene
- [ ] **D6:** image_prompts.scene_id linked — generate → query image_prompts → scene_id is NOT null
- [ ] **D7:** TypeScript build passes — `npm run build` with no errors
- [ ] **D8:** Unit tests passing — `npm test` — all pass
- [ ] **D9:** Coverage ≥ 80% — `npm run test:coverage` — thresholds met
- [ ] **D10:** E2E ≥ 10 passing — `npx playwright test` — all pass
- [ ] **D11:** Landing page V3 features — browser: features section visible
- [ ] **D12:** Theme toggle on landing page — browser: dark/light/system toggle works
- [ ] **D13:** Image prompt 8 layers — browser: generate result → 8 layer sections visible
- [ ] **D14:** Export includes new fields — export JSON → color_palette, technical, audio_specs present

---

## VERIFICATION COMMANDS

Run these after each phase:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests with coverage
npm run test:coverage

# E2E tests
npx playwright test

# Build
npm run build

# Dev server
npm run dev

# DB migration
npx drizzle-kit migrate

# DB studio (visual inspection)
npx drizzle-kit studio
```

---

## FINAL REPORT

After completing ALL 7 phases, provide a summary:

1. **Files created/modified:** List all files with status (created/modified)
2. **Migration status:** Confirm migration applied successfully
3. **Test results:** Unit test count, coverage %, E2E test count
4. **Build status:** Confirm `npm run build` succeeds
5. **Definition of Done:** Check off all 14 items (D1-D14)
6. **Issues encountered:** Any blockers, workarounds, or deviations from spec

---

## AUTONOMOUS EXECUTION

Build the entire PromptFlow V3 update **autonomously** until completion. Do NOT ask for clarification — all requirements are in the documents listed above. If you encounter ambiguity, refer to AGENTS.md (primary guide) or the relevant technical document.

**Start now. Read AGENTS.md first. Execute all 7 phases. Report at the end.**
