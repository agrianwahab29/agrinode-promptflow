# PRD.md - PromptFlow Product Requirement Document

> Disusun oleh docgen-prd. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `BRD.md` + `MRD.md`.
> Klaim faktual bertumpu pada RAG. Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis apa adanya.
> Fokus PRD: PRODUK - visi, persona, user story, fitur MoSCoW, functional & non-functional requirement, acceptance criteria, spesifikasi deliverable.

---

## 1. Ringkasan Produk & Visi

### 1.1 Ringkasan produk

PromptFlow adalah web app Next.js 15 App Router (TypeScript strict) yang menggenerate **paket prompt animasi AI terstruktur** (`PromptPackage`) untuk short-form video / shorts / vertical storytelling. Output tunggal: JSON object tervalidasi Zod, di-persist ke DB Turso/libSQL, dapat di-export Markdown (`RAG-CONTEXT.md S1, S4 F1, F16`).

Struktur output inti (`PromptPackageSchema`, `schemas.ts:106-124`):
- `title`, `duration_target {type,seconds}`, `style {type,aspect_ratio}`
- `character_profiles[]` - karakter konsisten lintas scene
- `scenes[]` - order, description, voiceover_script, voiceover_speaker, image_prompts (8-layer), audio_specs[], transition_type/duration/easing/direction, voice_type/emotion/speed/pitch, duration_seconds, scene_pacing, scene_mood
- `image_prompts {characters[],backgrounds[]}` - master reference list, 8-layer (target, prompt_text 80-200 kata, reference_filename, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical)
- `supporting_characters[]`
- `moral_message`

Stack inti (`RAG S2`): Next.js 15.1 App Router, React 19, TypeScript strict, Zod 3.24, Drizzle ORM 0.38 + libSQL/Turso, NextAuth v5 beta, Vercel AI SDK 4, next-intl 3.26 (id/en), Tailwind 4, shadcn/ui, Vercel Blob.

### 1.2 Visi produk

**Visi**: Menjadi pipeline generasi AI content **paling reliable** untuk vertical video - output tervalidasi schema, multi-provider, dapat di-export siap pakai. Bukan tool "coba sampai jalan", melainkan pipeline yang **menjamin paket prompt sampai jadi, atau menunjukkan kenapa gagal** (`MRD S5.3`).

**Visi teknis produk**: Pipeline generasi LLM yang **deterministik untuk field kunci** (sfx_list, audio_type, color_palette), **adaptif untuk retry** (vary request, bukan body identik), **observable** (kategori error + log + dashboard), dan **transparan terhadap pengguna** (SSE streaming + pesan error actionable).

**Why now** (`BRD S1, S2`): Produk v0.1.0 private mengalami kegagalan generasi deterministik (Bug A: `sfx_list` schema/prompt mismatch; Bug B: JSON parse fail output panjang). Tanpa fix, produk tidak dapat keluar dari status private. Fix reliability = landasan beta publik + monetisasi.

---

## 2. Persona & Job-to-be-Done

> Persona diturunkan dari `MRD S3`. Pain point utama lintas persona: **"generation keeps failing"** (`BRD S2`, `RAG S11`). Pain ini yang PRD wajib tutup.

### 2.1 Persona tabel

| ID | Persona | Demografi (ASUMSI) | Goal utama | Frustrasi (grounded) | Bukti fitur terkait |
|---|---|---|---|---|---|
| P1 | **Rina - Indie Shorts Creator** | 22-32 thn, solo, TikTok/Shorts, 3-5 scene/30-60s | Generate paket prompt siap pakai <90s, langsung pakai ke Midjourney/Runway | Generate gagal di scene dengan `audio_type:'sfx'`; retry sia-sia; token terbuang; error generic tak actionable | `BRD S4` time-to-first-success shorts <=90s; `RAG S11 Bug A` |
| P2 | **Bayu - Tutorial Educator** | 28-45 thn, course maker, tutorial 7-15 menit, 8-15 scene | Output 8-15 scene terstruktur + export Markdown untuk handoff | Output panjang >14KB -> JSON parse fail; `repairTruncatedJson` tak handle newline mentah/control char; 2/2 attempt gagal | `BRD S4` tutorial <=180s; `RAG S8.2.2`; `RAG S4 F16` export |
| P3 | **Studio Kecil - Agency Producer** | Tim 3-10, butuh konsistensi karakter antar scene, handoff ke artist/editor | Paket prompt reusable + export Markdown handoff; audit log generate | Inkonsistensi karakter antar scene; partial persist bug (scene hilang tapi status `complete`); API key management | `RAG S4 F19` consistency-checker; `RAG S11 Bug D`; `RAG S4 F3` AES-256-GCM |
| P4 | **Dev/Tinkerer - Local LLM User** | Pengguna Ollama lokal, eksperimen pipeline | Provider-agnostic, BYO API key aman, observability | API key kebocoran; provider lock-in; tak ada log retry/attempts | `RAG S4 F2` multi-provider; `RAG S4 F3` AES; `RAG S4 F18` generation logs |
| P5 | **Dina - Vertical Storyteller** | Cerita pendek moral-driven (kids/fable) | Karakter konsisten + moral message otomatis + audio ambient/sfx | Output bebas tanpa struktur moral; hallucination field di luar schema; `sfx_list` array reject | `RAG S6` PromptPackage root `moral_message`; `RAG S4 F15` kids preset; `RAG S11 Bug A` |

### 2.2 Job-to-be-Done (JTBD)

| Persona | Job | Outcome yang diharapkan |
|---|---|---|
| P1 Rina | "Saat saya butuh storyboard shorts 3-5 scene, saya ingin generate paket prompt lengkap (karakter+scene+image 8-layer+audio+voiceover+moral) yang langsung valid dan siap pakai, sehingga saya tidak habiskan jam kerja untuk retry." | Sukses >=95%, <90s, output valid, export siap pakai |
| P2 Bayu | "Saat saya bikin tutorial 8-15 scene, saya ingin output panjang tervalidasi tanpa JSON parse fail, sehingga saya bisa handoff Markdown ke editor." | Sukses >=95%, <180s, export Markdown, repair JSON robust |
| P3 Studio | "Saat tim saya kolaborasi, saya ingin paket prompt konsisten + audit log generate + API key aman, sehingga handoff ke artist aman." | Konsistensi karakter ter-check, log generate tersimpan, API key encrypted |
| P4 Dev | "Saat saya eksperimen pipeline, saya ingin provider choice + log retry, sehingga saya bisa ganti provider tanpa lock-in." | 4 provider enum, BYO key encrypted, generation log dengan retryCount |
| P5 Dina | "Saat saya bikin cerita moral kids, saya ingin struktur moral + audio sfx tanpa reject schema, sehingga output konsisten." | `moral_message` wajib, `sfx_list` valid (string atau array coerced), kids preset |

### 2.3 Pain "generation keeps failing" - dekomposisi

Pain inti lintas persona (`BRD S2`): **generate gagal deterministik**. Dekomposisi produk:

| Sub-pain | Root cause (cited) | Persona terdampak | FR yang menutup |
|---|---|---|---|
| "Generate gagal di scene sfx" | `sfx_list` schema string vs LLM array; prompt ambigu (`schemas.ts:52`, `prompt-builder.ts:152`) | P1, P5 | FR-GEN-01, FR-GEN-02 |
| "Retry sia-sia, gagal identik" | Retry tak ubah request body (`llm-client.ts:274,287`) | P1, P2, P5 | FR-GEN-03 |
| "Output panjang JSON parse fail" | `repairTruncatedJson` tak handle newline/control char/escape (`llm-client.ts:50-100`) | P2 | FR-GEN-04 |
| "Error tak jelas kenapa" | Kategori error ada tapi pesan generic "PROVIDER_ERROR" (`route.ts:238-264`) | Semua | FR-GEN-05, FR-GEN-06 |
| "Data scene hilang tapi status complete" | `safeDbOp` swallow error (`route.ts:35-51`, Bug D) | P3 | FR-GEN-06, FR-PERSIST-01 |

---

## 3. User Stories

Dikelompokkan per area. Format: `Sebagai [persona], saya ingin [aksi], sehingga [nilai].` Prioritas MoSCoW di S4.

### 3.1 Generation (area inti - fix reliability)

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-GEN-01 | Sebagai Rina, saya ingin generate paket prompt scene/character/voiceover/image-prompt 8-layer/audio-spec/moral yang **selalu tervalidasi schema** (>=95% sukses), sehingga saya tidak buang waktu retry. | MUST | FR-GEN-01, FR-GEN-02 |
| US-GEN-02 | Sebagai Bayu, saya ingin saat validasi gagal di attempt 1, **retry mengubah prompt** (bukan kirim body identik) dengan feedback korektif, sehingga retry punya peluang sukses beda. | MUST | FR-GEN-03, FR-GEN-05 |
| US-GEN-03 | Sebagai Bayu, saya ingin output panjang (>14KB) yang truncate/salah-escape **ter-repair** (handle newline mentah, control char, escape rusak), sehingga JSON parse sukses pada attempt 2. | MUST | FR-GEN-04 |
| US-GEN-04 | Sebagai semua persona, saya ingin **error dikategorisasi + pesan actionable** (bukan generic "PROVIDER_ERROR"), sehingga saya tahu apakah perlu ganti provider, perbaiki input, atau retry. | MUST | FR-GEN-05, FR-GEN-06 |
| US-GEN-05 | Sebagai Studio, saya ingin saat persist DB gagal partial, **status `partial` eksplisit + scene yang hilang dilaporkan**, sehingga saya tahu data mana yang perlu regenerate. | MUST | FR-GEN-06, FR-PERSIST-01 |
| US-GEN-06 | Sebagai Rina, saya ingin **SSE streaming** menampilkan progress stage (starting -> character_profiles -> llm_calling -> saving -> done), sehingga saya tahu pipeline jalan. | SHOULD | FR-GEN-07 |
| US-GEN-07 | Sebagai Dev, saya ingin **generation log** mencatat provider, model, durationMs, status, errorMessage, retryCount, sehingga saya bisa audit pipeline. | MUST | FR-GEN-06, FR-LOG-01 |

