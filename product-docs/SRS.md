# SRS.md - PromptFlow Software Requirement Specification

> Disusun oleh docgen-srs. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `BRD.md` + `MRD.md` + `PRD.md`.
> Klaim faktual bertumpu pada RAG (cite file:line). Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis + cuplikan kode apa adanya.
> Fokus SRS: TEKNIS - arsitektur, tech stack, spesifikasi fungsional detail, data model, interface/API, constraint teknis konkret, tahapan implementasi, verifikasi.
> Tiap PRD FR-GEN-* / FR-PERSIST-* / FR-LOG-* / FR-PROV-* / FR-AUTH-* termapping ke realisasi teknis di sini.

---

## 1. Arsitektur Sistem

### 1.1 Pendekatan teknis umum

PromptFlow adalah monolith Next.js 15 App Router (TypeScript strict) berjalan di Vercel (Node runtime, maxDuration 300s untuk `/api/v1/generate`). Tidak ada service terpisah/microservice. State di DB Turso/libSQL (SQLite-compatible hosted). Blob storage via Vercel Blob (`RAG S3.6`). Auth edge-safe via NextAuth v5 + jose JWT (`RAG S10.1, S10.4`).

Pipeline generasi = endpoint SSE tunggal `POST /api/v1/generate` (`route.ts:53-564`) yang mengorkestrasi: auth -> validasi input -> resolve provider -> resolve/create project -> build prompt -> call LLM (stream) -> extract JSON -> repair -> Zod validate -> retry loop -> persist DB (partial safe) -> consistency check -> SSE done event (`RAG S5`).

### 1.2 Struktur App Router (cite `RAG S3.1`)

```
src/
  app/
    api/v1/                          # 24 route files (glob verifikasi RAG S3.2)
      generate/route.ts              # SSE generation (POST, nodejs runtime, maxDuration 300)
      upload/route.ts                # asset upload
      upload/classify/route.ts       # V2 vision classification
      diagnose/route.ts
      health/route.ts
      register/route.ts
      dashboard/stats/route.ts
      settings/providers/route.ts
      settings/providers/[id]/route.ts
      settings/providers/[id]/delete/route.ts
      settings/providers/[id]/test/route.ts
      projects/route.ts
      projects/[id]/route.ts
      projects/bulk-delete/route.ts
      projects/[id]/theme/route.ts
      projects/[id]/image-prompts/route.ts
      projects/[id]/delete/route.ts
      projects/[id]/characters/route.ts
      projects/[id]/scenes/route.ts
      projects/[id]/export/route.ts
      projects/[id]/logs/route.ts
      projects/[id]/scenes/[sceneId]/audio/route.ts
      projects/[id]/scenes/[sceneId]/audio/[audioId]/route.ts
    auth/[...nextauth]/route.ts
    [locale]/                        # i18n segment id|en (middleware.ts:38-42)
  components/generate/               # 9 .tsx
  lib/
    ai/                              # 13 .ts
    auth/                            # config.ts, middleware.ts, edge
    crypto/aes.ts                    # AES-256-GCM
    db/                              # client.ts, schema.ts, repositories/ (12 .ts)
    templates/                       # presets.ts, titles.ts
    export/markdown.template.ts
    migration/v2-to-v3.ts
    analytics/events.ts
    i18n/                            # request.ts, config.ts
    api/error.ts
    storage/                         # ASUMSI blob helper
  middleware.ts                      # Edge: auth gate + i18n + rate limit
messages/                            # id.json, en.json
product-docs/                        # SOURCE OF TRUTH docs
```

### 1.3 Modul lib (cite `RAG S3.1`)

| Modul | File inti | Tanggung jawab |
|---|---|---|
| ai | `llm-client.ts:237-424`, `prompt-builder.ts:137-191`, `response-parser.ts:14-25`, `provider-registry.ts:12-47`, `consistency-checker.ts:19-38`, `log-buffer.ts:1-34`, `image-classifier.ts` | Generate prompt package via LLM, extract+repair JSON, retry, categorize error, build prompt, check consistency, buffer log |
| db | `client.ts:2-13`, `schema.ts:5-201`, `repositories/*.ts` (12 file) | Drizzle ORM + libSQL, schema 9 tabel, repository per entitas |
| auth | `config.ts:11-61`, `middleware.ts:6-20`, `edge` (ASUMSI) | NextAuth v5 Credentials, bcrypt compare, JWT edge-safe, requireSession |
| crypto | `aes.ts:4-49` | AES-256-GCM encrypt/decrypt API key, maskApiKey |
| validation | `schemas.ts:1-268` | Zod schema PromptPackage + sub-schema |
| export | `markdown.template.ts:4-173` | Render PromptPackage ke Markdown |
| i18n | `request.ts`, `config.ts` | next-intl routing id/en, message loader |
| storage | (ASUMSI `src/lib/storage/`) | Vercel Blob helper |
| analytics | `events.ts:1-22` | Vercel Analytics trackEvent |
| templates | `presets.ts:53-224`, `titles.ts` (ASUMSI) | 5 preset |
| migration | `v2-to-v3.ts:59-142` | Backfill + rollback V2->V3 |

### 1.4 Alur data generasi end-to-end (cite `RAG S5`)

1. POST `/api/v1/generate` (runtime nodejs, maxDuration 300, force-dynamic) - `route.ts:19-21,53`.
2. `auth()` NextAuth - 401 jika no session - `route.ts:59,64`.
3. `req.json()` -> `GenerateInputSchema.safeParse` - 400/422 jika invalid - `route.ts:70-88`.
4. Provider resolve by `providerId` or active or fallback first - 404 jika null - `route.ts:92-108`.
5. Project resolve: create new atau verify ownership - `route.ts:125-139`.
6. Orphan asset refs attach (V2, non-fatal) - `route.ts:148-159`.
7. SSE stream start, headers `text/event-stream`, `no-cache`, `X-Accel-Buffering: no` - `route.ts:163,557-563`.
8. Stage events: `starting` -> `character_profiles` -> `llm_calling` -> ... -> `saving` -> `done` - `route.ts:185-308`.
9. `buildUserMessage(inp, references)` + `buildSystemPrompt()` - `route.ts:199-200`.
10. Heartbeat setInterval 2s, kirim `elapsedSec` - `route.ts:213-220`.
11. `generatePromptPackage({provider, system, messages, onStreamChunk})` - `route.ts:222-229`.
12. LLM internal (`llm-client.ts:237-424`): decrypt key -> build endpoint -> body `{model, messages, max_tokens:32768, temperature:0.7, stream:true}` -> fetch + AbortSignal.timeout(600_000) -> stream parse -> extract JSON -> repair -> Zod validate -> retry maxRetries=2 backoff 2s/4s -> final throw `[CATEGORY] message` - `llm-client.ts:244-423`.
13. LLM failure path: mark project `failed`, generation log `fail`, send `PROVIDER_ERROR` - `route.ts:238-264`.
14. Re-validate `PromptPackageSchema.parse(pkg)` di route - `route.ts:268-298`.
15. DB persist (`route.ts:310-493`): updateProjectResult -> delete old -> bulkCreate* -> per-scene createSceneAudio + image_prompts -> bulk master image_prompts + supporting_characters. Tiap `safeDbOp` (continue on error, `route.ts:35-51`).
16. `checkConsistency(validated)` -> warnings[] - `route.ts:496`.
17. Generation log persist status `partial`/`success` - `route.ts:502-513`.
18. `done` event `{result, warnings, generationLogId}` - `route.ts:518`.
19. Unhandled catch: mark failed, send `PROVIDER_ERROR` - `route.ts:520-548`.
20. Finally: close stream - `route.ts:549-552`.

---

## 2. Tech Stack + Justifikasi

| Layer | Tech | Versi (package.json) | Justifikasi | Citation |
|---|---|---|---|---|
| Framework | next | ^15.1.0 (App Router) | Server Components, route handlers, SSE, edge middleware | `package.json:50`, `next.config.ts:1-17` |
| UI runtime | react / react-dom | ^19.0.0 | Concurrent rendering | `package.json:54-55` |
| Bahasa | typescript | ^5.7.0 (strict) | Type safety PromptPackage | `package.json:83`, `tsconfig.json:7` |
| Form | react-hook-form | ^7.54.0 | Generate form state | `package.json:56` |
| Validasi form | @hookform/resolvers | ^3.10.0 | Bind Zod ke RHF | `package.json:24` |
| Skema validasi | zod | ^3.24.0 | Single source of truth PromptPackageSchema | `package.json:61` |
| ORM | drizzle-orm | ^0.38.0 | Type-safe SQL, sqlite-core Turso | `package.json:47` |
| DB driver | @libsql/client | ^0.14.0 | Turso/libSQL (SQLite-compatible) - BUKAN Postgres | `package.json:25`, `client.ts:2` |
| Migration | drizzle-kit | ^0.30.0 (dialect turso) | Schema migration | `package.json:46`, `drizzle.config.ts:18` |
| Auth | next-auth | 5.0.0-beta.25 (v5) | Credentials provider, JWT edge-safe | `package.json:51`, `config.ts:2-11` |
| Auth core | @auth/core | ^0.37.0 | NextAuth v5 core | `package.json:23` |
| Password hash | bcryptjs | ^2.4.3 | Hash + compare | `package.json:43`, `config.ts:4,31` |
| AI SDK | ai (Vercel AI SDK) | ^4.0.0 | Streaming util | `package.json:42` |
| AI provider compat | @ai-sdk/openai-compatible | ^1.0.0 | OpenAI-compatible endpoint 4 provider | `package.json:22`, `provider-registry.ts:2` |
| i18n | next-intl | ^3.26.0 | Routing id/en, edge-safe | `package.json:52`, `next.config.ts:2-4` |
| Styling | tailwindcss | ^4.0.0 | Utility CSS | `package.json:82` |
| UI kit | shadcn/ui (radix) | berbagai ^1.x/^2.x | A11y baseline | `package.json:26-39`, `components.json` |
| Theming | next-themes | ^0.4.6 | Dark/light/system | `package.json:53` |
| Animasi | framer-motion | ^12.40.0 | UI motion | `package.json:48` |
| Notif | sonner | ^1.7.0 | Toast | `package.json:59` |
| Charts | recharts | ^3.8.1 | Dashboard | `package.json:57` |
| Icons | lucide-react | ^0.468.0 | Icon set | `package.json:49` |
| Blob storage | @vercel/blob | ^0.27.0 | Asset upload | `package.json:41` |
| Analytics | @vercel/analytics | ^2.0.1 | Event tracking | `package.json:40`, `events.ts:1` |
| Util | clsx, tailwind-merge, cva | ^2.x/^0.7.x | className merge, variant | `package.json:44-45,60` |
| Server-only guard | server-only | ^0.0.1 | Cegah modul server di client | `package.json:58` |
| Test unit | vitest + @vitejs/plugin-react | ^2.1.0 / ^4.3.0 | Unit test pipeline | `package.json:84,72` |
| Coverage | @vitest/coverage-v8 | ^2.1.0 | Coverage report | `package.json:73` |
| Test E2E | @playwright/test | ^1.49.0 | E2E generate flow | `package.json:64` |
| Lint | eslint ^9.17, eslint-config-next ^15.1, @typescript-eslint ^8.18 | - | Lint | `package.json:76-78,70-71` |
| Format | prettier ^3.4 + prettier-plugin-tailwindcss ^0.6 | - | Format | `package.json:80,81` |
| Env loader | dotenv | ^17.4.2 | drizzle.config.ts only | `package.json:75` |
| Package manager | pnpm | >=9.0.0, locked pnpm@11.7.0 | Lockfile deterministik | `package.json:88-90` |
| Node | >=20.0.0 | - | Runtime LTS | `package.json:86-88` |

