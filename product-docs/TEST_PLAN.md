# Test Plan — PromptFlow
## Workflow Engine Otomasi Prompt Animasi AI

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `product-docs/PRD.md` + `product-docs/SRS.md` + `product-docs/API_CONTRACT.md` + `product-docs/DATABASE_SCHEMA.md` + `product-docs/PROJECT_ARCHITECTURE.md` + `product-docs/CODING_RULES.md` + `product-docs/UIUX_SPEC.md` (bersitasi per klaim penting)
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** Dokumen ini menurunkan PRD §7 (Acceptance Criteria) + SRS §11 (Verifikasi & Test, 24 test case kunci, DoD per fase) + API_CONTRACT (21 endpoint, error envelope, SSE) + CODING_RULES §7 (Vitest, Playwright, mock, coverage 80%, AAA) + DATABASE_SCHEMA (constraint, validasi, batas tokoh) + UIUX_SPEC §9 (a11y, state, flow) menjadi rencana uji siap dieksekusi agent eksekutor. Tiap fitur FR-01..FR-19 WAJIB punya test scenario. Tiap endpoint API WAJIB punya contract test. Item tanpa bukti eksplisit ditandai "ASUMSI".

---

## Daftar Isi

1. Pendahuluan
2. Strategi Pengujian Menyeluruh
3. Level Pengujian & Tujuan
4. Lingkungan & Tooling Test
5. Test Data Management
6. Matriks Fitur -> Test Scenario
7. Detail Test Case per Modul
8. Pengujian Non-Fungsional
9. Target Coverage & Cara Ukur
10. Entry & Exit Criteria + Definition of Done
11. Strategi Regression, Smoke Test, Bug Tracking
12. Risiko Pengujian & Mitigasi
13. Checklist Sign-off QA
14. Asumsi Test + Referensi

---

## 1. Pendahuluan

### 1.1 Tujuan

Test plan ini menjabarkan strategi, level, skenario, test case, lingkungan,
coverage target, entry/exit criteria, regression, risiko, dan sign-off QA
untuk PromptFlow — web app fullstack Next.js App Router otomasi susun prompt
animasi AI. Output utama = paket prompt teks terstruktur (JSON + opsi export
markdown), BUKAN file media.

Tujuan test plan:
- Verifikasi SEMUA fitur PRD (FR-01..FR-19) terpenuhi via test scenario minimal.
- Verifikasi SEMUA endpoint API_CONTRACT (21 endpoint) punya contract test.
- Verifikasi komponen/UI flow UIUX_SPEC punya test visual/interaksi/a11y.
- Verifikasi aturan CODING_RULES (Vitest, Playwright, mock, coverage 80%, AAA,
  lint, typecheck, build) tercapai.
- Verifikasi constraint DATABASE_SCHEMA (validasi Zod, batas tokoh 10, soft
  delete, enkripsi API key) teruji.
- Verifikasi NFR (performa, keamanan, a11y WCAG AA, dwibahasa) terukur.
- Siap dieksekusi agent eksekutor menjadi kode test (Vitest + Playwright).

Sitasi: `PRD.md 1.1, 1.2` ; `SRS.md 1.1, 11` ; `API_CONTRACT.md 1.1` ;
`CODING_RULES.md 7` ; `UIUX_SPEC.md 9` ; `DATABASE_SCHEMA.md 6`.

### 1.2 Lingkup Test

#### 1.2.1 In Scope

| # | Cakupan | Bukti |
|---|---|---|
| 1 | Input & generasi inti FR-01..FR-12 (judul, durasi, adegan, voiceover, image prompt per tokoh & background, karakter konsisten, pendukung, gaya+rasio, pesan moral) | `PRD.md 5 (FR-01..FR-12), 7 (AC-01..AC-12)` |
| 2 | Multi-provider setting FR-13 + enkripsi API key FR-14 | `PRD.md 5 (FR-13, FR-14), 7 (AC-13, AC-14)` |
| 3 | Save project + CRUD FR-15 | `PRD.md 5 (FR-15), 7 (AC-15)` |
| 4 | Export JSON + markdown FR-16 | `PRD.md 5 (FR-16), 7 (AC-16)` |
| 5 | Upload referensi gambar + rujuk nama file FR-17 (SHOULD) | `PRD.md 5 (FR-17), 7 (AC-17)` |
| 6 | Login NextAuth FR-18 (SHOULD) | `PRD.md 5 (FR-18), 7 (AC-18)` |
| 7 | UI dwibahasa ID+EN FR-19 (SHOULD) | `PRD.md 5 (FR-19), 7 (AC-19)` |
| 8 | Konsistensi karakter lintas adegan FR-12 | `PRD.md 5 (FR-12), 7 (AC-12)` |
| 9 | Endpoint API 21 route (REST + SSE) | `API_CONTRACT.md 5` |
| 10 | lib/ai (prompt-builder, response-parser, consistency-checker, provider-registry), lib/db repositories, lib/crypto aes, lib/validation zod, lib/export, lib/storage blob | `PROJECT_ARCHITECTURE.md 4.1, 4.2, 5` |
| 11 | UI komponen shadcn + custom (PromptCard, SceneCard, ResultTabs, ProviderConfigForm, WizardStep, DropzoneUploader, CopyButton, LanguageToggle) | `UIUX_SPEC.md 3.1, 3.2` |
| 12 | NFR performa (P1-P5), keamanan (S1-S6), a11y (A1-A3), i18n (I1-I2) | `PRD.md 6` |
| 13 | Constraint DB (validasi, batas tokoh 10, soft delete, RBAC ownership) | `DATABASE_SCHEMA.md 6, 10, 11.3` |
| 14 | Lint (ESLint 0 error), typecheck (tsc 0 error), build (next build sukses) | `CODING_RULES.md 9, SRS.md 11.1` |

#### 1.2.2 Out of Scope

| # | Out of Scope | Alasan | Bukti |
|---|---|---|---|
| OOS-T1 | Generate file media langsung | Output teks prompt | `PRD.md 9 OOS-1` |
| OOS-T2 | TTS voiceover audio | Output naskah teks | `PRD.md 9 OOS-2` |
| OOS-T3 | Integrasi langsung API image gen | User copy manual | `PRD.md 9 OOS-3` |
| OOS-T4 | Mobile native app | Web responsif dulu | `PRD.md 9 OOS-4` |
| OOS-T5 | Payment/subscription | Fase awal adoption | `PRD.md 9 OOS-5` |
| OOS-T6 | Kolaborasi real-time multi-user | Fase awal solo | `PRD.md 9 OOS-6` |
| OOS-T7 | Marketplace template | Fase akhir | `PRD.md 9 OOS-7` |
| OOS-T8 | Auto-fallback provider otomatis | Manual switch fase awal | `PRD.md 9 OOS-8` |
| OOS-T9 | Animasi/motion preview di app | Output teks | `PRD.md 9 OOS-9` |
| OOS-T10 | Template library judul (F-20 COULD) | Deferred fase 3 | `PRD.md 4 (F-20)` |
| OOS-T11 | History generasi UI (F-21 COULD) | Deferred fase 3 (endpoint logs tetap dites dasar) | `PRD.md 4 (F-21)` |
| OOS-T12 | Kolaborasi tim (F-22 COULD) | Deferred fase akhir | `PRD.md 4 (F-22)` |
| OOS-T13 | Load test skala produksi penuh | Fase awal cukup smoke perf | ASUMSI |
| OOS-T14 | Chaos/fuzz test ekstensif | Fase akhir | ASUMSI |

### 1.3 Stack Test

| Lapisan | Tool | Versi target | Bukti |
|---|---|---|---|
| Unit test | Vitest | stabil terkini per 2025 | `SRS.md 4.1, 11.1` ; `CODING_RULES.md 1.2, 7.1` |
| Integration test | Vitest + Turso test DB (atau SQLite lokal in-memory) | stabil terkini | `SRS.md 11.1` ; `CODING_RULES.md 7.1` |
| E2E test | Playwright | stabil terkini | `SRS.md 4.1, 11.1` ; `CODING_RULES.md 7.1` |
| A11y test | axe-playwright (atau @axe-core/playwright) | stabil terkini | `UIUX_SPEC.md 9.1, 9.7` ; `CODING_RULES.md 7.2` |
| Lint | ESLint + `next lint` + `@typescript-eslint` + `eslint-plugin-jsx-a11y` | stabil terkini | `CODING_RULES.md 9.1` |
| Typecheck | `tsc --noEmit` (TypeScript strict) | stabil terkini | `SRS.md 11.1` ; `CODING_RULES.md 9.5` |
| Build | `next build` | stabil terkini | `SRS.md 11.1` |
| Mock | `vi.mock` (Vitest), mock AI SDK (`ai` package), mock Drizzle, mock Vercel Blob | bawaan Vitest | `CODING_RULES.md 7.2` |
| Coverage | `@vitest/coverage-v8` (atau c8/istanbul) | stabil terkini | `CODING_RULES.md 7.2` |
| CI | GitHub Actions | n/a | `CODING_RULES.md 11.1` |

### 1.4 Asumsi Awal

| ID | Asumsi | Bukti |
|---|---|---|
| TP-A1 | Vitest + Playwright = framework test resmi proyek | `SRS.md 11.1` ; `CODING_RULES.md 1.2` |
| TP-A2 | Coverage unit target 80% line+branch | `CODING_RULES.md 7.1, 14.1 CR-A10` |
| TP-A3 | E2E critical path target 100% | `SRS.md 11.1` |
| TP-A4 | Lint 0 error + typecheck 0 error + build pass = gate CI | `SRS.md 11.1` ; `CODING_RULES.md 11.1` |
| TP-A5 | Mock LLM di unit/integration, real provider only manual/staging smoke | `CODING_RULES.md 7.2` |
| TP-A6 | Test DB = Turso lokal dev atau SQLite in-memory untuk integration | `SRS.md 11.1` ; ASUMSI |
| TP-A7 | AAA pattern wajib (Arrange-Act-Assert) | `CODING_RULES.md 7.2` |
| TP-A8 | Co-located unit test `*.test.ts`, E2E `e2e/*.spec.ts` | `CODING_RULES.md 2.1, 7.2` |
| TP-A9 | Batas tokoh 10 per project (Zod app-layer) | `DATABASE_SCHEMA.md 6.2, 12.6` ; `SRS.md 12 SRS-A10` |
| TP-A10 | Rate limit generate 10 req/min/user | `SRS.md 12 SRS-A15` ; `API_CONTRACT.md 10` |
| TP-A11 | File upload max 10MB, mime `image/*` | `CODING_RULES.md 6.1 SEC-C17, 14.1 CR-A17` |

---

## 2. Strategi Pengujian Menyeluruh

### 2.1 Test Pyramid

PromptFlow pakai test pyramid: unit terbanyak (cepat, murah) -> integration
sedikit (DB + API boundary) -> E2E paling sedikit (lambat, critical path
 saja).

```text
        /\
       /E2E\        Playwright: critical flow login->generate->save->export
      /------\      Target 100% critical path
     /Integration\  Vitest + test DB: route handlers, Server Actions, repo
    /--------------\ Target >=70% (ASUMSI)
   /     Unit       \ Vitest: lib/ai, lib/db, lib/crypto, lib/validation, lib/export
  /------------------\ Target >=80% line+branch
```

Sitasi: `CODING_RULES.md 7.1` ; `SRS.md 11.1`.

### 2.2 Shift-Left

- Test tulis bareng/sebelum kode (TDD opsional, ASUMSI best practice).
- Lint + typecheck jalan di pre-commit (husky + lint-staged, `CODING_RULES.md 9.4`).
- CI gate: PR WAJIB pass lint+typecheck+unit+build sebelum review (`CODING_RULES.md 11.1`).
- Mock LLM sejak unit agar cepat + deterministik (`CODING_RULES.md 7.2`).

### 2.3 Mocking Strategy

| Komponen | Mock di Unit | Mock di Integration | Real di E2E |
|---|---|---|---|
| AI SDK (`ai`, `@ai-sdk/openai-compatible`) | `vi.mock('ai')`, `vi.mock('@ai-sdk/openai-compatible')` return fake stream/object | Mock `generateObject`/`streamObject` return fixture PromptPackage | Mock LLM via route intercept Playwright ATAU test provider demo (ASUMSI) |
| Drizzle / `@libsql/client` | `vi.mock('@/lib/db/client')` return fake repo | Turso test DB (lokal) / SQLite in-memory | Turso staging/preview |
| Vercel Blob (`@vercel/blob`) | `vi.mock('@/lib/storage/blob')` return fake url | Mock `put`/`del` | FS `public/references/` dev (flag `USE_VERCEL_BLOB=false`) |
| NextAuth | `vi.mock('@/lib/auth/config')` return fake session | Mock `auth()` return test session | Real NextAuth credentials demo user |
| Node `crypto` | TIDAK mock (real AES) | TIDAK mock | TIDAK mock |

