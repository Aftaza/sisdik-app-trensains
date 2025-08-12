
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
import { teachers } from '@/lib/data';
import type { ViolationType } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(3, 'Nama pelanggaran harus diisi minimal 3 karakter.'),
  category: z.string().min(1, 'Kategori harus dipilih.'),
  points: z.coerce.number().min(1, 'Poin harus diisi dan lebih dari 0.'),
  creator: z.string().min(1, 'Pembuat harus dipilih.'),
});

type ViolationTypeFormProps = {
  children: React.ReactNode;
  violationType?: ViolationType;
};

const categoryOptions = ['Ringan', 'Sedang', 'Berat'];
const creatorOptions = teachers.map(teacher => ({ value: teacher.name, label: teacher.name }));


export function ViolationTypeForm({ children, violationType }: ViolationTypeFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!violationType;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: '',
      points: 0,
      creator: '',
    },
  });

  useEffect(() => {
    if (isEditMode && violationType) {
        form.reset({
            ...violationType,
            points: violationType.points || 0,
        });
    } else {
        form.reset({
            name: '',
            category: '',
            points: 0,
            creator: '',
        });
    }
  }, [isEditMode, violationType, form, open]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Sukses',
      description: isEditMode ? `Tipe pelanggaran "${values.name}" berhasil diperbarui.` : `Tipe pelanggaran "${values.name}" berhasil ditambahkan.`,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Tipe Pelanggaran' : 'Formulir Tipe Pelanggaran'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Perbarui data untuk tipe pelanggaran ini.' : 'Isi data untuk tipe pelanggaran baru.'}</DialogDescription>
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
                      {categoryOptions.map((opt) => (
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
            <FormField
              control={form.control}
              name="creator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dibuat Oleh</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pembuat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {creatorOptions.map((opt) => (
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
