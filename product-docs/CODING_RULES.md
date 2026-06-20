# CODING_RULES.md — PromptFlow V3

> **Versi:** 2.0 (V3 Update)
> **Tanggal:** 2026-06-21
> **Deliverable:** 5 fitur inti V3 — Light Theme, Scene Transition, Complex Image Prompts (8 layer), Voiceover Voice Type, Supporting Audio
> **Selaras:** SRS.md v2.0, PROJECT_ARCHITECTURE.md v2.0, DATABASE_SCHEMA.md v2.0, UIUX_SPEC.md v2.0, API_CONTRACT.md v3.0, RAG-CONTEXT.md

---

## 1. Ringkasan & Tech Stack

| Aspek | Nilai |
|---|---|
| Project | PromptFlow — Workflow engine otomasi prompt animasi AI |
| Deliverable V3 | 5 fitur: Light Theme, Scene Transition, Complex Image Prompts (8 layer), Voiceover Voice Type, Supporting Audio |
| Bahasa | TypeScript 5.7+ (`"strict": true`) |
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Theme | **next-themes ^0.4.4** (NEW — satu-satunya dep baru V3) |
| Animation | framer-motion ^12.40.0 |
| ORM | Drizzle ORM ^0.38.0 (additive migration) |
| DB | Turso/libSQL (dialect: turso) |
| Validation | Zod ^3.24.0 |
| AI SDK | Vercel AI SDK v4 (`ai` ^4.0.0) — **TIDAK upgrade ke v6** |
| AI Provider | `@ai-sdk/openai-compatible` ^1.0.0 (multi-provider) |
| Auth | NextAuth v5 (beta.25) |
| i18n | next-intl ^3.26.0 (dwibahasa ID/EN) |
| Icons | lucide-react |
| Analytics | @vercel/analytics |
| Forms | react-hook-form + resolvers |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | ESLint 9 (flat config) + Prettier + prettier-plugin-tailwindcss |
| Package Manager | pnpm 11.7.0 |
| Node | >= 20.0.0 |

### 1.1 Dependency V3

| Package | Versi | Install | Sitasi |
|---|---|---|---|
| next-themes | ^0.4.4 | `pnpm add next-themes` | SRS S1.2, RAG-CONTEXT ASM-1 |

**TIDAK BOLEH ditambah:** AI SDK v6, GSAP, Tone.js, Howler.js, ElevenLabs SDK, Midjourney/DALL-E SDK, custom font berbayar. (SRS S1.3)

---

## 2. Konvensi Penamaan

### 2.1 File & Folder

| Aspek | Aturan | Contoh | Sitasi |
|---|---|---|---|
| Component file | `kebab-case.tsx` | `theme-toggle.tsx`, `scene-transition-card.tsx` | ARCHITECTURE S6 |
| Page file | `page.tsx` (Next.js) | `[locale]/generate/page.tsx` | SRS S2.1 |
| Layout file | `layout.tsx` | `[locale]/layout.tsx` | SRS S2.1 |
| API route | `route.ts` di `app/api/v1/` | `scenes/[sceneId]/audio/route.ts` | API_CONTRACT S5 |
| Repository | `kebab-case.repository.ts` | `scene-audio.repository.ts` | ARCHITECTURE S6 |
| Schema (DB) | `schema.ts` di `lib/db/` | `schema.ts` | DATABASE_SCHEMA S4 |
| Schema (Zod) | `schemas.ts` di `lib/validation/` | `schemas.ts` | SRS S3.8 |
| Migration SQL | `drizzle/NNNN_description.sql` | `0001_v3_core_features.sql` | DATABASE_SCHEMA S9 |
| Migration script | `v2-to-v3.ts` di `lib/migration/` | `v2-to-v3.ts` | SRS S3.11 |
| Test file | `*.test.ts` / `*.test.tsx` (co-located) | `theme-toggle.test.tsx` | — |
| i18n messages | `messages/{locale}.json` | `messages/id.json`, `messages/en.json` | SRS S3.10 |
| CSS | Tailwind v4 di `globals.css` — **tidak CSS modules** | `globals.css` | RAG-CONTEXT S9.2 |

### 2.2 Component Naming

| Aspek | Aturan | Contoh |
|---|---|---|
| Component file | `kebab-case.tsx` — nama deskriptif | `voice-type-selector.tsx` |
| Component export | `PascalCase` — **named export** (bukan default) | `export function VoiceTypeSelector()` |
| Interface/Props | `PascalCase` + suffix `Props` | `export interface VoiceTypeSelectorProps {}` |
| Type alias | `PascalCase` | `type TransitionType = 'cut' \| 'dissolve'` |
| Utility function | `camelCase`, verb-first | `buildSystemPrompt()` |
| Constants | `UPPER_SNAKE_CASE` | `TRANSITION_TYPES`, `VOICE_TYPES` |
| Boolean props | `is`/`has` prefix | `isExpanded`, `isLast` |
| Callback props | `on` prefix | `onChange`, `onUpdate`, `onSuccess` |

### 2.3 DB Table & Column Naming (Drizzle)

| Aspek | Aturan | Contoh | Sitasi |
|---|---|---|---|
| Table name | `snake_case` | `scene_audio`, `image_prompts` | DATABASE_SCHEMA S4 |
| Column name | `snake_case` | `transition_type`, `voice_speed` | DATABASE_SCHEMA S4.8 |
| Drizzle field | `camelCase` | `transitionType`, `voiceSpeed` | DATABASE_SCHEMA S4.8 |
| FK column | `{table}_id` | `project_id`, `scene_id` | DATABASE_SCHEMA S5.2 |
| Index name | `idx_{table}_{column}` | `idx_scene_audio_scene_id` | DATABASE_SCHEMA S6 |
| Timestamp | `created_at` INTEGER DEFAULT `unixepoch()` | — | DATABASE_SCHEMA S11.3 |

### 2.4 i18n Keys

| Aspek | Aturan | Contoh |
|---|---|---|
| Namespace | Root namespace per domain | `common.*`, `transition.*`, `voice.*`, `audio.*`, `imagePrompt.*` |
| Nested objects | Dot notation | `transition.types.cut` |
| Key naming | camelCase, descriptive | `voice.speedLabel` |
| Sync ID/EN | Keys **HARUS identik** di `id.json` + `en.json` | SRS S3.10 |
| No hardcoded | Semua teks UI via `useTranslations()` | SRS TC-15 |

### 2.5 Enum Values (V3)

