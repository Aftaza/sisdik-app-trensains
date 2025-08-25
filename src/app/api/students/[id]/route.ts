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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-student/?nis=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
        });

        const data = await response.json();
        if (data.total_poin === ''){
            data.total_poin = 0;
        }
        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to fetch student data' },
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

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has permission (Admin or Guru BK)
        if (token.jabatan !== 'Admin' && token.jabatan !== 'Guru BK') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const body = await req.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/edit-student`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({ ...body, nis_lama: id }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to update student' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has permission (Admin or Guru BK)
        if (token.jabatan !== 'Admin' && token.jabatan !== 'Guru BK') {
            return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-student`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({ nis: id }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to delete student' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}