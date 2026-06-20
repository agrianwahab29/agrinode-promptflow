# API Contract — PromptFlow V3

> **Versi:** 3.0
> **Dibuat:** 2026-06-21
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `PRD.md V2.0` + `SRS.md V2.0` + `PROJECT_ARCHITECTURE.md V2.0` + `DATABASE_SCHEMA.md V2.0` + `RAG-CONTEXT.md` + `API_CONTRACT.md V2.0`
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **Catatan:** OVERWRITE V2.0. V3 mempertahankan semua 23 endpoint V2 + menambah 5 endpoint baru (scene_audio CRUD + theme PATCH) + perubahan response pada generate, scenes, image-prompts, export. Semua perubahan V3 ADDITIVE — tidak ada endpoint V2 yang dihapus atau breaking.

---

## Daftar Isi

1. Ringkasan API + Base URL + Environment + Versioning
2. Autentikasi & Otorisasi
3. Konvensi Umum
4. Pagination, Sorting, Filtering, Searching
5. Daftar Endpoint (Tabel Ringkas)
6. Detail Endpoint per Grup
7. SSE Event Protocol (POST /api/v1/generate)
8. Schemas (Zod V3 Extended)
9. Error Envelope
10. Rate Limiting
11. Header Standar, CORS, Keamanan
12. Backward-Compat & Deprecation
13. Webhook / Async
14. Daftar Status Code
15. Changelog V2 to V3
16. Asumsi API + Referensi

---

## 1. Ringkasan API + Base URL + Environment + Versioning

### 1.1 Ringkasan

PromptFlow V3 = web app fullstack Next.js App Router. API = **Route Handlers** (`src/app/api/v1/*/route.ts`) + **Server Actions** (mutation dari Client Component). Response utama = **JSON** untuk CRUD/setting/upload/export/classify/theme; **SSE (`text/event-stream`)** untuk endpoint generate yang memanggil LLM streaming.

| Aspek | Nilai | Bukti |
|---|---|---|
| Tipe API | REST (Route Handlers) + Server Actions + SSE streaming | `SRS.md V2.0 S4.1` |
| Format request | `application/json` (CRUD/setting/generate/classify/theme), `multipart/form-data` (upload) | `SRS.md V2.0 S8` |
| Format response | `application/json` (CRUD/setting/theme/audio), `text/event-stream` (generate), `text/markdown` (export) | `SRS.md V2.0 S8.4` |
| Auth | NextAuth.js session cookie (JWT strategy) | `SRS.md V2.0 S10.1 SEC-11` |
| Multi-provider LLM | Server-side only via `createOpenAICompatible`. API key dienkripsi at rest | `RAG-CONTEXT.md S5.1` |
| V3 Changes | +5 endpoint baru, response extended V3 fields | `PRD.md V2.0 S3.1`, `SRS.md V2.0 S5.1` |

### 1.2 Base URL + Environment

| Environment | Base URL | Catatan | Bukti |
|---|---|---|---|
| Dev (lokal) | `http://localhost:3000/api/v1` | Next.js dev server | `RAG-CONTEXT.md S5.2` |
| Staging | `https://<staging>.vercel.app/api/v1` | Vercel preview | `RAG-CONTEXT.md S2.1` |
| Prod | `https://<prod-domain>/api/v1` | Vercel production, HTTPS | `SRS.md V2.0 S10.1 SEC-09` |

### 1.3 Versioning

| Strategi | Pilihan | Justifikasi | Bukti |
|---|---|---|---|
| **URI prefix** `/api/v1/*` | **DIPILIH** | Eksplisit, cache-friendly | `API_CONTRACT.md V2.0 S1.3` |

- V3 changes = SEMUA additive — tetap di `/api/v1/*`. Tidak perlu `/api/v2/*`.
- Breaking change = bump mayor. Non-breaking tetap v1.

---

## 2. Autentikasi & Otorisasi

### 2.1 Skema Autentikasi

| Aspek | Nilai | Bukti |
|---|---|---|
| Mekanisme | NextAuth.js (Auth.js v5+) credentials provider | `SRS.md V2.0 S4.1, S10.1 SEC-11` |
| Token/session | JWT cookie session | `RAG-CONTEXT.md S5.3` |
| Cara dapat session | POST `/api/v1/auth/[...nextauth]` | `SRS.md V2.0 S7.1` |
| Masa berlaku | NextAuth default (JWT auto-refresh) | ASUMSI |
| Refresh | NextAuth JWT auto-refresh bila session active | ASUMSI |

### 2.2 Protected Routes

Middleware `src/middleware.ts` proteksi:
- Pages: `/projects`, `/projects/[id]`, `/settings`, `/generate`, `/dashboard`
- API: `/api/v1/*` kecuali `/api/v1/auth/*` dan `/api/v1/health`
- Public: `/login`, `/register`, `/api/auth`, `/api/v1/health`

Ownership check: `project.user_id === session.user.id`. User hanya akses resource miliknya.

### 2.3 RBAC / Scope per Endpoint (V3)

