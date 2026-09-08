import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";

import {useEffect,useMemo,useState,type FormEvent,} from "react";
import {getAllStudents,createStudent,updateStudent,} from "../../../services/studentApi";
import type {Student,StudentInput,} from "../../../services/studentApi";
import {getOffenses,createOffense,updateOffense,} from "../../../services/offenseApi";
import type {OffenseInput,} from "../../../services/offenseApi";
import type {Offense} from "../../../types/offense";
import "./adminDashboardPage.css";

type ActiveTable = "students" | "offenses";

const ITEMS_PER_PAGE = 8;

const departments = [
    "JHS",
    "SHS",
    "COLLEGE",
];

const studentTypes = [
    "Intern",
    "Extern",
];

const offenseTypesList = [
    "Minor Offense",
    "Major Offense",
];

const emptyStudentForm: StudentInput = {
    studentId:"",
    address:"",
    department:"",
    studentType:"",
    contactNumber:"",
    person:{
        firstName:"",
        middleName:"",
        lastName:"",
        dateOfBirth:null,
    },
};

const emptyOffenseForm: OffenseInput = {
    offense:"",
    type:"",
    description:"",
};

function AdminDashboardPage() {

    const username = localStorage.getItem("username") || "";

    const [students,setStudents] = useState<Student[]>([]);
    const [offenses,setOffenses] = useState<Offense[]>([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");

    const [activeTable,setActiveTable] = useState<ActiveTable>("students");
    const [currentPage,setCurrentPage] = useState(1);

    const [studentSearch,setStudentSearch] = useState("");
    const [departmentFilter,setDepartmentFilter] = useState("");
    const [offenseSearch,setOffenseSearch] = useState("");
    const [offenseTypeFilter,setOffenseTypeFilter] = useState("");

    const [showStudentModal,setShowStudentModal] = useState(false);
    const [editingStudentId,setEditingStudentId] = useState<string | null>(null);
    const [studentForm,setStudentForm] = useState<StudentInput>(emptyStudentForm);
    const [studentFormError,setStudentFormError] = useState("");
    const [savingStudent,setSavingStudent] = useState(false);

    const [showOffenseModal,setShowOffenseModal] = useState(false);
    const [editingOffenseId,setEditingOffenseId] = useState<number | null>(null);
    const [offenseForm,setOffenseForm] = useState<OffenseInput>(emptyOffenseForm);
    const [offenseFormError,setOffenseFormError] = useState("");
    const [savingOffense,setSavingOffense] = useState(false);

    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError("");

            const [studentData,offenseData] = await Promise.all([
                getAllStudents(),
                getOffenses(),
            ]);

            setStudents(studentData);
            setOffenses(offenseData);

        } catch (err) {

            console.error("Failed to fetch dashboard data:",err);
            setError("Failed to load dashboard data.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchDashboardData();

    },[]);

    const filteredStudents = useMemo(() => {

        return students.filter((student) => {

            const search = studentSearch.trim().toLowerCase();

            const fullName = [
                student.person?.firstName,
                student.person?.middleName,
                student.person?.lastName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !search ||
                student.studentId?.toLowerCase().includes(search) ||
                fullName.includes(search);

            const matchesDepartment =
                !departmentFilter ||
                student.department === departmentFilter;

            return matchesSearch && matchesDepartment;

        });

    },[students,studentSearch,departmentFilter]);

    const filteredOffenses = useMemo(() => {

        return offenses.filter((offense) => {

            const search = offenseSearch.trim().toLowerCase();

            const matchesSearch =
                !search ||
                offense.offense?.toLowerCase().includes(search) ||
                offense.description?.toLowerCase().includes(search);

            const matchesType =
                !offenseTypeFilter ||
                offense.type === offenseTypeFilter;

            return matchesSearch && matchesType;

        });

    },[offenses,offenseSearch,offenseTypeFilter]);

    const totalItems =
        activeTable === "students"
            ? filteredStudents.length
            : filteredOffenses.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / ITEMS_PER_PAGE)
    );

    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const paginatedOffenses = filteredOffenses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const changeTable = (table: ActiveTable) => {

        setActiveTable(table);
        setCurrentPage(1);

    };

    const openAddStudentModal = () => {

        setEditingStudentId(null);
        setStudentForm({
            ...emptyStudentForm,
            person:{
                ...emptyStudentForm.person,
            },
        });
        setStudentFormError("");
        setShowStudentModal(true);

    };

    const openEditStudentModal = (student: Student) => {

        setEditingStudentId(student.studentId);

        setStudentForm({
            studentId:student.studentId,
            address:student.address || "",
            department:student.department || "",
            studentType:student.studentType || "",
            contactNumber:student.contactNumber || "",
            person:{
                firstName:student.person?.firstName || "",
                middleName:student.person?.middleName || "",
                lastName:student.person?.lastName || "",
                dateOfBirth:student.person?.dateOfBirth || null,
            },
        });

        setStudentFormError("");
        setShowStudentModal(true);

    };

    const closeStudentModal = () => {

        if (!savingStudent) {
            setShowStudentModal(false);
        }

    };

    const handleStudentSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setStudentFormError("");

        if (!studentForm.studentId.trim()) {
            setStudentFormError("Student ID is required.");
            return;
        }

        if (!studentForm.person.firstName.trim()) {
            setStudentFormError("First Name is required.");
            return;
        }

        if (!studentForm.person.middleName.trim()) {
            setStudentFormError("Middle Name is required.");
            return;
        }

        if (!studentForm.person.lastName.trim()) {
            setStudentFormError("Last Name is required.");
            return;
        }

        if (!studentForm.person.dateOfBirth) {
            setStudentFormError("Date of Birth is required.");
            return;
        }

        if (!studentForm.department.trim()) {
            setStudentFormError("Department is required.");
            return;
        }

        if (!studentForm.studentType.trim()) {
            setStudentFormError("Student Type is required.");
            return;
        }

        if (!studentForm.contactNumber.trim()) {
            setStudentFormError("Contact Number is required.");
            return;
        }

        if (!studentForm.address.trim()) {
            setStudentFormError("Address is required.");
            return;
        }

        if (editingStudentId === null) {

            const duplicateStudent = students.some(
                (student) =>
                    student.studentId?.trim().toLowerCase() ===
                    studentForm.studentId.trim().toLowerCase()
            );

            if (duplicateStudent) {

                setStudentFormError(
                    `Student ID "${studentForm.studentId}" already exists. Please use a different Student ID.`
                );

                return;

            }

        }

        try {

            setSavingStudent(true);

            if (editingStudentId !== null) {

                await updateStudent(
                    editingStudentId,
                    studentForm
                );

            } else {

                await createStudent(studentForm);

            }

            setShowStudentModal(false);

            await fetchDashboardData();

        } catch (err: any) {

            console.error("Failed to save student:",err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                "";

            if (
                typeof message === "string" &&
                message.toLowerCase().includes("already exists")
            ) {

                setStudentFormError(
                    `Student ID "${studentForm.studentId}" already exists. Please use a different Student ID.`
                );

            } else if (err?.response?.status === 409) {

                setStudentFormError(
                    `Student ID "${studentForm.studentId}" already exists. Please use a different Student ID.`
                );

            } else {

                setStudentFormError(
                    "Failed to save student. Please try again."
                );

            }

        } finally {

            setSavingStudent(false);

        }

    };

    const openAddOffenseModal = () => {

        setEditingOffenseId(null);
        setOffenseForm({
            offense:"",
            type:"",
            description:"",
        });
        setOffenseFormError("");
        setShowOffenseModal(true);

    };

    const openEditOffenseModal = (offense: Offense) => {

        setEditingOffenseId(offense.offenseId);

        setOffenseForm({
            offense:offense.offense || "",
            type:offense.type || "",
            description:offense.description || "",
        });

        setOffenseFormError("");
        setShowOffenseModal(true);

    };

    const closeOffenseModal = () => {

        if (!savingOffense) {
            setShowOffenseModal(false);
        }

    };

    const handleOffenseSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        setOffenseFormError("");

        if (!offenseForm.offense.trim()) {
            setOffenseFormError("Offense is required.");
            return;
        }

        if (!offenseForm.type.trim()) {
            setOffenseFormError("Please select an offense type.");
            return;
        }

        if (!offenseForm.description.trim()) {
            setOffenseFormError("Description is required.");
            return;
        }

        if (editingOffenseId === null) {

            const duplicateOffense = offenses.some(
                (offense) =>
                    offense.offense?.trim().toLowerCase() ===
                        offenseForm.offense.trim().toLowerCase() &&
                    offense.type?.trim().toLowerCase() ===
                        offenseForm.type.trim().toLowerCase()
            );

            if (duplicateOffense) {

                setOffenseFormError(
                    `The offense "${offenseForm.offense}" with type "${offenseForm.type}" already exists. Please enter a different offense.`
                );

                return;

            }

        }

        try {

            setSavingOffense(true);

            if (editingOffenseId !== null) {

                await updateOffense(
                    editingOffenseId,
                    offenseForm
                );

            } else {

                await createOffense(offenseForm);

            }

            setShowOffenseModal(false);

            await fetchDashboardData();

        } catch (err: any) {

            console.error("Failed to save offense:",err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data ||
                "";

            if (
                typeof message === "string" &&
                message.toLowerCase().includes("already exists")
            ) {

                setOffenseFormError(
                    `The offense "${offenseForm.offense}" already exists. Please enter a different offense.`
                );

            } else if (err?.response?.status === 409) {

                setOffenseFormError(
                    `The offense "${offenseForm.offense}" already exists. Please enter a different offense.`
                );

            } else {

                setOffenseFormError(
                    "Failed to save offense. Please try again."
                );

            }

        } finally {

            setSavingOffense(false);

        }

    };

    return (

        <div className="admin-dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>

                    <UserGreeting
                        name="Administrator"
                        infoItems={[
                            {
                                label:"Username",
                                value:username,
                            },
                        ]}
                    />

                </TopBar>

                <main className="admin-dashboard-content">

                    {error && (
                        <div className="alert alert-danger mt-3">
                            {error}
                        </div>
                    )}

                    <section className="dashboard-management-section">

                        <div className="dashboard-table-tabs">

                            <button
                                type="button"
                                className={
                                    activeTable === "students"
                                        ? "dashboard-tab active"
                                        : "dashboard-tab"
                                }
                                onClick={() =>
                                    changeTable("students")
                                }
                            >

                                <i className="bi bi-people-fill"></i>

                                <span>
                                    Students
                                </span>

                            </button>

                            <button
                                type="button"
                                className={
                                    activeTable === "offenses"
                                        ? "dashboard-tab active"
                                        : "dashboard-tab"
                                }
                                onClick={() =>
                                    changeTable("offenses")
                                }
                            >

                                <i className="bi bi-exclamation-triangle-fill"></i>

                                <span>
                                    Offenses
                                </span>

                            </button>

                        </div>

                        {activeTable === "students" && (

                            <>

                                <div className="dashboard-table-header">

                                    <div>

                                        <div className="table-title-row">

                                            <h3>
                                                Students
                                            </h3>

                                            <span className="total-count student-count">

                                                Total number of:

                                                <strong>
                                                    {loading
                                                        ? "—"
                                                        : students.length}
                                                </strong>

                                            </span>

                                        </div>

                                        <p>
                                            Manage student records.
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        className="add-btn"
                                        onClick={openAddStudentModal}
                                    >

                                        <i className="bi bi-plus-lg"></i>

                                        <span>
                                            Add Student
                                        </span>

                                    </button>

                                </div>

                                <div className="admin-filter-row">

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search student..."
                                        value={studentSearch}
                                        onChange={(e) => {

                                            setStudentSearch(
                                                e.target.value
                                            );

                                            setCurrentPage(1);

                                        }}
                                    />

                                    <select
                                        className="form-select"
                                        value={departmentFilter}
                                        onChange={(e) => {

                                            setDepartmentFilter(
                                                e.target.value
                                            );

                                            setCurrentPage(1);

                                        }}
                                    >

                                        <option value="">
                                            All Departments
                                        </option>

                                        {departments.map(
                                            (department) => (

                                                <option
                                                    key={department}
                                                    value={department}
                                                >
                                                    {department}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="dashboard-table-container">

                                    <table className="admin-table student-table">

                                        <colgroup>

                                            <col style={{width:"16%"}} />
                                            <col style={{width:"30%"}} />
                                            <col style={{width:"20%"}} />
                                            <col style={{width:"20%"}} />
                                            <col style={{width:"14%"}} />

                                        </colgroup>

                                        <thead>

                                            <tr>

                                                <th>
                                                    Student ID
                                                </th>

                                                <th>
                                                    Name
                                                </th>

                                                <th>
                                                    Department
                                                </th>

                                                <th>
                                                    Contact
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {loading && (

                                                <tr>

                                                    <td
                                                        colSpan={5}
                                                        className="admin-table-empty"
                                                    >
                                                        Loading students...
                                                    </td>

                                                </tr>

                                            )}

                                            {!loading &&
                                                paginatedStudents.length === 0 && (

                                                    <tr>

                                                        <td
                                                            colSpan={5}
                                                            className="admin-table-empty"
                                                        >
                                                            No students found.
                                                        </td>

                                                    </tr>

                                                )}

                                            {!loading &&
                                                paginatedStudents.map(
                                                    (student) => {

                                                        const fullName = [
                                                            student.person?.firstName,
                                                            student.person?.middleName,
                                                            student.person?.lastName,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ");

                                                        return (

                                                            <tr
                                                                key={student.studentId}
                                                            >

                                                                <td data-label="Student ID">
                                                                    {student.studentId}
                                                                </td>

                                                                <td data-label="Name">
                                                                    {fullName || "—"}
                                                                </td>

                                                                <td data-label="Department">
                                                                    {student.department || "—"}
                                                                </td>

                                                                <td data-label="Contact">
                                                                    {student.contactNumber || "—"}
                                                                </td>

                                                                <td data-label="Action">

                                                                    <button
                                                                        type="button"
                                                                        className="edit-action-btn"
                                                                        onClick={() =>
                                                                            openEditStudentModal(
                                                                                student
                                                                            )
                                                                        }
                                                                    >

                                                                        <i className="bi bi-pencil-fill"></i>

                                                                        <span>
                                                                            Edit
                                                                        </span>

                                                                    </button>

                                                                </td>

                                                            </tr>

                                                        );

                                                    }
                                                )}

                                        </tbody>

                                    </table>

                                </div>

                            </>

                        )}

                        {activeTable === "offenses" && (

                            <>

                                <div className="dashboard-table-header">

                                    <div>

                                        <div className="table-title-row">

                                            <h3>
                                                Offense Categories
                                            </h3>

                                            <span className="total-count offense-count">

                                                Total number of:

                                                <strong>
                                                    {loading
                                                        ? "—"
                                                        : offenses.length}
                                                </strong>

                                            </span>

                                        </div>

                                        <p>
                                            Manage offense categories.
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        className="add-btn"
                                        onClick={openAddOffenseModal}
                                    >

                                        <i className="bi bi-plus-lg"></i>

                                        <span>
                                            Add Offense
                                        </span>

                                    </button>

                                </div>

                                <div className="admin-filter-row">

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search offense..."
                                        value={offenseSearch}
                                        onChange={(e) => {

                                            setOffenseSearch(
                                                e.target.value
                                            );

                                            setCurrentPage(1);

                                        }}
                                    />

                                    <select
                                        className="form-select"
                                        value={offenseTypeFilter}
                                        onChange={(e) => {

                                            setOffenseTypeFilter(
                                                e.target.value
                                            );

                                            setCurrentPage(1);

                                        }}
                                    >

                                        <option value="">
                                            All Types
                                        </option>

                                        {offenseTypesList.map(
                                            (type) => (

                                                <option
                                                    key={type}
                                                    value={type}
                                                >
                                                    {type}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="dashboard-table-container">

                                    <table className="admin-table offense-table">

                                        <colgroup>

                                            <col style={{width:"22%"}} />
                                            <col style={{width:"18%"}} />
                                            <col style={{width:"45%"}} />
                                            <col style={{width:"15%"}} />

                                        </colgroup>

                                        <thead>

                                            <tr>

                                                <th>
                                                    Offense
                                                </th>

                                                <th>
                                                    Type
                                                </th>

                                                <th>
                                                    Description
                                                </th>

                                                <th>
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {loading && (

                                                <tr>

                                                    <td
                                                        colSpan={4}
                                                        className="admin-table-empty"
                                                    >
                                                        Loading offenses...
                                                    </td>

                                                </tr>

                                            )}

                                            {!loading &&
                                                paginatedOffenses.length === 0 && (

                                                    <tr>

                                                        <td
                                                            colSpan={4}
                                                            className="admin-table-empty"
                                                        >
                                                            No offenses found.
                                                        </td>

                                                    </tr>

                                                )}

                                            {!loading &&
                                                paginatedOffenses.map(
                                                    (offense) => (

                                                        <tr
                                                            key={offense.offenseId}
                                                        >

                                                            <td data-label="Offense">
                                                                {offense.offense}
                                                            </td>

                                                            <td data-label="Type">

                                                                <span className="offense-type-badge">
                                                                    {offense.type || "—"}
                                                                </span>

                                                            </td>

                                                            <td data-label="Description">
                                                                {offense.description || "—"}
                                                            </td>

                                                            <td data-label="Action">

                                                                <button
                                                                    type="button"
                                                                    className="edit-action-btn"
                                                                    onClick={() =>
                                                                        openEditOffenseModal(
                                                                            offense
                                                                        )
                                                                    }
                                                                >

                                                                    <i className="bi bi-pencil-fill"></i>

                                                                    <span>
                                                                        Edit
                                                                    </span>

                                                                </button>

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                        </tbody>

                                    </table>

                                </div>

                            </>

                        )}

                        <div className="dashboard-pagination">

                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage(
                                        (previous) =>
                                            previous - 1
                                    )
                                }
                            >

                                <i className="bi bi-chevron-left"></i>

                                <span>
                                    Previous
                                </span>

                            </button>

                            <span className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={
                                    currentPage === totalPages
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (previous) =>
                                            previous + 1
                                    )
                                }
                            >

                                <span>
                                    Next
                                </span>

                                <i className="bi bi-chevron-right"></i>

                            </button>

                        </div>

                    </section>

                </main>

            </div>

            {showStudentModal && (

                <div
                    className="admin-modal-overlay"
                    onClick={closeStudentModal}
                >

                    <div
                        className="admin-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-modal-header">

                            <h4>
                                {editingStudentId !== null
                                    ? "Edit Student"
                                    : "Add Student"}
                            </h4>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeStudentModal}
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>

                        <form onSubmit={handleStudentSubmit}>

                            {studentFormError && (

                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >

                                    <div className="d-flex align-items-start">

                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                        <div>
                                            <strong>
                                                Duplicate or invalid data
                                            </strong>

                                            <div>
                                                {studentFormError}
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            )}

                            <div className="row g-3">

                                <div className="col-12">

                                    <label className="form-label">

                                        Student ID

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={studentForm.studentId}
                                        disabled={
                                            editingStudentId !== null
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                studentId:e.target.value,
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">

                                        First Name

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={
                                            studentForm.person.firstName
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                person:{
                                                    ...studentForm.person,
                                                    firstName:e.target.value,
                                                },
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">

                                        Middle Name

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={
                                            studentForm.person.middleName
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                person:{
                                                    ...studentForm.person,
                                                    middleName:e.target.value,
                                                },
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">

                                        Last Name

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={
                                            studentForm.person.lastName
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                person:{
                                                    ...studentForm.person,
                                                    lastName:e.target.value,
                                                },
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">

                                        Date of Birth

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={
                                            studentForm.person.dateOfBirth || ""
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                person:{
                                                    ...studentForm.person,
                                                    dateOfBirth:
                                                        e.target.value || null,
                                                },
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">

                                        Department

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <select
                                        className="form-select"
                                        value={
                                            studentForm.department
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                department:e.target.value,
                                            })
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select department
                                        </option>

                                        {departments.map(
                                            (department) => (

                                                <option
                                                    key={department}
                                                    value={department}
                                                >
                                                    {department}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">

                                        Student Type

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <select
                                        className="form-select"
                                        value={
                                            studentForm.studentType
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                studentType:e.target.value,
                                            })
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select student type
                                        </option>

                                        {studentTypes.map(
                                            (studentType) => (

                                                <option
                                                    key={studentType}
                                                    value={studentType}
                                                >
                                                    {studentType}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="col-12">

                                    <label className="form-label">

                                        Contact Number

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        value={
                                            studentForm.contactNumber
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                contactNumber:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />

                                </div>

                                <div className="col-12">

                                    <label className="form-label">

                                        Address

                                        <span className="text-danger">
                                            *
                                        </span>

                                    </label>

                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={
                                            studentForm.address
                                        }
                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                address:e.target.value,
                                            })
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            <div className="admin-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeStudentModal}
                                    disabled={savingStudent}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={savingStudent}
                                >

                                    {savingStudent
                                        ? "Saving..."
                                        : editingStudentId !== null
                                            ? "Update Student"
                                            : "Save Student"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {showOffenseModal && (

                <div
                    className="admin-modal-overlay"
                    onClick={closeOffenseModal}
                >

                    <div
                        className="admin-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-modal-header">

                            <h4>
                                {editingOffenseId !== null
                                    ? "Edit Offense"
                                    : "Add Offense"}
                            </h4>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeOffenseModal}
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>

                        <form onSubmit={handleOffenseSubmit}>

                            {offenseFormError && (

                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >

                                    <div className="d-flex align-items-start">

                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>

                                        <div>
                                            <strong>
                                                Duplicate or invalid data
                                            </strong>

                                            <div>
                                                {offenseFormError}
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            )}

                            <div className="mb-3">

                                <label className="form-label">

                                    Offense

                                    <span className="text-danger">
                                        *
                                    </span>

                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={offenseForm.offense}
                                    onChange={(e) =>
                                        setOffenseForm(
                                            (previous) => ({
                                                ...previous,
                                                offense:e.target.value,
                                            })
                                        )
                                    }
                                    required
                                />

                            </div>

                            <div className="mb-3">

                                <label className="form-label">

                                    Type

                                    <span className="text-danger">
                                        *
                                    </span>

                                </label>

                                <select
                                    className="form-select"
                                    value={offenseForm.type}
                                    onChange={(e) =>
                                        setOffenseForm(
                                            (previous) => ({
                                                ...previous,
                                                type:e.target.value,
                                            })
                                        )
                                    }
                                    required
                                >

                                    <option value="">
                                        Select offense type
                                    </option>

                                    {offenseTypesList.map(
                                        (type) => (

                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">

                                    Description

                                    <span className="text-danger">
                                        *
                                    </span>

                                </label>

                                <textarea
                                    className="form-control"
                                    rows={5}
                                    value={
                                        offenseForm.description
                                    }
                                    onChange={(e) =>
                                        setOffenseForm(
                                            (previous) => ({
                                                ...previous,
                                                description:
                                                    e.target.value,
                                            })
                                        )
                                    }
                                    required
                                />

                            </div>

                            <div className="admin-modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={closeOffenseModal}
                                    disabled={savingOffense}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={savingOffense}
                                >

                                    {savingOffense
                                        ? "Saving..."
                                        : editingOffenseId !== null
                                            ? "Update Offense"
                                            : "Save Offense"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default AdminDashboardPage;