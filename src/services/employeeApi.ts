import { apiClient } from "./clientApi";

export interface EmployeeSummary {
    employeeId: string;
    fullName: string;
    employeeRole: string;
}

export const getMyEmployeeInfo = async (): Promise<EmployeeSummary> => {
    const response = await apiClient.get("/api/employees/me");

    return response.data;
};