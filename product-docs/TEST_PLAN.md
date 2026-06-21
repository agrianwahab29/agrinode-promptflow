# TEST_PLAN.md — PromptFlow V3

> **Versi:** 3.0
> **Framework:** Vitest 2.x (unit) + Playwright 1.49 (E2E)
> **Coverage target:** 80% lines/branches/functions/statements
> **Date:** 2026-06-22

---

## 1. Strategi Pengujian

### 1.1 Test Pyramid

| Level | Tool | Target | Jumlah |
|---|---|---|---|
| Unit | Vitest | src/lib/**, src/app/api/** | ~40 test cases |
| Integration | Vitest + MSW | API routes + DB | ~15 test cases |
| E2E | Playwright | Critical user flows | ~12 test cases |

### 1.2 Prioritas

| Priority | Area | Alasan |
|---|---|---|
| P0 | Generate route (audio save, scene linkage) | Data loss risk — audio_specs tidak tersimpan |
| P0 | DB migration (voiceover_speaker, color_palette, technical) | Schema integrity |
| P1 | Theme toggle (light/dark/system) | UX regression |
| P1 | Prompt builder (transition flow, 8-layer, voice type) | Output quality |
| P2 | Scene transition display | Visual correctness |
| P2 | Audio panel, voice type selector, image prompt display | Component rendering |
| P3 | Landing page | Marketing correctness |

---

## 2. Unit Tests (Vitest)

### 2.1 Schema Validation

| Test | File | Description |
|---|---|---|
| U-S01 | schemas.test.ts | PromptPackageSchema accepts valid V3 package with audio_specs |
| U-S02 | schemas.test.ts | PromptPackageSchema accepts 8-layer image prompts (color_palette, technical) |
| U-S03 | schemas.test.ts | SceneSchema accepts voiceover_speaker field |
| U-S04 | schemas.test.ts | SceneAudioSpecSchema validates all 5 audio types |
| U-S05 | schemas.test.ts | SceneSchema accepts all 6 transition types |
| U-S06 | schemas.test.ts | SceneSchema accepts all 7 voice types |
| U-S07 | schemas.test.ts | CharacterProfileSchema accepts voice_type + age_range |

### 2.2 Consistency Checker

| Test | File | Description |
|---|---|---|
| U-C01 | consistency-checker.test.ts | Detects missing audio_specs in scene |
| U-C02 | consistency-checker.test.ts | Detects voice_type mismatch between character and scene |
| U-C03 | consistency-checker.test.ts | Detects missing 8-layer fields in image prompts |
| U-C04 | consistency-checker.test.ts | Detects jarring cut (cut transition without action context) |

### 2.3 Prompt Builder

| Test | File | Description |
|---|---|---|
| U-P01 | prompt-builder.test.ts | buildSystemPrompt includes transition flow patterns A-E |
| U-P02 | prompt-builder.test.ts | buildSystemPrompt includes voice type mapping rules |
| U-P03 | prompt-builder.test.ts | buildSystemPrompt includes 8-layer image prompt instructions |
| U-P04 | prompt-builder.test.ts | buildSystemPrompt includes audio spec instructions |
| U-P05 | prompt-builder.test.ts | buildUserMessage includes story description |
| U-P06 | prompt-builder.test.ts | buildUserMessage includes reference info |

### 2.4 Response Parser

| Test | File | Description |
|---|---|---|
| U-R01 | response-parser.test.ts | parsePromptPackage validates complete V3 package |
| U-R02 | response-parser.test.ts | safeParsePromptPackage returns error for invalid |
| U-R03 | response-parser.test.ts | tryExtractJson handles code blocks, raw JSON, nested |

### 2.5 API Error

| Test | File | Description |
|---|---|---|
| U-E01 | error.test.ts | errorResponse returns correct JSON envelope |
| U-E02 | error.test.ts | successResponse includes pagination when provided |
| U-E03 | error.test.ts | defaultMessage covers all 11 error codes |

---

## 3. Integration Tests (Vitest + DB)

| Test | Description | Prerequisite |
|---|---|---|
| I-01 | Generate route saves audio_specs to scene_audio table | DB migration 0002 |
| I-02 | Generate route saves color_palette + technical to image_prompts | DB migration 0002 |
| I-03 | Generate route saves voiceover_speaker to scenes | DB migration 0002 |
| I-04 | Generate route links image_prompts to sceneId (not null) | Route fix |
| I-05 | Provider config CRUD (create, list, update, delete) | Existing |
| I-06 | Project CRUD + soft delete | Existing |
| I-07 | Upload + classify + orphan attach | Existing |
| I-08 | Health endpoint returns ok/degraded | Existing |

---

## 4. E2E Tests (Playwright)

### 4.1 Critical Flows

| Test | Flow | Steps |
|---|---|---|
| E-01 | Landing page loads | goto / → see hero, features, CTA |
| E-02 | Theme toggle works | Click theme button → select light → verify bg changes → reload → persists |
| E-03 | Register + login | Fill form → submit → redirect to dashboard |
| E-04 | Add provider | Settings → add provider → fill form → save → appears in list |
| E-05 | Generate flow (mock LLM) | Fill generate form → submit → see stages → see result tabs |
| E-06 | Result: scene transitions visible | After generate → see SceneTransitionCard with type + duration |
| E-07 | Result: voice type visible | After generate → see VoiceTypeSelector with type + emotion |
| E-08 | Result: audio panel visible | After generate → see AudioPanel with audio entries |
| E-09 | Result: image prompt 8-layer | After generate → expand ImagePromptDisplay → see all layers |
| E-10 | Project list shows results | Projects page → see generated project with status=complete |
| E-11 | Export JSON/Markdown | Result tabs → copy/export button works |
| E-12 | Mobile responsive | Resize to 375px → nav collapses, form usable |

### 4.2 E2E Test Data

```typescript
// Mock LLM response for E2E (consistent fixture)
const MOCK_PROMPT_PACKAGE = {
  title: "Test Animasi",
  duration_target: { type: "shorts", seconds: 60 },
  style: { type: "3D", aspect_ratio: "16:9" },
  character_profiles: [{
    nama: "TestChar", gayarambut: "Hitam pendek", wajah_asal: "Bulat",
    pakaian_atas: "Kaos merah", pakaian_bawah: "Celana jeans", alas_kaki: "Sneakers",
    deskripsi_latar: "Karakter test", aksi: "Berdiri", peran: "utama",
    voice_type: "adult_male", age_range: "25-35"
  }],
  scenes: [{
    order: 1, description: "Scene pembuka",
    voiceover_script: "Pada suatu hari...", voiceover_speaker: "TestChar",
    transition_type: "fade_in", transition_duration_ms: 2000,
    transition_easing: "ease_in_out", transition_direction: "forward",
    voice_type: "adult_male", voice_emotion: "neutral",
    voice_speed: 1.0, voice_pitch: "medium",
    duration_seconds: 10, scene_pacing: "normal", scene_mood: "peaceful",
    image_prompts: {
      characters: [{
        target: "TestChar", prompt_text: "Detailed prompt...",
        reference_filename: null, composition: '{"foreground":"TestChar"}',
        lighting: '{"key":"sunlight"}', camera: '{"angle":"eye level"}',
        mood_atmosphere: "damai", style_references: "Pixar",
        color_palette: '["#ff0000","#00ff00"]', technical: '{"resolution":"8K"}'
      }],
      backgrounds: [{
        target: "Latar", prompt_text: "Background prompt...",
        reference_filename: null, composition: '{"foreground":"jalan"}',
        lighting: '{"key":"golden hour"}', camera: '{"angle":"wide"}',
        mood_atmosphere: "tenang", style_references: "Ghibli",
        color_palette: '["#87CEEB"]', technical: '{"resolution":"4K"}'
      }]
    },
    audio_specs: [{
      audio_type: "ambient", description: "Suara pagi desa",
      timing: "throughout", volume: 0.3, fade_in_ms: 2000, fade_out_ms: 1000,
      ambient_type: "forest_village_morning"
    }]
  }],
  image_prompts: { characters: [], backgrounds: [] },
  supporting_characters: [],
  moral_message: "Pesan moral test"
};
```

---

## 5. Performance Tests

| Metric | Target | Method |
|---|---|---|
| Generate endpoint (LLM call) | < 240s (Vercel timeout) | Manual + log |
| Page load (landing) | < 2s LCP | Lighthouse |
| Page load (dashboard) | < 3s LCP | Lighthouse |
| Theme toggle | < 100ms | Playwright timing |
| DB query (list projects) | < 200ms | Log |

---

## 6. Security Tests

| Test | Area | Method |
|---|---|---|
| S-01 | SQL injection via title | Zod + Drizzle parameterized |
| S-02 | XSS via voiceover_script | React auto-escape |
| S-03 | CSRF on generate | NextAuth session cookie |
| S-04 | API key exposure | Check no plaintext in responses |
| S-05 | File upload validation | MIME + size check |
| S-06 | Rate limiting | In-memory Map (known limitation) |

---

## 7. Entry/Exit Criteria

### Entry
- All code changes committed
- DB migration tested locally
- `pnpm typecheck` passes
- `pnpm lint` passes

### Exit
- All P0 + P1 tests pass
- Coverage ≥ 80%
- No CRITICAL reviewer findings
- E2E critical flows pass (E-01, E-02, E-05)
- `pnpm build` succeeds

---

## 8. Regression Checklist

- [ ] Existing unit tests still pass
- [ ] Login flow still works
- [ ] Theme persists across page reload
- [ ] Generate still produces valid PromptPackage
- [ ] Provider config CRUD still works
- [ ] Upload still works
- [ ] i18n (id/en) still works
- [ ] Mobile layout not broken
