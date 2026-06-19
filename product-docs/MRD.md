# Marketing Requirement Document (MRD)
## PromptFlow — Workflow Otomasi Prompt Animasi AI

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** `product-docs/RAG-CONTEXT.md` + `product-docs/BRD.md` (bersitasi per klaim penting)
> **GitHub:** https://github.com/agrianwahab29/promptflow.git

---

## 1. Ringkasan Pasar

**PromptFlow** adalah web app otomasi penyusunan prompt animasi berbasis
AI. Input: judul animasi + (opsional) referensi gambar tokoh/background +
durasi target. Output: paket prompt terstruktur (deskripsi adegan, naskah
voiceover, image prompt per-tokoh & per-background, deskripsi karakter
konsisten, adegan berurut, gaya gambar, pesan moral). Output = teks prompt,
bukan media.
- Sitasi: `BRD.md §1` ; `RAG-CONTEXT.md §9 G10, G12`

**Proposisi pasar inti:** kreator animasi AI butuh workflow otomasi prompt
dengan konsistensi karakter lintas adegan + fleksibilitas biaya via
multi-provider LLM. Bottleneck utama bukan generate gambar, melainkan
menyusun prompt konsisten manual yang lambat & inkonsisten.
- Sitasi: `BRD.md §2.1`

**Positioning:** "Workflow otomasi prompt animasi AI dengan konsistensi
karakter & multi-provider LLM. Satu judul -> paket prompt siap pakai."

**Segmentasi awal:** kreator solo (YouTuber/content creator), indie studio
animasi kecil, edukator/tutorial maker. Dwibahasa Indonesia + EN.
- Sitasi: `BRD.md §4` (ASUMSI persona dari paket konteks orchestrator;
  RAG-CONTEXT.md hanya menyebut "user". - `RAG-CONTEXT.md §7`)

---

## 2. Peluang Pasar & Sizing

### 2.1 Pasar AI Image/Video Generation Boom

Pasar generative AI untuk konten visual tumbuh signifikan. Tool seperti
Midjourney, Kling, Sora, DALL-E, dan aggregator LLM (OpenRouter) menunjukkan
permintaan tinggi untuk workflow otomasi prompt.
- Sitasi: `BRD.md §5.1`

