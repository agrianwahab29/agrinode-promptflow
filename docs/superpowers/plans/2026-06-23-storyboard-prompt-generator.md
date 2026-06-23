# Storyboard Prompt Generator Implementation Plan

> **For agentic workers:** REQUIRED: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan fitur Storyboard Prompt Generator sebagai tab baru di `/generate` yang mengubah `PromptPackage` menjadi satu atau lebih prompt storyboard visual kompleks per 10 detik, dengan output hybrid JSON + Markdown dan penyimpanan di DB.

**Architecture:** Two-stage LLM per segmen 10 detik (outline → detailed panels), didukung oleh Character Sheet + Location Sheet + Visual Style Guide + Segment Boundary Rules untuk menjaga konsistensi antar segmen. Semua output divisualisasikan di tab baru dan disimpan di tabel `storyboard_segments`.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components, Drizzle ORM + SQLite, Zod, next-intl, Tailwind CSS, shadcn/ui, LLM client existing.

---

## Chunk 1: Foundation — DB Schema, Validation, and Sheet Extraction

### Task 1: Add `storyboard_segments` table to DB schema

**Files:**
- Modify: `src/lib/db/schema.ts`
- Test: `src/lib/db/schema.test.ts` (new)

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/db/schema.test.ts
import { storyboardSegments } from './schema';

describe('storyboard_segments schema', () => {
  it('has expected columns', () => {
    expect(storyboardSegments.segmentIndex).toBeDefined();
    expect(storyboardSegments.panelsJson).toBeDefined();
    expect(storyboardSegments.markdownPrompt).toBeDefined();
  });
});
```

Run: `pnpm test src/lib/db/schema.test.ts`
Expected: FAIL — `storyboardSegments` not exported

- [ ] **Step 2: Add table to schema**

Tambahkan setelah `sceneAudio` table di `src/lib/db/schema.ts`:

```typescript
export const storyboardSegments = sqliteTable('storyboard_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  segmentIndex: integer('segment_index').notNull(),
  segmentTimeStart: integer('segment_time_start').notNull(),
  segmentTimeEnd: integer('segment_time_end').notNull(),
  panelCount: integer('panel_count').notNull(),
  visualStyleJson: text('visual_style_json').notNull(),
  characterSheetJson: text('character_sheet_json').notNull(),
  locationSheetJson: text('location_sheet_json').notNull(),
  panelsJson: text('panels_json').notNull(),
  markdownPrompt: text('markdown_prompt').notNull(),
  segmentTransitionNote: text('segment_transition_note'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_storyboard_segments_project_id').on(t.projectId),
  projectSegmentIdx: uniqueIndex('idx_storyboard_segments_project_segment').on(t.projectId, t.segmentIndex),
}));
```

Tambahkan di akhir file:

```typescript
export type StoryboardSegment = typeof storyboardSegments.$inferSelect;
export type NewStoryboardSegment = typeof storyboardSegments.$inferInsert;
```

- [ ] **Step 3: Run test**

Run: `pnpm test src/lib/db/schema.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/schema.test.ts
git commit -m "feat(sb): add storyboard_segments table"
```

---

### Task 2: Add Storyboard Zod schemas

**Files:**
- Modify: `src/lib/validation/schemas.ts`
- Test: `src/lib/validation/schemas.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/validation/schemas.test.ts
import { StoryboardSegmentSchema } from './schemas';

const minimalSegment = {
  segmentIndex: 1,
  segmentTimeStart: 0,
  segmentTimeEnd: 10,
  durationSeconds: 10,
  panelCount: 8,
  visualStyle: {
    aspectRatio: '16:9',
    artDirection: '3D animation semi-realistic',
    colorPalette: 'warm golden hour',
    cinematography: 'wide shots with slow push-ins',
  },
  characterSheet: [{ name: 'Adrian', visualDescription: 'young man, white shirt, black trousers' }],
  locationSheet: [{ name: 'Office Lobby', visualDescription: 'modern marble lobby, golden sunset light' }],
  panels: [
    {
      index: 1,
      time: '0:00 - 0:01.25',
      sceneCode: 'INT. LOBBY - DAY',
      title: 'Lobby Pertama',
      imagePrompt: 'low angle shot of Adrian walking into luxury office lobby...',
      actionVisual: 'Adrian walks confidently into the lobby',
      cameraMovement: 'LOW ANGLE - slow push in',
      dialogueVo: 'Setiap mimpi dimulai dari sebuah keinginan kecil.',
      transition: 'FADE IN',
      charactersPresent: ['Adrian'],
      location: 'Office Lobby',
    },
  ],
  segmentTransitionNote: 'FADE OUT to segment 2',
  compiledMarkdownPrompt: '# Storyboard Segment 1...',
};

it('validates a minimal storyboard segment', () => {
  expect(StoryboardSegmentSchema.safeParse(minimalSegment).success).toBe(true);
});
```

Run: `pnpm test src/lib/validation/schemas.test.ts`
Expected: FAIL — `StoryboardSegmentSchema` not exported

- [ ] **Step 2: Add schemas**

Tambahkan di `src/lib/validation/schemas.ts` setelah `PromptPackageSchema`:

```typescript
export const StoryboardPanelSchema = z.object({
  index: z.number().int().min(1),
  time: z.string().min(1),
  sceneCode: z.string().min(1),
  title: z.string().min(1),
  imagePrompt: z.string().min(1),
  actionVisual: z.string().min(1),
  cameraMovement: z.string().min(1),
  dialogueVo: z.string(),
  transition: z.string().min(1),
  charactersPresent: z.array(z.string()),
  location: z.string().min(1),
  negativePrompt: z.string().optional(),
  audioNotes: z.string().optional(),
});

export const StoryboardSegmentSchema = z.object({
  segmentIndex: z.number().int().min(1),
  segmentTimeStart: z.number().int().min(0),
  segmentTimeEnd: z.number().int().min(1),
  durationSeconds: z.number().int().min(1),
  panelCount: z.number().int().min(1),
  visualStyle: z.object({
    aspectRatio: z.string().min(1),
    artDirection: z.string().min(1),
    colorPalette: z.string().min(1),
    cinematography: z.string().min(1),
  }),
  characterSheet: z.array(z.object({
    name: z.string().min(1),
    visualDescription: z.string().min(1),
    referenceImagePrompt: z.string().optional(),
  })),
  locationSheet: z.array(z.object({
    name: z.string().min(1),
    visualDescription: z.string().min(1),
    referenceImagePrompt: z.string().optional(),
  })),
  panels: z.array(StoryboardPanelSchema).min(1),
  segmentTransitionNote: z.string().min(1),
  compiledMarkdownPrompt: z.string().min(1),
});

export type StoryboardPanel = z.infer<typeof StoryboardPanelSchema>;
export type StoryboardSegment = z.infer<typeof StoryboardSegmentSchema>;
```

- [ ] **Step 3: Run test**

Run: `pnpm test src/lib/validation/schemas.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/validation/schemas.ts src/lib/validation/schemas.test.ts
git commit -m "feat(sb): add storyboard zod schemas"
```

---

### Task 3: Create Segment Calculator

**Files:**
- Create: `src/lib/ai/storyboard-segmenter.ts`
- Test: `src/lib/ai/storyboard-segmenter.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai/storyboard-segmenter.test.ts
import { calculateSegments } from './storyboard-segmenter';