### 3.2 Projects management

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-PROJ-01 | Sebagai semua persona, saya ingin **CRUD project** (create, list, get, update, delete, soft-delete, bulk-delete), sehingga saya kelola storyboard. | SHOULD | FR-PROJ-01 |
| US-PROJ-02 | Sebagai Studio, saya ingin **theme preference** (dark/light/system) per project, sehingga tim lihat konsisten. | COULD | FR-PROJ-02 |
| US-PROJ-03 | Sebagai Bayu, saya ingin **orphan asset references** auto-attach ke project baru, sehingga upload reference tidak hilang. | SHOULD | FR-PROJ-03 |

### 3.3 Export

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-EXP-01 | Sebagai Bayu, saya ingin **export project ke Markdown** terstruktur (karakter, scene, image prompt, audio spec, moral), sehingga saya handoff ke editor. | SHOULD | FR-EXP-01 |
| US-EXP-02 | Sebagai Studio, saya ingin export Markdown **menyertakan transition spec + voiceover + audio spec lengkap**, sehingga artist tahu pacing. | SHOULD | FR-EXP-01 |

### 3.4 History / Logs

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-LOG-01 | Sebagai Dev, saya ingin **list generation logs per project** (status success/partial/fail, errorMessage, durationMs), sehingga saya diagnose pipeline. | MUST | FR-LOG-01 |
| US-LOG-02 | Sebagai Rina, saya ingin **log viewer** menampilkan stage events + stream chunks + error, sehingga saya pahami kenapa gagal. | SHOULD | FR-LOG-02 |
| US-LOG-03 | Sebagai Dev, saya ingin **in-memory log buffer** (max 500 entries, `log-buffer.ts:1-34`) untuk observability real-time, sehingga saya debug tanpa DB query. | COULD | FR-LOG-03 |

### 3.5 Dashboard analytics

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-DASH-01 | Sebagai Dev, saya ingin **dashboard stats** (total project, generate count, success/fail ratio, provider distribution), sehingga saya pantau reliability. | SHOULD | FR-DASH-01 |
| US-DASH-02 | Sebagai Bos Agrian, saya ingin **analytics events** track (generate_start, generate_success, generate_fail, export, provider_switch), sehingga saya ukur activation funnel. | COULD | FR-DASH-02 |

### 3.6 Settings / Providers

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-PROV-01 | Sebagai Dev, saya ingin **CRUD provider config** (ollama/openrouter/9router/custom) + set active, sehingga saya ganti LLM tanpa lock-in. | SHOULD | FR-PROV-01 |
| US-PROV-02 | Sebagai Dev, saya ingin **API key encrypted** AES-256-GCM + mask display, sehingga key tidak bocor. | MUST | FR-PROV-02 |
| US-PROV-03 | Sebagai Dev, saya ingin **test provider endpoint** (ping provider dengan config), sehingga saya verifikasi provider jalan sebelum generate. | SHOULD | FR-PROV-03 |
| US-PROV-04 | Sebagai Dev, saya ingin **diagnose endpoint** (cek koneksi, env, DB, auth), sehingga saya troubleshoot setup. | SHOULD | FR-PROV-04 |

### 3.7 Auth

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-AUTH-01 | Sebagai semua persona, saya ingin **register + login** (Credentials email+password, bcrypt), sehingga data project saya privat. | MUST | FR-AUTH-01 |
| US-AUTH-02 | Sebagai Dev, saya ingin **edge middleware** gate auth + rate limit 10 req/min untuk `/api/v1/generate`, sehingga pipeline tidak di-abuse. | MUST | FR-AUTH-02 |

### 3.8 i18n

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-I18N-01 | Sebagai Rina (pasar ID), saya ingin UI **Bahasa Indonesia**, sehingga saya pakai tanpa barrier bahasa. | SHOULD | FR-I18N-01 |
| US-I18N-02 | Sebagai global user, saya ingin UI **English**, sehingga pasar global bisa pakai. | SHOULD | FR-I18N-01 |

### 3.9 Asset upload & classification

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-ASSET-01 | Sebagai Studio, saya ingin **upload asset reference** (tokoh/background/prop/accessory/environment/other) ke Vercel Blob, sehingga image prompt pakai reference. | SHOULD | FR-ASSET-01 |
| US-ASSET-02 | Sebagai Studio, saya ingin **AI classification** (Vision LLM) otomatis tag asset, sehingga saya tidak label manual. | COULD | FR-ASSET-02 |

### 3.10 Templates

| ID | User Story | Prioritas | FR terkait |
|---|---|---|---|
| US-TPL-01 | Sebagai Rina, saya ingin **template presets** (tutorial, cinematic, kids, documentary, action) sebagai starting point, sehingga saya tidak mulai blank. | COULD | FR-TPL-01 |

---

## 4. MoSCoW Prioritization

> Selaras `BRD S8.1` (in-scope: reliability fix) + `BRD S8.2` (out-of-scope: fitur baru tak terkait). MUST = tutup Bug A & B + observability + persist reliability.

### 4.1 MUST (wajib untuk release - tutup pain "generation keeps failing")

| ID | Fitur | Alasan MUST | FR |
|---|---|---|---|
| M1 | **Prompt contract eksplisit tipe `sfx_list`** | Tutup Bug A root cause - prompt ambigu (`prompt-builder.ts:152`) | FR-GEN-01 |
| M2 | **Zod schema `sfx_list` longgar + normalizer** | Schema terima type LLM natural (string/array) + coerce aman sebelum DB | FR-GEN-02 |
| M3 | **Retry vary request (prompt korektif + parameter variabel)** | Retry body identik = gagal deterministik (`llm-client.ts:274,287`) | FR-GEN-03 |
| M4 | **JSON repair hardening** (newline mentah, control char, escape rusak, trailing data) | Tutup Bug B root cause (`llm-client.ts:50-100`) | FR-GEN-04 |
| M5 | **Validation error feedback ke LLM sebagai corrective prompt** | Retry dengan konteks error = peluang sukses beda | FR-GEN-05 |
| M6 | **SSE pipeline persist partial + log failure category** | Eliminasi silent failure (`BRD S3 G2`) | FR-GEN-06 |
| M7 | **Generation log lengkap** (provider, model, durationMs, status, errorMessage, retryCount) | Observability - KPI `BRD S4` | FR-LOG-01 |
| M8 | **Persist reliability** - status `partial` eksplisit, scene hilang dilaporkan, evaluasi `safeDbOp` | Tutup Bug D (`route.ts:35-51`) | FR-PERSIST-01 |
| M9 | **API key encryption AES-256-GCM** | Security baseline (`aes.ts:4-43`) | FR-PROV-02 |
| M10 | **Auth register + login + edge middleware gate + rate limit** | Akses privat + abuse prevention (`middleware.ts:109-127`) | FR-AUTH-01, FR-AUTH-02 |

### 4.2 SHOULD (penting, nilai tinggi, release bersama MUST bila resource cukup)

| ID | Fitur | Alasan SHOULD | FR |
|---|---|---|---|
| S1 | Provider test endpoint | Verifikasi provider sebelum generate (`RAG S12 G19`) | FR-PROV-03 |
| S2 | Diagnose endpoint | Troubleshoot setup (`RAG S12 G18`) | FR-PROV-04 |
| S3 | Image classification (V2 Vision LLM) | Auto-tag asset (`RAG S4 F6`) | FR-ASSET-02 |
| S4 | Dashboard stats | Pantau reliability (`dashboard.repo.ts`) | FR-DASH-01 |
| S5 | Project CRUD + soft delete + bulk-delete | Kelola storyboard (`project.repo.ts:33-65`) | FR-PROJ-01 |
| S6 | Export Markdown lengkap (transition+voiceover+audio) | Handoff agency (`markdown.template.ts:4-173`) | FR-EXP-01 |
| S7 | Orphan asset reference auto-attach | Upload reference tidak hilang (`route.ts:148-159`) | FR-PROJ-03 |
| S8 | Provider config CRUD + set active | Ganti LLM tanpa lock-in (`provider-config.repo.ts`) | FR-PROV-01 |
| S9 | Log viewer (stage events + stream + error) | User pahami kenapa gagal (`log-viewer.tsx`) | FR-LOG-02 |
| S10 | Asset upload Vercel Blob | Image prompt pakai reference (`upload/route.ts`) | FR-ASSET-01 |
| S11 | i18n id/en | Pasar ID + global (`middleware.ts:38-54`) | FR-I18N-01 |
| S12 | SSE streaming progress stage | User tahu pipeline jalan (`route.ts:163-554`) | FR-GEN-07 |

### 4.3 COULD (nice-to-have, defer bila resource terbatas)

