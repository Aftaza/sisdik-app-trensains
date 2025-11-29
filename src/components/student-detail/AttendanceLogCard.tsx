'use client';

import { useState } from 'react';
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
import { AttendanceForm } from '@/components/attendance-form';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { useSWRConfig } from 'swr';

// Updated interface to match new API
interface AttendanceDaily {
    id: string;
    student_id: string;
    date: string;
    status: 'hadir' | 'sakit' | 'izin' | 'alpha';
    notes: string;
    created_at: string;
    updated_at: string;
    students: {
        nis: string;
        name: string;
    };
}

interface AttendanceResponse {
    statusCode: number;
    message: string;
    data: AttendanceDaily[];
}

const ROWS_PER_PAGE = 5;

type AttendanceLogCardProps = {
    studentId: string;
};

export function AttendanceLogCard({ studentId }: AttendanceLogCardProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const { data: session } = useSession();
    const { mutate } = useSWRConfig();

    const {
        data: attendanceData,
        error: attendanceError,
        isLoading: attendanceLoading,
    } = useSWR<AttendanceResponse>(
        studentId ? `/api/attendances/get-nis/${studentId}` : null,
        fetcher
    );
    
    // Check user roles
    const userRole = session?.user?.role;
    const canPerformEditDelete = userRole === 'Admin' || userRole === 'Guru BK';

    // Extract attendance array from response
    const attendances = attendanceData?.data || [];
    const totalPages = Math.ceil(attendances.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentAttendances = attendances.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (attendanceId: string) => {
        if (!canPerformEditDelete) {
            toast({
                title: 'Akses Ditolak',
                description: 'Hanya admin dan guru BK yang dapat menghapus data absensi.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`/api/attendances/${attendanceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal menghapus data absensi.');
            }

            toast({
                title: 'Sukses',
                description: 'Data absensi berhasil dihapus.',
            });

            // Refresh data
            mutate(`/api/attendances/get-nis/${studentId}`);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menghapus data absensi.',
                variant: 'destructive',
            });
        }
    };

    const getBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'hadir':
                return 'secondary';
            case 'sakit':
                return 'default';
            case 'alpha':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'hadir':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'sakit':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'izin':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'alpha':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            default:
                return '';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Log Absensi Harian</CardTitle>
            </CardHeader>
            <CardContent>
                {attendanceLoading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : attendanceError ? (
                    <div className="text-center text-muted-foreground p-6">
                        Gagal memuat data absensi.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Catatan</TableHead>
                                {canPerformEditDelete && (
                                    <TableHead>
                                        <span className="sr-only">Aksi</span>
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentAttendances.length > 0 ? (
                                currentAttendances.map((att) => (
                                    <TableRow key={att.id}>
                                        <TableCell>
                                            {new Date(att.date).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getBadgeVariant(att.status)}
                                                className={getBadgeClass(att.status)}
                                            >
                                                {getStatusLabel(att.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{att.notes || '-'}</TableCell>
                                        {canPerformEditDelete && (
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
                                                        <AttendanceForm
                                                            student={att.students ? {
                                                                id: att.student_id,
                                                                nis: att.students.nis,
                                                                name: att.students.name,
                                                            } as any : {}}
                                                            attendance={att}
                                                        >
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                Edit
                                                            </DropdownMenuItem>
                                                        </AttendanceForm>
                                                        <DeleteConfirmationDialog
                                                            onConfirm={() => handleDelete(att.id)}
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
                                        colSpan={canPerformEditDelete ? 4 : 3}
                                        className="text-center"
                                    >
                                        Tidak ada data absensi.
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
