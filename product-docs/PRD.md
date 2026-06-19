# Product Requirement Document (PRD)
## PromptFlow — Workflow Engine Otomasi Prompt Animasi AI

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** `product-docs/RAG-CONTEXT.md` + `product-docs/BRD.md` + `product-docs/MRD.md` (bersitasi per klaim penting)
> **GitHub:** https://github.com/agrianwahab29/promptflow.git

---

## Daftar Isi

1. Visi Produk & Ringkasan
2. Persona & Job-to-be-Done
3. User Stories
4. Prioritas Fitur (MoSCoW)
5. Functional Requirements
6. Non-Functional Requirements
7. Acceptance Criteria
8. Spesifikasi Deliverable Konkret
9. Out of Scope Eksplisit
10. Dependencies & Asumsi

---

## 1. Visi Produk & Ringkasan

### 1.1 Visi

> "Satu judul -> paket prompt animasi siap pakai dengan karakter konsisten
> lintas adegan, fleksibel via multi-provider LLM."

PromptFlow = workflow engine otomasi susun prompt animasi AI. Bukan tool
generate media, bukan chatbot manual. PromptFlow mengubah satu input
sederhana (judul + durasi + opsi referensi) menjadi satu paket prompt
terstruktur lengkap (adegan berurut + voiceover + image prompt per tokoh &
per background + deskripsi karakter konsisten + gaya gambar + pesan moral)
yang siap user copy ke tool image/video generation eksternal.

### 1.2 Ringkasan Produk

| Aspek | Nilai |
|---|---|
| Tipe | Web app fullstack (frontend + backend satu repo) |
| Inti fungsi | Otomasi susun prompt animasi terstruktur dari input minimal |
| Input utama | Judul animasi, durasi target, (opsional) referensi gambar tokoh/background |
| Output | Paket prompt teks terstruktur (JSON + opsi export markdown) |
| Stack | Next.js App Router + Vercel AI SDK v6 + `@ai-sdk/openai-compatible` + Turso/libSQL + Tailwind v4 + shadcn/ui, deploy Vercel |
| Multi-provider | Ollama cloud (`https://ollama.com/v1`), OpenRouter (`https://openrouter.ai/api/v1`), 9router (`http://localhost:20128/v1`) + custom |
| Status proyek | Greenfield (tidak ada kode/schema/aset existing) |

**Sitasi:** `RAG-CONTEXT.md 2.1, 5.1, 5.2` ; `BRD.md 1, 7.2 B6` ; `MRD.md 1`

### 1.3 Nilai Produk (Why This Product)

1. **Hemat waktu 80% susun prompt** — satu input vs susun manual tiap adegan.
   - Sitasi: `BRD.md 3.1 BO1, 5.3`
2. **Konsistensi karakter terjamin** — Character master terstruktur (nama,
   gaya rambut, wajah/asal, pakaian atas, pakaian bawah, alas kaki, latar
   belakang, aksi) dirujuk lintas adegan, bukan duplikasi deskripsi per scene.
   - Sitasi: `RAG-CONTEXT.md 4 (catatan konsistensi), 6` ; `BRD.md 2.2 P2`
3. **Fleksibilitas biaya via multi-provider** — user pilih model per proyek
   sesuai budget (Ollama murah, OpenRouter fleksibel, 9router custom).
   - Sitasi: `RAG-CONTEXT.md 5.1, 5.2` ; `BRD.md 8.1 #3`
4. **Output siap pakai & terstandar** — JSON structured + export markdown,
   reproducibility & kolaborasi tim.
   - Sitasi: `BRD.md 5.3` (ASUMSI A4 - `RAG-CONTEXT.md 9 G9`)
5. **Pesan moral built-in** — diferensiasi untuk konten edukasi/anak.
   - Sitasi: `BRD.md 5.3`

---
## 2. Persona & Job-to-be-Done

Persona turun dari stakeholder BRD + persona MRD. **ASUMSI** — RAG-CONTEXT.md
hanya menyebut "user", tidak ada bukti persona eksplisit.
- Sitasi: `BRD.md 4` ; `MRD.md 3` ; `RAG-CONTEXT.md 7`

### 2.1 Tabel Persona

| Atribut | Persona A: Kreator Solo | Persona B: Indie Studio Kecil | Persona C: Edukator |
|---|---|---|---|
| Nama | "Rian si YouTuber" | "Studio Bumi Animasi" | "Bu Sinta Pengajar" |
| Peran | Content creator animasi AI solo | Tim kecil 2-5 orang, serial animasi | Guru/pembuat konten edukasi |
| Demografis | 20-35 thn, ID+global, mobile+desktop | Studio kecil urban ID/global | 30-50 thn, institusi pendidikan |
| Tujuan | Produksi cepat, murah, konsisten | Standarisasi prompt tim, reproducibility | Materi edukasi terstruktur, pesan moral |
| Pain point | Susun prompt lambat, karakter inkonsisten, biaya API | Tidak ada standar format, rework, mahal kalau salah prompt | Naskah & adegan terpisah, workflow fragmentasi |
| Kebutuhan kunci | Hemat waktu, output siap pakai, biaya rendah | Format terstandar, multi-provider, export markdown | Adegan berurut, voiceover, pesan moral, dwibahasa |
| Barier adopsi | Takut biaya API, belum tahu workflow | Butuh onboarding tim (fase awal solo per project) | Butuh UI sederhana, dwibahasa |

**Sitasi:** `MRD.md 3.1` ; batasan fase awal: `BRD.md 8.2 #6`

### 2.2 Job-to-be-Done (JTBD)

| Persona | Job-to-be-Done |
|---|---|
| Kreator Solo | "Saat saya punya ide judul animasi, saya ingin menghasilkan paket prompt lengkap berkualitas dalam hitungan menit, bukan jam, agar bisa produktif tiap minggu." |
| Indie Studio | "Saat tim saya kerja multi-proyek paralel, saya ingin format prompt terstandar & reproducible agar output konsisten antar anggota tim & batch produksi." |
| Edukator | "Saat saya buat materi cerita berpesan moral, saya ingin adegan berurut + naskah voiceover + pesan moral tersusun otomatis agar materi siap pakai di kelas." |

