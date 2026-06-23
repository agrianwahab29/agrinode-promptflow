# TEST_PLAN.md - PromptFlow Test & QA Plan

> Disusun oleh docgen-test-plan. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `PRD.md` + `SRS.md` + `PROJECT_ARCHITECTURE.md` + `CODING_RULES.md` + `API_CONTRACT.md` + `UIUX_SPEC.md`.
> Klaim faktual bertumpu pada RAG (cite file:line). Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis + cuplikan kode apa adanya.
> Fokus: strategi pengujian, level, skenario per fitur PRD + realisasi SRS + endpoint API_CONTRACT + UI flow UIUX_SPEC + aturan CODING_RULES, siap dieksekusi agent eksekutor jadi kode test.

---

## 1. Ringkasan Strategi Pengujian + Lingkup + Asumsi

### 1.1 Strategi inti

Pengujian PromptFlow mengikuti **piramida uji** (`CODING_RULES S11.1`): unit (vitest) dominan -> integration (vitest mock DB) -> API/contract (vitest mock LLM) -> E2E/UI (playwright) -> UAT -> performance -> security. Tujuan inti: **prove fix Bug A (sfx_list schema-prompt mismatch) + Bug B (JSON repair lemah) + Bug D (partial persist silent) + observability kategori error** (`RAG S11`, `PRD S2.3`).

Pilar strategi (`PRD S4.1` MUST, `CODING_RULES S11.4`):
1. **Generation pipeline bug-shape test WAJIB** - mock LLM fetch return bug shapes (array `sfx_list`, JSON newline mentah, truncated) -> assert fix sukses. BLOCKER: tanpa lulus, PR tidak merge.
2. **Mock LLM deterministik** - mock fetch return distribusi bug-shape untuk 100 run -> assert success rate >= 95% (`PRD AC-KPI-01`).
3. **Contract test per endpoint** - tiap endpoint API_CONTRACT punya happy + error case.
4. **Ownership check test** - tiap endpoint `[id]` test user lain -> 404/409 (`CODING_RULES S11.5`).
5. **UI flow test** - LogViewer observability, ResultTabs partial warning, GenerateForm SSE consumer.

### 1.2 Lingkup

| Kategori | In-scope | Out-of-scope |
|---|---|---|
| Unit | `src/lib/ai/**`, `src/lib/validation/**`, `src/lib/db/repositories/**`, `src/lib/crypto/**`, `src/lib/auth/**`, `src/lib/export/**`, `src/lib/templates/**`, `src/lib/migration/**` | `src/components/ui/**` (shadcn primitive, trust radix) |
| Integration | repo function + mock drizzle, route handler + mock LLM + mock DB | Real DB Turso (CI pakai isolated test DB, `SRS S6.1`) |
| API/Contract | 29 operasi endpoint (`API_CONTRACT S8`) | Webhook (tidak ada, `API_CONTRACT S10`) |
| E2E/UI | flow: login, register, generate (mock LLM), export, settings CRUD, dashboard, i18n toggle, theme toggle, upload | Visual regression pixel-perfect (ASUMSI defer) |
| UAT | persona P1-P5 happy path (`PRD S2.1`) | Beta public user (out-of-scope v0.1.0) |
| Performance | generation p95, LLM latency, SSE heartbeat | Load test 1000 concurrent (out-of-scope, `PROJECT_ARCHITECTURE S11.1`) |
| Security | AES round-trip, bcrypt verify, rate limit, auth gate, no secrets in build | Pentest eksternal, DAST (out-of-scope) |
| Accessibility | WCAG 2.1 AA kontras, keyboard, ARIA, reduced motion (`UIUX_SPEC S7`) | WCAG AAA |
| Compatibility | Chrome/Firefox/Safari/Edge evergreen (`UIUX_SPEC S8.5`) | IE, legacy browser |

### 1.3 Asumsi

| # | Asumsi | Catatan |
|---|---|---|
| A1 | CI = GitHub Actions (tidak diverifikasi repo, `RAG S12 G15` vitest.config ada) | `PROJECT_ARCHITECTURE S12` rekomendasi CI workflow |
| A2 | k6 untuk performance test (tidak di package.json, ASUMSI tambah devDep) | `package.json` tidak punya k6 |
| A3 | Isolated test DB = Turso local file atau libSQL in-memory | `SRS S6.1` constraint SQLite |
| A4 | Mock LLM interface = fetch stub (`vi.fn`) return `{ ok, json, body, status }` | `llm-client.ts:284-289` pakai fetch |
| A5 | Seed file test data = `tests/fixtures/` (ASUMSI buat baru, tidak ada di repo) | `RAG S12 G10` test ada tapi fixture tidak diverifikasi |
| A6 | Browser E2E = Chromium only (`playwright.config.ts:14` single project) | Firefox/WebKit defer |
| A7 | Generation p95 target < 60s (`PRD NFR-PERF-01` ASUMSI); observed LLM ~110s (`PROJECT_ARCHITECTURE S11.1`) | Streaming + timeout mitigasi |

---

## 2. Level Pengujian + Tujuan + Tooling

| Level | Tujuan | Tool | Lokasi | Coverage target | Citation |
|---|---|---|---|---|---|
| Unit | Validasi logika fungsi terisolasi (pure function): schema parse, prompt build, JSON repair, AES, bcrypt, consistency, log-buffer, markdown render | vitest ^2.1 + @vitejs/plugin-react ^4.3 | `src/lib/**/*.test.ts` | `lib/ai` + `lib/validation` + `lib/db/repositories` >=80%, overall >=60% | `package.json:84,72`, `vitest.config.ts:26` |
| Integration | Interaksi modul + repo function dengan mock drizzle + route handler dengan mock LLM/DB | vitest (mock `@libsql/client`, mock fetch) | `src/lib/**/*.test.ts` (colocated) | repo function ter-cover, route handler happy + error | `CODING_RULES S11.1` |
| API/Contract | Validasi request/response per endpoint API_CONTRACT, status code, error envelope, ownership | vitest (invoke route handler langsung, mock DB+LLM) | `src/app/api/v1/**/*.test.ts` (ASUMSI tambah) | 29 operasi ter-cover happy + error | `API_CONTRACT S8` |
| E2E/UI | Flow end-to-end via browser real: login, generate SSE, export, settings, dashboard, i18n, theme | @playwright/test ^1.49 | `e2e/*.spec.ts` | flow utama pass | `package.json:64`, `playwright.config.ts` |
| UAT | Validasi persona happy path manual/semi-auto | checklist manual + playwright persona flow | `e2e/persona/*.spec.ts` (ASUMSI) | P1-P5 happy path | `PRD S2.1` |
| Performance/load | Latency generation p95, LLM call, SSE heartbeat, DB query | k6 (ASUMSI tambah) + vitest benchmark | `perf/*.k6.ts` (ASUMSI) | p95 < 60s target, LLM < 110s observed | `PRD NFR-PERF-01`, `PROJECT_ARCHITECTURE S11.1` |
| Security | AES round-trip, bcrypt verify, rate limit 429, auth gate 401/403, no secrets in build, input validation | vitest (crypto/auth test) + manual grep secret scan | `src/lib/crypto/aes.test.ts` (ada), `src/lib/auth/config.test.ts` (ada) | 0 secret in build, rate limit enforced | `CODING_RULES S10`, `PRD NFR-SEC` |
| Accessibility | WCAG 2.1 AA kontras, keyboard nav, ARIA, reduced motion | axe-core (ASUMSI via playwright-axe) + manual | `e2e/a11y/*.spec.ts` (ASUMSI) | 0 critical violation | `UIUX_SPEC S7` |
| Compatibility | Browser evergreen (Chrome/Firefox/Safari/Edge) + responsive breakpoint | playwright multi-browser (ASUMSI expand project) + viewport resize | `e2e/compat/*.spec.ts` (ASUMSI) | render konsisten | `UIUX_SPEC S8.5` |

---

## 3. Lingkungan + Tooling Test + Data Test

### 3.1 Lingkungan

| Env | Setup | Citation |
|---|---|---|
| Local dev | `pnpm dev` (Next.js dev server, `package.json:6`) + Turso local file (`TURSO_DATABASE_URL=file:local.db` ASUMSI) + `.env.local` (TURSO_*, ENCRYPTION_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL) | `RAG S10.5`, `.env.example:1-17` |
| Test unit | `pnpm test` (`package.json:11`) = `vitest run`, environment node (`vitest.config.ts:12`), globals true (`:13`), server-only stub (`:6-8`) | `vitest.config.ts` |
| Test coverage | `pnpm test:coverage` (`package.json:13`) = `vitest run --coverage`, provider v8 (`vitest.config.ts:22`), reporter text/json/html (`:23`), include `src/lib/**` + `src/app/api/**` (`:24`), threshold lines/branches/functions/statements 80 (`:26`) | `vitest.config.ts:21-27` |
| Test E2E | `pnpm test:e2e` (`package.json:14`) = `playwright test`, baseURL localhost:3000 (`playwright.config.ts:11`), webServer `pnpm dev` (`:16`), chromium only (`:14`), timeout 120s (`:5`), trace on-first-retry (`:12`) | `playwright.config.ts` |
| CI (ASUMSI) | GitHub Actions: `pnpm lint && pnpm format --check && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm test:e2e` | `PROJECT_ARCHITECTURE S12` rekomendasi, `CODING_RULES S13.5` |
| Isolated test DB | Turso local file `tests/test.db` ATAU libSQL in-memory (`:memory:`) - ASUMSI. Drizzle migrate schema sebelum run. Sanitasi: drop+recreate tabel per test suite (ASUMSI `beforeEach`) | `SRS S6.1` |
| Mock LLM | `vi.fn()` stub `global.fetch` return `{ ok: true, status: 200, json: async () => <mockResponse>, body: <mockStream> }`. Lihat S5 mock interface. | `llm-client.ts:284-289` |