Sitasi: `CODING_RULES.md 7.2` ; `PROJECT_ARCHITECTURE.md 4.1, 4.2`.

### 2.4 CI Gate

GitHub Actions (`CODING_RULES.md 11.1`):
- Job `check`: lint + typecheck + unit coverage + build. WAJIB pass.
- Job `e2e`: Playwright + axe. WAJIB pass critical path. Run pada PR.
- Artifact: coverage report + Playwright trace/screenshot di-upload.

### 2.5 Pola Test Case (AAA)

Setiap test case ikut Arrange-Act-Assert (`CODING_RULES.md 7.2`):

```ts
describe('FR-01 TitleSchema', () => {
  it('menolak title < 3 char', () => {
    // Arrange
    const input = { title: 'ab', durationType: 'shorts', durationTargetSeconds: 60, styleType: '3D', aspectRatio: '16:9' };
    // Act
    const result = CreateProjectInputSchema.safeParse(input);
    // Assert
    expect(result.success).toBe(false);
  });
});
```

---

## 3. Level Pengujian & Tujuan

| Level | Tool | Tujuan | Scope | Target Coverage | Bukti |
|---|---|---|---|---|---|
| Unit | Vitest | Verifikasi logic murni terisolasi (Zod schema, AES encrypt/decrypt, prompt-builder, consistency-checker, repo query builder, markdown template) | `lib/ai/*.ts` (kecuali real LLM call), `lib/db/repositories/*.ts` (mock client), `lib/crypto/aes.ts`, `lib/validation/schemas.ts`, `lib/export/markdown.template.ts`, `lib/storage/blob.ts` (mock), util | >= 80% line+branch (ASUMSI CR-A10) | `SRS.md 11.1` ; `CODING_RULES.md 7.1` |
| Integration | Vitest + test DB | Verifikasi route handler + Server Action + DB query + middleware auth + error envelope + ownership RBAC | `src/app/api/v1/*/route.ts`, Server Actions, `lib/db/repositories` (real Drizzle + test DB), `lib/auth/middleware.ts` | >= 70% (ASUMSI) | `SRS.md 11.1` ; `CODING_RULES.md 7.1` |
| API/Contract | Vitest (supertest-style via `fetch` Next.js test server atau Playwright APIRequestContext) | Verifikasi 21 endpoint sesuai API_CONTRACT: status code, envelope, pagination, error code, SSE event | Semua endpoint `/api/v1/*` | 100% endpoint dites happy+error | `API_CONTRACT.md 5, 9` |
| E2E/UI | Playwright | Verifikasi critical user flow end-to-end via browser: login, wizard 5 step, generate (mock LLM), result tabs, export, settings CRUD, dwibahasa toggle, a11y axe | Flow: login -> new project -> generate -> save -> export; settings provider; dwibahasa | Critical path 100% | `SRS.md 11.1` ; `UIUX_SPEC.md 6` |
| UAT | Manual / stakeholder | Validasi kualitas output LLM (relevansi karakter, pesan moral positif, ekspresi voiceover sesuai judul) — manual review | Output generate sample | Stakeholder sign-off | `PRD.md 7 (AC-04, AC-05, AC-07, AC-11)` |
| Performance | Vitest benchmark + Playwright timing + manual staging | Latency generate (mock LLM) <= 60s shorts / <= 180s tutorial (NFR-P1/P2), token mulai mengalir < 10s (NFR-P3), UI load < 2s (NFR-P4), DB query < 500ms (NFR-P5) | Endpoint generate SSE, page load, DB query | Target NFR tercapai | `PRD.md 6.1` ; `SRS.md 12 SRS-A12` |
| Security | Unit + integration + audit | API key enkripsi at rest (AES-256-GCM), mask di response, RBAC ownership, input validation Zod, secret tidak di client bundle, rate limit, file upload mime+size, dependency audit | `lib/crypto/aes.ts`, response provider config, query project filter `user_id`, `next build` bundle inspect, middleware rate limit, `/api/v1/upload` | 0 kebocoran secret, 0 auth bypass | `PRD.md 6.2` ; `CODING_RULES.md 6` |
| Accessibility | axe-playwright + manual audit | WCAG 2.1 AA: kontras 4.5:1, keyboard nav, focus visible, ARIA, skip link, reduce motion | Halaman login, dashboard, wizard, result, settings | 0 violation AA | `UIUX_SPEC.md 9.1, 9.7` ; `PRD.md 6.6` |
| Compatibility | Playwright multi-browser | Chrome 120+, Edge 120+, Firefox 120+, Safari 17+, Mobile Safari iOS 17+, Chrome Android 120+ | Critical flow di multi browser | Pass critical flow di semua target | `UIUX_SPEC.md 12.3` |

Sitasi: `SRS.md 11.1` ; `CODING_RULES.md 7.1` ; `API_CONTRACT.md 5` ;
`UIUX_SPEC.md 9, 12.3`.

---
## 4. Lingkungan & Tooling Test

### 4.1 Tabel Lingkungan

| Env | Tujuan | DB | Storage | LLM | Env Vars | Bukti |
|---|---|---|---|---|---|---|
| Local Dev | Developer jalankan app + unit/integration test | SQLite in-memory / Turso lokal dev | FS `public/references/` (flag `USE_VERCEL_BLOB=false`) | Mock (`vi.mock('ai')`) atau 9router `http://localhost:20128/v1` (ASUMSI SRS-A7) | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (opsional bila pakai Turso lokal), `ENCRYPTION_KEY` (32 byte base64 test), `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `USE_VERCEL_BLOB=false` | `SRS.md 8.2, 8.5` ; `CODING_RULES.md 11.1` |
| CI (GitHub Actions) | Lint + typecheck + unit coverage + build + e2e (ubuntu-latest, Node 20) | Turso test DB (separate DB, reset per run) ATAU SQLite in-memory | Mock Blob | Mock LLM (`vi.mock`), e2e route intercept | sama local + `CI=true` | `CODING_RULES.md 11.1` |
| Staging (Vercel preview) | PR preview, smoke manual + perf | Turso staging branch | Vercel Blob staging | Mock LLM route intercept ATAU demo provider (Ollama cloud / OpenRouter test key) | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL` | `PROJECT_ARCHITECTURE.md 8` ; `CODING_RULES.md 11.2` |
| Prod (Vercel) | Live user | Turso prod | Vercel Blob prod | Real provider user (Ollama cloud/OpenRouter/custom) | semua prod env | `PROJECT_ARCHITECTURE.md 8` |

### 4.2 Env Vars Test

| Env | Wajib test | Catatan | Bukti |
|---|---|---|---|
| `ENCRYPTION_KEY` | YA (32 byte base64) | Test key: `Buffer.alloc(32, 1).toString('base64')` (`CODING_RULES.md 7.3`) | `SRS.md 8.4` ; `DATABASE_SCHEMA.md 11.4` |
| `TURSO_DATABASE_URL` | YA integration (bila pakai Turso test) | Test DB terpisah dari prod | `SRS.md 8.2` |
| `TURSO_AUTH_TOKEN` | YA integration | Test token scoped test DB | `SRS.md 8.2` |
| `NEXTAUTH_SECRET` | YA integration/e2e | Test secret | `SRS.md 9.1 SEC-12` |
| `BLOB_READ_WRITE_TOKEN` | Opsional (mock Blob default) | Bila integration real upload | `SRS.md 8.5` |
| `USE_VERCEL_BLOB` | `false` di local/e2e | FS fallback | ASUMSI SRS-A17 |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` test | Provider header OpenRouter | `PROJECT_ARCHITECTURE.md 7.1` |

### 4.3 Konfigurasi Tooling

#### 4.3.1 `vitest.config.ts` (ASUMSI)

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node', // lib server
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'junit'],
      include: ['src/lib/**', 'src/app/api/**'],
      exclude: ['**/*.test.ts', 'src/components/ui/**'], // shadcn skip
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

#### 4.3.2 `playwright.config.ts` (ASUMSI)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000, // generate SSE mock butuh waktu
  expect: { timeout: 60000 }, // result tabs tampil < 60s
  fullyParallel: false, // sequential hindari rate limit mock
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
```

#### 4.3.3 Script package.json (ASUMSI, sesuai CODING_RULES §11.1)

```json
{
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run",
    "test:integration": "vitest run --dir src/app/api",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "build": "next build",
    "ci:check": "npm run typecheck && npm run lint && npm run test:coverage && npm run build",
    "ci:all": "npm run ci:check && npm run test:e2e"
  }
}
```

### 4.4 Test Management Folder

```text
PromptFlow/
  tests/
    setup.ts              # global setup Vitest (env, mock, factory init)
    helpers/
      factories.ts         # factory function test data
      fixtures.ts          # fixture PromptPackage JSON, fixture gambar
      sse-mock.ts          # helper mock SSE stream
      db-helpers.ts        # test DB init/reset, seed
  e2e/
    generate-shorts.spec.ts
    generate-tutorial.spec.ts
    export-json.spec.ts
    export-markdown.spec.ts
    settings-provider.spec.ts
    upload-reference.spec.ts
    login.spec.ts
    dwibahasa.spec.ts
    a11y.spec.ts
  src/
    lib/
      crypto/aes.test.ts
      validation/schemas.test.ts
      ai/
        prompt-builder.test.ts
        response-parser.test.ts
        consistency-checker.test.ts
        provider-registry.test.ts
      db/
        repositories/
          project.repo.test.ts
          provider-config.repo.test.ts
          character.repo.test.ts
          scene.repo.test.ts
          image-prompt.repo.test.ts
          asset-reference.repo.test.ts
          generation-log.repo.test.ts
          supporting-character.repo.test.ts
      export/markdown.template.test.ts
      storage/blob.test.ts
    app/
      api/v1/
        projects/route.test.ts
        projects/[id]/route.test.ts
        generate/route.test.ts
        settings/providers/route.test.ts
        settings/providers/[id]/route.test.ts
        settings/providers/[id]/test/route.test.ts
        upload/route.test.ts
        projects/[id]/export/route.test.ts
        projects/[id]/characters/route.test.ts
        projects/[id]/scenes/route.test.ts
        projects/[id]/image-prompts/route.test.ts
        projects/[id]/logs/route.test.ts
        health/route.test.ts
        auth/session.test.ts
    components/
      generate/prompt-card.test.tsx
      generate/scene-card.test.tsx
      generate/result-tabs.test.tsx
      settings/provider-config-form.test.tsx
      common/copy-button.test.tsx
      common/language-toggle.test.tsx
  playwright-report/       # output HTML
  test-results/            # output junit + trace
  coverage/                # output coverage
```

Sitasi: `CODING_RULES.md 2.1, 7.2` ; `SRS.md 11.1` (ASUMSI struktur).

### 4.5 Report & Artifact

| Output | Format | Tujuan | Bukti |
|---|---|---|---|
| Coverage report | HTML + JSON + JUnit | CI artifact, lintas gate 80% | `CODING_RULES.md 7.2` |
| Playwright report | HTML + JUnit XML | CI artifact, debug failure | `CODING_RULES.md 11.1` |
| Playwright trace | ZIP | Debug retry | ASUMSI |
| Screenshot/video | PNG/WebM | Bukti pass/fail | ASUMSI |
| Vercel build log | text | Debug build fail | `CODING_RULES.md 11.2` |

---

## 5. Test Data Management

### 5.1 Factory Functions

Factory di `tests/helpers/factories.ts` (ASUMSI, `CODING_RULES.md 7.2` test
data factory). Tiap factory return data realistis sesuai DATABASE_SCHEMA field.

