import { apiClient } from "./clientApi";
import type { Guardian } from "../types/guardian";

export const getStudentGuardians = async (studentId: string): Promise<Guardian[]> => {
    const response = await apiClient.get<Guardian[]>(`/api/guardians/student/${studentId}`);
    return response.data;
};
