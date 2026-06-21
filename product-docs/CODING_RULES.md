# CODING_RULES.md — PromptFlow V3

**Version:** 3.0
**Date:** 2026-06-22
**Status:** Draft
**Source:** SRS.md, PROJECT_ARCHITECTURE.md, DATABASE_SCHEMA.md, RAG-CONTEXT.md, live codebase scan

---

## 1. Summary & Applicable Stack

PromptFlow V3 is a **Next.js 15 App Router** modular monolith for AI animation brief generation. These rules apply to all code written for the V3 update (audio spec persistence, color palette/technical gap closure, voiceover speaker, scene transition flow engine, 8-layer image prompts, landing page V3 features, E2E test expansion).

### Applicable Languages & Frameworks

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | >=20.0.0 |
| Framework | Next.js (App Router) | ^15.1.0 |
| Language | TypeScript (strict) | ^5.7.0 |
| UI Library | React | ^19.0.0 |
| Styling | Tailwind CSS v4 + @theme tokens | ^4.0.0 |
| Components | shadcn/ui (default style) | latest |
| ORM | Drizzle ORM (SQLite/Turso) | ^0.38.0 |
| Validation | Zod | ^3.24.0 |
| i18n | next-intl | ^3.26.0 |
| Auth | NextAuth v5 | 5.0.0-beta.25 |
| Testing | Vitest + Playwright | ^2.1.0 / ^1.49.0 |
| Package Manager | pnpm | 11.7.0 |

---

## 2. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files (components) | kebab-case `.tsx` | `image-prompt-display.tsx`, `scene-transition-card.tsx` |
| Files (lib/modules) | kebab-case `.ts` | `prompt-builder.ts`, `response-parser.ts`, `llm-client.ts` |
| Files (tests) | `<name>.test.ts` or `<name>.spec.ts` | `consistency-checker.test.ts`, `login.spec.ts` |
| Folders | kebab-case | `lib/ai/`, `lib/db/repositories/`, `components/generate/` |
| React Components | PascalCase | `GenerateForm`, `SceneTransitionCard`, `AudioPanel` |
| Functions/Methods | camelCase | `buildSystemPrompt`, `bulkCreateScenes`, `parseResponse` |
| Variables | camelCase | `voiceoverSpeaker`, `colorPalette`, `transitionDurationMs` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_DURATION_SECONDS`, `DEFAULT_VOICE_SPEED` |
| Zod Schemas | PascalCase + `Schema` suffix | `SceneSchema`, `ImagePromptItemSchema`, `PromptPackageSchema` |
| DB Tables (Drizzle) | camelCase export, snake_case SQL | `export const sceneAudio = sqliteTable('scene_audio', ...)` |
| DB Columns (Drizzle) | camelCase property, snake_case SQL | `voiceoverSpeaker: text('voiceover_speaker')` |
| DB Indexes | `idx_<table>_<columns>` | `idx_provider_configs_user_name` |
| API Routes | kebab-case path segments | `/api/v1/generate`, `/api/v1/projects/[id]/scenes` |
| i18n Keys | dot-separated kebab-case | `generate.form.title`, `landing.features.audio.title` |
| TypeScript Interfaces | PascalCase | `GenerateInput`, `ProviderConfig` |
| Enum-like values | snake_case string literals | `'fade_to_black'`, `'adult_female'`, `'background_music'` |

### Drizzle Schema to DB Column Mapping Rule

```typescript
// DO: camelCase property -> snake_case SQL column
voiceoverSpeaker: text('voiceover_speaker').default('narrator'),
colorPalette: text('color_palette'),
createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),

// DON'T: use camelCase in SQL or snake_case in TypeScript property
voiceover_speaker: text('voiceover_speaker'),  // BAD: TS property is snake_case
voiceoverSpeaker: text('voiceoverSpeaker'),     // BAD: SQL column is camelCase
```

---

## 3. Code Structure & Style Standards

### 3.1 TypeScript General Rules

```typescript
// DO: Explicit return types on exported functions
export async function buildSystemPrompt(template: TemplatePreset): Promise<string> {
  // ...
}

