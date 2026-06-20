# MRD — Marketing Requirement Document
## PromptFlow V3 — Core Feature Expansion

> **Versi:** 2.0 (V3 Update)
> **Tanggal:** 2026-06-21
> **Status:** Draft untuk review
> **Deliverable:** 5 fitur inti V3 — Light Theme, Scene Transition Flow Engine, Complex Image Prompts, Voiceover Voice Type Spec, Supporting Audio Spec
> **Builds on:** V1 (workflow engine, deployed) + V2 (landing page, in production)
> **Rujukan:** BRD.md v2.0, RAG-CONTEXT.md (refresh 2026-06-21), PRD.md v2.0, UIUX_SPEC.md v3.0

---

## 1. Ringkasan Eksekutif

PromptFlow V3 adalah **ekspansi fitur inti** dari workflow engine prompt animasi AI yang sudah deployed (V1) dan punya landing page konversi-tinggi (V2). V3 menjawab 5 gap yang konsisten muncul dari feedback user V2 selama ±2 minggu pemakaian: gelap paksa (tidak ada light theme), transisi scene "kaget" (jarring cut), prompt image generic 1-baris, voiceover monoton tanpa variasi suara, dan video tanpa audio (zero music/SFX/ambient).

**5 fitur V3 = production-grade upgrade:**

| Fitur | Masalah yang Dijawab | Diferensiasi |
|---|---|---|
| F-V3-01 Light Theme Support | App force dark, user siang/office tidak nyaman | Universal UX, WCAG-friendly |
| F-V3-02 Scene Transition Flow Engine | Scene "kaget" di video output | Metadata transition = no jarring cuts |
| F-V3-03 Complex Image Prompts (8 layer) | Output image generator generic | Structured 8-layer prompt |
| F-V3-04 Voiceover Voice Type Spec | Semua scene satu suara, monoton | 7 voice types + emotion + speed + pitch |
| F-V3-05 Supporting Audio Spec | Video diam, 0 music/SFX/ambient | 5 audio categories per scene |

**Pesan positioning V3:** PromptFlow bergeser dari "AI prompt tool" generik ke **"Production-grade animation prompt engine"**. Output = paket prompt terstruktur siap-pakai untuk downstream AI animation tools (Runway, Pika, Kling) — no re-edit needed.

**Catatan:** MRD ini FOKUS pada V3 (5 fitur baru). Untuk konteks V1/V2 lihat MRD.md v1.0 di repo. Sitasi = BRD.md v2.0 + RAG-CONTEXT.md (refresh 2026-06-21).

---

## 2. Analisis Pasar & Ukuran/Segmen

### 2.1 Market Opportunity V3

V3 menangkap peluang dari **3 gelombang pasar yang konvergen di 2026**: (1) ledakan AI video tools, (2) creator economy maturation, (3) demand akan production-grade output.

| Gelombang Pasar | Bukti Tren | Relevansi ke PromptFlow V3 | Sitasi |
|---|---|---|---|
| AI Video Tools Booming | Runway Gen-4, Pika 2.0, Sora, Kling 2.0, Veo 2 release 2024-2026 | User butuh prompt engine output-ready untuk tool ini | RAG-CONTEXT.md S10.1, S10.2 |
| Creator Economy Maturation | 50+ juta kreator konten Indonesia (BPS 2024, ASUMSI) | Solo creator makin profesional, butuh output production-ready | Trend publik 2024-2026; BRD.md S2.1 |
| Production-Grade Demand | User complain "adegan kaget" = universal pain point | V3 = satu-satunya prompt engine dengan metadata transition+voice+audio structured | BRD.md S6.2; RAG-CONTEXT.md S5.2 |

### 2.2 Ukuran Pasar & Segmen V3

| Segmen | Deskripsi | Estimasi Potensi V3 | Sumber |
|---|---|---|---|
| Kreator konten video pendek AI | Solo creator produksi TikTok/Reels/Shorts pakai AI video gen | BESAR & TUMBUH — V3 = competitive edge di pasar jenuh | BRD.md S2.1; MRD.md v1.0 S1.1 |
| Indie animation studio | Studio kecil 2-10 orang, multi-proyek, character consistency krusial | HIGH-VALUE NICHE — V3 = audio library reusable + team workflow | MRD.md v1.0 S1.1; RAG-CONTEXT.md S2.4 |
| Edukator / tutorial maker | Buat konten edukasi pakai animasi AI, butuh variasi karakter suara | NICHE TAPI STABIL — V3 = child/elderly voice + light theme | MRD.md v1.0 S1.1; BRD.md S5 (Bu Sinta) |
| AI video power user | User sudah pakai Runway/Pika/Kling, butuh prompt berkualitas | EMERGING SEGMENT — V3 = "best prompt for your AI video tool" | ASUMSI — tren AI video 2025-2026 |

### 2.3 Tren Pasar V3

| Tren | Dampak ke PromptFlow V3 | Timing | Sitasi |
|---|---|---|---|
| AI video tools mainstream (Runway, Pika, Sora, Kling) | Permintaan prompt animasi terstruktur melonjak | 2025-2026 | RAG-CONTEXT.md S10.1 |
| Voice design v3 ElevenLabs (child/teen/adult/elderly + emotion) | V3 Voice Type Spec selaras standar industri | 2024+ | RAG-CONTEXT.md S7.2, S10.3 |
| Sound design layering jadi best practice | V3 Audio Spec = first-mover advantage | 2024+ | RAG-CONTEXT.md S8.2, S10.4 |
| Structured prompt formula (Subject+Composition+Camera+Lighting+Style) | V3 Image Prompt 8-layer = industry standard | 2024+ | RAG-CONTEXT.md S6.3, S10.2 |
| Light/dark theme ekspektasi default (a11y) | V3 Light Theme = menghapus friksi user | 2023+ | RAG-CONTEXT.md S9.1, S10.4 |
| Multi-provider LLM standar | V3 retained — fleksibilitas biaya | 2025+ | MRD.md v1.0 S1.2 |

