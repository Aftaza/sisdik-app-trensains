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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Student } from '@/lib/data';
import { useSWRConfig } from 'swr';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    nama: z.string().min(3, 'Nama harus diisi minimal 3 karakter.'),
    nis: z
        .string()
        .min(4, 'NIS harus diisi minimal 4 digit.')
        .regex(/^\d+$/, 'NIS hanya boleh berisi angka.'),
    kelas: z.string().min(1, 'Kelas harus dipilih.'),
});

type StudentFormProps = {
    children: React.ReactNode;
    student?: Student;
    classOpt?: string[];
};

export function StudentForm({ children, student, classOpt }: StudentFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const isEditMode = !!student;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: '',
            nis: '',
            kelas: '',
        },
    });

    useEffect(() => {
        if (isEditMode && student) {
            form.reset({
                nama: student.nama_lengkap,
                nis: String(student.nis),
                kelas: student.kelas,
            });
        } else {
            form.reset({
                nama: '',
                nis: '',
                kelas: '',
            });
        }
    }, [isEditMode, student, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch(
                isEditMode ? `/api/students/${student?.nis}` : '/api/students',
                {
                    method: isEditMode ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Gagal menyimpan data siswa.');
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? `Data siswa "${values.nama}" berhasil diperbarui.`
                    : `Siswa baru "${values.nama}" berhasil ditambahkan.`,
            });
            mutate('/api/students');
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    (error as Error).message || 'Terjadi kesalahan saat menyimpan data siswa.',
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Data Siswa' : 'Formulir Siswa Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui data siswa di bawah ini.'
                            : 'Isi data siswa baru di bawah ini.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Budi Santoso" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="nis"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nomor Induk Siswa (NIS)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Contoh: 12345"
                                            {...field}
                                            disabled={isEditMode}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="kelas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kelas</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kelas" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classOpt?.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
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
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-6 w-6 animate-spin text-white mx-auto" />
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
