# API Endpoints - ID vs NIS

## Overview

Created separate endpoints to fetch data by **ID** or **NIS**, allowing flexible data retrieval.

## Endpoint Structure

### Students

**By ID:**
```
GET /api/students/[id]
→ Backend: /api/students/{id}
```

**By NIS:**
```
GET /api/students/nis/[nis]
→ Backend: /api/students/nis/{nis}
```

### Violations Log

**By ID:**
```
GET /api/violations-log/[id]
→ Backend: /api/violation-logs/{id}
```

**By NIS:**
```
GET /api/violations-log/nis/[nis]
→ Backend: /api/violation-logs/student/{nis}
```

### Sanctions

**By ID:**
```
GET /api/sanctions/[id]
→ Backend: /api/sanctions/{id}
```

**By NIS:**
```
GET /api/sanctions/nis/[nis]
→ Backend: /api/sanctions/student/{nis}
```

## Files Created

### 1. Students by NIS
**File:** `src/app/api/students/nis/[nis]/route.ts`

```typescript
GET /api/students/nis/2024001
→ Calls: /api/students/nis/2024001
```

### 2. Violations by NIS
**File:** `src/app/api/violations-log/nis/[nis]/route.ts`

```typescript
GET /api/violations-log/nis/2024001
→ Calls: /api/violation-logs/student/2024001
```

### 3. Sanctions by NIS
**File:** `src/app/api/sanctions/nis/[nis]/route.ts`

```typescript
GET /api/sanctions/nis/2024001
→ Calls: /api/sanctions/student/2024001
```

## Files Modified

### 1. Students [id] - Restored to ID
**File:** `src/app/api/students/[id]/route.ts`

```typescript
// Changed from:
/api/students/nis/${id}

// Back to:
/api/students/${id}
```

### 2. Violations [id] - Restored to ID
**File:** `src/app/api/violations-log/[id]/route.ts`

```typescript
// Changed from:
/api/violation-logs/student/${id}

// Back to:
/api/violation-logs/${id}
```

## Usage Examples

### Frontend Usage

**Get student by ID:**
```typescript
const { data } = useSWR(`/api/students/${studentId}`, fetcher);
// studentId = "uuid-here"
```

**Get student by NIS:**
```typescript
const { data } = useSWR(`/api/students/nis/${nis}`, fetcher);
// nis = "2024001"
```

**Get violations by ID:**
```typescript
const { data } = useSWR(`/api/violations-log/${studentId}`, fetcher);
```

**Get violations by NIS:**
```typescript
const { data } = useSWR(`/api/violations-log/nis/${nis}`, fetcher);
```

**Get sanctions by ID:**
```typescript
const { data } = useSWR(`/api/sanctions/${studentId}`, fetcher);
```

**Get sanctions by NIS:**
```typescript
const { data } = useSWR(`/api/sanctions/nis/${nis}`, fetcher);
```

## When to Use ID vs NIS

### Use ID when:
- ✅ You have the student UUID
- ✅ Coming from database relations
- ✅ Internal system references

### Use NIS when:
- ✅ User searches by NIS
- ✅ Manual lookups
- ✅ External integrations
- ✅ User-friendly URLs

## Backend API Mapping

| Frontend Endpoint | Backend Endpoint | Parameter |
|-------------------|------------------|-----------|
| `/api/students/[id]` | `/api/students/{id}` | UUID |
| `/api/students/nis/[nis]` | `/api/students/nis/{nis}` | NIS |
| `/api/violations-log/[id]` | `/api/violation-logs/{id}` | UUID |
| `/api/violations-log/nis/[nis]` | `/api/violation-logs/student/{nis}` | NIS |
| `/api/sanctions/[id]` | `/api/sanctions/{id}` | UUID |
| `/api/sanctions/nis/[nis]` | `/api/sanctions/student/{nis}` | NIS |

## Authentication

All endpoints require:
- ✅ Valid session
- ✅ JWT token
- ✅ Authorization header

```typescript
headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.jwt}`,
}
```

## Error Handling

All endpoints return consistent error format:

```json
{
  "message": "Error description"
}
```

**Status codes:**
- `401` - Unauthorized (no token)
- `404` - Not found
- `500` - Internal server error

## Testing

### Test by ID
```bash
# Students
GET /api/students/uuid-here

# Violations
GET /api/violations-log/uuid-here

# Sanctions
GET /api/sanctions/uuid-here
```

### Test by NIS
```bash
# Students
GET /api/students/nis/2024001

# Violations
GET /api/violations-log/nis/2024001

# Sanctions
GET /api/sanctions/nis/2024001
```

## Directory Structure

```
src/app/api/
├── students/
│   ├── [id]/
│   │   └── route.ts          (Get by ID)
│   └── nis/
│       └── [nis]/
│           └── route.ts      (Get by NIS)
├── violations-log/
│   ├── [id]/
│   │   └── route.ts          (Get by ID)
│   └── nis/
│       └── [nis]/
│           └── route.ts      (Get by NIS)
└── sanctions/
    ├── [id]/
    │   └── route.ts          (Get by ID)
    └── nis/
        └── [nis]/
            └── route.ts      (Get by NIS)
```

## Summary

**Created:**
- ✅ `/api/students/nis/[nis]`
- ✅ `/api/violations-log/nis/[nis]`
- ✅ `/api/sanctions/nis/[nis]`

**Restored:**
- ✅ `/api/students/[id]` - Uses ID
- ✅ `/api/violations-log/[id]` - Uses ID

**Result:**
- ✅ Can fetch by ID (UUID)
- ✅ Can fetch by NIS (student number)
- ✅ Flexible data retrieval
- ✅ Backward compatible

---

**Status:** Complete
**Endpoints:** 6 total (3 by ID, 3 by NIS)
