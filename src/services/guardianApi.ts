import { apiClient } from "./clientApi";

export interface Guardian {
    guardianID: number;

    person: {
        personId: number;
        firstName: string;
        middleName: string;
        lastName: string;
    };

    contactNumber: string;
    relationship: string;
}

export const getGuardiansByStudent = async (
    studentId: string
): Promise<Guardian[]> => {

    const response = await apiClient.get<Guardian[]>(
        `/api/guardians/student/${studentId}`
    );

    return response.data;
};