---

## 3. User Stories

Format: **Sebagai [persona], saya ingin [aksi], agar [nilai].**

### 3.1 Input & Generasi Inti (MUST)

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-01 | Sebagai kreator, saya ingin input judul animasi, agar sistem tahu konteks cerita yang akan dibuat. | A/B/C | MUST |
| US-02 | Sebagai kreator, saya ingin input durasi target (Shorts 30-60s/maks 3 menit ATAU Edukasi/Tutorial 7-15 menit), agar jumlah & kedalaman adegan sesuai target. | A/B/C | MUST |
| US-03 | Sebagai kreator, saya ingin sistem generate deskripsi adegan berurut, agar saya tahu alur cerita lengkap. | A/B/C | MUST |
| US-04 | Sebagai kreator, saya ingin sistem generate naskah voiceover per adegan dengan ekspresi sesuai judul & target penonton, agar siap dibacakan/eksport. | A/B/C | MUST |
| US-05 | Sebagai kreator, jika tidak ada referensi gambar tokoh/background, saya ingin sistem otomatis buat deskripsi karakter & background, agar tetap dapat paket lengkap. | A/B/C | MUST |
| US-06 | Sebagai kreator, saya ingin sistem generate image prompt per tokoh (list, mis 10 tokoh = 10 prompt) & per background (banyak tempat = banyak prompt), agar bisa generate tiap elemen visual terpisah. | A/B/C | MUST |
| US-07 | Sebagai kreator, saya ingin deskripsi tokoh terstruktur konsisten (nama, gaya rambut, wajah/asal, pakaian atas, pakaian bawah, alas kaki, latar belakang, aksi) untuk tokoh utama + tokoh lain + pendamping, agar penonton tahu moment penting via karakter stabil. | A/B/C | MUST |
| US-08 | Sebagai kreator, saya ingin sistem generate deskripsi karakter pendukung/hewan beserta aksi yang dilakukan, agar adegan hidup. | A/B/C | MUST |
| US-09 | Sebagai kreator, saya ingin sistem generate adegan-adegan urut, agar alur cerita koheren. | A/B/C | MUST |
| US-10 | Sebagai kreator, saya ingin pilih gaya gambar (3D/2D) + rasio aspect, agar output sesuai platform target. | A/B/C | MUST |
| US-11 | Sebagai kreator, saya ingin sistem akhiri cerita dengan pesan moral/pelajaran positif, agar konten edukatif & bermakna. | A/B/C | MUST |
| US-12 | Sebagai kreator, saya ingin output paket prompt sebagai teks (bukan media), agar bisa copy ke tool image/video gen favorit saya. | A/B/C | MUST |

### 3.2 Konsistensi & Referensi

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-13 | Sebagai kreator, saya ingin konsistensi visual tokoh utama, tokoh lain, & pendamping dijaga lintas adegan, agar penonton tahu moment penting. | A/B/C | MUST |
| US-14 | Sebagai kreator, saya ingin aksi & latar belakang boleh berubah per adegan, agar cerita dinamis tanpa mengorbankan identitas karakter. | A/B/C | MUST |
| US-15 | Sebagai kreator, saya ingin (opsional) upload gambar referensi tokoh & background, agar sistem rujuk nama file sebagai referensi dalam prompt. | A/B/C | SHOULD |
| US-16 | Sebagai kreator, jika saya beri referensi gambar, saya ingin nama file dirujuk dalam image prompt, agar tool image gen saya tahu pakai referensi itu. | A/B/C | SHOULD |

### 3.3 Management Project & Provider

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-17 | Sebagai kreator, saya ingin save project (judul + input + hasil generate) ke akun saya, agar bisa kembali & re-generate nanti. | A/B/C | MUST |
| US-18 | Sebagai kreator, saya ingin CRUD project (create, read/list, update, delete), agar mengelola katalog animasi saya. | A/B/C | MUST |
| US-19 | Sebagai kreator, saya ingin pilih/input provider LLM (Ollama cloud, OpenRouter, 9router, custom), base URL, model, & API key di pengaturan, agar fleksibel pilih model per proyek sesuai budget. | A/B/C | MUST |
| US-20 | Sebagai kreator, saya ingin API key saya disimpan terenkripsi & tidak diekspos ke client, agar aman dari kebocoran. | A/B/C | MUST |
| US-21 | Sebagai kreator, saya ingin export hasil generate ke JSON & markdown, agar bisa share/version-control/arsip. | A/B/C | MUST |

### 3.4 Akun & Bahasa

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-22 | Sebagai kreator, saya ingin login dasar (NextAuth), agar project & pengaturan tersimpan per user. | A/B/C | SHOULD |
| US-23 | Sebagai kreator, saya ingin UI dwibahasa (Indonesia + EN), agar nyaman pakai bahasa saya. | A/C | SHOULD |

### 3.5 Nice-to-Have

| ID | User Story | Persona | Prioritas |
|---|---|---|---|
| US-24 | Sebagai kreator, saya ingin library template judul animasi populer, agar cepat mulai tanpa ide kosong. | A/C | COULD |
| US-25 | Sebagai kreator, saya ingin history generasi per project, agar bisa banding & rollback versi prompt. | A/B | COULD |
| US-26 | Sebagai anggota studio, saya ingin kolaborasi tim dalam satu project (lihat/edit bareng), agar workflow studio. | B | COULD |

---
## 4. Prioritas Fitur (MoSCoW)

MoSCoW = Must / Should / Could / Won't (fase awal).

### 4.1 Tabel Prioritas