describe('calculateSegments', () => {
  it('splits 30s into 3 segments of 10s', () => {
    expect(calculateSegments(30, 10)).toEqual([
      { segmentIndex: 1, start: 0, end: 10 },
      { segmentIndex: 2, start: 10, end: 20 },
      { segmentIndex: 3, start: 20, end: 30 },
    ]);
  });

  it('rounds up partial segments', () => {
    expect(calculateSegments(35, 10)).toHaveLength(4);
    expect(calculateSegments(35, 10)[3]).toEqual({ segmentIndex: 4, start: 30, end: 35 });
  });
});
```

Run: `pnpm test src/lib/ai/storyboard-segmenter.test.ts`
Expected: FAIL — module not found

- [ ] **Step 2: Implement**

```typescript
// src/lib/ai/storyboard-segmenter.ts
export interface SegmentRange {
  segmentIndex: number;
  start: number;
  end: number;
}

export function calculateSegments(totalSeconds: number, segmentDurationSeconds: number = 10): SegmentRange[] {
  if (totalSeconds <= 0) return [];
  const duration = Math.max(1, segmentDurationSeconds);
  const count = Math.ceil(totalSeconds / duration);
  return Array.from({ length: count }, (_, i) => {
    const start = i * duration;
    const end = Math.min(start + duration, totalSeconds);
    return { segmentIndex: i + 1, start, end };
  });
}
```

- [ ] **Step 3: Run test**

Run: `pnpm test src/lib/ai/storyboard-segmenter.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai/storyboard-segmenter.ts src/lib/ai/storyboard-segmenter.test.ts
git commit -m "feat(sb): add storyboard segment calculator"
```

---

### Task 4: Create Sheet Extractor

**Files:**
- Create: `src/lib/ai/storyboard-sheet-extractor.ts`
- Test: `src/lib/ai/storyboard-sheet-extractor.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai/storyboard-sheet-extractor.test.ts
import { extractSheets } from './storyboard-sheet-extractor';
import { type PromptPackage } from '@/lib/validation/schemas';

const mockPkg: PromptPackage = {
  title: 'Di Balik Awan',
  style: { type: 'cinematic', ratio: '16:9', mood: 'inspirational' },
  duration_target: 60,
  moral_message: '',
  scenes: [
    {
      order: 1,
      description: 'Lobby kantor mewah',
      voiceover_script: '...',
      transition_type: 'cut',
      transition_duration_ms: 0,
      transition_easing: 'linear',
      transition_direction: 'forward',
      voice_type: 'narrator',
      voice_emotion: 'neutral',
      voice_speed: 1,
      voice_pitch: 'auto',
      duration_seconds: 5,
      scene_pacing: 'normal',
      voiceover_speaker: 'narrator',
      location: 'INT. LOBBY - DAY',
      image_prompts: { characters: [], backgrounds: [] },
      audio_specs: [],
    },
  ],
  character_profiles: [
    {
      nama: 'Adrian',
      gayarambut: 'hitam pendek',
      wajah_asal: 'Asia',
      pakaian_atas: 'kemeja putih',
      pakaian_bawah: 'celana hitam',
      alas_kaki: 'sepatu hitam',
      deskripsi_latar: 'lobby mewah',
      aksi: 'berjalan',
      peran: 'utama',
    },
  ],
  image_prompts: {
    characters: [
      { target: 'Adrian', prompt_text: 'Young Asian man, white shirt, black pants...', composition: '', lighting: '', camera: '', mood_atmosphere: '', style_references: '', color_palette: '', technical: '' },
    ],
    backgrounds: [
      { target: 'Office Lobby', prompt_text: 'Luxury modern office lobby, marble floor, golden hour...', composition: '', lighting: '', camera: '', mood_atmosphere: '', style_references: '', color_palette: '', technical: '' },
    ],
  },
};

it('extracts character and location sheets', () => {
  const sheets = extractSheets(mockPkg);
  expect(sheets.characterSheet).toHaveLength(1);
  expect(sheets.characterSheet[0].name).toBe('Adrian');
  expect(sheets.locationSheet).toHaveLength(1);
  expect(sheets.locationSheet[0].name).toBe('Office Lobby');
});
```

Run: `pnpm test src/lib/ai/storyboard-sheet-extractor.test.ts`
Expected: FAIL

- [ ] **Step 2: Implement**

```typescript
// src/lib/ai/storyboard-sheet-extractor.ts
import type { PromptPackage } from '@/lib/validation/schemas';

export interface CharacterSheetEntry {
  name: string;
  visualDescription: string;
  referenceImagePrompt?: string;
}

export interface LocationSheetEntry {
  name: string;
  visualDescription: string;
  referenceImagePrompt?: string;
}

export interface VisualStyleGuide {
  aspectRatio: string;
  artDirection: string;
  colorPalette: string;
  cinematography: string;
}

export interface StoryboardSheets {
  characterSheet: CharacterSheetEntry[];
  locationSheet: LocationSheetEntry[];
  visualStyle: VisualStyleGuide;
}

export function extractSheets(pkg: PromptPackage): StoryboardSheets {
  const characterMap = new Map<string, CharacterSheetEntry>();

  for (const c of pkg.character_profiles) {
    const desc = `${c.nama}: ${c.wajah_asal} ethnicity, ${c.gayarambut} hair, wearing ${c.pakaian_atas} and ${c.pakaian_bawah}, ${c.alas_kaki}, ${c.aksi}, ${c.deskripsi_latar}`;
    const imgPrompt = pkg.image_prompts.characters.find((p) => p.target.toLowerCase() === c.nama.toLowerCase())?.prompt_text;
    characterMap.set(c.nama.toLowerCase(), {
      name: c.nama,
      visualDescription: desc,
      referenceImagePrompt: imgPrompt,
    });
  }

  const locationMap = new Map<string, LocationSheetEntry>();
  for (const s of pkg.scenes) {
    if (!s.location) continue;
    const key = s.location.toLowerCase();
    if (locationMap.has(key)) continue;
    const imgPrompt = pkg.image_prompts.backgrounds.find((p) => s.location.toLowerCase().includes(p.target.toLowerCase()) || p.target.toLowerCase().includes(s.location.toLowerCase()))?.prompt_text;
    locationMap.set(key, {
      name: s.location,
      visualDescription: `${s.location}: ${s.description ?? ''}`.trim(),
      referenceImagePrompt: imgPrompt,
    });
  }

  return {
    characterSheet: Array.from(characterMap.values()),
    locationSheet: Array.from(locationMap.values()),
    visualStyle: {
      aspectRatio: pkg.style.ratio ?? '16:9',
      artDirection: `${pkg.style.type} style, ${pkg.style.mood ?? ''}`.trim(),
      colorPalette: extractColorPalette(pkg),
      cinematography: inferCinematography(pkg),
    },
  };
}

