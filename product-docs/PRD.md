# Product Requirement Document (PRD) V2.0
## PromptFlow - Upgrade V2: Workflow Otomasi Prompt Animasi AI

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** product-docs/RAG-CONTEXT.md + product-docs/BRD.md V2.0 + product-docs/MRD.md V2.0
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** V1 sudah built. OVERWRITE PRD V1.0 menjadi PRD V2.0.

---

## Daftar Isi

1. Ringkasan Produk & Visi
2. User Personas & Job-to-be-Done
3. User Stories
4. Prioritas Fitur (MoSCoW) V2
5. Functional Requirements (V1 + V2)
6. Non-Functional Requirements (V1 + V2)
7. Acceptance Criteria
8. Data Model Changes (V2)
9. API Changes (V2)
10. UI/UX Specifications per Halaman
11. Out of Scope Eksplisit
12. Risks & Dependencies

---

## 1. Ringkasan Produk & Visi

### 1.1 Visi V2

> "Satu judul -> paket prompt animasi siap pakai dengan AI image classification, konsistensi karakter lintas adegan, real-time logs, dan dashboard enrichment."

V1 memecahkan problem inti otomasi susun prompt animasi dari input minimal. V2 menambah 8 fitur: upload di generate page, AI image classification, deskripsi cerita, real-time logs, dashboard enrichment, konsistensi UI, SQA testing, navigation optimization, push ke GitHub.

- Sitasi: `BRD.md V2.0 S1`, `BRD.md V2.0 S5.1 S1-S9`, `RAG-CONTEXT.md S9 (V2-1 s/d V2-10)`

### 1.2 Ringkasan Produk

| Aspek | Nilai |
|---|---|
| Tipe | Web app fullstack (frontend + backend satu repo) |
| Inti fungsi | Otomasi susun prompt animasi terstruktur + AI image classification |
| Input utama | Judul, durasi target, deskripsi cerita (opsional), referensi gambar (opsional) |
| Output | Paket prompt teks terstruktur (JSON + export markdown) |
| Stack | Next.js 15 + React 19 + Vercel AI SDK v4 + Turso/libSQL + Drizzle + Tailwind v4 + shadcn/ui + NextAuth v5 + Zod + next-intl |
| Multi-provider | Ollama cloud, OpenRouter, 9router, custom |
| Status | V1 built & berjalan. V2 = upgrade iteratif |
| Deploy target | Vercel + Turso DB + Vercel Blob |
| GitHub | https://github.com/agrianwahab29/promptflow.git |

**Sitasi:** `RAG-CONTEXT.md S1-S3`, `BRD.md V2.0 S1`

### 1.3 Nilai Produk (V1 + V2)

**V1 Value (pertahankan):**
1. Hemat waktu 80% susun prompt.
2. Konsistensi karakter terjamin via Character master.
3. Fleksibilitas biaya via multi-provider.
4. Output siap pakai & terstandar (JSON + markdown).
5. Pesan moral built-in.

**V2 Value (baru):**
6. Workflow friction berkurang 50% (upload + generate 1 halaman).
7. AI image classification (Vision LLM auto-classify).
8. Transparansi proses (real-time logs).
9. Monitoring produktivitas (dashboard enrichment).
10. Siap production (GitHub + testing + optimization).

**Sitasi:** `BRD.md V2.0 S7.1-S7.2`, `MRD.md V2.0 S5.2`, `RAG-CONTEXT.md S9`

---

## 2. User Personas & Job-to-be-Done

Persona turun dari BRD V2 S4 + MRD V2 S3. ASUMSI - RAG-CONTEXT hanya sebut "user".
- Sitasi: `BRD.md V2.0 S4`, `MRD.md V2.0 S3.1`, `RAG-CONTEXT.md S7`

### 2.1 Tabel Persona

| Atribut | Persona A: Kreator Solo | Persona B: Indie Studio Kecil | Persona C: Edukator |
|---|---|---|---|
| Nama | "Rian si YouTuber" | "Studio Bumi Animasi" | "Bu Sinta Pengajar" |
| Peran | Content creator animasi AI solo | Tim kecil 2-5 orang, serial animasi | Guru/pembuat konten edukasi |
| Demografis | 20-35 thn, ID+global, mobile+desktop | Studio kecil urban ID/global | 30-50 thn, institusi pendidikan |
| Pain point V1 | Upload terpisah, tidak ada logs, dashboard kosong | Tidak ada standar, rework, tidak monitor produktivitas | Workflow fragmentasi, tidak ada transparansi |
| Pain point V2 | Butuh AI classify gambar, deskripsi cerita lebih kaya | Butuh dashboard enrichment | Butuh loading states, error boundaries |
| Kebutuhan V2 | Upload+generate 1 halaman, AI classification, real-time logs | Dashboard enrichment, export data, pagination | Loading states jelas, dwibahasa, pesan moral |

**Sitasi:** `MRD.md V2.0 S3.1`, `BRD.md V2.0 S4`

### 2.2 Job-to-be-Done (JTBD)

| Persona | JTBD V1 | JTBD V2 (baru) |
|---|---|---|
| Kreator Solo | "Saat saya punya ide judul animasi, saya ingin menghasilkan paket prompt lengkap dalam hitungan menit." | "Saat saya upload gambar referensi, saya ingin AI otomatis classify role-nya dan langsung generate -- tanpa pindah halaman." |
| Indie Studio | "Saat tim kerja multi-proyek, saya ingin format prompt terstandar & reproducible." | "Saat tim generate banyak project, saya ingin dashboard menampilkan produktivitas & trend performance." |
| Edukator | "Saat saya buat materi berpesan moral, saya ingin adegan berurut + pesan moral tersusun otomatis." | "Saat saya generate, saya ingin tahu prosesnya sampai mana (real-time logs) dan loading states jelas." |

---

## 3. User Stories

Format: Sebagai [persona], saya ingin [aksi], agar [nilai].

