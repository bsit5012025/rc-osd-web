import { useEffect, useRef, useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";
import { getStudentAppeals, submitAppeal } from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";
import { uploadAppealDocument } from "../../../services/documentApi";

import "./fileAppealPage.css";

function FileAppealPage() {
    const navigate = useNavigate();
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
    }, [studentId]);

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

            // Show what the AI Support Module noticed in the letter before
            // moving on -- this is an informational note, not a decision;
            // the appeal itself is already filed and waiting on the Prefect
            // either way.
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

    if (hasFiled) {
        return (
            <div className="new-appeal-page">
                <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
                    <div className="new-appeal-content">

                        <div className="new-appeal-header mb-4">
                            <h5 className="new-appeal-title">Appeal Submitted</h5>
                        </div>

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

                        <p className="new-appeal-hint mb-4">
                            This is an automated note to help with the review, not a decision on your appeal.
                        </p>

                        <button
                            type="button"
                            className="submit-appeal-btn"
                            onClick={() => navigate("/appeals")}
                        >
                            View My Appeals
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="new-appeal-page">
            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
                <div className="new-appeal-content">

                    <div className="new-appeal-header mb-4">
                        <Link to="/appeals" className="new-appeal-back">
                            <i className="bi bi-chevron-left"></i>
                        </Link>
                        <h5 className="new-appeal-title">File a New Appeal</h5>
                    </div>

                    {loadError && <p className="text-danger">{loadError}</p>}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-4">
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

                        <div className="mb-4">
                            <label className="new-appeal-section-label">Appeal Letter</label>
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

                        <div className="mb-4">
                            <label className="new-appeal-section-label" htmlFor="appealMessage">
                                Reason for Appeal
                            </label>
                            <p className="new-appeal-hint mb-2">
                                Explain why you believe this offense should be reviewed.
                            </p>
                            <textarea
                                id="appealMessage"
                                className="form-control"
                                rows={5}
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

                        <button type="submit" className="submit-appeal-btn" disabled={!canSubmit}>
                            {submitLabel}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}

export default FileAppealPage;