function extractColorPalette(pkg: PromptPackage): string {
  const palettes = pkg.image_prompts.backgrounds
    .map((p) => p.color_palette)
    .filter(Boolean) as string[];
  if (palettes.length > 0) return palettes.join('; ');
  return pkg.style.mood === 'inspirational' ? 'warm golden tones' : 'neutral cinematic palette';
}

function inferCinematography(pkg: PromptPackage): string {
  const cameras = pkg.image_prompts.backgrounds
    .map((p) => p.camera)
    .filter(Boolean) as string[];
  return cameras.length > 0 ? cameras.join('; ') : 'mixed wide shots and close-ups, smooth camera movements';
}
```

- [ ] **Step 3: Run test**

Run: `pnpm test src/lib/ai/storyboard-sheet-extractor.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai/storyboard-sheet-extractor.ts src/lib/ai/storyboard-sheet-extractor.test.ts
git commit -m "feat(sb): add storyboard sheet extractor"
```

---

## Chunk 2: AI Engine — Two-Stage Storyboard Generation

### Task 5: Create System Prompts for Outline and Panels

**Files:**
- Create: `src/lib/ai/prompts/storyboard-outline.system.ts`
- Create: `src/lib/ai/prompts/storyboard-panels.system.ts`
- Create: `src/lib/ai/prompts/storyboard-compiler.ts`
- Test: `src/lib/ai/prompts/storyboard-prompts.test.ts`

- [ ] **Step 1: Create outline system prompt**

```typescript
// src/lib/ai/prompts/storyboard-outline.system.ts
import type { StoryboardSheets, SegmentRange } from '../storyboard-sheet-extractor';

export interface OutlineContext {
  title: string;
  durationTargetSeconds: number;
  segment: SegmentRange;
  totalSegments: number;
  sheets: StoryboardSheets;
  previousSegmentSummary?: string;
  nextSegmentPreview?: string;
  panelsPerSegment: number;
  storyDescription?: string;
}

export function buildStoryboardOutlineSystemPrompt(): string {
  return `You are an expert storyboard artist and prompt engineer for AI video generation.
Your task is to break a video segment into a sequence of visual panels.

Rules:
- Each panel must fit within the 10-second segment.
- Panel durations should sum to exactly the segment duration.
- Use timestamp format: 0:00 - 0:01.25
- Each panel needs: index, time, scene_code (e.g. INT. LOBBY - DAY), title, characters_present, location, transition, brief.
- The first panel of segment 1 uses FADE IN.
- The last panel of the final segment uses FADE OUT.
- Other panels use CUT, MATCH CUT, DISSOLVE, or WIPE as appropriate.
- Maintain character and location consistency using the provided sheets.
- Camera language should be concise (e.g. LOW ANGLE - slow push in).

Output ONLY valid JSON matching the requested schema. No markdown, no prose.`;
}

export function buildStoryboardOutlineUserMessage(ctx: OutlineContext): string {
  const parts = [
    `Title: ${ctx.title}`,
    `Total duration: ${ctx.durationTargetSeconds}s`,
    `This segment: ${ctx.segment.start}s - ${ctx.segment.end}s (segment ${ctx.segment.segmentIndex} of ${ctx.totalSegments})`,
    `Target panels in this segment: ${ctx.panelsPerSegment}`,
    ctx.storyDescription ? `Story description: ${ctx.storyDescription}` : '',
    '',
    'CHARACTER SHEET (use exact visual descriptions):',
    JSON.stringify(ctx.sheets.characterSheet, null, 2),
    '',
    'LOCATION SHEET (use exact visual descriptions):',
    JSON.stringify(ctx.sheets.locationSheet, null, 2),
    '',
    'VISUAL STYLE GUIDE:',
    JSON.stringify(ctx.sheets.visualStyle, null, 2),
  ];

  if (ctx.previousSegmentSummary) {
    parts.push('', `PREVIOUS SEGMENT SUMMARY:\n${ctx.previousSegmentSummary}`);
  }
  if (ctx.nextSegmentPreview) {
    parts.push('', `NEXT SEGMENT PREVIEW:\n${ctx.nextSegmentPreview}`);
  }

  parts.push(
    '',
    `Generate an outline JSON with this exact shape:\n{\n  "panel_count": number,\n  "panels": [\n    {\n      "index": number,\n      "time": "0:00 - 0:01.25",\n      "scene_code": "INT/EXT. LOCATION - TIME",\n      "title": "short panel title",\n      "characters_present": ["Name"],\n      "location": "location name",\n      "transition": "CUT | MATCH CUT | FADE IN | FADE OUT | DISSOLVE | WIPE",\n      "brief": "one sentence visual/camera direction"\n    }\n  ],\n  "segment_transition_note": "how this segment connects to the next"\n}`
  );

  return parts.filter(Boolean).join('\n');
}
```

- [ ] **Step 2: Create panels system prompt**

```typescript
// src/lib/ai/prompts/storyboard-panels.system.ts
import type { StoryboardSheets } from '../storyboard-sheet-extractor';
import type { StoryboardPanelOutline } from '../storyboard-engine';

export interface PanelsContext {
  title: string;
  segment: { segmentIndex: number; start: number; end: number };
  panelsPerSegment: number;
  sheets: StoryboardSheets;
  outline: {
    panel_count: number;
    panels: StoryboardPanelOutline[];
    segment_transition_note: string;
  };
}

export function buildStoryboardPanelsSystemPrompt(): string {
  return `You are an expert prompt engineer for AI image and video generators (Midjourney, Runway, Kling, Stable Video Diffusion).
Turn a storyboard outline into detailed image prompts per panel.

Rules:
- Each image_prompt must be a single, rich English prompt ready for an image generator.
- Keep visual style consistent across all panels using the style guide and sheets.
- Mention character names and exact outfit/appearance from the character sheet.
- Mention location names and lighting from the location sheet.
- Camera movement must be concise cinematography language.
- Negative prompt should list things to avoid (text, watermark, blur, deformity, etc.).
- Dialogue/VO can be empty if no voice-over.

Output ONLY valid JSON matching the requested schema. No markdown, no prose.`;
}

