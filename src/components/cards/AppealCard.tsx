import "./AppealCard.css";
import "./OffenseCard.css";

type AppealStatus = "Pending" | "Approved" | "Denied";

interface AppealCardProps {
    appealId: string;
    title: string;
    status: AppealStatus;
    dateSubmitted: string;
    offenseType?: string;
    prefectName?: string;
    prefectInitials?: string;
    remarks?: string;
    idLabel?: string;
    reviewerRoleLabel?: string;
    awaitingTitle?: string;
    awaitingText?: string;
}

const STATUS_ACCENTS: Record<string, string> = {
    pending: "#E1AD01",
    approved: "#1f8a3d",
    denied: "#c62828",
};

function AppealCard({
    appealId,
    title,
    status,
    dateSubmitted,
    offenseType,
    prefectName,
    prefectInitials,
    remarks,
    idLabel = "APPEAL ID",
    reviewerRoleLabel = "Prefect of Discipline",
    awaitingTitle = "Awaiting Review",
    awaitingText = "The prefect hasn't responded yet. You'll be notified once a decision is made.",
}: AppealCardProps) {

    const statusClass = status.toLowerCase();
    const accentColor = STATUS_ACCENTS[statusClass] ?? "#94a3b8";

    return (
        <div
            className="appeal-card mb-3"
            style={{ ["--appeal-accent" as string]: accentColor } as React.CSSProperties}
        >

            <div className="appeal-card-header">
                <span className="appeal-card-id">{idLabel}: {appealId}</span>
                <span className={`appeal-status-badge ${statusClass}`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <h5 className="appeal-card-title">{title}</h5>

            {offenseType && (
                <span className={`level-badge ${offenseType.toLowerCase()} appeal-offense-type-badge`}>
                    {offenseType}
                </span>
            )}

            {status === "Pending" && (
                <div className="appeal-awaiting-box">
                    <div className="appeal-awaiting-title">{awaitingTitle}</div>
                    <p className="appeal-awaiting-text">
                        {awaitingText}
                    </p>
                </div>
            )}

            {status !== "Pending" && (
                <div className="appeal-prefect-box">
                    <div className="appeal-prefect-header">
                        <div className="appeal-prefect-avatar">{prefectInitials}</div>
                        <div>
                            <div className="appeal-prefect-name">{prefectName}</div>
                            <div className="appeal-prefect-role">{reviewerRoleLabel}</div>
                        </div>
                    </div>

                    <div className="appeal-remarks-label">Remarks:</div>
                    <p className="appeal-remarks-text">{remarks}</p>
                </div>
            )}

            <div className="appeal-card-date">
                <i className="bi bi-calendar3"></i>
                Submitted {dateSubmitted}
            </div>

        </div>
    );
}

export default AppealCard;