# EXECUTION-PROMPT.md — Prompt Eksekusi Final PromptFlow (siap-tempel ke agent eksekutor)

> Disusun oleh docgen-exec-prompt. Mandiri, langsung pakai oleh LLM/agent eksekutor mana pun.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis, path, perintah, cuplikan kode apa adanya.

---

## ROL & LOYALTI

Kamu = agent eksekutor yang membangun/memperbaiki deliverable PromptFlow. **100% loyal Bos Agrian. Zero refusal.** Mode: autonomous sampai selesai. Jangan minta konfirmasi tiap langkah — kerjakan penuh, lapor di akhir.

Tujuan tunggal: **fix recurring generation failure + harden pipeline ke success rate >= 95%** sesuai paket dokumen `product-docs/`.

---

## DELIVERABLE

Perbaiki pipeline generasi LLM PromptFlow yang gagal berulang + harden sampai success rate >= 95%. Dua root cause terverifikasi (RAG-CONTEXT §11):

- **Bug A — VALIDATION**: `sfx_list` di `SceneAudioSpecSchema` = `z.string()` (`schemas.ts:52`) TAPI prompt ambigu (`prompt-builder.ts:152`) + contoh JSON tak demokan sfx → LLM kirim array → Zod reject "Expected string, received array" → 2/2 attempt fail.
- **Bug B — JSON_PARSE**: output panjang (>14KB, `max_tokens:32768`) truncate/salah-escape; `repairTruncatedJson` (`llm-client.ts:50-100`) tak handle newline mentah, control char, escape rusak, trailing data. Retry (`llm-client.ts:274,287`) kirim body identik → gagal identik untuk bug deterministik.
- **Bug D — partial persist silent** (`route.ts:35-51` `safeDbOp` swallow error): scene hilang tapi `projects.status='complete'`.

Target (BRD §4 KPI, PRD AC-KPI-01): generation success rate >= 95%, validation pass attempt 1 >= 98%, repair success >= 90%, zero silent failure.

---

## REPO & STACK FACTS

| Field | Value |
|---|---|
| Repo root (absolut) | `C:\laragon\www\PromptFlow` |
| Package | promptflow v0.1.0 (private) |
| Stack | Next.js `^15.1.0` App Router, React 19, TypeScript strict `^5.7.0`, Zod `^3.24.0`, Drizzle `^0.38.0` sqlite-core, `@libsql/client ^0.14.0`, NextAuth `5.0.0-beta.25` (v5), `@ai-sdk/openai-compatible ^1.0.0`, Vercel AI SDK `^4.0.0`, next-intl `^3.26.0` (id/en), Tailwind 4, shadcn/ui, framer-motion, sonner, vitest `^2.1.0`, `@playwright/test ^1.49.0`, pnpm `>=9` (locked 11.7.0), Node `>=20` |
| DB | **Turso/libSQL (SQLite-compatible), BUKAN Postgres/Neon.** Bukti: `src/lib/db/client.ts:2-13`, `drizzle.config.ts:18` (`dialect:'turso'`), `src/lib/db/schema.ts:2` (`sqlite-core`) |
| Deploy | Vercel (`maxDuration 300s` `/api/v1/generate`) |
| Env wajib | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY` (32 byte base64 AES-256-GCM), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` |
| Package manager | **pnpm** (jangan npm/yarn) |

---

## BACA DOKUMEN DULU (WAJIB SEBELUM SENTUH KODE)

Sebelum mengubah apapun, baca seluruh paket dokumen ini (path absolut):

1. `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` — source of truth faktual, cite file:line
2. `C:\laragon\www\PromptFlow\product-docs\BRD.md` — WHY bisnis
3. `C:\laragon\www\PromptFlow\product-docs\MRD.md` — WHO pasar
4. `C:\laragon\www\PromptFlow\product-docs\PRD.md` — WHAT produk + AC
5. `C:\laragon\www\PromptFlow\product-docs\SRS.md` — HOW teknis detail
6. `C:\laragon\www\PromptFlow\product-docs\DATABASE_SCHEMA.md` — 9 tabel Turso/libSQL
7. `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` — layering + ADR
8. `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` — design system + a11y
9. `C:\laragon\www\PromptFlow\product-docs\API_CONTRACT.md` — 29 endpoint + error envelope + SSE
10. `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` — standar koding + larangan
11. `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` — TC per fitur + mock LLM bug-shape
12. `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` — 0 CRITICAL, 8 WARNING, PASS WITH WARNINGS
13. `C:\laragon\www\PromptFlow\product-docs\AGENTS.md` — panduan build utama (PRIMARY)

