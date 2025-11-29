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
import type { ViolationType } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ViolationTypeForm } from '@/components/violation-type-form';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

const ROWS_PER_PAGE = 10;

export default function ViolationTypesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, error, isLoading, mutate } = useSWR('/api/violations-type', fetcher);
    const { data: session } = useSession();
    const { toast } = useToast();

    // Check if user has admin or BK teacher role
    const userRole = session?.user?.role;
    const canPerformActions = userRole === 'Admin' || userRole === 'Guru BK';

    const totalPages = data && data.length > 0 ? Math.ceil(data.length / ROWS_PER_PAGE) : 0;
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentViolationTypes = data ? data.slice(startIndex, endIndex) : [];

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (violationTypeId: string) => {
        try {
            const response = await fetch(`/api/violations-type/${violationTypeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus tipe pelanggaran');
            }

            // Revalidate the data
            mutate();
            
            toast({
                title: 'Sukses',
                description: 'Tipe pelanggaran berhasil dihapus.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak terduga',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const handleSuccess = () => {
        // Revalidate the data
        mutate();
    };

    // Error state
    if (error) {
        return (
            <RootLayout>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-headline">Tipe Pelanggaran</h1>
                        {canPerformActions && (
                            <ViolationTypeForm onSuccess={handleSuccess}>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Tipe
                                </Button>
                            </ViolationTypeForm>
                        )}
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Tipe Pelanggaran</CardTitle>
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

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Tipe Pelanggaran</h1>
                    {canPerformActions && (
                        <ViolationTypeForm onSuccess={handleSuccess}>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Tipe
                            </Button>
                        </ViolationTypeForm>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Tipe Pelanggaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pelanggaran</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-center">Poin</TableHead>
                                    <TableHead>Dibuat Oleh</TableHead>
                                    {canPerformActions && (
                                        <TableHead>
                                            <span className="sr-only">Aksi</span>
                                        </TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={canPerformActions ? 5 : 4} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                <p className="mt-2">Memuat data tipe pelanggaran...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentViolationTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canPerformActions ? 5 : 4} className="text-center py-10">
                                            <div className="flex flex-col items-center justify-center">
                                                <p>Tidak ada data tipe pelanggaran.</p>
                                                {canPerformActions && (
                                                    <ViolationTypeForm onSuccess={handleSuccess}>
                                                        <Button className="mt-4">
                                                            <PlusCircle className="mr-2 h-4 w-4" />
                                                            Tambah Tipe Pertama
                                                        </Button>
                                                    </ViolationTypeForm>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentViolationTypes.map((type: ViolationType) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        type.kategori === 'Berat'
                                                            ? 'destructive'
                                                            : type.kategori === 'Sedang'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className={
                                                        type.kategori === 'Sedang'
                                                            ? 'bg-amber-500 text-white'
                                                            : ''
                                                    }
                                                >
                                                    {type.kategori || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="destructive">
                                                    {type.poin || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{type.teachers?.name || '-'}</TableCell>
                                            {canPerformActions && (
                                                <TableCell>
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
                                                            <ViolationTypeForm 
                                                                violationType={type} 
                                                                onSuccess={handleSuccess}
                                                            >
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </ViolationTypeForm>
                                                            <DeleteConfirmationDialog
                                                                onConfirm={() => handleDelete(type.id)}
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
                            Halaman {currentPage} dari {totalPages || 1}
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
