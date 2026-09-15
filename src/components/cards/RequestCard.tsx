import "./RequestCard.css";

type RequestStatus = "Pending" | "Approved" | "Denied";

interface RequestCardProps {
    requestId: string;
    type: string;
    details: string;
    message: string;
    status: RequestStatus;
    dateFiled: string;
    dateProcessed?: string | null;
    aiResponse?: string | null;
    remarks?: string | null;
    reviewerRoleLabel?: string;
    awaitingTitle?: string;
    awaitingText?: string;
}

const STATUS_ACCENTS: Record<string, string> = {
    pending: "#E1AD01",
    approved: "#1f8a3d",
    denied: "#c62828",
};

function RequestCard({
    requestId,
    type,
    details,
    message,
    status,
    dateFiled,
    dateProcessed,
    aiResponse,
    remarks,
    awaitingTitle = "Awaiting Review",
    awaitingText = "Your request hasn't been reviewed yet. You'll be notified once a decision is made.",
}: RequestCardProps) {

    const statusClass = status.toLowerCase();
    const accentColor = STATUS_ACCENTS[statusClass] ?? "#94a3b8";

    return (
        <div
            className="request-card mb-3"
            style={{ ["--request-accent" as string]: accentColor } as React.CSSProperties}
        >

            <div className="request-card-header">
                <span className="request-card-id">REQUEST ID: {requestId}</span>
                <span className={`request-status-badge ${statusClass}`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <h5 className="request-card-title">{type}</h5>

            {details && (
                <p className="request-card-details">
                    <i className="bi bi-info-circle"></i>
                    {details}
                </p>
            )}

            {message && (
                <p className="request-card-message">{message}</p>
            )}

            {status === "Pending" && (
                <div className="request-awaiting-box">
                    <div className="request-awaiting-title">{awaitingTitle}</div>
                    <p className="request-awaiting-text">
                        {awaitingText}
                    </p>
                </div>
            )}

            {status !== "Pending" && (
                <div className="request-reviewer-box">
                    <div className="request-remarks-label">Remarks:</div>
                    <p className="request-remarks-text">
                        {remarks || "No remarks provided."}
                    </p>
                    {dateProcessed && (
                        <div className="request-processed-date">
                            <i className="bi bi-calendar-check"></i>
                            Reviewed {dateProcessed}
                        </div>
                    )}
                </div>
            )}

            {aiResponse && (
                <div className="request-ai-note">
                    <div className="request-ai-note-icon">
                        <i className="bi bi-stars"></i>
                    </div>
                    <div className="request-ai-note-text">{aiResponse}</div>
                </div>
            )}

            <div className="request-card-date">
                <i className="bi bi-calendar3"></i>
                Submitted {dateFiled}
            </div>

        </div>
    );
}

export default RequestCard;