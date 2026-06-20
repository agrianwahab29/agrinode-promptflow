# CODING_RULES.md — PromptFlow Landing Page Redesign

> **Versi:** 1.0
> **Tanggal:** 2026-06-20
> **Deliverable:** Landing page `src/app/[locale]/page.tsx` — redesign total
> **Selaras:** SRS.md, AGENTS.md, UIUX_SPEC.md, RAG-CONTEXT.md

---

## 1. Ringkasan & Tech Stack

| Aspek | Nilai |
|---|---|
| Project | PromptFlow — Workflow engine otomasi prompt animasi AI |
| Deliverable | Landing page redesign (11 section + 7 reusable components) |
| Bahasa | TypeScript 5.7+ (strict mode) |
| Framework | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Animation | Framer Motion ^11.x (NEW) |
| i18n | next-intl ^3.26.0 (dwibahasa ID/EN) |
| Icons | lucide-react |
| Analytics | @vercel/analytics (NEW) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Linting | ESLint 9 (next config) + Prettier |
| Package Manager | pnpm 11.7.0 |
| DB (V2 app) | Turso (libSQL) + Drizzle ORM |

**ASUMSI:** Landing page = frontend only. Tidak ada backend endpoint baru. Semua data statis dari i18n + hardcoded config. (`SRS.md §5.5`)

---

## 2. Konvensi Penamaan

### 2.1 File & Folder

| Aspek | Aturan | Contoh |
|---|---|---|
| Component file | `kebab-case.tsx` | `social-proof-bar.tsx` |
| Page file | `page.tsx` (Next.js convention) | `[locale]/page.tsx` |
| Layout file | `layout.tsx` | `[locale]/layout.tsx` |
| Loading file | `loading.tsx` | `generate/loading.tsx` |
| Lib/config file | `kebab-case.ts` | `sections.ts`, `events.ts` |
| Test file | `*.test.ts` / `*.test.tsx` (co-located) | `navbar.test.tsx` |
| CSS file | Tailwind v4 di `globals.css` — tidak CSS modules | `globals.css` |
| i18n message | `messages/{locale}.json` | `messages/id.json`, `messages/en.json` |
| Landing components | `src/components/landing/` | `src/components/landing/hero.tsx` |
| Landing lib | `src/lib/landing/` | `src/lib/landing/sections.ts` |
| Analytics | `src/lib/analytics/` | `src/lib/analytics/events.ts` |
| Static assets | `public/og/` untuk OG image | `public/og/og-image.jpg` |

### 2.2 Component Naming

| Aspek | Aturan | Contoh |
|---|---|---|
| Component file | `kebab-case.tsx` — nama deskriptif | `social-proof-bar.tsx` |
| Component export | `PascalCase` — named export | `export function SocialProofBar()` |
| Reusable utility | `kebab-case.ts` | `features.ts` |
| Utility export | `camelCase` atau `PascalCase` | `export const FEATURES` / `export function buildSections()` |

### 2.3 Variable & Function

| Aspek | Aturan | Contoh |
|---|---|---|
| Variables | `camelCase` | `userCount`, `heroTitle` |
| Constants | `UPPER_SNAKE_CASE` | `SECTIONS`, `FEATURES`, `ANIMATION_VARIANTS` |
| Functions | `camelCase`, verb-first | `buildSections()`, `trackEvent()` |
| Props | `camelCase`, specific names | `title`, `iconName`, `colSpan` |
| Boolean props | `is`/`has` prefix | `isExpanded`, `hasGradient` |

### 2.4 CSS & Tailwind Classes

| Aspek | Aturan | Contoh |
|---|---|---|
| Utility classes | Tailwind v4 utilities | `bg-background text-foreground` |
| Design tokens | Reference CSS variables | `text-primary`, `bg-background` |
| Custom classes | Avoid — prefer utility composition | `className="flex flex-col gap-6"` |
| Responsive | Mobile-first breakpoint order | `text-base md:text-lg lg:text-xl` |
| Animation variants | Framer Motion `variants` objects | `const fadeUpVariants = {}` |

