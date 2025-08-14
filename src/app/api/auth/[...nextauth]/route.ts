import NextAuth, { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                try {
                    const { email, password } = loginSchema.parse(credentials);

                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth-login`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password }),
                        }
                    );

                    const data = await response.json();
                    if (!response.ok) {
                        console.log("error");
                        return null;
                    }

                    const { jwt, user } = data;

                    return { ...user, jwt };
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/',
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: any }) {
            if (user) {
                token.jwt = user.jwt;
                token.nama = user.nama;
                token.jabatan = user.jabatan;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token) {
                session.jwt = token.jwt;
                session.user.nama = token.nama;
                session.user.jabatan = token.jabatan;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
