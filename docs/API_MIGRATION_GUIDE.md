# API Migration Guide

## Overview
Migrasi dari API lama ke backend baru: `https://sisdik-be-trensains.vercel.app/api`

## Endpoint Mapping

### Authentication
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/auth-login` | `/api/auth/login` | POST | Response structure changed |

### Teachers
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-teachers` | `/api/teachers` | GET | - |
| `/add-teacher` | `/api/teachers` | POST | - |
| `/update-teacher/:id` | `/api/teachers/:id` | PUT | - |
| `/delete-teacher/:id` | `/api/teachers/:id` | DELETE | - |
| - | `/api/teachers/info` | GET | New: Get logged in teacher info |

### Students
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-students` | `/api/students` | GET | - |
| `/add-student` | `/api/students` | POST | - |
| `/update-student/:id` | `/api/students/:id` | PUT | - |
| `/delete-student/:id` | `/api/students/:id` | DELETE | - |
| - | `/api/students/nis/:nis` | GET | New: Get student by NIS |

### Classes
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-classes` | `/api/classes` | GET | - |
| `/add-class` | `/api/classes` | POST | - |
| `/update-class/:id` | `/api/classes/:id` | PUT | - |
| `/delete-class/:id` | `/api/classes/:id` | DELETE | - |

### Violation Types
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-violations-type` | `/api/violation-types` | GET | - |
| `/add-violation-type` | `/api/violation-types` | POST | - |
| `/update-violation-type/:id` | `/api/violation-types/:id` | PUT | - |
| `/delete-violation-type/:id` | `/api/violation-types/:id` | DELETE | - |

### Violation Logs
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-violations-log` | `/api/violation-logs` | GET | - |
| `/add-violation-log` | `/api/violation-logs` | POST | - |
| `/update-violation-log/:id` | `/api/violation-logs/:id` | PUT | - |
| `/delete-violation-log/:id` | `/api/violation-logs/:id` | DELETE | - |
| - | `/api/violation-logs/student/:nis` | GET | New: Get logs by student NIS |

### Sanctions
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-sanctions` | `/api/sanctions` | GET | - |
| `/add-sanction` | `/api/sanctions` | POST | - |
| `/update-sanction/:id` | `/api/sanctions/:id` | PUT | - |
| `/delete-sanction/:id` | `/api/sanctions/:id` | DELETE | - |
| - | `/api/sanctions/student/:nis` | GET | New: Get applicable sanction for student |

### Attendance
| Old Endpoint | New Endpoint | Method | Changes |
|-------------|--------------|--------|---------|
| `/get-attendances` | `/api/attendance` | GET | - |
| `/add-attendance` | `/api/attendance` | POST | - |
| `/update-attendance/:id` | `/api/attendance/:id` | PUT | - |
| `/delete-attendance/:id` | `/api/attendance/:id` | DELETE | - |
| `/mass-attendance` | `/api/attendance/bulk` | POST | CSV upload via multipart/form-data |
| `/get-attendances-month/:month` | `/api/attendance/month/:month` | GET | - |
| `/get-attendances-nis/:nis` | `/api/attendance/student/:nis` | GET | - |
| `/export-attendances` | - | GET | Removed (handle client-side) |

## Data Type Changes

### Authentication Response
**Old:**
```json
{
  "jwt": "token",
  "user": {
    "nama": "string",
    "jabatan": "string"
  }
}
```

**New:**
```json
{
  "access_token": "token",
  "teacher": {
    "id": "uuid",
    "name": "string",
    "nip": "string",
    "email": "string",
    "phone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Student
**Old:**
```typescript
{
  nis: number;
  nama_lengkap: string;
  kelas: string;
  total_poin: number;
}
```

**New:**
```typescript
{
  id: string;
  name: string;
  nis: string;
  class_id: string;
  phone?: string;
  address?: string;
  total_poin: number;
  created_at: string;
  updated_at: string;
  class?: {
    id: string;
    name: string;
    description?: string;
  }
}
```

### Teacher
**Old:**
```typescript
{
  id: number;
  nama: string;
  email: string;
  jabatan: string;
}
```

**New:**
```typescript
{
  id: string;
  name: string;
  nip: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

### Violation Log
**Old:**
```typescript
{
  id: number;
  nis_siswa: string;
  nama_siswa: string;
  jenis_pelanggaran: string;
  catatan: string;
  tanggal_terjadi: string;
  tanggal_dicatat: string;
  pelapor: string;
  guru_bk: string;
  poin?: number;
}
```

**New:**
```typescript
{
  id: string;
  student_id: string;
  violation_type_id: string;
  reporting_teacher_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    nis: string;
  };
  violation_type?: {
    id: string;
    name: string;
    poin: number;
  };
  reporting_teacher?: {
    id: string;
    name: string;
  }
}
```

### Violation Type
**Old:**
```typescript
{
  id: number;
  nama_pelanggaran: string;
  kategori: string;
  pembuat: string;
  poin: number;
}
```

**New:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  poin: number;
  created_at: string;
  updated_at: string;
}
```

### Sanction
**Old:**
```typescript
{
  id: number;
  pembinaan: string;
  start_poin: number;
  end_poin: number;
}
```

**New:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  start_poin: number;
  end_poin: number;
  created_at: string;
  updated_at: string;
}
```

### Class
**Old:**
```typescript
{
  id: number;
  nama_kelas: string;
  wali_kelas: string;
  total_siswa: number;
}
```

**New:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  student_count: number;
  created_at: string;
  updated_at: string;
}
```

### Attendance
**Old:**
```typescript
{
  id: number;
  tanggal: string;
  nama_siswa: string;
  nis_siswa: number;
  kelas: string;
  status_absensi: string;
}
```

**New:**
```typescript
{
  id: string;
  student_id: string;
  date: string;
  status: "hadir" | "sakit" | "izin" | "alpha";
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    nis: string;
    class?: {
      name: string;
    }
  }
}
```

## Migration Steps

1. ✅ Update `.env` with new API base URL
2. ✅ Update type definitions in `src/lib/data.ts`
3. ✅ Update authentication flow in `src/app/api/auth/[...nextauth]/route.ts`
4. ✅ Update all API route handlers in `src/app/api/*`
5. ✅ Update components that use the data
6. ✅ Test all functionality

## Notes

- All IDs changed from `number` to `string` (UUID)
- Field names changed from snake_case to camelCase in some cases
- Authentication now returns `access_token` instead of `jwt`
- Some endpoints now support filtering by NIS
- Bulk attendance upload now uses multipart/form-data instead of JSON