```ts
// tests/helpers/factories.ts (ASUMSI contoh)
export function makeUser(overrides = {}) {
  return { id: 1, email: 'demo@promptflow.local', name: 'Demo User',
    passwordHash: '$2a$10$...', role: 'user', createdAt: 1718803200, updatedAt: 1718803200,
    ...overrides };
}

export function makeProviderConfig(overrides = {}) {
  return { id: 7, userId: 1, provider: 'openrouter', name: 'OpenRouter Utama',
    baseUrl: 'https://openrouter.ai/api/v1', model: 'anthropic/claude-3.5-sonnet',
    apiKeyEncrypted: { iv: '...', ciphertext: '...', tag: '...' },
    isActive: 1, createdAt: 1718803200, updatedAt: 1718803200, ...overrides };
}

export function makeProject(overrides = {}) {
  return { id: 42, userId: 1, title: 'Petualangan Hutan Anak',
    durationType: 'shorts', durationTargetSeconds: 60, styleType: '3D',
    aspectRatio: '16:9', resultJson: null, status: 'draft',
    createdAt: 1718803200, updatedAt: 1718803200, deletedAt: null, ...overrides };
}

export function makeCharacter(overrides = {}) {
  return { id: 1, projectId: 42, nama: 'Hero', gayarambut: 'hitam pendek',
    wajahAsal: 'Indonesia, wajah bulat', pakaianAtas: 'kaos hijau',
    pakaianBawah: 'celana jean', alasKaki: 'sepatu kets',
    deskripsiLatar: 'pemuda desa', aksi: 'berdiri tersenyum',
    peran: 'utama', createdAt: 1718803200, ...overrides };
}

export function makeScene(overrides = {}) {
  return { id: 1, projectId: 42, orderNo: 1,
    description: 'Hero masuk hutan', voiceoverScript: 'Di sebuah hutan...',
    createdAt: 1718803200, ...overrides };
}

export function makeImagePrompt(overrides = {}) {
  return { id: 1, projectId: 42, sceneId: null, tipe: 'tokoh', target: 'Hero',
    promptText: '3D render young boy, black short hair, Indonesia face...',
    referenceFilename: null, createdAt: 1718803200, ...overrides };
}

export function makeAssetReference(overrides = {}) {
  return { id: 99, projectId: 42, tipe: 'tokoh', filename: 'hero-ref.png',
    blobUrl: 'https://...vercel-storage.com/hero-ref.png', label: 'Hero',
    mimeType: 'image/png', sizeBytes: 102400, createdAt: 1718803200, ...overrides };
}

export function makeGenerationLog(overrides = {}) {
  return { id: 101, projectId: 42, provider: 'openrouter',
    model: 'anthropic/claude-3.5-sonnet', durationMs: 12000, status: 'success',
    errorMessage: null, createdAt: 1718803200, ...overrides };
}

export function makeSupportingCharacter(overrides = {}) {
  return { id: 1, projectId: 42, sceneId: 1, nama: 'Kancil', tipe: 'hewan',
    aksi: 'melompat', createdAt: 1718803200, ...overrides };
}
```

### 5.2 Fixture PromptPackage JSON

Mock LLM output valid sesuai `PromptPackageSchema` (`API_CONTRACT.md 8.4`,
`PRD.md 8.2`) di `tests/helpers/fixtures.ts`:

```ts
export const fixturePromptPackageShorts = {
  title: 'Petualangan Hutan Anak',
  duration_target: { type: 'shorts', seconds: 60 },
  style: { type: '3D', aspect_ratio: '16:9' },
  character_profiles: [
    { nama: 'Hero', gayarambut: 'hitam pendek', wajah_asal: 'Indonesia, wajah bulat',
      pakaian_atas: 'kaos hijau', pakaian_bawah: 'celana jean', alas_kaki: 'sepatu kets',
      deskripsi_latar: 'pemuda desa', aksi: 'berdiri tersenyum', peran: 'utama' },
  ],
  scenes: [
    { order: 1, description: 'Hero masuk hutan', voiceover_script: 'Di sebuah hutan...',
      image_prompts: { characters: [{ target: 'Hero', prompt_text: '...', reference_filename: null }],
        backgrounds: [{ target: 'Hutan', prompt_text: '...', reference_filename: null }] } },
  ],
  image_prompts: { characters: [{ target: 'Hero', prompt_text: '...', reference_filename: null }],
    backgrounds: [{ target: 'Hutan', prompt_text: '...', reference_filename: null }] },
  supporting_characters: [{ nama: 'Kancil', tipe: 'hewan', aksi: 'melompat' }],
  moral_message: 'Jaga alam, anak.',
};

export const fixturePromptPackageTutorial = { /* durasi 480s, 8-20 scenes ASUMSI SRS-A11 */ };
export const fixturePromptPackageWithRef = { /* reference_filename terisi */ };
export const fixturePromptPackageInvalid = { /* missing moral_message, dll */ };
export const fixtureConsistencyMismatch = { /* character_profiles Hero beda rambut di scenes[1] */ };
```

### 5.3 Fixture Gambar

Fixture gambar upload di `tests/fixtures/`:
- `hero-ref.png` (valid image/png, ~100KB)
- `hutan-bg.jpg` (valid image/jpeg)
- `invalid.txt` (mime invalid untuk test rejection)
- `oversize.bin` (11MB, > 10MB max ASUMSI CR-A17)

### 5.4 Test DB Preparation

Integration test pakai test DB terpisah (`SRS.md 11.1`):

```ts
// tests/helpers/db-helpers.ts (ASUMSI)
import { db } from '@/lib/db/client';
import { users, projects, ... } from '@/lib/db/schema';

export async function resetTestDB() {
  // Hapus semua data, urutan reverse dependency
  await db.delete(supportingCharacters);
  await db.delete(generationLogs);
  await db.delete(imagePrompts);
  await db.delete(scenes);
  await db.delete(characters);
  await db.delete(assetReferences);
  await db.delete(projects);
  await db.delete(providerConfigs);
  await db.delete(users);
}

export async function seedTestUser() {
  const [u] = await db.insert(users).values(makeUser()).returning();
  return u;
}
```

Pola: `beforeEach(() => resetTestDB())` (`CODING_RULES.md 7.2`).

### 5.5 Sanitasi Data Test

- TIDAK pernah pakai data prod di test.
- API key test = dummy (`sk-test-xxxxx`), bukan key real.
- ENCRYPTION_KEY test = `Buffer.alloc(32, 1)`, bukan prod key.
- User demo seed (`demo@promptflow.local` / `demo123`) HANYA untuk e2e dev, tidak prod (`DATABASE_SCHEMA.md 9.2`).

---
## 6. Matriks Fitur -> Test Scenario

Tiap fitur PRD (FR-01..FR-19) + acceptance criteria-nya WAJIB punya minimal 1
test scenario (happy path + edge case). Sitasi: `PRD.md 7 (AC-01..AC-19)`.

| FR | AC | Test Scenario (happy) | Test Scenario (edge case) | Level | Relasi Endpoint |
|---|---|---|---|---|---|
| FR-01 Input judul | AC-01 | Input title valid (3-200 char) -> tersimpan + di-inject prompt | Empty -> 400; <3 char -> 400; >200 -> 400; whitespace only -> 400; XSS `<script>` -> escaped | Unit (Zod) + E2E | POST /api/v1/projects, POST /api/v1/generate |
| FR-02 Input durasi | AC-02 | duration_type shorts/tutorial + target_seconds valid -> tersimpan | shorts >180s -> 422; tutorial di luar 420-900 -> warning (boleh proceed); duration_type invalid -> 400 | Unit + Integration + E2E | POST /api/v1/projects, POST /api/v1/generate |
| FR-03/09 Adegan urut | AC-03/09 | scenes[] ter-generate order 1..N, description non-kosong, jumlah sesuai durasi (shorts 3-6, tutorial 8-20 ASUMSI SRS-A11) | scenes kosong -> error; order duplikat -> 400; jumlah di luar range -> warning | Integration (mock LLM) + E2E | POST /api/v1/generate (SSE) |
| FR-04 Voiceover | AC-04 | tiap scene voiceover_script teks non-kosong | voiceover_script kosong -> Zod fail; tipe bukan string -> fail | Integration | POST /api/v1/generate |
| FR-05 Auto karakter/bg | AC-05 | tanpa referensi -> character_profiles[] + image_prompts.backgrounds[] terisi | reference_images kosong -> branch invent; ada referensi -> pakai ref | Integration | POST /api/v1/generate |
| FR-06 Image prompt per tokoh/bg | AC-06 | image_prompts.characters[] = N untuk N tokoh; backgrounds[] = M untuk M tempat; prompt_text detail | tokoh count mismatch -> warning; prompt_text kosong -> fail | Integration | POST /api/v1/generate |
| FR-07 Tokoh terstruktur | AC-07 | tiap karakter field lengkap (nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran) | field hilang -> Zod fail; peran invalid enum -> fail | Integration (Zod parse) | POST /api/v1/generate |
| FR-08 Karakter pendukung | AC-08 | supporting_characters[] terisi bila ada, tiap aksi non-kosong | tipe invalid (bukan pendukung/hewan) -> fail | Integration | POST /api/v1/generate |
| FR-10 Gaya+rasio | AC-10 | style (3D/2D) + aspect_ratio muncul di root JSON + di-inject image prompts | style invalid -> fail; aspect_ratio custom valid | Unit + Integration | POST /api/v1/generate |
| FR-11 Pesan moral | AC-11 | moral_message non-kosong di akhir paket, positif | moral_message kosong -> fail | Integration + manual review | POST /api/v1/generate |
| FR-12 Konsistensi karakter | AC-12 | identitas (nama, rambut, wajah, pakaian, alas_kaki) SAMA di character_profiles & scenes[]; aksi/latar boleh beda | mismatch identitas -> warning (tidak block save) | Unit (consistency-checker) + Integration | POST /api/v1/generate (event done warnings) |
| FR-13 Multi-provider | AC-13 | form provider select + base URL pre-fill + model + API key save; provider aktif dipakai generate; gagal -> error + opsi switch | provider invalid -> 400; base URL non-URL -> 400; duplikat nama -> 409 | Unit + Integration + E2E | GET/POST /api/v1/settings/providers, PATCH/DELETE /api/v1/settings/providers/[id], POST /api/v1/settings/providers/[id]/test |
| FR-14 Enkripsi API key | AC-14 | API key encrypt di DB (bukan plaintext); response mask `****`; decrypt server-only | plaintext bocor di response -> fail; decrypt di client -> fail (server-only) | Unit (crypto) + Integration + Security audit | POST /api/v1/settings/providers, GET /api/v1/settings/providers |
| FR-15 Save + CRUD project | AC-15 | create project; list paginate per user; detail ownership check; update metadata; delete soft + cascade | project milik user lain -> 403; id tidak ada -> 404; soft delete hilang dari list | Integration + E2E | GET/POST /api/v1/projects, GET/PATCH/DELETE /api/v1/projects/[id] |
| FR-16 Export | AC-16 | export JSON valid struktur (PRD 8.2); export markdown terbaca lengkap (PRD 8.3) | format invalid -> 400; project belum generate -> 409/404 | Integration + E2E | GET /api/v1/projects/[id]/export?format=json\|markdown |
| FR-17 Upload referensi | AC-17 | upload multipart (tokoh/background) -> metadata AssetReference + reference_filename muncul di image_prompts; tanpa referensi -> null, fitur tetap jalan | mime invalid -> 400; size >10MB -> 400; project bukan milik user -> 403 | Integration + E2E | POST /api/v1/upload, DELETE /api/v1/upload |
| FR-18 Login | AC-18 | NextAuth login berfungsi; protected routes redirect ke login bila unauth; project & setting scoped per user | unauth akses /projects -> redirect /login; wrong password -> 401; session expired -> redirect | E2E + Integration | POST /api/v1/auth/[...nextauth], GET /api/v1/auth/session |
| FR-19 Dwibahasa | AC-19 | toggle ID/EN mengubah UI label; pesan error bahasa aktif | key hilang di salah satu locale -> unit test fail; konten LLM ikut judul (bukan locale UI) | Unit (i18n key) + E2E | n/a (UI) |

### 6.1 Matriks Endpoint -> Contract Test

Tiap endpoint API_CONTRACT (21 route) WAJIB punya contract test happy + error.
Sitasi: `API_CONTRACT.md 5, 9`.

