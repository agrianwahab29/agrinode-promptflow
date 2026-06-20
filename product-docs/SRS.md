# SRS — Software Requirement Specification
## PromptFlow Landing Page Redesign

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Status:** Draft
> **Deliverable:** Landing page src/app/[locale]/page.tsx — redesign total
> **Selaras:** BRD.md (why), MRD.md (who), PRD.md (what)
> **Rujukan:** RAG-CONTEXT.md (fakta), AGENTS.md (build V2), UIUX_SPEC.md (design system)

---

## Daftar Isi

1. Tech Stack & Justifikasi
2. Arsitektur Sistem
3. Spesifikasi Fungsional Detail
4. Data Model
5. Interface / API / Integrasi
6. File Format & Path
7. Tahapan Implementasi
8. Verifikasi & Pengujian
9. Constraint Teknis

---

## 1. Tech Stack & Justifikasi

### 1.1 Stack Utama (Landing Page)

| Lapisan | Teknologi | Versi | Justifikasi | Sitasi |
|---|---|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 | Sudah ada di V1, RSC default | package.json:48 |
| UI Library | React + ReactDOM | ^19.0.0 | Sudah ada, RSC support | package.json:51-52 |
| Styling | Tailwind CSS v4 | ^4.0.0 | Utility-first, design token existing | package.json:79 |
| UI Components | shadcn/ui (Radix primitives) | ^1.1.0 | 14 Radix packages sudah ada | package.json:26-39 |
| i18n | next-intl | ^3.26.0 | Dwibahasa ID+EN, sudah wired | package.json:50 |
| Animation | **framer-motion** | **^11.x** | **BARU — install.** Standard React animation | RAG-CONTEXT S7.1 |
| Icons | lucide-react | ^0.468.0 | Sudah ada, icon lengkap | package.json:47 |
| Analytics | **@vercel/analytics** | **latest** | **BARU — install.** Event tracking, no PII | BRD SCOPE-15 |
| TypeScript | typescript | ^5.7.0 | Strict mode, type-safe | package.json:80 |
| Package Manager | pnpm | 11.7.0 | Sudah ada | package.json:83 |

### 1.2 Dependencies BARU (Perlu Install)

`ash
pnpm add framer-motion @vercel/analytics
`

| Package | Size (gzipped) | Alasan Install | Sitasi |
|---|---|---|---|
| framer-motion | ~30KB | Fade-in scroll, stagger, hover scale, spring | RAG-CONTEXT S7.1, BRD SCOPE-03 |
| @vercel/analytics | ~5KB | Event tracking CTA/FAQ/scroll, KPI measurable | BRD SCOPE-15 |

**Total bundle tambahan:** ~35KB gzipped. Acceptable (NFR-P05 <= 50KB).

### 1.3 Dependencies YANG TIDAK BOLEH DITAMBAH

| Package | Alasan | Sitasi |
|---|---|---|
| AI SDK v6 | Kode V1 pakai v4. Upgrade = OOS | AGENTS.md CRIT-002 |
| GSAP | Overkill untuk landing page | RAG-CONTEXT S7.1 |
| next-themes | Dark mode pakai CSS class manual | RAG-CONTEXT S6.3 |
| Custom font berbayar | Inter via system-ui sudah ada | BRD OOS-10 |

---

## 2. Arsitektur Sistem

### 2.1 Component Tree

`
src/app/[locale]/page.tsx (Server Component — root orchestrator)
  ├── Navbar (Client Component — sticky + scroll detection)
  ├── Hero (Client Component — Framer Motion entrance)
  ├── SocialProofBar (Client Component — counter animation)
  ├── ProblemSolution (Client Component — stagger fade-in)
  ├── HowItWorks (Client Component — 3 step connector)
  ├── FeaturesBento (Client Component — bento grid + hover)
  ├── ProductDemo (Client Component — browser mockup animated)
  ├── Testimonials (Client Component — 3 card grid)
  ├── FAQ (Client Component — accordion)
  ├── FinalCTA (Client Component — gradient section)
  └── Footer (Server Component — static)
`

### 2.2 Reusable Components

