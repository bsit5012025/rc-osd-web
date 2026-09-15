import { useEffect, useMemo, useState } from "react";
import StatCard from "../../../components/cards/StatCard";
import AppealCard from "../../../components/cards/AppealCard";
import FileAppealModal from "../../../components/modals/FileAppealModal";

import { getStudentAppeals } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

import "./appealPage.css";

type AppealStatus = "Pending" | "Approved" | "Denied";
type FilterType = "All" | AppealStatus;

const PAGE_SIZE = 6;

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
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFileModal, setShowFileModal] = useState(false);

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

    useEffect(() => {
        fetchAppeals();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const filters: { key: FilterType; icon: string }[] = [
        { key: "All", icon: "bi-grid-fill" },
        { key: "Pending", icon: "bi-hourglass-split" },
        { key: "Approved", icon: "bi-check-circle-fill" },
        { key: "Denied", icon: "bi-x-circle-fill" },
    ];

    const filteredAppeals = useMemo(() => {
        let result = appeals.filter((appeal) =>
            activeFilter === "All" ? true : normalizeStatus(appeal.status) === activeFilter
        );

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            result = result.filter((appeal) =>
                (appeal.record?.offense?.offense ?? "").toLowerCase().includes(q)
            );
        }

        return result;
    }, [appeals, activeFilter, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredAppeals.length / PAGE_SIZE));
    const pagedAppeals = filteredAppeals.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const stats = [
        { label: "Total Filed", value: appeals.length, valueColor: "#1a1a2e" },
        {
            label: "Pending",
            value: appeals.filter((a) => normalizeStatus(a.status) === "Pending").length,
            valueColor: "#E1AD01",
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

    const handleAppealFiled = () => {
        setShowFileModal(false);
        fetchAppeals();
    };

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

                    <button
                        type="button"
                        className="appeal-cta mb-4"
                        onClick={() => setShowFileModal(true)}
                    >
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
                    </button>

                    <div className="appeal-panel">

                        <div className="appeal-toolbar">

                            <div className="appeal-status-tabs">
                                {filters.map((filter) => (
                                    <button
                                        type="button"
                                        key={filter.key}
                                        className={
                                            activeFilter === filter.key
                                                ? `appeal-status-tab active status-${filter.key.toLowerCase()}`
                                                : "appeal-status-tab"
                                        }
                                        onClick={() => setActiveFilter(filter.key)}
                                    >
                                        <i className={`bi ${filter.icon}`}></i>
                                        <span>{filter.key}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="appeal-toolbar-row">

                                <div className="appeal-search">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search by offense..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {!loading && (
                                    <span className="appeal-toolbar-count">
                                        {filteredAppeals.length} {filteredAppeals.length === 1 ? "appeal" : "appeals"}
                                    </span>
                                )}

                            </div>

                        </div>

                        <div className="appeal-list">

                            {loading && (
                                <div className="appeal-empty">
                                    <i className="bi bi-arrow-repeat appeal-spinner"></i>
                                    <strong>Loading appeals…</strong>
                                </div>
                            )}

                            {!loading && filteredAppeals.length === 0 && (
                                <div className="appeal-empty">
                                    <i className="bi bi-inbox"></i>
                                    <strong>No appeals to show</strong>
                                    <span>Try a different filter or search term.</span>
                                </div>
                            )}

                            {!loading && pagedAppeals.map((appeal) => (
                                <AppealCard
                                    key={appeal.appealId}
                                    appealId={`AP${String(appeal.appealId).padStart(4, "0")}`}
                                    title={appeal.record?.offense?.offense ?? "Offense"}
                                    offenseType={appeal.record?.offense?.type}
                                    status={normalizeStatus(appeal.status)}
                                    dateSubmitted={appeal.dateFiled}
                                    remarks={appeal.remarks ?? undefined}
                                />
                            ))}

                        </div>

                        {!loading && filteredAppeals.length > 0 && (
                            <div className="appeal-pagination">

                                <button
                                    type="button"
                                    className="appeal-pagination-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                    <span>Previous</span>
                                </button>

                                <span className="appeal-pagination-info">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    className="appeal-pagination-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                >
                                    <span>Next</span>
                                    <i className="bi bi-chevron-right"></i>
                                </button>

                            </div>
                        )}

                    </div>

                </main>

            </div>

            <FileAppealModal
                show={showFileModal}
                onClose={() => setShowFileModal(false)}
                onFiled={handleAppealFiled}
            />

        </div>
    );
}

export default AppealPage;