| ID | Fitur | Alasan COULD | FR |
|---|---|---|---|
| C1 | Template presets tambahan (tutorial/cinematic/kids/documentary/action sudah ada, tambah baru) | `RAG S4 F15` - nice-to-have | FR-TPL-01 |
| C2 | Theme preference per project | `RAG S4 F20` - UX polish | FR-PROJ-02 |
| C3 | In-memory log buffer (max 500) | `log-buffer.ts:1-34` - debug real-time | FR-LOG-03 |
| C4 | Analytics events (Vercel Analytics) | `events.ts:1-22` - funnel tracking | FR-DASH-02 |
| C5 | Consistency checker warning UI | `consistency-checker.ts:19-38` sudah ada, polish UI | FR-GEN-08 |

### 4.4 WON'T (this release - eksplisit di luar)

| ID | Item | Alasan WON'T | Bukti |
|---|---|---|---|
| W1 | Fitur baru tak terkait reliability generasi | Scope creep - fokus fix Bug A/B | `BRD S8.2` |
| W2 | Migrasi DB engine (Tetap Turso/libSQL) | Bukan Postgres - koreksi RAG | `RAG S2` |
| W3 | Ganti framework (Tetap Next.js 15 App Router) | Stabilkan dulu | `RAG S2` |
| W4 | LLM training/fine-tuning sendiri | Out-of-scope | `BRD S8.2` |
| W5 | Mobile native app | Out-of-scope | `BRD S8.2` |
| W6 | Payment gateway / billing | Private package, no billing di repo | `BRD S8.2`, `RAG S12` |
| W7 | Analytics custom engine (ganti Vercel Analytics) | Tetap `@vercel/analytics` | `BRD S8.2` |
| W8 | Marketplace template | Fitur baru | `BRD S8.2` |

---

## 5. Functional Requirements

> Detail per fitur. Input -> Proses -> Output. Grounded di RAG (cite file:line).

### 5.1 Generation pipeline FRs (tutup Bug A & B - area MUST)

#### FR-GEN-01: Prompt contract eksplisit tipe `sfx_list`

**Root problem**: Prompt `prompt-builder.ts:152` hanya bilang "Untuk sfx: sfx_list." tanpa tipe data, tanpa contoh. LLM natural kirim array.

**Requirement**: System prompt (`buildSystemPrompt`, `prompt-builder.ts:137-168`) WAJIB:
1. Deklarasikan `sfx_list` tipe eksplisit: **string comma-separated**, contoh `"footstep,door creak,wind"`.
2. Tambah **contoh audio_spec dengan `audio_type:'sfx'` + `sfx_list` string** di `JSON_SCHEMA_EXAMPLE` (`prompt-builder.ts:75-97`). Saat ini contoh hanya `ambient` + `background_music`, tidak ada `sfx`.
3. Tambah instruksi escape: "Jangan gunakan newline mentah dalam string value, gunakan `\n` escape."
4. Konsistenkan enum `audio_type` dan `timing` di prompt dengan schema (lihat FR-GEN-02 - schema longgar, prompt boleh tetap enum untuk guide LLM).

**Input**: `GenerateInput` (title, duration, style, storyDescription, references, numScenes, providerId/projectId).
**Proses**: `buildSystemPrompt()` return string prompt dengan deklarasi tipe `sfx_list` + contoh `sfx` + instruksi escape.
**Output**: System prompt string deterministik untuk field `sfx_list`.

**Acceptance**: Lihat S7.1 AC-GEN-01.

**Citation**: `RAG S7.1` (`prompt-builder.ts:137-168`), `RAG S7.3` (`prompt-builder.ts:75-97` contoh audio_specs tanpa sfx), `RAG S11 Bug A` diagnosis.

---

#### FR-GEN-02: Zod schema `sfx_list` longgar + normalizer ke DB

**Root problem**: `SceneAudioSpecSchema.sfx_list: z.string().nullable().optional()` (`schemas.ts:52`) reject array. DB column `scene_audio.sfxList: text` (`schema.ts:193`) konsisten string.

**Target design** (rekomendasi RAG Opsi 2, `RAG S11`):
1. Ubah `SceneAudioSpecSchema.sfx_list` (`schemas.ts:52`) menjadi `z.union([z.string(), z.array(z.string())]).nullable().optional()` - terima string atau array (pola sudah ada untuk `color_palette` di `schemas.ts:29`).
2. Tambah **normalizer** di `route.ts:376-407` (audio save block) sebelum DB insert: `Array.isArray(audio.sfx_list) ? audio.sfx_list.join(', ') : audio.sfx_list`. Pola normalizer array->string sudah ada untuk `color_palette` di `route.ts:429,446,472,480` (`JSON.stringify`).
3. Konsistenkan `SceneAudioSpecSchema` (`schemas.ts:39-55`) vs `SceneAudioSchema` duplikat (`schemas.ts:83-99`) - pilih satu source of truth (rekomendasi: `SceneAudioSpecSchema` longgar untuk generate, `SceneAudioSchema` strict enum untuk audio CRUD endpoint terpisah - lihat FR-GEN-09). Default volume 0.5 vs 0.7 wajib disamakan (`RAG S6.3`, Bug F).

**Input**: `parsedJson` dari LLM (bisa `sfx_list` array atau string).
**Proses**: `PromptPackageSchema.parse(parsedJson)` - union terima keduanya -> normalizer coerce array ke string sebelum `scene_audio` DB insert.
**Output**: `scene_audio.sfxList` text (string comma-separated) konsisten DB.

**Acceptance**: Lihat S7.1 AC-GEN-02.

**Citation**: `RAG S6.1` (`schemas.ts:39-55`), `RAG S6.3` (duplikat), `RAG S11 Bug A` Opsi 2 rekomendasi, `RAG S9.10` (`schema.ts:193` sfxList text).

---

#### FR-GEN-03: Retry vary request (prompt korektif + parameter variabel)

**Root problem**: `requestJson` di-build sekali di `llm-client.ts:274`, fetch pakai `body: requestJson` sama (`llm-client.ts:287`). Retry gagal identik untuk bug deterministik.

**Requirement**: Retry loop (`llm-client.ts:279-414`) WAJIB vary request per attempt:
1. **Attempt 1**: body original (temp 0.7, stream true, max_tokens 32768).
2. **Attempt 2** (jika attempt 1 fail): tambah **corrective prompt** ke messages - lihat FR-GEN-05. Turunkan temp ke 0.5. Tambah suffix system prompt: "Attempt sebelumnya gagal karena [kategori error]. Perbaiki: [detail]."
3. **Attempt 3** (opsional, bila `maxRetries` dinaikkan ke 3): gunakan `stream:false` + `max_tokens:65536` (ASUMSI - untuk output panjang yang truncate saat stream). Turunkan temp ke 0.3.
4. Backoff adaptif: 2s, 4s (`llm-client.ts:408-412` dipertahankan), attempt 3+ tambah jitter random 0-1s untuk hindari thundering herd.

**Input**: error kategori dari attempt sebelumnya (`categorizeError`, `llm-client.ts:18-44`).
**Proses**: Rebuild `requestJson` per attempt dengan messages + parameter variabel.
**Output**: Request body berbeda per attempt -> peluang sukses beda.

**Acceptance**: Lihat S7.1 AC-GEN-03.

**Citation**: `RAG S8.2.3` (`llm-client.ts:279-414,274,287`), `BRD S7 R1` (temp variabel), `RAG S11 Bug B` fix rekomendasi (stream:false + max_tokens besar).

---

#### FR-GEN-04: JSON repair hardening

**Root problem**: `repairTruncatedJson` (`llm-client.ts:50-100`) tidak handle:
- Newline literal mentah di dalam string value (JSON standar larang).
- Escape sequence rusak (`\"` terpotong).
- Control char (tab mentah `\t`).
- Trailing data setelah JSON valid.
- Hanya close bracket, tidak reconstruct value corrupt.

**Requirement**: Upgrade `repairTruncatedJson` (`llm-client.ts:50-100`) WAJIB:
1. **Pre-parse sanitizer** sebelum `JSON.parse` (`llm-client.ts:358`): strip BOM, normalize line ending (`\r\n` -> `\n`), escape control char mentah di dalam string value (deteksi string boundary, replace `\n`/`\t`/`\r` mentah dengan `\\n`/`\\t`/`\\r`).
2. **Handle trailing data**: setelah JSON valid terdeteksi (brace match), strip trailing non-whitespace.
3. **Handle escape rusak**: deteksi `\"` unterminated, tambah closing quote.
4. **Handle duplicate key**: log warning, ambil value terakhir (JSON.parse default).
5. Pertahankan strategi existing: hapus trailing `"key":` tanpa value, hapus trailing comma, stack bracket/brace matching.

**Input**: `jsonStr` raw dari `extractJsonFromContent` (`llm-client.ts:106-165`).
**Proses**: Sanitize -> repair -> `JSON.parse`.
**Output**: `parsedJson` valid atau throw `Response bukan JSON valid: <err>` (`llm-client.ts:373`).

**Acceptance**: Lihat S7.1 AC-GEN-04.

**Citation**: `RAG S8.2.2` (`llm-client.ts:50-100` keterbatasan), `RAG S11 Bug B` fix rekomendasi, `RAG S8.2.1` (`extractJsonFromContent`).

---

#### FR-GEN-05: Validation error feedback ke LLM sebagai corrective prompt

**Root problem**: Saat `PromptPackageSchema.parse` gagal (`llm-client.ts:379`), error `ZodError` di-kategori `VALIDATION` (`llm-client.ts:28-36`) tapi tidak di-feedback ke LLM. Retry kirim prompt sama.

