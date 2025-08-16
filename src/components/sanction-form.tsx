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
import { Textarea } from './ui/textarea';
import type { Sanction } from '@/lib/data';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useSWRConfig } from 'swr';

const formSchema = z
    .object({
        coaching: z.string().min(5, 'Deskripsi pembinaan harus diisi minimal 5 karakter.'),
        start_point: z.preprocess(
            (val) => (val === '' || val === undefined ? undefined : Number(val)),
            z.number().int().min(0, 'Poin awal harus berupa angka positif.')
        ),
        end_point: z.preprocess(
            (val) => (val === '' || val === undefined ? undefined : Number(val)),
            z.number().int().min(0, 'Poin akhir harus berupa angka positif.')
        ),
    })
    .refine((data) => data.start_point <= data.end_point, {
        message: 'Poin awal tidak boleh lebih besar dari poin akhir.',
        path: ['end_point'],
    });

type SanctionFormProps = {
    children: React.ReactNode;
    sanction?: Sanction;
};

export function SanctionForm({ children, sanction }: SanctionFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data: session } = useSession();
    const isEditMode = !!sanction;

    // Check if user has permission (Admin or Guru BK)
    const userRole = session?.user?.jabatan;
    const canPerformActions = userRole === 'Admin' || userRole === 'Guru BK';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            coaching: '',
            start_point: 0,
            end_point: 0,
        },
    });

    useEffect(() => {
        if (isEditMode && sanction) {
            form.reset({
                coaching: sanction.pembinaan,
                start_point: sanction.start_poin,
                end_point: sanction.end_poin,
            });
        } else {
            form.reset({
                coaching: '',
                start_point: 0,
                end_point: 0,
            });
        }
    }, [isEditMode, sanction, form, open]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!canPerformActions) {
            toast({
                title: 'Akses Ditolak',
                description: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const pembinaan = values.coaching.split(', ')
            const response = await fetch(isEditMode ? `/api/sanctions/${sanction?.id}` : '/api/sanctions', {
                method: isEditMode ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pembinaan: pembinaan,
                    start_poin: values.start_point,
                    end_poin: values.end_point,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} sanksi.`
                );
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? `Sanksi berhasil diperbarui.`
                    : `Sanksi baru berhasil ditambahkan.`,
            });

            // Refresh the sanctions data
            mutate('/api/sanctions');
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menyimpan data sanksi.',
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
                    if (!canPerformActions) {
                        toast({
                            title: 'Akses Ditolak',
                            description: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
                            variant: 'destructive',
                        });
                        return;
                    }
                    setOpen(true);
                }}
            >
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Sanksi' : 'Formulir Sanksi Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui data sanksi di bawah ini.'
                            : 'Isi data sanksi baru di bawah ini.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="coaching"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deskripsi Pembinaan/Sanksi</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Pisahkan dengan ', ' untuk pembinaan lebih dari satu. Contoh: Membersihkan kamar mandi, mengaji, dll."
                                            {...field}
                                        />
                                    </FormControl>
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
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(e.target.value)
                                                    )
                                                }
                                            />
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
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ''
                                                            ? ''
                                                            : Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
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
