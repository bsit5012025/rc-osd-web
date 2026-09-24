import type { Student } from "../../services/studentApi";

interface StudentTableProps {
    students: Student[];
    paginatedStudents: Student[];
    loading: boolean;
    studentSearch: string;
    departmentFilter: string;
    departments: string[];
    onSearchChange: (value: string) => void;
    onDepartmentChange: (value: string) => void;
    onAdd: () => void;
    onImport: () => void;
    onEdit: (student: Student) => void;
    onToggleStatus: (student: Student) => void;
    savingStatusIds: Set<string>;
}

function StudentTable({
    students,
    paginatedStudents,
    loading,
    studentSearch,
    departmentFilter,
    departments,
    onSearchChange,
    onDepartmentChange,
    onAdd,
    onImport,
    onEdit,
    onToggleStatus,
    savingStatusIds,
}: StudentTableProps) {
    return (
        <>
            <div className="dashboard-table-header">
                <div>
                    <div className="table-title-row">
                        <h3>Students</h3>

                        <span className="total-count student-count">
                            Total number:
                            <strong>
                                {loading ? "—" : students.length}
                            </strong>
                        </span>
                    </div>

                    <p>Manage student records.</p>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        type="button"
                        className="import-btn"
                        onClick={onImport}
                    >
                        <i className="bi bi-file-earmark-arrow-up-fill"></i>
                        <span>Import</span>
                    </button>

                    <button
                        type="button"
                        className="add-btn"
                        onClick={onAdd}
                    >
                        <i className="bi bi-plus-lg"></i>
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            <div className="admin-filter-row">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search student..."
                    value={studentSearch}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                />

                <select
                    className="form-select"
                    value={departmentFilter}
                    onChange={(e) =>
                        onDepartmentChange(e.target.value)
                    }
                >
                    <option value="">All Departments</option>

                    {departments.map((department) => (
                        <option
                            key={department}
                            value={department}
                        >
                            {department}
                        </option>
                    ))}
                </select>
            </div>

            <div className="dashboard-table-container">
                <table className="admin-table student-table">
                    <colgroup>
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "27%" }} />
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "17%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "10%" }} />
                    </colgroup>

                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td
                                    colSpan={6}
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
                                        colSpan={6}
                                        className="admin-table-empty"
                                    >
                                        No students found.
                                    </td>
                                </tr>
                            )}

                        {!loading &&
                            paginatedStudents.map((student) => {
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

                                        <td data-label="Status">
                                            <label
                                                className={
                                                    student.isActive
                                                        ? "status-switch is-active"
                                                        : "status-switch"
                                                }
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        student.isActive
                                                    }
                                                    disabled={savingStatusIds?.has(
                                                        student.studentId
                                                    )}
                                                    onChange={() =>
                                                        onToggleStatus(
                                                            student
                                                        )
                                                    }
                                                />

                                                <span className="status-switch-track">
                                                    <span className="status-switch-thumb"></span>
                                                </span>

                                                <span className="status-switch-label">
                                                    {savingStatusIds?.has(
                                                        student.studentId
                                                    )
                                                        ? "Saving..."
                                                        : student.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                </span>
                                            </label>
                                        </td>

                                        <td data-label="Action">
                                            <button
                                                type="button"
                                                className="student-edit-btn"
                                                onClick={() =>
                                                    onEdit(student)
                                                }
                                                title="Edit student information"
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                                <span>Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default StudentTable;