| # | Endpoint | Method | Contract Test Happy | Contract Test Error | Bukti |
|---|---|---|---|---|---|
| 1 | /api/v1/auth/[...nextauth] | GET/POST | login valid -> set cookie session | wrong credential -> 401 | `API_CONTRACT.md 6.1.1` |
| 2 | /api/v1/auth/session | GET | authed -> return user; unauth -> null | (tidak ada error, return null) | `API_CONTRACT.md 6.1.2` |
| 3 | /api/v1/health | GET | DB ok -> 200 status ok | DB down -> 503 degraded | `API_CONTRACT.md 6.2.1` |
| 4 | /api/v1/projects | GET | authed + ada data -> 200 paginated | unauth -> 401; invalid page/limit -> 400 | `API_CONTRACT.md 6.3.1` |
| 5 | /api/v1/projects | POST | valid input -> 201 ProjectDTO | invalid Zod -> 400; shorts >180 -> 422; unauth -> 401 | `API_CONTRACT.md 6.3.2` |
| 6 | /api/v1/projects/[id] | GET | milik user -> 200 detail | milik user lain -> 403; tidak ada -> 404; unauth -> 401 | `API_CONTRACT.md 6.3.3` |
| 7 | /api/v1/projects/[id] | PATCH | valid update -> 200 | milik lain -> 403; tidak ada -> 404; invalid -> 400 | `API_CONTRACT.md 6.3.4` |
| 8 | /api/v1/projects/[id] | DELETE | soft delete -> 204 | milik lain -> 403; tidak ada -> 404 | `API_CONTRACT.md 6.3.5` |
| 9 | /api/v1/generate | POST | valid + provider aktif -> SSE stream progress+done | invalid Zod -> 400; unauth -> 401; projectId bukan milik -> 409; shorts >180 -> 422; rate limit -> 429; provider error -> 502 SSE error; timeout -> 504 | `API_CONTRACT.md 6.4, 7` |
| 10 | /api/v1/settings/providers | GET | authed -> 200 list (apiKeyMasked) | unauth -> 401 | `API_CONTRACT.md 6.5.1` |
| 11 | /api/v1/settings/providers | POST | valid -> 201 (masked) | duplikat nama -> 409; invalid -> 400; unauth -> 401 | `API_CONTRACT.md 6.5.2` |
| 12 | /api/v1/settings/providers/[id] | PATCH | valid update -> 200 (apiKey opsional tidak overwrite) | milik lain -> 403; tidak ada -> 404; duplikat -> 409 | `API_CONTRACT.md 6.5.3` |
| 13 | /api/v1/settings/providers/[id] | DELETE | hapus -> 204 | milik lain -> 403; tidak ada -> 404 | `API_CONTRACT.md 6.5.4` |
| 14 | /api/v1/settings/providers/[id]/test | POST | provider reachable -> 200 {ok, latencyMs, sample} | provider gagal -> 502; milik lain -> 403 | `API_CONTRACT.md 6.5.5` |
| 15 | /api/v1/upload | POST | multipart valid -> 201 AssetReference | mime invalid -> 400; size >10MB -> 400; project bukan milik -> 403; unauth -> 401 | `API_CONTRACT.md 6.6.1` |
| 16 | /api/v1/upload | DELETE | hapus by name+projectId -> 204 | tidak ada -> 404; bukan milik -> 403 | `API_CONTRACT.md 6.6.2` |
| 17 | /api/v1/projects/[id]/export | GET | format=json -> 200 application/json attachment; format=markdown -> 200 text/markdown | format invalid -> 400; project belum generate -> 409; bukan milik -> 403 | `API_CONTRACT.md 6.7` |
| 18 | /api/v1/projects/[id]/characters | GET | milik user -> 200 list; filter peran | bukan milik -> 403 | `API_CONTRACT.md 6.8.1` |
| 19 | /api/v1/projects/[id]/scenes | GET | milik user -> 200 list urut orderNo | bukan milik -> 403 | `API_CONTRACT.md 6.8.2` |
| 20 | /api/v1/projects/[id]/image-prompts | GET | milik user -> 200 list; filter tipe/sceneId | bukan milik -> 403 | `API_CONTRACT.md 6.8.3` |
| 21 | /api/v1/projects/[id]/logs | GET | milik user -> 200 paginated; filter status | bukan milik -> 403 | `API_CONTRACT.md 6.8.4` |

### 6.2 Matriks Komponen UI -> Test Visual/Interaksi

Tiap komponen/user flow UIUX_SPEC WAJIB punya test visual/interaksi bila ada
UI. Sitasi: `UIUX_SPEC.md 3.2, 6`.

| Komponen | Lokasi | Test Visual/Interaksi | A11y Test | Bukti |
|---|---|---|---|---|
| PromptCard | `components/projects/` | render title+meta+status badge; click open; click delete confirm | aria-label delete | `UIUX_SPEC.md 3.2, 7.3` |
| SceneCard | `components/generate/` | Collapsible expand/collapse; render order badge + description + voiceover; streaming state | aria-expanded | `UIUX_SPEC.md 3.2, 7.5` |
| CharacterCard | `components/generate/` | render grid field; peran badge; streaming skeleton | aria-label peran | `UIUX_SPEC.md 3.2, 7.5` |
| ImagePromptList | `components/generate/` | list item target+badge+prompt_text mono+reference_filename+copy; copied state | aria-label copy | `UIUX_SPEC.md 3.2` |
| ProviderConfigForm | `components/settings/` | form provider+baseUrl+model+apiKey mask+isActive switch; submit; error inline; mode edit apiKey pre-masked | label htmlFor, aria-invalid | `UIUX_SPEC.md 3.2, 7.6` |
| WizardStep | `components/generate/` | stepper header 5 step; nav Back/Next; step active/inactive/done; Generate button | aria-current step | `UIUX_SPEC.md 3.2, 7.4` |
| ResultTabs | `components/generate/` | tabs Adegan/Voiceover/Karakter/Image Prompts/Pesan Moral; switch; streaming partial; export menu; re-generate | aria-selected, aria-live streaming | `UIUX_SPEC.md 3.2, 7.5` |
| DropzoneUploader | `components/generate/` | drag-drop; file list thumb+filename+tipe select+remove; idle/drag/uploading/error state | role button, aria-label | `UIUX_SPEC.md 3.2, 7.4 step 3` |
| CopyButton | `components/common/` | click copy -> toast "Tersalin"; icon swap; size variant | aria-label | `UIUX_SPEC.md 3.2` |
| ExportMenu | `components/generate/` | dropdown JSON/Markdown; trigger download | aria-expanded | `UIUX_SPEC.md 3.2, 6.3` |
| GenerateProgress | `components/generate/` | progress bar + status text per stage (character_profiles, scenes, image_prompts, moral); skeleton | role status, aria-live | `UIUX_SPEC.md 3.2, 10.3` |
| EmptyState | `components/common/` | render icon+title+desc+CTA | — | `UIUX_SPEC.md 3.2, 10.4` |
| ErrorBoundary | `components/common/` | fallback UI render; retry | — | `UIUX_SPEC.md 3.2, 10.5` |
| LanguageToggle | `components/common/` | toggle ID/EN; persist cookie; UI label change | aria-label | `UIUX_SPEC.md 3.2, 1.3` |
| ThemeToggle | `components/common/` | switch light/dark; persist cookie | aria-label | `UIUX_SPEC.md 3.2` |
| AppHeader | `components/common/` | nav links; auth/unauth state; mobile hamburger; LanguageToggle+ThemeToggle inline | nav landmark, skip link | `UIUX_SPEC.md 3.2, 5.1` |

---
## 7. Detail Test Case per Modul

Format tabel: ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail Criteria | Prioritas | Level | Relasi Endpoint/AP.

> Total **48 test case** (melampaui minimum 30). Tiap test case actionable —
> agent eksekutor bisa langsung jadikan kode test (Vitest/Playwright).
> Sitasi per kelompok modul.

### 7.1 Modul Validasi (lib/validation/schemas.ts) — Unit

Sitasi: `SRS.md 5 (FR-01, FR-02, FR-10), 8.7` ; `API_CONTRACT.md 8` ;
`DATABASE_SCHEMA.md 6.2`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-001 | ENCRYPTION_KEY set | Parse CreateProjectInputSchema | `{title:"ab",durationType:"shorts",durationTargetSeconds:60,styleType:"3D",aspectRatio:"16:9"}` | safeParse fail (title <3) | success===false | high | Unit | POST /api/v1/projects |
| TC-002 | — | Parse CreateProjectInputSchema | `{title:"x".repeat(201),...}` | fail (title >200) | success===false | high | Unit | POST /api/v1/projects |
| TC-003 | — | Parse CreateProjectInputSchema | `{title:"  ",...}` | fail (empty after trim) | success===false | high | Unit | POST /api/v1/projects |
| TC-004 | — | Parse CreateProjectInputSchema | `{title:"Valid",durationType:"shorts",durationTargetSeconds:250,...}` | fail (shorts >180, 422) | success===false | high | Unit | POST /api/v1/projects |
| TC-005 | — | Parse CreateProjectInputSchema | `{title:"Valid",durationType:"tutorial",durationTargetSeconds:300,...}` | pass (tutorial <420 warning, boleh proceed) | success===true | high | Unit | POST /api/v1/projects |
| TC-006 | — | Parse CreateProjectInputSchema | `{durationType:"invalid",...}` | fail (enum) | success===false | high | Unit | POST /api/v1/projects |
| TC-007 | — | Parse CreateProjectInputSchema | `{styleType:"4D",...}` | fail (enum 3D/2D) | success===false | high | Unit | POST /api/v1/projects |
| TC-008 | — | Parse PromptPackageSchema (LLM output) | fixturePromptPackageShorts | pass | success===true | high | Unit | POST /api/v1/generate |
| TC-009 | — | Parse PromptPackageSchema | fixturePromptPackageInvalid (moral_message hilang) | fail | success===false | high | Unit | POST /api/v1/generate |
| TC-010 | — | Parse ProviderConfigSchema | `{provider:"ollama",name:"x",baseUrl:"not-url",model:"m",apiKey:"k"}` | fail (baseUrl non-URL) | success===false | high | Unit | POST /api/v1/settings/providers |
| TC-011 | — | Parse ProviderConfigSchema | `{provider:"invalid",...}` | fail (enum) | success===false | high | Unit | POST /api/v1/settings/providers |

### 7.2 Modul Crypto (lib/crypto/aes.ts) — Unit + Security

Sitasi: `SRS.md 5 (FR-14), 9.1 SEC-01/SEC-02` ; `DATABASE_SCHEMA.md 11.1, 11.2`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-012 | ENCRYPTION_KEY 32 byte | encrypt(plaintext) lalu decrypt | `"sk-or-v1-xxxxx"` | decrypt(encrypt(x))===x; ciphertext !== plaintext | roundtrip ok, ciphertext != plaintext | critical | Unit+Security | POST /api/v1/settings/providers |
| TC-013 | — | mask(key) | `"sk-or-v1-abcde"` | `"****bcde"` | mask === `****bcde` | high | Unit | GET /api/v1/settings/providers |
| TC-014 | — | mask(key pendek) | `"ab"` | `"****"` | mask === `****` | medium | Unit | GET /api/v1/settings/providers |
| TC-015 | — | Cek ciphertext di DB BUKAN plaintext | save provider lalu query DB | api_key_encrypted JSON {iv,ciphertext,tag}, TIDAK ada plaintext | plaintext tidak ditemukan di DB | critical | Integration+Security | POST /api/v1/settings/providers |
| TC-016 | — | Cek response provider config TIDAK expose key | GET /api/v1/settings/providers | apiKeyMasked `****xxxx`, TIDAK ada apiKeyEncrypted/apiKey plaintext | response tidak ada plaintext/ciphertext | critical | Integration+Security | GET /api/v1/settings/providers |
| TC-017 | `import 'server-only'` di aes.ts | Import aes dari Client Component (simulasi) | — | Build/runtime error (server-only guard) | import client gagal | critical | Security build audit | — |

### 7.3 Modul AI (lib/ai/) — Unit

