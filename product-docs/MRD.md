# Marketing Requirement Document (MRD) V2.0
## PromptFlow — Upgrade V2: Workflow Otomasi Prompt Animasi AI

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** product-docs/RAG-CONTEXT.md + product-docs/BRD.md V2.0
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** V1 sudah built dan berjalan. Dokumen ini fokus pada analisis pasar untuk upgrade V2.

---

## 1. Ringkasan Eksekutif

**PromptFlow V2** adalah upgrade signifikan dari web app otomasi prompt animasi AI yang sudah berjalan. V1 memecahkan problem inti otomasi susun prompt dari input minimal, namun workflow terfragmentasi (upload di halaman terpisah), tidak ada transparansi proses, dan dashboard minimal.

**Upgrade V2** menambah 8 fitur yang meningkatkan produktivitas kreator animasi AI:

1. **Image reference di generate page** — upload multi-file + role classification langsung di form generate, mengurangi friction workflow dari 2 halaman jadi 1.
2. **Deskripsi singkat cerita** — field baru untuk konteks naratif lebih kaya, menghasilkan prompt lebih akurat.
3. **Real-time processing logs** — show/hide toggle untuk transparency proses generate.
4. **Dashboard enrichment** — metrics lebih kaya (charts, per-provider breakdown, recent activity).
5. **Konsistensi UI** — design tokens, loading states, error boundaries.
6. **SQA testing menyeluruh** — coverage >= 80%, E2E critical path.
7. **Page navigation optimization** — pagination, streaming, caching.
8. **Push ke GitHub** — version control + deployment pipeline.

**Nilai pasar V2:** hemat waktu tambahan 30% vs V1, meningkatkan retensi user, memperkuat diferensiasi via AI-powered image classification, dan mempersiapkan scale ke production deployment.
- Sitasi: BRD.md V2.0 S1

---

## 2. Market Analysis

### 2.1 Market Opportunity

#### 2.1.1 Generative AI Content Boom

Pasar generative AI untuk konten visual tumbuh signifikan. Tool seperti Midjourney, Kling, Sora, DALL-E, dan aggregator LLM (OpenRouter) menunjukkan permintaan tinggi untuk workflow otomasi prompt. Kreator tidak hanya butuh "generate gambar", tapi butuh menyusun alur cerita animasi lengkap: adegan berurut, karakter konsisten, naskah voiceover, pesan moral.
- Sitasi: BRD.md V2.0 S2.1; BRD.md V1 S5.1, S5.2

#### 2.1.2 Vertical Gap: Animasi Prompt Automation

Tidak ada tool yang mengotomasi seluruh paket prompt animasi dalam satu input. Pesaing generic (PromptHero, FlowGPT) hanya prompt umum. Chatbot (ChatGPT, Claude) manual. Image gen tool (Midjourney, Kling) single image, bukan alur cerita. PromptFlow mengisi gap vertical "animasi prompt automation + konsistensi karakter + multi-provider LLM".
- Sitasi: BRD.md V1 S5.2; MRD.md V1 S4.1

#### 2.1.3 Enabler Teknis Matang

AI SDK v4 (multi-provider via @ai-sdk/openai-compatible) + Turso (libSQL serverless) + Vercel (serverless deploy) = stack teknis matang untuk production deployment. V1 sudah terbangun, V2 tinggal upgrade.
- Sitasi: RAG-CONTEXT.md S2.1, S5.1

### 2.2 Market Size (ASUMSI — TIDAK ADA BUKTI data kuantitatif)

RAG-CONTEXT.md tidak mengambil data sizing pasar publik. Sizing berikut ASUMSI berdasarkan observasi tren:

| Segmen | Estimasi (ASUMSI) | Catatan Bukti |
|---|---|---|
| Kreator animasi AI global | Tumbuh cepat, jutaan (ASUMSI) | TIDAK ADA BUKTI angka resmi di RAG |
| Komunitas AI art Indonesia | Aktif, ukuran tidak dikuantifikasi | TIDAK ADA BUKTI |
| Indie studio animasi kecil | Segmen niche | TIDAK ADA BUKTI |
| Edukator/tutorial maker | Segmen vertikal edukasi | TIDAK ADA BUKTI |

> Catatan: Bila butuh sizing kuantitatif, lakukan riset pasar tambahan (webfetch ke laporan Gartner/Statista/dll). ASUMSI.

