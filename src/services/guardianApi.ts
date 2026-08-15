import { apiClient } from "./clientApi";

export interface BackendGuardian {
    guardianID: number;
    person?: {
        personId: number;
        firstName: string;
        lastName: string;
    };
    contactNumber: string;
    relationship: string;
}

export const getStudentGuardians = async (studentId: string): Promise<BackendGuardian[]> => {
    const response = await apiClient.get<BackendGuardian[]>(`/api/guardians/student/${studentId}`);
    return response.data;
};