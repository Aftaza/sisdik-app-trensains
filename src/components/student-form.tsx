
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Student } from '@/lib/data';


const formSchema = z.object({
  name: z.string().min(3, 'Nama harus diisi minimal 3 karakter.'),
  nis: z.string().min(5, 'NIS harus diisi minimal 5 digit.').regex(/^\d+$/, 'NIS hanya boleh berisi angka.'),
  class: z.string().min(1, 'Kelas harus dipilih.'),
});

type StudentFormProps = {
  children: React.ReactNode;
  student?: Student;
};

const classOptions = [
  'X-A', 'X-B', 'X-C',
  'XI-A', 'XI-B', 'XI-C',
  'XII-A', 'XII-B', 'XII-C',
]

export function StudentForm({ children, student }: StudentFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!student;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nis: '',
      class: '',
    },
  });

  useEffect(() => {
    if (isEditMode && student) {
      form.reset(student);
    } else {
        form.reset({
            name: '',
            nis: '',
            class: '',
        });
    }
  }, [isEditMode, student, form, open]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: isEditMode ? "Sukses" : "Sukses",
      description: isEditMode ? `Data siswa "${values.name}" berhasil diperbarui.` : `Siswa baru "${values.name}" berhasil ditambahkan.`,
    })
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => {
          e.stopPropagation();
          setOpen(true)
      }}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Data Siswa' : 'Formulir Siswa Baru'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Perbarui data siswa di bawah ini.' : 'Isi data siswa baru di bawah ini.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Budi Santoso" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Induk Siswa (NIS)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
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
