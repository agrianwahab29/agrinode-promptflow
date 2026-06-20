# MRD — Marketing Requirement Document
## PromptFlow Landing Page Redesign

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Status:** Draft
> **Deliverable:** Landing page konversi tinggi untuk PromptFlow
> **Rujukan:** BRD.md, RAG-CONTEXT.md, PRD.md, UIUX_SPEC.md

---

## 1. Market Opportunity

### 1.1 Ukuran Pasar & Segmen

| Segmen | Deskripsi | Estimasi Potensi | Sumber |
|---|---|---|---|
| Kreator konten video pendek AI | Solo creator produksi konten TikTok/Reels/Shorts pakai AI image/video gen | Besar & tumbuh cepat — ledakan konten pendek AI 2024-2026 | `BRD.md S2.1`, `RAG-CONTEXT.md S5.1` |
| Indie animation studio | Studio kecil 2-10 orang, multi-proyek, butuh workflow terstruktur | Niche tapi high-value — pricing power lebih tinggi | `RAG-CONTEXT.md S2.4` (Bumi Animasi persona) |
| Edukator/tutorial maker | Buat konten edukasi pakai animasi AI | Niche — butuh kemudahan + dwibahasa | `RAG-CONTEXT.md S2.4` (Bu Sinta persona) |

### 1.2 Tren Pasar yang Relevan

| Tren | Dampak ke PromptFlow | Timing |
|---|---|---|
| Ledakan konten video pendek AI (TikTok, Reels, Shorts) | Permintaan prompt animasi terstruktur melonjak | 2024-2026, berkelanjutan |
| Multi-provider LLM jadi standar | Fleksibilitas biaya/kualitas = fitur utama | 2025+ |
| AI-first workflow tools naik daun | User expect otomasi, bukan manual | 2024-2026 |
| Creator economy makin besar | Semakin banyak solo creator butuh tool produktif | Berkelanjutan |

> **ASUMSI:** Estimasi pasar bersifat kualitatif — belum ada data kuantitatif TAM/SAM/SOM untuk niche "AI animation prompt automation". Perlu validasi via market research lebih lanjut.

---

## 2. Target Audience / Customer Segments

### 2.1 Persona Primer

| Persona | Segmen | Kebutuhan Utama | Pain Point | Solusi PromptFlow |
|---|---|---|---|---|
| **Rian** (Solo Creator) | Kreator konten pendek AI | Workflow cepat, friction rendah | Manual susun prompt per adegan = lambat, inkonsisten | Input judul + durasi + gaya → paket prompt instan |
| **Bumi Animasi** (Indie Studio) | Studio animasi kecil | Dashboard monitoring, multi-proyek | Sulit track konsistensi karakter lintas adegan | Character master terstruktur, monitoring produktivitas |
| **Bu Sinta** (Edukator) | Tutorial maker | Loading jelas, error recover, dwibahasa | Tool AI terlalu teknis, tidak ramah non-teknis | UI intuitif, error human-readable, ID+EN |

### 2.2 Karakteristik Target

| Aspek | Detail | Sitasi |
|---|---|---|
| Usia | 18-40 tahun (digital native) | ASUMSI |
| Lokasi | Indonesia (default) + global (EN toggle) | `RAG-CONTEXT.md S4.5` |
| Tech level | Mid — pakai AI tools tapi bukan developer | ASUMSI |
| Device | 50%+ mobile | `RAG-CONTEXT.md S5.3` |
| Motivasi | Hemat waktu, konsistensi kualitas, produktivitas | `PRD.md S1.3` |

---

## 3. Competitor Analysis

### 3.1 Peta Kompetitor

| Kompetitor | Tipe | Kelebihan | Kelemahan | Diferensiasi PromptFlow |
|---|---|---|---|---|
| **ChatGPT / Claude (manual prompting)** | LLM general-purpose | Universal, powerful, besar komunitas | Tidak ada workflow terstruktur, output tidak konsisten, harus manual susun per adegan | PromptFlow = workflow engine terstruktur, bukan chat biasa |
| **Midjourney / DALL-E prompt tools** | Image generation prompt | Hasil visual langsung | Tidak ada character consistency, tidak ada multi-scene workflow, tidak ada export terstruktur | PromptFlow = character master + multi-scene + export JSON/MD |
| **Runway / Pika / Kling** | Video generation AI | Generate video langsung | Prompt-nya sendiri masih manual, tidak ada otomasi susun paket | PromptFlow = otomasi SUSUN PROMPT, bukan generate media |
| **NovelAI / Sudowrite** | AI writing tools | Story generation terstruktur | Fokus teks/novel, bukan animasi visual | PromptFlow = khusus animasi visual prompt |
| **Custom GPTs / Prompt templates** | Template-based | Simple, no-code | Rigid, tidak adaptif, tidak ada konsistensi karakter lintas adegan | PromptFlow = dinamis + character master + multi-provider |

