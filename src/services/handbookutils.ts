export type HandbookDepartment = "JHS" | "SHS" | "COLLEGE_TED";

export const HANDBOOK_FILES: Record<HandbookDepartment, string> = {
    JHS: "/handbooks/jhs-handbook.pdf",
    SHS: "/handbooks/shs-handbook.pdf",
    COLLEGE_TED: "/handbooks/college-ted-handbook.pdf",
};

export const HANDBOOK_LABELS: Record<HandbookDepartment, string> = {
    JHS: "JHS Student Handbook",
    SHS: "SHS Student Handbook",
    COLLEGE_TED: "College/TED Student Handbook",
};

/**
 * Students: department is derived from the Student ID prefix.
 *   JHS-0000  -> Junior High School
 *   SHS-0000  -> Senior High School
 *   CT00-0000 -> College / Technical Education (TED)
 */
export const getHandbookDeptFromStudentId = (studentId: string): HandbookDepartment | null => {
    const id = (studentId || "").trim().toUpperCase();

    if (id.startsWith("JHS")) return "JHS";
    if (id.startsWith("SHS")) return "SHS";
    if (/^CT\d/.test(id)) return "COLLEGE_TED";

    return null;
};

/**
 * Department heads: department comes straight from their employee record
 * (e.g. "JHS", "SHS", "College", "TED"). Matches loosely so slight naming
 * variations from the backend still resolve correctly.
 */
export const getHandbookDeptFromDepartmentName = (department: string): HandbookDepartment | null => {
    const dept = (department || "").trim().toUpperCase();

    if (dept.includes("JHS")) return "JHS";
    if (dept.includes("SHS")) return "SHS";
    if (dept.includes("COLLEGE") || dept.includes("TED")) return "COLLEGE_TED";

    return null;
};

export const getHandbookUrl = (dept: HandbookDepartment | null): string | null =>
    dept ? HANDBOOK_FILES[dept] : null;

export const getHandbookLabel = (dept: HandbookDepartment | null): string =>
    dept ? HANDBOOK_LABELS[dept] : "Student Handbook";

export const openHandbook = (dept: HandbookDepartment | null): void => {
    const url = getHandbookUrl(dept);

    if (!url) {
        console.warn("Could not determine which handbook to open — unrecognized department.");
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
};