> **ASUMSI (M-V3-01):** Estimasi pasar V3 bersifat kualitatif — belum ada data kuantitatif TAM/SAM/SOM spesifik untuk niche "production-grade AI animation prompt engine".

### 2.4 TAM/SAM/SOM Estimation (ASUMSI Kualitatif)

| Layer | Definisi | Estimasi V3 | Catatan |
|---|---|---|---|
| TAM | Semua kreator + studio + edukator pakai AI animation tools global | 10-50 juta user | ASUMSI — AI video tool market 2025-2026 |
| SAM | User butuh structured prompt engine (bukan chat manual) | 1-5 juta user (subset Midjourney/Runway/Kling users) | ASUMSI |
| SOM | User reachable via channel V3 (SEO, social, community) | 10-50 ribu user (Year 1) | ASUMSI — indie SaaS launch benchmark |

---

## 3. Target Pelanggan / Persona (Updated V3)

### 3.1 Persona Primer & Sekunder (V3 Update)

Persona sama dengan V2, tapi V3 memperjelas **value delivered per persona** dan **pain point spesifik** yang dijawab V3.

| Persona | Segmen | Kebutuhan V3 | Pain Point V2 (Dijawab V3) | Nilai V3 ke Persona |
|---|---|---|---|---|
| Rian (Solo Creator) | Kreator konten pendek AI | Production-ready output, no re-edit | Video "kaget", audio diam, voice monoton | V3 = 1 click → paket prompt transition+voice+audio+image layers |
| Bumi Animasi (Indie Studio) | Studio animasi kecil | Audio library reusable, voice preset per character | Transition/voice tidak konsisten antar episode | V3 = voice preset, transition library, audio spec template |
| Bu Sinta (Edukatator) | Tutorial maker / edukasi | Light theme siang hari, variasi suara karakter | Dark mode silau, suara monoton | V3 = light theme + child/elderly voice |

### 3.2 Persona Detail Cards (V3 Update)

#### Persona 1: Rian (Solo Creator) — PRIMER

| Aspek | Detail | Sitasi |
|---|---|---|
| Nama/Role | Rian, 26 tahun, content creator full-time | MRD.md v1.0 S2.1 |
| Goal V3 | Publish 3-5 video pendek AI per minggu, kualitas production-ready | BRD.md S5 STK-02 |
| Pain V2 | (a) Video output "adegan kaget" harus re-edit (b) Audio diam (c) Voice monoton (d) Dark mode silau | BRD.md S6.1-S6.5 |
| Solusi V3 | Generate paket prompt dengan transition + voice type + audio spec + 8-layer image prompt | BRD.md S6.2-S6.5 |
| Channel | TikTok, YouTube Shorts, Instagram Reels | MRD.md v1.0 S2.1 |
| Trigger Keyword | "AI animation prompt", "Runway prompt", "Kling prompt generator" | Trend SEO 2025-2026 |
| V3 KPI Success | Output re-edit rate <= 30%; publish frequency naik 2x | BRD.md S4 KPI-V3-07 |

#### Persona 2: Bumi Animasi (Indie Studio) — SEKUNDER

| Aspek | Detail | Sitasi |
|---|---|---|
| Nama/Role | Studio indie 5 orang, produksi series animasi pendek | MRD.md v1.0 S2.1 |
| Goal V3 | Konsistensi lintas proyek + efisiensi tim + audio reusable | BRD.md S5 STK-03 |
| Pain V2 | (a) Transition beda tiap scene (b) Voice tidak konsisten antar episode (c) Tidak ada audio spec reusable | BRD.md S6.2, S6.4, S6.5 |
| Solusi V3 | Voice preset per character (save & reuse), transition library, audio spec template | BRD.md S6.4, S6.5 |
| Channel | Behance, LinkedIn, komunitas animator Indonesia | MRD.md v1.0 S2.1 |
| Trigger Keyword | "character consistency AI", "indie animation workflow" | Trend komunitas 2025-2026 |
| V3 KPI Success | Project reuse rate >= 50%; team productivity naik | BRD.md S4 KPI-V3-09 |

#### Persona 3: Bu Sinta (Edukatator) — SEKUNDER

| Aspek | Detail | Sitasi |
|---|---|---|
| Nama/Role | Bu Sinta, 42 tahun, guru SD yang buat konten edukasi YouTube | MRD.md v1.0 S2.1 |
| Goal V3 | Konten edukasi animasi untuk anak-anak, suara karakter varied | BRD.md S5 STK-04 |
| Pain V2 | (a) Dark mode silau (b) Suara anak + bijak monoton (c) Tidak ada musik latar edukatif | BRD.md S6.1, S6.4, S6.5 |
| Solusi V3 | Light theme + child voice + elderly voice + ambient music (forest, classroom) | BRD.md S6.1, S6.4, S6.5 |
| Channel | YouTube Edukasi, komunitas guru, Telegram | MRD.md v1.0 S2.1 |
| Trigger Keyword | "AI animation untuk edukasi", "karakter animasi anak" | Trend 2025-2026 |
| V3 KPI Success | Adoption light theme >= 30%; voice variety >= 40% | BRD.md S4 KPI-V3-01, KPI-V3-05 |

### 3.3 Karakteristik Target (V3)

