import { apiClient } from "./clientApi";
import type { StudentRecord } from "../types/record";

export const getStudentRecords = async (
    studentId: string
): Promise<StudentRecord[]> => {
    const response = await apiClient.get<StudentRecord[]>(
        `/api/records/student/${studentId}`
    );

    return response.data;
};