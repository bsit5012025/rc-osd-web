import { useEffect, useState, FormEvent } from "react";
import axios from "axios";

import { updateAppeal } from "../../services/appealApi";

interface EditAppealModalProps {
    show: boolean;
    appealId: number | null;
    initialMessage: string;
    onClose: () => void;
    onSaved: () => void;
}

function EditAppealModal({ show, appealId, initialMessage, onClose, onSaved }: EditAppealModalProps) {
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) return;
        setMessage(initialMessage);
        setError("");
    }, [show, initialMessage]);

    if (!show || appealId === null) return null;

    const unchanged = message.trim() === initialMessage.trim();
    const canSave = message.trim() !== "" && !unchanged && !saving;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!canSave) return;

        try {
            setSaving(true);
            setError("");
            await updateAppeal(appealId, message.trim());
            onSaved();
        } catch (err) {
            console.error("Failed to update appeal:", err);
            const backendMessage = axios.isAxiosError(err) ? err.response?.data?.message : null;
            setError(
                typeof backendMessage === "string" && backendMessage.trim() !== ""
                    ? backendMessage
                    : "Failed to update the appeal. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="file-appeal-overlay">
            <div className="file-appeal-modal" onClick={(e) => e.stopPropagation()}>

                <div className="file-appeal-modal-header">
                    <div className="file-appeal-header-left">
                        <div className="file-appeal-header-icon">
                            <i className="bi bi-pencil-square"></i>
                        </div>
                        <h5>Edit Appeal</h5>
                    </div>
                    <button
                        type="button"
                        className="file-appeal-close-btn"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="file-appeal-form">
                    <div className="file-appeal-modal-body">
                        <div className="file-appeal-section">
                            <div className="file-appeal-section-title">
                                Message <span className="required-asterisk">*</span>
                            </div>
                            <p className="new-appeal-hint mb-2">
                                You can edit this while the appeal is still pending. The Prefect will see it as edited.
                            </p>
                            <textarea
                                id="editAppealMessage"
                                className="form-control new-appeal-textarea"
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={500}
                                disabled={saving}
                            />
                        </div>

                        {error && <p className="text-danger">{error}</p>}
                    </div>

                    <div className="file-appeal-modal-footer">
                        <button
                            type="button"
                            className="file-appeal-cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="submit-appeal-btn" disabled={!canSave}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default EditAppealModal;