| ID | Fitur | MoSCoW | Sumber US | Bukti/Sitasi |
|---|---|---|---|---|
| F-01 | Input judul animasi | MUST | US-01 | User prompt fitur 1 |
| F-02 | Input durasi target (Shorts 30-60s/maks 3 menit; Edukasi 7-15 menit) | MUST | US-02 | User prompt fitur 3 |
| F-03 | Generate deskripsi adegan berurut | MUST | US-03, US-09 | User prompt fitur 4a, 4g |
| F-04 | Generate naskah voiceover per adegan (ekspresi sesuai judul & target penonton) | MUST | US-04 | User prompt fitur 4b |
| F-05 | Auto-buat deskripsi karakter & background jika tidak ada referensi | MUST | US-05 | User prompt fitur 4c |
| F-06 | Generate image prompt per tokoh (list) & per background (list), rujuk nama file jika ada referensi | MUST | US-06, US-16 | User prompt fitur 4d |
| F-07 | Deskripsi tokoh terstruktur konsisten (nama, gaya rambut, wajah/asal, pakaian atas, pakaian bawah, alas kaki, latar, aksi) untuk tokoh utama + lain + pendamping | MUST | US-07, US-13 | User prompt fitur 4e, 5 |
| F-08 | Deskripsi karakter pendukung/hewan + aksi | MUST | US-08 | User prompt fitur 4f |
| F-09 | Pilih gaya gambar (3D/2D) + rasio aspect | MUST | US-10 | User prompt fitur 4h |
| F-10 | Pesan moral / pelajaran positif penutup | MUST | US-11 | User prompt fitur 7 |
| F-11 | Output paket prompt = teks (JSON structured + opsi export markdown) | MUST | US-12, US-21 | User prompt fitur 8 ; ASUMSI A4 `RAG-CONTEXT.md 9 G9` |
| F-12 | Konsistensi visual karakter lintas adegan (aksi & latar boleh berubah, identitas tetap) | MUST | US-13, US-14 | User prompt fitur 5, 6 |
| F-13 | Multi-provider LLM setting (Ollama cloud, OpenRouter, 9router, custom; input base URL + model + API key) | MUST | US-19 | `RAG-CONTEXT.md 5.1, 5.2` ; `BRD.md 8.1 #3` |
| F-14 | Enkripsi API key saat simpan, tidak expose ke client | MUST | US-20 | `BRD.md 6 R6` ; ASUMSI A10 `RAG-CONTEXT.md 11 #4` |
| F-15 | Save project + CRUD project | MUST | US-17, US-18 | `BRD.md 8.1` |
| F-16 | Export hasil (JSON + markdown) | MUST | US-21 | ASUMSI A4 `RAG-CONTEXT.md 9 G9` |
| F-17 | Upload referensi gambar tokoh & background + rujuk nama file dalam prompt | SHOULD | US-15, US-16 | User prompt fitur 2 ; ASUMSI A5 `RAG-CONTEXT.md 6, 9 G3` |
| F-18 | Login dasar (NextAuth) multi-user | SHOULD | US-22 | ASUMSI A1 `BRD.md 7.1` ; `RAG-CONTEXT.md 9 G2` |
| F-19 | UI dwibahasa (ID + EN) | SHOULD | US-23 | ASUMSI A2 `BRD.md 7.1` ; `RAG-CONTEXT.md 9 G5` |
| F-20 | Library template judul animasi populer | COULD | US-24 | ASUMSI (paket konteks) |
| F-21 | History generasi per project | COULD | US-25 | ASUMSI (paket konteks) |
| F-22 | Kolaborasi tim dalam satu project | COULD | US-26 | ASUMSI (paket konteks) ; batasan fase awal `BRD.md 8.2 #6` |
| F-23 | Payment/subscription | WONT | - | `BRD.md 8.2 #5` |
| F-24 | Generate file media (gambar/video/audio) langsung | WONT | - | `BRD.md 8.2 #1` ; `RAG-CONTEXT.md 9 G10` |
| F-25 | TTS voiceover audio | WONT | - | `BRD.md 8.2 #2` ; `RAG-CONTEXT.md 9 G12` |
| F-26 | Integrasi langsung Midjourney/Kling/DALL-E API | WONT | - | `BRD.md 8.2 #3` |
| F-27 | Mobile native app | WONT | - | `BRD.md 8.2 #4` |
| F-28 | Marketplace template prompt | WONT | - | `BRD.md 8.2 #7` |

### 4.2 Ringkasan MoSCoW

- **MUST (16 fitur):** F-01 sampai F-16 — inti engine generasi + provider + project + export.
- **SHOULD (3 fitur):** F-17, F-18, F-19 — upload referensi + login + dwibahasa.
- **COULD (3 fitur):** F-20, F-21, F-22 — template library + history + kolaborasi.
- **WONT (6 fitur):** F-23 sampai F-28 — payment, media gen, TTS, integrasi image gen langsung, mobile native, marketplace.

---
## 5. Functional Requirements

Detail per fitur: input -> proses -> output. ID format FR-XX selaras F-XX.

### FR-01: Input Judul Animasi

| Aspek | Detail |
|---|---|
| Input | Field teks `title` (wajib, min 3 char, max 200 char) |
| Validasi | Tidak kosong, trim whitespace, sanitize HTML |
| Proses | Pass `title` ke prompt template LLM sebagai topik utama |
| Output | `title` tersimpan di record Project + di-inject ke prompt |
| Error | 400 jika kosong/invalid; pesan bahasa aktif (ID/EN) |

### FR-02: Input Durasi Target

| Aspek | Detail |
|---|---|
| Input | Select `duration_type`: `shorts` atau `tutorial` ; + numeric `target_seconds` (opsional override) |
| Aturan | Shorts: ideal 30-60s, maks 180s (3 menit). Tutorial: standar 7-15 menit (420-900s). |
| Validasi | Jika `shorts` & `target_seconds > 180` -> error. Jika `tutorial` & di luar 420-900 -> warning (boleh proceed). |
| Proses | Hitung perkiraan jumlah adegan (ASUMSI P-A12: shorts 3-6 adegan, tutorial 8-20 adegan). Pass ke prompt LLM. |
| Output | `duration_target` + `duration_type` tersimpan di Project; LLM generate adegan sesuai target |
| Error | 400 jika `duration_type` invalid |

### FR-03 & FR-09: Generate Deskripsi Adegan Berurut

| Aspek | Detail |
|---|---|
| Input | `title`, `duration_target`, `style`, `character_profiles` (dari FR-07), referensi (jika ada) |
| Proses | LLM generate array `scenes[]` urut. Tiap scene: `order`, `description` (apa yang terjadi), `voiceover` (FR-04), `image_prompts` (FR-06). |
| Output | `scenes[]` di structured JSON. |
| Konsistensi | Tiap scene reference karakter via `character_id`/nama, bukan duplikasi deskripsi (FR-07). |
| Error | Retry/fallback provider (FR-13). Streaming partial jika timeout. |

