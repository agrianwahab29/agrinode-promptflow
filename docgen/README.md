# Pipeline docgen

Generator paket dokumen produk dari **satu prompt user**. Satu orchestrator
mengkoordinasi 14 subagent berlapis untuk membangun dokumen requirement, teknis,
QA, review, panduan build, dan prompt eksekusi final.

Semua output disimpan di `<root>\product-docs\` di dalam direktori proyek user,
bukan di folder config opencode.

---

## Arsitektur Lapisan (urutan eksekusi)

```
L0  docgen-rag            RAG-CONTEXT.md        pre-fetch fakta (anti-halusinasi)
│
L1  docgen-orchestrator   (koordinator)         analisis + koordinasi + validasi
│
L2  docgen-brd            BRD.md                WHY  - nilai bisnis
    docgen-mrd            MRD.md                WHO  - pasar & persona
    docgen-prd            PRD.md                WHAT - fitur & produk
    docgen-srs            SRS.md                HOW  - spesifikasi teknis
│                                           ── semua deliverable ──
L3  docgen-dbschema       DATABASE_SCHEMA.md        ┐
    docgen-architecture   PROJECT_ARCHITECTURE.md   │  HANYA bila
    docgen-uiux           UIUX_SPEC.md              │  deliverable
                            (bila ada UI)           │  = SOFTWARE
    docgen-api-spec       API_CONTRACT.md           │
                            (bila ada API milik     │
                             proyek)                │
    docgen-coding-rules   CODING_RULES.md           ┘