### 3.1 Input & Generasi Inti (MUST - V1)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-01 | Saya ingin input judul animasi, agar sistem tahu konteks cerita. | A/B/C | MUST |
| US-02 | Saya ingin input durasi target (Shorts 30-60s/maks 3 menit ATAU Tutorial 7-15 menit). | A/B/C | MUST |
| US-03 | Saya ingin sistem generate deskripsi adegan berurut. | A/B/C | MUST |
| US-04 | Saya ingin sistem generate naskah voiceover per adegan. | A/B/C | MUST |
| US-05 | Saya ingin sistem otomatis buat deskripsi karakter & background jika tidak ada referensi. | A/B/C | MUST |
| US-06 | Saya ingin sistem generate image prompt per tokoh & per background. | A/B/C | MUST |
| US-07 | Saya ingin deskripsi tokoh terstruktur konsisten lintas adegan. | A/B/C | MUST |
| US-08 | Saya ingin sistem generate deskripsi karakter pendukung/hewan + aksi. | A/B/C | MUST |
| US-09 | Saya ingin sistem generate adegan-adegan urut. | A/B/C | MUST |
| US-10 | Saya ingin pilih gaya gambar (3D/2D) + rasio aspect. | A/B/C | MUST |
| US-11 | Saya ingin sistem akhiri cerita dengan pesan moral. | A/B/C | MUST |
| US-12 | Saya ingin output paket prompt sebagai teks (bukan media). | A/B/C | MUST |

### 3.2 Konsistensi & Referensi (V1)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-13 | Saya ingin konsistensi visual tokoh dijaga lintas adegan. | A/B/C | MUST |
| US-14 | Saya ingin aksi & latar boleh berubah per adegan. | A/B/C | MUST |
| US-15 | Saya ingin (opsional) upload gambar referensi tokoh & background. | A/B/C | SHOULD |
| US-16 | Saya ingin nama file dirujuk dalam image prompt jika ada referensi. | A/B/C | SHOULD |

### 3.3 V2 Features - Upload & Classification (MUST - baru)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-V2-01 | Saya ingin upload gambar referensi langsung di generate page (bukan project detail). | A/B/C | MUST |
| US-V2-02 | Saya ingin upload multi-file sekaligus (drag-drop). | A/B/C | MUST |
| US-V2-03 | Saya ingin AI otomatis classify role gambar (tokoh/background/prop/accessory/environment/other). | A/B/C | MUST |
| US-V2-04 | Saya ingin melihat hasil klasifikasi AI sebelum submit generate. | A/B/C | MUST |
| US-V2-05 | Saya ingin input deskripsi singkat cerita di generate form. | A/B/C | MUST |

### 3.4 V2 Features - Real-time Logs (SHOULD - baru)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-V2-06 | Saya ingin melihat real-time processing logs saat generate berjalan. | A/B/C | SHOULD |
| US-V2-07 | Saya ingin toggle show/hide logs. | A/B/C | SHOULD |

### 3.5 V2 Features - Dashboard (SHOULD - baru)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-V2-08 | Saya ingin dashboard menampilkan stats lebih kaya (charts, recent activity). | A/B/C | SHOULD |
| US-V2-09 | Saya ingin melihat per-provider breakdown (avg duration, success rate). | B | SHOULD |

### 3.6 V2 Features - UI & Quality (SHOULD - baru)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-V2-10 | Saya ingin loading states & error boundaries yang jelas. | A/B/C | SHOULD |
| US-V2-11 | Saya ingin page navigation cepat (pagination, streaming). | A/B/C | SHOULD |
| US-V2-12 | Saya ingin kode ter-version control di GitHub. | Dev | SHOULD |

### 3.7 Management Project & Provider (MUST - V1)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-17 | Saya ingin save project ke akun saya. | A/B/C | MUST |
| US-18 | Saya ingin CRUD project. | A/B/C | MUST |
| US-19 | Saya ingin pilih/input provider LLM (Ollama, OpenRouter, 9router, custom). | A/B/C | MUST |
| US-20 | Saya ingin API key saya disimpan terenkripsi & tidak diekspos. | A/B/C | MUST |
| US-21 | Saya ingin export hasil generate ke JSON & markdown. | A/B/C | MUST |

### 3.8 Akun & Bahasa (SHOULD - V1)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-22 | Saya ingin login dasar (NextAuth). | A/B/C | SHOULD |
| US-23 | Saya ingin UI dwibahasa (ID + EN). | A/C | SHOULD |

### 3.9 Nice-to-Have (COULD - V1)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-24 | Saya ingin library template judul animasi populer. | A/C | COULD |
| US-25 | Saya ingin history generasi per project. | A/B | COULD |

---

## 4. Prioritas Fitur (MoSCoW) V2

### 4.1 Tabel Prioritas Lengkap

