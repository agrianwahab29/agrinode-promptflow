# UIUX_SPEC.md - PromptFlow UI/UX Specification

> Disusun oleh docgen-uiux. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `PRD.md` + `SRS.md` + `PROJECT_ARCHITECTURE.md` + verifikasi langsung `src/app/globals.css`, `src/components/**`, `components.json`.
> Klaim faktual bertumpu pada RAG + bukti file. Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis apa adanya.
> Fokus: design system (tokens Tailwind 4 + shadcn/ui), komponen UI + state, layout/grid, user flow, wireframe deskriptif, navigasi/IA, aksesibilitas WCAG 2.1 AA, responsif, i18n, UX khusus bug-fix generate (log-viewer observability).

---

## 1. Ringkasan Prinsip Desain + Tujuan UX + Brand Voice

### 1.1 Prinsip desain
PromptFlow = pipeline generasi prompt animasi AI **reliable & observable**. UI wajib menyampaikan tiga hal simultan: **status pipeline real-time**, **hasil tervalidasi**, dan **alasan kegagalan yang actionable**. Bukan tool "coba sampai jalan" (`PRD S1.2`).

| Prinsip | Implementasi konkrit |
|---|---|
| Observable by default | SSE streaming + `log-viewer` auto-open saat streaming (`log-viewer.tsx:44-46`); stage labels eksplisit (`generate-form.tsx:31-41`) |
| Failure harus debuggable | Error dikategorisasi (TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE/UNKNOWN, `llm-client.ts:18-44`); UI tampilkan kategori + path field gagal, bukan generic "PROVIDER_ERROR" |
| Konsisten lintas locale | next-intl id/en, semua label via `messages/{id,en}.json` (`RAG S3.5`) |
| Aksesibilitas baseline | shadcn/ui radix primitives + focus-visible ring (`globals.css:42-45`) + WCAG 2.1 AA kontras |
| Dark/light/system | next-themes, token CSS variable light & dark (`globals.css:5-72`) |
| Mobile-first | Tailwind 4 utility, breakpoint sm/md/lg/xl; generate flow usable di mobile (lihat S8) |

### 1.2 Tujuan UX (selaras persona PRD S2.1)
- **P1 Rina (Shorts Creator)**: time-to-first-success <90s, output valid siap pakai, export cepat.
- **P2 Bayu (Tutorial Educator)**: output 8-15 scene tervalidasi tanpa JSON parse fail; log-viewer tunjukkan kenapa gagal saat truncate.
- **P3 Studio (Agency)**: konsistensi karakter via consistency-checker warning UI; audit log generate; API key masked.
- **P4 Dev (Local LLM)**: provider CRUD + test endpoint + diagnose + generation log dengan retryCount.
- **P5 Dina (Storyteller)**: kids preset + moral_message + audio sfx tanpa silent reject.

### 1.3 Brand voice
- **Tone**: teknis-precise tapi tidak dingin. Pesan error = diagnosis, bukan permintaan maaf. Contoh: "Validasi gagal di field scenes.2.audio_specs.2.sfx_list. Expected string, received array." (`PRD AC-GEN-05`).
- **Bahasa UI**: id (default) + en. Istilah teknis (provider, scene, image prompt, audio spec, SSE, retry) tidak diterjemahkan.
- **Label konsisten**: gunakan glossary di S12.

---

## 2. Design Tokens (KONKRET - dari `src/app/globals.css`)

### 2.1 Warna - light mode (`globals.css:5-32`)

| Token | HEX | RGB | HSL | Penggunaan |
|---|---|---|---|---|
| `--color-background` | `#ffffff` | 255,255,255 | 0,0%,100% | Page bg |
| `--color-foreground` | `#0a0a0a` | 10,10,10 | 0,0%,4% | Body text |
| `--color-card` | `#ffffff` | 255,255,255 | 0,0%,100% | Card bg |
| `--color-card-foreground` | `#0a0a0a` | 10,10,10 | 0,0%,4% | Card text |
| `--color-popover` | `#ffffff` | 255,255,255 | 0,0%,100% | Dialog/dropdown bg |
| `--color-popover-foreground` | `#0a0a0a` | 10,10,10 | 0,0%,4% | Popover text |
| `--color-primary` | `#7c3aed` | 124,58,237 | 262,83%,58% | CTA utama (violet) |
| `--color-primary-foreground` | `#ffffff` | 255,255,255 | 0,0%,100% | Text di atas primary |
| `--color-secondary` | `#f4f4f5` | 244,244,245 | 240,5%,96% | Secondary surface |
| `--color-secondary-foreground` | `#18181b` | 24,24,27 | 240,10%,10% | Text di secondary |
| `--color-muted` | `#f4f4f5` | 244,244,245 | 240,5%,96% | Muted bg (log row alt) |
| `--color-muted-foreground` | `#71717a` | 113,113,122 | 240,4%,46% | Helper text, timestamp |
| `--color-accent` | `#ede9fe` | 237,233,254 | 270,90%,96% | Highlight, active tab |
| `--color-accent-foreground` | `#4c1d95` | 76,29,149 | 263,62%,35% | Text di accent |
| `--color-destructive` | `#dc2626` | 220,38,38 | 0,72%,51% | Error, delete |
| `--color-destructive-foreground` | `#ffffff` | 255,255,255 | 0,0%,100% | Text di destructive |
| `--color-success` | `#16a34a` | 22,163,74 | 142,69%,36% | Status success badge |
| `--color-warning` | `#d97706` | 217,119,6 | 32,95%,44% | Status partial/warning |
| `--color-info` | `#2563eb` | 37,99,235 | 217,91%,53% | Info log level, info badge |
| `--color-border` | `#e4e4e7` | 228,228,231 | 240,5%,90% | Border, divider |
| `--color-input` | `#e4e4e7` | 228,228,231 | 240,5%,90% | Input border |
| `--color-ring` | `#7c3aed` | 124,58,237 | 262,83%,58% | Focus ring |

### 2.2 Warna - dark mode (`.dark` class, `globals.css:48-71`)

| Token | HEX | Penggunaan |
|---|---|---|
| `--color-background` | `#0a0a0a` | Page bg |
| `--color-foreground` | `#fafafa` | Body text |
| `--color-card` | `#0f0f0f` | Card bg |
| `--color-card-foreground` | `#fafafa` | Card text |
| `--color-popover` | `#0f0f0f` | Popover bg |
| `--color-popover-foreground` | `#fafafa` | Popover text |
| `--color-primary` | `#a78bfa` | CTA utama (violet light) |
| `--color-primary-foreground` | `#0a0a0a` | Text di primary |
| `--color-secondary` | `#27272a` | Secondary surface |
| `--color-secondary-foreground` | `#fafafa` | Text di secondary |
| `--color-muted` | `#27272a` | Muted bg |
| `--color-muted-foreground` | `#a1a1aa` | Helper text |
| `--color-accent` | `#3b0764` | Highlight |
| `--color-accent-foreground` | `#ddd6fe` | Text di accent |
| `--color-destructive` | `#ef4444` | Error |
| `--color-destructive-foreground` | `#fafafa` | Text di destructive |
| `--color-success` | `#22c55e` | Success |
| `--color-warning` | `#f59e0b` | Warning |
| `--color-info` | `#3b82f6` | Info |
| `--color-border` | `#27272a` | Border |
| `--color-input` | `#27272a` | Input border |
| `--color-ring` | `#a78bfa` | Focus ring |

