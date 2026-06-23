# DATABASE_SCHEMA.md - PromptFlow Database Schema

> Disusun oleh docgen-dbschema. Source of truth: `product-docs/RAG-CONTEXT.md` (retrieval 2026-06-23) + `PRD.md` + `SRS.md`.
> Klaim faktual bertumpu pada RAG (cite file:line). Item tanpa bukti ditandai `ASUMSI`.
> Bahasa naratif: Bahasa Indonesia. Identifier teknis + SQL/Drizzle apa adanya.
> Fokus: entitas, tabel, kolom + tipe, PK/FK, relasi (ERD), index, constraint, normalisasi, migration, seed, retensi data.

---

## 1. Ringkasan Model Data + Jenis Database

### 1.1 Jenis database + justifikasi

**DB = Turso/libSQL** (SQLite-compatible, hosted). **BUKAN Postgres/MySQL** (`RAG S2`, koreksi penting `RAG` baris 62-63).

| Aspek | Nilai | Citation |
|---|---|---|
| DB engine | Turso/libSQL (SQLite wire-compatible) | `src/lib/db/client.ts:2-13`, `drizzle.config.ts:18` |
| Driver | `@libsql/client ^0.14.0` | `package.json:25` |
| ORM | `drizzle-orm ^0.38.0` (dialect `sqlite-core`, casing `snake_case`) | `package.json:47`, `src/lib/db/schema.ts:2`, `src/lib/db/client.ts:2` |
| Migration tool | `drizzle-kit ^0.30.0` (dialect `turso`) | `package.json:46`, `drizzle.config.ts:18` |
| Env wajib | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | `client.ts:6-10`, `drizzle.config.ts:9-13` |

**Justifikasi Turso/libSQL** (`SRS S1.1`): monolith Next.js Vercel-managed, butuh DB hosted zero-ops, edge-read, SQLite wire-compatible. libSQL = SQLite extended dengan native replication. Tipe data terbatas: `integer`, `text`, `real`. Tidak ada `jsonb`, `timestamptz`, `uuid`, `serial` Postgres-style. Timestamp = `integer` (unixepoch second). Boolean = `integer` 0/1 (`RAG S9`).

### 1.2 Daftar entitas (11 tabel)

| # | Entitas | Tabel DB | Deskripsi | Citation |
|---|---|---|---|---|
| E1 | User | `users` | Akun pengguna NextAuth Credentials | `schema.ts:5-14` |
| E2 | ProviderConfig | `provider_configs` | Konfigurasi provider LLM per user (API key encrypted) | `schema.ts:17-30` |
| E3 | Project | `projects` | Paket prompt animasi + result JSON + status generate | `schema.ts:33-51` |
| E4 | AssetReference | `asset_references` | Upload asset (image) + AI classification V2 | `schema.ts:54-68` |
| E5 | Character | `characters` | Profil karakter utama konsisten lintas scene | `schema.ts:71-87` |
| E6 | Scene | `scenes` | Unit scene dengan voiceover + transition + voice V3 | `schema.ts:90-117` |
| E7 | ImagePrompt | `image_prompts` | 8-layer image prompt (master list atau per-scene) | `schema.ts:120-144` |
| E8 | GenerationLog | `generation_logs` | Audit log generate (success/partial/fail + logsJson) | `schema.ts:147-160` |
| E9 | SupportingCharacter | `supporting_characters` | Karakter pendukung per scene | `schema.ts:163-174` |
| E10 | SceneAudio | `scene_audio` | Spec audio per scene (V3) - background_music/sfx/ambient/music_cue/transition_audio | `schema.ts:177-201` |
| E11 | StoryboardSegment | `storyboard_segments` | Storyboard prompt per 10-detik segmen (F-SB-01) | Design doc S5.1 |

> **Catatan**: RAG S9 menyebut "9 tabel" tapi schema.ts mendefinisikan 10 `sqliteTable` (V3) + 1 tabel storyboard (F-SB-01). `accounts` + `sessions` (NextAuth adapter tables) **TIDAK ADA** di schema.ts - NextAuth v5 beta pakai Credentials provider + JWT session strategy, tidak pakai DB adapter (`RAG S10.1`, `config.ts:6` edge). Jadi total tabel persisten = 11. Task prompt menyebut "users, accounts, sessions" - `accounts`/`sessions` ASUMSI tidak terdefinisi di repo (NextAuth JWT mode).

---

## 2. ERD (Diagram Relasi)

```mermaid
erDiagram
    users ||--o{ provider_configs : "1-N cascade"
    users ||--o{ projects : "1-N cascade"
    projects ||--o{ asset_references : "1-N cascade"
    projects ||--o{ characters : "1-N cascade unique nama"
    projects ||--o{ scenes : "1-N cascade unique orderNo"
    projects ||--o{ image_prompts : "1-N cascade"
    projects ||--o{ generation_logs : "1-N cascade"
    projects ||--o{ supporting_characters : "1-N cascade"
    projects ||--o{ scene_audio : "1-N cascade"
    projects ||--o{ storyboard_segments : "1-N cascade unique segmentIndex"
    scenes ||--o{ image_prompts : "1-N cascade nullable(master=null)"
    scenes ||--o{ supporting_characters : "1-N set null"
    scenes ||--o{ scene_audio : "1-N cascade"
    users { integer id PK text email UNIQUE text name text password_hash text image text role integer created_at integer updated_at }
    provider_configs { integer id PK integer user_id FK text provider text name text base_url text model text api_key_encrypted integer is_active integer created_at integer updated_at }
    projects { integer id PK integer user_id FK text title text duration_type integer duration_target_seconds text style_type text aspect_ratio text result_json text status text story_description text theme_preference integer created_at integer updated_at integer deleted_at }
    asset_references { integer id PK integer project_id FK text tipe text filename text blob_url text label text mime_type integer size_bytes text ai_classification integer created_at }
    characters { integer id PK integer project_id FK text nama text gayarambut text wajah_asal text pakaian_atas text pakaian_bawah text alas_kaki text deskripsi_latar text aksi text peran integer created_at }
    scenes { integer id PK integer project_id FK integer order_no text description text voiceover_script text transition_type integer transition_duration_ms text transition_easing text transition_direction text voice_type text voice_emotion real voice_speed text voice_pitch integer duration_seconds text scene_pacing text scene_mood text voiceover_speaker integer created_at }
    image_prompts { integer id PK integer project_id FK integer scene_id FK text tipe text target text prompt_text text reference_filename text composition text lighting text camera text mood_atmosphere text style_references text color_palette text technical integer created_at }
    generation_logs { integer id PK integer project_id FK text provider text model integer duration_ms text status text error_message text logs_json integer created_at }
    supporting_characters { integer id PK integer project_id FK integer scene_id FK text nama text tipe text aksi integer created_at }
    scene_audio { integer id PK integer project_id FK integer scene_id FK text audio_type text description text timing integer duration_seconds real volume integer fade_in_ms integer fade_out_ms text music_genre text music_mood integer music_tempo_bpm text music_instruments real music_volume text sfx_list text ambient_type real ambient_volume integer created_at }
    storyboard_segments { integer id PK integer project_id FK integer segment_index integer segment_time_start integer segment_time_end integer panel_count text visual_style_json text character_sheet_json text location_sheet_json text panels_json text markdown_prompt text segment_transition_note text provider text model text status integer created_at integer updated_at }
```

---

## 3. Definisi Tabel (kolom, tipe, PK, FK, nullable, default, notes)

### 3.1 `users` (`schema.ts:5-14`)

