import type { StudentRecord } from "./record";

export interface Appeal {
    appealId: number;
    record: StudentRecord;
    enrollment: {
        enrollmentId: number;
        schoolYear: string;
        studentLevel: string;
        section: string;
    };
    message: string;
    dateFiled: string;
    status: string;
    dateProcessed: string | null;
    remarks: string | null;
}
