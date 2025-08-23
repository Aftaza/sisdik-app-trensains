'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Classes } from '@/lib/data';
import { Download, Upload, Loader2, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import RootLayout from '../../dashboard/layout';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { parse } from 'path';

// Skema validasi yang diperbaiki
const formSchema = z.object({
    class: z.string().min(1, 'Kelas harus dipilih.'),
    date: z.string().min(1, 'Bulan dan tahun harus dipilih.'),
    file: z
        .instanceof(File)
        .refine((file) => file.size > 0, 'Berkas CSV harus diunggah.')
        .refine(
            (file) => file.type === 'text/csv' || file.name.endsWith('.csv'),
            'File harus berformat CSV'
        ),
});

type CsvRow = {
    nis: string;
    status_absensi: string;
};

export default function ImportAttendanceClient() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { toast } = useToast();

    const { data: classData, isLoading: classLoading } = useSWR<Classes[]>('/api/classes', fetcher);
    const classOptions = useMemo(() => {
        if (!classData) return ['Semua Kelas'];
        return [...classData.map((cls) => cls.nama_kelas)];
    }, [classData]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            class: '',
            date: '',
            file: undefined,
        },
    });

    const { control, handleSubmit, watch, setValue, trigger } = form;
    const selectedFile = watch('file');
    const selectedDateString = watch('date');

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const monthYearOptions = useMemo(() => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 3; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            options.push({ value: `${year}-${month}`, label });
        }
        return options;
    }, []);

    useEffect(() => {
        if (!selectedDateString && monthYearOptions.length > 0) {
            setValue('date', monthYearOptions[0].value);
        }
    }, [monthYearOptions, selectedDateString, setValue]);

    const handleDownloadTemplate = () => {
        const csvContent = 'tanggal,nis,nama_siswa,status_absensi\n1,1671,Rahma,Hadir\n2,1672,Aura,Izin\n3,1673,Rizki,Sakit\n4,1674,Lia,Alpha\n';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.href) {
            URL.revokeObjectURL(link.href);
        }
        link.href = URL.createObjectURL(blob);
        link.download = 'template_absensi.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fungsi untuk memvalidasi struktur CSV
    const validateCsvStructure = (data: any[], fields: string[] | undefined): boolean => {
        if (!fields) return false;
        return fields.includes('nis') && fields.includes('status_absensi');
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        console.log('Submitting values:', values);

        try {
            // Validasi tambahan untuk memastikan file ada
            if (!values.file) {
                throw new Error('File tidak ditemukan. Silakan pilih file terlebih dahulu.');
            }

            const parsedData = await new Promise<CsvRow[]>((resolve, reject) => {
                Papa.parse<CsvRow>(values.file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // Validasi struktur CSV
                        if (!validateCsvStructure(results.data, results.meta.fields)) {
                            return reject(
                                new Error('Berkas CSV harus memiliki kolom "nis" dan "status_absensi".')
                            );
                        }
                        
                        // Validasi data kosong
                        if (results.data.length === 0) {
                            return reject(
                                new Error('File CSV kosong atau tidak memiliki data.')
                            );
                        }

                        // Validasi format data
                        const invalidRows = results.data.filter(
                            row => !row.nis || !row.status_absensi
                        );
                        if (invalidRows.length > 0) {
                            return reject(
                                new Error(`Terdapat ${invalidRows.length} baris dengan data tidak lengkap.`)
                            );
                        }

                        resolve(results.data);
                    },
                    error: (error: Error) => {
                        console.error('PapaParse error:', error);
                        reject(new Error(`Gagal membaca file CSV: ${error.message}`));
                    },
                });
            });

            if (!parsedData) {
                throw new Error('Gagal memproses file CSV');
            }

            // Buat FormData untuk mengirim file
            const formData = new FormData();
            formData.append('class', values.class);
            formData.append('date', values.date);
            formData.append('file', values.file);

            // Kirim ke API Next.js Server
            const response = await fetch('/api/attendances/mass', {
                method: 'POST',
                body: formData,
                // JANGAN SET Content-Type header - biarkan browser menangani multipart/form-data
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Gagal mengimpor data absensi');
            }

            const [yearStr, monthStr] = values.date.split('-');
            const displayDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
                                .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

            toast({
                title: 'Impor Berhasil',
                description: `${parsedData.length || 0} data absensi untuk kelas ${
                    values.class
                } pada bulan ${displayDate} telah berhasil diproses.`,
            });

            await new Promise((res) => setTimeout(res, 1000));
            router.push('/attendance');
        } catch (error: any) {
            console.error('Import error:', error);
            toast({
                variant: 'destructive',
                title: 'Impor Gagal',
                description: error.message || 'Terjadi kesalahan saat memproses berkas CSV.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi untuk mereset file input
    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setValue('file', undefined as any);
    };

    return (
        <RootLayout>
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Kembali</span>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Impor Absensi Bulanan</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Unggah Data Absensi</CardTitle>
                                <CardDescription>
                                    Pilih kelas dan bulan/tahun, lalu unggah berkas CSV untuk mencatat
                                    absensi bulanan secara massal. Pastikan format CSV sesuai dengan
                                    template yang disediakan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={control}
                                        name="class"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pilih Kelas</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={classLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih kelas yang akan diimpor" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {classOptions.map((opt) => (
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
                                        control={control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bulan & Tahun Absensi</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih bulan dan tahun" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {monthYearOptions.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={control}
                                    name="file"
                                    render={({ field: { onChange, value, ...fieldProps } }) => (
                                        <FormItem>
                                            <FormLabel>Berkas CSV Absensi</FormLabel>
                                            <FormControl>
                                                <div
                                                    className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Input
                                                        {...fieldProps}
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept=".csv,text/csv"
                                                        className="hidden"
                                                        onChange={(event) => {
                                                            const file = event.target.files?.[0];
                                                            if (file) {
                                                                // Validasi ukuran file (maks 5MB)
                                                                if (file.size > 5 * 1024 * 1024) {
                                                                    toast({
                                                                        variant: 'destructive',
                                                                        title: 'File Terlalu Besar',
                                                                        description: 'Ukuran file maksimal 5MB',
                                                                    });
                                                                    resetFileInput();
                                                                    return;
                                                                }
                                                                onChange(file);
                                                                trigger('file');
                                                            } else {
                                                                onChange(undefined);
                                                            }
                                                        }}
                                                    />
                                                    {selectedFile ? (
                                                        <div className="flex flex-col items-center">
                                                            <p className="text-sm font-medium text-foreground">
                                                                {selectedFile.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="mt-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    resetFileInput();
                                                                }}
                                                            >
                                                                Hapus Berkas
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-muted-foreground">
                                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                                            <p>
                                                                Klik untuk memilih berkas atau seret
                                                                ke sini
                                                            </p>
                                                            <p className="text-xs">
                                                                Hanya format .csv yang didukung (max 5MB)
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleDownloadTemplate}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Unduh Template
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={isSubmitting ? 'opacity-70' : ''}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        'Impor Data'
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
            </div>
        </RootLayout>
    );
}