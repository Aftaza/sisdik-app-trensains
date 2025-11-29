'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    MoreVertical,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2,
    Upload,
} from 'lucide-react';
import RootLayout from '../dashboard/layout';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { StudentForm } from '@/components/student-form';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/data';
import { useSession } from 'next-auth/react';
import { ImportStudentsCsv } from '@/components/import-students-csv';

const ROWS_PER_PAGE = 10;

export default function StudentsPage() {
    const router = useRouter();
    const {
        data: students,
        error,
        isLoading,
        mutate,
    } = useSWR<Student[]>('/api/students', fetcher);
    const [currentPage, setCurrentPage] = useState(1);
    const [classFilter, setClassFilter] = useState('Semua');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'none'>('none');
    const { toast } = useToast();
    const { data: session } = useSession();

    const hasPermission = session?.user?.role === 'Admin' || session?.user?.role === 'Guru BK';

    const classOptions = useMemo(() => {
        if (!students) {
            return ['Semua'];
        }

        // Menggunakan Set untuk mendapatkan nilai kelas yang unik
        const uniqueClasses = new Set(
            students
                .map((student) => student.classes?.name)
                .filter((className): className is string => !!className)
        );

        // Mengubah Set menjadi array dan menambahkan 'Semua' di awal
        return ['Semua', ...Array.from(uniqueClasses).sort()];
    }, [students]);

    const filteredAndSortedStudents = useMemo(() => {
        if (!students) return [];
        let filtered = students;

        if (classFilter !== 'Semua') {
            filtered = filtered.filter((student) => student.classes?.name === classFilter);
        }

        if (sortOrder !== 'none') {
            filtered.sort((a, b) => {
                if (sortOrder === 'asc') {
                    return a.total_poin - b.total_poin;
                } else {
                    return b.total_poin - a.total_poin;
                }
            });
        }

        return filtered;
    }, [students, classFilter, sortOrder]);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [classFilter, sortOrder]);

    if (error) {
        return (
            <RootLayout>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-headline">Daftar Siswa</h1>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Semua Siswa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-10">
                                <p className="text-red-500">Gagal memuat data. Silakan coba lagi.</p>
                                <Button 
                                    variant="outline" 
                                    className="mt-4"
                                    onClick={() => mutate()}
                                >
                                    Muat Ulang
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </RootLayout>
        );
    }

    const totalPages =
        filteredAndSortedStudents.length === 0
            ? 0
            : Math.ceil(filteredAndSortedStudents.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentStudents = filteredAndSortedStudents.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (studentId: string) => {
        if (!hasPermission) {
            toast({
                title: "Akses Ditolak",
                description: "Anda tidak memiliki izin untuk melakukan aksi ini.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    typeof data === 'object' && data !== null && 'message' in data
                        ? String(data.message)
                        : 'Gagal menghapus data siswa.'
                );
            }

            toast({
                title: 'Sukses',
                description: 'Data siswa berhasil dihapus.',
            });
            mutate();
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    (error as Error).message || 'Terjadi kesalahan saat menghapus data siswa.',
                variant: 'destructive',
            });
        }
    };

    const toggleSortOrder = () => {
        if (sortOrder === 'none') {
            setSortOrder('desc');
        } else if (sortOrder === 'desc') {
            setSortOrder('asc');
        } else {
            setSortOrder('none');
        }
    };

    const getSortIcon = () => {
        if (sortOrder === 'asc') {
            return <ArrowUp className="ml-2 h-4 w-4" />;
        }
        if (sortOrder === 'desc') {
            return <ArrowDown className="ml-2 h-4 w-4" />;
        }
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Daftar Siswa</h1>
                    { hasPermission && (
                        <div className="flex gap-2">
                            <ImportStudentsCsv onSuccess={() => mutate()}>
                                <Button variant="outline" disabled={isLoading}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </Button>
                            </ImportStudentsCsv>
                            <StudentForm>
                                <Button disabled={isLoading}>
                                    <PlusCircle />
                                    Tambah Siswa
                                </Button>
                            </StudentForm>
                        </div>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Semua Siswa</CardTitle>
                            <div className="flex items-center gap-2">
                                <Select
                                    value={classFilter}
                                    onValueChange={setClassFilter}
                                    disabled={!classOptions || classOptions.length <= 1}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter per kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt === 'Semua' ? 'Filter per kelas' : opt}
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
                                    <TableHead>Nama</TableHead>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead className="text-center">
                                        <Button variant="ghost" onClick={toggleSortOrder}>
                                            Total Poin
                                            {getSortIcon()}
                                        </Button>
                                    </TableHead>
                                    {hasPermission && (
                                        <TableHead>
                                            <span className="sr-only">Aksi</span>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students === undefined ? (
                                    <TableRow>
                                        <TableCell colSpan={hasPermission ? 6 : 5} className="text-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                            <p className="mt-2">Memuat data siswa...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : currentStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={hasPermission ? 6 : 5} className="text-center py-10">
                                            Tidak ada data siswa.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentStudents.map((student) => (
                                        <TableRow key={student.nis} className="hover:bg-muted/50">
                                            <TableCell
                                                onClick={() =>
                                                    router.push(`/students/${student.nis}`)
                                                }
                                                className="font-medium cursor-pointer"
                                            >
                                                {student.name}
                                            </TableCell>
                                            <TableCell
                                                onClick={() =>
                                                    router.push(`/students/${student.nis}`)
                                                }
                                                className="cursor-pointer"
                                            >
                                                {student.nis}
                                            </TableCell>
                                            <TableCell
                                                onClick={() =>
                                                    router.push(`/students/${student.nis}`)
                                                }
                                                className="cursor-pointer"
                                            >
                                                {student.classes?.name || '-'}
                                            </TableCell>
                                            <TableCell
                                                onClick={() =>
                                                    router.push(`/students/${student.nis}`)
                                                }
                                                className="text-center cursor-pointer"
                                            >
                                                <Badge
                                                    variant={
                                                        student.total_poin === 0
                                                            ? 'success'
                                                            : student.total_poin > 0 && student.total_poin <= 50
                                                            ? 'warning'
                                                            : 'destructive'
                                                    }
                                                >
                                                    {student.total_poin} Poin
                                                </Badge>
                                            </TableCell>
                                            { hasPermission && (
                                                <TableCell className="text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Toggle menu
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <StudentForm
                                                                student={student}
                                                            >
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </StudentForm>
                                                            <DeleteConfirmationDialog
                                                                onConfirm={() =>
                                                                    handleDelete(student.id)
                                                                }
                                                            >
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </DeleteConfirmationDialog>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
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
                </Card>
            </div>
        </RootLayout>
    );
}
