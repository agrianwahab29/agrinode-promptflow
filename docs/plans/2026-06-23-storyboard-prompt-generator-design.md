# Storyboard Prompt Generator — Design Document

> **Status:** Design complete — ready for implementation plan and product-docs update.
> **Feature code:** F-SB-01
> **Created:** 2026-06-23

## 1. Goal

Menambahkan fitur **Storyboard Prompt Generator** sebagai tab baru di halaman `/generate`. Fitur ini mengubah `PromptPackage` hasil generate menjadi satu atau lebih **prompt storyboard visual yang kompleks**, di mana setiap prompt merepresentasikan **10 detik video** dan dapat langsung digunakan pada AI image/video generator (Midjourney, Runway, Kling, dll.).

## 2. User Story

Sebagai creator video AI, saya ingin sistem secara otomatis memecah video saya menjadi segmen 10 detik, lalu menghasilkan prompt storyboard visual per segmen yang sudah konsisten karakter, lokasi, gaya, transisi, dan komposisi kamera — agar saya bisa generate setiap segmen secara terpisah tanpa khawatir hasilnya tidak nyambung.

## 3. Design Decisions

| Aspek | Keputusan | Alasan |
|---|---|---|
| Scope | MVP generator (tab di `/generate`) | Cepat, terintegrasi, fokus pada output |
| Output format | Hybrid JSON + Markdown | JSON untuk sistem/parsing, Markdown untuk copy-paste ke AI image/video |
| Segment duration | 10 detik per storyboard prompt | Batas umum AI video generator |
| Panel per segmen | Dinamis berdasarkan kompleksitas, default 8 panel | Fleksibel, tapi punya default kuat |
| Generate mechanism | Two-stage per segmen (outline → detailed prompts) | Kontrol, kualitas, debugging lebih mudah |
| Provider | User's configured provider (custom/OpenRouter/9Router) | Tidak menambah dependency model baru |
| Storage | DB table `storyboard_segments` | Asset project bisa dibuka ulang |
| Consistency strategy | Character Sheet + Location Sheet + Style Guide + Segment Boundary Rules | Menjaga continuity antar segmen |

## 4. Consistency Architecture

Karena tiap segmen 10 detik diproses terpisah, risiko utama adalah perubahan visual antar segmen. Solusi:

### 4.1 Character Sheet
Diekstrak dari `character_profiles` dan `image_prompts.characters`:
- `name`, `age_range`, `ethnicity`, `hair_style`, `outfit`, `key_expression`, `signature_pose`, `reference_image_prompt`
- Dimasukkan ulang di setiap LLM call sebagai " immutable visual anchor".

### 4.2 Location Sheet
Diekstrak dari `scenes[].location`, `image_prompts.backgrounds`, dan `style`:
- `name`, `architecture`, `time_of_day`, `lighting`, `color_palette`, `dominant_props`, `reference_image_prompt`

### 4.3 Visual Style Guide
Diekstrak dari `style` dan `duration_target`:
- `aspect_ratio`, `art_direction`, `cinematography`, `color_grading`, `frame_rate`, `camera_language`

### 4.4 Segment Boundary Rules
- Segmen ke-N menerima `previous_segment_summary` dan `next_segment_preview`.
- Panel pertama segmen ke-N harus menyebutkan transisi dari segmen sebelumnya.
- Panel terakhir segmen ke-N harus mengarahkan ke segmen berikutnya (jika ada).

## 5. Data Model

### 5.1 Schema Tambahan (`src/lib/db/schema.ts`)

```typescript
export const storyboardSegments = sqliteTable('storyboard_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  segmentIndex: integer('segment_index').notNull(),
  segmentTimeStart: integer('segment_time_start').notNull(), // seconds
  segmentTimeEnd: integer('segment_time_end').notNull(),     // seconds
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

### 5.2 Zod Schema Output (`src/lib/validation/schemas.ts`)

```typescript
export const StoryboardPanelSchema = z.object({
  index: z.number().int().min(1),
  time: z.string(),                    // e.g. "0:00 - 0:01.25"
  sceneCode: z.string(),             // e.g. "INT. LOBBY - DAY"
  title: z.string(),
  imagePrompt: z.string(),
  actionVisual: z.string(),
  cameraMovement: z.string(),
  dialogueVo: z.string(),
  transition: z.string(),
  charactersPresent: z.array(z.string()),
  location: z.string(),
  negativePrompt: z.string().optional(),
  audioNotes: z.string().optional(),
});