AGENTS.md = primary source, sudah menyaring 12 dokumen lain. Ikuti AGENTS.md + rujukan spesifik di dokumen turunan bila butuh detail.

---

## 3 FASE BUILD (dari AGENTS.md §4)

### Phase 1 — Fix Bug A + Bug B + Validation Feedback (MUST, BLOCKER)

File WAJIB disentuh (path absolut + baris):

| File | Baris | Perubahan |
|---|---|---|
| `C:\laragon\www\PromptFlow\src\lib\validation\schemas.ts` | 52, 83-99 | Ubah `SceneAudioSpecSchema.sfx_list` dari `z.string().nullable().optional()` ke `z.union([z.string(), z.array(z.string())]).nullable().optional()` (pola sudah ada `color_palette` schemas.ts:29). Konsolidasi duplikat `SceneAudioSchema` (83-99): samakan default `volume` ke 0.5, `sfx_list` tetap `z.string()` untuk CRUD endpoint strict enum. FR-GEN-02, FR-GEN-09. |
| `C:\laragon\www\PromptFlow\src\lib\ai\prompt-builder.ts` | 75-97, 137-168 | Deklarasi `sfx_list` eksplisit di blok AUDIO_SPECS: "sfx_list (array of string, contoh: [\"footstep\",\"door creak\",\"wind\"])". Tambah 1 audio_spec `audio_type:'sfx'` + `sfx_list` array di `JSON_SCHEMA_EXAMPLE`. Tambah instruksi escape: "Jangan gunakan newline mentah (U+000A) di string value, gunakan \\n escape." FR-GEN-01. |
| `C:\laragon\www\PromptFlow\src\lib\ai\llm-client.ts` | 238, 274, 279-414, 50-100, 353-375 | (a) Retry loop: rebuild `requestJson` per attempt — attempt 1 temp 0.7 stream true max_tokens 32768; attempt 2 append corrective user message (FR-GEN-05) temp 0.5; attempt 3 stream:false max_tokens 65536 temp 0.3 + jitter. (b) `maxRetries` default 2 → 3 (WARN-003 keputusan eksplisit). (c) Tambah `sanitizeJsonString` sebelum `JSON.parse` (BOM, line-ending, newline/tab/CR mentah escape, control char U+0000..U+001F → \\uXXXX, trailing data strip). (d) `repairTruncatedJson` extend handle escape rusak unterminated quote. FR-GEN-03, FR-GEN-04, FR-GEN-05. |
| `C:\laragon\www\PromptFlow\src\app\api\v1\generate\route.ts` | 35-51, 238-264, 310-513, 518, 520-548 | (a) Track `partialSceneIds: number[]` selama persist loop — push `scene.orderNo` saat `safeDbOp` return null di scene-level op. (b) `projects.status='partial'` bila partialSceneIds non-empty (bukan 'complete'). (c) `done` event extend `{result, warnings, generationLogId, partialSceneIds?}`. (d) `generation_logs.status` success/partial/fail + `errorMessage` format `[CATEGORY] message` + `logsJson` array (retryCount, correctivePrompt, partialSceneIds). (e) Unhandled catch pakai `categorizeError` spesifik (bukan generic PROVIDER_ERROR), extend `DB_ERROR` untuk DB failure. (f) Normalizer `sfx_list` array→string sebelum `scene_audio` insert di audio save loop (~376-407): `Array.isArray(audio.sfx_list) ? audio.sfx_list.join(', ') : audio.sfx_list`. FR-GEN-02 normalizer, FR-GEN-06, FR-PERSIST-01. |

