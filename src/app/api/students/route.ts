import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Secret key yang sama dengan yang digunakan di authOptions
const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
    try {
        // Mengambil token JWT dari request
        // Fungsi getToken akan secara otomatis mendekripsi cookie sesi
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`, // Menggunakan JWT dari objek token
            },
        });

        let data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch students' },
                { status: response.status }
            );
        }

        // Handle if response is wrapped in { data: [...] }
        if (data.data && Array.isArray(data.data)) {
            data = data.data;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to add student' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