export const StoryboardSegmentSchema = z.object({
  segmentIndex: z.number().int().min(1),
  segmentTimeStart: z.number().int().min(0),
  segmentTimeEnd: z.number().int().min(1),
  durationSeconds: z.number().int(),
  panelCount: z.number().int(),
  visualStyle: z.object({
    aspectRatio: z.string(),
    artDirection: z.string(),
    colorPalette: z.string(),
    cinematography: z.string(),
  }),
  characterSheet: z.array(z.object({
    name: z.string(),
    visualDescription: z.string(),
    referenceImagePrompt: z.string().optional(),
  })),
  locationSheet: z.array(z.object({
    name: z.string(),
    visualDescription: z.string(),
    referenceImagePrompt: z.string().optional(),
  })),
  panels: z.array(StoryboardPanelSchema),
  segmentTransitionNote: z.string(),
  compiledMarkdownPrompt: z.string(),
});
```

## 6. API Endpoints

### 6.1 `POST /api/v1/projects/[id]/storyboard`
Generate atau regenerate seluruh storyboard segments untuk project.

**Request body:**
```json
{
  "providerId": 123,
  "panelsPerSegment": 8,
  "segmentDurationSeconds": 10
}
```

**Response (SSE streaming):**
```json
{ "event": "stage", "data": { "stage": "starting" } }
{ "event": "progress", "data": { "stage": "extracting_sheets", "segment": 0, "total": 3 } }
{ "event": "progress", "data": { "stage": "generating_outline", "segment": 1, "total": 3 } }
{ "event": "progress", "data": { "stage": "generating_panels", "segment": 1, "total": 3 } }
{ "event": "done", "data": { "segments": 3, "projectId": 42 } }
```

### 6.2 `GET /api/v1/projects/[id]/storyboard`
Ambil semua storyboard segments project (untuk tab Storyboard).

### 6.3 `GET /api/v1/projects/[id]/storyboard/[segmentIndex]`
Ambil satu segment spesifik.

## 7. AI Prompt Architecture (Two-Stage)

### Stage 1 — Segment Outline
System prompt meminta LLM menghasilkan outline panel untuk satu segmen 10 detik berdasarkan:
- Total project context (title, style, duration_target)
- Character Sheet
- Location Sheet
- Visual Style Guide
- Previous/next segment summary

Output Stage 1:
```json
{
  "panel_count": 8,
  "panels": [
    {
      "index": 1,
      "time": "0:00 - 0:01.25",
      "scene_code": "INT. LOBBY - DAY",
      "title": "Lobby Pertama",
      "characters_present": ["Adrian"],
      "location": "Lobby kantor mewah",
      "transition": "FADE IN",
      "brief": "Adrian melangkah masuk lobby, kamera low angle slow push in"
    }
  ],
  "segment_transition_note": "FADE OUT ke segmen 2..."
}
```

### Stage 2 — Detailed Panel Prompts
System prompt meminta LLM memperkaya setiap panel dari outline menjadi:
- `imagePrompt`: prompt lengkap untuk AI image generator
- `actionVisual`: deskripsi adegan/visual
- `cameraMovement`: shot + movement
- `dialogueVo`: voice-over/dialogue
- `negativePrompt`: elemen yang harus dihindari
- `audioNotes`: SFX/music cue

Output Stage 2 disusun menjadi `StoryboardSegmentSchema` dan dikompilasi ke Markdown.

## 8. UI Components

### 8.1 `StoryboardTab` (`src/components/generate/storyboard-tab.tsx`)
Tab baru di `ResultTabs` yang menerima `PromptPackage` dan `projectId`.

### 8.2 `StoryboardSegmentCard` (`src/components/generate/storyboard-segment-card.tsx`)
Menampilkan satu segmen 10 detik dengan:
- Header: segmen ke-N, durasi, status generate
- Daftar panel expandable
- Tombol Generate / Regenerate per segmen
- Copy Markdown / Copy JSON
- Panel preview (text-only)

### 8.3 `StoryboardPanelCard` (`src/components/generate/storyboard-panel-card.tsx`)
Menampilkan detail satu panel:
- Timestamp
- Scene code + title
- Image prompt
- Action/visual
- Camera movement
- Dialogue/VO
- Transition

### 8.4 `StoryboardGenerateButton`
Tombol di tab Storyboard untuk generate all segments.

## 9. File Structure

```
src/
├── lib/
│   ├── ai/
│   │   ├── prompts/
│   │   │   ├── storyboard-outline.system.ts
│   │   │   ├── storyboard-panels.system.ts
│   │   │   └── storyboard-compiler.ts
│   │   ├── storyboard-engine.ts          # orchestrator two-stage
│   │   ├── storyboard-sheet-extractor.ts # extract char/location/style sheets
│   │   └── storyboard-segmenter.ts       # hitung segmen dari duration_target
│   ├── db/
│   │   ├── schema.ts                     # tambah storyboard_segments
│   │   └── repositories/
│   │       └── storyboard-segment.repo.ts
│   └── validation/
│       └── schemas.ts                    # tambah storyboard schemas
├── app/api/v1/projects/[id]/
│   ├── storyboard/
│   │   └── route.ts
│   └── storyboard/[segmentIndex]/
│       └── route.ts
└── components/generate/
    ├── storyboard-tab.tsx
    ├── storyboard-segment-card.tsx
    ├── storyboard-panel-card.tsx
    └── storyboard-generate-button.tsx
```

## 10. Testing Strategy

- **Unit tests:**
  - `storyboard-segmenter.test.ts`: perhitungan segmen dari durasi
  - `storyboard-sheet-extractor.test.ts`: ekstraksi sheet dari PromptPackage
  - `storyboard-engine.test.ts`: mock LLM call two-stage, validasi output schema
  - `storyboard-segment.repo.test.ts`: CRUD repo
- **Integration tests:**
  - `src/app/api/v1/projects/[id]/storyboard/route.test.ts`: POST/GET endpoint
- **E2E (opsional):** generate storyboard dari UI dan verifikasi tab muncul

## 11. Open Questions / Risks

| Risk | Mitigasi |
|---|---|
| LLM output tidak konsisten antar segmen | Character/Location/Style Sheet + boundary rules + validation |
| Durasi panel tidak pas 10 detik | Validasi total panel duration ≤ segment duration |
| Provider timeout untuk segmen panjang | Max duration 300s, streaming progress, retry per segmen |
| Markdown prompt terlalu panjang | Batasi panel per segmen dan gunakan concise cinematography language |

## 12. Migration

- `drizzle-kit generate` untuk tabel baru `storyboard_segments`.
- Backward compatible: tab Storyboard hanya muncul setelah PromptPackage tergenerate.

---

**Next step:** Buat implementation plan di `docs/superpowers/plans/2026-06-23-storyboard-prompt-generator.md`, lalu update product-docs via docgen agent.
