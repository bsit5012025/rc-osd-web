import { apiClient } from "./clientApi";
import type { Offense } from "../types/offense";

export interface OffenseInput {
offense: string;
type: string;
description: string;
}

const OFFENSE_API_URL = "/api/offenses";

export const getOffenses = async (): Promise<Offense[]> => {
    const response = await apiClient.get<Offense[]>(OFFENSE_API_URL);
    return response.data;
};

export const getOffensesByType = async (type: string): Promise<Offense[]> => {
    const response = await apiClient.get<Offense[]>(OFFENSE_API_URL,{
        params: {type: type,},
    });
    return response.data;
};

export const getOffenseById = async (offenseId: number): Promise<Offense> => {
    const response = await apiClient.get<Offense>(`${OFFENSE_API_URL}/${offenseId}`);
    return response.data;
};

export const createOffense = async (offense: OffenseInput): Promise<Offense> => {
    const response = await apiClient.post<Offense>(OFFENSE_API_URL,offense);
    return response.data;
};

export const updateOffense = async (offenseId: number,offense: OffenseInput): Promise<Offense> => {
    const response = await apiClient.put<Offense>(`${OFFENSE_API_URL}/${offenseId}`,offense);
    return response.data;
};

export const deleteOffense = async (offenseId: number): Promise<void> => {
    await apiClient.delete(`${OFFENSE_API_URL}/${offenseId}`);
};
