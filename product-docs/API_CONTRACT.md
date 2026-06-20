# API Contract — PromptFlow

> **Versi:** 2.0
> **Dibuat:** 2026-06-20
> **Status:** Final
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `product-docs/RAG-CONTEXT.md` + `product-docs/PRD.md` V2.0 + `product-docs/SRS.md` V2.0 + `product-docs/DATABASE_SCHEMA.md` V2.0
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** OVERWRITE V1.0. V2 mempertahankan semua 21 endpoint V1 + menambahkan 2 endpoint baru (upload/classify, dashboard/stats) + perubahan backward-compatible pada upload, generate, projects, dashboard, SSE protocol. Semua perubahan V2 ADDITIVE — tidak ada endpoint V1 yang dihapus.

---

## Daftar Isi

1. Ringkasan API + Base URL + Environment + Versioning
2. Autentikasi & Otorisasi
3. Konvensi Umum
4. Pagination, Sorting, Filtering, Searching
5. Daftar Endpoint (Tabel Ringkas)
6. Detail Endpoint per Grup
7. SSE Event Protocol V2 (POST /api/v1/generate)
8. Schemas (Zod V2)
9. Error Envelope
10. Rate Limiting
11. Header Standar, CORS, Keamanan
12. Backward-Compat & Deprecation
13. Webhook / Async
14. Daftar Status Code
15. Changelog V1 to V2
16. Asumsi API + Referensi

---

## 1. Ringkasan API + Base URL + Environment + Versioning

### 1.1 Ringkasan

PromptFlow = web app fullstack Next.js App Router. API = **Route Handlers** (`src/app/api/v1/*/route.ts`) + **Server Actions** (mutation dari Client Component). Response utama = **JSON** untuk CRUD/setting/upload/export/classify; **SSE (`text/event-stream`)** untuk endpoint generate yang memanggil LLM streaming.

- Sitasi: `SRS.md V2.0 S4.1` ; `RAG-CONTEXT.md S3` ; `API_CONTRACT.md V1 S1.1`

| Aspek | Nilai | Bukti |
|---|---|---|
| Tipe API | REST (Route Handlers) + Server Actions + SSE untuk streaming LLM | `SRS.md V2.0 S4.1` |
| Format request | `application/json` (CRUD/setting/generate), `multipart/form-data` (upload), `application/json` (classify) | `SRS.md V2.0 S8` |
| Format response | `application/json` (CRUD/setting), `text/event-stream` (generate), `application/json`/`text/markdown` (export) | `SRS.md V2.0 S8.4` |
| Auth | NextAuth.js session cookie (JWT strategy) | `SRS.md V2.0 S10.1 SEC-11` |
| Multi-provider LLM | Server-side only via `createOpenAICompatible` (Ollama cloud/OpenRouter/9router/custom). API key user dienkripsi at rest | `RAG-CONTEXT.md S5.1` ; `SRS.md V2.0 S10.1 SEC-03` |
| **V2 Vision LLM** | Auto-trigger saat upload untuk image classification (GPT-4o / Gemini Vision) | `PRD.md V2.0 S5 FR-V2-02` ; `RAG-CONTEXT.md S9 V2-3` |

### 1.2 Base URL + Environment

| Environment | Base URL | Catatan | Bukti |
|---|---|---|---|
| Dev (lokal) | `http://localhost:3000/api/v1` | Next.js dev server. 9router `http://localhost:20128/v1` reachable | `RAG-CONTEXT.md S5.2` |
| Staging | `https://<staging>.vercel.app/api/v1` | Vercel preview deployment | `RAG-CONTEXT.md S2.1` |
| Prod | `https://<prod-domain>/api/v1` | Vercel production, HTTPS default | `SRS.md V2.0 S10.1 SEC-09` |

> 9router (`http://localhost:20128/v1`) = **dev/local only**, tidak reachable dari Vercel prod. Prod: user pakai Ollama cloud/OpenRouter/custom. Sitasi: `RAG-CONTEXT.md S5.2, S9 G4` ; `SRS.md V2.0 S10.1 SEC-04`.

### 1.3 Versioning

| Strategi | Rekomendasi | Justifikasi | Bukti |
|---|---|---|---|
| **URI prefix** `/api/v1/*` | **DIPILIH** | Eksplisit, cache-friendly, mudah migrate. Locked di REVIEW_REPORT WARN-002. | `REVIEW_REPORT.md S10 WARN-002` |
| Header `Accept-Version: 1` | Alternatif | URL tetap bersih, tapi butuh middleware parse | — |
| No versioning | Tidak direkomendasi | Sulit breaking change fase akhir | — |

**Aturan versioning:**
- Versi mayor di URI: `/api/v1`, `/api/v2` (future).
- Breaking change = bump mayor. Non-breaking (additive field, new endpoint) tetap v1.
- V2 changes = SEMUA additive — tetap di `/api/v1/*`. Tidak perlu `/api/v2/*` untuk V2.
- Server Actions tidak punya URI version terpisah — internal contract.

---

## 2. Autentikasi & Otorisasi

### 2.1 Skema Autentikasi

| Aspek | Nilai | Bukti |
|---|---|---|
| Mekanisme | NextAuth.js (Auth.js v5+) credentials provider | `SRS.md V2.0 S4.1, S10.1 SEC-11` ; `RAG-CONTEXT.md S5.3` |
| Token/session | JWT cookie session | `RAG-CONTEXT.md S5.3` ; `AGENTS.md S10 SEC-16` |
| Cara dapat session | POST `/api/v1/auth/[...nextauth]` (login callback NextAuth) | `SRS.md V2.0 S7.1` |
| Masa berlaku | NextAuth default (JWT auto-refresh) | ASUMSI |
| Refresh | NextAuth JWT auto-refresh bila session active | ASUMSI |
| Bearer alternatif | Opsional `Authorization: Bearer <nextauth-jwt>` untuk API terprogram (fase akhir) | ASUMSI |

### 2.2 Protected Routes

Middleware `src/middleware.ts` proteksi:
- Pages: `/projects`, `/projects/[id]`, `/settings`, `/generate`, `/dashboard` (redirect ke `/login` bila unauth)
- API: `/api/v1/*` kecuali `/api/v1/auth/*` dan `/api/v1/health`
- Public paths: `/login`, `/register`, `/api/auth`, `/api/v1/auth`, `/api/v1/health`, `/_next`, `/favicon.ico`, `/robots.txt`
- Sitasi: `SRS.md V2.0 S10.1 SEC-11` ; `RAG-CONTEXT.md S5.3`

### 2.3 RBAC / Scope per Endpoint (V2)

Ownership check: `project.user_id === session.user.id` / `provider_configs.user_id === session.user.id` / `asset_references.project_id -> projects.user_id`. User hanya akses resource miliknya. Sitasi: `SRS.md V2.0 S10.1 SEC-07` ; `DATABASE_SCHEMA.md V2.0 S5.2`.

| Endpoint | Auth | Scope/Ownership | V2 Change | Bukti |
|---|---|---|---|---|
| `POST /api/v1/auth/[...nextauth]` | Public | NextAuth handler | Tetap | `SRS.md V2.0 S7.1` |
| `GET /api/v1/auth/session` | Session | Ambil session sendiri | Tetap | ASUMSI |
| `GET /api/v1/health` | Public | Health check | Tetap | ASUMSI |
| `GET /api/v1/projects` | wajib | Filter `user_id` | **Pagination enhanced** | `PRD.md V2.0 S9.2` |
| `POST /api/v1/projects` | wajib | Bind `user_id` | **Tambah `storyDescription`** | `PRD.md V2.0 S9.2` |
| `GET /api/v1/projects/[id]` | wajib | Ownership check | Tetap | `SRS.md V2.0 S7.1` |
| `PATCH /api/v1/projects/[id]` | wajib | Ownership check | Tetap | `SRS.md V2.0 S7.1` |
| `DELETE /api/v1/projects/[id]` | wajib | Ownership (soft delete) | Tetap | `SRS.md V2.0 S7.1` |
| `POST /api/v1/generate` | wajib | Provider config milik user | **Tambah `storyDescription`. SSE tambah `log` event.** | `PRD.md V2.0 S9.2` |
| `GET /api/v1/settings/providers` | wajib | Filter `user_id` | Tetap | `SRS.md V2.0 S7.1` |
| `POST /api/v1/settings/providers` | wajib | Bind `user_id` | Tetap | `SRS.md V2.0 S7.1` |
| `PATCH /api/v1/settings/providers/[id]` | wajib | Ownership check | Tetap | `SRS.md V2.0 S7.1` |
| `DELETE /api/v1/settings/providers/[id]` | wajib | Ownership check | Tetap | `SRS.md V2.0 S7.1` |
| `POST /api/v1/settings/providers/[id]/test` | wajib | Ownership check | Tetap | ASUMSI |
| `POST /api/v1/upload` | wajib | Bind ke project atau pre-submit | **MAJOR: projectId OPSIONAL. tipe 6 opsi. Response +aiClassification.** | `PRD.md V2.0 S9.2` |
| **`POST /api/v1/upload/classify`** | wajib | Ownership via asset ref | **NEW V2** | `PRD.md V2.0 S9.3` |
| `DELETE /api/v1/upload` | wajib | Ownership project | Tetap | `SRS.md V2.0 S7.1` |
| `GET /api/v1/projects/[id]/export` | wajib | Ownership check | Tetap | `SRS.md V2.0 S7.1` |
| `GET /api/v1/projects/[id]/characters` | wajib | Ownership check | Tetap | `DATABASE_SCHEMA.md V2.0 S4.5` |
| `GET /api/v1/projects/[id]/scenes` | wajib | Ownership check | Tetap | `DATABASE_SCHEMA.md V2.0 S4.6` |
| `GET /api/v1/projects/[id]/image-prompts` | wajib | Ownership check | Tetap | `DATABASE_SCHEMA.md V2.0 S4.7` |
| `GET /api/v1/projects/[id]/logs` | wajib | Ownership check | Response +`logsJson` | `DATABASE_SCHEMA.md V2.0 S4.8` |
| **`GET /api/v1/dashboard/stats`** | wajib | Filter `user_id` | **NEW V2** | `PRD.md V2.0 S9.2` |