### 2.3 Market Trends

| Trend | Dampak ke PromptFlow | Sitasi |
|---|---|---|
| Multi-model AI adoption | User ingin fleksibilitas pilih model/provider sesuai budget | BRD.md V1 S8.1 #3; RAG-CONTEXT.md S5.1, S5.2 |
| Character consistency demand | Kreator butuh karakter konsisten lintas adegan | RAG-CONTEXT.md S6 (Kling AI guide, glibatree method) |
| Workflow automation | Kreator ingin satu input -> paket lengkap | BRD.md V1 S5.2 |
| AI image classification | Vision LLM bisa auto-classify role gambar | RAG-CONTEXT.md S9 V2-3, S10 B |
| Transparency and observability | User butuh tahu proses generate, debug, trust | BRD.md V2.0 S2.2 P-V2-3 |

### 2.4 Mengapa Sekarang

1. **V1 sudah built** — foundation kuat, tidak perlu mulai dari nol.
2. **Enabler teknis matang** — AI SDK multi-provider + Turso serverless production-ready.
3. **Vertical gap belum terisi** — belum ada pesaing langsung di "animasi prompt automation + konsistensi karakter + multi-provider LLM + AI image classification".
4. **User feedback ada** — V1 menunjukkan workflow friction (upload terpisah, tidak ada logs, dashboard minimal) yang V2 selesaikan.
- Sitasi: BRD.md V2.0 S2.1; RAG-CONTEXT.md S9
---

## 3. Target Customer Segments

### 3.1 Persona V2

Persona turun dari stakeholder BRD V2 S4. **ASUMSI** (RAG-CONTEXT.md hanya menyebut "user", tidak ada bukti persona eksplisit).
- Sitasi: BRD.md V2.0 S4; RAG-CONTEXT.md S7

| Atribut | Persona A: Kreator Solo | Persona B: Indie Studio Kecil | Persona C: Edukator/Tutorial Maker |
|---|---|---|---|
| **Nama persona** | "Rian si YouTuber" | "Studio Bumi Animasi" | "Bu Sinta Pengajar" |
| **Peran** | Content creator animasi AI solo | Tim kecil 2-5 orang, produksi animasi serial | Guru/pembuat konten edukasi animasi |
| **Demografis** | 20-35 thn, Indonesia+global, mobile+desktop | Studio kecil, urban Indonesia/global | 30-50 thn, institusi pendidikan/YouTube edukasi |
| **Tujuan** | Produksi animasi cepat, murah, konsisten | Standarisasi prompt tim, reproducibility, kolaborasi | Materi edukasi terstruktur, pesan moral, adegan berurut |
| **Pain point V1** | Upload terpisah dari generate, tidak ada logs, dashboard kosong | Tidak ada standar format, rework, tidak bisa monitor produktivitas | Workflow terfragmentasi, tidak ada transparansi proses |
| **Pain point V2 (baru)** | Butuh AI classify gambar otomatis, butuh deskripsi cerita lebih kaya | Butuh dashboard enrichment untuk tracking tim | Butuh UI loading states, error boundaries |
| **Trigger pakai V2** | Workflow friction V1 tinggi, butuh speed | Butuh monitoring produktivitas tim | Butuh materi lebih terstruktur |
| **Kebutuhan kunci V2** | Upload + generate 1 halaman, AI classification, real-time logs | Dashboard enrichment, export data, pagination | Loading states jelas, dwibahasa, pesan moral |
| **Barier adopsi** | Belum tahu AI image classification, takut biaya Vision API | Butuh onboarding tim, kolaborasi (fase awal: solo) | Butuh UI sederhana, dwibahasa |
| **Channel jangkauan** | YouTube tutorial, komunitas AI art ID, X/LinkedIn | GitHub open-source, Product Hunt, forum studio | Komunitas edukator, marketplace template (fase akhir) |

### 3.2 Kebutuhan Pasar per Persona (V2)

| Persona | Kebutuhan pasar V2 (harus dipenuhi produk) |
|---|---|
| Kreator Solo | Upload + generate 1 halaman (hemat 50% navigasi), AI classify gambar otomatis, real-time logs untuk debug, deskripsi cerita untuk prompt lebih akurat |
| Indie Studio | Dashboard enrichment untuk monitoring produktivitas tim, pagination projects list, export data untuk analisis |
| Edukator | Loading states jelas, error boundaries, UI intuitif, dwibahasa ID+EN, pesan moral built-in |

