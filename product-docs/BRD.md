# BRD.md — PromptFlow Business Requirement Document

> Disusun oleh docgen-brd. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23).
> Klaim faktual bertumpu pada RAG. Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis apa adanya.

---

## 1. Ringkasan Eksekutif

PromptFlow adalah web app Next.js 15 App Router (TypeScript strict) yang **menggenerate paket prompt animasi AI** untuk short-form video / shorts / vertical storytelling. Output tunggal: JSON object `PromptPackage` tervalidasi Zod, di-persist ke DB Turso/libSQL, lalu dapat di-export Markdown (`RAG-CONTEXT.md §1, §4 F1, F16`).

**Business pain inti**: Pipeline generasi LLM mengalami kegagalan berulang ("failed generation"). Dua root cause terverifikasi di repo (`RAG-CONTEXT.md §11`):

- **Bug A — VALIDATION**: field `sfx_list` di `SceneAudioSpecSchema` didefinisikan `z.string()` (`schemas.ts:52`) tetapi prompt tidak menetapkan tipe (`prompt-builder.ts:152`) dan contoh JSON tak pernah mendemokan `sfx` (`prompt-builder.ts:75-97`). Nama field "list" menyiratkan array → LLM kirim `["footstep","door"]` → Zod reject "Expected string, received array". 2/2 attempt gagal.
- **Bug B — JSON_PARSE**: Output panjang (>14KB, `max_tokens:32768`) membuat LLM (ASUMSI MiniMax-M3 via tokenrouter, `RAG §12 G8`) truncate/salah-escape. `repairTruncatedJson` (`llm-client.ts:50-100`) tak handle newline mentah, control char, escape rusak. 2/2 attempt gagal.

**Dampak bisnis**: Generasi gagal = produk tak menghasilkan output = pengguna tak dapat value = **churn risk tinggi + reputasi rusak**. Produk versi 0.1.0 (`package.json:3`) belum siap dipublikasi selama pipeline tak reliable.

**Peluang**: Memperbaiki pipeline generasi + prompt/schema alignment + retry/repair hardening + observability + dokumentasi robust adalah investasi bernilai tinggi: produk reliable = retensi pengguna = landasan monetisasi (saat ini private package, `package.json:4`).

---

## 2. Problem Statement Bisnis

Produk PromptFlow **secara fungsional batal menghasilkan output** pada skenario tutorial panjang (8-15 scene × 8-layer image prompts × audio_specs). Bukti dari analisis code (`RAG-CONTEXT.md §11 Bug A & B`):

1. **Validasi gagal deterministik** — mismatch tipe `sfx_list` (schema string vs LLM output array). Ini bug prompt/schema, buket random. Tiap generate scene dengan `audio_type:'sfx'` berpeluang gagal. Karena prompt ambigu konsisten, retry (`maxRetries=2`, `llm-client.ts:238`) dengan body request sama (`llm-client.ts:274,287`) **kemungkinan besar gagal identik**.

2. **JSON parse gagal pada output panjang** — posisi error 14719 line 246 col 100 mengindikasikan output >14KB. `repairTruncatedJson` tak menangani newline literal di string value, escape sequence rusak, control char, trailing data (`RAG §8.2.2`). Repair gagal → category `JSON_PARSE` → retry.

3. **Hipotesis gabungan A+B** (`RAG §11`): Bug A picu retry, LLM dipaksa regenerasi (temp 0.7) menghasilkan output lebih panjang/tidak stabil → Bug B. Dua bug saling memperkuat → **2/2 attempt fail** = generate gagal total.

**Kuantifikasi (ASUMSI — RAG tak catat angka bisnis)**:
- Tingkat kegagalan generasi aktual: **TIDAK ADA BUKTI** di repo. ASUMSI tinggi karena bug deterministik pada skenario tutorial sfx.
- Jumlah pengguna terdampak: ASUMSI seluruh pengguna yang generate scene dengan audio_type sfx atau output panjang.
- Biaya churn: ASUMSI tinggi karena produk belum punya basis pengguna loyal (v0.1.0 private).
- Frekuensi refund / komplain: ASUMSI — tidak ada log bisnis di repo.

