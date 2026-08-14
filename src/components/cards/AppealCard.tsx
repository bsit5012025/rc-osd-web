import "./AppealCard.css";

type AppealStatus = "Pending" | "Approved" | "Denied";

interface AppealCardProps {
    appealId: string;
    title: string;
    status: AppealStatus;
    dateSubmitted: string;
    prefectName?: string;
    prefectInitials?: string;
    remarks?: string;
}

function AppealCard({
    appealId,
    title,
    status,
    dateSubmitted,
    prefectName,
    prefectInitials,
    remarks,
}: AppealCardProps) {

    const statusClass = status.toLowerCase();

    return (
        <div className="appeal-card mb-3">

            <div className="appeal-card-header">
                <span className="appeal-card-id">APPEAL ID: {appealId}</span>
                <span className={`appeal-status-badge ${statusClass}`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <h5 className="appeal-card-title">{title}</h5>

            {status === "Pending" && (
                <div className="appeal-awaiting-box">
                    <div className="appeal-awaiting-title">Awaiting Review</div>
                    <p className="appeal-awaiting-text">
                        The prefect hasn't responded yet. You'll be notified once a decision is made.
                    </p>
                </div>
            )}

            {status !== "Pending" && (
                <div className="appeal-prefect-box">
                    <div className="appeal-prefect-header">
                        <div className="appeal-prefect-avatar">{prefectInitials}</div>
                        <div>
                            <div className="appeal-prefect-name">{prefectName}</div>
                            <div className="appeal-prefect-role">Prefect of Discipline</div>
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