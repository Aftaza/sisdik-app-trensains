import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin or BK teacher role
        const userRole = token.jabatan;
        if (userRole !== 'admin' && userRole !== 'guru_bk') {
            return NextResponse.json(
                { message: 'Forbidden: Only admin and BK teacher can perform this action' },
                { status: 403 }
            );
        }

        const body = await req.json();

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/edit-violation-type`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({
                id: id,
                nama_pelanggaran: body.nama_pelanggaran,
                kategori: body.kategori,
                start_point: body.start_point,
                end_point: body.end_point,
                pembuat: body.pembuat,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to edit violation type' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;

    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Check if user has admin or BK teacher role
        const userRole = token.jabatan;
        if (userRole !== 'admin' && userRole !== 'guru_bk') {
            return NextResponse.json(
                { message: 'Forbidden: Only admin and BK teacher can perform this action' },
                { status: 403 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/delete-violation-type`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({
                id: id,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to delete violation type' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}