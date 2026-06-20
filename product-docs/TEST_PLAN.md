# TEST_PLAN.md - PromptFlow V3

> **Versi:** 2.0 (V3 Update)
> **Tanggal:** 2026-06-21
> **Deliverable:** 5 fitur V3 - Light Theme, Scene Transition Flow Engine, Complex Image Prompts, Voiceover Voice Type Spec, Supporting Audio Spec
> **Builds on:** V1 (workflow engine, deployed) + V2 (landing page, in production) + V1 TEST_PLAN (landing page focus)
> **Selaras:** PRD.md v2.0, SRS.md v2.0, PROJECT_ARCHITECTURE.md v2.0, DATABASE_SCHEMA.md v2.0, UIUX_SPEC.md v2.0, API_CONTRACT.md v3.0, CODING_RULES.md v2.0, RAG-CONTEXT.md
> **Format reference:** product-docs/TEST_PLAN.md v1.0 (landing page)

---

## 1. Ringkasan Strategi Pengujian

### 1.1 Strategi

Pengujian V3 dilakukan bertingkat per level yang sudah established V1 + V2, diperluas untuk 5 fitur V3: **unit** (komponen + Zod + repository + migration script) -> **integration** (API routes + DB CRUD + theme persistence) -> **contract** (Zod schema vs DB schema vs API request/response) -> **E2E/UI** (Playwright critical path generate flow) -> **visual regression** (Playwright screenshot light + dark) -> **LLM output validation** (enum + range + default fallback) -> **migration dry-run** (100% V2 retained) -> **backward compat** (V2 project reads V3 schema) -> **a11y** (axe-core WCAG 2.1 AA) -> **performance** (Lighthouse mobile >= 85). Semua test co-located pakai Vitest (unit/integration) + Playwright (E2E/visual) + Drizzle migration runner + Lighthouse CI.

### 1.2 Lingkup In-Scope

| Area | Detail | Fitur |
|---|---|---|
| Schema migration | drizzle/0001_v3_core_features.sql additive: +11 fields scenes (9 core + 2 EXTENDED ASUMSI: scene_pacing, scene_mood) +5 fields image_prompts (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera) +1 projects +19 fields scene_audio table (7 core + 12 EXTENDED ASUMSI: music/sfx/ambient fields) | F-V3-02,04,05,06 |
| Zod schema extension | SceneSchema +11 field (9 core + 2 EXTENDED ASUMSI: scene_pacing, scene_mood), SceneAudioSchema +19 field (7 core + 12 EXTENDED ASUMSI: music/sfx/ambient fields), ImagePromptItemSchema +5 opsional (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera), ThemePreferenceSchema new | F-V3-08 |
| Prompt builder enhancement | 5 metadata instructions di buildSystemPrompt() | F-V3-07 |
| API contract | 5 endpoint baru (PATCH theme, audio CRUD 4). 4 endpoint extended | F-V3-01,05,09 |
| 5 UI components baru | ThemeToggle, SceneTransitionCard, VoiceTypeSelector, AudioPanel, ImagePromptDisplay | F-V3-01..05 |
| Repository pattern | scene-audio.repository.ts CRUD | F-V3-05 |
| Migration script | v2-to-v3.ts backfill + dry-run + rollback | F-V3-11 |
| i18n | ~60 keys V3 (common/transition/voice/audio/imagePrompt) ID+EN paralel | F-V3-10 |
| Analytics | 5 event V3 baru | F-V3-12 |
| Theme system | next-themes ThemeProvider + localStorage + system preference | F-V3-01 |

### 1.3 Lingkup Out-of-Scope

| Area | Alasan | Sitasi |
|---|---|---|
| Audio file generation | V3 = spec only, bukan actual audio file | BRD OOS-V3-01 |
| TTS engine actual | V3 = voice type spec, bukan TTS gen | BRD OOS-V3-02 |
| Image generation actual | V3 = prompt engine, bukan image gen | BRD OOS-V3-03 |
| Video assembly actual | V3 = prompt engine, bukan video gen | BRD OOS-V3-04 |
| AI SDK v6 | Kode V1 pakai v4, breaking | AGENTS.md CRIT-002 |
| GSAP/heavy animation lib | Framer Motion cukup | BRD LIM-V3-07 |
| Drop kolom V2 | Migration additive only | PRD P-07 |

### 1.4 Asumsi Pengujian

| ID | Asumsi | Sumber | Dampak bila Salah |
|---|---|---|---|
| TP-A01 | Vitest berfungsi di environment test project | package.json:83 | Pakai alternatif test runner |
| TP-A02 | Playwright berfungsi di environment test | package.json:63 | E2E ditunda |
| TP-A03 | drizzle-kit generate + push berfungsi di Turso staging | DATABASE_SCHEMA S9.1 | Manual SQL apply |
| TP-A04 | next-themes ^0.4.4 terinstall | SRS S1.2 | Test fallback ke custom hook |
| TP-A05 | Test DB (Turso staging) tersedia | Best practice | Pakai local SQLite via libSQL |
| TP-A06 | V2 fixtures tersedia: minimal 1 project + 1 scene | RAG-CONTEXT S3.1 | Test backfill tanpa data |
| TP-A07 | LLM provider accessible untuk integration test | RAG-CONTEXT S5.1 | Mock LLM response |
| TP-A08 | Mock LLM output (JSON) tersedia | DATABASE_SCHEMA S4.8 | Generate synthetic mock |
| TP-A09 | Bundle tambahan V3 <= +20KB gzipped | SRS TC-04 | Bundle regression |
| TP-A10 | Migration execution time <= 5s per project | SRS TC-38 | Perf regression |

---

## 2. Level Pengujian & Tujuan

| Level | Tujuan | Tool | Target | Output |
|---|---|---|---|---|
| **Unit** | Render komponen V3, Zod schema, repository fn, migration script, i18n key, prompt builder logic | Vitest + @testing-library/react | >= 80% coverage | *.test.ts(x) co-located |
| **Integration** | API route + auth + validation + DB CRUD. Theme persistence. Audio CRUD via API. | Vitest + Supertest | >= 60% coverage | *.test.ts di src/__tests__/ |
| **API/Contract** | Request/response match API_CONTRACT.md v3.0. Zod schema sesuai DB schema. | Vitest + Zod | 100% endpoint covered | contract.test.ts |
| **E2E/UI** | Critical path: /generate -> fill form -> Generate -> LLM SSE -> result tabs. Theme toggle. Audio CRUD. | Playwright | 100% critical path | e2e/v3/*.spec.ts |
| **Visual/Regression** | Screenshot per viewport (375/768/1024/1440px) + per theme (light + dark + system) + per state | Playwright screenshot | Semua viewport x theme | Screenshot artifacts |
| **Migration** | Dry-run: 100% V2 data retained. Rollback: 100% V3 reverted. | drizzle-kit + custom runner | 100% pass | migration.test.ts |
| **Backward Compat** | V2 project auto-migrate ke V3 defaults. V2 code read V3 DB. V2 export format valid. | Vitest + Drizzle | 100% pass | backward-compat.test.ts |
| **LLM Output** | LLM output valid Zod. Enum >= 90% valid. Fallback default applied. Token <= +50%. | Analytics + manual | >= 90% enum valid | llm-output.test.ts |
| **Aksesibilitas** | WCAG 2.1 AA both theme. axe-core 0 critical. Kontras >= 4.5:1. Keyboard nav. | axe-core + Playwright | 0 critical | a11y report |
| **Performa** | Lighthouse >= 85 mobile. LCP <= 2.5s. CLS <= 0.1. Bundle <= +20KB gzipped. | Lighthouse CI | Targets tercapai | Lighthouse report |
| **Keamanan** | Auth bypass. Ownership check. Zod validation. No PII analytics. No hardcoded secret. | Manual + ESLint | 0 violation | Security checklist |
| **Kompatibilitas** | Chrome/Firefox/Safari/Edge 100+. iOS 15+. Android 10+. | Playwright matrix | All green | Browser matrix |

---

## 3. Lingkungan & Tooling Test

### 3.1 Framework & Tool

| Tool | Versi | Kegunaan | Config | Sitasi |
|---|---|---|---|---|
| Vitest | ^2.1.0 | Unit + integration test | vitest.config.ts | package.json:83 |
| @vitest/coverage-v8 | ^2.2.0 | Coverage reporting | Threshold 80% | package.json |
| @testing-library/react | latest | Component render + DOM | Co-located | CODING_RULES S8.2 |
| @testing-library/user-event | latest | User interaction | Co-located | -- |
| Supertest | latest | API integration test | With Vitest | -- |
| Playwright | ^1.49.0 | E2E + visual + a11y | playwright.config.ts | package.json:63 |
| @axe-core/playwright | latest | A11y detection | Per page | -- |
| drizzle-kit | ^0.38.0 | Schema gen + migration | drizzle.config.ts | DATABASE_SCHEMA S9.1 |
| @libsql/client | ^0.14.0 | Local SQLite for test | Test env | package.json:25 |
| Lighthouse CI | latest | Performance audit | CLI / CI | -- |
| ESLint | ^9.17.0 | Linting | eslint.config.mjs | CODING_RULES S4.1 |
| TypeScript | ^5.7.0 | Type checking | tsconfig.json strict | CODING_RULES S3.6 |

### 3.2 Test Data

| Data | Sumber | Persiapan | Sitasi |
|---|---|---|---|
| i18n messages | messages/id.json, messages/en.json | Hardcode fixture. Wrap NextIntlClientProvider | CODING_RULES S2.4 |
| V2 DB fixtures | Synthetic V2 project (1+3 scenes+5 image_prompts) | Seed sebelum migration test | RAG-CONTEXT S3.1 |
| LLM mock output | src/__fixtures__/v3.ts | Hardcode JSON valid V3 + edge case | API_CONTRACT S6.4 |
| Auth fixtures | Synthetic user + session token | Seed auth.users + next-auth session | API_CONTRACT S2.1 |
| Design tokens | src/app/globals.css | Verify computed style | CODING_RULES S12.2 |
| Analytics events | src/lib/analytics/events.ts | Mock track() function | API_CONTRACT S11 |

### 3.3 Mock & Stub

| Item | Strategi | Sitasi |
|---|---|---|
| next-themes | Mock useTheme() -> {theme, setTheme, resolvedTheme}. Mock ThemeProvider wrapper. | SRS S3.1 |
| framer-motion | Mock motion.* component. Mock useReducedMotion(). Mock useInView(). | V1 TEST_PLAN S3.3 |
| @vercel/analytics/react | Mock track() function. Spy assert event name + properties. | V1 TEST_PLAN S3.3 |
| next-intl | Wrap test dengan NextIntlClientProvider + messages fixture ID/EN. | V1 TEST_PLAN S3.3 |
| next/navigation | Mock useRouter, usePathname, useLocale. | V1 TEST_PLAN S3.3 |
| next-auth | Mock getServerSession() -> fixture session. | API_CONTRACT S2.1 |
| @ai-sdk/openai-compatible | Mock LLM client -> return fixture JSON. | RAG-CONTEXT S5.1 |
| localStorage | Mock dengan jsdom default atau vitest-localstorage. | -- |

### 3.4 Data Test Fixtures

```typescript
// src/__fixtures__/v3.ts
import type { SceneWithV3, SceneAudio } from '@/lib/validation/schemas';

export const testMessages = {
  id: {
    common: { theme: 'Tema', themeToggle: 'Ganti tema', lightMode: 'Mode terang', darkMode: 'Mode gelap', systemMode: 'Ikuti sistem' },
    transition: { types: { cut: 'Potong', dissolve: 'Larut', fade_to_black: 'Gelap total', fade_to_white: 'Terang total', wipe: 'Sapu', match_cut: 'Potong cocok' } },
    voice: { types: { child: 'Anak', narrator: 'Narator', adult_female: 'Wanita dewasa' } },
    audio: { types: { background_music: 'Musik latar', sfx: 'Efek suara' } },
    imagePrompt: { layers: { subject: 'Subjek', composition: 'Komposisi', camera: 'Kamera', lighting: 'Pencahayaan', color: 'Warna', mood: 'Suasana', style: 'Gaya', technical: 'Teknis' } },
  },
  en: { /* parallel structure */ },
};

