import { useCallback, useEffect, useMemo, useState } from "react";

import { usePolling } from "../../../hooks/usePolling";
import { formatDateTime } from "../../../utils/dateTime";

import StatCard from "../../../components/cards/StatCard";
import FileDeptHeadRequestModal from "../../../components/modals/FileDeptHeadRequestModal";
import RequestCard from "../../../components/cards/RequestCard";
import { getMyDepartmentRequests, getMyDepartmentName } from "../../../services/requestApi";
import { getActiveStudentsByDepartment } from "../../../services/studentApi";
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

    // Maps studentId (e.g. "JHS-0019") -> full name (e.g. "Juan Dela Cruz")
    const [studentNames, setStudentNames] = useState<Record<string, string>>({});

    const fetchRequests = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            if (!silent) setError("");

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
            if (!silent) {
                setError("Failed to load requests.");
                setRequests([]);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    usePolling(() => fetchRequests(true), 15000);

    useEffect(() => {
        fetchRequests();
    }, []);

    // Load student names once so request cards can show them instead of "By Student"
    useEffect(() => {
        let cancelled = false;

        const loadStudentNames = async () => {
            try {
                const department = await getMyDepartmentName();
                const list = await getActiveStudentsByDepartment(department);
                if (cancelled) return;

                const map: Record<string, string> = {};
                list.forEach((student) => {
                    const { firstName, middleName, lastName } = student.person;
                    map[student.studentId] = [firstName, middleName, lastName]
                        .filter(Boolean)
                        .join(" ");
                });
                setStudentNames(map);
            } catch (err) {
                console.error("Failed to load student names:", err);
            }
        };

        loadStudentNames();

        return () => {
            cancelled = true;
        };
    }, []);

    // For "By Student" requests, show the student name(s) instead of the generic type.
    // Falls back to the original type if no names could be resolved.
    const getRequestTitle = useCallback(
        (request: RequestItem) => {
            if (request.type !== "By Student") return request.type;

            const ids = (request.details ?? "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);

            if (!ids.some((id) => studentNames[id])) return request.type;

            return ids.map((id) => studentNames[id] ?? id).join(", ");
        },
        [studentNames]
    );

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
                    getRequestTitle(request), // lets you search by student name
                    request.details,
                    request.message,
                    status,
                    request.status,
                    request.dateFiled,
                    request.dateProcessed,
                    request.remarks,
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
    }, [requests, activeFilter, search, getRequestTitle]);

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
                                    type={getRequestTitle(request)}
                                    details={request.details}
                                    message={request.message}
                                    status={normalizeStatus(request.status)}
                                    dateFiled={formatDateTime(request.dateFiled)}
                                    dateProcessed={request.dateProcessed}
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