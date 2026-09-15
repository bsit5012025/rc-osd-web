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
            value: requests.length,
            valueColor: "#1a1a2e",
            label: "Total Requests",
        },
        {
            value: requests.filter((r) => r.status?.toUpperCase() === "PENDING").length,
            valueColor: "#E1AD01",
            label: "Pending Requests",
        },
        {
            value: requests.filter((r) => r.dateFiled === todayIso).length,
            valueColor: "#3cb371",
            label: "Requests Today",
        },
    ];

    const recentRequests = [...requests]
        .sort((a, b) => (b.dateFiled ?? "").localeCompare(a.dateFiled ?? ""))
        .slice(0, 5);

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
                                value={loading ? "—" : stat.value}
                                valueColor={stat.valueColor}
                                label={stat.label}
                            />
                        ))}
                    </div>

                    <div className="dashboard-panel">

                        <div className="dashboard-panel-header">
                            <h2 className="dashboard-panel-title">Recent Requests</h2>
                            <p className="dashboard-panel-subtitle">
                                Latest requests filed within your department
                            </p>
                        </div>

                        {loading && (
                            <div className="dashboard-state">
                                <i className="bi bi-arrow-repeat dashboard-spinner"></i>
                                <strong>Loading requests…</strong>
                            </div>
                        )}

                        {!loading && !error && recentRequests.length === 0 && (
                            <div className="dashboard-state">
                                <i className="bi bi-inbox"></i>
                                <strong>No requests found</strong>
                                <span>Requests filed by your department will show up here.</span>
                            </div>
                        )}

                        {!loading && !error && recentRequests.length > 0 && (
                            <>
                                <div className="recent-requests-table-wrapper">
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
                                            {recentRequests.map((req) => (
                                                <tr key={req.requestId}>
                                                    <td>{req.dateFiled ?? "—"}</td>
                                                    <td>{req.type}</td>
                                                    <td>
                                                        <span
                                                            className={`status-badge ${req.status?.toLowerCase() ?? ""}`}
                                                        >
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="recent-requests-cards-wrapper">
                                    {recentRequests.map((req) => (
                                        <div className="recent-request-card" key={req.requestId}>
                                            <div className="recent-request-card-top">
                                                <span className="recent-request-card-type">{req.type}</span>
                                                <span
                                                    className={`status-badge ${req.status?.toLowerCase() ?? ""}`}
                                                >
                                                    {req.status}
                                                </span>
                                            </div>
                                            <span className="recent-request-card-date">
                                                {req.dateFiled ?? "—"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default DeptHeadDashboardPage;