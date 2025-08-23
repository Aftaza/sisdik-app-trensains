export type Student = {
    nis: number;
    nama_lengkap: string;
    kelas: string;
    total_poin: number;
};

export type Violation = {
    id: number;
    nis_siswa: string;
    nama_siswa: string;
    jenis_pelanggaran: string;
    catatan: string;
    tanggal_terjadi: string;
    tanggal_dicatat: string;
    pelapor: string;
    guru_bk: string;
    poin?: number;
};

export type Teacher = {
    id: number;
    nama: string;
    email: string;
    jabatan: string;
};

export type ViolationType = {
    id: number;
    nama_pelanggaran: string;
    kategori: string;
    pembuat: string;
    poin: number;
};

export type Sanction = {
    id: number;
    pembinaan: string;
    start_poin: number;
    end_poin: number;
};

export type classes = {
    id: number;
    nama_kelas: string;
    wali_kelas: string;
    total_siswa: number;
}

export type attendance = {
    id: number;
    tanggal: string;
    nama_siswa: string;
    nis_siswa: number;
    status_absensi: string;
}

// export const students: Student[] = [
//     { nama_lengkap: 'Budi Santoso', nis: 12345, kelas: 'XII-A', total_poin: 120 },
//     { nama_lengkap: 'Citra Lestari', nis: 12346, kelas: 'XII-B', total_poin: 95 },
//     { nama_lengkap: 'Agus Wijaya', nis: 12347, kelas: 'XI-A', total_poin: 70 },
//     { nama_lengkap: 'Dewi Anggraini', nis: 12348, kelas: 'XI-C', total_poin: 50 },
//     { nama_lengkap: 'Eko Prasetyo', nis: 12349, kelas: 'X-B', total_poin: 30 },
// ];

// export const teachers: Teacher[] = [
//     { id: 't1', name: 'Dr. Anisa Rahmawati', email: 'anisa.r@sekolah.id', role: 'Kepala Sekolah' },
//     { id: 't2', name: 'Bambang Supriadi', email: 'bambang.s@sekolah.id', role: 'Wali Kelas' },
//     { id: 't3', name: 'Siti Nurhaliza', email: 'siti.n@sekolah.id', role: 'Guru BK' },
//     { id: 't4', name: 'Ahmad Fauzi', email: 'ahmad.f@sekolah.id', role: 'Wali Kelas' },
// ];

// export const violations: Violation[] = [
//     {
//         id: 'v1',
//         studentId: '1',
//         studentName: 'Budi Santoso',
//         studentNis: '12345',
//         type: 'Bullying',
//         date: '2024-07-20',
//         notes: 'Mengganggu siswa lain saat istirahat.',
//         reporter: 'Bambang Supriadi',
//         counselor: 'Siti Nurhaliza',
//         points: 20,
//     },
//     {
//         id: 'v2',
//         studentId: '2',
//         studentName: 'Citra Lestari',
//         studentNis: '12346',
//         type: 'Tardiness',
//         date: '2024-07-19',
//         notes: 'Terlambat masuk sekolah 15 menit.',
//         reporter: 'Ahmad Fauzi',
//         counselor: 'Siti Nurhaliza',
//         points: 5,
//     },
//     {
//         id: 'v3',
//         studentId: '1',
//         studentName: 'Budi Santoso',
//         studentNis: '12345',
//         type: 'Cheating',
//         date: '2024-07-18',
//         notes: 'Menyontek saat ujian matematika.',
//         reporter: 'Bambang Supriadi',
//         counselor: 'Siti Nurhaliza',
//         points: 50,
//     },
//     {
//         id: 'v4',
//         studentId: '3',
//         studentName: 'Agus Wijaya',
//         studentNis: '12347',
//         type: 'Disrespect',
//         date: '2024-07-18',
//         notes: 'Tidak sopan kepada guru.',
//         reporter: 'Ahmad Fauzi',
//         counselor: 'Siti Nurhaliza',
//         points: 15,
//     },
//     {
//         id: 'v5',
//         studentId: '4',
//         studentName: 'Dewi Anggraini',
//         studentNis: '12348',
//         type: 'Vandalism',
//         date: '2024-07-17',
//         notes: 'Mencoret-coret meja di kelas.',
//         reporter: 'Bambang Supriadi',
//         counselor: 'Siti Nurhaliza',
//         points: 25,
//     },
// ];



// export const violationTypes: string[] = [
//     'Bullying',
//     'Cheating',
//     'Tardiness',
//     'Disrespect',
//     'Theft',
//     'Vandalism',
//     'Skipping Class',
//     'Uniform Violation',
// ];

// export const sanctionsData: Sanction[] = [
//     {
//         id: 's1',
//         no: 1,
//         coaching: 'Peringatan lisan oleh guru piket/wali kelas.',
//         pointRange: '1-15',
//     },
//     {
//         id: 's2',
//         no: 2,
//         coaching: 'Peringatan tertulis dan pemanggilan orang tua/wali.',
//         pointRange: '16-30',
//     },
//     { id: 's3', no: 3, coaching: 'Tugas khusus yang bersifat edukatif.', pointRange: '31-50' },
//     { id: 's4', no: 4, coaching: 'Skorsing selama 1-3 hari.', pointRange: '51-75' },
//     {
//         id: 's5',
//         no: 5,
//         coaching: 'Skorsing selama 4-6 hari dan wajib lapor.',
//         pointRange: '76-100',
//     },
//     {
//         id: 's6',
//         no: 6,
//         coaching: 'Dikembalikan kepada orang tua/wali (dikeluarkan).',
//         pointRange: '>100',
//     },
// ];
