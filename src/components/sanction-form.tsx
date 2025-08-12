
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

const formSchema = z.object({
  coaching: z.string().min(5, 'Deskripsi pembinaan harus diisi minimal 5 karakter.'),
  pointRange: z.string().min(1, 'Rentang poin harus diisi.'),
});

type SanctionFormProps = {
  children: React.ReactNode;
  sanction?: Sanction;
};

export function SanctionForm({ children, sanction }: SanctionFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!sanction;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coaching: '',
      pointRange: '',
    },
  });

  useEffect(() => {
    if (isEditMode && sanction) {
      form.reset(sanction);
    } else {
      form.reset({
        coaching: '',
        pointRange: '',
      });
    }
  }, [isEditMode, sanction, form, open]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Sukses',
      description: isEditMode ? `Sanksi berhasil diperbarui.` : `Sanksi baru berhasil ditambahkan.`,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Sanksi' : 'Formulir Sanksi Baru'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Perbarui data sanksi di bawah ini.' : 'Isi data sanksi baru di bawah ini.'}</DialogDescription>
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
                    <Textarea placeholder="Contoh: Peringatan lisan oleh guru piket/wali kelas." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pointRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rentang Poin</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 1-15 atau >100" {...field} />
                  </FormControl>
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