### FR-04: Generate Naskah Voiceover

| Aspek | Detail |
|---|---|
| Input | `title`, `duration_target`, target penonton (ASUMSI infer dari judul/style), `scenes[]` |
| Proses | LLM generate `voiceover_script` per scene, ekspresi sesuai judul & audiens |
| Output | `voiceover_script` field per scene (teks, bukan audio) |
| Catatan | Output = naskah teks. TTS out of scope (`BRD.md 8.2 #2`). |

### FR-05: Auto-buat Deskripsi Karakter & Background jika Tidak Ada Referensi

| Aspek | Detail |
|---|---|
| Input | `title`, (opsional) `reference_images[]` |
| Proses | Jika `reference_images` kosong -> LLM invent karakter & background sesuai judul. Jika ada -> pakai referensi (FR-17). |
| Output | `character_profiles[]` + `image_prompts.backgrounds[]` lengkap |

### FR-06: Generate Image Prompt per Tokoh & per Background (List)

| Aspek | Detail |
|---|---|
| Input | `character_profiles[]`, `scenes[]`, `reference_images[]` (opsional) |
| Proses | LLM generate list `image_prompts.characters[]` (1 prompt per tokoh; mis 10 tokoh = 10 prompt) & list `image_prompts.backgrounds[]` (1 per tempat). Jika ada referensi -> rujuk `reference_filename` dalam prompt teks. |
| Output | Array `image_prompts.characters[]` + `image_prompts.backgrounds[]`, tiap item: `target` (nama tokoh/tempat), `prompt_text`, `reference_filename` (nullable) |
| Konsistensi | `prompt_text` tokoh harus konsisten dengan `character_profiles` (nama, rambut, wajah, pakaian, alas kaki). |
| Bukti | Pola rujuk nama file = konvensi teks untuk user copy ke tool image gen (BUKAN API image gen langsung). `RAG-CONTEXT.md 6` |

### FR-07: Deskripsi Tokoh Terstruktur Konsisten

