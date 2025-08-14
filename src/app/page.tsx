'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
    email: z.string().email({ message: 'Format email tidak valid.' }),
    password: z.string().min(1, { message: 'Password harus diisi.' }),
});

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const message = searchParams.get('message');
        if (message) {
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        }
    }, [searchParams, toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await signIn('credentials', {
                redirect: false, // Hindari redirect otomatis dari NextAuth
                email: values.email,
                password: values.password
            });

            if (response?.error) {
                toast({
                    title: 'Error',
                    description: response.error, // NextAuth akan memberikan pesan error di sini
                    variant: 'destructive',
                });
                return;
            }
            toast({
                title: 'Successfully Logged In!',
                description: 'Welcome to SISDIK ',
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
            <div
                aria-hidden="true"
                className="absolute -top-1/10 -left-1/10 h-96 w-96 animate-blob-1 rounded-full bg-primary/30 opacity-50 blur-xl filter"
            ></div>
            <div
                aria-hidden="true"
                className="absolute -bottom-1/10 -right-1/10 h-96 w-96 animate-blob-2 rounded-full bg-primary/50 opacity-50 blur-xl filter"
            ></div>
            <Card className="z-10 mx-auto w-full max-w-sm animate-fade-in-up">
                <CardHeader>
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
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Loading...' : 'Login'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