export const testSceneV3: SceneWithV3 = {
  order: 1, description: 'Scene 1: Pembuka', voiceover_script: 'Dahulu kala...',
  image_prompts: [{ target: 'Karakter Utama', prompt_text: 'Anak perempuan 10 tahun...', reference_filename: null, moodAtmosphere: 'Mysterious', styleReferences: '3D Pixar' }],
  transitionType: 'dissolve', transitionDurationMs: 1500, transitionEasing: 'ease_in_out', transitionDirection: 'forward',
  voiceType: 'narrator', voiceEmotion: 'calm', voiceSpeed: 1.0, voicePitch: 'auto', durationSeconds: 15,
  audio: [{ audioType: 'background_music', description: 'Gamelan lembut', timing: 'throughout', durationSeconds: 15, volume: 0.7, fadeInMs: 500, fadeOutMs: 1000 }],
};

export const testAudioEntry: SceneAudio = {
  audioType: 'background_music', description: 'Test audio', timing: 'throughout',
  durationSeconds: 10, volume: 0.7, fadeInMs: 0, fadeOutMs: 0,
};

export const testLLMOutputInvalidEnum = {
  result: { character_profiles: [], scenes: [{ ...testSceneV3, transitionType: 'INVALID_TRANSITION', voiceType: 'invalid_voice' }] },
};
```

### 3.5 Test DB Setup

```typescript
// src/__tests__/setup/test-db.ts
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';

