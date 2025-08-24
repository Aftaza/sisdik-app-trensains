import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest, { params }: { params: { month: string } }) {
    const { month } = await params;
    const formattedDate = new Date(`${month}-1`).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
        });
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Penanganan kasus di mana param tidak ada sama sekali
        if (!month) {
            return NextResponse.json({ message: 'Param tidak ada.' }, { status: 400 });
        }

        // Tentukan URL dan parameter secara dinamis untuk mengurangi redundansi
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const apiUrl = `${baseUrl}/get-attendance-month/?tanggal=${formattedDate}`

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
        let finalData = [];
        // Mengembalikan array kosong jika data bukan array
        // Lakukan validasi dan filter data
        // Pastikan `data` adalah array sebelum menggunakan filter
        if (Array.isArray(data)) {
            finalData = data.filter((v) => v && v.nis_siswa);
        } else {
            // Jika data bukan array, kembalikan array kosong untuk mencegah error
            finalData = [];
        }

        return NextResponse.json(finalData);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}