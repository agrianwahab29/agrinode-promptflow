# Business Requirement Document (BRD)
## PromptFlow — Sistem Automation Alur Animasi Berbasis AI

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** `product-docs/RAG-CONTEXT.md` (bersitasi per klaim penting)
> **GitHub:** https://github.com/agrianwahab29/promptflow.git

---

## 1. Ringkasan Eksekutif

**PromptFlow** adalah aplikasi web fullstack yang mengotomasi penyusunan prompt
animasi berbasis AI. Pengguna input judul animasi, (opsional) gambar referensi
tokoh/background, dan durasi target. Sistem memanggil LLM multi-provider untuk
menghasilkan satu paket prompt terstruktur: deskripsi adegan, naskah voiceover,
image prompt per-tokoh & per-background, deskripsi karakter konsisten, adegan
berurut, gaya gambar (3D/2D + rasio), dan ditutup pesan moral.

Output aplikasi adalah **prompt teks** (bukan file media) yang siap user copy ke
tool image/video generation eksternal.

**Proyek greenfield** — tidak ada kode, schema, atau aset existing. Semua dibangun
dari nol.

Konteks teknis (dari RAG-CONTEXT.md):
- Stack final: Next.js App Router + Vercel AI SDK v6 + `@ai-sdk/openai-compatible`
  + Turso/libSQL + Tailwind v4 + shadcn/ui. Deploy Vercel.
  - Sitasi: `RAG-CONTEXT.md §2.1`
- Multi-provider LLM: Ollama cloud (`https://ollama.com/v1`), OpenRouter
  (`https://openrouter.ai/api/v1`), 9router (`http://localhost:20128/v1`, proxy
  custom user). User pilih/input model, base URL, API key di pengaturan.
  - Sitasi: `RAG-CONTEXT.md §5.1, §5.2`
- Output = prompt-prompt teks. Dikonfirmasi user.
  - Sitasi: `RAG-CONTEXT.md §9 G10, G12`

**Nilai bisnis inti:** hemat waktu 80% penyusunan prompt animasi manual,
hasilkan karakter konsisten lintas adegan, dan beri fleksibilitas biaya via
dukungan multi-provider LLM.

---

## 2. Latar Belakang Bisnis & Problem Statement

### 2.1 Konteks Pasar

Pasar AI image/video generation berkembang pesat. Kreator animasi AI,
YouTuber, edukator, dan indie studio animasi mengandalkan tool seperti
Midjourney, Kling, DALL-E, dan lainnya untuk produksi konten.

Namun, **bottleneck utama bukan generate gambar, melainkan menyusun prompt yang
konsisten.** Saat menyusun alur animasi multi-adegan manual:

1. **Lambat.** Setiap adegan butuh deskripsi tokoh, background, voiceover, dan
   image prompt terpisah. Tokoh utama muncul di banyak adegan -> deskripsi harus
   diulang konsisten.