| Aspek | Detail |
|---|---|
| Input | `title`, daftar tokoh (dari LLM atau user input opsional) |
| Struktur WAJIB | Per karakter: `nama`, `gayarambut`, `wajah_asal` (deskripsi wajah atau asal karakter), `pakaian_atas`, `pakaian_bawah`, `alas_kaki`, `deskripsi_latar` (latar belakang karakter), `aksi`, `peran` (utama/lain/pendamping) |
| Proses | LLM generate `character_profiles[]` sekali (master), dirujuk lintas adegan via nama/id, BUKAN duplikasi deskripsi per scene. |
| Output | `character_profiles[]` array master di root JSON |
| Konsistensi | WAJIB stabil lintas `scenes[]`. Identitas (nama, wajah, pakaian) tetap; `aksi` & `deskripsi_latar` boleh berubah per scene (FR-12). |
| Bukti | Struktur SELARAS praktik prompt engineering konsistensi karakter. `RAG-CONTEXT.md 4 (catatan), 6` (mengacu https://kling.ai/blog/ai-character-consistency-guide ; https://glibatree.com/proven-consistent-character-method/) |

### FR-08: Deskripsi Karakter Pendukung / Hewan + Aksi

| Aspek | Detail |
|---|---|
| Input | `title`, `scenes[]` |
| Proses | LLM identifikasi karakter pendukung/hewan per scene + aksi yang dilakukan |
| Output | `supporting_characters[]` (per scene atau global) dengan `nama`, `tipe` (pendukung/hewan), `aksi` |

### FR-10: Pilih Gaya Gambar + Rasio Aspect

| Aspek | Detail |
|---|---|
| Input | Select `style`: `3D` atau `2D` ; select `aspect_ratio`: `16:9` atau `9:16` atau `1:1` atau custom |
| Proses | Pass ke prompt LLM sebagai constraint visual |
| Output | `style` + `aspect_ratio` di root JSON + di-inject ke image prompts |

### FR-11: Pesan Moral Penutup

| Aspek | Detail |
|---|---|
| Input | `title`, `scenes[]`, tone (ASUMSI infer dari judul — default positif/edukatif) |
| Proses | LLM generate `moral_message` di akhir paket |
| Output | `moral_message` field di root JSON (teks) |

### FR-12: Konsistensi Visual Karakter Lintas Adegan

| Aspek | Detail |
|---|---|
| Aturan | Identitas karakter (nama, gaya rambut, wajah/asal, pakaian atas/bawah, alas kaki) WAJIB stabil lintas `scenes[]`. `aksi` & `deskripsi_latar` BOLEH berubah per scene. |
| Mekanisme | Character master (FR-07) dirujuk via id/nama, bukan duplikasi. |
| Validasi | Post-generate: cek `character_profiles` konsisten dengan reference di `scenes[]`. Mismatch -> warning. |
| Bukti | `RAG-CONTEXT.md 4 (catatan konsistensi karakter)` |

### FR-13: Multi-Provider LLM Setting

| Aspek | Detail |
|---|---|
| Input | Form pengaturan: `provider` (select: Ollama cloud, OpenRouter, 9router, custom), `base_url` (text, pre-fill per provider), `model` (text), `api_key` (password field) |
| Base URL default | Ollama cloud: `https://ollama.com/v1` ; OpenRouter: `https://openrouter.ai/api/v1` ; 9router: `http://localhost:20128/v1` ; custom: user input |
| Proses | Server pakai `@ai-sdk/openai-compatible` `createOpenAICompatible({ name, apiKey, baseURL })` untuk init provider. `RAG-CONTEXT.md 5.1` |
| Auth | OpenRouter: `Authorization: Bearer`, opsional `HTTP-Referer`, `X-OpenRouter-Title`. Ollama cloud: Bearer API key. 9router: ASUMSI Bearer/none — perlu konfirmasi user (`RAG-CONTEXT.md 5.2, 9 G4`). |
| Output | Setting tersimpan (API key terenkripsi, FR-14). Provider aktif dipakai saat generate. |
| Fallback | Jika provider gagal -> error jelas + opsi switch provider (ASUMSI P-A13: tidak auto-fallback otomatis fase awal, user manual switch). |
| Bukti | `RAG-CONTEXT.md 5.1, 5.2` |

### FR-14: Enkripsi API Key

| Aspek | Detail |
|---|---|
| Aturan | API key WAJIB dienkripsi saat disimpan di DB, TIDAK diekspos ke client. |
| Mekanisme | ASUMSI P-A10: AES via env key (mis. `ENCRYPTION_KEY` di Vercel env). TIDAK ADA BUKTI mekanisme spesifik -> SRS/CODING_RULES definisikan. `RAG-CONTEXT.md 11 #4` |
| Proses | Encrypt sebelum save DB, decrypt hanya di server saat panggil LLM. Response ke client TIDAK pernah menyertakan API key (mask `****`). |
| Bukti | `BRD.md 6 R6` |

### FR-15: Save Project + CRUD

| Aspek | Detail |
|---|---|
| Create | Simpan Project: `title`, `duration_target`, `duration_type`, `style`, `aspect_ratio`, `reference_images[]`, `result` (JSON hasil generate), `user_id`, `created_at`. |
| Read/List | List project per user (paginate). Detail project by id. |
| Update | Update metadata (judul, durasi) + re-generate (overwrite result). |
| Delete | Soft/hard delete project + cascade reference images & hasil. |
| Validasi | Ownership: user hanya akses project miliknya (butuh FR-18 login). |
| DB | Turso/libSQL. Entitas lihat `RAG-CONTEXT.md 4`. |

### FR-16: Export Hasil (JSON + Markdown)

| Aspek | Detail |
|---|---|
| Format JSON | Structured object (lihat bagian 8). Download `.json`. |
| Format Markdown | Render hasil ke template markdown (adegan, voiceover, image prompt, karakter, pesan moral). Download `.md`. |
| Proses | Server route handler transform JSON -> markdown. |
| Output | File download via browser. |

### FR-17: Upload Referensi Gambar + Rujuk Nama File (SHOULD)

| Aspek | Detail |
|---|---|
| Input | Multipart upload: `reference_images[]` dengan tipe `tokoh` atau `background` + label/nama referensi |
| Storage | ASUMSI P-A5: Vercel Blob untuk prod. `RAG-CONTEXT.md 6, 9 G3`. TIDAK ADA BUKTI preferensi user. |
| Proses | Simpan file -> simpan metadata `ReferenceImage` (filename, path, tipe, project_id) -> saat generate, inject `reference_filename` ke image prompt. |
| Output | `image_prompts.characters[].reference_filename` & `image_prompts.backgrounds[].reference_filename` terisi. |
| Catatan | Filesystem Vercel tidak persisten -> WAJIB storage eksternal (Vercel Blob/S3/R2). `RAG-CONTEXT.md 5.4` |

### FR-18: Login Dasar NextAuth (SHOULD)

| Aspek | Detail |
|---|---|
| Mekanisme | NextAuth (Auth.js) dengan provider credentials/email magic link (ASUMSI). TIDAK ADA BUKTI preferensi provider auth. |
| Sesi | JWT/cookie session. Protected routes: `/projects`, `/settings`, `/generate`. |
| Dampak | Dibutuhkan untuk KPI retention (K3) & ownership project. `BRD.md 3.2 catatan` |
| Bukti | ASUMSI A1 `BRD.md 7.1` ; `RAG-CONTEXT.md 7, 9 G2` |

### FR-19: UI Dwibahasa ID + EN (SHOULD)

| Aspek | Detail |
|---|---|
| Mekanisme | i18n via Next.js App Router (ASUMSI: next-intl atau native). TIDAK ADA BUKTI preferensi lib. |
| Scope | UI label, pesan error, placeholder. Konten generate LLM bahasa sesuai input/judul (ASUMSI). |
| Bukti | ASUMSI A2 `BRD.md 7.1` ; `RAG-CONTEXT.md 9 G5` |

### FR-20 sampai FR-22 (COULD) & FR-23 sampai FR-28 (WONT)

Detail ditangguhkan ke fase akhir. Asumsi di `MRD.md 10`.

---
## 6. Non-Functional Requirements

### 6.1 Performa

| ID | Requirement | Target | Bukti/Sitasi |
|---|---|---|---|
| NFR-P1 | Latency generasi Shorts (30-60s durasi) | <= 60 detik end-to-end (streaming) | ASUMSI P-A11 (paket konteks) |
| NFR-P2 | Latency generasi Tutorial (7-15 menit durasi) | <= 180 detik end-to-end (streaming) | ASUMSI P-A11 (paket konteks) |
| NFR-P3 | Streaming partial output via SSE | Token mulai mengalir < 10s setelah submit | ASUMSI A6 `RAG-CONTEXT.md 5.4, 9 G6` |
| NFR-P4 | UI response time (non-generate) | < 2s page load (Vercel edge) | ASUMSI (best practice) |
| NFR-P5 | DB query | < 500ms per query (Turso HTTP) | `RAG-CONTEXT.md 2.2` |

### 6.2 Keamanan

| ID | Requirement | Bukti/Sitasi |
|---|---|---|
| NFR-S1 | API key user dienkripsi saat disimpan (AES via env key ASUMSI P-A10) | `BRD.md 6 R6` ; `RAG-CONTEXT.md 11 #4` |
| NFR-S2 | API key TIDAK pernah diekspos ke client (mask `****`) | `BRD.md 6 R6` |
| NFR-S3 | Input sanitization (XSS prevention) pada judul & field teks | ASUMSI (best practice) |
| NFR-S4 | Rate limit endpoint generate (ASUMSI: 10 req/min/user) | ASUMSI |
| NFR-S5 | HTTPS only (Vercel default) | `RAG-CONTEXT.md 2.1` |
| NFR-S6 | Ownership check: user hanya akses project/setting miliknya | ASUMSI (best practice) |

### 6.3 Skalabilitas

| ID | Requirement | Bukti/Sitasi |
|---|---|---|
| NFR-SC1 | Serverless deploy Vercel (auto-scale) | `RAG-CONTEXT.md 2.1` |
| NFR-SC2 | DB Turso (libSQL) via HTTP, scalable | `RAG-CONTEXT.md 2.2` |
| NFR-SC3 | Storage gambar Vercel Blob (ASUMSI) scalable | `RAG-CONTEXT.md 6` |

### 6.4 Reliability

| ID | Requirement | Bukti/Sitasi |
|---|---|---|
| NFR-R1 | Error handling provider: pesan jelas + opsi switch provider | `BRD.md 6 R1` |
| NFR-R2 | Streaming partial disimpan walau timeout (ASUMSI) | `BRD.md 6 R5` |
| NFR-R3 | Retry policy panggil LLM (ASUMSI: 3 retry backoff) | ASUMSI |
| NFR-R4 | DB backup via Turso (built-in) | `RAG-CONTEXT.md 2.1` |

### 6.5 UX

| ID | Requirement | Bukti/Sitasi |
|---|---|---|
| NFR-U1 | Loading state streaming SSE (progress per komponen) | ASUMSI A6 `RAG-CONTEXT.md 5.4` |
| NFR-U2 | Preview hasil real-time per komponen (adegan, karakter, voiceover) | ASUMSI |
| NFR-U3 | Error state jelas dengan action recovery | ASUMSI |
| NFR-U4 | Copy-to-clipboard per prompt item | ASUMSI |

### 6.6 Aksesibilitas

| ID | Requirement | Bukti/Sitasi |
|---|---|---|
| NFR-A1 | WCAG 2.1 AA compliance | ASUMSI (best practice) |
| NFR-A2 | Keyboard navigable semua form & output | ASUMSI |
| NFR-A3 | Screen reader label pada field upload & hasil | ASUMSI |

### 6.7 i18n

| ID | Requirement | Bukti/Sitasi |
|---|---|---|
| NFR-I1 | UI dwibahasa ID + EN | ASUMSI A2 `BRD.md 7.1` ; `RAG-CONTEXT.md 9 G5` |
| NFR-I2 | Konten generate LLM bahasa sesuai input (ASUMSI ikut judul) | ASUMSI |

---
## 7. Acceptance Criteria

Testable, per fitur utama (MUST + SHOULD).

### AC-01: Input Judul

- [ ] Field `title` wajib, validasi min 3 max 200 char.
- [ ] Empty submit -> error 400 + pesan bahasa aktif.
- [ ] Trim whitespace otomatis.

### AC-02: Input Durasi

- [ ] Select `duration_type` (shorts/tutorial).
- [ ] Shorts + `target_seconds > 180` -> error.
- [ ] Tutorial di luar 420-900 -> warning (boleh proceed).
- [ ] `duration_target` tersimpan di Project.

### AC-03/09: Generate Adegan Urut

- [ ] `scenes[]` ter-generate urut (`order` 1..N).
- [ ] Tiap scene punya `description` non-kosong.
- [ ] Jumlah adegan sesuai durasi (shorts 3-6, tutorial 8-20 ASUMSI P-A12).

### AC-04: Voiceover

- [ ] Tiap scene punya `voiceover_script` teks.
- [ ] Ekspresi sesuai judul & target penonton (manual review).
- [ ] Output teks, bukan audio.

### AC-05: Auto-buat Karakter & Background

- [ ] Tanpa referensi -> `character_profiles[]` & `image_prompts.backgrounds[]` tetap terisi.
- [ ] Karakter relevan dengan judul (manual review).

### AC-06: Image Prompt per Tokoh & Background

- [ ] `image_prompts.characters[]` = N prompt untuk N tokoh.
- [ ] `image_prompts.backgrounds[]` = M prompt untuk M tempat.
- [ ] Tiap `prompt_text` detail visual.

### AC-07: Deskripsi Tokoh Terstruktur

- [ ] Tiap karakter punya field: `nama`, `gayarambut`, `wajah_asal`, `pakaian_atas`, `pakaian_bawah`, `alas_kaki`, `deskripsi_latar`, `aksi`, `peran`.
- [ ] `peran` = utama/lain/pendamping.
- [ ] Field tidak kosong (manual review untuk kualitas).

### AC-08: Karakter Pendukung/Hewan

- [ ] `supporting_characters[]` terisi bila ada.
- [ ] Tiap item punya `aksi`.

### AC-10: Gaya Gambar + Rasio

- [ ] Select `style` (3D/2D) + `aspect_ratio`.
- [ ] Kedua field muncul di root JSON & di-inject ke image prompts.

### AC-11: Pesan Moral

- [ ] `moral_message` non-kosong di akhir paket.
- [ ] Positif/edukatif (manual review).

### AC-12: Konsistensi Karakter

- [ ] Identitas karakter (nama, rambut, wajah, pakaian, alas kaki) SAMA di `character_profiles` & reference di `scenes[]`.
- [ ] `aksi` & `deskripsi_latar` BOLEH beda per scene.
- [ ] Post-check: mismatch -> warning.

### AC-13: Multi-Provider Setting

- [ ] Form pengaturan: select provider + base URL + model + API key.
- [ ] Base URL pre-fill sesuai provider (Ollama `https://ollama.com/v1`, OpenRouter `https://openrouter.ai/api/v1`, 9router `http://localhost:20128/v1`).
- [ ] Custom provider -> user input base URL.
- [ ] Save -> provider aktif dipakai saat generate.
- [ ] Provider gagal -> error jelas + opsi switch.
- Bukti: `RAG-CONTEXT.md 5.1, 5.2`.

### AC-14: Enkripsi API Key

- [ ] API key dienkripsi di DB (bukan plaintext).
- [ ] Response ke client: mask `****`.
- [ ] Decrypt hanya server-side saat panggil LLM.

### AC-15: Save & CRUD Project

- [ ] Create: simpan Project + hasil generate.
- [ ] List: paginate per user.
- [ ] Detail: by id + ownership check.
- [ ] Update: metadata + re-generate.
- [ ] Delete: cascade reference images & hasil.

### AC-16: Export

- [ ] Export JSON: download `.json` valid, struktur sesuai bagian 8.
- [ ] Export Markdown: download `.md`, terbaca, semua komponen ada.

### AC-17: Upload Referensi (SHOULD)

- [ ] Upload multipart (tokoh/background).
- [ ] Simpan metadata `ReferenceImage`.
- [ ] `reference_filename` muncul di `image_prompts`.
- [ ] Tanpa referensi -> field null, fitur tetap jalan (FR-05).

### AC-18: Login (SHOULD)

- [ ] NextAuth login berfungsi.
- [ ] Protected routes redirect ke login jika unauth.
- [ ] Project & setting scoped per user.

### AC-19: Dwibahasa (SHOULD)

- [ ] Toggle ID/EN mengubah UI label.
- [ ] Pesan error bahasa aktif.

### AC Non-Functional

- [ ] NFR-P1: Shorts <= 60s end-to-end (streaming).
- [ ] NFR-P2: Tutorial <= 180s end-to-end (streaming).
- [ ] NFR-P3: Token mulai mengalir < 10s.
- [ ] NFR-S1/S2: API key enkripsi + mask.
- [ ] NFR-A1: WCAG AA.

---
## 8. Spesifikasi Deliverable Konkret

### 8.1 Deliverable

**Web app Next.js fullstack** (frontend + backend satu repo), deploy Vercel,
DB Turso/libSQL, multi-provider LLM via `@ai-sdk/openai-compatible`.
- Sitasi: `RAG-CONTEXT.md 2.1, 5.1`

### 8.2 Output Prompt Terstruktur (JSON Schema)

Hasil generasi = JSON structured object. Rekomendasi SRS: pakai
`supportsStructuredOutputs: true` bila provider dukung (`RAG-CONTEXT.md 11 #1`).

```json
{
  "title": "string",
  "duration_target": { "type": "shorts|tutorial", "seconds": number },
  "style": { "type": "3D|2D", "aspect_ratio": "16:9|9:16|1:1|custom" },
  "character_profiles": [
    {
      "nama": "string",
      "gayarambut": "string",
      "wajah_asal": "string",
      "pakaian_atas": "string",
      "pakaian_bawah": "string",
      "alas_kaki": "string",
      "deskripsi_latar": "string",
      "aksi": "string",
      "peran": "utama|lain|pendamping"
    }
  ],
  "scenes": [
    {
      "order": number,
      "description": "string",
      "voiceover_script": "string",
      "image_prompts": {
        "characters": [
          { "target": "string", "prompt_text": "string", "reference_filename": "string|null" }
        ],
        "backgrounds": [
          { "target": "string", "prompt_text": "string", "reference_filename": "string|null" }
        ]
      }
    }
  ],
  "image_prompts": {
    "characters": [
      { "target": "string", "prompt_text": "string", "reference_filename": "string|null" }
    ],
    "backgrounds": [
      { "target": "string", "prompt_text": "string", "reference_filename": "string|null" }
    ]
  },
  "supporting_characters": [
    { "nama": "string", "tipe": "pendukung|hewan", "aksi": "string" }
  ],
  "moral_message": "string"
}
```

**Catatan field:**
- `character_profiles` = master konsisten (FR-07), dirujuk lintas `scenes` via nama.
- `image_prompts.characters[]` & `image_prompts.backgrounds[]` di root = list lengkap per tokoh/tempat (FR-06). Di `scenes[].image_prompts` = varian per adegan (aksi/latar beda).
- `reference_filename` = nama file upload (FR-17) atau null.

### 8.3 Struktur Konten

Output markdown export (FR-16) merender:

1. **Judul + metadata** (durasi, style, rasio)
2. **Profil Karakter** (master) — tiap karakter: nama, rambut, wajah/asal, pakaian atas/bawah, alas kaki, latar, aksi, peran
3. **Karakter Pendukung/Hewan**
4. **Adegan Berurut** — tiap adegan: deskripsi, voiceover, image prompt tokoh & background (dengan reference_filename jika ada)
5. **Image Prompt Master List** (per tokoh + per background)
6. **Pesan Moral**

### 8.4 Format & Aset

| Aspek | Spesifikasi | Bukti |
|---|---|---|
| Output utama | JSON structured (8.2) | ASUMSI A4 `RAG-CONTEXT.md 9 G9` |
| Export alternatif | Markdown (.md) | ASUMSI A4 |
| Aset wajib | TIDAK ADA aset existing (greenfield). ASUMSI: logo/maskot TBD UIUX_SPEC. | `RAG-CONTEXT.md 8` |
| Font | ASUMSI: Inter atau Geist (default Next.js/Tailwind v4) | `RAG-CONTEXT.md 8` |
| Tema | Light/dark via shadcn/ui (ASUMSI) | `RAG-CONTEXT.md 8` |
| Path aset | `public/references/` untuk upload lokal dev (ASUMSI); prod via Vercel Blob | `RAG-CONTEXT.md 3, 6` |

### 8.5 Struktur Folder Asumsi

(Turun dari `RAG-CONTEXT.md 3`, ASUMSI — bukan fakta proyek.)

```
PromptFlow/
  product-docs/
  src/
    app/
      api/           # route handlers (generate, projects, settings, export)
      (dashboard)/   # UI pages
    lib/
      ai/            # provider factory multi-provider
      db/            # turso client + schema
      prompts/       # prompt templates untuk LLM
    components/      # shadcn/ui + custom
  public/
    references/      # gambar referensi upload (lokal dev ASUMSI)
```

---

## 9. Out of Scope Eksplisit

Fase awal. Dikonfirmasi `BRD.md 8.2` + `RAG-CONTEXT.md 9`.

| # | Out of Scope | Alasan | Bukti |
|---|---|---|---|
| OOS-1 | Generate file media (gambar/video/audio) langsung | Output = teks prompt. User copy ke tool eksternal. | `BRD.md 8.2 #1` ; `RAG-CONTEXT.md 9 G10` |
| OOS-2 | TTS voiceover audio | Output = naskah teks. | `BRD.md 8.2 #2` ; `RAG-CONTEXT.md 9 G12` |
| OOS-3 | Integrasi langsung Midjourney/Kling/DALL-E API | User copy prompt manual. | `BRD.md 8.2 #3` |
| OOS-4 | Mobile native app (iOS/Android) | Web responsif dulu. | `BRD.md 8.2 #4` |
| OOS-5 | Payment/subscription | Fase awal fokus adoption. | `BRD.md 8.2 #5` |
| OOS-6 | Kolaborasi real-time multi-user dalam satu project | Fase awal solo per project. | `BRD.md 8.2 #6` |
| OOS-7 | Marketplace template prompt | Fase akhir. | `BRD.md 8.2 #7` |
| OOS-8 | Auto-fallback provider otomatis | User manual switch fase awal (ASUMSI P-A13). | ASUMSI |
| OOS-9 | Animasi/motion preview di app | Output = teks. | `RAG-CONTEXT.md 9 G10` |

---
## 10. Dependencies & Asumsi

### 10.1 Dependencies

| ID | Dependency | Pemilik | Status | Sitasi |
|---|---|---|---|---|
| D1 | API key Ollama cloud | User | User sediakan | `BRD.md 8.3 D1` |
| D2 | API key OpenRouter | User | User sediakan | `BRD.md 8.3 D2` |
| D3 | Proxy 9router jalan lokal (`http://localhost:20128/v1`) | User | ASUMSI valid lokal | `RAG-CONTEXT.md 5.2, 9 G4` |
| D4 | Akun Vercel + Turso | Bos Agrian/tim | Sediakan untuk deploy | `BRD.md 8.3 D4` |
| D5 | Storage gambar (Vercel Blob/eksternal) | Bos Agrian/tim | ASUMSI rekomendasi | `RAG-CONTEXT.md 6, 9 G3` |
| D6 | `@ai-sdk/openai-compatible` matang | Vercel/AI SDK | Dikonfirmasi | `RAG-CONTEXT.md 5.1` |
| D7 | Turso resmi di Vercel Marketplace | Turso/Vercel | Dikonfirmasi | `RAG-CONTEXT.md 2.1` |

### 10.2 Asumsi PRD

| ID | Asumsi | Status Bukti | Sitasi |
|---|---|---|---|
| P-A1 | App multi-user dengan login dasar NextAuth | TIDAK ADA BUKTI eksplisit | `BRD.md 7.1 A1` ; `RAG-CONTEXT.md 7, 9 G2` |
| P-A2 | UI dwibahasa ID + EN | TIDAK ADA BUKTI | `BRD.md 7.1 A2` ; `RAG-CONTEXT.md 9 G5` |
| P-A3 | Batas tokoh default 10 per project | TIDAK ADA BUKTI | `BRD.md 7.1 A3` ; `RAG-CONTEXT.md 9 G11` |
| P-A4 | Output JSON structured + export markdown | TIDAK ADA BUKTI format spesifik | `RAG-CONTEXT.md 9 G9, 11 #1` |
| P-A5 | Upload gambar via Vercel Blob | ASUMSI rekomendasi | `RAG-CONTEXT.md 6, 9 G3` |
| P-A6 | Streaming SSE untuk generasi panjang | ASUMSI | `RAG-CONTEXT.md 5.4, 9 G6` |
| P-A7 | 9router proxy valid lokal | TIDAK ADA BUKTI eksternal | `RAG-CONTEXT.md 5.2, 9 G4` |
| P-A8 | Default model LLM per provider | TIDAK ADA BUKTI | `RAG-CONTEXT.md 9 G8` |
| P-A9 | Target persona kreator/studio/edukator | TIDAK ADA BUKTI eksplisit | `BRD.md 4` ; `RAG-CONTEXT.md 7` |
| P-A10 | Enkripsi API key via AES env key | TIDAK ADA BUKTI mekanisme | `RAG-CONTEXT.md 11 #4` |
| P-A11 | Latency Shorts <=60s, Tutorial <=180s | ASUMSI paket konteks | (paket konteks) |
| P-A12 | Jumlah adegan: shorts 3-6, tutorial 8-20 | ASUMSI | (paket konteks) |
| P-A13 | Auto-fallback provider = manual switch (bukan otomatis) fase awal | ASUMSI | (paket konteks) |

### 10.3 Gap yang Perlu Konfirmasi (turun dari RAG-CONTEXT.md 9)

| Gap | Dampak ke PRD | Penanggung jawab konfirmasi |
|---|---|---|
| G2 (auth) | Login dasar = SHOULD (F-18) | PRD keputusan: SHOULD |
| G3 (storage gambar) | FR-17 pakai Vercel Blob ASUMSI | SRS/ARCHITECTURE |
| G4 (9router detail) | FR-13 asumsikan Bearer/none | User konfirmasi |
| G5 (bahasa UI) | F-19 = SHOULD | UIUX_SPEC |
| G6 (streaming vs batch) | NFR-P3 streaming SSE ASUMSI | SRS validasi timeout |
| G7 (Prisma vs raw libsql) | Tidak langsung di PRD | DB_SCHEMA/ARCHITECTURE |
| G8 (model default) | FR-13 user input model (no default hardcode) | SRS list rekomendasi |
| G9 (format output) | JSON structured 8.2 | SRS definisikan |
| G11 (batas tokoh) | P-A3 default 10 | SRS tentukan |

---

## 11. Referensi

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` |
| MRD | `C:\laragon\www\PromptFlow\product-docs\MRD.md` |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### Sitasi eksternal kunci

| Sitasi | Klaim didukung |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider via `@ai-sdk/openai-compatible` |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter `https://openrouter.ai/api/v1` |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat `https://ollama.com/v1` |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js setup |
| https://turso.tech/blog/serverless | Vercel filesystem tidak persisten -> Turso |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter via deskripsi terstruktur |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter terstruktur |

---

**Dokumen ini fokus pada PRODUK. Tujuan bisnis di BRD, pasar di MRD,
spesifikasi teknis di SRS, arsitektur di PROJECT_ARCHITECTURE, data di
DATABASE_SCHEMA, aturan kode di CODING_RULES. PRD tidak membangun deliverable
akhir.**
