export interface RequestItem {
    requestId: number;
    employeeId: string;
    details: string;
    message: string;
    type: string;
    status: string;
    dateFiled: string | null;
    aiResponse: string | null;
    dateProcessed: string | null;
    remarks: string | null;
}

export interface RequestSubmitPayload {
    details: string;
    message: string;
    type: string;
}