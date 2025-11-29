'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, PlusCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import RootLayout from '../dashboard/layout';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Classes } from '@/lib/data';
import { useSession } from 'next-auth/react';

// Updated interface to match new API structure
interface AttendanceDaily {
    id: string;
    student_id: string;
    date: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
    notes: string;
    students: {
        nis: string;
        name: string;
        classes: {
            name: string;
        };
    };
}

// Grouped attendance by student
interface StudentAttendanceSummary {
    nis: string;
    name: string;
    class: string;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
    total: number;
}

const ROWS_PER_PAGE = 10;

// Generate month options for last 6 months (1 semester)
const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const value = `${year}-${month}`; // "YYYY-M"
        const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        options.push({ value, label });
    }
    return options;
};

export default function AttendanceClient() {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const monthOptions = useMemo(() => getMonthOptions(), []);
    const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
    const [selectedClass, setSelectedClass] = useState('Semua Kelas');
    const { toast } = useToast();
    const { data: session } = useSession();

    const { data: classData, isLoading: classLoading } = useSWR<Classes[]>('/api/classes', fetcher);
    
    const {
        data: attendanceData,
        isLoading: attendanceLoading,
        error: attendanceError,
    } = useSWR<AttendanceDaily[]>(
        selectedMonth ? `/api/attendances/get-month/${selectedMonth}` : null,
        fetcher
    );

    const hasPermission = session?.user?.role === 'Admin' || session?.user?.role === 'Guru BK';

    const classOptions = useMemo(() => {
        if (!classData) return ['Semua Kelas'];
        return ['Semua Kelas', ...classData.map((cls) => cls.name)];
    }, [classData]);

    // Group attendance by student
    const groupedAttendance = useMemo(() => {
        if (!attendanceData || !Array.isArray(attendanceData)) return [];

        const grouped: { [key: string]: StudentAttendanceSummary } = {};

        attendanceData.forEach((att) => {
            const nis = att.students?.nis || '';
            const name = att.students?.name || '';

            if (!nis) return; // Skip if no NIS

            if (!grouped[nis]) {
                grouped[nis] = {
                    nis,
                    name,
                    class: att.students?.classes?.name || '', // Will be filled from class data
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
                    grouped[nis].hadir += 1;
                    break;
                case 'sakit':
                    grouped[nis].sakit += 1;
                    break;
                case 'izin':
                    grouped[nis].izin += 1;
                    break;
                case 'alpha':
                    grouped[nis].alpha += 1;
                    break;
            }
            grouped[nis].total += 1;
        });

        return Object.values(grouped);
    }, [attendanceData]);

    // Filter by class
    const filteredAttendance = useMemo(() => {
        if (selectedClass === 'Semua Kelas') {
            return groupedAttendance;
        }
        return groupedAttendance.filter((att) => att.class === selectedClass);
    }, [groupedAttendance, selectedClass]);

    const totalPages = Math.ceil(filteredAttendance.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentAttendance = filteredAttendance.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const calculatePercentage = (present: number, total: number) => {
        if (total === 0) return 0;
        return (present / total) * 100;
    };

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        setCurrentPage(1);
    };

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        setCurrentPage(1);
    };

    const getMonthLabel = () => {
        return monthOptions.find((opt) => opt.value === selectedMonth)?.label || '';
    };

    if (classLoading || attendanceLoading) {
        return (
            <RootLayout>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-headline">Rekap Absensi Siswa</h1>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" className="hidden">
                                <Link href="/attendance/import">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Absensi CSV
                                </Link>
                            </Button>
                            <Button disabled>
                                <Download className="mr-2 h-4 w-4" />
                                Ekspor PDF
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardContent className="flex flex-col gap-5 items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Memuat data...</p>
                        </CardContent>
                    </Card>
                </div>
            </RootLayout>
        );
    }

    if (attendanceError) {
        return (
            <RootLayout>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-headline">Rekap Absensi Siswa</h1>
                    </div>
                    <Card>
                        <CardContent className="flex flex-col gap-5 items-center justify-center h-64">
                            <p className="text-destructive">Gagal memuat data absensi.</p>
                            <p className="text-muted-foreground text-sm">Silakan coba lagi nanti.</p>
                        </CardContent>
                    </Card>
                </div>
            </RootLayout>
        );
    }

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Rekap Absensi Siswa</h1>
                    <div className="flex items-center gap-2">
                        {hasPermission && (
                            <Button asChild variant="outline" className="hidden">
                                <Link href="/attendance/import">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Absensi CSV
                                </Link>
                            </Button>
                        )}
                        {/* ={filteredAttendance.length === 0 || !hasPermission} */}
                        <Button disabled>
                            <Download className="mr-2 h-4 w-4" />
                            Ekspor PDF
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Data Kehadiran Bulanan</CardTitle>
                            <div className="flex items-center gap-2">
                                <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Pilih bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {monthOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedClass} onValueChange={handleClassChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter per kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bulan</TableHead>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead>Kehadiran</TableHead>
                                    <TableHead>Detail</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentAttendance.length > 0 ? (
                                    currentAttendance.map((att) => (
                                        <TableRow key={att.nis}>
                                            <TableCell>{getMonthLabel()}</TableCell>
                                            <TableCell>{att.nis}</TableCell>
                                            <TableCell
                                                className="font-medium cursor-pointer hover:underline"
                                                onClick={() => router.push(`/students/${att.nis}`)}
                                            >
                                                {att.name}
                                            </TableCell>
                                            <TableCell>{att.class || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium w-24">
                                                        {att.hadir}/{att.total} hari
                                                    </span>
                                                    <Progress
                                                        value={calculatePercentage(att.hadir, att.total)}
                                                        className="w-24 h-2"
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        ({calculatePercentage(att.hadir, att.total).toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Badge className="bg-green-100 text-green-800 text-center">
                                                        {att.hadir} Hadir
                                                    </Badge>
                                                    <Badge className="bg-blue-100 text-blue-800 text-center">
                                                        {att.sakit} Sakit
                                                    </Badge>
                                                    <Badge className="bg-yellow-100 text-yellow-800 text-center">
                                                        {att.izin} Izin
                                                    </Badge>
                                                    <Badge className="bg-red-100 text-red-800 text-center">
                                                        {att.alpha} Alpha
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
                                            Tidak ada data absensi untuk bulan dan kelas yang dipilih.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {totalPages > 0 && (
                        <CardFooter className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    Berikutnya
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </RootLayout>
    );
}
