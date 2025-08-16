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
import type { ViolationType, Teacher } from '@/lib/data';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useSession } from 'next-auth/react';

const formSchema = z.object({
    name: z.string().min(3, 'Nama pelanggaran harus diisi minimal 3 karakter.'),
    category: z.string().min(1, 'Kategori harus dipilih.'),
    start_point: z.coerce.number().min(0, 'Poin awal harus diisi dan tidak boleh negatif.'),
    end_point: z.coerce.number().min(0, 'Poin akhir harus diisi dan tidak boleh negatif.'),
}).refine((data) => data.end_point >= data.start_point, {
    message: 'Poin akhir harus lebih besar atau sama dengan poin awal.',
    path: ['end_point'],
});

type ViolationTypeFormProps = {
    children: React.ReactNode;
    violationType?: ViolationType;
    onSuccess?: () => void;
};

const categoryOptions = ['Ringan', 'Sedang', 'Berat', 'Meninggalkan Kewajiban'];

export function ViolationTypeForm({ children, violationType, onSuccess }: ViolationTypeFormProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { data: session } = useSession();
    const isEditMode = !!violationType;
    const { data: teachers, isLoading } = useSWR<Teacher[]>('/api/teachers', fetcher);

    const creatorOptions = teachers?.map((teacher: Teacher) => ({ value: teacher.nama, label: teacher.nama }));

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            category: '',
            start_point: 0,
            end_point: 0,
        },
    });

    useEffect(() => {
        if (isEditMode && violationType) {
            form.reset({
                name: violationType.nama_pelanggaran,
                category: violationType.kategori,
                start_point: violationType.poin || 0,
                end_point: violationType.poin || 0,
            });
        } else {
            form.reset({
                name: '',
                category: '',
                start_point: 0,
                end_point: 0,
            });
        }
    }, [isEditMode, violationType, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Get the creator name from session
            const creatorName = session?.user?.nama || 'Unknown';
            
            let response;
            
            if (isEditMode) {
                // Edit mode - PUT request to /api/violations-type/[id]
                response = await fetch(`/api/violations-type/${violationType?.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nama_pelanggaran: values.name,
                        kategori: values.category,
                        start_point: values.start_point,
                        end_point: values.end_point,
                        pembuat: creatorName,
                    }),
                });
            } else {
                // Add mode - POST request to /api/violations-type
                response = await fetch('/api/violations-type', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nama_pelanggaran: values.name,
                        kategori: values.category,
                        start_point: values.start_point,
                        end_point: values.end_point,
                        pembuat: creatorName,
                    }),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} tipe pelanggaran`);
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? `Tipe pelanggaran "${values.name}" berhasil diperbarui.`
                    : `Tipe pelanggaran "${values.name}" berhasil ditambahkan.`,
            });
            
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan tidak terduga',
                variant: 'destructive',
            });
        }
    }

    // Get the creator name from session
    const creatorName = session?.user?.nama || 'Unknown';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Tipe Pelanggaran' : 'Formulir Tipe Pelanggaran'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui data untuk tipe pelanggaran ini.'
                            : 'Isi data untuk tipe pelanggaran baru.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Pelanggaran</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Terlambat" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categoryOptions.map((opt: string) => (
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
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_point"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Poin Awal</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Contoh: 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="end_point"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Poin Akhir</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Contoh: 5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <FormLabel>Dibuat Oleh</FormLabel>
                            <div className="rounded-md border border-input px-3 py-2 text-sm">
                                {creatorName}
                            </div>
                        </div>
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
