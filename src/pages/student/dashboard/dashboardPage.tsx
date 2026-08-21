import { useEffect, useState } from "react";

import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";
import StatCard from "../../../components/cards/StatCard";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";

import { getStudentAppeals } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

import "./dashboardPage.css";
import Sidebar from "../../../components/navigation/Sidebar";

const DAY_NAMES = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
];

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function DashboardPage() {

    /*
     * Your login currently stores the student's ID in
     * localStorage under "username".
     *
     * Login response:
     * username: "CT23-0004"
     *
     * Therefore we use username here.
     */
    const studentId = localStorage.getItem("username") || "";

    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [now] = useState(new Date());


    /*
     * =========================================================
     * FETCH DASHBOARD DATA
     * =========================================================
     */

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                console.log(
                    "Fetching dashboard data for:",
                    studentId
                );

                const [recordData, appealData] =
                    await Promise.all([
                        getStudentRecords(studentId),
                        getStudentAppeals(studentId),
                    ]);

                console.log(
                    "Dashboard student records:",
                    recordData
                );

                console.log(
                    "Dashboard student appeals:",
                    appealData
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


    /*
     * =========================================================
     * STUDENT INFORMATION
     * =========================================================
     *
     * Student information is already contained inside:
     *
     * record.enrollment.student
     *
     * and:
     *
     * record.enrollment.section
     *
     */

    const firstRecord = records[0];

    const studentName =
        firstRecord?.enrollment?.student?.fullName || "";

    const actualStudentId =
        firstRecord?.enrollment?.student?.studentId ||
        studentId;

    const section =
        firstRecord?.enrollment?.section || "";


    /*
     * =========================================================
     * TODAY'S DATE
     * =========================================================
     *
     * Use local Manila date instead of toISOString(),
     * because toISOString() converts the date to UTC.
     */

    const todayIso =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-${String(
            now.getDate()
        ).padStart(2, "0")}`;


    /*
     * =========================================================
     * STATISTICS
     * =========================================================
     */

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


    /*
     * =========================================================
     * MOST FREQUENT OFFENSES
     * =========================================================
     */

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


    /*
     * =========================================================
     * RECENT OFFENSES
     * =========================================================
     */

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


    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <div className="dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>

                    <div className="dashboard-topbar-content">

                        {/* STUDENT INFORMATION */}

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
                                        section || "—",
                                },
                            ]}
                        />


                        {/* DATE AND TIME */}

                        <div className="dashboard-datetime">

                            <div>

                                <div className="dashboard-day-label">
                                    {DAY_NAMES[now.getDay()]}
                                </div>

                                <div className="dashboard-day-number">
                                    {now.getDate()}
                                </div>

                                <div className="dashboard-date-full">
                                    {
                                        MONTH_NAMES[
                                            now.getMonth()
                                        ]
                                    }{" "}
                                    {now.getFullYear()}
                                </div>

                            </div>

                            <div>

                                <div className="dashboard-time">

                                    {now.toLocaleTimeString(
                                        "en-US",
                                        {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        }
                                    )}

                                </div>

                                <div className="dashboard-time-zone">
                                    Manila Time
                                </div>

                            </div>

                        </div>

                    </div>

                </TopBar>


                <main className="dashboard-content">

                    {/* ERROR */}

                    {error && (
                        <div className="alert alert-danger mt-3">
                            {error}
                        </div>
                    )}


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

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


                    {/* =================================================
                        MOST FREQUENT OFFENSES
                    ================================================= */}

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


                    {/* =================================================
                        RECENT OFFENSES
                    ================================================= */}

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


            <Sidebar />

        </div>
    );
}

export default DashboardPage;