"use client"
import { createContext, useContext, useState, ReactNode } from 'react';

interface Student {
    nis: number;
    nama_lengkap: string;
    kelas: string;
    total_poin: number;
}

interface Violation {
    id: number;
    nis_siswa: number;
    nama_siswa: string;
    jenis_pelanggaran: string;
    tanggal_terjadi: string;
}

interface Teacher {
    id: number;
    nama: string;
    jabatan: string;
}

interface DataContextType {
  students: Student[];
  setStudents: (students: Student[]) => void;
  violations: Violation[];
  setViolations: (violations: Violation[]) => void;
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  return (
    <DataContext.Provider value={{ students, setStudents, violations, setViolations, teachers, setTeachers }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}