| Component | Path | Tipe | Fungsi |
|---|---|---|---|
| SectionWrapper | src/components/landing/section-wrapper.tsx | Client | whileInView + stagger wrapper reusable |
| AnimatedCounter | src/components/landing/animated-counter.tsx | Client | Counter angka Framer Motion |
| BrowserMockup | src/components/landing/browser-mockup.tsx | Client | Browser chrome frame reusable |
| FeatureCard | src/components/landing/feature-card.tsx | Client | 1 feature card hover scale |
| TestimonialCard | src/components/landing/testimonial-card.tsx | Client | 1 testimonial card |
| FaqItem | src/components/landing/faq-item.tsx | Client | 1 accordion item |
| LogoPlaceholder | src/components/landing/logo-placeholder.tsx | Server | SVG/text logo placeholder |

### 2.3 Data Flow

`
page.tsx (Server Component)
  |
  +-- getTranslations('landing') -> semua teks via next-intl
  |
  +-- SectionWrapper -> props: children, className
  |     +-- Framer Motion: whileInView, variants, viewport once:true
  |
  +-- Hero -> props: t('heroTitle'), t('heroSubtitle'), ctaPrimary, ctaSecondary
  |     +-- ProductDemo (browser mockup animated)
  |
  +-- SocialProofBar -> props: userCount (placeholder), logos[]
  |     +-- AnimatedCounter -> useMotionValue + animate
  |
  +-- FeaturesBento -> props: features[] (icon, title, desc)
  |     +-- FeatureCard[] -> whileHover scale 1.02
  |
  +-- FAQ -> props: faqs[] (question, answer)
  |     +-- FaqItem[] -> accordion expand/collapse
  |
  +-- Analytics -> @vercel/analytics track events
        +-- cta_hero_click
        +-- cta_final_click
        +-- faq_expand
        +-- scroll_75
        +-- language_toggle
`

### 2.4 State Management

| State | Tipe | Lokasi | Keterangan |
|---|---|---|---|
| Scroll position | useScroll | Navbar | Transparent ke solid bg |
| FAQ expand | Local state | FaqItem | Default collapsed, multi-open |
| Counter value | useMotionValue | AnimatedCounter | 0 ke target value |
| Locale | next-intl context | Global | ID/EN toggle |
| Reduced motion | useReducedMotion | Framer Motion | Respect OS setting |

Tidak ada global state store — landing page = static content + animation state saja.

---

## 3. Spesifikasi Fungsional Detail

### 3.1 F-01 Navbar (FR-LP-01)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Position | Sticky top-0 z-50 |
| Bg | Transparent -> solid (bg-background/80 backdrop-blur) setelah scroll 50px |
| Layout | Logo kiri + Nav tengah (Fitur, Cara Kerja, FAQ) + Language Toggle + CTA kanan |
| Logo | Text PromptFlow styling violet. Link ke #top |
| Nav links | Smooth scroll ke #features, #how-it-works, #faq |
| Language toggle | next-intl switchLocale. Preserve scroll position |
| CTA | Mulai Gratis -> /register. Filled violet button |
| Mobile | Hamburger menu (slide-in). Logo + CTA visible |
| i18n keys | landing.nav.features, landing.nav.howItWorks, landing.nav.faq, landing.nav.cta |
| a11y | Focus ring visible, aria-label hamburger, keyboard nav |

### 3.2 F-02 Hero (FR-LP-02)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Layout | 2 kolom desktop (60% text, 40% mockup). Stack center mobile |
| Headline | text-5xl md:text-6xl weight-800. Satu judul ke paket prompt animasi siap pakai |
| Subheadline | text-lg md:text-xl muted-foreground. 3 value props |
| CTA Primary | Mulai Gratis -> /register. Filled violet size-lg |
| CTA Secondary | Lihat Demo atau Masuk -> /login. Outline variant |
| Product visual | BrowserMockup component (text-based generate flow mockup) |
| Bg | Gradient violet subtle + animated gradient shift |
| Animation | Fade-in + slide-up stagger (Framer Motion) |
| i18n keys | landing.heroTitle, landing.heroSubtitle, landing.heroCtaPrimary, landing.heroCtaSecondary |

### 3.3 F-03 Social Proof Bar (FR-LP-03)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Position | Langsung setelah hero. Max-height 200px |
| Content | Dipercaya 100+ kreator AI + 5-6 logo placeholder + rating stars |
| Logo | SVG/text, grayscale 60%, hover full color + scale 1.02 |
| Counter | AnimatedCounter: 0 ke 100+ (Framer Motion) |
| i18n keys | landing.socialProof.headline, landing.socialProof.subheadline |

