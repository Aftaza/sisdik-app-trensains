'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ViolationLogForm } from '@/components/violation-log-form';
import { AttendanceForm } from '@/components/attendance-form';
import type { Student } from '@/lib/data';

type StudentActionsProps = {
    student: Student | undefined;
};

export function StudentActions({ student }: StudentActionsProps) {
    return (
        <div className="flex justify-start gap-2">
            <ViolationLogForm student={student}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Catat Pelanggaran
                </Button>
            </ViolationLogForm>
            <AttendanceForm student={student}>
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Absensi
                </Button>
            </AttendanceForm>
        </div>
    );
}
