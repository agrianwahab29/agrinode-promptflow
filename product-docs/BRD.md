# BRD — Business Requirement Document
## PromptFlow V3 — Core Feature Expansion

> **Versi:** 2.0 (V3 Update)
> **Tanggal:** 2026-06-21
> **Pemilik:** Product Owner PromptFlow
> **Status:** Draft untuk review
> **Deliverable:** 5 fitur inti V3 — Light Theme, Scene Transition Flow Engine, Complex Image Prompts, Voiceover Voice Type Spec, Supporting Audio Spec
> **Builds on:** V1 (workflow engine, deployed) + V2 (landing page redesign, in production)
> **Rujukan kebenaran:** `product-docs/RAG-CONTEXT.md` (sumber fakta, refresh 2026-06-21)

---

## 1. Ringkasan Eksekutif

PromptFlow saat ini (V1) adalah **workflow engine otomasi prompt animasi AI** yang sudah deployed di Vercel + GitHub. V2 sudah menambahkan landing page konversi-tinggi. Setelah V2 live dan user mulai memakai V1 untuk generate animation videos, **5 gap teridentifikasi** yang menghambat kualitas output animasi AI dan kualitas UX PromptFlow secara keseluruhan.

**Inisiatif V3:** Menambahkan 5 fitur inti yang menjawab gap tersebut — dari level surface (UI theme) sampai level output (rich metadata audio/transition/voice). Kelimanya dipromosikan dari backlog ke **MUST** untuk V3.

**Nilai bisnis V3:**
- **Output quality naik signifikan** — prompt AI yang terstruktur (composition, lighting, camera, voice type, audio cue) = input lebih kaya untuk downstream AI animation tools = hasil video lebih koheren.
- **"Adegannya tidak kaget" lagi** — scene transition metadata = video assembly lebih halus, no more jarring cuts.
- **Audio layer lengkap** — V1 nol audio, V3 = music + SFX + ambient + transition audio = produksi video lebih imersif.
- **UX universal** — light theme support untuk user yang lebih suka baca di siang hari atau butuh share screenshot.
- **Diferensiasi kompetitif** — fitur-fitur ini tidak ada di kompetitor prompt generik, posisi PromptFlow = "production-grade animation prompt engine".

**Catatan penting:** BRD ini FOKUS pada V3 (5 fitur baru). Untuk konteks V1/V2 lihat `BRD.md v1.0` di repo.

---

## 2. Latar Belakang Bisnis dan Masalah

### 2.1 Konteks V3

User sudah memakai PromptFlow V1+V2 selama ±2 minggu untuk generate animation videos. Feedback real-user menghasilkan 5 gap yang konsisten. RAG-CONTEXT.md (refresh 2026-06-21) memverifikasi semua gap via bukti kode.

| Aspect | Status V2 | Gap yang Ditemukan User |
|---|---|---|
| Theme | Dark mode only (hardcoded) | User siang hari silau, susah baca di kantor |
| Scene assembly | Scenes flat list, no transition | Video output "adegan kaget" — jarring |
| Image prompts | Single string 1-baris | Prompt kurang detail → output AI generic |
| Voiceover | Plain text, no voice spec | Semua scene pakai suara sama, tidak ada variasi |
| Audio | ZERO | Video diam, tidak ada musik/SFX/ambient |

### 2.2 Masalah Bisnis V3

| ID | Masalah | Dampak Bisnis | Bukti Kode |
|---|---|---|---|
| BIZ-V3-P01 | App force dark mode — user siang hari tidak nyaman | Bounce naik, user kerja kantor tidak betah | `layout.tsx:66` hardcoded `dark`; `page.tsx:24` wrap div className dark |
| BIZ-V3-P02 | Scene transition tidak ada metadata | Output video "jarring" — user harus re-edit manual di tool lain | `schema.ts:89-99` scenes table tanpa transition fields |
| BIZ-V3-P03 | Image prompt basic 1-baris | Output AI image generic, tidak sesuai brief | `prompt-builder.ts:35-36` contoh prompt 1 baris |
| BIZ-V3-P04 | Voiceover tanpa voice type | Semua scene satu suara, tidak dramatis | `schema.ts:94` voiceoverScript plain string |
| BIZ-V3-P05 | Audio ZERO di seluruh codebase | Video tanpa music/SFX = tidak profesional | `schema.ts` tidak ada audio field sama sekali |

### 2.3 Bukti Kode dari RAG-CONTEXT

| Gap | Bukti | Status |
|---|---|---|
| Theme | `globals.css:4-28` light tokens SUDAH ADA, tapi app force dark | 30% ready — tinggal toggle |
| Transition | `scenes` table: orderNo, description, voiceoverScript only | 0% ready — greenfield |
| Image prompts | `promptText` = single string, prompt tidak ada instruksi struktur | 20% ready — perlu enhance prompt |
| Voice type | `voiceoverScript` = plain string, prompt tidak ada voice spec | 0% ready — greenfield |
| Audio | TIDAK ADA di schema, prompt, UI, export | 0% ready — greenfield |

---

## 3. Peluang dan Justifikasi Nilai

### 3.1 Peluang V3

