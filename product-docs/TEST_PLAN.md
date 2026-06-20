# TEST_PLAN.md — PromptFlow Landing Page

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Deliverable:** Landing page `src/app/[locale]/page.tsx` — redesign total
> **Selaras:** PRD.md, SRS.md, PROJECT_ARCHITECTURE.md, UIUX_SPEC.md, CODING_RULES.md

---

## 1. Ringkasan Strategi Pengujian

### Strategi

Pengujian dilakukan bertingkat: **unit** (komponen render + i18n + animasi logic) -> **integration** (section + interaksi) -> **E2E** (critical path visitor -> CTA -> register) -> **visual/responsive** (screenshot multi-viewport) -> **aksesibilitas** (axe-core WCAG 2.1 AA) -> **performa** (Lighthouse >= 85). Semua test co-located pakai Vitest (unit/integration) + Playwright (E2E) + Lighthouse CI (performa/a11y).

### Lingkup In-Scope

| Area | Detail |
|---|---|
| 11 section components | Navbar, Hero, SocialProofBar, ProblemSolution, HowItWorks, FeaturesBento, ProductDemo, Testimonials, FAQ, FinalCTA, Footer |
| 7 reusable components | SectionWrapper, AnimatedCounter, BrowserMockup, FeatureCard, TestimonialCard, FaqItem, LogoPlaceholder |
| 3 config modules | sections.ts, features.ts, events.ts |
| i18n | namespace `landing.*` ID + EN (60+ keys) |
| Animasi | Framer Motion: fade-in, stagger, hover scale, counter, typing, gradient shift |
| Cross-cutting | Dark mode default, SEO meta, Analytics events, responsive, a11y |

### Lingkup Out-of-Scope

| Area | Alasan |
|---|---|
| Backend endpoint baru | Landing = frontend only (SRS S5.5) |
| Auth flow | Sudah ada /login, /register |
| Pricing section | Tidak ada pricing model (PRD OOS-02) |
| AI SDK v6 | Kode V1 pakai v4 (AGENTS.md CRIT-002) |
| Light mode toggle | OOS V2 (PRD COULD F-17) |
| Blog / video embed | OOS V2 (PRD OOS-06, OOS-07) |

### Asumsi Pengujian

| ID | Asumsi | Sumber |
|---|---|---|
| TP-A01 | Vitest berfungsi di environment test project (sudah ada di package.json) | package.json:74 |
| TP-A02 | Playwright berfungsi di environment test (sudah ada di package.json) | package.json:77 |
| TP-A03 | Lighthouse CLI bisa dijalankan locally / di CI | Best practice |
| TP-A04 | framer-motion dan @vercel/analytics sudah terinstall saat test | PRD S7.4 |
| TP-A05 | Test DB (Turso) tidak diperlukan — landing = frontend static tanpa API | SRS S5.5 |
| TP-A06 | Mock data statis untuk testimonial, social proof, FAQ | PRD S4 |

---

## 2. Level Pengujian & Tujuan

| Level | Tujuan | Tool | Target | Output |
|---|---|---|---|---|
| **Unit** | Verifikasi render komponen individual, props, state, i18n key, animasi logic | Vitest + @testing-library/react | >= 80% coverage | `*.test.tsx` co-located |
| **Integration** | Verifikasi section composition + interaksi antar komponen (FAQ toggle, navbar scroll, language switch) | Vitest + @testing-library/react | >= 70% coverage | `*.test.tsx` |
| **E2E** | Verifikasi critical path: visitor -> landing -> scroll -> CTA -> /register | Playwright | 100% critical path | `e2e/landing.spec.ts` |
| **Visual/Responsive** | Screenshot multi-viewport (375/768/1024/1440px) + layout verifikasi | Playwright screenshot | Semua viewport | Screenshot artifacts |
| **Aksesibilitas** | WCAG 2.1 AA compliance, 0 critical axe-core violation | axe-core + Playwright | 0 critical | a11y report |
| **Performa** | Lighthouse Performance >= 85, CLS <= 0.1, LCP <= 2.5s | Lighthouse CI | Targets tercapai | Lighthouse report |
| **Keamanan** | No secret client-side, no XSS, external link rel="noopener", HTTPS | Manual + ESLint | 0 violation | Checklist |

---

## 3. Lingkungan & Tooling Test

### 3.1 Framework & Tool

| Tool | Versi | Kegunaan | Config |
|---|---|---|---|
| Vitest | ^2.1.0 | Unit + integration test | `vitest.config.ts` |
| @vitest/coverage-v8 | ^2.2.0 | Coverage reporting | Coverage threshold 80% |
| @testing-library/react | latest | Component render + DOM assertions | Co-located |
| @testing-library/jest-dom | latest | DOM matchers | Co-located |
| Playwright | ^1.49.0 | E2E + visual + a11y | `playwright.config.ts` |
| axe-core | latest | A11y violation detection | Via @axe-core/playwright |
| Lighthouse CI | latest | Performance audit | CLI / CI pipeline |
| ESLint | ^9.17.0 | Linting | `eslint.config.mjs` |
| TypeScript | ^5.7.0 | Type checking | `tsconfig.json` strict |