### 3.4 F-04 Problem / Solution (FR-LP-04)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Layout | 2 kolom desktop, stack mobile |
| Pain points (kiri) | 3 item: icon + judul + deskripsi. Bg red/amber subtle |
| Solutions (kanan) | 3 item: icon + judul + deskripsi. Bg violet subtle |
| Mapping | Pain 1 -> Solution 1, Pain 2 -> Solution 2, Pain 3 -> Solution 3 |
| Animation | Stagger fade-in |
| i18n keys | landing.problemSolution.problem1Title/Desc, solution1Title/Desc (3 pasang) |

### 3.5 F-05 How It Works (FR-LP-05)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Layout | 3 kolom horizontal + connector arrows desktop. Vertical timeline mobile |
| Step 1 | Icon + Input + Masukkan judul, durasi, dan gaya |
| Step 2 | Icon + Generate + AI susun paket prompt lengkap |
| Step 3 | Icon + Export + Download JSON atau Markdown |
| Step number | Besar 1/2/3, violet bg |
| i18n keys | landing.howItWorks.step1Title/Desc, step2, step3 |

### 3.6 F-06 Features Bento Grid (FR-LP-06)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Layout | Bento asymmetric grid. Character Master col-span-2 |
| 6 Features | (a) Input Minimal (b) Character Master (c) Multi-Provider LLM (d) Export JSON+MD (e) Real-time Logs (f) Upload Referensi |
| Tiap card | Icon (lucide-react) + judul + 1-2 kalimat |
| Hover | Scale 1.02 + violet border glow |
| Animation | Stagger fade-in on viewport |
| i18n keys | landing.features.title, f1Title/Desc sampai f6Title/Desc |

### 3.7 F-07 Product Demo (FR-LP-07)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Visual | BrowserMockup: chrome wrapper (3 dot traffic light) |
| Content kiri | Form mockup: judul Petualangan Kiko di Pasar Malam / 60s / 3D |
| Animation | Typing effect input -> loading bar violet -> result JSON snippet kanan |
| Loop | 8-10 detik, pause on hover (opsional) |
| i18n keys | landing.demo.title, landing.demo.inputLabel, landing.demo.outputLabel |

### 3.8 F-08 Testimonials (FR-LP-08)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Layout | 3 kolom desktop, 1 kolom carousel mobile |
| Tiap card | Avatar placeholder (initials violet circle) + nama + role + quote |
| Quote | Max 25 kata. Pain ke outcome |
| Label | Cerita dari beta tester (transparansi placeholder) |
| Placeholder data | (a) Hemat 3 jam per video. Kreator Solo. (b) Karakter konsisten. Studio Animasi. (c) Murid paham 5 menit. Edukator |
| i18n keys | landing.testimonials.title, t1Quote/Name/Role (3x) |

### 3.9 F-09 FAQ (FR-LP-09)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Component | shadcn/ui Accordion (Radix) |
| Items | 5-6 Q&A |
| Default | Collapsed. Multi-open allowed |
| Animation | Smooth expand (height auto + opacity). Chevron rotate 90 deg |
| FAQ items | (a) Provider didukung? (b) Gratis? (c) Konsistensi karakter? (d) Data aman? (e) Mobile? (f) Bahasa? |
| i18n keys | landing.faq.title, q1-q6 (object question + answer) |

### 3.10 F-10 Final CTA (FR-LP-10)

| Field | Detail |
|---|---|
| Tipe | Client Component |
| Bg | Full-width violet gradient |
| Content | Headline besar + subheadline + CTA white-on-violet + disclaimer |
| Copy | Mulai buat paket prompt pertama dalam 60 detik + Tanpa kartu kredit. Tanpa komitmen. |
| Animation | Fade-in |
| i18n keys | landing.finalCta.title, subtitle, button, disclaimer |

### 3.11 F-11 Footer (FR-LP-11)

| Field | Detail |
|---|---|
| Tipe | Server Component |
| Layout | 4 kolom desktop, 2 kolom tablet, 1 kolom mobile |
| Content | Brand + Product links + Legal links + Social icons (GitHub, Twitter/X) |
| Bg | Dark muted. Border-top subtle |
| Copyright | 2026 PromptFlow |
| i18n keys | landing.footer.tagline, copyright, productLinks, legalLinks, social.github, social.twitter |

### 3.12 F-12 Animations (Cross-cutting)

