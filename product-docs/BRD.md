# Business Requirement Document (BRD)
## PromptFlow V3 — Workflow Engine Update

**Versi:** 3.0
**Tanggal:** 2026-06-22
**Status:** Draft
**Penanggung Jawab:** PromptFlow Product Team

---

## 1. Ringkasan Eksekutif

PromptFlow adalah web application berbasis Next.js 15 yang berfungsi sebagai workflow engine untuk menghasilkan paket prompt animasi AI secara terstruktur. Aplikasi mendukung multi-provider LLM (Ollama, OpenRouter, 9router, custom) dan di-deploy di Vercel.

Update V3 memperkenalkan **5 fitur inti** yang mengubah PromptFlow dari generator prompt sederhana menjadi production-grade animation brief generator:

1. **Light Theme** — dukungan tema terang/gelap/sistem
2. **Scene Transition Flow Engine** — 6 jenis transisi dengan flow patterns
3. **Complex Image Prompts** — struktur 8 lapis menggantikan prompt satu baris
4. **Voice Type Specification** — pemetaan karakter ke 7 tipe suara
5. **Audio Specification** — 5 jenis audio per scene (ambient, BGM, SFX, music cue, transition audio)

Seluruh fitur telah diimplementasi pada level kode dan skema database. Namun terdapat **critical data gaps** — beberapa field yang dihasilkan LLM tidak tersimpan ke database, dan cakupan E2E test masih minimal (1 test).

BRD ini mendokumentasikan justifikasi bisnis, tujuan terukur, stakeholder, dan risiko agar tim dapat menutup gaps tersebut secara prioritis.

---

## 2. Latar Belakang Bisnis & Masalah

### 2.1 Konteks Produk

PromptFlow melayani kreator konten, animator, dan studio kecil yang membutuhkan "animation brief" terstruktur — paket prompt lengkap yang mencakup scene, karakter, visual, suara, dan transisi — untuk digunakan pada tool AI video generator seperti Runway, Pika, Kling, dan Sora.

### 2.2 Masalah yang Dihadapi (Sebelum V3)

| # | Masalah | Dampak Bisnis |
|---|---------|---------------|
| M1 | **Dark-only theme** membatasi pengguna di lingkungan terang (outdoor, office) | Reduced session time, accessibility barrier |
| M2 | **Scene transition tidak terstruktur** — LLM menghasilkan cut biasa tanpa spesifikasi | Video output "jarring cuts", kualitas profesional rendah |
| M3 | **Image prompt satu baris** — tidak cukup untuk AI generator modern yang mendukung kontrol granular | Output visual inkonsisten, retry LLM meningkat |
| M4 | **Tidak ada spesifikasi suara** — voiceover tanpa tipe suara, tanpa audio design | Animator harus menentukan suara manual → workflow terputus |
| M5 | **Audio spec tidak tersimpan ke DB** meskipun LLM sudah menghasilkan | Data loss antara generate → save, pengguna kehilangan audio plan |
| M6 | **Color palette & technical layer** tidak tersimpan ke DB | Lapisan 8-layer image prompt tidak lengkap secara persistensi |
| M7 | **E2E test coverage minimal** (hanya 1 test login) | Regresi tidak terdeteksi, risiko deploy tinggi |
| M8 | **Landing page** tidak menampilkan fitur V3 | Calon pengguna tidak tahu capability baru → conversion rendah |

### 2.3 Akar Masalah

PromptFlow V2 dirancang sebagai generator prompt teks sederhana. Seiring evolusi tool AI video generator (Runway Gen-3, Kling 1.6, Sora) yang mendukung kontrol lebih granular, PromptFlow perlu naik level dari "text prompt generator" menjadi "structured animation brief engine". V3 adalah lompatan tersebut.

---

## 3. Peluang & Justifikasi Nilai

### 3.1 Kenapa V3 Layak Dikerjakan

| Peluang | Bukti | Potensi Nilai |
|---------|-------|---------------|
| **Market gap** — tidak ada tool sejenis yang generate animation brief terstruktur (scene + transition + voice + audio + image layers) secara terintegrasi | Kompetitor (Runway, Pika) fokus pada video generation, bukan brief/plan | First-mover advantage di niche "AI animation planning" |
| **User workflow continuity** — pengguna saat ini harus pakai 3-4 tool terpisah untuk mencapai hasil yang sama | Tanpa PromptFlow V3: ChatGPT (naskah) + spreadsheet (scene plan) + manual (voice/audio) | Time savings 60-80% per project |
| **Retention lever** — fitur audio & voice membuat pengguna kembali ke PromptFlow untuk tiap project baru | Repeat usage = retention = sustainability | Target: 40% returning users within 30 days |
| **API-first architecture** — Next.js API routes + Zod schema memungkinkan future monetisasi via API access | Sudah ada 20+ endpoints, SSE streaming | Future revenue stream: API plan |

### 3.2 Justifikasi Investasi

