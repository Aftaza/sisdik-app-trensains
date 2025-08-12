
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
import { Combobox } from './ui/combobox';
import { students, violationTypesData } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { Textarea } from './ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Violation } from '@/lib/data';

const formSchema = z.object({
  studentId: z.string().min(1, 'Siswa harus dipilih.'),
  violationType: z.string().min(1, 'Jenis pelanggaran harus dipilih.'),
  date: z.date({ required_error: 'Tanggal kejadian harus diisi.' }),
  notes: z.string().min(10, 'Catatan harus diisi minimal 10 karakter.'),
});

type ViolationFormProps = {
  children: React.ReactNode;
  studentId?: string;
  violation?: Violation;
};

export function ViolationForm({ children, studentId, violation }: ViolationFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!violation;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: studentId || '',
      violationType: '',
      notes: '',
      date: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && violation) {
        form.reset({
          studentId: violation.studentId,
          violationType: violation.type,
          notes: violation.notes,
          date: new Date(violation.date),
        });
      } else {
        form.reset({
          studentId: studentId || '',
          violationType: '',
          notes: '',
          date: new Date(),
        });
      }
    }
  }, [open, isEditMode, violation, studentId, form]);

  const studentOptions = students.map((s) => ({ label: `${s.name} (${s.nis})`, value: s.id }));
  const violationTypeOptions = violationTypesData.map((vt) => ({ label: `${vt.name} (+${vt.points} poin)`, value: vt.name }));


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Sukses",
      description: isEditMode ? "Data pelanggaran berhasil diperbarui." : "Data pelanggaran berhasil disimpan.",
    })
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => {
        e.stopPropagation();
        setOpen(true);
      }}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Pelanggaran' : 'Formulir Pelanggaran Baru'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Perbarui detail pelanggaran di bawah ini.' : 'Catat pelanggaran siswa dengan mengisi formulir di bawah ini.'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Siswa</FormLabel>
                  <FormControl>
                    <Combobox
                      options={studentOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Cari dan pilih siswa..."
                      searchPlaceholder="Cari siswa..."
                      emptyPlaceholder="Siswa tidak ditemukan."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="violationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Pelanggaran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis pelanggaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {violationTypeOptions.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="date"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jelaskan detail kejadian pelanggaran..." {...field} />
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