| Aspek | Detail | Sitasi |
|---|---|---|
| Usia | 18-45 tahun (digital native + profesional muda + edukator) | ASUMSI |
| Lokasi | Indonesia (default) + SEA + global EN | MRD.md v1.0 S2.2 |
| Tech level | Mid — pakai AI tools tapi bukan developer; butuh UI intuitif | MRD.md v1.0 S2.2 |
| Device | 50%+ mobile (light theme V3 = critical untuk mobile siang hari) | RAG-CONTEXT.md S5.3; BRD.md S6.1 |
| Bahasa | Indonesia (utama) + English (sekunder) | MRD.md v1.0 S2.2 |
| Motivasi V3 | Hemat waktu, kualitas production-ready, konsistensi output | BRD.md S3.2 |
| Pain Universal V3 | Output "kaget", audio diam, voice monoton, dark mode silau | BRD.md S2.2 |

---

## 4. Analisis Pesaing / Alternatif (V3 Focus)

### 4.1 Peta Kompetitor (V3 Update)

V3 update peta kompetitor V2 dengan fokus ke **siapa yang punya fitur V3 (transition, image prompt structured, voice type, audio, light theme)**.

| Kompetitor | Tipe | V3 Coverage | Kelebihan | Kelemahan V3 | Diferensiasi PromptFlow V3 |
|---|---|---|---|---|---|
| ChatGPT / Claude (manual) | LLM general-purpose | Tidak ada V3 fitur | Universal, powerful, komunitas besar | Tidak ada workflow terstruktur, output tidak konsisten | V3 = workflow engine + auto-generate 5 metadata + character consistency |
| Midjourney / DALL-E 3 | Image generation prompt | Image layers (via prompt) | Hasil visual langsung | Tidak ada character consistency, tidak ada multi-scene | V3 = 8-layer image prompt + multi-scene + audio + voice + transition |
| Runway Gen-4 | AI video generation | Tidak ada V3 fitur | Generate video langsung | Prompt input masih manual | V3 = upstream prompt engine — feed Runway dengan prompt production-ready |
| Pika 2.0 | AI video generation | Tidak ada V3 fitur | Video generation cepat | Prompt manual | V3 = prompt engine upstream |
| Sora (OpenAI) | AI video generation | Tidak ada V3 fitur | Video HQ, brand besar | Prompt manual | V3 = upstream + multi-provider LLM |
| Kling AI 2.0 | AI video + image generation | Image prompt formula (Subject+Movement+Scene+Cinematic) | Built-in prompt formula | Voice terbatas, tidak ada audio spec, transition basic | V3 = 5 metadata lengkap + portable JSON/MD export |
| ElevenLabs Voice Design v3 | TTS / voice generation | Voice type lengkap (standar industri) | Standar voice type, emotion control | Tool terpisah, tidak integrated | V3 = voice spec integrated dengan scene + image + transition + audio |
| CapCut / Adobe Premiere | Video editor | Tidak ada V3 fitur (post-prod) | Editor video lengkap | Tidak generate prompt | V3 = upstream — generate spec, user finishing di editor |
| Custom GPTs / Templates | Template-based | Tidak ada V3 fitur | Simple, no-code | Rigid, tidak adaptif | V3 = dinamis + character master + 5 metadata auto |
| NovelAI / Sudowrite | AI writing tools | Tidak ada V3 fitur | Story generation terstruktur | Fokus teks, bukan animasi visual | V3 = khusus animasi visual + audio/voice/transition |

> **Sitasi:** RAG-CONTEXT.md S10.1-S10.4 (web research: studiobinder, boords, elevenlabs, kling, budgetpixel, promptsera).

### 4.2 Competitive Landscape V3 — Per-Fitur Coverage Matrix

| Fitur V3 | Runway | Pika | Sora | Kling | Midjourney | ElevenLabs | PromptFlow V3 |
|---|---|---|---|---|---|---|---|
| Scene Transition metadata | Tidak | Tidak | Tidak | Tidak (basic) | N/A | N/A | YA (6 types, 4 fields) |
| Complex Image Prompts (8 layer) | Tidak (manual) | Tidak (manual) | Tidak (manual) | Sebagian (4 layer) | Sebagian (5 layer community) | N/A | YA (8 layer, auto-generated) |
| Voice Type Spec (7 types + emotion) | Tidak | Tidak | Tidak | Sebagian (basic) | N/A | YA (standar industri) | YA (7 types + emotion + speed + pitch) |
| Supporting Audio Spec (5 categories) | Tidak | Tidak | Tidak | Tidak | N/A | Tidak | YA (5 categories per scene) |
| Light Theme Support | YA | YA | YA | YA | YA | YA | YA (V3) |
| Multi-Provider LLM | N/A | N/A | N/A | N/A | N/A | N/A | YA (V1 retained) |
| Character Consistency | Sebagian (manual) | Sebagian (manual) | Sebagian (basic) | Sebagian (basic) | Sebagian (manual) | N/A | YA (V1 — character master) |
| Portable JSON/MD Export | Tidak | Tidak | Tidak | Tidak | Tidak | Tidak | YA (V1 — structured export) |

**Insight:** Tidak ada kompetitor yang punya **5 fitur V3 sekaligus** dalam satu integrated prompt engine. Runway/Pika/Sora fokus ke video generation, ElevenLabs fokus ke TTS, Kling paling dekat tapi voice/audio masih basic. **PromptFlow V3 = unique position sebagai "production-grade prompt engine" upstream dari semua AI video tool.**

### 4.3 Competitive Landscape Summary (V3)

`
            Production-Grade (metadata lengkap)
                  ^
                  |
                  |  PromptFlow V3 ★
                  |  (5 metadata: transition + voice + audio + image + character)
                  |
            Spesialisasi Prompt Automation
                  ^
                  |
                  |  NovelAI/Sudowrite    Kling (basic)
                  |  (text/novel)         (4 layer + video)
                  |
                  |  Custom GPTs          ElevenLabs
                  |  (template rigid)     (voice only)
                  |
                  |  ChatGPT/Claude       Midjourney/DALL-E
                  |  (general)            (image gen)
                  |
                  +-----------------------------------------> Kemudahan Use
                      Kompleks                          Simpel
`