| Endpoint | Auth | Scope | V3 Change | Bukti |
|---|---|---|---|---|
| `POST /api/v1/auth/[...nextauth]` | Public | NextAuth handler | Tetap | `SRS.md V2.0 S7.1` |
| `GET /api/v1/auth/session` | Session | Ambil session | Tetap | ASUMSI |
| `GET /api/v1/health` | Public | Health check | Tetap | ASUMSI |
| `GET /api/v1/projects` | wajib | Filter user_id | Tetap | `PRD.md V2.0 S9.2` |
| `POST /api/v1/projects` | wajib | Bind user_id | Tetap | `PRD.md V2.0 S9.2` |
| `GET /api/v1/projects/[id]` | wajib | Ownership | Tetap | `SRS.md V2.0 S7.1` |
| `PATCH /api/v1/projects/[id]` | wajib | Ownership | Tetap | `SRS.md V2.0 S7.1` |
| `DELETE /api/v1/projects/[id]` | wajib | Ownership (soft delete) | Tetap | `SRS.md V2.0 S7.1` |
| **`PATCH /api/v1/projects/[id]/theme`** | wajib | Ownership | **NEW V3** | `PRD.md V2.0 FR-V3-01` |
| `POST /api/v1/generate` | wajib | Provider config milik user | **V3: +V3 fields** | `PRD.md V2.0 FR-V3-02..05` |
| `GET /api/v1/settings/providers` | wajib | Filter user_id | Tetap | `SRS.md V2.0 S7.1` |
| `POST /api/v1/settings/providers` | wajib | Bind user_id | Tetap | `SRS.md V2.0 S7.1` |
| `PATCH /api/v1/settings/providers/[id]` | wajib | Ownership | Tetap | `SRS.md V2.0 S7.1` |
| `DELETE /api/v1/settings/providers/[id]` | wajib | Ownership | Tetap | `SRS.md V2.0 S7.1` |
| `POST /api/v1/settings/providers/[id]/test` | wajib | Ownership | Tetap | ASUMSI |
| `POST /api/v1/upload` | wajib | Bind project | Tetap | `SRS.md V2.0 S6.1` |
| `POST /api/v1/upload/classify` | wajib | Ownership asset ref | Tetap | `PRD.md V2.0 FR-V2-02` |
| `DELETE /api/v1/upload` | wajib | Ownership project | Tetap | `SRS.md V2.0 S7.1` |
| `GET /api/v1/projects/[id]/export` | wajib | Ownership | **V3: +V3 fields** | `PRD.md V2.0 FR-V3-09` |
| `GET /api/v1/projects/[id]/characters` | wajib | Ownership | Tetap | `DATABASE_SCHEMA.md V2.0 S4.5` |
| `GET /api/v1/projects/[id]/scenes` | wajib | Ownership | **V3: +11 V3 fields** | `PRD.md V2.0 FR-V3-02,04,05` |
| `GET /api/v1/projects/[id]/image-prompts` | wajib | Ownership | **V3: +5 V3 fields** | `PRD.md V2.0 FR-V3-03` |
| `GET /api/v1/projects/[id]/logs` | wajib | Ownership | Tetap | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `GET /api/v1/dashboard/stats` | wajib | Filter user_id | Tetap | `PRD.md V2.0 FR-V2-06` |
| **`GET /api/v1/projects/[id]/scenes/[sceneId]/audio`** | wajib | Ownership via project | **NEW V3** | `PRD.md V2.0 FR-V3-05` |
| **`POST /api/v1/projects/[id]/scenes/[sceneId]/audio`** | wajib | Ownership via project | **NEW V3** | `PRD.md V2.0 FR-V3-05` |
| **`PATCH /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`** | wajib | Ownership via project | **NEW V3** | `PRD.md V2.0 FR-V3-05` |
| **`DELETE /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`** | wajib | Ownership via project | **NEW V3** | `PRD.md V2.0 FR-V3-05` |

---

## 3. Konvensi Umum

### 3.1 Format & Casing

| Aspek | Nilai | Bukti |
|---|---|---|
| Content-Type request | `application/json; charset=utf-8` (CRUD/generate/classify/theme/audio), `multipart/form-data` (upload) | `SRS.md V2.0 S8` |
| Content-Type response | `application/json` (CRUD/theme/audio), `text/event-stream` (generate), `text/markdown` (export) | `SRS.md V2.0 S8.4` |
| Casing field JSON | **camelCase** untuk request/response. DB snake_case, mapping di repository | ASUMSI |
| Casing PromptPackageSchema | snake_case-ish: `character_profiles`, `image_prompts`, `voiceover_script`, `moral_message` | `PRD.md V2.0 S8.2` |
| Encoding | UTF-8 | ASUMSI |
| Date/time | ISO-8601 UTC di JSON. DB simpan unix epoch — mapping di repository | ASUMSI |
| ID | integer auto-increment (DB) -> number di JSON | `DATABASE_SCHEMA.md V2.0 S4` |

### 3.2 Envelope Respons Sukses

**Single resource:**
```json
{ "data": { } }
```

**List paginated:**
```json
{ "data": [], "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

**Generate (SSE):** Lihat §7.
**Export:** Body = file content, header `Content-Disposition: attachment`.

### 3.3 Error Envelope

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "audioType wajib diisi", "details": { "field": "audioType" } },
  "traceId": "req_abc123"
}
```

| Field | Tipe | Wajib | Deskripsi | Bukti |
|---|---|---|---|---|
| `error.code` | string | YA | Kode error stabil (§14) | `SRS.md V2.0 S8.5` |
| `error.message` | string | YA | Pesan bahasa aktif | `SRS.md V2.0 S8.5` |
| `error.details` | object | TIDAK | Detail tambahan | `SRS.md V2.0 S8.5` |
| `traceId` | string | TIDAK | ID trace debugging | ASUMSI |

### 3.4 Idempotency

| Endpoint | Idempotent? | Mekanisme |
|---|---|---|
| GET, PATCH, DELETE | Ya (by design) | Resource by id |
| POST /api/v1/projects | Tidak | Record baru |
| POST /api/v1/generate | Tidak | Log baru + overwrite result_json |
| POST /api/v1/upload | Tidak | Asset references baru |
| POST /api/v1/upload/classify | Ya (by assetReferenceId) | Cached |
| POST /api/v1/settings/providers | Tidak (unique constraint) | 409 |
| **POST .../audio** | Tidak | Record baru |

### 3.5 Timezone

Semua timestamp = ISO-8601 UTC (`Z` suffix). DB = unix epoch. ASUMSI.

---

## 4. Pagination, Sorting, Filtering, Searching

### 4.1 Pagination

| Param | Tipe | Default | Validasi |
|---|---|---|---|
| `page` | integer | 1 | `>= 1` |
| `limit` | integer | 20 | `1..100` |

### 4.2 Sorting

| Param | Format | Contoh |
|---|---|---|
| `sort` | `<field>:asc\|desc` | `sort=createdAt:desc` |

### 4.3 Filtering

| Endpoint | Param filter | Contoh |
|---|---|---|
| `GET /api/v1/projects` | `status`, `durationType` | `?status=complete` |
| `GET .../image-prompts` | `tipe`, `sceneId` | `?tipe=tokoh&sceneId=5` |
| `GET .../characters` | `peran` | `?peran=utama` |
| `GET .../logs` | `status`, `provider` | `?status=success` |
| `GET /api/v1/dashboard/stats` | `range` | `?range=30d` |
| **`GET .../audio`** | `audioType` | `?audioType=background_music` |

### 4.4 Searching

| Endpoint | Param | Behavior |
|---|---|---|
| `GET /api/v1/projects` | `q` | LIKE search di `title` | ASUMSI |

---

## 5. Daftar Endpoint (Tabel Ringkas)

Total **28 endpoint** (23 V2 + 5 V3 baru):

