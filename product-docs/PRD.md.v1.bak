# PRD — Product Requirement Document
## PromptFlow Landing Page Redesign

> **Versi:** 1.0 | **Tanggal:** 2026-06-20 | **Pemilik:** Product Owner PromptFlow
> **Deliverable:** Landing page src/app/[locale]/page.tsx (frontend-only, public route)
> **Selaras dengan:** BRD.md (why) + MRD.md (who)
> **Rujukan:** RAG-CONTEXT.md (fakta) + AGENTS.md (build V2) + UIUX_SPEC.md (design system)

---

## 1. Ringkasan Produk + Visi

**PromptFlow** = web app fullstack otomasi susun paket prompt animasi AI terstruktur (JSON + Markdown) dari input minimal (judul + durasi + gaya). Multi-provider LLM. Konsistensi karakter lintas adegan. V1 sudah built (9 tabel DB, 23 endpoint, NextAuth, SSE streaming).

**Landing page** = satu-satunya halaman publik. Tiga fungsi:
1. **Akuisisi** — konversi visitor ke registered user via CTA Mulai Gratis
2. **Brand** — persepsi AI-first, profesional lewat dark mode + violet #7c3aed + Framer Motion
3. **Edukasi** — value proposition dalam 10 detik + FAQ objection handling

**Visi:** Visitor paham PromptFlow hilangkan friksi manual susun prompt, klik Mulai Gratis dalam < 60 detik.

### Prinsip Produk

| ID | Prinsip | Manifestasi |
|---|---|---|
| P-01 | 10-second rule | Hero: apa + kenapa + CTA dalam 10 detik |
| P-02 | 1:1 attention ratio | 1 halaman = 1 tujuan (sign-up) |
| P-03 | Benefit > feature | Headline fokus hasil, bukan AI-powered |
| P-04 | Show don't tell | Product demo mockup > text |
| P-05 | Trust through craft | High-craft animasi + dark mode |
| P-06 | Mobile-first | Design dari 375px ke atas |
| P-07 | Dwibahasa sinkron | ID + EN paralel |
| P-08 | Reduced motion | prefers-reduced-motion honored |

**Value Proposition:** "Satu judul → paket prompt animasi siap pakai. Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown."

---

## 2. Persona + User Story / Job-to-be-Done

### 2.1 Persona (Selaras MRD S2.1)

| ID | Persona | Segmen | Skill | Device | Sitasi |
|---|---|---|---|---|---|
| PERS-01 | Rian (Solo Creator) | Kreator konten pendek AI | Mid | 60% mobile | MRD.md S2.1 |
| PERS-02 | Bumi Animasi (Indie Studio) | Studio animasi 2-10 orang | Mid-advanced | 40% mobile | MRD.md S2.1 |
| PERS-03 | Bu Sinta (Edukator) | Tutorial maker | Low-mid | 70% mobile | MRD.md S2.1 |
| PERS-04 | End Visitor (Anonymous) | Calon user, belum sign-up | Varied | 50%+ mobile | BRD.md STK-08 |

### 2.2 User Story

**Rian (Solo Creator)**

| ID | User Story | Acceptance |
|---|---|---|
| US-R01 | Lihat dalam 5 detik bahwa PromptFlow generate paket prompt dari 1 judul | Hero headline sebut "satu judul → paket prompt" |
| US-R02 | Lihat workflow 3 langkah tanpa scroll panjang | How It Works section 3 step visual |
| US-R03 | Baca FAQ tentang multi-provider LLM | FAQ item tentang provider flexibility |
| US-R04 | Klik Mulai Gratis dari mobile tanpa horizontal scroll | CTA visible + accessible di mobile |

**Bumi Animasi (Indie Studio)**

| ID | User Story | Acceptance |
|---|---|---|
| US-B01 | Lihat konsistensi karakter disebut eksplisit | Feature card Character Master prominent |
| US-B02 | Lihat export JSON + Markdown sebagai bukti output terstruktur | Feature card Structured Export + contoh snippet |
| US-B03 | Share landing ke tim via link | Share button + OG image preview |

**Bu Sinta (Edukator)**

| ID | User Story | Acceptance |
|---|---|---|
| US-S01 | Baca landing dalam Bahasa Indonesia | Default locale = id |
| US-S02 | Pahami produk tanpa jargon teknis | Copy plain-language |
| US-S03 | Lihat cara mulai yang jelas | Final CTA + How It Works |

**End Visitor (Anonymous)**

| ID | User Story | Acceptance |
|---|---|---|
| US-V01 | Tahu dalam 10 detik apa produk, kenapa perlu, next step | Hero 3-in-1 (apa/kenapa/CTA) |
| US-V02 | Lihat trust signal sebelum scroll jauh | Social proof bar setelah hero |
| US-V03 | Baca FAQ tanpa kontak support | FAQ 5-6 item |

### 2.3 Job-to-be-Done

> When saya (kreator animasi AI) want to generate paket prompt animasi terstruktur tanpa susun manual per adegan, I need to find tool yang otomasi generate paket dari input minimal dengan konsistensi karakter, so I can fokus ke storytelling & produksi.

**Outcome:** Visitor → < 60 detik → paham value → klik Mulai Gratis → sign-up.

---

## 3. Daftar Fitur Prioritas MoSCoW

Total 11 section + 9 cross-cutting fitur. Selaras BRD.md Lampiran A.

