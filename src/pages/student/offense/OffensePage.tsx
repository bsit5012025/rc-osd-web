import { useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import OffenseCard from "../../../components/cards/OffenseCard";
import { useStudentData } from "../../../hooks/useStudentData";
import "./OffensePage.css";

function OffensesPage() {
    const { student, records, loading, error } = useStudentData();
    const [selectedStatus, setSelectedStatus] = useState("All");

    const filteredRecords =
        selectedStatus === "All"
            ? records
            : records.filter(
                (record) => record.status.toUpperCase() === selectedStatus.toUpperCase()
            );

    const statusFilters = ["All", "PENDING", "RESOLVED", "APPEALED"];

    return (
        <div className="offenses-page">
            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
                <TopBar>
                    <div className="student-profile d-flex align-items-center">
                        <div className="student-avatar rounded d-flex align-items-center justify-content-center">
                            {student
                                ? `${student.person.firstName[0]}${student.person.lastName[0]}`.toUpperCase()
                                : "ST"}
                        </div>
                        <div className="ms-3 text-white student-info">
                            <h4 className="mb-1 fw-bold">
                                {student
                                    ? `${student.person.firstName} ${student.person.middleName} ${student.person.lastName}`
                                    : "Student"}
                            </h4>
                            <div className="student-details">
                                Student ID:
                                <strong className="ms-2">
                                    {student?.studentId || localStorage.getItem("username") || ""}
                                </strong>
                                {student?.department && (
                                    <>
                                        <span className="mx-2">•</span>
                                        {student.department}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </TopBar>

                <main className="offenses-content">
                    <h2 className="mt-4 mt-md-5 mb-4 fw-bold">My Offenses</h2>

                    <div className="offense-filters d-flex gap-2 gap-md-3 mb-4 mb-md-5">
                        {statusFilters.map((status) => (
                            <button
                                key={status}
                                className={
                                    selectedStatus === status
                                        ? "btn btn-primary fw-bold"
                                        : "btn border border-black fw-bold"
                                }
                                onClick={() => setSelectedStatus(status)}
                            >
                                {status === "All" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="offense-list">
                        {loading && <p>Loading offenses...</p>}
                        {!loading && error && <p className="text-danger">{error}</p>}
                        {!loading && !error && filteredRecords.length === 0 && <p>No offenses found.</p>}
                        {!loading &&
                            !error &&
                            filteredRecords.map((record) => (
                                <OffenseCard
                                    key={record.recordId}
                                    offense={record.offense.offense}
                                    level={record.offense.type}
                                    dateFiled={record.dateOfViolation}
                                    status={record.status}
                                />
                            ))}
                    </div>
                </main>
            </div>
            <BottomNavigationBar />
        </div>
    );
}

export default OffensesPage;
