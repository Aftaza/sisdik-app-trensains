'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldAlert, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type SummaryCardsProps = {
    studentsCount: number;
    violationsCount: number;
    teachersCount: number;
    isLoading: boolean;
};

export function DashboardSummaryCards({
    studentsCount,
    violationsCount,
    teachersCount,
    isLoading,
}: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jumlah Siswa</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-8 w-1/4" />
                    ) : (
                        <div className="text-2xl font-bold">{studentsCount}</div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Total siswa terdaftar di sekolah
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pelanggaran</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-8 w-1/4" />
                    ) : (
                        <div className="text-2xl font-bold">{violationsCount}</div>
                    )}
                    <p className="text-xs text-muted-foreground">Total pelanggaran tercatat</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jumlah Guru</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-8 w-1/4" />
                    ) : (
                        <div className="text-2xl font-bold">{teachersCount}</div>
                    )}
                    <p className="text-xs text-muted-foreground">Total guru & staf terdaftar</p>
                </CardContent>
            </Card>
        </div>
    );
}
