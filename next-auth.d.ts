// next-auth.d.ts

import 'next-auth';
import 'next-auth/jwt';

// 1. Deklarasikan tipe untuk properti tambahan di JWT (token)
declare module 'next-auth/jwt' {
    interface JWT {
        jwt?: string;
        id?: string;
        name?: string;
        email?: string;
        nip?: string;
        role?: string;
    }
}

// 2. Deklarasikan tipe untuk properti tambahan di Session
declare module 'next-auth' {
    interface Session {
        jwt?: string; // Properti kustom di level session
        user: {
            id?: string;
            name?: string;
            email?: string;
            nip?: string;
            role?: string;
        };
    }
}