### 3.2 Test Data

| Data | Sumber | Persiapan |
|---|---|---|
| i18n messages | `messages/id.json`, `messages/en.json` | Hardcode fixture test. Render dengan nextIntl wrapper. |
| Feature cards config | `src/lib/landing/features.ts` | Import langsung (static data) |
| Section config | `src/lib/landing/sections.ts` | Import langsung (static data) |
| Analytics events | `src/lib/analytics/events.ts` | Mock `track()` function |
| Design tokens | `src/app/globals.css` | Verify via computed styles / snapshot |

### 3.3 Mock & Stub

| Item | Strategi |
|---|---|
| `framer-motion` | Mock `motion.*` component. Mock `useReducedMotion()` -> true/false. Mock `useInView()` -> true. |
| `@vercel/analytics/react` | Mock `track()` function. Spy assert event name + properties. |
| `next-intl` | Wrap test dengan `NextIntlClientProvider` + messages fixture. |
| `next-intl/link` | Mock sebagai plain a tag di test. |
| `next/navigation` | Mock `useRouter`, `usePathname`, `useLocale`. |
| `lucide-react` | No mock needed — render as-is. |

### 3.4 Data Test Fixtures

```typescript
// src/__fixtures__/landing.ts
export const testMessages = {
  id: {
    landing: {
      nav: { features: 'Fitur', howItWorks: 'Cara Kerja', faq: 'FAQ', cta: 'Mulai Gratis' },
      heroTitle: 'Satu judul ke paket prompt animasi siap pakai',
      heroSubtitle: 'Karakter konsisten lintas adegan.',
      heroCtaPrimary: 'Mulai Gratis',
      heroCtaSecondary: 'Masuk',
    },
  },
  en: {
    landing: {
      nav: { features: 'Features', howItWorks: 'How It Works', faq: 'FAQ', cta: 'Start Free' },
      heroTitle: 'One title to ready-to-use animation prompt pack',
      heroSubtitle: 'Character consistency across scenes.',
      heroCtaPrimary: 'Start Free',
      heroCtaSecondary: 'Sign In',
    },
  },
};
```

---

## 4. Matriks Fitur -> Test Scenario

| PRD ID | Section | Fitur | Test Scenario | Level | Prioritas |
|---|---|---|---|---|---|
| F-01 | Navbar | Sticky + scroll bg + nav links + lang toggle + CTA | TC-001..TC-007 | Unit, E2E, A11y | MUST |
| F-02 | Hero | Headline + sub + 2 CTA + gradient bg + FM entrance | TC-008..TC-013 | Unit, E2E, Visual, A11y | MUST |
| F-03 | Social Proof Bar | Logo row + counter animation + trust signal | TC-014..TC-017 | Unit, Visual | MUST |
| F-04 | Problem/Solution | 3 pain + 3 solution + icon + stagger | TC-018..TC-021 | Unit, E2E | MUST |
| F-05 | How It Works | 3 step + connector + mobile timeline | TC-022..TC-025 | Unit, Responsive | MUST |
| F-06 | Features Bento | 6 card bento + hover scale + col-span | TC-026..TC-030 | Unit, E2E, Visual | MUST |
| F-07 | Product Demo | Browser mockup + typing + loading + JSON | TC-031..TC-035 | Unit, Visual, Perf | MUST |
| F-08 | Testimonials | 3 card + placeholder + carousel mobile | TC-036..TC-039 | Unit, Responsive | MUST |
| F-09 | FAQ | 5-6 accordion + expand/collapse + multi-open | TC-040..TC-046 | Unit, E2E, A11y | MUST |
| F-10 | Final CTA | Gradient + headline + CTA + disclaimer | TC-047..TC-049 | Unit, Visual | MUST |
| F-11 | Footer | 4 kolom + responsive + social + copyright | TC-050..TC-053 | Unit, Responsive | MUST |
| F-12 | Animations | FM fade-in, stagger, hover, gradient, counter | TC-054..TC-060 | Unit, Integration, Perf | SHOULD |
| F-13 | Dark Mode | Dark default, token konsisten | TC-061..TC-063 | Unit, Visual | SHOULD |
| F-14 | SEO Meta | Title, description, OG, canonical, hreflang | TC-064..TC-067 | E2E | SHOULD |
| F-15 | Analytics | Track events cta_hero, faq_expand, scroll_75, lang toggle | TC-068..TC-072 | Integration | SHOULD |
| F-16 | Responsive | 375/768/1024/1440px no horizontal scroll | TC-073..TC-076 | Responsive, E2E | MUST |
| -- | i18n | ID/EN sinkron, toggle preserve scroll | TC-077..TC-080 | Integration, E2E | MUST |
| -- | Build Quality | Lint 0 error, typecheck 0 error, build pass | TC-081..TC-083 | CI gate | MUST |

---

## 5. Detail Test Case

