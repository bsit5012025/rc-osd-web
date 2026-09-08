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
    onEdit: (student: Student) => void;
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
    onEdit,
}: StudentTableProps) {
    return (
        <>
            <div className="dashboard-table-header">
                <div>
                    <div className="table-title-row">
                        <h3>Students</h3>

                        <span className="total-count student-count">
                            Total number:
                            <strong>{loading ? "—" : students.length}</strong>
                        </span>
                    </div>

                    <p>Manage student records.</p>
                </div>

                <button
                    type="button"
                    className="add-btn"
                    onClick={onAdd}
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Add Student</span>
                </button>
            </div>

            <div className="admin-filter-row">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search student..."
                    value={studentSearch}
                    onChange={(e) => onSearchChange(e.target.value)}
                />

                <select
                    className="form-select"
                    value={departmentFilter}
                    onChange={(e) => onDepartmentChange(e.target.value)}
                >
                    <option value="">All Departments</option>

                    {departments.map((department) => (
                        <option key={department} value={department}>
                            {department}
                        </option>
                    ))}
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
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Contact</th>
                            <th>Action</th>
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

                                        <td data-label="Action">
                                            <button
                                                type="button"
                                                className="edit-action-btn"
                                                onClick={() => onEdit(student)}
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