| ID | Peluang | Sumber |
|---|---|---|
| OPP-V3-01 | Light theme CSS tokens sudah ada — tinggal toggle + remove hardcoded class. Effort minimal, impact UX universal | RAG-CONTEXT S9.1, S9.3 |
| OPP-V3-02 | Best practice transition types (cut, dissolve, fade, wipe, match cut) sudah mapan di industri film | RAG-CONTEXT S5.3, S10.1 |
| OPP-V3-03 | Structured prompt formula (Subject + Composition + Camera + Lighting + Style) = standard untuk Kling, Midjourney, DALL-E 3 | RAG-CONTEXT S6.3, S10.2 |
| OPP-V3-04 | Voice design v3 (ElevenLabs standard) = child/male/female/elderly + emotion + speed + pitch | RAG-CONTEXT S7.2, S10.3 |
| OPP-V3-05 | Sound design layer (music + SFX + ambient + transition audio) = standar audio production | RAG-CONTEXT S8.2, S10.4 |
| OPP-V3-06 | Semua 5 fitur bisa di-roll-out dalam 1 schema migration (Drizzle additive) + 1 prompt builder update | RAG-CONTEXT S11.3, ASM-6 |
| OPP-V3-07 | User V2 sudah live dan engaged — V3 = natural extension, tidak perlu akuisisi user baru | RAG-CONTEXT S1 |

### 3.2 Justifikasi Nilai Bisnis V3

| Lever | Baseline V1/V2 | Target V3 | Impact Bisnis |
|---|---|---|---|
| Output video quality | "Adegannya kaget", audio diam | Halus, ada musik, variasi suara | User lebih puas, retention naik |
| Production readiness | Butuh re-edit di tool lain (CapCut, Premiere) | Output siap-pakai untuk downstream AI animation | Time-to-publish turun 50% (ASUMSI) |
| User comfort (theme) | Hanya dark mode | Light + dark + system preference | User siang/office lebih betah, bounce turun |
| Competitive positioning | "AI prompt tool generik" | "Production-grade animation prompt engine" | Diferensiasi jelas, harga/value naik |
| Data richness per scene | 3 field (order, desc, voiceover) | 12+ field (transition, voice, audio, dll) | Downstream AI tools dapat context lebih kaya |

---

## 4. Tujuan Bisnis dan KPI Terukur

### 4.1 Tujuan Bisnis V3 (Updated)

| ID | Tujuan | Horizon | Owner |
|---|---|---|---|
| OBJ-V3-01 | Output animation video PromptFlow production-ready (no re-edit needed) | Launch V3 | Product Owner |
| OBJ-V3-02 | Meningkatkan user retention 30 hari (V2 baseline → +20%) | 60 hari post-launch | Product Owner |
| OBJ-V3-03 | Menambah competitive moat — 5 fitur ini tidak ada di kompetitor generik | Launch V3 | Product Owner |
| OBJ-V3-04 | Universal UX — light + dark theme support | Launch V3 | Frontend Lead |
| OBJ-V3-05 | Memperkaya metadata per scene untuk downstream AI tools | Launch V3 | AI Engineer |

### 4.2 KPI Terukur V3 (Additions + Updates)

#### KPI Baru V3

| KPI ID | Nama KPI | Definisi | Target | Baseline | Cara Ukur |
|---|---|---|---|---|---|
| KPI-V3-01 | Light Theme Adoption | % user yang pakai light theme minimal 1 sesi | >= 20% | 0% (V2 tidak ada) | Analytics event `theme_change` |
| KPI-V3-02 | System Theme Respect | % user yang pakai mode "system" | >= 30% | 0% | Analytics event `theme_system` |
| KPI-V3-03 | Scene Transition Richness | Rata-rata field transition terisi per scene | >= 4 dari 4 field | 0 dari 4 | DB query `scenes.transitionType IS NOT NULL` |
| KPI-V3-04 | Image Prompt Structured Score | Rata-rata jumlah layer (composition/lighting/camera/style) per prompt | >= 6 dari 8 | ~3 (ASUMSI) | Heuristic count di prompt text |
| KPI-V3-05 | Voice Type Variety | % scene dengan voiceType selain `narrator` | >= 40% | 0% | DB query `scenes.voiceType` distribution |
| KPI-V3-06 | Audio Coverage per Scene | % scene dengan minimal 1 audio cue (music/SFX/ambient) | >= 80% | 0% | DB query `scene_audio` count |
| KPI-V3-07 | Output Re-edit Rate | % user yang download + tidak re-edit di tool lain (post-launch survey) | <= 30% | N/A | In-app survey (ASUMSI) |
| KPI-V3-08 | Migration Success Rate | % user V2 yang berhasil migrasi project V2 → V3 tanpa data loss | >= 95% | N/A | DB migration logs |
| KPI-V3-09 | V3 Feature Usage (30d) | % user aktif yang pakai minimal 1 fitur V3 | >= 60% | N/A | Analytics events |
| KPI-V3-10 | V3 NPS Lift | Net Promoter Score V3 vs V2 | +10 points | V2 baseline | In-app survey |

#### KPI V2 yang Berlaku (Tidak Berubah)