> **State color mapping**: `success`/`warning`/`destructive`/`info` = token semantic untuk badge status generation log (`success`/`partial`/`fail`) dan log level (`info`/`warn`/`error`). Kontras dicek S7.

### 2.3 Tipografi (`globals.css:33-34`)

| Token | Value | Penggunaan |
|---|---|---|
| `--font-sans` | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | Heading + body |
| `--font-mono` | `"JetBrains Mono", "Fira Code", ui-monospace, monospace` | Code, JSON viewer, log line, stream chunk |

**Type scale** (Tailwind 4 default, ASUMSI tidak di-override):

| Class | Size | Line-height | Weight default | Penggunaan |
|---|---|---|---|---|
| `text-xs` | 12px | 16px | 400 | Badge level log, timestamp, helper |
| `text-sm` | 14px | 20px | 400 | Label form, body compact, table cell |
| `text-base` | 16px | 24px | 400 | Body default |
| `text-lg` | 18px | 28px | 600 | Card title, section heading |
| `text-xl` | 20px | 28px | 700 | Page H1 |
| `text-2xl` | 24px | 32px | 700 | Hero heading |
| `text-3xl` | 30px | 36px | 800 | Landing hero |

**Letter-spacing**: default Tailwind (tracking-normal 0, tracking-tight -0.025em untuk heading large). ASUMSI.

### 2.4 Spacing scale (Tailwind 4 default, base 4px)

| Token | Value | Penggunaan典型 |
|---|---|---|
| `space-1` / `p-1` / `gap-1` | 4px | Badge padding, icon gap |
| `space-2` | 8px | Form field gap, card internal |
| `space-3` | 12px | Card section gap |
| `space-4` | 16px | Card padding default, list row gap |
| `space-6` | 24px | Section vertical gap |
| `space-8` | 32px | Page section gap |
| `space-12` | 48px | Landing section gap |
| `space-16` | 64px | Hero gap |

### 2.5 Radius, border, shadow, elevation

| Token | Value | Sumber |
|---|---|---|
| `--radius` | `6px` | `globals.css:35` |
| `rounded-sm` | 4px (calc) | Tailwind |
| `rounded-md` | 6px (= --radius) | Tailwind |
| `rounded-lg` | 8px | Tailwind default |
| `rounded-full` | 9999px | Badge pill, avatar |
| Border width | 1px default (`--color-border`) | `globals.css:38-41` |
| Focus outline | `2px solid var(--color-ring)`, offset 2px | `globals.css:42-45` |

**Shadow/elevation** (Tailwind default, ASUMSI tidak di-override):
- `shadow-sm` - card resting
- `shadow-md` - card hover, popover
- `shadow-lg` - dialog, dropdown menu
- `shadow-xl` - landing hero mockup

### 2.6 Motion / transisi

