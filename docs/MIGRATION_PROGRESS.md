# Remaining API Files to Update

## Status
✅ = Updated
⏳ = Pending

## Completed Updates
✅ Authentication (`/api/auth/[...nextauth]/route.ts`)
✅ Students (`/api/students/route.ts`, `/api/students/[id]/route.ts`)
✅ Teachers (`/api/teachers/route.ts`, `/api/teachers/[id]/route.ts`)
✅ Classes (`/api/classes/route.ts`, `/api/classes/[id]/route.ts`)

## Pending Updates

### Violation Types
⏳ `/api/violations-type/route.ts`
- Change: `get-violations-type` → `api/violation-types`
- Change: `add-violation-type` → `api/violation-types`
- Change: `data.msg` → `data.message`
- Remove: Permission checks (jabatan)

⏳ `/api/violations-type/[id]/route.ts`
- Change: `edit-violation-type` → `api/violation-types/${id}`
- Change: `delete-violation-type` → `api/violation-types/${id}`
- Change: Remove `body: JSON.stringify({ ...body, id: parseInt(id) })`
- Change: Use `body: JSON.stringify(body)` for PUT
- Change: Remove body for DELETE
- Remove: Permission checks (jabatan)

### Violation Logs
⏳ `/api/violations-log/route.ts`
- Change: `get-violations-log` → `api/violation-logs`
- Change: `add-violation-log` → `api/violation-logs`
- Change: `data.msg` → `data.message`
- Remove: Permission checks (jabatan)

⏳ `/api/violations-log/[id]/route.ts`
- Change: `get-violation-logs/?nis=${id}` → `api/violation-logs/${id}` for GET by ID
- Note: For getting by NIS, use `api/violation-logs/student/${nis}`
- Change: `edit-violation-log` → `api/violation-logs/${id}`
- Change: `delete-violation-log` → `api/violation-logs/${id}`
- Change: Remove `body: JSON.stringify({ ...body, id: parseInt(id) })`
- Change: Use `body: JSON.stringify(body)` for PUT
- Change: Remove body for DELETE
- Remove: Permission checks (jabatan)

### Sanctions
⏳ `/api/sanctions/route.ts`
- Change: `get-sanctions` → `api/sanctions`
- Change: `add-sanction` → `api/sanctions`
- Change: `data.msg` → `data.message`
- Remove: Permission checks (jabatan)

⏳ `/api/sanctions/[id]/route.ts`
- Change: `get-sanction/?nis=${id}` → `api/sanctions/${id}` for GET by ID
- Note: For getting by NIS, use `api/sanctions/student/${nis}`
- Change: `edit-sanction` → `api/sanctions/${id}`
- Change: `delete-sanction` → `api/sanctions/${id}`
- Change: Remove `body: JSON.stringify({ ...body, id: parseInt(id) })`
- Change: Use `body: JSON.stringify(body)` for PUT
- Change: Remove body for DELETE
- Remove: Permission checks (jabatan)

### Attendance
⏳ `/api/attendances/route.ts`
- Change: `add-attendance-student` → `api/attendance`
- Change: `data.msg` → `data.message`
- Remove: Permission checks (jabatan)

⏳ `/api/attendances/[id]/route.ts`
- Change: `edit-attendance-student` → `api/attendance/${id}`
- Change: `delete-attendance-student` → `api/attendance/${id}`
- Change: Remove `body: JSON.stringify({ ...body, id: parseInt(id) })`
- Change: Use `body: JSON.stringify(body)` for PUT
- Change: Remove body for DELETE
- Remove: Permission checks (jabatan)

⏳ `/api/attendances/mass/route.ts`
- Change: `add-mass-attendance-student` → `api/attendance/bulk`
- Change: From query params to multipart/form-data with CSV file
- This requires significant refactoring

⏳ `/api/attendances/get-month/[month]/route.ts`
- Change: Endpoint to `api/attendance/month/${month}`
- Update response handling

⏳ `/api/attendances/get-nis/[nis]/route.ts`
- Change: Endpoint to `api/attendance/student/${nis}`
- Update response handling

⏳ `/api/attendances/export/route.ts`
- This endpoint may need to be removed or reimplemented client-side

## Common Changes Across All Files

1. **Endpoint URLs**: Update from old format to new API format
2. **Error Messages**: Change `data.msg` to `data.message`
3. **Permission Checks**: Remove `token.jabatan` checks (handled by backend)
4. **ID Handling**: 
   - Remove `parseInt(id)` conversions (UUIDs are strings)
   - Remove `id` from request body for PUT/DELETE
5. **Response Handling**: Update to match new response structure

## Next Steps

1. Update remaining violation-types endpoints
2. Update remaining violation-logs endpoints
3. Update remaining sanctions endpoints
4. Update remaining attendance endpoints
5. Test all endpoints
6. Update frontend components to handle new data structure