| Domain | Nilai | Sitasi |
|---|---|---|
| Transition type | `cut`, `dissolve`, `fade_to_black`, `fade_to_white`, `wipe`, `match_cut` | DATABASE_SCHEMA B.1 |
| Transition easing | `linear`, `ease_in`, `ease_out`, `ease_in_out` | DATABASE_SCHEMA B.1 |
| Transition direction | `forward`, `backward`, `loop` | DATABASE_SCHEMA B.1 |
| Voice type | `child`, `teen`, `adult_male`, `adult_female`, `elderly_male`, `elderly_female`, `narrator` | DATABASE_SCHEMA B.2 |
| Voice emotion | `neutral`, `happy`, `sad`, `excited`, `calm`, `dramatic` | DATABASE_SCHEMA B.3 |
| Voice pitch | `low`, `medium`, `high`, `auto` | DATABASE_SCHEMA B.3 |
| Audio type | `background_music`, `sfx`, `ambient`, `music_cue`, `transition_audio` | DATABASE_SCHEMA B.4 |
| Audio timing | `start`, `throughout`, `end`, `specific_moment` | DATABASE_SCHEMA B.4 |
| Theme | `dark`, `light`, `system` | UIUX_SPEC S2 |
| Scene pacing | `fast`, `normal`, `slow` | DATABASE_SCHEMA B.1 (ASUMSI) |
| Scene mood | `cheerful`, `dramatic`, `tense`, `peaceful`, `mysterious` | DATABASE_SCHEMA B.1 (ASUMSI) |

---

## 3. Struktur & Gaya Kode

### 3.1 Component Pattern

```typescript
// DO — Server Component default, named export, minimal imports
import { getTranslations } from 'next-intl/server';
import { SceneTransitionCard } from './scene-transition-card';

export async function ResultTabs() {
  const t = await getTranslations('common');
  return <section>/* ... */</section>;
}
```

```typescript
// DO — Client Component, explicit 'use client', minimal scope
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme('light')}>/* ... */</button>;
}
```

```typescript
// DO — V3 SceneTransitionCard: props typed, named export
export interface SceneTransitionCardProps {
  scene: SceneWithV3;
  index: number;
  totalScenes: number;
  isLast?: boolean;
}

export function SceneTransitionCard({ scene, index, totalScenes, isLast = false }: SceneTransitionCardProps) {
  // ...
}
```

```typescript
// JANGAN — campur Client + Server di file sama
// JANGAN — default export component
// JANGAN — hardcode teks UI (pakai i18n key)
// JANGAN — pakai React.FC
```

### 3.2 File Organization

```
src/components/
  common/
    app-header.tsx          (MODIFY — +ThemeToggle)
    theme-toggle.tsx        (NEW — 3-state toggle)
    changelog-banner.tsx    (NEW — V3 announcement)
  generate/
    scene-transition-card.tsx  (NEW)
    voice-type-selector.tsx    (NEW)
    audio-panel.tsx            (NEW)
    image-prompt-display.tsx   (NEW)
    result-tabs.tsx            (MODIFY — integrate 4 new)
  settings/
    provider-card.tsx       (MODIFY — remove hardcoded dark:)

src/lib/
  db/schema.ts              (MODIFY — +11 scenes +5 image_prompts +scene_audio)
  validation/schemas.ts     (MODIFY — extend SceneSchema + new SceneAudioSchema)
  ai/prompt-builder.ts      (MODIFY — +5 metadata instructions)
  db/repositories/
    scene-audio.repository.ts  (NEW — CRUD)
  migration/
    v2-to-v3.ts             (NEW — backfill + dry-run + rollback)
  export/markdown.template.ts  (MODIFY — +V3 sections)
  analytics/events.ts       (MODIFY — +5 V3 events)
  templates/presets.ts      (NEW — template presets)

src/app/api/v1/
  generate/route.ts         (MODIFY — persist V3 fields)
  projects/[id]/scenes/[sceneId]/audio/route.ts  (NEW — CRUD)
  projects/[id]/theme/route.ts                    (NEW — PATCH theme)
```

### 3.3 Interface/Props Pattern

```typescript
// DO — Interface di atas component, exported untuk reuse
export interface VoiceTypeSelectorProps {
  voiceType: VoiceType;
  voiceEmotion: VoiceEmotion;
  voiceSpeed: number;
  voicePitch: VoicePitch;
  onChange: (field: string, value: string | number) => void;
}

export function VoiceTypeSelector({ voiceType, voiceEmotion, voiceSpeed, voicePitch, onChange }: VoiceTypeSelectorProps) {
  // ...
}
```

### 3.4 Repository Pattern

```typescript
// DO — Repository: named export, typed return, error handling
import { db } from '../client';
import { sceneAudio } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getAudioByScene(sceneId: number): Promise<SceneAudio[]> {
  return db.select().from(sceneAudio).where(eq(sceneAudio.sceneId, sceneId));
}

export async function createAudio(entry: CreateSceneAudioInput): Promise<SceneAudio> {
  const [result] = await db.insert(sceneAudio).values(entry).returning();
  return result;
}
```

### 3.5 API Route Pattern

```typescript
// DO — API route: auth check, validation, error envelope
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { SceneAudioSchema } from '@/lib/validation/schemas';

export async function POST(
  request: Request,
  { params }: { params: { id: string; sceneId: string } }
) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });

  const body = await request.json();
  const parsed = SceneAudioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }, { status: 400 });
  }

  // ... create audio
}
```

### 3.6 TypeScript Rules

```typescript
// DO — Type-safe
function parseInput(data: unknown): string {
  return z.string().parse(data);
}

// JANGAN
function parseInput(data: any): string {
  return data.toString(); // runtime crash risk
}
```

| Aturan | Detail |
|---|---|
| `"strict": true` di `tsconfig.json` | WAJIB. No implicit any. |
| **No `any`** tanpa `// eslint-disable-next-line` + alasan | Ganti `any` → `unknown` + Zod narrow |
| `interface` untuk props | `export interface HeroProps {}` |
| `type` untuk union/intersection | `type AnimationDirection = 'up' \| 'down'` |
| Named exports untuk semua type | Tidak ada anonymous type export |
| `as const` untuk static config | `export const FEATURES = [...] as const` |
| Nullability explicit | `?? 'default'`, `?.`, jangan `!` non-null assertion tanpa check |
| Import order | React/Next → Project config → Components → Types |

---

## 4. Aturan Formatting & Linting

### 4.1 Tools

| Tool | Config | Fungsi | Sitasi |
|---|---|---|---|
| ESLint | `eslint.config.mjs` (flat config) | Linting TypeScript + React | — |
| Prettier | `.prettierrc` | Formatting otomatis | — |
| prettier-plugin-tailwindcss | Prettier plugin | Sort Tailwind classes | — |
| TypeScript | `tsconfig.json` (`"strict": true`) | Type checking | SRS TC-14 |

### 4.2 Commands