| KPI ID | Nama | Target (V2 + V3) |
|---|---|---|
| KPI-01 | Hero CTA CTR | >= 4% |
| KPI-02 | Sign-up Rate | >= 6% |
| KPI-08 | Lighthouse Performance | >= 85 |
| KPI-09 | LCP | <= 2.5s |
| KPI-10 | CLS | <= 0.1 |

---

## 5. Stakeholder dan Kepentingan V3 (Updated)

| ID | Stakeholder | Peran | Kepentingan V3 | Tingkat |
|---|---|---|---|---|
| STK-01 | Founder / Product Owner PromptFlow | Penanggung jawab produk | Validasi 5 fitur V3, sign-off migrasi | Tinggi |
| STK-02 | User Persona "Rian" (Solo Creator) | Target user primer | Video production-ready, tidak re-edit | Tinggi (user) |
| STK-03 | User Persona "Bumi Animasi" (Indie Studio) | Target user sekunder | Audio library reusable, team workflow | Tinggi (user) |
| STK-04 | User Persona "Bu Sinta" (Edukatator) | Target user sekunder | Light theme untuk siang hari, variasi suara karakter | Sedang (user) |
| STK-05 | Frontend Developer | Eksekutor build light theme + UI audio/transition | next-themes integration, design tokens consistency | Tinggi |
| STK-06 | Backend / AI Engineer | Eksekutor schema + prompt builder | Drizzle migration, prompt restructure, Zod schema extension | Tinggi |
| STK-07 | Designer / UI/UX | Pengawas visual | Light theme palette, audio spec UI, transition visualizer | Tinggi |
| STK-08 | Marketing / Growth | Acquisition channel | Update landing copy: highlight 5 fitur baru | Sedang |
| STK-09 | Existing V2 User Base | Early adopter V3 | Migrasi mulus, tidak kehilangan project | Tinggi (retention risk) |
| STK-10 | End Visitor (Anonymous) | Target konversi V3 | Landing page reflects 5 fitur baru (post-launch) | Sedang |

---

## 6. V3 New Features — Business Detail per Fitur

### 6.1 F-V3-01: Light Theme Support

#### Latar Belakang
Saat ini app force dark mode (`layout.tsx:66` hardcoded `className="dark"`, `page.tsx:24` wrap div className dark). Light theme CSS tokens SUDAH ADA di `globals.css:4-28` tapi tidak pernah dipakai. User siang/office tidak nyaman dengan dark mode.

#### Business Case
- **User comfort universal** — 50%+ user pakai device di tempat terang (kantor, kafe, siang hari). Light theme = baca lebih nyaman, screenshot lebih jelas saat share.
- **A11y benefit** — beberapa user low-vision lebih nyaman dengan light mode untuk teks panjang.
- **Effort minimal** — 70% infrastruktur sudah ada. Tinggal install `next-themes` (1 paket) + remove hardcoded class + add toggle component.
- **Brand flexibility** — bisa highlight brand violet `#7c3aed` di light mode yang lebih vibrant.

#### Business Goals
- OBJ-V3-04: Universal UX — light + dark + system preference
- KPI-V3-01: Light theme adoption >= 20%
- KPI-V3-02: System theme respect >= 30%

#### Success Criteria
- User bisa toggle light/dark/system dari app header
- Pilihan persist di localStorage
- System preference detected otomatis (prefers-color-scheme)
- Tidak ada FOUC (flash of unstyled content) saat load
- Semua shadcn/ui component render sempurna di light mode

#### Asumsi
- ASM-1: Pakai `next-themes` package (zero-config dengan shadcn/ui, sudah standar)
- ASM-B-V3-1: Light theme = default light (background putih), bukan inverted dark

#### Risiko Bisnis
- RISK-V3-01: FOUC saat first load — mitigasi: next-themes handle via blocking script
- RISK-V3-02: Beberapa component hardcoded `dark:` Tailwind variant — mitigasi: replace dengan semantic tokens
- RISK-V3-03: Kontras warna brand violet `#7c3aed` di light mode perlu validasi WCAG AA — mitigasi: gunakan `primary` token, test kontras

---

### 6.2 F-V3-02: Scene Transition Flow Engine

#### Latar Belakang
Saat ini `scenes` table (`schema.ts:89-99`) hanya punya `orderNo`, `description`, `voiceoverScript`. Tidak ada transition metadata. Hasil video dari PromptFlow: scene berubah "kaget" (jarring cut), user harus re-edit di CapCut/Premiere untuk tambah transition. Zod schema `SceneSchema` (`schemas.ts:27-32`) rigid, tidak ada extension point.

#### Business Case
- **Output quality naik drastis** — transition metadata = downstream AI video tools (Runway, Pika, Kling) bisa render transisi yang sesuai konteks naratif.
- **Diferensiasi kuat** — kompetitor prompt generik tidak punya ini. PromptFlow = "production-grade prompt engine".
- **User pain terbesar V2** — "adegan kaget" = feedback konsisten.
- **Best practice industri** — transition types (cut, dissolve, fade, wipe, match cut) sudah mapan di studiobinder/boords/Adobe.

