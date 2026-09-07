import { useEffect, useMemo, useState } from "react";

import TopBar from "../../../components/navigation/TopBar";
import ProfileHeader from "../../../components/navigation/ProfileHeader";
import StatCard from "../../../components/cards/StatCard";
import OffenseCard from "../../../components/cards/OffenseCard";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";

import { getStudent } from "../../../services/studentApi";
import type { Student } from "../../../services/studentApi";

import { getStudentAppeals } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

import "./OffensePage.css";

const PAGE_SIZE = 8;

function OffensesPage() {
    const studentId = localStorage.getItem("username") || "";

    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [student, setStudent] = useState<Student | null>(null);

    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [now] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                const [studentData, recordData, appealData] = await Promise.all([
                    getStudent(studentId),
                    getStudentRecords(studentId),
                    getStudentAppeals(studentId),
                ]);

                setStudent(studentData);
                setRecords(recordData);
                setAppeals(appealData);
            } catch (err) {
                console.error("Failed to fetch offense data:", err);
                setError("Failed to load offense data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    const section = records[0]?.enrollment?.section || "";

    const initials = student
        ? `${student.person.firstName?.[0] ?? ""}${student.person.lastName?.[0] ?? ""}`.toUpperCase()
        : "ST";

    const fullName = student
        ? `${student.person.firstName} ${student.person.middleName} ${student.person.lastName}`
        : "Student";

    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;

    const totalViolations = records.length;

    const pendingAppeals = appeals.filter(
        (appeal) => appeal.status?.toUpperCase() === "PENDING"
    ).length;

    const offensesToday = records.filter(
        (record) => record.dateOfViolation === todayIso
    ).length;

    const stats = [
        {
            icon: "bi-exclamation-triangle-fill",
            iconColor: "#6d6adf",
            iconBg: "#ecebfc",
            value: totalViolations,
            label: "Total Violations",
        },
        {
            icon: "bi-clock-fill",
            iconColor: "#e6a23c",
            iconBg: "#fdf1e2",
            value: pendingAppeals,
            label: "Pending Appeals",
        },
        {
            icon: "bi-calendar-check-fill",
            iconColor: "#3cb371",
            iconBg: "#e5f6ec",
            value: offensesToday,
            label: "Offenses Today",
        },
    ];

    const levels = useMemo(
        () => Array.from(new Set(records.map((r) => r.offense.type))).sort(),
        [records]
    );

    const processedRecords = useMemo(() => {
        let result = [...records];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter((r) => r.offense.offense.toLowerCase().includes(q));
        }

        if (levelFilter !== "All") {
            result = result.filter((r) => r.offense.type === levelFilter);
        }

        result.sort((a, b) => (b.dateOfViolation || "").localeCompare(a.dateOfViolation || ""));

        return result;
    }, [records, search, levelFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, levelFilter]);

    const totalPages = Math.max(1, Math.ceil(processedRecords.length / PAGE_SIZE));
    const pagedRecords = processedRecords.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    return (
        <div className="offenses-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <ProfileHeader
                        initials={initials}
                        name={loading ? "Loading..." : fullName}
                        infoItems={[
                            { label: "Student ID", value: student?.studentId || studentId },
                            ...(section ? [{ label: "Section", value: section }] : []),
                        ]}
                    />
                </TopBar>

                <main className="offenses-content">

                    {error && <p className="text-danger mt-3">{error}</p>}

                    <div className="stats-row mt-4 mt-md-5 mb-4 mb-md-5">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                icon={stat.icon}
                                iconColor={stat.iconColor}
                                iconBg={stat.iconBg}
                                value={loading ? "—" : stat.value}
                                label={stat.label}
                            />
                        ))}
                    </div>

                    <h2 className="mb-4 fw-bold">My Offenses</h2>

                    <div className="offense-toolbar mb-4 mb-md-5">

                        <div className="offense-search">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Search offense..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <select
                            className="offense-select"
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <option value="All">All Levels</option>
                            {levels.map((lvl) => (
                                <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                        </select>

                    </div>

                    {loading && <p>Loading offenses...</p>}

                    {!loading && !error && processedRecords.length === 0 && (
                        <p>No offenses found.</p>
                    )}

                    {!loading && !error && processedRecords.length > 0 && (
                        <>
                            <div className="offense-table-wrapper">
                                <table className="offense-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Offense</th>
                                            <th>Level</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedRecords.map((record) => (
                                            <tr key={record.recordId}>
                                                <td>{record.dateOfViolation}</td>
                                                <td>{record.offense.offense}</td>
                                                <td>
                                                    <span
                                                        className={`level-badge ${record.offense.type.toLowerCase()}`}
                                                    >
                                                        {record.offense.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`status-badge ${record.status.toLowerCase()}`}
                                                    >
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="offense-cards-wrapper offense-list">
                                {pagedRecords.map((record) => (
                                    <OffenseCard
                                        key={record.recordId}
                                        offense={record.offense.offense}
                                        level={record.offense.type}
                                        dateFiled={record.dateOfViolation}
                                        status={record.status}
                                    />
                                ))}
                            </div>

                            <div className="offense-pagination">

                                <button
                                    type="button"
                                    className="offense-pagination-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                    <span>Previous</span>
                                </button>

                                <span className="offense-pagination-info">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    className="offense-pagination-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    <span>Next</span>
                                    <i className="bi bi-chevron-right"></i>
                                </button>

                            </div>
                        </>
                    )}

                </main>

            </div>

        </div>
    );
}

export default OffensesPage;