| Prioritas | ID | Section/Fitur | Deskripsi | Sumber |
|---|---|---|---|---|
| MUST | F-01 | Navbar | Logo + nav links + language toggle + CTA sticky | BRD SCOPE-06 |
| MUST | F-02 | Hero | Headline benefit + subheadline + dual CTA + product visual | BRD SCOPE-10 |
| MUST | F-03 | Social Proof Bar | User count placeholder + logo row + rating | BRD SCOPE-07 |
| MUST | F-04 | Problem / Solution | 3 pain points → 3 solusi PromptFlow | RAG-CONTEXT S5.1 |
| MUST | F-05 | How It Works | 3 step: Input → Generate → Export | BRD SCOPE-09 |
| MUST | F-06 | Features Bento Grid | 6 feature cards bento layout | RAG-CONTEXT S5.1 |
| MUST | F-07 | Product Demo | Browser mockup generate flow animated | BRD SCOPE-10 |
| MUST | F-08 | Testimonials | 3 placeholder testimonial cards | BRD SCOPE-07 |
| MUST | F-09 | FAQ | 5-6 Q&A accordion objection handling | BRD SCOPE-08 |
| MUST | F-10 | Final CTA | Repeat primary CTA + urgency line | RAG-CONTEXT S5.1 |
| MUST | F-11 | Footer | Copyright + links + social + language toggle mobile | BRD SCOPE-06 |
| SHOULD | F-12 | Animations (Framer Motion) | Fade-in scroll, stagger, hover scale, gradient shift | BRD SCOPE-04 |
| SHOULD | F-13 | Dark Mode Default | Techno-futurist aesthetic, light optional | BRD SCOPE-13 |
| SHOULD | F-14 | SEO Meta Tags | Title + description + OG image + canonical | BRD SCOPE-14 |
| SHOULD | F-15 | Analytics (Vercel Analytics) | Event tracking CTA/FAQ/scroll | BRD SCOPE-15 |
| SHOULD | F-16 | Mobile Responsive | Tested 375/768/1024/1440px | BRD SCOPE-12 |
| COULD | F-17 | Light Mode Toggle | User pref override dark | BRD SCOPE-13 |
| COULD | F-18 | Pricing Placeholder | Skeleton section future pricing | BRD OOS-04 |
| COULD | F-19 | Blog Teaser | 3 blog post links (jika ada) | Backlog V3 |
| COULD | F-20 | Video Demo | YouTube/Vimeo embed (jika ada) | Backlog V3 |
| WON'T | F-21 | Pricing tier asli | Tidak ada model pricing | RAG-CONTEXT GAP-04 |
| WON'T | F-22 | Login form inline | Sudah ada /login route | BRD OOS-08 |
| WON'T | F-23 | Generate form inline | Generate di /generate setelah auth | BRD OOS-07 |
| WON'T | F-24 | Custom logo ilustrasi | Text-based logo violet | BRD OOS-01 |

**Ringkasan:** MUST: 11 | SHOULD: 5 | COULD: 4 | WON'T: 4

---

## 4. Functional Requirement Detail per Fitur

Format: ID | Input | Proses | Output | Acceptance Hint

### F-01 Navbar (FR-LP-01)

| Field | Detail |
|---|---|
| Input | Click logo / nav link / language toggle / CTA |
| Proses | (a) Logo → scroll-top. (b) Nav link → smooth scroll ke #features/#how-it-works/#faq. (c) Language toggle → switch locale via next-intl. (d) CTA → navigate ke /register |
| Output | Smooth scroll / locale switch / route ke /register |
| Acceptance | Sticky top. Bg transparan → solid setelah scroll 50px. CTA visible di semua viewport |
| Visual | Logo kiri + nav tengah (Fitur, Cara Kerja, FAQ) + toggle + CTA kanan |
| i18n keys | landing.nav.features, landing.nav.howItWorks, landing.nav.faq, landing.nav.cta |

### F-02 Hero (FR-LP-02)

| Field | Detail |
|---|---|
| Input | Viewport load / click CTA / hover button |
| Proses | Render headline + subheadline + 2 CTA + product visual mockup. Entrance: fade-in + slide-up stagger. Bg: gradient violet subtle |
| Output | Hook 10 detik. Primary CTA → /register. Secondary → /login |
| Acceptance | Headline terbaca < 3 detik. CTA kontras >= 4.5:1. Mockup tidak overlap text di mobile |
| Visual | Headline text-5xl md:text-6xl weight 800. Subheadline text-lg md:text-xl muted. 2 button (primary filled violet, secondary outline). Mockup kanan (desktop) / bawah (mobile) |
| i18n keys | landing.heroTitle, landing.heroSubtitle, landing.heroCtaPrimary, landing.heroCtaSecondary |
| Risk | RISK-02 (BRD): deskripsi HARUS animation prompt automation, BUKAN document generation |

### F-03 Social Proof Bar (FR-LP-03)

| Field | Detail |
|---|---|
| Input | Viewport scroll |
| Proses | Render placeholder: "Dipercaya X kreator AI" + 5-6 logo placeholder SVG/text + rating stars |
| Output | Trust signal awal |
| Acceptance | Visible max 200px di bawah hero. Logo grayscale 60%, hover full color |
| Visual | Horizontal row. Logo placeholder text brand fiktif sampai data real tersedia |
| i18n keys | landing.socialProof.headline, landing.socialProof.subheadline |
| Risk | RISK-03 (BRD): placeholder jujur "Be among the first" |

### F-04 Problem / Solution (FR-LP-04)

| Field | Detail |
|---|---|
| Input | Viewport scroll |
| Proses | 3 pain points (icon + text merah/amber) → transisi → 3 solusi (icon + text violet). Stagger fade-in |
| Output | Resonansi pain point kreator |
| Acceptance | 3 pain points spesifik. Solusi mapping langsung ke pain point |
| Visual | 2 kolom desktop, stack mobile |
| Pain points (ASUMSI) | (a) Susun prompt per adegan = 30+ menit. (b) Karakter inkonsisten. (c) Ketergantungan 1 provider |
| Solutions | (a) Generate paket instan. (b) Character master otomatis. (c) Multi-provider fleksibel |
| i18n keys | landing.problemSolution.problem1Title/Desc + solution1Title/Desc (3 pasang) |

