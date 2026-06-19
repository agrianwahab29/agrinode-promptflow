# RAG-CONTEXT — PromptFlow

> Knowledge Core pipeline docgen. Sumber kebenaran faktual untuk subagent lain
> (BRD/MRD/PRD/SRS/DATABASE_SCHEMA/ARCHITECTURE/CODING_RULES). Tiap klaim penting
> bersitasi. Bila tak ada bukti -> ditandai "TIDAK ADA BUKTI" / "ASUMSI".

**Dibuat:** 2026-06-19
**Root proyek:** `C:\laragon\www\PromptFlow`
**Docs dir:** `C:\laragon\www\PromptFlow\product-docs`
**GitHub:** https://github.com/agrianwahab29/promptflow.git

---

## 1. Ringkasan Temuan

**Proyek greenfield.** Direktori `C:\laragon\www\PromptFlow` hanya berisi folder
`product-docs` (kosong). **Tidak ada kode existing, tidak ada package.json,
tidak ada schema, tidak ada config.** Semua fakta teknis berikut berasal dari
retrieval eksternal (web resmi) + paket konteks user.

| Aspek | Status |
|---|---|
| Kode existing | TIDAK ADA (greenfield) |
| Stack final | Dikonfirmasi via web resmi (lihat §2) |
| Base URL OpenRouter | Dikonfirmasi resmi: `https://openrouter.ai/api/v1` |
| Base URL Ollama cloud | Dikonfirmasi resmi: native `https://ollama.com/api`, OpenAI-compat `https://ollama.com/v1` |
| Pola multi-provider AI SDK | Dikonfirmasi via `@ai-sdk/openai-compatible` |
| DB Vercel serverless | Turso/libSQL dikonfirmasi (SQLite murni tidak persisten di Vercel) |
| Upload gambar referensi | ASUMSI pola (Vercel Blob / lokal dev), perlu konfirmasi user |
| Konsistensi karakter prompt | Berbasis literatur prompt engineering, BUKAN API bawaan |

---

## 2. Tech Stack Terdeteksi + Rekomendasi Final

### 2.1 Rekomendasi Stack Final (TERKONFIRMASI via web resmi)

| Lapisan | Teknologi | Versi target | Sitasi |
|---|---|---|---|
| Frontend+Backend | Next.js (App Router, fullstack satu repo) | 15+ / 16 | https://vercel.com/academy/ai-summary-app-with-nextjs/modern-nextjs-setup ; https://nextjs.org/docs |
| Styling | Tailwind CSS v4 | v4 | https://ui.shadcn.com/docs/tailwind-v4 |
| Komponen UI | shadcn/ui (Next.js install) | latest | https://ui.shadcn.com/docs/installation/next |
| AI orchestration | Vercel AI SDK + `@ai-sdk/openai-compatible` | AI SDK v6 (latest) | https://ai-sdk.dev/providers/openai-compatible-providers |
| DB | Turso (libSQL, SQLite-compatible over HTTP) | latest | https://docs.turso.tech/sdk/ts/guides/nextjs ; https://turso.tech/blog/serverless |
| DB client | `@libsql/client` (raw) ATAU Prisma adapter | Prisma 5.4+ | https://docs.turso.tech/sdk/ts/guides/nextjs ; https://stackoverflow.com/questions/78849819 |
| Deploy | Vercel | n/a | https://vercel.com/marketplace/tursocloud |

**Catatan stack:** Next.js App Router + Turso + AI SDK adalah kombinasi yang
didukung resmi Vercel Marketplace (Turso Cloud integration). TIDAK ADA BUKTI
kontradiksi. Rekomendasi orchestrator (Next.js + Turso + AI SDK) **DIKONFIRMASI**.

### 2.2 Catatan penting Turso vs SQLite murni

- Vercel Functions = serverless, filesystem **tidak persisten**. SQLite file
  lokal di Vercel akan hilang saat instance reuse/recycle.
  - Sitasi: https://turso.tech/blog/serverless (membahas dua pendekatan:
    remote HTTP vs embedded reads dengan sync)
- Solusi resmi: **Turso (libSQL)**, SQLite-compatible, akses via HTTP.
  - Sitasi: https://docs.turso.tech/sdk/ts/guides/nextjs
- Alternatif: Prisma + adapter Turso (Prisma mendukung Turso sejak v5.4).
  - Sitasi: https://stackoverflow.com/questions/78849819
- **ASUMSI lokal dev:** Gunakan Turso juga di dev (DB remote free tier) ATAU
  SQLite lokal via better-sqlite3 di dev lalu Turso di prod. Perlu keputusan
  dokumen lain. TIDAK ADA BUKTI preferensi user.

---

## 3. Struktur Proyek Inti

**TIDAK ADA struktur existing.** Folder root hanya berisi `product-docs/`.