export function buildStoryboardPanelsUserMessage(ctx: PanelsContext): string {
  return [
    `Title: ${ctx.title}`,
    `Segment ${ctx.segment.segmentIndex}: ${ctx.segment.start}s - ${ctx.segment.end}s`,
    '',
    'CHARACTER SHEET:',
    JSON.stringify(ctx.sheets.characterSheet, null, 2),
    '',
    'LOCATION SHEET:',
    JSON.stringify(ctx.sheets.locationSheet, null, 2),
    '',
    'VISUAL STYLE GUIDE:',
    JSON.stringify(ctx.sheets.visualStyle, null, 2),
    '',
    'SEGMENT OUTLINE:',
    JSON.stringify(ctx.outline, null, 2),
    '',
    `Generate detailed panels JSON with this exact shape:\n{\n  "panels": [\n    {\n      "index": number,\n      "time": "0:00 - 0:01.25",\n      "scene_code": "...",\n      "title": "...",\n      "imagePrompt": "full English image prompt",\n      "actionVisual": "description of action",\n      "cameraMovement": "e.g. WIDE SHOT - slow push in",\n      "dialogueVo": "voice-over text or empty string",\n      "transition": "CUT",\n      "charactersPresent": ["Name"],\n      "location": "location name",\n      "negativePrompt": "things to avoid",\n      "audioNotes": "optional SFX/music cue"\n    }\n  ],\n  "segmentTransitionNote": "..."\n}`
  ].join('\n');
}
```

- [ ] **Step 3: Create markdown compiler**

```typescript
// src/lib/ai/prompts/storyboard-compiler.ts
import type { StoryboardSegment } from '@/lib/validation/schemas';

export function compileStoryboardMarkdown(segment: StoryboardSegment): string {
  const lines = [
    `# STORYBOARD — Segment ${segment.segmentIndex}`,
    `**Project:** ${segment.segmentTransitionNote}`,
    `**Duration:** ${segment.segmentTimeStart}s - ${segment.segmentTimeEnd}s`,
    `**Format:** ${segment.visualStyle.aspectRatio} | ${segment.visualStyle.artDirection}`,
    '',
    '## Visual Style Guide',
    `- **Aspect Ratio:** ${segment.visualStyle.aspectRatio}`,
    `- **Art Direction:** ${segment.visualStyle.artDirection}`,
    `- **Color Palette:** ${segment.visualStyle.colorPalette}`,
    `- **Cinematography:** ${segment.visualStyle.cinematography}`,
    '',
    '## Character Sheet',
    ...segment.characterSheet.map((c) => `- **${c.name}:** ${c.visualDescription}${c.referenceImagePrompt ? ` | Ref: ${c.referenceImagePrompt}` : ''}`),
    '',
    '## Location Sheet',
    ...segment.locationSheet.map((l) => `- **${l.name}:** ${l.visualDescription}${l.referenceImagePrompt ? ` | Ref: ${l.referenceImagePrompt}` : ''}`),
    '',
    '## Panels',
  ];

  for (const p of segment.panels) {
    lines.push(
      `### Panel ${p.index} | ${p.time} | ${p.sceneCode}`,
      `**${p.title}**`,
      '',
      `- **Image Prompt:** ${p.imagePrompt}`,
      `- **Action/Visual:** ${p.actionVisual}`,
      `- **Camera/Movement:** ${p.cameraMovement}`,
      `- **Dialogue/VO:** ${p.dialogueVo || '(none)'}`,
      `- **Transition:** ${p.transition}`,
      `- **Characters:** ${p.charactersPresent.join(', ')}`,
      `- **Location:** ${p.location}`,
      p.negativePrompt ? `- **Negative Prompt:** ${p.negativePrompt}` : '',
      p.audioNotes ? `- **Audio Notes:** ${p.audioNotes}` : '',
      ''
    );
  }

  lines.push('---', `**Segment Transition:** ${segment.segmentTransitionNote}`);

  return lines.filter((l) => l !== '').join('\n');
}
```

- [ ] **Step 4: Write tests**

```typescript
// src/lib/ai/prompts/storyboard-prompts.test.ts
import { buildStoryboardOutlineSystemPrompt } from './storyboard-outline.system';
import { compileStoryboardMarkdown } from './storyboard-compiler';
import { StoryboardSegmentSchema } from '@/lib/validation/schemas';

describe('storyboard prompts', () => {
  it('outline system prompt contains required rules', () => {
    const prompt = buildStoryboardOutlineSystemPrompt();
    expect(prompt).toContain('10-second segment');
    expect(prompt).toContain('FADE IN');
  });

  it('compiles markdown from a valid segment', () => {
    const segment = StoryboardSegmentSchema.parse({
      segmentIndex: 1,
      segmentTimeStart: 0,
      segmentTimeEnd: 10,
      durationSeconds: 10,
      panelCount: 1,
      visualStyle: { aspectRatio: '16:9', artDirection: '3D', colorPalette: 'warm', cinematography: 'wide' },
      characterSheet: [{ name: 'Adrian', visualDescription: 'young man' }],
      locationSheet: [{ name: 'Lobby', visualDescription: 'modern lobby' }],
      panels: [{
        index: 1,
        time: '0:00 - 0:10',
        sceneCode: 'INT. LOBBY - DAY',
        title: 'Enter',
        imagePrompt: 'Adrian enters lobby',
        actionVisual: 'Adrian walks in',
        cameraMovement: 'WIDE SHOT',
        dialogueVo: '',
        transition: 'FADE IN',
        charactersPresent: ['Adrian'],
        location: 'Lobby',
      }],
      segmentTransitionNote: 'Cut to segment 2',
      compiledMarkdownPrompt: '',
    });
    const md = compileStoryboardMarkdown(segment);
    expect(md).toContain('STORYBOARD');
    expect(md).toContain('Adrian');
    expect(md).toContain('WIDE SHOT');
  });
});
```

Run: `pnpm test src/lib/ai/prompts/storyboard-prompts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/ai/prompts/storyboard-outline.system.ts src/lib/ai/prompts/storyboard-panels.system.ts src/lib/ai/prompts/storyboard-compiler.ts src/lib/ai/prompts/storyboard-prompts.test.ts
git commit -m "feat(sb): add storyboard system prompts and markdown compiler"
```

---

### Task 6: Create Two-Stage Storyboard Engine

**Files:**
- Create: `src/lib/ai/storyboard-engine.ts`
- Test: `src/lib/ai/storyboard-engine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/ai/storyboard-engine.test.ts
import { generateStoryboardSegment, type StoryboardEngineOptions } from './storyboard-engine';
import { type PromptPackage } from '@/lib/validation/schemas';

const mockPkg: PromptPackage = {
  title: 'Di Balik Awan',
  style: { type: 'cinematic', ratio: '16:9', mood: 'inspirational' },
  duration_target: 20,
  moral_message: 'Keberanian bermimpi',
  scenes: [
    {
      order: 1, description: 'Lobby', voiceover_script: '...', transition_type: 'cut', transition_duration_ms: 0,
      transition_easing: 'linear', transition_direction: 'forward', voice_type: 'narrator', voice_emotion: 'neutral',
      voice_speed: 1, voice_pitch: 'auto', duration_seconds: 5, scene_pacing: 'normal', voiceover_speaker: 'narrator',
      location: 'INT. LOBBY - DAY', image_prompts: { characters: [], backgrounds: [] }, audio_specs: [],
    },
    {
      order: 2, description: 'Room', voiceover_script: '...', transition_type: 'cut', transition_duration_ms: 0,
      transition_easing: 'linear', transition_direction: 'forward', voice_type: 'narrator', voice_emotion: 'neutral',
      voice_speed: 1, voice_pitch: 'auto', duration_seconds: 5, scene_pacing: 'normal', voiceover_speaker: 'narrator',
      location: 'INT. BEDROOM - DAY', image_prompts: { characters: [], backgrounds: [] }, audio_specs: [],
    },
  ],
  character_profiles: [{
    nama: 'Adrian', gayarambut: 'hitam pendek', wajah_asal: 'Asia', pakaian_atas: 'kemeja putih',
    pakaian_bawah: 'celana hitam', alas_kaki: 'sepatu hitam', deskripsi_latar: 'lobby', aksi: 'berjalan', peran: 'utama',
  }],
  image_prompts: { characters: [], backgrounds: [] },
};