**Efek bisnis konkret**: Pengguna habiskan token LLM (biaya provider, 32768 max_tokens per attempt, 2 attempt = ganda), tunggu hingga 600s timeout (`llm-client.ts:284-289`), lalu dapat error. Project ditandai `failed` (`route.ts:238-264`). **Pengguna tak dapat output = tak ada alasan pakai ulang produk.**

---

## 3. Tujuan & Sasaran Bisnis

| # | Tujuan Bisnis | Sasaran Terukur | Horizon |
|---|---|---|---|
| G1 | Eliminasi kegagalan generasi deterministik | Tingkat sukses generasi **>= 95%** untuk skenario tutorial panjang (8-15 scene) dengan audio_specs sfx | Pasca-fix |
| G2 | Eliminasi kegagalan silent | **Zero silent failure** — seluruh error ter-kategorisasi + ter-log (`generation_logs.status` fail/partial/success, `schema.ts:147-160`) | Pasca-fix |
| G3 | Output AI reliable & tervalidasi | **JSON validation pass rate >= 98%** pada attempt 1; repair success rate >= 90% pada attempt 2 | Pasca-fix |
| G4 | Retensi pengguna | Waktu ke sukses pertama (time-to-first-success) **<= 90s** untuk shorts, **<= 180s** untuk tutorial | Pasca-fix |
| G5 | Reputasi & kepercayaan | NPS **>= 40** setelah fix (ASUMSI baseline tak ada — tidak ada data NPS di repo) | 30 hari pasca-fix |
| G6 | Dokumentasi robust | Seluruh dokumen source-of-truth (`product-docs/*`) konsisten dengan kode & RAG, lulus review lintas-dokumen | Saat docgen selesai |
| G7 | Observability | Setiap generate track: provider, model, durationMs, status, errorMessage, retryCount (ASUMSI — schema `generation_logs` sudah ada, dashboard perlu lengkap) | Pasca-fix |

---

## 4. KPI / Success Criteria

| KPI | Definisi | Target | Sumber data |
|---|---|---|---|
| Generation Success Rate | `(status='success' + status='partial') / total generate` | >= 95% | `generation_logs` (`schema.ts:147-160`) |
| Validation Pass Rate (attempt 1) | `PromptPackageSchema.parse` sukses pada attempt 1 / total attempt | >= 98% | `llm-client.ts:379`, retry counter |
| Repair Success Rate | `repairTruncatedJson` + retry parse sukses / total JSON_PARSE error | >= 90% | `llm-client.ts:364-375` |
| Retry-Recovery Rate | Generate sukses setelah >= 1 retry / total generate yang retry | >= 70% | retry loop `llm-client.ts:279-414` |
| Time-to-First-Success (shorts) | Median detik dari POST hingga event `done` untuk durasi shorts | <= 90s | `generation_logs.durationMs` |
| Time-to-First-Success (tutorial) | Median detik untuk durasi tutorial | <= 180s | `generation_logs.durationMs` |
| Silent Failure Rate | Generate error tanpa kategori / total error | 0% | `categorizeError` (`llm-client.ts:18-44`) |
| User Retention (D7/D30) | Pengguna generate ulang dalam 7/30 hari (ASUMSI — tak ada tracking eksplisit di repo selain Vercel Analytics `events.ts:1-22`) | D7 >= 40%, D30 >= 25% | `@vercel/analytics` + ASUMSI |
| NPS | Net Promoter Score (ASUMSI — tak ada survei di repo) | >= 40 | ASUMSI |
| Cost per Successful Generate | Token cost LLM / generate sukses (ASUMSI — tak ada tracking cost di repo) | Turun vs baseline | ASUMSI |

---

## 5. Stakeholder

