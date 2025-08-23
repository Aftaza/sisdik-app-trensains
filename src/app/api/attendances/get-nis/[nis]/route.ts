import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest, { params }: { params: { nis: string } }) {
    const { nis } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Penanganan kasus di mana param tidak ada sama sekali
        if (!nis) {
            return NextResponse.json({ message: 'Param tidak ada.' }, { status: 400 });
        }

        // Tentukan URL dan parameter secara dinamis untuk mengurangi redundansi
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const apiUrl = `${baseUrl}/get-attendance-nis/?nis=${nis}`

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