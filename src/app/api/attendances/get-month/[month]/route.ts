import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest, { params }: { params: { month: string } }) {
    const { month } = await params;
    
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Validate month parameter (should be YYYY-MM format)
        if (!month || !/^\d{4}-\d{1,2}$/.test(month)) {
            return NextResponse.json({ message: 'Invalid month format. Use YYYY-MM' }, { status: 400 });
        }

        // Format month to YYYY-MM (ensure 2-digit month)
        const [year, monthNum] = month.split('-');
        const formattedMonth = `${year}-${monthNum.padStart(2, '0')}`;

        // Call backend API with new endpoint format
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const apiUrl = `${baseUrl}/api/attendance/month/${formattedMonth}`;

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
                { message: errorData.message || 'Failed to fetch attendance data' },
                { status: response.status }
            );
        }

        // Get data from response
        const responseData = await response.json();
        
        // Extract data array from response
        // Backend returns: { statusCode, message, data: [...] }
        const data = responseData.data || [];

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching monthly attendance:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}