### 2.5 i18n Keys

| Aspek | Aturan | Contoh |
|---|---|---|
| Namespace | `landing.*` (satu namespace) | `landing.heroTitle` |
| Nested objects | Use dot notation | `landing.faq.q1.question` |
| Key naming | camelCase, descriptive | `landing.features.f1Title` |
| Key pattern | `{section}.{element}{Property}` | `landing.testimonials.t1Quote` |
| Sync ID/EN | Keys HARUS identik di kedua file | `id.json` dan `en.json` |

---

## 3. Struktur & Gaya Kode

### 3.1 Component Pattern

```typescript
// DO — Server Component default, named export, minimal imports
import { getTranslations } from 'next-intl/server';
import { SectionWrapper } from './section-wrapper';

export async function Hero() {
  const t = await getTranslations('landing');

  return (
    <section id="hero" className="py-16 md:py-24">
      <h1>{t('heroTitle')}</h1>
    </section>
  );
}
```

```typescript
// DO — Client Component, explicit 'use client', minimal scope
'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface HeroProps {
  title: string;
  subtitle: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  const t = useTranslations('landing');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1>{title}</h1>
    </motion.div>
  );
}
```

```typescript
// JANGAN — campur Client + Server logic di satu component
// JANGAN — default export untuk component
// JANGAN — hardcode teks UI (pakai i18n key)
```

### 3.2 File Organization (Satu Component per File)

```
src/components/landing/
  navbar.tsx
  hero.tsx
  social-proof-bar.tsx
  problem-solution.tsx
  how-it-works.tsx
  features-bento.tsx
  product-demo.tsx
  testimonials.tsx
  faq.tsx
  final-cta.tsx
  footer.tsx
  section-wrapper.tsx
  animated-counter.tsx
  browser-mockup.tsx
  feature-card.tsx
  testimonial-card.tsx
  faq-item.tsx
  logo-placeholder.tsx
```

### 3.3 Interface/Props Pattern

```typescript
// DO — Interface di atas component, exported untuk reuse
export interface FeatureCardProps {
  key: string;
  title: string;
  description: string;
  iconName: string;
  colSpan?: number;
}

export function FeatureCard({ title, description, iconName, colSpan = 1 }: FeatureCardProps) {
  // ...
}
```

```typescript
// JANGAN — Inline anonymous props type
// JANGAN — pakai `any` untuk props (L06)
```

### 3.4 Data Config Pattern (Static Data)

```typescript
// DO — Data statis di lib/landing/, typed
// src/lib/landing/features.ts
export const FEATURES = [
  { key: 'f1', icon: 'Sparkles', colSpan: 1 },
  { key: 'f2', icon: 'Brain', colSpan: 2 },
  { key: 'f3', icon: 'Layers', colSpan: 1 },
  { key: 'f4', icon: 'Download', colSpan: 1 },
  { key: 'f5', icon: 'Activity', colSpan: 1 },
  { key: 'f6', icon: 'Upload', colSpan: 1 },
] as const;
```

---

## 4. TypeScript Rules

### 4.1 Strict Mode

- `tsconfig.json`: `"strict": true` — wajib.
- **Tidak boleh `any`** tanpa `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + alasan tertulis.
- Ganti `any` → `unknown` + Zod narrow / type guard.

```typescript
// DO — Type-safe
function parseInput(data: unknown): string {
  return z.string().parse(data);
}

// JANGAN
function parseInput(data: any): string {
  return data.toString(); // runtime crash risk
}
```

### 4.2 Interface & Type

| Aturan | Detail |
|---|---|
| Prefer `interface` untuk props | `export interface HeroProps {}` |
| `type` untuk union/intersection | `type AnimationDirection = 'up' \| 'down'` |
| Named exports untuk semua type | Tidak ada anonymous type export |
| `as const` untuk static config | `export const FEATURES = [...] as const` |

### 4.3 Nullability

```typescript
// DO — Explicit null check sebelum access
const value = optionalField ?? 'default';