### 2.4 API Key User (LLM Provider) — Server-Side Only

API key user untuk LLM provider **TIDAK** dipakai client untuk autentikasi PromptFlow API. Disimpan terenkripsi (AES-256-GCM) di `provider_configs.api_key_encrypted`, di-decrypt hanya server-side. Response API = mask `****`. Sitasi: `SRS.md V2.0 S10.1 SEC-01/SEC-02/SEC-03` ; `DATABASE_SCHEMA.md V2.0 S12.1`.

---

## 3. Konvensi Umum

### 3.1 Format & Casing

| Aspek | Nilai | Bukti |
|---|---|---|
| Content-Type request | `application/json; charset=utf-8` (CRUD/setting/generate/classify), `multipart/form-data` (upload) | `SRS.md V2.0 S8` |
| Content-Type response | `application/json` (CRUD/setting/classify/dashboard), `text/event-stream` (generate), `text/markdown` (export) | `SRS.md V2.0 S8.4` |
| Casing field JSON | **camelCase** untuk request/response. DB snake_case, mapping di repository | ASUMSI |
| Casing PromptPackageSchema | **snake_case-ish native**: `character_profiles`, `image_prompts`, `voiceover_script`, `moral_message`, `deskripsi_latar`, `alas_kaki`, `pakaian_atas`, `pakaian_bawah`, `wajah_asal`, `gayarambut` | `PRD.md V2.0 S8.2` |
| Encoding | UTF-8 | ASUMSI |
| Date/time | ISO-8601 string di JSON. DB simpan unix epoch integer — mapping di repository | ASUMSI |
| ID | integer auto-increment (DB) -> return sebagai number di JSON | `DATABASE_SCHEMA.md V2.0 S4` |

### 3.2 Envelope Respons Sukses

**CRUD / Setting / Classify / Dashboard (single resource):**
```json
{ "data": { } }
```

**CRUD / Setting (list paginated):**
```json
{ "data": [ ], "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 } }
```

**Generate (SSE):** Lihat §7 SSE Event Protocol V2.
**Export:** Body = file content, header `Content-Disposition: attachment`.

### 3.3 Error Envelope

```json
{
  "error": { "code": "VALIDATION_ERROR", "message": "Title minimal 3 karakter", "details": { "field": "title", "min": 3, "received": 2 } },
  "traceId": "req_abc123"
}
```

| Field | Tipe | Wajib | Deskripsi | Bukti |
|---|---|---|---|---|
| `error.code` | string | YA | Kode error stabil (lihat §9) | `SRS.md V2.0 S8.5` |
| `error.message` | string | YA | Pesan bahasa aktif (ID/EN) | `SRS.md V2.0 S8.5` |
| `error.details` | object | TIDAK | Detail tambahan | `SRS.md V2.0 S8.5` |
| `traceId` | string | TIDAK | ID trace untuk debugging | ASUMSI |

**V2 tambahan code:** `CLASSIFICATION_ERROR`. Lihat §9.

### 3.4 Idempotency

| Endpoint | Idempotent? | Mekanisme | Bukti |
|---|---|---|---|
| GET, PATCH, DELETE | Ya (by design) | Resource by id | ASUMSI |
| POST /api/v1/projects | Tidak | Setiap create = record baru | ASUMSI |
| POST /api/v1/generate | Tidak | Setiap generate = log baru + overwrite `result_json` | ASUMSI |
| POST /api/v1/upload | Tidak | Setiap upload = `asset_references` baru. **V2: projectId opsional** | `SRS.md V2.0 S6.1` |
| POST /api/v1/upload/classify | Ya (by assetReferenceId) | Cached | `PRD.md V2.0 S5 FR-V2-02` |
| POST /api/v1/settings/providers | Tidak, tapi unique constraint | Unique (`user_id`, `name`) -> 409 | `DATABASE_SCHEMA.md V2.0 S4.2` |
| GET /api/v1/dashboard/stats | Ya (read-only) | Cache bisa dipakai | ASUMSI |

### 3.5 Timezone

Semua timestamp di JSON response = ISO-8601 UTC (`Z` suffix). DB simpan unix epoch second (timezone-agnostic). ASUMSI.

---

## 4. Pagination, Sorting, Filtering, Searching

### 4.1 Pagination (V2 Enhanced)

| Param | Tipe | Default | Validasi | V2 Change | Bukti |
|---|---|---|---|---|---|
| `page` | integer | 1 | `>= 1` | Tetap | ASUMSI |
| `limit` | integer | 20 | `1..100` | **V2: enforced di server** | `PRD.md V2.0 S9.2` |

Response metadata:
```json
{ "pagination": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 } }
```

### 4.2 Sorting

| Param | Tipe | Default | Format | Contoh |
|---|---|---|---|---|
| `sort` | string | per endpoint | `<field>:asc|desc` | `sort=createdAt:desc` |

### 4.3 Filtering

| Endpoint | Param filter | Contoh | V2 Change | Bukti |
|---|---|---|---|---|
| `GET /api/v1/projects` | `status`, `durationType` | `?status=complete&durationType=shorts` | Tetap | `DATABASE_SCHEMA.md V2.0 S4.3` |
| `GET /api/v1/projects/[id]/image-prompts` | `tipe`, `sceneId` | `?tipe=tokoh&sceneId=5` | **V2: `tipe` 6 opsi** | `DATABASE_SCHEMA.md V2.0 S4.7` |
| `GET /api/v1/projects/[id]/characters` | `peran` | `?peran=utama` | Tetap | `DATABASE_SCHEMA.md V2.0 S4.5` |
| `GET /api/v1/projects/[id]/logs` | `status`, `provider` | `?status=success&provider=openrouter` | **V2: tambah `provider` filter** | ASUMSI |
| `GET /api/v1/dashboard/stats` | `range` | `?range=30d` | **NEW V2** | `PRD.md V2.0 S5 FR-V2-06` |

### 4.4 Searching

| Endpoint | Param | Behavior | Bukti |
|---|---|---|---|
| `GET /api/v1/projects` | `q` | LIKE search di `title` | ASUMSI |

---

## 5. Daftar Endpoint (Tabel Ringkas)

Total **23 endpoint** (21 V1 + 2 V2 baru):

| # | Method | Path | Nama | Auth | V1/V2 | Ringkasan | Fitur PRD |
|---|---|---|---|---|---|---|---|
| 1 | GET/POST | `/api/v1/auth/[...nextauth]` | NextAuth handler | Public | V1 | Login/logout/session/callback | FR-18 |
| 2 | GET | `/api/v1/auth/session` | Get session | Session | V1 | Ambil session user aktif | ASUMSI |
| 3 | GET | `/api/v1/health` | Health check | Public | V1 | Status app + DB + env | ASUMSI |
| 4 | GET | `/api/v1/projects` | List projects | wajib | V1+V2 | Paginate `?page=&limit=` per user | FR-15, FR-V2-09 |
| 5 | POST | `/api/v1/projects` | Create project | wajib | V1+V2 | Tambah `storyDescription` opsional | FR-15, FR-V2-04 |
| 6 | GET | `/api/v1/projects/[id]` | Detail project | wajib | V1 | By id + ownership | FR-15 |
| 7 | PATCH | `/api/v1/projects/[id]` | Update project | wajib | V1 | Update metadata | FR-15 |
| 8 | DELETE | `/api/v1/projects/[id]` | Delete project | wajib | V1 | Soft delete | FR-15 |
| 9 | POST | `/api/v1/generate` | Generate prompt package | wajib | V1+V2 | SSE extended: `log` event + `storyDescription` | FR-03..FR-12, FR-V2-04, FR-V2-05 |
| 10 | GET | `/api/v1/settings/providers` | List providers | wajib | V1 | Provider config per user (key mask) | FR-13, FR-14 |
| 11 | POST | `/api/v1/settings/providers` | Add provider | wajib | V1 | Save config (encrypt key) | FR-13, FR-14 |
| 12 | PATCH | `/api/v1/settings/providers/[id]` | Update provider | wajib | V1 | Update config | FR-13 |
| 13 | DELETE | `/api/v1/settings/providers/[id]` | Delete provider | wajib | V1 | Hapus config | FR-13 |
| 14 | POST | `/api/v1/settings/providers/[id]/test` | Test connection | wajib | V1 | Test reachability | ASUMSI |
| 15 | POST | `/api/v1/upload` | Upload reference | wajib | **V2 MAJOR** | **projectId OPSIONAL. tipe 6 opsi. +aiClassification. Auto-classify.** | FR-17, FR-V2-01, FR-V2-02, FR-V2-03 |
| 16 | **POST** | **`/api/v1/upload/classify`** | **AI classify** | wajib | **NEW V2** | **Trigger Vision LLM classification** | FR-V2-02 |
| 17 | DELETE | `/api/v1/upload` | Delete reference | wajib | V1 | Hapus Blob + AssetReference | FR-17 |
| 18 | GET | `/api/v1/projects/[id]/export` | Export project | wajib | V1 | `?format=json|markdown` | FR-16 |
| 19 | GET | `/api/v1/projects/[id]/characters` | List characters | wajib | V1 | Master karakter per project | FR-07, FR-12 |
| 20 | GET | `/api/v1/projects/[id]/scenes` | List scenes | wajib | V1 | Adegan berurut | FR-03, FR-09 |
| 21 | GET | `/api/v1/projects/[id]/image-prompts` | List image prompts | wajib | V1 | Master + varian per scene | FR-06 |
| 22 | GET | `/api/v1/projects/[id]/logs` | List generation logs | wajib | V1+V2 | Response +`logsJson` | FR-V2-05 |
| 23 | **GET** | **`/api/v1/dashboard/stats`** | **Dashboard stats** | wajib | **NEW V2** | **Enriched dashboard data** | FR-V2-06 |