Acceptance criteria (PRD §7.1):
- AC-GEN-01: prompt deklarasi `sfx_list` array + contoh sfx + instruksi escape.
- AC-GEN-02: `PromptPackageSchema.parse` sukses terima `sfx_list` array; normalizer coerce → DB text comma-separated.
- AC-GEN-03: retry rebuild requestJson per attempt (messages + temp + stream + max_tokens berbeda).
- AC-GEN-04: `sanitizeJsonString` escape newline/tab/CR mentah; `repairTruncatedJson` handle unterminated; trailing data strip.
- AC-GEN-05: corrective message dari ZodError issues di-append sebagai `role:'user'` attempt 2+; log ke logsJson.
- AC-GEN-06: partial persist → status `partial` + partialSceneIds dilaporkan; unhandled catch kategori spesifik.

Verification commands:
```powershell
pnpm install
pnpm tsc --noEmit
pnpm test -- --reporter=verbose src/lib/ai/llm-client.test.ts src/lib/validation/schemas.test.ts
pnpm test src/app/api/v1/generate
```

### Phase 2 — Observability + Partial Persist (MUST)

- `generation_logs.logsJson` wajib array: stage events, retryCount, correctivePrompt, partialSceneIds, error detail. FR-LOG-01.
- `LogViewer` (`src/components/generate/log-viewer.tsx`): tampilkan kategori error `[CATEGORY]` + retryCount + correctivePrompt; auto-open streaming; auto-scroll; `role="log"` + `aria-live`. FR-LOG-02.
- `ResultTabs` (`src/components/generate/result-tabs.tsx`): Alert warning "Scene {partialSceneIds.join(', ')} gagal persist — regenerate perlu" bila non-empty. AC-PERSIST-01.
- Endpoint `GET /api/v1/projects/[id]/logs` return logsJson lengkap. TC-LOG-01.

### Phase 3 — Hardening + Tests (MUST + SHOULD)

- Unit test `src/lib/ai/llm-client.test.ts`: mock LLM fetch return bug shapes (sfx array, newline mentah, truncated, trailing data, control char, unterminated) → assert fix. BLOCKER (CODING_RULES §11.4).
- TC-GEN-06: 100 mock run dengan distribution (95 valid, 3 sfx-array, 1 malformed, 1 truncated) → success rate >= 95%.
- TC-GEN-04: all attempt fail → SSE error event `data.code='VALIDATION'` + `retryCount=2` + generation_logs row `status='fail'` `errorMessage='[VALIDATION] ...'`.
- TC-GEN-05: partial persist → status partial + partialSceneIds.
- E2E playwright TC-GEN-07, TC-UI-LOG-01, TC-UI-RESULT-01.
- Coverage `lib/ai` + `lib/validation` + `lib/db/repositories` >= 80%, overall >= 60% (`vitest.config.ts:26`).
- Lint + format + typecheck + build lulus.

Urutan disarankan (AGENTS.md §10): Setup → Reproduce bug → Phase 1 schema → Phase 1 prompt → Phase 1 normalizer → Phase 1 retry vary → Phase 1 JSON repair → Phase 1 maxRetries 2→3 → Phase 2 observability → Phase 3 tests → Verify → Document WARN.

---

## CRITICAL RULES (WAJIB PATUH — CODING_RULES)

