import { useEffect, useState } from "react";

import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";
import StatCard from "../../../components/cards/StatCard";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";

import { getStudentAppeals } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

import "./dashboardPage.css";

function DashboardPage() {
    const studentId = localStorage.getItem("username") || "";

    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [now] = useState(new Date());

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                const [recordData, appealData] =
                    await Promise.all([
                        getStudentRecords(studentId),
                        getStudentAppeals(studentId),
                    ]);

                // DEBUG: Check what the backend is returning
                console.log("Student Records:", recordData);
                console.log(
                    "First Enrollment:",
                    recordData[0]?.enrollment
                );

                // Specifically check section and department
                console.log(
                    "Section:",
                    recordData[0]?.enrollment?.section
                );

                console.log(
                    "Department:",
                    recordData[0]?.enrollment?.department
                );

                setRecords(recordData);
                setAppeals(appealData);

            } catch (err) {
                console.error(
                    "Failed to fetch dashboard data:",
                    err
                );

                setError(
                    "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [studentId]);

    const firstRecord = records[0];

    const studentName =
        firstRecord?.enrollment?.student?.fullName || "";

    const actualStudentId =
        firstRecord?.enrollment?.student?.studentId ||
        studentId;

    // GET SECTION HERE
    const section =
        firstRecord?.enrollment?.section || "";

    const todayIso =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-${String(
            now.getDate()
        ).padStart(2, "0")}`;

    const totalViolations = records.length;

    const pendingAppeals = appeals.filter(
        (appeal) =>
            appeal.status?.toUpperCase() === "PENDING"
    ).length;

    const offensesToday = records.filter(
        (record) =>
            record.dateOfViolation === todayIso
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

    const offenseCounts =
        records.reduce<Record<string, number>>(
            (acc, record) => {
                const label =
                    record.offense?.offense ||
                    "Unknown";

                acc[label] =
                    (acc[label] || 0) + 1;

                return acc;
            },
            {}
        );

    const maxOffenseCount = Math.max(
        1,
        ...Object.values(offenseCounts)
    );

    const frequentOffenses =
        Object.entries(offenseCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([label, count]) => ({
                label,
                percent: Math.round(
                    (count / maxOffenseCount) * 100
                ),
            }));

    const recentOffenses =
        [...records]
            .sort(
                (a, b) =>
                    (b.dateOfViolation || "")
                        .localeCompare(
                            a.dateOfViolation || ""
                        )
            )
            .slice(0, 5);

    return (
        <div className="dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>

                    <div className="dashboard-topbar-content">

                        <UserGreeting
                            name={
                                loading
                                    ? "Loading..."
                                    : studentName || "Student"
                            }
                            infoItems={[
                                {
                                    label: "Student ID",
                                    value: actualStudentId,
                                },
                                {
                                    label: "Section",
                                    value:
                                        loading
                                            ? "Loading..."
                                            : section || "—",
                                },
                            ]}
                        />

                    </div>

                </TopBar>

                <main className="dashboard-content">

                    {error && (
                        <div className="alert alert-danger mt-3">
                            {error}
                        </div>
                    )}

                    <div className="stats-row mt-4 mt-md-5 mb-4 mb-md-5">

                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                icon={stat.icon}
                                iconColor={stat.iconColor}
                                iconBg={stat.iconBg}
                                value={
                                    loading
                                        ? "—"
                                        : stat.value
                                }
                                label={stat.label}
                            />
                        ))}

                    </div>

                    <div className="mb-4">

                        <h5 className="mb-3">
                            Most Frequent Offenses
                        </h5>

                        <div className="dashboard-section">

                            {loading && (
                                <p className="mb-0">
                                    Loading offenses...
                                </p>
                            )}

                            {!loading &&
                                frequentOffenses.length === 0 && (
                                    <p className="mb-0">
                                        No offenses recorded yet.
                                    </p>
                                )}

                            {!loading &&
                                frequentOffenses.map(
                                    (item) => (
                                        <div
                                            className="frequent-offense-row"
                                            key={item.label}
                                        >

                                            <span className="frequent-offense-label">
                                                {item.label}
                                            </span>

                                            <div className="frequent-offense-bar-track">

                                                <div
                                                    className="frequent-offense-bar-fill"
                                                    style={{
                                                        width: `${item.percent}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    )
                                )}

                        </div>

                    </div>

                    <div className="mb-4">

                        <h5 className="mb-3">
                            Recent Offenses
                        </h5>

                        <div className="dashboard-section p-0">

                            <div className="recent-offenses-scroll">

                                <table className="recent-offenses-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Offense Type
                                            </th>

                                            <th>
                                                Level of Offense
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {loading && (
                                            <tr>

                                                <td
                                                    colSpan={3}
                                                    className="recent-offenses-empty"
                                                >
                                                    Loading...
                                                </td>

                                            </tr>
                                        )}

                                        {!loading &&
                                            recentOffenses.length === 0 && (
                                                <tr>

                                                    <td
                                                        colSpan={3}
                                                        className="recent-offenses-empty"
                                                    >
                                                        No offenses recorded yet.
                                                    </td>

                                                </tr>
                                            )}

                                        {!loading &&
                                            recentOffenses.map(
                                                (record) => (
                                                    <tr
                                                        key={
                                                            record.recordId
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                record.dateOfViolation
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                record
                                                                    .offense
                                                                    ?.offense ||
                                                                "Unknown"
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                record
                                                                    .offense
                                                                    ?.type ||
                                                                "—"
                                                            }
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default DashboardPage;