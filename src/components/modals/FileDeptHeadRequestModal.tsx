import { useEffect, useState, FormEvent } from "react";
import axios from "axios";

import { submitRequest, getMyDepartmentName } from "../../services/requestApi";
import { getActiveStudentsByDepartment, type Student } from "../../services/studentApi";

import StudentMultiPicker from "./StudentMultiPicker";

import "./FileDeptHeadRequestModal.css";

interface FileDeptHeadRequestModalProps {
    show: boolean;
    onClose: () => void;
    onFiled: () => void;
}

function FileDeptHeadRequestModal({ show, onClose, onFiled }: FileDeptHeadRequestModalProps) {

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [message, setMessage] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState<"HARDCOPY" | "EMAIL">("HARDCOPY");
    const [deliveryEmail, setDeliveryEmail] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [hasFiled, setHasFiled] = useState(false);

    useEffect(() => {
        if (!show) return;

        setSelectedIds([]);
        setMessage("");
        setDeliveryMethod("HARDCOPY");
        setDeliveryEmail("");
        setSubmitError("");
        setHasFiled(false);

        let cancelled = false;

        const loadStudents = async () => {
            try {
                setLoadingStudents(true);
                const department = await getMyDepartmentName();
                const list = await getActiveStudentsByDepartment(department);
                if (!cancelled) setStudents(list);
            } catch (err) {
                console.error("Failed to load students:", err);
                if (!cancelled) {
                    setStudents([]);
                    setSubmitError("Could not load the student list. Please try again.");
                }
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        };

        loadStudents();

        return () => {
            cancelled = true;
        };
    }, [show]);

    if (!show) return null;

    const emailValid = /^[a-z0-9._%+-]+@gmail\.com$/i.test(deliveryEmail.trim());

    const canSubmit =
        selectedIds.length > 0 &&
        message.trim() !== "" &&
        (deliveryMethod !== "EMAIL" || emailValid) &&
        !submitting;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            setSubmitError(
                deliveryMethod === "EMAIL" && !emailValid
                    ? "Enter a valid Gmail address (example@gmail.com) to receive the result."
                    : "Select at least one student and enter a reason before submitting."
            );
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");

            await submitRequest({
                type: "By Student",
                details: selectedIds.join(", "),
                message: message.trim(),
                deliveryMethod,
                deliveryEmail: deliveryMethod === "EMAIL" ? deliveryEmail.trim().toLowerCase() : undefined,
            });

            setHasFiled(true);
        } catch (err) {
            console.error("Failed to submit request:", err);

            if (axios.isAxiosError(err)) {
                const backendMessage = err.response?.data?.message;

                if (typeof backendMessage === "string" && backendMessage.trim() !== "") {
                    setSubmitError(backendMessage);
                } else {
                    setSubmitError("Failed to submit request. Please try again.");
                }
            } else {
                setSubmitError("Failed to submit request. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="file-request-overlay">
            <div className="file-request-modal" onClick={(e) => e.stopPropagation()}>

                <div className="file-request-modal-header">
                    <div className="file-request-header-left">
                        <div className={`file-request-header-icon ${hasFiled ? "success" : ""}`}>
                            <i className={`bi ${hasFiled ? "bi-check-lg" : "bi-inbox"}`}></i>
                        </div>
                        <h5>{hasFiled ? "Request Submitted" : "File a New Request"}</h5>
                    </div>
                    <button
                        type="button"
                        className="file-request-close-btn"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {hasFiled ? (
                    <div className="file-request-modal-body">

                        <div className="file-request-success-icon">
                            <i className="bi bi-check-lg"></i>
                        </div>

                        <p className="new-request-hint mb-4">
                            Your request has been filed and is now waiting for the Prefect's approval.
                        </p>

                        <p className="new-request-hint mb-0">
                            You'll be able to track its status from your Requests page.
                        </p>

                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="file-request-form">

                        <div className="file-request-modal-body">

                            <div className="file-request-section">
                                <div className="file-request-section-title">
                                    <span className="file-request-step-num">1</span>
                                    Students <span className="required-asterisk">*</span>
                                </div>
                                <p className="new-request-hint mb-2">
                                    Search by name or ID and add one or more students from your department.
                                </p>
                                <StudentMultiPicker
                                    id="requestStudents"
                                    students={students}
                                    selectedIds={selectedIds}
                                    onChange={setSelectedIds}
                                    loading={loadingStudents}
                                    disabled={submitting}
                                />
                            </div>

                            <div className="file-request-section">
                                <div className="file-request-section-title">
                                    <span className="file-request-step-num">2</span>
                                    Reason for Request <span className="required-asterisk">*</span>
                                </div>
                                <p className="new-request-hint mb-2">
                                    Explain why you're requesting these disciplinary records.
                                </p>
                                <textarea
                                    id="requestMessage"
                                    className="form-control new-request-textarea"
                                    rows={4}
                                    placeholder="Type your request here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={500}
                                    disabled={submitting}
                                />
                            </div>

                            <div className="file-request-section">
                                <div className="file-request-section-title">
                                    <span className="file-request-step-num">3</span>
                                    How do you want to receive the result? <span className="required-asterisk">*</span>
                                </div>
                                <div className="delivery-method-options">
                                    <label className={`delivery-method-option ${deliveryMethod === "HARDCOPY" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="HARDCOPY"
                                            checked={deliveryMethod === "HARDCOPY"}
                                            onChange={() => setDeliveryMethod("HARDCOPY")}
                                            disabled={submitting}
                                        />
                                        <i className="bi bi-file-earmark-text"></i>
                                        Hardcopy
                                    </label>
                                    <label className={`delivery-method-option ${deliveryMethod === "EMAIL" ? "selected" : ""}`}>
                                        <input
                                            type="radio"
                                            name="deliveryMethod"
                                            value="EMAIL"
                                            checked={deliveryMethod === "EMAIL"}
                                            onChange={() => setDeliveryMethod("EMAIL")}
                                            disabled={submitting}
                                        />
                                        <i className="bi bi-envelope"></i>
                                        Email
                                    </label>
                                </div>

                                {deliveryMethod === "EMAIL" && (
                                    <div className="mt-3">
                                        <label htmlFor="deliveryEmail" className="form-label">
                                            Your Gmail address <span className="required-asterisk">*</span>
                                        </label>
                                        <input
                                            id="deliveryEmail"
                                            type="email"
                                            className={`form-control ${deliveryEmail && !emailValid ? "is-invalid" : ""}`}
                                            placeholder="example@gmail.com"
                                            value={deliveryEmail}
                                            onChange={(e) => setDeliveryEmail(e.target.value)}
                                            maxLength={254}
                                            disabled={submitting}
                                        />
                                        {deliveryEmail && !emailValid && (
                                            <div className="invalid-feedback">Enter a valid @gmail.com address.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {submitError && <p className="text-danger">{submitError}</p>}

                        </div>

                        <div className="file-request-modal-footer">
                            <button
                                type="button"
                                className="file-request-cancel-btn"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="submit-request-btn" disabled={!canSubmit}>
                                {submitting ? "Checking records..." : "Submit Request"}
                            </button>
                        </div>

                    </form>
                )}

                {hasFiled && (
                    <div className="file-request-modal-footer">
                        <button
                            type="button"
                            className="submit-request-btn"
                            onClick={onFiled}
                        >
                            View My Requests
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default FileDeptHeadRequestModal;
