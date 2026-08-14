import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import StatCard from "../../../components/cards/StatCard";
import ActionListItem from "../../../components/cards/ActionList";
import { useStudentData } from "../../../hooks/useStudentData";
import "./profilePage.css";

function ProfilePage() {
    const { student, enrollment, guardians, stats, loading, error } = useStudentData();

    if (loading) {
        return (
            <div className="profile-page d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page d-flex align-items-center justify-content-center">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    const fullName = student
        ? `${student.person.firstName} ${student.person.middleName} ${student.person.lastName}`
        : "";
    const initials = student
        ? `${student.person.firstName[0]}${student.person.lastName[0]}`.toUpperCase()
        : "";
    const studentId = student?.studentId || "";
    const course = student?.department || "";
    const yearLevel = enrollment?.studentLevel || "";
    const section = enrollment?.section || "";
    const guardianContact = guardians.length > 0 ? guardians[0].contactNumber : "";

    const profileStats = [
        { label: "Violations", value: stats.totalViolations, valueColor: "#d9534f" },
        { label: "Pending Appeals", value: stats.pendingAppeals, valueColor: "#e6a23c" },
        { label: "Year/Level", value: yearLevel || "—", valueColor: "#1a1a2e" },
    ];

    const personalInfo = [
        { icon: "bi-person", label: "Name", value: fullName },
        { icon: "bi-calendar3", label: "Date of Birth", value: "" },
        { icon: "bi-telephone", label: "Contact Number", value: "" },
        { icon: "bi-people", label: "Guardian's Contact", value: guardianContact },
        { icon: "bi-geo-alt", label: "Section", value: section },
    ];

    return (
        <div className="profile-page">
            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
                <TopBar>
                    <div className="profile-header">
                        <div className="profile-avatar">{initials}</div>
                        <div className="text-white">
                            <h4 className="fw-bold">{fullName}</h4>
                            <div className="profile-header-details">
                                Student ID: <strong>{studentId}</strong>
                                <span className="mx-2">•</span>
                                {course}
                            </div>
                        </div>
                    </div>
                </TopBar>

                <main className="profile-content">
                    <div className="profile-stats-row mt-4 mt-md-5 mb-4 mb-md-5">
                        {profileStats.map((stat) => (
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
                                        <span className="info-row-value">{item.value || "—"}</span>
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
