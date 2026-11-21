# PRD — Sistem Informasi Manajemen Teh Tarek Pak Cik Berbasis Komponen

**Mata kuliah:** Pemrograman Berbasis Komponen (UTS)  
**Tech stack:** Vue.js v3 (`<script setup>`), Vue Router, Pinia, Vite  
**Database:** `localStorage` (data awal dari file JSON seed)  
**Status dokumen:** Draf v1.0 — bagian bertanda **[ISI MANUAL]** harus diganti dengan hasil observasi nyata

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang
Teh Tarek Pak Cik adalah usaha minuman yang mengelola pesanan, pembayaran, dan rekap penjualan harian. Pencatatan manual rawan nota hilang, stok/menu tidak terdata rapi, dan rekap memakan waktu. Sistem ini mendigitalkan alur pesanan sampai laporan, sekaligus memenuhi rubrik UTS (analisis kebutuhan, arsitektur komponen, implementasi Vue 3, persistensi seed + localStorage, dokumentasi Agentic AI dan pengujian).

### 1.2 Tujuan
1. Kasir dapat membuat pesanan dan mencatat pembayaran dalam kurang dari 1 menit.
2. Pemilik dapat mengelola menu (CRUD) dan melihat ringkasan pendapatan serta mengunduh laporan.
3. Pelanggan dapat melihat katalog menu dan mengecek status pesanan secara mandiri.
4. Semua data bertahan setelah browser dimuat ulang (localStorage).
5. Tidak ada data yang ditulis statis (hardcode) di dalam komponen; semua berasal dari seed JSON → Pinia → localStorage.

### 1.3 Di Luar Lingkup (Non-Goals)
- Backend server dan database sungguhan.
- Payment gateway sungguhan (pembayaran hanya dicatat: tunai / QRIS manual / transfer).
- Keamanan tingkat produksi (password di localStorage hanya untuk demo akademik).
- Multi-cabang dan manajemen stok bahan baku.

---

## 2. Analisis Kebutuhan (Bab 1 Laporan)

> Rubrik A1 menilai observasi **nyata**. Bagian ini adalah kerangka; isi dengan hasil wawancara dan pengamatan langsung.

### 2.1 Profil Usaha dan Bukti Izin
| Item | Isi |
|---|---|
| Nama usaha | Teh Tarek Pak Cik |
| Bidang usaha | Minuman (teh tarek) — **[ISI MANUAL: menu lain jika ada]** |
| Alamat | **[ISI MANUAL]** |
| Skala operasional harian | **[ISI MANUAL: perkiraan jumlah transaksi/hari, jumlah staf]** |
| Bukti izin | **[LAMPIRKAN: foto bersama pemilik / screenshot persetujuan izin / surat izin observasi]** |

### 2.2 Proses Bisnis Berjalan (As-Is) — draf asumsi
Sesuaikan dengan hasil observasi:
1. Pelanggan datang dan memesan langsung ke kasir.
2. Kasir mencatat pesanan di nota kertas / buku.
3. Pesanan dibuat oleh bagian produksi, diserahkan ke pelanggan.
4. Pelanggan membayar (tunai/QRIS).
5. Akhir hari, pemilik merekap nota secara manual untuk menghitung pendapatan.

### 2.3 Kendala (Pain Points) — draf asumsi
- Nota kertas hilang atau tulisan tidak terbaca.
- Rekap harian/bulanan memakan waktu dan rawan selisih.
- Tidak ada data menu terlaris.
- Pelanggan tidak tahu status pesanannya (menunggu atau sudah siap).

### 2.4 Harapan Pengguna (User Expectations)
- Pesanan tercatat digital dan dapat dicari kembali.
- Rekap pendapatan otomatis per hari.
- Harga dan menu dapat diubah sendiri oleh pemilik.
- Pelanggan bisa memantau status pesanan lewat kode pesanan.

### 2.5 Pemetaan Role dan Fitur
| Role | Key | Deskripsi | Fitur yang dapat diakses |
|---|---|---|---|
| Pemilik | `owner` | Pengelola utama usaha | Dashboard ringkasan pendapatan, kelola data master produk dan kategori, laporan penjualan (lihat + unduh CSV), kelola akun kasir (opsional) |
| Kasir | `cashier` | Petugas operasional harian | Buat pesanan baru, perbarui status pembayaran dan status pesanan, cetak/tampilkan nota, lihat riwayat transaksi |
| Pelanggan | `guest` (tanpa login) | Pengguna layanan | Lihat katalog menu, cek status pesanan lewat kode pesanan |

