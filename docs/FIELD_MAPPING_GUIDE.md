# Frontend Field Mapping Guide

## Overview
Panduan mapping field dari struktur lama ke struktur baru API.

## Student Fields

### Old Structure (Before Migration)
```typescript
{
  nis: number,
  nama_lengkap: string,
  kelas: string,  // Direct string
  total_poin: number
}
```

### New Structure (After Migration)
```typescript
{
  id: string,
  name: string,
  nis: string,
  class_id: string,
  total_poin: number,
  class?: {
    id: string,
    name: string,
    description?: string,
    student_count?: number
  }
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `nis` | `nis` | Changed from `number` to `string` |
| `nama_lengkap` | `name` | Renamed |
| `kelas` | `class.name` | Now nested object |
| `total_poin` | `total_poin` | Unchanged |
| - | `class_id` | New field (UUID) |
| - | `phone` | New field |
| - | `address` | New field |

### Usage Examples

#### Display Class Name
```typescript
// ❌ Old way
<p>{student.kelas}</p>

// ✅ New way
<p>{student.class?.name || '-'}</p>
```

#### Filter by Class
```typescript
// ❌ Old way
students.filter(s => s.kelas === 'X IPA 1')

// ✅ New way
students.filter(s => s.class?.name === 'X IPA 1')
```

#### Get Unique Classes
```typescript
// ❌ Old way
const classes = new Set(students.map(s => s.kelas));

// ✅ New way
const classes = new Set(
  students
    .map(s => s.class?.name)
    .filter((name): name is string => !!name)
);
```

## Teacher Fields

### Old Structure
```typescript
{
  id: number,
  nama: string,
  email: string,
  jabatan: string
}
```

### New Structure
```typescript
{
  id: string,
  name: string,
  nip: string,
  email: string,
  phone?: string,
  role?: string,
  created_at: string,
  updated_at: string
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `id` | `id` | Changed from `number` to `string` (UUID) |
| `nama` | `name` | Renamed |
| `jabatan` | `role` | Renamed |
| `email` | `email` | Unchanged |
| - | `nip` | New field |
| - | `phone` | New field |

## Violation Log Fields

### Old Structure
```typescript
{
  id: number,
  nis_siswa: number,
  nama_siswa: string,
  jenis_pelanggaran: string,
  tanggal_terjadi: string,
  catatan: string,
  pelapor: string
}
```

### New Structure
```typescript
{
  id: string,
  student_id: string,
  violation_type_id: string,
  reporting_teacher_id: string,
  notes?: string,
  created_at: string,
  updated_at: string,
  student?: {
    id: string,
    name: string,
    nis: string,
    class?: { name: string }
  },
  violation_type?: {
    id: string,
    name: string,
    poin: number
  },
  reporting_teacher?: {
    id: string,
    name: string,
    nip: string
  }
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `nis_siswa` | `student.nis` | Now nested |
| `nama_siswa` | `student.name` | Now nested |
| `jenis_pelanggaran` | `violation_type.name` | Now nested |
| `catatan` | `notes` | Renamed |
| `pelapor` | `reporting_teacher.name` | Now nested |
| `tanggal_terjadi` | `created_at` | Renamed |

### Usage Examples

#### Display Student Name
```typescript
// ❌ Old way
<p>{log.nama_siswa}</p>

// ✅ New way
<p>{log.student?.name || '-'}</p>
```

#### Display Violation Type
```typescript
// ❌ Old way
<p>{log.jenis_pelanggaran}</p>

// ✅ New way
<p>{log.violation_type?.name || '-'}</p>
```

## Class Fields

### Old Structure
```typescript
{
  id: number,
  nama_kelas: string,
  wali_kelas: string,
  total_siswa: number
}
```

### New Structure
```typescript
{
  id: string,
  name: string,
  description?: string,
  student_count?: number,
  created_at: string,
  updated_at: string
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `nama_kelas` | `name` | Renamed |
| `total_siswa` | `student_count` | Renamed |
| `wali_kelas` | - | Removed |

## Violation Type Fields

### Old Structure
```typescript
{
  id: number,
  nama_pelanggaran: string,
  kategori: string,
  poin: number,
  pembuat: string
}
```

### New Structure
```typescript
{
  id: string,
  name: string,
  description?: string,
  poin: number,
  created_at: string,
  updated_at: string
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `nama_pelanggaran` | `name` | Renamed |
| `poin` | `poin` | Unchanged |
| `kategori` | `description` | Renamed (optional) |
| `pembuat` | - | Removed |

## Sanction Fields

### Old Structure
```typescript
{
  id: number,
  pembinaan: string,
  poin_min: number,
  poin_max: number
}
```

### New Structure
```typescript
{
  id: string,
  name: string,
  description?: string,
  min_poin: number,
  max_poin: number,
  created_at: string,
  updated_at: string
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `pembinaan` | `name` | Renamed |
| `poin_min` | `min_poin` | Renamed |
| `poin_max` | `max_poin` | Renamed |
| - | `description` | New field |

## Attendance Fields

### Old Structure
```typescript
{
  id: number,
  nis_siswa: number,
  nama_siswa: string,
  tanggal: string,
  status_absensi: string
}
```

### New Structure
```typescript
{
  id: string,
  student_id: string,
  date: string,
  status: string,
  created_at: string,
  updated_at: string,
  student?: {
    id: string,
    name: string,
    nis: string
  }
}
```

### Field Mapping
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `nis_siswa` | `student.nis` | Now nested |
| `nama_siswa` | `student.name` | Now nested |
| `tanggal` | `date` | Renamed |
| `status_absensi` | `status` | Renamed |

## Common Patterns

### Accessing Nested Data
```typescript
// Always use optional chaining for nested data
student.class?.name
log.student?.name
log.violation_type?.name
```

### Filtering with Nested Data
```typescript
// Filter by nested property
students.filter(s => s.class?.name === 'X IPA 1')
logs.filter(l => l.student?.nis === '12345')
```

### Mapping Nested Data
```typescript
// Extract nested values safely
const classNames = students
  .map(s => s.class?.name)
  .filter((name): name is string => !!name);
```

### Displaying Nested Data
```typescript
// Always provide fallback
<p>{student.class?.name || '-'}</p>
<p>{log.student?.name || 'Unknown'}</p>
```

## Files Updated

### ✅ Completed
- `src/app/students/page.tsx` - Fixed class data handling
- `src/lib/data.ts` - Updated type definitions
- `src/components/layout/sidebar-content.tsx` - Updated user fields

### ⏳ To Update
- `src/app/logs/page.tsx` - Update violation log fields
- `src/app/classes/page.tsx` - Update class fields
- `src/app/violation-types/page.tsx` - Update violation type fields
- `src/app/sanctions/page.tsx` - Update sanction fields
- `src/app/attendance/page.tsx` - Update attendance fields
- `src/components/*-form.tsx` - Update all forms

## Quick Reference

### Most Common Changes
1. `nama_lengkap` → `name`
2. `kelas` → `class.name`
3. `nama_kelas` → `name`
4. `jabatan` → `role`
5. `catatan` → `notes`
6. `tanggal` → `date` or `created_at`
7. All IDs: `number` → `string` (UUID)

---

**Last Updated:** 2025-11-28
