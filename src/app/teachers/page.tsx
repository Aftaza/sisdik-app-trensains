'use client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle, MoreVertical, Loader2 } from 'lucide-react';
import RootLayout from '../dashboard/layout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { TeacherForm } from '@/components/teacher-form';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Teacher } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

const ROWS_PER_PAGE = 10;

export default function TeachersPage() {
    const { data: teachers, error, isLoading } = useSWR<Teacher[]>('/api/teachers', fetcher);
    const { data: session } = useSession();
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Check if user has permission to add/edit/delete teachers
    const hasPermission = session?.user?.jabatan === 'Admin' || session?.user?.jabatan === 'Guru BK';

    if (error) {
        return (
                <RootLayout>
                    <div className="flex flex-col gap-4 p-4">
                        <p className="text-center text-muted-foreground">
                            Failed to load data teacher.
                        </p>
                    </div>
                </RootLayout>
            );
    }

    const totalPages = Math.ceil((teachers || []).length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentTeachers = (teachers || []).slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (teacherId: number) => {
        if (!hasPermission) {
            toast({
                title: "Akses Ditolak",
                description: "Anda tidak memiliki izin untuk melakukan aksi ini.",
                variant: "destructive",
            });
            return;
        }

        setDeletingId(teacherId);
        
        try {
            const response = await fetch(`/api/teachers/${teacherId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menghapus guru');
            }

            toast({
                title: "Sukses",
                description: "Data guru berhasil dihapus.",
            });

            // Refresh the teachers data
            mutate('/api/teachers');
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Daftar Guru</h1>
                    {hasPermission && (
                        <TeacherForm>
                            <Button disabled={isLoading}>
                                <PlusCircle />
                                Tambah Guru
                            </Button>
                        </TeacherForm>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Semua Guru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Jabatan</TableHead>
                                    {hasPermission && (
                                        <TableHead>
                                            <span className="sr-only">Aksi</span>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers === undefined ? (
                                    <TableRow>
                                        <TableCell colSpan={hasPermission ? 4 : 3} className="text-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                            <p className="mt-2">Memuat data guru...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : currentTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={hasPermission ? 4 : 3} className="text-center py-10">
                                            Tidak ada data guru.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentTeachers.map((teacher) => (
                                        <TableRow key={teacher.id}>
                                            <TableCell className="font-medium">
                                                {teacher.nama}
                                            </TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        teacher.jabatan === 'Pimpinan Sekolah'
                                                            ? 'destructive'
                                                            : teacher.jabatan === 'Guru BK'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {teacher.jabatan}
                                                </Badge>
                                            </TableCell>
                                            {hasPermission && (
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                                disabled={deletingId === teacher.id}
                                                            >
                                                                {deletingId === teacher.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <MoreVertical className="h-4 w-4" />
                                                                )}
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <TeacherForm teacher={teacher}>
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </TeacherForm>
                                                            <DeleteConfirmationDialog
                                                                onConfirm={() => handleDelete(teacher.id)}
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