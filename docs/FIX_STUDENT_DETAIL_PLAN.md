# Student Detail Page - Fix Plan

## Issues Found

### 1. Field Names (Old → New)
- `nama_lengkap` → `name`
- `nis` → `nis` (unchanged)
- `kelas` → `class.name` (nested object)
- `total_poin` → `total_points`
- `jabatan` → `role` (for session user)

### 2. API Endpoints
Need to verify these endpoints match backend:
- `/api/students/{id}` - Get student detail
- `/api/violations-log/{id}` - Get student violations
- `/api/sanctions/{id}` - Get student sanctions
- `/api/attendances/get-nis/{id}` - Get student attendance

### 3. UX Improvements Needed
- Better loading states
- Error messages with retry
- Skeleton loaders
- Empty states
- Better error handling

## Changes Required

### File: `src/app/students/[id]/client.tsx`

**Line 377, 624:** Fix permission check
```typescript
// Before
const userRole = session?.user?.jabatan;

// After
const userRole = session?.user?.role;
```

**Line 732-734:** Fix student display
```typescript
// Before
<h1>{student?.nama_lengkap}</h1>
<p>{student?.nis} • {student?.kelas}</p>

// After
<h1>{student?.name}</h1>
<p>{student?.nis} • {student?.class?.name || '-'}</p>
```

**Line 687:** Fix total points
```typescript
// Before
const totalPoints = student?.total_poin;

// After
const totalPoints = student?.total_points;
```

### Attendance API
Need to check if endpoint uses `nis` or `id`:
- Current: `/api/attendances/get-nis/${studentId}`
- Might need: `/api/attendances/student/${studentId}`

## Implementation Plan

1. Update Student type definition
2. Fix all field references
3. Add better loading states
4. Add error boundaries
5. Add retry functionality
6. Improve empty states

---

**Status:** Analysis Complete
**Next:** Implement fixes
