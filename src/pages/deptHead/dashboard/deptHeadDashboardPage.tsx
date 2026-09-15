import { useEffect, useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";
import StatCard from "../../../components/cards/StatCard";

import { getMyDepartmentRequests } from "../../../services/requestApi";
import type { RequestItem } from "../../../types/request";
import { getMyEmployeeInfo } from "../../../services/employeeApi";

import "./deptHeadDashboardPage.css";

function DeptHeadDashboardPage() {

    const [deptHeadName, setDeptHeadName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [now] = useState(new Date());

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError("");

            try {
                const employeeInfo = await getMyEmployeeInfo();
                setDeptHeadName(employeeInfo.fullName ?? "");
                setEmployeeId(employeeInfo.employeeId ?? "");
                setDepartmentName(employeeInfo.department ?? "");
            } catch (err) {
                console.error("Failed to fetch employee info:", err);
            }

            try {
                const myRequests = await getMyDepartmentRequests();
                setRequests(Array.isArray(myRequests) ? myRequests : []);
            } catch (err) {
                console.error("Failed to fetch requests:", err);
                setError("Failed to load requests.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const todayIso = now.toISOString().slice(0, 10);

    const stats = [
        {
            icon: "bi-inbox-fill",
            iconColor: "#6d6adf",
            iconBg: "#ecebfc",
            value: requests.length,
            label: "Total Requests",
        },
        {
            icon: "bi-hourglass-split",
            iconColor: "#e6a23c",
            iconBg: "#fdf1e2",
            value: requests.filter((r) => r.status?.toUpperCase() === "PENDING").length,
            label: "Pending Requests",
        },
        {
            icon: "bi-calendar-check-fill",
            iconColor: "#3cb371",
            iconBg: "#e5f6ec",
            value: requests.filter((r) => r.dateFiled === todayIso).length,
            label: "Requests Today",
        },
    ];

    const recentRequests = [...requests]
        .sort((a, b) => (b.dateFiled ?? "").localeCompare(a.dateFiled ?? ""))
        .slice(0, 10);

    return (
        <div className="depthead-dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <UserGreeting
                        name={deptHeadName}
                        infoItems={[
                            { label: "Employee ID", value: employeeId },
                            { label: "Department", value: departmentName },
                        ]}
                    />
                </TopBar>

                <main className="depthead-dashboard-content">

                    {error && <p className="text-danger">{error}</p>}

                    <div className="mt-4 mt-md-5 mb-2">
                        <span className="depthead-department-label">
                            Department: <strong>{loading ? "Loading..." : (departmentName || "—")}</strong>
                        </span>
                    </div>


                    <div className="stats-row mt-3 mb-4 mb-md-5">
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


                    <div className="mb-4">
                        <h5 className="mb-3">Recent Requests</h5>

                        <div className="dashboard-section p-0">
                            <div className="recent-requests-scroll">
                                <table className="recent-requests-table">
                                    <thead>
                                    <tr>
                                        <th>Date Filed</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {!loading && recentRequests.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="recent-requests-empty">
                                                No requests recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                    {recentRequests.map((req) => (
                                        <tr key={req.requestId}>
                                            <td>{req.dateFiled ?? "—"}</td>
                                            <td>{req.type}</td>
                                            <td>{req.status}</td>
                                        </tr>
                                    ))}
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

export default DeptHeadDashboardPage;
