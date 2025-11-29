# Role-Based Access Control (RBAC)

## Overview
Backend sekarang memiliki field `role` pada teacher untuk mengatur hak akses di frontend.

## Roles

### 1. Guru BK (Bimbingan Konseling)
**Permissions:**
- ✅ Create, Read, Update, Delete Students
- ✅ Create, Read, Update, Delete Violation Types
- ✅ Create, Read, Update, Delete Violation Logs
- ✅ Create, Read, Update, Delete Sanctions
- ✅ Delete Violation Logs
- ✅ View all data

### 2. Admin
**Permissions:**
- ✅ All permissions (same as Guru BK)
- ✅ Manage Teachers
- ✅ Manage System Settings

### 3. Guru (Regular Teacher)
**Permissions:**
- ✅ View all data
- ✅ Create Violation Logs (report violations)
- ✅ View Attendance
- ❌ Cannot delete violation logs
- ❌ Cannot manage students
- ❌ Cannot manage sanctions
- ❌ Cannot manage violation types

## Implementation

### 1. Type Definitions Updated
- ✅ `src/lib/data.ts` - Added `role` to Teacher type
- ✅ `next-auth.d.ts` - Added `role` to JWT and Session types

### 2. Authentication Updated
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Store role in session

### 3. UI Updated
- ✅ `src/components/layout/sidebar-content.tsx` - Display role instead of email

### 4. Access Control Hook Created
- ✅ `src/hooks/use-role.tsx` - Role-based access control utilities

## Usage

### Using the Hook

```typescript
import { useRole } from '@/hooks/use-role';

function MyComponent() {
    const { isGuruBK, canManageStudents } = useRole();
    
    return (
        <div>
            {canManageStudents && (
                <Button>Add Student</Button>
            )}
        </div>
    );
}
```

### Using Role Guard Components

```typescript
import { GuruBKOnly, RoleGuard } from '@/hooks/use-role';

function MyComponent() {
    return (
        <div>
            {/* Only visible to Guru BK and Admin */}
            <GuruBKOnly>
                <Button>Delete Violation Log</Button>
            </GuruBKOnly>
            
            {/* Custom role check */}
            <RoleGuard allowedRoles={['Admin']}>
                <Button>Admin Only Action</Button>
            </RoleGuard>
        </div>
    );
}
```

### Available Permissions

```typescript
const {
    role,                    // Current user role
    isGuruBK,               // true if role is "Guru BK"
    isAdmin,                // true if role is "Admin"
    isGuruBKOrAdmin,        // true if Guru BK or Admin
    canManageStudents,      // Can CRUD students
    canManageViolations,    // Can CRUD violations
    canManageSanctions,     // Can CRUD sanctions
    canDeleteViolationLogs, // Can delete violation logs
    canViewAll,             // Can view all data (all roles)
} = useRole();
```

## Examples

### 1. Conditional Button Rendering

```typescript
import { useRole } from '@/hooks/use-role';

export function StudentActions() {
    const { canManageStudents } = useRole();
    
    return (
        <div>
            {canManageStudents && (
                <>
                    <Button>Add Student</Button>
                    <Button>Edit Student</Button>
                    <Button>Delete Student</Button>
                </>
            )}
        </div>
    );
}
```

### 2. Conditional Form Fields

```typescript
import { useRole } from '@/hooks/use-role';

export function ViolationLogForm() {
    const { canDeleteViolationLogs } = useRole();
    
    return (
        <form>
            {/* Form fields */}
            
            {canDeleteViolationLogs && (
                <Button variant="destructive">Delete</Button>
            )}
        </form>
    );
}
```

### 3. Page-Level Protection

```typescript
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
    const { isAdmin } = useRole();
    const router = useRouter();
    
    useEffect(() => {
        if (!isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, router]);
    
    if (!isAdmin) {
        return <div>Access Denied</div>;
    }
    
    return <div>Admin Content</div>;
}
```

### 4. Menu Item Filtering

```typescript
import { useRole } from '@/hooks/use-role';

export function Navigation() {
    const { canManageStudents, canManageSanctions } = useRole();
    
    const menuItems = [
        { label: 'Dashboard', href: '/dashboard', show: true },
        { label: 'Students', href: '/students', show: canManageStudents },
        { label: 'Sanctions', href: '/sanctions', show: canManageSanctions },
    ].filter(item => item.show);
    
    return (
        <nav>
            {menuItems.map(item => (
                <Link key={item.href} href={item.href}>
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
```

## Components to Update

### High Priority
1. **Dashboard** (`src/app/dashboard/page.tsx`)
   - Hide "Catat Pelanggaran" button for non-BK teachers (if needed)

2. **Students Page** (`src/app/students/page.tsx`)
   - Hide "Add Student" button for non-BK teachers
   - Hide edit/delete actions for non-BK teachers

3. **Violation Logs** (`src/app/logs/page.tsx`)
   - Hide delete button for non-BK teachers
   - All teachers can create logs

4. **Sanctions** (`src/app/sanctions/page.tsx`)
   - Hide CRUD actions for non-BK teachers

5. **Violation Types** (`src/app/violation-types/page.tsx`)
   - Hide CRUD actions for non-BK teachers

### Medium Priority
6. **Forms** - Add role checks to form submit buttons
7. **Tables** - Hide action columns for non-authorized users

## Testing

### Test Cases
1. ✅ Login as Guru BK - should see all actions
2. ✅ Login as Admin - should see all actions
3. ✅ Login as regular Guru - should see limited actions
4. ✅ Role displayed in sidebar
5. ✅ Buttons hidden/shown based on role

### Test Accounts Needed
- Guru BK account
- Admin account  
- Regular Guru account

## Security Notes

⚠️ **Important:** Frontend role checks are for UX only. Backend must also enforce permissions!

- Frontend checks hide UI elements
- Backend API must validate permissions
- Never trust client-side role checks for security

## Next Steps

1. ✅ Update type definitions
2. ✅ Update auth flow
3. ✅ Create role hook
4. ⏳ Update UI components to use role checks
5. ⏳ Test with different roles
6. ⏳ Ensure backend validates permissions

---

**Created:** 2025-11-28
**Status:** Implementation Ready
