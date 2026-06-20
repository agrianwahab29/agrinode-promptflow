# BRD — Business Requirement Document
## PromptFlow Landing Page Redesign

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Pemilik:** Product Owner PromptFlow
> **Status:** Draft untuk review
> **Deliverable:** Landing page `src/app/[locale]/page.tsx` — redesign total
> **Rujukan kebenaran:** `product-docs/RAG-CONTEXT.md` (sumber fakta), `product-docs/AGENTS.md` (panduan build V2)

---

## 1. Ringkasan Eksekutif

PromptFlow adalah **workflow engine otomasi prompt animasi AI** — web app fullstack yang menghasilkan paket prompt terstruktur (JSON + Markdown) dari input minimal (judul + durasi + gaya). Saat ini landing page yang ada di `src/app/[locale]/page.tsx` sangat basic: 1 hero + 3 feature cards, tanpa animasi, tanpa social proof, tanpa FAQ, tanpa product demo, tanpa pricing. Akibatnya konversi visitor ke registered user tidak terukur dan tidak optimal.

**Inisiatif:** Redesign total landing page menjadi halaman konversi tinggi dengan hero animasi, social proof, product demo, feature bento grid, how-it-works, testimonial, FAQ, dan final CTA — mengikuti best practice SaaS landing page 2024-2026 dan referensi desain Techno-Futurist (Linear/Vercel/Stripe style) yang match brand violet `#7c3aed` dan audience kreator animasi AI.

**Nilai bisnis yang diharapkan:**
- Peningkatan CTR hero CTA `Mulai Gratis` minimal 2x baseline V1.
- Peningkatan sign-up rate (visitor ke registered) minimal +50%.
- Penguatan persepsi produk "profesional, modern, AI-first" sehingga membedakan dari kompetitor.

---

## 2. Latar Belakang Bisnis dan Masalah

### 2.1 Konteks Pasar

| Tren | Dampak ke PromptFlow | Sitasi |
|---|---|---|
| Ledakan konten video pendek AI (TikTok, Reels, Shorts) | Permintaan prompt animasi terstruktur melonjak | `RAG-CONTEXT.md S6.1` |
| Kreator solo butuh workflow cepat | Butuh tool yang hilangkan friksi manual susun prompt | `MRD.md S2` (Rian persona) |
| Multi-provider LLM jadi standar | Fleksibilitas biaya/kualitas adalah fitur utama | `RAG-CONTEXT.md S2.1` |

### 2.2 Masalah Bisnis Saat Ini

| ID | Masalah | Dampak | Bukti |
|---|---|---|---|
| BIZ-P01 | Landing page basic (hero + 3 cards) — tidak konversi | Visitor bounce tinggi, sign-up rendah | `RAG-CONTEXT.md S3.1` |
| BIZ-P02 | Tidak ada social proof (testimonial, user count, logo) | Trust rendah, visitor ragu credibility | `RAG-CONTEXT.md S3.1, S8.1 GAP-03` |
| BIZ-P03 | Tidak ada product demo visual | Visitor tidak bisa melihat produk dalam 10 detik pertama | `RAG-CONTEXT.md S5.2` (10-second rule) |
| BIZ-P04 | Tidak ada FAQ / objection handling | Pertanyaan umum tidak terjawab, bounce | `RAG-CONTEXT.md S5.3` |
| BIZ-P05 | Tidak ada animasi / motion | Persepsi produk kuno, tidak AI-first | `RAG-CONTEXT.md S3.1, S7` |
| BIZ-P06 | Tidak ada navbar / footer | Navigasi buruk, profesionalitas rendah | `RAG-CONTEXT.md S3.1, S5.1` |

### 2.3 Konteks Produk

- **V1 sudah built dan berjalan** (9 tabel DB, 23 endpoint API, NextAuth, upload Vercel Blob, SSE streaming). Landing page = satu-satunya halaman publik yang butuh upgrade visual. (Sitasi: `AGENTS.md S1`)
- **i18n keys landing sudah ada** di `messages/id.json` namespace `landing.*` (heroTitle, heroSubtitle, cta, loginCta, feature1-3). (Sitasi: `RAG-CONTEXT.md S3.2`)
- **Design tokens sudah ada** di `src/app/globals.css` (primary violet `#7c3aed`, Inter font, spacing 4px, radius 6px). (Sitasi: `RAG-CONTEXT.md S4.1`)
- **Tidak ada animation library terinstall** — perlu tambah dependency. (Sitasi: `RAG-CONTEXT.md S1, GAP-06`)

---

## 3. Peluang dan Justifikasi Nilai