### F-05 How It Works (FR-LP-05)

| Field | Detail |
|---|---|
| Input | Viewport scroll |
| Proses | Render 3 step visual + connector arrow. Step 1 Input (judul+durasi+gaya). Step 2 Generate (LLM animated). Step 3 Export (JSON+MD) |
| Output | Edukasi workflow sederhana |
| Acceptance | 3 step max. Tiap step: icon + judul + 1 kalimat + mini-screenshot opsional |
| Visual | Horizontal 3 kolom desktop + connector. Vertical timeline mobile. Step number besar 1/2/3 |
| i18n keys | landing.howItWorks.step1Title/Desc + step2 + step3 |

### F-06 Features Bento Grid (FR-LP-06)

| Field | Detail |
|---|---|
| Input | Hover / click feature card |
| Proses | Render 6 card dalam bento grid (1 besar + 5 kecil). Hover: scale 1.02 + violet border glow |
| Output | Diferensiasi fitur utama |
| Acceptance | 6 card max. Tiap card: icon + judul + 1-2 kalimat + mini-visual opsional. Bento asymmetric (1 col-span-2) |
| Visual | Bento grid Tailwind grid-cols-3 + col-span variants. Bg: subtle violet tint dark |
| Features (6) | (a) Input Minimal (b) Character Master (c) Multi-Provider LLM (d) Export JSON+MD (e) Real-time Logs (f) Upload Referensi |
| i18n keys | landing.features.title + f1Title/Desc sampai f6Title/Desc |

### F-07 Product Demo (FR-LP-07)

| Field | Detail |
|---|---|
| Input | Viewport scroll (auto-play on enter) |
| Proses | Render mockup browser-style: form input kiri → animasi typing → loading → result preview JSON kanan. Loop 8-10 detik |
| Output | Bukti produk works tanpa screenshot asli |
| Acceptance | Mockup recognizable PromptFlow. Loop smooth. Pause on hover opsional |
| Visual | Browser chrome wrapper (3 dot traffic light). Code snippet area syntax highlight violet |
| Mockup content | Input: "Petualangan Kiko di Pasar Malam" / 60s / 3D. Output: JSON snippet |
| i18n keys | landing.demo.title + inputLabel + outputLabel |

### F-08 Testimonials (FR-LP-08)

| Field | Detail |
|---|---|
| Input | Viewport scroll |
| Proses | Render 3 card placeholder. Tiap card: avatar placeholder (initials/SVG) + nama + role + quote + metric opsional |
| Output | Social proof mendalam |
| Acceptance | 3 card min. Quote max 25 kata. Bold pain → outcome. Avatar placeholder jelas |
| Visual | 3 kolom desktop, carousel/swipe mobile. Bg dark + border subtle violet |
| Placeholder testimonial (ASUMSI) | (a) "Hemat 3 jam per video." Kreator Solo. (b) "Akhirnya karakter konsisten." Studio Animasi. (c) "Murid paham 5 menit." Edukator |
| i18n keys | landing.testimonials.title + t1Quote/Name/Role (3x) |
| Risk | RISK-03: label jelas "Cerita dari beta tester" untuk transparansi |

### F-09 FAQ (FR-LP-09)

| Field | Detail |
|---|---|
| Input | Click FAQ item |
| Proses | Render accordion 5-6 Q&A. Click expand/collapse animated. Default collapsed. Multi-open allowed (ASUMSI) |
| Output | Objection handling |
| Acceptance | 5-6 Q&A. Jawaban max 2 kalimat. Smooth expand (height auto + opacity). Chevron rotate on open |
| Visual | Accordion shadcn/ui. Icon + chevron |
| FAQ items (ASUMSI) | (a) Provider LLM apa didukung? (b) Gratis? (c) Konsistensi karakter gimana? (d) Data aman? (e) Bisa mobile? (f) Bahasa didukung? |
| i18n keys | landing.faq.title + q1-q6 (object question + answer) |

### F-10 Final CTA (FR-LP-10)

| Field | Detail |
|---|---|
| Input | Click CTA button |
| Proses | Render repeat primary CTA + urgency line + secondary CTA. Bg gradient violet bold |
| Output | Closing conversion |
| Acceptance | CTA visible tanpa scroll. Urgency jujur (no fake countdown). Fade-in animation |
| Visual | Full-width violet gradient. Headline besar + CTA white-on-violet |
| Copy (ASUMSI) | "Mulai buat paket prompt pertama dalam 60 detik." CTA: Mulai Gratis. "Tanpa kartu kredit. Tanpa komitmen." |
| i18n keys | landing.finalCta.title + subtitle + button + disclaimer |

### F-11 Footer (FR-LP-11)

| Field | Detail |
|---|---|
| Input | Click link |
| Proses | Render footer minimal: brand + copyright + nav links + social icons (GitHub, Twitter/X) + language toggle mobile |
| Output | Navigasi sekunder + legal |
| Acceptance | 4 kolom desktop. Stack 1 kolom mobile. Bg dark muted. Border-top subtle |
| i18n keys | landing.footer.tagline + copyright + productLinks + legalLinks + social/github/twitter |

### F-12 Animations (FR-LP-12) — Cross-cutting