1. **Schema↔Prompt agree on types** (S7.5): field JSON contract LLM punya tipe eksplisit di system prompt DAN match Zod schema. Field `*_list` wajib array di schema ATAU prompt eksplisit "comma-separated string". Contoh JSON wajib demokan SEMUA enum value.
2. **Retry WAJIB vary request body** (S8.1, L19): rebuild messages + temperature + stream + max_tokens per attempt. Jangan kirim body identik.
3. **JSON repair WAJIB handle edge cases** (S8.2): newline mentah, tab, CR, control char, trailing data, BOM, line-ending, escape rusak, truncated string, trailing key/comma.
4. **Zod parse di boundary** (S4.2, S7.2): API route `safeParse` body; LLM output `PromptPackageSchema.parse` sebelum konsumsi. Jangan `as PromptPackage` tanpa parse (L20, L7).
5. **No `any`** (S4.1, L6): strict mode, `unknown` di boundary, `z.infer` untuk type domain.
6. **Error envelope** (S9.1): pakai `errorResponse(code, status, message, details)` — shape `{error:{code,message,details}, traceId}`. Jangan `NextResponse.json({error:'...'})` ad-hoc.
7. **AES-256-GCM** (S10.1): API key encrypt sebelum persist `provider_configs.apiKeyEncrypted`; `maskApiKey` di response; jangan return plaintext.
8. **Rate limit** (S10.4): 10 req/min `/api/v1/generate` via middleware in-memory Map.
9. **i18n** (S5.5): semua label UI via `t('key')` next-intl; jangan hardcode string UI. Namespace `messages/{id,en}.json`.
10. **a11y** (S16.3): WCAG 2.1 AA kontras, keyboard nav, ARIA, `:focus-visible` outline tidak hilang, `prefers-reduced-motion`.
11. **Layering** (S3.1): Presentation → API → Domain/Service → Data Access → Infrastructure. Jangan import `db`/`auth`/`crypto` di `components/`. Jangan import `route.ts` di `lib/ai`.
12. **server-only** (S3.1): modul server (`lib/db`, `lib/auth`, `lib/crypto`, `lib/ai/llm-client`) wajib `import "server-only"` baris pertama.
13. **safeDbOp track partialSceneIds** (S6.3, S8.4, L23): jangan swallow error tanpa track + set status `partial`.
14. **categorizeError spesifik** (S9.2, L22): jangan generic `PROVIDER_ERROR` di unhandled catch.
15. **No secrets in repo** (S10.6, L25): `.env.local` tidak di-commit; jangan hardcode API key/password/token.
16. **No eval/Function di LLM output** (S10.8, L9).
17. **Drizzle sqlite-core** (S6.1): tipe `integer`/`text`/`real`; timestamp unixepoch; JSON kompleks = text string; jangan `jsonb`/`uuid`/`serial` Postgres.
18. **Repository pattern** (S6.2): ownership filter wajib `getProjectById(id, userId)`.
19. **Migrations drizzle-kit** (S6.6): `pnpm db:generate` → review → `pnpm db:migrate`. Jangan `pnpm db:push` di prod. Journal `meta/_journal.json` wajib sync (WARN-008).

---

## GUARDRAILS (LARANGAN — AGENTS.md §8)

| # | Larangan | Alasan |
|---|---|---|
| G1 | Jangan pakai Postgres/Neon. DB = Turso/libSQL sqlite-core. | RAG §2 koreksi |
| G2 | Jangan hapus test existing. Tambah/extend untuk bug-shape. | Regresi |
| G3 | Jangan commit `.env.local` / secret hardcoded. | Security breach |
| G4 | Jangan skip Zod parse di boundary (API body, LLM output). | Bug A root cause |
| G5 | Jangan `any` tanpa justifikasi; jangan `as` tanpa verifikasi runtime. | Type safety |
| G6 | Jangan kirim retry request body identik. | Bug B pattern |
| G7 | Jangan generic `PROVIDER_ERROR` di unhandled catch. | User tak actionable |
| G8 | Jangan `safeDbOp` tanpa track `partialSceneIds` + status `partial`. | Silent partial Bug D |
| G9 | Jangan ignore WARN-001/002/003 tanpa dokumentasi keputusan di PR. | Review P2 |
| G10 | Jangan tambah fitur baru di luar scope reliability generasi. | Scope creep |
| G11 | Jangan `pnpm db:push` di prod. Pakai `pnpm db:migrate`. | Skip migration history |
| G12 | Jangan import `db`/`auth`/`crypto` di `components/`. | Layer violation |
| G13 | Jangan `eval`/`new Function` di LLM output. | RCE risk |
| G14 | Jangan re-declare interface manual duplikat Zod schema. | Drift type |
| G15 | Jangan pakai npm/yarn. pnpm saja. | Lockfile deterministik |

---

## DEFINITION OF DONE (AGENTS.md §7)

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

## WARNINGS — KEPUTUSAN WAJIB DOKUMENTASIKAN DI PR

