# Update: CSV Import with Class Selector

## Changes Made

### Problem
User harus memasukkan `class_id` (UUID) di CSV yang sulit dan rawan error.

### Solution
- Tambahkan **class selector** di dialog import
- User pilih kelas dari dropdown
- CSV **tidak perlu** kolom `class_id`
- Frontend otomatis menambahkan `class_id` ke setiap siswa

## Updated CSV Template

### Before (Old)
```csv
name,nis,class_id,phone,address
Ahmad Fauzi,2024001,9ebfbadf-0c2c-4045-b593-5fa575fc813c,081234567890,Jl. Merdeka No. 1
```

### After (New)
```csv
name,nis,phone,address
Ahmad Fauzi,2024001,081234567890,Jl. Merdeka No. 1
Siti Nurhaliza,2024002,081234567891,Jl. Sudirman No. 2
Budi Santoso,2024003,081234567892,Jl. Gatot Subroto No. 3
```

✅ **Lebih sederhana!** Tidak perlu UUID lagi.

## Updated Component

**File:** `src/components/import-students-csv.tsx`

### New Features

#### 1. Class Selector
```typescript
const { data: classes } = useSWR<Classes[]>('/api/classes', fetcher);

<Select
    value={selectedClass}
    onValueChange={setSelectedClass}
>
    <SelectTrigger>
        <SelectValue placeholder="Pilih kelas untuk siswa" />
    </SelectTrigger>
    <SelectContent>
        {classes?.map((classItem) => (
            <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
            </SelectItem>
        ))}
    </SelectContent>
</Select>
```

#### 2. Updated Validation Schema
```typescript
// Removed class_id
const studentRowSchema = z.object({
    name: z.string().min(3, 'Nama harus minimal 3 karakter'),
    nis: z.string().min(1, 'NIS harus diisi'),
    phone: z.string().optional(),
    address: z.string().optional(),
});
```

#### 3. Updated CSV Headers
```typescript
// Before
const expectedHeaders = ['name', 'nis', 'class_id', 'phone', 'address'];

// After
const expectedHeaders = ['name', 'nis', 'phone', 'address'];
```

#### 4. Auto-add class_id
```typescript
// Add class_id to each student before sending
const studentsWithClass = students.map(student => ({
    ...student,
    class_id: selectedClass,
}));
```

## UI Flow

### Step 1: Download Template
```
┌────────────────────────────────────┐
│ 📄 Template CSV      [Download]    │
└────────────────────────────────────┘
```

### Step 2: Select Class
```
┌────────────────────────────────────┐
│ Pilih Kelas *                      │
│ ┌────────────────────────────────┐ │
│ │ X-1 IPA                     ▼  │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

### Step 3: Upload CSV
```
┌────────────────────────────────────┐
│ Pilih File CSV *                   │
│ [Choose File: students.csv]        │
│ File dipilih: students.csv (2.5 KB)│
└────────────────────────────────────┘
```

### Step 4: Import
```
[Batal]  [Import]
```

## Complete Dialog Layout

```
┌──────────────────────────────────────────┐
│ Import Siswa dari CSV                    │
│ Pilih kelas dan upload file CSV untuk   │
│ menambahkan banyak siswa sekaligus.      │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 📄 Template CSV        [Download]    │ │
│ │ Download template untuk format yang  │ │
│ │ benar                                │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Pilih Kelas *                            │
│ ┌──────────────────────────────────────┐ │
│ │ Pilih kelas untuk siswa           ▼  │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Pilih File CSV *                         │
│ [Choose File...]                         │
│                                          │
│ ℹ️ Petunjuk                              │
│ 1. Download template CSV terlebih dahulu │
│ 2. Pilih kelas untuk siswa               │
│ 3. Isi data siswa sesuai format template │
│ 4. Format CSV: name, nis, phone, address │
│ 5. Phone dan address bersifat opsional   │
│ 6. Upload file CSV yang sudah diisi      │
│                                          │
│              [Batal]  [Import]           │
└──────────────────────────────────────────┘
```

## Validation Rules

### Required Fields
- ✅ **Kelas** - Must select a class
- ✅ **File CSV** - Must upload CSV file

### CSV Validation
| Field | Required | Validation |
|-------|----------|------------|
| `name` | ✅ Yes | Min 3 chars |
| `nis` | ✅ Yes | Min 1 char |
| `phone` | ❌ No | Optional |
| `address` | ❌ No | Optional |

### Header Validation
```
Expected: name,nis,phone,address
```

## Data Flow

```
User selects class: "X-1 IPA"
       ↓
