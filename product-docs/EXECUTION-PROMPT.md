# EXECUTION PROMPT — PromptFlow Landing Page Redesign

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Status:** Siap eksekusi (0 CRITICAL, 2 WARNING kosmetik)

---

## INSTRUKSI UTAMA

Kamu adalah agent eksekutor yang bertugas membangun **landing page PromptFlow** secara autonomous sampai selesai. Ikuti panduan ini persis. Jangan ubah scope. Jangan skip aset wajib. Jangan langgar CODING_RULES.

**Root proyek:** `C:\laragon\www\PromptFlow`
**Docs dir:** `C:\laragon\www\PromptFlow\product-docs`

---

## LANGKAH 0: Baca Dokumen Rujukan

Sebelum coding, baca SEMUA dokumen berikut. Mereka adalah sumber kebenaran.

| # | Dokumen | Path | Peran |
|---|---|---|---|
| 1 | **AGENTS.md** | `C:\laragon\www\PromptFlow\product-docs\AGENTS.md` | **Panduan build utama** — baca ini paling awal |
| 2 | BRD | `C:\laragon\www\PromptFlow\product-docs\BRD.md` | Why — nilai bisnis, KPI, scope |
| 3 | MRD | `C:\laragon\www\PromptFlow\product-docs\MRD.md` | Who — pasar, persona, positioning |
| 4 | PRD | `C:\laragon\www\PromptFlow\product-docs\PRD.md` | What — FR-01..FR-16, MoSCoW, AC |
| 5 | SRS | `C:\laragon\www\PromptFlow\product-docs\SRS.md` | How — arsitektur, tech stack, spec |
| 6 | PROJECT_ARCHITECTURE | `C:\laragon\www\PromptFlow\product-docs\PROJECT_ARCHITECTURE.md` | Struktur sistem, ADR, deployment |
| 7 | UIUX_SPEC | `C:\laragon\www\PromptFlow\product-docs\UIUX_SPEC.md` | Design tokens, komponen UI, wireframe |
| 8 | CODING_RULES | `C:\laragon\www\PromptFlow\product-docs\CODING_RULES.md` | Standar koding, 20 larangan |
| 9 | TEST_PLAN | `C:\laragon\www\PromptFlow\product-docs\TEST_PLAN.md` | 83 test case, coverage target |
| 10 | REVIEW_REPORT | `C:\laragon\www\PromptFlow\product-docs\REVIEW_REPORT.md` | Quality gate, 0 CRITICAL |

---

## PROJECT OVERVIEW

**PromptFlow** adalah workflow engine otomasi prompt animasi AI — web app fullstack yang menghasilkan paket prompt terstruktur (JSON + Markdown) dari input minimal (judul + durasi + gaya). Landing page saat ini sangat basic (hero + 3 cards, tanpa animasi). Tugasmu: **redesign total landing page** menjadi halaman konversi tinggi dengan 11 section, animasi Framer Motion, dark mode techno-futurist, dan i18n dwibahasa ID+EN.

**Deliverable = frontend-only.** Tidak ada backend baru. Tidak ada pricing section. Tidak ada auth flow baru.

---

## TECH STACK (FIX — JANGAN UBAH)

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

**Install:** `pnpm add framer-motion @vercel/analytics`

---

## FILE STRUCTURE TARGET

### File BARU (22 files)

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

### File OVERWRITE (1 file)

| Path | Catatan |
|---|---|
| `src/app/[locale]/page.tsx` | Root landing — overwrite 41 baris existing |

### File EXPAND (2 files)

| Path | Catatan |
|---|---|
| `messages/id.json` | Namespace `landing.*` di-expand (target 60+ keys) |
| `messages/en.json` | Namespace `landing.*` di-expand paralel |

### File MODIFY (1 file)

| Path | Catatan |
|---|---|
| `src/app/layout.tsx` | Tambah `<Analytics />` + Metadata OG |

---

## BUILD PHASES

### Fase 1: Setup

| # | Task | Verifikasi |
|---|---|---|
| 1.1 | `pnpm add framer-motion @vercel/analytics` | package.json updated |
| 1.2 | Buat folder: `src/components/landing/`, `src/lib/landing/`, `src/lib/analytics/`, `public/og/` | Folder exists |
| 1.3 | Buat 7 reusable components: section-wrapper, animated-counter, browser-mockup, feature-card, testimonial-card, faq-item, logo-placeholder | Component files exist |
| 1.4 | Buat config: `sections.ts`, `features.ts`, `events.ts` | Module exports correct |
| 1.5 | Expand `messages/id.json` + `messages/en.json` (60+ keys `landing.*`) | Keys ID+EN sinkron |

### Fase 2: Core Sections

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

### Fase 3: Polish and Quality

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

## KEY DECISIONS (ADR)

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

## DESIGN TOKENS

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

## SECTION ORDER di page.tsx

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

## i18n KEYS TARGET (60+ keys)

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

**i18n rules:**
- Semua teks UI via `useTranslations('landing')` — TIDAK boleh hardcoded string
- ID = default, EN = toggle via next-intl
- Keys ID+EN HARUS sinkron (identik)
- CTA kontekstual per bahasa, bukan translate literal
- Language toggle preserve scroll position

---

## ANIMATION SPEC

