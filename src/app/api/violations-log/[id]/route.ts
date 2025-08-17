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

// PUT method - edit an existing violation log
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log(body);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/edit-violation-log`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({ ...body, id: parseInt(id)}),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to edit violation log' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE method - delete a violation log
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin or BK teacher role for delete action
        const userRole = token.jabatan;
        if (userRole !== 'Admin' && userRole !== 'Guru BK') {
            return NextResponse.json(
                { message: 'Forbidden: Only admin and BK teacher can delete violation logs' },
                { status: 403 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-violation-log`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({ id: id}),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to delete violation log' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}