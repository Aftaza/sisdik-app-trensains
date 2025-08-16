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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSWRConfig } from 'swr';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Violation, Teacher, ViolationType } from '@/lib/data';

const formSchema = z.object({
    jenis_pelanggaran: z.string().min(1, 'Jenis pelanggaran harus diisi.'),
    tanggal_terjadi: z.date({ required_error: 'Tanggal kejadian harus diisi.' }),
    catatan: z.string().min(10, 'Catatan harus diisi minimal 10 karakter.'),
    guru_bk: z.string().min(1, 'Guru BK harus dipilih.'),
    poin: z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number().int().min(1, 'Poin harus berupa angka positif.')
    ),
    violationTypeId: z.string().optional(),
});

type ViolationLogFormProps = {
    children: React.ReactNode;
    studentId: string;
    violation?: Violation;
};

export function ViolationLogForm({ children, studentId, violation }: ViolationLogFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const { data: session } = useSession();
    const isEditMode = !!violation;

    // Check user roles
    const userRole = session?.user?.jabatan;
    const canPerformActions = userRole === 'Admin' || userRole === 'Guru BK';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jenis_pelanggaran: '',
            tanggal_terjadi: new Date(),
            catatan: '',
            guru_bk: '',
            poin: 0,
            violationTypeId: '',
        },
    });

    // Fetch teachers with BK role
    const { data: teachers, isLoading: teachersLoading } = useSWR<Teacher[]>(
        '/api/teachers',
        fetcher
    );
    const bkTeachers = teachers?.filter((teacher) => teacher.jabatan === 'Guru BK') || [];

    // Fetch violation types
    const { data: violationTypes, isLoading: violationTypesLoading } = useSWR<ViolationType[]>(
        '/api/violations-type',
        fetcher
    );

    // Handle violation type selection
    const handleViolationTypeChange = (value: string) => {
        form.setValue('violationTypeId', value);

        if (value) {
            const selectedType = violationTypes?.find((type) => type.id.toString() === value);
            if (selectedType) {
                form.setValue('jenis_pelanggaran', selectedType.nama_pelanggaran);
                form.setValue('poin', selectedType.poin);
            }
        } else {
            form.setValue('jenis_pelanggaran', '');
            form.setValue('poin', 0);
        }
    };

    useEffect(() => {
        if (open) {
            if (isEditMode && violation) {
                // Find violation type by name and points to preselect
                const matchingType = violationTypes?.find(
                    (type) =>
                        type.nama_pelanggaran === violation.jenis_pelanggaran &&
                        type.poin === violation.poin
                );

                form.reset({
                    jenis_pelanggaran: violation.jenis_pelanggaran,
                    tanggal_terjadi: new Date(violation.tanggal_terjadi),
                    catatan: violation.catatan,
                    guru_bk: violation.guru_bk,
                    poin: violation.poin,
                    violationTypeId: matchingType ? matchingType.id.toString() : '',
                });
            } else {
                form.reset({
                    jenis_pelanggaran: '',
                    tanggal_terjadi: new Date(),
                    catatan: '',
                    guru_bk: '',
                    poin: undefined,
                    violationTypeId: '',
                });
            }
        }
    }, [open, isEditMode, violation, violationTypes, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const endpoint = isEditMode ? '/api/violations-log' : '/api/violations-log';
            const method = isEditMode ? 'PUT' : 'POST';

            const body = {
                id: isEditMode ? violation?.id : undefined,
                nis_siswa: studentId,
                jenis_pelanggaran: values.jenis_pelanggaran,
                tanggal_terjadi: values.tanggal_terjadi.toISOString().split('T')[0],
                catatan: values.catatan,
                guru_bk: values.guru_bk,
                poin: values.poin,
            };

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.message ||
                        `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} pelanggaran.`
                );
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? 'Data pelanggaran berhasil diperbarui.'
                    : 'Data pelanggaran berhasil disimpan.',
            });

            // Refresh the violations data
            mutate(`/api/violations-log/${studentId}`);
            setOpen(false);
        } catch (error) {
            toast({
                title: 'Gagal',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menyimpan data pelanggaran.',
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
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Pelanggaran' : 'Formulir Pelanggaran Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui detail pelanggaran di bawah ini.'
                            : 'Catat pelanggaran siswa dengan mengisi formulir di bawah ini.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="violationTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipe Pelanggaran (Opsional)</FormLabel>
                                    <Select
                                        onValueChange={handleViolationTypeChange}
                                        value={field.value}
                                        disabled={violationTypesLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih tipe pelanggaran" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {violationTypes?.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={type.id.toString()}
                                                >
                                                    {type.nama_pelanggaran} (+{type.poin} poin)
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
                            name="jenis_pelanggaran"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jenis Pelanggaran</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Keterlambatan" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tanggal_terjadi"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Tanggal Kejadian</FormLabel>
                                    <FormControl>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="catatan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Catatan Tambahan</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Jelaskan detail kejadian pelanggaran..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="guru_bk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Guru BK</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={teachersLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih guru BK" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bkTeachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.nama}>
                                                    {teacher.nama}
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
                            name="poin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Poin Pelanggaran</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Contoh: 10"
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
