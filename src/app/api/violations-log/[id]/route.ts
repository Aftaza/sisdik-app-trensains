// app/api/violations-log/[id]/route.ts
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/violation-logs/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.log(data);
            return NextResponse.json(
                { message: data.message || 'Failed to fetch data' },
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/violation-logs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to edit violation log' },
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/violation-logs/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to delete violation log' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}