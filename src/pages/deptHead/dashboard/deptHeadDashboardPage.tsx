import { useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import StatCard from "../../../components/cards/StatCard";
import "./deptHeadDashboardPage.css";

interface DashboardStat {
    icon: string;
    iconColor: string;
    iconBg: string;
    value: number | string;
    label: string;
}

type RequestScope = "Individual" | "Section" | "Batch";

interface RecentRequest {
    id: string;
    dateFiled: string;
    type: RequestScope;
    status: string;
}

function DeptHeadDashboardPage() {

    // TODO: replace with the department head's actual department name from auth/session
    const [departmentName] = useState("");

    // TODO: replace with real counts from API, scoped to this department only
    const [stats] = useState<DashboardStat[]>([
        {
            icon: "bi-inbox-fill",
            iconColor: "#6d6adf",
            iconBg: "#ecebfc",
            value: "",
            label: "Total Requests",
        },
        {
            icon: "bi-hourglass-split",
            iconColor: "#e6a23c",
            iconBg: "#fdf1e2",
            value: "",
            label: "Pending Requests",
        },
        {
            icon: "bi-calendar-check-fill",
            iconColor: "#3cb371",
            iconBg: "#e5f6ec",
            value: "",
            label: "Requests Today",
        },
    ]);

    // TODO: replace with real recent requests from API, scoped to this department only
    const [recentRequests] = useState<RecentRequest[]>([]);

    return (
        <div className="depthead-dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <div className="depthead-datetime">

                        <div className="depthead-date-block">
                            <i className="bi bi-calendar3 depthead-date-icon"></i>
                            <div>
                                <div className="depthead-day-label">TUESDAY</div>
                                <div className="depthead-day-number">14</div>
                                <div className="depthead-date-full">July 2026</div>
                            </div>
                        </div>

                        <div className="depthead-divider"></div>

                        <div className="depthead-time-block">
                            <div className="depthead-time">11:11 PM</div>
                            <div className="depthead-time-zone">Manila Time</div>
                        </div>

                    </div>
                </TopBar>

                <main className="depthead-dashboard-content">

                    <div className="mt-4 mt-md-5 mb-2">
                        <span className="depthead-department-label">
                            Department: <strong>{departmentName}</strong>
                        </span>
                    </div>

                    
                    <div className="stats-row mt-3 mb-4 mb-md-5">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                icon={stat.icon}
                                iconColor={stat.iconColor}
                                iconBg={stat.iconBg}
                                value={stat.value}
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
                                        {recentRequests.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="recent-requests-empty">
                                                    No requests recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                        {recentRequests.map((req) => (
                                            <tr key={req.id}>
                                                <td>{req.dateFiled}</td>
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