Sitasi: `SRS.md 5 (FR-03..FR-12), 8.7` ; `PROJECT_ARCHITECTURE.md 4.1`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-018 | mock AI SDK | prompt-builder assemble system prompt | input {title,duration,style,refs} | system prompt string mengandung title, duration target, style, aspect_ratio, reference_filename bila ada | prompt mengandung parameter | high | Unit | POST /api/v1/generate |
| TC-019 | mock generateObject return fixture | response-parser.parse(raw) | fixturePromptPackageShorts | parsed valid PromptPackage | success===true | high | Unit | POST /api/v1/generate |
| TC-020 | mock streamText return invalid JSON | response-parser fallback parse | `"{invalid"` | error fallback, return error code | parse throws | high | Unit | POST /api/v1/generate |
| TC-021 | — | consistency-checker(package) | fixtureConsistencyMismatch (Hero rambut beda di scenes[1]) | warnings[] berisi {code:CONSISTENCY_MISMATCH, target:Hero} | warnings tidak kosong, tidak throw | high | Unit | POST /api/v1/generate event done warnings |
| TC-022 | — | consistency-checker(package) | fixturePromptPackageShorts (konsisten) | warnings[] kosong | warnings.length===0 | medium | Unit | POST /api/v1/generate |
| TC-023 | mock decrypt | provider-registry.buildProvider | cfg {provider:"openrouter",baseUrl,model,apiKeyEncrypted} | createOpenAICompatible dipanggil dengan header HTTP-Referer + X-OpenRouter-Title | header OpenRouter ter-set | high | Unit | POST /api/v1/generate |
| TC-024 | mock decrypt | provider-registry.buildProvider | cfg {provider:"9router",baseUrl:"http://localhost:20128/v1",...} | provider instance; validasi: bila prod env reject 9router (ASUMSI SEC-C14) | prod reject 9router | medium | Unit+Security | POST /api/v1/settings/providers |

### 7.4 Modul DB Repositories (lib/db/repositories/) — Unit + Integration

Sitasi: `SRS.md 5 (FR-15)` ; `DATABASE_SCHEMA.md 5, 10, 11.3`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-025 | test DB seeded user | project.repo.listActiveProjects({userId:1}) | userId=1 | data project milik user 1, filter deleted_at IS NULL | list tidak include soft deleted | critical | Integration | GET /api/v1/projects |
| TC-026 | test DB | project.repo.createProject({userId:1,title,...}) | valid input | row baru userId=1, status draft | row.userId===1 | high | Integration | POST /api/v1/projects |
| TC-027 | test DB project milik user 2 | project.repo.getById({id:42,userId:1}) | userId=1 (bukan milik) | null / FORBIDDEN | return null (ownership) | critical | Integration+Security | GET /api/v1/projects/[id] |
| TC-028 | test DB 11 karakter | character.repo count+insert | insert 11 karakter untuk project 42 | 400 bila count >10 (app-layer, ASUMSI SRS-A10) | insert ke-11 ditolak | medium | Integration | POST /api/v1/generate |
| TC-029 | test DB | project.repo.softDelete(42) | id=42 | deletedAt terisi; listActiveProjects exclude | list tidak tampilkan | high | Integration | DELETE /api/v1/projects/[id] |
| TC-030 | test DB | generation-log.repo.list({projectId:42,sort:createdAt:desc}) | projectId=42 | list urut terbaru | order desc | low | Integration | GET /api/v1/projects/[id]/logs |

### 7.5 Modul Export (lib/export/markdown.template.ts) — Unit + Integration

Sitasi: `SRS.md 5 (FR-16), 8.6` ; `PRD.md 8.3`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-031 | — | markdown.template.transform(package) | fixturePromptPackageShorts | markdown string berisi: judul+metadata, profil karakter, karakter pendukung, adegan urut (deskripsi+voiceover+image prompt+reference_filename), image prompt master list, pesan moral | semua section ada, terbaca | high | Unit | GET /api/v1/projects/[id]/export?format=markdown |
| TC-032 | — | snapshot markdown output stabil | fixturePromptPackageShorts | snapshot match (ASUMSI snapshot stabil, CODING_RULES.md 7.2) | snapshot match | medium | Unit | GET export markdown |

### 7.6 Modul API Route Handlers — Integration (Contract Test)

Sitasi: `API_CONTRACT.md 6`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-033 | authed user + valid input | POST /api/v1/projects | makeProject input valid | 201 {data:ProjectDTO} | status 201, data.id ada | high | Integration | POST /api/v1/projects |
| TC-034 | unauth | POST /api/v1/projects | no cookie | 401 {error:{code:UNAUTHORIZED}} | status 401 | critical | Integration | POST /api/v1/projects |
| TC-035 | authed + shorts 250s | POST /api/v1/projects | durationTargetSeconds=250, shorts | 422 {error:{code:VALIDATION_ERROR,details:{max:180}}} | status 422 | high | Integration | POST /api/v1/projects |
| TC-036 | authed + project milik user lain | GET /api/v1/projects/99 | id=99 milik user 2 | 403 FORBIDDEN | status 403 | critical | Integration+Security | GET /api/v1/projects/[id] |
| TC-037 | authed + id tidak ada | GET /api/v1/projects/9999 | id=9999 | 404 NOT_FOUND | status 404 | high | Integration | GET /api/v1/projects/[id] |
| TC-038 | authed + valid provider | POST /api/v1/settings/providers | makeProviderConfig | 201 {data:ProviderConfigDTO, apiKeyMasked:****} | status 201, apiKeyMasked bukan plaintext | critical | Integration+Security | POST /api/v1/settings/providers |
| TC-039 | authed + duplikat nama | POST /api/v1/settings/providers | nama sama | 409 CONFLICT | status 409 | high | Integration | POST /api/v1/settings/providers |
| TC-040 | authed + provider aktif + mock LLM stream | POST /api/v1/generate (mock streamObject) | GenerateInput valid | SSE: event progress (character_profiles, scenes, image_prompts, moral) + event done {result, warnings, generationLogId} | event done punya result valid PromptPackage | critical | Integration | POST /api/v1/generate |
| TC-041 | authed + provider error | POST /api/v1/generate (mock provider throw) | GenerateInput valid | SSE event error {code:PROVIDER_ERROR} ATAU 502 pre-stream | error event terkirim | high | Integration | POST /api/v1/generate |
| TC-042 | authed + 11 request cepat | POST /api/v1/generate x11 | 11 request | request ke-11 -> 429 RATE_LIMITED, header X-RateLimit-Remaining=0 | status 429 | medium | Integration | POST /api/v1/generate (rate limit ASUMSI TP-A10) |
| TC-043 | authed + project punya result | GET /api/v1/projects/42/export?format=json | projectId=42 | 200 application/json, Content-Disposition attachment, body=PromptPackage | header + body valid | high | Integration | GET export json |
| TC-044 | authed + project punya result | GET /api/v1/projects/42/export?format=markdown | projectId=42 | 200 text/markdown, Content-Disposition .md | header + body valid | high | Integration | GET export markdown |
| TC-045 | authed + project belum generate | GET /api/v1/projects/42/export?format=json | resultJson null | 409 CONFLICT (ASUMSI) | status 409 | medium | Integration | GET export |
| TC-046 | authed + valid image | POST /api/v1/upload?projectId=42 multipart | file hero-ref.png, tipe tokoh | 201 {data:AssetReference} | status 201, blobUrl/filename terisi | high | Integration | POST /api/v1/upload |
| TC-047 | authed + mime invalid | POST /api/v1/upload | file invalid.txt | 400 VALIDATION_ERROR | status 400 | high | Integration | POST /api/v1/upload |
| TC-048 | authed + size >10MB | POST /api/v1/upload | oversize.bin 11MB | 400 VALIDATION_ERROR (max size) | status 400 | medium | Integration | POST /api/v1/upload |

### 7.7 Modul Auth & Middleware — Integration + E2E

Sitasi: `SRS.md 5 (FR-18), 9.1 SEC-11` ; `API_CONTRACT.md 2.2`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-049 | unauth | GET /projects (page) | no session | redirect /login?callbackUrl=/projects | redirect 307/302 | critical | E2E | middleware |
| TC-050 | unauth | GET /api/v1/projects | no cookie | 401 | status 401 | critical | Integration | middleware |
| TC-051 | demo user seeded | login form submit | email demo@promptflow.local, password demo123 | redirect /generate, cookie set | cookie next-auth.session-token set | critical | E2E | POST /api/v1/auth/[...nextauth] |
| TC-052 | — | login wrong password | valid email, wrong pass | 401 / form error "Email atau password salah" | error tampil | high | E2E | POST auth |
| TC-053 | authed session | GET /api/v1/auth/session | cookie valid | 200 {data:{user:{id,email,name},expires}} | data.user.id ada | medium | Integration | GET /api/v1/auth/session |

### 7.8 Modul UI Flow E2E (Playwright) — Critical Path

Sitasi: `SRS.md 11.1` ; `UIUX_SPEC.md 6, 7`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-054 | demo user + provider aktif + mock LLM | Flow: login -> New Project wizard step 1-5 -> Generate -> ResultTabs tampil | title "Petualangan Hutan", shorts 60, 3D 16:9, no ref, provider aktif | ResultTabs visible < 60s, tab Adegan ada scene, tab Karakter ada character, tab Pesan Moral ada moral_message | tabs visible, content non-kosong | critical | E2E | POST /api/v1/generate |
| TC-055 | TC-054 done | click Export JSON | format=json | file .json terdownload (Content-Disposition) | download triggered | high | E2E | GET export json |
| TC-056 | TC-054 done | click Export Markdown | format=markdown | file .md terdownload | download triggered | high | E2E | GET export markdown |
| TC-057 | demo user | Flow: Settings -> Add Provider -> form -> save | provider openrouter, name, baseUrl pre-fill, model, apiKey | toast "Provider tersimpan", row list muncul, apiKeyMasked `****` | toast + row + mask | critical | E2E | POST /api/v1/settings/providers |
| TC-058 | TC-057 | Edit provider -> switch isActive | isActive on | toast "Provider aktif diubah", provider lain jadi inactive | active terganti | medium | E2E | PATCH provider |
| TC-059 | demo user + project ada | Flow: dashboard -> click project card -> detail result view | click PromptCard | halaman /projects/[id] render ResultTabs + sidebar meta + export | page render | high | E2E | GET /api/v1/projects/[id] |
| TC-060 | demo user + project ada | click delete project -> confirm | confirm dialog | project hilang dari list, toast "Proyek dihapus" | list refresh, project gone | high | E2E | DELETE /api/v1/projects/[id] |
| TC-061 | demo user | upload referensi: wizard step 3 drop file -> generate | file hero-ref.png tipe tokoh | reference_filename muncul di image_prompts.characters[].reference_filename | ref filename terisi | high | E2E | POST /api/v1/upload + POST /api/v1/generate |
| TC-062 | demo user + tutorial | Flow: wizard step 2 pilih tutorial 480s -> generate | tutorial 480 | scenes 8-20 (ASUMSI SRS-A11) tergenerate | scene count 8-20 | medium | E2E | POST /api/v1/generate |
| TC-063 | demo user | Toggle Language ID -> EN | click LanguageToggle EN | UI label berubah (Proyek -> Projects, Masuk -> Log in) | label sesuai EN | high | E2E | UI i18n |
| TC-064 | demo user | Toggle Language EN -> ID | click LanguageToggle ID | UI label berubah ke ID | label sesuai ID | medium | E2E | UI i18n |
| TC-065 | demo user + warning mismatch | generate dengan fixtureConsistencyMismatch (mock) | mock LLM return mismatch | Alert warning "Karakter tidak konsisten" tampil di ResultView | warning visible | medium | E2E | POST /api/v1/generate event done warnings |
| TC-066 | demo user | CopyButton click di image prompt item | click copy | toast "Tersalin", icon swap Copy->Check 200ms | toast + icon swap | medium | E2E | UI CopyButton |
| TC-067 | demo user | keyboard nav: Tab dari skip link -> header -> wizard form | Tab key | fokus berpindah logical, focus visible ring 2px | focus ring visible | high | E2E+a11y | UI a11y |
| TC-068 | demo user | reduce motion: set prefers-reduced-motion | OS reduce motion on | skeleton shimmer off, transisi instant | animasi non-esensial off | medium | E2E+a11y | UI a11y reduce motion |

### 7.9 Modul A11y (axe-playwright) — E2E

Sitasi: `UIUX_SPEC.md 9.1, 9.7`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-069 | page load | axe scan halaman /login | — | 0 violation WCAG AA | violations.length===0 | critical | E2E+a11y | UI login |
| TC-070 | authed | axe scan /projects | — | 0 violation AA | 0 violation | critical | E2E+a11y | UI dashboard |
| TC-071 | authed | axe scan /generate wizard | — | 0 violation AA | 0 violation | critical | E2E+a11y | UI wizard |
| TC-072 | authed + result ada | axe scan /projects/[id] ResultView | — | 0 violation AA, aria-live streaming region ada | 0 violation | critical | E2E+a11y | UI result |
| TC-073 | authed | axe scan /settings provider form dialog | — | 0 violation AA, label htmlFor bind, aria-invalid di error | 0 violation | high | E2E+a11y | UI settings |
| TC-074 | — | cek kontras token UIUX_SPEC 2.1 | light+dark | foreground vs background >= 4.5:1 body, >= 3:1 large/UI | semua pass | high | A11y audit | UI tokens |
| TC-075 | — | cek focus visible tidak `outline:none` tanpa pengganti | inspect CSS | focus ring `--ring` 2px offset 2px | ring visible | high | A11y audit | UI |