| Stakeholder | Kepentingan | Ekspektasi dari BRD ini |
|---|---|---|
| Bos Agrian (Owner) | Produk ship reliable, retensi pengguna, landasan monetisasi | Pipeline generasi stabil >= 95%, dokumen lengkap, keputusan investasi fix jelas |
| End Users (content creator) | Generate paket prompt animasi yang langsung pakai, cepat, tak gagal | Sukses tinggi, output valid, error jelas bila gagal, retry otomatis |
| Developer (tim eksekusi) | Root cause jelas, fix path terdokumentasi, scope terbatas | BRD + SRS + arsitektur menjabarkan Bug A/B fix; tak ada scope creep fitur baru |
| LLM Provider (ollama/openrouter/9router/custom, `schemas.ts:159`) | Kontrak I/O stabil, rate limit tak dilanggar | Prompt deterministik, output valid JSON, retry dengan backoff 2s/4s (`llm-client.ts:409`) |
| Infra (Vercel, Turso) | Resource aman, tak ada runaway cost | maxDuration 300s (`route.ts:19`), rate limit 10 req/min (`middleware.ts:109-127`), DB write aman |
| Reviewer/QA | Kriteria uji terukur | KPI + TEST_PLAN turunan dari KPI di atas |

---

## 6. Justifikasi Bisnis (Mengapa Layak Dikerjakan)

### 6.1 Nilai yang dihasilkan
- **Produk reliable = produk shipable**: Tanpa fix, PromptFlow tak bisa keluar dari status v0.1.0 private. Dengan fix, produk siap preview/beta publik.
- **Hemat biaya LLM**: Saat ini 2/2 attempt gagal = token terbuang (32768 max_tokens × 2). Fix deterministik Bug A mengurangi retry sia-sia.
- **Dokumentasi source-of-truth** (`product-docs/*`) konsisten dengan kode = onboarding cepat, audit siap, handover aman.

### 6.2 Biaya inaction (kalau TIDAK dikerjakan)
- **Churn**: Pengguna gagal generate sekali = besar peluang tak kembali (ASUMSI — tak ada data retensi di repo, `RAG §12 G8/G10`).
- **Refund/chargeback** (kalau monetisasi aktif): Generate gagal setelah bayar = alasan refund valid (ASUMSI — produk masih private, tak ada billing di repo).
- **Reputasi**: Konten creator saling rekomendasi tool. "PromptFlow gagal generate" = review buruk = sulit akuisisi organik (ASUMSI).
- **Beban support**: Tanpa kategori error jelas (`llm-client.ts:18-44`), tim support tak bisa triage. Saat ini error generic "PROVIDER_ERROR" (`route.ts:238-264`) menutup akar masalah.
- **Akumulasi teknis debt**: Bug latent C/D/E/F/G (`RAG §11`) menumpuk → setiap fitur baru memperbesar blast radius.

### 6.3 ROI indikatif (ASUMSI)
- Biaya fix: ASUMSI 1-2 sprint developer (tak ada data effort di repo).
- Return: tiap generate sukses = 1 paket prompt = 1 unit value pengguna. Dengan 95% success vs asumsi baseline <50%, throughput pengguna naik 2x (ASUMSI baseline).
- Break-even: ASUMSI capai pada <100 pengguna aktif bulanan (tak ada data monetisasi).

---

## 7. Risiko Bisnis + Mitigasi

