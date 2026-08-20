import { useEffect, useState } from "react";

import TopBar from "../../../components/navigation/TopBar";
import OffenseCard from "../../../components/cards/OffenseCard";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";

import { getStudent } from "../../../services/studentApi";
import type { Student } from "../../../services/studentApi";

import "./OffensePage.css";

function OffensesPage() {

    const studentId = localStorage.getItem("username") || "";

    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [student, setStudent] = useState<Student | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchStudentData = async () => {

            try {

                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                const studentData = await getStudent(studentId);
                const recordData = await getStudentRecords(studentId);

                setStudent(studentData);
                setRecords(recordData);
                
                console.log("Student records:", recordData);
                console.log("Fetching student:", studentId);
                console.log("Student:", studentData);
                console.log("Fetching records for:", studentId);                

            } catch (error) {

                console.error("Failed to fetch student data:",error);
                setError("Failed to load student data.");

            } finally {

                setLoading(false);

            }
        };

        fetchStudentData();

    }, [studentId]);


    const filteredRecords = selectedStatus === "All"? records:records.filter(
                (record) => record.status.toUpperCase() === selectedStatus.toUpperCase());

    return (
        <div className="offenses-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>

                    <div className="student-profile d-flex align-items-center">

                        <div className="student-avatar rounded d-flex align-items-center justify-content-center">

                            {student? `${student.person.firstName[0]}${student.person.lastName[0]}`.toUpperCase(): "ST"}

                        </div>

                        <div className="ms-3 text-white student-info">

                            <h4 className="mb-1 fw-bold">

                                {student? `${student.person.firstName} ${student.person.middleName} ${student.person.lastName}`: "Student"}

                            </h4>


                            <div className="student-details">

                                Student ID:

                                <strong className="ms-2">
                                    {student?.studentId || studentId}
                                </strong>


                                {student?.department && (
                                    <>
                                        <span className="mx-2">
                                            •
                                        </span>

                                        {student.department}
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

                    <div className="offense-filters d-flex gap-2 gap-md-3 mb-4 mb-md-5">

                        <button className={selectedStatus === "All"? "btn btn-primary fw-bold":"btn border border-black fw-bold"} onClick={() => setSelectedStatus("All")}>
                            All
                        </button>

                        <button className={selectedStatus === "PENDING"? "btn btn-primary fw-bold":"btn border border-black fw-bold"} onClick={() => setSelectedStatus("PENDING")}>
                            Pending
                        </button>

                        <button className={ selectedStatus === "APPROVED"  ? "btn btn-primary fw-bold":"btn border border-black fw-bold" } onClick={() => setSelectedStatus("APPROVED")}>
                            Approved
                        </button>

                        <button className={ selectedStatus === "DENIED" ? "btn btn-primary fw-bold":"btn border border-black fw-bold" } onClick={() => setSelectedStatus("DENIED")}>
                            Denied
                        </button>

                    </div>

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

                        {!loading && !error && filteredRecords.length === 0 && (
                             <p>
                                No offenses found.
                            </p>
                        )
                        }

                        {!loading && !error && filteredRecords.map((record) => (
                            <OffenseCard
                                key={record.recordId}
                                offense={record.offense.offense}
                                level={record.offense.type}
                                dateFiled={record.dateOfViolation}
                                status={record.status}/>
                            ))
                        }

                    </div>

                </main>

            </div>

        </div>
    );
}

export default OffensesPage;