| Pattern | Implementasi | Sitasi |
|---|---|---|
| Fade-in scroll | whileInView opacity 1 y 0 + initial opacity 0 y 20 + viewport once true | RAG-CONTEXT S7.2 |
| Stagger children | Parent variants + transition staggerChildren 0.1 | RAG-CONTEXT S7.2 |
| Hover scale | whileHover scale 1.02 + whileTap scale 0.98 | RAG-CONTEXT S7.2 |
| Gradient shift | CSS keyframes gradient + background-size 200% + animation 8s ease infinite | RAG-CONTEXT S7.2 |
| Counter | useMotionValue + useTransform + animate 0 ke target | RAG-CONTEXT S7.2 |
| Typing effect | Framer Motion word-by-word atau CSS steps keyframes | RAG-CONTEXT S7.2 |
| Smooth scroll | scroll-behavior smooth CSS + scrollIntoView smooth | PRD S7.6 |

**Performance rules:**
- GPU-accelerated only: transform, opacity. No width, height, top.
- Respect prefers-reduced-motion (sudah ada globals.css:74-80).
- No layout shift (CLS <= 0.1).

### 3.13 F-13 Dark Mode Default (Cross-cutting)

| Token | Nilai | Sitasi |
|---|---|---|
| --background | #0a0a0a | globals.css:50 |
| --foreground | #fafafa | globals.css:51 |
| --primary | #a78bfa | globals.css:56 |
| --accent | #3b0764 | globals.css:62 |

Force dark via class="dark" di html root. Light mode = OOS V2 (COULD F-17).

### 3.14 F-14 SEO Meta Tags (Cross-cutting)

| Field | Value | Sitasi |
|---|---|---|
| Title | PromptFlow — Workflow Otomasi Prompt Animasi AI (<= 60 char) | PRD S7.3 |
| Description | <= 160 char + CTA | PRD S7.3 |
| OG Image | public/og/og-image.jpg 1200x630 | BRD SCOPE-14 |
| Canonical | Per locale | Best practice |
| Hreflang | Alternate id + en | Best practice |

### 3.15 F-15 Analytics (Cross-cutting)

| Event | Trigger | Sitasi |
|---|---|---|
| cta_hero_click | Klik CTA di hero | PRD AC-14 |
| cta_final_click | Klik CTA di final section | PRD AC-14 |
| faq_expand | Expand FAQ item | PRD AC-14 |
| scroll_75 | Scroll >= 75% halaman | PRD AC-14 |
| language_toggle | Toggle bahasa ID/EN | PRD AC-14 |

Tidak ada PII dikumpulkan (NFR-S04).

---

## 4. Data Model

### 4.1 Form Schema

Landing page = tidak ada form submission. CTA mengarah ke /register (sudah ada). Tidak ada data model untuk form.

### 4.2 Analytics Event Schema

`	ypescript
// src/lib/analytics/events.ts
type LandingEvent =
  | { name: 'cta_hero_click'; properties: { locale: string } }
  | { name: 'cta_final_click'; properties: { locale: string } }
  | { name: 'faq_expand'; properties: { locale: string; faqIndex: number } }
  | { name: 'scroll_75'; properties: { locale: string } }
  | { name: 'language_toggle'; properties: { from: string; to: string } };
`

### 4.3 Section Config (Static)

`	ypescript
// src/lib/landing/sections.ts
export const SECTIONS = [
  { id: 'features', labelKey: 'landing.nav.features' },
  { id: 'how-it-works', labelKey: 'landing.nav.howItWorks' },
  { id: 'faq', labelKey: 'landing.nav.faq' },
] as const;
`

### 4.4 Feature Card Data (Static)

`	ypescript
// src/lib/landing/features.ts
export const FEATURES = [
  { key: 'f1', icon: 'Sparkles', colSpan: 1 },
  { key: 'f2', icon: 'Brain', colSpan: 2 },  // Character Master — prominent
  { key: 'f3', icon: 'Layers', colSpan: 1 },
  { key: 'f4', icon: 'Download', colSpan: 1 },
  { key: 'f5', icon: 'Activity', colSpan: 1 },
  { key: 'f6', icon: 'Upload', colSpan: 1 },
] as const;
`

---

## 5. Interface / API / Integrasi

### 5.1 Form Submission

Tidak ada form submission di landing page. CTA Mulai Gratis navigasi ke /register (route sudah ada). Tidak perlu endpoint baru.

### 5.2 Analytics Integration

| Service | Package | Setup | Sitasi |
|---|---|---|---|
| Vercel Analytics | @vercel/analytics | Install + tambah Analytics di src/app/layout.tsx | BRD SCOPE-15 |

`	sx
// src/app/layout.tsx — tambah
import { Analytics } from '@vercel/analytics/react';
// di dalam body:
<Analytics />
`

