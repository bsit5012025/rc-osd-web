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

export interface StudentInput {
    studentId: string;
    address: string;
    department: string;
    studentType: string;
    contactNumber: string;
    person: {
        firstName: string;
        middleName: string;
        lastName: string;
        dateOfBirth: string | null;
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

export const getAllStudents = async (
    department?: string
): Promise<Student[]> => {
    const response = await apiClient.get<Student[]>(
        "/api/students",
        {
            params: department ? { department } : {},
        }
    );

    return response.data;
};

export const createStudent = async (
    student: StudentInput
): Promise<Student> => {
    const response = await apiClient.post<Student>(
        "/api/students",
        student
    );

    return response.data;
};

export const updateStudent = async (
    studentId: string,
    student: StudentInput
): Promise<Student> => {
    const response = await apiClient.put<Student>(
        `/api/students/${studentId}`,
        student
    );

    return response.data;
};

export const deleteStudent = async (
    studentId: string
): Promise<void> => {
    await apiClient.delete(`/api/students/${studentId}`);
};