**KOREKSI PENTING** (`RAG S2`): DB = Turso/libSQL (SQLite-compatible), BUKAN Postgres/Neon. Bukti: `src/lib/db/client.ts:2-13`, `drizzle.config.ts:18` (`dialect: 'turso'`), `src/lib/db/schema.ts:2` (`sqlite-core`).

---

## 3. Spesifikasi Fungsional Detail (mapping PRD FR -> realisasi teknis)

### 3.1 Generation pipeline (tutup Bug A + Bug B - MUST)

#### 3.1.1 FR-GEN-01: Prompt contract eksplisit tipe `sfx_list`

**Root problem** (`RAG S7.1, S7.3, S11 Bug A`): `prompt-builder.ts:152` hanya bilang "Untuk sfx: sfx_list." tanpa tipe/contoh. `JSON_SCHEMA_EXAMPLE` (`prompt-builder.ts:75-97`) hanya 2 audio_spec (`ambient`, `background_music`), TIDAK ADA `sfx`. Nama field "list" menyiratkan array -> LLM kirim `["footstep","door"]`.

**Target design** - ubah `buildSystemPrompt()` (`prompt-builder.ts:137-168`):

1. Deklarasi `sfx_list` eksplisit di blok `AUDIO_SPECS`:
   - **Preferred (Opsi array, selaras FR-GEN-02)**: `sfx_list: array of string (contoh: ["footstep","door creak","wind"])`.
   - **Alternative (Opsi string)**: `sfx_list: string comma-separated (contoh: "footstep,door creak,wind")`.
   - **Rekomendasi SRS**: Opsi array. Alasan: (a) nama field "list" linguistik menyiratkan array, LLM natural kirim array; (b) selaras schema union FR-GEN-02; (c) DB text tetap aman via normalizer; (d) prompt tidak melawan kecenderungan natural LLM.
2. Tambah 1 audio_spec `sfx` di `JSON_SCHEMA_EXAMPLE` (`prompt-builder.ts:75-97`):
```json
{
  "audio_type": "sfx",
  "description": "Efek suara langkah kaki di kayu dan pintu berderit",
  "timing": "start",
  "volume": 0.6,
  "fade_in_ms": 100,
  "fade_out_ms": 200,
  "sfx_list": ["footstep on wood", "door creak"]
}
```
3. Tambah instruksi escape di blok `PENTING`:
   - "Jangan gunakan newline mentah (karakter `U+000A`) di dalam string value. Gunakan escape `\\n`."
   - "Jangan gunakan tab mentah (`U+0009`) di dalam string value. Gunakan escape `\\t`."
4. Konsistenkan enum `audio_type` dan `timing` di prompt (tetap enum untuk guide LLM, schema longgar via FR-GEN-02).

**Verbatim target instruksi AUDIO_SPECS (Opsi array preferred)**:
```
AUDIO_SPECS: audio_type (background_music|sfx|ambient|music_cue|transition_audio), description, timing (start|throughout|end|specific_moment), volume (0-1), fade_in_ms, fade_out_ms. Untuk musik: music_genre, music_mood, music_tempo_bpm, music_instruments. Untuk ambient: ambient_type, ambient_volume. Untuk sfx: sfx_list (array of string, contoh: ["footstep","door creak","wind"]).
```

**Input**: `GenerateInput` (title, duration, style, storyDescription, references, numScenes, providerId/projectId).
**Proses**: `buildSystemPrompt()` return string prompt dengan deklarasi tipe `sfx_list` + contoh `sfx` + instruksi escape.
**Output**: System prompt string deterministik untuk field `sfx_list`.
**Acceptance teknis**: Lihat `PRD AC-GEN-01`; unit test `prompt-builder.test.ts` assert string mengandung `"sfx_list"` + `"array of string"` (atau `"comma-separated"` bila Opsi string) + contoh JSON mengandung `"audio_type": "sfx"`.
**Citation**: `RAG S7.1`, `RAG S7.3`, `RAG S11 Bug A`.

---

#### 3.1.2 FR-GEN-02 + FR-GEN-09: Zod schema `sfx_list` longgar + normalizer + konsolidasi duplikat

**Root problem** (`RAG S6.1, S6.3, S11 Bug A, Bug F`): `SceneAudioSpecSchema.sfx_list: z.string().nullable().optional()` (`schemas.ts:52`) reject array. Duplikat `SceneAudioSchema` (`schemas.ts:83-99`) beda default volume 0.7 vs 0.5, `audio_type` enum vs string, `music_tempo_bpm` range 60-200 vs tanpa. DB `scene_audio.sfxList: text` (`schema.ts:193`) konsisten string.

**Target design** - ubah `src/lib/validation/schemas.ts`:

**Opsi 1 (Preferred - array di schema union)**: ubah `SceneAudioSpecSchema.sfx_list` (`schemas.ts:52`) ke:
```typescript
sfx_list: z.union([z.string(), z.array(z.string())]).nullable().optional(),
```
Pola union sudah ada untuk `color_palette` (`schemas.ts:29`). Schema terima string atau array dari LLM. DB persist tetap text via normalizer.

**Opsi 2 (Alternative - string di schema + prompt string)**: pertahankan `z.string().nullable().optional()` TAPI prompt (FR-GEN-01) wajib eksplisit "sfx_list: string comma-separated". Risiko: LLM tetap kirim array karena nama "list" -> reject. Tidak robust.

**Rekomendasi SRS**: **Opsi 1**. Alasan: (a) nama field "list" menyiratkan array, LLM natural kirim array; (b) schema longgar di LLM, strict di DB = pola robust `color_palette`; (c) DB text tetap konsisten via normalizer; (d) prompt Opsi array (FR-GEN-01) selaras.

**Normalizer** di `route.ts:376-407` (audio save loop) sebelum `scene_audio` DB insert:
```typescript
const normalizedSfxList = Array.isArray(audio.sfx_list)
  ? audio.sfx_list.join(', ')
  : (audio.sfx_list ?? null);
// insert scene_audio dengan sfxList: normalizedSfxList
```
Pola normalizer array->string sudah ada untuk `color_palette` di `route.ts:429,446,472,480` (`JSON.stringify`).

**Konsolidasi duplikat (FR-GEN-09)**:
- `SceneAudioSpecSchema` (`schemas.ts:39-55`) = source of truth untuk `SceneSchema.audio_specs` (generate pipeline). `sfx_list` union (Opsi 1). `audio_type` string (longgar). `timing` string default 'throughout'. `volume` default 0.5.
- `SceneAudioSchema` (`schemas.ts:83-99`) = untuk audio CRUD endpoint terpisah (`scene-audio.repository.ts:1-47`). `audio_type` enum strict. `timing` enum strict. **Samakan default volume ke 0.5** (bukan 0.7). `sfx_list` tetap `z.string().nullable().optional()` (endpoint CRUD menerima string dari UI/form, bukan LLM).
- Ekspor type `SceneAudioType` (`schemas.ts:101`) tetap dari `SceneAudioSchema` strict.

**Input**: `parsedJson` dari LLM (sfx_list array atau string).
**Proses**: `PromptPackageSchema.parse` union terima -> normalizer coerce -> DB insert.
**Output**: `scene_audio.sfxList` text string comma-separated.
**Acceptance teknis**: Lihat `PRD AC-GEN-02`; unit test `schemas.test.ts`: parse `{sfx_list: ["a","b"]}` sukses, parse `{sfx_list: "a,b"}` sukses, normalizer `["a","b"]` -> `"a,b"`.
**Citation**: `RAG S6.1`, `RAG S6.3`, `RAG S11 Bug A, Bug F`, `RAG S9.10` (`schema.ts:193`), `RAG S13` (`route.ts:376-407,429,446,472,480`).

---

#### 3.1.3 FR-GEN-03: Retry vary request (prompt korektif + parameter variabel)

**Root problem** (`RAG S8.2.3, S11 Bug B`): `requestJson` di-build sekali di `llm-client.ts:274`, fetch pakai `body: requestJson` sama (`llm-client.ts:287`). Retry gagal identik untuk bug deterministik. Hanya `temperature:0.7` (`llm-client.ts:271`) kasih variabilitas probabilistik.

**Target design** - ubah retry loop `generatePromptPackage` (`llm-client.ts:237-424`):

1. **Attempt 1**: body original. `temperature: 0.7`, `stream: true`, `max_tokens: 32768` (existing `llm-client.ts:267-274`).
2. **Attempt 2** (jika attempt 1 fail): rebuild `requestJson`:
   - Tambah **corrective message** ke `messages` array (lihat FR-GEN-05) sebagai `role: 'user'` suffix.
   - `temperature: 0.5` (turunkan untuk output lebih deterministik).
   - `stream: true`, `max_tokens: 32768`.
   - Backoff 2s sebelum fetch (`llm-client.ts:408-412` dipertahankan).