| # | Risiko | Severity | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R1 | LLM output non-deterministik (temp 0.7, `llm-client.ts:271`) menyebabkan hasil tak reproducible | Tinggi | Tinggi | Fix prompt jadi deterministik untuk field kunci (sfx_list, audio_type); turunkan temp untuk retry attempt akhir; snapshot log untuk audit |
| R2 | Provider lock-in (hanya 4 enum `ollama\|openrouter\|9router\|custom`, `schemas.ts:159`) | Sedang | Sedang | Abstraksi `provider-registry.ts` sudah ada; jaga kontrak multi-provider; ASUMSI tokenrouter masuk sebagai `custom` (`RAG §12 G8`) |
| R3 | Schema drift — `SceneAudioSpecSchema` vs `SceneAudioSchema` duplikat inkonsisten (`schemas.ts:39-55` vs `83-99`) | Sedang | Sedang | Konsolidasi schema; dokumen DATABASE_SCHEMA + API_CONTRACT turunan wajib verifikasi konsistensi |
| R4 | JSON malformation pada output panjang (Bug B, `llm-client.ts:50-100`) | Tinggi | Tinggi | Upgrade `repairTruncatedJson` (handle newline/control char/escape), pre-parse sanitizer, attempt `stream:false` + max_tokens lebih besar, instruksi prompt eksplisit escape |
| R5 | Rate limit provider / 10 req/min internal (`middleware.ts:109-127`) | Sedang | Sedang | Backoff 2s/4s (`llm-client.ts:409`); Redis-backed rate limit untuk prod (`middleware.ts:18` comment "prod needs Redis"); queue untuk burst |
| R6 | Cost overrun LLM (32768 max_tokens × retry, `llm-client.ts:270`) | Sedang | Sedang | Track cost per generate (ASUMSI tak ada); cap retry 2; fail-fast pada error deterministik (Bug A) agar tak sia-sia |
| R7 | Data loss / partial persist (`safeDbOp` swallow error, `route.ts:35-51`, Bug D) | Tinggi | Sedang | Transaksi/rollback DB untuk persist scene; status `partial` eksplisit; UI peringatkan data scene hilang; ASUMSI by design saat ini — perlu keputusan bisnis |
| R8 | Timeout 600s (`llm-client.ts:284-289`) / 300s Vercel (`route.ts:19`) mismatch | Sedang | Rendah | Samakan maxDuration; heartbeat 2s (`route.ts:213-220`) sudah ada; pastikan client handle timeout jelas |
| R9 | Kebocoran API key provider | Kritis | Rendah | AES-256-GCM (`aes.ts:4-43`) sudah aktif; audit env `ENCRYPTION_KEY` rotasi; ASUMSI tak ada leak history |
| R10 | Prompt ambigu menyebabkan hallucination field di luar schema | Tinggi | Tinggi | Contoh JSON lengkap (`prompt-builder.ts:75-97`) termasuk `sfx` + `sfx_list` string; schema longgar di LLM, strict di DB (Opsi 2, `RAG §11` rekomendasi) |

---

## 8. Ruang Lingkup Bisnis

### 8.1 In-Scope
- **Pipeline generasi reliable**: fix Bug A (prompt/schema alignment `sfx_list`) + Bug B (`repairTruncatedJson` + pre-parse sanitizer + retry adaptif).
- **Schema/prompt alignment**: konsolidasi `SceneAudioSpecSchema` vs `SceneAudioSchema` (`RAG §6.3, §11 Bug F`); instruksi prompt eksplisit tipe data + contoh `sfx_list` string.
- **Retry/repair hardening**: retry dengan prompt variabel (bukan body identik), backoff adaptif, attempt `stream:false`.
- **Observability**: generation log lengkap (provider, model, durationMs, status, errorMessage, retryCount); dashboard stats (`dashboard.repo.ts`) + log viewer (`log-viewer.tsx`).
- **Error handling bisnis**: kategori error (`llm-client.ts:18-44`) terekspos ke UI dengan pesan yang dapat ditindaklanjuti pengguna.
- **Dokumentasi source-of-truth**: BRD, MRD, PRD, SRS, DATABASE_SCHEMA, PROJECT_ARCHITECTURE, UIUX_SPEC, API_CONTRACT, CODING_RULES, TEST_PLAN, REVIEW_REPORT, AGENTS.md, ExecPrompt — konsisten dengan RAG-CONTEXT.md.
- **Persist reliability**: evaluasi `safeDbOp` (Bug D); keputusan rollback vs partial success; status `partial` ditampilkan jelas.

### 8.2 Out-of-Scope
- Fitur baru tak terkait reliability generasi (mis. template preset baru, integrasi marketplace, payment gateway).
- Migrasi DB engine (Tetap Turso/libSQL — `RAG §2` koreksi: bukan Postgres).
- Ganti framework (Tetap Next.js 15 App Router).
- Model LLM training/fine-tuning sendiri.
- Mobile native app.
- Analytics custom engine (tetap `@vercel/analytics`, `RAG §4 F21`).

---

## 9. Asumsi & Batasan

