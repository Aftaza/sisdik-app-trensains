'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreVertical, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { ViolationLogForm } from '@/components/violation-log-form';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import type { Violation, Student } from '@/lib/data';

const VIOLATIONS_PER_PAGE = 5;

type StudentViolationsTableProps = {
    violations: Violation[];
    isLoading: boolean;
    student: Student | undefined;
    onDelete: (violationId: string) => Promise<void>;
};

export function StudentViolationsTable({
    violations,
    isLoading,
    student,
    onDelete,
}: StudentViolationsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const { data: session } = useSession();

    // Check user roles
    const userRole = session?.user?.role;
    const canPerformDelete = userRole === 'Admin' || userRole === 'Guru BK';

    // Handle both array and object responses from API
    const validViolations = useMemo(() => {
        if (!violations) return [];

        // If API returns { data: [...] }
        if (typeof violations === 'object' && 'data' in violations) {
            const data = (violations as any).data;
            return Array.isArray(data) ? data : [];
        }

        // If API returns array directly
        if (Array.isArray(violations)) {
            return violations;
        }

        return [];
    }, [violations]);

    const totalPages = Math.ceil(validViolations.length / VIOLATIONS_PER_PAGE);
    const startIndex = (currentPage - 1) * VIOLATIONS_PER_PAGE;
    const endIndex = startIndex + VIOLATIONS_PER_PAGE;
    const currentViolations = validViolations.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (violationId: string) => {
        if (!canPerformDelete) {
            toast({
                title: 'Akses Ditolak',
                description: 'Hanya admin dan guru BK yang dapat menghapus pelanggaran.',
                variant: 'destructive',
            });
            return;
        }

        await onDelete(violationId);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Pelanggaran</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal Terjadi</TableHead>
                                <TableHead>Jenis Pelanggaran</TableHead>
                                <TableHead>Catatan</TableHead>
                                <TableHead className="text-right">Poin</TableHead>
                                {canPerformDelete && (
                                    <TableHead>
                                        <span className="sr-only">Aksi</span>
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentViolations.length > 0 ? (
                                currentViolations.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>
                                            {new Date(v.created_at).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>{v.violation_types?.name || '-'}</TableCell>
                                        <TableCell>{v.notes || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="destructive">
                                                {v.violation_types?.poin || 0}
                                            </Badge>
                                        </TableCell>
                                        {canPerformDelete && (
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
                                                        <ViolationLogForm
                                                            student={student}
                                                            violation={v}
                                                        >
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </ViolationLogForm>
                                                        <DeleteConfirmationDialog
                                                            onConfirm={() => handleDelete(v.id)}
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
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={canPerformDelete ? 5 : 4}
                                        className="text-center"
                                    >
                                        Tidak ada data pelanggaran.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
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
    );
}