3. **Attempt 3** (ASUMSI `maxRetries` naik dari 2 ke 3, `llm-client.ts:238`): rebuild `requestJson`:
   - Tambah corrective message attempt 2 (jika fail lagi).
   - `temperature: 0.3`.
   - `stream: false`, `max_tokens: 65536` (ASUMSI - untuk output panjang yang truncate saat stream).
   - Backoff 4s + jitter random 0-1000ms.
4. Backoff adaptif: `min(2000 * 2^(attempt-1), 8000)` + jitter attempt 3 (`llm-client.ts:408-412` extend).

**Skema rebuild requestJson per attempt (pseudocode)**:
```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const attemptMessages = attempt === 1
    ? messages
    : [...messages, { role: 'user', content: correctivePromptFromPrevError }];
  const temp = attempt === 1 ? 0.7 : attempt === 2 ? 0.5 : 0.3;
  const stream = attempt < 3;
  const maxTokens = attempt < 3 ? 32768 : 65536;
  const requestJson = JSON.stringify({ model, messages: attemptMessages, max_tokens: maxTokens, temperature: temp, stream });
  // fetch + extract + parse + validate
}
```

**Input**: error kategori dari attempt sebelumnya (`categorizeError`, `llm-client.ts:18-44`).
**Proses**: Rebuild `requestJson` per attempt dengan messages + parameter variabel.
**Output**: Request body berbeda per attempt -> peluang sukses beda.
**Acceptance teknis**: Lihat `PRD AC-GEN-03`; unit test `llm-client.test.ts` mock fetch: attempt 2 `messages` length > attempt 1, `temperature` 0.5, attempt 3 `stream:false` + `max_tokens:65536`.
**Citation**: `RAG S8.2.3` (`llm-client.ts:237-424,274,287`), `BRD S7 R1`, `RAG S11 Bug B` fix rekomendasi.

---

#### 3.1.4 FR-GEN-04: JSON repair hardening

**Root problem** (`RAG S8.2.2, S11 Bug B`): `repairTruncatedJson` (`llm-client.ts:50-100`) tidak handle:
- Newline literal mentah (`U+000A`) di dalam string value (JSON standar larang).
- Escape sequence rusak (`\"` terpotong).
- Control char (tab mentah `U+0009`, carriage return `U+000D`).
- Trailing data setelah JSON valid.
- Hanya close bracket/brace, tidak reconstruct value corrupt.

**Target design** - upgrade `repairTruncatedJson` (`llm-client.ts:50-100`) + tambah **pre-parse sanitizer** sebelum `JSON.parse` (`llm-client.ts:358`):

**Algoritma pre-parse sanitizer (urutan wajib)**:
1. Strip BOM (`\uFEFF`) di awal.
2. Normalize line ending: `\r\n` -> `\n`, `\r` -> `\n`.
3. **Escape control char mentah di dalam string value**: iterasi char, track inside-string (toggle pada `"` unescaped). Saat inside-string:
   - `\n` mentah -> `\\n`
   - `\r` mentah -> `\\r`
   - `\t` mentah -> `\\t`
   - control char lain `U+0000..U+001F` -> `\\uXXXX` (hex 4 digit).
   - Jangan escape `\\` yang sudah escape (cek char sebelumnya).
4. **Handle trailing data**: setelah JSON valid terdeteksi (brace/bracket match balanced, outside string), strip trailing non-whitespace.
5. **Handle escape rusak**: deteksi `\"` unterminated (count quote unescaped ganjil di string terakhir), tambah closing `"` sebelum bracket close.

**Algoritma repair (pertahankan existing + extend)**:
- Hapus trailing `"key":` tanpa value (`llm-client.ts:54`).
- Hitung unescaped quote, tutup string jika unterminated (`llm-client.ts:57-68` + extend sanitizer).
- Hapus trailing comma (`llm-client.ts:71`).
- Stack `{`/`[` dan tutup yang belum match (`llm-client.ts:74-97`).
- **Baru**: log warning duplicate key (JSON.parse default ambil terakhir, tidak fatal tapi log).

**Urutan pemanggilan di `llm-client.ts:353-375`**:
```typescript
const jsonStr = extractJsonFromContent(content);     // llm-client.ts:353
const sanitized = sanitizeJsonString(jsonStr);       // BARU
let parsedJson: unknown;
try {
  parsedJson = JSON.parse(sanitized);                // llm-client.ts:358
} catch (e) {
  const repaired = repairTruncatedJson(sanitized);   // llm-client.ts:364-367
  try {
    parsedJson = JSON.parse(repaired);
  } catch (repairErr) {
    throw new Error(`Response bukan JSON valid: ${repairErr.message}`); // llm-client.ts:373
  }
}
```

**Input**: `jsonStr` raw dari `extractJsonFromContent`.
**Proses**: Sanitize -> (JSON.parse || repair -> JSON.parse) -> `parsedJson`.
**Output**: `parsedJson` valid atau throw `Response bukan JSON valid: <err>`.
**Acceptance teknis**: Lihat `PRD AC-GEN-04`; unit test `llm-client.test.ts`:
- Input `{"a":"line1\nline2"}` (newline mentah) -> parse sukses.
- Input `{"a":"x"} trailing` -> parse sukses, trailing di-strip.
- Input `{"a":"unterminated` -> repair tambah closing quote -> parse sukses.
- Input `{"a":"tab\there"}` (tab mentah) -> parse sukses.
**Citation**: `RAG S8.2.2` (`llm-client.ts:50-100`), `RAG S8.2.1`, `RAG S11 Bug B` fix rekomendasi.

---

#### 3.1.5 FR-GEN-05: Validation error feedback ke LLM sebagai corrective prompt

**Root problem** (`RAG S8.2.3, S11 Bug A`): `PromptPackageSchema.parse` gagal (`llm-client.ts:379`) -> `ZodError` di-kategori `VALIDATION` (`llm-client.ts:28-36`) tapi tidak di-feedback ke LLM. Retry kirim prompt sama.

**Target design** - di retry loop (`llm-client.ts:279-414`), pada attempt 2+:

1. Catch `ZodError` dari `PromptPackageSchema.parse` (`llm-client.ts:379`).
2. Extract `ZodError.issues` (array `{path, message, expected, received}`).
3. Format **corrective message** string:
```
Validasi gagal pada attempt sebelumnya. Perbaiki output JSON agar sesuai schema.

Detail error:
- Field: scenes.2.audio_specs.2.sfx_list | Error: Expected string, received array | Expected: string | Received: array
- Field: scenes.3.image_prompts.1.prompt_text | Error: String harus 80-200 kata | Expected: string 80-200 kata | Received: string 50 kata

Aturan:
- sfx_list: array of string (contoh: ["footstep","door creak"]).
- prompt_text: 80-200 kata.
- Jangan gunakan newline mentah dalam string value, gunakan \n escape.

Output HANYA JSON object valid, TANPA code block, TANPA teks tambahan.
```
4. Append corrective message ke `messages` array sebagai `role: 'user'` (bukan 'system' untuk hindari conflict role ordering OpenAI-compatible).
5. Kirim ke LLM pada retry (FR-GEN-03 attempt 2).
6. Log corrective message ke `generation_logs.logsJson` (`schema.ts:155`).

**Shape corrective message (JSON shape untuk log)**:
```typescript
{
  stage: 'retry_correction',
  attempt: number,
  prevErrorCategory: 'VALIDATION' | 'JSON_PARSE' | 'TIMEOUT' | 'NETWORK' | 'HTTP' | 'UNKNOWN',
  prevErrorIssues: Array<{ path: (string|number)[]; message: string; expected?: string; received?: string }>,
  correctivePrompt: string,
  timestamp: number
}
```

**Input**: `ZodError` dari `PromptPackageSchema.parse`.
**Proses**: Extract issues -> format corrective message -> append ke messages -> retry -> log.
**Output**: LLM dapat konteks error -> output diperbaiki pada retry.
**Acceptance teknis**: Lihat `PRD AC-GEN-05`; unit test: mock ZodError issues -> assert corrective message mengandung path + message + expected + received; assert `messages` attempt 2 length > attempt 1; assert `logsJson` entry `stage: 'retry_correction'`.
**Citation**: `RAG S8.2.3` (`llm-client.ts:379,388-394,18-44`), `RAG S11 Bug A` fix rekomendasi.

---

#### 3.1.6 FR-GEN-06 + FR-PERSIST-01: SSE pipeline persist partial + log failure category

**Root problem** (`RAG S5, S11 Bug D`): `safeDbOp` (`route.ts:35-51`) swallow error, return null, lanjut. `bulkCreateScenes` null -> audio/image prompts scene-level skip (`route.ts:366-367`) TAPI `projects.status='complete'` (`route.ts:316`). Unhandled catch (`route.ts:520-548`) kirim generic `PROVIDER_ERROR`.

**Target design** - ubah `route.ts:310-513`:

1. **Track partial persist**: koleksi `partialSceneIds: number[]` selama DB persist loop (`route.ts:310-493`). Setiap `safeDbOp` return null untuk operasi scene-level (createSceneAudio, scene image_prompts), push `scene.orderNo` (atau scene index) ke array.
2. **Set status project**:
   - `partialSceneIds.length > 0` -> `projects.status = 'partial'` (bukan `complete`).
   - `partialSceneIds.length === 0` -> `projects.status = 'complete'` (existing).
3. **`done` event** (`route.ts:518`) extend:
```typescript
sendEvent('done', {
  result: validated,
  warnings,
  generationLogId,
  partialSceneIds: partialSceneIds.length > 0 ? partialSceneIds : undefined
});
```
4. **Generation log status**: `generation_logs.status`:
   - `'success'` jika warnings empty + partialSceneIds empty.
   - `'partial'` jika warnings non-empty ATAU partialSceneIds non-empty (`route.ts:502-513` extend).
   - `'fail'` jika LLM throw atau unhandled.