**ASUMSI struktur (untuk dokumen lain jadikan acuan, BUKAN fakta proyek):**
```
PromptFlow/
  product-docs/          # dokumen (BRD/MRD/PRD/SRS/...)
  src/
    app/                 # Next.js App Router
      api/               # route handlers (generate, projects, settings)
      (dashboard)/       # UI pages
    lib/
      ai/                # provider factory multi-provider
      db/                # turso client + schema
      prompts/           # prompt templates untuk LLM
    components/          # shadcn/ui + custom
  public/
    references/          # gambar referensi upload (ASUMSI; lihat §6)
  prisma/                # schema.prisma (bila pakai Prisma)
```

---

## 4. Entitas / Data Model Terdeteksi

**TIDAK ADA schema/migration/model existing.** Berikut entitas yang dapat
diturunkan dari paket konteks user (ASUMSI, perlu SRS/DB_SCHEMA validasi):

| Entitas | Atribut kunci (dari fitur user) | Sumber fitur |
|---|---|---|
| Project | id, judul_animasi, durasi_target, tipe (shorts/edukasi), gaya_gambar, rasio_aspect, created_at | Fitur 1, 3, 4h |
| ReferenceImage | id, project_id, tipe (tokoh/background), filename, path, created_at | Fitur 2 |
| Character | id, project_id, nama, gaya_rambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran (utama/lain/pendamping) | Fitur 4e, 5 |
| Scene | id, project_id, urutan, deskripsi, voiceover, gaya_gambar, rasio_aspect | Fitur 4a, 4b, 4g |
| ImagePrompt | id, scene_id, tipe (tokoh/background), target_nama, prompt_text, reference_filename (nullable) | Fitur 4d |
| VoiceoverScript | id, scene_id, teks, ekspresi | Fitur 4b |
| Setting | id, user_id, provider (ollama/openrouter/9router/custom), base_url, api_key (ENCRYPTED), model | Fitur user setting |
| GenerationResult | id, project_id, pesan_moral, created_at | Fitur 7 |

**Catatan konsistensi karakter (Fitur 5):** Atribut Character WAJIB stabil
lintas scene. Skema harus menyimpan 1 master Character + referensi dari Scene,
BUKAN duplikasi deskripsi per scene. Ini konstrain desain data.

---

## 5. Constraint Nyata

### 5.1 Multi-provider AI (TERKONFIRMASI)

Pakai `@ai-sdk/openai-compatible` `createOpenAICompatible`:
```ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
const provider = createOpenAICompatible({
  name: 'providerName',
  apiKey: process.env.PROVIDER_API_KEY,
  baseURL: 'https://...',
});
const model = provider('model-id');
```
- Sitasi: https://ai-sdk.dev/providers/openai-compatible-providers
- Mendukung: text generation, streaming, tool calling, structured outputs
  (bila `supportsStructuredOutputs: true`), system messages, multi-modal input.
- Opsi penting: `transformRequestBody` (untuk proxy dgn format beda),
  `headers` (custom header), `queryParams`.

### 5.2 Base URL yang BENAR (TERKONFIRMASI resmi)

| Provider | Base URL | Catatan | Sitasi |
|---|---|---|---|
| OpenRouter | `https://openrouter.ai/api/v1` | OpenAI-compat. Header opsional: `HTTP-Referer`, `X-OpenRouter-Title`. Auth: `Bearer <key>`. | https://openrouter.ai/docs/api/reference/authentication |
| Ollama cloud (native) | `https://ollama.com/api` | REST API native Ollama (bukan OpenAI format) | https://docs.ollama.com/api/introduction |
| Ollama cloud (OpenAI-compat) | `https://ollama.com/v1` | Endpoint `/v1/chat/completions` OpenAI-compat | https://ollama.com/blog/openai-compatibility ; https://github.com/MarlBurroW/kinbot/issues/333 |
| Ollama lokal | `http://localhost:11434/v1` | OpenAI-compat lokal | https://ollama.com/blog/openai-compatibility |
| 9router (custom proxy user) | `http://localhost:20128/v1` | Dari paket user. TIDAK ADA BUKTI eksternal (proxy lokal user). | ASUMSI user |

**Catatan Ollama cloud:** OpenClaw docs menyarankan pakai OpenAI-compatible
provider saat butuh `/v1/chat/completions` semantics. Jadi untuk PromptFlow
( pakai AI SDK OpenAI-compat) -> gunakan `https://ollama.com/v1`.
- Sitasi: https://docs.openclaw.ai/providers/ollama-cloud

**Peringatan penting:** Klaim user "ollama cloud: https://ollama.com/v1"
TERKONFIRMASI benar untuk path OpenAI-compat. Tapi ada juga issue GitHub
yang mencatat beberapa client keliru kirim ke `/v1/responses` (endpoint
Responses API, belum stabil di Ollama).
- Sitasi: https://github.com/MarlBurroW/kinbot/issues/333