| Aspek | Value | Aturan |
|---|---|---|
| Durasi default | 150ms (Tailwind `duration-150`) | Hover, focus, toggle |
| Durasi panjang | 300ms (`duration-300`) | Dialog open, collapsible expand |
| Easing default | `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind ease-in-out) | Default |
| Reduced motion | `prefers-reduced-motion: reduce` -> durasi 0.01ms | `globals.css:74-82` WAJIB hormati |
| framer-motion | ^12.40.0 (`package.json:48`) | Landing hero, scroll-tracker, animated-counter, testimonial-card |
| Log auto-scroll | `scrollIntoView({behavior:'smooth'})` (`log-viewer.tsx:51`) | Hormati reduced-motion (ASUMSI: cek `matchMedia`) |

### 2.7 Container & breakpoint

| Breakpoint | Width | Container max | Penggunaan |
|---|---|---|---|
| default (mobile) | 0-639px | `w-full px-4` | Mobile-first base |
| `sm` | 640px+ | `max-w-sm` | Form dialog mobile landscape |
| `md` | 768px+ | `max-w-3xl` | Tablet, generate form 2-kolom mulai |
| `lg` | 1024px+ | `max-w-5xl` | Desktop, generate layout 3-panel |
| `xl` | 1280px+ | `max-w-7xl` | Dashboard grid, landing |
| `2xl` | 1536px+ | `max-w-7xl` | Cap |

> Container utility: `mx-auto w-full max-w-*` per page. Landing = `max-w-7xl`, app shell = `max-w-7xl`, generate = `max-w-7xl`, settings = `max-w-3xl`, dashboard = `max-w-7xl`.

---

## 3. Komponen UI - Inventory + State

### 3.1 shadcn/ui primitives (di `src/components/ui/`) - 15 file terverifikasi glob

| Komponen | File | Variant/state | Props inti | Lokasi folder |
|---|---|---|---|---|
| Alert | `alert.tsx` | variant: default/destructive | `title`, `description` | `src/components/ui/alert` |
| Badge | `badge.tsx` | variant: default/secondary/outline/destructive | `children` | `src/components/ui/badge` |
| Button | `button.tsx` | variant: default/destructive/outline/secondary/ghost/link; size: default/sm/lg/icon; state: default/hover/active/disabled/loading | `variant`, `size`, `asChild`, `disabled` | `src/components/ui/button` |
| Card | `card.tsx` | sub: Card/CardHeader/CardTitle/CardDescription/CardContent/CardFooter | - | `src/components/ui/card` |
| Dialog | `dialog.tsx` | state: open/closed; radix focus trap | `open`, `onOpenChange` | `src/components/ui/dialog` |
| DropdownMenu | `dropdown-menu.tsx` | sub: Trigger/Content/Item/Separator/Label | radix | `src/components/ui/dropdown-menu` |
| Input | `input.tsx` | state: default/focus/disabled/error | `type`, `value`, `onChange` | `src/components/ui/input` |
| Label | `label.tsx` | - | `htmlFor` | `src/components/ui/label` |
| ScrollArea | `scroll-area.tsx` | - | radix ScrollArea | `src/components/ui/scroll-area` |
| Select | `select.tsx` | sub: Trigger/Content/Item/Group | radix | `src/components/ui/select` |
| Skeleton | `skeleton.tsx` | - | `className` (w/h) | `src/components/ui/skeleton` |
| Switch | `switch.tsx` | state: on/off/disabled; a11y role switch | `checked`, `onCheckedChange` | `src/components/ui/switch` |
| Table | `table.tsx` | sub: Table/TableHeader/TableBody/TableRow/TableHead/TableCell | - | `src/components/ui/table` |
| Tabs | `tabs.tsx` | sub: Tabs/TabsList/TabsTrigger/TabsContent; radix | `value`, `onValueChange` | `src/components/ui/tabs` |
| Textarea | `textarea.tsx` | state: default/focus/disabled/error | `value`, `onChange` | `src/components/ui/textarea` |

> shadcn config (`components.json`): style `default`, rsc true, tsx true, baseColor `neutral`, cssVariables true, alias `@/components/ui`. CSS var source = `src/app/globals.css`.

### 3.2 Composite components - generate (di `src/components/generate/`, 9 file terverifikasi)

| Komponen | File | Anatomi | State | Props inti |
|---|---|---|---|---|
| **GenerateForm** | `generate-form.tsx` (394 baris) | Card > form fields (title, duration, style, aspectRatio, storyDescription, references, numScenes, providerId, template) + Button submit + ElapsedTimer + LogViewer + ResultTabs + TemplatePicker + DropzoneUploader | idle / submitting / streaming / success / error; stage labels `STAGE_LABELS` (`:31-41`) | `CreateProjectInputSchema` via react-hook-form + zodResolver |
| **LogViewer** | `log-viewer.tsx` (91 baris) | Collapsible.Root > Collapsible.Trigger (latest log + level badge) + Collapsible.Content (scroll list + auto-scroll bottom) | empty (return null `:55`) / streaming (auto-open `:44-46`) / static; level info/warn/error badge warna hardcoded `bg-{blue,yellow,red}-100` (`:14-19`) | `logs: LogEntry[]`, `defaultOpen`, `streaming` |
| **ResultTabs** | `result-tabs.tsx` | Tabs > TabsList + TabsContent per section (characters, scenes, image_prompts, supporting_characters, moral, audio) | loading (skeleton) / success / partial (warning alert scene hilang) / empty | `PromptPackage` result, `warnings[]`, `partialSceneIds?` |
| **AudioPanel** | `audio-panel.tsx` | Sub-panel render audio_specs per scene (audio_type, timing, volume, music_*, ambient_*, sfx_list) | empty / populated | scene audio_specs |
| **SceneTransitionCard** | `scene-transition-card.tsx` | Card render transition_type/duration/easing/direction per scene | - | scene transition fields |
| **VoiceTypeSelector** | `voice-type-selector.tsx` | Select/combobox voice_type (child/teen/adult_male/adult_female/elderly_male/elderly_female/narrator) | default/selected | `value`, `onChange` |
| **TemplatePicker** | `template-picker.tsx` | Grid/Button group 5 preset (tutorial/cinematic/kids/documentary/action) | default/selected/hover | `value`, `onSelect` |
| **ImagePromptDisplay** | `image-prompt-display.tsx` | Card render 8-layer image prompt (target, prompt_text, reference_filename, composition, lighting, camera, mood_atmosphere, style_references, color_palette, technical) + CopyButton | - | image_prompt object |
| **DropzoneUploader** | `dropzone-uploader.tsx` | Drag-drop zone + asset list (tipe, filename, blobUrl) + upload progress | idle / dragging / uploading / uploaded / error | `AssetRef[]`, `onUpload` |

### 3.3 Composite components - landing (di `src/components/landing/`, 18 file)

| Komponen | File | Fungsi |
|---|---|---|
| Navbar | `navbar.tsx` | Top nav landing: logo + menu + language-toggle + theme-toggle + CTA |
| Hero | `hero.tsx` | Headline + sub + CTA + BrowserMockup |
| BrowserMockup | `browser-mockup.tsx` | Visual produk mockup |
| ProductDemo | `product-demo.tsx` | Demo section |
| ProblemSolution | `problem-solution.tsx` | Pain "generation keeps failing" vs solution |
| HowItWorks | `how-it-works.tsx` | Step pipeline |
| FeaturesBento | `features-bento.tsx` | Bento grid fitur |
| FeatureCard | `feature-card.tsx` | Card fitur tunggal |
| SocialProofBar | `social-proof-bar.tsx` | Statistik bar |
| AnimatedCounter | `animated-counter.tsx` | Counter animation (framer-motion) |
| Testimonials | `testimonials.tsx` + `testimonial-card.tsx` | Testimonial section |
| FAQ | `faq.tsx` + `faq-item.tsx` | Accordion FAQ |
| FinalCTA | `final-cta.tsx` | CTA akhir |
| Footer | `footer.tsx` | Footer landing |
| SectionWrapper | `section-wrapper.tsx` | Layout helper section |
| ScrollTracker | `scroll-tracker.tsx` | Progress scroll indicator |
| LogoPlaceholder | `logo-placeholder.tsx` | Logo placeholder (ASUMSI: belum ada brand logo final) |

### 3.4 Composite components - dashboard (di `src/components/dashboard/`, 5 file)

| Komponen | File | Anatomi | Data |
|---|---|---|---|
| MetricCard | `metric-card.tsx` | Card > label + value (animated) + delta | total project, generate count, success ratio |
| SuccessFailBarChart | `success-fail-bar-chart.tsx` | Recharts BarChart | success/partial/fail count |
| WeeklyTrendChart | `weekly-trend-chart.tsx` | Recharts Line/Area | generate count per day |
| PerProviderBreakdownTable | `per-provider-breakdown-table.tsx` | Table | provider, count, success% |
| RecentActivityTable | `recent-activity-table.tsx` | Table | recent generation logs (status badge, duration, provider) |

### 3.5 Composite components - projects (di `src/components/projects/`, 3 file)

| Komponen | File | Anatomi | State |
|---|---|---|---|
| ProjectsListClient | `projects-list-client.tsx` | Grid project-card + pagination + bulk-select + bulk-delete | loading/empty/populated |
| ProjectCard | `project-card.tsx` | Card > title + status badge + meta + delete button | draft/generating/complete/partial/failed |
| DeleteProjectButton | `delete-project-button.tsx` | Button + confirm Dialog | idle/confirming/deleting |

### 3.6 Composite components - settings (di `src/components/settings/`, 2 file)

| Komponen | File | Anatomi | State |
|---|---|---|---|
| ProviderCard | `provider-card.tsx` | Card > name + provider enum + model + baseUrl + apiKey masked (`****xxxx`) + active Switch + test Button + edit + delete | idle/active/testing/test-success/test-error |
| ProviderConfigForm | `provider-config-form.tsx` | Dialog/form: provider Select, name Input, baseUrl Input, model Input, apiKey Input (password) + save Button | idle/saving/error |

### 3.7 Composite components - common (di `src/components/common/`, 7 file)

| Komponen | File | Fungsi | Lokasi pakai |
|---|---|---|---|
| AppHeader | `app-header.tsx` | Top nav app (post-login): logo + nav links (generate/projects/dashboard/settings) + language-toggle + theme-toggle + user menu | Layout app shell |
| LanguageToggle | `language-toggle.tsx` | Switch id/en (next-intl `useLocale`/`useRouter`) | Navbar + AppHeader |
| ThemeToggle | `theme-toggle.tsx` | Toggle dark/light/system (next-themes `useTheme`) | Navbar + AppHeader |
| Pagination | `pagination.tsx` | Page nav | Projects list |
| PageLoadingSkeleton | `page-loading-skeleton.tsx` | Skeleton full page | `loading.tsx` route segments |
| PageErrorBoundary | `page-error-boundary.tsx` | Error UI + retry | `error.tsx` route segments |
| CopyButton | `copy-button.tsx` | Copy-to-clipboard + feedback toast | Image prompt, export markdown |
| ChangelogBanner | `changelog-banner.tsx` | Banner info rilis | App shell top |

### 3.8 State matrix generik per komponen interaktif

| State | Visual | Token | A11y |
|---|---|---|---|
| default | resting | bg background, text foreground | - |
| hover | bg `--color-accent` atau primary/10 | cursor pointer | - |
| active/focus | outline `2px solid --color-ring` offset 2px | - | `:focus-visible` WAJIB (`globals.css:42`) |
| disabled | opacity 50%, cursor not-allowed | `disabled:` utility | `aria-disabled` |
| loading | skeleton (`bg-muted animate-pulse`) atau Button spinner | - | `aria-busy="true"` |
| error | border `--color-destructive`, text destructive | Alert variant destructive | `aria-invalid`, `aria-describedby` |
| empty | Empty state illu/teks + CTA | muted-foreground | - |

---

## 4. Layout & Grid

### 4.1 Landing (`src/app/[locale]/page.tsx`)
Layout vertikal full-width, section terpisah `space-y-16`:
1. Navbar (sticky top, blur bg)
2. Hero (grid 2-kolom lg: text kiri + BrowserMockup kanan)
3. SocialProofBar
4. ProblemSolution
5. HowItWorks (3-step grid)
6. ProductDemo
7. FeaturesBento (bento grid md:grid-cols-3)
8. Testimonials (grid md:grid-cols-3)
9. FAQ (accordion single column max-w-3xl)
10. FinalCTA
11. Footer

### 4.2 App shell (post-login)
```
+--------------------------------------------------+
| AppHeader (sticky)                               |
|   logo | generate projects dashboard settings    |
|                            lang theme user-menu  |
+--------------------------------------------------+
| <main> container max-w-7xl px-4 py-8            |
|   {page content}                                 |
| </main>                                          |
+--------------------------------------------------+
```

### 4.3 Generate (`src/app/[locale]/generate/page.tsx`) - layout 3-panel desktop
```
+----------------------------------------------------------+
| H1 "Generate Prompt Package" + ElapsedTimer              |
+------------------+--------------------+------------------+
| GenerateForm     | LogViewer          | ResultTabs       |
| (sticky col)     | (collapsible)      | (tabs)           |
| md:col-span-1    | md:col-span-1      | lg:col-span-1    |
| max-h-screen     | auto-open stream   | loading skeleton |
| overflow-auto    |                    |                  |
+------------------+--------------------+------------------+
```
- Mobile: stack vertikal (form -> log -> result), log collapsible default closed.
- Desktop lg: grid 3-kolom `lg:grid-cols-3 gap-6`.

### 4.4 Projects list (`src/app/[locale]/projects/page.tsx`)
Grid responsif `grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`. Header: H1 + Button "New Project" + bulk-select toggle. Pagination bawah.

### 4.5 Project detail (`src/app/[locale]/projects/[id]/page.tsx`)
Layout: header (title + status badge + export Button + theme Switch) + Tabs (Overview/Characters/Scenes/ImagePrompts/Audio/Supporting/Moral) + content per tab scroll.

### 4.6 Project history (`src/app/[locale]/projects/[id]/history/page.tsx`)
Table generation_logs: timestamp | provider | model | durationMs | status badge | errorMessage (truncated, expand on click). Pagination.

### 4.7 Settings (`src/app/[locale]/settings/page.tsx`)
Layout 2-kolom md: sidebar (sections: Providers/Diagnose/Account) + main form. Provider section: list ProviderCard + Button "Add Provider" -> Dialog ProviderConfigForm. Diagnose: checklist status (DB/env/auth/provider) + Button "Run Diagnose".

### 4.8 Dashboard (`src/app/[locale]/dashboard/page.tsx`)
Grid: row 1 = 4 MetricCard (`grid sm:grid-cols-2 lg:grid-cols-4 gap-4`). Row 2 = 2-kolom `lg:grid-cols-2 gap-6` (SuccessFailBarChart + WeeklyTrendChart). Row 3 = 2-kolom (PerProviderBreakdownTable + RecentActivityTable).

### 4.9 Auth (`src/app/[locale]/login/page.tsx`, `register/page.tsx`)
Centered card `max-w-sm mx-auto mt-16`: Card > CardHeader (title) + CardContent (form email+password) + CardFooter (link toggle login/register).

---

## 5. Navigasi & Information Architecture

### 5.1 Route structure (i18n segment `[locale]` id|en, `RAG S3.1`)

| Route | Auth | Komponen utama |
|---|---|---|
| `/[locale]` (landing) | public | Navbar + Hero + ... + Footer |
| `/[locale]/login` | public (redirect app if session) | Auth card |
| `/[locale]/register` | public | Auth card |
| `/[locale]/generate` | **gated** | GenerateForm + LogViewer + ResultTabs |
| `/[locale]/projects` | **gated** | ProjectsListClient |
| `/[locale]/projects/[id]` | **gated** (ownership) | Project detail tabs |
| `/[locale]/projects/[id]/history` | **gated** (ownership) | Logs table |
| `/[locale]/settings` | **gated** | Provider list + Diagnose |
| `/[locale]/dashboard` | **gated** | Dashboard grid |

> Auth gate: edge middleware `src/middleware.ts` (`RAG S10.4`). Public paths: `/`, `/login`, `/register`, `/api/auth`, `/api/v1/health` (`middleware.ts:6-16`). Unauthenticated -> redirect `/[locale]/login`.

### 5.2 Top navigation pattern
- **Landing**: `Navbar` (sticky, blur backdrop) - logo kiri, menu tengah (Features/How/FAQ), kanan language-toggle + theme-toggle + CTA "Login" + "Start".
- **App**: `AppHeader` (sticky) - logo kiri, nav links (Generate/Projects/Dashboard/Settings), kanan language-toggle + theme-toggle + user dropdown (logout).

### 5.3 Breadcrumb
ASUMSI: tidak ada breadcrumb eksplisit. Rekomendasi: tambah breadcrumb di project detail & history (`Projects / [title] / History`) untuk IA clarity.

### 5.4 Footer
- Landing: `Footer` dengan link (Product/Resources/Company/Legal) + copyright.
- App: footer minimal atau hilang (fokus workspace).

### 5.5 User flow utama (Mermaid)

#### Flow A: Auth (login)
```mermaid
flowchart TD
    A[Landing] -->|klik Login| B[/login]
    B --> C{submit email+password}
    C -->|invalid| D[Alert error inline]
    C -->|valid| E[NextAuth Credentials]
    E -->|fail| D
    E -->|ok| F[Session JWT]
    F --> G[/generate default]
