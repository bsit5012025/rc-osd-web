import { useState, useEffect, useMemo, useCallback } from "react";
import { getStudent } from "../services/studentApi";
import { getStudentRecords } from "../services/recordApi";
import { getStudentAppeals, type BackendAppeal } from "../services/appealApi";
import { getStudentEnrollment } from "../services/enrollmentApi";
import { getStudentGuardians, type BackendGuardian } from "../services/guardianApi";
import type { Student } from "../services/studentApi";
import type { StudentRecord } from "../types/record";
import type { Appeal, AppealStatus } from "../types/appeal";
import type { StudentEnrollment } from "../types/enrollment";
import type { Guardian } from "../types/guardian";

export interface StudentStats {
    totalViolations: number;
    pendingAppeals: number;
    offensesToday: number;
    mostFrequentOffenses: { offense: string; count: number }[];
}

export interface UseStudentDataReturn {
    student: Student | null;
    records: StudentRecord[];
    appeals: Appeal[];
    enrollment: StudentEnrollment | null;
    guardians: Guardian[];
    stats: StudentStats;
    loading: boolean;
    error: string;
    refetch: () => void;
}

const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

const toAppealStatus = (status: string): AppealStatus => {
    switch (status.toUpperCase()) {
        case "APPROVED": return "Approved";
        case "DENIED": return "Denied";
        default: return "Pending";
    }
};

const mapAppeal = (ba: BackendAppeal): Appeal => {
    const person = ba.record?.employee?.person;
    const offenseName = ba.record?.offense?.offense;

    return {
        appealId: String(ba.appealId),
        title: offenseName || ba.message || "Unknown Appeal",
        status: toAppealStatus(ba.status),
        dateSubmitted: ba.dateFiled,
        prefectName: person ? `${person.firstName} ${person.lastName}` : undefined,
        prefectInitials: person
            ? `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()
            : undefined,
        remarks: ba.remarks ?? undefined,
    };
};

const mapGuardian = (bg: BackendGuardian): Guardian => ({
    guardianId: bg.guardianID,
    fullName: bg.person ? `${bg.person.firstName} ${bg.person.lastName}` : "Unknown",
    relationship: bg.relationship,
    contactNumber: bg.contactNumber || "",
});

export const useStudentData = (studentId?: string): UseStudentDataReturn => {
    const id = studentId || localStorage.getItem("username") || "";

    const [student, setStudent] = useState<Student | null>(null);
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null);
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fetchKey, setFetchKey] = useState(0);

    const refetch = useCallback(() => setFetchKey((k) => k + 1), []);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("No student ID available.");
            return;
        }

        let cancelled = false;

        const fetchAll = async () => {
            setLoading(true);
            setError("");

            try {
                const [studentData, recordsData] = await Promise.all([
                    getStudent(id),
                    getStudentRecords(id),
                ]);

                const [appealsRaw, enrollmentData, guardiansRaw] = await Promise.all([
                    getStudentAppeals(id).catch(() => [] as BackendAppeal[]),
                    getStudentEnrollment(id).catch(() => null),
                    getStudentGuardians(id).catch(() => [] as BackendGuardian[]),
                ]);

                if (!cancelled) {
                    setStudent(studentData);
                    setRecords(recordsData);
                    setAppeals(appealsRaw.map(mapAppeal));
                    setEnrollment(enrollmentData);
                    setGuardians(guardiansRaw.map(mapGuardian));
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to load student data.");
                    console.error(err);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAll();
        return () => { cancelled = true; };
    }, [id, fetchKey]);

    const stats = useMemo<StudentStats>(() => {
        const totalViolations = records.length;
        const pendingAppeals = appeals.filter((a) => a.status === "Pending").length;
        const offensesToday = records.filter((r) => isToday(r.dateOfViolation)).length;

        const offenseCounts: Record<string, number> = {};
        records.forEach((r) => {
            const key = r.offense.offense;
            offenseCounts[key] = (offenseCounts[key] || 0) + 1;
        });

        const mostFrequentOffenses = Object.entries(offenseCounts)
            .map(([offense, count]) => ({ offense, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { totalViolations, pendingAppeals, offensesToday, mostFrequentOffenses };
    }, [records, appeals]);

    return {
        student,
        records,
        appeals,
        enrollment,
        guardians,
        stats,
        loading,
        error,
        refetch,
    };
};
