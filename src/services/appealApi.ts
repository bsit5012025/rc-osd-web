import { apiClient } from "./clientApi";

export interface BackendAppeal {
    appealId: number;
    record: {
        recordId: number;
        employee?: {
            employeeId: string;
            person?: {
                firstName: string;
                lastName: string;
            };
        };
        offense?: {
            offense: string;
        };
    };
    message: string;
    dateFiled: string;
    status: string;
    dateProcessed: string | null;
    remarks: string | null;
}

export const getStudentAppeals = async (studentId: string): Promise<BackendAppeal[]> => {
    const response = await apiClient.get<BackendAppeal[]>(`/api/appeals/student/${studentId}`);
    return response.data;
};
