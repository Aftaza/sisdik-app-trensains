# Fix: StudentSanctionsCard - Cannot read properties of undefined

## Error

```
Error: Cannot read properties of undefined (reading 'length')
at StudentSanctionsCard
```

## Root Cause

The code was trying to access `sanctionsData.pembinaan.length` without checking if `pembinaan` exists first.

```typescript
// ❌ Before
if (
    !sanctionsData ||
    sanctionsData.status === 'error' ||
    sanctionsData.pembinaan.length === 0  // ← Error here if pembinaan is undefined
) {
    // ...
}
```

## Fix Applied

Added proper null/undefined checks:

```typescript
// ✅ After
if (
    !sanctionsData ||
    sanctionsData.status === 'error' ||
    !sanctionsData.pembinaan ||              // ← Check if exists
    !Array.isArray(sanctionsData.pembinaan) || // ← Check if array
    sanctionsData.pembinaan.length === 0      // ← Now safe to check length
) {
    // ...
}
```

## Additional Improvements

### 1. Added Debugging
```typescript
useEffect(() => {
    if (sanctionsData) {
        console.log('Sanctions Data:', sanctionsData);
    }
    if (sanctionError) {
        console.error('Sanctions Error:', sanctionError);
    }
}, [sanctionsData, sanctionError]);
```

This helps identify what data is being returned from the API.

## Testing

1. Open browser console
2. Navigate to student detail page
3. Check console for "Sanctions Data:" log
4. Verify the structure of the response

## Expected API Response

```json
{
  "status": "success",
  "start_poin": 0,
  "end_poin": 10,
  "pembinaan": [
    "Peringatan Lisan",
    "Teguran"
  ]
}
```

## Possible API Responses

### Case 1: Success with data
```json
{
  "pembinaan": ["Peringatan Lisan"]
}
```
→ Shows sanctions

### Case 2: No sanctions
```json
{
  "pembinaan": []
}
```
→ Shows "Tidak ada sanksi yang berlaku"

### Case 3: Error response
```json
{
  "status": "error"
}
```
→ Shows "Tidak ada sanksi yang berlaku"

### Case 4: Missing pembinaan field
```json
{
  "start_poin": 0,
  "end_poin": 10
}
```
→ Shows "Tidak ada sanksi yang berlaku" (now handled correctly)

## Files Modified

- `src/components/student-detail/StudentSanctionsCard.tsx`
  - Added null/undefined checks for `pembinaan`
  - Added `Array.isArray()` check
  - Added debugging logs

## Status

✅ Fixed - Component now handles all edge cases safely

---

**Updated:** 2025-11-29
**Issue:** Cannot read properties of undefined
**Solution:** Added proper null checks
