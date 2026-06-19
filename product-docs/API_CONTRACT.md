# API Contract — PromptFlow

> **Versi:** 1.0
> **Dibuat:** 2026-06-19
> **Status:** Draft
> **Pemilik:** Bos Agrian
> **Sumber kebenaran:** `product-docs/RAG-CONTEXT.md` + `product-docs/PRD.md` + `product-docs/SRS.md` + `product-docs/DATABASE_SCHEMA.md` + `product-docs/PROJECT_ARCHITECTURE.md` (bersitasi per klaim penting)
> **Root proyek:** `C:\laragon\www\PromptFlow`
> **GitHub:** https://github.com/agrianwahab29/promptflow.git
> **Catatan:** Kontrak API diturunkan dari SRS §7 (Interface/API Overview, 13 route, error envelope asumsi, streaming SSE) + PRD §8.2 (PromptPackageSchema) + DATABASE_SCHEMA (entitas & field) + PROJECT_ARCHITECTURE (folder, route, lib/ai, lib/db). Setiap endpoint tertelusur ke fitur PRD (FR-XX) + realisasi SRS. Item tanpa bukti eksplisit ditandai "ASUMSI".

---

## Daftar Isi

1. Ringkasan API + Base URL + Environment + Versioning
2. Autentikasi & Otorisasi
3. Konvensi Umum
4. Pagination, Sorting, Filtering, Searching
5. Daftar Endpoint (tabel ringkas)
6. Detail Endpoint per Grup
7. SSE Event Protocol (POST /api/v1/generate)
8. Schemas (Zod)
9. Error Envelope
10. Rate Limiting
11. Header Standar, CORS, Keamanan
12. Backward-Compat & Deprecation
13. Webhook / Async
14. Daftar Status Code
15. Asumsi API + Referensi

---

## 1. Ringkasan API + Base URL + Environment + Versioning

### 1.1 Ringkasan

PromptFlow = web app fullstack Next.js App Router. API = **Route Handlers** (`src/app/api/*/route.ts`) + **Server Actions** (mutation dari Client Component). Response utama = **JSON** untuk CRUD/setting/upload/export; **SSE (`text/event-stream`)** untuk endpoint generate yang memanggil LLM streaming.

- Sitasi: `SRS.md 7` ; `PROJECT_ARCHITECTURE.md 5 (src/app/api)`

| Aspek | Nilai | Bukti |
|---|---|---|
| Tipe API | REST (Route Handlers) + Server Actions + SSE untuk streaming LLM | `SRS.md 3.2 Layer 2, 7` |
| Format request | `application/json` (CRUD/setting), `multipart/form-data` (upload), `application/json` (generate) | `SRS.md 7` |
| Format response | `application/json` (CRUD/setting), `text/event-stream` (generate), `application/json` / `text/markdown` (export) | `SRS.md 7.2` |
| Auth | NextAuth.js session cookie (Bearer token opsional ASUMSI) | `SRS.md 5 (FR-18), 9.1 SEC-11` ; `PROJECT_ARCHITECTURE.md 7.4` |
| Multi-provider LLM | Server-side only via `createOpenAICompatible` (Ollama cloud/OpenRouter/9router/custom). API key user dienkripsi at rest | `RAG-CONTEXT.md 5.1` ; `SRS.md 5 (FR-13, FR-14), 9.1 SEC-03` |

### 1.2 Base URL + Environment

| Environment | Base URL | Catatan | Bukti |
|---|---|---|---|
| Dev (lokal) | `http://localhost:3000/api/v1` | Next.js dev server. 9router `http://localhost:20128/v1` reachable | ASUMSI `RAG-CONTEXT.md 5.2` |
| Staging | `https://<staging>.vercel.app/api/v1` | Vercel preview deployment | ASUMSI `RAG-CONTEXT.md 2.1` |
| Prod | `https://<prod-domain>/api/v1` | Vercel production, HTTPS default | `SRS.md 9.1 SEC-09` |

> 9router (`http://localhost:20128/v1`) = **dev/local only**, tidak reachable dari Vercel prod. Prod: user pakai Ollama cloud/OpenRouter/custom. Sitasi: `RAG-CONTEXT.md 5.2, 9 G4` ; `PROJECT_ARCHITECTURE.md 7.1, 8`.

### 1.3 Versioning

| Strategi | Rekomendasi | Justifikasi | Bukti |
|---|---|---|---|
| **URI prefix** `/api/v1/*` | **DIPILIH** (ASUMSI) | Eksplisit, cache-friendly, mudah migrate. Cocok Next.js App Router (folder `/api/v1/projects/route.ts`) | ASUMSI (paket konteks) |
| Header `Accept-Version: 1` | Alternatif | URL tetap bersih, tapi butuh middleware parse | ASUMSI |
| No versioning | Tidak direkomendasi | Sulit breaking change fase akhir | — |

**Aturan:**
- Versi mayor di URI: `/api/v1`, `/api/v2` (future).
- Breaking change = bump mayor. Non-breaking (additive field, new endpoint) tetap v1.
- Catatan: SRS §7.1 & PROJECT_ARCHITECTURE §5 mendokumentasikan route tanpa prefix (`/api/projects`). Implementasi Route Handler sebaiknya pakai struktur folder `/api/v1/projects/route.ts` agar selaras kontrak ini (ASUMSI — keputusan final bisa di `/api/*` murni bila user prefer).
- Server Actions (mutation dari Client Component) tidak punya URI version terpisah — ikut versi modul yang memanggilnya. Server Action = internal contract, tidak diekspos ke pihak ketiga.

---

## 2. Autentikasi & Otorisasi

### 2.1 Skema Autentikasi

| Aspek | Nilai | Bukti |
|---|---|---|
| Mekanisme | NextAuth.js (Auth.js v5+) credentials provider | `SRS.md 5 (FR-18), 4.1` ; ASUMSI SRS-A1 `RAG-CONTEXT.md 9 G2` |
| Token/session | JWT cookie session (atau Turso adapter DB session) | `PROJECT_ARCHITECTURE.md 7.4` ; ASUMSI ARCH-A13 |
| Cara dapat session | POST `/api/v1/auth/[...nextauth]` (login callback NextAuth) | `SRS.md 7.1` |
| Masa berlaku | NextAuth default (JWT refresh). ASUMSI 30 hari idle | ASUMSI |
| Refresh | NextAuth JWT auto-refresh bila session active | ASUMSI |
| Bearer alternatif | Opsional `Authorization: Bearer <nextauth-jwt>` untuk API terprogram (ASUMSI — bila user butuh akses API non-browser) | ASUMSI |

### 2.2 Protected Routes

Middleware `lib/auth/middleware.ts` proteksi:
- Pages: `/projects`, `/settings`, `/generate` (redirect ke `/login` bila unauth)
- API: `/api/v1/*` kecuali `/api/v1/auth/*` dan `/api/v1/health`
- Sitasi: `SRS.md 9.1 SEC-11` ; `PROJECT_ARCHITECTURE.md 7.4, 9 SB-06`

### 2.3 RBAC / Scope per Endpoint

Ownership check: `project.user_id === session.user.id` / `provider_configs.user_id === session.user.id`. User hanya akses resource miliknya. Sitasi: `SRS.md 9.1 SEC-07` ; `DATABASE_SCHEMA.md 11.3`.

| Endpoint | Auth | Scope/Ownership | Bukti |
|---|---|---|---|
| `POST /api/v1/auth/[...nextauth]` | Public | NextAuth handler | `SRS.md 7.1` |
| `GET /api/v1/auth/session` | Session | Ambil session sendiri | ASUMSI |
| `GET /api/v1/health` | Public | Health check | ASUMSI |
| `GET /api/v1/projects` | wajib | Filter `user_id = session.user.id` | `SRS.md 5 (FR-15), 9.1 SEC-07` |
| `POST /api/v1/projects` | wajib | Bind `user_id = session.user.id` | `SRS.md 5 (FR-15)` |
| `GET /api/v1/projects/[id]` | wajib | Ownership check | `SRS.md 5 (FR-15)` |
| `PATCH /api/v1/projects/[id]` | wajib | Ownership check | `SRS.md 5 (FR-15)` |
| `DELETE /api/v1/projects/[id]` | wajib | Ownership check (soft delete) | `SRS.md 5 (FR-15)` |
| `POST /api/v1/generate` | wajib | Provider config milik user | `SRS.md 5 (FR-03..FR-12)` |
| `GET /api/v1/settings/providers` | wajib | Filter `user_id` | `SRS.md 5 (FR-13)` |
| `POST /api/v1/settings/providers` | wajib | Bind `user_id` | `SRS.md 5 (FR-13, FR-14)` |
| `PATCH /api/v1/settings/providers/[id]` | wajib | Ownership check | `SRS.md 5 (FR-13)` |
| `DELETE /api/v1/settings/providers/[id]` | wajib | Ownership check | `SRS.md 5 (FR-13)` |
| `POST /api/v1/settings/providers/[id]/test` | wajib | Ownership check | ASUMSI |
| `POST /api/v1/upload` | wajib | Bind file ke project milik user | `SRS.md 5 (FR-17)` |
| `DELETE /api/v1/upload` | wajib | Ownership project | `SRS.md 5 (FR-17)` |
| `GET /api/v1/projects/[id]/export` | wajib | Ownership check | `SRS.md 5 (FR-16)` |
| `GET /api/v1/projects/[id]/characters` | wajib | Ownership check | `DATABASE_SCHEMA.md 4.5` |
| `GET /api/v1/projects/[id]/scenes` | wajib | Ownership check | `DATABASE_SCHEMA.md 4.6` |
| `GET /api/v1/projects/[id]/image-prompts` | wajib | Ownership check | `DATABASE_SCHEMA.md 4.7` |
| `GET /api/v1/projects/[id]/logs` | wajib | Ownership check | `DATABASE_SCHEMA.md 4.8` |

