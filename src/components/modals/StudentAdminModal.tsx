import type { FormEvent } from "react";
import type { StudentInput } from "../../services/studentApi";

interface StudentAdminModalProps {
    show: boolean;
    editingId: string | null;
    form: StudentInput;
    error: string;
    saving: boolean;
    departments: string[];
    studentTypes: string[];
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onChange: (form: StudentInput) => void;
}

function StudentAdminModal({
    show,
    editingId,
    form,
    error,
    saving,
    departments,
    studentTypes,
    onClose,
    onSubmit,
    onChange,
}: StudentAdminModalProps) {
    if (!show) {
        return null;
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h4>
                        {editingId !== null ? "Edit Student" : "Add Student"}
                    </h4>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={onClose}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <div className="d-flex align-items-start">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div>
                                    <strong>Duplicate or invalid data</strong>
                                    <div>{error}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">
                                Student ID <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={form.studentId}
                                disabled={editingId !== null}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        studentId: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                First Name <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={form.person.firstName}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        person: {
                                            ...form.person,
                                            firstName: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Middle Name <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={form.person.middleName}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        person: {
                                            ...form.person,
                                            middleName: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Last Name <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={form.person.lastName}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        person: {
                                            ...form.person,
                                            lastName: e.target.value,
                                        },
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Date of Birth <span className="text-danger">*</span>
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={form.person.dateOfBirth || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        person: {
                                            ...form.person,
                                            dateOfBirth: e.target.value || null,
                                        },
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Department <span className="text-danger">*</span>
                            </label>

                            <select
                                className="form-select"
                                value={form.department}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        department: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">Select department</option>

                                {departments.map((department) => (
                                    <option key={department} value={department}>
                                        {department}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                Student Type <span className="text-danger">*</span>
                            </label>

                            <select
                                className="form-select"
                                value={form.studentType}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        studentType: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="">Select student type</option>

                                {studentTypes.map((studentType) => (
                                    <option key={studentType} value={studentType}>
                                        {studentType}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12">
                            <label className="form-label">
                                Contact Number <span className="text-danger">*</span>
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={form.contactNumber}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        contactNumber: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">
                                Address <span className="text-danger">*</span>
                            </label>

                            <textarea
                                className="form-control"
                                rows={3}
                                value={form.address}
                                onChange={(e) =>
                                    onChange({
                                        ...form,
                                        address: e.target.value,
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
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId !== null
                                    ? "Update Student"
                                    : "Save Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentAdminModal;