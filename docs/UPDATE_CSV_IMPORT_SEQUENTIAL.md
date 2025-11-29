# Update: CSV Import - Sequential Processing

## Changes Made

### Problem
Backend tidak memiliki endpoint `/students/bulk`, sehingga perlu mengirim request satu per satu.

### Solution
Updated API route untuk mengirim request secara sequential (satu per satu) ke endpoint `/students`.

## Updated API Route

**File:** `src/app/api/students/import/route.ts`

### Key Changes

#### 1. Sequential Processing
```typescript
// Import students one by one
for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.jwt}`,
            },
            body: JSON.stringify(student),
        });
        
        // Track success/failure
    } catch (error) {
        // Track error
    }
}
```

#### 2. Result Tracking
```typescript
const results = {
    success: [] as any[],
    failed: [] as { student: any; error: string }[],
};
```

#### 3. Detailed Response
```typescript
// All success
{
  "message": "Berhasil mengimpor 10 siswa",
  "data": {
    "success": 10,
    "failed": 0,
    "results": [...]
  }
}

// Partial success
{
  "message": "Import selesai: 8 berhasil, 2 gagal",
  "data": {
    "success": 8,
    "failed": 2,
    "results": [...],
    "errors": [...]
  }
}

// All failed
{
  "message": "Gagal mengimpor semua siswa (10 gagal)",
  "data": {
    "success": 0,
    "failed": 10,
    "errors": [...]
  }
}
```

## Updated Component

**File:** `src/components/import-students-csv.tsx`

### Enhanced Toast Messages

```typescript
// All success
toast({
    title: 'Sukses',
    description: 'Berhasil mengimpor 10 siswa.',
});

// Partial success
toast({
    title: 'Import Selesai',
    description: '8 berhasil, 2 gagal.',
});

// All failed
toast({
    title: 'Gagal',
    description: 'Gagal mengimpor semua siswa (10 gagal).',
    variant: 'destructive',
});
```

## Flow Diagram

```
User uploads CSV
       ↓
Frontend validates CSV
       ↓
Send to /api/students/import
       ↓
For each student:
  ├─→ POST /api/students
  ├─→ Track success
  └─→ Track failure
       ↓
Return summary:
  - Total success
  - Total failed
  - Error details
       ↓
Show toast with results
```

## Performance Considerations

### Sequential vs Parallel

**Current: Sequential (One by one)**
```typescript
for (let i = 0; i < students.length; i++) {
    await fetch(...);  // Wait for each request
}
```

**Pros:**
- ✅ Easier to track individual errors
- ✅ Less load on server
- ✅ Predictable order

**Cons:**
- ❌ Slower for large datasets
- ❌ Takes longer to complete

**Future Optimization: Parallel with Limit**
```typescript
// Process in batches of 5
const batchSize = 5;
for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    await Promise.all(batch.map(student => fetch(...)));
}
```

## Error Handling

### Individual Student Errors
```json
{
  "student": {
    "name": "Ahmad",
    "nis": "2024001",
    "class_id": "invalid-uuid"
  },
  "error": "Class not found"
}
```

### Response Structure
```json
{
  "message": "Import selesai: 8 berhasil, 2 gagal",
  "data": {
    "success": 8,
    "failed": 2,
    "results": [
      { "id": "uuid1", "name": "Student 1", ... },
      { "id": "uuid2", "name": "Student 2", ... }
    ],
    "errors": [
      {
        "student": { "name": "Student 9", ... },
        "error": "Class not found"
      },
      {
        "student": { "name": "Student 10", ... },
        "error": "Duplicate NIS"
      }
    ]
  }
}
```

## Testing Scenarios

### 1. All Success
**CSV:**
```csv
name,nis,class_id,phone,address
Ahmad,2024001,valid-uuid,081234567890,Jl. Merdeka
Siti,2024002,valid-uuid,081234567891,Jl. Sudirman
```

**Expected:**
```
✅ Sukses
Berhasil mengimpor 2 siswa.
```

### 2. Partial Success
**CSV:**
```csv
name,nis,class_id,phone,address
Ahmad,2024001,valid-uuid,081234567890,Jl. Merdeka
Siti,2024002,invalid-uuid,081234567891,Jl. Sudirman
```

**Expected:**
```
ℹ️ Import Selesai
1 berhasil, 1 gagal.
```

### 3. All Failed
**CSV:**
```csv
name,nis,class_id,phone,address
Ahmad,2024001,invalid-uuid,081234567890,Jl. Merdeka
Siti,2024002,invalid-uuid,081234567891,Jl. Sudirman
```

**Expected:**
```
❌ Gagal
Gagal mengimpor semua siswa (2 gagal).
```

## API Endpoints Used

### Frontend → Next.js API
```
POST /api/students/import
```

### Next.js API → Backend
```
POST /api/students (for each student)
```

## Files Modified

- ✅ `src/app/api/students/import/route.ts` - Sequential processing
- ✅ `src/components/import-students-csv.tsx` - Enhanced toast messages

## Benefits

1. ✅ **Works without bulk endpoint** - Compatible with current backend
2. ✅ **Detailed tracking** - Know exactly which students succeeded/failed
3. ✅ **Error resilience** - One failure doesn't stop the entire import
4. ✅ **Clear feedback** - User knows exactly what happened
5. ✅ **Debugging friendly** - Easy to identify problematic records

## Future Improvements

1. **Batch Processing** - Process in parallel batches for better performance
2. **Progress Bar** - Show real-time progress during import
3. **Error Report** - Download CSV of failed records
4. **Retry Failed** - Option to retry only failed records
5. **Validation Preview** - Show preview before importing

---

**Updated:** 2025-11-29
**Status:** Complete