### 3.2 Tooling framework per stack (dari `CODING_RULES S11.1`)

| Stack | Tool | Versi | Config |
|---|---|---|---|
| Test runner unit | vitest | ^2.1.0 | `vitest.config.ts` |
| Coverage | @vitest/coverage-v8 | ^2.1.0 | `vitest.config.ts:21-27` threshold 80 |
| React plugin | @vitejs/plugin-react | ^4.3.0 | `vitest.config.ts` (implicit) |
| E2E | @playwright/test | ^1.49.0 | `playwright.config.ts` |
| Performance (ASUMSI) | k6 | - | tambah devDep |
| A11y (ASUMSI) | axe-core / @axe-core/playwright | - | tambah devDep |
| Mock | vitest `vi.fn`, `vi.mock` | built-in | - |
| DB mock | vi.mock `@libsql/client` atau drizzle instance | - | `CODING_RULES S11.1` integration |
| LLM mock | `vi.stubGlobal('fetch', vi.fn())` | - | `llm-client.ts:284` |

### 3.3 Data test + fixture

| Fixture | Path (ASUMSI) | Shape | Sumber |
|---|---|---|---|
| known-good PromptPackage | `tests/fixtures/prompt-package-good.json` | `PromptPackageSchema` valid lengkap (3 scene, 2 char, image_prompts 8-layer, audio_specs ambient+music+sfx dengan sfx_list string) | `schemas.ts:106-124`, `prompt-builder.ts:75-97` example |
| bug-shape A response (sfx_list array) | `tests/fixtures/llm-response-sfx-array.json` | LLM return `{...scenes:[{audio_specs:[{audio_type:'sfx', sfx_list:["footstep","door"]}]}}` | `RAG S11 Bug A` |
| bug-shape B response (malformed JSON) | `tests/fixtures/llm-response-malformed.json.txt` | JSON dengan newline mentah di prompt_text + truncated + unterminated string | `RAG S11 Bug B`, `RAG S8.2.2` |
| bug-shape B2 (trailing data) | `tests/fixtures/llm-response-trailing.txt` | `{...valid} teks tambahan` | `SRS S3.1.4` |
| bug-shape B3 (control char) | `tests/fixtures/llm-response-control-char.json.txt` | JSON dengan tab mentah `\t` + CR `\r` di string | `SRS S3.1.4` |
| mock LLM bug-shape distribution | `tests/fixtures/mock-llm-distribution.ts` | array 100 mock response: 95 valid, 3 sfx array, 1 malformed, 1 truncated (bug-shape) | `PRD AC-KPI-01` |
| test user | `tests/fixtures/test-user.ts` | `{ id: 1, email: 'test@example.com', passwordHash: bcrypt('pass123'), role: 'user' }` | `schema.ts:5-14` |
| test provider config | `tests/fixtures/test-provider.ts` | `{ id: 1, userId: 1, provider: 'custom', name: 'test-minimax', baseUrl: 'http://mock-llm/v1', model: 'mock-model', apiKeyEncrypted: AES('sk-test'), isActive: 1 }` | `schema.ts:17-30` |
| seed file (ASUMSI baru) | `tests/seed/seed.ts` | insert test user + provider + 1 project + 1 generation log sukses | `SRS S6.1` |

Sanitasi: test DB di-reset per suite (`beforeEach` drop+create) ASUMSI. Tidak ada data real user. Tidak commit ke DB prod.

---

## 4. Matriks Fitur PRD -> Test Scenario

| PRD Fitur | FR | AC | Test Scenario ID | Level | Priority | Endpoint relasi |
|---|---|---|---|---|---|---|
| M1 Prompt contract sfx_list | FR-GEN-01 | AC-GEN-01 | TC-GEN-01, TC-GEN-07 | Unit | MUST | E1 |
| M2 Schema sfx_list union + normalizer | FR-GEN-02 | AC-GEN-02 | TC-GEN-01, TC-GEN-02 | Unit+Integration | MUST | E1 |
| M3 Retry vary request | FR-GEN-03 | AC-GEN-03 | TC-GEN-03 | Unit | MUST | E1 |
| M4 JSON repair hardening | FR-GEN-04 | AC-GEN-04 | TC-GEN-02 | Unit | MUST | E1 |
| M5 Validation error feedback | FR-GEN-05 | AC-GEN-05 | TC-GEN-03 | Unit | MUST | E1 |
| M6 SSE partial + log category | FR-GEN-06 | AC-GEN-06, AC-PERSIST-01 | TC-GEN-04, TC-GEN-05 | Integration+E2E | MUST | E1 |
| M7 Generation log lengkap | FR-LOG-01 | AC-LOG-01 | TC-LOG-01, TC-GEN-04 | Integration | MUST | E15 |
| M8 Persist reliability partial | FR-PERSIST-01 | AC-PERSIST-01 | TC-GEN-05, TC-PERSIST-01 | Integration | MUST | E1 |
| M9 AES API key encryption | FR-PROV-02 | AC-PROV-02 | TC-PROV-02, TC-SEC-01 | Unit+Integration | MUST | E25, E26 |
| M10 Auth register+login+rate limit | FR-AUTH-01, FR-AUTH-02 | AC-AUTH-01, AC-AUTH-02 | TC-AUTH-01, TC-AUTH-02, TC-SEC-02, TC-SEC-03 | Unit+E2E | MUST | E5, E1 |
| KPI success rate >=95% | - | AC-KPI-01 | TC-GEN-06 | Integration (100 mock run) | MUST | E1 |
| SSE streaming well-formed | FR-GEN-07 | - | TC-GEN-07 | E2E | SHOULD | E1 |
| Projects CRUD | FR-PROJ-01 | - | TC-PROJ-01..06 | API+E2E | SHOULD | E8-E14 |
| Export Markdown | FR-EXP-01 | - | TC-EXP-01 | Unit+E2E | SHOULD | E18 |
| Providers CRUD + test | FR-PROV-01, FR-PROV-03 | - | TC-PROV-01, TC-PROV-03 | API+E2E | SHOULD | E24-E29 |
| Dashboard stats | FR-DASH-01 | - | TC-DASH-01 | API | SHOULD | E4 |
| i18n id/en | FR-I18N-01 | - | TC-I18N-01 | E2E | SHOULD | - |
| Upload + classify | FR-ASSET-01, FR-ASSET-02 | - | TC-ASSET-01, TC-ASSET-02 | API+E2E | SHOULD | E6, E7 |
| Migration v2->v3 | FR-MIG-01 | - | TC-MIG-01 | Integration | SHOULD | - |
| Diagnose | FR-PROV-04 | - | TC-DIAG-01 | API | SHOULD | E3 |
| Theme preference | FR-PROJ-02 | - | TC-THEME-01 | API | COULD | E19 |
| Log viewer UI | FR-LOG-02 | - | TC-UI-LOG-01 | E2E | SHOULD | - |
| ResultTabs partial warning | FR-PERSIST-01 | AC-PERSIST-01 | TC-UI-RESULT-01 | E2E | MUST | - |
| Consistency checker | FR-GEN-08 | - | TC-CONSIST-01 | Unit | COULD | - |

---

## 5. Detail Test Case (urut per modul)

### 5.1 Generation pipeline (MUST - tutup Bug A/B/D)

#### TC-GEN-01: LLM return array sfx_list -> schema union accept -> normalizer coerce -> success

| Field | Value |
|---|---|
| ID | TC-GEN-01 |
| Modul | `src/lib/ai/llm-client.ts` + `src/lib/validation/schemas.ts` |
| Level | Unit + Integration |
| Priority | MUST (BLOCKER) |
| Precondition | Mock LLM fetch return `prompt-package-good` tapi scene 2 audio_specs[2].sfx_list = `["footstep","door creak"]` (array, Bug A shape). Schema sudah union `z.union([z.string(), z.array(z.string())])` (FR-GEN-02). |
| Langkah | 1. `vi.stubGlobal('fetch', mockFetchArraySfx)`. 2. Call `generatePromptPackage({provider, system, messages, onStreamChunk})`. 3. Assert return `validated: PromptPackage`. 4. Assert `validated.scenes[1].audio_specs[2].sfx_list` = `["footstep","door creak"]` (array lolos union). 5. Call route persist block (mock DB) -> assert `scene_audio.sfxList` insert = `"footstep, door creak"` (normalizer `Array.isArray ? join(', ') : value`). |
| Input | mock LLM response `tests/fixtures/llm-response-sfx-array.json` |
| Expected | `PromptPackageSchema.parse` sukses (union terima array). Normalizer coerce array -> string comma-separated sebelum DB insert. `scene_audio.sfxList` text = `"footstep, door creak"`. |
| Pass criteria | Parse sukses, normalizer output string, DB insert text. |
| Fail criteria | ZodError "Expected string, received array" (Bug A reproduces). |
| Relasi endpoint | E1 POST /api/v1/generate |
| Citation | `PRD AC-GEN-02`, `RAG S11 Bug A`, `SRS S3.1.2`, `schemas.ts:52` target union, `route.ts:376-407` normalizer site |

#### TC-GEN-02: LLM return malformed JSON (truncated, newline mentah, unescaped quote) -> repair succeed

