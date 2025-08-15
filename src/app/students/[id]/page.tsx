import RootLayout from '../../dashboard/layout';
import { StudentProfileClient } from './client';

export default async function StudentProfilePage({ params }: { params: { id: string } }) {

    return (
        <RootLayout>
            <StudentProfileClient id={await params.id} />
        </RootLayout>
    );
}