### 5.1 Navbar (F-01)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-001 | Navbar | Page loaded | Render navbar | -- | Logo PromptFlow visible, nav links (Fitur, Cara Kerja, FAQ) visible, CTA Mulai Gratis visible | Logo + 3 links + CTA exist in DOM | MUST | Unit |
| TC-002 | Navbar | Page loaded, scrolled > 50px | Scroll page | window.scrollBy(0, 100) | Navbar bg changes from transparent to solid (bg-background/80 backdrop-blur) | Computed style shows backdrop-blur and bg opacity | MUST | Integration |
| TC-003 | Navbar | Page at top | Click nav link Fitur | Click on #features link | Smooth scroll to #features section | document.querySelector('#features') in viewport | MUST | E2E |
| TC-004 | Navbar | Page at top | Click nav link Cara Kerja | Click on #how-it-works link | Smooth scroll to #how-it-works | Section visible in viewport | MUST | E2E |
| TC-005 | Navbar | Page at top | Click nav link FAQ | Click on #faq link | Smooth scroll to #faq section | Section visible in viewport | MUST | E2E |
| TC-006 | Navbar | Page loaded | Click language toggle EN | Click toggle button | URL changes to /en/..., all text switches to English | URL prefix = /en/, heading text in English | MUST | E2E |
| TC-007 | Navbar | Page loaded | Tab through navbar | Press Tab key repeatedly | All interactive elements reachable + focus ring visible | focus-visible ring shown on each element | MUST | A11y |

### 5.2 Hero (F-02)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-008 | Hero | Page loaded (ID locale) | Verify headline | -- | h1 visible, text contains "Satu judul" | Heading h1 with text content | MUST | Unit |
| TC-009 | Hero | Page loaded | Verify subheadline | -- | Text contains "Karakter konsisten lintas adegan" | Subtext visible below h1 | MUST | Unit |
| TC-010 | Hero | Page loaded | Verify 2 CTA buttons | -- | "Mulai Gratis" -> /register. "Masuk" -> /login | Both buttons exist with correct href | MUST | Unit |
| TC-011 | Hero | Page loaded | Verify gradient bg | -- | Hero section has gradient background class | Element has gradient class/style | MUST | Visual |
| TC-012 | Hero | Page loaded | Verify FM entrance | -- | Content fades in on load (opacity 0 -> 1) | FM motion.div has initial/animate props | MUST | Unit |
| TC-013 | Hero | reduced-motion: reduce | Verify no animation | setEmulatedMedia prefers-reduced-motion reduce | No motion, content visible immediately | Elements visible without animation | MUST | Unit |

### 5.3 Social Proof Bar (F-03)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-014 | SocialProof | Page loaded | Verify trust headline | -- | Text "Dipercaya" + number visible | Trust text present | MUST | Unit |
| TC-015 | SocialProof | Page loaded | Verify logo row | -- | 5-6 logo placeholders rendered | Multiple logo elements present | MUST | Unit |
| TC-016 | SocialProof | Scroll into view | Counter animates | Scroll to section | Counter value animates from 0 to 100+ | Final value >= 100 | MUST | Integration |
| TC-017 | SocialProof | Page loaded | Verify max height | -- | Section height <= 200px | getBoundingClientRect().height <= 200 | MUST | Visual |

### 5.4 Problem/Solution (F-04)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-018 | ProblemSolution | Page loaded | Verify 3 pain points | -- | 3 items with icon + title + desc visible | 3 problem items rendered | MUST | Unit |
| TC-019 | ProblemSolution | Page loaded | Verify 3 solutions | -- | 3 items with icon + title + desc visible | 3 solution items rendered | MUST | Unit |
| TC-020 | ProblemSolution | Desktop 1024px | Verify 2-column | setViewport(1024, 768) | Pain left, Solution right side by side | CSS grid 2 columns | MUST | Visual |
| TC-021 | ProblemSolution | Mobile 375px | Verify stacked | setViewport(375, 812) | Items stack vertically | Single column layout | MUST | Responsive |

### 5.5 How It Works (F-05)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-022 | HowItWorks | Page loaded | Verify 3 steps | -- | Input, Generate, Export visible | 3 steps with numbers 1/2/3 | MUST | Unit |
| TC-023 | HowItWorks | Desktop 1024px | Verify connectors | setViewport(1024, 768) | Arrow between steps | SVG/char connector | MUST | Visual |
| TC-024 | HowItWorks | Mobile 375px | Verify timeline | setViewport(375, 812) | Steps stack vertically | Vertical layout | MUST | Responsive |
| TC-025 | HowItWorks | Page loaded | Verify icons | -- | PenLine, Wand2, FileDown | lucide icons visible | MUST | Unit |

### 5.6 Features Bento Grid (F-06)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-026 | FeaturesBento | Page loaded | Verify 6 cards | -- | 6 FeatureCard rendered | Count = 6 | MUST | Unit |
| TC-027 | FeaturesBento | Desktop 1024px | Verify bento | setViewport(1024, 768) | Character Master spans 2 cols | col-span-2 on card 2 | MUST | Visual |
| TC-028 | FeaturesBento | Page loaded | Verify hover | Hover card | scale(1.02) | whileHover works | MUST | Unit |
| TC-029 | FeaturesBento | Page loaded | Verify 6 icons | -- | Sparkles, Brain, Layers, Download, Activity, Upload | 6 icons present | MUST | Unit |
| TC-030 | FeaturesBento | Scroll into view | Stagger | Scroll to features | Cards animate in sequence | staggerChildren | MUST | Integration |

