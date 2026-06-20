# Business Requirement Document (BRD) V2.0
## PromptFlow — Upgrade V2: Otomasi Prompt Animasi AI

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran faktual:** `product-docs/RAG-CONTEXT.md` (bersitasi per klaim)
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** V1 sudah built dan berjalan. Dokumen ini fokus pada justifikasi bisnis upgrade V2.

---

## 1. Ringkasan Eksekutif

**PromptFlow** adalah web app fullstack untuk otomasi penyusunan prompt animasi AI.
V1 sudah terbangun lengkap: 9 tabel DB, auth NextAuth, upload Vercel Blob,
generate SSE streaming, export JSON/markdown, i18n dwibahasa, 21 endpoint API.
Kode berjalan di Laragon localhost.

**Upgrade V2** menambah 8 fitur utama yang meningkatkan produktivitas kreator
animasi AI secara signifikan:

1. **Image reference dipindah ke generate page** — upload multi-file + role
   classification langsung di form generate, mengurangi friction workflow.
2. **Deskripsi singkat cerita** — field baru di generate form agar LLM punya
   konteks naratif lebih kaya, menghasilkan prompt lebih akurat.
3. **Real-time processing logs** — show/hide toggle untuk transparency proses
   generate, meningkatkan trust user terhadap sistem.
4. **Dashboard enrichment** — metrics lebih kaya (charts, per-provider breakdown,
   recent activity) untuk monitoring produktivitas.
5. **Konsistensi UI** — design tokens, loading states, error boundaries.
6. **SQA testing menyeluruh** — coverage >= 80%, E2E critical path.
7. **Page navigation optimization** — pagination, streaming, caching.
8. **Push ke GitHub** — version control + deployment pipeline.

**Nilai bisnis V2:** hemat waktu tambahan 30% vs V1, meningkatkan retensi user,
memperkuat diferensiasi via AI-powered image classification, dan mempersiapkan
scale ke production deployment.

---

## 2. Latar Belakang Bisnis & Problem Statement

### 2.1 Status V1

V1 PromptFlow sudah memecahkan problem inti: otomasi susun prompt animasi dari
input minimal (judul + durasi + gaya). Namun, analisis kode dan user feedback
mengidentifikasi beberapa gap yang menghalangi produktivitas optimal:

| # | Gap V1 | Dampak Bisnis |
|---|---|---|
| G1 | Upload gambar referensi ada di project detail, bukan generate page | User harus buka 2 halaman berbeda untuk upload + generate, workflow terfragmentasi |
| G2 | Tidak ada deskripsi cerita di generate form | LLM hanya dapat judul, prompt kurang kontekstual, perlu manual edit |
| G3 | Tidak ada real-time logs | User tidak tahu proses generate sampai mana, anxiety, tidak bisa debug |
| G4 | Dashboard hanya 3 kartu KPI | Tidak ada insight produktivitas, tidak bisa track improvement |
| G5 | Tidak ada loading/error states | UX buruk saat loading, perceived performance rendah |
| G6 | Tidak ada pagination di projects list | Lambat saat project banyak, scalability concern |
| G7 | Kode belum di-version control | Tidak bisa collaborate, rollback, atau deploy otomatis |

- Sitasi: `RAG-CONTEXT.md §9 (V2-1 s/d V2-10)`, `RAG-CONTEXT.md §8 (analisis kode V1)`

### 2.2 Problem yang V2 Selesaikan

| # | Problem V2 | Dampak Bisnis | Solusi V2 |
|---|---|---|---|
| P-V2-1 | Workflow upload + generate terpisah halaman | Waktu terbuang navigasi, friction tinggi | Pindahkan upload ke generate page |
| P-V2-2 | LLM kurang konteks cerita | Prompt kurang akurat, perlu rework | Tambah field deskripsi cerita |
| P-V2-3 | Tidak ada transparansi proses generate | User tidak trust, tidak bisa debug | Real-time logs dengan toggle |
| P-V2-4 | Dashboard tidak informatif | Tidak bisa monitor produktivitas | Dashboard enrichment dengan charts |
| P-V2-5 | UI tidak konsisten (loading/error) | Perceived performance rendah | Loading states + error boundaries |
| P-V2-6 | Projects list lambat | Scalability concern | Pagination + navigation optimization |
| P-V2-7 | Kode tidak di-version control | Tidak bisa collaborate/deploy | Push ke GitHub |

---

## 3. Tujuan Bisnis & KPI

### 3.1 Tujuan Bisnis V2