### 2.4 API Key User (LLM Provider) — Server-Side Only

API key user untuk LLM provider (Ollama/OpenRouter/9router/custom) **TIDAK** dipakai client untuk autentikasi PromptFlow API. Disimpan terenkripsi (AES-256-GCM) di `provider_configs.api_key_encrypted`, di-decrypt hanya server-side di `lib/ai/provider-registry.ts` saat panggil LLM. Response API = mask `****`. Sitasi: `SRS.md 5 (FR-14), 9.1 SEC-01/SEC-02/SEC-03` ; `DATABASE_SCHEMA.md 11.1`.

---

## 3. Konvensi Umum

### 3.1 Format & Casing

| Aspek | Nilai | Bukti |
|---|---|---|
| Content-Type request | `application/json; charset=utf-8` (CRUD/setting/generate), `multipart/form-data` (upload) | `SRS.md 7` |
| Content-Type response | `application/json; charset=utf-8` (CRUD/setting), `text/event-stream; charset=utf-8` (generate), `application/json` / `text/markdown` (export, dengan `Content-Disposition: attachment`) | `SRS.md 7.2` |
| Casing field JSON | **camelCase** untuk request body + response JSON (konvensi JS/Next.js). Catatan: kolom DB snake_case (`DATABASE_SCHEMA.md`), mapping di repository layer | ASUMSI (best practice Next.js) |
| Casing field PromptPackageSchema (LLM output) | **snake_case-ish native**: `character_profiles`, `image_prompts`, `voiceover_script`, `moral_message`, `deskripsi_latar`, `alas_kaki`, `pakaian_atas`, `pakaian_bawah`, `wajah_asal`, `gayarambut` (sesuai PRD §8.2 + SRS §8.7) | `PRD.md 8.2` ; `SRS.md 8.7` |
| Encoding | UTF-8 | ASUMSI |
| Date/time | ISO-8601 string (`2026-06-19T12:00:00Z`) di JSON response. DB simpan unix epoch integer (`DATABASE_SCHEMA.md 1.3`) — mapping di repository | ASUMSI |
| ID | integer auto-increment (DB) → return sebagai number di JSON | `DATABASE_SCHEMA.md 4` |

### 3.2 Envelope Respons Sukses

**CRUD / Setting (single resource):**
```json
{
  "data": { }
}
```

**CRUD / Setting (list paginated):**
```json
{
  "data": [ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

**Generate (SSE):** Lihat §7 SSE Event Protocol. Bukan JSON envelope, tapi event stream.

**Export:** Body = file content (JSON/markdown), header `Content-Disposition: attachment`. Bukan envelope.

> Catatan: ASUMSI envelope `data` + `pagination`. Bisa disederhanakan ke flat object bila user prefer. SRS §7.3 hanya definisikan error envelope, tidak sukses envelope.

### 3.3 Error Envelope (ASUMSI)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title minimal 3 karakter",
    "details": { "field": "title", "min": 3, "received": 2 }
  },
  "traceId": "req_abc123"
}
```

| Field | Tipe | Wajib | Deskripsi | Bukti |
|---|---|---|---|---|
| `error.code` | string | YA | Kode error stabil (lihat §9) | `SRS.md 7.3` |
| `error.message` | string | YA | Pesan bahasa aktif (ID/EN, FR-19) | `SRS.md 7.3` ; `PRD.md 5 (FR-19)` |
| `error.details` | object | TIDAK | Detail tambahan (field Zod error, provider error context) | `SRS.md 7.3` |
| `traceId` | string | TIDAK | ID trace untuk debugging (ASUMSI) | ASUMSI |

### 3.4 Idempotency

| Endpoint | Idempotent? | Mekanisme | Bukti |
|---|---|---|---|
| GET, PATCH, DELETE | Ya (by design) | Resource by id | ASUMSI |
| POST /api/v1/projects | Tidak | Setiap create = record baru. Tidak ada natural key unik per user | ASUMSI |
| POST /api/v1/generate | Tidak | Setiap generate = log baru + overwrite `result_json` bila projectId ada | ASUMSI |
| POST /api/v1/upload | Tidak | Setiap upload = `asset_references` baru. Filename bisa sama (overwrite Blob ASUMSI) | ASUMSI |
| POST /api/v1/settings/providers | Tidak, tapi unique constraint | Unique (`user_id`, `name`) → 409 bila duplikat | `DATABASE_SCHEMA.md 4.2` |

Header idempotency-key (`Idempotency-Key: <uuid>`) tidak diimplementasi fase awal (ASUMSI — bisa ditambah fase akhir untuk retry aman).

### 3.5 Timezone

Semua timestamp di JSON response = ISO-8601 UTC (`Z` suffix). DB simpan unix epoch second (timezone-agnostic). ASUMSI.

---

## 4. Pagination, Sorting, Filtering, Searching

### 4.1 Pagination

Query parameter standar untuk endpoint list (`GET /api/v1/projects`, `GET /api/v1/projects/[id]/logs`, dll).

| Param | Tipe | Default | Validasi | Bukti |
|---|---|---|---|---|
| `page` | integer | 1 | `>= 1` | ASUMSI (paket konteks) |
| `limit` | integer | 20 | `1..100` (ASUMSI max 100) | ASUMSI |

Response metadata:
```json
{
  "pagination": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 }
}
```

### 4.2 Sorting

| Param | Tipe | Default | Format | Contoh |
|---|---|---|---|---|
| `sort` | string | per endpoint | `<field>:asc|desc` | `sort=createdAt:desc` |

Contoh: `GET /api/v1/projects?sort=createdAt:desc` → list project terbaru. Default project: `createdAt:desc` (via index `idx_projects_user_created`). Sitasi: `DATABASE_SCHEMA.md 5 #4`.

### 4.3 Filtering

| Endpoint | Param filter | Contoh | Bukti |
|---|---|---|---|
| `GET /api/v1/projects` | `status`, `durationType` | `?status=complete&durationType=shorts` | `DATABASE_SCHEMA.md 4.3` |
| `GET /api/v1/projects/[id]/image-prompts` | `tipe`, `sceneId` | `?tipe=tokoh&sceneId=5` (varian per scene) | `DATABASE_SCHEMA.md 4.7, 6.2 #2` |
| `GET /api/v1/projects/[id]/characters` | `peran` | `?peran=utama` | `DATABASE_SCHEMA.md 4.5` |

> Filter selalu scoped per `user_id` (ownership) + `project_id` (path param). Tidak ada filter lintas user.

### 4.4 Searching

| Endpoint | Param | Behavior | Bukti |
|---|---|---|---|
| `GET /api/v1/projects` | `q` | LIKE search di `title` (ASUMSI). Contoh `?q=anak` | ASUMSI |

> Search di endpoint lain (characters, scenes) = fase akhir (COULD). Fase awal: list + filter saja.

---

## 5. Daftar Endpoint (Tabel Ringkas)

Total **20 endpoint** (ASUMSI — termasuk health, auth session, test connection, sub-resource list).

