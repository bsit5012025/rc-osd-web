import { apiClient } from "./clientApi";
import type { EmployeeSummary } from "../types/employee";

export const getMyEmployeeInfo = async (): Promise<EmployeeSummary> => {
    const response = await apiClient.get<EmployeeSummary>("/api/employees/me");
    return response.data;
};