> Catatan: pada template tabel API dosen tertulis role "Admin"; di sistem ini "Admin" = **Pemilik (`owner`)**. Tulis catatan ini di laporan agar konsisten.

---

## 3. Kebutuhan Fungsional

| ID | Fitur | Role | Deskripsi | Prioritas |
|---|---|---|---|---|
| FR-01 | Login | owner, cashier | Login username + password dari data users (seed → localStorage). Sesi disimpan di localStorage. | Must |
| FR-02 | Logout | owner, cashier | Hapus sesi, kembali ke halaman login. | Must |
| FR-03 | Katalog menu | guest, cashier, owner | Daftar produk aktif dengan filter kategori dan pencarian nama. | Must |
| FR-04 | Tambah produk | owner | Form nama, kategori, harga, status aktif. | Must |
| FR-05 | Ubah produk | owner | Edit data produk. | Must |
| FR-06 | Hapus / nonaktifkan produk | owner | Hapus dengan konfirmasi; jika sudah dipakai transaksi, hanya dinonaktifkan agar riwayat tetap utuh. | Must |
| FR-07 | Buat pesanan | cashier | Pilih produk, atur qty, catatan, hitung total otomatis, simpan transaksi dengan kode pesanan. | Must |
| FR-08 | Update pembayaran | cashier | Ubah `payment_status` unpaid → paid, pilih metode, hitung kembalian untuk tunai. | Must |
| FR-09 | Update status pesanan | cashier | Ubah status: diterima → diproses → siap → selesai, atau dibatalkan. | Must |
| FR-10 | Nota | cashier | Tampilan nota per transaksi + tombol cetak (`window.print`). | Should |
| FR-11 | Riwayat transaksi | cashier, owner | Tabel transaksi dengan filter tanggal dan status. | Must |
| FR-12 | Cek status pesanan | guest | Input kode pesanan, tampil status dan rincian item. | Must |
| FR-13 | Dashboard ringkasan | owner | Pendapatan hari ini, bulan ini, jumlah transaksi, menu terlaris. | Must |
| FR-14 | Laporan dan unduh | owner | Laporan per rentang tanggal, unduh CSV. | Should |
| FR-15 | Proteksi akses role | semua | Vue Router guard: akses ditolak dialihkan ke halaman 403 / login. | Must |
| FR-16 | Persistensi | semua | Semua aksi tambah/ubah/hapus tersinkron ke localStorage. | Must |

### 3.1 Aturan Bisnis dan Validasi
- Harga produk: bilangan bulat > 0 (rupiah). Harga `0` atau negatif ditolak.
- Nama produk: wajib, 3–60 karakter, tidak boleh duplikat dalam kategori yang sama (tanpa membedakan huruf besar/kecil).
- Qty item: bilangan bulat 1–99.
- Pesanan minimal 1 item.
- Pembayaran tunai: `uang_diterima` ≥ total; kembalian = uang_diterima − total.
- Transaksi berstatus `selesai` atau `dibatalkan` tidak dapat diubah statusnya lagi.
- Transaksi dibatalkan tidak dihitung dalam pendapatan.
- Pendapatan hanya dihitung dari transaksi `payment_status = paid` dan bukan `dibatalkan`.
- Kode pesanan format `TTP-YYYYMMDD-NNN` (NNN urut per hari, mulai 001).
- Harga di item transaksi disalin saat transaksi dibuat (snapshot), sehingga perubahan harga produk tidak mengubah riwayat.

---

## 4. Arsitektur Sistem (Bab 2 Laporan)

### 4.1 Gambaran Umum
Sistem berupa SPA (Single Page Application) Vue 3 tanpa backend. Karena tidak ada server, "API" diimplementasikan sebagai **service layer lokal** (`src/services/api.js`) yang menjalankan operasi terhadap localStorage dan mengembalikan respons berformat sama seperti REST (status code + body JSON). Pinia actions memanggil service ini. Kontrak endpoint di bagian 5 menjadi acuan sehingga kelak mudah diganti dengan backend sungguhan.

Alur data:
```
View/Component → Pinia Action → api.js (service) → localStorage
                       ↑                               │
                       └──────── state reaktif ←───────┘
Seed JSON → (saat localStorage kosong) → localStorage → Pinia
```