// DON'T: Implicit return type on exported functions
export async function buildSystemPrompt(template: TemplatePreset) {
  // ...
}
```

```typescript
// DO: Use const assertions for literal types
const TRANSITION_TYPES = ['cut', 'dissolve', 'fade_to_black', 'fade_to_white', 'wipe', 'match_cut'] as const;
type TransitionType = (typeof TRANSITION_TYPES)[number];

// DON'T: Use mutable arrays with string type for fixed sets
const TRANSITION_TYPES: string[] = ['cut', 'dissolve', ...];
```

```typescript
// DO: Prefer interface for object shapes, type for unions/intersections
interface SceneInput {
  description: string;
  orderNo: number;
}

type TransitionType = 'cut' | 'dissolve' | 'fade_to_black';

// DON'T: Use type for simple object shapes
type SceneInput = { description: string; orderNo: number };
```

```typescript
// DO: Destructure imports
import { buildSystemPrompt, buildUserMessage } from '@/lib/ai/prompt-builder';

// DON'T: Namespace imports
import * as promptBuilder from '@/lib/ai/prompt-builder';
```

```typescript
// DO: Use @/* path alias (tsconfig paths: @/* -> ./src/*)
import { db } from '@/lib/db/client';
import { SceneSchema } from '@/lib/validation/schemas';

// DON'T: Relative paths for cross-directory imports
import { db } from '../../../lib/db/client';
```

### 3.2 Next.js App Router Conventions

```typescript
// DO: Server Components by default, 'use client' only when needed
// app/[locale]/projects/[id]/page.tsx
export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(Number(id));
  return <ProjectDetailView project={project} />;
}

// DON'T: Mark page as 'use client' unless it needs hooks/event handlers
'use client';
export default function ProjectDetailPage({ params }: Props) { ... }
```

```typescript
// DO: API route handlers -- validate input with Zod, use errorResponse helper
// app/api/v1/projects/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ProjectCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.message, 400);
  }
  const project = await createProject(parsed.data);
  return successResponse(project, 201);
}

// DON'T: Skip validation, return raw objects
export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await createProject(body);  // BAD: no Zod validation
  return NextResponse.json(project);
}
```

```typescript
// DO: SSE streaming with proper event format
// In generate/route.ts
const stream = new ReadableStream({
  start(controller) {
    const emit = (event: SSEEvent) => {
      controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
    };
    // emit({ type: 'progress', data: { percent: 50 } })
  },
});

// DON'T: Write raw strings to stream
controller.enqueue(`progress: 50`);  // BAD: no type, no JSON
```

### 3.3 Drizzle ORM Patterns

```typescript
// DO: Repository pattern -- one file per entity in lib/db/repositories/
// lib/db/repositories/scene-audio.repository.ts
export async function createSceneAudio(data: NewSceneAudio): Promise<SceneAudio> {
  const [result] = await db.insert(sceneAudio).values(data).returning();
  return result;
}

// DON'T: Direct DB queries in API routes or components
export async function POST(request: NextRequest) {
  const data = await request.json();
  await db.insert(sceneAudio).values(data);  // BAD: no repository
}
```

```typescript
// DO: Use .returning() for INSERT when you need the created record ID
const scenes = await db.insert(scenesTable).values(scenesData).returning();
const sceneIds = scenes.map(s => s.id);

// DON'T: Assume autoincrement ID without .returning()
await db.insert(scenesTable).values(scenesData);
// IDs are lost -- cannot map to child records
```

```typescript
// DO: Use snake_case for all DB-level SQL strings
// Column names, table names, index names, migration SQL
sqliteTable('image_prompts', { ... })
index('idx_projects_user_created').on(t.userId, t.createdAt)

// DON'T: Use camelCase in SQL strings
sqliteTable('imagePrompts', { ... })  // BAD: table name
```

### 3.4 Zod Validation Patterns

```typescript
// DO: Validate all LLM output with Zod before DB insertion
const parsed = PromptPackageSchema.safeParse(extractedJson);
if (!parsed.success) {
  emitLog({ type: 'warning', message: `Validation failed: ${parsed.error.message}` });
  throw new ValidationError(parsed.error);
}