### 5.7 Product Demo (F-07)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-031 | ProductDemo | Page loaded | Browser chrome | -- | 3 dots + address bar | BrowserMockup visible | MUST | Unit |
| TC-032 | ProductDemo | Page loaded | Form mockup | -- | Judul, durasi, gaya fields | Form mockup text | MUST | Unit |
| TC-033 | ProductDemo | Page loaded | JSON output | -- | JSON snippet + syntax highlight | Code block visible | MUST | Unit |
| TC-034 | ProductDemo | Page loaded | Typing anim | Wait 3s | Text appears char by char | Progressive text | MUST | Integration |
| TC-035 | ProductDemo | Page loaded | Loop check | Wait 10s | Animation resets and replays | Restart after ~8-10s | SHOULD | Integration |

### 5.8 Testimonials (F-08)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-036 | Testimonials | Page loaded | 3 cards | -- | 3 TestimonialCard | Count = 3 | MUST | Unit |
| TC-037 | Testimonials | Page loaded | Avatar initials | -- | Initials in violet circle | Avatar element present | MUST | Unit |
| TC-038 | Testimonials | Page loaded | Beta label | -- | "Cerita dari beta tester" | Label visible | MUST | Unit |
| TC-039 | Testimonials | Mobile 375px | Carousel/stack | setViewport(375, 812) | 1 column or carousel | Single column | MUST | Responsive |

### 5.9 FAQ (F-09)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-040 | FAQ | Page loaded | 5-6 items | -- | 5-6 accordion items | count >= 5 and <= 6 | MUST | Unit |
| TC-041 | FAQ | Page loaded | Default collapsed | -- | All answers hidden | No answer visible | MUST | Unit |
| TC-042 | FAQ | Page loaded | Click item 1 | Click trigger | Answer 1 expands | Answer visible | MUST | E2E |
| TC-043 | FAQ | Item 1 expanded | Click item 1 again | Click trigger | Answer 1 collapses | Answer hidden | MUST | E2E |
| TC-044 | FAQ | Page loaded | Click 1+2 | Click 2 items | Both answers visible | Multi-open works | MUST | E2E |
| TC-045 | FAQ | Page loaded | Chevron rotate | Click item | ChevronDown rotate 90deg | transform rotate(90deg) | MUST | Unit |
| TC-046 | FAQ | Page loaded | Keyboard Enter | Focus + Enter | Answer expands | aria-expanded=true | MUST | A11y |

### 5.10 Final CTA (F-10)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-047 | FinalCTA | Page loaded | Gradient bg | -- | Violet gradient full-width | Gradient class present | MUST | Unit |
| TC-048 | FinalCTA | Page loaded | CTA button | -- | "Mulai Gratis" -> /register | Button correct href | MUST | Unit |
| TC-049 | FinalCTA | Page loaded | Disclaimer | -- | "Tanpa kartu kredit." visible | Disclaimer text present | MUST | Unit |

### 5.11 Footer (F-11)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-050 | Footer | Desktop 1024px | 4 columns | setViewport(1024, 768) | Brand+Product+Legal+Social | 4 column groups | MUST | Unit |
| TC-051 | Footer | Mobile 375px | 1 column | setViewport(375, 812) | All columns stack | Single column | MUST | Responsive |
| TC-052 | Footer | Page loaded | Copyright | -- | "2026 PromptFlow" | Copyright text | MUST | Unit |
| TC-053 | Footer | Page loaded | Social links | -- | GitHub + Twitter rel=noopener | 2 external links | MUST | Unit |

### 5.12 Animations (F-12)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-054 | Animations | Any section | Fade-in scroll | Scroll into viewport | opacity 0->1, y:20->0 | FM whileInView | MUST | Unit |
| TC-055 | Animations | Features | Stagger | Scroll to features | Cards animate sequence | staggerChildren | MUST | Unit |
| TC-056 | Animations | Feature cards | Hover scale | Hover card | scale(1.02) | whileHover works | MUST | Unit |
| TC-057 | Animations | CTA buttons | Hover+tap | Hover+tap CTA | 1.02 hover, 0.98 tap | whileHover+Tap | MUST | Unit |
| TC-058 | Animations | Hero bg | Gradient shift | -- | BG gradient 8s loop | CSS keyframes | SHOULD | Visual |
| TC-059 | Animations | SocialProof | Counter | Scroll to section | 0->target | useMotionValue | MUST | Unit |
| TC-060 | Animations | Any | Reduced motion | prefers-reduced-motion:reduce | No FM anims | Content visible | MUST | Unit |

### 5.13 Dark Mode (F-13)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-061 | DarkMode | Page loaded | dark class | -- | html has "dark" class | classList.contains | MUST | Unit |
| TC-062 | DarkMode | Page loaded | bg token | -- | body bg #0a0a0a | computedStyle match | MUST | Visual |
| TC-063 | DarkMode | Page loaded | primary dark | -- | CTA #a78bfa | primary color applied | MUST | Visual |