### 5.3 Auth & Header wajib per provider

- OpenRouter: `Authorization: Bearer <key>`, opsional `HTTP-Referer`, `X-OpenRouter-Title`.
- Ollama cloud: API key Ollama (dari ollama.com sign in). Auth via Bearer.
  - Sitasi: https://docs.ollama.com/cloud ; https://ollama.com/blog/cloud-models
- 9router: ASUMSI Bearer/none — perlu konfirmasi user.

### 5.4 Constraint Vercel serverless

- Filesystem tidak persisten -> DB file SQLite lokal TIDAK boleh di prod.
- Upload gambar: filesystem lokal tidak cocok untuk prod Vercel.
  - **ASUMSI rekomendasi:** Vercel Blob (untuk simpan gambar referensi) ATAU
    upload ke storage eksternal (S3/R2). Perlu keputusan dokumen lain.
    TIDAK ADA BUKTI preferensi user.
- Function timeout Vercel: perlu cek plan. Generasi multi-prompt panjang
  berisiko timeout -> pertimbangkan streaming / background job (Vercel
  tidak punya native queue gratis -> ASUMSI pakai streaming SSE).

---

## 6. Pola Upload Gambar Referensi (ASUMSI + literatur)

Fitur 2 user: upload gambar tokoh/background, sistem rujuk **nama file**
sebagai referensi dalam prompt.

**TIDAK ADA BUKTI implementasi spesifik.** Pola yang direkomendasikan:
1. User upload gambar via form (multipart).
2. Server (route handler Next.js) terima upload, simpan ke Vercel Blob /
   storage, dapatkan URL/nama file.
3. Simpan metadata (filename, path, tipe tokoh/background) ke tabel
   `ReferenceImage`.
4. Saat generate prompt, inject nama file ke prompt teks, mis:
   `"Character 'Hero' — reference image: hero-ref.png. Maintain visual
   consistency with this reference."`
5. Output prompt menyertakan field `reference_filename`.

**Literatur konsistensi karakter (BUKAN API bawaan):**
- Midjourney `--cref` (Character Reference) butuh image reference ID, bukan
  nama file teks. Namun PromptFlow output = prompt teks, bukan panggil API
  image gen langsung. Jadi rujukan nama file dalam prompt adalah konvensi
  teks untuk user copy ke tool image gen.
  - Sitasi: https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference
- Pendekatan umum: deskripsi karakter terstruktur (nama, rambut, wajah,
  pakaian, latar, aksi) diulang konsisten lintas prompt = metode prompt
  engineering untuk konsistensi.
  - Sitasi: https://kling.ai/blog/ai-character-consistency-guide
  - Sitasi: https://glibatree.com/proven-consistent-character-method/
- **Struktur Character user (Fitur 4e) SELARAS dengan praktik prompt
  engineering** (nama, rambut, wajah, pakaian atas/bawah, alas kaki, latar, aksi).
  - DIKONFIRMASI sebagai pola valid.

---

## 7. Aktor / Role

Dari paket konteks user: hanya menyebut "user" (operator aplikasi).
**TIDAK ADA BUKTI multi-role/auth system.**

- ASUMSI: Single-user app (atau auth opsional). Perlu konfirmasi PRD apakah
  butuh login (NextAuth/Clerk) atau app lokal pribadi.
- TIDAK ADA BUKTI entitas User di schema.

---

## 8. Aset Terdeteksi

**TIDAK ADA aset existing** (logo, gambar, font). Greenfield.

ASUMSI (perlu UIUX_SPEC):
- Font: Inter atau Geist (default Next.js/Tailwind v4).
- Tema: light/dark via shadcn/ui.
- TIDAK ADA BUKTI brand asset.

---

## 9. Gap & "TIDAK ADA BUKTI"

| # | Item | Status | Dampak |
|---|---|---|---|
| G1 | Kode/schema existing | TIDAK ADA (greenfield) | Semua dokumen mulai dari nol |
| G2 | Preferensi auth (login atau tidak) | TIDAK ADA BUKTI | PRD harus keputuskan |
| G3 | Storage gambar prod (Vercel Blob vs lain) | TIDAK ADA BUKTI | SRS/ARCHITECTURE harus pilih |
| G4 | 9router proxy detail (auth, format) | TIDAK ADA BUKTI | SRS harus konfirmasi user |
| G5 | Bahasa UI (ID/EN) | TIDAK ADA BUKTI | UIUX_SPEC harus keputuskan |
| G6 | Streaming vs batch untuk generasi panjang | ASUMSI streaming SSE | SRS harus validasi timeout |
| G7 | Prisma vs raw @libsql/client | TIDAK ADA BUKTI preferensi | DB_SCHEMA/ARCHITECTURE pilih |
| G8 | Model LLM default per provider | TIDAK ADA BUKTI | SRS list rekomendasi |
| G9 | Format output prompt (JSON/markdown/plain) | TIDAK ADA BUKTI | SRS harus definisikan |
| G10 | API image gen langsung atau output teks prompt saja | User: "Output = prompt-prompt (bukan file media)" -> DIKONFIRMASI teks prompt saja | TIDAK ADA gap |
| G11 | Batas jumlah tokoh/background per project | TIDAK ADA BUKTI | SRS tentukan |
| G12 | Voiceover TTS langsung atau output naskah teks | User: output naskah teks -> DIKONFIRMASI teks | TIDAK ADA gap |