---

## 6. Detail Endpoint per Grup

### 6.1 Auth — `/api/v1/auth/*` (V1 — tetap)

#### 6.1.1 GET/POST `/api/v1/auth/[...nextauth]`

NextAuth handler (catch-all).

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET/POST (NextAuth routing internal) | `SRS.md V2.0 S7.1` |
| Auth | Public | — |
| Request body | Form NextAuth credentials: `email`, `password` | `SRS.md V2.0 S4.1` |
| Response sukses | Redirect / JSON session (NextAuth default) | `RAG-CONTEXT.md S5.3` |
| Response error | 401 `{ error: { code: "UNAUTHORIZED", message: "Email atau password salah" } }` | ASUMSI |
| Relasi | `users` tabel | `DATABASE_SCHEMA.md V2.0 S4.1` |
| Fitur PRD | FR-18 | `PRD.md V2.0 S5` |

#### 6.1.2 GET `/api/v1/auth/session`

| Aspek | Detail |
|---|---|
| Method | GET |
| Auth | Session (return null bila unauth) |
| Response 200 | `{ "data": { "user": { "id": 1, "email": "demo@promptflow.local", "name": "Demo User" }, "expires": "2026-07-20T00:00:00.000Z" } }` |
| Response unauth 200 | `{ "data": null }` |

### 6.2 Health — `/api/v1/health` (V1 — tetap)

#### 6.2.1 GET `/api/v1/health`

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | ASUMSI |
| Auth | Public | ASUMSI |
| Response 200 | `{ "data": { "status": "ok", "db": "ok", "time": "2026-06-20T12:00:00Z" } }` | ASUMSI |
| Response 503 | `{ "data": { "status": "degraded", "db": "fail", "time": "..." } }` | ASUMSI |

### 6.3 Projects CRUD — `/api/v1/projects`

#### 6.3.1 GET `/api/v1/projects` — List (V2 ENHANCED PAGINATION)

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Method | GET | Tetap | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership filter `user_id`) | Tetap | `SRS.md V2.0 S10.1 SEC-07` |
| Query | `page`, `limit`, `sort`, `status`, `durationType`, `q` | **V2: `page` & `limit` dipakai** | `PRD.md V2.0 S9.2` |
| Response 200 | `{ "data": [ ProjectDTO ], "pagination": {...} }` | Tambah `storyDescription` | `DATABASE_SCHEMA.md V2.0 S4.3` |
| Fitur PRD | FR-15 | `PRD.md V2.0 S5` |

Contoh request:
```http
GET /api/v1/projects?page=2&limit=10&sort=createdAt:desc&status=complete HTTP/1.1
Cookie: next-auth.session-token=eyJ...
```

Contoh response 200:
```json
{
  "data": [
    {
      "id": 42,
      "userId": 1,
      "title": "Petualangan Hutan Anak",
      "durationType": "shorts",
      "durationTargetSeconds": 60,
      "styleType": "3D",
      "aspectRatio": "16:9",
      "status": "complete",
      "resultJson": null,
      "storyDescription": "Anak kecil petualang di hutan tropis",
      "createdAt": "2026-06-20T10:00:00Z",
      "updatedAt": "2026-06-20T10:05:00Z",
      "deletedAt": null
    }
  ],
  "pagination": { "page": 2, "limit": 10, "total": 47, "totalPages": 5 }
}
```

#### 6.3.2 POST `/api/v1/projects` — Create (V2 EXTENDED)

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Method | POST | Tetap | `SRS.md V2.0 S7.1` |
| Auth | wajib (bind `user_id`) | Tetap | `SRS.md V2.0 S5 (FR-15)` |
| Request body | `CreateProjectInput` (§8.1) | **V2: tambah `storyDescription` opsional** | `PRD.md V2.0 S5 FR-V2-04` |
| Response 201 | `{ "data": ProjectDTO }` | Tetap | §3.2 |
| Response 400 | VALIDATION_ERROR | §9 | |
| Response 422 | VALIDATION_ERROR (shorts >180s) | `PRD.md V2.0 S7 AC-02` |
| Fitur PRD | FR-15, FR-V2-04 | `PRD.md V2.0 S5` |

Contoh request:
```http
POST /api/v1/projects HTTP/1.1
Content-Type: application/json
Cookie: next-auth.session-token=eyJ...

{
  "title": "Petualangan Hutan Anak",
  "durationType": "shorts",
  "durationTargetSeconds": 60,
  "styleType": "3D",
  "aspectRatio": "16:9",
  "storyDescription": "Anak kecil petualang di hutan tropis bertemu teman baru"
}
```

#### 6.3.3 GET `/api/v1/projects/[id]` — Detail (V1 — tetap)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership) | `SRS.md V2.0 S5 (FR-15)` |
| Response 200 | `{ "data": ProjectDetailDTO }` (include full `resultJson`, `storyDescription`) | §8.1 |
| Response 401/403/404 | §9 | §9 |
| Fitur PRD | FR-15, FR-V2-04 | `PRD.md V2.0 S5` |

#### 6.3.4 PATCH `/api/v1/projects/[id]` — Update (V1 — tetap)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | PATCH (partial update) | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership) | `SRS.md V2.0 S5 (FR-15)` |
| Request body | `UpdateProjectInput` (semua field opsional termasuk `storyDescription`) | `DATABASE_SCHEMA.md V2.0 S4.3` |
| Response 200 | `{ "data": ProjectDTO }` | §3.2 |
| Catatan | Re-generate = via `/api/v1/generate`, BUKAN di PATCH | `SRS.md V2.0 S5 (FR-15)` |

#### 6.3.5 DELETE `/api/v1/projects/[id]` — Soft Delete (V1 — tetap)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | DELETE | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership) | `SRS.md V2.0 S5 (FR-15)` |
| Response 204 | No Content (soft delete, set `deleted_at`) | `DATABASE_SCHEMA.md V2.0 S11.1` |
| Cascade | Soft delete TIDAK cascade child | `DATABASE_SCHEMA.md V2.0 S11.1` |

### 6.4 Generate — `POST /api/v1/generate` (V2 EXTENDED)

**Endpoint paling kompleks.** Streaming SSE. Lihat §7 untuk full SSE Event Protocol V2.

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Method | POST | Tetap | `SRS.md V2.0 S8.4` |
| Auth | wajib | Tetap | `SRS.md V2.0 S5 (FR-03..FR-12)` |
| Content-Type request | `application/json` | Tetap | `SRS.md V2.0 S8.4` |
| Content-Type response | `text/event-stream; charset=utf-8` | Tetap | `SRS.md V2.0 S8.4` |
| Request body | `GenerateInput` (§8.2) | **V2: tambah `input.storyDescription` + `input.references[].aiClassification`** | `PRD.md V2.0 S5 FR-V2-04, FR-V2-02` |
| Response 200 | SSE stream | **V2: tambah `log` event type** | `SRS.md V2.0 S8.4` ; `RAG-CONTEXT.md S9 V2-5` |
| Response 400 | VALIDATION_ERROR | §9 |
| Response 429 | RATE_LIMITED (10 req/min/user) | `SRS.md V2.0 S12 SRS-V2-A15` |
| Response 502 | PROVIDER_ERROR | `SRS.md V2.0 S8.5` |
| Response 504 | TIMEOUT | `SRS.md V2.0 S8.5` |
| Rate limit | **10 req/min/user** | `SRS.md V2.0 S12 SRS-V2-A15` |
| Proses server | load ProviderConfig -> decrypt key -> build prompt (inject storyDescription + aiClassification refs) -> LLM -> SSE -> Zod validate -> consistency check -> persist | **V2: simpan logs ke `generation_logs.logs_json`** | `DATABASE_SCHEMA.md V2.0 S4.8, S7.2` |
| Relasi | `projects`, `characters`, `scenes`, `image_prompts`, `supporting_characters`, `generation_logs` | `DATABASE_SCHEMA.md V2.0 S4.3-S4.9` |
| Fitur PRD | FR-03..FR-12, FR-V2-04, FR-V2-05 | `PRD.md V2.0 S5` |

Contoh request V2:
```http
POST /api/v1/generate HTTP/1.1
Content-Type: application/json
Accept: text/event-stream
Cookie: next-auth.session-token=eyJ...

{
  "projectId": 42,
  "input": {
    "title": "Petualangan Hutan Anak",
    "storyDescription": "Anak kecil petualang di hutan tropis bertemu teman baru",
    "durationTarget": { "type": "shorts", "seconds": 60 },
    "style": { "type": "3D", "ratio": "16:9" },
    "providerId": 7,
    "references": [
      {
        "name": "hero-ref.png",
        "type": "tokoh",
        "aiClassification": {
          "role": "tokoh",
          "name": "Wahab",
          "description": "Anak kecil berusia 8 tahun, rambut hitam pendek",
          "confidence": 0.92
        }
      },
      {
        "name": "hutan-bg.png",
        "type": "background",
        "aiClassification": {
          "role": "background",
          "name": "Hutan Tropis",
          "description": "Hutan lebat dengan pepohonan tinggi",
          "confidence": 0.88
        }
      }
    ]
  }
}
```

