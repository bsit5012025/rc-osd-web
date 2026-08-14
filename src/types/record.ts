export interface RecordStudent {
    studentId: string;
    fullName: string;
}

export interface Enrollment {
    enrollmentId: number;
    student: RecordStudent;
    schoolYear: string;
    studentLevel: string;
    section: string;
    department: string;
}

export interface Employee {
    employeeId: string;
    fullName: string;
    employeeRole: string;
}

export interface RecordOffense {
    offenseId: number;
    offense: string;
    type: string;
}

export interface DisciplinaryAction {
    actionId: number;
    actionName: string;
}

export interface StudentRecord {
    recordId: number;
    enrollment: Enrollment;
    employee: Employee;
    offense: RecordOffense;
    dateOfViolation: string;
    action: DisciplinaryAction | null;
    dateOfResolution: string | null;
    remarks: string;
    status: string;
}
