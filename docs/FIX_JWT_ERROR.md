# Fix: JWT Session Error - Decryption Operation Failed

## Problem
Error saat login: `JWEDecryptionFailed: decryption operation failed`

## Root Cause
Error ini terjadi karena:
1. `NEXTAUTH_SECRET` tidak ada atau tidak valid di file `.env`
2. Ada session lama yang di-encrypt dengan secret key yang berbeda
3. Perubahan struktur data session setelah migrasi API

## Solution

### Step 1: Generate New Secret
Jalankan script untuk generate secret baru:
```bash
pwsh -File scripts\generate-secret.ps1
```

Script akan menghasilkan secret seperti:
```
NEXTAUTH_SECRET=vRJSPzZ6xkIDtR5UV3I6EHcTbJFUB1zHzaft5HqvH3w=
```

### Step 2: Update .env File
Buka file `.env` dan pastikan ada 3 variable ini:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=vRJSPzZ6xkIDtR5UV3I6EHcTbJFUB1zHzaft5HqvH3w=
NEXT_PUBLIC_API_BASE_URL=https://sisdik-be-trensains.vercel.app
```

**PENTING:** 
- Ganti `vRJSPzZ6xkIDtR5UV3I6EHcTbJFUB1zHzaft5HqvH3w=` dengan secret yang dihasilkan dari script
- Jangan ada spasi sebelum atau sesudah `=`
- Jangan ada quotes (`"` atau `'`)

### Step 3: Clear Browser Data

#### Option A: Clear Cookies (Recommended)
1. Buka Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear all cookies untuk `localhost:3000`
4. Clear Local Storage
5. Clear Session Storage

#### Option B: Incognito/Private Window
Atau bisa test di Incognito/Private window

### Step 4: Restart Development Server
```bash
# Stop server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Test Login
1. Buka http://localhost:3000
2. Login dengan akun guru
3. Seharusnya berhasil

## Verification

Setelah login berhasil, cek di browser console tidak ada error JWT.

## Additional Notes

### What Changed in Migration
- Session structure updated:
  - Old: `token.nama`, `token.jabatan`
  - New: `token.name`, `token.email`, `token.nip`, `token.id`

### If Still Getting Error

1. **Check .env file exists and is loaded:**
   ```bash
   # Add this to your auth route temporarily to debug
   console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
   ```

2. **Make sure .env is in root directory:**
   ```
   d:\project\sisdik-app\.env  ✅ Correct
   d:\project\sisdik-app\src\.env  ❌ Wrong
   ```

3. **Check .gitignore includes .env:**
   ```
   .env
   .env.local
   ```

4. **Completely clear browser:**
   - Close all tabs
   - Clear all browsing data
   - Restart browser
   - Try again

## Quick Fix Command

Run this to fix everything at once:
```bash
# 1. Generate new secret
pwsh -File scripts\generate-secret.ps1

# 2. Copy the generated secret to .env file manually

# 3. Restart server
# Press Ctrl+C to stop, then:
npm run dev
```

## Prevention

To prevent this in the future:
1. Always keep `NEXTAUTH_SECRET` in `.env`
2. Don't change the secret after users have logged in (in production)
3. If you must change it, all users need to re-login
4. Use the same secret across all environments (dev, staging, prod)

## Related Files Updated
- ✅ `next-auth.d.ts` - Updated type definitions
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Updated auth flow
- ✅ `.env.example` - Updated with new structure
- ✅ `scripts/generate-secret.ps1` - Script to generate secret

---

**Last Updated:** 2025-11-28
