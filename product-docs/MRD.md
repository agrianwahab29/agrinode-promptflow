# MRD.md — PromptFlow Marketing Requirement Document

> Disusun oleh docgen-mrd. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `product-docs/BRD.md`.
> Klaim faktual bertumpu pada RAG/BRD. Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis apa adanya.

---

## 1. Ringkasan

PromptFlow adalah web app Next.js 15 App Router (TypeScript strict) yang menggenerate **paket prompt animasi AI terstruktur** untuk short-form video / shorts / vertical storytelling (`RAG-CONTEXT.md §1`). Output tunggal: JSON object `PromptPackage` tervalidasi Zod, di-persist DB Turso/libSQL, lalu di-export Markdown (`RAG §4 F1, F16`).

**Peluang pasar**: Konten short-form vertical (TikTok/Shorts/Reels) membutuhkan *storyboard + prompt paket* siap pakai untuk pipeline AI image/video generation. Tool generik (ChatGPT, Claude, Gemini) menghasilkan prompt bebas tanpa struktur 8-layer image prompt, audio spec, transisi scene, dan voiceover script yang konsisten. PromptFlow mengisi celah ini dengan pipeline terstruktur + validasi schema + multi-provider LLM (`RAG §4 F2`: ollama/openrouter/9router/custom).

**Wedge pasar**: **Reliability**. BRD (`§1, §2`) mendokumentasikan kegagalan generasi deterministik (Bug A: `sfx_list` mismatch; Bug B: JSON parse fail output panjang). Pasar telah dimakan klaim "AI generate konten" yang gagal. PromptFlow memposisikan diri sebagai **pipeline reliable & tervalidasi** — bukan tool "coba sampai jalan".

**Kondisi**: Produk v0.1.0 private (`package.json:3-4`). Tidak ada bukti basis pengguna, monetisasi, atau NPS di repo (`RAG §12 G8/G10`, `BRD §9 A8-A9`). Seluruh angka pasar di dokumen ini = `ASUMSI` bila tak ada sitasi RAG.

---

## 2. Analisis Pasar & Peluang

### 2.1 Pasar target: AI-assisted short-form video / vertical storytelling content generation

- **Tren makro (ASUMSI — tak ada data pasar di RAG)**: Konsumsi short-form video dominan di TikTok, YouTube Shorts, Instagram Reels. Creator indie + agency butuh produksi cepat dengan kualitas sinematik. AI image/video generation (Midjourney, Runway, Pika, Kling, Veo) menurunkan biaya produksi TAPI membutuhkan prompt terstruktur per scene + konsistensi karakter antar scene.
- **Gap pasar**: Tool AI generik menghasilkan prompt satu-shot. Creator butuh **paket prompt terstruktur per scene** (karakter konsisten, 8-layer image prompt, audio spec, transisi, voiceover script, moral message) yang dapat di-orchestrate lintas model. PromptFlow menyediakan ini via `PromptPackageSchema` (`RAG §6`, `schemas.ts:106-124`) + template presets tutorial/cinematic/kids/documentary/action (`RAG §4 F15`, `presets.ts:53-224`).
- **Celah PromptFlow**: Tidak ada bukti di repo tentang kompetitor dengan schema-validated multi-scene pipeline. `ASUMSI` pasar: creator yang frustrasi dengan output inkonsisten AI generik adalah segmen primer.

### 2.2 Ukuran & segmen pasar

| Segmen | Deskripsi | Bukti di repo |
|---|---|---|
| Indie content creator | Solo creator short-form video, butuh storyboard cepat | Template presets tutorial/cinematic/kids (`RAG §4 F15`) |
| Agency / studio kecil | Tim butuh paket prompt reusable + export Markdown handoff | `RAG §4 F16` Markdown export |
| Storyteller / edutainer | Vertical storytelling (cerita pendek, tutorial) | `prompt-builder.ts:180-182` shorts vs tutorial durasi |
| Educator / course maker | Tutorial 7-15 menit, 8-15 scene | `RAG §7.4` numScenes tutorial |

> **ASUMSI pasar total**: Tidak ada data TAM/SAM/SOM di RAG/BRD. Angka ukuran pasar TIDAK dapat diturunkan dari repo. Dokumen ini menolak memalsukan angka. Riset eksternal wajib bila Bos Agrian butuh proyeksi.

---

## 3. Target Pelanggan / Persona

> Pain point utama lintas persona: **AI generation tidak reliable** (`BRD §2`). Kegagalan deterministik pada output panjang + audio sfx = creator kehilangan jam kerja + biaya token (`BRD §2`, `RAG §11`).

