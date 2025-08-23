export type MonthlyAttendance = {
    id: number;
    month: string; // Format: "YYYY-MM"
    studentId: string;
    studentNis: string;
    studentName: string;
    class: string;
    present: number;
    sick: number;
    absent: number;
    totalDays: number;
};

export type DailyAttendance = {
    id: number;
    date: string; // Format: "YYYY-MM-DD"
    studentId: string;
    studentNis: string;
    studentName: string;
    class: string;
    status: 'Hadir' | 'Sakit' | 'Alpha';
};