| # | Method | Path | Nama | Auth | Ringkasan | Fitur PRD / SRS |
|---|---|---|---|---|---|---|
| 1 | GET/POST | `/api/v1/auth/[...nextauth]` | NextAuth handler | Public | Login/logout/session/callback NextAuth | `FR-18` ; `SRS.md 7.1` |
| 2 | GET | `/api/v1/auth/session` | Get session | Session | Ambil session user aktif | ASUMSI |
| 3 | GET | `/api/v1/health` | Health check | Public | Status app + DB + env | ASUMSI |
| 4 | GET | `/api/v1/projects` | List projects | wajib | Paginate project per user | `FR-15` ; `SRS.md 7.1` |
| 5 | POST | `/api/v1/projects` | Create project | wajib | Simpan metadata + result generate | `FR-15` ; `SRS.md 7.1` |
| 6 | GET | `/api/v1/projects/[id]` | Detail project | wajib | By id + ownership | `FR-15` ; `SRS.md 7.1` |
| 7 | PATCH | `/api/v1/projects/[id]` | Update project | wajib | Update metadata + re-generate overwrite | `FR-15` ; `SRS.md 7.1` |
| 8 | DELETE | `/api/v1/projects/[id]` | Delete project | wajib | Soft delete (`deleted_at`) + cascade child | `FR-15` ; `SRS.md 7.1` |
| 9 | POST | `/api/v1/generate` | Generate prompt package | wajib | Streaming SSE, body input → PromptPackage | `FR-03..FR-12` ; `SRS.md 7.2` |
| 10 | GET | `/api/v1/settings/providers` | List providers | wajib | Provider config per user (key mask) | `FR-13, FR-14` ; `SRS.md 7.1` |
| 11 | POST | `/api/v1/settings/providers` | Add provider | wajib | Save config (encrypt key) | `FR-13, FR-14` ; `SRS.md 7.1` |
| 12 | PATCH | `/api/v1/settings/providers/[id]` | Update provider | wajib | Update config | `FR-13` ; `SRS.md 7.1` |
| 13 | DELETE | `/api/v1/settings/providers/[id]` | Delete provider | wajib | Hapus config | `FR-13` ; `SRS.md 7.1` |
| 14 | POST | `/api/v1/settings/providers/[id]/test` | Test connection | wajib | Test reachability provider + model | ASUMSI |
| 15 | POST | `/api/v1/upload` | Upload reference | wajib | Multipart → Vercel Blob → AssetReference | `FR-17` ; `SRS.md 7.1` |
| 16 | DELETE | `/api/v1/upload` | Delete reference | wajib | Hapus Blob + AssetReference by `?name=` | `FR-17` ; `SRS.md 5 (FR-17)` |
| 17 | GET | `/api/v1/projects/[id]/export` | Export project | wajib | `?format=json\|markdown` file download | `FR-16` ; `SRS.md 7.1` |
| 18 | GET | `/api/v1/projects/[id]/characters` | List characters | wajib | Master karakter per project | `FR-07, FR-12` ; `DATABASE_SCHEMA.md 4.5` |
| 19 | GET | `/api/v1/projects/[id]/scenes` | List scenes | wajib | Adegan berurut per project | `FR-03, FR-09` ; `DATABASE_SCHEMA.md 4.6` |
| 20 | GET | `/api/v1/projects/[id]/image-prompts` | List image prompts | wajib | Master + varian per scene | `FR-06` ; `DATABASE_SCHEMA.md 4.7` |
| 21 | GET | `/api/v1/projects/[id]/logs` | List generation logs | wajib | History generate per project | `DATABASE_SCHEMA.md 4.8` ; `BRD.md 3.2 K5` |

> Catatan: SRS §7.1 daftar 13 route inti. Endpoint #2, #3, #14, #18-21 = tambahan asumsi dari paket konteks / DATABASE_SCHEMA untuk kelengkapan kontrak. PATCH dipakai (bukan PUT) untuk update partial metadata project — konsisten REST. SRS §7.1 menyebut PUT; implementasi bebas PUT/PATCH asal dokumentasi konsisten.

---

## 6. Detail Endpoint per Grup

### 6.1 Auth — `/api/v1/auth/*`

#### 6.1.1 GET/POST `/api/v1/auth/[...nextauth]`

NextAuth handler (catch-all). Tangani login, logout, session, callback, signin, signout.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET/POST (NextAuth routing internal) | `SRS.md 7.1` |
| Auth | Public | — |
| Path param | `[...nextauth]` = action NextAuth (`signin`, `signout`, `session`, `callback/credentials`) | `PROJECT_ARCHITECTURE.md 7.4` |
| Request body | Form NextAuth credentials: `email`, `password` (provider credentials ASUMSI) | ASUMSI SRS-A1 |
| Response sukses | Redirect / JSON session (NextAuth default) | `PROJECT_ARCHITECTURE.md 7.4` |
| Response error | 401 `{ error: { code: "UNAUTHORIZED", message: "Email atau password salah" } }` | ASUMSI |
| Relasi | `users` tabel (`DATABASE_SCHEMA.md 4.1`) | — |
| Fitur PRD | FR-18 | `PRD.md 5` |

Contoh request (login form):
```http
POST /api/v1/auth/callback/credentials HTTP/1.1
Content-Type: application/x-www-form-urlencoded

email=demo%40promptflow.local&password=demo123
```

Contoh response sukses: redirect 302 ke `/generate` + set cookie `next-auth.session-token`.

#### 6.1.2 GET `/api/v1/auth/session`

| Aspek | Detail |
|---|---|
| Method | GET |
| Auth | Session (return null bila unauth) |
| Response sukses 200 | `{ "data": { "user": { "id": 1, "email": "demo@promptflow.local", "name": "Demo User" }, "expires": "2026-07-19T00:00:00.000Z" } }` |
| Response unauth 200 | `{ "data": null }` (ASUMSI — NextAuth default return null session) |
| Relasi | `users` tabel |
| Bukti | ASUMSI (NextAuth `/api/auth/session` convention) |

---

### 6.2 Health — `/api/v1/health`

#### 6.2.1 GET `/api/v1/health`

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | ASUMSI |
| Auth | Public | ASUMSI |
| Response 200 | `{ "data": { "status": "ok", "db": "ok", "time": "2026-06-19T12:00:00Z" } }` | ASUMSI |
| Response 503 | `{ "data": { "status": "degraded", "db": "fail", "time": "..." } }` bila Turso unreachable | ASUMSI |
| Fitur PRD | — (operasional) | — |

---

### 6.3 Projects CRUD — `/api/v1/projects`

#### 6.3.1 GET `/api/v1/projects` — List

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md 7.1` |
| Auth | wajib (ownership filter `user_id`) | `SRS.md 5 (FR-15), 9.1 SEC-07` |
| Query | `page`, `limit`, `sort` (`createdAt:desc` default), `status`, `durationType`, `q` (search title) | §4 |
| Response 200 | `{ "data": [ ProjectDTO ], "pagination": {...} }` | §3.2 |
| Response 401 | UNAUTHORIZED | §9 |
| Rate limit | 60 req/min/user (ASUMSI umum) | §10 |
| Relasi | `projects` (`DATABASE_SCHEMA.md 4.3`) | — |
| Fitur PRD | FR-15 | `PRD.md 5` |

Contoh request:
```http
GET /api/v1/projects?page=1&limit=20&sort=createdAt:desc&status=complete HTTP/1.1
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
      "createdAt": "2026-06-19T10:00:00Z",
      "updatedAt": "2026-06-19T10:05:00Z",
      "deletedAt": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

> Catatan: `resultJson` di list = ringkas (null atau boolean flag `hasResult`) agar payload tidak besar. ASUMSI: list return `resultJson: null` + field `hasResult: true`. Detail endpoint return full `resultJson`. Atau list tidak include `resultJson` sama sekali (lebih hemat). Keputusan final implementasi.

#### 6.3.2 POST `/api/v1/projects` — Create

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `SRS.md 7.1` |
| Auth | wajib (bind `user_id`) | `SRS.md 5 (FR-15)` |
| Request body | `CreateProjectInput` (§8.1) | — |
| Response 201 | `{ "data": ProjectDTO }` | §3.2 |
| Response 400 | VALIDATION_ERROR (Zod fail) | §9 |
| Response 401 | UNAUTHORIZED | §9 |
| Response 422 | VALIDATION_ERROR (shorts >180s) | `PRD.md 7 (AC-02)` |
| Relasi | `projects` insert | `DATABASE_SCHEMA.md 4.3` |
| Fitur PRD | FR-15 | `PRD.md 5` |

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
  "aspectRatio": "16:9"
}
```

Contoh response 201:
```json
{
  "data": {
    "id": 42,
    "userId": 1,
    "title": "Petualangan Hutan Anak",
    "durationType": "shorts",
    "durationTargetSeconds": 60,
    "styleType": "3D",
    "aspectRatio": "16:9",
    "status": "draft",
    "resultJson": null,
    "createdAt": "2026-06-19T10:00:00Z",
    "updatedAt": "2026-06-19T10:00:00Z",
    "deletedAt": null
  }
}
```

Contoh error 422 (shorts > 180s):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Durasi shorts maksimal 180 detik",
    "details": { "field": "durationTargetSeconds", "max": 180, "received": 250 }
  },
  "traceId": "req_abc123"
}
```

