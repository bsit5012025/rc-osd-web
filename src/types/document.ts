export interface DocumentUploadResponse {
    documentId: number;
    extractedText: string;
    aiSuggestion: string | null;
}