### 5.3 i18n Integration

| Service | Package | Setup | Sitasi |
|---|---|---|---|
| next-intl | next-intl ^3.26.0 | Sudah wired. Expand namespace landing.* | package.json:50 |

### 5.4 External Links

| Link | Target | Keterangan |
|---|---|---|
| CTA Primary | /register | Sign-up page (sudah ada) |
| CTA Secondary | /login | Login page (sudah ada) |
| GitHub | https://github.com/agrianwahab29/promptflow.git | Footer social link |
| Twitter/X | Placeholder URL | Footer social link |

### 5.5 Backend Endpoints

Tidak ada backend endpoint baru. Landing page = frontend only. Semua data statis dari i18n + hardcoded config.

---

## 6. File Format & Path

### 6.1 File yang HARUS Dibuat Baru

| # | Path | Tipe | Deskripsi |
|---|---|---|---|
| 1 | src/components/landing/navbar.tsx | Client | Navbar sticky + scroll |
| 2 | src/components/landing/hero.tsx | Client | Hero + FM entrance |
| 3 | src/components/landing/social-proof-bar.tsx | Client | Logo row + counter |
| 4 | src/components/landing/problem-solution.tsx | Client | 2 kolom pain/solution |
| 5 | src/components/landing/how-it-works.tsx | Client | 3 step connector |
| 6 | src/components/landing/features-bento.tsx | Client | Bento grid 6 card |
| 7 | src/components/landing/product-demo.tsx | Client | Browser mockup animated |
| 8 | src/components/landing/testimonials.tsx | Client | 3 card grid |
| 9 | src/components/landing/faq.tsx | Client | Accordion |
| 10 | src/components/landing/final-cta.tsx | Client | Gradient section |
| 11 | src/components/landing/footer.tsx | Server | Footer minimal |
| 12 | src/components/landing/section-wrapper.tsx | Client | Reusable FM wrapper |
| 13 | src/components/landing/animated-counter.tsx | Client | Counter FM |
| 14 | src/components/landing/browser-mockup.tsx | Client | Browser chrome frame |
| 15 | src/components/landing/feature-card.tsx | Client | 1 feature card |
| 16 | src/components/landing/testimonial-card.tsx | Client | 1 testimonial card |
| 17 | src/components/landing/faq-item.tsx | Client | 1 accordion item |
| 18 | src/components/landing/logo-placeholder.tsx | Server | SVG/text logo |
| 19 | src/lib/landing/sections.ts | Module | Section IDs |
| 20 | src/lib/landing/features.ts | Module | Feature config |
| 21 | src/lib/analytics/events.ts | Module | Event types |
| 22 | public/og/og-image.jpg | Aset | OG image 1200x630 |

### 6.2 File yang HARUS DI-OVERWRITE

| # | Path | Tipe | Deskripsi |
|---|---|---|---|
| 1 | src/app/[locale]/page.tsx | Server | Root landing — OVERWRITE existing 41 baris |

### 6.3 File yang HARUS DI-EXPAND

| # | Path | Tipe | Deskripsi |
|---|---|---|---|
| 1 | messages/id.json | JSON | Namespace landing.* di-expand (target 60+ keys) |
| 2 | messages/en.json | JSON | Namespace landing.* di-expand paralel |

### 6.4 File yang HARUS DI-MODIFY (minimal)

| # | Path | Tipe | Deskripsi |
|---|---|---|---|
| 1 | src/app/layout.tsx | Server | Tambah Analytics + Metadata OG |

### 6.5 Aset yang TIDAK ADA (Placeholder)

| Aset | Status | Solusi | Sitasi |
|---|---|---|---|
| Logo PromptFlow | TIDAK ADA | Text-based PromptFlow violet styling | BRD OOS-01 |
| Social proof logos | TIDAK ADA | SVG text brand fiktif | RAG-CONTEXT GAP-03 |
| Avatar testimonial | TIDAK ADA | Initials dalam lingkaran violet | PRD S7.4 |
| Product screenshot | TIDAK ADA | Text-based browser mockup | RAG-CONTEXT GAP-05 |
| OG image | TIDAK ADA | Buat: violet gradient + PromptFlow + tagline 1200x630 | BRD SCOPE-14 |

---

## 7. Tahapan Implementasi

