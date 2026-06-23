# API_CONTRACT.md - PromptFlow API Contract

> Disusun oleh docgen-api-spec. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `PRD.md` + `SRS.md` + `PROJECT_ARCHITECTURE.md` + `DATABASE_SCHEMA.md` + `src/app/api/v1/generate/route.ts` + `src/lib/validation/schemas.ts` + `src/lib/api/error.ts`.
> Klaim faktual bertumpu pada RAG (cite file:line). Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis + JSON/OpenAPI apa adanya.
> Fokus: endpoint, method, request/response schema, status code, autentikasi, otorisasi, error envelope, pagination, versioning, rate limit, webhooks.

---

## 1. Ringkasan API + Base URL + Versioning

PromptFlow menyediakan API REST + satu endpoint SSE (Server-Sent Events) sebagai bagian dari monolith Next.js 15 App Router (`RAG S3.2`). Total 24 file route di `src/app/api/v1/` (`PROJECT_ARCHITECTURE S6`). Tidak ada service terpisah/microservice (`SRS S1.1`).

| Aspek | Nilai | Citation |
|---|---|---|
| Base URL (dev) | `http://localhost:3000` | `RAG S3.2`, ASUMSI default `pnpm dev` |
| Base URL (prod) | `https://<vercel-domain>.vercel.app` | ASUMSI (`RAG S12 G14` vercel.json tidak dibaca) |
| API prefix | `/api/v1` | `RAG S3.2`, glob `src/app/api/v1/**` |
| Versioning | URI prefix (`/api/v1/*`). Future `/api/v2/*` parallel. Tidak ada header versioning. | ASUMSI (tidak ada kontrak eksplisit di repo) |
| Content-Type default | `application/json; charset=utf-8` | `error.ts:16`, `NextResponse.json` |
| Exception: SSE | `text/event-stream; charset=utf-8` | `route.ts:558` |
| Runtime | Edge (middleware) + Node.js (route handler, `maxDuration=300s` generate) | `route.ts:19-21`, `middleware.ts` |
| Format casing | Response body = `camelCase` (Drizzle casing `snake_case` DB, mapping di repository, `client.ts:2-13`); request body input = `camelCase` (`schemas.ts` input schema) | `client.ts`, `schemas.ts:181-200` |
| Timezone | DB `unixepoch` integer (detik UTC). Response timestamp ISO-8601 string (`ProjectDTO.createdAt: string`, `schemas.ts:219`) | `schema.ts:12`, `schemas.ts:219` |
| Idempotency | Tidak ada header `Idempotency-Key`. POST `/api/v1/generate` TIDAK idempotent (create project baru bila `projectId` undefined, `route.ts:124-135`) | `route.ts:124-135` |

**Justifikasi versioning URI prefix**: Sederhana, kompatibel dengan edge middleware matcher, tidak butuh content negotiation. Future v2 dapat berjalan paralel tanpa breaking v1 selama prefix berbeda.

---

## 2. Autentikasi

### 2.1 Skema: NextAuth v5 Credentials (Session Cookie JWT)

Autentikasi = NextAuth v5 beta (`next-auth 5.0.0-beta.25`) Credentials provider, password di-hash bcrypt, session = JWT edge-safe jose (`config.ts:11-38`, `RAG S10.1`). **Bukan** OAuth2, **bukan** API key bearer, **bukan** mTLS. Session disimpan di cookie HTTP-only (`__Secure-` prefix prod HTTPS, no prefix localhost HTTP, `middleware.ts:80-86`).

### 2.2 Cara dapat token / session

Login melalui NextAuth Credentials callback. Client POST form/JSON ke callback, NextAuth verifikasi bcrypt (`config.ts:31`), set session cookie, return redirect/JSON.

| Endpoint NextAuth | Method | Purpose | Auth | Citation |
|---|---|---|---|---|
| `/api/auth/csrf` | GET | Dapatkan CSRF token untuk form submit | public | NextAuth v5 default |
| `/api/auth/providers` | GET | List provider (Credentials) | public | NextAuth v5 default |
| `/api/auth/session` | GET | Cek session aktif (return `{user, expires}` atau `{}`) | public (cookie) | NextAuth v5 default |
| `/api/auth/callback/credentials` | POST | Login flow Credentials (email+password) | public | `config.ts:14-34` |
| `/api/auth/signout` | POST/GET | Logout, clear session cookie | public (cookie) | NextAuth v5 default |
| `/api/auth/[...nextauth]` | * | Catch-all NextAuth handler | public | `src/app/api/auth/[...nextauth]/route.ts`, `RAG S3.2` |

> Endpoint `/api/auth/*` BUKAN bagian `/api/v1/*`. Mereka = NextAuth internal handler, di luar kontrak versi API ini (`route.ts` NextAuth default).

### 2.3 Masa berlaku session

- Session strategy = JWT (edge-safe jose, `middleware.ts:83-87` `getToken`). Tidak ada DB session store (NextAuth v5 beta Credentials tanpa adapter, `DATABASE_SCHEMA S1.2` catatan).
- Masa berlaku = NextAuth default `30 hari` (ASUMSI, `authConfig` edge config isi tidak dibaca, `RAG G5`). Refresh = NextAuth default rotation.
- Logout via `POST /api/auth/signout` clear cookie.

### 2.4 Header yang dibutuhkan

Endpoint `/api/v1/*` (kecuali public paths) WAJIB kirim session cookie NextAuth otomatis (browser handle). Tidak ada header `Authorization: Bearer`. Middleware edge cek JWT via `getToken` jose (`middleware.ts:83-87`).

```
Cookie: __Secure-authjs.session-token=<JWT>  (prod HTTPS)
Cookie: authjs.session-token=<JWT>          (localhost HTTP)
```

Public paths (tidak butuh session, `middleware.ts:6-16`): `/`, `/login`, `/register`, `/api/auth`, `/api/v1/auth`, `/api/v1/health`, `/_next`, favicon, dll.

---

## 3. Otorisasi

### 3.1 Model: user-scoped resources

Semua resource project/provider/log = milik `userId` (`DATABASE_SCHEMA S6`, `schema.ts` FK `userId`). Ownership check wajib di setiap endpoint ter-scoped (`NFR-SEC-08`, `SRS SEC-06`).

Verifikasi: `project.userId === session.user.id` (route handler Node runtime, `route.ts:137-139` pattern `getProjectById(id, userId)` yang filter by userId). Bila mismatch -> `409 CONFLICT` ("Project bukan milik user", `route.ts:138`) atau `404 NOT_FOUND` (ASUMSI, tergantung route).

### 3.2 Middleware gate (edge)

`src/middleware.ts` edge runtime:
1. `getToken` jose decode JWT (`middleware.ts:83-87`). Null + non-public path -> `401 UNAUTHORIZED` redirect `/login` (ASUMSI via `authConfig.pages.signIn`, `RAG G5`).
2. Strip locale segment + localize (`middleware.ts:38-54`, `id`/`en`).
3. Rate limit `/api/v1/generate` (lihat S6).

### 3.3 Role / scope

Tidak ada RBAC granular per endpoint. `users.role` default `'user'` (`schema.ts:11`). ASUMSI role `admin` ada (`DATABASE_SCHEMA A2`) tapi tidak ada endpoint khusus admin di kontrak ini. Semua endpoint `/api/v1/*` (kecuali public) butuh session valid; resource di-scope per `session.user.id`.

| Endpoint tier | Auth | Scope |
|---|---|---|
| Public (`/api/v1/health`, `/api/v1/register`, `/api/auth/*`) | none | - |
| User-scoped (`/api/v1/projects/*`, `/api/v1/settings/providers/*`, `/api/v1/generate`, dll) | session JWT | `session.user.id` |

---

## 4. Konvensi Umum

### 4.1 Format JSON

Request & response body = JSON (`application/json`), kecuali:
- `POST /api/v1/generate` -> response `text/event-stream` (SSE, `route.ts:558`).
- `GET /api/v1/projects/[id]/export` -> response `text/markdown` (ASUMSI, `SRS S3.3.1`).
- `POST /api/v1/upload` -> request `multipart/form-data` (ASUMSI upload file, `RAG S4 F6`).