### 5.14 SEO Meta (F-14)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-064 | SEO | Page loaded | Title | -- | <=60 char + "PromptFlow" | Title tag correct | MUST | E2E |
| TC-065 | SEO | Page loaded | Description | -- | <=160 char | Desc tag valid | MUST | E2E |
| TC-066 | SEO | Page loaded | OG image | -- | og:image present | 1200x630 image | SHOULD | E2E |
| TC-067 | SEO | Page loaded | Hreflang | -- | hreflang id + en | Both tags present | MUST | E2E |

### 5.15 Analytics (F-15)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-068 | Analytics | Loaded | cta_hero_click | Click hero CTA | track('cta_hero_click') | Spy called | SHOULD | Integration |
| TC-069 | Analytics | Loaded | cta_final_click | Click final CTA | track('cta_final_click') | Spy called | SHOULD | Integration |
| TC-070 | Analytics | FAQ expanded | faq_expand | Click FAQ | track('faq_expand',{faqIndex}) | Spy+index | SHOULD | Integration |
| TC-071 | Analytics | Scroll 75% | scroll_75 | Scroll >=75% | track('scroll_75') | Spy once | SHOULD | Integration |
| TC-072 | Analytics | Loaded | language_toggle | Toggle lang | track('language_toggle',{from,to}) | Spy+pair | SHOULD | Integration |

### 5.16 Responsive (F-16)

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-073 | Responsive | -- | 375px Mobile S | setViewport(375,812) | No h-scroll, CTA accessible | scrollWidth<=vpWidth | MUST | Responsive |
| TC-074 | Responsive | -- | 768px Tablet | setViewport(768,1024) | 2-col layout | 2-col grid | MUST | Responsive |
| TC-075 | Responsive | -- | 1024px Desktop | setViewport(1024,768) | Full layout | Full layout | MUST | Responsive |
| TC-076 | Responsive | -- | 1440px Large | setViewport(1440,900) | max-width 1280px | Content centered | MUST | Responsive |

### 5.17 i18n

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-077 | i18n | ID locale | All ID text | -- | All keys in Indonesian | No EN on /id/ | MUST | Integration |
| TC-078 | i18n | EN locale | All EN text | Toggle EN | All keys in English | No ID on /en/ | MUST | Integration |
| TC-079 | i18n | Mid-page EN | Toggle lang | Scroll down, toggle ID | URL=/id/, scroll preserved | Scroll same | MUST | E2E |
| TC-080 | i18n | EN locale | Keys sync | -- | All id.json keys in en.json | No missing keys | MUST | Unit |

### 5.18 Build Quality

| ID | Modul | Precondition | Langkah | Input | Expected Output | Pass/Fail | Prioritas | Level |
|---|---|---|---|---|---|---|---|---|
| TC-081 | Build | Complete | ESLint | pnpm lint | 0 errors | Exit 0 | MUST | CI gate |
| TC-082 | Build | Complete | Typecheck | pnpm typecheck | 0 errors | Exit 0 | MUST | CI gate |
| TC-083 | Build | Complete | Build | pnpm build | Pass | Exit 0 | MUST | CI gate |

---

## 6. Pengujian Non-Fungsional

### 6.1 Performa

| ID | Kriteria | Target | Measurement | Sumber |
|---|---|---|---|---|
| NFR-T01 | Lighthouse Performance (mobile) | >= 85 | Lighthouse CLI emulated mobile | BRD KPI-08 |
| NFR-T02 | LCP | <= 2.5s | Lighthouse / Web Vitals | BRD KPI-09 |
| NFR-T03 | CLS | <= 0.1 | Lighthouse / Web Vitals | BRD KPI-10 |
| NFR-T04 | TBT | <= 200ms | Lighthouse | PRD NFR-P04 |
| NFR-T05 | FCP | <= 1.8s | Lighthouse | PRD NFR-P07 |
| NFR-T06 | Bundle tambahan (FM + analytics) | <= 50KB gzipped | next build output analysis | PRD NFR-P05 |
| NFR-T07 | TTI | <= 3.5s | Lighthouse | PRD NFR-P06 |

**Cara Ukur:**

```bash
npx lighthouse http://localhost:3000/id --preset=desktop --output=json --output-path=./lighthouse-desktop.json
npx lighthouse http://localhost:3000/id --preset=perf --emulated-form-factor=mobile --output=json --output-path=./lighthouse-mobile.json
```

### 6.2 Keamanan

| ID | Kriteria | Test Method | Sumber |
|---|---|---|---|
| NFR-S01 | No secret client-side | Grep process.env di client components. Cek NEXT_PUBLIC_* hanya non-sensitif | L07 CODING_RULES |
| NFR-S02 | External link rel="noopener" | Playwright: assert rel attribute on all target="_blank" links | SEC-LP-03 |
| NFR-S03 | No dangerouslySetInnerHTML | ESLint rule + grep scan | OWASP |
| NFR-S04 | No PII in analytics | Review analytics event properties — hanya locale + index | BRD NFR-S04 |
| NFR-S05 | HTTPS only | Production URL check | AGENTS.md SEC-09 |
| NFR-S06 | XSS prevention | No user input rendered as HTML. React auto-escape. | OWASP |