> **V2 field baru:**
> - `input.storyDescription`: opsional (max 500 char), inject ke `buildUserMessage()` LLM context
> - `input.references[].aiClassification`: opsional object hasil Vision LLM, inject ke prompt builder

### 6.5 Settings Providers — `/api/v1/settings/providers` (V1 — tetap)

#### 6.5.1 GET `/api/v1/settings/providers` — List (masked)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md V2.0 S7.1` |
| Auth | wajib | `SRS.md V2.0 S5 (FR-13)` |
| Response 200 | `{ "data": [ ProviderConfigDTO ] }` (apiKey = mask) | `SRS.md V2.0 S10.1 SEC-02` |
| Fitur PRD | FR-13, FR-14 | `PRD.md V2.0 S5` |

#### 6.5.2 POST `/api/v1/settings/providers` — Add

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `SRS.md V2.0 S7.1` |
| Auth | wajib (bind `user_id`) | `SRS.md V2.0 S5 (FR-13)` |
| Request body | `CreateProviderConfigInput` (§8.3) | — |
| Response 201 | `{ "data": ProviderConfigDTO }` (masked) | §3.2 |
| Response 409 | CONFLICT (unique `user_id`+`name`) | `DATABASE_SCHEMA.md V2.0 S4.2` |
| Proses server | encrypt apiKey AES-256-GCM | `SRS.md V2.0 S10.1 SEC-01` |

#### 6.5.3 PATCH `/api/v1/settings/providers/[id]` — Update

| Aspek | Detail | Bukti |
|---|---|---|
| Method | PATCH | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership) | `SRS.md V2.0 S5 (FR-13)` |
| Request body | `UpdateProviderConfigInput` (apiKey opsional) | — |
| Response 200 | `{ "data": ProviderConfigDTO }` (masked) | §3.2 |

> PATCH `isActive: 1` untuk set provider aktif (provider lain jadi `isActive: 0`). ASUMSI.

#### 6.5.4 DELETE `/api/v1/settings/providers/[id]` — Delete

| Aspek | Detail | Bukti |
|---|---|---|
| Method | DELETE | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership) | `SRS.md V2.0 S5 (FR-13)` |
| Response 204 | No Content | §3.2 |

#### 6.5.5 POST `/api/v1/settings/providers/[id]/test` — Test Connection

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | ASUMSI |
| Auth | wajib (ownership) | ASUMSI |
| Request body | opsional `{ "prompt": "ping" }` (default "Hello") | ASUMSI |
| Response 200 | `{ "data": { "ok": true, "provider": "openrouter", "model": "...", "latencyMs": 340, "sample": "Hi!" } }` | ASUMSI |
| Response 502 | PROVIDER_ERROR | §9 |

### 6.6 Upload — `/api/v1/upload` (V2 MAJOR REDESIGN)

**V2 perubahan signifikan**: upload pindah dari project detail ke generate page. `projectId` jadi **OPSIONAL** (pre-submit = orphan refs). Role classification extended ke 6 opsi. AI classification auto-trigger.

#### 6.6.1 POST `/api/v1/upload` — Multipart (V2 MAJOR)

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Method | POST | Tetap | `SRS.md V2.0 S7.1` |
| Auth | wajib | Tetap | `SRS.md V2.0 S5 (FR-17)` |
| Content-Type | `multipart/form-data` | Tetap | `SRS.md V2.0 S5 (FR-17)` |
| **Query `projectId`** | **OPSIONAL (V2)** | **Pre-submit = orphan ref (project_id NULL). Di-attach saat generate submit.** | `PRD.md V2.0 S5 FR-V2-01` |
| Form fields | `file`, `tipe` (V2: 6 opsi), `label` | **V2: `tipe` extended 6 opsi** | `SRS.md V2.0 S9.1` |
| Response 201 | `{ "data": AssetReferenceDTO }` | **V2: +`aiClassification` nullable** | `PRD.md V2.0 S9.2` |
| Response 400 | VALIDATION_ERROR (mime invalid, size >10MB, tipe invalid) | §9 |
| Response 403 | FORBIDDEN (projectId bukan milik user) | §9 |
| **Proses V2** | 1) Validasi mime+size. 2) Upload ke Blob/FS. 3) Simpan `asset_references` (project_id nullable). 4) **Auto-trigger `/upload/classify`**. 5) Update `ai_classification`. 6) Return response. | `RAG-CONTEXT.md S9 V2-1, V2-3` |
| Fitur PRD | FR-17, FR-V2-01, FR-V2-02, FR-V2-03 | `PRD.md V2.0 S5` |

Contoh request V2 — **pre-submit tanpa projectId**:
```http
POST /api/v1/upload HTTP/1.1
Content-Type: multipart/form-data; boundary=----Boundary
Cookie: next-auth.session-token=eyJ...

------Boundary
Content-Disposition: form-data; name="file"; filename="hero-ref.png"
Content-Type: image/png

<binary>
------Boundary
Content-Disposition: form-data; name="tipe"

tokoh
------Boundary
Content-Disposition: form-data; name="label"

Hero
------Boundary--
```

Contoh response 201 V2:
```json
{
  "data": {
    "id": 99,
    "projectId": null,
    "name": "hero-ref.png",
    "url": "https://...vercel-storage.com/hero-ref.png",
    "type": "tokoh",
    "label": "Hero",
    "mimeType": "image/png",
    "sizeBytes": 245678,
    "aiClassification": {
      "role": "tokoh",
      "name": "Wahab",
      "description": "Anak kecil berusia 8 tahun, rambut hitam pendek, wajah bulat khas Indonesia",
      "confidence": 0.92
    },
    "createdAt": "2026-06-20T10:00:00Z"
  }
}
```

> **V2 response field baru**: `aiClassification` (nullable object). Null jika Vision LLM tidak aktif, gagal/timeout, confidence < 0.7, atau user disable auto-classify.

#### 6.6.2 POST `/api/v1/upload/classify` (NEW V2)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `PRD.md V2.0 S9.3` ; `SRS.md V2.0 S8.3` |
| Auth | wajib (ownership via asset ref) | `PRD.md V2.0 S5 FR-V2-02` |
| Request body | `{ "assetReferenceId": 99 }` | `PRD.md V2.0 S9.3` |
| Response 200 | `{ "data": { "role": "tokoh", "name": "Wahab", "description": "...", "confidence": 0.92 } }` | `PRD.md V2.0 S5 FR-V2-02` |
| Response 400 | VALIDATION_ERROR | §9 |
| Response 404 | NOT_FOUND | §9 |
| Response 502 | CLASSIFICATION_ERROR (Vision LLM gagal) | §9 |
| **Proses** | 1) Validasi ownership. 2) Baca blob URL gambar. 3) Panggil Vision LLM. 4) Parse response. 5) Update `asset_references.tipe`, `label`, `ai_classification`. 6) Cache result. | `PRD.md V2.0 S5 FR-V2-02` |
| Rate limit | 30 req/min/user | ASUMSI SRS-V2-A12 |
| Fitur PRD | FR-V2-02 | `PRD.md V2.0 S5` |

Contoh request:
```http
POST /api/v1/upload/classify HTTP/1.1
Content-Type: application/json
Cookie: next-auth.session-token=eyJ...

{ "assetReferenceId": 99 }
```

Contoh response 200:
```json
{
  "data": {
    "role": "tokoh",
    "name": "Wahab",
    "description": "Anak kecil berusia 8 tahun, rambut hitam pendek, wajah bulat khas Indonesia",
    "confidence": 0.92
  }
}
```

> **Rekomendasi SRS-V2-A11**: auto-trigger saat upload (seamless UX). Endpoint ini untuk retry/manual fallback.

#### 6.6.3 DELETE `/api/v1/upload` — Delete Reference (V1 + V2)

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Method | DELETE | Tetap | `SRS.md V2.0 S5 (FR-17)` |
| Auth | wajib (ownership) | V2: support orphan ref delete | `SRS.md V2.0 S10.1 SEC-07` |
| Query | `name` wajib + `projectId` OPSIONAL | **V2: `projectId` OPSIONAL** | `PRD.md V2.0 S5 FR-V2-01` |
| Response 204 | No Content | §3.2 |

Contoh:
```http
DELETE /api/v1/upload?name=hero-ref.png&projectId=42 HTTP/1.1
Cookie: next-auth.session-token=eyJ...
```

### 6.7 Export — `GET /api/v1/projects/[id]/export` (V1 — tetap)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md V2.0 S7.1` |
| Auth | wajib (ownership) | `SRS.md V2.0 S5 (FR-16)` |
| Query | `format` (`json`|`markdown`) wajib | `SRS.md V2.0 S7.1` |
| Response 200 (json) | `Content-Type: application/json`, `Content-Disposition: attachment`, body = PromptPackage | `SRS.md V2.0 S5 (FR-16)` |
| Response 200 (markdown) | `Content-Type: text/markdown`, `Content-Disposition: attachment`, body = markdown | `SRS.md V2.0 S5 (FR-16)` |
| Response 409 | CONFLICT (project belum generate) | ASUMSI |
| Fitur PRD | FR-16 | `PRD.md V2.0 S5` |

### 6.8 Sub-resource List — `/api/v1/projects/[id]/*` (V1 + V2 ext)

#### 6.8.1 GET `/api/v1/projects/[id]/characters`

| Aspek | Detail | Bukti |
|---|---|---|
| Response 200 | `{ "data": [ CharacterDTO ] }` | `DATABASE_SCHEMA.md V2.0 S4.5` |
| Query | `peran` (`utama`|`lain`|`pendamping`) | §4.3 |
| Fitur PRD | FR-07, FR-12 | `PRD.md V2.0 S5` |

