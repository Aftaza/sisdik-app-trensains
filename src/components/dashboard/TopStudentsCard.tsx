'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Student {
    id: string;
    nis: string;
    name: string;
    classes: {
        name: string;
    } | null;
    total_poin: number;
}

type TopStudentsCardProps = {
    students: Student[];
    isLoading: boolean;
};

export function TopStudentsCard({ students, isLoading }: TopStudentsCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Siswa Poin Tertinggi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-4 w-[100px]" />
                                </div>
                                <Skeleton className="ml-auto h-6 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (students.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Siswa Poin Tertinggi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No data yet.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Siswa Poin Tertinggi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {students.map((student) => (
                        <Link
                            key={student.nis}
                            href={`/students/${student.nis}`}
                            className="flex items-center p-2 -m-2 rounded-lg hover:bg-accent"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {student.classes?.name || '-'}
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-right">
                                <Badge
                                    variant={
                                        student.total_poin === 0
                                            ? 'secondary'
                                            : student.total_poin > 0 && student.total_poin <= 50
                                            ? 'default'
                                            : 'destructive'
                                    }
                                    className="whitespace-nowrap"
                                >
                                    {student.total_poin} Poin
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