### 3.1 Peluang

| ID | Peluang | Sumber |
|---|---|---|
| OPP-01 | 50%+ traffic landing page adalah mobile-first — perlu visual high-craft agar stand out | `RAG-CONTEXT.md S5.3` |
| OPP-02 | Brand color violet `#7c3aed` match pattern Linear-style — langsung adopt dark mode + neon accent | `RAG-CONTEXT.md S6.3` |
| OPP-03 | Best practice SaaS 2024-2026 sudah mapan (12 section pattern, 10-second rule, 1:1 attention ratio) — tinggal eksekusi | `RAG-CONTEXT.md S5` |
| OPP-04 | Audience kreator animasi AI appreciate visual sophistication — motion/animation = conversion multiplier | `RAG-CONTEXT.md S6.1, S7` |
| OPP-05 | Framer Motion (~30KB gzipped) = standar React/Next.js, fitur lengkap, komunitas besar — adoption risk rendah | `RAG-CONTEXT.md S7.1` |

### 3.2 Justifikasi Nilai Bisnis

| Lever | Baseline (V1 basic) | Target (V2 redesign) | Impact |
|---|---|---|---|
| Hero CTA CTR | Tidak terukur (ASUMSI rendah ~1-2%) | >= 4% (2x baseline) | ASUMSI — perlu track via analytics |
| Sign-up conversion | Tidak terukur (ASUMSI ~2-3%) | >= 6% (+50%) | ASUMSI — perlu track via analytics |
| Time-on-page | Tidak terukur (ASUMSI ~30s) | >= 90s | ASUMSI — engaging content + animasi |
| Bounce rate | Tidak terukur (ASUMSI ~60%) | <= 45% | ASUMSI — better content hierarchy |
| Brand perception | MVP / side project | Produk AI profesional | Qualitative — survey post-launch (ASUMSI) |

**Catatan:** Baseline V1 tidak terukur karena belum ada analytics terpasang (`RAG-CONTEXT.md GAP-08`). Target = ASUMSI berdasarkan benchmark SaaS AI tools sejenis. Akan dipasang Vercel Analytics atau GA4 bersamaan launch untuk validasi.

---

## 4. Tujuan Bisnis dan KPI Terukur

### 4.1 Tujuan Bisnis

| ID | Tujuan | Horizon |
|---|---|---|
| OBJ-01 | Konversi visitor landing page menjadi user terdaftar (registered) | 30 hari post-launch |
| OBJ-02 | Membangun persepsi produk "AI-first, profesional, modern" | Launch |
| OBJ-03 | Menurunkan bounce rate dan meningkatkan time-on-page | 30 hari post-launch |
| OBJ-04 | Memperkuat positioning vs kompetitor (workflow prompt automation) | Launch |
| OBJ-05 | Mendukung campaign acquisition (paid ads, SEO, social share) | 60 hari post-launch |

### 4.2 KPI Terukur

| KPI ID | Nama KPI | Definisi | Target | Baseline | Cara Ukur |
|---|---|---|---|---|---|
| KPI-01 | Hero CTA CTR | Klik `Mulai Gratis` / unique visitor | >= 4% | ASUMSI ~1-2% | Vercel Analytics event `cta_hero_click` |
| KPI-02 | Sign-up Rate | Pendaftaran baru / unique visitor | >= 6% | ASUMSI ~2-3% | NextAuth sign-up event + analytics |
| KPI-03 | Bounce Rate | Single-page session / total session | <= 45% | ASUMSI ~60% | Vercel Analytics |
| KPI-04 | Avg Time on Page | Total time on page / sessions | >= 90 detik | ASUMSI ~30s | Vercel Analytics |
| KPI-05 | Scroll Depth | % visitor scroll >= 75% halaman | >= 35% | N/A | Vercel Analytics scroll tracking |
| KPI-06 | FAQ Engagement | Klik/expand FAQ item / visitor | >= 15% | N/A | Event tracking per FAQ item |
| KPI-07 | Mobile Conversion | Sign-up dari device mobile / total mobile visitor | >= 4% | N/A | Segment by device |
| KPI-08 | Lighthouse Performance | Score Performance (mobile) | >= 85 | N/A | Lighthouse CI |
| KPI-09 | LCP (Largest Contentful Paint) | Render elemen terbesar | <= 2.5s | N/A | Web Vitals |
| KPI-10 | CLS (Cumulative Layout Shift) | Pergeseran layout tak terduga | <= 0.1 | N/A | Web Vitals |

---

## 5. Stakeholder dan Kepentingan