// DO — Optional chaining
const name = user?.profile?.name ?? 'Unknown';

// JANGAN — Non-null assertion tanpa check
const name = user!.profile!.name; // crash jika null
```

### 4.4 Import Order

```typescript
// 1. React / Next.js
import { useTranslations } from 'next-intl';
import { useInView } from 'framer-motion';

// 2. Project config
import { FEATURES } from '@/lib/landing/features';

// 3. Components
import { FeatureCard } from './feature-card';
import { SectionWrapper } from './section-wrapper';

// 4. Types
import type { FeatureCardProps } from './feature-card';
```

---

## 5. React / Next.js Rules

### 5.1 Server Component vs Client Component

| Default | Kapan Client Component |
|---|---|
| Server Component = default | Butuh interaksi (form, button onClick, toggle) |
| Tidak perlu `'use client'` | Butuh `useState`, `useEffect`, `useInView`, `useScroll` |
| Gunakan `getTranslations()` | Butuh Framer Motion `motion.*` |
| Import di parent | Browser-only API |

```typescript
// DO — Server Component (page.tsx)
import { getTranslations } from 'next-intl/server';
import { Hero } from '@/components/landing/hero';
import { Navbar } from '@/components/landing/navbar';

export default async function LandingPage() {
  const t = await getTranslations('landing');
  return (
    <main>
      <Navbar />
      <Hero title={t('heroTitle')} subtitle={t('heroSubtitle')} />
    </main>
  );
}
```

```typescript
// DO — Client Component (navbar.tsx) minimal scope
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations('landing');

  return <nav>/* ... */</nav>;
}
```

### 5.2 App Router Conventions

| Aturan | Detail |
|---|---|
| `page.tsx` = route component | `[locale]/page.tsx` = root landing |
| `layout.tsx` = shared layout | Root layout + i18n provider |
| `loading.tsx` = Suspense fallback | Skeleton saat loading |
| `error.tsx` = Error Boundary | Error message + retry |
| Dynamic routes | `[locale]`, `[id]` — bracket notation |

### 5.3 Metadata & SEO

```typescript
// DO — Metadata di layout.tsx
// src/app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PromptFlow — Workflow Otomasi Prompt Animasi AI',
  description: 'Satu judul → paket prompt animasi siap pakai. Karakter konsisten lintas adegan.',
  openGraph: {
    title: 'PromptFlow',
    description: 'Workflow otomasi prompt animasi AI',
    images: ['/og/og-image.jpg'],
  },
};
```

### 5.4 Link & Navigation

```typescript
// DO — Internal link via next-intl Link
import Link from 'next-intl/link';

<Link href="/register">{t('cta')}</Link>

// DO — External link via plain anchor
<a href="https://github.com/agrianwahab29/promptflow.git" target="_blank" rel="noopener noreferrer">
  GitHub
</a>

// JANGAN — anchor untuk internal routes
// JANGAN — hardcode href (pakai i18n-aware routing)
```

---

## 6. Tailwind CSS Rules

### 6.1 Design Tokens (WAJIB Pakai)

| Token | Nilai | Kegunaan |
|---|---|---|
| `--primary` | `#7c3aed` (light) / `#a78bfa` (dark) | CTA, brand accent |
| `--background` | `#ffffff` (light) / `#0a0a0a` (dark) | Body bg |
| `--foreground` | `#0a0a0a` (light) / `#fafafa` (dark) | Body text |
| `--accent` | `#ede9fe` (light) / `#3b0764` (dark) | Highlight, hover |
| `--muted-foreground` | `#71717a` | Helper text |
| `--border` | `#e4e4e7` | Border, divider |
| `--radius` | `6px` | Default radius |

**Larangan:** Tidak boleh hardcode hex/warna. Selalu pakai Tailwind token class.

```css
/* DO — Pakai design tokens */
className="bg-primary text-primary-foreground"
className="bg-background text-foreground"
className="border border-border"

/* JANGAN — Hardcode warna */
className="bg-[#7c3aed]"
className="text-[#0a0a0a]"
```