### 3.3 V2 Feature Adoption Target

| Feature | Target Adoption | Cara Ukur | Bukti |
|---|---|---|---|
| Image reference di generate page | >= 70% generate pakai upload | Count generate dengan asset_references terisi | BRD.md V2.0 S3.2 K-V2-1 |
| Deskripsi cerita | >= 60% generate pakai storyDescription | Count generate dengan storyDescription terisi | BRD.md V2.0 S3.2 K-V2-3 |
| Real-time logs | >= 40% user aktifkan logs | Count toggle on di generate page | BRD.md V2.0 S3.2 K-V2-4 |
| Dashboard views | >= 50% user buka dashboard 1x/minggu | Page view count | BRD.md V2.0 S3.2 K-V2-5 |

---

## 4. Competitor Analysis

### 4.1 Competitive Landscape (ASUMSI — TIDAK ADA BUKTI riset pesaing formal di RAG)

RAG-CONTEXT.md tidak melakukan riset pesaing formal. Tabel berikut ASUMSI berdasarkan paket konteks orchestrator + observasi umum pasar.

| Kategori | Contoh (ASUMSI) | Vertical Animasi? | Multi-provider LLM? | Konsistensi Karakter? | AI Image Classification? | Paket Terstruktur? | Sumber Bukti |
|---|---|---|---|---|---|---|---|
| Prompt gallery generic | PromptHero, FlowGPT | TIDAK | TIDAK | TIDAK | TIDAK | TIDAK | ASUMSI |
| Chatbot manual | ChatGPT, Claude, Gemini | TIDAK | TIDAK (single vendor) | Manual | TIDAK | TIDAK | ASUMSI |
| Image gen tool native | Midjourney, Kling, DALL-E | Partial (image, bukan paket alur) | TIDAK | Ya via --cref/reference image | TIDAK (manual upload) | TIDAK | RAG-CONTEXT.md S6 |
| Prompt builder/manager | Berbagai tool niche | TIDAK ADA bukti | ASUMSI TIDAK | ASUMSI TIDAK | ASUMSI TIDAK | ASUMSI TIDAK | ASUMSI |
| **PromptFlow V1** | (produk ini) | **YA (vertical animasi)** | **YA (Ollama + OpenRouter + 9router + custom)** | **YA via Character master** | **TIDAK (manual upload)** | **YA (paket lengkap + pesan moral)** | BRD.md V1 S8.1; RAG-CONTEXT.md S5.1, S5.2, S6 |
| **PromptFlow V2** | (upgrade) | **YA** | **YA** | **YA** | **YA (Vision LLM auto-classify)** | **YA** | BRD.md V2.0 S5.1 S2; RAG-CONTEXT.md S9 V2-3 |

### 4.2 Gap Pesaing yang PromptFlow V2 Isi

1. **Tidak ada vertical "animasi prompt automation".** Pesaing generic = prompt umum, bukan alur animasi terstruktur.
   - ASUMSI (TIDAK ADA BUKTI RAG formal).
2. **Tidak ada multi-provider LLM.** ChatGPT/Claude = single vendor, rigid biaya. PromptFlow = pilih provider per proyek.
   - Sitasi: BRD.md V1 S8.1 #3; RAG-CONTEXT.md S5.1, S5.2
3. **Tidak ada konsistensi karakter otomatis via prompt teks.** Midjourney --cref butuh image reference ID di tool, bukan output prompt teks siap copy.
   - Sitasi: RAG-CONTEXT.md S6
4. **Tidak ada paket lengkap (adegan + voiceover + pesan moral).** Pesaing hanya generate gambar satu per satu.
   - Sitasi: BRD.md V1 S5.2, S8.1 #4
5. **Tidak ada AI image classification untuk role gambar.** Pesaing = manual upload tanpa auto-classify. PromptFlow V2 = Vision LLM auto-classify tokoh/background/prop.
   - Sitasi: BRD.md V2.0 S5.1 S2; RAG-CONTEXT.md S9 V2-3
6. **Tidak ada real-time processing logs.** Pesaing = black box, user tidak tahu proses.
   - Sitasi: BRD.md V2.0 S2.2 P-V2-3