| Field | Detail |
|---|---|
| Input | Viewport scroll / hover / page load |
| Proses | (a) Fade-in on scroll (whileInView). (b) Stagger children. (c) Hover scale 1.02. (d) Gradient shift CSS keyframes. (e) Counter animation |
| Output | Engagement + premium feel |
| Acceptance | Bundle Framer Motion <= 35KB gzipped. Respect prefers-reduced-motion. GPU-accelerated only. CLS <= 0.1 |
| Dependency | Install framer-motion (latest stable) |

### F-13 Dark Mode Default (FR-LP-13) — Cross-cutting

| Field | Detail |
|---|---|
| Input | Page load |
| Proses | Force dark mode via html class dark atau next-themes. Design tokens existing globals.css:50-66 |
| Output | Techno-futurist aesthetic konsisten |
| Acceptance | Default dark. Kontras teks >= WCAG AA. Light mode opsional via toggle (F-17 COULD) |
| Visual | Bg #0a0a0a, fg #fafafa, primary #a78bfa (dark), accent #3b0764 |

### F-14 SEO Meta Tags (FR-LP-14) — Cross-cutting

| Field | Detail |
|---|---|
| Input | Page render |
| Proses | Set Metadata via Next.js generateMetadata. Title <= 60 char. Description <= 160 char. OG image 1200x630. Canonical + hreflang id/en |
| Output | Share preview menarik + search rich result |
| Acceptance | Title valid. OG image valid. Alternate hreflang set |
| i18n keys | landing.seo.title + description + ogAlt |

### F-15 Analytics (FR-LP-15) — Cross-cutting

| Field | Detail |
|---|---|
| Input | User interaction |
| Proses | Install @vercel/analytics. Track: cta_hero_click, cta_final_click, faq_expand, scroll_75, language_toggle |
| Output | KPI measurable (BRD KPI-01..07) |
| Acceptance | Events fired. Dashboard accessible. No PII |

### F-16 Mobile Responsive (FR-LP-16) — Cross-cutting

| Field | Detail |
|---|---|
| Input | Viewport resize |
| Proses | Mobile-first CSS via Tailwind. Breakpoints: sm:640, md:768, lg:1024, xl:1280 |
| Output | Optimal rendering semua device |
| Acceptance | No horizontal scroll 375px. CTA thumb-zone. Text legible tanpa zoom |

---

## 5. Non-Functional Requirement

### 5.1 Performa

| ID | Kriteria | Target | Sumber |
|---|---|---|---|
| NFR-P01 | Lighthouse Performance (mobile) | >= 85 | BRD KPI-08 |
| NFR-P02 | LCP | <= 2.5s | BRD KPI-09 |
| NFR-P03 | CLS | <= 0.1 | BRD KPI-10 |
| NFR-P04 | TBT | <= 200ms | ASUMSI best practice |
| NFR-P05 | Bundle tambahan (Framer Motion) | <= 50KB gzipped | RAG-CONTEXT S7.1 |
| NFR-P06 | TTI | <= 3.5s | ASUMSI |
| NFR-P07 | FCP | <= 1.8s | ASUMSI |

### 5.2 Keamanan

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-S01 | No secret client-side | Landing = frontend-only, no API key | AGENTS.md L07 |
| NFR-S02 | HTTPS only | Vercel default | AGENTS.md SEC-09 |
| NFR-S03 | No LLM call client-side | CTA ke /register dulu | AGENTS.md L24 |
| NFR-S04 | No PII in analytics | Vercel Analytics anonymous only | BRD RISK-12 |

### 5.3 Aksesibilitas (a11y)

| ID | Kriteria | Target | Sumber |
|---|---|---|---|
| NFR-A01 | WCAG compliance | 2.1 AA | AGENTS.md |
| NFR-A02 | Kontras teks | >= 4.5:1 body, >= 3:1 large | UIUX_SPEC S9 |
| NFR-A03 | Keyboard nav | Semua interactive reachable + focus ring | UIUX_SPEC S9 |
| NFR-A04 | Screen reader | Landmark + ARIA labels accordion | UIUX_SPEC S9 |
| NFR-A05 | Alt text | Semua image punya alt atau aria-hidden | UIUX_SPEC S9 |
| NFR-A06 | Reduced motion | Respect prefers-reduced-motion | RAG-CONTEXT S7.3 |
| NFR-A07 | Bahasa declaration | html lang id atau en per locale | AGENTS.md |

### 5.4 UX/Desain

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-U01 | Design tokens | Pakai globals.css. Tidak hardcode | RAG-CONTEXT S4.1 |
| NFR-U02 | Brand voice | Profesional hangat, edukatif, ringkas | UIUX_SPEC S1.4 |
| NFR-U03 | Tone visual | Techno-futurist (Linear/Vercel style) | RAG-CONTEXT S6.3 |
| NFR-U04 | Spacing rhythm | Consistent space-12 (48px) antar section | UIUX_SPEC S2.5 |

### 5.5 i18n

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-I01 | Dwibahasa | ID (default) + EN paralel | AGENTS.md |
| NFR-I02 | Locale routing | URL /{locale}/... Default redirect /id | next-intl config |
| NFR-I03 | Language toggle | Preserves scroll position | RAG-CONTEXT S4.5 |
| NFR-I04 | No hardcoded text | Semua via useTranslations('landing') | AGENTS.md L09 |
| NFR-I05 | CTA kontekstual | Copy per bahasa, bukan translate literal | MRD S4.4 |

### 5.6 SEO & Sharing

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-SE01 | Title | <= 60 char + brand PromptFlow | Best practice |
| NFR-SE02 | Meta description | <= 160 char + CTA | Best practice |
| NFR-SE03 | OG image | 1200x630px | BRD SCOPE-14 |
| NFR-SE04 | Canonical URL | Per locale | Best practice |
| NFR-SE05 | Hreflang | Alternate id + en | Best practice |

