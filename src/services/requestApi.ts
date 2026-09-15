import { apiClient } from "./clientApi";
import type { RequestItem, RequestSubmitPayload } from "../types/request";

export const getMyDepartmentRequests = async (): Promise<RequestItem[]> => {
    const response = await apiClient.get<RequestItem[]>(
        "/api/requests/my-department"
    );

    console.log(
        "GET /api/requests/my-department → status:",
        response.status,
        "| data:",
        response.data
    );

    return response.data;
};

export const submitRequest = async (
    payload: RequestSubmitPayload
): Promise<RequestItem> => {
    try {
        console.log("POST /api/requests → payload:", payload);

        const response = await apiClient.post<RequestItem>(
            "/api/requests",
            payload
        );

        console.log(
            "POST /api/requests → status:",
            response.status,
            "| data:",
            response.data
        );

        return response.data;
    } catch (error: any) {
        console.error(
            "POST /api/requests → status:",
            error.response?.status
        );

        console.error(
            "POST /api/requests → response:",
            error.response?.data
        );

        console.error(
            "POST /api/requests → payload:",
            payload
        );

        throw error;
    }
};
export const getAllRequests = async (status?: string): Promise<RequestItem[]> => {
    const response = await apiClient.get<RequestItem[]>("/api/requests", {
        params: status ? { status } : undefined,
    });
    console.log("GET /api/requests → status:", response.status, "| data:", response.data);
    return response.data;
};