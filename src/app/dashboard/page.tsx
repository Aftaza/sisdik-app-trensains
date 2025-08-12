
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users, ShieldAlert, UserCheck } from 'lucide-react';
import { ViolationForm } from '@/components/violation-form';
import { students, violations, teachers } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartBarChart, ChartXAxis, ChartYAxis, ChartCartesianGrid, ChartBar, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

function RecentViolationsTable() {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => setIsLoading(false), 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-8 w-1/4 rounded-md" />
            <Skeleton className="h-8 w-1/2 rounded-md" />
            <Skeleton className="h-8 w-1/4 rounded-md" />
          </div>
        ))}
      </div>
    );
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
        {recentViolations.map((v) => (
          <TableRow key={v.id} onClick={() => router.push(`/students/${v.studentId}`)} className="cursor-pointer">
            <TableCell className="font-medium">{v.studentName}</TableCell>
            <TableCell><Badge variant="secondary">{v.type}</Badge></TableCell>
            <TableCell>{isClient ? new Date(v.date).toLocaleDateString('id-ID') : ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  const topStudents = [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

  const chartColors = [
    '#2A628F', '#5582A6', '#7CB5B8', '#A3E4D7', '#CFFAD3'
  ];

  const violationTypeCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    violations.forEach(v => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], index) => ({ name, value, fill: chartColors[index % chartColors.length] }));
  }, []);

  const violationByClass = useMemo(() => {
    const counts: { [key: string]: Set<string> } = {};
    violations.forEach(v => {
      const student = students.find(s => s.id === v.studentId);
      if (student) {
        if (!counts[student.class]) {
          counts[student.class] = new Set();
        }
        counts[student.class].add(student.id);
      }
    });
    return Object.entries(counts).map(([name, studentSet], index) => ({
      name,
      total: studentSet.size,
      fill: chartColors[index % chartColors.length]
    }));
  }, []);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: { label: 'Siswa' },
    };
    violationTypeCounts.forEach(item => {
      if(item.name) {
        config[item.name] = { label: item.name, color: item.fill };
      }
    });
    return config;
  }, [violationTypeCounts]);

  const barChartConfig = useMemo(() => {
    const config: ChartConfig = {
      total: { label: 'Jumlah Siswa' },
    };
    violationByClass.forEach(item => {
      if(item.name) {
        config[item.name] = { label: item.name, color: item.fill };
      }
    });
    return config;
  }, [violationByClass]);


  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Dashboard Utama</h1>
        <ViolationForm>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Catat Pelanggaran
          </Button>
        </ViolationForm>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jumlah Siswa</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{students.length}</div>}
                <p className="text-xs text-muted-foreground">Total siswa terdaftar di sekolah</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pelanggaran</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{violations.length}</div>}
                <p className="text-xs text-muted-foreground">Total pelanggaran tercatat</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jumlah Guru</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{teachers.length}</div>}
                <p className="text-xs text-muted-foreground">Total guru & staf terdaftar</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tipe Pelanggaran Umum</CardTitle>
            <CardDescription>Persentase jenis pelanggaran yang paling sering terjadi.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {isLoading ? <Skeleton className="w-full h-[250px] rounded-lg" /> : (
                <ChartContainer config={pieChartConfig} className="mx-auto w-full h-full min-h-[350px]">
                    <PieChart className='flex-col items-center gap-2'>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
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
                      <ChartLegend content={<ChartLegendContent nameKey="name" className="flex-col items-start gap-2" />} />
                    </PieChart>
                </ChartContainer>
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
            ) : (
                <div className="space-y-4">
                {topStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/students/${student.id}`}
                    className="flex items-center p-2 -m-2 rounded-lg hover:bg-accent"
                  >
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${student.name.charAt(0)}`} alt="Avatar" data-ai-hint="profile picture" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                    <div className="ml-auto font-medium">
                        <Badge variant="destructive">{student.totalPoints} Poin</Badge>
                    </div>
                  </Link>
                ))}
                </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pelanggaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentViolationsTable />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Siswa Melanggar per Kelas</CardTitle>
            <CardDescription>Jumlah siswa unik yang melakukan pelanggaran di setiap kelas.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="w-full h-[250px] rounded-lg" /> : (
                <ChartContainer config={barChartConfig} className="w-full h-[300px]">
                    <ChartBarChart data={violationByClass} accessibilityLayer>
                        <ChartCartesianGrid vertical={false} />
                        <ChartXAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartYAxis allowDecimals={false}/>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartBar dataKey="total" radius={4}>
                          {violationByClass.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </ChartBar>
                    </ChartBarChart>
                </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