### 5.7 Maintainability

| ID | Kriteria | Detail | Sumber |
|---|---|---|---|
| NFR-M01 | Component modular | 1 section = 1 file di src/components/landing/ | Best practice |
| NFR-M02 | TypeScript strict | No any (L06) | AGENTS.md |
| NFR-M03 | Lint + Typecheck | pnpm lint 0 error + typecheck 0 error | AGENTS.md |
| NFR-M04 | Conventional commit | feat(landing): ... atomic | AGENTS.md |
| NFR-M05 | No direct push main | Via PR + review | AGENTS.md L20 |

---

## 6. Acceptance Criteria per Section

### AC-01 Navbar
- [ ] Logo kiri text PromptFlow violet, link ke #top
- [ ] Nav links tengah: Fitur, Cara Kerja, FAQ (anchor scroll)
- [ ] Language toggle (ID | EN)
- [ ] CTA Mulai Gratis kanan (filled violet, link /register)
- [ ] Sticky top. Bg transparan ke solid setelah scroll 50px (smooth transition)
- [ ] Mobile 375px: hamburger menu (ASUMSI)
- [ ] Focus ring visible di semua link/button (keyboard nav)
- [ ] i18n keys lengkap ID + EN

### AC-02 Hero
- [ ] Headline terbaca dalam 3 detik: jelas apa + kenapa
- [ ] Subheadline menjelaskan 3 value utama
- [ ] 2 CTA: primary Mulai Gratis → /register + secondary Masuk → /login
- [ ] Product visual mockup kanan (desktop) / bawah (mobile). Tidak overlap text
- [ ] Bg gradient violet subtle. Animated noise opsional
- [ ] Entrance: fade-in + slide-up stagger (Framer Motion)
- [ ] Respect prefers-reduced-motion
- [ ] i18n keys lengkap

### AC-03 Social Proof Bar
- [ ] Visible max 200px di bawah hero
- [ ] Headline: Dipercaya X kreator AI (placeholder 100+ atau ratusan)
- [ ] 5-6 logo placeholder (SVG/text, grayscale 60%)
- [ ] Hover: logo full color + scale 1.02
- [ ] Rating stars: 4.8/5 placeholder label beta tester
- [ ] i18n keys lengkap

### AC-04 Problem / Solution
- [ ] 3 pain points spesifik
- [ ] 3 solutions mapping langsung ke pain points
- [ ] 2 kolom desktop, stack mobile
- [ ] Icon tiap item (lucide-react)
- [ ] Entrance: stagger fade-in
- [ ] i18n keys lengkap

### AC-05 How It Works
- [ ] 3 step: Input → Generate → Export
- [ ] Step number besar 1/2/3
- [ ] Icon + judul + 1 kalimat penjelasan per step
- [ ] Connector arrow antar step (desktop)
- [ ] Vertical timeline mobile
- [ ] i18n keys lengkap

### AC-06 Features Bento Grid
- [ ] 6 card bento asymmetric layout
- [ ] Fitur utama (Character Master) col-span-2
- [ ] Tiap card: icon + judul + 1-2 kalimat
- [ ] Hover: scale 1.02 + violet border glow
- [ ] Entrance: stagger fade-in viewport
- [ ] i18n keys lengkap

### AC-07 Product Demo
- [ ] Browser chrome wrapper dengan traffic light dots
- [ ] Form input mockup kiri (judul, durasi, gaya)
- [ ] Animated typing effect input (loop 8-10s)
- [ ] Loading state dengan progress bar violet
- [ ] Result preview kanan: JSON snippet syntax highlight
- [ ] Pause on hover (opsional)
- [ ] i18n keys lengkap

### AC-08 Testimonials
- [ ] 3 card testimonial
- [ ] Avatar placeholder (initials dalam lingkaran violet)
- [ ] Quote max 25 kata. Pain → outcome
- [ ] Nama + role + (opsional) metric angka
- [ ] Label jelas Cerita dari beta tester (transparansi placeholder)
- [ ] 3 kolom desktop, carousel swipe mobile
- [ ] i18n keys lengkap

### AC-09 FAQ
- [ ] 5-6 Q&A accordion
- [ ] Default collapsed
- [ ] Multi-open allowed
- [ ] Smooth expand (height auto + opacity)
- [ ] Chevron rotate 90° on open
- [ ] i18n keys lengkap

### AC-10 Final CTA
- [ ] Full-width bg violet gradient
- [ ] Headline + subheadline + CTA + disclaimer
- [ ] CTA Mulai Gratis white-on-violet
- [ ] Disclaimer: Tanpa kartu kredit. Tanpa komitmen.
- [ ] Visible tanpa scroll
- [ ] i18n keys lengkap

### AC-11 Footer
- [ ] 4+ kolom desktop: Brand + Product + Legal + Social
- [ ] Stack 1 kolom mobile
- [ ] Bg dark muted. Border-top subtle
- [ ] Copyright + nav links + social icons (GitHub, Twitter/X)
- [ ] Language toggle (mobile only)
- [ ] i18n keys lengkap

### AC-12 Animations (Cross-cutting)
- [ ] Framer Motion terinstall
- [ ] Fade-in on scroll di setiap section
- [ ] Stagger children di feature cards + testimonial cards
- [ ] Hover scale di cards + CTA
- [ ] Gradient shift animation di hero bg
- [ ] Counter animation stat numbers
- [ ] Bundle tambahan <= 50KB gzipped
- [ ] prefers-reduced-motion respected (semua disabled)

