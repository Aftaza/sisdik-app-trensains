'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type StudentErrorStateProps = {
    studentId: string;
    errorMessage?: string;
    onRetry: () => void;
};

export function StudentErrorState({ studentId, errorMessage, onRetry }: StudentErrorStateProps) {
    return (
        <div className="flex flex-col gap-4 p-8">
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Data Siswa Tidak Ditemukan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Terjadi kesalahan saat memuat data siswa dengan ID:{' '}
                        <code className="bg-muted px-2 py-1 rounded">{studentId}</code>
                    </p>
                    {errorMessage && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Details</AlertTitle>
                            <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
                        </Alert>
                    )}
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onRetry}>
                            Coba Lagi
                        </Button>
                        <Button variant="ghost" onClick={() => window.history.back()}>
                            Kembali
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