### 4.2 Diagram Hirarki Komponen (Component Tree)
```
App.vue
├─ PublicLayout.vue            (guest)
│  ├─ AppNavbar.vue
│  ├─ <router-view>
│  │  ├─ MenuView.vue
│  │  │  ├─ CategoryFilter.vue
│  │  │  ├─ SearchInput.vue
│  │  │  └─ ProductCard.vue (×n)
│  │  ├─ OrderStatusView.vue
│  │  │  ├─ OrderCodeForm.vue
│  │  │  └─ StatusStepper.vue
│  │  └─ LoginView.vue
│  │     └─ LoginForm.vue
│  └─ AppFooter.vue
├─ DashboardLayout.vue         (cashier, owner)
│  ├─ AppSidebar.vue (menu menyesuaikan role)
│  ├─ AppTopbar.vue (nama user + tombol logout)
│  └─ <router-view>
│     ├─ [cashier] CashierView.vue
│     │  ├─ ProductPicker.vue → ProductCard.vue
│     │  ├─ CartPanel.vue → CartItem.vue (×n)
│     │  └─ PaymentForm.vue
│     ├─ [cashier/owner] TransactionListView.vue
│     │  ├─ TransactionFilter.vue
│     │  ├─ TransactionTable.vue → StatusBadge.vue
│     │  └─ ReceiptModal.vue (nota)
│     ├─ [owner] DashboardView.vue
│     │  ├─ SummaryCard.vue (×4)
│     │  └─ TopProductsList.vue
│     ├─ [owner] ProductManageView.vue
│     │  ├─ ProductTable.vue
│     │  └─ ProductFormModal.vue
│     └─ [owner] ReportView.vue
│        ├─ DateRangeFilter.vue
│        ├─ SalesTable.vue
│        └─ ExportButton.vue
├─ ForbiddenView.vue (403)
├─ NotFoundView.vue (404)
└─ ToastContainer.vue
```

### 4.3 Komponen Reusable (Props dan Emits)
| Komponen | Props utama | Emits |
|---|---|---|
| `BaseButton` | `variant` (primary/secondary/danger), `disabled`, `loading` | `click` |
| `BaseInput` | `modelValue`, `label`, `type`, `error`, `placeholder` | `update:modelValue` |
| `BaseSelect` | `modelValue`, `options`, `label`, `error` | `update:modelValue` |
| `BaseModal` | `modelValue` (open), `title` | `update:modelValue`, `close` |
| `ConfirmDialog` | `modelValue`, `message` | `confirm`, `cancel` |
| `StatusBadge` | `status`, `type` (payment/order) | — |
| `EmptyState` | `title`, `description` | — |
| `ProductCard` | `product`, `showAddButton` | `add` (product) |
| `CartItem` | `item` | `increase`, `decrease`, `remove` |
| `ProductFormModal` | `modelValue`, `product` (null = tambah) | `submit` (payload), `close` |
| `SummaryCard` | `title`, `value`, `icon` | — |
| `StatusStepper` | `currentStatus` | — |

### 4.4 Struktur Folder Proyek
```
teh-tarek-pak-cik/
├─ index.html
├─ vite.config.js
├─ package.json
└─ src/
   ├─ main.js
   ├─ App.vue
   ├─ assets/styles/ (variables.css, base.css)
   ├─ components/
   │  ├─ common/      (Base*, ConfirmDialog, StatusBadge, EmptyState, ToastContainer)
   │  ├─ layout/      (AppNavbar, AppSidebar, AppTopbar, AppFooter)
   │  └─ features/
   │     ├─ products/      (ProductCard, ProductTable, ProductFormModal, CategoryFilter)
   │     ├─ transactions/  (ProductPicker, CartPanel, CartItem, PaymentForm, TransactionTable, ReceiptModal, StatusStepper)
   │     └─ reports/       (SummaryCard, TopProductsList, SalesTable, DateRangeFilter, ExportButton)
   ├─ layouts/        (PublicLayout.vue, DashboardLayout.vue)
   ├─ views/          (LoginView, MenuView, OrderStatusView, CashierView, TransactionListView, DashboardView, ProductManageView, ReportView, ForbiddenView, NotFoundView)
   ├─ router/index.js
   ├─ stores/         (auth.js, product.js, category.js, transaction.js, report.js, ui.js)
   ├─ services/       (storage.js, api.js)
   ├─ composables/    (useCart.js, useFormValidation.js)
   ├─ utils/          (format.js, validators.js, orderCode.js, csv.js)
   └─ data/seed/      (users.json, categories.json, products.json, transactions.json)
```

---

## 5. Pemetaan Halaman, Role, Fitur, dan Spesifikasi API

