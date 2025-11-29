# Feature: CSV Import for Students

## Overview

Fitur import CSV memungkinkan Admin dan Guru BK untuk menambahkan banyak siswa sekaligus menggunakan file CSV. Fitur ini dilengkapi dengan:
- ✅ Template CSV yang bisa didownload
- ✅ Validasi file menggunakan Zod
- ✅ Validasi data setiap baris
- ✅ Error reporting yang detail
- ✅ Bulk insert ke database

## Files Created

### 1. CSV Template
**File:** `public/templates/students-template.csv`

```csv
name,nis,class_id,phone,address
Ahmad Fauzi,2024001,class-uuid-here,081234567890,Jl. Merdeka No. 1
Siti Nurhaliza,2024002,class-uuid-here,081234567891,Jl. Sudirman No. 2
Budi Santoso,2024003,class-uuid-here,081234567892,Jl. Gatot Subroto No. 3
```

### 2. Import Component
**File:** `src/components/import-students-csv.tsx`

**Features:**
- File upload dengan validasi type (.csv only)
- Download template button
- CSV parsing dan validation
- Zod schema validation per row
- Detailed error reporting
- Progress indicator

**Zod Schema:**
```typescript
const studentRowSchema = z.object({
    name: z.string().min(3, 'Nama harus minimal 3 karakter'),
    nis: z.string().min(1, 'NIS harus diisi'),
    class_id: z.string().uuid('Class ID harus berupa UUID yang valid'),
    phone: z.string().optional(),
    address: z.string().optional(),
});
```

### 3. API Route
**File:** `src/app/api/students/import/route.ts`

**Endpoint:** `POST /api/students/import`

**Request Body:**
```json
{
  "students": [
    {
      "name": "Ahmad Fauzi",
      "nis": "2024001",
      "class_id": "uuid-here",
      "phone": "081234567890",
      "address": "Jl. Merdeka No. 1"
    }
  ]
}
```

**Features:**
- Authentication check
- Role-based authorization (Admin/Guru BK only)
- Forwards to backend `/students/bulk` endpoint
- Error handling

### 4. Updated Students Page
**File:** `src/app/students/page.tsx`

**Changes:**
- Added "Import CSV" button
- Button only visible for Admin/Guru BK
- Triggers mutate() on success to refresh data

## User Flow

### 1. Download Template
```
┌─────────────────────────────────────┐
│ Import Siswa dari CSV               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📄 Template CSV                 │ │
│ │ Download template untuk format  │ │
│ │ yang benar      [Download]      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 2. Fill Template
User fills the CSV file:
```csv
name,nis,class_id,phone,address
Ahmad Fauzi,2024001,9ebfbadf-0c2c-4045-b593-5fa575fc813c,081234567890,Jl. Merdeka No. 1
```

### 3. Upload File
```
┌─────────────────────────────────────┐
│ Pilih File CSV                      │
│ [Choose File: students.csv]         │
│ File dipilih: students.csv (2.5 KB) │
└─────────────────────────────────────┘
```

### 4. Validation
**Success:**
```
✅ Validasi berhasil
[Import] button enabled
```

**Error:**
```
❌ Error Validasi
• Baris 2: class_id: Class ID harus berupa UUID yang valid
• Baris 3: name: Nama harus minimal 3 karakter
• Baris 5: nis: NIS harus diisi
```

### 5. Import
```
[Mengimpor...] ⏳