#### 6.3.3 GET `/api/v1/projects/[id]` — Detail

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md 7.1` |
| Auth | wajib (ownership) | `SRS.md 5 (FR-15)` |
| Path param | `id` integer | — |
| Response 200 | `{ "data": ProjectDetailDTO }` (include full `resultJson` bila ada) | §8.1 |
| Response 401 | UNAUTHORIZED | §9 |
| Response 403 | FORBIDDEN (project milik user lain) | §9 |
| Response 404 | NOT_FOUND (id tidak ada / soft deleted) | §9 |
| Relasi | `projects` + optional nested `characters`, `scenes`, `image_prompts`, `asset_references` | `DATABASE_SCHEMA.md 4.3` |
| Fitur PRD | FR-15 | `PRD.md 5` |

Contoh response 200 (dengan result):
```json
{
  "data": {
    "id": 42,
    "userId": 1,
    "title": "Petualangan Hutan Anak",
    "durationType": "shorts",
    "durationTargetSeconds": 60,
    "styleType": "3D",
    "aspectRatio": "16:9",
    "status": "complete",
    "resultJson": { },
    "createdAt": "2026-06-19T10:00:00Z",
    "updatedAt": "2026-06-19T10:05:00Z",
    "deletedAt": null,
    "assetReferences": [],
    "characters": [],
    "scenes": []
  }
}
```

#### 6.3.4 PATCH `/api/v1/projects/[id]` — Update

| Aspek | Detail | Bukti |
|---|---|---|
| Method | PATCH (partial update metadata) | `SRS.md 7.1` (sebut PUT; PATCH = ASUMSI partial) |
| Auth | wajib (ownership) | `SRS.md 5 (FR-15)` |
| Request body | `UpdateProjectInput` (§8.1, semua field opsional) | — |
| Response 200 | `{ "data": ProjectDTO }` | §3.2 |
| Response 400/401/403/404/422 | lihat §9 | §9 |
| Catatan | Re-generate = overwrite `resultJson` via endpoint `/api/v1/generate` dengan `projectId`, BUKAN di PATCH. PATCH hanya metadata | `SRS.md 5 (FR-15)` |
| Fitur PRD | FR-15 | `PRD.md 5` |

Contoh request:
```http
PATCH /api/v1/projects/42 HTTP/1.1
Content-Type: application/json
Cookie: next-auth.session-token=eyJ...

{ "title": "Petualangan Hutan Anak v2" }
```

#### 6.3.5 DELETE `/api/v1/projects/[id]` — Soft Delete

| Aspek | Detail | Bukti |
|---|---|---|
| Method | DELETE | `SRS.md 7.1` |
| Auth | wajib (ownership) | `SRS.md 5 (FR-15)` |
| Response 204 | No Content (sukses soft delete, set `deleted_at`) | `DATABASE_SCHEMA.md 10.1` |
| Response 401/403/404 | lihat §9 | §9 |
| Cascade | Soft delete TIDAK cascade child (tetap untuk history). Hard delete (manual/fase akhir) = CASCADE | `DATABASE_SCHEMA.md 10.1` |
| Fitur PRD | FR-15 | `PRD.md 5` |

---

### 6.4 Generate — `POST /api/v1/generate` (SSE)

**Endpoint paling kompleks.** Streaming SSE. Lihat §7 untuk full SSE Event Protocol.

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `SRS.md 7.2` |
| Auth | wajib | `SRS.md 5 (FR-03..FR-12)` |
| Content-Type request | `application/json` | `SRS.md 7.2` |
| Content-Type response | `text/event-stream; charset=utf-8` | `SRS.md 7.2` |
| Request body | `GenerateInput` (§8.2) | `SRS.md 7.2` |
| Response 200 | SSE stream: event `progress`, `done`, `error` (§7) | `SRS.md 7.2` |
| Response 400 | VALIDATION_ERROR (sebelum stream mulai) | §9 |
| Response 401 | UNAUTHORIZED | §9 |
| Response 409 | CONFLICT (projectId bukan milik user) | §9 |
| Response 422 | VALIDATION_ERROR (shorts >180s) | `PRD.md 7 (AC-02)` |
| Response 429 | RATE_LIMITED (10 req/min/user) | `SRS.md 12 SRS-A15` ; §10 |
| Response 502 | PROVIDER_ERROR (LLM gagal total) | `SRS.md 7.3` |
| Response 504 | TIMEOUT (LLM timeout, streaming partial disimpan ASUMSI NFR-R2) | `SRS.md 7.3` |
| Rate limit | **10 req/min/user** | `SRS.md 12 SRS-A15` |
| Proses server | load ProviderConfig → decrypt key → createOpenAICompatible → build prompt → streamObject/generateObject → SSE → parse Zod → consistency check → persist | `PROJECT_ARCHITECTURE.md 6` |
| Relasi | `projects` (overwrite `resultJson`), `characters`, `scenes`, `image_prompts`, `supporting_characters`, `generation_logs` | `DATABASE_SCHEMA.md 4.3-4.9` |
| Fitur PRD | FR-03, FR-04, FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, FR-12 | `PRD.md 5` |

Contoh request:
```http
POST /api/v1/generate HTTP/1.1
Content-Type: application/json
Accept: text/event-stream
Cookie: next-auth.session-token=eyJ...

{
  "projectId": 42,
  "input": {
    "title": "Petualangan Hutan Anak",
    "durationTarget": { "type": "shorts", "seconds": 60 },
    "style": { "type": "3D", "ratio": "16:9" },
    "providerId": 7,
    "references": [
      { "name": "hero-ref.png", "type": "tokoh" },
      { "name": "hutan-bg.png", "type": "background" }
    ]
  }
}
```

Contoh SSE response (lihat §7 untuk format lengkap):
```
event: progress
data: {"stage":"character_profiles","delta":"..."}

event: progress
data: {"stage":"scenes","delta":"..."}

event: done
data: {"result": { }, "warnings": [], "generationLogId": 101}
```

> Field input `provider_id` = ID `provider_configs` milik user (select provider aktif). ASUMSI: bila tidak disertakan, pakai provider dengan `is_active=1`. Sitasi: `DATABASE_SCHEMA.md 4.2`.

> Field `references` = array `{name, type}` dari `asset_references.filename` (sudah di-upload via `/api/v1/upload`). Server inject `reference_filename` ke prompt LLM. Sitasi: `SRS.md 5 (FR-06, FR-17)` ; `RAG-CONTEXT.md 6`.

---

### 6.5 Settings Providers — `/api/v1/settings/providers`

#### 6.5.1 GET `/api/v1/settings/providers` — List (masked)

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md 7.1` |
| Auth | wajib | `SRS.md 5 (FR-13)` |
| Response 200 | `{ "data": [ ProviderConfigDTO ] }` (apiKey = mask `****xxxx`) | `SRS.md 5 (FR-14), 9.1 SEC-02` |
| Relasi | `provider_configs` | `DATABASE_SCHEMA.md 4.2` |
| Fitur PRD | FR-13, FR-14 | `PRD.md 5` |

Contoh response 200:
```json
{
  "data": [
    {
      "id": 7,
      "userId": 1,
      "provider": "openrouter",
      "name": "OpenRouter Utama",
      "baseUrl": "https://openrouter.ai/api/v1",
      "model": "anthropic/claude-3.5-sonnet",
      "apiKeyMasked": "****sonnet",
      "isActive": 1,
      "createdAt": "2026-06-19T09:00:00Z",
      "updatedAt": "2026-06-19T09:00:00Z"
    }
  ]
}
```

> Catatan: response field `apiKeyMasked` (bukan `apiKeyEncrypted`) — TIDAK pernah expose ciphertext atau plaintext ke client. Hanya mask display. ASUMSI field name.

#### 6.5.2 POST `/api/v1/settings/providers` — Add

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `SRS.md 7.1` |
| Auth | wajib (bind `user_id`) | `SRS.md 5 (FR-13)` |
| Request body | `CreateProviderConfigInput` (§8.3) | — |
| Response 201 | `{ "data": ProviderConfigDTO }` (masked) | §3.2 |
| Response 400 | VALIDATION_ERROR | §9 |
| Response 409 | CONFLICT (unique `user_id`+`name` sudah ada) | `DATABASE_SCHEMA.md 4.2` |
| Proses server | encrypt apiKey AES-256-GCM sebelum save | `SRS.md 5 (FR-14)` |
| Fitur PRD | FR-13, FR-14 | `PRD.md 5` |

