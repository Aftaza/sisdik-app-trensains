'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, ShieldAlert, UserCheck } from 'lucide-react';
// import { ViolationForm } from '@/components/violation-form';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartBarChart,
    ChartXAxis,
    ChartYAxis,
    ChartCartesianGrid,
    ChartBar,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { ViolationLogForm } from '@/components/violation-log-form';

interface Student {
    nis: number;
    nama_lengkap: string;
    kelas: string;
    total_poin: number;
}

interface Violation {
    id: number;
    nis_siswa: number;
    nama_siswa: string;
    jenis_pelanggaran: string;
    tanggal_terjadi: string;
}

interface Teacher {
    id: number;
    nama: string;
    jabatan: string;
}

function RecentViolationsTable({ violations }: { violations: Violation[] }) {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!violations.length) {
        return <p className="text-center text-muted-foreground">No recent violations.</p>;
    }

    const recentViolations = violations.slice(0, 5);

    return (
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
                    // Periksa apakah `tanggal_terjadi` adalah string yang valid
                    const date = new Date(v.tanggal_terjadi);
                    const isValidDate = !isNaN(date.getTime()); // Cek apakah tanggal valid

                    return (
                        <TableRow key={v.id}>
                            <TableCell className="font-medium">{v.nama_siswa}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">{v.jenis_pelanggaran}</Badge>
                            </TableCell>
                            <TableCell>
                                {isClient && isValidDate ? format(date, 'dd/MM/yyyy', { locale: id }) : 'Tanggal tidak valid'}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

export default function DashboardPage() { 
    const { data: students, error: studentsError } = useSWR<Student[]>('/api/students', fetcher);
    const { data: violations, error: violationsError } = useSWR<Violation[]>('/api/violations-log', fetcher);
    const { data: teachers, error: teachersError } = useSWR<Teacher[]>('/api/teachers', fetcher);

    const isLoading = !students && !violations && !teachers;

    const { toast } = useToast();

    useEffect(() => {
        if (studentsError) {
            toast({
                title: 'Error',
                description: studentsError.message || 'Failed to fetch students',
                variant: 'destructive',
            });
        }
        if (violationsError) {
            toast({
                title: 'Error',
                description: violationsError.message || 'Failed to fetch violations',
                variant: 'destructive',
            });
        }
        if (teachersError) {
            toast({
                title: 'Error',
                description: teachersError.message || 'Failed to fetch teachers',
                variant: 'destructive',
            });
        }
    }, [studentsError, violationsError, teachersError, toast]);

    const topStudents = useMemo(() => {
        if (!students) return [];
        return [...students].sort((a, b) => b.total_poin - a.total_poin).slice(0, 5);
    }, [students]);

    const chartColors = ['#2A628F', '#5582A6', '#7CB5B8', '#A3E4D7', '#CFFAD3'];

    const violationTypeCounts = useMemo(() => {
        if (!violations) return [];
        const counts: { [key: string]: number } = {};
        violations.forEach((v) => {
            counts[v.jenis_pelanggaran] = (counts[v.jenis_pelanggaran] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value], index) => ({
            name,
            value,
            fill: chartColors[index % chartColors.length],
        }));
    }, [violations]);

    const violationByClass = useMemo(() => {
        if (!violations || !students) return [];
        const counts: { [key: string]: Set<string> } = {};
        violations.forEach((v) => {
            const student = students.find((s) => s.nis === v.nis_siswa);
            if (student) {
                if (!counts[student.kelas]) {
                    counts[student.kelas] = new Set();
                }
                counts[student.kelas].add(student.nis.toString());
            }
        });
        return Object.entries(counts).map(([name, studentSet], index) => ({
            name,
            total: studentSet.size,
            fill: chartColors[index % chartColors.length],
        }));
    }, [violations, students]);

    const pieChartConfig = useMemo(() => {
        const config: ChartConfig = {
            value: { label: 'Pelanggaran' },
        };
        violationTypeCounts.forEach((item) => {
            if (item.name) {
                config[item.name] = { label: item.name, color: item.fill };
            }
        });
        return config;
    }, [violationTypeCounts]);

    const barChartConfig = useMemo(() => {
        const config: ChartConfig = {
            total: { label: 'Jumlah Siswa' },
        };
        violationByClass.forEach((item) => {
            if (item.name) {
                config[item.name] = { label: item.name, color: item.fill };
            }
        });
        return config;
    }, [violationByClass]);

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Dashboard Utama</h1>
                <ViolationLogForm>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Catat Pelanggaran
                    </Button>
                </ViolationLogForm>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jumlah Siswa</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-1/4" />
                        ) : (
                            <div className="text-2xl font-bold">{students?.length || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Total siswa terdaftar di sekolah
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pelanggaran</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-1/4" />
                        ) : (
                            <div className="text-2xl font-bold">{violations?.length || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Total pelanggaran tercatat</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jumlah Guru</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-1/4" />
                        ) : (
                            <div className="text-2xl font-bold">{teachers?.length || 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground">Total guru & staf terdaftar</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Tipe Pelanggaran Umum</CardTitle>
                        <CardDescription>
                            Persentase jenis pelanggaran yang paling sering terjadi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        {isLoading ? (
                            <Skeleton className="w-full h-[250px] rounded-lg" />
                        ) : (
                            violationTypeCounts.length > 0 ? (
                                <ChartContainer
                                    config={pieChartConfig}
                                    className="mx-auto w-full h-full min-h-[350px]"
                                >
                                    <PieChart className="flex-col items-center gap-2">
                                        <ChartTooltip
                                            content={<ChartTooltipContent nameKey="name" />}
                                        />
                                        <Pie
                                            data={violationTypeCounts}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {violationTypeCounts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <ChartLegend
                                            content={
                                                <ChartLegendContent
                                                    nameKey="name"
                                                    className="flex-col items-start gap-2"
                                                />
                                            }
                                        />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[350px]">
                                    <p className="text-muted-foreground">No data yet.</p>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Siswa Poin Tertinggi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
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
                        ) : topStudents.length > 0 ? (
                            <div className="space-y-4">
                                {topStudents.map((student) => (
                                    <Link
                                        key={student.nis}
                                        href={`/students/${student.nis}`}
                                        className="flex items-center p-2 -m-2 rounded-lg hover:bg-accent"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>
                                                {student.nama_lengkap.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {student.nama_lengkap}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {student.kelas}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-right">
                                            <Badge
                                                variant={
                                                    student.total_poin === 0
                                                            ? 'success'
                                                            : student.total_poin > 0 && student.total_poin <= 50
                                                            ? 'warning'
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
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">No data yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pelanggaran Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentViolationsTable violations={violations || []} />
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Siswa Melanggar per Kelas</CardTitle>
                        <CardDescription>
                            Jumlah siswa unik yang melakukan pelanggaran di setiap kelas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="w-full h-[250px] rounded-lg" />
                        ) : violationByClass.length > 0 ? (
                            <ChartContainer config={barChartConfig} className="w-full h-[300px]">
                                <ChartBarChart data={violationByClass} accessibilityLayer>
                                    <ChartCartesianGrid vertical={false} />
                                    <ChartXAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartYAxis allowDecimals={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <ChartBar dataKey="total" radius={4}>
                                        {violationByClass.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </ChartBar>
                                </ChartBarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px]">
                                <p className="text-muted-foreground">No data yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
