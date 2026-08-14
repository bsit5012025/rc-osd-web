export interface Appeal {
  appealId: string;
  recordId: number;
  title: string;
  status: "Pending" | "Approved" | "Denied";
  dateSubmitted: string;
  prefectName?: string;
  prefectInitials?: string;
  remarks?: string;
}
