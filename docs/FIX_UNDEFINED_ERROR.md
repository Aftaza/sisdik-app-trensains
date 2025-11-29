# Fix: Cannot read properties of undefined (reading 'id')

## Problem
Error saat login: `Cannot read properties of undefined (reading 'id')`

## Root Cause
Error ini terjadi karena response dari backend API tidak sesuai dengan struktur yang diharapkan. Kemungkinan:
1. Response tidak memiliki field `teacher`
2. Response memiliki struktur yang berbeda
3. API endpoint tidak mengembalikan data yang benar

## Diagnosis

### Step 1: Check Server Logs
Setelah update code, coba login lagi dan lihat console log di terminal server. Anda akan melihat:
```
Attempting login for: [email]
API Response: { ... }
```

Ini akan menunjukkan struktur response yang sebenarnya dari API.

### Step 2: Test API Directly
Jalankan script untuk test API secara langsung:
```bash
pwsh -File scripts\test-login-api.ps1
```

Masukkan email dan password guru, lalu lihat response structure.

## Expected Response Structure

Response yang benar dari `/api/auth/login` seharusnya:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "teacher": {
    "id": "uuid-string",
    "name": "Nama Guru",
    "email": "guru@example.com",
    "nip": "1234567890",
    "phone": "081234567890",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Possible Issues & Solutions

### Issue 1: Response uses different field names
**Symptom:** Response has `user` instead of `teacher`

**Solution:** Update auth route to handle both:
```typescript
const teacher = data.teacher || data.user;
```

### Issue 2: Response structure is completely different
**Symptom:** Response is flat (all fields at root level)

**Example:**
```json
{
  "access_token": "...",
  "id": "uuid",
  "name": "Nama",
  "email": "email@example.com"
}
```

**Solution:** Update auth route to handle flat structure:
```typescript
// If response is flat
if (!data.teacher && data.id) {
    return {
        id: data.id,
        name: data.name,
        email: data.email,
        nip: data.nip || '',
        jwt: data.access_token
    };
}
```

### Issue 3: Backend returns different token field
**Symptom:** Response has `token` instead of `access_token`

**Solution:** Update to check both:
```typescript
const access_token = data.access_token || data.token;
```

## Solution Steps

### 1. Check Console Logs
Restart server dan coba login, lihat di terminal:
```bash
npm run dev
```

Cari log yang menampilkan:
```
API Response: { ... }
```

### 2. Based on Response Structure

#### If response has `teacher` object:
✅ Code sudah benar, mungkin ada field yang missing

#### If response is flat (no nested teacher):
Update `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
// After getting data
const data = await response.json();
console.log('API Response:', JSON.stringify(data, null, 2));

if (!response.ok) {
    throw new Error(data.message || "Authentication failed");
}

// Handle both nested and flat structure
let teacherData;
if (data.teacher) {
    teacherData = data.teacher;
} else {
    // Flat structure
    teacherData = {
        id: data.id,
        name: data.name,
        email: data.email,
        nip: data.nip
    };
}

const access_token = data.access_token || data.token;

return {
    id: teacherData.id,
    name: teacherData.name,
    email: teacherData.email,
    nip: teacherData.nip || '',
    jwt: access_token
};
```

### 3. Test Again
```bash
# Clear browser cache/cookies
# Restart server
npm run dev
# Try login
```

## Debugging Checklist

- [ ] Server logs show "Attempting login for: [email]"
- [ ] Server logs show "API Response: {...}"
- [ ] Response has `access_token` or `token` field
- [ ] Response has teacher data (nested or flat)
- [ ] All required fields present: id, name, email
- [ ] Browser cookies cleared
- [ ] Server restarted after code changes

## Quick Debug Commands

```bash
# 1. Test API directly
pwsh -File scripts\test-login-api.ps1

# 2. Check server logs
# Look for console.log output in terminal

# 3. Restart server
# Ctrl+C then:
npm run dev
```

## Common Response Structures

### Structure 1: Nested (Expected)
```json
{
  "access_token": "...",
  "teacher": { "id": "...", "name": "...", "email": "..." }
}
```

### Structure 2: Flat
```json
{
  "access_token": "...",
  "id": "...",
  "name": "...",
  "email": "..."
}
```

### Structure 3: Different naming
```json
{
  "token": "...",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

## Files Updated
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Added logging and validation
- ✅ `scripts/test-login-api.ps1` - Script to test API directly

## Next Steps

1. Run the test script to see actual response
2. Share the response structure if still having issues
3. Update code based on actual response structure

---

**Last Updated:** 2025-11-28
