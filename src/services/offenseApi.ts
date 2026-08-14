import { apiClient } from "./clientApi";
import type { Offense } from "../types/offense";

export const getOffenses = async (): Promise<Offense[]> => {
    const response = await apiClient.get<Offense[]>("/api/offenses");

    return response.data;
};