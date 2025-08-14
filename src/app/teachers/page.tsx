'use client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlusCircle, MoreVertical } from 'lucide-react';
import RootLayout from '../dashboard/layout';
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
import { useState } from 'react';
import { TeacherForm } from '@/components/teacher-form';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

interface Teacher {
    id: number;
    nama: string;
    email: string;
    jabatan: string;
}

const ROWS_PER_PAGE = 10;

export default function TeachersPage() {
    const { data: teachers, error } = useSWR<Teacher[]>('/api/teachers', fetcher);
    const [currentPage, setCurrentPage] = useState(1);

    if (error) return <div>Failed to load teachers</div>;
    if (!teachers) return <div>Loading...</div>;

    const totalPages = Math.ceil(teachers.length / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    const currentTeachers = teachers.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handleDelete = (teacherId: number) => {
        console.log(`Deleting teacher with id: ${teacherId}`);
        // Implement deletion logic here
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold font-headline">Daftar Guru</h1>
                    <TeacherForm>
                        <Button>
                            <PlusCircle />
                            Tambah Guru
                        </Button>
                    </TeacherForm>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Semua Guru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Jabatan</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Aksi</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentTeachers.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">
                                            {teacher.nama}
                                        </TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    teacher.jabatan === 'Kepala Sekolah'
                                                        ? 'destructive'
                                                        : teacher.jabatan === 'Guru BK'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {teacher.jabatan}
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
                                                    <TeacherForm teacher={teacher}>
                                                        <DropdownMenuItem
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>
                                                    </TeacherForm>
                                                    <DeleteConfirmationDialog
                                                        onConfirm={() => handleDelete(teacher.id)}
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
