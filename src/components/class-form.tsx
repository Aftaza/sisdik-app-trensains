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
    description: z.string().optional(),
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
        session?.user?.role === 'Admin' || session?.user?.role === 'Guru BK';

    // Note: Wali Kelas field removed from new API
    // const teacherOptions = teachers?.filter((t) => t.role === 'Wali Kelas')
    //     .map((t) => ({ value: t.name, label: t.name })) || [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    useEffect(() => {
        if (isEditMode && classData) {
            form.reset({
                name: classData?.name || '',
                description: classData?.description || '',
            });
        } else {
            form.reset({
                name: '',
                description: '',
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
                name: values.name,
                description: values.description || '',
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Kelas IPA" {...field} />
                                    </FormControl>
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