#### 6.8.2 GET `/api/v1/projects/[id]/scenes`

| Aspek | Detail | Bukti |
|---|---|---|
| Response 200 | `{ "data": [ SceneDTO ] }` urut `orderNo:asc` | `DATABASE_SCHEMA.md V2.0 S4.6` |
| Fitur PRD | FR-03, FR-09 | `PRD.md V2.0 S5` |

#### 6.8.3 GET `/api/v1/projects/[id]/image-prompts`

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Response 200 | `{ "data": [ ImagePromptDTO ] }` | **V2: `tipe` 6 opsi** | `DATABASE_SCHEMA.md V2.0 S4.7` |
| Query | `tipe`, `sceneId` | **V2: filter `tipe` 6 nilai** | `DATABASE_SCHEMA.md V2.0 S6.2` |
| Fitur PRD | FR-06, FR-V2-03 | `PRD.md V2.0 S5` |

#### 6.8.4 GET `/api/v1/projects/[id]/logs` (V2 EXTENDED)

| Aspek | Detail | V2 Change | Bukti |
|---|---|---|---|
| Response 200 | `{ "data": [ GenerationLogDTO ], "pagination": {...} }` | **V2: +`logsJson` per log** | `DATABASE_SCHEMA.md V2.0 S4.8, S7.2` |
| Query | `page`, `limit`, `sort`, `status`, `provider` | **V2: +`provider` filter** | §4.3 |

Contoh response 200 V2:
```json
{
  "data": [
    {
      "id": 101,
      "projectId": 42,
      "provider": "openrouter",
      "model": "anthropic/claude-3.5-sonnet",
      "durationMs": 45230,
      "status": "success",
      "errorMessage": null,
      "logsJson": [
        { "level": "info", "message": "[generate] Resolving provider openrouter...", "timestamp": "2026-06-20T10:00:00.123Z" },
        { "level": "info", "message": "[llm] Calling GPT-4o...", "timestamp": "2026-06-20T10:00:01.456Z" },
        { "level": "warn", "message": "[classifier] AI confidence 0.65 di bawah threshold", "timestamp": "2026-06-20T10:00:05.789Z" }
      ],
      "createdAt": "2026-06-20T10:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### 6.9 Dashboard — `GET /api/v1/dashboard/stats` (NEW V2)

**Endpoint baru V2.** Enriched dashboard data.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `PRD.md V2.0 S9.2` ; `SRS.md V2.0 S6.6` |
| Auth | wajib (filter `user_id`) | `SRS.md V2.0 S10.1 SEC-07` |
| Query | `range` (opsional: `7d`|`30d`|`90d`|`all`, default `30d`) | ASUMSI |
| Response 200 | `{ "data": DashboardStatsDTO }` | `PRD.md V2.0 S5 FR-V2-06` |
| Rate limit | 60 req/min/user | §10 |
| Performance | Dashboard load <= 1.5s | `SRS.md V2.0 S11` |
| Fitur PRD | FR-V2-06 | `PRD.md V2.0 S5` |

Response schema:
```ts
DashboardStatsDTO = {
  totalProjects: number,
  successfulGenerations: number,
  failedGenerations: number,
  avgDurationMs: number | null,
  totalUploads: number,
  successRate: number,
  activeProviders: number,
  perProviderBreakdown: Array<{
    provider: string,
    totalCalls: number,
    avgDurationMs: number | null,
    successRate: number,
    lastUsed: string | null
  }>,
  recentProjects: Array<{
    id: number,
    title: string,
    status: 'draft'|'generating'|'complete'|'failed',
    durationType: 'shorts'|'tutorial',
    createdAt: string
  }>,
  storageUsage: {
    totalFiles: number,
    totalSizeBytes: number
  },
  weeklyTrend: Array<{
    weekStart: string,
    projectCount: number,
    generationCount: number
  }>
}
```

Contoh response 200:
```json
{
  "data": {
    "totalProjects": 47,
    "successfulGenerations": 42,
    "failedGenerations": 5,
    "avgDurationMs": 38450,
    "totalUploads": 156,
    "successRate": 89.36,
    "activeProviders": 2,
    "perProviderBreakdown": [
      { "provider": "openrouter", "totalCalls": 38, "avgDurationMs": 42100, "successRate": 92.11, "lastUsed": "2026-06-20T09:30:00Z" },
      { "provider": "ollama", "totalCalls": 9, "avgDurationMs": 28400, "successRate": 77.78, "lastUsed": "2026-06-19T14:22:00Z" }
    ],
    "recentProjects": [
      { "id": 47, "title": "Petualangan Hutan Anak", "status": "complete", "durationType": "shorts", "createdAt": "2026-06-20T10:00:00Z" },
      { "id": 46, "title": "Tutorial Blender Pemula", "status": "complete", "durationType": "tutorial", "createdAt": "2026-06-19T16:30:00Z" },
      { "id": 45, "title": "Cerita Nabi Yunus", "status": "generating", "durationType": "tutorial", "createdAt": "2026-06-19T14:00:00Z" }
    ],
    "storageUsage": { "totalFiles": 156, "totalSizeBytes": 89234560 },
    "weeklyTrend": [
      { "weekStart": "2026-06-16", "projectCount": 8, "generationCount": 12 },
      { "weekStart": "2026-06-09", "projectCount": 11, "generationCount": 15 },
      { "weekStart": "2026-06-02", "projectCount": 9, "generationCount": 13 }
    ]
  }
}
```

---

## 7. SSE Event Protocol V2 (POST /api/v1/generate)

### 7.1 Format Event

Setiap event = 2 baris: `event: <name>` + `data: <json-string>`, dipisah blank line.

### 7.2 Event Types (V2)

| Event | Field `data` | Kapan | V1/V2 | Bukti |
|---|---|---|---|---|
| `stage` | `{ "stage": "starting"\|"character_profiles"\|"scenes"\|"image_prompts"\|"supporting_characters"\|"moral_message"\|"done", "message": "..." }` | Perubahan stage | V1 (extended V2) | `SRS.md V2.0 S8.4` |
| `progress` | `{ "stage": "...", "progress": 0..100, "delta": "<partial>" }` | Streaming partial | V1 | `SRS.md V2.0 S8.4` |
| **`log`** | **`{ "level": "info"\|"warn"\|"error", "message": "...", "timestamp": "ISO-8601" }`** | **Real-time log line. Frontend LogViewer toggle-controlled. Default OFF.** | **NEW V2** | `RAG-CONTEXT.md S9 V2-5` ; `SRS.md V2.0 S6.5` |
| `done` | `{ "result": PromptPackage, "warnings": [...], "logs": [...], "generationLogId": 101 }` | Generate selesai | V1 (extended V2) | `SRS.md V2.0 S8.4` |
| `error` | `{ "code": "PROVIDER_ERROR"\|"TIMEOUT"\|"CLASSIFICATION_ERROR"\|"INTERNAL", "message": "...", "stage": "..." }` | Error mid-stream | V1 (extended V2) | `SRS.md V2.0 S8.5` |

### 7.3 Stage List (V2)

| Stage | Isi | FR |
|---|---|---|
| `starting` | Validasi input + resolve provider + setup project | — |
| `character_profiles` | Master karakter | FR-05, FR-07 |
| `scenes` | Adegan berurut + voiceover + image_prompts varian | FR-03, FR-04, FR-06, FR-09 |
| `image_prompts` | Master list root | FR-06 |
| `supporting_characters` | Karakter pendukung/hewan | FR-08 |
| `moral_message` | Pesan moral penutup | FR-11 |

### 7.4 Contoh Stream Lengkap V2

```
event: stage
data: {"stage":"starting","message":"Memulai generate..."}

event: log
data: {"level":"info","message":"[generate] Resolving provider openrouter","timestamp":"2026-06-20T10:00:00.123Z"}

event: stage
data: {"stage":"character_profiles","message":"Membuat profil karakter..."}

event: log
data: {"level":"info","message":"[llm] Calling GPT-4o with prompt (1200 chars)","timestamp":"2026-06-20T10:00:01.456Z"}

event: progress
data: {"stage":"character_profiles","progress":50,"delta":"[{\"nama\":\"Hero\""}

event: progress
data: {"stage":"character_profiles","progress":100,"delta":"}]"}

event: log
data: {"level":"warn","message":"[classifier] AI confidence 0.65 di bawah threshold 0.7 untuk hutan-bg.png","timestamp":"2026-06-20T10:00:05.890Z"}

event: stage
data: {"stage":"scenes","message":"Membuat adegan berurut..."}

event: stage
data: {"stage":"image_prompts","message":"Membuat image prompt..."}

event: stage
data: {"stage":"supporting_characters","message":"Membuat karakter pendukung..."}

event: stage
data: {"stage":"moral_message","message":"Membuat pesan moral..."}

event: log
data: {"level":"info","message":"[generate] Consistency check: 0 warnings","timestamp":"2026-06-20T10:00:45.123Z"}

event: done
data: {"result":{...},"warnings":[],"logs":[...],"generationLogId":101}
```

### 7.5 Client Handling

- Client listen `event: stage`/`progress` -> render partial real-time (NFR-U1, NFR-U2).
- **`event: log` (V2)**: append ke LogViewer. Toggle `showLogs: false` (default) = skip. Toggle ON = render log lines + level badge (info=blue, warn=yellow, error=red) + timestamp. Buffer max 500 entries.
- `event: done` -> simpan `result`, tampilkan tombol export, simpan warnings.
- `event: error` -> tampilkan error state + opsi retry/switch provider.
- Stream ditutup server setelah `done`/`error`.
- Heartbeat `: ping\n\n` setiap 15s (best practice SSE).

---

## 8. Schemas (Zod V2)

Schema di `src/lib/validation/schemas.ts`.

### 8.1 Project Schemas

```ts
const CreateProjectInputSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  durationType: z.enum(['shorts', 'tutorial']),
  durationTargetSeconds: z.number().int().positive(),
  styleType: z.enum(['3D', '2D']),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).or(z.string()),
  storyDescription: z.string().max(500).trim().optional(),  // V2 NEW
});

