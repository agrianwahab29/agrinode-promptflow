# Software Requirement Specification (SRS)
## PromptFlow — Workflow Engine Otomasi Prompt Animasi AI

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** `product-docs/RAG-CONTEXT.md` + `product-docs/BRD.md` + `product-docs/MRD.md` + `product-docs/PRD.md` (bersitasi per klaim penting)
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Catatan:** SRS = dokumen paling teknis & paling eksekutabel. Tiap fitur PRD (FR-01..FR-19) punya realisasi teknis di sini. Detail skema data penuh di `DATABASE_SCHEMA.md`, kontrak API penuh di `API_CONTRACT.md`, arsitektur penuh di `PROJECT_ARCHITECTURE.md`.

---

## Daftar Isi

1. Pendahuluan & Tujuan
2. Lingkup Teknis
3. Arsitektur High-Level
4. Tech Stack & Versi
5. Spesifikasi Fungsional Teknis
6. Data Model Overview
7. Interface/API Overview
8. Constraint Teknis
9. Keamanan
10. Tahapan Implementasi
11. Verifikasi & Test
12. Asumsi Teknis
13. Referensi

---

## 1. Pendahuluan & Tujuan

### 1.1 Tujuan Dokumen

SRS ini menjabarkan spesifikasi teknis eksekutabel untuk PromptFlow — web app
fullstack otomasi susun prompt animasi AI. Output aplikasi = teks prompt
terstruktur (JSON + opsi export markdown), BUKAN file media.
- Sitasi: `PRD.md 1.2` ; `BRD.md 1` ; `RAG-CONTEXT.md 9 G10, G12`

SRS menjembatani PRD (kebutuhan produk) ke implementasi konkret: arsitektur,
tech stack, endpoint/server action, alur data LLM, validasi Zod, data model,
constraint serverless, keamanan, tahapan implementasi, verifikasi.

### 1.2 Konteks Teknis Inti

| Aspek | Nilai | Bukti |
|---|---|---|
| Tipe | Web app fullstack Next.js App Router (frontend + backend satu repo) | `PRD.md 1.2` |
| Inti fungsi | Otomasi susun prompt animasi terstruktur dari input minimal (judul + durasi + opsi referensi) | `PRD.md 1.1` |
| Output | Paket prompt teks terstruktur (JSON + opsi markdown) | `PRD.md 8.2` ; ASUMSI A4 `RAG-CONTEXT.md 9 G9` |
| Stack | Next.js App Router + Vercel AI SDK v6 + `@ai-sdk/openai-compatible` + Turso/libSQL + Tailwind v4 + shadcn/ui + Vercel Blob + NextAuth.js + Zod | `RAG-CONTEXT.md 2.1` ; paket konteks |
| Multi-provider | Ollama cloud (`https://ollama.com/v1`), OpenRouter (`https://openrouter.ai/api/v1`), 9router (`http://localhost:20128/v1`) + custom | `RAG-CONTEXT.md 5.1, 5.2` |
| Deploy | Vercel (serverless) + Turso DB | `RAG-CONTEXT.md 2.1, 2.2` |
| Status | Greenfield (tidak ada kode/schema/aset existing) | `RAG-CONTEXT.md 1` |

### 1.3 Stakeholder Teknis

| Stakeholder | Kepentingan Teknis | Sitasi |
|---|---|---|
| Bos Agrian | ROI, adopsi, biaya terkendali | `BRD.md 4` |
| Kreator solo/studio/edukator | Output siap pakai, konsistensi karakter, biaya rendah | `MRD.md 3` (ASUMSI persona) |
| Provider LLM (Ollama/OpenRouter/9router) | API usage stabil | `BRD.md 4` |
| Vercel & Turso | Platform hosting | `BRD.md 4` |

---

## 2. Lingkup Teknis

### 2.1 In Scope Teknis

1. Web app Next.js App Router fullstack (frontend + backend satu repo).
   - Sitasi: `PRD.md 8.1`
2. Input user: judul animasi, durasi target, gaya gambar (3D/2D + rasio),
   (opsional) referensi gambar tokoh/background.
   - Sitasi: `PRD.md 3.1 (US-01, US-02, US-10), 3.2 (US-15)`
3. Multi-provider LLM integration via `@ai-sdk/openai-compatible`
   `createOpenAICompatible`: Ollama cloud, OpenRouter, 9router + custom.
   - Sitasi: `RAG-CONTEXT.md 5.1, 5.2`
4. Generate paket prompt terstruktur (scenes[] berurut, voiceover per scene,
   image_prompts per tokoh & per background, character_profiles konsisten,
   supporting_characters, style, moral_message).
   - Sitasi: `PRD.md 8.2`
5. Konsistensi karakter lintas adegan via Character master + referensi.
   - Sitasi: `RAG-CONTEXT.md 4 (catatan), 6`
6. Output JSON structured + export markdown.
   - Sitasi: `PRD.md 8.2, 8.3`
7. Pengaturan user: provider, base URL, model, API key (terenkripsi).
   - Sitasi: `PRD.md 5 (FR-13, FR-14)`
8. Login dasar NextAuth multi-user (SHOULD).
   - Sitasi: `PRD.md 5 (FR-18)` ; ASUMSI A1 `BRD.md 7.1`
9. UI dwibahasa ID + EN (SHOULD).
   - Sitasi: `PRD.md 5 (FR-19)` ; ASUMSI A2 `BRD.md 7.1`
10. Upload referensi gambar via Vercel Blob (SHOULD).
    - Sitasi: `PRD.md 5 (FR-17)` ; ASUMSI A5 `RAG-CONTEXT.md 6, 9 G3`
11. Save project + CRUD.
    - Sitasi: `PRD.md 5 (FR-15)`
12. Deploy Vercel + Turso DB.
    - Sitasi: `RAG-CONTEXT.md 2.1`

### 2.2 Out of Scope Teknis

| # | Out of Scope | Alasan | Bukti |
|---|---|---|---|
| OOS-T1 | Generate file media (gambar/video/audio) langsung | Output = teks prompt | `BRD.md 8.2 #1` ; `RAG-CONTEXT.md 9 G10` |
| OOS-T2 | TTS voiceover audio | Output = naskah teks | `BRD.md 8.2 #2` ; `RAG-CONTEXT.md 9 G12` |
| OOS-T3 | Integrasi langsung API image gen (Midjourney/Kling/DALL-E) | User copy prompt manual | `BRD.md 8.2 #3` |
| OOS-T4 | Mobile native app (iOS/Android) | Web responsif dulu | `BRD.md 8.2 #4` |
| OOS-T5 | Payment/subscription | Fase awal fokus adoption | `BRD.md 8.2 #5` |
| OOS-T6 | Kolaborasi real-time multi-user dalam satu project | Fase awal solo per project | `BRD.md 8.2 #6` |
| OOS-T7 | Marketplace template prompt | Fase akhir | `BRD.md 8.2 #7` |
| OOS-T8 | Auto-fallback provider otomatis | User manual switch fase awal | ASUMSI P-A13 `PRD.md 10.2` |
| OOS-T9 | Animasi/motion preview di app | Output = teks | `RAG-CONTEXT.md 9 G10` |
| OOS-T10 | SQLite file lokal di Vercel prod | Filesystem tidak persisten | `RAG-CONTEXT.md 2.2, 5.4` |

### 2.3 Ketergantungan Teknis

| ID | Dependency | Pemilik | Status | Sitasi |
|---|---|---|---|---|
| TD1 | API key Ollama cloud | User | User sediakan | `BRD.md 8.3 D1` |
| TD2 | API key OpenRouter | User | User sediakan | `BRD.md 8.3 D2` |
| TD3 | Proxy 9router jalan lokal (`http://localhost:20128/v1`) | User | ASUMSI valid lokal | `RAG-CONTEXT.md 5.2, 9 G4` |
| TD4 | Akun Vercel + Turso (URL + token) | Bos Agrian/tim | Sediakan untuk deploy | `BRD.md 8.3 D4` |
| TD5 | Vercel Blob store (untuk gambar referensi prod) | Bos Agrian/tim | ASUMSI rekomendasi | `RAG-CONTEXT.md 6, 9 G3` |
| TD6 | `@ai-sdk/openai-compatible` matang (structured output, streaming) | Vercel/AI SDK | Dikonfirmasi | `RAG-CONTEXT.md 5.1` |
| TD7 | Turso resmi di Vercel Marketplace | Turso/Vercel | Dikonfirmasi | `RAG-CONTEXT.md 2.1` |
| TD8 | Env `ENCRYPTION_KEY` (AES-256-GCM untuk API key user) | Bos Agrian/tim | Sediakan di Vercel env | ASUMSI P-A10 `PRD.md 10.2` |

---
## 3. Arsitektur High-Level

### 3.1 Pendekatan Arsitektur

PromptFlow = web app fullstack Next.js App Router. Frontend (React Server
Components + Client Components) dan backend (Route Handlers + Server Actions)
dalam satu repo. Tidak ada microservice terpisah fase awal. Deploy Vercel
serverless.
- Sitasi: `PRD.md 1.2, 8.1` ; `RAG-CONTEXT.md 2.1`

DB Turso/libSQL (SQLite-compatible via HTTP) — pilihan wajib karena Vercel
filesystem tidak persisten. SQLite file lokal TIDAK boleh di prod.
- Sitasi: `RAG-CONTEXT.md 2.2, 5.4`

