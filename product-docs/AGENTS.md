# AGENTS.md — Panduan Build Landing Page PromptFlow

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Deliverable:** Landing page `src/app/[locale]/page.tsx` — redesign total
> **Status:** PASS WITH WARNINGS (0 CRITICAL, 2 WARNING kosmetik). Build boleh mulai.

---

## 1. Project Overview

PromptFlow adalah **workflow engine otomasi prompt animasi AI** — web app fullstack yang menghasilkan paket prompt terstruktur (JSON + Markdown) dari input minimal (judul + durasi + gaya). Landing page saat ini sangat basic (hero + 3 cards, tanpa animasi). Tugas agent eksekutor: **redesign total landing page** menjadi halaman konversi tinggi dengan 11 section, animasi Framer Motion, dark mode techno-futurist, dan i18n dwibahasa ID+EN. Deliverable = frontend-only, tidak ada backend baru.

**Root proyek:** `C:\laragon\www\PromptFlow`
**Docs dir:** `C:\laragon\www\PromptFlow\product-docs`

---

## 2. Tech Stack

| Lapisan | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | ^15.1.0 |
| UI Library | React + ReactDOM | ^19.0.0 |
| Styling | Tailwind CSS v4 | ^4.0.0 |
| UI Components | shadcn/ui (Radix UI) | ^1.1.0 |
| i18n | next-intl | ^3.26.0 |
| Animation | **framer-motion** | **^11.x (NEW — install)** |
| Analytics | **@vercel/analytics** | **latest (NEW — install)** |
| Icons | lucide-react | ^0.468.0 |
| TypeScript | typescript | ^5.7.0 |
| Package Manager | pnpm | 11.7.0 |

**Install command:** `pnpm add framer-motion @vercel/analytics`

---

## 3. File Structure

### 3.1 File BARU (22 files)

| # | Path | Tipe |
|---|---|---|
| 1 | `src/components/landing/navbar.tsx` | Client |
| 2 | `src/components/landing/hero.tsx` | Client |
| 3 | `src/components/landing/social-proof-bar.tsx` | Client |
| 4 | `src/components/landing/problem-solution.tsx` | Client |
| 5 | `src/components/landing/how-it-works.tsx` | Client |
| 6 | `src/components/landing/features-bento.tsx` | Client |
| 7 | `src/components/landing/product-demo.tsx` | Client |
| 8 | `src/components/landing/testimonials.tsx` | Client |
| 9 | `src/components/landing/faq.tsx` | Client |
| 10 | `src/components/landing/final-cta.tsx` | Client |
| 11 | `src/components/landing/footer.tsx` | **Server** |
| 12 | `src/components/landing/section-wrapper.tsx` | Client |
| 13 | `src/components/landing/animated-counter.tsx` | Client |
| 14 | `src/components/landing/browser-mockup.tsx` | Client |
| 15 | `src/components/landing/feature-card.tsx` | Client |
| 16 | `src/components/landing/testimonial-card.tsx` | Client |
| 17 | `src/components/landing/faq-item.tsx` | Client |
| 18 | `src/components/landing/logo-placeholder.tsx` | Server |
| 19 | `src/lib/landing/sections.ts` | Module |
| 20 | `src/lib/landing/features.ts` | Module |
| 21 | `src/lib/analytics/events.ts` | Module |
| 22 | `public/og/og-image.jpg` | Aset |

### 3.2 File OVERWRITE (1 file)

| Path | Catatan |
|---|---|
| `src/app/[locale]/page.tsx` | Root landing — overwrite 41 baris existing |

### 3.3 File EXPAND (2 files)

| Path | Catatan |
|---|---|
| `messages/id.json` | Namespace `landing.*` di-expand (target 60+ keys) |
| `messages/en.json` | Namespace `landing.*` di-expand paralel |

### 3.4 File MODIFY (1 file)

