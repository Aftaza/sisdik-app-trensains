
import { Button } from '@/components/ui/button';
import { Home, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <TriangleAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-destructive">404</h1>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold">Halaman Tidak Ditemukan</h2>
        <p className="mt-4 max-w-md text-muted-foreground">
            Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.
        </p>
        <Button asChild className="mt-8">
            <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Dashboard
            </Link>
        </Button>
    </div>
  );
}