### 3.2 Layer Arsitektur

```
+------------------------------------------------------------------+
|  Layer 1: Presentation (App Router pages + components)           |
|  - src/app/(dashboard)/  UI pages (generate, projects, settings) |
|  - src/components/        shadcn/ui + custom UI                   |
|  - Client Components      interactive (form, streaming display)  |
|  - Server Components      data fetch (list project, detail)      |
+------------------------------------------------------------------+
         |  Server Actions + fetch /api/*
         v
+------------------------------------------------------------------+
|  Layer 2: API / Server Actions (backend logic)                   |
|  - src/app/api/          Route Handlers                           |
|    /api/projects         CRUD project                            |
|    /api/generate         streaming SSE generate prompt           |
|    /api/settings/providers  CRUD provider config                 |
|    /api/upload           Vercel Blob upload                      |
|    /api/export           JSON + markdown export                   |
|    /api/auth/*           NextAuth handler                        |
|  - Server Actions         mutation (save project, save setting)  |
+------------------------------------------------------------------+
         |  panggil lib/*
         v
+------------------------------------------------------------------+
|  Layer 3: lib/ (core logic, server-only)                          |
|  - lib/ai/               provider factory + generate pipeline     |
|    provider.factory.ts   createOpenAICompatible init              |
|    generate.ts           generateObject + Zod schema             |
|    prompts/              system prompt template per komponen     |
|  - lib/db/               Turso client + Drizzle ORM              |
|    client.ts             libSQL client + Drizzle instance         |
|    schema.ts             Drizzle table definitions                |
|    queries/              query helper per entitas                |
|  - lib/storage/          Vercel Blob helper                       |
|    blob.ts               upload, get URL, delete                 |
|  - lib/auth/             NextAuth config                          |
|    config.ts             providers, session, callbacks           |
|  - lib/crypto/           AES-256-GCM encrypt/decrypt API key       |
|    aes.ts                encrypt, decrypt, mask                   |
|  - lib/validation/       Zod schema (input + LLM structured output)|
|    schemas.ts            input form + LLM output schema           |
+------------------------------------------------------------------+
         |  external call
         v
+------------------------------------------------------------------+
|  Layer 4: External Services                                       |
|  - LLM provider (Ollama cloud / OpenRouter / 9router / custom)    |
|  - Turso DB (libSQL via HTTP)                                     |
|  - Vercel Blob (gambar referensi)                                 |
|  - NextAuth store (Turso adapter atau JWT)                       |
+------------------------------------------------------------------+
```

### 3.3 Alur Data Inti (Generate Prompt)

```
[User submit form]
    |
    v
[Server Action / POST /api/generate]
    |-- validasi input (Zod: title, duration, style, refs)
    |-- load ProviderConfig user (decrypt API key server-side)
    |-- init provider via createOpenAICompatible({name,apiKey,baseURL})
    |-- panggil generateObject / streamText dengan system prompt + Zod schema
    v
[LLM Provider] --streaming SSE--> [Server] --stream--> [Client]
    |-- partial JSON / token mengalir
    |-- client render real-time per komponen
    v
[LLM selesai] -> [full structured JSON validasi Zod]
    |-- post-check konsistensi karakter (FR-12)
    |-- (opsional) save Project + result ke Turso
    v
[Client: tampilkan paket prompt + tombol export]
```

### 3.4 Struktur Folder Asumsi

(Turun dari `RAG-CONTEXT.md 3`, ASUMSI — bukan fakta proyek. Detail final di
`PROJECT_ARCHITECTURE.md`.)

```
PromptFlow/
  product-docs/
  src/
    app/
      api/
        projects/route.ts          # GET list, POST create
        projects/[id]/route.ts     # GET detail, PUT update, DELETE
        generate/route.ts          # POST streaming SSE
        settings/providers/route.ts
        upload/route.ts
        export/route.ts
        auth/[...nextauth]/route.ts
      (dashboard)/
        generate/page.tsx
        projects/page.tsx
        projects/[id]/page.tsx
        settings/page.tsx
      layout.tsx
      page.tsx
    lib/
      ai/
        provider.factory.ts
        generate.ts
        prompts/
      db/
        client.ts
        schema.ts
        queries/
      storage/
        blob.ts
      auth/
        config.ts
      crypto/
        aes.ts
      validation/
        schemas.ts
    components/
      ui/            # shadcn/ui
      generate/      # form + streaming display
      projects/      # list + detail
      settings/      # provider form
    i18n/            # dwibahasa ASUMSI
  public/
    references/      # dev-only upload ASUMSI
  drizzle.config.ts  # ASUMSI Drizzle
  next.config.ts
  tailwind.config.ts # v4
  package.json
  .env.local
  .env.example
```

---

## 4. Tech Stack & Versi

### 4.1 Tabel Tech Stack

| Lapisan | Teknologi | Versi target | Justifikasi | Sitasi |
|---|---|---|---|---|
| Frontend+Backend | Next.js (App Router) | stabil terkini per 2025 (15+/16+) | Fullstack satu repo, RSC, Server Actions, deploy Vercel native | `RAG-CONTEXT.md 2.1` ; https://nextjs.org/docs |
| Runtime | Node.js (Vercel serverless) | versi yang didukung Vercel stabil terkini | Vercel default | ASUMSI |
| Styling | Tailwind CSS | v4 | shadcn/ui v4 support, modern | `RAG-CONTEXT.md 2.1` ; https://ui.shadcn.com/docs/tailwind-v4 |
| Komponen UI | shadcn/ui | latest stabil | Copy-paste component, integrasi Next.js+Tailwind | `RAG-CONTEXT.md 2.1` ; https://ui.shadcn.com/docs/installation/next |
| AI orchestration | Vercel AI SDK + `@ai-sdk/openai-compatible` | AI SDK v6 (latest stabil) | Multi-provider OpenAI-compatible, structured output, streaming, tool calling | `RAG-CONTEXT.md 2.1, 5.1` ; https://ai-sdk.dev/providers/openai-compatible-providers |
| Validasi | Zod | stabil terkini per 2025 | Schema validasi input + LLM structured output (`generateObject`) | ASUMSI (AI SDK depend on Zod) |
| DB | Turso (libSQL, SQLite-compatible via HTTP) | latest stabil | Vercel filesystem tidak persisten -> DB remote HTTP wajib | `RAG-CONTEXT.md 2.1, 2.2, 5.4` ; https://docs.turso.tech/sdk/ts/guides/nextjs |
| ORM | Drizzle ORM | stabil terkini per 2025 | Type-safe, ringan, dukung Turso/libSQL, migration | ASUMSI (paket konteks orchestrator; RAG menyebut raw @libsql/client atau Prisma sebagai alternatif - `RAG-CONTEXT.md 2.1, 9 G7`) |
| DB client | `@libsql/client` (di bawah Drizzle) | latest stabil | Drizzle pakai libSQL driver untuk Turso | https://docs.turso.tech/sdk/ts/guides/nextjs |
| Storage gambar | Vercel Blob | latest stabil | Persisten di Vercel, URL publik rujuk nama file | ASUMSI A5 `RAG-CONTEXT.md 6, 9 G3` ; https://vercel.com/docs/vercel-blob |
| Auth | NextAuth.js (Auth.js) | stabil terkini per 2025 (v5+) | Login dasar multi-user, session JWT/cookie, protected routes | ASUMSI A1/P-A1 `BRD.md 7.1` ; `PRD.md 5 (FR-18)` |
| Enkripsi | Node `crypto` (AES-256-GCM) | native Node | Enkripsi API key user saat simpan, decrypt server-side | ASUMSI P-A10 `PRD.md 10.2` ; `RAG-CONTEXT.md 11 #4` |
| i18n | next-intl ATAU native App Router i18n | stabil terkini per 2025 | UI dwibahasa ID + EN | ASUMSI A2 `BRD.md 7.1` ; `PRD.md 5 (FR-19)` (TIDAK ADA BUKTI preferensi lib - `RAG-CONTEXT.md 9 G5`) |
| Deploy | Vercel | n/a | Serverless auto-scale, edge, native Next.js | `RAG-CONTEXT.md 2.1` |
| Test unit | Vitest | stabil terkini per 2025 | Cepat, native ESM, cocok Next.js | ASUMSI (best practice) |
| Test e2e | Playwright | stabil terkini per 2025 | E2E browser automation | ASUMSI (best practice) |
| Lint | ESLint + next lint | stabil terkini per 2025 | Next.js default | ASUMSI |
| Format | Prettier (opsional) | stabil terkini per 2025 | Konsistensi style | ASUMSI |

### 4.2 Catatan Tech Stack

1. **Next.js App Router**: pakai React Server Components untuk data fetch
   (list project, detail), Client Components untuk interaksi (form generate,
   streaming display).
2. **AI SDK v6**: `createOpenAICompatible` untuk multi-provider. Pakai
   `generateObject` (structured output via Zod) bila provider dukung
   `supportsStructuredOutputs: true`. Fallback `streamText` + parse JSON
   manual bila tidak. `RAG-CONTEXT.md 5.1, 11 #1`
3. **Turso vs SQLite murni**: Turso wajib karena Vercel serverless filesystem
   tidak persisten. SQLite file lokal hanya untuk dev lokal (ASUMSI), prod
   WAJIB Turso remote. `RAG-CONTEXT.md 2.2, 5.4`