### 4.3 Competitive Moat (V2)

| Moat | Penjelasan | Durasi (ASUMSI) |
|---|---|---|
| Vertical specialization | Satu-satunya tool khusus animasi prompt automation + konsistensi karakter | 6-12 bulan sebelum pesaing masuk |
| Multi-provider flexibility | BYO API key + pilih model per proyek = biaya fleksibel | Durable (network effect komunitas) |
| AI image classification | Auto-classify role gambar = workflow lebih cepat | 3-6 bulan (Vision API bisa dipakai siapa saja) |
| Open-source community | GitHub traction + kontribusi = moat komunitas | Durable |
| Character consistency method | Character master terstruktur lintas adegan = metode unik | 6-12 bulan |

---

## 5. Positioning

### 5.1 Statement Positioning V2

> "Workflow otomasi prompt animasi AI dengan AI image classification, konsistensi karakter, dan multi-provider LLM. Satu judul -> paket prompt siap pakai."

### 5.2 Nilai Jual Unik (USP) V2

| USP | Penjelasan | Bukti/Sitasi |
|---|---|---|
| **Paket prompt terstruktur satu input** | Judul + referensi + durasi + deskripsi cerita -> adegan berurut + voiceover + image prompt per tokoh/background + karakter konsisten + pesan moral | BRD.md V1 S8.1 #4; BRD.md V2.0 S5.1 S3 |
| **AI image classification** | Vision LLM auto-classify role gambar (tokoh/background/prop/accessory/environment) -> user tidak perlu manual classify | BRD.md V2.0 S5.1 S2; RAG-CONTEXT.md S9 V2-3 |
| **Upload + generate 1 halaman** | DropzoneUploader dipindah ke generate page -> workflow friction berkurang 50% | BRD.md V2.0 S5.1 S1; RAG-CONTEXT.md S9 V2-1 |
| **Real-time processing logs** | Show/hide toggle -> transparency proses generate, reduced anxiety | BRD.md V2.0 S5.1 S4; RAG-CONTEXT.md S9 V2-5 |
| **Konsistensi karakter lintas adegan** | Character master terstruktur dirujuk lintas adegan, bukan duplikasi deskripsi per scene | RAG-CONTEXT.md S4, S6; BRD.md V1 S8.1 #5 |
| **Multi-provider LLM (fleksibilitas biaya)** | Ollama cloud, OpenRouter, 9router, custom. User pilih model per proyek sesuai budget | RAG-CONTEXT.md S5.1, S5.2; BRD.md V1 S8.1 #3 |
| **Dashboard enrichment** | Charts, per-provider breakdown, recent activity -> monitoring produktivitas | BRD.md V2.0 S5.1 S5; RAG-CONTEXT.md S9 V2-6 |
| **Output teks prompt siap copy** | Bukan generate media langsung -> user bebas copy ke tool image/video gen eksternal | RAG-CONTEXT.md S9 G10, G12; BRD.md V1 S7.2 B1, B2 |
| **Pesan moral built-in** | Diferensiasi pasar konten edukasi/anak | BRD.md V1 S5.3 |
| **Dwibahasa ID + EN** | Akses pasar Indonesia + global | ASUMSI - BRD.md V1 S7.1 A2; RAG-CONTEXT.md S9 G5 |
| **Open-source (GitHub)** | Traction komunitas, transparansi, kontribusi | RAG-CONTEXT.md S1 |

### 5.3 Matriks Positioning (ASUMSI)

| Sumbu | Pesaing generic | PromptFlow V1 | PromptFlow V2 |
|---|---|---|---|
| Vertical vs Horizontal | Horizontal (prompt umum) | Vertical (animasi prompt automation) | Vertical + AI classification |
| Single vs Multi-provider | Single vendor | Multi-provider + BYO API key | Multi-provider + BYO API key |
| Konsistensi karakter | Manual | Otomatis via Character master | Otomatis via Character master |
| Image classification | Manual upload | Manual upload | **AI auto-classify (Vision LLM)** |
| Workflow friction | N/A | 2 halaman (upload + generate) | **1 halaman (unified)** |
| Transparency | N/A | Black box | **Real-time logs** |
| Output | Single image prompt | Paket alur cerita lengkap | Paket alur cerita lengkap |
---

## 6. Go-to-Market Strategy

### 6.1 Launch Strategy V2

