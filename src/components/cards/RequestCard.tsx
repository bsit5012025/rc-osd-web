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

function formatDate(dateString?: string | null): string {
    if (!dateString) return dateString ?? "";

    const isoParts = dateString.split("-");
    if (isoParts.length === 3 && isoParts[0].length === 4) {
        const [year, month, day] = isoParts;
        return `${month}/${day}/${year}`;
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}/${date.getFullYear()}`;
}

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
                            Reviewed {formatDate(dateProcessed)}
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
                Submitted {formatDate(dateFiled)}
            </div>

        </div>
    );
}

export default RequestCard;