| # | Method | Path | Nama | Auth | Versi | Ringkasan | Fitur PRD |
|---|---|---|---|---|---|---|---|
| 1 | GET/POST | `/api/v1/auth/[...nextauth]` | NextAuth handler | Public | V1 | Login/logout/session | FR-18 |
| 2 | GET | `/api/v1/auth/session` | Get session | Session | V1 | Ambil session | ASUMSI |
| 3 | GET | `/api/v1/health` | Health check | Public | V1 | Status app | ASUMSI |
| 4 | GET | `/api/v1/projects` | List projects | wajib | V1+V2 | Paginate per user | FR-15 |
| 5 | POST | `/api/v1/projects` | Create project | wajib | V1+V2 | +storyDescription | FR-15 |
| 6 | GET | `/api/v1/projects/[id]` | Detail project | wajib | V1 | By id + ownership | FR-15 |
| 7 | PATCH | `/api/v1/projects/[id]` | Update project | wajib | V1 | Update metadata | FR-15 |
| 8 | DELETE | `/api/v1/projects/[id]` | Delete project | wajib | V1 | Soft delete | FR-15 |
| 9 | **PATCH** | **`/api/v1/projects/[id]/theme`** | **Update theme** | wajib | **NEW V3** | **Theme preference** | **FR-V3-01** |
| 10 | POST | `/api/v1/generate` | Generate prompt package | wajib | **V3** | **SSE + V3 fields** | **FR-V3-02..05** |
| 11 | GET | `/api/v1/settings/providers` | List providers | wajib | V1 | Provider config | FR-13 |
| 12 | POST | `/api/v1/settings/providers` | Add provider | wajib | V1 | Save config | FR-13 |
| 13 | PATCH | `/api/v1/settings/providers/[id]` | Update provider | wajib | V1 | Update config | FR-13 |
| 14 | DELETE | `/api/v1/settings/providers/[id]` | Delete provider | wajib | V1 | Hapus config | FR-13 |
| 15 | POST | `/api/v1/settings/providers/[id]/test` | Test connection | wajib | V1 | Test reachability | ASUMSI |
| 16 | POST | `/api/v1/upload` | Upload reference | wajib | V2 | projectId opsional | FR-17 |
| 17 | POST | `/api/v1/upload/classify` | AI classify | wajib | V2 | Vision LLM | FR-V2-02 |
| 18 | DELETE | `/api/v1/upload` | Delete reference | wajib | V1 | Hapus Blob | FR-17 |
| 19 | GET | `/api/v1/projects/[id]/export` | Export project | wajib | **V3** | **JSON + MD V3** | **FR-V3-09** |
| 20 | GET | `/api/v1/projects/[id]/characters` | List characters | wajib | V1 | Master karakter | FR-07 |
| 21 | GET | `/api/v1/projects/[id]/scenes` | List scenes | wajib | **V3** | **+11 V3 fields** | **FR-V3-02,04,05** |
| 22 | GET | `/api/v1/projects/[id]/image-prompts` | List image prompts | wajib | **V3** | **+5 V3 fields** | **FR-V3-03** |
| 23 | GET | `/api/v1/projects/[id]/logs` | List generation logs | wajib | V1+V2 | +logsJson | FR-V2-05 |
| 24 | GET | `/api/v1/dashboard/stats` | Dashboard stats | wajib | V2 | Enriched data | FR-V2-06 |
| 25 | **GET** | **`/api/v1/projects/[id]/scenes/[sceneId]/audio`** | **List scene audio** | wajib | **NEW V3** | **Audio per scene** | **FR-V3-05** |
| 26 | **POST** | **`/api/v1/projects/[id]/scenes/[sceneId]/audio`** | **Create scene audio** | wajib | **NEW V3** | **Tambah audio** | **FR-V3-05** |
| 27 | **PATCH** | **`/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`** | **Update scene audio** | wajib | **NEW V3** | **Update audio** | **FR-V3-05** |
| 28 | **DELETE** | **`/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`** | **Delete scene audio** | wajib | **NEW V3** | **Hapus audio** | **FR-V3-05** |

---

## 6. Detail Endpoint per Grup

### 6.1 Auth — `/api/v1/auth/*` (V1 — tetap)

#### 6.1.1 GET/POST `/api/v1/auth/[...nextauth]`

NextAuth handler (catch-all). Lihat `API_CONTRACT.md V2.0 §6.1.1`.

#### 6.1.2 GET `/api/v1/auth/session`

Lihat `API_CONTRACT.md V2.0 §6.1.2`.

### 6.2 Health — `/api/v1/health` (V1 — tetap)

Lihat `API_CONTRACT.md V2.0 §6.2`.

### 6.3 Projects — `/api/v1/projects`

#### 6.3.1 GET `/api/v1/projects`

Lihat `API_CONTRACT.md V2.0 §6.3.1`. Tidak ada perubahan V3.

#### 6.3.2 POST `/api/v1/projects`

Lihat `API_CONTRACT.md V2.0 §6.3.2`. Tidak ada perubahan V3.

#### 6.3.3 GET `/api/v1/projects/[id]`

Lihat `API_CONTRACT.md V2.0 §6.3.3`. Tidak ada perubahan V3.

#### 6.3.4 PATCH `/api/v1/projects/[id]`

Lihat `API_CONTRACT.md V2.0 §6.3.4`. Tidak ada perubahan V3.

#### 6.3.5 DELETE `/api/v1/projects/[id]`

Lihat `API_CONTRACT.md V2.0 §6.3.5`. Tidak ada perubahan V3.

#### 6.3.6 **PATCH `/api/v1/projects/[id]/theme`** — NEW V3

Update theme preference project (server-side persistence, sync dengan next-themes client-side).

| Aspek | Detail | Bukti |
|---|---|---|
| Method | PATCH | `PRD.md V2.0 FR-V3-01` |
| Path | `/api/v1/projects/[id]/theme` | `SRS.md V2.0 S5.1` |
| Auth | Wajib (session) | `SRS.md V2.0 S10.1 SEC-11` |
| Ownership | `project.user_id === session.user.id` | `DATABASE_SCHEMA.md V2.0 S5.2` |
| DB Table | `projects` (+1 field: `theme_preference`) | `DATABASE_SCHEMA.md V2.0 S4.3` |

**Request Body:**

| Field | Tipe | Wajib | Validasi | Default | Contoh |
|---|---|---|---|---|---|
| `theme` | string | YA | enum: `dark`, `light`, `system` | `'dark'` | `"light"` |

```json
{ "theme": "light" }
```

**Response 200 OK:**
```json
{
  "data": {
    "id": 1,
    "themePreference": "light",
    "updatedAt": "2026-06-21T12:00:00.000Z"
  }
}
```

**Response Error:**

| Status | Code | Kapan |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `theme` tidak valid |
| 401 | `UNAUTHORIZED` | Tidak ada session |
| 404 | `NOT_FOUND` | Project tidak ditemukan |
| 500 | `INTERNAL` | DB error |