**Requirement**: Pada retry attempt 2+, WAJIB:
1. Format `ZodError.issues` (`llm-client.ts:388-394` sudah categorize) jadi **corrective message**: "Validasi gagal di field: [path]. Error: [message]. Expected: [expected]. Received: [received]. Perbaiki output JSON agar sesuai schema."
2. Tambah corrective message ke `messages` array sebagai `role: 'system'` atau `role: 'user'` suffix.
3. Kirim ke LLM pada retry (lihat FR-GEN-03).
4. Log corrective message ke `generation_logs.logsJson` (`schema.ts:155` V2 array log entries).

**Input**: `ZodError` dari `PromptPackageSchema.parse` (`llm-client.ts:379`).
**Proses**: Extract issues -> format corrective message -> append ke messages -> retry.
**Output**: LLM dapat konteks error -> output diperbaiki pada retry.

**Acceptance**: Lihat S7.1 AC-GEN-05.

**Citation**: `RAG S8.2.3` (`llm-client.ts:379,388-394`), `RAG S11 Bug A` fix rekomendasi.

---

#### FR-GEN-06: SSE pipeline persist partial + log failure category

**Root problem**: `safeDbOp` (`route.ts:35-51`) swallow error, return null, lanjut. Project status `complete` (`route.ts:316`) meski scene hilang (Bug D). Unhandled catch (`route.ts:520-548`) kirim generic `PROVIDER_ERROR`.

**Requirement**:
1. **Persist partial success**: setelah LLM return valid `PromptPackage` (`route.ts:268-298`), persist ke DB. Jika ada `safeDbOp` gagal (mis. `bulkCreateScenes` null), **status project = `partial`** (bukan `complete`), dan **scene yang gagal dilaporkan** di `done` event (`route.ts:518`).
2. **Log failure category**: `generation_logs.status` (`schema.ts:154`) wajib `success`/`partial`/`fail` (`RAG S9.8`). `errorMessage` wajib format `[CATEGORY] message` (`llm-client.ts:422-423`). `logsJson` (`schema.ts:155`) wajib array log entries (stage events, stream chunks, error).
3. **Eliminasi generic error**: unhandled catch (`route.ts:520-548`) wajib kategori error spesifik (bukan default `PROVIDER_ERROR`). Gunakan `categorizeError` (`llm-client.ts:18-44`).
4. **Heartbeat** (`route.ts:213-220`) dipertahankan - kirim `elapsedSec` tiap 2s.

**Input**: `validated` PromptPackage + DB persist result.
**Proses**: Persist -> check partial -> set status -> log -> SSE done event.
**Output**: `done` event `{result, warnings, generationLogId, partialSceneIds?}` + `generation_logs` row lengkap.

**Acceptance**: Lihat S7.1 AC-GEN-06.

**Citation**: `RAG S5` step 13-18 (`route.ts:238-264,310-513,520-548`), `RAG S11 Bug D`, `RAG S9.8` (`schema.ts:147-160`).

---

#### FR-GEN-07: SSE streaming progress stage

**Requirement**: Pertahankan SSE (`route.ts:163-554`, `RAG S5` step 7-8). Stage events: `starting` -> `character_profiles` -> `llm_calling` -> `saving` -> `done`. Heartbeat 2s. Stream chunks relayed via `stream_chunk` event (`route.ts:226-228`). Headers: `text/event-stream`, `no-cache`, `X-Accel-Buffering: no` (`route.ts:557-563`).

**Acceptance**: Client terima SSE events sesuai stage.

**Citation**: `RAG S3.2`, `RAG S5` step 7-8.

---

#### FR-GEN-08: Consistency checker (COULD - polish)

**Requirement**: Pertahankan `checkConsistency(validated)` (`route.ts:496`, `consistency-checker.ts:19-38`) -> warnings[] karakter ref mismatch. Polish UI warning di `result-tabs.tsx`.

**Citation**: `RAG S4 F19`, `RAG S5` step 16.

---

#### FR-GEN-09: Konsistensi schema duplikat (MUST - bagian FR-GEN-02)

**Requirement**: Konsolidasi `SceneAudioSpecSchema` (`schemas.ts:39-55`) vs `SceneAudioSchema` (`schemas.ts:83-99`):
- `SceneAudioSpecSchema` (longgar) = source of truth untuk `SceneSchema.audio_specs` (generate pipeline). `sfx_list` union string|array (FR-GEN-02).
- `SceneAudioSchema` (strict enum) = untuk audio CRUD endpoint terpisah (`scene-audio.repository.ts`). Samakan default volume (0.5 vs 0.7 -> pilih satu, rekomendasi 0.5 konsisten `SceneAudioSpecSchema`).
- Dokumen DATABASE_SCHEMA + API_CONTRACT turunan wajib verifikasi.

**Citation**: `RAG S6.3`, `RAG S11 Bug F`, `BRD S7 R3`.

### 5.2 Projects management FRs

#### FR-PROJ-01: Project CRUD + soft delete + bulk-delete

**Requirement**: Endpoint (`RAG S3.2`):
- `POST /api/v1/projects` - create.
- `GET /api/v1/projects` - list (filter by userId, status, deletedAt null).
- `GET /api/v1/projects/[id]` - get by id (verify ownership).
- `PATCH /api/v1/projects/[id]` - update (title, storyDescription, themePreference).
- `DELETE /api/v1/projects/[id]` - soft delete (`deletedAt` set, `schema.ts:49`).
- `POST /api/v1/projects/bulk-delete` - bulk soft delete.

Repository: `project.repo.ts:33-65` (`RAG S9.3`). Ownership check wajib.

**Citation**: `RAG S4 F7`, `RAG S9.3` (`schema.ts:33-51`).

---

#### FR-PROJ-02: Theme preference (COULD)

**Requirement**: `PATCH /api/v1/projects/[id]/theme` - set `themePreference` (`schema.ts:44`, `dark`/`light`/`system`).

**Citation**: `RAG S4 F20`, `RAG S9.3`.

---

#### FR-PROJ-03: Orphan asset reference auto-attach

**Requirement**: Saat create project baru, orphan `asset_references` (projectId null atau orphan flag) auto-attach (`route.ts:148-159`). Non-fatal jika gagal.

**Citation**: `RAG S5` step 6, `RAG S9.4`.

---

### 5.3 Export FRs

#### FR-EXP-01: Export Markdown lengkap

**Requirement**: `GET /api/v1/projects/[id]/export` -> Markdown. Template `markdown.template.ts:4-173` (`RAG S4 F16`) wajib menyertakan:
- Title, duration, style.
- `character_profiles[]` lengkap.
- `scenes[]`: order, description, voiceover_script, voiceover_speaker, transition spec (type/duration/easing/direction), voice spec (type/emotion/speed/pitch), duration_seconds, scene_pacing, scene_mood.
- `image_prompts` per scene (8-layer: target, prompt_text, reference_filename, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical).
- `audio_specs[]` per scene (audio_type, description, timing, volume, fade, music_*, ambient_*, sfx_list).
- `supporting_characters[]`.
- `moral_message`.

**Citation**: `RAG S4 F16`, `RAG S6` PromptPackage struktur.

---

### 5.4 History / Logs FRs

#### FR-LOG-01: Generation log lengkap (MUST)

**Requirement**: `generation_logs` (`schema.ts:147-160`, `RAG S9.8`) wajib catat:
- `provider`, `model` - dari provider config.
- `durationMs` - dari POST masuk hingga done/fail.
- `status` - `success`/`partial`/`fail`.
- `errorMessage` - format `[CATEGORY] message` (`llm-client.ts:422-423`).
- `logsJson` - array log entries (stage events, stream chunks summary, error detail, retryCount, correctivePrompt).
- `createdAt` - unixepoch.

Endpoint: `GET /api/v1/projects/[id]/logs` - list logs per project. Repository: `generation-log.repo.ts:1-32`.

**Acceptance**: Lihat S7.1 AC-LOG-01.

**Citation**: `RAG S4 F18`, `RAG S9.8` (`schema.ts:147-160`).

---

#### FR-LOG-02: Log viewer (SHOULD)

**Requirement**: `log-viewer.tsx` (`RAG S4 F18`) menampilkan stage events, stream chunks, error kategori, retryCount.

**Citation**: `RAG S4 F18`, `RAG S3.1` (`components/generate/log-viewer.tsx`).

---

#### FR-LOG-03: In-memory log buffer (COULD)

**Requirement**: `log-buffer.ts:1-34` (`RAG S4`) - max 500 entries, FIFO, untuk observability real-time tanpa DB query.

**Citation**: `RAG S13` (`log-buffer.ts:1-34`).

---

### 5.5 Dashboard analytics FRs

#### FR-DASH-01: Dashboard stats (SHOULD)

**Requirement**: `GET /api/v1/dashboard/stats` (`RAG S3.2`) -> total project, generate count, success/fail/partial ratio, provider distribution. Repository: `dashboard.repo.ts` (`RAG S12 G20` - isi ASUMSI).

**Citation**: `RAG S4 F8`, `RAG S3.2`.

---

#### FR-DASH-02: Analytics events (COULD)

**Requirement**: `events.ts:1-22` (`RAG S4 F21`) - `trackEvent(event, props)` via `@vercel/analytics`. Events: `generate_start`, `generate_success`, `generate_fail`, `export`, `provider_switch`, `register`.

**Citation**: `RAG S4 F21`, `RAG S13` (`events.ts:1-22`).

---

### 5.6 Settings / Providers FRs

#### FR-PROV-01: Provider config CRUD + set active (SHOULD)