```bash
pnpm lint              # ESLint check
pnpm lint --fix        # ESLint auto-fix
pnpm typecheck         # tsc --noEmit
pnpm format            # Prettier format
pnpm build             # Production build
pnpm test --coverage   # Unit test + coverage
pnpm test:e2e          # E2E test (Playwright)
```

### 4.3 Pre-commit Checklist

| # | Check | Command |
|---|---|---|
| 1 | TypeScript strict | `pnpm typecheck` 0 error |
| 2 | ESLint | `pnpm lint` 0 error |
| 3 | Build | `pnpm build` pass |
| 4 | No `any` | Review grep output |
| 5 | No hardcoded text | Cek string literal di component |
| 6 | No hardcoded colors | Cek hex/warna di className |
| 7 | No secret in client | Cek `NEXT_PUBLIC_*` vars |

### 4.4 Tailwind Class Sorting

- Prettier with `prettier-plugin-tailwindcss` auto-sorts classes.
- Urutan: layout (flex, grid) → spacing (p, m, gap) → typography (text, font) → visual (bg, border) → responsive (md:, lg:)

---

## 5. Prinsip Desain

| Prinsip | Penerapan V3 | Sitasi |
|---|---|---|
| **DRY** | Extract reusable component (SceneTransitionCard, VoiceTypeSelector, AudioPanel, ImagePromptDisplay). Jangan copy-paste template. | — |
| **KISS** | V3 = additive. Tidak refactor fundamental. Field baru di existing table (scenes), bukan new table kecuali 1:N (scene_audio). | ARCHITECTURE ADR-01..03 |
| **SOLID** | Repository pattern: single responsibility. Prompt builder: open for extension (tambah instruksi), closed for modification. | — |
| **Immutability** | Props readonly. State updates via setter. Tidak mutate DB row langsung — pakai Drizzle update(). | — |
| **File kecil fokus** | 1 component per file. Max ~200 baris per file. Bila lebih → extract child component. | — |
| **Max function length** | Fungsi max ~50 baris. Bila lebih → extract helper. | — |
| **Additive migration** | TIDAK drop kolom V2. Default values wajib untuk semua field baru. Rollback = DROP new columns (last resort). | DATABASE_SCHEMA S9, BRD LIM-V3-01 |
| **Backward compatible** | V2 clients bisa ignore V3 fields. `promptText` tetap single string. Export format tetap JSON + MD. | SRS TC-09, TC-26, TC-27 |

---

## 6. Error Handling & Logging

### 6.1 Error Envelope (API)

```typescript
// Semua API error pakai envelope konsisten
{
  "error": {
    "code": "VALIDATION_ERROR",   // enum stabil
    "message": "audioType wajib diisi",  // manusiawi
    "details": { "field": "audioType" }  // opsional
  },
  "traceId": "req_abc123"  // opsional
}
```

| Code | Kapan |
|---|---|
| `VALIDATION_ERROR` | Zod parse gagal |
| `UNAUTHORIZED` | Tidak ada session |
| `FORBIDDEN` | Bukan owner |
| `NOT_FOUND` | Resource tidak ada |
| `INTERNAL` | DB error, LLM error |

### 6.2 Zod Validation + Retry

```typescript
// DO — LLM output validated via Zod, retry on failure
const parsed = SceneSchema.safeParse(llmOutput);
if (!parsed.success) {
  const withDefaults = SceneSchema.parse({ ...llmOutput, ...defaultValues });
  // Retry with corrected data
}
```

### 6.3 Fallback Defaults (V3)

| Field | Default | Sitasi |
|---|---|---|
| transitionType | `'cut'` | DATABASE_SCHEMA S7.3 |
| transitionDurationMs | `0` | DATABASE_SCHEMA S7.3 |
| transitionEasing | `'linear'` | DATABASE_SCHEMA S7.3 |
| transitionDirection | `'forward'` | DATABASE_SCHEMA S7.3 |
| voiceType | `'narrator'` | DATABASE_SCHEMA S7.3 |
| voiceEmotion | `'neutral'` | DATABASE_SCHEMA S7.3 |
| voiceSpeed | `1.0` | DATABASE_SCHEMA S7.3 |
| voicePitch | `'auto'` | DATABASE_SCHEMA S7.3 |
| audio timing | `'throughout'` | DATABASE_SCHEMA S7.3 |
| audio volume | `0.7` | DATABASE_SCHEMA S7.3 |

### 6.4 Client-Side Error Handling

```typescript
// DO — Error Boundary per page group
'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">{t('error.title')}</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset}>{t('error.retry')}</button>
    </div>
  );
}
```

### 6.5 Logging Rules

```typescript
// DO — Structured logging
console.error('[generate] LLM validation failed:', parsed.error.message);
console.warn('[migration] Dry-run: would update scene', scene.id);

// JANGAN — Sensitive data di log
console.log('User token:', token);  // VIOLATION
```

| Tidak Boleh Log | Boleh Log |
|---|---|
| API keys, tokens | Page/component errors |
| User PII (email, name) | Migration dry-run results |
| Session data | Analytics event names |
| ENCRYPTION_KEY | LLM validation failures |

---

## 7. Aturan Keamanan Koding

| ID | Aturan | Detail | Sitasi |
|---|---|---|---|
| SEC-01 | Tidak hardcoded secret | Tidak ada `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `TURSO_AUTH_TOKEN` di client | SRS TC-17 |
| SEC-02 | No API key exposure | Tidak ada `NEXT_PUBLIC_*` untuk sensitive data | — |
| SEC-03 | External link security | `target="_blank"` + `rel="noopener noreferrer"` | — |
| SEC-04 | Input validation | Zod schemas untuk semua request body + LLM output | SRS TC-10 |
| SEC-05 | Parameterized queries | Drizzle ORM = parameterized by default. Jangan raw SQL string concat. | — |
| SEC-06 | Auth check | `getServerSession()` di semua API routes | API_CONTRACT S2 |
| SEC-07 | Ownership check | `project.user_id === session.user.id` | API_CONTRACT S2.2 |
| SEC-08 | XSS prevention | React auto-escape. Tidak `dangerouslySetInnerHTML`. | — |
| SEC-09 | CSRF | Next.js built-in + NextAuth | — |
| SEC-10 | No PII in analytics | Track events only, no user data | BRD NFR-S04 |
| SEC-11 | HTTPS only | Vercel default. Force redirect bila produksi. | — |
| SEC-12 | Sanitasi output | LLM output validated via Zod sebelum persist/display | SRS TC-10 |
| SEC-13 | Enum safety | Semua V3 enums validated via Zod. Invalid = reject + fallback default | SRS TC-10, TC-11 |
| SEC-14 | Theme = client only | next-themes localStorage. Server trust = optional sync. | SRS S3.1 |
| SEC-15 | CASCADE delete | scene_audio CASCADE dari scenes + projects. Tidak orphan data. | DATABASE_SCHEMA S5.2 |
| SEC-16 | API key encryption | `api_key_encrypted` di `provider_configs`. ENCRYPTION_KEY server-only. | RAG-CONTEXT S2.1 |

---

## 8. Standar Testing

### 8.1 Coverage Targets

| Level | Target | Tool | Sitasi |
|---|---|---|---|
| Unit | >= 80% | Vitest | SRS S8.4 |
| Integration | >= 60% | Vitest + Supertest | SRS S8.4 |
| E2E (critical path) | 100% | Playwright | SRS S8.4 |
| Migration dry-run | 100% V2 retained | Script test | SRS S8.4 |
| LLM output | >= 90% enum valid/field | Analytics + manual | SRS S8.4 |
| Lint | 0 error | ESLint | — |
| Type check | 0 error | TypeScript | SRS TC-14 |
| A11y | 0 critical violation | axe-core | SRS S8.3 |
| Performance | Lighthouse >= 85 mobile | Lighthouse CI | SRS S8.2 |

### 8.2 Test Structure

```typescript
// DO — Co-located test, describe/it structure
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceTypeSelector } from './voice-type-selector';

