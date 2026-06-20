# RAG-CONTEXT.md — PromptFlow Landing Page
> **Sumber kebenaran faktual** untuk pembangunan landing page PromptFlow
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Docs dir:** `C:\laragon\www\PromptFlow\product-docs`
> **Diperbarui:** 2026-06-20
> **Deliverable:** Landing page keren, animasi, menarik klien, teratarik daftar

---

## Daftar Isi

1. [Ringkasan Temuan](#1-ringkasan-temuan)
2. [Fakta Proyek (Source of Truth)](#2-fakta-proyek)
3. [Landing Page Existing](#3-landing-page-existing)
4. [Design System & Branding](#4-design-system--branding)
5. [Best Practices Landing Page SaaS 2024-2026](#5-best-practices-landing-page)
6. [Referensi Desain (Contoh Landing Page Bagus)](#6-referensi-desain)
7. [Animation & Motion Best Practices](#7-animation--motion)
8. [Gap Analysis & TIDAK ADA BUKTI](#8-gap-analysis)
9. [Asumsi yang Diambil](#9-asumsi)
10. [Daftar Sitasi Lengkap](#10-daftar-sitasi)

---

## 1. Ringkasan Temuan

### FAKTA (berbasis bukti kode + dokumen)
- **PromptFlow** = "Workflow engine otomasi prompt animasi AI" — web app fullstack yang mengotomasi susun paket prompt animasi terstruktur (JSON + markdown) dari input minimal (judul + durasi + gaya).
- **BUKAN** "AI document generation system" — deskripsi user mandate kontradiktif dengan semua dokumen proyek (BRD/PRD/MRD/AGENTS/README). Output = teks prompt terstruktur, BUKAN file media/dokumen generik.
- **Landing page SUDAH ADA** di `src/app/[locale]/page.tsx` — sangat basic: hero 1 section + 3 feature cards. Tanpa animasi, tanpa social proof, tanpa FAQ, tanpa pricing.
- **i18n keys landing sudah ada** di `messages/id.json` dan `messages/en.json` namespace `landing.*`.
- **Design tokens sudah ada** di `globals.css` — primary violet #7c3aed, Inter font, spacing 4px, radius 6px.
- **Tidak ada animation library** terinstall — package.json tidak punya framer-motion, gsap, atau motion.
- **Logo**: hanya `public/references/logo_agrinode-removebg-preview-8d857ade.png` — logo AgriNode, bukan logo PromptFlow khusus.
- **Tidak ada social proof data** — tidak ada testimonial, user count, atau case study di dokumen.
- **Tidak ada pricing info** — dokumen tidak sebut model pricing/billing.
- **Tech stack verified**: Next.js 15 + React 19 + Tailwind v4 + shadcn/ui + next-intl + pnpm.

### GAP KRITIS: Deskripsi User vs Realita Proyek
User mandate: "Landing page untuk PromptFlow - AI document generation system"
Realita proyek: "Workflow engine otomasi prompt animasi AI" (semua dokumen proyek)
-> **ASUMSI**: Deskripsi user adalah ringkasan longgar. Landing page harus describe PromptFlow SEBAGAI YANG ADA (animation prompt automation), bukan "document generation system".

---

## 2. Fakta Proyek

### 2.1 Apa itu PromptFlow

| Aspek | Nilai | Sitasi |
|---|---|---|
| Nama | PromptFlow | `README.md:1` |
| Deskripsi | Workflow engine otomasi prompt animasi AI | `README.md:3`, `src/app/layout.tsx:6` |
| Tipe | Web app fullstack (frontend + backend satu repo) | `AGENTS.md S1` |
| Output | Teks prompt terstruktur (JSON + export markdown) — BUKAN file media | `AGENTS.md S1` |
| Input | Judul + durasi target + gaya + referensi gambar (opsional) + deskripsi cerita (opsional) | `PRD.md S1.2` |
| Multi-provider | Ollama cloud, OpenRouter, 9router, custom | `PRD.md S1.2` |
| i18n | Dwibahasa ID + EN | `README.md:56` |
| Deploy target | Vercel + Turso DB + Vercel Blob | `AGENTS.md S1` |
| GitHub | https://github.com/agrianwahab29/promptflow.git | `AGENTS.md S1` |
| Status | V1 built & berjalan. V2 = upgrade iteratif | `AGENTS.md S1` |

### 2.2 Fitur Utama (dari BRD/PRD)

| # | Fitur | Status | Sitasi |
|---|---|---|---|
| 1 | Generate paket prompt dari judul + durasi + gaya | V1 LIVE | `PRD.md S1.3` |
| 2 | Konsistensi karakter lintas adegan (Character master) | V1 LIVE | `PRD.md S1.3` |
| 3 | Multi-provider LLM (fleksibilitas biaya) | V1 LIVE | `PRD.md S1.3` |
| 4 | Export JSON + Markdown | V1 LIVE | `PRD.md S1.3` |
| 5 | Upload referensi gambar + AI classification | V2 | `BRD.md S1` |
| 6 | Deskripsi cerita kontekstual | V2 | `BRD.md S1` |
| 7 | Real-time processing logs | V2 | `BRD.md S1` |
| 8 | Dashboard enrichment (charts, metrics) | V2 | `BRD.md S1` |
| 9 | Konsistensi UI (loading states, error boundaries) | V2 | `BRD.md S1` |
| 10 | Pagination + navigation optimization | V2 | `BRD.md S1` |

### 2.3 Value Proposition

| # | Value | Angka | Sitasi |
|---|---|---|---|
| 1 | Hemat waktu susun prompt | 80% vs manual | `PRD.md S1.3` |
| 2 | Friction reduction V2 | 50% (upload + generate 1 halaman) | `PRD.md S1.3` |
| 3 | Prompt lebih akurat | +30% via deskripsi cerita | `BRD.md S1` |
| 4 | Transparansi proses | Real-time logs | `BRD.md S1` |
| 5 | Monitoring produktivitas | Dashboard enrichment | `BRD.md S1` |

### 2.4 User Personas

| Persona | Deskripsi | Kebutuhan UI | Sitasi |
|---|---|---|---|
| Kreator Solo ("Rian") | Solo creator, workflow cepat | Upload + generate 1 halaman, AI transparan | `UIUX_SPEC S1.2` |
| Indie Studio ("Bumi Animasi") | Studio kecil, multi-proyek | Dashboard monitoring, pagination | `UIUX_SPEC S1.2` |
| Edukator ("Bu Sinta") | Tutorial maker, edukasi | Loading jelas, error recover, dwibahasa | `UIUX_SPEC S1.2` |

---

## 3. Landing Page Existing

### 3.1 File: `src/app/[locale]/page.tsx`

**Status:** SUDAH ADA — sangat basic, perlu TOTAL REDESIGN.

**Struktur saat ini:**
```
[locale]/page.tsx
├── Hero section (h1 + p + 2 CTA buttons)
└── Feature grid (3 cards: Input Judul, Konsistensi Karakter, Export Siap Pakai)
```

**Yang ADA:**
- Hero title: "Satu judul -> paket prompt animasi siap pakai"
- Hero subtitle: "Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown."
- 2 CTA: "Mulai Gratis" (-> /generate) + "Masuk" (-> /login)
- 3 feature cards basic

**Yang TIDAK ADA (perlu ditambah):**
- Animasi apapun (scroll, hover, entrance)
- Social proof (testimonial, user count, logos)
- Product demo / screenshot
- Pricing section
- FAQ section
- How it works section
- Trust signals
- Footer
- Navbar (mungkin shared)

### 3.2 i18n Keys Existing

```json
// messages/id.json — namespace "landing"
{
  "heroTitle": "Satu judul -> paket prompt animasi siap pakai",
  "heroSubtitle": "Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown.",
  "cta": "Mulai Gratis",
  "loginCta": "Masuk",
  "feature1Title": "Input Judul",
  "feature1Desc": "Masukkan judul + durasi + style. Sistem generate paket lengkap.",
  "feature2Title": "Konsistensi Karakter",
  "feature2Desc": "Character master terstruktur dirujuk lintas adegan — identitas tetap, adegan bervariasi.",
  "feature3Title": "Export Siap Pakai",
  "feature3Desc": "JSON terstruktur + Markdown. Copy ke tool image/video gen favorit."
}
```
- Sitasi: `messages/id.json:11-22`, `messages/en.json` (mirip)

**Catatan:** Keys ini perlu DITAMBAH untuk section baru (social proof, how it works, FAQ, pricing, dll).

---

## 4. Design System & Branding

### 4.1 Design Tokens (dari globals.css + UIUX_SPEC)

| Token | Nilai | Kegunaan | Sitasi |
|---|---|---|---|
| `--primary` | `#7c3aed` (violet) | CTA, brand color | `globals.css:10` |
| `--primary-foreground` | `#ffffff` | Teks di atas primary | `globals.css:11` |
| `--background` | `#ffffff` | Body bg (light mode) | `globals.css:4` |
| `--foreground` | `#0a0a0a` | Body text | `globals.css:5` |
| `--accent` | `#ede9fe` | Highlight, hover | `globals.css:16` |
| `--muted-foreground` | `#71717a` | Helper text | `globals.css:14` |
| `--border` | `#e4e4e7` | Border, divider | `globals.css:23` |
| `--font-sans` | Inter, system-ui, ... | Body font | `globals.css:27` |
| `--font-mono` | JetBrains Mono, ... | Code/mono font | `globals.css:28` |
| `--radius` | 6px | Default radius | `globals.css:26` |

### 4.2 Dark Mode Tokens

| Token | Nilai | Sitasi |
|---|---|---|
| `--primary` (dark) | `#a78bfa` | `globals.css:56` |
| `--background` (dark) | `#0a0a0a` | `globals.css:50` |
| `--accent` (dark) | `#3b0764` | `globals.css:62` |

### 4.3 Typography Scale

| Level | Size | Weight | Penggunaan | Sitasi |
|---|---|---|---|---|
| `text-4xl` | 36px | 800 | Landing hero | `UIUX_SPEC S2.4` |
| `text-5xl` | 48px | 800 | Landing hero display | `UIUX_SPEC S2.4` |
| `text-3xl` | 30px | 700 | Page H1, hero | `UIUX_SPEC S2.4` |
| `text-2xl` | 24px | 700 | Page H2, wizard step | `UIUX_SPEC S2.4` |
| `text-xl` | 20px | 600 | Page H3, metric value | `UIUX_SPEC S2.4` |
| `text-lg` | 18px | 500 | Card title, section | `UIUX_SPEC S2.4` |
| `text-base` | 16px | 400 | Body default | `UIUX_SPEC S2.4` |
| `text-sm` | 14px | 400 | Body sekunder | `UIUX_SPEC S2.4` |

### 4.4 Spacing Scale

| Token | px | Penggunaan Landing | Sitasi |
|---|---|---|---|
| `space-16` | 64 | Padding hero | `UIUX_SPEC S2.5` |
| `space-12` | 48 | Margin block besar | `UIUX_SPEC S2.5` |
| `space-10` | 40 | Padding landing section | `UIUX_SPEC S2.5` |
| `space-8` | 32 | Margin antar section | `UIUX_SPEC S2.5` |
| `space-6` | 24 | Gap block | `UIUX_SPEC S2.5` |

### 4.5 Brand Voice

| Aspek | Nilai | Sitasi |
|---|---|---|
| Tone | Profesional hangat, edukatif, ringkas | `UIUX_SPEC S1.4` |
| Bahasa | Dwibahasa ID+EN. ID default | `UIUX_SPEC S1.4` |
| AI copy | Netral ("AI menganalisis..." bukan "GPT-4o mendeteksi...") | `UIUX_SPEC S1.4` |
| Error message | Manusiawi + sebut aksi recovery | `UIUX_SPEC S1.4` |

### 4.6 Logo & Aset

| Aset | Path | Status | Sitasi |
|---|---|---|---|
| Logo AgriNode | `public/references/logo_agrinode-removebg-preview-8d857ade.png` | ADA (bukan logo PromptFlow khusus) | `public/references/` |

**TIDAK ADA BUKTI:** Logo PromptFlow khusus, brand guidelines, color palette resmi beyond CSS tokens, font files lokal (Inter via system-ui), mockup/screenshot produk untuk landing page.

---

## 5. Best Practices Landing Page SaaS 2024-2026

Sumber: fiveninestrategy.com, apexure.com, toimi.pro, saaslandingpage.com, saaspo.com

### 5.1 Struktur Section (urut halaman)

| # | Section | Tujuan | Best Practice |
|---|---|---|---|
| 1 | **Navbar** | Navigasi + brand | Logo kiri, nav links tengah, CTA kanan. Sticky. Minimal links. |
| 2 | **Hero** | Hook dalam 10 detik | (a) Apa produk, (b) Kenapa penting, (c) CTA jelas. Product demo/screenshot > text. |
| 3 | **Social Proof Bar** | Trust awal | Logo klien, user count, rating. Taruh SEBELUM hero atau SEGERA setelah hero. |
| 4 | **Problem/Solution** | Resonansi pain point | Highlight masalah user -> produk sebagai solusi. Warna berbeda untuk pain point. |
| 5 | **How It Works** | Edukasi workflow | 3-4 step visual. "Rule of three" — cukup detail tanpa overwhelming. |
| 6 | **Features/Benefits** | Diferensiasi | Bento grid. Benefit > feature. Quantifiable data. Per-section accent colors. |
| 7 | **Product Demo** | Bukti produk works | Live preview, screenshot, GIF, atau video. "Product is the demo." |
| 8 | **Testimonials** | Social proof mendalam | 3+ testimonial. Short, bold, address pain point. Tie to KPI/metrics. |
| 9 | **Pricing** | Konversi | Value-based naming (bukan Basic/Pro). Comparison table. Clear CTA per tier. |
| 10 | **FAQ** | Objection handling | Top 5-8 questions. Short, direct answers. Sourced from real user questions. |
| 11 | **Final CTA** | Closing conversion | Repeat primary CTA. Urgency/scarcity bila ada. |
| 12 | **Footer** | Navigasi + legal | Minimal links, social media, copyright. |

### 5.2 Hero Section Best Practices

| Prinsip | Detail | Sitasi |
|---|---|---|
| 10-second rule | Komunikasi: apa produk, kenapa penting, CTA jelas — dalam 10 detik | fiveninestrategy.com SHero |
| Singular CTA | 1 primary CTA, boleh 1 secondary. Multiple CTA = confusion. | apexure.com S5 |
| Product visual | Screenshot/GIF/demo > text. Authentic product visuals. | apexure.com S2 |
| Social proof ringkas | "Trusted by X users" atau logo bar di bawah hero | fiveninestrategy.com SHero |
| Benefit headline | "Save 80% time" > "AI-powered prompt generator" | fiveninestrategy.com SHero |

### 5.3 Conversion Optimization

| Prinsip | Detail | Sitasi |
|---|---|---|
| 1:1 Attention Ratio | 1 halaman = 1 tujuan. Landing page != homepage. | apexure.com S1 |
| Low cognitive load | Sedikit teks, chunking, visual guide. Rocket Money model. | apexure.com S8 |
| Mobile-first | 50%+ traffic mobile. Jangan shrink desktop ke mobile. | apexure.com S9 |
| Forms minimal | Multistep form bila perlu. Progressive profiling. | apexure.com S7 |
| Urgency | Countdown, limited supply, high demand. "Rule of three" action steps. | fiveninestrategy.com SUrgency |
| FAQ = objection handling | Sourced from real questions. Short answers. Clear CTA path. | fiveninestrategy.com SFAQ, apexure.com S4 |

---

## 6. Referensi Desain

### 6.1 Techno-Futurist Camp (Dark Mode + Neon + Shaders)

| Situs | Highlight | Relevansi ke PromptFlow | Sitasi |
|---|---|---|---|
| **Linear** (linear.app) | Dark mode + purple accent, kinetic typography, live AI agent demo, bento grid | SANGAT relevan — PromptFlow juga AI tool, purple brand | toimi.pro SLinear |
| **Vercel** (vercel.com) | Dark mode, shader backgrounds, Geist font, terminal-style sections | Relevan — tech/developer audience | toimi.pro SVercel |
| **Stripe** (stripe.com) | WebGL mesh gradient, enterprise polish, interactive code tabs | Relevan untuk polish level | toimi.pro SStripe |
| **Framer** (framer.com) | Maximum motion, cursor-triggered, kinetic type | Referensi animasi | toimi.pro SFramer |
| **Attio** (attio.com) | Monochrome + pastel accents, live "Ask Attio" demo | Relevan — AI-first, live demo pattern | toimi.pro SAttio |
| **Ramp** (ramp.com) | Bento grid formalized, scroll-driven narrative | Referensi layout | toimi.pro SRamp |
| **ElevenLabs** (elevenlabs.io) | Audio waveform hero, sensory product demo | Referensi — kalau PromptFlow bisa "demo" prompt output | toimi.pro SElevenLabs |

### 6.2 Editorial Counter-Camp (Warm + Serif + Whitespace)

| Situs | Highlight | Relevansi | Sitasi |
|---|---|---|---|
| **Notion** (notion.so) | Warm illustration, persona-based navigation | Bila target non-technical | toimi.pro SNotion |
| **PostHog** (posthog.com) | Quirky mascot, hand-drawn, multi-color | Bila mau "weird" differentiation | toimi.pro SPostHog |
| **Anthropic** (anthropic.com) | Cream bg, serif type, editorial, restraint | Bila mau signal trust/seriousness | toimi.pro SAnthropic |

### 6.3 Rekomendasi Aesthetic untuk PromptFlow

**PromptFlow sebaiknya di camp Techno-Futurist** karena:
1. Produk = AI tool -> dark mode + neon accent = natural fit
2. Brand color violet #7c3aed -> match purple accent pattern (Linear-style)
3. Target kreator animasi AI -> appreciate visual sophistication
4. Product demo bisa ditampilkan (generate flow)

**Concrete direction:**
- Dark mode default (#0a0a0a bg)
- Primary violet #7c3aed sebagai single accent
- Inter font (sudah ada) — bisa upgrade ke Inter Display untuk headlines
- Bento grid untuk features
- Live product demo/screenshot di hero (generate form mockup)
- Scroll-triggered animations
- Minimal, high-contrast, high-craft

---

## 7. Animation & Motion

### 7.1 Library Options

| Library | Size | Fitur | Rekomendasi | Sitasi |
|---|---|---|---|---|
| **Framer Motion** | ~30KB gzipped | `whileInView`, `useInView`, `useScroll`, spring physics, layout animations | **RECOMMENDED** — standard untuk React/Next.js | brad-carter.medium.com, shyamswaroop.hashnode.dev |
| **CSS Scroll-Driven Animations** | 0KB (native) | `animation-timeline: scroll()`, no JS | Good untuk simple fade-in. Browser support: Chrome 115+ | rebeccamdeprey.com |
| **GSAP ScrollTrigger** | ~25KB | Complex narratives, parallax, timeline sequences | Overkill untuk landing page | toimi.pro SLinear |
| **Intersection Observer** | 0KB (native) | `isIntersecting` -> trigger CSS class | Basic fade-in, no spring physics | dev.to, stackoverflow |

**RECOMMENDATION:** Framer Motion — install sebagai dependency baru. Paling fit untuk React/Next.js, community besar, API intuitif.

### 7.2 Animation Patterns untuk Landing Page

| Pattern | Kapan Pakai | Implementasi | Sitasi |
|---|---|---|---|
| **Fade-in on scroll** | Setiap section masuk viewport | `whileInView={{ opacity: 1 }}` Framer Motion | saaspo.com/scroll-animations |
| **Stagger children** | Feature cards, testimonial cards | `staggerChildren` di parent | framer.com pattern |
| **Slide up** | Hero text, section headings | `initial={{ y: 20 }} animate={{ y: 0 }}` | Linear pattern |
| **Scale on hover** | Feature cards, CTA buttons | `whileHover={{ scale: 1.02 }}` | Attio pattern |
| **Gradient animation** | Hero background, accent elements | CSS `@keyframes` gradient shift | Stripe/Vercel pattern |
| **Counter animation** | Stats/numbers (users, prompts generated) | `useMotionValue` + `useTransform` | Ramp pattern |
| **Typing effect** | Hero headline | Framer Motion word swap | Linear "teams/agents" pattern |
| **Parallax** | Hero background elements | `useScroll` + `useTransform` | Framer pattern |

### 7.3 Performance Considerations

| Prinsip | Detail | Sitasi |
|---|---|---|
| `prefers-reduced-motion` | Respect OS setting — disable animation | `globals.css:74-80` (SUDAH ADA) |
| GPU-accelerated properties only | `transform`, `opacity` — avoid `width`, `height`, `top` | framer.com docs |
| Lazy load heavy animations | Below-fold animations -> load on intersection | apexure.com S9 |
| No layout shift | Animations shouldn't cause CLS | Core Web Vitals |
| Bundle size | Framer Motion ~30KB gzipped — acceptable | npmjs.com |

---

## 8. Gap Analysis

### 8.1 TIDAK ADA BUKTI (Perlu Asumsi atau Konfirmasi)

| ID | Gap | Dampak | Asumsi yang Diambil |
|---|---|---|---|
| GAP-01 | **Deskripsi user "AI document generation system" kontradiktif** dengan realita "animation prompt automation" | Landing page bisa salah describe produk | Gunakan deskripsi dari dokumen proyek (animation prompt automation) |
| GAP-02 | **Tidak ada logo PromptFlow khusus** — hanya logo AgriNode | Branding lemah | Gunakan text-based logo "PromptFlow" dengan violet styling |
| GAP-03 | **Tidak ada testimonial/user data** | Tidak ada social proof | Buat placeholder section, siap diisi nanti |
| GAP-04 | **Tidak ada pricing model** | Tidak ada pricing section | Skip pricing section atau buat "Free for now" messaging |
| GAP-05 | **Tidak ada product screenshot/mockup** | Hero tidak ada visual produk | Buat text-based hero dengan gradient/animation, atau gunakan generate form mockup |
| GAP-06 | **Tidak ada animation library terinstall** | Butuh install framer-motion | Install framer-motion sebagai dependency baru |
| GAP-07 | **Tidak ada OG image / meta tags untuk sharing** | Share di social media kurang menarik | Buat OG image nanti, set Metadata di layout |
| GAP-08 | **Tidak ada analytics/tracking** | Tidak bisa track conversion | Tambahkan nanti (Vercel Analytics, GA4) |
| GAP-09 | **Tidak ada CTA "Daftar" yang jelas** | User tidak tahu cara mulai | CTA = "Mulai Gratis" -> /register |
| GAP-10 | **Tidak ada navbar component** | Landing page tanpa navigasi | Buat atau reuse app-header component |

### 8.2 Yang SUDAH ADA (Bisa Dipakai Langsung)

| # | Asset | Path | Status |
|---|---|---|---|
| 1 | Design tokens (warna, font, spacing) | `src/app/globals.css` | SIAP PAKAI |
| 2 | shadcn/ui components | `src/components/ui/` | SIAP PAKAI |
| 3 | Button component | `src/components/ui/button.tsx` | SIAP PAKAI |
| 4 | i18n infrastructure | `next-intl` + `messages/*.json` | SIAP PAKAI |
| 5 | Landing page basic | `src/app/[locale]/page.tsx` | PERLU REDESIGN |
| 6 | Landing i18n keys | `messages/id.json:11-22` | PERLU EXPAND |
| 7 | reduced-motion respect | `globals.css:74-80` | SIAP PAKAI |

---

## 9. Asumsi

| ID | Asumsi | Alasan | Dampak bila Salah |
|---|---|---|---|
| ASM-01 | Deskripsi produk = "animation prompt automation" (bukan "document generation") | Semua dokumen proyek konsisten | Landing page salah describe |
| ASM-02 | Primary CTA = "Mulai Gratis" -> /register | i18n key sudah ada, flow register sudah ada | Conversion path broken |
| ASM-03 | Secondary CTA = "Masuk" -> /login | i18n key sudah ada | — |
| ASM-04 | Aesthetic = dark mode techno-futurist (Linear-style) | Match AI tool + purple brand | Bisa beda taste user |
| ASM-05 | Animasi pakai Framer Motion | Standard React, fitur lengkap | Bundle tambah ~30KB |
| ASM-06 | Landing page = `/[locale]/page.tsx` (overwrite existing) | File sudah ada, i18n sudah wired | — |
| ASM-07 | Tidak perlu pricing section (produk free/gratis) | Tidak ada pricing info di dokumen | User mau pricing |
| ASM-08 | Social proof = placeholder (user count, testimonial kosong) | Tidak ada data real | Page terasa kosong |
| ASM-09 | Product demo = text-based hero (bukan screenshot) | Tidak ada screenshot produk | Kurang convincing |
| ASM-10 | FAQ = 5-6 pertanyaan umum | Best practice 5-8 | — |
| ASM-11 | Footer = minimal (copyright + links) | Standard SaaS pattern | — |
| ASM-12 | Mobile-first responsive | 50%+ traffic mobile | Desktop-only |
| ASM-13 | Bahasa default = ID, toggle EN | i18n sudah setup | — |
| ASM-14 | Tidak perlu auth di landing page | Landing page = public | — |
| ASM-15 | Animasi = scroll-triggered fade-in + hover effects | Standard, performa baik | User mau lebih complex |

---

## 10. Daftar Sitasi

| # | Path/URL | Klaim |
|---|---|---|
| S01 | `README.md:1-3` | PromptFlow = workflow engine otomasi prompt animasi AI |
| S02 | `README.md:22` | Stack: Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui + Drizzle + Turso + NextAuth v5 + Vercel AI SDK v4 + Zod + next-intl + Vitest + Playwright |
| S03 | `package.json:22-83` | Semua dependencies dan versi |
| S04 | `src/app/[locale]/page.tsx:1-41` | Landing page existing (basic hero + 3 cards) |
| S05 | `messages/id.json:11-22` | i18n keys landing namespace |
| S06 | `src/app/globals.css:1-82` | Design tokens (warna, font, spacing, dark mode, reduced-motion) |
| S07 | `src/app/layout.tsx:5-6` | Metadata: title "PromptFlow", description "Workflow engine otomasi prompt animasi AI" |
| S08 | `components.json:1-20` | shadcn/ui config: default style, RSC, TSX, neutral base, CSS variables |
| S09 | `AGENTS.md S1` | Identitas proyek: web app fullstack, 9 tabel DB, 23 endpoint |
| S10 | `BRD.md S1` | Ringkasan eksekutif + 8 fitur V2 |
| S11 | `BRD.md S3.1` | Tujuan bisnis V2 + KPI |
| S12 | `PRD.md S1.2` | Ringkasan produk: tipe, input, output, stack, multi-provider |
| S13 | `PRD.md S1.3` | Value proposition V1 + V2 |
| S14 | `PRD.md S2` | User personas: Rian, Bumi Animasi, Bu Sinta |
| S15 | `MRD.md S2.1-2.4` | Market analysis, trends, timing |
| S16 | `UIUX_SPEC S1.2` | Persona + implikasi UI |
| S17 | `UIUX_SPEC S1.3` | Prinsip desain (10 prinsip) |
| S18 | `UIUX_SPEC S1.4` | Brand voice: tone, bahasa, istilah |
| S19 | `UIUX_SPEC S2.1` | Warna palet (14 token light + dark) |
| S20 | `UIUX_SPEC S2.3-2.4` | Tipografi: Inter + JetBrains Mono, size scale |
| S21 | `UIUX_SPEC S2.5` | Spacing scale (base 4px) |
| S22 | `UIUX_SPEC S2.6` | Radius, border, shadow tokens |
| S23 | `public/references/logo_agrinode-removebg-preview-8d857ade.png` | Logo AgriNode (bukan PromptFlow) |
| S24 | `fiveninestrategy.com` | SaaS landing page best practices: hero, problem/solution, benefits, social proof, demo, urgency, FAQ |
| S25 | `apexure.com` | 10 SaaS landing page best practices: attention ratio, product visuals, trust, FAQs, singular CTA, interactive features, forms, cognitive load, mobile-first, social proof |
| S26 | `toimi.pro/blog/best-saas-website-designs/` | Top 10 SaaS website designs 2026: Linear, Stripe, Vercel, Framer, Notion, Attio, Ramp, ElevenLabs, PostHog, Anthropic |
| S27 | `saaspo.com/industry/ai-saas-websites-inspiration` | 221 AI SaaS landing pages inspiration |
| S28 | `brad-carter.medium.com` | Framer Motion + Intersection Observer scroll animations |
| S29 | `rebeccamdeprey.com` | CSS scroll-driven animations (no JS) |
| S30 | `globals.css:74-80` | `prefers-reduced-motion` sudah diimplementasi |

---

> **Dokumen ini = sumber kebenaran untuk pembangunan landing page PromptFlow. Eksekutor harus baca dokumen ini + rujukan product-docs/ sebelum coding. Semua klaim bersitasi. Klaim tanpa bukti = ASUMSI.**

**Dibuat oleh:** docgen-rag subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0 (Landing Page Focus)
