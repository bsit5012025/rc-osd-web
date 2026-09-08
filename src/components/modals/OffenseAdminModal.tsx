import type { FormEvent } from "react";
import type { OffenseInput } from "../../services/offenseApi";

interface OffenseAdminModalProps {
    show: boolean;
    editingId: number | null;
    form: OffenseInput;
    error: string;
    saving: boolean;
    offenseTypes: string[];
    onClose: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onChange: (form: OffenseInput) => void;
}

function OffenseAdminModal({
    show,
    editingId,
    form,
    error,
    saving,
    offenseTypes,
    onClose,
    onSubmit,
    onChange,
}: OffenseAdminModalProps) {
    if (!show) {
        return null;
    }

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h4>
                        {editingId !== null ? "Edit Offense" : "Add Offense"}
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

                    <div className="mb-3">
                        <label className="form-label">
                            Offense <span className="text-danger">*</span>
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={form.offense}
                            onChange={(e) =>
                                onChange({
                                    ...form,
                                    offense: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Type <span className="text-danger">*</span>
                        </label>

                        <select
                            className="form-select"
                            value={form.type}
                            onChange={(e) =>
                                onChange({
                                    ...form,
                                    type: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select offense type</option>

                            {offenseTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Description <span className="text-danger">*</span>
                        </label>

                        <textarea
                            className="form-control"
                            rows={5}
                            value={form.description}
                            onChange={(e) =>
                                onChange({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            required
                        />
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
                                    ? "Update Offense"
                                    : "Save Offense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OffenseAdminModal;