### 7.10 Modul Non-Fungsional (Performance + Security) — Integration + Audit

Sitasi: `PRD.md 6.1, 6.2` ; `CODING_RULES.md 6`.

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-076 | mock LLM stream cepat | POST /api/v1/generate timing | GenerateInput shorts | token pertama (event progress) < 10s (NFR-P3) | first event <10000ms | high | Performance | POST /api/v1/generate |
| TC-077 | mock LLM | POST /api/v1/generate end-to-end | shorts 60s | done event < 60s (NFR-P1 ASUMSI SRS-A12) | done <60000ms | high | Performance | POST /api/v1/generate |
| TC-078 | mock LLM | POST /api/v1/generate end-to-end | tutorial 480s | done < 180s (NFR-P2) | done <180000ms | medium | Performance | POST /api/v1/generate |
| TC-079 | test DB | query project.repo.listActiveProjects | 1000 row | query < 500ms (NFR-P5) | duration <500ms | medium | Performance | DB |
| TC-080 | authed | page load /projects | — | LCP < 2s (NFR-P4) | LCP <2000ms | medium | Performance | UI |
| TC-081 | — | `npm audit` / Dependabot | — | 0 vuln high+critical | 0 high+critical | high | Security audit | deps |
| TC-082 | build prod | inspect next build bundle stat | — | TIDAK ada ENCRYPTION_KEY/TURSO_AUTH_TOKEN/NEXTAUTH_SECRET di client bundle | secret tidak leak | critical | Security audit | build |
| TC-083 | authed | query project milik user lain via API | id user lain | 403 (RBAC ownership) | 403 | critical | Security | GET /api/v1/projects/[id] |
| TC-084 | — | input XSS `<script>alert(1)</script>` di title | title XSS | escaped di response/prompt, TIDAK eksekusi | escaped | high | Security | POST /api/v1/projects, /generate |
| TC-085 | authed | SQL injection attempt di query param | `?id=1 OR 1=1` | Drizzle parameterized, tidak leak | aman | high | Security | GET /api/v1/projects/[id] |
| TC-086 | — | CSRF attempt Server Action dari origin lain | cross-origin | Next.js built-in CSRF reject | reject | high | Security | Server Action |

### 7.11 Ringkasan Statistik Test Case

| Kelompok | Jumlah TC |
|---|---|
| Validasi (Unit) | 11 (TC-001..TC-011) |
| Crypto (Unit+Security) | 6 (TC-012..TC-017) |
| AI (Unit) | 7 (TC-018..TC-024) |
| DB Repositories (Unit+Integration) | 6 (TC-025..TC-030) |
| Export (Unit) | 2 (TC-031..TC-032) |
| API Route Handlers (Integration) | 16 (TC-033..TC-048) |
| Auth & Middleware (Integration+E2E) | 5 (TC-049..TC-053) |
| UI Flow E2E (Playwright) | 15 (TC-054..TC-068) |
| A11y (E2E+audit) | 7 (TC-069..TC-075) |
| Non-Fungsional (Perf+Security) | 11 (TC-076..TC-086) |
| **TOTAL** | **86 test case** |

> Total melampaui minimum 30. Cakup SEMUA FR-01..FR-19 + 21 endpoint +
> komponen UI + NFR. Sitasi tersebar per modul.

---
## 8. Pengujian Non-Fungsional

### 8.1 Performa (NFR-P1..P5)

| NFR | Target | Test Case | Tool | Bukti |
|---|---|---|---|---|
| NFR-P1 Latency Shorts | <= 60 detik end-to-end (streaming) | TC-077 | Vitest timing / Playwright timing mock LLM | `PRD.md 6.1` ; ASUMSI SRS-A12 |
| NFR-P2 Latency Tutorial | <= 180 detik end-to-end (streaming) | TC-078 | Vitest timing | `PRD.md 6.1` |
| NFR-P3 Streaming partial | Token mulai mengalir < 10s setelah submit | TC-076 | Playwright timing first SSE event | `PRD.md 6.1` ; ASUMSI A6 |
| NFR-P4 UI response time | < 2s page load | TC-080 | Playwright LCP / Lighthouse | `PRD.md 6.1` |
| NFR-P5 DB query | < 500ms per query (Turso HTTP) | TC-079 | Vitest benchmark query | `PRD.md 6.1` ; `RAG-CONTEXT.md 2.2` |

**Catatan:** latency LLM real bergantung provider. Test internal pakai mock
LLM cepat. Perf real provider = manual smoke staging (OOS load test penuh,
OOS-T13).

### 8.2 Keamanan (NFR-S1..S6)

| NFR | Test | Test Case | Bukti |
|---|---|---|---|
| NFR-S1 API key encrypt at rest | TC-015, TC-012 | `PRD.md 6.2` ; `DATABASE_SCHEMA.md 11.1` |
| NFR-S2 API key tidak expose client | TC-016, TC-082 | `PRD.md 6.2` ; `CODING_RULES.md 6.1 SEC-C02/C15` |
| NFR-S3 Input sanitization (XSS) | TC-084 | `PRD.md 6.2` ; `CODING_RULES.md 6.1 SEC-C09` |
| NFR-S4 Rate limit generate 10/min | TC-042 | `PRD.md 6.2` ; ASUMSI SRS-A15 |
| NFR-S5 HTTPS only | Manual verify Vercel prod | `PRD.md 6.2` ; `SRS.md 9.1 SEC-09` |
| NFR-S6 Ownership RBAC | TC-027, TC-036, TC-083 | `PRD.md 6.2` ; `DATABASE_SCHEMA.md 11.3` |
| Dependency audit | TC-081 | `CODING_RULES.md 6.1 SEC-C18` |
| File upload mime+size | TC-047, TC-048 | `CODING_RULES.md 6.1 SEC-C17` |
| 9router localhost only | TC-024 (prod reject) | `CODING_RULES.md 6.1 SEC-C14` |

### 8.3 Kompatibilitas Browser/OS/Device

| Target | Test | Tool | Bukti |
|---|---|---|---|
| Chrome 120+ (Desktop) | TC-054..TC-068 critical flow | Playwright chromium project | `UIUX_SPEC.md 12.3` |
| Edge 120+ | (subset smoke, ASUMSI chromium base) | Playwright chromium | `UIUX_SPEC.md 12.3` |
| Firefox 120+ | TC-054 smoke | Playwright firefox | `UIUX_SPEC.md 12.3` |
| Safari 17+ (macOS) | TC-054 smoke | Playwright webkit | `UIUX_SPEC.md 12.3` |
| Mobile Safari iOS 17+ | TC-054 smoke | Playwright iPhone 14 project | `UIUX_SPEC.md 12.3` |
| Chrome Android 120+ | (manual smoke ASUMSI) | manual device | `UIUX_SPEC.md 12.3` |

### 8.4 Aksesibilitas (WCAG 2.1 AA)

| Kategori | Target | Test Case | Bukti |
|---|---|---|---|
| Kontras warna | >= 4.5:1 body, >= 3:1 large/UI | TC-074 | `UIUX_SPEC.md 9.1` |
| Keyboard nav | semua interaktif reachable Tab | TC-067 | `UIUX_SPEC.md 9.2` |
| Focus visible | ring 2px, tidak `outline:none` tanpa pengganti | TC-075 | `UIUX_SPEC.md 9.2` |
| ARIA semantik | aria-label/expanded/selected/live | TC-069..TC-073 (axe) | `UIUX_SPEC.md 9.3` |
| Reduce motion | animasi non-esensial off | TC-068 | `UIUX_SPEC.md 9.5` |
| Skip link | ada + berfungsi | TC-067 | `UIUX_SPEC.md 9.2` |
| Dialog trap | fokus trap + Esc | manual/axe | `UIUX_SPEC.md 9.2` |
| `lang` attribute | ikut locale | TC-063/TC-064 verify | `UIUX_SPEC.md 9.6` |
| Axe scan 0 violation | login/dashboard/wizard/result/settings | TC-069..TC-073 | `UIUX_SPEC.md 9.7` |

### 8.5 Responsif & Visual Regression

| Breakpoint | Test | Bukti |
|---|---|---|
| Mobile <640 | header hamburger, single col, wizard full, result tabs scroll | `UIUX_SPEC.md 12.1, 12.2` |
| sm 640 | grid 2 col | `UIUX_SPEC.md 12.1` |
| md 768 | wizard container 768, result sidebar mulai | `UIUX_SPEC.md 12.1` |
| lg 1024 | grid 3 col, result sidebar sticky, header full nav | `UIUX_SPEC.md 12.1` |
| xl 1280 | grid 4 col, container dashboard 1280 | `UIUX_SPEC.md 12.1` |
| 2xl 1536 | landing container 1536 | `UIUX_SPEC.md 12.1` |

**Visual regression test:** opsional via Playwright screenshot per breakpoint
(`@playwright/test` `toHaveScreenshot`). ASUMSI fase 3 (CODING_RULES.md 7.2
warning snapshot false positive). Token UIUX_SPEC §2 jadi source of truth.

**State komponen:** test render state (default/hover/active/disabled/focus/
loading/error/streaming) per komponen UIUX_SPEC §3.2. Pakai Vitest React
Testing Library + `@testing-library/jest-dom`.

---

## 9. Target Coverage & Cara Ukur

### 9.1 Target Coverage

| Level | Metric | Target | Cara Ukur | Bukti |
|---|---|---|---|---|
| Unit | line + branch + function + statement | >= 80% | `@vitest/coverage-v8` reporter HTML/JSON | `CODING_RULES.md 7.1, 14.1 CR-A10` ; `SRS.md 11.1` |
| Integration | line API handler | >= 70% (ASUMSI) | coverage report per folder `src/app/api` | `SRS.md 11.1` |
| E2E | critical path pass | 100% | Playwright pass/fail count | `SRS.md 11.1` |
| Lint | error | 0 | `next lint` exit code 0 | `CODING_RULES.md 9.1` |
| Lint | warning | 0 (ASUMSI strict) | `next lint` | `CODING_RULES.md 9.1` |
| Typecheck | error | 0 | `tsc --noEmit` exit code 0 | `CODING_RULES.md 9.5` |
| Build | error | 0 (sukses) | `next build` exit code 0 | `SRS.md 11.1` |
| A11y | WCAG AA violation | 0 | axe scan | `UIUX_SPEC.md 9.7` |
| Security | secret leak | 0 | bundle inspect + npm audit | `CODING_RULES.md 6.1 SEC-C15/C18` |
| Contract | endpoint dites | 21/21 happy+error | contract test count | `API_CONTRACT.md 5` |

### 9.2 Modul Wajib 100% Coverage (Critical Path)

| Modul | Alasan 100% | Bukti |
|---|---|---|
| `lib/crypto/aes.ts` | enkripsi API key kritikal | `SRS.md 9.1 SEC-01` |
| `lib/validation/schemas.ts` | boundary validation kritikal | `SRS.md 8.7` |
| `lib/ai/consistency-checker.ts` | FR-12 konsistensi karakter | `SRS.md 5 (FR-12)` |
| `lib/ai/response-parser.ts` | LLM output validation | `PROJECT_ARCHITECTURE.md 4.1` |
| `lib/db/repositories/project.repo.ts` | ownership + soft delete | `DATABASE_SCHEMA.md 11.3, 10.1` |
| `lib/db/repositories/provider-config.repo.ts` | API key encrypt save | `SRS.md 5 (FR-14)` |
| `src/middleware.ts` | auth + rate limit gate | `SRS.md 9.1 SEC-11` |

### 9.3 Config Coverage Gate (vitest.config.ts)

```ts
coverage: {
  thresholds: {
    lines: 80, branches: 80, functions: 80, statements: 80,
    perFile: false,
    // critical file 100% (ASUMSI via custom check atau perFile config)
  },
}
```

CI gagal bila coverage < threshold (`CODING_RULES.md 7.2, 11.1`).

---