### 6.2 Responsive Breakpoints

```typescript
// DO — Mobile-first, breakpoint order: sm → md → lg → xl
className="text-base md:text-lg lg:text-xl"

// DO — Padding responsive
className="px-4 py-12 md:px-8 md:py-16 lg:px-16 lg:py-24"
```

### 6.3 Typography Scale

| Level | Tailwind | Penggunaan |
|---|---|---|
| Display | `text-5xl md:text-6xl font-extrabold` | Hero headline |
| H1 | `text-3xl md:text-4xl font-bold` | Section title |
| H2 | `text-2xl md:text-3xl font-semibold` | Subsection |
| Body | `text-base md:text-lg` | Paragraph |
| Small | `text-sm` | Helper text, labels |

### 6.4 Spacing Scale

```typescript
// DO — Gunakan spacing konsisten dari UIUX_SPEC
// Section padding: py-16 md:py-24 (64px / 96px)
// Gap between sections: space-y-16 md:space-y-24
// Card gap: gap-6 md:gap-8
// Inner padding: p-6 md:p-8
```

### 6.5 Dark Mode

- Dark mode = default (class "dark" di html root).
- Token CSS di `globals.css` sudah handle light/dark.
- Tidak perlu conditional dark/light logic — biarkan CSS variables handle.

---

## 7. Framer Motion Rules

### 7.1 Animation Variants (Centralized)

```typescript
// DO — Animasi variants di constants, reusable
// src/lib/landing/animations.ts
export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const;

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};
```

### 7.2 Reusable SectionWrapper

```typescript
// DO — Gunakan SectionWrapper untuk semua section
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { FADE_UP_VARIANTS } from '@/lib/landing/animations';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
}

export function SectionWrapper({ children, className }: SectionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={FADE_UP_VARIANTS}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### 7.3 Performance Rules

| Aturan | Detail |
|---|---|
| GPU properties only | `transform`, `opacity` — TIDAK `width`, `height`, `top`, `left` |
| Respect `prefers-reduced-motion` | `useReducedMotion()` — disable animasi bila OS set |
| `viewport={{ once: true }}` | Animasi trigger sekali saja (performa) |
| `viewport={{ amount: 0.3 }}` | Trigger saat 30% visible (bukan 0%) |
| No layout shift | Animasi TIDAK boleh cause CLS > 0.1 |
| Lazy load below-fold | Intersection trigger, bukan load awal |

```typescript
// DO — useReducedMotion check
const shouldReduceMotion = useReducedMotion();

<motion.div
  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
>

// JANGAN — Animasi tanpa reduced motion check
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

### 7.4 Hover & Interaction

```typescript
// DO — Hover scale konsisten
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
>

// JANGAN — Hover scale tanpa transition
// JANGAN — Scale > 1.05 (berlebihan)
```

### 7.5 Gradient Animation (CSS)

```css
/* DO — Gradient shift via CSS keyframes */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-gradient {
  background: linear-gradient(135deg, var(--primary), var(--accent), var(--primary));
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}
```

---

## 8. i18n Rules (next-intl)

### 8.1 Key Structure

```json
// messages/id.json — namespace "landing"
{
  "landing": {
    "nav": {
      "features": "Fitur",
      "howItWorks": "Cara Kerja",
      "faq": "FAQ",
      "cta": "Mulai Gratis"
    },
    "heroTitle": "Satu judul → paket prompt animasi siap pakai",
    "heroSubtitle": "Karakter konsisten lintas adegan. Multi-provider LLM. Export JSON / Markdown.",
    "heroCtaPrimary": "Mulai Gratis",
    "heroCtaSecondary": "Masuk"
  }
}
```

### 8.2 Aturan

| Aturan | Detail |
|---|---|
| Namespace | Semua key di bawah `"landing.*"` |
| Tidak hardcoded | Semua teks UI via `t('key')` — TIDAK boleh string literal |
| ID/EN sinkron | Keys di `id.json` DAN `en.json` HARUS identik |
| Contextual translate | Terjemahkan makna, bukan literal. CTA kontekstual per bahasa |
| Fallback | next-intl default ke `id.json` bila key tidak ada |
| Placeholder | `"Dalam pengembangan"` / `"Coming soon"` untuk data placeholder |

