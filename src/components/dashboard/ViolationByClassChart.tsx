'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/chart';
import { Cell } from 'recharts';
import { useMemo } from 'react';

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

interface Student {
    id: string;
    nis: string;
    name: string;
    classes: {
        name: string;
    } | null;
    total_poin: number;
}

type ViolationByClassChartProps = {
    violations: Violation[];
    students: Student[];
    isLoading: boolean;
};

const chartColors = ['#2A628F', '#5582A6', '#7CB5B8', '#A3E4D7', '#CFFAD3'];

export function ViolationByClassChart({
    violations,
    students,
    isLoading,
}: ViolationByClassChartProps) {
    const violationByClass = useMemo(() => {
        if (!violations || !students) return [];
        const counts: { [key: string]: Set<string> } = {};
        violations.forEach((v) => {
            const student = students.find((s) => s.nis === v.students?.nis);
            if (student) {
                const className = student.classes?.name || 'Unknown';
                if (!counts[className]) {
                    counts[className] = new Set();
                }
                counts[className].add(student.nis.toString());
            }
        });
        return Object.entries(counts).map(([name, studentSet], index) => ({
            name,
            total: studentSet.size,
            fill: chartColors[index % chartColors.length],
        }));
    }, [violations, students]);

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
    );
}
