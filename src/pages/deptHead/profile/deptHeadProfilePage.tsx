import { useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import ProfileHeader from "../../../components/navigation/ProfileHeader";
import InfoList from "../../../components/cards/InfoList";
import ActionListItem from "../../../components/cards/ActionList";
import "./deptHeadProfilePage.css";
import "./deptHeadProfilePage.css";

function DeptHeadProfilePage() {

    const [fullName] = useState("");
    const [employeeId] = useState("");
    const [departmentName] = useState("");
    const [employeeRole] = useState("");
    const [dateOfBirth] = useState("");

    const initials = fullName
        ? fullName
              .split(" ")
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
        : "";

    const personalInfo = [
        { icon: "bi-person", label: "Name", value: fullName || "—" },
        { icon: "bi-calendar3", label: "Date of Birth", value: dateOfBirth || "—" },
        { icon: "bi-building", label: "Department", value: departmentName || "—" },
        { icon: "bi-briefcase", label: "Employee Role", value: employeeRole || "—" },
    ];

    return (
        <div className="depthead-profile-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <ProfileHeader
                        initials={initials}
                        name={fullName || "Department Head"}
                        infoItems={[
                            { label: "Employee ID", value: employeeId || "—" },
                            { label: "Department", value: departmentName || "—" },
                        ]}
                    />
                </TopBar>

                <main className="depthead-profile-content">

                    <div className="profile-lower-sections mt-4 mt-md-5">

                        <div className="profile-section mb-4">
                            <h5 className="mb-3">Personal Information</h5>
                            <InfoList items={personalInfo} />
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

        </div>
    );
}

export default DeptHeadProfilePage;