**Requirement**: Endpoint (`RAG S3.2`):
- `GET /api/v1/settings/providers` - list by userId.
- `POST /api/v1/settings/providers` - create (provider enum `ollama|openrouter|9router|custom`, `schemas.ts:159`; name, baseUrl, model, apiKeyEncrypted).
- `PATCH /api/v1/settings/providers/[id]` - update.
- `DELETE /api/v1/settings/providers/[id]` (atau `/delete`).
- `POST /api/v1/settings/providers/[id]/test` - test provider (FR-PROV-03).

Set active: `provider-config.repo.ts` setActive transaction (`RAG S13`). Unique index `(userId, name)` (`schema.ts:30`).

**Citation**: `RAG S4 F2`, `RAG S9.2` (`schema.ts:17-30`), `RAG S13`.

---

#### FR-PROV-02: API key encryption AES-256-GCM (MUST)

**Requirement**: `aes.ts:4-43` (`RAG S10.3`):
- Algo `aes-256-gcm`, key dari `ENCRYPTION_KEY` env (32 byte base64).
- `encryptToString`/`decryptFromString` - IV 12 byte + auth tag.
- `maskApiKey` - `****` + last 4 char (`aes.ts:45-49`).
- API key wajib encrypted sebelum persist `provider_configs.apiKeyEncrypted` (`schema.ts:23`).
- Dipakai: `provider-registry.ts:29`, `llm-client.ts:7,244-254`, `provider-config.repo.ts:5`.

**Acceptance**: Lihat S7.1 AC-PROV-02.

**Citation**: `RAG S4 F3`, `RAG S10.3` (`aes.ts:4-43`).

---

#### FR-PROV-03: Provider test endpoint (SHOULD)

**Requirement**: `POST /api/v1/settings/providers/[id]/test` (`RAG S3.2`, `RAG S12 G19` - isi ASUMSI) - ping provider dengan config (decrypt key, build endpoint `${baseUrl}/chat/completions`, kirim minimal request, return status + latency).

**Citation**: `RAG S3.2`, `RAG S12 G19`.

---

#### FR-PROV-04: Diagnose endpoint (SHOULD)

**Requirement**: `GET /api/v1/diagnose` (`RAG S3.2`, `RAG S12 G18` - isi ASUMSI) - cek koneksi DB Turso, env vars (`TURSO_*`, `ENCRYPTION_KEY`, `NEXTAUTH_*`, `BLOB_*`), auth session, provider config active. Return status per check.

**Citation**: `RAG S3.2`, `RAG S12 G18`.

---

### 5.7 Auth FRs

#### FR-AUTH-01: Register + login (MUST)

**Requirement**:
- `POST /api/v1/register` (`RAG S3.2`, `RAG S12 G4` - ASUMSI pakai `bcrypt.hash`) - create user (`users` table, `schema.ts:5-14`), hash password bcrypt.
- NextAuth v5 Credentials (`config.ts:11-38`): `authorize` lower email, `findUserByEmail`, `bcrypt.compare` (`config.ts:31`).
- Session: JWT (edge-safe, `middleware.ts:83-87` pakai `getToken` jose). Session augmentation `user.id: number` (`config.ts:42-50`).
- Secret: `NEXTAUTH_SECRET` env wajib (`config.ts:8-9`).

**Acceptance**: Lihat S7.1 AC-AUTH-01.

**Citation**: `RAG S4 F4`, `RAG S10.1` (`config.ts:11-38`), `RAG S10.2`.

---

#### FR-AUTH-02: Edge middleware gate + rate limit (MUST)

**Requirement**: `middleware.ts` (`RAG S10.4`):
- Edge-safe JWT via `getToken` (jose) (`middleware.ts:83-87`).
- Public paths: `/`, `/login`, `/register`, `/api/auth`, `/api/v1/auth`, `/api/v1/health`, `/_next`, dll (`middleware.ts:6-16`).
- Rate limit in-memory Map: 10 req/min per user/IP untuk `/api/v1/generate` (`middleware.ts:109-127`). ASUMSI prod needs Redis (`middleware.ts:18` comment).
- Locale strip + localize (`middleware.ts:38-54`).
- secureCookie dinamis: HTTPS prod -> `__Secure-`, localhost HTTP -> no prefix (`middleware.ts:80-86`).

**Acceptance**: Lihat S7.1 AC-AUTH-02.

**Citation**: `RAG S4 F5`, `RAG S10.4` (`middleware.ts:56-140`).

---

### 5.8 i18n FRs

#### FR-I18N-01: i18n id/en (SHOULD)

**Requirement**: next-intl v3.26 (`RAG S3.5`):
- Plugin `createNextIntlPlugin('./src/lib/i18n/request.ts')` (`next.config.ts:2`).
- Routing object `routing` dari `@/lib/i18n/config` (`middleware.ts:4`).
- Lokal: `id`, `en` (`middleware.ts:40`).
- Path segment `[locale]` (`RAG S3.1`).
- Messages: `messages/id.json`, `messages/en.json` (`RAG S12 G12` - isi ASUMSI).

**Citation**: `RAG S4 F22`, `RAG S3.5`.

---

### 5.9 Asset upload & classification FRs

#### FR-ASSET-01: Asset upload Vercel Blob (SHOULD)

**Requirement**: `POST /api/v1/upload` (`RAG S3.2`) - upload ke Vercel Blob (`@vercel/blob ^0.27.0`, env `BLOB_READ_WRITE_TOKEN`, `USE_VERCEL_BLOB`, `.env.example:13-14`). Persist `asset_references` (`schema.ts:54-68`): tipe enum `tokoh|background|prop|accessory|environment|other` (`schemas.ts:173`), filename, blobUrl, label, mimeType, sizeBytes.

**Citation**: `RAG S4 F6`, `RAG S3.6`, `RAG S9.4`.

---

#### FR-ASSET-02: Image classification V2 Vision LLM (COULD)

**Requirement**: `POST /api/v1/upload/classify` (`RAG S3.2`) - `image-classifier.ts` (`RAG S12 G17` - isi ASUMSI) Vision LLM tag asset -> `aiClassification` JSON (`schema.ts:65`).

**Citation**: `RAG S4 F6`, `RAG S3.2`.

---

### 5.10 Templates FRs

#### FR-TPL-01: Template presets (COULD)

**Requirement**: `presets.ts:53-224` (`RAG S4 F15`) - 5 preset (tutorial, cinematic, kids, documentary, action). `template-picker.tsx` UI. `titles.ts` (`RAG S12 G16` - ASUMSI).

**Citation**: `RAG S4 F15`.

---

### 5.11 Persist reliability FRs (MUST - tutup Bug D)

#### FR-PERSIST-01: Persist partial eksplisit + scene hilang dilaporkan

**Root problem**: `safeDbOp` (`route.ts:35-51`) swallow error, return null. `bulkCreateScenes` null -> audio/image prompts scene-level skip (`route.ts:366-367`) tapi status `complete` (`route.ts:316`).

**Requirement**:
1. Bila ada `safeDbOp` gagal (return null), **status project = `partial`** (bukan `complete`).
2. `done` event (`route.ts:518`) wajib sertakan `partialSceneIds` (scene yang gagal persist audio/image).
3. `generation_logs.status` = `partial` (`route.ts:502-513` sudah ada logic partial jika warnings, extend untuk partial persist).
4. UI `result-tabs.tsx` wajib tampilkan warning scene hilang.
5. ASUMSI keputusan bisnis: **tidak ada rollback transaksi** (partial success acceptable, `RAG S11 Bug D` by design) - tapi status dan laporan wajib eksplisit.

**Acceptance**: Lihat S7.1 AC-PERSIST-01.

**Citation**: `RAG S5` step 15 (`route.ts:310-493`), `RAG S11 Bug D`, `RAG S13` (`route.ts:35-51`).

---

### 5.12 Migration FRs (SHOULD - maintain V2->V3)

#### FR-MIG-01: V2->V3 migration + rollback

**Requirement**: `migration/v2-to-v3.ts:59-142` (`RAG S4 F17`) - backfill scene transition/voice/audio fields + rollback. Trigger manual via admin/CLI (ASUMSI - endpoint tidak diverifikasi).

**Citation**: `RAG S4 F17`, `RAG S13`.

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Requirement | Target | Bukti/ASUMSI |
|---|---|---|---|
| NFR-PERF-01 | Generation latency p95 | < 60s (ASUMSI target - `BRD S4` shorts <=90s, tutorial <=180s median) | `BRD S4` KPI; ASUMSI p95 |
| NFR-PERF-02 | Time-to-first-success shorts | <= 90s median | `BRD S4`, `generation_logs.durationMs` |
| NFR-PERF-03 | Time-to-first-success tutorial | <= 180s median | `BRD S4` |
| NFR-PERF-04 | maxDuration Vercel | 300s (`route.ts:19`) | `RAG S3.2` |
| NFR-PERF-05 | fetch timeout | 600s (`llm-client.ts:284-289`) - ASUMSI samakan ke 300s match Vercel | `RAG S8.2.3` |
| NFR-PERF-06 | Heartbeat SSE | 2s (`route.ts:213-220`) | `RAG S5` step 10 |
| NFR-PERF-07 | max_tokens | 32768 default (`llm-client.ts:270`); 65536 untuk attempt stream:false (ASUMSI) | `RAG S8.2.3` |
| NFR-PERF-08 | DB query | Turso/libSQL SQLite - ASUMSI <100ms per query untuk skema current | `RAG S2` |

