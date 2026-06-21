# API Contract — PromptFlow V3

> **Versi:** 3.1
> **Base URL:** `/api/v1`
> **Auth:** NextAuth v5 session cookie (`__Secure-authjs.session-token`)
> **Content-Type:** `application/json` (kecuali upload: `multipart/form-data`, generate: SSE)

---

## 1. Response Envelope

### 1.1 Success

```json
{
  "data": "<payload>",
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

### 1.2 Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": { "issues": [...] }
  },
  "traceId": "uuid"
}
```

**Error Codes:** `VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | RATE_LIMITED | PROVIDER_ERROR | TIMEOUT | INTERNAL | BAD_GATEWAY | SERVICE_UNAVAILABLE`

---

## 2. Endpoints

### 2.1 POST /api/v1/register

Register akun baru. Tidak perlu auth.

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | email@domain, max 200, trimmed + lowercased |
| `password` | string | Yes | min 8, max 200 |
| `name` | string | No | max 100 |

**201:** `{ id, email, name }`
**409:** Email sudah terdaftar
**400:** Validasi gagal

---

### 2.2 POST /api/v1/generate (SSE Stream)

Generate paket prompt animasi dari LLM. **Auth required.** Returns `text/event-stream`.

**Request Body:**

```json
{
  "projectId": 42,
  "input": {
    "title": "Petualangan di Hutan",
    "durationTarget": { "type": "shorts", "seconds": 60 },
    "style": { "type": "3D", "ratio": "16:9" },
    "references": [{ "name": "hero.png", "type": "tokoh" }],
    "storyDescription": "Deskripsi opsional, max 500 char"
  },
  "orphanRefIds": [12, 15]
}
```

| Field | Required | Constraint |
|---|---|---|
| `projectId` | No | auto-create bila absent |
| `input.title` | Yes | 3-200 chars |
| `input.durationTarget.type` | Yes | `shorts` (max 180s) or `tutorial` (420-900s) |
| `input.style.type` | Yes | `3D` or `2D` |
| `input.style.ratio` | Yes | `16:9` or `9:16` or `1:1` |
| `input.references` | No | array of `{ name, type }` |
| `input.storyDescription` | No | max 500 chars |
| `orphanRefIds` | No | array of number (uploaded refs) |

**SSE Events:**

| Event | Data | When |
|---|---|---|
| `stage` | `{ stage, projectId }` | Init |
| `progress` | `{ stage, ...meta }` | Each stage |
| `log` | `{ level, message, timestamp }` | Real-time log |
| `done` | `{ result: PromptPackage, warnings, generationLogId }` | Success |
| `error` | `{ code, message }` | Failure |

**PromptPackage Schema (result):**

```typescript
{
  title: string;
  duration_target: { type: "shorts" | "tutorial"; seconds: number };
  style: { type: "3D" | "2D"; aspect_ratio: string };
  character_profiles: Array<{
    nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki,
    deskripsi_latar, aksi, peran: "utama" | "lain" | "pendamping",
    voice_type?: "child" | "teen" | "adult_male" | "adult_female" | "elderly_male" | "elderly_female" | "narrator",
    age_range?: string
  }>;
  scenes: Array<{
    order: number; description: string; voiceover_script: string;
    voiceover_speaker: string;
    transition_type: "cut" | "dissolve" | "fade_to_black" | "fade_to_white" | "wipe" | "match_cut" | "fade_in";
    transition_duration_ms: number; transition_easing: "linear" | "ease_in" | "ease_out" | "ease_in_out";
    transition_direction: "forward" | "backward" | "loop";
    voice_type: string; voice_emotion: string;
    voice_speed: number; voice_pitch: string;
    duration_seconds: number | null; scene_pacing: "fast" | "normal" | "slow";
    scene_mood: string | null;
    image_prompts: { characters: ImagePromptItem[]; backgrounds: ImagePromptItem[] };
    audio_specs?: Array<{
      audio_type: "background_music" | "sfx" | "ambient" | "music_cue" | "transition_audio";
      description: string; timing: string; duration_seconds?: number | null;
      volume: number; fade_in_ms: number; fade_out_ms: number;
      music_genre?: string; music_mood?: string; music_tempo_bpm?: number;
      music_instruments?: string; music_volume?: number;
      sfx_list?: string; ambient_type?: string; ambient_volume?: number;
    }>
  }>;
  image_prompts: { characters: ImagePromptItem[]; backgrounds: ImagePromptItem[] };
  supporting_characters: Array<{ nama: string; tipe: "pendukung" | "hewan"; aksi: string }>;
  moral_message: string;
}

type ImagePromptItem = {
  target: string; prompt_text: string; reference_filename: string | null;
  composition?: string | null; lighting?: string | null; camera?: string | null;
  mood_atmosphere?: string | null; style_references?: string | null;
  color_palette?: string | string[] | null; technical?: string | null;
}
```