// DON'T: Trust LLM output without validation
const data = JSON.parse(llmResponse);
await bulkCreateScenes(data.scenes);  // BAD: no Zod validation
```

```typescript
// DO: Handle union types from Zod schemas in INSERT mapping
// color_palette can be string | string[] per ImagePromptItemSchema
colorPalette: Array.isArray(p.color_palette)
  ? p.color_palette.join(', ')
  : (p.color_palette ?? null),

// DON'T: Assume single type from union schema
colorPalette: p.color_palette,  // BAD: might be array, DB expects string
```

### 3.5 Component File Structure

```
components/
  common/          Shared: AppHeader, ThemeToggle, LanguageToggle, ErrorBoundary
  generate/        Generate workflow: GenerateForm, ResultTabs, AudioPanel
  settings/        Provider config: ProviderConfigForm, ProviderCard
  dashboard/       Analytics: MetricCard, charts, tables
  projects/        Project list/detail: ProjectCard, DeleteProjectButton
  landing/         Landing page sections: Hero, Features, FAQ, CTA
  ui/              shadcn/ui primitives ONLY (do not modify)
```

```typescript
// DO: Component file structure order
// 1. Imports (grouped: react, third-party, internal, types)
// 2. Type definitions (props, local types)
// 3. Component function
// 4. Sub-components if any
// 5. Default export

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Scene } from '@/lib/validation/schemas';

interface SceneCardProps {
  scene: Scene;
  index: number;
}

export function SceneCard({ scene, index }: SceneCardProps) {
  // ...
}

export default SceneCard;
```

---

## 4. Formatting & Linting Rules

### 4.1 ESLint

**Config file:** `.eslintrc.json`

| Rule | Setting | Rationale |
|------|---------|-----------|
| `next/core-web-vitals` | extends | Next.js best practices + Core Web Vitals |
| `next/typescript` | extends | TypeScript-specific Next.js rules |
| `jsx-a11y/recommended` | extends | Accessibility checks (WCAG alignment) |
| `@typescript-eslint/no-explicit-any` | **error** | No `any` type -- use `unknown` or specific type |
| `@typescript-eslint/no-unused-vars` | warn | Unused vars allowed with `_` prefix pattern |
| `react/no-unescaped-entities` | off | Allows curly quotes / special chars in JSX |

**Commands:**

```bash
# Check only
pnpm lint

# Auto-fix
pnpm lint -- --fix
```

### 4.2 TypeScript Compiler

**Config file:** `tsconfig.json`

| Flag | Value | Effect |
|------|-------|--------|
| `strict` | true | Full strict mode |
| `noImplicitAny` | true | No implicit `any` |
| `noImplicitReturns` | true | All paths must return |
| `noFallthroughCasesInSwitch` | true | No fallthrough in switch |
| `noUncheckedIndexedAccess` | true | Index access returns `T | undefined` |
| `noImplicitOverride` | true | Must use `override` keyword |
| `forceConsistentCasingInFileNames` | true | Case-sensitive imports |
| `isolatedModules` | true | Safe for transpilers |

### 4.3 Formatting

| Tool | Config | Scope |
|------|--------|-------|
| Prettier | (ASSUMPTION: add `.prettierrc`) | Formatting: 2-space indent, double quotes, trailing commas, 100 char print width |
| ESLint | `.eslintrc.json` | Code quality rules |
| Pint / Biome | Not used | -- |

```bash
# Recommended: add Prettier config if not present
pnpm add -D prettier
```

```json
// .prettierrc (recommended addition)
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## 5. Design Principles

| Principle | Application |
|-----------|-------------|
| **DRY** | Shared Zod schemas serve both API validation AND LLM output parsing. Reuse `lib/validation/schemas.ts` everywhere. |
| **KISS** | V3 is incremental gap closure, not rewrite. Add columns, patch routes, refine prompts. No architectural changes. |
| **SOLID (SRP)** | One repository per entity. One component per file. One route handler per HTTP method. |
| **SOLID (DIP)** | API routes depend on repository abstractions, not raw SQL. Business logic depends on Zod schemas, not ad-hoc validation. |
| **Separation of Concerns** | Presentation (`components/`) never imports from `lib/db/`. Routes go through `lib/` business logic. |
| **Immutability** | Prefer `const` over `let`. Never mutate props. Use spread/copy for state updates. |
| **Small Files** | Max ~200 lines per file. Split if longer. Extract sub-components, helpers, types. |
| **Function Length** | Max ~50 lines per function. Extract helper functions if longer. |
| **No God Components** | GenerateForm orchestrates but delegates: SceneTransitionCard, VoiceTypeSelector, AudioPanel, ImagePromptDisplay. |