4. **Drizzle vs Prisma vs raw @libsql/client**: RAG menyebut raw
   `@libsql/client` atau Prisma sebagai opsi (`RAG-CONTEXT.md 2.1, 9 G7`).
   SRS memilih **Drizzle ORM** (ASUMSI orchestrator) karena type-safe, ringan,
   migration bawaan, dukung libSQL. Keputusan final bisa diubah di
   `DATABASE_SCHEMA.md`/`PROJECT_ARCHITECTURE.md` bila user prefer Prisma.
5. **Vercel Blob**: ASUMSI untuk gambar referensi prod. URL publik rujuk nama
   file di prompt teks. Dev lokal bisa pakai filesystem `public/references/`
   (ASUMSI). `RAG-CONTEXT.md 6`
6. **NextAuth**: ASUMSI provider credentials atau magic link. TIDAK ADA BUKTI
   preferensi (`RAG-CONTEXT.md 9 G2`). SRS rekomendasi credentials sederhana
   fase awal (ASUMSI).
7. **next-intl**: ASUMSI untuk dwibahasa. Bisa diganti native App Router i18n
   bila user prefer. TIDAK ADA BUKTI preferensi (`RAG-CONTEXT.md 9 G5`).
8. **Versi library**: RAG tidak sebut spesifik nomor versi (kecuali "AI SDK v6",
   "Tailwind v4", "Prisma 5.4+"). Untuk library lain (NextAuth, Drizzle,
   Zod, Vitest, Playwright) SRS tulis "stabil terkini per 2025" + catat asumsi.

---
## 5. Spesifikasi Fungsional Teknis

Mapping tiap PRD Functional Requirement (FR-01..FR-19) ke realisasi teknis:
endpoint/server action, alur data, format request/response LLM, validasi Zod.

> **Pola LLM call seragam:** server init provider via
> `createOpenAICompatible({ name, apiKey, baseURL })`, panggil
> `generateObject` (structured output + Zod schema) bila provider dukung
> `supportsStructuredOutputs: true`, fallback `streamText` + parse JSON.
> System prompt template di `lib/ai/prompts/`. Sitasi: `RAG-CONTEXT.md 5.1, 11 #1`

### FR-01: Input Judul Animasi

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint/UI | Client form di `/generate` (Client Component) -> Server Action `createProject` / POST `/api/generate` |
| Input field | `title: string` (Zod `z.string().min(3).max(200).trim()`) |
| Validasi | Zod schema `lib/validation/schemas.ts` `TitleSchema`. Trim whitespace otomatis. Sanitize HTML (escape `<>"'&`) sebelum pass ke prompt. |
| Proses | `title` di-inject ke system prompt LLM sebagai topik utama. Disimpan di record Project. |
| Output | `title` di root JSON hasil generate + di record Project. |
| Error | Zod parse fail -> 400 + pesan bahasa aktif (ID/EN, FR-19). |
| Bukti | `PRD.md 5 (FR-01)` |

### FR-02: Input Durasi Target

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint/UI | Select `duration_type` (`shorts`/`tutorial`) + numeric `target_seconds` opsional override |
| Validasi | Zod `DurationSchema`: `duration_type: z.enum(['shorts','tutorial'])`, `target_seconds: z.number().int().positive().optional()`. Aturan: shorts `target_seconds > 180` -> 400. Tutorial di luar 420-900 -> warning (boleh proceed, return flag `warning`). |
| Proses | Hitung perkiraan jumlah adegan (ASUMSI P-A12: shorts 3-6, tutorial 8-20). Pass `duration_target` + `duration_type` + `estimated_scenes` ke system prompt LLM. |
| Output | `duration_target` + `duration_type` di record Project + root JSON. LLM generate `scenes[]` sesuai target. |
| Error | 400 jika `duration_type` invalid / shorts > 180s. |
| Bukti | `PRD.md 5 (FR-02)` ; ASUMSI P-A12 `PRD.md 10.2` |

### FR-03 & FR-09: Generate Deskripsi Adegan Berurut

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | POST `/api/generate` (streaming SSE) atau Server Action `generatePromptPackage` |
| Input | `title`, `duration_target`, `style`, `aspect_ratio`, `character_profiles` (dari FR-07), `reference_images[]` (opsional) |
| System prompt | Template `lib/ai/prompts/scenes.system.ts`. Instruksi: generate `scenes[]` urut sesuai `estimated_scenes`, tiap scene: `order` (number 1..N), `description` (apa yang terjadi), `voiceover_script` (FR-04), `image_prompts` (FR-06 per scene varian). Reference karakter via `character_id`/nama, BUKAN duplikasi deskripsi (FR-07 master). |
| LLM call | `generateObject({ model, schema: PromptPackageSchema, system, messages })`. Streaming partial via `streamObject` bila provider dukung. |
| Output | `scenes[]` array di structured JSON. |
| Konsistensi | Post-check: tiap `scenes[].image_prompts.characters[].target` harus match `character_profiles[].nama`. Mismatch -> warning (FR-12). |
| Error | Provider timeout -> streaming partial disimpan (ASUMSI NFR-R2). Retry 3x backoff (ASUMSI NFR-R3). Provider gagal total -> error jelas + opsi switch provider (FR-13). |
| Bukti | `PRD.md 5 (FR-03, FR-09)` |

### FR-04: Generate Naskah Voiceover

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Sama FR-03 (generate paket). `voiceover_script` field per scene. |
| Input | `title`, `duration_target`, target penonton (ASUMSI infer dari judul/style), `scenes[]` |
| System prompt | Template `lib/ai/prompts/voiceover.system.ts`. Instruksi: generate `voiceover_script` per scene, ekspresi sesuai judul & audiens, bahasa ikut judul (ASUMSI NFR-I2). |
| Output | `voiceover_script: string` per scene (teks, BUKAN audio). |
| Catatan | TTS out of scope (`BRD.md 8.2 #2`, OOS-T2). |
| Bukti | `PRD.md 5 (FR-04)` |

### FR-05: Auto-buat Deskripsi Karakter & Background jika Tidak Ada Referensi

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Sama generate paket. |
| Input | `title`, `reference_images[]` (opsional) |
| Proses | Branch di system prompt: jika `reference_images` kosong -> LLM invent `character_profiles[]` + `image_prompts.backgrounds[]` sesuai judul. Jika ada -> pakai referensi (FR-17, inject `reference_filename`). |
| Output | `character_profiles[]` + `image_prompts.backgrounds[]` lengkap. |
| Bukti | `PRD.md 5 (FR-05)` |

### FR-06: Generate Image Prompt per Tokoh & per Background (List)

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Sama generate paket. |
| Input | `character_profiles[]`, `scenes[]`, `reference_images[]` (opsional) |
| System prompt | Template `lib/ai/prompts/image_prompts.system.ts`. Instruksi: generate list `image_prompts.characters[]` (1 prompt per tokoh, N tokoh = N prompt) & `image_prompts.backgrounds[]` (1 per tempat). Tiap item: `target` (nama tokoh/tempat), `prompt_text` (detail visual konsisten dengan `character_profiles`), `reference_filename` (nama file upload atau null). Jika ada referensi -> rujuk `reference_filename` dalam `prompt_text`. |
| Output | `image_prompts.characters[]` + `image_prompts.backgrounds[]` di root JSON + varian per scene di `scenes[].image_prompts`. |
| Konsistensi | `prompt_text` tokoh WAJIB konsisten dengan `character_profiles` (nama, rambut, wajah, pakaian, alas kaki). |
| Bukti | `PRD.md 5 (FR-06)` ; pola rujuk nama file = konvensi teks `RAG-CONTEXT.md 6` |