| Pattern | Component | Implementasi |
|---|---|---|
| Fade-in scroll | section-wrapper.tsx | whileInView opacity 1 y:0 + initial opacity 0 y:20 + viewport once:true |
| Stagger children | features-bento.tsx, testimonials.tsx | Parent variants visible transition staggerChildren 0.1 |
| Hover scale | feature-card.tsx, CTA | whileHover scale 1.02 + whileTap scale 0.98 |
| Gradient shift | hero.tsx | CSS keyframes gradient + background-size 200% + animation 8s ease infinite |
| Counter | animated-counter.tsx | useMotionValue + useTransform + animate 0 ke target |
| Typing effect | product-demo.tsx | Framer Motion word-by-word atau CSS steps keyframes |
| Smooth scroll | navbar.tsx | scroll-behavior smooth CSS + scrollIntoView smooth |

**Performance rules:**
- GPU-accelerated only: `transform`, `opacity`. No `width`, `height`, `top`.
- Respect `prefers-reduced-motion` — `useReducedMotion()` wajib
- `viewport={{ once: true }}` — animasi trigger sekali saja
- No layout shift (CLS <= 0.1)

---

## ACCEPTANCE CRITERIA

### Per Section

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

### Cross-cutting

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

## DO NOT RULES (20 LARANGAN)

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

## OUT OF SCOPE (JANGAN INI)

- Pricing section (tidak ada model pricing)
- Login form inline (sudah ada /login route)
- Generate form inline (generate di /generate setelah auth)
- Custom logo ilustrasi (text-based logo violet)
- Backend endpoint baru (landing = frontend only)
- Auth flow baru (NextAuth sudah ada)
- Video demo YouTube embed (tidak ada aset video)
- A/B testing infrastructure
- Light mode toggle (dark only V2)
- Blog/content marketing
- Multi-bahasa selain ID+EN
- AI SDK v6 upgrade
- Refactor arsitektur Next.js

---

## KEY COPY (Bahasa Indonesia)

**Hero:**
- Headline: "Satu judul ke paket prompt animasi siap pakai"
- Subheadline: "Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown."
- CTA Primary: "Mulai Gratis" -> /register
- CTA Secondary: "Masuk" -> /login

**6 Features:**
1. Input Minimal — Masukkan judul + durasi + gaya. Sistem generate paket lengkap.
2. Character Master — Karakter terstruktur dirujuk lintas adegan — identitas tetap, adegan bervariasi.
3. Multi-Provider LLM — Pilih Ollama, OpenRouter, 9router, atau custom. Fleksibel biaya dan kualitas.
4. Export JSON + Markdown — Output terstruktur siap copy ke tool image/video gen favorit.
5. Real-time Logs — Pantau proses generate. Tahu apa yang AI kerjakan setiap detik.
6. Upload Referensi — Upload gambar referensi + AI klasifikasi otomatis.

**6 FAQ:**
1. Provider LLM apa saja yang didukung? — Ollama, OpenRouter, 9router, dan provider OpenAI-compatible custom. Ganti kapan saja di Settings.
2. Apakah PromptFlow gratis? — Saat ini gratis untuk semua user. Model pricing future diumumkan via blog dan email.
3. Bagaimana konsistensi karakter dijamin? — Character master tersimpan terstruktur dan dirujuk otomatis di setiap adegan. Edit master + regenerate scene tertentu.
4. Apakah data saya aman? — API key dienkripsi AES-256-GCM. Data di Turso DB (encrypted at rest). Tidak pernah kirim ke pihak ketiga.
5. Bisa dipakai di mobile? — Ya. Landing dan dashboard responsif. Generate optimal di desktop; mobile view + edit hasil.
6. Bahasa apa saja yang didukung? — Indonesia (default) + English. Lebih banyak bahasa berdasarkan permintaan.

**Final CTA:**
- Headline: "Mulai buat paket prompt pertama dalam 60 detik."
- CTA: "Mulai Gratis"
- Disclaimer: "Tanpa kartu kredit. Tanpa komitmen."

**Testimonials (placeholder):**
1. "Hemat 3 jam per video." — Kreator Solo
2. "Akhirnya karakter konsisten lintas adegan." — Studio Animasi
3. "Murid paham dalam 5 menit." — Edukator
- Label: "Cerita dari beta tester"

---

## TOOLING

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

## DEFINITION OF DONE

Landing page dianggap SELESAI jika SEMUA item berikut terpenuhi:

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

## LARANGAN TAMBAHAN

- **Jangan ubah scope** — 11 section saja, tidak lebih
- **Jangan skip aset wajib** — OG image, 60+ i18n keys, 22 file baru
- **Jangan langgar CODING_RULES** — baca `product-docs/CODING_RULES.md` penuh
- **Jangan push ke main langsung** — via PR + review
- **Jangan describe produk sebagai "document generation"** — ini "animation prompt automation"
- **Jangan tambah pricing section** — tidak ada model pricing
- **Jangan pakai AI SDK v6** — kode V1 pakai v4

---

## CATATAN WARNINGS (kosmetik, tidak blocker)

1. **WARN-001:** SRS.md S3.2 masih sebut "Lihat Demo atau Masuk" — seharusnya "Masuk" saja. Agent eksekutor boleh abaikan atau fix paralel.
2. **WARN-002:** UIUX_SPEC.md S1.3 masih sebut "Lihat Demo" sebagai contoh CTA copy. Seharusnya "Masuk".

---

## INSTRUKSI AKHIR

Mulai dari **Fase 1: Setup**. Verifikasi per task. Setelah Fase 3 selesai, jalankan `pnpm lint`, `pnpm typecheck`, `pnpm build`. Laporkan hasil ke orchestrator.

**Build autonomous sampai selesai. Jangan berhenti di tengah jalan.**

---

> **Dokumen ini = prompt eksekusi final untuk landing page PromptFlow. Agent eksekutor: baca dokumen ini + semua dokumen rujukan di atas, lalu bangun landing page persis sesuai spesifikasi.**