```

#### Flow B: Generate (inti - dengan observability bug-fix)
```mermaid
flowchart TD
    A[/generate] --> B[GenerateForm]
    B -->|pilih template| C[TemplatePicker]
    B -->|upload refs| D[DropzoneUploader]
    B -->|submit valid| E[POST /api/v1/generate SSE]
    E --> F[SSE stage: starting]
    F --> G[stage: character_profiles]
    G --> H[stage: llm_calling + stream_chunk]
    H --> I{LLM valid?}
    I -->|no - VALIDATION| J[categorizeError]
    I -->|no - JSON_PARSE| K[repairTruncatedJson]
    K -->|repair fail| J
    J --> L{retry < maxRetries?}
    L -->|ya - vary request + corrective prompt| H
    L -->|tidak| M[SSE error event + category]
    I -->|ya| N[stage: saving - persist DB]
    N --> O{partial persist?}
    O -->|ya - scene hilang| P[status partial + partialSceneIds]
    O -->|tidak| Q[status success]
    P --> R[stage: done + warnings + partialSceneIds]
    Q --> R
    R --> S[ResultTabs render]
    S --> T{user export?}
    T -->|ya| U[GET /export Markdown]
    M --> V[LogViewer tampilkan category + path field]
    V --> W[Toast error actionable]