| ID | Fitur | MoSCoW | US | V1/V2 | Sitasi |
|---|---|---|---|---|---|
| F-01 | Input judul animasi | MUST | US-01 | V1 | User prompt 1 |
| F-02 | Input durasi target | MUST | US-02 | V1 | User prompt 3 |
| F-03 | Generate deskripsi adegan berurut | MUST | US-03, US-09 | V1 | User prompt 4a, 4g |
| F-04 | Generate naskah voiceover per adegan | MUST | US-04 | V1 | User prompt 4b |
| F-05 | Auto-buat karakter & background | MUST | US-05 | V1 | User prompt 4c |
| F-06 | Generate image prompt per tokoh & background | MUST | US-06, US-16 | V1 | User prompt 4d |
| F-07 | Deskripsi tokoh terstruktur konsisten | MUST | US-07, US-13 | V1 | User prompt 4e, 5 |
| F-08 | Deskripsi karakter pendukung/hewan | MUST | US-08 | V1 | User prompt 4f |
| F-09 | Pilih gaya gambar + rasio aspect | MUST | US-10 | V1 | User prompt 4h |
| F-10 | Pesan moral penutup | MUST | US-11 | V1 | User prompt 7 |
| F-11 | Output paket prompt (JSON + markdown) | MUST | US-12, US-21 | V1 | User prompt 8 |
| F-12 | Konsistensi karakter lintas adegan | MUST | US-13, US-14 | V1 | User prompt 5, 6 |
| F-13 | Multi-provider LLM setting | MUST | US-19 | V1 | RAG-CONTEXT S5.1, S5.2 |
| F-14 | Enkripsi API key | MUST | US-20 | V1 | BRD S6 R6 |
| F-15 | Save project + CRUD | MUST | US-17, US-18 | V1 | BRD S8.1 |
| F-16 | Export hasil (JSON + markdown) | MUST | US-21 | V1 | ASUMSI A4 |
| F-17 | Upload referensi gambar + rujuk nama file | SHOULD | US-15, US-16 | V1 | User prompt 2 |
| F-18 | Login dasar NextAuth | SHOULD | US-22 | V1 | ASUMSI A1 |
| F-19 | UI dwibahasa (ID + EN) | SHOULD | US-23 | V1 | ASUMSI A2 |
| F-20 | Library template judul animasi | COULD | US-24 | V1 | ASUMSI |
| F-21 | History generasi per project | COULD | US-25 | V1 | ASUMSI |
| F-V2-01 | Image reference di generate page (multi-file + role classification) | MUST | US-V2-01, US-V2-02 | V2 | BRD V2 S5.1 S1, RAG-CONTEXT S9 V2-1 |
| F-V2-02 | AI image classification via Vision LLM | MUST | US-V2-03, US-V2-04 | V2 | BRD V2 S5.1 S2, RAG-CONTEXT S9 V2-3 |
| F-V2-03 | Extended role classification (6 opsi) | MUST | US-V2-03 | V2 | BRD V2 S5.1 S1, RAG-CONTEXT S9 V2-2 |
| F-V2-04 | Field deskripsi singkat cerita | MUST | US-V2-05 | V2 | BRD V2 S5.1 S3, RAG-CONTEXT S9 V2-4 |
| F-V2-05 | Real-time processing logs (SSE + Collapsible) | SHOULD | US-V2-06, US-V2-07 | V2 | BRD V2 S5.1 S4, RAG-CONTEXT S9 V2-5 |
| F-V2-06 | Dashboard enrichment (charts, breakdown, activity) | SHOULD | US-V2-08, US-V2-09 | V2 | BRD V2 S5.1 S5, RAG-CONTEXT S9 V2-6 |
| F-V2-07 | Konsistensi UI (loading.tsx, error.tsx, tokens) | SHOULD | US-V2-10 | V2 | BRD V2 S5.1 S6, RAG-CONTEXT S9 V2-7 |
| F-V2-08 | SQA testing menyeluruh (>=80% coverage) | SHOULD | US-V2-12 | V2 | BRD V2 S5.1 S7, RAG-CONTEXT S9 V2-8 |
| F-V2-09 | Navigation optimization (pagination, Suspense) | SHOULD | US-V2-11 | V2 | BRD V2 S5.1 S8, RAG-CONTEXT S9 V2-9 |
| F-V2-10 | Push ke GitHub | SHOULD | US-V2-12 | V2 | BRD V2 S5.1 S9, RAG-CONTEXT S9 V2-10 |
| F-22 | Kolaborasi tim | COULD | - | V1 | BRD S8.2 #6 |
| F-23 | Payment/subscription | WONT | - | - | BRD S8.2 #5 |
| F-24 | Generate file media langsung | WONT | - | - | BRD S8.2 #1 |
| F-25 | TTS voiceover audio | WONT | - | - | BRD S8.2 #2 |
| F-26 | Integrasi langsung Midjourney/Kling/DALL-E API | WONT | - | - | BRD S8.2 #3 |
| F-27 | Mobile native app | WONT | - | - | BRD S8.2 #4 |
| F-28 | Marketplace template prompt | WONT | - | - | BRD S8.2 #7 |
| F-29 | Dark mode toggle | WONT | - | - | BRD V2 S5.2 O7 |

### 4.2 Ringkasan MoSCoW

- **MUST (20):** F-01 s/d F-16 (V1 core) + F-V2-01 s/d F-V2-04 (V2 core).
- **SHOULD (7):** F-17, F-18, F-19 (V1) + F-V2-05 s/d F-V2-10 (V2).
- **COULD (3):** F-20, F-21, F-22.
- **WONT (7):** F-23 s/d F-29.

---

## 5. Functional Requirements

ID format: FR-XX (V1) + FR-V2-XX (V2 baru).

### FR-01: Input Judul Animasi (V1)

| Aspek | Detail |
|---|---|
| Input | Field teks `title` (wajib, min 3, max 200 char) |
| Validasi | Tidak kosong, trim whitespace, sanitize HTML |
| Output | `title` tersimpan di Project + di-inject ke prompt |
| Error | 400 jika invalid; pesan bahasa aktif |

### FR-02: Input Durasi Target (V1)

| Aspek | Detail |
|---|---|
| Input | `duration_type` (shorts/tutorial) + `target_seconds` (opsional) |
| Aturan | Shorts ideal 30-60s, maks 180s. Tutorial 420-900s. |
| Validasi | Shorts > 180s = error. Tutorial di luar range = warning. |

### FR-03 & FR-09: Generate Adegan Berurut (V1)

| Aspek | Detail |
|---|---|
| Input | `title`, `duration_target`, `style`, `character_profiles`, referensi, (V2) `storyDescription` |
| Output | `scenes[]` array urut dengan `order`, `description`, `voiceover`, `image_prompts` |

### FR-04: Generate Voiceover (V1)

| Aspek | Detail |
|---|---|
| Output | `voiceover_script` per scene (teks, bukan audio) |

### FR-05: Auto-buat Karakter & Background (V1)

| Aspek | Detail |
|---|---|
| Proses | Tanpa referensi -> LLM invent. Dengan referensi -> pakai. |

### FR-06: Generate Image Prompt per Tokoh & Background (V1)

| Aspek | Detail |
|---|---|
| Output | `image_prompts.characters[]` + `image_prompts.backgrounds[]` dengan `reference_filename` nullable |

### FR-07: Deskripsi Tokoh Terstruktur (V1)

| Aspek | Detail |
|---|---|
| Struktur | Per karakter: `nama`, `gayarambut`, `wajah_asal`, `pakaian_atas`, `pakaian_bawah`, `alas_kaki`, `deskripsi_latar`, `aksi`, `peran` (utama/lain/pendamping) |
| Konsistensi | Identitas stabil lintas adegan. `aksi` & `deskripsi_latar` boleh berubah. |

### FR-08: Karakter Pendukung/Hewan (V1)

| Aspek | Detail |
|---|---|
| Output | `supporting_characters[]` dengan `nama`, `tipe` (pendukung/hewan), `aksi` |

### FR-10: Pilih Gaya Gambar + Rasio Aspect (V1)

| Aspek | Detail |
|---|---|
| Input | `style` (3D/2D) + `aspect_ratio` (16:9/9:16/1:1/custom) |

### FR-11: Pesan Moral (V1)

