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
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreviewUrl(null);
    }, [selectedFile]);

    const [submitting, setSubmitting] = useState(false);
    const [submitStage, setSubmitStage] = useState<"idle" | "uploading" | "filing">("idle");
    const [submitError, setSubmitError] = useState("");
    const [hasFiled, setHasFiled] = useState(false);

    useEffect(() => {
        if (!show) return;

        setSelectedRecordId("");
        setMessage("");
        setSelectedFile(null);
        setSubmitError("");
        setHasFiled(false);

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

    // The status of whichever not-yet-approved appeal is currently blocking
    // re-filing for this record, or null if nothing is blocking it. Used to
    // give DENIED a more specific explanation than PENDING: a denied appeal
    // is a closed-door policy (visit OSD in person), not just "wait and see."
    const blockingAppealStatus = (recordId: number): string | null => {
        const blocking = appeals.find(
            (appeal) =>
                Number(appeal.record.recordId) === Number(recordId) &&
                appeal.status?.toUpperCase() !== "APPROVED"
        );
        return blocking?.status?.toUpperCase() ?? null;
    };

    const selectedRecord = pendingRecords.find((r) => String(r.recordId) === selectedRecordId);

    const selectedRecordHasUnapprovedAppeal =
        selectedRecord !== undefined && hasUnapprovedAppeal(selectedRecord.recordId);

    const selectedRecordWasDenied =
        selectedRecord !== undefined && blockingAppealStatus(selectedRecord.recordId) === "DENIED";

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

    const handleScanClick = () => {
        cameraInputRef.current?.click();
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
        submitStage === "uploading" ? "Uploading letter..." :
            submitStage === "filing" ? "Submitting appeal..." :
                "Submit Appeal";

    return (
        <div className="file-appeal-overlay">
            <div className="file-appeal-modal" onClick={(e) => e.stopPropagation()}>

                <div className="file-appeal-modal-header">
                    <div className="file-appeal-header-left">
                        <div className={`file-appeal-header-icon ${hasFiled ? "success" : ""}`}>
                            <i className={`bi ${hasFiled ? "bi-check-lg" : "bi-file-earmark-text"}`}></i>
                        </div>
                        <h5>{hasFiled ? "Appeal Submitted" : "File a New Appeal"}</h5>
                    </div>
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

                        <div className="file-appeal-success-icon">
                            <i className="bi bi-check-lg"></i>
                        </div>

                        <p className="new-appeal-hint mb-0">
                            Request sent to Desktop (Prefect). You can leave this page now.
                        </p>

                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="file-appeal-form">

                        <div className="file-appeal-modal-body">

                            {loadError && <p className="text-danger">{loadError}</p>}

                            <div className="file-appeal-section">
                                <div className="file-appeal-section-title">
                                    <span className="file-appeal-step-num">1</span>
                                    Select Offense
                                </div>
                                <label className="new-appeal-section-label" htmlFor="offenseSelect">
                                    Select Offense to Appeal <span className="required-asterisk">*</span>
                                </label>
                                <select
                                    id="offenseSelect"
                                    className="form-select new-appeal-select"
                                    value={selectedRecordId}
                                    onChange={(e) => {
                                        setSelectedRecordId(e.target.value);
                                        setSubmitError("");
                                    }}
                                    disabled={loading || submitting}
                                >
                                    <option value="" disabled>
                                        {loading ? "Loading offenses..." : "Tap to choose offense"}
                                    </option>
                                    {pendingRecords.map((record) => {
                                        const blockingStatus = blockingAppealStatus(record.recordId);
                                        const isDenied = blockingStatus === "DENIED";
                                        const isBlocked = blockingStatus !== null;
                                        const label = isDenied
                                            ? `${record.offense.offense} — filed ${record.dateOfViolation} (Appeal denied — visit OSD in person)`
                                            : isBlocked
                                                ? `${record.offense.offense} — filed ${record.dateOfViolation} (Appeal pending)`
                                                : `${record.offense.offense} — filed ${record.dateOfViolation}`;
                                        return (
                                            <option
                                                key={record.recordId}
                                                value={String(record.recordId)}
                                                disabled={isBlocked}
                                            >
                                                {label}
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
                                            {pendingRecords.every((record) => blockingAppealStatus(record.recordId) === "DENIED")
                                                ? "This appeal was denied. To contest it further, please visit the Office of Student Discipline in person."
                                                : "All of your pending offenses already have appeals that have not been approved yet."}
                                        </p>
                                    )}
                            </div>

                            <div className="file-appeal-section">
                                <div className="file-appeal-section-title">
                                    <span className="file-appeal-step-num">2</span>
                                    Attach Appeal Letter <span className="required-asterisk">*</span>
                                </div>
                                <p className="new-appeal-hint mb-2">
                                    Attach a scanned/photographed copy of your handwritten letter, or upload a PDF/DOCX directly.
                                </p>

                                <div className={`upload-box ${selectedFile ? "has-file" : ""}`}>
                                    <div className={`upload-icon ${selectedFile ? "success" : ""}`}>
                                        <i className={`bi ${selectedFile ? "bi-check-circle-fill" : "bi-upload"}`}></i>
                                    </div>
                                    <div className="upload-text">
                                        {selectedFile ? selectedFile.name : "No file attached yet"}
                                    </div>
                                    <div className="upload-subtext">
                                        {selectedFile
                                            ? formatFileSize(selectedFile.size)
                                            : <>PDF, DOCX, JPG, PNG &nbsp;•&nbsp; Max 10MB per file</>}
                                    </div>
                                    <div className="upload-actions">
                                        <button
                                            type="button"
                                            className="upload-browse-btn"
                                            onClick={handleBrowseClick}
                                            disabled={submitting}
                                        >
                                            {selectedFile ? "Replace File" : "Browse Files"}
                                        </button>
                                        <button
                                            type="button"
                                            className="upload-browse-btn"
                                            onClick={handleScanClick}
                                            disabled={submitting}
                                        >
                                            <i className="bi bi-camera"></i> Scan with Camera
                                        </button>
                                        {selectedFile && (
                                            <button
                                                type="button"
                                                className="upload-remove-btn"
                                                onClick={handleRemoveFile}
                                                disabled={submitting}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    {previewUrl && (
                                        <img
                                            src={previewUrl}
                                            alt="Letter preview"
                                            style={{ maxWidth: "100%", maxHeight: 220, marginTop: 12, borderRadius: 8 }}
                                        />
                                    )}
                                    <input
                                        ref={cameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="d-none"
                                        onChange={handleFileChange}
                                        disabled={submitting}
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,image/*"
                                        className="d-none"
                                        onChange={handleFileChange}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="file-appeal-section">
                                <div className="file-appeal-section-title">
                                    <span className="file-appeal-step-num">3</span>
                                    Reason for Appeal <span className="required-asterisk">*</span>
                                </div>
                                <p className="new-appeal-hint mb-2">
                                    Explain why you believe this offense should be reviewed.
                                </p>
                                <textarea
                                    id="appealMessage"
                                    className="form-control new-appeal-textarea"
                                    rows={4}
                                    placeholder="Type your appeal here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={submitting}
                                />
                            </div>

                            {selectedRecordHasUnapprovedAppeal && (
                                <p className="text-danger">
                                    {selectedRecordWasDenied
                                        ? "This appeal was denied. To contest it further, please visit the Office of Student Discipline in person."
                                        : "You already have an appeal for this offense that has not been approved yet."}
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