### Fase 1: Setup (Hari 1)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 1.1 | Install dependencies | pnpm add framer-motion @vercel/analytics | package.json updated |
| 1.2 | Buat folder structure | src/components/landing/, src/lib/landing/, src/lib/analytics/, public/og/ | Folder exists |
| 1.3 | Buat reusable components | section-wrapper, animated-counter, browser-mockup, feature-card, testimonial-card, faq-item, logo-placeholder | Component files exist |
| 1.4 | Buat config files | sections.ts, features.ts, events.ts | Module exports correct |
| 1.5 | Expand i18n keys | messages/id.json + messages/en.json namespace landing.* (60+ keys) | Keys lengkap ID+EN sinkron |

### Fase 2: Core Sections (Hari 2-3)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 2.1 | Navbar | Sticky, scroll bg, nav links, language toggle, CTA | Visual + keyboard nav |
| 2.2 | Hero | Headline + sub + 2 CTA + gradient bg + FM entrance | 10-second rule |
| 2.3 | Social Proof Bar | Logo row + counter animation | Visible < 200px |
| 2.4 | Problem / Solution | 2 kolom pain/solution + stagger | 3 pain + 3 solution |
| 2.5 | How It Works | 3 step + connector + mobile timeline | 3 step visible |
| 2.6 | Features Bento | Bento grid 6 card + hover | 6 card, bento layout |
| 2.7 | Product Demo | Browser mockup + typing animation | Loop 8-10s |
| 2.8 | Testimonials | 3 card + placeholder data | 3 card visible |
| 2.9 | FAQ | Accordion 5-6 item | Expand/collapse jalan |
| 2.10 | Final CTA | Gradient violet + CTA | Visible tanpa scroll |
| 2.11 | Footer | 4 kolom + social + copyright | Responsive |
| 2.12 | Overwrite page.tsx | Import semua section, urut sesuai PRD S7.2 | Page render lengkap |

### Fase 3: Polish and Quality (Hari 3-4)

| # | Task | Detail | Verifikasi |
|---|---|---|---|
| 3.1 | Dark mode | Force dark, token konsisten | Visual dark mode |
| 3.2 | SEO meta | Title, description, OG, canonical, hreflang | Metadata valid |
| 3.3 | Analytics | @vercel/analytics + event tracking | Events fire |
| 3.4 | OG image | Buat 1200x630 violet gradient | File exists, valid |
| 3.5 | Mobile responsive | Test 375/768/1024/1440px | No horizontal scroll |
| 3.6 | Reduced motion | Respect prefers-reduced-motion | Animasi disabled |
| 3.7 | a11y | Focus ring, keyboard nav, ARIA, contrast | WCAG 2.1 AA |
| 3.8 | Lint + typecheck | pnpm lint + pnpm typecheck | 0 error |
| 3.9 | Build | pnpm build | Pass |
| 3.10 | Lighthouse | Performance mobile >= 85 | Score valid |

---

## 8. Verifikasi & Pengujian

### 8.1 Acceptance Criteria per Section

| Section | AC ID | Kriteria | Status |
|---|---|---|---|
| Navbar | AC-01 | Logo kiri, nav tengah, toggle, CTA kanan, sticky, bg transition | WAJIB |
| Hero | AC-02 | Headline < 3 detik, 2 CTA, mockup, gradient bg, FM entrance | WAJIB |
| Social Proof | AC-03 | Max 200px, logo grayscale, counter animation | WAJIB |
| Problem/Solution | AC-04 | 3 pain + 3 solution, icon, stagger | WAJIB |
| How It Works | AC-05 | 3 step, connector, mobile timeline | WAJIB |
| Features Bento | AC-06 | 6 card, bento asymmetric, hover scale | WAJIB |
| Product Demo | AC-07 | Browser chrome, typing, loading, JSON preview | WAJIB |
| Testimonials | AC-08 | 3 card, placeholder, label transparansi | WAJIB |
| FAQ | AC-09 | 5-6 Q&A, accordion, multi-open, smooth | WAJIB |
| Final CTA | AC-10 | Gradient, headline, CTA, disclaimer | WAJIB |
| Footer | AC-11 | 4 kolom, responsive, social, copyright | WAJIB |
| Animations | AC-12 | FM installed, fade-in, stagger, hover, gradient, counter, reduced-motion | WAJIB |
| SEO | AC-13 | Title, description, OG, canonical, hreflang | WAJIB |
| Analytics | AC-14 | Events tracked, no PII | WAJIB |
| Quality | AC-15 | Lint 0, typecheck 0, build pass, Lighthouse >= 85 | WAJIB |

### 8.2 Lighthouse Targets