### 5.1 Tabel Pemetaan
| Nama Halaman | Path | Role Pengakses | Nama Fitur | Endpoint API | Method |
|---|---|---|---|---|---|
| Login | `/login` | publik | Login sistem | `/api/v1/auth/login` | POST |
| Katalog Menu | `/` | guest, cashier, owner | Tampilkan daftar produk | `/api/v1/products` | GET |
| Katalog Menu | `/` | guest, cashier, owner | Daftar kategori | `/api/v1/categories` | GET |
| Cek Status Pesanan | `/cek-pesanan` | guest | Lihat status pesanan | `/api/v1/orders/:code` | GET |
| Kelola Produk | `/owner/produk` | owner | Tambah produk baru | `/api/v1/products` | POST |
| Kelola Produk | `/owner/produk` | owner | Ubah produk | `/api/v1/products/:id` | PUT |
| Kelola Produk | `/owner/produk` | owner | Hapus produk | `/api/v1/products/:id` | DELETE |
| Transaksi Kasir | `/kasir` | cashier | Simpan transaksi baru | `/api/v1/transactions` | POST |
| Riwayat Transaksi | `/transaksi` | cashier, owner | Tampilkan daftar transaksi | `/api/v1/transactions` | GET |
| Riwayat Transaksi | `/transaksi` | cashier | Update pembayaran | `/api/v1/transactions/:id/payment` | PATCH |
| Riwayat Transaksi | `/transaksi` | cashier | Update status pesanan | `/api/v1/transactions/:id/status` | PATCH |
| Dashboard Pemilik | `/owner/dashboard` | owner | Ringkasan pendapatan | `/api/v1/reports/summary` | GET |
| Laporan | `/owner/laporan` | owner | Laporan + unduh CSV | `/api/v1/reports/sales` | GET |

### 5.2 Spesifikasi Endpoint
Format respons seragam: sukses `{ "success": true, "data": {...} }`, gagal `{ "success": false, "message": "...", "errors": { "field": "pesan" } }`.

#### a) Login
- **Method dan Path:** `POST /api/v1/auth/login`
- **Request Body:**
```json
{ "username": "kasir1", "password": "kasir123" }
```
- **Response Sukses (200):**
```json
{ "success": true, "data": { "user": { "id": "usr-002", "name": "Kasir Satu", "username": "kasir1", "role": "cashier" } } }
```
- **Response Gagal (401):**
```json
{ "success": false, "message": "Username atau kata sandi salah" }
```

#### b) Tambah Produk Baru *(wajib sesuai template dosen)*
- **Nama Endpoint:** Tambah Produk Baru
- **Method dan Path:** `POST /api/v1/products`
- **Hak akses:** `owner`
- **Request Body:**
```json
{ "name": "Teh Tarek Original", "category_id": "cat-001", "price": 8000, "is_active": true }
```
- **Response Sukses (201):**
```json
{ "success": true, "data": { "id": "prd-007", "name": "Teh Tarek Original", "category_id": "cat-001", "price": 8000, "is_active": true, "created_at": "2026-11-20T09:00:00.000Z" } }
```
- **Response Gagal (400):**
```json
{ "success": false, "message": "Validasi gagal", "errors": { "price": "Harga harus lebih dari 0", "name": "Nama produk wajib diisi" } }
```

#### c) Simpan Transaksi Baru
- **Method dan Path:** `POST /api/v1/transactions`
- **Hak akses:** `cashier`
- **Request Body:**
```json
{ "customer_name": "Budi", "note": "Kurang manis", "items": [ { "product_id": "prd-001", "qty": 2 }, { "product_id": "prd-003", "qty": 1 } ] }
```
- **Response Sukses (201):**
```json
{ "success": true, "data": { "id": "trx-0012", "code": "TTP-20261120-003", "customer_name": "Budi", "items": [ { "product_id": "prd-001", "name": "Teh Tarek Original", "price": 8000, "qty": 2, "subtotal": 16000 } ], "total": 16000, "payment_status": "unpaid", "order_status": "diterima", "created_by": "usr-002", "created_at": "2026-11-20T09:10:00.000Z" } }
```
- **Response Gagal (400):**
```json
{ "success": false, "message": "Validasi gagal", "errors": { "items": "Pesanan minimal berisi 1 item" } }
```

#### d) Update Pembayaran
- **Method dan Path:** `PATCH /api/v1/transactions/:id/payment`
- **Request Body:** `{ "method": "cash", "amount_received": 20000 }` (`method`: `cash` | `qris` | `transfer`)
- **Sukses (200):** `{ "success": true, "data": { "id": "trx-0012", "payment_status": "paid", "payment_method": "cash", "amount_received": 20000, "change": 4000, "paid_at": "..." } }`
- **Gagal (400):** `{ "success": false, "message": "Uang diterima kurang dari total", "errors": { "amount_received": "Minimal Rp16.000" } }`

