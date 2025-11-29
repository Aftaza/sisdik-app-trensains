# Fix: Sanctions Page & Form - Dynamic Array Fields

## Changes Made

### 1. Updated Sanction Type Definition

```typescript
// ✅ Updated Sanction type
export type Sanction = {
    id: string;
    name: string[];  // Changed from string to array
    start_poin: number;
    end_poin: number;
    created_at: string;
    updated_at: string;
};
```

### 2. Fixed Sanctions Page

#### Permission Check
```typescript
// ❌ Before
const userRole = session?.user?.jabatan;

// ✅ After
const userRole = session?.user?.role;
```

#### Display Name Array
```typescript
// ❌ Before
<TableCell>{sanction.pembinaan}</TableCell>

// ✅ After
<TableCell>
    {sanction.name && sanction.name.length > 0 
        ? sanction.name.join(', ') 
        : '-'
    }
</TableCell>
```

#### Fixed Delete Handler
```typescript
// ❌ Before
const handleDelete = async (sanctionId: number) => {

// ✅ After
const handleDelete = async (sanctionId: string) => {
```

### 3. Rewrote Sanction Form with Dynamic Fields

#### New Form Schema
```typescript
const formSchema = z.object({
    names: z.array(
        z.object({
            value: z.string().min(3, 'Pembinaan harus diisi minimal 3 karakter.')
        })
    ).min(1, 'Minimal harus ada 1 pembinaan.'),
    start_point: z.number().int().min(0),
    end_point: z.number().int().min(0),
}).refine((data) => data.start_point <= data.end_point, {
    message: 'Poin awal tidak boleh lebih besar dari poin akhir.',
    path: ['end_point'],
});
```

#### Dynamic Field Array
```typescript
const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'names',
});
```

#### Add/Remove Buttons
- **Tambah Button**: Adds new pembinaan input field
- **X Button**: Removes pembinaan field (min 1 field required)

### 4. Form Features

**Dynamic Input Fields:**
```
Pembinaan/Sanksi:                    [+ Tambah]
┌─────────────────────────────────┐
│ Pembinaan 1: [Input field]  [X] │
│ Pembinaan 2: [Input field]  [X] │
│ Pembinaan 3: [Input field]  [X] │
└─────────────────────────────────┘

Poin Awal: [__]    Poin Akhir: [__]
```

**Add Mode:**
- Starts with 1 empty field
- Click "+ Tambah" to add more fields
- Click "X" to remove field (must keep at least 1)

**Edit Mode:**
- Pre-fills with existing pembinaan array
- Each item gets its own input field
- Can add/remove fields

## API Request Format

**Create Sanction:**
```json
{
  "name": [
    "Peringatan Lisan",
    "Teguran"
  ],
  "start_poin": 0,
  "end_poin": 10
}
```

**Update Sanction:**
```json
{
  "name": [
    "Peringatan Lisan",
    "Teguran",
    "Membersihkan kamar mandi"
  ],
  "start_poin": 0,
  "end_poin": 10
}
```

## Field Mapping

| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| `pembinaan` | `name` | string[] | Now array of strings |
| `start_poin` | `start_poin` | number | Unchanged |
| `end_poin` | `end_poin` | number | Unchanged |

## Form UI

### Add Sanction Form
```
┌─────────────────────────────────────┐
│ Formulir Sanksi Baru                │
├─────────────────────────────────────┤
│ Pembinaan/Sanksi:        [+ Tambah] │
│ ┌─────────────────────────────────┐ │
│ │ [Pembinaan 1________]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Poin Awal:  [0]  Poin Akhir: [10]  │
│                                     │
│         [Batal]  [Simpan]           │
└─────────────────────────────────────┘
```

### Edit Sanction Form
```
┌─────────────────────────────────────┐
│ Edit Sanksi                         │
├─────────────────────────────────────┤
│ Pembinaan/Sanksi:        [+ Tambah] │
│ ┌─────────────────────────────────┐ │
│ │ [Peringatan Lisan___]      [X]  │ │
│ │ [Teguran________________]  [X]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Poin Awal:  [0]  Poin Akhir: [10]  │
│                                     │
│         [Batal]  [Simpan]           │
└─────────────────────────────────────┘
```

## User Experience

1. **Add New Pembinaan:**
   - Click "+ Tambah" button
   - New input field appears
   - Fill in pembinaan name

2. **Remove Pembinaan:**
   - Click "X" button next to field
   - Field is removed
   - Cannot remove if only 1 field left

3. **Submit:**
   - All filled fields are sent as array
   - Empty fields are filtered out

## Validation

- ✅ Minimum 1 pembinaan required
- ✅ Each pembinaan min 3 characters
- ✅ Poin awal must be ≤ poin akhir
- ✅ Poin must be positive numbers

## Display in Table

**Example:**
```
| No | Pembinaan                                    | Rentang Poin |
|----|----------------------------------------------|--------------|
| 1  | Peringatan Lisan, Teguran                    | 0-10         |
| 2  | Peringatan Lisan                             | 11-20        |
| 3  | Membersihkan kamar mandi, Mengaji, Teguran   | 21-30        |
```

## Testing Checklist

- [ ] Page loads without errors
- [ ] "Tambah Sanksi" button appears for Guru BK/Admin
- [ ] Table displays pembinaan as comma-separated list
- [ ] Click "Tambah Sanksi" opens form
- [ ] Form starts with 1 input field
- [ ] Click "+ Tambah" adds new field
- [ ] Click "X" removes field
- [ ] Cannot remove last field
- [ ] Can submit with multiple pembinaan
- [ ] Edit shows all existing pembinaan in separate fields
- [ ] Can add/remove fields in edit mode
- [ ] Data saves correctly as array

## Files Updated

- ✅ `src/lib/data.ts`
  - Changed `name` from string to string[]
  - Removed `description` field

- ✅ `src/app/sanctions/page.tsx`
  - Fixed permission check (jabatan → role)
  - Fixed delete handler (number → string)
  - Display name array with join(', ')

- ✅ `src/components/sanction-form.tsx`
  - Complete rewrite with useFieldArray
  - Dynamic add/remove fields
  - Updated API request body
  - Fixed permission check

## Benefits

1. ✅ **Multiple Pembinaan**: Can add unlimited pembinaan per sanction
2. ✅ **User Friendly**: Visual add/remove buttons
3. ✅ **Flexible**: Easy to add or remove items
4. ✅ **Clean Data**: Empty fields filtered out
5. ✅ **Type Safe**: Proper TypeScript types

---

**Updated:** 2025-11-28
**Status:** Complete
