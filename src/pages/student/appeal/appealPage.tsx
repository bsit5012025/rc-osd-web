import { useState } from "react";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import StatCard from "../../../components/cards/StatCard";
import AppealCard from "../../../components/cards/AppealCard";
import "./appealPage.css";

type AppealStatus = "Pending" | "Approved" | "Denied";
type FilterType = "All" | AppealStatus;

interface Appeal {
    id: string;
    appealId: string;
    title: string;
    status: AppealStatus;
    dateSubmitted: string;
    prefectName?: string;
    prefectInitials?: string;
    remarks?: string;
}

function AppealPage() {

    const [appeals] = useState<Appeal[]>([
        {
            id: "1",
            appealId: "AP0001",
            title: "Public Display of Affection",
            status: "Pending",
            dateSubmitted: "July 01, 2026",
        },
        {
            id: "2",
            appealId: "AP0002",
            title: "Tardy",
            status: "Approved",
            dateSubmitted: "July 07, 2026",
            prefectName: "Mr. Cadorna",
            prefectInitials: "JC",
            remarks: "Reviewed and approved based on submitted evidence.",
        },
        {
            id: "3",
            appealId: "AP0003",
            title: "Cheating",
            status: "Denied",
            dateSubmitted: "July 07, 2026",
            prefectName: "Mr. Cadorna",
            prefectInitials: "JC",
            remarks: "Insufficient grounds for appeal.",
        },
        {
            id: "4",
            appealId: "AP0004",
            title: "Improper Uniform",
            status: "Pending",
            dateSubmitted: "July 10, 2026",
        },
        {
            id: "5",
            appealId: "AP0005",
            title: "Unauthorized Absence",
            status: "Approved",
            dateSubmitted: "June 30, 2026",
            prefectName: "Ms. Santos",
            prefectInitials: "MS",
            remarks: "Medical certificate verified.",
        },
    ]);

    const [activeFilter, setActiveFilter] = useState<FilterType>("All");

    const filters: FilterType[] = ["All", "Pending", "Approved", "Denied"];

    const filteredAppeals = appeals.filter((appeal) =>
        activeFilter === "All" ? true : appeal.status === activeFilter
    );

    const stats = [
        { label: "Total Filed", value: appeals.length, valueColor: "#1a1a2e" },
        {
            label: "Pending",
            value: appeals.filter((a) => a.status === "Pending").length,
            valueColor: "#e6a23c",
        },
        {
            label: "Approved",
            value: appeals.filter((a) => a.status === "Approved").length,
            valueColor: "#3cb371",
        },
        {
            label: "Denied",
            value: appeals.filter((a) => a.status === "Denied").length,
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

                    {/* Stat cards */}
                    <div className="appeal-stats-row mb-4">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                value={stat.value}
                                valueColor={stat.valueColor}
                                label={stat.label}
                            />
                        ))}
                    </div>

                
                    <a href="#" className="appeal-cta mb-4">
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
                    </a>

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

                        {filteredAppeals.length === 0 && (
                            <div className="appeal-empty">No appeals to show.</div>
                        )}

                        {filteredAppeals.map((appeal) => (
                            <AppealCard
                                key={appeal.id}
                                appealId={appeal.appealId}
                                title={appeal.title}
                                status={appeal.status}
                                dateSubmitted={appeal.dateSubmitted}
                                prefectName={appeal.prefectName}
                                prefectInitials={appeal.prefectInitials}
                                remarks={appeal.remarks}
                            />
                        ))}

                    </div>

                </main>

            </div>

            <BottomNavigationBar />

        </div>
    );
}

export default AppealPage;