- **Tech stack sudah ada** — Next.js 15, Drizzle, Turso, Zod, Vercel AI SDK sudah terpasang
- **Skema DB V3 sudah di-migrate** — 11 ALTER TABLE + 1 CREATE TABLE sudah dijalankan
- **Prompt builder V3 sudah jalan** — 6 blok instruksi V3 aktif di `prompt-builder.ts`
- **Gap-nya adalah data persistence & quality**, bukan fitur dari nol → effort relatif rendah, impact tinggi

---

## 4. Tujuan Bisnis & KPI Terukur

| # | Tujuan Bisnis | KPI | Target | Pengukuran |
|---|--------------|-----|--------|------------|
| G1 | Menjangkau pengguna di lingkungan kerja terang | Theme adoption rate (light/system) | ≥ 30% pengguna aktif dalam 30 hari post-launch | Analytics event `theme_change` |
| G2 | Menghasilkan output video berkualitas lebih tinggi | Scene transition usage rate | ≥ 70% scene menggunakan transisi selain "cut" | DB query: `scenes.transition_type != 'cut'` |
| G3 | Mengurangi retry manual pada image generator | Image prompt completeness | ≥ 90% image prompt memiliki ≥ 6 dari 8 layer terisi | DB query: non-null count per kolom `image_prompts` |
| G4 | Menyediakan audio plan tanpa tool tambahan | Audio spec generation rate | ≥ 80% project memiliki audio specs tersimpan | DB query: `scene_audio` count per project |
| G5 | Menutup data gap antara LLM output dan DB | Data persistence completeness | 100% field LLM tersimpan (audio, color_palette, technical, voiceover_speaker) | Code review + integration test |
| G6 | Meningkatkan kepercayaan terhadap kualitas deploy | E2E test coverage | ≥ 10 critical path E2E tests passing | Playwright report |
| G7 | Mengkomunikasikan fitur V3 ke calon pengguna | Landing page V3 section visibility | 100% fitur V3 tercantum di landing page | Manual review |

---

## 5. Stakeholder & Kepentingan

| # | Stakeholder | Peran | Kepentingan dalam V3 | Level Pengaruh |
|---|------------|-------|---------------------|----------------|
| S1 | **Product Owner / Founder** | Penentu arah produk & prioritas | Memastikan V3 deliver value, menutup gaps, menjaga scope | Tinggi |
| S2 | **End User — Content Creator** | Pengguna utama generate prompt | Butuh output lengkap (transition + voice + audio + image layers) yang siap pakai | Tinggi |
| S3 | **End User — Animator / Studio** | Konsument output PromptFlow | Butuh brief terstruktur agar workflow animasi efisien | Tinggi |
| S4 | **Developer / Tech Lead** | Implementasi & maintenance | Butuh spesifikasi jelas untuk menutup DB gaps, tambah E2E test | Sedang |
| S5 | **QA / Tester** | Validasi kualitas | Butuh acceptance criteria testable, E2E coverage | Sedang |
| S6 | **LLM Provider** (Ollama, OpenRouter, 9router) | Infrastruktur AI | Tidak langsung terlibat, tapi output quality bergantung pada model yang dipakai | Rendah |
| S7 | **Vercel** | Hosting & deployment | Platform target, menentukan constraint (serverless timeout, edge runtime) | Rendah |

---

## 6. Ruang Lingkup Bisnis

### 6.1 In Scope (V3 Update)

| # | Lingkup | Keterangan |
|---|---------|------------|
| 1 | Light/Dark/System theme toggle | Sudah diimplementasi, perlu validasi UX dan landing page mention |
| 2 | Scene Transition Flow Engine | 6 jenis transisi (cut, dissolve, fade_to_black, fade_to_white, wipe, match_cut) + flow patterns + UI card |
| 3 | Complex Image Prompts (8-layer) | prompt_text, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical |
| 4 | Voice Type Specification | 7 tipe (child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator) + emotion/speed/pitch |
| 5 | Audio Specification | 5 jenis (background_music, sfx, ambient, music_cue, transition_audio) per scene |
| 6 | Data persistence gap closure | Simpan audio_specs, color_palette, technical, voiceover_speaker ke DB |
| 7 | E2E test expansion | Minimal 10 critical path tests |
| 8 | Landing page V3 update | Tambah section fitur V3 |

### 6.2 Out of Scope

| # | Item | Alasan |
|---|------|--------|
| 1 | Multi-tenant / team collaboration | Fitur masa depan, bukan bagian V3 |
| 2 | Payment / billing integration | Belum ada model monetisasi aktif |
| 3 | Redis rate limiting | Dibutuhkan di production, tapi bukan bagian scope V3 fitur |
| 4 | Mobile app / PWA | Web-first, mobile responsive cukup |
| 5 | Real-time collaboration | Fitur masa depan |
| 6 | Video rendering / preview | PromptFlow menghasilkan brief, bukan video |
| 7 | LLM fine-tuning / custom training | Menggunakan provider existing |

---

## 7. Asumsi & Batasan Bisnis

### 7.1 Asumsi

