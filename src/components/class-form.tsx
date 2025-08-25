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
import type { Classes, Teacher } from '@/lib/data';
import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

const formSchema = z.object({
    name: z.string().min(3, 'Nama kelas harus diisi minimal 3 karakter.'),
    homeroomTeacher: z.string().min(1, 'Wali kelas harus dipilih.'),
});

type ClassFormProps = {
    children: React.ReactNode;
    classData?: Classes | undefined;
    mutate?: () => void;
};

export function ClassForm({ children, classData, mutate }: ClassFormProps) {
    const [open, setOpen] = useState(false);
    const { data: teachers, isLoading: teachersLoading } = useSWR<Teacher[]>('/api/teachers', fetcher);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: session } = useSession()
    const isEditMode = !!classData;

    const hasPermission =
        session?.user?.jabatan === 'Admin' || session?.user?.jabatan === 'Guru BK';

    const teacherOptions = teachers?.filter((t) => t.jabatan === 'Wali Kelas')
        .map((t) => ({ value: t.nama, label: t.nama })) || [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            homeroomTeacher: '',
        },
    });

    useEffect(() => {
        if (isEditMode && classData) {
            form.reset({
                name: classData?.nama_kelas,
                homeroomTeacher: classData?.wali_kelas,
            });
        } else {
            form.reset({
                name: '',
                homeroomTeacher: '',
            });
        }
    }, [isEditMode, classData, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!hasPermission) {
            toast({
                title: 'Akses Ditolak',
                description: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
                variant: 'destructive',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const url = isEditMode ? `/api/classes/${classData?.id}` : '/api/classes';
            const method = isEditMode ? 'PUT' : 'POST';
            
            const body = {
                nama_kelas: values.name,
                wali_kelas: values.homeroomTeacher,
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
                throw new Error(errorData.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambah'} kelas`);
            }

            // Revalidate data
            if (mutate) {
                mutate();
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? `Data kelas "${values.name}" berhasil diperbarui.`
                    : `Kelas baru "${values.name}" berhasil ditambahkan.`,
            });
            
            setOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || `Terjadi kesalahan saat ${isEditMode ? 'memperbarui' : 'menambah'} kelas`,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!hasPermission) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Data Kelas' : 'Formulir Kelas Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui data kelas di bawah ini.'
                            : 'Isi data untuk kelas baru.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Kelas</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: XII-A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="homeroomTeacher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wali Kelas</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={teachersLoading}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih wali kelas" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teacherOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        'Simpan'
                                    )
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