| Fase | Aktivitas | Target | Durasi | Bukti/Sitasi |
|---|---|---|---|---|
| **Pre-launch** | GitHub repo open-source + README demo + deploy Vercel preview + changelog V2 | Traction bintang GitHub, demo live | 1-2 minggu | RAG-CONTEXT.md S1; BRD.md V2.0 S5.1 S9 |
| **Soft launch** | Komunitas AI art Indonesia (Discord/Telegram) + X/LinkedIn announcement | Early adopter feedback | 1 minggu | ASUMSI |
| **Public launch** | Product Hunt launch + YouTube tutorial "PromptFlow V2 Workflow" + dev.to article | Awareness gelombang pertama | 1 minggu | ASUMSI |
| **Post-launch** | Iterasi feedback + konten X/LinkedIn + komunitas Discord + edukasi fitur V2 | Retention and word-of-mouth | Ongoing | ASUMSI |

### 6.2 V2-Specific Messaging

| Audience | Message | Channel |
|---|---|---|
| Kreator Solo | "Upload + generate 1 halaman. AI classify gambar otomatis. Real-time logs. Hemat waktu 30%." | YouTube tutorial, X/LinkedIn |
| Indie Studio | "Dashboard enrichment untuk monitoring produktivitas tim. Export data untuk analisis." | GitHub README, Product Hunt |
| Edukator | "Loading states jelas. Error boundaries. UI intuitif dwibahasa. Pesan moral built-in." | Komunitas edukator, YouTube |
| Developer | "Next.js 15 + AI SDK v4 + Turso + Drizzle ORM. Open-source. Multi-provider." | GitHub, dev.to, Hacker News |

### 6.3 Content Marketing Plan (ASUMSI)

| Content | Format | Target | Frequency |
|---|---|---|---|
| "PromptFlow V2: Workflow Baru" | YouTube tutorial | Kreator solo | Launch week |
| "AI Image Classification di PromptFlow" | X thread | Developer + kreator | Launch week |
| "Dashboard Enrichment untuk Studio Animasi" | LinkedIn post | Indie studio | Post-launch |
| "PromptFlow V2 Changelog" | GitHub release notes | Developer | Setiap release |
| "Cara Pakai PromptFlow untuk Edukasi" | YouTube tutorial | Edukator | Post-launch |

### 6.4 Distribution Channels

| Channel | Tujuan | Audience | Status |
|---|---|---|---|
| GitHub README + demo Vercel | Proof-of-value, open-source traction | Developer+kreator teknis | RAG-CONTEXT.md S1; BRD.md V1 S8.1 #10 |
| Product Hunt | Launch awareness global | Early adopter tech | ASUMSI |
| Komunitas AI art Indonesia | Adopsi lokal | Kreator solo+studio ID | ASUMSI |
| YouTube tutorial | Edukasi workflow + SEO | Kreator solo+edukator | ASUMSI |
| X/LinkedIn content | Thought leadership + distribusi | Kreator+studio global | ASUMSI |
| Komunitas Discord AI art | Retention and feedback loop | Power user | ASUMSI |
| Dev.to / Hacker News | Developer awareness | Technical audience | ASUMSI |

---

## 7. Pricing Strategy

### 7.1 Pricing Model (ASUMSI — TIDAK ADA BUKTI di RAG/BRD)

BRD V2 S8.2 mengecualikan sistem pembayaran/monetisasi fase awal. Pricing berikut ASUMSI paket konteks orchestrator (freemium + BYO API key).

| Tier | Fitur | Harga | Catatan Bukti |
|---|---|---|---|
| Free | 1 provider free tier limit (Ollama cloud default ASUMSI), proyek terbatas, 10 generate/bulan | Gratis | ASUMSI - BRD.md V1 S7.1 A8 |
| Pro | Unlimited proyek, semua provider, export markdown, prioritas support | Berbayar (ASUMSI nominal) | ASUMSI - BRD.md V1 S8.2 #5 |
| BYO API key | User bawa API key sendiri (Ollama/OpenRouter/9router/custom) | Gratis atas pemakaian API provider | BRD.md V1 S8.1 #3, #7; RAG-CONTEXT.md S5.1, S5.2 |

### 7.2 V2 Cost Considerations