### AC-13 SEO Meta
- [ ] Title <= 60 char: PromptFlow — Workflow Otomasi Prompt Animasi AI
- [ ] Description <= 160 char
- [ ] OG image 1200x630
- [ ] Canonical URL per locale
- [ ] Hreflang alternate id + en

### AC-14 Analytics
- [ ] @vercel/analytics terinstall
- [ ] Track cta_hero_click
- [ ] Track cta_final_click
- [ ] Track faq_expand (per item)
- [ ] Track scroll_75
- [ ] Track language_toggle
- [ ] No PII collected

### AC-15 Quality Gates
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] LCP <= 2.5s, CLS <= 0.1
- [ ] axe-core: 0 critical a11y violation
- [ ] Tested di 375/768/1024/1440px viewport
- [ ] Conventional commit feat(landing): ...
- [ ] PR reviewed + merged (no direct push main)

---

## 7. Spesifikasi Deliverable Konkret

### 7.1 Struktur File

| Path | Tipe | Deskripsi |
|---|---|---|
| src/app/[locale]/page.tsx | Server Component | Root landing page. OVERWRITE existing |
| src/components/landing/navbar.tsx | Client Component | Navbar sticky + scroll detection |
| src/components/landing/hero.tsx | Client Component | Hero + Framer Motion entrance |
| src/components/landing/social-proof-bar.tsx | Client Component | Logo row + counter animation |
| src/components/landing/problem-solution.tsx | Client Component | 2 kolom pain/solution |
| src/components/landing/how-it-works.tsx | Client Component | 3 step connector |
| src/components/landing/features-bento.tsx | Client Component | Bento grid 6 card |
| src/components/landing/product-demo.tsx | Client Component | Browser mockup animated |
| src/components/landing/testimonials.tsx | Client Component | 3 card carousel/grid |
| src/components/landing/faq.tsx | Client Component | Accordion shadcn/ui |
| src/components/landing/final-cta.tsx | Client Component | Section gradient violet |
| src/components/landing/footer.tsx | Server Component | Footer minimal |
| src/components/landing/section-wrapper.tsx | Client Component | Reusable whileInView + stagger wrapper |
| src/components/landing/animated-counter.tsx | Client Component | Counter angka Framer Motion |
| src/components/landing/browser-mockup.tsx | Client Component | Browser chrome frame reusable |
| src/components/landing/feature-card.tsx | Client Component | 1 feature card hover scale |
| src/components/landing/testimonial-card.tsx | Client Component | 1 testimonial card |
| src/components/landing/faq-item.tsx | Client Component | 1 accordion item |
| src/components/landing/logo-placeholder.tsx | Server Component | SVG/text logo placeholder |
| src/lib/landing/sections.ts | Module | Section IDs untuk nav anchor |
| messages/id.json | JSON | Namespace landing.* di-expand |
| messages/en.json | JSON | Namespace landing.* di-expand paralel |
| src/app/[locale]/layout.tsx | Server Component | html lang id atau en |
| src/app/layout.tsx (root) | Server Component | Metadata + OG + Analytics script |
| public/og/og-image.jpg | Aset | OG image placeholder 1200x630 |

### 7.2 Urutan Section

`
1. Navbar        — sticky transparent to solid
2. Hero          — headline + sub + 2 CTA + mockup
3. SocialProofBar — trust signal
4. ProblemSolution — pain ke solution
5. HowItWorks    — 3 step
6. FeaturesBento — 6 features
7. ProductDemo   — browser mockup animation
8. Testimonials  — 3 quotes
9. FAQ           — 5-6 Q&A accordion
10. FinalCTA     — closing conversion
11. Footer       — minimal nav + legal
`

### 7.3 Copy per Section

**Hero (ID)**
- headline: Satu judul ke paket prompt animasi siap pakai (existing)
- subheadline: Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown. (existing)
- ctaPrimary: Mulai Gratis (existing) → /register
- ctaSecondary: Masuk (existing) → /login

**Hero (EN)**
- headline: One title → ready-to-use animation prompt pack
- subheadline: Character consistency across scenes. Multi-provider LLM. JSON / Markdown export.
- ctaPrimary: Start Free → /register
- ctaSecondary: Sign In → /login

**6 Features (ID)**

| # | Title | Description |
|---|---|---|
| 1 | Input Minimal | Masukkan judul + durasi + gaya. Sistem generate paket lengkap. |
| 2 | Character Master | Karakter terstruktur dirujuk lintas adegan — identitas tetap, adegan bervariasi. |
| 3 | Multi-Provider LLM | Pilih Ollama, OpenRouter, 9router, atau custom. Fleksibel biaya dan kualitas. |
| 4 | Export JSON + Markdown | Output terstruktur siap copy ke tool image/video gen favorit. |
| 5 | Real-time Logs | Pantau proses generate. Tahu apa yang AI kerjakan setiap detik. |
| 6 | Upload Referensi | Upload gambar referensi + AI klasifikasi otomatis. |

**6 FAQ (ID)**

| # | Question | Answer |
|---|---|---|
| 1 | Provider LLM apa saja yang didukung? | Ollama, OpenRouter, 9router, dan provider OpenAI-compatible custom. Ganti kapan saja di Settings. |
| 2 | Apakah PromptFlow gratis? | Saat ini gratis untuk semua user. Model pricing future diumumkan via blog dan email. |
| 3 | Bagaimana konsistensi karakter dijamin? | Character master tersimpan terstruktur dan dirujuk otomatis di setiap adegan. Edit master + regenerate scene tertentu. |
| 4 | Apakah data saya aman? | API key dienkripsi AES-256-GCM. Data di Turso DB (encrypted at rest). Tidak pernah kirim ke pihak ketiga. |
| 5 | Bisa dipakai di mobile? | Ya. Landing dan dashboard responsif. Generate optimal di desktop; mobile view + edit hasil. |
| 6 | Bahasa apa saja yang didukung? | Indonesia (default) + English. Lebih banyak bahasa berdasarkan permintaan.

