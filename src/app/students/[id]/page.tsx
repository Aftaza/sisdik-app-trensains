
import { students, violations } from '@/lib/data';
import { notFound } from 'next/navigation';
import RootLayout from '../../dashboard/layout';
import { StudentProfileClient } from './client';


export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = students.find((s) => s.id === params.id);
  const studentViolations = violations.filter((v) => v.studentId === params.id);

  if (!student) {
    notFound();
  }

  return (
    <RootLayout>
        <StudentProfileClient student={student} violations={studentViolations} />
    </RootLayout>
  );
}

