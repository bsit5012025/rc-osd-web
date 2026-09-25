import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import axios from "axios";

import { submitRequest } from "../../services/requestApi";
import type { RequestItem } from "../../types/request";

import SearchableDropdown from "./SearchableDropdown";

import "./FileDeptHeadRequestModal.css";

type ScopeType = "By Student" | "By Section" | "By Batch";

interface FileDeptHeadRequestModalProps {
    show: boolean;
    onClose: () => void;
    onFiled: () => void;
}

// TODO: replace these with real data (student IDs, sections, batches/levels)
// once fetching is wired up. Kept as plain arrays for now so the dropdown
// UI/behavior can be reviewed on its own first.
const PLACEHOLDER_STUDENT_OPTIONS = ["JHS-0046", "JHS-0102", "SHS-0017", "SHS-0088"];
const PLACEHOLDER_SECTION_OPTIONS = ["St. Augustine", "St. Benedict", "St. Cecilia", "St. Dominic"];
const PLACEHOLDER_BATCH_OPTIONS = ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

function FileDeptHeadRequestModal({ show, onClose, onFiled }: FileDeptHeadRequestModalProps) {

    const [scopeType, setScopeType] = useState<ScopeType>("By Section");
    const [details, setDetails] = useState("");
    const [message, setMessage] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [hasFiled, setHasFiled] = useState(false);
    const [submittedRequest, setSubmittedRequest] = useState<RequestItem | null>(null);

    useEffect(() => {
        if (!show) return;

        setScopeType("By Section");
        setDetails("");
        setMessage("");
        setSubmitError("");
        setHasFiled(false);
        setSubmittedRequest(null);
    }, [show]);

    if (!show) return null;

    const detailsLabel =
        scopeType === "By Student"
            ? "Student ID"
            : scopeType === "By Section"
                ? "Section"
                : "Grade/Level or Batch";

    const detailsPlaceholder =
        scopeType === "By Student"
            ? "e.g. JHS-0046"
            : scopeType === "By Section"
                ? "e.g. St. Augustine"
                : "e.g. Grade 10";

    const currentOptions =
        scopeType === "By Student"
            ? PLACEHOLDER_STUDENT_OPTIONS
            : scopeType === "By Section"
                ? PLACEHOLDER_SECTION_OPTIONS
                : PLACEHOLDER_BATCH_OPTIONS;

    const handleScopeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setScopeType(e.target.value as ScopeType);
        // Clear the selection since the available options change with scope.
        setDetails("");
    };

    const canSubmit =
        details.trim() !== "" &&
        message.trim() !== "" &&
        !submitting;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!canSubmit) {
            setSubmitError("Please fill in both fields before submitting.");
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");

            const submitted = await submitRequest({
                type: scopeType,
                details: details.trim(),
                message: message.trim(),
            });

            setSubmittedRequest(submitted);
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
                            {submittedRequest?.aiResponse
                                ? " Here's what our system noticed:"
                                : ""}
                        </p>

                        {submittedRequest?.aiResponse && (
                            <div className="request-ai-suggestion-card mb-4">
                                <div className="request-ai-suggestion-icon">
                                    <i className="bi bi-stars"></i>
                                </div>
                                <div className="request-ai-suggestion-text">
                                    {submittedRequest.aiResponse}
                                </div>
                            </div>
                        )}

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
                                    Request Scope
                                </div>
                                <label className="new-request-section-label" htmlFor="scopeType">
                                    Request Scope <span className="required-asterisk">*</span>
                                </label>
                                <p className="new-request-hint mb-2">
                                    Choose whether you're requesting records for a specific student, or by group.
                                </p>
                                <select
                                    id="scopeType"
                                    className="form-select new-request-select"
                                    value={scopeType}
                                    onChange={handleScopeChange}
                                    disabled={submitting}
                                >
                                    <option value="By Student">By Student</option>
                                    <option value="By Section">By Section</option>
                                    <option value="By Batch">By Batch / Grade Level</option>
                                </select>
                            </div>

                            <div className="file-request-section">
                                <div className="file-request-section-title">
                                    <span className="file-request-step-num">2</span>
                                    {detailsLabel} <span className="required-asterisk">*</span>
                                </div>
                                <SearchableDropdown
                                    id="requestDetails"
                                    value={details}
                                    onChange={setDetails}
                                    options={currentOptions}
                                    placeholder={detailsPlaceholder}
                                    disabled={submitting}
                                    emptyLabel={`No matching ${detailsLabel.toLowerCase()} found`}
                                />
                            </div>

                            <div className="file-request-section">
                                <div className="file-request-section-title">
                                    <span className="file-request-step-num">3</span>
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