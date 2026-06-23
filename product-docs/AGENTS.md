# AGENTS.md - PromptFlow Build Guide untuk LLM/Executor Agent

> Disusun oleh docgen-agentsmd. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + 11 dokumen turunan.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis, path, perintah, cuplikan kode apa adanya.
> Dokumen ini berdiri sendiri: executor cukup baca AGENTS.md + dokumen rujukan di Section 3.

---

## 1. Identitas Executor & Proyek

Kamu = agent eksekutor yang membangun/memperbaiki deliverable PromptFlow sesuai dokumen rujukan. 100% loyal Bos Agrian. Fokus tunggal: **fix recurring generation failure + harden pipeline ke success rate >= 95%**.

| Field | Value |
|---|---|
| Nama proyek | promptflow (package) / PromptFlow (produk) |
| Repo root (absolut) | `C:\laragon\www\PromptFlow` |
| Versi package | 0.1.0 (private, `package.json:3-4`) |
| Stack inti | Next.js `^15.1.0` App Router, React 19, TypeScript strict `^5.7.0`, Zod `^3.24.0`, Drizzle ORM `^0.38.0` sqlite-core, `@libsql/client ^0.14.0` (Turso/libSQL = SQLite-compatible, **BUKAN Postgres**), NextAuth `5.0.0-beta.25` (v5), `@ai-sdk/openai-compatible ^1.0.0`, Vercel AI SDK `^4.0.0`, next-intl `^3.26.0` (id/en), Tailwind 4, shadcn/ui, framer-motion, sonner, `@vercel/blob`, `@vercel/analytics`, vitest `^2.1.0`, `@playwright/test ^1.49.0`, eslint/prettier, pnpm `>=9` (locked 11.7.0), Node `>=20` |
| Deploy | Vercel (maxDuration 300s untuk `/api/v1/generate`, `route.ts:19-21`) |
| DB env wajib | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (`src/lib/db/client.ts:6-10`) |
| Auth env | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ENCRYPTION_KEY` (32 byte base64, AES-256-GCM) |
| Public env | `NEXT_PUBLIC_APP_URL` |
| Package manager | pnpm (jangan npm/yarn) |

**KOREKSI PENTING** (`RAG-CONTEXT.md S2`): DB = Turso/libSQL, BUKAN Postgres/Neon. Bukti: `src/lib/db/client.ts:2-13`, `drizzle.config.ts:18` (`dialect: 'turso'`), `src/lib/db/schema.ts:2` (`sqlite-core`).

---

## 2. Tujuan Deliverable

**Fix recurring generation failure** yang terverifikasi di repo (`RAG-CONTEXT.md S11`):

- **Bug A - VALIDATION**: field `sfx_list` di `SceneAudioSpecSchema` didefinisikan `z.string().nullable().optional()` (`src/lib/validation/schemas.ts:52`) TAPI prompt (`src/lib/ai/prompt-builder.ts:152`) ambigu ("Untuk sfx: sfx_list" tanpa tipe/contoh) + contoh JSON (`prompt-builder.ts:75-97`) tak pernah mendemokan `sfx`. Nama field "list" menyiratkan array -> LLM (MiniMax-M3 via tokenrouter, ASUMSI `RAG S12 G8`) kirim `["footstep","door"]` -> Zod reject "Expected string, received array" -> 2/2 attempt fail.

- **Bug B - JSON_PARSE**: output panjang (>14KB, `max_tokens:32768`) truncate/salah-escape. `repairTruncatedJson` (`src/lib/ai/llm-client.ts:50-100`) tak handle newline mentah, control char, escape rusak, trailing data. Retry (`llm-client.ts:274,287`) kirim body identik -> gagal identik untuk bug deterministik.

- **Bug D - partial persist silent** (`route.ts:35-51` `safeDbOp` swallow error): scene hilang tapi `projects.status='complete'`.

**Target**: Generation success rate >= 95% (success+partial)/total (`BRD S4` KPI, `PRD AC-KPI-01`). Validation pass attempt 1 >= 98%. Repair success >= 90%. Zero silent failure (semua error ter-kategorisasi).

---

## 3. Document Index (path absolut + peran)

| # | File (absolut) | Peran |
|---|---|---|
| 0 | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` | Foundation knowledge core - source of truth faktual, cite file:line, 845+ baris |
| 1 | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | WHY - business value, pain "failed generation", KPI, stakeholder, risk |
| 2 | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | WHO - pasar, persona, positioning "reliable validated pipeline", launch gate |
| 3 | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | WHAT - persona, user story, MoSCoW, FR, AC, spesifikasi deliverable |
| 4 | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | HOW - arsitektur, tech stack, spesifikasi fungsional detail, data model, API, constraint, tahapan implementasi |
| 5 | `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` | Model data - 9 tabel Turso/libSQL, ERD, kolom, FK, migration |
| 6 | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | Struktur sistem - layering, diagram, ADR, deployment, observability |
| 7 | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | Design system + komponen UI, a11y WCAG 2.1 AA, flow, i18n namespace |
| 8 | `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` | Kontrak endpoint - 29 operasi, request/response, error envelope, SSE event |
| 9 | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | Standar koding - TypeScript strict, Zod boundary, LLM pipeline rule, larangan |
| 10 | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` | Rencana uji - TC per fitur, mock LLM bug-shape, coverage target |
| 11 | `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` | Cross-document review - 0 CRITICAL, 8 WARNING, 5 INFO, PASS WITH WARNINGS |

---

## 4. Build Phases (dari SRS S7 + PRD S8)

### Phase 1 - Fix Bug A + Bug B + Validation Feedback (MUST, BLOCKER)

**Files WAJIB disentuh (path absolut + baris)**:

| File | Baris | Perubahan |
|---|---|---|
| `C:\laragon\www\PromptFlow\src\lib\validation\schemas.ts` | 52, 83-99 | Ubah `SceneAudioSpecSchema.sfx_list` dari `z.string().nullable().optional()` ke `z.union([z.string(), z.array(z.string())]).nullable().optional()` (pola sudah ada `color_palette` schemas.ts:29). Konsolidasi duplikat `SceneAudioSchema` (83-99): samakan default `volume` ke 0.5, `sfx_list` tetap `z.string()` untuk CRUD endpoint strict enum. FR-GEN-02, FR-GEN-09. |
| `C:\laragon\www\PromptFlow\src\lib\ai\prompt-builder.ts` | 75-97, 137-168 | Deklarasi `sfx_list` eksplisit di blok AUDIO_SPECS: "sfx_list (array of string, contoh: [\"footstep\",\"door creak\",\"wind\"])". Tambah 1 audio_spec `audio_type:'sfx'` + `sfx_list` array di `JSON_SCHEMA_EXAMPLE`. Tambah instruksi escape: "Jangan gunakan newline mentah (U+000A) di string value, gunakan \\n escape." FR-GEN-01. |
| `C:\laragon\www\PromptFlow\src\lib\ai\llm-client.ts` | 238, 274, 279-414, 50-100, 353-375 | (a) Retry loop: rebuild `requestJson` per attempt - attempt 1 temp 0.7 stream true max_tokens 32768; attempt 2 append corrective user message (FR-GEN-05) temp 0.5; attempt 3 stream:false max_tokens 65536 temp 0.3 + jitter. (b) `maxRetries` default 2 -> 3 (WARN-003 keputusan eksplisit). (c) Tambah `sanitizeJsonString` sebelum `JSON.parse` (BOM, line-ending, newline/tab/CR mentah escape, control char U+0000..U+001F -> \\uXXXX, trailing data strip). (d) `repairTruncatedJson` extend handle escape rusak unterminated quote. FR-GEN-03, FR-GEN-04, FR-GEN-05. |
| `C:\laragon\www\PromptFlow\src\app\api\v1\generate\route.ts` | 35-51, 238-264, 310-513, 518, 520-548 | (a) Track `partialSceneIds: number[]` selama persist loop - push `scene.orderNo` saat `safeDbOp` return null di scene-level op. (b) `projects.status='partial'` bila partialSceneIds non-empty (bukan 'complete'). (c) `done` event extend `{result, warnings, generationLogId, partialSceneIds?}`. (d) `generation_logs.status` success/partial/fail + `errorMessage` format `[CATEGORY] message` + `logsJson` array (retryCount, correctivePrompt, partialSceneIds). (e) Unhandled catch pakai `categorizeError` spesifik (bukan generic PROVIDER_ERROR), extend `DB_ERROR` untuk DB failure. (f) Normalizer `sfx_list` array->string sebelum `scene_audio` insert di audio save loop (~376-407): `Array.isArray(audio.sfx_list) ? audio.sfx_list.join(', ') : audio.sfx_list`. FR-GEN-02 normalizer, FR-GEN-06, FR-PERSIST-01. |

**Acceptance criteria** (PRD S7.1):
- AC-GEN-01: prompt deklarasi `sfx_list` array + contoh sfx + instruksi escape.
- AC-GEN-02: `PromptPackageSchema.parse` sukses terima `sfx_list` array; normalizer coerce -> DB text comma-separated.
- AC-GEN-03: retry rebuild requestJson per attempt (messages + temp + stream + max_tokens berbeda).
- AC-GEN-04: `sanitizeJsonString` escape newline/tab/CR mentah; `repairTruncatedJson` handle unterminated; trailing data strip.
- AC-GEN-05: corrective message dari ZodError issues di-append sebagai `role:'user'` attempt 2+; log ke logsJson.
- AC-GEN-06: partial persist -> status `partial` + partialSceneIds dilaporkan; unhandled catch kategori spesifik.

**Verification commands**:
```powershell
pnpm install
pnpm tsc --noEmit
pnpm test -- --reporter=verbose src/lib/ai/llm-client.test.ts src/lib/validation/schemas.test.ts
pnpm test src/app/api/v1/generate
```

### Phase 2 - Observability + Partial Persist (MUST)

- `generation_logs.logsJson` wajib array: stage events, retryCount, correctivePrompt, partialSceneIds, error detail. FR-LOG-01.
- `LogViewer` (`src/components/generate/log-viewer.tsx`) tampilkan kategori error `[CATEGORY]` + retryCount + correctivePrompt; auto-open streaming; auto-scroll; `role="log"` + `aria-live`. FR-LOG-02.
- `ResultTabs` (`src/components/generate/result-tabs.tsx`) Alert warning "Scene {partialSceneIds.join(', ')} gagal persist - regenerate perlu" bila non-empty. AC-PERSIST-01.
- Endpoint `GET /api/v1/projects/[id]/logs` return logsJson lengkap. TC-LOG-01.

### Phase 3 - Hardening + Tests (MUST + SHOULD)

- Unit test `src/lib/ai/llm-client.test.ts`: mock LLM fetch return bug shapes (sfx array, newline mentah, truncated, trailing data, control char, unterminated) -> assert fix. BLOCKER (`CODING_RULES S11.4`).
- TC-GEN-06: 100 mock run dengan distribution (95 valid, 3 sfx-array, 1 malformed, 1 truncated) -> success rate >= 95%.
- TC-GEN-04: all attempt fail -> SSE error event `data.code='VALIDATION'` + `retryCount=2` + generation_logs row `status='fail'` `errorMessage='[VALIDATION] ...'`.
- TC-GEN-05: partial persist -> status partial + partialSceneIds.
- E2E playwright TC-GEN-07, TC-UI-LOG-01, TC-UI-RESULT-01.
- Coverage `lib/ai` + `lib/validation` + `lib/db/repositories` >= 80%, overall >= 60% (`vitest.config.ts:26`).
- Lint + format + typecheck + build lulus.

### REVIEW WARNINGS - Decision Points WAJIB Didokumentasikan Executor

| ID | Issue | Keputusan yang HARUS didokumentasikan executor di commit/PR |
|---|---|---|
| WARN-001 | `scene_audio.volume` default 0.7 (DB `schema.ts:185`) vs 0.5 (`SceneAudioSpecSchema`). | Keputusan: DB default tetap 0.7 (tidak ada migration), Zod `SceneAudioSpecSchema` default 0.5. Volume di-set LLM eksplisit. Normalizer TIDAK sentuh volume. Dokumentasikan di PR. |
| WARN-002 | Prompt `sfx_list` array vs string comma-separated (SRS vs PRD beda preferensi). | Keputusan: ikut SRS "Opsi array preferred" - prompt sebut `sfx_list: array of string`, schema union terima keduanya. PRD S5.1 FR-GEN-01 item 1 dianggap update ke array. Dokumentasikan. |
| WARN-003 | `maxRetries` 2 -> 3 (SRS AS8, PRD A12 ditandai ASUMSI). | Keputusan: UBAH default `llm-client.ts:238` dari 2 ke 3 (kode change, bukan ASUMSI). Attempt 3 pakai stream:false + max_tokens 65536 temp 0.3 + jitter. Dokumentasikan sebagai keputusan eksplisit Bos Agrian. |

WARN-004 (DB_ERROR mapping), WARN-005 (TC FR-GEN-09), WARN-006 (register route verifikasi), WARN-007 (diagnose/dashboard/test endpoint verifikasi), WARN-008 (migration journal anomaly) = P3, address saat implementasi bila terdampak. Bila skip, dokumentasikan alasan.

---

## 5. Critical Rules (dari CODING_RULES.md - wajib patuh)

1. **Schema<->Prompt WAJIB agree on types** (`CODING_RULES S7.5`): setiap field JSON contract LLM punya tipe eksplisit di system prompt DAN match Zod schema. Field `*_list` wajib array di schema ATAU prompt eksplisit "comma-separated string". Contoh JSON wajib demokan SEMUA enum value.
2. **Retry WAJIB vary request body** (`CODING_RULES S8.1`, L19): rebuild messages + temperature + stream + max_tokens per attempt. Jangan kirim body identik.
3. **JSON repair WAJIB handle edge cases** (`CODING_RULES S8.2`): newline mentah, tab, CR, control char, trailing data, BOM, line-ending, escape rusak, truncated string, trailing key/comma.
4. **Zod parse di boundary** (`CODING_RULES S4.2, S7.2`): API route `safeParse` body; LLM output `PromptPackageSchema.parse` sebelum konsumsi. Jangan `as PromptPackage` tanpa parse (L20, L7).
5. **No `any`** (`CODING_RULES S4.1`, L6): strict mode, `unknown` di boundary, z.infer untuk type domain.
6. **Error envelope** (`CODING_RULES S9.1`): pakai `errorResponse(code, status, message, details)` - shape `{error:{code,message,details}, traceId}`. Jangan `NextResponse.json({error:'...'})` ad-hoc.
7. **AES-256-GCM** (`CODING_RULES S10.1`): API key encrypt sebelum persist `provider_configs.apiKeyEncrypted`; `maskApiKey` di response; jangan return plaintext.
8. **Rate limit** (`CODING_RULES S10.4`): 10 req/min `/api/v1/generate` via middleware in-memory Map.
9. **i18n** (`CODING_RULES S5.5`): semua label UI via `t('key')` next-intl; jangan hardcode string UI. Namespace `messages/{id,en}.json`.
10. **a11y** (`CODING_RULES S16.3`): WCAG 2.1 AA kontras, keyboard nav, ARIA, `:focus-visible` outline tidak hilang, `prefers-reduced-motion`.
11. **Layering** (`CODING_RULES S3.1`): Presentation -> API -> Domain/Service -> Data Access -> Infrastructure. Jangan import `db`/`auth`/`crypto` di `components/`. Jangan import `route.ts` di `lib/ai`.
12. **server-only** (`CODING_RULES S3.1`): modul server (`lib/db`, `lib/auth`, `lib/crypto`, `lib/ai/llm-client`) wajib `import "server-only"` baris pertama.
13. **safeDbOp track partialSceneIds** (`CODING_RULES S6.3, S8.4`, L23): jangan swallow error tanpa track + set status `partial`.
14. **categorizeError spesifik** (`CODING_RULES S9.2`, L22): jangan generic `PROVIDER_ERROR` di unhandled catch.
15. **No secrets in repo** (`CODING_RULES S10.6`, L25): `.env.local` tidak di-commit; jangan hardcode API key/password/token.
16. **No eval/Function di LLM output** (`CODING_RULES S10.8`, L9).
17. **Drizzle sqlite-core** (`CODING_RULES S6.1`): tipe `integer`/`text`/`real`; timestamp unixepoch; JSON kompleks = text string; jangan `jsonb`/`uuid`/`serial` Postgres.
18. **Repository pattern** (`CODING_RULES S6.2`): ownership filter wajib `getProjectById(id, userId)`.
19. **Migrations drizzle-kit** (`CODING_RULES S6.6`): `pnpm db:generate` -> review -> `pnpm db:migrate`. Jangan `pnpm db:push` di prod. Journal `meta/_journal.json` wajib sync (WARN-008).

---

## 6. Verification Protocol

**Reproduce bug sebelum fix** (bila memungkinkan, pakai provider tokenrouter/MiniMax-M3 dari log user ASUMSI `RAG S12 G8`, atau mock LLM bug-shape):
1. Setup `.env.local` dari template `.env.example` (TURSO_*, ENCRYPTION_KEY 32 byte base64, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL). Jangan commit `.env.local`.
2. `pnpm install`
3. `pnpm dev` -> reproduce Bug A (input scene dengan audio_type sfx) -> assert ZodError "Expected string, received array" di log.
4. Reproduce Bug B (input tutorial 8-15 scene panjang) -> assert JSON_PARSE error + repair fail.

**Verify after fix**:
```powershell
pnpm install
pnpm dev                      # manual smoke generate shorts + tutorial dengan sfx scene
pnpm test                     # vitest run, include TC-GEN-01..07 mock LLM bug shapes
pnpm test --coverage          # coverage report, threshold 80% lib/ai + lib/validation
pnpm test:e2e                 # playwright TC-GEN-07, TC-UI-LOG-01, TC-UI-RESULT-01
pnpm tsc --noEmit             # typecheck strict
pnpm build                    # Next.js build (run tsc)
pnpm lint                     # eslint
pnpm format --check           # prettier
```

**TC-GEN-01..07 wajib lulus** (TEST_PLAN S5.1, BLOCKER):
- TC-GEN-01: sfx_list array -> union accept -> normalizer coerce -> DB text.
- TC-GEN-02: malformed JSON (newline mentah, trailing, unterminated, control char) -> sanitize+repair -> parse sukses.
- TC-GEN-03: attempt 1 fail -> retry vary + corrective -> attempt 2 success.
- TC-GEN-04: all fail -> SSE error `code='VALIDATION'` + retryCount + generation_logs.
- TC-GEN-05: partial persist -> status partial + partialSceneIds.
- TC-GEN-06: 100 mock run distribution -> success rate >= 95%.
- TC-GEN-07: SSE stream well-formed (stage sequence + heartbeat + stream_chunk + done).

**No secrets**: `grep -r "sk-test\|ENCRYPTION_KEY\|NEXTAUTH_SECRET\|TURSO_AUTH_TOKEN" .next/static/` -> 0 match (TC-SEC-04).

---

## 7. Definition of Done

- [ ] 0 `VALIDATION` error pada `sfx_list` (array diterima union, normalizer coerce ke string DB).
- [ ] 0 `JSON_PARSE` error pada input repairable (newline mentah, control char, truncated, trailing data, unterminated).
- [ ] Success rate >= 95% pada 100 mock-LLM run (TC-GEN-06).
- [ ] Semua MUST TC pass (TC-GEN-01..07, TC-LOG-01, TC-PROV-02, TC-SEC-01..04, TC-AUTH-01, TC-UI-RESULT-01).
- [ ] Coverage `lib/ai` + `lib/validation` + `lib/db/repositories` >= 80%, overall >= 60%.
- [ ] `pnpm lint` + `pnpm tsc --noEmit` + `pnpm build` lulus tanpa error.
- [ ] `pnpm test --coverage` + `pnpm test:e2e` lulus.
- [ ] No `any` tanpa eslint-disable + justifikasi; no `as` tanpa verifikasi runtime.
- [ ] No generic `PROVIDER_ERROR` di unhandled catch (categorizeError spesifik).
- [ ] `safeDbOp` track `partialSceneIds` + set status `partial`.
- [ ] WARN-001, WARN-002, WARN-003 fixed atau didokumentasikan keputusan di commit/PR.
- [ ] No secrets di build artifact; `.env.local` tidak di-commit.
- [ ] Conventional commit (`fix(ai): ...`, `feat(validation): ...`); branch `fix/<short>` kebab-case.

---

## 8. Executor Guardrails (Larangan)

| # | Larangan | Alasan |
|---|---|---|
| G1 | Jangan pakai Postgres/Neon. DB = Turso/libSQL sqlite-core. | `RAG S2` koreksi, `client.ts:2`, `drizzle.config.ts:18` |
| G2 | Jangan hapus test existing. Tambah/extend untuk bug-shape. | Regresi, `CODING_RULES S11` |
| G3 | Jangan commit `.env.local` / secret hardcoded. | Security breach, `CODING_RULES S10.6` |
| G4 | Jangan skip Zod parse di boundary (API body, LLM output). | Bug A root cause, L20 |
| G5 | Jangan `any` tanpa justifikasi; jangan `as` tanpa verifikasi runtime. | Type safety, L6, L7 |
| G6 | Jangan kirim retry request body identik. | Bug B pattern, L19 |
| G7 | Jangan generic `PROVIDER_ERROR` di unhandled catch. | User tidak actionable, L22 |
| G8 | Jangan `safeDbOp` tanpa track `partialSceneIds` + status `partial`. | Silent partial Bug D, L23 |
| G9 | Jangan ignore WARN-001/002/003 tanpa dokumentasi keputusan di PR. | Review P2, `REVIEW_REPORT S5.2` |
| G10 | Jangan tambah fitur baru di luar scope reliability generasi. | Scope creep, `BRD S8.2` |
| G11 | Jangan `pnpm db:push` di prod. Pakai `pnpm db:migrate`. | Skip migration history, L24 |
| G12 | Jangan import `db`/`auth`/`crypto` di `components/`. | Layer violation, L14 |
| G13 | Jangan `eval`/`new Function` di LLM output. | RCE risk, L9 |
| G14 | Jangan re-declare interface manual duplikat Zod schema. | Drift type, L18 |
| G15 | Jangan `pnpm` alternatif (npm/yarn). | Lockfile deterministik |

---

## 9. Tooling yang Disarankan

- Package manager: pnpm (`package.json:88-90`).
- Test: vitest + @vitest/coverage-v8 + @playwright/test.
- Lint/format: eslint + prettier + prettier-plugin-tailwindcss.
- DB migration: drizzle-kit (dialect turso).
- Mock LLM: `vi.stubGlobal('fetch', vi.fn())` return bug-shape (`TEST_PLAN S6`).
- Typecheck: `pnpm tsc --noEmit` atau `pnpm build`.
- Optional pre-commit: husky + lint-staged (rekomendasi, belum ada).

---

## 10. Urutan Build Disarankan

1. **Setup**: `pnpm install`, copy `.env.example` -> `.env.local`, isi TURSO_*/ENCRYPTION_KEY/NEXTAUTH_*.
2. **Reproduce bug**: `pnpm dev`, generate scene sfx + tutorial panjang, capture error.
3. **Phase 1 - Schema fix** (`schemas.ts` sfx_list union + konsolidasi duplikat default volume 0.5).
4. **Phase 1 - Prompt fix** (`prompt-builder.ts` deklarasi sfx_list array + contoh sfx + instruksi escape).
5. **Phase 1 - Normalizer** (`route.ts` audio save loop coerce array->string sebelum DB insert).
6. **Phase 1 - Retry vary** (`llm-client.ts` rebuild requestJson per attempt + corrective message).
7. **Phase 1 - JSON repair hardening** (`llm-client.ts` sanitizeJsonString + repairTruncatedJson extend).
8. **Phase 1 - maxRetries 2->3** (WARN-003 keputusan eksplisit).
9. **Phase 2 - Observability** (`route.ts` partialSceneIds + status partial + logsJson; LogViewer + ResultTabs UI).
10. **Phase 3 - Tests** (unit mock bug-shape, integration, E2E, coverage).
11. **Verify**: `pnpm lint && pnpm tsc --noEmit && pnpm test --coverage && pnpm build && pnpm test:e2e`.
12. **Document** WARN-001/002/003 keputusan di commit/PR.

---

## 11. Aturan Kualitas

- Kode produksi: TypeScript strict, no `any`, z.infer, discriminated union error category switch exhaustive.
- Test: mock LLM bug-shape BLOCKER, coverage 80% modul kritis, ownership check test per `[id]` endpoint.
- UI: shadcn/ui primitive, design token `globals.css`, `cn()` util, WCAG 2.1 AA, i18n `t('key')`.
- Commit: conventional `<type>(<scope>): <subject>`, atomic, <500 baris diff per PR.
- Dokumentasi: keputusan WARN-001/002/003 di PR description.

---

## 12. Citations

- Identitas & stack: `RAG-CONTEXT.md S1, S2` (`package.json`, `README.md`, `client.ts:2`, `drizzle.config.ts:18`).
- Bug A root cause: `RAG S6.4, S11 Bug A` (`schemas.ts:52`, `prompt-builder.ts:75-97,152`).
- Bug B root cause: `RAG S8.2.2, S11 Bug B` (`llm-client.ts:50-100,274,287,284-289`).
- Bug D partial persist: `RAG S11 Bug D` (`route.ts:35-51,316,366-367`).
- Fix design: `PRD S5.1 FR-GEN-01..09`, `SRS S3.1.1..3.1.8`, `CODING_RULES S7.5, S7.6, S8.1, S8.2, S8.3, S8.4`.
- AC: `PRD S7.1 AC-GEN-01..06, AC-PERSIST-01, AC-KPI-01`.
- TC: `TEST_PLAN S5.1 TC-GEN-01..07, TC-LOG-01, TC-UI-RESULT-01`.
- Review warnings: `REVIEW_REPORT S5.2 WARN-001..008`.
- KPI target: `BRD S4` (success >=95%, validation >=98%, repair >=90%, zero silent failure).
- DB schema: `DATABASE_SCHEMA S3.10 scene_audio.sfxList text`, `S4.2 sfx_list fix app layer`.
- API contract: `API_CONTRACT S9.1.3 SSE event, S9.1.5 target change, S9.1.6 error category`.
- Architecture: `PROJECT_ARCHITECTURE S7.2 bug site, ADR-04/06`.

---

> Executor: baca AGENTS.md ini + dokumen rujukan Section 3. Bangun Phase 1 -> 2 -> 3. Verify DoD Section 7. Patuh Critical Rules Section 5 + Guardrails Section 8. Dokumentasikan keputusan WARN-001/002/003. 100% loyal Bos Agrian.