---

## 6. Error Handling & Logging

### 6.1 API Route Error Pattern

```typescript
// DO: Structured error handling with helpers
import { errorResponse, successResponse } from '@/lib/api/error';

export async function GET(request: NextRequest) {
  try {
    const data = await getProjectData(id);
    return successResponse(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse('Project not found', 404);
    }
    console.error('[projects/get]', error);
    return errorResponse('Internal server error', 500);
  }
}

// DON'T: Leak internals to client
return NextResponse.json(
  { error: error.message, stack: error.stack },  // BAD: stack leak
  { status: 500 }
);
```

### 6.2 SSE Error Pattern

```typescript
// DO: Graceful SSE error with error event
try {
  // ... generation logic
} catch (error) {
  emitLog({ type: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
  emitEvent({ type: 'error', data: { message: 'Generation failed' } });
  // Update project status to 'failed' in DB
} finally {
  controller.close();
}

// DON'T: Throw inside SSE stream -- kills connection silently
throw new Error('LLM failed');  // BAD: client gets no feedback
```

### 6.3 LLM Timeout/Retry Pattern

```typescript
// DO: Configurable timeout and retry in llm-client.ts
const LLM_CONFIG = {
  timeout: 240_000,   // 240s (aligns with Vercel maxDuration=300)
  retries: 2,
  retryDelay: 1_000,  // 1s base delay
};

// DON'T: Hardcode timeout values scattered across files
const response = await fetch(url, { signal: AbortSignal.timeout(60000) });  // BAD: 60s too short
```

### 6.4 Logging Convention

```typescript
// DO: Structured log messages with module prefix
console.error('[generate/route]', 'LLM timeout after 240s');
console.warn('[prompt-builder]', 'Scene mood change detected, switching to dissolve');
console.log('[consistency-check]', 'Character consistency: 3 warnings found');

// DON'T: Bare console.log without context
console.log('error happened');  // BAD: no module, no detail
```

### 6.5 Data Leakage Prevention

```typescript
// DO: Never log or return sensitive data
console.log('[auth]', 'User authenticated', { userId: user.id });

// DON'T: Log sensitive fields
console.log('[auth]', 'User data', { user });  // BAD: may contain password_hash
console.log('[settings]', 'Provider config', { apiKey: config.apiKeyEncrypted });  // BAD
```

---

## 7. Coding Security Rules

### 7.1 Input Validation

```typescript
// DO: Validate ALL external input with Zod at API boundary
const body = await request.json();
const parsed = GenerateSchema.safeParse(body);
if (!parsed.success) {
  return errorResponse(parsed.error.issues[0].message, 400);
}

// DON'T: Use `any` or skip validation
const body: any = await request.json();  // BAD: no type safety
```

### 7.2 Parameterized Queries / ORM Safety

```typescript
// DO: Drizzle ORM parameterizes all queries by default
const user = await db.select().from(users).where(eq(users.id, userId));

// DON'T: Raw SQL with string interpolation
await db.execute(`SELECT * FROM users WHERE id = ${userId}`);  // BAD: SQL injection
```

### 7.3 No Hardcoded Secrets

```typescript
// DO: Use env variables and never commit secrets
const tursoUrl = process.env.TURSO_DATABASE_URL;
const encryptionKey = process.env.AES_ENCRYPTION_KEY;

// DON'T: Hardcode or log secrets
const tursoUrl = 'libsql://mydb.turso.io';  // BAD: hardcoded
const tursoUrl = `url: ${process.env.TURSO_URL}`;  // BAD: may leak in error messages
```

### 7.4 API Key Encryption

```typescript
// DO: Encrypt API keys at rest using AES-256-GCM (lib/crypto/aes.ts)
const encrypted = await encryptApiKey(apiKey);
// Store encrypted in provider_configs.api_key_encrypted

// DON'T: Store plaintext API keys
await db.insert(providerConfigs).values({
  apiKeyEncrypted: apiKey,  // BAD: plaintext
});
```