| Kolom (camelCase Drizzle / snake_case DB) | Tipe Drizzle | Tipe SQL | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|---|
| `id` / `id` | `integer().primaryKey({autoIncrement:true})` | INTEGER PK AUTOINC | YA | - | NO | AUTOINCREMENT | Surrogate PK | `schema.ts:6` |
| `email` / `email` | `text().notNull().unique()` | TEXT UNIQUE | - | - | NO | - | Email login (lowercased di authorize, `config.ts:25`) | `schema.ts:7` |
| `name` / `name` | `text()` | TEXT | - | - | YA | - | Display name | `schema.ts:8` |
| `passwordHash` / `password_hash` | `text().notNull()` | TEXT | - | - | NO | - | bcrypt hash (`config.ts:31`) | `schema.ts:9` |
| `image` / `image` | `text()` | TEXT | - | - | YA | - | Avatar URL | `schema.ts:10` |
| `role` / `role` | `text().notNull().default('user')` | TEXT | - | - | NO | `'user'` | RBAC role (ASUMSI: `user`/`admin`, hanya default terdefinisi) | `schema.ts:11` |
| `createdAt` / `created_at` | `integer().default(sql'(unixepoch())').notNull()` | INTEGER | - | - | NO | `unixepoch()` | Audit created (epoch second) | `schema.ts:12` |
| `updatedAt` / `updated_at` | `integer().default(sql'(unixepoch())').notNull()` | INTEGER | - | - | NO | `unixepoch()` | Audit updated (epoch second) | `schema.ts:13` |

### 3.2 `provider_configs` (`schema.ts:17-30`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` / `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:18` |
| `userId` / `user_id` | integer notNull references users.id cascade | - | users.id | NO | - | Cascade delete bila user hapus | `schema.ts:19` |
| `provider` / `provider` | text notNull | - | - | NO | - | Enum: `ollama\|openrouter\|9router\|custom` (`schemas.ts:159`) | `schema.ts:20` |
| `name` / `name` | text notNull | - | - | NO | - | Label config user (mis. "My MiniMax") | `schema.ts:21` |
| `baseUrl` / `base_url` | text notNull | - | - | NO | - | Endpoint base (mis. `https://openrouter.ai/api/v1`) | `schema.ts:22` |
| `model` / `model` | text notNull | - | - | NO | - | Model ID (mis. `minimax/MiniMax-M3`) | `schema.ts:23` |
| `apiKeyEncrypted` / `api_key_encrypted` | text | - | - | YA | - | AES-256-GCM ciphertext (`aes.ts:4-43`), nullable = BYO key opsional (local Ollama) | `schema.ts:24` |
| `isActive` / `is_active` | integer notNull default 1 | - | - | NO | `1` | Boolean 0/1 (active provider) | `schema.ts:25` |
| `createdAt` / `created_at` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:26` |
| `updatedAt` / `updated_at` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:27` |

**Unique index**: `idx_provider_configs_user_name` ON `(user_id, name)` (`schema.ts:29`, DDL `0000:100`).

### 3.3 `projects` (`schema.ts:33-51`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:34` |
| `userId` / `user_id` | integer notNull refs users.id cascade | - | users.id | NO | - | Owner | `schema.ts:35` |
| `title` | text notNull | - | - | NO | - | Judul project | `schema.ts:36` |
| `durationType` / `duration_type` | text notNull | - | - | NO | - | Enum: `shorts\|tutorial` (ASUMSI dari template presets `presets.ts:53`) | `schema.ts:37` |
| `durationTargetSeconds` / `duration_target_seconds` | integer notNull | - | - | NO | - | Target durasi detik | `schema.ts:38` |
| `styleType` / `style_type` | text notNull | - | - | NO | - | Style visual | `schema.ts:39` |
| `aspectRatio` / `aspect_ratio` | text notNull | - | - | NO | - | Rasio (9:16, 16:9, 1:1) | `schema.ts:40` |
| `resultJson` / `result_json` | text | - | - | YA | - | JSON string PromptPackage (`prompt-builder.ts:137-168`) | `schema.ts:41` |
| `status` | text notNull default 'draft' | - | - | NO | `'draft'` | Enum: `draft\|generating\|complete\|failed` (`route.ts:316,238`) | `schema.ts:42` |
| `storyDescription` / `story_description` | text | - | - | YA | - | V2, max 500 char (`schema.ts:43` comment) | `schema.ts:43` |
| `themePreference` / `theme_preference` | text default 'dark' | - | - | YA | `'dark'` | V3 UI theme: `dark\|light\|system` (`schemas.ts:103-104`) | `schema.ts:44` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:45` |
| `updatedAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:46` |
| `deletedAt` / `deleted_at` | integer | - | - | YA | - | Soft delete timestamp (epoch) | `schema.ts:47` |

**Indexes**: `idx_projects_user_id` ON `(user_id)`; `idx_projects_user_created` ON `(user_id, created_at)` (`schema.ts:49-50`, DDL `0000:84-85`).

### 3.4 `asset_references` (`schema.ts:54-68`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:55` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:56` |
| `tipe` | text notNull | - | - | NO | - | Enum: `tokoh\|background\|prop\|accessory\|environment\|other` (`schemas.ts:173`) | `schema.ts:57` |
| `filename` | text notNull | - | - | NO | - | Nama file asli | `schema.ts:58` |
| `blobUrl` / `blob_url` | text notNull | - | - | NO | - | Vercel Blob URL | `schema.ts:59` |
| `label` | text | - | - | YA | - | Label user | `schema.ts:60` |
| `mimeType` / `mime_type` | text | - | - | YA | - | - | `schema.ts:61` |
| `sizeBytes` / `size_bytes` | integer | - | - | YA | - | Ukuran byte | `schema.ts:62` |
| `aiClassification` / `ai_classification` | text | - | - | YA | - | V2 JSON dari Vision LLM classification | `schema.ts:63` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:64` |

**Indexes**: `idx_asset_refs_project_id` ON `(project_id)`; `idx_asset_refs_project_tipe` ON `(project_id, tipe)` (`schema.ts:66-67`, DDL `0000:15-16`).

### 3.5 `characters` (`schema.ts:71-87`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:72` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:73` |
| `nama` | text notNull | - | - | NO | - | Nama karakter (Indonesia) | `schema.ts:74` |
| `gayarambut` | text notNull | - | - | NO | - | - | `schema.ts:75` |
| `wajahAsal` / `wajah_asal` | text notNull | - | - | NO | - | - | `schema.ts:76` |
| `pakaianAtas` / `pakaian_atas` | text notNull | - | - | NO | - | - | `schema.ts:77` |
| `pakaianBawah` / `pakaian_bawah` | text notNull | - | - | NO | - | - | `schema.ts:78` |
| `alasKaki` / `alas_kaki` | text notNull | - | - | NO | - | - | `schema.ts:79` |
| `deskripsiLatar` / `deskripsi_latar` | text notNull | - | - | NO | - | - | `schema.ts:80` |
| `aksi` | text notNull | - | - | NO | - | - | `schema.ts:81` |
| `peran` | text notNull | - | - | NO | - | voice_type: `child\|teen\|adult_male\|adult_female\|elderly_male\|elderly_female\|narrator` (`prompt-builder.ts:139`) | `schema.ts:82` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:83` |

**Indexes**: `idx_characters_project_id` ON `(project_id)`; **unique** `idx_characters_project_nama` ON `(project_id, nama)` (`schema.ts:85-86`, DDL `0000:33-34`). No `updatedAt` kolom (hanya created).

### 3.6 `scenes` (`schema.ts:90-117`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:91` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:92` |
| `orderNo` / `order_no` | integer notNull | - | - | NO | - | Urutan scene (1-based) | `schema.ts:93` |
| `description` | text notNull | - | - | NO | - | Deskripsi adegan | `schema.ts:94` |
| `voiceoverScript` / `voiceover_script` | text notNull | - | - | NO | - | Teks narasi | `schema.ts:95` |
| `transitionType` / `transition_type` | text notNull default 'cut' | - | - | NO | `'cut'` | V3. Enum: `cut\|dissolve\|fade_to_black\|fade_to_white\|wipe\|match_cut\|fade_in` (`prompt-builder.ts:148`) | `schema.ts:97` |
| `transitionDurationMs` / `transition_duration_ms` | integer notNull default 0 | - | - | NO | `0` | V3 ms | `schema.ts:98` |
| `transitionEasing` / `transition_easing` | text notNull default 'linear' | - | - | NO | `'linear'` | V3. Enum: `linear\|ease_in\|ease_out\|ease_in_out` | `schema.ts:99` |
| `transitionDirection` / `transition_direction` | text notNull default 'forward' | - | - | NO | `'forward'` | V3. Enum: `forward\|backward\|loop` | `schema.ts:100` |
| `voiceType` / `voice_type` | text notNull default 'narrator' | - | - | NO | `'narrator'` | V3. Enum voice persona | `schema.ts:102` |
| `voiceEmotion` / `voice_emotion` | text notNull default 'neutral' | - | - | NO | `'neutral'` | V3. Enum: `neutral\|happy\|sad\|excited\|calm\|dramatic` | `schema.ts:103` |
| `voiceSpeed` / `voice_speed` | real notNull default 1.0 | - | - | NO | `1.0` | V3 0.5-2.0 | `schema.ts:104` |
| `voicePitch` / `voice_pitch` | text notNull default 'auto' | - | - | NO | `'auto'` | V3. Enum: `low\|medium\|high\|auto` | `schema.ts:105` |
| `durationSeconds` / `duration_seconds` | integer | - | - | YA | - | V3 durasi detik (nullable bila belum dikalkulasi) | `schema.ts:107` |
| `scenePacing` / `scene_pacing` | text notNull default 'normal' | - | - | NO | `'normal'` | V3. Enum: `fast\|normal\|slow` (comment schema.ts:108 "ASUMSI") | `schema.ts:109` |
| `sceneMood` / `scene_mood` | text | - | - | YA | - | V3. Enum: `cheerful\|dramatic\|tense\|peaceful\|mysterious` | `schema.ts:110` |
| `voiceoverSpeaker` / `voiceover_speaker` | text notNull default 'narrator' | - | - | NO | `'narrator'` | V3 siapa bicara | `schema.ts:112` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:113` |

