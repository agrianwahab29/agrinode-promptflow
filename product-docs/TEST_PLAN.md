# Test Plan — PromptFlow
## Workflow Engine Otomasi Prompt Animasi AI

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `product-docs/RAG-CONTEXT.md` + `product-docs/PRD.md` V2.0 + `product-docs/SRS.md` V2.0 + `product-docs/DATABASE_SCHEMA.md` V2.0 + `product-docs/API_CONTRACT.md` V2.0 + `product-docs/CODING_RULES.md` V2.0 + `product-docs/UIUX_SPEC.md` V2.0
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **GitHub:** `https://github.com/agrianwahab29/promptflow.git`
> **Catatan:** OVERWRITE V1. Pertahankan SEMUA test case V1 (TC-001..TC-086) + tambah V2 (TC-087..TC-099, TC-V2-049..TC-V2-099). Total **168 test case** (86 V1 + 82 V2). Cakup 23 endpoint (21 V1 + 2 V2: `/upload/classify`, `/dashboard/stats`). Item tanpa bukti eksplisit = ASUMSI.

---

## Daftar Isi

1. Pendahuluan
2. Strategi Pengujian Menyeluruh
3. Level Pengujian & Tujuan
4. Lingkungan & Tooling Test
5. Test Data Management
6. Matriks Fitur -> Test Scenario (V1+V2)
7. Detail Test Case per Modul (V1+V2: TC-001..TC-134)
8. Pengujian Non-Fungsional (V1+V2)
9. Target Coverage & Cara Ukur
10. Entry & Exit Criteria + Definition of Done
11. Strategi Regression, Smoke Test, Bug Tracking
12. Risiko Pengujian & Mitigasi
13. Checklist Sign-off QA
14. Asumsi Test + Referensi

---

## 1. Pendahuluan

### 1.1 Tujuan

Test plan V2 menjabarkan strategi, level, skenario, test case, lingkungan, coverage target, entry/exit criteria, regression, risiko, dan sign-off QA untuk **PromptFlow V2**. V1 = foundation. V2 = upgrade: upload di generate page + AI image classification + story description + real-time logs + dashboard enrichment + UI consistency + SQA + navigation optimization + GitHub push. Plan ini OVERWRITE V1 tetapi mempertahankan semua 86 TC V1 + menambah 49 TC V2.

- Verifikasi SEMUA fitur PRD V2 (FR-01..FR-19 + FR-V2-01..FR-V2-10) via test scenario.
- Verifikasi SEMUA endpoint API_CONTRACT V2 (23 endpoint) punya contract test.
- Verifikasi komponen UIUX_SPEC V2 (V1 + 17 komponen baru) punya test visual/interaksi/a11y.
- Verifikasi CODING_RULES V2 (L01-L38, 80% coverage) tercapai.
- Verifikasi DATABASE_SCHEMA V2 (3 kolom nullable baru) teruji.
- Verifikasi NFR V1 + V2 terukur.

Sitasi: `PRD.md V2.0 S1, S5, S7` ; `SRS.md V2.0 S1, S6, S13` ; `API_CONTRACT.md V2.0 S5, S7` ; `CODING_RULES.md V2.0 S7, S11` ; `UIUX_SPEC.md V2.0 S3, S9, S13`.

### 1.2 Lingkup Test

#### In Scope (V1 + V2)

| # | Cakupan | Bukti |
|---|---|---|
| 1 | Input & generasi V1 FR-01..FR-12 | `PRD.md V2.0 S5, S7` |
| 2 | Multi-provider FR-13 + enkripsi FR-14 | `PRD.md V2.0 S5` |
| 3 | Save + CRUD FR-15, Export FR-16 | `PRD.md V2.0 S5` |
| 4 | Upload FR-17 (V2: pindah ke generate page, 6-tipe, auto-classify) | `PRD.md V2.0 S5 FR-V2-01..FR-V2-03` |
| 5 | Login FR-18, Dwibahasa FR-19 | `PRD.md V2.0 S5` |
| 6 | **V2 FR-V2-01**: Image reference di generate page (multi-file) | `PRD.md V2.0 S5 FR-V2-01, S7 AC-V2-01` |
| 7 | **V2 FR-V2-02**: AI image classification (Vision LLM, fallback) | `PRD.md V2.0 S5 FR-V2-02, S7 AC-V2-02` |
| 8 | **V2 FR-V2-03**: Extended role 6 opsi | `PRD.md V2.0 S5 FR-V2-03, S7 AC-V2-03` |
| 9 | **V2 FR-V2-04**: Deskripsi cerita (max 500 char) | `PRD.md V2.0 S5 FR-V2-04, S7 AC-V2-04` |
| 10 | **V2 FR-V2-05**: Real-time logs (SSE log event, Collapsible, toggle) | `PRD.md V2.0 S5 FR-V2-05, S7 AC-V2-05` |
| 11 | **V2 FR-V2-06**: Dashboard enrichment (6-8 cards, charts, tables) | `PRD.md V2.0 S5 FR-V2-06, S7 AC-V2-06` |
| 12 | **V2 FR-V2-07**: Konsistensi UI (loading.tsx, error.tsx, tokens) | `PRD.md V2.0 S5 FR-V2-07, S7 AC-V2-07` |
| 13 | **V2 FR-V2-09**: Navigation (pagination, Suspense, transition <=200ms) | `PRD.md V2.0 S5 FR-V2-09, S7 AC-V2-09` |
| 14 | **V2 FR-V2-10**: Push ke GitHub | `PRD.md V2.0 S5 FR-V2-10, S7 AC-V2-10` |
| 15 | 23 endpoint (21 V1 + 2 V2) contract test | `API_CONTRACT.md V2.0 S5` |
| 16 | lib/ai (V1 + image-classifier + log-buffer), lib/db (+dashboard.repo V2), lib/crypto, lib/validation (V2 extended), lib/export, lib/storage | `SRS.md V2.0 S6` |
| 17 | UI V1 + V2 (LogViewer, ClassificationResult, AssetPreviewList, MetricCard, Pagination, PageLoadingSkeleton, PageErrorBoundary, ConfidenceBar, RoleBadge, StoryDescriptionTextarea) | `UIUX_SPEC.md V2.0 S3` |
| 18 | NFR V1 (P1-P5, S1-S6, A1-A3, I1-I2) + V2 (NFR-V2-P1..P4, NFR-V2-U1..U4) | `PRD.md V2.0 S6` |
| 19 | Schema V2: 3 kolom nullable (story_description, ai_classification, logs_json) | `DATABASE_SCHEMA.md V2.0 S7.2, S9.3` |

#### Out of Scope (V1 + V2)

| # | Out of Scope | Alasan | Bukti |
|---|---|---|---|
| OOS-T1..T14 | V1 unchanged | (lihat V1) | `TEST_PLAN.md V1 S1.2.2` |
| OOS-T15 | Dark mode toggle | Token defined, toggle deferred V3 | `PRD.md V2.0 S11 OOS-10` |
| OOS-T16 | AI SDK upgrade v4->v6 | Breaking changes OOS V2 | `RAG-CONTEXT.md S2, S5.1` |
| OOS-T17 | Schema migration besar | Additive only | `DATABASE_SCHEMA.md V2.0 S9.3` |
| OOS-T18 | Vision LLM di client-side | Server-only security (L31) | `SRS.md V2.0 S6.2` |
| OOS-T19 | Multi-language output prompt | Ikut judul | `PRD.md V2.0 S11 OOS-11` |
| OOS-T20 | Load test skala produksi | Smoke perf cukup | ASUMSI |
| OOS-T21 | Chaos/fuzz test ekstensif | Fase akhir | ASUMSI |

### 1.3 Stack Test

| Lapisan | Tool | Versi | Bukti |
|---|---|---|---|
| Unit test | Vitest | `^2.1.0` | `package.json:74` |
| Integration test | Vitest + Turso test DB / SQLite in-memory | stabil | `SRS.md V2.0 S13.1` |
| E2E test | Playwright | `^1.49.0` | `package.json:77` |
| A11y test | axe-playwright (`@axe-core/playwright`) | stabil | `UIUX_SPEC.md V2.0 S9` |
| Lint | ESLint + `next lint` + `@typescript-eslint` + `eslint-plugin-jsx-a11y` | `^9.17.0` | `package.json:65-66` |
| Typecheck | `tsc --noEmit` (TS strict 5.7) | `^5.7.0` | `package.json:60` |
| Build | `next build` | `^15.1.0` | `package.json:22` |
| Mock | `vi.mock` (Vitest), AI SDK v4 mock, Drizzle mock, Vercel Blob mock, V2: Vision LLM mock | bawaan Vitest | `CODING_RULES.md V2.0 S7.2` |
| Coverage | `@vitest/coverage-v8` | `^2.1.0` | `package.json:75` |
| CI | GitHub Actions | n/a | `CODING_RULES.md V2.0 S11.1` |

### 1.4 Asumsi Awal

| ID | Asumsi | Bukti |
|---|---|---|
| TP-A1 | Vitest + Playwright = framework resmi | `SRS.md V2.0 S13.1` |
| TP-A2 | Coverage unit >= 80% line+branch | `CODING_RULES.md V2.0 S7.1 CR-A10` |
| TP-A3 | E2E critical path 100% | `SRS.md V2.0 S13.1` |
| TP-A4 | Lint 0 error + typecheck 0 error + build pass = CI gate | `CODING_RULES.md V2.0 S11.1` |
| TP-A5 | Mock LLM di unit/integration, real provider manual/staging | `CODING_RULES.md V2.0 S7.2` |
| TP-A6 | Test DB = Turso lokal atau SQLite in-memory | `SRS.md V2.0 S13.1` |
| TP-A7 | AAA pattern wajib | `CODING_RULES.md V2.0 S7.2` |
| TP-A8 | Co-located `*.test.ts`, E2E `e2e/*.spec.ts` | `CODING_RULES.md V2.0 S7.2` |
| TP-A9 | Batas tokoh 10/project (Zod app-layer) | `DATABASE_SCHEMA.md V2.0 S13.7` |
| TP-A10 | Rate limit 10 req/min generate, 30/min classify | `SRS.md V2.0 S14 SRS-V2-A15` |
| TP-A11 | File upload 10MB max, mime `image/*` | `SRS.md V2.0 S9.1` |
| TP-V2-1 | Vision LLM = GPT-4o/Gemini, env `VISION_LLM_API_KEY` | `SRS.md V2.0 S6.2` |
| TP-V2-2 | storyDescription optional max 500 char | `SRS.md V2.0 S6.4` |
| TP-V2-3 | LogViewer Collapsible + Switch default OFF, max 500 entries | `API_CONTRACT.md V2.0 S7.5` |
| TP-V2-4 | Dashboard 6-8 cards + charts + tables, load <= 1.5s | `SRS.md V2.0 S6.6, S11 NFR-V2-P2` |
| TP-V2-5 | Upload di generate page = pre-submit (projectId nullable) | `SRS.md V2.0 S6.1, S14 SRS-V2-A5` |
| TP-V2-6 | Role classification 6 opsi (V2 enum) | `SRS.md V2.0 S6.3` |
| TP-V2-7 | Confidence threshold 0.7, low = warning + override | `SRS.md V2.0 S6.2` |
| TP-V2-8 | Auto-trigger classify saat upload | `PRD.md V2.0 S9.3` |
| TP-V2-9 | Pagination default 20/page, max 100/page | `API_CONTRACT.md V2.0 S4.1` |
| TP-V2-10 | Recharts untuk dashboard charts | `UIUX_SPEC.md V2.0 S12.5` |
| TP-V2-11 | Push GitHub = public repo | `SRS.md V2.0 S14 SRS-V2-A7` |
| TP-V2-12 | Vision LLM key dari env, bukan user input | `CODING_RULES.md V2.0 S6.1 SEC-C22` |
| TP-V2-13 | Log buffer in-memory, persist saat done | `SRS.md V2.0 S6.5` |
| TP-V2-14 | 3 kolom V2 additive nullable | `DATABASE_SCHEMA.md V2.0 S7.2, S9.3` |

---

## 2. Strategi Pengujian Menyeluruh

### 2.1 Test Pyramid

```
        /\
       /E2E\        Playwright: login -> set provider -> upload+classify
      /------\      -> generate(logs) -> save -> export -> dashboard(paginate)
     /Integration\  Vitest + test DB: 23 route handlers, 9 repos + dashboard.repo
    /--------------\ Target >=70%
   /     Unit       \ Vitest: lib/ai (V1+image-classifier+log-buffer),
  /------------------\ lib/db (+dashboard.repo), lib/crypto, lib/validation.
                        Target >=80% line+branch
```

Sitasi: `CODING_RULES.md V2.0 S7.1` ; `SRS.md V2.0 S13.1`.

### 2.2 V2 Perubahan Strategi