| Metric | Target | Sitasi |
|---|---|---|
| Performance (mobile) | >= 85 | BRD KPI-08 |
| LCP | <= 2.5s | BRD KPI-09 |
| CLS | <= 0.1 | BRD KPI-10 |
| TBT | <= 200ms | PRD NFR-P04 |
| FCP | <= 1.8s | PRD NFR-P07 |
| Bundle tambahan | <= 50KB gzipped | PRD NFR-P05 |

### 8.3 Accessibility (a11y)

| Kriteria | Target | Sitasi |
|---|---|---|
| WCAG compliance | 2.1 AA | AGENTS.md |
| Kontras teks | >= 4.5:1 body, >= 3:1 large | UIUX_SPEC S9 |
| Keyboard nav | Semua interactive reachable + focus ring | UIUX_SPEC S9 |
| Screen reader | Landmark + ARIA labels accordion | UIUX_SPEC S9 |
| Alt text | Semua image punya alt atau aria-hidden | UIUX_SPEC S9 |
| Reduced motion | Respect prefers-reduced-motion | RAG-CONTEXT S7.3 |
| axe-core | 0 critical violation | PRD AC-15 |

### 8.4 Responsive Testing

| Viewport | Width | Target |
|---|---|---|
| Mobile | 375px | No horizontal scroll, CTA thumb-zone, text legible |
| Tablet | 768px | 2 kolom where applicable |
| Desktop | 1024px | Full layout |
| Large | 1440px | Max-width constrained |

### 8.5 Quality Gates (PR Merge)

- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] axe-core: 0 critical a11y violation
- [ ] Tested di 375/768/1024/1440px
- [ ] Conventional commit feat(landing): ...
- [ ] PR reviewed + merged (no direct push main)

---

## 9. Constraint Teknis

### 9.1 Stack Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-01 | Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + next-intl — tidak boleh ubah | AGENTS.md S3, BRD LIM-01 |
| TC-02 | AI SDK tetap v4 — tidak boleh upgrade v6 | AGENTS.md CRIT-002, BRD LIM-02 |
| TC-03 | Framer Motion latest stable ^11.x — kompatibel React 19 | PRD A16 |
| TC-04 | Bundle tambahan <= 50KB gzipped (framer-motion ~30KB + analytics ~5KB) | PRD NFR-P05 |

### 9.2 Code Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-05 | TypeScript strict, no any (L06) | AGENTS.md S4 |
| TC-06 | No hardcoded text — semua via useTranslations('landing') (L09) | AGENTS.md S4 |
| TC-07 | No secret client-side (L07) | AGENTS.md S4 |
| TC-08 | No LLM call client-side (L24) | AGENTS.md S4 |
| TC-09 | Server Component default, Client Component hanya bila butuh interaksi | AGENTS.md S4 |
| TC-10 | Conventional commit feat(landing): ... atomic | AGENTS.md S4 |
| TC-11 | No direct push main — via PR + review (L20) | AGENTS.md S4 |