```

#### Flow C: Settings - add provider
```mermaid
flowchart TD
    A[/settings] --> B[Provider list]
    B -->|klik Add Provider| C[Dialog ProviderConfigForm]
    C --> D[isi provider/name/baseUrl/model/apiKey]
    D -->|save| E[POST /api/v1/settings/providers - AES encrypt key]
    E --> F[ProviderCard baru, apiKey masked]
    F --> G{Test provider?}
    G -->|ya| H[POST /test - ping]
    H -->|ok| I[badge test-success]
    H -->|fail| J[badge test-error + toast]
    G -->|tidak| K[set active Switch]
```

#### Flow D: Dashboard
```mermaid
flowchart TD
    A[/dashboard] --> B[GET /api/v1/dashboard/stats]
    B --> C[4 MetricCard]
    B --> D[SuccessFailBarChart]
    B --> E[WeeklyTrendChart]
    B --> F[PerProviderBreakdownTable]
    B --> G[RecentActivityTable]
```

---

## 6. Wireframe Deskriptif (ASCII)

### 6.1 Landing - hero
```
+----------------------------------------------------------+
| [logo] PromptFlow        Features  How  FAQ   [id] [sun] [Login] [Start] |  <- Navbar sticky blur
+----------------------------------------------------------+
|                                                          |
|  H1: Pipeline prompt animasi AI                          |
|      yang reliable                                       |
|  Sub: Generate paket prompt tervalidasi schema,          |
|       multi-provider, observable.                        |
|  [CTA: Mulai Gratis]  [CTA: Lihat Demo]                  |
|                                                          |
|                                  +-------------------+   |
|                                  | BrowserMockup     |   |
|                                  | generate form +   |   |
|                                  | log viewer +      |   |
|                                  | result tabs       |   |
|                                  +-------------------+   |
+----------------------------------------------------------+
| SocialProofBar: 95% success | 10k+ paket | 4 provider    |
+----------------------------------------------------------+
```

### 6.2 Generate - desktop 3-panel
```
+----------------------------------------------------------+
| H1 Generate Prompt Package              [ElapsedTimer 0:42] |
+----------------+----------------+------------------------+
| GenerateForm   | LogViewer      | ResultTabs             |
| [Card]         | [Collapsible]  | [Tabs]                 |
|                |                |                        |
| Template:      | v latest: WARN | [Characters][Scenes]   |
| [tutorial][..] |   scene 2 sfx  | [ImagePrompts][Audio]  |
|                |   retry 1/2    | [Supporting][Moral]    |
| Title: [____]  | v expand v     |                        |
| Duration: [30s]| 12:00:01 INFO  | Scene 1                |
| Style: [v]     |   stage start  |  description: ...      |
| Aspect: [9:16] | 12:00:03 INFO  |  voiceover: ...        |
| Story:         |   character_   |  image_prompts:        |
| [textarea]     |   profiles     |    [char][bg] 8-layer  |
| Refs:          | 12:00:05 INFO  |  audio_specs:          |
| [dropzone]     |   llm_calling  |    [ambient][music]    |
|   [img1] [img2]| 12:00:30 INFO  |    [sfx] sfx_list:     |
| Scenes: [4]    |   stream_chunk |      "footstep,door"   |
| Provider: [v]  | 12:00:35 WARN  |  transition: dissolve  |
|                |   VALIDATION   |                        |
| [Generate]     |   scenes.2...  | [Export Markdown]      |
|                |   sfx_list     | [Copy]                 |
|                |   expected str |                        |
|                |   received arr |                        |
|                | 12:00:37 INFO  |                        |
|                |   retry 2/2    |                        |
|                |   corrective.. |                        |
+----------------+----------------+------------------------+
```

### 6.3 Generate - mobile (stack)
```
+--------------------+
| AppHeader [id][sun][v]|
+--------------------+
| H1 Generate        |
| [ElapsedTimer 0:42]|
+--------------------+
| GenerateForm       |
| Template [grid 2x3]|
| Title [____]       |
| Duration [30s]     |
| ...                |
| [Generate]         |
+--------------------+
| LogViewer (closed) |
| v latest: WARN ... |
+--------------------+
| ResultTabs         |
| [Chars][Scenes]... |
| (scroll)           |
+--------------------+
```

### 6.4 Projects list
```
+----------------------------------------------------------+
| H1 Projects              [x bulk-select] [+ New Project]  |
+----------------------------------------------------------+
| [ ] [ProjectCard]  [ProjectCard]  [ProjectCard]  [Card]   |
|     title          title          title          title    |
|     [complete]     [partial]      [draft]        [failed] |
|     4 scenes       8 scenes       -              -       |
|     [delete]       [delete]       [delete]       [del]   |
+----------------------------------------------------------+
| < 1 2 3 >                                                 |
+----------------------------------------------------------+
```

### 6.5 Settings - providers
```
+----------------------------------------------------------+
| Settings                                                  |
+------------+---------------------------------------------+
| sidebar    | Providers          [+ Add Provider]          |
| - Providers| +-----------------+ +-----------------+      |
| - Diagnose | | ProviderCard    | | ProviderCard    |      |
| - Account  | | openrouter      | | ollama          |      |
|            | | model: gpt-4o   | | model: llama3   |      |
|            | | key: ****4o2a   | | key: (none)     |      |
|            | | [active ON]     | | [active OFF]    |      |
|            | | [Test][Edit][X] | | [Test][Edit][X] |      |
|            | +-----------------+ +-----------------+      |
+------------+---------------------------------------------+
```

### 6.6 Dashboard
```
+----------------------------------------------------------+
| Dashboard                                                 |
+----------------------------------------------------------+
| [Total: 42]  [Generate: 318]  [Success: 96%] [Provider: 3]|
+----------------------------------------------------------+
| Success/Fail (bar)        | Weekly Trend (line)           |
| success 305              |        /\                      |
| partial 8                |   /\  /  \  /\                 |
| fail 5                   |  /  \/    \/  \                |
+--------------------------+-------------------------------+
| Per Provider (table)      | Recent Activity (table)       |
| provider | count | succ%  | ts | provider | status | dur  |
| openrouter| 280  | 97%    | .. | openrouter| success| 42s |
| ollama   | 30   | 90%    | .. | ollama    | partial| 120s |
| custom   | 8    | 100%   | .. | custom    | fail   | 5s   |
+--------------------------+-------------------------------+
```

### 6.7 LogViewer - empty / streaming / error (detail - KRITIS untuk bug-fix UX)
```
EMPTY (return null, log-viewer.tsx:55):
  (tidak render apa-apa)

