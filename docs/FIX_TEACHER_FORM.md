# Fix: Teacher Form - Updated to Match New API

## Changes Made

### 1. Updated Form Schema
Added `nip` field and fixed validation messages:

```typescript
// ✅ Updated schema
const formSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi minimal 3 karakter.'),
    email: z.string().email('Format email tidak valid.'),
    nip: z.string().optional(), // NIP opsional
    role: z.string().min(1, 'Role harus dipilih.'),
    password: z.string().optional(),
});
```

### 2. Updated Role Options
Changed from old roles to new API roles:

```typescript
// ❌ Before
const roleOptions = ['Guru BK', 'Wali Kelas', 'Pimpinan Sekolah'];

// ✅ After
const roleOptions = ['Admin', 'Guru BK', 'Guru'];
```

### 3. Added NIP Field to Form
```typescript
<FormField
    control={form.control}
    name="nip"
    render={({ field }) => (
        <FormItem>
            <FormLabel>NIP (Opsional)</FormLabel>
            <FormControl>
                <Input placeholder="Contoh: 198001012005011001" {...field} />
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>
```

### 4. Updated Form Default Values
```typescript
defaultValues: {
    name: '',
    email: '',
    nip: '',      // Added
    role: '',
    password: '',
}
```

### 5. Updated Form Reset Logic
```typescript
// Edit mode
form.reset({
    name: teacher.name,
    email: teacher.email,
    nip: teacher.nip || '',  // Added
    role: teacher.role,
    password: '',
});

// Add mode
form.reset({
    name: '',
    email: '',
    nip: '',  // Added
    role: '',
    password: '',
});
```

### 6. Updated UI Labels
- Changed "Jabatan" → "Role"
- Changed "Pilih jabatan" → "Pilih role"

## Form Structure Now

**Add Teacher Form:**
```
Nama Lengkap:  [____________]
Email:         [____________]
NIP:           [____________] (optional)
Role:          [Dropdown: Admin/Guru BK/Guru]
Password:      [____________]
```

**Edit Teacher Form:**
```
Nama Lengkap:  [Siti Nurhaliza]
Email:         [siti@example.com]
NIP:           [198001012005011001] (optional)
Role:          [Guru BK]
Password:      [____________] (disabled)
☐ Ubah Password
```

## API Request Format

**Create Teacher:**
```json
{
  "name": "Siti Nurhaliza",
  "email": "siti@example.com",
  "nip": "198001012005011001",
  "role": "Guru BK",
  "password": "password123"
}
```

**Update Teacher:**
```json
{
  "name": "Siti Nurhaliza",
  "email": "siti@example.com",
  "nip": "198001012005011001",
  "role": "Guru BK",
  "password": ""  // Empty if not changing password
}
```

## Role Values

| Old Value | New Value |
|-----------|-----------|
| `Pimpinan Sekolah` | `Admin` |
| `Guru BK` | `Guru BK` (unchanged) |
| `Wali Kelas` | `Guru` |

## Field Mapping

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ Yes | Min 3 characters |
| `email` | string | ✅ Yes | Valid email format |
| `nip` | string | ❌ No | Optional, for identification |
| `role` | string | ✅ Yes | One of: Admin, Guru BK, Guru |
| `password` | string | ⚠️ Conditional | Required for create, optional for update |

## Password Handling

### Add Mode:
- Password field is **enabled**
- Password is **required** (min 6 characters)
- No checkbox shown

### Edit Mode:
- Password field is **disabled** by default
- Checkbox "Ubah Password" shown
- When checked:
  - Password field becomes enabled
  - Password is required if filled (min 6 characters)
- When unchecked:
  - Password field disabled
  - Password value cleared
  - Password not sent to API

## Testing Checklist

- [ ] Open "Tambah Guru" form
- [ ] All fields appear (Name, Email, NIP, Role, Password)
- [ ] NIP is optional
- [ ] Role dropdown shows: Admin, Guru BK, Guru
- [ ] Can create teacher successfully
- [ ] Open "Edit" for existing teacher
- [ ] Data pre-fills correctly including NIP
- [ ] Password field is disabled
- [ ] Check "Ubah Password" enables password field
- [ ] Can update teacher without changing password
- [ ] Can update teacher with new password

## Files Updated

- ✅ `src/components/teacher-form.tsx`
  - Updated form schema
  - Updated role options
  - Added NIP field
  - Updated all field references
  - Updated UI labels

---

**Updated:** 2025-11-28
**Status:** Complete
