import { apiClient } from "./clientApi";

export interface Appeal {
    appealId: number;

    record?: {
        recordId: number;
    };

    enrollment?: {
        enrollmentId: number;
        student?: {
            studentId: string;
        };
    };

    message: string;

    dateFiled: string;

    status: string;

    dateProcessed?: string;

    remarks?: string;
}


export const getStudentAppeals = async (
    studentId: string
): Promise<Appeal[]> => {

    const response = await apiClient.get<Appeal[]>(
        `/api/appeals/student/${studentId}`
    );

    return response.data;
};