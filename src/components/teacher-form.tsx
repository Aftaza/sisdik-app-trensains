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
import type { Teacher } from '@/lib/data';
import { useSession } from 'next-auth/react';
import { mutate } from 'swr';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox'; // ✅ Import Checkbox component

// ✅ PERBAIKAN: Password sekarang opsional di skema utama
const formSchema = z.object({
    nama: z.string().min(3, 'Nama harus diisi minimal 3 karakter.'),
    email: z.string().email('Format email tidak valid.'),
    jabatan: z.string().min(1, 'Jabatan harus dipilih.'),
    password: z.string().optional(), // Default: password opsional
});

type TeacherFormProps = {
    children: React.ReactNode;
    teacher?: Teacher;
};

const roleOptions = ['Guru BK', 'Wali Kelas', 'Pimpinan Sekolah'];

export function TeacherForm({ children, teacher }: TeacherFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { data: session } = useSession();
    const isEditMode = !!teacher;

    // ✅ State baru untuk mengontrol apakah password akan diubah (di edit mode)
    const [changePassword, setChangePassword] = useState(false);
    // State untuk password visibility (ikon mata)
    const [showPassword, setShowPassword] = useState(false);

    const hasPermission =
        session?.user?.jabatan === 'Admin' || session?.user?.jabatan === 'Guru BK';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: '',
            email: '',
            jabatan: '',
            password: '',
        },
    });

    useEffect(() => {
        if (isEditMode && teacher) {
            form.reset({
                nama: teacher.nama,
                email: teacher.email,
                jabatan: teacher.jabatan,
                password: '', // Selalu kosongkan password saat membuka form edit
            });
            setChangePassword(false); // Default: tidak mengubah password di mode edit
        } else {
            form.reset({
                nama: '',
                email: '',
                jabatan: '',
                password: '',
            });
            setChangePassword(true); // Default: password wajib di mode tambah
        }
        // Pastikan reset error juga saat form dibuka/ditutup
        form.clearErrors();
    }, [isEditMode, teacher, form, open]);

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
            let payload: Record<string, any> = { ...values }; // Buat salinan mutable

            // ✅ Logika kondisional untuk password
            if (isEditMode) {
                if (!changePassword) {
                    // Jika tidak ingin mengubah password, hapus dari payload
                    payload.password = '';
                } else {
                    // Jika ingin mengubah password, validasi panjangnya
                    if (!payload.password || payload.password.length < 6) {
                        form.setError('password', {
                            type: 'manual',
                            message: 'Password harus minimal 6 karakter jika ingin diubah.',
                        });
                        throw new Error('Password harus minimal 6 karakter jika ingin diubah.');
                    }
                }
            } else {
                // Untuk mode tambah, password selalu wajib
                if (!payload.password || payload.password.length < 6) {
                    form.setError('password', {
                        type: 'manual',
                        message: 'Password harus minimal 6 karakter.',
                    });
                    throw new Error('Password harus minimal 6 karakter.');
                }
            }

            const url = isEditMode ? `/api/teachers/${teacher?.id}` : '/api/teachers';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Kirim payload yang sudah dimodifikasi
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Terjadi kesalahan');
            }

            toast({
                title: 'Sukses',
                description: isEditMode
                    ? `Data guru "${values.nama}" berhasil diperbarui.`
                    : `Guru baru "${values.nama}" berhasil ditambahkan.`,
            });

            mutate('/api/teachers');
            setOpen(false);
            form.reset(); // Reset form setelah berhasil submit
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan yang tidak diketahui',
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
                        {isEditMode ? 'Edit Data Guru' : 'Formulir Guru Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui data guru di bawah ini.'
                            : 'Isi data guru baru di bawah ini.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nama"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: Siti Nurhaliza" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: siti.n@sekolah.id" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="jabatan"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jabatan</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jabatan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roleOptions.map((opt) => (
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={
                                                    isEditMode
                                                        ? 'Masukkan password baru'
                                                        : 'Masukkan password'
                                                }
                                                {...field}
                                                // ✅ Nonaktifkan input jika di mode edit dan checkbox tidak dicentang
                                                disabled={isEditMode && !changePassword}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute inset-y-0 right-0 h-full px-3 py-1 text-gray-500 hover:bg-transparent hover:text-gray-700"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                // ✅ Nonaktifkan ikon mata jika input dinonaktifkan
                                                disabled={isEditMode && !changePassword}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* ✅ Tampilkan checkbox hanya di mode edit */}
                        {isEditMode && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="changePassword"
                                    checked={changePassword}
                                    onCheckedChange={(checked) => {
                                        setChangePassword(checked === true);
                                        // Bersihkan nilai password dan error jika checkbox tidak dicentang
                                        if (checked === false) {
                                            form.setValue('password', '');
                                            form.clearErrors('password');
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="changePassword"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Ubah Password
                                </label>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
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