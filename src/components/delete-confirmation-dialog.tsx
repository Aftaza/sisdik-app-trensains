'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

type DeleteConfirmationDialogProps = {
    children: React.ReactNode;
    onConfirm: () => void | Promise<void>;
};

export function DeleteConfirmationDialog({ children, onConfirm }: DeleteConfirmationDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleConfirm = async () => {
        try {
            await onConfirm();
            toast({
                title: 'Data Dihapus',
                description: 'Data yang dipilih telah berhasil dihapus.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Gagal Menghapus',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Terjadi kesalahan saat menghapus data.',
            });
        } finally {
            setOpen(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat diurungkan. Data akan dihapus secara permanen dari
                        server bahkan data yang terhubung.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.stopPropagation();
                            handleConfirm();
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Ya, Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
