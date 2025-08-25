'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Suspense, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signIn, useSession } from 'next-auth/react';

const formSchema = z.object({
    email: z.string().email({ message: 'Format email tidak valid.' }),
    password: z.string().min(1, { message: 'Password harus diisi.' }),
});

function LoginContent() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { data: session, status } = useSession();

    // Redirect ke dashboard jika user sudah login
    useEffect(() => {
        if (status === 'authenticated' && session) {
            router.replace('/dashboard');
        }
    }, [status, session, router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await signIn('credentials', {
                redirect: false,
                email: values.email,
                password: values.password,
            });

            if (response?.error) {
                toast({
                    title: 'Error',
                    description: response.error,
                    variant: 'destructive',
                });
                return;
            }
            
            toast({
                title: 'Berhasil Masuk',
                description: 'Selamat datang kembali.',
            });
            
            // Redirect akan dilakukan otomatis oleh useEffect setelah session berubah
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Terjadi kesalahan.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Tampilkan loading saat mengecek status autentikasi
    if (status === 'loading') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Memeriksa status login...</p>
                </div>
            </div>
        );
    }

    // Jika sudah authenticated, tampilkan loading redirect
    if (status === 'authenticated') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Mengarahkan ke dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
            <div
                aria-hidden="true"
                className="absolute -top-1/10 -left-1/10 h-96 w-96 animate-blob-1 rounded-full bg-primary/30 dark:opacity-50 blur-xl filter"
            ></div>
            <div
                aria-hidden="true"
                className="absolute -bottom-1/10 -right-1/10 h-96 w-96 animate-blob-2 rounded-full bg-primary/50 dark:opacity-50 blur-xl filter"
            ></div>
            <Card className="z-10 mx-auto w-full max-w-sm animate-fade-in-up">
                <CardHeader className='text-center'>
                    <CardTitle className="text-2xl font-bold font-headline">
                        Selamat Datang di SISDIK
                    </CardTitle>
                    <CardDescription>Masukkan email dan password Anda untuk masuk</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="m@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 h-full px-3 py-1 text-muted-foreground hover:bg-transparent"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-white mx-auto" />
                                ) : (
                                    'Login'
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-6 w-6 animate-spin text-gray-700 dark:text-slate-100" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}