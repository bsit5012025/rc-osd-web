import { useState, useEffect, useMemo } from "react";
import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import StatCard from "../../../components/cards/StatCard";
import { useStudentData } from "../../../hooks/useStudentData";
import "./dashboardPage.css";

function DashboardPage() {
    const { student, records, stats, loading, error } = useStudentData();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const dayName = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const dayNumber = now.getDate();
    const monthYear = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const timeZone = "Manila Time";

    const frequentOffensesWithPercent = useMemo(() => {
        if (stats.mostFrequentOffenses.length === 0) return [];
        const maxCount = stats.mostFrequentOffenses[0].count;
        return stats.mostFrequentOffenses.map((item) => ({
            label: item.offense,
            percent: Math.round((item.count / maxCount) * 100),
        }));
    }, [stats.mostFrequentOffenses]);

    const recentOffenses = useMemo(() => {
        return [...records]
            .sort((a, b) => new Date(b.dateOfViolation).getTime() - new Date(a.dateOfViolation).getTime())
            .slice(0, 5);
    }, [records]);

    if (loading) {
        return (
            <div className="dashboard-page d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page d-flex align-items-center justify-content-center">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
                <TopBar>
                    <div className="dashboard-datetime">
                        <div>
                            <div className="dashboard-day-label">{dayName}</div>
                            <div className="dashboard-day-number">{dayNumber}</div>
                            <div className="dashboard-date-full">{monthYear}</div>
                        </div>
                        <div>
                            <div className="dashboard-time">{time}</div>
                            <div className="dashboard-time-zone">{timeZone}</div>
                        </div>
                    </div>
                </TopBar>

                <main className="dashboard-content">
                    <div className="stats-row mt-4 mt-md-5 mb-4 mb-md-5">
                        <StatCard
                            icon="bi-exclamation-triangle-fill"
                            iconColor="#6d6adf"
                            iconBg="#ecebfc"
                            value={stats.totalViolations}
                            label="Total Violations"
                        />
                        <StatCard
                            icon="bi-clock-fill"
                            iconColor="#e6a23c"
                            iconBg="#fdf1e2"
                            value={stats.pendingAppeals}
                            label="Pending Appeals"
                        />
                        <StatCard
                            icon="bi-calendar-check-fill"
                            iconColor="#3cb371"
                            iconBg="#e5f6ec"
                            value={stats.offensesToday}
                            label="Offenses Today"
                        />
                    </div>

                    <div className="mb-4">
                        <h5 className="mb-3">Most Frequent Offenses</h5>
                        <div className="dashboard-section">
                            {frequentOffensesWithPercent.length === 0 && (
                                <p className="text-muted mb-0">No offenses recorded.</p>
                            )}
                            {frequentOffensesWithPercent.map((item) => (
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
                                    {recentOffenses.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="recent-offenses-empty">
                                                No offenses recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                    {recentOffenses.map((record) => (
                                        <tr key={record.recordId}>
                                            <td>{record.dateOfViolation}</td>
                                            <td>{record.offense.offense}</td>
                                            <td>{record.offense.type}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <BottomNavigationBar />
        </div>
    );
}

export default DashboardPage;
