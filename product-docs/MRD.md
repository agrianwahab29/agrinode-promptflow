# Marketing Requirement Document (MRD)
## PromptFlow V3 — Animation Brief Engine

**Versi:** 3.0
**Tanggal:** 2026-06-22
**Status:** Draft
**Penanggung Jawab:** PromptFlow Product Team

---

## 1. Ringkasan

PromptFlow V3 mengisi celah pasar yang belum tersentuh: **tool terintegrasi untuk menghasilkan animation brief terstruktur** — paket lengkap scene, transisi, voice, audio, dan image prompt berlapis — yang siap dikonsumsi oleh AI video generator (Runway, Pika, Kling, Sora).

Saat ini, kreator konten dan animator harus menggabungkan 3-4 tool terpisah (ChatGPT untuk naskah, spreadsheet untuk scene plan, manual untuk voice/audio) untuk mencapai hasil yang setara. PromptFlow V3 memampatkan workflow tersebut menjadi satu platform.

V3 memperkenalkan 5 kapabilitas baru: Light Theme, Scene Transition Engine (6 jenis), Complex Image Prompts (8-layer), Voice Type Mapping (7 tipe), dan Audio Specification (5 jenis per scene). Seluruh fitur sudah diimplementasi; target pasar utama adalah kreator konten dan studio animasi kecil di Asia Tenggara dan global.

---

## 2. Analisis Pasar

### 2.1 Ukuran Pasar

| Segmen | Estimasi Ukuran | Sumber |
|--------|----------------|--------|
| Global AI video generation market | USD 0.5B (2025) → USD 2.1B (2028) | [ASUMSI] Grand View Research, CAGR ~45% |
| AI content creators (global, active) | 15-20 juta pengguna tool AI generatif | [ASUMSI] Statista, Adobe surveys |
| Animator & studio kecil (SEA) | 500K-1M profesional | [ASUMSI] LinkedIn, Upwork data |
| Indonesia content creator ecosystem | 3-5 juta kreator aktif | [ASUMSI] Kemenkominfo, platform data |

### 2.2 Segmen Pasar

| Segmen | Karakteristik | Urgency |
|--------|--------------|---------|
| **Solo Content Creator** | Individu, budget terbatas, output cepat untuk YouTube/TikTok/Instagram | Tinggi — butuh speed |
| **Freelance Animator** | Menerima brief dari klien, perlu spesifikasi terstruktur | Tinggi — butuh professional output |
| **Studio Kecil (2-10 orang)** | Tim kecil, workflow repetitif, perlu standardisasi brief | Sedang — punya proses internal |
| **Content Agency** | Volume tinggi, multiple client, perlu template & konsistensi | Sedang — evaluasi tool baru hati-hati |
| **Edukator / Trainer** | Membuat konten edukasi animasi, tutorial, kursus | Rendah — niche, tapi loyal |

### 2.3 Trend Pasar

1. **AI video generator meningkat pesat** — Runway Gen-3, Kling 1.6, Pika 2.0, Sora memperkenalkan kontrol granular (camera, lighting, style). PromptFlow V3 selaras dengan trend ini.
2. **"Prompt engineering" menjadi skill wajib** — kreator butuh prompt terstruktur, bukan satu baris teks.
3. **Workflow automation** — kreator mencari cara mengotomasi planning → production pipeline.
4. **Indonesia-first market underserved** — sebagian besar tool serupa berbahasa Inggris; PromptFlow mendukung id/en.

---

## 3. Target Pelanggan / Persona

