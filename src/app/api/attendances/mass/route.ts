import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// Helper function to convert date format to English month name
function convertToEnglishMonthYear(dateString: string): string {
    const [year, month] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    // Format to English month name and year
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = monthNames[date.getMonth()];
    return `${monthName} ${year}`;
}

// POST method - add a new attendance log from CSV file
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data (including file)
        const formData = await req.formData();
        
        // Extract form fields
        const classValue = formData.get('class') as string;
        const dateValue = formData.get('date') as string;
        const file = formData.get('file') as File | null;

        // Validate required fields
        if (!classValue) {
            return NextResponse.json(
                { message: 'Class is required' }, 
                { status: 400 }
            );
        }

        if (!dateValue) {
            return NextResponse.json(
                { message: 'Date is required' }, 
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { message: 'CSV file is required' }, 
                { status: 400 }
            );
        }

        // Convert date format to English month name (e.g., "August 2025")
        const englishMonthYear = convertToEnglishMonthYear(dateValue);

        // Build query parameters
        const queryParams = new URLSearchParams({
            kelas: classValue,
            bulan: englishMonthYear
        });
        
        // Forward request to backend API with file as binary body and query parameters
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/add-mass-attendance-student?${queryParams.toString()}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/csv',
                    Authorization: `Bearer ${token.jwt}`,
                },
                body: file, // Send file as binary directly
            }
        );

        // Handle response from backend
        let responseData: any;
        try {
            responseData = await response.json();
        } catch (jsonError) {
            // If response is not JSON, create a generic response
            responseData = { 
                message: await response.text() || 'Failed to add attendance' 
            };
        }

        if (!response.ok) {
            return NextResponse.json(
                { 
                    message: responseData.msg || responseData.message || 'Failed to add attendance' 
                },
                { status: response.status }
            );
        }

        return NextResponse.json(responseData, { status: 201 });
    } catch (error) {
        console.error('Attendance import error:', error);
        
        // Handle specific error types
        if (error instanceof Error) {
            if (error.name === 'FormDataError') {
                return NextResponse.json(
                    { message: 'Invalid form data provided' }, 
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { message: 'Internal server error during attendance import' }, 
            { status: 500 }
        );
    }
}

// Configure API to handle multipart/form-data
export const config = {
    api: {
        bodyParser: false,
    },
};