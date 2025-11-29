# API Migration Summary

## Overview
Proyek ini sedang dalam proses migrasi dari API lama ke backend baru di `https://sisdik-be-trensains.vercel.app/api`.

## Completed Migrations

### ✅ Core Infrastructure
1. **Type Definitions** (`src/lib/data.ts`)
   - Updated all TypeScript interfaces to match new API structure
   - Changed ID types from `number` to `string` (UUID)
   - Updated field names to match new API response structure

2. **Authentication** (`src/app/api/auth/[...nextauth]/route.ts`)
   - Updated login endpoint: `/auth-login` → `/api/auth/login`
   - Updated response handling: `jwt` → `access_token`
   - Updated user object structure to use `teacher` instead of `user`
   - Updated session callbacks to store new teacher fields

### ✅ Students API
1. **GET /api/students** - Fetch all students
2. **POST /api/students** - Create student
3. **GET /api/students/:id** - Get student by ID
4. **PUT /api/students/:id** - Update student
5. **DELETE /api/students/:id** - Delete student

### ✅ Teachers API
1. **GET /api/teachers** - Fetch all teachers
2. **POST /api/teachers** - Create teacher
3. **PUT /api/teachers/:id** - Update teacher
4. **DELETE /api/teachers/:id** - Delete teacher

### ✅ Classes API
1. **GET /api/classes** - Fetch all classes
2. **POST /api/classes** - Create class
3. **PUT /api/classes/:id** - Update class
4. **DELETE /api/classes/:id** - Delete class

### ✅ Violation Types API (Partial)
1. **GET /api/violation-types** - Fetch all violation types
2. **POST /api/violation-types** - Create violation type

## Pending Migrations

### ⏳ Violation Types API
- [ ] PUT /api/violation-types/:id
- [ ] DELETE /api/violation-types/:id

### ⏳ Violation Logs API
- [ ] GET /api/violation-logs
- [ ] POST /api/violation-logs
- [ ] GET /api/violation-logs/:id
- [ ] PUT /api/violation-logs/:id
- [ ] DELETE /api/violation-logs/:id
- [ ] GET /api/violation-logs/student/:nis

### ⏳ Sanctions API
- [ ] GET /api/sanctions
- [ ] POST /api/sanctions
- [ ] GET /api/sanctions/:id
- [ ] PUT /api/sanctions/:id
- [ ] DELETE /api/sanctions/:id
- [ ] GET /api/sanctions/student/:nis

### ⏳ Attendance API
- [ ] GET /api/attendance
- [ ] POST /api/attendance
- [ ] GET /api/attendance/:id
- [ ] PUT /api/attendance/:id
- [ ] DELETE /api/attendance/:id
- [ ] POST /api/attendance/bulk (CSV upload - requires multipart/form-data)
- [ ] GET /api/attendance/month/:month
- [ ] GET /api/attendance/student/:nis

## Key Changes Made

### 1. Endpoint URL Structure
**Old:** `/get-students`, `/add-student`, `/edit-student`, etc.
**New:** RESTful structure with `/api/students`, `/api/students/:id`

### 2. HTTP Methods
- GET for fetching data
- POST for creating
- PUT for updating
- DELETE for deleting

### 3. ID Handling
**Old:** Integer IDs with `parseInt(id)`
**New:** UUID strings, no parsing needed

### 4. Request Body Structure
**Old:** Custom fields like `{ ...body, id: parseInt(id), nis_lama: oldNis }`
**New:** Clean body: `JSON.stringify(body)`

### 5. Response Structure
**Old:** `{ msg: "..." }`
**New:** `{ message: "..." }`

### 6. Permission Checks
**Old:** Frontend checks using `token.jabatan`
**New:** Backend handles all permission checks

## Frontend Components to Update

After API migration is complete, the following components need updates:

### High Priority
1. **Student Components**
   - `src/components/student-form.tsx` - Update field names
   - `src/app/students/page.tsx` - Update data display
   - `src/app/students/[nis]/page.tsx` - Change from NIS to ID routing

2. **Violation Components**
   - `src/components/violation-log-form.tsx` - Update field names
   - `src/app/logs/page.tsx` - Update data display

3. **Teacher Components**
   - `src/components/teacher-form.tsx` - Update field names
   - `src/app/teachers/page.tsx` - Update data display

4. **Class Components**
   - `src/components/class-form.tsx` - Update field names
   - `src/app/classes/page.tsx` - Update data display

5. **Attendance Components**
   - `src/components/attendance-form.tsx` - Update field names
   - `src/app/attendance/page.tsx` - Update data display
   - `src/app/attendance/import/page.tsx` - Update CSV upload to multipart/form-data

### Field Name Mappings for Frontend

#### Student
- `nama_lengkap` → `name`
- `kelas` → `class.name`
- `nis` → `nis` (unchanged)

#### Teacher
- `nama` → `name`
- `jabatan` → removed (no longer in response)

#### Class
- `nama_kelas` → `name`
- `wali_kelas` → removed
- `total_siswa` → `student_count`

#### Violation Type
- `nama_pelanggaran` → `name`
- `kategori` → removed
- `pembuat` → removed

#### Violation Log
- `nis_siswa` → `student.nis`
- `nama_siswa` → `student.name`
- `jenis_pelanggaran` → `violation_type.name`
- `catatan` → `notes`
- `pelapor` → `reporting_teacher.name`

#### Sanction
- `pembinaan` → `name`

#### Attendance
- `tanggal` → `date`
- `nama_siswa` → `student.name`
- `nis_siswa` → `student.nis`
- `status_absensi` → `status`

## Testing Checklist

### API Endpoints
- [ ] Test all GET endpoints
- [ ] Test all POST endpoints
- [ ] Test all PUT endpoints
- [ ] Test all DELETE endpoints
- [ ] Test authentication flow
- [ ] Test error handling

### Frontend Integration
- [ ] Test student CRUD operations
- [ ] Test teacher CRUD operations
- [ ] Test class CRUD operations
- [ ] Test violation type CRUD operations
- [ ] Test violation log CRUD operations
- [ ] Test sanction CRUD operations
- [ ] Test attendance CRUD operations
- [ ] Test CSV upload for bulk attendance

## Next Steps

1. Complete remaining API route migrations
2. Update frontend components to use new data structure
3. Test all functionality end-to-end
4. Update `.env` file with new API base URL
5. Deploy and verify in production

## Environment Variables

Update `.env` file:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_BASE_URL=https://sisdik-be-trensains.vercel.app
```

## Notes

- All permission checks are now handled by the backend
- The backend uses JWT authentication via Bearer token
- All IDs are now UUIDs instead of integers
- Response structures include nested objects for related data
- The new API follows RESTful conventions