### 6.3 Aksesibilitas (WCAG 2.1 AA)

| ID | Kriteria | Target | Measurement | Sumber |
|---|---|---|---|---|
| NFR-A01 | WCAG compliance | 2.1 AA | axe-core Playwright scan | UIUX_SPEC S9 |
| NFR-A02 | axe-core violations | 0 critical | @axe-core/playwright | PRD AC-15 |
| NFR-A03 | Color contrast body text | >= 4.5:1 | axe-core color-contrast | UIUX_SPEC S9.2 |
| NFR-A04 | Color contrast large text | >= 3:1 | axe-core | UIUX_SPEC S9.2 |
| NFR-A05 | Keyboard navigation | All interactive reachable | Manual Playwright Tab test | UIUX_SPEC S9.3 |
| NFR-A06 | Focus ring visible | focus-visible:ring-2 | Visual verification | UIUX_SPEC S9.3 |
| NFR-A07 | Skip link | Skip to content present | DOM inspection | UIUX_SPEC S9.3 |
| NFR-A08 | Screen reader landmarks | header, main, footer, nav | DOM inspection | UIUX_SPEC S9.4 |
| NFR-A09 | ARIA labels | accordion, hamburger, toggle | DOM attribute check | UIUX_SPEC S9.4 |
| NFR-A10 | Heading hierarchy | h1 -> h2 -> h3 | axe-core heading-order | UIUX_SPEC S9.4 |
| NFR-A11 | html lang attribute | lang=id atau lang=en | DOM attribute check | UIUX_SPEC S9.6 |
| NFR-A12 | Touch targets | Min 44x44px | Visual check mobile | UIUX_SPEC S9.6 |
| NFR-A13 | Zoom 200% | Layout tidak pecah | Manual test | UIUX_SPEC S9.6 |

**Cara Ukur a11y:**

```typescript
import AxeBuilder from '@axe-core/playwright';
test('no critical a11y violations', async ({ page }) => {
  await page.goto('/id');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])
    .analyze();
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical).toHaveLength(0);
});
```

### 6.4 Responsive & Visual Regression

| Viewport | Width | Height | Target |
|---|---|---|---|
| Mobile S | 375px | 812px | No h-scroll, CTA thumb-zone, text legible |
| Mobile L | 425px | 812px | Comfortable reading |
| Tablet | 768px | 1024px | 2-column layout |
| Laptop | 1024px | 768px | Full layout |
| Desktop | 1440px | 900px | Max-width constrained |

**Breakpoint Testing (per UIUX_SPEC S4.2):**

| Section | Mobile (<768) | Tablet (768-1023) | Desktop (1024+) |
|---|---|---|---|
| Navbar | Hamburger+logo+CTA | Kompak horizontal | Full horizontal |
| Hero | Stack center, mockup bawah | Stack center | 2 kolom (60/40) |
| SocialProof | Scroll 4 logo | Scroll 6 logo | Horizontal row 6 |
| ProblemSolution | Stack | 2 kolom | 2 kolom |
| HowItWorks | Vertical timeline | 3 kolom stacked | 3 kolom+connector |
| FeaturesBento | 1 kolom | 2 kolom | 3 kolom bento |
| ProductDemo | overflow-x-auto | Full-width | Full-width max-w-5xl |
| Testimonials | 1 kolom carousel | 3 kolom stacked | 3 kolom |
| FAQ | Full width | max-w-3xl | max-w-3xl |
| FinalCTA | Full-width | Full-width | Full-width |
| Footer | 1 kolom stack | 2 kolom | 4 kolom |

### 6.5 Reduced Motion

| ID | Test | Method | Expected |
|---|---|---|---|
| NFR-RM01 | Semua animasi disabled | prefers-reduced-motion: reduce via Playwright | No FM anims, content visible |
| NFR-RM02 | Content tetap visible | Same setup | Semua section content rendered |
| NFR-RM03 | FAQ tetap bisa expand | Same setup | Click FAQ still toggles |

---

## 7. Target Coverage

| Level | Target | Measurement | Cara Ukur |
|---|---|---|---|
| Unit test coverage | >= 80% | @vitest/coverage-v8 | pnpm test --coverage |
| Module wajib 100% | 100% | Manual check | Semua 18 component files punya test |
| E2E critical path | 100% | Playwright pass rate | pnpm test:e2e |
| Lint | 0 error | ESLint | pnpm lint |
| Typecheck | 0 error | TypeScript | pnpm typecheck |

### Modul Wajib 100% Coverage (ada test file)

