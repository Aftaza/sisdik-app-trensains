
export type Student = {
  id: string;
  name: string;
  nis: string;
  class: string;
  totalPoints: number;
};

export type Violation = {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  type: string;
  date: string;
  notes: string;
  reporter: string;
  counselor: string;
  points: number;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  role: 'Guru BK' | 'Wali Kelas' | 'Kepala Sekolah';
};

export type ViolationType = {
  id: string;
  name: string;
  category: 'Berat' | 'Sedang' | 'Ringan';
  creator: string;
  points: number;
};

export type Sanction = {
  id: string;
  no: number;
  coaching: string;
  pointRange: string;
};

export const students: Student[] = [
  { id: '1', name: 'Budi Santoso', nis: '12345', class: 'XII-A', totalPoints: 120 },
  { id: '2', name: 'Citra Lestari', nis: '12346', class: 'XII-B', totalPoints: 95 },
  { id: '3', name: 'Agus Wijaya', nis: '12347', class: 'XI-A', totalPoints: 70 },
  { id: '4', name: 'Dewi Anggraini', nis: '12348', class: 'XI-C', totalPoints: 50 },
  { id: '5', name: 'Eko Prasetyo', nis: '12349', class: 'X-B', totalPoints: 30 },
];

export const teachers: Teacher[] = [
    { id: 't1', name: 'Dr. Anisa Rahmawati', email: 'anisa.r@sekolah.id', role: 'Kepala Sekolah' },
    { id: 't2', name: 'Bambang Supriadi', email: 'bambang.s@sekolah.id', role: 'Wali Kelas' },
    { id: 't3', name: 'Siti Nurhaliza', email: 'siti.n@sekolah.id', role: 'Guru BK' },
    { id: 't4', name: 'Ahmad Fauzi', email: 'ahmad.f@sekolah.id', role: 'Wali Kelas' },
];

export const violations: Violation[] = [
  { id: 'v1', studentId: '1', studentName: 'Budi Santoso', studentNis: '12345', type: 'Bullying', date: '2024-07-20', notes: 'Mengganggu siswa lain saat istirahat.', reporter: 'Bambang Supriadi', counselor: 'Siti Nurhaliza', points: 20 },
  { id: 'v2', studentId: '2', studentName: 'Citra Lestari', studentNis: '12346', type: 'Tardiness', date: '2024-07-19', notes: 'Terlambat masuk sekolah 15 menit.', reporter: 'Ahmad Fauzi', counselor: 'Siti Nurhaliza', points: 5 },
  { id: 'v3', studentId: '1', studentName: 'Budi Santoso', studentNis: '12345', type: 'Cheating', date: '2024-07-18', notes: 'Menyontek saat ujian matematika.', reporter: 'Bambang Supriadi', counselor: 'Siti Nurhaliza', points: 50 },
  { id: 'v4', studentId: '3', studentName: 'Agus Wijaya', studentNis: '12347', type: 'Disrespect', date: '2024-07-18', notes: 'Tidak sopan kepada guru.', reporter: 'Ahmad Fauzi', counselor: 'Siti Nurhaliza', points: 15 },
  { id: 'v5', studentId: '4', studentName: 'Dewi Anggraini', studentNis: '12348', type: 'Vandalism', date: '2024-07-17', notes: 'Mencoret-coret meja di kelas.', reporter: 'Bambang Supriadi', counselor: 'Siti Nurhaliza', points: 25 },
];

export const violationTypesData: ViolationType[] = [
  { id: 'vt1', name: 'Bullying', category: 'Berat', creator: 'Siti Nurhaliza', points: 20 },
  { id: 'vt2', name: 'Cheating', category: 'Berat', creator: 'Siti Nurhaliza', points: 50 },
  { id: 'vt3', name: 'Tardiness', category: 'Ringan', creator: 'Bambang Supriadi', points: 5 },
  { id: 'vt4', name: 'Disrespect', category: 'Sedang', creator: 'Ahmad Fauzi', points: 15 },
  { id: 'vt5', name: 'Vandalism', category: 'Sedang', creator: 'Bambang Supriadi', points: 25 },
  { id: 'vt6', name: 'Skipping Class', category: 'Sedang', creator: 'Ahmad Fauzi', points: 10 },
  { id: 'vt7', name: 'Uniform Violation', category: 'Ringan', creator: 'Siti Nurhaliza', points: 5 },
  { id: 'vt8', name: 'Theft', category: 'Berat', creator: 'Dr. Anisa Rahmawati', points: 75 },
];


export const violationTypes: string[] = [
  'Bullying',
  'Cheating',
  'Tardiness',
  'Disrespect',
  'Theft',
  'Vandalism',
  'Skipping Class',
  'Uniform Violation',
];

export const sanctionsData: Sanction[] = [
  { id: 's1', no: 1, coaching: 'Peringatan lisan oleh guru piket/wali kelas.', pointRange: '1-15' },
  { id: 's2', no: 2, coaching: 'Peringatan tertulis dan pemanggilan orang tua/wali.', pointRange: '16-30' },
  { id: 's3', no: 3, coaching: 'Tugas khusus yang bersifat edukatif.', pointRange: '31-50' },
  { id: 's4', no: 4, coaching: 'Skorsing selama 1-3 hari.', pointRange: '51-75' },
  { id: 's5', no: 5, coaching: 'Skorsing selama 4-6 hari dan wajib lapor.', pointRange: '76-100' },
  { id: 's6', no: 6, coaching: 'Dikembalikan kepada orang tua/wali (dikeluarkan).', pointRange: '>100' },
];
