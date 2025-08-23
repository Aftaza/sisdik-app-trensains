import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET method
export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const month = req.nextUrl.searchParams.get('month');
        const nis = req.nextUrl.searchParams.get('nis');

        // Penanganan kasus di mana kedua query ada atau tidak ada sama sekali
        if ((month && nis) || (!month && !nis)) {
            const message = (month && nis) ? 'Query Ganda tidak diizinkan.' : 'Query tidak ada.';
            return NextResponse.json({ message: message }, { status: 400 });
        }

        // Tentukan URL dan parameter secara dinamis untuk mengurangi redundansi
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const apiUrl = month
            ? `${baseUrl}/get-attendence-month/?tanggal=${month}`
            : `${baseUrl}/get-attendance-nis/?nis=${nis}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.msg || 'Gagal mengambil data' },
                { status: response.status }
            );
        }

        // Ambil data dari respons
        const data = await response.json();

        // Mengembalikan array kosong jika data bukan array
        const finalData = Array.isArray(data) ? data : [];

        return NextResponse.json(finalData);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST method - add a new violation log
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add-attendance-student`, {
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
                { message: data.msg || 'Failed to add attendance' },
                { status: response.status }
            );
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