| Path | Catatan |
|---|---|
| `src/app/layout.tsx` | Tambah `<Analytics />` + Metadata OG |

---

## 4. Build Steps

### Fase 1: Setup (Hari 1)

| # | Task | Verifikasi |
|---|---|---|
| 1.1 | `pnpm add framer-motion @vercel/analytics` | package.json updated |
| 1.2 | Buat folder: `src/components/landing/`, `src/lib/landing/`, `src/lib/analytics/`, `public/og/` | Folder exists |
| 1.3 | Buat 7 reusable components: section-wrapper, animated-counter, browser-mockup, feature-card, testimonial-card, faq-item, logo-placeholder | Component files exist |
| 1.4 | Buat config: `sections.ts`, `features.ts`, `events.ts` | Module exports correct |
| 1.5 | Expand `messages/id.json` + `messages/en.json` (60+ keys `landing.*`) | Keys ID+EN sinkron |

### Fase 2: Core Sections (Hari 2-3)

| # | Task | Verifikasi |
|---|---|---|
| 2.1 | Navbar — sticky, scroll bg, nav links, language toggle, CTA | Visual + keyboard nav |
| 2.2 | Hero — headline + sub + 2 CTA + gradient bg + FM entrance | 10-second rule |
| 2.3 | Social Proof Bar — logo row + counter animation | Visible < 200px |
| 2.4 | Problem/Solution — 2 kolom pain/solution + stagger | 3 pain + 3 solution |
| 2.5 | How It Works — 3 step + connector + mobile timeline | 3 step visible |
| 2.6 | Features Bento — bento grid 6 card + hover scale | 6 card, bento layout |
| 2.7 | Product Demo — browser mockup + typing animation | Loop 8-10s |
| 2.8 | Testimonials — 3 card + placeholder data | 3 card visible |
| 2.9 | FAQ — accordion 5-6 item | Expand/collapse jalan |
| 2.10 | Final CTA — gradient violet + CTA | Visible tanpa scroll |
| 2.11 | Footer — 4 kolom + social + copyright | Responsive |
| 2.12 | Overwrite `page.tsx` — import semua section, urut sesuai spec | Page render lengkap |

### Fase 3: Polish and Quality (Hari 3-4)

| # | Task | Verifikasi |
|---|---|---|
| 3.1 | Dark mode default — force dark, token konsisten | Visual dark mode |
| 3.2 | SEO meta — title, description, OG, canonical, hreflang | Metadata valid |
| 3.3 | Analytics — `@vercel/analytics` + event tracking | Events fire |
| 3.4 | OG image — buat 1200x630 violet gradient | File exists |
| 3.5 | Mobile responsive — test 375/768/1024/1440px | No horizontal scroll |
| 3.6 | Reduced motion — respect `prefers-reduced-motion` | Animasi disabled |
| 3.7 | a11y — focus ring, keyboard nav, ARIA, contrast | WCAG 2.1 AA |
| 3.8 | Lint + typecheck — `pnpm lint` + `pnpm typecheck` | 0 error |
| 3.9 | Build — `pnpm build` | Pass |
| 3.10 | Lighthouse — Performance mobile >= 85 | Score valid |

---

## 5. Key Decisions (ADR dari PROJECT_ARCHITECTURE)

