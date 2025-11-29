import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: { nis: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.jwt) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { nis } = await params;

        // Call backend API with NIS
        const response = await fetch(`${API_BASE_URL}/api/violation-logs/student/${nis}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.jwt}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.log('Violations by NIS error:', data);
            return NextResponse.json(
                { message: data.message || 'Failed to fetch violations data' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching violations by NIS:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
