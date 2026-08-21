import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/cards/StatCard";
import AppealCard from "../../../components/cards/AppealCard";

import type { DeptHeadRequest } from "../../../types/deptHeadRequest";

import "./deptHeadRequestPage.css";

type FilterType = "All" | "Pending" | "Approved" | "Denied";

const normalizeStatus = (status: string): "Pending" | "Approved" | "Denied" => {
    switch (status?.toUpperCase()) {
        case "APPROVED":
            return "Approved";
        case "DENIED":
            return "Denied";
        default:
            return "Pending";
    }
};

function DeptHeadRequestPage() {

    const [requests] = useState<DeptHeadRequest[]>([]);
    const [loading] = useState(false);
    const [error] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");

    const filters: FilterType[] = ["All", "Pending", "Approved", "Denied"];

    const filteredRequests = requests.filter((request) =>
        activeFilter === "All" ? true : normalizeStatus(request.status) === activeFilter
    );

    const stats = [
        { label: "Total Filed", value: requests.length, valueColor: "#1a1a2e" },
        {
            label: "Pending",
            value: requests.filter((r) => normalizeStatus(r.status) === "Pending").length,
            valueColor: "#e6a23c",
        },
        {
            label: "Approved",
            value: requests.filter((r) => normalizeStatus(r.status) === "Approved").length,
            valueColor: "#3cb371",
        },
        {
            label: "Denied",
            value: requests.filter((r) => normalizeStatus(r.status) === "Denied").length,
            valueColor: "#d9534f",
        },
    ];

    return (
        <div className="appeal-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <main className="appeal-content">

                    <h2 className="appeal-page-title mt-2">My Requests</h2>
                    <p className="appeal-page-subtitle mb-4">
                        Track and file department requests
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

                    <Link to="/depthead/requests/file" className="appeal-cta mb-4">
                        <div className="appeal-cta-left">
                            <div className="appeal-cta-icon">
                                <i className="bi bi-plus-lg"></i>
                            </div>
                            <div>
                                <div className="appeal-cta-title">File a New Request</div>
                                <div className="appeal-cta-subtitle">Submit a new department request</div>
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

                        {loading && <div className="appeal-empty">Loading requests...</div>}

                        {!loading && filteredRequests.length === 0 && (
                            <div className="appeal-empty">No requests to show.</div>
                        )}

                        {!loading && filteredRequests.map((request) => (
                            <AppealCard
                                key={request.requestId}
                                appealId={`REQ${String(request.requestId).padStart(4, "0")}`}
                                title={request.type}
                                status={normalizeStatus(request.status)}
                                dateSubmitted={request.dateFiled}
                                prefectName={request.reviewerName}
                                prefectInitials={request.reviewerInitials}
                                remarks={request.remarks}
                                idLabel="REQUEST ID"
                                reviewerRoleLabel="Reviewer"
                                awaitingTitle="Awaiting Review"
                                awaitingText="Your request hasn't been reviewed yet. You'll be notified once a decision is made."
                            />
                        ))}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default DeptHeadRequestPage;