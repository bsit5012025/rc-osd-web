import { useEffect, useMemo, useState } from "react";

import StatCard from "../../../components/cards/StatCard";
import RequestCard from "../../../components/cards/RequestCard";
import FileDeptHeadRequestModal from "../../../components/modals/FileDeptHeadRequestModal";

import { getMyDepartmentRequests } from "../../../services/requestApi";
import type { RequestItem } from "../../../types/request";

import "./deptHeadRequestPage.css";

type RequestStatus = "Pending" | "Approved" | "Denied";
type FilterType = "All" | RequestStatus;

const PAGE_SIZE = 6;

const normalizeStatus = (status?: string): RequestStatus => {
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

    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("All");
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFileModal, setShowFileModal] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyDepartmentRequests();

            if (!Array.isArray(data)) {
                console.error("getAllRequests returned non-array:", data);
                setRequests([]);
                setError("Received unexpected data format from server.");
                return;
            }

            setRequests(data);
        } catch (err) {
            console.error("Failed to fetch requests:", err);
            setError("Failed to load requests.");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filters: { key: FilterType; icon: string }[] = [
        { key: "All", icon: "bi-grid-fill" },
        { key: "Pending", icon: "bi-hourglass-split" },
        { key: "Approved", icon: "bi-check-circle-fill" },
        { key: "Denied", icon: "bi-x-circle-fill" },
    ];

    const filteredRequests = useMemo(() => {
        let result = requests.filter((request) =>
            activeFilter === "All" ? true : normalizeStatus(request.status) === activeFilter
        );

        if (search.trim()) {
            const q = search.trim().toLowerCase();

            result = result.filter((request) => {
                const formattedId = `REQ${String(request.requestId).padStart(4, "0")}`;
                const status = normalizeStatus(request.status);

                const searchableFields = [
                    formattedId,
                    String(request.requestId ?? ""),
                    request.type,
                    request.details,
                    request.message,
                    status,
                    request.status,
                    request.dateFiled,
                    request.dateProcessed,
                    request.remarks,
                    request.aiResponse,
                ];

                return searchableFields.some((field) =>
                    (field ?? "").toString().toLowerCase().includes(q)
                );
            });
        }

        result = [...result].sort((a, b) => {
            const dateA = a.dateFiled ? new Date(a.dateFiled).getTime() : 0;
            const dateB = b.dateFiled ? new Date(b.dateFiled).getTime() : 0;

            if (dateB !== dateA) {
                return dateB - dateA;
            }

            // Same date (dateFiled has no time component on the backend) —
            // fall back to requestId, which is a DB auto-increment value,
            // so a higher ID always means it was filed more recently.
            return Number(b.requestId) - Number(a.requestId);
        });

        return result;
    }, [requests, activeFilter, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
    const pagedRequests = filteredRequests.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const stats = [
        { label: "Total Filed", value: requests.length, valueColor: "#1a1a2e" },
        {
            label: "Pending",
            value: requests.filter((r) => normalizeStatus(r.status) === "Pending").length,
            valueColor: "#E1AD01",
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

    const handleRequestFiled = () => {
        setShowFileModal(false);
        fetchRequests();
    };

    return (
        <div className="request-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <main className="request-content">

                    <h2 className="request-page-title mt-2">My Requests</h2>
                    <p className="request-page-subtitle mb-4">
                        Track and file department requests
                    </p>

                    {error && (
                        <p className="text-danger mb-3">{error}</p>
                    )}

                    <div className="request-stats-row mb-4">
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
                        className="request-cta mb-4"
                        onClick={() => setShowFileModal(true)}
                    >
                        <div className="request-cta-left">
                            <div className="request-cta-icon">
                                <i className="bi bi-plus-lg"></i>
                            </div>
                            <div>
                                <div className="request-cta-title">File a New Request</div>
                                <div className="request-cta-subtitle">
                                    Request student records for review by the Prefect
                                </div>
                            </div>
                        </div>
                        <i className="bi bi-chevron-right"></i>
                    </button>

                    <div className="request-panel">

                        <div className="request-toolbar">

                            <div className="request-status-tabs">
                                {filters.map((filter) => (
                                    <button
                                        type="button"
                                        key={filter.key}
                                        className={
                                            activeFilter === filter.key
                                                ? `request-status-tab active status-${filter.key.toLowerCase()}`
                                                : "request-status-tab"
                                        }
                                        onClick={() => setActiveFilter(filter.key)}
                                    >
                                        <i className={`bi ${filter.icon}`}></i>
                                        <span>{filter.key}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="request-toolbar-row">

                                <div className="request-search">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search requests..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                {!loading && (
                                    <span className="request-toolbar-count">
                                        {filteredRequests.length} {filteredRequests.length === 1 ? "request" : "requests"}
                                    </span>
                                )}

                            </div>

                        </div>

                        <div className="request-list">

                            {loading && (
                                <div className="request-empty">
                                    <i className="bi bi-arrow-repeat request-spinner"></i>
                                    <strong>Loading requests…</strong>
                                </div>
                            )}

                            {!loading && filteredRequests.length === 0 && (
                                <div className="request-empty">
                                    <i className="bi bi-inbox"></i>
                                    <strong>No requests to show</strong>
                                    <span>Try a different filter or search term.</span>
                                </div>
                            )}

                            {!loading && pagedRequests.map((request) => (
                                <RequestCard
                                    key={request.requestId}
                                    requestId={`REQ${String(request.requestId).padStart(4, "0")}`}
                                    type={request.type}
                                    details={request.details}
                                    message={request.message}
                                    status={normalizeStatus(request.status)}
                                    dateFiled={request.dateFiled ?? "—"}
                                    dateProcessed={request.dateProcessed}
                                    aiResponse={request.aiResponse}
                                    remarks={request.remarks}
                                />
                            ))}

                        </div>

                        {!loading && filteredRequests.length > 0 && (
                            <div className="request-pagination">

                                <button
                                    type="button"
                                    className="request-pagination-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                >
                                    <i className="bi bi-chevron-left"></i>
                                    <span>Previous</span>
                                </button>

                                <span className="request-pagination-info">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    className="request-pagination-btn"
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

            <FileDeptHeadRequestModal
                show={showFileModal}
                onClose={() => setShowFileModal(false)}
                onFiled={handleRequestFiled}
            />

        </div>
    );
}

export default DeptHeadRequestPage;