| Field | Value |
|---|---|
| ID | TC-GEN-02 |
| Modul | `src/lib/ai/llm-client.ts` (`sanitizeJsonString` + `repairTruncatedJson`) |
| Level | Unit |
| Priority | MUST (BLOCKER) |
| Precondition | Mock LLM fetch return raw string JSON rusak: (a) `{"prompt_text":"line1\nline2"}` (newline mentah U+000A), (b) `{"a":"x"} trailing teks` (trailing data), (c) `{"a":"unterminated` (escape rusak), (d) `{"a":"tab\there"}` (tab mentah). |
| Langkah | 1. Input (a) -> `sanitizeJsonString` escape `\n` mentah -> `\\n` -> `JSON.parse` sukses. 2. Input (b) -> `sanitizeJsonString` strip trailing data -> `JSON.parse` sukses. 3. Input (c) -> `repairTruncatedJson` tambah closing quote -> `JSON.parse` sukses. 4. Input (d) -> `sanitizeJsonString` escape `\t` -> `\\t` -> `JSON.parse` sukses. |
| Input | `tests/fixtures/llm-response-malformed.json.txt`, `llm-response-trailing.txt`, `llm-response-control-char.json.txt` |
| Expected | Semua input parse sukses, tidak throw SyntaxError. |
| Pass criteria | 4 sub-case all pass. |
| Fail criteria | `JSON.parse` throw "Bad control character" / "Unexpected token" (Bug B reproduces). |
| Relasi endpoint | E1 |
| Citation | `PRD AC-GEN-04`, `RAG S11 Bug B`, `SRS S3.1.4`, `llm-client.ts:50-100,353-375` |

#### TC-GEN-03: Attempt 1 validation fail -> retry vary request + corrective prompt -> attempt 2 success

| Field | Value |
|---|---|
| ID | TC-GEN-03 |
| Modul | `src/lib/ai/llm-client.ts` retry loop |
| Level | Unit |
| Priority | MUST (BLOCKER) |
| Precondition | Mock fetch: attempt 1 return sfx_list array tapi schema lama (sebelum fix) reject -> ZodError. Attempt 2 return valid string. `maxRetries=2`. |
| Langkah | 1. `vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(attempt1Fail).mockResolvedValueOnce(attempt2Success))`. 2. Call `generatePromptPackage`. 3. Assert attempt 2 `messages` length > attempt 1 (corrective message appended). 4. Assert attempt 2 `messages[last].role` = `'user'` + content mengandung `'sfx_list'` + `'array'` + path field. 5. Assert attempt 2 `temperature` = 0.5 (bukan 0.7). 6. Assert backoff 2s sebelum attempt 2 fetch (`vi.useFakeTimers`). 7. Assert return validated sukses. 8. Assert `logsJson` entry `{ stage: 'retry_correction', attempt: 2, prevErrorCategory: 'VALIDATION', correctivePrompt }`. |
| Input | mock fetch 2-call sequence |
| Expected | Retry rebuild requestJson (messages + temp berbeda). Corrective message dari ZodError issues. Attempt 2 sukses. |
| Pass criteria | messages attempt 2 > attempt 1, temp 0.5, backoff 2s, sukses attempt 2. |
| Fail criteria | RequestJson identik attempt 1 (Bug B pattern reproduces). |
| Relasi endpoint | E1 |
| Citation | `PRD AC-GEN-03, AC-GEN-05`, `SRS S3.1.3, S3.1.5`, `llm-client.ts:279-414,274,287`, `CODING_RULES S8.1` |

#### TC-GEN-04: All attempts fail -> failure category persisted in generation_logs -> SSE error event with category + retryCount

| Field | Value |
|---|---|
| ID | TC-GEN-04 |
| Modul | `src/app/api/v1/generate/route.ts` failure path + `generation_logs` |
| Level | Integration |
| Priority | MUST |
| Precondition | Mock fetch semua attempt return invalid (sfx array + schema lama). `maxRetries=2`. Mock DB. |
| Langkah | 1. Invoke route handler POST dengan input valid + session mock. 2. Parse SSE stream events. 3. Assert `error` event `data.code` = `'VALIDATION'` (bukan generic `PROVIDER_ERROR`). 4. Assert `error` event `data.retryCount` = 2. 5. Assert `projects.status` = `'failed'`. 6. Assert `generation_logs` row: `status='fail'`, `errorMessage='[VALIDATION] Expected string, received array at scenes.2.audio_specs.2.sfx_list'`, `logsJson` array berisi retryCount=2 + correctivePrompt entries. |
| Input | mock fetch 2-call fail sequence |
| Expected | Error category spesifik (VALIDATION), retryCount tercatat, generation_logs persist lengkap. |
| Pass criteria | SSE error code = VALIDATION, retryCount=2, generation_logs row ada. |
| Fail criteria | Generic `PROVIDER_ERROR` tanpa kategori (current bug reproduces). |
| Relasi endpoint | E1 |
| Citation | `PRD AC-GEN-06`, `SRS S3.1.6`, `route.ts:238-264,520-548`, `llm-client.ts:18-44,422-423`, `schema.ts:147-160` |

#### TC-GEN-05: Partial success persist (safeDbOp gagal scene-level -> status partial + partialSceneIds)

| Field | Value |
|---|---|
| ID | TC-GEN-05 |
| Modul | `src/app/api/v1/generate/route.ts` persist block |
| Level | Integration |
| Priority | MUST |
| Precondition | Mock LLM return valid PromptPackage (3 scene). Mock DB: `bulkCreateScenes` sukses, tapi `createSceneAudio` scene 3 throw -> `safeDbOp` return null. |
| Langkah | 1. Invoke route handler. 2. Parse SSE. 3. Assert `done` event `data.partialSceneIds` = `[3]`. 4. Assert `projects.status` = `'partial'` (bukan `complete`). 5. Assert `generation_logs.status` = `'partial'`. 6. Assert master `image_prompts` (sceneId null) tetap disimpan. 7. Assert UI ResultTabs warning "Scene 3 gagal persist" (E2E). |
| Input | mock LLM valid + mock DB partial fail |
| Expected | Status partial eksplisit, partialSceneIds dilaporkan, master image_prompts tetap save. |
| Pass criteria | status=partial, partialSceneIds=[3], master image_prompts ada. |
| Fail criteria | status=complete meski scene hilang (Bug D reproduces). |
| Relasi endpoint | E1 |
| Citation | `PRD AC-GEN-06, AC-PERSIST-01`, `SRS S3.1.6`, `route.ts:35-51,316,366-367,518`, `RAG S11 Bug D` |

#### TC-GEN-06: Success rate >= 95% over 100 mock-LLM runs with bug-shape distributions

| Field | Value |
|---|---|
| ID | TC-GEN-06 |
| Modul | `src/lib/ai/llm-client.ts` end-to-end + schema + repair |
| Level | Integration (statistical) |
| Priority | MUST (KPI gate) |
| Precondition | Mock fetch return 100 response dari `mock-llm-distribution.ts`: 95 valid, 3 sfx array (Bug A), 1 malformed JSON (Bug B), 1 truncated. Schema union + normalizer + repair hardening aktif. |
| Langkah | 1. Loop 100x call `generatePromptPackage` dengan mock fetch sequence. 2. Count success (return validated PromptPackage) vs fail (throw). 3. Assert success count >= 95. 4. Assert fail count <= 5. 5. Assert zero silent failure (semua fail ter-kategorisasi). |
| Input | 100 mock response distribution |
| Expected | >= 95 sukses (success+partial), <= 5 fail. |
| Pass criteria | successRate >= 0.95. |
| Fail criteria | successRate < 0.95 (`PRD AC-KPI-01` fail). |
| Relasi endpoint | E1 |
| Citation | `PRD AC-KPI-01`, `PRD NFR-REL-01`, `RAG S11` |

#### TC-GEN-07: SSE stream events well-formed (stage sequence + heartbeat + stream_chunk + done)

| Field | Value |
|---|---|
| ID | TC-GEN-07 |
| Modul | `src/app/api/v1/generate/route.ts` SSE + `src/components/generate/generate-form.tsx` consumer |
| Level | E2E (playwright) |
| Priority | SHOULD |
| Precondition | Dev server running, test user login, mock LLM (ASUMSI route handler detect test env pakai mock). |
| Langkah | 1. Navigate `/id/generate`. 2. Fill GenerateForm (title, duration 60s, style 3D 9:16, 3 scene). 3. Click Generate. 4. Listen SSE stream via page evaluate `fetch` + ReadableStream reader. 5. Assert event sequence: `stage:starting` -> `stage:character_profiles` -> `stage:llm_calling` -> `stream_chunk` (>=1) -> `heartbeat` (>=1, elapsedSec) -> `stage:saving` -> `done`. 6. Assert format `event: <name>\ndata: <json>\n\n` (`route.ts:28-30`). 7. Assert headers `text/event-stream`, `no-cache`, `X-Accel-Buffering: no`. 8. Assert LogViewer auto-open + auto-scroll. |
| Input | UI form submission |
| Expected | SSE events well-formed, stage sequence benar, heartbeat ada. |
| Pass criteria | Semua event type terdeteksi, LogViewer render. |
| Fail criteria | Event missing, format salah, LogViewer tidak auto-open. |
| Relasi endpoint | E1 |
| Citation | `PRD AC-GEN-06`, `SRS S3.1.7`, `route.ts:163-554,557-563,28-30`, `UIUX_SPEC S6.7` |

### 5.2 Projects CRUD (SHOULD)

#### TC-PROJ-01: Create project

| Field | Value |
|---|---|
| ID | TC-PROJ-01 |
| Modul | `src/app/api/v1/projects/route.ts` + `project.repo.ts` |
| Level | API (vitest invoke route handler) |
| Priority | SHOULD |
| Precondition | Mock session user id 1. Mock DB. |
| Langkah | 1. POST `/api/v1/projects` body `{ title, durationType:'shorts', durationTargetSeconds:60, styleType:'3D', aspectRatio:'9:16' }`. 2. Assert 201. 3. Assert response `{ data: ProjectDTO }` status `draft`. 4. Assert repo `createProject` called dengan userId=1. |
| Input | valid CreateProjectInputSchema |
| Expected | 201 Created, ProjectDTO status draft. |
| Pass criteria | 201 + repo call. |
| Fail criteria | 400 validation / 500. |
| Relasi endpoint | E9 |
| Citation | `API_CONTRACT S9.9`, `schemas.ts:149-155`, `route.ts:125-135` |

#### TC-PROJ-02: List projects filter status + exclude soft-deleted

