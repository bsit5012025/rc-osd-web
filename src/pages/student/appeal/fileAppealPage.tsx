import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getStudentRecords } from "../../../services/recordApi";
import type { StudentRecord } from "../../../types/record";

import {
    getStudentAppeals,
    submitAppeal,
} from "../../../services/appealApi";
import type { Appeal } from "../../../types/appeal";

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
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

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

                setPendingRecords(
                    records.filter(
                        (record) =>
                            record.status?.toUpperCase() === "PENDING"
                    )
                );
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

    const selectedRecord = pendingRecords.find(
        (record) => String(record.recordId) === selectedRecordId
    );

    const selectedRecordHasUnapprovedAppeal =
        selectedRecord !== undefined &&
        hasUnapprovedAppeal(selectedRecord.recordId);

    const canSubmit =
        selectedRecord !== undefined &&
        !selectedRecordHasUnapprovedAppeal &&
        message.trim() !== "" &&
        !submitting;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedRecord) {
            setSubmitError("Please select an offense to appeal.");
            return;
        }

        if (hasUnapprovedAppeal(selectedRecord.recordId)) {
            setSubmitError(
                "You already have an appeal for this offense that has not been approved yet."
            );
            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");

            await submitAppeal({
                recordId: selectedRecord.recordId,
                enrollmentId: selectedRecord.enrollment.enrollmentId,
                message: message.trim(),
            });

            navigate("/appeals");
        } catch (err) {
            console.error("Failed to submit appeal:", err);

            setSubmitError(
                "Failed to submit appeal. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="new-appeal-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <div className="new-appeal-content">

                    <div className="new-appeal-header mb-4">

                        <Link
                            to="/appeals"
                            className="new-appeal-back"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </Link>

                        <h5 className="new-appeal-title">
                            File a New Appeal
                        </h5>

                    </div>

                    {loadError && (
                        <p className="text-danger">
                            {loadError}
                        </p>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="mb-4">

                            <label
                                className="new-appeal-section-label"
                                htmlFor="offenseSelect"
                            >
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
                                    {loading
                                        ? "Loading offenses..."
                                        : "Tap to choose offense"}
                                </option>

                                {pendingRecords.map((record) => {
                                    const alreadyAppealed =
                                        hasUnapprovedAppeal(
                                            record.recordId
                                        );

                                    return (
                                        <option
                                            key={record.recordId}
                                            value={String(record.recordId)}
                                            disabled={alreadyAppealed}
                                        >
                                            {record.offense.offense}
                                            {" — filed "}
                                            {record.dateOfViolation}
                                            {alreadyAppealed
                                                ? " — Appeal Pending"
                                                : ""}
                                        </option>
                                    );
                                })}
                            </select>

                            {!loading &&
                                pendingRecords.length === 0 && (
                                    <p className="new-appeal-hint mb-0 mt-2">
                                        You have no pending offenses
                                        available to appeal.
                                    </p>
                                )}

                            {!loading &&
                                pendingRecords.length > 0 &&
                                pendingRecords.every((record) =>
                                    hasUnapprovedAppeal(
                                        record.recordId
                                    )
                                ) && (
                                    <p className="new-appeal-hint mb-0 mt-2">
                                        All of your pending offenses
                                        already have appeals that
                                        have not been approved yet.
                                    </p>
                                )}

                        </div>

                        <div className="mb-4">

                            <label
                                className="new-appeal-section-label"
                                htmlFor="appealMessage"
                            >
                                Reason for Appeal
                            </label>

                            <p className="new-appeal-hint mb-2">
                                Explain why you believe this offense
                                should be reviewed.
                            </p>

                            <textarea
                                id="appealMessage"
                                className="form-control"
                                rows={5}
                                placeholder="Type your appeal here..."
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                            />

                        </div>

                        {selectedRecordHasUnapprovedAppeal && (
                            <p className="text-danger">
                                You already have an appeal for this
                                offense that has not been approved yet.
                            </p>
                        )}

                        {submitError && (
                            <p className="text-danger">
                                {submitError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="submit-appeal-btn"
                            disabled={!canSubmit}
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Appeal"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default FileAppealPage;