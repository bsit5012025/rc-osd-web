import { apiClient } from "./clientApi";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string | null;
}

export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/login",request);
  return response.data;
};

export const refreshToken = async (): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/login/refresh");
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/login/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
};