### 7.4 Aset Wajib

| Aset | Path | Status | Catatan |
|---|---|---|---|
| framer-motion | package.json | WAJIB INSTALL | pnpm add framer-motion, ~30KB gzipped |
| @vercel/analytics | package.json | WAJIB INSTALL | pnpm add @vercel/analytics |
| OG Image | public/og/og-image.jpg | WAJIB BUAT | 1200x630 violet gradient + PromptFlow + tagline |
| Logo PromptFlow | N/A | TEXT-BASED | Text PromptFlow styling violet. BRD OOS-01 |
| Social proof logos | N/A | PLACEHOLDER | SVG text brand fiktif |
| Avatar testimonial | N/A | PLACEHOLDER | Initials dalam lingkaran violet |
| Browser mockup | N/A | CSS-INLINE | Div border + traffic light dots |
| Icons | lucide-react | READY | Sparkles, Zap, Download, Upload, Brain, Layers |

### 7.5 Layout Spec

| Section | Desktop 1024+ | Tablet 768-1023 | Mobile <768 |
|---|---|---|---|
| Navbar | Horizontal logo+nav+CTA | Sama kompak | Hamburger+logo+CTA |
| Hero | 2 kolom (60% text 40% mockup) atau center max-w-4xl | Stack center | Stack center mockup bawah |
| SocialProof | Horizontal row 6 logo | Scroll 6 logo | Scroll 4 logo |
| ProblemSolution | 2 kolom | 2 kolom | Stack |
| HowItWorks | 3 kolom + connector | 3 kolom stacked | Vertical timeline |
| FeaturesBento | Bento 3 col + col-span | Bento 2 col | Bento 1 col |
| ProductDemo | Mockup full-width max-w-5xl | Sama | overflow-x-auto |
| Testimonials | 3 kolom | 3 kolom stacked | 1 kolom carousel |
| FAQ | Accordion max-w-3xl centered | Sama | Sama |
| FinalCTA | Full-width bg gradient | Sama | Sama |
| Footer | 4 kolom | 2 kolom | 1 kolom stack |

### 7.6 Animasi Spec

| Pattern | Component | Implementasi |
|---|---|---|
| Fade-in scroll | section-wrapper.tsx | whileInView opacity 1 y:0 + initial opacity 0 y:20 + viewport once |
| Stagger children | features-bento.tsx, testimonials.tsx | Parent variants visible transition staggerChildren 0.1 |
| Hover scale | feature-card.tsx, CTA | whileHover scale 1.02 + whileTap scale 0.98 |
| Gradient shift | hero.tsx | CSS keyframes gradient + background-size 200% + animation 8s ease infinite |
| Counter | animated-counter.tsx | useMotionValue + useTransform + animate 0 ke target |
| Typing effect | product-demo.tsx | Framer Motion word-by-word atau CSS steps keyframes |
| Smooth scroll | navbar.tsx | scroll-behavior smooth CSS + scrollIntoView smooth |

---

## 8. Out of Scope Eksplisit

| ID | Item | Alasan | Sumber |
|---|---|---|---|
| OOS-01 | Custom logo PromptFlow (ilustrasi) | Tidak ada brief desain. Text-based logo. | BRD OOS-01 |
| OOS-02 | Pricing section tier | Tidak ada model pricing. Future V3. | BRD OOS-04 |
| OOS-03 | Payment integration | Produk gratis | BRD OOS-04 |
| OOS-04 | Login form inline | Sudah ada /login route | BRD OOS-08 |
| OOS-05 | Generate form inline | Generate di /generate setelah auth | BRD OOS-07 |
| OOS-06 | Blog/Content marketing | Di luar scope teknis landing | BRD OOS-03 |
| OOS-07 | Video demo YouTube embed | Tidak ada aset video. Future V3 | BRD OOS-03 |
| OOS-08 | Backend endpoint baru | Landing = frontend only | BRD OOS-07 |
| OOS-09 | Auth flow baru | NextAuth sudah ada | BRD OOS-08 |
| OOS-10 | Migrasi design system ke Figma | Pakai design tokens existing | BRD OOS-09 |
| OOS-11 | Custom font berbayar | Inter via system-ui (free) | BRD OOS-10 |
| OOS-12 | AI SDK v6 upgrade | Kode V1 pakai v4. Upgrade = OOS V2 | AGENTS.md CRIT-002 |
| OOS-13 | Refactor arsitektur Next.js | Stack sudah final | BRD OOS-06 |
| OOS-14 | Real testimonial data asli | Tidak ada data real. Placeholder jujur | RAG-CONTEXT GAP-03 |
| OOS-15 | Product screenshot asli | Tidak ada. Pakai mockup | RAG-CONTEXT GAP-05 |
| OOS-16 | A/B testing infrastructure | Cukup Vercel Analytics dulu | BRD OOS-05 |
| OOS-17 | Multi-bahasa selain ID+EN | Copy hanya 2 bahasa | AGENTS.md |
| OOS-18 | Dark/Light mode toggle | Default dark only V2. Toggle = V3 | BRD SCOPE-13 |
| OOS-19 | Structured data Schema.org | Optional nice-to-have V3 | NFR-SE06 |
| OOS-20 | Newsletter signup form | Di luar scope akuisi V2 | Backlog V3 |

---