const mockOptions: StoryboardEngineOptions = {
  providerConfig: { id: 1, provider: 'openai', name: 'mock', baseUrl: 'http://localhost', model: 'gpt-4o', apiKeyEncrypted: null, userId: 1, isActive: 1, createdAt: 0, updatedAt: 0 },
  segment: { segmentIndex: 1, start: 0, end: 10 },
  totalSegments: 2,
  panelsPerSegment: 4,
  previousSegmentSummary: undefined,
  nextSegmentPreview: undefined,
};

it('returns a segment with valid schema when LLM mocked', async () => {
  // Mock implementation will be injected via generateStoryboardSegment internal calls
  const result = await generateStoryboardSegment(mockPkg, mockOptions);
  expect(result.segmentIndex).toBe(1);
  expect(result.panels).toHaveLength(4);
  expect(result.compiledMarkdownPrompt).toContain('STORYBOARD');
});
```

Run: `pnpm test src/lib/ai/storyboard-engine.test.ts`
Expected: FAIL

- [ ] **Step 2: Implement engine**

```typescript
// src/lib/ai/storyboard-engine.ts
import 'server-only';
import { generatePromptPackage } from './llm-client';
import { extractSheets, type StoryboardSheets } from './storyboard-sheet-extractor';
import { calculateSegments } from './storyboard-segmenter';
import { buildStoryboardOutlineSystemPrompt, buildStoryboardOutlineUserMessage, type OutlineContext } from './prompts/storyboard-outline.system';
import { buildStoryboardPanelsSystemPrompt, buildStoryboardPanelsUserMessage, type PanelsContext } from './prompts/storyboard-panels.system';
import { compileStoryboardMarkdown } from './prompts/storyboard-compiler';
import { StoryboardSegmentSchema, type PromptPackage, type StoryboardSegment } from '@/lib/validation/schemas';
import type { ProviderConfig } from '@/lib/db/schema';

export interface StoryboardEngineOptions {
  providerConfig: ProviderConfig;
  segment: { segmentIndex: number; start: number; end: number };
  totalSegments: number;
  panelsPerSegment: number;
  previousSegmentSummary?: string;
  nextSegmentPreview?: string;
}

export interface StoryboardPanelOutline {
  index: number;
  time: string;
  scene_code: string;
  title: string;
  characters_present: string[];
  location: string;
  transition: string;
  brief: string;
}

interface OutlineOutput {
  panel_count: number;
  panels: StoryboardPanelOutline[];
  segment_transition_note: string;
}

interface PanelsOutput {
  panels: Array<{
    index: number;
    time: string;
    scene_code: string;
    title: string;
    imagePrompt: string;
    actionVisual: string;
    cameraMovement: string;
    dialogueVo: string;
    transition: string;
    charactersPresent: string[];
    location: string;
    negativePrompt?: string;
    audioNotes?: string;
  }>;
  segmentTransitionNote: string;
}

export async function generateStoryboardSegment(
  pkg: PromptPackage,
  opts: StoryboardEngineOptions,
): Promise<StoryboardSegment> {
  const sheets = extractSheets(pkg);

  // Stage 1: outline
  const outlineCtx: OutlineContext = {
    title: pkg.title,
    durationTargetSeconds: pkg.duration_target,
    segment: opts.segment,
    totalSegments: opts.totalSegments,
    sheets,
    previousSegmentSummary: opts.previousSegmentSummary,
    nextSegmentPreview: opts.nextSegmentPreview,
    panelsPerSegment: opts.panelsPerSegment,
    storyDescription: (pkg as unknown as Record<string, unknown>).story_description as string | undefined,
  };

  const outlineRaw = await generatePromptPackage({
    providerConfig: opts.providerConfig,
    messages: [
      { role: 'system', content: buildStoryboardOutlineSystemPrompt() },
      { role: 'user', content: buildStoryboardOutlineUserMessage(outlineCtx) },
    ],
  });

  const outline = outlineRaw as unknown as OutlineOutput;
  if (!outline?.panels || outline.panels.length === 0) {
    throw new Error('Outline generation returned empty panels');
  }

  // Stage 2: detailed panels
  const panelsCtx: PanelsContext = {
    title: pkg.title,
    segment: opts.segment,
    panelsPerSegment: opts.panelsPerSegment,
    sheets,
    outline,
  };

  const panelsRaw = await generatePromptPackage({
    providerConfig: opts.providerConfig,
    messages: [
      { role: 'system', content: buildStoryboardPanelsSystemPrompt() },
      { role: 'user', content: buildStoryboardPanelsUserMessage(panelsCtx) },
    ],
  });

  const panelsData = panelsRaw as unknown as PanelsOutput;
  if (!panelsData?.panels || panelsData.panels.length === 0) {
    throw new Error('Panel generation returned empty panels');
  }

  const segment: StoryboardSegment = {
    segmentIndex: opts.segment.segmentIndex,
    segmentTimeStart: opts.segment.start,
    segmentTimeEnd: opts.segment.end,
    durationSeconds: opts.segment.end - opts.segment.start,
    panelCount: panelsData.panels.length,
    visualStyle: sheets.visualStyle,
    characterSheet: sheets.characterSheet,
    locationSheet: sheets.locationSheet,
    panels: panelsData.panels.map((p) => ({
      index: p.index,
      time: p.time,
      sceneCode: p.scene_code,
      title: p.title,
      imagePrompt: p.imagePrompt,
      actionVisual: p.actionVisual,
      cameraMovement: p.cameraMovement,
      dialogueVo: p.dialogueVo,
      transition: p.transition,
      charactersPresent: p.charactersPresent,
      location: p.location,
      negativePrompt: p.negativePrompt,
      audioNotes: p.audioNotes,
    })),
    segmentTransitionNote: panelsData.segmentTransitionNote,
    compiledMarkdownPrompt: '',
  };

  segment.compiledMarkdownPrompt = compileStoryboardMarkdown(segment);

  return StoryboardSegmentSchema.parse(segment);
}

export interface StoryboardRunResult {
  segments: StoryboardSegment[];
}