Contoh request:
```http
POST /api/v1/settings/providers HTTP/1.1
Content-Type: application/json
Cookie: next-auth.session-token=eyJ...

{
  "provider": "openrouter",
  "name": "OpenRouter Utama",
  "baseUrl": "https://openrouter.ai/api/v1",
  "model": "anthropic/claude-3.5-sonnet",
  "apiKey": "sk-or-v1-xxxxx..."
}
```

#### 6.5.3 PATCH `/api/v1/settings/providers/[id]` — Update

| Aspek | Detail | Bukti |
|---|---|---|
| Method | PATCH | `SRS.md 7.1` (sebut PUT; PATCH = ASUMSI) |
| Auth | wajib (ownership) | `SRS.md 5 (FR-13)` |
| Request body | `UpdateProviderConfigInput` (§8.3, apiKey opsional — bila kosong tidak overwrite) | — |
| Response 200 | `{ "data": ProviderConfigDTO }` (masked) | §3.2 |
| Response 401/403/404/409 | §9 | §9 |
| Fitur PRD | FR-13, FR-14 | `PRD.md 5` |

> Catatan: PATCH `isActive: 1` untuk set provider aktif (hanya satu aktif per user ASUMSI — bila set aktif, provider lain jadi `isActive: 0`). ASUMSI.

#### 6.5.4 DELETE `/api/v1/settings/providers/[id]` — Delete

| Aspek | Detail | Bukti |
|---|---|---|
| Method | DELETE | `SRS.md 7.1` |
| Auth | wajib (ownership) | `SRS.md 5 (FR-13)` |
| Response 204 | No Content | §3.2 |
| Response 401/403/404 | §9 | §9 |
| Fitur PRD | FR-13 | `PRD.md 5` |

#### 6.5.5 POST `/api/v1/settings/providers/[id]/test` — Test Connection

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | ASUMSI |
| Auth | wajib (ownership) | ASUMSI |
| Request body | opsional `{ "prompt": "ping" }` (ASUMSI default "Hello") | ASUMSI |
| Response 200 | `{ "data": { "ok": true, "provider": "openrouter", "model": "...", "latencyMs": 340, "sample": "Hi!" } }` | ASUMSI |
| Response 502 | PROVIDER_ERROR `{ "error": { "code": "PROVIDER_ERROR", "message": "..." } }` | §9 |
| Proses | decrypt key → createOpenAICompatible → generateText small prompt → return latency | ASUMSI |
| Fitur PRD | FR-13 (validasi provider sebelum pakai) | `PRD.md 5` |

---

### 6.6 Upload — `/api/v1/upload`

#### 6.6.1 POST `/api/v1/upload` — Multipart

| Aspek | Detail | Bukti |
|---|---|---|
| Method | POST | `SRS.md 7.1` |
| Auth | wajib (bind ke project milik user via query `?projectId=`) | `SRS.md 5 (FR-17)` |
| Content-Type | `multipart/form-data` | `SRS.md 5 (FR-17)` |
| Query | `projectId` integer wajib | — |
| Form fields | `file` (image, mime `image/*`, max 10MB ASUMSI), `tipe` (`tokoh`\|`background`), `label` (string opsional) | `SRS.md 5 (FR-17)` ; `DATABASE_SCHEMA.md 4.4` |
| Response 201 | `{ "data": { "id": 99, "name": "hero-ref.png", "url": "https://...vercel-storage.com/hero-ref.png", "type": "tokoh", "label": "Hero", "projectId": 42 } }` | §3.2 |
| Response 400 | VALIDATION_ERROR (mime invalid, size >10MB) | §9 |
| Response 401/403/404 | §9 (project bukan milik user / not found) | §9 |
| Proses | Vercel Blob `put()` → simpan `asset_references` (filename, blobUrl, tipe, label, mimeType, sizeBytes) | `SRS.md 5 (FR-17), 8.5` ; `DATABASE_SCHEMA.md 4.4` |
| Dev fallback | FS `public/references/` (flag `USE_VERCEL_BLOB`, tidak persisten Vercel prod) | ASUMSI SRS-A17 |
| Relasi | `asset_references` | `DATABASE_SCHEMA.md 4.4` |
| Fitur PRD | FR-17 | `PRD.md 5` |

Contoh request:
```http
POST /api/v1/upload?projectId=42 HTTP/1.1
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

#### 6.6.2 DELETE `/api/v1/upload` — Delete Reference

| Aspek | Detail | Bukti |
|---|---|---|
| Method | DELETE | `SRS.md 5 (FR-17)` |
| Auth | wajib (ownership via `asset_references.project_id` → `projects.user_id`) | `SRS.md 9.1 SEC-07` |
| Query | `name` (filename) wajib + `projectId` wajib | ASUMSI |
| Response 204 | No Content | §3.2 |
| Response 401/403/404 | §9 | §9 |
| Proses | Vercel Blob `del(url)` → hapus `asset_references` record | `DATABASE_SCHEMA.md 4.4` |
| Fitur PRD | FR-17 | `PRD.md 5` |

Contoh:
```http
DELETE /api/v1/upload?name=hero-ref.png&projectId=42 HTTP/1.1
Cookie: next-auth.session-token=eyJ...
```

---

### 6.7 Export — `GET /api/v1/projects/[id]/export`

| Aspek | Detail | Bukti |
|---|---|---|
| Method | GET | `SRS.md 7.1` |
| Auth | wajib (ownership) | `SRS.md 5 (FR-16)` |
| Query | `format` (`json`\|`markdown`) wajib | `SRS.md 7.1` |
| Response 200 (json) | `Content-Type: application/json`, `Content-Disposition: attachment; filename="Petualangan Hutan Anak.json"`, body = PromptPackage (PRD §8.2) | `SRS.md 5 (FR-16)` |
| Response 200 (markdown) | `Content-Type: text/markdown`, `Content-Disposition: attachment; filename="Petualangan Hutan Anak.md"`, body = markdown (PRD §8.3 struktur) | `SRS.md 5 (FR-16), 8.6` |
| Response 400 | VALIDATION_ERROR (format invalid) | §9 |
| Response 401/403/404 | §9 (project tidak ada / belum generate → `resultJson` null → 409 CONFLICT ASUMSI) | §9 |
| Proses | baca `projects.resultJson` snapshot → transform (markdown via `lib/export/markdown.template.ts`) | `DATABASE_SCHEMA.md 12.3` ; `SRS.md 5 (FR-16)` |
| Relasi | `projects.result_json` | `DATABASE_SCHEMA.md 4.3` |
| Fitur PRD | FR-16 | `PRD.md 5` |

Contoh request:
```http
GET /api/v1/projects/42/export?format=markdown HTTP/1.1
Cookie: next-auth.session-token=eyJ...
```

Contoh response header:
```http
HTTP/1.1 200 OK
Content-Type: text/markdown
Content-Disposition: attachment; filename="Petualangan Hutan Anak.md"

