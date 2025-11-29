# Troubleshooting: Classes Page - Add/Edit Buttons Not Showing

## Problem
Tombol "Tambah Kelas" dan "Edit" tidak muncul meskipun role adalah "Guru BK".

## Debugging Steps

### Step 1: Check Console Logs
Buka browser console (F12) dan lihat output:

```
Session: { user: { ... }, jwt: "..." }
User Role: "Guru BK"  // atau "Admin" atau undefined
Can Manage Students: true/false
```

### Step 2: Verify Role Value
Pastikan role dari backend adalah **persis** salah satu dari:
- `"Guru BK"` (dengan spasi)
- `"Admin"`

**Common Issues:**
- ❌ `"GuruBK"` (tanpa spasi)
- ❌ `"guru bk"` (lowercase)
- ❌ `"GURU BK"` (uppercase)
- ❌ `null` atau `undefined`

### Step 3: Check Session
Jika session undefined atau role tidak ada:

1. **Logout dan Login Ulang**
   - Session lama mungkin tidak punya field `role`
   - Login ulang untuk mendapatkan session baru

2. **Check Backend Response**
   - Pastikan backend mengembalikan `role` field
   - Check di Network tab (F12) → `/api/auth/login`

3. **Check Auth Configuration**
   - File: `src/app/api/auth/[...nextauth]/route.ts`
   - Pastikan `role` di-save ke session

## Solution Applied

### Updated to Use `useRole` Hook
```typescript
// ❌ Before - Manual check
const canPerformActions = session?.user?.role === 'Admin' || 
                         session?.user?.role === 'Guru BK';

// ✅ After - Using hook
const { canManageStudents } = useRole();
const canPerformActions = canManageStudents;
```

### Added Debug Logging
```typescript
console.log('Session:', session);
console.log('User Role:', session?.user?.role);
console.log('Can Manage Students:', canManageStudents);
```

## Expected Console Output

### For Guru BK:
```
Session: {
  user: {
    id: "uuid",
    name: "Nama Guru",
    email: "guru@example.com",
    role: "Guru BK"  ← Should be exactly this
  },
  jwt: "..."
}
User Role: "Guru BK"
Can Manage Students: true  ← Should be true
```

### For Admin:
```
User Role: "Admin"
Can Manage Students: true
```

### For Regular Guru:
```
User Role: "Guru"
Can Manage Students: false  ← Buttons won't show
```

## Common Fixes

### Fix 1: Logout and Login Again
```
1. Click logout
2. Login with Guru BK account
3. Check if buttons appear
```

### Fix 2: Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Login again
```

### Fix 3: Check Backend Role Value
Pastikan backend mengembalikan role dengan format yang benar:

**Backend Response Should Be:**
```json
{
  "access_token": "...",
  "teacher": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "Guru BK"  ← Exactly this format
  }
}
```

## Verification Checklist

- [ ] Console shows session object
- [ ] `session.user.role` is "Guru BK" or "Admin"
- [ ] `canManageStudents` is `true`
- [ ] Buttons appear on page
- [ ] Can click "Tambah Kelas"
- [ ] Can see edit/delete in dropdown

## Role Mapping

| Backend Role | Frontend Permission | Buttons Show? |
|--------------|---------------------|---------------|
| `"Guru BK"` | `canManageStudents: true` | ✅ Yes |
| `"Admin"` | `canManageStudents: true` | ✅ Yes |
| `"Guru"` | `canManageStudents: false` | ❌ No |
| `null` | `canManageStudents: false` | ❌ No |

## If Still Not Working

### Check Auth Route
File: `src/app/api/auth/[...nextauth]/route.ts`

Pastikan ada:
```typescript
return { 
    id: teacher.id,
    name: teacher.name,
    email: teacher.email,
    nip: teacher.nip || '',
    role: teacher.role || '',  // ← This line
    jwt: access_token 
};
```

Dan di callbacks:
```typescript
async jwt({ token, user }) {
    if (user) {
        token.role = user.role;  // ← This line
    }
    return token;
},
async session({ session, token }) {
    if (token) {
        session.user.role = token.role;  // ← This line
    }
    return session;
}
```

## Quick Test

Run this in browser console:
```javascript
// Check session
console.log('Role:', window.sessionStorage);

// Or use React DevTools
// Find ClassesClient component
// Check props/state
```

## Files Updated
- ✅ `src/app/classes/page.tsx` - Added useRole hook and debug logging

---

**Created:** 2025-11-28

**Next Steps:**
1. Check console logs
2. Share console output if still not working
3. Verify backend role value