**Relasi DB:** `projects.theme_preference` (TEXT, nullable, default `'dark'`)
**Fitur PRD:** FR-V3-01 (Light Theme Support)
**SRS:** F-V3-01

---

### 6.4 Generate — `/api/v1/generate` (V3 Extended)

#### 6.4.1 POST `/api/v1/generate`

Generate prompt package via LLM (SSE streaming). V3: response menyertakan 5 metadata baru per scene.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `SRS.md V2.0 S5.1` |
| Auth | Wajib (session) | `SRS.md V2.0 S10.1 SEC-11` |
| Content-Type | `application/json` | `SRS.md V2.0 S8` |
| Response | `text/event-stream` (SSE) | `SRS.md V2.0 S8.4` |
| Max Duration | 300s (Vercel Hobby) | `generate/route.ts:19` |

**Request Body:** Sama dengan V2 (tidak berubah). Lihat `API_CONTRACT.md V2.0 §6.4.1`.

**SSE `done` Event — V3 Extended Response:**

```json
{
  "result": {
    "character_profiles": [{ "nama": "...", "peran": "..." }],
    "scenes": [{
      "order": 1,
      "description": "Scene 1: Pembuka",
      "voiceover_script": "Dahulu kala...",
      "image_prompts": [{ "target": "...", "prompt_text": "...", "reference_filename": null }],
      "supporting_characters": [],
      "transitionType": "dissolve",
      "transitionDurationMs": 1500,
      "transitionEasing": "ease_in_out",
      "transitionDirection": "forward",
      "voiceType": "narrator",
      "voiceEmotion": "calm",
      "voiceSpeed": 1.0,
      "voicePitch": "auto",
      "durationSeconds": 15,
      "scenePacing": "normal",
      "sceneMood": "peaceful",
      "audio": [{
        "audioType": "background_music",
        "description": "Gamelan lembut mengalun pelan",
        "timing": "throughout",
        "durationSeconds": 15,
        "volume": 0.7,
        "fadeInMs": 500,
        "fadeOutMs": 1000,
        "musicGenre": "ambient",
        "musicMood": "peaceful",
        "musicTempoBpm": 72,
        "musicInstruments": "gamelan,flute",
        "musicVolume": 0.7,
        "sfxList": null,
        "ambientType": null,
        "ambientVolume": null
      }]
    }],
    "image_prompts": {
      "characters": [{
        "target": "Karakter Utama",
        "prompt_text": "Anak perempuan 10 tahun... golden hour rim lighting... 3D Pixar-style... 4K ultra-detailed",
        "reference_filename": null,
        "composition": "{\"foreground\":\"character\",\"midground\":\"trees\",\"background\":\"sky\"}",
        "lighting": "{\"key\":\"golden hour\",\"fill\":\"soft ambient\",\"rim\":\"strong\",\"style\":\"cinematic\"}",
        "camera": "{\"angle\":\"low angle\",\"lens\":\"35mm\",\"depth_of_field\":\"f/2.8\"}",
        "moodAtmosphere": "Mysterious, hopeful atmosphere",
        "styleReferences": "3D Pixar, Studio Ghibli"
      }],
      "backgrounds": []
    },
    "supporting_characters": [],
    "moral_message": "Keberanian dimulai dari rasa ingin tahu."
  },
  "warnings": [],
  "generationLogId": 1
}
```

**Field V3 per scene:**

| Field | Tipe | Enum/Range | Default | Deskripsi | Fitur | Bukti |
|---|---|---|---|---|---|---|
| `transitionType` | string | `cut`, `dissolve`, `fade_to_black`, `fade_to_white`, `wipe`, `match_cut` | `'cut'` | Jenis transisi | F-V3-02 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `transitionDurationMs` | integer | 0–5000 | `0` | Durasi transisi (ms) | F-V3-02 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `transitionEasing` | string | `linear`, `ease_in`, `ease_out`, `ease_in_out` | `'linear'` | Easing function | F-V3-02 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `transitionDirection` | string | `forward`, `backward`, `loop` | `'forward'` | Arah transisi | F-V3-02 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `voiceType` | string | `child`, `teen`, `adult_male`, `adult_female`, `elderly_male`, `elderly_female`, `narrator` | `'narrator'` | Tipe suara | F-V3-04 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `voiceEmotion` | string | `neutral`, `happy`, `sad`, `excited`, `calm`, `dramatic` | `'neutral'` | Emosi suara | F-V3-04 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `voiceSpeed` | float | 0.5–2.0 | `1.0` | Kecepatan bicara | F-V3-04 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `voicePitch` | string | `low`, `medium`, `high`, `auto` | `'auto'` | Pitch suara | F-V3-04 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `durationSeconds` | integer | > 0 | `null` | Durasi scene (detik) | F-V3-05 | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `scenePacing` | string | `fast`, `normal`, `slow` | `'normal'` | Tempo scene | ASUMSI | `DATABASE_SCHEMA.md V2.0 S4.8` |
| `sceneMood` | string | `cheerful`, `dramatic`, `tense`, `peaceful`, `mysterious` | `null` | Suasana scene | ASUMSI | `DATABASE_SCHEMA.md V2.0 S4.8` |

**Field V3 per audio entry:**