| ID | Stakeholder | Peran | Kepentingan | Tingkat Pengaruh |
|---|---|---|---|---|
| STK-01 | Founder / Product Owner PromptFlow | Penanggung jawab produk | Validasi value proposition + conversion | Tinggi |
| STK-02 | User Persona "Rian" (Solo Creator) | Target user primer | Workflow cepat, friction rendah, AI transparan | Tinggi (user) |
| STK-03 | User Persona "Bumi Animasi" (Indie Studio) | Target user sekunder | Dashboard monitoring, multi-proyek | Sedang (user) |
| STK-04 | User Persona "Bu Sinta" (Edukatator) | Target user sekunder | Loading jelas, error recover, dwibahasa | Sedang (user) |
| STK-05 | Frontend Developer | Eksekutor build | Component reusable, design tokens konsisten, framer-motion integration | Tinggi |
| STK-06 | Designer / UI/UX | Pengawas visual | Design system compliance (UIUX_SPEC), a11y | Tinggi |
| STK-07 | Marketing / Growth | Acquisition channel | OG image, SEO meta, share preview, UTM tracking | Sedang |
| STK-08 | End Visitor (Anonymous) | Target konversi | First-impression 10 detik, trust signal | Tinggi (decides conversion) |

---

## 6. Ruang Lingkup Bisnis

### 6.1 IN SCOPE

| ID | Item | Justifikasi |
|---|---|---|
| SCOPE-01 | Redesign total `src/app/[locale]/page.tsx` | Core deliverable — file sudah ada, perlu overwrite |
| SCOPE-02 | Tambah 12 section sesuai best practice SaaS 2024-2026 | `RAG-CONTEXT.md S5.1` |
| SCOPE-03 | Install Framer Motion sebagai dependency baru | `RAG-CONTEXT.md S7.1` — standar React/Next.js untuk animasi |
| SCOPE-04 | Tambah animasi: fade-in on scroll, stagger children, hover scale, gradient shift | `RAG-CONTEXT.md S7.2` |
| SCOPE-05 | Expand `messages/id.json` + `messages/en.json` namespace `landing.*` | i18n keys baru untuk section tambahan |
| SCOPE-06 | Tambah navbar + footer component | `RAG-CONTEXT.md S3.1, S5.1` |
| SCOPE-07 | Placeholder testimonial + user count section (siap isi data real nanti) | `RAG-CONTEXT.md GAP-03` |
| SCOPE-08 | FAQ section 5-6 pertanyaan umum (objection handling) | `RAG-CONTEXT.md S5.1, S5.3` |
| SCOPE-09 | How it works section (3-4 step visual) | `RAG-CONTEXT.md S5.1` |
| SCOPE-10 | Product demo visual di hero (text-based generate flow mockup) | `RAG-CONTEXT.md S5.2` |
| SCOPE-11 | Respect `prefers-reduced-motion` (sudah ada di `globals.css:74-80`) | `RAG-CONTEXT.md S7.3` |
| SCOPE-12 | Mobile-first responsive design | `RAG-CONTEXT.md S5.3` |
| SCOPE-13 | Dark mode default (techno-futurist aesthetic) | `RAG-CONTEXT.md S6.3` |
| SCOPE-14 | SEO meta tags (title, description, OG image placeholder) | `RAG-CONTEXT.md GAP-07` |
| SCOPE-15 | Analytics tracking (Vercel Analytics / GA4) | `RAG-CONTEXT.md GAP-08` |

### 6.2 OUT OF SCOPE

| ID | Item | Alasan |
|---|---|---|
| OOS-01 | Membuat logo PromptFlow khusus (custom illustration) | `RAG-CONTEXT.md GAP-02` — gunakan text-based logo |
| OOS-02 | Migrasi ke Vercel, deployment production | Sudah ada V1 deployed |
| OOS-03 | Membuat konten marketing asli (blog post, video demo) | Di luar scope teknis landing page |
| OOS-04 | Integrasi payment / pricing section | `RAG-CONTEXT.md GAP-04` — tidak ada model pricing |
| OOS-05 | A/B testing infrastructure penuh | Cukup Vercel Analytics dulu |
| OOS-06 | Refactor arsitektur Next.js / migrasi stack | Stack sudah final — `AGENTS.md S3` |
| OOS-07 | Backend endpoint baru | Landing page = frontend only |
| OOS-08 | Auth flow baru | NextAuth sudah ada |
| OOS-09 | Migrasi design system ke Figma / tooling eksternal | Pakai design tokens existing |
| OOS-10 | Custom font (Inter Display, dll) berbayar | Pakai Inter via `system-ui` |

---

## 7. Asumsi dan Batasan Bisnis

