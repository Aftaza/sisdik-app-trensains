import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import ResponsiveLayout from '@/components/layout/responsive-layout';
import AppProvider from '@/context/UserContext';

export const metadata: Metadata = {
    title: 'SISDIK App',
    description: 'Student Discipline System for Guidance Counselors',
    robots: {
        index: false, // Jangan indeks halaman
        follow: false, // Jangan ikuti link di halaman
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true, // Jangan indeks gambar di situs ini
        },
    },
};

export default function RootPageLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body
                className={cn(
                    'font-body antialiased',
                    process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AppProvider>
                        
                        <ResponsiveLayout>{children}</ResponsiveLayout>
                        
                    </AppProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
