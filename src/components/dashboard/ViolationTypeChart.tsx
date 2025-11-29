'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
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

type ViolationTypeChartProps = {
    violations: Violation[];
    isLoading: boolean;
};

const chartColors = ['#2A628F', '#5582A6', '#7CB5B8', '#A3E4D7', '#CFFAD3'];

export function ViolationTypeChart({ violations, isLoading }: ViolationTypeChartProps) {
    const violationTypeCounts = useMemo(() => {
        if (!violations) return [];
        const counts: { [key: string]: number } = {};
        violations.forEach((v) => {
            const violationType = v.violation_types?.name || 'Unknown';
            counts[violationType] = (counts[violationType] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value], index) => ({
            name,
            value,
            fill: chartColors[index % chartColors.length],
        }));
    }, [violations]);

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

    return (
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
                ) : violationTypeCounts.length > 0 ? (
                    <ChartContainer
                        config={pieChartConfig}
                        className="mx-auto w-full h-full min-h-[350px]"
                    >
                        <PieChart className="flex-col items-center gap-2">
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
                )}
            </CardContent>
        </Card>
    );
}
