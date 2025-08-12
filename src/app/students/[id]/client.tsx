
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ViolationForm } from '@/components/violation-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronLeft, ChevronRight, SquareCheck, SquareX, MoreVertical } from 'lucide-react';
import type { Student, Violation } from '@/lib/data';
import { sanctionsData } from '@/lib/data';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

type StudentProfileClientProps = {
    student: Student;
    violations: Violation[];
};

const ROWS_PER_PAGE = 5;

function SanctionsCard({ totalPoints }: { totalPoints: number }) {
  const [completedSanctions, setCompletedSanctions] = useState<Set<string>>(new Set());

  const handleToggleSanction = (sanctionId: string) => {
    setCompletedSanctions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sanctionId)) {
        newSet.delete(sanctionId);
      } else {
        newSet.add(sanctionId);
      }
      return newSet;
    });
  };

  const getApplicableSanctions = () => {
    return sanctionsData.map(sanction => {
      const range = sanction.pointRange;
      let isApplicable = false;

      if (range.startsWith('>')) {
        const point = parseInt(range.substring(1));
        if (totalPoints > point) {
          isApplicable = true;
        }
      } else {
        const [min, max] = range.split('-').map(Number);
        if (totalPoints >= min && totalPoints <= max) {
          isApplicable = true;
        }
      }
      
      const isCompleted = completedSanctions.has(sanction.id);

      return { ...sanction, isApplicable, isCompleted };
    });
  };

  const applicableSanctions = getApplicableSanctions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {applicableSanctions.map((sanction) => (
            <li 
              key={sanction.id} 
              className="flex items-start gap-4 cursor-pointer p-2 -m-2 rounded-lg hover:bg-accent" 
              onClick={() => handleToggleSanction(sanction.id)}
            >
              <div>
                {sanction.isCompleted ? (
                  <SquareCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <SquareX className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className={`font-medium ${sanction.isApplicable ? 'text-destructive' : ''}`}>
                  {sanction.coaching}
                </p>
                <p className="text-sm text-muted-foreground">Rentang Poin: {sanction.pointRange}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function StudentProfileClient({ student, violations: studentViolations }: StudentProfileClientProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(studentViolations.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentViolations = studentViolations.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = (violationId: string) => {
        console.log(`Deleting violation with id: ${violationId}`);
        // Implement deletion logic here
    };


  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">{student.name}</h1>
            <p className="text-muted-foreground">
              {student.nis} • {student.class}
            </p>
          </div>
          <Card className="w-full max-w-xs bg-destructive/10 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Total Poin Pelanggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-destructive">{student.totalPoints}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-start">
            <ViolationForm studentId={student.id}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Catat Pelanggaran
                </Button>
            </ViolationForm>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Pelanggaran</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis Pelanggaran</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead className="text-right">Poin</TableHead>
                      <TableHead>
                        <span className="sr-only">Aksi</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentViolations.length > 0 ? (
                      currentViolations.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{v.type}</Badge>
                          </TableCell>
                          <TableCell>{v.notes}</TableCell>
                          <TableCell className="text-right font-medium">
                            <Badge variant="destructive" className="text-xs">
                              +{v.points}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <ViolationForm violation={v} studentId={student.id}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                                </ViolationForm>
                                <DeleteConfirmationDialog onConfirm={() => handleDelete(v.id)}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Hapus</DropdownMenuItem>
                                </DeleteConfirmationDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Tidak ada riwayat pelanggaran.
                        </TableCell>
                      </TableRow>
                    )}
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
          <div className="lg:col-span-1">
             <SanctionsCard totalPoints={student.totalPoints} />
          </div>
        </div>
      </div>
  );
}