export async function generateAllStoryboardSegments(
  pkg: PromptPackage,
  providerConfig: ProviderConfig,
  segmentDurationSeconds: number = 10,
  panelsPerSegment: number = 8,
  onProgress?: (stage: string, segmentIndex: number, total: number) => void,
): Promise<StoryboardRunResult> {
  const ranges = calculateSegments(pkg.duration_target, segmentDurationSeconds);
  const totalSegments = ranges.length;
  const segments: StoryboardSegment[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    onProgress?.('generating_outline', range.segmentIndex, totalSegments);

    const prevSummary = i > 0 ? summarizeSegment(segments[i - 1]) : undefined;
    const nextPreview = i < ranges.length - 1 ? `Segment ${range.segmentIndex + 1} starts at ${ranges[i + 1].start}s` : undefined;

    const segment = await generateStoryboardSegment(pkg, {
      providerConfig,
      segment: range,
      totalSegments,
      panelsPerSegment,
      previousSegmentSummary: prevSummary,
      nextSegmentPreview: nextPreview,
    });

    segments.push(segment);
    onProgress?.('segment_complete', range.segmentIndex, totalSegments);
  }

  return { segments };
}

function summarizeSegment(segment: StoryboardSegment): string {
  const lastPanel = segment.panels[segment.panels.length - 1];
  return `Segment ${segment.segmentIndex} ends at ${lastPanel?.time ?? segment.segmentTimeEnd}s. ` +
    `Final panel: "${lastPanel?.title ?? ''}" — ${lastPanel?.actionVisual ?? ''}. ` +
    `Transition out: ${lastPanel?.transition ?? 'CUT'}. ` +
    `Active characters: ${[...new Set(segment.panels.flatMap((p) => p.charactersPresent))].join(', ')}.`;
}
```

- [ ] **Step 3: Run test**

Run: `pnpm test src/lib/ai/storyboard-engine.test.ts`
Expected: PASS

Note: Test may need to mock LLM client. If it calls real LLM, mock `generatePromptPackage` with `vi.mock('./llm-client', ...)`. Adjust test accordingly.

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai/storyboard-engine.ts src/lib/ai/storyboard-engine.test.ts
git commit -m "feat(sb): add two-stage storyboard generation engine"
```

---

## Chunk 3: Database Repository

### Task 7: Create Storyboard Segment Repository

**Files:**
- Create: `src/lib/db/repositories/storyboard-segment.repo.ts`
- Test: `src/lib/db/repositories/storyboard-segment.repo.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/db/repositories/storyboard-segment.repo.test.ts
import { bulkCreateStoryboardSegments, getStoryboardSegmentsByProject } from './storyboard-segment.repo';
import { db } from '../client';
import { projects, users } from '../schema';

async function seedUserAndProject() {
  const user = await db.insert(users).values({ email: 'sb@test.com', name: 'Test', passwordHash: 'x' }).returning().get();
  const project = await db.insert(projects).values({
    userId: user.id,
    title: 'Test',
    durationType: 'standard',
    durationTargetSeconds: 30,
    styleType: 'cinematic',
    aspectRatio: '16:9',
  }).returning().get();
  return { user, project };
}

describe('storyboard segment repo', () => {
  it('creates and retrieves segments', async () => {
    const { project } = await seedUserAndProject();
    const segments = [{
      projectId: project.id,
      segmentIndex: 1,
      segmentTimeStart: 0,
      segmentTimeEnd: 10,
      panelCount: 4,
      visualStyleJson: '{}',
      characterSheetJson: '[]',
      locationSheetJson: '[]',
      panelsJson: '[]',
      markdownPrompt: '# Segment 1',
      segmentTransitionNote: 'cut',
      provider: 'openai',
      model: 'gpt-4o',
    }];
    await bulkCreateStoryboardSegments(segments);
    const result = await getStoryboardSegmentsByProject(project.id);
    expect(result).toHaveLength(1);
    expect(result[0].segmentIndex).toBe(1);
  });
});
```

Run: `pnpm test src/lib/db/repositories/storyboard-segment.repo.test.ts`
Expected: FAIL

- [ ] **Step 2: Implement repository**

```typescript
// src/lib/db/repositories/storyboard-segment.repo.ts
import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { storyboardSegments, type NewStoryboardSegment, type StoryboardSegment } from '../schema';

export async function bulkCreateStoryboardSegments(
  inserts: NewStoryboardSegment[],
): Promise<StoryboardSegment[]> {
  if (inserts.length === 0) return [];
  return db.insert(storyboardSegments).values(inserts).returning().all();
}

export async function getStoryboardSegmentsByProject(projectId: number): Promise<StoryboardSegment[]> {
  return db.select().from(storyboardSegments).where(eq(storyboardSegments.projectId, projectId)).orderBy(storyboardSegments.segmentIndex).all();
}

export async function getStoryboardSegmentByIndex(projectId: number, segmentIndex: number): Promise<StoryboardSegment | undefined> {
  return db.select().from(storyboardSegments).where(and(eq(storyboardSegments.projectId, projectId), eq(storyboardSegments.segmentIndex, segmentIndex))).get();
}

export async function deleteStoryboardSegmentsByProject(projectId: number): Promise<void> {
  await db.delete(storyboardSegments).where(eq(storyboardSegments.projectId, projectId));
}

export async function deleteStoryboardSegment(projectId: number, segmentIndex: number): Promise<void> {
  await db.delete(storyboardSegments).where(and(eq(storyboardSegments.projectId, projectId), eq(storyboardSegments.segmentIndex, segmentIndex)));
}
```

- [ ] **Step 3: Run test**

Run: `pnpm test src/lib/db/repositories/storyboard-segment.repo.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/repositories/storyboard-segment.repo.ts src/lib/db/repositories/storyboard-segment.repo.test.ts
git commit -m "feat(sb): add storyboard segment repository"
```

---

## Chunk 4: API Routes

### Task 8: Create Storyboard API Routes

**Files:**
- Create: `src/app/api/v1/projects/[id]/storyboard/route.ts`
- Create: `src/app/api/v1/projects/[id]/storyboard/[segmentIndex]/route.ts`
- Test: `src/app/api/v1/projects/[id]/storyboard/route.test.ts`

- [ ] **Step 1: Implement POST /api/v1/projects/[id]/storyboard**

