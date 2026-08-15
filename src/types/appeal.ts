export type AppealStatus = "Pending" | "Approved" | "Denied";

export interface Appeal {
  appealId: string;
  title: string;
  status: AppealStatus;
  dateSubmitted: string;
  prefectName?: string;
  prefectInitials?: string;
  remarks?: string;
}