#### Business Goals
- OBJ-V3-01: Output production-ready
- OBJ-V3-05: Memperkaya metadata per scene
- KPI-V3-03: Scene transition richness >= 4 dari 4 field

#### Success Criteria
- Setiap scene generate 4 field transition: `transitionType` (enum), `transitionDuration` (ms), `transitionEasing` (enum), `transitionDirection` (enum untuk wipe)
- UI menampilkan visual flow indicator antar scene (arrow dengan icon transition)
- Export JSON + Markdown menyertakan section transition
- Prompt builder meng-instruksi AI untuk pilih transition sesuai konteks naratif (dramatis = fade, action = cut, dll)

#### Transition Types (target MVP)

| Type | Use Case | Duration |
|---|---|---|
| `cut` | Default, fast, action | 0ms |
| `dissolve` | Time passage, location change | 500-2000ms |
| `fade_to_black` | Chapter end, dramatic pause | 1000-3000ms |
| `fade_to_white` | Dream, flashback | 1000-3000ms |
| `wipe` | Location/travel change | 500-1000ms |
| `match_cut` | Visual continuity (shape/color) | 0ms |

#### Asumsi
- ASM-2: Transition field di `scenes` table (bukan new table) — simpler untuk MVP
- ASM-B-V3-2: 6 transition types cukup untuk MVP, bisa extend nanti

#### Risiko Bisnis
- RISK-V3-04: LLM tidak konsisten pilih transition type — mitigasi: enum constraint di Zod schema + retry prompt jika invalid
- RISK-V3-05: User overwhelmed dengan 6 transition types — mitigasi: default value `cut`, hint UI per type

---

### 6.3 F-V3-03: Complex Image Prompts

#### Latar Belakang
Saat ini `image_prompts.promptText` (`schema.ts:108`) = single string 1-baris. Contoh dari `prompt-builder.ts:35-36`: deskripsi karakter + aksi + gaya umum. Tidak ada composition, lighting detail, camera angle, mood, color palette. Output AI image generator (Midjourney, DALL-E, Kling) = generic.

#### Business Case
- **Output quality naik 2-3x** — prompt dengan 8 layer (subject + composition + camera + lighting + color + style + technical + quality) = output lebih presisi sesuai brief.
- **Industry standard** — Kling AI, Midjourney, Runway semua recommend structured prompt formula. RAG-CONTEXT S6.3, S10.2.
- **Reusable** — user bisa copy per-section prompt untuk tweak specific layer tanpa rewrite semua.
- **Diferensiasi** — output PromptFlow = "production-ready prompt" bukan "1-line draft".

#### Business Goals
- OBJ-V3-01: Output production-ready
- OBJ-V3-05: Memperkaya metadata per scene
- KPI-V3-04: Image prompt structured score >= 6 dari 8 layer

#### Success Criteria
- Setiap image prompt di-generate dengan minimal 6 dari 8 layer:
  1. Subject (karakter + aksi)
  2. Composition (foreground/midground/background, framing)
  3. Camera (angle, lens, depth of field)
  4. Lighting (key/fill/rim, golden hour, dll)
  5. Color palette (warm/cool, accent, grading)
  6. Mood/atmosphere (emotional tone)
  7. Style/art direction (3D Pixar, painterly, dll)
  8. Technical specs (4K, ultra-detailed, dll)
- Prompt builder enhanced dengan instruksi 8-layer formula
- UI opsional: tampilkan prompt dengan section labels (subject/composition/dll)
- Copy per-section tersedia

#### Asumsi
- ASM-3: `promptText` tetap single string, tapi content lebih structured (label inline)
- ASM-B-V3-3: 8 layer cukup untuk MVP, bisa tambah lebih spesifik nanti (e.g. negative prompt)

#### Risiko Bisnis
- RISK-V3-06: Prompt lebih panjang = lebih banyak token = biaya LLM naik — mitigasi: monitor usage, optimize prompt builder
- RISK-V3-07: LLM tidak konsisten generate semua 8 layer — mitigasi: schema validation + retry dengan feedback
- RISK-V3-08: User tidak perlu sedetail itu — mitigasi: complexity toggle (simple/advanced) V4

---

### 6.4 F-V3-04: Voiceover Voice Type Spec

#### Latar Belakang
Saat ini `scenes.voiceoverScript` (`schema.ts:94`) = plain text. Tidak ada voice type, emotion, speed, pitch. Saat di-render ke TTS (ElevenLabs, Google TTS), semua scene pakai voice default = monoton. User tidak bisa指定 narator vs karakter anak vs karakter elderly.

#### Business Case
- **Voice variety = engagement** — variasi suara (narrator + child + elderly) buat video lebih hidup.
- **Industry standard** — ElevenLabs Voice Design v3 standard: child/teen/adult_male/adult_female/elderly_male/elderly_female + narrator.
- **Use case jelas** — Rian (solo creator) buat animasi anak-anak = butuh child voice. Bu Sinta (edukator) buat karakter bijak = butuh elderly voice.
- **Reusable across projects** — voice preset per character bisa di-save.

#### Business Goals
- OBJ-V3-01: Output production-ready
- OBJ-V3-05: Memperkaya metadata per scene
- KPI-V3-05: Voice type variety >= 40% scene non-narrator

