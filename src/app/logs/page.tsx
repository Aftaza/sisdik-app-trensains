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
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import RootLayout from '../dashboard/layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// Updated interface to match new API structure
interface Violation {
    id: string;
    student_id: string;
    violation_type_id: string;
    poin: number;
    reported_by: string;
    notes: string;
    created_at: string;
    updated_at: string;
    students: {
        nis: string;
        name: string;
    };
    violation_types: {
        name: string;
        poin: number;
    };
}

const ROWS_PER_PAGE = 10;

export default function ViolationLogsPage() {
    const { data: violations, error, mutate } = useSWR<Violation[]>('/api/violations-log', fetcher);
    const [currentPage, setCurrentPage] = useState(1);

    if (error) {
        return (
            <RootLayout>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold font-headline">Log Pelanggaran</h1>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Semua Catatan Pelanggaran</CardTitle>
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

    const totalPages = violations && violations.length > 0 ? Math.ceil(violations.length / ROWS_PER_PAGE) : 0;
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentViolations = violations ? violations.slice(startIndex, endIndex) : [];

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold font-headline">Log Pelanggaran</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Semua Catatan Pelanggaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead>Pelanggaran</TableHead>
                                    <TableHead>Poin</TableHead>
                                    <TableHead>Catatan</TableHead>
                                    <TableHead>Pelapor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {violations === undefined ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                                            <p className="mt-2">Memuat data log pelanggaran...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : currentViolations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            Tidak ada data log pelanggaran.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentViolations.map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell>
                                                {new Date(v.created_at).toLocaleDateString(
                                                    'id-ID',
                                                    {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    }
                                                )}
                                            </TableCell>
                                            <TableCell>{v.students?.nis || '-'}</TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/students/${v.students?.nis || v.student_id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {v.students?.name || '-'}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {v.violation_types?.name || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">
                                                    +{v.violation_types?.poin || v.poin || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {v.notes || '-'}
                                            </TableCell>
                                            <TableCell>{v.reported_by || '-'}</TableCell>
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