**Indexes**: `idx_scenes_project_id` ON `(project_id)`; **unique** `idx_scenes_project_order` ON `(project_id, order_no)` (`schema.ts:115-116`, DDL `0000:111-112`).

### 3.7 `image_prompts` (`schema.ts:120-144`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:121` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:122` |
| `sceneId` / `scene_id` | integer refs scenes.id cascade | - | scenes.id | YA | - | Nullable = master reference list (root image_prompts) | `schema.ts:123` |
| `tipe` | text notNull | - | - | NO | - | Enum: `tokoh\|background` | `schema.ts:124` |
| `target` | text notNull | - | - | NO | - | Nama target (mis. "Karakter Rina") | `schema.ts:125` |
| `promptText` / `prompt_text` | text notNull | - | - | NO | - | Prompt 80-200 kata (`prompt-builder.ts:144`) | `schema.ts:126` |
| `referenceFilename` / `reference_filename` | text | - | - | YA | - | Asset ref filename | `schema.ts:127` |
| `composition` | text | - | - | YA | - | V3 JSON string `{foreground,midground,background}` | `schema.ts:129` |
| `lighting` | text | - | - | YA | - | V3 JSON string `{key,fill,rim,style}` | `schema.ts:130` |
| `camera` | text | - | - | YA | - | V3 JSON string `{angle,lens,depth_of_field,movement}` | `schema.ts:131` |
| `moodAtmosphere` / `mood_atmosphere` | text | - | - | YA | - | V3 | `schema.ts:133` |
| `styleReferences` / `style_references` | text | - | - | YA | - | V3 | `schema.ts:134` |
| `colorPalette` / `color_palette` | text | - | - | YA | - | V3 JSON string array hex (denormalized dari Zod union `schemas.ts:29`) | `schema.ts:136` |
| `technical` | text | - | - | YA | - | V3 JSON string `{resolution,aspect_ratio,engine,format}` | `schema.ts:137` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:138` |

**Indexes**: `idx_image_prompts_project_id`, `idx_image_prompts_scene_id`, `idx_image_prompts_project_tipe` ON `(project_id, tipe)`, `idx_image_prompts_project_scene` ON `(project_id, scene_id)` (`schema.ts:140-143`, DDL `0000:63-66`).

### 3.8 `generation_logs` (`schema.ts:147-160`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:148` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:149` |
| `provider` | text notNull | - | - | NO | - | Provider name saat generate | `schema.ts:150` |
| `model` | text notNull | - | - | NO | - | Model ID saat generate | `schema.ts:151` |
| `durationMs` / `duration_ms` | integer | - | - | YA | - | Durasi generate ms | `schema.ts:152` |
| `status` | text notNull | - | - | NO | - | Enum: `success\|partial\|fail` (`route.ts:502-513`) | `schema.ts:153` |
| `errorMessage` / `error_message` | text | - | - | YA | - | Pesan error categorize (`llm-client.ts:18-44`) | `schema.ts:154` |
| `logsJson` / `logs_json` | text | - | - | YA | - | V2 JSON array real-time log entries | `schema.ts:155` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:156` |

**Indexes**: `idx_gen_logs_project_id`, `idx_gen_logs_project_created` ON `(project_id, created_at)` (`schema.ts:158-159`, DDL `0000:48-49`).