#### e) Update Status Pesanan
- **Method dan Path:** `PATCH /api/v1/transactions/:id/status`
- **Request Body:** `{ "order_status": "diproses" }`
- **Sukses (200):** `{ "success": true, "data": { "id": "trx-0012", "order_status": "diproses" } }`
- **Gagal (409):** `{ "success": false, "message": "Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah" }`

#### f) Cek Status Pesanan (publik)
- **Method dan Path:** `GET /api/v1/orders/:code`
- **Sukses (200):** `{ "success": true, "data": { "code": "TTP-20261120-003", "order_status": "diproses", "payment_status": "paid", "items": [ { "name": "Teh Tarek Original", "qty": 2 } ], "total": 16000 } }` (tanpa data kasir)
- **Gagal (404):** `{ "success": false, "message": "Kode pesanan tidak ditemukan" }`

#### g) Endpoint Ringkas Lain
| Endpoint | Request | Response sukses | Response gagal |
|---|---|---|---|
| `GET /api/v1/products?category_id=&q=&active=` | query opsional | 200 `data: [produk...]` | — |
| `PUT /api/v1/products/:id` | body sama dengan POST | 200 produk terbaru | 400 validasi / 404 tidak ditemukan |
| `DELETE /api/v1/products/:id` | — | 200 `{ "deleted": true }` atau `{ "deactivated": true }` bila sudah dipakai transaksi | 404 |
| `GET /api/v1/transactions?date_from=&date_to=&order_status=&payment_status=` | query opsional | 200 `data: [transaksi...]` | — |
| `GET /api/v1/reports/summary` | — | 200 `{ revenue_today, revenue_month, transaction_count_today, top_products: [{ name, qty }] }` | — |
| `GET /api/v1/reports/sales?date_from=&date_to=` | rentang tanggal | 200 `{ rows: [...], total_revenue }` | 400 bila `date_from` > `date_to` |

---

## 6. Desain Basis Data (ERD)

Karena memakai localStorage, setiap entitas disimpan sebagai array JSON pada satu key.

### 6.1 Entitas dan Kolom
**users** (key `ttpc:users`)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | **PK** (`usr-001`) |
| name | string | Nama lengkap |
| username | string | Unik |
| password | string | Demo saja (plaintext) |
| role | string | `owner` / `cashier` |
| is_active | boolean | |

**categories** (key `ttpc:categories`)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | **PK** (`cat-001`) |
| name | string | Unik |

**products** (key `ttpc:products`)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | **PK** (`prd-001`) |
| category_id | string | **FK** → categories.id |
| name | string | |
| price | number | Rupiah, bilangan bulat |
| is_active | boolean | |
| created_at | string (ISO) | |

**transactions** (key `ttpc:transactions`)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | **PK** (`trx-0001`) |
| code | string | Unik, `TTP-YYYYMMDD-NNN` |
| customer_name | string | Opsional |
| note | string | Opsional |
| total | number | |
| payment_status | string | `unpaid` / `paid` |
| payment_method | string/null | `cash` / `qris` / `transfer` |
| amount_received | number/null | |
| change | number/null | |
| order_status | string | `diterima` / `diproses` / `siap` / `selesai` / `dibatalkan` |
| created_by | string | **FK** → users.id |
| created_at | string (ISO) | |
| paid_at | string/null | |

**transaction_items** (key `ttpc:transaction_items`)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | string | **PK** |
| transaction_id | string | **FK** → transactions.id |
| product_id | string | **FK** → products.id |
| name | string | Snapshot nama |
| price | number | Snapshot harga |
| qty | number | |
| subtotal | number | price × qty |

### 6.2 Relasi dan Kardinalitas
- `categories` 1 — N `products` (satu kategori punya banyak produk).
- `users` 1 — N `transactions` (satu kasir mencatat banyak transaksi).
- `transactions` 1 — N `transaction_items` (satu transaksi berisi banyak item).
- `products` 1 — N `transaction_items` (satu produk muncul di banyak item transaksi).
- `transactions` ↔ `products` adalah relasi N–N yang dipecah oleh `transaction_items`.

### 6.3 Normalisasi
Bentuk 3NF: tidak ada atribut berulang di `transactions` (item dipisah), nama kategori hanya di `categories`. `name` dan `price` pada `transaction_items` sengaja disalin (snapshot historis), bukan pelanggaran normalisasi, dan dijelaskan di laporan.

> Gambar ERD final dibuat di draw.io / dbdiagram.io dengan PK, FK, dan tipe data seperti tabel di atas, lalu dilampirkan di laporan.