| Persona | Demografi (ASUMSI) | Goal | Pain point (grounded) | Bukti fitur relevan |
|---|---|---|---|---|
| **Rina — Indie Shorts Creator** | 22-32 thn, solo, TikTok/Shorts 3-5 scene/30-60s | Generate paket prompt siap pakai <90s | Generate gagal di scene sfx; retry sia-sia; token terbuang | `BRD §4` time-to-first-success <=90s shorts; `RAG §11 Bug A` |
| **Bayu — Tutorial Educator** | 28-45 thn, course maker, tutorial 7-15 menit | Output 8-15 scene terstruktur + export Markdown | Output panjang >14KB → JSON parse fail; `repairTruncatedJson` tak handle newline (`RAG §8.2.2`) | `BRD §4`; `RAG §4 F16` export |
| **Studio Kecil — Agency Producer** | Tim 3-10, butuh konsistensi karakter antar scene | Handoff prompt paket ke artist/video editor | Inkonsistensi karakter antar scene (RAG `consistency-checker.ts:19-38`); partial persist bug (`RAG §11 Bug D`) | `RAG §4 F19`; `BRD §7 R7` |
| **Dev/Tinkerer — Local LLM User** | Pengguna Ollama lokal, eksperimen pipeline | Provider-agnostic, BYO API key aman | API key kebocoran; provider lock-in | `RAG §4 F2, F3` AES-256-GCM; `schemas.ts:159` 4 provider enum |
| **Dina — Vertical Storyteller** | Cerita pendek moral-driven (kids/fable) | Karakter konsisten + moral message otomatis | Output bebas tanpa struktur moral; hallucination field | `RAG §6` PromptPackage root `moral_message`; `RAG §4 F15` kids preset |

---

## 4. Analisis Pesaing / Alternatif

> **Catatan**: RAG/BRD TIDAK menyebut kompetitor spesifik. Tabel di bawah = `ASUMSI` berdasarkan lanskap tool AI content umum. Spesifikasi kompetitor TIDAK diverifikasi dari sumber eksternal — Bos Agrian wajib validasi via riset pasar.

| Pesaing (ASUMSI) | Pendekatan | Kelemahan vs PromptFlow | Bukti PromptFlow unggul |
|---|---|---|---|
| ChatGPT / Claude / Gemini (prompt satu-shot) | Chatbot generik, output prompt bebas | Tidak schema-validated; tidak 8-layer image prompt; tidak multi-scene terstruktur; tidak audio spec; tidak export Markdown terstruktur | `RAG §4 F1, F12, F16`; `RAG §6` Zod schema |
| Tool "AI video generator" (Runway/Pika/Kling — ASUMSI) | Generate video langsung dari prompt teks | Tidak output *paket prompt storyboard* reusable; tidak voiceover script + transition spec; lock-in model | `RAG §6` PromptPackage multi-field; `RAG §4 F13` scene transition; `RAG §4 F14` voice assignment |
| Template Notion/Sheets manual | Creator susun storyboard manual | Tidak generate via LLM; tidak konsistensi checker; tidak multi-provider | `RAG §4 F19` consistency-checker; `RAG §4 F2` multi-provider |
| Scriptwriter AI (Jasper/Copy.ai — ASUMSI) | Copywriting + script | Tidak image prompt 8-layer; tidak audio spec; tidak vertical video focused | `RAG §6.2` image_prompts 8-layer; `RAG §6.1` audio_specs |

**Diferensiasi inti (grounded)**:
1. **Schema-validated output** (`RAG §6`, `schemas.ts:106-124`) — pesaing generik tidak menjamin struktur.
2. **Multi-provider LLM** ollama/openrouter/9router/custom (`RAG §4 F2`, `schemas.ts:159`) — pesaing umumnya lock-in.
3. **8-layer image prompt structure** (`RAG §6.2`, `prompt-builder.ts:150`) — pesaing tidak.
4. **Retry/repair + categorize error** (`RAG §8.2.2`, `llm-client.ts:50-100,18-44`) — pesaing chatbot tidak punya repair JSON.
5. **Consistency checker** karakter antar scene (`RAG §4 F19`, `consistency-checker.ts:19-38`).

---

## 5. Positioning & Nilai Jual Unik (USP)

### 5.1 Positioning statement

**Untuk** content creator short-form vertical video yang frustrasi dengan AI generation tidak reliable dan output tidak terstruktur, **PromptFlow** adalah pipeline generasi prompt animasi AI terstruktur yang **menjamin output tervalidasi schema, multi-provider, dan dapat di-export siap pakai**, **tidak seperti** tool AI generik yang menghasilkan prompt bebas tanpa konsistensi.