### 3.9 `supporting_characters` (`schema.ts:163-174`)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:164` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:165` |
| `sceneId` / `scene_id` | integer refs scenes.id set null | - | scenes.id | YA | - | On delete scene -> set null (karakter pendukung tidak hilang) | `schema.ts:166` |
| `nama` | text notNull | - | - | NO | - | - | `schema.ts:167` |
| `tipe` | text notNull | - | - | NO | - | - | `schema.ts:168` |
| `aksi` | text notNull | - | - | NO | - | - | `schema.ts:169` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:170` |

**Indexes**: `idx_supporting_chars_project_id`, `idx_supporting_chars_scene_id` (`schema.ts:172-173`, DDL `0000:125-126`).

### 3.10 `scene_audio` (`schema.ts:177-201`) - V3 NEW

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | `schema.ts:178` |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | - | `schema.ts:179` |
| `sceneId` / `scene_id` | integer notNull refs scenes.id cascade | - | scenes.id | NO | - | - | `schema.ts:180` |
| `audioType` / `audio_type` | text notNull | - | - | NO | - | Enum: `background_music\|sfx\|ambient\|music_cue\|transition_audio` (`prompt-builder.ts:152`) | `schema.ts:181` |
| `description` | text notNull | - | - | NO | - | - | `schema.ts:182` |
| `timing` | text notNull default 'throughout' | - | - | NO | `'throughout'` | Enum: `start\|throughout\|end\|specific_moment` | `schema.ts:183` |
| `durationSeconds` / `duration_seconds` | integer | - | - | YA | - | - | `schema.ts:184` |
| `volume` | real notNull default 0.7 | - | - | NO | `0.7` | 0-1 (DB default 0.7; Zod `SceneAudioSpecSchema` default 0.5 - inkonsistensi Bug F) | `schema.ts:185` |
| `fadeInMs` / `fade_in_ms` | integer notNull default 0 | - | - | NO | `0` | - | `schema.ts:186` |
| `fadeOutMs` / `fade_out_ms` | integer notNull default 0 | - | - | NO | `0` | - | `schema.ts:187` |
| `musicGenre` / `music_genre` | text | - | - | YA | - | - | `schema.ts:188` |
| `musicMood` / `music_mood` | text | - | - | YA | - | - | `schema.ts:189` |
| `musicTempoBpm` / `music_tempo_bpm` | integer | - | - | YA | - | DB tanpa range; `SceneAudioSchema` duplikat punya `min(60).max(200)` (`schemas.ts:93`) | `schema.ts:190` |
| `musicInstruments` / `music_instruments` | text | - | - | YA | - | - | `schema.ts:191` |
| `musicVolume` / `music_volume` | real default 0.7 | - | - | YA | `0.7` | - | `schema.ts:192` |
| **`sfxList` / `sfx_list`** | **text** | - | - | **YA** | - | **BUG A**: DB = text, Zod `SceneAudioSpecSchema` = `z.string().nullable().optional()` (`schemas.ts:52`), LLM kirim array -> reject. Fix: union + normalizer (lihat S4) | `schema.ts:193` |
| `ambientType` / `ambient_type` | text | - | - | YA | - | - | `schema.ts:194` |
| `ambientVolume` / `ambient_volume` | real default 0.5 | - | - | YA | `0.5` | - | `schema.ts:195` |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | `schema.ts:196` |

**Indexes**: `idx_scene_audio_project_id`, `idx_scene_audio_scene_id`, `idx_scene_audio_project_scene` ON `(project_id, scene_id)` (`schema.ts:198-200`, DDL `0001:41-43`).

### 3.11 `storyboard_segments` (F-SB-01 NEW)

| Kolom | Tipe Drizzle | PK | FK | Nullable | Default | Notes | Citation |
|---|---|---|---|---|---|---|---|
| `id` | integer PK autoInc | YA | - | NO | AUTOINC | - | Design doc S5.1 |
| `projectId` / `project_id` | integer notNull refs projects.id cascade | - | projects.id | NO | - | On delete project -> hapus segmen | Design doc S5.1 |
| `segmentIndex` / `segment_index` | integer notNull | - | - | NO | - | 1-based, unik per project | Design doc S5.1 |
| `segmentTimeStart` / `segment_time_start` | integer notNull | - | - | NO | - | Detik awal segmen | Design doc S5.1 |
| `segmentTimeEnd` / `segment_time_end` | integer notNull | - | - | NO | - | Detik akhir segmen (<= total durasi) | Design doc S5.1 |
| `panelCount` / `panel_count` | integer notNull | - | - | NO | - | Jumlah panel per segmen | Design doc S5.1 |
| `visualStyleJson` / `visual_style_json` | text notNull | - | - | NO | - | JSON Visual Style Guide | Design doc S5.1 |
| `characterSheetJson` / `character_sheet_json` | text notNull | - | - | NO | - | JSON Character Sheet array | Design doc S5.1 |
| `locationSheetJson` / `location_sheet_json` | text notNull | - | - | NO | - | JSON Location Sheet array | Design doc S5.1 |
| `panelsJson` / `panels_json` | text notNull | - | - | NO | - | JSON array panel detail | Design doc S5.1 |
| `markdownPrompt` / `markdown_prompt` | text notNull | - | - | NO | - | Compiled Markdown siap copy | Design doc S5.1 |
| `segmentTransitionNote` / `segment_transition_note` | text | - | - | YA | - | Catatan transisi antar segmen | Design doc S5.1 |
| `provider` | text notNull | - | - | NO | - | Provider name saat generate | Design doc S5.1 |
| `model` | text notNull | - | - | NO | - | Model ID saat generate | Design doc S5.1 |
| `status` | text notNull default 'draft' | - | - | NO | `'draft'` | Enum: `draft\|generating\|complete\|failed` | Design doc S5.1 |
| `createdAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | Design doc S5.1 |
| `updatedAt` | integer notNull default unixepoch | - | - | NO | unixepoch | - | Design doc S5.1 |

**Indexes**: `idx_storyboard_segments_project_id` ON `(project_id)`; **unique** `idx_storyboard_segments_project_segment` ON `(project_id, segment_index)` (Design doc S5.1).

**Drizzle ORM snippet** (`schema.ts` extend):
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

---

## 4. Kolom Kunci Minat: `scene_audio.sfxList` (BUG A)

### 4.1 Status kini

| Sisi | Tipe | Citation |
|---|---|---|
| DB `scene_audio.sfxList` | `text` (string nullable) | `schema.ts:193` |
| Zod `SceneAudioSpecSchema.sfx_list` (dipakai generate) | `z.string().nullable().optional()` | `schemas.ts:52` |
| Zod `SceneAudioSchema.sfx_list` (duplikat, CRUD endpoint) | `z.string().nullable().optional()` | `schemas.ts:96` |
| LLM natural output (MiniMax-M3) | array `["footstep","door"]` | log user (RAG S11 Bug A) |
| Prompt instruction | ambigu - "Untuk sfx: sfx_list." tanpa tipe | `prompt-builder.ts:152` |
| Contoh JSON | TIDAK ADA audio_spec sfx di `JSON_SCHEMA_EXAMPLE` | `prompt-builder.ts:75-97` |

**Bug**: LLM kirim array, Zod reject "Expected string, received array" (`schemas.ts:52`) -> category `VALIDATION` (`llm-client.ts:28-36`) -> retry gagal identik (body sama, `llm-client.ts:274,287`) -> generate fail.

### 4.2 Target behavior (per SRS FR-GEN-02)

SRS (`SRS S3.1.2` baris 196-228) merekomendasikan **schema union + app-level normalizer**:

**Schema change** (`schemas.ts:52`):
```typescript
sfx_list: z.union([z.string(), z.array(z.string())]).nullable().optional(),
```
Pola union sudah ada untuk `color_palette` (`schemas.ts:29`).

**Normalizer di route.ts sebelum DB insert** (`SRS S3.1.2` baris 213-217):
```typescript
const normalizedSfxList = Array.isArray(audio.sfx_list)
  ? audio.sfx_list.join(', ')
  : (audio.sfx_list ?? null);
// insert scene_audio dengan sfxList: normalizedSfxList
```

**Alur target**:
1. LLM kirim `sfx_list: ["footstep","door creak","wind"]` (array).
2. `PromptPackageSchema.parse(parsedJson)` - union terima array (PASS).
3. Normalizer coerce `["footstep","door creak","wind"]` -> `"footstep,door creak,wind"` (string comma-separated).
4. DB insert `scene_audio.sfxList` = `"footstep,door creak,wind"` (text, konsisten DB).
5. Read-back: app split `sfxList.split(', ')` untuk display sebagai array bila perlu.

**DB column TIDAK berubah** - tetap `text` (`schema.ts:193`). Coercion di app layer, bukan DB. Migration tidak diperlukan untuk kolom ini (sudah `text` nullable).

**Acceptance** (`SRS S3.1.2` baris 229, `PRD AC-GEN-02`): unit test `schemas.test.ts` parse `{sfx_list: ["a","b"]}` sukses + normalizer `["a","b"]` -> `"a,b"`.

---

## 5. Index & Constraint

### 5.1 Index yang ADA (cite schema.ts + DDL)