#### Success Criteria
- Setiap scene generate 4 field voice:
  - `voiceType` (enum: child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator)
  - `voiceEmotion` (enum: neutral, happy, sad, excited, calm, dramatic)
  - `voiceSpeed` (float 0.5-2.0, default 1.0)
  - `voicePitch` (enum: low, medium, high, auto)
- Prompt builder meng-instruksi AI untuk pilih voiceType sesuai character role
- UI voice selector per scene
- Export JSON + Markdown menyertakan section voice spec
- Default TTS provider: ElevenLabs-compatible

#### Asumsi
- ASM-4: Voice field di `scenes` table (sederhana, cukup untuk MVP)
- ASM-8: 7 voice types cukup untuk MVP (child/teen/adult_male/adult_female/elderly_male/elderly_female/narrator)

#### Risiko Bisnis
- RISK-V3-09: TTS provider cost naik dengan variety voice — mitigasi: pre-compute character voice di project level
- RISK-V3-10: Voice type enum terlalu luas untuk pasar Indonesia — mitigasi: prioritize adult_female + child + narrator (cover 80% use case)
- RISK-V3-11: LLM pilih voice type tidak sesuai karakter — mitigasi: schema validation + character role hint di prompt

---

### 6.5 F-V3-05: Supporting Audio Spec

#### Latar Belakang
**ZERO audio support di seluruh codebase V1/V2.** `schema.ts` tidak ada audio field, `prompt-builder.ts` tidak ada audio instruksi, UI tidak ada audio panel, export tidak ada audio section. Output video = silent (tanpa musik/SFX/ambient).

#### Business Case
- **Audio = 50% production value** — video tanpa musik/SFX/ambient = "kurang hidup". User harus export ke tool lain untuk tambah audio.
- **Industry standard** — sound design layers: background music + SFX + ambient + music cue + transition audio.
- **Use case jelas** — Rian (solo creator) butuh royalty-free music per scene. Bumi Animasi butuh SFX library per project.
- **Highest impact feature** — dari 5 fitur V3, audio paling user-visible (langsung terdengar di output).

#### Business Goals
- OBJ-V3-01: Output production-ready
- OBJ-V3-05: Memperkaya metadata per scene
- KPI-V3-06: Audio coverage per scene >= 80%

#### Success Criteria
- Audio metadata per scene dalam new table `scene_audio` (many-to-one ke scenes):
  - `audioType` (enum: background_music, sfx, ambient, music_cue, transition_audio)
  - `description` (text — apa audio seharusnya)
  - `timing` (enum: start, throughout, end, specific_moment)
  - `duration` (integer, seconds)
  - `volume` (float 0.0-1.0)
  - `fadeIn` (integer, ms)
  - `fadeOut` (integer, ms)
- Prompt builder meng-instruksi AI untuk generate audio spec per scene (music mood, SFX list, ambient atmosphere)
- UI: panel audio per scene dengan CRUD
- Export JSON + Markdown menyertakan section audio
- Optional: integrasi dengan royalty-free music API (Pixabay, Freesound) — V4

#### Asumsi
- ASM-5: New table `scene_audio` (multiple audio per scene, lebih flexible dari single field)
- ASM-10: 4 audio categories (background_music, sfx, ambient, music_cue) + transition_audio = 5 total

#### Risiko Bisnis
- RISK-V3-12: User overwhelmed dengan 7 field audio per scene — mitigasi: template preset per scene type
- RISK-V3-13: Audio generation cost tinggi (royalty API) — mitigasi: hanya generate spec, user yang supply audio
- RISK-V3-14: Output size JSON naik dengan audio data — mitigasi: efficient schema, index di sceneId
- RISK-V3-15: LLM tidak konsisten generate audio spec — mitigasi: schema validation + retry

---

## 7. Ruang Lingkup Bisnis V3

### 7.1 IN SCOPE V3

