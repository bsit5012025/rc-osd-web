import "./StatCard.css";

interface StatCardProps {
    icon: string;
    iconColor: string;
    iconBg: string;
    value: number | string;
    label: string;
}

function StatCard({ icon, iconColor, iconBg, value, label }: StatCardProps) {
    return (
        <div className="stat-card">

            <div
                className="stat-icon"
                style={{ backgroundColor: iconBg, color: iconColor }}
            >
                <i className={`bi ${icon}`}></i>
            </div>

            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>

        </div>
    );
}

export default StatCard;