| Cost Item | Estimasi (ASUMSI) | Dampak ke Pricing |
|---|---|---|
| Vision LLM API (image classification) | ~$0.01-0.05 per image (GPT-4o Vision ASUMSI) | Free tier: limit 10 classify/bulan. Pro: unlimited |
| Generate LLM API | Bervariasi per provider | BYO API key = user bayar langsung ke provider |
| Vercel hosting | Free tier Hobby, Pro $20/bulan | Free tier cukup untuk awal |
| Turso DB | Free tier 500MB | Free tier cukup untuk awal |

### 7.3 Monetisasi Roadmap

| Fase | Model | Target |
|---|---|---|
| Fase awal (V2 launch) | TIDAK ada pembayaran. Fokus adoption & open-source traction | 100+ user dalam 3 bulan |
| Fase pertengahan (6 bulan) | Freemium SaaS + BYO API key | 500+ user, 10% conversion ke Pro |
| Fase akhir (12 bulan) | Marketplace template prompt + kolaborasi tim | Revenue stream tambahan |

### 7.4 Risiko Biaya User

Biaya API LLM membengkak = risiko churn. Mitigasi: estimasi token sebelum generate, budget alert, provider murah default (Ollama ASUMSI), BYO API key.
- Sitasi: BRD.md V1 S6 R3

---

## 8. Marketing Channels

### 8.1 Channel Strategy

| Channel | Purpose | KPI | Budget (ASUMSI) |
|---|---|---|---|
| GitHub | Open-source traction, developer community | Stars, forks, issues, PRs | Gratis |
| Product Hunt | Launch awareness, early adopter | Upvotes, comments, signups | Gratis |
| YouTube | Tutorial, workflow demo, SEO | Views, subscribers, watch time | Gratis (organic) |
| X/Twitter | Thought leadership, updates, community | Followers, engagement, retweets | Gratis |
| LinkedIn | Professional audience, studio segment | Connections, post reach | Gratis |
| Discord | Community, feedback, support | Members, active users, NPS | Gratis |
| Dev.to / Hacker News | Developer awareness, technical audience | Views, comments, signups | Gratis |

### 8.2 SEO Strategy (ASUMSI)

| Keyword | Search Volume (ASUMSI) | Competition | Priority |
|---|---|---|---|
| "AI animation prompt generator" | Medium | Low | High |
| "prompt automation tool" | Medium | Medium | High |
| "character consistency AI" | Low | Low | Medium |
| "multi-provider LLM tool" | Low | Low | Medium |
| "animation workflow automation" | Low | Low | High |

### 8.3 Partnership Opportunities (ASUMSI)

| Partner | Type | Benefit |
|---|---|---|
| OpenRouter | Provider integration | Co-marketing, featured provider |
| Kling AI | Tool integration | Cross-promotion, tutorial collaboration |
| Midjourney community | User base | Tutorial content, community engagement |
| Edukasi platform (Ruangguru, Zenius) | Edukator segment | Content partnership |
---

## 9. Success Metrics

### 9.1 Marketing KPIs V2

Turun dari KPI bisnis BRD V2 S3.2. Metrik pemasaran fokus adoption dan awareness.

| Metrik | Target | Cara Ukur | Sumber Bukti |
|---|---|---|---|
| **Waktu upload ke generate** | <= 30 detik (dari 2+ menit V1) | Timing dari upload submit ke generate submit | BRD.md V2.0 S3.2 K-V2-1 |
| **Akurasi prompt (survey)** | >= 85% user puas kualitas prompt | Survey pasca-generate | BRD.md V2.0 S3.2 K-V2-2 |
| **Feature adoption: deskripsi cerita** | >= 60% user pakai | Count generate dengan storyDescription terisi | BRD.md V2.0 S3.2 K-V2-3 |
| **Feature adoption: real-time logs** | >= 40% user aktifkan | Count toggle on di generate page | BRD.md V2.0 S3.2 K-V2-4 |
| **Dashboard page views** | >= 50% user buka 1x/minggu | Page view count | BRD.md V2.0 S3.2 K-V2-5 |
| **Test coverage** | >= 80% unit, 100% critical E2E | Vitest coverage + Playwright pass | BRD.md V2.0 S3.2 K-V2-6 |
| **Page load time** | <= 2s (LCP), <= 100ms (FID) | Core Web Vitals | BRD.md V2.0 S3.2 K-V2-7 |
| **Jumlah project dibuat** | >= 100/bulan (3 bulan pasca-launch) | Count record Project di DB Turso | BRD.md V1 S3.2 K1 |
| **Weekly retention** | >= 30% | Unique user active di >= 2 minggu berbeda | BRD.md V1 S3.2 K3 |
| **GitHub stars** | Traction awal (tidak dikuantifikasi) | GitHub repo metrics | ASUMSI |

