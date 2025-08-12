
'use client';

import { Frown } from 'lucide-react';

export default function UnsupportedDevicePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <Frown className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold font-headline text-foreground">
        Perangkat Tidak Didukung
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Maaf, aplikasi ini dirancang untuk penggunaan di tablet dan desktop untuk pengalaman terbaik. Silakan akses melalui perangkat dengan layar yang lebih besar.
      </p>
    </div>
  );
}
