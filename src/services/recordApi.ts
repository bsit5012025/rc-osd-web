import { apiClient } from "./clientApi";

export interface StudentRecord {
    recordId: number;

    enrollment: {
        enrollmentId: number;
        student?: {
            studentId: string;
        };
        schoolYear?: string;
        studentLevel?: string;
        section?: string;
        department?: string;
    };

    employee?: {
        employeeId: string;
        person?: {
            firstName: string;
            middleName: string;
            lastName: string;
        };
    };

    offense?: {
        offenseId: number;
        offenseName?: string;
        name?: string;
    };

    dateOfViolation: string;

    action?: {
        actionId: number;
        actionName?: string;
        name?: string;
    };

    dateOfResolution?: string;

    remarks?: string;

    status?: string;
}


export const getStudentRecords = async (
    studentId: string
): Promise<StudentRecord[]> => {

    const response = await apiClient.get<StudentRecord[]>(
        `/api/records/student/${studentId}`
    );

    return response.data;
};