5. **`errorMessage` format** `[CATEGORY] message` (`llm-client.ts:422-423`).
6. **`logsJson`** wajib array log entries: stage events, stream chunks summary, retryCount, correctivePrompt (FR-GEN-05), error detail, partialSceneIds.
7. **Unhandled catch** (`route.ts:520-548`): pakai `categorizeError` (`llm-client.ts:18-44`) spesifik (TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE/UNKNOWN), bukan default `PROVIDER_ERROR`. Untuk DB error, kategori baru `DB_ERROR`.
8. **UI `result-tabs.tsx`**: tampilkan warning "Scene {partialSceneIds.join(', ')} gagal persist - regenerate perlu" bila `partialSceneIds` non-empty.
9. **Heartbeat** (`route.ts:213-220`) dipertahankan.
10. **ASUMSI keputusan bisnis** (`RAG S11 Bug D`, `PRD OOS-09`): TIDAK ada rollback transaksi DB. Partial success acceptable. Hanya status + laporan eksplisit. Alasan: Turso/libSQL concurrency write terbatas, rollback kompleks untuk multi-tabel cascade, by design existing.

**Input**: `validated` PromptPackage + DB persist result + error.
**Proses**: Persist -> check partial -> set status -> log -> SSE done event.
**Output**: `done` event `{result, warnings, generationLogId, partialSceneIds?}` + `generation_logs` row lengkap.
**Acceptance teknis**: Lihat `PRD AC-GEN-06, AC-PERSIST-01`; integration test: mock `bulkCreateScenes` throw -> assert `projects.status='partial'`, `done` event `partialSceneIds` non-empty, `generation_logs.status='partial'`.
**Citation**: `RAG S5` step 13-18 (`route.ts:238-264,310-513,520-548`), `RAG S11 Bug D`, `RAG S9.8` (`schema.ts:147-160`), `RAG S13` (`route.ts:35-51`).

---

#### 3.1.7 FR-GEN-07: SSE streaming progress stage

**Requirement**: Pertahankan SSE (`route.ts:163-554`). Stage events: `starting` -> `character_profiles` -> `llm_calling` -> ... -> `saving` -> `done`. Heartbeat 2s. Stream chunks via `stream_chunk` event (`route.ts:226-228`). Headers `text/event-stream`, `no-cache`, `X-Accel-Buffering: no` (`route.ts:557-563`).
**Citation**: `RAG S3.2`, `RAG S5` step 7-8.

---

#### 3.1.8 FR-GEN-08: Consistency checker (COULD)

**Requirement**: Pertahankan `checkConsistency(validated)` (`route.ts:496`, `consistency-checker.ts:19-38`) -> warnings[] karakter ref mismatch. Polish UI warning di `result-tabs.tsx`.
**Citation**: `RAG S4 F19`, `RAG S5` step 16.

---

### 3.2 Projects management

#### 3.2.1 FR-PROJ-01: Project CRUD + soft delete + bulk-delete

**Requirement** (`RAG S3.2, S9.3, S4 F7`): Endpoint:
- `POST /api/v1/projects` - create. Body `CreateProjectSchema`. Repository `project.repo.ts:33-65`.
- `GET /api/v1/projects` - list, filter userId + status + `deletedAt null`.
- `GET /api/v1/projects/[id]` - get by id, verify ownership.
- `PATCH /api/v1/projects/[id]` - update title/storyDescription/themePreference.
- `DELETE /api/v1/projects/[id]` - soft delete (`deletedAt` set, `schema.ts:49`).
- `POST /api/v1/projects/bulk-delete` - bulk soft delete.

**Ownership check wajib** (`NFR-SEC-08`): verify `project.userId === session.user.id`.
**Citation**: `RAG S4 F7`, `RAG S9.3`, `RAG S13` (`project.repo.ts:1-88`).

---

#### 3.2.2 FR-PROJ-02: Theme preference (COULD)

**Requirement**: `PATCH /api/v1/projects/[id]/theme` - set `themePreference` (`schema.ts:44`) enum `dark|light|system`. Schema `schemas.ts:103-104`.
**Citation**: `RAG S4 F20`, `RAG S9.3`.

---

#### 3.2.3 FR-PROJ-03: Orphan asset reference auto-attach

**Requirement** (`RAG S5 step 6, S9.4`): Saat create project baru (`route.ts:125-135`), orphan `asset_references` auto-attach ke project baru (`route.ts:148-159`). Non-fatal (safeDbOp). Endpoint `POST /api/v1/projects/[id]/image-prompts` manage image prompts.
**Citation**: `RAG S5` step 6, `RAG S9.4`.

---

### 3.3 Export

#### 3.3.1 FR-EXP-01: Export Markdown lengkap

**Requirement** (`RAG S4 F16, S13`): `GET /api/v1/projects/[id]/export` -> Markdown. Template `markdown.template.ts:4-173` wajib menyertakan:
- Title, duration_target, style.
- `character_profiles[]` lengkap (nama, gayarambut, wajah_asal, pakaian, alas_kaki, deskripsi_latar, aksi, peran, voice_type, age_range).
- `scenes[]`: order, description, voiceover_script, voiceover_speaker, transition spec, voice spec, duration_seconds, scene_pacing, scene_mood.
- `image_prompts` per scene (8-layer: target, prompt_text 80-200 kata, reference_filename, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical).
- `audio_specs[]` per scene (audio_type, description, timing, volume, fade, music_*, ambient_*, **sfx_list**).
- `supporting_characters[]`.
- `moral_message`.
**Citation**: `RAG S4 F16`, `RAG S6`, `RAG S13` (`markdown.template.ts:4-173`).

---

### 3.4 History / Logs

#### 3.4.1 FR-LOG-01: Generation log lengkap (MUST)

**Requirement** (`RAG S9.8, S4 F18`): `generation_logs` (`schema.ts:147-160`) wajib catat:
- `provider`, `model` - dari provider config.
- `durationMs` - dari POST masuk hingga done/fail.
- `status` - `success`/`partial`/`fail` (FR-GEN-06).
- `errorMessage` - format `[CATEGORY] message` (`llm-client.ts:422-423`). Null jika success.
- `logsJson` - array log entries: stage events, stream chunks summary, retryCount, correctivePrompt (FR-GEN-05), error detail, partialSceneIds (FR-GEN-06).
- `createdAt` - unixepoch (`schema.ts:159`).

**Endpoint**: `GET /api/v1/projects/[id]/logs` - list logs per project, verify ownership. Repository `generation-log.repo.ts:1-32` extend query aggregate retryCount.
**Citation**: `RAG S4 F18`, `RAG S9.8`, `RAG S13` (`generation-log.repo.ts:1-32`).

---

#### 3.4.2 FR-LOG-02: Log viewer (SHOULD)

**Requirement**: `log-viewer.tsx` (`RAG S4 F18`) menampilkan stage events, stream chunks, error kategori, retryCount, correctivePrompt.
**Citation**: `RAG S4 F18`, `RAG S3.1`.

---

#### 3.4.3 FR-LOG-03: In-memory log buffer (COULD)

**Requirement** (`RAG S13`): `log-buffer.ts:1-34` - max 500 entries FIFO, observability real-time tanpa DB query.
**Citation**: `RAG S13` (`log-buffer.ts:1-34`).

---

### 3.5 Dashboard analytics

#### 3.5.1 FR-DASH-01: Dashboard stats (SHOULD)

**Requirement** (`RAG S4 F8, S3.2`): `GET /api/v1/dashboard/stats` -> total project, generate count, success/fail/partial ratio, provider distribution. Repository `dashboard.repo.ts` (`RAG S12 G20` ASUMSI). Query aggregate `generation_logs` + `projects` + `provider_configs`.
**Citation**: `RAG S4 F8`, `RAG S3.2`.

---

#### 3.5.2 FR-DASH-02: Analytics events (COULD)

**Requirement** (`RAG S4 F21`): `events.ts:1-22` - `trackEvent(event, props)` via `@vercel/analytics`. Events: `generate_start`, `generate_success`, `generate_fail`, `export`, `provider_switch`, `register`.
**Citation**: `RAG S4 F21`, `RAG S13` (`events.ts:1-22`).

---

### 3.6 Settings / Providers

#### 3.6.1 FR-PROV-01: Provider config CRUD + set active (SHOULD)

**Requirement** (`RAG S3.2, S9.2, S4 F2`): Endpoint:
- `GET /api/v1/settings/providers` - list by userId.
- `POST /api/v1/settings/providers` - create. Body `ProviderConfigSchema`: provider enum `ollama|openrouter|9router|custom` (`schemas.ts:159`), name, baseUrl, model, apiKey (plaintext input -> encrypted sebelum persist).
- `PATCH /api/v1/settings/providers/[id]` - update.
- `DELETE /api/v1/settings/providers/[id]` (atau `/delete`).
- `POST /api/v1/settings/providers/[id]/test` - test (FR-PROV-03).

**Set active**: `provider-config.repo.ts` setActive transaction (`RAG S13`) - `isActive=0` semua provider user, `isActive=1` target. Unique index `(userId, name)` (`schema.ts:30`).
**Citation**: `RAG S4 F2`, `RAG S9.2`, `RAG S13` (`provider-config.repo.ts:1-74`).

---

#### 3.6.2 FR-PROV-02: API key encryption AES-256-GCM (MUST)

**Requirement** (`RAG S10.3, S4 F3`): `aes.ts:4-49`:
- Algo `aes-256-gcm` (`aes.ts:4`).
- Key dari `ENCRYPTION_KEY` env, 32 byte base64 (`aes.ts:6-12`).
- `encryptToString`/`decryptFromString` - IV 12 byte + auth tag (`aes.ts:20-43`).
- `maskApiKey` - `****` + last 4 char (`aes.ts:45-49`).
- API key wajib encrypted sebelum persist `provider_configs.apiKeyEncrypted` (`schema.ts:23`).
- Dipakai: `provider-registry.ts:29`, `llm-client.ts:7,244-254`, `provider-config.repo.ts:5`.
**Citation**: `RAG S4 F3`, `RAG S10.3` (`aes.ts:4-43`).

---

#### 3.6.3 FR-PROV-03: Provider test endpoint (SHOULD)

**Requirement** (`RAG S3.2, S12 G19` ASUMSI): `POST /api/v1/settings/providers/[id]/test` - decrypt key, build endpoint `${baseUrl}/chat/completions`, kirim minimal request (`{model, messages:[{role:'user',content:'ping'}], max_tokens:10}`), return status + latency + response snippet.
**Citation**: `RAG S3.2`, `RAG S12 G19`.

---

#### 3.6.4 FR-PROV-04: Diagnose endpoint (SHOULD)