STREAMING (auto-open):
+----------------------------------+
| v Logs (12)         [latest badge]|
+----------------------------------+
| 12:00:01 [INFO]  stage: starting  |
| 12:00:03 [INFO]  character_profiles|
| 12:00:05 [INFO]  llm_calling      |
| 12:00:30 [INFO]  stream_chunk ... |
| 12:00:35 [WARN]  [VALIDATION]     |
|   scenes.2.audio_specs.2.sfx_list |
|   expected string received array  |
| 12:00:37 [INFO]  retry 2/2        |
|   corrective prompt appended      |
| 12:00:42 [INFO]  saving           |
| 12:00:45 [INFO]  done success     |
|         (auto-scroll bottom)      |
+----------------------------------+

ERROR terminal - VALIDATION exhausted:
+----------------------------------+
| v Logs (8)         [ERROR badge] |
+----------------------------------+
| ...                              |
| 12:01:00 [ERROR] [VALIDATION]    |
|   scenes.2.audio_specs.2.sfx_list|
|   expected string received array |
|   2/2 attempts exhausted         |
|   corrective prompt tidak fix    |
+----------------------------------+

ERROR terminal - JSON_PARSE:
+----------------------------------+
| v Logs (8)         [ERROR badge] |
+----------------------------------+
| ...                              |
| 12:01:00 [ERROR] [JSON_PARSE]    |
|   Response bukan JSON valid:     |
|   Unexpected token at pos 14719  |
|   line 246 col 100               |
|   repairTruncatedJson failed     |
|   2/2 attempts exhausted         |
+----------------------------------+
```

> **Wajib**: LogViewer HARUS bedakan visual VALIDATION vs JSON_PARSE vs TIMEOUT vs NETWORK vs HTTP. Level badge warna: info=blue, warn=yellow, error=red (saat ini hardcoded `log-viewer.tsx:14-19`). Kategori error ditampilkan sebagai prefix `[CATEGORY]` di message. retryCount + correctivePrompt wajib tampil sebagai log entry terpisah.

---

## 7. Aksesibilitas (WCAG 2.1 AA)

### 7.1 Target & kontras
- **Target**: WCAG 2.1 AA (`PRD NFR-A11Y-01`). shadcn/ui radix primitives = a11y baseline.
- **Kontras minimum**: 4.5:1 text normal, 3:1 large text (18px+ / 14px bold). Verifikasi token:
  - Light: foreground `#0a0a0a` di background `#ffffff` = 20.4:1 PASS.
  - Light: muted-foreground `#71717a` di background `#ffffff` = 4.6:1 PASS (borderline, hanya helper text).
  - Light: primary `#7c3aed` di primary-foreground `#ffffff` = 5.9:1 PASS.
  - Light: destructive `#dc2626` di `#ffffff` = 4.5:1 PASS (borderline).
  - Light: warning `#d97706` di `#ffffff` = 3.4:1 - FAIL untuk text normal, OK untuk badge large/bold + icon. **Aksi**: warning text wajib bold >=14px atau pakai bg `#d97706` + text `#ffffff` (kontras 4.6:1).
  - Light: success `#16a34a` di `#ffffff` = 3.8:1 - FAIL untuk text normal, OK untuk badge large/bold. **Aksi**: sama dengan warning.
  - Dark: foreground `#fafafa` di `#0a0a0a` = 19.1:1 PASS.
  - Dark: muted-foreground `#a1a1aa` di `#0a0a0a` = 6.9:1 PASS.
  - Dark: primary `#a78bfa` di `#0a0a0a` = 9.3:1 PASS.

### 7.2 Keyboard navigation
- Semua interaktif reachable via Tab. radix primitives (Dialog, DropdownMenu, Select, Tabs, Switch, Collapsible) sudah handle focus trap + arrow key + escape.
- **Focus visible**: `:focus-visible` outline `2px solid --color-ring` offset 2px (`globals.css:42-45`) - WAJIB tidak hilang.
- Skip link: ASUMSI belum ada. **Rekomendasi**: tambah "Skip to content" di AppHeader & Navbar.
- Log viewer auto-scroll tidak boleh trap focus (`log-viewer.tsx:51`).

### 7.3 ARIA & semantic HTML
- shadcn primitives set `role`, `aria-expanded`, `aria-controls`, `aria-selected` otomatis.
- Form: setiap `<Input>` wajib `<Label htmlFor>` (`react-hook-form` + shadcn pattern).
- Error form: `aria-invalid="true"` + `aria-describedby` ke pesan error.
- LogViewer: `role="log"` + `aria-live="polite"` saat streaming, `aria-live="assertive"` saat error. **ASUMSI belum di-set** - rekomendasi tambah.
- Status badge generation: `role="status"` untuk success/partial, `role="alert"` untuk fail.
- Toast (sonner): default sudah `role="status"`, error toast `role="alert"`.

### 7.4 Teks alternatif
- Asset reference upload: preview image wajib `alt` dari filename atau label user.
- Logo: `alt="PromptFlow"`.
- Ilustrasi landing: dekoratif -> `alt=""` (aria-hidden). Informatif -> alt deskriptif.
- Icon (lucide-react): dekoratif -> `aria-hidden="true"`. Aksi -> `aria-label`.

### 7.5 Loading & error state (Next.js App Router)
- `loading.tsx` per route segment -> `PageLoadingSkeleton` (skeleton full page, `aria-busy="true"`).
- `error.tsx` per route segment -> `PageErrorBoundary` (Alert destructive + Button retry, `role="alert"`).
- Generate form submit: Button `disabled` + spinner + `aria-busy="true"`.
- ResultTabs loading: Skeleton per tab content.
- LogViewer streaming: badge level + auto-open, `aria-live`.

### 7.6 Reduce motion
- `@media (prefers-reduced-motion: reduce)` di `globals.css:74-82` -> durasi 0.01ms. WAJIB hormati di framer-motion (landing) + auto-scroll log. **ASUMSI**: framer-motion component landing belum cek `matchMedia` - rekomendasi tambah `useReducedMotion()`.

---

## 8. Responsif & Compatibility

### 8.1 Strategi: mobile-first
Tailwind 4 utility default = mobile. Breakpoint `sm`/`md`/`lg`/`xl`/`2xl` untuk progressive enhancement.

### 8.2 Per-page responsif

| Page | Mobile | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Landing | 1-kolom, hero stack | 2-kolom hero, bento 2-kolom | 3-kolom bento, testimonial 3-kolom |
| Generate | stack: form -> log -> result; log closed default | 2-kolom (form+log / result) | 3-kolom (form / log / result) |
| Projects | 1-kolom card | 2-kolom | 4-kolom |
| Project detail | tabs scroll horizontal | tabs + content | tabs + content 2-kolom |
| Settings | stack sidebar+main | sidebar+main | sidebar+main |
| Dashboard | 1-kolom metric | 2-kolom metric, chart stack | 4-kolom metric, 2-kolom chart |
| Auth | centered card | centered card | centered card |

### 8.3 Generate flow mobile khusus
- Form: field collapse ke 1-kolom, template grid 2-kolom, dropzone full-width.
- LogViewer: collapsible default closed, auto-open saat streaming, max-h 40vh scroll.
- ResultTabs: tab horizontal scrollable (`ScrollArea`), content scroll vertikal.
- Submit Button: sticky bottom bar mobile (`fixed bottom-0`).

