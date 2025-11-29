# Fix: Violation Types Page & Form

## Changes Made

### 1. Updated Violation Types Page

#### Fixed Permission Check
```typescript
// ❌ Before
const userRole = session?.user?.jabatan;

// ✅ After
const userRole = session?.user?.role;
```

#### Fixed Field Names in Table
```typescript
// ❌ Before
<TableCell>{type.nama_pelanggaran}</TableCell>
<TableCell>{type.kategori}</TableCell>
<TableCell>{type.poin}</TableCell>
<TableCell>{type.pembuat}</TableCell>

// ✅ After
<TableCell>{type.name || '-'}</TableCell>
<TableCell>{type.category || '-'}</TableCell>
<TableCell>{type.points || 0}</TableCell>
<TableCell>{type.created_by?.name || '-'}</TableCell>
```

#### Fixed Delete Handler
```typescript
// ❌ Before
onConfirm={() => handleDelete(type.id.toString())}

// ✅ After
onConfirm={() => handleDelete(type.id)}  // ID already string
```

### 2. Updated Violation Type Form

#### Fixed Form Reset (Edit Mode)
```typescript
// ❌ Before
form.reset({
    name: violationType.nama_pelanggaran,
    category: violationType.kategori,
    points: violationType.poin || 0,
});

// ✅ After
form.reset({
    name: violationType.name || '',
    category: violationType.category || '',
    points: violationType.points || 0,
});
```

#### Fixed API Request Body
```typescript
// ❌ Before
body: JSON.stringify({
    nama_pelanggaran: values.name,
    kategori: values.category,
    poin: values.points,
    pembuat: creatorName,
})

// ✅ After
body: JSON.stringify({
    name: values.name,
    category: values.category,
    points: values.points,
})
```

#### Removed "Dibuat Oleh" Field
- Field `created_by` is now auto-populated by backend
- Removed from form UI
- Removed `creatorName` variable

### 3. Updated Type Definition

```typescript
// ✅ Updated ViolationType
export type ViolationType = {
    id: string;
    name: string;
    category: string;      // Changed from kategori
    points: number;        // Changed from poin
    created_by?: {         // Changed from pembuat (string)
        id: string;
        name: string;
    };
    created_at: string;
    updated_at: string;
};
```

## Field Mapping

| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| `nama_pelanggaran` | `name` | string | Violation name |
| `kategori` | `category` | string | Category |
| `poin` | `points` | number | Points |
| `pembuat` | `created_by` | object | Now nested object with id & name |

## Form Structure

**Add Violation Type:**
```
Nama Pelanggaran: [____________]
Kategori:         [Dropdown: Ringan/Sedang/Berat/Meninggalkan Kewajiban]
Poin Pelanggaran: [____________]
```

**Edit Violation Type:**
```
Nama Pelanggaran: [Terlambat]
Kategori:         [Ringan]
Poin Pelanggaran: [5]
```

## API Request Format

**Create Violation Type:**
```json
{
  "name": "Terlambat",
  "category": "Ringan",
  "points": 5
}
```

**Update Violation Type:**
```json
{
  "name": "Terlambat",
  "category": "Ringan",
  "points": 5
}
```

## Category Options

- Ringan
- Sedang
- Berat
- Meninggalkan Kewajiban

## Badge Colors

| Category | Badge Color |
|----------|-------------|
| Berat | Destructive (Red) |
| Sedang | Amber (Yellow) |
| Ringan | Secondary (Gray) |
| Meninggalkan Kewajiban | Secondary (Gray) |

## Testing Checklist

- [ ] Page loads without errors
- [ ] "Tambah Tipe" button appears for Guru BK/Admin
- [ ] Table shows: Name, Category, Points, Created By
- [ ] Created By shows teacher name (not "Unknown")
- [ ] Can create new violation type
- [ ] Can edit existing violation type
- [ ] Can delete violation type
- [ ] Form doesn't show "Dibuat Oleh" field
- [ ] Backend auto-populates created_by

## Files Updated

- ✅ `src/app/violation-types/page.tsx`
  - Fixed permission check (jabatan → role)
  - Updated all field names
  - Fixed delete handler

- ✅ `src/components/violation-type-form.tsx`
  - Updated form reset logic
  - Updated API request body
  - Removed "Dibuat Oleh" field
  - Removed unused creatorName variable

- ✅ `src/lib/data.ts`
  - Updated ViolationType definition
  - Changed field names
  - Made created_by nested object

## Benefits

1. ✅ Consistent with new API structure
2. ✅ Proper type safety
3. ✅ Cleaner form (no manual creator input)
4. ✅ Backend handles created_by automatically
5. ✅ Displays creator name correctly

---

**Updated:** 2025-11-28
**Status:** Complete