✅ Sukses
Berhasil mengimpor 10 siswa.
```

## Validation Rules

### File Validation
- ✅ Must be `.csv` file
- ✅ Must not be empty
- ✅ Must have header row

### Header Validation
- ✅ Must have exactly 5 columns
- ✅ Column names must match: `name,nis,class_id,phone,address`
- ✅ Order must be exact

### Data Validation (Per Row)
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | ✅ Yes | Min 3 characters |
| `nis` | string | ✅ Yes | Min 1 character |
| `class_id` | string | ✅ Yes | Must be valid UUID |
| `phone` | string | ❌ No | Optional |
| `address` | string | ❌ No | Optional |

## Error Handling

### File Errors
- **Wrong file type:** "Hanya file CSV yang diperbolehkan."
- **Empty file:** "File CSV kosong atau hanya berisi header."
- **Read error:** "Gagal membaca file."

### Header Errors
- **Wrong column count:** "Header tidak sesuai. Expected: name, nis, class_id, phone, address"
- **Wrong column name:** "Header kolom 1 harus 'name', ditemukan 'nama'"

### Data Errors
- **Per row validation:** "Baris 2: name: Nama harus minimal 3 karakter"
- **UUID validation:** "Baris 3: class_id: Class ID harus berupa UUID yang valid"

### API Errors
- **Unauthorized:** "Unauthorized"
- **Forbidden:** "Hanya Admin atau Guru BK yang dapat mengimpor siswa"
- **Backend error:** Error message from backend

## UI Components

### Import Dialog
```
┌────────────────────────────────────────────┐
│ Import Siswa dari CSV                      │
│ Upload file CSV untuk menambahkan banyak   │
│ siswa sekaligus.                           │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ 📄 Template CSV                        │ │
│ │ Download template untuk format yang    │ │
│ │ benar                    [Download]    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Pilih File CSV                             │
│ [Choose File...]                           │
│                                            │
│ ℹ️ Petunjuk                                │
│ 1. Download template CSV terlebih dahulu   │
│ 2. Isi data siswa sesuai format template   │
│ 3. Pastikan class_id berupa UUID yang valid│
│ 4. Phone dan address bersifat opsional     │
│ 5. Upload file CSV yang sudah diisi        │
│                                            │
│              [Batal]  [Import]             │
└────────────────────────────────────────────┘
```

### Students Page Buttons
```
Daftar Siswa                [Import CSV] [+ Tambah Siswa]
```

## Backend API Expectation

The frontend expects the backend to have this endpoint:

**Endpoint:** `POST /api/students/bulk`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "students": [
    {
      "name": "Ahmad Fauzi",
      "nis": "2024001",
      "class_id": "uuid",
      "phone": "081234567890",
      "address": "Jl. Merdeka No. 1"
    }
  ]
}
```

**Response (Success):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "created": 10,
    "failed": 0
  }
}
```

## Testing Checklist

### Template Download
- [ ] Click "Download" button
- [ ] File `students-template.csv` downloads
- [ ] File contains correct headers
- [ ] File contains example data

### File Upload
- [ ] Can select .csv file
- [ ] Shows file name and size
- [ ] Rejects non-CSV files
- [ ] Shows error for wrong file type

### Validation
- [ ] Validates header columns
- [ ] Validates header order
- [ ] Validates each row data
- [ ] Shows detailed error messages
- [ ] Highlights row numbers with errors

### Import
- [ ] Sends correct data to API
- [ ] Shows loading state
- [ ] Shows success message
- [ ] Refreshes student list
- [ ] Closes dialog on success

### Permissions
- [ ] Button only visible for Admin/Guru BK
- [ ] API rejects non-authorized users
- [ ] Shows permission error message

## Example CSV Files

### Valid CSV
```csv
name,nis,class_id,phone,address
Ahmad Fauzi,2024001,9ebfbadf-0c2c-4045-b593-5fa575fc813c,081234567890,Jl. Merdeka No. 1
Siti Nurhaliza,2024002,9ebfbadf-0c2c-4045-b593-5fa575fc813c,081234567891,Jl. Sudirman No. 2
Budi Santoso,2024003,9ebfbadf-0c2c-4045-b593-5fa575fc813c,,
```

### Invalid CSV (Wrong Header)
```csv
nama,nis,kelas,telepon,alamat
Ahmad Fauzi,2024001,X-1,081234567890,Jl. Merdeka No. 1
```
❌ Error: Header kolom 1 harus "name", ditemukan "nama"

### Invalid CSV (Bad UUID)
```csv
name,nis,class_id,phone,address
Ahmad Fauzi,2024001,not-a-uuid,081234567890,Jl. Merdeka No. 1
```
❌ Error: Baris 2: class_id: Class ID harus berupa UUID yang valid

### Invalid CSV (Short Name)
```csv
name,nis,class_id,phone,address
AB,2024001,9ebfbadf-0c2c-4045-b593-5fa575fc813c,081234567890,Jl. Merdeka No. 1
```
❌ Error: Baris 2: name: Nama harus minimal 3 karakter

## Benefits

1. ✅ **Bulk Import** - Add many students at once
2. ✅ **Validation** - Catch errors before sending to backend
3. ✅ **User Friendly** - Clear instructions and error messages
4. ✅ **Template** - Easy to use with provided template
5. ✅ **Type Safe** - Zod validation ensures data integrity
6. ✅ **Secure** - Role-based access control

---

**Created:** 2025-11-28
**Status:** Complete
