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
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Violation {
    id: number;
    tanggal_terjadi: string;
    nis_siswa: string;
    id_siswa: string;
    nama_siswa: string;
    jenis_pelanggaran: string;
    catatan: string;
    pelapor: string;
    guru_bk: string;
}

const ROWS_PER_PAGE = 10;

export default function ViolationLogsPage() {
    const { data: violations, error } = useSWR<Violation[]>('/api/violations-log', fetcher);
    const [currentPage, setCurrentPage] = useState(1);

    if (error) return <div>Failed to load violations</div>;
    if (!violations) return <div>Loading...</div>;

    const totalPages = Math.ceil(violations.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentViolations = violations.slice(startIndex, endIndex);

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
                                    <TableHead>Catatan</TableHead>
                                    <TableHead>Pelapor</TableHead>
                                    <TableHead>Guru BK</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentViolations.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>
                                            {new Date(v.tanggal_terjadi).toLocaleDateString(
                                                'id-ID',
                                                {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </TableCell>
                                        <TableCell>{v.nis_siswa}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={`/students/${v.id_siswa}`}
                                                className="font-medium hover:underline"
                                            >
                                                {v.nama_siswa}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{v.jenis_pelanggaran}</Badge>
                                        </TableCell>
                                        <TableCell>{v.catatan}</TableCell>
                                        <TableCell>{v.pelapor}</TableCell>
                                        <TableCell>{v.guru_bk}</TableCell>
                                    </TableRow>
                                ))}
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