---

## 10. Daftar Sitasi Lengkap

| Sitasi | Klaim yang didukung |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | createOpenAICompatible API, opsi baseURL/apiKey/transformRequestBody, dukungan structured outputs/streaming/tool calling |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter `https://openrouter.ai/api/v1`, auth Bearer, header HTTP-Referer/X-OpenRouter-Title |
| https://openrouter.ai/docs/quickstart | OpenRouter unified API, OpenAI-compatible |
| https://openrouter.ai/docs/api/api-reference/models/get-models | Endpoint GET `/api/v1/models` |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat endpoint `/v1`, lokal `http://localhost:11434/v1` |
| https://docs.ollama.com/api/introduction | Ollama cloud native base `https://ollama.com/api` |
| https://docs.ollama.com/cloud | Ollama cloud API access, autentikasi key |
| https://ollama.com/blog/cloud-models | Ollama cloud models, usage |
| https://docs.openclaw.ai/providers/ollama-cloud | Saran pakai OpenAI-compat provider untuk `/v1/chat/completions` semantics |
| https://github.com/MarlBurroW/kinbot/issues/333 | Issue client keliru kirim ke `/v1/responses` pada Ollama cloud `https://ollama.com/v1/` |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Setup Turso + Next.js App Router, `@libsql/client`, contoh execute SQL di Server Component |
| https://turso.tech/blog/serverless | Serverless DB access: remote HTTP vs embedded reads w/ sync; Vercel filesystem tidak persisten |
| https://vercel.com/marketplace/tursocloud | Turso Cloud resmi di Vercel Marketplace, starter Next.js |
| https://stackoverflow.com/questions/78849819 | Prisma mendukung Turso sejak v5.4+ |
| https://vercel.com/academy/ai-summary-app-with-nextjs/modern-nextjs-setup | Next.js 16 + Tailwind + shadcn/ui setup modern |
| https://ui.shadcn.com/docs/installation/next | shadcn/ui install di Next.js |
| https://ui.shadcn.com/docs/tailwind-v4 | shadcn/ui Tailwind v4 support |
| https://www.prisma.io/nextjs | Prisma + Next.js best practice |
| https://vercel.com/kb/guide/nextjs-prisma-postgres | Pola fullstack Next.js App Router + Prisma |
| https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference | Midjourney Character Reference (--cref) butuh image reference, bukan teks filename |
| https://kling.ai/blog/ai-character-consistency-guide | Panduan konsistensi karakter: verifikasi prompt, perkuat deskripsi, reference image |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter via deskripsi terstruktur + reference image |
| https://christytuckerlearning.com/generating-consistent-characters-in-the-midjourney-web-interface/ | Pola reference image karakter di Midjourney |
| https://community.openai.com/t/consistent-image-generation-for-story-using-dalle/612276 | Konsistensi karakter lintas paragraf cerita via prompt |
| https://turso.tech/blog/turso-cloud-integration-for-vercel-marketplace | Turso di Vercel Marketplace, unlimited SQLite DB |

---

## 11. Rekomendasi untuk Dokumen Lain

1. **SRS:** Definisikan format output prompt (JSON structured recommended,
   agar mudah parse/tampil). Gunakan `supportsStructuredOutputs: true` di
   AI SDK bila provider dukung.
2. **DB_SCHEMA:** Entitas Character master + Scene reference (hindari
   duplikasi deskripsi per scene untuk jaga konsistensi Fitur 5).
3. **ARCHITECTURE:** Pilih Vercel Blob untuk storage gambar referensi prod.
   Atau, bila user mau lokal, dokumentasikan constraint (tidak persisten
   di Vercel prod).
4. **CODING_RULES:** API key user di Setting WAJIB dienkripsi saat disimpan
   (TIDAK ADA BUKTI mekanisme enkripsi -> SRS tentukan, mis. AES via
   env key atau defer ke provider secret manager).
5. **PRD:** Konfirmasi G2 (auth), G5 (bahasa UI), G11 (batas tokoh).
6. **9router:** Konfirmasi G4 ke user — base URL `http://localhost:20128/v1`
   valid lokal tapi TIDAK ADA BUKTI dokumentasi publik.
