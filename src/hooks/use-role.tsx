import { useSession } from 'next-auth/react';

/**
 * Hook untuk role-based access control
 */
export function useRole() {
    const { data: session } = useSession();
    const role = session?.user?.role;

    return {
        role,
        isGuruBK: role === 'Guru BK',
        isAdmin: role === 'Admin',
        isGuruBKOrAdmin: role === 'Guru BK' || role === 'Admin',
        canManageStudents: role === 'Guru BK' || role === 'Admin',
        canManageViolations: role === 'Guru BK' || role === 'Admin',
        canManageSanctions: role === 'Guru BK' || role === 'Admin',
        canDeleteViolationLogs: role === 'Guru BK' || role === 'Admin',
        canViewAll: true, // Semua guru bisa view
    };
}

/**
 * Component wrapper untuk role-based rendering
 */
export function RoleGuard({ 
    children, 
    allowedRoles 
}: { 
    children: React.ReactNode; 
    allowedRoles: string[] 
}) {
    const { role } = useRole();
    
    if (!role || !allowedRoles.includes(role)) {
        return null;
    }
    
    return <>{children}</>;
}

/**
 * Component untuk menampilkan konten hanya untuk Guru BK
 */
export function GuruBKOnly({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['Guru BK', 'Admin']}>{children}</RoleGuard>;
}

/**
 * Component untuk menampilkan konten hanya untuk Admin
 */
export function AdminOnly({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['Admin']}>{children}</RoleGuard>;
}
