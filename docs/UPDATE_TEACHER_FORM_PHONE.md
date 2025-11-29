# Update: Teacher Form - Added Phone Field

## Changes Made

### 1. Added Phone to Schema
```typescript
const formSchema = z.object({
    name: z.string().min(3, 'Nama harus diisi minimal 3 karakter.'),
    email: z.string().email('Format email tidak valid.'),
    nip: z.string().optional(),
    phone: z.string().optional(), // ✅ NEW
    role: z.string().min(1, 'Role harus dipilih.'),
    password: z.string().optional(),
});
```

### 2. Added Phone to Default Values
```typescript
defaultValues: {
    name: '',
    email: '',
    nip: '',
    phone: '',  // ✅ NEW
    role: '',
    password: '',
}
```

### 3. Added Phone to Form Reset (Edit Mode)
```typescript
form.reset({
    name: teacher.name,
    email: teacher.email,
    nip: teacher.nip || '',
    phone: teacher.phone || '',  // ✅ NEW
    role: teacher.role,
    password: '',
});
```

### 4. Added Phone to Form Reset (Add Mode)
```typescript
form.reset({
    name: '',
    email: '',
    nip: '',
    phone: '',  // ✅ NEW
    role: '',
    password: '',
});
```

### 5. Added Phone Field to UI
```typescript
<FormField
    control={form.control}
    name="phone"
    render={({ field }) => (
        <FormItem>
            <FormLabel>No. Telepon (Opsional)</FormLabel>
            <FormControl>
                <Input placeholder="Contoh: 081234567890" {...field} />
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>
```

## Updated Form Structure

**Add Teacher Form:**
```
Nama Lengkap:     [____________]
Email:            [____________]
NIP (Opsional):   [____________]
No. Telepon:      [____________] ✅ NEW
Role:             [Dropdown]
Password:         [____________]
```

**Edit Teacher Form:**
```
Nama Lengkap:     [Siti Nurhaliza]
Email:            [siti@example.com]
NIP (Opsional):   [198001012005011001]
No. Telepon:      [081234567890] ✅ NEW
Role:             [Guru BK]
Password:         [____________] (disabled)
☐ Ubah Password
```

## API Request Format

**Create Teacher:**
```json
{
  "name": "Siti Nurhaliza",
  "email": "siti@example.com",
  "nip": "198001012005011001",
  "phone": "081234567890",
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
  "phone": "081234567890",
  "role": "Guru BK",
  "password": ""
}
```

## Field Summary

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `name` | string | ✅ Yes | "Siti Nurhaliza" |
| `email` | string | ✅ Yes | "siti@example.com" |
| `nip` | string | ❌ No | "198001012005011001" |
| `phone` | string | ❌ No | "081234567890" |
| `role` | string | ✅ Yes | "Guru BK" |
| `password` | string | ⚠️ Conditional | "password123" |

## Testing Checklist

- [ ] Open "Tambah Guru" form
- [ ] Phone field appears after NIP
- [ ] Phone field is optional
- [ ] Can submit without phone
- [ ] Can submit with phone
- [ ] Open "Edit" for existing teacher
- [ ] Phone value pre-fills if exists
- [ ] Can update phone number
- [ ] Can clear phone number

## Files Updated

- ✅ `src/components/teacher-form.tsx`
  - Added phone to schema
  - Added phone to default values
  - Added phone to form reset logic
  - Added phone field to UI

---

**Updated:** 2025-11-28
**Status:** Complete