User uploads CSV:
  name,nis,phone,address
  Ahmad,2024001,081234567890,Jl. Merdeka
       ↓
Frontend adds class_id:
  {
    name: "Ahmad",
    nis: "2024001",
    phone: "081234567890",
    address: "Jl. Merdeka",
    class_id: "uuid-of-x-1-ipa"  ← Auto-added
  }
       ↓
Send to API
```

## Benefits

### Before (Old Way)
❌ User must know class UUID
❌ Copy-paste UUID from somewhere
❌ Error-prone (wrong UUID)
❌ Tedious for multiple classes

### After (New Way)
✅ Select class from dropdown
✅ User-friendly class names
✅ No UUID needed in CSV
✅ Less error-prone
✅ Faster workflow

## Example Usage

### Scenario: Import 10 students to class X-1 IPA

**Old Way:**
1. Find class UUID from database/API
2. Copy UUID: `9ebfbadf-0c2c-4045-b593-5fa575fc813c`
3. Paste UUID in every row of CSV
4. Upload CSV

**New Way:**
1. Select "X-1 IPA" from dropdown
2. Upload CSV (no UUID needed)
3. Done!

## Error Handling

### No Class Selected
```
❌ Kelas Belum Dipilih
Silakan pilih kelas terlebih dahulu.
```

### No File Selected
```
❌ File Belum Dipilih
Silakan pilih file CSV terlebih dahulu.
```

### Wrong CSV Format
```
❌ Error Validasi
• Header kolom 3 harus "phone", ditemukan "class_id"
```

### Classes Failed to Load
```
⚠️ Gagal memuat daftar kelas
```

## State Management

```typescript
const [selectedClass, setSelectedClass] = useState<string>('');
const [file, setFile] = useState<File | null>(null);

// Reset on dialog close
useEffect(() => {
    if (!open) {
        setFile(null);
        setSelectedClass('');
        setValidationErrors([]);
    }
}, [open]);
```

## Disabled States

### File Upload Disabled
- When no class selected
- Shows message: "Pilih kelas terlebih dahulu untuk mengaktifkan upload file"

### Import Button Disabled
- When no class selected
- When no file selected
- When loading

### Class Selector Disabled
- When loading
- When no classes available
- When classes failed to load

## Testing Checklist

- [ ] Download template shows correct headers (no class_id)
- [ ] Class dropdown loads all available classes
- [ ] File upload disabled until class selected
- [ ] Can select class from dropdown
- [ ] Can upload CSV file
- [ ] Import button disabled until both selected
- [ ] CSV validation works without class_id
- [ ] class_id auto-added to each student
- [ ] Import succeeds with correct class
- [ ] All students assigned to selected class
- [ ] Dialog resets on close

## Files Updated

- ✅ `public/templates/students-template.csv` - Removed class_id column
- ✅ `src/components/import-students-csv.tsx` - Added class selector
  - Added useSWR to fetch classes
  - Added class select dropdown
  - Updated CSV validation (removed class_id)
  - Auto-add class_id before sending to API
  - Updated instructions

## Migration Guide

### For Users

**Old CSV:**
```csv
name,nis,class_id,phone,address
Ahmad,2024001,uuid-here,081234567890,Jl. Merdeka
```

**New CSV:**
```csv
name,nis,phone,address
Ahmad,2024001,081234567890,Jl. Merdeka
```

Just remove the `class_id` column!

### For Developers

No backend changes needed. Frontend handles adding `class_id` automatically.

---

**Updated:** 2025-11-29
**Status:** Complete