**V3 GAPS (generate route — not yet persisted to DB):**
- `audio_specs` is NOT saved to `scene_audio` table (needs fix)
- `color_palette`, `technical` is NOT saved to `image_prompts` table (needs fix)
- `voiceover_speaker` is NOT saved to `scenes` table (needs fix)
- `sceneId: null` — scene-to-image_prompt linkage broken (needs fix)

---

### 2.3 GET /api/v1/projects

List projects milik user. **Auth required.**

**Query:** `page` (default 1), `limit` (default 20, max 100)

**200:** `{ data: ProjectDTO[], pagination: { page, limit, total, totalPages } }`

```typescript
type ProjectDTO = {
  id: number; userId: number; title: string;
  durationType: "shorts" | "tutorial"; durationTargetSeconds: number;
  styleType: "3D" | "2D"; aspectRatio: string;
  status: "draft" | "generating" | "complete" | "failed";
  resultJson: unknown | null; createdAt: string; updatedAt: string; deletedAt: string | null;
}
```

---

### 2.4 POST /api/v1/projects

Buat project manual. **Auth required.**

Body: `{ title, durationType, durationTargetSeconds, styleType, aspectRatio }`

**201:** `ProjectDTO`
**422:** Shorts > 180s

---

### 2.5 GET /api/v1/projects/[id]

Detail project. **Auth required.** Harus own.

**200:** `ProjectDTO`
**404:** Not found atau bukan milik user

---

### 2.6 PATCH /api/v1/projects/[id]

Update metadata project. **Auth required.** Harus own.

Body: Partial of `{ title, durationType, durationTargetSeconds, styleType, aspectRatio }`

**200:** `ProjectDTO`
**404:** Not found

---

### 2.7 POST /api/v1/projects/[id]/delete

Soft-delete project. **Auth required.** Harus own.

**204:** No Content
**404:** Not found

---

### 2.8 PATCH /api/v1/projects/[id]/theme

Update theme preference project. **Auth required.** Harus own.

Body: `"dark" | "light" | "system"`

**200:** `{ themePreference }`
**404:** Not found

---

### 2.9 GET /api/v1/projects/[id]/scenes

List scenes project. **Auth required.** Harus own.

**200:** `SceneDTO[]` (includes V3 fields: transition_*, voice_*, scene_pacing, scene_mood)

---

### 2.10 GET /api/v1/projects/[id]/characters

List character profiles project. **Auth required.** Harus own.

**200:** `CharacterDTO[]` (includes V3: voice_type, age_range)

---

### 2.11 GET /api/v1/projects/[id]/image-prompts

List image prompts project. **Auth required.** Harus own.

**200:** `ImagePromptDTO[]` (includes V3: composition, lighting, camera, mood_atmosphere, style_references)

---

### 2.12 GET /api/v1/projects/[id]/scenes/[sceneId]/audio

List audio specs untuk scene tertentu. **Auth required.** Harus own.

**200:** `SceneAudioDTO[]`

---

### 2.13 GET /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]

Detail audio spec. **Auth required.** Harus own.

**200:** `SceneAudioDTO`
**404:** Not found

---

### 2.14 GET /api/v1/projects/[id]/logs

List generation logs project. **Auth required.** Harus own.

**Query:** `page` (default 1), `limit` (default 20, max 100)

