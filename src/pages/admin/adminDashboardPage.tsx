import { useEffect, useState } from "react";
import TopBar from "../../components/navigation/TopBar";
import UserGreeting from "../../components/navigation/UserGreeting";
import StatCard from "../../components/cards/StatCard";

import { getOffenses } from "../../services/offenseApi";
import { getAllStudents } from "../../services/studentApi";

import "./adminDashboardPage.css";

function AdminDashboardPage() {

    const username = localStorage.getItem("username") || "";

    const [totalStudents, setTotalStudents] = useState(0);
    const [totalOffenses, setTotalOffenses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [students, offenses] = await Promise.all([
                    getAllStudents(),
                    getOffenses(),
                ]);

                setTotalStudents(students.length);
                setTotalOffenses(offenses.length);
            } catch (err) {
                console.error("Failed to fetch admin dashboard data:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        {
            icon: "bi-people-fill",
            iconColor: "#6d6adf",
            iconBg: "#ecebfc",
            value: totalStudents,
            label: "Total Students",
        },
        {
            icon: "bi-exclamation-triangle-fill",
            iconColor: "#e6a23c",
            iconBg: "#fdf1e2",
            value: totalOffenses,
            label: "Offense Categories",
        },
    ];

    return (
        <div className="admin-dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <UserGreeting
                        name="Administrator"
                        infoItems={[
                            { label: "Username", value: username },
                        ]}
                    />
                </TopBar>

                <main className="admin-dashboard-content">

                    {error && (
                        <p className="text-danger mt-3">{error}</p>
                    )}

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

                    <div className="mb-4">
                        <div className="dashboard-section">
                            <h5 className="mb-2">System Overview</h5>
                            <p className="mb-0">
                                Use the sidebar to manage student records and offense categories.
                            </p>
                        </div>
                    </div>

                </main>

            </div>

        </div>
    );
}

export default AdminDashboardPage;