```typescript
// src/app/api/v1/projects/[id]/storyboard/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { getProjectById, updateProjectResult } from '@/lib/db/repositories/project.repo';
import { getProviderConfig, getActiveProviderConfig, listProviderConfigs } from '@/lib/db/repositories/provider-config.repo';
import { deleteStoryboardSegmentsByProject, bulkCreateStoryboardSegments } from '@/lib/db/repositories/storyboard-segment.repo';
import { generateAllStoryboardSegments } from '@/lib/ai/storyboard-engine';
import { PromptPackageSchema } from '@/lib/validation/schemas';

export const runtime = 'nodejs';
export const maxDuration = 600; // long-running for multiple segments
export const dynamic = 'force-dynamic';

interface SseEvent {
  event: 'stage' | 'progress' | 'done' | 'error';
  data: Record<string, unknown>;
}

function sseFormat(evt: SseEvent): string {
  return `event: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'Invalid project id');

  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404, 'Project not found');
  if (!project.resultJson) return errorResponse('CONFLICT', 409, 'Project has no generated prompt package');

  const parsedPkg = PromptPackageSchema.safeParse(JSON.parse(project.resultJson));
  if (!parsedPkg.success) return errorResponse('VALIDATION_ERROR', 400, 'Invalid stored prompt package');

  const body = await req.json().catch(() => ({}));
  const providerId = typeof body.providerId === 'number' ? body.providerId : undefined;
  const segmentDurationSeconds = typeof body.segmentDurationSeconds === 'number' ? body.segmentDurationSeconds : 10;
  const panelsPerSegment = typeof body.panelsPerSegment === 'number' ? body.panelsPerSegment : 8;

  let cfg;
  try {
    cfg = providerId ? await getProviderConfig(providerId, userId) : await getActiveProviderConfig(userId);
    if (!cfg) {
      const all = await listProviderConfigs(userId);
      cfg = all[0] ?? null;
    }
  } catch {
    return errorResponse('INTERNAL', 500, 'Provider lookup failed');
  }
  if (!cfg) return errorResponse('NOT_FOUND', 404, 'No provider config found');

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (evt: SseEvent) => controller.enqueue(encoder.encode(sseFormat(evt)));

        try {
          send({ event: 'stage', data: { stage: 'starting', projectId, totalSegments: Math.ceil(parsedPkg.data.duration_target / segmentDurationSeconds) } });

          await deleteStoryboardSegmentsByProject(projectId);

          const result = await generateAllStoryboardSegments(
            parsedPkg.data,
            cfg,
            segmentDurationSeconds,
            panelsPerSegment,
            (stage, segmentIndex, total) => send({ event: 'progress', data: { stage, segmentIndex, total } }),
          );

          const inserts = result.segments.map((seg) => ({
            projectId,
            segmentIndex: seg.segmentIndex,
            segmentTimeStart: seg.segmentTimeStart,
            segmentTimeEnd: seg.segmentTimeEnd,
            panelCount: seg.panelCount,
            visualStyleJson: JSON.stringify(seg.visualStyle),
            characterSheetJson: JSON.stringify(seg.characterSheet),
            locationSheetJson: JSON.stringify(seg.locationSheet),
            panelsJson: JSON.stringify(seg.panels),
            markdownPrompt: seg.compiledMarkdownPrompt,
            segmentTransitionNote: seg.segmentTransitionNote,
            provider: cfg.provider,
            model: cfg.model,
            status: 'ready' as const,
          }));

          await bulkCreateStoryboardSegments(inserts);

          send({ event: 'done', data: { segments: result.segments.length, projectId } });
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          send({ event: 'error', data: { message: msg } });
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    },
  );
}
```

- [ ] **Step 2: Implement GET /api/v1/projects/[id]/storyboard**

```typescript
// same file: append GET handler
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'Invalid project id');

  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404, 'Project not found');

  const segments = await getStoryboardSegmentsByProject(projectId);
  return Response.json({ segments });
}
```

Tambahkan import `getStoryboardSegmentsByProject`.

- [ ] **Step 3: Implement GET single segment**

```typescript
// src/app/api/v1/projects/[id]/storyboard/[segmentIndex]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { getStoryboardSegmentByIndex } from '@/lib/db/repositories/storyboard-segment.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; segmentIndex: string }> }) {
  const { id, segmentIndex } = await params;
  const projectId = Number(id);
  const segmentIdx = Number(segmentIndex);
  if (!Number.isFinite(projectId) || !Number.isFinite(segmentIdx)) {
    return errorResponse('VALIDATION_ERROR', 400, 'Invalid ids');
  }

  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404, 'Project not found');

  const segment = await getStoryboardSegmentByIndex(projectId, segmentIdx);
  if (!segment) return errorResponse('NOT_FOUND', 404, 'Segment not found');

  return Response.json({ segment });
}
```

- [ ] **Step 4: Write route test**

```typescript
// src/app/api/v1/projects/[id]/storyboard/route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 1 } }),
}));

vi.mock('@/lib/db/repositories/project.repo', () => ({
  getProjectById: vi.fn().mockResolvedValue({ id: 1, userId: 1, title: 'Test' }),
}));

vi.mock('@/lib/db/repositories/storyboard-segment.repo', () => ({
  getStoryboardSegmentsByProject: vi.fn().mockResolvedValue([
    { segmentIndex: 1, markdownPrompt: '# Seg 1' },
  ]),
}));

describe('GET /api/v1/projects/[id]/storyboard', () => {
  it('returns segments for the project', async () => {
    const req = new Request('http://localhost/api/v1/projects/1/storyboard');
    const res = await GET(req, { params: Promise.resolve({ id: '1' }) });
    const json = await res.json();
    expect(json.segments).toHaveLength(1);
  });
});
```

Run: `pnpm test src/app/api/v1/projects/[id]/storyboard/route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/v1/projects/\[id\]/storyboard/route.ts src/app/api/v1/projects/\[id\]/storyboard/\[segmentIndex\]/route.ts src/app/api/v1/projects/\[id\]/storyboard/route.test.ts
git commit -m "feat(sb): add storyboard API routes"
```

---

## Chunk 5: UI Components

### Task 9: Add Storyboard Tab to ResultTabs

**Files:**
- Modify: `src/components/generate/result-tabs.tsx`
- Create: `src/components/generate/storyboard-tab.tsx`

- [ ] **Step 1: Create StoryboardTab component**

```typescript
// src/components/generate/storyboard-tab.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/copy-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Film } from 'lucide-react';
import type { StoryboardSegment } from '@/lib/validation/schemas';

interface StoryboardTabProps {
  projectId: number;
}