│                                           ── software only ──
L4  docgen-test-plan      TEST_PLAN.md          QA & test plan (software only)
│
L5  docgen-reviewer       REVIEW_REPORT.md      gerbang kualitas lintas dokumen
│                                           ── semua deliverable ──
L6  docgen-agentsmd       AGENTS.md             panduan build untuk agent eksekutor
│
L7  docgen-exec-prompt    EXECUTION-PROMPT.md   prompt siap-tempel untuk build
```

Subagent dipanggil via tool `task` dengan `subagent_type` = nama agent.

---

## Daftar Agent

| Agent | File | Output | Lapisan | Kondisi |
|---|---|---|---|---|
| docgen-rag | docgen-rag.md | RAG-CONTEXT.md | L0 | Selalu (paling awal) |
| docgen-orchestrator | docgen-orchestrator.md | - | L1 | Primary (entry point user) |
| docgen-brd | docgen-brd.md | BRD.md | L2 | Selalu |
| docgen-mrd | docgen-mrd.md | MRD.md | L2 | Selalu |
| docgen-prd | docgen-prd.md | PRD.md | L2 | Selalu |
| docgen-srs | docgen-srs.md | SRS.md | L2 | Selalu |
| docgen-dbschema | docgen-dbschema.md | DATABASE_SCHEMA.md | L3 | Software + ada data persisten |
| docgen-architecture | docgen-architecture.md | PROJECT_ARCHITECTURE.md | L3 | Software |
| docgen-uiux | docgen-uiux.md | UIUX_SPEC.md | L3 | Software + ada UI/frontend |
| docgen-api-spec | docgen-api-spec.md | API_CONTRACT.md | L3 | Software + ada API milik proyek |
| docgen-coding-rules | docgen-coding-rules.md | CODING_RULES.md | L3 | Software |
| docgen-test-plan | docgen-test-plan.md | TEST_PLAN.md | L4 | Software |
| docgen-reviewer | docgen-reviewer.md | REVIEW_REPORT.md | L5 | Selalu (sebelum AGENTS.md) |
| docgen-agentsmd | docgen-agentsmd.md | AGENTS.md | L6 | Selalu |
| docgen-exec-prompt | docgen-exec-prompt.md | EXECUTION-PROMPT.md | L7 | Selalu |

---

## Klasifikasi Deliverable

Orchestrator menentukan jenis deliverable dari prompt user di Langkah 1:

- **SOFTWARE**: aplikasi web/mobile/desktop, API/backend, sistem, website
  dinamis, CLI/tool, apa pun yang butuh kode + (biasanya) penyimpanan data.
  → Bangun Lapisan 3, 4.
- **DOKUMEN/STATIS**: manual book, docx, PDF, poster, slide, laporan, konten
  tulisan, desain statis tanpa kode.
  → Lewati Lapisan 3 & 4 seluruhnya.
- Ragu/campuran → perlakukan sebagai SOFTWARE, catat asumsi.

### Conditional di dalam SOFTWARE
- **DATABASE_SCHEMA**: lewati bila software tanpa data persisten (mis. kalkulator
  statis). Catat alasan.
- **UIUX_SPEC**: bangun HANYA bila software punya UI/frontend (web, mobile,
  desktop ber-GUI). Lewati bila tanpa UI (backend API-only, CLI, job/cron,
  worker, library). Catat alasan.
- **API_CONTRACT**: bangun HANYA bila software punya API milik proyek sendiri
  (backend, API service, microservice, fullstack, integrasi pihak ketiga). Lewati
  bila hanya konsumsi API eksternal di luar deliverable (mis. CLI murni, desktop
  offline). Catat alasan.

---

## Gerbang Kualitas (Lapisan 5)

`docgen-reviewer` memvalidasi SEMUA dokumen konten **sebelum** AGENTS.md dibangun.
Tidak mengubah dokumen produk (pemilik perbaikan = subagent pembuatnya), hanya
melapor ke `REVIEW_REPORT.md`.

### Format ID Temuan (standar presisi)
Setiap temuan punya ID wajib:
- `CRIT-001`, `CRIT-002`, ... — CRITICAL
- `WARN-001`, `WARN-002`, ... — WARNING
- `INFO-001`, `INFO-002`, ... — INFO

Orchestrator memakai ID ini saat oper rekomendasi perbaikan ke subagent (sebut
ID + dokumen + bagian). Presisi, tak ambigu. Saat re-review, temuan yang
sudah diperbaiki ditandai "RESOLVED di siklus N".

### Klasifikasi Temuan
- **CRITICAL**: dokumen hilang, fitur tak terrealisasi, konflik teknis, klaim
  karangan, constraint user tidak tercakup → WAJIB perbaiki sebelum lanjut.
  Loop: panggil ulang subagent terkait (oper ID temuan + rekomendasi spesifik
  dari REVIEW_REPORT) → panggil reviewer lagi untuk verifikasi. Tujuan
  CRITICAL = 0.
- **WARNING**: ambiguitas, asumsi tak tertandai, inkonsistensi ringan → boleh
  lanjut, dicatat di laporan akhir.
- **INFO**: saran peningkatan kualitas, tidak menghalangi.

### Escape Hatch (cegah infinite loop)
Batas maksimum **3 siklus** review-perbaikan. Bila setelah 3 siklus CRITICAL
masih belum 0:
- STOP. Jangan lanjut review loop.
- Eskalasi ke user: laporkan CRITICAL tersisa (ID + dokumen + alasan tak
  teratasi).
- Minta keputusan user: perbaiki manual / terima sebagai WARNING / ubah scope.
- Catat keputusan user di laporan akhir.

Cakupan pemeriksaan: kelengkapan, grounding RAG (sitasi), traceability
(BRD→MRD→PRD→SRS→DB→UI→API→Test), konsistensi teknis, konflik/ambigu, struktur,
constraint user.

---

## Cara Pakai

1. User beri spesifikasi deliverable (mis. "buatkan PRD + dokumen untuk aplikasi
   inventaris buku di `C:\laragon\www\inventaris-buku`").
2. Panggil **docgen-orchestrator** (mode `primary`, entry point untuk user).
3. Orchestrator kerjakan otonom sampai 100%:
   - tentukan direktori → RAG pre-fetch → dokumen requirement → dokumen teknis
     (bila software) → QA (bila software) → review → AGENTS.md → prompt final.
4. Kirim SATU laporan akhir: daftar file + path absolut, ringkasan tiap dokumen,
   status review, asumsi, status validasi, blok Prompt Eksekusi Final.

Orchestrator **tidak** membangun deliverable akhir (docx/aplikasi/dll). Tugasnya
hanya dokumen + review + panduan + prompt. Deliverable akhir dibangun oleh agent
eksekutor terpisah memakai AGENTS.md + Prompt Eksekusi Final.

---

## Output di `<root>\product-docs\`

| Output | Selalu | Software | Software + UI | Software + API |
|---|:---:|:---:|:---:|:---:|
| RAG-CONTEXT.md | ✅ | ✅ | ✅ | ✅ |
| BRD.md, MRD.md, PRD.md, SRS.md | ✅ | ✅ | ✅ | ✅ |
| DATABASE_SCHEMA.md | - | ✅* | ✅* | ✅ |
| PROJECT_ARCHITECTURE.md | - | ✅ | ✅ | ✅ |
| UIUX_SPEC.md | - | - | ✅ | ✅ |
| API_CONTRACT.md | - | - | - | ✅ |
| CODING_RULES.md | - | ✅ | ✅ | ✅ |
| TEST_PLAN.md | - | ✅ | ✅ | ✅ |
| REVIEW_REPORT.md | ✅ | ✅ | ✅ | ✅ |
| AGENTS.md | ✅ | ✅ | ✅ | ✅ |
| EXECUTION-PROMPT.md | ✅ | ✅ | ✅ | ✅ |

\* dilewati bila software tanpa data persisten (catat alasan).

---

## Konvensi Folder

- **Bahasa**: semua dokumen & komunikasi dalam Bahasa Indonesia. Identifier
  teknis apa adanya.
- **Path**: selalu absolut. Semua file di direktori proyek user.
- **Penulisan file**: via tool `bash` (PowerShell) here-string single-quote
  `@''...''@` + `Set-Content -LiteralPath`, sekali tulis. Jangan pakai tool
  `write` untuk konten panjang (gagal "Unterminated string"). Verifikasi
  `Test-Path` setelah tulis. Detail ada di tiap file agent bagian "Metode
  Penulisan File".
- **Grounding**: fakta penting WAJIB bersitasi dari RAG-CONTEXT.md. Tanpa bukti
  → "TIDAK ADA BUKTI" atau "ASUMSI". Jangan mengarang.
- **Peran**: tiap subagent hanya tulis 1 file miliknya; reviewer hanya baca+lapor
  (tanpa tool `edit`); orchestrator tidak bangun deliverable akhir.
- **Bukan bagian sistem EO**: jangan panggil agent EO.