### 7.5 Authentication

```typescript
// DO: Auth guard via middleware.ts (Edge runtime)
// All /api/v1/* routes require valid JWT session
// Use getToken() from NextAuth to extract session

// DON'T: Create API routes that skip auth middleware
// app/api/v1/public-data/route.ts without auth check
```

### 7.6 Output Sanitization

```typescript
// DO: Sanitize user input before rendering in JSX
// React auto-escapes, but be explicit with dangerouslySetInnerHTML
// Never use dangerouslySetInnerHTML with user content

// DON'T: Use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // BAD: XSS
```

### 7.7 Rate Limiting

```typescript
// DO: Rate limiting via middleware (in-memory Map, 10 req/min for generate)
// Rate limit is enforced at middleware.ts level for all /api/v1/ routes

// DON'T: Bypass rate limiting for any endpoint
// All API routes go through middleware guard
```

### 7.8 Migration Safety

```sql
-- DO: Additive-only migrations (non-breaking)
ALTER TABLE scenes ADD voiceover_speaker TEXT DEFAULT 'narrator';
ALTER TABLE image_prompts ADD color_palette TEXT;

-- DON'T: Destructive migrations without rollback plan
DROP TABLE scenes;  // BAD: data loss
ALTER TABLE scenes DROP COLUMN transition_type;  // BAD: breaks existing data
```

---

## 8. Testing Standards

### 8.1 Test Types & Coverage

| Type | Tool | Coverage Target | Location |
|------|------|----------------|----------|
| Unit | Vitest | 80% (lines + branches) | `src/**/*.test.ts` |
| E2E | Playwright | Critical user flows | `e2e/*.spec.ts` |

### 8.2 Test File Naming & Location

```
# Unit tests: co-located with source
src/lib/ai/consistency-checker.ts       -> src/lib/ai/consistency-checker.test.ts
src/lib/ai/log-buffer.ts                -> src/lib/ai/log-buffer.test.ts

# E2E tests: in e2e/ root
e2e/login.spec.ts
e2e/generate.spec.ts
e2e/projects.spec.ts
```

### 8.3 Test Structure (AAA Pattern)

```typescript
// DO: Arrange-Act-Assert pattern
describe('buildSystemPrompt', () => {
  it('should include transition instructions for cinematic template', () => {
    // Arrange
    const template = CINEMATIC_PRESET;

    // Act
    const prompt = buildSystemPrompt(template);

    // Assert
    expect(prompt).toContain('transition_type');
    expect(prompt).toContain('dissolve');
  });

  it('should throw ValidationError for invalid LLM output', () => {
    // Arrange
    const invalidOutput = { scenes: 'not an array' };

    // Act & Assert
    expect(() => parseResponse(invalidOutput)).toThrow(ValidationError);
  });
});

// DON'T: Skip test structure
it('works', () => {
  expect(buildSystemPrompt(CINEMATIC_PRESET)).toBeTruthy();  // BAD: no structure, weak assertion
});
```

### 8.4 Vitest Configuration

**Config:** `vitest.config.ts` (already configured)

- Coverage: v8 provider, 80% threshold (lines + branches)
- Environment: node (default)
- Setup: `tests/stubs/server-only.ts` (stubs `server-only` import for Vitest)

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- src/lib/ai/consistency-checker.test.ts