| Aspek | Detail |
|---|---|
| Output | `moral_message` di root JSON (positif/edukatif) |

### FR-12: Konsistensi Karakter Lintas Adegan (V1)

| Aspek | Detail |
|---|---|
| Validasi | Post-check: mismatch identitas -> warning (tidak block save) |

### FR-13: Multi-Provider LLM (V1)

| Aspek | Detail |
|---|---|
| Input | `provider`, `base_url`, `model`, `api_key` |
| Base URL | Ollama: `https://ollama.com/v1`. OpenRouter: `https://openrouter.ai/api/v1`. 9router: `http://localhost:20128/v1`. Custom: user input. |
| Proses | `@ai-sdk/openai-compatible` `createOpenAICompatible()` |

### FR-14: Enkripsi API Key (V1)

| Aspek | Detail |
|---|---|
| Mekanisme | AES-256-GCM via env `ENCRYPTION_KEY`. Mask `****` di response. |

### FR-15: Save Project + CRUD (V1)

| Aspek | Detail |
|---|---|
| CRUD | Create + List (paginate) + Read + Update + Soft Delete + Ownership check |

### FR-16: Export JSON + Markdown (V1)

| Aspek | Detail |
|---|---|
| Output | JSON `.json` download + Markdown `.md` download |

### FR-17: Upload Referensi Gambar (V1 dimodifikasi V2)

| Aspek | Detail |
|---|---|
| Input | Multipart upload: `reference_images[]` dengan tipe + label |
| Storage | Vercel Blob (prod) / local FS (dev) |
| **V2 Change** | **Pindah dari project detail page ke generate page. Upload tanpa projectId (buat project saat generate submit).** |
| **V2 Change** | **Role classification diperluas: tokoh, background, prop, accessory, environment, other (dari hanya tokoh/background).** |

### FR-18: Login NextAuth (V1)

| Aspek | Detail |
|---|---|
| Mekanisme | NextAuth v5 credentials (email + password) |
| Sesi | JWT cookie. Protected: `/projects`, `/settings`, `/generate`, `/api/v1/*` |

### FR-19: UI Dwibahasa ID + EN (V1)

| Aspek | Detail |
|---|---|
| Mekanisme | next-intl. Toggle di header. |

### FR-V2-01: Image Reference di Generate Page (V2 BARU - MUST)

| Aspek | Detail |
|---|---|
| Input | Multi-file drag-drop upload di generate page |
| Proses | 1) User upload di generate form. 2) Simpan ke storage. 3) Metadata di `asset_references` (tanpa projectId - dibuat saat submit). 4) Inject ke prompt builder. |
| Output | `asset_references[]` terisi, `reference_filename` muncul di image prompts |
| Flow | Upload -> list refs -> include di generate input -> submit -> buat project + save refs + save result |
| Dampak schema | TIDAK perlu migration |
| Backward compat | Project detail tetap view refs (read-only) |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-1`, `BRD.md V2.0 S5.1 S1` |

### FR-V2-02: AI Image Classification (V2 BARU - MUST)

| Aspek | Detail |
|---|---|
| Input | Gambar yang di-upload |
| Proses | 1) Kirim ke Vision LLM (GPT-4o/Gemini Vision). 2) Classify role: tokoh/background/prop/accessory/environment/other. 3) Output: `{role, name, description, confidence}`. 4) Update `asset_references.tipe` + `label`. 5) Tampilkan di UI sebelum submit. |
| Output | `asset_references.tipe` ter-update, hasil klasifikasi visible di UI |
| Confidence | Threshold 0.7. Allow manual override. |
| Cache | Simpan di `asset_references` agar tidak reclassify |
| Fallback | Vision LLM gagal -> manual select (V1 behavior) |
| Dampak schema | Tambah kolom `ai_classification` (TEXT nullable) di `asset_references` |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-3`, `BRD.md V2.0 S5.1 S2`, `RAG-CONTEXT.md S10 B` |

### FR-V2-03: Extended Role Classification (V2 BARU - MUST)

| Aspek | Detail |
|---|---|
| Opsi tipe | `tokoh`, `background`, `prop`, `accessory`, `environment`, `other` (6 opsi, dari V1 yang hanya 2) |
| Proses | Update `GenerateReferenceSchema.type` Zod enum, DropzoneUploader select options, upload route validation, prompt-builder injection |
| Dampak schema | TIDAK perlu migration - kolom `tipe` = text tanpa CHECK constraint |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-2`, `BRD.md V2.0 S5.1 S1` |

### FR-V2-04: Field Deskripsi Cerita (V2 BARU - MUST)

| Aspek | Detail |
|---|---|
| Input | Textarea opsional `storyDescription` di generate form (di bawah judul) |
| Validasi | Optional. Max 500 char (ASUMSI). Trim whitespace. |
| Proses | 1) Tambah di `GenerateInputSchema`. 2) Tambah Textarea di form. 3) Inject ke `buildUserMessage()`. 4) Opsional: simpan di `projects.story_description` (TEXT nullable). |
| Output | Prompt LLM lebih kontekstual |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-4`, `BRD.md V2.0 S5.1 S3` |

### FR-V2-05: Real-time Processing Logs (V2 BARU - SHOULD)

| Aspek | Detail |
|---|---|
| Input | Proses generate di backend (console.log existing) |
| Proses | 1) Extend SSE events: tambah event type `log` dengan `message`, `level`, `timestamp`. 2) Backend: buffer logs, kirim via SSE. 3) Frontend: `LogViewer` Collapsible panel + show/hide toggle (Switch). 4) Toggle default OFF. |
| Output | Log messages real-time di generate form (toggle-controlled) |
| Stage labels | `starting` -> `character_profiles` -> `scenes` -> `image_prompts` -> `supporting_characters` -> `moral_message` -> `done` |
| Dampak schema | Opsional tambah `logs_json` (TEXT nullable) di `generation_logs` |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-5`, `BRD.md V2.0 S5.1 S4` |

### FR-V2-06: Dashboard Enrichment (V2 BARU - SHOULD)

| Aspek | Detail |
|---|---|
| Input | Data existing di `projects` + `generation_logs` |
| Proses | 1) Extend queries: total projects, successful generations, avg duration, per-provider breakdown, recent 5 projects, storage usage. 2) Simple charts: line chart projects/minggu, bar chart success vs fail. 3) Library: Recharts atau Tremor. |
| Output | Dashboard 6-8 kartu metric + simple chart + recent activity table |
| Dampak schema | TIDAK perlu |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-6`, `BRD.md V2.0 S5.1 S5` |

