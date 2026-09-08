import { useEffect, useMemo, useState, type FormEvent, } from "react";
import TopBar from "../../../components/navigation/TopBar";
import UserGreeting from "../../../components/navigation/UserGreeting";
import StudentTable from "../../../components/table/StudentTable";
import OffenseTable from "../../../components/table/OffenseTable";
import StudentAdminModal from "../../../components/modals/StudentAdminModal";
import OffenseAdminModal from "../../../components/modals/OffenseAdminModal";
import Pagination from "../../../components/pagination/Pagination";
import { getAllStudents, createStudent, updateStudent, } from "../../../services/studentApi";
import type { Student, StudentInput, } from "../../../services/studentApi";
import { getOffenses, createOffense, updateOffense, } from "../../../services/offenseApi";
import type { OffenseInput } from "../../../services/offenseApi";
import type { Offense } from "../../../types/offense";
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
    const [students, setStudents] = useState<Student[]>([]);
    const [offenses, setOffenses] = useState<Offense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTable, setActiveTable] = useState<ActiveTable>("students");
    const [currentPage, setCurrentPage] = useState(1);
    const [studentSearch, setStudentSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [offenseSearch, setOffenseSearch] = useState("");
    const [offenseTypeFilter, setOffenseTypeFilter] = useState("");
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [studentForm, setStudentForm] = useState<StudentInput>(emptyStudentForm);
    const [studentFormError, setStudentFormError] = useState("");
    const [savingStudent, setSavingStudent] = useState(false);
    const [showOffenseModal, setShowOffenseModal] = useState(false);
    const [editingOffenseId, setEditingOffenseId] = useState<number | null>(null);
    const [offenseForm, setOffenseForm] = useState<OffenseInput>(emptyOffenseForm);
    const [offenseFormError, setOffenseFormError] = useState("");
    const [savingOffense, setSavingOffense] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [studentData, offenseData] = await Promise.all([
                getAllStudents(),
                getOffenses(),
            ]);

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
    }, [students, studentSearch, departmentFilter]);

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
    }, [offenses, offenseSearch, offenseTypeFilter]);

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

    const handleStudentSearchChange = (value: string) => {
        setStudentSearch(value);
        setCurrentPage(1);
    };

    const handleDepartmentChange = (value: string) => {
        setDepartmentFilter(value);
        setCurrentPage(1);
    };

    const handleOffenseSearchChange = (value: string) => {
        setOffenseSearch(value);
        setCurrentPage(1);
    };

    const handleOffenseTypeChange = (value: string) => {
        setOffenseTypeFilter(value);
        setCurrentPage(1);
    };

    const openAddStudentModal = () => {
        setEditingStudentId(null);
        setStudentForm({
            ...emptyStudentForm,
            person: {
                ...emptyStudentForm.person,
            },
        });
        setStudentFormError("");
        setShowStudentModal(true);
    };

    const openEditStudentModal = (student: Student) => {
        setEditingStudentId(student.studentId);

        setStudentForm({
            studentId: student.studentId,
            address: student.address || "",
            department: student.department || "",
            studentType: student.studentType || "",
            contactNumber: student.contactNumber || "",
            person: {
                firstName: student.person?.firstName || "",
                middleName: student.person?.middleName || "",
                lastName: student.person?.lastName || "",
                dateOfBirth: student.person?.dateOfBirth || null,
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
        e: FormEvent<HTMLFormElement>) => {
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
            console.error("Failed to save student:", err);

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
            offense: "",
            type: "",
            description: "",
        });

        setOffenseFormError("");
        setShowOffenseModal(true);
    };

    const openEditOffenseModal = (offense: Offense) => {
        setEditingOffenseId(offense.offenseId);

        setOffenseForm({
            offense: offense.offense || "",
            type: offense.type || "",
            description: offense.description || "",
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
            setOffenseFormError(
                "Please select an offense type."
            );
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
            console.error("Failed to save offense:", err);

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
                                label: "Username",
                                value: username,
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
                                <span>Students</span>
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
                                <span>Offenses</span>
                            </button>
                        </div>

                        {activeTable === "students" && (
                            <section>
                                <StudentTable
                                    students={students}
                                    paginatedStudents={paginatedStudents}
                                    loading={loading}
                                    studentSearch={studentSearch}
                                    departmentFilter={departmentFilter}
                                    departments={departments}
                                    onSearchChange={
                                        handleStudentSearchChange
                                    }
                                    onDepartmentChange={
                                        handleDepartmentChange
                                    }
                                    onAdd={openAddStudentModal}
                                    onEdit={openEditStudentModal}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPrevious={() =>
                                        setCurrentPage(
                                            (previous) =>
                                                Math.max(
                                                    1,
                                                    previous - 1
                                                )
                                        )
                                    }
                                    onNext={() =>
                                        setCurrentPage(
                                            (previous) =>
                                                Math.min(
                                                    totalPages,
                                                    previous + 1
                                                )
                                        )
                                    }
                                />
                            </section>
                        )}

                        {activeTable === "offenses" && (
                            <section>
                                <OffenseTable
                                    offenses={offenses}
                                    paginatedOffenses={
                                        paginatedOffenses
                                    }
                                    loading={loading}
                                    offenseSearch={offenseSearch}
                                    offenseTypeFilter={
                                        offenseTypeFilter
                                    }
                                    offenseTypes={
                                        offenseTypesList
                                    }
                                    onSearchChange={
                                        handleOffenseSearchChange
                                    }
                                    onTypeChange={
                                        handleOffenseTypeChange
                                    }
                                    onAdd={openAddOffenseModal}
                                    onEdit={openEditOffenseModal}
                                />

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPrevious={() =>
                                        setCurrentPage(
                                            (previous) =>
                                                Math.max(
                                                    1,
                                                    previous - 1
                                                )
                                        )
                                    }
                                    onNext={() =>
                                        setCurrentPage(
                                            (previous) =>
                                                Math.min(
                                                    totalPages,
                                                    previous + 1
                                                )
                                        )
                                    }
                                />
                            </section>
                        )}
                    </section>
                </main>
            </div>

            <StudentAdminModal
                show={showStudentModal}
                editingId={editingStudentId}
                form={studentForm}
                error={studentFormError}
                saving={savingStudent}
                departments={departments}
                studentTypes={studentTypes}
                onClose={closeStudentModal}
                onSubmit={handleStudentSubmit}
                onChange={setStudentForm}
            />

            <OffenseAdminModal
                show={showOffenseModal}
                editingId={editingOffenseId}
                form={offenseForm}
                error={offenseFormError}
                saving={savingOffense}
                offenseTypes={offenseTypesList}
                onClose={closeOffenseModal}
                onSubmit={handleOffenseSubmit}
                onChange={setOffenseForm}
            />
        </div>
    );
}

export default AdminDashboardPage;