| ID | Item | Justifikasi |
|---|---|---|
| SCOPE-V3-01 | Light theme support — `next-themes` install, ThemeProvider, ThemeToggle component | F-V3-01, OBJ-V3-04 |
| SCOPE-V3-02 | Remove hardcoded className dark dari `layout.tsx:66` dan `page.tsx:24` | F-V3-01 |
| SCOPE-V3-03 | Schema migration — tambah field transition di `scenes` (4 field) | F-V3-02 |
| SCOPE-V3-04 | Schema migration — tambah field voice di `scenes` (4 field) | F-V3-04 |
| SCOPE-V3-05 | Schema migration — tambah field `durationSeconds` di `scenes` | F-V3-02, F-V3-04 |
| SCOPE-V3-06 | Schema migration — new table `scene_audio` (7 field) | F-V3-05 |
| SCOPE-V3-07 | Schema migration — tambah field di `image_prompts` untuk mood/style modifiers (opsional) | F-V3-03 |
| SCOPE-V3-08 | Prompt builder enhancement — 8-layer formula untuk image prompts | F-V3-03 |
| SCOPE-V3-09 | Prompt builder enhancement — transition/voice/audio instructions | F-V3-02, F-V3-04, F-V3-05 |
| SCOPE-V3-10 | Zod schema extension — SceneSchema, ImagePromptItemSchema, new SceneAudioSchema | F-V3-02, F-V3-03, F-V3-04, F-V3-05 |
| SCOPE-V3-11 | UI — visual flow indicator antar scene cards | F-V3-02 |
| SCOPE-V3-12 | UI — voice type selector per scene | F-V3-04 |
| SCOPE-V3-13 | UI — audio panel per scene (CRUD scene_audio) | F-V3-05 |
| SCOPE-V3-14 | UI — image prompt display dengan section labels (opsional) | F-V3-03 |
| SCOPE-V3-15 | Export — extend JSON + Markdown template untuk transition/voice/audio | F-V3-02, F-V3-04, F-V3-05 |
| SCOPE-V3-16 | i18n — tambah keys untuk theme, transition, voice, audio (ID + EN) | Semua fitur V3 |
| SCOPE-V3-17 | V2 → V3 data migration script — backfill project V2 dengan V3 default (transition=cut, voice=narrator, no audio) | Migration success |
| SCOPE-V3-18 | Analytics — track 5 event V3 (theme_change, scene_transition_*, voice_*, audio_*, image_prompt_layer_*) | KPI V3 |
| SCOPE-V3-19 | Update landing page copy (V2) — highlight 5 fitur baru | Marketing post-launch |
| SCOPE-V3-20 | In-app changelog banner untuk V2 user — "5 fitur baru, project aman" | Reduce churn |

### 7.2 OUT OF SCOPE V3

| ID | Item | Alasan |
|---|---|---|
| OOS-V3-01 | Audio generation/streaming actual (royalty-free music API integration) | Hanya generate spec, bukan audio file — V4 |
| OOS-V3-02 | TTS engine integration actual (ElevenLabs, Google TTS) | Hanya voice metadata spec — V4 |
| OOS-V3-03 | Image generation integration actual (Midjourney, DALL-E) | PromptFlow = prompt engine, bukan image generator |
| OOS-V3-04 | Video assembly actual (Runway, Pika integration) | PromptFlow = prompt engine, bukan video editor |
| OOS-V3-05 | Custom voice cloning | Butuh consent + legal — V5 |
| OOS-V3-06 | Audio waveform preview di UI | Butuh audio file generation dulu — V4 |
| OOS-V3-07 | A/B testing infrastructure untuk V3 fitur | Cukup Vercel Analytics event dulu |
| OOS-V3-08 | Negative prompt untuk image generation | V4 — tambah setelah user feedback |
| OOS-V3-09 | Multi-language voice (English, Mandarin, dll) | Fokus Indonesia V3, expand V5 |
| OOS-V3-10 | Refactor prompt builder architecture (per-feature prompt files) | V2 masih re-export 1 file, cukup V3 — refactor V5 |
| OOS-V3-11 | Mobile app (iOS/Android) | Web-only V3 |
| OOS-V3-12 | Pricing changes (audio generation = paid tier) | Tidak ada model pricing V2 — V4 |

---

## 8. Asumsi dan Batasan Bisnis V3

### 8.1 Asumsi Bisnis V3

| ID | Asumsi | Alasan | Dampak bila Salah |
|---|---|---|---|
| ASM-B-V3-01 | User mau bayar effort migrasi V2→V3 kalau output naik | ROI jelas (no re-edit) | Migration resistance naik, retention turun |
| ASM-B-V3-02 | Light theme = bonus UX, bukan blocker konversi | Effort minimal, benefit universal | Wasted effort |
| ASM-B-V3-03 | 6 transition types + 7 voice types + 5 audio categories cukup untuk MVP | Best practice industri | Butuh V4 extension cepat |
| ASM-B-V3-04 | LLM (multi-provider) bisa generate metadata konsisten untuk 5 fitur | V1 sudah pakai LLM via Vercel AI SDK | Output random, perlu lebih banyak validation |
| ASM-B-V3-05 | User V2 mau update project dengan V3 metadata, bukan start over | 5 fitur additive, tidak break | Churn ke kompetitor |
| ASM-B-V3-06 | Audio spec lebih valuable dari audio actual file (untuk MVP) | Spec = portable, file = vendor lock-in | V4 perlu tambah audio generation |
| ASM-B-V3-07 | Schema migration V2→V3 additive only (tidak drop kolom) | Drizzle additive migration | Data loss |
| ASM-B-V3-08 | Biaya LLM naik ≤ 50% karena richer prompt | Prompt builder optimize | Profit margin turun |
| ASM-B-V3-09 | User Indonesia dominan — voice type fokus bahasa Indonesia | Persona Rian + Bu Sinta | Pasar EN kurang terlayani |
| ASM-B-V3-10 | 5 fitur V3 bisa di-roll-out dalam 1 sprint (2-3 minggu) | Effort per fitur manageable | Timeline molor, V4 mundur |

### 8.2 Batasan Bisnis V3