### 8.3 Server vs Client Translation

```typescript
// DO — Server Component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('landing');
return <h1>{t('heroTitle')}</h1>;

// DO — Client Component
'use client';
import { useTranslations } from 'next-intl';
const t = useTranslations('landing');
return <h1>{t('heroTitle')}</h1>;
```

### 8.4 Language Toggle

```typescript
// DO — Preserve scroll position saat toggle bahasa
'use client';
import { useLocale, usePathname, useRouter } from 'next-intl';

export function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggle = () => {
    const next = locale === 'id' ? 'en' : 'id';
    router.replace(pathname, { locale: next, scroll: false });
  };

  return <button onClick={toggle}>{locale === 'id' ? 'EN' : 'ID'}</button>;
}
```

---

## 9. Linting & Formatting

### 9.1 Tools

| Tool | Config | Fungsi |
|---|---|---|
| ESLint | `eslint.config.mjs` (ESLint 9 flat config) | Linting TypeScript + React rules |
| Prettier | `.prettierrc` | Formatting otomatis |
| `prettier-plugin-tailwindcss` | Prettier plugin | Sort Tailwind classes |
| TypeScript | `tsconfig.json` (strict: true) | Type checking |

### 9.2 Commands

```bash
pnpm lint              # ESLint check
pnpm lint --fix        # ESLint auto-fix
pnpm typecheck         # tsc --noEmit
pnpm format            # Prettier format
```

### 9.3 Pre-commit Checklist

| # | Check | Command |
|---|---|---|
| 1 | No `any` type | `grep -r "any" src/` — manual review |
| 2 | No hardcoded text | Cek string literal di component |
| 3 | No secret in client | Cek `NEXT_PUBLIC_*` vars |
| 4 | TypeScript strict | `pnpm typecheck` 0 error |
| 5 | ESLint | `pnpm lint` 0 error |
| 6 | Build | `pnpm build` pass |

### 9.4 Tailwind Class Sorting

- Prettier with `prettier-plugin-tailwindcss` auto-sorts classes.
- Urutan preferensi: layout (flex, grid) → spacing (p, m, gap) → typography (text, font) → visual (bg, border) → responsive (md:, lg:)

---

## 10. Error Handling

### 10.1 Client-Side Error Handling

```typescript
// DO — Error Boundary per page group
// src/app/[locale]/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Terjadi kesalahan</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={reset}>Coba lagi</button>
    </div>
  );
}
```

### 10.2 Loading States

```typescript
// DO — loading.tsx per page group
// src/app/[locale]/generate/loading.tsx
export default function GenerateLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
```

### 10.3 Analytics Error Handling

```typescript
// DO — Track event tidak boleh crash page
import { track } from '@vercel/analytics/react';

function trackSafeEvent(name: string, props?: Record<string, string>) {
  try {
    track(name, props);
  } catch {
    // Analytics failure silent — tidak crash page
  }
}
```

### 10.4 Fallback Content

```typescript
// DO — Image/icon fallback
import { Sparkles } from 'lucide-react';

function FeatureIcon({ iconName }: { iconName: string }) {
  const iconMap: Record<string, React.ComponentType<LucideProps>> = {
    Sparkles,
    Brain,
    Layers,
  };
  const Icon = iconMap[iconName] ?? Sparkles;
  return <Icon className="h-6 w-6" />;
}
```

---

## 11. Logging

### 11.1 Logging Pattern

```typescript
// DO — Structured logging untuk development
console.error('[landing] Failed to load:', error.message);
console.warn('[landing] Fallback to default locale');

// JANGAN — Sensitive data di log
console.log('User token:', token); // L16 violation
```

### 11.2 No Sensitive Data

