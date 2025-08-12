
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sanctionsData } from '@/lib/data';
import type { Sanction } from '@/lib/data';
import RootLayout from '../dashboard/layout';
import { SanctionForm } from '@/components/sanction-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';

export default function SanctionsPage() {

    const handleDelete = (sanctionId: string) => {
        console.log(`Deleting sanction with id: ${sanctionId}`);
        // Implement deletion logic here
    };

  return (
    <RootLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline">Daftar Sanksi</h1>
            <SanctionForm>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Sanksi
                </Button>
            </SanctionForm>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tabel Sanksi Berdasarkan Poin</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Pembinaan</TableHead>
                  <TableHead className="w-[200px]">Rentang Poin</TableHead>
                   <TableHead>
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sanctionsData.map((sanction) => (
                  <TableRow key={sanction.id}>
                    <TableCell className="font-medium">{sanction.no}</TableCell>
                    <TableCell>{sanction.coaching}</TableCell>
                    <TableCell>{sanction.pointRange}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <SanctionForm sanction={sanction}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                            </SanctionForm>
                            <DeleteConfirmationDialog onConfirm={() => handleDelete(sanction.id)}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Hapus</DropdownMenuItem>
                            </DeleteConfirmationDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RootLayout>
  );
}
