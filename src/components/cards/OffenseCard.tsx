import "./OffenseCard.css";

interface OffenseCardProps {
    offense: string;
    level: string;
    dateFiled: string;
    status: string;
}

const LEVEL_ACCENTS: Record<string, string> = {
    minor: "#4b5bd7",
    major: "#d63232",
    grave: "#7a1f2b",
};

function formatDate(dateString: string): string {
    if (!dateString) return dateString;

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

export default function OffenseCard({
                                        offense,
                                        level,
                                        dateFiled,
                                        status,
                                    }: OffenseCardProps) {

    const accentColor = LEVEL_ACCENTS[level.toLowerCase()] ?? "#94a3b8";

    return (
        <div
            className="offense-card"
            style={{ ["--offense-accent" as string]: accentColor } as React.CSSProperties}
        >

            <div className="offense-header">

                <h4>{offense}</h4>

                <span className={`status-badge ${status.toLowerCase()}`}>
                    {status}
                </span>

            </div>

            <hr className="offense-divider" />

            <div className="offense-details">

                <div>
                    <small className="label">
                        <i className="bi bi-flag"></i>
                        Level
                    </small>

                    <span className={`level-badge ${level.toLowerCase()}`}>
                        {level}
                    </span>
                </div>

                <div>
                    <small className="label">
                        <i className="bi bi-calendar3"></i>
                        Date Filed
                    </small>

                    <p className="offense-date-value">{formatDate(dateFiled)}</p>
                </div>

            </div>

        </div>
    );
}