| Tabel | Index name | Kolom | Tipe | Citation |
|---|---|---|---|---|
| users | `users_email_unique` | `(email)` | UNIQUE | `schema.ts:7`, DDL `0000:138` |
| provider_configs | `idx_provider_configs_user_name` | `(user_id, name)` | UNIQUE | `schema.ts:29`, DDL `0000:100` |
| projects | `idx_projects_user_id` | `(user_id)` | INDEX | `schema.ts:49`, DDL `0000:84` |
| projects | `idx_projects_user_created` | `(user_id, created_at)` | INDEX | `schema.ts:50`, DDL `0000:85` |
| asset_references | `idx_asset_refs_project_id` | `(project_id)` | INDEX | `schema.ts:66`, DDL `0000:15` |
| asset_references | `idx_asset_refs_project_tipe` | `(project_id, tipe)` | INDEX | `schema.ts:67`, DDL `0000:16` |
| characters | `idx_characters_project_id` | `(project_id)` | INDEX | `schema.ts:85`, DDL `0000:33` |
| characters | `idx_characters_project_nama` | `(project_id, nama)` | UNIQUE | `schema.ts:86`, DDL `0000:34` |
| scenes | `idx_scenes_project_id` | `(project_id)` | INDEX | `schema.ts:115`, DDL `0000:111` |
| scenes | `idx_scenes_project_order` | `(project_id, order_no)` | UNIQUE | `schema.ts:116`, DDL `0000:112` |
| image_prompts | `idx_image_prompts_project_id` | `(project_id)` | INDEX | `schema.ts:140`, DDL `0000:63` |
| image_prompts | `idx_image_prompts_scene_id` | `(scene_id)` | INDEX | `schema.ts:141`, DDL `0000:64` |
| image_prompts | `idx_image_prompts_project_tipe` | `(project_id, tipe)` | INDEX | `schema.ts:142`, DDL `0000:65` |
| image_prompts | `idx_image_prompts_project_scene` | `(project_id, scene_id)` | INDEX | `schema.ts:143`, DDL `0000:66` |
| generation_logs | `idx_gen_logs_project_id` | `(project_id)` | INDEX | `schema.ts:158`, DDL `0000:48` |
| generation_logs | `idx_gen_logs_project_created` | `(project_id, created_at)` | INDEX | `schema.ts:159`, DDL `0000:49` |
| supporting_characters | `idx_supporting_chars_project_id` | `(project_id)` | INDEX | `schema.ts:172`, DDL `0000:125` |
| supporting_characters | `idx_supporting_chars_scene_id` | `(scene_id)` | INDEX | `schema.ts:173`, DDL `0000:126` |
| scene_audio | `idx_scene_audio_project_id` | `(project_id)` | INDEX | `schema.ts:198`, DDL `0001:41` |
| scene_audio | `idx_scene_audio_scene_id` | `(scene_id)` | INDEX | `schema.ts:199`, DDL `0001:42` |
| scene_audio | `idx_scene_audio_project_scene` | `(project_id, scene_id)` | INDEX | `schema.ts:200`, DDL `0001:43` |
| storyboard_segments | `idx_storyboard_segments_project_id` | `(project_id)` | INDEX | Design doc S5.1 |
| storyboard_segments | `idx_storyboard_segments_project_segment` | `(project_id, segment_index)` | UNIQUE | Design doc S5.1 |

### 5.2 Index yang SEHARUSNYA ada (SHOULD - belum di schema.ts)

| Tabel | Kolom | Alasan | Rekomendasi |
|---|---|---|---|
| `projects` | `(user_id, deleted_at)` | Query list project aktif per user (soft delete filter) - `idx_projects_user_created` tidak filter deleted_at | Composite index `(user_id, deleted_at, created_at)` |
| `generation_logs` | `(created_at)` standalone | Retention purge job scan global by createdAt (lihat S9) | Single-col index `idx_gen_logs_created_at` |
| `generation_logs` | `(status, created_at)` | Dashboard stats filter status + sort recent | Composite index |
| `scene_audio` | `(project_id, audio_type)` | Filter sfx/music per project untuk display grouping | Composite index |
| `users` | `(role)` | Admin query list user by role (bila RBAC admin UI) | Single-col index (low priority, user count kecil) |

### 5.3 Constraint & validasi level DB

SQLite/libSQL **TIDAK mendukung** `CHECK` constraint native yang kompleks, `ENUM` type, atau `JSONB` validation. Validasi domain dilakukan di **app layer** (Zod). Yang ada di DB:

- `NOT NULL` (lihat kolom nullable di S3)
- `UNIQUE` (unique index, lihat S5.1)
- `PRIMARY KEY AUTOINCREMENT` (integer)
- `FOREIGN KEY ... ON DELETE cascade/set null` (lihat S6)

**SHOULD constraints** (app-enforced, tidak bisa DB-level di SQLite):
- `users.role` IN (`user`, `admin`) - validasi Zod di register route (ASUMSI, `RAG G4`)
- `provider_configs.provider` IN (`ollama`, `openrouter`, `9router`, `custom`) - `schemas.ts:159`
- `projects.status` IN (`draft`, `generating`, `complete`, `failed`) - `route.ts:316,238`
- `projects.themePreference` IN (`dark`, `light`, `system`) - `schemas.ts:103-104`
- `scenes.transitionType` IN (7 enum) - `prompt-builder.ts:148`
- `scene_audio.audioType` IN (5 enum) - `prompt-builder.ts:152`
- `generation_logs.status` IN (`success`, `partial`, `fail`) - `route.ts:502-513`
- `asset_references.tipe` IN (6 enum) - `schemas.ts:173`
- `storyboard_segments.status` IN (`draft`, `generating`, `complete`, `failed`) - Design doc S5.1 (F-SB-01)

---

## 6. Primary Key, Foreign Key, Relasi + Aturan ON DELETE/UPDATE

### 6.1 PK summary

Semua PK = `integer PRIMARY KEY AUTOINCREMENT NOT NULL`. Surrogate key, tidak ada composite PK.

### 6.2 FK + ON DELETE/UPDATE

| Tabel child | Kolom FK | References | ON DELETE | ON UPDATE | Relasi | Citation |
|---|---|---|---|---|---|---|
| provider_configs | user_id | users.id | cascade | no action | 1-N | `schema.ts:19`, DDL `0000:97` |
| projects | user_id | users.id | cascade | no action | 1-N | `schema.ts:35`, DDL `0000:81` |
| asset_references | project_id | projects.id | cascade | no action | 1-N | `schema.ts:56`, DDL `0000:12` |
| characters | project_id | projects.id | cascade | no action | 1-N | `schema.ts:73`, DDL `0000:30` |
| scenes | project_id | projects.id | cascade | no action | 1-N | `schema.ts:92`, DDL `0000:108` |
| image_prompts | project_id | projects.id | cascade | no action | 1-N | `schema.ts:122`, DDL `0000:59` |
| image_prompts | scene_id | scenes.id | cascade | no action | 1-N (nullable master) | `schema.ts:123`, DDL `0000:60` |
| generation_logs | project_id | projects.id | cascade | no action | 1-N | `schema.ts:149`, DDL `0000:45` |
| supporting_characters | project_id | projects.id | cascade | no action | 1-N | `schema.ts:165`, DDL `0000:121` |
| supporting_characters | scene_id | scenes.id | **set null** | no action | 1-N (nullable) | `schema.ts:166`, DDL `0000:122` |
| scene_audio | project_id | projects.id | cascade | no action | 1-N | `schema.ts:179`, DDL `0001:38` |
| scene_audio | scene_id | scenes.id | cascade | no action | 1-N | `schema.ts:180`, DDL `0001:39` |
| storyboard_segments | project_id | projects.id | cascade | no action | 1-N (unique segmentIndex per project) | Design doc S5.1 (F-SB-01) |

**Catatan ON DELETE**:
- `cascade` = hapus parent -> hapus child otomatis (default untuk mayoritas relasi).
- `set null` (supporting_characters.scene_id) = hapus scene -> scene_id jadi null, karakter pendukung tetap ada (data preservation).
- `image_prompts.scene_id` nullable = master reference list (root image_prompts, bukan per-scene). On delete scene -> cascade hapus image_prompts scene-level, master tetap.

### 6.3 Relasi 1-1

Tidak ada relasi 1-1 eksplisit. `users.email` UNIQUE tapi bukan 1-1 relasi, hanya unique constraint.

### 6.4 Relasi N-N

Tidak ada relasi N-N eksplisit. `supporting_characters` menghubungkan project + scene tapi dengan FK langsung (1-N dari project, 1-N dari scene), bukan junction table M-N. Sebuah supporting_character hanya milik 1 project + 1 scene (nullable).

---

## 7. Strategi Normalisasi

### 7.1 Assessmen 3NF

Skema ini **sebagian besar 3NF-compliant** dengan beberapa pilihan denormalisasi sengaja:

| Tabel | Bentuk normal | Catatan |
|---|---|---|
| users, provider_configs, projects, characters, scenes, generation_logs, supporting_characters | 3NF | Setiap kolom non-PK bergantung hanya pada PK. Tidak ada transitive dependency. |
| asset_references | 3NF + denorm | `aiClassification` = text JSON (denormalized - Vision LLM result disimpan raw, tidak dipecah ke tabel klasifikasi). Alasan: JSON fleksibel, struktur klasifikasi bisa berubah antar model Vision. |
| image_prompts | 3NF + denorm JSON | `composition`, `lighting`, `camera`, `colorPalette`, `technical` = text JSON string (8-layer structure). Denormalized karena setiap layer = object kompleks. Alasan: SQLite tidak punya `jsonb`, JSON string lebih praktis daripada 5 tabel anak per-layer. |
| projects | 3NF + denorm | `resultJson` = text JSON PromptPackage lengkap (snapshot). Denormalized duplicate dari data di `characters`/`scenes`/`image_prompts`/`scene_audio`. Alasan: snapshot persist saat generate, untuk export/restore cepat tanpa join 5 tabel. |
| scene_audio | 3NF + denorm | `sfxList` = text (bukan junction table `scene_audio_sfx`). Alasan: list SFX sederhana, junction table overkill. Coercion array->string di app layer. |
| generation_logs | 3NF + denorm | `logsJson` = text JSON array log entries. Denormalized timeline log, tidak dipecah ke `log_entries` tabel. Alasan: log = append-only read, jarang query per-entry. |

### 7.2 Denormalisasi sengaja + alasan

1. **`projects.resultJson`**: snapshot PromptPackage JSON. Trade-off: storage duplikat vs read performance (export tidak perlu join). Soft delete keep resultJson untuk restore.
2. **`image_prompts.{composition,lighting,camera,colorPalette,technical}`**: 8-layer image prompt. JSON string vs 5 tabel anak. SQLite JSON function (`json_extract`) tetap bisa query sub-field. Alasan: struktur layer stabil, query biasanya ambil full layer, jarang filter per sub-field.
3. **`scene_audio.sfxList`**: array as comma-separated string. Trade-off: tidak bisa query "scene yang pakai SFX 'footstep'" langsung di DB. Alasan: use case tidak butuh query SFX individual, hanya display.
4. **`generation_logs.logsJson`**: timeline log entries. Trade-off: tidak bisa filter log per-event di SQL. Alasan: log = display-only, query = "ambil semua log untuk generate ini", JSON array cukup.

### 7.3 Potensi improvement normalisasi (SHOULD)

- **`scene_audio.sfxList` -> `scene_audio_sfx` junction table**: bila butuh query "scene dengan SFX footstep" atau dedup SFX list lintas project. Low priority - use case tidak ada.
- **`image_prompts.colorPalette` -> `image_prompt_colors`**: bila butuh filter "project dengan palette hex #FF0000". Low priority.
- **`generation_logs.logsJson` -> `log_entries`**: bila butuh dashboard "error count by category per day". Medium priority - `logsJson` berisi kategori error, bisa diextract.

---

## 8. Migration Plan

### 8.1 Tooling migration

**Drizzle Kit** (`drizzle-kit ^0.30.0`, `package.json:46`).