| ID | Tujuan | Deskripsi |
|---|---|---|
| BO-V2-1 | Tingkatkan produktivitas workflow | Kurangi langkah dari upload ke generate dari 2 halaman jadi 1 halaman |
| BO-V2-2 | Tingkatkan kualitas output prompt | Deskripsi cerita ke LLM lebih kontekstual, prompt lebih akurat |
| BO-V2-3 | Tingkatkan trust & transparency | Real-time logs, user tahu proses, reduced anxiety |
| BO-V2-4 | Tingkatkan retensi user | Dashboard enrichment, user bisa track produktivitas, stickiness |
| BO-V2-5 | Siap production deployment | GitHub + testing + optimization, deploy ke Vercel prod |

### 3.2 KPI Bisnis Terukur V2

| KPI ID | Metrik | Target | Cara Ukur | Sumber Data |
|---|---|---|---|---|
| K-V2-1 | Waktu upload ke generate | <= 30 detik (dari 2+ menit V1) | Timing dari upload submit ke generate submit | Telemetri frontend |
| K-V2-2 | Akurasi prompt (survey) | >= 85% user puas kualitas prompt | Survey pasca-generate | Form feedback |
| K-V2-3 | Feature adoption rate | >= 60% user pakai deskripsi cerita | Count generate dengan storyDescription terisi | DB projects |
| K-V2-4 | Log feature usage | >= 40% user aktifkan real-time logs | Count toggle on di generate page | Frontend telemetry |
| K-V2-5 | Dashboard page views | >= 50% user buka dashboard minimal 1x/minggu | Page view count | Analytics |
| K-V2-6 | Test coverage | >= 80% unit, 100% critical E2E | Vitest coverage + Playwright pass | CI pipeline |
| K-V2-7 | Page load time | <= 2s (LCP), <= 100ms (FID) | Core Web Vitals | Lighthouse / Vercel Analytics |

---

## 4. Stakeholder & Kepentingan

| Stakeholder | Peran | Kepentingan V2 | Harapan |
|---|---|---|---|
| Kreator solo (YouTuber / content creator) | Pengguna utama | Workflow lebih cepat, output lebih akurat | Upload + generate satu halaman, deskripsi cerita, logs transparan |
| Indie studio animasi | Pengguna tim | Monitoring produktivitas, konsistensi | Dashboard enrichment, export data |
| Tim edukasi / edukator | Pengguna akademik | Kemudahan penggunaan | UI intuitif, loading states jelas |
| Bos Agrian | Pemilik & sponsor | ROI upgrade, adopsi fitur baru | KPI V2 terpenuhi, siap deploy production |
| Developer (tim teknis) | Implementer | Kode ter-version control, tested | GitHub repo, test coverage, clean architecture |

---

## 5. Ruang Lingkup V2 (Scope)

### 5.1 In Scope (Dikerjakan di V2)

| # | Fitur | Detail | Sitasi RAG-CONTEXT |
|---|---|---|---|
| S1 | Image reference di generate page | Pindahkan DropzoneUploader dari project detail ke generate page. Upload multi-file tanpa projectId (buat project saat submit). Role classification: tokoh, background, prop, accessory, environment, other | §9 V2-1, V2-2 |
| S2 | AI image classification | Vision LLM (GPT-4o/Gemini Vision) auto-classify role gambar. Pipeline: upload ke classify ke update asset_references.tipe + label ke inject ke prompt builder | §9 V2-3 |
| S3 | Field deskripsi cerita | Textarea opsional di generate form. Inject ke buildUserMessage(). Opsional: tambah kolom story_description di projects table | §9 V2-4 |
| S4 | Real-time processing logs | Extend SSE events dengan type `log`. Frontend: Collapsible panel dengan show/hide toggle. Backend: collect console.log ke buffer ke kirim via SSE | §9 V2-5 |
| S5 | Dashboard enrichment | Charts (line/bar), per-provider breakdown, recent activity, storage usage, performance trend. Gunakan Recharts atau Tremor | §9 V2-6 |
| S6 | Konsistensi UI | Loading.tsx per page group, error.tsx boundaries, disabled states, design tokens konsisten | §9 V2-7 |
| S7 | SQA testing | Jalankan semua test, coverage >= 80%, E2E critical path, manual testing V2 features | §9 V2-8 |
| S8 | Navigation optimization | Pagination projects list, Suspense boundaries, client-side soft navigation, Next.js Image component | §9 V2-9 |
| S9 | Push ke GitHub | git init, .gitignore, commit, push ke https://github.com/agrianwahab29/promptflow.git | §9 V2-10 |

### 5.2 Out of Scope (Tidak Dikerjakan di V2)

