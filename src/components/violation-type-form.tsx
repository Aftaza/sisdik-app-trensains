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
import type { ViolationType } from '@/lib/data';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(3, 'Nama pelanggaran harus diisi minimal 3 karakter.'),
    category: z.string().min(1, 'Kategori harus dipilih.'),
    points: z.coerce.number().min(1, 'Poin harus diisi dan lebih dari 0.'),
});

type ViolationTypeFormProps = {
    children: React.ReactNode;
    violationType?: ViolationType;
    onSuccess?: () => void;
};

const categoryOptions = ['Ringan', 'Sedang', 'Berat', 'Meninggalkan Kewajiban'];

export function ViolationTypeForm({ children, violationType, onSuccess }: ViolationTypeFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { data: session } = useSession();
    const isEditMode = !!violationType;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            category: '',
            points: 0,
        },
    });

    useEffect(() => {
        if (isEditMode && violationType) {
            form.reset({
                name: violationType.nama_pelanggaran,
                category: violationType.kategori,
                points: violationType.poin || 0,
            });
        } else {
            form.reset({
                name: '',
                category: '',
                points: 0,
            });
        }
    }, [isEditMode, violationType, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);
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
                        poin: values.points,
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
                        poin: values.points,
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
        } finally {
            setIsSubmitting(false);
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
                        <FormField
                            control={form.control}
                            name="points"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Poin Pelanggaran</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Contoh: 5" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                            <FormLabel>Dibuat Oleh</FormLabel>
                            <div className="rounded-md border border-input px-3 py-2 text-sm">
                                {creatorName}
                            </div>
                        </div>
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
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