### 9.3 Design Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-12 | Design tokens dari globals.css — tidak hardcode warna/font | RAG-CONTEXT S4.1 |
| TC-13 | Primary violet #7c3aed (light) / #a78bfa (dark) konsisten | globals.css:10,56 |
| TC-14 | Dark mode default (#0a0a0a bg) | globals.css:50 |
| TC-15 | Font Inter via system-ui — tidak custom font | globals.css:27 |
| TC-16 | Radius 6px default | globals.css:26 |
| TC-17 | Spacing base 4px | UIUX_SPEC S2.5 |
| TC-18 | Respect prefers-reduced-motion | globals.css:74-80 |

### 9.4 Performance Constraints

| ID | Constraint | Target | Sumber |
|---|---|---|---|
| TC-19 | Lighthouse Performance mobile | >= 85 | BRD KPI-08 |
| TC-20 | LCP | <= 2.5s | BRD KPI-09 |
| TC-21 | CLS | <= 0.1 | BRD KPI-10 |
| TC-22 | TBT | <= 200ms | PRD NFR-P04 |
| TC-23 | GPU-accelerated animation only | transform, opacity | RAG-CONTEXT S7.3 |
| TC-24 | Lazy load below-fold animations | on intersection | RAG-CONTEXT S7.3 |

### 9.5 i18n Constraints

| ID | Constraint | Sumber |
|---|---|---|
| TC-25 | Dwibahasa ID (default) + EN paralel | AGENTS.md |
| TC-26 | Locale routing /{locale}/... | next-intl config |
| TC-27 | Language toggle preserve scroll position | RAG-CONTEXT S4.5 |
| TC-28 | CTA kontekstual per bahasa, bukan translate literal | MRD S4.4 |

### 9.6 Asumsi Teknis

| ID | Asumsi | Dampak bila Salah | Sitasi |
|---|---|---|---|
| TC-A01 | Produk = animation prompt automation (BUKAN document generation) | Landing page salah describe | RAG-CONTEXT GAP-01 |
| TC-A02 | Produk gratis (tidak ada pricing) | Butuh pricing section | RAG-CONTEXT GAP-04 |
| TC-A03 | Social proof = placeholder | Page terasa kosong | RAG-CONTEXT GAP-03 |
| TC-A04 | Product demo = text-based mockup | Kurang convincing | RAG-CONTEXT GAP-05 |
| TC-A05 | Primary CTA ke /register | Conversion path valid | BRD RISK-05 |
| TC-A06 | Logo = text-based PromptFlow violet | Branding cukup | BRD OOS-01 |
| TC-A07 | Mobile-first responsive | 50%+ traffic mobile | RAG-CONTEXT S5.3 |
| TC-A08 | Bahasa default ID, toggle EN | Traffic non-ID konversi turun | BRD ASM-B05 |
| TC-A09 | Dark mode default | Techno-futurist aesthetic | RAG-CONTEXT S6.3 |
| TC-A10 | Animasi = scroll-triggered fade-in + hover | User mau lebih complex | RAG-CONTEXT S7.2 |

---

## Lampiran A — Mapping PRD Feature ke Realisasi Teknis

| PRD ID | Section | Komponen | File | Animasi |
|---|---|---|---|---|
| F-01 | Navbar | Navbar | navbar.tsx | Scroll bg transition |
| F-02 | Hero | Hero + BrowserMockup | hero.tsx, browser-mockup.tsx | Fade-in + slide-up stagger |
| F-03 | Social Proof | SocialProofBar + AnimatedCounter | social-proof-bar.tsx, animated-counter.tsx | Counter animation |
| F-04 | Problem/Solution | ProblemSolution | problem-solution.tsx | Stagger fade-in |
| F-05 | How It Works | HowItWorks | how-it-works.tsx | Stagger fade-in |
| F-06 | Features Bento | FeaturesBento + FeatureCard | features-bento.tsx, feature-card.tsx | Stagger + hover scale |
| F-07 | Product Demo | ProductDemo + BrowserMockup | product-demo.tsx, browser-mockup.tsx | Typing + loading |
| F-08 | Testimonials | Testimonials + TestimonialCard | testimonials.tsx, testimonial-card.tsx | Stagger fade-in |
| F-09 | FAQ | FAQ + FaqItem | faq.tsx, faq-item.tsx | Accordion expand |
| F-10 | Final CTA | FinalCTA | final-cta.tsx | Fade-in |
| F-11 | Footer | Footer | footer.tsx | Static |
| F-12 | Animations | SectionWrapper | section-wrapper.tsx | Cross-cutting |
| F-13 | Dark Mode | CSS class | globals.css | Token-based |
| F-14 | SEO | Metadata | layout.tsx | Static |
| F-15 | Analytics | @vercel/analytics | layout.tsx, events.ts | Event tracking |

---

## Lampiran B — i18n Keys Target (60+ keys)

Berikut struktur namespace landing.* yang harus ada di messages/id.json dan messages/en.json:

- nav: features, howItWorks, faq, cta
- heroTitle, heroSubtitle, heroCtaPrimary, heroCtaSecondary
- socialProof: headline, subheadline
- problemSolution: problem1-3Title/Desc, solution1-3Title/Desc (12 keys)
- howItWorks: step1-3Title/Desc (6 keys)
- features: title, f1-6Title/Desc (13 keys)
- demo: title, inputLabel, outputLabel
- testimonials: title, t1-3Quote/Name/Role (10 keys)
- faq: title, q1-6 object question+answer (13 keys)
- finalCta: title, subtitle, button, disclaimer
- footer: tagline, copyright, productLinks, legalLinks, social
- seo: title, description, ogAlt

---

> **Dokumen ini = kontrak teknis untuk landing page redesign PromptFlow. Eksekutor baca SRS ini + PRD.md + AGENTS.md + UIUX_SPEC.md sebelum coding. Semua constraint langsung executable. Klaim tanpa bukti = ASUMSI (ditandai di TC-A01..A10).**

**Dibuat oleh:** docgen-srs subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0