| # | Item | Alasan |
|---|---|---|
| O1 | Generate file media (gambar/video/audio) | Fokus prompt teks, bukan media generation |
| O2 | TTS (text-to-speech) | Output = naskah teks |
| O3 | Mobile native app | Web app responsif dulu |
| O4 | Sistem pembayaran/monetisasi | Fase awal |
| O5 | Kolaborasi real-time multi-user | Fase awal: solo per project |
| O6 | Marketplace template prompt | Fase awal |
| O7 | Dark mode toggle | Bisa di V3 |
| O8 | Multi-language output (bahasa prompt) | Ikut judul input dulu |

---

## 6. Risiko Bisnis & Mitigasi

| ID | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| R-V2-1 | Vision LLM API cost membengkak | Biaya klasifikasi gambar tinggi | Sedang | Cache classification result di asset_references agar tidak reclassify. Batch classification multiple images satu call. Confidence threshold, manual override bila rendah |
| R-V2-2 | Vision LLM classification akurasi rendah | Role salah, prompt kurang akurat | Sedang | Tampilkan hasil klasifikasi di UI sebelum submit. Allow manual override. Confidence score visible |
| R-V2-3 | SSE log events menambah payload size | Latency generate naik | Rendah | Log events lightweight (text saja). Toggle off = no log events dikirim. Buffer & batch log events |
| R-V2-4 | Dashboard enrichment over-engineering | Development time membengkak | Sedang | Mulai simple cards + tables dulu. Chart library lightweight (Recharts). Hindari real-time dashboard |
| R-V2-5 | Refactor upload flow breaking existing features | V1 upload di project detail rusak | Rendah | Backward compatible: project detail tetap bisa view refs. Upload baru di generate page. Test coverage tinggi |
| R-V2-6 | Git push expose secrets | API key / env bocor ke public repo | Rendah | .gitignore lengkap (node_modules, .env.local, .next, public/references). Review sebelum push |
| R-V2-7 | V2 scope terlalu besar | Delay delivery | Sedang | Prioritize: S1-S3 = MUST, S4-S6 = SHOULD, S7-S9 = COULD. Ship incrementally |
| R-V2-8 | AI SDK version mismatch (docs v6, code v4) | Confusion developer | Rendah | Kode = ground truth. Update docs sesuai kode. ASUMSI: upgrade SDK = out of scope V2 |

---

## 7. Benefit Realisasi

### 7.1 Benefit Langsung

| Benefit | Estimasi Dampak | Bukti |
|---|---|---|
| Workflow lebih cepat | Upload + generate = 1 halaman, hemat 50% navigasi | V1: 2 halaman terpisah. V2: 1 halaman |
| Output lebih akurat | Deskripsi cerita, LLM konteks lebih kaya, prompt lebih spesifik | ASUMSI: tergantung kualitas deskripsi user |
| Transparansi proses | Real-time logs, user tahu progress, reduced support tickets | ASUMSI: tergantung adoption |
| Monitoring produktivitas | Dashboard enrichment, bisa track trend, data-driven decisions | Data sudah ada di DB, tinggal visualize |
| Siap production | GitHub + testing, deploy Vercel prod, accessible publik | Infrastructure sudah ada |

### 7.2 Benefit Tidak Langsung

| Benefit | Dampak Jangka Panjang |
|---|---|
| User retention meningkat | Dashboard + workflow smooth, user kembali |
| Diferensiasi pasar | AI image classification, fitur unik vs kompetitor |
| Scalability terbukti | Pagination + optimization, siap handle banyak user |
| Code quality terjaga | Test coverage + linting, maintainability tinggi |
| Collaboration enable | GitHub, bisa invite contributor |

---

## 8. Asumsi & Ketergantungan

### 8.1 Asumsi V2

| ID | Asumsi | Status Bukti | Dampak bila Salah |
|---|---|---|---|
| VA-1 | Vision LLM tersedia untuk image classification | Perlu konfirmasi provider mana | Pipeline V2-3 tidak bisa jalan |
| VA-2 | Deskripsi cerita field = optional textarea | Perlu konfirmasi required/optional | Schema + form design beda |
| VA-3 | Real-time logs = collapsible panel | Perlu konfirmasi UI pattern | Frontend design beda |
| VA-4 | Dashboard enrichment = simple cards + tables + charts | Perlu konfirmasi complexity | Dependencies + development time beda |
| VA-5 | Upload di generate page = pre-submit | Perlu konfirmasi flow | UX flow beda |
| VA-6 | Role classification: tokoh, background, prop, accessory, environment, other | Perlu konfirmasi opsi | Schema + UI beda |
| VA-7 | Push ke GitHub = public repo | Perlu konfirmasi visibility | .gitignore scope beda |
| VA-8 | Vercel deploy target | Perlu konfirmasi masih Laragon atau Vercel | Env vars beda |
| VA-9 | AI SDK version tetap v4 (tidak upgrade) | ASUMSI: upgrade = out of scope V2 | Bila upgrade, breaking changes |
| VA-10 | Tidak ada schema migration untuk V2 | Kolom tipe = text tanpa CHECK constraint | Bila perlu migration, tambah task |