# Run in watch mode
pnpm test -- --watch
```

### 8.5 Playwright Configuration

**Config:** `playwright.config.ts` (already configured)

- Browser: Chromium only
- Timeout: 120s per test
- Base URL: http://localhost:3000

### 8.6 Test Matrix (V3 Expansion)

| # | Test File | Coverage Area |
|---|-----------|---------------|
| 1 | e2e/login.spec.ts | Auth flow (existing) |
| 2 | e2e/register.spec.ts | User registration |
| 3 | e2e/generate.spec.ts | Generate flow (SSE streaming) |
| 4 | e2e/projects.spec.ts | Project CRUD |
| 5 | e2e/scenes.spec.ts | Scene display + transitions |
| 6 | e2e/audio.spec.ts | Audio panel + specs |
| 7 | e2e/settings.spec.ts | Provider config + test |
| 8 | e2e/theme.spec.ts | Light/Dark/System toggle |
| 9 | e2e/image-prompts.spec.ts | 8-layer image prompt display |
| 10 | e2e/export.spec.ts | Markdown export |

---

## 9. Git Workflow & Commits

### 9.1 Branch Naming

| Pattern | Purpose | Example |
|---------|---------|---------|
| `feat/<slug>` | New feature | `feat/audio-spec-persistence` |
| `fix/<slug>` | Bug fix | `fix/color-palette-null-handling` |
| `refactor/<slug>` | Refactor | `refactor/generate-route-extract` |
| `test/<slug>` | Test addition | `test/e2e-generate-flow` |
| `chore/<slug>` | Maintenance | `chore/update-drizzle-migration` |

### 9.2 Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Use Case | Example |
|------|----------|---------|
| feat | New feature | `feat(generate): add audio spec persistence to scene_audio` |
| fix | Bug fix | `fix(generate): handle null color_palette in bulk insert` |
| refactor | Code restructure | `refactor(api): extract error helpers to lib/api/error.ts` |
| test | Add/fix tests | `test(e2e): add generate flow spec with SSE validation` |
| chore | Tooling/deps | `chore: add Playwright E2E test for theme toggle` |
| docs | Documentation | `docs(product): update SRS with V3 gap closure details` |

**Scope conventions:**
- `generate` -- /api/v1/generate, prompt-builder, llm-client, response-parser
- `api` -- all /api/v1/* routes
- `db` -- schema, repositories, migrations
- `components` -- React components
- `auth` -- NextAuth, middleware
- `i18n` -- next-intl, messages/

### 9.3 Atomic Commits

```
# DO: One logical change per commit
git add src/lib/db/schema.ts drizzle/0002_v3_gap_closure.sql
git commit -m "feat(db): add color_palette and technical columns to image_prompts"

git add src/app/api/v1/generate/route.ts
git commit -m "feat(generate): persist color_palette and technical to DB in bulk insert"

