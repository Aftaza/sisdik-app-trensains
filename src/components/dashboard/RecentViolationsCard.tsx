'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Violation {
    id: string;
    student_id: string;
    violation_type_id: string;
    created_at: string;
    students: {
        nis: string;
        name: string;
    } | null;
    violation_types: {
        name: string;
        poin: number;
    } | null;
}

type RecentViolationsCardProps = {
    violations: Violation[];
};

export function RecentViolationsCard({ violations }: RecentViolationsCardProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const recentViolations = violations.slice(0, 5);

    if (!violations.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pelanggaran Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">No recent violations.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pelanggaran Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Siswa</TableHead>
                            <TableHead>Jenis Pelanggaran</TableHead>
                            <TableHead>Tanggal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentViolations.map((v) => {
                            const date = new Date(v.created_at);
                            const isValidDate = !isNaN(date.getTime());

                            return (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">
                                        {v.students?.name || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {v.violation_types?.name || '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {isClient && isValidDate
                                            ? format(date, 'dd/MM/yyyy', { locale: id })
                                            : 'Tanggal tidak valid'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