**Requirement** (`RAG S3.2, S12 G18` ASUMSI): `GET /api/v1/diagnose` - cek:
- DB Turso koneksi (select 1 limit 1).
- Env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY` (base64 32 byte), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `BLOB_READ_WRITE_TOKEN` (opsional), `USE_VERCEL_BLOB`.
- Auth session (jika login, return user.id).
- Provider config active (jika ada, return provider/name/model).
Return `{check, status: 'ok'|'fail', detail}`.
**Citation**: `RAG S3.2`, `RAG S12 G18`.

---

### 3.7 Auth

#### 3.7.1 FR-AUTH-01: Register + login (MUST)

**Requirement** (`RAG S10.1, S10.2, S4 F4`):
- `POST /api/v1/register` (`RAG S3.2`, `RAG S12 G4` ASUMSI `bcrypt.hash`) - create user (`users` `schema.ts:5-14`), hash password bcrypt. Body `RegisterSchema`: email, password, name.
- NextAuth v5 Credentials (`config.ts:11-38`): `authorize` lower email, `findUserByEmail`, `bcrypt.compare` (`config.ts:31`).
- Session: JWT edge-safe jose (`middleware.ts:83-87`). Session augmentation `user.id: number` (`config.ts:42-50`).
- `getSessionUser()` re-fetch fresh by id (`config.ts:53-61`).
- Secret: `NEXTAUTH_SECRET` env wajib (`config.ts:8-9`).
**Citation**: `RAG S4 F4`, `RAG S10.1`, `RAG S10.2`.

---

#### 3.7.2 FR-AUTH-02: Edge middleware gate + rate limit (MUST)

**Requirement** (`RAG S10.4, S4 F5`): `middleware.ts`:
- Edge-safe JWT via `getToken` (jose) (`middleware.ts:83-87`).
- Public paths: `/`, `/login`, `/register`, `/api/auth`, `/api/v1/auth`, `/api/v1/health`, `/_next`, dll (`middleware.ts:6-16`).
- Rate limit in-memory Map single-instance (`middleware.ts:18-36`): 10 req/min per user/IP untuk `/api/v1/generate` (`middleware.ts:109-127`). ASUMSI prod needs Redis (`middleware.ts:18` comment) - out-of-scope this release.
- Locale strip + localize (`middleware.ts:38-54`).
- secureCookie dinamis: `__Secure-` prefix prod HTTPS, no prefix localhost HTTP (`middleware.ts:80-86`).
- matcher: `['/((?!_next/static|_next/image|favicon.ico).*)']` (`middleware.ts:143`).
**Citation**: `RAG S4 F5`, `RAG S10.4` (`middleware.ts:56-140`).

---

### 3.8 i18n

#### 3.8.1 FR-I18N-01: i18n id/en (SHOULD)

**Requirement** (`RAG S3.5, S4 F22`): next-intl v3.26:
- Plugin `createNextIntlPlugin('./src/lib/i18n/request.ts')` (`next.config.ts:2`).
- Routing object `routing` dari `@/lib/i18n/config` (`middleware.ts:4`).
- Lokal: `id`, `en` (`middleware.ts:40`).
- Path segment `[locale]` (`RAG S3.1`).
- Messages: `messages/id.json`, `messages/en.json` (`RAG S12 G12` ASUMSI).
**Citation**: `RAG S4 F22`, `RAG S3.5`.

---

### 3.9 Asset upload & classification

#### 3.9.1 FR-ASSET-01: Asset upload Vercel Blob (SHOULD)

**Requirement** (`RAG S3.2, S3.6, S9.4, S4 F6`): `POST /api/v1/upload` - upload ke Vercel Blob (`@vercel/blob ^0.27.0`, env `BLOB_READ_WRITE_TOKEN`, `USE_VERCEL_BLOB`, `.env.example:13-14`). Persist `asset_references` (`schema.ts:54-68`): tipe enum `tokoh|background|prop|accessory|environment|other` (`schemas.ts:173`), filename, blobUrl, label, mimeType, sizeBytes. Remote pattern `**.public.blob.vercel-storage.com` (`next.config.ts:13`).
**Citation**: `RAG S4 F6`, `RAG S3.6`, `RAG S9.4`.

---

#### 3.9.2 FR-ASSET-02: Image classification V2 Vision LLM (COULD)

**Requirement** (`RAG S3.2, S12 G17` ASUMSI): `POST /api/v1/upload/classify` - `image-classifier.ts` Vision LLM tag asset -> `aiClassification` JSON (`schema.ts:65`).
**Citation**: `RAG S4 F6`, `RAG S3.2`.

---

### 3.10 Templates

#### 3.10.1 FR-TPL-01: Template presets (COULD)

**Requirement** (`RAG S4 F15`): `presets.ts:53-224` - 5 preset (tutorial, cinematic, kids, documentary, action). `template-picker.tsx` UI. `titles.ts` (`RAG S12 G16` ASUMSI).
**Citation**: `RAG S4 F15`.

---

### 3.11 Migration

#### 3.11.1 FR-MIG-01: V2->V3 migration + rollback (SHOULD)

**Requirement** (`RAG S4 F17, S13`): `migration/v2-to-v3.ts:59-142` - backfill scene transition/voice/audio fields + rollback. Trigger manual via admin/CLI (ASUMSI).
**Citation**: `RAG S4 F17`, `RAG S13`.

---

## 4. Data Model / Struktur Data / Skema

> DB = Turso/libSQL (SQLite-compatible). 9 tabel. Timestamp = unixepoch integer. Schema source: `src/lib/db/schema.ts:5-201` (`RAG S9`).

### 4.1 `users` (`schema.ts:5-14`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| email | text | notNull, unique |
| name | text | nullable |
| passwordHash | text | notNull |
| image | text | nullable |
| role | text | notNull default 'user' |
| createdAt | integer | default unixepoch notNull |
| updatedAt | integer | default unixepoch notNull |

### 4.2 `provider_configs` (`schema.ts:17-30`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| userId | integer | -> users.id cascade |
| provider | text | notNull (ollama|openrouter|9router|custom, `schemas.ts:159`) |
| name | text | notNull |
| baseUrl | text | notNull |
| model | text | notNull |
| apiKeyEncrypted | text | nullable (AES-256-GCM ciphertext, `aes.ts`) |
| isActive | integer | notNull default 1 |
| createdAt | integer | default unixepoch |
| updatedAt | integer | default unixepoch |
| Unique index | `(userId, name)` idx_provider_configs_user_name | `schema.ts:30` |

### 4.3 `projects` (`schema.ts:33-51`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| userId | integer | -> users.id cascade |
| title | text | notNull |
| durationType | text | notNull |
| durationTargetSeconds | integer | notNull |
| styleType | text | notNull |
| aspectRatio | text | notNull |
| resultJson | text | nullable (JSON string PromptPackage) |
| status | text | notNull default 'draft' (draft/generating/complete/failed/**partial** - extend FR-GEN-06) |
| storyDescription | text | nullable (V2, max 500) |
| themePreference | text | default 'dark' (V3) |
| createdAt | integer | default unixepoch |
| updatedAt | integer | default unixepoch |
| deletedAt | integer | nullable (soft delete) |
| Index | userId; (userId, createdAt) | |

> **Catatan**: `status` enum string (SQLite tidak enforce enum). FR-GEN-06 menambah nilai `partial` (sudah ada di `generation_logs.status` tapi belum eksplisit di `projects.status`).

### 4.4 `asset_references` (`schema.ts:54-68`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| projectId | integer | -> projects cascade (nullable untuk orphan) |
| tipe | text | notNull (V2 enum: tokoh/background/prop/accessory/environment/other, `schemas.ts:173`) |
| filename | text | notNull |
| blobUrl | text | notNull |
| label | text | nullable |
| mimeType | text | nullable |
| sizeBytes | integer | nullable |
| aiClassification | text | nullable (V2 JSON dari Vision LLM) |
| createdAt | integer | default unixepoch |
| Index | projectId; (projectId, tipe) | |

### 4.5 `characters` (`schema.ts:71-87`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| projectId | integer | -> projects cascade |
| nama, gayarambut, wajahAsal, pakaianAtas, pakaianBawah, alasKaki, deskripsiLatar, aksi, peran | text | notNull |
| createdAt | integer | default unixepoch |
| Unique | (projectId, nama) | |

### 4.6 `scenes` (`schema.ts:90-117`)

| Kolom | Type | Catatan |
|---|---|---|
| id | integer PK autoIncrement | |
| projectId | integer -> projects cascade | |
| orderNo | integer notNull | |
| description | text notNull | |
| voiceoverScript | text notNull | |
| transitionType | text default 'cut' | V3 |
| transitionDurationMs | integer default 0 | V3 |
| transitionEasing | text default 'linear' | V3 |
| transitionDirection | text default 'forward' | V3 |
| voiceType | text default 'narrator' | V3 |
| voiceEmotion | text default 'neutral' | V3 |
| voiceSpeed | real default 1.0 | V3 |
| voicePitch | text default 'auto' | V3 |
| durationSeconds | integer nullable | V3 |
| scenePacing | text default 'normal' | V3 (schema.ts comment "ASUMSI") |
| sceneMood | text nullable | V3 |
| voiceoverSpeaker | text default 'narrator' | V3 |
| createdAt | integer | |
| Unique | (projectId, orderNo) | |

### 4.7 `image_prompts` (`schema.ts:120-144`)

| Kolom | Type | Catatan |
|---|---|---|
| id | integer PK autoIncrement | |
| projectId | integer -> projects cascade | |
| sceneId | integer -> scenes cascade (nullable - master list = null) | |
| tipe | text notNull (tokoh/background) | |
| target | text notNull | |
| promptText | text notNull | |
| referenceFilename | text nullable | |
| composition, lighting, camera | text nullable | V3 8-layer JSON string |
| moodAtmosphere, styleReferences | text nullable | V3 |
| colorPalette | text nullable | V3 JSON string array |
| technical | text nullable | V3 JSON string |
| createdAt | integer | |
| Index | projectId; sceneId; (projectId, tipe); (projectId, sceneId) | |

### 4.8 `generation_logs` (`schema.ts:147-160`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| projectId | integer | -> projects cascade |
| provider | text | notNull |
| model | text | notNull |
| durationMs | integer | nullable |
| status | text | notNull (success/partial/fail) |
| errorMessage | text | nullable (format `[CATEGORY] message`) |
| logsJson | text | nullable (V2 array log entries - extend FR-GEN-05/06: retryCount, correctivePrompt, partialSceneIds) |
| createdAt | integer | default unixepoch |
| Index | projectId; (projectId, createdAt) | |

### 4.9 `supporting_characters` (`schema.ts:163-174`)

| Kolom | Type | Constraint |
|---|---|---|
| id | integer | PK autoIncrement |
| projectId | integer | -> projects cascade |
| sceneId | integer | -> scenes set null (nullable) |
| nama, tipe, aksi | text | notNull |
| createdAt | integer | default unixepoch |

### 4.10 `scene_audio` (V3 NEW, `schema.ts:177-201`)

| Kolom | Type | Catatan |
|---|---|---|
| id | integer PK autoIncrement | |
| projectId | integer -> projects cascade | |
| sceneId | integer -> scenes cascade | |
| audioType | text notNull | |
| description | text notNull | |
| timing | text default 'throughout' | |
| durationSeconds | integer nullable | |
| volume | real default 0.7 | (FR-GEN-09 samakan ke 0.5) |
| fadeInMs | integer default 0 | |
| fadeOutMs | integer default 0 | |
| musicGenre, musicMood | text nullable | |
| musicTempoBpm | integer nullable | |
| musicInstruments | text nullable | |
| musicVolume | real default 0.7 | |
| **sfxList** | **text nullable** | konsisten string DB; normalizer FR-GEN-02 coerce array->string sebelum insert |
| ambientType | text nullable | |
| ambientVolume | real default 0.5 | |
| createdAt | integer | |
| Index | projectId; sceneId; (projectId, sceneId) | |

### 4.11 Relasi

- users 1—N provider_configs (cascade)
- users 1—N projects (cascade)
- projects 1—N asset_references (cascade)
- projects 1—N characters (cascade, unique nama)
- projects 1—N scenes (cascade, unique orderNo)
- projects 1—N image_prompts (cascade); image_prompts.sceneId -> scenes (cascade, nullable master)
- projects 1—N generation_logs (cascade)
- projects 1—N supporting_characters (cascade); sceneId nullable set null
- projects 1—N scene_audio (cascade); scene_audio.sceneId -> scenes (cascade)

---

## 5. Interface / API

> 24 route files (`RAG S3.2`). Format: Method Path - Purpose - Auth. Auth: wajib session JWT kecuali public paths (`middleware.ts:6-16`).

### 5.1 Generation

| Method | Path | Purpose | Auth | Runtime | Citation |
|---|---|---|---|---|---|
| POST | `/api/v1/generate` | SSE generation pipeline. Body `GenerateInputSchema`. Response `text/event-stream`. Stage events + stream_chunk + done/error. maxDuration 300, force-dynamic. | wajib + rate limit 10/min | nodejs | `route.ts:19-21,53-564` |

### 5.2 Auth

| Method | Path | Purpose | Auth | Citation |
|---|---|---|---|---|
| POST | `/api/v1/register` | Register user, bcrypt hash | public | `RAG S3.2`, `RAG S12 G4` |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth v5 Credentials flow | public | `config.ts:11-38` |

### 5.3 Settings / Providers

| Method | Path | Purpose | Auth | Citation |
|---|---|---|---|---|
| GET | `/api/v1/settings/providers` | List provider config by userId | wajib | `RAG S3.2` |
| POST | `/api/v1/settings/providers` | Create provider config (apiKey encrypted) | wajib | `RAG S3.2` |
| PATCH | `/api/v1/settings/providers/[id]` | Update provider config | wajib + ownership | `RAG S3.2` |
| DELETE | `/api/v1/settings/providers/[id]` | Delete provider config | wajib + ownership | `RAG S3.2` |
| POST | `/api/v1/settings/providers/[id]/delete` | Delete provider config (alt path) | wajib + ownership | `RAG S3.2` |
| POST | `/api/v1/settings/providers/[id]/test` | Test provider (ping, latency) | wajib + ownership | `RAG S12 G19` ASUMSI |

### 5.4 Projects

| Method | Path | Purpose | Auth | Citation |
|---|---|---|---|---|
| POST | `/api/v1/projects` | Create project | wajib | `RAG S3.2` |
| GET | `/api/v1/projects` | List projects (filter userId, status, deletedAt null) | wajib | `RAG S3.2` |
| GET | `/api/v1/projects/[id]` | Get project by id | wajib + ownership | `RAG S3.2` |
| PATCH | `/api/v1/projects/[id]` | Update project | wajib + ownership | `RAG S3.2` |
| DELETE | `/api/v1/projects/[id]` | Soft delete project | wajib + ownership | `RAG S3.2` |
| POST | `/api/v1/projects/bulk-delete` | Bulk soft delete | wajib + ownership | `RAG S3.2` |
| PATCH | `/api/v1/projects/[id]/theme` | Set themePreference | wajib + ownership | `RAG S3.2` |
| GET | `/api/v1/projects/[id]/image-prompts` | List image prompts | wajib + ownership | `RAG S3.2` |
| DELETE | `/api/v1/projects/[id]/delete` | Hard/soft delete alt | wajib + ownership | `RAG S3.2` |
| GET | `/api/v1/projects/[id]/characters` | List characters | wajib + ownership | `RAG S3.2` |
| GET/POST | `/api/v1/projects/[id]/scenes` | List/create scenes | wajib + ownership | `RAG S3.2` |
| GET | `/api/v1/projects/[id]/export` | Export Markdown | wajib + ownership | `RAG S4 F16` |
| GET | `/api/v1/projects/[id]/logs` | List generation logs | wajib + ownership | `RAG S4 F18` |
| GET/POST | `/api/v1/projects/[id]/scenes/[sceneId]/audio` | List/create scene audio | wajib + ownership | `RAG S4 F11` |
| PATCH/DELETE | `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]` | Update/delete scene audio | wajib + ownership | `RAG S4 F11` |

### 5.5 Upload

| Method | Path | Purpose | Auth | Citation |
|---|---|---|---|---|
| POST | `/api/v1/upload` | Upload asset ke Vercel Blob | wajib | `RAG S3.2` |
| POST | `/api/v1/upload/classify` | V2 Vision classification | wajib | `RAG S3.2` |

### 5.6 Dashboard & Diagnose

| Method | Path | Purpose | Auth | Citation |
|---|---|---|---|---|
| GET | `/api/v1/dashboard/stats` | Dashboard stats | wajib | `RAG S3.2` |
| GET | `/api/v1/diagnose` | Diagnose (DB, env, auth, provider) | wajib | `RAG S12 G18` ASUMSI |
| GET | `/api/v1/health` | Health check | public | `RAG S3.2` |

### 5.7 Error response envelope (ASUMSI dari `src/lib/api/error.ts`)

`errorResponse(code, status, msg, details)` (`route.ts:4`). Shape ASUMSI:
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```
Kategori error (`llm-client.ts:18-44`): `TIMEOUT`, `NETWORK`, `VALIDATION`, `HTTP`, `JSON_PARSE`, `UNKNOWN`. Extend `DB_ERROR` untuk DB failure (FR-GEN-06).