| Field | Tipe | Enum/Range | Default | Deskripsi | Bukti |
|---|---|---|---|---|---|
| `audioType` | string | `background_music`, `sfx`, `ambient`, `music_cue`, `transition_audio` | — | Tipe audio | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `description` | string | — | — | Deskripsi audio | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `timing` | string | `start`, `throughout`, `end`, `specific_moment` | `'throughout'` | Kapan audio dimainkan | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `durationSeconds` | integer | > 0 | `null` | Durasi audio | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `volume` | float | 0.0–1.0 | `0.7` | Volume umum | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `fadeInMs` | integer | >= 0 | `0` | Fade in (ms) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `fadeOutMs` | integer | >= 0 | `0` | Fade out (ms) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `musicGenre` | string | — | `null` | Genre musik (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `musicMood` | string | — | `null` | Mood musik (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `musicTempoBpm` | integer | 60–200 | `null` | Tempo BPM (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `musicInstruments` | string | — | `null` | Instrumen (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `musicVolume` | float | 0.0–1.0 | `0.7` | Volume musik (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `sfxList` | string (JSON) | — | `null` | JSON array SFX (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `ambientType` | string | `forest`, `city`, `rain`, `wind`, `ocean`, `room` | `null` | Tipe ambient (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |
| `ambientVolume` | float | 0.0–1.0 | `0.5` | Volume ambient (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.10` |

**Field V3 per image prompt:**

| Field | Tipe | Default | Deskripsi | Bukti |
|---|---|---|---|---|
| `composition` | string (JSON) | `null` | JSON: `{foreground, midground, background}` (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `lighting` | string (JSON) | `null` | JSON: `{key, fill, rim, style}` (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `camera` | string (JSON) | `null` | JSON: `{angle, lens, depth_of_field}` (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `moodAtmosphere` | string | `null` | Emotional tone + atmosphere | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `styleReferences` | string | `null` | Comma-separated style references | `DATABASE_SCHEMA.md V2.0 S4.9` |

---

### 6.5 Settings — `/api/v1/settings/*` (V1 — tetap)

Lihat `API_CONTRACT.md V2.0 §6.5`. Tidak ada perubahan V3.

### 6.6 Upload — `/api/v1/upload` (V1+V2 — tetap)

Lihat `API_CONTRACT.md V2.0 §6.6`. Tidak ada perubahan V3.

### 6.7 Export — `/api/v1/projects/[id]/export` (V3 Extended)

#### 6.7.1 GET `/api/v1/projects/[id]/export`

Export project sebagai JSON atau Markdown. V3: JSON include V3 fields + Markdown include V3 sections.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md V2.0 S5.1` |
| Auth | Wajib (session) | `SRS.md V2.0 S10.1 SEC-11` |
| Query param | `format=json\|markdown` | `API_CONTRACT.md V2.0 §6.7` |

**V3 JSON Export — Tambahan Fields per scene:**
```json
{
  "scenes": [{
    "order": 1,
    "transitionType": "dissolve",
    "transitionDurationMs": 1500,
    "transitionEasing": "ease_in_out",
    "transitionDirection": "forward",
    "voiceType": "narrator",
    "voiceEmotion": "calm",
    "voiceSpeed": 1.0,
    "voicePitch": "auto",
    "durationSeconds": 15,
    "scenePacing": "normal",
    "sceneMood": "peaceful",
    "audio": [{ "audioType": "background_music", "description": "...", "timing": "throughout", "volume": 0.7 }],
    "image_prompts": [{ "target": "...", "prompt_text": "...", "composition": "...", "lighting": "...", "camera": "...", "moodAtmosphere": "...", "styleReferences": "..." }]
  }]
}
```

**V3 Markdown Export — Tambahan Sections:**

| Section | Isi | Bukti |
|---|---|---|
| `## Scene Transitions` | Tabel: Scene \| Type \| Duration \| Easing \| Direction | `PRD.md V2.0 FR-V3-09` |
| `## Voice Specifications` | Tabel: Scene \| Voice Type \| Emotion \| Speed \| Pitch | `PRD.md V2.0 FR-V3-09` |
| `## Audio Specifications` | Tabel: Scene \| Audio Type \| Description \| Timing \| Volume \| Fade | `PRD.md V2.0 FR-V3-09` |
| `## Image Prompt Layers` | Per prompt: 8 layer breakdown | `PRD.md V2.0 FR-V3-09` |

**Response Error:**

| Status | Code | Kapan |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Format bukan json/markdown |
| 401 | `UNAUTHORIZED` | Tidak ada session |
| 404 | `NOT_FOUND` | Project tidak ditemukan |
| 409 | `CONFLICT` | Project belum di-generate |

**Fitur PRD:** FR-V3-09
**SRS:** F-V3-09

---

### 6.8 Characters — `/api/v1/projects/[id]/characters` (V1 — tetap)

Lihat `API_CONTRACT.md V2.0 §6.8`. Tidak ada perubahan V3.

### 6.9 Scenes — `/api/v1/projects/[id]/scenes` (V3 Extended)

#### 6.9.1 GET `/api/v1/projects/[id]/scenes`

V3: response menyertakan 11 field V3 per scene.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md V2.0 S5.1` |
| Auth | Wajib (session) | `SRS.md V2.0 S10.1 SEC-11` |
| Ownership | `project.user_id === session.user.id` | `DATABASE_SCHEMA.md V2.0 S5.2` |

**Response 200 OK — V3 Extended:**
```json
{
  "data": [{
    "id": 1,
    "projectId": 1,
    "orderNo": 1,
    "description": "Scene 1: Pembuka di hutan",
    "voiceoverScript": "Dahulu kala, di sebuah hutan tropis yang rimbun...",
    "createdAt": "2026-06-21T12:00:00.000Z",
    "transitionType": "dissolve",
    "transitionDurationMs": 1500,
    "transitionEasing": "ease_in_out",
    "transitionDirection": "forward",
    "voiceType": "narrator",
    "voiceEmotion": "calm",
    "voiceSpeed": 1.0,
    "voicePitch": "auto",
    "durationSeconds": 15,
    "scenePacing": "normal",
    "sceneMood": "peaceful"
  }]
}
```

| Field V3 | Tipe | Default | Deskripsi | Fitur |
|---|---|---|---|---|
| `transitionType` | string | `'cut'` | Jenis transisi (enum 6) | F-V3-02 |
| `transitionDurationMs` | integer | `0` | Durasi transisi (ms) | F-V3-02 |
| `transitionEasing` | string | `'linear'` | Easing function (enum 4) | F-V3-02 |
| `transitionDirection` | string | `'forward'` | Arah transisi (enum 3) | F-V3-02 |
| `voiceType` | string | `'narrator'` | Tipe suara (enum 7) | F-V3-04 |
| `voiceEmotion` | string | `'neutral'` | Emosi suara (enum 6) | F-V3-04 |
| `voiceSpeed` | float | `1.0` | Kecepatan bicara (0.5–2.0) | F-V3-04 |
| `voicePitch` | string | `'auto'` | Pitch suara (enum 4) | F-V3-04 |
| `durationSeconds` | integer | `null` | Durasi scene (detik) | F-V3-05 |
| `scenePacing` | string | `'normal'` | Tempo scene (enum 3) | ASUMSI |
| `sceneMood` | string | `null` | Suasana scene (enum 5) | ASUMSI |

**Relasi DB:** `scenes` table (+11 V3 fields)
**Fitur PRD:** FR-V3-02, FR-V3-04, FR-V3-05

---

### 6.10 Image Prompts — `/api/v1/projects/[id]/image-prompts` (V3 Extended)

#### 6.10.1 GET `/api/v1/projects/[id]/image-prompts`

V3: response menyertakan composition/lighting/camera/moodAtmosphere/styleReferences.

**Response 200 OK — V3 Extended:**
```json
{
  "data": [{
    "id": 1,
    "projectId": 1,
    "sceneId": 1,
    "tipe": "tokoh",
    "target": "Karakter Utama",
    "promptText": "Anak perempuan 10 tahun... golden hour rim lighting... 3D Pixar-style... 4K",
    "referenceFilename": null,
    "createdAt": "2026-06-21T12:00:00.000Z",
    "composition": "{\"foreground\":\"character\",\"midground\":\"trees\",\"background\":\"sky\"}",
    "lighting": "{\"key\":\"golden hour\",\"fill\":\"soft ambient\",\"rim\":\"strong\",\"style\":\"cinematic\"}",
    "camera": "{\"angle\":\"low angle\",\"lens\":\"35mm\",\"depth_of_field\":\"f/2.8\"}",
    "moodAtmosphere": "Mysterious, hopeful atmosphere",
    "styleReferences": "3D Pixar, Studio Ghibli"
  }]
}
```

| Field V3 | Tipe | Default | Deskripsi | Bukti |
|---|---|---|---|---|
| `composition` | string (JSON) | `null` | JSON: `{foreground, midground, background}` (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `lighting` | string (JSON) | `null` | JSON: `{key, fill, rim, style}` (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `camera` | string (JSON) | `null` | JSON: `{angle, lens, depth_of_field}` (ASUMSI) | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `moodAtmosphere` | string | `null` | Emotional tone + atmosphere | `DATABASE_SCHEMA.md V2.0 S4.9` |
| `styleReferences` | string | `null` | Comma-separated style references | `DATABASE_SCHEMA.md V2.0 S4.9` |

**Relasi DB:** `image_prompts` table (+5 V3 fields)
**Fitur PRD:** FR-V3-03

---

### 6.11 Generation Logs — `/api/v1/projects/[id]/logs` (V1+V2 — tetap)

Lihat `API_CONTRACT.md V2.0 §6.11`.

### 6.12 Dashboard — `/api/v1/dashboard/stats` (V2 — tetap)

Lihat `API_CONTRACT.md V2.0 §6.12`.

### 6.13 **Scene Audio CRUD — NEW V3** (4 endpoints)

#### 6.13.1 GET `/api/v1/projects/[id]/scenes/[sceneId]/audio`

List audio entries untuk scene.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md V2.0 S5.1` |
| Auth | Wajib (session) | `SRS.md V2.0 S10.1 SEC-11` |
| Ownership | Via project | `DATABASE_SCHEMA.md V2.0 S5.2` |
| Response 200 | `{ "data": [ ...audio_entries ] }` | `SRS.md V2.0 S5.2` |

**Path Parameters:**

| Param | Tipe | Wajib | Validasi |
|---|---|---|---|
| `id` | integer | YA | project exists + ownership |
| `sceneId` | integer | YA | scene exists + belongs to project |

**Query Parameters:**

| Param | Tipe | Default | Validasi |
|---|---|---|---|
| `audioType` | string | — | enum: `background_music`, `sfx`, `ambient`, `music_cue`, `transition_audio` |

**Response 200 OK:**
```json
{
  "data": [{
    "id": 1,
    "projectId": 1,
    "sceneId": 1,
    "audioType": "background_music",
    "description": "Gamelan lembut mengalun pelan",
    "timing": "throughout",
    "durationSeconds": 15,
    "volume": 0.7,
    "fadeInMs": 500,
    "fadeOutMs": 1000,
    "musicGenre": "ambient",
    "musicMood": "peaceful",
    "musicTempoBpm": 72,
    "musicInstruments": "gamelan,flute",
    "musicVolume": 0.7,
    "sfxList": null,
    "ambientType": null,
    "ambientVolume": null,
    "createdAt": "2026-06-21T12:00:00.000Z"
  }]
}
```

**Relasi DB:** `scene_audio` (indexed on `scene_id`)
**Fitur PRD:** FR-V3-05

---

#### 6.13.2 POST `/api/v1/projects/[id]/scenes/[sceneId]/audio`

Buat audio entry baru.

**Request Body:**

| Field | Tipe | Wajib | Validasi | Default | Contoh |
|---|---|---|---|---|---|
| `audioType` | string | YA | enum 5 | — | `"background_music"` |
| `description` | string | YA | min 1 char | — | `"Gamelan lembut"` |
| `timing` | string | TIDAK | enum 4 | `'throughout'` | `"throughout"` |
| `durationSeconds` | integer | TIDAK | > 0 | `null` | `15` |
| `volume` | float | TIDAK | 0.0–1.0 | `0.7` | `0.8` |
| `fadeInMs` | integer | TIDAK | >= 0 | `0` | `500` |
| `fadeOutMs` | integer | TIDAK | >= 0 | `0` | `1000` |
| `musicGenre` | string | TIDAK | — | `null` | `"ambient"` |
| `musicMood` | string | TIDAK | — | `null` | `"peaceful"` |
| `musicTempoBpm` | integer | TIDAK | 60–200 | `null` | `72` |
| `musicInstruments` | string | TIDAK | — | `null` | `"gamelan,flute"` |
| `musicVolume` | float | TIDAK | 0.0–1.0 | `0.7` | `0.7` |
| `sfxList` | string (JSON) | TIDAK | valid JSON | `null` | `"[{\"name\":\"footsteps\"}]"` |
| `ambientType` | string | TIDAK | enum 6 | `null` | `"forest"` |
| `ambientVolume` | float | TIDAK | 0.0–1.0 | `0.5` | `0.5` |

```json
{
  "audioType": "background_music",
  "description": "Gamelan lembut mengalun pelan",
  "timing": "throughout",
  "durationSeconds": 15,
  "volume": 0.7,
  "fadeInMs": 500,
  "fadeOutMs": 1000,
  "musicGenre": "ambient",
  "musicMood": "peaceful",
  "musicTempoBpm": 72,
  "musicInstruments": "gamelan,flute"
}
```

**Response 201 Created:** Object audio lengkap dengan `id`.

**Response Error:**

| Status | Code | Kapan |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body tidak valid |
| 401 | `UNAUTHORIZED` | Tidak ada session |
| 404 | `NOT_FOUND` | Project atau scene tidak ditemukan |
| 500 | `INTERNAL` | DB error |

---

#### 6.13.3 PATCH `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`

Update audio entry (partial update). Semua field opsional.

```json
{ "volume": 0.9, "fadeOutMs": 2000 }
```

**Path Parameters:**

| Param | Tipe | Wajib | Validasi |
|---|---|---|---|
| `id` | integer | YA | project exists + ownership |
| `sceneId` | integer | YA | scene exists + belongs to project |
| `audioId` | integer | YA | audio entry exists + belongs to scene |

**Response 200 OK:** Object audio updated.

**Response Error:**

| Status | Code | Kapan |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body tidak valid |
| 401 | `UNAUTHORIZED` | Tidak ada session |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 500 | `INTERNAL` | DB error |

---

#### 6.13.4 DELETE `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`

Hapus audio entry.

**Path Parameters:** Sama dengan PATCH.

**Response 204 No Content.**

**Response Error:**

| Status | Code | Kapan |
|---|---|---|
| 401 | `UNAUTHORIZED` | Tidak ada session |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 500 | `INTERNAL` | DB error |

---

## 7. SSE Event Protocol (POST /api/v1/generate)

Lihat `API_CONTRACT.md V2.0 §7` untuk protocol lengkap. V3 tidak mengubah SSE protocol — hanya menambah V3 fields di `done` event.

**Events (V3 — unchanged):**

| Event | Data | Deskripsi |
|---|---|---|
| `stage` | `{ stage: string, projectId: number }` | Inisialisasi |
| `progress` | `{ stage: string, ...meta }` | Progres tahap |
| `log` | `{ level, message, timestamp }` | Real-time log |
| `done` | `{ result: PromptPackageV3, warnings, generationLogId }` | Selesai — V3 result |
| `error` | `{ code, message }` | Error |

> V3 tidak menambah stage baru — metadata V3 di-generate bersamaan dalam stage `scenes`.

---

## 8. Schemas (Zod V3 Extended)

### 8.1 SceneSchema Extended

```typescript
// V1+V2 retained
order: z.number().int().positive(),
description: z.string().min(1),
voiceover_script: z.string(),
image_prompts: z.array(ImagePromptItemSchema),

// V3 additions
transitionType: z.enum(['cut','dissolve','fade_to_black','fade_to_white','wipe','match_cut']).default('cut'),
transitionDurationMs: z.number().int().min(0).max(5000).default(0),
transitionEasing: z.enum(['linear','ease_in','ease_out','ease_in_out']).default('linear'),
transitionDirection: z.enum(['forward','backward','loop']).default('forward'),
voiceType: z.enum(['child','teen','adult_male','adult_female','elderly_male','elderly_female','narrator']).default('narrator'),
voiceEmotion: z.enum(['neutral','happy','sad','excited','calm','dramatic']).default('neutral'),
voiceSpeed: z.number().min(0.5).max(2.0).default(1.0),
voicePitch: z.enum(['low','medium','high','auto']).default('auto'),
durationSeconds: z.number().int().positive().optional(),
scenePacing: z.enum(['fast','normal','slow']).default('normal'),
sceneMood: z.enum(['cheerful','dramatic','tense','peaceful','mysterious']).optional(),
audio: z.array(SceneAudioSchema).optional(),
```

Sitasi: `SRS.md V2.0 S4.5`, `PRD.md V2.0 S7.4`, `DATABASE_SCHEMA.md V2.0 S4.8`.

### 8.2 SceneAudioSchema (New)

```typescript
audioType: z.enum(['background_music','sfx','ambient','music_cue','transition_audio']),
description: z.string().min(1),
timing: z.enum(['start','throughout','end','specific_moment']).default('throughout'),
durationSeconds: z.number().int().positive().optional(),
volume: z.number().min(0).max(1).default(0.7),
fadeInMs: z.number().int().min(0).default(0),
fadeOutMs: z.number().int().min(0).default(0),
musicGenre: z.string().optional(),
musicMood: z.string().optional(),
musicTempoBpm: z.number().int().min(60).max(200).optional(),
musicInstruments: z.string().optional(),
musicVolume: z.number().min(0).max(1).default(0.7),
sfxList: z.string().optional(),
ambientType: z.enum(['forest','city','rain','wind','ocean','room']).optional(),
ambientVolume: z.number().min(0).max(1).default(0.5),
```

Sitasi: `SRS.md V2.0 S4.5`, `DATABASE_SCHEMA.md V2.0 S4.10`.

### 8.3 ImagePromptItemSchema Extended

```typescript
// V1+V2 retained
target: z.string(),
prompt_text: z.string(),
reference_filename: z.string().nullable().optional(),

// V3 additions (opsional)
composition: z.string().optional(),
lighting: z.string().optional(),
camera: z.string().optional(),
moodAtmosphere: z.string().nullable().optional(),
styleReferences: z.string().nullable().optional(),
```

Sitasi: `SRS.md V2.0 S4.5`, `DATABASE_SCHEMA.md V2.0 S4.9`.

### 8.4 ThemePreferenceSchema (New)

```typescript
theme: z.enum(['dark', 'light', 'system']).default('dark'),
```

Sitasi: `DATABASE_SCHEMA.md V2.0 S4.3`, `PRD.md V2.0 FR-V3-01`.

### 8.5 ErrorCodeEnum (retained)

```typescript
z.enum([
  'VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND',
  'CONFLICT', 'RATE_LIMITED', 'PROVIDER_ERROR', 'TIMEOUT',
  'INTERNAL', 'BAD_GATEWAY', 'SERVICE_UNAVAILABLE',
  'CLASSIFICATION_ERROR'
])
```

---

## 9. Error Envelope

Lihat §3.3. Contoh V3:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "audioType wajib diisi",
    "details": { "field": "audioType", "required": true }
  },
  "traceId": "req_abc123"
}
```

---

## 10. Rate Limiting

| Aspek | Nilai | Bukti |
|---|---|---|
| Mekanisme | Next.js rate limiting middleware (existing) | `API_CONTRACT.md V2.0 §10` |
| Generate | Lebih longgar (LLM call = expensive) | ASUMSI |
| Audio CRUD | Standard REST rate limit | ASUMSI |
| Response 429 | `{ "error": { "code": "RATE_LIMITED" } }` | `SRS.md V2.0 S8.5` |

---

## 11. Header Standar, CORS, Keamanan

### 11.1 Request Headers

| Header | Nilai | Wajib |
|---|---|---|
| `Content-Type` | `application/json` / `multipart/form-data` | Ya |
| `Accept` | `application/json` / `text/event-stream` | Tidak |
| `Cookie` | `next-auth.session-token=...` | Ya (authenticated) |

### 11.2 Response Headers

| Header | Nilai | Endpoint |
|---|---|---|
| `Content-Type` | `application/json; charset=utf-8` | CRUD/setting/theme/audio |
| `Content-Type` | `text/event-stream; charset=utf-8` | generate (SSE) |
| `Content-Type` | `text/markdown; charset=utf-8` | export (markdown) |
| `Cache-Control` | `no-cache, no-transform` | generate (SSE) |
| `X-Accel-Buffering` | `no` | generate (SSE) |

### 11.3 CORS

Same-origin only (Next.js App Router). ASUMSI.

### 11.4 Keamanan

| Aspek | Strategi |
|---|---|
| HTTPS | Vercel default, force redirect |
| CSP | next.config.ts Content-Security-Policy |
| XSS | React auto-escape |
| Input validation | Zod schemas (request + LLM output) |
| Auth | NextAuth session cookie |
| Ownership | Server-side check per request |
| API key | Encrypted at rest (AES-256-GCM), server-only |
| No secrets client | Server-only env vars |

---

## 12. Backward-Compat & Deprecation

### 12.1 Backward Compatibility

| Aspek | Kebijakan | Bukti |
|---|---|---|
| V2 ke V3 | SEMUA additive. Tidak ada field dihapus. | `PRD.md V2.0 P-07`, `BRD LIM-V3-01` |
| V2 clients | V3 fields bisa di-ignore. | `SRS.md V2.0 S9.2` |
| DB migration | Additive only. Tidak drop kolom V2. | `DATABASE_SCHEMA.md V2.0 S9` |
| Default values | Semua V3 field punya default. | `DATABASE_SCHEMA.md V2.0 S7.1` |

### 12.2 Deprecation

Tidak ada endpoint atau field di-deprecate di V3.

### 12.3 Breaking Changes Policy

- Breaking = bump `/api/v2/*`.
- V3 = 100% backward compatible.

---

## 13. Webhook / Async

Tidak ada webhook atau async processing di V3. Audio = metadata only (spec), bukan actual audio generation. Sitasi: `BRD OOS-V3-01..04`.

---

## 14. Daftar Status Code

| Status | Makna | Kapan Dipakai |
|---|---|---|
| `200` | OK | GET/PATCH sukses |
| `201` | Created | POST audio create sukses |
| `204` | No Content | DELETE audio sukses |
| `400` | Bad Request | Validasi input gagal |
| `401` | Unauthorized | Tidak ada session |
| `404` | Not Found | Resource tidak ditemukan |
| `409` | Conflict | Data conflict (unique constraint) |
| `422` | Unprocessable Entity | Validasi bisnis gagal |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | DB error, LLM error |

---

## 15. Changelog V2 to V3

### 15.1 New Endpoints (5)

| # | Method | Path | Deskripsi | Fitur |
|---|---|---|---|---|
| 1 | PATCH | `/api/v1/projects/[id]/theme` | Update theme preference | FR-V3-01 |
| 2 | GET | `/api/v1/projects/[id]/scenes/[sceneId]/audio` | List audio per scene | FR-V3-05 |
| 3 | POST | `/api/v1/projects/[id]/scenes/[sceneId]/audio` | Create audio entry | FR-V3-05 |
| 4 | PATCH | `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]` | Update audio entry | FR-V3-05 |
| 5 | DELETE | `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]` | Delete audio entry | FR-V3-05 |

### 15.2 Modified Endpoints (4)

| # | Endpoint | Perubahan | Fitur |
|---|---|---|---|
| 1 | POST `/api/v1/generate` | SSE `done`: +11 V3 fields per scene + audio[] + image V3 fields | FR-V3-02..05 |
| 2 | GET `.../scenes` | Response: per scene +11 V3 fields | FR-V3-02,04,05 |
| 3 | GET `.../image-prompts` | Response: per prompt +5 V3 fields | FR-V3-03 |
| 4 | GET `.../export` | JSON: +V3 fields. Markdown: +4 V3 sections | FR-V3-09 |

### 15.3 Unchanged Endpoints (19)

Semua endpoint V1/V2 lainnya tidak berubah.

### 15.4 New DB Tables (1)

| Table | Fields | Fitur |
|---|---|---|
| `scene_audio` | 19 fields + 3 indexes | FR-V3-05 |

### 15.5 Extended DB Fields

| Table | Fields Added | Fitur |
|---|---|---|
| `scenes` | +11 fields | FR-V3-02, FR-V3-04, FR-V3-05 |
| `image_prompts` | +5 fields | FR-V3-03 |
| `projects` | +1 field (`theme_preference`) | FR-V3-01 |

---

## 16. Asumsi API + Referensi

### 16.1 Asumsi

| # | Asumsi | Alasan | Dampak bila Salah |
|---|---|---|---|
| ASM-API-01 | Theme preference = field projects (server) + next-themes (client) | Server sync cross-device | Theme tidak sync |
| ASM-API-02 | Scene audio = new table | 1:N, CRUD per-entry butuh ID | Query sulit |
| ASM-API-03 | V3 metadata = additive di scenes | 1:1, query simpler | 2 extra JOINs |
| ASM-API-04 | Audio spec = metadata only | V3 = prompt engine | Scope explosion |
| ASM-API-05 | Composition/lighting/camera = JSON string | Flexible, backward compat | Schema explosion |
| ASM-API-06 | scene_audio.id = INTEGER | Konsistensi tabel existing | Ubah schema |
| ASM-API-07 | 6 transition types cukup MVP | Cover 95% use cases | Extend cepat |
| ASM-API-08 | 7 voice types cukup MVP | Cover 80% use case ID | Extend cepat |
| ASM-API-09 | 5 audio categories cukup MVP | Cover basic needs | Extend cepat |
| ASM-API-10 | PATCH theme = synchronous | Simple field update, < 100ms | N/A |

### 16.2 Referensi Dokumen

| Dokumen | Path | Peran |
|---|---|---|
| PRD V3 | `product-docs/PRD.md` | Fitur requirements, AC |
| SRS V3 | `product-docs/SRS.md` | Technical spec, data model |
| PROJECT_ARCHITECTURE V3 | `product-docs/PROJECT_ARCHITECTURE.md` | System design, ADR |
| DATABASE_SCHEMA V3 | `product-docs/DATABASE_SCHEMA.md` | Table definitions, fields |
| RAG-CONTEXT | `product-docs/RAG-CONTEXT.md` | Factual evidence, gaps |
| API_CONTRACT V2 | `product-docs/API_CONTRACT.md` (previous) | V1/V2 baseline |

---

> **Dokumen ini = kontrak API V3 PromptFlow. Semua endpoint tertelusur ke PRD + SRS + DATABASE_SCHEMA. Request/response schema konsisten dengan Drizzle schema. Contoh JSON konkret. V3 = additive only — zero breaking changes.**

**Dibuat oleh:** docgen-api-spec subagent
**Tanggal:** 2026-06-21
**Versi:** 3.0 (V3 Update)