| # | Asumsi | Basis |
|---|--------|-------|
| A1 | Pengguna memiliki akses ke minimal satu LLM provider (Ollama lokal atau OpenRouter API) | Product dirancang multi-provider, setup guide tersedia |
| A2 | Target pengguna memahami konsep dasar animasi/video production | Niche market: kreator konten & animator |
| A3 | Output PromptFlow digunakan sebagai input ke tool AI video generator (Runway, Pika, Kling, Sora) | Prompt builder target tools tercantum di kode |
| A4 | Vercel Hobby plan tetap digunakan (max 300s serverless timeout) | `maxDuration=300` di generate route |
| A5 | Database Turso/libSQL dapat menangkap skema V3 tanpa migrasi breaking | Migration script `0001_v3_core_features.sql` sudah dijalankan |
| A6 | Kualitas output sangat bergantung pada LLM model yang dipakai | PromptFlow mengontrol prompt structure, bukan model capability |
| A7 | Produk ini Indonesia-first dengan dukungan English | Default locale `id`, i18n `id/en` |

### 7.2 Batasan Bisnis

| # | Batasan | Dampak |
|---|---------|--------|
| B1 | Rate limit in-memory (10 req/min/user) — tidak cocok untuk multi-instance production | Hanya 1 instance Vercel serverless yang aktif pada satu waktu (acceptable untuk sekarang) |
| B2 | LLM timeout 240 detik — prompt kompleks V3 mungkin membutuhkan waktu lebih lama | Perlu monitoring actual generation time |
| B3 | No component test (.test.tsx) — hanya unit test lib layer | UI regression tidak terdeteksi otomatis |
| B4 | Voice & audio spec adalah rekomendasi LLM, bukan produksi-ready | Pengguna tetap perlu menyesuaikan dengan tool audio/video |

---

## 8. Risiko Bisnis & Mitigasi

| # | Risiko | Probabilitas | Dampak | Mitigasi |
|---|--------|-------------|--------|----------|
| R1 | **Data loss pada audio specs** — LLM menghasilkan audio_spec tapi tidak tersimpan ke DB | Tinggi (sudah terjadi — gap terverifikasi di kode) | Pengguna kehilangan audio plan, harus regenerate | Fix: simpan `audio_specs` dari LLM output ke `scene_audio` table di generate route |
| R2 | **Image prompt layers tidak lengkap** — color_palette & technical tidak tersimpan | Tinggi (gap terverifikasi — kolom tidak ada di `image_prompts` table) | 8-layer structure tidak terwujud secara data, hanya 6 layer tersimpan | Fix: ALTER TABLE tambah kolom `color_palette` dan `technical` |
| R3 | **Voiceover speaker hilang** — `voiceover_speaker` ada di Zod schema tapi tidak di DB | Tinggi (gap terverifikasi) | Mapping speaker → scene tidak persisten | Fix: ALTER TABLE tambah kolom `voiceover_speaker` ke `scenes` |
| R4 | **Regresi tanpa terdeteksi** — hanya 1 E2E test | Sedang | Bug di generate flow, project CRUD, atau settings lolos ke production | Fix: tambah minimal 10 E2E tests untuk critical paths |
| R5 | **Landing page tidak konversi** — fitur V3 tidak dikomunikasikan | Sedang | Calon pengguna tidak tahu capability baru, signup stagnan | Fix: update `features.ts` dengan 4-5 fitur V3 |
| R6 | **LLM output quality bervariasi** — model berbeda menghasilkan struktur berbeda | Sedang | Beberapa model mungkin tidak mengikuti 8-layer structure atau audio spec format | Mitigasi: Zod validation + response parser sudah ada, perlu test coverage |
| R7 | **Vercel timeout pada prompt kompleks** — V3 prompt lebih panjang dari V2 | Rendah | Generate gagal untuk project besar (20+ scene) | Mitigasi: monitoring duration, consider chunked generation di masa depan |
| R8 | **Scope creep** — stakeholder minta fitur di luar 5 fitur inti | Sedang | Timeline meleset, focus tersebar | Mitigasi: BRD ini mendefinisikan in/out scope secara eksplisit |

---

## Lampiran

### L1. Referensi Teknis

- Tech stack detail: lihat `RAG-CONTEXT.md` Section 2
- Database schema: lihat `RAG-CONTEXT.md` Section 4
- API endpoints: lihat `RAG-CONTEXT.md` Section 5
- Gap analysis: lihat `RAG-CONTEXT.md` Section 18

### L2. Template Presets V3 (Sudah Aktif)

| Preset | Transition | Voice | Audio |
|--------|-----------|-------|-------|
| Tutorial | dissolve 800ms | narrator/calm | lo-fi, classroom |
| Sinematik | fade_to_black 1500ms | adult_male/dramatic | orchestral, cinematic |
| Anak-anak | wipe 400ms | child/excited | children, playground |
| Dokumenter | cut 0ms | narrator/neutral | ambient, nature |
| Aksi | match_cut 200ms | adult_male/excited | electronic, tense |

---

*Dokumen ini disusun berdasarkan evidence dari codebase live (RAG-CONTEXT.md) per 2026-06-22. Seluruh claim teknis memiliki sitasi ke file dan baris kode.*