### 7.1 Asumsi Bisnis

| ID | Asumsi | Alasan | Dampak bila Salah |
|---|---|---|---|
| ASM-B01 | Produk = animation prompt automation (BUKAN document generation) | `RAG-CONTEXT.md S1, GAP-01` | Landing page salah describe produk |
| ASM-B02 | Produk saat ini free untuk user (tidak ada model pricing) | `RAG-CONTEXT.md GAP-04` | Butuh tambah pricing section nanti |
| ASM-B03 | Target audience = kreator animasi AI (solo + indie studio) | `RAG-CONTEXT.md S2.4, S6.3` | Tone visual bisa miss |
| ASM-B04 | Conversion primary action = sign-up gratis | `RAG-CONTEXT.md S2.1` | CTA `Mulai Gratis` valid |
| ASM-B05 | Bahasa default landing = Indonesia, toggle ke English | `RAG-CONTEXT.md S4.5` | Traffic negara lain konversi turun |
| ASM-B06 | Trafik datang dari direct, SEO, dan social share | ASUMSI — tidak ada data historis | Channel attribution belum optimal |
| ASM-B07 | User butuh melihat produk dalam 10 detik pertama | `RAG-CONTEXT.md S5.2` | Hero perlu product visual jelas |
| ASM-B08 | Kompetitor utama = workflow prompt AI tools generik | ASUMSI — belum dimapping | Positioning bisa overlap |

### 7.2 Batasan Bisnis

| ID | Batasan | Sumber |
|---|---|---|
| LIM-01 | Tidak boleh ubah stack — Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + next-intl | `AGENTS.md S3` |
| LIM-02 | Tidak boleh install AI SDK v6 — tetap v4 | `AGENTS.md S3, CRIT-002` |
| LIM-03 | Tidak boleh push langsung ke main — lewat PR | `AGENTS.md S4` (L20) |
| LIM-04 | Tidak boleh hardcode teks — pakai `useTranslations` next-intl | `AGENTS.md S4` (L09) |
| LIM-05 | Tidak boleh Client Component untuk hal yang tidak butuh interaksi | `AGENTS.md S4` |
| LIM-06 | Design tokens wajib konsisten dengan `globals.css` | `RAG-CONTEXT.md S4.1, UIUX_SPEC S2` |
| LIM-07 | Respect `prefers-reduced-motion` | `RAG-CONTEXT.md S7.3`, `globals.css:74-80` |
| LIM-08 | A11y WCAG 2.1 AA — focus visible, keyboard nav, kontras | `AGENTS.md S4`, `UIUX_SPEC S9` |
| LIM-09 | i18n dwibahasa wajib — ID + EN sinkron | `AGENTS.md S4` |
| LIM-10 | Bundle size impact — Framer Motion ~30KB gzipped acceptable | `RAG-CONTEXT.md S7.1` |
| LIM-11 | V1 codebase tidak boleh di-overwrite — V2 = additive | `AGENTS.md S1 CRIT-001` |
| LIM-12 | Conventional commit — `feat(landing): ...`, atomic | `AGENTS.md S4` |
| LIM-13 | No secret client-side — API key tetap server-only | `AGENTS.md S4, L07` |

---

## 8. Risiko Bisnis dan Mitigasi

| ID | Risiko | Dampak | Probabilitas | Mitigasi |
|---|---|---|---|---|
| RISK-01 | Animasi berlebihan — bounce naik, perf turun | Tinggi | Sedang | Framer Motion sparingly; respect reduced-motion; Lighthouse >= 85; bundle <= 50KB tambahan |
| RISK-02 | Salah describe produk (pakai "document generation") | Tinggi | Rendah | Pakai deskripsi dari dokumen proyek; validasi dengan founder sebelum publish |
| RISK-03 | Social proof kosong/placeholder — visitor ragu | Sedang | Tinggi | Tampilkan placeholder jujur "Be among the first"; fokus value-prop |
| RISK-04 | Tidak ada product screenshot asli — hero kurang convincing | Sedang | Tinggi | Pakai text-based mockup generate flow atau ilustrasi SVG |
| RISK-05 | CTA `Mulai Gratis` salah link ke `/generate` (butuh auth) — friction | Tinggi | Sedang | Primary CTA ke `/register`, secondary ke `/generate` |
| RISK-06 | Mobile rendering buruk (50%+ trafik) | Tinggi | Rendah | Mobile-first design; test di 375/768/1024/1440px |
| RISK-07 | Konflik V1 codebase (overwrite page.tsx) | Tinggi | Rendah | Overwrite page.tsx = intended; tidak ubah route lain |
| RISK-08 | Lighthouse Performance turun setelah Framer Motion | Sedang | Sedang | Lazy load below-fold; code-split; test di CI |
| RISK-09 | i18n keys tidak sinkron ID vs EN | Sedang | Sedang | Review manual + CI lint check |
| RISK-10 | Visitor tidak tertarik positioning "AI animation prompt" | Tinggi | Rendah | Validasi via interview 3-5 target user |
| RISK-11 | Brand perception "open source / side project" | Sedang | Sedang | Dark mode techno-futurist + animasi high-craft |
| RISK-12 | Tidak ada analytics — KPI tidak terukur | Tinggi | Tinggi | Wajib pasang Vercel Analytics bersamaan launch |
| RISK-13 | Kompetitor copy strategi visual serupa | Rendah | Sedang | Diferensiasi via workflow unik + copy spesifik |
| RISK-14 | Scope creep — tambah section di luar 12 pattern | Sedang | Sedang | Patuhi SCOPE-01..15; tambahan masuk backlog V3 |
| RISK-15 | Bundle size naik karena shadcn/ui components baru | Rendah | Rendah | Tree-shake per component; `next/dynamic` untuk heavy block |

