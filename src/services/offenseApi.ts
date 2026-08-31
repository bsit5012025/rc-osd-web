import { apiClient } from "./clientApi";
import type { Offense } from "../types/offense";

export interface OffenseInput {
    offense: string;
    type: string;
    description: string;
}

// Get all offenses
export const getOffenses = async (): Promise<Offense[]> => {
    const response = await apiClient.get<Offense[]>("/api/offenses");
    return response.data;
};

// Create offense
export const createOffense = async (
    offense: OffenseInput
): Promise<Offense> => {
    const response = await apiClient.post<Offense>(
        "/api/offenses",
        offense
    );
    return response.data;
};

// Update offense
export const updateOffense = async (
    offenseId: number,
    offense: OffenseInput
): Promise<Offense> => {
    const response = await apiClient.put<Offense>(
        `/api/offenses/${offenseId}`,
        offense
    );
    return response.data;
};

// Delete offense
export const deleteOffense = async (
    offenseId: number
): Promise<void> => {
    await apiClient.delete(`/api/offenses/${offenseId}`);
};