| Tidak Boleh Log | Boleh Log |
|---|---|
| API keys | Page load errors |
| Tokens | Component render failures |
| User PII | Analytics event names |
| Session data | Locale changes |

---

## 12. Security Rules (Landing Page Specific)

| ID | Aturan | Detail |
|---|---|---|
| SEC-LP-01 | Tidak hardcoded secret | Tidak ada `ENCRYPTION_KEY`, `NEXTAUTH_SECRET` di client code |
| SEC-LP-02 | Tidak ada API key exposure | Tidak ada `NEXT_PUBLIC_*` untuk sensitive data |
| SEC-LP-03 | External link security | `target="_blank"` + `rel="noopener noreferrer"` |
| SEC-LP-04 | Input validation (form) | Zod validation untuk form input di /register (existing) |
| SEC-LP-05 | CSRF | Next.js built-in + NextAuth |
| SEC-LP-06 | XSS prevention | React auto-escapes. Tidak `dangerouslySetInnerHTML` |
| SEC-LP-07 | Analytics no PII | Tidak track email, name, atau data personal |
| SEC-LP-08 | HTTPS | Vercel default. Tidak HTTP redirect bila produksi |

---

## 13. Testing Rules

### 13.1 Coverage Targets

| Level | Target | Tool |
|---|---|---|
| Unit (component) | >= 80% | Vitest |
| E2E (critical path) | 100% | Playwright |
| Lint | 0 error | ESLint |
| Type check | 0 error | TypeScript |
| A11y | 0 critical violation | axe-core |
| Performance | Lighthouse >= 85 mobile | Lighthouse CI |

### 13.2 Test Structure

```typescript
// DO — Co-located test, describe/it structure
// src/components/landing/hero.test.tsx
import { render, screen } from '@testing-library/react';
import { Hero } from './hero';

describe('Hero', () => {
  it('renders headline', () => {
    render(<Hero title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Title');
  });

  it('renders both CTA buttons', () => {
    render(<Hero title="Test" subtitle="Test" />);
    expect(screen.getByRole('link', { name: /mulai gratis/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /masuk/i })).toBeInTheDocument();
  });
});
```

### 13.3 E2E Critical Path

```typescript
// DO — Playwright E2E test
// e2e/landing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders all sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.locator('#features')).toBeVisible();
    await expect(page.locator('#how-it-works')).toBeVisible();
    await expect(page.locator('#faq')).toBeVisible();
  });

  test('CTA navigates to register', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Mulai Gratis');
    await expect(page).toHaveURL('/register');
  });

  test('FAQ accordion expands', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="faq-item-0"]');
    await expect(page.locator('[data-testid="faq-answer-0"]')).toBeVisible();
  });
});
```

### 13.4 Animation Testing

```typescript
// DO — Test reduced motion behavior
it('disables animation when reduced motion is preferred', () => {
  vi.mock('framer-motion', () => ({
    useReducedMotion: () => true,
  }));

  render(<SectionWrapper><div>Content</div></SectionWrapper>);
  const wrapper = screen.getByTestId('section-wrapper');
  expect(wrapper).toHaveAttribute('data-reduced-motion', 'true');
});
```

---

## 14. Git Workflow & Commit Conventions

### 14.1 Branch Naming

| Type | Pattern | Contoh |
|---|---|---|
| Feature | `feat/<scope>` | `feat/landing-redesign` |
| Fix | `fix/<scope>` | `fix/faq-accordion-a11y` |
| Chore | `chore/<scope>` | `chore/install-framer-motion` |
| Docs | `docs/<scope>` | `docs/update-landing-readme` |

### 14.2 Commit Messages (Conventional)

```
feat(landing): add hero section with Framer Motion entrance animation

- Add hero.tsx with headline, subheadline, 2 CTAs, gradient bg
- Add animated gradient CSS keyframes
- Expand i18n keys: landing.heroTitle, heroSubtitle, heroCtaPrimary, heroCtaSecondary
- Tested: desktop + mobile responsive, reduced-motion respected

Refs: SRS.md F-02, PRD AC-02
```

### 14.3 Commit Rules

