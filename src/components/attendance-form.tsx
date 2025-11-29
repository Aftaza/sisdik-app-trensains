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
import { Textarea } from './ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceDaily, Student } from '@/lib/data';
import { DatePicker } from './ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useSWRConfig } from 'swr';
import { Loader2 } from 'lucide-react';

// Updated form schema to match new API
const formSchema = z.object({
    student_id: z.string().uuid('Student ID harus valid'),
    date: z.date({ required_error: 'Tanggal harus diisi.' }),
    status: z.enum(['hadir', 'sakit', 'izin', 'alpha'], { 
        required_error: 'Status harus dipilih.' 
    }),
    notes: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof formSchema>;

type AttendanceFormProps = {
    children: React.ReactNode;
    student: Student | undefined;
    attendance?: AttendanceDaily; // For edit mode
};

export function AttendanceForm({ children, student, attendance }: AttendanceFormProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AttendanceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            student_id: student?.id || '',
            date: new Date(),
            status: undefined,
            notes: '',
        },
    });

    useEffect(() => {
        if (open) {
            if (attendance) {
                // Edit mode
                form.reset({
                    student_id: attendance.student_id || student?.id || '',
                    date: attendance.date ? new Date(attendance.date) : new Date(),
                    status: attendance.status as 'hadir' | 'sakit' | 'izin' | 'alpha',
                    notes: attendance.notes || '',
                });
            } else {
                // Create mode
                form.reset({
                    student_id: student?.id || '',
                    date: new Date(),
                    status: undefined,
                    notes: '',
                });
            }
        }
    }, [open, student, attendance, form]);

    async function onSubmit(values: AttendanceFormValues) {
        setIsSubmitting(true);
        try {
            const url = attendance 
                ? `/api/attendances/${attendance.id}` 
                : '/api/attendances';
                
            const method = attendance ? 'PUT' : 'POST';

            const body = {
                student_id: values.student_id,
                date: values.date.toISOString().split('T')[0], // Format: YYYY-MM-DD
                status: values.status,
                notes: values.notes || '',
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal ${attendance ? 'mengedit' : 'menambah'} absensi.`);
            }

            toast({
                title: 'Sukses',
                description: `Absensi untuk ${student?.name} pada tanggal ${values.date.toLocaleDateString()} berhasil ${attendance ? 'diedit' : 'dicatat'}.`,
            });

            // Refresh the attendance data
            if (student) {
                mutate(`/api/attendances/get-nis/${student.nis}`);
            }
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
        } finally {
            setIsSubmitting(false);
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
                        {/* Student Name (Read-only) */}
                        <div className="space-y-2">
                            <FormLabel>Nama Siswa</FormLabel>
                            <Input value={student?.name || '-'} disabled />
                        </div>

                        {/* Student NIS (Read-only) */}
                        <div className="space-y-2">
                            <FormLabel>NIS Siswa</FormLabel>
                            <Input value={student?.nis || '-'} disabled />
                        </div>

                        {/* Date Picker */}
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

                        {/* Status Selection */}
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
                                            <SelectItem value="hadir">Hadir</SelectItem>
                                            <SelectItem value="sakit">Sakit</SelectItem>
                                            <SelectItem value="izin">Izin</SelectItem>
                                            <SelectItem value="alpha">Alpha</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Notes (Optional) */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan (Opsional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Contoh: Sakit demam"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    attendance ? 'Simpan Perubahan' : 'Simpan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
