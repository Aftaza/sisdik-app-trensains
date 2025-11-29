'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

// Updated interface to match new API
interface AttendanceDaily {
    id: string;
    student_id: string;
    date: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
    notes: string;
    created_at: string;
    updated_at: string;
    students: {
        nis: string;
        name: string;
    };
}

interface AttendanceResponse {
    statusCode: number;
    message: string;
    data: AttendanceDaily[];
}

interface GroupedAttendance {
    month: string;
    year: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

type AttendanceSummaryCardProps = {
    studentId: string;
};

export function AttendanceSummaryCard({ studentId }: AttendanceSummaryCardProps) {
    const {
        data: attendanceData,
        error: attendanceError,
        isLoading: attendanceLoading,
    } = useSWR<AttendanceResponse>(
        studentId ? `/api/attendances/get-nis/${studentId}` : null,
        fetcher
    );

    // Extract attendance array from response
    const attendances = attendanceData?.data || [];

    // Group attendance by month
    const groupedData = useMemo(() => {
        const grouped: { [key: string]: GroupedAttendance } = {};

        attendances.forEach((att) => {
            const date = new Date(att.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!grouped[monthYear]) {
                grouped[monthYear] = {
                    month: date.toLocaleDateString('id-ID', { month: 'long' }),
                    year: date.getFullYear(),
                    hadir: 0,
                    sakit: 0,
                    izin: 0,
                    alpha: 0,
                    total: 0,
                };
            }

            const statusLower = att.status.toLowerCase();
            switch (statusLower) {
                case 'hadir':
                    grouped[monthYear].hadir += 1;
                    break;
                case 'sakit':
                    grouped[monthYear].sakit += 1;
                    break;
                case 'izin':
                    grouped[monthYear].izin += 1;
                    break;
                case 'alpha':
                    grouped[monthYear].alpha += 1;
                    break;
            }
            grouped[monthYear].total += 1;
        });

        return Object.values(grouped).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            const monthOrder = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
        });
    }, [attendances]);

    const calculatePercentage = (value: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rekap Absensi</CardTitle>
            </CardHeader>
            <CardContent>
                {attendanceLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : attendanceError ? (
                    <div className="text-center text-muted-foreground p-6">
                        Gagal memuat data absensi.
                    </div>
                ) : groupedData.length === 0 ? (
                    <div className="text-center text-muted-foreground p-6">
                        Belum ada data absensi.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bulan</TableHead>
                                <TableHead className="text-center">Hadir</TableHead>
                                <TableHead className="text-center">Sakit</TableHead>
                                <TableHead className="text-center">Izin</TableHead>
                                <TableHead className="text-center">Alpha</TableHead>
                                <TableHead className="text-center">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedData.map((att, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {att.month} {att.year}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="space-y-1">
                                            <div className="font-medium text-green-600">
                                                {att.hadir}
                                            </div>
                                            <Progress
                                                value={calculatePercentage(att.hadir, att.total)}
                                                className="h-2"
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {calculatePercentage(att.hadir, att.total)}%
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="space-y-1">
                                            <div className="font-medium text-blue-600">
                                                {att.sakit}
                                            </div>
                                            <Progress
                                                value={calculatePercentage(att.sakit, att.total)}
                                                className="h-2"
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {calculatePercentage(att.sakit, att.total)}%
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="space-y-1">
                                            <div className="font-medium text-yellow-600">
                                                {att.izin}
                                            </div>
                                            <Progress
                                                value={calculatePercentage(att.izin, att.total)}
                                                className="h-2"
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {calculatePercentage(att.izin, att.total)}%
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="space-y-1">
                                            <div className="font-medium text-red-600">
                                                {att.alpha}
                                            </div>
                                            <Progress
                                                value={calculatePercentage(att.alpha, att.total)}
                                                className="h-2"
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {calculatePercentage(att.alpha, att.total)}%
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                        {att.total}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