### 8.2 Ketergantungan V2

| ID | Ketergantungan | Pemilik | Status |
|---|---|---|---|
| VD-1 | Vision LLM API (GPT-4o / Gemini Vision) | User / Bos Agrian | Perlu API key + akses |
| VD-2 | Chart library (Recharts / Tremor) | Developer | Install via pnpm |
| VD-3 | Akun GitHub + repo access | Bos Agrian | Perlu push access |
| VD-4 | Vercel project setup (untuk deploy) | Bos Agrian | Perlu connect repo |
| VD-5 | Turso DB production | Bos Agrian | Sudah ada dari V1 |

---

## 9. Timeline & Milestone

### 9.1 Fase Implementasi

| Fase | Scope | Estimasi Durasi | Milestone |
|---|---|---|---|
| **Fase A: Core V2** | S1 (upload di generate) + S3 (deskripsi cerita) + S9 (push GitHub) | 2-3 hari | Upload + generate flow baru jalan, kode di GitHub |
| **Fase B: Intelligence** | S2 (AI image classification) + S4 (real-time logs) | 3-4 hari | Vision classification jalan, logs visible |
| **Fase C: Dashboard & Polish** | S5 (dashboard enrichment) + S6 (UI consistency) | 2-3 hari | Dashboard informatif, UI konsisten |
| **Fase D: Quality & Deploy** | S7 (SQA testing) + S8 (navigation optimization) | 2-3 hari | Coverage >= 80%, performance OK, siap deploy |

**Total estimasi: 9-13 hari kerja**

### 9.2 Milestone Detail

| Milestone | Target | Deliverable |
|---|---|---|
| M1: Upload Flow Redesign | Fase A selesai | DropzoneUploader di generate page, multi-file upload, role select extended |
| M2: GitHub Init | Fase A selesai | Repo ter-push, .gitignore lengkap, README updated |
| M3: AI Classification | Fase B selesai | Vision LLM classify uploaded images, result visible di UI |
| M4: Real-time Logs | Fase B selesai | SSE log events, Collapsible log panel, show/hide toggle |
| M5: Dashboard v2 | Fase C selesai | Charts, per-provider breakdown, recent activity |
| M6: Quality Gate | Fase D selesai | Coverage >= 80%, E2E green, performance OK |
| M7: Production Ready | Semua fase | Deploy Vercel prod, semua V2 features jalan |

### 9.3 Dependency Graph

```
Fase A (Core) -> Fase B (Intelligence) -> Fase D (Quality)
                    |
                    +-> Fase C (Dashboard) -> Fase D (Quality)
```

Fase A harus selesai dulu (upload flow = foundation untuk classification).
Fase B dan C bisa paralel. Fase D = final validation.

---

## 10. Referensi

| Dokumen | Path |
|---|---|
| RAG-CONTEXT (sumber kebenaran) | `C:\laragon\www\PromptFlow\product-docs\RAG-CONTEXT.md` |
| BRD V1 (base) | `C:\laragon\www\PromptFlow\product-docs\BRD.md` |
| README | `C:\laragon\www\PromptFlow\README.md` |
| GitHub repo | https://github.com/agrianwahab29/promptflow.git |

### Sitasi Kunci dari RAG-CONTEXT.md

| Section | Klaim |
|---|---|
| §1 Ringkasan Temuan | V1 sudah built, 9 tabel DB, 21 endpoint, i18n dwibahasa |
| §8 Analisis Kode V1 | Bukti per file: generate-form, dropzone-uploader, dashboard, prompt-builder |
| §9 Analisis Kebutuhan V2 | 10 item spesifik V2-1 s/d V2-10 dengan sitasi perubahan |
| §11 Gap Analysis | 3 gap kritis (GAP-1: image analysis, GAP-2: upload location, GAP-3: git init) |
| §12 Asumsi V2 | 8 asumsi yang perlu konfirmasi user |

---

**Dokumen ini fokus pada NILAI BISNIS upgrade V2. Spesifikasi teknis detail ada di
SRS, arsitektur di PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA, aturan kode di
CODING_RULES. BRD tidak membangun deliverable akhir.**

**Dibuat oleh:** docgen-brd subagent
**Tanggal:** 2026-06-20
**Versi:** 2.0