---

## 7. Desain UI/UX dan Style Guide

### 7.1 Palet Warna
| Peran | Warna | HEX |
|---|---|---|
| Primary (cokelat teh) | Cokelat teh tarek | `#8B5A2B` |
| Primary dark | Cokelat tua | `#5C3A1A` |
| Secondary (krem susu) | Krem | `#F5E6CC` |
| Aksen | Oranye karamel | `#D98324` |
| Sukses | Hijau | `#2E8B57` |
| Peringatan | Kuning | `#F2B705` |
| Bahaya | Merah | `#C0392B` |
| Latar halaman | Putih gading | `#FFFBF3` |
| Teks utama | Cokelat gelap | `#2B1B0E` |

Simpan sebagai CSS variables di `variables.css` (`--color-primary`, dst.).

### 7.2 Tipografi
- **Font family:** `Poppins` untuk judul dan subjudul, `Inter` untuk teks isi (fallback `system-ui, sans-serif`).
- **Ukuran:** Judul halaman 28px / 700, subjudul 20px / 600, teks isi 16px / 400, teks kecil (caption/tabel) 14px.

### 7.3 Prinsip UI
- Border radius 8px, jarak antar elemen kelipatan 8px.
- Tombol utama berwarna primary; aksi destruktif berwarna bahaya dan selalu memakai dialog konfirmasi.
- Badge status: `unpaid` kuning, `paid` hijau, `diterima` abu, `diproses` oranye, `siap` biru, `selesai` hijau, `dibatalkan` merah.
- Responsif: halaman kasir dua kolom di desktop (produk | keranjang), satu kolom di mobile.
- Pesan error validasi tampil di bawah field; notifikasi sukses/gagal memakai toast.

### 7.4 Wireframe Halaman Utama (dibuat di Figma/Stitch, deskripsi acuan)
1. **Login:** kartu di tengah — logo, field username, field password, tombol Masuk, pesan error di atas tombol.
2. **Katalog Menu (publik):** navbar (logo, Menu, Cek Pesanan, Login), baris filter kategori + pencarian, grid kartu produk (nama, kategori, harga).
3. **Cek Status Pesanan:** input kode pesanan + tombol Cek; hasil berupa stepper status dan daftar item.
4. **Kasir:** kiri grid produk dengan tombol tambah; kanan panel keranjang (item, qty +/−, total, nama pelanggan, catatan, tombol Simpan Pesanan).
5. **Riwayat Transaksi:** filter tanggal/status, tabel (kode, waktu, total, badge pembayaran, badge status, aksi bayar/ubah status/nota).
6. **Dashboard Pemilik:** 4 kartu ringkasan (pendapatan hari ini, bulan ini, jumlah transaksi hari ini, menu terlaris) + daftar 5 menu terlaris.
7. **Kelola Produk:** tombol Tambah Produk, tabel produk (nama, kategori, harga, status, aksi), modal form tambah/ubah.
8. **Laporan:** filter rentang tanggal, tabel penjualan, total, tombol Unduh CSV.

---

## 8. Implementasi Frontend Vue.js v3 (Bab 3 Laporan)

### 8.1 Ketentuan Kode
- Semua komponen memakai `<script setup>`.
- Router: Vue Router 4 (history mode), guard `beforeEach` berdasarkan `meta.roles`.
- State: Pinia (setup store atau options store, konsisten di semua store).
- Tidak ada data statis di komponen: menu, kategori, harga, user, dan transaksi hanya dari store.
- Komponen halaman (view) hanya merangkai komponen; logika berat ada di store/composable. Target maksimal ±150 baris per komponen.
- Format rupiah dan tanggal lewat `utils/format.js`.

### 8.2 Rute dan Proteksi Role
| Path | Komponen | `meta.roles` |
|---|---|---|
| `/` | MenuView | semua |
| `/cek-pesanan` | OrderStatusView | semua |
| `/login` | LoginView | publik (redirect ke dashboard jika sudah login) |
| `/kasir` | CashierView | `cashier` |
| `/transaksi` | TransactionListView | `cashier`, `owner` |
| `/owner/dashboard` | DashboardView | `owner` |
| `/owner/produk` | ProductManageView | `owner` |
| `/owner/laporan` | ReportView | `owner` |
| `/403` | ForbiddenView | semua |
| `/:pathMatch(.*)*` | NotFoundView | semua |

Logika guard: belum login dan rute butuh role → redirect `/login`; sudah login tetapi role tidak cocok → redirect `/403`.

