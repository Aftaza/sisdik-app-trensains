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
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Student } from '@/lib/data';
import { DatePicker } from './ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useSWRConfig } from 'swr';

const formSchema = z.object({
    studentId: z.string(),
    studentName: z.string(),
    studentNis: z.string(),
    date: z.date({ required_error: 'Tanggal harus diisi.' }),
    status: z.enum(['Hadir', 'Sakit', 'Alpha'], { required_error: 'Status harus dipilih.' }),
});

type AttendanceFormValues = z.infer<typeof formSchema>;

type AttendanceFormProps = {
    children: React.ReactNode;
    student: Student;
    attendance?: any; // For edit mode
};

export function AttendanceForm({ children, student, attendance }: AttendanceFormProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();

    const form = useForm<AttendanceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: student?.id?.toString() || '',
            studentName: student?.nama_lengkap || '',
            studentNis: student?.nis?.toString() || '',
            date: new Date(),
            status: undefined,
        },
    });

    useEffect(() => {
        if (open) {
            if (attendance) {
                // Edit mode
                form.reset({
                    studentId: attendance.studentId?.toString() || student?.id?.toString() || '',
                    studentName: attendance.studentName || student?.nama_lengkap || '',
                    studentNis: attendance.studentNis?.toString() || student?.nis?.toString() || '',
                    date: attendance.date ? new Date(attendance.date) : new Date(),
                    status: attendance.status || undefined,
                });
            } else {
                // Create mode
                form.reset({
                    studentId: student?.id?.toString() || '',
                    studentName: student?.nama_lengkap || '',
                    studentNis: student?.nis?.toString() || '',
                    date: new Date(),
                    status: undefined,
                });
            }
        }
    }, [open, student, attendance, form]);

    async function onSubmit(values: AttendanceFormValues) {
        try {
            const url = attendance 
                ? `/api/attendances/${attendance.id}` 
                : '/api/attendances';
                
            const method = attendance ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    studentId: parseInt(values.studentId),
                    date: values.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal ${attendance ? 'mengedit' : 'menambah'} absensi.`);
            }

            toast({
                title: 'Sukses',
                description: `Absensi untuk ${values.studentName} pada tanggal ${values.date.toLocaleDateString()} berhasil ${attendance ? 'diedit' : 'dicatat'}.`,
            });

            // Refresh the attendance data
            mutate((key: string) => typeof key === 'string' && key.startsWith('/api/attendances'));
            
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : `Terjadi kesalahan saat ${attendance ? 'mengedit' : 'menambah'} absensi.`,
                variant: 'destructive',
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {attendance ? 'Edit Absensi' : 'Formulir Absensi Harian'}
                    </DialogTitle>
                    <DialogDescription>
                        {attendance 
                            ? 'Edit status kehadiran harian untuk siswa yang dipilih.' 
                            : 'Catat status kehadiran harian untuk siswa yang dipilih.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel>Nama Siswa</FormLabel>
                            <Input value={student?.nama_lengkap} disabled />
                        </div>
                        <div className="space-y-2">
                            <FormLabel>NIS Siswa</FormLabel>
                            <Input value={student?.nis} disabled />
                        </div>
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Tanggal</FormLabel>
                                    <FormControl>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status Kehadiran</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Hadir">Hadir</SelectItem>
                                            <SelectItem value="Sakit">Sakit</SelectItem>
                                            <SelectItem value="Alpha">Alpha</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">
                                {attendance ? 'Simpan Perubahan' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
}