| Persona | Profil | Pain Point | Goal | Trigger Beli |
|---------|--------|-----------|------|-------------|
| **Andi — Solo YouTuber** | 25 tahun, konten edukasi, 10K subs, budget Rp 0-100rb/bulan | Menghabiskan 2-3 jam per video untuk menulis prompt satu per satu ke Runway | Generate full animation brief dalam <5 menit | Video pertama yang sukses dengan PromptFlow |
| **Sari — Freelance Animator** | 30 tahun, menerima brief dari klien di Upwork/Fiverr, portfolio 50+ proyek | Klien memberi brief tidak lengkap, harus bolak-balik revisi | Brief terstruktur yang bisa langsung jadi production spec | Klien meminta "animation brief" dan Sari menghasilkan dari PromptFlow |
| **Budi — Studio Owner** | 35 tahun, studio 5 orang, klien UMKM & startup | Standarisasi output antar animator, konsistensi kualitas | Template preset yang bisa dipakai tim | Tim mulai pakai PromptFlow, hasil konsisten |
| **Dewi — Content Agency PM** | 28 tahun, mengelola 10+ klien, volume 50+ brief/bulan | Brief manual memakan waktu, error-prone, tidak scalable | Batch generation, API access, export structured | Agency mengevaluasi tool untuk efisiensi |
| **Riko — Edukator Animasi** | 40 tahun, dosen/materi kursus, buat tutorial animasi AI | Mahasiswa peserta kursus butuh contoh brief terstruktur | Template yang bisa didemokan dan dibagikan | Kurikulum baru memasukkan AI animation workflow |

---

## 4. Analisis Pesaing / Alternatif

| Pesaing / Alternatif | Kategori | Strength | Weakness | PromptFlow V3 Advantage |
|----------------------|----------|----------|----------|--------------------------|
| **ChatGPT / Claude** | General LLM | Fleksibel, semua bahasa | Tidak terstruktur, tidak tersimpan, tidak ada scene/transition/audio mapping | Structured output + persistence + multi-provider |
| **Runway** | AI Video Generator | Video generation langsung, high quality | Tidak generate brief, hanya generate video. Tidak ada planning layer | PromptFlow = planning layer sebelum Runway |
| **Pika** | AI Video Generator | Simple interface, fast generation | Tidak ada structured prompt builder | PromptFlow output → Pika input |
| **Kling** | AI Video Generator | Long video support, good motion | Tidak ada brief/scene management | PromptFlow scene management → Kling generation |
| **Notion AI** | Productivity + AI | Bisa dipakai untuk planning | Bukan spesialis animation, tidak ada transition/voice/audio spec | Domain-specific vs generic |
| **Suno / ElevenLabs** | AI Audio | Audio generation langsung | Tidak terintegrasi dengan video planning | PromptFlow audio spec → audio tool input |
| **Miro / FigJam** | Whiteboard | Visual planning | Manual, tidak ada AI generation | Automated AI generation vs manual |

**Pesaing langsung (AI animation brief generator):** Saat Juni 2026, **tidak ada** tool yang mengintegrasikan scene planning + transition + voice mapping + audio spec + 8-layer image prompt dalam satu platform. Ini adalah celah pasar PromptFlow V3.

---

## 5. Positioning & Nilai Jual Unik

### 5.1 Pernyataan Posisi

> **PromptFlow V3** adalah satu-satunya AI animation brief generator yang menghasilkan paket produksi lengkap — scene, transisi, voice, audio, dan image prompt 8-lapis — dalam satu workflow, mendukung multi-LLM provider, dan siap diekspor ke Runway, Pika, Kling, dan Sora.

### 5.2 Unique Value Proposition (UVP)

| # | UVP | Bukti |
|---|-----|-------|
| 1 | **All-in-one animation brief** — satu tool untuk scene + transition + voice + audio + image layers | 5 fitur V3 terintegrasi, bukan 5 tool terpisah |
| 2 | **Multi-LLM provider** — tidak terkunci ke satu AI provider | Ollama, OpenRouter, 9router, custom provider |
| 3 | **Structured output** — bukan teks bebas, tapi JSON terstruktur dengan validasi Zod | 272 baris Zod schema, 10 DB tables |
| 4 | **Template presets** — 5 preset siap pakai (Tutorial, Sinematik, Anak-anak, Dokumenter, Aksi) | presets.ts, satu klik → full brief |
| 5 | **Indonesia-first** — UI dan konten default Bahasa Indonesia, English tersedia | i18n id/en, 291 keys per locale |
| 6 | **Free tier** — self-hostable (Ollama) atau berbayar (OpenRouter) sesuai budget | Vercel Hobby plan + Turso free tier |