### FR-V2-07: Konsistensi UI (V2 BARU - SHOULD)

| Aspek | Detail |
|---|---|
| Scope | 1) `loading.tsx` per page group. 2) `error.tsx` boundary per page group. 3) Disabled state saat loading. 4) Design tokens konsisten: primary violet `#7c3aed`, font Inter, spacing 4px base, radius 6px. 5) Badge variants: success, secondary, destructive, info. |
| Dampak | Murni frontend |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-7`, `BRD.md V2.0 S5.1 S6` |

### FR-V2-08: SQA Testing Menyeluruh (V2 BARU - SHOULD)

| Aspek | Detail |
|---|---|
| Scope | 1) Jalankan semua test. 2) Coverage >= 80% unit. 3) E2E critical path. 4) Manual testing V2 features. 5) Performance testing. |
| Tools | Vitest, Playwright, ESLint + tsc |
| Gate | lint 0 error, typecheck 0 error, coverage >= 80%, E2E green, build pass |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-8`, `BRD.md V2.0 S5.1 S7` |

### FR-V2-09: Navigation Optimization (V2 BARU - SHOULD)

| Aspek | Detail |
|---|---|
| Scope | 1) Pagination projects list. 2) Suspense boundaries. 3) Client-side soft navigation. 4) Next.js `<Image>`. 5) Loading states per page. |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-9`, `BRD.md V2.0 S5.1 S8` |

### FR-V2-10: Push ke GitHub (V2 BARU - SHOULD)

| Aspek | Detail |
|---|---|
| Scope | 1) `git init`. 2) `.gitignore` lengkap. 3) Commit + push ke `https://github.com/agrianwahab29/promptflow.git`. |
| **Sitasi** | `RAG-CONTEXT.md S9 V2-10`, `BRD.md V2.0 S5.1 S9`

---

## 6. Non-Functional Requirements

### 6.1 Performa

| ID | Requirement | Target | V1/V2 | Sitasi |
|---|---|---|---|---|
| NFR-P1 | Latency Shorts | <= 60s end-to-end | V1 | ASUMSI |
| NFR-P2 | Latency Tutorial | <= 180s end-to-end | V1 | ASUMSI |
| NFR-P3 | Streaming partial SSE | Token < 10s | V1 | ASUMSI |
| NFR-P4 | UI response time | < 2s page load | V1 | ASUMSI |
| NFR-P5 | DB query | < 500ms | V1 | RAG-CONTEXT S2.2 |
| NFR-P6 | Page transition | <= 200ms | V2 | BRD V2 S9.2 |
| NFR-P7 | Dashboard load | <= 1.5s | V2 | BRD V2 S9.2 |
| NFR-P8 | AI classification latency | <= 5s per gambar | V2 | ASUMSI |
| NFR-P9 | Real-time log latency | <= 100ms server ke UI | V2 | BRD V2 S9.2 |

### 6.2 Keamanan

| ID | Requirement | V1/V2 | Sitasi |
|---|---|---|---|
| NFR-S1 | API key dienkripsi (AES-256-GCM) | V1 | BRD S6 R6 |
| NFR-S2 | API key tidak expose ke client (mask) | V1 | BRD S6 R6 |
| NFR-S3 | Input sanitization (XSS) | V1 | ASUMSI |
| NFR-S4 | Rate limit 10 req/min/user | V1 | ASUMSI |
| NFR-S5 | HTTPS only | V1 | RAG-CONTEXT S2.1 |
| NFR-S6 | Ownership check | V1 | ASUMSI |
| NFR-S7 | No secret client-side | V1 | CODING_RULES S6.1 |
| NFR-S8 | No LLM call / decrypt di Client Component | V1 | CODING_RULES L24, L25 |

### 6.3 Skalabilitas

| ID | Requirement | V1/V2 | Sitasi |
|---|---|---|---|
| NFR-SC1 | Serverless Vercel auto-scale | V1 | RAG-CONTEXT S2.1 |
| NFR-SC2 | Turso scalable | V1 | RAG-CONTEXT S2.2 |
| NFR-SC3 | Vercel Blob scalable | V1 | RAG-CONTEXT S6 |

### 6.4 Reliability

| ID | Requirement | V1/V2 | Sitasi |
|---|---|---|---|
| NFR-R1 | Error handling provider | V1 | BRD S6 R1 |
| NFR-R2 | Streaming partial disimpan walau timeout | V1 | BRD S6 R5 |
| NFR-R3 | Retry 3x backoff | V1 | ASUMSI |
| NFR-R4 | DB backup via Turso | V1 | RAG-CONTEXT S2.1 |

### 6.5 UX

| ID | Requirement | V1/V2 | Sitasi |
|---|---|---|---|
| NFR-U1 | Loading state streaming SSE | V1 | ASUMSI |
| NFR-U2 | Preview hasil real-time | V1 | ASUMSI |
| NFR-U3 | Error state + action recovery | V1 | ASUMSI |
| NFR-U4 | Copy-to-clipboard per item | V1 | ASUMSI |
| NFR-U5 | Loading.tsx per page group | V2 | RAG-CONTEXT S10 E, S11 GAP-12 |
| NFR-U6 | Error.tsx boundary per page group | V2 | RAG-CONTEXT S11 GAP-13 |
| NFR-U7 | Disabled state saat loading | V2 | RAG-CONTEXT S10 F |
| NFR-U8 | Pagination di projects list | V2 | RAG-CONTEXT S9 V2-9 |

### 6.6 Aksesibilitas

| ID | Requirement | V1/V2 | Sitasi |
|---|---|---|---|
| NFR-A1 | WCAG 2.1 AA | V1 | ASUMSI |
| NFR-A2 | Keyboard navigable | V1 | ASUMSI |
| NFR-A3 | Screen reader label | V1 | ASUMSI |

### 6.7 i18n

| ID | Requirement | V1/V2 | Sitasi |
|---|---|---|---|
| NFR-I1 | UI dwibahasa ID + EN | V1 | ASUMSI |
| NFR-I2 | Konten LLM bahasa sesuai input | V1 | ASUMSI |

### 6.8 Testing

