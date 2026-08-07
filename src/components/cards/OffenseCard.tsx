import "./OffenseCard.css";

interface OffenseCardProps {
    offense: string;
    level: string;
    dateFiled: string;
    status: string;
}

export default function OffenseCard({
    offense,
    level,
    dateFiled,
    status,
}: OffenseCardProps) {

    return (
        <div className="offense-card shadow-sm">

            <div className="offense-header">

                <h4>{offense}</h4>

                <span className={`status-badge ${status.toLowerCase()}`}>
                    {status}
                </span>

            </div>

            <hr />

            <div className="offense-details">

                <div>
                    <small className="label">LEVEL</small>

                    <span className={`level-badge ${level.toLowerCase()}`}>
                        {level}
                    </span>
                </div>

                <div>
                    <small className="label">Date Filed</small>

                    <p>{dateFiled}</p>
                </div>

            </div>

        </div>
    );
}