| Field | Value |
|---|---|
| ID | TC-PROJ-02 |
| Modul | `src/app/api/v1/projects/route.ts` GET |
| Level | API |
| Priority | SHOULD |
| Precondition | Mock DB return 3 project: 1 complete, 1 draft, 1 deletedAt set. |
| Langkah | 1. GET `/api/v1/projects?status=complete`. 2. Assert 200. 3. Assert response `data` length 1 (complete only, deletedAt excluded). 4. Assert pagination shape. |
| Input | query status=complete |
| Expected | Filter status + exclude soft-delete. |
| Pass criteria | data length 1, deletedAt excluded. |
| Relasi endpoint | E8 |
| Citation | `API_CONTRACT S9.8`, `schema.ts:47` |

#### TC-PROJ-03: Get project by id + ownership check

| Field | Value |
|---|---|
| ID | TC-PROJ-03 |
| Modul | `src/app/api/v1/projects/[id]/route.ts` GET |
| Level | API |
| Priority | SHOULD |
| Precondition | Mock DB: project id 1 milik user 1. Session user 2. |
| Langkah | 1. GET `/api/v1/projects/1` dengan session user 2. 2. Assert 404 (atau 409) - tidak bocor existence. |
| Input | id=1, session user 2 |
| Expected | 404/409 ownership fail. |
| Pass criteria | 404/409, tidak return data. |
| Relasi endpoint | E10 |
| Citation | `API_CONTRACT S9.10`, `route.ts:137-139`, `CODING_RULES S11.5` |

#### TC-PROJ-04: Update project

| Field | Value |
|---|---|
| ID | TC-PROJ-04 |
| Modul | `src/app/api/v1/projects/[id]/route.ts` PATCH |
| Level | API |
| Priority | SHOULD |
| Precondition | Project id 1 milik user 1. |
| Langkah | 1. PATCH `/api/v1/projects/1` body `{ title:'New', themePreference:'light' }`. 2. Assert 200 + updated ProjectDTO. |
| Input | partial update |
| Expected | 200 updated. |
| Relasi endpoint | E11 |
| Citation | `API_CONTRACT S9.11`, `schemas.ts:157`, `schema.ts:44` |

#### TC-PROJ-05: Soft delete project

| Field | Value |
|---|---|
| ID | TC-PROJ-05 |
| Modul | `src/app/api/v1/projects/[id]/route.ts` DELETE |
| Level | API |
| Priority | SHOULD |
| Precondition | Project id 1 milik user 1. |
| Langkah | 1. DELETE `/api/v1/projects/1`. 2. Assert 204. 3. Assert repo soft delete (`deletedAt` set). |
| Input | id=1 |
| Expected | 204 No Content, deletedAt set. |
| Relasi endpoint | E12 |
| Citation | `API_CONTRACT S9.12`, `schema.ts:47`, `project.repo.ts:33-65` |

#### TC-PROJ-06: Bulk delete projects

| Field | Value |
|---|---|
| ID | TC-PROJ-06 |
| Modul | `src/app/api/v1/projects/bulk-delete/route.ts` |
| Level | API |
| Priority | SHOULD |
| Precondition | 3 project milik user 1. |
| Langkah | 1. POST `/api/v1/projects/bulk-delete` body `{ ids:[1,2,3] }`. 2. Assert 200 `{ data: { deleted:3, failed:[] } }`. |
| Input | ids array |
| Expected | 200, deleted count 3. |
| Relasi endpoint | E14 |
| Citation | `API_CONTRACT S9.14` |

### 5.3 Export (SHOULD)

#### TC-EXP-01: Export Markdown lengkap (transition + voiceover + audio spec + sfx_list)

| Field | Value |
|---|---|
| ID | TC-EXP-01 |
| Modul | `src/lib/export/markdown.template.ts` + `src/app/api/v1/projects/[id]/export/route.ts` |
| Level | Unit + E2E |
| Priority | SHOULD |
| Precondition | Project id 1 status complete, `resultJson` = `prompt-package-good.json`. |
| Langkah | Unit: 1. Call `renderMarkdown(pkg)` dengan fixture. 2. Assert output mengandung: title, character_profiles lengkap, scenes dengan transition_type/duration/easing/direction, voiceover_script, voice spec, image_prompts 8-layer, audio_specs dengan sfx_list, supporting_characters, moral_message. E2E: 3. Login, navigate project detail, click Export. 4. Assert response `text/markdown`. 5. Assert download. |
| Input | prompt-package-good fixture |
| Expected | Markdown lengkap semua section. |
| Pass criteria | Semua section ada, sfx_list ter-render. |
| Fail criteria | Section missing (mis. sfx_list tidak render). |
| Relasi endpoint | E18 |
| Citation | `PRD FR-EXP-01`, `SRS S3.3.1`, `markdown.template.ts:4-173`, `markdown.template.test.ts` (existing) |

### 5.4 Providers (SHOULD + MUST AES)

#### TC-PROV-01: Provider CRUD + set active

| Field | Value |
|---|---|
| ID | TC-PROV-01 |
| Modul | `src/app/api/v1/settings/providers/**` + `provider-config.repo.ts` |
| Level | API |
| Priority | SHOULD |
| Precondition | Session user 1. |
| Langkah | 1. POST create `{ provider:'custom', name:'test', baseUrl:'http://x/v1', model:'m', apiKey:'sk-x' }` -> 201. 2. GET list -> data length 1, apiKeyMasked `****x` (bukan plaintext). 3. PATCH update model -> 200. 4. POST test -> 200 `{ ok, latencyMs }`. 5. DELETE -> 204. |
| Input | provider config |
| Expected | CRUD lengkap, apiKey masked di response. |
| Pass criteria | 201/200/204, apiKeyMasked bukan plaintext. |
| Relasi endpoint | E24-E29 |
| Citation | `API_CONTRACT S9.22`, `schemas.ts:161-168,224-235` |

#### TC-PROV-02: AES round-trip encrypt -> decrypt + maskApiKey

| Field | Value |
|---|---|
| ID | TC-PROV-02 |
| Modul | `src/lib/crypto/aes.ts` |
| Level | Unit |
| Priority | MUST (security) |
| Precondition | `ENCRYPTION_KEY` env set 32 byte base64. |
| Langkah | 1. `const enc = encryptToString('sk-xxx')`. 2. Assert enc != 'sk-xxx' (ciphertext). 3. `const dec = decryptFromString(enc)`. 4. Assert dec === 'sk-xxx'. 5. `const masked = maskApiKey('sk-xxx')`. 6. Assert masked === '****xxxx' (last 4). 7. Assert different IV per call (encrypt dua kali -> ciphertext beda). |
| Input | plaintext API key |
| Expected | Encrypt+decrypt round-trip, mask last 4. |
| Pass criteria | Round-trip sukses, mask benar, IV unique. |
| Fail criteria | Decrypt fail / plaintext bocor / mask salah. |
| Relasi endpoint | E25, E26 |
| Citation | `PRD AC-PROV-02`, `RAG S10.3`, `aes.ts:4-49`, `aes.test.ts` (existing) |

#### TC-PROV-03: Provider test endpoint (ping + latency)

| Field | Value |
|---|---|
| ID | TC-PROV-03 |
| Modul | `src/app/api/v1/settings/providers/[id]/test/route.ts` |
| Level | API |
| Priority | SHOULD |
| Precondition | Provider id 1, mock fetch return 200. |
| Langkah | 1. POST `/api/v1/settings/providers/1/test`. 2. Assert 200 `{ data: { ok:true, status:200, latencyMs, snippet } }`. 3. Mock fetch fail -> assert 502. |
| Input | provider id |
| Expected | 200 test result, 502 bila unreachable. |
| Relasi endpoint | E29 |
| Citation | `API_CONTRACT S9.22 E29`, `SRS S3.6.3` ASUMSI |

### 5.5 Auth (MUST)

#### TC-AUTH-01: Register + login bcrypt

| Field | Value |
|---|---|
| ID | TC-AUTH-01 |
| Modul | `src/app/api/v1/register/route.ts` + `src/lib/auth/config.ts` |
| Level | Unit + E2E |
| Priority | MUST |
| Precondition | Mock DB. |
| Langkah | Unit: 1. POST `/api/v1/register` `{ email:'test@x.com', password:'pass123', name:'Test' }`. 2. Assert 201 + `{ data: { id, email, name } }`. 3. Assert `users.passwordHash` = bcrypt hash (bukan plaintext 'pass123'). 4. Assert `bcrypt.compare('pass123', hash)` true. E2E: 5. Navigate `/register`, fill form, submit. 6. Navigate `/login`, fill email+password, submit. 7. Assert redirect `/generate`. 8. Assert session cookie set. |
| Input | register + login form |
| Expected | 201, passwordHash bcrypt, login sukses redirect. |
| Pass criteria | Hash bcrypt, compare true, login redirect. |
| Fail criteria | passwordHash plaintext (security breach). |
| Relasi endpoint | E5, `/api/auth/callback/credentials` |
| Citation | `PRD AC-AUTH-01`, `RAG S10.1, S10.2`, `config.ts:11-38,31`, `config.test.ts` (existing) |

#### TC-AUTH-02: Edge - register email duplikat -> 409

| Field | Value |
|---|---|
| ID | TC-AUTH-02 |
| Modul | register route |
| Level | Unit |
| Priority | SHOULD |
| Precondition | User email `test@x.com` sudah ada. |
| Langkah | 1. POST register email sama. 2. Assert 409 CONFLICT. |
| Input | duplicate email |
| Expected | 409. |
| Relasi endpoint | E5 |
| Citation | `API_CONTRACT S9.5`, `schema.ts:7` unique |

### 5.6 Security (MUST)

#### TC-SEC-01: AES round-trip + no plaintext in DB