### 6.2 Reliability

| ID | Requirement | Target | Bukti |
|---|---|---|---|
| NFR-REL-01 | Generation success rate | >= 95% (`success`+`partial`)/total | `BRD S4` KPI |
| NFR-REL-02 | Validation pass rate attempt 1 | >= 98% | `BRD S4` |
| NFR-REL-03 | Repair success rate | >= 90% pada JSON_PARSE error | `BRD S4` |
| NFR-REL-04 | Retry-recovery rate | >= 70% generate sukses setelah >=1 retry | `BRD S4` |
| NFR-REL-05 | Silent failure rate | 0% - seluruh error ter-kategorisasi | `BRD S4`, `categorizeError` (`llm-client.ts:18-44`) |
| NFR-REL-06 | Retry count | max 2 default (`llm-client.ts:238`); ASUMSI naik ke 3 untuk hardening | `RAG S8.2.3` |
| NFR-REL-07 | Backoff | 2s, 4s (`llm-client.ts:408-412`); +jitter attempt 3 | `RAG S8.2.3` |

### 6.3 Security

| ID | Requirement | Target | Bukti |
|---|---|---|---|
| NFR-SEC-01 | API key encryption | AES-256-GCM, key `ENCRYPTION_KEY` 32 byte base64 | `aes.ts:4-43`, `RAG S10.3` |
| NFR-SEC-02 | Auth | NextAuth v5 Credentials + bcrypt; JWT edge-safe jose | `config.ts:11-38`, `RAG S10.1` |
| NFR-SEC-03 | Rate limit | 10 req/min per user/IP untuk `/api/v1/generate` | `middleware.ts:109-127` |
| NFR-SEC-04 | Rate limit backend | ASUMSI prod needs Redis (`middleware.ts:18` comment) - out-of-scope this release | `RAG S10.4` |
| NFR-SEC-05 | Secret env | `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, `TURSO_AUTH_TOKEN` wajib | `.env.example:1-17` |
| NFR-SEC-06 | Password hash | bcrypt (ASUMSI `bcrypt.hash` di register) | `RAG S10.2`, `RAG S12 G4` |
| NFR-SEC-07 | Cookie secure | `__Secure-` prefix prod HTTPS, no prefix localhost | `middleware.ts:80-86` |
| NFR-SEC-08 | Ownership check | Setiap project/provider/log endpoint verify userId | `RAG S5` step 5, `RAG S9` relasi |

### 6.4 Accessibility & UX

| ID | Requirement | Target | Bukti/ASUMSI |
|---|---|---|---|
| NFR-A11Y-01 | Komponen UI | shadcn/ui (radix primitives) - a11y baseline | `RAG S2`, `components.json` |
| NFR-A11Y-02 | Keyboard nav | ASUMSI radix primitives support | `RAG S2` |
| NFR-A11Y-03 | Theme | dark/light/system via next-themes | `RAG S2`, `RAG S4 F20` |
| NFR-UX-01 | Notif | sonner toast | `RAG S2` |
| NFR-UX-02 | Animasi | framer-motion | `RAG S2` |
| NFR-UX-03 | Form | react-hook-form + @hookform/resolvers zod | `RAG S2` |

### 6.5 i18n

| ID | Requirement | Target | Bukti |
|---|---|---|---|
| NFR-I18N-01 | Lokal | id, en | `middleware.ts:40`, `RAG S3.5` |
| NFR-I18N-02 | Messages | `messages/id.json`, `messages/en.json` (ASUMSI isi lengkap) | `RAG S12 G12` |

### 6.6 Observability

| ID | Requirement | Target | Bukti |
|---|---|---|---|
| NFR-OBS-01 | Generation log | `generation_logs` status success/partial/fail, errorMessage `[CATEGORY] msg`, logsJson array | `schema.ts:147-160`, `RAG S9.8` |
| NFR-OBS-02 | Error kategori | TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE/UNKNOWN | `llm-client.ts:18-44` |
| NFR-OBS-03 | Log buffer | In-memory max 500 entries FIFO | `log-buffer.ts:1-34` |
| NFR-OBS-04 | Analytics | Vercel Analytics events | `events.ts:1-22` |
| NFR-OBS-05 | Dashboard | stats total/generate/success ratio/provider dist | `dashboard.repo.ts` |
| NFR-OBS-06 | retryCount | Wajib catat di logsJson (ASUMSI - field belum eksplisit di schema, extend logsJson) | `RAG S9.8`, `BRD S3 G7` |

### 6.7 Maintainability

| ID | Requirement | Target | Bukti |
|---|---|---|---|
| NFR-MAINT-01 | TypeScript strict | `tsconfig.json:7` strict mode | `RAG S2` |
| NFR-MAINT-02 | Lint | eslint ^9.17 + eslint-config-next + @typescript-eslint ^8.18 | `RAG S2` |
| NFR-MAINT-03 | Format | prettier ^3.4 + prettier-plugin-tailwindcss | `RAG S2` |
| NFR-MAINT-04 | Test unit | vitest ^2.1 + @vitejs/plugin-react + @vitest/coverage-v8 | `RAG S2` |
| NFR-MAINT-05 | Test E2E | @playwright/test ^1.49 | `RAG S2` |
| NFR-MAINT-06 | Coverage | ASUMSI >=80% untuk pipeline generasi (target TEST_PLAN turunan) | `RAG S12 G10` |
| NFR-MAINT-07 | Package manager | pnpm >=9, locked pnpm@11.7.0 | `RAG S2` |
| NFR-MAINT-08 | Node | >=20.0.0 | `RAG S2` |

### 6.8 Compatibility

| ID | Requirement | Target | Bukti |
|---|---|---|---|
| NFR-COMP-01 | DB | Turso/libSQL (SQLite-compatible) - BUKAN Postgres | `RAG S2` koreksi |
| NFR-COMP-02 | Framework | Next.js 15.1 App Router (`^15.1.0`) | `RAG S2` |
| NFR-COMP-03 | Provider LLM | ollama/openrouter/9router/custom (`schemas.ts:159`); OpenAI-compatible (`@ai-sdk/openai-compatible`) | `RAG S2`, `RAG S4 F2` |
| NFR-COMP-04 | Deploy | Vercel (maxDuration 300s Pro, Blob, Analytics) | `RAG S3.2`, `RAG S3.6` |

---

## 7. Acceptance Criteria

> Per MUST feature. Format Given/When/Then. Pass/fail concrete.

### 7.1 Generation pipeline ACs (MUST)

#### AC-GEN-01: Prompt contract eksplisit `sfx_list`

**Given** system prompt `buildSystemPrompt()` (`prompt-builder.ts:137-168`).
**When** prompt string di-inspect.
**Then**:
- [PASS] Prompt mendeklarasikan `sfx_list` sebagai **string comma-separated** dengan contoh `"footstep,door creak,wind"`.
- [PASS] `JSON_SCHEMA_EXAMPLE` (`prompt-builder.ts:75-97`) memuat minimal 1 audio_spec dengan `audio_type:'sfx'` + `sfx_list` string terisi.
- [PASS] Prompt berisi instruksi "Jangan gunakan newline mentah dalam string value, gunakan `\n` escape."
- [FAIL] Prompt masih bilang "Untuk sfx: sfx_list." tanpa tipe/contoh.

#### AC-GEN-02: Zod schema `sfx_list` longgar + normalizer

**Given** `SceneAudioSpecSchema` (`schemas.ts:39-55`) dan `route.ts:376-407` audio save block.
**When** LLM return `sfx_list: ["footstep","door"]` (array) di `audio_specs.2`.
**Then**:
- [PASS] `PromptPackageSchema.parse(parsedJson)` sukses (union terima array).
- [PASS] Normalizer coerce array -> string `"footstep,door"` sebelum `scene_audio.sfxList` insert.
- [PASS] DB `scene_audio.sfxList` = text `"footstep,door"`.
- [FAIL] Zod reject "Expected string, received array" (Bug A reproduces).

**Given** LLM return `sfx_list: "footstep,door"` (string).
**When** parse + persist.
**Then**:
- [PASS] Schema terima string langsung.
- [PASS] DB `scene_audio.sfxList` = `"footstep,door"`.

#### AC-GEN-03: Retry vary request

**Given** attempt 1 gagal dengan kategori `VALIDATION` (sfx_list mismatch - sebelum fix FR-GEN-02, atau field lain).
**When** retry attempt 2.
**Then**:
- [PASS] `requestJson` rebuild dengan messages tambahan corrective prompt (FR-GEN-05).
- [PASS] `temperature` = 0.5 (bukan 0.7).
- [PASS] Backoff 2s sebelum fetch.
- [FAIL] `requestJson` identik dengan attempt 1 (body sama, temp sama).

**Given** attempt 2 gagal `JSON_PARSE` (output panjang truncate).
**When** retry attempt 3 (ASUMSI maxRetries=3).
**Then**:
- [PASS] `stream:false` + `max_tokens:65536`.
- [PASS] `temperature` = 0.3.
- [PASS] Backoff 4s + jitter 0-1s.

#### AC-GEN-04: JSON repair hardening

**Given** LLM output JSON dengan newline mentah di dalam string value (mis. `prompt_text` mengandung `\n` literal).
**When** `extractJsonFromContent` -> `repairTruncatedJson` -> `JSON.parse`.
**Then**:
- [PASS] Pre-parse sanitizer escape newline mentah -> `\\n`.
- [PASS] `JSON.parse` sukses.
- [FAIL] `JSON.parse` throw SyntaxError "Bad control character" (Bug B reproduces).

**Given** LLM output dengan trailing data setelah JSON valid (`{...} teks tambahan`).
**When** repair.
**Then**:
- [PASS] Trailing data di-strip.
- [PASS] `JSON.parse` sukses.

**Given** LLM output dengan escape rusak (`\"` unterminated).
**When** repair.
**Then**:
- [PASS] Closing quote ditambahkan.
- [PASS] `JSON.parse` sukses.

