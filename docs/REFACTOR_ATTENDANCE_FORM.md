# Attendance Form - Updated to New API

## Changes Made

### 1. Form Schema Update

**Before (Old):**
```typescript
const formSchema = z.object({
    studentId: z.string(),
    studentName: z.string(),
    studentNis: z.string(),
    date: z.date(),
    status: z.enum(['Hadir', 'Sakit', 'Izin', 'Alpha']),
});
```

**After (New):**
```typescript
const formSchema = z.object({
    student_id: z.string().uuid(),
    date: z.date(),
    status: z.enum(['hadir', 'sakit', 'izin', 'alpha']), // lowercase!
    notes: z.string().optional(),
});
```

### 2. Field Changes

| Old Field | New Field | Change |
|-----------|-----------|--------|
| `studentId` | `student_id` | UUID instead of NIS |
| `studentName` | ❌ Removed | Not sent to API |
| `studentNis` | ❌ Removed | Not sent to API |
| `date` | `date` | Format changed to YYYY-MM-DD |
| `status` | `status` | Lowercase values |
| ❌ N/A | `notes` | New field (optional) |

### 3. Status Values

**Before (Capitalized):**
- `Hadir`
- `Sakit`
- `Izin`
- `Alpha`

**After (Lowercase):**
- `hadir`
- `sakit`
- `izin`
- `alpha`

### 4. Request Body

**Before (Old):**
```json
{
  "tanggal": "2025-11-29T...",
  "nis_siswa": "1320",
  "nama_siswa": "ZADANA",
  "kelas": "X-1",
  "status_absensi": "Hadir"
}
```

**After (New):**
```json
{
  "student_id": "uuid-of-student",
  "date": "2025-11-29",
  "status": "hadir",
  "notes": "Sakit demam"
}
```

### 5. Date Format

**Before:**
```typescript
date.toISOString() // "2025-11-29T02:11:44.022626+00:00"
```

**After:**
```typescript
date.toISOString().split('T')[0] // "2025-11-29"
```

### 6. Student Field Updates

**Before:**
```typescript
student?.nama_lengkap  // Old field
student?.nis           // Still used for display
student?.kelas         // Old field
```

**After:**
```typescript
student?.name          // New field
student?.nis           // Still used for display
student?.id            // Used for API (UUID)
```

## New Features

### 1. Notes Field ✨
Added optional notes field:
```typescript
<Textarea
    placeholder="Contoh: Sakit demam"
    value={notes}
/>
```

### 2. Better Validation ✅
- UUID validation for student_id
- Lowercase status enum
- Optional notes field

### 3. Simplified Form ✅
Removed unnecessary fields:
- ❌ studentName (not needed by API)
- ❌ studentNis (not needed by API)
- ❌ kelas (not needed by API)

## Form Fields

### 1. Student Name (Read-only)
```
┌────────────────────────┐
│ Nama Siswa             │
│ ┌────────────────────┐ │
│ │ ZADANA DOWMAN   🔒 │ │
│ └────────────────────┘ │
└────────────────────────┘
```

### 2. Student NIS (Read-only)
```
┌────────────────────────┐
│ NIS Siswa              │
│ ┌────────────────────┐ │
│ │ 1320            🔒 │ │
│ └────────────────────┘ │
└────────────────────────┘
```

### 3. Date Picker
```
┌────────────────────────┐
│ Tanggal                │
│ ┌────────────────────┐ │
│ │ 29/11/2025      📅 │ │
│ └────────────────────┘ │
└────────────────────────┘
```

### 4. Status Selection
```
┌────────────────────────┐
│ Status Kehadiran       │
│ ┌────────────────────┐ │
│ │ Hadir           ▼  │ │
│ │ Sakit              │ │
│ │ Izin               │ │
│ │ Alpha              │ │
│ └────────────────────┘ │
└────────────────────────┘
```

### 5. Notes (New!) ✨
```
┌────────────────────────┐
│ Catatan (Opsional)     │
│ ┌────────────────────┐ │
│ │ Sakit demam        │ │
│ │                    │ │
│ └────────────────────┘ │
└────────────────────────┘
```

## API Request Example

**POST /api/attendance**
```json
{
  "student_id": "25f5e3c6-8e0d-4711-937e-7fa239a5c446",
  "date": "2025-11-29",
  "status": "hadir",
  "notes": "Sakit demam"
}
```

**PUT /api/attendance/{id}**
```json
{
  "student_id": "25f5e3c6-8e0d-4711-937e-7fa239a5c446",
  "date": "2025-11-29",
  "status": "sakit",
  "notes": "Masih demam"
}
```

## Benefits

### 1. Simpler ✅
- Removed unnecessary fields
- Only sends what API needs
- Cleaner code

### 2. More Flexible ✅
- Optional notes field
- Better date handling
- UUID-based

### 3. Better UX ✅
- Notes for context
- Clear status options
- Proper validation

### 4. API Compatible ✅
- Matches backend exactly
- Lowercase status values
- Correct date format

## Migration Notes

### Breaking Changes
- ❌ Status values now lowercase
- ❌ Uses student_id (UUID) instead of NIS
- ❌ Date format changed to YYYY-MM-DD

### Data Migration
If editing existing attendance:
- Convert status to lowercase
- Ensure student_id is available
- Handle missing notes field

## Testing Checklist

- [ ] Can create new attendance
- [ ] Can edit existing attendance
- [ ] Date picker works
- [ ] Status selection works
- [ ] Notes field optional
- [ ] Validation works
- [ ] API request correct format
- [ ] Success toast shows
- [ ] Error handling works
- [ ] Data refreshes after submit

## Summary

**Status:** ✅ Complete
**Changes:** Updated to new API structure
**New Features:** Notes field
**Breaking Changes:** Yes (status lowercase, UUID-based)

---

**Updated:** 2025-11-29
**File:** `src/components/attendance-form.tsx`
**API:** POST/PUT /api/attendance
