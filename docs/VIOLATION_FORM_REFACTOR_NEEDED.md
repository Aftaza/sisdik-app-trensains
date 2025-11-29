# Violation Log Form - Required Changes

## Issues Found

### 1. Old Field Names

**Student Fields:**
- `nama_lengkap` → `name`
- `nis` → `nis` (unchanged)
- `kelas` → `classes?.name`

**Teacher Fields:**
- `jabatan` → `role`
- `nama` → `name`

**Violation Type Fields:**
- `nama_pelanggaran` → `name`
- `poin` → `poin` (unchanged)

**Violation Fields:**
- `tanggal_terjadi` → `created_at`
- `jenis_pelanggaran` → `violation_type?.name`
- `catatan` → `notes`
- `guru_bk` → `reporting_teacher?.name`
- `nama_siswa` → `student?.name`

### 2. Form Schema Needs Update

**Current (Old):**
```typescript
const formSchema = z.object({
    jenis_pelanggaran: z.string(),
    nama_siswa: z.string(),
    tanggal_terjadi: z.date(),
    catatan: z.string(),
    guru_bk: z.string(),
    poin: z.number(),
    violationTypeId: z.string(),
});
```

**Should be (New):**
```typescript
const formSchema = z.object({
    student_id: z.string().uuid(),
    violation_type_id: z.string().uuid(),
    reporting_teacher_id: z.string().uuid(),
    notes: z.string().min(10),
});
```

### 3. API Request Body

**Current (Old):**
```typescript
const body = {
    nis: selectedNis,
    nama_siswa: values.nama_siswa,
    pelanggaran: values.jenis_pelanggaran,
    tanggal_terjadi: formattedDate,
    catatan: values.catatan,
    guru_bk: values.guru_bk,
    poin: values.poin,
};
```

**Should be (New):**
```typescript
const body = {
    student_id: selectedStudentId,
    violation_type_id: values.violation_type_id,
    reporting_teacher_id: values.reporting_teacher_id,
    notes: values.notes,
};
```

### 4. Teacher Filter

**Current (Old):**
```typescript
const bkTeachers = teachers?.filter((teacher) => teacher.jabatan === 'Guru BK');
```

**Should be (New):**
```typescript
const bkTeachers = teachers?.filter((teacher) => teacher.role === 'Guru BK');
```

### 5. Edit Mode Data Mapping

**Current (Old):**
```typescript
form.reset({
    jenis_pelanggaran: violation.jenis_pelanggaran,
    nama_siswa: violation.nama_siswa,
    tanggal_terjadi: new Date(violation.tanggal_terjadi),
    catatan: violation.catatan,
    guru_bk: violation.guru_bk,
    poin: violation.poin,
});
```

**Should be (New):**
```typescript
form.reset({
    student_id: violation.student_id,
    violation_type_id: violation.violation_type_id,
    reporting_teacher_id: violation.reporting_teacher_id,
    notes: violation.notes,
});
```

## Complete Refactored Version Needed

Due to extensive changes, recommend creating new file:
- `src/components/violation-log-form-v2.tsx`

Or completely rewrite current file with:
1. Updated field names
2. Simplified form schema
3. Proper UUID handling
4. Correct API request format

## Key Changes Summary

| Old Field | New Field | Type |
|-----------|-----------|------|
| `jenis_pelanggaran` | `violation_type_id` | UUID |
| `nama_siswa` | `student_id` | UUID |
| `tanggal_terjadi` | (auto-generated) | Date |
| `catatan` | `notes` | String |
| `guru_bk` | `reporting_teacher_id` | UUID |
| `poin` | (from violation_type) | Number |

---

**Status:** Needs complete refactor
**Complexity:** High
**Recommendation:** Create new simplified version