| ID | Batasan | Sumber |
|---|---|---|
| LIM-V3-01 | Schema migration additive only — tidak boleh drop kolom V2 | Backward compat V2 user |
| LIM-V3-02 | LLM provider multi — tidak boleh lock ke 1 provider | V1 architecture |
| LIM-V3-03 | V2 codebase tidak boleh di-break — V3 = additive | Migration success KPI |
| LIM-V3-04 | i18n ID+EN wajib sinkron untuk semua key baru | AGENTS.md LIM-09 |
| LIM-V3-05 | Design tokens harus pakai semantic token (primary, background) bukan hardcoded hex | AGENTS.md LIM-06 |
| LIM-V3-06 | Lighthouse Performance >= 85 — schema baru + UI baru tidak boleh turun | AGENTS.md DoD |
| LIM-V3-07 | Tidak boleh tambah heavy library (audio processing, dll) | Bundle size impact |
| LIM-V3-08 | Semua 5 fitur harus support undo/redo (user edit metadata) | UX best practice |
| LIM-V3-09 | Export harus tetap JSON + Markdown (tidak tambah format baru) | V1 sudah support |
| LIM-V3-10 | Audio/music spec harus free-to-use (no licensed content reference) | Legal risk |
| LIM-V3-11 | Voice type prompt tidak boleh bias gender/stereotype | Ethics review |
| LIM-V3-12 | Light theme tidak boleh inverting dark theme otomatis — harus design ulang palette | A11y + brand |
| LIM-V3-13 | Migration V2→V3 harus reversible (rollback plan) | Risk mitigation |

---

## 9. Risiko Bisnis V3 dan Mitigasi

### 9.1 Risiko V3 Baru (Top 10)

| ID | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| RISK-V3-01 | Migrasi V2→V3 gagal — project user rusak | Tinggi (churn) | Rendah | Migration script tested di staging + backup DB + dry-run mode + reversible (LIM-V3-13) |
| RISK-V3-02 | LLM tidak konsisten generate 5 metadata baru (transition/voice/audio/image layers) | Tinggi (KPI) | Sedang | Schema validation Zod + retry prompt dengan feedback + fallback default values (cut/narrator/empty) |
| RISK-V3-03 | Output video tetap "kaget" walaupun ada transition metadata | Tinggi (core value) | Rendah | Downstream tool integration guide + sample project demo + video tutorial |
| RISK-V3-04 | User overwhelmed dengan 5 fitur baru sekaligus | Sedang (adoption) | Sedang | Onboarding tour V3 + tooltip per fitur + complexity toggle (simple/advanced) di V4 |
| RISK-V3-05 | Biaya LLM naik > 50% karena richer prompt | Sedang (margin) | Sedang | Prompt builder optimization + token budgeting + provider routing (cheap untuk preview, premium untuk export) |
| RISK-V3-06 | Light theme kontras brand violet tidak pass WCAG AA | Sedang (a11y) | Sedang | Test kontras semua token + adjust `--primary` light mode + fallback darker violet |
| RISK-V3-07 | Audio spec tidak actionable — user bingung cari music/SFX mana | Sedang (adoption) | Tinggi | Template preset audio per scene type (dramatic/comedy/tutorial) + link ke Pixabay/Freesound (free) |
| RISK-V3-08 | Voice type TTS cost tinggi (ElevenLabs) saat user generate | Tinggi (cost ke user) | Sedang | V3 = spec only, no TTS generation. V4 = TTS integration dengan cost calculator |
| RISK-V3-09 | Image prompt jadi terlalu panjang (8 layer) — user tidak baca | Sedang (UX) | Sedang | Section labels collapsible + "show full prompt" toggle + summary line di top |
| RISK-V3-10 | Scope creep — tambah fitur audio/image di V3 (di luar 5 fitur) | Sedang (timeline) | Tinggi | Strict patuhi SCOPE-V3-01..20; tambahan masuk V4 backlog |

### 9.2 Risiko V2 yang Berlaku + Update

| ID | Risiko V2 | Update V3 |
|---|---|---|
| RISK-01 | Animasi berlebihan | Masih berlaku — Framer Motion impact tidak berubah |
| RISK-08 | Lighthouse turun | Tambah concern: schema baru + UI baru harus tetap >= 85 |
| RISK-12 | Tidak ada analytics | V3: tambah 5 event baru untuk track 5 fitur |
| RISK-15 | Bundle size naik | V3: monitor — schema + UI baru harus <= +20KB |

---

## 10. V3 Rollout Plan (Business View)

### 10.1 Tahapan

| Tahap | Aktivitas | Business Milestone |
|---|---|---|
| **T1: Design & Spec** (Minggu 1) | Finalisasi SRS, UIUX_SPEC, API_CONTRACT untuk 5 fitur | Spec sign-off |
| **T2: Schema & Migration** (Minggu 2) | Drizzle migration additive + backfill script + rollback plan | Migration tested di staging |
| **T3: Prompt Builder** (Minggu 2-3) | Enhance `prompt-builder.ts` dengan 5 metadata instructions | Output LLM validated |
| **T4: UI Components** (Minggu 3) | Light theme, transition visualizer, voice selector, audio panel, image prompt labels | UI demo |
| **T5: Export** (Minggu 3) | Extend JSON + Markdown template | Export validated |
| **T6: QA & Migration** (Minggu 4) | Full regression + V2 user dry-run migration + in-app changelog banner | Migration success rate >= 95% |
| **T7: Launch** (Minggu 4) | Deploy to Vercel + announce ke V2 user base via email/in-app | Live V3 |
| **T8: Monitor** (Minggu 4-8) | Track 10 KPI V3 + in-app survey | KPI report |