**Posisi V3:** Top-right quadrant — high specialization (animation prompt) + high ease of use (auto-generate 5 metadata, no manual). Unique di pasar.

---

## 5. Positioning + Unique Selling Proposition (V3 Update)

### 5.1 Posisi Pasar V3

**V1/V2:** "Workflow engine pertama yang mengotomasi susun paket prompt animasi AI terstruktur dari input minimal."

**V3 (updated):** **"Production-grade animation prompt engine — output siap-pakai untuk downstream AI animation tools (Runway, Pika, Kling, Sora), no re-edit needed."**

| Dimensi | PromptFlow V1/V2 | PromptFlow V3 | Kompetitor Terdekat |
|---|---|---|---|
| Scope | Multi-scene + character master + export | + 5 metadata (transition, voice, audio, image layers, theme) | Runway (video only), Kling (basic) |
| Input | Minimal (judul + durasi + gaya) | Sama — V3 retained | ChatGPT (manual typing panjang) |
| Output | JSON + Markdown terstruktur | + section transition/voice/audio/image layers per scene | Midjourney (image only) |
| Konsistensi | Character master lintas adegan | + voice preset per character, transition library | Kling (basic character) |
| Provider | Multi-provider LLM | Sama — V3 retained | Terikat 1 provider |
| Audio/Video | Output = prompt only | + audio spec per scene (music/SFX/ambient) | ElevenLabs (voice only), CapCut (post-prod) |
| UX | Dark mode only | + light + system preference | Standard |

### 5.2 Value Proposition Statement V3

> **"Satu judul → paket prompt animasi production-ready. Karakter konsisten, transisi halus, voice variety, audio lengkap, image prompts 8-layer. Multi-provider LLM. Export JSON / Markdown ke tool AI video favorit Anda (Runway, Pika, Kling, Sora)."**

### 5.3 Unique Selling Proposition (USP) — V3 Update

**USP Lama (V1/V2) — masih relevan:**
1. **Character Consistency Engine** — Karakter tetap identik lintas adegan
2. **Multi-Provider Flexibility** — Pilih LLM sesuai budget/kualitas
3. **Structured Export** — JSON + Markdown siap copy
4. **Minimal Input, Maximum Output** — Judul + durasi + gaya = paket lengkap

**USP Baru V3 — added layer:**
5. **Scene Transition Metadata** — 6 transition types x 4 fields (type/duration/easing/direction) = no more jarring cuts. Tidak ada kompetitor prompt engine yang punya ini.
6. **8-Layer Complex Image Prompts** — Subject + Action + Composition + Camera + Lighting + Color + Mood + Style + Technical = 2-3x kualitas output image generator. Standar industri Midjourney/Kling/DALL-E.
7. **7-Typed Voice Spec** — Child/Teen/Adult Male/Adult Female/Elderly Male/Elderly Female/Narrator + emotion + speed + pitch = ElevenLabs Voice Design v3 compatible.
8. **5-Category Audio Spec** — Background music + SFX + Ambient + Music cue + Transition audio = production-ready sound design metadata.
9. **Universal Theme** — Light + Dark + System preference = comfortable di mana saja (kantor, kafe, mobile siang).

### 5.4 Key Value Metrics V3

| Value | V1/V2 Baseline | V3 Target | Impact Marketing | Sitasi |
|---|---|---|---|---|
| Hemat waktu susun prompt | 80% vs manual | 80% (retained) | Efficiency story | MRD.md v1.0 S4.3 |
| Output quality | 1-line prompt (generic) | 8-layer structured (presisi) | Quality story — NEW V3 | BRD.md S6.3 |
| Production readiness | Butuh re-edit manual | No re-edit (production-ready) | Time-to-publish turun 50% — NEW V3 | BRD.md S3.2 (ASUMSI) |
| User comfort | Dark only | Light + dark + system | A11y story — NEW V3 | BRD.md S6.1 |
| Audio coverage | 0% | >= 80% scene | Immersive story — NEW V3 | BRD.md S4 KPI-V3-06 |
| Voice variety | 0% (semua narrator) | >= 40% scene non-narrator | Engagement story — NEW V3 | BRD.md S4 KPI-V3-05 |

### 5.5 Competitive Moat V3

| Moat | V1/V2 | V3 (Added) | Defensibility |
|---|---|---|---|
| First-mover prompt engine | YA | YA | Tinggi — pasar baru |
| Character master lintas adegan | YA | YA | Tinggi — switch cost tinggi |
| Multi-provider LLM | YA | YA | Tinggi — fleksibilitas |
| 5 metadata terstruktur (transition+voice+audio+image+duration) | Tidak | YA | SANGAT TINGGI — tidak ada kompetitor |
| JSON/MD export portable ke Runway/Pika/Kling/Sora | Sebagian | YA (with 5 metadata) | Tinggi — workflow lock-in ringan |
| Voice type spec ElevenLabs-compatible | Tidak | YA | Sedang — standar industri |
| Audio spec layered (5 categories) | Tidak | YA | SANGAT TINGGI — greenfield |
| Light + dark + system theme | Tidak | YA | Rendah — tabel stakes, tapi expected |

---

## 6. Strategi Peluncuran / Distribusi (V3)

### 6.1 V3 Launch Phases (Phased Rollout)

V3 = **staged rollout** dalam 3 fase, agar bisa ukur adoption per fitur dan manage risk. Berbeda dengan V2 (single big launch).