export async function createTestDb() {
  const client = createClient({ url: ':memory:' });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './drizzle' });
  return { db, client };
}
```

---

## 4. Matriks Fitur -> Test Scenario

| PRD ID | Fitur | Test Scenario | Level | Prioritas | Sitasi |
|---|---|---|---|---|---|
| F-V3-01 | Light Theme Support | TC-V3-001..023 | Unit, Integration, E2E, Visual, A11y | MUST | PRD FR-V3-01 |
| F-V3-02 | Scene Transition Flow | TC-V3-024..041 | Unit, Integration, E2E, LLM, Contract | MUST | PRD FR-V3-02 |
| F-V3-03 | Complex Image Prompts | TC-V3-042..059 | Unit, Integration, E2E, LLM, Contract | MUST | PRD FR-V3-03 |
| F-V3-04 | Voiceover Voice Type | TC-V3-060..079 | Unit, Integration, E2E, LLM, A11y | MUST | PRD FR-V3-04 |
| F-V3-05 | Supporting Audio Spec | TC-V3-080..110 | Unit, Integration, E2E, LLM, Migration, Contract | MUST | PRD FR-V3-05 |
| F-V3-06 | Schema Migration | TC-V3-111..122 | Migration, Contract | MUST | PRD FR-V3-06 |
| F-V3-07 | Prompt Builder Enhancement | TC-V3-137..145 | Unit, Perf, LLM | SHOULD | PRD FR-V3-07 |
| F-V3-08 | Zod Schema Extension | TC-V3-146..153 | Unit, Contract | MUST | PRD FR-V3-08 |
| F-V3-09 | Export Extension | TC-V3-154..161 | Integration, Contract | SHOULD | PRD FR-V3-09 |
| F-V3-10 | i18n V3 Keys | TC-V3-162..170 | Unit, Integration | MUST | PRD FR-V3-10 |
| F-V3-11 | V2 to V3 Migration | TC-V3-123..136 | Migration, Backward Compat | SHOULD | PRD FR-V3-11 |
| F-V3-12 | Analytics V3 Events | TC-V3-171..176 | Integration | SHOULD | PRD FR-V3-12 |
| F-V3-13 | Quality Gates | TC-V3-177..185 | CI Gate | MUST | PRD AC-V3-13 |
| BC | Backward Compat | TC-V3-186..192 | Backward Compat | MUST | PRD P-07 |
| E2E | Critical Path | TC-V3-193..205 | E2E | MUST | UIUX_SPEC S6 |

**Total: 205 test case V3 + 83 test case V1 (landing) = 288 test case.**

---

## 5. Detail Test Case

### 5.1 F-V3-01: Light Theme Support

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Endpoint | Sitasi |
|---|---|---|---|---|---|---|---|---|---|
| TC-V3-001 | ThemeToggle | Mounted | Render | -- | Icon Sun/Moon/Monitor tampil. 3 menu option | MUST | Unit | -- | UIUX_SPEC S3.1 |
| TC-V3-002 | ThemeToggle | Dark active | Click Light | setTheme('light') | HTML remove 'dark'. localStorage = 'light'. Icon Sun | MUST | Integration | -- | SRS S3.1 |
| TC-V3-003 | ThemeToggle | Light active | Click Dark | setTheme('dark') | HTML add 'dark'. localStorage = 'dark'. Icon Moon | MUST | Integration | -- | SRS S3.1 |
| TC-V3-004 | ThemeToggle | System active | Click System | setTheme('system') | localStorage = 'system'. Ikuti OS prefers-color-scheme | MUST | Integration | -- | SRS S3.1 |
| TC-V3-005 | ThemeToggle | Theme change | Analytics | setTheme('light') | track('theme_change', {theme, from}) fired | SHOULD | Integration | -- | SRS S3.12 |
| TC-V3-006 | Providers | App boot | Wrap ThemeProvider | -- | attribute="class". defaultTheme="dark". enableSystem | MUST | Unit | -- | SRS S3.1 |
| TC-V3-007 | layout.tsx | V3 deployed | Check no hardcoded dark | -- | className="dark" tidak ada di html | MUST | Integration | -- | SRS S3.1 |
| TC-V3-008 | layout.tsx | V3 deployed | suppressHydrationWarning | -- | html suppressHydrationWarning present | MUST | Unit | -- | SRS S3.1 |
| TC-V3-009 | page.tsx | V3 deployed | Check no div.dark wrap | -- | Hardcoded dark wrap removed | MUST | Integration | -- | SRS S3.1 |
| TC-V3-010 | provider-card | V3 deployed | Check no dark:bg-green-950 | -- | Hardcoded dark: variant replaced | MUST | Unit | -- | SRS S3.1 |
| TC-V3-011 | Theme | First load | Reload after toggle | localStorage.theme = 'light' | No FOUC. Theme instant | MUST | E2E | -- | SRS S3.1 |
| TC-V3-012 | Theme | System dark | prefers-color-scheme dark | OS pref | HTML class dark applied | MUST | E2E | -- | SRS S3.1 |
| TC-V3-013 | Theme | System light | prefers-color-scheme light | OS pref | HTML class dark removed | MUST | E2E | -- | SRS S3.1 |
| TC-V3-014 | Theme A11y | Toggle rendered | Tab to toggle | Keyboard | Focus ring ring-2 ring-ring visible | MUST | A11y | -- | UIUX_SPEC S9.2 |
| TC-V3-015 | Theme A11y | Toggle rendered | Enter | Keyboard | Dropdown open. aria-expanded=true | MUST | A11y | -- | UIUX_SPEC S9.2 |
| TC-V3-016 | Theme API | Auth valid | PATCH theme | {"theme":"light"} | 200 OK. DB updated | MUST | Integration | PATCH /projects/[id]/theme | API_CONTRACT S6.3.6 |
| TC-V3-017 | Theme API | No session | PATCH theme | {"theme":"light"} | 401 UNAUTHORIZED | MUST | Integration | PATCH /projects/[id]/theme | API_CONTRACT S6.3.6 |
| TC-V3-018 | Theme API | Invalid enum | PATCH theme | {"theme":"neon"} | 400 VALIDATION_ERROR | MUST | Integration | PATCH /projects/[id]/theme | API_CONTRACT S6.3.6 |
| TC-V3-019 | Theme API | Not owner | PATCH other | {"theme":"light"} | 403/404 | MUST | Integration | PATCH /projects/[id]/theme | API_CONTRACT S2.2 |
| TC-V3-020 | Theme Visual | Light mode | Screenshot 1440px light | viewport 1440x900 | Baseline saved | MUST | Visual | -- | UIUX_SPEC S2.1 |
| TC-V3-021 | Theme Visual | Dark mode | Screenshot 1440px dark | viewport 1440x900 | Baseline saved | MUST | Visual | -- | UIUX_SPEC S2.2 |
| TC-V3-022 | Theme Visual | System light | Screenshot 375px light | viewport 375x812 | Mobile screenshot | MUST | Visual | -- | UIUX_SPEC S12.2 |
| TC-V3-023 | Theme Visual | Toggle transition | Switch dark->light | Click toggle | No FOUC. Instant swap | MUST | Visual | -- | UIUX_SPEC S10.1 |

### 5.2 F-V3-02: Scene Transition Flow Engine

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Endpoint | Sitasi |
|---|---|---|---|---|---|---|---|---|---|
| TC-V3-024 | Transition Schema | DB migrated | Verify 4 fields | SELECT transition_type | Column exist. TEXT. NOT NULL. Default 'cut' | MUST | Migration | -- | DATABASE_SCHEMA S4.8 |
| TC-V3-025 | Transition Zod | Schema extended | Validate enum (6) | All 6 values | All valid. Default 'cut' | MUST | Unit | -- | SRS S4.5 |
| TC-V3-026 | Transition Zod | Invalid value | Validate invalid | transitionType: 'invalid' | Zod fail. Default 'cut' | MUST | Unit | -- | SRS S3.8 |
| TC-V3-027 | Transition Zod | Range | Validate durationMs | 0,1500,5000,5001 | 0-5000 valid. >5000 fail | MUST | Unit | -- | DATABASE_SCHEMA S4.8 |
| TC-V3-028 | Transition Parse | Scene card | Parse 4 field | JSON valid | 4 field extracted + defaulted | MUST | Unit | -- | SRS S3.2 |
| TC-V3-029 | Transition DB | Save handler | Persist 4 field | INSERT scene | 4 column populated | MUST | Integration | POST /api/v1/generate | SRS S3.2 |
| TC-V3-030 | Transition DB | Read handler | Read 4 field | SELECT scene | 4 field returned | MUST | Integration | GET /api/.../scenes | API_CONTRACT S6.9 |
| TC-V3-031 | Transition UI | Scene card | Display badge | transitionType='dissolve' | Badge Larut icon Blend | MUST | Unit | -- | UIUX_SPEC S3.2 |
| TC-V3-032 | Transition UI | Scene card | Flow arrow | 2 scenes | Cut=dashed. Dissolve=solid | MUST | Unit | -- | UIUX_SPEC S7.2 |
| TC-V3-033 | Transition UI | All 6 types | Map icon Lucide | -- | cut=Zap, dissolve=Blend, etc | MUST | Unit | -- | UIUX_SPEC S8.1 |
| TC-V3-034 | Transition UI | Badge color | Contrast >= 4.5:1 | Light + dark | All pass | MUST | A11y | -- | UIUX_SPEC S2.4 |
| TC-V3-035 | Transition E2E | User generate | Generate + view | Fill form | SceneTransitionCard visible | MUST | E2E | POST /api/v1/generate | SRS S3.2 |
| TC-V3-036 | Transition LLM | LLM generate | Enum valid | Sample 10 calls | >= 90% valid | MUST | LLM | POST /api/v1/generate | SRS TC-A11 |
| TC-V3-037 | Transition LLM | LLM invalid | Fallback | Mock invalid | Default 'cut' applied | MUST | LLM | POST /api/v1/generate | SRS S3.8 |
| TC-V3-038 | Transition Export | JSON export | Include V3 field | GET export=json | scenes[].transitionType present | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-039 | Transition Export | MD export | Include section | GET export=md | ## Scene Transitions table | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-040 | Transition i18n | ID locale | Translate 6 types | -- | All 6 ID labels | MUST | Unit | -- | SRS S3.10 |
| TC-V3-041 | Transition i18n | EN locale | Translate 6 types | -- | All 6 EN labels | MUST | Unit | -- | SRS S3.10 |

### 5.3 F-V3-03: Complex Image Prompts (8 Layer)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Endpoint | Sitasi |
|---|---|---|---|---|---|---|---|---|---|
| TC-V3-042 | ImagePrompt Zod | Schema extended | Validate 5 opsional | moodAtmosphere, styleReferences, composition, lighting, camera | All nullable.optional | MUST | Unit | -- | SRS S4.5 |
| TC-V3-043 | ImagePrompt Zod | promptText retained | Verify single string | prompt_text: 'text' | Valid. Backward compat | MUST | Unit | -- | RAG-CONTEXT S6.4 |
| TC-V3-044 | Prompt Builder | 8-layer formula | Verify instruction | -- | [Subject]+[Composition]+...+[Technical] present | MUST | Unit | -- | SRS S3.7 |
| TC-V3-045 | Prompt Builder | 8-layer rule | Verify min 6/8 | -- | Rule "minimal 6 of 8" present | MUST | Unit | -- | SRS S3.3 |
| TC-V3-046 | ImagePrompt Parse | LLM output | Parse 8 layer | JSON valid | Extract prompt_text + mood + style | MUST | Unit | POST /api/v1/generate | SRS S3.3 |
| TC-V3-047 | ImagePrompt DB | Save handler | Persist 5 V3 field | INSERT image_prompts | 5 column nullable populated | MUST | Integration | POST /api/v1/generate | DATABASE_SCHEMA S4.9 |
| TC-V3-048 | ImagePrompt DB | Read handler | Read 5 V3 field | SELECT image_prompts | moodAtmosphere + styleReferences + composition + lighting + camera | MUST | Integration | GET /api/.../image-prompts | API_CONTRACT S6.10 |
| TC-V3-049 | ImagePrompt UI | Component | Display 8 layer labels | Render | 8 layer headers visible | MUST | Unit | -- | UIUX_SPEC S3.5 |
| TC-V3-050 | ImagePrompt UI | Layer clicked | Expand/collapse | Click header | Content visible/hidden | MUST | Unit | -- | UIUX_SPEC S7.5 |
| TC-V3-051 | ImagePrompt UI | Copy layer | Click Copy | -- | Clipboard match. Toast | MUST | Integration | -- | UIUX_SPEC S10.5 |
| TC-V3-052 | ImagePrompt UI | Copy full | Click Copy Full | -- | Clipboard entire promptText | MUST | Integration | -- | UIUX_SPEC S10.5 |
| TC-V3-053 | ImagePrompt E2E | User generate | Generate + view | Fill form | ImagePromptDisplay 8 layer | MUST | E2E | POST /api/v1/generate | SRS S3.3 |
| TC-V3-054 | ImagePrompt LLM | LLM generate | Count layers | Sample 10 calls | >= 6/8 per prompt (>= 90%) | MUST | LLM | POST /api/v1/generate | SRS TC-A11 |
| TC-V3-055 | ImagePrompt LLM | layerCount event | Track | -- | track('image_prompt_layers_count') | SHOULD | Integration | -- | SRS S3.12 |
| TC-V3-056 | ImagePrompt Export | JSON export | Include 8 layer | GET export=json | prompt_text includes layers | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-057 | ImagePrompt Export | MD export | Include section | GET export=md | ## Image Prompt Layers | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-058 | ImagePrompt i18n | ID locale | 8 layer labels | -- | All 8 ID labels | MUST | Unit | -- | SRS S3.10 |
| TC-V3-059 | ImagePrompt i18n | EN locale | 8 layer labels | -- | All 8 EN labels | MUST | Unit | -- | SRS S3.10 |

### 5.4 F-V3-04: Voiceover Voice Type Spec

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Endpoint | Sitasi |
|---|---|---|---|---|---|---|---|---|---|
| TC-V3-060 | Voice Zod | Schema extended | Validate voiceType (7) | All 7 values | All valid. Default 'narrator' | MUST | Unit | -- | SRS S4.5 |
| TC-V3-061 | Voice Zod | Invalid voiceType | Validate invalid | voiceType: 'robot' | Zod fail. Default 'narrator' | MUST | Unit | -- | SRS S3.8 |
| TC-V3-062 | Voice Zod | Range | Validate voiceSpeed | 0.5,1.0,2.0,0.3,2.1 | 0.5-2.0 valid. Out fail | MUST | Unit | -- | DATABASE_SCHEMA S4.8 |
| TC-V3-063 | Voice Zod | Emotion | Validate voiceEmotion (6) | All 6 values | All valid. Default 'neutral' | MUST | Unit | -- | SRS S4.5 |
| TC-V3-064 | Voice Zod | Pitch | Validate voicePitch (4) | All 4 values | All valid. Default 'auto' | MUST | Unit | -- | SRS S4.5 |
| TC-V3-065 | Voice DB | Save handler | Persist 4 voice field | INSERT scene | 4 column populated | MUST | Integration | POST /api/v1/generate | SRS S3.4 |
| TC-V3-066 | Voice DB | Read handler | Read 4 voice field | SELECT scene | 4 voice field returned | MUST | Integration | GET /api/.../scenes | API_CONTRACT S6.9 |
| TC-V3-067 | Voice UI | VoiceTypeSelector | Render 7 types | Render | 7 options visible | MUST | Unit | -- | UIUX_SPEC S3.3 |
| TC-V3-068 | Voice UI | Emotion dropdown | Render 6 emotions | Render | 6 options visible | MUST | Unit | -- | UIUX_SPEC S3.3 |
| TC-V3-069 | Voice UI | Speed slider | Render 0.5-2.0 | Render | Slider min/max/default | MUST | Unit | -- | UIUX_SPEC S3.3 |
| TC-V3-070 | Voice UI | Pitch dropdown | Render 4 options | Render | 4 options visible | MUST | Unit | -- | UIUX_SPEC S3.3 |
| TC-V3-071 | Voice UI | Badge color | Contrast both theme | 7 types x 2 | All pass >= 4.5:1 | MUST | A11y | -- | UIUX_SPEC S2.5 |
| TC-V3-072 | Voice UI | Inline edit | Change voice type | Click + select | PATCH scene | MUST | Integration | POST /api/v1/generate | SRS S3.4 |
| TC-V3-073 | Voice E2E | User generate | Generate + view | Fill form | VoiceTypeSelector visible | MUST | E2E | POST /api/v1/generate | SRS S3.4 |
| TC-V3-074 | Voice LLM | LLM generate | voiceType valid | Sample 10 calls | >= 90% valid | MUST | LLM | POST /api/v1/generate | SRS TC-A11 |
| TC-V3-075 | Voice LLM | voice_assigned event | Track | -- | track fired | SHOULD | Integration | -- | SRS S3.12 |
| TC-V3-076 | Voice Export | JSON export | Include 4 field | GET export=json | voiceType/Emotion/Speed/Pitch | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-077 | Voice Export | MD export | Include section | GET export=md | ## Voice Specifications | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-078 | Voice i18n | ID+EN | 17 keys | -- | All 17 ID+EN paralel | MUST | Unit | -- | SRS S3.10 |
| TC-V3-079 | Voice A11y | Selector rendered | Tab to dropdown | Keyboard | Focus ring + ARIA role=listbox | MUST | A11y | -- | UIUX_SPEC S9.3 |

### 5.5 F-V3-05: Supporting Audio Spec

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Endpoint | Sitasi |
|---|---|---|---|---|---|---|---|---|---|
| TC-V3-080 | Audio Table | DB migrated | Verify table | SELECT sqlite_master | Table exist + columns + indexes | MUST | Migration | -- | DATABASE_SCHEMA S4.10 |
| TC-V3-081 | Audio Index | DB migrated | Verify 3 indexes | -- | All 3 indexes | MUST | Migration | -- | DATABASE_SCHEMA S6.2 |
| TC-V3-082 | Audio Zod | Schema created | Validate audioType (5) | All 5 values | All valid. No default | MUST | Unit | -- | SRS S4.5 |
| TC-V3-083 | Audio Zod | Timing | Validate timing (4) | All 4 values | All valid. Default 'throughout' | MUST | Unit | -- | SRS S4.5 |
| TC-V3-084 | Audio Zod | Volume | Validate 0.0-1.0 | 0.0,0.7,1.0,-0.1,1.1 | 0-1 valid. Out fail | MUST | Unit | -- | DATABASE_SCHEMA S4.10 |
| TC-V3-085 | Audio Zod | Fade | Validate >= 0 | 0,500,1000,-100 | >= 0 valid. <0 fail | MUST | Unit | -- | DATABASE_SCHEMA S4.10 |
| TC-V3-086 | Audio Parse | LLM output | Parse audio array | JSON valid | Extract audio[] | MUST | Unit | POST /api/v1/generate | SRS S3.5 |
| TC-V3-087 | Audio DB | Save handler | Batch insert | INSERT scene + audio | All rows inserted | MUST | Integration | POST /api/v1/generate | SRS S3.5 |
| TC-V3-088 | Audio DB | Cascade | Delete scene | DELETE scene | scene_audio CASCADE | MUST | Migration | -- | DATABASE_SCHEMA S5.2 |
| TC-V3-089 | Audio API | Auth valid | POST create | audioType+description | 201 Created | MUST | Integration | POST /api/.../audio | API_CONTRACT S6.13.2 |
| TC-V3-090 | Audio API | Auth valid | GET list | -- | 200 OK. List | MUST | Integration | GET /api/.../audio | API_CONTRACT S6.13.1 |
| TC-V3-091 | Audio API | Auth + exists | PATCH update | volume:0.9 | 200 OK. Updated | MUST | Integration | PATCH /api/.../audio/[id] | API_CONTRACT S6.13.3 |
| TC-V3-092 | Audio API | Auth + exists | DELETE | -- | 204 No Content | MUST | Integration | DELETE /api/.../audio/[id] | API_CONTRACT S6.13.4 |
| TC-V3-093 | Audio API | No session | POST | body valid | 401 UNAUTHORIZED | MUST | Integration | POST /api/.../audio | API_CONTRACT S6.13.2 |
| TC-V3-094 | Audio API | Not owner | POST other | body valid | 403/404 | MUST | Integration | POST /api/.../audio | API_CONTRACT S2.2 |
| TC-V3-095 | Audio API | Invalid body | POST empty | {} | 400 VALIDATION_ERROR | MUST | Integration | POST /api/.../audio | API_CONTRACT S6.13.2 |
| TC-V3-096 | Audio API | Not found | PATCH missing | -- | 404 NOT_FOUND | MUST | Integration | PATCH /api/.../audio/[id] | API_CONTRACT S6.13.3 |
| TC-V3-097 | Audio UI | AudioPanel | List entries | Render | List + badge + controls | MUST | Unit | -- | UIUX_SPEC S3.4 |
| TC-V3-098 | Audio UI | Add dialog | Click + Tambah | Click | Dialog modal open | MUST | Unit | -- | UIUX_SPEC S7.4 |
| TC-V3-099 | Audio UI | Save audio | Fill + Simpan | Valid | POST 201. Toast | MUST | Integration | POST /api/.../audio | UIUX_SPEC S10.5 |
| TC-V3-100 | Audio UI | Edit audio | Click Edit | Modify | PATCH 200. Updated | MUST | Integration | PATCH /api/.../audio/[id] | UIUX_SPEC S7.4 |
| TC-V3-101 | Audio UI | Delete audio | Click Hapus | Confirm | DELETE 204. Toast | MUST | Integration | DELETE /api/.../audio/[id] | UIUX_SPEC S10.5 |
| TC-V3-102 | Audio UI | Empty state | No audio | -- | Empty message + Add btn | SHOULD | Unit | -- | UIUX_SPEC S10.4 |
| TC-V3-103 | Audio E2E | Full CRUD | Generate + CRUD | Full flow | All CRUD works | MUST | E2E | All audio routes | SRS S3.5 |
| TC-V3-104 | Audio LLM | LLM generate | >= 1 cue/scene | Sample 10 calls | >= 80% scenes | MUST | LLM | POST /api/v1/generate | SRS S8.4 |
| TC-V3-105 | Audio LLM | LLM invalid | Fallback | Mock invalid | Entry skipped | MUST | LLM | POST /api/v1/generate | SRS S3.8 |
| TC-V3-106 | Audio LLM | audio_generated event | Track | -- | track fired | SHOULD | Integration | -- | SRS S3.12 |
| TC-V3-107 | Audio Export | JSON export | Include audio[] | GET export=json | scenes[].audio[] | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-108 | Audio Export | MD export | Include section | GET export=md | ## Audio Specifications | MUST | Contract | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-109 | Audio i18n | ID+EN | 16 keys | -- | All 16 ID+EN paralel | MUST | Unit | -- | SRS S3.10 |
| TC-V3-110 | Audio A11y | Panel rendered | ARIA | -- | role=region, aria-label | MUST | A11y | -- | UIUX_SPEC S9.3 |

### 5.6 F-V3-06: Schema Migration

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-111 | Migration Generate | V2 active | drizzle-kit generate | -- | 0001_v3_core_features.sql created | MUST | Migration | DATABASE_SCHEMA S9.1 |
| TC-V3-112 | Migration SQL | SQL file | Verify 11 ALTER scenes | grep | 11 ALTER statements | MUST | Migration | DATABASE_SCHEMA S9.3 |
| TC-V3-113 | Migration SQL | SQL file | Verify 5 ALTER image_prompts | grep | 5 ALTER statements | MUST | Migration | DATABASE_SCHEMA S9.3 |
| TC-V3-114 | Migration SQL | SQL file | Verify 1 ALTER projects | grep | 1 ALTER for theme_preference | MUST | Migration | DATABASE_SCHEMA S9.3 |
| TC-V3-115 | Migration SQL | SQL file | Verify 1 CREATE TABLE scene_audio | grep | 1 CREATE statement | MUST | Migration | DATABASE_SCHEMA S9.3 |
| TC-V3-116 | Migration SQL | SQL file | Verify NO DROP COLUMN V2 | grep DROP | 0 DROP for V2 columns | MUST | Migration | PRD P-07 |
| TC-V3-117 | Migration Push | Turso staging | drizzle-kit push | -- | Push success | MUST | Migration | DATABASE_SCHEMA S9.1 |
| TC-V3-118 | Migration Idempotent | V3 active | Run migration 2x | -- | No error. Idempotent | MUST | Migration | SRS TC-31 |
| TC-V3-119 | Migration AddDefault | ALTER scenes | Verify DEFAULT | grep DEFAULT | All V3 fields have DEFAULT | MUST | Migration | BRD ASM-B-V3-07 |
| TC-V3-120 | Migration CASCADE | scene_audio | Verify CASCADE | grep CASCADE | Both FK CASCADE | MUST | Migration | DATABASE_SCHEMA S5.2 |
| TC-V3-121 | Migration Schema Match | DB V3 | Compare DB vs Drizzle | introspection | Match 100% | MUST | Migration | DATABASE_SCHEMA S4.10 |
| TC-V3-122 | Migration Perf | 100 scenes | Run migration | -- | Time <= 5s | MUST | Migration | SRS TC-38 |

### 5.7 F-V3-11: V2 to V3 Migration Script

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-123 | V2-V3 Backfill | V2 DB seeded | Run migrateV2ToV3 | V2 fixtures | All 3 scenes updated | MUST | Migration | SRS S3.11 |
| TC-V3-124 | V2-V3 Default Transition | Scene 1 | Verify transitionType='cut' | SELECT | Value = 'cut' | MUST | Migration | DATABASE_SCHEMA S9.4 |
| TC-V3-125 | V2-V3 Default Voice | Scene 1 | Verify voiceType='narrator' | SELECT | Value = 'narrator' | MUST | Migration | DATABASE_SCHEMA S9.4 |
| TC-V3-126 | V2-V3 Default Easing | Scene 1 | Verify transitionEasing='linear' | SELECT | Value = 'linear' | MUST | Migration | DATABASE_SCHEMA S9.4 |
| TC-V3-127 | V2-V3 Default Voice Speed | Scene 1 | Verify voiceSpeed=1.0 | SELECT | Value = 1.0 | MUST | Migration | DATABASE_SCHEMA S9.4 |
| TC-V3-128 | V2-V3 Duration Estimate | Scene with VO | Verify durationSeconds | SELECT | Value > 0 | MUST | Migration | DATABASE_SCHEMA S9.4 |
| TC-V3-129 | V2-V3 Retain V2 | V2 project | Run migration | -- | 100% V2 data retained | MUST | Migration | PRD P-07 |
| TC-V3-130 | V2-V3 Dry-run | V2 DB | Run dryRun:true | V2 fixtures | Log only. No DB UPDATE | MUST | Migration | SRS S3.11 |
| TC-V3-131 | V2-V3 Rollback | V3 DB | Run rollback dryRun:true | V3 fixtures | Log only. reverted > 0 | MUST | Migration | DATABASE_SCHEMA S9.5 |
| TC-V3-132 | V2-V3 Success Rate | 100 scenes | Run migration | -- | Success >= 95% | MUST | Migration | SRS TC-33 |
| TC-V3-133 | V2-V3 Idempotent | V3 migrated | Run 2x | -- | 2nd run: updated = 0 | MUST | Migration | SRS TC-31 |
| TC-V3-134 | V2-V3 Progress | 100 scenes | onProgress callback | -- | Callback per batch | MUST | Migration | API_CONTRACT S5.3 |
| TC-V3-135 | V2-V3 No Audio | V2 scenes | Run migration | -- | No scene_audio created | MUST | Migration | PRD FR-V3-11 |
| TC-V3-136 | V2-V3 Error | Corrupt row | Run migration | -- | errors populated, continues | MUST | Migration | API_CONTRACT S5.3 |

### 5.8 F-V3-07: Prompt Builder Enhancement

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-137 | Prompt 5 Instruction | buildSystemPrompt() | Verify 5 blocks | Grep output | 5 instruction blocks present | MUST | Unit | SRS S3.7 |
| TC-V3-138 | Prompt Transition Rule | buildSystemPrompt() | Verify action=cut | Grep | "Action scenes: use cut" | MUST | Unit | SRS S3.7 |
| TC-V3-139 | Prompt Voice Rule | buildSystemPrompt() | Verify voiceType mapping | Grep | "Child: voiceType=child" | MUST | Unit | SRS S3.7 |
| TC-V3-140 | Prompt Audio Rule | buildSystemPrompt() | Verify audio cue | Grep | "Dramatic: background_music" | MUST | Unit | SRS S3.7 |
| TC-V3-141 | Prompt JSON Schema | buildSystemPrompt() | Verify extended schema | Parse | Includes V3 enums | MUST | Unit | SRS S3.7 |
| TC-V3-142 | Prompt Token Usage | buildSystemPrompt() | Measure tokens | tiktoken | <= +50% baseline | MUST | Perf | SRS TC-12 |
| TC-V3-143 | Prompt Consistency | buildSystemPrompt() | Multiple calls | Call 10x | Same output | MUST | Unit | RAG-CONTEXT S4.2 |
| TC-V3-144 | Prompt Style Modifier | buildUserMessage() | Style-specific | style='anime' | "anime-style" in output | MUST | Unit | SRS S3.3 |
| TC-V3-145 | Prompt Fallback | LLM invalid | Trigger fallback | Mock invalid | Default SceneSchema applied | MUST | Unit | SRS TC-11 |

### 5.9 F-V3-08: Zod Schema Extension

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-146 | SceneSchema Extended | Updated | Validate full V3 | All 11 V3 field | Zod pass | MUST | Unit | SRS S4.5 |
| TC-V3-147 | SceneSchema Defaults | Empty scene | Validate {} | Minimal fields | V3 defaults applied | MUST | Unit | DATABASE_SCHEMA S7.3 |
| TC-V3-148 | SceneAudioSchema | Created | Validate minimal | audioType+description | Zod pass. Defaults | MUST | Unit | SRS S4.5 |
| TC-V3-149 | ImagePromptItemSchema | Extended | Validate 2 opsional | moodAtmosphere+styleReferences | nullable.optional | MUST | Unit | SRS S4.5 |
| TC-V3-150 | ThemePreferenceSchema | Created | Validate 3 enum | dark/light/system | Default 'dark' | MUST | Unit | DATABASE_SCHEMA S4.3 |
| TC-V3-151 | ProjectResultSchema | Root schema | Validate full result | All nested | Zod pass | MUST | Unit | API_CONTRACT S8 |
| TC-V3-152 | TypeScript Strict | Schema files | pnpm typecheck | -- | 0 error | MUST | CI | SRS TC-14 |
| TC-V3-153 | Schema DB Match | Zod vs DB | Compare enums | All V3 enums | Match 100% | MUST | Contract | SRS S4.5 |

### 5.10 F-V3-09: Export Extension

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Endpoint | Sitasi |
|---|---|---|---|---|---|---|---|---|---|
| TC-V3-154 | JSON Export V3 | V3 generated | GET export=json | -- | V3 fields in scenes[] | MUST | Integration | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-155 | JSON Export Backward | V2 project | GET export=json | -- | V2 fields + V3 defaults | MUST | Contract | GET /api/.../export | BRD LIM-V3-03 |
| TC-V3-156 | Markdown Transition | V3 | GET export=md | -- | ## Scene Transitions table | MUST | Integration | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-157 | Markdown Voice | V3 | GET export=md | -- | ## Voice Specifications table | MUST | Integration | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-158 | Markdown Audio | V3 | GET export=md | -- | ## Audio Specifications table | MUST | Integration | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-159 | Markdown Image Layer | V3 | GET export=md | -- | ## Image Prompt Layers | MUST | Integration | GET /api/.../export | API_CONTRACT S6.7 |
| TC-V3-160 | Export Header | Export API | Verify Content-Disposition | -- | attachment; filename | SHOULD | Integration | GET /api/.../export | API_CONTRACT S3.2 |
| TC-V3-161 | Export No Conflict | Draft project | GET export=json | -- | 409 CONFLICT | MUST | Integration | GET /api/.../export | API_CONTRACT S6.7 |

### 5.11 F-V3-10: i18n V3 Keys

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-162 | i18n common.* | ID+EN JSON | Verify 5 keys | -- | 5 ID+EN paralel | MUST | Unit | SRS S3.10 |
| TC-V3-163 | i18n transition.* | ID+EN JSON | Verify 6 types | -- | 6 ID+EN paralel | MUST | Unit | SRS S3.10 |
| TC-V3-164 | i18n voice.* | ID+EN JSON | Verify 17 keys | -- | 17 ID+EN paralel | MUST | Unit | SRS S3.10 |
| TC-V3-165 | i18n audio.* | ID+EN JSON | Verify 16 keys | -- | 16 ID+EN paralel | MUST | Unit | SRS S3.10 |
| TC-V3-166 | i18n imagePrompt.* | ID+EN JSON | Verify 10 keys | -- | 10 ID+EN paralel | MUST | Unit | SRS S3.10 |
| TC-V3-167 | i18n Sync | ID vs EN | Check all keys | -- | 100% match | MUST | Unit | CODING_RULES S2.4 |
| TC-V3-168 | i18n UI Text | Render ID | No hardcoded | grep | No hardcoded V3 text | MUST | Unit | CODING_RULES L-02 |
| TC-V3-169 | i18n UI EN | Render EN | All translated | Switch locale | All keys translated | MUST | Integration | -- | SRS S3.10 |
| TC-V3-170 | i18n Count | Total V3 keys | Count | -- | Total ~60 keys | MUST | Unit | SRS S3.10 |

### 5.12 F-V3-12: Analytics V3 Events

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-171 | theme_change | Theme toggle | Click light | setTheme('light') | track('theme_change') | SHOULD | Integration | SRS S3.12 |
| TC-V3-172 | scene_transition_generated | LLM generate | Scene transition | LLM output | track fired | SHOULD | Integration | SRS S3.12 |
| TC-V3-173 | voice_type_assigned | LLM generate | Scene voice | LLM output | track fired | SHOULD | Integration | SRS S3.12 |
| TC-V3-174 | audio_spec_generated | LLM generate | Scene audio | LLM output | track fired | SHOULD | Integration | SRS S3.12 |
| TC-V3-175 | image_prompt_layers_count | LLM generate | Image prompt | LLM output | track fired | SHOULD | Integration | SRS S3.12 |
| TC-V3-176 | Analytics No PII | All V3 events | Check payload | -- | No email/name/token | MUST | Integration | BRD NFR-S04 |

### 5.13 Quality Gates (CI)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-177 | ESLint V3 | All V3 files | pnpm lint | -- | 0 error | MUST | CI | SRS S8.1 |
| TC-V3-178 | Typecheck V3 | All V3 files | pnpm typecheck | -- | 0 error | MUST | CI | SRS TC-14 |
| TC-V3-179 | Build V3 | All V3 files | pnpm build | -- | Pass | MUST | CI | SRS S8.1 |
| TC-V3-180 | Bundle Size | next build | Measure | -- | <= +20KB gzipped | MUST | Perf | PRD NFR-V3-P04 |
| TC-V3-181 | Lighthouse Mobile | URL | Run Lighthouse | -- | Performance >= 85 | MUST | Perf | PRD NFR-V3-P01 |
| TC-V3-182 | Lighthouse LCP | Lighthouse | LCP | -- | <= 2.5s | MUST | Perf | PRD NFR-V3-P02 |
| TC-V3-183 | Lighthouse CLS | Lighthouse | CLS | -- | <= 0.1 | MUST | Perf | PRD NFR-V3-P03 |
| TC-V3-184 | axe-core Light | Light theme | Run axe-core | Playwright | 0 critical | MUST | A11y | PRD NFR-V3-A01 |
| TC-V3-185 | axe-core Dark | Dark theme | Run axe-core | Playwright | 0 critical | MUST | A11y | PRD NFR-V3-A01 |

### 5.14 Backward Compatibility (V2 ke V3)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-186 | BC: V2 Read | V2 project | Read with V3 code | V2 DB | V2 data read. V3 defaults | MUST | BC | PRD P-07 |
| TC-V3-187 | BC: V2 Write | V2 project | Write V3 field | PATCH | Write success. V2 retained | MUST | BC | PRD P-07 |
| TC-V3-188 | BC: V2 Schema | V2 code | V2 API call | -- | V2 client ignore V3. No error | MUST | BC | API_CONTRACT S12.1 |
| TC-V3-189 | BC: V2 Export | V2 project | GET export=json | -- | JSON valid V2. V3 defaults | MUST | BC | API_CONTRACT S12.1 |
| TC-V3-190 | BC: V2 Prompt | V2 prompt | buildSystemPrompt | -- | No regression | MUST | BC | SRS TC-27 |
| TC-V3-191 | BC: No Drop | After migration | Query V2 columns | SELECT | All V2 columns exist | MUST | BC | PRD P-07 |
| TC-V3-192 | BC: promptText | V2 image prompt | Read promptText | -- | Single string retained | MUST | BC | SRS TC-09 |

### 5.15 Critical Path E2E

| ID | Modul | Precondition | Langkah | Input | Expected Output | Prioritas | Level | Sitasi |
|---|---|---|---|---|---|---|---|---|
| TC-V3-193 | E2E Login | Registered | Login /login | email+password | Session set. Redirect | MUST | E2E | API_CONTRACT S2.1 |
| TC-V3-194 | E2E Generate | Logged in | Fill + Generate | title+durasi+style | LLM SSE. Results populated | MUST | E2E | SRS S3.5 |
| TC-V3-195 | E2E Scene Display | Result ready | View card | -- | 4 transition + 4 voice | MUST | E2E | UIUX_SPEC S3.2 |
| TC-V3-196 | E2E Audio CRUD | Result ready | Add audio | Fill form | 201. Toast | MUST | E2E | UIUX_SPEC S7.4 |
| TC-V3-197 | E2E Image Layer | Result ready | Expand layer | Click | Content + copy | MUST | E2E | UIUX_SPEC S3.5 |
| TC-V3-198 | E2E Theme Toggle | Result ready | Toggle light | Click | Theme switch. Persist | MUST | E2E | SRS S3.1 |
| TC-V3-199 | E2E Export JSON | Result ready | Export JSON | Click | File download. V3 fields | MUST | E2E | API_CONTRACT S6.7 |
| TC-V3-200 | E2E Export MD | Result ready | Export MD | Click | File download. 4 sections | MUST | E2E | API_CONTRACT S6.7 |
| TC-V3-201 | E2E Mobile | 375x812 | Full flow | -- | All accessible. No h-scroll | MUST | E2E | UIUX_SPEC S12.2 |
| TC-V3-202 | E2E Reduced Motion | reduced-motion | Full flow | -- | No animations | MUST | E2E | UIUX_SPEC D-07 |
| TC-V3-203 | E2E i18n EN | /en/ | Full flow | -- | All English | MUST | E2E | SRS S3.10 |
| TC-V3-204 | E2E Changelog | V2 user | View banner | -- | V3 announcement visible | SHOULD | E2E | UIUX_SPEC S3.6 |
| TC-V3-205 | E2E Undo/Redo | Edit metadata | Ctrl+Z | -- | Metadata revert | SHOULD | E2E | BRD LIM-V3-08 |

---

## 6. Pengujian Non-Fungsional

### 6.1 Performa

| ID | Kriteria | Target | Measurement | Sitasi |
|---|---|---|---|---|
| NFR-V3-P01 | Lighthouse Performance mobile | >= 85 | Lighthouse CLI mobile | PRD NFR-V3-P01 |
| NFR-V3-P02 | LCP | <= 2.5s | Lighthouse / Web Vitals | PRD NFR-V3-P02 |
| NFR-V3-P03 | CLS | <= 0.1 | Lighthouse / Web Vitals | PRD NFR-V3-P03 |
| NFR-V3-P04 | Bundle tambahan V3 | <= +20KB gzipped | next build analysis. Actual ~2KB | PRD NFR-V3-P04 |
| NFR-V3-P05 | LLM response time | <= 30s | Generation logs | SRS TC-37 |
| NFR-V3-P06 | Migration execution | <= 5s per project | Measure during backfill | SRS TC-38 |
| NFR-V3-P07 | Token usage | <= +50% baseline | tiktoken count vs V2 | SRS TC-12 |
| NFR-V3-P08 | TBT | <= 200ms | Lighthouse | SRS S8.2 |
| NFR-V3-P09 | FCP | <= 1.8s | Lighthouse | SRS S8.2 |

### 6.2 Keamanan

| ID | Kriteria | Test Method | Sitasi |
|---|---|---|---|
| NFR-V3-S01 | Schema additive only | grep DROP COLUMN. 0 for V2 | PRD NFR-V3-S01 |
| NFR-V3-S02 | Auth check audio API | No session -> 401. Other user -> 403 | CODING_RULES SEC-06 |
| NFR-V3-S03 | Ownership check | Other user -> 403/404 all CRUD | CODING_RULES SEC-07 |
| NFR-V3-S04 | No secret client | grep process.env client. NEXT_PUBLIC non-sensitive | CODING_RULES SEC-01 |
| NFR-V3-S05 | Input validation | Zod all request + LLM output | CODING_RULES SEC-04 |
| NFR-V3-S06 | SQL injection | Drizzle parameterized. No raw SQL concat | CODING_RULES SEC-05 |
| NFR-V3-S07 | XSS prevention | No dangerouslySetInnerHTML | CODING_RULES SEC-08 |
| NFR-V3-S08 | No PII analytics | Review 5 V3 event payloads | BRD NFR-S04 |
| NFR-V3-S09 | HTTPS only | Production URL check | CODING_RULES SEC-11 |
| NFR-V3-S10 | Sanitasi LLM output | Zod validated before persist | CODING_RULES SEC-12 |
| NFR-V3-S11 | Enum safety | Invalid -> reject + default | CODING_RULES SEC-13 |
| NFR-V3-S12 | Theme client only | localStorage. Server optional | CODING_RULES SEC-14 |
| NFR-V3-S13 | CASCADE delete | Hapus project/scene -> audio CASCADE | DATABASE_SCHEMA S5.2 |
| NFR-V3-S14 | Voice bias ethics | Review enum. No stereotype | SRS TC-29 |
| NFR-V3-S15 | Audio spec free | No licensed content ref | BRD LIM-V3-10 |

### 6.3 Aksesibilitas (WCAG 2.1 AA)

| ID | Kriteria | Target | Measurement | Sitasi |
|---|---|---|---|---|
| NFR-V3-A01 | WCAG compliance | 2.1 AA both theme | axe-core light + dark | PRD NFR-V3-A01 |
| NFR-V3-A02 | axe-core violations | 0 critical | @axe-core/playwright | PRD NFR-V3-A01 |
| NFR-V3-A03 | Kontras body text | >= 4.5:1 | axe-core color-contrast | PRD NFR-V3-A02 |
| NFR-V3-A04 | Kontras badge | >= 4.5:1 | Verify all V3 badges x 2 theme | UIUX_SPEC S2.4-S2.6 |
| NFR-V3-A05 | Theme toggle keyboard | Focus ring. Tab+Enter+Arrows+Escape | Playwright | UIUX_SPEC S9.2 |
| NFR-V3-A06 | Screen reader theme | ARIA aria-label | DOM match | UIUX_SPEC S9.2 |
| NFR-V3-A07 | Screen reader transition | ARIA aria-label per scene | DOM match | UIUX_SPEC S9.3 |
| NFR-V3-A08 | Screen reader voice | ARIA role=listbox | DOM match | UIUX_SPEC S9.3 |
| NFR-V3-A09 | Screen reader audio | ARIA role=region | DOM match | UIUX_SPEC S9.3 |
| NFR-V3-A10 | Focus visible | ring-2 ring-ring | All interactive | UIUX_SPEC S9.3 |
| NFR-V3-A11 | Heading hierarchy | h1->h2->h3 | axe-core heading-order | UIUX_SPEC S9.4 |
| NFR-V3-A12 | Touch targets | Min 44x44px | Visual check | UIUX_SPEC S9.6 |
| NFR-V3-A13 | Reduced motion | All FM disabled | Playwright emulation | UIUX_SPEC D-07 |
| NFR-V3-A14 | Zoom 200% | Layout intact | Manual test | UIUX_SPEC S9.6 |

### 6.4 Responsif & Visual Regression

| Viewport | Width | Height | Target | Sitasi |
|---|---|---|---|---|
| Mobile S | 375px | 812px | No h-scroll. CTA thumb-zone. Toggle icon only | UIUX_SPEC S12.2 |
| Tablet | 768px | 1024px | 2-column where appropriate | UIUX_SPEC S12.2 |
| Laptop | 1024px | 768px | Full layout | UIUX_SPEC S12.2 |
| Desktop | 1440px | 900px | Max-width 1280px | UIUX_SPEC S12.2 |

**Visual Regression Matrix (V3):**

| Component | Light + Dark | 5 Viewport | States | Total Snapshots |
|---|---|---|---|---|
| ThemeToggle | 2 | 5 | 4 | 40 |
| SceneTransitionCard | 2 | 5 | 4 | 40 |
| VoiceTypeSelector | 2 | 5 | 4 | 40 |
| AudioPanel | 2 | 5 | 4 | 50 |
| ImagePromptDisplay | 2 | 5 | 4 | 40 |
| Generate page full | 2 | 5 | 2 | 20 |
| **Total** | | | | **~230 snapshots** |

### 6.5 Reduced Motion

| ID | Test | Method | Expected | Sitasi |
|---|---|---|---|---|
| NFR-V3-RM01 | All animations disabled | Playwright emulateMedia reducedMotion | No FM anims. Content visible | UIUX_SPEC D-07 |
| NFR-V3-RM02 | Theme switch instant | Same setup + click toggle | Theme switch instant | UIUX_SPEC S10.1 |
| NFR-V3-RM03 | Audio add/edit | Same setup | Toast still shows. No slide | Manual check |
| NFR-V3-RM04 | Image layer expand | Same setup | Layer content visible | Manual check |

### 6.6 Browser & OS Compatibility

| Browser | Min Version | Status | Sitasi |
|---|---|---|---|
| Chrome | 100+ | Full support | UIUX_SPEC S12.3 |
| Firefox | 100+ | Full support | UIUX_SPEC S12.3 |
| Safari | 15+ | Full support (next-themes compatible) | UIUX_SPEC S12.3 |
| Edge | 100+ | Full support | UIUX_SPEC S12.3 |
| Mobile Chrome | 100+ | Full support | UIUX_SPEC S12.3 |
| Mobile Safari | 15+ | Full support | UIUX_SPEC S12.3 |
| Windows 10+ | -- | Full support | UIUX_SPEC S12.4 |
| macOS 12+ | -- | Full support | UIUX_SPEC S12.4 |
| iOS 15+ | -- | Full support | UIUX_SPEC S12.4 |
| Android 10+ | -- | Full support | UIUX_SPEC S12.4 |
| Linux | -- | Full support | UIUX_SPEC S12.4 |

---

## 7. Target Coverage

| Level | Target | Measurement | Cara Ukur | Sitasi |
|---|---|---|---|---|
| Unit test coverage | >= 80% | @vitest/coverage-v8 | pnpm test --coverage | SRS S8.4 |
| Integration coverage | >= 60% | @vitest/coverage-v8 | Same | SRS S8.4 |
| E2E critical path | 100% | Playwright pass rate | pnpm test:e2e | SRS S8.4 |
| Migration dry-run | 100% V2 retained | Script test | Custom runner | SRS S8.4 |
| LLM output enum valid | >= 90%/field | Analytics | Dashboard | SRS S8.4 |
| LLM audio coverage | >= 80% scenes | Analytics | Dashboard | SRS S8.4 |
| Lint | 0 error | ESLint | pnpm lint | SRS S8.5 |
| Typecheck | 0 error | TypeScript | pnpm typecheck | SRS TC-14 |
| A11y | 0 critical | axe-core | Playwright | SRS S8.3 |
| Performance | Lighthouse >= 85 | Lighthouse CI | CLI | SRS S8.2 |

### 7.1 Modul Wajib 100% Coverage

| # | Module File | Test File | Fitur |
|---|---|---|---|
| 1 | theme-toggle.tsx | theme-toggle.test.tsx | F-V3-01 |
| 2 | scene-transition-card.tsx | scene-transition-card.test.tsx | F-V3-02 |
| 3 | voice-type-selector.tsx | voice-type-selector.test.tsx | F-V3-04 |
| 4 | audio-panel.tsx | audio-panel.test.tsx | F-V3-05 |
| 5 | image-prompt-display.tsx | image-prompt-display.test.tsx | F-V3-03 |
| 6 | schemas.ts | schemas.test.ts | F-V3-08 |
| 7 | prompt-builder.ts | prompt-builder.test.ts | F-V3-07 |
| 8 | scene-audio.repository.ts | scene-audio.repository.test.ts | F-V3-05 |
| 9 | v2-to-v3.ts | v2-to-v3.test.ts | F-V3-11 |
| 10 | events.ts | events.test.ts | F-V3-12 |
| 11 | audio/route.ts | audio-route.test.ts | F-V3-05 |
| 12 | theme/route.ts | theme-route.test.ts | F-V3-01 |
| 13 | markdown.template.ts | markdown-template.test.ts | F-V3-09 |
| 14 | providers.tsx | providers.test.tsx | F-V3-01 |
| 15 | app-header.tsx | app-header.test.tsx | F-V3-01 |

### 7.2 Cara Ukur Coverage

```bash
pnpm test --coverage --reporter=text
pnpm test:e2e
pnpm lint
pnpm typecheck
npx lighthouse http://localhost:3000/id/generate --preset=perf --emulated-form-factor=mobile
pnpm tsx scripts/migrate-v2-v3.ts --dry-run
```

---

## 8. Entry & Exit Criteria

### 8.1 Per Level

| Level | Entry Criteria | Exit Criteria |
|---|---|---|
| **Unit** | next-themes terinstall. Schema extended. Mocks siap. V3 fixtures ready. | >= 80% coverage. 0 failure. 15 V3 module files punya test. |
| **Integration** | Unit tests pass. API routes extended. Test DB seeded. | >= 60% coverage. Auth+ownership+validation tested. All V3 endpoints happy+error. |
| **API/Contract** | Zod vs DB match. API_CONTRACT v3.0 final. | 100% endpoint covered. Request/response match. Enum+range valid. |
| **E2E** | pnpm dev running. Playwright configured. | 100% critical path. All 5 V3 features visible. Theme toggle. Audio CRUD. Export. |
| **Visual** | Dev server. Screenshot baseline ready. | 5 viewport x 3 theme x state. ~230 snapshots. |
| **Migration** | V2 fixtures. drizzle-kit configured. | generate success. push success. dry-run 100% retained. Rollback tested. |
| **Backward Compat** | V2 project fixtures. | V2 read/write works. V2 export valid. |
| **LLM Output** | LLM accessible. Mock fixtures. | >= 90% enum valid. >= 80% audio. Fallback works. Token <= +50%. |
| **A11y** | axe-core + Playwright. | 0 critical light+dark. WCAG 2.1 AA. |
| **Performance** | Lighthouse CLI. Dev/prod URL. | >= 85 mobile. LCP <= 2.5s. CLS <= 0.1. Bundle <= +20KB. |
| **Security** | 15 security items reviewed. | 0 violation. Auth+ownership pass. |
| **Build Quality** | Code linted. | pnpm lint 0. typecheck 0. build pass. test pass. test:e2e pass. |

### 8.2 Definition of Done (V3)

- [ ] Light theme toggle berfungsi + persist + system preference (F-V3-01, AC-V3-01)
- [ ] Hardcoded className="dark" removed dari layout.tsx:66 + page.tsx:24 (AC-V3-01)
- [ ] provider-card.tsx:88 hardcoded dark: variants removed (AC-V3-01)
- [ ] Schema migration additive: +11 fields scenes (9 core + 2 EXTENDED ASUMSI: scene_pacing, scene_mood) +5 fields image_prompts (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera) +1 projects +19 fields scene_audio table (7 core + 12 EXTENDED ASUMSI: music/sfx/ambient fields) (AC-V3-02,04,05,06)
- [ ] drizzle-kit generate + push success ke Turso staging (AC-V3-06)
- [ ] V2-to-V3 migration script: dry-run + rollback + 100% V2 retained (AC-V3-11)
- [ ] Prompt builder enhanced 5 metadata instructions (AC-V3-07)
- [ ] LLM generate 5 metadata >= 90% valid per field (AC-V3-07)
- [ ] Zod schema extended + SceneAudioSchema validated (AC-V3-08)
- [ ] UI: 4 V3 components + ThemeToggle (AC-V3-02..05)
- [ ] Audio CRUD API: 4 endpoint (AC-V3-05)
- [ ] Theme API: PATCH /api/v1/projects/[id]/theme (AC-V3-01)
- [ ] Export JSON + Markdown V3 metadata + 4 sections (AC-V3-09)
- [ ] i18n ID+EN sinkron ~60 V3 keys (AC-V3-10)
- [ ] Changelog banner V2 user (F-V3-13)
- [ ] 5 analytics event V3 wired (AC-V3-12)
- [ ] Lighthouse Performance mobile >= 85 (AC-V3-13)
- [ ] Bundle <= +20KB gzipped (AC-V3-13)
- [ ] pnpm lint 0 + typecheck 0 + build pass (AC-V3-13)
- [ ] WCAG 2.1 AA light + dark. axe-core 0 critical (AC-V3-13)
- [ ] V2 dry-run: 100% retained (AC-V3-13)
- [ ] Conventional commit feat(v3): per fitur (5 atomic) (AC-V3-13)
- [ ] PR reviewed + merged (AC-V3-13)
- [ ] Preview deploy Vercel sukses (AC-V3-13)
- [ ] Unit test coverage >= 80%
- [ ] Integration test coverage >= 60%
- [ ] E2E critical path 100% pass
- [ ] Migration dry-run + rollback tested
- [ ] Backward compat: V2 project reads V3 schema
- [ ] Visual regression: ~230 snapshot baseline saved
- [ ] All 15 security checks pass
- [ ] All 14 a11y checks pass

---

## 9. Strategi Regression, Smoke Test, Test Data Management, Bug Tracking

### 9.1 Strategi Regression

| Strategi | Detail | Sitasi |
|---|---|---|
| Full regression V3 | pnpm test --coverage + test:e2e + migration + visual + a11y setiap PR | V1 TEST_PLAN S9.1 |
| V2 regression | Jalankan V1 TEST_PLAN (83 test case) setiap PR | V1 TEST_PLAN S9.1 |
| Smoke test V3 | E2E critical path: login + generate + theme + audio CRUD + export | V1 TEST_PLAN S9.2 |
| Visual regression | Screenshot comparison per viewport x theme x state ~230 snapshots | Section 6.4 |
| i18n regression | Key sync check id.json vs en.json + V3 namespace | V1 TEST_PLAN S9.1 |
| DB regression | Migration idempotent + backward compat test | Section 5.14 |
| API regression | Contract test: API_CONTRACT v3.0 vs actual | Section 5.9 |
| LLM regression | Replay 10 calls. >= 90% enum valid | Section 5.2-5.5 |
| Bundle regression | Monitor bundle setiap PR. Alert > +20KB gzipped | NFR-V3-P04 |

### 9.2 Smoke Test Set (Sebelum Every PR)

```
1. pnpm install -> success
2. pnpm lint -> 0 error
3. pnpm typecheck -> 0 error
4. pnpm test --coverage -> >= 80%
5. pnpm test:e2e -> 100% pass
6. pnpm build -> pass
7. Lighthouse mobile -> >= 85
8. axe-core light+dark -> 0 critical
9. Migration dry-run (if schema change) -> 100% retained
10. i18n key sync -> 100% match
11. Bundle size -> <= +20KB gzipped
```

### 9.3 Test Data Management

| Aspek | Strategi | Sitasi |
|---|---|---|
| i18n messages | Fixture src/__fixtures__/v3.ts. Mock NextIntlClientProvider. | V1 TEST_PLAN S9.3 |
| V2 DB fixtures | Synthetic V2 project. Seed via seedV2Data(). Reset per test. | RAG-CONTEXT S3.1 |
| V3 DB fixtures | Synthetic V3 project. Seed via seedV3Data(). | Section 3.4 |
| LLM mock output | Fixture valid + invalid enum. Mock LLM client. | Section 3.4 |
| Auth fixtures | Synthetic user + session token via getServerSession() mock. | API_CONTRACT S2.1 |
| Design tokens | Verify computed style / snapshot dari globals.css. | CODING_RULES S12.2 |
| Analytics | Mock track() function. Spy assertion. | V1 TEST_PLAN S9.3 |
| Framer Motion | Mock motion.* -> simple div. useReducedMotion configurable. | V1 TEST_PLAN S9.3 |
| next-themes | Mock useTheme() + ThemeProvider. | SRS S3.1 |
| Test DB isolation | Each test = fresh :memory: SQLite. BeforeEach seed. | Section 3.5 |

### 9.4 Bug Tracking

| Aspek | Tool/Proses | Sitasi |
|---|---|---|
| Bug report | GitHub Issues: bug, v3, theme/transition/image/voice/audio/migration/a11y/perf | V1 TEST_PLAN S9.4 |
| Bug priority | P0 (blocking/data loss), P1 (a11y/security), P2 (visual), P3 (nice-to-have) | V1 TEST_PLAN S9.4 |
| Bug template | Steps, expected vs actual, screenshot, viewport, browser, theme | V1 TEST_PLAN S9.4 |
| Bug SLA | P0: 24h. P1: before release. P2: best-effort. P3: backlog. | V1 TEST_PLAN S9.4 |

---

## 10. Risiko Pengujian & Mitigasi

| ID | Risiko | Dampak | Kemungkinan | Mitigasi | Sitasi |
|---|---|---|---|---|---|
| R-V3-01 | next-themes FOUC | Visual flicker | Medium | Blocking script. suppressHydrationWarning. Visual test | SRS S3.1 |
| R-V3-02 | LLM inkonsisten enum | Zod fail. Fallback | Medium | safeParse + retry + default. Analytics enum rate | SRS S3.8 |
| R-V3-03 | LLM tidak generate 8-layer | Image prompt generic | Medium | Prompt enhancement + parse. >= 90% target | SRS S3.3 |
| R-V3-04 | LLM tidak generate audio | 0 audio/scene | Medium | Fallback + manual CRUD. >= 80% target | SRS S3.5 |
| R-V3-05 | Migration data loss | Backfill overwrite | Low | Additive only. DEFAULT. V2 untouched. Dry-run | PRD P-07 |
| R-V3-06 | CASCADE orphan audio | Orphan rows | Low | FK CASCADE enforced. Test cascade | DATABASE_SCHEMA S5.2 |
| R-V3-07 | Lighthouse dev vs prod | Score inaccurate | High | Test di Vercel preview | V1 TEST_PLAN R-03 |
| R-V3-08 | axe-core false positive FM | A11y fail padahal aman | Low | Review manual. White-list FM | V1 TEST_PLAN R-04 |
| R-V3-09 | i18n keys sync | Missing translation | Medium | Automated sync check di CI | V1 TEST_PLAN R-05 |
| R-V3-10 | Responsive pecah | Visual regression | Medium | Screenshot 5 viewport. Manual mobile | V1 TEST_PLAN R-06 |
| R-V3-11 | Bundle > 20KB | Perf regression | Low | Monitor next build. Target +2KB | NFR-V3-P04 |
| R-V3-12 | Token naik > 50% | LLM cost increase | Medium | Prompt optimization. tiktoken check | SRS TC-12 |
| R-V3-13 | Theme cross-device | User expect sync | Low | Client-side primary. Server sync optional | API_CONTRACT S6.3.6 |
| R-V3-14 | Audio CRUD not idempotent | Duplicate on retry | Low | Idempotency key (future V4) | API_CONTRACT S3.4 |
| R-V3-15 | Voice gender bias | Ethics issue | Low | Review prompt. No stereotype | SRS TC-29 |
| R-V3-16 | Hardcoded dark class masih ada | Theme tidak jalan | Medium | grep absent check di CI. Visual regression | SRS S3.1 |
| R-V3-17 | V2 client tidak ignore V3 | Breaking change | Low | V3 optional + default. JSON ignore unknown | API_CONTRACT S12.1 |
| R-V3-18 | LLM API rate limit E2E | Test flaky | Medium | Mock LLM for E2E. Real for 1-2 sanity | RAG-CONTEXT S5.1 |
| R-V3-19 | Playwright version mismatch | E2E flaky | Low | Pin version. Bundled Chromium | package.json:63 |
| R-V3-20 | Migration 1000+ projects | Slow production | Medium | Batch 100. Progress callback. < 5s/project | SRS TC-38 |
| R-V3-21 | Audio description bias | Inclusive issue | Low | Review 10 entries. Ethics checklist | BRD LIM-V3-11 |
| R-V3-22 | Visual regression flaky font | Screenshot diff noise | Medium | Wait document.fonts.ready | V1 TEST_PLAN R-08 |
| R-V3-23 | ThemeToggle icon mismatch | UX confusing | Low | Sun=light, Moon=dark, Monitor=system. Tested | UIUX_SPEC S3.1 |

---

## 11. Checklist Sign-off QA

### 11.1 Functional Sign-off (V3)

- [ ] F-V3-01 Light Theme: ThemeToggle visible. 3-state works. localStorage persist. System pref. No FOUC. PATCH API works.
- [ ] F-V3-02 Scene Transition: 4 field V3 per scene. 6 enum valid. Default cut/0/linear/forward. SceneTransitionCard badge + flow arrow. LLM >= 90%.
- [ ] F-V3-03 Complex Image Prompts: promptText >= 6/8 layer. 2 opsional field populated. ImagePromptDisplay 8 layer collapsible + Copy. LLM >= 90%.
- [ ] F-V3-04 Voiceover Voice Type: 4 field V3 per scene. 7 voice + 6 emotion + 3 pitch + speed 0.5-2.0. VoiceTypeSelector. LLM >= 90%.
- [ ] F-V3-05 Supporting Audio: scene_audio table. 4 CRUD API. AudioPanel CRUD dialog. LLM >= 80% scenes with audio. Volume 0-1, fade >= 0.
- [ ] F-V3-06 Schema Migration: 1 file. push success. 100% additive. DEFAULT values. CASCADE FK.
- [ ] F-V3-07 Prompt Builder: 5 instructions. LLM >= 90%/field. Token <= +50%. Fallback works.
- [ ] F-V3-08 Zod Schema: SceneSchema +11 (9 core + 2 EXTENDED ASUMSI: scene_pacing, scene_mood). SceneAudioSchema +19 (7 core + 12 EXTENDED ASUMSI: music/sfx/ambient fields). ImagePromptItemSchema +5 (2 core + 3 EXTENDED ASUMSI: composition, lighting, camera). ThemePreferenceSchema. typecheck 0.
- [ ] F-V3-09 Export: JSON V3 fields. MD 4 sections. V2 backward compat.
- [ ] F-V3-10 i18n: ~60 keys V3 ID+EN paralel.
- [ ] F-V3-11 V2 to V3: Backfill defaults. Dry-run. Rollback. Success >= 95%. 100% V2 retained.
- [ ] F-V3-12 Analytics: 5 events. No PII.
- [ ] F-V3-13 Quality Gates: 5 atomic commits. PR reviewed. Preview deploy.

### 11.2 Non-Functional Sign-off (V3)

- [ ] Light Mode: Toggle works. Persist + system. Kontras >= 4.5:1. No FOUC.
- [ ] Dark Mode: Default. Primary #a78bfa. Kontras >= 4.5:1. Force dark removed.
- [ ] Responsive: 375/768/1024/1440px no h-scroll. Toggle icon only mobile.
- [ ] prefers-reduced-motion: All FM disabled. Theme instant. CRUD still works.
- [ ] Keyboard nav: All interactive reachable. Focus ring. ThemeToggle Tab+Enter+Arrows.
- [ ] Screen reader: ARIA labels theme/transition/voice/audio. Landmarks. Heading hierarchy.
- [ ] SEO: Title <= 60. Desc <= 160. OG image. hreflang. V3 export.
- [ ] Analytics: 5 events. No PII. KPI measurable.
- [ ] Security: No secret client. Auth+ownership pass. Zod validation. SQL parameterized. HTTPS. CASCADE.
- [ ] Visual regression: ~230 snapshots baseline saved.

### 11.3 Quality Gate Sign-off (V3)

- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] pnpm test --coverage >= 80%
- [ ] pnpm test:e2e 100% pass
- [ ] pnpm test (integration) >= 60%
- [ ] Migration dry-run: 100% V2 retained
- [ ] Migration rollback: 100% reverted
- [ ] Backward compat: V2 reads V3
- [ ] Lighthouse Performance mobile >= 85
- [ ] LCP <= 2.5s
- [ ] CLS <= 0.1
- [ ] TBT <= 200ms
- [ ] FCP <= 1.8s
- [ ] Bundle <= +20KB gzipped
- [ ] axe-core: 0 critical (light + dark)
- [ ] WCAG 2.1 AA
- [ ] Kontras >= 4.5:1 both theme
- [ ] LLM >= 90% enum valid
- [ ] LLM >= 80% scenes with audio
- [ ] Token <= +50% baseline
- [ ] feat(v3): per fitur (5 atomic)
- [ ] PR reviewed + approved
- [ ] No direct push main
- [ ] Preview deploy sukses
- [ ] No any type (L-01)
- [ ] No hardcoded text (L-02)
- [ ] No hardcoded colors (L-03, L-29)
- [ ] No secret client (L-07)
- [ ] No React.FC (L-17)
- [ ] No default export (L-20)
- [ ] No AI SDK v6 (L-21, L-27)
- [ ] No drop V2 column (L-22)
- [ ] Migration has DEFAULT (L-30)
- [ ] Dry-run before production (L-31)
- [ ] LLM output valid Zod (L-32)
- [ ] API error envelope (L-33)
- [ ] i18n keys ID+EN sync (L-34)

### 11.4 Sign-off Approval

| Role | Name | Date | Status |
|---|---|---|---|
| QA Lead | | | [ ] PASS / [ ] FAIL |
| Dev Lead | | | [ ] PASS / [ ] FAIL |
| Product Owner | | | [ ] PASS / [ ] FAIL |
| Security Reviewer | | | [ ] PASS / [ ] FAIL |

---

## Lampiran A - Mapping API Endpoint ke Test Case

| API Endpoint | Method | Test Case ID | Fitur | Sitasi |
|---|---|---|---|---|
| /api/v1/projects/[id]/theme | PATCH | TC-V3-016..019 | F-V3-01 | API_CONTRACT S6.3.6 |
| /api/v1/generate | POST | TC-V3-029,035,036,046,053,065,072,073,086,087,104,193..194 | F-V3-02..05,07 | API_CONTRACT S6.4 |
| /api/v1/projects/[id]/scenes | GET | TC-V3-030,066 | F-V3-02,04 | API_CONTRACT S6.9 |
| /api/v1/projects/[id]/image-prompts | GET | TC-V3-048 | F-V3-03 | API_CONTRACT S6.10 |
| /api/v1/projects/[id]/export | GET | TC-V3-038,039,056,057,076,077,107,108,154..161,199,200 | F-V3-09 | API_CONTRACT S6.7 |
| /api/v1/projects/[id]/scenes/[sceneId]/audio | POST | TC-V3-089,093,094,095,099 | F-V3-05 | API_CONTRACT S6.13.2 |
| /api/v1/projects/[id]/scenes/[sceneId]/audio | GET | TC-V3-090 | F-V3-05 | API_CONTRACT S6.13.1 |
| /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId] | PATCH | TC-V3-091,096,100 | F-V3-05 | API_CONTRACT S6.13.3 |
| /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId] | DELETE | TC-V3-092,101 | F-V3-05 | API_CONTRACT S6.13.4 |

## Lampiran B - Dokumen Rujukan

| # | Dokumen | Path | Peran | Versi |
|---|---|---|---|---|
| 1 | PRD | product-docs/PRD.md | What - FR-V3-01..12, AC | v2.0 |
| 2 | SRS | product-docs/SRS.md | How - tech stack, spec V3 | v2.0 |
| 3 | ARCHITECTURE | product-docs/PROJECT_ARCHITECTURE.md | System design, ADR | v2.0 |
| 4 | DATABASE_SCHEMA | product-docs/DATABASE_SCHEMA.md | Table definitions, migration | v2.0 |
| 5 | UIUX_SPEC | product-docs/UIUX_SPEC.md | Design tokens, components | v2.0 |
| 6 | API_CONTRACT | product-docs/API_CONTRACT.md | 28 endpoints V3 | v3.0 |
| 7 | CODING_RULES | product-docs/CODING_RULES.md | Standards, 35 rules | v2.0 |
| 8 | RAG-CONTEXT | product-docs/RAG-CONTEXT.md | Factual evidence | refresh |
| 9 | TEST_PLAN V1 | product-docs/TEST_PLAN.md (v1) | Landing page (format ref) | v1.0 |

---

> **Dokumen ini = rencana pengujian V3 PromptFlow. Eksekutor jalankan test case sesuai prioritas MUST -> SHOULD. CI/CD jalankan smoke test setiap PR + full regression setiap release.**

**Dibuat oleh:** docgen-test-plan subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Update)
