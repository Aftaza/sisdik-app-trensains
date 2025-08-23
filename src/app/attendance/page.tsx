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
import { ChevronLeft, ChevronRight, Download, PlusCircle } from 'lucide-react';
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
import { AttendanceMonthly, Classes } from '@/lib/data';

const ROWS_PER_PAGE = 10;

const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const value = `${year}-${month}`; // "YYYY-MM"
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
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();
    
    const { data: classData, isLoading: classLoading } = useSWR<Classes[]>('/api/classes', fetcher);
    const { data: monthlyAttendanceData, isLoading: attendanceLoading, error: attendanceError } = useSWR<AttendanceMonthly[]>(
        selectedMonth ? `/api/attendances/get-month/${selectedMonth}` : null, 
        fetcher
    );

    const classOptions = useMemo(() => {
        if (!classData) return ['Semua Kelas'];
        return ['Semua Kelas', ...classData.map((cls) => cls.nama_kelas)];
    }, [classData]);

    const filteredAttendance = useMemo(() => {
        if (!monthlyAttendanceData) return [];
        let filtered = [...monthlyAttendanceData];
        if (selectedClass !== 'Semua Kelas') {
            filtered = filtered.filter((att) => att.kelas === selectedClass);
        }
        return filtered;
    }, [monthlyAttendanceData, selectedClass]);

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

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const monthLabel = monthOptions.find((opt) => opt.value === selectedMonth)?.label;

            const response = await fetch('/api/attendances/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: filteredAttendance,
                    month: monthLabel,
                    className: selectedClass,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal membuat PDF. Silakan coba lagi.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const fileName = `laporan-absensi-${selectedClass.replace(
                ' ',
                '-'
            )}-${selectedMonth}.pdf`;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Ekspor Berhasil',
                description: `Data absensi telah berhasil diekspor sebagai ${fileName}`,
            });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                variant: 'destructive',
                title: 'Ekspor Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat mengekspor data.',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const calculatePercentage = (present: number, total: number) => {
        if (total === 0) return 0;
        return (present / total) * 100;
    };

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
        setCurrentPage(1); // Reset to first page when month changes
    };

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        setCurrentPage(1); // Reset to first page when class changes
    };

    if (classLoading || attendanceLoading) {
        return (
            <RootLayout>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-headline">Rekap Absensi Siswa</h1>
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/attendance/import">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Absensi
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
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                                <p className="mt-2 text-muted-foreground">Memuat data...</p>
                            </div>
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
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline">
                                <Link href="/attendance/import">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Absensi
                                </Link>
                            </Button>
                            <Button onClick={handleExport} disabled={isExporting}>
                                {isExporting ? 'Mengekspor...' : <Download className="mr-2 h-4 w-4" />}
                                Ekspor PDF
                            </Button>
                        </div>
                    </div>
                    <Card>
                        <CardContent className="flex flex-col gap-5 items-center justify-center h-64">
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
                            <div className="text-center">
                                <p className="text-destructive">Gagal memuat data absensi atau data tidak ada.</p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Silakan coba lagi nanti.
                                </p>
                            </div>
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
                        <Button asChild variant="outline">
                            <Link href="/attendance/import">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Absensi
                            </Link>
                        </Button>
                        <Button onClick={handleExport} disabled={isExporting || filteredAttendance.length === 0}>
                            {isExporting ? 'Mengekspor...' : <Download className="mr-2 h-4 w-4" />}
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
                                        <TableRow key={att.nis_siswa}>
                                            <TableCell>
                                                {new Date(att.tanggal).toLocaleDateString('id-ID', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>{att.nis_siswa}</TableCell>
                                            <TableCell
                                                className="font-medium cursor-pointer hover:underline"
                                                onClick={() =>
                                                    router.push(`/students/${att.nis_siswa}`)
                                                }
                                            >
                                                {att.nama_siswa}
                                            </TableCell>
                                            <TableCell>{att.kelas}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium w-24">
                                                        {att.hadir}/{att.total_hari} hari
                                                    </span>
                                                    <Progress
                                                        value={calculatePercentage(
                                                            att.hadir,
                                                            att.total_hari
                                                        )}
                                                        className="w-24 h-2"
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        (
                                                        {calculatePercentage(
                                                            att.hadir,
                                                            att.total_hari
                                                        ).toFixed(0)}
                                                        %)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Badge
                                                        variant="success"
                                                        className="bg-green-100 text-green-800 text-center"
                                                    >
                                                        {att.hadir} Hadir
                                                    </Badge>
                                                    <Badge
                                                        variant="warning"
                                                        className="bg-yellow-100 text-yellow-800 text-center"
                                                    >
                                                        {att.sakit} Sakit
                                                    </Badge>
                                                    <Badge
                                                        variant="secondary"
                                                        className='text-center'
                                                    >
                                                        {att.izin} Izin
                                                    </Badge>
                                                    <Badge variant="destructive" className='text-center'>
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