#### AC-GEN-05: Validation error feedback ke LLM

**Given** `PromptPackageSchema.parse` throw `ZodError` dengan issues `[{path:['scenes',2,'audio_specs',2,'sfx_list'], message:'Expected string, received array'}]`.
**When** retry attempt 2.
**Then**:
- [PASS] Corrective message di-generate: "Validasi gagal di field scenes.2.audio_specs.2.sfx_list. Error: Expected string, received array. Perbaiki output JSON agar sesuai schema."
- [PASS] Corrective message di-append ke `messages` array.
- [PASS] Corrective message di-log ke `generation_logs.logsJson`.
- [FAIL] Retry kirim messages identik tanpa konteks error.

#### AC-GEN-06: SSE pipeline persist partial + log failure category

**Given** LLM return valid `PromptPackage`, persist DB berjalan, `bulkCreateScenes` gagal (return null via `safeDbOp`).
**When** pipeline selesai.
**Then**:
- [PASS] `projects.status` = `partial` (bukan `complete`).
- [PASS] `done` event sertakan `partialSceneIds` (scene yang gagal).
- [PASS] `generation_logs.status` = `partial`.
- [PASS] `generation_logs.errorMessage` = `[CATEGORY] message` format.
- [PASS] `generation_logs.logsJson` = array log entries (stage events, error detail, retryCount).
- [FAIL] Status `complete` meski scene hilang (Bug D reproduces).

**Given** unhandled exception di route (`route.ts:520-548`).
**When** catch.
**Then**:
- [PASS] Error di-kategori spesifik via `categorizeError` (TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE).
- [PASS] `generation_logs.status` = `fail`, `errorMessage` = `[CATEGORY] message`.
- [FAIL] Generic `PROVIDER_ERROR` tanpa kategori spesifik.

### 7.2 Persist reliability AC (MUST)

#### AC-PERSIST-01: Partial persist eksplisit

**Given** `safeDbOp` gagal untuk `bulkCreateScenes` (scene 3+ gagal).
**When** pipeline selesai.
**Then**:
- [PASS] `projects.status` = `partial`.
- [PASS] `done` event `partialSceneIds` = [3, 4, ...] (scene yang gagal).
- [PASS] UI `result-tabs.tsx` tampilkan warning "Scene 3, 4 gagal persist - regenerate perlu".
- [PASS] Master `image_prompts` (sceneId null) tetap disimpan (existing behavior, `route.ts:462-486`).
- [FAIL] Status `complete`, scene hilang silent (Bug D reproduces).

### 7.3 Log AC (MUST)

#### AC-LOG-01: Generation log lengkap

**Given** generate sukses dengan 1 retry.
**When** pipeline selesai.
**Then**:
- [PASS] `generation_logs` row ada dengan `provider`, `model`, `durationMs`, `status='success'`, `errorMessage=null`.
- [PASS] `logsJson` array berisi: stage events, retryCount=1, correctivePrompt attempt 2.
- [FAIL] `logsJson` null atau tanpa retryCount.

### 7.4 Provider AC (MUST)

#### AC-PROV-02: API key encryption

**Given** user submit provider config dengan `apiKey="sk-xxx"`.
**When** persist ke `provider_configs.apiKeyEncrypted`.
**Then**:
- [PASS] `apiKeyEncrypted` = AES-256-GCM encrypted string (bukan plaintext).
- [PASS] `maskApiKey` display `****xxxx` (last 4 char).
- [PASS] `decryptFromString` return `sk-xxx` saat generate.
- [FAIL] `apiKeyEncrypted` = plaintext `sk-xxx`.

### 7.5 Auth AC (MUST)

#### AC-AUTH-01: Register + login

**Given** user submit register `email="test@example.com"`, `password="pass123"`.
**When** POST `/api/v1/register`.
**Then**:
- [PASS] `users` row dibuat, `passwordHash` = bcrypt hash (bukan plaintext).
- [PASS] Login via NextAuth Credentials `bcrypt.compare` sukses.
- [PASS] Session JWT return dengan `user.id`.
- [FAIL] `passwordHash` = plaintext.

#### AC-AUTH-02: Edge middleware gate + rate limit

**Given** user tanpa session akses `/api/v1/generate`.
**When** request.
**Then**:
- [PASS] 401 Unauthorized (redirect login).

**Given** user dengan session, 11 request dalam 1 menit ke `/api/v1/generate`.
**When** request ke-11.
**Then**:
- [PASS] 429 Too Many Requests.
- [FAIL] Request ke-11 diproses.

### 7.6 Generation success rate AC (MUST - KPI gate)

#### AC-KPI-01: Generation success rate >= 95%

**Given** 100 generate request dengan provider valid, input valid (shorts 3-5 scene + tutorial 8-15 scene, termasuk scene dengan `audio_type:'sfx'`).
**When** pipeline jalan.
**Then**:
- [PASS] >= 95 generate sukses (`status='success'` atau `status='partial'`).
- [PASS] <= 5 generate fail (`status='fail'`).
- [PASS] Zero silent failure (semua fail ter-kategorisasi).
- [FAIL] Success rate < 95%.

---

## 8. Spesifikasi Deliverable

> Apa yang dev agent harus produksi untuk tutup bug + harden pipeline. Selaras `BRD S8.1` in-scope.

### 8.1 Deliverable MUST (wajib ship)

| ID | Deliverable | File terdampak | FR |
|---|---|---|---|
| D1 | **Prompt contract fix** - `buildSystemPrompt()` (`prompt-builder.ts:137-168`) deklarasi `sfx_list` string + contoh `sfx` di `JSON_SCHEMA_EXAMPLE` (`prompt-builder.ts:75-97`) + instruksi escape newline | `src/lib/ai/prompt-builder.ts` | FR-GEN-01 |
| D2 | **Schema fix** - `SceneAudioSpecSchema.sfx_list` (`schemas.ts:52`) ubah ke `z.union([z.string(), z.array(z.string())]).nullable().optional()`; konsolidasi `SceneAudioSchema` duplikat (`schemas.ts:83-99`) samakan default volume | `src/lib/validation/schemas.ts` | FR-GEN-02, FR-GEN-09 |
| D3 | **Normalizer** - di `route.ts:376-407` audio save block: `Array.isArray(audio.sfx_list) ? audio.sfx_list.join(', ') : audio.sfx_list` sebelum DB insert | `src/app/api/v1/generate/route.ts` | FR-GEN-02 |
| D4 | **Retry vary request** - `generatePromptPackage` (`llm-client.ts:237-424`) rebuild `requestJson` per attempt: attempt 2 tambah corrective prompt + temp 0.5; attempt 3 `stream:false` + `max_tokens:65536` + temp 0.3 + jitter | `src/lib/ai/llm-client.ts` | FR-GEN-03 |
| D5 | **JSON repair hardening** - upgrade `repairTruncatedJson` (`llm-client.ts:50-100`): pre-parse sanitizer (BOM, line ending, control char escape), handle trailing data, handle escape rusak | `src/lib/ai/llm-client.ts` | FR-GEN-04 |
| D6 | **Validation error feedback** - di retry loop (`llm-client.ts:279-414`), format `ZodError.issues` jadi corrective message, append ke `messages`, log ke `logsJson` | `src/lib/ai/llm-client.ts` | FR-GEN-05 |
| D7 | **SSE partial + log category** - `route.ts:310-513` set status `partial` jika `safeDbOp` gagal; `done` event sertakan `partialSceneIds`; unhandled catch (`route.ts:520-548`) pakai `categorizeError` spesifik | `src/app/api/v1/generate/route.ts` | FR-GEN-06 |
| D8 | **Generation log lengkap** - `generation_logs.logsJson` wajib array (stage events, retryCount, correctivePrompt, error detail); repository `generation-log.repo.ts:1-32` extend | `src/lib/db/repositories/generation-log.repo.ts`, `src/app/api/v1/generate/route.ts` | FR-LOG-01 |
| D9 | **Persist partial eksplisit** - `route.ts:310-493` set `projects.status='partial'` bila ada scene gagal; UI `result-tabs.tsx` tampilkan warning | `src/app/api/v1/generate/route.ts`, `src/components/generate/result-tabs.tsx` | FR-PERSIST-01 |
| D10 | **API key encryption** - pertahankan `aes.ts:4-43`; verifikasi `provider-registry.ts:29`, `llm-client.ts:7,244-254`, `provider-config.repo.ts:5` pakai encrypt/decrypt | `src/lib/crypto/aes.ts` (verify existing) | FR-PROV-02 |
| D11 | **Auth + middleware** - pertahankan `config.ts:11-38`, `middleware.ts:56-140`; verifikasi register `bcrypt.hash` (`RAG S12 G4` ASUMSI) | `src/lib/auth/config.ts`, `src/middleware.ts`, `src/app/api/v1/register/route.ts` | FR-AUTH-01, FR-AUTH-02 |

### 8.2 Deliverable SHOULD (ship bila resource cukup)

