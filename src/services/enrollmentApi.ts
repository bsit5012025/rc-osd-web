import { apiClient } from "./clientApi";
import type { StudentEnrollment } from "../types/enrollment";

export const getLatestEnrollment = async (studentId: string): Promise<StudentEnrollment> => {
    const response = await apiClient.get<StudentEnrollment>(`/api/enrollments/student/${studentId}/latest`);
    return response.data;
};
