'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '@/lib/data';

type StudentHeaderProps = {
    student: Student | undefined;
};

export function StudentHeader({ student }: StudentHeaderProps) {
    const totalPoints = student?.total_poin;
    
    const getPointsCardClassName = () => {
        if (typeof totalPoints !== 'number' || totalPoints === 0) {
            return 'bg-gray-100 border-gray-200';
        }
        if (totalPoints > 0 && totalPoints <= 50) {
            return 'bg-yellow-100 border-yellow-200';
        } else {
            return 'bg-destructive/10 border-destructive/20';
        }
    };

    const getPointsTextClassName = () => {
        if (typeof totalPoints !== 'number' || totalPoints === 0) {
            return 'text-gray-500';
        }
        if (totalPoints > 0 && totalPoints <= 50) {
            return 'text-yellow-600';
        } else {
            return 'text-destructive';
        }
    };

    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">{student?.name || 'Loading...'}</h1>
                <p className="text-muted-foreground">
                    {student?.nis || '-'} • {student?.classes?.name || '-'}
                </p>
            </div>
            <Card className={`w-full max-w-xs ${getPointsCardClassName()}`}>
                <CardHeader className="pb-2">
                    <CardTitle className={`text-sm font-medium ${getPointsTextClassName()}`}>
                        Total Poin Pelanggaran
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-5xl font-bold ${getPointsTextClassName()}`}>
                        {totalPoints}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
