export interface RequestItem {
    requestId: number;
    employeeId: string;
    details: string;
    message: string;
    type: string;
    status: string;
    dateFiled: string | null;
    dateProcessed: string | null;
    remarks: string | null;
    graduationEligibility: string | null;
    deliveryMethod: string | null;
    deliveryEmail?: string | null;
}

export interface RequestSubmitPayload {
    details: string;
    message: string;
    type: string;
    deliveryMethod: "HARDCOPY" | "EMAIL";
    deliveryEmail?: string;
}