### 5.3 Messaging Framework

| Audience | Headline | Key Message |
|----------|----------|-------------|
| Solo Creator | "Dari Ide ke Animation Brief dalam 5 Menit" | Stop tulis prompt satu per satu. Generate full brief: scene, suara, audio, visual — sekali klik. |
| Freelancer | "Brief Animasi Profesional, Tanpa Bolak-balik" | Hasilkan brief terstruktur yang klien langsung approve. 8-layer image prompt + voice + audio spec. |
| Studio | "Standarisasi Kualitas Brief di Seluruh Tim" | Template preset konsisten. Setiap animator menghasilkan brief dengan standar yang sama. |
| Agency | "Scale Production Brief Tanpa Tambah Headcount" | API-first architecture. Generate 50+ brief/bulan dengan konsistensi terjamin. |

---

## 6. Strategi Peluncuran & Distribusi

### 6.1 Fase Peluncuran

| Fase | Timeline | Aktivitas | Target |
|------|----------|-----------|--------|
| **Pre-launch** | Minggu 1-2 | Fix data gaps (audio_specs, color_palette, technical → DB). Update landing page V3 sections. Tambah 10+ E2E tests. | Product ready, zero data loss |
| **Soft Launch** | Minggu 3-4 | Share di komunitas Indonesia (Twitter/X, Discord, Reddit r/indonesia). Demo video 2-3 menit. | 50-100 registered users |
| **Public Launch** | Minggu 5-6 | Product Hunt launch. Blog post (EN + ID). Social media campaign. | 500+ registered users |
| **Growth** | Minggu 7-12 | SEO content (tutorial posts). Partnership dengan kreator animasi. Community feedback loop. | 2000+ registered users, 40% returning |

### 6.2 Channel Distribusi

| Channel | Strategi | Prioritas |
|---------|----------|-----------|
| **X/Twitter** | Demo video pendek, before/after PromptFlow workflow. Thread "how I make animation brief" | Tinggi |
| **YouTube** | Tutorial 5 menit: "Generate Animation Brief untuk Runway dalam 5 Menit" | Tinggi |
| **Product Hunt** | Launch day dengan hunter, maker comment, demo GIF | Tinggi |
| **Reddit** | r/aivideo, r/ChatGPT, r/indonesia — educational post, bukan hard sell | Sedang |
| **Discord/Telegram** | Komunitas AI creator Indonesia — feedback, support, feature request | Sedang |
| **SEO/Blog** | "Cara Membuat Animation Brief dengan AI" (ID), "AI Animation Planning Guide" (EN) | Sedang (long-term) |
| **GitHub** | Open-source repo, README menarik, contribution guide | Rendah (sudah ada) |

### 6.3 KPI Peluncuran

| KPI | Target 30 Hari | Target 90 Hari |
|-----|----------------|----------------|
| Registered users | 500 | 2000 |
| Monthly active users (MAU) | 200 | 800 |
| Returning users (30-day) | 20% | 40% |
| Generate → Save completion rate | 60% | 80% |
| Average scenes per project | 5 | 8 |
| Template preset usage | 40% | 50% |
| Landing page → Signup conversion | 3% | 5% |

---

## 7. Kebutuhan Pasar yang Harus Dipenuhi Produk

### 7.1 Kebutuhan Wajib (Must-Have)

