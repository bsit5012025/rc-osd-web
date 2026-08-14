import { useEffect, useState } from "react";

import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import OffenseCard from "../../../components/cards/OffenseCard";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";

function OffensesPage() {

    const studentId = localStorage.getItem("username") || "";

    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [selectedStatus, setSelectedStatus] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchStudentRecords = async () => {

            try {

                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                console.log("Fetching records for:", studentId);

                const data = await getStudentRecords(studentId);

                console.log("Student records:", data);

                setRecords(data);

            } catch (error) {

                console.error(
                    "Failed to fetch student records:",
                    error
                );

                setError("Failed to load offenses.");

            } finally {

                setLoading(false);

            }
        };

        fetchStudentRecords();

    }, [studentId]);

    const filteredRecords =
        selectedStatus === "All"
            ? records
            : records.filter(
                (record) =>
                    record.status.toUpperCase() ===
                    selectedStatus.toUpperCase()
            );

    const student = records[0]?.enrollment.student;


    return (
        <div className="offenses-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>

                    <div className="student-profile d-flex align-items-center">

                        <div
                            className="student-avatar rounded d-flex align-items-center justify-content-center"
                            style={{
                                background: "#6d6adf",
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                            }}
                        >
                            {student?.fullName
                                ?.split(" ")
                                .map((name) => name[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase() || "ST"}
                        </div>


                        <div className="ms-3 text-white student-info">

                            <h4 className="mb-1 fw-bold">
                                {student?.fullName || "Student"}
                            </h4>


                            <div className="student-details">

                                Student ID:

                                <strong className="ms-2">
                                    {student?.studentId || studentId}
                                </strong>

                                {records[0]?.enrollment && (
                                    <>
                                        <span className="mx-2">
                                            •
                                        </span>

                                        {records[0].enrollment.department}
                                    </>
                                )}

                            </div>

                        </div>

                    </div>

                </TopBar>


                <main className="offenses-content">

                    <h2 className="mt-4 mt-md-5 mb-4 fw-bold">
                        My Offenses
                    </h2>


                    {}

                    <div className="offense-filters d-flex gap-2 gap-md-3 mb-4 mb-md-5">

                        <button
                            className={
                                selectedStatus === "All"
                                    ? "btn btn-primary fw-bold"
                                    : "btn border border-black fw-bold"
                            }
                            onClick={() => setSelectedStatus("All")}
                        >
                            All
                        </button>


                        <button
                            className={
                                selectedStatus === "PENDING"
                                    ? "btn btn-primary fw-bold"
                                    : "btn border border-black fw-bold"
                            }
                            onClick={() => setSelectedStatus("PENDING")}
                        >
                            Pending
                        </button>


                        <button
                            className={
                                selectedStatus === "APPROVED"
                                    ? "btn btn-primary fw-bold"
                                    : "btn border border-black fw-bold"
                            }
                            onClick={() => setSelectedStatus("APPROVED")}
                        >
                            Approved
                        </button>


                        <button
                            className={
                                selectedStatus === "DENIED"
                                    ? "btn btn-primary fw-bold"
                                    : "btn border border-black fw-bold"
                            }
                            onClick={() => setSelectedStatus("DENIED")}
                        >
                            Denied
                        </button>

                    </div>


                    {}

                    <div className="offense-list">

                        {loading && (
                            <p>
                                Loading offenses...
                            </p>
                        )}


                        {!loading && error && (
                            <p className="text-danger">
                                {error}
                            </p>
                        )}


                        {!loading &&
                            !error &&
                            filteredRecords.length === 0 && (
                                <p>
                                    No offenses found.
                                </p>
                            )
                        }


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

                            ))
                        }

                    </div>

                </main>

            </div>

            <BottomNavigationBar />

        </div>
    );
}

export default OffensesPage;