---

## 6. Constraint Teknis KONKRET

### 6.1 DB Turso/libSQL

- Engine: Turso/libSQL (SQLite-compatible hosted) - BUKAN Postgres (`RAG S2`).
- Driver: `@libsql/client ^0.14.0` (`package.json:25`, `client.ts:2`).
- ORM: `drizzle-orm ^0.38.0` sqlite-core (`package.json:47`, `schema.ts:2`).
- Migration: `drizzle-kit ^0.30.0` dialect turso (`drizzle.config.ts:18`).
- Env wajib: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` (`client.ts:6-10`).
- Casing: `snake_case` (`client.ts`).
- **Constraint**: SQLite concurrency write terbatas. Hindari concurrent heavy write. Partial persist acceptable (no rollback) - `RAG S11 Bug D` by design.
- Timestamp: unixepoch integer.

### 6.2 NextAuth v5 Credentials flow

- Provider: Credentials (email+password) (`config.ts:14-19`).
- `authorize`: lower email, `findUserByEmail`, `bcrypt.compare` (`config.ts:20-34`).
- Session strategy: JWT (edge-safe jose, `middleware.ts:83-87`).
- Session augmentation: `user.id: number` (`config.ts:42-50`).
- Secret: `NEXTAUTH_SECRET` env wajib (`config.ts:8-9`).
- Edge config terpisah `authConfig` dari `@/lib/auth/edge` (`config.ts:6`, ASUMSI berisi pages.signIn + callbacks).

### 6.3 AES-256-GCM key encryption

- Algo `aes-256-gcm` (`aes.ts:4`).
- Key dari `ENCRYPTION_KEY` env, 32 byte base64 (`aes.ts:6-12`).
- IV 12 byte + auth tag (`aes.ts:20-35`).
- `encryptToString`/`decryptFromString` JSON serialized (`aes.ts:37-43`).
- `maskApiKey` `****` + last 4 char (`aes.ts:45-49`).

### 6.4 Rate limit

- In-memory Map single-instance (`middleware.ts:18-36`): 10 req/min per user/IP untuk `/api/v1/generate` (`middleware.ts:109-127`).
- ASUMSI prod needs Redis (`middleware.ts:18` comment) - out-of-scope this release.

### 6.5 i18n

- next-intl v3.26 (`package.json:52`).
- Lokal: `id`, `en` (`middleware.ts:40`).
- Plugin `createNextIntlPlugin('./src/lib/i18n/request.ts')` (`next.config.ts:2`).
- Routing object `routing` dari `@/lib/i18n/config` (`middleware.ts:4`).
- Messages: `messages/id.json`, `messages/en.json` (ASUMSI isi lengkap, `RAG S12 G12`).

### 6.6 SSE / runtime

- `/api/v1/generate` runtime nodejs, maxDuration 300 (Vercel Pro), force-dynamic (`route.ts:19-21`).
- fetch timeout 600_000ms = 600s (`llm-client.ts:284-289`). ASUMSI samakan ke 300s match Vercel maxDuration (`NFR-PERF-05`).
- Heartbeat 2s (`route.ts:213-220`).
- max_tokens 32768 default (`llm-client.ts:270`); 65536 attempt stream:false (FR-GEN-03 ASUMSI).
- SSE headers: `text/event-stream`, `no-cache`, `X-Accel-Buffering: no` (`route.ts:557-563`).

### 6.7 LLM provider

- Provider enum `ollama|openrouter|9router|custom` (`schemas.ts:159`).
- OpenAI-compatible endpoint (`@ai-sdk/openai-compatible`, `provider-registry.ts:2`).
- Endpoint build: `${baseUrl}/chat/completions` (`llm-client.ts:256-257`).
- Body: `{model, messages, max_tokens, temperature, stream}` (`llm-client.ts:267-274`).
- Provider "tokenrouter" + model "MiniMax-M3" = ASUMSI dari log user (`RAG S12 G8`), kemungkinan disimpan sebagai `custom`. Tidak hardcode.

### 6.8 Blob storage

- `@vercel/blob ^0.27.0` (`package.json:41`).
- Env `BLOB_READ_WRITE_TOKEN`, `USE_VERCEL_BLOB` (`.env.example:13-14`).
- Remote pattern `**.public.blob.vercel-storage.com` (`next.config.ts:13`).

### 6.9 serverActions experiment

- ASUMSI: `next.config.ts` mungkin aktifkan `serverActions` experiment (tidak diverifikasi di RAG). Bila ada, server actions untuk form submit - tetapi route utama generasi pakai SSE route handler, bukan server action.

### 6.10 Env vars wajib (`.env.example:1-17`)

| Var | Purpose | Wajib? |
|---|---|---|
| `TURSO_DATABASE_URL` | DB URL | YA (`client.ts:9`) |
| `TURSO_AUTH_TOKEN` | DB auth | YA (`client.ts:10`) |
| `ENCRYPTION_KEY` | AES key 32 byte base64 | YA (`aes.ts:8`) |
| `NEXTAUTH_SECRET` | JWT secret | YA (`config.ts:9`) |
| `NEXTAUTH_URL` | Auth base URL | YA |
| `NEXT_PUBLIC_APP_URL` | public app URL, OpenRouter referer (`provider-registry.ts:36`) | YA |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | opsional (`USE_VERCEL_BLOB=false`) |
| `USE_VERCEL_BLOB` | toggle blob | opsional |

---

## 7. Security Constraints

| ID | Constraint | Bukti |
|---|---|---|
| SEC-01 | API key provider wajib AES-256-GCM encrypted sebelum persist `provider_configs.apiKeyEncrypted` | `aes.ts:4-43`, `RAG S10.3` |
| SEC-02 | Password hash bcrypt (register `bcrypt.hash` ASUMSI, authorize `bcrypt.compare`) | `config.ts:31`, `RAG S10.2`, `RAG S12 G4` |
| SEC-03 | CSRF via NextAuth v5 (Credentials flow, JWT, same-site cookie) | `config.ts:11-38`, `RAG S10.1` |
| SEC-04 | Rate limit 10 req/min per user/IP untuk `/api/v1/generate` | `middleware.ts:109-127`, `RAG S10.4` |
| SEC-05 | Middleware auth gate: 401 untuk non-public path tanpa session | `middleware.ts:56-140`, `RAG S10.4` |
| SEC-06 | Ownership check setiap project/provider/log endpoint: verify `userId === session.user.id` | `NFR-SEC-08`, `RAG S5` step 5 |
| SEC-07 | No secrets in repo (`.env.local` tidak dibaca, `.env.example` hanya nama key) | `RAG S12 G3` |
| SEC-08 | secureCookie dinamis: `__Secure-` prefix prod HTTPS, no prefix localhost HTTP | `middleware.ts:80-86` |
| SEC-09 | server-only guard cegah modul server di-import client | `package.json:58`, `RAG S2` |
| SEC-10 | Edge-safe JWT via jose (`getToken`) - tidak pakai Node crypto di edge | `middleware.ts:83-87`, `RAG S10.4` |

---

## 8. Tahapan Implementasi Teknis (urut, actionable)

> Tiap fase: deliverable + verifikasi. Selaras `PRD S8` deliverable + `BRD S8.1` in-scope.

### 8.1 Fase 1: Fix Bug A + Bug B + validation feedback loop (MUST - core reliability)

**Deliverable**:
1. **D1 Prompt contract fix** (`src/lib/ai/prompt-builder.ts`):
   - Ubah `buildSystemPrompt()` blok `AUDIO_SPECS` (`prompt-builder.ts:152`): deklarasi `sfx_list` array of string + contoh.
   - Tambah 1 audio_spec `sfx` + `sfx_list` di `JSON_SCHEMA_EXAMPLE` (`prompt-builder.ts:75-97`).
   - Tambah instruksi escape newline/tab di blok `PENTING`.
2. **D2 Schema fix** (`src/lib/validation/schemas.ts`):
   - Ubah `SceneAudioSpecSchema.sfx_list` (`schemas.ts:52`) ke `z.union([z.string(), z.array(z.string())]).nullable().optional()`.
   - Samakan default `volume` `SceneAudioSchema` (`schemas.ts:88`) ke 0.5 konsisten `SceneAudioSpecSchema`.
3. **D3 Normalizer** (`src/app/api/v1/generate/route.ts:376-407`):
   - Sebelum `scene_audio` insert: `Array.isArray(audio.sfx_list) ? audio.sfx_list.join(', ') : audio.sfx_list`.
4. **D4 Retry vary request** (`src/lib/ai/llm-client.ts:237-424`):
   - Rebuild `requestJson` per attempt. Attempt 2: tambah corrective message + temp 0.5. Attempt 3 (maxRetries naik ke 3): `stream:false` + `max_tokens:65536` + temp 0.3 + jitter.
5. **D5 JSON repair hardening** (`src/lib/ai/llm-client.ts:50-100`):
   - Tambah `sanitizeJsonString()`: strip BOM, normalize line ending, escape control char mentah di dalam string value, handle trailing data, handle escape rusak.
   - Urutan: `extractJsonFromContent` -> `sanitizeJsonString` -> (`JSON.parse` || `repairTruncatedJson` -> `JSON.parse`).
6. **D6 Validation error feedback** (`src/lib/ai/llm-client.ts:279-414`):
   - Catch `ZodError`, extract issues, format corrective message, append ke `messages` role 'user', log ke `logsJson` entry `{stage:'retry_correction', attempt, prevErrorCategory, prevErrorIssues, correctivePrompt, timestamp}`.

**Verifikasi Fase 1**:
- `pnpm dev`, submit generate shorts 3-5 scene dengan input memicu `audio_type:'sfx'` (mis. storyDescription "hutan dengan langkah kaki dan pintu berderit").
- Cek log server: 0 error `VALIDATION` kategori `sfx_list` "Expected string, received array".
- Cek log: 0 error `JSON_PARSE` untuk output panjang.
- Cek DB `scene_audio.sfxList` terisi string comma-separated.
- `pnpm test src/lib/validation/schemas.test.ts` - assert union terima array + string.
- `pnpm test src/lib/ai/llm-client.test.ts` - assert retry vary (messages length, temp, stream, max_tokens), repair hardening, corrective message.
- `pnpm test src/lib/ai/prompt-builder.test.ts` - assert prompt mengandung `sfx_list` + contoh `sfx`.
- `pnpm test` (vitest full) - semua pass.
- `pnpm lint` + `pnpm format` - 0 error.

### 8.2 Fase 2: Observability + partial persist (MUST - tutup Bug D + FR-LOG-01)

**Deliverable**:
7. **D7 SSE partial + log category** (`src/app/api/v1/generate/route.ts:310-513,520-548`):
   - Track `partialSceneIds: number[]` selama DB persist loop.
   - Set `projects.status='partial'` bila `partialSceneIds` non-empty.
   - `done` event sertakan `partialSceneIds`.
   - Unhandled catch pakai `categorizeError` spesifik + kategori `DB_ERROR` untuk DB failure.
8. **D8 Generation log lengkap** (`src/lib/db/repositories/generation-log.repo.ts`, `route.ts`):
   - `logsJson` wajib array: stage events, retryCount, correctivePrompt (Fase 1 D6), error detail, partialSceneIds.
   - Extend repository untuk query aggregate retryCount stats.
9. **D9 Persist partial eksplisit UI** (`src/components/generate/result-tabs.tsx`):
   - Tampilkan warning "Scene {partialSceneIds} gagal persist - regenerate perlu" bila `partialSceneIds` non-empty.

**Verifikasi Fase 2**:
- `pnpm dev`, submit generate, mock `bulkCreateScenes` throw (via env test flag atau integration test).
- Cek `projects.status='partial'` (bukan `complete`).
- Cek `done` event SSE `partialSceneIds` non-empty.
- Cek `generation_logs.status='partial'`, `logsJson` array berisi retryCount + correctivePrompt + partialSceneIds.
- Cek UI `result-tabs.tsx` tampilkan warning.
- `pnpm test` integration partial persist pass.

### 8.3 Fase 3: Hardening + tests (MUST - NFR-REL + NFR-MAINT)

**Deliverable**:
10. **D10 API key encryption verify** (`src/lib/crypto/aes.ts`): verifikasi `provider-registry.ts:29`, `llm-client.ts:7,244-254`, `provider-config.repo.ts:5` pakai encrypt/decrypt. Tidak ada plaintext API key di DB.
11. **D11 Auth + middleware verify** (`src/lib/auth/config.ts`, `src/middleware.ts`, `src/app/api/v1/register/route.ts`): verifikasi register `bcrypt.hash`. Pertahankan middleware gate + rate limit.
12. **Test suite**:
    - Unit test: `schemas.test.ts` (sfx_list union, color_palette union), `llm-client.test.ts` (retry vary, repair hardening, corrective message), `prompt-builder.test.ts` (sfx_list deklarasi + contoh), `route.test.ts` (partial persist, categorize error).
    - Integration test: SSE generate flow end-to-end dengan mock LLM.
    - E2E `pnpm e2e` (Playwright): generate shorts 3-5 scene sukses, generate tutorial 8-15 scene sukses, error categorize tampil di UI.
    - Coverage target >= 80% pipeline generasi (`NFR-MAINT-06` ASUMSI).

**Verifikasi Fase 3**:
- `pnpm test --coverage` - coverage >= 80% untuk `src/lib/ai/`, `src/lib/validation/schemas.ts`, `src/app/api/v1/generate/route.ts`.
- `pnpm e2e` - semua E2E pass.
- `pnpm build` - 0 type error, 0 lint error.
- `pnpm lint` + `pnpm format` - 0 error.
- Submit 100 generate (mix shorts + tutorial + sfx scene) via script/E2E - hitung success rate >= 95% (`AC-KPI-01`).
- Cek `generation_logs` - 0 silent failure (semua error ter-kategorisasi).

---

## 9. Verifikasi & Pengujian (Definition of Done teknis)

### 9.1 Verifikasi per fase

| Fase | Verifikasi command/action | Expected result |
|---|---|---|
| Fase 1 | `pnpm dev` + submit generate sfx scene | 0 VALIDATION sfx_list, 0 JSON_PARSE output panjang, DB sfxList string |
| Fase 1 | `pnpm test src/lib/validation/schemas.test.ts` | union terima array + string pass |
| Fase 1 | `pnpm test src/lib/ai/llm-client.test.ts` | retry vary (messages, temp, stream, max_tokens) pass, repair hardening pass, corrective message pass |
| Fase 1 | `pnpm test src/lib/ai/prompt-builder.test.ts` | prompt sfx_list deklarasi + contoh sfx pass |
| Fase 1 | `pnpm test` (vitest full) | semua pass |
| Fase 1 | `pnpm lint` + `pnpm format` | 0 error |
| Fase 2 | `pnpm dev` + mock bulkCreateScenes throw | projects.status='partial', done event partialSceneIds, generation_logs.status='partial', UI warning |
| Fase 2 | `pnpm test` integration partial persist | pass |
| Fase 3 | `pnpm test --coverage` | >= 80% pipeline generasi |
| Fase 3 | `pnpm e2e` | semua E2E pass |
| Fase 3 | `pnpm build` | 0 type error, 0 lint error |
| Fase 3 | 100 generate script | success rate >= 95%, 0 silent failure |

### 9.2 Definition of Done teknis (gate release)

- [ ] Bug A FIXED: `sfx_list` schema union + prompt eksplisit + normalizer. 0 VALIDATION sfx_list error pada 100 generate.
- [ ] Bug B FIXED: `repairTruncatedJson` + sanitizer handle newline/control char/escape/trailing. 0 JSON_PARSE error pada 100 generate output panjang.
- [ ] Retry vary request: attempt 2+ tambah corrective message + temp variabel. Unit test pass.
- [ ] Partial persist: `projects.status='partial'` + `partialSceneIds` di done event + UI warning. Integration test pass.
- [ ] Generation log lengkap: `logsJson` array (retryCount, correctivePrompt, partialSceneIds). Unit test pass.
- [ ] Error categorize: 0 generic `PROVIDER_ERROR`, semua spesifik (TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE/DB_ERROR/UNKNOWN).
- [ ] API key encryption: 0 plaintext API key di DB. Unit test `aes.test.ts` pass.
- [ ] Auth + middleware: register bcrypt.hash, login bcrypt.compare, rate limit 10/min, 401 non-session. E2E pass.
- [ ] Coverage >= 80% pipeline generasi.
- [ ] E2E pass: shorts 3-5 scene, tutorial 8-15 scene, sfx scene, error categorize UI.
- [ ] `pnpm build` + `pnpm lint` + `pnpm format` 0 error.
- [ ] KPI `AC-KPI-01`: success rate >= 95% pada 100 generate.

### 9.3 Test framework

- Unit: vitest ^2.1 + @vitejs/plugin-react ^4.3 + @vitest/coverage-v8 ^2.1 (`package.json:84,72,73`).
- E2E: @playwright/test ^1.49 (`package.json:64`).
- Coverage target: >= 80% pipeline generasi (`NFR-MAINT-06` ASUMSI).
- Test files eksisting (ASUMSI isi): `schemas.test.ts`, `project.repo.test.ts`, `log-buffer.test.ts`, `consistency-checker.test.ts`, `markdown.template.test.ts` + `e2e/` + `tests/` (`RAG S12 G10`).

---

## 10. Asumsi (diturunkan dari RAG S12 + PRD S10)

| ID | Asumsi | Dampak SRS |
|---|---|---|
| AS1 | Provider "tokenrouter" + "MiniMax-M3" dari log user, tak ada di repo (`RAG G8`) | FR-GEN tidak hardcode provider; multi-provider tetap; `custom` menampung |
| AS2 | Register pakai `bcrypt.hash` (`RAG G4`, route tak dibaca) | FR-AUTH-01 asumsi; verifikasi Fase 3 |
| AS3 | `authConfig` edge config berisi pages.signIn + callbacks + jwt (`RAG G5`) | FR-AUTH-02 asumsi |
| AS4 | Scene audio CRUD endpoint konsisten schema duplikat (`RAG G6`) | FR-GEN-09 verifikasi turunan |
| AS5 | Komponen UI generate ada & fungsional (9 file, isi tak dibaca, `RAG G7`) | FR-GEN-06 UI partial warning asumsi |
| AS6 | Blob helper ada di `src/lib/storage/` (`RAG G9`) | FR-ASSET-01 asumsi |
| AS7 | Test coverage eksplisit tak diketahui (`RAG G10`) | NFR-MAINT-06 target >= 80% asumsi |
| AS8 | maxRetries naik ke 3 (`RAG S8.2.3` default 2) | FR-GEN-03 attempt 3 asumsi hardening |
| AS9 | `messages/id.json`, `en.json` isi lengkap (`RAG G12`) | FR-I18N-01 asumsi |
| AS10 | Endpoint diagnose/test/dashboard isi (`RAG G18-G20`) | FR-PROV-03/04, FR-DASH-01 asumsi |
| AS11 | fetch timeout 600s samakan ke 300s match Vercel (`NFR-PERF-05`) | ASUMSI hardening |
| AS12 | serverActions experiment di next.config.ts (tak diverifikasi) | ASUMSI - route utama pakai SSE route handler |

---

## 11. Sitasi (RAG-CONTEXT.md + BRD + MRD + PRD)

| Klaim SRS | Sitasi | Bukti kode |
|---|---|---|
| Arsitektur App Router + modul lib | `RAG S3.1` | `next.config.ts`, `src/app/api/**/*.ts`, `src/lib/**` |
| API routes 24 file | `RAG S3.2` | glob `src/app/api/**/*.ts` |
| Tech stack + versi | `RAG S2` | `package.json:22-90` |
| DB Turso/libSQL BUKAN Postgres | `RAG S2` koreksi | `client.ts:2-13`, `drizzle.config.ts:18`, `schema.ts:2` |
| Generation pipeline flow | `RAG S5` | `route.ts:53-564`, `llm-client.ts:237-424` |
| Bug A sfx_list root cause | `RAG S6.4, S11 Bug A` | `schemas.ts:52`, `prompt-builder.ts:75-97,152` |
| Bug B JSON parse root cause | `RAG S8.2.2, S11 Bug B` | `llm-client.ts:50-100,274,287,284-289` |
| Bug D partial persist | `RAG S11 Bug D` | `route.ts:35-51,316` |
| Schema duplikat Bug F | `RAG S6.3, S11 Bug F` | `schemas.ts:39-55,83-99` |
| categorizeError | `RAG S8.2.3` | `llm-client.ts:18-44` |
| extractJsonFromContent | `RAG S8.2.1` | `llm-client.ts:106-165` |
| repairTruncatedJson | `RAG S8.2.2` | `llm-client.ts:50-100` |
| Retry tak vary | `RAG S8.2.3` | `llm-client.ts:274,287` |
| PromptPackageSchema | `RAG S6` | `schemas.ts:106-124` |
| SceneAudioSpecSchema | `RAG S6.1` | `schemas.ts:39-55` |
| SceneSchema | `RAG S6.2` | `schemas.ts:57-75` |
| 8-layer image prompt | `RAG S6.2, S4 F12` | `schemas.ts:19-31`, `prompt-builder.ts:150` |
| DB scene_audio.sfxList text | `RAG S9.10` | `schema.ts:193` |
| Generation logs | `RAG S9.8, S4 F18` | `schema.ts:147-160`, `generation-log.repo.ts:1-32` |
| AES-256-GCM | `RAG S10.3, S4 F3` | `aes.ts:4-43` |
| NextAuth v5 | `RAG S10.1, S4 F4` | `config.ts:11-38` |
| Middleware rate limit | `RAG S10.4, S4 F5` | `middleware.ts:18-36,109-127` |
| Multi-provider | `RAG S4 F2` | `schemas.ts:159`, `provider-registry.ts:12-16` |
| Export Markdown | `RAG S4 F16` | `markdown.template.ts:4-173` |
| Consistency checker | `RAG S4 F19` | `consistency-checker.ts:19-38` |
| Template presets | `RAG S4 F15` | `presets.ts:53-224` |
| i18n id/en | `RAG S4 F22, S3.5` | `middleware.ts:38-54`, `next.config.ts:2` |
| Vercel Blob | `RAG S3.6, S4 F6` | `next.config.ts:13`, `.env.example:13-14` |
| Analytics | `RAG S4 F21` | `events.ts:1-22` |
| Dashboard | `RAG S4 F8` | `dashboard.repo.ts` |
| Diagnose/test endpoint | `RAG S12 G18, G19` | route files (isi ASUMSI) |
| Data model 9 tabel | `RAG S9` | `schema.ts:5-201` |
| Env vars | `RAG S10.5` | `.env.example:1-17` |
| KPI bisnis | `BRD S4` | - |
| Scope in/out | `BRD S8.1, S8.2`, `PRD S9` | - |
| Risiko | `BRD S7` | - |
| FR mapping | `PRD S5` | - |
| Deliverable | `PRD S8` | - |
| AC | `PRD S7` | - |
| Gaps/ASUMSI | `RAG S12 G1-G20` | - |

---

> Dokumen ini fokus pada TEKNIS: arsitektur, tech stack, spesifikasi fungsional detail, data model, interface/API, constraint teknis konkret, tahapan implementasi, verifikasi. Selaras BRD (why) + MRD (who) + PRD (what) -> SRS (how). Dokumen turunan: DATABASE_SCHEMA, PROJECT_ARCHITECTURE, UIUX_SPEC, API_CONTRACT, CODING_RULES, TEST_PLAN, AGENTS.md.
