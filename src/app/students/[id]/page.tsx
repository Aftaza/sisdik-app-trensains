import RootLayout from '../../dashboard/layout';
import { StudentProfileClient } from './client';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
    const { id } = await params;

    return (
        <RootLayout>
            <StudentProfileClient id={id} />
        </RootLayout>
    );
}