const UpdateProjectInputSchema = CreateProjectInputSchema.partial();

const ProjectDTOSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  durationType: z.enum(['shorts', 'tutorial']),
  durationTargetSeconds: z.number().int(),
  styleType: z.enum(['3D', '2D']),
  aspectRatio: z.string(),
  status: z.enum(['draft', 'generating', 'complete', 'failed']),
  resultJson: z.unknown().nullable(),
  storyDescription: z.string().nullable(),  // V2 NEW
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});
```

### 8.2 GenerateInput Schema (V2 Extended)

```ts
const GenerateInputSchema = z.object({
  projectId: z.number().int().positive().optional(),
  input: z.object({
    title: z.string().min(3).max(200).trim(),
    storyDescription: z.string().max(500).trim().optional(),  // V2 NEW
    durationTarget: z.object({
      type: z.enum(['shorts', 'tutorial']),
      seconds: z.number().int().positive(),
    }),
    style: z.object({
      type: z.enum(['3D', '2D']),
      ratio: z.string(),
    }),
    providerId: z.number().int().positive().optional(),
    references: z.array(z.object({
      name: z.string(),
      type: z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']),  // V2: 6 opsi
      aiClassification: z.object({  // V2 NEW
        role: z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']),
        name: z.string().nullable(),
        description: z.string(),
        confidence: z.number().min(0).max(1),
      }).optional(),
    })).optional(),
  }),
});
```

### 8.3 ProviderConfig Schemas (V1 — tetap)

```ts
const CreateProviderConfigInputSchema = z.object({
  provider: z.enum(['ollama', 'openrouter', '9router', 'custom']),
  name: z.string().min(1).max(100),
  baseUrl: z.string().url(),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  isActive: z.number().int().min(0).max(1).optional(),
});

const UpdateProviderConfigInputSchema = CreateProviderConfigInputSchema.partial().omit({ provider: true });

