import { useEffect, useState } from "react";

import TopBar from "../../../components/navigation/TopBar";
import BottomNavigationBar from "../../../components/navigation/BottomNavigationBar";
import StatCard from "../../../components/cards/StatCard";
import ActionListItem from "../../../components/cards/ActionList";

import {
    getStudent,
} from "../../../services/studentApi";

import type {
    Student,
} from "../../../services/studentApi";


import {
    getGuardiansByStudent,
} from "../../../services/guardianApi";

import type {
    Guardian,
} from "../../../services/guardianApi";


import {
    getLatestEnrollment,
} from "../../../services/enrollmentApi";

import type {
    Enrollment,
} from "../../../services/enrollmentApi";


import {
    getStudentRecords,
} from "../../../services/recordApi";

import type {
    StudentRecord,
} from "../../../services/recordApi";


import {
    getStudentAppeals,
} from "../../../services/appealApi";

import type {
    Appeal,
} from "../../../services/appealApi";


import "./profilePage.css";


function ProfilePage() {

    const [student, setStudent] =
        useState<Student | null>(null);

    const [guardians, setGuardians] =
        useState<Guardian[]>([]);

    const [enrollment, setEnrollment] =
        useState<Enrollment | null>(null);

    const [records, setRecords] =
        useState<StudentRecord[]>([]);

    const [appeals, setAppeals] =
        useState<Appeal[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const studentId = localStorage.getItem("username");


                if (!studentId) {

                    setError(
                        "Student ID was not found. Please log in again."
                    );

                    return;
                }


                /*
                 * Fetch all profile information
                 * from the backend.
                 */
                const [
                    studentData,
                    guardianData,
                    enrollmentData,
                    recordData,
                    appealData,
                ] = await Promise.all([

                    getStudent(studentId),

                    getGuardiansByStudent(studentId),

                    getLatestEnrollment(studentId),

                    getStudentRecords(studentId),

                    getStudentAppeals(studentId),

                ]);


                setStudent(studentData);

                setGuardians(guardianData);

                setEnrollment(enrollmentData);

                setRecords(recordData);

                setAppeals(appealData);


            } catch (err) {

                console.error(
                    "Failed to load student profile:",
                    err
                );

                setError(
                    "Failed to load student profile."
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProfile();

    }, []);


    /*
     * Loading state
     */
    if (loading) {

        return (
            <div className="profile-page">

                <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                    <div className="text-center py-5">

                        <p>
                            Loading profile...
                        </p>

                    </div>

                </div>

                <BottomNavigationBar />

            </div>
        );
    }


    /*
     * Error state
     */
    if (error) {

        return (
            <div className="profile-page">

                <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                    <div className="text-center py-5">

                        <p className="text-danger">
                            {error}
                        </p>

                    </div>

                </div>

                <BottomNavigationBar />

            </div>
        );
    }


    /*
     * No student
     */
    if (!student) {

        return (
            <div className="profile-page">

                <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                    <div className="text-center py-5">

                        <p>
                            Student information not found.
                        </p>

                    </div>

                </div>

                <BottomNavigationBar />

            </div>
        );
    }


    /*
     * Full name
     */
    const fullName = [

        student.person.firstName,

        student.person.middleName,

        student.person.lastName,

    ]
        .filter(Boolean)
        .join(" ");


    /*
     * Initials
     */
    const initials = [

        student.person.firstName?.charAt(0),

        student.person.lastName?.charAt(0),

    ]
        .filter(Boolean)
        .join("")
        .toUpperCase();


    /*
     * Count pending appeals from
     * backend data.
     *
     * We don't hardcode the status.
     */
    const pendingAppeals = appeals.filter(
        (appeal) =>
            appeal.status?.toUpperCase() === "PENDING"
    ).length;


    /*
     * Number of violations.
     */
    const violations = records.length;


    /*
     * First guardian.
     *
     * Your backend returns a List<Guardian>.
     */
    const primaryGuardian =
        guardians.length > 0
            ? guardians[0]
            : null;


    /*
     * Guardian name.
     */
    const guardianName = primaryGuardian
        ? [
            primaryGuardian.person.firstName,
            primaryGuardian.person.middleName,
            primaryGuardian.person.lastName,
        ]
            .filter(Boolean)
            .join(" ")
        : "No guardian information";


    /*
     * Guardian contact.
     */
    const guardianContact =
        primaryGuardian?.contactNumber ||
        "No guardian information";


    /*
     * Guardian relationship.
     */
    const guardianRelationship =
        primaryGuardian?.relationship ||
        "No guardian information";


    return (

        <div className="profile-page">


            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">


                {/* =========================
                    HEADER
                ========================= */}

                <TopBar>

                    <div className="profile-header">


                        <div className="profile-avatar">

                            {initials}

                        </div>


                        <div className="text-white">

                            <h4 className="fw-bold">

                                {fullName}

                            </h4>


                            <div className="profile-header-details">

                                Student ID:

                                <strong className="ms-1">

                                    {student.studentId}

                                </strong>


                                <span className="mx-2">

                                    •

                                </span>


                                {student.department}

                            </div>

                        </div>

                    </div>

                </TopBar>



                {/* =========================
                    MAIN
                ========================= */}

                <main className="profile-content">


                    {/* =========================
                        STATISTICS
                    ========================= */}

                    <div className="profile-stats-row mt-4 mt-md-5 mb-4 mb-md-5">


                        <StatCard
                            value={violations}
                            valueColor="#d9534f"
                            label="Violations"
                        />


                        <StatCard
                            value={pendingAppeals}
                            valueColor="#e6a23c"
                            label="Pending Appeals"
                        />


                        <StatCard
                            value={
                                enrollment?.studentLevel || ""
                            }
                            valueColor="#1a1a2e"
                            label="Year/Level"
                        />


                    </div>



                    {/* =========================
                        LOWER SECTIONS
                    ========================= */}

                    <div className="profile-lower-sections">


                        {/* =========================
                            PERSONAL INFORMATION
                        ========================= */}

                        <div className="profile-section mb-4">

                            <h5 className="mb-3">

                                Personal Information

                            </h5>


                            <div className="info-card">


                                {/* Name */}

                                <div className="info-row">

                                    <i className="bi bi-person info-row-icon"></i>

                                    <span className="info-row-label">

                                        Name

                                    </span>

                                    <span className="info-row-value">

                                        {fullName}

                                    </span>

                                </div>



                                {/* Address */}

                                <div className="info-row">

                                    <i className="bi bi-geo-alt info-row-icon"></i>

                                    <span className="info-row-label">

                                        Address

                                    </span>

                                    <span className="info-row-value">

                                        {student.address}

                                    </span>

                                </div>



                                {/* Department */}

                                <div className="info-row">

                                    <i className="bi bi-building info-row-icon"></i>

                                    <span className="info-row-label">

                                        Department

                                    </span>

                                    <span className="info-row-value">

                                        {student.department}

                                    </span>

                                </div>



                                {/* Student Type */}

                                <div className="info-row">

                                    <i className="bi bi-mortarboard info-row-icon"></i>

                                    <span className="info-row-label">

                                        Student Type

                                    </span>

                                    <span className="info-row-value">

                                        {student.studentType}

                                    </span>

                                </div>



                                {/* Year Level */}

                                <div className="info-row">

                                    <i className="bi bi-bar-chart-steps info-row-icon"></i>

                                    <span className="info-row-label">

                                        Year/Level

                                    </span>

                                    <span className="info-row-value">

                                        {enrollment?.studentLevel}

                                    </span>

                                </div>



                                {/* Section */}

                                <div className="info-row">

                                    <i className="bi bi-diagram-3 info-row-icon"></i>

                                    <span className="info-row-label">

                                        Section

                                    </span>

                                    <span className="info-row-value">

                                        {enrollment?.section}

                                    </span>

                                </div>



                                {/* School Year */}

                                <div className="info-row">

                                    <i className="bi bi-calendar3 info-row-icon"></i>

                                    <span className="info-row-label">

                                        School Year

                                    </span>

                                    <span className="info-row-value">

                                        {enrollment?.schoolYear}

                                    </span>

                                </div>



                                {/* Guardian Name */}

                                <div className="info-row">

                                    <i className="bi bi-people info-row-icon"></i>

                                    <span className="info-row-label">

                                        Guardian

                                    </span>

                                    <span className="info-row-value">

                                        {guardianName}

                                    </span>

                                </div>



                                {/* Guardian Contact */}

                                <div className="info-row">

                                    <i className="bi bi-telephone info-row-icon"></i>

                                    <span className="info-row-label">

                                        Guardian's Contact

                                    </span>

                                    <span className="info-row-value">

                                        {guardianContact}

                                    </span>

                                </div>



                                {/* Guardian Relationship */}

                                <div className="info-row">

                                    <i className="bi bi-person-hearts info-row-icon"></i>

                                    <span className="info-row-label">

                                        Relationship

                                    </span>

                                    <span className="info-row-value">

                                        {guardianRelationship}

                                    </span>

                                </div>


                            </div>

                        </div>



                        {/* =========================
                            ACCOUNT + SUPPORT
                        ========================= */}

                        <div>


                            {/* Account */}

                            <div className="profile-section mb-4">

                                <h5 className="mb-3">

                                    Account

                                </h5>


                                <div className="action-list">

                                    <ActionListItem
                                        icon="bi-lock"
                                        label="Change Password"
                                    />

                                </div>

                            </div>



                            {/* Support */}

                            <div className="profile-section mb-4">

                                <h5 className="mb-3">

                                    Support

                                </h5>


                                <div className="action-list">

                                    <ActionListItem
                                        icon="bi-file-earmark-text"
                                        label="Student Handbook"
                                    />

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