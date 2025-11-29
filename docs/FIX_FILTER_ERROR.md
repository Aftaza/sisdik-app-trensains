# Fix: students.filter is not a function

## Problem
Error di dashboard: `students.filter is not a function`

## Root Cause
Backend API mengembalikan response yang wrapped dalam object `{ data: [...] }` instead of returning array directly.

**Expected:**
```json
[
  { "id": "1", "name": "Student 1", ... },
  { "id": "2", "name": "Student 2", ... }
]
```

**Actual:**
```json
{
  "data": [
    { "id": "1", "name": "Student 1", ... },
    { "id": "2", "name": "Student 2", ... }
  ]
}
```

## Solution Applied

Updated all API route handlers to unwrap the `data` property if it exists:

```typescript
let data = await response.json();

// Handle if response is wrapped in { data: [...] }
if (data.data && Array.isArray(data.data)) {
    data = data.data;
}

return NextResponse.json(data);
```

## Files Updated

### ✅ API Routes
- `src/app/api/students/route.ts` - GET endpoint
- `src/app/api/teachers/route.ts` - GET endpoint
- `src/app/api/violations-log/route.ts` - GET endpoint
- `src/app/api/classes/route.ts` - GET endpoint (if needed)
- `src/app/api/violation-types/route.ts` - GET endpoint (if needed)
- `src/app/api/sanctions/route.ts` - GET endpoint (if needed)
- `src/app/api/attendances/route.ts` - GET endpoint (if needed)

### ✅ Helper Functions
- `src/lib/api-helpers.ts` - Created helper functions for unwrapping responses

## How It Works

The fix checks if the response has a `data` property that contains an array:
1. If yes → unwrap it and return just the array
2. If no → return the response as-is

This makes it compatible with both response formats:
- Direct array: `[...]`
- Wrapped array: `{ data: [...] }`

## Testing

After applying the fix:
1. Restart development server
2. Login to dashboard
3. Dashboard should load without errors
4. All data should display correctly

## Prevention

For future endpoints, always check the response structure and unwrap if needed.

## Related Issues

This is a common pattern when backend uses a standardized response format like:
```typescript
{
  "success": true,
  "data": [...],
  "message": "Success"
}
```

Our fix handles this gracefully by unwrapping the `data` property.

---

**Fixed on:** 2025-11-28