### FR-07: Deskripsi Tokoh Terstruktur Konsisten

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Sama generate paket. |
| Input | `title`, daftar tokoh (dari LLM atau user input opsional ASUMSI) |
| Struktur WAJIB | Zod `CharacterProfileSchema`: per karakter `nama: string`, `gayarambut: string`, `wajah_asal: string`, `pakaian_atas: string`, `pakaian_bawah: string`, `alas_kaki: string`, `deskripsi_latar: string`, `aksi: string`, `peran: z.enum(['utama','lain','pendamping'])`. |
| Proses | LLM generate `character_profiles[]` sekali (master) via `generateObject` dengan schema. Dirujuk lintas adegan via nama/id, BUKAN duplikasi deskripsi per scene. |
| Output | `character_profiles[]` array master di root JSON. |
| Konsistensi | WAJIB stabil lintas `scenes[]` (FR-12). Identitas (nama, wajah, pakaian) tetap; `aksi` & `deskripsi_latar` boleh berubah per scene. |
| Bukti | Struktur SELARAS praktik prompt engineering. `RAG-CONTEXT.md 4 (catatan), 6` (mengacu https://kling.ai/blog/ai-character-consistency-guide ; https://glibatree.com/proven-consistent-character-method/) ; `PRD.md 5 (FR-07)` |

### FR-08: Deskripsi Karakter Pendukung / Hewan + Aksi

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Sama generate paket. |
| Input | `title`, `scenes[]` |
| System prompt | Instruksi: identifikasi karakter pendukung/hewan per scene + aksi. |
| Output | `supporting_characters[]` (per scene atau global) dengan `nama: string`, `tipe: z.enum(['pendukung','hewan'])`, `aksi: string`. |
| Bukti | `PRD.md 5 (FR-08)` |

### FR-10: Pilih Gaya Gambar + Rasio Aspect

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint/UI | Select `style: z.enum(['3D','2D'])` + select `aspect_ratio: z.enum(['16:9','9:16','1:1']).or(z.string())` (custom allowed) |
| Proses | Pass ke system prompt LLM sebagai constraint visual. Di-inject ke image prompts. |
| Output | `style` + `aspect_ratio` di root JSON + di-inject ke `image_prompts`. |
| Bukti | `PRD.md 5 (FR-10)` |

### FR-11: Pesan Moral Penutup

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | Sama generate paket. |
| Input | `title`, `scenes[]`, tone (ASUMSI infer dari judul — default positif/edukatif) |
| System prompt | Instruksi: generate `moral_message` di akhir paket, positif/edukatif. |
| Output | `moral_message: string` di root JSON. |
| Bukti | `PRD.md 5 (FR-11)` ; `BRD.md 5.3` |

### FR-12: Konsistensi Visual Karakter Lintas Adegan

| Aspek | Realisasi Teknis |
|---|---|
| Aturan | Identitas (nama, gaya rambut, wajah/asal, pakaian atas/bawah, alas kaki) WAJIB stabil lintas `scenes[]`. `aksi` & `deskripsi_latar` BOLEH berubah. |
| Mekanisme | Character master (FR-07) dirujuk via id/nama di `scenes[]`, bukan duplikasi. Zod schema enforce `scenes[].image_prompts.characters[].target` reference `character_profiles[].nama`. |
| Validasi post-generate | Helper `lib/ai/consistency-check.ts`: banding `character_profiles` identitas vs reference di `scenes[]`. Mismatch -> warning (return flag, tidak block save). |
| Bukti | `RAG-CONTEXT.md 4 (catatan)` ; `PRD.md 5 (FR-12)` |

### FR-13: Multi-Provider LLM Setting

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | GET/POST/PUT/DELETE `/api/settings/providers` (Server Action `saveProviderConfig`) |
| Input form | `provider: z.enum(['ollama','openrouter','9router','custom'])`, `base_url: z.string().url()`, `model: string`, `api_key: string` (password field) |
| Base URL default | Ollama: `https://ollama.com/v1` ; OpenRouter: `https://openrouter.ai/api/v1` ; 9router: `http://localhost:20128/v1` ; custom: user input. |
| Provider factory | `lib/ai/provider.factory.ts`: `createOpenAICompatible({ name: provider, apiKey: decrypt(key), baseURL })`. Hanya server-side. `RAG-CONTEXT.md 5.1` |
| Auth header | OpenRouter: `Authorization: Bearer`, opsional `HTTP-Referer`, `X-OpenRouter-Title`. Ollama cloud: Bearer. 9router: ASUMSI Bearer/none (TIDAK ADA BUKTI - `RAG-CONTEXT.md 9 G4`). Pass via `createOpenAICompatible` opsi `headers`. |
| Output | ProviderConfig tersimpan (API key terenkripsi FR-14). Provider aktif dipakai saat generate. |
| Fallback | Provider gagal -> error jelas + opsi switch manual (ASUMSI P-A13: tidak auto-fallback fase awal). |
| Bukti | `RAG-CONTEXT.md 5.1, 5.2` ; `PRD.md 5 (FR-13)` |

### FR-14: Enkripsi API Key

| Aspek | Realisasi Teknis |
|---|---|
| Aturan | API key WAJIB dienkripsi saat simpan DB, TIDAK diekspos ke client. |
| Mekanisme | `lib/crypto/aes.ts`: AES-256-GCM via env `ENCRYPTION_KEY` (32 byte base64). `encrypt(plaintext): {iv, ciphertext, tag}`, `decrypt({iv, ciphertext, tag}): plaintext`. ASUMSI P-A10 (`RAG-CONTEXT.md 11 #4`). |
| Proses | Encrypt sebelum save DB (ProviderConfig.api_key_encrypted). Decrypt hanya server-side saat panggil LLM di `provider.factory.ts`. |
| Response client | API response provider config: `api_key` = mask `****` (tampilkan 4 char terakhir). TIDAK pernah return plaintext. |
| Bukti | `BRD.md 6 R6` ; `PRD.md 5 (FR-14)` ; ASUMSI P-A10 `RAG-CONTEXT.md 11 #4` |

### FR-15: Save Project + CRUD

| Aspek | Realisasi Teknis |
|---|---|
| Create | POST `/api/projects` (Server Action). Simpan: `title`, `duration_target`, `duration_type`, `style`, `aspect_ratio`, `reference_images[]` (metadata), `result` (JSON hasil generate, serialize), `user_id`, `created_at`. |
| Read/List | GET `/api/projects?page=N&limit=M`. Paginate per user (filter `user_id`). Server Component fetch. |
| Detail | GET `/api/projects/[id]`. Ownership check: `project.user_id === session.user.id`. |
| Update | PUT `/api/projects/[id]`. Update metadata + re-generate (overwrite `result`). |
| Delete | DELETE `/api/projects/[id]`. Cascade: hapus reference images metadata + hasil. Soft/hard delete (ASUMSI soft delete fase awal dengan flag `deleted_at`). |
| Validasi | Ownership check semua operasi (butuh FR-18 login). |
| DB | Turso/libSQL via Drizzle. Entitas lihat section 6. |
| Bukti | `PRD.md 5 (FR-15)` ; `RAG-CONTEXT.md 4` |

### FR-16: Export Hasil (JSON + Markdown)

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | GET `/api/export?projectId=X&format=json` atau `?format=markdown` |
| Format JSON | Response `Content-Type: application/json`, header `Content-Disposition: attachment; filename="<title>.json"`. Body = structured JSON (PRD 8.2). |
| Format Markdown | Route handler transform JSON -> markdown via template `lib/export/markdown.template.ts`. Struktur: judul+metadata, profil karakter (master), karakter pendukung, adegan urut (deskripsi+voiceover+image prompt tokoh/background+reference_filename), image prompt master list, pesan moral. Response `Content-Type: text/markdown`, download `.md`. |
| Proses | Server route handler. Tidak generate ulang, pakai `result` tersimpan di Project. |
| Output | File download via browser. |
| Bukti | `PRD.md 5 (FR-16), 8.3` |

---
### FR-17: Upload Referensi Gambar + Rujuk Nama File (SHOULD)

| Aspek | Realisasi Teknis |
|---|---|
| Endpoint | POST `/api/upload` (multipart/form-data) |
| Input | `reference_images[]` dengan field `tipe: z.enum(['tokoh','background'])` + `label: string` + file `image` (mime `image/*`, max size ASUMSI 10MB) |
| Storage | `lib/storage/blob.ts`: upload ke Vercel Blob via `put()`, dapatkan `url` publik + `filename`. ASUMSI A5 (`RAG-CONTEXT.md 6, 9 G3`). Dev lokal: simpan ke `public/references/` (ASUMSI, tidak persisten di Vercel prod). |
| Metadata | Simpan record `AssetReference` (filename, path/url, tipe, project_id, created_at) ke Turso. |
| Saat generate | Inject `reference_filename` ke image prompt teks (FR-06): mis `"Character 'Hero' — reference image: hero-ref.png. Maintain visual consistency with this reference."`. |
| Output | `image_prompts.characters[].reference_filename` & `image_prompts.backgrounds[].reference_filename` terisi nama file. |
| Catatan | Filesystem Vercel tidak persisten -> WAJIB Vercel Blob/S3/R2 di prod. `RAG-CONTEXT.md 5.4, 6` |
| Bukti | `PRD.md 5 (FR-17)` ; ASUMSI A5 `RAG-CONTEXT.md 6, 9 G3` |

### FR-18: Login Dasar NextAuth (SHOULD)

| Aspek | Realisasi Teknis |
|---|---|
| Mekanisme | NextAuth.js (Auth.js) v5+ di `lib/auth/config.ts`. ASUMSI provider credentials sederhana fase awal (TIDAK ADA BUKTI preferensi - `RAG-CONTEXT.md 9 G2`). Bisa pakai Turso adapter untuk session store atau JWT cookie. |
| Session | JWT/cookie session. Protected routes: `/projects`, `/settings`, `/generate`, `/api/projects`, `/api/settings`. Middleware `lib/auth/middleware.ts` redirect ke `/login` jika unauth. |
| Endpoint | `/api/auth/[...nextauth]/route.ts` (handler NextAuth). |
| Dampak | Dibutuhkan untuk KPI retention (K3) & ownership project. `BRD.md 3.2 catatan` |
| Bukti | ASUMSI A1/P-A1 `BRD.md 7.1` ; `PRD.md 5 (FR-18)` ; `RAG-CONTEXT.md 7, 9 G2` |

### FR-19: UI Dwibahasa ID + EN (SHOULD)

| Aspek | Realisasi Teknis |
|---|---|
| Mekanisme | i18n via `next-intl` (ASUMSI) di `src/i18n/`. Locale `id` + `en`. Toggle di header. Persisten via cookie. |
| Scope | UI label, pesan error, placeholder, tombol. Konten generate LLM bahasa sesuai input/judul (ASUMSI NFR-I2 ikut judul). |
| File | `src/i18n/messages/id.json`, `src/i18n/messages/en.json`. |
| Bukti | ASUMSI A2/P-A2 `BRD.md 7.1` ; `PRD.md 5 (FR-19)` ; `RAG-CONTEXT.md 9 G5` |

### FR-20..FR-22 (COULD) & FR-23..FR-28 (WONT)

Detail ditangguhkan ke fase akhir. Asumsi di `MRD.md 10` & `PRD.md 10.2`. SRS
fase awal tidak spesifikasikan. F-23 (payment) WONT `BRD.md 8.2 #5`. F-24
(media gen) WONT OOS-T1. F-25 (TTS) WONT OOS-T2.

---

## 6. Data Model Overview

> **Catatan:** Overview di sini. Detail penuh tabel, kolom, tipe, index,
> constraint, migration, seed di `DATABASE_SCHEMA.md`. SRS hanya definisikan
> entitas + atribut kunci + relasi.

### 6.1 Entitas & Atribut Kunci

| Entitas | Atribut kunci | Relasi | Bukti |
|---|---|---|---|
| `User` | `id`, `email`, `name`, `created_at` | 1:N Project, 1:N ProviderConfig | ASUMSI A1 `BRD.md 7.1` ; `RAG-CONTEXT.md 7, 9 G2` |
| `ProviderConfig` | `id`, `user_id`, `provider` (ollama/openrouter/9router/custom), `base_url`, `model`, `api_key_encrypted` (AES-256-GCM), `created_at`, `updated_at` | N:1 User | `PRD.md 5 (FR-13, FR-14)` ; `RAG-CONTEXT.md 4 (Setting)` |
| `Project` | `id`, `user_id`, `title`, `duration_type`, `duration_target_seconds`, `style_type` (3D/2D), `aspect_ratio`, `result_json` (TEXT serialize hasil generate), `status`, `created_at`, `updated_at`, `deleted_at` (soft) | N:1 User, 1:N AssetReference, 1:N GenerationLog | `RAG-CONTEXT.md 4 (Project)` ; `PRD.md 5 (FR-15)` |
| `AssetReference` | `id`, `project_id`, `tipe` (tokoh/background), `filename`, `blob_url`, `label`, `created_at` | N:1 Project | `RAG-CONTEXT.md 4 (ReferenceImage)` ; `PRD.md 5 (FR-17)` |
| `Character` | `id`, `project_id`, `nama`, `gayarambut`, `wajah_asal`, `pakaian_atas`, `pakaian_bawah`, `alas_kaki`, `deskripsi_latar`, `aksi`, `peran` (utama/lain/pendamping) | N:1 Project | `RAG-CONTEXT.md 4 (Character)` ; `PRD.md 5 (FR-07)` |
| `Scene` | `id`, `project_id`, `order`, `description`, `voiceover_script`, `created_at` | N:1 Project, 1:N ImagePrompt | `RAG-CONTEXT.md 4 (Scene)` ; `PRD.md 5 (FR-03, FR-04)` |
| `ImagePrompt` | `id`, `scene_id` (nullable untuk master list root), `project_id`, `tipe` (tokoh/background), `target` (nama tokoh/tempat), `prompt_text`, `reference_filename` (nullable) | N:1 Scene (varian per scene) atau N:1 Project (master list root) | `RAG-CONTEXT.md 4 (ImagePrompt)` ; `PRD.md 5 (FR-06)` |
| `GenerationLog` | `id`, `project_id`, `provider`, `model`, `duration_ms`, `status` (success/fail/partial), `error_message`, `created_at` | N:1 Project | ASUMSI (telemetri, KPI K5 `BRD.md 3.2`) |
| `SupportingCharacter` | `id`, `project_id` atau `scene_id`, `nama`, `tipe` (pendukung/hewan), `aksi` | N:1 Project atau N:1 Scene | `PRD.md 5 (FR-08)` |

### 6.2 Catatan Desain Data

1. **Character master + Scene reference:** `Character` = master konsisten
   per project. `Scene` reference karakter via `nama`/id, BUKAN duplikasi
   deskripsi per scene. Ini enforce konsistensi FR-07/FR-12.
   - Sitasi: `RAG-CONTEXT.md 4 (catatan konsistensi karakter)`
2. **ImagePrompt dua tipe:** (a) master list root (`scene_id` null, 1 per
   tokoh/tempat global), (b) varian per scene (`scene_id` terisi, aksi/latar
   beda per adegan). `PRD.md 8.2 catatan field`.
3. **result_json:** hasil generate disimpan serialize TEXT di `Project.result_json`
   untuk export cepat & history. Entitas terpisah (`Scene`, `Character`,
   `ImagePrompt`) untuk query/filter/relasi bila perlu (ASUMSI, bisa hanya
   simpan JSON saja fase awal bila query entitas tidak dibutuhkan — keputusan
   `DATABASE_SCHEMA.md`).
4. **API key enkripsi:** `ProviderConfig.api_key_encrypted` = JSON
   `{iv, ciphertext, tag}` (AES-256-GCM). TIDAK ada kolom plaintext.
   - Sitasi: ASUMSI P-A10 `RAG-CONTEXT.md 11 #4`
5. **Soft delete:** `Project.deleted_at` nullable. ASUMSI fase awal soft
   delete untuk retention/history.
6. **Batas tokoh:** ASUMSI P-A3 default 10 per project (`BRD.md 7.1 A3`).
   Validasi di Zod schema input.

---
## 7. Interface/API Overview

> **Catatan:** Overview di sini. Detail penuh endpoint, method, request/response
> schema, status code, auth, error envelope, pagination di `API_CONTRACT.md`.

### 7.1 Route Overview

| Route | Method | Fungsi | Auth | Bukti |
|---|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler login/logout/session | NextAuth | `PRD.md 5 (FR-18)` |
| `/api/projects` | GET | List project per user (paginate) | wajib | `PRD.md 5 (FR-15)` |
| `/api/projects` | POST | Create project + simpan hasil generate | wajib | `PRD.md 5 (FR-15)` |
| `/api/projects/[id]` | GET | Detail project by id (ownership check) | wajib | `PRD.md 5 (FR-15)` |
| `/api/projects/[id]` | PUT | Update metadata + re-generate | wajib | `PRD.md 5 (FR-15)` |
| `/api/projects/[id]` | DELETE | Soft/hard delete + cascade | wajib | `PRD.md 5 (FR-15)` |
| `/api/generate` | POST | Generate paket prompt (streaming SSE) | wajib | `PRD.md 5 (FR-03..FR-12)` |
| `/api/settings/providers` | GET | List provider config per user (mask key) | wajib | `PRD.md 5 (FR-13)` |
| `/api/settings/providers` | POST | Save provider config (encrypt key) | wajib | `PRD.md 5 (FR-13, FR-14)` |
| `/api/settings/providers/[id]` | PUT | Update provider config | wajib | `PRD.md 5 (FR-13)` |
| `/api/settings/providers/[id]` | DELETE | Hapus provider config | wajib | `PRD.md 5 (FR-13)` |
| `/api/upload` | POST | Upload gambar referensi (multipart) -> Vercel Blob | wajib | `PRD.md 5 (FR-17)` |
| `/api/export` | GET | Export JSON / markdown (`?projectId&format`) | wajib | `PRD.md 5 (FR-16)` |

### 7.2 Pola Streaming SSE `/api/generate`

```
POST /api/generate
Content-Type: application/json
Body: { title, duration_type, target_seconds?, style, aspect_ratio, reference_images? }

Response: text/event-stream (SSE)
  data: { "type": "partial", "field": "character_profiles", "delta": "..." }
  data: { "type": "partial", "field": "scenes", "delta": "..." }
  ...
  data: { "type": "done", "result": <full structured JSON> }
  data: { "type": "error", "message": "...", "provider": "..." }
```

- Pakai AI SDK `streamObject` / `streamText` -> ReadableStream -> SSE response.
- Client render real-time per komponen (NFR-U1, NFR-U2).
- Token mulai mengalir < 10s (NFR-P3). ASUMSI A6 `RAG-CONTEXT.md 5.4, 9 G6`.

### 7.3 Error Envelope (ASUMSI)

```json
{
  "error": {
    "code": "VALIDATION_ERROR" | "PROVIDER_ERROR" | "AUTH_ERROR" | "TIMEOUT" | "INTERNAL",
    "message": "string (bahasa aktif)",
    "details": { } 
  }
}
```

- HTTP status: 400 (validation), 401 (auth), 404 (not found), 429 (rate limit),
  500 (internal), 502/504 (provider timeout).
- ASUMSI format. Detail final di `API_CONTRACT.md`.

---

## 8. Constraint Teknis

### 8.1 Vercel Serverless Constraint

| Constraint | Dampak | Mitigasi | Bukti |
|---|---|---|---|
| Filesystem tidak persisten | SQLite file lokal hilang saat instance recycle | WAJIB Turso/libSQL remote HTTP. TIDAK boleh SQLite file di prod. | `RAG-CONTEXT.md 2.2, 5.4` |
| Function timeout | Generasi multi-prompt panjang berisiko timeout | Streaming SSE (token mengalir < 10s, NFR-P3). Vercel plan: Hobby 10s, Pro 60s/300s (ASUMSI plan-specific). Pecah generate per komponen bila perlu. | `RAG-CONTEXT.md 5.4, 9 G6` ; ASUMSI A6 |
| Upload gambar di FS lokal | Hilang saat recycle | Vercel Blob untuk prod. Dev lokal `public/references/` (ASUMSI). | `RAG-CONTEXT.md 5.4, 6` |
| Tidak ada native queue gratis | Job background panjang | ASUMSI streaming SSE synchronous. Bila perlu background job, pakai layanan eksternal (ASUMSI fase akhir). | `RAG-CONTEXT.md 5.4` |

### 8.2 Turso/libSQL Constraint

| Constraint | Dampak | Mitigasi | Bukti |
|---|---|---|---|
| Akses via HTTP | Latency query < 500ms (NFR-P5) | Drizzle ORM + `@libsql/client`. Pool koneksi Drizzle. | `RAG-CONTEXT.md 2.2` |
| Env config | `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` via Vercel env | Drizzle client init di `lib/db/client.ts`. | https://docs.turso.tech/sdk/ts/guides/nextjs |
| SQLite-compatible | Fitungsi SQLite subset | Hindari fitur PostgreSQL-specific. Pakai tipe SQLite. | `RAG-CONTEXT.md 2.1` |

### 8.3 Multi-Provider LLM Constraint

| Constraint | Dampak | Mitigasi | Bukti |
|---|---|---|---|
| Semua provider WAJIB OpenAI-compatible | Ollama cloud pakai `https://ollama.com/v1` (bukan native `/api`) | `createOpenAICompatible`. Ollama native REST = out. | `RAG-CONTEXT.md 5.1, 5.2` ; https://docs.openclaw.ai/providers/ollama-cloud |
| Structured output tidak semua provider dukung | `supportsStructuredOutputs` bervariasi | Cek capability provider. Bila tidak dukung -> fallback `streamText` + parse JSON manual + validasi Zod. | `RAG-CONTEXT.md 5.1, 11 #1` |
| 9router `http://localhost:20128/v1` hanya lokal | Tidak reachable dari Vercel prod | 9router hanya untuk dev/lokal user. Prod: user pakai Ollama cloud/OpenRouter/custom. Server-side call only (TIDAK expose ke client). | `RAG-CONTEXT.md 5.2, 9 G4` ; ASUMSI P-A7 |
| API key per provider berbeda format | Ollama Bearer, OpenRouter Bearer+header opsional, 9router ASUMSI | Pass via `createOpenAICompatible` opsi `headers`. OpenRouter: `HTTP-Referer`, `X-OpenRouter-Title` opsional. | `RAG-CONTEXT.md 5.2, 5.3` |
| Rate limit provider | Generasi gagal | Retry 3x backoff (NFR-R3). Error jelas + opsi switch manual. | ASUMSI NFR-R3 ; `PRD.md 5 (FR-13)` |

### 8.4 API Key Enkripsi Constraint

| Constraint | Dampak | Mitigasi | Bukti |
|---|---|---|---|
| API key user WAJIB enkripsi saat simpan | Kebocoran kredensial | AES-256-GCM via env `ENCRYPTION_KEY` (32 byte). `lib/crypto/aes.ts`. | ASUMSI P-A10 `RAG-CONTEXT.md 11 #4` |
| API key TIDAK expose ke client | Response mask `****` | Helper mask di API response. Decrypt hanya server-side di `provider.factory.ts`. | `BRD.md 6 R6` ; `PRD.md 5 (FR-14)` |
| `ENCRYPTION_KEY` env wajib ada | App gagal decrypt | Vercel env var. `.env.example` dokumentasi. | ASUMSI TD8 |

### 8.5 Vercel Blob Constraint

| Constraint | Dampak | Mitigasi | Bukti |
|---|---|---|---|
| Vercel Blob butuh token `BLOB_READ_WRITE_TOKEN` | Upload gagal bila env kosong | Env var Vercel. `lib/storage/blob.ts` init. | ASUMSI A5 `RAG-CONTEXT.md 6` |
| URL publik rujuk nama file | Prompt teks rujuk URL/filename | `reference_filename` di image prompt = filename dari Blob. | `RAG-CONTEXT.md 6` |
| Dev lokal tanpa Blob | Upload ke FS lokal (tidak persisten di Vercel) | ASUMSI dev pakai `public/references/`, prod pakai Blob. Flag env `USE_VERCEL_BLOB`. | ASUMSI |

### 8.6 Output Format Constraint

| Constraint | Spesifikasi | Bukti |
|---|---|---|
| Output utama | JSON structured (PRD 8.2 schema). Validasi Zod `PromptPackageSchema`. | `PRD.md 8.2` ; ASUMSI A4 `RAG-CONTEXT.md 9 G9` |
| Export alternatif | Markdown `.md` (PRD 8.3 struktur). Route `/api/export?format=markdown`. | `PRD.md 8.3` |
| TIDAK generate media | Output = teks prompt saja. OOS-T1. | `BRD.md 8.2 #1` ; `RAG-CONTEXT.md 9 G10` |
| TIDAK TTS | Voiceover = naskah teks. OOS-T2. | `BRD.md 8.2 #2` ; `RAG-CONTEXT.md 9 G12` |

### 8.7 Zod Schema Constraint (LLM Structured Output)

Zod schema `PromptPackageSchema` di `lib/validation/schemas.ts` WAJIB match
PRD 8.2 JSON schema:

```ts
const PromptPackageSchema = z.object({
  title: z.string(),
  duration_target: z.object({ type: z.enum(['shorts','tutorial']), seconds: z.number() }),
  style: z.object({ type: z.enum(['3D','2D']), aspect_ratio: z.string() }),
  character_profiles: z.array(z.object({
    nama: z.string(),
    gayarambut: z.string(),
    wajah_asal: z.string(),
    pakaian_atas: z.string(),
    pakaian_bawah: z.string(),
    alas_kaki: z.string(),
    deskripsi_latar: z.string(),
    aksi: z.string(),
    peran: z.enum(['utama','lain','pendamping']),
  })),
  scenes: z.array(z.object({
    order: z.number(),
    description: z.string(),
    voiceover_script: z.string(),
    image_prompts: z.object({
      characters: z.array(z.object({
        target: z.string(), prompt_text: z.string(), reference_filename: z.string().nullable(),
      })),
      backgrounds: z.array(z.object({
        target: z.string(), prompt_text: z.string(), reference_filename: z.string().nullable(),
      })),
    }),
  })),
  image_prompts: z.object({
    characters: z.array(z.object({
      target: z.string(), prompt_text: z.string(), reference_filename: z.string().nullable(),
    })),
    backgrounds: z.array(z.object({
      target: z.string(), prompt_text: z.string(), reference_filename: z.string().nullable(),
    })),
  }),
  supporting_characters: z.array(z.object({
    nama: z.string(), tipe: z.enum(['pendukung','hewan']), aksi: z.string(),
  })),
  moral_message: z.string(),
});
```

- Pakai dengan `generateObject({ model, schema: PromptPackageSchema, system, messages })`.
- Sitasi: `PRD.md 8.2` ; `RAG-CONTEXT.md 11 #1` (rekomendasi structured output)

---

## 9. Keamanan

### 9.1 Tabel Keamanan

| ID | Requirement | Implementasi | Bukti |
|---|---|---|---|
| SEC-01 | API key user dienkripsi saat simpan | AES-256-GCM `lib/crypto/aes.ts`, env `ENCRYPTION_KEY`. | ASUMSI P-A10 `RAG-CONTEXT.md 11 #4` ; `BRD.md 6 R6` |
| SEC-02 | API key TIDAK expose ke client | Mask `****` di API response. Decrypt server-side only. | `BRD.md 6 R6` ; `PRD.md 5 (FR-14)` |
| SEC-03 | Provider call server-side only | `lib/ai/provider.factory.ts` + `lib/ai/generate.ts` server-only. `import 'server-only'`. TIDAK ada panggilan LLM dari Client Component. | ASUMSI (best practice) |
| SEC-04 | 9router localhost hanya server-side | 9router `http://localhost:20128/v1` tidak reachable dari client. Validasi: hanya user dev lokal pakai. | ASUMSI P-A7 `RAG-CONTEXT.md 5.2, 9 G4` |
| SEC-05 | CSRF protection | Next.js built-in CSRF untuk Server Actions + Route Handlers. NextAuth CSRF token. | ASUMSI (Next.js default) |
| SEC-06 | Input sanitization (XSS) | Zod validasi + escape HTML pada `title` & field teks sebelum render/prompt. | ASUMSI NFR-S3 `PRD.md 6.2` |
| SEC-07 | Ownership check RBAC dasar | Middleware + server check: `project.user_id === session.user.id`. User hanya akses resource miliknya. | ASUMSI NFR-S6 `PRD.md 6.2` |
| SEC-08 | Env secret management | `ENCRYPTION_KEY`, `TURSO_AUTH_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `NEXTAUTH_SECRET` di Vercel env. `.env.example` tanpa value asli. | ASUMSI (best practice) |
| SEC-09 | HTTPS only | Vercel default HTTPS. | `RAG-CONTEXT.md 2.1` ; NFR-S5 `PRD.md 6.2` |
| SEC-10 | Rate limit endpoint generate | ASUMSI 10 req/min/user. Middleware rate limit. | ASUMSI NFR-S4 `PRD.md 6.2` |
| SEC-11 | Auth protected routes | Middleware `lib/auth/middleware.ts`. Protected: `/projects`, `/settings`, `/generate`, `/api/*` (kecuali `/api/auth`). | `PRD.md 5 (FR-18)` |
| SEC-12 | NextAuth secret | `NEXTAUTH_SECRET` env wajib. | ASUMSI (NextAuth default) |

---
## 10. Tahapan Implementasi

Urut, actionable. Tiap fase menghasilkan shipable increment.

### Fase 1: Skeleton + DB + Auth + Provider + Generate Shorts + Export JSON (MUST core)

| # | Langkah | Detail | Bukti |
|---|---|---|---|
| F1-01 | Init proyek Next.js | `create-next-app` App Router + TypeScript + Tailwind v4. Install shadcn/ui. | `RAG-CONTEXT.md 2.1` |
| F1-02 | Setup Turso + Drizzle | Buat DB Turso, dapatkan URL+token. Install `@libsql/client` + `drizzle-orm` + `drizzle-kit`. `lib/db/client.ts`, `lib/db/schema.ts` (entitas section 6). Migration awal. | `RAG-CONTEXT.md 2.1, 2.2` ; https://docs.turso.tech/sdk/ts/guides/nextjs |
| F1-03 | Setup NextAuth | Install NextAuth v5+. `lib/auth/config.ts` credentials provider (ASUMSI). Middleware protected routes. | `PRD.md 5 (FR-18)` |
| F1-04 | Provider factory + crypto | `lib/ai/provider.factory.ts` `createOpenAICompatible`. `lib/crypto/aes.ts` AES-256-GCM. `lib/db/schema.ts` ProviderConfig. | `PRD.md 5 (FR-13, FR-14)` ; `RAG-CONTEXT.md 5.1` |
| F1-05 | Zod schema + prompt templates | `lib/validation/schemas.ts` `PromptPackageSchema` (section 8.7). `lib/ai/prompts/*.system.ts` (scenes, voiceover, character, image_prompts, moral). | `PRD.md 8.2` ; `RAG-CONTEXT.md 11 #1` |
| F1-06 | Generate endpoint streaming | `/api/generate` SSE. `lib/ai/generate.ts` `generateObject`/`streamObject`. Post-check konsistensi (FR-12). | `PRD.md 5 (FR-03..FR-12)` |
| F1-07 | UI generate (Shorts) | Form input (title, duration_type=shorts, style, aspect_ratio). Streaming display per komponen. Copy-to-clipboard. | `PRD.md 3.1 (US-01..US-12)` ; NFR-U1/U2/U4 |
| F1-08 | Project CRUD | `/api/projects` + Server Actions. List/detail/update/delete. Ownership check. | `PRD.md 5 (FR-15)` |
| F1-09 | Export JSON | `/api/export?format=json`. Download `.json`. | `PRD.md 5 (FR-16)` |
| F1-10 | Settings provider UI | Form provider + base URL + model + API key. Save encrypt. Mask display. | `PRD.md 5 (FR-13, FR-14)` |
| F1-11 | Deploy Vercel | Deploy preview. Set env: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ENCRYPTION_KEY`, `NEXTAUTH_SECRET`. | `RAG-CONTEXT.md 2.1` |

**Fase 1 Definition of Done:** user bisa login, set provider, generate paket
prompt Shorts, save project, export JSON. Semua MUST FR-01..FR-16 jalan.

### Fase 2: Upload Referensi + Tutorial + Markdown + Dwibahasa (SHOULD)

| # | Langkah | Detail | Bukti |
|---|---|---|---|
| F2-01 | Vercel Blob setup | Install `@vercel/blob`. `lib/storage/blob.ts`. Env `BLOB_READ_WRITE_TOKEN`. | `PRD.md 5 (FR-17)` ; ASUMSI A5 |
| F2-02 | Upload endpoint + UI | `/api/upload` multipart. Form upload gambar referensi (tipe tokoh/background). Simpan `AssetReference`. | `PRD.md 5 (FR-17)` |
| F2-03 | Inject reference_filename | Generate prompt rujuk `reference_filename` di image prompt (FR-06, FR-17). | `PRD.md 5 (FR-17)` |
| F2-04 | Generate Tutorial | Support `duration_type=tutorial` (7-15 menit, 8-20 adegan ASUMSI P-A12). Adjust prompt template. | `PRD.md 5 (FR-02)` |
| F2-05 | Export Markdown | `/api/export?format=markdown`. Template `lib/export/markdown.template.ts` (PRD 8.3 struktur). | `PRD.md 5 (FR-16), 8.3` |
| F2-06 | i18n dwibahasa | Install `next-intl` (ASUMSI). `src/i18n/messages/id.json`, `en.json`. Toggle ID/EN. | `PRD.md 5 (FR-19)` ; ASUMSI A2 |

**Fase 2 DoD:** upload referensi jalan, Tutorial mode jalan, export markdown
jalan, UI dwibahasa.

### Fase 3: Polish UI + Konsistensi + History + Template (COULD + polish)

| # | Langkah | Detail | Bukti |
|---|---|---|---|
| F3-01 | Konsistensi post-check UI | Tampilkan warning mismatch karakter (FR-12). | `PRD.md 5 (FR-12)` |
| F3-02 | History generasi | `GenerationLog` entitas. UI history per project. Compare/rollback (ASUMSI F-21 COULD). | `PRD.md 4 (F-21)` |
| F3-03 | Template library judul | Library judul animasi populer (ASUMSI F-20 COULD). | `PRD.md 4 (F-20)` |
| F3-04 | Polish UI/UX | Loading state, error state, empty state, animasi micro. WCAG AA (NFR-A1). | `PRD.md 6.5, 6.6` |
| F3-05 | Telemetri KPI | Log `GenerationLog` untuk KPI K1-K7. Dashboard sederhana (ASUMSI). | `BRD.md 3.2` |
| F3-06 | Rate limit | Middleware rate limit endpoint generate (NFR-S4). | `PRD.md 6.2` |

**Fase 3 DoD:** konsistensi check visible, history jalan, template library
jalan, UI polish, telemetri KPI.

---

## 11. Verifikasi & Test

### 11.1 Test Strategy

| Level | Tool | Scope | Target coverage | Bukti |
|---|---|---|---|---|
| Unit | Vitest | `lib/ai`, `lib/db`, `lib/crypto`, `lib/validation`, `lib/storage`, `lib/export` | >= 80% (ASUMSI) | ASUMSI (best practice) |
| Integration | Vitest + Turso test DB | API route handlers + Server Actions + DB query | >= 70% (ASUMSI) | ASUMSI |
| E2E | Playwright | Flow: login -> set provider -> generate Shorts -> save -> export JSON. Upload referensi -> generate Tutorial -> export markdown. | Critical path 100% | ASUMSI |
| Lint | ESLint (`next lint`) + tsc | Seluruh `src/` | 0 error, 0 warning (ASUMSI strict) | ASUMSI |
| Build | `next build` | Production build | Sukses tanpa error | ASUMSI |
| Type check | `tsc --noEmit` | Type safety | 0 error | ASUMSI |

### 11.2 Test Case Kunci (mapping AC PRD)

| AC PRD | Test case | Level | Bukti |
|---|---|---|---|
| AC-01 | Input judul: empty -> 400, < 3 char -> 400, > 200 -> 400, valid -> pass | Unit (Zod) + E2E | `PRD.md 7 (AC-01)` |
| AC-02 | Durasi shorts > 180 -> 400. Tutorial di luar 420-900 -> warning. | Unit + E2E | `PRD.md 7 (AC-02)` |
| AC-03/09 | Generate `scenes[]` urut, `order` 1..N, `description` non-kosong, jumlah sesuai durasi. | Integration (mock LLM) + E2E | `PRD.md 7 (AC-03/09)` |
| AC-04 | Tiap scene `voiceover_script` teks, bukan audio. | Integration | `PRD.md 7 (AC-04)` |
| AC-05 | Tanpa referensi -> `character_profiles[]` & `image_prompts.backgrounds[]` terisi. | Integration | `PRD.md 7 (AC-05)` |
| AC-06 | `image_prompts.characters[]` = N untuk N tokoh, `backgrounds[]` = M. | Integration | `PRD.md 7 (AC-06)` |
| AC-07 | Tiap karakter field lengkap (nama, gayarambut, dst), `peran` valid enum. | Integration (Zod parse) | `PRD.md 7 (AC-07)` |
| AC-08 | `supporting_characters[]` terisi bila ada, tiap `aksi` non-kosong. | Integration | `PRD.md 7 (AC-08)` |
| AC-10 | `style` + `aspect_ratio` di root JSON + image prompts. | Integration | `PRD.md 7 (AC-10)` |
| AC-11 | `moral_message` non-kosong, positif (manual review). | Integration + manual | `PRD.md 7 (AC-11)` |
| AC-12 | Identitas karakter SAMA di `character_profiles` & `scenes[]` reference. `aksi`/`deskripsi_latar` boleh beda. Mismatch -> warning. | Unit (`consistency-check.ts`) | `PRD.md 7 (AC-12)` |
| AC-13 | Form provider, base URL pre-fill, save, provider aktif, gagal -> error + switch. | E2E | `PRD.md 7 (AC-13)` |
| AC-14 | API key enkripsi di DB (bukan plaintext), response mask `****`, decrypt server-only. | Unit (crypto) + integration | `PRD.md 7 (AC-14)` |
| AC-15 | CRUD project: create, list paginate, detail ownership, update, delete cascade. | Integration + E2E | `PRD.md 7 (AC-15)` |
| AC-16 | Export JSON valid struktur, export markdown terbaca lengkap. | Integration + E2E | `PRD.md 7 (AC-16)` |
| AC-17 | Upload multipart, metadata `AssetReference`, `reference_filename` muncul, tanpa referensi -> null fitur tetap jalan. | E2E | `PRD.md 7 (AC-17)` |
| AC-18 | NextAuth login, protected redirect, scoped per user. | E2E | `PRD.md 7 (AC-18)` |
| AC-19 | Toggle ID/EN mengubah UI label + pesan error. | E2E | `PRD.md 7 (AC-19)` |
| NFR-P1 | Shorts <= 60s end-to-end (streaming). | E2E timing | `PRD.md 7 (NFR)` |
| NFR-P2 | Tutorial <= 180s end-to-end (streaming). | E2E timing | `PRD.md 7 (NFR)` |
| NFR-P3 | Token mulai mengalir < 10s. | E2E timing | `PRD.md 7 (NFR)` |
| NFR-S1/S2 | API key enkripsi + mask. | Unit + integration | `PRD.md 7 (NFR)` |
| NFR-A1 | WCAG AA. | Manual audit + axe (ASUMSI) | `PRD.md 7 (NFR)` |

### 11.3 Definition of Done Teknis (per fase)

- **Fase 1 DoD:** `next build` sukses, `tsc --noEmit` 0 error, `next lint` 0
  error, Vitest unit+integration >= 80%/70% coverage, Playwright E2E flow
  Shorts sukses, deploy Vercel preview jalan.
- **Fase 2 DoD:** Fase 1 DoD + E2E upload referensi + Tutorial + markdown
  export + dwibahasa toggle sukses.
- **Fase 3 DoD:** Fase 2 DoD + konsistensi check UI + history + template
  library + WCAG AA audit + telemetri KPI.

### 11.4 Command Verifikasi (ASUMSI)

```bash
npm run lint         # next lint
npx tsc --noEmit     # type check
npm run build        # next build
npm run test         # vitest unit+integration
npm run test:e2e     # playwright
npm run coverage     # vitest --coverage
```

---

## 12. Asumsi Teknis

| ID | Asumsi | Status Bukti | Dampak | Sitasi |
|---|---|---|---|---|
| SRS-A1 | App multi-user dengan login NextAuth credentials | TIDAK ADA BUKTI preferensi provider auth | Pilih credentials sederhana fase awal | `BRD.md 7.1 A1` ; `RAG-CONTEXT.md 9 G2` |
| SRS-A2 | UI dwibahasa pakai next-intl | TIDAK ADA BUKTI preferensi lib | Bisa diganti native App Router i18n | `BRD.md 7.1 A2` ; `RAG-CONTEXT.md 9 G5` |
| SRS-A3 | ORM = Drizzle (bukan Prisma/raw libsql) | TIDAK ADA BUKTI preferensi user | RAG menyebut raw @libsql/client atau Prisma alternatif | `RAG-CONTEXT.md 2.1, 9 G7` |
| SRS-A4 | Enkripsi API key = AES-256-GCM via env `ENCRYPTION_KEY` | TIDAK ADA BUKTI mekanisme spesifik | Bisa defer ke secret manager | `RAG-CONTEXT.md 11 #4` ; `PRD.md 10.2 P-A10` |
| SRS-A5 | Storage gambar prod = Vercel Blob | ASUMSI rekomendasi | Bisa S3/R2 alternatif | `RAG-CONTEXT.md 6, 9 G3` |
| SRS-A6 | Streaming SSE untuk generasi panjang | ASUMSI | Hindari Vercel timeout | `RAG-CONTEXT.md 5.4, 9 G6` ; `PRD.md 10.2 P-A6` |
| SRS-A7 | 9router `http://localhost:20128/v1` valid lokal, Bearer/none auth | TIDAK ADA BUKTI eksternal | Hanya dev lokal, validasi user | `RAG-CONTEXT.md 5.2, 9 G4` |
| SRS-A8 | Default model LLM per provider: user input (no hardcode default) | TIDAK ADA BUKTI model default | SRS rekomendasi list model per provider di UI hint | `RAG-CONTEXT.md 9 G8` |
| SRS-A9 | Versi library (NextAuth, Drizzle, Zod, Vitest, Playwright, next-intl) = "stabil terkini per 2025" | TIDAK ADA BUKTI nomor versi spesifik di RAG (kecuali AI SDK v6, Tailwind v4) | Lock versi di package.json saat init | `RAG-CONTEXT.md 2.1` |
| SRS-A10 | Batas tokoh default 10 per project | TIDAK ADA BUKTI | Validasi Zod input | `BRD.md 7.1 A3` ; `RAG-CONTEXT.md 9 G11` |
| SRS-A11 | Jumlah adegan: shorts 3-6, tutorial 8-20 | ASUMSI | Pass ke prompt LLM | `PRD.md 10.2 P-A12` |
| SRS-A12 | Latency Shorts <= 60s, Tutorial <= 180s (streaming) | ASUMSI | NFR-P1/P2 target | `PRD.md 10.2 P-A11` |
| SRS-A13 | Auto-fallback provider = manual switch (bukan otomatis) fase awal | ASUMSI | Error jelas + opsi switch | `PRD.md 10.2 P-A13` |
| SRS-A14 | Retry policy LLM = 3x backoff | ASUMSI | NFR-R3 | `PRD.md 6.4 NFR-R3` |
| SRS-A15 | Rate limit generate = 10 req/min/user | ASUMSI | NFR-S4 | `PRD.md 6.2 NFR-S4` |
| SRS-A16 | Soft delete project (`deleted_at`) | ASUMSI | Retention/history | (best practice) |
| SRS-A17 | Dev lokal upload FS `public/references/`, prod Vercel Blob | ASUMSI | Flag env `USE_VERCEL_BLOB` | `RAG-CONTEXT.md 6` |
| SRS-A18 | Persona target kreator/studio/edukator | TIDAK ADA BUKTI eksplisit | Dari paket konteks orchestrator | `BRD.md 4` ; `RAG-CONTEXT.md 7` |
| SRS-A19 | Vercel function timeout plan: Hobby 10s, Pro 60s/300s | ASUMSI plan-specific | Cek plan Vercel aktual | `RAG-CONTEXT.md 5.4` |
| SRS-A20 | Node runtime versi didukung Vercel stabil terkini | ASUMSI | Vercel default | `RAG-CONTEXT.md 2.1` |

---

## 13. Referensi

### 13.1 Dokumen Internal

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` |
| MRD | `C:\laragon\www\PromptFlow\product-docs\MRD.md` |
| PRD | `C:\laragon\www\PromptFlow\product-docs\PRD.md` |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### 13.2 Sitasi Eksternal Kunci

| Sitasi | Klaim didukung | Bagian SRS |
|---|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | `createOpenAICompatible` API, structured output, streaming, tool calling | 4.1, 5, 8.3 |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter `https://openrouter.ai/api/v1`, Bearer, header opsional | 5 (FR-13), 8.3 |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat `https://ollama.com/v1` | 5 (FR-13), 8.3 |
| https://docs.ollama.com/cloud | Ollama cloud API access, Bearer key | 8.3 |
| https://docs.openclaw.ai/providers/ollama-cloud | Saran pakai OpenAI-compat provider untuk `/v1/chat/completions` | 8.3 |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js App Router setup, `@libsql/client` | 4.1, 8.2, 10 (F1-02) |
| https://turso.tech/blog/serverless | Vercel filesystem tidak persisten -> Turso solusi | 4.1, 8.1 |
| https://vercel.com/marketplace/tursocloud | Turso resmi di Vercel Marketplace | 4.1 |
| https://ui.shadcn.com/docs/installation/next | shadcn/ui install Next.js | 4.1 |
| https://ui.shadcn.com/docs/tailwind-v4 | shadcn/ui Tailwind v4 support | 4.1 |
| https://vercel.com/docs/vercel-blob | Vercel Blob storage | 4.1, 8.5 |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter via deskripsi terstruktur | 5 (FR-07, FR-12) |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter terstruktur | 5 (FR-07, FR-12) |
| https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference | Midjourney `--cref` butuh image reference (bukan teks filename) | 5 (FR-06, FR-17) |

### 13.3 Catatan Bukti RAG

RAG-CONTEXT.md menandai gap berikut "TIDAK ADA BUKTI" yang relevan SRS:
- G2 (auth): SRS asumsikan NextAuth credentials (SRS-A1). Validasi user.
- G3 (storage): SRS asumsikan Vercel Blob (SRS-A5). Validasi user.
- G4 (9router): SRS asumsikan Bearer/none lokal (SRS-A7). Validasi user.
- G5 (bahasa UI): SRS asumsikan next-intl (SRS-A2). Validasi UIUX_SPEC.
- G6 (streaming): SRS asumsikan SSE (SRS-A6). Validasi timeout plan.
- G7 (ORM): SRS pilih Drizzle (SRS-A3). Bisa diubah di DATABASE_SCHEMA.
- G8 (model default): SRS user input model, no hardcode (SRS-A8).
- G9 (format output): SRS JSON structured + Zod (section 8.7).
- G11 (batas tokoh): SRS default 10 (SRS-A10).

---

**Dokumen ini fokus pada SPESIFIKASI TEKNIS EKSEKUTABEL. Tujuan bisnis di BRD,
pasar di MRD, produk di PRD, arsitektur penuh di PROJECT_ARCHITECTURE, data
penuh di DATABASE_SCHEMA, kontrak API penuh di API_CONTRACT, aturan kode di
CODING_RULES. SRS tidak membangun deliverable akhir — hanya spesifikasi.**

> **Dibuat oleh:** docgen-srs subagent
> **Tanggal:** 2026-06-19
> **Versi:** 1.0