| Field | Value |
|---|---|
| ID | TC-SEC-01 |
| Modul | `src/lib/crypto/aes.ts` + provider persist |
| Level | Integration |
| Priority | MUST |
| Precondition | - |
| Langkah | 1. POST create provider apiKey='sk-secret'. 2. Assert `provider_configs.apiKeyEncrypted` != 'sk-secret' (ciphertext). 3. GET list -> assert `apiKeyMasked` = '****cret' (bukan plaintext). 4. Generate flow -> assert `decryptFromString` return 'sk-secret' saat call LLM. |
| Input | provider apiKey |
| Expected | Encrypt at rest, mask display, decrypt saat pakai. |
| Pass criteria | DB ciphertext, response masked, decrypt sukses. |
| Fail criteria | Plaintext bocor. |
| Citation | `PRD AC-PROV-02, NFR-SEC-01`, `aes.ts:4-43,45-49` |

#### TC-SEC-02: bcrypt verify password

| Field | Value |
|---|---|
| ID | TC-SEC-02 |
| Modul | `src/lib/auth/config.ts` authorize |
| Level | Unit |
| Priority | MUST |
| Precondition | User hash = bcrypt.hash('pass123'). |
| Langkah | 1. Call `authorize({ email:'test@x.com', password:'pass123' })` -> assert return user object. 2. Call `authorize({ password:'wrong' })` -> assert return null. |
| Input | credential |
| Expected | compare true/false benar. |
| Pass criteria | Correct password return user, wrong return null. |
| Citation | `PRD NFR-SEC-06`, `config.ts:20-34,31` |

#### TC-SEC-03: Rate limit 429 + auth gate 401/403

| Field | Value |
|---|---|
| ID | TC-SEC-03 |
| Modul | `src/middleware.ts` |
| Level | E2E |
| Priority | MUST |
| Precondition | Dev server. |
| Langkah | 1. Tanpa session, POST `/api/v1/generate` -> assert 401 redirect `/login`. 2. Login user. 3. Kirim 11 request cepat `/api/v1/generate` dalam 1 menit. 4. Assert request ke-11 return 429 + `Retry-After: 60` + `error.code: RATE_LIMITED`. 5. Tunggu 60s, request lagi -> sukses (ASUMSI window reset). |
| Input | 11 request cepat |
| Expected | 401 no session, 429 rate limit. |
| Pass criteria | 401 + 429 enforced. |
| Fail criteria | Request ke-11 diproses / no auth gate. |
| Relasi endpoint | E1 |
| Citation | `PRD AC-AUTH-02, NFR-SEC-03`, `middleware.ts:18-36,109-127,83-87` |

#### TC-SEC-04: No secrets in build

| Field | Value |
|---|---|
| ID | TC-SEC-04 |
| Modul | build output |
| Level | Manual/grep |
| Priority | MUST |
| Precondition | - |
| Langkah | 1. `pnpm build`. 2. `grep -r "sk-test\|ENCRYPTION_KEY\|NEXTAUTH_SECRET\|TURSO_AUTH_TOKEN" .next/static/` -> assert 0 match. 3. Assert `.env.local` tidak di-commit (`git status`). |
| Input | build artifact |
| Expected | 0 secret di client bundle. |
| Pass criteria | grep 0 match. |
| Citation | `PRD NFR-SEC-05, NFR-SEC-07`, `CODING_RULES S10.6` |

### 5.7 Dashboard (SHOULD)

#### TC-DASH-01: Dashboard stats aggregate

| Field | Value |
|---|---|
| ID | TC-DASH-01 |
| Modul | `src/app/api/v1/dashboard/stats/route.ts` + `dashboard.repo.ts` |
| Level | API |
| Priority | SHOULD |
| Precondition | Mock DB: 42 project, 100 generate (80 success, 15 partial, 5 fail), 3 provider. |
| Langkah | 1. GET `/api/v1/dashboard/stats`. 2. Assert 200 `{ data: { totalProjects:42, totalGenerates:100, successRate:0.95, statusBreakdown:{success:80,partial:15,fail:5}, providerDistribution:[...] } }`. |
| Input | mock aggregate |
| Expected | 200 stats lengkap. |
| Relasi endpoint | E4 |
| Citation | `API_CONTRACT S9.4`, `SRS S3.5.1` |

### 5.8 i18n (SHOULD)

#### TC-I18N-01: Language toggle id/en

| Field | Value |
|---|---|
| ID | TC-I18N-01 |
| Modul | `src/components/common/language-toggle.tsx` + next-intl |
| Level | E2E |
| Priority | SHOULD |
| Precondition | Dev server. |
| Langkah | 1. Navigate `/id/generate`. 2. Assert heading Bahasa Indonesia. 3. Click LanguageToggle -> select `en`. 4. Assert URL `/en/generate`. 5. Assert heading English. 6. Assert cookie locale set. |
| Input | toggle UI |
| Expected | URL + content switch id/en. |
| Pass criteria | Route + text berubah. |
| Citation | `PRD FR-I18N-01`, `UIUX_SPEC S9`, `middleware.ts:38-54,40` |

### 5.9 Upload + classify (SHOULD + COULD)

#### TC-ASSET-01: Upload asset ke Vercel Blob

| Field | Value |
|---|---|
| ID | TC-ASSET-01 |
| Modul | `src/app/api/v1/upload/route.ts` |
| Level | API + E2E |
| Priority | SHOULD |
| Precondition | Mock Vercel Blob (`USE_VERCEL_BLOB=false` fallback ASUMSI). |
| Langkah | 1. POST `/api/v1/upload` multipart `file=image.png, tipe=tokoh, label=Rina`. 2. Assert 201 `{ data: { id, tipe:'tokoh', filename, blobUrl, label, mimeType, sizeBytes } }`. 3. Assert `asset_references` row persist. |
| Input | multipart form |
| Expected | 201 + asset_references persist. |
| Relasi endpoint | E6 |
| Citation | `API_CONTRACT S9.6`, `SRS S3.9.1`, `schemas.ts:173` |

#### TC-ASSET-02: Classify asset V2 Vision

| Field | Value |
|---|---|
| ID | TC-ASSET-02 |
| Modul | `src/app/api/v1/upload/classify/route.ts` + `image-classifier.ts` |
| Level | API |
| Priority | COULD |
| Precondition | Asset id 1 ada, mock Vision LLM. |
| Langkah | 1. POST `/api/v1/upload/classify` `{ assetId:1 }`. 2. Assert 200 `{ data: { role:'tokoh', label, confidence, description } }`. 3. Assert `aiClassification` JSON persist. 4. Mock Vision fail -> 502. |
| Input | assetId |
| Expected | 200 classification, 502 bila LLM fail. |
| Relasi endpoint | E7 |
| Citation | `API_CONTRACT S9.7`, `SRS S3.9.2`, `schemas.ts:252-257` |

### 5.10 Migration (SHOULD)

#### TC-MIG-01: V2->V3 migration backfill + rollback

| Field | Value |
|---|---|
| ID | TC-MIG-01 |
| Modul | `src/lib/migration/v2-to-v3.ts` |
| Level | Integration |
| Priority | SHOULD |
| Precondition | Mock DB dengan project V2 (scenes tanpa transition fields). |
| Langkah | 1. Run `migrateV2ToV3()`. 2. Assert scenes dapat transition_type/duration/easing/direction default. 3. Assert scene_audio rows create dari audio_specs. 4. Run `rollbackV3ToV2()`. 5. Assert fields di-nullified / scene_audio drop. |
| Input | V2 data |
| Expected | Backfill + rollback sukses. |
| Pass criteria | Field terisi, rollback bersih. |
| Citation | `PRD FR-MIG-01`, `SRS S3.11.1`, `v2-to-v3.ts:59-142` |

### 5.11 Diagnose (SHOULD)

#### TC-DIAG-01: Diagnose endpoint check DB+env+auth+provider

| Field | Value |
|---|---|
| ID | TC-DIAG-01 |
| Modul | `src/app/api/v1/diagnose/route.ts` |
| Level | API |
| Priority | SHOULD |
| Precondition | Mock DB ok, env set, session user 1, provider active. |
| Langkah | 1. GET `/api/v1/diagnose`. 2. Assert 200 `{ data: { checks:[{check:'db',status:'ok'}, {check:'env',status:'ok'}, {check:'auth',status:'ok'}, {check:'provider',status:'ok'}] } }`. 3. Mock DB fail -> assert check db status fail. |
| Input | - |
| Expected | 200 checks per kategori. |
| Relasi endpoint | E3 |
| Citation | `API_CONTRACT S9.3`, `SRS S3.6.4` ASUMSI |

### 5.12 UI flow (MUST + SHOULD)

#### TC-UI-LOG-01: LogViewer observability - tampilkan kategori error + retryCount + correctivePrompt

| Field | Value |
|---|---|
| ID | TC-UI-LOG-01 |
| Modul | `src/components/generate/log-viewer.tsx` |
| Level | E2E |
| Priority | SHOULD |
| Precondition | Generate running dengan mock LLM return sfx array (Bug A) -> retry. |
| Langkah | 1. Submit generate. 2. Assert LogViewer auto-open saat streaming. 3. Assert log entry `[WARN] [VALIDATION] scenes.2.audio_specs.2.sfx_list expected string received array`. 4. Assert log entry `[INFO] retry 2/2 corrective prompt appended`. 5. Assert level badge warna (info=blue, warn=yellow, error=red). 6. Assert auto-scroll bottom. 7. Assert `role="log"` + `aria-live`. |
| Input | SSE stream dengan retry |
| Expected | LogViewer render kategori + retry + corrective. |
| Pass criteria | Kategori + retryCount tampil, auto-open, a11y. |
| Fail criteria | Generic error tanpa kategori. |
| Citation | `PRD US-LOG-02`, `UIUX_SPEC S6.7, S3.2 LogViewer`, `log-viewer.tsx:13-19,44-46,51,55`, `log-buffer.test.ts` (existing) |

#### TC-UI-RESULT-01: ResultTabs partial warning scene hilang

