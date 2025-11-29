'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { ClassForm } from '@/components/class-form';
import { useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/use-role';
import { fetcher } from '@/lib/fetcher';
import { Classes } from '@/lib/data';
import RootLayout from '../dashboard/layout';

const ROWS_PER_PAGE = 5;

export default function ClassesClient() {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, error, isLoading, mutate } = useSWR('/api/classes', fetcher);
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const { canManageStudents } = useRole();

    // Check if user has admin or BK teacher role
    const canPerformActions = canManageStudents;

    // Error state
        if (error) {
            return (
                <RootLayout>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold font-headline">Daftar Kelas</h1>
                            {canPerformActions && (
                                <ClassForm mutate={mutate}>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Tambah Kelas
                                    </Button>
                                </ClassForm>
                            )}
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Semua Kelas</CardTitle>
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

    const totalPages = data && data.length > 0 ? Math.ceil(data.length / ROWS_PER_PAGE) : 0;
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentClasses = data ? data.slice(startIndex, endIndex) : [];

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (classId: string) => {
        try {
            const response = await fetch(`/api/classes/${classId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus kelas');
            }

            // Revalidate data
            mutate();
            
            toast({
                title: 'Sukses',
                description: 'Kelas berhasil dihapus.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Terjadi kesalahan saat menghapus kelas',
                variant: 'destructive',
            });
        }
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Daftar Kelas</h1>
                    {canPerformActions && (
                        <ClassForm mutate={mutate}>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Kelas
                            </Button>
                        </ClassForm>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Semua Kelas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Kelas</TableHead>
                                    <TableHead>Jumlah Siswa</TableHead>
                                    {canPerformActions && <TableHead className="text-center">Aksi</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={canPerformActions ? 3 : 2} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                <p className="mt-2">Memuat data kelas...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentClasses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canPerformActions ? 3 : 2} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center">
                                                <p>Tidak ada data Kelas.</p>
                                                {canPerformActions && (
                                                    <ClassForm mutate={mutate}>
                                                        <Button className="mt-4">
                                                            <PlusCircle className="mr-2 h-4 w-4" />
                                                            Tambah Kelas
                                                        </Button>
                                                    </ClassForm>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentClasses.map((classItem: Classes) => (
                                        <TableRow key={classItem.id}>
                                            <TableCell className="font-medium">{classItem?.name || '-'}</TableCell>
                                            <TableCell>{classItem?.total_siswa || 0}</TableCell>
                                            {canPerformActions && (
                                                <TableCell className="text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <ClassForm classData={classItem} mutate={mutate}>
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </ClassForm>
                                                            <DeleteConfirmationDialog
                                                                onConfirm={() => handleDelete(classItem.id)}
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
                                    )))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {totalPages > 1 && (
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
