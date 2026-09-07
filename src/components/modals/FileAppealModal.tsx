import { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";

import { getStudentRecords } from "../../services/recordApi";
import type { StudentRecord } from "../../types/record";
import { getStudentAppeals, submitAppeal } from "../../services/appealApi";
import type { Appeal } from "../../types/appeal";
import { uploadAppealDocument } from "../../services/documentApi";

import "./FileAppealModal.css";

interface FileAppealModalProps {
    show: boolean;
    onClose: () => void;
    onFiled: () => void;
}

function FileAppealModal({ show, onClose, onFiled }: FileAppealModalProps) {
    const studentId = localStorage.getItem("username") || "";

    const [pendingRecords, setPendingRecords] = useState<StudentRecord[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [selectedRecordId, setSelectedRecordId] = useState("");
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [submitting, setSubmitting] = useState(false);
    const [submitStage, setSubmitStage] = useState<"idle" | "uploading" | "filing">("idle");
    const [submitError, setSubmitError] = useState("");
    const [hasFiled, setHasFiled] = useState(false);
    const [filedSuggestion, setFiledSuggestion] = useState<string | null>(null);

    useEffect(() => {
        if (!show) return;

        // Reset state each time the modal opens
        setSelectedRecordId("");
        setMessage("");
        setSelectedFile(null);
        setSubmitError("");
        setHasFiled(false);
        setFiledSuggestion(null);

        const fetchRecordsAndAppeals = async () => {
            try {
                setLoading(true);
                setLoadError("");

                if (!studentId) {
                    setLoadError("No logged-in student.");
                    return;
                }

                const [records, studentAppeals] = await Promise.all([
                    getStudentRecords(studentId),
                    getStudentAppeals(studentId),
                ]);

                setAppeals(studentAppeals);
                setPendingRecords(records.filter((r) => r.status?.toUpperCase() === "PENDING"));
            } catch (err) {
                console.error("Failed to fetch appeal data:", err);
                setLoadError("Failed to load your offenses.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecordsAndAppeals();
    }, [show, studentId]);

    if (!show) return null;

    const hasUnapprovedAppeal = (recordId: number) => {
        return appeals.some(
            (appeal) =>
                Number(appeal.record.recordId) === Number(recordId) &&
                appeal.status?.toUpperCase() !== "APPROVED"
        );
    };

    const selectedRecord = pendingRecords.find((r) => String(r.recordId) === selectedRecordId);

    const selectedRecordHasUnapprovedAppeal =
        selectedRecord !== undefined && hasUnapprovedAppeal(selectedRecord.recordId);

    const canSubmit =
        selectedRecord !== undefined &&
        !selectedRecordHasUnapprovedAppeal &&
        message.trim() !== "" &&
        selectedFile !== null &&
        !submitting;

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setSubmitError("");
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedRecord) {
            setSubmitError("Please select an offense to appeal.");
            return;
        }
        if (hasUnapprovedAppeal(selectedRecord.recordId)) {
            setSubmitError("You already have an appeal for this offense that has not been approved yet.");
            return;
        }
        if (!selectedFile) {
            setSubmitError("Please attach your appeal letter (scanned image, PDF, or DOCX).");
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");

            setSubmitStage("uploading");
            const uploadResult = await uploadAppealDocument(selectedFile);

            setSubmitStage("filing");
            await submitAppeal({
                recordId: selectedRecord.recordId,
                enrollmentId: selectedRecord.enrollment.enrollmentId,
                message: message.trim(),
                documentId: uploadResult.documentId,
            });

            setFiledSuggestion(uploadResult.aiSuggestion);
            setHasFiled(true);
        } catch (err) {
            console.error("Failed to submit appeal:", err);
            setSubmitError("Failed to submit appeal. Please try again.");
        } finally {
            setSubmitting(false);
            setSubmitStage("idle");
        }
    };

    const submitLabel =
        submitStage === "uploading" ? "Processing letter..." :
            submitStage === "filing" ? "Submitting appeal..." :
                "Submit Appeal";

    const handleOverlayClick = () => {
        if (submitting) return;
        onClose();
    };

    return (
        <div className="file-appeal-overlay" onClick={handleOverlayClick}>
            <div className="file-appeal-modal" onClick={(e) => e.stopPropagation()}>

                <div className="file-appeal-modal-header">
                    <h5>{hasFiled ? "Appeal Submitted" : "File a New Appeal"}</h5>
                    <button
                        type="button"
                        className="file-appeal-close-btn"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {hasFiled ? (
                    <div className="file-appeal-modal-body">

                        <p className="new-appeal-hint mb-4">
                            Your appeal has been filed and is now waiting for the Prefect's review.
                            {filedSuggestion
                                ? " Here's what our system noticed in your letter:"
                                : " Our system didn't generate a note for this letter."}
                        </p>

                        {filedSuggestion && (
                            <div className="ai-suggestion-card mb-4">
                                <div className="ai-suggestion-text">{filedSuggestion}</div>
                            </div>
                        )}

                        <p className="new-appeal-hint mb-0">
                            This is an automated note to help with the review, not a decision on your appeal.
                        </p>

                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="file-appeal-form">

                        <div className="file-appeal-modal-body">

                            {loadError && <p className="text-danger">{loadError}</p>}

                            <div className="file-appeal-section">
                                <div className="file-appeal-section-title">1. Select Offense</div>
                                <label className="new-appeal-section-label" htmlFor="offenseSelect">
                                    Select Offense to Appeal
                                </label>
                                <select
                                    id="offenseSelect"
                                    className="form-select new-appeal-select"
                                    value={selectedRecordId}
                                    onChange={(e) => {
                                        setSelectedRecordId(e.target.value);
                                        setSubmitError("");
                                    }}
                                    disabled={loading}
                                >
                                    <option value="" disabled>
                                        {loading ? "Loading offenses..." : "Tap to choose offense"}
                                    </option>
                                    {pendingRecords.map((record) => {
                                        const alreadyAppealed = hasUnapprovedAppeal(record.recordId);
                                        return (
                                            <option
                                                key={record.recordId}
                                                value={String(record.recordId)}
                                                disabled={alreadyAppealed}
                                            >
                                                {record.offense.offense} — filed {record.dateOfViolation}
                                                {alreadyAppealed ? " — Appeal Pending" : ""}
                                            </option>
                                        );
                                    })}
                                </select>
                                {!loading && pendingRecords.length === 0 && (
                                    <p className="new-appeal-hint mb-0 mt-2">
                                        You have no pending offenses available to appeal.
                                    </p>
                                )}
                                {!loading &&
                                    pendingRecords.length > 0 &&
                                    pendingRecords.every((record) => hasUnapprovedAppeal(record.recordId)) && (
                                        <p className="new-appeal-hint mb-0 mt-2">
                                            All of your pending offenses already have appeals that have not been approved yet.
                                        </p>
                                    )}
                            </div>

                            <div className="file-appeal-section">
                                <div className="file-appeal-section-title">2. Attach Appeal Letter</div>
                                <p className="new-appeal-hint mb-2">
                                    Attach a scanned/photographed copy of your handwritten letter, or upload a PDF/DOCX directly.
                                </p>

                                <div className="upload-box">
                                    <div className="upload-icon">
                                        <i className="bi bi-upload"></i>
                                    </div>
                                    <div className="upload-text">
                                        {selectedFile ? selectedFile.name : "No file attached yet"}
                                    </div>
                                    <div className="upload-subtext">
                                        PDF, DOCX, JPG, PNG &nbsp;•&nbsp; Max 10MB per file
                                    </div>
                                    <button type="button" className="upload-browse-btn" onClick={handleBrowseClick}>
                                        Browse Files
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                                        className="d-none"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="file-appeal-section">
                                <div className="file-appeal-section-title">3. Reason for Appeal</div>
                                <p className="new-appeal-hint mb-2">
                                    Explain why you believe this offense should be reviewed.
                                </p>
                                <textarea
                                    id="appealMessage"
                                    className="form-control"
                                    rows={4}
                                    placeholder="Type your appeal here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            {selectedRecordHasUnapprovedAppeal && (
                                <p className="text-danger">
                                    You already have an appeal for this offense that has not been approved yet.
                                </p>
                            )}

                            {submitError && <p className="text-danger">{submitError}</p>}

                        </div>

                        <div className="file-appeal-modal-footer">
                            <button
                                type="button"
                                className="file-appeal-cancel-btn"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="submit-appeal-btn" disabled={!canSubmit}>
                                {submitLabel}
                            </button>
                        </div>

                    </form>
                )}

                {hasFiled && (
                    <div className="file-appeal-modal-footer">
                        <button
                            type="button"
                            className="submit-appeal-btn"
                            onClick={onFiled}
                        >
                            View My Appeals
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default FileAppealModal;