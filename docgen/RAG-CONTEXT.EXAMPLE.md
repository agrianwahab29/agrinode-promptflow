# RAG-CONTEXT.EXAMPLE.md

> ⚠️ **INI CONTOH FIKTIF, bukan output nyata.**
> File ini hanya referensi format & granularitas untuk `docgen-rag`.
> JANGAN pakai sebagai data. JANGAN salin ke proyek.
> Proyek fiktif: "TokoBuku App" (Laravel + Next.js) — semua nama/path/nilai
> di sini direkayasa untuk ilustrasi.

---

# RAG-CONTEXT.md (Contoh Format)

> Catatan: file output asli pakai nama `RAG-CONTEXT.md` (tanpa `.EXAMPLE`).
> Dibuat oleh `docgen-rag` di `<docs_dir>` sebelum dokumen lain dibangun.

## 1. Ringkasan Temuan

Proyek existing (bukan greenfield): aplikasi web "TokoBuku" dengan backend Laravel
10 + frontend Next.js 14. Kode + config terdeteksi lengkap. Sebagian besar
kebutuhan prompt user terkonfirmasi dari kode; beberapa item belum ada bukti
(lihat section 8).

- **Nyata terbukti**: tech stack, struktur folder, 4 entitas data utama, sistem
  auth berbasis Laravel Sanctum, aset logo.
- **Masih asumsi / tidak ada bukti**: kebutuhan role "kepala toko" (lihat §8),
  maskot brand, versi PostgreSQL.

## 2. Tech Stack Terdeteksi + Versi

| Komponen | Versi | Sumber (sitasi) |
|---|---|---|
| Laravel (backend) | 10.x | `composer.json:18` (`"laravel/framework": "^10.0"`) |
| PHP | 8.2+ | `composer.json:7` (`"php": "^8.2"`) |
| Next.js (frontend) | 14.x | `frontend/package.json:24` (`"next": "14.2.x"`) |
| React | 18.x | `frontend/package.json:25` (`"react": "^18.3"`) |
| PostgreSQL | (tidak terkonfirmasi) | `TIDAK ADA BUKTI` — baca §8 |
| Tailwind CSS | 3.4.x | `frontend/package.json:31` (`"tailwindcss": "^3.4"`) |

Sumber utama: manifest `composer.json` + `frontend/package.json`.

## 3. Struktur Proyek Inti

```
C:\laragon\www\tokobuku\
├── app/
│   ├── Http/Controllers/        endpoint
│   ├── Models/                  Eloquent model (entitas data)
│   └── ...
├── database/migrations/         DDL tabel
├── routes/api.php               route API
└── frontend/                    aplikasi Next.js terpisah
    ├── app/                     App Router
    └── components/              komponen UI
```

Sitasi struktur: `app/` (dari `glob: app/**/*.php`), `frontend/app/` (dari
`read: frontend/package.json` + `glob: frontend/app/**`).

## 4. Entitas / Data Model Terdeteksi

| Entitas | Tabel | Atribut kunci | Sumber |
|---|---|---|---|
| Buku | `books` | id, isbn, title, price, stock | `app/Models/Book.php:5-20`; migration `2024_01_05_create_books_table.php:10-18` |
| Kategori | `categories` | id, name, slug | `app/Models/Category.php:5-12`; `..._create_categories_table.php` |
| User | `users` | id, name, email, password, role | `app/Models/User.php:8-22`; `..._users_table.php:12-20` |
| Order | `orders` | id, user_id, total, status | `app/Models/Order.php:5-18` |

Relasi terdeteksi: `User` hasMany `Order` (`app/Models/User.php:30`),
`Book` belongsTo `Category` (`app/Models/Book.php:25`).

## 5. Constraint Nyata

- Auth backend: Laravel Sanctum (token) — `composer.json:22`; middleware `auth:sanctum`
  di `routes/api.php:15`.