## 9. Asumsi Produk

| ID | Asumsi | Alasan | Dampak bila Salah |
|---|---|---|---|
| PRD-A01 | Produk = animation prompt automation (BUKAN document generation) | RAG-CONTEXT GAP-01 + BRD ASM-B01 | Landing page salah describe |
| PRD-A02 | Produk gratis (tidak ada pricing) | RAG-CONTEXT GAP-04 + MRD S5.4 | Butuh pricing section |
| PRD-A03 | Target = kreator animasi AI (solo + indie) | MRD S2.1 + RAG-CONTEXT S2.4 | Tone visual miss |
| PRD-A04 | Conversion = sign-up gratis | MRD S4.4 + BRD ASM-B04 | CTA Mulai Gratis valid |
| PRD-A05 | Bahasa default ID, toggle EN | RAG-CONTEXT S4.5 + BRD ASM-B05 | Traffic non-ID konversi turun |
| PRD-A06 | Aesthetic = dark mode techno-futurist | RAG-CONTEXT S6.3 + BRD SCOPE-13 | Beda taste user |
| PRD-A07 | Animasi pakai Framer Motion | RAG-CONTEXT S7.1 | Bundle +30KB |
| PRD-A08 | Social proof = placeholder | RAG-CONTEXT GAP-03 | Page terasa kosong |
| PRD-A09 | Product demo = text-based mockup | RAG-CONTEXT GAP-05 | Kurang convincing |
| PRD-A10 | FAQ = 5-6 pertanyaan umum | Best practice RAG-CONTEXT S5.1 | User tanya di support |
| PRD-A11 | Footer = minimal | Best practice RAG-CONTEXT S5.1 | — |
| PRD-A12 | Mobile-first responsive | BRD SCOPE-12 + RAG-CONTEXT S5.3 | Desktop-only |
| PRD-A13 | Animasi = scroll-triggered fade-in + hover | RAG-CONTEXT S7.2 + BRD SCOPE-04 | User mau lebih complex |
| PRD-A14 | Primary CTA "Mulai Gratis" → /register | BRD RISK-05 | Friction sign-up naik |
| PRD-A15 | Secondary CTA "Masuk" → /login (existing i18n key `loginCta`) | RAG-CONTEXT S3.2 | Login route belum ada i18n key |
| PRD-A16 | Framer Motion latest stable ^11.x | RAG-CONTEXT S7.1 | Inkompatibilitas React 19 |
| PRD-A17 | Vercel Analytics free tier cukup | BRD SCOPE-15 | Bayar custom event |
| PRD-A18 | Placeholder testimonial jujur (beta tester) | BRD RISK-03 | User anggap fake |
| PRD-A19 | OG image placeholder | BRD SCOPE-14 | Share kurang menarik |
| PRD-A20 | Landing = single-page | Best practice RAG-CONTEXT S5.3 (1:1 ratio) | User terdistraksi |

---

## Lampiran A — Cross-Reference

| Topik | Sumber Utama | Pendukung |
|---|---|---|
| Value Proposition | MRD S4.2 | messages/id.json |
| Personas | MRD S2.1 | UIUX_SPEC S1.2, BRD S5 |
| Stakeholder | BRD S5 | MRD S2.2 |
| KPI | BRD S4.2 | MRD S6 |
| Design Tokens | UIUX_SPEC S2 | globals.css:1-82 |
| Animation Library | RAG-CONTEXT S7.1 | BRD SCOPE-03 |
| Best Practice | RAG-CONTEXT S5.1 | BRD Lampiran A |
| i18n | AGENTS.md S4 | next-intl docs |
| Risk | BRD S8 | RAG-CONTEXT S8 |
| Tech Constraint | AGENTS.md S3 | BRD S7.2 (LIM-01..13) |

---

## Lampiran B — Definition of Done

- [ ] src/app/[locale]/page.tsx overwritten dengan 11 section + Framer Motion
- [ ] 11 section component files di src/components/landing/
- [ ] Reusable: section-wrapper, feature-card, testimonial-card, faq-item, animated-counter, browser-mockup, logo-placeholder
- [ ] framer-motion terinstall
- [ ] @vercel/analytics terinstall
- [ ] messages/id.json landing.* di-expand (target 60+ keys)
- [ ] messages/en.json landing.* di-expand paralel
- [ ] OG image di public/og/og-image.jpg
- [ ] Metadata SEO lengkap (title, description, OG, canonical, hreflang)
- [ ] Analytics events wired: cta_hero_click, cta_final_click, faq_expand, scroll_75, language_toggle
- [ ] Dark mode default aktif
- [ ] Primary violet #7c3aed konsisten
- [ ] Mobile responsive tested 375/768/1024/1440px
- [ ] prefers-reduced-motion respected
- [ ] Lighthouse Performance mobile >= 85
- [ ] LCP <= 2.5s, CLS <= 0.1
- [ ] axe-core: 0 critical a11y violation
- [ ] WCAG 2.1 AA compliance
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] No any (L06)
- [ ] No hardcoded text (L09)
- [ ] No secret client-side (L07, SEC-01..03)
- [ ] No LLM call di Client Component (L24)
- [ ] Conventional commit feat(landing): ...
- [ ] PR reviewed + merged
- [ ] Preview deploy ke Vercel sukses

---

> **Dokumen ini = kontrak produk untuk landing page PromptFlow. Eksekutor baca PRD + AGENTS.md + UIUX_SPEC.md. Semua klaim bersitasi. Klaim tanpa bukti = ASUMSI (ditandai di §9). Acceptance criteria §6 = quality gate sebelum merge.**

**Dibuat oleh:** docgen-prd subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0
