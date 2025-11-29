'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SquareCheck, SquareX, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

interface SanctionsResponse {
    status: string | undefined;
    start_poin: number;
    end_poin: number;
    name: string[];
}

type StudentSanctionsCardProps = {
    studentId: string | undefined;
};

export function StudentSanctionsCard({ studentId }: StudentSanctionsCardProps) {
    const {
        data: sanctionsData,
        error: sanctionError,
        isLoading: sanctionLoading,
    } = useSWR<SanctionsResponse>(studentId ? `/api/sanctions/nis/${studentId}` : null, fetcher);
    const { toast } = useToast();

    // Debug: Log sanctions data
    // useEffect(() => {
    //     if (sanctionsData) {
    //         console.log('Sanctions Data:', sanctionsData);
    //     }
    //     if (sanctionError) {
    //         console.error('Sanctions Error:', sanctionError);
    //     }
    // }, [sanctionsData, sanctionError]);

    // Use localStorage to persist completed sanctions
    const [completedSanctions, setCompletedSanctions] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined' && studentId) {
            const stored = localStorage.getItem(`completed-sanctions-${studentId}`);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        return new Set(parsed);
                    }
                } catch (e) {
                    console.error('Failed to parse localStorage data:', e);
                }
            }
        }
        return new Set();
    });

    useEffect(() => {
        if (studentId) {
            localStorage.setItem(
                `completed-sanctions-${studentId}`,
                JSON.stringify(Array.from(completedSanctions))
            );
        }
    }, [completedSanctions, studentId]);

    const handleToggleSanction = (sanction: string) => {
        setCompletedSanctions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sanction)) {
                newSet.delete(sanction);
            } else {
                newSet.add(sanction);
            }
            return newSet;
        });
        toast({
            title: 'Status Pembinaan Diperbarui',
            description: completedSanctions.has(sanction)
                ? `"${sanction}" ditandai belum selesai.`
                : `"${sanction}" ditandai sudah selesai.`,
        });
    };

    if (sanctionLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (sanctionError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground p-6">
                    Data tidak ditemukan.
                </CardContent>
            </Card>
        );
    }

    if (
        !sanctionsData ||
        !sanctionsData.name ||
        !Array.isArray(sanctionsData.name) ||
        sanctionsData.name.length === 0
    ) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground p-6">
                    Tidak ada sanksi yang berlaku.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tindak Lanjut & Sanksi</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                    Rentang Poin: {sanctionsData.start_poin}-{sanctionsData.end_poin}
                </p>
                <ul className="space-y-4">
                    {sanctionsData.name.map((pembinaan, index) => {
                        const isCompleted = completedSanctions.has(pembinaan);
                        return (
                            <li
                                key={index}
                                className="flex items-start gap-4 cursor-pointer p-2 -m-2 rounded-lg hover:bg-accent"
                                onClick={() => handleToggleSanction(pembinaan)}
                            >
                                <div>
                                    {isCompleted ? (
                                        <SquareCheck className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <SquareX className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{pembinaan}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
}
