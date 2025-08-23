'use client';

import { Badge } from '@/components/ui/badge';
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
import {
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    SquareCheck,
    SquareX,
    MoreVertical,
    Loader2,
} from 'lucide-react';
import type { Sanction, Student, Violation } from '@/lib/data';
import { useEffect, useMemo, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { ViolationLogForm } from '@/components/violation-log-form';
import { AttendanceForm } from '@/components/attendance-form';

type StudentProfileClientProps = {
    id: string;
};

interface SanctionsResponse {
    status: string | undefined;
    start_poin: number;
    end_poin: number;
    pembinaan: string[];
}

const VIOLATIONS_PER_PAGE = 5;
const ATTENDANCE_PER_PAGE = 5;

// Komponen SanctionsCard
function SanctionsCard({ studentId }: { studentId: string | undefined }) {
    const {
        data: sanctionsData,
        error: sanctionError,
        isLoading: sanctionLoading,
    } = useSWR<SanctionsResponse>(studentId ? `/api/sanctions/${studentId}` : null, fetcher);
    const { toast } = useToast();

    // ✅ PERBAIKAN: Gunakan localStorage untuk inisialisasi state
    const [completedSanctions, setCompletedSanctions] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined' && studentId) {
            const stored = localStorage.getItem(`completed-sanctions-${studentId}`);
            if (stored) {
                try {
                    // Pastikan data yang disimpan adalah array yang valid
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        return new Set(parsed);
                    }
                } catch (e) {
                    console.error('Failed to parse localStorage data:', e);
                }
            }
        }
        return new Set();
    });

    useEffect(() => {
        if (studentId) {
            localStorage.setItem(
                `completed-sanctions-${studentId}`,
                JSON.stringify(Array.from(completedSanctions))
            );
        }
    }, [completedSanctions, studentId]);

    const handleToggleSanction = (sanction: string) => {
        setCompletedSanctions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sanction)) {
                newSet.delete(sanction);
            } else {
                newSet.add(sanction);
            }
            return newSet;
        });
        toast({
            title: 'Status Pembinaan Diperbarui',
            description: completedSanctions.has(sanction)
                ? `"${sanction}" ditandai belum selesai.`
                : `"${sanction}" ditandai sudah selesai.`,
        });
    };

    if (sanctionLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (sanctionError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground p-6">
                    Data tidak ditemukan.
                </CardContent>
            </Card>
        );
    }

    if (
        !sanctionsData ||
        sanctionsData.status === 'error' ||
        sanctionsData.pembinaan.length === 0
    ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground p-6">
                    Tidak ada sanksi yang berlaku.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                    Rentang Poin: {sanctionsData.start_poin}-{sanctionsData.end_poin}
                </p>
                <ul className="space-y-4">
                    {sanctionsData.pembinaan.map((pembinaan, index) => {
                        const isCompleted = completedSanctions.has(pembinaan);
                        return (
                            <li
                                key={index}
                                className="flex items-start gap-4 cursor-pointer p-2 -m-2 rounded-lg hover:bg-accent"
                                onClick={() => handleToggleSanction(pembinaan)}
                            >
                                <div>
                                    {isCompleted ? (
                                        <SquareCheck className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <SquareX className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{pembinaan}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}

function AttendanceLogCard({ studentId }: { studentId: string }) {
    const [currentPage, setCurrentPage] = useState(1);
    const studentAttendance = dailyAttendanceData.filter((att) => att.studentId === studentId);

    const totalPages = Math.ceil(studentAttendance.length / ATTENDANCE_PER_PAGE);
    const startIndex = (currentPage - 1) * ATTENDANCE_PER_PAGE;
    const endIndex = startIndex + ATTENDANCE_PER_PAGE;
    const currentAttendance = studentAttendance.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = (attendanceId: string) => {
        console.log(`Deleting attendance log with id: ${attendanceId}`);
    };

    const getBadgeVariant = (status: DailyAttendance['status']) => {
        switch (status) {
            case 'Hadir':
                return 'secondary';
            case 'Sakit':
                return 'default';
            case 'Alpha':
                return 'destructive';
            default:
                return 'secondary';
        }
    };
    const getBadgeClass = (status: DailyAttendance['status']) => {
        switch (status) {
            case 'Hadir':
                return 'bg-green-100 text-green-800';
            case 'Sakit':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Log Absensi Harian</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>
                                <span className="sr-only">Aksi</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentAttendance.length > 0 ? (
                            currentAttendance.map((att) => (
                                <TableRow key={att.id}>
                                    <TableCell>
                                        {new Date(att.date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getBadgeVariant(att.status)}
                                            className={getBadgeClass(att.status)}
                                        >
                                            {att.status}
                                        </Badge>
                                    </TableCell>
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
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    Tidak ada data absensi.
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
    );
}

// Komponen StudentProfileClient
export function StudentProfileClient({ id }: StudentProfileClientProps) {
    const {
        data: student,
        error: studentError,
        isLoading: studentLoading,
    } = useSWR<Student>(`/api/students/${id}`, fetcher);
    const {
        data: studentViolations,
        error: studentViolationsError,
        isLoading: violationsLoading,
    } = useSWR<Violation[]>(`/api/violations-log/${id}`, fetcher);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data: session } = useSession();

    const [currentPage, setCurrentPage] = useState(1);

    // Check user roles
    const userRole = session?.user?.jabatan;
    const canPerformDelete = userRole === 'Admin' || userRole === 'Guru BK';

    // 🚨 PERBAIKAN: Menambahkan guard clause untuk menghindari error saat data undefined
    const violations = studentViolations || [];
    const totalPages = Math.ceil(violations.length / VIOLATIONS_PER_PAGE);
    const startIndex = (currentPage - 1) * VIOLATIONS_PER_PAGE;
    const endIndex = startIndex + VIOLATIONS_PER_PAGE;
    const currentViolations = violations.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = async (violationId: number) => {
        // Check if user has permission to delete
        if (!canPerformDelete) {
            toast({
                title: 'Akses Ditolak',
                description: 'Hanya admin dan guru BK yang dapat menghapus pelanggaran.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`/api/violations-log/${violationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal menghapus pelanggaran.');
            }

            toast({
                title: 'Sukses',
                description: 'Pelanggaran berhasil dihapus.',
            });

            // Refresh the violations data
            mutate(`/api/violations-log/${id}`);
            mutate(`/api/students/${id}`);
            mutate(`/api/sanctions/${id}`);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menghapus pelanggaran.',
                variant: 'destructive',
            });
        }
    };

    const totalPoints = student?.total_poin;

    const getPointsCardClassName = () => {
        if (typeof totalPoints !== 'number' || totalPoints === 0) {
            return 'bg-gray-100 border-gray-200';
        }
        if (totalPoints > 0 && totalPoints <= 50) {
            return 'bg-yellow-100 border-yellow-200';
        } else {
            return 'bg-destructive/10 border-destructive/20';
        }
    };

    const getPointsTextClassName = () => {
        if (typeof totalPoints !== 'number' || totalPoints === 0) {
            return 'text-gray-500';
        }
        if (totalPoints > 0 && totalPoints <= 50) {
            return 'text-yellow-600';
        } else {
            return 'text-destructive';
        }
    };

    if (studentLoading || violationsLoading) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 mx-auto" />
                <p className="text-center text-muted-foreground">Memuat data siswa...</p>
            </div>
        );
    }

    if (studentError || studentViolationsError) {
        return (
            <div className="flex flex-col gap-4 p-4">
                <p className="text-center text-muted-foreground">Data siswa tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{student?.nama_lengkap}</h1>
                    <p className="text-muted-foreground">
                        {student?.nis} • {student?.kelas}
                    </p>
                </div>
                <Card className={`w-full max-w-xs ${getPointsCardClassName()}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className={`text-sm font-medium ${getPointsTextClassName()}`}>
                            Total Poin Pelanggaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-5xl font-bold ${getPointsTextClassName()}`}>
                            {totalPoints}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-start gap-2">
                <ViolationLogForm student={student}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Catat Pelanggaran
                    </Button>
                </ViolationLogForm>
                <AttendanceForm student={student}>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Absensi
                    </Button>
                </AttendanceForm>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Pelanggaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {violationsLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <div
                                        className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin"
                                        style={{ borderTopColor: 'black' }}
                                    />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal Terjadi</TableHead>
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
                                                    <TableCell>
                                                        {new Date(
                                                            v.tanggal_terjadi
                                                        ).toLocaleDateString('id-ID')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {v.jenis_pelanggaran}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{v.catatan}</TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-xs"
                                                        >
                                                            +{v.poin}
                                                        </Badge>
                                                    </TableCell>
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
                                                                <ViolationLogForm
                                                                    violation={v}
                                                                    student={student}
                                                                >
                                                                    <DropdownMenuItem
                                                                        onSelect={(e) =>
                                                                            e.preventDefault()
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                </ViolationLogForm>
                                                                {canPerformDelete && (
                                                                    <DeleteConfirmationDialog
                                                                        onConfirm={() =>
                                                                            handleDelete(v.id)
                                                                        }
                                                                    >
                                                                        <DropdownMenuItem
                                                                            onSelect={(e) =>
                                                                                e.preventDefault()
                                                                            }
                                                                            className="text-destructive focus:text-destructive"
                                                                        >
                                                                            Hapus
                                                                        </DropdownMenuItem>
                                                                    </DeleteConfirmationDialog>
                                                                )}
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
                </div>
                <div className="lg:col-span-1">
                    <SanctionsCard studentId={id} />
                </div>
            </div>
        </div>
    );
}
