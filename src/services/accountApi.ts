import { apiClient } from "./clientApi";

export interface LockedAccount {
    username: string;
    role: string | null;
    failedLoginAttempts: number;
    locked: boolean;
    active: boolean;
}

export const getLockedAccounts = async (): Promise<LockedAccount[]> => {
    const response = await apiClient.get<LockedAccount[]>("/login/locked");
    return response.data;
};

export const reactivateAccount = async (username: string): Promise<void> => {
    await apiClient.put(`/login/${encodeURIComponent(username)}/unlock`);
};