### 9.2 V2-Specific Metrics

| Metrik | Target | Cara Ukur |
|---|---|---|
| AI classification accuracy | >= 80% role correctly classified | Manual audit sample + confidence score |
| Vision API cost per user | <= $0.50/bulan (free tier) | API billing dashboard |
| Real-time log latency | <= 100ms dari server ke UI | Frontend telemetry |
| Dashboard load time | <= 1.5s | Core Web Vitals |
| Navigation improvement | <= 200ms page transition | Performance measurement |

---

## 10. Risk and Mitigation

### 10.1 Market Risks V2

| ID | Risiko | Dampak | Probabilitas | Mitigasi | Bukti |
|---|---|---|---|---|---|
| MR-V2-1 | Vision LLM API cost membengkak | Biaya klasifikasi gambar tinggi, user churn | Sedang | Cache classification result. Batch classification. Confidence threshold, manual override | BRD.md V2.0 S6 R-V2-1 |
| MR-V2-2 | Vision LLM classification akurasi rendah | Role salah, prompt kurang akurat, reputasi jelek | Sedang | Tampilkan hasil klasifikasi di UI sebelum submit. Allow manual override. Confidence score visible | BRD.md V2.0 S6 R-V2-2 |
| MR-V2-3 | SSE log events menambah payload size | Latency generate naik | Rendah | Log events lightweight. Toggle off = no log events. Buffer and batch | BRD.md V2.0 S6 R-V2-3 |
| MR-V2-4 | Dashboard enrichment over-engineering | Development time membengkak | Sedang | Mulai simple cards + tables dulu. Chart library lightweight. Hindari real-time dashboard | BRD.md V2.0 S6 R-V2-4 |
| MR-V2-5 | Refactor upload flow breaking existing features | V1 upload di project detail rusak | Rendah | Backward compatible. Test coverage tinggi | BRD.md V2.0 S6 R-V2-5 |
| MR-V2-6 | Git push expose secrets | API key / env bocor ke public repo | Rendah | .gitignore lengkap. Review sebelum push | BRD.md V2.0 S6 R-V2-6 |
| MR-V2-7 | V2 scope terlalu besar | Delay delivery | Sedang | Prioritize: S1-S3 = MUST, S4-S6 = SHOULD, S7-S9 = COULD. Ship incrementally | BRD.md V2.0 S6 R-V2-7 |
| MR-V2-8 | AI SDK version mismatch | Confusion developer | Rendah | Kode = ground truth. Update docs. ASUMSI: upgrade SDK = out of scope V2 | BRD.md V2.0 S6 R-V2-8 |
| MR-V2-9 | Pesaing cepat masuk vertical | Pangsa pasar tergerus | Sedang | Ship cepat, bangun moat via open-source community + AI classification + konsistensi karakter | ASUMSI |
| MR-V2-10 | Adopsi lambat: kreator belum tahu workflow | Awareness rendah | Sedang | YouTube tutorial + demo Vercel + komunitas AI art ID + Product Hunt | ASUMSI |
| MR-V2-11 | Biaya API LLM membuat user churn | Churn | Sedang | Estimasi token, budget alert, provider murah default, BYO API key | BRD.md V1 S6 R3 |
| MR-V2-12 | Persona indie studio butuh kolaborasi | Segmen B tidak terlayani penuh | Sedang | Komunikasi batasan fase awal jelas, roadmap kolaborasi fase akhir | BRD.md V1 S8.2 #6 |
| MR-V2-13 | Persona edukator butuh marketplace template | Segmen C tidak terlayani penuh | Rendah | Roadmap marketplace fase akhir, komunitas share manual | BRD.md V1 S8.2 #7 |
| MR-V2-14 | Sizing pasar tidak dikuantifikasi | Strategi berbasis asumsi | Tinggi | Riset pasar tambahan sebelum scale | RAG-CONTEXT.md S9 |
| MR-V2-15 | Riset pesaing tidak formal | Blind spot kompetisi | Sedang | Riset pesaing formal pre-launch | RAG-CONTEXT.md S9 |

