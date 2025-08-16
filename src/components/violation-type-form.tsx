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

const formSchema = z.object({
    name: z.string().min(3, 'Nama pelanggaran harus diisi minimal 3 karakter.'),
    category: z.string().min(1, 'Kategori harus dipilih.'),
    start_point: z.coerce.number().min(0, 'Poin awal harus diisi dan tidak boleh negatif.'),
    end_point: z.coerce.number().min(0, 'Poin akhir harus diisi dan tidak boleh negatif.'),
    creator: z.string().min(1, 'Pembuat harus dipilih.'),
}).refine((data) => data.end_point >= data.start_point, {
    message: 'Poin akhir harus lebih besar atau sama dengan poin awal.',
    path: ['end_point'],
});

type ViolationTypeFormProps = {
    children: React.ReactNode;
    violationType?: ViolationType;
    onSuccess?: () => void;
};

const categoryOptions = ['Ringan', 'Sedang', 'Berat'];

export function ViolationTypeForm({ children, violationType, onSuccess }: ViolationTypeFormProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
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
            creator: '',
        },
    });

    useEffect(() => {
        if (isEditMode && violationType) {
            form.reset({
                name: violationType.nama_pelanggaran,
                category: violationType.kategori,
                start_point: violationType.poin || 0,
                end_point: violationType.poin || 0,
                creator: violationType.pembuat,
            });
        } else {
            form.reset({
                name: '',
                category: '',
                start_point: 0,
                end_point: 0,
                creator: '',
            });
        }
    }, [isEditMode, violationType, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const endpoint = isEditMode 
                ? `/api/violation-types/edit-violation-type` 
                : `/api/violation-types/add-violation-type`;
            
            const method = isEditMode ? 'PUT' : 'POST';
            
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...(isEditMode && { id: violationType?.id }),
                    nama_pelanggaran: values.name,
                    kategori: values.category,
                    start_point: values.start_point,
                    end_point: values.end_point,
                    pembuat: values.creator,
                }),
            });

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
                        <FormField
                            control={form.control}
                            name="creator"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dibuat Oleh</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih pembuat" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {creatorOptions?.map((opt: { value: string; label: string; }) => (
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
