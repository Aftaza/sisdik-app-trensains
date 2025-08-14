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
// import { ViolationTypeForm } from '@/components/violation-type-form';
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

const ROWS_PER_PAGE = 10;

export default function ViolationTypesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, error, isLoading } = useSWR('/api/violations-type', fetcher);

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

    const handleDelete = (violationTypeId: string) => {
        console.log(`Deleting violation type with id: ${violationTypeId}`);
        // Implement deletion logic here
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Tipe Pelanggaran</h1>
                    {/* <ViolationTypeForm> */}
                        <Button>
                            <PlusCircle />
                            Tambah Tipe
                        </Button>
                    {/* </ViolationTypeForm> */}
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
                                    <TableHead>Poin</TableHead>
                                    <TableHead>Dibuat Oleh</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Aksi</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                            <p className="mt-2">Memuat data tipe pelanggaran...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : currentViolationTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            Tidak ada data tipe pelanggaran.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentViolationTypes.map((type: ViolationType) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.nama_pelanggaran}</TableCell>
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
                                                    {type.kategori}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">{type.poin}</Badge>
                                            </TableCell>
                                            <TableCell>{type.pembuat}</TableCell>
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
                                                        {/* <ViolationTypeForm violationType={type}> */}
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                        {/* </ViolationTypeForm> */}
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