| ID | Deliverable | File terdampak | FR |
|---|---|---|---|
| D12 | Provider test endpoint - `src/app/api/v1/settings/providers/[id]/test/route.ts` | `RAG S12 G19` | FR-PROV-03 |
| D13 | Diagnose endpoint - `src/app/api/v1/diagnose/route.ts` | `RAG S12 G18` | FR-PROV-04 |
| D14 | Image classification - `src/lib/ai/image-classifier.ts`, `src/app/api/v1/upload/classify/route.ts` | `RAG S12 G17` | FR-ASSET-02 |
| D15 | Dashboard stats - `src/lib/db/repositories/dashboard.repo.ts`, `src/app/api/v1/dashboard/stats/route.ts` | `RAG S12 G20` | FR-DASH-01 |
| D16 | Export Markdown lengkap - `src/lib/export/markdown.template.ts:4-173` extend transition+voiceover+audio spec | `RAG S4 F16` | FR-EXP-01 |
| D17 | Project CRUD endpoints - `src/app/api/v1/projects/**/*.ts` | `RAG S3.2` | FR-PROJ-01 |
| D18 | Provider config CRUD endpoints - `src/app/api/v1/settings/providers/**/*.ts` | `RAG S3.2` | FR-PROV-01 |
| D19 | Log viewer UI - `src/components/generate/log-viewer.tsx` | `RAG S4 F18` | FR-LOG-02 |
| D20 | Asset upload - `src/app/api/v1/upload/route.ts` | `RAG S4 F6` | FR-ASSET-01 |
| D21 | i18n messages - `messages/id.json`, `messages/en.json` | `RAG S12 G12` | FR-I18N-01 |

### 8.3 Deliverable COULD (defer bila resource terbatas)

| ID | Deliverable | FR |
|---|---|---|
| D22 | Template presets tambahan | FR-TPL-01 |
| D23 | Theme preference UI | FR-PROJ-02 |
| D24 | In-memory log buffer polish | FR-LOG-03 |
| D25 | Analytics events instrument | FR-DASH-02 |
| D26 | Consistency checker UI polish | FR-GEN-08 |

### 8.4 Aset wajib

| Aset | Path | Status |
|---|---|---|
| Logo PromptFlow | ASUMSI - tidak diverifikasi di repo | `RAG S12` |
| Maskot | ASUMSI - tidak ada bukti | `RAG S12` |
| Template preset icons | `src/lib/templates/presets.ts:53-224` (data, bukan aset gambar) | `RAG S4 F15` |
| Messages i18n | `messages/id.json`, `messages/en.json` | `RAG S12 G12` |

### 8.5 Struktur konten deliverable

- **Prompt contract** (`prompt-builder.ts`): system prompt + JSON_SCHEMA_EXAMPLE + user message builder.
- **Schema** (`schemas.ts`): `PromptPackageSchema` root + `SceneAudioSpecSchema` + `SceneSchema` + `SceneAudioSchema` (konsolidasi).
- **Pipeline** (`route.ts`, `llm-client.ts`): SSE handler + retry loop + repair + categorize + persist + log.
- **DB** (`schema.ts`): 9 tabel (users, provider_configs, projects, asset_references, characters, scenes, image_prompts, generation_logs, supporting_characters, scene_audio) - tidak ada perubahan schema, hanya normalizer di route.
- **Auth** (`config.ts`, `middleware.ts`): NextAuth + edge gate + rate limit.
- **Export** (`markdown.template.ts`): Markdown template.

---

## 9. Out of Scope Eksplisit

> Selaras `BRD S8.2`. Ekspisit di luar release ini.

| # | Item | Alasan |
|---|---|---|
| OOS-01 | Fitur baru tak terkait reliability generasi (marketplace, payment, social sharing) | `BRD S8.2` - scope creep |
| OOS-02 | Migrasi DB engine (Postgres/Neon) | `RAG S2` koreksi - Tetap Turso/libSQL |
| OOS-03 | Ganti framework (bukan Next.js 15) | `BRD S8.2` |
| OOS-04 | LLM training/fine-tuning sendiri | `BRD S8.2` |
| OOS-05 | Mobile native app | `BRD S8.2` |
| OOS-06 | Payment gateway / billing / Stripe | `BRD S8.2`, `RAG S12` - no billing di repo |
| OOS-07 | Analytics custom engine (ganti Vercel Analytics) | `BRD S8.2` |
| OOS-08 | Redis-backed rate limit (prod scale) | `middleware.ts:18` comment "prod needs Redis - fase akhir" - this release tetap in-memory |
| OOS-09 | Rollback transaksi DB untuk partial persist | `RAG S11 Bug D` by design - partial success acceptable, hanya status+laporan eksplisit |
| OOS-10 | Next.js versi eksak "15.5" upgrade | `RAG S12 G1` - `^15.1.0`, tidak diverifikasi 15.5 |
| OOS-11 | Provider "tokenrouter" + model "MiniMax-M3" hardcode | `RAG S12 G8` - ASUMSI dari log user, kemungkinan disimpan sebagai `custom` |
| OOS-12 | Komponen UI baru di luar hardening pipeline | Fokus MUST reliability |

---

## 10. Asumsi (diturunkan dari RAG S12)

| ID | Asumsi | Dampak PRD |
|---|---|---|
| A1 | Provider "tokenrouter" + "MiniMax-M3" dari log user, tak ada di repo (`RAG G8`) | FR-GEN tidak hardcode provider; multi-provider tetap |
| A2 | Register pakai `bcrypt.hash` (`RAG G4`, route tak dibaca) | FR-AUTH-01 asumsi |
| A3 | `authConfig` edge config berisi pages.signIn + callbacks + jwt (`RAG G5`) | FR-AUTH-02 asumsi |
| A4 | Scene audio CRUD endpoint konsisten schema duplikat (`RAG G6`) | FR-GEN-09 verifikasi turunan |
| A5 | Komponen UI generate ada & fungsional (9 file, isi tak dibaca, `RAG G7`) | FR-GEN-06 UI partial warning asumsi |
| A6 | Blob helper ada di `src/lib/storage/` (`RAG G9`) | FR-ASSET-01 asumsi |
| A7 | Test coverage eksplisit tak diketahui (`RAG G10`) | NFR-MAINT-06 target >=80% asumsi |
| A8 | Baseline NPS, retention, cost, fail rate tak ada (`BRD S9 A8`) | KPI target = aspirasi |
| A9 | Produk private, tak ada monetisasi (`BRD S9 A9`) | OOS-06 billing |
| A10 | `messages/id.json`, `en.json` isi lengkap (`RAG G12`) | FR-I18N-01 asumsi |
| A11 | Endpoint diagnose/test/dashboard isi (`RAG G18-G20`) | FR-PROV-03/04, FR-DASH-01 asumsi |
| A12 | maxRetries naik ke 3 (`RAG S8.2.3` default 2) | FR-GEN-03 attempt 3 asumsi hardening |
| A13 | p95 < 60s target | NFR-PERF-01 asumsi (BRD median shorts <=90s) |

---

## 11. Sitasi (RAG-CONTEXT.md + BRD + MRD)

| Klaim PRD | Sitasi | Bukti kode |
|---|---|---|
| Identitas & stack | `RAG S1, S2` | `package.json`, `README.md` |
| Visi reliability | `BRD S1, S2`, `MRD S5` | - |
| Persona + pain | `MRD S3`, `BRD S2` | - |
| Bug A root cause | `RAG S6.4, S11 Bug A` | `schemas.ts:52`, `prompt-builder.ts:75-97,152` |
| Bug B root cause | `RAG S8.2.2, S11 Bug B` | `llm-client.ts:50-100,274,287,284-289` |
| Bug D partial persist | `RAG S11 Bug D` | `route.ts:35-51,316` |
| Schema duplikat | `RAG S6.3, S11 Bug F` | `schemas.ts:39-55,83-99` |
| Retry tak vary | `RAG S8.2.3` | `llm-client.ts:274,287` |
| categorizeError | `RAG S8.2.3` | `llm-client.ts:18-44` |
| extractJsonFromContent | `RAG S8.2.1` | `llm-client.ts:106-165` |
| Generation pipeline flow | `RAG S5` | `route.ts:53-564`, `llm-client.ts:237-424` |
| PromptPackageSchema | `RAG S6` | `schemas.ts:106-124` |
| 8-layer image prompt | `RAG S6.2`, `RAG S4 F12` | `schemas.ts:19-31`, `prompt-builder.ts:150` |
| Scene audio spec | `RAG S6.1` | `schemas.ts:39-55` |
| DB scene_audio.sfxList | `RAG S9.10` | `schema.ts:193` |
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
| Diagnose/test endpoint | `RAG S12 G18, G19` | `route.ts` (file ada, isi ASUMSI) |
| KPI bisnis | `BRD S4` | - |
| Scope in/out | `BRD S8.1, S8.2` | - |
| Risiko | `BRD S7` | - |
| Gaps/ASUMSI | `RAG S12 G1-G20` | - |

---

> Dokumen ini fokus pada PRODUK: visi, persona, user story, fitur MoSCoW, functional & non-functional requirement, acceptance criteria, spesifikasi deliverable. Spesifikasi teknis mendetail (arsitektur fix, skema DB, kontrak API, aturan kode, rencana uji) dijabarkan dokumen turunan: SRS, DATABASE_SCHEMA, PROJECT_ARCHITECTURE, UIUX_SPEC, API_CONTRACT, CODING_RULES, TEST_PLAN, AGENTS.md. Selaras BRD (why) + MRD (who) -> PRD (what).
