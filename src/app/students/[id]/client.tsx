'use client';

import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useToast } from '@/hooks/use-toast';
import type { Student, Violation } from '@/lib/data';
import { StudentHeader } from '@/components/student-detail/StudentHeader';
import { StudentActions } from '@/components/student-detail/StudentActions';
import { StudentSanctionsCard } from '@/components/student-detail/StudentSanctionsCard';
import { StudentViolationsTable } from '@/components/student-detail/StudentViolationsTable';
import { StudentErrorState } from '@/components/student-detail/StudentErrorState';
import { StudentLoadingState } from '@/components/student-detail/StudentLoadingState';

// Import attendance components (keeping them here for now as they're complex)
import { AttendanceLogCard } from '@/components/student-detail/AttendanceLogCard';
import { AttendanceSummaryCard } from '@/components/student-detail/AttendanceSummaryCard';

type StudentProfileClientProps = {
    id: string;
};

export function StudentProfileClient({ id }: StudentProfileClientProps) {
    const {
        data: student,
        error: studentError,
        isLoading: studentLoading,
    } = useSWR<Student>(`/api/students/nis/${id}`, fetcher);
    
    const {
        data: studentViolations,
        error: studentViolationsError,
        isLoading: violationsLoading,
    } = useSWR<Violation[]>(`/api/violations-log/nis/${id}`, fetcher);
    
    const { toast } = useToast();
    const { mutate } = useSWRConfig();

    const handleDeleteViolation = async (violationId: string) => {
        try {
            const response = await fetch(`/api/violations-log/${violationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal menghapus pelanggaran.');
            }

            toast({
                title: 'Sukses',
                description: 'Pelanggaran berhasil dihapus.',
            });

            // Refresh the violations data
            mutate(`/api/violations-log/nis/${id}`);
            mutate(`/api/students/nis/${id}`);
            mutate(`/api/sanctions/nis/${id}`);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menghapus pelanggaran.',
                variant: 'destructive',
            });
        }
    };

    const handleRetry = () => {
        mutate(`/api/students/nis/${id}`);
        mutate(`/api/violations-log/nis/${id}`);
    };

    // Loading state
    if (studentLoading || violationsLoading) {
        return <StudentLoadingState />;
    }

    // Error state
    if (studentError || studentViolationsError) {
        const errorMessage = studentError?.message || studentViolationsError?.message || 'Unknown error';
        return <StudentErrorState studentId={id} errorMessage={errorMessage} onRetry={handleRetry} />;
    }
    
    // Main content
    return (
        <div className="flex flex-col gap-4">
            <StudentHeader student={student} />
            
            <StudentActions student={student} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <StudentViolationsTable
                        violations={studentViolations || []}
                        isLoading={violationsLoading}
                        student={student}
                        onDelete={handleDeleteViolation}
                    />
                    
                    <AttendanceSummaryCard studentId={id} />
                    
                    <AttendanceLogCard studentId={id} />
                </div>

                <div className="space-y-4">
                    <StudentSanctionsCard studentId={id} />
                </div>
            </div>
        </div>
    );
}