| Phase | Timeline | Fitur | Strategi Marketing | Goal |
|---|---|---|---|---|
| Phase 1: Internal Beta | Minggu 1-2 post-build | All 5 fitur (feature flag) | Internal testing + 10-20 early users | Validate migration, no regression |
| Phase 2: Staged Public | Minggu 3-4 | Light Theme + Image Prompts (low risk) | In-app banner + email blast V2 user | Early adoption metric |
| Phase 3: Full Public Launch | Minggu 5-6 | All 5 fitur | Landing page update + social + ProductHunt-style launch | Public launch + KPI V3 |
| Phase 4: Optimization | Bulan 2-3 post-launch | No new feature | Survey + iteration | KPI report + V4 planning |

### 6.2 Phase 1: Internal Beta (Minggu 1-2)

| Aktivitas | Detail | Goal |
|---|---|---|
| Feature flag all 5 fitur V3 | Hidden behind query param atau role check | Safe rollback |
| Recruit 10-20 beta tester | Founder network, V2 power users, komunitas AI creator | Real feedback loop |
| Daily standup review | Monitor error, migration success, KPI V3 | Fast iteration |
| Survey pre-launch | "Apa yang paling Anda butuhkan dari 5 fitur ini?" | Validate prioritization |

### 6.3 Phase 2: Staged Public Rollout (Minggu 3-4)

**Fitur duluan:** Light Theme + Complex Image Prompts (low risk, high visibility, mudah diadopsi).

| Aktivitas | Detail | Channel |
|---|---|---|
| In-app changelog banner | "5 fitur baru coming soon — 2 sudah tersedia!" | In-app V2 user |
| Email blast V2 user | Subject: "PromptFlow V3 — Light theme + 8-layer image prompts sudah live" | Email existing V2 user |
| Twitter/X announcement | Thread: "We've been listening. V3 = 5 fitur baru. First 2: ..." | Social |
| Landing page teaser | "5 fitur baru coming" badge di hero | Organic |
| Documentation update | Tambah section V3 di docs/help | Self-serve |

**Marketing message Phase 2:**
- **Tagline:** "Your prompt, now production-grade."
- **Sub:** "First 2 of 5 new V3 features: Light theme + 8-layer image prompts."

### 6.4 Phase 3: Full Public Launch (Minggu 5-6)

**All 5 fitur V3 released.** Big launch.

| Aktivitas | Detail | Channel |
|---|---|---|
| Landing page update | Hero, Features Bento, Product Demo = highlight 5 fitur V3 | Website (V2 ke V3) |
| Blog post launch | "Introducing PromptFlow V3: Production-Grade Animation Prompt Engine" | Blog + Medium + dev.to |
| Social media campaign | 5-post series, 1 post per fitur (carousel/thread) | Twitter/X, LinkedIn, Instagram |
| ProductHunt launch | Submit ke ProductHunt | ProductHunt |
| YouTube demo video | 5-10 min walkthrough | YouTube |
| Community share | Discord, Reddit (r/AIvideo), Facebook groups (AI Indonesia) | Community |
| Email V2 user | "V3 sudah live — 5 fitur baru, project tetap aman (auto-migrated)" | Email |

### 6.5 Phase 4: Optimization (Bulan 2-3)

| Aktivitas | Detail | Goal |
|---|---|---|
| In-app survey (NPS V3) | "How likely to recommend PromptFlow V3?" | KPI-V3-10 |
| KPI dashboard review | 10 KPI V3 (theme adoption, transition richness, voice variety, audio coverage) | Measure success |
| User interviews (5-10) | Qualitative feedback V3 | Insight untuk V4 |
| Onboarding iteration | Onboarding tour V3 jika adoption < target | Improve adoption |
| Content marketing | Blog series: "How to use PromptFlow V3 for [use case]" | Long-tail SEO |

### 6.6 V3 Launch Criteria (Marketing Go/No-Go)

| Kriteria | Target | Required? |
|---|---|---|
| Migration V2 ke V3 success rate | >= 95% | WAJIB |
| Light theme no FOUC + no a11y regression | Pass axe-core 0 critical | WAJIB |
| LLM generate 5 metadata consistency | >= 90% per field | WAJIB |
| In-app changelog ready (ID + EN) | Ya | WAJIB |
| Email template ready untuk V2 user | Ya | WAJIB |
| Landing page V3 copy + OG image updated | Ya | WAJIB |
| YouTube demo video published | Ya (within 1 minggu post-launch) | WAJIB |
| Twitter/LinkedIn launch thread drafted | Ya | WAJIB |
| Community post drafted | Ya | WAJIB |
| Support docs (FAQ V3) ready | Ya | WAJIB |

> **Sitasi:** BRD.md S10.2 (Launch Criteria Business Go/No-Go).

---

## 7. Kebutuhan Pasar yang Harus Dipenuhi Produk (V3)

### 7.1 Fitur Wajib (Must-Have V3 dari Perspektif Pasar)

| Kebutuhan Pasar V3 | Fitur PromptFlow V3 | Status | Persona yang Dijawab |
|---|---|---|---|
| Video output tidak "kaget" / jarring | Scene Transition Flow Engine (6 types x 4 fields) | V3 MUST | Rian, Bumi Animasi |
| AI image output presisi sesuai brief (bukan generic) | Complex Image Prompts (8 layer) | V3 MUST | Rian, Bu Sinta |
| Karakter video punya variasi suara (narrator + character voices) | Voiceover Voice Type Spec (7 types + emotion + speed + pitch) | V3 MUST | Rian, Bumi Animasi, Bu Sinta |
| Video tidak diam — ada musik/SFX/ambient | Supporting Audio Spec (5 categories per scene) | V3 MUST | Rian, Bumi Animasi, Bu Sinta |
| User siang/office butuh light theme | Light Theme Support (next-themes + system preference) | V3 MUST | Rian, Bu Sinta (mobile siang) |
| Konsistensi karakter lintas adegan | Character Master | V1 (retained) | Semua |
| Fleksibilitas biaya LLM | Multi-Provider | V1 (retained) | Semua |
| Export ke AI video tool favorit (Runway, Pika, Kling) | JSON + Markdown Export (with 5 metadata) | V1 + V3 enhance | Semua |
| Onboarding jelas untuk fitur baru | In-app changelog + tooltip | V3 MUST | V2 retention |