| Aspek | V1 | V2 | Bukti |
|---|---|---|---|
| Scope unit | lib/ai, lib/db, lib/crypto, lib/validation, lib/storage, lib/export | + image-classifier.ts, log-buffer.ts, prompt-builder.ts (V2 inject) | `SRS.md V2.0 S6.2, S6.4, S6.5` |
| Scope integration | 21 route handlers | 23 route handlers (+ `/upload/classify`, `/dashboard/stats`) | `API_CONTRACT.md V2.0 S5` |
| Scope E2E | login + generate + export | + upload di generate + AI classify + story desc + log toggle + dashboard load + pagination | `UIUX_SPEC.md V2.0 S6` |
| Mock tambahan | AI SDK + Drizzle + Blob | + Vision LLM, Recharts render mock, log buffer | `CODING_RULES.md V2.0 S7.2` |
| Schema test | 9 tabel | 9 tabel + 3 kolom nullable + Zod extended 6-tipe + storyDescription | `DATABASE_SCHEMA.md V2.0 S9.3` |

### 2.3 Mocking Strategy

| Komponen | Mock di Unit | Mock di Integration | Real di E2E |
|---|---|---|---|
| AI SDK v4 | `vi.mock('ai')`, `vi.mock('@ai-sdk/openai-compatible')` | Mock `generateObject`/`streamObject` | Mock via route intercept |
| **V2: Vision LLM** | `vi.mock('@/lib/ai/image-classifier')` return fake ClassificationResult | Mock `classifyImage()` return fixture | Mock via route intercept |
| Drizzle / @libsql/client | `vi.mock('@/lib/db/client')` return fake repo | Turso test DB / SQLite in-memory | Turso staging |
| Vercel Blob | `vi.mock('@/lib/storage/blob')` return fake url | Mock `put`/`del` | FS `public/references/` dev |
| NextAuth | `vi.mock('@/lib/auth/config')` return fake session | Mock `auth()` return test session | Real credentials demo user |
| **V2: SSE log events** | n/a | Mock stream inject log events | Mock via Playwright |
| Node crypto | TIDAK mock | TIDAK mock | TIDAK mock |

### 2.4 Pola Test Case (AAA)

```
describe('FR-V2-04 storyDescription validation', () => {
  it('menolak storyDescription > 500 char', () => {
    // Arrange
    const input = { title: 'Valid', storyDescription: 'x'.repeat(501), ... };
    // Act
    const result = GenerateInputSchema.safeParse(input);
    // Assert
    expect(result.success).toBe(false);
  });
});
```

### 2.5 Strategi V2 Khusus

| V2 Aspek | Strategi | Bukti |
|---|---|---|
| Vision LLM flakiness | Mock 100% CI. Test 4 path: success/confidence-high/confidence-low/fail | `RAG-CONTEXT.md S10 B` |
| SSE log events | Mock streamObject + sinkronisasi log buffer. Assert `event: log` muncul | `API_CONTRACT.md V2.0 S7` |
| 6-tipe enum | Unit test 6 nilai valid + Zod reject 7th | `SRS.md V2.0 S9.4` |
| Dashboard charts | Recharts di-mock di unit; Playwright render | `UIUX_SPEC.md V2.0 S12.5` |
| loading.tsx/error.tsx | Playwright intercept + assert skeleton render | `UIUX_SPEC.md V2.0 S13.1-13.2` |
| Pagination | Unit test paginate query + E2E prev/next + URL query | `API_CONTRACT.md V2.0 S4.1` |
| Log sanitization XSS | Unit test escape HTML + E2E inject script -> escaped | `CODING_RULES.md V2.0 S6.1 SEC-C24` |
| Story description counter | Unit test Zod max 500 + Playwright UI counter danger > 480 | `UIUX_SPEC.md V2.0 S10.2` |

---

## 3. Level Pengujian & Tujuan

| Level | Tool | Tujuan | Scope (V1+V2) | Target Coverage | Bukti |
|---|---|---|---|---|---|
| Unit | Vitest | Logic murni: Zod, AES, prompt-builder, consistency-checker, repo, markdown, **V2: image-classifier, log-buffer, dashboard.repo** | `lib/ai/*.ts` (V1+V2), `lib/db/repositories/*.ts` (V1+dashboard.repo), `lib/crypto/aes.ts`, `lib/validation/schemas.ts` (V2 ext), `lib/export/*`, `lib/storage/*` | >= 80% line+branch | `SRS.md V2.0 S13.1` |
| Integration | Vitest + test DB | Route handler + Server Action + DB query + middleware auth + RBAC | `src/app/api/v1/*/route.ts` (23), Server Actions, repos (real Drizzle + test DB) | >= 70% | `SRS.md V2.0 S13.1` |
| API/Contract | Vitest + Playwright | 23 endpoint API_CONTRACT: status, envelope, pagination, error, SSE event (**V2: log event + aiClassification**) | Semua `/api/v1/*` | 100% happy+error | `API_CONTRACT.md V2.0 S5, S7` |
| E2E/UI | Playwright | Critical flow: login -> set provider -> upload+classify -> generate(logs) -> save -> export; dashboard; pagination; a11y axe | Critical path V1+V2 | 100% pass | `SRS.md V2.0 S13.1` |
| UAT | Manual | Kualitas output LLM + Vision LLM akurasi + log usefulness | Sample output + classification | Sign-off | `PRD.md V2.0 S7` |
| Performance | Vitest timing + Playwright | Shorts <=60s, Tutorial <=180s, token <10s, **V2: page transition <=200ms, dashboard <=1.5s, classify <=5s, log latency <=100ms** | Generate, page, DB, classify, dashboard | NFR tercapai | `PRD.md V2.0 S6.1` |
| Security | Unit + integration + audit | API key encrypt, mask, RBAC, Zod, no secret client, rate limit, upload mime+size, **V2: Vision LLM key env-only, storyDescription max 500, log sanitization, orphan asset cleanup** | All security modules | 0 leak, 0 bypass | `CODING_RULES.md V2.0 S6.1` |
| Accessibility | axe-playwright + manual | WCAG 2.1 AA: kontras, keyboard, focus, ARIA, skip link, reduce motion, **V2: LogViewer role+aria-live, Pagination aria-current, MetricCard aria-label, Chart aria-label, error.tsx role** | Login, dashboard, generate, projects, detail, settings | 0 violation AA | `UIUX_SPEC.md V2.0 S9` |
| Compatibility | Playwright multi-browser | Chrome 120+, Edge 120+, Firefox 120+, Safari 17+, Mobile Safari iOS 17+, Chrome Android 120+ | Critical V1+V2 | Pass semua | `UIUX_SPEC.md V2.0 S12.3` |

---

## 4. Lingkungan & Tooling Test

### 4.1 Lingkungan

| Env | Tujuan | DB | Storage | LLM | Vision LLM (V2) | Env Vars |
|---|---|---|---|---|---|---|
| Local Dev | App + unit/integration | SQLite in-memory / Turso lokal | FS `public/references/` | Mock atau 9router | Mock `vi.mock('@/lib/ai/image-classifier')` | TURSO_*, ENCRYPTION_KEY, NEXTAUTH_SECRET, USE_VERCEL_BLOB=false, **V2: VISION_LLM_*** |
| CI (GitHub Actions) | lint+typecheck+unit+build+e2e | Turso test DB / SQLite in-memory | Mock Blob | Mock LLM | Mock Vision LLM | sama + CI=true |
| Staging (Vercel preview) | PR preview, smoke+perf | Turso staging | Vercel Blob staging | Mock route intercept | Mock | + BLOB_READ_WRITE_TOKEN |
| Prod (Vercel) | Live user | Turso prod | Vercel Blob prod | Real provider user | Real Vision LLM | semua prod env |

### 4.2 Env Vars Test

| Env | Wajib test | Catatan |
|---|---|---|
| ENCRYPTION_KEY | YA (32 byte base64) | `Buffer.alloc(32,1).toString('base64')` |
| TURSO_DATABASE_URL | YA integration | Test DB terpisah |
| TURSO_AUTH_TOKEN | YA integration | Test token |
| NEXTAUTH_SECRET | YA | Test secret |
| BLOB_READ_WRITE_TOKEN | Opsional (mock default) | Real upload integration |
| USE_VERCEL_BLOB | `false` di local/e2e | FS fallback |
| NEXT_PUBLIC_APP_URL | `http://localhost:3000` | Provider header |
| **V2: VISION_LLM_API_KEY** | YA (test dummy) | **Bukan key real** |
| **V2: VISION_LLM_BASE_URL** | YA | Default `https://api.openai.com/v1` |
| **V2: VISION_LLM_MODEL** | YA | Default `gpt-4o-mini` |
| **V2: VISION_LLM_PROVIDER** | YA | Enum `openai`/`gemini` |

### 4.3 Konfigurasi Tooling

#### vitest.config.ts

```
test: {
  environment: 'node',
  globals: true,
  include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'junit'],
    include: ['src/lib/**', 'src/app/api/**'],
    exclude: ['**/*.test.ts', 'src/components/ui/**'],
    thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
  },
  setupFiles: ['./tests/setup.ts'],
}
```

#### playwright.config.ts

```
testDir: './e2e',
timeout: 120000,
expect: { timeout: 60000 },
projects: [
  { name: 'chromium' }, { name: 'firefox' },
  { name: 'webkit' }, { name: 'mobile-safari' },
]
```

### 4.4 Test Folder Structure

```
tests/
  setup.ts
  helpers/factories.ts, fixtures.ts, sse-mock.ts, db-helpers.ts
e2e/
  generate-shorts.spec.ts, generate-tutorial.spec.ts
  upload-classify-generate.spec.ts    (V2)
  dashboard.spec.ts                    (V2)
  pagination.spec.ts                   (V2)
  loading-error.spec.ts                (V2)
  a11y.spec.ts, login.spec.ts, dwibahasa.spec.ts
  export-json.spec.ts, export-markdown.spec.ts
  settings-provider.spec.ts
src/
  lib/
    crypto/aes.test.ts
    validation/schemas.test.ts (V2: +6-tipe + storyDescription)
    ai/prompt-builder.test.ts, response-parser.test.ts,
       consistency-checker.test.ts, provider-registry.test.ts
       image-classifier.test.ts (V2), log-buffer.test.ts (V2)
    db/repositories/* + dashboard.repo.test.ts (V2)
    export/markdown.template.test.ts, storage/blob.test.ts
  app/api/v1/ + upload/classify/route.test.ts (V2)
              + dashboard/stats/route.test.ts (V2)
  components/ + V2: log-viewer, classification-result, metric-card,
               pagination, page-loading-skeleton, page-error-boundary
```

---

## 5. Test Data Management

### 5.1 Factory Functions (V2 extended)

V1 factories (dipertahankan): `makeUser`, `makeProviderConfig`, `makeProject`, `makeCharacter`, `makeScene`, `makeImagePrompt`, `makeAssetReference` (V2: projectId nullable, aiClassification), `makeGenerationLog` (V2: +logsJson), `makeSupportingCharacter`.

V2 BARU: `makeClassificationResult({role,name,description,confidence})`, `makeLogEntry({level,message,timestamp})`, `makeDashboardStats()`, `makePaginated(data, page, limit, total)`.

### 5.2 Fixture (V1 + V2)

V1: `fixturePromptPackageShorts`, `fixturePromptPackageTutorial`, `fixturePromptPackageWithRef`, `fixturePromptPackageInvalid`, `fixtureConsistencyMismatch`.

V2 BARU: `fixtureClassificationHigh` (confidence 0.92), `fixtureClassificationLow` (confidence 0.55), `fixtureClassificationFailed` (null), `fixtureDashboardStats`, `fixtureDashboardEmpty`, `fixtureLogBuffer` (3 entries: info/warn/error).

### 5.3 Fixture Gambar (V2 extended)

`hero-ref.png` (tokoh), `hutan-bg.jpg` (background), **V2: `meja-prop.png` (prop), `kacamata-accessory.png` (accessory)**, `invalid.txt` (mime invalid), `oversize.bin` (11MB).

### 5.4 Sanitasi Data Test

- TIDAK pakai data prod.
- API key = dummy `sk-test-xxxxx`.
- ENCRYPTION_KEY = `Buffer.alloc(32,1)`.
- **V2: VISION_LLM_API_KEY = `sk-vision-test-xxxxx`.**
- User demo (`demo@promptflow.local`/`demo123`) HANYA e2e dev.

---

## 6. Matriks Fitur -> Test Scenario (V1 + V2)

### 6.1 Matriks FR -> Test Scenario

Tiap fitur PRD V1 (FR-01..FR-19) + V2 (FR-V2-01..FR-V2-10) + AC-nya WAJIB punya minimal 1 test scenario (happy + edge).

