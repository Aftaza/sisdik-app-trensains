import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.jwt) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user has permission (Admin or Guru BK)
        const userRole = session.user?.role;
        if (userRole !== 'Admin' && userRole !== 'Guru BK') {
            return NextResponse.json(
                { message: 'Forbidden: Hanya Admin atau Guru BK yang dapat mengimpor siswa' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { students } = body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return NextResponse.json(
                { message: 'Data siswa tidak valid atau kosong' },
                { status: 400 }
            );
        }

        // Import students one by one since backend doesn't have bulk endpoint
        const results = {
            success: [] as any[],
            failed: [] as { student: any; error: string }[],
        };

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/students`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.jwt}`,
                    },
                    body: JSON.stringify(student),
                });

                const data = await response.json();

                if (!response.ok) {
                    console.log(data)
                    results.failed.push({
                        student,
                        error: data.message || `Failed to create student: ${student.name}`,
                    });
                } else {
                    results.success.push(data.data || data);
                }
            } catch (error) {
                results.failed.push({
                    student,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // Return summary
        const totalSuccess = results.success.length;
        const totalFailed = results.failed.length;

        if (totalFailed === 0) {
            return NextResponse.json({
                message: `Berhasil mengimpor ${totalSuccess} siswa`,
                data: {
                    success: totalSuccess,
                    failed: 0,
                    results: results.success,
                },
            });
        } else if (totalSuccess === 0) {
            return NextResponse.json(
                {
                    message: `Gagal mengimpor semua siswa (${totalFailed} gagal)`,
                    data: {
                        success: 0,
                        failed: totalFailed,
                        errors: results.failed,
                    },
                },
                { status: 400 }
            );
        } else {
            return NextResponse.json({
                message: `Import selesai: ${totalSuccess} berhasil, ${totalFailed} gagal`,
                data: {
                    success: totalSuccess,
                    failed: totalFailed,
                    results: results.success,
                    errors: results.failed,
                },
            });
        }
    } catch (error) {
        console.error('Error importing students:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
