'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ViolationLogForm } from '@/components/violation-log-form';
import { DashboardSummaryCards } from '@/components/dashboard/DashboardSummaryCards';
import { RecentViolationsCard } from '@/components/dashboard/RecentViolationsCard';
import { TopStudentsCard } from '@/components/dashboard/TopStudentsCard';
import { ViolationTypeChart } from '@/components/dashboard/ViolationTypeChart';
import { ViolationByClassChart } from '@/components/dashboard/ViolationByClassChart';

interface Student {
    id: string;
    nis: string;
    name: string;
    classes: {
        name: string;
    } | null;
    total_poin: number;
}

interface Violation {
    id: string;
    student_id: string;
    violation_type_id: string;
    created_at: string;
    students: {
        nis: string;
        name: string;
    } | null;
    violation_types: {
        name: string;
        poin: number;
    } | null;
}

interface Teacher {
    id: string;
    name: string;
    role: string;
}

// Custom fetcher that handles both array and object responses
const customFetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    const data = await res.json();
    
    // If response is wrapped in { data: [...] }, extract the array
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
        return data.data;
    }
    
    // If response is already an array, return it
    if (Array.isArray(data)) {
        return data;
    }
    
    // Otherwise return the data as is
    return data;
};

export default function DashboardPage() {
    const { data: students, error: studentsError } = useSWR<Student[]>(
        '/api/students',
        customFetcher
    );
    const { data: violations, error: violationsError } = useSWR<Violation[]>(
        '/api/violations-log',
        customFetcher
    );
    const { data: teachers, error: teachersError } = useSWR<Teacher[]>(
        '/api/teachers',
        customFetcher
    );

    const isLoading = !students && !violations && !teachers;

    const { toast } = useToast();

    useEffect(() => {
        if (studentsError) {
            console.error('Students error:', studentsError);
            toast({
                title: 'Error',
                description: studentsError.message || 'Failed to fetch students',
                variant: 'destructive',
            });
        }
        if (violationsError) {
            console.error('Violations error:', violationsError);
            toast({
                title: 'Error',
                description: violationsError.message || 'Failed to fetch violations',
                variant: 'destructive',
            });
        }
        if (teachersError) {
            console.error('Teachers error:', teachersError);
            toast({
                title: 'Error',
                description: teachersError.message || 'Failed to fetch teachers',
                variant: 'destructive',
            });
        }
    }, [studentsError, violationsError, teachersError, toast]);

    const topStudents = useMemo(() => {
        if (!students || students.length === 0) {
            return [];
        }

        const studentsWithPoints = students.filter((student) => student.total_poin > 0);

        if (studentsWithPoints.length === 0) {
            return [];
        }

        return [...studentsWithPoints]
            .sort((a, b) => b.total_poin - a.total_poin)
            .slice(0, 5);
    }, [students]);

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Dashboard Utama</h1>
                <ViolationLogForm>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Catat Pelanggaran
                    </Button>
                </ViolationLogForm>
            </div>

            <DashboardSummaryCards
                studentsCount={students?.length || 0}
                violationsCount={violations?.length || 0}
                teachersCount={teachers?.length || 0}
                isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ViolationTypeChart violations={violations || []} isLoading={isLoading} />
                <TopStudentsCard students={topStudents} isLoading={isLoading} />
                <RecentViolationsCard violations={violations || []} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <ViolationByClassChart
                    violations={violations || []}
                    students={students || []}
                    isLoading={isLoading}
                />
            </div>
        </>
    );
}