### 10.2 Launch Criteria (Business Go/No-Go)

| Kriteria | Target | Status |
|---|---|---|
| Schema migration dry-run success | 100% di staging | Required |
| LLM generate 5 metadata consistency | >= 90% per field | Required |
| Lighthouse Performance | >= 85 | Required |
| Bundle size impact | <= +20KB gzipped | Required |
| V2 user dry-run migration | 100% data retained | Required |
| In-app changelog ready | ID + EN | Required |
| 5 event V3 wired | Yes | Required |
| Landing page copy updated | Highlight 5 fitur baru | Required |
| Support docs (FAQ V3) | Ready | Required |
| Rollback plan tested | Yes | Required |

---

## 11. Lampiran A — V2 → V3 Mapping

| V2 (Landing) | V3 (Core Features) |
|---|---|
| 11 section landing | + 5 fitur core (theme + 4 metadata) |
| Konversi visitor | + Retensi user via production-ready output |
| Brand perception | + Competitive moat (5 fitur unik) |
| Hero CTA CTR KPI | + 10 KPI V3 baru |
| 0 metadata per scene | + 12+ field metadata per scene |
| 0 audio support | + 5 audio categories |
| Dark only | + Light + system preference |

---

## 12. Lampiran B — Definition of Done V3

- [ ] Light theme toggle berfungsi + persist + system preference
- [ ] Hardcoded dark class removed dari `layout.tsx` + `page.tsx`
- [ ] Schema migration additive untuk 5 fitur (transition, voice, audio, image layers, scene duration)
- [ ] New table `scene_audio` dengan 7 field
- [ ] Prompt builder enhanced untuk 5 metadata
- [ ] Zod schema extended + validated
- [ ] UI: visual transition flow, voice selector, audio panel, image prompt section labels
- [ ] Export JSON + Markdown termasuk 5 metadata baru
- [ ] i18n keys ID+EN sinkron untuk semua V3 (theme, transition, voice, audio, image layers)
- [ ] V2 → V3 migration script tested (dry-run + reversible)
- [ ] In-app changelog banner V2 user
- [ ] Landing page copy updated — highlight 5 fitur baru
- [ ] 5 analytics event V3 wired
- [ ] Lighthouse Performance >= 85
- [ ] Bundle size impact <= +20KB gzipped
- [ ] `pnpm lint` 0 error + `pnpm typecheck` 0 error + `pnpm build` pass
- [ ] WCAG 2.1 AA di light + dark mode
- [ ] V2 user dry-run: 100% project retained
- [ ] Conventional commit `feat(v3): ...` per fitur (5 commit, atomic)
- [ ] PR reviewed + merged (no direct push main)
- [ ] Preview deploy ke Vercel sukses

---

## 13. Lampiran C — Referensi Dokumen

| # | Dokumen | Path | Peran |
|---|---|---|---|
| 1 | RAG-CONTEXT (refresh) | `product-docs/RAG-CONTEXT.md` | Sumber fakta V3 (606 baris) |
| 2 | BRD V2 (Landing) | `product-docs/BRD.md` v1.0 | Konteks V1+V2 |
| 3 | AGENTS.md V2 | `product-docs/AGENTS.md` | Panduan build V2 (reused untuk V3) |
| 4 | PRD V3 (akan datang) | `product-docs/PRD.md` v2.0 | FR-17..FR-21 untuk 5 fitur V3 |
| 5 | SRS V3 (akan datang) | `product-docs/SRS.md` v2.0 | Tech spec V3 |
| 6 | DATABASE_SCHEMA V3 (akan datang) | `product-docs/DATABASE_SCHEMA.md` | Schema V3 + migration |
| 7 | PROJECT_ARCHITECTURE V3 (akan datang) | `product-docs/PROJECT_ARCHITECTURE.md` | Arsitektur V3 |
| 8 | UIUX_SPEC V3 (akan datang) | `product-docs/UIUX_SPEC.md` | UI V3 |
| 9 | API_CONTRACT V3 (akan datang) | `product-docs/API_CONTRACT.md` | API V3 |
| 10 | CODING_RULES | `product-docs/CODING_RULES.md` | Standar koding (berlaku V3) |
| 11 | REVIEW_REPORT V2 | `product-docs/REVIEW_REPORT.md` | Quality gate V2 |

---

> **Dokumen ini = kontrak bisnis V3 untuk 5 fitur inti PromptFlow. Berbeda dengan V1+V2 (focus UI/landing), V3 focus ke core engine: theme, transition, image prompt, voice, audio. Eksekutor teknis wajib baca BRD ini + RAG-CONTEXT.md + PRD V3 (akan datang) + SRS V3 (akan datang). Klaim tanpa bukti = ASUMSI (ditandai eksplisit).**

**Dibuat oleh:** docgen-brd subagent
**Tanggal:** 2026-06-21
**Versi:** 2.0 (V3 Update)
