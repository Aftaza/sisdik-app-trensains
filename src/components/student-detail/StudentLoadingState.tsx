'use client';

import { Loader2 } from 'lucide-react';

export function StudentLoadingState() {
    return (
        <div className="flex flex-col gap-4 p-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500 mx-auto" />
            <p className="text-center text-muted-foreground">Memuat data siswa...</p>
        </div>
    );
}
