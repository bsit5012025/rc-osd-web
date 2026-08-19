export interface StudentEnrollment {
    enrollmentId: number;
    schoolYear: string;
    studentLevel: string;
    section: string;
    department: string;
    disciplinaryStatus: {
        disciplinaryStatusId: number;
        status: string;
    } | null;
}