### 5.2 USP (grounded in RAG)

| USP | Bukti | Catatan |
|---|---|---|
| Reliable: schema-validated + retry/repair | `RAG §6`, `RAG §8.2.2`, `schemas.ts:106-124`, `llm-client.ts:50-100` | Wedge pasar utama (BRD §2) |
| Terstruktur: PromptPackage 8-layer image + audio + transition + voiceover + moral | `RAG §6.1-6.2`, `prompt-builder.ts:137-168` | Diferensiasi vs chatbot generik |
| Provider-agnostic: BYO key, 4 provider enum | `RAG §4 F2`, `schemas.ts:159`, `provider-registry.ts:12-16` | Hindari lock-in |
| Aman: AES-256-GCM API key encryption | `RAG §4 F3`, `aes.ts:4-43` | Trust enterprise/agency |
| Dapat di-export: Markdown handoff | `RAG §4 F16`, `markdown.template.ts:4-173` | Workflow agency |
| i18n: id/en | `RAG §4 F22`, `middleware.ts:38-54` | Pasar Indonesia + global |

### 5.3 Wedge messaging

- **Pre-fix**: "PromptFlow — storyboard AI terstruktur untuk vertical video." (konsep, belum ship reliable)
- **Post-fix** (pasca Bug A/B fix): **"PromptFlow — satu-satunya pipeline AI yang menjamin paket prompt tervalidasi. Generate sampai jadi, atau kami tunjukkan kenapa."**

> **PENTING (BRD §2)**: Produk v0.1.0 belum bisa menyandang klaim reliability sebelum Bug A & B diperbaiki. Pemasaran reliability sebelum fix = klaim palsu = risiko reputasi (`BRD §6.2`).

---

## 6. Strategi Peluncuran / Distribusi

### 6.1 Urutan wajib (BRD-grounded)

1. **Fix Bug A & B DULU** (`BRD §8.1` in-scope). Produk TIDAK boleh diluncurkan dengan pipeline generasi gagal deterministik (`BRD §1, §2`). Launch dengan core rusak = churn langsung + review buruk (`BRD §6.2`).
2. **Beta terbatas**: Undang 20-50 creator indie (ASUMSI — tak ada daftar di repo). Track generation success rate via `generation_logs` (`schema.ts:147-160`). Target: >=95% (`BRD §4`).
3. **Public preview**: Buka registrasi (`RAG §4` register route ada). Instrumentasi Vercel Analytics (`RAG §4 F21`, `events.ts:1-22`) untuk activation funnel.
4. **GA (General Availability)**: Setelah KPI `BRD §4` terpenuhi (validation pass >=98%, repair success >=90%, time-to-first-success shorts <=90s).

### 6.2 Kanal distribusi (ASUMSI — tak ada channel plan di repo)

| Kanal | Hipotesis | Bukti fitur pendukung |
|---|---|---|
| Web app langsung (Vercel deploy) | Utama | `next.config.ts`, `@vercel/analytics` (`RAG §2`) |
| Komunitas creator (Reddit, Discord, TikTok creator) | Akuisisi organik | `ASUMSI` |
| Showcase template presets | Demo template tutorial/cinematic/kids | `RAG §4 F15`, `presets.ts` |
| Open-source sebagian (opsional) | Trust + kontribusi | `ASUMSI` — produk saat ini private (`package.json:4`) |

---

## 7. Kebutuhan Pasar yang Harus Dipenuhi Produk

> Diterjemahkan dari pain persona (§3) + BRD business pain. Ini = kontrak pasar, bukan feature wishlist.

| # | Kebutuhan pasar | Bukti BRD/RAG | Persona terdampak |
|---|---|---|---|
| M1 | Generate gagal = produk batal. Pasar butuh **reliability** sebagai default, bukan bonus. | `BRD §2`, `RAG §11 Bug A/B` | Semua |
| M2 | Output terstruktur & konsisten lintas scene (karakter, audio, transisi). | `RAG §6`, `RAG §4 F19` | Rina, Bayu, Studio |
| M3 | Provider choice — tak terkunci satu LLM. | `RAG §4 F2`, `schemas.ts:159` | Dev/Tinkerer |
| M4 | API key aman (agency/enterprise trust). | `RAG §4 F3`, `aes.ts` | Studio, Dev |
| M5 | Handoff export Markdown untuk kolaborasi. | `RAG §4 F16` | Studio |
| M6 | Pesan error yang dapat ditindaklanjuti (bukan generic "PROVIDER_ERROR"). | `BRD §6.2`, `llm-client.ts:18-44` | Semua |
| M7 | Bahasa Indonesia + English. | `RAG §4 F22` | Pasar ID |
| M8 | Cost-aware generate (token tak terbuang retry sia-sia). | `BRD §6.1`, `RAG §8.2.3` retry identik | Semua |