### 4.2 Casing

| Layer | Casing | Citation |
|---|---|---|
| Request body (client -> server) | `camelCase` | `schemas.ts:181-200` (`GenerateInputSchema` field `projectId`, `durationTarget`, `storyDescription`) |
| Response body DTO | `camelCase` | `schemas.ts:209-235` (`ProjectDTO`, `ProviderConfigDTO`) |
| DB column | `snake_case` | `client.ts` casing config, `schema.ts` DDL |
| LLM output `PromptPackage` | `snake_case` (`title`, `duration_target`, `character_profiles`, `audio_specs`, `sfx_list`) | `schemas.ts:106-124` PromptPackageSchema |

Mapping snake_case (LLM/DB) <-> camelCase (DTO) terjadi di repository layer (`DATABASE_SCHEMA S7`).

### 4.3 Envelope respons sukses

Helper `successResponse<T>` (`error.ts:39-41`):

```json
// Tanpa pagination
{ "data": <T> }

// Dengan pagination
{ "data": <T>, "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } }
```

Endpoint tunggal (get/create/update) = `{ "data": <resource> }`. Endpoint list = `{ "data": [...], "pagination": {...} }`. Endpoint delete sukses = `204 No Content` (`error.ts:43-45` `noContentResponse`).

### 4.4 Envelope error

Helper `errorResponse(code, status, message?, details?)` (`error.ts:10-20`). **Shape TERBUKTI dari `src/lib/api/error.ts`** (bukan ASUMSI):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": { "issues": [...] }
  },
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `error.code` | string enum (`ErrorCodeEnum`, `schemas.ts:237-249`) | YA | Salah satu: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `PROVIDER_ERROR`, `TIMEOUT`, `INTERNAL`, `BAD_GATEWAY`, `SERVICE_UNAVAILABLE` |
| `error.message` | string | YA | Default per code (`error.ts:22-37`), override oleh caller |
| `error.details` | object \| null | TIDAK | Konteks tambahan (mis. Zod issues, field hint). Null bila tidak ada. |
| `traceId` | string UUID v4 (`error.ts:4,17` `randomUUID`) | YA | Untuk tracing log server. UUID generate per request. |

### 4.5 Kategori error internal LLM (di SSE `error` event)

Berbeda dari `ErrorCodeEnum` HTTP envelope. Kategori internal pipeline generasi (`llm-client.ts:18-44`), muncul di SSE `error` event `data.code`:

| Kategori | Trigger | Citation |
|---|---|---|
| `TIMEOUT` | AbortError / "timeout" | `llm-client.ts:22-24` |
| `NETWORK` | ECONNREFUSED/ENOTFOUND/fetch failed | `llm-client.ts:25-27` |
| `VALIDATION` | ZodError / `.issues` (Bug A site) | `llm-client.ts:28-36` |
| `HTTP` | msg startsWith "Provider HTTP" | `llm-client.ts:37-39` |
| `JSON_PARSE` | msg includes "JSON"/"parse" (Bug B site) | `llm-client.ts:40-42` |
| `UNKNOWN` | fallback | `llm-client.ts:43` |
| `DB_ERROR` | DB failure persist (ASUMSI, SRS FR-GEN-06 extend) | `SRS S3.1.6` |

SSE `error` event shape: `{ event: 'error', data: { code, message } }` (`route.ts:262,296,548`).

---

## 5. Pagination, Sorting, Filtering

### 5.1 Pagination

Hanya endpoint list yang paginate. Kontrak dari `successResponse` meta (`error.ts:39`):

```typescript
pagination: { page: number, limit: number, total: number, totalPages: number }
```

| Endpoint | Paginate? | Query param | Default | Citation |
|---|---|---|---|---|
| `GET /api/v1/projects` | YA (ASUMSI) | `page`, `limit` | `page=1`, `limit=20` | `SRS S3.2.1`, ASUMSI repo filter `deletedAt null` |
| `GET /api/v1/projects/[id]/logs` | YA (ASUMSI) | `page`, `limit` | `page=1`, `limit=20` | `SRS S3.4.1` |
| `GET /api/v1/projects/[id]/characters` | ASUMSI tidak (count kecil, <50) | - | - | `DATABASE_SCHEMA S10.5` |
| `GET /api/v1/projects/[id]/scenes` | ASUMSI tidak (count <=15) | - | - | `DATABASE_SCHEMA S10.5` |
| `GET /api/v1/projects/[id]/image-prompts` | ASUMSI tidak | - | - | - |
| `GET /api/v1/settings/providers` | ASUMSI tidak (count kecil per user) | - | - | - |

### 5.2 Sorting

ASUMSI default sort `createdAt DESC`. Query `sort=createdAt` / `sort=-createdAt` (asc/desc). Tidak ada bukti repo implement sort param eksplisit (`RAG G18-G20` repo isi tidak dibaca).

### 5.3 Filtering

| Endpoint | Filter query | Citation |
|---|---|---|
| `GET /api/v1/projects` | `status` (`draft`/`generating`/`complete`/`failed`/`partial`), soft-delete filter `deletedAt IS NULL` otomatis | `SRS S3.2.1`, `schema.ts:47` |
| `GET /api/v1/projects/[id]/logs` | `status` (`success`/`partial`/`fail`) ASUMSI | `schema.ts:153` |

### 5.4 Searching

Tidak ada full-text search. Filter = exact match field. ASUMSI future: search `title` via `q` param.

---

## 6. Rate Limiting & Kuota

### 6.1 Aturan

In-memory Map single-instance, 10 request/menit per user/IP untuk `POST /api/v1/generate` (`middleware.ts:18-36,109-127`). Hanya endpoint generate yang di-rate-limit.

| Item | Nilai | Citation |
|---|---|---|
| Limit | 10 req/min | `middleware.ts:109-127` |
| Window | 60 detik sliding | `middleware.ts:18-36` |
| Scope | per `userId` (jika login) atau per IP (jika anon, walau generate butuh login) | `middleware.ts:109-127` |
| Storage | in-memory Map (single-instance Vercel) | `middleware.ts:18` |
| Prod caveat | ASUMSI needs Redis untuk multi-instance (`middleware.ts:18` comment) - out-of-scope v0.1.0 | `RAG S10.4` |

### 6.2 Response 429

