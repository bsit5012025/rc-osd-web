import { useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import StatCard from "../../../components/cards/StatCard";
import ActionListItem from "../../../components/cards/ActionList";
import "./profilePage.css";

interface StudentProfile {
    fullName: string;
    studentId: string;
    course: string;
    initials: string;
}

interface ProfileStat {
    label: string;
    value: number | string;
    valueColor?: string;
}

interface PersonalInfoItem {
    icon: string;
    label: string;
    value: string;
}

function ProfilePage() {

    // replace with real data from API/context once backend is ready
    const [student] = useState<StudentProfile>({
        fullName: "",
        studentId: "",
        course: "",
        initials: "",
    });

    // replace with real data from API/context once backend is ready
    const [stats] = useState<ProfileStat[]>([
        { label: "Violations", value: "", valueColor: "#d9534f" },
        { label: "Pending Appeals", value: "", valueColor: "#e6a23c" },
        { label: "Year/Level", value: "", valueColor: "#1a1a2e" },
    ]);

    // replace with real data from API/context once backend is ready
    const [personalInfo] = useState<PersonalInfoItem[]>([
        { icon: "bi-person", label: "Name", value: "" },
        { icon: "bi-calendar3", label: "Date of Birth", value: "" },
        { icon: "bi-telephone", label: "Contact Number", value: "" },
        { icon: "bi-people", label: "Guardian's Contact", value: "" },
        { icon: "bi-geo-alt", label: "Section", value: "" },
    ]);

    return (
        <div className="profile-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <div className="profile-header">

                        <div className="profile-avatar">{student.initials}</div>

                        <div className="text-white">
                            <h4 className="fw-bold">{student.fullName}</h4>
                            <div className="profile-header-details">
                                Student ID: <strong>{student.studentId}</strong>
                                <span className="mx-2">•</span>
                                {student.course}
                            </div>
                        </div>

                    </div>
                </TopBar>

                <main className="profile-content">

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