| ID | Requirement | Target | Sitasi |
|---|---|---|---|
| NFR-T1 | Unit test coverage (Vitest) | >= 80% | BRD V2 S3.2 K-V2-6 |
| NFR-T2 | E2E critical path (Playwright) | 100% pass | BRD V2 S3.2 K-V2-6 |
| NFR-T3 | Lint (ESLint) | 0 error | CODING_RULES S9.1 |
| NFR-T4 | Type check (tsc) | 0 error | CODING_RULES S9.1 |
| NFR-T5 | Build (next build) | Pass | CODING_RULES S9.1 |

---

## 7. Acceptance Criteria

### AC-01: Input Judul
- [ ] Field `title` wajib, min 3 max 200 char.
- [ ] Empty submit -> error 400 + pesan bahasa aktif.

### AC-02: Input Durasi
- [ ] Select `duration_type` (shorts/tutorial).
- [ ] Shorts > 180s -> error.
- [ ] Tutorial di luar 420-900 -> warning.

### AC-03/09: Generate Adegan Urut
- [ ] `scenes[]` urut `order` 1..N.
- [ ] Jumlah adegan sesuai durasi (shorts 3-6, tutorial 8-20).

### AC-04: Voiceover
- [ ] Tiap scene punya `voiceover_script` teks.

### AC-05: Auto-buat Karakter & Background
- [ ] Tanpa referensi -> tetap terisi.

### AC-06: Image Prompt per Tokoh & Background
- [ ] `image_prompts.characters[]` = N prompt, `backgrounds[]` = M prompt.

### AC-07: Deskripsi Tokoh Terstruktur
- [ ] Tiap karakter punya field lengkap 9 kolom.
- [ ] `peran` = utama/lain/pendamping.

### AC-08: Karakter Pendukung/Hewan
- [ ] `supporting_characters[]` terisi bila ada + punya `aksi`.

### AC-10: Gaya Gambar + Rasio
- [ ] Select `style` + `aspect_ratio` muncul di root JSON.

### AC-11: Pesan Moral
- [ ] `moral_message` non-kosong, positif/edukatif.

### AC-12: Konsistensi Karakter
- [ ] Identitas SAMA di `character_profiles` & `scenes[]`.
- [ ] `aksi` & `deskripsi_latar` BOLEH beda.
- [ ] Post-check: mismatch -> warning.

### AC-13: Multi-Provider Setting
- [ ] Form: select provider + base URL + model + API key.
- [ ] Pre-fill base URL sesuai provider.
- [ ] Provider gagal -> error + opsi switch.

### AC-14: Enkripsi API Key
- [ ] DB: terenkripsi. Client: mask `****`. Server-only decrypt.

### AC-15: Save & CRUD Project
- [ ] Create + List paginate + Read ownership + Delete cascade.

### AC-16: Export
- [ ] JSON: download `.json` valid. Markdown: download `.md` lengkap.

### AC-17: Upload Referensi (V1)
- [ ] Multipart upload + metadata simpan + `reference_filename` di prompts.

### AC-18: Login (V1)
- [ ] NextAuth login + protected redirect + scoped per user.

### AC-19: Dwibahasa (V1)
- [ ] Toggle ID/EN ubah label + pesan error.

### AC-V2-01: Image Reference di Generate Page
- [ ] DropzoneUploader di generate page (multi-file drag-drop).
- [ ] Upload tanpa projectId (dibuat saat submit).
- [ ] Backward compat: project detail view refs.

### AC-V2-02: AI Image Classification
- [ ] Setelah upload -> Vision LLM classify.
- [ ] Hasil visible di UI sebelum submit (role + nama + deskripsi + confidence).
- [ ] Manual override tersedia.
- [ ] Fallback ke manual select jika Vision LLM gagal.
- [ ] Result di-cache di `asset_references`.

### AC-V2-03: Extended Role Classification
- [ ] 6 opsi tipe: tokoh, background, prop, accessory, environment, other.
- [ ] Zod enum, upload validation, DropzoneUploader, prompt builder updated.

### AC-V2-04: Field Deskripsi Cerita
- [ ] Textarea opsional di bawah judul. Max 500 char.
- [ ] Di-inject ke `buildUserMessage()`.

### AC-V2-05: Real-time Logs
- [ ] SSE event type `log` dengan message, level, timestamp.
- [ ] Collapsible panel + show/hide toggle.
- [ ] Toggle OFF = no log events.

### AC-V2-06: Dashboard Enrichment
- [ ] >= 6 kartu metric + chart + recent 5 projects + per-provider breakdown.
- [ ] Load time <= 1.5s.

### AC-V2-07: Konsistensi UI
- [ ] `loading.tsx` + `error.tsx` per page group.
- [ ] Disabled state saat loading. Design tokens konsisten.

### AC-V2-08: SQA Testing
- [ ] Coverage >= 80%. E2E green. Lint 0. Typecheck 0. Build pass.

### AC-V2-09: Navigation Optimization
- [ ] Pagination projects list. Page transition <= 200ms. Suspense boundaries.

### AC-V2-10: Push ke GitHub
- [ ] Repo ter-push. `.gitignore` lengkap. README updated.

### AC Non-Functional
- [ ] NFR-P1/P2: Shorts <= 60s, Tutorial <= 180s.
- [ ] NFR-P3: Token < 10s. NFR-P6: Transition <= 200ms. NFR-P7: Dashboard <= 1.5s.
- [ ] NFR-S1/S2: Enkripsi + mask.
- [ ] NFR-A1: WCAG AA. NFR-T1-T5: Testing gates.

---

## 8. Data Model Changes (V2)

### 8.1 Schema Existing (V1 - 9 tabel, pertahankan)

Semua 9 tabel existing tetap. Tidak ada penghapusan tabel.

| # | Tabel | Status V2 |
|---|---|---|
| 1 | `users` | Tetap |
| 2 | `provider_configs` | Tetap |
| 3 | `projects` | **Tambah kolom opsional** |
| 4 | `asset_references` | **Tambah kolom opsional** |
| 5 | `characters` | Tetap |
| 6 | `scenes` | Tetap |
| 7 | `image_prompts` | Tetap |
| 8 | `generation_logs` | **Tambah kolom opsional** |
| 9 | `supporting_characters` | Tetap |

**Sitasi:** `RAG-CONTEXT.md S4`, `schema.ts:1-163`

### 8.2 Perubahan Schema V2 (ADDITIVE - tidak breaking)

