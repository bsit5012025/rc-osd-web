import { apiClient } from "./clientApi";
import type { Appeal } from "../types/appeal";

export const getStudentAppeals = async (studentId: string): Promise<Appeal[]> => {
    const response = await apiClient.get<Appeal[]>(`/api/appeals/student/${studentId}`);
    return response.data;
};
