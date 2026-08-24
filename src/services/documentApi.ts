import { apiClient } from "./clientApi";
import type { DocumentUploadResponse } from "../types/document";

export const uploadAppealDocument = async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<DocumentUploadResponse>("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
};
