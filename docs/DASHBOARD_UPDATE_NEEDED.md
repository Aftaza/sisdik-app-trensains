# Dashboard Page - Required Updates

## Issues Found

### 1. Old Field Names

**Student Interface:**
```typescript
// ❌ Old
interface Student {
    nis: number;
    nama_lengkap: string;
    kelas: string;
    total_poin: number;
}

// ✅ New
interface Student {
    id: string;
    nis: string;
    name: string;
    classes: {
        name: string;
    };
    total_poin: number;
}
```

**Violation Interface:**
```typescript
// ❌ Old
interface Violation {
    id: number;
    nis_siswa: number;
    nama_siswa: string;
    jenis_pelanggaran: string;
    tanggal_terjadi: string;
}

// ✅ New
interface Violation {
    id: string;
    student_id: string;
    violation_type_id: string;
    created_at: string;
    students: {
        nis: string;
        name: string;
    };
    violation_types: {
        name: string;
        poin: number;
    };
}
```

**Teacher Interface:**
```typescript
// ❌ Old
interface Teacher {
    id: number;
    nama: string;
    jabatan: string;
}

// ✅ New
interface Teacher {
    id: string;
    name: string;
    role: string;
}
```

### 2. Field Access Updates

**Students:**
- `student.nama_lengkap` → `student.name`
- `student.kelas` → `student.classes?.name`
- `student.nis` → `student.nis` (unchanged, but now string)

**Violations:**
- `violation.nama_siswa` → `violation.students?.name`
- `violation.jenis_pelanggaran` → `violation.violation_types?.name`
- `violation.tanggal_terjadi` → `violation.created_at`
- `violation.nis_siswa` → `violation.students?.nis`

**Teachers:**
- `teacher.nama` → `teacher.name`
- `teacher.jabatan` → `teacher.role`

### 3. Analysis Logic Updates

**Violation by Class:**
```typescript
// ❌ Old
const student = students.find((s) => s.nis === v.nis_siswa);
if (student) {
    counts[student.kelas] = ...
}

// ✅ New
const student = students.find((s) => s.nis === v.students?.nis);
if (student) {
    counts[student.classes?.name] = ...
}
```

**Violation Type Counts:**
```typescript
// ❌ Old
counts[v.jenis_pelanggaran] = ...

// ✅ New
counts[v.violation_types?.name] = ...
```

### 4. Top Students Logic

```typescript
// ❌ Old
students.filter(student => student.total_poin > 0)

// ✅ New (unchanged, field name same)
students.filter(student => student.total_poin > 0)
```

## Summary of Changes Needed

| Component | Old Field | New Field |
|-----------|-----------|-----------|
| Student name | `nama_lengkap` | `name` |
| Student class | `kelas` | `classes?.name` |
| Violation student | `nama_siswa` | `students?.name` |
| Violation type | `jenis_pelanggaran` | `violation_types?.name` |
| Violation date | `tanggal_terjadi` | `created_at` |
| Violation NIS | `nis_siswa` | `students?.nis` |
| Teacher name | `nama` | `name` |
| Teacher role | `jabatan` | `role` |

## Files to Update

- `src/app/dashboard/page.tsx` - Main dashboard page

---

**Status:** Needs complete refactor
**Complexity:** Medium
**Impact:** Analysis charts and tables