## 10. Entry & Exit Criteria + Definition of Done

### 10.1 Entry Criteria per Level

| Level | Entry Criteria | Bukti |
|---|---|---|
| Unit | kode ditulis (atau TDD: test dulu), `vitest` terinstal, env test set | `CODING_RULES.md 7` |
| Integration | Unit pass, test DB terkonfigurasi, env test set, mock siap | `SRS.md 11.1` |
| E2E | app bisa start (`npm run dev`), demo user seeded, mock LLM route intercept siap, Playwright installed | `SRS.md 11.1` |
| UAT | deploy staging live, stakeholder siap review | `PRD.md 7` |
| Performance | integration pass, mock LLM cepat, timing helper siap | `PRD.md 6.1` |
| Security | unit crypto pass, build prod bisa inspect | `CODING_RULES.md 6` |
| A11y | UI render, axe-playwright installed | `UIUX_SPEC.md 9` |

### 10.2 Exit Criteria per Level

| Level | Exit Criteria | Bukti |
|---|---|---|
| Unit | coverage >= 80% line+branch, 0 fail, 0 skip tanpa alasan | `CODING_RULES.md 7.1, 7.2` |
| Integration | coverage >= 70% API, 21 endpoint happy+error pass, 0 fail | `SRS.md 11.1` |
| E2E | critical path 100% pass (login, generate, save, export, settings, dwibahasa, a11y), 0 fail | `SRS.md 11.1` |
| UAT | stakeholder sign-off output LLM relevan | `PRD.md 7 (AC manual)` |
| Performance | NFR-P1..P5 tercapai (mock LLM) | `PRD.md 6.1` |
| Security | 0 secret leak, 0 auth bypass, npm audit 0 high+ | `CODING_RULES.md 6` |
| A11y | 0 violation WCAG AA (axe) | `UIUX_SPEC.md 9.7` |

### 10.3 Definition of Done Pengujian (per Fase SRS §11.3)

#### Fase 1 DoD (Skeleton + DB + Auth + Provider + Generate Shorts + Export JSON)

- [ ] `next build` sukses tanpa error
- [ ] `tsc --noEmit` 0 error
- [ ] `next lint` 0 error, 0 warning
- [ ] Vitest unit+integration >= 80%/70% coverage
- [ ] Playwright E2E flow Shorts sukses (TC-054, TC-055)
- [ ] Deploy Vercel preview jalan
- [ ] TC-001..TC-048 (unit+integration core) pass
- [ ] TC-049..TC-053 (auth) pass

Sitasi: `SRS.md 11.3`.

#### Fase 2 DoD (+ Upload Referensi + Tutorial + Markdown + Dwibahasa)

- [ ] Fase 1 DoD tercapai
- [ ] E2E upload referensi sukses (TC-061)
- [ ] E2E Tutorial sukses (TC-062)
- [ ] E2E export markdown sukses (TC-056)
- [ ] E2E dwibahasa toggle sukses (TC-063, TC-064)
- [ ] TC-046..TC-048 (upload) pass

#### Fase 3 DoD (+ Konsistensi UI + History + Template + WCAG + Telemetri)

- [ ] Fase 2 DoD tercapai
- [ ] Konsistensi check UI warning visible (TC-065)
- [ ] History endpoint logs pass (TC-030)
- [ ] WCAG AA audit 0 violation (TC-069..TC-075)
- [ ] Telemetri KPI generation_logs terisi (TC-030)
- [ ] Rate limit jalan (TC-042)

### 10.4 Overall Definition of Done (Deliverable Ship)

Semua WAJIB ✓:
- [ ] Coverage unit >= 80% line+branch
- [ ] Coverage integration >= 70% API
- [ ] E2E critical path 100% pass
- [ ] Critical bug 0 (P0/P1)
- [ ] Lint 0 error + 0 warning
- [ ] tsc --noEmit 0 error
- [ ] next build sukses
- [ ] A11y 0 violation WCAG AA
- [ ] Security: 0 secret leak, 0 auth bypass, npm audit 0 high+
- [ ] 21 endpoint contract test pass
- [ ] FR-01..FR-19 tercakup minimal 1 test scenario
- [ ] NFR-P1..P5, S1..S6, A1..A3, I1..I2 terukur
- [ ] Stakeholder UAT sign-off (output LLM relevan)

---

## 11. Strategi Regression, Smoke Test, Bug Tracking

### 11.1 Regression Test

| Aspek | Strategi | Bukti |
|---|---|---|
| Re-run full suite | Setiap PR: CI jalankan lint+typecheck+unit+build+e2e (`CODING_RULES.md 11.1`) | `CODING_RULES.md 11.1` |
| Subset regression | Bug fix WAJIB tambah test case yang catch bug itu (anti-regression) | ASUMSI best practice |
| Snapshot selektif | Snapshot hanya output stabil (markdown template TC-032). Hindari snapshot komponen UI (false positive mudah, CODING_RULES.md 7.2 L22) | `CODING_RULES.md 7.2` |
| Versi lock | `package-lock.json` pin. Update deps via PR + re-run full suite | ASUMSI |
| Critical path e2e | Run e2e critical flow (TC-054..TC-060) tiap PR | `SRS.md 11.1` |
| Migration regression | Setiap `drizzle-kit generate` buat migration, re-run integration test verify schema + seed | `DATABASE_SCHEMA.md 8.4` |

### 11.2 Smoke Test

Sebelum deploy prod / setelah hotfix, run subset cepat:

| Smoke | Test | Bukti |
|---|---|---|
| Health check | GET /api/v1/health 200 | `API_CONTRACT.md 6.2.1` |
| Login | TC-051 | `SRS.md 5 (FR-18)` |
| Generate Shorts mock | TC-054 | `SRS.md 11.1` |
| Export JSON | TC-055 | `SRS.md 5 (FR-16)` |
| List projects | GET /api/v1/projects 200 | `SRS.md 5 (FR-15)` |

### 11.3 Test Data Management Regression

- `beforeEach` reset test DB (`resetTestDB`, §5.4) -> isolasi test.
- Factory function deterministik (id fix bila perlu).
- TIDAK share state antar test.
- Seed user demo konsisten (`demo@promptflow.local`).

### 11.4 Bug Tracking

| Aspek | Implementasi | Bukti |
|---|---|---|
| Tool | GitHub Issues (repo `agrianwahab29/promptflow`) | `PRD.md 1` |
| Label | `bug`, `p0`/`p1`/`p2`/`p3`, `regression`, `a11y`, `security`, `performance` | ASUMSI |
| Template issue | Repro steps, expected, actual, env, screenshot, test case ID (TC-XXX) | ASUMSI |
| Severity | P0 blocker ship / P1 critical / P2 major / P3 minor | ASUMSI |
| Link TC | Bug WAJIB link ke TC-XXX yang gagal / yang perlu tambah | ASUMSI |
| Triage | P0/P1 fix sebelum merge. P2/P3 boleh follow-up issue | ASUMSI |
| DoD bug fix | Fix + test case baru catch bug + regression suite pass | ASUMSI |

### 11.5 Test Report

| Output | Format | Frekuensi | Bukti |
|---|---|---|---|
| Coverage report | HTML + JSON | per CI run | `CODING_RULES.md 11.1` |
| Playwright report | HTML + JUnit XML | per CI run e2e | `CODING_RULES.md 11.1` |
| Lint report | text | per CI run | `CODING_RULES.md 9.1` |
| Build log | text | per CI run | `CODING_RULES.md 11.1` |
| A11y axe report | JSON | per e2e run | `UIUX_SPEC.md 9.7` |
| Security audit | `npm audit` output | per CI run + Dependabot PR | `CODING_RULES.md 6.1 SEC-C18` |

---
## 12. Risiko Pengujian & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi | Bukti |
|---|---|---|---|---|---|
| R1 | LLM real non-deterministik -> flaky E2E | E2E generate gagal/random output | Tinggi | Mock LLM di E2E (route intercept Playwright). Output validasi via schema Zod + key field, BUKAN string exact match. UAT manual untuk kualitas LLM real | `CODING_RULES.md 7.2` ; ASUMSI |
| R2 | Turso test DB koneksi lambat/tidak stabil -> integration flaky | Integration timeout | Sedang | Pakai SQLite in-memory bila Turso test lambat (ASUMSI TP-A6). Retry + timeout generous | ASUMSI |
| R3 | Vercel Blob tidak tersedia di CI local -> upload integration gagal | Upload test fail | Sedang | Mock Blob di integration (`vi.mock('@/lib/storage/blob')`). FS fallback dev (`USE_VERCEL_BLOB=false`) | `SRS.md 8.5` ; ASUMSI SRS-A17 |
| R4 | SSE stream test sulit di Playwright (event timing) | E2E generate false fail | Sedang | Pakai Playwright `page.waitForResponse` + parse SSE manual. Mock streamObject cepat deterministik. Timeout generous 60s | ASUMSI |
| R5 | Coverage 80% terlalu tinggi -> developer bypass dengan test trivial | Coverage tinggi tapi kualitas rendah | Sedang | Review test quality (assert meaningful, BUKAN `expect(true).toBe(true)`). Critical modul 100% (§9.2). CI coverage gate + human review | `CODING_RULES.md 7.2` |
| R6 | A11y axe false positive (kontras token custom) | A11y test fail tidak valid | Rendah | Verifikasi token UIUX_SPEC 2.1 manual. Whitelist token yang sudah verified AA via axe config `disableRules` bila yakin | `UIUX_SPEC.md 9.1` |
| R7 | Rate limit in-memory tidak konsisten cross-instance Vercel | TC-042 flaky di prod | Sedang | Test rate limit di local/single instance. Prod: ASUMSI Upstash Redis bila perlu (fase akhir). Dokumen sebagai batasan | `PROJECT_ARCHITECTURE.md 9 SB-12` ; ASUMSI SRS-A15 |
| R8 | 9router localhost unreachable di CI | Provider 9router test fail | Tinggi | Mock provider-registry di CI. 9router test hanya local dev manual. Skip 9router real di CI (`it.skip` + alasan) | ASUMSI SRS-A7 ; `CODING_RULES.md 7.2 no skip tanpa alasan` |
| R9 | NextAuth session test sulit (cookie/JWT) | E2E login flaky | Sedang | Playwright handle cookie otomatis. Login flow real (TC-051) bukan mock session. Persist session via storageState bila perlu cepat | ASUMSI |
| R10 | Snapshot markdown false positive bila format berubah wajar | TC-032 fail tidak relevan | Rendah | Update snapshot intentional via `--update-snapshots`. Review perubahan. Hindari snapshot komponen UI | `CODING_RULES.md 7.2 L22` |
| R11 | Build prod inspect secret susah (bundle besar) | TC-082 false pass | Sedang | Pakai `next build` + grep bundle `.next/static` untuk env secret. ATAU Vercel build log scan. ASUMSI tooling `secretlint` opsional | ASUMSI |
| R12 | Multi-browser e2e lambat (5 project Playwright) | CI lama | Sedang | Parallel project bila resource cukup. Subset smoke multi-browser, full critical flow chromium only. ASUMSI matrix strategy | `UIUX_SPEC.md 12.3` |
| R13 | Batas tokoh 10 (SRS-A10) tidak ada bukti user prefer | TC-028 mungkin salah threshold | Rendah | Konfigurasi constanta `MAX_CHARACTERS_PER_PROJECT`. Bila user ubah, update test + Zod. Tandai ASUMSI | `SRS.md 12 SRS-A10` |
| R14 | Latency NFR (P1/P2) pakai mock LLM tidak representatif | Perf test lulus tapi prod lambat | Tinggi | Perf real = manual staging smoke dengan provider real (Ollama cloud/OpenRouter). Dokumen sebagai batasan test internal. UAT stakeholder cek latency real | `PRD.md 6.1` ; ASUMSI OOS-T13 |
| R15 | Test DB Turso berbayar setelah free tier | Integration test blocked | Rendah | Pakai SQLite in-memory untuk integration default (ASUMSI). Turso test DB opsional staging | ASUMSI |

### 12.1 Risiko belum Tertangani (Open)

| # | Risiko | Status | Action |
|---|---|---|---|
| O1 | Model LLM default per provider (SRS-A8 TIDAK ADA BUKTI) | Open | Test pakai model user input; UI hint rekomendasi model opsional |
| O2 | NextAuth provider preferensi (SRS-A1 TIDAK ADA BUKTI) | Open | Test credentials provider fase awal; OAuth deferred |
| O3 | Storage S3/R2 alternatif Blob (SRS-A5) | Open | Abstract storage interface; test mock interface |
| O4 | i18n lib next-intl vs native (SRS-A2) | Open | Test next-intl; bila ganti, update test key sync |

