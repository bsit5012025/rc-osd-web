import { apiClient } from "./clientApi";

export interface Student {
    studentId: string;
    address: string;
    department: string;
    studentType: string;

    person: {
        personId: number;
        firstName: string;
        middleName: string;
        lastName: string;
    };
}

export const getStudent = async (
    studentId: string
): Promise<Student> => {
    const response = await apiClient.get<Student>(
        `/api/students/${studentId}`
    );

    return response.data;
};