const ProviderConfigDTOSchema = z.object({
  id: z.number(),
  userId: z.number(),
  provider: z.enum(['ollama', 'openrouter', '9router', 'custom']),
  name: z.string(),
  baseUrl: z.string(),
  model: z.string(),
  apiKeyMasked: z.string(),
  isActive: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

### 8.4 AssetReference DTO Schema (V2 Extended)

```ts
const AssetReferenceDTOSchema = z.object({
  id: z.number(),
  projectId: z.number().nullable(),  // V2: nullable untuk pre-submit
  tipe: z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']),  // V2: 6 opsi
  filename: z.string(),
  blobUrl: z.string(),
  label: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().nullable(),
  aiClassification: z.object({  // V2 NEW
    role: z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']),
    name: z.string().nullable(),
    description: z.string(),
    confidence: z.number().min(0).max(1),
  }).nullable(),
  createdAt: z.string().datetime(),
});
```

### 8.5 GenerationLog DTO Schema (V2 Extended)

```ts
const GenerationLogDTOSchema = z.object({
  id: z.number(),
  projectId: z.number(),
  provider: z.string(),
  model: z.string(),
  durationMs: z.number().nullable(),
  status: z.enum(['success', 'fail', 'partial']),
  errorMessage: z.string().nullable(),
  logsJson: z.array(z.object({  // V2 NEW
    level: z.enum(['info', 'warn', 'error']),
    message: z.string(),
    timestamp: z.string().datetime(),
  })).nullable(),
  createdAt: z.string().datetime(),
});
```

### 8.6 PromptPackageSchema (LLM Structured Output — unchanged V2)

```ts
const PromptPackageSchema = z.object({
  title: z.string(),
  duration_target: z.object({
    type: z.enum(['shorts','tutorial']),
    seconds: z.number(),
  }),
  style: z.object({
    type: z.enum(['3D','2D']),
    aspect_ratio: z.string(),
  }),
  character_profiles: z.array(z.object({
    nama: z.string(),
    gayarambut: z.string(),
    wajah_asal: z.string(),
    pakaian_atas: z.string(),
    pakaian_bawah: z.string(),
    alas_kaki: z.string(),
    deskripsi_latar: z.string(),
    aksi: z.string(),
    peran: z.enum(['utama', 'lain', 'pendamping']),
  })),
  scenes: z.array(z.object({
    order: z.number(),
    description: z.string(),
    voiceover_script: z.string(),
    image_prompts: z.object({
      characters: z.array(z.object({
        target: z.string(),
        prompt_text: z.string(),
        reference_filename: z.string().nullable(),
      })),
      backgrounds: z.array(z.object({
        target: z.string(),
        prompt_text: z.string(),
        reference_filename: z.string().nullable(),
      })),
    }),
  })),
  image_prompts: z.object({
    characters: z.array(z.object({
      target: z.string(),
      prompt_text: z.string(),
      reference_filename: z.string().nullable(),
    })),
    backgrounds: z.array(z.object({
      target: z.string(),
      prompt_text: z.string(),
      reference_filename: z.string().nullable(),
    })),
  }),
  supporting_characters: z.array(z.object({
    nama: z.string(),
    tipe: z.enum(['pendukung', 'hewan']),
    aksi: z.string(),
  })),
  moral_message: z.string(),
});
```

- Sitasi: `PRD.md V2.0 S8.2` ; `SRS.md V2.0 S7.5, S8.7`.
- Field snake_case — selaras PRD §8.2 + DB column.

### 8.7 ClassifyInput Schema (V2 NEW)

```ts
const ClassifyInputSchema = z.object({
  assetReferenceId: z.number().int().positive(),
});

const ClassificationResultSchema = z.object({
  role: z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']),
  name: z.string().nullable(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
});
```

### 8.8 Sub-resource DTO Schemas (V2 Updated)

```ts
const CharacterDTOSchema = z.object({
  id: z.number(), projectId: z.number(), nama: z.string(),
  gayarambut: z.string(), wajahAsal: z.string(), pakaianAtas: z.string(),
  pakaianBawah: z.string(), alasKaki: z.string(), deskripsiLatar: z.string(),
  aksi: z.string(), peran: z.enum(['utama','lain','pendamping']),
  createdAt: z.string().datetime(),
});

const SceneDTOSchema = z.object({
  id: z.number(), projectId: z.number(), orderNo: z.number().int(),
  description: z.string(), voiceoverScript: z.string(),
  createdAt: z.string().datetime(),
});

const ImagePromptDTOSchema = z.object({
  id: z.number(), projectId: z.number(), sceneId: z.number().nullable(),
  tipe: z.enum(['tokoh','background','prop','accessory','environment','other']),  // V2: 6 opsi
  target: z.string(),
  promptText: z.string(),
  referenceFilename: z.string().nullable(),
  createdAt: z.string().datetime(),
});
```

---

## 9. Error Envelope

### 9.1 Format

Lihat §3.3.

### 9.2 Daftar Error Code + HTTP Mapping (V2)

| Code | HTTP | Kapan | Contoh details | V1/V2 | Bukti |
|---|---|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod parse fail | `{ "field": "title", "min": 3, "received": 2 }` | V1 | `SRS.md V2.0 S8.5` |
| `VALIDATION_ERROR` | 422 | Business validation | `{ "field": "durationTargetSeconds", "max": 180 }` | V1+V2 | `PRD.md V2.0 S7 AC-02` |
| `UNAUTHORIZED` | 401 | Session tidak ada/expired | `{ }` | V1 | `SRS.md V2.0 S8.5` |
| `FORBIDDEN` | 403 | Ownership fail | `{ "resource": "project", "id": 42 }` | V1 | `SRS.md V2.0 S10.1 SEC-07` |
| `NOT_FOUND` | 404 | Resource tidak ada/soft deleted | `{ "resource": "project", "id": 99 }` | V1 | `SRS.md V2.0 S8.5` |
| `CONFLICT` | 409 | Unique constraint | `{ "field": "name", "value": "OpenRouter Utama" }` | V1 | `DATABASE_SCHEMA.md V2.0 S4.2` |
| `RATE_LIMITED` | 429 | Rate limit terlampaui | `{ "retryAfter": 6 }` | V1 | `SRS.md V2.0 S12 SRS-V2-A15` |
| `PROVIDER_ERROR` | 502 | LLM provider gagal | `{ "provider": "openrouter", "upstream": "..." }` | V1 | `SRS.md V2.0 S8.5` |
| `TIMEOUT` | 504 | LLM timeout | `{ "stage": "scenes", "elapsedMs": 60000 }` | V1 | `SRS.md V2.0 S8.5` |
| **`CLASSIFICATION_ERROR`** | **502** | **Vision LLM gagal** | `{ "assetReferenceId": 99, "reason": "timeout" }` | **NEW V2** | `PRD.md V2.0 S9.3` |
| `INTERNAL` | 500 | Error tak terduga | `{ }` | V1 | `SRS.md V2.0 S8.5` |
| `BAD_GATEWAY` | 502 | Storage/Turso gagal | `{ "service": "blob"|"turso" }` | V1 | ASUMSI |
| `SERVICE_UNAVAILABLE` | 503 | Health degraded | `{ "db": "fail" }` | V1 | ASUMSI |

### 9.3 Error Code di SSE error Event

SSE `error` event: `PROVIDER_ERROR`, `TIMEOUT`, **`CLASSIFICATION_ERROR`** (V2), `INTERNAL`.

### 9.4 Consistency Warning (FR-12) — V2 Extended

Bukan error — field `warnings[]` di `event: done`. Tidak block save.

```json
{
  "warnings": [
    { "code": "CONSISTENCY_MISMATCH", "message": "Karakter 'Hero' identitas beda di scene 2", "target": "Hero", "scene": 2 },
    { "code": "LOW_CLASSIFICATION_CONFIDENCE", "message": "AI confidence 0.65 di bawah threshold 0.7", "target": "hutan-bg.png", "confidence": 0.65 }
  ]
}
```

**V2 warning codes:**
- `CONSISTENCY_MISMATCH` (V1): identitas karakter beda lintas scene.
- **`LOW_CLASSIFICATION_CONFIDENCE` (V2)**: Vision LLM confidence < 0.7.

---

## 10. Rate Limiting

| Endpoint | Limit | Window | Header response | V2 Change | Bukti |
|---|---|---|---|---|---|
| `POST /api/v1/generate` | **10 req/min/user** | 60s | `X-RateLimit-*` | Tetap | `SRS.md V2.0 S12 SRS-V2-A15` |
| `POST /api/v1/upload/classify` | **30 req/min/user** | 60s | sama | **NEW V2** | ASUMSI SRS-V2-A12 |
| Lainnya (CRUD/setting/upload/export/dashboard) | **60 req/min/user** | 60s | sama | Tetap | ASUMSI |
| `POST /api/v1/upload` | 20 req/min/user | 60s | sama | Tetap | ASUMSI |

### 10.1 Header Rate Limit

```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1718803200
```

### 10.2 Perilaku 429

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 6
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1718803200

{ "error": { "code": "RATE_LIMITED", "message": "Terlalu banyak request generate. Coba lagi dalam 6 detik.", "details": { "retryAfter": 6 } }, "traceId": "req_abc123" }
```

### 10.3 Implementasi

Middleware `src/middleware.ts` (NextAuth + rate limit). V2 tidak ada perubahan arsitektur — tetap in-memory per instance. Multi-instance Vercel = perlu Upstash Redis (fase akhir).

---

## 11. Header Standar, CORS, Keamanan

### 11.1 Header Request Standar

| Header | Wajib | Deskripsi | Bukti |
|---|---|---|---|
| `Cookie: next-auth.session-token=...` | YA (protected) | Session NextAuth | `RAG-CONTEXT.md S5.3` |
| `Content-Type: application/json` | YA (body) | JSON request | §3.1 |
| `Content-Type: multipart/form-data; boundary=...` | YA (upload) | Upload file | §6.6 |
| `Accept: text/event-stream` | disarankan (generate) | SSE | §7 |
| `Accept-Language: id`|`en` | opsional | Override bahasa pesan error | ASUMSI |

### 11.2 Header Response Standar

| Header | Deskripsi | Bukti |
|---|---|---|
| `Content-Type` | per endpoint | §3.1 |
| `X-RateLimit-*` | lihat §10 | §10 |
| `X-Trace-Id` | ID trace | ASUMSI |
| `Content-Disposition: attachment; filename="..."` | export only | §6.7 |

### 11.3 CORS

| Aspek | Nilai | Bukti |
|---|---|---|
| Same-origin | Next.js App Router default | `RAG-CONTEXT.md S3` |
| Cross-origin API | TIDAK di-enable fase awal | ASUMSI |

### 11.4 Keamanan (V2)

| Aspek | Implementasi | V2 Change | Bukti |
|---|---|---|---|
| HTTPS only | Vercel default | Tetap | `SRS.md V2.0 S10.1 SEC-09` |
| CSRF | Next.js built-in + NextAuth CSRF | Tetap | `SRS.md V2.0 S10.1 SEC-05` |
| Input sanitization | Zod + escape HTML | Tetap | `SRS.md V2.0 S10.1 SEC-06` |
| API key encrypt | AES-256-GCM, mask di response | Tetap | `SRS.md V2.0 S10.1 SEC-01/SEC-02` |
| Server-only LLM/crypto | `import 'server-only'` | Tetap | `SRS.md V2.0 S10.1 SEC-03` |
| Ownership RBAC | `user_id` filter semua query | Tetap | `SRS.md V2.0 S10.1 SEC-07` |
| 9router localhost only | tidak reachable Vercel prod | Tetap | `RAG-CONTEXT.md S5.2, S9 G4` |
| **Vision LLM API key** | **Encrypt via `provider_configs` existing** | **V2 NEW** | `PRD.md V2.0 S5 FR-V2-02` |
| Rate limit | middleware | **V2: tambah limit `/upload/classify`** | §10 |
| Env secret | Vercel env, `.env.example` tanpa value | Tetap | `SRS.md V2.0 S10.1 SEC-08` |

---

## 12. Backward-Compat & Deprecation

| Aturan | Detail | V2 Notes | Bukti |
|---|---|---|---|
| Versioning | `/api/v1/*` | V2 semua ADDITIVE — tetap di `/api/v1/*` | §1.3 |
| Additive field | New field di response = non-breaking | V2: `storyDescription`, `aiClassification`, `logsJson` | §3.1 |
| Additive enum | New enum value = non-breaking | V2: `tipe` 2->6 opsi. Client V1 kirim 2 nilai, server accept. V2 kirim 6, server accept. | §8.4, §6.6 |
| Optional request field | New opsional = non-breaking | V2: `projectId` opsional di upload. `storyDescription` opsional. | §6.6, §8.2 |
| New endpoint | Tidak breaking | V2: `POST /upload/classify`, `GET /dashboard/stats` | §6.6, §6.9 |
| Deprecation header | `Sunset: <date>` + `Deprecation: true` (fase akhir) | Tidak ada deprecation di V2 | ASUMSI |
| End-of-life window | 6 bulan dari deprecation ke removal (fase akhir) | — | ASUMSI |

> **Backward compat strategy V2**: SEMUA perubahan V2 = additive. Existing V1 client yang ignore field baru tetap jalan. Migrasi V2 tidak break V1 client.

---

## 13. Webhook / Async

**TIDAK ADA webhook fase awal (V1 + V2).** Alasan:

1. LLM call synchronous/streaming via SSE — tidak ada job background perlu notifikasi. Sitasi: `RAG-CONTEXT.md S5.4`.
2. Export synchronous baca `result_json` snapshot. Sitasi: `DATABASE_SCHEMA.md V2.0 S12.3`.
3. Upload synchronous via Vercel Blob `put()` — langsung return URL (V2: dengan classification inline). Sitasi: `SRS.md V2.0 S5 (FR-17)`.
4. **V2 Vision LLM classification** synchronous inline saat upload. Tidak async. Sitasi: `PRD.md V2.0 S5 FR-V2-02`.
5. Tidak ada integrasi pihak ketiga yang butuh webhook (OOS-3). Sitasi: `PRD.md V2.0 S11 OOS-3`.

**Bila fase akhir butuh webhook** (ASUMSI):
- Event: `generate.completed`, `generate.failed`, `classification.completed`
- Payload: `{ "projectId": 42, "status": "success"|"fail", "generationLogId": 101, "timestamp": "..." }`
- Signature: HMAC-SHA256 header `X-PromptFlow-Signature: <hex>`
- Retry: 3x exponential backoff

---

## 14. Daftar Status Code

| HTTP | Nama | Dipakai endpoint | V1/V2 | Bukti |
|---|---|---|---|---|
| 200 | OK | GET semua, PATCH, SSE generate (stream mulai) | V1 | `SRS.md V2.0 S8.5` |
| 201 | Created | POST projects, POST providers, POST upload, POST upload/classify | V1+V2 | §6 |
| 204 | No Content | DELETE project, DELETE provider, DELETE upload | V1 | §6 |
| 400 | Bad Request | VALIDATION_ERROR (Zod fail) | V1 | `SRS.md V2.0 S8.5` |
| 401 | Unauthorized | UNAUTHORIZED | V1 | `SRS.md V2.0 S8.5` |
| 403 | Forbidden | FORBIDDEN (ownership fail) | V1 | `SRS.md V2.0 S10.1 SEC-07` |
| 404 | Not Found | NOT_FOUND | V1 | `SRS.md V2.0 S8.5` |
| 409 | Conflict | CONFLICT (unique constraint) | V1 | `DATABASE_SCHEMA.md V2.0 S4.2` |
| 422 | Unprocessable Entity | VALIDATION_ERROR business | V1+V2 | `PRD.md V2.0 S7 AC-02` |
| 429 | Too Many Requests | RATE_LIMITED | V1 | `SRS.md V2.0 S12 SRS-V2-A15` |
| 500 | Internal Server Error | INTERNAL | V1 | `SRS.md V2.0 S8.5` |
| 502 | Bad Gateway | PROVIDER_ERROR, CLASSIFICATION_ERROR (V2), BAD_GATEWAY | V1+V2 | `SRS.md V2.0 S8.5` |
| 503 | Service Unavailable | SERVICE_UNAVAILABLE | V1 | ASUMSI |
| 504 | Gateway Timeout | TIMEOUT | V1 | `SRS.md V2.0 S8.5` |

---

## 15. Changelog V1 to V2

### 15.1 Endpoint Changes

| # | Endpoint | Tipe Perubahan V2 | Detail |
|---|---|---|---|
| 4 | `GET /api/v1/projects` | Enhancement | Pagination `?page=&limit=` dipakai. Response +`storyDescription`. |
| 5 | `POST /api/v1/projects` | Extension | +`storyDescription` opsional (max 500 char). |
| 9 | `POST /api/v1/generate` | Extension+SSE | +`storyDescription`, +`aiClassification` refs. SSE +`log` event. Stage +`supporting_characters`. Warnings +`LOW_CLASSIFICATION_CONFIDENCE`. |
| 15 | `POST /api/v1/upload` | Major | `projectId` OPSIONAL. `tipe` 6 opsi. +`aiClassification` response. Auto-classify. |
| 17 | `DELETE /api/v1/upload` | Extension | `projectId` OPSIONAL untuk orphan ref delete. |
| 21 | `GET /api/v1/projects/[id]/image-prompts` | Extension | `tipe` filter 6 nilai. |
| 22 | `GET /api/v1/projects/[id]/logs` | Extension | +`logsJson` per log. +`provider` filter. |

### 15.2 New Endpoints V2

| # | Endpoint | Deskripsi |
|---|---|---|
| 16 | `POST /api/v1/upload/classify` | Trigger AI Vision classification per asset reference. |
| 23 | `GET /api/v1/dashboard/stats` | Enriched dashboard: 6-8 metric + per-provider breakdown + recent projects + storage + weekly trend. |

### 15.3 Schema Changes

| Schema | Tipe Perubahan V2 | Detail |
|---|---|---|
| `CreateProjectInputSchema` | Extension | +`storyDescription: z.string().max(500).optional()` |
| `ProjectDTOSchema` | Extension | +`storyDescription: z.string().nullable()` |
| `GenerateInputSchema` | Extension | +`storyDescription`. `references[].type` 6 enum. +`references[].aiClassification` |
| `AssetReferenceDTOSchema` | Major | `projectId: nullable`. `tipe` 6 enum. +`aiClassification: object nullable` |
| `GenerationLogDTOSchema` | Extension | +`logsJson: array nullable` |
| `ImagePromptDTOSchema` | Extension | `tipe` 6 enum |
| `ClassifyInputSchema` (NEW) | New | `{assetReferenceId: number}` |
| `ClassificationResultSchema` (NEW) | New | `{role, name, description, confidence}` |
| `DashboardStatsDTOSchema` (NEW) | New | Lihat §6.9 |

### 15.4 SSE Protocol Changes

| Aspek | V1 | V2 |
|---|---|---|
| Event types | `progress`, `done`, `error` | + **`log`** (NEW) |
| `log` event data | — | `{level, message, timestamp}` |
| `done` warnings | `CONSISTENCY_MISMATCH` | + **`LOW_CLASSIFICATION_CONFIDENCE`** |
| `error` codes | `PROVIDER_ERROR`, `TIMEOUT`, `INTERNAL` | + **`CLASSIFICATION_ERROR`** |
| Stage list | 4 stages | + **`supporting_characters`** |
| `done` logs field | — | + **`logs: array`** |

### 15.5 Database Schema Changes (V2)

| Tabel | Kolom Baru | Tipe | Nullable | Bukti |
|---|---|---|---|---|
| `projects` | `story_description` | TEXT | YES | `DATABASE_SCHEMA.md V2.0 S4.3, S7.2` |
| `asset_references` | `ai_classification` | TEXT | YES | `DATABASE_SCHEMA.md V2.0 S4.4, S7.2` |
| `generation_logs` | `logs_json` | TEXT | YES | `DATABASE_SCHEMA.md V2.0 S4.8, S7.2` |

Semua kolom baru nullable -> 100% backward-compatible.

### 15.6 Backward Compatibility Verdict

**100% backward-compatible V1 to V2.** Semua perubahan V2 additive:
- Tidak ada endpoint V1 yang dihapus
- Tidak ada field V1 yang diubah
- Tidak ada enum value V1 yang dihapus
- Tidak ada breaking change status code
- Semua field baru opsional
- V1 client tidak perlu update

---

## 16. Asumsi API + Referensi

### 16.1 Asumsi API V2

| ID | Asumsi | Status | Dampak | Sitasi |
|---|---|---|---|---|
| API-A1 | Versioning `/api/v1/*` | DIKONFIRMASI | Locked | `REVIEW_REPORT.md S10` |
| API-A2 | Envelope `{ data, pagination }` | ASUMSI | SRS hanya definisikan error | `SRS.md V2.0 S8.5` |
| API-A3 | camelCase field JSON | ASUMSI | DB snake_case, mapping di repo | `DATABASE_SCHEMA.md V2.0 S4` |
| API-A4 | PromptPackageSchema snake_case | DIKONFIRMASI | Verbatim match | `PRD.md V2.0 S8.2` |
| API-A5 | NextAuth credentials | ASUMSI | Bisa OAuth fase akhir | `RAG-CONTEXT.md S5.3` |
| API-A6 | Bearer token opsional | ASUMSI | Fase awal cookie | ASUMSI |
| API-A7 | Rate limit 10/min generate | ASUMSI SRS-V2-A15 | In-memory fase awal | `SRS.md V2.0 S12` |
| API-A8 | Rate limit 60/min umum | ASUMSI | Best practice | — |
| API-A9 | Upload max 10MB | ASUMSI SRS-V2-A17 | Validasi Zod | `SRS.md V2.0 S9.1` |
| API-A10 | Soft delete project | ASUMSI SRS-V2-A16 | DELETE = 204 | `DATABASE_SCHEMA.md V2.0 S11.1` |
| API-A11 | PATCH bukan PUT | ASUMSI | Tetap | `SRS.md V2.0 S7.1` |
| API-A12 | providerId opsional | ASUMSI | Default is_active=1 | `DATABASE_SCHEMA.md V2.0 S4.2` |
| API-A13 | projectId opsional di generate | ASUMSI | Ephemeral bila kosong | `SRS.md V2.0 S5 (FR-15)` |
| API-A14 | V2: upload projectId OPSIONAL | ASUMSI SRS-V2-A5 | Pre-submit orphan refs | `PRD.md V2.0 S5 FR-V2-01` |
| API-A15 | V2: tipe 6 opsi | DIKONFIRMASI | App layer Zod | `SRS.md V2.0 S7.3` |
| API-A16 | V2: SSE log event | DIKONFIRMASI | Frontend LogViewer | `SRS.md V2.0 S6.5` |
| API-A17 | V2: auto-classify saat upload | ASUMSI SRS-V2-A11 | Seamless UX | `PRD.md V2.0 S5 FR-V2-02` |
| API-A18 | V2: Vision LLM = GPT-4o/Gemini | ASUMSI SRS-V2-A1 | Provider support | `PRD.md V2.0 S12 VD-1` |
| API-A19 | V2: confidence threshold 0.7 | ASUMSI SRS-V2-A13 | UI warn | `SRS.md V2.0 S14` |
| API-A20 | V2: storyDescription max 500 | DIKONFIRMASI | Zod validation | `PRD.md V2.0 S5 FR-V2-04` |
| API-A21 | V2: dashboard load <= 1.5s | ASUMSI SRS-V2-P2 | Performance | `SRS.md V2.0 S11` |
| API-A22 | SSE heartbeat 15s | ASUMSI | Proxy keepalive | — |
| API-A23 | traceId di error | ASUMSI | Debugging | `SRS.md V2.0 S8.5` |
| API-A24 | 9router localhost only | DIKONFIRMASI | Prod: cloud/custom | `RAG-CONTEXT.md S5.2` |
| API-A25 | Webhook TIDAK ADA | DIKONFIRMASI OOS | LLM synchronous | `PRD.md V2.0 S11` |

### 16.2 Referensi Internal

| Dokumen | Path | Bagian relevan |
|---|---|---|
| RAG-CONTEXT | `product-docs/RAG-CONTEXT.md` | S3, S5, S8, S9 |
| PRD V2.0 | `product-docs/PRD.md` | S5 (FR), S8 (schema), S9 (API) |
| SRS V2.0 | `product-docs/SRS.md` | S4 (arch), S6 (spec V2), S7 (schema), S8 (API), S9 (constraint), S10 (security), S12 (phases) |
| DATABASE_SCHEMA V2.0 | `product-docs/DATABASE_SCHEMA.md` | S4 (entities+V2), S7 (constraints V2), S9 (migration V2) |
| AGENTS.md | `product-docs/AGENTS.md` | S7 (endpoints), S9 (PromptPackageSchema), S10 (security) |
| REVIEW_REPORT | `product-docs/REVIEW_REPORT.md` | S10 WARN-002 (locking /api/v1/*) |

### 16.3 Sitasi Eksternal Kunci

| URL | Klaim didukung | Bagian |
|---|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | createOpenAICompatible, structured output, streaming | §1.1, §6.4, §8.6 |
| https://openrouter.ai/docs/api/reference/authentication | OpenRouter base URL, Bearer | §6.5, §16.1 API-A24 |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat | §6.5 |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js, libSQL HTTP | §11.4 |
| https://vercel.com/docs/vercel-blob | Vercel Blob upload | §6.6 |
| https://platform.openai.com/docs/guides/vision | GPT-4o Vision API | §6.6, §6.6.2 |
| https://ai.google.dev/gemini-api/docs/vision | Gemini Vision API | §6.6, §6.6.2 |
| https://recharts.org/ | Dashboard chart library | §6.9 (ASUMSI) |

---

**Dokumen ini fokus pada KONTRAK API V2 siap pakai agent eksekutor (backend + frontend). V2 = backward-compatible additive layer di atas V1. Tujuan bisnis di BRD V2, pasar di MRD V2, produk di PRD V2, spesifikasi teknis di SRS V2, arsitektur di PROJECT_ARCHITECTURE, data di DATABASE_SCHEMA V2, aturan kode di CODING_RULES. API_CONTRACT tidak membangun deliverable akhir / menulis kode — hanya kontrak.**

> **Dibuat oleh:** docgen-api-spec subagent
> **Tanggal:** 2026-06-20
> **Versi:** 2.0