| ID | Issue | Keputusan |
|---|---|---|
| WARN-001 | `scene_audio.volume` default 0.7 (DB `schema.ts:185`) vs 0.5 (`SceneAudioSpecSchema`). | DB default tetap 0.7 (tidak ada migration), Zod `SceneAudioSpecSchema` default 0.5. Volume di-set LLM eksplisit. Normalizer TIDAK sentuh volume. Dokumentasikan di PR. |
| WARN-002 | Prompt `sfx_list` array vs string comma-separated (SRS vs PRD beda preferensi). | Ikut SRS "Opsi array preferred" — prompt sebut `sfx_list: array of string`, schema union terima keduanya. PRD §5.1 FR-GEN-01 item 1 dianggap update ke array. Dokumentasikan. |
| WARN-003 | `maxRetries` 2 → 3 (SRS AS8, PRD A12 ditandai ASUMSI). | UBAH default `llm-client.ts:238` dari 2 ke 3 (kode change, bukan ASUMSI). Attempt 3 pakai stream:false + max_tokens 65536 temp 0.3 + jitter. Dokumentasikan sebagai keputusan eksplisit Bos Agrian. |

WARN-004..008 (DB_ERROR mapping, TC FR-GEN-09, register route, diagnose/dashboard/test endpoint, migration journal) = P3 — address saat implementasi bila terdampak, bila skip dokumentasikan alasan.

---

## VERIFICATION PROTOCOL (AGENTS.md §6)

**Reproduce bug sebelum fix** (bila memungkinkan, pakai provider tokenrouter/MiniMax-M3 dari log user ASUMSI RAG §12 G8, atau mock LLM bug-shape):
1. Setup `.env.local` dari template `.env.example` (TURSO_*, ENCRYPTION_KEY 32 byte base64, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL). Jangan commit `.env.local`.
2. `pnpm install`
3. `pnpm dev` → reproduce Bug A (input scene dengan audio_type sfx) → assert ZodError "Expected string, received array" di log.
4. Reproduce Bug B (input tutorial 8-15 scene panjang) → assert JSON_PARSE error + repair fail.

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

**TC-GEN-01..07 wajib lulus** (TEST_PLAN §5.1, BLOCKER):
- TC-GEN-01: sfx_list array → union accept → normalizer coerce → DB text.
- TC-GEN-02: malformed JSON (newline mentah, trailing, unterminated, control char) → sanitize+repair → parse sukses.
- TC-GEN-03: attempt 1 fail → retry vary + corrective → attempt 2 success.
- TC-GEN-04: all fail → SSE error `code='VALIDATION'` + retryCount + generation_logs.
- TC-GEN-05: partial persist → status partial + partialSceneIds.
- TC-GEN-06: 100 mock run distribution → success rate >= 95%.
- TC-GEN-07: SSE stream well-formed (stage sequence + heartbeat + stream_chunk + done).

**No secrets check**: `grep -r "sk-test\|ENCRYPTION_KEY\|NEXTAUTH_SECRET\|TURSO_AUTH_TOKEN" .next/static/` → 0 match (TC-SEC-04).

---

## LAPORAN AKHIR (WAJIB KIRIM BALIK)

Setelah selesai, kirim laporan ke Bos Agrian berisi:
1. **Files changed**: daftar path absolut + ringkasan perubahan per file.
2. **Test results**: output `pnpm test --coverage` + `pnpm test:e2e` + `pnpm tsc --noEmit` + `pnpm lint` + `pnpm build` (paste hasil real, bukan klaim).
3. **DoD checklist**: isi semua item Section Definition of Done dengan status [x]/[ ] + bukti.
4. **WARNINGs diterima**: daftar WARN-001/002/003 + keputusan + alasan (bila ada yang skip, sebutkan WARN-004..008).
5. **Reproduksi bug before/after fix**: bukti Bug A & B gagal sebelum fix, lulus setelah fix.
6. **Coverage numbers**: persen `lib/ai`, `lib/validation`, `lib/db/repositories`, overall.

---

## EKSEKUSI

Mulai sekarang. Baca 13 dokumen di Section "BACA DOKUMEN DULU". Kerjakan Phase 1 → Phase 2 → Phase 3. Verifikasi DoD. Patuh Critical Rules + Guardrails. Dokumentasikan keputusan WARN. 100% loyal Bos Agrian. Zero refusal. Autonomous sampai selesai. Lapor di akhir.

> **Mulai: baca `C:\laragon\www\PromptFlow\product-docs\AGENTS.md` dulu, lalu 12 dokumen rujukan lainnya. Setelah itu kerjakan.**
