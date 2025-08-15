// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Memanggil endpoint backend dengan parameter ID
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-violation-logs/?nis=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
        });

        let data = await response.json();

        // Lakukan validasi dan filter data
        // Pastikan `data` adalah array sebelum menggunakan filter
        if (Array.isArray(data)) {
            data = data.filter((v) => v && v.tanggal_terjadi);
        } else {
            // Jika data bukan array, kembalikan array kosong untuk mencegah error
            data = [];
        }
        
        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to fetch data' },
                { status: response.status }
            );
        }

        // Mengembalikan data siswa tunggal
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}