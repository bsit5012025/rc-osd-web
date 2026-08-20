import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/cards/StatCard";
import AppealCard from "../../../components/cards/AppealCard";

import { getStudentAppeals } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

import "./appealPage.css";

type AppealStatus = "Pending" | "Approved" | "Denied";
type FilterType = "All" | AppealStatus;

const normalizeStatus = (status: string): AppealStatus => {
    switch (status?.toUpperCase()) {
        case "APPROVED":
            return "Approved";
        case "DENIED":
            return "Denied";
        default:
            return "Pending";
    }
};

function AppealPage() {

    const studentId = localStorage.getItem("username") || "";

    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");

    useEffect(() => {
        const fetchAppeals = async () => {
            try {
                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                const data = await getStudentAppeals(studentId);
                setAppeals(data);
            } catch (err) {
                console.error("Failed to fetch appeals:", err);
                setError("Failed to load appeals.");
            } finally {
                setLoading(false);
            }
        };

        fetchAppeals();
    }, [studentId]);

    const filters: FilterType[] = ["All", "Pending", "Approved", "Denied"];

    const filteredAppeals = appeals.filter((appeal) =>
        activeFilter === "All" ? true : normalizeStatus(appeal.status) === activeFilter
    );

    const stats = [
        { label: "Total Filed", value: appeals.length, valueColor: "#1a1a2e" },
        {
            label: "Pending",
            value: appeals.filter((a) => normalizeStatus(a.status) === "Pending").length,
            valueColor: "#e6a23c",
        },
        {
            label: "Approved",
            value: appeals.filter((a) => normalizeStatus(a.status) === "Approved").length,
            valueColor: "#3cb371",
        },
        {
            label: "Denied",
            value: appeals.filter((a) => normalizeStatus(a.status) === "Denied").length,
            valueColor: "#d9534f",
        },
    ];

    return (
        <div className="appeal-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <main className="appeal-content">

                    <h2 className="appeal-page-title mt-2">My Appeals</h2>
                    <p className="appeal-page-subtitle mb-4">
                        Track and file offense appeals
                    </p>

                    {error && (
                        <p className="text-danger mb-3">{error}</p>
                    )}

                    <div className="appeal-stats-row mb-4">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                value={loading ? "—" : stat.value}
                                valueColor={stat.valueColor}
                                label={stat.label}
                            />
                        ))}
                    </div>

                    <Link to="/appeals/file" className="appeal-cta mb-4">
                        <div className="appeal-cta-left">
                            <div className="appeal-cta-icon">
                                <i className="bi bi-plus-lg"></i>
                            </div>
                            <div>
                                <div className="appeal-cta-title">File a New Appeal</div>
                                <div className="appeal-cta-subtitle">Request a review of your case</div>
                            </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                    </Link>

                    <div className="appeal-filters mt-4 mb-4">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                className={`btn fw-bold ${
                                    activeFilter === filter
                                        ? "btn-primary"
                                        : "border border-black"
                                }`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="appeal-list">

                        {loading && <div className="appeal-empty">Loading appeals...</div>}

                        {!loading && filteredAppeals.length === 0 && (
                            <div className="appeal-empty">No appeals to show.</div>
                        )}

                        {!loading && filteredAppeals.map((appeal) => (
                            <AppealCard
                                key={appeal.appealId}
                                appealId={`AP${String(appeal.appealId).padStart(4, "0")}`}
                                title={appeal.record?.offense?.offense ?? "Offense"}
                                status={normalizeStatus(appeal.status)}
                                dateSubmitted={appeal.dateFiled}
                                remarks={appeal.remarks ?? undefined}
                            />
                        ))}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default AppealPage;