2. **Inkonsistensi karakter.** Tanpa struktur deskripsi yang stabil, tokoh
   utama berubah wajah/pakaian antar adegan. Literatur prompt engineering
   mengkonfirmasi: konsistensi karakter dicapai via deskripsi terstruktur
   (nama, rambut, wajah, pakaian, latar, aksi) yang diulang lintas prompt +
   reference image.
   - Sitasi: `RAG-CONTEXT.md §6` (mengacu https://kling.ai/blog/ai-character-consistency-guide ; https://glibatree.com/proven-consistent-character-method/)
3. **Tidak terstandar.** Setiap kreator punya format sendiri -> sulit
   reproducibility, sulit kolaborasi tim.
4. **Mahal kalau salah prompt.** Generate ulang gambar = buang kredit API.
   Prompt buruk = output jelek = biaya terbuang.

### 2.2 Problem yang PromptFlow Selesaikan

| # | Problem | Dampak Bisnis |
|---|---|---|
| P1 | Susun prompt konsisten manual lambat | Waktu produksi tinggi, throughput kreator rendah |
| P2 | Inkonsistensi karakter lintas adegan | Output jelek, rework, biaya API terbuang |
| P3 | Tidak ada standar format prompt | Sulit reproducibility & kolaborasi tim |
| P4 | Tergantung satu provider LLM = rigid biaya | Tidak bisa optimasi biaya/kualitas per proyek |
| P5 | Naskah voiceover & adegan susun terpisah | Workflow terfragmentasi, kesalahan kontekstual |

**PromptFlow menjawab** dengan: satu input (judul + referensi + durasi) ->
LLM generate seluruh paket prompt terstruktur (karakter master konsisten +
adegan berurut + voiceover + image prompt per tokoh/background) -> output
siap pakai.

Konsistensi karakter dijamin via struktur Character master (nama, gaya rambut,
wajah/asal, pakaian atas, pakaian bawah, alas kaki, latar belakang, aksi) yang
dirujuk lintas adegan, bukan duplikasi deskripsi per scene.
- Sitasi: `RAG-CONTEXT.md §4 (Catatan konsistensi karakter), §6`

---

## 3. Tujuan Bisnis & KPI

### 3.1 Tujuan Bisnis

| ID | Tujuan | Deskripsi |
|---|---|---|
| BO1 | Hemat waktu penyusunan prompt animasi | Turunkan waktu susun prompt konsisten manual >= 80% vs. cara manual |
| BO2 | Konsistensi karakter lintas adegan | Karakter utama stabil (wajah, pakaian, atribut) di seluruh adegan output |
| BO3 | Fleksibilitas biaya via multi-provider | Dukung >= 3 provider LLM (Ollama cloud, OpenRouter, 9router + custom) agar user pilih model per proyek sesuai budget |
| BO4 | Output prompt siap pakai & terstandar | Output JSON structured + opsi export markdown, siap copy ke tool image/video gen |
| BO5 | Adopsi kreator solo & indie studio | Onboarding cepat, UI dwibahasa (ID + EN) |

### 3.2 KPI Bisnis Terukur

| KPI ID | Metrik | Target Awal | Cara Ukur | Sumber Data |
|---|---|---|---|---|
| K1 | Jumlah project dibuat | >= 100 project/bulan (3 bulan pasca-launch) | Count record Project | DB Turso |
| K2 | Jumlah prompt dihasilkan | >= 1.000 prompt/bulan (3 bulan) | Count ImagePrompt + VoiceoverScript | DB Turso |
| K3 | % user kembali (retention) | >= 30% weekly retention | Unique user active di >= 2 minggu berbeda | Session DB |
| K4 | % user pakai >= 1 provider | >= 70% user konfigurasi Setting provider | Count Setting non-empty / total user | DB Turso |
| K5 | Latency rata-rata generasi | <= 30 detik per project (streaming) | Avg waktu dari submit ke selesai generate | Telemetri Vercel |
| K6 | Konsistensi karakter (survey) | >= 80% user puas konsistensi karakter | Survey NPS/kuesioner pasca-generate | Form feedback |
| K7 | Hemat waktu (survey) | >= 80% user akui hemat waktu vs manual | Survey pasca-generate | Form feedback |

> **Catatan K3/K6/K7:** Memerlukan sistem login untuk identifikasi user.
> RAG-CONTEXT.md menyatakan **TIDAK ADA BUKTI** sistem multi-user/auth existing
> -> **ASUMSI** app multi-user dengan login dasar (NextAuth) per paket konteks
> orchestrator. PRD harus konfirmasi.
> - Sitasi: `RAG-CONTEXT.md §7, §9 G2`

---

## 4. Stakeholder & Kepentingan

| Stakeholder | Peran | Kepentingan | Harapan dari PromptFlow |
|---|---|---|---|
| Kreator solo (YouTuber / content creator) | Pengguna utama | Produksi animasi AI cepat, murah, konsisten | Hemat waktu, output siap pakai, biaya rendah |
| Indie studio animasi | Pengguna tim | Standarisasi prompt, kolaborasi, reproducibility | Format terstandar, multi-provider, export markdown |
| Tim edukasi / edukator | Pengguna akademik | Materi edukasi animasi terstruktur, pesan moral | Adegan berurut + pesan moral, naskah voiceover |
| Bos Agrian | Pemilik & sponsor | ROI, adopsi, validasi pasar | KPI terpenuhi, adoption growth, biaya terkendali |
| Provider LLM (Ollama, OpenRouter, 9router) | Pihak ketiga infrastruktur | API usage, uptime | Integrasi stabil via `@ai-sdk/openai-compatible` |
| Vercel & Turso | Platform & DB hosting | Komputasi serverless, penyimpanan | Deploy stabil, function tidak timeout |

> **Catatan:** RAG-CONTEXT.md menyatakan hanya menyebut "user" sebagai aktor.
> Detail peran kreator/studio/edukator adalah **ASUMSI** dari paket konteks
> orchestrator, bukan bukti eksplisit RAG.
> - Sitasi: `RAG-CONTEXT.md §7`

---

## 5. Peluang / Justifikasi Nilai (Mengapa Layak Dikerjakan)

### 5.1 Pasar AI Image/Video Boom

Pasar generative AI untuk konten visual tumbuh signifikan. Tool seperti
Midjourney, Kling, Sora, DALL-E, dan OpenRouter (aggregator LLM) menunjukkan
permintaan tinggi untuk workflow otomasi prompt.

### 5.2 Kebutuhan Workflow Automation Prompt Meningkat

Kreator tidak hanya butuh "generate gambar", tapi butuh **menyusun alur cerita
animasi lengkap**: adegan berurut, karakter konsisten, naskah voiceover, dan
pesan moral. Tidak ada tool yang mengotomasi seluruh paket ini dalam satu kali
input.

### 5.3 Justifikasi Nilai

| Justifikasi | Penjelasan |
|---|---|
| Hemat waktu 80% | Satu input -> paket prompt lengkap vs. susun manual tiap adegan |
| Konsistensi terjamin | Struktur Character master + referensi lintas adegan, bukan duplikasi deskripsi |
| Fleksibilitas biaya | Multi-provider -> user pilih model murah/cepat/berkualitas per proyek |
| Standar output | JSON structured + export markdown -> reproducibility & kolaborasi tim |
| Pesan moral built-in | Cocok konten edukasi/anak -> diferensiasi pasar |

### 5.4 Mengapa Sekarang

- AI SDK v6 + `@ai-sdk/openai-compatible` matang untuk multi-provider.
  - Sitasi: `RAG-CONTEXT.md §2.1, §5.1`
- Turso (libSQL) tersedia di Vercel Marketplace -> DB serverless SQLite-compatible
  tanpa pain filesystem tidak persisten.
  - Sitasi: `RAG-CONTEXT.md §2.1, §2.2` (mengacu https://turso.tech/blog/serverless)
- Kompetisi belum menyentuh "paket prompt animasi terstruktur + pesan moral"
  sebagai vertical spesifik.

---

## 6. Risiko Bisnis & Mitigasi

| ID | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R1 | Dependensi provider LLM (down/rate-limit) | Generasi gagal | Tinggi | Multi-provider fallback (user pilih provider lain), error handling jelas, retry policy |
| R2 | Kualitas output bervariasi per model | Output inkonsisten/jelek | Tinggi | Rekomendasi model per provider, preview output, rating kualitas |
| R3 | Biaya API LLM membengkak | User churn karena mahal | Sedang | Estimasi token sebelum generate, budget alert, provider murah default (Ollama) |
| R4 | Kompetisi cepat | Pangsa pasar tergerus | Sedang | Diferensiasi: paket prompt terstruktur + pesan moral + multi-provider; ship cepat |
| R5 | Vercel function timeout (generasi panjang) | Output terpotong | Sedang | Streaming SSE (ASUMSI), pecah generate jadi per-adegan, background job. - Sitasi: `RAG-CONTEXT.md §5.4, §9 G6` |
| R6 | API key user bocor (storage tidak aman) | Kebocoran kredensial, trust hilang | Rendah | Enkripsi API key di Setting. TIDAK ADA BUKTI mekanisme enkripsi -> SRS/CODING_RULES tentukan. - Sitasi: `RAG-CONTEXT.md §9 (rekomendasi #4)` |
| R7 | 9router proxy custom user tidak stabil/dokumentasi minim | Integrasi 9router gagal | Sedang | 9router = proxy lokal user, TIDAK ADA BUKTI dokumentasi publik. Validasi langsung ke user. - Sitasi: `RAG-CONTEXT.md §5.2, §9 G4` |
| R8 | Storage gambar referensi di Vercel (filesystem tidak persisten) | Upload hilang saat instance recycle | Tinggi | Pakai Vercel Blob / storage eksternal (ASUMSI rekomendasi). SRS/ARCHITECTURE putuskan. - Sitasi: `RAG-CONTEXT.md §5.4, §6, §9 G3` |

---

## 7. Asumsi & Batasan Bisnis

### 7.1 Asumsi

| ID | Asumsi | Status Bukti RAG | Catatan |
|---|---|---|---|
| A1 | App multi-user dengan login dasar (NextAuth) | TIDAK ADA BUKTI eksplisit | Dari paket konteks orchestrator. RAG menyatakan hanya menyebut "user". - Sitasi: `RAG-CONTEXT.md §7, §9 G2` |
| A2 | Bahasa UI dwibahasa: Indonesia + EN | TIDAK ADA BUKTI | Dari paket konteks orchestrator. RAG menyatakan TIDAK ADA BUKTI preferensi bahasa. - Sitasi: `RAG-CONTEXT.md §9 G5` |
| A3 | Batas tokoh default 10 per project | TIDAK ADA BUKTI | Dari paket konteks orchestrator. RAG menyatakan TIDAK ADA BUKTI batas tokoh. - Sitasi: `RAG-CONTEXT.md §9 G11` |
| A4 | Output JSON structured + opsi export markdown | TIDAK ADA BUKTI format spesifik | Dari paket konteks orchestrator. RAG merekomendasikan JSON structured. - Sitasi: `RAG-CONTEXT.md §9 G9, §11 #1` |
| A5 | Upload gambar referensi via Vercel Blob | ASUMSI rekomendasi | RAG: TIDAK ADA BUKTI preferensi storage. - Sitasi: `RAG-CONTEXT.md §6, §9 G3` |
| A6 | Streaming SSE untuk generasi panjang | ASUMSI | RAG: ASUMSI streaming SSE, TIDAK ADA BUKTI preferensi user. - Sitasi: `RAG-CONTEXT.md §5.4, §9 G6` |
| A7 | 9router proxy custom user valid lokal | TIDAK ADA BUKTI eksternal | RAG: base URL `http://localhost:20128/v1` dari paket user, proxy lokal. - Sitasi: `RAG-CONTEXT.md §5.2, §9 G4` |
| A8 | Default model LLM per provider | TIDAK ADA BUKTI | RAG: TIDAK ADA BUKTI model default. SRS list rekomendasi. - Sitasi: `RAG-CONTEXT.md §9 G8` |
| A9 | Target pengguna = kreator animasi AI, YouTuber, edukator, indie studio | TIDAK ADA BUKTI eksplisit | Dari paket konteks orchestrator. RAG hanya menyebut "user". - Sitasi: `RAG-CONTEXT.md §7` |
| A10 | Enkripsi API key user saat disimpan | TIDAK ADA BUKTI mekanisme | RAG: rekomendasi SRS/CODING_RULES tentukan (mis. AES via env key). - Sitasi: `RAG-CONTEXT.md §11 #4` |

### 7.2 Batasan Bisnis

| ID | Batasan | Dampak |
|---|---|---|
| B1 | Output aplikasi = prompt teks, BUKAN file media (gambar/video/audio) | User copy prompt ke tool eksternal. Dikonfirmasi user. - Sitasi: `RAG-CONTEXT.md §9 G10, G12` |
| B2 | Voiceover = naskah teks, BUKAN TTS audio | Dikonfirmasi user. - Sitasi: `RAG-CONTEXT.md §9 G12` |
| B3 | Deploy di Vercel (serverless) | Filesystem tidak persisten -> SQLite file lokal tidak boleh di prod. - Sitasi: `RAG-CONTEXT.md §2.2, §5.4` |
| B4 | DB = Turso/libSQL (SQLite-compatible via HTTP) | Bukan SQLite file murni. Dikonfirmasi resmi. - Sitasi: `RAG-CONTEXT.md §2.1, §2.2` |
| B5 | Multi-provider via `@ai-sdk/openai-compatible` | Semua provider harus OpenAI-compatible. Ollama cloud pakai `https://ollama.com/v1`. - Sitasi: `RAG-CONTEXT.md §5.1, §5.2` |
| B6 | Greenfield, mulai dari nol | Tidak ada kode/schema/aset existing. - Sitasi: `RAG-CONTEXT.md §1, §3, §8` |

---

## 8. Ruang Lingkup Bisnis

### 8.1 In Scope (Dikerjakan)

1. Aplikasi web fullstack PromptFlow (frontend + backend satu repo Next.js).
2. Input user: judul animasi, (opsional) gambar referensi tokoh/background,
   durasi target, gaya gambar (3D/2D + rasio).
3. Multi-provider LLM integration: Ollama cloud, OpenRouter, 9router + custom
   (user input base URL + API key + model).
   - Sitasi: `RAG-CONTEXT.md §5.1, §5.2`
4. Generate paket prompt terstruktur:
   - Deskripsi adegan berurut
   - Naskah voiceover per adegan
   - Image prompt per-tokoh & per-background (list)
   - Deskripsi karakter konsisten (nama, gaya rambut, wajah/asal, pakaian
     atas, pakaian bawah, alas kaki, latar belakang, aksi)
   - Karakter pendukung / hewan
   - Gaya gambar (3D/2D + rasio)
   - Pesan moral penutup
5. Konsistensi karakter lintas adegan via Character master + referensi.
   - Sitasi: `RAG-CONTEXT.md §4, §6`
6. Output JSON structured + opsi export markdown.
7. Pengaturan user: pilih/input provider, model, base URL, API key (terenkripsi).
8. Login dasar multi-user (NextAuth) — **ASUMSI**, PRD konfirmasi.
   - Sitasi: `RAG-CONTEXT.md §7, §9 G2`
9. UI dwibahasa Indonesia + EN — **ASUMSI**, UIUX_SPEC konfirmasi.
   - Sitasi: `RAG-CONTEXT.md §9 G5`
10. Deploy Vercel + Turso DB.
    - Sitasi: `RAG-CONTEXT.md §2.1`

### 8.2 Out of Scope (Tidak Dikerjakan)

1. Generate file media (gambar/video/audio) langsung di aplikasi.
   - Sitasi: `RAG-CONTEXT.md §9 G10`
2. TTS (text-to-speech) voiceover audio. Output = naskah teks.
   - Sitasi: `RAG-CONTEXT.md §9 G12`
3. API image generation bawaan (Midjourney/Kling/DALL-E). User copy prompt ke
   tool eksternal.
4. Mobile native app (iOS/Android). Web app responsif dulu.
5. Sistem pembayaran/monetisasi (fase awal).
6. Kolaborasi real-time multi-user dalam satu project (fase awal: solo per
   project).
7. Marketplace template prompt (fase awal).

### 8.3 Ketergantungan Bisnis

| ID | Ketergantungan | Pemilik | Status |
|---|---|---|---|
| D1 | Akun & API key Ollama cloud | User | User sediakan sendiri |
| D2 | Akun & API key OpenRouter | User | User sediakan sendiri |
| D3 | Proxy 9router jalan lokal (`http://localhost:20128/v1`) | User | ASUMSI valid lokal. - Sitasi: `RAG-CONTEXT.md §5.2, §9 G4` |
| D4 | Akun Vercel + Turso | Bos Agrian / tim | Sedikan untuk deploy |
| D5 | Storage gambar referensi (Vercel Blob / eksternal) | Bos Agrian / tim | ASUMSI rekomendasi. - Sitasi: `RAG-CONTEXT.md §6, §9 G3` |

---

## 9. Referensi

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### Sitasi eksternal kunci (dari RAG-CONTEXT.md §10)

| Sitasi | Klaim didukung |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider via `@ai-sdk/openai-compatible` |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat endpoint |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js setup |
| https://turso.tech/blog/serverless | Vercel filesystem tidak persisten -> Turso solusi |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter via deskripsi terstruktur |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter terstruktur |

---

**Dokumen ini fokus pada NILAI BISNIS. Spesifikasi teknis detail ada di SRS,
arsitektur di PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA, aturan kode di
CODING_RULES. BRD tidak membangun deliverable akhir.**