### Asumsi (diwariskan dari RAG-CONTEXT.md §12)
- **A1**: Provider "tokenrouter" + model "MiniMax-M3" dari log user; tak ada bukti di repo (`RAG G8`). Kemungkinan disimpan sebagai `custom` provider.
- **A2**: Implementasi register memakai `bcrypt.hash` (`RAG G4`, `src/app/api/v1/register/route.ts` tak dibaca).
- **A3**: `authConfig` edge config berisi `pages.signIn` + callbacks + session strategy jwt (`RAG G5`).
- **A4**: Scene audio CRUD endpoint konsisten dengan schema duplikat (`RAG G6`).
- **A5**: Komponen UI generate ada dan fungsional (9 file `.tsx`, isi tak dibaca, `RAG G7`).
- **A6**: Blob helper ada di `src/lib/storage/` (tak diverifikasi, `RAG G9`).
- **A7**: Test coverage eksplisit tak diketahui (`RAG G10`).
- **A8**: Baseline NPS, retention D7/D30, cost per generate, tingkat kegagalan aktual — **TIDAK ADA BUKTI** di repo. Seluruh angka target KPI adalah *aspirasi bisnis*, bukan baseline terverifikasi.
- **A9**: Produk masih private (`package.json:4`), tak ada monetisasi aktif terverifikasi.

### Batasan
- **B1**: DB = Turso/libSQL (SQLite-compatible), bukan Postgres (`RAG §2` koreksi orchestrator). Batasan transaksi/concurrency SQLite berlaku.
- **B2**: maxDuration Vercel 300s (`route.ts:19`) untuk Pro; timeout fetch 600s (`llm-client.ts:284-289`). Mismatch perlu disamakan.
- **B3**: Rate limit in-memory single-instance (`middleware.ts:18-36`), tak scale multi-instance tanpa Redis (comment "prod needs Redis — fase akhir").
- **B4**: Retry tak ubah request body (`llm-client.ts:274,287`) → untuk bug deterministik (Bug A), retry gagal identik. Fix wajib ubah strategi retry.
- **B5**: Versi Next.js eksak "15.5" tak terbukti (`package.json:^15.1.0`, `RAG G1`). Hanya "Next.js 15".
- **B6**: Sumber data bisnis (NPS, retention, cost) tak ada di repo → KPI bisnis sulit baseline-kan tanpa instrumentasi baru (ASUMSI perlu ditambah).

---

## 10. Sitasi (RAG-CONTEXT.md)

| Klaim BRD | Sitasi RAG | Bukti kode |
|---|---|---|
| Identitas produk & stack | `RAG §1`, `RAG §2` | `package.json`, `README.md` |
| Fitur inti generasi | `RAG §4 F1, F16, F18` | `route.ts:53-564`, `prompt-builder.ts`, `export/markdown.template.ts` |
| Alur pipeline generasi | `RAG §5` | `route.ts`, `llm-client.ts:237-424` |
| Bug A root cause | `RAG §6.4`, `RAG §11 Bug A` | `schemas.ts:52`, `prompt-builder.ts:75-97,152` |
| Bug B root cause | `RAG §8.2.2`, `RAG §11 Bug B` | `llm-client.ts:50-100, 279-414, 284-289` |
| Bug latent C-G | `RAG §11 Bug C-G` | `route.ts:35-51`, `schemas.ts:39-55,83-99`, `llm-client.ts:157` |
| Schema duplikat | `RAG §6.3` | `schemas.ts:83-99` |
| Retry tak ubah request | `RAG §8.2.3` | `llm-client.ts:274,287` |
| Data model & tabel | `RAG §9` | `schema.ts:5-201` |
| DB = Turso/libSQL | `RAG §2` (koreksi) | `client.ts:2-13`, `drizzle.config.ts:18` |
| Rate limit middleware | `RAG §3.4`, `RAG §10.4` | `middleware.ts:18-36,109-127` |
| AES-256-GCM key encryption | `RAG §10.3` | `aes.ts:4-43` |
| Generation log status | `RAG §9.8`, `RAG §4 F18` | `schema.ts:147-160` |
| Gaps/ASUMSI | `RAG §12 G1-G20` | — |
| Versi package 0.1.0 private | `RAG §1` | `package.json:3-4` |

---

> Dokumen ini fokus pada BUSINESS VALUE & pain "failed generation". Spesifikasi teknis mendetail (arsitektur fix, skema DB, kontrak API, aturan kode, rencana uji) dijabarkan dokumen turunan: PRD, SRS, DATABASE_SCHEMA, PROJECT_ARCHITECTURE, UIUX_SPEC, API_CONTRACT, CODING_RULES, TEST_PLAN, AGENTS.md.