describe('VoiceTypeSelector', () => {
  it('renders all voice type options', () => {
    render(<VoiceTypeSelector voiceType="narrator" voiceEmotion="neutral" voiceSpeed={1.0} voicePitch="auto" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: /voice type/i })).toBeInTheDocument();
  });

  it('calls onChange when voice type changes', () => {
    const onChange = vi.fn();
    render(<VoiceTypeSelector voiceType="narrator" voiceEmotion="neutral" voiceSpeed={1.0} voicePitch="auto" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox', { name: /voice type/i }), { target: { value: 'child' } });
    expect(onChange).toHaveBeenCalledWith('voiceType', 'child');
  });
});
```

### 8.3 E2E Critical Path

```typescript
import { test, expect } from '@playwright/test';

test.describe('Generate with V3 Metadata', () => {
  test('generates scenes with transition, voice, audio fields', async ({ page }) => {
    await page.goto('/en/generate');
    await page.fill('[name="title"]', 'Test Story');
    await page.click('button:has-text("Generate")');
    await expect(page.locator('[data-testid="scene-card"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="transition-badge"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="voice-spec"]').first()).toBeVisible();
  });

  test('theme toggle switches between light and dark', async ({ page }) => {
    await page.goto('/en');
    await page.click('[data-testid="theme-toggle"]');
    await page.click('text=Mode terang');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
```

### 8.4 Migration Testing

```typescript
describe('V2 to V3 Migration', () => {
  it('retains 100% V2 data with V3 defaults', async () => {
    const result = await migrateV2ToV3({ dryRun: true });
    expect(result.errors).toHaveLength(0);
    expect(result.processed).toBeGreaterThan(0);
  });

  it('rollback reverts all V3 changes', async () => {
    const result = await rollbackV2ToV3({ dryRun: true });
    expect(result.reverted).toBeGreaterThan(0);
  });
});
```

---

## 9. Git Workflow & Commit Conventions

### 9.1 Branch Naming

| Type | Pattern | Contoh |
|---|---|---|
| Feature V3 | `feat/v3-<scope>` | `feat/v3-scene-transition` |
| Fix | `fix/<scope>` | `fix/voice-type-validation` |
| Chore | `chore/<scope>` | `chore/install-next-themes` |
| Migration | `migrate/<scope>` | `migrate/v2-to-v3` |

### 9.2 Commit Messages (Conventional)

```
feat(v3): add scene transition metadata to scenes table

- Add 4 fields: transitionType, transitionDurationMs, transitionEasing, transitionDirection
- Add Zod validation with defaults (cut/0/linear/forward)
- Extend prompt-builder with transition instructions
- Add SceneTransitionCard UI component

Refs: SRS F-V3-02, PRD FR-V3-02, DATABASE_SCHEMA S4.8
```

### 9.3 Commit Rules

| Aturan | Detail | Sitasi |
|---|---|---|
| **Atomic** | 1 commit = 1 logical change. 5 atomic commits untuk 5 fitur V3. | BRD DoD V3 |
| **Conventional** | `feat(v3): ...`, `fix(v3): ...`, `migrate(v3): ...` | — |
| **No direct push main** | Lewat PR + review minimum 1 | SRS TC-20 |
| **No secret commit** | `.env.local` di `.gitignore` | — |
| **Per feature** | 5 atomic commits: theme, transition, image, voice, audio | SRS S8.1 |

### 9.4 PR Template

```markdown
## Description
[What this PR does]

## Related Documents
- Refs: SRS F-V3-XX, PRD FR-V3-XX, DATABASE_SCHEMA S4.X

## Type of Change
- [ ] New component
- [ ] Schema migration (additive)
- [ ] Prompt builder enhancement
- [ ] API route
- [ ] i18n key addition
- [ ] Bug fix

## Testing
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Unit tests pass (>= 80% coverage)
- [ ] Migration dry-run tested
- [ ] Responsive tested (375/768/1024/1440px)
- [ ] Theme tested (light + dark)

## Screenshots (if applicable)
[Desktop Light] [Desktop Dark] [Mobile]
```

---

## 10. Review Checklist (Definition of Done)

### Per Component

| # | Check | Status |
|---|---|---|
| 1 | `'use client'` hanya bila butuh interaksi | |
| 2 | Semua teks via i18n key (tidak hardcoded string) | |
| 3 | Design tokens dari globals.css (tidak hardcode hex) | |
| 4 | Responsive (mobile-first: 375 → 768 → 1024 → 1440) | |
| 5 | Theme-aware: works di light DAN dark | |
| 6 | `prefers-reduced-motion` di-respect | |
| 7 | Focus visible ring untuk interactive elements | |
| 8 | Keyboard navigable | |
| 9 | ARIA labels (transition/voice/audio/image labels) | |
| 10 | No `any` type | |
| 11 | Interface typed untuk semua props | |
| 12 | Named export (bukan default) | |
| 13 | No `React.FC` | |
| 14 | No console.log tertinggal | |
| 15 | No unused import | |

### Per PR

| # | Check | Status |
|---|---|---|
| 1 | `pnpm lint` 0 error | |
| 2 | `pnpm typecheck` 0 error | |
| 3 | `pnpm build` pass | |
| 4 | Lighthouse Performance mobile >= 85 | |
| 5 | axe-core 0 critical violation (light + dark) | |
| 6 | Tested 375/768/1024/1440px | |
| 7 | Tested light + dark theme | |
| 8 | Conventional commit `feat(v3): ...` | |
| 9 | No direct push `main` — via PR | |
| 10 | i18n keys ID+EN sinkron | |
| 11 | Zod schema validated (typecheck 0 error) | |
| 12 | Migration additive only (no DROP) | |
| 13 | Default values for all new fields | |
| 14 | Backward compatible V2 | |

---

## 11. Larangan Umum

| ID | Larangan | Penjelasan | Sitasi |
|---|---|---|---|
| L-01 | Jangan pakai `any` | TypeScript strict mode. Pakai `unknown` + Zod narrow. | SRS TC-14 |
| L-02 | Jangan hardcoded teks UI | Semua via `useTranslations()` / `getTranslations()` | SRS TC-15 |
| L-03 | Jangan hardcoded warna/hex | Pakai Tailwind design tokens dari globals.css | SRS TC-16, UIUX_SPEC S2 |
| L-04 | Jangan campur Server + Client di file sama | Pilih salah satu per component | SRS TC-18 |
| L-05 | Jangan pakai `dangerouslySetInnerHTML` | React auto-escapes | — |
| L-06 | Jangan log sensitive data | API keys, tokens, PII | — |
| L-07 | Jangan push ke `main` langsung | Via PR + review | SRS TC-20 |
| L-08 | Jangan commit `.env.local` | `.gitignore` handle | — |
| L-09 | Jangan pakai `width`, `height`, `top` di Framer Motion | GPU-only: `transform`, `opacity` | — |
| L-10 | Jangan skip `prefers-reduced-motion` | `useReducedMotion()` wajib | UIUX_SPEC D-07 |
| L-11 | Jangan pakai GSAP / heavy lib | Framer Motion sudah cukup | SRS S1.3 |
| L-12 | Jangan hardcode `href` internal | Routing via next-intl | — |
| L-13 | Jangan pakai `window` / `document` di Server Component | Browser API hanya di Client | SRS TC-18 |
| L-14 | Jangan lupa `rel="noopener noreferrer"` | Untuk `target="_blank"` | — |
| L-15 | Jangan animasi tanpa `viewport={{ once: true }}` | Performa | — |
| L-16 | Jangan inline object/array di props re-render | Extract ke constants / useMemo | — |
| L-17 | Jangan pakai `React.FC` | Gunakan function declaration | — |
| L-18 | Jangan Magic number | Extract ke constants | — |
| L-19 | Jangan nesting > 3 level | Extract ke child component | — |
| L-20 | Jangan default export component | Named export saja | — |
| L-21 | Jangan pakai AI SDK v6 | Kode V1 pakai v4. Upgrade = breaking. | SRS TC-02 |
| L-22 | Jangan drop kolom V2 | Migration additive only. Default values wajib. | SRS TC-05, TC-06 |
| L-23 | Jangan tanpa Zod validation | Semua LLM output + request body validated | SRS TC-10 |
| L-24 | Jangan bypass auth check | `getServerSession()` wajib di semua API | API_CONTRACT S2 |
| L-25 | Jangan bypass ownership check | `project.user_id === session.user.id` | API_CONTRACT S2.2 |
| L-26 | Jangan tambah dep baru tanpa approval | V3 = 1 dep baru (next-themes). Lain = BLOCKED. | SRS S1.3 |
| L-27 | Jangan upgrade AI SDK | Tetap v4. Jangan upgrade v6. | SRS TC-02, ADR-09 |
| L-28 | Jangan hardcode `className="dark"` | Pakai next-themes ThemeProvider | SRS S3.1 |
| L-29 | Jangan pakai `dark:` Tailwind variants | Pakai CSS variables yang auto-switch theme | UIUX_SPEC D-08 |
| L-30 | Jangan tanpa default values di migration | Semua V3 field wajib punya default | SRS TC-06 |
| L-31 | Jangan tanpa dry-run sebelum migration production | Dry-run mode wajib | SRS TC-32 |
| L-32 | Jangan generate prompt tanpa JSON schema compliance | LLM output harus pass Zod SceneSchema | SRS TC-10 |
| L-33 | Jangan tanpa error envelope di API | Semua error pakai `{ error: { code, message } }` | API_CONTRACT S3.3 |
| L-34 | Jangan lupa i18n key ID+EN sinkron | Keys wajib identik kedua file | SRS S3.10 |
| L-35 | Jangan hardcode enum values di component | Pakai constant arrays dari schema | — |

---

## 12. Standar Frontend

### 12.1 Theme Rules (next-themes)

| Aturan | Detail | Sitasi |
|---|---|---|
| Provider | `<NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>` di `providers.tsx` | SRS S3.1 |
| Toggle | `<ThemeToggle>` di `app-header.tsx` sebelum `LanguageToggle` | UIUX_SPEC S5.1 |
| Persistence | localStorage via next-themes. Tidak perlu custom persist. | SRS S3.1 |
| FOUC prevention | next-themes inline blocking script. `<html suppressHydrationWarning>` | SRS S3.1 |
| No hardcoded dark | Hapus `className="dark"` dari `layout.tsx:66` + `<div className="dark">` dari `page.tsx:24` | SRS S3.1 |
| No `dark:` variants | Pakai CSS variables yang auto-switch. Contoh: `bg-card` bukan `dark:bg-card`. | UIUX_SPEC D-08 |
| CSS variables | Light: `globals.css:4-28`, Dark: `globals.css:49-72`. Auto-switch via `.dark` class. | RAG-CONTEXT S9.2 |
| Transition | Instant (0ms). Tidak ada animasi antar theme. | UIUX_SPEC S10.1 |

```typescript
// DO — ThemeToggle component
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('common');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button variant="ghost" size="icon" aria-label={t('themeToggle')}>
          {theme === 'light' ? <Sun className="h-5 w-5" /> : theme === 'dark' ? <Moon className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}><Sun className="mr-2 h-4 w-4" />{t('lightMode')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4" />{t('darkMode')}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}><Monitor className="mr-2 h-4 w-4" />{t('systemMode')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

```css
/* JANGAN — Hardcode dark class */
/* <html lang="id" className="dark"> VIOLATION */

/* JANGAN — Hardcode dark: variants */
/* className="dark:bg-green-950" VIOLATION */

/* DO — Pakai design tokens */
/* className="bg-primary text-primary-foreground" */
/* className="bg-background text-foreground" */
/* className="border border-border" */
```

### 12.2 Design Tokens (WAJIB Pakai)

| Token | Light | Dark | Kegunaan |
|---|---|---|---|
| `--color-background` | `#ffffff` | `#0a0a0a` | Body bg |
| `--color-foreground` | `#0a0a0a` | `#fafafa` | Body text |
| `--color-primary` | `#7c3aed` | `#a78bfa` | CTA, brand accent |
| `--color-card` | `#ffffff` | `#0f0f0f` | Card bg |
| `--color-muted` | `#f4f4f5` | `#27272a` | Muted surface |
| `--color-muted-foreground` | `#71717a` | `#a1a1aa` | Helper text |
| `--color-accent` | `#ede9fe` | `#3b0764` | Highlight |
| `--color-border` | `#e4e4e7` | `#27272a` | Border, divider |
| `--color-destructive` | `#dc2626` | `#ef4444` | Error, danger |
| `--color-success` | `#16a34a` | `#22c55e` | Success state |
| `--color-warning` | `#d97706` | `#f59e0b` | Warning state |
| `--color-info` | `#2563eb` | `#3b82f6` | Info state |

**Sumber:** `globals.css:4-28` (light), `globals.css:49-72` (dark). `UIUX_SPEC S2.1-S2.3`.

### 12.3 V3 Component Badge Colors

| Domain | Light | Dark | Sitasi |
|---|---|---|---|
| Transition `cut` | `#71717a` / `#a1a1aa` | neutral gray | UIUX_SPEC S2.4 |
| Transition `dissolve` | `#2563eb` / `#60a5fa` | blue | UIUX_SPEC S2.4 |
| Voice `narrator` | `#7c3aed` / `#a78bfa` | violet | UIUX_SPEC S2.5 |
| Audio `background_music` | `#4f46e5` / `#818cf8` | indigo | UIUX_SPEC S2.6 |

### 12.4 Responsive Breakpoints

| Breakpoint | Width | Layout V3 |
|---|---|---|
| Mobile | < 640px | Single column. Scene cards stack. Theme toggle = icon only. |
| Tablet | 640-1024px | 2-column where appropriate. Flow arrows horizontal. |
| Desktop | > 1024px | Full layout. Side-by-side where beneficial. |

### 12.5 Accessibility (WCAG 2.1 AA)

| Kriteria | Implementasi | Sitasi |
|---|---|---|
| Focus visible | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` | UIUX_SPEC S9.2 |
| Keyboard nav | Semua interactive reachable via Tab | UIUX_SPEC S9.2 |
| ARIA labels | `aria-label` untuk toggle, dropdown, accordion, slider | UIUX_SPEC S9.3 |
| Screen reader | Landmark: `<nav>`, `<main>`, `<footer>`. ARIA live regions. | UIUX_SPEC S9.3 |
| Color contrast | >= 4.5:1 body text, >= 3:1 large text | UIUX_SPEC S9.4 |
| Heading hierarchy | h1 → h2 → h3 (tidak skip level) | — |
| Reduced motion | `prefers-reduced-motion` honored | UIUX_SPEC D-07 |
| Theme toggle | Keyboard: Tab → Enter → Arrow → Escape. ARIA: `role="menu"`. | UIUX_SPEC S9.2 |

---

## 13. Schema Rules (Drizzle + Zod)

### 13.1 Drizzle Schema Rules

| Aturan | Detail | Sitasi |
|---|---|---|
| Additive only | `ALTER TABLE ... ADD COLUMN`. TIDAK `DROP COLUMN` V2. | SRS TC-05 |
| Default values | Semua new field wajib punya `default()`. | SRS TC-06 |
| FK cascade | `scene_audio` CASCADE dari `scenes` + `projects`. | DATABASE_SCHEMA S5.2 |
| Index wajib | `scene_audio` wajib index di `scene_id` + `project_id`. | SRS TC-08 |
| Naming | Table: `snake_case`. Column: `snake_case` (SQL), `camelCase` (Drizzle). | DATABASE_SCHEMA S4 |
| Timestamp | `created_at` INTEGER DEFAULT `unixepoch()`. | DATABASE_SCHEMA S11.3 |
| Generate | `pnpm drizzle-kit generate` → `drizzle/0001_v3_core_features.sql` | DATABASE_SCHEMA S9.1 |
| Push | `pnpm drizzle-kit push` ke Turso staging dulu. | SRS S7.2 |

```typescript
// DO — Drizzle schema V3 extension
export const scenes = sqliteTable('scenes', {
  // ... existing V1/V2 fields retained ...

  // V3: Transition (F-V3-02)
  transitionType: text('transition_type').notNull().default('cut'),
  transitionDurationMs: integer('transition_duration_ms').notNull().default(0),
  transitionEasing: text('transition_easing').notNull().default('linear'),
  transitionDirection: text('transition_direction').notNull().default('forward'),

  // V3: Voice (F-V3-04)
  voiceType: text('voice_type').notNull().default('narrator'),
  voiceEmotion: text('voice_emotion').notNull().default('neutral'),
  voiceSpeed: real('voice_speed').notNull().default(1.0),
  voicePitch: text('voice_pitch').notNull().default('auto'),

  // V3: Duration (F-V3-05)
  durationSeconds: integer('duration_seconds'),
});

// DO — New table scene_audio (19 fields: 7 core + 12 EXTENDED ASUMSI)
export const sceneAudio = sqliteTable('scene_audio', {
  // --- 7 CORE FIELDS ---
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sceneId: integer('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
  audioType: text('audio_type').notNull(),
  description: text('description').notNull(),
  timing: text('timing').notNull().default('throughout'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),

  // --- 12 EXTENDED FIELDS (ASUMSI — dari DATABASE_SCHEMA S4.10) ---
  durationSeconds: integer('duration_seconds'),
  volume: real('volume').notNull().default(0.7),
  fadeInMs: integer('fade_in_ms').notNull().default(0),
  fadeOutMs: integer('fade_out_ms').notNull().default(0),
  musicGenre: text('music_genre'),
  musicMood: text('music_mood'),
  musicTempoBpm: integer('music_tempo_bpm'),
  musicInstruments: text('music_instruments'),
  musicVolume: real('music_volume'),
  sfxList: text('sfx_list'),
  ambientType: text('ambient_type'),
  ambientVolume: real('ambient_volume'),
}, (t) => ({
  projectIdx: index('idx_scene_audio_project_id').on(t.projectId),
  sceneIdx: index('idx_scene_audio_scene_id').on(t.sceneId),
}));
```

### 13.2 Zod Schema Rules

| Aturan | Detail | Sitasi |
|---|---|---|
| Extend, don't replace | Tambah field ke existing schemas. Jangan rewrite. | SRS S3.8 |
| Default values | `z.enum([...]).default('cut')` untuk semua enum fields. | DATABASE_SCHEMA S7.3 |
| Range validation | `z.number().min(0.5).max(2.0)` untuk voiceSpeed. | DATABASE_SCHEMA S7.4 |
| Optional fields | `z.string().nullable().optional()` untuk nullable fields. | DATABASE_SCHEMA S7.2 |
| Enum arrays | `z.enum(['cut', 'dissolve', ...])` — array literal wajib match DB enum. | DATABASE_SCHEMA S7.3 |
| LLM output | `SceneSchema.safeParse()` → retry on failure → apply defaults. | SRS TC-10 |

```typescript
// DO — Zod schema V3 extension
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
  audio: z.array(SceneAudioSchema).optional(),
});

export const SceneAudioSchema = z.object({
  audioType: z.enum(['background_music', 'sfx', 'ambient', 'music_cue', 'transition_audio']),
  description: z.string().min(1),
  timing: z.enum(['start', 'throughout', 'end', 'specific_moment']).default('throughout'),
  durationSeconds: z.number().int().positive().optional(),
  volume: z.number().min(0).max(1).default(0.7),
  fadeInMs: z.number().int().min(0).default(0),
  fadeOutMs: z.number().int().min(0).default(0),
});
```

### 13.3 Migration Rules

| Aturan | Detail | Sitasi |
|---|---|---|
| One file | `drizzle/0001_v3_core_features.sql` untuk semua 5 fitur | RAG-CONTEXT ASM-6 |
| Additive SQL | `ALTER TABLE ... ADD COLUMN`, `CREATE TABLE` | SRS S3.6 |
| Backfill | `v2-to-v3.ts` set V3 defaults ke V2 data | SRS S3.11 |
| Dry-run | Wajib dry-run sebelum production | SRS TC-32 |
| Rollback | DROP new columns + DROP table (last resort) | DATABASE_SCHEMA S9.5 |
| Idempotent | Migration bisa dijalankan berulang tanpa error | SRS TC-31 |
| Success rate | >= 95% | SRS TC-33 |
| Execution time | <= 5s per project | SRS TC-38 |

---

## 14. LLM Prompt Rules

### 14.1 Prompt Builder Structure

| Aturan | Detail | Sitasi |
|---|---|---|
| Single builder | `prompt-builder.ts` = satu prompt untuk semua output. Tidak perlu split. | RAG-CONTEXT S4.1 |
| 5 metadata instructions | Transition, 8-layer image, voice type, audio cue, duration estimation | SRS S3.7 |
| JSON schema compliance | LLM output wajib pass `SceneSchema.safeParse()` | SRS TC-10 |
| Consistency rules | Identity fields stable across scenes | — |
| Multi-provider | Tidak lock 1 provider. `@ai-sdk/openai-compatible`. | SRS TC-13 |
| Token monitor | Usage naik <= 50% dari baseline | SRS TC-12 |

### 14.2 Prompt Instruction Pattern

```typescript
// DO — Structured instructions di buildSystemPrompt()
const V3_INSTRUCTIONS = `
## Transition Rules
- Action scenes: use "cut" (0ms)
- Time passage: use "dissolve" (500-2000ms)
- Chapter end: use "fade_to_black" (1000-3000ms)
- Dream/flashback: use "fade_to_white" (1000-3000ms)
- Location change: use "wipe" (500-1000ms)
- Visual continuity: use "match_cut" (0ms)

## 8-Layer Image Prompt Formula
[Subject]+[Composition]+[Camera]+[Lighting]+[Color]+[Mood]+[Style]+[Technical]

## Voice Type Rules
- Child characters: voiceType="child"
- Teen characters: voiceType="teen"
- Adult male: voiceType="adult_male"
- Adult female: voiceType="adult_female"
- Elderly: voiceType="elderly_male" or "elderly_female"
- Non-character narration: voiceType="narrator"

## Audio Cue Rules
- Dramatic scenes: background_music (orchestral)
- Action scenes: sfx + music_cue (tension)
- Outdoor scenes: ambient (nature)
- Peak moments: music_cue (emotional)
- Transitions: transition_audio (whoosh/chime)

## Duration Estimation
- Estimate durationSeconds from voiceover_script.length / 15 (chars per second)
`;
```

### 14.3 JSON Output Schema Compliance

```typescript
// DO — LLM output must match this structure
interface PromptPackageV3 {
  character_profiles: Array<{ nama: string; peran: string }>;
  scenes: Array<{
    order: number;
    description: string;
    voiceover_script: string;
    image_prompts: Array<{
      target: string;
      prompt_text: string;
      reference_filename: string | null;
      moodAtmosphere?: string | null;
      styleReferences?: string | null;
    }>;
    // V3 fields
    transitionType: TransitionType;
    transitionDurationMs: number;
    transitionEasing: TransitionEasing;
    transitionDirection: TransitionDirection;
    voiceType: VoiceType;
    voiceEmotion: VoiceEmotion;
    voiceSpeed: number;
    voicePitch: VoicePitch;
    durationSeconds?: number;
    audio?: Array<{
      audioType: AudioType;
      description: string;
      timing: AudioTiming;
      volume: number;
      fadeInMs: number;
      fadeOutMs: number;
    }>;
  }>;
  moral_message: string;
}
```

---

## 15. V3 Feature-Specific Rules

### 15.1 Light Theme (F-V3-01)

| Aturan | Detail | Sitasi |
|---|---|---|
| Install | `pnpm add next-themes` — satu-satunya dep baru V3 | SRS S1.2 |
| Provider | `<NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>` | SRS S3.1 |
| Remove hardcoded | Hapus `className="dark"` dari `layout.tsx:66` | SRS S3.1 |
| Remove wrap | Hapus `<div className="dark">` dari `page.tsx:24` | SRS S3.1 |
| Provider card | Replace `dark:bg-green-950` dengan semantic token | SRS S3.1 |
| ThemeToggle | Dropdown 3-state (light/dark/system) di app-header | UIUX_SPEC S3.1 |
| suppressHydrationWarning | `<html suppressHydrationWarning>` wajib | SRS S3.1 |
| Bundle | Target <= +20KB gzipped. Actual ~2KB. | SRS S8.2 |

### 15.2 Scene Transition (F-V3-02)

| Aturan | Detail | Sitasi |
|---|---|---|
| Schema | +4 fields di `scenes` table (additive) | DATABASE_SCHEMA S4.8 |
| Zod | `SceneSchema` extended dengan 4 transition fields + defaults | SRS S3.8 |
| Prompt | Instruksi transition rules di `buildSystemPrompt()` | SRS S3.7 |
| Save handler | Persist 4 fields di `route.ts:156-164` | SRS S3.2 |
| UI | `SceneTransitionCard` dengan icon Lucide + duration badge + flow arrow | UIUX_SPEC S3.2 |
| Flow arrow | Dashed bila `cut` (0ms). Solid bila duration > 0. | UIUX_SPEC S7.2 |
| Icon mapping | cut=Zap, dissolve=Blend, fade_to_black=Moon, fade_to_white=Sun, wipe=ArrowRight, match_cut=Link | UIUX_SPEC S8.1 |
| Badge colors | Dari `UIUX_SPEC S2.4`. Verified kontras di kedua theme. | UIUX_SPEC S2.4 |
| LLM target | >= 90% valid enum per field | SRS S8.4 |

### 15.3 Complex Image Prompts (F-V3-03)

| Aturan | Detail | Sitasi |
|---|---|---|
| Schema | +2 nullable fields di `image_prompts` (moodAtmosphere, styleReferences) | DATABASE_SCHEMA S4.9 |
| promptText | Tetap single string (backward compat V1+V2) | SRS TC-09 |
| 8-layer formula | `[Subject]+[Composition]+[Camera]+[Lighting]+[Color]+[Mood]+[Style]+[Technical]` | SRS S3.3 |
| UI | `ImagePromptDisplay` — collapsible 8 layer labels + copy per-section | UIUX_SPEC S3.5 |
| Parse | Detect layer boundaries dari prompt text. Bila tidak bisa → full text + Copy Full. | UIUX_SPEC S3.5 |
| Copy | Per-section copy + Copy Full Prompt | UIUX_SPEC S3.5 |
| i18n | `imagePrompt.layers.*` (8 ID+EN) | SRS S3.10 |

### 15.4 Voiceover Voice Type (F-V3-04)

| Aturan | Detail | Sitasi |
|---|---|---|
| Schema | +4 fields di `scenes` table (additive) | DATABASE_SCHEMA S4.8 |
| Zod | `SceneSchema` extended dengan 4 voice fields + defaults | SRS S3.8 |
| Prompt | Instruksi voice type by character role | SRS S3.7 |
| Save handler | Persist 4 fields di `route.ts:156-164` | SRS S3.4 |
| UI | `VoiceTypeSelector` — dropdown + emotion + speed slider + pitch | UIUX_SPEC S3.3 |
| Speed range | 0.5-2.0, default 1.0 | DATABASE_SCHEMA S7.4 |
| Badge colors | Dari `UIUX_SPEC S2.5`. | UIUX_SPEC S2.5 |
| Gender bias | Tidak boleh bias gender/stereotype | SRS TC-29 |
| i18n | `voice.types.*` (7), `voice.emotions.*` (6), `voice.pitch.*` (4) | SRS S3.10 |

### 15.5 Supporting Audio (F-V3-05)

| Aturan | Detail | Sitasi |
|---|---|---|
| Schema | New table `scene_audio` (19 fields + 3 indexes) | DATABASE_SCHEMA S4.10 |
| FK | `project_id` + `scene_id` CASCADE | DATABASE_SCHEMA S5.2 |
| Index | `idx_scene_audio_scene_id` (CRITICAL) + `idx_scene_audio_project_id` | DATABASE_SCHEMA S6.2 |
| Zod | New `SceneAudioSchema` | SRS S3.8 |
| Repository | `scene-audio.repository.ts` — CRUD | ARCHITECTURE S6 |
| API | 4 new endpoints: GET/POST/PATCH/DELETE | API_CONTRACT S6.13 |
| Auth | `getServerSession()` + ownership check via project | API_CONTRACT S2 |
| UI | `AudioPanel` — list + add/edit/delete dialog | UIUX_SPEC S3.4 |
| Volume | 0.0-1.0, default 0.7 | DATABASE_SCHEMA S7.4 |
| Fade | `fadeInMs` + `fadeOutMs` >= 0 | DATABASE_SCHEMA S7.4 |
| Prompt | Minimal 1 audio cue per scene (>= 80% coverage) | SRS S8.4 |
| Export | JSON: audio array. Markdown: Audio Specifications table. | SRS S3.9 |
| i18n | `audio.types.*` (5), `audio.timing.*` (4), `audio.fields.*` | SRS S3.10 |

### 15.6 Export Extension (F-V3-09)

| Aturan | Detail | Sitasi |
|---|---|---|
| JSON | V3 fields included per scene. Backward compatible V2. | SRS S3.9 |
| Markdown | +4 new sections: Transitions, Voice, Audio, Image Layers | SRS S3.9 |
| Template | `markdown.template.ts` extended | SRS S3.9 |
| Audio serialize | `audio` array dalam JSON export | API_CONTRACT S6.7 |

### 15.7 Analytics Events (F-V3-12)

| Event | Payload | Fitur | Sitasi |
|---|---|---|---|
| `theme_change` | `{theme, from}` | Light Theme | SRS S3.12 |
| `scene_transition_generated` | `{transitionType, projectId, sceneCount}` | Scene Transition | SRS S3.12 |
| `voice_type_assigned` | `{voiceType, sceneCount}` | Voiceover | SRS S3.12 |
| `audio_spec_generated` | `{audioType, count, sceneId}` | Audio | SRS S3.12 |
| `image_prompt_layers_count` | `{layersCount, sceneId}` | Image Prompts | SRS S3.12 |

**No PII** dalam analytics events. (`BRD NFR-S04`)

### 15.8 i18n V3 Keys (~60 keys)

| Namespace | Keys | Jumlah |
|---|---|---|
| `common.*` | theme, themeToggle, lightMode, darkMode, systemMode | 5 |
| `transition.types.*` | cut, dissolve, fade_to_black, fade_to_white, wipe, match_cut | 6 |
| `transition.*` | durationLabel, easingLabel, directionLabel, flowLabel | 4 |
| `voice.types.*` | child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator | 7 |
| `voice.emotions.*` | neutral, happy, sad, excited, calm, dramatic | 6 |
| `voice.pitch.*` | low, medium, high, auto | 4 |
| `voice.*` | speedLabel, selectLabel | 2 |
| `audio.types.*` | background_music, sfx, ambient, music_cue, transition_audio | 5 |
| `audio.timing.*` | start, throughout, end, specific_moment | 4 |
| `audio.fields.*` | volume, fadeIn, fadeOut, description, addAudio, editAudio, deleteAudio | 7 |
| `imagePrompt.layers.*` | subject, composition, camera, lighting, color, mood, style, technical | 8 |
| `imagePrompt.*` | copyLayer, copyFull | 2 |
| **Total** | | **~60** |

**Sumber:** `SRS S3.10`, `UIUX_SPEC S11.3`.

---

> **Dokumen ini = aturan koding wajib untuk PromptFlow V3. Eksekutor baca ini + SRS.md + ARCHITECTURE.md + DATABASE_SCHEMA.md + UIUX_SPEC.md + API_CONTRACT.md sebelum coding. Semua check wajib dilakukan sebelum PR dianggap selesai.**

**Dibuat oleh:** docgen-coding-rules subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Update)
