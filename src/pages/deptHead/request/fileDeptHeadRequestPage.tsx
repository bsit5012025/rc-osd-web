import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { submitRequest } from "../../../services/requestApi";
import type { RequestItem } from "../../../types/request";

import "../../student/appeal/fileAppealPage.css";

type ScopeType = "By Student" | "By Section" | "By Batch";

function FileDeptHeadRequestPage() {
    const navigate = useNavigate();

    const [scopeType, setScopeType] =
        useState<ScopeType>("By Section");

    const [details, setDetails] =
        useState("");

    const [message, setMessage] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);

    const [submitError, setSubmitError] =
        useState("");

    const [hasFiled, setHasFiled] =
        useState(false);

    const [submittedRequest, setSubmittedRequest] =
        useState<RequestItem | null>(null);

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

    const canSubmit =
        details.trim() !== ""
        && message.trim() !== ""
        && !submitting;

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault();

        if (!canSubmit) {
            setSubmitError(
                "Please fill in both fields before submitting."
            );
            return;
        }

        try {

            setSubmitting(true);
            setSubmitError("");

            const submitted =
                await submitRequest({
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

            if (
                typeof backendMessage === "string" &&
                backendMessage.trim() !== ""
            ) {
                setSubmitError(backendMessage);
            } else {
                setSubmitError(
                    "Failed to submit request. Please try again."
                );
            }

        } else {

            setSubmitError(
                "Failed to submit request. Please try again."
            );
        }

    } finally {
        setSubmitting(false);
    }

};

    if (hasFiled) {

        return (
            <div className="new-appeal-page">

                <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                    <div className="new-appeal-content">

                        <div className="new-appeal-header mb-4">

                            <h5 className="new-appeal-title">
                                Request Submitted
                            </h5>

                        </div>

                        <p className="new-appeal-hint mb-4">
                            Your request has been filed and is now
                            waiting for the Prefect's approval.
                            You'll be able to track its status from
                            your Requests page.
                        </p>

                        {submittedRequest?.aiResponse && (
                            <div className="alert alert-light border mb-4">

                                <div className="fw-bold mb-2">
                                    AI Support Response
                                </div>

                                <p className="mb-0">
                                    {submittedRequest.aiResponse}
                                </p>

                            </div>
                        )}

                        <button
                            type="button"
                            className="submit-appeal-btn"
                            onClick={() =>
                                navigate("/depthead/requests")
                            }
                        >
                            View My Requests
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

                        <Link
                            to="/depthead/requests"
                            className="new-appeal-back"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </Link>

                        <h5 className="new-appeal-title">
                            File a New Request
                        </h5>

                    </div>

                    <form onSubmit={handleSubmit}>

                        { }
                        <div className="mb-4">

                            <label
                                className="new-appeal-section-label"
                                htmlFor="scopeType"
                            >
                                Request Scope
                            </label>

                            <p className="new-appeal-hint mb-2">
                                Choose whether you're requesting
                                records for a specific student,
                                or by group.
                            </p>

                            <select
                                id="scopeType"
                                className="form-select new-appeal-select"
                                value={scopeType}
                                onChange={(e) => setScopeType(e.target.value as ScopeType)}
                            >
                                <option value="By Student">By Student</option>
                                <option value="By Section">By Section</option>
                                <option value="By Batch">By Batch / Grade Level</option>
                            </select>

                        </div>

                        { }
                        <div className="mb-4">

                            <label
                                className="new-appeal-section-label"
                                htmlFor="requestDetails"
                            >
                                {detailsLabel}
                            </label>

                            <input
                                id="requestDetails"
                                type="text"
                                className="form-control new-appeal-select"
                                placeholder={detailsPlaceholder}
                                value={details}
                                onChange={(e) =>
                                    setDetails(e.target.value)
                                }
                                maxLength={100}
                            />

                        </div>

                        { }
                        <div className="mb-4">

                            <label
                                className="new-appeal-section-label"
                                htmlFor="requestMessage"
                            >
                                Reason for Request
                            </label>

                            <p className="new-appeal-hint mb-2">
                                Explain why you're requesting
                                these disciplinary records.
                            </p>

                            <textarea
                                id="requestMessage"
                                className="form-control"
                                rows={5}
                                placeholder="Type your request here..."
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                maxLength={500}
                            />

                        </div>

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
                            {submitting ? "Checking records..." : "Submit Request"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default FileDeptHeadRequestPage;