# Petualangan Hutan Anak
...
```

---

### 6.8 Sub-resource List — `/api/v1/projects/[id]/*`

Sub-resource query untuk query/filter entitas per project. Ownership check via `projects.user_id`.

#### 6.8.1 GET `/api/v1/projects/[id]/characters`

| Aspek | Detail | Bukti |
|---|---|---|
| Response 200 | `{ "data": [ CharacterDTO ] }` (master `characters`) | `DATABASE_SCHEMA.md 4.5` |
| Query | `peran` (`utama`\|`lain`\|`pendamping`) | §4.3 |
| Fitur PRD | FR-07, FR-12 | `PRD.md 5` |

#### 6.8.2 GET `/api/v1/projects/[id]/scenes`

| Aspek | Detail | Bukti |
|---|---|---|
| Response 200 | `{ "data": [ SceneDTO ] }` urut `orderNo:asc` | `DATABASE_SCHEMA.md 4.6` |
| Fitur PRD | FR-03, FR-09 | `PRD.md 5` |

#### 6.8.3 GET `/api/v1/projects/[id]/image-prompts`

| Aspek | Detail | Bukti |
|---|---|---|
| Response 200 | `{ "data": [ ImagePromptDTO ] }` | `DATABASE_SCHEMA.md 4.7` |
| Query | `tipe` (`tokoh`\|`background`), `sceneId` (integer; null = master list root, terisi = varian per scene) | `DATABASE_SCHEMA.md 6.2 #2` |
| Fitur PRD | FR-06 | `PRD.md 5` |

#### 6.8.4 GET `/api/v1/projects/[id]/logs`

| Aspek | Detail | Bukti |
|---|---|---|
| Response 200 | `{ "data": [ GenerationLogDTO ], "pagination": {...} }` | `DATABASE_SCHEMA.md 4.8` |
| Query | `page`, `limit`, `sort` (`createdAt:desc` default), `status` (`success`\|`fail`\|`partial`) | §4 |
| Fitur PRD | F-21 (COULD history) | `PRD.md 4` |

---

## 7. SSE Event Protocol (POST /api/v1/generate)

Endpoint generate pakai **Server-Sent Events** (`text/event-stream`) untuk streaming partial output LLM ke client. Token mulai mengalir < 10s (NFR-P3). Sitasi: `SRS.md 7.2, 8.1` ; `PROJECT_ARCHITECTURE.md 6, 10`.

### 7.1 Format Event

Setiap event = 2 baris: `event: <name>` + `data: <json-string>`, dipisah blank line.

```
event: progress
data: {"stage":"character_profiles","delta":"..."}

event: progress
data: {"stage":"scenes","delta":"..."}

event: done
data: {"result":{ },"warnings":[],"generationLogId":101}
```

### 7.2 Event Types

| Event | Field `data` | Kapan | Bukti |
|---|---|---|---|
| `progress` | `{ "stage": "character_profiles"\|"scenes"\|"image_prompts"\|"moral_message", "delta": "<partial-text-or-json>" }` | Streaming partial dari LLM. Multiple event per stage. | `SRS.md 7.2` |
| `done` | `{ "result": PromptPackage, "warnings": [ { "code": "CONSISTENCY_MISMATCH", "message": "...", "target": "Hero" } ], "generationLogId": 101 }` | Generate selesai, full structured JSON valid via Zod. `warnings` dari consistency check FR-12 (tidak block). | `SRS.md 7.2, 5 (FR-12)` |
| `error` | `{ "code": "PROVIDER_ERROR"\|"TIMEOUT"\|"INTERNAL", "message": "...", "stage": "scenes" }` | Error mid-stream. Stream ditutup setelah event ini. | `SRS.md 7.3` |

### 7.3 Stage List

| Stage | Isi | FR |
|---|---|---|
| `character_profiles` | Master karakter (FR-07) | FR-05, FR-07 |
| `scenes` | Adegan berurut + voiceover + image_prompts varian (FR-03, FR-04, FR-06, FR-09) | FR-03, FR-04, FR-06, FR-09 |
| `image_prompts` | Master list root (FR-06) | FR-06 |
| `moral_message` | Pesan moral penutup (FR-11) | FR-11 |

> `supporting_characters` bisa bagian dari `scenes` stream atau stage terpisah ASUMSI.

### 7.4 Contoh Stream Lengkap

```
event: progress
data: {"stage":"character_profiles","delta":"[{\"nama\":\"Hero\",\"gayarambut\":\"hitam pendek\""}

event: progress
data: {"stage":"character_profiles","delta":",\"wajah_asal\":\"Indonesia\"...}]"}

event: progress
data: {"stage":"scenes","delta":"[{\"order\":1,\"description\":\"Hero masuk hutan\""}

event: progress
data: {"stage":"scenes","delta":",\"voiceover_script\":\"Di sebuah hutan...\"}]"}

event: progress
data: {"stage":"image_prompts","delta":"{\"characters\":[{\"target\":\"Hero\",\"prompt_text\":\"3D render young boy...\"}]}"}

event: progress
data: {"stage":"moral_message","delta\":\"Jaga alam, anak.\""}

event: done
data: {"result":{"title":"Petualangan Hutan Anak","duration_target":{"type":"shorts","seconds":60},"style":{"type":"3D","ratio":"16:9"},"character_profiles":[...],"scenes":[...],"image_prompts":{...},"supporting_characters":[...],"moral_message":"Jaga alam, anak."},"warnings":[],"generationLogId":101}
```

### 7.5 Client Handling

- Client `EventSource`/`fetch` ReadableStream listen `event: progress` → render partial per komponen real-time (NFR-U1, NFR-U2).
- `event: done` → simpan `result`, tampilkan tombol export, simpan warnings.
- `event: error` → tampilkan error state + opsi retry/switch provider (FR-13 fallback manual).
- Stream ditutup server setelah `done`/`error`.
- ASUMSI: heartbeat `: ping\n\n` setiap 15s untuk jaga koneksi proxy (best practice SSE).

---

## 8. Schemas (Zod)

Schema di `src/lib/validation/schemas.ts` (`SRS.md 3.4, 8.7`). Request/response schema konsisten dengan `DATABASE_SCHEMA.md` field.

### 8.1 Project Schemas

```ts
// CreateProjectInput
const CreateProjectInputSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  durationType: z.enum(['shorts', 'tutorial']),
  durationTargetSeconds: z.number().int().positive(),
  styleType: z.enum(['3D', '2D']),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).or(z.string()),
});

// UpdateProjectInput (semua opsional)
const UpdateProjectInputSchema = CreateProjectInputSchema.partial();

// ProjectDTO (response)
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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});
```

| Field | Tipe | Wajib | Validasi | Bukti |
|---|---|---|---|---|
| `title` | string | YA | min 3 max 200 char, trim | `SRS.md 5 (FR-01)` |
| `durationType` | enum | YA | `shorts`\|`tutorial` | `SRS.md 5 (FR-02)` |
| `durationTargetSeconds` | integer | YA | positive. Shorts ≤180, tutorial 420-900 | `PRD.md 7 (AC-02)` |
| `styleType` | enum | YA | `3D`\|`2D` | `SRS.md 5 (FR-10)` |
| `aspectRatio` | string | YA | `16:9`\|`9:16`\|`1:1` atau custom | `SRS.md 5 (FR-10)` |
| `status` | enum | — | `draft`\|`generating`\|`complete`\|`failed` | `DATABASE_SCHEMA.md 4.3` |

### 8.2 GenerateInput Schema

```ts
const GenerateInputSchema = z.object({
  projectId: z.number().int().positive().optional(),
  input: z.object({
    title: z.string().min(3).max(200).trim(),
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
      type: z.enum(['tokoh', 'background']),
    })).optional(),
  }),
});
```

| Field | Tipe | Wajib | Validasi | Bukti |
|---|---|---|---|---|
| `projectId` | integer | TIDAK | Bila ada → save/overwrite result ke project. Bila tidak → generate ephemeral (ASUMSI) | `SRS.md 5 (FR-15)` |
| `input.title` | string | YA | min 3 max 200 | `SRS.md 5 (FR-01)` |
| `input.durationTarget` | object | YA | `{type, seconds}` | `PRD.md 8.2` |
| `input.style` | object | YA | `{type: 3D\|2D, ratio}` | `PRD.md 8.2` |
| `input.providerId` | integer | TIDAK | ID provider_configs milik user. Default: `is_active=1` | `DATABASE_SCHEMA.md 4.2` |
| `input.references` | array | TIDAK | `{name, type}` dari asset_references | `SRS.md 5 (FR-17)` |

### 8.3 ProviderConfig Schemas

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

| Field | Tipe | Wajib | Validasi | Bukti |
|---|---|---|---|---|
| `provider` | enum | YA | `ollama`\|`openrouter`\|`9router`\|`custom` | `PRD.md 5 (FR-13)` ; `RAG-CONTEXT.md 5.2` |
| `name` | string | YA | unique per user | `DATABASE_SCHEMA.md 4.2` |
| `baseUrl` | string URL | YA | preset per provider + custom | `RAG-CONTEXT.md 5.2` |
| `model` | string | YA | user input, no hardcode default | `SRS.md 12 SRS-A8` |
| `apiKey` | string | YA (create) | encrypt sebelum save | `SRS.md 5 (FR-14)` |
| `apiKeyMasked` | string | — | `****` + 4 char terakhir (response only) | `SRS.md 9.1 SEC-02` |

### 8.4 PromptPackageSchema (LLM Structured Output — PRD §8.2)

```ts
const PromptPackageSchema = z.object({
  title: z.string(),
  duration_target: z.object({
    type: z.enum(['shorts', 'tutorial']),
    seconds: z.number(),
  }),
  style: z.object({
    type: z.enum(['3D', '2D']),
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

- Sitasi: `PRD.md 8.2` ; `SRS.md 8.7` (verbatim match).
- Dipakai di `generateObject({ schema: PromptPackageSchema })` atau `streamObject` (`SRS.md 4.2 #2`).
- Catatan: field snake_case (bukan camelCase) — selaras PRD §8.2 + DB column (`DATABASE_SCHEMA.md 4.5, 4.7`).

### 8.5 DTO Sub-resource

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
  tipe: z.enum(['tokoh','background']), target: z.string(),
  promptText: z.string(), referenceFilename: z.string().nullable(),
  createdAt: z.string().datetime(),
});

const GenerationLogDTOSchema = z.object({
  id: z.number(), projectId: z.number(), provider: z.string(), model: z.string(),
  durationMs: z.number().nullable(), status: z.enum(['success','fail','partial']),
  errorMessage: z.string().nullable(), createdAt: z.string().datetime(),
});
```

---
## 9. Error Envelope

### 9.1 Format

Lihat 3.3. Semua error response pakai envelope:
```json
{ "error": { "code": "...", "message": "...", "details": { } }, "traceId": "..." }
```

### 9.2 Daftar Error Code + HTTP Mapping

| Code | HTTP | Kapan | Contoh details | Bukti |
|---|---|---|---|---|
| `VALIDATION_ERROR` | 400 | Zod parse fail, input invalid | `{ "field": "title", "min": 3, "received": 2 }` | `SRS.md 7.3` |
| `VALIDATION_ERROR` | 422 | Business validation (shorts >180s) | `{ "field": "durationTargetSeconds", "max": 180 }` | `PRD.md 7 (AC-02)` |
| `UNAUTHORIZED` | 401 | Session tidak ada / expired | `{ }` | `SRS.md 7.3` |
| `FORBIDDEN` | 403 | Ownership fail (project milik user lain) | `{ "resource": "project", "id": 42 }` | `SRS.md 9.1 SEC-07` |
| `NOT_FOUND` | 404 | Resource tidak ada / soft deleted | `{ "resource": "project", "id": 99 }` | `SRS.md 7.3` |
| `CONFLICT` | 409 | Unique constraint (provider name dup), project belum generate saat export | `{ "field": "name", "value": "OpenRouter Utama" }` | `DATABASE_SCHEMA.md 4.2` |
| `RATE_LIMITED` | 429 | Rate limit terlampaui (generate 10/min) | `{ "retryAfter": 6 }` | `SRS.md 12 SRS-A15` |
| `PROVIDER_ERROR` | 502 | LLM provider gagal (auth, model invalid, rate limit provider) | `{ "provider": "openrouter", "upstream": "..." }` | `SRS.md 7.3, 8.3` |
| `TIMEOUT` | 504 | LLM timeout (streaming partial disimpan ASUMSI NFR-R2) | `{ "stage": "scenes", "elapsedMs": 60000 }` | `SRS.md 7.3, 8.1` |
| `INTERNAL` | 500 | Error tak terduga server | `{ }` | `SRS.md 7.3` |
| `BAD_GATEWAY` | 502 | Storage Blob gagal / Turso unreachable | `{ "service": "blob"|"turso" }` | ASUMSI |
| `SERVICE_UNAVAILABLE` | 503 | Health degraded | `{ "db": "fail" }` | ASUMSI |

### 9.3 Error Code di SSE error Event

SSE `error` event pakai subset code: `PROVIDER_ERROR`, `TIMEOUT`, `INTERNAL`. Tidak pakai HTTP status (karena stream sudah 200 OK). Sitasi: `SRS.md 7.2`.

### 9.4 Consistency Warning (FR-12)

Bukan error — field `warnings[]` di `event: done`. Tidak block save.

```json
{ "warnings": [ { "code": "CONSISTENCY_MISMATCH", "message": "Karakter 'Hero' identitas beda di scene 2", "target": "Hero", "scene": 2 } ] }
```

Sitasi: `SRS.md 5 (FR-12)` ; `PROJECT_ARCHITECTURE.md 4.1 (consistency-checker)`.

---

## 10. Rate Limiting

| Endpoint | Limit | Window | Header response | Bukti |
|---|---|---|---|---|
| `POST /api/v1/generate` | **10 req/min/user** | 60s | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | `SRS.md 12 SRS-A15` ; `PRD.md 6.2 NFR-S4` |
| Lainnya (CRUD/setting/upload/export) | **60 req/min/user** (ASUMSI umum) | 60s | sama | ASUMSI |
| `POST /api/v1/upload` | 20 req/min/user (ASUMSI — multipart berat) | 60s | sama | ASUMSI |

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

Middleware `src/middleware.ts` (NextAuth + rate limit). ASUMSI: in-memory atau Upstash Redis bila multi-instance Vercel. Fase awal: in-memory per instance (ASUMSI — tidak sempurna cross-instance, tapi cukup dev/staging). Sitasi: `PROJECT_ARCHITECTURE.md 5 (src/middleware.ts), 9 SB-12`.

---

## 11. Header Standar, CORS, Keamanan

### 11.1 Header Request Standar

| Header | Wajib | Deskripsi | Bukti |
|---|---|---|---|
| `Cookie: next-auth.session-token=...` | YA (protected) | Session NextAuth | `PROJECT_ARCHITECTURE.md 7.4` |
| `Content-Type: application/json` | YA (body) | JSON request | 3.1 |
| `Content-Type: multipart/form-data; boundary=...` | YA (upload) | Upload file | 6.6 |
| `Accept: text/event-stream` | disarankan (generate) | SSE | 7 |
| `Accept-Language: id`|`en` | opsional | Override bahasa pesan error (FR-19) | ASUMSI |

### 11.2 Header Response Standar

| Header | Deskripsi | Bukti |
|---|---|---|
| `Content-Type` | per endpoint | 3.1 |
| `X-RateLimit-*` | lihat 10 | 10 |
| `X-Trace-Id` | ID trace (sama dengan `traceId` body error) | ASUMSI |
| `Content-Disposition: attachment; filename="..."` | export only | 6.7 |

### 11.3 CORS

| Aspek | Nilai | Bukti |
|---|---|---|
| Same-origin | Next.js App Router default same-origin. Browser cookie kirim otomatis | `PROJECT_ARCHITECTURE.md 1.2` |
| Cross-origin API | TIDAK di-enable fase awal (ASUMSI — app fullstack satu origin) | ASUMSI |
| Bila butuh terprogram | enable `Access-Control-Allow-Origin` per route + `Authorization: Bearer` (bukan cookie) | ASUMSI fase akhir |

### 11.4 Keamanan

| Aspek | Implementasi | Bukti |
|---|---|---|
| HTTPS only | Vercel default | `SRS.md 9.1 SEC-09` |
| CSRF | Next.js built-in Server Actions + NextAuth CSRF token | `SRS.md 9.1 SEC-05` |
| Input sanitization (XSS) | Zod + escape HTML sebelum render/prompt | `SRS.md 9.1 SEC-06` |
| API key user encrypt at rest | AES-256-GCM, mask di response | `SRS.md 9.1 SEC-01/SEC-02` |
| Server-only LLM/crypto | `import 'server-only'` di `lib/ai/*`, `lib/crypto/*` | `SRS.md 9.1 SEC-03` |
| Ownership RBAC | `user_id` filter semua query | `SRS.md 9.1 SEC-07` |
| 9router localhost only | tidak reachable Vercel prod | `PROJECT_ARCHITECTURE.md 7.1, 8` |
| Rate limit | middleware | 10 |
| Env secret | Vercel env, `.env.example` tanpa value | `SRS.md 9.1 SEC-08` |

---

## 12. Backward-Compat & Deprecation

| Aturan | Detail | Bukti |
|---|---|---|
| Versioning | `/api/v1/*`. Breaking change ke `/api/v2` (ASUMSI) | 1.3 |
| Additive field | New field di response = non-breaking, tetap v1 | ASUMSI |
| Deprecation header | `Sunset: <date>` + `Deprecation: true` per endpoint bila akan hapus (ASUMSI fase akhir) | ASUMSI |
| Deprecated field | Tandai di docs + response field `deprecated: true` (ASUMSI) | ASUMSI |
| End-of-life window | ASUMSI 6 bulan dari deprecation ke removal | ASUMSI |
| Server Actions | Internal contract, tidak version terpisah. Bila schema Server Action berubah, bump internal | ASUMSI |

> Fase awal: tidak ada endpoint deprecated. Aturan ini untuk fase akhir.

---

## 13. Webhook / Async

**TIDAK ADA webhook fase awal.** Alasan:

1. LLM call synchronous/streaming via SSE — tidak ada job background yang perlu notifikasi. Sitasi: `RAG-CONTEXT.md 5.4` (Vercel tidak punya native queue gratis, ASUMSI streaming SSE synchronous).
2. Export synchronous baca `result_json` snapshot — tidak async. Sitasi: `DATABASE_SCHEMA.md 12.3`.
3. Upload synchronous via Vercel Blob `put()` — langsung return URL. Sitasi: `SRS.md 5 (FR-17), 8.5`.
4. Tidak ada integrasi pihak ketiga yang butuh webhook (OOS-3 image gen langsung). Sitasi: `PRD.md 9 OOS-3`.

**Bila fase akhir butuh webhook** (ASUMSI — mis. background job generate panjang via Vercel Cron/queue eksternal):
- Event: `generate.completed`, `generate.failed`
- Payload: `{ "projectId": 42, "status": "success"|"fail", "generationLogId": 101, "timestamp": "..." }`
- Signature: HMAC-SHA256 header `X-PromptFlow-Signature: <hex>`
- Retry: 3x exponential backoff (ASUMSI NFR-R3)
- Endpoint user: terdaftar di settings (ASUMSI fase akhir)

---

## 14. Daftar Status Code

| HTTP | Nama | Dipakai endpoint | Bukti |
|---|---|---|---|
| 200 | OK | GET semua, PATCH, SSE generate (stream mulai) | `SRS.md 7.3` |
| 201 | Created | POST projects, POST providers, POST upload | 6 |
| 204 | No Content | DELETE project, DELETE provider, DELETE upload | 6 |
| 400 | Bad Request | VALIDATION_ERROR (Zod fail, format invalid) | `SRS.md 7.3` |
| 401 | Unauthorized | UNAUTHORIZED (no session) | `SRS.md 7.3` |
| 403 | Forbidden | FORBIDDEN (ownership fail) | `SRS.md 9.1 SEC-07` |
| 404 | Not Found | NOT_FOUND (resource tidak ada / soft deleted) | `SRS.md 7.3` |
| 409 | Conflict | CONFLICT (unique provider name, export project belum generate) | `DATABASE_SCHEMA.md 4.2` |
| 422 | Unprocessable Entity | VALIDATION_ERROR business (shorts >180s) | `PRD.md 7 (AC-02)` |
| 429 | Too Many Requests | RATE_LIMITED | `SRS.md 12 SRS-A15` |
| 500 | Internal Server Error | INTERNAL | `SRS.md 7.3` |
| 502 | Bad Gateway | PROVIDER_ERROR (LLM), BAD_GATEWAY (Blob/Turso) | `SRS.md 7.3` |
| 503 | Service Unavailable | SERVICE_UNAVAILABLE (health degraded) | ASUMSI |
| 504 | Gateway Timeout | TIMEOUT (LLM timeout) | `SRS.md 7.3, 8.1` |

---

## 15. Asumsi API + Referensi

### 15.1 Asumsi API

| ID | Asumsi | Status Bukti | Dampak | Sitasi |
|---|---|---|---|---|
| API-A1 | Versioning URI prefix `/api/v1/*` | ASUMSI (paket konteks) | SRS 7.1 / ARCH 5 sebut `/api/*` tanpa prefix, implementasi folder `/api/v1/` | `SRS.md 7.1` ; `PROJECT_ARCHITECTURE.md 5` |
| API-A2 | Envelope sukses `{ data, pagination }` | ASUMSI | SRS hanya definisikan error envelope. Bisa flat object | `SRS.md 7.3` |
| API-A3 | camelCase field JSON request/response | ASUMSI (best practice Next.js) | DB snake_case, mapping di repository | `DATABASE_SCHEMA.md 4` |
| API-A4 | PromptPackageSchema field snake_case | DIKONFIRMASI PRD 8.2 | Verbatim match, tidak di-camelCase | `PRD.md 8.2` ; `SRS.md 8.7` |
| API-A5 | NextAuth credentials provider | TIDAK ADA BUKTI preferensi | Bisa OAuth fase akhir | `RAG-CONTEXT.md 9 G2` ; ASUMSI SRS-A1 |
| API-A6 | Bearer token opsional untuk API terprogram | ASUMSI | Fase awal cookie saja | `PROJECT_ARCHITECTURE.md 7.4` |
| API-A7 | Rate limit 10 req/min/user generate | ASUMSI SRS-A15 | In-memory fase awal, Upstash Redis fase akhir | `SRS.md 12` |
| API-A8 | Rate limit 60 req/min/user umum | ASUMSI | Best practice | — |
| API-A9 | Upload max 10MB, mime image/* | ASUMSI | Validasi Zod + middleware | `SRS.md 5 (FR-17)` |
| API-A10 | Soft delete project (deleted_at) | ASUMSI SRS-A19 | DELETE = 204, bukan hard delete | `DATABASE_SCHEMA.md 10.1` |
| API-A11 | PATCH (bukan PUT) untuk partial update | ASUMSI | SRS 7.1 sebut PUT, kontrak ini pilih PATCH partial | `SRS.md 7.1` |
| API-A12 | providerId opsional di generate (default is_active=1) | ASUMSI | Satu provider aktif per user | `DATABASE_SCHEMA.md 4.2` |
| API-A13 | projectId opsional di generate (ephemeral bila kosong) | ASUMSI | Fase awal mungkin wajib, keputusan implementasi | `SRS.md 5 (FR-15)` |
| API-A14 | Endpoint health, auth/session, test connection, sub-resource list | ASUMSI (paket konteks + DATABASE_SCHEMA) | Tidak di SRS 7.1 eksplisit (kecuali sub-resource dari DB_SCHEMA) | `SRS.md 7.1` ; `DATABASE_SCHEMA.md 4` |
| API-A15 | SSE heartbeat ping 15s | ASUMSI best practice | Jaga koneksi proxy | — |
| API-A16 | traceId di error envelope | ASUMSI | Debugging | `SRS.md 7.3` (TIDAK ada traceId eksplisit) |
| API-A17 | Error code BAD_GATEWAY, SERVICE_UNAVAILABLE tambahan | ASUMSI | SRS 7.3 sebut 5 code inti | `SRS.md 7.3` |
| API-A18 | Export 409 bila resultJson null | ASUMSI | Project belum generate | `DATABASE_SCHEMA.md 4.3` |
| API-A19 | 9router tidak di Vercel prod | DIKONFIRMASI localhost only | Prod: Ollama cloud/OpenRouter/custom | `RAG-CONTEXT.md 5.2, 9 G4` |
| API-A20 | Webhook TIDAK ADA fase awal | ASUMSI + DIKONFIRMASI OOS | LLM synchronous/streaming | `RAG-CONTEXT.md 5.4` ; `PRD.md 9` |

### 15.2 Referensi Internal

| Dokumen | Path | Bagian relevan |
|---|---|---|
| RAG-CONTEXT (sumber kebenaran) | `product-docs/RAG-CONTEXT.md` | 5.1, 5.2 (provider base URL), 6 (upload), 9 (gap) |
| PRD | `product-docs/PRD.md` | 5 (FR-01..FR-19), 8.2 (PromptPackageSchema), 7 (AC) |
| SRS | `product-docs/SRS.md` | 7 (API overview), 8.7 (Zod), 9 (keamanan), 12 (asumsi) |
| DATABASE_SCHEMA | `product-docs/DATABASE_SCHEMA.md` | 4 (entitas & field), 6.2 (validation), 10 (soft delete) |
| PROJECT_ARCHITECTURE | `product-docs/PROJECT_ARCHITECTURE.md` | 5 (folder), 6 (data flow generate), 7 (integrasi), 9 (security) |

### 15.3 Sitasi Eksternal Kunci

| Sitasi | Klaim didukung | Bagian |
|---|---|---|
| https://ai-sdk.dev/providers/openai-compatible-providers | createOpenAICompatible, structured output, streaming | 1, 6.4, 8.4 |
| https://openrouter.ai/docs/api/reference/authentication | OpenRouter base URL, Bearer, header opsional | 6.5, 15.1 API-A19 |
| https://ollama.com/blog/openai-compatibility | Ollama OpenAI-compat https://ollama.com/v1 | 6.5 |
| https://docs.turso.tech/sdk/ts/guides/nextjs | Turso + Next.js, libSQL HTTP | 11.4 |
| https://vercel.com/docs/vercel-blob | Vercel Blob upload | 6.6 |

---

**Dokumen ini fokus pada KONTRAK API siap pakai agent eksekutor (backend + frontend). Tujuan bisnis di BRD, pasar di MRD, produk di PRD, spesifikasi teknis di SRS, arsitektur penuh di PROJECT_ARCHITECTURE, skema data di DATABASE_SCHEMA, aturan kode di CODING_RULES. API_CONTRACT tidak membangun deliverable akhir / menulis kode implementasi — hanya kontrak.**

> **Dibuat oleh:** docgen-api-spec subagent
> **Tanggal:** 2026-06-19
> **Versi:** 1.0
