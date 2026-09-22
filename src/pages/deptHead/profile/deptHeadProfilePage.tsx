import { useEffect, useState } from "react";
import TopBar from "../../../components/navigation/TopBar";
import ProfileHeader from "../../../components/navigation/ProfileHeader";
import InfoList from "../../../components/cards/InfoList";
import ActionListItem from "../../../components/cards/ActionList";
import ChangePasswordModal from "../../../components/modals/ChangePasswordModal";
import { getMyEmployeeInfo } from "../../../services/employeeApi";
import "./deptHeadProfilePage.css";

function DeptHeadProfilePage() {

    const [fullName, setFullName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [departmentName, setDepartmentName] = useState("");
    const [employeeRole, setEmployeeRole] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError("");

                const employeeInfo = await getMyEmployeeInfo();

                setFullName(employeeInfo.fullName ?? "");
                setEmployeeId(employeeInfo.employeeId ?? "");
                setDepartmentName(employeeInfo.department ?? "");
                setEmployeeRole(employeeInfo.employeeRole ?? "");
                setDateOfBirth(employeeInfo.dateOfBirth ?? "");
            } catch (err) {
                console.error("Failed to fetch department head profile data:", err);
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

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
        { icon: "bi-person", label: "Name", value: loading ? "Loading..." : (fullName || "—") },
        { icon: "bi-calendar3", label: "Date of Birth", value: loading ? "Loading..." : (dateOfBirth || "—") },
        { icon: "bi-building", label: "Department", value: loading ? "Loading..." : (departmentName || "—") },
        { icon: "bi-briefcase", label: "Employee Role", value: loading ? "Loading..." : (employeeRole || "—") },
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

                    {error && (
                        <p className="text-danger mt-3">{error}</p>
                    )}

                    <div className="profile-lower-sections mt-4 mt-md-5">

                        <div className="profile-section mb-4">
                            <h5 className="mb-3">Personal Information</h5>
                            <InfoList items={personalInfo} />
                        </div>

                        <div>

                            <div className="profile-section mb-4">
                                <h5 className="mb-3">Account</h5>
                                <div className="action-list">
                                    <ActionListItem
                                        icon="bi-lock"
                                        label="Change Password"
                                        onClick={() => setIsChangePasswordOpen(true)}
                                    />
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

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />

        </div>
    );
}

export default DeptHeadProfilePage;