---

## 8. Pricing / Go-to-Market

> **ASUMSI TOTAL**: RAG/BRD TIDAK punya bukti model pricing, billing, atau monetisasi. Produk private (`package.json:4`), tak ada payment gateway di repo. Seluruh model di bawah = proposal logis, bukan keputusan terverifikasi.

### 8.1 Model pricing proposal (ASUMSI)

| Tier | Hipotesis | Rasional (ASUMSI) |
|---|---|---|
| Free | BYO API key, limit generate/hari, 1 project aktif | Akuisisi + showcase reliability |
| Pro | Generous quota, multi-project, priority retry, export | Power user + agency |
| Agency | Seat-based, workspace, handoff Markdown, audit log | Studio multi-user |

> Implementasi billing TIDAK ada di repo (no Stripe/billing dependency, `RAG §2`). Go-to-market monetisasi = keputusan Bos Agrian di luar scope MRD ini.

### 8.2 Launch wedge

- **Jual reliability, bukan fitur**. Kompetitor chatbot jual "AI bisa apa". PromptFlow jual "AI yang sampai jadi". Metric pemasaran utama: **Generation Success Rate** (`BRD §4`, `generation_logs.status`) sebagai angka yang dapat dipublikasikan sebagai proof.
- Pre-fix: JANGAN pemasarkan dulu. Post-fix: beta laporan sukses → testimonial → GA.

---

## 9. Risiko Pasar

| # | Risiko pasar | Bukti/kaitan | Mitigasi pasar |
|---|---|---|---|
| RM1 | Persepsi "AI generation unreliable" = bias anti-AI tool. Pasar skeptis klaim reliability. | `BRD §2` pain inti | Proof: publikasi generation success rate real-time dari `generation_logs`. Beta testimonial. |
| RM2 | Dependency provider LLM (MiniMax-M3 via tokenrouter ASUMSI, `RAG §12 G8`). Provider down/ubah = produk gagal. | `BRD §7 R2`, `schemas.ts:159` 4 provider enum | Multi-provider BYO key (`RAG §4 F2`); dokumen cara switch provider; rekomendasi provider stabil (ASUMSI). |
| RM3 | Kompetitor parity — chatbot generik tambah schema/structure. | `ASUMSI` | Moat: schema + 8-layer + consistency checker + multi-provider (`RAG §6, §4 F19, F2`). Kecepatan iterasi. |
| RM4 | Klaim reliability sebelum fix = review buruk tak reversibel. | `BRD §6.2` | WAJIB fix Bug A/B sebelum pemasaran (`BRD §8.1`). Launch gate. |
| RM5 | Pasar Indonesia price-sensitive (ASUMSI). | Tak ada bukti | Tier free + BYO key biaya 0 untuk akuisisi. |
| RM6 | Output panjang masih bisa fail bila provider lain kurang stabil (Bug B latent). | `RAG §11 Bug B`, `BRD §7 R4` | Hardening `repairTruncatedJson` (`BRD §8.1`); provider recommendation. |
| RM7 | Reputasi churn awal (produk v0.1.0 private, tak ada basis loyal). | `BRD §6.2`, `package.json:4` | Beta terbatas dulu; instrumentasi retensi (`BRD §4` D7/D30 ASUMSI). |

---

## 10. KPI Pasar

| KPI pasar | Definisi | Target (ASUMSI bila tak ada baseline) | Sumber data |
|---|---|---|---|
| Activation | Pengguna generate sukses pertama dalam sesi pertama | >= 70% signup → first-success | `generation_logs` + Vercel Analytics (`RAG §4 F21`) |
| Retention D7 / D30 | Pengguna generate ulang 7/30 hari | D7 >= 40%, D30 >= 25% (`BRD §4`) | `generation_logs` + ASUMSI tracking |
| Generation Success Rate (marketable) | `(success+partial)/total` dipublikasikan sebagai proof | >= 95% (`BRD §4`) | `generation_logs.status` (`schema.ts:147-160`) |
| Referral / NPS | Pengguna merekomendasi | NPS >= 40 (`BRD §4`, ASUMSI) | ASUMSI survei (tak ada di repo) |
| Time-to-first-success | Median detik generate sukses pertama | Shorts <=90s, tutorial <=180s (`BRD §4`) | `generation_logs.durationMs` |
| Cost per successful generate | Token cost / generate sukses | Turun vs baseline (`BRD §4`, ASUMSI) | ASUMSI tracking cost (tak ada di repo) |
| Provider distribution | Pengguna pakai provider mana | Diversifikasi >=3 provider aktif | `provider_configs` (`schema.ts:17-30`) |