### 7.2 Ekspektasi Pasar (Nice-to-Have V3)

| Ekspektasi V3 | Implementasi PromptFlow V3 | Prioritas |
|---|---|---|
| Tutorial / demo video per fitur V3 | YouTube short clips 30-60 detik per fitur | Tinggi (post-launch) |
| Template preset audio per scene type (dramatic/comedy/tutorial) | V4 (out of scope V3) | Sedang |
| Negative prompt untuk image generation | V4 (out of scope V3) | Sedang |
| Audio actual file generation (royalty-free music API) | V4 (out of scope V3) | Tinggi (post-validation) |
| Voice actual TTS generation (ElevenLabs integration) | V4 (out of scope V3) | Tinggi (post-validation) |
| Image actual generation (Midjourney/DALL-E integration) | Out of scope — PromptFlow = prompt engine | N/A |
| Video assembly actual (Runway/Pika integration) | Out of scope — PromptFlow = prompt engine | N/A |
| Multi-language UI voice type (EN, Mandarin) | V5 (fokus ID V3) | Rendah |
| Mobile app (iOS/Android) | Web-only V3 | V5 |

> **Sitasi:** BRD.md S7.2 (OOS-V3-01..12).

### 7.3 Gap ke Pasar V3 (Perlu Dikomunikasikan)

| Gap V3 | Dampak Marketing | Mitigasi Marketing |
|---|---|---|
| V3 = spec only, BUKAN audio/voice/image actual generation | User mungkin expect "1 click = video jadi" | Landing copy: "PromptFlow generates production-ready **prompts** for your favorite AI video tool (Runway, Pika, Kling). You bring the engine, we bring the spec." |
| Voice type 7 = basic set, tidak cover semua dialect | Power user mungkin expect more granular | Roadmap transparency: "V3 = 7 voice types. V4 = custom voice cloning + multi-language." |
| Audio spec deskriptif, user harus supply music/SFX sendiri | User mungkin expect "auto music" | Onboarding + link ke Pixabay/Freesound (royalty-free). Future: V4 integrasi. |
| Migration V2 ke V3 mungkin break (edge case) | User takut kehilangan project | Email reassurance: "V2 projects auto-migrated. 100% data retained. Rollback plan ready." |
| LLM generate 5 metadata bisa inkonsisten | User mungkin dapat output tidak lengkap | Schema validation + retry: "Konsistensi dijaga via Zod schema + retry. 90%+ target." |
| Theme light belum tentu langsung adopted | User mungkin tidak notice toggle | Onboarding tooltip V3: "Try light mode for daytime work." |
| 5 fitur sekaligus = overwhelm | User adoption lambat per fitur | Phased rollout (Phase 2: 2 fitur, Phase 3: 5 fitur) |
| Bundle size naik (schema + UI baru) | Performance concern | Lighthouse target >= 85 maintained. Marketing: "Zero compromise on speed." |

### 7.4 Unique Value Proposition per V3 Feature (Marketing Message)

| Fitur V3 | One-liner Marketing | Key Benefit | Persona Target |
|---|---|---|---|
| Light Theme | "Read in any light, work anywhere." | Eye comfort, siang/office/mobile | Rian, Bu Sinta |
| Scene Transition | "No more jarring cuts. Your story flows." | Professional output, no re-edit | Rian, Bumi Animasi |
| Complex Image Prompts | "AI image generators love structure. Give them 8 layers." | 2-3x better image output | Rian, Bu Sinta |
| Voice Type Spec | "Child, teen, adult, elderly, narrator — your characters, their voices." | Voice variety, character depth | Rian, Bumi Animasi, Bu Sinta |
| Supporting Audio | "Music. SFX. Ambient. Cues. Your video, immersive." | 50% production value (audio layer) | Rian, Bumi Animasi, Bu Sinta |

### 7.5 Kebutuhan Pasar yang TIDAK Bisa Dipenuhi V3 (Honest Communication)

V3 jujur tentang scope (no oversell). Trust-building.

| Tidak Bisa (V3) | Alternatif / Workaround |
|---|---|
| Generate actual audio file (music/SFX) | User supply royalty-free dari Pixabay/Freesound (free) |
| Generate actual voice (TTS) | User pakai ElevenLabs / Google TTS manual dengan voice spec dari PromptFlow |
| Generate actual image (Midjourney/DALL-E) | User pakai image generator favorit dengan image prompt dari PromptFlow |
| Generate actual video (Runway/Pika) | User pakai video generator favorit dengan scene spec dari PromptFlow |
| Custom voice cloning | V5 (butuh consent + legal review) |
| Multi-language voice (EN, Mandarin, dll) | V5 — V3 fokus Indonesia |
| Audio waveform preview | V4 — butuh actual audio file dulu |

> **Marketing principle:** Jujur tentang scope = trust. PromptFlow = "prompt engine" yang output portable, bukan "all-in-one AI video generator".

---

## 8. Marketing KPIs V3

### 8.1 KPI Marketing V3 (Additions + Updates)

