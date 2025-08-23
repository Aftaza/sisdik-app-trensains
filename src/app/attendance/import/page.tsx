
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { students } from '@/lib/data';
import { Download, Upload, Loader2, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';
import RootLayout from '../../dashboard/layout';

const classOptions = [...new Set(students.map((s) => s.class))];

const formSchema = z.object({
  class: z.string().min(1, 'Kelas harus dipilih.'),
  date: z.date({ required_error: 'Tanggal harus diisi.' }),
  file: z.instanceof(File).refine(file => file.size > 0, 'Berkas CSV harus diunggah.'),
});

type CsvRow = {
  nis: string;
  status: string;
};

export function ImportAttendanceClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { control, handleSubmit, watch, setValue, trigger } = form;
  const selectedFile = watch('file');


  const handleDownloadTemplate = () => {
    const csvContent = 'tanggal\n1,nis\n1671,status\nHadir\nIzin\nSakit\nAlpha\n';
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log('Submitting values:', values);

    try {
        const parsedData = await new Promise<CsvRow[]>((resolve, reject) => {
            Papa.parse<CsvRow>(values.file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    // Basic validation
                    if (!results.meta.fields?.includes('nis') || !results.meta.fields?.includes('status')) {
                        return reject(new Error('Berkas CSV harus memiliki kolom "nis" dan "status".'));
                    }
                    resolve(results.data);
                },
                error: (error: Error) => reject(error),
            });
        });

        console.log('Parsed CSV Data:', parsedData);
        // Here you would typically send the data to your backend/server action
        // For now, we just simulate a success.

        toast({
            title: 'Impor Berhasil',
            description: `${parsedData.length} data absensi untuk kelas ${values.class} pada tanggal ${values.date.toLocaleDateString()} telah berhasil diproses.`,
        });

        // Simulate network delay
        await new Promise(res => setTimeout(res, 1000));
        router.push('/attendance');

    } catch (error) {
        console.error('Import error:', error);
        toast({
            variant: 'destructive',
            title: 'Impor Gagal',
            description: (error instanceof Error) ? error.message : 'Terjadi kesalahan saat memproses berkas CSV.',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <RootLayout>
         <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Impor Absensi Harian</h1>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Unggah Data Absensi</CardTitle>
                    <CardDescription>
                        Pilih kelas dan tanggal, lalu unggah berkas CSV untuk mencatat absensi harian secara massal.
                        Pastikan format CSV sesuai dengan template yang disediakan.
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormItem className="flex flex-col">
                            <FormLabel>Tanggal Absensi</FormLabel>
                            <FormControl>
                                <DatePicker date={field.value} setDate={field.onChange} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>

                    <FormField
                        control={control}
                        name="file"
                        render={({ field: { onChange, ...fieldProps } }) => (
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
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(event) => {
                                            if (event.target.files?.[0]) {
                                                setValue('file', event.target.files[0]);
                                                trigger('file');
                                            }
                                        }}
                                    />
                                    {selectedFile ? (
                                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <Upload className="mx-auto h-8 w-8 mb-2" />
                                            <p>Klik untuk memilih berkas atau seret ke sini</p>
                                            <p className="text-xs">Hanya format .csv yang didukung</p>
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    </CardContent>
                    <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                        <Download className="mr-2 h-4 w-4" />
                        Unduh Template
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
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