| Field | Value |
|---|---|
| ID | TC-UI-RESULT-01 |
| Modul | `src/components/generate/result-tabs.tsx` |
| Level | E2E |
| Priority | MUST |
| Precondition | Generate sukses dengan partialSceneIds=[3]. |
| Langkah | 1. Submit generate -> done event partialSceneIds=[3]. 2. Assert ResultTabs render Alert warning "Scene 3 gagal persist - regenerate perlu". 3. Assert tab content scene 1-2 ada, scene 3 audio empty. |
| Input | partialSceneIds |
| Expected | Warning alert tampil. |
| Pass criteria | Alert warning + scene 3 empty. |
| Fail criteria | Status complete, no warning (Bug D UI reproduces). |
| Citation | `PRD AC-PERSIST-01`, `UIUX_SPEC S3.2 ResultTabs`, `SRS S3.1.6` |

### 5.13 Consistency checker (COULD)

#### TC-CONSIST-01: Character ref mismatch warning

| Field | Value |
|---|---|
| ID | TC-CONSIST-01 |
| Modul | `src/lib/ai/consistency-checker.ts` |
| Level | Unit |
| Priority | COULD |
| Precondition | PromptPackage dengan character_profiles nama "Rina" tapi scene image_prompts reference "Rina berbeda" (mismatch). |
| Langkah | 1. Call `checkConsistency(pkg)`. 2. Assert return warnings array non-empty dengan pesan mismatch. |
| Input | pkg mismatch |
| Expected | warnings non-empty. |
| Pass criteria | Mismatch terdeteksi. |
| Citation | `PRD FR-GEN-08`, `consistency-checker.ts:19-38`, `consistency-checker.test.ts` (existing) |

### 5.14 Generation log (MUST)

#### TC-LOG-01: Generation log lengkap dengan retryCount + correctivePrompt

| Field | Value |
|---|---|
| ID | TC-LOG-01 |
| Modul | `src/app/api/v1/projects/[id]/logs/route.ts` + `generation-log.repo.ts` |
| Level | Integration |
| Priority | MUST |
| Precondition | Generate sukses dengan 1 retry. |
| Langkah | 1. GET `/api/v1/projects/1/logs`. 2. Assert 200 `{ data: [{ id, projectId, provider, model, durationMs, status:'success', errorMessage:null, logsJson:[{stage:'starting'}, {stage:'retry_correction', attempt:2, correctivePrompt}, {stage:'done'}], createdAt }] }`. 3. Assert `logsJson` berisi retryCount=1 + correctivePrompt. |
| Input | project id |
| Expected | logsJson lengkap dengan retry metadata. |
| Pass criteria | retryCount + correctivePrompt ada. |
| Fail criteria | logsJson null/tanpa retryCount. |
| Relasi endpoint | E15 |
| Citation | `PRD AC-LOG-01`, `SRS S3.4.1`, `schema.ts:147-160`, `generation-log.repo.ts:1-32` |

### 5.15 Theme preference (COULD)

#### TC-THEME-01: Set theme preference per project

| Field | Value |
|---|---|
| ID | TC-THEME-01 |
| Modul | `src/app/api/v1/projects/[id]/theme/route.ts` |
| Level | API |
| Priority | COULD |
| Precondition | Project id 1 milik user 1. |
| Langkah | 1. PATCH `/api/v1/projects/1/theme` `{ themePreference:'light' }`. 2. Assert 200 + ProjectDTO themePreference='light'. 3. Invalid enum -> 400. |
| Input | enum dark|light|system |
| Expected | 200 updated, 400 invalid. |
| Relasi endpoint | E19 |
| Citation | `API_CONTRACT S9.19`, `schemas.ts:103`, `schema.ts:44` |

---

## 6. Mock LLM Strategy (DEEP)

### 6.1 Interface mock

Mock LLM = stub `global.fetch` via `vi.stubGlobal('fetch', mockFetch)`. `llm-client.ts:284-289` pakai `fetch(endpoint, { method:'POST', headers, body:requestJson, signal:AbortSignal.timeout(600_000) })`.

```typescript
type MockLlmResponse = {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;        // non-stream response
  body?: ReadableStream<Uint8Array>;     // stream response (SSE delta.content)
  text?: () => Promise<string>;          // raw text response
};

function mockFetch(response: MockLlmResponse | MockLlmResponse[]): vi.Mock {
  const seq = Array.isArray(response) ? response : [response];
  let call = 0;
  return vi.fn(async () => {
    const r = seq[Math.min(call, seq.length - 1)];
    call++;
    return r as Response;
  });
}
```

### 6.2 Mock stream builder

Untuk SSE stream `delta.content` (`llm-client.ts:303-330`):

```typescript
function mockSseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`data: {"choices":[{"delta":{"content":${JSON.stringify(chunk)}}}]}\n\n`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}
```

### 6.3 Bug-shape mock responses

| Shape | Mock | Tujuan |
|---|---|---|
| valid-good | `mockFetch({ ok:true, status:200, body: mockSseStream([JSON.stringify(promptPackageGood)]) })` | Happy path |
| sfx-array (Bug A) | body stream berisi PromptPackage scene 2 audio_specs[2].sfx_list = `["footstep","door"]` | TC-GEN-01 |
| malformed-newline (Bug B) | body stream berisi `{"prompt_text":"line1\nline2"}` (newline mentah) | TC-GEN-02 |
| truncated | body stream berisi `{"a":"unterminated` | TC-GEN-02 |
| trailing-data | body stream berisi `{"a":"x"} teks tambahan` | TC-GEN-02 |
| control-char | body stream berisi `{"a":"tab\there"}` | TC-GEN-02 |
| distribution-100 | array 100 MockLlmResponse (95 valid, 3 sfx-array, 1 malformed, 1 truncated) | TC-GEN-06 |
| fail-valid-then-success | `[attempt1Fail, attempt2Success]` | TC-GEN-03 |
| all-fail | `[fail, fail]` | TC-GEN-04 |

### 6.4 Verifikasi mock terpakai

Assert `mockFetch` terpanggil N kali (`expect(mockFetch).toHaveBeenCalledTimes(N)`). Assert body request per attempt (`expect(mockFetch.mock.calls[attempt-1][1].body)` berisi corrective message attempt 2).

---

## 7. Pengujian Non-Fungsional

### 7.1 Performance

| ID | Target | Tool | Skenario | Pass criteria | Citation |
|---|---|---|---|---|---|
| TC-PERF-01 | Generation p95 < 60s (ASUMSI target) | k6 (ASUMSI) | 100 request mock LLM (instant response), ukur end-to-end route handler | p95 < 60s | `PRD NFR-PERF-01` |
| TC-PERF-02 | LLM call latency observed ~110s | vitest timer | Mock fetch delay 110s (`vi.useFakeTimers`), assert route handler handle (heartbeat 2s aktif, maxDuration 300) | no timeout < 300s | `PROJECT_ARCHITECTURE S11.1`, `route.ts:20,213-220` |
| TC-PERF-03 | Heartbeat SSE 2s | E2E | Generate running, assert heartbeat event tiap 2s | heartbeat interval 2s | `PRD NFR-PERF-06`, `route.ts:213-220` |
| TC-PERF-04 | fetch timeout 600s (SRS target 300s) | unit | Mock fetch AbortError setelah 600s, assert categorizeError TIMEOUT | category TIMEOUT | `SRS NFR-PERF-05`, `llm-client.ts:284-289,22-24` |
| TC-PERF-05 | DB query < 100ms (ASUMSI) | k6 | 1000 query `getProjectById`, ukur p95 | p95 < 100ms | `PRD NFR-PERF-08` |
| TC-PERF-06 | max_tokens 32768 default, 65536 attempt 3 | unit | Assert request body attempt 1 max_tokens=32768, attempt 3=65536 | value benar | `SRS S3.1.3`, `llm-client.ts:270` |

> **Catatan p95 vs observed**: Target p95 < 60s ASUMSI (`PRD NFR-PERF-01`), observed LLM ~110s (`PROJECT_ARCHITECTURE S11.1`). Mitigasi: SSE streaming + heartbeat + maxDuration 300s Vercel + retry attempt 3 stream:false. Performance test pakai mock LLM instant untuk ukur overhead route handler (exclude LLM latency). LLM latency diukur terpisah.

### 7.2 Security

| ID | Skenario | Pass criteria | Citation |
|---|---|---|---|
| TC-SEC-01 | AES round-trip + no plaintext DB | Lihat S5.6 | `PRD NFR-SEC-01` |
| TC-SEC-02 | bcrypt verify | Lihat S5.6 | `PRD NFR-SEC-06` |
| TC-SEC-03 | Rate limit 429 + auth gate 401 | Lihat S5.6 | `PRD NFR-SEC-03` |
| TC-SEC-04 | No secrets in build | Lihat S5.6 | `PRD NFR-SEC-05, NFR-SEC-07` |
| TC-SEC-05 | Input validation - SQL injection attempt | POST generate body `title: "'; DROP TABLE projects;--"` -> assert 400 validation / escape Drizzle | `CODING_RULES S6.5, S10.7` |
| TC-SEC-06 | Auth bypass attempt | GET `/api/v1/projects/1` tanpa cookie -> 401 | `CODING_RULES S10.5` |
| TC-SEC-07 | XSS attempt | POST project title `<script>alert(1)</script>` -> assert React escape (no dangerouslySetInnerHTML) | `CODING_RULES S10.9` |
| TC-SEC-08 | eval/Function on LLM output | grep `eval\|new Function` di `src/lib/ai/` -> 0 match | `CODING_RULES S10.8` |
| TC-SEC-09 | Ownership check all [id] endpoint | TC-PROJ-03 pattern untuk semua endpoint [id] | `CODING_RULES S11.5, NFR-SEC-08` |
| TC-SEC-10 | server-only guard | import `lib/db` di client component -> build fail | `CODING_RULES S3.1, S10.6` |

### 7.3 Compatibility (browser/OS)

