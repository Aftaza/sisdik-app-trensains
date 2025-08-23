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

const formSchema = z.object({
    studentId: z.string(),
    studentName: z.string(),
    studentNis: z.string(),
    date: z.date({ required_error: 'Tanggal harus diisi.' }),
    status: z.enum(['Hadir', 'Sakit', 'Alpha'], { required_error: 'Status harus dipilih.' }),
});

type AttendanceFormProps = {
    children: React.ReactNode;
    student: Student;
};

export function AttendanceForm({ children, student }: AttendanceFormProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            studentId: student.id,
            studentName: student.name,
            studentNis: student.nis,
            date: new Date(),
            status: undefined,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                studentId: student.id,
                studentName: student.name,
                studentNis: student.nis,
                date: new Date(),
                status: undefined,
            });
        }
    }, [open, student, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
            title: 'Sukses',
            description: `Absensi untuk ${
                student.name
            } pada tanggal ${values.date.toLocaleDateString()} berhasil dicatat.`,
        });
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Formulir Absensi Harian</DialogTitle>
                    <DialogDescription>
                        Catat status kehadiran harian untuk siswa yang dipilih.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nama Siswa</Label>
                            <Input value={student.name} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>NIS Siswa</Label>
                            <Input value={student.nis} disabled />
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
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