> **ASUMSI:** Peta kompetitor ini bersifat kualitatif berdasarkan observasi pasar. Belum ada analisis kompetitor mendalam (pricing, market share, feature comparison lengkap). Perlu riset lebih lanjut.

### 3.2 Competitive Landscape Summary

```
Spesialisasi Prompt Automation
^
|  NovelAI/Sudowrite     PromptFlow ★
|  (text/novel)          (animasi visual)
|
|  Custom GPTs
|  (template rigid)
|
|  ChatGPT/Claude        Midjourney/DALL-E
|  (general)             (image gen)
|
+-----------------------------------------> Kemudahan Use
   Kompleks                              Simpel
```

---

## 4. Positioning / Value Proposition

### 4.1 Posisi di Pasar

**PromptFlow = Workflow engine pertama yang mengotomasi susun paket prompt animasi AI terstruktur dari input minimal.**

| Dimensi | PromptFlow | Kompetitor |
|---|---|---|
| Scope | Multi-scene + character master + export | Per-prompt, tanpa workflow |
| Input | Minimal (judul + durasi + gaya) | Manual typing panjang |
| Output | JSON + Markdown terstruktur | Teks bebas |
| Konsistensi | Character master lintas adegan | Tiap prompt sendiri-sendiri |
| Provider | Multi-provider (fleksibel biaya) | Terikat 1 provider |

### 4.2 Value Proposition Statement

> **"Satu judul → paket prompt animasi siap pakai. Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown."**

### 4.3 Key Value Metrics

| Value | Angka | Sitasi |
|---|---|---|
| Hemat waktu susun prompt | 80% vs manual | `PRD.md S1.3` |
| Friction reduction V2 | 50% (upload + generate 1 halaman) | `PRD.md S1.3` |
| Prompt lebih akurat | +30% via deskripsi cerita | `BRD.md S1` |

### 4.4 Unique Selling Proposition (USP)

1. **Character Consistency Engine** — Karakter tetap identik lintas adegan, bukan prompt-to-prompt
2. **Multi-Provider Flexibility** — Pilih LLM sesuai budget/kualitas (Ollama, OpenRouter, 9router, custom)
3. **Structured Export** — JSON + Markdown siap copy ke tool image/video gen favorit
4. **Minimal Input, Maximum Output** — Judul + durasi + gaya = paket lengkap

---

## 5. Go-to-Market Strategy

### 5.1 Channel Akuisisi

| Channel | Strategi | Prioritas | Sitasi |
|---|---|---|---|
| **Organic Search (SEO)** | Landing page optimized + blog content tentang AI animation prompts | Tinggi | `BRD.md S4 OBJ-05` |
| **Social Media Share** | OG image + shareable content, target komunitas kreator AI | Tinggi | `BRD.md S4 OBJ-05` |
| **Community** | Share di komunitas AI creator (Discord, Reddit, Twitter/X) | Sedang | ASUMSI |
| **Direct Traffic** | Word-of-mouth dari early users | Sedang | ASUMSI |
| **Paid Ads** | Google Ads / Meta Ads targeting AI creator keywords | Rendah (post-validation) | ASUMSI |

### 5.2 Strategi Konversi

| Funnel Stage | Action | Metric |
|---|---|---|
| **Awareness** | Hero section + social proof bar → visitor tahu apa PromptFlow | Unique visitors |
| **Interest** | Problem/Solution + How It Works → visitor paham value | Scroll depth >= 35% |
| **Consideration** | Features + Product Demo + Testimonials → visitor yakin | Time on page >= 90s |
| **Action** | CTA "Mulai Gratis" → sign-up | Sign-up rate >= 6% |
| **Retention** | Product experience → user kembali | (post-launch metric) |

### 5.3 Launch Phases

| Phase | Timeline | Focus | Goal |
|---|---|---|---|
| **Soft Launch** | Minggu 1-2 | Deploy landing page + Vercel Analytics | Baseline metrics terukur |
| **Community Launch** | Minggu 3-4 | Share ke komunitas AI creator | 100+ unique visitors/minggu |
| **Growth** | Bulan 2-3 | SEO + content + social proof real | 500+ unique visitors/minggu, 30+ sign-ups |

### 5.4 Pricing Strategy

> **ASUMSI:** Produk saat ini **gratis** (tidak ada model pricing). Landing page tidak perlu pricing section. Bila model pricing muncul nanti (freemium, tier-based), tambahkan sebagai section terpisah.

---

## 6. Marketing KPIs

### 6.1 KPI Utama

| KPI | Definisi | Target | Baseline | Cara Ukur |
|---|---|---|---|---|
| **Hero CTA CTR** | Klik "Mulai Gratis" / unique visitor | >= 4% | ~1-2% (ASUMSI) | Vercel Analytics event |
| **Sign-up Rate** | Pendaftaran baru / unique visitor | >= 6% | ~2-3% (ASUMSI) | NextAuth sign-up event |
| **Bounce Rate** | Single-page session / total session | <= 45% | ~60% (ASUMSI) | Vercel Analytics |
| **Avg Time on Page** | Total time / sessions | >= 90 detik | ~30s (ASUMSI) | Vercel Analytics |
| **Scroll Depth** | % visitor scroll >= 75% halaman | >= 35% | N/A | Scroll tracking |

