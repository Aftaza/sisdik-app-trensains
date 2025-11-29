# Fix: Teachers Page - Manual Changes Required

## Problem
Teachers page tidak menampilkan data dengan benar karena masalah yang sama dengan classes page:
1. Permission check menggunakan `jabatan` bukan `role`
2. Field names menggunakan `nama` dan `jabatan` bukan `name` dan `role`
3. Type `deletingId` menggunakan `number` bukan `string`

## Required Changes

### File: `src/app/teachers/page.tsx`

#### Change 1: Fix deletingId Type (Line 39)
```typescript
// ❌ Before
const [deletingId, setDeletingId] = useState<number | null>(null);

// ✅ After
const [deletingId, setDeletingId] = useState<string | null>(null);
```

#### Change 2: Fix Permission Check (Line 42)
```typescript
// ❌ Before
const hasPermission = session?.user?.jabatan === 'Admin' || session?.user?.jabatan === 'Guru BK';

// ✅ After
const hasPermission = session?.user?.role === 'Admin' || session?.user?.role === 'Guru BK';
```

#### Change 3: Fix handleDelete Parameter (Line 86)
```typescript
// ❌ Before
const handleDelete = async (teacherId: number) => {

// ✅ After
const handleDelete = async (teacherId: string) => {
```

#### Change 4: Fix Table Header (Line 151)
```typescript
// ❌ Before
<TableHead>Jabatan</TableHead>

// ✅ After
<TableHead>Role</TableHead>
```

#### Change 5: Fix Table Cell - Name (Line 177)
```typescript
// ❌ Before
{teacher.nama}

// ✅ After
{teacher.name || '-'}
```

#### Change 6: Fix Table Cell - Role Badge (Lines 180-191)
```typescript
// ❌ Before
<Badge
    variant={
        teacher.jabatan === 'Pimpinan Sekolah'
            ? 'destructive'
            : teacher.jabatan === 'Guru BK'
            ? 'default'
            : 'secondary'
    }
>
    {teacher.jabatan}
</Badge>

// ✅ After
<Badge
    variant={
        teacher.role === 'Admin'
            ? 'destructive'
            : teacher.role === 'Guru BK'
            ? 'default'
            : 'secondary'
    }
>
    {teacher.role || 'Guru'}
</Badge>
```

## Summary of Changes

| Line | Old Value | New Value |
|------|-----------|-----------|
| 39 | `useState<number \| null>` | `useState<string \| null>` |
| 42 | `session?.user?.jabatan` | `session?.user?.role` |
| 86 | `teacherId: number` | `teacherId: string` |
| 151 | `Jabatan` | `Role` |
| 177 | `teacher.nama` | `teacher.name \|\| '-'` |
| 183 | `teacher.jabatan === 'Pimpinan Sekolah'` | `teacher.role === 'Admin'` |
| 185 | `teacher.jabatan === 'Guru BK'` | `teacher.role === 'Guru BK'` |
| 190 | `{teacher.jabatan}` | `{teacher.role \|\| 'Guru'}` |

## Alternative: Use Find & Replace

In VS Code:
1. Press `Ctrl+H` (Find & Replace)
2. Make sure "Match Case" is ON

### Replace 1:
- Find: `session?.user?.jabatan`
- Replace: `session?.user?.role`

### Replace 2:
- Find: `teacher.jabatan`
- Replace: `teacher.role`

### Replace 3:
- Find: `teacher.nama`
- Replace: `teacher.name`

### Replace 4:
- Find: `useState<number | null>(null);`
- Replace: `useState<string | null>(null);`

### Replace 5:
- Find: `teacherId: number`
- Replace: `teacherId: string`

### Replace 6:
- Find: `<TableHead>Jabatan</TableHead>`
- Replace: `<TableHead>Role</TableHead>`

### Replace 7:
- Find: `'Pimpinan Sekolah'`
- Replace: `'Admin'`

## Expected Result

After changes:
- ✅ "Tambah Guru" button appears for Guru BK/Admin
- ✅ Table shows: Nama, Email, Role
- ✅ Data displays correctly
- ✅ Edit/Delete actions appear in dropdown

## Testing

1. Refresh page
2. Check if "Tambah Guru" button appears
3. Check if table shows teacher data
4. Check if dropdown menu has Edit/Delete options

---

**Created:** 2025-11-28
**Status:** Manual changes required