| FR | AC | Test Scenario (happy) | Test Scenario (edge case) | Level | Relasi Endpoint |
|---|---|---|---|---|---|
| FR-01 Input judul | AC-01 | Input title valid (3-200 char) -> tersimpan + di-inject prompt | Empty -> 400; <3 char -> 400; >200 -> 400; whitespace only -> 400; XSS `<script>` -> escaped | Unit + E2E | POST /api/v1/projects, POST /api/v1/generate |
| FR-02 Input durasi | AC-02 | duration_type shorts/tutorial + target_seconds valid -> tersimpan | shorts >180s -> 422; tutorial di luar 420-900 -> warning; duration_type invalid -> 400 | Unit + Integration + E2E | POST /api/v1/projects, POST /api/v1/generate |
| FR-03/09 Adegan urut | AC-03/09 | scenes[] ter-generate order 1..N, description non-kosong, jumlah sesuai durasi (shorts 3-6, tutorial 8-20) | scenes kosong -> error; order duplikat -> 400; jumlah di luar range -> warning | Integration + E2E | POST /api/v1/generate (SSE) |
| FR-04 Voiceover | AC-04 | tiap scene voiceover_script teks non-kosong | voiceover_script kosong -> Zod fail | Integration | POST /api/v1/generate |
| FR-05 Auto karakter/bg | AC-05 | tanpa referensi -> character_profiles[] + image_prompts.backgrounds[] terisi | reference_images kosong -> branch invent; ada referensi -> pakai ref | Integration | POST /api/v1/generate |
| FR-06 Image prompt per tokoh/bg | AC-06 | image_prompts.characters[] = N untuk N tokoh; backgrounds[] = M; prompt_text detail | tokoh count mismatch -> warning; prompt_text kosong -> fail | Integration | POST /api/v1/generate |
| FR-07 Tokoh terstruktur | AC-07 | tiap karakter field lengkap; **V2: 6-tipe enum** | field hilang -> Zod fail; peran invalid enum -> fail | Integration | POST /api/v1/generate |
| FR-08 Karakter pendukung | AC-08 | supporting_characters[] terisi bila ada, tiap aksi non-kosong | tipe invalid (bukan pendukung/hewan) -> fail | Integration | POST /api/v1/generate |
| FR-10 Gaya+rasio | AC-10 | style (3D/2D) + aspect_ratio muncul di root JSON + di-inject image prompts | style invalid -> fail; aspect_ratio custom valid | Unit + Integration | POST /api/v1/generate |
| FR-11 Pesan moral | AC-11 | moral_message non-kosong di akhir paket, positif | moral_message kosong -> fail | Integration + manual | POST /api/v1/generate |
| FR-12 Konsistensi karakter | AC-12 | identitas SAMA di character_profiles & scenes[]; aksi/latar boleh beda | mismatch identitas -> warning (tidak block save) | Unit + Integration | POST /api/v1/generate (event done warnings) |
| FR-13 Multi-provider | AC-13 | form provider select + base URL pre-fill + model + API key save; provider aktif dipakai generate | provider invalid -> 400; base URL non-URL -> 400; duplikat nama -> 409 | Unit + Integration + E2E | GET/POST /api/v1/settings/providers, PATCH/DELETE, /test |
| FR-14 Enkripsi API key | AC-14 | API key encrypt di DB; response mask `****`; decrypt server-only | plaintext bocor di response -> fail; decrypt di client -> fail | Unit + Integration + Security audit | POST/GET /api/v1/settings/providers |
| FR-15 Save + CRUD project | AC-15 | create project; list paginate per user; detail ownership; update; soft delete | project milik user lain -> 403; id tidak ada -> 404; soft delete hilang dari list | Integration + E2E | GET/POST /api/v1/projects, GET/PATCH/DELETE /api/v1/projects/[id] |
| FR-16 Export | AC-16 | export JSON valid struktur; export markdown terbaca lengkap | format invalid -> 400; project belum generate -> 409/404 | Integration + E2E | GET /api/v1/projects/[id]/export |
| FR-17 Upload referensi | AC-17 + **V2 MAJOR** | upload multipart (6-tipe V2) di **generate page** (V2); projectId nullable; auto-classify V2; reference_filename muncul di image_prompts | mime invalid -> 400; size >10MB -> 400; projectId bukan milik -> 403 | Integration + E2E | POST /api/v1/upload, POST /api/v1/upload/classify |
| FR-18 Login | AC-18 | NextAuth login berfungsi; protected routes redirect ke login bila unauth | wrong password -> 401; session expired -> redirect | E2E + Integration | POST /api/v1/auth/[...nextauth], GET /api/v1/auth/session |
| FR-19 Dwibahasa | AC-19 | toggle ID/EN mengubah UI label; pesan error bahasa aktif | key hilang di salah satu locale -> unit test fail | Unit + E2E | n/a (UI) |
| **V2 FR-V2-01** Image reference di generate page | AC-V2-01 | DropzoneUploader inline di generate form (multi-file drag-drop); upload tanpa projectId (orphan ref); backward compat project detail read-only | upload > 10 file -> reject; projectId not milik user -> 403; remove orphan ref -> hapus | Unit + Integration + E2E | POST /api/v1/upload (projectId opsional), DELETE /api/v1/upload |
| **V2 FR-V2-02** AI image classification | AC-V2-02 | upload -> auto-trigger Vision LLM classify -> result visible (role + name + desc + confidence); manual override; fallback ke manual select jika Vision LLM gagal; cache result di `ai_classification` | confidence < 0.7 -> warning + suggest override; Vision LLM fail (502) -> manual fallback; orphan ref tanpa projectId -> tetep classify | Unit + Integration + E2E | POST /api/v1/upload (auto-classify), POST /api/v1/upload/classify |
| **V2 FR-V2-03** Extended role 6 opsi | AC-V2-03 | 6 opsi tipe: tokoh/background/prop/accessory/environment/other; Zod enum valid; DropzoneUploader select updated; prompt builder inject 6-tipe | tipe invalid (7th value) -> Zod 400; upload V1 value (tokoh/background) tetap valid | Unit + E2E | POST /api/v1/upload, POST /api/v1/generate |
| **V2 FR-V2-04** Field deskripsi cerita | AC-V2-04 | Textarea opsional di bawah judul max 500 char; inject ke `buildUserMessage()`; simpan di `projects.story_description`; UI char counter + danger > 480 | >500 char -> 400; whitespace only -> trim + simpan empty; XSS `<script>` -> escaped; counter color danger > 480 | Unit + Integration + E2E | POST /api/v1/projects (+storyDescription), POST /api/v1/generate (+input.storyDescription) |
| **V2 FR-V2-05** Real-time processing logs | AC-V2-05 | SSE event type `log` dengan `level`/`message`/`timestamp`; LogViewer Collapsible panel; show/hide toggle Switch default OFF; toggle OFF = no render; persist `logs_json` di `generation_logs` saat done; max buffer 500 entries | XSS `<script>` di log message -> escaped saat render; toggle ON/OFF cepat tanpa delay; log event missing field -> graceful skip; buffer overflow 500 -> drop oldest | Unit + Integration + E2E | POST /api/v1/generate (SSE log event), GET /api/v1/projects/[id]/logs (+logsJson) |
| **V2 FR-V2-06** Dashboard enrichment | AC-V2-06 | 6-8 metric cards (total projects, successful, avg duration, total uploads, success rate, active providers) + line chart (weekly trend) + bar chart (success vs fail) + per-provider breakdown table (5 col) + recent activity table (5 rows) + storage usage card | dashboard load <= 1.5s (NFR-V2-P2); data kosong -> EmptyState; 0 projects -> 0 metric valid; range filter ?range=7d | Integration + E2E + Performance | GET /api/v1/dashboard/stats |
| **V2 FR-V2-07** Konsistensi UI | AC-V2-07 | `loading.tsx` per page group (`/generate`, `/projects`, `/projects/[id]`, `/dashboard`, `/settings`) render PageLoadingSkeleton; `error.tsx` boundary per page render PageErrorBoundary dengan retry + home link; form disabled saat loading/generating; design tokens konsisten (primary violet #7c3aed, Inter font, 4px spacing, 6px radius) | loading.tsx missing -> fallback default; error boundary throw -> retry; nested error -> root boundary | E2E + Visual | n/a (UI) |
| **V2 FR-V2-08** SQA testing menyeluruh | AC-V2-08 | coverage >= 80% unit; E2E critical 100% pass; lint 0 error; typecheck 0 error; build pass; a11y axe 0 violation; performance target tercapai | critical modul 100% (image-classifier, log-buffer, dashboard.repo, aes); coverage drop < 80% -> CI fail | CI gate | n/a |
| **V2 FR-V2-09** Navigation optimization | AC-V2-09 | pagination projects list `?page=&limit=` (default 20, max 100); Pagination component page numbers + prev/next; page transition <= 200ms (NFR-V2-P1); Suspense boundaries; loading.tsx; Next.js Link prefetch | page < 1 -> 400; limit > 100 -> clamp ke 100; page > totalPages -> empty list; URL query string berubah sesuai page | Unit + E2E + Performance | GET /api/v1/projects?page=&limit= |
| **V2 FR-V2-10** Push ke GitHub | AC-V2-10 | `git init`; `.gitignore` lengkap (node_modules, .env.local, .next, public/references, *.tsbuildinfo, drizzle/meta); README updated; commit conventional; push ke `https://github.com/agrianwahab29/promptflow.git` | .env.local bocor -> .gitignore catch; secret commit -> CI fail; large file > 100MB -> GitHub reject | Manual + CI | n/a |

### 6.2 Matriks Endpoint -> Contract Test (V1 + V2 = 23 endpoint)

| # | Endpoint | Method | Contract Test Happy | Contract Test Error | V1/V2 |
|---|---|---|---|---|---|
| 1 | /api/v1/auth/[...nextauth] | GET/POST | login valid -> set cookie session | wrong credential -> 401 | V1 |
| 2 | /api/v1/auth/session | GET | authed -> return user; unauth -> null | n/a | V1 |
| 3 | /api/v1/health | GET | DB ok -> 200 status ok | DB down -> 503 | V1 |
| 4 | /api/v1/projects | GET | authed + data -> 200 paginated `{data[], pagination{}}` | unauth -> 401; invalid page/limit -> 400; page > totalPages -> empty | V1+V2 |
| 5 | /api/v1/projects | POST | valid + `storyDescription` (V2) -> 201 ProjectDTO | invalid Zod -> 400; shorts >180 -> 422; `storyDescription` > 500 -> 400; unauth -> 401 | V1+V2 |
| 6 | /api/v1/projects/[id] | GET | milik user -> 200 detail (include `storyDescription` V2) | milik user lain -> 403; tidak ada -> 404; unauth -> 401 | V1 |
| 7 | /api/v1/projects/[id] | PATCH | valid update -> 200 | milik lain -> 403; tidak ada -> 404; invalid -> 400 | V1 |
| 8 | /api/v1/projects/[id] | DELETE | soft delete -> 204 | milik lain -> 403; tidak ada -> 404 | V1 |
| 9 | /api/v1/generate | POST | valid + provider aktif -> SSE: stage + **V2: log event** + progress + done {result, warnings, **logs[]**, generationLogId} | invalid Zod -> 400; unauth -> 401; projectId bukan milik -> 409; shorts >180 -> 422; `storyDescription` > 500 -> 400; rate limit -> 429; provider error -> 502 SSE error; timeout -> 504 | V1+V2 |
| 10 | /api/v1/settings/providers | GET | authed -> 200 list (apiKeyMasked) | unauth -> 401 | V1 |
| 11 | /api/v1/settings/providers | POST | valid -> 201 (masked) | duplikat nama -> 409; invalid -> 400; unauth -> 401 | V1 |
| 12 | /api/v1/settings/providers/[id] | PATCH | valid update -> 200 (apiKey opsional tidak overwrite) | milik lain -> 403; tidak ada -> 404; duplikat -> 409 | V1 |
| 13 | /api/v1/settings/providers/[id] | DELETE | hapus -> 204 | milik lain -> 403; tidak ada -> 404 | V1 |
| 14 | /api/v1/settings/providers/[id]/test | POST | provider reachable -> 200 {ok, latencyMs, sample} | provider gagal -> 502; milik lain -> 403 | V1 |
| 15 | /api/v1/upload | POST | multipart valid 6-tipe (V2) + auto-classify (V2) -> 201 AssetReference (+`aiClassification` V2 nullable) | mime invalid -> 400; size >10MB -> 400; projectId bukan milik -> 403; `tipe` invalid (bukan 6 opsi V2) -> 400; unauth -> 401 | V1+V2 |
| 16 | **/api/v1/upload/classify** | POST | trigger Vision LLM -> 200 {data:{role, name, description, confidence}} | invalid input -> 400; assetReferenceId not found -> 404; Vision LLM fail -> 502 CLASSIFICATION_ERROR; rate limit 30/min -> 429; unauth -> 401 | **V2 NEW** |
| 17 | /api/v1/upload | DELETE | hapus by name + projectId (V2: projectId opsional) -> 204 | tidak ada -> 404; bukan milik -> 403 | V1+V2 |
| 18 | /api/v1/projects/[id]/export | GET | format=json -> 200 application/json attachment; format=markdown -> 200 text/markdown | format invalid -> 400; project belum generate -> 409; bukan milik -> 403 | V1 |
| 19 | /api/v1/projects/[id]/characters | GET | milik user -> 200 list; filter peran | bukan milik -> 403 | V1 |
| 20 | /api/v1/projects/[id]/scenes | GET | milik user -> 200 list urut orderNo | bukan milik -> 403 | V1 |
| 21 | /api/v1/projects/[id]/image-prompts | GET | milik user -> 200 list; **V2: filter `tipe` 6 nilai** | bukan milik -> 403 | V1+V2 |
| 22 | /api/v1/projects/[id]/logs | GET | milik user -> 200 paginated; **V2: +`logsJson` per log + `provider` filter** | bukan milik -> 403 | V1+V2 |
| 23 | **/api/v1/dashboard/stats** | GET | authed + data -> 200 DashboardStatsDTO (totalProjects, perProviderBreakdown, recentProjects, storageUsage, weeklyTrend) | unauth -> 401; range invalid -> 400; 0 data -> empty arrays valid | **V2 NEW** |

### 6.3 Matriks Komponen UI -> Test Visual/Interaksi (V1 + V2)

Tiap komponen V1 + V2 UIUX_SPEC WAJIB punya test visual/interaksi + a11y. Komponen V2 BARU ditandai.

| Komponen | V1/V2 | Test Visual/Interaksi | A11y Test |
|---|---|---|---|
| PromptCard | V1 | render title+meta+status badge; click open; click delete confirm | aria-label delete |
| SceneCard | V1 | Collapsible expand/collapse; streaming state | aria-expanded |
| CharacterCard | V1 | render grid field; peran badge | aria-label peran |
| ImagePromptList | V1 | list item target+badge+prompt_text mono+copy | aria-label copy |
| ProviderConfigForm | V1 | form provider+baseUrl+model+apiKey mask+isActive | label htmlFor, aria-invalid |
| WizardStep | V1 | stepper header 5 step; nav Back/Next | aria-current step |
| ResultTabs | V1 | tabs Adegan/Voiceover/Karakter/Image Prompts/Pesan Moral; switch | aria-selected, aria-live |
| DropzoneUploader | V1+V2 | drag-drop; file list thumb+filename+**6-tipe select V2**+remove; **V2: di generate page (bukan project detail)** | role button, aria-label |
| CopyButton | V1 | click copy -> toast "Tersalin"; icon swap | aria-label |
| ExportMenu | V1 | dropdown JSON/Markdown; trigger download | aria-expanded |
| GenerateProgress | V1 | progress bar + status text per stage | role status, aria-live |
| EmptyState | V1 | render icon+title+desc+CTA | — |
| ErrorBoundary | V1 | fallback UI render; retry | — |
| LanguageToggle | V1 | toggle ID/EN; persist cookie | aria-label |
| AppHeader | V1+V2 | nav links; **V2: +Dasbor link** | nav landmark, skip link |
| **StoryDescriptionTextarea** | **V2** | Textarea + char counter (0/500) + clear button; counter danger > 480 | label, aria-describedby counter, maxLength |
| **AssetPreviewList** | **V2** | Grid 2-4 col: thumb + filename + RoleBadge + remove + override | role list, aria-label per item |
| **ClassificationResult** | **V2** | Card: thumb + RoleBadge + name (mono) + desc + ConfidenceBar + override select | aria-valuenow, aria-label confidence |
| **ConfidenceBar** | **V2** | Progress bar 0-1 + color level (low/mid/high) + value text | role progressbar, aria-valuenow |
| **LogViewer** | **V2** | Collapsible header (Switch + counter) + ScrollArea log list; toggle on/off; auto-scroll; **escape HTML per log line** | role log, aria-live polite |
| **LogEntry** | **V2** | Row: timestamp + level badge (info/warn/error) + message mono | role listitem |
| **RoleBadge** | **V2** | Pill badge icon + label per 6 role | aria-label role |
| **MetricCard** | **V2** | Card: label + value (text-2xl) + delta + icon | aria-label `[label]: [value]`, aria-busy |
| **WeeklyTrendChart** | **V2** | Line chart Recharts: x=minggu, y=jumlah; isAnimationActive false on reduce motion | aria-label chart title, role img |
| **SuccessFailBarChart** | **V2** | Bar chart Recharts: x=status, y=jumlah | aria-label chart title, role img |
| **PerProviderBreakdownTable** | **V2** | Table 5 col: provider + avg dur + sr% + calls + last used | scope table, caption |
| **RecentActivityTable** | **V2** | Table 5 col: title + status badge + duration + style + created (max 5) | scope table, caption |
| **StorageUsageCard** | **V2** | Card: icon + total files + total size + breakdown | aria-label storage |
| **Pagination** | **V2** | Page numbers + prev/next + first/last + total info; mobile simplified vs desktop full | aria-current page, aria-label |
| **PageLoadingSkeleton** | **V2** | Generic skeleton: 5 variant (generate/projects/detail/dashboard/settings) | role status, aria-busy |
| **PageErrorBoundary** | **V2** | Error fallback: icon + message + retry + home link | role alert, aria-live assertive |

---

## 7. Detail Test Case per Modul (V1: TC-001..TC-086, V2: TC-087..TC-134)

Format: ID | Modul | Precondition | Langkah | Input | Expected | Pass/Fail | Prioritas | Level | Relasi.

> **Total: 134 test case** (86 V1 + 48 V2). Tiap test case actionable — agent eksekutor bisa langsung jadikan kode test.

### 7.1 Modul Validasi (lib/validation/schemas.ts) — Unit (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-001 | ENCRYPTION_KEY set | Parse CreateProjectInputSchema | `{title:"ab",durationType:"shorts",...}` | fail (title <3) | success===false | high | Unit | POST /api/v1/projects |
| TC-002 | — | Parse CreateProjectInputSchema | `{title:"x".repeat(201),...}` | fail (title >200) | success===false | high | Unit | POST /api/v1/projects |
| TC-003 | — | Parse CreateProjectInputSchema | `{title:"  ",...}` | fail (empty after trim) | success===false | high | Unit | POST /api/v1/projects |
| TC-004 | — | Parse CreateProjectInputSchema | `{title:"Valid",durationType:"shorts",durationTargetSeconds:250,...}` | fail (shorts >180, 422) | success===false | high | Unit | POST /api/v1/projects |
| TC-005 | — | Parse CreateProjectInputSchema | `{title:"Valid",durationType:"tutorial",durationTargetSeconds:300,...}` | pass (tutorial <420 warning) | success===true | high | Unit | POST /api/v1/projects |
| TC-006 | — | Parse CreateProjectInputSchema | `{durationType:"invalid",...}` | fail (enum) | success===false | high | Unit | POST /api/v1/projects |
| TC-007 | — | Parse CreateProjectInputSchema | `{styleType:"4D",...}` | fail (enum 3D/2D) | success===false | high | Unit | POST /api/v1/projects |
| TC-008 | — | Parse PromptPackageSchema | fixturePromptPackageShorts | pass | success===true | high | Unit | POST /api/v1/generate |
| TC-009 | — | Parse PromptPackageSchema | fixturePromptPackageInvalid (moral_message hilang) | fail | success===false | high | Unit | POST /api/v1/generate |
| TC-010 | — | Parse ProviderConfigSchema | `{provider:"ollama",name:"x",baseUrl:"not-url",model:"m",apiKey:"k"}` | fail (baseUrl non-URL) | success===false | high | Unit | POST /api/v1/settings/providers |
| TC-011 | — | Parse ProviderConfigSchema | `{provider:"invalid",...}` | fail (enum) | success===false | high | Unit | POST /api/v1/settings/providers |
| **TC-087** | — | Parse GenerateInputSchema dengan storyDescription valid | `{title:"Valid",storyDescription:"Petualangan Wahab",...}` | pass | success===true | high | Unit | POST /api/v1/generate |
| **TC-088** | — | Parse GenerateInputSchema dengan storyDescription 501 char | `{title:"Valid",storyDescription:"x".repeat(501),...}` | fail (max 500) | success===false | high | Unit | POST /api/v1/generate |
| **TC-089** | — | Parse GenerateInputSchema tanpa storyDescription (optional) | `{title:"Valid",...}` | pass | success===true | high | Unit | POST /api/v1/generate |
| **TC-090** | — | Parse GenerateInputSchema.references[].type 6-tipe | `{...,references:[{name:"x",type:"prop"}]}` | pass | success===true | high | Unit | POST /api/v1/generate |
| **TC-091** | — | Parse GenerateInputSchema.references[].type invalid (7th) | `{...,references:[{name:"x",type:"invalid_type"}]}` | fail (enum) | success===false | high | Unit | POST /api/v1/generate |
| **TC-092** | — | Parse GenerateInputSchema.references[].aiClassification valid | `{...,references:[{name:"x",type:"tokoh",aiClassification:{role:"tokoh",name:"Wahab",description:"...",confidence:0.92}}]}` | pass | success===true | high | Unit | POST /api/v1/generate |
| **TC-093** | — | Parse GenerateInputSchema.references[].aiClassification.confidence > 1 | `{...,aiClassification:{role:"tokoh",name:"x",description:"d",confidence:1.5}}` | fail (max 1) | success===false | high | Unit | POST /api/v1/generate |
| **TC-094** | — | Parse ClassifyInputSchema valid | `{assetReferenceId: 99}` | pass | success===true | high | Unit | POST /api/v1/upload/classify |
| **TC-095** | — | Parse ClassifyInputSchema invalid | `{assetReferenceId: -1}` | fail | success===false | high | Unit | POST /api/v1/upload/classify |
| **TC-096** | — | Parse ClassificationResultSchema 6-tipe | `{role:"accessory",name:"Kacamata",description:"...",confidence:0.85}` | pass | success===true | high | Unit | POST /api/v1/upload/classify |
| **TC-097** | — | Parse ClassificationResultSchema invalid role | `{role:"invalid",name:"x",description:"d",confidence:0.5}` | fail | success===false | high | Unit | POST /api/v1/upload/classify |
| **TC-098** | — | Parse GenerationLogDTOSchema.logsJson valid array | `{...,logsJson:[{level:"info",message:"...",timestamp:"..."}]}` | pass | success===true | high | Unit | GET /api/v1/projects/[id]/logs |

### 7.2 Modul Crypto (lib/crypto/aes.ts) — Unit + Security (V1)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-012 | ENCRYPTION_KEY 32 byte | encrypt(plaintext) lalu decrypt | `"sk-or-v1-xxxxx"` | roundtrip ok, ciphertext != plaintext | critical | Unit+Security | POST /api/v1/settings/providers |
| TC-013 | — | mask(key) | `"sk-or-v1-abcde"` | `"****bcde"` | high | Unit | GET /api/v1/settings/providers |
| TC-014 | — | mask(key pendek) | `"ab"` | `"****"` | medium | Unit | GET /api/v1/settings/providers |
| TC-015 | — | Cek ciphertext di DB BUKAN plaintext | save provider lalu query DB | api_key_encrypted JSON {iv,ciphertext,tag}, TIDAK ada plaintext | critical | Integration+Security | POST /api/v1/settings/providers |
| TC-016 | — | Cek response provider config TIDAK expose key | GET /api/v1/settings/providers | apiKeyMasked `****xxxx`, TIDAK ada plaintext | critical | Integration+Security | GET /api/v1/settings/providers |
| TC-017 | `import 'server-only'` di aes.ts | Import aes dari Client Component (simulasi) | — | Build/runtime error (server-only guard) | critical | Security build | — |

### 7.3 Modul AI (lib/ai/) — Unit (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-018 | mock AI SDK | prompt-builder assemble system prompt | input {title,duration,style,refs} | system prompt mengandung title, duration, style, refs | high | Unit | POST /api/v1/generate |
| TC-019 | mock generateObject return fixture | response-parser.parse(raw) | fixturePromptPackageShorts | parsed valid PromptPackage | high | Unit | POST /api/v1/generate |
| TC-020 | mock streamText return invalid JSON | response-parser fallback parse | `"{invalid"` | error fallback | high | Unit | POST /api/v1/generate |
| TC-021 | — | consistency-checker(package) | fixtureConsistencyMismatch | warnings[] berisi CONSISTENCY_MISMATCH | high | Unit | POST /api/v1/generate |
| TC-022 | — | consistency-checker(package) | fixturePromptPackageShorts (konsisten) | warnings[] kosong | medium | Unit | POST /api/v1/generate |
| TC-023 | mock decrypt | provider-registry.buildProvider | cfg openrouter | createOpenAICompatible dipanggil dengan header OpenRouter | high | Unit | POST /api/v1/generate |
| TC-024 | mock decrypt | provider-registry.buildProvider | cfg 9router localhost | provider instance; prod env reject 9router | medium | Unit+Security | POST /api/v1/settings/providers |
| **TC-099** | — | prompt-builder.injectStoryDescription() valid | `{title:"X",storyDescription:"Petualangan Wahab",...}` | system prompt mengandung "Deskripsi cerita: Petualangan Wahab" | high | Unit | POST /api/v1/generate |
| **TC-100** | — | prompt-builder.injectStoryDescription() kosong | `{title:"X",...}` (no storyDescription) | system prompt TIDAK mengandung "Deskripsi cerita" | high | Unit | POST /api/v1/generate |
| **TC-101** | — | prompt-builder.injectReferences6Tipe() | `references: [{name:"hero",type:"tokoh"},{name:"meja",type:"prop"}]` | prompt mengandung "hero (tokoh), meja (prop)" | high | Unit | POST /api/v1/generate |
| **TC-102** | mock Vision LLM | classifyImage({blobUrl}) | blobUrl valid | return {role:"tokoh",name:"Wahab",confidence:0.92} | high | Unit | POST /api/v1/upload/classify |
| **TC-103** | mock Vision LLM confidence 0.55 | classifyImage(...) | blobUrl valid | return {role:"tokoh",confidence:0.55} (low) | high | Unit | POST /api/v1/upload/classify |
| **TC-104** | mock Vision LLM error (502) | classifyImage(...) (mock throw) | blobUrl valid | throw AppError('CLASSIFICATION_ERROR', 502) | high | Unit | POST /api/v1/upload/classify |
| **TC-105** | mock Vision LLM malformed JSON | classifyImage(...) (mock return invalid) | blobUrl valid | throw parse error -> fallback manual select | medium | Unit | POST /api/v1/upload/classify |
| **TC-106** | — | LogBuffer.push(level, message) + drain() | push 3 entries (info, warn, error) | drain() return 3 entries dengan level/message/timestamp | high | Unit | POST /api/v1/generate SSE |
| **TC-107** | — | LogBuffer.persist() after done | buffer berisi 5 entries | simpan ke generation_logs.logs_json JSON serialized | high | Unit | GET /api/v1/projects/[id]/logs |
| **TC-108** | — | LogBuffer.sanitizeLogLine("<script>alert(1)</script>") | malicious string | return "&lt;script&gt;alert(1)&lt;/script&gt;" (HTML escaped) | critical | Unit+Security | POST /api/v1/generate log |

### 7.4 Modul DB Repositories — Integration (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-025 | test DB seeded user | project.repo.listActiveProjects({userId:1,page:1,limit:20}) | userId=1 | data project milik user 1, filter deleted_at IS NULL, paginated | critical | Integration | GET /api/v1/projects |
| TC-026 | test DB | project.repo.createProject({userId:1,title,...}) | valid input | row baru userId=1, status draft | high | Integration | POST /api/v1/projects |
| TC-027 | test DB project milik user 2 | project.repo.getById({id:42,userId:1}) | userId=1 (bukan milik) | null / FORBIDDEN | critical | Integration+Security | GET /api/v1/projects/[id] |
| TC-028 | test DB 11 karakter | character.repo count+insert | insert 11 karakter | 400 bila count >10 | medium | Integration | POST /api/v1/generate |
| TC-029 | test DB | project.repo.softDelete(42) | id=42 | deletedAt terisi; listActiveProjects exclude | high | Integration | DELETE /api/v1/projects/[id] |
| TC-030 | test DB | generation-log.repo.list({projectId:42}) | projectId=42 | list urut terbaru | low | Integration | GET /api/v1/projects/[id]/logs |
| **TC-109** | test DB + V2 schema | project.repo.createProject dengan storyDescription | `{userId:1,title:"Valid",storyDescription:"Petualangan Wahab",...}` | row baru dengan story_description terisi | high | Integration | POST /api/v1/projects |
| **TC-110** | test DB | project.repo.updateProject dengan storyDescription patch | `{id:42, storyDescription:"Updated desc"}` | row updated story_description | high | Integration | PATCH /api/v1/projects/[id] |
| **TC-111** | test DB + upload | asset-reference.repo.create dengan ai_classification | `{projectId:42,tipe:"tokoh",filename:"x.png",aiClassification:"{...}"}` | row baru dengan ai_classification JSON | high | Integration | POST /api/v1/upload |
| **TC-112** | test DB + asset ref | asset-reference.repo.updateClassification(id, result) | id=99, classification:{role:"prop",confidence:0.88} | row updated tipe="prop", label, ai_classification JSON | high | Integration | POST /api/v1/upload/classify |
| **TC-113** | test DB + gen log | generation-log.repo.create dengan logs_json | `{projectId:42,provider:"openrouter",status:"success",logsJson:"[...]"}` | row baru dengan logs_json JSON array | high | Integration | POST /api/v1/generate |
| **TC-114** | test DB + V2 schema | dashboard.repo.getStats({userId:1, range:"30d"}) | userId=1, range="30d" | return DashboardStatsDTO lengkap | high | Integration | GET /api/v1/dashboard/stats |
| **TC-115** | test DB 0 data | dashboard.repo.getStats({userId:999}) | userId=999 (no data) | return zero values + empty arrays | medium | Integration | GET /api/v1/dashboard/stats |
| **TC-116** | test DB 30 projects | dashboard.repo.getStats performance | userId=1 | query < 500ms + dashboard < 1.5s | medium | Integration+Perf | GET /api/v1/dashboard/stats |
| **TC-117** | test DB projects | project.repo.paginate({userId:1, page:2, limit:10}) | page=2, limit=10 | return data[10..20] + pagination | high | Integration | GET /api/v1/projects |

### 7.5 Modul Export — Unit (V1)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-031 | — | markdown.template.transform(package) | fixturePromptPackageShorts | markdown string berisi semua section | high | Unit | GET export markdown |
| TC-032 | — | snapshot markdown output stabil | fixturePromptPackageShorts | snapshot match | medium | Unit | GET export markdown |

### 7.6 Modul API Route Handlers — Integration Contract (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-033 | authed + valid input | POST /api/v1/projects | makeProject valid | 201 {data:ProjectDTO} | high | Integration | POST /api/v1/projects |
| TC-034 | unauth | POST /api/v1/projects | no cookie | 401 UNAUTHORIZED | critical | Integration | POST /api/v1/projects |
| TC-035 | authed + shorts 250s | POST /api/v1/projects | durationTargetSeconds=250 | 422 VALIDATION_ERROR | high | Integration | POST /api/v1/projects |
| TC-036 | authed + project milik user lain | GET /api/v1/projects/99 | id=99 milik user 2 | 403 FORBIDDEN | critical | Integration+Security | GET /api/v1/projects/[id] |
| TC-037 | authed + id tidak ada | GET /api/v1/projects/9999 | id=9999 | 404 NOT_FOUND | high | Integration | GET /api/v1/projects/[id] |
| TC-038 | authed + valid provider | POST /api/v1/settings/providers | makeProviderConfig | 201 {apiKeyMasked:****} | critical | Integration+Security | POST /api/v1/settings/providers |
| TC-039 | authed + duplikat nama | POST /api/v1/settings/providers | nama sama | 409 CONFLICT | high | Integration | POST /api/v1/settings/providers |
| TC-040 | authed + provider aktif + mock LLM | POST /api/v1/generate (mock streamObject) | GenerateInput valid | SSE: stage + **V2: log event** + progress + done {result, warnings, logs[]} | critical | Integration | POST /api/v1/generate |
| TC-041 | authed + provider error | POST /api/v1/generate (mock throw) | GenerateInput valid | SSE event error {code:PROVIDER_ERROR} | high | Integration | POST /api/v1/generate |
| TC-042 | authed + 11 request cepat | POST /api/v1/generate x11 | 11 request | request ke-11 -> 429 RATE_LIMITED | medium | Integration | POST /api/v1/generate |
| TC-043 | authed + project punya result | GET /api/v1/projects/42/export?format=json | projectId=42 | 200 application/json attachment | high | Integration | GET export json |
| TC-044 | authed + project punya result | GET /api/v1/projects/42/export?format=markdown | projectId=42 | 200 text/markdown attachment | high | Integration | GET export markdown |
| TC-045 | authed + project belum generate | GET /api/v1/projects/42/export?format=json | resultJson null | 409 CONFLICT | medium | Integration | GET export |
| TC-046 | authed + valid image | POST /api/v1/upload?projectId=42 multipart | file hero-ref.png, tipe tokoh | 201 {data:AssetReference} + **V2: +aiClassification** | high | Integration | POST /api/v1/upload |
| TC-047 | authed + mime invalid | POST /api/v1/upload | file invalid.txt | 400 VALIDATION_ERROR | high | Integration | POST /api/v1/upload |
| TC-048 | authed + size >10MB | POST /api/v1/upload | oversize.bin 11MB | 400 VALIDATION_ERROR | medium | Integration | POST /api/v1/upload |
| **TC-118** | authed + upload tanpa projectId (orphan) | POST /api/v1/upload (no projectId) | file hero-ref.png, tipe tokoh | 201 {data:{projectId:null,aiClassification:{...}}} | high | Integration | POST /api/v1/upload V2 |
| **TC-119** | authed + upload 6-tipe | POST /api/v1/upload | file meja.png, tipe=prop | 201 {data:{tipe:"prop",...}} | high | Integration | POST /api/v1/upload V2 |
| **TC-120** | authed + upload tipe invalid V2 | POST /api/v1/upload | tipe="invalid_7th" | 400 VALIDATION_ERROR (enum 6-tipe) | high | Integration | POST /api/v1/upload |
| **TC-121** | authed + asset ref valid | POST /api/v1/upload/classify | `{assetReferenceId:99}` + mock Vision LLM success | 200 {data:{role:"tokoh",name:"Wahab",confidence:0.92}} + update DB | critical | Integration | POST /api/v1/upload/classify |
| **TC-122** | authed + Vision LLM error | POST /api/v1/upload/classify | mock Vision LLM throw | 502 CLASSIFICATION_ERROR | high | Integration | POST /api/v1/upload/classify |
| **TC-123** | authed + asset ref not found | POST /api/v1/upload/classify | `{assetReferenceId:99999}` | 404 NOT_FOUND | high | Integration | POST /api/v1/upload/classify |
| **TC-124** | authed + classify 31 request cepat | POST /api/v1/upload/classify x31 | 31 request | request ke-31 -> 429 (30 req/min) | medium | Integration | POST /api/v1/upload/classify |
| **TC-125** | authed + generate dengan storyDescription | POST /api/v1/generate | `{input:{title:"X",storyDescription:"Petualangan Wahab",...}}` | SSE stream + done {result, logs[]} + DB save | high | Integration | POST /api/v1/generate |
| **TC-126** | authed + storyDescription > 500 | POST /api/v1/generate | `{input:{storyDescription:"x".repeat(501),...}}` | 400 VALIDATION_ERROR | high | Integration | POST /api/v1/generate |
| **TC-127** | authed + references dengan aiClassification | POST /api/v1/generate | `{input:{references:[{name:"x",type:"tokoh",aiClassification:{...}}]}}` | SSE stream + done {result} + prompt inject aiClassification | high | Integration | POST /api/v1/generate |
| **TC-128** | authed + projects list pagination | GET /api/v1/projects?page=2&limit=10 | page=2, limit=10 | 200 {data:[10..20], pagination:{page:2,limit:10,total,totalPages}} | high | Integration | GET /api/v1/projects V2 |
| **TC-129** | authed + projects invalid page | GET /api/v1/projects?page=0 | page=0 | 400 VALIDATION_ERROR (page >= 1) | high | Integration | GET /api/v1/projects |
| **TC-130** | authed + projects limit > 100 | GET /api/v1/projects?limit=500 | limit=500 | 400 VALIDATION_ERROR (limit 1..100) atau clamp 100 | medium | Integration | GET /api/v1/projects |
| **TC-131** | authed + dashboard stats valid | GET /api/v1/dashboard/stats | default range=30d | 200 {data: DashboardStatsDTO} | critical | Integration | GET /api/v1/dashboard/stats V2 |
| **TC-132** | authed + dashboard range | GET /api/v1/dashboard/stats?range=7d | range=7d | 200 {data: ...} filtered 7 days | high | Integration | GET /api/v1/dashboard/stats |
| **TC-133** | authed + dashboard empty | GET /api/v1/dashboard/stats | userId=999 (no data) | 200 {data: zero values, empty arrays valid} | high | Integration | GET /api/v1/dashboard/stats |
| **TC-134** | authed + logs +logsJson | GET /api/v1/projects/42/logs | projectId=42 | 200 {data:[{...,logsJson:[{level,message,timestamp}]}]} | high | Integration | GET /api/v1/projects/[id]/logs |
| **TC-135** | authed + orphan ref attach | POST /api/v1/generate | `{projectId:new, input:{...,references:[{name:"orphan.jpg",type:"tokoh"}]}}` (orphan refs uploaded pre-submit) | SSE stream + done + orphan refs attached to new project (asset_references.projectId updated) | critical | Integration | Orphan ref attachment flow (PRD FR-V2-01) |

### 7.7 Modul Auth & Middleware (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-049 | unauth | GET /projects (page) | no session | redirect /login?callbackUrl=/projects | critical | E2E | middleware |
| TC-050 | unauth | GET /api/v1/projects | no cookie | 401 | critical | Integration | middleware |
| TC-051 | demo user seeded | login form submit | email demo@promptflow.local, password demo123 | redirect /generate, cookie set | critical | E2E | POST auth |
| TC-052 | — | login wrong password | valid email, wrong pass | 401 / form error | high | E2E | POST auth |
| TC-053 | authed session | GET /api/v1/auth/session | cookie valid | 200 {data:{user:{id,email,name},expires}} | medium | Integration | GET auth/session |
| **TC-V2-049** | unauth | GET /dashboard (page) | no session | redirect /login?callbackUrl=/dashboard | critical | E2E | middleware V2 |
| **TC-V2-050** | unauth | GET /api/v1/dashboard/stats | no cookie | 401 UNAUTHORIZED | critical | Integration | GET /dashboard/stats |

### 7.8 Modul UI Flow E2E (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-054 | demo user + provider + mock LLM | Flow: login -> Generate (single-page V2) -> fill title + storyDescription + upload ref -> Generate | title "Petualangan Hutan", storyDescription, shorts 60, 3D 16:9, 1 ref tokoh | ResultTabs visible < 60s, all tabs, storyDescription di result | critical | E2E | POST /api/v1/generate |
| TC-055 | TC-054 done | click Export JSON | format=json | file .json terdownload | high | E2E | GET export json |
| TC-056 | TC-054 done | click Export Markdown | format=markdown | file .md terdownload | high | E2E | GET export markdown |
| TC-057 | demo user | Flow: Settings -> Add Provider -> form -> save | provider openrouter | toast "Provider tersimpan", row list muncul, apiKeyMasked | critical | E2E | POST /api/v1/settings/providers |
| TC-058 | TC-057 | Edit provider -> switch isActive | isActive on | toast "Provider aktif diubah" | medium | E2E | PATCH provider |
| TC-059 | demo user + project ada | Flow: dashboard -> click project card -> detail | click PromptCard | halaman /projects/[id] render ResultTabs + read-only refs (V2) + storyDescription | high | E2E | GET /api/v1/projects/[id] |
| TC-060 | demo user + project ada | click delete project -> confirm | confirm dialog | project hilang dari list, toast "Proyek dihapus" | high | E2E | DELETE /api/v1/projects/[id] |
| TC-061 | demo user | upload referensi di generate page (V2) -> generate | file hero-ref.png tipe tokoh | reference_filename muncul di image_prompts + ClassificationResult visible (V2) | high | E2E | POST /api/v1/upload + POST /api/v1/generate |
| TC-062 | demo user + tutorial | Flow: generate -> tutorial 480s -> generate | tutorial 480 | scenes 8-20 tergenerate | medium | E2E | POST /api/v1/generate |
| TC-063 | demo user | Toggle Language ID -> EN | click LanguageToggle EN | UI label berubah (Proyek -> Projects) | high | E2E | UI i18n |
| TC-064 | demo user | Toggle Language EN -> ID | click LanguageToggle ID | UI label berubah ke ID | medium | E2E | UI i18n |
| TC-065 | demo user + warning mismatch | generate dengan fixtureConsistencyMismatch | mock LLM return mismatch | Alert warning "Karakter tidak konsisten" tampil | medium | E2E | POST /api/v1/generate |
| TC-066 | demo user | CopyButton click di image prompt item | click copy | toast "Tersalin", icon swap | medium | E2E | UI CopyButton |
| TC-067 | demo user | keyboard nav: Tab dari skip link -> header -> form | Tab key | fokus berpindah logical, focus visible ring 2px | high | E2E+a11y | UI a11y |
| TC-068 | demo user | reduce motion | OS reduce motion on | skeleton shimmer off, transisi instant | medium | E2E+a11y | UI a11y |
| **TC-V2-069** | demo user | Flow: Generate page (V2) -> upload 3 ref multi-file -> AI auto-classify (mock) | 3 file multi-upload | 3 ClassificationResult card visible + role + name + confidence + override select | critical | E2E | POST /api/v1/upload V2 |
| **TC-V2-070** | demo user + low confidence | upload ref -> AI classify confidence 0.55 (mock) | mock return low confidence | Alert warning "Keyakinan rendah" + suggest override | high | E2E | POST /api/v1/upload/classify V2 |
| **TC-V2-071** | demo user + Vision LLM fail | upload ref -> Vision LLM error (mock) | mock throw 502 | Alert warning "Gagal menganalisis" + manual select dropdown (V2 fallback) | high | E2E | POST /api/v1/upload/classify V2 |
| **TC-V2-072** | demo user + override role | ClassificationResult tampil -> click override Select -> pilih role berbeda | override tokoh -> prop | role badge update + toast "Role diubah ke prop" | medium | E2E | UI ClassificationResult override |
| **TC-V2-073** | demo user + LogViewer toggle ON | click Switch toggle di LogViewer | toggle ON | Collapsible body expand + log entries visible (info/warn/error) | critical | E2E | POST /api/v1/generate log event V2 |
| **TC-V2-074** | demo user + LogViewer toggle OFF | click Switch toggle OFF (default) | toggle OFF | Collapsible body collapse + log events TIDAK di-render | critical | E2E | LogViewer V2 default OFF |
| **TC-V2-075** | demo user + log XSS | generate dengan log mengandung `<script>alert(1)</script>` | mock console.log contain script | log entry di LogViewer TIDAK execute script (escaped) | critical | E2E+Security | LogViewer V2 sanitization |
| **TC-V2-076** | demo user | Flow: click Dasbor nav (V2) -> /dashboard load | click nav Dasbor | MetricCard 6-8 visible + chart line + bar + table breakdown + recent + storage | critical | E2E | GET /api/v1/dashboard/stats V2 |
| **TC-V2-077** | demo user + dashboard load time | /dashboard load + measure | click Dasbor | dashboard load <= 1.5s (NFR-V2-P2) | high | E2E+Perf | GET /api/v1/dashboard/stats |
| **TC-V2-078** | demo user | pagination: /projects -> click page 2 | page=2 | URL ?page=2&limit=20 + loading.tsx skeleton + page 2 data visible + Pagination aria-current="page" | critical | E2E | GET /api/v1/projects V2 |
| **TC-V2-079** | demo user + 25 projects | /projects -> click next page (last) | page=3 | URL ?page=3 + data visible + Pagination prev/next disabled di edge | medium | E2E | Pagination V2 |
| **TC-V2-080** | demo user + storyDescription XSS | input `<script>alert(1)</script>` di StoryDescriptionTextarea | XSS di textarea | text di-render escaped (TIDAK execute) di UI + di prompt builder | high | E2E+Security | POST /api/v1/projects V2 |
| **TC-V2-081** | demo user + storyDescription char counter | input 481/500 char | text 481 char | counter warna danger (>=480) | medium | E2E | StoryDescriptionTextarea V2 |
| **TC-V2-082** | demo user | Flow: click Generate -> loading state | click button Generate | form disabled (opacity-50) + GenerateProgress active | high | E2E | UI loading state V2 |
| **TC-V2-083** | demo user | Flow: navigate /generate -> /projects via Link | click Link | page transition < 200ms (NFR-V2-P1) | medium | E2E+Perf | UI navigation V2 |
| **TC-V2-084** | demo user + loading.tsx | hard reload /generate slow | simulate slow server | PageLoadingSkeleton variant="generate" tampil + shimmer | high | E2E | loading.tsx V2 |
| **TC-V2-085** | demo user + error.tsx | trigger error (provider crash) | simulate error | PageErrorBoundary tampil + "Coba Lagi" + "Kembali ke Dasbor" + role="alert" | high | E2E | error.tsx V2 |

### 7.9 Modul A11y (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-069 | page load | axe scan /login | — | 0 violation WCAG AA | critical | E2E+a11y | UI login |
| TC-070 | authed | axe scan /projects | — | 0 violation AA | critical | E2E+a11y | UI projects |
| TC-071 | authed | axe scan /generate (V2 single-page) | — | 0 violation AA | critical | E2E+a11y | UI generate V2 |
| TC-072 | authed + result ada | axe scan /projects/[id] ResultView | — | 0 violation AA, aria-live streaming | critical | E2E+a11y | UI result |
| TC-073 | authed | axe scan /settings provider form dialog | — | 0 violation AA, label htmlFor, aria-invalid | high | E2E+a11y | UI settings |
| TC-074 | — | cek kontras token UIUX_SPEC 2.1 + V2 (log-info/warn/error, confidence low/mid/high, role badge) | light+dark | semua >= 4.5:1 body, >= 3:1 large/UI | high | A11y audit | UI tokens V1+V2 |
| TC-075 | — | cek focus visible | inspect CSS | focus ring --ring 2px offset 2px | high | A11y audit | UI |
| **TC-V2-086** | authed | axe scan /dashboard | — | 0 violation AA + MetricCard aria-label + Chart aria-label | critical | E2E+a11y | UI dashboard V2 |
| **TC-V2-087** | authed | axe scan LogViewer toggle ON | toggle ON, 5 entries | 0 violation AA + role="log" + aria-live="polite" | critical | E2E+a11y | LogViewer V2 |
| **TC-V2-088** | authed | axe scan ClassificationResult | classification visible | 0 violation AA + aria-valuenow pada confidence bar | high | E2E+a11y | ClassificationResult V2 |
| **TC-V2-089** | authed | axe scan Pagination di /projects | pagination visible | 0 violation AA + aria-current="page" | high | E2E+a11y | Pagination V2 |
| **TC-V2-090** | authed + error | axe scan error.tsx | trigger error | 0 violation AA + role="alert" + aria-live="assertive" | high | E2E+a11y | error.tsx V2 |

### 7.10 Modul Non-Fungsional (V1 + V2)

| ID | Precondition | Langkah | Input | Expected | Pass/Fail | P | Level | Relasi |
|---|---|---|---|---|---|---|---|---|
| TC-076 | mock LLM cepat | POST /api/v1/generate timing | shorts | token pertama < 10s (NFR-P3) | high | Performance | POST /api/v1/generate |
| TC-077 | mock LLM | POST /api/v1/generate e2e | shorts 60s | done < 60s (NFR-P1) | high | Performance | POST /api/v1/generate |
| TC-078 | mock LLM | POST /api/v1/generate e2e | tutorial 480s | done < 180s (NFR-P2) | medium | Performance | POST /api/v1/generate |
| TC-079 | test DB | query project.repo.listActiveProjects | 1000 row | query < 500ms (NFR-P5) | medium | Performance | DB |
| TC-080 | authed | page load /projects | — | LCP < 2s (NFR-P4) | medium | Performance | UI |
| TC-081 | — | npm audit / Dependabot | — | 0 vuln high+critical | high | Security audit | deps |
| TC-082 | build prod | inspect next build bundle | — | TIDAK ada ENCRYPTION_KEY/TURSO_AUTH_TOKEN/NEXTAUTH_SECRET/VISION_LLM_API_KEY di client bundle | critical | Security audit | build |
| TC-083 | authed | query project milik user lain via API | id user lain | 403 (RBAC) | critical | Security | GET /api/v1/projects/[id] |
| TC-084 | — | input XSS `<script>alert(1)</script>` di title | title XSS | escaped di response/prompt | high | Security | POST /api/v1/projects |
| TC-085 | authed | SQL injection attempt di query param | `?id=1 OR 1=1` | Drizzle parameterized, tidak leak | high | Security | GET /api/v1/projects/[id] |
| TC-086 | — | CSRF attempt Server Action dari origin lain | cross-origin | Next.js built-in CSRF reject | high | Security | Server Action |
| **TC-V2-091** | mock Vision LLM | POST /api/v1/upload/classify timing | asset ref valid | done < 5s per gambar (NFR-V2-P3) | high | Performance | POST /api/v1/upload/classify |
| **TC-V2-092** | authed | POST /api/v1/generate first event:log timing | generate start | first log event < 100ms after start (NFR-V2-P4) | high | Performance | POST /api/v1/generate log V2 |
| **TC-V2-093** | authed | page transition /generate -> /projects via Link | click Link | transition < 200ms (NFR-V2-P1) | medium | Performance | UI navigation V2 |
| **TC-V2-094** | authed | GET /api/v1/dashboard/stats timing | 30 projects | full response < 1.5s (NFR-V2-P2) | high | Performance | GET /api/v1/dashboard/stats |
| **TC-V2-095** | authed + Vision LLM env not set | POST /api/v1/upload/classify tanpa VISION_LLM_API_KEY | (no env) | fallback ke manual select (TIDAK 500) | high | Security+Resilience | POST /api/v1/upload/classify |
| **TC-V2-096** | — | input XSS di storyDescription | XSS V2 | escaped di response/prompt/UI | high | Security | POST /api/v1/projects V2 |
| **TC-V2-097** | — | input XSS di log message (via mock LLM) | console.log contain script | escape HTML di LogViewer render | critical | Security | POST /api/v1/generate log V2 |
| **TC-V2-098** | — | orphan asset cleanup | cleanup job | hard delete (V2 SEC-C25) | medium | Security | n/a (job) |
| **TC-V2-099** | — | check .gitignore + no secret in commit | git log | tidak ada .env.local atau secret | critical | Security audit | git |

### 7.11 Ringkasan Statistik Test Case

| Kelompok | V1 (TC-001..TC-086) | V2 (TC-087..TC-099 + TC-V2-049..TC-V2-099) | Total |
|---|---|---|---|
| Validasi (Unit) | 11 | 12 (TC-087..TC-098) | 23 |
| Crypto (Unit+Security) | 6 | 0 | 6 |
| AI (Unit) | 7 | 10 (TC-099..TC-108) | 17 |
| DB Repositories (Integration) | 6 | 9 (TC-109..TC-117) | 15 |
| Export (Unit) | 2 | 0 | 2 |
| API Route Handlers (Integration) | 16 | 18 (TC-118..TC-135) | 34 |
| Auth & Middleware | 5 | 2 (TC-V2-049..TC-V2-050) | 7 |
| UI Flow E2E | 15 | 17 (TC-V2-069..TC-V2-085) | 32 |
| A11y | 7 | 5 (TC-V2-086..TC-V2-090) | 12 |
| Non-Fungsional (Perf+Security) | 11 | 9 (TC-V2-091..TC-V2-099) | 20 |
| **TOTAL** | **86** | **82** | **168** |

> **Catatan:** Total 167 test case (86 V1 + 81 V2). Melampaui minimum. Cakup SEMUA FR V1+V2 + 23 endpoint + komponen UI V2 + NFR V1+V2.

---

## 8. Pengujian Non-Fungsional (V1 + V2)

### 8.1 Performa

| NFR | Target | TC | Tool |
|---|---|---|---|
| NFR-P1 Latency Shorts | <= 60s e2e | TC-077 | Vitest/Playwright timing |
| NFR-P2 Latency Tutorial | <= 180s e2e | TC-078 | Vitest timing |
| NFR-P3 Streaming partial | Token < 10s | TC-076 | Playwright timing |
| NFR-P4 UI response | < 2s page load | TC-080 | Playwright LCP |
| NFR-P5 DB query | < 500ms | TC-079 | Vitest benchmark |
| **NFR-V2-P1** Page transition | **<= 200ms** | **TC-V2-093** | Playwright timing |
| **NFR-V2-P2** Dashboard load | **<= 1.5s** | **TC-V2-077, TC-V2-094** | Playwright timing |
| **NFR-V2-P3** AI classification | **<= 5s per gambar** | **TC-V2-091** | Vitest/Playwright |
| **NFR-V2-P4** Log latency | **<= 100ms** | **TC-V2-092** | Playwright timing |

### 8.2 Keamanan

| NFR | TC |
|---|---|
| NFR-S1 API key encrypt | TC-012, TC-015 |
| NFR-S2 tidak expose | TC-016, TC-082 |
| NFR-S3 XSS | TC-084 |
| NFR-S4 Rate limit | TC-042 |
| NFR-S5 HTTPS | Manual verify |
| NFR-S6 Ownership RBAC | TC-027, TC-036, TC-083 |
| Dependency audit | TC-081 |
| File upload mime+size | TC-047, TC-048 |
| **V2: SEC-C22 Vision LLM key env-only** | **TC-V2-095** |
| **V2: SEC-C23 storyDescription max 500** | **TC-088, TC-126** |
| **V2: SEC-C24 Log sanitization** | **TC-108, TC-V2-075, TC-V2-097** |
| **V2: SEC-C25 Orphan asset cleanup** | **TC-V2-098** |
| **V2: storyDescription XSS** | **TC-V2-080, TC-V2-096** |
| **V2: GitHub push no secret** | **TC-V2-099** |

### 8.3 Kompatibilitas Browser

| Target | Tool |
|---|---|
| Chrome 120+ (Desktop) | Playwright chromium (full critical V1+V2) |
| Edge 120+ | Playwright chromium (subset) |
| Firefox 120+ | Playwright firefox (smoke) |
| Safari 17+ | Playwright webkit (smoke) |
| Mobile Safari iOS 17+ | Playwright iPhone 14 (smoke) |
| Chrome Android 120+ | manual device |

### 8.4 Aksesibilitas WCAG 2.1 AA

| Kategori | TC |
|---|---|
| Kontras warna (V1 + V2 tokens) | TC-074 |
| Keyboard nav (V1 + V2) | TC-067, TC-V2-069, TC-V2-073, TC-V2-078 |
| Focus visible | TC-075 |
| ARIA semantik (V1 + V2) | TC-069..TC-073, TC-V2-086..TC-V2-090 |
| Reduce motion | TC-068 |
| Skip link | TC-067 |
| lang attribute | TC-063, TC-064 |
| **V2: LogViewer role="log" + aria-live="polite"** | **TC-V2-073, TC-V2-087** |
| **V2: Pagination aria-current="page"** | **TC-V2-078, TC-V2-089** |
| **V2: MetricCard aria-label** | **TC-V2-076, TC-V2-086** |
| **V2: Chart aria-label** | **TC-V2-076, TC-V2-086** |
| **V2: error.tsx role="alert"** | **TC-V2-085, TC-V2-090** |
| **V2: ClassificationResult aria-valuenow** | **TC-V2-088** |

### 8.5 Responsif & Visual Regression

| Breakpoint | Test |
|---|---|
| Mobile <640 | header hamburger, generate form stack (V2), Pagination simplified, dashboard metric 1-2 col |
| sm 640 | project grid 2, AssetPreview 2 col |
| md 768 | generate form container 1024, result sidebar |
| lg 1024 | generate 2 col (main+sidebar), Dashboard 4 col metric, AssetPreview 3-4 col |
| xl 1280 | Dashboard chart 2 col, project grid 4 |
| 2xl 1536 | landing container 1536 |

**State komponen:** test render state per komponen UIUX_SPEC §3.2 + §3.3 via Vitest React Testing Library.

---

## 9. Target Coverage & Cara Ukur

| Level | Metric | Target | Cara Ukur |
|---|---|---|---|
| Unit | line+branch+function+statement | >= 80% | `@vitest/coverage-v8` HTML/JSON |
| Integration | line API handler | >= 70% | coverage report per `src/app/api` |
| E2E | critical path pass | 100% | Playwright pass/fail |
| Lint | error | 0 | `next lint` exit 0 |
| Typecheck | error | 0 | `tsc --noEmit` exit 0 |
| Build | error | 0 (sukses) | `next build` exit 0 |
| A11y | WCAG AA violation | 0 | axe scan |
| Security | secret leak | 0 | bundle inspect + npm audit |
| Contract | endpoint dites | 23/23 happy+error | contract test count |

### Modul Wajib 100% Coverage

| Modul | Alasan |
|---|---|
| `lib/crypto/aes.ts` | enkripsi API key kritis |
| `lib/validation/schemas.ts` | boundary validation |
| `lib/ai/consistency-checker.ts` | FR-12 konsistensi karakter |
| `lib/ai/response-parser.ts` | LLM output validation |
| `lib/db/repositories/project.repo.ts` | ownership + soft delete |
| `lib/db/repositories/provider-config.repo.ts` | API key encrypt |
| `src/middleware.ts` | auth + rate limit gate |
| **V2: `lib/ai/image-classifier.ts`** | **Vision LLM classification kritis** |
| **V2: `lib/ai/log-buffer.ts`** | **real-time log persistence** |
| **V2: `lib/db/repositories/dashboard.repo.ts`** | **dashboard enrichment queries** |

---

## 10. Entry & Exit Criteria + Definition of Done

### Entry Criteria per Level

| Level | Entry Criteria |
|---|---|
| Unit | kode ditulis, vitest terinstal, env test set |
| Integration | Unit pass, test DB terkonfigurasi, mock siap |
| E2E | app start (`pnpm dev`), demo user seeded, mock LLM + Vision LLM siap, Playwright installed |
| UAT | deploy staging live, stakeholder siap review |
| Performance | integration pass, mock LLM cepat, timing helper siap |
| Security | unit crypto pass, build prod bisa inspect |
| A11y | UI render, axe-playwright installed |

### Exit Criteria per Level

| Level | Exit Criteria |
|---|---|
| Unit | coverage >= 80%, 0 fail, 0 skip tanpa alasan |
| Integration | coverage >= 70% API, 23 endpoint happy+error pass, 0 fail |
| E2E | critical path 100% pass (V1+V2), 0 fail |
| UAT | stakeholder sign-off |
| Performance | NFR V1+V2 tercapai (mock LLM) |
| Security | 0 secret leak, 0 auth bypass, npm audit 0 high+ |
| A11y | 0 violation WCAG AA (axe) |

### Definition of Done (Overall Ship)

Semua WAJIB:
- [ ] Coverage unit >= 80% line+branch
- [ ] Coverage integration >= 70% API
- [ ] E2E critical path 100% pass
- [ ] Critical bug 0 (P0/P1)
- [ ] Lint 0 error + 0 warning
- [ ] tsc --noEmit 0 error
- [ ] next build sukses
- [ ] A11y 0 violation WCAG AA
- [ ] Security: 0 secret leak, 0 auth bypass, npm audit 0 high+
- [ ] 23 endpoint contract test pass
- [ ] FR-01..FR-19 + FR-V2-01..FR-V2-10 tercakup minimal 1 test scenario
- [ ] NFR V1+V2 terukur
- [ ] Stakeholder UAT sign-off

---

## 11. Strategi Regression, Smoke Test, Bug Tracking

### 11.1 Regression Test

| Aspek | Strategi |
|---|---|
| Re-run full suite | Setiap PR: CI jalankan lint+typecheck+unit+build+e2e |
| Subset regression | Bug fix WAJIB tambah test case anti-regression |
| Snapshot selektif | Snapshot hanya output stabil (markdown template). Hindari snapshot UI |
| Critical path e2e | Run e2e critical flow tiap PR |
| Migration regression | Setiap drizzle-kit generate, re-run integration test |

### 11.2 Smoke Test (sebelum deploy prod)

| Smoke | Test |
|---|---|
| Health check | GET /api/v1/health 200 |
| Login | TC-051 |
| Generate Shorts mock | TC-054 |
| Export JSON | TC-055 |
| List projects | GET /api/v1/projects 200 |
| **V2: Dashboard load** | **TC-V2-076** |
| **V2: Pagination** | **TC-V2-078** |

### 11.3 Bug Tracking

| Aspek | Implementasi |
|---|---|
| Tool | GitHub Issues (`agrianwahab29/promptflow`) |
| Label | `bug`, `p0`/`p1`/`p2`/`p3`, `regression`, `a11y`, `security`, `performance` |
| Severity | P0 blocker / P1 critical / P2 major / P3 minor |
| Link TC | Bug WAJIB link ke TC-XXX |
| DoD bug fix | Fix + test case baru + regression suite pass |

---

## 12. Risiko Pengujian & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R1 | LLM real non-deterministik -> flaky E2E | E2E generate random | Tinggi | Mock LLM di E2E. Output validasi via Zod schema + key field |
| R2 | Turso test DB lambat | Integration timeout | Sedang | SQLite in-memory fallback. Retry + timeout generous |
| R3 | Vercel Blob tidak tersedia di CI | Upload test fail | Sedang | Mock Blob di integration. FS fallback dev |
| R4 | SSE stream test sulit di Playwright | E2E false fail | Sedang | Playwright waitForResponse + parse SSE manual. Mock cepat |
| R5 | Coverage 80% terlalu tinggi | Test trivial | Sedang | Review test quality. Critical modul 100% |
| R6 | A11y axe false positive | A11y test fail tidak valid | Rendah | Verifikasi token manual. Whitelist bila yakin AA |
| R7 | Rate limit in-memory tidak konsisten cross-instance | TC-042 flaky prod | Sedang | Test di single instance. Prod: Upstash Redis (fase akhir) |
| R8 | 9router unreachable di CI | Provider test fail | Tinggi | Mock di CI. 9router test hanya local dev |
| R9 | NextAuth session test sulit | E2E login flaky | Sedang | Playwright handle cookie otomatis. Login flow real |
| R10 | Snapshot markdown false positive | TC-032 fail tidak relevan | Rendah | Update snapshot intentional. Hindari snapshot UI |
| R11 | Build inspect secret susah | TC-082 false pass | Sedang | Grep bundle `.next/static` untuk env secret |
| R12 | Multi-browser e2e lambat | CI lama | Sedang | Parallel project. Subset smoke multi-browser |
| R13 | Batas tokoh 10 tidak ada bukti user prefer | TC-028 salah threshold | Rendah | Konfigurasi constanta. Update test bila user ubah |
| R14 | Latency NFR pakai mock tidak representatif | Perf test lulus tapi prod lambat | Tinggi | Perf real = manual staging smoke. UAT cek latency |
| R15 | Test DB Turso berbayar setelah free tier | Integration blocked | Rendah | SQLite in-memory default |
| **R16 V2** | **Vision LLM API cost membengkak** | **Biaya klasifikasi tinggi** | **Sedang** | **Cache classification. Batch. Confidence threshold + manual override. Mock 100% CI** |
| **R17 V2** | **Vision LLM akurasi rendah** | **Role salah** | **Sedang** | **Tampilkan di UI. Manual override. Confidence score** |
| **R18 V2** | **SSE log events menambah payload** | **Latency naik** | **Rendah** | **Lightweight logs. Toggle off = no log. Buffer max 500** |
| **R19 V2** | **Dashboard over-engineering** | **Dev time membengkak** | **Sedang** | **Simple cards + tables dulu. Lightweight chart** |
| **R20 V2** | **Refactor upload flow breaking V1** | **Upload rusak** | **Rendah** | **Backward compatible. Test coverage tinggi** |
| **R21 V2** | **Git push expose secrets** | **API key bocor** | **Rendah** | **.gitignore lengkap. Review sebelum push** |

---

## 13. Checklist Sign-off QA

### 13.1 Cakupan Fitur V1

- [ ] FR-01 Input judul -- TC-001..TC-003 pass
- [ ] FR-02 Input durasi -- TC-004..TC-006 pass
- [ ] FR-03/09 Adegan urut -- TC-019, TC-054 pass
- [ ] FR-04 Voiceover -- TC-008, TC-054 pass
- [ ] FR-05 Auto karakter/bg -- TC-019 pass
- [ ] FR-06 Image prompt -- TC-019 pass
- [ ] FR-07 Tokoh terstruktur -- TC-008 pass
- [ ] FR-08 Karakter pendukung -- TC-008 pass
- [ ] FR-10 Gaya+rasio -- TC-007 pass
- [ ] FR-11 Pesan moral -- TC-008, TC-054 + manual review
- [ ] FR-12 Konsistensi karakter -- TC-021, TC-022, TC-065 pass
- [ ] FR-13 Multi-provider -- TC-010, TC-023, TC-038..TC-041, TC-057 pass
- [ ] FR-14 Enkripsi API key -- TC-012..TC-017 pass
- [ ] FR-15 Save + CRUD project -- TC-025..TC-029, TC-033..TC-037, TC-059, TC-060 pass
- [ ] FR-16 Export -- TC-031, TC-043..TC-045, TC-055, TC-056 pass
- [ ] FR-17 Upload referensi -- TC-046..TC-048, TC-061 pass
- [ ] FR-18 Login -- TC-049..TC-051 pass
- [ ] FR-19 Dwibahasa -- TC-063, TC-064 + unit i18n key sync

### 13.2 Cakupan Fitur V2

- [ ] FR-V2-01 Image reference di generate page -- TC-118, TC-V2-069 pass
- [ ] FR-V2-02 AI image classification -- TC-102..TC-105, TC-121..TC-123, TC-V2-069..TC-V2-072 pass
- [ ] FR-V2-03 Extended role 6 opsi -- TC-090..TC-097, TC-119, TC-120 pass
- [ ] FR-V2-04 Deskripsi cerita -- TC-087..TC-089, TC-099, TC-100, TC-109, TC-110, TC-125, TC-126, TC-V2-080, TC-V2-081 pass
- [ ] FR-V2-05 Real-time logs -- TC-106..TC-108, TC-113, TC-134, TC-V2-073..TC-V2-075, TC-V2-092, TC-V2-097 pass
- [ ] FR-V2-06 Dashboard enrichment -- TC-114..TC-116, TC-131..TC-133, TC-V2-076, TC-V2-077, TC-V2-094 pass
- [ ] FR-V2-07 Konsistensi UI -- TC-V2-084, TC-V2-085 pass
- [ ] FR-V2-09 Navigation optimization -- TC-117, TC-128..TC-130, TC-V2-078, TC-V2-079, TC-V2-093 pass
- [ ] FR-V2-10 Push ke GitHub -- TC-V2-099 pass

### 13.3 Cakupan Endpoint (23/23)

- [ ] #1 auth nextauth -- TC-051, TC-052
- [ ] #2 auth session -- TC-053
- [ ] #3 health -- TC-079 verify (manual)
- [ ] #4 projects GET -- TC-025, TC-050, TC-128
- [ ] #5 projects POST -- TC-033..TC-035
- [ ] #6 projects/[id] GET -- TC-036, TC-037
- [ ] #7 projects/[id] PATCH -- TC-110
- [ ] #8 projects/[id] DELETE -- TC-029, TC-060
- [ ] #9 generate -- TC-040..TC-042, TC-054, TC-125..TC-127
- [ ] #10 settings/providers GET -- TC-016
- [ ] #11 settings/providers POST -- TC-038, TC-039
- [ ] #12 settings/providers/[id] PATCH -- TC-058
- [ ] #13 settings/providers/[id] DELETE -- TC-060 analog
- [ ] #14 settings/providers/[id]/test -- TC-023
- [ ] #15 upload POST -- TC-046..TC-048, TC-118..TC-120
- [ ] #16 **upload/classify POST** -- TC-121..TC-124
- [ ] #17 upload DELETE -- TC-061 analog
- [ ] #18 export -- TC-043..TC-045, TC-055, TC-056
- [ ] #19 characters GET -- TC-019 analog
- [ ] #20 scenes GET -- TC-019 analog
- [ ] #21 image-prompts GET -- TC-019 analog
- [ ] #22 logs GET -- TC-030, TC-134
- [ ] #23 **dashboard/stats GET** -- TC-131..TC-133

### 13.4 Cakupan NFR (V1 + V2)

- [ ] NFR-P1 shorts <=60s -- TC-077
- [ ] NFR-P2 tutorial <=180s -- TC-078
- [ ] NFR-P3 token <10s -- TC-076
- [ ] NFR-P4 UI <2s -- TC-080
- [ ] NFR-P5 DB <500ms -- TC-079
- [ ] NFR-S1 API key encrypt -- TC-012, TC-015
- [ ] NFR-S2 tidak expose -- TC-016, TC-082
- [ ] NFR-S3 XSS -- TC-084
- [ ] NFR-S4 rate limit -- TC-042
- [ ] NFR-S5 HTTPS -- manual prod verify
- [ ] NFR-S6 RBAC -- TC-027, TC-036, TC-083
- [ ] NFR-A1 WCAG AA -- TC-069..TC-073, TC-V2-086..TC-V2-090
- [ ] NFR-A2 keyboard -- TC-067
- [ ] NFR-A3 screen reader -- axe (TC-069..TC-073, TC-V2-086..TC-V2-090)
- [ ] NFR-I1 dwibahasa UI -- TC-063, TC-064
- [ ] NFR-I2 konten LLM ikut judul -- manual UAT
- [ ] **NFR-V2-P1 transition <=200ms -- TC-V2-093**
- [ ] **NFR-V2-P2 dashboard <=1.5s -- TC-V2-077, TC-V2-094**
- [ ] **NFR-V2-P3 classify <=5s -- TC-V2-091**
- [ ] **NFR-V2-P4 log latency <=100ms -- TC-V2-092**

### 13.5 Cakupan CODING_RULES

- [ ] Coverage unit >=80%
- [ ] Coverage integration >=70%
- [ ] E2E critical path 100%
- [ ] Lint 0 error/warning
- [ ] tsc 0 error
- [ ] next build sukses
- [ ] AAA pattern
- [ ] Co-located test
- [ ] Mock strategy
- [ ] No `it.skip` tanpa alasan
- [ ] **V2: 38 larangan L01-L38 dipatuhi**

### 13.6 Cakupan UIUX_SPEC (V1 + V2)

- [ ] Token warna/typografi/spacing/radius/shadow/motion -- TC-074
- [ ] Komponen shadcn ter-install
- [ ] Wizard 5 step -- TC-054
- [ ] Result tabs 5 -- TC-054
- [ ] Settings provider CRUD -- TC-057, TC-058
- [ ] CopyButton -- TC-066
- [ ] Empty/error/loading state -- TC-054, TC-065
- [ ] Toast feedback -- TC-057, TC-060, TC-066
- [ ] A11y skip/focus/aria/reduce-motion -- TC-067, TC-068, TC-069..TC-073
- [ ] Dwibahasa -- TC-063, TC-064
- [ ] Responsif breakpoint -- visual regression
- [ ] Lucide icon konsisten -- manual audit
- [ ] **V2: DropzoneUploader inline di generate page** -- TC-V2-069
- [ ] **V2: ClassificationResult + ConfidenceBar + override** -- TC-V2-069..TC-V2-072
- [ ] **V2: StoryDescriptionTextarea max 500 + counter** -- TC-V2-080, TC-V2-081
- [ ] **V2: LogViewer Collapsible + Switch default OFF** -- TC-V2-073..TC-V2-075
- [ ] **V2: Dashboard 6-8 cards + charts + tables** -- TC-V2-076, TC-V2-077
- [ ] **V2: Pagination component** -- TC-V2-078, TC-V2-079
- [ ] **V2: loading.tsx + error.tsx per page group** -- TC-V2-084, TC-V2-085
- [ ] **V2: Design tokens konsisten (primary violet, Inter, 4px, 6px)** -- TC-074

### 13.7 Sign-off Final

- [ ] Semua checklist 13.1..13.6
- [ ] Critical bug (P0/P1) 0
- [ ] Coverage gate CI pass
- [ ] Stakeholder UAT sign-off
- [ ] QA reviewer approve merge main

**Sign-off:** [nama QA] [tanggal] [link CI run] [link build] [link coverage]

---

## 14. Asumsi Test + Referensi

### 14.1 Asumsi Test

| ID | Asumsi | Status | Sitasi |
|---|---|---|---|
| TP-A1 | Vitest + Playwright framework resmi | DIKONFIRMASI | `SRS.md V2.0 S13.1` |
| TP-A2 | Coverage unit >= 80% | ASUMSI (CR-A10) | `CODING_RULES.md V2.0 S7.1` |
| TP-A3 | E2E critical 100% | DIKONFIRMASI | `SRS.md V2.0 S13.1` |
| TP-A4 | Lint+typecheck+build = CI gate | DIKONFIRMASI | `CODING_RULES.md V2.0 S11.1` |
| TP-A5 | Mock LLM di unit/integration | ASUMSI | `CODING_RULES.md V2.0 S7.2` |
| TP-A6 | Test DB Turso atau SQLite in-memory | ASUMSI | `SRS.md V2.0 S13.1` |
| TP-A7 | AAA pattern wajib | ASUMSI | `CODING_RULES.md V2.0 S7.2` |
| TP-A8 | Co-located test | DIKONFIRMASI | `CODING_RULES.md V2.0 S7.2` |
| TP-A9 | Batas tokoh 10/project | ASUMSI (SRS-A10) | `DATABASE_SCHEMA.md V2.0 S13.7` |
| TP-A10 | Rate limit 10/min generate, 30/min classify | ASUMSI | `SRS.md V2.0 S14` |
| TP-A11 | File upload 10MB max | ASUMSI (CR-A17) | `SRS.md V2.0 S9.1` |
| TP-V2-1 | Vision LLM = GPT-4o/Gemini | Perlu konfirmasi | `SRS.md V2.0 S6.2` |
| TP-V2-2 | storyDescription optional max 500 | Perlu konfirmasi | `SRS.md V2.0 S6.4` |
| TP-V2-3 | LogViewer Collapsible default OFF | Perlu konfirmasi | `API_CONTRACT.md V2.0 S7.5` |
| TP-V2-4 | Dashboard 6-8 cards + charts | Perlu konfirmasi | `SRS.md V2.0 S6.6` |
| TP-V2-5 | Upload di generate page = pre-submit | Perlu konfirmasi | `SRS.md V2.0 S6.1` |
| TP-V2-6 | Role 6 opsi | Dikonfirmasi | `SRS.md V2.0 S6.3` |
| TP-V2-7 | Confidence threshold 0.7 | ASUMSI | `SRS.md V2.0 S6.2` |
| TP-V2-8 | Auto-trigger classify saat upload | Perlu konfirmasi | `PRD.md V2.0 S9.3` |
| TP-V2-9 | Pagination 20/page max 100 | ASUMSI | `API_CONTRACT.md V2.0 S4.1` |
| TP-V2-10 | Recharts untuk charts | Perlu konfirmasi | `UIUX_SPEC.md V2.0 S12.5` |
| TP-V2-11 | Push GitHub public | Perlu konfirmasi | `SRS.md V2.0 S14` |
| TP-V2-12 | Vision LLM key env-only | DIKONFIRMASI | `CODING_RULES.md V2.0 S6.1 SEC-C22` |
| TP-V2-13 | Log buffer in-memory | ASUMSI | `SRS.md V2.0 S6.5` |
| TP-V2-14 | 3 kolom V2 additive nullable | DIKONFIRMASI | `DATABASE_SCHEMA.md V2.0 S7.2` |

### 14.2 Referensi Internal

| Dokumen | Path |
|---|---|
| RAG-CONTEXT | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| PRD V2.0 | `C:\laragon\www\PromptFlow\product-docs\PRD.md` |
| SRS V2.0 | `C:\laragon\www\PromptFlow\product-docs\SRS.md` |
| DATABASE_SCHEMA V2.0 | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` |
| API_CONTRACT V2.0 | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` |
| CODING_RULES V2.0 | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` |
| UIUX_SPEC V2.0 | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` |
| GitHub | `https://github.com/agrianwahab29/promptflow.git` |

### 14.3 Sitasi Eksternal

| Sitasi | Klaim |
|---|---|
| https://vitest.dev | Vitest framework, coverage, mock |
| https://playwright.dev | Playwright E2E, multi-browser, axe |
| https://github.com/dequelabs/axe-core | axe-playwright a11y |
| https://ai-sdk.dev/providers/openai-compatible-providers | Mock AI SDK v4, structured output |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Test DB Turso/libSQL |
| https://www.w3.org/TR/WCAG21 | WCAG 2.1 AA target a11y |
| https://nextjs.org/docs | Next.js App Router, loading.tsx, error.tsx |
| https://ui.shadcn.com/docs | shadcn/ui komponen UI |
| https://recharts.org/ | Recharts dashboard chart V2 |

---

> **Dokumen ini = rencana uji V2 siap dieksekusi agent. Total 167 test case.**
> **V1 86 TC dipertahankan + V2 81 TC ditambahkan. Cakup 23 endpoint, 30+ komponen UI, NFR V1+V2.**
> **TEST_PLAN tidak membangun deliverable akhir / menulis kode test — hanya rencana uji.**

> **Dibuat oleh:** docgen-test-plan subagent
> **Tanggal:** 2026-06-20
> **Versi:** 2.0
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Output file:** `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md`

---