### 8.3 Pinia Stores
| Store | State | Getters | Actions |
|---|---|---|---|
| `auth` | `user`, `isHydrated` | `isLoggedIn`, `role` | `login`, `logout`, `restoreSession` |
| `category` | `items` | `byId` | `load` |
| `product` | `items`, `filter` | `activeProducts`, `filtered`, `byId` | `load`, `add`, `update`, `remove` |
| `transaction` | `items`, `cart` | `cartTotal`, `todayList` | `load`, `addToCart`, `changeQty`, `removeFromCart`, `clearCart`, `create`, `pay`, `updateStatus`, `findByCode` |
| `report` | — | `revenueToday`, `revenueMonth`, `topProducts`, `salesByRange` | `exportCsv` |
| `ui` | `toasts` | — | `showToast`, `dismiss` |

### 8.4 Mekanisme Data Seed dan localStorage (Bab 3.2)
**File seed** di `src/data/seed/`:
- `users.json` — 1 owner (`owner` / `owner123`), 1–2 kasir (`kasir1` / `kasir123`).
- `categories.json` — mis. Teh Tarek, Minuman Lain, Camilan *(sesuaikan dengan menu asli)*.
- `products.json` — 6–10 produk contoh dengan harga *(ganti dengan menu dan harga asli hasil observasi)*.
- `transactions.json` — 5–8 transaksi contoh (berikut item) agar dashboard tidak kosong.

**localStorage keys:** `ttpc:users`, `ttpc:categories`, `ttpc:products`, `ttpc:transactions`, `ttpc:transaction_items`, `ttpc:session`, `ttpc:seed_version`.

**Alur inisialisasi** (dijalankan di `main.js` sebelum `app.mount`):
1. `storage.initSeed()` memeriksa tiap key.
2. Jika key belum ada (`null`), salin isi file JSON seed ke localStorage via `JSON.stringify`.
3. Jika key sudah ada, JANGAN ditimpa (data pengguna dipertahankan).
4. Store Pinia memuat data dari localStorage (`load()`), bukan dari file seed langsung.
5. Setiap action tambah/ubah/hapus memperbarui state, lalu langsung menulis ulang key terkait ke localStorage.
6. Fungsi `resetData()` (tombol tersembunyi untuk pemilik atau lewat DevTools) menghapus semua key `ttpc:*` agar seed dimuat ulang.
7. Semua `getItem/setItem` dibungkus `try/catch` (penyimpanan penuh atau JSON rusak → fallback ke seed + toast peringatan).

---

## 9. Rencana Pengujian (Bab 5 Laporan)

Setiap fitur minimal 3 skenario: valid, kosong/salah, dan batas. Kolom **Hasil Aktual** diisi setelah pengujian nyata.

| Kode | Fitur | Kondisi / Skenario | Hasil yang Diharapkan | Hasil Aktual |
|---|---|---|---|---|
| QA-01 | Login | Akun kasir valid | Diarahkan ke `/kasir` | |
| QA-02 | Login | Kata sandi salah | Pesan "Username atau kata sandi salah" | |
| QA-03 | Login | Username dan sandi kosong | Pesan validasi wajib diisi, tidak ada request login | |
| QA-04 | Proteksi role | Kasir membuka `/owner/produk` | Dialihkan ke `/403` | |
| QA-05 | Proteksi role | Pengunjung belum login membuka `/kasir` | Dialihkan ke `/login` | |
| QA-06 | Tambah produk | Data valid (harga 8000) | Produk tersimpan dan tampil di katalog | |
| QA-07 | Tambah produk | Harga 0 atau nama kosong | Penyimpanan ditolak + pesan error | |
| QA-08 | Tambah produk | Harga 1 (batas minimum) dan nama 3 karakter | Berhasil disimpan | |
| QA-09 | Hapus produk | Produk belum pernah dipakai transaksi | Terhapus setelah konfirmasi | |
| QA-10 | Hapus produk | Produk sudah ada di transaksi | Hanya dinonaktifkan, riwayat tetap utuh | |
| QA-11 | Buat pesanan | 2 item valid | Transaksi tersimpan, kode `TTP-…` muncul, total benar | |
| QA-12 | Buat pesanan | Keranjang kosong lalu klik Simpan | Ditolak, pesan "minimal 1 item" | |
| QA-13 | Buat pesanan | Qty 99 lalu coba tambah lagi | Qty tertahan di 99 | |
| QA-14 | Pembayaran | Tunai ≥ total | Status `paid`, kembalian dihitung benar | |
| QA-15 | Pembayaran | Tunai < total | Ditolak + pesan kurang bayar | |
| QA-16 | Pembayaran | Tunai tepat sama dengan total | Berhasil, kembalian 0 | |
| QA-17 | Status pesanan | diterima → diproses → siap → selesai | Badge berubah tiap langkah | |
| QA-18 | Status pesanan | Ubah status transaksi `selesai` | Ditolak (409) | |
| QA-19 | Cek status | Kode valid | Stepper dan item tampil | |
| QA-20 | Cek status | Kode salah / kosong | "Kode pesanan tidak ditemukan" / validasi kosong | |
| QA-21 | Dashboard | Ada transaksi paid hari ini | Pendapatan sesuai penjumlahan; transaksi dibatalkan tidak dihitung | |
| QA-22 | Laporan | Rentang tanggal terbalik | Pesan error rentang tanggal | |
| QA-23 | Laporan | Unduh CSV rentang valid | File CSV terunduh dengan data sesuai | |
| QA-24 | Persistensi | Tambah transaksi lalu reload browser | Data tetap tampil dari localStorage | |
| QA-25 | Persistensi | Hapus semua key `ttpc:*` lalu reload | Data seed dimuat ulang otomatis | |

