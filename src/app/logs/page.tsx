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
import { violations } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import RootLayout from '../dashboard/layout';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ROWS_PER_PAGE = 10;

export default function ViolationLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);

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
                      {new Date(v.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{v.studentNis}</TableCell>
                    <TableCell>
                      <Link
                        href={`/students/${v.studentId}`}
                        className="font-medium hover:underline"
                      >
                        {v.studentName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{v.type}</Badge>
                    </TableCell>
                    <TableCell>{v.notes}</TableCell>
                    <TableCell>{v.reporter}</TableCell>
                    <TableCell>{v.counselor}</TableCell>
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