> **Catatan**: Baseline KPI pasar TIDAK ada di repo (`BRD §9 A8`). Instrumentasi tambahan wajib sebelum launch GA (`BRD §8.1` observability).

---

## 11. Sitasi

| Klaim MRD | Sitasi | Bukti |
|---|---|---|
| Identitas & stack produk | `RAG §1`, `RAG §2` | `package.json`, `README.md` |
| Fitur inti generasi, export, multi-provider, consistency | `RAG §4 F1, F2, F3, F16, F19, F21, F22` | `route.ts`, `schemas.ts`, `aes.ts`, `markdown.template.ts`, `consistency-checker.ts`, `events.ts`, `middleware.ts` |
| Schema PromptPackage + 8-layer + audio spec | `RAG §6.1-6.4` | `schemas.ts:39-124`, `prompt-builder.ts:137-168` |
| Bug A sfx_list + Bug B JSON parse | `RAG §11`, `BRD §2` | `schemas.ts:52`, `prompt-builder.ts:75-97,152`, `llm-client.ts:50-100,284-289` |
| Retry tak ubah request (bug deterministik) | `RAG §8.2.3` | `llm-client.ts:274,287` |
| Business pain "failed generation" + KPI + scope | `BRD §1, §2, §4, §6.2, §8.1` | — |
| Template presets + numScenes | `RAG §4 F15`, `RAG §7.4` | `presets.ts:53-224`, `prompt-builder.ts:180-182` |
| DB generation_logs status | `RAG §9.8`, `RAG §4 F18` | `schema.ts:147-160` |
| Provider enum 4 + AES-256-GCM | `RAG §4 F2, F3`, `RAG §10.3` | `schemas.ts:159`, `aes.ts:4-43`, `provider-registry.ts:12-16` |
| i18n id/en | `RAG §4 F22` | `middleware.ts:38-54` |
| Gaps/ASUMSI (no baseline, no monetisasi, no NPS) | `RAG §12 G8/G10`, `BRD §9 A8-A9` | — |
| Kompetitor spesifik | ASUMSI | TIDAK diverifikasi — riset eksternal wajib |
| Ukuran pasar (TAM/SAM/SOM) | ASUMSI | TIDAK ada bukti di repo |

---

## 12. Asumsi & Batasan Pasar

### Asumsi pasar (diturunkan dari RAG §12 + BRD §9)
- **AM1**: Persona demografi (usia, kanal) = ASUMSI. RAG tak ada data user.
- **AM2**: Kompetitor spesifik (ChatGPT, Runway, Jasper, dll) = ASUMSI lanskap umum. Tak diverifikasi dari sumber eksternal.
- **AM3**: Ukuran pasar total (TAM/SAM/SOM) = TIDAK ada bukti. MRD ini menolak memalsukan angka.
- **AM4**: Model pricing (Free/Pro/Agency) = proposal logis. Tak ada billing di repo.
- **AM5**: NPS baseline, retention D7/D30 baseline, cost baseline = TIDAK ada. Target = aspirasi (`BRD §9 A8`).
- **AM6**: Provider "tokenrouter" + model "MiniMax-M3" = ASUMSI dari log user (`RAG §12 G8`). Kemungkinan disimpan sebagai `custom`.

### Batasan pasar
- **BM1**: Produk v0.1.0 private (`package.json:4`) → tak ada pengguna publik terverifikasi.
- **BM2**: Launch WAJIB pasca-fix Bug A/B (`BRD §8.1`). Pemasaran pre-fix = risiko reputasi fatal.
- **BM3**: Pasar Indonesia = i18n id didukung (`RAG §4 F22`) tapi bukti adopsi ID = ASUMSI.
- **BM4**: Tak ada data bisnis (billing, NPS, retention) → KPI pasar sulit baseline tanpa instrumentasi baru.

---

> Dokumen ini fokus pada PASAR: peluang, target, pesaing, positioning, launch, pricing. Spesifikasi teknis & fix Bug A/B dijabarkan di PRD, SRS, PROJECT_ARCHITECTURE, TEST_PLAN. Selaras dengan BRD: tujuan bisnis (reliability) → kebutuhan pasar (reliable structured pipeline).
