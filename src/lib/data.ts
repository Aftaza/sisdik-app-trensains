// Base types from new API
export type Student = {
    id: string;
    name: string;
    nis: string;
    class_id: string;
    phone?: string;
    address?: string;
    total_poin: number;  // Changed from total_poin
    created_at: string;
    updated_at: string;
    classes?: {  // Changed from classes
        id: string;
        name: string;
        description?: string;
        total_siswa?: number;
    };
};

export type Violation = {
    id: string;
    student_id: string;
    violation_type_id: string;
    reporting_teacher_id: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    student?: {
        id: string;
        name: string;
        nis: string;
        class?: {
            name: string;
        };
    };
    violation_type?: {
        id: string;
        name: string;
        description?: string;
        poin: number;
    };
    reporting_teacher?: {
        id: string;
        name: string;
        nip: string;
    };
};

export type Teacher = {
    id: string;
    name: string;
    nip: string;
    email: string;
    phone?: string;
    role?: string;
    created_at: string;
    updated_at: string;
};

export type ViolationType = {
    id: string;
    name: string;
    kategori: string;
    poin: number;
    teachers?: {
        email: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
};

export type Sanction = {
    id: string;
    name: string[];  // Array of pembinaan names
    start_poin: number;
    end_poin: number;
    created_at: string;
    updated_at: string;
};

export type Classes = {
    id: string;
    name: string;
    description?: string;
    total_siswa: number;
    created_at: string;
    updated_at: string;
};

export type AttendanceDaily = {
    id: string;
    student_id: string;
    date: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
    notes?: string;
    created_at: string;
    updated_at: string;
    student?: {
        id: string;
        name: string;
        nis: string;
        class?: {
            id: string;
            name: string;
        };
    };
};

export type AttendanceMonthly = {
    nis_siswa: string;
    nama_siswa: string;
    kelas: string;
    tanggal: string;
    total_hari: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
};

export type GroupedAttendance = {
    id: string;
    nis_siswa: string;
    nama_siswa: string;
    kelas: string;
    bulanTahun: string;
    total_hari: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
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