# DON'T: Mix unrelated changes
git add -A
git commit -m "V3 updates"  // BAD: schema + route + component + test in one commit
```

### 9.4 PR Requirements

- Branch off `main` (or `develop` if used)
- All tests pass (`pnpm test` + `pnpm test:coverage`)
- ESLint passes (`pnpm lint`)
- No `any` types added
- i18n keys added for both `id.json` and `en.json` if UI text changed
- DB migration has rollback SQL documented
- PR description references issue/ticket if applicable

---

## 10. Review Checklist (Definition of Done)

Before code is considered complete, verify ALL:

### Code Quality
- [ ] TypeScript strict mode -- no `any` types (ESLint rule: `@typescript-eslint/no-explicit-any: error`)
- [ ] ESLint passes with zero errors
- [ ] All exported functions have explicit return types
- [ ] No unused imports (prefix with `_` if intentionally unused)
- [ ] No `console.log` in production code (use structured logging with module prefix)
- [ ] Max function length ~50 lines
- [ ] Max file length ~200 lines

### Architecture
- [ ] API routes use `errorResponse`/`successResponse` helpers from `lib/api/error.ts`
- [ ] DB queries go through repository pattern (`lib/db/repositories/`)
- [ ] Zod validation at API boundary and LLM output parsing
- [ ] No direct DB access from `components/`
- [ ] `@/*` path alias used for all cross-directory imports

### Data
- [ ] New DB columns: Drizzle schema + migration SQL + rollback documented
- [ ] INSERT operations use `.returning()` when IDs are needed for child records
- [ ] LLM output validated with Zod before DB write
- [ ] Union types (e.g., `string | string[]`) handled correctly in INSERT mapping

### Security
- [ ] No hardcoded secrets -- all via `process.env`
- [ ] API keys encrypted with AES-256-GCM before storage
- [ ] No sensitive data in log messages (password_hash, API keys)
- [ ] No `dangerouslySetInnerHTML` with user content
- [ ] Auth middleware applied to all `/api/v1/*` routes

### Frontend
- [ ] User-facing text uses `useTranslations()` from next-intl
- [ ] Both `messages/id.json` and `messages/en.json` updated for new i18n keys
- [ ] Theme uses CSS variables / Tailwind v4 `@theme` tokens (no hardcoded colors)
- [ ] shadcn/ui components from `components/ui/` used for consistent styling
- [ ] WCAG accessibility (jsx-a11y recommended rules pass)
- [ ] Responsive design using Tailwind breakpoints

### Testing
- [ ] Unit test added/updated for changed business logic
- [ ] Coverage threshold met (80% lines + branches)
- [ ] E2E test added for new critical user flows
- [ ] Test uses AAA pattern (Arrange-Act-Assert)

### Git
- [ ] Atomic commit with conventional commit message
- [ ] Scope matches changed module
- [ ] No secrets, generated files, or `node_modules` committed

---

## 11. Common Prohibitions

| Prohibition | Why | Alternative |
|-------------|-----|-------------|
| `any` type | Bypasses TypeScript safety | Use `unknown`, generics, or specific type |
| Magic numbers | Untestable, unclear | Named constants: `const MAX_TIMEOUT = 240_000` |
| Deep nesting (>3 levels) | Hard to read | Extract helper functions or early returns |
| `console.log` in production | Leaks info, noisy | Use structured logging: `console.error('[module]', msg)` |
| `let` when `const` works | Mutation risk | Always prefer `const`, use `let` only for reassignment |
| `npm` / `yarn` | Wrong package manager | Use `pnpm` exclusively |
| `any` in Zod schema | Bypasses runtime validation | Use specific Zod types: `z.string()`, `z.number()` |
| Direct DB in components | Breaks layer separation | Use API routes or server-side repository calls |
| `dangerouslySetInnerHTML` | XSS risk | Use React auto-escaping or sanitize with DOMPurify |
| Unpinned dependencies | Reproducibility risk | Use lockfile (`pnpm-lock.yaml`), `pnpm install --frozen-lockfile` |
| Modifying `components/ui/` | Breaks shadcn/ui update path | Extend via props, composition, or wrapper components |
| Hardcoded colors/spacing | Inconsistent theme | Use Tailwind v4 `@theme` tokens and CSS variables |
| `require()` imports | Not ESM-compatible | Use ES module `import` syntax |
| `export default` for utils | Inconsistent tree-shaking | Use named exports for lib/utility functions |
| `fetch` without timeout | Hung requests | Use `AbortSignal.timeout()` or llm-client timeout config |
| Mutating function params | Side effects, bugs | Create copies: `const updated = [...params]` |

---

## 12. Frontend Standards

### 12.1 Design Token Usage

```typescript
// DO: Use Tailwind v4 @theme tokens and CSS variables defined in globals.css
<div className="bg-background text-foreground">
  <h1 className="text-primary">{title}</h1>
  <span className="text-muted-foreground">{subtitle}</span>
</div>

// DON'T: Hardcode colors
<div className="bg-gray-900 text-white">  // BAD: bypasses theme system
  <h1 className="text-blue-500">{title}</h1>
</div>
```

### 12.2 Theme System

```typescript
// DO: Theme toggle uses next-themes with class strategy
// ThemeToggle component in components/common/theme-toggle.tsx
// Supports: dark, light, system
// Persisted in DB: projects.themePreference

// DON'T: Use inline styles for theme-dependent appearance
<div style={{ backgroundColor: isDark ? '#000' : '#fff' }}>  // BAD: hardcoded
```

### 12.3 shadcn/ui Component Usage

```typescript
// DO: Use shadcn/ui primitives from components/ui/ for consistent styling
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Button variant="default" size="lg">Generate</Button>
<Card>
  <CardHeader><CardTitle>Scene {index + 1}</CardTitle></CardHeader>
  <CardContent>{scene.description}</CardContent>
</Card>

// DON'T: Build custom button/card from scratch
<button className="px-4 py-2 bg-blue-500 rounded">  // BAD: ignores design system
```

### 12.4 Accessibility (WCAG)

```typescript
// DO: Semantic HTML + ARIA labels + keyboard navigation
<form aria-label="Generate animation brief">
  <label htmlFor="story">Story Description</label>
  <textarea id="story" aria-required="true" />
  <Button type="submit" aria-label="Start generation">Generate</Button>
</form>

// DON'T: Non-semantic divs for interactive elements
<div onClick={handleSubmit}>Generate</div>  // BAD: no keyboard support, no ARIA
```

### 12.5 SSE Event Handling (Generate Page)

```typescript
// DO: Handle all SSE event types with proper state management
useEffect(() => {
  const eventSource = new EventSource(url);
  eventSource.addEventListener('stage', handleStage);
  eventSource.addEventListener('log', handleLog);
  eventSource.addEventListener('progress', handleProgress);
  eventSource.addEventListener('done', handleDone);
  eventSource.addEventListener('error', handleError);
  return () => eventSource.close();
}, []);

// DON'T: Ignore SSE events or fail to clean up
const eventSource = new EventSource(url);  // BAD: no cleanup on unmount
eventSource.onmessage = (e) => {};  // BAD: uses generic onmessage
```

### 12.6 Animation Patterns

```typescript
// DO: Use framer-motion for theme transitions and UI animations
import { motion } from 'framer-motion';
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>

// DON'T: Use CSS animations for complex state transitions
// CSS animations lack the programmatic control needed for SSE-driven updates
```

---

## 13. V3-Specific Coding Rules

### 13.1 Gap Closure Pattern (F-M01 to F-M03)

V3 fixes 4 missing data persistence fields. Every gap fix follows this exact pattern:

1. **Migration:** Add column with `ALTER TABLE` (nullable or with DEFAULT)
2. **Drizzle Schema:** Add property mapping camelCase to snake_case
3. **Zod Schema:** Already complete (SRS verification) -- do not modify
4. **Generate Route:** Update INSERT mapping in `bulkCreateScenes` / `bulkCreateImagePrompts`
5. **UI Component:** Verify render (may need update for new fields)

```typescript
// Pattern: Adding a new DB column field to generate route INSERT
// In app/api/v1/generate/route.ts -- bulkCreateScenes mapping
const scenesData = validated.scenes.map(s => ({
  projectId,
  orderNo: s.order_no,
  description: s.description,
  voiceoverScript: s.voiceover_script,
  // ... existing fields ...
  voiceoverSpeaker: s.voiceover_speaker ?? 'narrator',  // V3 gap closure
}));

// In app/api/v1/generate/route.ts -- bulkCreateImagePrompts mapping
const promptsData = validated.scenes.flatMap(s =>
  s.image_prompts.map(p => ({
    projectId,
    sceneId: sceneIds[s.order_no - 1],
    tipe: p.tipe,
    target: p.target,
    promptText: p.prompt_text,
    // ... existing fields ...
    colorPalette: Array.isArray(p.color_palette)
      ? p.color_palette.join(', ')
      : (p.color_palette ?? null),  // V3 gap closure -- handle union type
    technical: p.technical ?? null,  // V3 gap closure
  }))
);
```

### 13.2 Scene Transition Flow Engine (F-M04)

```typescript
// DO: Follow the 5 flow patterns (A-E) defined in prompt-builder.ts
// Pattern A: Opening scene -> fade_in / fade_to_white
// Pattern B: Closing scene -> fade_to_black
// Pattern C: Mood change -> dissolve / fade (NOT cut)
// Pattern D: Fast action + fast pacing -> match_cut (0-200ms)
// Pattern E: Same mood consecutive -> cut or dissolve

// DON'T: Assign transitions without following flow rules
// Random transition assignment violates animation grammar
```

### 13.3 Audio Spec Handling

```typescript
// DO: Graceful handling when audio_specs is null/empty
// In generate/route.ts -- after scene creation
if (s.audio_specs && s.audio_specs.length > 0) {
  const audioData = s.audio_specs.map(audio => ({
    projectId,
    sceneId: sceneId,
    audioType: audio.audio_type,
    description: audio.description,
    // ... all scene_audio fields
  }));
  await bulkCreateSceneAudio(audioData);
} else {
  emitLog({ type: 'log', message: `Scene ${s.order_no}: no audio specs provided, skipping` });
}

// DON'T: Fail entire generation if one scene lacks audio
if (!s.audio_specs) throw new Error('Missing audio specs');  // BAD: blocks all
```

---

*End of CODING_RULES.md*