| ID | Skenario | Pass criteria | Citation |
|---|---|---|---|
| TC-COMP-01 | Chrome 120+ render generate flow | UI render, SSE consumer jalan | `UIUX_SPEC S8.5` |
| TC-COMP-02 | Firefox 120+ | sama | `UIUX_SPEC S8.5` |
| TC-COMP-03 | Safari 17+ | sama | `UIUX_SPEC S8.5` |
| TC-COMP-04 | Edge 120+ | sama | `UIUX_SPEC S8.5` |
| TC-COMP-05 | Mobile iOS 16+ Safari | responsive layout, sticky bottom submit | `UIUX_SPEC S8.3, S8.5` |
| TC-COMP-06 | Mobile Android 12+ Chrome | sama | `UIUX_SPEC S8.5` |

> ASUMSI: playwright config saat ini chromium only (`playwright.config.ts:14`). Expand project Firefox/WebKit untuk compat test.

### 7.4 Accessibility (WCAG 2.1 AA)

| ID | Skenario | Pass criteria | Citation |
|---|---|---|---|
| TC-A11Y-01 | Kontras token warning `#d97706` di bg putih = 3.4:1 FAIL text normal | warning text bold >=14px atau bg+text putih | `UIUX_SPEC S7.1` |
| TC-A11Y-02 | Kontras success `#16a34a` 3.8:1 | sama aksi | `UIUX_SPEC S7.1` |
| TC-A11Y-03 | Keyboard nav Tab reachable semua interaktif | no trap, focus visible ring 2px | `UIUX_SPEC S7.2`, `globals.css:42-45` |
| TC-A11Y-04 | LogViewer `role="log"` + `aria-live="polite"` streaming / `"assertive"` error | ARIA set | `UIUX_SPEC S7.3` ASUMSI belum |
| TC-A11Y-05 | Form Input wajib Label htmlFor | label terhubung | `UIUX_SPEC S7.3` |
| TC-A11Y-06 | Error form `aria-invalid` + `aria-describedby` | ARIA set | `UIUX_SPEC S7.3` |
| TC-A11Y-07 | Reduced motion `prefers-reduced-motion: reduce` durasi 0.01ms | motion disable | `UIUX_SPEC S7.6`, `globals.css:74-82` |
| TC-A11Y-08 | Alt text image asset + logo | alt ada | `UIUX_SPEC S7.4` |
| TC-A11Y-09 | Icon aksi `aria-label` | label ada | `UIUX_SPEC S7.4` |
| TC-A11Y-10 | axe-core scan 0 critical violation (ASUMSI playwright-axe) | 0 critical | `UIUX_SPEC S7` |

### 7.5 Responsif + visual regression

| ID | Skenario | Breakpoint | Pass criteria | Citation |
|---|---|---|---|---|
| TC-RESP-01 | Generate layout mobile stack | default <640px | form->log->result vertikal, log closed | `UIUX_SPEC S8.2, S8.3` |
| TC-RESP-02 | Generate layout desktop 3-kolom | lg >=1024px | grid 3-kolom form/log/result | `UIUX_SPEC S4.3, S8.2` |
| TC-RESP-03 | Projects grid mobile 1-kolom, desktop 4-kolom | default / xl | grid responsive | `UIUX_SPEC S4.4, S8.2` |
| TC-RESP-04 | Dashboard mobile 1-kolom metric, desktop 4-kolom | default / lg | grid responsive | `UIUX_SPEC S4.8, S8.2` |
| TC-VIS-01 | LogViewer state empty/streaming/error | - | render sesuai state (`UIUX_SPEC S6.7`) | `UIUX_SPEC S6.7` |
| TC-VIS-02 | ResultTabs state loading/success/partial/empty | - | skeleton + alert warning | `UIUX_SPEC S3.2` |
| TC-VIS-03 | Button state default/hover/active/disabled/loading | - | token warna benar | `UIUX_SPEC S3.8` |

---

## 8. Target Coverage + Cara Ukur

### 8.1 Target

| Modul | Target | Citation |
|---|---|---|
| `src/lib/ai/**` | >= 80% lines/branches/functions/statements | `PRD NFR-MAINT-06`, `vitest.config.ts:26` threshold 80 |
| `src/lib/validation/**` | >= 80% | sama |
| `src/lib/db/repositories/**` | >= 80% | `CODING_RULES S11.1` |
| `src/lib/crypto/**` | >= 80% | security critical |
| `src/lib/auth/**` | >= 80% | security critical |
| `src/lib/export/**` | >= 60% | `CODING_RULES S11.1` lainnya |
| `src/lib/templates/**` | >= 60% | - |
| `src/lib/migration/**` | >= 60% | - |
| `src/app/api/**` | >= 60% | `vitest.config.ts:24` include |
| Overall `src/lib/**` + `src/app/api/**` | >= 60% | `vitest.config.ts:26` threshold 80 (ASUMSI overall, tapi modul kritis 80) |
| `src/components/ui/**` | exclude (trust shadcn) | `vitest.config.ts:25` |
| `src/components/generate/**` | >= 60% (E2E cover) | - |

### 8.2 Cara ukur

```bash
pnpm test:coverage
# vitest run --coverage
# reporter: text, json, html (vitest.config.ts:23)
# threshold: lines 80, branches 80, functions 80, statements 80 (vitest.config.ts:26)
# include: src/lib/**, src/app/api/** (vitest.config.ts:24)
# exclude: **/*.test.ts, src/components/ui/** (vitest.config.ts:25)
```

Coverage report di `coverage/` folder. CI fail bila threshold tidak tercapai (`vitest.config.ts:26`).

---

## 9. Entry & Exit Criteria + Definition of Done

### 9.1 Entry criteria tiap level

| Level | Entry criteria |
|---|---|
| Unit | Branch clean, `pnpm lint` lulus, `pnpm typecheck` lulus, `pnpm format --check` lulus |
| Integration | Unit test pass, mock DB+LLM setup ready |
| API/Contract | Route handler + schema ready, mock session+DB+LLM |
| E2E | Dev server running (`pnpm dev`), test user seed, mock LLM (ASUMSI env toggle) |
| UAT | E2E pass, persona flow ready |
| Performance | E2E pass, k6 setup (ASUMSI) |
| Security | Unit pass, build sukses |

### 9.2 Exit criteria tiap level

| Level | Exit criteria |
|---|---|
| Unit | All `*.test.ts` pass, coverage threshold met (80% kritis, 60% lain) |
| Integration | All integration test pass, mock LLM bug-shape pass (TC-GEN-01..06 BLOCKER) |
| API/Contract | 29 endpoint happy+error ter-cover, ownership test pass |
| E2E | Flow login/register/generate/export/settings/dashboard pass, LogViewer observability pass |
| UAT | Persona P1-P5 happy path pass |
| Performance | p95 < 60s (mock LLM), heartbeat 2s, no timeout < 300s |
| Security | 0 secret in build, AES+bcrypt+rate limit+auth gate pass, 0 critical a11y |
| Overall DoD | 0 critical bug, semua MUST TC pass, coverage met, mock success rate >= 95%, lint+typecheck+build lulus |

### 9.3 Definition of Done pengujian

- [ ] Semua MUST test case pass (TC-GEN-01..06, TC-PERSIST-01, TC-LOG-01, TC-PROV-02, TC-AUTH-01, TC-SEC-01..04, TC-UI-RESULT-01)
- [ ] Coverage `lib/ai` + `lib/validation` + `lib/db/repositories` >= 80%
- [ ] Overall coverage >= 60%
- [ ] 0 critical bug, 0 blocker bug
- [ ] Mock LLM success rate >= 95% (TC-GEN-06)
- [ ] `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build` lulus
- [ ] E2E flow utama pass (login, generate, export)
- [ ] Security: 0 secret in build, AES+bcrypt+rate limit+auth gate pass
- [ ] A11y: 0 critical WCAG violation
- [ ] Bug A + B + D fix proven by test (TC-GEN-01, 02, 05)

---

## 10. Strategi Regression + Smoke Test + Test Data Management + Bug Tracking

### 10.1 Regression

| Trigger | Scope | Citation |
|---|---|---|
| Per PR | Full vitest + playwright, re-run TC-GEN-01..07 (BLOCKER regression) | `CODING_RULES S13.5` |
| Merge main | Full suite + coverage report |
| Dependency upgrade | Full suite + E2E compat |
| Pre-release | Full suite + performance + security + UAT |

### 10.2 Smoke test

Subset minimal dijalankan sebelum deploy (fast feedback):
- TC-AUTH-01 (login)
- TC-GEN-01 (sfx union)
- TC-GEN-07 (SSE stream)
- TC-PROJ-01 (create project)
- TC-SEC-03 (auth gate)

### 10.3 Test data management

- Test DB isolated: `tests/test.db` (Turso local file) atau `:memory:` ASUMSI. Reset per suite (`beforeEach` drop+create).
- Fixture: `tests/fixtures/` JSON/ts file, commit ke repo. Tidak pakai data real user.
- Seed: `tests/seed/seed.ts` insert test user + provider + project. Idempotent.
- Mock LLM: `vi.stubGlobal` per test, cleanup `afterEach` `vi.unstubAllGlobals`.
- Sanitasi: tidak commit secret. `.env.test` (tidak di-commit) untuk test env vars.

### 10.4 Bug tracking

- GitHub Issues label `bug` + severity (critical/major/minor).
- Critical = block MUST TC / security / data loss. Major = SHOULD TC fail / UX broken. Minor = cosmetic.
- Bug reproduce: lampirkan test case ID + step + mock response.
- Bug fix WAJIB tambah test case regression (prevent recur).

---

## 11. Risiko Pengujian + Mitigasi

