import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";

import {useEffect, useMemo, useState, type FormEvent, } from "react";
import { getAllStudents, createStudent, updateStudent, } from "../../../services/studentApi";
import type { Student, StudentInput, } from "../../../services/studentApi";
import { getOffenses, createOffense, updateOffense,} from "../../../services/offenseApi";
import type { OffenseInput, } from "../../../services/offenseApi";
import type { Offense } from "../../../types/offense";
import "./adminDashboardPage.css";

type ActiveTable = "students" | "offenses";

const ITEMS_PER_PAGE = 8;
const departments = [
    "JHS",
    "SHS",
    "COLLEGE",
];

const offenseTypesList = [
    "Minor Offense",
    "Major Offense",
];

const emptyStudentForm: StudentInput = {
    studentId: "",
    address: "",
    department: "",
    studentType: "",
    contactNumber: "",
    person: {
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: null,
    },
};

const emptyOffenseForm: OffenseInput = {
    offense: "",
    type: "",
    description: "",
};


function AdminDashboardPage() {

    const username = localStorage.getItem("username") || "";

    /*
     * DATA OF STUDENT AND OFFENSE
     */

    const [students, setStudents] = useState<Student[]>([]);
    const [offenses, setOffenses] = useState<Offense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /*
    *   Initialize active table.
    */

    const [activeTable, setActiveTable] = useState<ActiveTable>("students");

    /*
    *   Initialize page for table
    */

    const [currentPage, setCurrentPage] = useState(1);

    /*
     * FILTER STUDENT AND OFFENSE
     */

    const [studentSearch, setStudentSearch] = useState("");
    const [ departmentFilter, setDepartmentFilter, ] = useState("");
    const [offenseSearch, setOffenseSearch] = useState("");
    const [ offenseTypeFilter, setOffenseTypeFilter, ] = useState("");

    /*
    * STUDENT MODAL
    */

    const [ showStudentModal, setShowStudentModal, ] = useState(false);
    const [ editingStudentId, setEditingStudentId, ] = useState<string | null>(null);
    const [ studentForm, setStudentForm, ] = useState<StudentInput>(emptyStudentForm);
    const [ studentFormError, setStudentFormError, ] = useState("");
    const [ savingStudent, setSavingStudent, ] = useState(false);

    /*
    * OFFENSE MODAL
    */

    const [ showOffenseModal, setShowOffenseModal, ] = useState(false);
    const [ editingOffenseId, setEditingOffenseId, ] = useState<number | null>(null);
    const [ offenseForm, setOffenseForm, ] = useState<OffenseInput>( emptyOffenseForm);
    const [ offenseFormError, setOffenseFormError, ] = useState("");
    const [ savingOffense, setSavingOffense, ] = useState(false);


    /*
    *   Fetch data
    */

    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError("");

            const [studentData, offenseData,] = await Promise.all([getAllStudents(), getOffenses(),]);

            setStudents(studentData);
            setOffenses(offenseData);

        } catch (err) {

            console.error("Failed to fetch dashboard data:", err);
            setError("Failed to load dashboard data.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchDashboardData();

    }, []);

    /*
    *   For filtering of students.
    */
    const filteredStudents = useMemo(() => {

        return students.filter((student) => {

            const search = studentSearch.trim().toLowerCase();
            const fullName = [student.person?.firstName, student.person?.middleName, student.person?.lastName,].filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = !search || student.studentId?.toLowerCase().includes(search) || fullName.includes(search);
            const matchesDepartment = !departmentFilter || student.department === departmentFilter;

            return (matchesSearch &&matchesDepartment);

        });

    }, [students, studentSearch, departmentFilter,]);

    /*
     *  For filtering of offense.
     */
    const filteredOffenses = useMemo(() => {

        return offenses.filter((offense) => {

            const search = offenseSearch.trim().toLowerCase();
            const matchesSearch = !search || offense.offense?.toLowerCase().includes(search) || offense.description?.toLowerCase().includes(search);
            const matchesType = !offenseTypeFilter || offense.type === offenseTypeFilter;

            return ( matchesSearch && matchesType );

        });

    }, [offenses, offenseSearch, offenseTypeFilter, ]);


    /*
     *  For pages 
     */
    const totalItems = activeTable === "students" ? filteredStudents.length : filteredOffenses.length;
    const totalPages = Math.max( 1, Math.ceil(totalItems/ITEMS_PER_PAGE));
    const paginatedStudents = filteredStudents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const paginatedOffenses = filteredOffenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


    /*
     * Change table
     */
    const changeTable = (table: ActiveTable) => {setActiveTable(table);setCurrentPage(1);};


    /*
     * Student Modal
     */
    const openAddStudentModal = () => {
        setEditingStudentId(null);
        setStudentForm(emptyStudentForm);
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
            person: {
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


    /*
     *  Save student
     */

    const handleStudentSubmit = async (e: FormEvent<HTMLFormElement>) => { e.preventDefault();

        try {

            setSavingStudent(true);
            setStudentFormError("");

            if (editingStudentId !== null) {

                await updateStudent(editingStudentId,studentForm);

            } else {

                await createStudent(studentForm);

            }

            setShowStudentModal(false);
            await fetchDashboardData();

        } catch (err) {

            console.error("Failed to save student:",err);
            setStudentFormError("Failed to save student.");

        } finally {

            setSavingStudent(false);

        }

    };


    /**
     * Offense Modal
     */
    const openAddOffenseModal = () => {

        setEditingOffenseId(null);
        setOffenseForm({offense: "", type: "", description: "",});
        setOffenseFormError("");
        setShowOffenseModal(true);

    };

    const openEditOffenseModal = (offense: Offense) => {setEditingOffenseId(offense.offenseId);

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


    /*
     * Save Offense
     */

    const handleOffenseSubmit = async (e: FormEvent<HTMLFormElement>) => {

        e.preventDefault();

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

        try {

            setSavingOffense(true);
            setOffenseFormError("");

            console.log("Saving offense:", offenseForm);

            if (editingOffenseId !== null) {

                await updateOffense(editingOffenseId, offenseForm);

            } else {

                await createOffense(offenseForm);

            }

            setShowOffenseModal(false);
            await fetchDashboardData();

        } catch (err) {

            console.error("Failed to save offense:", err);
            setOffenseFormError("Failed to save offense.");

        } finally {

            setSavingOffense(false);

        }

    };

    return (

        <div className="admin-dashboard-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>

                    <UserGreeting name="Administrator"

                        infoItems={[
                            {
                                label: "Username",
                                value: username,
                            },
                        ]}/>

                </TopBar>

                <main className="admin-dashboard-content">


                    {error && (

                        <div className="alert alert-danger mt-3">

                            {error}

                        </div>

                    )}


                    <section className="dashboard-management-section">

                        <div className="dashboard-table-tabs">

                            <button type="button"

                                className={
                                    activeTable === "students" ? "dashboard-tab active" : "dashboard-tab"
                                }

                                onClick={() =>
                                    changeTable(
                                        "students"
                                    )
                                }
                            >

                                <i className="bi bi-people-fill"></i>

                                <span>
                                    Students
                                </span>

                            </button>


                            <button type="button"

                                className={
                                    activeTable === "offenses" ? "dashboard-tab active" : "dashboard-tab"
                                }

                                onClick={() =>
                                    changeTable(
                                        "offenses"
                                    )
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
                                                    {loading ? "—" : students.length}
                                                </strong>

                                            </span>

                                        </div>

                                        <p>
                                            Manage student records.
                                        </p>

                                    </div>


                                    <button type="button" className="add-btn"

                                        onClick={
                                            openAddStudentModal
                                        }

                                    >

                                        <i className="bi bi-plus-lg"></i>

                                        <span>
                                            Add Student
                                        </span>

                                    </button>

                                </div>


                                <div className="admin-filter-row">

                                    <input type="text" className="form-control" placeholder="Search student..."

                                        value={
                                            studentSearch
                                        }

                                        onChange={(e) => {

                                            setStudentSearch(
                                                e.target.value
                                            );

                                            setCurrentPage(1);

                                        }}

                                    />


                                    <select className="form-select"

                                        value={
                                            departmentFilter
                                        }

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

                                                <option key={department} value={department}>
                                                    {department}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="dashboard-table-container">

                                    <table className="admin-table student-table">

                                        <colgroup>

                                            <col style={{ width: "16%" }} />

                                            <col style={{ width: "30%" }} />

                                            <col style={{ width: "20%" }} />

                                            <col style={{ width: "20%" }} />

                                            <col style={{ width: "14%" }} />

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

                                                    <td colSpan={5} className="admin-table-empty">

                                                        Loading students...

                                                    </td>

                                                </tr>

                                            )}


                                            {!loading && paginatedStudents.length === 0 && (

                                                    <tr>

                                                        <td colSpan={5} className="admin-table-empty">

                                                            No students found.

                                                        </td>

                                                    </tr>

                                                )}


                                            {!loading && paginatedStudents.map(
                                                    (student) => {

                                                        const fullName = [
                                                            student.person?.firstName,
                                                            student.person?.middleName,
                                                            student.person?.lastName,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(" ");


                                                        return (

                                                            <tr key={student.studentId}>

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

                                                                    <button type="button" className="edit-action-btn"

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
                                                    {loading ? "—" : offenses.length}
                                                </strong>

                                            </span>

                                        </div>

                                        <p>
                                            Manage offense categories.
                                        </p>

                                    </div>


                                    <button type="button" className="add-btn"

                                        onClick={
                                            openAddOffenseModal
                                        }

                                    >

                                        <i className="bi bi-plus-lg"></i>

                                        <span>
                                            Add Offense
                                        </span>

                                    </button>

                                </div>


                                <div className="admin-filter-row">

                                    <input type="text" className="form-control" placeholder="Search offense..."

                                        value={offenseSearch}

                                        onChange={(e) => {

                                            setOffenseSearch(
                                                e.target.value
                                            );

                                            setCurrentPage(1);

                                        }}

                                    />


                                    <select className="form-select"

                                        value={
                                            offenseTypeFilter
                                        }

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

                                                <option key={type} value={type}>
                                                    {type}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="dashboard-table-container">

                                    <table className="admin-table offense-table">

                                        <colgroup>

                                            <col style={{ width: "22%" }} />

                                            <col style={{ width: "18%" }} />

                                            <col style={{ width: "45%" }} />

                                            <col style={{ width: "15%" }} />

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

                                                    <td colSpan={4} className="admin-table-empty">

                                                        Loading offenses...

                                                    </td>

                                                </tr>

                                            )}


                                            {!loading && paginatedOffenses.length === 0 && (

                                                    <tr>

                                                        <td colSpan={4} className="admin-table-empty">

                                                            No offenses found.

                                                        </td>

                                                    </tr>

                                                )}

                                            {!loading && paginatedOffenses.map(
                                                    (offense) => (

                                                        <tr key={offense.offenseId}>                                                 

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

                                                                <button type="button" className="edit-action-btn"

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


                            <button type="button" className="pagination-btn"

                                disabled={
                                    currentPage === 1
                                }

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


                            <button type="button" className="pagination-btn"

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

                <div className="admin-modal-overlay" onClick={closeStudentModal}>

                    <div className="admin-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-modal-header">

                            <h4>

                                {editingStudentId !== null ? "Edit Student" : "Add Student"}

                            </h4>


                            <button type="button" className="modal-close-btn"

                                onClick={
                                    closeStudentModal
                                }

                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        <form onSubmit={handleStudentSubmit}>

                            <div className="row g-3">

                                <div className="col-12">

                                    <label className="form-label">
                                        Student ID
                                    </label>


                                    <input type="text" className="form-control"

                                        value={studentForm.studentId}
                                        disabled={editingStudentId !== null}

                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                studentId:
                                                    e.target.value,
                                            })
                                        }

                                        required

                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">
                                        First Name
                                    </label>


                                    <input type="text" className="form-control"

                                        value={studentForm.person.firstName}

                                        onChange={(e) =>
                                            setStudentForm({
                                                ...studentForm,
                                                person: {
                                                    ...studentForm.person,
                                                    firstName:
                                                        e.target.value,
                                                },
                                            })
                                        }

                                        required/>

                                </div>


                                <div className="col-md-6">

                                    <label className="form-label">
                                        Last Name
                                    </label>


                                    <input type="text" className="form-control" value={studentForm.person.lastName}

                                        onChange={(e) =>
                                            setStudentForm({...studentForm, person: {...studentForm.person, lastName:e.target.value,},
                                            })
                                        }

                                        required/>

                                </div>

                                <div className="col-12">

                                    <label className="form-label">
                                        Contact Number
                                    </label>

                                    <input type="text" className="form-control"value={studentForm.contactNumber}
                                        onChange={(e) =>
                                            setStudentForm({...studentForm, contactNumber:e.target.value,})
                                        }/>

                                </div>


                            </div>

                            {studentFormError && (

                                <p className="text-danger mt-3">

                                    {studentFormError}

                                </p>

                            )}

                            <div className="admin-modal-actions">

                                <button type="button" className="cancel-btn" onClick={ closeStudentModal } disabled={ savingStudent }>

                                    Cancel

                                </button>

                                <button type="submit" className="save-btn" disabled={savingStudent}>

                                    {savingStudent ? "Saving..." : editingStudentId !== null ? "Update Student" : "Save Student"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {showOffenseModal && (

                <div className="admin-modal-overlay" onClick={closeOffenseModal}>

                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>

                        <div className="admin-modal-header">

                            <h4>

                                {editingOffenseId !== null ? "Edit Offense" : "Add Offense"}

                            </h4>


                            <button type="button" className="modal-close-btn" onClick={closeOffenseModal}>

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleOffenseSubmit
                            }
                        >

                            <div className="mb-3">

                                <label className="form-label">

                                    Offense

                                </label>

                                <input type="text" className="form-control" value={offenseForm.offense}

                                    onChange={(e) => setOffenseForm(
                                            (previous) => ({...previous, offense:e.target.value,})
                                        )
                                    }

                                    required/>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">

                                    Type

                                </label>


                                <select className="form-select" value={offenseForm.type}

                                    onChange={(e) => setOffenseForm(
                                            (previous) => ({ ...previous, type:e.target.value,})
                                        )
                                    }

                                    required>

                                    <option value="">
                                        Select offense type
                                    </option>

                                    {offenseTypesList.map((type) => (

                                            <option key={type} value={type}>

                                                {type}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">

                                    Description

                                </label>


                                <textarea className="form-control" rows={5} value={ offenseForm.description } 
                                onChange={(e) =>  setOffenseForm(
                                        (previous) => ({...previous, description:e.target.value,})
                                    )
                                }
                                    required/>

                            </div>

                            {offenseFormError && (<p className="text-danger">{offenseFormError}</p>)}

                            <div className="admin-modal-actions">

                                <button type="button" className="cancel-btn" onClick={ closeOffenseModal } disabled={savingOffense}>

                                    Cancel

                                </button>


                                <button type="submit" className="save-btn" disabled={savingOffense}>

                                    {savingOffense ? "Saving..." : editingOffenseId !== null? "Update Offense" : "Save Offense"}

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