---

## Lampiran A — Section Plan Landing Page

Berdasarkan `RAG-CONTEXT.md S5.1`:

| # | Section | Tujuan | Sumber |
|---|---|---|---|
| 1 | Navbar | Navigasi + brand + CTA sticky | S5.1 |
| 2 | Hero | Hook 10 detik + benefit headline + dual CTA + product visual | S5.2 |
| 3 | Social Proof Bar | Trust awal (user count / logo / rating) — placeholder | S5.1 |
| 4 | Problem / Solution | Resonansi pain point kreator | S5.1 |
| 5 | How It Works | 3-4 step visual (Input, Generate, Export) | S5.1 |
| 6 | Features Bento Grid | Diferensiasi fitur utama | S5.1 |
| 7 | Product Demo | Visual mockup generate flow / live preview | S5.2 |
| 8 | Testimonials | Social proof mendalam (3+ placeholder) | S5.1 |
| 9 | FAQ | Objection handling (5-6 Q) | S5.1, S5.3 |
| 10 | Final CTA | Repeat primary CTA + urgency | S5.1 |
| 11 | Footer | Copyright + links + social | S5.1 |

> **Catatan:** Pricing section dilewati karena tidak ada model pricing didefinisikan (`RAG-CONTEXT.md GAP-04`). Bila model pricing muncul nanti, tambahkan sebagai section #9.5.

---

## Lampiran B — Definisi Done

- [ ] Redesign `src/app/[locale]/page.tsx` dengan 11 section sesuai Lampiran A
- [ ] Framer Motion terinstall dan digunakan: fade-in on scroll, stagger, hover scale
- [ ] `messages/id.json` + `messages/en.json` namespace `landing.*` di-expand
- [ ] i18n keys sinkron ID vs EN
- [ ] Navbar + Footer component dibuat
- [ ] Dark mode default aktif (techno-futurist aesthetic)
- [ ] Primary violet `#7c3aed` konsisten di semua CTA
- [ ] Mobile responsive di 375 / 768 / 1024 / 1440px
- [ ] `prefers-reduced-motion` respected
- [ ] Lighthouse Performance mobile >= 85
- [ ] WCAG 2.1 AA compliance
- [ ] `pnpm lint` 0 error + `pnpm typecheck` 0 error + `pnpm build` pass
- [ ] Vercel Analytics terpasang + event tracking aktif
- [ ] OG image placeholder + meta tags SEO lengkap
- [ ] Preview deploy ke Vercel sukses + visual review

---

## Lampiran C — Referensi Dokumen

| # | Dokumen | Path |
|---|---|---|
| 1 | RAG-CONTEXT | `product-docs/RAG-CONTEXT.md` |
| 2 | AGENTS.md V2 | `product-docs/AGENTS.md` |
| 3 | UIUX_SPEC | `product-docs/UIUX_SPEC.md` |
| 4 | PRD | `product-docs/PRD.md` |
| 5 | MRD | `product-docs/MRD.md` |
| 6 | CODING_RULES | `product-docs/CODING_RULES.md` |

---

> **Dokumen ini = kontrak bisnis untuk landing page redesign. Eksekutor teknis cukup baca BRD ini + RAG-CONTEXT.md + AGENTS.md + UIUX_SPEC.md untuk mengeksekusi. Klaim tanpa bukti = ASUMSI (ditandai eksplisit).**

**Dibuat oleh:** docgen-brd subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0