| # | Module File | Test File | Status |
|---|---|---|---|
| 1 | `navbar.tsx` | `navbar.test.tsx` | WAJIB |
| 2 | `hero.tsx` | `hero.test.tsx` | WAJIB |
| 3 | `social-proof-bar.tsx` | `social-proof-bar.test.tsx` | WAJIB |
| 4 | `problem-solution.tsx` | `problem-solution.test.tsx` | WAJIB |
| 5 | `how-it-works.tsx` | `how-it-works.test.tsx` | WAJIB |
| 6 | `features-bento.tsx` | `features-bento.test.tsx` | WAJIB |
| 7 | `product-demo.tsx` | `product-demo.test.tsx` | WAJIB |
| 8 | `testimonials.tsx` | `testimonials.test.tsx` | WAJIB |
| 9 | `faq.tsx` | `faq.test.tsx` | WAJIB |
| 10 | `final-cta.tsx` | `final-cta.test.tsx` | WAJIB |
| 11 | `footer.tsx` | `footer.test.tsx` | WAJIB |
| 12 | `section-wrapper.tsx` | `section-wrapper.test.tsx` | WAJIB |
| 13 | `animated-counter.tsx` | `animated-counter.test.tsx` | WAJIB |
| 14 | `browser-mockup.tsx` | `browser-mockup.test.tsx` | WAJIB |
| 15 | `feature-card.tsx` | `feature-card.test.tsx` | WAJIB |
| 16 | `testimonial-card.tsx` | `testimonial-card.test.tsx` | WAJIB |
| 17 | `faq-item.tsx` | `faq-item.test.tsx` | WAJIB |
| 18 | `logo-placeholder.tsx` | `logo-placeholder.test.tsx` | WAJIB |

### Cara Ukur Coverage

```bash
pnpm test --coverage --reporter=text
pnpm test:e2e
pnpm lint
pnpm typecheck
npx lighthouse http://localhost:3000/id --preset=perf --emulated-form-factor=mobile
```

---

## 8. Entry & Exit Criteria

### 8.1 Per Level

| Level | Entry Criteria | Exit Criteria |
|---|---|---|
| **Unit** | framer-motion + @vercel/analytics terinstall. Mock utilities siap. i18n fixtures ready. | >= 80% coverage. 0 test failure. Semua 18 component files punya test. |
| **Integration** | Unit tests pass. Mocks for framer-motion + analytics + next-intl siap. | >= 70% coverage. FAQ toggle, navbar scroll, language switch tested. |
| **E2E** | pnpm dev running di localhost. Playwright configured. | 100% critical path pass. All sections visible. CTA navigates correctly. |
| **Visual/Responsive** | Dev server running. Screenshot baseline ready. | Semua 5 viewport tested. No h-scroll. No layout breaks. |
| **A11y** | axe-core installed. Playwright + @axe-core/playwright configured. | 0 critical violation. WCAG 2.1 AA. All landmarks present. |
| **Performa** | Lighthouse CLI installed. Dev server or Vercel preview running. | Performance >= 85. LCP <= 2.5s. CLS <= 0.1. TBT <= 200ms. |
| **Build Quality** | Code linted. No TypeScript errors. | pnpm lint 0. pnpm typecheck 0. pnpm build pass. |

### 8.2 Definition of Done (Landing Page)

- [ ] Semua 11 section components render tanpa error
- [ ] Semua 7 reusable components berfungsi
- [ ] framer-motion berfungsi: fade-in, stagger, hover, counter, gradient
- [ ] prefers-reduced-motion di-respect
- [ ] 60+ i18n keys ID + EN sinkron
- [ ] Language toggle ID -> EN preserve scroll
- [ ] Dark mode default (#0a0a0a bg, primary #a78bfa)
- [ ] Responsive 375/768/1024/1440px tanpa horizontal scroll
- [ ] Navbar sticky: transparent -> solid setelah scroll 50px
- [ ] FAQ accordion: expand/collapse, multi-open, smooth animation
- [ ] 2 CTA: Mulai Gratis -> /register, Masuk -> /login
- [ ] SEO meta: title <= 60 char, description <= 160 char, OG image, hreflang
- [ ] Analytics events wired: cta_hero_click, cta_final_click, faq_expand, scroll_75, language_toggle
- [ ] OG image di public/og/og-image.jpg (1200x630)
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] pnpm test --coverage >= 80%
- [ ] pnpm test:e2e 100% pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] axe-core: 0 critical violation
- [ ] No any type (L06)
- [ ] No hardcoded text (L09)
- [ ] No secret client-side (L07)
- [ ] Conventional commit feat(landing): ...
- [ ] PR reviewed + merged
- [ ] Preview deploy ke Vercel sukses

---

## 9. Strategi Regression, Smoke Test, Test Data Management, Bug Tracking

### 9.1 Regression Strategy

| Strategi | Detail |
|---|---|
| **Full regression** | Jalankan pnpm test --coverage + pnpm test:e2e setiap PR |
| **Smoke test** | E2E critical path: landing render + CTA click + FAQ expand + lang toggle |
| **Visual regression** | Screenshot comparison (Playwright) di 5 viewport |
| **Animation regression** | Reduced motion test + FM mock test di setiap PR |
| **i18n regression** | Key sync check: semua keys di id.json ada di en.json |

### 9.2 Smoke Test Set (Jalankan Sebelum Every PR)

```
1. pnpm build -> pass
2. pnpm lint -> 0 error
3. pnpm typecheck -> 0 error
4. pnpm test -> 0 failure
5. pnpm test:e2e -> landing renders, CTA clicks, FAQ toggles
```

### 9.3 Test Data Management

