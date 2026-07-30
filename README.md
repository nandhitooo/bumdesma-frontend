# 🏢 BUMDESMA — Sistem Absensi

Aplikasi web admin untuk manajemen absensi pegawai BUMDESMA (Badan Usaha Milik Desa Bersama). Dibangun dengan **React + Vite + Tailwind CSS**.

---

## 🚀 Teknologi

- **React** + **Vite**
- **Tailwind CSS**
- **Font Awesome** (ikon)
- **Google Fonts** — Nunito

---

## ✨ Fitur

| Halaman       | Deskripsi                                            |
| ------------- | ---------------------------------------------------- |
| 🔐 Login      | Autentikasi admin                                    |
| 📊 Dashboard  | Statistik kehadiran & grafik mingguan                |
| 👥 Pegawai    | Manajemen data pegawai (CRUD)                        |
| 📋 Absensi    | Rekap & edit data absensi harian                     |
| 🧹 Piket      | Penjadwalan & assign piket pegawai                   |
| 📅 Izin/Cuti  | Pengajuan & approval izin/cuti                       |
| 📈 Laporan    | Ringkasan kehadiran, izin, dan alpa                  |
| ⚙️ Pengaturan | Jam kerja, lokasi kantor, hari libur, ganti password |

---

## 📸 Screenshots

### 🔐 Login

![Login](screenshots/login.png)

### 📊 Dashboard

![Dashboard](screenshots/dashboard.png)

### 👥 Pegawai

![Pegawai](screenshots/pegawai.png)

### 📋 Absensi

![Absensi](screenshots/absensi.png)

### 🧹 Piket

![Piket](screenshots/piket.png)

### 📅 Izin/Cuti

![Izin/Cuti](screenshots/cuti.png)

### 📈 Laporan

![Laporan](screenshots/laporan.png)

### ⚙️ Pengaturan

![Pengaturan](screenshots/pengaturan.png)

---

## 🛠️ Cara Menjalankan

### Prasyarat

- Node.js >= 18
- npm atau yarn

### Instalasi

```bash
# Clone repository
git clone https://github.com/nandhitooo/mockup-web-pa.git
cd mockup-web-pa

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka browser dan akses: `http://localhost:5173`

### Build Production

```bash
npm run build
```

---

## 📂 Struktur Proyek

```
src/
├── components/
│   ├── Sidebar.jsx        # Navigasi sidebar
│   └── Topbar.jsx         # Header halaman
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Pegawai.jsx
│   ├── Absensi.jsx
│   ├── Piket.jsx
│   ├── Cuti.jsx
│   ├── Laporan.jsx
│   └── Pengaturan.jsx
├── data/
│   └── mockData.js        # Data dummy
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🖼️ Logo

Letakkan file logo di `public/logo.png` agar tampil di sidebar dan halaman login.

---

## 👤 Data Diri

|                   |                           |
| ----------------- | ------------------------- |
| **Nama**          | Fernandhito Dian Pratama  |
| **NRP**           | 3124510004                |
| **Program Studi** | D3 PJJ Teknik Informatika |

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan akademik (Proyek Akhir).

---

## 🔌 Integrasi dengan Backend (bumdesma-backend)

Frontend ini sudah disambungkan ke REST API `bumdesma-backend` (Node.js + Express + PostgreSQL).

### Setup

```bash
npm install
cp .env.example .env
# sesuaikan VITE_API_BASE_URL jika backend tidak berjalan di localhost:5000
npm run dev
```

Pastikan **bumdesma-backend** sudah berjalan (`npm run dev` di folder backend, default port `5000`)
sebelum menjalankan frontend ini.

### Yang berubah dari versi mockup

- `src/lib/api.js` — axios client + interceptor JWT (menyisipkan token, auto-logout saat 401)
- `src/context/AuthContext.jsx` — state login, persist token/pengguna di localStorage
- `src/pages/Login.jsx` — login memakai **NIP** (bukan username) ke `POST /api/auth/login`
- Seluruh halaman (`Dashboard`, `Pegawai`, `Absensi`, `Piket`, `Cuti`, `Laporan`, `Pengaturan`) sudah
  memanggil endpoint backend asli menggantikan `src/data/mockData.js` (file mock lama tidak lagi dipakai)
- `Sidebar` menampilkan menu sesuai role (`admin`/`pimpinan`) dan logout memanggil backend session lokal
- Halaman **Cuti**: tombol aksi menyesuaikan role — Admin meneruskan pengajuan (`review`), Pimpinan
  memberi keputusan akhir (`decision`). Pengajuan izin/cuti sendiri dilakukan dari aplikasi mobile
  karyawan (sesuai rancangan sistem), bukan dari web admin.
- Laporan → tombol Export PDF/Spreadsheet mengunduh file asli dari backend (`/api/reports/attendance/export`)

### Akun default (dari seeder backend)

| Role | NIP | Password |
|---|---|---|
| Admin | `ADM001` | `Admin@12345` |
| Pimpinan | `PIM001` | `Pimpinan@12345` |

### Catatan CORS

Backend sudah mengaktifkan `cors()` secara default (mengizinkan semua origin) sehingga tidak perlu
konfigurasi tambahan untuk development. Untuk production, batasi origin di `src/app.js` backend sesuai
domain frontend yang di-deploy.
