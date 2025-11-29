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

                    console.log('Attempting login for:', email);

                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email, password }),
                        }
                    );

                    const { data } = await response.json();
                    console.log('API Response:', JSON.stringify(data, null, 2));

                    if (!response.ok) {
                        console.log("Login failed - error response");
                        throw new Error(data.message || "Authentication failed. Please check your email or password.");
                    }

                    // Check if response has expected structure
                    if (!data.access_token) {
                        console.error('Missing access_token in response:', data);
                        throw new Error("Invalid response from server: missing access token");
                    }

                    if (!data.teacher) {
                        console.error('Missing teacher data in response:', data);
                        throw new Error("Invalid response from server: missing teacher data");
                    }

                    const { access_token, teacher } = data;

                    // Validate teacher object has required fields
                    if (!teacher.id || !teacher.name || !teacher.email) {
                        console.error('Incomplete teacher data:', teacher);
                        throw new Error("Invalid teacher data received from server");
                    }

                    console.log('Login successful for teacher:', teacher.name);

                    return { 
                        id: teacher.id,
                        name: teacher.name,
                        email: teacher.email,
                        nip: teacher.nip || '',
                        role: teacher.role || '',
                        jwt: access_token 
                    };
                } catch (error) {
                    console.error('Login error:', error);
                    if (error instanceof Error) {
                        throw new Error(error.message);
                    }
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
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.nip = user.nip;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token) {
                session.jwt = token.jwt;
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.nip = token.nip;
                session.user.role = token.role;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
