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
import type { Student, Classes } from '@/lib/data';
import { useSWRConfig } from 'swr';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi minimal 3 karakter.'),
    nis: z
        .string()
        .min(4, 'NIS harus diisi minimal 4 digit.')
        .regex(/^\d+$/, 'NIS hanya boleh berisi angka.'),
    class_id: z.string().min(1, 'Kelas harus dipilih.'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type StudentFormProps = {
    children: React.ReactNode;
    student?: Student;
};

export function StudentForm({ children, student }: StudentFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const isEditMode = !!student;

    // Fetch classes from API
    const { data: classes } = useSWR<Classes[]>('/api/classes', fetcher);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            nis: '',
            class_id: '',
            phone: '',
            address: '',
        },
    });

    useEffect(() => {
        if (isEditMode && student) {
            form.reset({
                name: student.name,
                nis: String(student.nis),
                class_id: student.class_id || '',
                phone: student.phone || '',
                address: student.address || '',
            });
        } else {
            form.reset({
                name: '',
                nis: '',
                class_id: '',
                phone: '',
                address: '',
            });
        }
    }, [isEditMode, student, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch(
                isEditMode ? `/api/students/${student?.id}` : '/api/students',
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
                    ? `Data siswa "${values.name}" berhasil diperbarui.`
                    : `Siswa baru "${values.name}" berhasil ditambahkan.`,
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
                            name="name"
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
                            name="class_id"
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
                                            {classes?.map((classItem) => (
                                                <SelectItem key={classItem.id} value={classItem.id}>
                                                    {classItem.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>No. Telepon (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: 081234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Alamat (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Jl. Merdeka No. 123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading || !classes || classes.length === 0}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
