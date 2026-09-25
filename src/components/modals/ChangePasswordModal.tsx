import { useEffect, useRef, useState } from "react";
import { changePassword } from "../../services/authenticationApi";
import "./ChangePasswordModal.css";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Requirement {
    label: string;
    test: (value: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One number", test: (v) => /[0-9]/.test(v) },
];

function getStrength(value: string): { label: string; percent: number; color: string } {
    if (!value) return { label: "", percent: 0, color: "transparent" };

    const passed = REQUIREMENTS.filter((r) => r.test(value)).length;
    const long = value.length >= 12;

    if (passed <= 1) return { label: "Weak", percent: 33, color: "#d9534f" };
    if (passed === 2 || (passed === 3 && !long)) return { label: "Fair", percent: 66, color: "#E1AD01" };
    return { label: "Strong", percent: 100, color: "#2f9e56" };
}

function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const firstInputRef = useRef<HTMLInputElement>(null);

    // Reset state whenever the modal is opened/closed
    useEffect(() => {
        if (isOpen) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
            setError("");
            setSubmitting(false);
            setSuccess(false);
            setTimeout(() => firstInputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !submitting) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, submitting, onClose]);

    if (!isOpen) return null;

    const strength = getStrength(newPassword);
    const requirementsMet = REQUIREMENTS.every((r) => r.test(newPassword));
    const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
    const isDifferentFromCurrent = newPassword.length === 0 || newPassword !== currentPassword;

    const canSubmit =
        currentPassword.length > 0 &&
        requirementsMet &&
        passwordsMatch &&
        isDifferentFromCurrent &&
        !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setError("");
        setSubmitting(true);

        try {
            await changePassword({ currentPassword, newPassword });
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1400);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Current password is incorrect. Please try again.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="cpm-backdrop">
            <div
                className="cpm-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cpm-title"
            >
                <button
                    type="button"
                    className="cpm-close"
                    aria-label="Close"
                    onClick={onClose}
                    disabled={submitting}
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                {success ? (
                    <div className="cpm-success">
                        <div className="cpm-success-icon">
                            <i className="bi bi-check-lg"></i>
                        </div>
                        <h5>Password changed</h5>
                        <p>Your password has been updated successfully.</p>
                    </div>
                ) : (
                    <>
                        <div className="cpm-header">
                            <div className="cpm-header-icon">
                                <i className="bi bi-shield-lock"></i>
                            </div>
                            <div>
                                <h5 id="cpm-title" className="cpm-title">Change Password</h5>
                                <p className="cpm-subtitle">Keep your account secure with a strong password.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="cpm-form">
                            {error && (
                                <div className="cpm-error">
                                    <i className="bi bi-exclamation-circle"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            <label className="cpm-field">
                                <span className="cpm-label">Current Password <span className="cpm-required">*</span></span>
                                <div className="cpm-input-wrap">
                                    <i className="bi bi-lock cpm-input-icon"></i>
                                    <input
                                        ref={firstInputRef}
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="cpm-toggle"
                                        onClick={() => setShowCurrent((s) => !s)}
                                        tabIndex={-1}
                                    >
                                        <i className={`bi ${showCurrent ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                            </label>

                            <label className="cpm-field">
                                <span className="cpm-label">New Password <span className="cpm-required">*</span></span>
                                <div className="cpm-input-wrap">
                                    <i className="bi bi-key cpm-input-icon"></i>
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="cpm-toggle"
                                        onClick={() => setShowNew((s) => !s)}
                                        tabIndex={-1}
                                    >
                                        <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>

                                {newPassword.length > 0 && (
                                    <div className="cpm-strength">
                                        <div className="cpm-strength-track">
                                            <div
                                                className="cpm-strength-fill"
                                                style={{ width: `${strength.percent}%`, background: strength.color }}
                                            ></div>
                                        </div>
                                        <span className="cpm-strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}

                                {!isDifferentFromCurrent && (
                                    <span className="cpm-hint cpm-hint-warn">
                                        New password must be different from your current password.
                                    </span>
                                )}
                            </label>

                            <ul className="cpm-requirements">
                                {REQUIREMENTS.map((req) => {
                                    const met = req.test(newPassword);
                                    return (
                                        <li key={req.label} className={met ? "met" : ""}>
                                            <i className={`bi ${met ? "bi-check-circle-fill" : "bi-circle"}`}></i>
                                            {req.label}
                                        </li>
                                    );
                                })}
                            </ul>

                            <label className="cpm-field">
                                <span className="cpm-label">Confirm New Password <span className="cpm-required">*</span></span>
                                <div className="cpm-input-wrap">
                                    <i className="bi bi-key cpm-input-icon"></i>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="cpm-toggle"
                                        onClick={() => setShowConfirm((s) => !s)}
                                        tabIndex={-1}
                                    >
                                        <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </button>
                                </div>
                                {confirmPassword.length > 0 && !passwordsMatch && (
                                    <span className="cpm-hint cpm-hint-warn">Passwords do not match.</span>
                                )}
                            </label>

                            <div className="cpm-actions">
                                <button
                                    type="button"
                                    className="cpm-btn cpm-btn-ghost"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="cpm-btn cpm-btn-primary"
                                    disabled={!canSubmit}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="cpm-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default ChangePasswordModal;