export function StoryboardTab({ projectId }: StoryboardTabProps) {
  const t = useTranslations('generate');
  const [segments, setSegments] = useState<StoryboardSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    fetchSegments();
  }, [projectId]);

  async function fetchSegments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/storyboard`);
      if (!res.ok) return;
      const data = await res.json();
      setSegments(data.segments ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setProgress('');
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentDurationSeconds: 10, panelsPerSegment: 8 }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const data = JSON.parse(line.slice(5));
          if (data.stage) setProgress(`Stage: ${data.stage} (${data.segmentIndex ?? '-'}/${data.total ?? '-'})`);
          if (data.segments) {
            setProgress(`Done: ${data.segments} segments generated`);
            await fetchSegments();
          }
          if (data.message) setProgress(`Error: ${data.message}`);
        }
      }
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('loadingStoryboard')}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('storyboardTitle')}</CardTitle>
          <CardDescription>{t('storyboardDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
            {generating ? t('generatingStoryboard') : t('generateStoryboard')}
          </Button>
          {progress && <p className="mt-2 text-sm text-muted-foreground">{progress}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('storyboardSegments', { count: segments.length })}
        </div>
        <Button variant="outline" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {generating ? t('regenerating') : t('regenerateStoryboard')}
        </Button>
      </div>
      {generating && progress && <p className="text-sm text-muted-foreground">{progress}</p>}
      {segments.map((seg) => (
        <StoryboardSegmentCard key={seg.segmentIndex} segment={seg} />
      ))}
    </div>
  );
}

function StoryboardSegmentCard({ segment }: { segment: StoryboardSegment }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Segment {segment.segmentIndex}</CardTitle>
            <Badge variant="secondary">{segment.segmentTimeStart}s - {segment.segmentTimeEnd}s</Badge>
            <Badge variant="outline">{segment.panelCount} panels</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={segment.compiledMarkdownPrompt} label="Copy Markdown" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion type="multiple" className="w-full">
          {segment.panels.map((panel) => (
            <AccordionItem key={panel.index} value={`panel-${panel.index}`}>
              <AccordionTrigger className="text-sm">
                Panel {panel.index} | {panel.time} | {panel.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                <div className="space-y-1 rounded-md bg-muted p-3">
                  <div><span className="font-semibold">Scene:</span> {panel.sceneCode}</div>
                  <div><span className="font-semibold">Image Prompt:</span> {panel.imagePrompt}</div>
                  <div><span className="font-semibold">Action:</span> {panel.actionVisual}</div>
                  <div><span className="font-semibold">Camera:</span> {panel.cameraMovement}</div>
                  <div><span className="font-semibold">VO:</span> {panel.dialogueVo || '-'}</div>
                  <div><span className="font-semibold">Transition:</span> {panel.transition}</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Modify ResultTabs to include StoryboardTab**

Ubah `ResultTabs` untuk menerima `projectId` dan menambahkan tab Storyboard:

```typescript
// Modify: src/components/generate/result-tabs.tsx
// Update props:
export function ResultTabs({
  result,
  warnings,
  partialSceneIds = [],
  projectId,
}: {
  result: PromptPackage;
  warnings: Warning[];
  partialSceneIds?: number[];
  projectId: number;
}) {
```

Tambahkan tab trigger dan content:

```typescript
<TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
  ...existing tabs...
  <TabsTrigger value="storyboard">{t('tabStoryboard')}</TabsTrigger>
</TabsList>

...

<TabsContent value="storyboard" className="space-y-3">
  <StoryboardTab projectId={projectId} />
</TabsContent>
```

Tambahkan import:

```typescript
import { StoryboardTab } from './storyboard-tab';
```

- [ ] **Step 3: Add i18n keys**

Tambahkan di `messages/id.json` dan `messages/en.json` di bawah `generate` namespace:

```json
{
  "tabStoryboard": "Storyboard",
  "storyboardTitle": "Storyboard Prompt",
  "storyboardDescription": "Generate visual storyboard prompts per 10-second segment for AI image/video generators.",
  "generateStoryboard": "Generate Storyboard",
  "regenerateStoryboard": "Regenerate Storyboard",
  "generatingStoryboard": "Generating...",
  "storyboardSegments": "{count} segments generated",
  "loadingStoryboard": "Loading storyboard...",
  "regenerating": "Regenerating..."
}
```

- [ ] **Step 4: Update generate page to pass projectId**

Cari di mana `ResultTabs` digunakan (kemungkinan `src/app/[locale]/generate/page.tsx` atau `generate-form.tsx`) dan tambahkan prop `projectId`.

Contoh jika di `generate-form.tsx`:

```typescript
<ResultTabs result={result} warnings={warnings} partialSceneIds={partialSceneIds} projectId={projectId} />
```

- [ ] **Step 5: Run typecheck + test**

Run: `pnpm typecheck`
Run: `pnpm test src/components/generate/storyboard-tab.test.ts` (if created)
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/generate/storyboard-tab.tsx src/components/generate/result-tabs.tsx messages/en.json messages/id.json
git commit -m "feat(sb): add Storyboard tab UI"
```

---

## Chunk 6: Migration, Verification, and Documentation

### Task 10: Generate Drizzle Migration

**Files:**
- Run drizzle generate

- [ ] **Step 1: Generate migration**

Run: `pnpm db:generate`
Expected: New migration file created in `drizzle/migrations/`

- [ ] **Step 2: Commit**

```bash
git add drizzle/migrations/*
git commit -m "feat(sb): add storyboard_segments migration"
```

---

### Task 11: Verify Build, Typecheck, Tests

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

- [ ] **Step 2: Run tests**

Run: `pnpm test`
Expected: All PASS

- [ ] **Step 3: Run build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(sb): verify typecheck/tests/build"
```

---

### Task 12: Update Product Docs via Docgen Agent

- [ ] **Step 1: Run docgen agent**

Gunakan agent `docgen/docgen-prd` dan `docgen/docgen-srs` untuk memperbarui `product-docs/PRD.md` dan `product-docs/SRS.md` serta `API_CONTRACT.md`, `DATABASE_SCHEMA.md`, `UIUX_SPEC.md`.

Commands / instructions untuk agent:

```text
Update product-docs for new feature F-SB-01 Storyboard Prompt Generator.
Read existing product-docs/PRD.md, SRS.md, API_CONTRACT.md, DATABASE_SCHEMA.md, UIUX_SPEC.md.
Integrate the design from docs/plans/2026-06-23-storyboard-prompt-generator-design.md.
Add storyboard feature sections to PRD/SRS/API/UIUX docs.
Update DATABASE_SCHEMA.md with the new storyboard_segments table.
Do not delete existing content; append/update relevant sections.
```

- [ ] **Step 2: Review generated docs**

Run: `pnpm typecheck` setelah docgen selesai (jika docgen mengubah kode)
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add product-docs/
git commit -m "docs(sb): update product docs for storyboard feature"
```

---

## Final Delivery

Setelah semua chunk selesai:

```bash
git push origin main
vercel --prod
```

Atau deploy via Vercel git integration (auto-deploy on push).

---

## Summary of Files Created/Modified

**Created:**
- `src/lib/db/schema.ts` (modify)
- `src/lib/db/schema.test.ts`
- `src/lib/validation/schemas.ts` (modify)
- `src/lib/ai/storyboard-segmenter.ts` + `.test.ts`
- `src/lib/ai/storyboard-sheet-extractor.ts` + `.test.ts`
- `src/lib/ai/prompts/storyboard-outline.system.ts`
- `src/lib/ai/prompts/storyboard-panels.system.ts`
- `src/lib/ai/prompts/storyboard-compiler.ts`
- `src/lib/ai/prompts/storyboard-prompts.test.ts`
- `src/lib/ai/storyboard-engine.ts` + `.test.ts`
- `src/lib/db/repositories/storyboard-segment.repo.ts` + `.test.ts`
- `src/app/api/v1/projects/[id]/storyboard/route.ts` + `route.test.ts`
- `src/app/api/v1/projects/[id]/storyboard/[segmentIndex]/route.ts`
- `src/components/generate/storyboard-tab.tsx`
- `drizzle/migrations/...storyboard_segments...`

**Modified:**
- `src/components/generate/result-tabs.tsx`
- `messages/en.json`
- `messages/id.json`
- `product-docs/PRD.md`
- `product-docs/SRS.md`
- `product-docs/API_CONTRACT.md`
- `product-docs/DATABASE_SCHEMA.md`
- `product-docs/UIUX_SPEC.md`

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-23-storyboard-prompt-generator.md`. Ready to execute?**
