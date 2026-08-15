import { apiClient } from "./clientApi";

export interface StudentEnrollment {
    enrollmentId: number;
    schoolYear: string;
    studentLevel: string;
    section: string;
    department: string;
}

export const getStudentEnrollment = async (studentId: string): Promise<StudentEnrollment> => {
    const response = await apiClient.get<StudentEnrollment>(
        `/api/enrollments/student/${studentId}/latest`
    );
    return response.data;
};