| # | Risiko | Dampak | Mitigasi | Citation |
|---|---|---|---|---|
| R1 | Mock LLM tidak representatif real LLM (MiniMax-M3 behavior beda) | Fix test pass tapi real fail | Validasi manual dengan real provider di staging; mock pakai bug-shape dari log user (`RAG S11`) | `RAG S12 G8` |
| R2 | Turso local file berbeda behavior dengan hosted Turso | Integration test pass tapi prod fail | Test dengan replica Turso hosted di CI staging (ASUMSI); pakai drizzle migrate sama | `SRS S6.1` |
| R3 | E2E flaky (SSE timing, auto-scroll) | E2E intermittent fail | `playwright.config.ts:12` trace on-first-retry, retry 1x, timeout 120s (`:5`), expect timeout 60s (`:6`) | `playwright.config.ts` |
| R4 | Coverage threshold 80% terlalu tinggi untuk modul baru | CI block PR | Modul kritis 80%, lain 60%; tambah test bertahap | `vitest.config.ts:26` |
| R5 | k6/axe belum di package.json | Performance/a11y test tidak jalan | Tambah devDep `k6`, `@axe-core/playwright` ASUMSI | `package.json` |
| R6 | Mock fetch tidak handle AbortSignal.timeout | Timeout test fail | Mock fetch ignore signal atau stub `AbortSignal.timeout` | `llm-client.ts:288` |
| R7 | CI GitHub Actions belum diverifikasi | CI workflow tidak ada | Buat `.github/workflows/ci.yml` ASUMSI (`PROJECT_ARCHITECTURE S12`) | `RAG S12 G15` |
| R8 | Browser E2E chromium only | Compat test Firefox/Safari tidak cover | Expand playwright project Firefox/WebKit ASUMSI | `playwright.config.ts:14` |
| R9 | Generation p95 target 60s vs observed 110s | Performance test fail | Test pakai mock LLM instant (exclude LLM latency); LLM latency diukur terpisah + dokumentasi gap | `PROJECT_ARCHITECTURE S11.1` |
| R10 | Test data PromptPackage fixture manual drift dari schema | Test pass tapi schema change tidak terdeteksi | Generate fixture dari `PromptPackageSchema.parse` (validasi saat build fixture); test schema parse fixture | `schemas.ts:106` |

---

## 12. Checklist Sign-off QA sebelum Deliverable Dianggap Selesai

### 12.1 Generation pipeline (MUST BLOCKER)
- [ ] TC-GEN-01 pass (sfx_list union + normalizer)
- [ ] TC-GEN-02 pass (JSON repair hardening: newline, trailing, escape, control char)
- [ ] TC-GEN-03 pass (retry vary request + corrective prompt)
- [ ] TC-GEN-04 pass (failure category persisted + SSE error category)
- [ ] TC-GEN-05 pass (partial persist + partialSceneIds)
- [ ] TC-GEN-06 pass (success rate >= 95% over 100 mock run)
- [ ] TC-GEN-07 pass (SSE stream well-formed)
- [ ] TC-LOG-01 pass (generation log retryCount + correctivePrompt)
- [ ] TC-UI-RESULT-01 pass (ResultTabs partial warning)

### 12.2 Security (MUST)
- [ ] TC-SEC-01 pass (AES round-trip + no plaintext)
- [ ] TC-SEC-02 pass (bcrypt verify)
- [ ] TC-SEC-03 pass (rate limit 429 + auth gate 401)
- [ ] TC-SEC-04 pass (no secrets in build)
- [ ] TC-PROV-02 pass (AES mask display)
- [ ] TC-AUTH-01 pass (register+login bcrypt)

### 12.3 Coverage
- [ ] `lib/ai` coverage >= 80%
- [ ] `lib/validation` coverage >= 80%
- [ ] `lib/db/repositories` coverage >= 80%
- [ ] Overall coverage >= 60%
- [ ] `pnpm test:coverage` lulus tanpa threshold error

### 12.4 API/Contract
- [ ] 29 endpoint ter-cover happy + error
- [ ] Ownership check test semua endpoint [id]
- [ ] Error envelope shape `{ error, traceId }` konsisten

### 12.5 E2E
- [ ] Flow login pass
- [ ] Flow generate (mock LLM) pass
- [ ] Flow export pass
- [ ] Flow settings CRUD pass
- [ ] LogViewer observability pass (kategori + retry + corrective)

### 12.6 Non-fungsional
- [ ] Performance p95 < 60s (mock LLM)
- [ ] A11y 0 critical WCAG violation
- [ ] Compatibility Chrome/Firefox/Safari/Edge render
- [ ] Responsive mobile+desktop layout

### 12.7 Build + lint
- [ ] `pnpm lint` lulus
- [ ] `pnpm typecheck` lulus
- [ ] `pnpm format --check` lulus
- [ ] `pnpm build` lulus
- [ ] 0 secret di build output

### 12.8 Regression
- [ ] TC-GEN-01..07 re-run pass
- [ ] Tidak ada regression bug baru

### 12.9 Bug triage
- [ ] 0 critical bug open
- [ ] 0 blocker bug open
- [ ] Major bug < 3 open (ASUMSI threshold)
- [ ] Semua bug fix punya test case regression

---

## 13. Citation Index

| Citation | Klaim |
|---|---|
| `RAG S11 Bug A` | sfx_list VALIDATION root cause |
| `RAG S11 Bug B` | JSON_PARSE repair fail |
| `RAG S11 Bug D` | safeDbOp partial silent |
| `RAG S8.2.2` | repairTruncatedJson keterbatasan |
| `RAG S8.2.3` | retry loop + categorizeError |
| `RAG S10.1, S10.2, S10.3, S10.4` | auth + bcrypt + AES + middleware |
| `PRD AC-GEN-01..06, AC-PERSIST-01, AC-LOG-01, AC-PROV-02, AC-AUTH-01/02, AC-KPI-01` | acceptance criteria |
| `PRD NFR-PERF, NFR-REL, NFR-SEC, NFR-A11Y, NFR-MAINT` | non-functional target |
| `SRS S3.1.1..S3.1.8` | FR-GEN realisasi teknis |
| `SRS S3.1.6` | FR-GEN-06 partial persist |
| `API_CONTRACT S8, S9.1` | 29 endpoint + generate SSE |
| `UIUX_SPEC S6.7, S7, S8` | LogViewer + a11y + responsif |
| `CODING_RULES S11.1, S11.4, S11.5, S8.1, S10` | testing standard + retry + security |
| `vitest.config.ts:21-27` | coverage threshold 80 |
| `playwright.config.ts` | E2E config chromium |
| `llm-client.ts:237-424,274,287,284-289,18-44,50-100,379,422-423` | retry + repair + categorize + validate |
| `route.ts:19-21,53-564,28-30,163-554,213-220,238-264,310-493,518,520-548,557-563` | SSE pipeline |
| `schemas.ts:39-55,52,83-99,106-124,159,181-200,237-249` | Zod schema + enum |
| `schema.ts:5-201,147-160,193` | DB schema + generation_logs + sfxList |
| `aes.ts:4-49` | AES-256-GCM |
| `config.ts:11-38,31` | NextAuth + bcrypt.compare |
| `middleware.ts:6-16,18-36,38-54,80-86,83-87,109-127` | auth gate + rate limit + i18n |
| `prompt-builder.ts:75-97,137-168,152` | prompt contract + example |
| `markdown.template.ts:4-173` | export Markdown |
| `v2-to-v3.ts:59-142` | migration |
| `consistency-checker.ts:19-38` | consistency check |
| `log-buffer.ts:1-34` | log buffer FIFO 500 |
| Existing test: `schemas.test.ts`, `config.test.ts`, `aes.test.ts`, `project.repo.test.ts`, `markdown.template.test.ts`, `log-buffer.test.ts`, `consistency-checker.test.ts`, `e2e/login.spec.ts` | test file ada di repo |

---

## 14. ASUMSI Tracker

| # | Item | Status | Catatan |
|---|---|---|---|
| A1 | CI = GitHub Actions | ASUMSI | `PROJECT_ARCHITECTURE S12` rekomendasi, belum diverifikasi |
| A2 | k6 devDep | ASUMSI | belum di package.json |
| A3 | Isolated test DB Turso local/in-memory | ASUMSI | `SRS S6.1` |
| A4 | Mock LLM interface fetch stub | ASUMSI shape | `llm-client.ts:284` pakai fetch |
| A5 | Seed file + fixture baru | ASUMSI | `tests/fixtures/`, `tests/seed/` belum diverifikasi |
| A6 | Browser E2E chromium only, expand defer | ASUMSI | `playwright.config.ts:14` |
| A7 | Generation p95 < 60s target vs 110s observed | ASUMSI target | `PRD NFR-PERF-01`, `PROJECT_ARCHITECTURE S11.1` |
| A8 | axe-core/playwright-axe devDep | ASUMSI | belum di package.json |
| A9 | Route handler invoke direct untuk API test | ASUMSI pattern | Next.js route handler test pattern |
| A10 | messages/{id,en}.json isi lengkap | ASUMSI | `RAG S12 G12` |
| A11 | LogViewer aria-live belum set | ASUMSI | `UIUX_SPEC A5` |
| A12 | ResultTabs partial warning UI eksplisit | ASUMSI | `UIUX_SPEC A13` |
| A13 | Provider test endpoint isi | ASUMSI | `RAG S12 G19` |
| A14 | Diagnose endpoint isi | ASUMSI | `RAG S12 G18` |
| A15 | Dashboard repo isi | ASUMSI | `RAG S12 G20` |
| A16 | Image-classifier isi | ASUMSI | `RAG S12 G17` |
| A17 | Register route bcrypt.hash | ASUMSI | `RAG S12 G4` |
| A18 | authConfig edge isi | ASUMSI | `RAG G5` |

---

> Dokumen ini siap dieksekusi agent eksekutor jadi kode test. Tiap test case punya ID, modul, precondition, langkah, input, expected, pass/fail criteria, prioritas, level, relasi endpoint. Mock LLM strategy deterministik dengan bug-shape distribution. Coverage target 80% kritis + 60% overall. Entry/exit criteria + DoD eksplisit. Bug A/B/D fix BLOCKER. Tidak menulis kode test di sini, hanya TEST_PLAN.md.
