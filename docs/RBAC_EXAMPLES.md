# Example: Implementing RBAC in Components

## Example 1: Students Page - Hide Add Button

**File:** `src/app/students/page.tsx`

```typescript
import { useRole } from '@/hooks/use-role';

export default function StudentsPage() {
    const { canManageStudents } = useRole();
    
    return (
        <>
            <div className="flex items-center justify-between">
                <h1>Daftar Siswa</h1>
                {canManageStudents && (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Siswa
                    </Button>
                )}
            </div>
            {/* Rest of the page */}
        </>
    );
}
```

## Example 2: Violation Logs - Conditional Delete

**File:** `src/app/logs/page.tsx`

```typescript
import { useRole } from '@/hooks/use-role';

export default function ViolationLogsPage() {
    const { canDeleteViolationLogs } = useRole();
    
    return (
        <Table>
            <TableBody>
                {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>{log.student_name}</TableCell>
                        <TableCell>{log.violation_type}</TableCell>
                        <TableCell>
                            <Button size="sm">View</Button>
                            {canDeleteViolationLogs && (
                                <Button size="sm" variant="destructive">
                                    Delete
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
```

## Example 3: Dashboard - Conditional Actions

**File:** `src/app/dashboard/page.tsx`

```typescript
import { useRole } from '@/hooks/use-role';
import { GuruBKOnly } from '@/hooks/use-role';

export default function DashboardPage() {
    const { canManageViolations } = useRole();
    
    return (
        <>
            <div className="flex items-center justify-between">
                <h1>Dashboard Utama</h1>
                
                {/* All teachers can create violation logs */}
                <ViolationLogForm>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Catat Pelanggaran
                    </Button>
                </ViolationLogForm>
            </div>
            
            {/* Stats cards visible to all */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>...</Card>
            </div>
            
            {/* Admin/BK only section */}
            <GuruBKOnly>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Sanctions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* BK-only content */}
                    </CardContent>
                </Card>
            </GuruBKOnly>
        </>
    );
}
```

## Example 4: Sanctions Page - Full Protection

**File:** `src/app/sanctions/page.tsx`

```typescript
import { useRole } from '@/hooks/use-role';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SanctionsPage() {
    const { canManageSanctions } = useRole();
    const router = useRouter();
    
    // Redirect if no permission
    useEffect(() => {
        if (!canManageSanctions) {
            router.push('/dashboard');
        }
    }, [canManageSanctions, router]);
    
    if (!canManageSanctions) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You don't have permission to access this page.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }
    
    return (
        <>
            <div className="flex items-center justify-between">
                <h1>Daftar Sanksi</h1>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Sanksi
                </Button>
            </div>
            {/* Rest of the page */}
        </>
    );
}
```

## Example 5: Table Actions - Conditional Columns

**File:** `src/components/students-table.tsx`

```typescript
import { useRole } from '@/hooks/use-role';

export function StudentsTable({ students }: { students: Student[] }) {
    const { canManageStudents } = useRole();
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    {canManageStudents && <TableHead>Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.map((student) => (
                    <TableRow key={student.id}>
                        <TableCell>{student.nis}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        {canManageStudents && (
                            <TableCell>
                                <Button size="sm">Edit</Button>
                                <Button size="sm" variant="destructive">
                                    Delete
                                </Button>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
```

## Example 6: Form - Conditional Submit

**File:** `src/components/violation-type-form.tsx`

```typescript
import { useRole } from '@/hooks/use-role';

export function ViolationTypeForm() {
    const { canManageViolations } = useRole();
    
    if (!canManageViolations) {
        return (
            <Alert>
                <AlertDescription>
                    You don't have permission to manage violation types.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <form>
            <Input name="name" placeholder="Violation Type Name" />
            <Input name="points" type="number" placeholder="Points" />
            <Button type="submit">Save</Button>
        </form>
    );
}
```

## Quick Implementation Checklist

### Pages to Update
- [ ] `src/app/students/page.tsx` - Hide add/edit/delete for non-BK
- [ ] `src/app/logs/page.tsx` - Hide delete for non-BK
- [ ] `src/app/sanctions/page.tsx` - Protect entire page for BK only
- [ ] `src/app/violation-types/page.tsx` - Protect for BK only
- [ ] `src/app/dashboard/page.tsx` - Optional: hide some actions

### Components to Update
- [ ] Student forms - Add role checks
- [ ] Violation log forms - Add role checks
- [ ] Sanction forms - Add role checks
- [ ] Tables - Conditional action columns

### Testing
- [ ] Test with Guru BK account
- [ ] Test with regular Guru account
- [ ] Test with Admin account
- [ ] Verify buttons show/hide correctly
- [ ] Verify redirects work

---

**Note:** Remember to also implement backend permission checks!