| ADR | Keputusan | Alasan |
|---|---|---|
| ADR-01 | Server Component-first, Client hanya bila butuh interaksi/FM | Smaller bundle, faster FCP, better SEO |
| ADR-02 | Framer Motion ^11.x (~30KB gzipped) | Standard React animation, API lengkap, kompatibel React 19 |
| ADR-03 | Dark mode default (#0a0a0a bg) | Techno-futurist aesthetic, violet lebih vibrant di dark |
| ADR-04 | Landing page = pure frontend static | Performance, zero server cost, CTA ke /register |
| ADR-05 | @vercel/analytics tanpa PII | Zero-config, no cookie consent, Web Vitals built-in |
| ADR-06 | Text-based logo "PromptFlow" violet | Branding cukup untuk MVP, no asset loading |
| ADR-07 | Placeholder social proof (jujur) | Landing tetap terisi, transparansi, data bisa di-update nanti |

---

## 6. Warnings from Review

**Status: PASS WITH WARNINGS (REVIEW_REPORT.md v2.0)**

### WARNING Residual (kosmetik, tidak blocker):

1. **WARN-001 (siklus 2):** SRS.md S3.2 masih sebut "Lihat Demo atau Masuk" — seharusnya "Masuk" saja. Developer yang baca SRS bisa ragu. Dampak: implementasi tidak salah (destination sama-sama /login).
   - **Rekomendasi:** Ubah SRS S3.2 dari "Lihat Demo atau Masuk" menjadi "Masuk".

2. **WARN-002 (siklus 2):** UIUX_SPEC.md S1.3 line 63 masih sebut "Lihat Demo" sebagai contoh CTA copy. Seharusnya "Masuk".
   - **Rekomendasi:** Ubah UIUX_SPEC S1.3 dari "Lihat Demo" menjadi "Masuk".

**Catatan:** Kedua WARNING tidak memblokir build. Agent eksekutor boleh mulai dari PRD Lampiran B (Definition of Done). Warning bisa diperbaiki paralel dengan build.

---

## 7. Do Not

| # | Larangan | Sumber |
|---|---|---|
| 1 | **Jangan pakai `any`** tanpa eslint-disable + alasan | CODING_RULES L-LP-01, L06 |
| 2 | **Jangan hardcoded teks UI** — semua via `useTranslations('landing')` | CODING_RULES L-LP-02, L09 |
| 3 | **Jangan hardcoded warna/hex** — pakai Tailwind design tokens | CODING_RULES L-LP-03 |
| 4 | **Jangan campur Server + Client di file sama** | CODING_RULES L-LP-04 |
| 5 | **Jangan pakai `dangerouslySetInnerHTML`** | CODING_RULES L-LP-05 |
| 6 | **Jangan pakai GSAP / heavy lib** — Framer Motion sudah cukup | CODING_RULES L-LP-11 |
| 7 | **Jangan pakai `width`, `height`, `top` di Framer Motion** — GPU-only: `transform`, `opacity` | CODING_RULES L-LP-09 |
| 8 | **Jangan skip `prefers-reduced-motion`** — `useReducedMotion()` wajib | CODING_RULES L-LP-10 |
| 9 | **Jangan animasi tanpa `viewport={{ once: true }}`** | CODING_RULES L-LP-15 |
| 10 | **Jangan pakai `React.FC`** — gunakan function declaration | CODING_RULES L-LP-17 |
| 11 | **Jangan default export component** — named export saja | CODING_RULES L-LP-20 |
| 12 | **Jangan Magic number** — extract ke constants | CODING_RULES L-LP-18 |
| 13 | **Jangan nesting > 3 level** — extract ke child component | CODING_RULES L-LP-19 |
| 14 | **Jangan pakai `window`/`document` di Server Component** | CODING_RULES L-LP-13 |
| 15 | **Jangan lupa `rel="noopener noreferrer"`** untuk `target="_blank"` | CODING_RULES L-LP-14 |
| 16 | **Jangan push ke `main` langsung** — via PR + review | CODING_RULES L-LP-07 |
| 17 | **Jangan describe produk sebagai "document generation"** — ini "animation prompt automation" | RAG-CONTEXT GAP-01 |
| 18 | **Jangan tambah pricing section** — tidak ada model pricing | PRD OOS-02 |
| 19 | **Jangan pakai AI SDK v6** — kode V1 pakai v4 | AGENTS.md CRIT-002 |
| 20 | **Jangan ubah stack** — Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + next-intl | BRD LIM-01 |

---

## 8. Acceptance Criteria

### Per Section (ringkas dari PRD AC-01..AC-15):

| Section | Kriteria Utama |
|---|---|
| **Navbar** | Sticky, bg transparent→solid scroll 50px, nav links anchor, language toggle, CTA /register, hamburger mobile |
| **Hero** | Headline < 3 detik, 2 CTA (Mulai Gratis→/register, Masuk→/login), gradient bg, FM entrance, mockup |
| **Social Proof** | Max 200px, counter 0→100+, 5-6 logo grayscale, rating placeholder |
| **Problem/Solution** | 3 pain + 3 solution, icon, 2 kolom desktop / stack mobile, stagger |
| **How It Works** | 3 step (PenLine/Wand2/FileDown), connector desktop, timeline mobile |
| **Features Bento** | 6 card, Character Master col-span-2, hover scale 1.02, stagger |
| **Product Demo** | Browser chrome mockup, typing animation, loading bar, JSON snippet, loop 8-10s |
| **Testimonials** | 3 card, initials avatar, quote max 25 kata, "Cerita dari beta tester" label |
| **FAQ** | 5-6 accordion, default collapsed, multi-open, chevron rotate 90deg |
| **Final CTA** | Full-width violet gradient, headline + CTA white-on-violet + disclaimer |
| **Footer** | 4 kolom desktop, 1 kolom mobile, social icons, copyright 2026 |

### Cross-cutting:

| Kriteria | Target |
|---|---|
| Framer Motion installed | fade-in, stagger, hover, counter, gradient shift |
| `prefers-reduced-motion` | respected — semua animasi disabled |
| i18n | 60+ keys ID+EN sinkron, toggle preserve scroll |
| Dark mode | default #0a0a0a bg, primary #a78bfa |
| Mobile responsive | 375/768/1024/1440px tanpa horizontal scroll |
| SEO | title <= 60 char, description <= 160, OG image 1200x630, hreflang |
| Analytics | 5 events: cta_hero_click, cta_final_click, faq_expand, scroll_75, language_toggle |
| Lighthouse | Performance mobile >= 85, LCP <= 2.5s, CLS <= 0.1 |
| WCAG | 2.1 AA, axe-core 0 critical violation |
| Build | `pnpm lint` 0 error, `pnpm typecheck` 0 error, `pnpm build` pass |
| Bundle | tambahan <= 50KB gzipped (FM ~30KB + analytics ~5KB) |
| Commit | `feat(landing): ...` atomic, via PR (no direct push main) |

---

## 9. Design Tokens (Ringkas)

| Token | Dark (Default) | Light |
|---|---|---|
| `--background` | `#0a0a0a` | `#ffffff` |
| `--foreground` | `#fafafa` | `#0a0a0a` |
| `--primary` | `#a78bfa` | `#7c3aed` |
| `--accent` | `#3b0764` | `#ede9fe` |
| `--muted-foreground` | `#a1a1aa` | `#71717a` |
| `--border` | `#27272a` | `#e4e4e7` |
| Font | Inter, system-ui | -- |
| Radius | 6px | -- |
| Spacing base | 4px | -- |

**Gradient:** `linear-gradient(135deg, #0a0a0a 0%, #1a0533 50%, #0a0a0a 100%)` (hero)
**CTA gradient:** `linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)` (final CTA)

---

## 10. Section Order di page.tsx

```
1. Navbar        — sticky transparent to solid
2. Hero          — headline + sub + 2 CTA + mockup
3. SocialProof   — trust signal
4. ProblemSolution — pain to solution
5. HowItWorks    — 3 step
6. FeaturesBento — 6 features
7. ProductDemo   — browser mockup animation
8. Testimonials  — 3 quotes
9. FAQ           — 5-6 Q&A
10. FinalCTA     — closing conversion
11. Footer       — nav + legal
```

---

## 11. i18n Keys Target (60+ keys)

Namespace: `landing.*` di `messages/id.json` dan `messages/en.json`

- `nav`: features, howItWorks, faq, cta
- `heroTitle`, `heroSubtitle`, `heroCtaPrimary`, `heroCtaSecondary`
- `socialProof`: headline, subheadline
- `problemSolution`: problem1-3Title/Desc, solution1-3Title/Desc (12 keys)
- `howItWorks`: step1-3Title/Desc (6 keys)
- `features`: title, f1-6Title/Desc (13 keys)
- `demo`: title, inputLabel, outputLabel
- `testimonials`: title, t1-3Quote/Name/Role (10 keys)
- `faq`: title, q1-6 object question+answer (13 keys)
- `finalCta`: title, subtitle, button, disclaimer
- `footer`: tagline, copyright, productLinks, legalLinks, social
- `seo`: title, description, ogAlt

---

## 12. Tooling

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server
pnpm build            # Production build
pnpm lint             # ESLint check
pnpm typecheck        # TypeScript check
pnpm test --coverage  # Unit test + coverage
pnpm test:e2e         # E2E test (Playwright)
```

---

## 13. Definition of Done

- [ ] Semua 11 section render tanpa error (ID + EN)
- [ ] Semua 7 reusable components berfungsi
- [ ] framer-motion berfungsi: fade-in, stagger, hover, counter, gradient
- [ ] prefers-reduced-motion di-respect
- [ ] 60+ i18n keys ID+EN sinkron
- [ ] Language toggle ID to EN preserve scroll
- [ ] Dark mode default (#0a0a0a bg, primary #a78bfa)
- [ ] Responsive 375/768/1024/1440px tanpa horizontal scroll
- [ ] Navbar sticky: transparent to solid setelah scroll 50px
- [ ] FAQ accordion: expand/collapse, multi-open, smooth animation
- [ ] 2 CTA: Mulai Gratis to /register, Masuk to /login
- [ ] SEO meta: title <= 60, description <= 160, OG image, hreflang
- [ ] Analytics events wired: 5 events + no PII
- [ ] OG image di `public/og/og-image.jpg` (1200x630)
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] axe-core: 0 critical violation
- [ ] No `any` type
- [ ] No hardcoded text
- [ ] No secret client-side
- [ ] Conventional commit `feat(landing): ...`
- [ ] PR reviewed + merged (no direct push main)
- [ ] Preview deploy ke Vercel sukses

---

## 14. Dokumen Rujukan

| # | Dokumen | Path | Peran |
|---|---|---|---|
| 1 | BRD | `product-docs/BRD.md` | Why — nilai bisnis, KPI, scope |
| 2 | MRD | `product-docs/MRD.md` | Who — pasar, persona, positioning |
| 3 | PRD | `product-docs/PRD.md` | What — FR-01..FR-16, MoSCoW, AC |
| 4 | SRS | `product-docs/SRS.md` | How — arsitektur, tech stack, spec |
| 5 | PROJECT_ARCHITECTURE | `product-docs/PROJECT_ARCHITECTURE.md` | Struktur sistem, ADR, deployment |
| 6 | UIUX_SPEC | `product-docs/UIUX_SPEC.md` | Design tokens, komponen UI, wireframe |
| 7 | CODING_RULES | `product-docs/CODING_RULES.md` | Standar koding, 20 larangan |
| 8 | TEST_PLAN | `product-docs/TEST_PLAN.md` | 83 test case, coverage target |
| 9 | REVIEW_REPORT | `product-docs/REVIEW_REPORT.md` | Quality gate, 0 CRITICAL |
| 10 | RAG-CONTEXT | `product-docs/RAG-CONTEXT.md` | Sumber kebenaran faktual |

---

> **Dokumen ini = panduan operasional untuk agent eksekutor membangun landing page PromptFlow. Baca dokumen ini + rujukan product-docs/ sebelum coding. Mulai Fase 1, verifikasi per task, cap DoD.**

**Dibuat oleh:** docgen-agentsmd subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0 (Landing Page Focus)