| Tabel | Kolom Baru | Tipe | Nullable | Alasan | Sitasi |
|---|---|---|---|---|---|
| `projects` | `story_description` | TEXT | YA | Simpan deskripsi cerita dari generate form | RAG-CONTEXT S9 V2-4 |
| `asset_references` | `ai_classification` | TEXT | YA | Simpan hasil analisis Vision LLM (JSON string) | RAG-CONTEXT S9 V2-3 |
| `generation_logs` | `logs_json` | TEXT | YA | Simpan real-time logs (JSON array) | RAG-CONTEXT S9 V2-5 |

**Catatan:**
- Semua kolom baru = **nullable** -> tidak breaking existing data.
- Kolom `tipe` di `asset_references` tetap TEXT tanpa CHECK constraint -> extended enum di app layer (Zod).
- Migration: `drizzle-kit generate` -> review SQL -> `drizzle-kit push`.

### 8.3 Validasi Enum V2 (App Layer - Zod)

| Schema | V1 | V2 (baru) |
|---|---|---|
| `GenerateReferenceSchema.type` | `z.enum(['tokoh', 'background'])` | `z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other'])` |
| `GenerateInputSchema` | title, durationType, durationTargetSeconds, styleType, aspectRatio, references | + `storyDescription: z.string().max(500).optional()` |

**Sitasi:** `RAG-CONTEXT.md S9 V2-2, V2-4`, `schemas.ts:106-109, 111-129`

---

## 9. API Changes (V2)

### 9.1 Endpoint Existing (V1 - 21 endpoint, pertahankan)

Semua 21 endpoint V1 tetap. Tidak ada penghapusan endpoint.
**Sitasi:** `RAG-CONTEXT.md S3`, `API_CONTRACT.md S5`

### 9.2 Perubahan Endpoint V2 (additive - backward compatible)

| Endpoint | Perubahan |
|---|---|
| `POST /api/v1/generate` | Extend SSE events (`log` event type). Tambah field `storyDescription` di request. |
| `POST /api/v1/upload` | `tipe` field extended ke 6 opsi. Tambah response `ai_classification`. |
| `POST /api/v1/projects` | Tambah field opsional `story_description`. |
| `GET /api/v1/projects` | Pagination via `?page=&limit=`. Response: `data[]`, `pagination{...}`. |
| `GET /api/v1/dashboard/stats` | Extend response: `perProviderBreakdown[]`, `recentProjects[]`, `storageUsage`, `weeklyTrend[]`. |

**Sitasi:** `RAG-CONTEXT.md S9 V2-1 s/d V2-9`