### 8.4 Safe-area
- Tambah `env(safe-area-inset-bottom)` padding untuk sticky bottom bar mobile (notch). ASUMSI belum ada.

### 8.5 Browser/OS minimum (dari `SRS` + `package.json`)
- Browser modern evergreen: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+. dukung `:focus-visible`, CSS variables, `prefers-color-scheme`, `prefers-reduced-motion`.
- OS: Windows 10+, macOS 12+, iOS 16+, Android 12+.
- React 19 + Next 15 App Router = butuh JS enabled. No SSR fallback untuk interaktif.

---

## 9. i18n (next-intl id/en)

### 9.1 Setup
- next-intl v3.26 (`package.json:52`), plugin `createNextIntlPlugin('./src/lib/i18n/request.ts')` (`next.config.ts:2`).
- Routing object `routing` dari `@/lib/i18n/config` (`middleware.ts:4`).
- Lokal: `id` (default), `en` (`middleware.ts:40`).
- Path segment `[locale]` (`src/app/[locale]/`).
- Messages: `messages/id.json`, `messages/en.json` (`RAG S12 G12` - isi ASUMSI lengkap).

### 9.2 Language toggle
- `LanguageToggle` (`src/components/common/language-toggle.tsx`) - Switch/Select id/en via `useLocale` + `useRouter().replace`.
- Tersedia di Navbar (landing) + AppHeader (app).
- Persist pilihan via cookie next-intl.

### 9.3 Aturan konten i18n
- Semua label UI via `useTranslations('namespace')` - JANGAN hardcode string.
- Namespace rekomendasi: `common` (button/label umum), `landing` (hero/section), `auth` (login/register), `generate` (form stage label), `projects`, `settings`, `dashboard`, `errors` (kategori error message).
- Stage labels generate (`generate-form.tsx:31-41`) saat ini hardcode ID - **rekomendasi**: pindah ke `messages/{id,en}.json` namespace `generate.stages`.
- Error kategori (VALIDATION/JSON_PARSE/dll): tampilkan kode teknis apa adalah + terjemahkan deskripsi kontekstual. Contoh id: "Validasi gagal di field {path}. Diharapkan {expected}, diterima {received}." en: "Validation failed at {path}. Expected {expected}, received {received}."

### 9.4 Direction
- id/en = LTR. Tidak ada RTL.

---

## 10. Iconografi & Aset

### 10.1 Icon set
- **lucide-react ^0.468.0** (`package.json:49`) - icon set utama. Tree-shakeable, SVG, a11y friendly.
- Penggunaan: Button icon (`size="icon"`), nav link, status badge prefix, form field adornment, empty state.
- Aturan: dekoratif -> `aria-hidden="true"`. Aksi -> `aria-label` jika tanpa text.
- Size: default 16px (`size-4`), nav 20px (`size-5`), hero 24px (`size-6`).

### 10.2 Logo & maskot
- `LogoPlaceholder` (`src/components/landing/logo-placeholder.tsx`) - **ASUMSI: belum ada brand logo final**. Rekomendasi: sediakan SVG logo + maskot, path `public/logo.svg`, `public/mascot.svg`. Tandai ASUMSI sampai asset final.
- Logo placement: Navbar kiri, AppHeader kiri, auth card top, favicon.

### 10.3 Ilustrasi & aset landing
- BrowserMockup (`src/components/landing/browser-mockup.tsx`) - mock UI produk. ASUMSI: render CSS/SVG, bukan screenshot.
- Testimonial avatar: ASUMSI placeholder initial. Rekomendasi: `public/avatars/*.webp`.
- OG image: ASUMSI `public/og.png` untuk social share.

### 10.4 Font
- Inter (sans) + JetBrains Mono (mono) - load via `next/font/google` (ASUMSI - belum diverifikasi di layout). Rekomendasi: `src/app/[locale]/layout.tsx` setup `Inter` + `JetBrains_Mono` variable, assign ke `--font-sans` / `--font-mono`.

---

## 11. Interaction & Motion

### 11.1 Transisi & durasi
| Trigger | Transisi | Durasi | Easing |
|---|---|---|---|
| Button hover/active | bg color | 150ms | ease-in-out |
| Dialog open/close | opacity + scale | 300ms | ease-in-out |
| Collapsible (LogViewer) | height | 300ms | ease-in-out |
| Tabs switch | content fade | 150ms | ease-in-out |
| Toast (sonner) | slide+fade | 200ms | ease |
| Skeleton pulse | opacity | 1.5s infinite | ease-in-out |
| Log auto-scroll | scrollIntoView smooth | 300ms | ease-in-out |
| Landing framer-motion | variants per component | 400-600ms | spring/ease |

### 11.2 Loading state
- **Skeleton**: `Skeleton` component (`bg-muted animate-pulse`) untuk: page (`PageLoadingSkeleton`), ResultTabs content, dashboard cards saat fetch.
- **Button loading**: spinner inline + text "Generating..." + `disabled` + `aria-busy`.
- **SSE streaming indicator**: ElapsedTimer (`generate-form.tsx:43-50`) + LogViewer auto-open + stage label live.
- **Heartbeat**: server kirim `elapsedSec` tiap 2s (`route.ts:213-220`) - UI update timer.

### 11.3 Empty state
- Projects empty: illu/icon + "Belum ada project" + CTA "Buat project pertama".
- Logs empty: LogViewer return null (`log-viewer.tsx:55`) - tidak render. Rekomendasi: tampilkan placeholder "Menunggu generate..." saat idle.
- Dashboard empty: "Belum ada data generate" + CTA ke /generate.

### 11.4 Error state & feedback
- **Toast (sonner)**: error -> `role="alert"` destructive style. success -> `role="status"`. warning -> warning style.
- **Alert inline**: form error, VALIDATION error detail di ResultTabs.
- **LogViewer error terminal**: kategori + path field + pesan + retryCount.
- **PageErrorBoundary**: full-page error + retry Button.

### 11.5 Micro-interaction
- CopyButton: icon check saat copied + toast "Tersalin".
- ProviderCard test: spinner -> badge success/error.
- ProjectCard hover: shadow-md + slight lift.
- TemplatePicker select: ring primary + scale 1.02.

---

## 12. Konten & Copy

### 12.1 Tone
- Teknis-precise, tidak dingin. Pesan error = diagnosis. Contoh: bukan "Maaf, terjadi kesalahan." tapi "Validasi gagal di field scenes.2.audio_specs.2.sfx_list. Expected string, received array. Lihat log untuk detail retry."
- CTA: kata kerja imperatif. "Mulai Gratis", "Generate", "Export Markdown", "Tambah Provider", "Test Koneksi".

### 12.2 Glossary konsisten (id/en)

| Term ID | Term EN | Catatan |
|---|---|---|
| Generate | Generate | - |
| Paket prompt | Prompt package | - |
| Scene | Scene | - |
| Karakter | Character | - |
| Prompt gambar | Image prompt | 8-layer |
| Spec audio | Audio spec | - |
| Voiceover | Voiceover | - |
| Transisi | Transition | - |
| Karakter pendukung | Supporting character | - |
| Pesan moral | Moral message | - |
| Provider | Provider | - |
| Riwayat | History | logs |
| Pengaturan | Settings | - |
| Dashboard | Dashboard | - |
| Ekspor | Export | Markdown |

