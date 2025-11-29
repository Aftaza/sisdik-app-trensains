import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// POST method - bulk upload attendance from CSV file
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret });

        if (!token || !token.jwt) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data (including file)
        const formData = await req.formData();
        
        // Extract file from form data
        const file = formData.get('file') as File | null;

        // Validate required fields
        if (!file) {
            return NextResponse.json(
                { message: 'CSV file is required' }, 
                { status: 400 }
            );
        }

        // Create new FormData for backend API
        const backendFormData = new FormData();
        backendFormData.append('file', file);
        
        // Forward request to backend API with multipart/form-data
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/bulk`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.jwt}`,
                    // Don't set Content-Type, let browser set it with boundary
                },
                body: backendFormData,
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
                    message: responseData.message || 'Failed to add attendance' 
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