| KPI ID | Nama KPI | Definisi | Target V3 | Baseline V2 | Cara Ukur | Sitasi |
|---|---|---|---|---|---|---|
| KPI-M-V3-01 | V3 Feature Awareness | % V2 user tahu 5 fitur V3 dalam 7 hari post-launch | >= 80% | N/A | Banner click + email open rate | BRD.md S4 |
| KPI-M-V3-02 | V3 Feature Adoption (30d) | % user aktif pakai minimal 1 fitur V3 dalam 30 hari | >= 60% | N/A | Analytics events V3 | BRD.md S4 KPI-V3-09 |
| KPI-M-V3-03 | Light Theme Adoption | % user pakai light theme minimal 1 sesi | >= 20% | 0% | Analytics theme_change | BRD.md S4 KPI-V3-01 |
| KPI-M-V3-04 | System Theme Respect | % user pakai mode "system" | >= 30% | 0% | Analytics theme_system | BRD.md S4 KPI-V3-02 |
| KPI-M-V3-05 | Output Re-edit Rate | % user download + tidak re-edit di tool lain | <= 30% | N/A | In-app survey | BRD.md S4 KPI-V3-07 |
| KPI-M-V3-06 | V3 NPS Lift | Net Promoter Score V3 vs V2 | +10 points | V2 baseline | In-app survey | BRD.md S4 KPI-V3-10 |
| KPI-M-V3-07 | Migration Success Rate | % user V2 migrasi tanpa data loss | >= 95% | N/A | DB migration logs | BRD.md S4 KPI-V3-08 |
| KPI-M-V3-08 | Launch Email Open Rate | Open rate email "V3 sudah live" | >= 40% | N/A | Email tool | Marketing |
| KPI-M-V3-09 | Launch Social Engagement | Likes + shares + comments di launch post | >= 200 interactions | N/A | Social analytics | Marketing |
| KPI-M-V3-10 | YouTube Demo Views (30d) | Total views V3 demo video dalam 30 hari | >= 1000 | N/A | YouTube analytics | Marketing |
| KPI-M-V3-11 | V3 Landing Page CTR | CTR ke /register dari V3 landing page | >= 5% (vs V2 4%) | 4% | Vercel Analytics | MRD.md v1.0 S6.1 |
| KPI-M-V3-12 | Organic Search Traffic V3 (60d) | Unique visitors dari search post-launch 60 hari | >= 2000 unique | N/A | Vercel Analytics + GSC | Marketing |

### 8.2 KPI V2 yang Berlaku (Tidak Berubah)

| KPI ID | Nama | Target (V2 + V3) | Sitasi |
|---|---|---|---|
| KPI-M-01 | Hero CTA CTR | >= 4% (V3 = 5%) | MRD.md v1.0 S6.1 |
| KPI-M-02 | Sign-up Rate | >= 6% | MRD.md v1.0 S6.1 |
| KPI-M-03 | Bounce Rate | <= 45% | MRD.md v1.0 S6.1 |
| KPI-M-04 | Avg Time on Page | >= 90 detik | MRD.md v1.0 S6.1 |
| KPI-M-05 | Scroll Depth | >= 35% | MRD.md v1.0 S6.1 |
| KPI-M-06 | Lighthouse Performance | >= 85 | MRD.md v1.0 S6.2 |
| KPI-M-07 | LCP | <= 2.5s | MRD.md v1.0 S6.2 |
| KPI-M-08 | CLS | <= 0.1 | MRD.md v1.0 S6.2 |

---

## 9. V3 Marketing Risks & Mitigations

| ID | Risiko Marketing V3 | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| RISK-M-V3-01 | V2 user takut migrasi break project | Tinggi (retention) | Sedang | Email reassurance + migration guarantee + rollback plan + in-app changelog |
| RISK-M-V3-02 | User overwhelmed 5 fitur baru | Sedang (adoption) | Sedang | Phased rollout (2 fitur dulu) + onboarding tour + tooltip per fitur |
| RISK-M-V3-03 | Positioning "production-grade" terlalu jargon | Sedang (conversion) | Rendah | Landing copy simple: "Video Anda jadi lebih halus, lebih hidup, lebih profesional." |
| RISK-M-V3-04 | Kompetitor tambah fitur serupa dalam 6 bulan | Sedang (moat) | Sedang | Speed-to-market + first-mover content + community lock-in |
| RISK-M-V3-05 | LLM inkonsisten generate 5 metadata | Tinggi (KPI) | Sedang | Marketing: "AI-powered with validation. Output dijaga via Zod schema + retry." |
| RISK-M-V3-06 | Light theme adoption rendah | Rendah (feature) | Tinggi | Onboarding prompt: "Try light mode" + landing page showcase |
| RISK-M-V3-07 | Audio spec tanpa actual file = user kecewa | Sedang (adoption) | Tinggi | Marketing jujur: "V3 generates audio SPEC. You supply audio. V4 = audio generation." |
| RISK-M-V3-08 | Voice type 7 terbatas, power user expect lebih | Rendah (feature) | Rendah | Roadmap transparency: "V3 = 7 types. V4 = custom voice cloning." |
| RISK-M-V3-09 | Biaya marketing launch lebih tinggi dari V2 | Sedang (budget) | Rendah | V3 lean: organic + community + in-app. Paid ads hanya post-validation. |
| RISK-M-V3-10 | Negative review di community tentang migration | Tinggi (brand) | Rendah | Pre-mitigation: staging test 100% + fast response team. Post: respond within 24h. |

---

## Lampiran A — V2 ke V3 Marketing Mapping

| V2 (Landing) | V3 (Core Features) |
|---|---|
| 11 section landing | + 5 fitur core di Features Bento + Hero update |
| Konversi visitor | + Retensi user V2 via production-ready output |
| Brand perception: "AI prompt tool" | + Brand perception: "Production-grade animation prompt engine" |
| 0 metadata per scene | + 12+ field metadata per scene (5 fitur V3) |
| 0 audio support | + 5 audio categories |
| Dark only | + Light + system preference |
| Hero CTA CTR KPI | + 12 KPI V3 baru (marketing + business) |
| 4 marketing channels | + 3 channel baru (YouTube demo, ProductHunt, community) |

---

## Lampiran B — V3 Marketing Message Bank

