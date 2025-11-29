/**
 * API Endpoint Migration Mapping
 * Maps old API endpoints to new API endpoints
 */

export const ENDPOINT_MAPPING = {
    // Auth
    'auth-login': 'api/auth/login',
    
    // Teachers
    'get-teachers': 'api/teachers',
    'add-teacher': 'api/teachers',
    'edit-teacher': 'api/teachers/:id',
    'delete-teacher': 'api/teachers/:id',
    
    // Students
    'get-students': 'api/students',
    'get-student': 'api/students/:id',
    'add-student': 'api/students',
    'edit-student': 'api/students/:id',
    'delete-student': 'api/students/:id',
    
    // Classes
    'get-classes': 'api/classes',
    'add-class': 'api/classes',
    'edit-class': 'api/classes/:id',
    'delete-class': 'api/classes/:id',
    
    // Violation Types
    'get-violations-type': 'api/violation-types',
    'add-violation-type': 'api/violation-types',
    'edit-violation-type': 'api/violation-types/:id',
    'delete-violation-type': 'api/violation-types/:id',
    
    // Violation Logs
    'get-violations-log': 'api/violation-logs',
    'add-violation-log': 'api/violation-logs',
    'edit-violation-log': 'api/violation-logs/:id',
    'delete-violation-log': 'api/violation-logs/:id',
    
    // Sanctions
    'get-sanctions': 'api/sanctions',
    'get-sanction': 'api/sanctions/:id',
    'add-sanction': 'api/sanctions',
    'edit-sanction': 'api/sanctions/:id',
    'delete-sanction': 'api/sanctions/:id',
    
    // Attendance
    'get-attendances': 'api/attendance',
    'add-attendance-student': 'api/attendance',
    'add-mass-attendance-student': 'api/attendance/bulk',
    'edit-attendance-student': 'api/attendance/:id',
    'delete-attendance-student': 'api/attendance/:id',
    'get-attendances-month': 'api/attendance/month/:month',
    'get-attendances-nis': 'api/attendance/student/:nis',
};

/**
 * Response field mapping from old to new API
 */
export const RESPONSE_FIELD_MAPPING = {
    // Common
    'msg': 'message',
    
    // Student fields
    'nama_lengkap': 'name',
    'kelas': 'class.name',
    
    // Teacher fields
    'nama': 'name',
    'jabatan': 'role',
    
    // Class fields
    'nama_kelas': 'name',
    'wali_kelas': 'homeroom_teacher',
    'total_siswa': 'student_count',
    
    // Violation Type fields
    'nama_pelanggaran': 'name',
    'kategori': 'category',
    'pembuat': 'creator',
    
    // Violation Log fields
    'nis_siswa': 'student.nis',
    'nama_siswa': 'student.name',
    'jenis_pelanggaran': 'violation_type.name',
    'catatan': 'notes',
    'tanggal_terjadi': 'date',
    'tanggal_dicatat': 'created_at',
    'pelapor': 'reporting_teacher.name',
    'guru_bk': 'counselor.name',
    
    // Sanction fields
    'pembinaan': 'name',
    
    // Attendance fields
    'tanggal': 'date',
    'status_absensi': 'status',
};
