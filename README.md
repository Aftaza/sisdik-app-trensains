# SISDIK APP

SISDIK APP adalah aplikasi administrasi pelanggaran dan absensi siswa berbasis web yang dibangun dengan Next.js. Aplikasi ini dirancang untuk membantu sekolah dalam mengelola data pelanggaran siswa, absensi, serta memberikan wawasan analitis untuk pengambilan keputusan yang lebih baik.

## Fitur Utama

### 1. Manajemen Pelanggaran Siswa
- Pencatatan pelanggaran siswa secara real-time
- Klasifikasi jenis pelanggaran (ringan, sedang, berat)
- Sistem poin pelanggaran otomatis
- Riwayat pelanggaran lengkap per siswa

### 2. Dashboard Analitik
- Statistik jumlah siswa, pelanggaran, dan guru
- Grafik tipe pelanggaran paling umum
- Daftar siswa dengan poin tertinggi
- Pelanggaran terbaru
- Analisis pelanggaran per kelas

### 3. Manajemen Data
- **Data Siswa**: Informasi lengkap siswa, kelas, dan riwayat pelanggaran
- **Data Guru**: Profil guru dan staf pengajar
- **Tipe Pelanggaran**: Katalog jenis pelanggaran dengan skor poin
- **Kelas**: Manajemen kelas dan wali kelas
- **Sanksi**: Daftar sanksi berdasarkan tingkat pelanggaran

### 4. Sistem Autentikasi
- Login aman untuk admin dan guru
- Proteksi halaman berdasarkan role
- Session management yang aman

## Teknologi yang Digunakan

- **Frontend**: Next.js 15 dengan React 18
- **Styling**: Tailwind CSS dengan shadcn/ui components
- **State Management**: React Hooks, SWR untuk data fetching
- **Form Handling**: React Hook Form dengan Zod validation
- **Authentication**: NextAuth.js
- **Charting**: Recharts untuk visualisasi data
- **Backend**: REST API terpisah (`NEXT_PUBLIC_API_BASE_URL`), diakses lewat route handler Next.js di `src/app/api`
- **Deployment**: Vercel (kompatibel)

## Prasyarat Sistem

- Node.js >= 18.x
- npm atau yarn
- Backend API SISDIK yang sudah berjalan

## Instalasi

1. Clone repository:
   ```bash
   git clone https://github.com/Aftaza/sisdik-app-trensains.git
   cd sisdik-app-trensains
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Konfigurasi environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Isi `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, dan `NEXT_PUBLIC_API_BASE_URL` di `.env.local`

4. Jalankan development server:
   ```bash
   npm run dev
   ```

5. Buka [http://localhost:9002](http://localhost:9002) di browser Anda

## Struktur Direktori

```
src/
├── app/                 # Halaman-halaman aplikasi
│   ├── attendance/      # Modul absensi
│   ├── classes/         # Modul kelas
│   ├── dashboard/       # Dashboard utama
│   ├── logs/            # Riwayat pelanggaran
│   ├── sanctions/       # Modul sanksi
│   ├── students/        # Modul siswa
│   ├── teachers/        # Modul guru
│   └── violation-types/ # Modul tipe pelanggaran
├── components/          # Komponen UI reusable
├── lib/                 # Utility functions
└── hooks/               # Custom React hooks
```

## Penggunaan

### Login
1. Akses halaman login di root URL
2. Masukkan kredensial yang telah disetel

### Dashboard
Setelah login, Anda akan diarahkan ke dashboard yang menampilkan:
- Statistik keseluruhan
- Grafik pelanggaran
- Siswa dengan poin tertinggi
- Pelanggaran terbaru

### Manajemen Data
Navigasi melalui sidebar untuk mengakses:
- **Data Siswa**: Lihat, tambah, edit, hapus data siswa
- **Data Guru**: Kelola data guru dan staf
- **Pelanggaran**: Catat pelanggaran baru
- **Absensi**: Kelola data absensi (dalam pengembangan)
- **Tipe Pelanggaran**: Atur kategori dan poin pelanggaran
- **Kelas**: Kelola data kelas
- **Sanksi**: Atur sanksi berdasarkan tingkat pelanggaran

## Pengembangan

### Menjalankan Mode Development
```bash
npm run dev
```

### Build untuk Produksi
```bash
npm run build
```

### Menjalankan Mode Produksi
```bash
npm start
```

### Type Checking
```bash
npm run typecheck
```

## Kontak

Untuk pertanyaan atau dukungan teknis, silakan hubungi tim pengembang.

---

© 2025 SISDIK APP - Sistem Informasi Administrasi Pelanggaran Siswa