import { apiClient } from "./clientApi";
import type { Appeal } from "../types/appeal";

export interface SubmitAppealRequest {
    recordId: number;
    enrollmentId: number;
    message: string;
}

export const getStudentAppeals = async (studentId: string): Promise<Appeal[]> => {

    const response = await apiClient.get<Appeal[]>(
        `/api/appeals/student/${studentId}`
    );

    return response.data;
};

export const submitAppeal = async (request: SubmitAppealRequest): Promise<Appeal> => {
    const response = await apiClient.post<Appeal>("/api/appeals", request);
    return response.data;
};