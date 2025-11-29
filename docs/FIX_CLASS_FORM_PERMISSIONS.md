# Fix: Class Form - Buttons Not Showing

## Problem Found! ✅

**Root Cause:** `ClassForm` component was using `session?.user?.jabatan` instead of `session?.user?.role`

```typescript
// ❌ WRONG - Line 46-47
const hasPermission = session?.user?.jabatan === 'Admin' || 
                     session?.user?.jabatan === 'Guru BK';

// Line 130-132 - Returns null if no permission!
if (!hasPermission) {
    return null;  // This was hiding the entire form!
}
```

## Solution Applied

### 1. Fixed Permission Check
```typescript
// ✅ CORRECT
const hasPermission = session?.user?.role === 'Admin' || 
                     session?.user?.role === 'Guru BK';
```

### 2. Updated Field Names
Removed "Wali Kelas" field (not in new API) and added "Description":

```typescript
// ❌ Before
const formSchema = z.object({
    name: z.string(),
    homeroomTeacher: z.string().min(1),  // Removed
});

// ✅ After
const formSchema = z.object({
    name: z.string(),
    description: z.string().optional(),  // Added
});
```

### 3. Updated API Request Body
```typescript
// ❌ Before
const body = {
    nama_kelas: values.name,
    wali_kelas: values.homeroomTeacher,
};

// ✅ After
const body = {
    name: values.name,
    description: values.description || '',
};
```

### 4. Updated Form Fields
**Before:**
- Nama Kelas
- Wali Kelas (dropdown)

**After:**
- Nama Kelas
- Deskripsi (optional text input)

## Files Updated

- ✅ `src/components/class-form.tsx` - Fixed permissions and field names
- ✅ `src/app/classes/page.tsx` - Already using useRole hook

## Why It Happened

1. When we migrated API, we changed `jabatan` → `role`
2. `ClassForm` was not updated
3. Permission check failed (`jabatan` was undefined)
4. Form returned `null` (line 130-132)
5. Buttons disappeared!

## Form Structure Now

**Add Class Form:**
```
Nama Kelas: [____________]
Deskripsi:  [____________] (optional)
```

**Edit Class Form:**
```
Nama Kelas: [X IPA 1]
Deskripsi:  [Kelas IPA] (optional)
```

## Expected Behavior After Fix

### Classes Page
- ✅ "Tambah Kelas" button appears (top right)
- ✅ "⋮" menu appears for each class
- ✅ Dropdown shows "Edit" and "Hapus"

### Form Dialog
- ✅ Opens when clicking "Tambah Kelas"
- ✅ Opens when clicking "Edit" in dropdown
- ✅ Shows Nama Kelas and Deskripsi fields
- ✅ Submits to correct API endpoint

## Testing Checklist

- [ ] Refresh page
- [ ] "Tambah Kelas" button appears
- [ ] Click "Tambah Kelas" - form opens
- [ ] Fill form and submit - creates class
- [ ] Click "⋮" on a class row
- [ ] "Edit" option appears in dropdown
- [ ] Click "Edit" - form opens with data
- [ ] Update and submit - updates class
- [ ] "Hapus" option still works

## Debug Info Should Show

After refresh, yellow debug box should show:
```
Session Status: authenticated
Role: Guru BK
Can Manage: true
Can Perform Actions: true
```

And buttons should appear!

## API Compatibility

**Create Class:**
```json
POST /api/classes
{
  "name": "X IPA 1",
  "description": "Kelas IPA"
}
```

**Update Class:**
```json
PUT /api/classes/:id
{
  "name": "X IPA 1",
  "description": "Kelas IPA"
}
```

---

**Fixed:** 2025-11-28
**Issue:** Permission check using old field name
**Solution:** Updated to use `role` instead of `jabatan`
