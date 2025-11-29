# Fix: Student Form - Classes Not Showing

## Problem
Ketika menambah data siswa, dropdown kelas kosong/tidak menampilkan data kelas.

## Root Cause
1. Form menggunakan prop `classOpt` yang diambil dari data students
2. Data `student.class` sekarang adalah object, bukan string
3. Form tidak fetch data classes langsung dari API

## Solution

### 1. Updated Student Form to Fetch Classes Directly
Form sekarang fetch data classes langsung dari API menggunakan SWR:

```typescript
// ✅ New approach
const { data: classes } = useSWR<Classes[]>('/api/classes', fetcher);
```

### 2. Updated Field Names
```typescript
// ❌ Before
const formSchema = z.object({
    nama: z.string(),
    nis: z.string(),
    kelas: z.string(),
});

// ✅ After
const formSchema = z.object({
    name: z.string(),
    nis: z.string(),
    class_id: z.string(),  // Now uses class ID (UUID)
    phone: z.string().optional(),
    address: z.string().optional(),
});
```

### 3. Updated Dropdown to Use Class Objects
```typescript
// ❌ Before
{classOpt?.map((opt) => (
    <SelectItem key={opt} value={opt}>
        {opt}
    </SelectItem>
))}

// ✅ After
{classes?.map((classItem) => (
    <SelectItem key={classItem.id} value={classItem.id}>
        {classItem.name}
    </SelectItem>
))}
```

### 4. Added New Fields
Form sekarang mendukung field tambahan:
- ✅ Phone (optional)
- ✅ Address (optional)

### 5. Updated API Endpoint
```typescript
// ❌ Before
isEditMode ? `/api/students/${student?.nis}` : '/api/students'

// ✅ After
isEditMode ? `/api/students/${student?.id}` : '/api/students'
```

### 6. Removed classOpt Prop
Students page tidak perlu pass `classOpt` lagi:

```typescript
// ❌ Before
<StudentForm classOpt={classOptions.filter((opt) => opt !== 'Semua')}>
    <Button disabled={isLoading || !classOptions || classOptions.length <= 1}>
        Tambah Siswa
    </Button>
</StudentForm>

// ✅ After
<StudentForm>
    <Button disabled={isLoading}>
        Tambah Siswa
    </Button>
</StudentForm>
```

## Changes Made

### Files Updated
- ✅ `src/components/student-form.tsx` - Complete rewrite
  - Fetch classes from API
  - Updated field names
  - Added phone and address fields
  - Use class_id instead of class name
  
- ✅ `src/app/students/page.tsx` - Removed classOpt prop
  - Removed classOpt from add button
  - Removed classOpt from edit dropdown

## Field Mapping

| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| `nama` | `name` | string | Renamed |
| `nis` | `nis` | string | Unchanged |
| `kelas` | `class_id` | string | Now UUID, not class name |
| - | `phone` | string? | New optional field |
| - | `address` | string? | New optional field |

## Form Behavior

### Add Student
1. Opens form dialog
2. Fetches classes from `/api/classes`
3. Populates dropdown with class names
4. Submits with `class_id` (UUID)

### Edit Student
1. Opens form with existing data
2. Pre-fills all fields including class
3. Class dropdown shows current class selected
4. Updates student data

## Testing Checklist
- [ ] Open add student form
- [ ] Classes dropdown shows all classes
- [ ] Can select a class
- [ ] Can fill phone and address (optional)
- [ ] Submit creates student successfully
- [ ] Edit student form shows correct class
- [ ] Can change class in edit mode
- [ ] NIS field disabled in edit mode

## API Request Format

### Create Student
```json
{
  "name": "Budi Santoso",
  "nis": "12345",
  "class_id": "uuid-of-class",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 123"
}
```

### Update Student
```json
{
  "name": "Budi Santoso",
  "nis": "12345",
  "class_id": "uuid-of-class",
  "phone": "081234567890",
  "address": "Jl. Merdeka No. 123"
}
```

## Benefits

1. ✅ Form is self-contained - fetches its own data
2. ✅ Always shows latest classes
3. ✅ No dependency on parent component
4. ✅ Supports new optional fields
5. ✅ Uses proper UUIDs for relationships

---

**Fixed:** 2025-11-28