| # | Kebutuhan | Status V3 | Gap |
|---|-----------|-----------|-----|
| K1 | **Animation brief terstruktur** — scene, karakter, visual, suara dalam satu output | ✅ Terpenuhi | — |
| K2 | **Scene transition terdefinisi** — bukan "cut" default, tapi spesifikasi jenis, durasi, easing | ✅ Terpenuhi | — |
| K3 | **Image prompt berlapis** — minimal 6 dari 8 layer terisi per scene | ⚠️ Partial | color_palette & technical tidak tersimpan ke DB |
| K4 | **Voice type mapping** — karakter → tipe suara → emosi → speed | ✅ Terpenuhi | voiceover_speaker tidak tersimpan ke DB |
| K5 | **Audio spec per scene** — BGM, SFX, ambient, music cue, transition audio | ⚠️ Partial | audio_specs dari LLM tidak auto-save ke DB |
| K6 | **Data persistence** — semua output LLM tersimpan untuk revisi & export | ⚠️ Partial | 3 gap items (color_palette, technical, audio_specs) |
| K7 | **Export capability** — download brief sebagai JSON atau Markdown | ✅ Terpenuhi | — |

### 7.2 Kebutuhan Penting (Should-Have)

| # | Kebutuhan | Status V3 |
|---|-----------|-----------|
| K8 | **Template presets** — one-click untuk common workflow | ✅ 5 presets aktif |
| K9 | **Multi-LLM support** — tidak terkunci satu provider | ✅ 4 provider |
| K10 | **Bahasa Indonesia** — UI dan konten default ID | ✅ i18n id/en |
| K11 | **Dark/Light theme** — sesuai lingkungan kerja pengguna | ✅ 3 mode |
| K12 | **Landing page informatif** — showcase fitur V3 | ❌ belum update |
| K13 | **E2E test coverage** — confidence untuk deploy | ❌ hanya 1 test |

### 7.3 Kebutuhan Nice-to-Have (Could-Have)

| # | Kebutuhan | Status | Catatan |
|---|-----------|--------|---------|
| K14 | **API access** untuk agency/bulk generation | Planned | 20+ endpoints sudah ada, perlu auth rate limit tier |
| K15 | **Collaboration** — share project ke tim | Planned | Fitur masa depan |
| K16 | **Custom template** — user buat preset sendiri | Planned | Fitur masa depan |
| K17 | **Direct integration** — kirim brief langsung ke Runway/Pika API | Planned | Partnership dependent |

---

## Lampiran

### L1. Referensi ke BRD

MRD ini selaras dengan BRD.md (PromptFlow V3). Mapping:
- Tujuan bisnis G1-G7 → Kebutuhan pasar K1-K13
- Risiko R1-R8 → Gap yang harus diselesaikan sebelum launch
- Stakeholder S2-S3 → Persona di Section 3
- Peluang pasar (BRD §3.1) → Analisis pasar (MRD §2)

### L2. Asumsi

| # | Asumsi | Basis | Dampak Jika Salah |
|---|--------|-------|-------------------|
| 1 | Pasar AI video generation tumbuh >40% CAGR hingga 2028 | Trend industri, funding data | TAM lebih kecil, growth lambat |
| 2 | Pengguna bersedia self-host (Ollama) untuk free tier | Developer community behavior | Barrier to entry lebih tinggi |
| 3 | PromptFlow output kompatibel dengan Runway/Pika/Kling/Sora | Prompt builder target tools di kode | Perlu adaptasi per platform |
| 4 | Indonesia-first strategy viable untuk bootstrap | Komunitas AI creator Indonesia aktif | Perlu pivot ke global lebih cepat |
| 5 | Tidak ada pesaing langsung dalam 6 bulan ke depan | Scan kompetitor Juni 2026 | Perlu accelerate fitur differentiation |

---

*Dokumen ini disusun berdasarkan evidence dari BRD.md dan RAG-CONTEXT.md (codebase scan) per 2026-06-22. Asumsi ditandai [ASUMSI]. Klaim teknis memiliki sitasi ke file dan baris kode.*