| Aturan | Detail |
|---|---|
| Atomic | 1 commit = 1 logical change |
| Conventional | `feat(scope): description`, `fix(scope): description` |
| No direct push `main` | Lewat PR + review minimum 1 |
| No secret commit | `.env.local` di `.gitignore` |
| Message format | `<type>(<scope>): <subject>` + optional body |

### 14.4 PR Template

```markdown
## Description
[What this PR does]

## Related Issues
- Refs: [SRS section], [PRD section]

## Type of Change
- [ ] New component
- [ ] Bug fix
- [ ] i18n key addition
- [ ] Animation improvement
- [ ] Documentation

## Testing
- [ ] pnpm lint 0 error
- [ ] pnpm typecheck 0 error
- [ ] pnpm build pass
- [ ] Responsive tested (375/768/1024/1440px)
- [ ] Reduced-motion tested

## Screenshots (if applicable)
[Desktop] [Mobile]
```

---

## 15. Review Checklist (Definition of Done)

### Per Component

| # | Check | Status |
|---|---|---|
| 1 | `'use client'` hanya bila butuh interaksi/Framer Motion | |
| 2 | Semua teks via i18n key (tidak hardcoded string) | |
| 3 | Design tokens dari globals.css (tidak hardcode hex) | |
| 4 | Responsive (mobile-first: 375 → 768 → 1024 → 1440) | |
| 5 | Dark mode token konsisten | |
| 6 | `prefers-reduced-motion` di-respect | |
| 7 | Focus visible ring untuk interactive elements | |
| 8 | Keyboard navigable | |
| 9 | ARIA labels (accordion, hamburger, toggle) | |
| 10 | No `any` type | |
| 11 | Interface typed untuk semua props | |
| 12 | Import order (React → Config → Components → Types) | |
| 13 | Named export (bukan default) | |
| 14 | No console.log tertinggal | |
| 15 | No unused import | |

### Per PR

| # | Check | Status |
|---|---|---|
| 1 | `pnpm lint` 0 error | |
| 2 | `pnpm typecheck` 0 error | |
| 3 | `pnpm build` pass | |
| 4 | Lighthouse Performance mobile >= 85 | |
| 5 | axe-core 0 critical violation | |
| 6 | Tested 375/768/1024/1440px | |
| 7 | Conventional commit `feat(landing): ...` | |
| 8 | No direct push `main` — via PR | |
| 9 | i18n keys ID+EN sinkron | |
| 10 | SectionWrapper digunakan untuk fade-in | |

---

## 16. Larangan Umum

| ID | Larangan | Penjelasan |
|---|---|---|
| L-LP-01 | Jangan pakai `any` | TypeScript strict mode |
| L-LP-02 | Jangan hardcoded teks UI | Semua via i18n key `landing.*` |
| L-LP-03 | Jangan hardcoded warna/hex | Gunakan Tailwind design tokens |
| L-LP-04 | Jangan campur Server + Client di file sama | Pilih salah satu per component |
| L-LP-05 | Jangan pakai `dangerouslySetInnerHTML` | React auto-escapes |
| L-LP-06 | Jangan log sensitive data | API keys, tokens, PII |
| L-LP-07 | Jangan push ke `main` langsung | Via PR + review |
| L-LP-08 | Jangan commit `.env.local` | `.gitignore` sudah handle |
| L-LP-09 | Jangan pakai `width`, `height`, `top` di Framer Motion | GPU-only: `transform`, `opacity` |
| L-LP-10 | Jangan skip `prefers-reduced-motion` | `useReducedMotion()` wajib |
| L-LP-11 | Jangan pakai GSAP / heavy lib | Framer Motion sudah cukup |
| L-LP-12 | Jangan hardcode `href` internal | Routing via next-intl |
| L-LP-13 | Jangan pakai `window` / `document` di Server Component | Browser API hanya di Client Component |
| L-LP-14 | Jangan lupa `rel="noopener noreferrer"` | Untuk `target="_blank"` |
| L-LP-15 | Jangan animasi tanpa `viewport={{ once: true }}` | Performa |
| L-LP-16 | Jangan inline object/array di props re-render | Extract ke constants / useMemo |
| L-LP-17 | Jangan pakai `React.FC` | Gunakan function declaration |
| L-LP-18 | Jangan Magic number | Extract ke constants |
| L-LP-19 | Jangan nesting > 3 level | Extract ke child component |
| L-LP-20 | Jangan default export component | Named export saja |