### 12.3 Pesan error kategori (actionable, `PRD US-GEN-04`)
| Kategori | Pesan id (template) | Pesan en | Aksi user |
|---|---|---|---|
| TIMEOUT | "Generate melebihi batas waktu {sec}s. Coba provider lain atau output lebih pendek." | "Generation timed out after {sec}s. Try another provider or shorter output." | Ganti provider/kurangi scene |
| NETWORK | "Gagal koneksi ke provider ({detail}). Cek baseUrl atau koneksi." | "Network error to provider ({detail}). Check baseUrl or connection." | Cek baseUrl/provider |
| VALIDATION | "Validasi gagal di field {path}. {message}. Lihat log untuk koreksi." | "Validation failed at {path}. {message}. See log for correction." | Lihat log, retry auto |
| HTTP | "Provider HTTP {status}: {detail}." | "Provider HTTP {status}: {detail}." | Cek API key/model |
| JSON_PARSE | "Output LLM bukan JSON valid (pos {pos}). Repair gagal. {detail}" | "LLM output not valid JSON (pos {pos}). Repair failed. {detail}" | Retry auto; ganti model bila persisten |
| UNKNOWN | "Error tidak teridentifikasi: {detail}. Lihat log." | "Unidentified error: {detail}. See log." | Lihat log, hubungi admin |

### 12.4 Empty/placeholder
- Form placeholder gunakan contoh. Title: "Mis. Petualangan Si Kancil". Story: "Deskripsikan premis cerita...".
- Input API key: "sk-..." (jangan expose value saat edit, tampilkan masked).

### 12.5 i18n konten
- Semua string UI via `messages/{id,en}.json`. Tidak hardcode. Pengecualian: kode teknis (provider enum, status enum, kategori error kode) apa adalah.

---

## 13. Standar Responsif & Compatibility (ringkas dari S8)

Lihat S8 untuk detail. Ringkas: mobile-first, breakpoint Tailwind 4, browser evergreen modern, JS wajib (React 19 App Router). Generate flow mobile = stack vertikal + sticky bottom submit. Dashboard mobile = 1-kolom. Safe-area untuk notch.

---

## 14. Citations

| Klaim | Sumber |
|---|---|
| shadcn config (style default, neutral base, cssVariables) | `components.json` (verifikasi langsung) |
| Token warna light/dark, font, radius, focus, reduced-motion | `src/app/globals.css:5-82` (verifikasi langsung) |
| 15 shadcn primitives | glob `src/components/ui/*.tsx` |
| 9 generate composite | glob `src/components/generate/*.tsx` |
| 18 landing composite | glob `src/components/landing/*.tsx` |
| 5 dashboard composite | glob `src/components/dashboard/*.tsx` |
| 3 projects composite | glob `src/components/projects/*.tsx` |
| 2 settings composite | glob `src/components/settings/*.tsx` |
| 7 common composite | glob `src/components/common/*.tsx` |
| LogViewer auto-open + auto-scroll + level badge hardcoded color | `src/components/generate/log-viewer.tsx:13-19,44-46,51,55` |
| GenerateForm stage labels + ElapsedTimer + RHF + zodResolver | `src/components/generate/generate-form.tsx:1-50` |
| Routes 9 page | glob `src/app/[locale]/**/page.tsx` |
| i18n id/en, next-intl | `RAG S3.5`, `middleware.ts:40`, `next.config.ts:2` |
| Theme dark/light/system | `RAG S4 F20`, `package.json:53` next-themes |
| Error kategori (TIMEOUT/NETWORK/VALIDATION/HTTP/JSON_PARSE/UNKNOWN) | `RAG S8.2.3`, `llm-client.ts:18-44` |
| SSE stage events + heartbeat 2s | `RAG S5` step 8-10, `route.ts:185-308,213-220` |
| Bug A sfx_list + Bug B JSON parse + Bug D partial persist | `RAG S11`, `PRD S2.3`, `PRD AC-GEN-05/06`, `AC-PERSIST-01` |
| Auth gate public paths | `RAG S10.4`, `middleware.ts:6-16` |
| Provider enum + AES mask | `RAG S4 F2/F3`, `schemas.ts:159`, `aes.ts:45-49` |
| Recharts dashboard | `package.json:57` |
| framer-motion landing | `package.json:48` |
| sonner toast | `package.json:59` |
| lucide icons | `package.json:49` |
| Persona + pain "generation keeps failing" | `PRD S2` |

---

## 15. ASUMSI Tracker

| # | Item | Status | Catatan |
|---|---|---|---|
| A1 | Type scale Tailwind default tidak di-override | ASUMSI | globals.css hanya set font family + radius, tidak size scale |
| A2 | Shadow token Tailwind default | ASUMSI | globals.css tidak override shadow |
| A3 | Logo & maskot final asset | ASUMSI | LogoPlaceholder dipakai, path `public/logo.svg` belum diverifikasi |
| A4 | Isi `messages/{id,en}.json` | ASUMSI | `RAG S12 G12` - file ada, isi tidak dibaca |
| A5 | LogViewer `aria-live` belum di-set | ASUMSI | `log-viewer.tsx:1-60` tidak ada aria-live attr |
| A6 | framer-motion landing belum cek `useReducedMotion` | ASUMSI | Tidak diverifikasi per component |
| A7 | Skip link "Skip to content" belum ada | ASUMSI | Tidak ditemukan di AppHeader/Navbar glob |
| A8 | Safe-area env() padding untuk notch | ASUMSI | Belum diverifikasi |
| A9 | next/font setup Inter+JetBrainsMono | ASUMSI | layout.tsx tidak dibaca langsung |
| A10 | Breadcrumb project detail/history | ASUMSI | Tidak ditemukan komponen breadcrumb |
| A11 | OG image `public/og.png` | ASUMSI | Tidak diverifikasi |
| A12 | Testimonial avatar asset | ASUMSI | Placeholder initial diasumsikan |
| A13 | ResultTabs partial warning UI eksplisit | ASUMSI | `result-tabs.tsx` isi tidak dibaca, spec berdasarkan `PRD AC-PERSIST-01` |
| A14 | ProviderConfigForm password input type | ASUMSI | Spec berdasarkan pattern API key masked |
| A15 | Dashboard empty state illu | ASUMSI | Tidak diverifikasi |

---

> **Catatan akhir**: Spec ini siap dipakai agent eksekutor frontend. Tokens di S2 langsung jadi CSS variables (sudah ada di `globals.css`). Komponen di S3 lokasi folder konsisten dengan `PROJECT_ARCHITECTURE S6`. UX khusus bug-fix (S6.7 LogViewer error terminal, S5 Flow B dengan observability category + partialSceneIds) wajib diimplementasi untuk tutup `PRD US-GEN-04/05` + `AC-GEN-05/06` + `AC-PERSIST-01`. Aksesibilitas S7 WAJIB, bukan opsional.