| Aspek | Strategi |
|---|---|
| i18n messages | Fixture files di `src/__fixtures__/landing.ts`. Mock NextIntlClientProvider. |
| Feature config | Import langsung dari src/lib/landing/ (static, tidak perlu mock). |
| Analytics | Mock @vercel/analytics/react -> spy track() function. |
| Framer Motion | Mock motion.* -> simple div. Mock useReducedMotion() -> configurable. |
| Environment | vitest.config.ts -> env option untuk test env vars. |

### 9.4 Bug Tracking

| Aspek | Tool/Proses |
|---|---|
| Bug report | GitHub Issues dengan label bug, landing, a11y, performance |
| Bug priority | P0 (blocking), P1 (a11y/compliance), P2 (visual), P3 (nice-to-have) |
| Bug template | Steps to reproduce, expected vs actual, screenshot, viewport, browser |
| Bug SLA | P0 fix within 24h. P1 fix before release. P2 best-effort. |

---

## 10. Risiko Pengujian & Mitigasi

| ID | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R-01 | FM inkompatibel React 19 | Animasi tidak jalan | Medium | FM ^11.x kompatibel React 19 (PRD A16). Test di Setup. |
| R-02 | Mock FM terlalu kompleks | Unit test tidak cover actual animasi | Medium | Mock sederhana. E2E cover actual FM. |
| R-03 | Lighthouse score dev vs prod beda | Score tidak akurat | High | Test di Vercel preview (production-like). |
| R-04 | axe-core false positive FM elements | A11y test gagal padahal aman | Low | Review manual. White-list FM false positives. |
| R-05 | i18n keys sync id.json vs en.json | Missing translation | Medium | Automated key sync check di CI. |
| R-06 | Responsive layout pecah viewport | Visual regression | Medium | Screenshot comparison 5 viewport. |
| R-07 | Bundle > 50KB gzipped | Performance regression | Low | Monitor bundle di next build. |
| R-08 | Navbar bg transition tidak smooth | UX regression | Low | Visual test + manual review. |
| R-09 | Demo typing animation janky | UX regression | Low | Integration test timing. |
| R-10 | Placeholder social proof fake | Trust regression | Medium | Label transparansi wajib. |
| R-11 | FAQ accordion janky mobile | UX regression | Medium | Test di 375px. Manual touch review. |
| R-12 | OG image tidak render social media | Sharing regression | Low | Test Facebook/Twitter debugger. |

---

## 11. Checklist Sign-off QA

### 11.1 Functional Sign-off

- [ ] Semua 11 section render tanpa error (ID + EN)
- [ ] Navbar sticky: bg transition setelah scroll
- [ ] Hero: headline, sub, 2 CTA, gradient bg, FM entrance
- [ ] Social Proof: counter animasi, logo row
- [ ] Problem/Solution: 3 pain + 3 solution, icon, stagger
- [ ] How It Works: 3 step, connector, mobile timeline
- [ ] Features Bento: 6 card, bento layout, hover scale
- [ ] Product Demo: browser mockup, typing animation, JSON preview
- [ ] Testimonials: 3 card, placeholder label
- [ ] FAQ: 5-6 accordion, expand/collapse, multi-open, chevron rotate
- [ ] Final CTA: gradient, headline, CTA, disclaimer
- [ ] Footer: 4 col desktop, responsive, social, copyright

### 11.2 Non-Functional Sign-off

- [ ] Dark mode default: #0a0a0a bg, primary #a78bfa
- [ ] Responsive: 375/768/1024/1440px tanpa horizontal scroll
- [ ] prefers-reduced-motion: semua animasi disabled
- [ ] Keyboard nav: semua interactive reachable + focus ring
- [ ] Screen reader: landmarks present, ARIA labels, heading hierarchy
- [ ] SEO: title <= 60, description <= 160, OG image, hreflang
- [ ] Analytics: 5 events wired + no PII
- [ ] Security: no secret client-side, rel="noopener", HTTPS

### 11.3 Quality Gate Sign-off

- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] pnpm test --coverage >= 80%
- [ ] pnpm test:e2e 100% pass
- [ ] Lighthouse Performance mobile >= 85
- [ ] LCP <= 2.5s
- [ ] CLS <= 0.1
- [ ] TBT <= 200ms
- [ ] Bundle tambahan <= 50KB gzipped
- [ ] axe-core: 0 critical violation
- [ ] Conventional commit format
- [ ] PR reviewed + approved
- [ ] No direct push main
- [ ] Preview deploy sukses
- [ ] OG image present (1200x630)

### 11.4 Sign-off Approval

| Role | Name | Date | Status |
|---|---|---|---|
| QA Lead | | | [ ] PASS / [ ] FAIL |
| Dev Lead | | | [ ] PASS / [ ] FAIL |
| Product Owner | | | [ ] PASS / [ ] FAIL |

---

> **Dokumen ini = rencana pengujian landing page PromptFlow. Eksekutor jalankan test case sesuai prioritas: MUST dulu, SHOULD berikutnya. Gunakan test fixture + mock yang sudah didefinisikan di section 3.4. Laporkan hasil ke orchestrator.**

**Dibuat oleh:** docgen-test-plan subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0 (Landing Page Focus)