### 10.2 Risk Priority Matrix

| Prioritas | Risiko | Aksi |
|---|---|---|
| **HIGH** | MR-V2-14 (sizing tidak dikuantifikasi), MR-V2-1 (Vision API cost) | Riset pasar tambahan. Cache classification. Budget alert |
| **MEDIUM** | MR-V2-2 (classification akurasi), MR-V2-4 (over-engineering), MR-V2-7 (scope besar), MR-V2-9 (pesaing), MR-V2-10 (adopsi lambat), MR-V2-11 (churn), MR-V2-12 (kolaborasi) | Manual override. Simple dashboard dulu. Incremental ship. Content marketing. BYO API key |
| **LOW** | MR-V2-3 (log payload), MR-V2-5 (breaking features), MR-V2-6 (secrets), MR-V2-8 (SDK mismatch), MR-V2-13 (marketplace), MR-V2-15 (riset pesaing) | Lightweight logs. Backward compatible. .gitignore. Kode = truth. Roadmap fase akhir |

---

## 11. Asumsi MRD (Ringkasan)

| ID | Asumsi | Status Bukti | Sitasi |
|---|---|---|---|
| M-V2-1 | Persona kreator solo/studio/edukator | TIDAK ADA BUKTI eksplisit di RAG | BRD.md V2.0 S4; RAG-CONTEXT.md S7 |
| M-V2-2 | Dwibahasa UI ID+EN | TIDAK ADA BUKTI | BRD.md V1 S7.1 A2; RAG-CONTEXT.md S9 G5 |
| M-V2-3 | Sizing pasar kuantitatif | TIDAK ADA BUKTI di RAG | ASUMSI MRD S2.2 |
| M-V2-4 | Riset pesaing formal | TIDAK ADA BUKTI di RAG | ASUMSI MRD S4.1 |
| M-V2-5 | Pricing freemium + BYO API key | TIDAK ADA BUKTI (BRD fase awal no payment) | ASUMSI MRD S7; BRD.md V1 S8.2 #5 |
| M-V2-6 | Strategi peluncuran Product Hunt + komunitas + YouTube | TIDAK ADA BUKTI | ASUMSI |
| M-V2-7 | Default provider murah = Ollama cloud | TIDAK ADA BUKTI model default | BRD.md V1 S7.1 A8; RAG-CONTEXT.md S9 G8 |
| M-V2-8 | Login dasar NextAuth untuk retention metrik | TIDAK ADA BUKTI auth | BRD.md V1 S7.1 A1; RAG-CONTEXT.md S7, S9 G2 |
| M-V2-9 | Vision LLM cost <= $0.05/image | TIDAK ADA BUKTI pricing Vision API | ASUMSI berdasarkan GPT-4o Vision pricing umum |
| M-V2-10 | AI classification accuracy >= 80% | TIDAK ADA BUKTI benchmark | ASUMSI berdasarkan Vision LLM capability umum |

---

## 12. Referensi

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md |
| BRD V2.0 | C:\laragon\www\PromptFlow\product-docs\BRD.md |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### Sitasi eksternal kunci (dari RAG-CONTEXT.md S10)

| Sitasi | Klaim didukung |
|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | Multi-provider LLM via @ai-sdk/openai-compatible |
| https://openrouter.ai/docs/api/reference/authentication | Base URL OpenRouter |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat endpoint |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js setup |
| https://turso.tech/blog/serverless | Vercel filesystem tidak persisten -> Turso |
| https://vercel.com/marketplace/tursocloud | Turso resmi di Vercel Marketplace |
| https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference | Midjourney --cref butuh image reference |
| https://kling.ai/blog/ai-character-consistency-guide | Konsistensi karakter via deskripsi terstruktur |
| https://glibatree.com/proven-consistent-character-method | Metode konsistensi karakter terstruktur |

---

**Dokumen ini fokus pada PASAR untuk upgrade V2. Tujuan bisnis ada di BRD V2.0,
spesifikasi produk di PRD, spesifikasi teknis di SRS, arsitektur di
PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA, aturan kode di
CODING_RULES. MRD tidak membangun deliverable akhir.**

**Dibuat oleh:** docgen-mrd subagent
**Tanggal:** 2026-06-20
**Versi:** 2.0
