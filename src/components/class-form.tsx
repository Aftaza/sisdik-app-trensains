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
import { teachers } from '@/lib/data';
import type { ClassData } from '@/lib/data';

const formSchema = z.object({
    name: z.string().min(3, 'Nama kelas harus diisi minimal 3 karakter.'),
    homeroomTeacher: z.string().min(1, 'Wali kelas harus dipilih.'),
});

type ClassFormProps = {
    children: React.ReactNode;
    classData?: ClassData;
};

const teacherOptions = teachers
    .filter((t) => t.role === 'Wali Kelas')
    .map((t) => ({ value: t.name, label: t.name }));

export function ClassForm({ children, classData }: ClassFormProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const isEditMode = !!classData;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            homeroomTeacher: '',
        },
    });

    useEffect(() => {
        if (isEditMode && classData) {
            form.reset(classData);
        } else {
            form.reset({
                name: '',
                homeroomTeacher: '',
            });
        }
    }, [isEditMode, classData, form, open]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        toast({
            title: 'Sukses',
            description: isEditMode
                ? `Data kelas "${values.name}" berhasil diperbarui.`
                : `Kelas baru "${values.name}" berhasil ditambahkan.`,
        });
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">
                        {isEditMode ? 'Edit Data Kelas' : 'Formulir Kelas Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Perbarui data kelas di bawah ini.'
                            : 'Isi data untuk kelas baru.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Kelas</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Contoh: XII-A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="homeroomTeacher"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wali Kelas</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih wali kelas" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teacherOptions.map((opt) => (
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
