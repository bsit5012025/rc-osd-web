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

export interface Student {
    studentId: string;
    address: string;
    department: string;
    studentType: string;
    contactNumber: string;
    guardians: Guardian[];
    person: {
        personId: number;
        firstName: string;
        middleName: string;
        lastName: string;
        dateOfBirth: string | null;
    };
}

export const getStudent = async ( studentId: string): Promise<Student> => {
    const response = await apiClient.get<Student>(`/api/students/${studentId}`);
    return response.data;
};