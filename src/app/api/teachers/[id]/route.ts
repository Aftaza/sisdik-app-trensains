import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

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
        console.log(body)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/edit-teacher`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({ ...body, id: parseInt(id) }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to update teacher' },
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-teacher`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({ id: parseInt(id) }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to delete teacher' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}