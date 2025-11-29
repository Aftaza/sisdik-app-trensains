# Fix: Classes Page Data Display

## Problem
Classes page tidak menampilkan data dengan benar karena:
1. Menggunakan `session?.user?.jabatan` yang sudah tidak ada
2. Field names masih menggunakan struktur lama
3. Kolom "Wali Kelas" sudah tidak ada di API baru

## Changes Made

### 1. Fixed Role Check
```typescript
// ❌ Before
const userRole = session?.user?.jabatan;

// ✅ After
const userRole = session?.user?.role;
```

### 2. Removed "Wali Kelas" Column
API baru tidak memiliki field `wali_kelas`, jadi kolom ini dihapus.

**Before:**
- Nama Kelas
- Wali Kelas ❌ (removed)
- Jumlah Siswa

**After:**
- Nama Kelas
- Jumlah Siswa

### 3. Updated Field Names
```typescript
// ❌ Before
<TableCell>{classItem?.nama_kelas}</TableCell>
<TableCell>{classItem?.wali_kelas}</TableCell>
<TableCell>{classItem?.total_siswa}</TableCell>

// ✅ After
<TableCell>{classItem?.name || '-'}</TableCell>
<TableCell>{classItem?.student_count || 0}</TableCell>
```

### 4. Fixed Delete Handler
```typescript
// ❌ Before
handleDelete(classItem.id.toString())

// ✅ After
handleDelete(classItem.id)  // ID is already string (UUID)
```

### 5. Updated ColSpan
Karena kolom berkurang dari 4 menjadi 3:
```typescript
// ❌ Before
<TableCell colSpan={canPerformActions ? 4 : 3}>

// ✅ After
<TableCell colSpan={canPerformActions ? 3 : 2}>
```

## Field Mapping

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `nama_kelas` | `name` | Renamed |
| `wali_kelas` | - | Removed |
| `total_siswa` | `student_count` | Renamed |
| `id` | `id` | Changed from number to string (UUID) |

## Files Updated
- ✅ `src/app/classes/page.tsx` - Fixed all data display issues

## Testing Checklist
- [ ] Classes page loads without errors
- [ ] Class names display correctly
- [ ] Student count displays correctly
- [ ] Add/Edit/Delete actions work (for Guru BK/Admin)
- [ ] Pagination works
- [ ] No "Wali Kelas" column shown

## Related Fixes
This is part of the broader API migration. Similar fixes applied to:
- ✅ Students page - Fixed `class.name` nested data
- ✅ Sidebar - Fixed `role` field
- ✅ Auth - Added `role` to session

---

**Fixed:** 2025-11-28
