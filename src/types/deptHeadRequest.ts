export type DeptHeadRequestStatus = "PENDING" | "APPROVED" | "DENIED";

export interface DeptHeadRequest {
    requestId: string | number;
    type: string;
    status: DeptHeadRequestStatus;
    dateFiled: string;
    reviewerName?: string;
    reviewerInitials?: string;
    remarks?: string;
}