---

## 17. Frontend Standar (Landing Page Specific)

### 17.1 Section Order (Dari page.tsx)

```typescript
// DO — Urutan section di [locale]/page.tsx
export default async function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <SocialProofBar />
      <ProblemSolution />
      <HowItWorks />
      <FeaturesBento />
      <ProductDemo />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
```

### 17.2 Component Responsibilities

| Component | File | Tipe | Fungsi Utama |
|---|---|---|---|
| Navbar | `navbar.tsx` | Client | Sticky, scroll detection, nav links, lang toggle, CTA |
| Hero | `hero.tsx` | Client | Headline, sub, 2 CTA, gradient bg, FM entrance |
| SocialProofBar | `social-proof-bar.tsx` | Client | Logo row, counter animation |
| ProblemSolution | `problem-solution.tsx` | Client | 2 kolom, stagger fade-in |
| HowItWorks | `how-it-works.tsx` | Client | 3 step, connector, mobile timeline |
| FeaturesBento | `features-bento.tsx` | Client | Bento grid, hover scale |
| ProductDemo | `product-demo.tsx` | Client | Browser mockup, typing effect |
| Testimonials | `testimonials.tsx` | Client | 3 card, stagger |
| FAQ | `faq.tsx` | Client | Accordion, multi-open |
| FinalCTA | `final-cta.tsx` | Client | Gradient, headline, CTA |
| Footer | `footer.tsx` | Server | 4 kolom, static |
| SectionWrapper | `section-wrapper.tsx` | Client | Reusable FM wrapper |
| AnimatedCounter | `animated-counter.tsx` | Client | useMotionValue counter |
| BrowserMockup | `browser-mockup.tsx` | Client | Chrome frame |
| FeatureCard | `feature-card.tsx` | Client | 1 card hover |
| TestimonialCard | `testimonial-card.tsx` | Client | 1 card |
| FaqItem | `faq-item.tsx` | Client | 1 accordion item |
| LogoPlaceholder | `logo-placeholder.tsx` | Server | Text-based logo |

### 17.3 A11y Requirements (WCAG 2.1 AA)

| Requirement | Implementasi |
|---|---|
| Focus ring visible | `focus-visible:ring-2 focus-visible:ring-primary` |
| Keyboard navigation | Semua interactive reachable via Tab |
| ARIA labels | `aria-label` untuk hamburger, toggle, accordion |
| Screen reader | Landmark regions: `<nav>`, `<main>`, `<footer>` |
| Alt text | Semua image punya `alt` atau `aria-hidden="true"` |
| Color contrast | >= 4.5:1 body text, >= 3:1 large text |
| Heading hierarchy | h1 → h2 → h3 (tidak skip level) |

### 17.4 Performance Targets

| Metric | Target | Sumber |
|---|---|---|
| Lighthouse Performance (mobile) | >= 85 | BRD KPI-08 |
| LCP | <= 2.5s | BRD KPI-09 |
| CLS | <= 0.1 | BRD KPI-10 |
| TBT | <= 200ms | PRD NFR-P04 |
| FCP | <= 1.8s | PRD NFR-P07 |
| Bundle tambahan | <= 50KB gzipped | PRD NFR-P05 |

---

> **Dokumen ini = aturan koding wajib untuk landing page PromptFlow. Eksekutor baca ini + SRS.md + AGENTS.md sebelum coding. Semua check wajib dilakukan sebelum PR dianggap selesai.**

**Dibuat oleh:** docgen-coding-rules subagent
**Tanggal:** 2026-06-20
**Versi:** 1.0 (Landing Page Focus)
