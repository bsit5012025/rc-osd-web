import type { FormEvent } from "react";
import type { StudentInput } from "../../services/studentApi";

interface AdminEditModalProps {
    show: boolean;
    studentName: string;
    form: StudentInput;
    error: string;
    saving: boolean;
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onChange: (form: StudentInput) => void;
}

export default function AdminEditModal({
    show,
    studentName,
    form,
    error,
    saving,
    onClose,
    onSubmit,
    onChange,
}: AdminEditModalProps) {
    if (!show) {
        return null;
    }

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <form onSubmit={onSubmit}>
                        <div className="modal-header">
                            <div>
                                <h5 className="modal-title">
                                    Edit Student Information
                                </h5>

                                <small className="text-muted">
                                    {studentName}
                                </small>
                            </div>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={saving}
                            ></button>
                        </div>

                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            <div className="mb-3">
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
                                    placeholder="Enter contact number"
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Date of Birth <span className="text-danger">*</span>
                                </label>

                                <input
                                    type="date"
                                    className="form-control"
                                    value={
                                        form.person.dateOfBirth
                                            ? String(form.person.dateOfBirth).substring(
                                                  0,
                                                  10
                                              )
                                            : ""
                                    }
                                    onChange={(e) =>
                                        onChange({
                                            ...form,
                                            person: {
                                                ...form.person,
                                                dateOfBirth:
                                                    e.target.value,
                                            },
                                        })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}