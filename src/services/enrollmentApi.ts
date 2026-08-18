import { apiClient } from "./clientApi";

export interface Enrollment {
    enrollmentId: number;

    student: {
        studentId: string;
    };

    schoolYear: string;

    studentLevel: string;

    section: string;

    department: string;

    disciplinaryStatus?: {
        disciplinaryStatusId?: number;
        status?: string;
    };
}

export const getLatestEnrollment = async (
    studentId: string
): Promise<Enrollment> => {

    const response = await apiClient.get<Enrollment>(
        `/api/enrollments/student/${studentId}/latest`
    );

    return response.data;
};