### B.1 Taglines (Pilih Salah untuk Launch)

1. **"Production-grade animation prompts. One title. Five layers of metadata. Zero re-edits."** (recommended)
2. "Your prompt, now production-ready." (short)
3. "From title to fully-detailed animation brief — in seconds." (process-focused)
4. "The animation prompt engine for the AI video era." (category-positioning)
5. "Runway, Pika, Kling, Sora love our prompts." (integrations-led)

### B.2 Per-Fitur One-Liners (Social Carousel / Blog Series)

| Fitur | One-Liner |
|---|---|
| Light Theme | "Read in any light, work anywhere." |
| Scene Transition | "No more jarring cuts. Your story flows." |
| Complex Image Prompts | "AI image generators love structure. Give them 8 layers." |
| Voice Type Spec | "Child, teen, adult, elderly, narrator — your characters, their voices." |
| Supporting Audio | "Music. SFX. Ambient. Cues. Your video, immersive." |

### B.3 Email Subject Lines (V2 User Notification)

| Email | Subject Line |
|---|---|
| Pre-launch teaser | "Coming soon: 5 new features in PromptFlow" |
| Phase 2 launch (Light + Image) | "Your prompt, now production-ready" |
| Phase 3 full launch | "Introducing PromptFlow V3: 5 new features for production-grade animation" |
| Migration complete | "Your V2 projects are safe — V3 migration complete" |

### B.4 Twitter/X Launch Thread (5 Tweets)

1. "We've been listening. After 2 weeks of V2 feedback, you told us: 'Video adegan kaget', 'audio diam', 'voice monoton', 'dark mode silau'. Today, V3 fixes all that. 5 new features. Thread"
2. "1/5: Light Theme. No more eye strain. Work in any light — office, cafe, mobile siang hari. System preference respected."
3. "2/5: Scene Transition Flow Engine. 6 transition types x 4 fields. No more jarring cuts. Your story flows."
4. "3/5: Complex Image Prompts (8 layers). Subject + Composition + Camera + Lighting + Color + Mood + Style + Technical."
5. "4/5: Voice Type Spec. 7 voices (child/teen/adult M+F/elderly M+F/narrator) + emotion + speed + pitch."
6. "5/5: Supporting Audio Spec. 5 categories (music + SFX + ambient + cue + transition). Production-ready sound design."
7. "V3 is live now. V2 projects auto-migrated (zero data loss). Try it: [link]"

---

## Lampiran C — V3 Marketing Assumptions

| ID | Asumsi | Alasan | Dampak bila Salah |
|---|---|---|---|
| ASM-M-V3-01 | Estimasi pasar kualitatif — TAM/SAM/SOM angka longgar | Belum ada data kuantitatif primer | Strategi pricing/positioning bisa miss |
| ASM-M-V3-02 | Kompetitor tidak tambah fitur serupa dalam 6 bulan | First-mover window 6-12 bulan | Kehilangan first-mover advantage |
| ASM-M-V3-03 | User V2 mau update project dengan V3 metadata | 5 fitur additive, tidak break | Churn ke kompetitor |
| ASM-M-V3-04 | Email channel V2 user efektif untuk announce V3 | Existing V2 user engaged | Reach rendah |
| ASM-M-V3-05 | Persona Indonesia dominan (70%+ user) | Brand + persona V2 fokus ID | Pasar EN kurang terlayani |
| ASM-M-V3-06 | "Production-grade" positioning resonates dengan target | Pain point universal | Positioning perlu iterate |
| ASM-M-V3-07 | Phased rollout lebih baik dari big bang | Mengurangi overwhelm | User bingung "kapan fitur X available?" |
| ASM-M-V3-08 | Light theme adoption >= 20% dalam 30 hari | User siang/office subset | Adoption lebih rendah |
| ASM-M-V3-09 | 8-layer image prompt = upgrade kualitas terlihat | Standar industri | User tidak notice perbedaan |
| ASM-M-V3-10 | 7 voice type cukup untuk MVP pasar Indonesia | Cover 80% use case | V4 perlu extend |

---

## Lampiran D — Referensi Dokumen

| Dokumen | Path | Peran |
|---|---|---|
| RAG-CONTEXT (refresh) | product-docs/RAG-CONTEXT.md | Sumber fakta V3 (606 baris) |
| BRD V3 | product-docs/BRD.md v2.0 | Konteks bisnis V3 (5 fitur, KPI, scope) |
| MRD V2 (Landing) | product-docs/MRD.md v1.0 | Konteks V1+V2 (persona, positioning, GTM) |
| PRD V3 (akan datang) | product-docs/PRD.md v2.0 | FR-17..FR-21 untuk 5 fitur V3 |
| SRS V3 (akan datang) | product-docs/SRS.md v2.0 | Tech spec V3 |
| UIUX_SPEC V3 (akan datang) | product-docs/UIUX_SPEC.md v3.0 | UI V3 |
| API_CONTRACT V3 (akan datang) | product-docs/API_CONTRACT.md | API V3 |
| DATABASE_SCHEMA V3 (akan datang) | product-docs/DATABASE_SCHEMA.md | Schema V3 |
| PROJECT_ARCHITECTURE V3 (akan datang) | product-docs/PROJECT_ARCHITECTURE.md | Arsitektur V3 |
| CODING_RULES | product-docs/CODING_RULES.md | Standar koding (berlaku V3) |
| REVIEW_REPORT V2 | product-docs/REVIEW_REPORT.md | Quality gate V2 |

---

> **Dokumen ini = panduan marketing V3 untuk 5 fitur inti PromptFlow. Eksekutor marketing wajib baca MRD ini + BRD V3 + RAG-CONTEXT. Klaim tanpa bukti = ASUMSI (ditandai eksplisit).**

**Dibuat oleh:** docgen-mrd subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Update)