**5.2 Bukti:** screenshot DevTools → tab Application → Local Storage yang menunjukkan perubahan data JSON setelah pengujian (mis. sebelum dan sesudah tambah transaksi).

---

## 10. Rencana Dokumentasi Agentic AI (Bab 4 Laporan)
Setiap tahap pengerjaan dicatat dengan format: **Prompt ke-N → Alat AI → Tujuan → Screenshot prompt + respons → Evaluasi dan penyesuaian manual.**

Urutan iterasi yang disarankan (satu prompt per tahap, screenshot setiap tahap):
1. Inisialisasi proyek Vite + Vue 3 + Router + Pinia + struktur folder.
2. Seed JSON + `storage.js` + inisialisasi localStorage.
3. Store `auth` + halaman login + router guard.
4. Komponen common (Base*, Modal, Toast, StatusBadge).
5. Katalog menu + filter + pencarian.
6. CRUD produk (owner).
7. Halaman kasir: keranjang + simpan transaksi.
8. Pembayaran + update status + nota.
9. Riwayat transaksi + cek status pesanan.
10. Dashboard dan laporan + CSV.
11. Perbaikan bug dan pengujian QA.

Pada tiap evaluasi, tulis jujur bagian yang langsung berfungsi dan bagian yang diperbaiki manual (rubrik A5 menilai ini).

---

## 11. Pemetaan PRD ke Rubrik dan Template Laporan

| Rubrik | Bobot | Dipenuhi oleh bagian PRD | Tips skor maksimal |
|---|---|---|---|
| A1 Etika dan Analisis Kebutuhan | 15 | Bagian 2 | Bukti izin nyata, kendala spesifik usaha, tabel role sesuai fitur |
| A2 Desain Arsitektur dan Data | 25 | Bagian 4–7 | Component tree rapi, payload API lengkap, ERD benar, style guide konsisten |
| A3 Implementasi Vue.js v3 | 30 | Bagian 8.1–8.3 | `<script setup>`, Router + guard role, Pinia, tanpa hardcode, komponen kecil |
| A4 Seed dan localStorage | 15 | Bagian 8.4 | Seed otomatis dimuat; semua CRUD tersinkron dan bertahan setelah reload |
| A5 Agentic AI dan Pengujian | 15 | Bagian 9–10 | Screenshot berurutan, skenario positif + negatif + batas |

### Struktur Laporan (sesuai template dosen)
Cover (judul, objek usaha, alamat, nama + NIM, kelas, tautan repo Git) → Bab 1 (1.1–1.4) → Bab 2 (2.1–2.4) → Bab 3 (3.1–3.3) → Bab 4 → Bab 5 (5.1–5.2).

---

## 12. Checklist Sebelum Dikumpulkan
- [ ] Bukti izin observasi terlampir; alur as-is, kendala, dan harapan sesuai kondisi nyata.
- [ ] Menu, kategori, dan harga seed sudah diganti dengan data asli usaha.
- [ ] ERD dan component tree sudah digambar dan dilampirkan sebagai gambar.
- [ ] Style guide (HEX, font) sesuai yang dipakai di kode.
- [ ] Screenshot struktur folder, aplikasi per role, DevTools Local Storage.
- [ ] Seluruh prompt Agentic AI terdokumentasi berurutan.
- [ ] Kolom Hasil Aktual QA diisi dari pengujian nyata.
- [ ] Repositori Git publik/dapat diakses dosen dan tautannya ada di cover.