Bila limit terlewati, middleware return `429 Too Many Requests`. ASUMSI shape (`SRS SEC-04`, `ErrorCodeEnum`):

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Terlalu banyak request",
    "details": { "retryAfter": 60, "limit": 10, "window": "60s" }
  },
  "traceId": "..."
}
```

Header response (ASUMSI): `Retry-After: 60`, `X-RateLimit-Limit: 10`, `X-RateLimit-Remaining: 0`, `X-RateLimit-Reset: <epoch>`.

---

## 7. Header Standar

### 7.1 Request

| Header | Wajib | Value | Citation |
|---|---|---|---|
| `Cookie` | YA (untuk /api/v1/* non-public) | `authjs.session-token=<JWT>` / `__Secure-authjs.session-token=<JWT>` | `middleware.ts:80-86` |
| `Content-Type` | YA (POST/PATCH body) | `application/json` (default) / `multipart/form-data` (upload) | - |
| `Accept` | TIDAK | default `*/*` | - |
| `Accept-Language` | TIDAK | `id` / `en` untuk i18n UI (ASUMSI tidak pengaruhi API response) | `middleware.ts:40` |

### 7.2 Response

| Header | Kapan | Value |
|---|---|---|
| `Content-Type` | semua | `application/json; charset=utf-8` / `text/event-stream` (generate) / `text/markdown` (export) |
| `Cache-Control` | generate | `no-cache, no-transform` (`route.ts:559`) |
| `Connection` | generate | `keep-alive` (`route.ts:560`) |
| `X-Accel-Buffering` | generate | `no` (`route.ts:561`) |
| `Retry-After` | 429 | `60` (ASUMSI) |

### 7.3 CORS

ASUMSI same-origin only (Next.js App Router default). Tidak ada konfigurasi CORS eksplisit terbukti di repo. Bila frontend terpisah, butuh `next.config.ts` headers / middleware CORS (out-of-scope).

### 7.4 Keamanan

- HTTPS wajib prod (Vercel auto TLS, `PROJECT_ARCHITECTURE S10`).
- Session cookie `HttpOnly`, `Secure` (prod), `SameSite=Lax` (NextAuth default, ASUMSI).
- Input validation Zod `safeParse` di API boundary (`route.ts:70-88`).
- API key provider AES-256-GCM at rest (`aes.ts`).
- `server-only` package guard (`package.json:58`).

---

## 8. Daftar Endpoint (ringkas)

| # | Method | Path | Nama | Auth | Ringkasan | FR | Citation |
|---|---|---|---|---|---|---|---|
| E1 | POST | `/api/v1/generate` | Generate SSE | YA + rate limit | Generate PromptPackage via LLM, stream SSE | FR-GEN-* | `route.ts:53-564` |
| E2 | GET | `/api/v1/health` | Health check | public | Cek app hidup | - | `RAG S3.2` |
| E3 | GET | `/api/v1/diagnose` | Diagnose | YA | Cek DB, env, auth, provider | FR-PROV-04 | `RAG S12 G18` ASUMSI |
| E4 | GET | `/api/v1/dashboard/stats` | Dashboard stats | YA | Aggregate generate/project | FR-DASH-01 | `RAG S4 F8` |
| E5 | POST | `/api/v1/register` | Register user | public | Create user, bcrypt hash | FR-AUTH-01 | `RAG S12 G4` ASUMSI |
| E6 | POST | `/api/v1/upload` | Upload asset | YA | Vercel Blob upload + asset_references | FR-ASSET-01 | `RAG S4 F6` |
| E7 | POST | `/api/v1/upload/classify` | Classify asset | YA | V2 Vision LLM tag | FR-ASSET-02 | `RAG S12 G17` ASUMSI |
| E8 | GET | `/api/v1/projects` | List projects | YA | Filter userId, status | FR-PROJ-01 | `RAG S3.2` |
| E9 | POST | `/api/v1/projects` | Create project | YA | Create + orphan refs attach | FR-PROJ-01, FR-PROJ-03 | `route.ts:125-135` |
| E10 | GET | `/api/v1/projects/[id]` | Get project | YA + ownership | Get by id | FR-PROJ-01 | `route.ts:137-139` |
| E11 | PATCH | `/api/v1/projects/[id]` | Update project | YA + ownership | Update title/story/theme | FR-PROJ-01 | `RAG S3.2` |
| E12 | DELETE | `/api/v1/projects/[id]` | Soft delete | YA + ownership | Set `deletedAt` | FR-PROJ-01 | `schema.ts:47` |
| E13 | POST | `/api/v1/projects/[id]/delete` | Delete alt | YA + ownership | Alt path hard/soft delete | FR-PROJ-01 | `RAG S3.2` |
| E14 | POST | `/api/v1/projects/bulk-delete` | Bulk delete | YA + ownership | Bulk soft delete | FR-PROJ-01 | `RAG S3.2` |
| E15 | GET | `/api/v1/projects/[id]/logs` | List logs | YA + ownership | Generation logs per project | FR-LOG-01 | `RAG S4 F18` |
| E16 | GET | `/api/v1/projects/[id]/characters` | List characters | YA + ownership | Characters per project | FR-PROJ-01 | `RAG S3.2` |
| E17 | GET | `/api/v1/projects/[id]/image-prompts` | List image prompts | YA + ownership | Image prompts per project | FR-PROJ-03 | `RAG S3.2` |
| E18 | GET | `/api/v1/projects/[id]/export` | Export Markdown | YA + ownership | Render PromptPackage -> MD | FR-EXP-01 | `RAG S4 F16` |
| E19 | PATCH | `/api/v1/projects/[id]/theme` | Set theme | YA + ownership | Set `themePreference` | FR-PROJ-02 | `schema.ts:44` |
| E20 | GET | `/api/v1/projects/[id]/scenes` | List scenes | YA + ownership | Scenes per project | FR-PROJ-01 | `RAG S3.2` |
| E21 | POST | `/api/v1/projects/[id]/scenes` | Create scene | YA + ownership | Add scene manual | FR-PROJ-01 | `RAG S3.2` |
| E22 | GET/POST | `/api/v1/projects/[id]/scenes/[sceneId]/audio` | Audio CRUD | YA + ownership | List/create scene audio | FR-PROJ-01 | `RAG S4 F11` |
| E23 | PATCH/DELETE | `/api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]` | Audio update/delete | YA + ownership | Update/delete scene audio | FR-PROJ-01 | `RAG S4 F11` |
| E24 | GET | `/api/v1/settings/providers` | List providers | YA | Provider config by userId | FR-PROV-01 | `RAG S3.2` |
| E25 | POST | `/api/v1/settings/providers` | Create provider | YA | Create + API key encrypt | FR-PROV-01, FR-PROV-02 | `RAG S3.2` |
| E26 | PATCH | `/api/v1/settings/providers/[id]` | Update provider | YA + ownership | Update config | FR-PROV-01 | `RAG S3.2` |
| E27 | DELETE | `/api/v1/settings/providers/[id]` | Delete provider | YA + ownership | Hard delete | FR-PROV-01 | `RAG S3.2` |
| E28 | POST | `/api/v1/settings/providers/[id]/delete` | Delete alt | YA + ownership | Alt path delete | FR-PROV-01 | `RAG S3.2` |
| E29 | POST | `/api/v1/settings/providers/[id]/test` | Test provider | YA + ownership | Ping provider, latency | FR-PROV-03 | `RAG S12 G19` ASUMSI |

Total: 29 operasi (beberapa path mendukung multi-method).

---

## 9. Detail Endpoint

### 9.1 E1: POST /api/v1/generate (SSE — endpoint bug-affected)

**Method+Path**: `POST /api/v1/generate`
**Auth**: wajib session + rate limit 10/min (`middleware.ts:109-127`).
**Runtime**: `nodejs`, `maxDuration=300`, `force-dynamic` (`route.ts:19-21`).
**Content-Type response**: `text/event-stream; charset=utf-8` (`route.ts:558`).
**FR**: FR-GEN-01 s/d FR-GEN-08, FR-PERSIST-01.

#### 9.1.1 Request body (`GenerateInputSchema`, `schemas.ts:181-200`)

```typescript
{
  projectId?: number,              // opsional, positif. Bila undefined = create project baru
  input: {
    title: string,                 // 3-200 char, trim
    durationTarget: {
      type: 'shorts' | 'tutorial',
      seconds: number,              // int positif. Shorts <=180, tutorial ASUMSI 420-900
    },
    style: {
      type: '3D' | '2D',
      ratio: string,               // mis. "9:16", "16:9", "1:1"
    },
    providerId?: number,           // opsional positif. Bila undefined = active provider / fallback first
    references?: Array<{           // opsional, asset references
      name: string,
      type: 'tokoh' | 'background' | 'prop' | 'accessory' | 'environment' | 'other',
    }>,
    storyDescription?: string,      // opsional, max 500 char (V2)
  }
}
```

Contoh request:
```json
{
  "input": {
    "title": "Petualangan Rina di Hutan",
    "durationTarget": { "type": "shorts", "seconds": 60 },
    "style": { "type": "3D", "ratio": "9:16" },
    "storyDescription": "Rina menjelajah hutan dengan langkah kaki dan pintu berderit",
    "references": [{ "name": "rina-ref.png", "type": "tokoh" }]
  }
}
```

#### 9.1.2 Validasi (status pre-SSE)

| Status | Kapan | Body |
|---|---|---|
| 401 | session null (`route.ts:64`) | error envelope `UNAUTHORIZED` |
| 400 | body parse fail (`route.ts:73`) | `VALIDATION_ERROR` "Request body tidak valid" |
| 400 | Zod safeParse fail (`route.ts:82`) | `VALIDATION_ERROR` + `details.issues` (Zod issues array) |
| 422 | shorts > 180s (`route.ts:87`) | `VALIDATION_ERROR` "Shorts maksimal 180 detik" + `details.field,max` |
| 500 | provider lookup error (`route.ts:102`) | `INTERNAL` "Gagal mengambil provider config" |
| 404 | provider null (`route.ts:107`) | `NOT_FOUND` "Provider config tidak ditemukan..." |
| 400 | provider baseUrl invalid (`route.ts:119`) | `VALIDATION_ERROR` "Provider baseUrl tidak valid" |
| 500 | project create/lookup fail (`route.ts:143`) | `INTERNAL` "Gagal membuat/mengambil project" |
| 409 | project bukan milik user (`route.ts:138`) | `CONFLICT` "Project bukan milik user" |

#### 9.1.3 Response: SSE stream

Setelah validasi sukses, server return `Response(stream)` dengan header SSE. Stream = `ReadableStream<Uint8Array>`, tiap event format (`route.ts:28-30`):
```
event: <eventName>\ndata: <JSON>\n\n
```

**Event types** (`route.ts:24`):

| Event | data shape | Kapan | Citation |
|---|---|---|---|
| `stage` | `{ stage: 'starting'|'character_profiles'|'llm_calling'|'scenes'|'image_prompts'|'supporting_characters'|'moral_message'|'saving', ...meta }` | tiap stage pipeline | `route.ts:185,187,212,301,303,305,307,312` |
| `progress` | `{ stage, ...meta }` | alias stage + delta | `route.ts:179` |
| `heartbeat` | `{ elapsedMs, elapsedSec }` | tiap 2s selama LLM call | `route.ts:213-220` |
| `stream_chunk` | `{ chunk: string }` | relay LLM delta.content | `route.ts:226-228` |
| `log` | `{ level: 'info'|'warn'|'error', message, timestamp }` | tiap log entry (SseLogEntrySchema `schemas.ts:262-266`) | `route.ts:172-175` |
| `done` | `{ result: PromptPackage, warnings: Warning[], generationLogId: number|null, partialSceneIds?: number[] }` | sukses | `route.ts:518`, SRS FR-GEN-06 extend `partialSceneIds` |
| `error` | `{ code: string, message: string }` | failure | `route.ts:262,296,548` |

#### 9.1.4 `result` field = PromptPackage (`PromptPackageSchema`, `schemas.ts:106-124`)

```typescript
{
  title: string,
  duration_target: { type: 'shorts'|'tutorial', seconds: number },
  style: { type: '3D'|'2D', aspect_ratio: string },
  character_profiles: Array<{
    nama: string, gayarambut: string, wajah_asal: string,
    pakaian_atas: string, pakaian_bawah: string, alas_kaki: string,
    deskripsi_latar: string, aksi: string, peran: string,
    voice_type?: 'child'|'teen'|'adult_male'|'adult_female'|'elderly_male'|'elderly_female'|'narrator',
    age_range?: string,
  }>,
  scenes: Array<{
    order: number, description: string, voiceover_script: string,
    voiceover_speaker: string,  // default 'narrator'
    image_prompts: { characters: ImagePromptItem[], backgrounds: ImagePromptItem[] },
    audio_specs?: SceneAudioSpec[],  // opsional
    transition_type: string, transition_duration_ms: number,
    transition_easing: string, transition_direction: string,
    voice_type: string, voice_emotion: string, voice_speed: number, voice_pitch: string,
    duration_seconds?: number|null, scene_pacing: string, scene_mood?: string|null,
  }>,
  image_prompts: { characters: ImagePromptItem[], backgrounds: ImagePromptItem[] },  // master list
  supporting_characters: Array<{ nama: string, tipe: string, aksi: string }>,
  moral_message: string,
}
```

`ImagePromptItem` (`schemas.ts:19-31`):
```typescript
{
  target: string, prompt_text: string, reference_filename: string|null,
  composition?: string|null, lighting?: string|null, camera?: string|null,
  mood_atmosphere?: string|null, style_references?: string|null,
  color_palette?: string | string[] | null,  // union: string atau array string
  technical?: string|null,
}
```

`SceneAudioSpec` (`schemas.ts:39-55`):
```typescript
{
  audio_type: string,  // default 'ambient'. BUG A: prompt enum tapi schema string longgar
  description: string, timing: string,  // default 'throughout'
  duration_seconds?: number|null,
  volume: number,  // 0-1, default 0.5
  fade_in_ms: number, fade_out_ms: number,
  music_genre?: string|null, music_mood?: string|null,
  music_tempo_bpm?: number|null, music_instruments?: string|null, music_volume: number,
  sfx_list: string | string[] | null,  // *** TARGET CHANGE per SRS FR-GEN-02 ***
  ambient_type?: string|null, ambient_volume: number,
}
```

#### 9.1.5 Target type change `sfx_list` (per SRS FR-GEN-02)

**Status kini** (`schemas.ts:52`): `sfx_list: z.string().nullable().optional()` -> reject array dari LLM (Bug A, `RAG S11`).

**Target** (`SRS S3.1.2`):
```typescript
sfx_list: z.union([z.string(), z.array(z.string())]).nullable().optional(),
```
Schema terima string **atau** array. Normalizer di `route.ts:376-407` (audio save loop) coerce array -> string comma-separated sebelum DB insert (`scene_audio.sfxList: text`, `schema.ts:193`):
```typescript
const normalizedSfxList = Array.isArray(audio.sfx_list)
  ? audio.sfx_list.join(', ')
  : (audio.sfx_list ?? null);
```
DB column tetap `text` (tidak ada migration). Coercion di app layer.

#### 9.1.6 Error event — failure categories

SSE `error` event muncul saat pipeline gagal. `data.code` bisa:

| code | Kapan | Citation |
|---|---|---|
| `PROVIDER_ERROR` | LLM throw (unhandled, generic) - LIHAT BUG: route.ts:262,548 kirim generic tanpa categorize. SRS FR-GEN-06 target: pakai `categorizeError` spesifik | `route.ts:262,548`, `SRS S3.1.6` |
| `VALIDATION_ERROR` | `PromptPackageSchema.parse(pkg)` gagal di route re-validate (Bug A site, `route.ts:296`) | `route.ts:296` |
| `VALIDATION` / `JSON_PARSE` / `TIMEOUT` / `NETWORK` / `HTTP` / `UNKNOWN` / `DB_ERROR` | TARGET per SRS FR-GEN-06 (sekarang masih generic `PROVIDER_ERROR` di unhandled catch) | `llm-client.ts:18-44`, `SRS S3.1.6` |

**Bug A (VALIDATION)**: `scenes.N.audio_specs.2.sfx_list: Expected string, received array` (`RAG S11 Bug A`). Root cause: schema string vs LLM array. Fix: union + normalizer (FR-GEN-02).
**Bug B (JSON_PARSE)**: `malformed JSON at position 14719` repair fail (`RAG S11 Bug B`). Root cause: `repairTruncatedJson` tidak handle newline mentah/control char. Fix: pre-parse sanitizer (FR-GEN-04).

#### 9.1.7 Relasi

- DB: `projects` (status draft/generating/complete/failed/**partial** extend), `characters`, `scenes`, `image_prompts`, `scene_audio`, `supporting_characters`, `generation_logs` (`DATABASE_SCHEMA S3`).
- Fitur PRD: M1-M10 (reliability fix). SRS: FR-GEN-01 s/d FR-GEN-09, FR-PERSIST-01.

#### 9.1.8 Notes

- Tidak idempotent (POST, create project bila `projectId` undefined).
- `safeDbOp` swallow DB error per-op, partial persist (Bug D, `route.ts:35-51`). Target FR-PERSIST-01: track `partialSceneIds`, set status `partial`.
- Heartbeat 2s (`route.ts:213-220`). Vercel `maxDuration=300` hard ceiling.
- Fetch LLM timeout 600s (`llm-client.ts:284-289`) — SRS target samakan ke 300s match Vercel (`NFR-PERF-05`).

---

### 9.2 E2: GET /api/v1/health

**Auth**: public (`middleware.ts:6-16`).
**Purpose**: Cek app hidup.
**Request**: none.
**Response** (ASUMSI, `route.ts` tidak dibaca langsung):
```json
{ "data": { "status": "ok", "timestamp": "<ISO-8601>" } }
```
**Status**: 200 OK.
**Relasi**: tidak ada DB write. Infra check only.
**Citation**: `RAG S3.2`.

---

### 9.3 E3: GET /api/v1/diagnose

**Auth**: YA (`SRS S3.6.4`).
**Purpose**: Self-check DB, env, auth session, provider active.
**Request**: none (cookie session).
**Response** (ASUMSI, `RAG S12 G18` isi tidak dibaca):
```json
{
  "data": {
    "checks": [
      { "check": "db", "status": "ok", "detail": "select 1 ok" },
      { "check": "env", "status": "ok", "detail": { "TURSO_DATABASE_URL": "set", "ENCRYPTION_KEY": "32 byte" } },
      { "check": "auth", "status": "ok", "detail": { "userId": 1 } },
      { "check": "provider", "status": "ok", "detail": { "name": "MiniMax", "model": "minimax/MiniMax-M3" } }
    ]
  }
}
```
**Status**: 200 OK. ASUMSI 500 bila check fail (partial).
**Relasi**: FR-PROV-04.
**Citation**: `RAG S12 G18` ASUMSI.

---

### 9.4 E4: GET /api/v1/dashboard/stats

**Auth**: YA.
**Purpose**: Aggregate stats: total project, generate count, success/fail/partial ratio, provider distribution (`SRS S3.5.1`).
**Request**: none.
**Response** (ASUMSI, `dashboard.repo.ts` tidak dibaca `RAG G20`):
```json
{
  "data": {
    "totalProjects": 42,
    "totalGenerates": 100,
    "successRate": 0.95,
    "statusBreakdown": { "success": 80, "partial": 15, "fail": 5 },
    "providerDistribution": [{ "provider": "custom", "count": 60 }]
  }
}
```
**Status**: 200 OK.
**Relasi**: FR-DASH-01. DB `projects` + `generation_logs` + `provider_configs`.
**Citation**: `RAG S4 F8`, `RAG S12 G20` ASUMSI.

---

### 9.5 E5: POST /api/v1/register

**Auth**: public.
**Purpose**: Create user, hash password bcrypt (`RAG G4` ASUMSI `bcrypt.hash`).
**Request body** (ASUMSI `RegisterSchema`, tidak ada di `schemas.ts` read):
```json
{ "email": "test@example.com", "password": "pass123", "name": "Test User" }
```
Validasi ASUMSI: email format, password min 8 char, name opsional.
**Response** (ASUMSI):
```json
{ "data": { "id": 1, "email": "test@example.com", "name": "Test User" } }
```
**Status**: 201 Created. 409 bila email duplikat (`users.email UNIQUE`, `schema.ts:7`).
**Relasi**: FR-AUTH-01. DB `users`.
**Citation**: `RAG S12 G4` ASUMSI, `config.ts:14-34` authorize pakai `bcrypt.compare`.

---

### 9.6 E6: POST /api/v1/upload

**Auth**: YA.
**Content-Type request**: `multipart/form-data` (ASUMSI).
**Purpose**: Upload asset ke Vercel Blob, persist `asset_references` (`SRS S3.9.1`).
**Request form fields** (ASUMSI):
- `file`: binary (image).
- `tipe`: `tokoh`|`background`|`prop`|`accessory`|`environment`|`other` (`schemas.ts:173` `AssetRoleEnum`).
- `label`: string opsional.
**Response** (ASUMSI):
```json
{
  "data": {
    "id": 1, "projectId": null, "tipe": "tokoh",
    "filename": "rina.png", "blobUrl": "https://...blob.vercel-storage.com/rina.png",
    "label": "Rina ref", "mimeType": "image/png", "sizeBytes": 102400,
    "aiClassification": null, "createdAt": "2026-06-23T00:00:00.000Z"
  }
}
```
**Status**: 201 Created. 400 bila tipe invalid / file missing.
**Relasi**: FR-ASSET-01. DB `asset_references` (`schema.ts:54-68`). Vercel Blob (`next.config.ts:13`).
**Citation**: `RAG S4 F6`, `RAG S3.6`.

---

### 9.7 E7: POST /api/v1/upload/classify

**Auth**: YA.
**Purpose**: V2 Vision LLM tag asset -> `aiClassification` JSON (`SRS S3.9.2`).
**Request body** (ASUMSI):
```json
{ "assetId": 1 }
```
**Response** (`ClassificationResultSchema`, `schemas.ts:252-257`):
```json
{
  "data": {
    "role": "tokoh", "label": "Gadis muda, rambut hitam",
    "confidence": 0.92, "description": "Karakter utama perempuan"
  }
}
```
**Status**: 200 OK. 404 bila asset not found. 502 bila Vision LLM fail.
**Relasi**: FR-ASSET-02. DB `asset_references.aiClassification` (`schema.ts:65`).
**Citation**: `RAG S12 G17` ASUMSI.

---

### 9.8 E8: GET /api/v1/projects

**Auth**: YA.
**Purpose**: List projects milik user, filter status, exclude soft-deleted (`SRS S3.2.1`).
**Query**: `page`, `limit`, `status` (ASUMSI).
**Response** (page=1, limit=20):
```json
{
  "data": [
    {
      "id": 1, "userId": 1, "title": "Petualangan Rina",
      "durationType": "shorts", "durationTargetSeconds": 60,
      "styleType": "3D", "aspectRatio": "9:16",
      "status": "complete", "resultJson": { ...PromptPackage },
      "createdAt": "2026-06-23T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:05:00.000Z",
      "deletedAt": null
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```
`ProjectDTO` shape (`schemas.ts:209-222`).
**Status**: 200 OK.
**Relasi**: FR-PROJ-01. DB `projects` filter `userId` + `deletedAt IS NULL`.
**Citation**: `RAG S3.2`, `schemas.ts:209`.

---

### 9.9 E9: POST /api/v1/projects

**Auth**: YA.
**Purpose**: Create project + orphan refs attach (`route.ts:125-135`, `route.ts:148-159`).
**Request body** (`CreateProjectInputSchema`, `schemas.ts:149-155`):
```json
{
  "title": "Petualangan Rina",
  "durationType": "shorts",
  "durationTargetSeconds": 60,
  "styleType": "3D",
  "aspectRatio": "9:16"
}
```
Validasi: shorts <=180, tutorial 420-900 (`.refine`, `schemas.ts:150-154`).
**Response**:
```json
{ "data": { "id": 1, "userId": 1, "title": "...", "status": "draft", ... } }
```
**Status**: 201 Created. 400 validation. 409 unique constraint (ASUMSI).
**Relasi**: FR-PROJ-01, FR-PROJ-03. DB `projects` + `asset_references` attach.
**Citation**: `route.ts:125-135`, `schemas.ts:149`.

---

### 9.10 E10: GET /api/v1/projects/[id]

**Auth**: YA + ownership.
**Path param**: `id` (integer).
**Response**: `ProjectDTO` single.
**Status**: 200 OK. 404 bila not found / not owned. 403 ASUMSI bila ownership check return forbidden.
**Relasi**: FR-PROJ-01.
**Citation**: `route.ts:137-139` `getProjectById(id, userId)`.

---

### 9.11 E11: PATCH /api/v1/projects/[id]

**Auth**: YA + ownership.
**Request body** (`UpdateProjectInputSchema`, `schemas.ts:157` = base partial):
```json
{ "title": "Judul Baru", "storyDescription": "Deskripsi baru", "themePreference": "light" }
```
Field opsional (partial). `themePreference` enum `dark|light|system` (`schemas.ts:103`).
**Response**: updated `ProjectDTO`.
**Status**: 200 OK. 400 validation. 404 not found.
**Relasi**: FR-PROJ-01, FR-PROJ-02.
**Citation**: `schemas.ts:157`, `schema.ts:44`.

---

### 9.12 E12: DELETE /api/v1/projects/[id]

**Auth**: YA + ownership.
**Purpose**: Soft delete (`deletedAt` set, `schema.ts:47`).
**Response**: `204 No Content` (`error.ts:43`).
**Status**: 204. 404 not found.
**Relasi**: FR-PROJ-01.
**Citation**: `schema.ts:47`, `project.repo.ts:33-65`.

---

### 9.13 E13: POST /api/v1/projects/[id]/delete

**Auth**: YA + ownership.
**Purpose**: Alt path delete (ASUMSI hard atau soft, `RAG S3.2` tidak spesifik).
**Response**: 204 atau `{ data: { id, deletedAt } }`.
**Status**: 200/204. 404.
**Relasi**: FR-PROJ-01.
**Citation**: `RAG S3.2` ASUMSI.

---

### 9.14 E14: POST /api/v1/projects/bulk-delete

**Auth**: YA + ownership (verify tiap id).
**Request body**:
```json
{ "ids": [1, 2, 3] }
```
**Response**:
```json
{ "data": { "deleted": 3, "failed": [] } }
```
**Status**: 200 OK. 207 Multi-Status ASUMSI bila partial.
**Relasi**: FR-PROJ-01.
**Citation**: `RAG S3.2`.

---

### 9.15 E15: GET /api/v1/projects/[id]/logs

**Auth**: YA + ownership.
**Purpose**: List generation logs per project (`SRS S3.4.1`).
**Query**: `page`, `limit`, `status` (success/partial/fail) ASUMSI.
**Response**:
```json
{
  "data": [
    {
      "id": 1, "projectId": 1,
      "provider": "custom", "model": "minimax/MiniMax-M3",
      "durationMs": 110000, "status": "success",
      "errorMessage": null,
      "logsJson": [{ "stage": "starting", "timestamp": 1719400000 }, ...],
      "createdAt": "2026-06-23T00:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```
`logsJson` = JSON string array log entries (stage events, retryCount, correctivePrompt, partialSceneIds per SRS FR-GEN-05/06 target).
**Status**: 200 OK. 404 project not found/not owned.
**Relasi**: FR-LOG-01. DB `generation_logs` (`schema.ts:147-160`).
**Citation**: `generation-log.repo.ts:1-32`, `RAG S4 F18`.

---

### 9.16 E16: GET /api/v1/projects/[id]/characters

**Auth**: YA + ownership.
**Response**:
```json
{
  "data": [
    {
      "id": 1, "projectId": 1, "nama": "Rina",
      "gayarambut": "hitam lurus", "wajahAsal": "Asia",
      "pakaianAtas": "kaos putih", "pakaianBawah": "celana jeans",
      "alasKaki": "sneakers", "deskripsiLatar": "gadis muda",
      "aksi": "berjalan", "peran": "protagonist",
      "createdAt": "2026-06-23T00:00:00.000Z"
    }
  ]
}
```
**Status**: 200 OK. 404.
**Relasi**: FR-PROJ-01. DB `characters` (`schema.ts:71-87`).
**Citation**: `RAG S3.2`.

---

### 9.17 E17: GET /api/v1/projects/[id]/image-prompts

**Auth**: YA + ownership.
**Response**: array `ImagePromptItem` (master list, sceneId null) + scene-level.
**Status**: 200 OK. 404.
**Relasi**: FR-PROJ-03. DB `image_prompts` (`schema.ts:120-144`).
**Citation**: `RAG S3.2`.

---

### 9.18 E18: GET /api/v1/projects/[id]/export

**Auth**: YA + ownership.
**Content-Type response**: `text/markdown; charset=utf-8` (ASUMSI).
**Purpose**: Render `resultJson` PromptPackage -> Markdown (`markdown.template.ts:4-173`).
**Response body**: Markdown string lengkap (title, character_profiles, scenes, image_prompts 8-layer, audio_specs, supporting_characters, moral_message per SRS S3.3.1).
**Status**: 200 OK. 404. 409 bila `resultJson` null (project draft).
**Relasi**: FR-EXP-01.
**Citation**: `RAG S4 F16`, `markdown.template.ts:4-173`.

---

### 9.19 E19: PATCH /api/v1/projects/[id]/theme

**Auth**: YA + ownership.
**Request body**:
```json
{ "themePreference": "dark" }
```
Enum `dark|light|system` (`schemas.ts:103`).
**Response**: updated `ProjectDTO`.
**Status**: 200 OK. 400 invalid enum. 404.
**Relasi**: FR-PROJ-02. DB `projects.themePreference` (`schema.ts:44`).
**Citation**: `schema.ts:44`, `schemas.ts:103`.

---

### 9.20 E20+E21: GET/POST /api/v1/projects/[id]/scenes

**Auth**: YA + ownership.
**GET**: list scenes by projectId. Response `{ data: SceneDTO[] }`.
**POST**: create scene manual. Request body `SceneSchema` partial (`schemas.ts:57-75`). Response 201 `{ data: SceneDTO }`.
**Status**: 200/201. 400. 404.
**Relasi**: FR-PROJ-01. DB `scenes` (`schema.ts:90-117`).
**Citation**: `RAG S3.2`.

---

### 9.21 E22+E23: Scene audio CRUD

**E22**: `GET/POST /api/v1/projects/[id]/scenes/[sceneId]/audio`
**E23**: `PATCH/DELETE /api/v1/projects/[id]/scenes/[sceneId]/audio/[audioId]`

**Auth**: YA + ownership.
**Purpose**: List/create/update/delete scene audio spec (V3, `RAG S4 F11`).
**Request body POST/PATCH** (`SceneAudioSchema`, `schemas.ts:83-99` — strict enum, untuk CRUD endpoint):
```json
{
  "audioType": "sfx",
  "description": "Langkah kaki di kayu",
  "timing": "start",
  "volume": 0.5,
  "fadeInMs": 100, "fadeOutMs": 200,
  "sfxList": "footstep,door creak",
  "ambientType": null, "ambientVolume": 0.4
}
```
`sfx_list` di CRUD endpoint = `z.string().nullable().optional()` (tetap string, dari UI form, BUKAN LLM). Berbeda dari `SceneAudioSpecSchema` (generate pipeline) yang target union (FR-GEN-02).
**Response**: `{ data: SceneAudioDTO }`.
**Status**: 200/201/204. 400. 404.
**Relasi**: FR-PROJ-01. DB `scene_audio` (`schema.ts:177-201`).
**Citation**: `RAG S4 F11`, `schemas.ts:83-99`.

> **Catatan inkonsistensi Bug F** (`RAG S11 Bug F`): `SceneAudioSpecSchema` volume default 0.5 vs `SceneAudioSchema` 0.7. SRS FR-GEN-09 target samakan ke 0.5.

---

### 9.22 E24-E29: Settings / Providers

#### E24: GET /api/v1/settings/providers
**Auth**: YA.
**Response** (`ProviderConfigDTO`, `schemas.ts:224-235`):
```json
{
  "data": [
    {
      "id": 1, "userId": 1, "provider": "custom",
      "name": "My MiniMax", "baseUrl": "https://tokenrouter.ai/api/v1",
      "model": "minimax/MiniMax-M3",
      "apiKeyMasked": "****xxxx",  // maskApiKey aes.ts:45-49
      "isActive": 1,
      "createdAt": "2026-06-23T00:00:00.000Z",
      "updatedAt": "2026-06-23T00:00:00.000Z"
    }
  ]
}
```
API key tidak pernah return plaintext, hanya `apiKeyMasked` (`aes.ts:45-49`).

#### E25: POST /api/v1/settings/providers
**Auth**: YA.
**Request body** (`CreateProviderConfigInputSchema`, `schemas.ts:161-168`):
```json
{
  "provider": "custom",
  "name": "My MiniMax",
  "baseUrl": "https://tokenrouter.ai/api/v1",
  "model": "minimax/MiniMax-M3",
  "apiKey": "sk-xxx",  // plaintext input, AES-256-GCM encrypt sebelum persist
  "isActive": 1
}
```
`provider` enum `ollama|openrouter|9router|custom` (`schemas.ts:159`). `baseUrl` wajib URL valid. `apiKey` plaintext dari client, encrypt di server sebelum persist `apiKeyEncrypted` (`aes.ts:4-43`).
**Response**: 201 `ProviderConfigDTO` (apiKeyMasked).
**Status**: 201. 400 validation. 409 unique `(userId, name)` (`schema.ts:29`).
**Relasi**: FR-PROV-01, FR-PROV-02. DB `provider_configs` (`schema.ts:17-30`).

#### E26: PATCH /api/v1/settings/providers/[id]
**Auth**: YA + ownership.
**Request body** (`UpdateProviderConfigInputSchema`, `schemas.ts:170` = partial omit provider):
```json
{ "name": "My MiniMax v2", "model": "minimax/MiniMax-M3-v2", "apiKey": "sk-new", "isActive": 1 }
```
`provider` immutable (tidak bisa ganti enum). `apiKey` bila di-set = re-encrypt. Bila isActive=1, repo setActive transaction: set semua provider user lain isActive=0 (`SRS S3.6.1`).
**Response**: updated `ProviderConfigDTO`.
**Status**: 200. 400. 404. 409 unique.

#### E27: DELETE /api/v1/settings/providers/[id]
**Auth**: YA + ownership.
**Purpose**: Hard delete config.
**Response**: 204.
**Status**: 204. 404.
**Relasi**: FR-PROV-01.

#### E28: POST /api/v1/settings/providers/[id]/delete
Alt path delete (sama E27).

#### E29: POST /api/v1/settings/providers/[id]/test
**Auth**: YA + ownership.
**Purpose**: Ping provider, return status + latency (`SRS S3.6.3` ASUMSI).
**Request**: none (gunakan config dari DB by id).
**Response** (ASUMSI):
```json
{
  "data": {
    "ok": true, "status": 200, "latencyMs": 850,
    "snippet": "Hello from MiniMax"
  }
}
```
**Status**: 200 OK (test result). 502 bila provider unreachable.
**Relasi**: FR-PROV-03.
**Citation**: `RAG S12 G19` ASUMSI.

---

## 10. Webhook / Event Async

**Tidak ada webhook inbound maupun outbound.** (`PROJECT_ARCHITECTURE S8`: "Tidak ada webhook inbound. Tidak ada message queue. Tidak ada cron.")

Async real-time = SSE stream outbound (`POST /api/v1/generate`) — client subscribe, server push events, selesai close. Bukan webhook persistent. Tidak ada retry dari sisi server bila client disconnect (state di `generation_logs` untuk audit).

---

## 11. Aturan Backward-Compat & Deprecation

### 11.1 Versioning

URI prefix `/api/v1/*` (`RAG S3.2`). Future `/api/v2/*` berjalan paralel. v1 tidak breaking selama prefix berbeda.

### 11.2 Backward-compat rules

- Field response baru boleh ditambah (additive), tidak boleh hapus tanpa deprecation notice.
- Field request wajib tetap opsional bila sudah opsional (tidak boleh jadi required).
- Enum value baru boleh ditambah; client harus ignore unknown enum (forward-compat).
- `ErrorCodeEnum` (`schemas.ts:237-249`) additive.

### 11.3 Deprecation

Belum ada endpoint deprecated (v0.1.0). Prosedur ASUMSI:
1. Tambah header `Deprecation: true` + `Sunset: <date>` di response.
2. Dokumen changelog.
3. Hapus di major version berikutnya (v2).

### 11.4 Stability per endpoint

| Endpoint | Stability | Notes |
|---|---|---|
| `/api/v1/generate` | Beta (bug-affected Bug A/B) | SRS target fix FR-GEN-02 union sfx_list = breaking untuk client yang assume string strict |
| CRUD project/provider | Stabil | ASUMSI |
| SSE event shape | Beta | `partialSceneIds` field baru (additive) per FR-GEN-06 |

---

## 12. Daftar Status Code

| Code | Nama | Kapan dipakai | Endpoint | Citation |
|---|---|---|---|---|
| 200 | OK | GET sukses, PATCH/POST return data | semua GET, PATCH, POST (non-create) | `error.ts:39` |
| 201 | Created | POST create sukses | projects, providers, scenes, audio, upload, register | ASUMSI |
| 204 | No Content | DELETE sukses | delete project/provider/scene audio | `error.ts:43` |
| 400 | Bad Request | body parse fail, Zod safeParse fail, validasi business rule | semua POST/PATCH | `route.ts:73,82,87,119` |
| 401 | Unauthorized | session null | semua non-public | `route.ts:62,64` |
| 403 | Forbidden | ownership check fail (ASUMSI, route ada yang return 409) | project/provider | ASUMSI |
| 404 | Not Found | resource not found / not owned | project, provider, log | `route.ts:107` |
| 409 | Conflict | unique constraint, ownership mismatch | project (route.ts:138), provider unique | `route.ts:138` |
| 422 | Unprocessable Entity | validasi business rule (shorts >180) | generate | `route.ts:87` |
| 429 | Too Many Requests | rate limit 10/min | generate | `middleware.ts:109-127` |
| 500 | Internal Server Error | unhandled server error | semua | `route.ts:102,143` |
| 502 | Bad Gateway | LLM provider / Vision LLM unreachable | generate (SSE error), classify | `ErrorCodeEnum BAD_GATEWAY` |
| 503 | Service Unavailable | DB Turso down, blob down | ASUMSI | `ErrorCodeEnum SERVICE_UNAVAILABLE` |

---

## 13. OpenAPI 3 Skeleton (lampiran)

Berikut struktur ekuivalen OpenAPI 3.0 ringkas (tidak lengkap, untuk guidance agent eksekutor):

```yaml
openapi: 3.0.3
info:
  title: PromptFlow API
  version: 0.1.0
  description: API generate paket prompt animasi AI + project/provider management
servers:
  - url: http://localhost:3000
    description: dev
  - url: https://<prod>.vercel.app
    description: prod
components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: authjs.session-token
      description: NextAuth v5 JWT session cookie
  schemas:
    ErrorEnvelope:
      type: object
      required: [error, traceId]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code: { type: string, enum: [VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, PROVIDER_ERROR, TIMEOUT, INTERNAL, BAD_GATEWAY, SERVICE_UNAVAILABLE] }
            message: { type: string }
            details: { type: object, nullable: true }
        traceId: { type: string, format: uuid }
    SuccessEnvelope:
      type: object
      properties:
        data: { type: object }
        pagination:
          type: object
          properties:
            page: { type: integer }
            limit: { type: integer }
            total: { type: integer }
            totalPages: { type: integer }
    GenerateInput:
      type: object
      properties:
        projectId: { type: integer, nullable: true }
        input:
          type: object
          required: [title, durationTarget, style]
          properties:
            title: { type: string, minLength: 3, maxLength: 200 }
            durationTarget:
              type: object
              required: [type, seconds]
              properties:
                type: { type: string, enum: [shorts, tutorial] }
                seconds: { type: integer, minimum: 1 }
            style:
              type: object
              required: [type, ratio]
              properties:
                type: { type: string, enum: ['3D', '2D'] }
                ratio: { type: string }
            providerId: { type: integer, nullable: true }
            references:
              type: array
              items:
                type: object
                properties:
                  name: { type: string }
                  type: { type: string, enum: [tokoh, background, prop, accessory, environment, other] }
            storyDescription: { type: string, maxLength: 500, nullable: true }
    PromptPackage:
      type: object
      required: [title, duration_target, style, character_profiles, scenes, image_prompts, supporting_characters, moral_message]
      properties:
        title: { type: string }
        duration_target:
          type: object
          properties:
            type: { type: string, enum: [shorts, tutorial] }
            seconds: { type: number }
        style:
          type: object
          properties:
            type: { type: string, enum: ['3D', '2D'] }
            aspect_ratio: { type: string }
        character_profiles:
          type: array
          items: { $ref: '#/components/schemas/CharacterProfile' }
        scenes:
          type: array
          items: { $ref: '#/components/schemas/Scene' }
        image_prompts:
          type: object
          properties:
            characters: { type: array, items: { $ref: '#/components/schemas/ImagePromptItem' } }
            backgrounds: { type: array, items: { $ref: '#/components/schemas/ImagePromptItem' } }
        supporting_characters:
          type: array
          items: { $ref: '#/components/schemas/SupportingCharacter' }
        moral_message: { type: string }
    SceneAudioSpec:
      type: object
      properties:
        audio_type: { type: string }
        description: { type: string }
        timing: { type: string }
        volume: { type: number, minimum: 0, maximum: 1 }
        fade_in_ms: { type: number }
        fade_out_ms: { type: number }
        sfx_list:
          oneOf:
            - { type: string, nullable: true }
            - { type: array, items: { type: string }, nullable: true }
          description: 'TARGET FR-GEN-02: union string|array. Current: string only (Bug A).'
security:
  - cookieAuth: []
paths:
  /api/v1/generate:
    post:
      summary: Generate PromptPackage (SSE)
      security: [{ cookieAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/GenerateInput' }
      responses:
        '200':
          description: SSE stream
          content:
            text/event-stream:
              schema: { type: string, description: 'event: <name>\ndata: <json>\n\n' }
        '400': { description: Validation error }
        '401': { description: Unauthorized }
        '404': { description: Provider not found }
        '429': { description: Rate limited }
  /api/v1/health:
    get:
      summary: Health check
      security: []
      responses: { '200': { description: OK } }
  # ... endpoint lain mengikuti pola di S9
```

---

## 14. Relasi Endpoint <-> PRD FR / SRS / DATABASE_SCHEMA

| Endpoint | PRD FR | SRS section | DB tabel |
|---|---|---|---|
| E1 generate | FR-GEN-01..08, FR-PERSIST-01 | S3.1.1..S3.1.8 | projects, characters, scenes, image_prompts, scene_audio, supporting_characters, generation_logs |
| E2 health | - | - | none |
| E3 diagnose | FR-PROV-04 | S3.6.4 | none (read-only check) |
| E4 dashboard | FR-DASH-01 | S3.5.1 | projects, generation_logs, provider_configs |
| E5 register | FR-AUTH-01 | S3.7.1 | users |
| E6 upload | FR-ASSET-01 | S3.9.1 | asset_references |
| E7 classify | FR-ASSET-02 | S3.9.2 | asset_references |
| E8-E14 projects | FR-PROJ-01, FR-PROJ-02, FR-PROJ-03 | S3.2.1..S3.2.3 | projects, asset_references |
| E15 logs | FR-LOG-01 | S3.4.1 | generation_logs |
| E16 characters | FR-PROJ-01 | S3.2.1 | characters |
| E17 image-prompts | FR-PROJ-03 | S3.2.3 | image_prompts |
| E18 export | FR-EXP-01 | S3.3.1 | projects.resultJson (read) |
| E19 theme | FR-PROJ-02 | S3.2.2 | projects.themePreference |
| E20-E21 scenes | FR-PROJ-01 | S3.2.1 | scenes |
| E22-E23 scene audio | FR-PROJ-01 | S3.2.1 | scene_audio |
| E24-E29 providers | FR-PROV-01, FR-PROV-02, FR-PROV-03 | S3.6.1..S3.6.3 | provider_configs |

---

## 15. Citation Index

| Citation | Klaim |
|---|---|
| `RAG S3.2` | 24 route files API v1 |
| `RAG S5` | generation pipeline end-to-end |
| `RAG S6` | PromptPackageSchema struktur |
| `RAG S6.1, S6.3` | SceneAudioSpecSchema vs SceneAudioSchema duplikat |
| `RAG S10.1, S10.4` | NextAuth v5 + middleware gate |
| `RAG S11 Bug A` | sfx_list VALIDATION root cause |
| `RAG S11 Bug B` | JSON_PARSE repair fail |
| `RAG S11 Bug D` | safeDbOp partial silent |
| `RAG S12 G4` | register bcrypt.hash ASUMSI |
| `route.ts:19-21` | runtime nodejs maxDuration 300 force-dynamic |
| `route.ts:53-564` | generate endpoint full |
| `route.ts:558` | SSE content-type |
| `route.ts:28-30` | sseFormat |
| `route.ts:262,296,548` | error event |
| `route.ts:518` | done event |
| `route.ts:35-51` | safeDbOp |
| `schemas.ts:39-55` | SceneAudioSpecSchema |
| `schemas.ts:52` | sfx_list z.string() ROOT Bug A |
| `schemas.ts:83-99` | SceneAudioSchema duplikat |
| `schemas.ts:106-124` | PromptPackageSchema |
| `schemas.ts:149-155` | CreateProjectInputSchema |
| `schemas.ts:159` | ProviderEnum |
| `schemas.ts:161-168` | CreateProviderConfigInputSchema |
| `schemas.ts:181-200` | GenerateInputSchema |
| `schemas.ts:209-235` | ProjectDTO, ProviderConfigDTO |
| `schemas.ts:237-249` | ErrorCodeEnum |
| `error.ts:10-20` | errorResponse envelope |
| `error.ts:39-41` | successResponse envelope |
| `error.ts:43-45` | noContentResponse |
| `middleware.ts:6-16` | public paths |
| `middleware.ts:18-36,109-127` | rate limit 10/min |
| `middleware.ts:80-86` | secureCookie |
| `schema.ts:5-201` | 10 tabel DB |
| `schema.ts:44` | projects.themePreference |
| `schema.ts:47` | projects.deletedAt soft delete |
| `schema.ts:193` | scene_audio.sfxList text |
| `config.ts:11-38` | NextAuth Credentials |
| `aes.ts:4-49` | AES-256-GCM |
| `llm-client.ts:18-44` | categorizeError |
| `llm-client.ts:284-289` | fetch timeout 600s |

---

## 16. ASUMSI (tidak ada bukti di repo)

| # | Item | Alasan |
|---|---|---|
| A1 | Base URL prod `https://<vercel>.vercel.app` | `vercel.json` tidak dibaca (`RAG G14`) |
| A2 | Session expiry 30 hari | `authConfig` edge isi tidak dibaca (`RAG G5`) |
| A3 | Register route `bcrypt.hash` + `RegisterSchema` | `register/route.ts` tidak dibaca (`RAG G4`) |
| A4 | Upload `multipart/form-data` + field shape | `upload/route.ts` tidak dibaca |
| A5 | Classify request `{ assetId }` | `upload/classify/route.ts` tidak dibaca (`RAG G17`) |
| A6 | Dashboard stats response shape | `dashboard.repo.ts` tidak dibaca (`RAG G20`) |
| A7 | Diagnose response shape | `diagnose/route.ts` tidak dibaca (`RAG G18`) |
| A8 | Provider test response shape | `test/route.ts` tidak dibaca (`RAG G19`) |
| A9 | Pagination default `page=1, limit=20` | repo tidak dibaca, ASUMSI konvensi |
| A10 | Sort default `createdAt DESC` | repo tidak dibaca |
| A11 | Export response `text/markdown` | `export/route.ts` tidak dibaca, SRS S3.3.1 sebut |
| A12 | Scene audio CRUD request body `SceneAudioSchema` strict | `audio/route.ts` tidak dibaca (`RAG G6`), SRS S3.1.2 sebut |
| A13 | 429 response header `Retry-After` | middleware return shape tidak diverifikasi |
| A14 | CORS same-origin only | tidak ada config CORS terbukti |
| A15 | `role` admin RBAC | hanya default 'user' terdefinisi (`DATABASE_SCHEMA A2`) |
| A16 | Bulk-delete multi-status 207 | repo tidak dibaca |

---

> Dokumen ini fokus pada API CONTRACT: endpoint, method, schema, status, auth, error envelope, pagination, versioning, rate limit. Selaras PRD (what) + SRS (how) + PROJECT_ARCHITECTURE (layering) + DATABASE_SCHEMA (data shape). Dokumen turunan: CODING_RULES, TEST_PLAN, AGENTS.md.