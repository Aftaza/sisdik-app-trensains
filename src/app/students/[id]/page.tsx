import RootLayout from '../../dashboard/layout';
import { StudentProfileClient } from './client';

export default function StudentProfilePage({ params }: { params: { id: string } }) {

    return (
        <RootLayout>
            <StudentProfileClient id={params.id} />
        </RootLayout>
    );
}
