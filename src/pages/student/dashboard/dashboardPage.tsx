import { useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";
import StatCard from "../../../components/cards/StatCard";
import "./dashboardPage.css";

function DashboardPage() {

    // TODO: replace with the logged-in student's actual info from auth/session/API
    const [studentName] = useState("");
    const [studentId] = useState("");
    const [section] = useState("");

    const stats = [
        {
            icon: "bi-exclamation-triangle-fill",
            iconColor: "#6d6adf",
            iconBg: "#ecebfc",
            value: 14,
            label: "Total Violations",
        },
        {
            icon: "bi-clock-fill",
            iconColor: "#e6a23c",
            iconBg: "#fdf1e2",
            value: 7,
            label: "Pending Appeals",
        },
        {
            icon: "bi-calendar-check-fill",
            iconColor: "#3cb371",
            iconBg: "#e5f6ec",
            value: 0,
            label: "Offenses Today",
        },
    ];

    const frequentOffenses = [
        { label: "Cheating", percent: 90 },
        { label: "PDA", percent: 70 },
        { label: "Uniform", percent: 60 },
        { label: "Tardy", percent: 30 },
    ];

    return (
        <div className="dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <UserGreeting
                        name={studentName}
                        infoItems={[
                            { label: "Student ID", value: studentId },
                            { label: "Section", value: section },
                        ]}
                    />
                </TopBar>

                <main className="dashboard-content">


                    <div className="stats-row mt-4 mt-md-5 mb-4 mb-md-5">
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
                        <h5 className="mb-3">Most Frequent Offenses</h5>

                        <div className="dashboard-section">
                            {frequentOffenses.map((item) => (
                                <div className="frequent-offense-row" key={item.label}>
                                    <span className="frequent-offense-label">{item.label}</span>
                                    <div className="frequent-offense-bar-track">
                                        <div
                                            className="frequent-offense-bar-fill"
                                            style={{ width: `${item.percent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="mb-4">
                        <h5 className="mb-3">Recent Offenses</h5>

                        <div className="dashboard-section p-0">
                            <div className="recent-offenses-scroll">
                                <table className="recent-offenses-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Offense Type</th>
                                            <th>Level of Offense</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={3} className="recent-offenses-empty">
                                                No offenses recorded yet.
                                            </td>
                                        </tr>
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