AI SDK v6 + `@ai-sdk/openai-compatible` matang untuk multi-provider ->
enabler teknis tersedia sekarang.
- Sitasi: `RAG-CONTEXT.md §2.1, §5.1` (mengacu
  https://ai-sdk.dev/providers/openai-compatible-providers)

Turso (libSQL) tersedia resmi di Vercel Marketplace -> DB serverless
SQLite-compatible tanpa pain filesystem tidak persisten.
- Sitasi: `RAG-CONTEXT.md §2.1, §2.2` (mengacu
  https://turso.tech/blog/serverless ;
  https://vercel.com/marketplace/tursocloud)

### 2.2 Kebutuhan Workflow Automation Prompt Meningkat

Kreator tidak hanya butuh "generate gambar", tapi butuh menyusun alur
cerita animasi lengkap: adegan berurut, karakter konsisten, naskah
voiceover, pesan moral. Tidak ada tool yang mengotomasi seluruh paket ini
dalam satu input.
- Sitasi: `BRD.md §5.2`

### 2.3 Sizing (ASUMSI — TIDAK ADA BUKTI data pasar kuantitatif)

RAG-CONTEXT.md tidak mengambil data sizing pasar publik. Sizing berikut
ASUMSI berdasarkan observasi tren (bukan data terverifikasi):

| Segmen | Estimasi (ASUMSI) | Catatan Bukti |
|---|---|---|
| Kreator animasi AI global | Tumbuh cepat, jutaan (ASUMSI) | TIDAK ADA BUKTI angka resmi di RAG |
| Komunitas AI art Indonesia | Aktif, ukuran tidak dikuantifikasi | TIDAK ADA BUKTI |
| Indie studio animasi kecil | Segmen niche | TIDAK ADA BUKTI |
| Edukator/tutorial maker | Segmen vertikal edukasi | TIDAK ADA BUKTI |

> **Catatan:** Bila butuh sizing kuantitatif, lakukan riset pasar tambahan
> (webfetch ke laporan Gartner/Statista/dll). MRD versi 1.0 memakai klaim
> kualitatif dari BRD + paket konteks. ASUMSI.

### 2.4 Mengapa Sekarang

- Enabler teknis (AI SDK v6 multi-provider + Turso serverless) matang.
  - Sitasi: `RAG-CONTEXT.md §2.1, §5.1`
- Kompetisi belum menyentuh vertical "paket prompt animasi terstruktur +
  pesan moral + konsistensi karakter + multi-provider".
  - Sitasi: `BRD.md §5.4`

---

## 3. Target Customer & Persona

Persona turun dari stakeholder BRD. **ASUMSI** (RAG-CONTEXT.md hanya
menyebut "user", tidak ada bukti persona eksplisit).
- Sitasi: `BRD.md §4` ; `RAG-CONTEXT.md §7`

### 3.1 Tabel Persona

| Atribut | Persona A: Kreator Solo | Persona B: Indie Studio Kecil | Persona C: Edukator/Tutorial Maker |
|---|---|---|---|
| **Nama persona** | "Rian si YouTuber" | "Studio Bumi Animasi" | "Bu Sinta Pengajar" |
| **Peran** | Content creator animasi AI solo | Tim kecil 2-5 orang, produksi animasi serial | Guru/pembuat konten edukasi animasi |
| **Demografis** | 20-35 thn, Indonesia+global, mobile+desktop | Studio kecil, urban Indonesia/global | 30-50 thn, institusi pendidikan/YouTube edukasi |
| **Tujuan** | Produksi animasi cepat, murah, konsisten | Standarisasi prompt tim, reproducibility, kolaborasi | Materi edukasi terstruktur, pesan moral, adegan berurut |
| **Pain point** | Susun prompt lambat, karakter inkonsisten, biaya API | Tidak ada standar format prompt, rework, mahal kalau salah prompt | Naskah voiceover & adegan terpisah, workflow terfragmentasi |
| **Trigger pakai** | Deadline konten mingguan, butuh throughput | Multiple proyek paralel, butuh konsistensi tim | Buat materi cerita berpesan moral |
| **Kebutuhan kunci** | Hemat waktu, output siap pakai, biaya rendah | Format terstandar, multi-provider, export markdown | Adegan berurut, voiceover naskah, pesan moral |
| **Barier adopsi** | Belum tahu workflow prompt automation, takut biaya API | Butuh onboarding tim, kolaborasi (fase awal: solo per project) | Butuh UI sederhana, dwibahasa |
| **Channeljangkauan** | YouTube tutorial, komunitas AI art ID, X/LinkedIn | GitHub open-source, Product Hunt, forum studio | Komunitas edukator, marketplace template (fase akhir) |

**Catatan barier:** BRD §8.2 mengecualikan kolaborasi real-time
multi-user dalam satu project (fase awal: solo per project) dan marketplace
template (fase awal). Persona B (indie studio) terkena batasan fase awal.
- Sitasi: `BRD.md §8.2`

### 3.2 Kebutuhan Pasar per Persona

| Persona | Kebutuhan pasar (harus dipenuhi produk) |
|---|---|
| Kreator Solo | Hemat waktu 80% susun prompt, konsistensi karakter, biaya rendah via provider murah (Ollama default ASUMSI) |
| Indie Studio | Standar output JSON + export markdown, reproducibility, multi-provider pilih model per proyek |
| Edukator | Adegan berurut + naskah voiceover + pesan moral built-in, UI dwibahasa ID+EN |

---

## 4. Analisis Pesaing

### 4. Lanskap Pesaing (ASUMSI — TIDAK ADA BUKTI riset pesaing formal di RAG)

RAG-CONTEXT.md tidak melakukan riset pesaing formal. Tabel berikut
ASUMSI berdasarkan paket konteks orchestrator + observasi umum pasar.
Tandai "ASUMSI" bila tidak ada bukti bersitasi.

| Kategori | Contoh (ASUMSI) | Vertical Animasi? | Multi-provider LLM? | Konsistensi Karakter? | Paket Terstruktur (adegan+voiceover+pesan moral)? | Sumber Bukti |
|---|---|---|---|---|---|---|
| Prompt gallery generic | PromptHero, FlowGPT | TIDAK (prompt umum) | TIDAK | TIDAK (manual) | TIDAK | ASUMSI — TIDAK ADA BUKTI RAG |
| Chatbot manual | ChatGPT, Claude, Gemini | TIDAK (manual, bukan workflow) | TIDAK (single vendor) | Manual via copy-paste deskripsi | TIDAK (user susun sendiri) | ASUMSI — TIDAK ADA BUKTI RAG |
| Image gen tool native | Midjourney, Kling, DALL-E | Partial (image, bukan paket alur animasi) | TIDAK | Ya via `--cref`/reference image, tapi di tool, bukan prompt teks | TIDAK (single image, bukan alur) | `RAG-CONTEXT.md §6` (Midjourney --cref) |
| Prompt builder/manager | Berbagai tool niche | TIDAK ADA bukti vertical animasi prompt automation | ASUMSI TIDAK | ASUMSI TIDAK | ASUMSI TIDAK | ASUMSI — TIDAK ADA BUKTI RAG |
| **PromptFlow** | (produk ini) | **YA (vertical animasi)** | **YA (Ollama cloud + OpenRouter + 9router + custom)** | **YA via Character master terstruktur** | **YA (paket lengkap + pesan moral)** | `BRD.md §8.1` ; `RAG-CONTEXT.md §5.1, §5.2, §6` |

### 4.1 Gap Pesaing yang PromptFlow Isi

1. **Tidak ada vertical "animasi prompt automation".** Pesaing generic
   (PromptHero/FlowGPT) = prompt umum, bukan alur animasi terstruktur.
   - ASUMSI (TIDAK ADA BUKTI RAG formal).
2. **Tidak ada multi-provider LLM.** ChatGPT/Claude = single vendor, rigid
   biaya. PromptFlow = pilih provider per proyek (Ollama murah, OpenRouter
   fleksibel, 9router custom).
   - Sitasi: `BRD.md §8.1 #3` ; `RAG-CONTEXT.md §5.1, §5.2`
3. **Tidak ada konsistensi karakter otomatis via prompt teks.** Midjourney
   `--cref` butuh image reference ID di tool, bukan output prompt teks
   siap copy. PromptFlow output prompt teks dengan Character master
   terstruktur (nama, rambut, wajah, pakaian, latar, aksi) dirujuk lintas
   adegan.
   - Sitasi: `RAG-CONTEXT.md §6` (mengacu
     https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference ;
     https://kling.ai/blog/ai-character-consistency-guide ;
     https://glibatree.com/proven-consistent-character-method/ )
4. **Tidak ada paket lengkap (adegan + voiceover + pesan moral).** Pesaing
   hanya generate gambar satu per satu. PromptFlow = satu input -> paket
   prompt lengkap alur cerita.
   - Sitasi: `BRD.md §5.2, §8.1 #4`

### 4.2 Pernyataan Posisi Pesaing

> ASUMSI: belum ada pesaing langsung vertical "animasi prompt automation +
> konsistensi karakter + multi-provider LLM". TIDAK ADA BUKTI riset formal
> di RAG-CONTEXT.md. Validasi via riset pasar tambahan disarankan.

---

## 5. Positioning & Differentiator

### 5.1 Statement Positioning

> "Workflow otomasi prompt animasi AI dengan konsistensi karakter &
> multi-provider LLM. Satu judul -> paket prompt siap pakai."

### 5.2 Nilai Jual Unik (USP)

| USP | Penjelasan | Bukti/Sitasi |
|---|---|---|
| Paket prompt terstruktur satu input | Judul + referensi + durasi -> adegan berurut + voiceover + image prompt per tokoh/background + karakter konsisten + pesan moral | `BRD.md §8.1 #4` |
| Konsistensi karakter lintas adegan | Character master terstruktur (nama, gaya rambut, wajah/asal, pakaian atas/bawah, alas kaki, latar, aksi) dirujuk lintas adegan, bukan duplikasi deskripsi per scene | `RAG-CONTEXT.md §4 (catatan), §6` ; `BRD.md §2.2 P2, §8.1 #5` |
| Multi-provider LLM (fleksibilitas biaya) | Ollama cloud (`https://ollama.com/v1`), OpenRouter (`https://openrouter.ai/api/v1`), 9router (`http://localhost:20128/v1`) + custom. User pilih model per proyek sesuai budget | `RAG-CONTEXT.md §5.1, §5.2` ; `BRD.md §8.1 #3` |
| Output teks prompt siap copy | Bukan generate media langsung -> user bebas copy ke tool image/video gen eksternal (Midjourney/Kling/DALL-E). Dikonfirmasi user | `RAG-CONTEXT.md §9 G10, G12` ; `BRD.md §7.2 B1, B2` |
| Pesan moral built-in | Diferensiasi pasar konten edukasi/anak | `BRD.md §5.3` |
| Standar output JSON + export markdown | Reproducibility & kolaborasi tim | `BRD.md §5.3` (ASUMSI A4 - `RAG-CONTEXT.md §9 G9`) |
| Dwibahasa ID + EN | Akses pasar Indonesia + global | ASUMSI - `BRD.md §7.1 A2` ; `RAG-CONTEXT.md §9 G5` |
| Open-source (GitHub) | Traction komunitas, transparansi, kontribusi | `RAG-CONTEXT.md §1` (GitHub repo) |

### 5.3 Matriks Positioning (ASUMSI)

| Sumbu | Pesaing generic | PromptFlow |
|---|---|---|
| Vertical vs Horizontal | Horizontal (prompt umum) | Vertical (animasi prompt automation) |
| Single vs Multi-provider | Single vendor | Multi-provider + BYO API key |
| Konsistensi karakter | Manual | Otomatis via Character master |
| Output | Single image prompt | Paket alur cerita lengkap |

---

## 6. Strategi Peluncuran & Go-to-Market

### 6.1 Strategi Peluncuran

| Fase | Aktivitas | Target | Bukti/Sitasi |
|---|---|---|---|
| Pre-launch | GitHub repo open-source + README demo + deploy Vercel preview | Traction bintang GitHub, demo live | `RAG-CONTEXT.md §1` (GitHub) ; `BRD.md §8.1 #10` (Vercel) |
| Launch | Product Hunt launch + komunitas AI art Indonesia + YouTube tutorial | Awareness gelombang pertama | ASUMSI paket konteks orchestrator |
| Post-launch | Konten X/LinkedIn + komunitas Discord AI art + iterasi feedback | Retention & word-of-mouth | ASUMSI paket konteks orchestrator |

### 6.2 Go-to-Market Channel

| Channel | Tujuan | Audience | Status Bukti |
|---|---|---|---|
| GitHub README + demo Vercel | Proof-of-value, open-source traction | Developer+kreator teknis | `RAG-CONTEXT.md §1` ; `BRD.md §8.1 #10` |
| Product Hunt | Launch awareness global | Early adopter tech | ASUMSI |
| Komunitas AI art Indonesia | Adopsi lokal | Kreator solo+studio ID | ASUMSI |
| YouTube tutorial | Edukasi workflow + SEO | Kreator solo+edukator | ASUMSI |
| X/LinkedIn content | Thought leadership + distribusi | Kreator+studio global | ASUMSI |
| Komunitas Discord AI art | Retention & feedback loop | Power user | ASUMSI |

### 6.3 Messaging Awal (ASUMSI)

- Headline: "Satu judul -> paket prompt animasi siap pakai."
- Sub-headline: "Karakter konsisten lintas adegan. Pilih provider LLM
  sesuai budget. Output teks prompt, copy ke tool image gen favoritmu."
- Tagline teknis: "Open-source. Multi-provider. Built on Next.js + AI SDK v6
  + Turso."

---

## 7. Pricing & Monetisasi

### 7.1 Strategi Pricing (ASUMSI — TIDAK ADA BUKTI di RAG/BRD)

BRD §8.2 mengecualikan sistem pembayaran/monetisasi fase awal. Pricing
berikut ASUMSI paket konteks orchestrator (freemium + BYO API key).

| Tier | Fitur | Harga | Catatan Bukti |
|---|---|---|---|
| Free | 1 provider free tier limit (Ollama cloud default ASUMSI), proyek terbatas | Gratis | ASUMSI - `BRD.md §7.1 A8` (default model TIDAK ADA BUKTI) |
| Pro | Unlimited proyek, semua provider, export markdown, prioritas | Berbayar (ASUMSI nominal) | ASUMSI - `BRD.md §8.2 #5` (pembayaran fase akhir) |
| BYO API key | User bawa API key sendiri (Ollama/OpenRouter/9router/custom) | Gratis atas pemakaian API provider | `BRD.md §8.1 #3, #7` ; `RAG-CONTEXT.md §5.1, §5.2` |

### 7.2 Model Monetisasi

- **Fase awal:** TIDAK ada pembayaran (BRD §8.2 #5). Fokus adoption &
  open-source traction.
- **Fase akhir (ASUMSI):** freemium SaaS + opsi BYO API key (user bawa
  kredensial sendiri, biaya API langsung ke provider).

### 7.3 Risiko Biaya User

Biaya API LLM membengkak = risiko churn. Mitigasi: estimasi token sebelum
generate, budget alert, provider murah default (Ollama ASUMSI).
- Sitasi: `BRD.md §6 R3`

---

## 8. Metrik Pemasaran

Turun dari KPI bisnis BRD §3.2. Metrik pemasaran fokus adoption &
awareness.

| Metrik | Target Awal | Cara Ukur | Sumber Bukti |
|---|---|---|---|
| Jumlah project dibuat | >= 100/bulan (3 bulan pasca-launch) | Count record Project di DB Turso | `BRD.md §3.2 K1` |
| Jumlah prompt dihasilkan | >= 1.000/bulan (3 bulan) | Count ImagePrompt + VoiceoverScript | `BRD.md §3.2 K2` |
| Weekly retention | >= 30% | Unique user active di >= 2 minggu berbeda | `BRD.md §3.2 K3` (butuh login - ASUMSI A1) |
| % user konfigurasi provider | >= 70% | Count Setting non-empty / total user | `BRD.md §3.2 K4` |
| GitHub stars (ASUMSI) | Traction awal (tidak dikuantifikasi di BRD) | GitHub repo metrics | ASUMSI - TIDAK ADA BUKTI target di BRD |
| Product Hunt upvotes (ASUMSI) | Tidak dikuantifikasi | Product Hunt | ASUMSI |
| % user puas konsistensi karakter | >= 80% | Survey pasca-generate | `BRD.md §3.2 K6` |
| % user akui hemat waktu | >= 80% | Survey pasca-generate | `BRD.md §3.2 K7` |

> **Catatan retention (K3):** butuh sistem login untuk identifikasi user.
> RAG-CONTEXT.md TIDAK ADA BUKTI sistem multi-user/auth -> ASUMSI NextAuth
> dasar. PRD konfirmasi.
> - Sitasi: `BRD.md §3.2 catatan, §7.1 A1` ; `RAG-CONTEXT.md §7, §9 G2`

---

## 9. Risiko Pasar

Turun dari risiko bisnis BRD §6 + risiko pasar spesifik MRD.

| ID | Risiko Pasar | Dampak | Probabilitas | Mitigasi Pemasaran | Bukti/Sitasi |
|---|---|---|---|---|---|
| MR1 | Pesaing cepat masuk vertical animasi prompt automation | Pangsa pasar tergerus | Sedang | Ship cepat, bangun moat via open-source community + konsistensi karakter + pesan moral diferensiasi | `BRD.md §6 R4` |
| MR2 | Adopsi lambat: kreator belum tahu workflow prompt automation | Awareness rendah | Sedang | YouTube tutorial + demo Vercel + komunitas AI art ID + Product Hunt | ASUMSI (paket konteks) |
| MR3 | Biaya API LLM membuat user churn | Churn | Sedang | Estimasi token, budget alert, provider murah default (Ollama), BYO API key | `BRD.md §6 R3` |
| MR4 | Kualitas output bervariasi per model -> reputasi jelek | Trust hilang | Tinggi | Rekomendasi model per provider, preview output, rating kualitas | `BRD.md §6 R2` |
| MR5 | Persona indie studio butuh kolaborasi (fase awal solo per project) | Segmen B tidak terlayani penuh | Sedang | Komunikasi batasan fase awal jelas, roadmap kolaborasi fase akhir | `BRD.md §8.2 #6` |
| MR6 | Persona edukator butuh marketplace template (fase awal out of scope) | Segmen C tidak terlayani penuh | Rendah | Roadmap marketplace fase akhir, komunitas share manual | `BRD.md §8.2 #7` |
| MR7 | Sizing pasar tidak dikuantifikasi (ASUMSI) | Strategi berbasis asumsi | Tinggi | Riset pasar tambahan (webfetch laporan industri) sebelum scale | `RAG-CONTEXT.md §9` (TIDAK ADA BUKTI sizing) |
| MR8 | Riset pesaing tidak formal (ASUMSI) | Blind spot kompetisi | Sedang | Riset pesaing formal pre-launch | `RAG-CONTEXT.md §9` (TIDAK ADA BUKTI riset pesaing) |
| MR9 | 9router proxy custom user tidak stabil/dokumentasi minim | Segmen 9router gagal adopsi | Sedang | Validasi langsung ke user, fallback Ollama/OpenRouter | `BRD.md §6 R7` ; `RAG-CONTEXT.md §5.2, §9 G4` |

---

## 10. Asumsi MRD (Ringkasan)

| ID | Asumsi | Status Bukti | Sitasi |
|---|---|---|---|
| M1 | Persona kreator solo/studio/edukator | TIDAK ADA BUKTI eksplisit di RAG | `BRD.md §4` ; `RAG-CONTEXT.md §7` |
| M2 | Dwibahasa UI ID+EN | TIDAK ADA BUKTI | `BRD.md §7.1 A2` ; `RAG-CONTEXT.md §9 G5` |
| M3 | Sizing pasar kuantitatif | TIDAK ADA BUKTI di RAG | ASUMSI MRD §2.3 |
| M4 | Riset pesaing formal | TIDAK ADA BUKTI di RAG | ASUMSI MRD §4 |
| M5 | Pricing freemium + BYO API key | TIDAK ADA BUKTI (BRD fase awal no payment) | ASUMSI MRD §7 ; `BRD.md §8.2 #5` |
| M6 | Strategi peluncuran Product Hunt + komunitas + YouTube | TIDAK ADA BUKTI | ASUMSI paket konteks orchestrator |
| M7 | Default provider murah = Ollama cloud | TIDAK ADA BUKTI model default | `BRD.md §7.1 A8` ; `RAG-CONTEXT.md §9 G8` |
| M8 | Login dasar NextAuth untuk retention metrik | TIDAK ADA BUKTI auth | `BRD.md §7.1 A1` ; `RAG-CONTEXT.md §7, §9 G2` |

---

## 11. Referensi

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### Sitasi eksternal kunci (dari RAG-CONTEXT.md §10)

| Sitasi | Klaim didukung |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider LLM via `@ai-sdk/openai-compatible` |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat endpoint |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js setup |
| https://turso.tech/blog/serverless | Vercel filesystem tidak persisten -> Turso |
| https://vercel.com/marketplace/tursocloud | Turso resmi di Vercel Marketplace |
| https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference | Midjourney `--cref` butuh image reference |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter via deskripsi terstruktur |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter terstruktur |

---

**Dokumen ini fokus pada PASAR. Tujuan bisnis ada di BRD, spesifikasi
produk di PRD, spesifikasi teknis di SRS, arsitektur di
PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA, aturan kode di
CODING_RULES. MRD tidak membangun deliverable akhir.**