### 6.2 KPI Teknis (Landing Page Performance)

| KPI | Target | Cara Ukur |
|---|---|---|
| Lighthouse Performance (mobile) | >= 85 | Lighthouse CI |
| LCP (Largest Contentful Paint) | <= 2.5s | Web Vitals |
| CLS (Cumulative Layout Shift) | <= 0.1 | Web Vitals |
| Mobile Conversion | >= 4% sign-up dari mobile | Segment by device |

### 6.3 KPI Engagement

| KPI | Target | Cara Ukur |
|---|---|---|
| FAQ Engagement | >= 15% visitor klik/expand FAQ | Event tracking |
| Social Share Rate | >= 2% visitor share landing page | UTM tracking |
| Return Visitor Rate | >= 20% within 30 days | Vercel Analytics |

> **Catatan:** Baseline V1 tidak terukur karena belum ada analytics (`BRD.md S3.2`). Target = ASUMSI berdasarkan benchmark SaaS AI tools. Akan dipasang Vercel Analytics bersamaan launch untuk validasi.

---

## 7. Kebutuhan Pasar yang Harus Dipenuhi Produk

### 7.1 Fitur Wajib (Must-Have dari Perspektif Pasar)

| # | Kebutuhan Pasar | Fitur PromptFlow | Status |
|---|---|---|---|
| 1 | Workflow cepat untuk konten pendek | Input minimal → paket prompt instan | V1 LIVE |
| 2 | Konsistensi karakter lintas adegan | Character master terstruktur | V1 LIVE |
| 3 | Fleksibilitas biaya LLM | Multi-provider (Ollama, OpenRouter, 9router, custom) | V1 LIVE |
| 4 | Export ke tool lain | JSON + Markdown export | V1 LIVE |
| 5 | Kemudahan upload referensi | Upload gambar + AI classification | V2 |
| 6 | Konteks cerita | Deskripsi cerita kontekstual | V2 |
| 7 | Monitoring produktivitas | Dashboard enrichment (charts, metrics) | V2 |
| 8 | Transparansi proses | Real-time processing logs | V2 |

### 7.2 Fitur yang Di-Ekspektasi Pasar (Nice-to-Have)

| # | Ekspektasi | Implementasi | Prioritas |
|---|---|---|---|
| 1 | Mobile-friendly | Mobile-first responsive design | Wajib |
| 2 | Bahasa Indonesia + English | Dwibahasa via next-intl | Wajib |
| 3 | Error yang jelas | Human-readable error + recovery | Wajib |
| 4 | Loading states | Skeleton + progress indicators | Wajib |
| 5 | Dark mode | Default dark, light mode toggle | Sedang |
| 6 | Aksesibilitas | WCAG 2.1 AA | Sedang |

### 7.3 Gap ke Pasar (Perlu Dikomunikasikan)

| Gap | Dampak ke Marketing | Mitigasi |
|---|---|---|
| Tidak ada social proof real | Trust rendah untuk early users | Placeholder "Be among the first" + value-prop kuat |
| Tidak ada product screenshot | Visitor tidak bisa lihat produk | Text-based mockup + animated demo |
| Tidak ada pricing info | Visitor tidak tahu value | Messaging "Free for now" + future pricing teaser |
| Tidak ada logo PromptFlow khusus | Branding kurang kuat | Text-based logo dengan violet styling |

---

## Lampiran — Ringkasan Asumsi

| ID | Asumsi | Dampak bila Salah |
|---|---|---|
| ASM-M01 | Produk = animation prompt automation (bukan document generation) | Landing page salah describe |
| ASM-M02 | Target audience = kreator animasi AI (solo + indie studio) | Tone visual bisa miss |
| ASM-M03 | Produk saat ini gratis (tidak ada pricing) | Butuh pricing section |
| ASM-M04 | Traffic 50%+ mobile | Desktop-only = conversion turun |
| ASM-M05 | Trafik dari direct + SEO + social share | Channel attribution belum optimal |
| ASM-M06 | Estimasi pasar kualitatif, belum ada data kuantitatif | Strategi pricing/billing bisa salah |
| ASM-M07 | Kompetitor utama = LLM general-purpose + image gen tools | Positioning bisa overlap |

---

> **Dokumen ini = panduan marketing untuk landing page PromptFlow. Eksekutor teknis cukup baca BRD + RAG-CONTEXT + UIUX_SPEC untuk implementasi. Semua klaim bersitasi. Klaim tanpa bukti = ASUMSI.**

**Dibuat oleh:** docgen-mrd subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0