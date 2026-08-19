import { useEffect, useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import StatCard from "../../../components/cards/StatCard";
import ActionListItem from "../../../components/cards/ActionList";

import { getStudent } from "../../../services/studentApi";
import type { Student } from "../../../services/studentApi";
import { getLatestEnrollment } from "../../../services/enrollmentApi";
import type { StudentEnrollment } from "../../../types/enrollment";
import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";
import { getStudentAppeals } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

import "./profilePage.css";

function ProfilePage() {

    const studentId = localStorage.getItem("username") || "";

    const [student, setStudent] = useState<Student | null>(null);
    const [enrollment, setEnrollment] = useState<StudentEnrollment | null>(null);
    const [records, setRecords] = useState<StudentRecord[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError("");

                if (!studentId) {
                    setError("No logged-in student.");
                    return;
                }

                const [studentData, recordData, appealData] = await Promise.all([
                    getStudent(studentId),
                    getStudentRecords(studentId),
                    getStudentAppeals(studentId),
                ]);

                setStudent(studentData);
                setRecords(recordData);
                setAppeals(appealData);

                try {
                    const enrollmentData = await getLatestEnrollment(studentId);
                    setEnrollment(enrollmentData);
                } catch (enrollmentErr) {
                    console.error("Failed to fetch enrollment:", enrollmentErr);
                }
            } catch (err) {
                console.error("Failed to fetch profile data:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [studentId]);

    const fullName = student
        ? [student.person.firstName, student.person.middleName, student.person.lastName]
              .filter(Boolean)
              .join(" ")
        : "";

    const initials = student
        ? `${student.person.firstName?.[0] ?? ""}${student.person.lastName?.[0] ?? ""}`.toUpperCase()
        : "";

    const course = enrollment
        ? [enrollment.studentLevel, enrollment.section].filter(Boolean).join(" - ")
        : "";

    const primaryGuardian = student?.guardians?.[0];
    const guardianContact = primaryGuardian
        ? `${primaryGuardian.contactNumber || "—"}${
              primaryGuardian.relationship ? ` (${primaryGuardian.relationship})` : ""
          }`
        : "No guardian on file";

    const stats = [
        { label: "Violations", value: loading ? "—" : records.length, valueColor: "#d9534f" },
        {
            label: "Pending Appeals",
            value: loading ? "—" : appeals.filter((a) => a.status?.toUpperCase() === "PENDING").length,
            valueColor: "#e6a23c",
        },
        { label: "Year/Level", value: enrollment?.studentLevel || "—", valueColor: "#1a1a2e" },
    ];

    const personalInfo = [
        { icon: "bi-person", label: "Name", value: fullName || "—" },
        { icon: "bi-calendar3", label: "Date of Birth", value: student?.person.dateOfBirth || "—" },
        { icon: "bi-telephone", label: "Contact Number", value: student?.contactNumber || "—" },
        { icon: "bi-people", label: "Guardian's Contact", value: guardianContact },
        { icon: "bi-geo-alt", label: "Section", value: enrollment?.section || "—" },
    ];

    return (
        <div className="profile-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <div className="profile-header">

                        <div className="profile-avatar">{initials}</div>

                        <div className="text-white">
                            <h4 className="fw-bold">{fullName || "Student"}</h4>
                            <div className="profile-header-details">
                                Student ID: <strong>{studentId}</strong>
                                {course && (
                                    <>
                                        <span className="mx-2">•</span>
                                        {course}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </TopBar>

                <main className="profile-content">

                    {error && (
                        <p className="text-danger mt-3">{error}</p>
                    )}

                    <div className="profile-stats-row mt-4 mt-md-5 mb-4 mb-md-5">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                value={stat.value}
                                valueColor={stat.valueColor}
                                label={stat.label}
                            />
                        ))}
                    </div>

                    <div className="profile-lower-sections">

                        <div className="profile-section mb-4">
                            <h5 className="mb-3">Personal Information</h5>

                            <div className="info-card">
                                {personalInfo.map((item) => (
                                    <div className="info-row" key={item.label}>
                                        <i className={`bi ${item.icon} info-row-icon`}></i>
                                        <span className="info-row-label">{item.label}</span>
                                        <span className="info-row-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>

                            <div className="profile-section mb-4">
                                <h5 className="mb-3">Account</h5>
                                <div className="action-list">
                                    <ActionListItem icon="bi-lock" label="Change Password" />
                                </div>
                            </div>

                            <div className="profile-section mb-4">
                                <h5 className="mb-3">Support</h5>
                                <div className="action-list">
                                    <ActionListItem icon="bi-file-earmark-text" label="Student Handbook" />
                                </div>
                            </div>

                        </div>

                    </div>

                </main>

            </div>

            <BottomNavigationBar />

        </div>
    );
}

export default ProfilePage;
