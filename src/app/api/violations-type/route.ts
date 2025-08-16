
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-violations-type`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to fetch violation types' },
                { status: response.status }
            );
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

        // Check if user has admin or BK teacher role
        const userRole = token.jabatan;
        if (userRole !== 'Admin' && userRole !== 'Guru BK') {
            return NextResponse.json(
                { message: 'Forbidden: Only admin and BK teacher can perform this action' },
                { status: 403 }
            );
        }

        const body = await req.json();

        // Calculate average point from start_point and end_point
        const averagePoint = Math.round((body.start_point + body.end_point) / 2);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/add-violation-type`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.jwt}`,
            },
            body: JSON.stringify({
                nama_pelanggaran: body.nama_pelanggaran,
                kategori: body.kategori,
                start_point: body.start_point,
                end_point: body.end_point,
                poin: averagePoint, // For backward compatibility with existing data structure
                pembuat: token.nama, // Get creator name from token
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(
                { message: data.msg || 'Failed to add violation type' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