---

## 13. Checklist Sign-off QA

Sebelum deliverable dianggap selesai, QA / reviewer WAJIB ✓ semua:

### 13.1 Cakupan Fitur

- [ ] FR-01 Input judul — TC-001..TC-003 pass
- [ ] FR-02 Input durasi — TC-004..TC-006 pass
- [ ] FR-03/09 Adegan urut — TC-019, TC-054 pass
- [ ] FR-04 Voiceover — TC-008, TC-054 pass
- [ ] FR-05 Auto karakter/bg — TC-019 pass
- [ ] FR-06 Image prompt per tokoh/bg — TC-019 pass
- [ ] FR-07 Tokoh terstruktur — TC-008 pass (Zod)
- [ ] FR-08 Karakter pendukung — TC-008 pass
- [ ] FR-10 Gaya+rasio — TC-007 pass
- [ ] FR-11 Pesan moral — TC-008, TC-054 pass + manual review
- [ ] FR-12 Konsistensi karakter — TC-021, TC-022, TC-065 pass
- [ ] FR-13 Multi-provider — TC-010, TC-023, TC-038..TC-041, TC-057 pass
- [ ] FR-14 Enkripsi API key — TC-012..TC-017 pass
- [ ] FR-15 Save + CRUD project — TC-025..TC-029, TC-033..TC-037, TC-059, TC-060 pass
- [ ] FR-16 Export — TC-031, TC-043..TC-045, TC-055, TC-056 pass
- [ ] FR-17 Upload referensi — TC-046..TC-048, TC-061 pass
- [ ] FR-18 Login — TC-049..TC-051 pass
- [ ] FR-19 Dwibahasa — TC-063, TC-064 pass + unit i18n key sync

### 13.2 Cakupan Endpoint (21/21)

- [ ] #1 auth nextauth — TC-051, TC-052
- [ ] #2 auth session — TC-053
- [ ] #3 health — TC-079 verify (manual)
- [ ] #4 projects GET — TC-025, TC-050
- [ ] #5 projects POST — TC-033..TC-035
- [ ] #6 projects/[id] GET — TC-036, TC-037
- [ ] #7 projects/[id] PATCH — TC-038 (provider analog)
- [ ] #8 projects/[id] DELETE — TC-029, TC-060
- [ ] #9 generate — TC-040..TC-042, TC-054
- [ ] #10 settings/providers GET — TC-016
- [ ] #11 settings/providers POST — TC-038, TC-039
- [ ] #12 settings/providers/[id] PATCH — TC-058
- [ ] #13 settings/providers/[id] DELETE — TC-060 analog
- [ ] #14 settings/providers/[id]/test — TC-023 (unit analog)
- [ ] #15 upload POST — TC-046..TC-048
- [ ] #16 upload DELETE — TC-061 analog
- [ ] #17 export — TC-043..TC-045, TC-055, TC-056
- [ ] #18 characters GET — TC-019 analog (sub-resource)
- [ ] #19 scenes GET — TC-019 analog
- [ ] #20 image-prompts GET — TC-019 analog
- [ ] #21 logs GET — TC-030

### 13.3 Cakupan NFR

- [ ] NFR-P1 shorts <=60s — TC-077
- [ ] NFR-P2 tutorial <=180s — TC-078
- [ ] NFR-P3 token <10s — TC-076
- [ ] NFR-P4 UI <2s — TC-080
- [ ] NFR-P5 DB <500ms — TC-079
- [ ] NFR-S1 API key encrypt — TC-012, TC-015
- [ ] NFR-S2 tidak expose — TC-016, TC-082
- [ ] NFR-S3 XSS — TC-084
- [ ] NFR-S4 rate limit — TC-042
- [ ] NFR-S5 HTTPS — manual prod verify
- [ ] NFR-S6 RBAC — TC-027, TC-036, TC-083
- [ ] NFR-A1 WCAG AA — TC-069..TC-075
- [ ] NFR-A2 keyboard — TC-067
- [ ] NFR-A3 screen reader — axe (TC-069..TC-073)
- [ ] NFR-I1 dwibahasa UI — TC-063, TC-064
- [ ] NFR-I2 konten LLM ikut judul — manual UAT

### 13.4 Cakupan CODING_RULES

- [ ] Coverage unit >=80% — §9.1
- [ ] Coverage integration >=70% — §9.1
- [ ] E2E critical path 100% — §10.3
- [ ] Lint 0 error/warning — §9.1
- [ ] tsc 0 error — §9.1
- [ ] next build sukses — §10.3
- [ ] AAA pattern — §2.5
- [ ] Co-located test — §4.4
- [ ] Mock strategy — §2.3
- [ ] No `it.skip` tanpa alasan — §11.1

### 13.5 Cakupan UIUX_SPEC

- [ ] Token warna/typografi/spacing/radius/shadow/motion — TC-074
- [ ] Komponen shadcn ter-install — TC-069..TC-073
- [ ] Wizard 5 step — TC-054
- [ ] Result tabs 5 — TC-054
- [ ] Settings provider CRUD — TC-057, TC-058
- [ ] CopyButton — TC-066
- [ ] Empty/error/loading state — TC-054, TC-065
- [ ] Toast feedback — TC-057, TC-060, TC-066
- [ ] A11y skip link/focus/aria/reduce-motion — TC-067, TC-068, TC-069..TC-075
- [ ] Dwibahasa — TC-063, TC-064
- [ ] Dark mode — manual verify toggle
- [ ] Responsif breakpoint — §8.5 (opsional screenshot)
- [ ] Lucide icon konsisten — manual audit

### 13.6 Sign-off Final

- [ ] Semua checklist §13.1..§13.5 ✓
- [ ] Critical bug (P0/P1) 0
- [ ] Coverage gate CI pass
- [ ] Stakeholder UAT sign-off (output LLM relevan, `PRD.md 7 manual AC`)
- [ ] QA reviewer approve merge `main`

**Sign-off:** [nama QA] [tanggal] [link CI run] [link build] [link coverage]

---

## 14. Asumsi Test + Referensi

### 14.1 Asumsi Test

| ID | Asumsi | Status Bukti | Dampak | Sitasi |
|---|---|---|---|---|
| TP-A1 | Vitest + Playwright framework test resmi | DIKONFIRMASI SRS/CODING_RULES | Framework lock | `SRS.md 11.1` ; `CODING_RULES.md 1.2` |
| TP-A2 | Coverage unit target 80% line+branch | ASUMSI (CR-A10) | Bisa beda | `CODING_RULES.md 7.1, 14.1` |
| TP-A3 | E2E critical path target 100% | DIKONFIRMASI SRS | Critical flow wajib pass | `SRS.md 11.1` |
| TP-A4 | Lint 0 error + typecheck 0 error + build pass = gate | DIKONFIRMASI CODING_RULES | CI fail bila ada | `CODING_RULES.md 11.1` |
| TP-A5 | Mock LLM di unit/integration, real provider manual staging | ASUMSI best practice | Deterministik test | `CODING_RULES.md 7.2` |
| TP-A6 | Test DB = Turso lokal atau SQLite in-memory | ASUMSI | Bisa beda DB test | `SRS.md 11.1` |
| TP-A7 | AAA pattern wajib | ASUMSI best practice | Konsistensi test | `CODING_RULES.md 7.2` |
| TP-A8 | Co-located `*.test.ts`, E2E `e2e/*.spec.ts` | DIKONFIRMASI CODING_RULES | Struktur test | `CODING_RULES.md 2.1, 7.2` |
| TP-A9 | Batas tokoh 10 per project | ASUMSI (SRS-A10 TIDAK ADA BUKTI user) | Zod app-layer | `DATABASE_SCHEMA.md 12.6` ; `SRS.md 12` |
| TP-A10 | Rate limit generate 10 req/min/user | ASUMSI (SRS-A15) | Middleware | `SRS.md 12` ; `API_CONTRACT.md 10` |
| TP-A11 | File upload max 10MB, mime `image/*` | ASUMSI (CR-A17) | Validasi | `CODING_RULES.md 14.1` |
| TP-A12 | Retry LLM 3x backoff | ASUMSI (SRS-A14) | NFR-R3 | `SRS.md 12` |
| TP-A13 | Latency target mock LLM (P1/P2) tidak representatif real | ASUMSI | Perf real = manual staging | `PRD.md 6.1` ; OOS-T13 |
| TP-A14 | Snapshot hanya markdown stabil, hindari UI | DIKONFIRMASI CODING_RULES | False positive rendah | `CODING_RULES.md 7.2 L22` |
| TP-A15 | Multi-browser e2e: chromium full, firefox/webkit/mobile smoke | ASUMSI | CI resource | `UIUX_SPEC.md 12.3` |
| TP-A16 | 9router test hanya local dev, CI skip | ASUMSI (SRS-A7) | CI aman | `RAG-CONTEXT.md 5.2, 9 G4` |
| TP-A17 | NextAuth credentials provider fase awal | ASUMSI (SRS-A1) | OAuth deferred | `RAG-CONTEXT.md 9 G2` |
| TP-A18 | next-intl untuk dwibahasa | ASUMSI (SRS-A2) | Bisa native App Router | `RAG-CONTEXT.md 9 G5` |
| TP-A19 | Vercel Blob prod, FS dev fallback | ASUMSI (SRS-A5/A17) | Storage abstract | `RAG-CONTEXT.md 6, 9 G3` |
| TP-A20 | Bug tracking via GitHub Issues | ASUMSI | Tool | `PRD.md 1` |

### 14.2 Referensi Internal

| Dokumen | Path | Bagian relevan |
|---|---|---|
| RAG-CONTEXT | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` | §2 stack, §5 provider, §9 gap |
| BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | §3 KPI, §6 risk, §8 scope |
| MRD | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | §3 persona, §10 asumsi |
| PRD | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | §5 FR, §6 NFR, §7 AC, §8.2 schema, §9 OOS |
| SRS | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | §4 stack, §5 FR teknis, §8 constraint, §9 keamanan, §10 fase, §11 verifikasi, §12 asumsi |
| DATABASE_SCHEMA | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` | §4 tabel, §5 index, §6 constraint, §10 soft delete, §11 keamanan, §12 catatan |
| PROJECT_ARCHITECTURE | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | §4 komponen, §5 folder, §6 data flow, §9 security boundary, §10 perf |
| API_CONTRACT | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` | §5 endpoint, §6 detail, §7 SSE, §8 schema, §9 error, §10 rate limit |
| CODING_RULES | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | §7 testing, §9 lint, §10 PR checklist, §11 CI, §12 frontend, §14 asumsi |
| UIUX_SPEC | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | §3 komponen, §6 flow, §7 wireframe, §9 a11y, §10 state, §12 responsif |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git | — |

### 14.3 Sitasi Eksternal Kunci

| Sitasi | Klaim didukung | Bagian |
|---|---|---|
| https://vitest.dev | Vitest framework, coverage, mock | §1.3, §4.3 |
| https://playwright.dev | Playwright E2E, multi-browser, axe | §1.3, §4.3 |
| https://github.com/dequelabs/axe-core | axe-playwright a11y | §3, §8.4 |
| https://ai-sdk.dev/providers/openai-compatible-providers | Mock AI SDK, structured output | §2.3, §7.3 |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Test DB Turso/libSQL | §4.1, §5.4 |
| https://www.w3.org/TR/WCAG21 | WCAG 2.1 AA target a11y | §8.4 |
| https://nextjs.org/docs | Next.js App Router test, RSC, Server Actions | §3, §4.3 |
| https://ui.shadcn.com/docs | shadcn/ui komponen UI | §6.2 |

---

**Dokumen ini fokus pada RENCANA UJI siap dieksekusi agent. Tujuan bisnis di
BRD, pasar di MRD, produk di PRD, spesifikasi teknis di SRS, arsitektur di
PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA, kontrak API di API_CONTRACT,
aturan kode di CODING_RULES, design system di UIUX_SPEC. TEST_PLAN tidak
membangun deliverable akhir / menulis kode test — hanya rencana uji.**

> **Dibuat oleh:** docgen-test-plan subagent
> **Tanggal:** 2026-06-19
> **Versi:** 1.0
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Output file:** `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md`
