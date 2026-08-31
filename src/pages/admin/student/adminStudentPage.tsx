import { useEffect, useState, FormEvent } from "react";

import {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent,
} from "../../../services/studentApi";
import type { Student, StudentInput } from "../../../services/studentApi";

import "../offense/adminOffensePage.css";

const departments = ["JHS", "SHS", "COLLEGE"];
const studentTypes = ["Extern", "Intern"];

const emptyForm: StudentInput = {
    studentId: "",
    address: "",
    department: "JHS",
    studentType: studentTypes[0],
    contactNumber: "",
    person: {
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: null,
    },
};

function AdminStudentPage() {

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<StudentInput>(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getAllStudents(departmentFilter || undefined);
            setStudents(data);
        } catch (err) {
            console.error("Failed to fetch students:", err);
            setError("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentFilter]);

    const filteredStudents = students.filter((student) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        const name = [
            student.person?.firstName,
            student.person?.middleName,
            student.person?.lastName,
        ].filter(Boolean).join(" ").toLowerCase();
        return student.studentId.toLowerCase().includes(q) || name.includes(q);
    });

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (student: Student) => {
        setEditingId(student.studentId);
        setForm({
            studentId: student.studentId,
            address: student.address || "",
            department: student.department || "JHS",
            studentType: student.studentType || studentTypes[0],
            contactNumber: student.contactNumber || "",
            person: {
                firstName: student.person?.firstName || "",
                middleName: student.person?.middleName || "",
                lastName: student.person?.lastName || "",
                dateOfBirth: student.person?.dateOfBirth || null,
            },
        });
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!form.studentId.trim() || !form.person.firstName.trim() || !form.person.lastName.trim()) {
            setFormError("Student ID, first name, and last name are required.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            if (editingId !== null) {
                await updateStudent(editingId, form);
            } else {
                await createStudent(form);
            }

            setShowModal(false);
            await fetchStudents();
        } catch (err) {
            console.error("Failed to save student:", err);
            setFormError(
                editingId === null
                    ? "Failed to save student. The Student ID may already be in use."
                    : "Failed to save student. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (student: Student) => {
        const name = [student.person?.firstName, student.person?.lastName].filter(Boolean).join(" ");
        if (!window.confirm(`Delete student ${student.studentId}${name ? ` (${name})` : ""}? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteStudent(student.studentId);
            await fetchStudents();
        } catch (err) {
            console.error("Failed to delete student:", err);
            setError("Failed to delete student. They may still have existing records.");
        }
    };

    return (
        <div className="admin-offense-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <main className="admin-offense-content">

                    <div className="admin-page-header mt-2 mb-4">
                        <h2 className="admin-page-title">Students</h2>
                        <button type="button" className="btn btn-primary fw-bold" onClick={openAddModal}>
                            <i className="bi bi-plus-lg me-1"></i> Add Student
                        </button>
                    </div>

                    {error && <p className="text-danger mb-3">{error}</p>}

                    <div className="admin-filter-row mb-3">
                        <input
                            type="text"
                            className="form-control"
                            style={{ maxWidth: 260 }}
                            placeholder="Search by ID or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="form-select"
                            style={{ maxWidth: 220 }}
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-table-section">
                        <div className="admin-table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "14%" }}>Student ID</th>
                                        <th style={{ width: "26%" }}>Name</th>
                                        <th style={{ width: "14%" }}>Department</th>
                                        <th style={{ width: "16%" }}>Contact</th>
                                        <th style={{ width: "90px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan={5} className="admin-table-empty">Loading students...</td>
                                        </tr>
                                    )}
                                    {!loading && filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="admin-table-empty">No students to show.</td>
                                        </tr>
                                    )}
                                    {!loading && filteredStudents.map((student) => {
                                        const name = [
                                            student.person?.firstName,
                                            student.person?.middleName,
                                            student.person?.lastName,
                                        ].filter(Boolean).join(" ");
                                        return (
                                            <tr key={student.studentId}>
                                                <td>{student.studentId}</td>
                                                <td>{name || "—"}</td>
                                                <td>{student.department || "—"}</td>
                                                <td>{student.contactNumber || "—"}</td>
                                                <td>
                                                    <div className="admin-row-actions">
                                                        <button
                                                            type="button"
                                                            className="admin-icon-btn"
                                                            aria-label="Edit"
                                                            onClick={() => openEditModal(student)}
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="admin-icon-btn danger"
                                                            aria-label="Delete"
                                                            onClick={() => handleDelete(student)}
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </main>

            </div>

            {showModal && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h5 className="admin-modal-title">
                            {editingId !== null ? "Edit Student" : "Add Student"}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="studentId">Student ID</label>
                                <input
                                    id="studentId"
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. CT23-0010"
                                    value={form.studentId}
                                    disabled={editingId !== null}
                                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                                />
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-4">
                                    <label className="form-label fw-bold" htmlFor="firstName">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        className="form-control"
                                        value={form.person.firstName}
                                        onChange={(e) => setForm({ ...form, person: { ...form.person, firstName: e.target.value } })}
                                    />
                                </div>
                                <div className="col-4">
                                    <label className="form-label fw-bold" htmlFor="middleName">Middle Name</label>
                                    <input
                                        id="middleName"
                                        type="text"
                                        className="form-control"
                                        value={form.person.middleName}
                                        onChange={(e) => setForm({ ...form, person: { ...form.person, middleName: e.target.value } })}
                                    />
                                </div>
                                <div className="col-4">
                                    <label className="form-label fw-bold" htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        className="form-control"
                                        value={form.person.lastName}
                                        onChange={(e) => setForm({ ...form, person: { ...form.person, lastName: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="dateOfBirth">Date of Birth</label>
                                <input
                                    id="dateOfBirth"
                                    type="date"
                                    className="form-control"
                                    value={form.person.dateOfBirth || ""}
                                    onChange={(e) => setForm({ ...form, person: { ...form.person, dateOfBirth: e.target.value || null } })}
                                />
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <label className="form-label fw-bold" htmlFor="department">Department</label>
                                    <select
                                        id="department"
                                        className="form-select"
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    >
                                        {departments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-bold" htmlFor="studentType">Student Type</label>
                                    <select
                                        id="studentType"
                                        className="form-select"
                                        value={form.studentType}
                                        onChange={(e) => setForm({ ...form, studentType: e.target.value })}
                                    >
                                        {studentTypes.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="address">Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    className="form-control"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="contactNumber">Contact Number</label>
                                <input
                                    id="contactNumber"
                                    type="text"
                                    className="form-control"
                                    value={form.contactNumber}
                                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                                />
                            </div>

                            {formError && <p className="text-danger mb-0">{formError}</p>}

                            <div className="admin-modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary fw-bold"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminStudentPage;
