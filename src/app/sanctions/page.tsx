'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Sanction } from '@/lib/data';
import RootLayout from '../dashboard/layout';
import { SanctionForm } from '@/components/sanction-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Loader2 } from 'lucide-react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

const ROWS_PER_PAGE = 10;

export default function SanctionsPage() {
    const { data, error, isLoading, mutate } = useSWR('/api/sanctions', fetcher);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const { data: session } = useSession();

    // Check if user has permission (Admin or Guru BK)
    const userRole = session?.user?.jabatan;
    const canPerformActions = userRole === 'Admin' || userRole === 'Guru BK';

    if (error) {
            return (
                <RootLayout>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold font-headline">Daftar Sanksi</h1>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Tabel Sanksi Berdasarkan Poin</CardTitle>
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
    const currentSanctions = data ? data.slice(startIndex, endIndex) : [];

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (sanctionId: number) => {
        if (!canPerformActions) {
            toast({
                title: 'Akses Ditolak',
                description: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`/api/sanctions/${sanctionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal menghapus sanksi.');
            }

            toast({
                title: 'Sukses',
                description: 'Sanksi berhasil dihapus.',
            });

            // Refresh the sanctions data
            mutate();
        } catch (error) {
            toast({
                title: 'Gagal',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus sanksi.',
                variant: 'destructive',
            });
        }
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Daftar Sanksi</h1>
                    {canPerformActions && (
                        <SanctionForm>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Sanksi
                            </Button>
                        </SanctionForm>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Tabel Sanksi Berdasarkan Poin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Pembinaan</TableHead>
                                    <TableHead className="w-[200px]">Rentang Poin</TableHead>
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
                                        <TableCell colSpan={canPerformActions ? 4 : 3} className="text-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                            <p className="mt-2">Memuat data sanksi...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : data && data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canPerformActions ? 4 : 3} className="text-center py-10">
                                            Tidak ada data sanksi.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data &&
                                    currentSanctions.map((sanction: Sanction, index: number) => (
                                        <TableRow key={sanction.id}>
                                            <TableCell className="font-medium">
                                                {startIndex + index + 1}
                                            </TableCell>
                                            <TableCell>{sanction.pembinaan}</TableCell>
                                            <TableCell>{sanction.start_poin}-{sanction.end_poin}</TableCell>
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
                                                                <span className="sr-only">
                                                                    Toggle menu
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <SanctionForm sanction={sanction}>
                                                                <DropdownMenuItem
                                                                    onSelect={(e) => e.preventDefault()}
                                                                >
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            </SanctionForm>
                                                            <DeleteConfirmationDialog
                                                                onConfirm={() =>
                                                                    handleDelete(sanction.id)
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