**200:** `{ data: GenerationLogDTO[], pagination: { page, limit, total, totalPages } }`

---

### 2.15 GET /api/v1/projects/[id]/export

Export project sebagai JSON atau Markdown. **Auth required.** Harus own.

**Query:** `format` = `json` | `markdown` (default `json`)

**200:** File download (application/json or text/markdown)
**409:** Project belum di-generate

---

### 2.16 GET /api/v1/settings/providers

List provider configs user. **Auth required.**

**200:** `ProviderConfigDTO[]`

```typescript
type ProviderConfigDTO = {
  id: number; userId: number;
  provider: "ollama" | "openrouter" | "9router" | "custom";
  name: string; baseUrl: string; model: string;
  apiKeyMasked: string; isActive: number;
  createdAt: string; updatedAt: string;
}
```

---

### 2.17 POST /api/v1/settings/providers

Tambah provider config. **Auth required.**

Body: `{ provider, name, baseUrl, model, apiKey, isActive? }`

**201:** `ProviderConfigDTO` (apiKey masked)
**409:** Nama duplikat

---

### 2.18 PATCH /api/v1/settings/providers/[id]

Update provider config. **Auth required.** Harus own.

Body: Partial of `{ name, baseUrl, model, apiKey, isActive }`

**200:** `ProviderConfigDTO`
**404:** Not found

---

### 2.19 POST /api/v1/settings/providers/[id]/test

Test koneksi provider. **Auth required.** Harus own.

**200:** `{ ok: true, latencyMs, model }`
**400/500:** Provider error

---

### 2.20 POST /api/v1/settings/providers/[id]/delete

Hapus provider config. **Auth required.** Harus own.

**204:** No Content
**404:** Not found

---

### 2.21 GET /api/v1/dashboard/stats

Statistik dashboard user. **Auth required.**

**200:** `{ totalProjects, totalProviders, recentGenerations, ... }`

---

### 2.22 POST /api/v1/upload

Upload file referensi gambar. **Auth required.** `multipart/form-data`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | Yes | image/png, jpeg, gif, webp, svg. Max 10MB |
| `tipe` | string | Yes | `tokoh` or `background` or `prop` or `accessory` or `environment` or `other` |
| `label` | string | No | Deskripsi label |
| `projectId` | number | No | Bila absent = orphaned (attached later) |

**201:** `{ id, filename, url, tipe, label, projectId, mimeType, sizeBytes }`

---

### 2.23 DELETE /api/v1/upload

Hapus file referensi. **Auth required.** Query: `projectId`, `name`.

**204:** No Content
**404:** Not found

---

### 2.24 POST /api/v1/upload/classify

Klasifikasi role gambar via AI. **Auth required.**

Body: `{ imageUrl, filename }` or `multipart/form-data`

**200:** `{ role: AssetRole, label, confidence, description }`

---

### 2.25 GET /api/v1/health

Health check. **Tidak perlu auth.**

**200:** `{ status: "ok", db: "ok", time: "ISO string" }`
**503:** `{ status: "degraded", db: "fail", time }`

---

## 3. V3 Changes (To-Do in Generate Route)

| # | Change | Endpoint | Detail |
|---|---|---|---|
| V3-01 | Persist `audio_specs` | POST /generate | INSERT into `scene_audio` per scene |
| V3-02 | Persist `color_palette`, `technical` | POST /generate | ALTER image_prompts + save 2 extra cols |
| V3-03 | Persist `voiceover_speaker` | POST /generate | ALTER scenes + save speaker name |
| V3-04 | Fix `sceneId` linkage | POST /generate | Link image_prompts to actual scene row |
| V3-05 | Persist voice fields | POST /generate | voice_type, voice_emotion, etc. already in scenes schema — verify INSERT |

---

## 4. Auth Flow

1. **Register:** POST /api/v1/register -> creates user + bcrypt hash
2. **Login:** NextAuth v5 credential provider -> sets session cookie
3. **All /api/v1/* (except register, health):** requires valid session cookie
4. **User isolation:** all queries filter by `userId` from session
5. **API keys:** AES-256-GCM encrypted at rest, decrypted on-demand for LLM calls
