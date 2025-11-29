'use client';

import { useState, useEffect } from 'react';
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
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { Classes } from '@/lib/data';

// Zod schema for CSV row validation (without class_id)
const studentRowSchema = z.object({
    name: z.string().min(3, 'Nama harus minimal 3 karakter'),
    nis: z.string().min(1, 'NIS harus diisi'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type StudentRow = z.infer<typeof studentRowSchema>;

type ImportStudentsCsvProps = {
    children: React.ReactNode;
    onSuccess?: () => void;
};

export function ImportStudentsCsv({ children, onSuccess }: ImportStudentsCsvProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const { toast } = useToast();

    // Fetch classes
    const { data: classes, error: classesError } = useSWR<Classes[]>('/api/classes', fetcher);

    // Reset when dialog closes
    useEffect(() => {
        if (!open) {
            setFile(null);
            setSelectedClass('');
            setValidationErrors([]);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            if (!selectedFile.name.endsWith('.csv')) {
                toast({
                    title: 'File Tidak Valid',
                    description: 'Hanya file CSV yang diperbolehkan.',
                    variant: 'destructive',
                });
                return;
            }
            setFile(selectedFile);
            setValidationErrors([]);
        }
    };

    const parseCSV = (text: string): string[][] => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        return lines.map(line => {
            // Simple CSV parsing (handles basic cases)
            return line.split(',').map(cell => cell.trim());
        });
    };

    const validateAndParseCSV = async (file: File): Promise<StudentRow[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const rows = parseCSV(text);
                    
                    if (rows.length < 2) {
                        reject(new Error('File CSV kosong atau hanya berisi header.'));
                        return;
                    }

                    // Validate header (without class_id)
                    const header = rows[0];
                    const expectedHeaders = ['name', 'nis', 'phone', 'address'];
                    
                    if (header.length !== expectedHeaders.length) {
                        reject(new Error(`Header tidak sesuai. Expected: ${expectedHeaders.join(', ')}`));
                        return;
                    }

                    for (let i = 0; i < expectedHeaders.length; i++) {
                        if (header[i].toLowerCase() !== expectedHeaders[i]) {
                            reject(new Error(`Header kolom ${i + 1} harus "${expectedHeaders[i]}", ditemukan "${header[i]}"`));
                            return;
                        }
                    }

                    // Parse and validate data rows
                    const students: StudentRow[] = [];
                    const errors: string[] = [];

                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i];
                        
                        if (row.length !== expectedHeaders.length) {
                            errors.push(`Baris ${i + 1}: Jumlah kolom tidak sesuai (${row.length} kolom, expected ${expectedHeaders.length})`);
                            continue;
                        }

                        const studentData = {
                            name: row[0],
                            nis: row[1],
                            phone: row[2] || '',
                            address: row[3] || '',
                        };

                        // Validate with Zod
                        const result = studentRowSchema.safeParse(studentData);
                        
                        if (!result.success) {
                            const errorMessages = result.error.errors.map(err => 
                                `${err.path.join('.')}: ${err.message}`
                            ).join(', ');
                            errors.push(`Baris ${i + 1}: ${errorMessages}`);
                        } else {
                            students.push(result.data);
                        }
                    }

                    if (errors.length > 0) {
                        setValidationErrors(errors);
                        reject(new Error(`Ditemukan ${errors.length} error validasi. Periksa detail di bawah.`));
                        return;
                    }

                    resolve(students);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Gagal membaca file.'));
            };

            reader.readAsText(file);
        });
    };

    const handleSubmit = async () => {
        if (!selectedClass) {
            toast({
                title: 'Kelas Belum Dipilih',
                description: 'Silakan pilih kelas terlebih dahulu.',
                variant: 'destructive',
            });
            return;
        }

        if (!file) {
            toast({
                title: 'File Belum Dipilih',
                description: 'Silakan pilih file CSV terlebih dahulu.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setValidationErrors([]);

        try {
            // Validate and parse CSV
            const students = await validateAndParseCSV(file);

            // Add class_id to each student
            const studentsWithClass = students.map(student => ({
                ...student,
                class_id: selectedClass,
            }));

            // Send to API
            const response = await fetch('/api/students/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ students: studentsWithClass }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengimpor data siswa.');
            }

            // Show detailed result
            const successCount = data.data?.success || 0;
            const failedCount = data.data?.failed || 0;

            if (failedCount === 0) {
                toast({
                    title: 'Sukses',
                    description: `Berhasil mengimpor ${successCount} siswa.`,
                });
            } else if (successCount === 0) {
                toast({
                    title: 'Gagal',
                    description: `Gagal mengimpor semua siswa (${failedCount} gagal).`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Import Selesai',
                    description: `${successCount} berhasil, ${failedCount} gagal.`,
                });
            }

            setOpen(false);
            setFile(null);
            setSelectedClass('');
            if (onSuccess) onSuccess();
        } catch (error) {
            toast({
                title: 'Gagal',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengimpor data.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/templates/students-template.csv';
        link.download = 'students-template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: 'Template Diunduh',
            description: 'File template CSV berhasil diunduh.',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-headline">Import Siswa dari CSV</DialogTitle>
                    <DialogDescription>
                        Pilih kelas dan upload file CSV untuk menambahkan banyak siswa sekaligus.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Download Template Button */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">Template CSV</p>
                                <p className="text-sm text-muted-foreground">
                                    Download template untuk format yang benar
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadTemplate}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                        </Button>
                    </div>

                    {/* Class Selection */}
                    <div className="space-y-2">
                        <label htmlFor="class-select" className="text-sm font-medium">
                            Pilih Kelas <span className="text-destructive">*</span>
                        </label>
                        <Select
                            value={selectedClass}
                            onValueChange={setSelectedClass}
                            disabled={isLoading || !classes || classes.length === 0}
                        >
                            <SelectTrigger id="class-select">
                                <SelectValue placeholder="Pilih kelas untuk siswa" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes && classes.length > 0 ? (
                                    classes.map((classItem) => (
                                        <SelectItem key={classItem.id} value={classItem.id}>
                                            {classItem.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-class" disabled>
                                        Tidak ada kelas tersedia
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        {classesError && (
                            <p className="text-sm text-destructive">
                                Gagal memuat daftar kelas
                            </p>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label htmlFor="csv-file" className="text-sm font-medium">
                            Pilih File CSV <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={isLoading || !selectedClass}
                        />
                        {file && (
                            <p className="text-sm text-muted-foreground">
                                File dipilih: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                        {!selectedClass && (
                            <p className="text-sm text-muted-foreground">
                                Pilih kelas terlebih dahulu untuk mengaktifkan upload file
                            </p>
                        )}
                    </div>

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Validasi</AlertTitle>
                            <AlertDescription>
                                <div className="mt-2 max-h-[200px] overflow-y-auto">
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Instructions */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Petunjuk</AlertTitle>
                        <AlertDescription className="text-sm space-y-1">
                            <p>1. Download template CSV terlebih dahulu</p>
                            <p>2. Pilih kelas untuk siswa yang akan diimport</p>
                            <p>3. Isi data siswa sesuai format template</p>
                            <p>4. Format CSV: name, nis, phone, address</p>
                            <p>5. Phone dan address bersifat opsional</p>
                            <p>6. Upload file CSV yang sudah diisi</p>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setOpen(false);
                            setFile(null);
                            setSelectedClass('');
                            setValidationErrors([]);
                        }}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!file || !selectedClass || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Mengimpor...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