**Config** (`drizzle.config.ts:1-22`):
- `schema: './src/lib/db/schema.ts'` - source schema definition.
- `out: './drizzle'` - output migration folder.
- `dialect: 'turso'` - SQLite/libSQL dialect (`drizzle.config.ts:18`).
- `dbCredentials: { url, authToken }` - dari env `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
- `verbose: true`, `strict: true` - fail on drift.

**Env load** (`drizzle.config.ts:6-7`): dotenv load `.env.local` first, fallback `.env`.

### 8.2 Scripts (package.json:15-18)

| Script | Command | Purpose |
|---|---|---|
| `db:generate` | `drizzle-kit generate` | Generate migration SQL dari schema diff (output ke `./drizzle/`) |
| `db:push` | `drizzle-kit push` | Push schema langsung ke DB (dev only, tanpa migration file) |
| `db:migrate` | `drizzle-kit migrate` | Apply migration files di `./drizzle/` ke DB (prod-safe) |
| `db:studio` | `drizzle-kit studio` | Buka Drizzle Studio GUI untuk inspect data |

**Workflow rekomendasi**:
1. Dev: ubah `schema.ts` -> `pnpm db:generate` (buat migration SQL) -> review `./drizzle/000X_*.sql` -> `pnpm db:migrate` apply.
2. Prod: `pnpm db:generate` di CI -> `pnpm db:migrate` di deploy step. **JANGAN `db:push` di prod** (skip migration history).

### 8.3 Migration history (ada di repo)

Folder `./drizzle/` berisi 3 file SQL + `meta/`:

| File | Tag | Tipe | Citation |
|---|---|---|---|
| `0000_gigantic_genesis.sql` | `0000_gigantic_genesis` | CREATE all 9 tabel V1 (users, provider_configs, projects, asset_references, characters, scenes, image_prompts, generation_logs, supporting_characters) | `drizzle/0000_*.sql` |
| `0001_v3_core_features.sql` | `0001_v3_core_features` | ALTER scenes (add 11 V3 kolom transition/voice/duration/pacing/mood), ALTER image_prompts (add 6 V3 8-layer kolom), ALTER projects (add theme_preference), CREATE scene_audio (V3 new) | `drizzle/0001_*.sql` |
| `0002_v3_gap_closure.sql` | `0002_v3_gap_closure` | ASUMSI: gap closure V3 (isi tidak dibaca langsung, tapi journal hanya 2 entry - file ini belum ter-journal? `meta/_journal.json` hanya list idx 0-1) | `drizzle/0002_*.sql` |

**Journal** (`drizzle/meta/_journal.json`): version 7, dialect sqlite, entries idx 0 (0000) + idx 1 (0001). **Anomali**: file `0002_v3_gap_closure.sql` ada di folder tapi TIDAK ada di `_journal.json`. ASUMSI: file orphan / belum di-generate via `db:generate` yang benar, atau manual add. **SHOULD**: verifikasi `pnpm db:generate` ulang untuk re-sync journal.

### 8.4 Urutan dependency buat tabel (untuk migration fresh)

Berdasarkan FK dependency:
1. `users` (no FK)
2. `provider_configs` (FK -> users)
3. `projects` (FK -> users)
4. `asset_references` (FK -> projects)
5. `characters` (FK -> projects)
6. `scenes` (FK -> projects)
7. `image_prompts` (FK -> projects, scenes)
8. `generation_logs` (FK -> projects)
9. `supporting_characters` (FK -> projects, scenes)
10. `scene_audio` (FK -> projects, scenes)
11. `storyboard_segments` (FK -> projects) (F-SB-01)

Drizzle Kit otomatis urutkan dependency saat generate. Manual create harus ikut urutan ini.

### 8.5 Migration plan untuk fix Bug A (sfx_list)

**TIDAK ADA migration DB diperlukan** untuk fix Bug A:
- `scene_audio.sfxList` sudah `text` (`schema.ts:193`) - sesuai target storage string comma-separated.
- Fix di **app layer**: Zod schema union (`schemas.ts:52`) + normalizer di `route.ts` (coerce array->string).
- Tidak ada ALTER TABLE, tidak ada migration SQL baru.

Bila ingin add index (S5.2) -> migration baru:
```
pnpm db:generate  # generate 0003_add_indexes.sql
# review SQL
pnpm db:migrate    # apply
```

### 8.6 Migration plan untuk F-SB-01 (storyboard_segments)

**Migration DB WAJIB** untuk tabel baru `storyboard_segments`:
1. Ubah `src/lib/db/schema.ts` — tambah definisi `storyboardSegments` (lihat Section 3.11).
2. Jalankan `pnpm db:generate` untuk membuat migration SQL baru (mis. `0003_storyboard_segments.sql`).
3. Review migration SQL; pastikan:
   - `CREATE TABLE storyboard_segments (...)`
   - `REFERENCES projects(id) ON DELETE cascade`
   - `UNIQUE INDEX idx_storyboard_segments_project_segment ON (project_id, segment_index)`
   - `INDEX idx_storyboard_segments_project_id ON (project_id)`
4. Jalankan `pnpm db:migrate` di dev / CI deploy step.

**Tidak perlu backfill data** untuk project lama: tab Storyboard hanya muncul setelah user generate storyboard baru. Project tanpa storyboard tidak terdampak.

---

## 9. Seed Data Awal / Master Data

**Status**: **ASUMSI - TIDAK ADA BUKTI** seed file di repo.

RAG-CONTEXT.md (`RAG G1-G20`) tidak menyebut file seed. Glob `src/lib/db/` hanya `client.ts`, `schema.ts`, `repositories/`. Tidak ada `seed.ts`, `seed.sql`, `migrate.ts` (selain `src/lib/migration/v2-to-v3.ts` yang = data backfill V2->V3, bukan master seed).

### 9.1 Master data yang SEHARUSNYA di-seed (SHOULD)

| Tabel | Seed content | Alasan |
|---|---|---|
| `users` | 1 admin user (role='admin') | Bootstrap admin untuk RBAC (ASUMSI ada admin UI) |
| `provider_configs` | Default provider templates (ollama localhost:11434, openrouter public) | Onboarding user - quick start. TAPI ini per-user, jadi bukan global seed, lebih ke "preset" di UI. |

### 9.2 Seed migration V2->V3 (ada di repo)

`src/lib/migration/v2-to-v3.ts` (`RAG S4 F17`) = backfill data V2 ke V3:
- Backfill: projects lama tanpa `theme_preference` -> set default `'dark'`.
- Backfill: scenes lama tanpa V3 kolom -> default value (sudah ada DEFAULT di ALTER TABLE `0001_*.sql`).
- Backfill: image_prompts lama tanpa 8-layer -> null.
- Rollback support (`v2-to-v3.ts:59-142`).

Ini **bukan master seed**, tapi data migration existing row. Dijalankan manual atau via script, bukan drizzle-kit migrate otomatis.

---

## 10. Pertimbangan: Retensi Data, Soft Delete, Audit, Integritas, Skalabilitas

### 10.1 Audit kolom (created_at / updated_at)

| Tabel | `createdAt` | `updatedAt` | `deletedAt` | Catatan |
|---|---|---|---|---|
| users | YA (`schema.ts:12`) | YA (`schema.ts:13`) | TIDAK ADA | User tidak soft-delete, hard delete via cascade |
| provider_configs | YA (`schema.ts:26`) | YA (`schema.ts:27`) | TIDAK ADA | Hard delete |
| projects | YA (`schema.ts:45`) | YA (`schema.ts:46`) | **YA** (`schema.ts:47`) | **Soft delete** - `deletedAt` nullable epoch |
| asset_references | YA (`schema.ts:64`) | TIDAK ADA | TIDAK ADA | Immutable upload, hard delete |
| characters | YA (`schema.ts:83`) | TIDAK ADA | TIDAK ADA | Hard delete (cascade project) |
| scenes | YA (`schema.ts:113`) | TIDAK ADA | TIDAK ADA | Hard delete |
| image_prompts | YA (`schema.ts:138`) | TIDAK ADA | TIDAK ADA | Hard delete |
| generation_logs | YA (`schema.ts:156`) | TIDAK ADA | TIDAK ADA | Append-only, tidak update/delete (audit log) |
| supporting_characters | YA (`schema.ts:170`) | TIDAK ADA | TIDAK ADA | Hard delete |
| scene_audio | YA (`schema.ts:196`) | TIDAK ADA | TIDAK ADA | Hard delete |

**Inkonsistensi audit**: hanya `users`, `provider_configs`, `projects` punya `updatedAt`. Tabel child (characters, scenes, image_prompts, scene_audio) hanya `createdAt`, tidak ada `updatedAt`. **SHOULD**: tambah `updatedAt` ke tabel yang di-update via CRUD endpoint (scenes, scene_audio, characters) bila audit trail diperlukan. Tapi generate pipeline = delete+recreate (lihat `route.ts:310-493`), jadi update jarang terjadi, `createdAt` cukup untuk trace generate-time.

### 10.2 Soft delete

Hanya `projects` punya soft delete (`deletedAt` nullable, `schema.ts:47`). Implementasi di `project.repo.ts:33-65` (`RAG S4 F7`). Query list project harus filter `deletedAt IS NULL`.

**SHOULD**:
- Tambah index `idx_projects_user_deleted_created` ON `(user_id, deleted_at, created_at)` untuk query list aktif efisien (S5.2).
- Tambah `deletedAt` ke `users` bila butuh user deactivation (low priority).
- Tabel child (characters, scenes, dll) TIDAK soft delete - cascade hard delete saat project soft-delete? **ASUMSI**: project soft delete hanya set `deletedAt`, child tetap ada (untuk restore). Verifikasi `project.repo.ts` soft-delete handler (ASUMSI, `RAG G4` register tidak dibaca, tapi project.repo.ts juga tidak dibaca langsung).

### 10.3 Retensi data `generation_logs` (growth concern)

`generation_logs` = append-only audit log. Setiap generate (success/partial/fail) = 1 row + `logsJson` (potentially besar, JSON array log entries).

**Growth estimate** (ASUMSI):
- 1 user, 10 generate/hari, 365 hari = 3.650 row/tahun.
- 100 user, 10 generate/hari = 365.000 row/tahun.
- `logsJson` per row: 5-50KB (timeline log SSE events).
- Total per tahun (100 user): ~18 GB `logsJson` alone.

**Rekomendasi retensi (SHOULD)**:
1. **Retention policy**: keep `generation_logs` 90 hari untuk audit debug. Purge row >90 hari secara berkala (cron job / Turso scheduled query).
2. **Aggregation sebelum purge**: sebelum hapus, aggregate ke `generation_log_stats` tabel (per hari: count success/partial/fail, avg durationMs). Tabel stats = small, keep forever.
3. **Index** `idx_gen_logs_created_at` (S5.2) untuk purge query `WHERE created_at < ?` efisien.
4. **Soft alternative**: bila tidak mau purge, kompres `logsJson` lama (gzip -> blob) setelah 30 hari. ASUMSI: kompleks, purge lebih simpel.
5. **`errorMessage`**: keep forever (small text) untuk error pattern analysis. Pisah ke `generation_errors` tabel bila perlu.

### 10.4 Integritas referensial

- FK constraint ON DELETE cascade/set null di schema.ts (S6.2). SQLite/libSQL mendukung FK bila `PRAGMA foreign_keys = ON` di-set per connection. **ASUMSI**: drizzle-orm libSQL driver enable FK by default? Tidak diverifikasi di repo. **SHOULD**: verifikasi `client.ts` set `PRAGMA foreign_keys = ON` - bila tidak, FK constraint tidak enforce, orphan row bisa muncul.
- Tidak ada `ON UPDATE cascade`. PK `integer AUTOINCREMENT` immutable, tidak pernah update. FK refer ke PK, aman.
- Transaction: `safeDbOp` di `route.ts:35-51` (`RAG S11 Bug D`) = **TIDAK pakai transaction**, swallow error per-op, continue. Akibat: partial persist (scene hilang tapi status `complete`). **SHOULD**: wrap persist block di transaction Drizzle (`db.transaction(async (tx) => ...)`) untuk atomicity. Atau set status `partial` bila ada error persist.

### 10.5 Skalabilitas

| Concern | Status kini | Rekomendasi |
|---|---|---|
| Row count per project | scenes max ~15, image_prompts ~30, scene_audio ~45 | Aman, SQLite handle 100K row per tabel tanpa issue |
| Concurrent write | SQLite/libSQL = single-writer multi-reader. Turso handle via replication. | Untuk scale >100 concurrent generate, eval migrasi ke Postgres (out of scope v0.1.0) |
| Query performance | Index FK sudah ada (S5.1) | Tambah index composite S5.2 bila query pattern butuh |
| Storage growth | `resultJson` per project = 50-500KB JSON. `generation_logs.logsJson` = growth utama. | Retensi S10.3 + optionally compress old `resultJson` |
| Soft delete query | Filter `deletedAt IS NULL` setiap list query | Index S5.2 + consider partial index bila SQLite support (ASUMSI: SQLite 3.8+ support partial index, drizzle-orm belum expose API) |

---

## 11. Citation Index (file:line)

| Citation | Klaim |
|---|---|
| `package.json:25,46,47` | @libsql/client, drizzle-kit, drizzle-orm versi |
| `package.json:15-18` | script db:generate/push/migrate/studio |
| `drizzle.config.ts:9-13` | env TURSO_DATABASE_URL, TURSO_AUTH_TOKEN wajib |
| `drizzle.config.ts:16-18` | schema path, out, dialect turso |
| `drizzle.config.ts:20-21` | verbose, strict |
| `src/lib/db/client.ts:2-13` | @libsql/client createClient, drizzle libsql, casing snake_case |
| `src/lib/db/schema.ts:2` | import drizzle-orm/sqlite-core |
| `src/lib/db/schema.ts:5-14` | users table |
| `src/lib/db/schema.ts:17-30` | provider_configs table + unique idx |
| `src/lib/db/schema.ts:33-51` | projects table + index |
| `src/lib/db/schema.ts:44` | projects.themePreference V3 |
| `src/lib/db/schema.ts:47` | projects.deletedAt soft delete |
| `src/lib/db/schema.ts:54-68` | asset_references table + index |
| `src/lib/db/schema.ts:71-87` | characters table + unique idx |
| `src/lib/db/schema.ts:90-117` | scenes table + V3 kolom + unique idx |
| `src/lib/db/schema.ts:120-144` | image_prompts table 8-layer + index |
| `src/lib/db/schema.ts:123` | image_prompts.sceneId nullable (master list) |
| `src/lib/db/schema.ts:147-160` | generation_logs table + index |
| `src/lib/db/schema.ts:163-174` | supporting_characters table + set null FK |
| `src/lib/db/schema.ts:166` | supporting_characters.sceneId ON DELETE set null |
| `src/lib/db/schema.ts:177-201` | scene_audio V3 table + index |
| `src/lib/db/schema.ts:185` | scene_audio.volume default 0.7 |
| `src/lib/db/schema.ts:193` | scene_audio.sfxList text (BUG A) |
| `drizzle/0000_gigantic_genesis.sql:1-138` | DDL V1 all 9 tabel |
| `drizzle/0001_v3_core_features.sql:1-43` | DDL V3 ALTER + scene_audio CREATE |
| `drizzle/meta/_journal.json:4-19` | journal entries idx 0-1 |
| `src/lib/validation/schemas.ts:29` | color_palette union pattern (precedent) |
| `src/lib/validation/schemas.ts:39-55` | SceneAudioSpecSchema (sfx_list string) |
| `src/lib/validation/schemas.ts:52` | sfx_list z.string().nullable().optional() ROOT Bug A |
| `src/lib/validation/schemas.ts:83-99` | SceneAudioSchema duplikat (Bug F) |
| `src/lib/validation/schemas.ts:96` | sfx_list string di duplikat |
| `src/lib/validation/schemas.ts:103-104` | themePreference enum |
| `src/lib/validation/schemas.ts:159` | provider enum |
| `src/lib/validation/schemas.ts:173` | asset_references.tipe enum |
| `src/lib/ai/prompt-builder.ts:75-97` | JSON_SCHEMA_EXAMPLE (no sfx) |
| `src/lib/ai/prompt-builder.ts:137-168` | buildSystemPrompt return |
| `src/lib/ai/prompt-builder.ts:148` | transition_type enum 7 nilai |
| `src/lib/ai/prompt-builder.ts:152` | AUDIO_SPECS ambigu "Untuk sfx: sfx_list" |
| `src/lib/ai/llm-client.ts:18-44` | error categorization |
| `src/lib/ai/llm-client.ts:274,287` | retry body sama (Bug A retry identik) |
| `docs/plans/2026-06-23-storyboard-prompt-generator-design.md` | Storyboard Prompt Generator F-SB-01 design doc |
| `src/app/api/v1/generate/route.ts:35-51` | safeDbOp swallow error (Bug D) |
| `src/app/api/v1/generate/route.ts:238,316` | status failed/complete |
| `src/app/api/v1/generate/route.ts:310-493` | persist block delete+recreate |
| `src/app/api/v1/generate/route.ts:502-513` | generation_logs status partial/success |
| `src/lib/db/repositories/project.repo.ts:33-65` | soft delete impl (RAG F7) |
| `src/lib/migration/v2-to-v3.ts:59-142` | V2->V3 backfill + rollback |
| `product-docs/SRS.md:156-228` | FR-GEN-01, FR-GEN-02 sfx_list fix spec |
| `product-docs/PRD.md:225-260` | FR-GEN-01, FR-GEN-02 product req |
| `product-docs/RAG-CONTEXT.md:62-63` | DB = Turso/libSQL BUKAN Postgres (koreksi) |
| `product-docs/RAG-CONTEXT.md:479-658` | S9 Data Model 10 tabel |
| `product-docs/RAG-CONTEXT.md:715-741` | S11 Bug A sfx_list diagnosis |
| `product-docs/RAG-CONTEXT.md:794-817` | G1-G20 gaps/ASUMSI |

---

## 12. ASUMSI (tidak ada bukti di repo)

| # | Item | Alasan ASUMSI |
|---|---|---|
| A1 | `accounts` + `sessions` tabel NextAuth | Tidak ada di schema.ts. NextAuth v5 beta Credentials + JWT, tidak pakai DB adapter. Task prompt menyebut tapi repo tidak punya. |
| A2 | `users.role` enum value `admin` | Hanya default `'user'` terdefinisi (`schema.ts:11`). Admin role ASUMSI untuk RBAC. |
| A3 | Seed file | Tidak ditemukan di repo. Glob `src/lib/db/` hanya client/schema/repositories. |
| A4 | `0002_v3_gap_closure.sql` status | File ada di folder tapi tidak di `_journal.json`. Orphan atau belum di-generate via workflow benar. |
| A5 | `PRAGMA foreign_keys = ON` di client | Tidak diverifikasi di `client.ts`. SQLite default OFF, FK tidak enforce bila OFF. |
| A6 | Transaction di persist block | `safeDbOp` (`route.ts:35-51`) TIDAK pakai transaction. Partial persist by design (Bug D). |
| A7 | `scene_audio.volume` default 0.7 vs Zod 0.5 | DB 0.7 (`schema.ts:185`), `SceneAudioSpecSchema` 0.5 (`schemas.ts:44`). Inkonsistensi Bug F. |
| A8 | `music_tempo_bpm` range 60-200 | DB tanpa range, `SceneAudioSchema` duplikat punya range (`schemas.ts:93`) tapi tidak dipakai scene. |
| A9 | Register route bcrypt.hash | `register/route.ts` ada tapi tidak dibaca (`RAG G4`). |
| A10 | Soft delete project = child tetap ada | `project.repo.ts:33-65` tidak dibaca langsung. ASUMSI soft delete hanya set `deletedAt` parent, child intact. |
| A11 | `storyboard_segments` migration file akan ter-generate otomatis oleh `pnpm db:generate` | Tidak ada migration file saat ini; akan dihasilkan setelah `schema.ts` di-extend. |
| A12 | Field `segmentTransitionNote` nullable | Design doc S5.1 sebut `segmentTransitionNote: text('segment_transition_note')` tanpa `.notNull()`. |

---

**END DATABASE_SCHEMA.md** - 11 tabel, DB Turso/libSQL SQLite, Drizzle ORM sqlite-core. Bug A `sfxList` = text DB (tidak perlu migration), fix di app layer union+normalizer per SRS FR-GEN-02. F-SB-01 menambah tabel `storyboard_segments` (perlu migration drizzle-kit).
