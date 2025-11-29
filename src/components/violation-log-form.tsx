'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Violation, Teacher, ViolationType, Student } from '@/lib/data';

// Updated form schema to match new API
const formSchema = z.object({
    student_id: z.string().uuid('Student ID harus valid'),
    violation_type_id: z.string().uuid('Violation Type ID harus valid'),
    reporting_teacher_id: z.string().uuid('Teacher ID harus valid'),
    notes: z.string().min(10, 'Catatan harus diisi minimal 10 karakter'),
});

type ViolationLogFormProps = {
    children: React.ReactNode;
    student?: Student;
    violation?: Violation;
};

export function ViolationLogForm({ children, student, violation }: ViolationLogFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const isEditMode = !!violation;
    const isStudentSpecific = !!student;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            student_id: student?.id || '',
            violation_type_id: '',
            reporting_teacher_id: '',
            notes: '',
        },
    });

    // Fetch all students (only if not student-specific)
    const { data: allStudents, isLoading: allStudentsLoading } = useSWR<Student[]>(
        !isStudentSpecific ? '/api/students' : null,
        fetcher
    );

    // Fetch teachers
    const { data: teachers, isLoading: teachersLoading } = useSWR<Teacher[]>(
        '/api/teachers',
        fetcher
    );
    const bkTeachers = teachers?.filter((teacher) => teacher.role === 'Guru BK') || [];

    // Fetch violation types
    const { data: violationTypes, isLoading: violationTypesLoading } = useSWR<ViolationType[]>(
        '/api/violations-type',
        fetcher
    );

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            if (isEditMode && violation) {
                form.reset({
                    student_id: violation.student_id,
                    violation_type_id: violation.violation_type_id,
                    reporting_teacher_id: violation.reporting_teacher_id,
                    notes: violation.notes || '',
                });
            } else {
                form.reset({
                    student_id: student?.id || '',
                    violation_type_id: '',
                    reporting_teacher_id: '',
                    notes: '',
                });
            }
            form.clearErrors();
        }
    }, [open, isEditMode, violation, form, student]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const endpoint = isEditMode 
                ? `/api/violations-log/${violation?.id}` 
                : '/api/violations-log';
            const method = isEditMode ? 'PUT' : 'POST';

            const body = {
                student_id: values.student_id,
                violation_type_id: values.violation_type_id,
                // reporting_teacher_id: values.reporting_teacher_id,
                notes: values.notes,
            };

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message ||
                    `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} pelanggaran.`
                );
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? 'Data pelanggaran berhasil diperbarui.'
                    : 'Data pelanggaran berhasil disimpan.',
            });

            // Refresh data
            if (isStudentSpecific && student) {
                mutate(`/api/violations-log/nis/${student.nis}`);
                mutate(`/api/students/nis/${student.nis}`);
                mutate(`/api/sanctions/nis/${student.nis}`);
            } else {
                mutate('/api/violations-log');
                mutate('/api/students');
            }
            
            setOpen(false);
            form.reset();
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menyimpan data pelanggaran.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                asChild
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(true);
                }}
            >
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Pelanggaran' : 'Formulir Pelanggaran Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui detail pelanggaran di bawah ini.'
                            : 'Catat pelanggaran siswa dengan mengisi formulir di bawah ini.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Student Selection */}
                        <FormField
                            control={form.control}
                            name="student_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Siswa</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isStudentSpecific || allStudentsLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih siswa" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isStudentSpecific && student ? (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.name}
                                                </SelectItem>
                                            ) : (
                                                allStudents?.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name} ({s.classes?.name || '-'})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Violation Type Selection */}
                        <FormField
                            control={form.control}
                            name="violation_type_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe Pelanggaran</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={violationTypesLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe pelanggaran" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {violationTypes?.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name} (+{type.poin} poin)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Reporting Teacher Selection */}
                        <FormField
                            control={form.control}
                            name="reporting_teacher_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guru BK</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={teachersLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih guru BK" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bkTeachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan Tambahan</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Jelaskan detail kejadian pelanggaran..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}