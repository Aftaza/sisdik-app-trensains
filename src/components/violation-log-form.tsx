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
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Violation, Teacher, ViolationType, Student } from '@/lib/data';

const formSchema = z.object({
    jenis_pelanggaran: z.string().min(1, 'Jenis pelanggaran harus diisi.'),
    nama_siswa: z.string().min(1, 'Nama siswa harus dipilih.'),
    tanggal_terjadi: z.date({ required_error: 'Tanggal kejadian harus diisi.' }),
    catatan: z.string().min(10, 'Catatan harus diisi minimal 10 karakter.'),
    guru_bk: z.string().min(1, 'Guru BK harus dipilih.'),
    poin: z.preprocess(
        (val) => (val === '' || val === 0 ? 0 : Number(val)),
        z.number().int().min(1, 'Poin harus berupa angka positif.')
    ),
    violationTypeId: z.string().min(1, 'Tipe Pelanggaran harus dipilih'),
});

type ViolationLogFormProps = {
    children: React.ReactNode;
    student?: Student;
    violation?: Violation;
};

export function ViolationLogForm({ children, student, violation }: ViolationLogFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { mutate } = useSWRConfig();
    const isEditMode = !!violation;
    const isStudentSpecific = !!student;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jenis_pelanggaran: '',
            nama_siswa: student?.nama_lengkap || '',
            tanggal_terjadi: new Date(),
            catatan: '',
            guru_bk: '',
            poin: 0,
            violationTypeId: '',
        },
    });

    const { data: allStudents, isLoading: allStudentsLoading } = useSWR<Student[]>(
        !isStudentSpecific ? '/api/students' : null,
        fetcher
    );

    const { data: teachers, isLoading: teachersLoading } = useSWR<Teacher[]>(
        '/api/teachers',
        fetcher
    );
    const bkTeachers = teachers?.filter((teacher) => teacher.jabatan === 'Guru BK') || [];

    const { data: violationTypes, isLoading: violationTypesLoading } = useSWR<ViolationType[]>(
        '/api/violations-type',
        fetcher
    );

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
                const violationDateTime = new Date(violation.tanggal_terjadi);
                const matchingType = violationTypes?.find(
                    (type) =>
                        type.nama_pelanggaran === violation.jenis_pelanggaran &&
                        type.poin === violation.poin
                );

                form.reset({
                    jenis_pelanggaran: violation.jenis_pelanggaran,
                    nama_siswa: violation.nama_siswa,
                    tanggal_terjadi: violationDateTime,
                    catatan: violation.catatan,
                    guru_bk: violation.guru_bk,
                    poin: violation.poin,
                    violationTypeId: matchingType ? matchingType.id.toString() : '',
                });
            } else {
                form.reset({
                    jenis_pelanggaran: '',
                    nama_siswa: student?.nama_lengkap || '',
                    tanggal_terjadi: new Date(),
                    catatan: '',
                    guru_bk: '',
                    poin: 0,
                    violationTypeId: '',
                });
            }
            form.clearErrors();
        }
    }, [open, isEditMode, violation, violationTypes, form, student]);

    async function onSubmit(values: z.infer<typeof formSchema>) {

        setIsLoading(true);
        try {
            const endpoint = isEditMode ? `/api/violations-log/${violation?.id}` : '/api/violations-log';
            const method = isEditMode ? 'PUT' : 'POST';

            const formattedDate = values.tanggal_terjadi.toISOString();

            let selectedNis: number | undefined;
            if (isStudentSpecific) {
                selectedNis = student?.nis;
            } else {
                const selectedStudent = allStudents?.find(s => s.nama_lengkap === values.nama_siswa);
                selectedNis = selectedStudent?.nis;
            }

            if (!selectedNis) {
                throw new Error('NIS siswa tidak ditemukan untuk nama yang dipilih.');
            }

            const body = {
                nis: selectedNis,
                nama_siswa: values.nama_siswa,
                pelanggaran: values.jenis_pelanggaran,
                tanggal_terjadi: formattedDate,
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

            if (isStudentSpecific) {
                mutate(`/api/violations-log/${student?.nis}`);
                mutate(`/api/students/${student?.nis}`);
                mutate(`/api/sanctions/${student?.nis}`);
            } else {
                mutate('/api/violations-log');
                mutate('/api/students');
            }
            setOpen(false);
            form.reset();
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
            <DialogContent className="sm:max-w-[95vw] md:max-w-[500px] max-h-[90vh] overflow-y-auto p-4">
                <DialogHeader className="sm:max-w-[90vw] md:max-w-[450px]">
                    <DialogTitle className="font-headline text-lg sm:text-xl">
                        {isEditMode ? 'Edit Pelanggaran' : 'Formulir Pelanggaran Baru'}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        {isEditMode
                            ? 'Perbarui detail pelanggaran di bawah ini.'
                            : 'Catat pelanggaran siswa dengan mengisi formulir di bawah ini.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-3 sm:space-y-4 py-2"
                    >
                        <FormField
                            control={form.control}
                            name="nama_siswa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Nama Siswa
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
                                        value={field.value}
                                        disabled={isStudentSpecific || allStudentsLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="text-xs sm:text-sm h-9">
                                                <SelectValue placeholder="Pilih siswa" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isStudentSpecific && student ? (
                                                <SelectItem key={student.nis} value={student.nama_lengkap}>
                                                    {student.nama_lengkap}
                                                </SelectItem>
                                            ) : (
                                                allStudents?.map((s) => (
                                                    <SelectItem key={s.nis} value={s.nama_lengkap}>
                                                        {s.nama_lengkap} ({s.kelas})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="violationTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Tipe Pelanggaran
                                    </FormLabel>
                                    <Select
                                        onValueChange={handleViolationTypeChange}
                                        value={field.value}
                                        disabled={violationTypesLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="text-xs sm:text-sm h-9">
                                                <SelectValue placeholder="Pilih tipe pelanggaran" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {violationTypes?.map((type) => (
                                                <SelectItem
                                                    key={type.id}
                                                    value={type.id.toString()}
                                                    className="text-xs sm:text-sm"
                                                >
                                                    {type.nama_pelanggaran} (+{type.poin} poin)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tanggal_terjadi"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-xs sm:text-sm">
                                        Tanggal Kejadian
                                    </FormLabel>
                                    <FormControl>
                                        <DatePicker date={field.value} setDate={field.onChange} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="catatan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Catatan Tambahan
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Jelaskan detail kejadian pelanggaran..."
                                            {...field}
                                            className="text-xs sm:text-sm"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="guru_bk"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">Guru BK</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={teachersLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="text-xs sm:text-sm h-9">
                                                <SelectValue placeholder="Pilih guru BK" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bkTeachers.map((teacher) => (
                                                <SelectItem
                                                    key={teacher.id}
                                                    value={teacher.nama}
                                                    className="text-xs sm:text-sm"
                                                >
                                                    {teacher.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="poin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs sm:text-sm">
                                        Poin Pelanggaran
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Poin berdasarkan tipe pelanggaran"
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(e.target.value)
                                                )
                                            }
                                            disabled
                                            className="text-xs sm:text-sm h-9"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="text-xs sm:text-sm h-8"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="text-xs sm:text-sm h-8"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
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