### 9.3 Endpoint Baru V2

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/v1/upload/classify` | wajib | Trigger AI classification. Input: `assetReferenceId`. Output: `{role, name, description, confidence}`. |

**ASUMSI:** Classification bisa auto-trigger saat upload atau manual via endpoint ini. Rekomendasi: **auto-trigger saat upload** (seamless UX).

---

## 10. UI/UX Specifications per Halaman

### 10.1 Generate Page (`/generate`)

**V1:** Form fields (title, duration, style, aspect ratio) + textarea manual refs + stage tracker + ResultTabs.

**V2 perubahan:**

| Elemen | V1 | V2 |
|---|---|---|
| Upload area | TIDAK ADA (textarea manual) | **DropzoneUploader** drag-drop multi-file inline di form |
| Role classification | Manual select tokoh/background | **AI auto-classify** + manual override. Thumbnail + role badge + nama + confidence per gambar |
| Deskripsi cerita | TIDAK ADA | **Textarea opsional** di bawah judul, max 500 char |
| Real-time logs | TIDAK ADA | **Collapsible panel** di bawah stage tracker. Toggle show/hide. Log per stage + timestamp + level badge |
| Loading states | Stage tracker only | **Skeleton** saat loading. **Disabled** semua field saat generating |

**Sitasi:** `RAG-CONTEXT.md S9 V2-1, V2-3, V2-4, V2-5`

### 10.2 Dashboard Page (`/dashboard`)

**V1:** 3 kartu KPI (total projects, successful generations, avg duration).

**V2 perubahan:**

| Elemen | V1 | V2 |
|---|---|---|
| KPI cards | 3 kartu | **6-8 kartu**: total projects, successful generations, avg duration, total uploads, success rate, active providers |
| Charts | TIDAK ADA | **Line chart** projects/minggu. **Bar chart** success vs fail. Recharts/Tremor |
| Per-provider | TIDAK ADA | **Table**: provider name, avg duration, success rate, total calls |
| Recent activity | TIDAK ADA | **Table**: 5 project terbaru + status + tanggal |
| Storage usage | TIDAK ADA | **Kartu**: total files, total size |

**Sitasi:** `RAG-CONTEXT.md S9 V2-6`

### 10.3 Projects Page (`/projects`)

**V1:** Grid cards, always page 1 limit 20, delete dialog.

**V2:**

| Elemen | V1 | V2 |
|---|---|---|
| Pagination | TIDAK ADA | **Pagination controls** - page numbers, prev/next |
| Loading | Instant SSR | **Skeleton cards** via Suspense |
| Project card | Title + status + date | Tetap + recent status badge |

**Sitasi:** `RAG-CONTEXT.md S9 V2-9`

### 10.4 Project Detail Page (`/projects/[id]`)

**V1:** Image refs grid + DropzoneUploader + ResultTabs.

**V2:**

| Elemen | V1 | V2 |
|---|---|---|
| Upload | DropzoneUploader embedded | **Read-only refs view** - upload di generate page |
| Story description | TIDAK ADA | **Tampilkan** `story_description` jika ada |
| AI classification | TIDAK ADA | **Tampilkan** `ai_classification` per ref jika ada |

**Sitasi:** `RAG-CONTEXT.md S9 V2-1`

### 10.5 Loading & Error States (SEMUA HALAMAN)

| State | Implementasi |
|---|---|
| `loading.tsx` | Skeleton/spinner saat SSR hydrate |
| `error.tsx` | Error message + retry button + link home |
| Disabled state | Semua form field disabled saat generating/loading |
| Empty state | Ilustrasi + pesan + CTA |

**Sitasi:** `RAG-CONTEXT.md S10 F, S11 GAP-12, GAP-13`

---

## 11. Out of Scope Eksplisit

| # | Out of Scope | Alasan | Bukti |
|---|---|---|---|
| OOS-1 | Generate file media langsung | Output = teks prompt | BRD S8.2 #1 |
| OOS-2 | TTS voiceover audio | Output = naskah teks | BRD S8.2 #2 |
| OOS-3 | Integrasi langsung Midjourney/Kling/DALL-E API | User copy manual | BRD S8.2 #3 |
| OOS-4 | Mobile native app | Web responsif dulu | BRD S8.2 #4 |
| OOS-5 | Payment/subscription | Fase awal adoption | BRD S8.2 #5 |
| OOS-6 | Kolaborasi real-time multi-user | Solo per project | BRD S8.2 #6 |
| OOS-7 | Marketplace template prompt | Fase akhir | BRD S8.2 #7 |
| OOS-8 | Auto-fallback provider otomatis | Manual switch fase awal | ASUMSI |
| OOS-9 | Animasi/motion preview | Output = teks | RAG-CONTEXT S9 G10 |
| OOS-10 | Dark mode toggle | Bisa V3 | BRD V2 S5.2 O7 |
| OOS-11 | Multi-language output | Ikut judul input | BRD V2 S5.2 O8 |
| OOS-12 | AI SDK upgrade (v4 ke v6) | Kode = ground truth. Breaking changes | BRD V2 S6 R-V2-8 |
| OOS-13 | Schema migration besar-besaran | V2 = additive columns only | BRD V2 S8.1 VA-10 |

---

## 12. Risks & Dependencies

### 12.1 Risiko

| ID | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R-V2-1 | Vision LLM API cost membengkak | Biaya klasifikasi tinggi | Sedang | Cache classification. Batch. Confidence threshold + manual override |
| R-V2-2 | Vision LLM akurasi rendah | Role salah | Sedang | Tampilkan di UI. Manual override. Confidence score |
| R-V2-3 | SSE log events menambah payload | Latency naik | Rendah | Lightweight logs. Toggle off = no log. Buffer |
| R-V2-4 | Dashboard over-engineering | Dev time membengkak | Sedang | Simple cards + tables dulu. Lightweight chart library |
| R-V2-5 | Refactor upload flow breaking V1 | Upload rusak | Rendah | Backward compatible. Test coverage tinggi |
| R-V2-6 | Git push expose secrets | API key bocor | Rendah | .gitignore lengkap. Review sebelum push |
| R-V2-7 | V2 scope terlalu besar | Delay delivery | Sedang | MUST dulu. Ship incrementally |
| R-V2-8 | AI SDK version mismatch | Confusion developer | Rendah | Kode = ground truth. Update docs |

**Sitasi:** `BRD.md V2.0 S6`, `MRD.md V2.0 S10.1`

### 12.2 Dependencies

| ID | Dependency | Pemilik | Status | Sitasi |
|---|---|---|---|---|
| VD-1 | Vision LLM API (GPT-4o / Gemini Vision) | User | Perlu API key | BRD V2 S8.2 VD-1 |
| VD-2 | Chart library (Recharts / Tremor) | Developer | Install via pnpm | BRD V2 S8.2 VD-2 |
| VD-3 | Akun GitHub + repo access | Bos Agrian | Perlu push access | BRD V2 S8.2 VD-3 |
| VD-4 | Vercel project setup | Bos Agrian | Perlu connect repo | BRD V2 S8.2 VD-4 |
| VD-5 | Turso DB production | Bos Agrian | Sudah ada V1 | BRD V2 S8.2 VD-5 |
| VD-6 | API key Ollama/OpenRouter | User | User sediakan via UI | BRD S8.3 D1, D2 |
| VD-7 | `@ai-sdk/openai-compatible` matang | Vercel/AI SDK | Dikonfirmasi | RAG-CONTEXT S5.1 |

### 12.3 Asumsi PRD V2

| ID | Asumsi | Status | Dampak bila Salah | Sitasi |
|---|---|---|---|---|
| VA-1 | Vision LLM tersedia untuk classification | Perlu konfirmasi provider | Pipeline V2-3 tidak jalan | BRD V2 S8.1 VA-1 |
| VA-2 | Deskripsi cerita = optional textarea | Perlu konfirmasi | Schema + form beda | BRD V2 S8.1 VA-2 |
| VA-3 | Real-time logs = Collapsible panel | Perlu konfirmasi | Frontend design beda | BRD V2 S8.1 VA-3 |
| VA-4 | Dashboard = simple cards + tables + charts | Perlu konfirmasi | Dev time beda | BRD V2 S8.1 VA-4 |
| VA-5 | Upload di generate = pre-submit | Perlu konfirmasi | UX flow beda | BRD V2 S8.1 VA-5 |
| VA-6 | Role: tokoh/background/prop/accessory/environment/other | Perlu konfirmasi | Schema + UI beda | BRD V2 S8.1 VA-6 |
| VA-7 | Push GitHub = public repo | Perlu konfirmasi | .gitignore beda | BRD V2 S8.1 VA-7 |
| VA-8 | Deploy target Vercel | Perlu konfirmasi | Env vars beda | BRD V2 S8.1 VA-8 |
| VA-9 | AI SDK tetap v4 (tidak upgrade) | ASUMSI | Bila upgrade, breaking | BRD V2 S8.1 VA-9 |
| VA-10 | Tidak ada schema migration besar | Kolom additive only | Bila perlu migration | BRD V2 S8.1 VA-10 |

---

## 13. Referensi

| Dokumen | Path |
|---|---|
| RAG-CONTEXT | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| BRD V2.0 | `C:\laragon\www\PromptFlow\product-docs\BRD.md` |
| MRD V2.0 | `C:\laragon\www\PromptFlow\product-docs\MRD.md` |
| GitHub | https://github.com/agrianwahab29/promptflow.git |

### Sitasi Eksternal

| Sitasi | Klaim |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider via @ai-sdk/openai-compatible |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js |
| https://turso.tech/blog/serverless | Vercel FS tidak persisten -> Turso |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter |

---

**Dokumen ini fokus pada PRODUK V2. Tujuan bisnis di BRD V2.0, pasar di MRD V2.0,
spesifikasi teknis di SRS, arsitektur di PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA,
aturan kode di CODING_RULES. PRD tidak membangun deliverable akhir.**

**Dibuat oleh:** docgen-prd subagent
**Tanggal:** 2026-06-20
**Versi:** 2.0
