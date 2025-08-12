
'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw, ServerCrash } from 'lucide-react';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <ServerCrash className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-destructive">500</h1>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold">Terjadi Kesalahan Server</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
            Maaf, terjadi kesalahan tak terduga di pihak kami. Tim kami telah diberitahu.
        </p>
        <Button onClick={() => reset()} className="mt-8">
            <RefreshCw className="mr-2 h-4 w-4" />
            Coba Lagi
        </Button>
    </div>
  );
}