- Env wajib: `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `SANCTUM_STATEFUL_DOMAINS`
  — rujukan nama key saja, **JANGAN sebut nilai** (.env sensitif).
- Frontend port dev: 3000 — `frontend/package.json:14` (`"dev": "next dev"`).
- Encoding file: UTF-8 (default Laravel/Next).

## 6. Aktor / Role Terdeteksi

| Role | Sumber | Catatan |
|---|---|---|
| admin | `app/Models/User.php:35` (`is_admin`), `routes/api.php` guard | Terbukti |
| customer | middleware route customer — `routes/api.php:22` | Terbukti |
| "kepala toko" | `TIDAK ADA BUKTI` — lihat §8 | Asumsi |

## 7. Aset Terdeteksi

| Aset | Path (sitasi) | Status |
|---|---|---|
| Logo brand | `public/img/logo-tokobuku.png` | Ada — `glob: public/img/*` |
| Maskot brand | — | `TIDAK ADA BUKTI` — user minta di prompt tapi tidak ada file |
| Font lokal | `frontend/app/globals.css:3` (`@font-face Poppins`) | Ada |

## 8. Gap & "TIDAK ADA BUKTI"

Hal diminta user / perlu dokumen tapi **tidak ditemukan di proyek**:

- **Role "kepala toko"**: prompt user sebut, tapi kode hanya punya `admin` &
  `customer`. Kemungkinan fitur baru → tandai ASUMSI di dokumen, atau konfirmasi
  ke user.
- **Maskot brand**: diminta di prompt, file tidak ada. Aset perlu disediakan
  user → tandai ASUMSI.
- **Versi PostgreSQL**: `composer.json` tidak menyebut versi DB. Asumsi 15.x
  (default Laragon) → tandai ASUMSI.
- **Halaman laporan penjualan**: prompt sebut "laporan penjualan per bulan",
  tidak ada route/model terkait → fitur baru.

## 9. Daftar Sitasi Lengkap

| Sitasi | Klaim yang didukung |
|---|---|
| `composer.json:18` | Laravel 10.x |
| `composer.json:7` | PHP 8.2+ |
| `frontend/package.json:24` | Next.js 14.x |
| `frontend/package.json:31` | Tailwind 3.4 |
| `app/Models/Book.php:5-20` | entitas Buku + atribut |
| `app/Models/User.php:8-22,30,35` | entitas User + relasi + role admin |
| `routes/api.php:15,22` | guard Sanctum + route customer |
| `public/img/logo-tokobuku.png` (glob) | logo ada |
| https://laravel.com/docs/10.x/sanctum | konfirmasi mekanisme Sanctum |

---

# Lampiran: Varian Greenfield

Bila proyek **masih kosong** (greenfield), section 2-7 minimal/belum ada, dan
di section 1 nyatakan jelas:

> Proyek greenfield. Tidak ada kode existing. Temuan di bawah mayoritas dari
> sumber eksternal (dokumentasi library) + asumsi bertanda jelas.

| Section | Konten greenfield |
|---|---|
| 2 Tech stack | Tarik dari prompt user + webfetch dokumen resmi; tandai ASUMSI bila user tidak sebut versi. |
| 3 Struktur | "Belum ada — akan dibuat sesuai PROJECT_ARCHITECTURE nanti." |
| 4 Entitas | Dari prompt user; tandai ASUMSI (belum ada kode/schema). |
| 5 Constraint | Dari prompt user + standar framework pilihan. |
| 6 Aktor | Dari prompt user; ASUMSI. |
| 7 Aset | Dari prompt user; ASUMSI. |
| 8 Gap | Nyatakan: "Semua butuh konfirmasi/definisi ulang — proyek baru." |
| 9 Sitasi | Didominasi URL dokumen resmi, sedikit/tanpa path lokal. |

Contoh baris greenfield:

```
| Laravel | 11.x (ASUMSI, user belum sebut versi) | https://laravel.com/docs/11.x |
```
